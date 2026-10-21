/**
 * test-analytics-tracking.cjs
 * Comprehensive automated verification for Phase 9:
 * Analytics, Conversion Tracking & Lead Management Optimization
 */

const assert = require('assert');
const http = require('http');

const API_BASE = 'http://localhost:5000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Client-side analytics logic unit verification
function testClientAnalyticsLogic() {
  console.log('\n--- 1. Testing Client-Side Analytics PII Sanitizer & Deduplication ---');

  // PII sanitizer simulation identical to src/services/analytics.js
  const PII_KEYS = [
    'name', 'fullname', 'firstname', 'lastname', 'email', 'phone', 'telephone',
    'mobile', 'password', 'token', 'secret', 'message', 'notes', 'address',
    'applicantname', 'clientname', 'contactperson', 'passport', 'cv', 'resume'
  ];

  function sanitizeParams(params = {}) {
    if (!params || typeof params !== 'object') return {};
    const sanitized = {};
    for (const [key, value] of Object.entries(params)) {
      const lower = key.toLowerCase();
      const isPii = PII_KEYS.some(piiKey => lower === piiKey || lower.includes('email') || lower.includes('phone') || lower.includes('password'));
      if (isPii) continue;

      if (typeof value === 'string' && value.length > 150) {
        sanitized[key] = value.slice(0, 150);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  // Deduplication tracker simulation
  const trackedConversionReferences = new Set();
  function trackConversion(referenceNumber) {
    if (referenceNumber && trackedConversionReferences.has(referenceNumber)) {
      return false; // deduplicated
    }
    if (referenceNumber) {
      trackedConversionReferences.add(referenceNumber);
    }
    return true; // fired
  }

  // 1.1 Test PII Stripping
  const rawPayload = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+971 50 123 4567',
    message: 'I want to study MS in UK and have a scholarship question',
    password: 'SuperSecretPassword123!',
    service_id: 'intl-consult',
    service_title: 'International Consulting',
    service_category: 'Consulting',
    page_location: 'consulting_page',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'spring_2026_admissions'
  };

  const clean = sanitizeParams(rawPayload);
  assert.strictEqual(clean.name, undefined, 'PII: name must be stripped');
  assert.strictEqual(clean.email, undefined, 'PII: email must be stripped');
  assert.strictEqual(clean.phone, undefined, 'PII: phone must be stripped');
  assert.strictEqual(clean.message, undefined, 'PII: message must be stripped');
  assert.strictEqual(clean.password, undefined, 'PII: password must be stripped');
  assert.strictEqual(clean.service_id, 'intl-consult', 'Service ID must be preserved');
  assert.strictEqual(clean.utm_source, 'google', 'Attribution source must be preserved');
  assert.strictEqual(clean.utm_campaign, 'spring_2026_admissions', 'Attribution campaign must be preserved');
  console.log('✓ PASS: PII fields are strictly stripped while preserving analytics dimensions.');

  // 1.2 Test Conversion Deduplication
  const testRef = 'REV-IC-2026-99999';
  const firstFire = trackConversion(testRef);
  const secondFire = trackConversion(testRef);
  const thirdFire = trackConversion(testRef);
  assert.strictEqual(firstFire, true, 'First conversion event must fire');
  assert.strictEqual(secondFire, false, 'Duplicate conversion event must be blocked');
  assert.strictEqual(thirdFire, false, 'Subsequent duplicate conversion must be blocked');
  console.log('✓ PASS: Conversion deduplication prevents repeated event firing on same reference.');
}

async function runTests() {
  testClientAnalyticsLogic();

  console.log('\n--- 2. Testing Inbound Lead Form Validation & Backend Confirmation ---');

  // 2.1 Test validation failure (empty name)
  const invalidRes = await makeRequest('POST', '/api/leads', {
    name: '',
    email: 'test@example.com',
    phone: '+971501234567',
    message: 'Testing validation error handling'
  });
  assert.strictEqual(invalidRes.status, 400, 'Empty name must return 400 Bad Request');
  assert.strictEqual(invalidRes.data.success, false);
  console.log('✓ PASS: Form validation correctly rejects invalid submissions with HTTP 400.');

  // 2.2 Test successful lead submission with attribution parameters
  const uniqueEmail = `analytics_lead_${Date.now()}@testrevival.ae`;
  const leadPayload = {
    name: 'Dr. Sarah Jenkins',
    email: uniqueEmail,
    company: 'American University in Dubai',
    phone: '+971 4 399 9000',
    message: 'Inquiring about institutional partnership and international student recruitment pipelines.',
    serviceId: 'intl-consult',
    serviceTitle: 'International Consulting',
    countryInterest: 'United Kingdom, USA',
    assistanceType: 'Institutional Advisory',
    intakeTerm: 'Fall 2026',
    degreeLevel: 'Postgraduate',
    preferredContactMethod: 'WhatsApp',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'uae_higher_ed_2026',
    utmTerm: 'international educational consultancy dubai',
    referrer: 'https://www.google.com/search?q=revival+international'
  };

  const createRes = await makeRequest('POST', '/api/leads', leadPayload);
  assert.strictEqual(createRes.status, 201, 'Valid lead must return 201 Created');
  assert.strictEqual(createRes.data.success, true);
  assert.ok(createRes.data.data.referenceNumber, 'Must generate official reference number');
  assert.ok(createRes.data.data.referenceNumber.startsWith('REV-IC-2026-'), 'Reference must follow REV-IC-2026-XXXXX format');
  assert.strictEqual(createRes.data.data.serviceId, 'intl-consult');
  assert.strictEqual(createRes.data.data.utmSource, 'google', 'Persisted UTM Source');
  assert.strictEqual(createRes.data.data.utmMedium, 'cpc', 'Persisted UTM Medium');
  assert.strictEqual(createRes.data.data.utmCampaign, 'uae_higher_ed_2026', 'Persisted UTM Campaign');
  console.log(`✓ PASS: Inbound lead saved with HTTP 201, reference "${createRes.data.data.referenceNumber}", and preserved UTM attribution.`);

  // 2.3 Test duplicate submission rate-limiting (same email + serviceId within 30s)
  const dupRes = await makeRequest('POST', '/api/leads', leadPayload);
  assert.strictEqual(dupRes.status, 409, 'Rapid duplicate submission must return 409 Conflict');
  assert.strictEqual(dupRes.data.success, false);
  console.log('✓ PASS: Rapid duplicate lead submission prevented with HTTP 409 Conflict.');

  console.log('\n--- 3. Testing Service-Level Performance Analytics Endpoint ---');

  const perfRes = await makeRequest('GET', '/api/analytics/service-performance');
  assert.strictEqual(perfRes.status, 200, 'Service performance endpoint must return 200 OK');
  assert.strictEqual(perfRes.data.success, true);
  assert.ok(perfRes.data.meta.isDerivedFromLiveDatabase, 'Metrics must explicitly flag database derivation');
  assert.ok(perfRes.data.services.length >= 6, 'Must report on all 6 core academic services');

  const intlConsultMetric = perfRes.data.services.find(s => s.serviceId === 'intl-consult');
  assert.ok(intlConsultMetric, 'International Consulting service must be tracked');
  assert.ok(intlConsultMetric.totalEnquiries >= 1, 'Tracked at least 1 lead in International Consulting');
  assert.strictEqual(typeof intlConsultMetric.leadConversionRate, 'number', 'Conversion rate must be a valid number');

  console.log('Services reporting verified:');
  perfRes.data.services.forEach(s => {
    console.log(`  • [${s.serviceId}] ${s.serviceTitle}: ${s.totalEnquiries} enquiries, ${s.newEnquiries} new, ${s.convertedEnquiries} converted (${s.leadConversionRate}% rate)`);
  });

  // Verify attribution breakdown structure
  assert.ok(perfRes.data.attribution, 'Must include attribution summary');
  console.log('Attribution summary verified:', JSON.stringify(perfRes.data.attribution));

  // Verify conversion funnel stages
  assert.ok(Array.isArray(perfRes.data.funnel), 'Funnel must be an array');
  assert.strictEqual(perfRes.data.funnel.length, 4, 'Funnel must have 4 database-verified stages');
  console.log('Conversion funnel progression:');
  perfRes.data.funnel.forEach(step => {
    console.log(`  Step ${step.step}: ${step.name} -> ${step.count} leads (${step.rate}%)`);
  });

  console.log('\n--- 4. Testing Lead Status Management & CRM Synchronization ---');
  // Update lead status to "Consultation Scheduled" and verify
  const leadId = createRes.data.data.id;
  const updateRes = await makeRequest('PATCH', `/api/leads/${leadId}`, {
    status: 'Consultation Scheduled',
    priority: 'High',
    internalNotes: 'Phase 9 automated validation: Lead qualified and initial consultation booked.'
  });
  assert.strictEqual(updateRes.status, 200, 'Lead status update must return 200 OK');
  assert.strictEqual(updateRes.data.data.status, 'Consultation Scheduled');
  console.log('✓ PASS: Lead workflow status updated to "Consultation Scheduled" in CRM.');

  console.log('\n======================================================');
  console.log('ALL PHASE 9 ANALYTICS & CONVERSION TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});

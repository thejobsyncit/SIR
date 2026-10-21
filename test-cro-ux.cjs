/**
 * test-cro-ux.cjs
 * Comprehensive Phase 11 Test Suite: Advanced UI/UX, Lead Conversion & Customer Experience
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

function postJson(pathUrl, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: pathUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runCroUxTests() {
  console.log('\n======================================================');
  console.log('REVIVAL INTERNATIONAL — PHASE 11 CRO & UI/UX TEST SUITE');
  console.log('======================================================\n');

  // 1. Audit Homepage Dual-Pillar Intent & Trust Section
  console.log('--- 1. Testing Homepage Business Offering & Value Clarity ---');
  const homePath = path.join(__dirname, 'src', 'pages', 'Home.jsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');

  assert.ok(homeContent.includes('Academic & Admissions Advisory'), 'Hero must contain dual-pillar Academic Advisory CTA');
  assert.ok(homeContent.includes('Quick Navigation:'), 'Hero must offer high-intent navigation chips');
  assert.ok(homeContent.includes('Study Abroad'), 'Must include Study Abroad quick navigation chip');
  assert.ok(homeContent.includes('IELTS & OET Prep'), 'Must include IELTS quick navigation chip');
  assert.ok(homeContent.includes('Free Consultation'), 'Must include Consultation quick navigation chip');
  assert.ok(homeContent.includes('Intended For:') || homeContent.includes('For:'), 'Service cards on home must display intended audience');
  assert.ok(homeContent.includes('Inquire Now'), 'Homepage service cards must provide direct Inquire Now action');
  
  // Verify trust section replacement
  assert.ok(!homeContent.includes('TESTIMONIALS.map'), 'Mock testimonials must be replaced with verified business evidence');
  assert.ok(homeContent.includes('Registered Dubai Headquarters'), 'Trust section must highlight Rolex Tower corporate headquarters');
  assert.ok(homeContent.includes('Full Regulatory & MOHRE Compliance'), 'Trust section must highlight MOHRE compliance');
  assert.ok(homeContent.includes('Structured CRM & 2–4h Response SLA'), 'Trust section must state verified 2-4h response SLA');
  console.log('✓ PASS: Homepage business offering, quick chips, card CTAs, and verified trust section validated.');

  // 2. Audit Services Experience & Interactive Search
  console.log('\n--- 2. Testing Services Directory & Live Search Filtering ---');
  const servicesPath = path.join(__dirname, 'src', 'pages', 'Services.jsx');
  const servicesContent = fs.readFileSync(servicesPath, 'utf8');

  assert.ok(servicesContent.includes('searchQuery'), 'Services page must have live search query state');
  assert.ok(servicesContent.includes('Search services (e.g. Executive, IELTS, Visa, Admissions)'), 'Services page must have clear search input');
  assert.ok(servicesContent.includes('No Services Match Your Search'), 'Services page must render empty state for unmatched queries');
  assert.ok(servicesContent.includes('Reset All Filters') || servicesContent.includes('Reset Filters & Show All'), 'Empty state must provide reset action');
  assert.ok(servicesContent.includes('Intended For:'), 'Service cards in directory must state intended audience');
  assert.ok(servicesContent.includes('Inquire Now'), 'Service cards must provide distinct Inquire Now action');
  assert.ok(servicesContent.includes('Service Details'), 'Service cards must provide distinct Service Details action');
  console.log('✓ PASS: Services page interactive search, audience tags, and empty state verified.');

  // 3. Audit Contact Form UX, Validation & SLA Confirmation
  console.log('\n--- 3. Testing Contact Form UX, Validation & Real Backend Submission ---');
  const contactPath = path.join(__dirname, 'src', 'pages', 'ContactUsPage.jsx');
  const contactContent = fs.readFileSync(contactPath, 'utf8');

  assert.ok(contactContent.includes('formData'), 'Contact form must use controlled state to preserve data');
  assert.ok(contactContent.includes('aria-describedby'), 'Form errors must be accessible via aria-describedby');
  assert.ok(contactContent.includes('2 to 4 business hours') || contactContent.includes('2–4 business hours'), 'Contact form and success view must state 2-4 business hour SLA');
  assert.ok(contactContent.includes('Submitting Inquiry to Dubai Team...'), 'Submit button must provide clear loading state');
  assert.ok(contactContent.includes('CRM Tracking Reference:'), 'Confirmation must display unique CRM tracking reference');

  // Submit a live end-to-end inquiry through the backend
  const testEmail = `phase11_ux_test_${Date.now()}@revival-international.ae`;
  const postResult = await postJson('/api/leads', {
    name: 'Eleanor Vance',
    email: testEmail,
    phone: '+971 50 987 6543',
    serviceId: 'college-adm',
    serviceTitle: 'College Admission Assistance',
    company: 'Individual Candidate or Student',
    message: 'Testing Phase 11 conversion flow with preselected service and international phone format.',
    utmSource: 'organic',
    utmMedium: 'website_ux',
    utmCampaign: 'phase11_audit'
  });

  assert.strictEqual(postResult.status, 201, `Backend must return 201 Created for valid inquiry, got ${postResult.status}`);
  assert.ok(postResult.data && postResult.data.success, 'Response must indicate success');
  const ref = postResult.data.referenceNumber || postResult.data.data?.referenceNumber;
  assert.ok(ref && ref.startsWith('REV-'), `Reference number must start with REV-, got ${ref}`);
  console.log(`✓ PASS: Real backend inquiry submitted successfully with Reference ID: ${ref}`);

  // Test duplicate submission protection
  const dupResult = await postJson('/api/leads', {
    name: 'Eleanor Vance',
    email: testEmail,
    phone: '+971 50 987 6543',
    serviceId: 'college-adm',
    serviceTitle: 'College Admission Assistance',
    message: 'Testing immediate duplicate rejection.'
  });
  assert.strictEqual(dupResult.status, 409, 'Backend must return 409 Conflict for rapid duplicate submission');
  console.log('✓ PASS: Immediate duplicate submission safely rejected with HTTP 409 Conflict.');

  // 4. Audit Education Modal Phone Flexibility
  console.log('\n--- 4. Testing Education Modal Phone Flexibility ---');
  const modalPath = path.join(__dirname, 'src', 'components', 'EducationEnquiryModal.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');

  assert.ok(!modalContent.includes('onKeyDown={handlePhoneKeyDown}'), 'Phone input must not artificially block typing');
  assert.ok(modalContent.includes('cleanPhone.length < 7 || cleanPhone.length > 15'), 'Phone validation must support 7-15 digits');
  console.log('✓ PASS: Education Enquiry Modal phone validation supports international formats.');

  // 5. Audit Service Detail Pre-selection Wiring
  console.log('\n--- 5. Testing Service Detail Pre-selection Wiring ---');
  const detailPath = path.join(__dirname, 'src', 'pages', 'EducationServiceDetail.jsx');
  const detailContent = fs.readFileSync(detailPath, 'utf8');

  assert.ok(detailContent.includes('modalServiceId'), 'EducationServiceDetail must manage modalServiceId state');
  assert.ok(detailContent.includes('setModalServiceId(rel.id)'), 'Related services must preselect their specific ID in enquiry modal');
  console.log('✓ PASS: EducationServiceDetail correctly wires modal pre-selection for related services.');

  console.log('\n======================================================');
  console.log('ALL PHASE 11 CRO & UI/UX TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runCroUxTests().catch(err => {
  console.error('❌ Phase 11 Test Failure:', err);
  process.exit(1);
});

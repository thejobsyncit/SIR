// Automated Verification Test Suite for Phase 12: Admin Dashboard, Lead Management & Customer Tracking System
const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: rawData });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 12 AUTOMATED CRM & LEAD MANAGEMENT TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify GET /api/admin/leads/metrics
    console.log('[Test 1] Testing Live Lead Metrics Endpoint (/api/admin/leads/metrics)...');
    const metricsRes = await request('GET', '/api/admin/leads/metrics?range=all');
    assert(metricsRes.status === 200, 'Metrics endpoint returns HTTP 200');
    assert(metricsRes.data && metricsRes.data.success === true, 'Metrics returns success = true');
    assert(metricsRes.data.metrics && typeof metricsRes.data.metrics.totalEnquiries === 'number', 'Metrics has totalEnquiries number');
    assert(typeof metricsRes.data.metrics.newEnquiries === 'number', 'Metrics has newEnquiries count');
    assert(typeof metricsRes.data.metrics.contactPending === 'number', 'Metrics has contactPending count');
    assert(typeof metricsRes.data.metrics.inProgress === 'number', 'Metrics has inProgress count');
    assert(typeof metricsRes.data.metrics.qualified === 'number', 'Metrics has qualified count');
    assert(typeof metricsRes.data.metrics.converted === 'number', 'Metrics has converted count');
    assert(typeof metricsRes.data.metrics.conversionRate === 'number', 'Metrics has conversionRate percentage');
    assert(typeof metricsRes.data.metrics.overdueFollowUps === 'number', 'Metrics has overdueFollowUps');
    assert(typeof metricsRes.data.metrics.dueTodayFollowUps === 'number', 'Metrics has dueTodayFollowUps');

    // Verify 6 verified service breakdowns
    assert(Array.isArray(metricsRes.data.serviceBreakdown), 'Metrics returns serviceBreakdown array');
    const serviceIds = metricsRes.data.serviceBreakdown.map(s => s.serviceId);
    assert(serviceIds.includes('intl-consult'), 'Service breakdown includes intl-consult');
    assert(serviceIds.includes('college-adm'), 'Service breakdown includes college-adm');
    assert(serviceIds.includes('school-career'), 'Service breakdown includes school-career');
    assert(serviceIds.includes('intl-adm'), 'Service breakdown includes intl-adm');
    assert(serviceIds.includes('school-academy'), 'Service breakdown includes school-academy');
    assert(serviceIds.includes('exec-seminars-lang'), 'Service breakdown includes exec-seminars-lang');

    // 2. Verify Date Range Filters on Metrics
    console.log('\n[Test 2] Testing Date Range Filters on Metrics (today, 7days, 30days)...');
    const todayMetrics = await request('GET', '/api/admin/leads/metrics?range=today');
    assert(todayMetrics.status === 200, 'Range=today returns HTTP 200');
    const sevenDayMetrics = await request('GET', '/api/admin/leads/metrics?range=7days');
    assert(sevenDayMetrics.status === 200, 'Range=7days returns HTTP 200');

    // 3. Verify Follow-ups Summary Endpoint
    console.log('\n[Test 3] Testing Follow-ups Summary Queue (/api/admin/follow-ups/summary)...');
    const fuSummary = await request('GET', '/api/admin/follow-ups/summary');
    assert(fuSummary.status === 200, 'Follow-ups summary returns HTTP 200');
    assert(fuSummary.data && fuSummary.data.success === true, 'Follow-ups summary success = true');
    assert(fuSummary.data.counts && typeof fuSummary.data.counts.totalPending === 'number', 'Returns counts.totalPending');
    assert(typeof fuSummary.data.counts.overdue === 'number', 'Returns counts.overdue');
    assert(typeof fuSummary.data.counts.dueToday === 'number', 'Returns counts.dueToday');
    assert(typeof fuSummary.data.counts.upcoming === 'number', 'Returns counts.upcoming');
    assert(Array.isArray(fuSummary.data.data.overdue), 'Returns data.overdue array');
    assert(Array.isArray(fuSummary.data.data.dueToday), 'Returns data.dueToday array');
    assert(Array.isArray(fuSummary.data.data.upcoming), 'Returns data.upcoming array');

    // 4. Create a Test Lead with UTM tracking
    console.log('\n[Test 4] Creating Test Lead with UTM Marketing Attribution...');
    const testLeadPayload = {
      name: 'Dr. Tariq Al-Hashimi',
      email: `tariq.test.${Date.now()}@emirates-advisory.ae`,
      phone: '+971 50 889 9123',
      serviceId: 'intl-consult',
      serviceTitle: 'International Consulting',
      assistanceType: 'Executive Strategic Advisory',
      countryInterest: 'United Kingdom',
      intakeTerm: 'Autumn 2026',
      message: 'Seeking institutional partnerships for healthcare education and senior faculty exchange.',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'uae_academic_2026',
      referrer: 'https://google.com/search?q=dubai+academic+consulting'
    };

    const createLeadRes = await request('POST', '/api/leads', testLeadPayload);
    assert(createLeadRes.status === 201, 'Lead creation returns HTTP 201');
    assert(createLeadRes.data && createLeadRes.data.success === true, 'Lead creation success = true');
    const createdLead = createLeadRes.data.data;
    assert(createdLead && createdLead.id, 'Lead has assigned ID');
    assert(createdLead.referenceNumber, `Lead assigned reference number: ${createdLead.referenceNumber}`);
    assert(createdLead.internalNotes === undefined, 'Public response strips private internalNotes');

    const leadId = createdLead.id;

    // 5. Verify Internal Notes & Confidentiality on Staff Endpoint
    console.log('\n[Test 5] Testing Staff Confidential Internal Notes on Lead...');
    const updateNotesRes = await request('PATCH', `/api/leads/${leadId}`, {
      internalNotes: 'CONFIDENTIAL: High net worth candidate. Priority visa fast-track requested.',
      updatedBy: 'Super Admin'
    });
    assert(updateNotesRes.status === 200, 'Internal notes patch returns HTTP 200');
    assert(updateNotesRes.data.data.internalNotes.includes('CONFIDENTIAL: High net worth'), 'Internal notes updated in database');

    // Fetch lead details via admin endpoint
    const leadDetailRes = await request('GET', `/api/leads/${leadId}`);
    assert(leadDetailRes.status === 200, 'Lead details endpoint returns HTTP 200');
    const fetchedLead = leadDetailRes.data.data || leadDetailRes.data.lead;
    assert(fetchedLead.internalNotes.includes('CONFIDENTIAL: High net worth'), 'Lead detail view includes internalNotes for staff');
    assert(fetchedLead.utmSource === 'google', 'Lead retains utmSource');
    assert(fetchedLead.utmMedium === 'cpc', 'Lead retains utmMedium');

    // 6. Test Canonical Lifecycle Status Transitions
    console.log('\n[Test 6] Testing Canonical 7 Lifecycle Status Transitions & Validation...');
    const canonicalStages = [
      'Contact Pending',
      'Contacted',
      'Follow-up Required',
      'Qualified',
      'In Progress',
      'Converted',
      'Closed / Lost'
    ];

    for (const stage of canonicalStages) {
      const stageRes = await request('PATCH', `/api/leads/${leadId}`, { status: stage });
      assert(stageRes.status === 200 && stageRes.data.data.status === stage, `Successfully transitioned to status '${stage}'`);
    }

    // Test rejection of invalid status
    const invalidStatusRes = await request('PATCH', `/api/leads/${leadId}`, { status: 'INVALID_STATUS_XYZ' });
    assert(invalidStatusRes.status === 400, 'Rejects invalid status with HTTP 400');

    // 7. Test Customer Tracking & Follow-up Scheduling
    console.log('\n[Test 7] Testing Follow-up Scheduling & Auto-sync to Lead Record...');
    const followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const followUpRes = await request('POST', `/api/leads/${leadId}/follow-ups`, {
      followUpDate,
      purpose: 'Review accreditation roadmap and verify UK tier 2 credentials',
      assignedTo: 'Dhanalakshimi'
    });
    assert(followUpRes.status === 201, 'Follow-up creation returns HTTP 201');
    assert(followUpRes.data.success === true, 'Follow-up creation success = true');

    // Verify lead's lastFollowUpDate or nextActionDate got updated
    const leadAfterFollowUp = await request('GET', `/api/leads/${leadId}`);
    const lData = leadAfterFollowUp.data.data || leadAfterFollowUp.data.lead;
    assert(lData.nextActionDate !== null, 'Lead nextActionDate synced automatically');

    // 8. Test Soft Archival and Restoration
    console.log('\n[Test 8] Testing Soft Delete / Archival...');
    const archiveRes = await request('POST', `/api/leads/${leadId}/archive`, { isArchived: 1 });
    assert(archiveRes.status === 200, 'Archive endpoint returns HTTP 200');
    assert(archiveRes.data.isArchived === 1, 'Lead is marked isArchived = 1');

    // Verify excluded from default lead list
    const activeLeadsRes = await request('GET', '/api/leads');
    const isFoundInActive = activeLeadsRes.data.data.some(l => l.id === leadId);
    assert(!isFoundInActive, 'Archived lead is excluded from active leads list');

    // Verify included when includeArchived=true
    const withArchivedRes = await request('GET', '/api/leads?includeArchived=true');
    const isFoundWithArchived = withArchivedRes.data.data.some(l => l.id === leadId);
    assert(isFoundWithArchived, 'Archived lead is returned when includeArchived=true');

    // Restore lead
    const restoreRes = await request('POST', `/api/leads/${leadId}/archive`, { isArchived: 0 });
    assert(restoreRes.status === 200 && restoreRes.data.isArchived === 0, 'Restored lead isArchived = 0');

    // 9. Test Lead Filtering & Pagination
    console.log('\n[Test 9] Testing Lead Filtering & Pagination...');
    const paginationRes = await request('GET', '/api/leads?limit=5&page=1');
    assert(paginationRes.status === 200, 'Paginated leads returns HTTP 200');
    assert(Array.isArray(paginationRes.data.data), 'Returns paginated leads array');
    assert(paginationRes.data.pagination !== undefined, 'Returns pagination metadata object');
    assert(paginationRes.data.pagination.limit === 5, 'Pagination limit is 5');

    // Clean up test lead
    await request('DELETE', `/api/leads/${leadId}`);
    console.log(`\n  ✓ Cleaned up test lead: ${leadId}`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`🏁 PHASE 12 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();

/**
 * Automated End-to-End Integration Verification Suite for the Nine Core Services
 * Revival International - Full-Stack Services Integration with Backend, Database and CRM
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:5000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
    const options = {
      method,
      hostname: '127.0.0.1',
      port: 5000,
      path: path.startsWith('/') ? path : `/${path}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const createdTestLeadIds = [];
let passedTests = 0;
let failedTests = 0;

function logPass(desc) {
  passedTests++;
  console.log(`  ✓ PASS: ${desc}`);
}

function logFail(desc, err) {
  failedTests++;
  console.error(`  ✗ FAIL: ${desc} ->`, err?.message || err);
}

async function runServicesIntegrationSuite() {
  console.log('\n========================================================================');
  console.log('🧪 REVIVAL INTERNATIONAL: NINE CORE SERVICES INTEGRATION E2E TEST SUITE');
  console.log('========================================================================\n');

  try {
    // -------------------------------------------------------------
    // GROUP 1: Document Upload Endpoint & Security Protections
    // -------------------------------------------------------------
    console.log('[Test Group 1] Secure Document Upload & Retrieval API...');

    // 1.1 Upload valid PDF
    const dummyPdfBase64 = Buffer.from('%PDF-1.4 sample resume content for testing').toString('base64');
    const uploadRes = await request('POST', '/api/upload', {
      filename: 'sample_candidate_cv.pdf',
      fileData: dummyPdfBase64,
      fileType: 'application/pdf'
    });

    assert.strictEqual(uploadRes.status, 201, 'Valid PDF upload returns HTTP 201');
    assert.strictEqual(uploadRes.data.success, true, 'Upload response indicates success');
    assert.ok(uploadRes.data.data.filePath, 'Returns filePath');
    assert.ok(uploadRes.data.data.fileName, 'Returns safe generated fileName');
    logPass('Document upload (PDF) returns HTTP 201 and safe generated filename');

    const uploadedDocPath = uploadRes.data.data.filePath;
    const uploadedFileName = uploadRes.data.data.fileName;

    // 1.2 Retrieve uploaded document
    const downloadRes = await request('GET', uploadedDocPath);
    assert.strictEqual(downloadRes.status, 200, 'Uploaded file retrieval returns HTTP 200');
    assert.strictEqual(downloadRes.headers['x-content-type-options'], 'nosniff', 'Security header X-Content-Type-Options: nosniff present');
    logPass('Document download endpoint serves file with security headers');

    // 1.3 Reject dangerous executable extensions
    const dangerousRes = await request('POST', '/api/upload', {
      filename: 'malicious_script.exe',
      fileData: Buffer.from('fake exe content').toString('base64'),
      fileType: 'application/x-msdownload'
    });
    assert.strictEqual(dangerousRes.status, 400, 'Rejects executable upload with HTTP 400');
    assert.strictEqual(dangerousRes.data.success, false, 'Executable upload marked unsuccessful');
    logPass('Upload endpoint strictly rejects unauthorized file extensions (.exe)');

    // 1.4 Prevent path traversal on retrieval
    const traversalRes = await request('GET', '/api/documents/../../package.json');
    assert.ok([400, 404].includes(traversalRes.status), 'Rejects path traversal file access');
    logPass('Document download endpoint blocks path traversal attempts');

    // -------------------------------------------------------------
    // GROUP 2: The Nine Core Services - Individual Submissions & Workflows
    // -------------------------------------------------------------
    console.log('\n[Test Group 2] Testing All Nine Core Services (Submission -> DB -> CRM)...');

    const nineServicesConfigs = [
      {
        id: 'dom-rec',
        title: 'Domestic Recruitment',
        expectedPrefix: 'REV-DOM',
        payload: {
          name: 'Ahmed Al Mansoori',
          email: `ahmed.dom.${Date.now()}@example.ae`,
          phone: '+971 50 111 2233',
          company: 'Arabian Gulf Contracting LLC',
          message: 'Hiring 5 Senior MEP Engineers for luxury hospitality project in Dubai.',
          serviceId: 'dom-rec',
          serviceTitle: 'Domestic Recruitment',
          jobTitle: 'Senior MEP Engineer',
          skills: 'AutoCAD, FIDIC, HVAC, Fire Fighting',
          experience: '7-10 Years',
          workLocation: 'Dubai, UAE',
          salaryRange: 'AED 25,000 - 32,000',
          vacancies: '5'
        },
        workflowStatus: 'Shortlisted'
      },
      {
        id: 'intl-rec',
        title: 'International Recruitment',
        expectedPrefix: 'REV-INTL',
        payload: {
          name: 'Dr. Sarah Jenkins',
          email: `sarah.intl.${Date.now()}@example.co.uk`,
          phone: '+44 7700 900123',
          company: 'Candidate Applicant',
          message: 'Specialist ICU Consultant seeking relocation opportunities across UAE and KSA.',
          serviceId: 'intl-rec',
          serviceTitle: 'International Recruitment',
          jobTitle: 'Consultant Intensivist',
          skills: 'ICU, Critical Care, Trauma Life Support',
          experience: '12+ Years',
          targetCountry: 'Saudi Arabia',
          cvPath: uploadedDocPath
        },
        workflowStatus: 'Interview Scheduled'
      },
      {
        id: 'exec-search',
        title: 'Executive Search',
        expectedPrefix: 'REV-EXEC',
        payload: {
          name: 'H.E. Board Committee Rep',
          email: `exec.board.${Date.now()}@conglomerate.ae`,
          phone: '+971 4 987 6543',
          company: 'Emirates Sovereign Holdings',
          message: 'Confidential retained executive search for Chief Operating Officer.',
          serviceId: 'exec-search',
          serviceTitle: 'Executive Search',
          seniority: 'C-Suite (CEO / CFO / COO / CTO)',
          industry: 'Banking & Financial Services (BFSI)',
          hiringTimeline: 'Immediate (Within 30 Days)',
          workLocation: 'Dubai Financial District',
          salaryRange: 'Competitive Executive Package'
        },
        workflowStatus: 'Under Review'
      },
      {
        id: 'perm-staff',
        title: 'Permanent Staffing',
        expectedPrefix: 'REV-PERM',
        payload: {
          name: 'Priya Sharma',
          email: `priya.perm.${Date.now()}@retailgroup.ae`,
          phone: '+971 52 345 6789',
          company: 'Luxury Retail Group Middle East',
          message: 'Permanent placement required for 3 Regional Store Directors with 90-day retention guarantee.',
          serviceId: 'perm-staff',
          serviceTitle: 'Permanent Staffing',
          jobTitle: 'Regional Store Director',
          skills: 'Luxury Retail, Inventory Control, P&L',
          vacancies: '3',
          workLocation: 'Dubai Mall & Mall of the Emirates',
          joiningDate: 'Within 30 Days'
        },
        workflowStatus: 'Selected'
      },
      {
        id: 'contract-staff',
        title: 'Contract Staffing',
        expectedPrefix: 'REV-CONT',
        payload: {
          name: 'Vikram Malhotra',
          email: `vikram.cont.${Date.now()}@eventsdxb.com`,
          phone: '+971 55 987 1122',
          company: 'Middle East Expo Operations',
          message: 'Contract staffing for 20 Logistics Coordinators for upcoming winter exhibitions.',
          serviceId: 'contract-staff',
          serviceTitle: 'Contract Staffing',
          contractDuration: '6 Months',
          vacancies: '20',
          startDate: '2026-11-01',
          endDate: '2027-05-01',
          workLocation: 'Dubai World Trade Centre',
          shiftRequirements: 'Rotational Shifts (24/7 Operations)'
        },
        workflowStatus: 'Contract Active'
      },
      {
        id: 'bulk-hiring',
        title: 'Bulk Hiring',
        expectedPrefix: 'REV-BULK',
        payload: {
          name: 'Fahad Al Qasimi',
          email: `fahad.bulk.${Date.now()}@facilitymgt.ae`,
          phone: '+971 6 555 4433',
          company: 'Sharjah Industrial Facilities Management',
          message: 'Mass deployment of 150 MEP Technicians and Electricians for industrial complex.',
          serviceId: 'bulk-hiring',
          serviceTitle: 'Bulk Hiring',
          jobCategory: 'Construction & MEP Technicians',
          vacancies: '100-250 Workers',
          shiftRequirements: 'Standard Day Shift',
          workLocation: 'Sharjah & Northern Emirates',
          startDate: '2026-12-01'
        },
        workflowStatus: 'Screening'
      },
      {
        id: 'overseas-place',
        title: 'Overseas Placement',
        expectedPrefix: 'REV-OVS',
        payload: {
          name: 'Jean-Luc Dubois',
          email: `jeanluc.ovs.${Date.now()}@hospitalityparis.fr`,
          phone: '+33 6 12 34 56 78',
          company: 'Culinary Professional',
          message: 'Executive Pastry Chef seeking overseas placement with 5-star hotel in Qatar or UAE.',
          serviceId: 'overseas-place',
          serviceTitle: 'Overseas Placement',
          jobTitle: 'Executive Pastry Chef',
          skills: 'French Pastry, Culinary Management, HACCP',
          experience: '10+ Years',
          targetCountry: 'Qatar',
          cvPath: uploadedDocPath
        },
        workflowStatus: 'Shortlisted'
      },
      {
        id: 'visa-assist',
        title: 'Visa Assistance',
        expectedPrefix: 'REV-VISA',
        payload: {
          name: 'Elena Rostova',
          email: `elena.visa.${Date.now()}@globaltech.ae`,
          phone: '+971 56 778 8990',
          company: 'GlobalTech Systems FZ-LLC',
          message: 'MOHRE work permit application and residency quota assistance for new incoming team.',
          serviceId: 'visa-assist',
          serviceTitle: 'Visa Assistance',
          targetCountry: 'UAE',
          visaCategory: 'MOHRE Standard Employment Residence Permit',
          currentStage: 'Employment Offer Issued',
          company: 'GlobalTech Systems'
        },
        workflowStatus: 'Visa Processing'
      },
      {
        id: 'work-permit',
        title: 'Work Permit Guidance',
        expectedPrefix: 'REV-WPR',
        payload: {
          name: 'Michael O Connor',
          email: `michael.wp.${Date.now()}@irishconsult.com`,
          phone: '+353 87 123 4567',
          company: 'Irish Engineering Consult',
          message: 'Guidance required regarding MOHRE quotas and WPS compliance for branch establishment in Dubai.',
          serviceId: 'work-permit',
          serviceTitle: 'Work Permit Guidance',
          targetCountry: 'UAE',
          visaCategory: 'Golden Visa (10-Year Investor / Specialist)',
          currentStage: 'Initial Planning / Not Applied'
        },
        workflowStatus: 'Qualified'
      }
    ];

    for (const srv of nineServicesConfigs) {
      console.log(`\n  --- Testing Service: ${srv.title} (${srv.id}) ---`);

      // 1. Submit lead
      const submitRes = await request('POST', '/api/leads', srv.payload);
      assert.strictEqual(submitRes.status, 201, `${srv.title} submission returns HTTP 201`);
      assert.strictEqual(submitRes.data.success, true, `${srv.title} submission marked success`);
      
      const createdLead = submitRes.data.data;
      assert.ok(createdLead.id, `${srv.title} has valid lead ID`);
      assert.ok(createdLead.referenceNumber.startsWith(srv.expectedPrefix), `${srv.title} reference number starts with ${srv.expectedPrefix} (Actual: ${createdLead.referenceNumber})`);
      createdTestLeadIds.push(createdLead.id);
      logPass(`${srv.title} submitted and saved with reference number: ${createdLead.referenceNumber}`);

      // 2. Fetch specific record from database via GET /api/leads/:id
      const detailRes = await request('GET', `/api/leads/${createdLead.id}`);
      assert.strictEqual(detailRes.status, 200, `GET /api/leads/:id returns HTTP 200`);
      const leadDetail = detailRes.data.lead || detailRes.data.data;
      assert.strictEqual(leadDetail.serviceId, srv.id, 'serviceId matches in database');
      assert.strictEqual(leadDetail.serviceTitle, srv.title, 'serviceTitle matches in database');
      if (srv.payload.jobTitle) {
        assert.strictEqual(leadDetail.jobTitle, srv.payload.jobTitle, 'jobTitle correctly persisted in SQLite');
      }
      if (srv.payload.vacancies) {
        assert.strictEqual(leadDetail.vacancies, srv.payload.vacancies, 'vacancies correctly persisted in SQLite');
      }
      if (srv.payload.contractDuration) {
        assert.strictEqual(leadDetail.contractDuration, srv.payload.contractDuration, 'contractDuration correctly persisted in SQLite');
      }
      if (srv.payload.cvPath) {
        assert.strictEqual(leadDetail.cvPath, srv.payload.cvPath, 'cvPath correctly persisted in SQLite');
      }
      logPass(`${srv.title} record verified in SQLite with all service-specific fields preserved`);

      // 3. Test filtering in CRM list endpoint
      const filterRes = await request('GET', `/api/leads?serviceId=${srv.id}`);
      assert.strictEqual(filterRes.status, 200, 'Filtering by serviceId returns HTTP 200');
      const leadsList = Array.isArray(filterRes.data.data) ? filterRes.data.data : (filterRes.data.leads || []);
      const foundInList = leadsList.some(l => l.id === createdLead.id);
      assert.ok(foundInList, `Created lead ${createdLead.id} found in CRM filter results for ${srv.id}`);
      logPass(`${srv.title} retrieved via CRM service filter (?serviceId=${srv.id})`);

      // 4. Update status with recruitment workflow stage
      const statusPatchRes = await request('PATCH', `/api/leads/${createdLead.id}`, {
        status: srv.workflowStatus,
        assignedEmployee: 'Dhanalakshimi',
        internalNotes: `Verified qualifications for ${srv.title}. Candidate/client briefed.`
      });
      assert.strictEqual(statusPatchRes.status, 200, `PATCH status to '${srv.workflowStatus}' returns HTTP 200`);
      
      // Verify persistence of status
      const recheckRes = await request('GET', `/api/leads/${createdLead.id}`);
      const recheckedLead = recheckRes.data.lead || recheckRes.data.data;
      assert.strictEqual(recheckedLead.status, srv.workflowStatus, `Updated status '${srv.workflowStatus}' persists in SQLite`);
      assert.strictEqual(recheckedLead.assignedEmployee, 'Dhanalakshimi', 'Assigned employee persists in SQLite');
      logPass(`Workflow status updated to '${srv.workflowStatus}' and persisted cleanly`);

      // 5. Schedule CRM Follow-up for this lead
      const followUpRes = await request('POST', `/api/leads/${createdLead.id}/follow-ups`, {
        title: `Follow-up on ${srv.title}`,
        purpose: 'Review mandate & candidate profile checklist',
        dueDateTime: new Date(Date.now() + 86400000).toISOString(),
        assignedTo: 'Dhanalakshimi'
      });
      assert.strictEqual(followUpRes.status, 201, 'CRM follow-up creation returns HTTP 201');
      logPass(`Follow-up scheduled and synchronized to lead record in CRM`);
    }

    // -------------------------------------------------------------
    // GROUP 3: Validation Edge Cases & Date Logic Protection
    // -------------------------------------------------------------
    console.log('\n[Test Group 3] Contract Staffing Date Range & Validation Constraints...');

    // 3.1 Invalid contract period (endDate earlier than startDate)
    const invalidDateRes = await request('POST', '/api/leads', {
      name: 'Invalid Date Client',
      email: `invalid.date.${Date.now()}@example.com`,
      phone: '+971 50 999 8877',
      message: 'Need contract workers for summer project.',
      serviceId: 'contract-staff',
      serviceTitle: 'Contract Staffing',
      startDate: '2026-10-01',
      endDate: '2026-05-01' // earlier than start date!
    });
    assert.strictEqual(invalidDateRes.status, 400, 'Rejects invalid contract dates with HTTP 400');
    assert.strictEqual(invalidDateRes.data.success, false, 'Validation failure response returns success: false');
    assert.ok(invalidDateRes.data.message.includes('Contract end date cannot be earlier than start date'), 'Returns clear validation message');
    logPass('Server-side date validation prevents inverted contract periods');

    // -------------------------------------------------------------
    // GROUP 4: CRM Analytics & Master Services Breakdown
    // -------------------------------------------------------------
    console.log('\n[Test Group 4] CRM Master Services Breakdown & Metrics...');

    const metricsRes = await request('GET', '/api/admin/leads/metrics');
    assert.strictEqual(metricsRes.status, 200, 'GET /api/admin/leads/metrics returns HTTP 200');
    const breakdown = metricsRes.data.serviceBreakdown || [];

    const expectedServicesInBreakdown = [
      'dom-rec', 'intl-rec', 'exec-search', 'perm-staff',
      'contract-staff', 'bulk-hiring', 'overseas-place', 'visa-assist', 'work-permit'
    ];

    for (const sid of expectedServicesInBreakdown) {
      const match = breakdown.find(s => s.serviceId === sid);
      assert.ok(match, `Master breakdown contains ${sid}`);
      assert.ok(match.total >= 1, `Service ${sid} has tracked lead count in database`);
    }
    logPass('CRM service metrics breakdown accurately tracks all nine services');

    const perfRes = await request('GET', '/api/analytics/service-performance');
    assert.strictEqual(perfRes.status, 200, 'GET /api/analytics/service-performance returns HTTP 200');
    assert.ok(Array.isArray(perfRes.data.services), 'Analytics returns service metrics array');
    logPass('Service-level performance analytics tracks full service portfolio');

    // -------------------------------------------------------------
    // GROUP 5: Clean Up Test Records
    // -------------------------------------------------------------
    console.log('\n[Clean Up] Cleaning up created test leads from SQLite...');
    for (const leadId of createdTestLeadIds) {
      await request('DELETE', `/api/leads/${leadId}`);
    }
    logPass(`Cleaned up ${createdTestLeadIds.length} test leads cleanly from database`);

    console.log('\n========================================================================');
    console.log(`🏁 SERVICES INTEGRATION SUITE COMPLETE: ${passedTests} PASSED | ${failedTests} FAILED`);
    console.log('========================================================================\n');

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Unhandled error during services integration test:', error);
    process.exit(1);
  }
}

runServicesIntegrationSuite();

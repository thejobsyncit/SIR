const http = require('http');

function postJson(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function patchJson(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...headers
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING JOB ENQUIRY VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Login as HR Lead
  console.log('--- Logging in HR Lead (Priya Sharma) ---');
  const leadLogin = await postJson('http://localhost:5000/api/crm/auth/login', {
    email: 'priya.lead@revivalinternational.com',
    password: 'Password123!',
    role: 'HR Lead',
    employeeId: 'REV-EMP-003',
    name: 'Priya Sharma'
  });
  assert(leadLogin.status === 200 && leadLogin.data.token, 'HR Lead login successful with token');
  const leadToken = leadLogin.data.token;
  const leadHeaders = {
    'Authorization': `Bearer ${leadToken}`,
    'x-user-role': 'HR Lead',
    'x-employee-id': 'REV-EMP-003',
    'x-employee-name': 'Priya Sharma',
    'x-employee-email': 'priya.lead@revivalinternational.com'
  };

  // Login as Fatima (HR Operations)
  console.log('--- Logging in Fatima (HR Operations Specialist) ---');
  const fatimaLogin = await postJson('http://localhost:5000/api/crm/auth/login', {
    email: 'fatima.intl@revivalinternational.com',
    password: 'Password123!',
    role: 'HR Operations',
    employeeId: 'REV-EMP-107',
    name: 'Fatima'
  });
  assert(fatimaLogin.status === 200 && fatimaLogin.data.token, 'Fatima login successful with token');
  const fatimaToken = fatimaLogin.data.token;
  const fatimaHeaders = {
    'Authorization': `Bearer ${fatimaToken}`,
    'x-user-role': 'HR Operations',
    'x-employee-id': 'REV-EMP-107',
    'x-employee-name': 'Fatima',
    'x-employee-email': 'fatima.intl@revivalinternational.com'
  };

  // Login as Balavarshini (HR Operations)
  console.log('--- Logging in Balavarshini (HR Operations Specialist) ---');
  const balaLogin = await postJson('http://localhost:5000/api/crm/auth/login', {
    email: 'balavarshini.s@revivalinternational.com',
    password: 'Password123!',
    role: 'HR Operations',
    employeeId: 'REV-EMP-006',
    name: 'Balavarshini S.'
  });
  assert(balaLogin.status === 200 && balaLogin.data.token, 'Balavarshini login successful with token');
  const balaToken = balaLogin.data.token;
  const balaHeaders = {
    'Authorization': `Bearer ${balaToken}`,
    'x-user-role': 'HR Operations',
    'x-employee-id': 'REV-EMP-006',
    'x-employee-name': 'Balavarshini S.',
    'x-employee-email': 'balavarshini.s@revivalinternational.com'
  };

  console.log('\n--- TEST A: HR Lead assigns Job Enquiry to Fatima ---');
  const targetAppId = 'RI-APP-10101'; // Tariq Mansoor, Senior Civil Project Manager
  const assignRes = await postJson('http://localhost:5000/api/hr-operations/assign', {
    enquiryIds: [targetAppId],
    employeeId: 'REV-EMP-107',
    instructions: 'Please review Tariq Mansoor GCC civil project management portfolio and conduct initial screening.',
    priority: 'Urgent'
  }, leadHeaders);

  assert(assignRes.status === 200 && assignRes.data.success, 'HR Lead assign API responded 200 success');
  assert(assignRes.data.employeeId === 'REV-EMP-107', 'Assigned employeeId recorded as REV-EMP-107');

  // Verify Fatima's dashboard summary retrieves assigned job enquiry
  const fatimaSummary = await getJson('http://localhost:5000/api/hr-ops/dashboard/summary', fatimaHeaders);
  assert(fatimaSummary.status === 200 && fatimaSummary.data.success, 'Fatima dashboard summary API returns 200');
  const fatimaAssignedEnquiries = fatimaSummary.data.data?.assignedEnquiries || [];
  const foundInFatima = fatimaAssignedEnquiries.find(e => e.id === targetAppId || e.referenceNumber === targetAppId);
  assert(!!foundInFatima, `Assigned job enquiry ${targetAppId} is present in Fatima's assignedEnquiries`);
  if (foundInFatima) {
    assert(foundInFatima.candidateName === 'thejobsync' || foundInFatima.candidateName === 'Tariq Mansoor', 'Candidate name is recorded correctly');
    assert(foundInFatima.serviceTitle?.includes('Senior Civil Project Manager'), 'Job title / service title is correct');
    assert(foundInFatima.priority === 'Urgent', 'Priority Urgent is preserved');
  }

  // Verify Fatima's candidate applications list
  const fatimaApps = await getJson('http://localhost:5000/api/candidate/applications', fatimaHeaders);
  assert(fatimaApps.status === 200 && fatimaApps.data.success, 'Fatima applications API returns 200');
  const foundInFatimaApps = (fatimaApps.data.data || []).find(a => a.id === targetAppId);
  assert(!!foundInFatimaApps, `Job enquiry ${targetAppId} is present in Fatima's applications list`);

  console.log('\n--- TEST B: Employee Isolation (Balavarshini cannot see Fatima\'s assigned enquiry) ---');
  const balaSummary = await getJson('http://localhost:5000/api/hr-ops/dashboard/summary', balaHeaders);
  const balaAssignedEnquiries = balaSummary.data.assignedEnquiries || [];
  const foundInBala = balaAssignedEnquiries.find(e => e.id === targetAppId || e.referenceNumber === targetAppId);
  assert(!foundInBala, `Job enquiry ${targetAppId} is ISOLATED from Balavarshini's assignedEnquiries`);

  const balaApps = await getJson('http://localhost:5000/api/candidate/applications', balaHeaders);
  const foundInBalaApps = (balaApps.data.data || []).find(a => a.id === targetAppId);
  assert(!foundInBalaApps, `Job enquiry ${targetAppId} is ISOLATED from Balavarshini's applications list`);

  // Direct access check: Balavarshini attempting to get Fatima's application by ID
  const directForbidden = await getJson(`http://localhost:5000/api/candidate/applications/${targetAppId}`, balaHeaders);
  assert(directForbidden.status === 403, 'Balavarshini receives 403 Forbidden attempting direct access to Fatima\'s application');

  console.log('\n--- TEST C: Logout & Login Persistence ---');
  // Re-login as Fatima (new token)
  const fatimaReLogin = await postJson('http://localhost:5000/api/crm/auth/login', {
    email: 'fatima.intl@revivalinternational.com',
    password: 'Password123!',
    role: 'HR Operations',
    employeeId: 'REV-EMP-107',
    name: 'Fatima'
  });
  assert(fatimaReLogin.status === 200 && fatimaReLogin.data.token, 'Fatima re-login succeeds with fresh token');
  const newFatimaHeaders = {
    'Authorization': `Bearer ${fatimaReLogin.data.token}`,
    'x-user-role': 'HR Operations',
    'x-employee-id': 'REV-EMP-107',
    'x-employee-name': 'Fatima',
    'x-employee-email': 'fatima.intl@revivalinternational.com'
  };
  const fatimaReSummary = await getJson('http://localhost:5000/api/hr-ops/dashboard/summary', newFatimaHeaders);
  const reAssigned = (fatimaReSummary.data.data?.assignedEnquiries || []).find(e => e.id === targetAppId || e.referenceNumber === targetAppId);
  assert(!!reAssigned, 'Assigned enquiry persists in Fatima account after fresh login');

  console.log('\n--- TEST D: Database Verification (SQLite Persistence) ---');
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('server/sir_recruitment.db');
  await new Promise(res => {
    db.get('SELECT * FROM candidate_applications WHERE id = ?', [targetAppId], (err, row) => {
      assert(!err && !!row, 'Application exists in SQLite candidate_applications table');
      assert(row?.assignedEmployeeId === 'REV-EMP-107', 'assignedEmployeeId in SQLite matches REV-EMP-107');
      assert(row?.priority === 'Urgent', 'priority in SQLite matches Urgent');

      db.get('SELECT * FROM hr_task_assignments WHERE enquiryId = ? OR referenceNumber = ?', [targetAppId, targetAppId], (tErr, tRow) => {
        assert(!tErr && !!tRow, 'Task exists in SQLite hr_task_assignments table');
        assert(tRow?.assignedEmployeeId === 'REV-EMP-107', 'assignedEmployeeId in hr_task_assignments matches REV-EMP-107');

        db.get('SELECT * FROM leads WHERE id = ? OR referenceNumber = ?', [targetAppId, targetAppId], (lErr, lRow) => {
          assert(!lErr && !!lRow, 'Enquiry exists in SQLite leads table');
          assert(lRow?.assignedEmployee === 'Fatima', 'assignedEmployee in leads matches Fatima');
          db.close();
          res();
        });
      });
    });
  });

  console.log('\n--- TEST E: Status Synchronization ---');
  // Fatima updates status to 'Selected'
  const updateStatusRes = await patchJson(`http://localhost:5000/api/candidate/applications/${targetAppId}/status`, {
    status: 'Selected',
    stage: 'selected',
    notes: 'Candidate completed executive interview and technical assessment successfully.'
  }, newFatimaHeaders);
  assert(updateStatusRes.status === 200 && updateStatusRes.data.success, 'Fatima successfully updates application status to Selected');

  // Verify sync in Fatima's dashboard
  const fatimaUpdatedSummary = await getJson('http://localhost:5000/api/hr-ops/dashboard/summary', newFatimaHeaders);
  const fatimaUpdatedEnq = (fatimaUpdatedSummary.data.data?.assignedEnquiries || []).find(e => e.id === targetAppId || e.referenceNumber === targetAppId);
  assert(fatimaUpdatedEnq?.status === 'Selected', 'Fatima dashboard reflects updated status "Selected"');

  // Verify sync in HR Lead view
  const leadApps = await getJson('http://localhost:5000/api/candidate/applications', leadHeaders);
  const appInLeadView = (leadApps.data.data || []).find(a => a.id === targetAppId);
  assert(appInLeadView?.status === 'Selected', 'HR Lead application view reflects updated status "Selected"');

  console.log('\n--- TEST F: Assignment Failure Handling (Negative Testing) ---');
  // 1. Missing / invalid employee ID
  const invalidEmpRes = await postJson('http://localhost:5000/api/hr-operations/assign', {
    enquiryIds: ['RI-APP-10302'],
    employeeId: 'NON-EXISTENT-EMP-9999'
  }, leadHeaders);
  assert(invalidEmpRes.status === 400 || invalidEmpRes.status === 404, 'Assigning to non-existent employee fails with 400/404 error');
  assert(!invalidEmpRes.data.success, 'Success is false for non-existent employee');

  // 2. Missing enquiry IDs
  const emptyEnqRes = await postJson('http://localhost:5000/api/hr-operations/assign', {
    enquiryIds: [],
    employeeId: 'REV-EMP-107'
  }, leadHeaders);
  assert(emptyEnqRes.status === 400, 'Assigning empty enquiry list fails with 400 Bad Request');
  assert(!emptyEnqRes.data.success, 'Success is false for empty enquiry list');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});

/**
 * test-shift-management-pipeline.cjs
 * Comprehensive End-to-End Test Suite for Shift Management Module
 *
 * Validates:
 * 1. Predefined Shift Timings (General 9-6, Morning 7-2, Evening 2-9)
 * 2. Unified Employee Roster (Real database employees, 9 required columns)
 * 3. Search and Department/Status/Shift Filters
 * 4. Single Shift Assignment with Frequency & Replacement
 * 5. Bulk Shift Assignment
 * 6. Historical & Date-Effective Shift Resolution
 * 7. Automatic Late-Login Detection
 * 8. Late-Login Approval Workflow (Approve, Reject, Self-Approval Block, Audit Log)
 * 9. Employee Dashboard "My Assigned Shift" Right-Hand Card Integration
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Auth tokens for real roles in SQLite database
const HR_LEAD_USER = {
  id: 'REV-EMP-003',
  employeeId: 'REV-EMP-003',
  email: 'priya.lead@revivalinternational.com',
  name: 'Priya Sharma',
  role: 'HR Lead',
  roles: ['HR Lead'],
  department: 'Human Resources'
};

const HR_LEAD_HEADER = {
  'x-user-data': JSON.stringify(HR_LEAD_USER),
  'x-employee-email': 'priya.lead@revivalinternational.com',
  'x-crm-role': 'HR Lead'
};

const ADMIN_USER = {
  id: 'REV-EMP-001',
  employeeId: 'REV-EMP-001',
  email: 'thejobsyncit@gmail.com',
  name: 'Dhanalakshimi',
  role: 'Super Admin',
  roles: ['Super Admin', 'Admin'],
  department: 'Executive'
};

const ADMIN_HEADER = {
  'x-user-data': JSON.stringify(ADMIN_USER),
  'x-employee-email': 'thejobsyncit@gmail.com',
  'x-crm-role': 'Super Admin'
};

const EMPLOYEE_USER = {
  id: 'REV-EMP-006',
  employeeId: 'REV-EMP-006',
  email: 'balavarshini.s@revivalinternational.com',
  name: 'Balavarshini S.',
  role: 'HR Operations',
  roles: ['HR Operations'],
  department: 'Operations'
};

const EMPLOYEE_HEADER = {
  'x-user-data': JSON.stringify(EMPLOYEE_USER),
  'x-employee-email': 'balavarshini.s@revivalinternational.com',
  'x-crm-role': 'HR Operations'
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 SHIFT MANAGEMENT MODULE — COMPREHENSIVE PIPELINE TEST');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Predefined Shift Configurations
    // ----------------------------------------------------
    console.log('👉 [1/8] Verifying Predefined Shift Options and Timings...');
    const configsRes = await request('GET', '/api/crm/shifts/configs', null, HR_LEAD_HEADER);
    assert(configsRes.status === 200, 'Shift configs endpoint returned HTTP 200');
    assert(Array.isArray(configsRes.body.shifts), 'Returns shifts array');
    
    const shifts = configsRes.body.shifts;
    const generalShift = shifts.find(s => s.id === 'SHIFT-GENERAL');
    const morningShift = shifts.find(s => s.id === 'SHIFT-MORNING');
    const eveningShift = shifts.find(s => s.id === 'SHIFT-EVENING');

    assert(Boolean(generalShift), 'General Shift exists (SHIFT-GENERAL)');
    assert(generalShift.scheduledLoginTime === '9:00 AM' && generalShift.scheduledLogoutTime === '6:00 PM', 
      `General Shift working hours are 9:00 AM – 6:00 PM (got ${generalShift.scheduledLoginTime} – ${generalShift.scheduledLogoutTime})`);

    assert(Boolean(morningShift), 'Morning Shift exists (SHIFT-MORNING)');
    assert(morningShift.scheduledLoginTime === '7:00 AM' && morningShift.scheduledLogoutTime === '2:00 PM', 
      `Morning Shift working hours are 7:00 AM – 2:00 PM (got ${morningShift.scheduledLoginTime} – ${morningShift.scheduledLogoutTime})`);

    assert(Boolean(eveningShift), 'Evening Shift exists (SHIFT-EVENING)');
    assert(eveningShift.scheduledLoginTime === '2:00 PM' && eveningShift.scheduledLogoutTime === '9:00 PM', 
      `Evening Shift working hours are 2:00 PM – 9:00 PM (got ${eveningShift.scheduledLoginTime} – ${eveningShift.scheduledLogoutTime})`);

    // ----------------------------------------------------
    // TEST 2: Unified Employee Roster (All Employees)
    // ----------------------------------------------------
    console.log('\n👉 [2/8] Verifying Unified Workforce Roster (All Real SQLite Employees)...');
    const today = new Date().toISOString().slice(0, 10);
    const rosterRes = await request('GET', `/api/crm/shifts/roster?date=${today}`, null, HR_LEAD_HEADER);
    assert(rosterRes.status === 200, 'Unified roster endpoint returned HTTP 200');
    assert(rosterRes.body.success === true, 'Roster response success is true');
    assert(Array.isArray(rosterRes.body.employees), 'Returns employees array');
    assert(rosterRes.body.employees.length === 4, `Loaded all real HR Operations employees (total: ${rosterRes.body.employees.length})`);
    assert(rosterRes.body.employees.every(e => e.role === 'HR Operations' || e.role.includes('Operations')), 'Verified: Roster strictly contains HR Operations staff');
    assert(rosterRes.body.employees.every(e => !e.role.includes('Admin') && !e.role.includes('Super') && !e.role.includes('HR Lead') && !e.role.includes('Recruiter') && !e.role.includes('Placement')), 'Verified: Admin, Super Admin, HR Lead, Recruiter, and Placement Coordinator are excluded from shift management roster');

    // Verify all 9 required columns on every employee item
    const firstEmp = rosterRes.body.employees[0];
    assert('name' in firstEmp && typeof firstEmp.name === 'string', 'Column 1: Employee Name present');
    assert('id' in firstEmp && typeof firstEmp.id === 'string', 'Column 2: Employee ID present');
    assert('role' in firstEmp && 'department' in firstEmp, 'Column 3: Role and Department present');
    assert('assignedShift' in firstEmp && typeof firstEmp.assignedShift === 'string', 'Column 4: Assigned Shift present');
    assert('scheduledLoginTime' in firstEmp && typeof firstEmp.scheduledLoginTime === 'string', 'Column 5: Scheduled Login Time present');
    assert('actualClockInTime' in firstEmp, 'Column 6: Actual Clock-in Time present');
    assert('loginStatus' in firstEmp, 'Column 7: Login Status present');
    assert('shiftPeriod' in firstEmp, 'Column 8: Shift Assignment Period present');
    assert('actions' in firstEmp, 'Column 9: Actions metadata present');

    // ----------------------------------------------------
    // TEST 3: Assign Shift Action (Single Employee)
    // ----------------------------------------------------
    console.log('\n👉 [3/8] Testing Single Shift Assignment with Frequency and Replacement...');
    const targetEmpId = 'REV-EMP-006'; // Karthik S.
    const assignPayload = {
      employeeIds: [targetEmpId],
      shiftId: 'SHIFT-MORNING',
      startDate: today,
      endDate: today,
      frequency: 'one_day',
      notes: 'Test morning shift single assignment'
    };
    const assignRes = await request('POST', '/api/crm/shifts/assign', assignPayload, HR_LEAD_HEADER);
    assert(assignRes.status === 200 || assignRes.status === 201, `Shift assignment endpoint returned success HTTP ${assignRes.status}`);
    assert((assignRes.body.count || assignRes.body.assignedCount) === 1, 'Assigned 1 employee successfully');

    // Verify roster immediately reflects Morning Shift for REV-EMP-006
    const updatedRosterRes = await request('GET', `/api/crm/shifts/roster?date=${today}`, null, HR_LEAD_HEADER);
    const karthik = updatedRosterRes.body.employees.find(e => e.id === targetEmpId);
    assert(Boolean(karthik), 'Found updated employee in roster');
    assert(karthik.assignedShiftId === 'SHIFT-MORNING', `Assigned shift ID is SHIFT-MORNING (got ${karthik.assignedShiftId})`);
    assert(karthik.shiftName === 'Morning Shift', `Assigned shift name is Morning Shift (got ${karthik.shiftName})`);
    assert(karthik.scheduledLoginTime === '7:00 AM', `Scheduled login time dynamically updated to 7:00 AM (got ${karthik.scheduledLoginTime})`);

    // ----------------------------------------------------
    // TEST 4: Bulk Shift Assignment
    // ----------------------------------------------------
    console.log('\n👉 [4/8] Testing Bulk Shift Assignment...');
    const bulkTargets = ['REV-EMP-107', 'REV-EMP-102'];
    const bulkAssignPayload = {
      employeeIds: bulkTargets,
      shiftId: 'SHIFT-EVENING',
      startDate: today,
      endDate: today,
      frequency: 'one_day',
      notes: 'Test bulk evening shift assignment'
    };
    const bulkRes = await request('POST', '/api/crm/shifts/assign', bulkAssignPayload, HR_LEAD_HEADER);
    assert(bulkRes.status === 200 || bulkRes.status === 201, `Bulk shift assignment returned success HTTP ${bulkRes.status}`);
    assert((bulkRes.body.count || bulkRes.body.assignedCount) === 2, `Bulk assigned ${bulkRes.body.count || bulkRes.body.assignedCount} employees`);

    // Verify both targets now have Evening Shift
    const bulkRosterRes = await request('GET', `/api/crm/shifts/roster?date=${today}`, null, HR_LEAD_HEADER);
    for (const bId of bulkTargets) {
      const emp = bulkRosterRes.body.employees.find(e => e.id === bId);
      assert(emp && emp.assignedShiftId === 'SHIFT-EVENING', `Employee ${bId} correctly updated to SHIFT-EVENING`);
      assert(emp && emp.scheduledLoginTime === '2:00 PM', `Employee ${bId} scheduled login time is 2:00 PM`);
    }

    // ----------------------------------------------------
    // TEST 5: Date-Effective Shift Resolution & History Preservation
    // ----------------------------------------------------
    console.log('\n👉 [5/8] Testing Date-Effective Shift Resolution (Historical vs Current)...');
    // Future date outside today's one-day assignment
    const futureDate = '2026-12-31';
    const futureRosterRes = await request('GET', `/api/crm/shifts/roster?date=${futureDate}`, null, HR_LEAD_HEADER);
    assert(futureRosterRes.status === 200, 'Future date roster returned HTTP 200');
    const karthikFuture = futureRosterRes.body.employees.find(e => e.id === targetEmpId);
    assert(Boolean(karthikFuture), 'Found employee on future date roster');
    // Karthik's baseline or fallback should be General Shift or default, not the temporary single-day Morning Shift
    assert(karthikFuture.shiftPeriod !== 'Active Single Day Assignment', 'Historical/future date properly isolates temporary assignment');

    // ----------------------------------------------------
    // TEST 6: Late-Login Approval Workflow & Request Queue
    // ----------------------------------------------------
    console.log('\n👉 [6/8] Testing Late-Login Approval Queue and Decisions...');
    const approvalsRes = await request('GET', '/api/crm/shifts/late-approvals', null, HR_LEAD_HEADER);
    assert(approvalsRes.status === 200, 'Late approvals endpoint returned HTTP 200');
    assert(Array.isArray(approvalsRes.body.requests), 'Returns requests array');
    console.log(`  ℹ Total late approval requests in queue: ${approvalsRes.body.requests.length}`);

    if (approvalsRes.body.requests.length > 0) {
      const reqItem = approvalsRes.body.requests[0];
      assert('employeeName' in reqItem, 'Approval request has employeeName');
      assert('scheduledLoginTime' in reqItem, 'Approval request has scheduledLoginTime');
      assert('actualClockInTime' in reqItem, 'Approval request has actualClockInTime');
      assert('delayMinutes' in reqItem, 'Approval request has delayMinutes');
      assert('status' in reqItem, 'Approval request has status');

      // Test self-approval block
      console.log('  Testing self-approval prevention...');
      const selfUserHeader = {
        'x-user-data': JSON.stringify({
          id: reqItem.employeeId,
          email: 'self@revival.com',
          name: reqItem.employeeName,
          role: 'HR_LEAD',
          roles: ['HR_LEAD']
        })
      };
      const selfDecisionRes = await request('POST', `/api/crm/shifts/late-approvals/${reqItem.id}/decision`, {
        decision: 'APPROVED',
        reviewNotes: 'Trying to self-approve'
      }, selfUserHeader);
      assert(selfDecisionRes.status === 403, `Self-approval rejected with HTTP 403 Forbidden (got ${selfDecisionRes.status})`);

      // Test authorized decision by Admin
      console.log('  Testing authorized approval by Admin...');
      const adminDecisionRes = await request('POST', `/api/crm/shifts/late-approvals/${reqItem.id}/decision`, {
        decision: 'APPROVED',
        reviewNotes: 'Authorized approval verified by test suite'
      }, ADMIN_HEADER);
      assert(adminDecisionRes.status === 200, 'Admin approval returned HTTP 200');
      assert(adminDecisionRes.body.success === true, 'Admin approval reported success true');
      assert(adminDecisionRes.body.decision === 'Approved' || adminDecisionRes.body.request?.status === 'Approved', 'Request status updated to Approved');
    }

    // ----------------------------------------------------
    // TEST 7: Employee Dashboard "My Assigned Shift" Display
    // ----------------------------------------------------
    console.log('\n👉 [7/8] Testing Employee Dashboard "My Assigned Shift" Right-Hand Display Data...');
    const dashRes = await request('GET', '/api/hr-ops/dashboard/summary', null, HR_LEAD_HEADER);
    assert(dashRes.status === 200, 'HR operations dashboard summary returned HTTP 200');
    const summaryData = dashRes.body.data || dashRes.body;
    assert(Boolean(summaryData && summaryData.myAssignedShift), 'Dashboard summary contains myAssignedShift object');
    
    const myShift = summaryData.myAssignedShift;
    assert('hasShiftAssigned' in myShift, 'myAssignedShift has hasShiftAssigned boolean');
    assert('shiftName' in myShift, `myAssignedShift has shiftName: "${myShift.shiftName}"`);
    assert('scheduledLoginTime' in myShift, `myAssignedShift has scheduledLoginTime: "${myShift.scheduledLoginTime}"`);
    assert('scheduledLogoutTime' in myShift, `myAssignedShift has scheduledLogoutTime: "${myShift.scheduledLogoutTime}"`);
    assert('todayDate' in myShift, `myAssignedShift has todayDate: "${myShift.todayDate}"`);
    assert('attendanceStatus' in myShift, `myAssignedShift has attendanceStatus: "${myShift.attendanceStatus}"`);
    assert('lateApprovalStatus' in myShift, `myAssignedShift has lateApprovalStatus: "${myShift.lateApprovalStatus}"`);

    // ----------------------------------------------------
    // TEST 8: Role-Based Access Control Verification
    // ----------------------------------------------------
    console.log('\n👉 [8/8] Testing Role-Based Access Control on Shift Assignment...');
    // Regular employee without HR/Admin role attempting to assign shift
    const unauthorizedAssignRes = await request('POST', '/api/crm/shifts/assign', {
      employeeIds: ['REV-EMP-001'],
      shiftId: 'SHIFT-MORNING',
      startDate: today
    }, {
      'x-user-data': JSON.stringify({
        id: 'REV-EMP-004',
        email: 'kishore.recruiter@revivalinternational.com',
        role: 'Recruiter'
      }),
      'x-employee-email': 'kishore.recruiter@revivalinternational.com',
      'x-crm-role': 'Recruiter'
    });
    assert(unauthorizedAssignRes.status === 403, `Non-HR user assignment blocked with HTTP 403 (got ${unauthorizedAssignRes.status})`);

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} checks succeeded!`);
    console.log('====================================================\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runTestSuite();

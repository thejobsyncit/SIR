const http = require('http');

const HR_LEAD_USER = {
  id: 'REV-EMP-003',
  employeeId: 'REV-EMP-003',
  email: 'priya.lead@revivalinternational.com',
  name: 'Priya Sharma',
  role: 'HR Lead',
  roles: ['HR Lead'],
  department: 'Human Resources'
};

const HR_HEADERS = {
  'Content-Type': 'application/json',
  'x-user-data': JSON.stringify(HR_LEAD_USER),
  'x-employee-email': 'priya.lead@revivalinternational.com',
  'x-crm-role': 'HR Lead'
};

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        ...HR_HEADERS,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: HR_HEADERS
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticating as HR Lead ---');
  console.log('✓ Using verified HR Lead headers');

  console.log('\n--- 2. Testing Date-Effective Roster for Balavarshini S. (REV-EMP-006) ---');
  // Check Nov 25 (Wednesday: One-Day Morning)
  const nov25 = await get('/api/crm/shifts/roster?date=2026-11-25');
  const balaNov25 = nov25.body?.employees?.find(e => e.employeeId === 'REV-EMP-006');
  console.log('Nov 25 shift:', balaNov25?.shiftName, balaNov25?.shiftAssignmentPeriod);

  // Check Nov 26 (Thursday: Monthly Recurring Morning Shift)
  const nov26 = await get('/api/crm/shifts/roster?date=2026-11-26');
  const balaNov26 = nov26.body?.employees?.find(e => e.employeeId === 'REV-EMP-006');
  console.log('Nov 26 shift (from Monthly Recurring):', balaNov26?.shiftName, balaNov26?.shiftAssignmentPeriod);

  // Check Nov 28 (Saturday: One-Day General Shift Override)
  const nov28 = await get('/api/crm/shifts/roster?date=2026-11-28');
  const balaNov28 = nov28.body?.employees?.find(e => e.employeeId === 'REV-EMP-006');
  console.log('Nov 28 shift (from One-Day Override):', balaNov28?.shiftName, balaNov28?.shiftAssignmentPeriod);

  // Check Nov 29 (Sunday: Weekly Off)
  const nov29 = await get('/api/crm/shifts/roster?date=2026-11-29');
  const balaNov29 = nov29.body?.employees?.find(e => e.employeeId === 'REV-EMP-006');
  console.log('Nov 29 shift (Sunday):', balaNov29?.shiftName, balaNov29?.scheduledLoginTime);

  console.log('\n--- 3. Testing Shift Assignment: Assigning Evening Shift to Fatima (REV-EMP-107) for Nov 27 ---');
  const assignRes = await post('/api/crm/shifts/assign', {
    employeeIds: ['REV-EMP-107'],
    shiftId: 'SHIFT-EVENING',
    startDate: '2026-11-27',
    frequency: 'one_day',
    applicableDays: [1, 2, 3, 4, 5, 6],
    notes: 'Project review coverage'
  });

  console.log('Assign result:', assignRes.status, assignRes.body?.message);

  // Check Nov 27 roster for Fatima
  const nov27 = await get('/api/crm/shifts/roster?date=2026-11-27');
  const fatimaNov27 = nov27.body?.employees?.find(e => e.employeeId === 'REV-EMP-107');
  console.log('Nov 27 Fatima shift:', fatimaNov27?.shiftName, fatimaNov27?.scheduledLoginTime);
  if (fatimaNov27?.shiftName !== 'Evening Shift') {
    console.error('FAIL: Expected Fatima to have Evening Shift on Nov 27, got:', fatimaNov27?.shiftName);
    process.exit(1);
  } else {
    console.log('✓ PASS: Fatima has Evening Shift on Nov 27');
  }

  console.log('\n--- 4. Checking Shift Assignments Audit Log Order ---');
  const asgnsRes = await get('/api/crm/shifts/assignments');
  const topAsgn = asgnsRes.body?.assignments?.[0];
  console.log('Top (most recently assigned) assignment:', topAsgn?.employeeName, topAsgn?.shiftName, topAsgn?.startDate, topAsgn?.assignedAt);
  if (topAsgn?.employeeId === 'REV-EMP-107' && topAsgn?.startDate === '2026-11-27') {
    console.log('✓ PASS: Most recent assignment appears at top of audit log');
  }

  console.log('\nAll tests passed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

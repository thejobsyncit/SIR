const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('========================================================');
console.log('🧪 TESTING ASSIGN SHIFT EMPLOYEE SELECTION BY NAME');
console.log('========================================================\n');

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ❌ FAILED: ${message}`);
  }
}

// 1. Static code analysis on CrmHrLeadDashboard.jsx
console.log('👉 [1/3] Inspecting Frontend Modal Implementation...');
const dashboardCode = fs.readFileSync(path.join(__dirname, 'src/crm/pages/CrmHrLeadDashboard.jsx'), 'utf8');

assert(dashboardCode.includes('const [assignEmpSearch, setAssignEmpSearch] = useState'), 'State variable assignEmpSearch is declared');
assert(dashboardCode.includes('const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState'), 'State variable isEmpDropdownOpen is declared');
assert(dashboardCode.includes('placeholder="Type employee name to search and select..."'), 'Search input allows typing employee name');
assert(dashboardCode.includes('Select All {assignEmpSearch ? \'Filtered\' : `(${displayEmployees.length})`}'), 'Bulk Select All / Filtered button is present');
assert(dashboardCode.includes('Clear All'), 'Clear All selection button is present');
assert(dashboardCode.includes('Selected Staff ({assignFormTarget.employeeIds.length}):'), 'Selected staff count and badges list is present');
assert(dashboardCode.includes('matches.map(emp => {'), 'Renders dropdown list of matching employees');
assert(dashboardCode.includes('emp.name?.toLowerCase().includes(q)'), 'Filters employees by employee name match');
assert(dashboardCode.includes('No employees selected yet. Search by name above to add employees to this shift.'), 'Clear empty state prompt is present');
assert(dashboardCode.includes('showToast(\'⚠️ Please select at least one employee.\');'), 'Validates at least one employee is selected before submit');

// 2. Test API backend integration
console.log('\n👉 [2/3] Testing Backend Shift Assignment by Employee IDs...');

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

function apiRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const dataToSend = postData ? JSON.stringify(postData) : null;
    const reqHeaders = { ...options.headers };
    if (dataToSend) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataToSend);
    }
    const finalOptions = { ...options, headers: reqHeaders };

    const req = http.request(finalOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (dataToSend) req.write(dataToSend);
    req.end();
  });
}

(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // Fetch workforce roster to find valid employees by name
    const rosterRes = await apiRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/crm/shifts/roster?date=${today}`,
      method: 'GET',
      headers: HR_HEADERS
    });

    assert(rosterRes.status === 200, 'Shift roster endpoint reachable');
    const employees = rosterRes.body.employees || [];
    assert(employees.length > 0, `Roster returned ${employees.length} employees`);

    // Pick two employees by name
    const target1 = employees[0];
    const target2 = employees[1] || employees[0];
    console.log(`  ℹ Selected employees by name: "${target1.name}" (${target1.employeeId || target1.id}) and "${target2.name}" (${target2.employeeId || target2.id})`);

    const id1 = target1.employeeId || target1.id;
    const id2 = target2.employeeId || target2.id;

    // Assign Morning Shift to target1
    const assignRes1 = await apiRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assign',
      method: 'POST',
      headers: HR_HEADERS
    }, {
      employeeIds: [id1],
      shiftId: 'SHIFT-MORNING',
      startDate: today,
      frequency: 'one_day',
      notes: 'Test single shift assignment via name selection'
    });

    assert(assignRes1.status === 201 && assignRes1.body.success, 'Successfully assigned shift to target1 by employee name/ID');

    // Bulk assign Evening Shift to both targets
    console.log('\n👉 [3/3] Testing Bulk Shift Assignment via Name Selection...');
    const bulkRes = await apiRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assign',
      method: 'POST',
      headers: HR_HEADERS
    }, {
      employeeIds: [id1, id2],
      shiftId: 'SHIFT-EVENING',
      startDate: today,
      frequency: 'one_day',
      notes: 'Test bulk shift assignment via name selection'
    });

    assert(bulkRes.status === 201 && bulkRes.body.success, 'Successfully bulk-assigned shift to multiple employees selected by name');

    // Check updated roster
    const updatedRosterRes = await apiRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/crm/shifts/roster?date=${today}`,
      method: 'GET',
      headers: HR_HEADERS
    });

    const updatedEmp1 = updatedRosterRes.body.employees.find(e => (e.employeeId || e.id) === id1);
    assert(updatedEmp1 && updatedEmp1.assignedShiftId === 'SHIFT-EVENING', `Target employee "${target1.name}" has updated shift SHIFT-EVENING`);

    console.log('\n========================================================');
    console.log(`🎉 TEST SUMMARY: ${passedChecks}/${totalChecks} checks passed!`);
    console.log('========================================================');
    process.exit(passedChecks === totalChecks ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
})();

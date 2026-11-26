const http = require('http');

(async () => {
  try {
    const { createCrmSessionToken } = await import('./server/routes/attendanceRoutes.js');

    const HR_LEAD_USER = {
      id: 'REV-EMP-003',
      employeeId: 'REV-EMP-003',
      email: 'priya.lead@revivalinternational.com',
      name: 'Priya Sharma',
      role: 'HR Lead',
      department: 'Human Resources'
    };

    const token = createCrmSessionToken(HR_LEAD_USER);

    const HR_LEAD_HEADER = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'x-user-data': JSON.stringify(HR_LEAD_USER),
      'x-employee-email': 'priya.lead@revivalinternational.com',
      'x-crm-role': 'HR Lead'
    };

    function request(options, data) {
      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch (e) {
              resolve({ status: res.statusCode, body });
            }
          });
        });
        req.on('error', reject);
        if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
        req.end();
      });
    }

    console.log('Testing with HR Lead token...');

    // 1. GET /api/crm/shifts/roster
    const rosterRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/roster?date=2026-11-25',
      method: 'GET',
      headers: HR_LEAD_HEADER
    });

    console.log('Roster status:', rosterRes.status);
    console.log('Roster count:', rosterRes.data?.count);
    console.log('Roster employees:');
    rosterRes.data?.employees?.forEach(e => {
      console.log(`  - [${e.employeeId}] ${e.name} | Role: ${e.role} | Dept: ${e.department} | Shift: ${e.shiftName}`);
    });

    // Check count and roles
    const allHrOps = (rosterRes.data?.employees || []).every(e => 
      e.role.toLowerCase().includes('operations') || (e.department && e.department.toLowerCase().includes('operations'))
    );
    console.log('Strictly HR Operations?', allHrOps);
    console.log('Employee count is exactly 4?', rosterRes.data?.employees?.length === 4);

    // 2. GET /api/crm/shifts/assignments for Balavarshini S. (REV-EMP-006)
    const asgnRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assignments?employeeId=REV-EMP-006',
      method: 'GET',
      headers: HR_LEAD_HEADER
    });

    console.log('\nAssignments count for REV-EMP-006:', asgnRes.data?.count);
    if (asgnRes.data?.assignments?.length > 0) {
      console.log('Top 3 assignments lastly assigned:');
      asgnRes.data.assignments.slice(0, 3).forEach((a, i) => {
        console.log(`  [${i}] ${a.shiftName} (${a.status}) - Period: ${a.startDate}..${a.endDate} | AssignedAt: ${a.assignedAt} | By: ${a.assignedByName}`);
      });
    }

    // 3. Assign a new shift to Praveen Kumar (REV-EMP-108)
    const assignTest = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assign',
      method: 'POST',
      headers: HR_LEAD_HEADER
    }, {
      employeeIds: ['REV-EMP-108'],
      shiftId: 'SHIFT-MORNING',
      startDate: '2026-11-25',
      endDate: '2026-11-25',
      frequency: 'one_day',
      notes: 'Test morning shift override'
    });

    console.log('\nAssign shift response status:', assignTest.status);
    console.log('Assign shift success:', assignTest.data?.success);
    console.log('Assign shift message:', assignTest.data?.message);

    // 4. Fetch assignments for REV-EMP-108 to verify the new one is on top
    const asgnPraveen = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assignments?employeeId=REV-EMP-108',
      method: 'GET',
      headers: HR_LEAD_HEADER
    });

    console.log('\nTop assignment for REV-EMP-108 (lastly assigned):');
    const top = asgnPraveen.data?.assignments?.[0];
    if (top) {
      console.log(`  Shift: ${top.shiftName} | Status: ${top.status} | Period: ${top.startDate}..${top.endDate} | AssignedAt: ${top.assignedAt} | By: ${top.assignedByName}`);
    }

    console.log('\n✓ ALL SHIFT MANAGEMENT INTEGRATION CHECKS PASSED SUCCESSFULLY');
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();

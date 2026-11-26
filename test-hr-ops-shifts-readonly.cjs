const http = require('http');

(async () => {
  try {
    const { createCrmSessionToken } = await import('./server/routes/attendanceRoutes.js');

    const HR_OPS_USER = {
      id: 'REV-EMP-006',
      employeeId: 'REV-EMP-006',
      email: 'balavarshini.s@revivalinternational.com',
      name: 'Balavarshini S.',
      role: 'HR Operations',
      department: 'International HR Operations'
    };

    const token = createCrmSessionToken(HR_OPS_USER);

    const HR_OPS_HEADERS = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'x-user-data': JSON.stringify(HR_OPS_USER),
      'x-employee-email': HR_OPS_USER.email,
      'x-crm-role': HR_OPS_USER.role
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

    console.log('========================================================');
    console.log('🧪 VERIFYING HR OPERATIONS SHIFT MANAGEMENT (VIEW-ONLY)');
    console.log('========================================================\n');

    // 1. HR Operations CAN view shift configs (Read-only)
    const configsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/configs',
      method: 'GET'
    });
    console.log('1. Shift configs status:', configsRes.status);
    console.log('   Number of predefined shifts:', configsRes.data?.data?.length);
    if (configsRes.status !== 200 || !configsRes.data?.data?.length) {
      throw new Error('Failed to load shift configs');
    }
    console.log('   ✓ Configs visible');

    // 2. HR Operations CAN view shift roster (Read-only)
    const rosterRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/roster?date=2026-11-25',
      method: 'GET',
      headers: HR_OPS_HEADERS
    });
    console.log('\n2. Shift roster status for HR Operations:', rosterRes.status);
    console.log('   Roster count:', rosterRes.data?.count);
    rosterRes.data?.employees?.forEach(e => {
      console.log(`   - ${e.name} (${e.employeeId}): ${e.shiftName} [${e.scheduledLoginTime}]`);
    });
    if (rosterRes.status !== 200 || !rosterRes.data?.employees?.length) {
      throw new Error('HR Operations could not read shift roster');
    }
    console.log('   ✓ Roster visible to HR Operations');

    // 3. HR Operations CAN view shift assignment audit logs (Read-only)
    const asgnRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assignments?employeeId=REV-EMP-006',
      method: 'GET',
      headers: HR_OPS_HEADERS
    });
    console.log('\n3. Shift assignments audit log status for HR Operations:', asgnRes.status);
    console.log('   Assignment count for Balavarshini S.:', asgnRes.data?.count);
    if (asgnRes.status !== 200) {
      throw new Error('HR Operations could not read shift assignments');
    }
    console.log('   ✓ Shift assignments audit log visible to HR Operations');

    // 4. HR Operations CANNOT edit or assign shifts (Forbidden)
    const assignRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assign',
      method: 'POST',
      headers: HR_OPS_HEADERS
    }, {
      employeeIds: ['REV-EMP-006'],
      shiftId: 'SHIFT-MORNING',
      startDate: '2026-11-25',
      endDate: '2026-11-25',
      frequency: 'one_day'
    });
    console.log('\n4. Attempt shift assignment as HR Operations status:', assignRes.status);
    console.log('   Response message:', assignRes.data?.message);
    if (assignRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for HR Operations assigning shift, got ${assignRes.status}`);
    }
    console.log('   ✓ Verified: HR Operations is strictly blocked from editing/assigning shifts (HTTP 403 Forbidden)');

    // 5. HR Operations CANNOT cancel/delete shift assignments (Forbidden)
    const deleteRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/crm/shifts/assignments/test-id-123',
      method: 'DELETE',
      headers: HR_OPS_HEADERS
    });
    console.log('\n5. Attempt delete shift assignment as HR Operations status:', deleteRes.status);
    if (deleteRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for HR Operations deleting shift, got ${deleteRes.status}`);
    }
    console.log('   ✓ Verified: HR Operations is strictly blocked from deleting shifts (HTTP 403 Forbidden)');

    console.log('\n========================================================');
    console.log('🎉 ALL HR OPERATIONS SHIFT MANAGEMENT CHECKS PASSED!');
    console.log('========================================================');
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();

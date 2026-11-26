// test-hr-ops-individual-roster.cjs
const assert = require('assert');

async function runTest() {
  console.log('========================================================');
  console.log('🧪 TESTING INDIVIDUAL SHIFT ROSTER FOR HR OPERATIONS');
  console.log('========================================================');

  // Helper to fetch preview token
  const getToken = async (email, role, employeeId) => {
    const res = await fetch('http://localhost:5000/api/crm/auth/preview-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: role, targetEmail: email, employeeId })
    });
    const data = await res.json();
    return data.token;
  };

  // 1. Test Balavarshini S. (REV-EMP-006)
  console.log('\n[1] Testing Balavarshini S. (REV-EMP-006) Shift View...');
  const balaToken = await getToken('balavarshini.s@revivalinternational.com', 'HR Operations', 'REV-EMP-006');
  const balaRosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { Authorization: `Bearer ${balaToken}` }
  });
  const balaRoster = await balaRosterRes.json();
  assert(balaRoster.success, 'Balavarshini roster failed');
  console.log(`  Count for Balavarshini: ${balaRoster.count}`);
  assert.strictEqual(balaRoster.count, 1, `Expected exactly 1 employee in roster for Balavarshini, got ${balaRoster.count}`);
  assert.strictEqual(balaRoster.employees[0].employeeId, 'REV-EMP-006', 'Expected Balavarshini REV-EMP-006');
  console.log(`  ✓ Roster contains ONLY: ${balaRoster.employees[0].name} (${balaRoster.employees[0].assignedShift})`);

  // 2. Test Fatima (REV-EMP-107)
  console.log('\n[2] Testing Fatima (REV-EMP-107) Shift View...');
  const fatimaToken = await getToken('fatima@revivalinternational.com', 'HR Operations', 'REV-EMP-107');
  const fatimaRosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { Authorization: `Bearer ${fatimaToken}` }
  });
  const fatimaRoster = await fatimaRosterRes.json();
  assert(fatimaRoster.success, 'Fatima roster failed');
  console.log(`  Count for Fatima: ${fatimaRoster.count}`);
  assert.strictEqual(fatimaRoster.count, 1, `Expected exactly 1 employee in roster for Fatima, got ${fatimaRoster.count}`);
  assert.strictEqual(fatimaRoster.employees[0].employeeId, 'REV-EMP-107', 'Expected Fatima REV-EMP-107');
  console.log(`  ✓ Roster contains ONLY: ${fatimaRoster.employees[0].name} (${fatimaRoster.employees[0].assignedShift})`);

  // 3. Test Divya R. (REV-EMP-102)
  console.log('\n[3] Testing Divya R. (REV-EMP-102) Shift View...');
  const divyaToken = await getToken('divya.r@revivalinternational.com', 'HR Operations', 'REV-EMP-102');
  const divyaRosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { Authorization: `Bearer ${divyaToken}` }
  });
  const divyaRoster = await divyaRosterRes.json();
  assert(divyaRoster.success, 'Divya roster failed');
  console.log(`  Count for Divya: ${divyaRoster.count}`);
  assert.strictEqual(divyaRoster.count, 1, `Expected exactly 1 employee in roster for Divya, got ${divyaRoster.count}`);
  assert.strictEqual(divyaRoster.employees[0].employeeId, 'REV-EMP-102', 'Expected Divya REV-EMP-102');
  console.log(`  ✓ Roster contains ONLY: ${divyaRoster.employees[0].name} (${divyaRoster.employees[0].assignedShift})`);

  // 4. Test Praveen Kumar (REV-EMP-108)
  console.log('\n[4] Testing Praveen Kumar (REV-EMP-108) Shift View...');
  const praveenToken = await getToken('praveen.kumar@revivalinternational.com', 'HR Operations', 'REV-EMP-108');
  const praveenRosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { Authorization: `Bearer ${praveenToken}` }
  });
  const praveenRoster = await praveenRosterRes.json();
  assert(praveenRoster.success, 'Praveen roster failed');
  console.log(`  Count for Praveen: ${praveenRoster.count}`);
  assert.strictEqual(praveenRoster.count, 1, `Expected exactly 1 employee in roster for Praveen, got ${praveenRoster.count}`);
  assert.strictEqual(praveenRoster.employees[0].employeeId, 'REV-EMP-108', 'Expected Praveen REV-EMP-108');
  console.log(`  ✓ Roster contains ONLY: ${praveenRoster.employees[0].name} (${praveenRoster.employees[0].assignedShift})`);

  // 5. Test HR Lead (Leadership view: manages all 4 operations staff)
  console.log('\n[5] Testing HR Lead (Management View)...');
  const hrLeadToken = await getToken('priya.lead@revivalinternational.com', 'HR Lead', 'REV-EMP-003');
  const hrLeadRosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { Authorization: `Bearer ${hrLeadToken}` }
  });
  const hrLeadRoster = await hrLeadRosterRes.json();
  assert(hrLeadRoster.success, 'HR Lead roster failed');
  console.log(`  Count for HR Lead: ${hrLeadRoster.count}`);
  assert.strictEqual(hrLeadRoster.count, 4, `Expected all 4 operations employees for HR Lead, got ${hrLeadRoster.count}`);
  console.log('  ✓ HR Lead sees all 4 operations staff for management and shift assignment:');
  hrLeadRoster.employees.forEach(e => console.log(`     - ${e.name} (${e.employeeId}): ${e.assignedShift}`));

  console.log('\n========================================================');
  console.log('🎉 ALL HR OPERATIONS INDIVIDUAL ROSTER CHECKS PASSED!');
  console.log('========================================================');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

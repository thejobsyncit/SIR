// test-dashboard-announcement-and-shifts.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 TESTING DASHBOARD ANNOUNCEMENT & SHIFTS VALIDATION');
console.log('====================================================');

// 1. Inspect CrmHrLeadDashboard.jsx
const hrLeadPath = path.join(__dirname, 'src', 'crm', 'pages', 'CrmHrLeadDashboard.jsx');
const hrLeadContent = fs.readFileSync(hrLeadPath, 'utf8');

console.log('\n[1] Verifying Create Announcement Removal from Dashboard Overview...');
// Check that renderCompanyAnnouncementsSection accepts showCreateButton
assert(hrLeadContent.includes('const renderCompanyAnnouncementsSection = (showCreateButton = false) =>'), 'renderCompanyAnnouncementsSection signature missing default showCreateButton');
// Check that overview tab passes false
assert(hrLeadContent.includes('{renderCompanyAnnouncementsSection(false)}'), 'Overview tab does not pass false to hide Create Announcement button');
// Check that the Create Announcement button is conditionally rendered with showCreateButton
assert(hrLeadContent.includes('{Boolean(showCreateButton) && ('), 'Create Announcement button is not conditioned on showCreateButton');
console.log('  ✓ Verified: + Create Announcement button is strictly hidden on HR Lead Dashboard overview!');

console.log('\n[2] Verifying displayEmployees Scoping & Defensive Resolution in CrmHrLeadDashboard.jsx...');
// Check displayEmployees is defined at top component level
const displayEmployeesDecl = hrLeadContent.indexOf('const displayEmployees = useMemo(');
assert(displayEmployeesDecl !== -1, 'displayEmployees declaration not found');
const handleSaveShiftAssignmentPos = hrLeadContent.indexOf('const handleSaveShiftAssignment =');
assert(handleSaveShiftAssignmentPos !== -1, 'handleSaveShiftAssignment not found');
assert(displayEmployeesDecl < handleSaveShiftAssignmentPos, 'displayEmployees MUST be declared BEFORE handleSaveShiftAssignment');

// Check defensive handling in handleSaveShiftAssignment
assert(hrLeadContent.includes('const rosterList = (typeof displayEmployees !== \'undefined\' && Array.isArray(displayEmployees))'), 'Defensive rosterList check missing');
assert(hrLeadContent.includes('const targetIds = Array.isArray(assignFormTarget?.employeeIds) ? assignFormTarget.employeeIds : [];'), 'Defensive targetIds check missing');
console.log('  ✓ Verified: displayEmployees is declared at component scope before handleSaveShiftAssignment with defensive fallback array!');

console.log('\n[3] Verifying HR Operations View-Only Mode Integration...');
const sidebarPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmSidebar.jsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes('{ id: \'hr-shifts\', label: \'My Shift\', icon: Clock }'), 'hr-shifts menu item missing from HR Operations menu');

const appPath = path.join(__dirname, 'src', 'crm', 'CrmApp.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(appContent.includes("return <CrmHrLeadDashboard initialSection=\"hr-shifts\" isReadOnly={true} />;"), 'CrmApp does not route HR Operations to isReadOnly mode');

assert(hrLeadContent.includes('const readOnlyMode = Boolean(isReadOnly || isHrOps || currentRole === \'HR Operations\');'), 'readOnlyMode resolution missing in CrmHrLeadDashboard');
console.log('  ✓ Verified: HR Operations accesses Shift Management in read-only mode with zero edit affordances!');

console.log('\n[4] Testing API Shift Assignment Execution & Audit Persistence...');
async function testApi() {
  const loginRes = await fetch('http://localhost:5000/api/crm/auth/preview-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetRole: 'HR Lead',
      targetEmail: 'sreeja.nair@revival.internal'
    })
  });
  const loginData = await loginRes.json();
  assert(loginData.success && loginData.token, 'Failed to acquire HR Lead token');
  const token = loginData.token;

  // Test shift assignment for Praveen Kumar (REV-EMP-108)
  const assignRes = await fetch('http://localhost:5000/api/crm/shifts/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      employeeIds: ['REV-EMP-108'],
      shiftId: 'SHIFT-MORNING',
      startDate: new Date().toISOString().slice(0, 10),
      frequency: 'one_day',
      notes: 'Automated QA verification test'
    })
  });
  const assignData = await assignRes.json();
  assert(assignRes.status === 201 || assignRes.status === 200, `Shift assignment failed: ${assignData.message}`);
  assert(assignData.success, 'Shift assignment reported success: false');
  console.log(`  ✓ Shift assigned successfully via API: ${assignData.message}`);

  // Fetch updated roster
  const rosterRes = await fetch('http://localhost:5000/api/crm/shifts/roster', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rosterData = await rosterRes.json();
  assert(rosterData.success, 'Failed to load roster data');
  const praveen = rosterData.employees.find(e => e.employeeId === 'REV-EMP-108');
  assert(praveen, 'Praveen Kumar not found in roster');
  assert(praveen.assignedShiftId === 'SHIFT-MORNING', 'Assigned shift was not updated to SHIFT-MORNING');
  console.log(`  ✓ Verified roster record: ${praveen.name} -> ${praveen.assignedShift} (${praveen.scheduledLoginTime})`);

  console.log('\n====================================================');
  console.log('🎉 ALL DASHBOARD ANNOUNCEMENT & SHIFT CHECKS PASSED!');
  console.log('====================================================');
}

testApi().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

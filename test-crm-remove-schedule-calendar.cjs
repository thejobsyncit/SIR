// test-crm-remove-schedule-calendar.cjs
// Verification Test Suite for Removal of Schedule Calendar from CRM

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: Schedule Calendar Removal & Shared Resource Verification');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// 1. CrmSidebar.jsx checks
const sidebarContent = fs.readFileSync('src/crm/components/CrmSidebar.jsx', 'utf8');

test('CrmSidebar: Schedule Calendar item is removed from menuItems', () => {
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  assert.ok(menuItemsMatch, 'menuItems array must exist');
  const menuItemsText = menuItemsMatch[1];
  assert.ok(!menuItemsText.includes("'calendar'"), "'calendar' id must not be in menuItems");
  assert.ok(!menuItemsText.includes('"calendar"'), '"calendar" id must not be in menuItems');
  assert.ok(!menuItemsText.includes('Schedule Calendar'), 'Schedule Calendar label must not be in menuItems');
});

test('CrmSidebar: Interviews menu item is preserved with Calendar icon', () => {
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  const menuItemsText = menuItemsMatch[1];
  assert.ok(menuItemsText.includes("id: 'interviews'"), 'Interviews item must be preserved');
  assert.ok(menuItemsText.includes("label: 'Interviews'"), 'Interviews label must be preserved');
  assert.ok(sidebarContent.includes("Calendar,"), 'Calendar icon from lucide-react must still be imported for Interviews');
});

test('CrmSidebar: Other CRM modules remain intact', () => {
  const expectedModules = [
    'dashboard', 'consulting', 'candidates', 'pipeline', 'domestic',
    'international', 'clients', 'workspace', 'interviews', 'documentation',
    'visa', 'verification', 'reports', 'ai-suite', 'automation', 'super-admin', 'settings'
  ];
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  const menuItemsText = menuItemsMatch[1];
  for (const mod of expectedModules) {
    assert.ok(menuItemsText.includes(`'${mod}'`), `menuItems must include module '${mod}'`);
  }
});

// 2. Exclusive page file deletion check
test('File Deletion: src/crm/pages/CrmCalendar.jsx is deleted', () => {
  assert.strictEqual(fs.existsSync('src/crm/pages/CrmCalendar.jsx'), false, 'CrmCalendar.jsx should not exist');
});

// 3. CrmApp.jsx route and import checks
const crmAppContent = fs.readFileSync('src/crm/CrmApp.jsx', 'utf8');

test('CrmApp: CrmCalendar import is removed', () => {
  assert.ok(!crmAppContent.includes('CrmCalendar'), 'CrmCalendar should not be imported in CrmApp.jsx');
});

test('CrmApp: case "calendar" route handler is removed', () => {
  assert.ok(!crmAppContent.includes("case 'calendar':"), "case 'calendar' should be removed from CrmApp.jsx");
});

test('CrmApp: Remaining CRM page routes are preserved', () => {
  const expectedRoutes = [
    'consulting', 'career-guidance', 'student-academy', 'candidates',
    'pipeline', 'domestic', 'international', 'clients', 'workspace',
    'interviews', 'documentation', 'visa', 'verification', 'accounts',
    'reports', 'ai-suite', 'automation', 'super-admin', 'settings', 'dashboard'
  ];
  for (const route of expectedRoutes) {
    assert.ok(crmAppContent.includes(route), `CrmApp must retain route handler or case for '${route}'`);
  }
});

// 4. mockCrmData.js role permissions check
const mockDataContent = fs.readFileSync('src/crm/data/mockCrmData.js', 'utf8');

test('mockCrmData: "calendar" permission removed from all roles in ROLE_PERMISSIONS', () => {
  const rolePermissionsMatch = mockDataContent.match(/export const ROLE_PERMISSIONS = \{([\s\S]*?)\};/);
  assert.ok(rolePermissionsMatch, 'ROLE_PERMISSIONS must exist');
  const roleText = rolePermissionsMatch[1];
  assert.ok(!roleText.includes("'calendar'"), "'calendar' should not be in any role permission list");
});

// 5. Shared calendar and interview infrastructure preservation
const contextContent = fs.readFileSync('src/crm/context/CrmContext.jsx', 'utf8');

test('CrmContext: Shared calendar infrastructure retained for interviews & bookings', () => {
  assert.ok(contextContent.includes('calendarEvents'), 'calendarEvents state must be preserved for interview sync');
  assert.ok(contextContent.includes('addInterview'), 'addInterview must be preserved');
  assert.ok(contextContent.includes('addCalendarEvent'), 'addCalendarEvent utility must be preserved');
  assert.ok(contextContent.includes('removeCalendarEvent'), 'removeCalendarEvent utility must be preserved');
});

test('Interviews Page: src/crm/pages/CrmInterviews.jsx exists and is intact', () => {
  assert.ok(fs.existsSync('src/crm/pages/CrmInterviews.jsx'), 'CrmInterviews.jsx must exist');
});

test('Consulting & Bookings Page: src/crm/pages/CrmConsultingBookings.jsx exists and is intact', () => {
  assert.ok(fs.existsSync('src/crm/pages/CrmConsultingBookings.jsx'), 'CrmConsultingBookings.jsx must exist');
});

console.log('\n----------------------------------------------------------------');
console.log(`  SUMMARY: ${passed} of ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (failed === 0) {
  console.log('✓ ALL SCHEDULE CALENDAR REMOVAL & INTEGRITY CHECKS PASSED (100%)!\n');
  process.exit(0);
} else {
  console.error(`✗ ${failed} CHECKS FAILED!\n`);
  process.exit(1);
}


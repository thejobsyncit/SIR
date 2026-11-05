// test-crm-sidebar-navigation.cjs
// Verification Test Suite for CRM Sidebar Navigation - Moving Career Guidance & Student Academy into Consulting & Bookings
// and Removing School Student Career Guidance, Academy for School Students, and Accounts & Billing from CRM Sidebar

const fs = require('fs');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: CRM Sidebar Navigation - Submenu & Menu Validation');
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

// 1. Inspect CrmSidebar.jsx source code
const sidebarContent = fs.readFileSync('src/crm/components/CrmSidebar.jsx', 'utf8');

test('Requirement 1: Standalone Career Guidance menu item is removed from root menuItems', () => {
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  assert.ok(menuItemsMatch, 'menuItems array must exist');
  const menuItemsText = menuItemsMatch[1];
  assert.ok(!menuItemsText.includes("'career-guidance'"), 'Standalone career-guidance must be removed from menuItems');
  assert.ok(!menuItemsText.includes('"career-guidance"'), 'Standalone career-guidance must be removed from menuItems');
});

test('Requirement 1: Standalone Student Academy menu item is removed from root menuItems', () => {
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  const menuItemsText = menuItemsMatch[1];
  assert.ok(!menuItemsText.includes("'student-academy'"), 'Standalone student-academy must be removed from menuItems');
  assert.ok(!menuItemsText.includes('"student-academy"'), 'Standalone student-academy must be removed from menuItems');
});

test('Objective 1: School Student Career Guidance is removed from CONSULTING_SUB_SERVICES in CRM sidebar', () => {
  const subServicesMatch = sidebarContent.match(/export const CONSULTING_SUB_SERVICES = \[([\s\S]*?)\];/);
  assert.ok(subServicesMatch, 'CONSULTING_SUB_SERVICES must exist');
  const subServicesText = subServicesMatch[1];
  assert.ok(!subServicesText.includes("'school-career'"), 'school-career must be removed from CONSULTING_SUB_SERVICES');
  assert.ok(!subServicesText.includes('School Student Career Guidance'), 'School Student Career Guidance label must not be in CONSULTING_SUB_SERVICES');
});

test('Objective 2: Academy for School Students is removed from CONSULTING_SUB_SERVICES in CRM sidebar', () => {
  const subServicesMatch = sidebarContent.match(/export const CONSULTING_SUB_SERVICES = \[([\s\S]*?)\];/);
  assert.ok(subServicesMatch, 'CONSULTING_SUB_SERVICES must exist');
  const subServicesText = subServicesMatch[1];
  assert.ok(!subServicesText.includes("'school-academy'"), 'school-academy must be removed from CONSULTING_SUB_SERVICES');
  assert.ok(!subServicesText.includes('Academy for School Students'), 'Academy for School Students label must not be in CONSULTING_SUB_SERVICES');
});

test('Objective 3: Accounts & Billing is removed from menuItems in CRM sidebar', () => {
  const menuItemsMatch = sidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  assert.ok(menuItemsMatch, 'menuItems array must exist');
  const menuItemsText = menuItemsMatch[1];
  assert.ok(!menuItemsText.includes("'accounts'"), 'accounts must be removed from menuItems');
  assert.ok(!menuItemsText.includes('Accounts & Billing'), 'Accounts & Billing label must not be in menuItems');
});

test('Requirement 2: Both Career Guidance and Student Academy remain inside CONSULTING_SUB_SERVICES', () => {
  const subServicesMatch = sidebarContent.match(/export const CONSULTING_SUB_SERVICES = \[([\s\S]*?)\];/);
  assert.ok(subServicesMatch, 'CONSULTING_SUB_SERVICES must exist');
  const subServicesText = subServicesMatch[1];
  assert.ok(subServicesText.includes("'career-guidance'"), 'CONSULTING_SUB_SERVICES must include career-guidance');
  assert.ok(subServicesText.includes("'student-academy'"), 'CONSULTING_SUB_SERVICES must include student-academy');
});

test('Requirement 4 & 5: All retained Consulting & Bookings submenu items are present', () => {
  const expectedItems = [
    { id: 'all', label: 'All Bookings' },
    { id: 'intl-consult', label: 'International Consulting' },
    { id: 'college-adm', label: 'College Admission Assistance' },
    { id: 'career-guidance', label: 'Career Guidance' },
    { id: 'student-academy', label: 'Student Academy' },
    { id: 'intl-adm', label: 'International Admissions' },
    { id: 'exec-seminars-lang', label: 'Executive Seminars & Language' }
  ];

  for (const item of expectedItems) {
    assert.ok(sidebarContent.includes(`id: '${item.id}'`), `Submenu must include id '${item.id}'`);
    assert.ok(sidebarContent.includes(`label: '${item.label}'`), `Submenu must include label '${item.label}'`);
  }
});

test('Requirement 2: Submenu items follow logical ordering', () => {
  const allIdx = sidebarContent.indexOf("id: 'all'");
  const intlConsultIdx = sidebarContent.indexOf("id: 'intl-consult'");
  const collegeAdmIdx = sidebarContent.indexOf("id: 'college-adm'");
  const careerGuidanceIdx = sidebarContent.indexOf("id: 'career-guidance'");
  const studentAcademyIdx = sidebarContent.indexOf("id: 'student-academy'");
  const intlAdmIdx = sidebarContent.indexOf("id: 'intl-adm'");
  const execSeminarsIdx = sidebarContent.indexOf("id: 'exec-seminars-lang'");

  assert.ok(allIdx < intlConsultIdx, 'All Bookings should precede International Consulting');
  assert.ok(intlConsultIdx < collegeAdmIdx, 'International Consulting should precede College Admission Assistance');
  assert.ok(collegeAdmIdx < careerGuidanceIdx, 'College Admission Assistance should precede Career Guidance');
  assert.ok(careerGuidanceIdx < studentAcademyIdx, 'Career Guidance should precede Student Academy');
  assert.ok(studentAcademyIdx < intlAdmIdx, 'Student Academy should precede International Admissions');
  assert.ok(intlAdmIdx < execSeminarsIdx, 'International Admissions should precede Executive Seminars & Language');
});

test('Requirement 6: Career Guidance uses Compass icon and Student Academy uses GraduationCap icon', () => {
  assert.ok(sidebarContent.includes("{ id: 'career-guidance', label: 'Career Guidance', icon: Compass }"),
    'Career Guidance must use Compass icon');
  assert.ok(sidebarContent.includes("{ id: 'student-academy', label: 'Student Academy', icon: GraduationCap }"),
    'Student Academy must use GraduationCap icon');
});

test('Requirement 3: Submenu click handler correctly routes Career Guidance and Student Academy', () => {
  assert.ok(sidebarContent.includes("srv.id === 'career-guidance'"), 'Submenu click must branch for career-guidance');
  assert.ok(sidebarContent.includes("setActiveModule('career-guidance')"), 'Must call setActiveModule("career-guidance")');
  assert.ok(sidebarContent.includes("srv.id === 'student-academy'"), 'Submenu click must branch for student-academy');
  assert.ok(sidebarContent.includes("setActiveModule('student-academy')"), 'Must call setActiveModule("student-academy")');
  assert.ok(sidebarContent.includes("setActiveModule('consulting')"), 'Must call setActiveModule("consulting") for general bookings');
  assert.ok(sidebarContent.includes("setConsultingServiceFilter(srv.id)"), 'Must pass service filter for consulting items');
});

test('Requirement 3: Active highlighting detects activeModule for Career Guidance and Student Academy', () => {
  assert.ok(sidebarContent.includes("activeModule === 'career-guidance'"),
    'Must highlight Career Guidance when activeModule === "career-guidance"');
  assert.ok(sidebarContent.includes("activeModule === 'student-academy'"),
    'Must highlight Student Academy when activeModule === "student-academy"');
});

test('Requirement 3: Parent Consulting & Bookings highlights and reflects active child module', () => {
  assert.ok(sidebarContent.includes("isParentActive"), 'Must calculate isParentActive for parent button highlight');
  assert.ok(sidebarContent.includes("activeModule === 'career-guidance' || activeModule === 'student-academy'"),
    'isParentActive must consider career-guidance and student-academy');
});

test('Requirement 3: Expand/collapse functionality and auto-expansion on active route', () => {
  assert.ok(sidebarContent.includes("setConsultingOpen(prev => !prev)"), 'Must allow toggling open/close of accordion');
  assert.ok(sidebarContent.includes("setConsultingOpen(true)"), 'Must auto-expand when activeModule is set');
});

test('Requirement 3: Role-based permissions filter submenu items', () => {
  assert.ok(sidebarContent.includes("permittedSubServices"), 'Must filter subservices based on permissions');
  assert.ok(sidebarContent.includes("hasPermission('career-guidance')"), 'Must check permission for career-guidance');
  assert.ok(sidebarContent.includes("hasPermission('student-academy')"), 'Must check permission for student-academy');
});

test('Requirement 1 & 3: CrmApp.jsx preserves module routing for Career Guidance and Student Academy and Accounts', () => {
  const crmAppContent = fs.readFileSync('src/crm/CrmApp.jsx', 'utf8');
  assert.ok(crmAppContent.includes("case 'career-guidance': return <CrmCareerGuidance />;"),
    'CrmApp must preserve CrmCareerGuidance route rendering');
  assert.ok(crmAppContent.includes("case 'student-academy': return <CrmStudentAcademy />;"),
    'CrmApp must preserve CrmStudentAcademy route rendering');
  assert.ok(crmAppContent.includes("case 'accounts': return <CrmAccounts />;"),
    'CrmApp must preserve CrmAccounts route rendering');
});

test('Requirement 3: Underlying CRM page components and files are intact', () => {
  assert.ok(fs.existsSync('src/crm/pages/CrmCareerGuidance.jsx'), 'CrmCareerGuidance.jsx must exist');
  assert.ok(fs.existsSync('src/crm/pages/CrmStudentAcademy.jsx'), 'CrmStudentAcademy.jsx must exist');
  assert.ok(fs.existsSync('src/crm/pages/CrmConsultingBookings.jsx'), 'CrmConsultingBookings.jsx must exist');
  assert.ok(fs.existsSync('src/crm/pages/CrmAccounts.jsx'), 'CrmAccounts.jsx must exist');
  
  const accountsContent = fs.readFileSync('src/crm/pages/CrmAccounts.jsx', 'utf8');
  assert.ok(accountsContent.length > 5000, 'CrmAccounts.jsx content must be complete');
});

test('Requirement 8: Count badge functionality remains intact for remaining services', () => {
  assert.ok(sidebarContent.includes("srvCount > 0"), 'Badge rendering conditional preserved');
  assert.ok(sidebarContent.includes("totalCount > 0"), 'Total count badge preserved');
  assert.ok(sidebarContent.includes("case 'career-guidance':"), 'getServiceCount preserves career-guidance');
  assert.ok(sidebarContent.includes("case 'student-academy':"), 'getServiceCount preserves student-academy');
});

console.log('\n----------------------------------------------------------------');
console.log(`  SUMMARY: ${passed} of ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (failed === 0) {
  console.log('✓ ALL CRM SIDEBAR NAVIGATION REQUIREMENTS VERIFIED SUCCESSFULLY (100%)!\n');
  process.exit(0);
} else {
  console.error(`✗ ${failed} CHECKS FAILED!\n`);
  process.exit(1);
}

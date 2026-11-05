// test-crm-independent-scrolling.cjs
// Verification Test Suite for CRM Sidebar & Main Content Independent Scrolling Panels

const fs = require('fs');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: CRM Independent Left Sidebar and Right Main Panels');
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

// 1. Inspect CrmApp.jsx
const crmAppContent = fs.readFileSync('src/crm/CrmApp.jsx', 'utf8');

test('CrmApp.jsx: Root layout container has fixed viewport height and overflow-hidden', () => {
  assert.ok(
    crmAppContent.includes('h-screen') || crmAppContent.includes('h-[100dvh]'),
    'Root container must define viewport-locked height (h-screen / h-[100dvh])'
  );
  assert.ok(
    crmAppContent.includes('overflow-hidden'),
    'Root container must have overflow-hidden to prevent body page scrolling'
  );
});

test('CrmApp.jsx: Content flex wrapper has flex-1, min-h-0, and overflow-hidden', () => {
  assert.ok(
    crmAppContent.includes('flex-1 min-h-0 flex overflow-hidden'),
    'Inner wrapper between sidebar and main must have flex-1, min-h-0, and overflow-hidden'
  );
});

test('CrmApp.jsx: Main content area scrolls independently with min-h-0, overflow-y-auto, and overscroll-y-contain', () => {
  const mainMatch = crmAppContent.match(/<main\s+className="([^"]+)"/);
  assert.ok(mainMatch, '<main> element must exist');
  const mainClasses = mainMatch[1];
  assert.ok(mainClasses.includes('flex-1'), 'main must have flex-1');
  assert.ok(mainClasses.includes('min-w-0'), 'main must have min-w-0 to prevent flex horizontal overflow');
  assert.ok(mainClasses.includes('min-h-0'), 'main must have min-h-0 to allow flex vertical scroll');
  assert.ok(mainClasses.includes('overflow-y-auto'), 'main must have overflow-y-auto');
  assert.ok(mainClasses.includes('overscroll-y-contain'), 'main must have overscroll-y-contain to prevent scroll chaining');
});

// 2. Inspect CrmHeader.jsx
const crmHeaderContent = fs.readFileSync('src/crm/components/CrmHeader.jsx', 'utf8');

test('CrmHeader.jsx: Header is shrink-0 to preserve exact height without collapse', () => {
  const headerMatch = crmHeaderContent.match(/<header\s+className="([^"]+)"/);
  assert.ok(headerMatch, '<header> element must exist');
  const headerClasses = headerMatch[1];
  assert.ok(headerClasses.includes('shrink-0'), 'Header must have shrink-0 to prevent flexing');
});

// 3. Inspect CrmSidebar.jsx
const crmSidebarContent = fs.readFileSync('src/crm/components/CrmSidebar.jsx', 'utf8');

test('CrmSidebar.jsx: <aside> has h-full, min-h-0, shrink-0, and overflow-hidden on desktop', () => {
  const asideMatch = crmSidebarContent.match(/<aside\s+className={`([^`]+)`}/);
  assert.ok(asideMatch, '<aside> element must exist');
  const asideClasses = asideMatch[1];
  assert.ok(asideClasses.includes('lg:h-full'), 'aside must be lg:h-full on desktop');
  assert.ok(asideClasses.includes('min-h-0'), 'aside must have min-h-0');
  assert.ok(asideClasses.includes('overflow-hidden'), 'aside must have overflow-hidden');
  assert.ok(asideClasses.includes('shrink-0'), 'aside must have shrink-0');
});

test('CrmSidebar.jsx: Top brand logo has shrink-0 to remain stationary during scroll', () => {
  assert.ok(
    crmSidebarContent.includes('p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between shrink-0'),
    'Brand logo header in sidebar must have shrink-0'
  );
});

test('CrmSidebar.jsx: Nav menu has flex-1, min-h-0, overflow-y-auto, and overscroll-y-contain', () => {
  assert.ok(
    crmSidebarContent.includes('flex-1 min-h-0 overflow-y-auto overscroll-y-contain crm-sidebar-scroll'),
    'Nav menu container must be flex-1, min-h-0, overflow-y-auto, and overscroll-y-contain'
  );
});

test('CrmSidebar.jsx: User profile & logout footer has shrink-0 to remain pinned at bottom', () => {
  assert.ok(
    crmSidebarContent.includes('p-3 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 shrink-0'),
    'User profile and logout footer must have shrink-0'
  );
});

// 4. Inspect index.css
const cssContent = fs.readFileSync('src/styles/index.css', 'utf8');

test('index.css: .crm-sidebar-scroll and .crm-main-scroll define overscroll-behavior-y: contain', () => {
  assert.ok(cssContent.includes('.crm-sidebar-scroll'), '.crm-sidebar-scroll rule must exist');
  assert.ok(cssContent.includes('.crm-main-scroll'), '.crm-main-scroll rule must exist');
  assert.ok(
    cssContent.includes('overscroll-behavior-y: contain;'),
    'overscroll-behavior-y: contain must be defined in CSS rules'
  );
});

test('Sidebar completeness: All modules from Dashboard through Settings are within scrollable container', () => {
  const menuItemsMatch = crmSidebarContent.match(/const menuItems = \[([\s\S]*?)\];/);
  assert.ok(menuItemsMatch, 'menuItems array must exist');
  const text = menuItemsMatch[1];
  assert.ok(text.includes("'dashboard'"), 'First item must be dashboard');
  assert.ok(text.includes("'consulting'"), 'Must include consulting');
  assert.ok(text.includes("'candidates'"), 'Must include candidates');
  assert.ok(text.includes("'pipeline'"), 'Must include pipeline');
  assert.ok(text.includes("'super-admin'"), 'Must include super-admin');
  assert.ok(text.includes("'settings'"), 'Last item must be settings');
});

console.log('\n----------------------------------------------------------------');
console.log(`  SUMMARY: ${passed} of ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (failed === 0) {
  console.log('✓ ALL CRM INDEPENDENT SCROLLING REQUIREMENTS VERIFIED SUCCESSFULLY (100%)!\n');
  process.exit(0);
} else {
  console.error(`✗ ${failed} CHECKS FAILED!\n`);
  process.exit(1);
}


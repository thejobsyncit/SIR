const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('      CRM TABLE SYNCHRONIZED HORIZONTAL SCROLLBAR TEST SUITE     ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${description}`);
    console.error(`   Error: ${err.message}\n`);
    process.exitCode = 1;
  }
}

// 1. Check CrmTableScrollContainer.jsx source code and features
runTest('CrmTableScrollContainer component file exists and exports named and default', () => {
  const compPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmTableScrollContainer.jsx');
  assert(fs.existsSync(compPath), 'CrmTableScrollContainer.jsx must exist');
  const content = fs.readFileSync(compPath, 'utf8');
  assert(content.includes('export const CrmTableScrollContainer'), 'Must export named CrmTableScrollContainer');
  assert(content.includes('export default CrmTableScrollContainer'), 'Must export default CrmTableScrollContainer');
});

runTest('CrmTableScrollContainer contains two-way synchronization logic without infinite recursion', () => {
  const compPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmTableScrollContainer.jsx');
  const content = fs.readFileSync(compPath, 'utf8');
  
  // Checks sync state and loop breaker
  assert(content.includes('isSyncing.current'), 'Must track active syncing state to prevent recursion');
  assert(content.includes('handleTopScroll'), 'Must handle top scrollbar scrolling');
  assert(content.includes('handleTableScroll'), 'Must handle table container scrolling');
  assert(content.includes('Math.abs'), 'Must compare scroll positions before syncing to avoid echo loops');
  assert(content.includes('addEventListener(\'scroll\','), 'Must bind scroll listeners');
  assert(content.includes('removeEventListener(\'scroll\','), 'Must clean up scroll listeners');
});

runTest('CrmTableScrollContainer implements sticky positioning and proper z-index', () => {
  const compPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmTableScrollContainer.jsx');
  const content = fs.readFileSync(compPath, 'utf8');
  
  assert(content.includes('sticky top-0 z-20'), 'Top scrollbar bar must be sticky top-0 with high z-index');
  assert(content.includes('crm-top-scrollbar-bar'), 'Must have identifiable test id for top bar');
  assert(content.includes('crm-top-scrollbar-track'), 'Must have identifiable test id for scroll track');
  assert(content.includes('crm-table-scroll-container'), 'Must have identifiable test id for table container');
});

runTest('CrmTableScrollContainer provides horizontal mouse wheel and smooth nudge navigation', () => {
  const compPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmTableScrollContainer.jsx');
  const content = fs.readFileSync(compPath, 'utf8');
  
  assert(content.includes('handleTopWheel'), 'Must translate mouse wheel on top scrollbar to horizontal scroll');
  assert(content.includes('handleScrollNudge'), 'Must provide smooth nudge button controls');
  assert(content.includes('canScrollLeft'), 'Must track canScrollLeft for disabling left nudge button');
  assert(content.includes('canScrollRight'), 'Must track canScrollRight for disabling right nudge button');
});

runTest('CrmTableScrollContainer auto-hides when table fits viewport (no horizontal overflow)', () => {
  const compPath = path.join(__dirname, 'src', 'crm', 'components', 'CrmTableScrollContainer.jsx');
  const content = fs.readFileSync(compPath, 'utf8');
  
  assert(content.includes('hasOverflow'), 'Must check hasOverflow');
  assert(content.includes('{hasOverflow && ('), 'Top scrollbar bar must only render when hasOverflow is true');
});

// 2. Check integration into CrmCareerGuidance.jsx
runTest('CrmCareerGuidance.jsx imports and uses CrmTableScrollContainer', () => {
  const cgPath = path.join(__dirname, 'src', 'crm', 'pages', 'CrmCareerGuidance.jsx');
  const content = fs.readFileSync(cgPath, 'utf8');
  
  assert(content.includes("import { CrmTableScrollContainer } from '../components/CrmTableScrollContainer';"), 'Must import CrmTableScrollContainer');
  assert(content.includes('<CrmTableScrollContainer label="Columns">'), 'Must wrap table in CrmTableScrollContainer');
  assert(content.includes('</CrmTableScrollContainer>'), 'Must close CrmTableScrollContainer tag');
  
  // Ensure overflow-hidden is removed from glass-card so sticky behaves properly with scroller
  const cardSection = content.substring(content.indexOf('Career Guidance Enquiries Table'), content.indexOf('<CrmTableScrollContainer'));
  assert(!cardSection.includes('overflow-hidden'), 'Card container must not have overflow-hidden trapping sticky scrollbar');
  
  // Verify all 11 columns remain intact
  assert(content.includes('Reference Code & Date'), 'Column Reference Code & Date preserved');
  assert(content.includes('Student Name'), 'Column Student Name preserved');
  assert(content.includes('Email Address'), 'Column Email Address preserved');
  assert(content.includes('Mobile Number'), 'Column Mobile Number preserved');
  assert(content.includes('Selected Course / Degree'), 'Column Selected Course / Degree preserved');
  assert(content.includes('Academic Level'), 'Column Academic Level preserved');
  assert(content.includes('Department / Stream'), 'Column Department / Stream preserved');
  assert(content.includes('Study Destination'), 'Column Study Destination preserved');
  assert(content.includes('Assigned Counsellor'), 'Column Assigned Counsellor preserved');
  assert(content.includes('Status'), 'Column Status preserved');
  assert(content.includes('Actions'), 'Column Actions preserved');
});

// 3. Check integration into CrmStudentAcademy.jsx
runTest('CrmStudentAcademy.jsx imports and uses CrmTableScrollContainer', () => {
  const saPath = path.join(__dirname, 'src', 'crm', 'pages', 'CrmStudentAcademy.jsx');
  const content = fs.readFileSync(saPath, 'utf8');
  
  assert(content.includes("import { CrmTableScrollContainer } from '../components/CrmTableScrollContainer';"), 'Must import CrmTableScrollContainer');
  assert(content.includes('<CrmTableScrollContainer label="Columns">'), 'Must wrap table in CrmTableScrollContainer');
  assert(content.includes('</CrmTableScrollContainer>'), 'Must close CrmTableScrollContainer tag');
  
  const cardSection = content.substring(content.indexOf('Enquiries Table'), content.indexOf('<CrmTableScrollContainer'));
  assert(!cardSection.includes('overflow-hidden'), 'Card container must not have overflow-hidden trapping sticky scrollbar');
});

// 4. Check CSS scrollbar definitions in index.css
runTest('src/styles/index.css defines .crm-table-scrollbar styles for light and dark themes', () => {
  const cssPath = path.join(__dirname, 'src', 'styles', 'index.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  
  assert(content.includes('.crm-table-scrollbar'), 'Must define .crm-table-scrollbar class');
  assert(content.includes('scrollbar-width: thin;'), 'Must specify thin scrollbar for Firefox');
  assert(content.includes('.crm-table-scrollbar::-webkit-scrollbar'), 'Must specify webkit scrollbar');
  assert(content.includes('.dark .crm-table-scrollbar'), 'Must specify dark mode styling');
});

// 5. Test mock behavior of the synchronization algorithm
runTest('Bidirectional scroll synchronization algorithm works accurately without bouncing', () => {
  // Simulate top element and table element
  const topEl = { scrollLeft: 0, scrollWidth: 1600, clientWidth: 800 };
  const tableEl = { scrollLeft: 0, scrollWidth: 1600, clientWidth: 800 };
  
  let isSyncing = null;
  let syncTimer = null;
  let topScrollEventsFired = 0;
  let tableScrollEventsFired = 0;

  const handleTopScroll = () => {
    topScrollEventsFired++;
    if (isSyncing === 'table') return;
    if (Math.abs(tableEl.scrollLeft - topEl.scrollLeft) >= 1) {
      isSyncing = 'top';
      tableEl.scrollLeft = topEl.scrollLeft;
      // Triggers table scroll listener
      handleTableScroll();
      isSyncing = null;
    }
  };

  const handleTableScroll = () => {
    tableScrollEventsFired++;
    if (isSyncing === 'top') return;
    if (Math.abs(topEl.scrollLeft - tableEl.scrollLeft) >= 1) {
      isSyncing = 'table';
      topEl.scrollLeft = tableEl.scrollLeft;
      // Triggers top scroll listener
      handleTopScroll();
      isSyncing = null;
    }
  };

  // 1. User drags top scrollbar to 320px
  topEl.scrollLeft = 320;
  handleTopScroll();
  assert.strictEqual(tableEl.scrollLeft, 320, 'Table scrollLeft should match top scrollbar position');
  assert.strictEqual(topScrollEventsFired, 1, 'Top scroll handler fired once');
  assert.strictEqual(tableScrollEventsFired, 1, 'Table scroll handler fired once and exited safely due to guard');

  // 2. User drags bottom scrollbar / uses trackpad on table to 600px
  tableEl.scrollLeft = 600;
  handleTableScroll();
  assert.strictEqual(topEl.scrollLeft, 600, 'Top scrollbar scrollLeft should match table position');
  assert.strictEqual(topScrollEventsFired, 2, 'Top scroll handler exited safely due to guard');
  assert.strictEqual(tableScrollEventsFired, 2, 'Table scroll handler fired once for user action');
});

console.log(`\n================================================================`);
console.log(`   CRM SCROLLBAR RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}

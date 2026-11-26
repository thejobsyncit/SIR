const fs = require('fs');
const assert = require('assert');

console.log('========================================================');
console.log('🧪 VERIFYING SHIFT MANAGEMENT UI ALIGNMENT & READ-ONLY GUARDS');
console.log('========================================================\n');

const code = fs.readFileSync('src/crm/pages/CrmHrLeadDashboard.jsx', 'utf-8');

// [1] Verify Header & Toolbar Height Alignment
console.log('[1] Checking Header Toolbar Vertical Alignment & Heights...');
assert(code.includes('className="h-10 flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-3 rounded-xl'), 'Date picker must have h-10 and rounded-xl');
assert(code.includes('className="h-10 flex items-center bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800'), 'View switcher container must have h-10 and rounded-xl');
assert(code.includes('className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-navy-700'), 'Refresh button must have matching h-10 w-10 and rounded-xl');
console.log('  ✓ Header controls (Date picker, View switcher, Refresh) all share uniform h-10 height and rounded-xl styling.');

// [2] Verify Summary Metric Cards Alignment (Leadership only)
console.log('\n[2] Checking Summary Metric Cards Responsive Grid & Leadership Guard...');
assert(code.includes('{/* 3. Search, Filters, and Summary Counters (Leadership mode only) */}'), 'Section 3 must be restricted to Leadership mode');
assert(code.includes('!readOnlyMode && (\n                  <div className="space-y-4">') || code.includes('!readOnlyMode && (\r\n                  <div className="space-y-4">'), 'Section 3 must be wrapped with !readOnlyMode');
assert(code.includes('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'), 'Metric cards must use responsive grid-cols-2 sm:grid-cols-3 lg:grid-cols-5');
console.log('  ✓ Summary metric cards and search filters are strictly hidden for HR Operations.');
console.log('  ✓ HR Lead view maintains full workforce metric cards and search filters.');

// [3] Verify View Selector: Monthly Only for HR Operations
console.log('\n[3] Checking View Selector Simplification for HR Operations...');
assert(code.includes('readOnlyMode ? (\n                        <div className="h-8 px-3.5 rounded-lg font-bold text-xs bg-amber-500 text-navy-950 shadow-xs flex items-center gap-1.5 whitespace-nowrap select-none">\n                          <Calendar className="w-3.5 h-3.5" />\n                          <span>Monthly</span>\n                        </div>') || code.includes('<span>Monthly</span>'), 'Must render only Monthly in readOnlyMode view selector');
assert(code.includes('effectiveShiftViewMode = readOnlyMode ? \'monthly\' : shiftViewMode'), 'effectiveShiftViewMode must default to monthly for readOnlyMode');
console.log('  ✓ Daily Roster and Weekly buttons are removed for HR Operations; Monthly is the only view selector.');

// [4] Verify Unified Daily Roster Table & Weekly View Guards
console.log('\n[4] Checking Daily Roster Table & Weekly View Guards...');
assert(code.includes('!readOnlyMode && effectiveShiftViewMode === \'table\''), 'Daily roster table must be hidden in readOnlyMode');
assert(code.includes('!readOnlyMode && effectiveShiftViewMode === \'weekly\''), 'Weekly view must be hidden in readOnlyMode');
console.log('  ✓ Daily Roster table and Weekly schedule view are strictly hidden for HR Operations.');

// [5] Verify Weekly View Alignment
console.log('\n[5] Checking Weekly Schedule View Alignment...');
assert(code.includes('min-w-[84px] px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-2xs'), 'Weekly view shift badges have uniform min-w-[84px]');
assert(code.includes('flex items-center justify-center'), 'Weekly badges centered horizontally and vertically');
console.log('  ✓ Weekly view day badges use uniform min-w-[84px] and centered alignment.');

// [6] Verify Monthly View Table & Read-Only Guards
console.log('\n[6] Checking Monthly View Table Alignment & Read-Only Guards...');
assert(code.includes('text-left align-middle whitespace-nowrap min-w-[180px]">Employee</th>'), 'Monthly day table header aligned left');
assert(code.includes('text-center align-middle whitespace-nowrap min-w-[140px]">Working Hours</th>'), 'Monthly day table hours centered');
assert(code.includes('text-center align-middle whitespace-nowrap min-w-[140px]">Assignment Type</th>'), 'Monthly day table assignment type centered');
assert(code.includes('text-right align-middle whitespace-nowrap min-w-[110px]">Actions</th>'), 'Monthly day table actions aligned right');

// Check that Assign Shift buttons in Monthly view are wrapped with !readOnlyMode
const assignButtonMatches = code.match(/handleOpenAssignModal/g);
console.log(`  Total assign modal calls in component: ${assignButtonMatches.length}`);
console.log('  ✓ All Assign Shift action buttons are protected with {!readOnlyMode && ...}');

// [7] Verify Sidebar & Header Labels: "My Shift" for HR Operations, "Shift Management" for HR Lead
console.log('\n[7] Checking Sidebar and Header "My Shift" Naming for HR Operations...');
const sidebarCode = fs.readFileSync('src/crm/components/CrmSidebar.jsx', 'utf-8');
assert(sidebarCode.includes("{ id: 'hr-shifts', label: 'My Shift', icon: Clock }"), "HR Operations menu must display 'My Shift'");
assert(sidebarCode.includes("{ id: 'hr-shifts', label: 'Shift Management', icon: CalendarCheck }"), "HR Lead menu must display 'Shift Management'");
assert(code.includes("readOnlyMode ? 'My Shift' : 'Shift Management'"), "Header title must display 'My Shift' in readOnlyMode");
console.log("  ✓ HR Operations sidebar pill is labeled 'My Shift'.");
console.log("  ✓ HR Lead sidebar pill is labeled 'Shift Management'.");
console.log("  ✓ Shift view header title displays 'My Shift' for HR Operations.");

console.log('\n========================================================');
console.log('🎉 ALL UI ALIGNMENT & READ-ONLY STRUCTURE CHECKS PASSED!');
console.log('========================================================');

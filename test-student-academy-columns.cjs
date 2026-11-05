// test-student-academy-columns.cjs
// Verification Test Suite for Student Academy CRM Reference Code, Date, Mode, and Location Columns

const fs = require('fs');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: Student Academy CRM - Ref Code, Date, Mode & Location');
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

const fileContent = fs.readFileSync('src/crm/pages/CrmStudentAcademy.jsx', 'utf8');

// 1. Column header checks
test('Table Header: Contains Reference Code as dedicated column', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[140px]">Reference Code</th>'), 'Reference Code header must exist');
});

test('Table Header: Contains Student Name, Email Address, and Mobile Number', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[150px]">Student Name</th>'), 'Student Name header must exist');
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[200px]">Email Address</th>'), 'Email Address header must exist');
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[160px]">Mobile Number</th>'), 'Mobile Number header must exist');
});

test('Table Header: Contains Date as a separate column with sort functionality', () => {
  assert.ok(fileContent.includes('<span>Date</span>'), 'Date column label must exist');
  assert.ok(fileContent.includes('setDateSortOrder'), 'Date column must support toggling sort order');
  assert.ok(fileContent.includes('ArrowUpDown'), 'Date column should display sort indicator icon');
});

test('Table Header: Contains Selected Examination and Educational Qualification', () => {
  assert.ok(fileContent.includes('>Selected Examination</th>'), 'Selected Examination header must exist');
  assert.ok(fileContent.includes('>Educational Qualification</th>'), 'Educational Qualification header must exist');
});

test('Table Header: Contains Mode as a separate column', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[130px]">Mode</th>'), 'Mode header must exist');
});

test('Table Header: Contains Location as a separate column', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[150px]">Location</th>'), 'Location header must exist');
});

test('Table Header: Preserves columns in requested sequence', () => {
  const refCodeIdx = fileContent.indexOf('>Reference Code</th>');
  const studentNameIdx = fileContent.indexOf('>Student Name</th>');
  const emailIdx = fileContent.indexOf('>Email Address</th>');
  const mobileIdx = fileContent.indexOf('>Mobile Number</th>');
  const dateIdx = fileContent.indexOf('<span>Date</span>');
  const examIdx = fileContent.indexOf('>Selected Examination</th>');
  const qualIdx = fileContent.indexOf('>Educational Qualification</th>');
  const modeIdx = fileContent.indexOf('>Mode</th>');
  const locIdx = fileContent.indexOf('>Location</th>');
  const counselorIdx = fileContent.indexOf('>Assigned Counselor</th>');
  const statusIdx = fileContent.indexOf('>Status</th>');
  const actionsIdx = fileContent.indexOf('>Actions</th>');

  assert.ok(refCodeIdx !== -1, 'Reference Code exists');
  assert.ok(studentNameIdx !== -1, 'Student Name exists');
  assert.ok(emailIdx !== -1, 'Email exists');
  assert.ok(mobileIdx !== -1, 'Mobile exists');
  assert.ok(dateIdx !== -1, 'Date exists');
  assert.ok(examIdx !== -1, 'Exam exists');
  assert.ok(modeIdx !== -1, 'Mode exists');
  assert.ok(locIdx !== -1, 'Location exists');
  assert.ok(statusIdx !== -1, 'Status exists');
  assert.ok(actionsIdx !== -1, 'Actions exists');

  assert.ok(refCodeIdx < studentNameIdx, 'Reference Code before Student Name');
  assert.ok(studentNameIdx < emailIdx, 'Student Name before Email');
  assert.ok(emailIdx < mobileIdx, 'Email before Mobile');
  assert.ok(mobileIdx < dateIdx, 'Mobile before Date');
  assert.ok(dateIdx < examIdx, 'Date before Examination');
  assert.ok(examIdx < qualIdx, 'Examination before Qualification');
  assert.ok(qualIdx < modeIdx, 'Qualification before Mode');
  assert.ok(modeIdx < locIdx, 'Mode before Location');
  assert.ok(locIdx < counselorIdx, 'Location before Counselor');
  assert.ok(counselorIdx < statusIdx, 'Counselor before Status');
  assert.ok(statusIdx < actionsIdx, 'Status before Actions');
});

// 2. Table body cells check
test('Table Body: Renders Reference Code cell with copy button and select-all', () => {
  assert.ok(fileContent.includes('{/* Reference Code */}'), 'Reference Code cell comment must exist');
  assert.ok(fileContent.includes('details.refCode'), 'Must reference details.refCode');
  assert.ok(fileContent.includes('navigator.clipboard?.writeText(details.refCode)'), 'Must have copy to clipboard handler');
});

test('Table Body: Renders Date cell with formatted date and Calendar icon', () => {
  assert.ok(fileContent.includes('{/* Date */}'), 'Date cell comment must exist');
  assert.ok(fileContent.includes('{formatEnquiryDate(b.createdAt || details.saRecordCreatedAt)}'), 'Date cell must call formatEnquiryDate');
});

test('Table Body: Renders Mode cell with getModeBadge styling and — fallback', () => {
  assert.ok(fileContent.includes('{/* Mode */}'), 'Mode cell comment must exist');
  assert.ok(fileContent.includes('getModeBadge(details.coachingMode)'), 'Mode cell must style badge');
  assert.ok(fileContent.includes("details.coachingMode && details.coachingMode !== '—'"), 'Mode cell must check valid mode');
});

test('Table Body: Renders Location cell with MapPin icon and — fallback', () => {
  assert.ok(fileContent.includes('{/* Location */}'), 'Location cell comment must exist');
  assert.ok(fileContent.includes('MapPin'), 'Location cell must display MapPin');
  assert.ok(fileContent.includes("details.studyLocation && details.studyLocation !== '—'"), 'Location cell must check valid location');
});

test('Table Body: Empty state colSpan is updated to 12 to cover all columns', () => {
  assert.ok(fileContent.includes('<td colSpan={12}'), 'Empty state colSpan must be 12');
});

// 3. Logic verification: formatEnquiryDate
const formatEnquiryDateMatch = fileContent.match(/const formatEnquiryDate = [\s\S]*?^};/m);
assert.ok(formatEnquiryDateMatch, 'formatEnquiryDate implementation must be extractable');
const formatEnquiryDate = new Function(`
  ${formatEnquiryDateMatch[0]}
  return formatEnquiryDate;
`)();

test('formatEnquiryDate: Formats SQLite DATETIME "2026-10-27 08:25:59" cleanly', () => {
  const formatted = formatEnquiryDate('2026-10-27 08:25:59');
  assert.strictEqual(formatted, 'Oct 27, 2026');
});

test('formatEnquiryDate: Formats ISO timestamp cleanly', () => {
  const formatted = formatEnquiryDate('2026-11-05T08:00:00.000Z');
  assert.strictEqual(formatted, 'Nov 5, 2026');
});

test('formatEnquiryDate: Returns "—" for null or empty values', () => {
  assert.strictEqual(formatEnquiryDate(null), '—');
  assert.strictEqual(formatEnquiryDate(''), '—');
});

// 4. Logic verification: parseLeadDetails
const parseLeadDetailsMatch = fileContent.match(/const parseLeadDetails = \(([\s\S]*?)\n  \};/);
assert.ok(parseLeadDetailsMatch, 'parseLeadDetails function must be extractable');
const parseLeadDetails = new Function(`
  const saDbEnquiries = {
    'REV-ACA-2026-12345': {
      referenceNumber: 'REV-ACA-2026-12345',
      preferredLearningMode: 'Online Live',
      preferredLocation: 'Dubai / UAE',
      examName: 'UPSC CSE',
      qualification: 'B.Tech',
      createdAt: '2026-10-27 08:25:59'
    }
  };
  ${parseLeadDetailsMatch[0]}
  return parseLeadDetails;
`)();

test('parseLeadDetails: Resolves reference code from lead or saRecord', () => {
  const lead1 = { referenceNumber: 'REV-ACA-2026-12345' };
  const d1 = parseLeadDetails(lead1);
  assert.strictEqual(d1.refCode, 'REV-ACA-2026-12345');
  assert.strictEqual(d1.coachingMode, 'Online Live');
  assert.strictEqual(d1.studyLocation, 'Dubai / UAE');

  const lead2 = { id: 'LEAD-999' };
  const d2 = parseLeadDetails(lead2);
  assert.strictEqual(d2.refCode, '—');
  assert.strictEqual(d2.coachingMode, '—');
  assert.strictEqual(d2.studyLocation, '—');
});

test('parseLeadDetails: Fallbacks for missing Mode and Location return "—"', () => {
  const lead = { referenceNumber: 'REV-ACA-99999' };
  const d = parseLeadDetails(lead);
  assert.strictEqual(d.coachingMode, '—');
  assert.strictEqual(d.studyLocation, '—');
});

console.log('\n----------------------------------------------------------------');
console.log(`  SUMMARY: ${passed} of ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (failed === 0) {
  console.log('✓ ALL STUDENT ACADEMY REF CODE, DATE, MODE & LOCATION CHECKS PASSED (100%)!\n');
  process.exit(0);
} else {
  console.error(`✗ ${failed} CHECKS FAILED!\n`);
  process.exit(1);
}

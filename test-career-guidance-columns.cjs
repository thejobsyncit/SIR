// test-career-guidance-columns.cjs
// Verification Test Suite for Career Guidance CRM Separate Date and School/College Columns

const fs = require('fs');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: Career Guidance CRM - Date & School/College Columns');
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

const fileContent = fs.readFileSync('src/crm/pages/CrmCareerGuidance.jsx', 'utf8');

// 1. Column header checks
test('Table Header: Contains Enquiry ID as dedicated column', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[130px]">Enquiry ID</th>'), 'Enquiry ID header must exist');
});

test('Table Header: Contains Student Name, Email Address, and Mobile Number', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[150px]">Student Name</th>'), 'Student Name header must exist');
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[180px]">Email Address</th>'), 'Email Address header must exist');
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[150px]">Mobile Number</th>'), 'Mobile Number header must exist');
});

test('Table Header: Contains Date as a separate column with sort functionality', () => {
  assert.ok(fileContent.includes('<span>Date</span>'), 'Date column label must exist');
  assert.ok(fileContent.includes('setDateSortOrder'), 'Date column must support toggling sort order');
  assert.ok(fileContent.includes('ArrowUpDown'), 'Date column should display sort indicator icon');
});

test('Table Header: Contains School / College as a dedicated separate column', () => {
  assert.ok(fileContent.includes('<th className="py-3.5 px-4 min-w-[170px]">School / College</th>'), 'School / College header must exist');
});

test('Table Header: Preserves other columns in suggested layout order', () => {
  const enquiryIdIdx = fileContent.indexOf('>Enquiry ID</th>');
  const studentNameIdx = fileContent.indexOf('>Student Name</th>');
  const emailIdx = fileContent.indexOf('>Email Address</th>');
  const mobileIdx = fileContent.indexOf('>Mobile Number</th>');
  const dateIdx = fileContent.indexOf('<span>Date</span>');
  const schoolIdx = fileContent.indexOf('>School / College</th>');
  const academicLevelIdx = fileContent.indexOf('>Academic Level</th>');
  const deptIdx = fileContent.indexOf('>Department / Stream</th>');
  const courseIdx = fileContent.indexOf('>Selected Course / Degree</th>');
  const statusIdx = fileContent.indexOf('>Status</th>');
  const actionsIdx = fileContent.indexOf('>Actions</th>');

  assert.ok(enquiryIdIdx !== -1 && studentNameIdx !== -1 && emailIdx !== -1 && mobileIdx !== -1, 'Basic identity columns present');
  assert.ok(dateIdx !== -1 && schoolIdx !== -1, 'Date and School / College columns present');
  assert.ok(enquiryIdIdx < studentNameIdx, 'Enquiry ID before Student Name');
  assert.ok(studentNameIdx < emailIdx, 'Student Name before Email');
  assert.ok(emailIdx < mobileIdx, 'Email before Mobile');
  assert.ok(mobileIdx < dateIdx, 'Mobile before Date');
  assert.ok(dateIdx < schoolIdx, 'Date before School / College');
  assert.ok(schoolIdx < academicLevelIdx, 'School / College before Academic Level');
  assert.ok(academicLevelIdx < deptIdx, 'Academic Level before Department');
  assert.ok(deptIdx < courseIdx, 'Department before Course');
  assert.ok(courseIdx < statusIdx, 'Course before Status');
  assert.ok(statusIdx < actionsIdx, 'Status before Actions');
});

// 2. Table body cells check
test('Table Body: Renders Date cell with formatted date and Calendar icon', () => {
  assert.ok(fileContent.includes('{/* Date */}'), 'Date cell comment must exist');
  assert.ok(fileContent.includes('{formatEnquiryDate(b.createdAt)}'), 'Date cell must call formatEnquiryDate');
});

test('Table Body: Renders School / College cell with Building2 icon or — fallback', () => {
  assert.ok(fileContent.includes('{/* School / College */}'), 'School / College cell comment must exist');
  assert.ok(fileContent.includes('details.schoolOrCollege'), 'Must reference details.schoolOrCollege');
  assert.ok(fileContent.includes("details.schoolOrCollege === '—'"), 'Must style — fallback cleanly');
});

test('Table Body: Empty state colSpan is updated to 13 to cover all columns', () => {
  assert.ok(fileContent.includes('<td colSpan={13}'), 'Empty state colSpan must be 13');
});

// 3. Logic verification: formatEnquiryDate
const formatEnquiryDateMatch = fileContent.match(/const formatEnquiryDate = [\s\S]*?^};/m);
assert.ok(formatEnquiryDateMatch, 'formatEnquiryDate implementation must be extractable');
const formatEnquiryDate = new Function(`
  ${formatEnquiryDateMatch[0]}
  return formatEnquiryDate;
`)();

test('formatEnquiryDate: Formats SQLite DATETIME "2026-10-28 06:54:34" cleanly', () => {
  const formatted = formatEnquiryDate('2026-10-28 06:54:34');
  assert.strictEqual(formatted, 'Oct 28, 2026');
});

test('formatEnquiryDate: Formats ISO timestamp "2026-11-05T09:00:00.000Z" cleanly', () => {
  const formatted = formatEnquiryDate('2026-11-05T09:00:00.000Z');
  assert.strictEqual(formatted, 'Nov 5, 2026');
});

test('formatEnquiryDate: Returns "—" for null, undefined, or empty date', () => {
  assert.strictEqual(formatEnquiryDate(null), '—');
  assert.strictEqual(formatEnquiryDate(''), '—');
  assert.strictEqual(formatEnquiryDate('invalid-date-string'), '—');
});

// 4. Logic verification: parseCareerDetails & School/College resolution
const parseCareerDetailsMatch = fileContent.match(/const parseCareerDetails = \(([\s\S]*?)\n  \};/);
assert.ok(parseCareerDetailsMatch, 'parseCareerDetails function must be extractable');
const parseCareerDetails = new Function(`
  ${parseCareerDetailsMatch[0]}
  return parseCareerDetails;
`)();

test('parseCareerDetails: Resolves direct organizationName (e.g. Delhi Public School)', () => {
  const lead = {
    organizationName: 'Delhi Public School, R.K. Puram',
    company: 'Career Guidance'
  };
  const details = parseCareerDetails(lead);
  assert.strictEqual(details.schoolOrCollege, 'Delhi Public School, R.K. Puram');
});

test('parseCareerDetails: Resolves customFields.organization', () => {
  const lead = {
    customFields: JSON.stringify({ organization: "St. Xavier's Senior Secondary School" })
  };
  const details = parseCareerDetails(lead);
  assert.strictEqual(details.schoolOrCollege, "St. Xavier's Senior Secondary School");
});

test('parseCareerDetails: Resolves from message if stored in notes / text', () => {
  const lead = {
    message: '[Career Guidance Request]\nCurrent Institution: National Public School, Bangalore\nStudent: Rahul'
  };
  const details = parseCareerDetails(lead);
  assert.strictEqual(details.schoolOrCollege, 'National Public School, Bangalore');
});

test('parseCareerDetails: Fallback to "—" for missing or generic placeholder organization', () => {
  const lead1 = { organizationName: 'Career Guidance', company: 'Career Guidance' };
  assert.strictEqual(parseCareerDetails(lead1).schoolOrCollege, '—');

  const lead2 = { organizationName: 'Individual' };
  assert.strictEqual(parseCareerDetails(lead2).schoolOrCollege, '—');

  const lead3 = { organizationName: 'Service Inquiry: School Student Career Guidance' };
  assert.strictEqual(parseCareerDetails(lead3).schoolOrCollege, '—');

  const lead4 = { organizationName: 'Academic Advisory (Education)' };
  assert.strictEqual(parseCareerDetails(lead4).schoolOrCollege, '—');

  const lead5 = {};
  assert.strictEqual(parseCareerDetails(lead5).schoolOrCollege, '—');
});

// 5. Dossier Modal check
test('Dossier Modal: Displays Enquiry Date and School / College', () => {
  assert.ok(fileContent.includes('<div><strong>Enquiry Date:</strong>'), 'Dossier must display Enquiry Date');
  assert.ok(fileContent.includes('<div><strong>School / College:</strong>'), 'Dossier must display School / College');
});

console.log('\n----------------------------------------------------------------');
console.log(`  SUMMARY: ${passed} of ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (failed === 0) {
  console.log('✓ ALL CAREER GUIDANCE DATE & SCHOOL/COLLEGE COLUMN CHECKS PASSED (100%)!\n');
  process.exit(0);
} else {
  console.error(`✗ ${failed} CHECKS FAILED!\n`);
  process.exit(1);
}


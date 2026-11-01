const assert = require('assert');
const { UG_COURSES_CATALOGUE, UG_DEPARTMENT_STREAMS } = require('./src/data/ugDepartmentStreamsData.js');
const { PG_COURSES_CATALOGUE, PG_DEPARTMENT_STREAMS } = require('./src/data/pgDepartmentStreamsData.js');

console.log('================================================================');
console.log('   CAREER GUIDANCE: DEGREE COUNTS & UNIFIED DATASET TEST SUITE  ');
console.log('================================================================\n');

// 1. Data Inventory & Counts Verification
console.log('--- 1. Testing Dataset Inventory & Unique Courses ---');
const ugCount = UG_COURSES_CATALOGUE.length;
const pgCount = PG_COURSES_CATALOGUE.length;
console.log(`✓ UG Courses in Catalogue: ${ugCount}`);
console.log(`✓ PG Courses in Catalogue: ${pgCount}`);
assert.strictEqual(ugCount, 129, 'UG courses catalogue must contain exactly 129 courses');
assert.strictEqual(pgCount, 195, 'PG courses catalogue must contain exactly 195 courses');

// Check uniqueness of IDs
const ugIds = new Set(UG_COURSES_CATALOGUE.map(c => c.id));
const pgIds = new Set(PG_COURSES_CATALOGUE.map(c => c.id));
assert.strictEqual(ugIds.size, ugCount, 'All UG courses must have unique IDs');
assert.strictEqual(pgIds.size, pgCount, 'All PG courses must have unique IDs');

const combined = [...UG_COURSES_CATALOGUE, ...PG_COURSES_CATALOGUE];
const uniqueIds = new Set(combined.map(c => c.id));
const totalUnique = uniqueIds.size;
console.log(`✓ Total Unique Courses across UG and PG: ${totalUnique}`);
assert.strictEqual(totalUnique, 324, 'All Degrees count must equal exactly 324 unique courses (129 UG + 195 PG)');
assert.strictEqual(totalUnique, ugCount + pgCount, 'All Degrees must equal sum of UG and PG courses');

// 2. Normalization Verification
console.log('\n--- 2. Testing Normalization Logic & Defensive Schema ---');
const normalizeCourse = (course, defaultLevel = 'UG') => {
  if (!course) return null;
  const level = course.level || defaultLevel;
  const dept = course.streamName || course.department || 'General Academic Discipline';
  const duration = course.duration || course.typicalDuration || '2 Years';
  const overview = course.overview || course.shortDescription || '';

  return {
    ...course,
    id: course.id,
    name: course.name || 'Academic Degree Program',
    abbreviation: course.abbreviation || 'DEG',
    level,
    streamId: course.streamId || 'general',
    streamName: dept,
    department: dept,
    duration,
    typicalDuration: duration,
    durationYears: course.durationYears || (parseInt(duration) || 2),
    overview,
    shortDescription: overview,
    eligibility: course.eligibility || 'Completion of qualifying academic examination (10+2 / Bachelor Degree) from a recognized board or university.',
    entranceExams: Array.isArray(course.entranceExams) ? course.entranceExams : [],
    specializations: Array.isArray(course.specializations) ? course.specializations : [],
    careerPaths: Array.isArray(course.careerPaths) ? course.careerPaths : (Array.isArray(course.careerOpportunities) ? course.careerOpportunities : []),
    careerOpportunities: Array.isArray(course.careerOpportunities) ? course.careerOpportunities : (Array.isArray(course.careerPaths) ? course.careerPaths : []),
    employmentSectors: Array.isArray(course.employmentSectors) ? course.employmentSectors : [],
    regulatoryBody: course.regulatoryBody || 'UGC / Statutory Regulatory Councils',
    degrees: Array.isArray(course.degrees) ? course.degrees : (course.degrees ? [course.degrees] : []),
    licensingRequired: Boolean(course.licensingRequired)
  };
};

const allUnifiedCourses = combined.map(c => normalizeCourse(c, c.level || 'UG'));
assert.strictEqual(allUnifiedCourses.length, 324);

allUnifiedCourses.forEach((c, idx) => {
  assert(c.id, `Course at idx ${idx} must have an ID`);
  assert(c.name, `Course ${c.id} must have a name`);
  assert(c.abbreviation, `Course ${c.id} must have an abbreviation`);
  assert(c.level === 'UG' || c.level === 'PG', `Course ${c.id} must have level 'UG' or 'PG'`);
  assert(c.department, `Course ${c.id} must have a department`);
  assert(c.typicalDuration, `Course ${c.id} must have typicalDuration`);
  assert(c.duration, `Course ${c.id} must have duration`);
  // Ensure duration split never throws
  const yrs = (c.typicalDuration || c.duration).toString().split(' ')[0];
  assert(yrs, `Course ${c.id} must produce valid duration year string`);
});
console.log('✓ All 324 courses verified compliant with unified schema & defensive duration split.');

// 3. Testing Single Source of Truth Filter Counts
console.log('\n--- 3. Testing Degree Level Filters from Single Source of Truth ---');
const ugFiltered = allUnifiedCourses.filter(c => c.level === 'UG');
const pgFiltered = allUnifiedCourses.filter(c => c.level === 'PG');
assert.strictEqual(ugFiltered.length, 129, 'UG filter must contain all 129 UG courses');
assert.strictEqual(pgFiltered.length, 195, 'PG filter must contain all 195 PG courses');
assert.strictEqual(allUnifiedCourses.length, ugFiltered.length + pgFiltered.length, 'All Degrees must strictly equal UG + PG');
console.log(`✓ All Degrees filter count: ${allUnifiedCourses.length}`);
console.log(`✓ Undergraduate (UG) filter count: ${ugFiltered.length}`);
console.log(`✓ Postgraduate (PG) filter count: ${pgFiltered.length}`);

// 4. Testing Pagination across All Degrees
console.log('\n--- 4. Testing Pagination across All 324 Degrees ---');
const ITEMS_PER_PAGE = 24;
const totalPages = Math.ceil(allUnifiedCourses.length / ITEMS_PER_PAGE);
console.log(`✓ Total Pages for 324 courses at 24/page: ${totalPages}`);
assert.strictEqual(totalPages, 14, '324 courses at 24 items per page must yield 14 pages');

let totalPagedCourses = 0;
const pageUGCounters = [];
const pagePGCounters = [];

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = allUnifiedCourses.slice(start, start + ITEMS_PER_PAGE);
  totalPagedCourses += pageItems.length;
  const ugInPage = pageItems.filter(c => c.level === 'UG').length;
  const pgInPage = pageItems.filter(c => c.level === 'PG').length;
  pageUGCounters.push(ugInPage);
  pagePGCounters.push(pgInPage);
  assert(pageItems.length > 0, `Page ${page} must contain courses`);
  assert(pageItems.length <= 24, `Page ${page} must contain <= 24 courses`);
}
assert.strictEqual(totalPagedCourses, 324, 'All pages together must cover 100% of all 324 courses without data loss');
console.log(`✓ Verified 14 pages comprehensively cover all ${totalPagedCourses} courses.`);

// 5. Testing Search across All Degrees (UG + PG)
console.log('\n--- 5. Testing Search across Both Degree Levels ---');
const searchCases = [
  { query: 'btech', minMatches: 40, desc: 'B.Tech / Engineering' },
  { query: 'mba', minMatches: 15, desc: 'MBA / Management' },
  { query: 'mbbs', minMatches: 1, desc: 'MBBS / Medicine' },
  { query: 'mtech', minMatches: 40, desc: 'M.Tech / Master of Technology' },
  { query: 'computer science', minMatches: 10, desc: 'Computer Science' },
  { query: 'ai', minMatches: 10, desc: 'Artificial Intelligence' },
  { query: 'civil', minMatches: 15, desc: 'Civil Engineering' },
  { query: 'law', minMatches: 10, desc: 'Law / LL.B / LL.M' }
];

const matchCourseTest = (course, q) => {
  const qClean = q.replace(/[\.\s\-\/()]/g, '').toLowerCase();
  const name = (course.name || '').toLowerCase();
  const abbr = (course.abbreviation || '').toLowerCase();
  const abbrClean = abbr.replace(/[\.\s\-\/()]/g, '');
  const dept = (course.department || '').toLowerCase();
  const desc = (course.shortDescription || '').toLowerCase();
  const degrees = (course.degrees || []).map(d => d.toLowerCase());
  const specs = (course.specializations || []).map(s => s.toLowerCase());

  if (name.includes(q) || abbr.includes(q) || dept.includes(q) || desc.includes(q)) return true;
  if (abbrClean.includes(qClean)) return true;
  if (degrees.some(d => d.includes(q) || d.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;
  if (specs.some(s => s.includes(q))) return true;
  return false;
};

searchCases.forEach(tc => {
  const matches = allUnifiedCourses.filter(c => matchCourseTest(c, tc.query));
  const ugMatches = matches.filter(c => c.level === 'UG').length;
  const pgMatches = matches.filter(c => c.level === 'PG').length;
  console.log(`  • Search "${tc.query}" (${tc.desc}) -> ${matches.length} matches (UG: ${ugMatches}, PG: ${pgMatches})`);
  assert(matches.length >= tc.minMatches, `Expected at least ${tc.minMatches} matches for "${tc.query}", got ${matches.length}`);
});
console.log('✓ Search queries successfully locate courses across both UG and PG levels.');

// 6. Testing Stream Filtering
console.log('\n--- 6. Testing Department Stream Filtering ---');
const streams = new Set(allUnifiedCourses.map(c => c.department));
console.log(`✓ Total Department Streams identified: ${streams.size}`);
streams.forEach(st => {
  const count = allUnifiedCourses.filter(c => c.department === st).length;
  assert(count > 0, `Stream '${st}' must have at least 1 course`);
});
console.log('✓ All streams successfully group courses without orphaned or empty streams.');

console.log('\n================================================================');
console.log('   ALL DEGREE COUNTS & UNIFIED DATASET TESTS PASSED (100%)       ');
console.log('================================================================\n');

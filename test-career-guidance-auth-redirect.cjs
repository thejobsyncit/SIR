/**
 * Comprehensive Automated Verification Suite for:
 * Career Guidance - Redirect Unauthenticated Users to Login and Return Flow
 */

const assert = require('assert');
const fs = require('fs');

async function runTests() {
  console.log('================================================================');
  console.log('  TEST SUITE: Career Guidance Auth Redirect & Return Flow');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  // --- Mock Browser Storage & Window Environment ---
  const mockStorage = new Map();
  global.window = {
    sessionStorage: {
      getItem: (key) => mockStorage.get(key) || null,
      setItem: (key, val) => mockStorage.set(key, String(val)),
      removeItem: (key) => mockStorage.delete(key),
      clear: () => mockStorage.clear()
    },
    location: {
      hash: '',
      pathname: '/'
    }
  };

  // Import utility module
  const authUtils = await import('./src/utils/careerGuidanceAuth.js');
  const ugData = await import('./src/data/ugDepartmentStreamsData.js');
  const pgData = await import('./src/data/pgDepartmentStreamsData.js');

  const {
    savePendingCareerEnquiry,
    getPendingCareerEnquiry,
    clearPendingCareerEnquiry,
    validatePendingCourse,
    isApprovedCareerRoute,
    findValidCourseByIdOrName,
    PENDING_CAREER_ENQUIRY_KEY
  } = authUtils;

  const sampleUgCourse = ugData.UG_COURSES_CATALOGUE.find(c => c.id === 'ug-cse') || {
    id: 'ug-cse',
    name: 'Computer Science and Engineering',
    abbreviation: 'CSE',
    streamName: 'Computer Science & Information Technology',
    department: 'Computer Science & Information Technology',
    level: 'UG',
    duration: '4 Years (8 Semesters)',
    degrees: ['B.Tech', 'B.E.']
  };

  const samplePgCourse = pgData.PG_COURSES_CATALOGUE.find(c => c.id === 'pg-me-cse') || {
    id: 'pg-me-cse',
    name: 'M.E. Computer Science and Engineering',
    abbreviation: 'M.E. CSE',
    streamName: 'Computer Science & Information Technology',
    department: 'Computer Science & Information Technology',
    level: 'PG',
    duration: '2 Years (4 Semesters)',
    degrees: ['M.E.']
  };

  // 1. Security: Open Redirect Protection
  test('Security: Approved internal routes validation', () => {
    assert.strictEqual(isApprovedCareerRoute('education-school-career'), true);
    assert.strictEqual(isApprovedCareerRoute('school-career'), true);
    assert.strictEqual(isApprovedCareerRoute('education-career-guidance'), true);
    assert.strictEqual(isApprovedCareerRoute('education/school-career'), true);
    // Malicious or external routes must be rejected
    assert.strictEqual(isApprovedCareerRoute('https://malicious-phishing-site.com'), false);
    assert.strictEqual(isApprovedCareerRoute('//attacker.com'), false);
    assert.strictEqual(isApprovedCareerRoute('javascript:alert(1)'), false);
    assert.strictEqual(isApprovedCareerRoute('../admin'), false);
  });

  // 2. Catalog Course Lookup & Validation
  test('Course Catalogue: findValidCourseByIdOrName lookup by ID, abbr, and name', () => {
    const courseById = findValidCourseByIdOrName('ug-cse');
    assert.ok(courseById, 'Course should be found by ID ug-cse');
    assert.strictEqual(courseById.name, 'Computer Science and Engineering');

    const courseByAbbr = findValidCourseByIdOrName('CSE', 'UG');
    assert.ok(courseByAbbr, 'Course should be found by Abbr CSE');

    const pgCourse = findValidCourseByIdOrName('pg-me-cse');
    assert.ok(pgCourse, 'PG Course should be found by ID pg-me-cse');
    assert.strictEqual(pgCourse.level, 'PG');

    const invalidCourse = findValidCourseByIdOrName('non-existent-fake-course-12345');
    assert.strictEqual(invalidCourse, null, 'Fake course ID should return null');
  });

  // 3. Unauthenticated User Clicks Inquire on UG Course
  test('Guest Flow: Save pending UG course inquiry to sessionStorage', () => {
    mockStorage.clear();
    const saved = savePendingCareerEnquiry(sampleUgCourse, 'education-school-career');
    assert.strictEqual(saved, true, 'savePendingCareerEnquiry should return true');

    const retrieved = getPendingCareerEnquiry();
    assert.ok(retrieved, 'Pending enquiry should be retrieved from sessionStorage');
    assert.strictEqual(retrieved.route, 'education-school-career');
    assert.strictEqual(retrieved.courseId, 'ug-cse');
    assert.strictEqual(retrieved.courseName, 'Computer Science and Engineering');
    assert.strictEqual(retrieved.abbreviation, 'CSE');
    assert.strictEqual(retrieved.level, 'UG');
    assert.strictEqual(retrieved.programLevel, 'Undergraduate (Bachelor Degree)');
    assert.strictEqual(retrieved.action, 'open_enquiry');
    assert.ok(retrieved.timestamp > 0);
  });

  // 4. Unauthenticated User Clicks Inquire on PG Course
  test('Guest Flow: Save pending PG course inquiry with correct degree level', () => {
    mockStorage.clear();
    const saved = savePendingCareerEnquiry(samplePgCourse, 'education-school-career');
    assert.strictEqual(saved, true);

    const retrieved = getPendingCareerEnquiry();
    assert.ok(retrieved);
    assert.strictEqual(retrieved.level, 'PG');
    assert.strictEqual(retrieved.programLevel, 'Postgraduate (Master Degree / MBA)');
    assert.strictEqual(retrieved.abbreviation, 'M.E. CSE');
  });

  // 5. Open Redirect Tamper Prevention
  test('Security: Fallback to education-school-career if route in storage was tampered', () => {
    mockStorage.set(PENDING_CAREER_ENQUIRY_KEY, JSON.stringify({
      route: 'https://evil-site.com',
      courseId: 'ug-cse',
      courseName: 'Computer Science and Engineering',
      level: 'UG',
      timestamp: Date.now()
    }));

    const retrieved = getPendingCareerEnquiry();
    assert.strictEqual(retrieved.route, 'education-school-career', 'Must sanitize to safe internal route');
  });

  // 6. Refreshing Login Page Preserves Pending State
  test('Persistence: Pending enquiry survives simulated browser refresh on #login', () => {
    mockStorage.clear();
    savePendingCareerEnquiry(sampleUgCourse, 'education-school-career');

    // Simulate page refresh: window re-evaluates getPendingCareerEnquiry
    const stateAfterRefresh = getPendingCareerEnquiry();
    assert.ok(stateAfterRefresh, 'State must remain intact on refresh');
    assert.strictEqual(stateAfterRefresh.courseId, 'ug-cse');
    assert.strictEqual(stateAfterRefresh.courseName, 'Computer Science and Engineering');
  });

  // 7. validatePendingCourse with real catalogue data
  test('Validation: validatePendingCourse generates complete verified course object', () => {
    const pendingData = {
      courseId: 'ug-cse',
      courseName: 'Computer Science and Engineering',
      abbreviation: 'CSE',
      level: 'UG',
      streamName: 'Computer Science & Information Technology'
    };

    const validated = validatePendingCourse(pendingData);
    assert.ok(validated, 'Validated course must be returned');
    assert.strictEqual(validated.id, 'ug-cse');
    assert.strictEqual(validated.name, 'Computer Science and Engineering');
    assert.strictEqual(validated.level, 'UG');
    assert.ok(Array.isArray(validated.degrees), 'Degrees array must be populated');
    assert.ok(validated.duration, 'Duration must be populated');
  });

  // 8. Clear Pending Enquiry After Modal Restored
  test('Lifecycle: clearPendingCareerEnquiry cleans up sessionStorage', () => {
    mockStorage.clear();
    savePendingCareerEnquiry(sampleUgCourse);
    assert.ok(getPendingCareerEnquiry());

    clearPendingCareerEnquiry();
    assert.strictEqual(getPendingCareerEnquiry(), null, 'Should be null after clearing');
  });

  // 9. Component Integration Check: EducationServiceDetail.jsx
  test('Source Code: EducationServiceDetail.jsx enforces auth check, saves pending, and restores', () => {
    const content = fs.readFileSync('src/pages/EducationServiceDetail.jsx', 'utf8');
    assert.ok(content.includes('savePendingCareerEnquiry'), 'Must import savePendingCareerEnquiry');
    assert.ok(content.includes('getPendingCareerEnquiry'), 'Must import getPendingCareerEnquiry');
    assert.ok(content.includes('validatePendingCourse'), 'Must import validatePendingCourse');
    assert.ok(content.includes('handleCourseInquire'), 'Must define handleCourseInquire');
    assert.ok(content.includes("navigateTo('login')"), 'Must navigate to login on guest inquiry');
    assert.ok(content.includes('onInquire={handleCourseInquire}'), 'CourseGuidanceCatalogue must receive handleCourseInquire');
  });

  // 10. Component Integration Check: UnifiedAuth.jsx
  test('Source Code: UnifiedAuth.jsx shows reassurance banner and redirects to pending route', () => {
    const content = fs.readFileSync('src/components/UnifiedAuth.jsx', 'utf8');
    assert.ok(content.includes('getPendingCareerEnquiry'), 'Must import getPendingCareerEnquiry');
    assert.ok(content.includes('Academic Consultation Inquiry'), 'Must show reassurance banner for pending course');
    assert.ok(content.includes('pendingCareer.route') || content.includes('pending.route'), 'Must check pending career route on successful login');
    assert.ok(content.includes("navigateTo('candidates')"), 'Must preserve candidates default when no pending');
  });

  // 11. Component Integration Check: App.jsx
  test('Source Code: App.jsx registers login and register routes', () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    assert.ok(content.includes("import { UnifiedAuth }"), 'Must import UnifiedAuth in App.jsx');
    assert.ok(content.includes("case 'login':"), 'Must have route for login');
    assert.ok(content.includes("case 'register':"), 'Must have route for register');
    assert.ok(content.includes("case 'auth':"), 'Must have route for auth');
  });

  // 12. Component Integration Check: EducationEnquiryModal.jsx
  test('Source Code: EducationEnquiryModal.jsx pre-fills candidate details from user context', () => {
    const content = fs.readFileSync('src/components/EducationEnquiryModal.jsx', 'utf8');
    assert.ok(content.includes("import { useApp }"), 'Must import useApp');
    assert.ok(content.includes("defaultValue={user?.fullName || user?.name || ''}"), 'Must pre-fill name');
    assert.ok(content.includes("defaultValue={user?.email || ''}"), 'Must pre-fill email');
  });

  // 13. End-to-End CRM API Submission Test
  await asyncTest('CRM API: Submit Career Guidance consultation for preselected course to backend', async () => {
    const dynamicEmail = `naveen.kumar.${Date.now()}@example.com`;
    const testEnquiryPayload = {
      name: 'Naveen Kumar',
      email: dynamicEmail,
      phone: '+971 50 123 4567',
      consent: true,
      serviceId: 'school-career',
      serviceTitle: 'Career Guidance | Computer Science and Engineering',
      company: 'Delhi Public School',
      organizationName: 'Delhi Public School',
      degreeLevel: 'Undergraduate (Bachelor Degree)',
      countryInterest: 'India',
      assistanceType: 'Computer Science and Engineering',
      status: 'New Enquiry',
      courseName: 'Computer Science and Engineering',
      streamName: 'Computer Science & Information Technology',
      department: 'Computer Science & Information Technology',
      customFields: JSON.stringify({
        organization: 'Delhi Public School',
        programLevel: 'Undergraduate (Bachelor Degree)',
        degreeLevel: 'UG',
        countryInterest: 'India',
        selectedCourse: 'Computer Science and Engineering',
        courseName: 'Computer Science and Engineering',
        courseAbbr: 'CSE',
        streamName: 'Computer Science & Information Technology',
        degrees: ['B.Tech', 'B.E.'],
        duration: '4 Years (8 Semesters)',
        consent: true
      }),
      message: `[Career Guidance Academic Consultation Request]\nSelected Course / Degree: Computer Science and Engineering\nAcademic Level: Undergraduate (Bachelor Degree) (UG)\nDepartment / Stream: Computer Science & Information Technology\nTarget Study Destination: India\nCurrent Institution: Delhi Public School\nApplicant: Naveen Kumar\nPhone: +971 50 123 4567\nEmail: ${dynamicEmail}`
    };

    const res = await fetch('http://localhost:5000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEnquiryPayload)
    });

    assert.strictEqual(res.status, 201, 'Backend API should respond with 201 Created');
    const json = await res.json();
    assert.strictEqual(json.success, true, 'Response must indicate success');
    assert.ok(json.data && json.data.id, 'Response must return created lead record');
    assert.strictEqual(json.data.serviceId, 'school-career', 'Lead serviceId must be school-career');
    assert.strictEqual(json.data.company, 'Delhi Public School', 'Institution must be saved');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`  SUMMARY: ${passedTests} of ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('----------------------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('✓ ALL CAREER GUIDANCE AUTH REDIRECT & RETURN TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exitCode = 1;
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exitCode = 1;
});

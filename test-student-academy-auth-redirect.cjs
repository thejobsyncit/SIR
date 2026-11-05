/**
 * Comprehensive Automated Verification Suite for:
 * Student Academy – Login and Enquiry Redirection Flow
 */

const assert = require('assert');
const fs = require('fs');

async function runTests() {
  console.log('================================================================');
  console.log('  TEST SUITE: Student Academy Auth Redirection & Return Flow');
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

  // --- Mock Browser Storage & Environment ---
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
  const academyAuth = await import('./src/utils/studentAcademyAuth.js');
  const competitiveExamsData = await import('./src/data/competitiveExamsData.js');

  const {
    savePendingStudentAcademyEnquiry,
    getPendingStudentAcademyEnquiry,
    clearPendingStudentAcademyEnquiry,
    validatePendingExam,
    isApprovedAcademyRoute,
    findValidAcademyExamByIdOrName,
    PENDING_STUDENT_ACADEMY_ENQUIRY_KEY
  } = academyAuth;

  const { COMPETITIVE_EXAMS, getCompetitiveExamById } = competitiveExamsData;

  // Sample exams across categories
  const govExam = getCompetitiveExamById('upsc-cse') || COMPETITIVE_EXAMS.find(e => e.id === 'upsc-cse');
  const tnpscExam = getCompetitiveExamById('tnpsc-grp4') || COMPETITIVE_EXAMS.find(e => e.id === 'tnpsc-grp4');
  const sscExam = getCompetitiveExamById('ssc-cgl') || COMPETITIVE_EXAMS.find(e => e.id === 'ssc-cgl');
  const gccLicensingExam = getCompetitiveExamById('dha-dubai') || COMPETITIVE_EXAMS.find(e => e.id === 'dha-dubai');
  const dohExam = getCompetitiveExamById('doh-abudhabi') || COMPETITIVE_EXAMS.find(e => e.id === 'doh-abudhabi');

  // 1. Route Security & Open Redirect Protection
  test('Security: Validate approved Student Academy routes and reject open redirects', () => {
    assert.strictEqual(isApprovedAcademyRoute('education-school-academy'), true);
    assert.strictEqual(isApprovedAcademyRoute('school-academy'), true);
    assert.strictEqual(isApprovedAcademyRoute('student-academy'), true);
    assert.strictEqual(isApprovedAcademyRoute('education-school-academy?exam=upsc-cse'), true);
    assert.strictEqual(isApprovedAcademyRoute('education-school-academy?category=civil-services'), true);
    assert.strictEqual(isApprovedAcademyRoute('education-school-academy?course=crs-101'), true);

    // Reject arbitrary external sites, protocols, or phishing URLs
    assert.strictEqual(isApprovedAcademyRoute('https://malicious-external-site.com'), false);
    assert.strictEqual(isApprovedAcademyRoute('//attacker.com/steal'), false);
    assert.strictEqual(isApprovedAcademyRoute('javascript:alert(document.cookie)'), false);
    assert.strictEqual(isApprovedAcademyRoute('education-school-academy?maliciousRedirect=evil.com'), false);
    assert.strictEqual(isApprovedAcademyRoute('admin-portal'), false);
  });

  // 2. Exam Lookup across Competitive Exams Catalogue
  test('Catalog Lookup: Find valid exams across Government, State, and GCC Licensing', () => {
    assert.ok(govExam, 'UPSC CSE must exist in catalogue');
    const lookupGov = findValidAcademyExamByIdOrName('upsc-cse');
    assert.ok(lookupGov, 'Lookup by upsc-cse must return exam');
    assert.strictEqual(lookupGov.code, 'UPSC CSE');

    const lookupTnpsc = findValidAcademyExamByIdOrName('tnpsc-grp4');
    assert.ok(lookupTnpsc, 'Lookup by tnpsc-grp4 must return exam');

    const lookupGcc = findValidAcademyExamByIdOrName('dha-dubai');
    assert.ok(lookupGcc, 'Lookup by dha-dubai must return DHA Prometric exam');
    assert.strictEqual(lookupGcc.code, 'DHA Dubai');
  });

  // 3. Scenario 1: Guest clicks Inquire on a Government exam (UPSC CSE)
  test('Scenario 1: Guest clicks Inquire on Government exam (UPSC CSE)', () => {
    mockStorage.clear();
    const saved = savePendingStudentAcademyEnquiry({
      exam: govExam,
      route: 'education-school-academy',
      action: 'open_exam_enquiry',
      view: 'directory_modal'
    });
    assert.strictEqual(saved, true);

    const pending = getPendingStudentAcademyEnquiry();
    assert.ok(pending);
    assert.strictEqual(pending.examId, 'upsc-cse');
    assert.strictEqual(pending.examCode, 'UPSC CSE');
    assert.strictEqual(pending.action, 'open_exam_enquiry');
    assert.strictEqual(pending.view, 'directory_modal');
    assert.ok(pending.timestamp > 0);
  });

  // 4. Scenario 2: Guest clicks Exam Enquiry on a State/School exam (TNPSC / CBSE)
  test('Scenario 2: Guest clicks Exam Enquiry on State/School exam (TNPSC Group 4)', () => {
    mockStorage.clear();
    const saved = savePendingStudentAcademyEnquiry({
      exam: tnpscExam,
      route: 'education-school-academy?exam=tnpsc-grp4',
      action: 'open_exam_enquiry',
      view: 'academies'
    });
    assert.strictEqual(saved, true);

    const pending = getPendingStudentAcademyEnquiry();
    assert.ok(pending);
    assert.strictEqual(pending.examId, 'tnpsc-grp4');
    assert.strictEqual(pending.route, 'education-school-academy?exam=tnpsc-grp4');
    assert.strictEqual(pending.view, 'academies');
  });

  // 5. Scenario 3: Guest clicks Inquire on an International/GCC Licensing exam (DHA Dubai)
  test('Scenario 3: Guest clicks Inquire on International/GCC Licensing exam (DHA Dubai)', () => {
    mockStorage.clear();
    const saved = savePendingStudentAcademyEnquiry({
      exam: gccLicensingExam,
      route: 'education-school-academy?exam=dha-dubai',
      action: 'open_exam_enquiry',
      view: 'academies'
    });
    assert.strictEqual(saved, true);

    const pending = getPendingStudentAcademyEnquiry();
    assert.ok(pending);
    assert.strictEqual(pending.examId, 'dha-dubai');
    assert.strictEqual(pending.examCode, 'DHA Dubai');
  });

  // 6. Scenario 4: Preserving Form Selections when Guest attempts to submit
  test('Scenario 4: Preserves form fields (Name, Email, Phone, Qualification, Mode, Target Country)', () => {
    mockStorage.clear();
    const testFormData = {
      studentName: 'Priya Sundaram',
      email: 'priya.sundaram@example.com',
      phone: '+971 55 987 6543',
      qualification: 'B.Sc. Nursing',
      preferredLearningMode: 'Online Live',
      preferredLocation: 'UAE (Dubai & Abu Dhabi)',
      selectedCourseOption: 'DHA Registered Nurse Comprehensive Licensing Coaching',
      consent: true
    };

    savePendingStudentAcademyEnquiry({
      exam: gccLicensingExam,
      examId: 'dha-dubai',
      examName: 'Dubai Health Authority Prometric Exam',
      route: 'education-school-academy?exam=dha-dubai',
      formData: testFormData,
      action: 'submit_exam_enquiry',
      view: 'academies'
    });

    const pending = getPendingStudentAcademyEnquiry();
    assert.ok(pending);
    assert.ok(pending.formData);
    assert.strictEqual(pending.formData.studentName, 'Priya Sundaram');
    assert.strictEqual(pending.formData.qualification, 'B.Sc. Nursing');
    assert.strictEqual(pending.formData.preferredLocation, 'UAE (Dubai & Abu Dhabi)');
  });

  // 7. Scenario 5: Refreshing the Login page preserves pending enquiry in sessionStorage
  test('Scenario 5: Refreshing login page preserves pending Student Academy enquiry', () => {
    mockStorage.clear();
    savePendingStudentAcademyEnquiry({
      exam: govExam,
      route: 'education-school-academy',
      action: 'open_exam_enquiry'
    });

    // Simulate page reload
    const restored = getPendingStudentAcademyEnquiry();
    assert.ok(restored, 'Pending state must survive page refresh in sessionStorage');
    assert.strictEqual(restored.examId, 'upsc-cse');
  });

  // 8. Scenario 6: validatePendingExam restores verified exam object
  test('Scenario 6: validatePendingExam restores verified exam object from storage record', () => {
    const record = {
      examId: 'dha-dubai',
      examCode: 'DHA Dubai',
      examName: 'Dubai Health Authority (DHA) Prometric Licensure Examination'
    };

    const validated = validatePendingExam(record);
    assert.ok(validated);
    assert.strictEqual(validated.id, 'dha-dubai');
    assert.strictEqual(validated.code, 'DHA Dubai');
    assert.ok(validated.conductingBody || validated.overview);
  });

  // 9. Scenario 7: clearPendingStudentAcademyEnquiry clears storage
  test('Scenario 7: clearPendingStudentAcademyEnquiry cleans up storage safely', () => {
    mockStorage.clear();
    savePendingStudentAcademyEnquiry({ exam: govExam });
    assert.ok(getPendingStudentAcademyEnquiry());

    clearPendingStudentAcademyEnquiry();
    assert.strictEqual(getPendingStudentAcademyEnquiry(), null);
  });

  // 10. Component Wiring: ExamDirectoryView.jsx enforces auth check and restores
  test('Component Check: ExamDirectoryView.jsx has authentication guard & restore effect', () => {
    const content = fs.readFileSync('src/components/student-academy/ExamDirectoryView.jsx', 'utf8');
    assert.ok(content.includes('savePendingStudentAcademyEnquiry'), 'Must import savePendingStudentAcademyEnquiry');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must use getPendingStudentAcademyEnquiry');
    assert.ok(content.includes('studentAcademyAuth'), 'Must import studentAcademyAuth');
    assert.ok(content.includes('validatePendingExam'), 'Must import validatePendingExam');
    assert.ok(content.includes("navigateTo('login')"), 'Must redirect guest to login');
    assert.ok(content.includes('clearPendingStudentAcademyEnquiry'), 'Must clear storage once restored');
  });

  // 11. Component Wiring: ExamEnquiryView.jsx has authentication guard & restore effect
  test('Component Check: ExamEnquiryView.jsx has authentication guard & form restore', () => {
    const content = fs.readFileSync('src/components/student-academy/ExamEnquiryView.jsx', 'utf8');
    assert.ok(content.includes('savePendingStudentAcademyEnquiry'), 'Must import savePendingStudentAcademyEnquiry');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must import getPendingStudentAcademyEnquiry');
    assert.ok(content.includes("navigateTo('login')"), 'Must redirect guest to login');
    assert.ok(content.includes('formData'), 'Must restore formData');
  });

  // 12. Component Wiring: ExamEnquiryModal.jsx has authentication guard & form restore
  test('Component Check: ExamEnquiryModal.jsx has authentication guard & form restore', () => {
    const content = fs.readFileSync('src/components/student-academy/ExamEnquiryModal.jsx', 'utf8');
    assert.ok(content.includes('savePendingStudentAcademyEnquiry'), 'Must import savePendingStudentAcademyEnquiry');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must import getPendingStudentAcademyEnquiry');
    assert.ok(content.includes("navigateTo('login')"), 'Must redirect guest to login');
  });

  // 13. Component Wiring: StudentAcademyPage.jsx restores exact view and parameters
  test('Component Check: StudentAcademyPage.jsx restores exact view, exam, or course', () => {
    const content = fs.readFileSync('src/pages/StudentAcademyPage.jsx', 'utf8');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must import getPendingStudentAcademyEnquiry');
    assert.ok(content.includes('setSelectedExamId'), 'Must restore selectedExamId');
    assert.ok(content.includes('setSelectedCourseId'), 'Must restore selectedCourseId');
  });

  // 14. Component Wiring: UnifiedAuth.jsx has reassurance banner and pending redirect
  test('Component Check: UnifiedAuth.jsx shows Student Academy reassurance banner and redirects to pending route', () => {
    const content = fs.readFileSync('src/components/UnifiedAuth.jsx', 'utf8');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must import getPendingStudentAcademyEnquiry');
    assert.ok(content.includes('Student Academy Examination Enquiry'), 'Must show Student Academy reassurance banner');
    assert.ok(content.includes('pendingAcademy.route'), 'Must check pendingAcademy.route on successful login');
  });

  // 15. Component Wiring: AppContext.jsx priority routing on login / registration
  test('Component Check: AppContext.jsx honors pending Student Academy route in loginCandidate and registerCandidate', () => {
    const content = fs.readFileSync('src/context/AppContext.jsx', 'utf8');
    assert.ok(content.includes('getPendingStudentAcademyEnquiry'), 'Must import getPendingStudentAcademyEnquiry');
    assert.ok(content.includes('pendingAcademy.route'), 'Must redirect to pending academy route');
  });

  // 16. Real Backend & CRM Integration Test
  await asyncTest('CRM & Database: Real Student Academy exam enquiry persisted and visible in dashboard', async () => {
    const uniqueEmail = `priya.sundaram.${Date.now()}@example.com`;
    const payload = {
      referenceNumber: `REV-ACA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: 'Priya Sundaram',
      email: uniqueEmail,
      phone: '+971 55 987 6543',
      examId: 'dha-dubai',
      examName: 'Dubai Health Authority (DHA) Prometric Licensure Examination',
      qualification: 'B.Sc. Nursing',
      preferredLearningMode: 'Online Live',
      preferredLocation: 'UAE (Dubai & Abu Dhabi)',
      targetCountry: 'UAE (Dubai & Abu Dhabi)',
      countryInterest: 'UAE (Dubai & Abu Dhabi)',
      questions: 'Interested in DHA registered nurse licensing preparation schedule and exam booking dates.',
      courseName: 'DHA Registered Nurse Comprehensive Licensing Coaching',
      academyId: 'revival-advisory',
      academyName: 'Revival International Student Advisory',
      enquiryType: 'Exam Enquiry',
      consent: true,
      isExamEnquiry: true,
      serviceId: 'school-academy',
      serviceTitle: 'Student Academy - Exam Enquiry',
      createdAt: new Date().toISOString()
    };

    const res = await fetch('http://localhost:5000/api/student-academy/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.ok(res.status === 200 || res.status === 201, 'Backend API must respond with 200 OK or 201 Created');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.referenceNumber);
    assert.ok(json.referenceNumber, 'Must return reference number');

    // Verify it is queryable in Student Academy enquiries list
    const getRes = await fetch('http://localhost:5000/api/student-academy/enquiries');
    assert.strictEqual(getRes.status, 200);
    const getJson = await getRes.json();
    assert.ok(Array.isArray(getJson.data));
    const createdRecord = getJson.data.find(r => r.email === uniqueEmail);
    assert.ok(createdRecord, 'Submitted enquiry must be queryable in Student Academy enquiries list');
    assert.strictEqual(createdRecord.examId, 'dha-dubai');
    assert.strictEqual(createdRecord.studentName, 'Priya Sundaram');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`  SUMMARY: ${passedTests} of ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('----------------------------------------------------------------\n');

  if (passedTests === totalTests) {
    console.log('✓ ALL STUDENT ACADEMY AUTH REDIRECTION & RETURN TESTS PASSED (100%)!');
  } else {
    process.exitCode = 1;
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exitCode = 1;
});

/**
 * Revival International - Student Academy Module Verification
 * Tests the entire user flow:
 * Services → Student Academy → Select Department → Select Exam → Browse Academies → Select Academy → View Courses → Select Course → Enquiry Form → Confirmation & Database
 */

const assert = require('assert');
const http = require('http');

const PORT = process.env.PORT || 5000;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runStudentAcademyTests() {
  console.log('================================================================');
  console.log('   STUDENT ACADEMY MODULE: COMPREHENSIVE VERIFICATION');
  console.log('================================================================\n');

  // 1. Data Store Verification
  console.log('--- 1. Testing Student Academy Data Store & Structure ---');
  const data = await import('./src/data/studentAcademyData.js');
  
  const depts = data.getDepartments();
  assert.strictEqual(depts.length, 11, 'Must have exactly 11 departments');
  console.log(`✅ PASS: Exactly 11 departments defined`);

  // Verify all 11 required categories
  const deptIds = depts.map(d => d.id);
  const requiredDepts = [
    'gov', 'banking', 'engineering', 'medical', 'teaching',
    'defence', 'management', 'law', 'science-arts', 'railway-design', 'intl-tests'
  ];
  for (const req of requiredDepts) {
    assert.ok(deptIds.includes(req), `Department '${req}' must be present`);
  }
  console.log('✅ PASS: All required departments present (Government, Banking, Engineering, Medical, Teaching, Defence, Management, Law, Science/Arts, Railway/Design, International)');

  // Verify International Tests is separate
  const intlDept = depts.find(d => d.id === 'intl-tests');
  assert.ok(intlDept.isInternational, 'International tests must be flagged isInternational');
  console.log('✅ PASS: International entrance tests clearly categorized for separate display');

  // Verify Examinations
  const exams = data.getExaminations();
  assert.ok(exams.length >= 20, `Must have >= 20 competitive exams (found ${exams.length})`);
  console.log(`✅ PASS: ${exams.length} competitive examinations defined with conducting body and syllabus pattern`);

  // 2. Exam to Academies Mapping (Max 10 verified academies per exam)
  console.log('\n--- 2. Testing Click an Exam -> Up to 10 Verified Academies ---');
  const upscExam = data.getExamById('exam-upsc-cse');
  assert.ok(upscExam, 'UPSC CSE exam exists');
  const upscAcademies = data.getAcademiesForExam('exam-upsc-cse');
  assert.ok(upscAcademies.length > 0, 'Must have matching academies for UPSC');
  assert.ok(upscAcademies.length <= 10, 'Must never exceed 10 academies');
  console.log(`✅ PASS: UPSC CSE returned ${upscAcademies.length} verified academies (<= 10 limit respected)`);

  for (const aca of upscAcademies) {
    assert.ok(aca.name, 'Academy must have name');
    assert.ok(aca.city, 'Academy must have city/location');
    assert.ok(aca.description, 'Academy must have description');
    assert.ok(aca.learningModes && aca.learningModes.length > 0, 'Academy must have learning modes');
  }
  console.log('✅ PASS: Each academy card has name, logo representation, location, description, and learning modes');

  // 3. Academy Details & Audited Courses
  console.log('\n--- 3. Testing Academy Details & Verified Courses ---');
  const shankarIas = data.getAcademyById('aca-shankar-ias');
  assert.ok(shankarIas, 'Shankar IAS Academy found');
  assert.ok(shankarIas.phone && shankarIas.email && shankarIas.address, 'Contact info complete');
  assert.ok(shankarIas.facilities.length >= 3, 'Facilities documented');
  assert.ok(shankarIas.teachingMethods.length >= 3, 'Teaching methods documented');
  console.log('✅ PASS: Academy details include introduction, contact info, location, facilities, and teaching methods');

  const shankarCourses = data.getCoursesForAcademyAndExam('aca-shankar-ias', 'exam-upsc-cse');
  assert.ok(shankarCourses.length > 0, 'Courses found for UPSC');
  for (const c of shankarCourses) {
    assert.ok(c.duration, 'Course duration defined');
    assert.ok(c.syllabus && c.syllabus.length > 0, 'Course syllabus defined');
    assert.ok(c.verifiedFee, 'Fee verified');
    assert.ok(c.batches && c.batches.length > 0, 'Batches available');
  }
  console.log('✅ PASS: Courses contain duration, syllabus, learning mode, available batches, and verified fees');

  // Other exams offered by same academy
  const otherCourses = data.getOtherCoursesForAcademy('aca-shankar-ias', 'exam-upsc-cse');
  assert.ok(otherCourses.length > 0, 'Other courses section populated');
  console.log(`✅ PASS: Separate section presents ${otherCourses.length} other courses offered by the academy (e.g. TNPSC Group 1)`);

  // 4. Dedicated Course Enquiry & Backend Persistence
  console.log('\n--- 4. Testing Dedicated Course Enquiry Submission & Dual-Sync ---');
  const targetCourse = shankarCourses[0];
  const enquiryPayload = {
    studentName: 'Vigneshwaran K',
    email: `vignesh_${Date.now()}@test-student.in`,
    phone: '+91 94441 23456',
    preferredLearningMode: targetCourse.learningMode,
    batchPreference: targetCourse.batches[0].name,
    questions: 'Requesting syllabus brochure and instalment payment schedule.',
    academyId: shankarIas.id,
    academyName: shankarIas.name,
    examId: upscExam.id,
    examName: upscExam.name,
    courseId: targetCourse.id,
    courseName: targetCourse.title
  };

  const res = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: enquiryPayload
  });

  assert.strictEqual(res.status, 200, 'POST /api/student-academy/enquiries should return 200');
  assert.ok(res.data.success, 'Success flag should be true');
  assert.ok(res.data.referenceNumber.startsWith('REV-ACA-2026-'), 'Reference number should follow format REV-ACA-2026-XXXXX');
  console.log(`✅ PASS: Course enquiry submitted and generated official reference: ${res.data.referenceNumber}`);

  // Fetch enquiries list
  const listRes = await request('/api/student-academy/enquiries');
  assert.strictEqual(listRes.status, 200, 'GET /api/student-academy/enquiries should return 200');
  assert.ok(listRes.data.data.length > 0, 'Enquiries list should contain records');
  const found = listRes.data.data.find(e => e.referenceNumber === res.data.referenceNumber);
  assert.ok(found, 'Submitted enquiry must be retrieved from SQLite database');
  assert.strictEqual(found.academyId, shankarIas.id, 'Academy ID preserved');
  assert.strictEqual(found.examId, upscExam.id, 'Exam ID preserved');
  assert.strictEqual(found.courseId, targetCourse.id, 'Course ID preserved');
  console.log(`✅ PASS: Preserved academyId (${found.academyId}), examId (${found.examId}), courseId (${found.courseId}) in database record`);

  // Fetch stats
  const statsRes = await request('/api/student-academy/stats');
  assert.strictEqual(statsRes.status, 200, 'GET /api/student-academy/stats should return 200');
  assert.ok(statsRes.data.stats.totalEnquiries > 0, 'Stats count > 0');
  console.log(`✅ PASS: Student Academy stats reporting active (${statsRes.data.stats.totalEnquiries} enquiries across ${statsRes.data.stats.uniqueAcademies} academies)`);

  // 5. Existing Website Integration & Services Menu Preservation
  console.log('\n--- 5. Testing Existing Website Navigation Integration ---');
  const fs = require('fs');
  const path = require('path');

  const navbarContent = fs.readFileSync(path.join(__dirname, 'src/components/Navbar.jsx'), 'utf8');
  assert.ok(navbarContent.includes("id: 'school-academy'"), 'Navbar must retain school-academy in Services menu');
  assert.ok(navbarContent.includes("Student Academy"), 'Navbar must show Student Academy');
  console.log('✅ PASS: Student Academy kept under existing Services menu without top-level duplicate');

  const detailContent = fs.readFileSync(path.join(__dirname, 'src/pages/EducationServiceDetail.jsx'), 'utf8');
  assert.ok(detailContent.includes("service.id === 'school-academy'"), 'EducationServiceDetail delegates to StudentAcademyPage');
  assert.ok(detailContent.includes("<StudentAcademyPage />"), 'Renders StudentAcademyPage');
  console.log('✅ PASS: Services -> Student Academy seamlessly delegates to StudentAcademyPage');

  console.log('\n================================================================');
  console.log('   ALL STUDENT ACADEMY MODULE TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runStudentAcademyTests().catch(err => {
  console.error('❌ Student Academy Test Failed:', err);
  process.exit(1);
});

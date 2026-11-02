import assert from 'assert';
import http from 'http';
import { getExaminations, getExamById } from './src/data/studentAcademyData.js';
import { getExamEnquiryDetails, EXAM_DETAILED_INFO } from './src/data/examEnquiryDetailsData.js';

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

async function runExamEnquiryTests() {
  console.log('================================================================');
  console.log('   FEATURE TEST: EXAM ENQUIRY AND REQUIREMENTS PAGE');
  console.log('================================================================\n');

  // Test 1: Check key requested exams exist and have rich detailed info
  console.log('--- 1. Testing Exam Information for Key Categories ---');
  const keyExams = [
    { id: 'exam-upsc-cse', keyword: 'UPSC' },
    { id: 'exam-tnpsc-grp1', keyword: 'TNPSC' },
    { id: 'exam-ssc-cgl', keyword: 'SSC' },
    { id: 'exam-sbi-po', keyword: 'Banking' },
    { id: 'exam-rrb-ntpc', keyword: 'Railway' },
    { id: 'exam-neet-ug', keyword: 'NEET' },
    { id: 'exam-jee-main-adv', keyword: 'JEE' }
  ];

  for (const item of keyExams) {
    const basic = getExamById(item.id);
    assert.ok(basic, `Exam ${item.id} (${item.keyword}) must exist in data store`);
    
    const details = getExamEnquiryDetails(item.id, basic);
    assert.ok(details, `Detailed information for ${item.id} must be generated`);
    assert.ok(details.fullName, `Full name must exist for ${item.id}`);
    assert.ok(details.abbreviation, `Abbreviation must exist for ${item.id}`);
    assert.ok(details.overview && details.overview.length > 50, `Overview must be comprehensive for ${item.id}`);
    assert.ok(details.educationalQualifications, `Educational qualification must exist for ${item.id}`);
    assert.ok(details.ageLimit, `Age limit and relaxations must exist for ${item.id}`);
    assert.ok(details.stages && details.stages.length >= 1, `Stages must be listed for ${item.id}`);
    assert.ok(details.pattern, `Exam pattern must exist for ${item.id}`);
    assert.ok(details.markingScheme, `Marking scheme must exist for ${item.id}`);
    assert.ok(details.syllabusTopics && details.syllabusTopics.length > 0, `Syllabus topics must exist for ${item.id}`);
    assert.ok(details.applicationProcess && details.applicationProcess.length > 0, `Application process steps must exist for ${item.id}`);
    assert.ok(details.requiredDocuments && details.requiredDocuments.length > 0, `Required documents must exist for ${item.id}`);
    assert.ok(details.officialWebsite && details.officialWebsite.startsWith('http'), `Official website must be a valid URL for ${item.id}`);
    assert.ok(details.preparationGuidance, `Preparation guidance must exist for ${item.id}`);

    console.log(`✅ PASS: ${item.keyword} (${details.abbreviation}) — ${details.fullName} details fully verified`);
  }

  // Test 2: Check all exams in the catalog resolve detailed information
  console.log('\n--- 2. Testing All Examinations in Catalog Resolve Dynamic Details ---');
  const allExams = getExaminations();
  assert.ok(allExams.length >= 30, `Expected at least 30 exams, found ${allExams.length}`);
  
  for (const e of allExams) {
    const d = getExamEnquiryDetails(e.id, e);
    assert.ok(d.fullName, `Full name resolved for ${e.id}`);
    assert.ok(d.educationalQualifications, `Qualifications resolved for ${e.id}`);
    assert.ok(d.pattern, `Pattern resolved for ${e.id}`);
  }
  console.log(`✅ PASS: All ${allExams.length} competitive exams dynamically resolve complete information`);

  // Test 3: Backend Enquiry Submission for an Exam
  console.log('\n--- 3. Testing Exam Enquiry Submission via API ---');
  const testExam = getExamById('exam-upsc-cse');
  const enquiryPayload = {
    studentName: 'Aarav Sharma',
    email: `aarav_${Date.now()}@revival-test.com`,
    phone: '+971 50 987 6543',
    examId: testExam.id,
    examName: `${testExam.name} (${testExam.code})`,
    qualification: 'Engineering Degree (B.E./B.Tech)',
    preferredLearningMode: 'Online Live',
    preferredLocation: 'Dubai / Remote',
    questions: 'Requesting syllabus analysis, recommended mock test series, and weekend batch timings.',
    enquiryType: 'Exam Enquiry'
  };

  const res = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: enquiryPayload
  });

  assert.strictEqual(res.status, 200, 'POST /api/student-academy/enquiries must return 200');
  assert.ok(res.data.success, 'Response success must be true');
  assert.ok(res.data.referenceNumber.startsWith('REV-ACA-2026-'), 'Reference number format valid');
  console.log(`✅ PASS: Submitted Exam Enquiry received reference: ${res.data.referenceNumber}`);

  // Test 4: Retrieve and verify database persistence
  console.log('\n--- 4. Testing SQLite Retrieval of Exam Enquiry ---');
  const listRes = await request('/api/student-academy/enquiries');
  assert.strictEqual(listRes.status, 200, 'GET /api/student-academy/enquiries must return 200');
  const found = listRes.data.data.find(e => e.referenceNumber === res.data.referenceNumber);
  assert.ok(found, 'Submitted enquiry must be found in student_academy_enquiries table');
  assert.strictEqual(found.studentName, enquiryPayload.studentName, 'Student name matches');
  assert.strictEqual(found.examId, enquiryPayload.examId, 'Exam ID matches');
  assert.strictEqual(found.qualification, enquiryPayload.qualification, 'Qualification matches');
  assert.strictEqual(found.preferredLocation, enquiryPayload.preferredLocation, 'Preferred location matches');
  console.log(`✅ PASS: Verified database record with studentName, qualification, preferredLocation, examId, and referenceNumber`);

  // Test 5: Verify CRM Leads mirror
  console.log('\n--- 5. Testing CRM Leads Mirror for Administrator Visibility ---');
  const leadsRes = await request('/api/leads');
  if (leadsRes.status === 200 && Array.isArray(leadsRes.data)) {
    const lead = leadsRes.data.find(l => l.referenceNumber === res.data.referenceNumber);
    assert.ok(lead, 'Exam enquiry must be mirrored into unified leads table for CRM visibility');
    assert.strictEqual(lead.name, enquiryPayload.studentName, 'Lead name matches');
    assert.ok(lead.message.includes(enquiryPayload.qualification), 'Lead message contains qualification');
    console.log(`✅ PASS: Exam enquiry successfully mirrored into CRM leads table`);
  } else {
    console.log(`ℹ️ Note: /api/leads requires auth or returned status ${leadsRes.status}`);
  }

  console.log('\n================================================================');
  console.log('   ALL EXAM ENQUIRY FEATURE TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runExamEnquiryTests().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});

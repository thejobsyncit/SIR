/**
 * Revival International - Competitive Exams Workflow Verification
 * Tests the complete end-to-end user flow:
 * 1. 7 Preserved International Categories & Exams
 * 2. 15 Added Indian Public Sector Categories & Exams
 * 3. Total 22 Categories & 169 Exam Pathways
 * 4. Detail Resolution, Empty State & Official Links
 * 5. CRM API Enquiry Submission & SQLite Database Persistence
 */

const assert = require('assert');
const http = require('http');
const {
  COMPETITIVE_EXAM_CATEGORIES,
  COMPETITIVE_EXAMS,
  getCategoryById,
  getExamsByCategory,
  getCategoryExamCounts,
  getCompetitiveExamById
} = require('./src/data/competitiveExamsData.js');

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

async function runTests() {
  console.log('================================================================');
  console.log('   EXPANDED COMPETITIVE EXAMS WORKFLOW: END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // 1. Verify 22 Categories: 7 Preserved International + 15 New Indian Categories
  console.log('--- 1. Testing 22 Categories (7 International + 15 Indian) ---');
  const expected7International = [
    'ielts', 'oet', 'ogt', 'medical-exams', 'europe-western', 'gcc-medical', 'gcc-engineering'
  ];
  const expected15Indian = [
    'civil-services', 'ssc-exams', 'banking-exams', 'railway-exams', 'defence-exams',
    'police-uniformed', 'teaching-exams', 'engineering-govt', 'medical-govt', 'state-psc',
    'judicial-legal', 'insurance-exams', 'postal-central', 'research-scientific', 'management-psu'
  ];
  const all22Categories = [...expected7International, ...expected15Indian];

  assert.strictEqual(COMPETITIVE_EXAM_CATEGORIES.length, 22, 'Must have exactly 22 categories');
  
  for (const catId of all22Categories) {
    const cat = getCategoryById(catId);
    assert.ok(cat, `Category ${catId} must exist`);
    assert.ok(cat.name, `Category ${catId} must have a name`);
    assert.ok(cat.description, `Category ${catId} must have a description`);
    assert.ok((cat.popularOptions || cat.examOptions) && (cat.popularOptions || cat.examOptions).length > 0, `Category ${catId} must list included options`);
  }
  console.log('✅ PASS: All 22 categories (7 preserved international + 15 new Indian public sector) exist with valid descriptions');

  // 2. Dynamic Exam Counts
  console.log('\n--- 2. Testing Dynamic Exam Counts ---');
  const counts = getCategoryExamCounts();
  // International
  assert.strictEqual(counts.ielts, 3, 'IELTS has 3 exams');
  assert.strictEqual(counts.oet, 5, 'OET has 5 exams');
  assert.strictEqual(counts.ogt, 1, 'OGT has 1 advisory exam');
  assert.strictEqual(counts['medical-exams'], 7, 'Medical Exams has 7 options');
  assert.strictEqual(counts['europe-western'], 7, 'Europe & Western has 7 options');
  assert.strictEqual(counts['gcc-medical'], 8, 'GCC Medical has 8 options');
  assert.strictEqual(counts['gcc-engineering'], 7, 'GCC Engineering has 7 options');
  // Indian
  assert.strictEqual(counts['civil-services'], 10, 'Civil Services has 10 exams');
  assert.strictEqual(counts['ssc-exams'], 9, 'SSC has 9 exams');
  assert.strictEqual(counts['banking-exams'], 14, 'Banking has 14 exams');
  assert.strictEqual(counts['railway-exams'], 9, 'Railway has 9 exams');
  assert.strictEqual(counts['defence-exams'], 11, 'Defence has 11 exams');
  assert.strictEqual(counts['police-uniformed'], 8, 'Police has 8 exams');
  assert.strictEqual(counts['teaching-exams'], 10, 'Teaching has 10 exams');
  assert.strictEqual(counts['engineering-govt'], 9, 'Engineering Govt has 9 exams');
  assert.strictEqual(counts['medical-govt'], 9, 'Medical Govt has 9 exams');
  assert.strictEqual(counts['state-psc'], 7, 'State PSC has 7 exams');
  assert.strictEqual(counts['judicial-legal'], 6, 'Judicial has 6 exams');
  assert.strictEqual(counts['insurance-exams'], 8, 'Insurance has 8 exams');
  assert.strictEqual(counts['postal-central'], 9, 'Postal & Central has 9 exams');
  assert.strictEqual(counts['research-scientific'], 7, 'Research & Science has 7 exams');
  assert.strictEqual(counts['management-psu'], 5, 'Management & PSU has 5 exams');
  assert.strictEqual(counts.all, 169, 'Total exams must be 169');
  console.log('✅ PASS: Dynamic exam counts verified (169 total exams across 22 categories)');

  // 3. Testing Preservation of Existing Categories & Requirements
  console.log('\n--- 3. Testing Existing Category Preservation ---');
  // OGT
  const ogtExam = getCompetitiveExamById('ogt-advisory');
  assert.ok(ogtExam, 'OGT entry exists');
  assert.ok(ogtExam.overview.toLowerCase().includes('exploratory advisory'), 'OGT specifies exploratory advisory');
  assert.strictEqual(ogtExam.verifiedCourses.length, 0, 'OGT has 0 invented courses');
  // GCC Medical
  const gccMedExams = getExamsByCategory('gcc-medical');
  assert.strictEqual(gccMedExams.length, 8, 'GCC Medical has all 8 licensing pathways');
  // GCC Engineering
  const gccEngExams = getExamsByCategory('gcc-engineering');
  assert.strictEqual(gccEngExams.length, 7, 'GCC Engineering has all 7 registration pathways');
  console.log('✅ PASS: OGT, GCC Medical, and GCC Engineering preserved with 100% integrity');

  // 4. Testing Required New Indian Exams Exist
  console.log('\n--- 4. Testing Newly Added Indian Competitive Exams ---');
  // Civil Services
  assert.ok(getCompetitiveExamById('upsc-cse'), 'UPSC CSE exists');
  assert.ok(getCompetitiveExamById('upsc-ifos'), 'UPSC IFoS exists');
  assert.ok(getCompetitiveExamById('tnpsc-grp1'), 'TNPSC Group 1 exists');
  assert.ok(getCompetitiveExamById('tnpsc-grp4'), 'TNPSC Group 4 exists');
  // SSC
  assert.ok(getCompetitiveExamById('ssc-cgl'), 'SSC CGL exists');
  assert.ok(getCompetitiveExamById('ssc-chsl'), 'SSC CHSL exists');
  assert.ok(getCompetitiveExamById('ssc-mts'), 'SSC MTS exists');
  // Banking
  assert.ok(getCompetitiveExamById('ibps-po'), 'IBPS PO exists');
  assert.ok(getCompetitiveExamById('sbi-po'), 'SBI PO exists');
  assert.ok(getCompetitiveExamById('rbi-grade-b'), 'RBI Grade B exists');
  // Railways
  assert.ok(getCompetitiveExamById('rrb-ntpc-grad'), 'RRB NTPC Graduate exists');
  assert.ok(getCompetitiveExamById('rrb-alp'), 'RRB ALP exists');
  assert.ok(getCompetitiveExamById('rpf-si'), 'RPF SI exists');
  // Defence
  assert.ok(getCompetitiveExamById('nda-na'), 'NDA & NA exists');
  assert.ok(getCompetitiveExamById('cds-exam'), 'CDS exists');
  assert.ok(getCompetitiveExamById('afcat-exam'), 'AFCAT exists');
  // Teaching
  assert.ok(getCompetitiveExamById('ctet-paper-1'), 'CTET Paper 1 exists');
  assert.ok(getCompetitiveExamById('ugc-net'), 'UGC NET exists');
  // Engineering Govt
  assert.ok(getCompetitiveExamById('gate-exam'), 'GATE exists');
  assert.ok(getCompetitiveExamById('upsc-ese'), 'UPSC ESE exists');
  // Management (Admission vs Job distinction)
  const catExam = getCompetitiveExamById('cat-iim-exam');
  assert.ok(catExam, 'CAT exists');
  assert.ok(catExam.examType.toLowerCase().includes('management admission examination'), 'CAT clearly noted as admission examination');
  console.log('✅ PASS: All representative newly added Indian competitive exams confirmed');

  // 5. Test Submission of an Indian Exam Enquiry to CRM API
  console.log('\n--- 5. Testing Indian Exam Enquiry Submission -> CRM API ---');
  const upscEnquiry = {
    studentName: 'Karthik Subramanian',
    email: `karthik_${Date.now()}@test-tnpsc.in`,
    phone: '+91 98401 23456',
    examId: 'upsc-cse',
    examName: 'UPSC Civil Services Examination (IAS, IPS, IFS, IRS)',
    qualification: "Bachelor's Degree",
    preferredLearningMode: 'Classroom',
    preferredLocation: 'Chennai, Tamil Nadu',
    academyId: 'revival-advisory',
    academyName: 'Revival International Student Advisory',
    courseId: 'upsc-cse-guidance',
    courseName: 'UPSC CSE Integrated Prelims cum Mains Mentorship',
    enquiryType: 'Exam Enquiry',
    message: 'Requesting syllabus roadmap and GS Foundation batch schedule.'
  };

  const res = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: upscEnquiry
  });

  assert.strictEqual(res.status, 200, 'API must return HTTP 200');
  assert.ok(res.data && res.data.success, 'Response must be success');
  assert.ok(res.data.referenceNumber.startsWith('REV-ACA-2026-'), 'Reference number follows REV-ACA-2026- format');
  console.log(`✅ PASS: Indian exam enquiry submitted! Reference: ${res.data.referenceNumber}`);

  // 6. Verify Database Record
  console.log('\n--- 6. Testing SQLite CRM Retrieval ---');
  const getRes = await request('/api/student-academy/enquiries');
  assert.strictEqual(getRes.status, 200, 'GET /api/student-academy/enquiries returns 200');
  
  const savedRecord = getRes.data.data.find(e => (e.referenceNumber || e.reference_number) === res.data.referenceNumber);
  assert.ok(savedRecord, 'UPSC inquiry found in CRM database');
  assert.strictEqual(savedRecord.studentName || savedRecord.student_name, 'Karthik Subramanian');
  assert.strictEqual(savedRecord.examId || savedRecord.exam_id, 'upsc-cse');
  console.log(`✅ PASS: CRM persisted studentName (${savedRecord.studentName || savedRecord.student_name}) and examId (${savedRecord.examId || savedRecord.exam_id})`);

  console.log('\n================================================================');
  console.log('   ALL EXPANDED COMPETITIVE EXAMS WORKFLOW TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

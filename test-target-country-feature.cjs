const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const { TARGET_COUNTRY_OPTIONS, COUNTRIES_LIST, VISA_MATRIX_FULL } = require('./src/data/mockData.js');
const { COMPETITIVE_EXAMS, COMPETITIVE_EXAM_CATEGORIES } = require('./src/data/competitiveExamsData.js');
const {
  isInternationalOrGccExam,
  resolveDefaultExamCountry,
  INTERNATIONAL_OR_GCC_CATEGORIES
} = require('./src/data/targetCountryUtils.js');

async function runTests() {
  console.log('================================================================');
  console.log('   TARGET COUNTRY IN EXAMINATION CONSULTATION FORM: VERIFICATION');
  console.log('================================================================\n');

  // --- TEST 1: TARGET_COUNTRY_OPTIONS REUSE AND INTEGRITY ---
  console.log('--- 1. Testing Predefined Countries List ---');
  assert(Array.isArray(TARGET_COUNTRY_OPTIONS), 'TARGET_COUNTRY_OPTIONS must be an array');
  assert(TARGET_COUNTRY_OPTIONS.length >= 18, `TARGET_COUNTRY_OPTIONS must have at least 18 countries (found: ${TARGET_COUNTRY_OPTIONS.length})`);

  const gccCountries = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain'];
  for (const gcc of gccCountries) {
    const found = TARGET_COUNTRY_OPTIONS.find(c => c.name === gcc);
    assert(found, `Missing GCC country in TARGET_COUNTRY_OPTIONS: ${gcc}`);
    assert(found.flag, `Missing flag for ${gcc}`);
  }
  console.log('✅ PASS: All 6 GCC countries (UAE, Saudi Arabia, Qatar, Oman, Kuwait, Bahrain) present with flags');

  const westernCountries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'New Zealand', 'Germany', 'Ireland'];
  for (const west of westernCountries) {
    const found = TARGET_COUNTRY_OPTIONS.find(c => c.name === west);
    assert(found, `Missing Western country in TARGET_COUNTRY_OPTIONS: ${west}`);
  }
  console.log('✅ PASS: International / Western destinations present (UK, USA, Canada, Australia, NZ, Germany, Ireland)');

  const globalOpt = TARGET_COUNTRY_OPTIONS.find(c => c.name.includes('Global'));
  assert(globalOpt, 'Global / Flexible option must be available');
  console.log('✅ PASS: "Global / Flexible (Open to Advice)" option available');

  // --- TEST 2: CATEGORY-SPECIFIC FILTERING FOR INTERNATIONAL & GCC EXAMS ---
  console.log('\n--- 2. Testing Category-Specific Identification (International & GCC vs Indian) ---');
  const intlCatIds = ['ielts', 'oet', 'ogt', 'medical-exams', 'europe-western', 'gcc-medical', 'gcc-engineering'];
  
  for (const catId of intlCatIds) {
    const category = COMPETITIVE_EXAM_CATEGORIES.find(c => c.id === catId);
    assert(category, `Category ${catId} must exist`);
    assert(isInternationalOrGccExam(null, category), `Category ${catId} should be recognized as International / GCC`);
  }
  console.log('✅ PASS: All 7 International & GCC categories recognized correctly');

  // Test Indian categories are NOT recognized as International / GCC
  const indianCatIds = ['civil-services', 'ssc-exams', 'banking-exams', 'railway-exams', 'defence-exams', 'police-uniformed'];
  for (const catId of indianCatIds) {
    const category = COMPETITIVE_EXAM_CATEGORIES.find(c => c.id === catId);
    assert(category, `Indian Category ${catId} must exist`);
    assert(!isInternationalOrGccExam(null, category), `Category ${catId} must NOT be recognized as International / GCC`);
  }
  console.log('✅ PASS: Indian Public Sector categories correctly excluded from Target Country dropdown');

  // --- TEST 3: DEFAULT COUNTRY RESOLUTION FOR EXAMS ---
  console.log('\n--- 3. Testing Exam-Specific Default Country Resolution ---');
  const sampleExams = [
    { id: 'dha-dubai', expected: 'United Arab Emirates' },
    { id: 'scfhs-saudi', expected: 'Saudi Arabia' },
    { id: 'qatar-dhp', expected: 'Qatar' },
    { id: 'oman-medical', expected: 'Oman' },
    { id: 'bahrain-nhra', expected: 'Bahrain' },
    { id: 'kuwait-medical', expected: 'Kuwait' },
    { id: 'usmle', expected: 'United States' },
    { id: 'plab', expected: 'United Kingdom' },
    { id: 'ielts-ukvi', expected: 'United Kingdom' },
    { id: 'ogt-advisory', expected: 'Global / Flexible (Open to Advice)' }
  ];

  for (const item of sampleExams) {
    const exam = COMPETITIVE_EXAMS.find(e => e.id === item.id);
    assert(exam, `Exam ${item.id} must exist`);
    const resolved = resolveDefaultExamCountry(exam);
    assert.strictEqual(resolved, item.expected, `Default for ${item.id} should be ${item.expected}, got ${resolved}`);
  }
  console.log('✅ PASS: Default country resolution verified for representative GCC & International exams');

  // --- TEST 4: SUBMIT INTERNATIONAL CONSULTATION TO BACKEND API & SQLITE CRM ---
  console.log('\n--- 4. Testing Form Submission & CRM Persistence for Target Country ---');
  const testEmail = `test.country.${Date.now()}@revival-verify.com`;
  const submissionPayload = {
    studentName: 'Fatima Al-Nuaimi',
    email: testEmail,
    phone: '+971501239876',
    qualification: 'MBBS / Medical Graduate',
    preferredLearningMode: 'Online Live',
    preferredLocation: 'Saudi Arabia', // User selected Saudi Arabia from dropdown
    targetCountry: 'Saudi Arabia',
    countryInterest: 'Saudi Arabia',
    examId: 'scfhs-saudi',
    examName: 'Saudi Commission for Health Specialties (SCFHS / SMLE) Licensure',
    message: 'Preparing for SMLE examination to practice in Riyadh hospitals.',
    academyId: 'revival-advisory',
    academyName: 'Revival International Student Advisory',
    courseId: 'scfhs-saudi-guidance',
    courseName: 'SCFHS SMLE Examination & Licensing Guidance',
    enquiryType: 'Exam Enquiry'
  };

  const response = await fetch('http://localhost:5000/api/student-academy/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionPayload)
  });

  assert(response.ok, `API submission failed with status ${response.status}`);
  const result = await response.json();
  assert(result.success, 'Response should report success: true');
  assert(result.referenceNumber.startsWith('REV-ACA-2026-'), `Expected REV-ACA-2026- ref, got ${result.referenceNumber}`);
  console.log(`✅ PASS: Form submitted successfully! Ref: ${result.referenceNumber}`);

  // Query SQLite to verify database persistence
  const dbPath = path.resolve('server', 'sir_recruitment.db');
  const db = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM student_academy_enquiries WHERE referenceNumber = ?',
      [result.referenceNumber],
      (err, saRow) => {
        if (err) return reject(err);
        try {
          assert(saRow, 'Record must exist in student_academy_enquiries');
          assert.strictEqual(saRow.studentName, 'Fatima Al-Nuaimi');
          assert.strictEqual(saRow.preferredLocation, 'Saudi Arabia', `student_academy_enquiries.preferredLocation must be Saudi Arabia, got ${saRow.preferredLocation}`);
          console.log(`✅ PASS: SQLite student_academy_enquiries verified (preferredLocation = "${saRow.preferredLocation}")`);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM leads WHERE referenceNumber = ?',
      [result.referenceNumber],
      (err, leadRow) => {
        if (err) return reject(err);
        try {
          assert(leadRow, 'Lead record must exist in leads table');
          assert.strictEqual(leadRow.workLocation, 'Saudi Arabia', `leads.workLocation must be Saudi Arabia, got ${leadRow.workLocation}`);
          assert.strictEqual(leadRow.countryInterest, 'Saudi Arabia', `leads.countryInterest must be Saudi Arabia, got ${leadRow.countryInterest}`);
          
          const custom = JSON.parse(leadRow.customFields || '{}');
          assert.strictEqual(custom.targetCountry, 'Saudi Arabia', `customFields.targetCountry must be Saudi Arabia`);
          assert(leadRow.message.includes('Target Country: Saudi Arabia'), `lead.message must include Target Country: Saudi Arabia`);
          console.log(`✅ PASS: SQLite leads verified (countryInterest = "${leadRow.countryInterest}", workLocation = "${leadRow.workLocation}")`);
          console.log(`✅ PASS: CRM customFields and message contain "Target Country: Saudi Arabia"`);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  db.close();

  // --- TEST 5: PRESERVATION OF CAREER GUIDANCE FORM ---
  console.log('\n--- 5. Testing Career Guidance Form Preservation ---');
  const fs = require('fs');
  const cgModalContent = fs.readFileSync('src/components/EducationEnquiryModal.jsx', 'utf8');
  assert(cgModalContent.includes('Target Study Destination'), 'Career Guidance EducationEnquiryModal must retain "Target Study Destination" label');
  assert(cgModalContent.includes('India'), 'Career Guidance EducationEnquiryModal must retain "India" default option');
  console.log('✅ PASS: Career Guidance "Target Study Destination" field remains 100% untouched');

  console.log('\n================================================================');
  console.log('   ALL TARGET COUNTRY FEATURE TESTS PASSED (100%)');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

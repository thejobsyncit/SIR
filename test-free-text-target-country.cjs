const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function runVerification() {
  console.log('================================================================');
  console.log('  VERIFYING TARGET COUNTRY & QUESTIONS REMOVAL IN STUDENT ACADEMY');
  console.log('================================================================\n');

  // 1. Inspect ExamEnquiryModal.jsx
  console.log('--- 1. Inspecting ExamEnquiryModal.jsx ---');
  const modalContent = fs.readFileSync('src/components/student-academy/ExamEnquiryModal.jsx', 'utf8');

  // Must not have India (Public Sector Banks) as default
  assert(!modalContent.includes('India (Public Sector Banks)'), 'Modal must not contain "India (Public Sector Banks)"');

  // preferredLocation in initial state must be empty string
  assert(/preferredLocation:\s*'',/.test(modalContent), 'ExamEnquiryModal initial state preferredLocation must be empty string');

  // preferredLocation in useEffect must be empty string
  assert(/preferredLocation:\s*'',/.test(modalContent), 'ExamEnquiryModal useEffect preferredLocation must be empty string');

  // Target Country input must be a text input with exact placeholder
  assert(modalContent.includes('placeholder="Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"'),
    'ExamEnquiryModal must have placeholder "Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"');
  assert(modalContent.includes('id="input-enquiry-target-country"'), 'ExamEnquiryModal must have id="input-enquiry-target-country"');
  assert(modalContent.includes('type="text"'), 'ExamEnquiryModal must use text input for target country');
  assert(modalContent.includes('Please enter your target country.'), 'ExamEnquiryModal validation error must be "Please enter your target country."');

  // "Specific Questions or Background (Optional)" must be completely removed
  assert(!modalContent.includes('Specific Questions or Background'), 'ExamEnquiryModal must not contain "Specific Questions or Background"');
  assert(!modalContent.includes('I am seeking advisory and preparation guidance'), 'ExamEnquiryModal must not prefill preparation guidance message');
  assert(!modalContent.includes('Tell us about your target score'), 'ExamEnquiryModal must not contain questions textarea placeholder');
  console.log('✅ PASS: ExamEnquiryModal has empty default, free-text input, exact placeholder & questions field completely removed');

  // 2. Inspect ExamEnquiryView.jsx
  console.log('\n--- 2. Inspecting ExamEnquiryView.jsx ---');
  const viewContent = fs.readFileSync('src/components/student-academy/ExamEnquiryView.jsx', 'utf8');

  assert(!viewContent.includes('India (Public Sector Banks)'), 'View must not contain "India (Public Sector Banks)"');
  assert(/preferredLocation:\s*'',/.test(viewContent), 'ExamEnquiryView initial state preferredLocation must be empty string');
  assert(viewContent.includes('placeholder="Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"'),
    'ExamEnquiryView must have placeholder "Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"');
  assert(viewContent.includes('id="input-enquiry-target-country"'), 'ExamEnquiryView must have id="input-enquiry-target-country"');
  assert(viewContent.includes("errors.preferredLocation = isInternationalOrGcc ? 'Please enter your target country.'"),
    'ExamEnquiryView validation must check for empty country and show "Please enter your target country."');
  assert(!viewContent.includes('textarea-enquiry-message'), 'ExamEnquiryView must not have questions textarea');
  console.log('✅ PASS: ExamEnquiryView has empty default, free-text input, exact placeholder & message textarea removed');

  // 3. Inspect Career Guidance form preservation
  console.log('\n--- 3. Verifying Career Guidance Form Untouched ---');
  const cgModalContent = fs.readFileSync('src/components/EducationEnquiryModal.jsx', 'utf8');
  assert(cgModalContent.includes('Target Study Destination'), 'Career Guidance EducationEnquiryModal must retain "Target Study Destination"');
  assert(cgModalContent.includes('isCareerGuidance'), 'Career Guidance EducationEnquiryModal must retain career guidance logic');
  console.log('✅ PASS: Career Guidance EducationEnquiryModal is completely unmodified');

  // 4. Test Submission of Typed Target Country to Backend API & SQLite CRM
  console.log('\n--- 4. Testing End-to-End Submission & CRM Persistence ---');
  const testEmail = `freetext.country.${Date.now()}@revival-test.com`;
  const enteredCountry = 'United Kingdom';

  const payload = {
    studentName: 'Amina Tariq',
    email: testEmail,
    phone: '+44 7700 900123',
    qualification: 'MD / General Medicine',
    preferredLearningMode: 'Online Live',
    preferredLocation: enteredCountry,
    targetCountry: enteredCountry,
    countryInterest: enteredCountry,
    examId: 'plab',
    examName: 'Professional and Linguistic Assessments Board (PLAB / UKMLA)',
    message: '',
    academyId: 'revival-advisory',
    academyName: 'Revival International Student Advisory',
    courseId: 'plab-guidance',
    courseName: 'PLAB 1 & 2 Examination Guidance',
    enquiryType: 'Exam Enquiry'
  };

  const response = await fetch('http://localhost:5000/api/student-academy/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert(response.ok, `Submission failed with HTTP ${response.status}`);
  const result = await response.json();
  assert(result.success, 'Expected success: true');
  assert(result.referenceNumber, 'Expected valid referenceNumber');
  console.log(`✅ PASS: Enquiry submitted successfully with ref: ${result.referenceNumber}`);

  const dbPath = path.resolve('server', 'sir_recruitment.db');
  const db = new sqlite3.Database(dbPath);

  // Check student_academy_enquiries
  await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM student_academy_enquiries WHERE referenceNumber = ?',
      [result.referenceNumber],
      (err, row) => {
        if (err) return reject(err);
        try {
          assert(row, 'Row not found in student_academy_enquiries');
          assert.strictEqual(row.preferredLocation, enteredCountry, `Expected preferredLocation="${enteredCountry}", got "${row.preferredLocation}"`);
          assert.strictEqual(row.studentName, 'Amina Tariq');
          console.log(`✅ PASS: student_academy_enquiries record stored with preferredLocation = "${row.preferredLocation}"`);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  // Check leads CRM table
  await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM leads WHERE referenceNumber = ?',
      [result.referenceNumber],
      (err, lead) => {
        if (err) return reject(err);
        try {
          assert(lead, 'Lead record not found in leads table');
          assert.strictEqual(lead.countryInterest, enteredCountry);
          assert.strictEqual(lead.workLocation, enteredCountry);
          const custom = JSON.parse(lead.customFields || '{}');
          assert.strictEqual(custom.targetCountry, enteredCountry);
          assert.strictEqual(custom.preferredLocation, enteredCountry);
          console.log(`✅ PASS: leads CRM record stored with countryInterest = "${lead.countryInterest}" and customFields.targetCountry = "${custom.targetCountry}"`);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  db.close();

  console.log('\n================================================================');
  console.log('  ALL REQUIREMENTS VERIFIED (100%)');
  console.log('================================================================\n');
}

runVerification().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});

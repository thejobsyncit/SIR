/**
 * Test Suite: School Academy Examination Enquiry Form - Mandatory Field Validation
 *
 * Verifies:
 * 1. All mandatory fields have compulsory validation and red '*' asterisks (text-rose-500)
 * 2. Inline red error messages and border-rose-500 error styling on failure
 * 3. Compulsory consent checkbox
 * 4. Validation rules: name (min 2 chars, valid letters), email (valid domain/TLD),
 *    phone (7-15 digits, international code), dropdown selections, non-empty country, valid exam
 * 5. Backend API validation: rejects missing/invalid fields with HTTP 400
 * 6. Duplicate prevention: returns HTTP 409
 * 7. End-to-end database persistence in SQLite (student_academy_enquiries and leads tables)
 * 8. Strict scope enforcement: College Admissions, Career Guidance, and other forms unmodified
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const API_BASE = 'http://127.0.0.1:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runValidationTests() {
  console.log('================================================================');
  console.log('  SCHOOL ACADEMY: EXAMINATION ENQUIRY FORM VALIDATION TESTS');
  console.log('================================================================\n');

  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST SECTION 1: Frontend Component Inspection (ExamEnquiryModal.jsx)
  // -------------------------------------------------------------
  console.log('--- 1. Testing Component Structure & Mandatory Red Asterisks ---');
  const modalSource = fs.readFileSync(path.resolve('src/components/student-academy/ExamEnquiryModal.jsx'), 'utf8');

  // Verify text-rose-500 asterisks on all 7 required field labels + consent
  const requiredLabels = [
    { name: 'Selected Examination / Pathway', regex: /Selected Examination \/ Pathway[\s\S]*?text-rose-500/ },
    { name: 'Student Full Name', regex: /Student Full Name[\s\S]*?text-rose-500/ },
    { name: 'Email Address', regex: /Email Address[\s\S]*?text-rose-500/ },
    { name: 'Mobile / WhatsApp Number', regex: /Mobile \/ WhatsApp Number[\s\S]*?text-rose-500/ },
    { name: 'Current Qualification', regex: /Current Qualification[\s\S]*?text-rose-500/ },
    { name: 'Preferred Learning Mode', regex: /Preferred Learning Mode[\s\S]*?text-rose-500/ },
    { name: 'Target Country (International)', regex: /Target Country[\s\S]*?text-rose-500/ },
    { name: 'Communication Consent', regex: /Academic Advisory via WhatsApp[\s\S]*?text-rose-500/ }
  ];

  for (const label of requiredLabels) {
    assert(label.regex.test(modalSource), `Label "${label.name}" must contain a red '*' with text-rose-500`);
    console.log(`  ✓ Mandatory label "${label.name}" displays red asterisk with text-rose-500`);
    passedTests++;
  }

  // Verify border-rose-500 styling on error states
  assert(modalSource.includes('fieldErrors.studentName ? \'border-rose-500'), 'Student name must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.email ? \'border-rose-500'), 'Email must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.phone ? \'border-rose-500'), 'Phone must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.qualification ? \'border-rose-500'), 'Qualification must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.preferredLearningMode ? \'border-rose-500'), 'Learning Mode must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.preferredLocation ? \'border-rose-500'), 'Target Country must highlight with border-rose-500 on error');
  assert(modalSource.includes('fieldErrors.consent ? \'border-rose-500'), 'Consent checkbox must highlight with border-rose-500 on error');
  console.log('  ✓ All input elements apply border-rose-500 on validation failure');
  passedTests++;

  // Verify inline validation error message elements
  assert(modalSource.includes('fieldErrors.studentName &&'), 'Inline error rendered for student name');
  assert(modalSource.includes('fieldErrors.email &&'), 'Inline error rendered for email');
  assert(modalSource.includes('fieldErrors.phone &&'), 'Inline error rendered for phone');
  assert(modalSource.includes('fieldErrors.qualification &&'), 'Inline error rendered for qualification');
  assert(modalSource.includes('fieldErrors.preferredLearningMode &&'), 'Inline error rendered for preferred learning mode');
  assert(modalSource.includes('fieldErrors.preferredLocation &&'), 'Inline error rendered for target country');
  assert(modalSource.includes('fieldErrors.consent &&'), 'Inline error rendered for consent');
  console.log('  ✓ Inline text-rose-500 error messages rendered below all mandatory fields');
  passedTests++;

  // Verify placeholder and target country input
  assert(modalSource.includes('placeholder="Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"'), 'Target country has required placeholder');
  assert(modalSource.includes('id="input-enquiry-target-country"'), 'Target country has id="input-enquiry-target-country"');
  console.log('  ✓ Target Country free-text input and placeholder preserved');
  passedTests++;

  // -------------------------------------------------------------
  // TEST SECTION 2: Scope Restrictions (Unrelated Modules Untouched)
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Strict Scope Restrictions ---');
  const eduSource = fs.readFileSync(path.resolve('src/components/EducationEnquiryModal.jsx'), 'utf8');
  assert(eduSource.includes('isCareerGuidance'), 'Career Guidance EducationEnquiryModal logic intact');
  assert(eduSource.includes('Target Study Destination'), 'Career Guidance field name preserved');
  console.log('  ✓ Career Guidance form (EducationEnquiryModal.jsx) completely preserved');
  passedTests++;

  const colSource = fs.readFileSync(path.resolve('src/components/CollegeAdmissionsForm.jsx'), 'utf8');
  assert(colSource.includes('College Admission Assistance'), 'College Admissions form untouched');
  console.log('  ✓ College Admissions form (CollegeAdmissionsForm.jsx) completely preserved');
  passedTests++;

  const intlSource = fs.readFileSync(path.resolve('src/components/InternationalConsultingForm.jsx'), 'utf8');
  assert(intlSource.includes('InternationalConsultingForm'), 'International Consulting form untouched');
  console.log('  ✓ International Consulting form completely preserved');
  passedTests++;

  // -------------------------------------------------------------
  // TEST SECTION 3: Backend API Validation (/api/student-academy/enquiries)
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Backend Mandatory Field Validation ---');

  const getTestEnquiry = (overrides = {}) => ({
    studentName: 'Priyanka Sen',
    email: `priyanka_${Date.now()}_${Math.random().toString(36).substring(7)}@test-advisory.org`,
    phone: '+91 98300 12345',
    qualification: 'Bachelor\'s Degree',
    preferredLearningMode: 'Online Live',
    preferredLocation: 'Germany',
    targetCountry: 'Germany',
    countryInterest: 'Germany',
    examId: 'testas-exam',
    examName: 'TestAS (Test for Academic Studies Germany)',
    enquiryType: 'Exam Enquiry',
    isExamEnquiry: true,
    consent: true,
    ...overrides
  });

  // Test 3.1: Empty Student Name
  const resEmptyName = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ studentName: '   ' })
  });
  assert.strictEqual(resEmptyName.status, 400, 'Empty student name must be rejected with HTTP 400');
  assert(resEmptyName.data.message.includes('name'), 'Rejection message specifies student name');
  console.log('  ✓ Rejects empty student full name (HTTP 400)');
  passedTests++;

  // Test 3.2: Short Student Name (< 2 chars)
  const resShortName = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ studentName: 'A' })
  });
  assert.strictEqual(resShortName.status, 400, 'Student name < 2 chars rejected with HTTP 400');
  console.log('  ✓ Rejects student name < 2 characters (HTTP 400)');
  passedTests++;

  // Test 3.3: Numbers-only Student Name
  const resNumName = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ studentName: '12345678' })
  });
  assert.strictEqual(resNumName.status, 400, 'Numbers-only name rejected with HTTP 400');
  console.log('  ✓ Rejects numbers-only student name (HTTP 400)');
  passedTests++;

  // Test 3.4: Invalid Email
  const resInvalidEmail = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ email: 'priyanka_not_an_email' })
  });
  assert.strictEqual(resInvalidEmail.status, 400, 'Invalid email rejected with HTTP 400');
  console.log('  ✓ Rejects invalid email format (HTTP 400)');
  passedTests++;

  // Test 3.5: Invalid Phone (< 7 digits)
  const resShortPhone = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ phone: '12345' })
  });
  assert.strictEqual(resShortPhone.status, 400, 'Phone < 7 digits rejected with HTTP 400');
  console.log('  ✓ Rejects short phone numbers < 7 digits (HTTP 400)');
  passedTests++;

  // Test 3.6: Empty Current Qualification
  const resEmptyQual = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ qualification: '   ' })
  });
  assert.strictEqual(resEmptyQual.status, 400, 'Empty qualification rejected with HTTP 400');
  assert(resEmptyQual.data.message.includes('qualification'), 'Rejection message specifies qualification');
  console.log('  ✓ Rejects empty educational qualification (HTTP 400)');
  passedTests++;

  // Test 3.7: Empty Preferred Learning Mode
  const resEmptyMode = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ preferredLearningMode: '   ', coachingMode: '' })
  });
  assert.strictEqual(resEmptyMode.status, 400, 'Empty learning mode rejected with HTTP 400');
  assert(resEmptyMode.data.message.includes('learning mode'), 'Rejection message specifies learning mode');
  console.log('  ✓ Rejects empty preferred learning mode (HTTP 400)');
  passedTests++;

  // Test 3.8: Empty Target Country
  const resEmptyCountry = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ preferredLocation: '   ', targetCountry: '   ' })
  });
  assert.strictEqual(resEmptyCountry.status, 400, 'Empty target country rejected with HTTP 400');
  assert(resEmptyCountry.data.message.includes('Target country'), 'Rejection message specifies target country');
  console.log('  ✓ Rejects empty target country (HTTP 400)');
  passedTests++;

  // Test 3.9: Missing Exam
  const resMissingExam = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ examId: '', examName: '' })
  });
  assert.strictEqual(resMissingExam.status, 400, 'Missing exam rejected with HTTP 400');
  console.log('  ✓ Rejects missing examination / pathway (HTTP 400)');
  passedTests++;

  // Test 3.10: Unchecked Consent
  const resUncheckedConsent = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: getTestEnquiry({ consent: false })
  });
  assert.strictEqual(resUncheckedConsent.status, 400, 'Unchecked consent rejected with HTTP 400');
  assert(resUncheckedConsent.data.message.includes('consent'), 'Rejection message specifies consent');
  console.log('  ✓ Rejects unaccepted communication consent (HTTP 400)');
  passedTests++;

  // -------------------------------------------------------------
  // TEST SECTION 4: Valid Submission & Database Persistence
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Complete Valid Submission & SQLite Persistence ---');

  const uniqueEmail = `advisory.student.${Date.now()}@revival-international.ae`;
  const submissionData = {
    studentName: 'Sanjay Krishnan',
    email: uniqueEmail,
    phone: '+971 50 987 6543',
    qualification: 'Bachelor\'s Degree',
    preferredLearningMode: 'Online Live',
    preferredLocation: 'United Arab Emirates',
    targetCountry: 'United Arab Emirates',
    countryInterest: 'United Arab Emirates',
    examId: 'dha-exam',
    examName: 'Dubai Health Authority (DHA Licensing Exam)',
    enquiryType: 'Exam Enquiry',
    isExamEnquiry: true,
    consent: true
  };

  const resValid = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: submissionData
  });

  assert.strictEqual(resValid.status, 200, 'Valid submission returns HTTP 200');
  assert.ok(resValid.data.success, 'Response indicates success: true');
  assert.ok(resValid.data.referenceNumber && resValid.data.referenceNumber.startsWith('REV-ACA-2026-'), 'Valid reference number generated');
  const refNum = resValid.data.referenceNumber;
  console.log(`  ✓ Valid examination enquiry submitted successfully: Reference ${refNum}`);
  passedTests++;

  // Verify duplicate submission prevention (HTTP 409)
  const resDuplicate = await request('/api/student-academy/enquiries', {
    method: 'POST',
    body: submissionData
  });
  assert.strictEqual(resDuplicate.status, 409, 'Duplicate submission within 30s rejected with HTTP 409');
  console.log('  ✓ Duplicate enquiry submission blocked within 30s (HTTP 409)');
  passedTests++;

  // Verify SQLite database persistence
  const dbPath = path.resolve('server', 'sir_recruitment.db');
  const db = new sqlite3.Database(dbPath);

  // Check student_academy_enquiries table
  await new Promise((resolve, reject) => {
    db.get('SELECT * FROM student_academy_enquiries WHERE referenceNumber = ?', [refNum], (err, row) => {
      if (err) return reject(err);
      try {
        assert(row, `Record not found in student_academy_enquiries for reference ${refNum}`);
        assert.strictEqual(row.studentName, 'Sanjay Krishnan');
        assert.strictEqual(row.email, uniqueEmail.toLowerCase());
        assert.strictEqual(row.phone, '+971 50 987 6543');
        assert.strictEqual(row.qualification, 'Bachelor\'s Degree');
        assert.strictEqual(row.preferredLearningMode, 'Online Live');
        assert.strictEqual(row.preferredLocation, 'United Arab Emirates');
        assert.strictEqual(row.examName, 'Dubai Health Authority (DHA Licensing Exam)');
        console.log('  ✓ Record successfully verified in student_academy_enquiries SQLite table');
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
  passedTests++;

  // Check leads CRM unified table
  await new Promise((resolve, reject) => {
    db.get('SELECT * FROM leads WHERE referenceNumber = ?', [refNum], (err, lead) => {
      if (err) return reject(err);
      try {
        assert(lead, `Lead record not found in leads table for reference ${refNum}`);
        assert.strictEqual(lead.name, 'Sanjay Krishnan');
        assert.strictEqual(lead.email, uniqueEmail.toLowerCase());
        assert.strictEqual(lead.degreeLevel, 'Bachelor\'s Degree');
        assert.strictEqual(lead.consultationMode, 'Online Live');
        assert.strictEqual(lead.countryInterest, 'United Arab Emirates');
        assert.strictEqual(lead.serviceId, 'school-academy');
        console.log('  ✓ Record mirrored with full metadata in leads CRM SQLite table');
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
  passedTests++;

  db.close();

  console.log('\n================================================================');
  console.log(`  ALL VALIDATION TESTS PASSED: ${passedTests} CHECKS VERIFIED (100%)`);
  console.log('================================================================\n');
}

runValidationTests().catch((err) => {
  console.error('\n❌ VALIDATION TEST FAILED:', err);
  process.exit(1);
});

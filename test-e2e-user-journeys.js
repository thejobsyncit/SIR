import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import { SERVICES_LIST } from './src/data/mockData.js';
import { EDUCATION_SERVICES_DETAILED, getEducationServiceById } from './src/data/educationServicesData.js';

const BASE_URL = 'http://localhost:5000';

async function runEndToEndJourneys() {
  console.log('================================================================');
  console.log('   SIR INTERNATIONAL RECRUITMENT & ACADEMIC ADVISORY');
  console.log('   END-TO-END USER JOURNEYS (A, B, C, D) & SERVICE ACCEPTANCE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const defects = [];

  function assert(condition, message, defectDetails = null) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
      if (defectDetails) defects.push(defectDetails);
    }
  }

  async function api(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  }

  const db = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // JOURNEY A: Prospective Student (International Consulting)
  // -------------------------------------------------------------
  console.log('--- JOURNEY A: Prospective Student (International Consulting) ---');
  // 1. Service discovery in catalog
  const intlConsult = SERVICES_LIST.find(s => s.id === 'intl-consult');
  assert(!!intlConsult, "Step A1: 'intl-consult' discovered in SERVICES_LIST");
  assert(intlConsult?.category === 'Consulting' || intlConsult?.subCategory === 'Education', "Step A2: Correct category/subCategory");
  
  // 2. Detailed specification
  const intlConsultDetail = getEducationServiceById('intl-consult');
  assert(!!intlConsultDetail, "Step A3: Detailed syllabus & roadmap found in educationServicesData");
  assert(intlConsultDetail?.howItWorks?.length >= 3, "Step A4: Structured roadmap steps verified");
  assert(intlConsultDetail?.faqs?.length >= 2, "Step A5: FAQs available for applicant review");

  // 3. Negative validation testing (Contact / Inquiry form)
  let invRes = await api('/api/leads', {
    method: 'POST',
    body: { name: '', email: 'student@example.com', phone: '5012345678', message: 'Valid inquiry message here', serviceId: 'intl-consult' }
  });
  assert(invRes.status === 400, "Step A6: Empty applicant name rejected (HTTP 400)");

  invRes = await api('/api/leads', {
    method: 'POST',
    body: { name: 'Sarah Jenkins', email: 'invalid-email', phone: '5012345678', message: 'Valid inquiry message here', serviceId: 'intl-consult' }
  });
  assert(invRes.status === 400, "Step A7: Invalid email format rejected (HTTP 400)");

  // 4. Valid Submission via Contact / Consulting inquiry flow
  const journeyAPayload = {
    name: 'Sarah Jenkins (Prospective Master Student)',
    email: `sarah_jenkins_${timestamp}@test-applicant.com`,
    phone: '5098765432',
    serviceId: 'intl-consult',
    serviceTitle: 'International Consulting',
    countryInterest: 'United Kingdom',
    assistanceType: 'Destination Selection & Comparison',
    degreeLevel: 'Postgraduate',
    intakeTerm: 'Fall 2026',
    company: 'Service Inquiry: International Consulting',
    message: '[Inquiring about: International Consulting]\n\nSeeking MSc in Data Science with scholarship opportunities at Russell Group universities.'
  };

  const resA = await api('/api/leads', { method: 'POST', body: journeyAPayload });
  assert(resA.status === 201 && resA.data.success === true, "Step A8: Valid inquiry successfully accepted (HTTP 201)");
  const refA = resA.data.data?.referenceNumber;
  assert(!!refA && refA.startsWith('REV-IC-2026-'), `Step A9: Generated official reference code: ${refA}`);

  // 5. Database Verification
  const rowA = await db.get("SELECT * FROM leads WHERE email = ?", [journeyAPayload.email]);
  assert(!!rowA, "Step A10: Inquiry record persisted in SQLite database");
  assert(rowA?.serviceId === 'intl-consult', "Step A11: Stored serviceId matches 'intl-consult'");
  assert(rowA?.serviceTitle === 'International Consulting', "Step A12: Stored serviceTitle matches 'International Consulting'");
  assert(rowA?.referenceNumber === refA, "Step A13: Stored referenceNumber matches API response");
  assert(rowA?.status === 'New Enquiry', "Step A14: Initial lead status is 'New Enquiry'");

  // 6. Activity Log Verification
  const actA = await db.get("SELECT * FROM enquiry_activities WHERE enquiryId = ?", [rowA?.id]);
  assert(!!actA, "Step A15: Inbound inquiry activity auto-logged in enquiry_activities");

  // 7. Duplicate Submission Prevention
  const dupA = await api('/api/leads', { method: 'POST', body: journeyAPayload });
  assert(dupA.status === 409, "Step A16: Duplicate rapid submission rejected (HTTP 409 Conflict)");


  // -------------------------------------------------------------
  // JOURNEY B: School Student or Parent (School Student Career Guidance)
  // -------------------------------------------------------------
  console.log('\n--- JOURNEY B: School Student or Parent (School Student Career Guidance) ---');
  // 1. Service Discovery
  const schoolCareer = SERVICES_LIST.find(s => s.id === 'school-career');
  assert(!!schoolCareer, "Step B1: 'school-career' registered in SERVICES_LIST");
  assert(schoolCareer?.title === 'School Student Career Guidance', "Step B2: Correct service title");
  assert(schoolCareer?.deliverables?.length >= 3, "Step B3: Key deliverables list verified");

  const careerDetail = getEducationServiceById('school-career');
  assert(!!careerDetail, "Step B4: Detailed specifications found in educationServicesData");
  assert(careerDetail?.howItWorks?.length >= 3, "Step B5: Step-by-step career counselling roadmap verified");

  // 2. Submission via Education Modal / Contact
  const journeyBPayload = {
    name: 'Ahmed Al Mansoori (Parent of Grade 10 Student)',
    email: `ahmed_mansoori_${timestamp}@test-parent.ae`,
    phone: '5012349876',
    serviceId: 'school-career',
    serviceTitle: 'School Student Career Guidance',
    company: 'Academic Advisory (Education)',
    countryInterest: 'United Arab Emirates & GCC',
    assistanceType: 'Stream & Subject Selection',
    degreeLevel: 'High School / Foundation',
    message: '[Academic Advisory Inquiry: School Student Career Guidance]\n\nRequesting career counselling and psychometric assessment for Grade 10 student choosing IB streams.'
  };

  const resB = await api('/api/leads', { method: 'POST', body: journeyBPayload });
  assert(resB.status === 201 && resB.data.success === true, "Step B6: Parent career guidance inquiry accepted (HTTP 201)");
  const refB = resB.data.data?.referenceNumber;
  assert(!!refB && refB.startsWith('REV-EDU-'), `Step B7: Generated education reference code: ${refB}`);

  // 3. Database Integrity
  const rowB = await db.get("SELECT * FROM leads WHERE email = ?", [journeyBPayload.email]);
  assert(!!rowB, "Step B8: Inquiry record persisted in SQLite");
  assert(rowB?.serviceId === 'school-career', "Step B9: serviceId verified as 'school-career'");
  assert(rowB?.referenceNumber === refB, "Step B10: referenceNumber verified in database");
  assert(rowB?.phone === '5012349876', "Step B11: Valid phone number stored correctly");


  // -------------------------------------------------------------
  // JOURNEY C: International Applicant (International Admissions)
  // -------------------------------------------------------------
  console.log('\n--- JOURNEY C: International Applicant (International Admissions) ---');
  // 1. Service Discovery
  const intlAdm = SERVICES_LIST.find(s => s.id === 'intl-adm');
  assert(!!intlAdm, "Step C1: 'intl-adm' registered in SERVICES_LIST");
  assert(intlAdm?.title === 'International Admissions', "Step C2: Correct title 'International Admissions'");
  
  const admDetail = getEducationServiceById('intl-adm');
  assert(!!admDetail, "Step C3: Detailed specifications available");
  assert(admDetail?.howItWorks?.length >= 4, "Step C4: Full admissions milestone roadmap present");

  // 2. Submission
  const journeyCPayload = {
    name: 'Elena Rostova (International Applicant)',
    email: `elena_rostova_${timestamp}@test-applicant.com`,
    phone: '5044332211',
    serviceId: 'intl-adm',
    serviceTitle: 'International Admissions',
    company: 'Academic Advisory (Education)',
    countryInterest: 'Canada',
    assistanceType: 'University Application & Visa Checklist',
    degreeLevel: 'Undergraduate',
    intakeTerm: 'Fall 2026',
    message: '[Academic Advisory Inquiry: International Admissions]\n\nApplying for Bachelor of Computer Science in Toronto/Vancouver. Need assistance with SOP and CAS/LOA compliance.'
  };

  const resC = await api('/api/leads', { method: 'POST', body: journeyCPayload });
  assert(resC.status === 201 && resC.data.success === true, "Step C5: International admissions inquiry accepted (HTTP 201)");
  const refC = resC.data.data?.referenceNumber;
  assert(!!refC && refC.startsWith('REV-EDU-'), `Step C6: Generated reference code: ${refC}`);

  const rowC = await db.get("SELECT * FROM leads WHERE email = ?", [journeyCPayload.email]);
  assert(!!rowC, "Step C7: International Admissions lead stored in database");
  assert(rowC?.serviceId === 'intl-adm', "Step C8: serviceId verified as 'intl-adm'");
  assert(rowC?.referenceNumber === refC, "Step C9: referenceNumber verified");


  // -------------------------------------------------------------
  // JOURNEY D: Language Test Candidate (Executive Seminars & Test Prep)
  // -------------------------------------------------------------
  console.log('\n--- JOURNEY D: Language Test Candidate (Executive Seminars & Language Test Prep) ---');
  // 1. Service & Sub-program verification
  const execLang = SERVICES_LIST.find(s => s.id === 'exec-seminars-lang');
  assert(!!execLang, "Step D1: 'exec-seminars-lang' registered in SERVICES_LIST");
  assert(execLang?.title === 'Executive Seminars & Language Test Preparation', "Step D2: Title matches exact requirement");

  // Verify all 3 required language tests (DET, OET, IELTS) + Executive Seminars
  const subPrograms = execLang?.subProgrammes || [];
  assert(subPrograms.length === 4, `Step D3: Exactly 4 sub-programs configured (found: ${subPrograms.length})`);
  
  const detProgram = subPrograms.find(sp => sp.id === 'det-prep');
  assert(!!detProgram, "Step D4: Duolingo English Test (DET) sub-programme verified");
  assert(detProgram?.title?.includes('Duolingo'), "Step D5: DET title specifies Duolingo English Test");

  const oetProgram = subPrograms.find(sp => sp.id === 'oet-prep');
  assert(!!oetProgram, "Step D6: Occupational English Test (OET) sub-programme verified");
  assert((oetProgram?.audience || '').toLowerCase().includes('health') || (oetProgram?.description || '').toLowerCase().includes('healthcare'), "Step D7: OET specifies healthcare audience");

  const ieltsProgram = subPrograms.find(sp => sp.id === 'ielts-prep');
  assert(!!ieltsProgram, "Step D8: IELTS sub-programme verified");
  assert(ieltsProgram?.title?.includes('IELTS'), "Step D9: IELTS title confirmed");

  const execSeminars = subPrograms.find(sp => sp.id === 'exec-seminars');
  assert(!!execSeminars, "Step D10: Executive Seminars sub-programme verified");

  // 2. Submission for IELTS & OET candidates
  const journeyDPayload = {
    name: 'Nurse Priya Sharma (OET Healthcare Aspirant)',
    email: `priya_sharma_${timestamp}@test-nurse.com`,
    phone: '5077889900',
    serviceId: 'exec-seminars-lang',
    serviceTitle: 'Executive Seminars & Language Test Preparation | Sub-Track: Occupational English Test (OET)',
    company: 'Academic Advisory (Education)',
    countryInterest: 'United Kingdom',
    assistanceType: 'OET Healthcare Language Test Preparation',
    message: '[Language Test Preparation: OET Nursing]\n\nRegistered General Nurse with 5 years hospital experience preparing for OET Medicine/Nursing Grade B.'
  };

  const resD = await api('/api/leads', { method: 'POST', body: journeyDPayload });
  assert(resD.status === 201 && resD.data.success === true, "Step D11: OET language test inquiry accepted (HTTP 201)");
  const refD = resD.data.data?.referenceNumber;
  assert(!!refD && refD.startsWith('REV-EDU-'), `Step D12: Generated reference code: ${refD}`);

  const rowD = await db.get("SELECT * FROM leads WHERE email = ?", [journeyDPayload.email]);
  assert(!!rowD, "Step D13: Language test inquiry persisted in SQLite");
  assert(rowD?.serviceId === 'exec-seminars-lang', "Step D14: serviceId stored as 'exec-seminars-lang'");
  assert(rowD?.serviceTitle?.includes('Occupational English Test'), "Step D15: serviceTitle includes sub-track detail");


  // -------------------------------------------------------------
  // ALL 6 SERVICES: COMPREHENSIVE SUBMISSION & RETRIEVAL AUDIT
  // -------------------------------------------------------------
  console.log('\n--- ALL 6 SERVICES: Complete Matrix & Field Verification ---');
  const all6 = [
    { id: 'intl-consult', title: 'International Consulting' },
    { id: 'college-adm', title: 'College Admission Assistance' },
    { id: 'school-career', title: 'School Student Career Guidance' },
    { id: 'intl-adm', title: 'International Admissions' },
    { id: 'school-academy', title: 'Academy for School Students' },
    { id: 'exec-seminars-lang', title: 'Executive Seminars & Language Test Preparation' }
  ];

  for (const s of all6) {
    const checkRow = await db.get("SELECT * FROM leads WHERE serviceId = ? ORDER BY createdAt DESC LIMIT 1", [s.id]);
    assert(!!checkRow, `Verified database entry exists for ${s.id} (${s.title})`);
    assert(checkRow?.referenceNumber?.length > 8, `Reference number populated: ${checkRow?.referenceNumber}`);
    assert(!!checkRow?.email, `Email populated: ${checkRow?.email}`);
    assert(!!checkRow?.phone, `Phone populated: ${checkRow?.phone}`);
    assert(checkRow?.status === 'New Enquiry' || checkRow?.status === 'Contacted' || checkRow?.status === 'In Progress', `Valid lifecycle status: ${checkRow?.status}`);
  }

  // -------------------------------------------------------------
  // CRM RETRIEVAL & LEAD STATUS UPDATE AUDIT
  // -------------------------------------------------------------
  console.log('\n--- CRM INTEGRATION: Lead Dossier, Assignment & Status Flow ---');
  const leadList = await api('/api/leads');
  const leadsArray = Array.isArray(leadList.data?.data) ? leadList.data.data : (Array.isArray(leadList.data) ? leadList.data : []);
  assert(leadList.status === 200 && leadsArray.length > 0, `GET /api/leads returned ${leadsArray.length} total records`);
  
  // Update status of Journey A lead
  if (rowA?.id) {
    const updateRes = await api(`/api/leads/${rowA.id}`, {
      method: 'PATCH',
      body: {
        status: 'Contacted',
        assignedEmployee: 'Dhanalakshimi',
        priority: 'High',
        nextAction: 'Conduct Preliminary University Assessment Call'
      }
    });
    assert(updateRes.status === 200 && updateRes.data.success === true, "PATCH /api/leads/:id successfully updated lead workflow status");
    const updatedRow = await db.get("SELECT status, assignedEmployee, priority FROM leads WHERE id = ?", [rowA.id]);
    assert(updatedRow?.status === 'Contacted', "Verified database status updated to 'Contacted'");
    assert(updatedRow?.assignedEmployee === 'Dhanalakshimi', "Verified assigned employee is 'Dhanalakshimi'");
    assert(updatedRow?.priority === 'High', "Verified priority updated to 'High'");
  }

  await db.close();

  console.log('\n================================================================');
  console.log(`   JOURNEYS & SERVICES ACCEPTANCE: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (defects.length > 0) {
    console.error('Defects detected:');
    console.error(JSON.stringify(defects, null, 2));
    process.exit(1);
  }
}

runEndToEndJourneys().catch(err => {
  console.error('Fatal user journey test failure:', err);
  process.exit(1);
});

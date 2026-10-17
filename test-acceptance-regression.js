import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { SERVICES_LIST } from './src/data/mockData.js';
import { EDUCATION_SERVICES_DETAILED, getEducationServiceById } from './src/data/educationServicesData.js';

const BASE_URL = 'http://localhost:5000';

async function runComprehensiveAcceptanceTest() {
  console.log('================================================================');
  console.log('   SIR INTERNATIONAL RECRUITMENT & ACADEMIC ADVISORY');
  console.log('   PHASE 7: FINAL ACCEPTANCE TESTING & GO-LIVE VERIFICATION');
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
      if (defectDetails) {
        defects.push(defectDetails);
      }
    }
  }

  // Helper for API calls
  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  }

  // --- SECTION 1: PREVIOUS PHASES & SERVICE INVENTORY REVIEW ---
  console.log('--- SECTION 1: Service Inventory & Previous Phases Review ---');
  assert(SERVICES_LIST.length === 24, `Total services in catalog is 24 (found: ${SERVICES_LIST.length})`);
  
  const idSet = new Set();
  const duplicates = [];
  SERVICES_LIST.forEach(s => {
    if (idSet.has(s.id)) duplicates.push(s.id);
    idSet.add(s.id);
  });
  assert(duplicates.length === 0, `Zero duplicate service IDs found (duplicates: ${duplicates.join(', ') || 'none'})`);

  const required6 = [
    { id: 'intl-consult', title: 'International Consulting', category: 'Consulting', subCategory: 'Education' },
    { id: 'college-adm', title: 'College Admission Assistance', category: 'Education', subCategory: 'Admissions' },
    { id: 'school-career', title: 'School Student Career Guidance', category: 'Education', subCategory: 'Career' },
    { id: 'intl-adm', title: 'International Admissions', category: 'Education', subCategory: 'Admissions' },
    { id: 'school-academy', title: 'Academy for School Students', category: 'Education', subCategory: 'Academy' },
    { id: 'exec-seminars-lang', title: 'Executive Seminars & Language Test Preparation', category: 'Education', subCategory: 'Executive' }
  ];

  for (const s of required6) {
    const found = SERVICES_LIST.find(item => item.id === s.id);
    assert(!!found, `Service '${s.id}' (${s.title}) is registered in mockData.js`);
    if (found) {
      assert(found.title === s.title, `Service '${s.id}' has title "${found.title}"`);
      assert(found.deliverables && found.deliverables.length >= 3, `Service '${s.id}' defines >= 3 key deliverables`);
    }

    const detailed = getEducationServiceById(s.id);
    assert(!!detailed, `Service '${s.id}' has detailed specifications in educationServicesData.js`);
    if (detailed) {
      assert(detailed.howItWorks && detailed.howItWorks.length > 0, `Service '${s.id}' has structured roadmap steps`);
      assert(detailed.faqs && detailed.faqs.length > 0, `Service '${s.id}' has FAQ entries`);
    }
  }

  // Check language test options
  const langService = SERVICES_LIST.find(s => s.id === 'exec-seminars-lang');
  assert(!!langService?.subProgrammes, 'Executive Seminars & Language Test Prep has subProgrammes');
  const subIds = (langService?.subProgrammes || []).map(sp => sp.id);
  assert(subIds.includes('det-prep'), 'Duolingo English Test (DET) sub-program configured');
  assert(subIds.includes('oet-prep'), 'Occupational English Test (OET) sub-program configured');
  assert(subIds.includes('ielts-prep'), 'IELTS preparation sub-program configured');
  assert(subIds.includes('exec-seminars'), 'Executive Seminars sub-program configured');

  // Verify existing services remain available
  const existingIds = ['dom-rec', 'intl-rec', 'exec-search', 'perm-staff', 'contract-staff', 'bulk-hiring', 'overseas-place', 'visa-assist', 'work-permit', 'bg-verify'];
  for (const eid of existingIds) {
    const exists = SERVICES_LIST.some(s => s.id === eid);
    assert(exists, `Existing recruitment service '${eid}' remains available`);
  }

  // --- SECTION 2: COMPLETE SERVICE ACCEPTANCE TESTING & VALIDATION ---
  console.log('\n--- SECTION 2: Service Inquiries, Validation & Backend Submission ---');
  
  // Validation: Missing name
  let res = await api('/api/leads', { method: 'POST', body: { name: '', email: 'valid@example.com', phone: '5012345678', message: 'Valid inquiry text here' } });
  assert(res.status === 400 && res.data.success === false, 'Backend rejects empty applicant name');

  // Validation: Invalid email
  res = await api('/api/leads', { method: 'POST', body: { name: 'Valid Name', email: 'invalid-email-string', phone: '5012345678', message: 'Valid inquiry text here' } });
  assert(res.status === 400 && res.data.success === false, 'Backend rejects malformed email address');

  // Validation: Phone too short (< 7 digits)
  res = await api('/api/leads', { method: 'POST', body: { name: 'Valid Name', email: 'valid@example.com', phone: '123', message: 'Valid inquiry text here' } });
  assert(res.status === 400 && res.data.success === false, 'Backend rejects short phone numbers (< 7 digits)');

  // Validation: Message too short (< 10 chars)
  res = await api('/api/leads', { method: 'POST', body: { name: 'Valid Name', email: 'valid@example.com', phone: '5012345678', message: 'Hi' } });
  assert(res.status === 400 && res.data.success === false, 'Backend rejects message shorter than 10 characters');

  // Test submitting inquiries for all 6 target services
  const timestamp = Date.now();
  for (const s of required6) {
    const inquiryPayload = {
      name: `Acceptance User (${s.id})`,
      email: `accept_${s.id.replace(/-/g, '_')}_${timestamp}@sir-academic.com`,
      phone: '5098765432',
      serviceId: s.id,
      serviceTitle: s.title,
      company: `Service Inquiry: ${s.title}`,
      countryInterest: 'United Kingdom',
      message: `Full acceptance testing inquiry payload for ${s.title} (${s.id}). Verified end-to-end.`
    };

    const submitRes = await api('/api/leads', { method: 'POST', body: inquiryPayload });
    assert(submitRes.status === 201 && submitRes.data.success === true, `Inquiry accepted for ${s.title} (HTTP 201)`);
    assert(!!submitRes.data.data?.referenceNumber, `Generated reference number for ${s.title}: ${submitRes.data.data?.referenceNumber}`);
    assert(submitRes.data.data?.serviceId === s.id, `Persisted correct serviceId '${s.id}' in lead record`);

    // Duplicate submission test: Immediately submit again with exact same email and serviceId
    const dupRes = await api('/api/leads', { method: 'POST', body: inquiryPayload });
    assert(dupRes.status === 409 && dupRes.data.success === false, `Duplicate submission within 30s rejected for ${s.title} (HTTP 409)`);
  }

  // --- SECTION 3: DATABASE VERIFICATION & SQLITE PERSISTENCE ---
  console.log('\n--- SECTION 3: SQLite Database Schema, Data Integrity & Direct Query ---');
  const db = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });

  const leadColumns = (await db.all("PRAGMA table_info(leads)")).map(c => c.name);
  const requiredCols = ['id', 'name', 'email', 'phone', 'serviceId', 'serviceTitle', 'referenceNumber', 'countryInterest', 'assistanceType', 'intakeTerm', 'degreeLevel', 'status', 'createdAt'];
  for (const rc of requiredCols) {
    assert(leadColumns.includes(rc), `leads table contains '${rc}' column`);
  }

  // Verify WAL mode is active
  const pragmaJournal = await db.get("PRAGMA journal_mode");
  assert(pragmaJournal.journal_mode.toLowerCase() === 'wal', `SQLite journal mode is WAL (concurrency safe): ${pragmaJournal.journal_mode}`);

  // Test SQL injection resistance (Parameterization check)
  const sqliPayload = {
    name: "Dr. Robert'); DROP TABLE leads;--",
    email: `sqli_${Date.now()}@security-test.com`,
    phone: "5012345678",
    serviceId: "intl-consult",
    serviceTitle: "International Consulting",
    message: "Testing SQL injection payload handling in message: ' OR '1'='1"
  };
  const sqliRes = await api('/api/leads', { method: 'POST', body: sqliPayload });
  assert(sqliRes.status === 201, 'Parameterized query accepted SQL-like string safely without syntax error');
  const sqliSaved = await db.get("SELECT name, message FROM leads WHERE email = ?", [sqliPayload.email]);
  assert(sqliSaved?.name === sqliPayload.name, 'Name preserved verbatim as safe data string');

  // Verify leads table still exists and intact
  const tableCheck = await db.get("SELECT count(*) as count FROM leads");
  assert(tableCheck.count > 0, `leads table intact after SQLi test (total records: ${tableCheck.count})`);

  // --- SECTION 4: EXISTING WEBSITE REGRESSION TESTING ---
  console.log('\n--- SECTION 4: Existing Website Endpoints & Regressions ---');
  
  // 1. Health check
  const healthRes = await api('/api/health');
  assert(healthRes.status === 200 && healthRes.data.status === 'UP', `Operational health check UP (database: ${healthRes.data.database})`);

  // 2. Jobs
  const jobsRes = await api('/api/jobs');
  assert(jobsRes.status === 200 && Array.isArray(jobsRes.data.data), `Jobs listing API returned ${jobsRes.data.data?.length} jobs`);

  // 3. Candidates
  const candRes = await api('/api/candidates');
  assert(candRes.status === 200 && Array.isArray(candRes.data.data), `Candidates API returned ${candRes.data.data?.length} candidates`);

  // 4. Clients / Organizations
  const clientsRes = await api('/api/clients');
  assert(clientsRes.status === 200 && Array.isArray(clientsRes.data.data), `Organizations/Clients API returned ${clientsRes.data.data?.length} entities`);

  // 5. Interviews
  const interviewsRes = await api('/api/interviews');
  assert(interviewsRes.status === 200 && Array.isArray(interviewsRes.data.data), `Interviews API active (returned ${interviewsRes.data.data?.length} records)`);

  // 6. Visa matrix and evaluation
  const visaMatrix = await api('/api/visa/countries-matrix');
  assert(visaMatrix.status === 200 && Array.isArray(visaMatrix.data.data), `Visa countries matrix returned ${visaMatrix.data.data?.length} countries`);

  const visaCheck = await api('/api/visa/check', {
    method: 'POST',
    body: { country: 'UAE', qualification: "Bachelor's Degree", experience: 4, age: 28, language: 'IELTS 7.0' }
  });
  assert(visaCheck.status === 200 && visaCheck.data.success === true, `Visa eligibility calculated score: ${visaCheck.data.score}/100 (${visaCheck.data.status})`);

  // 7. ATS Resume Analyzer
  const atsRes = await api('/api/resume/analyze', {
    method: 'POST',
    body: { resumeText: 'Executive Project Director with 12 years of experience in UAE FIDIC civil engineering and project management.', targetRole: 'Project Director', industry: 'Construction' }
  });
  assert(atsRes.status === 200 && atsRes.data.data?.atsScore > 0, `ATS Resume Analyzer calculated score: ${atsRes.data.data?.atsScore}%`);

  // 8. AI Chatbot
  const aiChat = await api('/api/ai/chat', {
    method: 'POST',
    body: { message: 'What education consulting and IELTS test preparation options do you provide?' }
  });
  assert(aiChat.status === 200 && aiChat.data.reply.length > 20, 'AI Chatbot returned intelligent contextual response');

  // 9. Payment checkout simulation
  const paymentRes = await api('/api/payments/checkout', {
    method: 'POST',
    body: { gateway: 'stripe', serviceName: 'Executive Consulting Package', amount: 499, currency: 'USD' }
  });
  assert(paymentRes.status === 200 && paymentRes.data.status === 'Completed', `Payment simulation completed with TXN: ${paymentRes.data.transactionId}`);

  // 10. CRM Consulting Metrics
  const metricsRes = await api('/api/crm/consulting/metrics');
  assert(metricsRes.status === 200 && metricsRes.data.success === true, `CRM Consulting metrics active (total inquiries: ${metricsRes.data.metrics?.totalEnquiries})`);

  // --- SECTION 5: SEO ACCEPTANCE VERIFICATION ---
  console.log('\n--- SECTION 5: SEO Acceptance Verification ---');
  
  // 1. robots.txt
  const robotsContent = fs.readFileSync(path.resolve('public/robots.txt'), 'utf8');
  assert(robotsContent.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
  assert(robotsContent.includes('Disallow: /crm'), 'robots.txt disallows private /crm');
  assert(robotsContent.includes('Disallow: /erp'), 'robots.txt disallows private /erp');
  assert(robotsContent.includes('Disallow: /api/'), 'robots.txt disallows /api/');
  assert(robotsContent.includes('Sitemap: https://www.revivalinternational.com/sitemap.xml'), 'robots.txt specifies XML sitemap URL');

  // 2. sitemap.xml
  const sitemapContent = fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8');
  assert(sitemapContent.includes('https://www.revivalinternational.com/services'), 'sitemap.xml includes /services');
  assert(sitemapContent.includes('https://www.revivalinternational.com/international-consulting'), 'sitemap.xml includes /international-consulting');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education'), 'sitemap.xml includes /education');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education/college-admission-assistance'), 'sitemap.xml includes /education/college-admission-assistance');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education/school-student-career-guidance'), 'sitemap.xml includes /education/school-student-career-guidance');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education/international-admissions'), 'sitemap.xml includes /education/international-admissions');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education/academy-for-school-students'), 'sitemap.xml includes /education/academy-for-school-students');
  assert(sitemapContent.includes('https://www.revivalinternational.com/education/executive-seminars-and-language-test-preparation'), 'sitemap.xml includes /education/executive-seminars-and-language-test-preparation');

  // 3. index.html tags
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert(indexHtml.includes('<title>'), 'index.html has <title> tag');
  assert(indexHtml.includes('<meta name="description"'), 'index.html has meta description');
  assert(indexHtml.includes('<link rel="canonical"'), 'index.html has canonical link tag');
  assert(indexHtml.includes('application/ld+json'), 'index.html has JSON-LD structured data');

  // --- SECTION 6: SECURITY & PRODUCTION READINESS ---
  console.log('\n--- SECTION 6: Security & Production Readiness ---');
  
  // 1. .gitignore checks
  const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
  assert(gitignore.includes('.env'), '.gitignore properly excludes .env');
  assert(gitignore.includes('node_modules'), '.gitignore excludes node_modules');
  assert(gitignore.includes('dist/'), '.gitignore excludes dist/');

  // 2. Security headers
  const headRes = await fetch(`${BASE_URL}/api/health`);
  assert(headRes.headers.get('x-content-type-options') === 'nosniff', 'Security header X-Content-Type-Options: nosniff present');
  assert(headRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'Security header X-Frame-Options: SAMEORIGIN present');
  assert(headRes.headers.get('x-xss-protection') === '1; mode=block', 'Security header X-XSS-Protection present');

  // 3. Status Workflow Transitions & Access Control
  const testLead = await db.get("SELECT id FROM leads ORDER BY createdAt DESC LIMIT 1");
  if (testLead) {
    const invalidStatus = await api(`/api/leads/${testLead.id}`, {
      method: 'PATCH',
      body: { status: 'Hacked_Arbitrary_Status' }
    });
    assert(invalidStatus.status === 400 && invalidStatus.data.success === false, 'PATCH /api/leads rejects unauthorized status strings');

    const validStatus = await api(`/api/leads/${testLead.id}`, {
      method: 'PATCH',
      body: { status: 'In Progress', assignedEmployee: 'Senior Counsellor Priya' }
    });
    assert(validStatus.status === 200 && validStatus.data.success === true, 'PATCH /api/leads updates valid workflow status');
  }

  console.log('\n================================================================');
  console.log(`   FINAL ACCEPTANCE RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (defects.length > 0) {
    console.log('\nDefects detected:');
    console.log(JSON.stringify(defects, null, 2));
  }

  await db.close();
  return { passed, failed, defects };
}

runComprehensiveAcceptanceTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

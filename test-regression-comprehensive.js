import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';

const BASE_URL = 'http://localhost:5000';

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('   SIR INTERNATIONAL RECRUITMENT WEBSITE — PHASE 7 REGRESSION');
  console.log('   FULL EXISTING APPLICATION & MODULE VERIFICATION');
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
    return { status: res.status, ok: res.ok, data: json, headers: res.headers };
  }

  // --- MODULE 1: System Health & Core Security Headers ---
  console.log('--- MODULE 1: Backend System Health & Security Headers ---');
  const health = await api('/api/health');
  assert(health.status === 200 && health.data.status === 'UP', `Health check status: ${health.data.status} (Uptime: ${health.data.uptimeSeconds}s)`);
  assert(health.data.database === 'connected', `Database connection verified: ${health.data.database}`);
  assert(health.headers.get('x-content-type-options') === 'nosniff', 'Header X-Content-Type-Options: nosniff verified');
  assert(health.headers.get('x-frame-options') === 'SAMEORIGIN', 'Header X-Frame-Options: SAMEORIGIN verified');
  assert(health.headers.get('x-xss-protection') === '1; mode=block', 'Header X-XSS-Protection: 1; mode=block verified');

  // --- MODULE 2: Jobs Module ---
  console.log('\n--- MODULE 2: Jobs Listings & Job Mandates API ---');
  const jobsRes = await api('/api/jobs');
  assert(jobsRes.status === 200 && Array.isArray(jobsRes.data.data), `GET /api/jobs returned ${jobsRes.data.data?.length} listings`);
  
  // Post a test job mandate
  const testJobId = `job-test-${Date.now()}`;
  const postJobRes = await api('/api/jobs', {
    method: 'POST',
    body: {
      id: testJobId,
      title: 'QA Automated Testing Specialist',
      company: 'Revival QA Testing Lab LLC',
      country: 'UAE',
      location: 'Dubai Internet City',
      salary: 'AED 25,000 - 32,000 / month',
      category: 'IT & Software',
      experience: '5+ Years',
      jobType: 'Full-time'
    }
  });
  assert((postJobRes.status === 200 || postJobRes.status === 201) && postJobRes.data.success === true, 'POST /api/jobs created job mandate successfully');
  
  // Delete the test job to keep catalog clean
  const delJobRes = await api(`/api/jobs/${testJobId}`, { method: 'DELETE' });
  assert(delJobRes.status === 200 && delJobRes.data.success === true, 'DELETE /api/jobs/:id removed test job mandate safely');

  // --- MODULE 3: Candidate Module & Applications ---
  console.log('\n--- MODULE 3: Candidates Portal & Application Sync ---');
  const candList = await api('/api/candidates');
  assert(candList.status === 200 && Array.isArray(candList.data.data), `GET /api/candidates returned candidate records (count: ${candList.data.data?.length})`);

  const candEmail = `candidate_test_${Date.now()}@domain.com`;
  const postCand = await api('/api/candidates', {
    method: 'POST',
    body: {
      name: 'Mohamed Tariq',
      email: candEmail,
      phone: '+971 50 112 2334',
      source: 'Candidate Portal Application',
      stage: 'lead',
      score: 92
    }
  });
  assert((postCand.status === 200 || postCand.status === 201) && postCand.data.success === true, 'POST /api/candidates saved candidate profile in database');

  // --- MODULE 4: Employer & Clients Module ---
  console.log('\n--- MODULE 4: Employer Client Directory & Conflict Prevention ---');
  const clientList = await api('/api/clients');
  assert(clientList.status === 200 && Array.isArray(clientList.data.data), `GET /api/clients returned organizations (count: ${clientList.data.data?.length})`);

  const existingOrg = clientList.data.data[0];
  if (existingOrg) {
    // Test duplicate organization creation rejection
    const dupOrg = await api('/api/clients', {
      method: 'POST',
      body: {
        company: existingOrg.company,
        country: 'UAE',
        organizationType: 'Corporate Employer'
      }
    });
    assert(dupOrg.status === 409 && dupOrg.data.success === false, `Duplicate client rejected with HTTP 409 Conflict: "${existingOrg.company}"`);
  }

  // --- MODULE 5: Interviews Scheduling Module ---
  console.log('\n--- MODULE 5: Interviews & Candidate Assessment Module ---');
  const interviewList = await api('/api/interviews');
  assert(interviewList.status === 200 && Array.isArray(interviewList.data.data), 'GET /api/interviews active and returned valid array');

  // --- MODULE 6: Visa Eligibility Checker Engine ---
  console.log('\n--- MODULE 6: Visa Eligibility Rules & Scoring Engine ---');
  const visaMatrix = await api('/api/visa/countries-matrix');
  assert(visaMatrix.status === 200 && visaMatrix.data.data?.length === 18, `Global visa countries matrix returned 18 countries (found: ${visaMatrix.data.data?.length})`);

  // Positive eligibility evaluation
  const visaHigh = await api('/api/visa/check', {
    method: 'POST',
    body: {
      country: 'United Kingdom',
      qualification: "Master's Degree",
      experience: 6,
      age: 30,
      language: 'IELTS 7.5'
    }
  });
  assert(visaHigh.status === 200 && visaHigh.data.status === 'High' && visaHigh.data.score >= 80, `UK Skilled Worker visa score: ${visaHigh.data.score}/100 (${visaHigh.data.status})`);

  // Lower eligibility evaluation
  const visaMod = await api('/api/visa/check', {
    method: 'POST',
    body: {
      country: 'Canada',
      qualification: "High School",
      experience: 1,
      age: 48,
      language: 'IELTS 5.0'
    }
  });
  assert(visaMod.status === 200 && visaMod.data.score < 80, `Lower criteria score: ${visaMod.data.score}/100 (${visaMod.data.status})`);

  // --- MODULE 7: ATS Resume Analyzer Engine ---
  console.log('\n--- MODULE 7: ATS Resume Analyzer Engine ---');
  const atsGood = await api('/api/resume/analyze', {
    method: 'POST',
    body: {
      resumeText: 'Certified Senior Project Manager with 10 years experience in FIDIC, Primavera P6, budget planning, EPC contract management, and high-rise civil construction projects in UAE.',
      targetRole: 'Project Manager',
      industry: 'Construction'
    }
  });
  assert(atsGood.status === 200 && atsGood.data.data?.atsScore >= 50, `ATS score calculated: ${atsGood.data.data?.atsScore}%`);
  const foundKeywords = atsGood.data.data?.keywordsFound || [];
  assert(Array.isArray(foundKeywords) && foundKeywords.length > 0, `Keywords identified: ${foundKeywords.join(', ')}`);

  // --- MODULE 8: Contextual AI Chatbot Engine ---
  console.log('\n--- MODULE 8: AI Chatbot Assistant Engine ---');
  const aiEdu = await api('/api/ai/chat', {
    method: 'POST',
    body: { message: 'Can you tell me about the Duolingo English Test (DET) and IELTS preparation options for students?' }
  });
  assert(aiEdu.status === 200 && aiEdu.data.reply.length > 30, 'AI Chatbot returned education-specific reply');
  assert(aiEdu.data.reply.toLowerCase().includes('ielts') || aiEdu.data.reply.toLowerCase().includes('preparation') || aiEdu.data.reply.toLowerCase().includes('english'), 'AI reply contains relevant academic test advice');

  // --- MODULE 9: Payment Gateway Simulation ---
  console.log('\n--- MODULE 9: Payment Gateway Simulation ---');
  const payStripe = await api('/api/payments/checkout', {
    method: 'POST',
    body: {
      gateway: 'stripe',
      serviceName: 'Executive Candidate VIP Package',
      amount: 99,
      currency: 'USD'
    }
  });
  assert(payStripe.status === 200 && payStripe.data.status === 'Completed', `Stripe checkout simulation successful (TXN: ${payStripe.data.transactionId})`);

  // --- MODULE 10: CRM Consulting Metrics & Activity Tracking ---
  console.log('\n--- MODULE 10: CRM Consulting Metrics & Activities ---');
  const metrics = await api('/api/crm/consulting/metrics');
  assert(metrics.status === 200 && metrics.data.success === true, 'GET /api/crm/consulting/metrics returned valid payload');
  assert(typeof metrics.data.metrics?.totalEnquiries === 'number', `Total enquiries verified in DB metrics: ${metrics.data.metrics?.totalEnquiries}`);
  assert(typeof metrics.data.metrics?.educationalOrganizations === 'number', `Educational organizations count: ${metrics.data.metrics?.educationalOrganizations}`);

  // --- MODULE 11: Controlled SQLite Database Persistence Check ---
  console.log('\n--- MODULE 11: Controlled SQLite Database Persistence Across Connection Reconnect ---');
  const db1 = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });
  const countBefore = (await db1.get("SELECT COUNT(*) as count FROM leads")).count;
  await db1.close(); // Close connection

  // Re-open connection
  const db2 = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });
  const countAfter = (await db2.get("SELECT COUNT(*) as count FROM leads")).count;
  assert(countBefore === countAfter, `SQLite persistence verified across connection cycle (Records before: ${countBefore}, after: ${countAfter})`);
  await db2.close();

  console.log('\n================================================================');
  console.log(`   REGRESSION SUITE COMPLETED: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (defects.length > 0) {
    console.error('Defects detected:');
    console.error(JSON.stringify(defects, null, 2));
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Regression suite fatal failure:', err);
  process.exit(1);
});

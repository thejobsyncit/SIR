import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run automated functional checks on DB and API
async function runQA() {
  console.log('=== STARTING AUTOMATED QA SUITE ===\n');

  const BASE_URL = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Database Connection & Schema Verification
  console.log('--- TEST GROUP 1: Database Schema ---');
  const db = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });

  const columns = await db.all("PRAGMA table_info(leads)");
  const colNames = columns.map(c => c.name);
  console.log('Leads table columns:', colNames.join(', '));
  assert(colNames.includes('serviceId'), 'leads table contains serviceId column');
  assert(colNames.includes('serviceTitle'), 'leads table contains serviceTitle column');
  assert(colNames.includes('phone'), 'leads table contains phone column');
  assert(colNames.includes('status'), 'leads table contains status column');

  // Helper for HTTP requests
  async function apiRequest(endpoint, method = 'GET', body = null) {
    const res = await (await import('node:http')).default; // using native fetch
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  }
}

// Node 18+ has global fetch, let's use global fetch
async function runQAFull() {
  const BASE_URL = 'http://localhost:5000';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('--- TEST GROUP 1: Database Schema & Integrity ---');
  const db = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });

  const columns = await db.all("PRAGMA table_info(leads)");
  const colNames = columns.map(c => c.name);
  assert(colNames.includes('serviceId'), 'leads table contains serviceId column');
  assert(colNames.includes('serviceTitle'), 'leads table contains serviceTitle column');
  assert(colNames.includes('phone'), 'leads table contains phone column');
  assert(colNames.includes('status'), 'leads table contains status column');

  console.log('\n--- TEST GROUP 2: Backend API Validation (POST /api/leads) ---');
  // Test validation: Empty name
  let res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'test@example.com', phone: '9876543210', message: 'Valid inquiry message here' })
  });
  let json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejected empty name');

  // Test validation: Name < 2 chars
  res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'test@example.com', phone: '9876543210', message: 'Valid inquiry message here' })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejected name with 1 char');

  // Test validation: Invalid email
  res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid User', email: 'not-an-email', phone: '9876543210', message: 'Valid inquiry message here' })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejected invalid email format');

  // Test validation: Short phone (< 7 chars)
  res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid User', email: 'user@example.com', phone: '12345', message: 'Valid inquiry message here' })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejected phone number with < 7 digits');

  // Test validation: Short message (< 10 chars)
  res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid User', email: 'user@example.com', phone: '9876543210', message: 'Hi' })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejected message < 10 characters');

  console.log('\n--- TEST GROUP 3: Inquiries for 6 Academic Services & SQLite Persistence ---');
  const targetServices = [
    { id: 'intl-consult', title: 'International Consulting' },
    { id: 'college-adm', title: 'College Admission Assistance' },
    { id: 'school-career', title: 'School Student Career Guidance' },
    { id: 'intl-adm', title: 'International Admissions' },
    { id: 'school-academy', title: 'Academy for School Students' },
    { id: 'exec-seminars-lang', title: 'Executive Seminars & Language Test Preparation' }
  ];

  for (const srv of targetServices) {
    const payload = {
      name: `QA Tester (${srv.id})`,
      email: `test_${srv.id.replace(/-/g, '_')}@qa-sir.com`,
      phone: '9876543210',
      company: `Service Inquiry: ${srv.title}`,
      serviceId: srv.id,
      serviceTitle: srv.title,
      message: `Automated QA Lead submission test for ${srv.title} (${srv.id})`
    };

    res = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    json = await res.json();
    assert((res.status === 200 || res.status === 201) && json.success === true, `Inquiry accepted for ${srv.id} (${srv.title})`);
    const savedId = json.data?.id;

    // Verify row in SQLite
    const row = await db.get("SELECT * FROM leads WHERE id = ?", [savedId]);
    assert(
      row && row.serviceId === srv.id && row.serviceTitle === srv.title,
      `SQLite correctly persisted lead with serviceId=${srv.id} and serviceTitle`
    );
  }

  console.log('\n--- TEST GROUP 4: Generic Inquiry Submission (No Service ID) ---');
  const genericPayload = {
    name: 'Generic Inquirer',
    email: 'generic@qa-sir.com',
    phone: '9123456789',
    company: 'Individual',
    serviceId: null,
    serviceTitle: null,
    message: 'General inquiry from contact page without service preselection.'
  };
  res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genericPayload)
  });
  json = await res.json();
  assert((res.status === 200 || res.status === 201) && json.success === true, 'Generic inquiry submitted successfully without serviceId');
  const genRow = await db.get("SELECT * FROM leads WHERE id = ?", [json.data?.id]);
  assert(genRow && genRow.serviceId === null, 'Generic inquiry stored with serviceId = null');

  console.log('\n--- TEST GROUP 5: Lead Retrieval & CRM Status Update ---');
  res = await fetch(`${BASE_URL}/api/leads`);
  json = await res.json();
  assert(res.status === 200 && Array.isArray(json.data) && json.data.length >= 7, 'GET /api/leads returns all submitted leads');

  const leadToUpdate = json.data[0];
  res = await fetch(`${BASE_URL}/api/leads/${leadToUpdate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Contacted' })
  });
  json = await res.json();
  assert(res.status === 200 && json.success === true, 'PATCH /api/leads/:id updated status');
  const updatedRow = await db.get("SELECT status FROM leads WHERE id = ?", [leadToUpdate.id]);
  assert(updatedRow.status === 'Contacted', 'SQLite verified status updated to Contacted');

  console.log('\n--- TEST GROUP 6: Regression - Existing Recruitment Endpoints ---');
  res = await fetch(`${BASE_URL}/api/jobs`);
  json = await res.json();
  assert(res.status === 200 && json.success === true && Array.isArray(json.data) && json.data.length > 0, 'GET /api/jobs returns active job listings');

  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log(`========================================`);

  await db.close();
  process.exit(failed > 0 ? 1 : 0);
}

runQAFull().catch(err => {
  console.error('Test suite runtime error:', err);
  process.exit(1);
});

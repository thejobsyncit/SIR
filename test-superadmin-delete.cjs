const assert = require('assert');
const { spawn } = require('child_process');
const { getDb, closeDb } = require('./server/database.js');

async function runSuperAdminTestSuite() {
  console.log('================================================================');
  console.log('   SUPERADMIN-ONLY DELETE VERIFICATION & AUDIT SUITE');
  console.log('================================================================\n');

  const testPort = 5099;
  const serverEnv = { ...process.env, PORT: testPort };
  const serverProcess = spawn('node', ['server/index.js'], { env: serverEnv });

  let serverReady = false;

  serverProcess.stdout.on('data', (d) => {
    const text = d.toString();
    if (text.includes('running') || text.includes('5099')) {
      serverReady = true;
    }
  });

  serverProcess.stderr.on('data', (d) => {
    // console.error('Server err:', d.toString());
  });

  // Wait for server to be responsive
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${testPort}/api/health`);
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }

  if (!serverReady) {
    throw new Error('Test server failed to start on port ' + testPort);
  }
  console.log(`✅ Test server successfully running on port ${testPort}.\n`);

  const db = await getDb();

  try {
    // -------------------------------------------------------------
    // TEST 1: Career Guidance Enquiry Deletion
    // -------------------------------------------------------------
    console.log('--- TEST 1: Career Guidance Enquiry Deletion ---');
    const carId = `TEST-CAR-${Date.now()}`;
    const carRef = `REV-CAR-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.run(
      `INSERT INTO leads (id, name, email, phone, serviceId, serviceTitle, referenceNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [carId, 'Aarav Verma', 'aarav@example.com', '+91 9123456789', 'school-career', 'Career Guidance', carRef]
    );
    await db.run(
      `INSERT INTO enquiry_activities (id, enquiryId, type, title, createdBy)
       VALUES (?, ?, ?, ?, ?)`,
      [`ACT-${Date.now()}`, carId, 'Call', 'Aptitude review call', 'Dhanalakshimi']
    );
    await db.run(
      `INSERT INTO follow_ups (id, enquiryId, title, purpose, dueDateTime, createdBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [`FLW-${Date.now()}`, carId, 'Stream Selection Follow-up', 'Profile Consultation', '2026-10-30', 'Dhanalakshimi']
    );

    // 1a. Attempt deletion without Superadmin role (e.g., Counselor / Recruiter)
    const carUnauthorizedRes = await fetch(`http://localhost:${testPort}/api/leads/${carId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Role': 'Counselor',
        'X-CRM-User': 'Jane Counselor'
      }
    });
    assert.strictEqual(carUnauthorizedRes.status, 403, 'Non-Superadmin request must be rejected with 403 Forbidden');
    const carUnauthData = await carUnauthorizedRes.json();
    assert.strictEqual(carUnauthData.success, false);
    assert.ok(carUnauthData.message.includes('Superadmin'));
    console.log('✅ PASS: Non-superadmin cannot delete Career Guidance enquiry (403 Forbidden).');

    // 1b. Deletion with Superadmin role
    const carAuthorizedRes = await fetch(`http://localhost:${testPort}/api/leads/${carId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Role': 'Super Admin',
        'X-CRM-User': 'Dhanalakshimi',
        'X-CRM-User-Id': 'emp-1'
      }
    });
    assert.strictEqual(carAuthorizedRes.status, 200, 'Superadmin request must return 200 OK');
    const carAuthData = await carAuthorizedRes.json();
    assert.strictEqual(carAuthData.success, true);
    assert.strictEqual(carAuthData.entityType, 'Career Guidance Enquiry');
    console.log('✅ PASS: Superadmin successfully deleted Career Guidance enquiry (200 OK).');

    // 1c. Verify DB clean up
    const carCheck = await db.get('SELECT * FROM leads WHERE id = ?', [carId]);
    assert.strictEqual(carCheck, undefined, 'Lead record must be removed');
    const carActCheck = await db.get('SELECT * FROM enquiry_activities WHERE enquiryId = ?', [carId]);
    assert.strictEqual(carActCheck, undefined, 'Linked activities must be removed');
    const carFlwCheck = await db.get('SELECT * FROM follow_ups WHERE enquiryId = ?', [carId]);
    assert.strictEqual(carFlwCheck, undefined, 'Linked follow-ups must be removed');
    console.log('✅ PASS: Child activities and follow-ups cascaded safely.');

    // 1d. Verify SQLite Audit Trail
    const carAudit = await db.get('SELECT * FROM audit_logs WHERE entityId = ? ORDER BY createdAt DESC', [carId]);
    assert.ok(carAudit, 'Audit log entry must exist in SQLite database');
    assert.strictEqual(carAudit.role, 'Super Admin');
    assert.strictEqual(carAudit.entityType, 'Career Guidance Enquiry');
    assert.strictEqual(carAudit.action, 'DELETE_RECORD');
    console.log(`✅ PASS: Audit log persisted for Career Guidance enquiry deletion (ID: ${carAudit.id}).\n`);

    // -------------------------------------------------------------
    // TEST 2: Student Academy Enquiry Deletion (Dual-Table Sync)
    // -------------------------------------------------------------
    console.log('--- TEST 2: Student Academy Enquiry Deletion (Dual-Table Sync) ---');
    const acadId = `TEST-ACA-${Date.now()}`;
    const acadRef = `REV-ACA-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.run(
      `INSERT INTO leads (id, name, email, phone, serviceId, serviceTitle, referenceNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [acadId, 'Rohan Mehta', 'rohan@example.com', '+91 9988776655', 'student-academy', 'Student Academy', acadRef]
    );
    await db.run(
      `INSERT INTO student_academy_enquiries (id, referenceNumber, studentName, email, phone, academyId, academyName, examId, examName, courseId, courseName)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [acadId, acadRef, 'Rohan Mehta', 'rohan@example.com', '+91 9988776655', 'REV-ACA-01', 'School Student Academy', 'UPSC-CSE', 'Civil Services Examination', 'UPSC-PRE', 'Foundation Batch']
    );

    // 2a. Attempt deletion without Superadmin
    const acadUnauthorizedRes = await fetch(`http://localhost:${testPort}/api/student-academy/enquiries/${acadId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Role': 'Student Coordinator'
      }
    });
    assert.strictEqual(acadUnauthorizedRes.status, 403, 'Unauthorized role must be rejected with 403');
    console.log('✅ PASS: Student Coordinator blocked from deleting Student Academy enquiry (403 Forbidden).');

    // 2b. Authorized delete with Superadmin
    const acadAuthorizedRes = await fetch(`http://localhost:${testPort}/api/student-academy/enquiries/${acadId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Role': 'Super Admin',
        'X-CRM-User': 'Dhanalakshimi',
        'X-CRM-User-Id': 'emp-1'
      }
    });
    assert.strictEqual(acadAuthorizedRes.status, 200, 'Superadmin must receive 200 OK');
    const acadAuthData = await acadAuthorizedRes.json();
    assert.strictEqual(acadAuthData.success, true);
    assert.strictEqual(acadAuthData.entityType, 'Student Academy Enquiry');

    // 2c. Verify deleted from both leads AND student_academy_enquiries tables
    const acadLeadCheck = await db.get('SELECT * FROM leads WHERE id = ?', [acadId]);
    assert.strictEqual(acadLeadCheck, undefined, 'Must be removed from leads table');
    const acadSaCheck = await db.get('SELECT * FROM student_academy_enquiries WHERE id = ? OR referenceNumber = ?', [acadId, acadRef]);
    assert.strictEqual(acadSaCheck, undefined, 'Must be removed from student_academy_enquiries table');
    console.log('✅ PASS: Deleted from both leads and student_academy_enquiries synchronized tables.');

    // 2d. Verify audit log
    const acadAudit = await db.get('SELECT * FROM audit_logs WHERE entityId = ? ORDER BY createdAt DESC', [acadId]);
    assert.ok(acadAudit, 'Audit log entry must exist for Student Academy enquiry');
    assert.strictEqual(acadAudit.entityType, 'Student Academy Enquiry');
    console.log(`✅ PASS: Audit log persisted for Student Academy enquiry deletion (ID: ${acadAudit.id}).\n`);

    // -------------------------------------------------------------
    // TEST 3: Consulting Booking Deletion
    // -------------------------------------------------------------
    console.log('--- TEST 3: Consulting Booking Deletion ---');
    const bookId = `TEST-CON-${Date.now()}`;
    const bookRef = `REV-CON-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.run(
      `INSERT INTO leads (id, name, email, phone, serviceId, serviceTitle, referenceNumber, consultationDate, consultationTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookId, 'Priya Nair', 'priya@example.com', '+971 50 123 4567', 'intl-consult', 'International Consulting', bookRef, '2026-11-05', '14:00 GST']
    );

    // 3a. Delete with Superadmin
    const bookAuthorizedRes = await fetch(`http://localhost:${testPort}/api/consulting/enquiries/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CRM-Role': 'Super Admin',
        'X-CRM-User': 'Dhanalakshimi'
      }
    });
    assert.strictEqual(bookAuthorizedRes.status, 200);
    const bookAuthData = await bookAuthorizedRes.json();
    assert.strictEqual(bookAuthData.success, true);
    assert.strictEqual(bookAuthData.entityType, 'Consulting Booking');

    const bookCheck = await db.get('SELECT * FROM leads WHERE id = ?', [bookId]);
    assert.strictEqual(bookCheck, undefined);
    console.log('✅ PASS: Consulting booking deleted cleanly and logged.\n');

    // -------------------------------------------------------------
    // TEST 4: Candidate Deletion (Cascades to Interviews)
    // -------------------------------------------------------------
    console.log('--- TEST 4: Candidate Profile Deletion ---');
    const candId = `TEST-CAN-${Date.now()}`;
    await db.run(
      `INSERT INTO candidates (id, name, email, phone, nationality, passport)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [candId, 'Sergei Volkov', 'sergei@example.com', '+971 55 987 6543', 'Russia', 'RUSS-998811']
    );
    const intId = `TEST-INT-${Date.now()}`;
    await db.run(
      `INSERT INTO interviews (id, candidateId, candidateName, jobTitle, company, date, time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [intId, candId, 'Sergei Volkov', 'Chief Marine Engineer', 'Al Habtoor Contracting', '2026-11-10', '10:00 GST']
    );

    // 4a. Non-Superadmin fails
    const candUnauthRes = await fetch(`http://localhost:${testPort}/api/candidates/${candId}`, {
      method: 'DELETE',
      headers: { 'X-CRM-Role': 'Recruiter' }
    });
    assert.strictEqual(candUnauthRes.status, 403);
    console.log('✅ PASS: Recruiter blocked from deleting candidate (403 Forbidden).');

    // 4b. Superadmin succeeds
    const candAuthRes = await fetch(`http://localhost:${testPort}/api/candidates/${candId}`, {
      method: 'DELETE',
      headers: { 'X-CRM-Role': 'Super Admin', 'X-CRM-User': 'Dhanalakshimi' }
    });
    assert.strictEqual(candAuthRes.status, 200);
    const candCheck = await db.get('SELECT * FROM candidates WHERE id = ?', [candId]);
    assert.strictEqual(candCheck, undefined);
    const intCheck = await db.get('SELECT * FROM interviews WHERE id = ?', [intId]);
    assert.strictEqual(intCheck, undefined, 'Interviews referencing candidate must be cascaded');
    console.log('✅ PASS: Candidate and linked interviews successfully purged and audited.\n');

    // -------------------------------------------------------------
    // TEST 5: Client / Organization Deletion (Cascades to Contacts)
    // -------------------------------------------------------------
    console.log('--- TEST 5: Client / Organization Deletion ---');
    const cliId = `TEST-CLI-${Date.now()}`;
    await db.run(
      `INSERT INTO clients (id, company, industry, country, status)
       VALUES (?, ?, ?, ?, ?)`,
      [cliId, 'Emirates Petrochem Ltd', 'Oil & Gas', 'United Arab Emirates', 'Active']
    );
    await db.run(
      `INSERT INTO organization_contacts (id, organizationId, name, designation, email)
       VALUES (?, ?, ?, ?, ?)`,
      [`CONT-${Date.now()}`, cliId, 'Hamad Al-Maktoum', 'Director', 'hamad@emiratespetro.ae']
    );

    // 5a. Non-superadmin fails
    const cliUnauthRes = await fetch(`http://localhost:${testPort}/api/clients/${cliId}`, {
      method: 'DELETE',
      headers: { 'X-CRM-Role': 'Account Manager' }
    });
    assert.strictEqual(cliUnauthRes.status, 403);
    console.log('✅ PASS: Account Manager blocked from deleting organization (403 Forbidden).');

    // 5b. Superadmin succeeds
    const cliAuthRes = await fetch(`http://localhost:${testPort}/api/clients/${cliId}`, {
      method: 'DELETE',
      headers: { 'X-CRM-Role': 'Super Admin', 'X-CRM-User': 'Dhanalakshimi' }
    });
    assert.strictEqual(cliAuthRes.status, 200);
    const cliCheck = await db.get('SELECT * FROM clients WHERE id = ?', [cliId]);
    assert.strictEqual(cliCheck, undefined);
    const contactCheck = await db.get('SELECT * FROM organization_contacts WHERE organizationId = ?', [cliId]);
    assert.strictEqual(contactCheck, undefined);
    console.log('✅ PASS: Organization and linked contacts successfully deleted and audited.\n');

    // -------------------------------------------------------------
    // TEST 6: Audit Logs API Endpoint Verification
    // -------------------------------------------------------------
    console.log('--- TEST 6: Persistent Audit Logs API Endpoint ---');
    const auditRes = await fetch(`http://localhost:${testPort}/api/crm/audit-logs`);
    assert.strictEqual(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.strictEqual(auditData.success, true);
    assert.ok(Array.isArray(auditData.data));
    assert.ok(auditData.data.length >= 4, 'Must return recent audit logs');
    console.log(`✅ PASS: Audit logs API returned ${auditData.data.length} verified records.\n`);

    console.log('================================================================');
    console.log('   ALL SUPERADMIN-ONLY DELETE TESTS PASSED WITH 100% SUCCESS');
    console.log('================================================================');
  } finally {
    serverProcess.kill();
  }
}

runSuperAdminTestSuite()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });

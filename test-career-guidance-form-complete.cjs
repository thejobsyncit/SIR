/**
 * Revival International — Complete Career Guidance Consultation Form Test Suite
 * Comprehensive verification of Frontend Validation, Selected Course Mapping,
 * Backend API, Database Persistence, Security, and CRM Dashboard Integration.
 */

const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'server/sir_recruitment.db');

function apiRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function queryDb(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows);
      });
    });
  });
}

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(condition, description, detail = '') {
  if (condition) {
    passedCount++;
    results.push({ status: 'PASS', description });
    console.log(`  ✅ PASS: ${description}`);
  } else {
    failedCount++;
    results.push({ status: 'FAIL', description, detail });
    console.error(`  ❌ FAIL: ${description} ${detail ? `(${detail})` : ''}`);
  }
}

async function runAllTests() {
  console.log('\n================================================================');
  console.log('   REVIVAL INTERNATIONAL — CAREER GUIDANCE FORM VERIFICATION');
  console.log('   COMPLETE FRONTEND VALIDATION, COURSE MAPPING, CRM & SECURITY');
  console.log('================================================================\n');

  const ts = Date.now();

  // -------------------------------------------------------------
  // SECTION 1: FIELD VALIDATION & REJECTION RULES (BACKEND & API)
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Field Validation & Rejection Testing ---');

  // Test 1: Empty submission
  let res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {}
  });
  assert(res.status === 400 && res.data.success === false, 'Submit form with all fields empty is rejected (HTTP 400)');

  // Test 2: Only 1 required field completed (e.g., name only)
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: { name: 'Aarav Sharma' }
  });
  assert(res.status === 400 && res.data.success === false, 'Submit with only name completed is rejected (HTTP 400)');

  // Test 3: Name with 1 character
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'A',
      email: `valid_${ts}@example.com`,
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('between 2 and 100 characters'), 'Submit with 1-character name is rejected (HTTP 400)');

  // Test 4: Name consisting only of numbers
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: '1234567',
      email: `num_${ts}@example.com`,
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('cannot consist only of numbers'), 'Submit with numbers-only name is rejected (HTTP 400)');

  // Test 5: Name containing numbers or unsupported special characters
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Naveen123 Sharma',
      email: `num_name_${ts}@example.com`,
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('cannot contain numbers or unsupported special characters'), 'Submit with name containing numbers is rejected (HTTP 400)');

  // Test 6: Invalid email format (missing @)
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Aarav Sharma',
      email: 'invalid-email-format',
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('valid business or personal email'), 'Submit with malformed email is rejected (HTTP 400)');

  // Test 7: Email without domain extension (e.g. user@domain)
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Aarav Sharma',
      email: 'aarav@domain',
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('valid business or personal email'), 'Submit with email lacking domain extension is rejected (HTTP 400)');

  // Test 8: Invalid phone number (< 7 digits)
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Aarav Sharma',
      email: `valid_phone_${ts}@example.com`,
      phone: '12345',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('valid phone number'), 'Submit with phone number < 7 digits is rejected (HTTP 400)');

  // Test 9: Empty Current School / College for Career Guidance
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Aarav Sharma',
      email: `empty_school_${ts}@example.com`,
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: '',
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('school or college name is required'), 'Submit with empty Current School / College is rejected (HTTP 400)');

  // Test 10: Missing consent for Career Guidance
  res = await apiRequest('/api/leads', {
    method: 'POST',
    body: {
      name: 'Aarav Sharma',
      email: `no_consent_${ts}@example.com`,
      phone: '+91 98765 43210',
      serviceId: 'school-career',
      organizationName: 'Delhi Public School',
      consent: false,
      message: 'Valid enquiry message for career consultation'
    }
  });
  assert(res.status === 400 && res.data.message.includes('consent to proceed'), 'Submit without communication consent is rejected (HTTP 400)');

  // -------------------------------------------------------------
  // SECTION 2: SUCCESSFUL CAREER GUIDANCE ENQUIRY SUBMISSIONS
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: Course Selection & Successful Submissions ---');

  const testCourses = [
    {
      name: 'Aarav Sharma',
      course: 'Computer Science and Engineering',
      abbr: 'CSE',
      stream: 'Computer Science & Information Technology',
      level: 'Undergraduate (Bachelor Degree)',
      degLevel: 'UG',
      degrees: ['B.Tech', 'B.E.'],
      duration: '4 Years (8 Semesters)',
      dest: 'India',
      school: 'Delhi Public School, R.K. Puram'
    },
    {
      name: 'Priya Patel',
      course: 'Artificial Intelligence & Machine Learning',
      abbr: 'AIML',
      stream: 'Computer Science & Information Technology',
      level: 'Undergraduate (Bachelor Degree)',
      degLevel: 'UG',
      degrees: ['B.Tech'],
      duration: '4 Years (8 Semesters)',
      dest: 'United States',
      school: 'Modern High School, Mumbai'
    },
    {
      name: 'Rohan Gupta',
      course: 'Bachelor of Computer Applications',
      abbr: 'BCA',
      stream: 'Computer Science & Information Technology',
      level: 'Undergraduate (Bachelor Degree)',
      degLevel: 'UG',
      degrees: ['BCA'],
      duration: '3 Years (6 Semesters)',
      dest: 'India',
      school: 'St. Xavier College Higher Secondary'
    },
    {
      name: 'Ananya Sen',
      course: 'Master of Business Administration',
      abbr: 'MBA',
      stream: 'Management & Business Studies',
      level: 'Postgraduate (Master Degree / MBA)',
      degLevel: 'PG',
      degrees: ['MBA'],
      duration: '2 Years (4 Semesters)',
      dest: 'United Kingdom',
      school: 'IIT Madras Undergraduate Campus'
    },
    {
      name: 'Vikramaditya Singh',
      course: 'Master of Technology in Data Science',
      abbr: 'M.Tech DS',
      stream: 'Computer Science & Information Technology',
      level: 'Postgraduate (Master Degree / MBA)',
      degLevel: 'PG',
      degrees: ['M.Tech'],
      duration: '2 Years (4 Semesters)',
      dest: 'Germany',
      school: 'Anna University College of Engineering'
    },
    {
      name: 'Meera Nair',
      course: 'Master of Computer Applications',
      abbr: 'MCA',
      stream: 'Computer Science & Information Technology',
      level: 'Postgraduate (Master Degree / MBA)',
      degLevel: 'PG',
      degrees: ['MCA'],
      duration: '2 Years (4 Semesters)',
      dest: 'India',
      school: 'Loyola College Chennai'
    }
  ];

  const submittedRefs = [];

  for (let i = 0; i < testCourses.length; i++) {
    const c = testCourses[i];
    const email = `career_cand_${c.abbr.toLowerCase().replace(/[^a-z]/g, '')}_${ts}@sir-academic.com`;
    const payload = {
      name: c.name,
      email: email,
      phone: `+91 98765 ${43210 + i}`,
      serviceId: 'school-career',
      serviceTitle: `Career Guidance | ${c.course}`,
      company: c.school,
      organizationName: c.school,
      degreeLevel: c.level,
      countryInterest: c.dest,
      assistanceType: c.course,
      status: 'New Enquiry',
      courseName: c.course,
      streamName: c.stream,
      department: c.stream,
      consent: true,
      customFields: JSON.stringify({
        organization: c.school,
        programLevel: c.level,
        degreeLevel: c.degLevel,
        countryInterest: c.dest,
        selectedCourse: c.course,
        courseName: c.course,
        courseAbbr: c.abbr,
        streamName: c.stream,
        department: c.stream,
        degrees: c.degrees,
        duration: c.duration,
        consent: true
      }),
      message: `[Career Guidance Academic Consultation Request]\nSelected Course: ${c.course}\nLevel: ${c.level}\nStream: ${c.stream}\nTarget Destination: ${c.dest}\nCurrent Institution: ${c.school}`
    };

    const submitRes = await apiRequest('/api/leads', { method: 'POST', body: payload });
    assert(submitRes.status === 201 && submitRes.data.success === true, `Submission accepted for ${c.abbr} (${c.level}) (HTTP 201)`);
    
    const refCode = submitRes.data.data?.referenceNumber;
    assert(refCode && refCode.startsWith('REV-CAR-2026-'), `Generated official reference ID starting with REV-CAR-2026: ${refCode}`);
    submittedRefs.push({ ...c, refCode, email, id: submitRes.data.data?.id });

    // Test duplicate submission prevention (within 30s)
    const dupRes = await apiRequest('/api/leads', { method: 'POST', body: payload });
    assert(dupRes.status === 409, `Duplicate submission within 30s safely rejected for ${c.abbr} (HTTP 409)`);
  }

  // -------------------------------------------------------------
  // SECTION 3: DATABASE PERSISTENCE & DATA INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: SQLite Database Persistence & Data Integrity ---');

  for (const item of submittedRefs) {
    const rows = await queryDb('SELECT * FROM leads WHERE referenceNumber = ?', [item.refCode]);
    assert(rows.length === 1, `Exactly one database record exists for reference ${item.refCode}`);
    
    const lead = rows[0];
    assert(lead.serviceId === 'school-career', `serviceId matches 'school-career' for ${item.abbr}`);
    assert(lead.name === item.name, `Full name '${item.name}' saved accurately for ${item.abbr}`);
    assert(lead.email === item.email, `Email saved accurately for ${item.abbr}`);
    assert(lead.courseName === item.course, `courseName '${item.course}' saved in dedicated DB column`);
    assert(lead.streamName === item.stream, `streamName '${item.stream}' saved in dedicated DB column`);
    assert(lead.organizationName === item.school, `organizationName '${item.school}' saved accurately`);
    assert(lead.degreeLevel === item.level, `degreeLevel '${item.level}' saved accurately`);
    assert(lead.countryInterest === item.dest, `countryInterest '${item.dest}' saved accurately`);
    assert(lead.status === 'New Enquiry', `status initialized to 'New Enquiry'`);

    // Verify customFields JSON parsing
    let custom = {};
    try {
      custom = JSON.parse(lead.customFields);
    } catch (_) {}
    assert(custom.courseAbbr === item.abbr, `customFields contains courseAbbr '${item.abbr}'`);
    assert(custom.duration === item.duration, `customFields contains duration '${item.duration}'`);
    assert(custom.consent === true, `customFields contains consent=true`);
  }

  // -------------------------------------------------------------
  // SECTION 4: CRM CAREER GUIDANCE DASHBOARD INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: CRM Dashboard Query & Metrics Integration ---');

  // Query CRM Career Guidance endpoint
  const crmRes = await apiRequest('/api/career-guidance/enquiries');
  assert(crmRes.status === 200, 'CRM Career Guidance enquiries endpoint responds with HTTP 200');
  const leadsList = Array.isArray(crmRes.data) ? crmRes.data : (crmRes.data?.data || []);
  assert(Array.isArray(leadsList) && leadsList.length > 0, `CRM returns array of Career Guidance enquiry records (count: ${leadsList.length})`);

  for (const item of submittedRefs) {
    const found = leadsList.find(l => l.referenceNumber === item.refCode);
    assert(found !== undefined, `Submitted enquiry ${item.refCode} (${item.abbr}) appears in CRM Career Guidance feed`);
    if (found) {
      assert(found.courseName === item.course, `CRM feed preserves complete course name '${item.course}' without truncation`);
      assert(found.organizationName === item.school, `CRM feed preserves school '${item.school}'`);
    }
  }

  // Query Career Guidance metrics endpoint
  const metricsRes = await apiRequest('/api/crm/career-guidance/metrics');
  assert(metricsRes.status === 200, 'Career Guidance metrics endpoint responds with HTTP 200');
  const metrics = metricsRes.data?.data || metricsRes.data?.metrics || metricsRes.data;
  const totalInMetrics = metrics?.totalEnquiries !== undefined ? metrics.totalEnquiries : (metrics?.total || 0);
  assert(totalInMetrics >= submittedRefs.length, `Career Guidance total enquiries count reflects submissions (total: ${totalInMetrics})`);

  // Test updating status via CRM
  const sampleRef = submittedRefs[0];
  const patchRes = await apiRequest(`/api/career-guidance/enquiries/${sampleRef.refCode}`, {
    method: 'PATCH',
    headers: { 'x-crm-role': 'Super Admin' },
    body: { status: 'Consultation Scheduled', assignedEmployee: 'Dhanalakshimi' }
  });
  assert(patchRes.status === 200 && patchRes.data?.success === true, `CRM successfully updates lead status to 'Consultation Scheduled'`);

  // Verify status updated in DB
  const updatedDb = await queryDb('SELECT status, assignedEmployee FROM leads WHERE referenceNumber = ?', [sampleRef.refCode]);
  assert(updatedDb[0]?.status === 'Consultation Scheduled', `Database reflects updated status 'Consultation Scheduled'`);
  assert(updatedDb[0]?.assignedEmployee === 'Dhanalakshimi', `Database reflects assigned advisor 'Dhanalakshimi'`);

  // -------------------------------------------------------------
  // SECTION 5: SECURITY & SQL INJECTION RESISTANCE
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: Security & SQL Injection Resistance ---');

  const sqliAttempt = {
    name: "Aarav'); DROP TABLE leads;--",
    email: `sqli_career_${ts}@security.com`,
    phone: '+91 98765 43210',
    serviceId: 'school-career',
    organizationName: "Delhi Public School'); DELETE FROM leads;--",
    message: "SQL Injection testing in message body ' OR '1'='1"
  };

  // Name containing SQL chars should be rejected by name format validator
  const sqliRes = await apiRequest('/api/leads', { method: 'POST', body: sqliAttempt });
  assert(sqliRes.status === 400, 'Special characters / SQL payload in student name safely rejected by validation (HTTP 400)');

  // Verify DB table intact
  const verifyDb = await queryDb('SELECT count(*) as cnt FROM leads');
  assert(verifyDb[0]?.cnt > 0, `Leads database table remains completely intact (total records: ${verifyDb[0]?.cnt})`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`   CAREER GUIDANCE TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

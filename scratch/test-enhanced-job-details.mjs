import http from 'http';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function verifyAll() {
  console.log('=== VERIFYING ENHANCED JOB DETAILS & FILTER SYMBOLS ===\n');
  let passed = 0;
  let total = 0;

  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} -> ${details}`);
    }
  }

  try {
    // 1. GET /api/jobs returns jobs with new fields
    const r1 = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs', method: 'GET' });
    assert('API /api/jobs returns 200', r1.status === 200);
    const jobs = r1.body?.data || [];
    assert('Returned jobs array is non-empty', Array.isArray(jobs) && jobs.length > 0, `Count: ${jobs.length}`);

    const sampleJob = jobs.find(j => j.id === 'job-101');
    assert('Sample job (job-101) has educationLevel', Boolean(sampleJob?.educationLevel), sampleJob?.educationLevel);
    assert('Sample job has visaSponsorship', Boolean(sampleJob?.visaSponsorship), sampleJob?.visaSponsorship);
    assert('Sample job has contractType', Boolean(sampleJob?.contractType), sampleJob?.contractType);
    assert('Sample job has accommodation', Boolean(sampleJob?.accommodation), sampleJob?.accommodation);
    assert('Sample job has transportation', Boolean(sampleJob?.transportation), sampleJob?.transportation);
    assert('Sample job has closingDate', Boolean(sampleJob?.closingDate), sampleJob?.closingDate);
    assert('Sample job has benefits array', Array.isArray(sampleJob?.benefits) && sampleJob.benefits.length > 0, JSON.stringify(sampleJob?.benefits));

    // 2. Expired vacancy rejection: job-116
    const expiredJob = jobs.find(j => j.id === 'job-116');
    assert('Expired job (job-116) exists with past deadline', Boolean(expiredJob && expiredJob.closingDate === '2026-10-15'), expiredJob?.closingDate);

    const appPayload = {
      jobId: 'job-116',
      jobTitle: expiredJob.title,
      company: expiredJob.company,
      name: 'Test Candidate',
      email: 'test.candidate@example.com',
      phone: '+971 50 123 9999',
      referenceNumber: 'RI-APP-TEST-EXPIRED'
    };

    const rExpiredApp = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/candidate/applications',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, appPayload);

    assert('Application for expired job-116 rejected with HTTP 400', rExpiredApp.status === 400, `Status: ${rExpiredApp.status}`);
    const errText = rExpiredApp.body?.error || rExpiredApp.body?.message || '';
    assert('Error message mentions vacancy closed', errText.toLowerCase().includes('closed'), errText);

    // 3. Active vacancy application accepts: job-101
    const activeAppPayload = {
      jobId: 'job-101',
      jobTitle: sampleJob.title,
      company: sampleJob.company,
      name: 'Verification Candidate',
      email: 'verification.candidate@example.com',
      phone: '+971 50 123 8888',
      referenceNumber: `RI-APP-VERIF-${Date.now()}`
    };

    const rActiveApp = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/candidate/applications',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, activeAppPayload);

    assert('Application for active job-101 accepted with HTTP 200/201', [200, 201].includes(rActiveApp.status), `Status: ${rActiveApp.status}`);

    // 4. Visa Sponsorship filter query
    const rVisa = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs?visaSponsorship=provided', method: 'GET' });
    const visaJobs = rVisa.body?.data || [];
    assert('Visa sponsorship filter returns matching jobs', visaJobs.length > 0 && visaJobs.every(j => j.visaSponsorship === 'Visa sponsorship provided'), `Count: ${visaJobs.length}`);

    // 5. Contract type filter query
    const rContract = await request({ hostname: 'localhost', port: 5000, path: '/api/jobs?contractType=Permanent', method: 'GET' });
    const permJobs = rContract.body?.data || [];
    assert('Contract type filter returns matching jobs', permJobs.length > 0 && permJobs.every(j => j.contractType === 'Permanent'), `Count: ${permJobs.length}`);

    console.log(`\nVerification complete: ${passed}/${total} checks passed.`);
    if (passed === total) {
      console.log('ALL ENHANCED JOB DETAILS & DEADLINE CHECKS PASSED!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

verifyAll();

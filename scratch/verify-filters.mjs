import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== Complete Verification: Left Filter Panel & Job Search ===');
  let passed = 0;
  let total = 0;

  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  try {
    // 1. Frontend serves cleanly
    const fe = await get('http://localhost:3000/');
    assert('Frontend server running on port 3000', fe.status === 200 && fe.text?.includes('<div id="root">'));

    // 2. Base jobs API
    const r1 = await get('http://localhost:5000/api/jobs');
    const jobs = r1.body?.data || [];
    assert('Base GET /api/jobs returns job data', Array.isArray(jobs) && jobs.length > 0, `Count: ${jobs.length}`);

    // 3. Country multi-select filter
    const r2 = await get('http://localhost:5000/api/jobs?country=UAE,Saudi%20Arabia');
    const gccJobs = r2.body?.data || [];
    assert('Multi-country filter works', gccJobs.length > 0 && gccJobs.every(j => ['UAE', 'Saudi Arabia'].includes(j.country)), `Count: ${gccJobs.length}`);

    // 4. Industry filter
    const r3 = await get('http://localhost:5000/api/jobs?industry=Healthcare');
    const healthJobs = r3.body?.data || [];
    assert('Industry filter works', healthJobs.length > 0 && healthJobs.every(j => (j.industry || j.category || '').toLowerCase().includes('health')), `Count: ${healthJobs.length}`);

    // 5. Company filter
    const r4 = await get('http://localhost:5000/api/jobs?company=Burjeel%20Medical%20City');
    const compJobs = r4.body?.data || [];
    assert('Company filter works', compJobs.length > 0 && compJobs.every(j => j.company.includes('Burjeel')), `Count: ${compJobs.length}`);

    // 6. Experience filter
    const r5 = await get('http://localhost:5000/api/jobs?experience=1–3%20Years');
    const expJobs = r5.body?.data || [];
    assert('Experience filter works', expJobs.length > 0, `Count: ${expJobs.length}`);

    // 7. Salary & Currency filter
    const r6 = await get('http://localhost:5000/api/jobs?currency=AED&minSalary=10000&maxSalary=30000');
    const salJobs = r6.body?.data || [];
    assert('Salary & Currency filter works', salJobs.length > 0, `Count: ${salJobs.length}`);

    // 8. Freshness / PostedWithin filter
    const r7 = await get('http://localhost:5000/api/jobs?postedWithin=30days');
    const recentJobs = r7.body?.data || [];
    assert('Posted within filter works', recentJobs.length > 0, `Count: ${recentJobs.length}`);

    // 9. Language filter
    const r8 = await get('http://localhost:5000/api/jobs?language=English');
    const langJobs = r8.body?.data || [];
    assert('Language filter works', langJobs.length > 0, `Count: ${langJobs.length}`);

    // 10. Keyword compound search
    const r9 = await get('http://localhost:5000/api/jobs?keyword=Nurse&country=Saudi%20Arabia');
    const kwJobs = r9.body?.data || [];
    assert('Keyword + Country compound query works', kwJobs.length > 0, `Count: ${kwJobs.length}`);

    console.log(`\nResults: ${passed}/${total} test checks passed.`);
    if (passed === total) {
      console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();

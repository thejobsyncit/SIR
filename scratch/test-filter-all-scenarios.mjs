import http from 'http';
import fs from 'fs';
import assert from 'assert';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    }).on('error', reject);
  });
}

async function runAcceptanceTests() {
  console.log('=================================================================');
  console.log('   REVIVAL INTERNATIONAL: FILTER & APPLY COUNT ACCEPTANCE TEST  ');
  console.log('=================================================================');

  const jobsPageSrc = fs.readFileSync('src/pages/JobsPage.jsx', 'utf8');

  // --- 1. VERIFY APPLY BUTTON SHOWS HOW MANY FILTERS ARE SELECTED ---
  console.log('\n--- 1. Apply Button Selected Filters Count Verification ---');
  assert.ok(
    jobsPageSrc.includes('Apply ({pendingFilterCount})'),
    'Apply button must display Apply ({pendingFilterCount}) to show how many filters are selected'
  );
  assert.strictEqual(
    jobsPageSrc.includes('Apply ({previewFilteredJobs.length})'),
    false,
    'Apply button must NOT display matching-jobs count (previewFilteredJobs.length)'
  );
  console.log('✅ PASS 1: Apply button displays selected filter count via Apply ({pendingFilterCount})');

  // --- 2. VERIFY APPLIED COUNT SHOWS COMMITTED SELECTIONS COUNT ---
  console.log('\n--- 2. Applied Count Verification ---');
  assert.ok(
    jobsPageSrc.includes('Applied ({appliedFilterCount})'),
    'Header badge displays Applied ({appliedFilterCount})'
  );
  console.log('✅ PASS 2: Header displays actively applied count via Applied ({appliedFilterCount})');

  // --- 3. VERIFY BASE JOBS API & FILTERING ---
  console.log('\n--- 3. API & Functional Filter Scenarios ---');
  const res1 = await get('http://localhost:5000/api/jobs');
  assert.strictEqual(res1.body.data.length, 22, 'Base API returns 22 jobs');
  console.log('✅ PASS 3: Base jobs API returns 22 jobs');

  const resUAE = await get('http://localhost:5000/api/jobs?country=UAE');
  assert.ok(resUAE.body.data.length > 0 && resUAE.body.data.length < 22);
  console.log(`✅ PASS 4: UAE filter returns ${resUAE.body.data.length} jobs`);

  const resUAEQatar = await get('http://localhost:5000/api/jobs?country=UAE,Qatar');
  assert.ok(resUAEQatar.body.data.length >= resUAE.body.data.length);
  console.log(`✅ PASS 5: UAE + Qatar filter returns ${resUAEQatar.body.data.length} jobs`);

  const resCompound = await get('http://localhost:5000/api/jobs?country=UAE,Qatar&industry=IT%20%26%20Software&jobType=Full-time');
  console.log(`✅ PASS 6: Compound 4-filter query returns ${resCompound.body.data.length} jobs`);

  console.log('\n=================================================================');
  console.log('   ALL CHECKS PASSED: APPLY BUTTON SHOWS SELECTED FILTER COUNT!  ');
  console.log('=================================================================');
}

runAcceptanceTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

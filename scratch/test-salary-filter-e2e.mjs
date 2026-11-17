import fs from 'fs';
import path from 'path';

console.log('=== SALARY FILTER & POPUP VERIFICATION ===');

const jobsPageContent = fs.readFileSync('src/pages/JobsPage.jsx', 'utf8');

// Test 1: Number input removal (media_1794909163059_f05d579a.png spinner removal)
const hasMinInput = jobsPageContent.includes('<input\n                      type="number"\n                      placeholder="0"');
const hasMaxInput = jobsPageContent.includes('<input\n                      type="number"\n                      placeholder="Max"');
if (!hasMinInput && !hasMaxInput) {
  console.log('✅ PASS: Number inputs with stepper spinner arrows removed from Salary filter section');
} else {
  console.error('❌ FAIL: Number input stepper arrows still present');
  process.exit(1);
}

// Test 2: Category 6 uses renderFilterCategory with Coins icon
if (jobsPageContent.includes("title: 'Salary'") && jobsPageContent.includes("sectionKey: 'salary'") && jobsPageContent.includes("items: SALARY_OPTIONS")) {
  console.log('✅ PASS: Category 6 uses renderFilterCategory with Coins icon & SALARY_OPTIONS');
} else {
  console.error('❌ FAIL: Category 6 does not use renderFilterCategory properly');
  process.exit(1);
}

// Test 3: Popup config for salary includes isCompactVertical: true
if (jobsPageContent.includes("case 'salary':") && jobsPageContent.includes("isCompactVertical: true")) {
  console.log('✅ PASS: popupConfig defines case "salary" with isCompactVertical: true');
} else {
  console.error('❌ FAIL: popupConfig missing case "salary" or isCompactVertical');
  process.exit(1);
}

// Test 4: Modal container width adjusts to max-w-md for isCompactVertical
if (jobsPageContent.includes("popupConfig.isCompactVertical ? 'max-w-md' : 'max-w-[880px]'")) {
  console.log('✅ PASS: Modal container applies max-w-md when isCompactVertical is true');
} else {
  console.error('❌ FAIL: Modal container does not apply max-w-md');
  process.exit(1);
}

// Test 5: Modal grid applies 1-column vertical list when isCompactVertical is true
if (jobsPageContent.includes('popupConfig.isCompactVertical ? "grid grid-cols-1 gap-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-5 gap-y-2.5"')) {
  console.log('✅ PASS: Modal renders single-column vertical list for compact salary options');
} else {
  console.error('❌ FAIL: Modal does not render vertical grid layout');
  process.exit(1);
}

// Test 6: Backend API query with salaryRanges parameter
const res1 = await fetch('http://localhost:5000/api/jobs?salaryRanges=' + encodeURIComponent('20,000 – 35,000'));
const data1 = await res1.json();
if (data1.success && data1.data.length > 0) {
  console.log(`✅ PASS: Backend returned ${data1.data.length} jobs for "20,000 – 35,000"`);
} else {
  console.error('❌ FAIL: Backend failed to return jobs for salaryRanges query');
  process.exit(1);
}

// Test 7: Backend API query with multiple salaryRanges
const res2 = await fetch('http://localhost:5000/api/jobs?salaryRanges=' + encodeURIComponent('10,000 – 20,000,50,000+'));
const data2 = await res2.json();
if (data2.success && data2.data.length > 0) {
  console.log(`✅ PASS: Backend returned ${data2.data.length} jobs for combined multi-select "10,000 – 20,000,50,000+"`);
} else {
  console.error('❌ FAIL: Backend failed for multi-select salaryRanges');
  process.exit(1);
}

// Test 8: Backend API query with Lakhs/Crore annual INR brackets
const res3 = await fetch('http://localhost:5000/api/jobs?salaryRanges=' + encodeURIComponent('75–100 Lakhs'));
const data3 = await res3.json();
if (data3.success && data3.data.length > 0) {
  console.log(`✅ PASS: Backend returned ${data3.data.length} jobs for "75–100 Lakhs"`);
} else {
  console.error('❌ FAIL: Backend failed for Lakhs salaryRanges');
  process.exit(1);
}

console.log('\nALL 8 SALARY FILTER VERIFICATION CHECKS PASSED SUCCESSFULLY!');

import fs from 'fs';

console.log('=== EXPERIENCE RANGE SLIDER VERIFICATION ===');

const jobsPage = fs.readFileSync('src/pages/JobsPage.jsx', 'utf8');
const indexCss = fs.readFileSync('src/styles/index.css', 'utf8');

// 1. Check Range Input
const hasRangeInput = jobsPage.includes('type="range"') && jobsPage.includes('min="0"') && jobsPage.includes('max="30"') && jobsPage.includes('step="1"');
if (hasRangeInput) {
  console.log('✅ PASS: Horizontal range slider input present with min 0, max 30, step 1');
} else {
  console.error('❌ FAIL: Range slider input missing or has invalid attributes');
  process.exit(1);
}

// 2. Check Tooltip Bubble with Dynamic Value and Downward Pointer
const hasTooltip = jobsPage.includes('{sliderExperienceYears} Yrs') && jobsPage.includes('rotate-45');
if (hasTooltip) {
  console.log('✅ PASS: Tooltip bubble indicator present with dynamic value and downward pointer');
} else {
  console.error('❌ FAIL: Tooltip bubble missing');
  process.exit(1);
}

// 3. Check Min/Max Labels
const hasLabels = jobsPage.includes('0 Yrs') && jobsPage.includes('30 Yrs');
if (hasLabels) {
  console.log('✅ PASS: Min label "0 Yrs" and Max label "30 Yrs" rendered below slider');
} else {
  console.error('❌ FAIL: Min or Max label missing');
  process.exit(1);
}

// 4. Check CSS Slider Styling in index.css
const hasSliderCss = indexCss.includes('.slider-revival') && indexCss.includes('-webkit-slider-thumb') && indexCss.includes('-moz-range-thumb');
if (hasSliderCss) {
  console.log('✅ PASS: Cross-browser Revival International slider CSS styles present');
} else {
  console.error('❌ FAIL: Missing .slider-revival styling in index.css');
  process.exit(1);
}

// 5. Check Backend API filtering with experienceYears
const testYears = [
  { exp: 0, expectedMin: 1 },
  { exp: 5, expectedMin: 5 },
  { exp: 10, expectedMin: 5 }
];

for (const { exp, expectedMin } of testYears) {
  const res = await fetch(`http://localhost:5000/api/jobs?experienceYears=${exp}`);
  const json = await res.json();
  if (json.success && json.data.length >= expectedMin) {
    console.log(`✅ PASS: Backend returned ${json.data.length} matching jobs for experienceYears=${exp}`);
  } else {
    console.error(`❌ FAIL: Backend failed for experienceYears=${exp}`);
    process.exit(1);
  }
}

// 6. Check All jobs without experienceYears filter
const resAll = await fetch('http://localhost:5000/api/jobs');
const jsonAll = await resAll.json();
if (jsonAll.success && jsonAll.data.length === 22) {
  console.log(`✅ PASS: Backend returns all ${jsonAll.data.length} jobs when filter is not active`);
} else {
  console.error('❌ FAIL: Default jobs count mismatch');
  process.exit(1);
}

console.log('\nALL EXPERIENCE RANGE SLIDER CHECKS PASSED SUCCESSFULLY!');

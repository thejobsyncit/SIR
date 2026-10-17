import { SERVICES_LIST } from './src/data/mockData.js';
import { EDUCATION_SERVICES_DETAILED, getEducationServiceById } from './src/data/educationServicesData.js';

console.log('=== VERIFYING SERVICES DATA INTEGRITY ===\n');

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

// 1. Total service count
console.log(`Total services in SERVICES_LIST: ${SERVICES_LIST.length}`);
assert(SERVICES_LIST.length === 24, 'Total services count is exactly 24 (18 recruitment + 6 education)');

// 2. Duplicate ID check
const idSet = new Set();
const duplicateIds = [];
for (const s of SERVICES_LIST) {
  if (idSet.has(s.id)) {
    duplicateIds.push(s.id);
  }
  idSet.add(s.id);
}
assert(duplicateIds.length === 0, `0 duplicate service IDs found (Duplicates: ${duplicateIds.join(', ') || 'none'})`);

// 3. The 6 target education services check
const targetEducationIds = [
  'intl-consult',
  'college-adm',
  'school-career',
  'intl-adm',
  'school-academy',
  'exec-seminars-lang'
];

for (const id of targetEducationIds) {
  const found = SERVICES_LIST.find(s => s.id === id);
  assert(!!found, `Service '${id}' exists in SERVICES_LIST`);
  if (found) {
    assert(
      found.category === 'Education' || found.subCategory === 'Education',
      `Service '${id}' has Education category or subCategory`
    );
    assert(found.title && found.title.length > 5, `Service '${id}' has valid title: "${found.title}"`);
    assert(found.description && found.description.length > 20, `Service '${id}' has detailed description`);
    assert(Array.isArray(found.deliverables) && found.deliverables.length > 0, `Service '${id}' has deliverables array`);
  }
}

// 4. Executive Seminars & Language Test Prep subProgrammes
const execLang = SERVICES_LIST.find(s => s.id === 'exec-seminars-lang');
assert(!!execLang, 'exec-seminars-lang found');
if (execLang) {
  assert(Array.isArray(execLang.subProgrammes) && execLang.subProgrammes.length === 4, 'exec-seminars-lang has exactly 4 subProgrammes');
  const subIds = execLang.subProgrammes.map(sp => sp.id);
  assert(subIds.includes('det-prep'), 'Sub-programme DET (det-prep) exists');
  assert(subIds.includes('oet-prep'), 'Sub-programme OET (oet-prep) exists');
  assert(subIds.includes('ielts-prep'), 'Sub-programme IELTS (ielts-prep) exists');
  assert(subIds.includes('exec-seminars'), 'Sub-programme Seminars (exec-seminars) exists');
}

// 5. Category Filtering Simulation
const categories = ['All', 'Education', 'Recruitment', 'Executive', 'Staffing', 'Visa & Legal', 'Verification', 'Consulting', 'Operations', 'Career'];
console.log('\n--- Category Filter Counts ---');
for (const cat of categories) {
  const filtered = cat === 'All' 
    ? SERVICES_LIST 
    : SERVICES_LIST.filter(s => s.category === cat || s.subCategory === cat);
  console.log(`Category "${cat}": ${filtered.length} services`);
  assert(filtered.length > 0, `Category "${cat}" has at least 1 matching service`);
}

const educationFiltered = SERVICES_LIST.filter(s => s.category === 'Education' || s.subCategory === 'Education');
assert(educationFiltered.length === 6, `Category "Education" matches exactly all 6 education services`);

// 6. Education Dedicated Data
console.log('\n--- Education Detailed Directory Data ---');
for (const id of targetEducationIds) {
  const eduData = getEducationServiceById(id);
  assert(!!eduData, `EDUCATION_SERVICES_DETAILED has deep page entry for '${id}'`);
  if (eduData) {
    assert(Array.isArray(eduData.howItWorks) && eduData.howItWorks.length > 0, `'${id}' has structured roadmap steps (howItWorks)`);
    assert(Array.isArray(eduData.faqs) && eduData.faqs.length > 0, `'${id}' has FAQ entries`);
    assert(Array.isArray(eduData.keyBenefits) && eduData.keyBenefits.length > 0, `'${id}' has key benefits`);
  }
}

console.log(`\n========================================`);
console.log(`SERVICES INTEGRITY PASSED: ${passed}`);
console.log(`SERVICES INTEGRITY FAILED: ${failed}`);
console.log(`========================================`);

process.exit(failed > 0 ? 1 : 0);

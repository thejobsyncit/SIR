import { JOBS_LIST } from '../src/data/mockData.js';

const SALARY_OPTIONS = [
  'Under 10,000',
  '10,000 – 20,000',
  '20,000 – 35,000',
  '35,000 – 50,000',
  '50,000+',
  '0–3 Lakhs',
  '3–6 Lakhs',
  '6–10 Lakhs',
  '10–15 Lakhs',
  '15–25 Lakhs',
  '25–50 Lakhs',
  '50–75 Lakhs',
  '75–100 Lakhs',
  '1–5 Crore',
  '5+ Crore'
];

const SALARY_RANGES_MAP = {
  'Under 10,000': { min: 0, max: 10000 },
  '10,000 – 20,000': { min: 10000, max: 20000 },
  '20,000 – 35,000': { min: 20000, max: 35000 },
  '35,000 – 50,000': { min: 35000, max: 50000 },
  '50,000+': { min: 50000, max: null },
  '0–3 Lakhs': { min: 0, max: 300000, annualInr: true },
  '3–6 Lakhs': { min: 300000, max: 600000, annualInr: true },
  '6–10 Lakhs': { min: 600000, max: 1000000, annualInr: true },
  '10–15 Lakhs': { min: 1000000, max: 1500000, annualInr: true },
  '15–25 Lakhs': { min: 1500000, max: 2500000, annualInr: true },
  '25–50 Lakhs': { min: 2500000, max: 5000000, annualInr: true },
  '50–75 Lakhs': { min: 5000000, max: 7500000, annualInr: true },
  '75–100 Lakhs': { min: 7500000, max: 10000000, annualInr: true },
  '1–5 Crore': { min: 10000000, max: 50000000, annualInr: true },
  '5+ Crore': { min: 50000000, max: null, annualInr: true }
};

const matchesSalaryRange = (job, rangeLabel) => {
  const range = SALARY_RANGES_MAP[rangeLabel];
  if (!range) return true;

  let jMin = job.minSalary !== undefined && job.minSalary !== null ? Number(job.minSalary) : null;
  let jMax = job.maxSalary !== undefined && job.maxSalary !== null ? Number(job.maxSalary) : null;

  if (jMin === null || isNaN(jMin) || jMax === null || isNaN(jMax)) {
    const nums = (job.salary || '').replace(/,/g, '').match(/\d+/g)?.map(Number) || [];
    if (nums.length >= 2) {
      jMin = nums[0];
      jMax = nums[1];
    } else if (nums.length === 1) {
      jMin = nums[0];
      jMax = nums[0];
    } else {
      return false;
    }
  }

  if (range.annualInr) {
    const inrMin = jMin * 12 * 23;
    const inrMax = jMax * 12 * 23;
    if (range.max === null || range.max === undefined) {
      return inrMax >= range.min;
    }
    return inrMax >= range.min && inrMin <= range.max;
  } else {
    if (range.max === null || range.max === undefined) {
      return jMax >= range.min;
    }
    return jMax >= range.min && jMin <= range.max;
  }
};

console.log('Testing JOBS_LIST salary match counts:');
SALARY_OPTIONS.forEach(opt => {
  const count = JOBS_LIST.filter(j => matchesSalaryRange(j, opt)).length;
  console.log(`- ${opt}: ${count} jobs`);
});

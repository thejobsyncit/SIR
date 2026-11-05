const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'server', 'services', 'aiAdvisorEngine.js');
let code = fs.readFileSync(targetPath, 'utf8');

const targetStart = 'export function detectServiceIntent(userQuery, previousServiceId = null) {';
const targetEnd = 'export function buildSystemPrompt() {';

const idxStart = code.indexOf(targetStart);
const idxEnd = code.indexOf(targetEnd);

const replacement = `export function detectServiceIntent(userQuery, previousServiceId = null) {
  const query = (userQuery || '').toLowerCase().trim();
  const clean = query.replace(/[^a-z0-9\\s]/g, ' ');

  // Direct Country + Study / Document / Admission signals
  const hasStudy = /\\b(study|studying|university|universities|admission|admissions|college|colleges|degree|masters|bachelor|bachelors|phd|ucas|course|courses|campus|tuition)\\b/.test(clean);
  const hasDocs = /\\b(document|documents|paperwork|requirements|checklist|transcripts|sop|lor)\\b/.test(clean);
  const hasJobs = /\\b(job|jobs|career|careers|vacancy|vacancies|hiring|work|working|placement|placements|recruitment opportunities|job opportunities)\\b/.test(clean);
  const hasSalary = /\\b(salary|salaries|pay|packages|salary ranges|compensation)\\b/.test(clean);
  const hasVisa = /\\b(visa|visas|permit|permits|mohre|iqama|entry permit|residence visa|stamping)\\b/.test(clean);

  // Specific destination entities
  const isUK = /\\b(uk|united kingdom|britain|london|england|scotland)\\b/.test(clean);
  const isCanada = /\\b(canada|canadian|toronto|ontario|vancouver)\\b/.test(clean);
  const isUSA = /\\b(usa|us|united states|america)\\b/.test(clean);
  const isAustralia = /\\b(australia|australian|sydney|melbourne)\\b/.test(clean);
  const isDubaiUAE = /\\b(dubai|uae|abu dhabi|sharjah|gcc|gulf|saudi|riyadh|qatar)\\b/.test(clean);

  // Exact matching for common key prompts
  if (clean.includes('dubai work visa') || clean.includes('uae work visa') || clean.includes('apply for a dubai work visa')) {
    return 'work-permit';
  }

  if (isDubaiUAE && hasVisa) {
    return 'work-permit';
  }

  if (hasSalary || clean.includes('typical salary ranges') || (isDubaiUAE && hasJobs) || clean.includes('recruitment opportunities')) {
    return 'overseas-place';
  }

  if (clean.includes('what is the visa process') || clean.includes('visa documentation') || clean.includes('visa assistance')) {
    return 'visa-assist';
  }

  if ((isUK || isCanada || isUSA || isAustralia) && (hasStudy || hasDocs || query.includes('apply') || query.includes('want to study'))) {
    return 'intl-adm';
  }

  if (isCanada && hasDocs) {
    return 'intl-adm';
  }

  if (isUK && (hasStudy || hasDocs || query.includes('study'))) {
    return 'intl-adm';
  }

  if (clean.includes('multiple universities') || clean.includes('ucas') || clean.includes('university shortlisting')) {
    return 'intl-adm';
  }

  if (/\\b(oet)\\b/.test(clean)) return 'oet-prep';
  if (/\\b(ielts)\\b/.test(clean)) return 'ielts-prep';
  if (/\\b(det|duolingo)\\b/.test(clean)) return 'det-prep';
  if (/\\b(toefl)\\b/.test(clean)) return 'toefl-prep';

  if (/\\b(executive search|c suite|headhunt|headhunting|hire ceo|hire cfo|director recruitment)\\b/.test(clean)) {
    return 'exec-search';
  }

  if (/\\b(contract staff|contracting|staff augmentation|temporary staff|interim)\\b/.test(clean)) {
    return 'contract-staff';
  }

  if (/\\b(permanent staff|permanent staffing|permanent hire|direct hire|employer looking for candidates|submit a recruitment requirement|recruitment services)\\b/.test(clean)) {
    return 'perm-staff';
  }

  if (/\\b(school student|grade 10|grade 12|stream selection|psychometric|career guidance)\\b/.test(clean)) {
    return 'school-career';
  }

  if (/\\b(executive seminar|executive seminars|masterclass|boardroom seminar)\\b/.test(clean)) {
    return 'exec-seminars';
  }

  if (/\\b(leadership development|executive coaching)\\b/.test(clean)) {
    return 'leadership-dev';
  }

  if (/\\b(corporate training|workforce upskilling)\\b/.test(clean)) {
    return 'corp-training';
  }

  // Follow-up context handling
  const isFollowUp = (
    clean.startsWith('what about') ||
    clean.startsWith('and for') ||
    clean.startsWith('what are the documents') ||
    clean.startsWith('what documents') ||
    clean.startsWith('how much does it cost') ||
    clean.startsWith('how long does it take') ||
    clean.startsWith('can you help with') ||
    clean.startsWith('what qualifications') ||
    clean.includes('eligibility') ||
    clean.includes('documents needed') ||
    clean.includes('steps') ||
    clean.includes('process')
  );

  let bestMatch = null;
  let highestScore = 0;

  for (const item of SERVICE_KEYWORDS) {
    let score = 0;
    for (const kw of item.keywords) {
      if (clean.includes(kw) || query.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item.id;
    }
  }

  if (isFollowUp && previousServiceId && (!bestMatch || highestScore < 8)) {
    return previousServiceId;
  }

  return bestMatch;
}

`;

code = code.slice(0, idxStart) + replacement + code.slice(idxEnd);
fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully refined detectServiceIntent in aiAdvisorEngine.js');

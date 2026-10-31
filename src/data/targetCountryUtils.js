/**
 * Target Country Resolution & Category Matching Utilities
 * Reusable across both React frontend components and Node/test environments
 */

export const INTERNATIONAL_OR_GCC_CATEGORIES = new Set([
  'ielts',
  'oet',
  'ogt',
  'medical-exams',
  'europe-western',
  'gcc-medical',
  'gcc-engineering'
]);

export const isInternationalOrGccExam = (exam, category) => {
  if (!exam && !category) return false;
  const catId = category?.id || exam?.categoryId || exam?.category;
  if (catId && INTERNATIONAL_OR_GCC_CATEGORIES.has(catId)) return true;

  const catName = (category?.name || exam?.categoryName || '').toLowerCase();
  if (
    catName.includes('international') ||
    catName.includes('gcc') ||
    catName.includes('europe') ||
    catName.includes('western') ||
    catName.includes('ielts') ||
    catName.includes('oet') ||
    catName.includes('licensing')
  ) {
    return true;
  }

  return false;
};

export const resolveDefaultExamCountry = (exam) => {
  if (!exam) return 'United Arab Emirates';
  const examCountry = (exam.country || '').toLowerCase();
  const examCode = (exam.code || '').toLowerCase();
  const examId = (exam.id || '').toLowerCase();

  // 1. GCC Countries matching
  if (
    examCountry.includes('united arab emirates') || 
    examCountry.includes('uae') || 
    examCountry.includes('dubai') || 
    examCountry.includes('abu dhabi') ||
    examId.includes('dha') || 
    examId.includes('doh') || 
    examId.includes('mohap') || 
    examId.includes('uae')
  ) {
    return 'United Arab Emirates';
  }

  if (
    examCountry.includes('saudi') || 
    examCountry.includes('ksa') || 
    examId.includes('scfhs') || 
    examId.includes('sce')
  ) {
    return 'Saudi Arabia';
  }

  if (examCountry.includes('qatar') || examId.includes('qatar')) {
    return 'Qatar';
  }

  if (examCountry.includes('oman') || examId.includes('oman')) {
    return 'Oman';
  }

  if (examCountry.includes('bahrain') || examId.includes('bahrain') || examId.includes('nhra') || examId.includes('crpep')) {
    return 'Bahrain';
  }

  if (examCountry.includes('kuwait') || examId.includes('kuwait') || examId.includes('kse')) {
    return 'Kuwait';
  }

  // 2. Specific Western / International Exams
  if (examId.includes('usmle') || examCode === 'usmle' || examCountry === 'united states' || examCountry.includes('usa')) {
    return 'United States';
  }

  if (
    examId.includes('plab') || 
    examId.includes('mrcp') || 
    examId === 'ielts-ukvi' || 
    examCountry === 'united kingdom' || 
    examCountry.includes('uk')
  ) {
    return 'United Kingdom';
  }

  if (examCountry.includes('canada')) {
    return 'Canada';
  }

  if (examCountry.includes('australia')) {
    return 'Australia';
  }

  if (examCountry.includes('new zealand')) {
    return 'New Zealand';
  }

  if (examCountry.includes('germany')) {
    return 'Germany';
  }

  if (examCountry.includes('singapore')) {
    return 'Singapore';
  }

  if (examCountry.includes('ireland')) {
    return 'Ireland';
  }

  if (examCountry.includes('india')) {
    return 'India';
  }

  if (
    examCountry.includes('global') || 
    examCountry.includes('international') || 
    examCountry.includes('advisory') ||
    examId.includes('ogt')
  ) {
    return 'Global / Flexible (Open to Advice)';
  }

  return 'United Arab Emirates';
};


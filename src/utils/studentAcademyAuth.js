import { COMPETITIVE_EXAMS, getCompetitiveExamById } from '../data/competitiveExamsData.js';
import { ACADEMY_EXAMINATIONS } from '../data/studentAcademyData.js';

export const PENDING_STUDENT_ACADEMY_ENQUIRY_KEY = 'sir_pending_student_academy_enquiry';

// Approved internal routes for Student Academy redirection to prevent open redirects
export const APPROVED_ACADEMY_ROUTES = [
  'education-school-academy',
  'school-academy',
  'student-academy',
  'academy-for-school-students',
  'education/school-academy',
  'education/student-academy',
  'education/academy-for-school-students'
];

/**
 * Validates whether a route string is an approved internal Student Academy destination.
 */
export const isApprovedAcademyRoute = (route) => {
  if (!route || typeof route !== 'string') return false;
  const clean = route.replace(/^#/, '').trim().toLowerCase();
  const base = clean.split('?')[0];
  if (!APPROVED_ACADEMY_ROUTES.includes(base)) return false;

  // If query params are present, ensure they only contain safe allowed keys
  if (clean.includes('?')) {
    try {
      const query = clean.split('?')[1];
      const params = new URLSearchParams(query);
      const allowedParams = ['exam', 'category', 'academy', 'course', 'enquiry', 'exam-enquiry'];
      for (const key of params.keys()) {
        if (!allowedParams.includes(key.toLowerCase())) return false;
      }
    } catch {
      return false;
    }
  }
  return true;
};

/**
 * Validates and matches an identifier or exam object against competitive exams and academy catalogues.
 */
export const findValidAcademyExamByIdOrName = (identifier) => {
  if (!identifier) return null;
  const query = String(identifier).trim().toLowerCase();

  // 1. Check competitiveExamsData by exact ID
  if (typeof getCompetitiveExamById === 'function') {
    const directMatch = getCompetitiveExamById(query);
    if (directMatch) return directMatch;
  }

  // 2. Exact ID match across COMPETITIVE_EXAMS
  let matched = (COMPETITIVE_EXAMS || []).find(e => e.id && e.id.toLowerCase() === query);
  if (matched) return matched;

  // 3. Exact Code match
  matched = (COMPETITIVE_EXAMS || []).find(e => e.code && e.code.toLowerCase() === query);
  if (matched) return matched;

  // 4. Exact Name match
  matched = (COMPETITIVE_EXAMS || []).find(e => e.name && e.name.toLowerCase() === query);
  if (matched) return matched;

  // 5. Check ACADEMY_EXAMINATIONS from studentAcademyData
  matched = (ACADEMY_EXAMINATIONS || []).find(e =>
    (e.id && e.id.toLowerCase() === query) ||
    (e.code && e.code.toLowerCase() === query) ||
    (e.name && e.name.toLowerCase() === query)
  );
  if (matched) return matched;

  // 6. Substring match across COMPETITIVE_EXAMS
  matched = (COMPETITIVE_EXAMS || []).find(e =>
    (e.name && e.name.toLowerCase().includes(query)) ||
    (e.code && e.code.toLowerCase().includes(query))
  );
  if (matched) return matched;

  return null;
};

/**
 * Saves a pending Student Academy examination enquiry to sessionStorage.
 * Stores only safe, non-sensitive exam and category metadata and approved destination route.
 */
export const savePendingStudentAcademyEnquiry = (data = {}) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;

  try {
    const rawRoute = data.route || 'education-school-academy';
    const safeRoute = isApprovedAcademyRoute(rawRoute) ? rawRoute : 'education-school-academy';

    const exam = data.exam || null;
    const examId = exam?.id || data.examId || null;
    const examName = exam?.name || data.examName || '';
    const examCode = exam?.code || data.examCode || '';
    const categoryId = data.category?.id || data.categoryId || exam?.categoryId || exam?.category || null;
    const categoryName = data.category?.name || data.categoryName || exam?.categoryName || '';

    const pendingData = {
      route: safeRoute,
      examId,
      examName,
      examCode,
      categoryId,
      categoryName,
      selectedCourse: data.selectedCourse || null,
      courseId: data.courseId || data.selectedCourse?.id || null,
      academyId: data.academyId || data.selectedCourse?.academyId || null,
      formData: data.formData || null,
      action: data.action || 'open_exam_enquiry',
      view: data.view || 'directory_modal',
      timestamp: Date.now()
    };

    window.sessionStorage.setItem(PENDING_STUDENT_ACADEMY_ENQUIRY_KEY, JSON.stringify(pendingData));
    return true;
  } catch (err) {
    console.error('Failed to save pending student academy enquiry to sessionStorage:', err);
    return false;
  }
};

/**
 * Retrieves the pending Student Academy enquiry from sessionStorage.
 * Validates expiration (max 2 hours) and ensures the route is an approved internal route.
 */
export const getPendingStudentAcademyEnquiry = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_STUDENT_ACADEMY_ENQUIRY_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    // Check expiration (2 hours = 7,200,000 ms)
    if (data.timestamp && Date.now() - data.timestamp > 7200000) {
      clearPendingStudentAcademyEnquiry();
      return null;
    }

    // Validate route safety
    if (!isApprovedAcademyRoute(data.route)) {
      data.route = 'education-school-academy';
    }

    return data;
  } catch (err) {
    console.error('Failed to parse pending student academy enquiry from sessionStorage:', err);
    return null;
  }
};

/**
 * Clears the pending Student Academy enquiry from sessionStorage.
 */
export const clearPendingStudentAcademyEnquiry = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(PENDING_STUDENT_ACADEMY_ENQUIRY_KEY);
  } catch (err) {
    console.error('Failed to clear pending student academy enquiry:', err);
  }
};

/**
 * Validates a pending enquiry record against real competitive exams data.
 * Returns a complete, verified exam object suitable for populating the consultation modal or view.
 */
export const validatePendingExam = (pendingData) => {
  if (!pendingData || typeof pendingData !== 'object') return null;

  let matched = null;
  if (pendingData.examId) {
    matched = findValidAcademyExamByIdOrName(pendingData.examId);
  }
  if (!matched && pendingData.examCode) {
    matched = findValidAcademyExamByIdOrName(pendingData.examCode);
  }
  if (!matched && pendingData.examName) {
    matched = findValidAcademyExamByIdOrName(pendingData.examName);
  }

  if (matched) {
    return {
      ...matched,
      id: matched.id || pendingData.examId,
      name: matched.name || pendingData.examName,
      code: matched.code || pendingData.examCode,
      categoryId: matched.categoryId || pendingData.categoryId || 'general',
      category: matched.category || matched.categoryId || pendingData.categoryId || 'general'
    };
  }

  if (pendingData.examName || pendingData.examId) {
    return {
      id: pendingData.examId || `exam-${Date.now()}`,
      name: pendingData.examName || pendingData.examCode || 'Competitive Examination',
      code: pendingData.examCode || pendingData.examName || 'EXAM',
      categoryId: pendingData.categoryId || 'general',
      category: pendingData.categoryId || 'general'
    };
  }

  return null;
};


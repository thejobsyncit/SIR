import { UG_COURSES_CATALOGUE } from '../data/ugDepartmentStreamsData.js';
import { PG_COURSES_CATALOGUE } from '../data/pgDepartmentStreamsData.js';

export const PENDING_CAREER_ENQUIRY_KEY = 'sir_pending_career_enquiry';

// Approved internal routes for career guidance redirection to prevent open redirects
export const APPROVED_CAREER_ROUTES = [
  'education-school-career',
  'school-career',
  'education/school-career',
  'education-career-guidance',
  'career-guidance',
  'education/career-guidance',
  'school-student-career-guidance',
  'education-school-student-career-guidance'
];

/**
 * Validates whether a route string is an approved internal Career Guidance destination.
 */
export const isApprovedCareerRoute = (route) => {
  if (!route || typeof route !== 'string') return false;
  const clean = route.replace(/^#/, '').split('?')[0].trim().toLowerCase();
  return APPROVED_CAREER_ROUTES.includes(clean);
};

/**
 * Validates and matches an identifier or course object against real UG and PG course catalogues.
 * Prevents tampered or malformed course data from being populated.
 */
export const findValidCourseByIdOrName = (identifier, preferredLevel = null) => {
  if (!identifier) return null;
  const query = String(identifier).trim().toLowerCase();

  const allCourses = [
    ...(Array.isArray(UG_COURSES_CATALOGUE) ? UG_COURSES_CATALOGUE : []),
    ...(Array.isArray(PG_COURSES_CATALOGUE) ? PG_COURSES_CATALOGUE : [])
  ];

  // 1. Exact ID match
  let matched = allCourses.find(c => c.id && c.id.toLowerCase() === query);
  if (matched) return matched;

  // 2. Exact Abbreviation match (case-insensitive)
  if (preferredLevel) {
    matched = allCourses.find(c => 
      c.level?.toUpperCase() === preferredLevel?.toUpperCase() && 
      c.abbreviation && c.abbreviation.toLowerCase() === query
    );
    if (matched) return matched;
  }
  matched = allCourses.find(c => c.abbreviation && c.abbreviation.toLowerCase() === query);
  if (matched) return matched;

  // 3. Exact Name match
  if (preferredLevel) {
    matched = allCourses.find(c => 
      c.level?.toUpperCase() === preferredLevel?.toUpperCase() && 
      c.name && c.name.toLowerCase() === query
    );
    if (matched) return matched;
  }
  matched = allCourses.find(c => c.name && c.name.toLowerCase() === query);
  if (matched) return matched;

  // 4. Substring Name match
  matched = allCourses.find(c => c.name && c.name.toLowerCase().includes(query));
  if (matched) return matched;

  return null;
};

/**
 * Saves a pending Career Guidance course consultation request to sessionStorage.
 * Stores only safe, non-sensitive course metadata and approved internal destination route.
 */
export const savePendingCareerEnquiry = (course, route = 'education-school-career') => {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;

  try {
    const safeRoute = isApprovedCareerRoute(route) ? route : 'education-school-career';
    
    // Normalize course details
    const courseId = course?.id || null;
    const courseName = course?.name || course?.title || '';
    const abbreviation = course?.abbreviation || '';
    const level = course?.level === 'PG' ? 'PG' : 'UG';
    const programLevel = level === 'PG' 
      ? 'Postgraduate (Master Degree / MBA)' 
      : 'Undergraduate (Bachelor Degree)';
    const streamName = course?.streamName || course?.department || '';
    const department = course?.department || course?.streamName || '';
    const degrees = Array.isArray(course?.degrees) ? course.degrees : (course?.degrees ? [course.degrees] : []);
    const duration = course?.duration || course?.typicalDuration || (level === 'PG' ? '2 Years' : '4 Years');
    const durationYears = course?.durationYears || (level === 'PG' ? 2 : 4);

    const pendingData = {
      route: safeRoute,
      courseId,
      courseName,
      abbreviation,
      level,
      programLevel,
      department,
      streamName,
      degrees,
      duration,
      durationYears,
      action: 'open_enquiry',
      timestamp: Date.now()
    };

    window.sessionStorage.setItem(PENDING_CAREER_ENQUIRY_KEY, JSON.stringify(pendingData));
    return true;
  } catch (err) {
    console.error('Failed to save pending career enquiry to sessionStorage:', err);
    return false;
  }
};

/**
 * Retrieves the pending Career Guidance enquiry from sessionStorage.
 * Validates expiration (max 2 hours) and ensures the route is an approved internal route.
 */
export const getPendingCareerEnquiry = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_CAREER_ENQUIRY_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    // Check expiration (2 hours = 7,200,000 ms)
    if (data.timestamp && Date.now() - data.timestamp > 7200000) {
      clearPendingCareerEnquiry();
      return null;
    }

    // Validate route safety
    if (!isApprovedCareerRoute(data.route)) {
      data.route = 'education-school-career';
    }

    return data;
  } catch (err) {
    console.error('Failed to parse pending career enquiry from sessionStorage:', err);
    return null;
  }
};

/**
 * Clears the pending Career Guidance enquiry from sessionStorage.
 */
export const clearPendingCareerEnquiry = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(PENDING_CAREER_ENQUIRY_KEY);
  } catch (err) {
    console.error('Failed to clear pending career enquiry:', err);
  }
};

/**
 * Validates a pending enquiry record against real course data in the catalogue.
 * Returns a complete, verified course object suitable for populating the consultation modal.
 */
export const validatePendingCourse = (pendingData) => {
  if (!pendingData || typeof pendingData !== 'object') return null;

  // Attempt lookup by ID first
  let matched = null;
  if (pendingData.courseId) {
    matched = findValidCourseByIdOrName(pendingData.courseId, pendingData.level);
  }

  // Attempt lookup by Name or Abbreviation if not matched
  if (!matched && pendingData.courseName) {
    matched = findValidCourseByIdOrName(pendingData.courseName, pendingData.level);
  }
  if (!matched && pendingData.abbreviation) {
    matched = findValidCourseByIdOrName(pendingData.abbreviation, pendingData.level);
  }

  if (matched) {
    // Return verified matched course with fallback to pending metadata
    return {
      ...matched,
      id: matched.id || pendingData.courseId,
      name: matched.name || pendingData.courseName,
      abbreviation: matched.abbreviation || pendingData.abbreviation,
      level: matched.level || pendingData.level || 'UG',
      streamName: matched.streamName || pendingData.streamName || matched.department || '',
      department: matched.department || pendingData.department || matched.streamName || '',
      degrees: matched.degrees || pendingData.degrees || [],
      duration: matched.duration || pendingData.duration || '',
      durationYears: matched.durationYears || pendingData.durationYears || (matched.level === 'PG' ? 2 : 4)
    };
  }

  // If no match found in catalogues, only allow if at least courseName and level are provided
  if (pendingData.courseName && (pendingData.level === 'UG' || pendingData.level === 'PG')) {
    return {
      id: pendingData.courseId || `course-${Date.now()}`,
      name: pendingData.courseName,
      abbreviation: pendingData.abbreviation || '',
      level: pendingData.level,
      streamName: pendingData.streamName || pendingData.department || 'General',
      department: pendingData.department || pendingData.streamName || 'General',
      degrees: pendingData.degrees || [],
      duration: pendingData.duration || (pendingData.level === 'PG' ? '2 Years' : '4 Years'),
      durationYears: pendingData.durationYears || (pendingData.level === 'PG' ? 2 : 4)
    };
  }

  return null;
};

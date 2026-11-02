/**
 * Revival International - Student Academy Service Layer
 * Dual-sync persistence (Supabase + Local SQLite API) with analytics & validation
 */

import { supabase } from '../supabase';
import { trackCtaClick } from './analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generate human-friendly reference number: REV-ACA-2026-XXXXX
 */
export const generateAcademyReference = () => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `REV-ACA-2026-${randomSuffix}`;
};

/**
 * Submit Course Enquiry
 * Automatically persists to Supabase and the Express server SQLite store.
 */
export const submitAcademyCourseEnquiry = async (enquiryData) => {
  const referenceNumber = generateAcademyReference();

  // Validate critical fields
  if (!enquiryData.studentName || !enquiryData.email || !enquiryData.phone) {
    throw new Error('Please fill in your name, email address, and mobile number.');
  }

  if (!enquiryData.academyId || !enquiryData.examId || !enquiryData.courseId) {
    throw new Error('Inquiry context error: Academy, examination, and course must be preserved.');
  }

  const payload = {
    referenceNumber,
    studentName: enquiryData.studentName.trim(),
    email: enquiryData.email.trim().toLowerCase(),
    phone: enquiryData.phone.trim(),
    preferredLearningMode: enquiryData.preferredLearningMode || 'Classroom',
    batchPreference: enquiryData.batchPreference || 'Any Batch',
    questions: enquiryData.questions ? enquiryData.questions.trim() : '',
    academyId: enquiryData.academyId,
    academyName: enquiryData.academyName || 'Verified Academy',
    examId: enquiryData.examId,
    examName: enquiryData.examName || 'Competitive Examination',
    courseId: enquiryData.courseId,
    courseName: enquiryData.courseName || 'Academy Course',
    serviceId: 'school-academy',
    serviceTitle: 'Student Academy',
    createdAt: new Date().toISOString()
  };

  let supabaseSuccess = false;
  let serverSuccess = false;
  let supabaseError = null;

  // 1. Attempt Supabase insert if client is available
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { data, error } = await supabase
        .from('student_academy_enquiries')
        .insert([{
          reference_number: payload.referenceNumber,
          student_name: payload.studentName,
          email: payload.email,
          phone: payload.phone,
          preferred_learning_mode: payload.preferredLearningMode,
          batch_preference: payload.batchPreference,
          questions: payload.questions,
          academy_id: payload.academyId,
          academy_name: payload.academyName,
          exam_id: payload.examId,
          exam_name: payload.examName,
          course_id: payload.courseId,
          course_name: payload.courseName,
          status: 'New Enquiry'
        }]);

      if (!error) {
        supabaseSuccess = true;
      } else {
        supabaseError = error.message;
        console.warn('Supabase enquiry insert warning:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase operation notice:', err.message);
  }

  // 2. Dual-sync with Express server API (and SQLite store)
  try {
    const res = await fetch(`${API_BASE_URL}/api/student-academy/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      serverSuccess = true;
    }
  } catch (apiErr) {
    console.warn('Local API dual-sync notice:', apiErr.message);
  }

  // Fallback: If backend is running purely client-side without internet, store in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('revival_academy_enquiries') || '[]');
    existing.unshift(payload);
    localStorage.setItem('revival_academy_enquiries', JSON.stringify(existing.slice(0, 50)));
  } catch (_) {}

  // Track analytics
  trackCtaClick(`Enquiry: ${payload.academyName} - ${payload.courseName}`, 'Student Academy Module');

  return {
    success: true,
    referenceNumber,
    timestamp: payload.createdAt,
    data: payload
  };
};

/**
 * Submit Exam Enquiry
 * Specifically for students submitting an enquiry for a competitive examination
 */
export const submitExamEnquiry = async (enquiryData) => {
  const referenceNumber = generateAcademyReference();

  if (!enquiryData.studentName || !enquiryData.studentName.trim()) {
    throw new Error('Please enter your full name.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!enquiryData.email || !emailRegex.test(enquiryData.email.trim())) {
    throw new Error('Please enter a valid email address.');
  }

  if (!enquiryData.phone || enquiryData.phone.trim().length < 7) {
    throw new Error('Please enter a valid mobile number with country/area code.');
  }

  if (!enquiryData.qualification || !enquiryData.qualification.trim()) {
    throw new Error('Please select or specify your current educational qualification.');
  }

  const loc = enquiryData.targetCountry || enquiryData.preferredLocation;
  if (!loc || !loc.trim()) {
    throw new Error('Please specify your preferred study location or target country.');
  }

  const payload = {
    referenceNumber,
    studentName: enquiryData.studentName.trim(),
    email: enquiryData.email.trim().toLowerCase(),
    phone: enquiryData.phone.trim(),
    examId: enquiryData.examId || 'general-exam',
    examName: enquiryData.examName || 'Competitive Examination',
    qualification: enquiryData.qualification.trim(),
    preferredLearningMode: enquiryData.preferredLearningMode || 'Online',
    preferredLocation: (enquiryData.targetCountry || enquiryData.preferredLocation).trim(),
    targetCountry: (enquiryData.targetCountry || enquiryData.preferredLocation).trim(),
    countryInterest: (enquiryData.targetCountry || enquiryData.preferredLocation).trim(),
    questions: enquiryData.message ? enquiryData.message.trim() : (enquiryData.questions ? enquiryData.questions.trim() : ''),
    academyId: enquiryData.academyId || 'revival-advisory',
    academyName: enquiryData.academyName || 'Revival International Student Advisory',
    courseId: enquiryData.courseId || 'exam-preparation-support',
    courseName: enquiryData.courseName || `${enquiryData.examName || 'Competitive Exam'} Coaching & Preparation`,
    enquiryType: 'Exam Enquiry',
    serviceId: 'school-academy',
    serviceTitle: 'Student Academy - Exam Enquiry',
    createdAt: new Date().toISOString()
  };

  // 1. Dual-sync with Express server API (and SQLite store)
  try {
    const res = await fetch(`${API_BASE_URL}/api/student-academy/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.referenceNumber) {
        payload.referenceNumber = data.referenceNumber;
      }
    }
  } catch (apiErr) {
    console.warn('Local API dual-sync notice for exam enquiry:', apiErr.message);
  }

  // 2. Fallback in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('revival_academy_enquiries') || '[]');
    existing.unshift(payload);
    localStorage.setItem('revival_academy_enquiries', JSON.stringify(existing.slice(0, 50)));
  } catch (_) {}

  // 3. Track analytics
  trackCtaClick(`Exam Enquiry: ${payload.examName}`, 'Student Academy Module');

  return {
    success: true,
    referenceNumber: payload.referenceNumber,
    timestamp: payload.createdAt,
    data: payload
  };
};

/**
 * Fetch Enquiries (for staff/admin dashboards)
 */
export const getAcademyEnquiries = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/student-academy/enquiries`);
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.warn('Failed to load remote enquiries:', err.message);
  }

  try {
    return JSON.parse(localStorage.getItem('revival_academy_enquiries') || '[]');
  } catch (_) {
    return [];
  }
};


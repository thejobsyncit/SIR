import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { EducationEnquiryModal } from '../components/EducationEnquiryModal';
import ScrollReveal from '../components/ScrollReveal';
import {
  ExamDirectoryView
} from '../components/student-academy/ExamDirectoryView';
import {
  ExamEnquiryView
} from '../components/student-academy/ExamEnquiryView';
import {
  ExamAcademiesView
} from '../components/student-academy/ExamAcademiesView';
import {
  AcademyDetailView
} from '../components/student-academy/AcademyDetailView';
import {
  CourseEnquiryView
} from '../components/student-academy/CourseEnquiryView';
import {
  getExamById,
  getAcademyById,
  getCourseById
} from '../data/studentAcademyData';
import {
  getPendingStudentAcademyEnquiry,
  clearPendingStudentAcademyEnquiry,
  validatePendingExam
} from '../utils/studentAcademyAuth.js';
import {
  GraduationCap, ChevronRight, Home, BookOpen, Building2, Layers, Award, ArrowRight
} from 'lucide-react';

export const StudentAcademyPage = () => {
  const { navigateTo, user } = useApp();

  // Navigation flow state:
  // 'exams' -> 'academies' (Exam Enquiry Page) -> 'academy-detail' -> 'course-enquiry'
  const [currentView, setCurrentView] = useState('exams');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedAcademyId, setSelectedAcademyId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryServiceId, setInquiryServiceId] = useState('school-career');

  
  // Restore pending Student Academy enquiry after successful login or registration
  useEffect(() => {
    if (user && user.email) {
      const pending = getPendingStudentAcademyEnquiry();
      if (pending) {
        if (pending.view === 'directory_modal' && pending.examId) {
          if (pending.categoryId) {
            setSelectedCategoryId(pending.categoryId);
          }
          setCurrentView('exams');
        } else if (pending.examId) {
          setSelectedExamId(pending.examId);
          if (pending.academyId) setSelectedAcademyId(pending.academyId);
          setCurrentView(pending.view || 'academies');
        } else if (pending.courseId) {
          setSelectedCourseId(pending.courseId);
          if (pending.academyId) setSelectedAcademyId(pending.academyId);
          if (pending.examId) setSelectedExamId(pending.examId);
          setCurrentView('course-enquiry');
        }
      }
    }
  }, [user]);

  const handleInquireService = (serviceId) => {
    setInquiryServiceId(serviceId);
    setInquiryModalOpen(true);
  };

  // Hash query param detection for direct deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const category = params.get('category');
        if (category) {
          setSelectedCategoryId(category);
          setCurrentView('exams');
        }
        const course = params.get('course');
        const academy = params.get('academy');
        const exam = params.get('exam') || params.get('exam-enquiry') || params.get('enquiry');

        if (course) {
          const c = getCourseById(course);
          if (c) {
            setSelectedCourseId(c.id);
            setSelectedAcademyId(c.academyId);
            setSelectedExamId(c.examId);
            setCurrentView('course-enquiry');
            return;
          }
        }
        if (academy) {
          setSelectedAcademyId(academy);
          if (exam) setSelectedExamId(exam);
          setCurrentView('academy-detail');
          return;
        }
        if (exam) {
          setSelectedExamId(exam);
          setCurrentView('academies');
          return;
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedExamId, selectedAcademyId, selectedCourseId]);

  // Handler: Select Exam from directory
  const handleSelectExam = (examId) => {
    setSelectedExamId(examId);
    setSelectedAcademyId(null);
    setSelectedCourseId(null);
    setCurrentView('academies');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#education-school-academy?exam=${examId}`);
    }
  };

  // Handler: Select Academy from list
  const handleSelectAcademy = (academyId) => {
    setSelectedAcademyId(academyId);
    setSelectedCourseId(null);
    setCurrentView('academy-detail');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#education-school-academy?exam=${selectedExamId || ''}&academy=${academyId}`);
    }
  };

  // Handler: Select Course from academy details
  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentView('course-enquiry');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#education-school-academy?course=${courseId}`);
    }
  };

  // Back Handlers
  const handleBackToExams = () => {
    setSelectedExamId(null);
    setSelectedAcademyId(null);
    setSelectedCourseId(null);
    setCurrentView('exams');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#education-school-academy');
    }
  };

  const handleBackToAcademies = () => {
    setSelectedAcademyId(null);
    setSelectedCourseId(null);
    setCurrentView('academies');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#education-school-academy?exam=${selectedExamId || ''}`);
    }
  };

  const handleBackToAcademyDetail = () => {
    setSelectedCourseId(null);
    setCurrentView('academy-detail');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#education-school-academy?exam=${selectedExamId || ''}&academy=${selectedAcademyId || ''}`);
    }
  };

  const selectedExam = selectedExamId ? getExamById(selectedExamId) : null;
  const selectedAcademy = selectedAcademyId ? getAcademyById(selectedAcademyId) : null;
  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;

  return (
    <div id="student-academy-page" className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <EducationSEO
        title="Student Academy | Competitive Examinations & Verified Academies | Revival International"
        description="Explore 40+ competitive examinations across 11 departments. Compare up to 10 verified academies per exam with audited fees and direct course enquiry."
        keywords="student academy, competitive exams, upsc ias coaching, ssc cgl, neet ug, gate coaching, cat iim coaching, verified academies, revival international"
      />

      {/* Breadcrumb Bar */}
      <div className="bg-white/80 dark:bg-navy-900/80 border-b border-slate-200 dark:border-navy-800 backdrop-blur-sm sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-gold-500 transition flex items-center gap-1 focus:outline-none"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <button
              onClick={() => navigateTo('education')}
              className="hover:text-gold-500 transition focus:outline-none"
            >
              Services
            </button>
            <span>/</span>
            <button
              onClick={handleBackToExams}
              className={`hover:text-gold-500 transition focus:outline-none ${currentView === 'exams' ? 'text-gold-500 font-bold' : ''
                }`}
            >
              Student Academy
            </button>

            {selectedExam && currentView !== 'exams' && (
              <>
                <span>/</span>
                <button
                  onClick={handleBackToAcademies}
                  className={`hover:text-gold-500 transition focus:outline-none ${currentView === 'academies' ? 'text-gold-500 font-bold' : ''
                    }`}
                >
                  {selectedExam.code} (Exam Enquiry)
                </button>
              </>
            )}

            {selectedAcademy && (currentView === 'academy-detail' || currentView === 'course-enquiry') && (
              <>
                <span>/</span>
                <button
                  onClick={handleBackToAcademyDetail}
                  className={`hover:text-gold-500 transition focus:outline-none ${currentView === 'academy-detail' ? 'text-gold-500 font-bold' : ''
                    }`}
                >
                  {selectedAcademy.shortName}
                </button>
              </>
            )}

            {selectedCourse && currentView === 'course-enquiry' && (
              <>
                <span>/</span>
                <span className="text-gold-500 font-bold">
                  Course Enquiry
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentView === 'exams' && (
          <ExamDirectoryView
            initialCategoryId={selectedCategoryId}
            onSelectExam={handleSelectExam}
          />
        )}

        {currentView === 'academies' && selectedExamId && (
          <ExamEnquiryView
            examId={selectedExamId}
            onSelectAcademy={handleSelectAcademy}
            onBackToExams={handleBackToExams}
          />
        )}

        {currentView === 'academy-detail' && selectedAcademyId && (
          <AcademyDetailView
            academyId={selectedAcademyId}
            examId={selectedExamId}
            onSelectCourse={handleSelectCourse}
            onBackToAcademies={handleBackToAcademies}
          />
        )}

        {currentView === 'course-enquiry' && selectedCourseId && (
          <CourseEnquiryView
            courseId={selectedCourseId}
            academyId={selectedAcademyId}
            examId={selectedExamId}
            onBackToAcademy={handleBackToAcademyDetail}
            onBackToExams={handleBackToExams}
          />
        )}
      

        {/* Related Academic Advisory Services */}
        <ScrollReveal>
          <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-navy-800">
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Related Academic Advisory Services
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('education')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1: Career Guidance */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      CAREER GUIDANCE
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">#school-career</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                    Career Guidance
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    Explore undergraduate and postgraduate courses, compare degrees, and discover academic pathways aligned with your interests and career goals.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('education-school-career')}
                    className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInquireService('school-career')}
                    className="px-3 py-1.5 bg-gold-shimmer text-navy-950 font-bold text-[11px] rounded-lg shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                  >
                    Inquire
                  </button>
                </div>
              </div>

              {/* Card 2: College Admission Assistance */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      ADMISSIONS
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">#college-adm</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                    College Admission Assistance
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    Get guidance on college selection, course eligibility, admission requirements, and application pathways for undergraduate and postgraduate programmes.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('education-college-adm')}
                    className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInquireService('college-adm')}
                    className="px-3 py-1.5 bg-gold-shimmer text-navy-950 font-bold text-[11px] rounded-lg shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Consultation Modal for Related Advisory Services */}
      <EducationEnquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        serviceId={inquiryServiceId}
      />
    </div>
  );
};

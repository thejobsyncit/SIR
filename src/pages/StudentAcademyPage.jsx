import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import ScrollReveal from '../components/ScrollReveal';
import {
  ExamDirectoryView
} from '../components/student-academy/ExamDirectoryView';
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
  GraduationCap, ChevronRight, Home, BookOpen, Building2, Layers, Award
} from 'lucide-react';

export const StudentAcademyPage = () => {
  const { navigateTo } = useApp();

  // Navigation flow state:
  // 'exams' -> 'academies' -> 'academy-detail' -> 'course-enquiry'
  const [currentView, setCurrentView] = useState('exams');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedAcademyId, setSelectedAcademyId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Hash query param detection for direct deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const course = params.get('course');
        const academy = params.get('academy');
        const exam = params.get('exam');

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
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
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
              className={`hover:text-gold-500 transition focus:outline-none ${
                currentView === 'exams' ? 'text-gold-500 font-bold' : ''
              }`}
            >
              Student Academy
            </button>

            {selectedExam && currentView !== 'exams' && (
              <>
                <span>/</span>
                <button
                  onClick={handleBackToAcademies}
                  className={`hover:text-gold-500 transition focus:outline-none ${
                    currentView === 'academies' ? 'text-gold-500 font-bold' : ''
                  }`}
                >
                  {selectedExam.code}
                </button>
              </>
            )}

            {selectedAcademy && (currentView === 'academy-detail' || currentView === 'course-enquiry') && (
              <>
                <span>/</span>
                <button
                  onClick={handleBackToAcademyDetail}
                  className={`hover:text-gold-500 transition focus:outline-none ${
                    currentView === 'academy-detail' ? 'text-gold-500 font-bold' : ''
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
            onSelectExam={handleSelectExam}
          />
        )}

        {currentView === 'academies' && selectedExamId && (
          <ExamAcademiesView
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
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  X, CheckCircle2, ShieldCheck, GraduationCap, Award, BookOpen,
  ArrowRight, Building2, Briefcase, FileText, ChevronRight,
  Calendar, Layers, Sparkles, ExternalLink, HelpCircle, Clock,
  Monitor, Globe2, AlertCircle
} from 'lucide-react';

export const ExamDetailModal = ({ exam, isOpen, onClose, onSelectCourse, onInquire }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset tab when exam changes
  useEffect(() => {
    setActiveTab('overview');
  }, [exam?.id]);

  if (!isOpen || !exam) return null;

  const hasVerifiedCourses = Boolean(exam.verifiedCourses && exam.verifiedCourses.length > 0);

  const getCategoryBadgeClass = (catId) => {
    switch (catId) {
      case 'civil-services':
      case 'state-psc':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'ssc-exams':
      case 'railway-exams':
        return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30';
      case 'banking-exams':
      case 'insurance-exams':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'defence-exams':
      case 'police-uniformed':
        return 'bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-600/30';
      case 'teaching-exams':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30';
      case 'engineering-govt':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
      case 'medical-govt':
      case 'medical-exams':
      case 'gcc-medical':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'judicial-legal':
        return 'bg-slate-600/15 text-slate-700 dark:text-slate-300 border-slate-600/30';
      case 'postal-central':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
      case 'research-scientific':
        return 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30';
      case 'management-psu':
        return 'bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-600/30';
      case 'ielts':
      case 'oet':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'gcc-engineering':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-gold-500/15 text-gold-700 dark:text-gold-400 border-gold-500/30';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-navy-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b border-slate-200 dark:border-navy-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getCategoryBadgeClass(exam.categoryId)}`}>
                {exam.categoryName || exam.categoryId}
              </span>
              {exam.country && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-gold-500" />
                  {exam.country}
                </span>
              )}
              {exam.examType && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/20">
                  {exam.examType}
                </span>
              )}
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-gold-600 dark:text-gold-400 tracking-tight">
                {exam.code}
              </div>
              <h2 id="exam-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white mt-1">
                {exam.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span><strong>Authority:</strong> {exam.conductingBody}</span>
              </div>
              {exam.officialUrl && (
                <a
                  href={exam.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gold-600 dark:text-gold-400 hover:underline font-semibold"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-200/80 dark:border-navy-800/80 mt-5 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Overview &amp; Purpose</span>
            </button>
            <button
              onClick={() => setActiveTab('pattern')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pattern'
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pattern &amp; Stages</span>
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'eligibility'
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Eligibility &amp; Requirements</span>
            </button>
            <button
              onClick={() => setActiveTab('application')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'application'
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Registration &amp; Dates</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-gold-500 text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Academies &amp; Courses ({exam.verifiedCourses?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          {/* TAB 1: OVERVIEW & PURPOSE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-500" />
                  Examination Overview
                </h3>
                <p className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-200">
                  {exam.overview}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3">
                <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Target Purpose &amp; Career Impact
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {exam.purpose}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conducting Body</span>
                  <div className="text-xs font-bold text-navy-900 dark:text-white">{exam.conductingBody}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction / Country</span>
                  <div className="text-xs font-bold text-navy-900 dark:text-white">{exam.country || 'International / Multi-country'}</div>
                </div>
              </div>

              {exam.officialUrl && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-navy-900 dark:text-white">Official Registration &amp; Information Portal</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">Access authenticated syllabus outlines and portal updates directly.</div>
                  </div>
                  <a
                    href={exam.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PATTERN & STAGES */}
          {activeTab === 'pattern' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-500" />
                  Examination Structure &amp; Stages
                </h3>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {exam.pattern}
                </div>
              </div>

              {exam.syllabusOrSkills && exam.syllabusOrSkills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    Tested Domains &amp; Core Syllabus Components
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {exam.syllabusOrSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ELIGIBILITY & REQUIREMENTS */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gold-500" />
                  Academic &amp; Professional Eligibility
                </h3>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {exam.eligibility}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Revival International Primary Source Verification (PSV) Advisory</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  For international medical and engineering licensing pathways (such as DHA, SCFHS, UPDA, SCE), candidates must undergo DataFlow credential verification and title equivalency prior to examination booking. Our senior advisors manage complete documentation audits.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATION PROCESS & DATES */}
          {activeTab === 'application' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Registration Procedure &amp; Application Steps
                </h3>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {exam.applicationProcess}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500" />
                  Fees, Booking Windows &amp; Validity
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  {exam.feesAndDates}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VERIFIED ACADEMIES & COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {hasVerifiedCourses ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                        Available Verified Preparation Courses
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Audited syllabi, authenticated instructors, and guaranteed batch schedules for {exam.code}.
                      </p>
                    </div>
                    <span className="text-xs font-black text-gold-600 dark:text-gold-400 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30">
                      {exam.verifiedCourses.length} Courses
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exam.verifiedCourses.map((crs) => (
                      <div
                        key={crs.id}
                        className="glass-card bg-slate-50/70 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-gold-500 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30">
                              {crs.academyName}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold-500" />
                              {crs.duration}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                              {crs.courseName}
                            </h4>
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                              <Monitor className="w-3 h-3 text-blue-500" />
                              <span>{crs.deliveryMode}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {crs.description}
                          </p>

                          {crs.keyBenefits && crs.keyBenefits.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-navy-800/80">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                Inclusions &amp; Key Features:
                              </span>
                              <div className="space-y-1">
                                {crs.keyBenefits.slice(0, 3).map((benefit, bIdx) => (
                                  <div key={bIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span className="truncate">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-navy-800">
                          <button
                            onClick={() => {
                              if (onSelectCourse) {
                                onSelectCourse(crs, exam);
                              }
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Select Course &amp; Enquire</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* MANDATORY CRITICAL REQUIREMENT: Clear empty state with active Exam Enquiry button */
                <div className="text-center py-10 px-6 bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-300 dark:border-navy-800 rounded-3xl space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                      No verified preparation courses are currently available for this examination.
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Revival International does not list unverified third-party institutes. However, our senior educational advisors provide 1-on-1 registration assistance, eligibility audits, and self-study pathway blueprints for {exam.code}.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onInquire) {
                          onInquire(exam);
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs shadow-gold-glow hover:opacity-95 transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Exam Enquiry</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            Close
          </button>

          <button
            onClick={() => {
              if (onInquire) {
                onInquire(exam);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Exam Enquiry</span>
          </button>
        </div>
      </div>
    </div>
  );
};


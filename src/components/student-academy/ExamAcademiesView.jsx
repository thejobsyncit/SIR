import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, MapPin, Star, BookOpen, ShieldCheck,
  ChevronRight, Filter, Building2, Clock, Sparkles, FileText, ArrowRight
} from 'lucide-react';
import {
  getExamById,
  getAcademiesForExam,
  getCoursesForAcademyAndExam
} from '../../data/studentAcademyData';

export const ExamAcademiesView = ({
  examId,
  onSelectAcademy,
  onBackToExams,
  onOpenEnquiry
}) => {
  const exam = useMemo(() => getExamById(examId), [examId]);
  const [learningModeFilter, setLearningModeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const academies = useMemo(() => {
    return getAcademiesForExam(examId, {
      learningMode: learningModeFilter,
      city: cityFilter
    });
  }, [examId, learningModeFilter, cityFilter]);

  if (!exam) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <p className="text-slate-600 dark:text-slate-400 font-medium">Examination not found or information unavailable.</p>
        <button
          onClick={onBackToExams}
          className="text-gold-500 font-bold hover:underline inline-flex items-center gap-1.5 text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Examinations Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" id="exam-academies-view">
      {/* Top Navigation Row: Back Button & Direct Enquiry Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToExams}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 transition cursor-pointer select-none"
          id="btn-back-to-exams"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Examinations</span>
        </button>

        {onOpenEnquiry && (
          <button
            onClick={() => onOpenEnquiry(exam.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
            id="btn-direct-exam-enquiry"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official Syllabus & Direct Enquiry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Exam Hero Banner matching reference images */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-bold uppercase tracking-wider">
                {exam.code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {exam.conductingBody}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Verified Academies for {exam.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
              {exam.shortDesc} Displaying verified partner academies offering specialized coaching, mock test series, and structured batches for {exam.code}.
            </p>
          </div>

          {/* Right Counter Box matching reference */}
          <div className="shrink-0 p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center space-y-1 min-w-[170px]">
            <span className="text-3xl font-black text-gold-500 font-serif">
              {academies.length}
            </span>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Matching Academies
            </p>
            <p className="text-[10px] text-slate-400">Max 10 Verified Results</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar matching reference */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gold-500" />
            <span>Filter Results:</span>
          </span>

          {/* Learning Mode Filter */}
          <select
            value={learningModeFilter}
            onChange={(e) => setLearningModeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium cursor-pointer"
            id="filter-learning-mode"
          >
            <option value="all">All Learning Modes</option>
            <option value="Classroom">Classroom Coaching</option>
            <option value="Online">Online Live</option>
            <option value="Hybrid">Hybrid Mode</option>
          </select>

          {/* City / Region Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium cursor-pointer"
            id="filter-city"
          >
            <option value="all">All Locations / Centers</option>
            <option value="Chennai">Chennai</option>
            <option value="Delhi">New Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong>{academies.length}</strong> verified {academies.length === 1 ? 'academy' : 'academies'}
        </div>
      </div>

      {/* Academies List matching reference */}
      {academies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-navy-900 border border-dashed border-slate-200 dark:border-navy-800 space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching verified academies found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No partner academies match the selected learning mode or city combination for {exam.code}.
          </p>
          <button
            onClick={() => { setLearningModeFilter('all'); setCityFilter('all'); }}
            className="text-xs text-gold-500 font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {academies.map((academy) => {
            const courses = getCoursesForAcademyAndExam(academy.id, examId);
            return (
              <div
                key={academy.id}
                className="group glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/60 dark:hover:border-gold-500/60 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-sm hover:shadow-luxury space-y-5"
                id={`academy-card-${academy.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Academy Brand Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Logo / Monogram matching screenshot */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-gold-400 border border-gold-500/30 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-md">
                      {academy.shortName.charAt(0)}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">
                          {academy.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Partner</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold-500" />
                          <span>{academy.city}, {academy.state}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <strong className="text-slate-800 dark:text-slate-200">{academy.rating}</strong>
                          <span>({academy.reviewsCount} reviews)</span>
                        </span>
                        <span>Est. {academy.establishedYear}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 font-normal">
                        {academy.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Learning Modes & View Academy Button */}
                  <div className="shrink-0 flex flex-col items-start lg:items-end justify-between gap-4 pt-2 lg:pt-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {academy.learningModes.map((mode, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onSelectAcademy(academy.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active-scale cursor-pointer self-stretch sm:self-auto justify-center"
                      id={`btn-view-academy-${academy.id}`}
                    >
                      <span>View Academy Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Available Courses preview for this exam */}
                {courses.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-navy-800/80 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                        <span>Available Courses for {exam.code} ({courses.length})</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <span><Clock className="w-3 h-3 inline mr-1 text-gold-500" />{course.duration}</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{course.fee}</span>
                            </div>
                          </div>

                          <span className="text-[10px] uppercase font-bold text-gold-500 shrink-0">
                            Audited
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamAcademiesView;

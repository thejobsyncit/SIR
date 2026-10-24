import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Star, ShieldCheck, CheckCircle2,
  Calendar, Clock, DollarSign, BookOpen, Layers, Users, Sparkles, ChevronDown,
  ChevronUp, ArrowRight, Building2, Award
} from 'lucide-react';
import {
  getAcademyById,
  getExamById,
  getCoursesForAcademyAndExam,
  getOtherCoursesForAcademy
} from '../../data/studentAcademyData';

export const AcademyDetailView = ({
  academyId,
  examId,
  onSelectCourse,
  onBackToAcademies
}) => {
  const academy = useMemo(() => getAcademyById(academyId), [academyId]);
  const exam = useMemo(() => getExamById(examId), [examId]);
  const examCourses = useMemo(() => getCoursesForAcademyAndExam(academyId, examId), [academyId, examId]);
  const otherCourses = useMemo(() => getOtherCoursesForAcademy(academyId, examId), [academyId, examId]);

  const [expandedSyllabus, setExpandedSyllabus] = useState({});

  const toggleSyllabus = (courseId) => {
    setExpandedSyllabus(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  if (!academy) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600 dark:text-slate-400">Academy profile not found.</p>
        <button
          onClick={onBackToAcademies}
          className="text-gold-500 font-bold hover:underline"
        >
          Return to Academies List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToAcademies}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 transition"
          id="btn-back-to-academies-list"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {exam ? `${exam.code} Academies` : 'Academies'}</span>
        </button>
      </div>

      {/* Academy Master Profile Banner */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 shadow-luxury space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-navy-800 pb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-gold-400 border border-gold-500/30 flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-lg">
              {academy.shortName.charAt(0)}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Partner Academy</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Established {academy.establishedYear}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                {academy.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-500" />
                  <span>{academy.city}, {academy.state}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <strong>{academy.rating} / 5.0</strong>
                  <span>({academy.reviewsCount} verified reviews)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick learning modes pills */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Modes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {academy.learningModes.map((mode, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold border border-gold-500/20"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information & Physical Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200/80 dark:border-navy-800 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              <span>Campus Address</span>
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {academy.address}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold-500" />
              <span>Direct Phone</span>
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <a href={`tel:${academy.phone}`} className="hover:text-gold-500">
                {academy.phone}
              </a>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-500" />
              <span>Official Email</span>
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <a href={`mailto:${academy.email}`} className="hover:text-gold-500">
                {academy.email}
              </a>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <span>Official Website</span>
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              <a
                href={academy.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:underline"
              >
                Visit Academy Portal →
              </a>
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About the Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {academy.description}
          </p>
        </div>

        {/* Facilities & Teaching Methods Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Facilities */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gold-500" />
              <span>Campus Facilities &amp; Infrastructure</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {academy.facilities.map((fac, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{fac}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Teaching Methods */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-500" />
              <span>Pedagogy &amp; Teaching Methodology</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {academy.teachingMethods.map((meth, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <span>{meth}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Primary Section: Courses Offered for the Selected Examination */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Audited Courses for {exam ? exam.code : 'Selected Examination'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transparent syllabus coverage, verified tuition fees, and upcoming batch schedules.
            </p>
          </div>
          <span className="text-xs font-bold text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
            {examCourses.length} Courses Offered
          </span>
        </div>

        {examCourses.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-navy-900 border border-dashed border-slate-200 dark:border-navy-800 text-xs text-slate-500">
            No specific courses listed for this exam right now.
          </div>
        ) : (
          <div className="space-y-6">
            {examCourses.map((course) => {
              const isSyllabusOpen = expandedSyllabus[course.id] !== false; // open by default
              return (
                <div
                  key={course.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:border-gold-500/50 transition duration-300"
                  id={`course-card-${course.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[10px] font-black uppercase tracking-wider border border-gold-500/30">
                          {course.learningMode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Fee Audited &amp; Verified
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-500" />
                          <span>Duration: <strong>{course.duration}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Tuition Fee: <strong className="text-emerald-600 dark:text-emerald-400">{course.fee}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Prominent "Enquire About This Course" Button */}
                    <div className="shrink-0">
                      <button
                        onClick={() => onSelectCourse(course.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg"
                        id={`btn-enquire-${course.id}`}
                      >
                        <span>Enquire About This Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Syllabus Modules */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                          <span>Curriculum &amp; Syllabus Coverage</span>
                        </h4>
                        <button
                          onClick={() => toggleSyllabus(course.id)}
                          className="text-xs text-gold-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>{isSyllabusOpen ? 'Hide Syllabus' : 'View Syllabus'}</span>
                          {isSyllabusOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isSyllabusOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {course.syllabus.map((mod, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-800 text-xs flex items-start gap-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 leading-snug">
                                {mod}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Upcoming Batches */}
                  {course.batches && course.batches.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        <span>Upcoming Verified Batches</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {course.batches.map((batch, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {batch.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                {batch.seatsLeft} seats left
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                              <p>Timing: <strong>{batch.timing}</strong></p>
                              <p>Commences: <strong>{batch.startDate}</strong></p>
                            </div>
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

      {/* Separate Section: Other Examinations & Courses Offered by Same Academy */}
      {otherCourses.length > 0 && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1 border-b border-slate-100 dark:border-navy-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold-500" />
              <span>Other Examinations &amp; Courses by {academy.shortName}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore additional programs offered by this institution across other competitive streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherCourses.map((c) => {
              const otherExam = getExamById(c.examId);
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold text-[10px] uppercase">
                      {otherExam ? otherExam.code : 'Competitive Exam'}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {c.title}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Duration: {c.duration} | Mode: {c.learningMode} | Fee: {c.fee}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectCourse(c.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-500 hover:text-gold-400 transition"
                  >
                    <span>Enquire About This Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

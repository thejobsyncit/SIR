import React, { useState, useMemo } from 'react';
import {
  Search, BookOpen, Building2, Landmark, Cpu, HeartPulse, GraduationCap,
  Shield, Briefcase, Scale, Compass, Globe2, ArrowRight, CheckCircle2,
  Calendar, Award, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import {
  getDepartments,
  getExaminations
} from '../../data/studentAcademyData';
import ScrollReveal from '../ScrollReveal';

const ICON_MAP = {
  Building2,
  Landmark,
  Cpu,
  HeartPulse,
  GraduationCap,
  Shield,
  Briefcase,
  Scale,
  Compass,
  Globe2
};

export const ExamDirectoryView = ({ onSelectExam, onSelectDepartment, initialDepartment = 'all' }) => {
  const departments = useMemo(() => getDepartments(), []);
  const [selectedDept, setSelectedDept] = useState(initialDepartment);
  const [searchQuery, setSearchQuery] = useState('');

  // National exams (non-international)
  const nationalDepts = useMemo(() => departments.filter(d => !d.isInternational), [departments]);
  // International department
  const intlDept = useMemo(() => departments.find(d => d.isInternational), [departments]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    let exams = getExaminations(selectedDept === 'all' ? null : selectedDept, searchQuery);
    // If not specifically viewing international, separate out international tests
    if (selectedDept !== 'intl-tests' && selectedDept !== 'all') {
      return exams.filter(e => e.departmentId !== 'intl-tests');
    }
    return exams;
  }, [selectedDept, searchQuery]);

  // Separate international tests for distinct showcase
  const internationalExams = useMemo(() => {
    return getExaminations('intl-tests', searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 border border-slate-800 text-white p-6 sm:p-10 md:p-12 shadow-luxury">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Student Academy Advisory Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Competitive Examinations &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-gold-500">
                Verified Coaching Academies
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore national government, banking, engineering, medical, defence, and global examinations. Compare up to 10 verified academies per exam with audited fees, transparent batch schedules, and direct course enquiry.
            </p>

            {/* Quick Stats Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-slate-800/80 text-xs">
              <div className="space-y-0.5">
                <span className="text-gold-400 font-extrabold text-lg sm:text-xl">11</span>
                <p className="text-slate-400 font-medium">Departments</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gold-400 font-extrabold text-lg sm:text-xl">40+</span>
                <p className="text-slate-400 font-medium">Competitive Exams</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gold-400 font-extrabold text-lg sm:text-xl">100%</span>
                <p className="text-slate-400 font-medium">Audited Academies</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gold-400 font-extrabold text-lg sm:text-xl">Zero Fee</span>
                <p className="text-slate-400 font-medium">Student Advisory</p>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gold-500/30 group">
              <img
                src="/images/academy_students.jpg"
                alt="Students Preparing at Verified Coaching Academy"
                className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />

              {/* Floating Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                    <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                      Verified Partner Academies
                    </span>
                    <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                      11 Exam Sectors
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 font-medium leading-snug">
                    Audited fee structures, batch schedules, and syllabus tracking for UPSC, SSC, NEET, GATE & CAT.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Department Filters Controls */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competitive exams by name, code (e.g. UPSC, SSC, NEET, GATE, CAT)..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 shadow-sm transition"
              id="student-academy-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1.5 self-end md:self-center">
            <Filter className="w-3.5 h-3.5 text-gold-500" />
            <span>Showing {filteredExams.length} examinations</span>
          </div>
        </div>

        {/* Department Filters Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Browse By Department
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === 'all'
                  ? 'bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50'
              }`}
            >
              All Categories
            </button>

            {departments.map((dept) => {
              const IconComp = ICON_MAP[dept.icon] || BookOpen;
              const isActive = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20'
                      : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-navy-950' : 'text-gold-500'}`} />
                  <span>{dept.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* National Examinations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>National Competitive Examinations</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredExams.filter(e => e.departmentId !== 'intl-tests').length} available)
            </span>
          </h2>
        </div>

        {filteredExams.filter(e => e.departmentId !== 'intl-tests').length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-navy-900 border border-dashed border-slate-200 dark:border-navy-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No examinations found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search criteria or clear the department filter.
            </p>
            <button
              onClick={() => { setSelectedDept('all'); setSearchQuery(''); }}
              className="text-xs text-gold-500 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.filter(e => e.departmentId !== 'intl-tests').map((exam) => {
              const dept = departments.find(d => d.id === exam.departmentId);
              return (
                <div
                  key={exam.id}
                  className="group bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 dark:hover:border-gold-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-luxury flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                        {dept?.title || 'Competitive Exam'}
                      </span>
                      {exam.nextCycle && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{exam.nextCycle}</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Code */}
                    <div>
                      <div className="text-xs font-black text-gold-600 dark:text-gold-400 tracking-wide uppercase">
                        {exam.code}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition line-clamp-1">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Conducted by: <span className="font-semibold text-slate-700 dark:text-slate-300">{exam.conductingBody}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {exam.shortDesc}
                    </p>

                    {/* Eligibility & Pattern mini specs */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800/80 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-200">Eligibility:</strong> {exam.eligibility}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-200">Pattern:</strong> {exam.pattern}
                        </span>
                      </div>
                    </div>

                    {/* Popular subjects */}
                    {exam.popularSubjects && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exam.popularSubjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectExam(exam.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-gold-500 text-white hover:text-navy-950 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md"
                      id={`explore-academies-${exam.id}`}
                    >
                      <span>Explore Academies</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dedicated Section: International Entrance & Language Tests (Displayed Separately) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-slate-950 border-2 border-gold-500/30 p-8 sm:p-10 shadow-luxury space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider border border-gold-500/30">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global Academic Mobility</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              International Entrance &amp; Language Tests
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Official standardized tests for undergraduate and postgraduate admissions to universities across the UK, USA, Canada, Europe, Australia, and Singapore.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internationalExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-navy-900/90 border border-gold-500/30 hover:border-gold-400 rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gold-400 font-black text-sm uppercase tracking-wider">
                    {exam.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 text-[10px] font-semibold border border-gold-500/20">
                    Global Test
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {exam.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {exam.shortDesc}
                </p>

                <div className="p-3 rounded-2xl bg-navy-950 border border-gold-500/10 space-y-1 text-[11px] text-slate-300">
                  <p><strong>Administered by:</strong> {exam.conductingBody}</p>
                  <p><strong>Pattern:</strong> {exam.pattern}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectExam(exam.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition shadow-md"
                  id={`explore-intl-academies-${exam.id}`}
                >
                  <span>Explore Verified Academies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

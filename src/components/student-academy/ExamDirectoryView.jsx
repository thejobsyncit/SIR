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
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Description, CTAs, and Key Stats */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                  Student Academy Advisory Portal
                </span>
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                  Verified Advisory • 11 Departments
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                Competitive Examinations &amp; Coaching Academies
              </h1>

              <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                Comprehensive guidance across national government, technical, medical &amp; global exam pathways.
              </p>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Explore national government, banking, engineering, medical, defence, and global examinations. Compare up to 10 verified academies per exam with audited fees, transparent batch schedules, and direct course enquiry.
              </p>

              {/* CTAs matching Career Guidance */}
              <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                <button
                  onClick={() => {
                    const el = document.getElementById('browse-exams-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Examinations</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('international-tests-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                >
                  <Globe2 className="w-4 h-4 text-gold-500" />
                  <span>Global Tests ↓</span>
                </button>
              </div>

              {/* Key Quick Stats */}
              <div className="pt-6 border-t border-slate-100 dark:border-navy-800 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Departments</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">11 Exam Sectors</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Competitive Exams</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">40+ In Catalog</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Partner Academies</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">100% Audited</p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
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
                      Audited fee structures, batch schedules, and syllabus tracking for UPSC, SSC, NEET, GATE &amp; CAT.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Search & Department Filters Controls */}
      <ScrollReveal>
        <div id="browse-exams-section" className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-5 sm:p-6 md:p-8 shadow-luxury space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competitive exams by name, code (e.g. UPSC, SSC, NEET, GATE, CAT)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition font-medium"
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
              <span>Showing <strong className="text-navy-900 dark:text-white font-black">{filteredExams.length}</strong> examinations</span>
            </div>
          </div>

          {/* Department Filters Pills */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Browse By Department:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => setSelectedDept('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 focus:outline-none ${selectedDept === 'all'
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 font-black shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent font-medium'
                  }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] opacity-75">({getExaminations().length})</span>
              </button>

              {departments.map((dept) => {
                const IconComp = ICON_MAP[dept.icon] || BookOpen;
                const isActive = selectedDept === dept.id;
                const count = getExaminations(dept.id).length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5 focus:outline-none ${isActive
                      ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 font-bold shadow-md'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent font-medium'
                      }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-navy-950' : 'text-gold-500'}`} />
                    <span>{dept.title}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* National Examinations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
            <span>National Competitive Examinations</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredExams.filter(e => e.departmentId !== 'intl-tests').length} available)
            </span>
          </h2>
        </div>

        {filteredExams.filter(e => e.departmentId !== 'intl-tests').length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-navy-900 border border-dashed border-slate-200 dark:border-navy-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">No examinations found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Try adjusting your search criteria or clear the department filter.
            </p>
            <button
              onClick={() => { setSelectedDept('all'); setSearchQuery(''); }}
              className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline"
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
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/80 rounded-3xl p-6 transition-all duration-300 hover:shadow-luxury flex flex-col justify-between space-y-5 group h-full"
                >
                  <div className="space-y-3.5">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
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
                      <div className="text-xl font-black text-gold-600 dark:text-gold-400 font-sans tracking-tight group-hover:text-gold-500 transition">
                        {exam.code}
                      </div>
                      <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-1 mt-0.5">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        Conducted by: <span className="font-bold text-navy-900 dark:text-slate-200">{exam.conductingBody}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                      {exam.shortDesc}
                    </p>

                    {/* Eligibility & Pattern mini specs */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          <strong className="text-navy-900 dark:text-slate-200">Eligibility:</strong> {exam.eligibility}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          <strong className="text-navy-900 dark:text-slate-200">Pattern:</strong> {exam.pattern}
                        </span>
                      </div>
                    </div>

                    {/* Popular subjects */}
                    {exam.popularSubjects && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exam.popularSubjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 text-[10px] text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-navy-800"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-gold-glow hover:opacity-95 active-scale"
                      id={`explore-academies-${exam.id}`}
                      data-action="exam-enquiry"
                    >
                      <span>Exam Enquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dedicated Section: International Entrance & Language Tests */}
      <ScrollReveal>
        <div id="international-tests-section" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-luxury space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black uppercase tracking-wider border border-gold-500/30">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Global Academic Mobility</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                International Entrance &amp; Language Tests
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
                Official standardized tests for undergraduate and postgraduate admissions to universities across the UK, USA, Canada, Europe, Australia, and Singapore.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internationalExams.map((exam) => (
              <div
                key={exam.id}
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/80 rounded-3xl p-6 space-y-4 transition-all duration-300 shadow-sm hover:shadow-luxury flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-gold-600 dark:text-gold-400 font-sans tracking-tight">
                      {exam.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[10px] font-bold border border-gold-500/30">
                      Global Test
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium">
                    {exam.shortDesc}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <p><strong className="text-navy-900 dark:text-white">Administered by:</strong> {exam.conductingBody}</p>
                    <p><strong className="text-navy-900 dark:text-white">Pattern:</strong> {exam.pattern}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectExam(exam.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs uppercase tracking-wider shadow-gold-glow hover:opacity-95 active-scale transition"
                    id={`explore-intl-academies-${exam.id}`}
                    data-action="exam-enquiry"
                  >
                    <span>Exam Enquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

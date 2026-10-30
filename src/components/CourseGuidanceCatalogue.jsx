import React, { useState, useMemo } from 'react';
import { 
  Search, X, Filter, Sparkles, GraduationCap, ChevronDown, 
  ArrowRight, CheckCircle2, ShieldCheck, Calendar, BookOpen, 
  Layers, RotateCcw, Building2, Briefcase, HeartPulse, Scale,
  Atom, Terminal, Cpu, Sprout, Palette, Plane, Users, Archive, Award
} from 'lucide-react';
import { 
  COURSES_CATALOGUE, 
  ACADEMIC_CATEGORIES, 
  getCategoryCounts 
} from '../data/coursesCatalogueData';
import { CourseDetailModal } from './CourseDetailModal';
import { UgDepartmentStreamsExplorer } from './UgDepartmentStreamsExplorer';
import { UG_COURSES_CATALOGUE } from '../data/ugDepartmentStreamsData';
import { PgDepartmentStreamsExplorer } from './PgDepartmentStreamsExplorer';
import { PG_COURSES_CATALOGUE } from '../data/pgDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

// Icon mapping for academic categories
const categoryIcons = {
  'BookOpen': BookOpen,
  'Briefcase': Briefcase,
  'Atom': Atom,
  'Terminal': Terminal,
  'Cpu': Cpu,
  'HeartPulse': HeartPulse,
  'Sprout': Sprout,
  'Scale': Scale,
  'GraduationCap': GraduationCap,
  'Palette': Palette,
  'Building2': Building2,
  'Plane': Plane,
  'Users': Users,
  'Archive': Archive,
  'Sparkles': Sparkles,
  'Award': Award
};

export const CourseGuidanceCatalogue = ({ onInquire }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'UG', 'PG', 'Professional', 'Integrated'
  const [selectedCategory, setSelectedCategory] = useState('all'); // categoryId
  const [selectedDuration, setSelectedDuration] = useState('all'); // 'all', '1', '2', '3', '4', '5'
  const [selectedStream, setSelectedStream] = useState('all'); // 'all', 'pcm', 'pcb', 'commerce', 'any'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'name-asc', 'duration-asc', 'duration-desc'
  const [activeModalCourse, setActiveModalCourse] = useState(null);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  // Level counts
  const levelCounts = useMemo(() => {
    return {
      all: COURSES_CATALOGUE.length,
      UG: UG_COURSES_CATALOGUE.length,
      PG: PG_COURSES_CATALOGUE.length,
      other: COURSES_CATALOGUE.filter(c => c.level === 'Integrated' || c.level === 'Professional').length
    };
  }, []);

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    let result = COURSES_CATALOGUE.filter((course) => {
      // Level filter
      if (selectedLevel === 'UG' && course.level !== 'UG') return false;
      if (selectedLevel === 'PG' && course.level !== 'PG') return false;
      if (selectedLevel === 'other' && course.level !== 'Integrated' && course.level !== 'Professional') return false;

      // Category filter
      if (selectedCategory !== 'all' && course.categoryId !== selectedCategory) return false;

      // Duration filter
      if (selectedDuration !== 'all') {
        const d = parseFloat(selectedDuration);
        if (d === 5 && course.durationYears < 5) return false;
        if (d !== 5 && Math.floor(course.durationYears) !== d) return false;
      }

      // Stream filter
      if (selectedStream !== 'all') {
        const reqs = (course.requiredSubjects || []).join(' ').toLowerCase();
        if (selectedStream === 'pcm' && !reqs.includes('physics') && !reqs.includes('mathematics') && !reqs.includes('pcm')) return false;
        if (selectedStream === 'pcb' && !reqs.includes('biology') && !reqs.includes('pcb')) return false;
        if (selectedStream === 'commerce' && !reqs.includes('commerce') && !reqs.includes('accountancy') && !reqs.includes('any stream')) return false;
        if (selectedStream === 'any' && !reqs.includes('any stream') && !reqs.includes('any discipline')) return false;
      }

      // Search Query filter (course name, abbreviation, specialization, career interest, subjects, exams)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const nameMatch = course.name.toLowerCase().includes(q);
        const abbrMatch = course.abbreviation.toLowerCase().includes(q);
        const deptMatch = course.department.toLowerCase().includes(q);
        const specMatch = (course.specializations || []).some(s => s.toLowerCase().includes(q));
        const careerMatch = (course.careerOpportunities || []).some(c => c.toLowerCase().includes(q));
        const sectorMatch = (course.employmentSectors || []).some(s => s.toLowerCase().includes(q));
        const examMatch = (course.entranceExams || []).some(e => e.toLowerCase().includes(q));
        const skillMatch = (course.coreSkills || []).some(sk => sk.toLowerCase().includes(q));

        if (!nameMatch && !abbrMatch && !deptMatch && !specMatch && !careerMatch && !sectorMatch && !examMatch && !skillMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'duration-asc') {
      result.sort((a, b) => a.durationYears - b.durationYears);
    } else if (sortBy === 'duration-desc') {
      result.sort((a, b) => b.durationYears - a.durationYears);
    }

    return result;
  }, [searchQuery, selectedLevel, selectedCategory, selectedDuration, selectedStream, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedLevel !== 'all' || selectedCategory !== 'all' || selectedDuration !== 'all' || selectedStream !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedCategory('all');
    setSelectedDuration('all');
    setSelectedStream('all');
    setSortBy('recommended');
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'UG':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'PG':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30';
      case 'Integrated':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'Professional':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-gold-500/15 text-gold-700 dark:text-gold-400 border-gold-500/30';
    }
  };

  return (
    <div id="course-guidance-catalogue" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <ScrollReveal>
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-gold-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Excellence & Degree Pathways</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white leading-tight">
            UG & PG Course Guidance Catalogue
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Explore verified undergraduate, postgraduate, and professional degree pathways across 16 academic disciplines. Compare eligibility prerequisites, national entrance exams, curriculum specializations, and statutory licensing standards.
          </p>
        </div>
      </ScrollReveal>

      {/* Level Switcher Station */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-4 sm:p-5 shadow-luxury flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Degree Level:
            </span>
            {[
              { id: 'all', label: 'All Degrees', count: levelCounts.all },
              { id: 'UG', label: 'Undergraduate (UG)', count: levelCounts.UG },
              { id: 'PG', label: 'Postgraduate (PG)', count: levelCounts.PG },
              { id: 'other', label: 'Integrated & Professional', count: levelCounts.other }
            ].map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    isSelected
                      ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                  }`}
                >
                  <span>{lvl.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-navy-950/20 text-navy-950 font-black' : 'bg-slate-200 dark:bg-navy-900 text-slate-500 dark:text-slate-400'}`}>
                    {lvl.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {selectedLevel === 'UG' ? (
              <span>13 Department Streams • 129 Accredited Courses</span>
            ) : selectedLevel === 'PG' ? (
              <span>15 Department Streams • 195 Master's Courses</span>
            ) : (
              <>
                <span>Showing:</span>
                <strong className="text-navy-900 dark:text-white font-black">{filteredCourses.length}</strong>
                <span>of {COURSES_CATALOGUE.length} Courses</span>
              </>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Conditionally Render Dedicated UG / PG Department Streams Explorer or Standard Filters & Catalogue */}
      {selectedLevel === 'UG' ? (
        <UgDepartmentStreamsExplorer
          onInquire={onInquire}
          onSelectModalCourse={(course) => setActiveModalCourse(course)}
          onBackToAllLevels={() => setSelectedLevel('all')}
        />
      ) : selectedLevel === 'PG' ? (
        <PgDepartmentStreamsExplorer
          onInquire={onInquire}
          onSelectModalCourse={(course) => setActiveModalCourse(course)}
          onBackToAllLevels={() => setSelectedLevel('all')}
        />
      ) : (
        <>
          {/* Main Filter Control Station */}
          <ScrollReveal>
            <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-5 sm:p-6 md:p-8 shadow-luxury space-y-6">
              {/* Search Bar + Secondary Dropdown Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            {/* Live Search Input (5 cols on large) */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course name, abbreviation (MBBS, B.Tech, MBA), specialization, or career role..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Dropdown (3 cols) */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs font-medium text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition cursor-pointer"
                aria-label="Filter by Academic Department"
              >
                <option value="all">All 16 Academic Departments ({categoryCounts.all})</option>
                {ACADEMIC_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({categoryCounts[cat.id] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs font-medium text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition cursor-pointer"
                aria-label="Filter by Course Duration"
              >
                <option value="all">Any Duration</option>
                <option value="1">1 Year / Diploma</option>
                <option value="2">2 Years (PG Master's)</option>
                <option value="3">3 Years (UG Degrees)</option>
                <option value="4">4 Years (B.Tech, B.Des, Agri)</option>
                <option value="5">5+ Years (MBBS, B.Arch, Law)</option>
              </select>
            </div>

            {/* Sort Selector (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs font-medium text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition cursor-pointer"
                aria-label="Sort Courses"
              >
                <option value="recommended">Recommended</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
                <option value="duration-asc">Duration (Shortest)</option>
                <option value="duration-desc">Duration (Longest)</option>
              </select>
            </div>
          </div>

          {/* Quick Department Scrollable Chips */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Explore Academic Streams:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 focus:outline-none ${
                  selectedCategory === 'all'
                    ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 font-black'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent'
                }`}
              >
                <span>All Streams</span>
                <span className="text-[10px] opacity-75">({categoryCounts.all})</span>
              </button>
              {ACADEMIC_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComponent = categoryIcons[cat.icon] || BookOpen;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5 focus:outline-none ${
                      isSelected
                        ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 font-bold'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({categoryCounts[cat.id] || 0})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Chips & Reset */}
          {hasActiveFilters && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-navy-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLevel !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                  Level: {selectedLevel}
                  <button onClick={() => setSelectedLevel('all')} className="hover:text-navy-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                  Dept: {ACADEMIC_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-navy-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDuration !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                  Duration: {selectedDuration} Years
                  <button onClick={() => setSelectedDuration('all')} className="hover:text-navy-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Courses Grid or Empty State */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <ScrollReveal key={course.id}>
              <div 
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500/80 transition-all duration-300 hover:shadow-luxury flex flex-col justify-between group h-full"
              >
                <div className="space-y-3.5">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getLevelBadgeClass(course.level)}`}>
                        {course.level}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {course.department}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      {course.typicalDuration.split(' ')[0]} Yrs
                    </span>
                  </div>

                  {/* Course Title & Abbreviation */}
                  <div>
                    <div className="text-xl font-black text-gold-600 dark:text-gold-400 font-sans tracking-tight group-hover:text-gold-500 transition">
                      {course.abbreviation}
                    </div>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                      {course.name}
                    </h3>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                    {course.shortDescription}
                  </p>

                  {/* Highlights Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800/80 text-[11px]">
                    <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                      <span className="truncate"><strong>Eligibility:</strong> {course.eligibility}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span className="truncate"><strong>Exams:</strong> {course.entranceExams.slice(0, 2).join(', ')}</span>
                    </div>

                    {course.licensingRequired && (
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{course.regulatoryBody.split('—')[0]} Regulated</span>
                      </div>
                    )}
                  </div>

                  {/* Top Specializations Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.specializations.slice(0, 3).map((spec, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-navy-800 truncate max-w-[130px]">
                        {spec}
                      </span>
                    ))}
                    {course.specializations.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 self-center">
                        +{course.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalCourse(course)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      if (onInquire) onInquire(course);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition text-center shrink-0"
                    title={`Inquire for ${course.abbreviation}`}
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        /* Empty State */
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-10 sm:p-16 text-center space-y-4 max-w-xl mx-auto shadow-luxury">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
              No Courses Match Your Criteria
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We couldn't find any courses matching your current search or filter combination. Try clearing your filters or explore popular degrees below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['B.Tech', 'MBBS', 'MBA', 'Law', 'Data Science', 'Civil'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    resetFilters();
                    setSearchQuery(term);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent"
                >
                  "{term}"
                </button>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}


              </>
      )}

      {/* Detail Modal Component */}
      <CourseDetailModal
        course={activeModalCourse}
        isOpen={!!activeModalCourse}
        onClose={() => setActiveModalCourse(null)}
        onSelectCourse={(course) => setActiveModalCourse(course)}
        onInquire={(course) => {
          if (onInquire) onInquire(course);
        }}
      />
    </div>
  );
};

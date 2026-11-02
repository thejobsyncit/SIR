import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, RotateCcw, Sparkles, GraduationCap, ArrowRight, ShieldCheck, Award,
  ChevronLeft, ChevronRight, SlidersHorizontal, BookOpen, Layers
} from 'lucide-react';
import { CourseDetailModal } from './CourseDetailModal';
import { UgDepartmentStreamsExplorer } from './UgDepartmentStreamsExplorer';
import { UG_COURSES_CATALOGUE, UG_DEPARTMENT_STREAMS } from '../data/ugDepartmentStreamsData';
import { PgDepartmentStreamsExplorer } from './PgDepartmentStreamsExplorer';
import { PG_COURSES_CATALOGUE, PG_DEPARTMENT_STREAMS } from '../data/pgDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

// Items per page for View All Degrees pagination
const ITEMS_PER_PAGE = 24;

// Department and career synonyms mapping for global search
const streamSynonyms = {
  cs: ['computer science', 'information technology', 'bca', 'mca', 'b.tech (cse)', 'software'],
  it: ['information technology', 'computer science', 'bca', 'mca', 'b.tech (cse)', 'software'],
  mech: ['mechanical', 'robotics', 'automobile'],
  auto: ['automobile', 'mechanical'],
  automobile: ['mechanical', 'b.tech (me)'],
  civil: ['civil', 'infrastructure', 'construction', 'b.tech (civil)'],
  ece: ['electronics', 'communication', 'b.tech (ece)'],
  eee: ['electrical', 'electronics', 'b.tech (ece)'],
  medical: ['mbbs', 'bds', 'b.pharm', 'nursing', 'bpt', 'physiotherapy', 'medicine', 'doctor'],
  doctor: ['mbbs', 'bds', 'medical'],
  dental: ['bds', 'dentist'],
  dentist: ['bds'],
  nursing: ['nursing'],
  nurse: ['nursing'],
  pharma: ['pharmacy', 'b.pharm'],
  pharmacy: ['b.pharm', 'pharmacist'],
  pharmacist: ['b.pharm'],
  physiotherapy: ['bpt', 'physiotherapist'],
  physiotherapist: ['bpt'],
  law: ['ll.b', 'll.m', 'lawyer', 'legal', 'advocate'],
  lawyer: ['ll.b', 'll.m', 'law'],
  advocate: ['ll.b', 'll.m', 'law'],
  legal: ['ll.b', 'll.m', 'law'],
  business: ['bba', 'mba', 'management'],
  management: ['bba', 'mba', 'commerce'],
  commerce: ['b.com', 'm.com', 'commerce and management', 'accountancy', 'finance'],
  accounting: ['b.com', 'm.com', 'finance'],
  accountant: ['b.com', 'm.com'],
  finance: ['b.com', 'mba', 'm.com', 'finance'],
  design: ['b.des', 'bfa', 'fashion', 'interior', 'graphic'],
  designer: ['b.des', 'bfa'],
  architecture: ['b.arch', 'b.plan', 'architect'],
  architect: ['b.arch', 'b.plan', 'software architect'],
  aviation: ['aviation', 'pilot', 'hospitality', 'airline'],
  pilot: ['aviation', 'bba (aviation)'],
  hospitality: ['hotel', 'bhm', 'tourism', 'hospitality'],
  hotel: ['b.sc. (h&ha) / bhm', 'hospitality'],
  tourism: ['hospitality', 'tourism', 'aviation'],
  arts: ['arts and humanities', 'english', 'psychology', 'journalism'],
  humanities: ['arts and humanities', 'english', 'psychology'],
  psychology: ['psychology', 'psychologist', 'counselor'],
  psychologist: ['psychology'],
  teaching: ['b.ed', 'm.ed', 'education'],
  teacher: ['b.ed', 'm.ed', 'education'],
  education: ['b.ed', 'm.ed', 'teaching'],
  agriculture: ['b.sc. (hons) agriculture', 'farming', 'agri'],
  biotechnology: ['b.sc. (hons) biotech', 'biotechnology', 'bio'],
  biotech: ['b.sc. (hons) biotech', 'biotechnology', 'bio'],
  ai: ['ai & ml', 'data science & ai', 'robotics', 'artificial intelligence'],
  'data science': ['data science', 'ai & ml', 'maths & stats'],
  cyber: ['cyber security', 'b.tech (cyber security)']
};

/**
 * Normalizes course data across Undergraduate and Postgraduate catalogues
 * into a single unified schema so components never encounter undefined properties.
 */
export const normalizeCourse = (course, defaultLevel = 'UG') => {
  if (!course) return null;
  const level = course.level || defaultLevel;
  const dept = course.streamName || course.department || 'General Academic Discipline';
  const duration = course.duration || course.typicalDuration || '2 Years';
  const overview = course.overview || course.shortDescription || '';

  return {
    ...course,
    id: course.id,
    name: course.name || 'Academic Degree Program',
    abbreviation: course.abbreviation || 'DEG',
    level,
    streamId: course.streamId || 'general',
    streamName: dept,
    department: dept,
    duration,
    typicalDuration: duration,
    durationYears: course.durationYears || (parseInt(duration) || 2),
    overview,
    shortDescription: overview,
    eligibility: course.eligibility || 'Completion of qualifying academic examination (10+2 / Bachelor Degree) from a recognized board or university.',
    entranceExams: Array.isArray(course.entranceExams) ? course.entranceExams : [],
    specializations: Array.isArray(course.specializations) ? course.specializations : [],
    careerPaths: Array.isArray(course.careerPaths) ? course.careerPaths : (Array.isArray(course.careerOpportunities) ? course.careerOpportunities : []),
    careerOpportunities: Array.isArray(course.careerOpportunities) ? course.careerOpportunities : (Array.isArray(course.careerPaths) ? course.careerPaths : []),
    employmentSectors: Array.isArray(course.employmentSectors) ? course.employmentSectors : [],
    regulatoryBody: course.regulatoryBody || 'UGC / Statutory Regulatory Councils',
    degrees: Array.isArray(course.degrees) ? course.degrees : (course.degrees ? [course.degrees] : []),
    licensingRequired: Boolean(course.licensingRequired)
  };
};

/**
 * Unified single source of truth for all courses across UG and PG.
 * Total unique courses = UG_COURSES_CATALOGUE (129) + PG_COURSES_CATALOGUE (195) = 324 unique courses.
 */
export const getAllUnifiedCourses = () => {
  const ugNormalized = (UG_COURSES_CATALOGUE || []).map(c => normalizeCourse(c, 'UG'));
  const pgNormalized = (PG_COURSES_CATALOGUE || []).map(c => normalizeCourse(c, 'PG'));
  
  // Combine and deduplicate by id to guarantee absolute single source of truth
  const courseMap = new Map();
  [...ugNormalized, ...pgNormalized].forEach(course => {
    if (course && course.id && !courseMap.has(course.id)) {
      courseMap.set(course.id, course);
    }
  });

  return Array.from(courseMap.values());
};

const matchCourse = (course, rawQuery) => {
  const q = (rawQuery || '').toLowerCase().trim();
  if (!q) return true;
  const qClean = q.replace(/[\.\s\-\/()]/g, '');

  const name = (course.name || '').toLowerCase();
  const abbr = (course.abbreviation || '').toLowerCase();
  const abbrClean = abbr.replace(/[\.\s\-\/()]/g, '');
  const dept = (course.department || course.streamName || '').toLowerCase();
  const desc = (course.shortDescription || course.overview || '').toLowerCase();
  
  const degrees = (course.degrees || []).map(d => (d || '').toLowerCase());
  const specs = (course.specializations || []).map(s => (s || '').toLowerCase());
  const careers = (course.careerOpportunities || course.careerPaths || []).map(c => (c || '').toLowerCase());
  const sectors = (course.employmentSectors || []).map(s => (s || '').toLowerCase());
  const exams = (course.entranceExams || []).map(e => (e || '').toLowerCase());
  const skills = (course.coreSkills || []).map(s => (s || '').toLowerCase());

  // 1. For very short queries (<= 2 chars), handle with word boundary & degree prefix matching
  if (qClean.length <= 2) {
    const isBe = qClean === 'be';
    const isMe = qClean === 'me';
    const isAi = qClean === 'ai';
    const isIt = qClean === 'it';
    const isCs = qClean === 'cs';

    if (isBe && (dept.includes('engineering') && course.level === 'UG' || abbrClean.startsWith('btech') || abbrClean.startsWith('be') || degrees.some(d => d.includes('b.e') || d.includes('b.tech')))) return true;
    if (isMe && (dept.includes('engineering') && course.level === 'PG' || abbrClean.startsWith('mtech') || abbrClean.startsWith('me') || degrees.some(d => d.includes('m.e') || d.includes('m.tech')))) return true;
    if (isAi && (abbr.includes('ai') || specs.some(s => s.includes('artificial intelligence') || s.includes('ai')) || careers.some(c => c.includes('ai')))) return true;
    if (isIt && (dept.includes('information technology') || abbrClean.includes('it') || name.includes('information technology'))) return true;
    if (isCs && (dept.includes('computer science') || abbrClean.includes('cse') || abbrClean.includes('cs') || name.includes('computer science'))) return true;

    const wordRegex = new RegExp('\\b' + qClean + '\\b', 'i');
    if (wordRegex.test(abbr) || wordRegex.test(name)) return true;
    return false;
  }

  // 2. Direct text matches
  if (name.includes(q) || abbr.includes(q) || dept.includes(q) || desc.includes(q)) return true;
  if (abbrClean.includes(qClean)) return true;
  if (degrees.some(d => d.includes(q) || d.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;

  if (specs.some(s => s.includes(q) || s.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;
  if (careers.some(c => c.includes(q) || c.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;
  if (sectors.some(s => s.includes(q))) return true;
  if (exams.some(e => e.includes(q))) return true;
  if (skills.some(s => s.includes(q))) return true;

  // 3. Degree abbreviation patterns
  const degreePatt = {
    btech: ['btech', 'b.tech', 'be', 'b.e.'],
    be: ['btech', 'b.tech', 'be', 'b.e.'],
    mtech: ['mtech', 'm.tech', 'me', 'm.e.'],
    me: ['mtech', 'm.tech', 'me', 'm.e.'],
    bsc: ['bsc', 'b.sc'],
    msc: ['msc', 'm.sc'],
    bcom: ['bcom', 'b.com'],
    mcom: ['mcom', 'm.com'],
    ba: ['ba', 'b.a'],
    ma: ['ma', 'm.a'],
    llb: ['llb', 'll.b'],
    llm: ['llm', 'll.m'],
    bca: ['bca'],
    mca: ['mca'],
    mba: ['mba'],
    mbbs: ['mbbs'],
    bds: ['bds'],
    bpharm: ['bpharm', 'b.pharm'],
    mpharm: ['mpharm', 'm.pharm'],
    bpt: ['bpt'],
    mpt: ['mpt'],
    bdes: ['bdes', 'b.des'],
    mdes: ['mdes', 'm.des'],
    barch: ['barch', 'b.arch'],
    march: ['march', 'm.arch'],
    bplan: ['bplan', 'b.plan'],
    bfa: ['bfa'],
    mfa: ['mfa'],
    bed: ['bed', 'b.ed'],
    med: ['med', 'm.ed'],
    bsw: ['bsw'],
    msw: ['msw']
  };

  if (degreePatt[qClean]) {
    const targets = degreePatt[qClean];
    if (targets.some(t => {
      const tClean = t.replace(/[\.\s\-\/()]/g, '');
      return abbrClean.includes(tClean) || 
             degrees.some(d => d.replace(/[\.\s\-\/()]/g, '').includes(tClean));
    })) {
      return true;
    }
  }

  // 4. Synonym aliases
  const synonyms = streamSynonyms[q] || streamSynonyms[qClean];
  if (synonyms) {
    if (synonyms.some(syn => {
      const synClean = syn.replace(/[\.\s\-\/()]/g, '');
      return name.includes(syn) || abbr.includes(syn) || dept.includes(syn) || 
             abbrClean.includes(synClean) || specs.some(s => s.includes(syn)) || 
             careers.some(c => c.includes(syn));
    })) {
      return true;
    }
  }

  return false;
};

export const CourseGuidanceCatalogue = ({ onInquire }) => {
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'UG', 'PG'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStream, setSelectedStream] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModalCourse, setActiveModalCourse] = useState(null);

  // Single Source of Truth: All unified courses combining UG and PG
  const allUnifiedCourses = useMemo(() => {
    return getAllUnifiedCourses();
  }, []);

  const ugCourses = useMemo(() => {
    return allUnifiedCourses.filter(c => c.level === 'UG');
  }, [allUnifiedCourses]);

  const pgCourses = useMemo(() => {
    return allUnifiedCourses.filter(c => c.level === 'PG');
  }, [allUnifiedCourses]);

  // Dynamically calculated degree level counts from the exact single source of truth dataset
  const levelCounts = useMemo(() => {
    return {
      all: allUnifiedCourses.length, // 324 unique courses (129 UG + 195 PG)
      UG: ugCourses.length,          // 129 UG courses
      PG: pgCourses.length           // 195 PG courses
    };
  }, [allUnifiedCourses, ugCourses, pgCourses]);

  // Unique Department Streams available across UG and PG catalogues for filtering
  const availableStreams = useMemo(() => {
    const streamMap = new Map();
    allUnifiedCourses.forEach(c => {
      const stream = c.department || c.streamName;
      if (stream) {
        streamMap.set(stream, (streamMap.get(stream) || 0) + 1);
      }
    });
    return Array.from(streamMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allUnifiedCourses]);

  // Reset pagination to page 1 whenever search, stream filter, sort, or degree level changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStream, sortBy, selectedLevel]);

  // Filtered Courses for 'All Degrees' view
  const filteredCourses = useMemo(() => {
    let result = allUnifiedCourses;

    // Stream / Department filter
    if (selectedStream !== 'all') {
      result = result.filter(c => (c.department === selectedStream || c.streamName === selectedStream));
    }

    // Global Search filter
    if (searchQuery.trim()) {
      result = result.filter(course => matchCourse(course, searchQuery));
    }

    // Sorting
    const sorted = [...result];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'level-ug') {
      sorted.sort((a, b) => (a.level === 'UG' ? -1 : 1));
    } else if (sortBy === 'level-pg') {
      sorted.sort((a, b) => (a.level === 'PG' ? -1 : 1));
    } else if (sortBy === 'duration-asc') {
      sorted.sort((a, b) => a.durationYears - b.durationYears);
    } else if (sortBy === 'duration-desc') {
      sorted.sort((a, b) => b.durationYears - a.durationYears);
    }

    return sorted;
  }, [allUnifiedCourses, selectedStream, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1;
  const displayedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const handleOpenCourseModal = (rawCourse) => {
    if (!rawCourse) return;
    setActiveModalCourse(normalizeCourse(rawCourse, rawCourse.level || 'UG'));
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'UG':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'PG':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30';
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
            Explore verified undergraduate and postgraduate degree pathways across academic disciplines. Compare eligibility prerequisites, national entrance exams, curriculum specializations, and statutory licensing standards.
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
              { id: 'PG', label: 'Postgraduate (PG)', count: levelCounts.PG }
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
              <span>13 Department Streams • {levelCounts.UG} Accredited Courses</span>
            ) : selectedLevel === 'PG' ? (
              <span>15 Department Streams • {levelCounts.PG} Master's Courses</span>
            ) : (
              <>
                <span>Showing:</span>
                <strong className="text-navy-900 dark:text-white font-black">{filteredCourses.length}</strong>
                <span>of {levelCounts.all} Unique Courses</span>
              </>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Conditionally Render Dedicated UG / PG Department Streams Explorer or All Degrees Unified Catalogue */}
      {selectedLevel === 'UG' ? (
        <UgDepartmentStreamsExplorer
          onInquire={onInquire}
          onSelectModalCourse={handleOpenCourseModal}
          onBackToAllLevels={() => setSelectedLevel('all')}
        />
      ) : selectedLevel === 'PG' ? (
        <PgDepartmentStreamsExplorer
          onInquire={onInquire}
          onSelectModalCourse={handleOpenCourseModal}
          onBackToAllLevels={() => setSelectedLevel('all')}
        />
      ) : (
        <div className="space-y-6">
          {/* Centered Global Search & Filter Bar Station */}
          <ScrollReveal>
            <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-5 sm:p-6 shadow-luxury space-y-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all degrees (MBBS, B.Tech, BCA, MBA), streams, courses, or careers..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Department Stream Filters & Sort Options Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gold-500" />
                    Stream:
                  </span>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="all">All Department Streams ({allUnifiedCourses.length})</option>
                    {availableStreams.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="default">Default (Balanced UG & PG)</option>
                    <option value="name-asc">Course Name (A → Z)</option>
                    <option value="name-desc">Course Name (Z → A)</option>
                    <option value="level-ug">Undergraduate (UG) First</option>
                    <option value="level-pg">Postgraduate (PG) First</option>
                    <option value="duration-asc">Duration (Shortest First)</option>
                    <option value="duration-desc">Duration (Longest First)</option>
                  </select>
                </div>
              </div>

              {(searchQuery || selectedStream !== 'all') && (
                <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Found <strong className="text-gold-600 dark:text-gold-400 font-black">{filteredCourses.length}</strong> matching {filteredCourses.length === 1 ? 'degree course' : 'degree courses'}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Courses Grid or Empty State */}
          {displayedCourses.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map((course) => (
                  <ScrollReveal key={course.id}>
                    <div 
                      onClick={() => handleOpenCourseModal(course)}
                      className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500/80 transition-all duration-300 hover:shadow-luxury flex flex-col justify-between group h-full cursor-pointer"
                    >
                      <div className="space-y-3.5">
                        {/* Card Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getLevelBadgeClass(course.level)}`}>
                              {course.level}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStream(course.department || course.streamName);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-500 border border-transparent transition truncate max-w-[160px]"
                              title={`Filter by ${course.department || course.streamName}`}
                            >
                              {course.department || course.streamName}
                            </button>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                            {(course.typicalDuration || course.duration || '2 Years').toString().split(' ')[0]} Yrs
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
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                            <span className="font-semibold text-gold-600 dark:text-gold-400 truncate max-w-[200px]">{course.department || course.streamName}</span>
                            <span>•</span>
                            <span className="shrink-0">{course.level === 'UG' ? 'Undergraduate Degree' : 'Postgraduate Degree'}</span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                          {course.shortDescription || course.overview}
                        </p>

                        {/* Highlights Bar */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800/80 text-[11px]">
                          <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <GraduationCap className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                            <span className="truncate"><strong>Eligibility:</strong> {course.eligibility}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span className="truncate"><strong>Exams:</strong> {(course.entranceExams || []).slice(0, 2).join(', ') || 'Merit / Direct Admission'}</span>
                          </div>

                          {course.regulatoryBody && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                              <span className="truncate">{course.regulatoryBody.toString().split('—')[0].split('/')[0].trim()} Regulated</span>
                            </div>
                          )}
                        </div>

                        {/* Top Specializations Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(course.specializations || []).slice(0, 3).map((spec, sIdx) => (
                            <span key={sIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-navy-800 truncate max-w-[130px]">
                              {spec}
                            </span>
                          ))}
                          {(course.specializations || []).length > 3 && (
                            <span className="text-[10px] font-bold text-slate-400 self-center">
                              +{(course.specializations || []).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCourseModal(course);
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1.5 group/btn"
                        >
                          <span>View Roadmap</span>
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-navy-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Showing <strong className="text-navy-900 dark:text-white font-black">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}</strong> of <strong className="text-navy-900 dark:text-white font-black">{filteredCourses.length}</strong> degree courses across both UG & PG
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-bold text-navy-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-gold-500 transition flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    {/* Windowed Page Numbers */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-1 text-slate-400 text-xs">…</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                                currentPage === page
                                  ? 'bg-gold-shimmer text-navy-950 font-black shadow-gold-glow'
                                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:border-gold-500'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-bold text-navy-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-gold-500 transition flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <ScrollReveal>
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-luxury">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  No Courses Match Your Criteria
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  We couldn't find any courses matching your current filters. Try searching by common degree names (B.Tech, MBBS, BCA, MBA), selecting "All Department Streams", or resetting your search.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStream('all');
                      setSortBy('default');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters & Show All {levelCounts.all} Degrees</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      )}

      {/* Detail Modal Component */}
      <CourseDetailModal
        course={activeModalCourse}
        isOpen={Boolean(activeModalCourse)}
        onClose={() => setActiveModalCourse(null)}
        onSelectCourse={handleOpenCourseModal}
        onInquire={(course) => {
          if (onInquire) onInquire(course);
        }}
      />
    </div>
  );
};

export default CourseGuidanceCatalogue;

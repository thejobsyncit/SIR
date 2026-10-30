import React, { useState, useMemo } from 'react';
import { 
  Search, X, RotateCcw, Sparkles, GraduationCap, ArrowRight, ShieldCheck, Award
} from 'lucide-react';
import { COURSES_CATALOGUE } from '../data/coursesCatalogueData';
import { CourseDetailModal } from './CourseDetailModal';
import { UgDepartmentStreamsExplorer } from './UgDepartmentStreamsExplorer';
import { UG_COURSES_CATALOGUE } from '../data/ugDepartmentStreamsData';
import { PgDepartmentStreamsExplorer } from './PgDepartmentStreamsExplorer';
import { PG_COURSES_CATALOGUE } from '../data/pgDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

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

const matchCourse = (course, rawQuery) => {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;
  const qClean = q.replace(/[\.\s\-\/()]/g, '');

  const name = (course.name || '').toLowerCase();
  const abbr = (course.abbreviation || '').toLowerCase();
  const abbrClean = abbr.replace(/[\.\s\-\/()]/g, '');
  const dept = (course.department || '').toLowerCase();
  const desc = (course.shortDescription || '').toLowerCase();
  
  const specs = (course.specializations || []).map(s => s.toLowerCase());
  const careers = (course.careerOpportunities || []).map(c => c.toLowerCase());
  const sectors = (course.employmentSectors || []).map(s => s.toLowerCase());
  const exams = (course.entranceExams || []).map(e => e.toLowerCase());
  const skills = (course.coreSkills || []).map(s => s.toLowerCase());

  // For very short queries (<= 2 chars), handle with word boundary & degree prefix matching
  if (qClean.length <= 2) {
    const isBe = qClean === 'be';
    const isMe = qClean === 'me';
    const isAi = qClean === 'ai';
    const isIt = qClean === 'it';
    const isCs = qClean === 'cs';

    if (isBe && (dept.includes('engineering') && course.level === 'UG' || abbrClean.startsWith('btech') || abbrClean.startsWith('be'))) return true;
    if (isMe && (dept.includes('engineering') && course.level === 'PG' || abbrClean.startsWith('mtech') || abbrClean.startsWith('me'))) return true;
    if (isAi && (abbr.toLowerCase().includes('ai') || specs.some(s => s.includes('artificial intelligence') || s.includes('ai')) || careers.some(c => c.includes('ai')))) return true;
    if (isIt && (dept.includes('information technology') || abbrClean.includes('it'))) return true;
    if (isCs && (dept.includes('computer science') || abbrClean.includes('cse') || abbrClean.includes('cs'))) return true;

    const wordRegex = new RegExp('\\b' + qClean + '\\b', 'i');
    if (wordRegex.test(abbr) || wordRegex.test(name)) return true;
    return false;
  }

  // 1. Direct text matches
  if (name.includes(q) || abbr.includes(q) || dept.includes(q) || desc.includes(q)) return true;
  if (abbrClean.includes(qClean)) return true;

  if (specs.some(s => s.includes(q) || s.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;
  if (careers.some(c => c.includes(q) || c.replace(/[\.\s\-\/()]/g, '').includes(qClean))) return true;
  if (sectors.some(s => s.includes(q))) return true;
  if (exams.some(e => e.includes(q))) return true;
  if (skills.some(s => s.includes(q))) return true;

  // 2. Degree abbreviation cleaner matches
  const degreePatt = {
    btech: ['btech'],
    be: ['btech', 'be'],
    mtech: ['mtech'],
    me: ['mtech', 'me'],
    bsc: ['bsc'],
    msc: ['msc'],
    bcom: ['bcom'],
    mcom: ['mcom'],
    ba: ['ba'],
    ma: ['ma'],
    llb: ['llb'],
    llm: ['llm'],
    bca: ['bca'],
    mca: ['mca'],
    mba: ['mba'],
    mbbs: ['mbbs'],
    bds: ['bds'],
    bpharm: ['bpharm'],
    bpt: ['bpt'],
    bdes: ['bdes'],
    barch: ['barch'],
    bplan: ['bplan'],
    bfa: ['bfa'],
    bed: ['bed'],
    med: ['med'],
    bsw: ['bsw'],
    msw: ['msw']
  };

  if (degreePatt[qClean]) {
    const targets = degreePatt[qClean];
    if (targets.some(t => abbrClean.startsWith(t) || abbrClean.includes(t))) {
      return true;
    }
  }

  // 3. Synonym aliases
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
  const [activeModalCourse, setActiveModalCourse] = useState(null);

  // Level counts
  const levelCounts = useMemo(() => {
    return {
      all: COURSES_CATALOGUE.filter(c => c.level !== 'Integrated' && c.level !== 'Professional').length,
      UG: UG_COURSES_CATALOGUE.length,
      PG: PG_COURSES_CATALOGUE.length
    };
  }, []);

  // Filtered Courses (All Active Courses for View All Degrees, filtered by global search)
  const filteredCourses = useMemo(() => {
    const valid = COURSES_CATALOGUE.filter((course) => {
      // Exclude non-degree level courses from Career Guidance catalogue
      if (course.level === 'Integrated' || course.level === 'Professional') return false;
      return true;
    });

    if (!searchQuery.trim()) return valid;

    return valid.filter(course => matchCourse(course, searchQuery));
  }, [searchQuery]);

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
              <span>13 Department Streams • 129 Accredited Courses</span>
            ) : selectedLevel === 'PG' ? (
              <span>15 Department Streams • 195 Master's Courses</span>
            ) : (
              <>
                <span>Showing:</span>
                <strong className="text-navy-900 dark:text-white font-black">{filteredCourses.length}</strong>
                <span>of {levelCounts.all} Courses</span>
              </>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Conditionally Render Dedicated UG / PG Department Streams Explorer or Standard Catalogue */}
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
        <div className="space-y-6">
          {/* Centered Global Search Bar Station */}
          <ScrollReveal>
            <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-5 sm:p-6 shadow-luxury">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all 13 streams, degrees (MBBS, B.Tech, BCA), courses, or careers..."
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

              {searchQuery && (
                <div className="text-center pt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Found <strong className="text-gold-600 dark:text-gold-400 font-black">{filteredCourses.length}</strong> matching {filteredCourses.length === 1 ? 'degree course' : 'degree courses'}
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
                    onClick={() => setActiveModalCourse(course)}
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
                              setSelectedLevel(course.level);
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-500 border border-transparent transition truncate max-w-[160px]"
                            title={`Explore all ${course.department} courses in ${course.level}`}
                          >
                            {course.department}
                          </button>
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
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                          <span className="font-semibold text-gold-600 dark:text-gold-400">{course.department}</span>
                          <span>•</span>
                          <span>{course.level === 'UG' ? 'Undergraduate Degree' : 'Postgraduate Degree'}</span>
                        </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalCourse(course);
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
          ) : (
            /* Empty State */
            <ScrollReveal>
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-luxury">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  No Courses Match Your Search
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  We couldn't find any courses matching "<span className="text-gold-600 dark:text-gold-400 font-bold">{searchQuery}</span>". Try searching by common degree names (B.Tech, MBBS, BCA, MBA), department streams, or career titles.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Search & Show All Degrees</span>
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

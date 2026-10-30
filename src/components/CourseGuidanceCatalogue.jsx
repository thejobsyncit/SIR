import React, { useState, useMemo } from 'react';
import { 
  Sparkles, GraduationCap, ArrowRight, ShieldCheck, Award
} from 'lucide-react';
import { COURSES_CATALOGUE } from '../data/coursesCatalogueData';
import { CourseDetailModal } from './CourseDetailModal';
import { UgDepartmentStreamsExplorer } from './UgDepartmentStreamsExplorer';
import { UG_COURSES_CATALOGUE } from '../data/ugDepartmentStreamsData';
import { PgDepartmentStreamsExplorer } from './PgDepartmentStreamsExplorer';
import { PG_COURSES_CATALOGUE } from '../data/pgDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

export const CourseGuidanceCatalogue = ({ onInquire }) => {
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'UG', 'PG'
  const [activeModalCourse, setActiveModalCourse] = useState(null);

  // Level counts
  const levelCounts = useMemo(() => {
    return {
      all: COURSES_CATALOGUE.filter(c => c.level !== 'Integrated' && c.level !== 'Professional').length,
      UG: UG_COURSES_CATALOGUE.length,
      PG: PG_COURSES_CATALOGUE.length
    };
  }, []);

  // Filtered Courses (All Active Courses for View All Degrees)
  const filteredCourses = useMemo(() => {
    return COURSES_CATALOGUE.filter((course) => {
      // Exclude non-degree level courses from Career Guidance catalogue
      if (course.level === 'Integrated' || course.level === 'Professional') return false;
      return true;
    });
  }, []);

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

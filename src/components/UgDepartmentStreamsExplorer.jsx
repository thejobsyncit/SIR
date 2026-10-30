import React, { useState, useMemo } from 'react';
import { 
  Search, X, ArrowRight, ArrowLeft, GraduationCap, Award, BookOpen, 
  ShieldCheck, Calendar, Sparkles, RotateCcw, ChevronRight, CheckCircle2,
  Terminal, Cpu, Wrench, Building2, Atom, Briefcase, Scale, Palette,
  Sprout, HeartPulse, Plane, Users, Dna, Layers, HelpCircle, FileText
} from 'lucide-react';
import { 
  UG_DEPARTMENT_STREAMS, 
  UG_COURSES_CATALOGUE, 
  getStreamById, 
  getCoursesByStream 
} from '../data/ugDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

// Icon mapping for department streams
const streamIcons = {
  'Terminal': Terminal,
  'Cpu': Cpu,
  'Wrench': Wrench,
  'Building2': Building2,
  'Sprout': Sprout,
  'Briefcase': Briefcase,
  'Atom': Atom,
  'Palette': Palette,
  'BookOpen': BookOpen,
  'HeartPulse': HeartPulse,
  'Scale': Scale,
  'Plane': Plane,
  'Users': Users,
  'Dna': Dna
};

export const UgDepartmentStreamsExplorer = ({ onInquire, onSelectModalCourse, onBackToAllLevels }) => {
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Active stream object
  const activeStream = useMemo(() => {
    return selectedStreamId ? getStreamById(selectedStreamId) : null;
  }, [selectedStreamId]);

  // Total course count across all UG streams
  const totalUgCourses = UG_COURSES_CATALOGUE.length;

  // Courses filtered by active stream and search query
  const displayedCourses = useMemo(() => {
    let list = [];

    if (activeStream) {
      list = getCoursesByStream(activeStream.id);
    } else {
      // If no stream is selected, but user typed a search query, search across all UG courses
      list = UG_COURSES_CATALOGUE;
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const abbrMatch = c.abbreviation.toLowerCase().includes(q);
        const streamMatch = (c.streamName || '').toLowerCase().includes(q);
        const overviewMatch = (c.overview || '').toLowerCase().includes(q);
        const specMatch = (c.specializations || []).some(s => s.toLowerCase().includes(q));
        const examMatch = (c.entranceExams || []).some(e => e.toLowerCase().includes(q));
        const degreeMatch = (c.degrees || []).some(d => d.toLowerCase().includes(q));
        const careerMatch = (c.careerPaths || []).some(cp => cp.toLowerCase().includes(q));

        return nameMatch || abbrMatch || streamMatch || overviewMatch || specMatch || examMatch || degreeMatch || careerMatch;
      });
    }

    return list;
  }, [activeStream, searchQuery]);

  // Matching streams when searching at top-level
  const matchingStreams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return UG_DEPARTMENT_STREAMS;

    return UG_DEPARTMENT_STREAMS.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const shortMatch = s.shortName.toLowerCase().includes(q);
      const descMatch = s.description.toLowerCase().includes(q);
      const degreeMatch = s.degrees.some(d => d.abbr.toLowerCase().includes(q) || d.fullName.toLowerCase().includes(q));
      
      // Also match if any course in this stream matches
      const streamCourses = getCoursesByStream(s.id);
      const courseMatch = streamCourses.some(c => 
        c.name.toLowerCase().includes(q) || 
        c.abbreviation.toLowerCase().includes(q) ||
        (c.specializations || []).some(sp => sp.toLowerCase().includes(q))
      );

      return nameMatch || shortMatch || descMatch || degreeMatch || courseMatch;
    });
  }, [searchQuery]);

  // Handle stream selection
  const handleSelectStream = (streamId) => {
    setSelectedStreamId(streamId);
    setSearchQuery('');
    // Smooth scroll to top of explorer
    const el = document.getElementById('ug-streams-explorer-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset to all streams
  const handleResetToStreams = () => {
    setSelectedStreamId(null);
    setSearchQuery('');
  };

  // Reset all filters in current stream
  const handleResetFilters = () => {
    setSearchQuery('');
  };

  return (
    <div id="ug-streams-explorer-section" className="space-y-8 scroll-mt-24">
      {/* Interactive Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-navy-950/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800">
        <button 
          onClick={() => {
            handleResetToStreams();
            if (onBackToAllLevels) onBackToAllLevels();
          }}
          className="hover:text-gold-600 dark:hover:text-gold-400 transition"
        >
          Career Guidance
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        
        <button 
          onClick={handleResetToStreams}
          className={`hover:text-gold-600 dark:hover:text-gold-400 transition ${!activeStream ? 'text-navy-950 dark:text-white font-black' : ''}`}
        >
          Undergraduate (UG)
        </button>

        {activeStream && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-gold-600 dark:text-gold-400 font-black">
              {activeStream.shortName}
            </span>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: EXPLORE DEPARTMENT STREAMS (When no stream is currently selected)  */}
      {/* ========================================================================= */}
      {!activeStream && (
        <div className="space-y-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-gold-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>13 Department Streams • {totalUgCourses} Degree Courses</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white leading-tight">
                Explore Department Streams
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Choose an undergraduate academic department stream below to discover degrees (B.Tech, B.E., B.Sc., BCA, MBBS, Law, etc.), specialized curriculums, eligibility criteria, and admissions pathways.
              </p>
            </div>
          </ScrollReveal>

          {/* Search Bar Across All Streams */}
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
                  Found <strong className="text-gold-600 dark:text-gold-400 font-black">{displayedCourses.length}</strong> matching courses across <strong className="text-navy-900 dark:text-white font-black">{matchingStreams.length}</strong> department streams
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* 13 Department Stream Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingStreams.map((stream, idx) => {
              const IconComp = streamIcons[stream.icon] || BookOpen;
              const courseCount = getCoursesByStream(stream.id).length;

              return (
                <ScrollReveal key={stream.id}>
                  <div
                    onClick={() => handleSelectStream(stream.id)}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-7 space-y-5 hover:border-gold-500 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full relative overflow-hidden"
                  >
                    {/* Top Accent Strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stream.accentColor} opacity-80 group-hover:opacity-100 transition`} />

                    <div className="space-y-4">
                      {/* Icon & Count Badges */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stream.accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${stream.badgeColor}`}>
                            {courseCount} Courses
                          </span>
                        </div>
                      </div>

                      {/* Stream Name */}
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-gold-600 dark:text-gold-400 uppercase">
                          Department Stream {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-1 mt-0.5">
                          {stream.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 font-medium leading-relaxed">
                        {stream.description}
                      </p>

                      {/* Degrees Preview Pills */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                          Degrees Offered:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {stream.degrees.map((deg) => (
                            <span 
                              key={deg.id}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800"
                              title={deg.fullName}
                            >
                              {deg.abbr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                      <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs group-hover:bg-gold-shimmer group-hover:text-navy-950 transition flex items-center justify-between">
                        <span>Explore Degrees & Courses</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* When search yields direct course matches across streams */}
          {searchQuery && displayedCourses.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                    Direct Course Results for "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing all matching courses across our 13 undergraduate department streams.
                  </p>
                </div>
                <span className="text-xs font-black text-gold-600 dark:text-gold-400">
                  {displayedCourses.length} Courses Found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map((course) => (
                  <ScrollReveal key={course.id}>
                    <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500 transition-all duration-300 flex flex-col justify-between group h-full">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                              UG
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                              {course.streamName}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {course.duration.split(' ')[0]} Yrs
                          </span>
                        </div>

                        <div>
                          <div className="text-xl font-black text-gold-600 dark:text-gold-400 tracking-tight">
                            {course.abbreviation}
                          </div>
                          <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white line-clamp-2 mt-0.5">
                            {course.name}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                          {course.overview}
                        </p>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800/80 pt-2 space-y-1">
                          <div className="truncate"><strong>Eligibility:</strong> {course.eligibility}</div>
                          <div className="truncate"><strong>Exams:</strong> {course.entranceExams.slice(0, 3).join(', ')}</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                        <button
                          onClick={() => onSelectModalCourse && onSelectModalCourse(course)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1"
                        >
                          <span>View Roadmap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onInquire && onInquire(course)}
                          className="py-2.5 px-3 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition text-center shrink-0"
                        >
                          Inquire
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 & 3: STREAM DETAIL, DEGREES AVAILABLE, AND COURSES SELECTION       */}
      {/* ========================================================================= */}
      {activeStream && (
        <div className="space-y-8">
          {/* Back to Streams Button & Stream Banner */}
          <div className="glass-card bg-white dark:bg-navy-900/95 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800">
              <button
                onClick={handleResetToStreams}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Department Streams</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Undergraduate Department Stream</span>
              </div>
            </div>

            {/* Stream Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${activeStream.accentColor} text-white flex items-center justify-center shadow-lg shrink-0`}>
                  {React.createElement(streamIcons[activeStream.icon] || BookOpen, { className: 'w-7 h-7 sm:w-8 sm:h-8' })}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      Undergraduate Faculty Track
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/20">
                      {getCoursesByStream(activeStream.id).length} Courses Available
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white leading-tight">
                    {activeStream.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl pt-1">
                    {activeStream.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input Within Active Stream */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-800">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeStream.shortName} courses (e.g. AI, VLSI, Robotics, duration, exams)...`}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COURSES BELONGING TO SELECTED STREAM                                      */}
          {/* ========================================================================= */}
          <div id="ug-courses-view" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                  <span>Courses in</span>
                  <span className="text-gold-600 dark:text-gold-400">
                    {activeStream.shortName}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {displayedCourses.length} accredited undergraduate courses matching your criteria.
                </p>
              </div>
            </div>

            {/* Courses Grid or Empty State */}
            {displayedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map((course) => (
                  <ScrollReveal key={course.id}>
                    <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500 transition-all duration-300 hover:shadow-luxury flex flex-col justify-between group h-full">
                      <div className="space-y-3.5">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                              UG
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                              {(course.degrees || []).join(' / ')}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/20">
                              {course.regulatoryBody}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                            {course.duration.split(' ')[0]} Yrs
                          </span>
                        </div>

                        {/* Title & Abbreviation */}
                        <div>
                          <div className="text-xl font-black text-gold-600 dark:text-gold-400 font-sans tracking-tight group-hover:text-gold-500 transition">
                            {course.abbreviation}
                          </div>
                          <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                            {course.name}
                          </h4>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                          {course.overview}
                        </p>

                        {/* Eligibility & Exams Highlights */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800/80 text-[11px]">
                          <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <GraduationCap className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                            <span className="truncate"><strong>Eligibility:</strong> {course.eligibility}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span className="truncate"><strong>Exams:</strong> {course.entranceExams.slice(0, 3).join(', ')}</span>
                          </div>
                        </div>

                        {/* Specializations Pills */}
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
                          onClick={() => onSelectModalCourse && onSelectModalCourse(course)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 dark:hover:bg-gold-500 dark:hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1.5 group/btn"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => onInquire && onInquire(course)}
                          className="py-2.5 px-3.5 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition text-center shrink-0"
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
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-luxury">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                  No Courses Found in this Selection
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We couldn't find any courses matching your current search or degree filter in <strong className="text-navy-900 dark:text-white">{activeStream.name}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Search & Show All {activeStream.shortName} Courses</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

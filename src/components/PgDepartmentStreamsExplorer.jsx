import React, { useState, useMemo } from 'react';
import { 
  Search, X, ArrowRight, ArrowLeft, GraduationCap, Award, BookOpen, 
  ShieldCheck, Calendar, Sparkles, RotateCcw, ChevronRight, CheckCircle2,
  Terminal, Cpu, Wrench, Building2, Atom, Briefcase, Scale, Palette,
  Sprout, HeartPulse, Plane, Users, Dna, Layers, HelpCircle, FileText,
  Film, AlertTriangle
} from 'lucide-react';
import { 
  PG_DEPARTMENT_STREAMS, 
  PG_COURSES_CATALOGUE, 
  getPgStreamById, 
  getPgCoursesByStream, 
  getPgCoursesByDegree 
} from '../data/pgDepartmentStreamsData';
import ScrollReveal from './ScrollReveal';

// Icon mapping for postgraduate department streams
const streamIcons = {
  'Terminal': Terminal,
  'Cpu': Cpu,
  'Wrench': Wrench,
  'Building2': Building2,
  'Dna': Dna,
  'Briefcase': Briefcase,
  'Atom': Atom,
  'Palette': Palette,
  'BookOpen': BookOpen,
  'Sprout': Sprout,
  'HeartPulse': HeartPulse,
  'Scale': Scale,
  'GraduationCap': GraduationCap,
  'Plane': Plane,
  'Film': Film,
  'Users': Users
};

export const PgDepartmentStreamsExplorer = ({ onInquire, onSelectModalCourse, onBackToAllLevels }) => {
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [selectedDegreeAbbr, setSelectedDegreeAbbr] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active stream object
  const activeStream = useMemo(() => {
    return selectedStreamId ? getPgStreamById(selectedStreamId) : null;
  }, [selectedStreamId]);

  // Total course count across all PG streams
  const totalPgCourses = PG_COURSES_CATALOGUE.length;

  // Courses filtered by active stream, degree, and search query
  const displayedCourses = useMemo(() => {
    let list = [];

    if (activeStream) {
      if (!selectedDegreeAbbr || selectedDegreeAbbr === 'all') {
        list = getPgCoursesByStream(activeStream.id);
      } else {
        list = getPgCoursesByDegree(activeStream.id, selectedDegreeAbbr);
      }
    } else {
      // If no stream is selected, but user typed a search query, search across all PG courses
      list = PG_COURSES_CATALOGUE;
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
  }, [activeStream, selectedDegreeAbbr, searchQuery]);

  // Matching streams when searching at top-level
  const matchingStreams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return PG_DEPARTMENT_STREAMS;

    return PG_DEPARTMENT_STREAMS.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const shortMatch = s.shortName.toLowerCase().includes(q);
      const descMatch = s.description.toLowerCase().includes(q);
      const degreeMatch = s.degrees.some(d => d.abbr.toLowerCase().includes(q) || d.fullName.toLowerCase().includes(q));
      
      // Also match if any course in this stream matches
      const streamCourses = getPgCoursesByStream(s.id);
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
    setSelectedDegreeAbbr('all');
    setSearchQuery('');
    // Smooth scroll to top of explorer
    const el = document.getElementById('pg-streams-explorer-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle degree selection
  const handleSelectDegree = (degreeAbbr) => {
    setSelectedDegreeAbbr(degreeAbbr);
    const el = document.getElementById('pg-courses-view');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Reset to all streams
  const handleResetToStreams = () => {
    setSelectedStreamId(null);
    setSelectedDegreeAbbr('all');
    setSearchQuery('');
  };

  // Reset all filters in current stream
  const handleResetFilters = () => {
    setSelectedDegreeAbbr('all');
    setSearchQuery('');
  };

  return (
    <div id="pg-streams-explorer-section" className="space-y-8 scroll-mt-24">
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
          Postgraduate (PG)
        </button>

        {activeStream && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              onClick={() => setSelectedDegreeAbbr('all')}
              className={`hover:text-gold-600 dark:hover:text-gold-400 transition ${selectedDegreeAbbr === 'all' ? 'text-navy-950 dark:text-white font-black' : ''}`}
            >
              {activeStream.shortName}
            </button>
          </>
        )}

        {activeStream && selectedDegreeAbbr && selectedDegreeAbbr !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-gold-600 dark:text-gold-400 font-black">
              {selectedDegreeAbbr} Degree
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
              <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>15 PG Department Streams • {totalPgCourses} Master's & Professional Degrees</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white leading-tight">
                Explore Department Streams
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Choose a postgraduate academic department stream below to discover master’s degrees (M.E., M.Tech, M.Sc., MBA, M.Com., M.A., MD/MS, LL.M., M.Ed., etc.), research disciplines, advanced specializations, eligibility criteria, and admissions pathways.
              </p>
            </div>
          </ScrollReveal>

          {/* Search Bar Across All PG Streams */}
          <ScrollReveal>
            <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-5 sm:p-6 shadow-luxury">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all 15 PG streams, degrees (MBA, M.Tech, M.Sc., LL.M.), courses, or careers..."
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
                  Found <strong className="text-gold-600 dark:text-gold-400 font-black">{displayedCourses.length}</strong> matching postgraduate courses across <strong className="text-navy-900 dark:text-white font-black">{matchingStreams.length}</strong> department streams
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* 15 Department Stream Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingStreams.map((stream, idx) => {
              const IconComp = streamIcons[stream.icon] || BookOpen;
              const courseCount = getPgCoursesByStream(stream.id).length;

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
                          PG Stream {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
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
                          Applicable Degrees:
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
                    Direct Postgraduate Course Results for "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing all matching master's courses across our 15 postgraduate department streams.
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
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 uppercase">
                              PG
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
                          <span>View Details</span>
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

              <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Postgraduate Department Stream</span>
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
                      Postgraduate Master's Faculty Track
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      {getPgCoursesByStream(activeStream.id).length} Courses Available
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

            {/* Regulatory / Eligibility Notice (for Medical, Law, Education) */}
            {activeStream.notice && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400 block">
                    Mandatory Statutory Eligibility Notice
                  </span>
                  <p className="leading-relaxed">
                    {activeStream.notice}
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: SELECT DEGREE TRACK (Degrees Available for this Stream)           */}
            {/* ========================================================================= */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-800 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-gold-500" />
                      <span>Applicable Postgraduate Degrees in {activeStream.shortName}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select a postgraduate qualification to explore courses mapped exclusively to that degree.
                    </p>
                  </div>

                  {selectedDegreeAbbr !== 'all' && (
                    <button
                      onClick={() => setSelectedDegreeAbbr('all')}
                      className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Show All Degrees</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Degree Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* "All Degrees" Card */}
                <button
                  onClick={() => handleSelectDegree('all')}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 focus:outline-none flex flex-col justify-between ${
                    selectedDegreeAbbr === 'all'
                      ? 'bg-gold-500/10 border-gold-500 shadow-gold-glow dark:bg-gold-500/15'
                      : 'bg-slate-50 dark:bg-navy-950/70 border-slate-200 dark:border-navy-800 hover:border-gold-500/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gold-600 dark:text-gold-400">
                        All Degrees
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        {getPgCoursesByStream(activeStream.id).length} Courses
                      </span>
                    </div>
                    <div className="text-xs font-bold text-navy-900 dark:text-white">
                      Complete Department Scope
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      View all specialized programs across all postgraduate qualifications in this department.
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1">
                    <span>{selectedDegreeAbbr === 'all' ? 'Active Selection ✓' : 'Select All Tracks →'}</span>
                  </div>
                </button>

                {/* Specific Degree Cards */}
                {activeStream.degrees.map((degree) => {
                  const isSelected = selectedDegreeAbbr.toLowerCase() === degree.abbr.toLowerCase();
                  const count = getPgCoursesByDegree(activeStream.id, degree.abbr).length;

                  return (
                    <button
                      key={degree.id}
                      onClick={() => handleSelectDegree(degree.abbr)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 focus:outline-none flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gold-500/10 border-gold-500 shadow-gold-glow dark:bg-gold-500/15'
                          : 'bg-slate-50 dark:bg-navy-950/70 border-slate-200 dark:border-navy-800 hover:border-gold-500/60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-gold-600 dark:text-gold-400">
                            {degree.abbr}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                            {count} Courses
                          </span>
                        </div>
                        <div className="text-xs font-bold text-navy-900 dark:text-white line-clamp-1">
                          {degree.fullName}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {degree.duration}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {degree.description}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1">
                        <span>{isSelected ? 'Active Selection ✓' : 'View Courses →'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input Within Active Stream */}
            <div className="pt-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeStream.shortName} courses (e.g. AI, Cyber, Finance, Robotics, entrance exams)...`}
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
          {/* STEP 3: COURSES BELONGING TO SELECTED DEGREE / STREAM                      */}
          {/* ========================================================================= */}
          <div id="pg-courses-view" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                  <span>Courses in</span>
                  <span className="text-gold-600 dark:text-gold-400">
                    {selectedDegreeAbbr === 'all' ? activeStream.shortName : `${selectedDegreeAbbr} — ${activeStream.shortName}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {displayedCourses.length} accredited postgraduate courses matching your criteria.
                </p>
              </div>

              {/* Quick Degree Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedDegreeAbbr('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                    selectedDegreeAbbr === 'all'
                      ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent'
                  }`}
                >
                  All Degrees ({getPgCoursesByStream(activeStream.id).length})
                </button>
                {activeStream.degrees.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDegreeAbbr(d.abbr)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                      selectedDegreeAbbr.toLowerCase() === d.abbr.toLowerCase()
                        ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-transparent'
                    }`}
                  >
                    {d.abbr} ({getPgCoursesByDegree(activeStream.id, d.abbr).length})
                  </button>
                ))}
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
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                              PG
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                              {(course.degrees || []).join(' / ')}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/20">
                              {course.regulatoryBody.split('/')[0].trim()}
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

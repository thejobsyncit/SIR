import React, { useEffect, useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, GraduationCap, Award, BookOpen, 
  ArrowRight, Building2, Briefcase, FileText, ChevronRight, 
  Calendar, Layers, Sparkles, Scale, HeartPulse, ExternalLink, HelpCircle
} from 'lucide-react';
import { getRelatedCourses } from '../data/coursesCatalogueData';
import { getCoursesByStream } from '../data/ugDepartmentStreamsData';
import { getPgCoursesByStream } from '../data/pgDepartmentStreamsData';

export const CourseDetailModal = ({ course, isOpen, onClose, onSelectCourse, onInquire }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset tab when course changes
  useEffect(() => {
    setActiveTab('overview');
  }, [course?.id]);

  const relatedCourses = React.useMemo(() => {
    if (!course) return [];
    if (course.streamId) {
      const streamCourses = course.level === 'PG' ? getPgCoursesByStream(course.streamId) : getCoursesByStream(course.streamId);
      return (streamCourses || [])
        .filter(c => c && c.id !== course.id)
        .slice(0, 4)
        .map(c => ({
          ...c,
          typicalDuration: c.duration,
          department: c.streamName
        }));
    }
    const related = getRelatedCourses(course.id) || [];
    return (related || [])
      .filter(c => c && c.level !== 'Integrated' && c.level !== 'Professional')
      .slice(0, 4);
  }, [course]);

  if (!isOpen || !course) return null;

  const getLevelBadgeColor = (level) => {
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-navy-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b border-slate-200 dark:border-navy-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getLevelBadgeColor(course.level)}`}>
                {course.level === 'UG' ? 'Undergraduate' : course.level === 'PG' ? 'Postgraduate' : course.level} Degree
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                {course.department || course.streamName}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/20 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {course.typicalDuration || course.duration}
              </span>
              {course.licensingRequired && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Regulated Professional License
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gold-600 dark:text-gold-400 font-sans tracking-tight">
                {course.abbreviation}
              </span>
              <h2 id="course-modal-title" className="text-xl sm:text-2xl font-serif font-extrabold text-navy-900 dark:text-white leading-tight">
                {course.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
              {course.shortDescription || course.overview}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{course.verificationStatus || 'Statutory Verified'} • {course.regulatoryBody}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Curriculum', icon: BookOpen },
            { id: 'admissions', label: 'Eligibility & Entrances', icon: GraduationCap },
            { id: 'careers', label: 'Careers & Sectors', icon: Briefcase },
            { id: 'pathways', label: 'Higher Studies & Related', icon: Layers },
            { id: 'regulatory', label: 'Regulatory & Licensing', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition focus:outline-none ${
                  isActive 
                    ? 'border-gold-500 text-gold-600 dark:text-gold-400 font-extrabold' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: OVERVIEW & CURRICULUM */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Key Specializations & Concentrations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(course.specializations || []).map((spec, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Core Curriculum & Main Subjects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(course.mainSubjects || [
                    'Theoretical Foundations & Computational Principles',
                    'Advanced Laboratory & Practical Practicums',
                    'Departmental Core Coursework',
                    'Interdisciplinary Electives & Specializations',
                    'Capstone Project, Internship & Viva Voce'
                  ]).map((sub, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-navy-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Practical & Applied Industry Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(course.coreSkills || [
                    'Analytical Problem Solving',
                    'Applied Domain Specialization',
                    'Technical Research & Methodologies',
                    'Industry Tools Proficiency',
                    'Collaborative Project Engineering'
                  ]).map((skill, idx) => (
                    <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY & ADMISSIONS */}
          {activeTab === 'admissions' && (
            <div className="space-y-6">
              <div className="glass-card bg-slate-50 dark:bg-navy-950/70 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Eligibility Criteria & Mandatory Prerequisites
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {course.eligibility}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Required Subject Combinations:</span>
                  {(course.requiredSubjects || [
                    course.eligibility?.includes('PCB') ? 'Physics, Chemistry, Biology' :
                    course.eligibility?.includes('Physics') ? 'Physics & Mathematics' :
                    course.eligibility?.includes('Commerce') ? 'Commerce / Accountancy' :
                    'Qualifying 10+2 Subjects'
                  ]).map((subj, idx) => (
                    <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white">
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recognized Entrance Examinations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(course.entranceExams || []).map((exam, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800">
                      <div className="w-7 h-7 rounded-lg bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                        0{idx + 1}
                      </div>
                      <span className="text-xs font-bold text-navy-900 dark:text-white">{exam}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Typical Admission & Selection Workflow
                </h4>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-navy-950/40 p-4 rounded-xl border border-slate-200 dark:border-navy-800">
                  {course.admissionProcess || 'National or State Entrance Examination score followed by centralized counseling, document verification, and merit seat allocation.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <p>
                  <strong>Institutional Verification Advisory:</strong> Seat reservations, state domiciliary quotas, reservation relaxations (OBC/SC/ST/EWS/PwD), and specific percentage cutoffs vary between central, state, and private universities. Verify with the respective university or state admission authority prior to submission.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CAREERS & SECTORS */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  High-Demand Career Roles & Job Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(course.careerOpportunities || course.careerPaths || []).map((career, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-950/60 p-3 rounded-xl border border-slate-200 dark:border-navy-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Key Employment Sectors & Hiring Domains
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(course.employmentSectors || ['Corporate & Technology Enterprises', 'R&D Laboratories', 'Global Advisory Firms']).map((sector, idx) => (
                    <span key={idx} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HIGHER STUDIES & RELATED PATHWAYS */}
          {activeTab === 'pathways' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  UG to PG & Academic Progression Pathways
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(course.higherStudyPathways || [
                    'Master of Technology (M.Tech / M.E.)',
                    'Master of Science (M.Sc.)',
                    'Master of Business Administration (MBA / PGDM)',
                    'Integrated Ph.D. / Research Fellowship'
                  ]).map((progression, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs font-bold text-navy-900 dark:text-white">
                      <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
                      <span>{progression}</span>
                    </div>
                  ))}
                </div>
              </div>

              {relatedCourses.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Related Degrees in this Department
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedCourses.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectCourse(rel)}
                        className="text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 hover:border-gold-500 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gold-600 dark:text-gold-400 group-hover:text-gold-500">
                            {rel.abbreviation}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                            {rel.level}
                          </span>
                        </div>
                        <h5 className="font-serif text-sm font-bold text-navy-900 dark:text-white truncate mt-1">
                          {rel.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {rel.typicalDuration} • {rel.department}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REGULATORY & LICENSING */}
          {activeTab === 'regulatory' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Statutory Regulatory Framework</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                  {course.regulatoryBody}
                </h4>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  Academic curriculum, duration standards, minimum faculty guidelines, and degree specifications are governed by {course.regulatoryBody}.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                  Official Reference: <span className="text-gold-600 dark:text-gold-400">{course.officialReference || 'UGC / Statutory Regulatory Councils Guidelines'}</span>
                </div>
              </div>

              {course.licensingRequired ? (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                    <Scale className="w-4 h-4" />
                    Mandatory Professional Licensure Requirement
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {course.licensingDetails || 'Practicing this profession requires statutory registration and licensing from the respective statutory council.'}
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    General Academic Degree Status
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    This program confers a general academic degree recognized across universities and corporate employers. It does not mandate statutory council registration to enter general corporate or civil employment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Action Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            Need tailored college shortlisting or entrance guidance?
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition w-full sm:w-auto text-center"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onInquire) onInquire(course);
              }}
              className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
            >
              <span>Inquire for {course.abbreviation} Guidance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

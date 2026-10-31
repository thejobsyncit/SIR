import React, { useState, useMemo } from 'react';
import {
  Search, X, ArrowRight, ArrowLeft, GraduationCap, Award, BookOpen,
  ShieldCheck, Calendar, Sparkles, ChevronRight, CheckCircle2,
  Building2, Globe2, HeartPulse, Stethoscope, Wrench, Compass,
  FileText, Layers, Filter, ExternalLink, Briefcase, MapPin, AlertCircle,
  Landmark, Shield, Train, Scale, Mail, Atom
} from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import {
  COMPETITIVE_EXAM_CATEGORIES,
  COMPETITIVE_EXAMS,
  getCategoryById,
  getExamsByCategory,
  getCategoryExamCounts
} from '../../data/competitiveExamsData';
import { ExamDetailModal } from './ExamDetailModal';
import { ExamEnquiryModal } from './ExamEnquiryModal';

// Icon mapping for all 22 categories
const CATEGORY_ICONS = {
  'Globe2': Globe2,
  'HeartPulse': HeartPulse,
  'Compass': Compass,
  'Stethoscope': Stethoscope,
  'GraduationCap': GraduationCap,
  'Building2': Building2,
  'Wrench': Wrench,
  'Landmark': Landmark,
  'Layers': Layers,
  'Train': Train,
  'Shield': Shield,
  'ShieldCheck': ShieldCheck,
  'Scale': Scale,
  'Award': Award,
  'Mail': Mail,
  'Atom': Atom,
  'Briefcase': Briefcase,
  'BookOpen': BookOpen,
  'FileText': FileText
};

const INTERNATIONAL_CATEGORY_IDS = [
  'ielts', 'oet', 'ogt', 'medical-exams', 'europe-western', 'gcc-medical', 'gcc-engineering'
];

export const ExamDirectoryView = ({ initialCategoryId = null, onInquireExam }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryGroup, setCategoryGroup] = useState('all'); // 'all', 'national', 'international'
  const [subFilter, setSubFilter] = useState('All');

  // Modals state
  const [modalExam, setModalExam] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [enquiryExam, setEnquiryExam] = useState(null);
  const [enquiryCourse, setEnquiryCourse] = useState(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  // Dynamic exam counts per category
  const examCounts = useMemo(() => getCategoryExamCounts(), []);

  // Active category object
  const activeCategory = useMemo(() => {
    return selectedCategoryId ? getCategoryById(selectedCategoryId) : null;
  }, [selectedCategoryId]);

  // Exams for active category
  const categoryExams = useMemo(() => {
    if (!activeCategory) return [];
    return getExamsByCategory(activeCategory.id);
  }, [activeCategory]);

  // Sub-filter tabs based on active category
  const subFilterTabs = useMemo(() => {
    if (!activeCategory) return ['All'];

    switch (activeCategory.id) {
      // 1. Civil Services
      case 'civil-services':
        return ['All', 'UPSC', 'TNPSC', 'EPFO', 'CAPF'];
      // 2. SSC
      case 'ssc-exams':
        return ['All', 'CGL (Graduate)', 'CHSL (10+2)', 'MTS (Matric)', 'GD Constable', 'CPO Sub-Inspector', 'Technical (JE/JHT)'];
      // 3. Banking
      case 'banking-exams':
        return ['All', 'IBPS', 'SBI', 'RBI', 'NABARD', 'Regional Rural (RRB)'];
      // 4. Railways
      case 'railway-exams':
        return ['All', 'NTPC', 'Loco Pilot (ALP)', 'Junior Engineer (JE)', 'Group D / Level 1', 'Protection Force (RPF)', 'Paramedical'];
      // 5. Defence
      case 'defence-exams':
        return ['All', 'Officer Entry (NDA/CDS/AFCAT)', 'Agniveer Scheme', 'Coast Guard', 'Paramilitary & Territorial'];
      // 6. Police & Uniformed
      case 'police-uniformed':
        return ['All', 'Tamil Nadu (TNUSRB)', 'Central Police (SSC CPO/GD)', 'Fire & Rescue', 'Prisons & Correctional'];
      // 7. Teaching
      case 'teaching-exams':
        return ['All', 'CTET (National)', 'TNTET (Tamil Nadu)', 'UGC NET / CSIR', 'Central Schools (KVS/NVS)', 'Collegiate TRB'];
      // 8. Engineering Government
      case 'engineering-govt':
        return ['All', 'GATE & PSUs', 'UPSC ESE/IES', 'SSC & RRB JE', 'TNPSC Technical', 'Research (ISRO/DRDO/BARC)'];
      // 9. Medical Government
      case 'medical-govt':
        return ['All', 'Entrance (NEET UG/PG/INI-CET)', 'Nursing Officers (NORCET/ESIC)', 'Medical Officers & Health Dept'];
      // 10. State PSC
      case 'state-psc':
        return ['All', 'TNPSC (Tamil Nadu)', 'Kerala PSC', 'Karnataka KPSC', 'APPSC & TGPSC', 'Maharashtra MPSC'];
      // 11. Judicial & Legal
      case 'judicial-legal':
        return ['All', 'Judicial Services (Civil Judge)', 'High Court Registry', 'Court Staff & Clerks', 'Public Prosecutors'];
      // 12. Insurance
      case 'insurance-exams':
        return ['All', 'LIC', 'General Insurance (NIACL/NICL/UIIC)', 'Reinsurance (GIC Re)'];
      // 13. Postal & Central
      case 'postal-central':
        return ['All', 'India Post', 'Food Corporation (FCI)', 'Social Security (EPFO/ESIC)', 'SSC Selection'];
      // 14. Research & Scientific
      case 'research-scientific':
        return ['All', 'Space (ISRO)', 'Defence (DRDO)', 'Atomic (BARC)', 'CSIR Labs', 'Medical & Agriculture (ICMR/ICAR)'];
      // 15. Management & PSU
      case 'management-psu':
        return ['All', 'Academic MBA Admissions (CAT/MAT)', 'PSU Executive Trainees via GATE', 'CPSE Management Trainees', 'Bank Specialist Officers'];
      // International / GCC categories
      case 'gcc-medical':
        return ['All', 'Dubai (DHA)', 'Abu Dhabi (DOH)', 'UAE Federal (MOHAP)', 'Saudi Arabia (SCFHS)', 'Qatar (DHP)', 'Oman (OMSB)', 'Bahrain (NHRA)', 'Kuwait (MOH)'];
      case 'gcc-engineering':
        return ['All', 'Saudi Arabia (SCE)', 'UAE (SOE)', 'Qatar (UPDA/MMUP)', 'Oman (OSE)', 'Bahrain (CRPEP)', 'Kuwait (KSE)', 'International (NCEES)'];
      case 'europe-western':
        return ['All', 'English Proficiency', 'Graduate Admissions (GRE/GMAT)', 'Undergraduate (SAT)', 'Language & Licensing'];
      case 'medical-exams':
        return ['All', 'India (Entrance)', 'USA (USMLE)', 'UK / Commonwealth', 'International Licensing'];
      case 'oet':
        return ['All', 'Medicine', 'Nursing', 'Dentistry', 'Pharmacy', 'Allied Health'];
      case 'ielts':
        return ['All', 'Academic', 'General Training', 'UKVI'];
      default:
        return ['All'];
    }
  }, [activeCategory]);

  // Filtered exams inside active category
  const displayedCategoryExams = useMemo(() => {
    let list = categoryExams;

    // Apply sub-filter
    if (subFilter !== 'All') {
      const sf = subFilter.toLowerCase();
      list = list.filter((e) => {
        const countryMatch = (e.country || '').toLowerCase().includes(sf.split(' ')[0]);
        const nameMatch = e.name.toLowerCase().includes(sf.split(' ')[0]);
        const codeMatch = e.code.toLowerCase().includes(sf.split(' ')[0]);
        const bodyMatch = (e.conductingBody || '').toLowerCase().includes(sf.split(' ')[0]);
        const typeMatch = (e.examType || '').toLowerCase().includes(sf.split(' ')[0]);
        return countryMatch || nameMatch || codeMatch || bodyMatch || typeMatch;
      });
    }

    // Apply in-category search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((e) => {
        const nameMatch = e.name.toLowerCase().includes(q);
        const codeMatch = e.code.toLowerCase().includes(q);
        const bodyMatch = (e.conductingBody || '').toLowerCase().includes(q);
        const countryMatch = (e.country || '').toLowerCase().includes(q);
        const overviewMatch = (e.overview || '').toLowerCase().includes(q);
        const purposeMatch = (e.purpose || '').toLowerCase().includes(q);
        return nameMatch || codeMatch || bodyMatch || countryMatch || overviewMatch || purposeMatch;
      });
    }

    return list;
  }, [categoryExams, subFilter, searchQuery]);

  // Matching categories when searching at top-level
  const matchingCategories = useMemo(() => {
    let list = COMPETITIVE_EXAM_CATEGORIES;

    // Group filter (All, National Indian, International/GCC)
    if (categoryGroup === 'national') {
      list = list.filter(cat => !INTERNATIONAL_CATEGORY_IDS.includes(cat.id));
    } else if (categoryGroup === 'international') {
      list = list.filter(cat => INTERNATIONAL_CATEGORY_IDS.includes(cat.id));
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(q);
      const shortMatch = cat.shortName.toLowerCase().includes(q);
      const descMatch = cat.description.toLowerCase().includes(q);
      const optionsMatch = (cat.popularOptions || cat.examOptions || []).some(opt => opt.toLowerCase().includes(q));

      // Also match if any exam in this category matches
      const exams = getExamsByCategory(cat.id);
      const examMatch = exams.some(e =>
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.country || '').toLowerCase().includes(q) ||
        (e.conductingBody || '').toLowerCase().includes(q)
      );

      return nameMatch || shortMatch || descMatch || optionsMatch || examMatch;
    });
  }, [searchQuery, categoryGroup]);

  // Direct exam matches across all categories when searching at top-level
  const globalExamSearchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || activeCategory) return [];

    return COMPETITIVE_EXAMS.filter((e) => {
      const nameMatch = e.name.toLowerCase().includes(q);
      const codeMatch = e.code.toLowerCase().includes(q);
      const catMatch = (e.categoryName || '').toLowerCase().includes(q);
      const countryMatch = (e.country || '').toLowerCase().includes(q);
      const bodyMatch = (e.conductingBody || '').toLowerCase().includes(q);
      const overviewMatch = (e.overview || '').toLowerCase().includes(q);

      return nameMatch || codeMatch || catMatch || countryMatch || bodyMatch || overviewMatch;
    });
  }, [searchQuery, activeCategory]);

  // Handlers
  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
    setSearchQuery('');
    setSubFilter('All');
    const el = document.getElementById('competitive-exams-explorer');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetToCategories = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSubFilter('All');
  };

  const handleOpenDetailModal = (exam) => {
    setModalExam(exam);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleOpenEnquiryModal = (exam, course = null) => {
    setEnquiryExam(exam);
    setEnquiryCourse(course);
    setIsEnquiryModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleCloseEnquiryModal = () => {
    setIsEnquiryModalOpen(false);
    setEnquiryExam(null);
    setEnquiryCourse(null);
  };

  return (
    <div id="competitive-exams-explorer" className="space-y-10 scroll-mt-24">
      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-4 sm:space-y-5 max-w-4xl">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
              Competitive Examinations &amp; Global Licensing Pathways
            </h1>

            <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
              Specialized civil services, central ministries, banking, railways, armed forces, global university entrance, and international licensing pathways.
            </p>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Explore audited coaching academies, official notifications, and verified preparation courses across 22 major competitive examination sectors—comprising Indian Union &amp; State public sector cadres, national eligibility benchmarks, and overseas professional healthcare &amp; engineering licensures.
            </p>

            {/* Quick Stats Grid */}
            <div className="pt-6 border-t border-slate-100 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Disciplines</span>
                <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">{COMPETITIVE_EXAM_CATEGORIES.length} Categories</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pathways</span>
                <span className="text-xl sm:text-2xl font-black text-gold-600 dark:text-gold-400">{COMPETITIVE_EXAMS.length} Exams</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">National Cadres</span>
                <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">15 Indian Sectors</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global &amp; GCC</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">7 International</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* SEARCH AND BROWSE CONTROL BAR                                             */}
      {/* ========================================================================= */}
      <div className="glass-card bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeCategory
                ? `Search within ${activeCategory.shortName} by exam name, syllabus, or authority...`
                : "Search examinations, abbreviations (UPSC, SSC, IBPS, RRB, IELTS, DHA, GATE), category, or country..."
            }
            className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs sm:text-sm font-medium text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-full focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Grouping Pills (when viewing root category grid) */}
        {!activeCategory && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mr-1">
              Filter Disciplines:
            </span>
            <button
              onClick={() => setCategoryGroup('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                categoryGroup === 'all'
                  ? 'bg-gold-500 text-navy-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              All Categories ({COMPETITIVE_EXAM_CATEGORIES.length})
            </button>
            <button
              onClick={() => setCategoryGroup('national')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                categoryGroup === 'national'
                  ? 'bg-gold-500 text-navy-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              Indian Competitive Exams (15)
            </button>
            <button
              onClick={() => setCategoryGroup('international')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                categoryGroup === 'international'
                  ? 'bg-gold-500 text-navy-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              International &amp; GCC Licensing (7)
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CATEGORY SELECTION GRID (NO CATEGORY SELECTED)                    */}
      {/* ========================================================================= */}
      {!activeCategory && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Examination Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an examination sector or regulatory board to explore specific exams, eligibility guidelines, and preparation advice.
              </p>
            </div>
            <span className="text-xs font-black text-gold-600 dark:text-gold-400 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30">
              {matchingCategories.length} Categories Displayed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingCategories.map((cat, idx) => {
              const IconComponent = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS[cat.iconName] || BookOpen;
              const catExamCount = examCounts[cat.id] || 0;

              return (
                <ScrollReveal key={cat.id}>
                  <div
                    onClick={() => handleSelectCategory(cat.id)}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-7 space-y-5 hover:border-gold-500 dark:hover:border-gold-500/70 hover:shadow-gold-glow/20 transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full relative"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Icon Badge & Category Counter */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-gold-500 group-hover:text-navy-950 transition-all duration-300 shadow-sm">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                          {catExamCount} {catExamCount === 1 ? 'Exam' : 'Exams / Pathways'}
                        </span>
                      </div>

                      {/* Category Title */}
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-gold-600 dark:text-gold-400 uppercase">
                          Sector {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition line-clamp-1 mt-0.5">
                          {cat.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 font-medium leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Options Preview Pills */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                          Featured Pathways:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(cat.popularOptions || cat.examOptions || []).slice(0, 4).map((opt, optIdx) => (
                            <span
                              key={optIdx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 truncate max-w-[170px]"
                            >
                              {opt}
                            </span>
                          ))}
                          {(cat.popularOptions || cat.examOptions || []).length > 4 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                              +{(cat.popularOptions || cat.examOptions || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                      <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs group-hover:bg-gold-shimmer group-hover:text-navy-950 transition flex items-center justify-between">
                        <span>Explore Examinations</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* When search yields direct exam matches across categories */}
          {searchQuery && globalExamSearchResults.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                    Direct Examination Results for "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing all matching examinations and licensing pathways across all 22 sectors.
                  </p>
                </div>
                <span className="text-xs font-black text-gold-600 dark:text-gold-400">
                  {globalExamSearchResults.length} Exams Found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalExamSearchResults.map((exam) => (
                  <ScrollReveal key={exam.id}>
                    <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500 transition-all duration-300 flex flex-col justify-between group h-full">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 uppercase">
                            {exam.code}
                          </span>
                          {exam.country && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                              {exam.country}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-xl font-black text-gold-600 dark:text-gold-400 tracking-tight">
                            {exam.code}
                          </div>
                          <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white line-clamp-2 mt-0.5">
                            {exam.name}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                          {exam.overview}
                        </p>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800/80 pt-2 space-y-1">
                          <div className="truncate"><strong>Authority:</strong> {exam.conductingBody}</div>
                          <div className="truncate"><strong>Eligibility:</strong> {exam.eligibility}</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetailModal(exam)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleOpenEnquiryModal(exam)}
                          className="py-2.5 px-3 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition text-center shrink-0 cursor-pointer"
                        >
                          Exam Enquiry
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
      {/* VIEW 2: SELECTED CATEGORY EXAMS (CATEGORY SELECTED)                       */}
      {/* ========================================================================= */}
      {activeCategory && (
        <div className="space-y-8">
          {/* Back to Categories Button & Category Banner */}
          <div className="glass-card bg-white dark:bg-navy-900/95 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800">
              <button
                onClick={handleResetToCategories}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Categories</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Examination Category</span>
              </div>
            </div>

            {/* Category Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gold-600 dark:text-gold-400">
                    Category Directory
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/20">
                    {displayedCategoryExams.length} {displayedCategoryExams.length === 1 ? 'Exam' : 'Exams / Pathways'} Available
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                  {activeCategory.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
                  {activeCategory.description}
                </p>
              </div>

              {/* General Exam Inquiry Button */}
              <button
                onClick={() => {
                  const firstExam = categoryExams[0];
                  if (firstExam) handleOpenEnquiryModal(firstExam);
                }}
                className="px-5 py-3 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Advisory Enquiry</span>
              </button>
            </div>

            {/* Sub-Filter Tabs (Country / Stream / Authority) */}
            {subFilterTabs.length > 1 && (
              <div className="pt-4 border-t border-slate-200 dark:border-navy-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Filter by Authority / Cadre:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {subFilterTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSubFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        subFilter === tab
                          ? 'bg-gold-500 text-navy-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Special Category Notice for OGT */}
          {activeCategory.id === 'ogt' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Exploratory Advisory Notice — Verification in Progress</span>
              </div>
              <p className="leading-relaxed">
                OGT is currently cataloged as an exploratory advisory pathway while its exact conducting board, syllabus pattern, and regional eligibility criteria are finalized. Revival International provides dedicated 1-on-1 advisory support and verification guidance without listing unconfirmed coaching courses.
              </p>
            </div>
          )}

          {/* Special Category Notice for Management Admissions (CAT / MAT) */}
          {activeCategory.id === 'management-psu' && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs sm:text-sm space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Admission vs Public Sector Recruitment Note</span>
              </div>
              <p className="leading-relaxed">
                CAT and MAT are national management academic admission examinations for entrance into postgraduate MBA/PGDM programs at IIMs and premier business schools, not government recruitment exams. Executive trainee entries via GATE and CPSE management recruitments constitute public sector employment pathways.
              </p>
            </div>
          )}

          {/* 3-Column Exam Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                Available Examinations &amp; Licensures
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {displayedCategoryExams.length} of {categoryExams.length} options
              </span>
            </div>

            {displayedCategoryExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCategoryExams.map((exam) => {
                  const verifiedCourseCount = exam.verifiedCourses?.length || 0;

                  return (
                    <ScrollReveal key={exam.id}>
                      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-4 hover:border-gold-500 transition-all duration-300 flex flex-col justify-between group h-full">
                        <div className="space-y-3">
                          {/* Card Badges */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 uppercase">
                              {exam.code}
                            </span>
                            {exam.country && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 truncate max-w-[150px] flex items-center gap-1">
                                <Globe2 className="w-2.5 h-2.5 text-gold-500" />
                                <span>{exam.country}</span>
                              </span>
                            )}
                          </div>

                          {/* Title & Abbreviation */}
                          <div>
                            <div className="text-xl font-black text-gold-600 dark:text-gold-400 tracking-tight">
                              {exam.code}
                            </div>
                            <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white line-clamp-2 mt-0.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">
                              {exam.name}
                            </h4>
                          </div>

                          {/* Overview Snippet */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                            {exam.overview}
                          </p>

                          {/* Key Specs Box */}
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800/80 pt-2 space-y-1">
                            <div className="truncate"><strong>Authority:</strong> {exam.conductingBody}</div>
                            <div className="truncate"><strong>Eligibility:</strong> {exam.eligibility}</div>
                          </div>

                          {/* Verified Courses Pill */}
                          <div className="pt-1">
                            {verifiedCourseCount > 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{verifiedCourseCount} Verified Preparation Courses</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-700 flex items-center gap-1 w-fit">
                                <ShieldCheck className="w-3 h-3 text-gold-500" />
                                <span>Advisory &amp; Registration Guidance</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDetailModal(exam)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-navy-900 dark:text-white font-bold text-xs transition text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>View Details &amp; Academies</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleOpenEnquiryModal(exam)}
                            className="py-2.5 px-3 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs shadow-gold-glow hover:opacity-95 transition text-center shrink-0 cursor-pointer"
                          >
                            Exam Enquiry
                          </button>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-300 dark:border-navy-800 rounded-3xl space-y-3">
                <Search className="w-8 h-8 mx-auto text-slate-400" />
                <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                  No examinations match your current filters.
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing the search query or selecting "All" from the authority filter tabs.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSubFilter('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-gold-shimmer text-navy-950 font-bold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DIALOGS                                                             */}
      {/* ========================================================================= */}
      <ExamDetailModal
        exam={modalExam}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onSelectCourse={(course, exam) => handleOpenEnquiryModal(exam, course)}
        onInquire={(exam) => handleOpenEnquiryModal(exam)}
      />

      <ExamEnquiryModal
        exam={enquiryExam}
        selectedCourse={enquiryCourse}
        category={activeCategory}
        isOpen={isEnquiryModalOpen}
        onClose={handleCloseEnquiryModal}
      />
    </div>
  );
};

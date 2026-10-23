import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SERVICES_LIST } from '../data/mockData';
import { 
  Building2, Globe, UserCheck, Briefcase, Clock, Users,
  Plane, FileText, Award, ShieldCheck, PieChart, CreditCard,
  Layers, Calendar, CheckCircle2, FileCode, Compass, Sparkles,
  GraduationCap, School, Languages, ArrowRight, X, ChevronRight,
  Send, ExternalLink, Search
} from 'lucide-react';
import { SEO } from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { ServiceEnquiryModal } from '../components/ServiceEnquiryModal';
import { trackServiceView, trackServiceDetailClick, trackCtaClick, trackEvent } from '../services/analytics';

// All nine core recruitment, staffing, and visa services
const NINE_SERVICES_IDS = [
  'dom-rec', 'intl-rec', 'exec-search', 'perm-staff',
  'contract-staff', 'bulk-hiring', 'overseas-place', 'visa-assist', 'work-permit'
];

// Accessible icon mapping for all 24 services
const serviceIconMap = {
  'Building2': Building2,
  'Globe': Globe,
  'UserCheck': UserCheck,
  'Briefcase': Briefcase,
  'Clock': Clock,
  'Users': Users,
  'Plane': Plane,
  'FileText': FileText,
  'Award': Award,
  'ShieldCheck': ShieldCheck,
  'PieChart': PieChart,
  'CreditCard': CreditCard,
  'Layers': Layers,
  'Calendar': Calendar,
  'CheckCircle2': CheckCircle2,
  'FileCode': FileCode,
  'Compass': Compass,
  'Sparkles': Sparkles,
  'GraduationCap': GraduationCap,
  'School': School,
  'Languages': Languages
};

export const Services = () => {
  const { navigateTo, selectedServiceId, setSelectedServiceId } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [enquiryModalService, setEnquiryModalService] = useState(null);

  const categories = [
    'All', 
    'Education', 
    'Recruitment', 
    'Executive', 
    'Staffing', 
    'Visa & Legal', 
    'Verification', 
    'Consulting', 
    'Operations', 
    'Career'
  ];

  // Dynamic service counts per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All': SERVICES_LIST.length };
    categories.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = SERVICES_LIST.filter(s => s.category === cat || s.subCategory === cat).length;
      }
    });
    return counts;
  }, []);

  // Filtered services based on category and live search query
  const filteredServices = useMemo(() => {
    let list = SERVICES_LIST;
    if (selectedCategory === 'All') {
      list = [
        ...SERVICES_LIST.filter(s => s.category === 'Education' || s.subCategory === 'Education'),
        ...SERVICES_LIST.filter(s => s.category !== 'Education' && s.subCategory !== 'Education')
      ];
    } else {
      list = SERVICES_LIST.filter(s => s.category === selectedCategory || s.subCategory === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.targetAudience && s.targetAudience.toLowerCase().includes(q)) ||
        (s.deliverables && s.deliverables.some(d => d.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Handle direct inquiry routing: nine core recruitment/visa services open dedicated modal; others go to contact page
  const handleInquire = (service) => {
    trackCtaClick('Inquire Now', 'services_page', service.id);
    if (NINE_SERVICES_IDS.includes(service.id)) {
      setEnquiryModalService(service);
      if (selectedService) setSelectedService(null);
    } else {
      if (setSelectedServiceId) setSelectedServiceId(service.id);
      if (selectedService) setSelectedService(null);
      navigateTo('contact');
    }
  };

  // Keyboard accessibility: close modal on Escape key and body lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
      }
    };
    if (selectedService) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Revival International Executive & Academic Services',
    'provider': {
      '@type': 'Organization',
      'name': 'Revival International',
      'url': 'https://www.revivalinternational.com'
    },
    'description': 'Comprehensive workforce solutions, visa processing, background verification, executive seminars, and international education guidance tailored to global standards.',
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Executive Services Portfolio',
      'itemListElement': filteredServices.map((srv) => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': srv.title,
          'description': srv.description
        }
      }))
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <SEO
        title="Executive Recruitment, HR Consulting & Academic Advisory Services"
        description="Comprehensive global talent acquisition, executive search, MOHRE visa processing, background verification, international consulting, and language test preparation in Dubai."
        canonicalPath="services"
        keywords="international consulting services, college admission assistance, school student career guidance, international university admissions, academy for school students, executive seminars, Duolingo English Test preparation, OET preparation, IELTS preparation, Dubai recruitment agency"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Services', item: '/services' }
        ]}
        structuredData={structuredData}
      />
      
      {/* Header Section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-gold-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Executive Services & Academic Advisory</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          Executive Recruitment, HR Consulting & Academic Advisory Services
        </h1>

        <p className="text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 max-w-xl mx-auto uppercase tracking-wide">
          Strategic International Consulting, Workforce Recruitment & Academic Advisory
        </p>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          From cross-border executive headhunting and MOHRE work permits to international university consulting, college admission guidance, student academy workshops, and specialized language test preparation (IELTS, OET, DET), Revival International delivers end-to-end global advisory.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigateTo('education')}
            className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label="Explore Dedicated Academic and Education Advisory Directory"
          >
            <span>🎓 Explore Academic Advisory Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label="Direct Consultation Request"
          >
            <span>Direct Consultation Request</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 sm:p-5 rounded-2xl shadow-glass space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Executive, IELTS, Visa, Admissions)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
                aria-label="Search services"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results Count & Reset */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-navy-900 dark:text-white font-mono">{filteredServices.length}</strong> of {SERVICES_LIST.length} services
              </span>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-gold-600 dark:text-gold-400 hover:underline font-bold text-xs"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div 
            className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2 border-t border-slate-100 dark:border-navy-800" 
            role="tablist" 
            aria-label="Service category filters"
          >
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="services-grid"
                  id={`tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    isSelected
                      ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                      : 'bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500/60'
                  }`}
                >
                  <span>{cat}</span>
                  <span 
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected 
                        ? 'bg-navy-950/15 text-navy-950 font-bold' 
                        : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Services Grid or Empty State */}
      <ScrollReveal>
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 px-4 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                No Services Match Your Search
              </h3>
              <p className="text-xs text-slate-500">
                No offerings matched <span className="font-mono text-gold-500 font-bold">"{searchQuery}"</span> under category <span className="font-bold">{selectedCategory}</span>.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
            >
              Reset Filters & Show All {SERVICES_LIST.length} Services
            </button>
          </div>
        ) : (
          <div 
            id="services-grid"
            role="tabpanel"
            aria-labelledby={`tab-${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((srv) => {
              const ServiceIcon = serviceIconMap[srv.icon] || Briefcase;
              const isEducation = srv.category === 'Education' || srv.subCategory === 'Education';
              const isSelected = selectedServiceId === srv.id;

              return (
                <div 
                  key={srv.id}
                  id={`service-${srv.id}`}
                  className={`glass-card bg-white dark:bg-navy-900 border p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-gold-500/60 hover:shadow-luxury hover:-translate-y-1 relative group ${
                    isSelected 
                      ? 'ring-2 ring-gold-500 border-gold-500 shadow-gold-glow' 
                      : 'border-slate-200/90 dark:border-navy-800/90'
                  }`}
                >
                  {/* Card Top Information */}
                  <div className="space-y-4">
                    {/* Icon & Category Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 dark:bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-gold-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-slate-900 dark:group-hover:text-navy-950 transition-colors duration-300 shadow-sm shrink-0">
                        <ServiceIcon className="w-6 h-6" />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {srv.category}
                          </span>
                          {isEducation && (
                            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                              ✨ Advisory
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">#{srv.id}</span>
                      </div>
                    </div>
                    
                    {/* Title & Description */}
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white leading-snug group-hover:text-gold-600 dark:group-hover:text-gold-400 transition min-h-[3rem] flex items-center">
                        {srv.title}
                      </h2>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal min-h-[2.75rem] line-clamp-2 mt-1">
                        {srv.description}
                      </p>

                      {/* Intended Audience Tag */}
                      {srv.targetAudience && (
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-2">
                          <Users className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1"><strong className="text-slate-800 dark:text-slate-200">Intended For:</strong> {srv.targetAudience}</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights / Deliverables */}
                    {srv.deliverables && srv.deliverables.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 dark:border-navy-800/80 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Key Deliverables
                        </p>
                        <ul className="space-y-1.5 text-[11px]" aria-label={`Highlights for ${srv.title}`}>
                          {srv.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium leading-tight">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Bottom Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3">
                    <button 
                      onClick={() => {
                        trackServiceDetailClick(srv.id, srv.title);
                        setSelectedService(srv);
                      }}
                      className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded py-1 transition group/btn"
                      aria-label={`View full details for ${srv.title}`}
                    >
                      <span>Service Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                    </button>

                    <button 
                      onClick={() => handleInquire(srv)}
                      className="px-3.5 py-1.5 bg-gold-shimmer text-navy-950 hover:opacity-95 font-extrabold text-xs rounded-xl shadow-sm hover:shadow-gold-glow active:scale-[0.98] transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                      aria-label={`Inquire now about ${srv.title}`}
                    >
                      <span>{(srv.id === 'intl-rec' || srv.id === 'overseas-place') ? 'Apply Now' : 'Inquire Now'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollReveal>

      {/* Professional Service Detail Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedService(null)}
          role="presentation"
        >
          <div 
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 p-6 sm:p-7 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-luxury"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-start gap-3">
                {(() => {
                  const ModalIcon = serviceIconMap[selectedService.icon] || Briefcase;
                  return (
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 dark:bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400 shrink-0 mt-0.5">
                      <ModalIcon className="w-5 h-5" />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {selectedService.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-medium">#{selectedService.id}</span>
                  </div>
                  <h3 id="service-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white leading-tight">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setSelectedService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                aria-label="Close service details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Description */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {selectedService.description}
            </p>

            {/* Target Audience */}
            {selectedService.targetAudience && (
              <div className="p-3.5 rounded-xl bg-gold-500/5 border border-gold-500/20 text-xs flex items-start gap-2.5">
                <Users className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-900 dark:text-white">Intended Audience: </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedService.targetAudience}</span>
                </div>
              </div>
            )}

            {/* Key Features & Deliverables */}
            <div className="p-4 bg-slate-50 dark:bg-navy-800/80 rounded-xl text-xs space-y-2 border border-slate-200/80 dark:border-navy-700/60">
              <p className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
                <span>Key Deliverables & Specifications:</span>
              </p>
              {selectedService.deliverables && selectedService.deliverables.length > 0 ? (
                <ul className="space-y-1.5 pl-1">
                  {selectedService.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="text-gold-500 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-1.5 pl-1 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold shrink-0">•</span>
                    <span>Full regulatory compliance under Dubai MOHRE standards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold shrink-0">•</span>
                    <span>Dedicated client account manager and consultation coordination.</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Sub-Programmes (if present, e.g. Executive Seminars & Language Test Prep) */}
            {selectedService.subProgrammes && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-gold-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Available Preparation Modules:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedService.subProgrammes.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700/60 space-y-1 text-xs">
                      <h4 className="font-bold text-navy-900 dark:text-gold-400 text-[11px]">{sub.title}</h4>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-tight">{sub.description}</p>
                      {sub.audience && (
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Audience: {sub.audience}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dedicated Academic Route CTA (for Education services) */}
            {(selectedService.category === 'Education' || selectedService.subCategory === 'Education') && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    const srvId = selectedService.id;
                    setSelectedService(null);
                    if (srvId === 'intl-consult') {
                      navigateTo('international-consulting');
                    } else {
                      navigateTo(`education-${srvId}`);
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <span>🎓 Explore Detailed Syllabus & Academic Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dedicated Vacancies Route CTA (for Domestic & International Recruitment) */}
            {(selectedService.id === 'dom-rec' || selectedService.id === 'intl-rec') && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    navigateTo('jobs');
                  }}
                  className="w-full py-2.5 px-3 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <span>💼 Browse Current Open Vacancies & Mandates</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button 
                onClick={() => setSelectedService(null)} 
                className="flex-1 py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-navy-700 text-xs font-bold rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                Close
              </button>
              <button 
                onClick={() => handleInquire(selectedService)} 
                className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 text-xs font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <span>{(selectedService.id === 'intl-rec' || selectedService.id === 'overseas-place') ? 'Apply Now' : 'Inquire Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Core Recruitment, Staffing & Visa Enquiry Modal */}
      <ServiceEnquiryModal
        isOpen={Boolean(enquiryModalService)}
        service={enquiryModalService}
        onClose={() => setEnquiryModalService(null)}
        onNavigateToJobs={() => navigateTo('jobs')}
      />

    </div>
  );
};

export default Services;

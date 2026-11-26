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

// 6 core verified educational & academic advisory services
const SIX_SERVICES_IDS = [
  'intl-consult', 'college-adm', 'school-career', 'intl-adm', 'school-academy', 'exec-seminars-lang'
];

// Accessible icon mapping
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
  'Compass': Compass,
  'Sparkles': Sparkles,
  'GraduationCap': GraduationCap,
  'School': School,
  'Languages': Languages
};

export const Services = () => {
  const { navigateTo, selectedServiceId, setSelectedServiceId, setActiveModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [enquiryModalService, setEnquiryModalService] = useState(null);

  const categories = [
    'All', 
    'Admissions & Placements', 
    'Consulting & Pathways', 
    'School & Career Guidance', 
    'Language & Seminars'
  ];

  // Dynamic service counts per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All': SERVICES_LIST.length };
    counts['Admissions & Placements'] = SERVICES_LIST.filter(s => s.id === 'college-adm' || s.id === 'intl-adm').length;
    counts['Consulting & Pathways'] = SERVICES_LIST.filter(s => s.id === 'intl-consult').length;
    counts['School & Career Guidance'] = SERVICES_LIST.filter(s => s.id === 'school-career' || s.id === 'school-academy').length;
    counts['Language & Seminars'] = SERVICES_LIST.filter(s => s.id === 'exec-seminars-lang').length;
    return counts;
  }, []);

  // Filtered services based on category and live search query
  const filteredServices = useMemo(() => {
    let list = SERVICES_LIST;
    if (selectedCategory === 'Admissions & Placements') {
      list = SERVICES_LIST.filter(s => s.id === 'college-adm' || s.id === 'intl-adm');
    } else if (selectedCategory === 'Consulting & Pathways') {
      list = SERVICES_LIST.filter(s => s.id === 'intl-consult');
    } else if (selectedCategory === 'School & Career Guidance') {
      list = SERVICES_LIST.filter(s => s.id === 'school-career' || s.id === 'school-academy');
    } else if (selectedCategory === 'Language & Seminars') {
      list = SERVICES_LIST.filter(s => s.id === 'exec-seminars-lang');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.badge && s.badge.toLowerCase().includes(q)) ||
        (s.targetAudience && s.targetAudience.toLowerCase().includes(q)) ||
        (s.deliverables && s.deliverables.some(d => d.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Navigate to dedicated service page
  const getServiceTab = (id) => {
    switch (id) {
      case 'intl-consult': return 'international-consulting';
      case 'college-adm': return 'education-college-adm';
      case 'school-career': return 'education-school-career';
      case 'intl-adm': return 'education-intl-adm';
      case 'school-academy': return 'education-school-academy';
      case 'exec-seminars-lang': return 'education-exec-seminars-lang';
      default: return 'services';
    }
  };

  // Handle direct inquiry routing
  const handleInquire = (service) => {
    trackCtaClick('Inquire Now', 'services_page', service.id);
    if (setSelectedServiceId) setSelectedServiceId(service.id);
    if (service.id === 'intl-consult') {
      navigateTo('international-consulting');
    } else {
      if (setActiveModal) {
        setActiveModal('education-enquiry');
      } else {
        navigateTo('contact');
      }
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
    'name': 'Revival International Academic & Educational Advisory',
    'provider': {
      '@type': 'Organization',
      'name': 'Revival International',
      'url': 'https://www.revivalinternational.com'
    },
    'description': 'Comprehensive international consulting, college admissions, school student career guidance, enrichment academy, and executive seminars with language test preparation.',
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Academic Advisory Portfolio',
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
        title="Academic Advisory & International Consulting Services | The Revival International"
        description="Specialized international university consulting, undergraduate and postgraduate college admissions, student career guidance, enrichment academy, and executive language test preparation (IELTS, OET, DET)."
        canonicalPath="services"
        keywords="international consulting services, college admission assistance, school student career guidance, international university admissions, academy for school students, executive seminars, Duolingo English Test preparation, OET preparation, IELTS preparation, Dubai education advisory"
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
          <span>Academic Advisory & Global Consulting</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          Academic Advisory & International Consulting Services
        </h1>

        <p className="text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 max-w-xl mx-auto uppercase tracking-wide">
          6 Certified International Education & Professional Development Pathways
        </p>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          From strategic overseas study consulting and institutional admissions to student career aptitude guidance, enrichment academy workshops, and specialized language test preparation (IELTS, OET, DET), Revival International delivers end-to-end global advisory.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigateTo('education')}
            className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
            aria-label="Explore Dedicated Academic and Education Advisory Directory"
          >
            <span>🎓 Explore Academic Advisory Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
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
                placeholder="Search services (e.g. International, Admissions, IELTS, Career)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
                aria-label="Search services"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
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
                  className="text-gold-600 dark:text-gold-400 hover:underline font-bold text-xs cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer ${
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
              className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
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
              const ServiceIcon = serviceIconMap[srv.icon] || GraduationCap;
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
                          {srv.badge && (
                            <span className="bg-gold-500/10 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold-500/20 uppercase tracking-wider font-mono">
                              {srv.badge}
                            </span>
                          )}
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                            ✨ Core
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">#{srv.id}</span>
                      </div>
                    </div>
                    
                    {/* Title & Description */}
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white leading-snug group-hover:text-gold-600 dark:group-hover:text-gold-400 transition min-h-[3rem] flex items-center">
                        {srv.title}
                      </h2>

                      {srv.tagline && (
                        <p className="text-[11px] font-semibold text-gold-600 dark:text-gold-400 mt-0.5">
                          {srv.tagline}
                        </p>
                      )}
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal min-h-[2.75rem] line-clamp-2 mt-1.5">
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
                        navigateTo(getServiceTab(srv.id));
                      }}
                      className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded py-1 transition group/btn cursor-pointer"
                      aria-label={`View full details for ${srv.title}`}
                    >
                      <span>Service Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
                    </button>

                    <button 
                      onClick={() => handleInquire(srv)}
                      className="px-3.5 py-1.5 bg-gold-shimmer text-navy-950 hover:opacity-95 font-extrabold text-xs rounded-xl shadow-sm hover:shadow-gold-glow active:scale-[0.98] transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
                      aria-label={`Inquire now about ${srv.title}`}
                    >
                      <span>Inquire Now</span>
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
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="service-modal-title" className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                    {selectedService.title}
                  </h3>
                  <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider">
                    {selectedService.badge || selectedService.category}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedService.description}
            </p>

            {selectedService.targetAudience && (
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 text-xs">
                <span className="font-bold text-navy-900 dark:text-white block mb-0.5">Who This Is For:</span>
                <span className="text-slate-600 dark:text-slate-400">{selectedService.targetAudience}</span>
              </div>
            )}

            {selectedService.deliverables && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">What You Get:</h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {selectedService.deliverables.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex gap-2 justify-end">
              <button
                onClick={() => {
                  const targetTab = getServiceTab(selectedService.id);
                  setSelectedService(null);
                  navigateTo(targetTab);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-navy-700 hover:border-gold-500 text-navy-950 dark:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Go to Dedicated Page
              </button>
              <button
                onClick={() => {
                  const srv = selectedService;
                  setSelectedService(null);
                  handleInquire(srv);
                }}
                className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
              >
                Inquire Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Service Enquiry Modal (if triggered) */}
      {enquiryModalService && (
        <ServiceEnquiryModal
          isOpen={true}
          onClose={() => setEnquiryModalService(null)}
          service={enquiryModalService}
        />
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EDUCATION_SERVICES_DETAILED } from '../data/educationServicesData';
import { EducationSEO } from '../components/EducationSEO';
import { EducationEnquiryModal } from '../components/EducationEnquiryModal';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceDetailClick, trackCtaClick } from '../services/analytics';
import { 
  Search, X, ArrowRight, CheckCircle2, Sparkles, Filter, 
  GraduationCap, Globe, Compass, Plane, School, Languages, 
  HelpCircle, Calendar
} from 'lucide-react';

const iconMap = {
  'Globe': Globe,
  'GraduationCap': GraduationCap,
  'Compass': Compass,
  'Plane': Plane,
  'School': School,
  'Languages': Languages
};

export const EducationDirectory = () => {
  const { navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalServiceId, setActiveModalServiceId] = useState(null);

  const categories = ['All', 'Consulting', 'Admissions', 'Career', 'Academy', 'Executive & Language'];

  // Filtered services with memoization
  const filteredServices = useMemo(() => {
    return EDUCATION_SERVICES_DETAILED.filter((service) => {
      // Category Match
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;

      // Search Query Match (Title, description, deliverables, sub-programs, tags)
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleMatch = service.title.toLowerCase().includes(q);
      const descMatch = service.shortDescription.toLowerCase().includes(q) || service.heroDescription.toLowerCase().includes(q);
      const categoryMatch = service.category.toLowerCase().includes(q);
      const subProgramMatch = (service.subProgrammes || []).some(sub => 
        sub.title.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q)
      );
      const benefitsMatch = (service.keyBenefits || []).some(b => 
        b.title.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q)
      );

      return matchesCategory && (titleMatch || descMatch || categoryMatch || subProgramMatch || benefitsMatch);
    });
  }, [searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'Revival International Academic & Education Advisory',
    'url': 'https://www.revivalinternational.com/#education',
    'description': 'Premier academic consulting, college admission assistance, school student career guidance, and language test training in Dubai and globally.',
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Academic & Education Advisory Services',
      'itemListElement': EDUCATION_SERVICES_DETAILED.map((s, idx) => ({
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': s.title,
          'description': s.shortDescription
        }
      }))
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      <EducationSEO
        title="Academic & Education Advisory Directory Dubai | Study Abroad & Admissions"
        description="Explore Revival International's verified academic advisory offerings in Dubai: International Consulting, College Admissions, Career Guidance, Academy Workshops, and Language Test Preparation."
        canonicalPath="education"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' }
        ]}
        structuredData={structuredData}
      />

      {/* Hero Header */}
      <ScrollReveal>
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              Dubai • GCC • Worldwide Admissions
            </span>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
              6 Verified Offerings
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
            Academic & Education Advisory Services Dubai
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            Personalized global pathways, high school stream guidance, undergraduate and postgraduate college admissions, and certified test preparation (DET, OET, IELTS) led by licensed senior advisors.
          </p>
        </div>
      </ScrollReveal>

      {/* Search & Category Filter Controls */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-glass space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, tests (e.g. IELTS, OET, DET), or keywords..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
                aria-label="Search education services"
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

            {/* Results Counter & Reset */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-navy-900 dark:text-white font-mono">{filteredServices.length}</strong> of {EDUCATION_SERVICES_DETAILED.length} services
              </span>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={clearFilters}
                  className="text-gold-600 dark:text-gold-400 hover:underline font-bold text-xs"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-navy-800" role="tablist" aria-label="Education categories">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-gold-500" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  selectedCategory === cat
                    ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:border-gold-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Services Grid */}
      <div className="space-y-8">
        {filteredServices.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="text-center py-16 px-4 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                No Education Services Found
              </h3>
              <p className="text-xs text-slate-500">
                No offerings matched your query <span className="font-mono text-gold-500 font-bold">"{searchQuery}"</span> under category <span className="font-bold">{selectedCategory}</span>.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
            >
              Clear Search & Show All 6 Services
            </button>
          </div>
        ) : (
          /* Directory Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => {
              const ServiceIcon = iconMap[srv.icon] || GraduationCap;
              return (
                <div 
                  key={srv.id}
                  id={`edu-service-${srv.id}`}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 shadow-glass flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-gold-500/20">
                        {srv.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">#{srv.id}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <ServiceIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white leading-snug">
                          {srv.title}
                        </h2>
                        <p className="text-[11px] text-gold-600 dark:text-gold-400 font-serif italic">
                          {srv.badge}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {srv.shortDescription}
                    </p>

                    {/* Key Quick Highlight Tags */}
                    <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 text-[11px] space-y-1">
                      <span className="font-bold text-navy-900 dark:text-white">Audience: </span>
                      <span className="text-slate-600 dark:text-slate-400 leading-snug">
                        {srv.targetAudience.slice(0, 80)}...
                      </span>
                    </div>

                    {srv.subProgrammes && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {srv.subProgrammes.map(sub => (
                          <span key={sub.id} className="text-[9px] font-bold bg-navy-800/10 dark:bg-navy-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                            {sub.badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center gap-2">
                    <button
                      onClick={() => {
                        trackServiceDetailClick(srv.id, srv.title);
                        navigateTo(`education-${srv.id}`);
                      }}
                      className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded"
                      aria-label={`View full details for ${srv.title}`}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        trackCtaClick('Enquire Now', 'education_directory', srv.id);
                        setActiveModalServiceId(srv.id);
                      }}
                      className="px-3.5 py-1.5 bg-gold-shimmer text-navy-950 font-bold text-[11px] rounded-lg shadow-gold-glow hover:opacity-95 transition focus:outline-none focus:ring-2 focus:ring-gold-500"
                      aria-label={`Book consultation for ${srv.title}`}
                    >
                      Enquire Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <EducationEnquiryModal
        isOpen={!!activeModalServiceId}
        onClose={() => setActiveModalServiceId(null)}
        preselectedServiceId={activeModalServiceId}
      />
    </div>
  );
};

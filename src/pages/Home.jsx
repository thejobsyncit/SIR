import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Globe, Users, Briefcase, Search, ArrowRight, ShieldCheck, Award, 
  CheckCircle2, Star, Play, ChevronRight, FileText, Sparkles, MapPin, Clock, Phone, Send
} from 'lucide-react';
import { SERVICES_LIST, INDUSTRIES_LIST, TESTIMONIALS, BLOG_POSTS, FAQS, COUNTRIES_LIST } from '../data/mockData';

export const Home = () => {
  const { navigateTo, setSelectedJob, setActiveModal } = useApp();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCountry, setSearchCountry] = useState('All');
  const [activeFaqCategory, setActiveFaqCategory] = useState('General');
  const [openFaq, setOpenFaq] = useState(0);

  const stats = [
    { value: '50,000+', label: 'Candidates Placed', icon: Users },
    { value: '500+', label: 'Global Corporate Clients', icon: Building2 },
    { value: '15+', label: 'Countries Served', icon: Globe },
    { value: '98%', label: 'Client Satisfaction Rate', icon: Award }
  ];

  const processSteps = [
    { num: '01', title: 'Register', desc: 'Create your candidate profile or employer mandate in 60 seconds.' },
    { num: '02', title: 'Upload Resume', desc: 'Run our AI Resume Analyzer for ATS compliance & skill mapping.' },
    { num: '03', title: 'Interview', desc: 'Participate in structured video or face-to-face panel interviews.' },
    { num: '04', title: 'Documentation', desc: 'Attestation of degrees, transcripts, & police clearances.' },
    { num: '05', title: 'Visa Processing', desc: 'Fast-track MOHRE work permit & medical fitness scheduling.' },
    { num: '06', title: 'Job Placement', desc: 'Seamless airport reception, onboarding, & settlement support.' }
  ];

  const trustedLogos = [
    { name: 'Emirates Airline', logo: '✈️ Emirates' },
    { name: 'Emaar Properties', logo: '🏙️ Emaar' },
    { name: 'Saudi Aramco', logo: '🛢️ Aramco' },
    { name: 'DP World', logo: '🚢 DP World' },
    { name: 'QNB Group', logo: '🏦 QNB' },
    { name: 'Etihad Airways', logo: '🛫 Etihad' },
    { name: 'Alshaya Group', logo: '🛍️ Alshaya' },
    { name: 'Habtoor Group', logo: '🏗️ Al Habtoor' }
  ];

  return (
    <div className="space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden">
        {/* Background Dubai Skyline Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero_dubai.png" 
            alt="Dubai Skyline SIR Recruitment" 
            className="w-full h-full object-cover opacity-25 dark:opacity-20 transform scale-105 transition duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-liteblue-50/80 via-liteblue-50/60 to-liteblue-50 dark:from-navy-950/90 dark:via-navy-950/80 dark:to-navy-950"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-8 py-12">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-navy-900/90 text-gold-400 border border-gold-500/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-luxury animate-float">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Dubai's #1 Licensed Executive Recruitment & HR Consultancy</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-900 dark:text-white tracking-tight leading-[1.15] max-w-5xl mx-auto">
            Connecting Global Talent with <br />
            <span className="text-gradient-gold">Leading Employers</span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed font-normal">
            SIR Recruitment specializes in domestic and international recruitment, manpower outsourcing, executive hiring, visa processing, and HR consulting for companies across the UAE, GCC, Europe, and Asia.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <button 
              onClick={() => navigateTo('jobs')}
              className="w-full sm:w-auto px-8 py-4 bg-gold-shimmer text-navy-950 font-extrabold text-sm rounded-xl shadow-gold-glow hover:scale-105 transition duration-300 flex items-center justify-center space-x-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Find Jobs in Dubai & GCC</span>
            </button>

            <button 
              onClick={() => navigateTo('employers')}
              className="w-full sm:w-auto px-8 py-4 bg-navy-900 text-white font-extrabold text-sm rounded-xl border border-gold-500/40 hover:bg-navy-800 transition shadow-luxury flex items-center justify-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-gold-500" />
              <span>Hire Executive Talent</span>
            </button>
          </div>

          {/* Hero Quick Search Box */}
          <div className="glass-card bg-white/90 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-700 p-4 sm:p-6 rounded-2xl max-w-4xl mx-auto shadow-luxury">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Job title, skill, or keyword..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select 
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-navy-900 dark:text-white rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:border-gold-500"
                >
                  <option value="All">All Destination Countries</option>
                  <option value="UAE">🇦🇪 United Arab Emirates</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                </select>
              </div>

              <button 
                onClick={() => navigateTo('jobs')}
                className="w-full py-3 bg-navy-900 hover:bg-gold-500 hover:text-navy-950 text-white font-bold text-xs rounded-xl transition duration-300 flex items-center justify-center space-x-2"
              >
                <span>Search 500+ Active Roles</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* TRUSTED COMPANIES LOGO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          Trusted by Premier Enterprises & Government Entities Across GCC & Europe
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center">
          {trustedLogos.map((item, idx) => (
            <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-xl text-center font-bold text-xs text-navy-900 dark:text-slate-300 hover:border-gold-500 transition">
              {item.logo}
            </div>
          ))}
        </div>
      </section>

      {/* KEY STATISTICS COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="glass-card bg-navy-950 text-white border border-gold-500/30 rounded-3xl p-8 sm:p-12 shadow-luxury relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-navy-800">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="pt-4 lg:pt-0 lg:px-4 space-y-2">
                  <Icon className="w-8 h-8 text-gold-500 mx-auto" />
                  <div className="font-serif text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW (18+ Services) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Our Core Expertise</h2>
          <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white">
            18+ Premium HR & Recruitment Solutions
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            From executive headhunting to MOHRE visa quotas, we manage every facet of corporate workforce expansion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.slice(0, 9).map((srv) => (
            <div 
              key={srv.id}
              onClick={() => navigateTo('services')}
              className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl hover:border-gold-500 hover:-translate-y-1 transition duration-300 cursor-pointer space-y-3 group shadow-glass"
            >
              <div className="w-12 h-12 rounded-xl bg-navy-950 text-gold-500 border border-gold-500/30 flex items-center justify-center font-bold group-hover:bg-gold-500 group-hover:text-navy-950 transition">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white group-hover:text-gold-500 transition">
                {srv.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {srv.description}
              </p>
              <div className="text-xs font-bold text-gold-500 flex items-center gap-1 pt-2">
                <span>Explore Service Details</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={() => navigateTo('services')}
            className="px-8 py-3.5 bg-navy-900 hover:bg-gold-500 hover:text-navy-950 text-white font-bold text-xs rounded-xl shadow-luxury transition"
          >
            View All 18 Executive Services →
          </button>
        </div>
      </section>

      {/* INDUSTRIES WE SERVE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-navy-800 pb-6">
          <div>
            <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-1">Industry Verticals</h2>
            <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Industries We Serve</h3>
          </div>
          <button 
            onClick={() => navigateTo('industries')}
            className="text-xs font-bold text-gold-500 hover:underline flex items-center gap-1"
          >
            <span>Explore All 12 Sectors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDUSTRIES_LIST.map((ind) => (
            <div 
              key={ind.id}
              onClick={() => navigateTo('jobs')}
              className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl hover:border-gold-500 transition cursor-pointer space-y-2 group shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-navy-900 dark:text-white text-sm group-hover:text-gold-500 transition">
                  {ind.name}
                </span>
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {ind.openJobs} Open Roles
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {ind.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK VISA ELIGIBILITY CHECKER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="glass-card bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-8 sm:p-12 border border-gold-500/30 shadow-luxury grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="bg-gold-500/20 text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Interactive Compliance Tool
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
              Instant GCC & International Work Visa Eligibility Evaluation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you eligible to work in the UAE, Saudi Arabia, Qatar, Singapore, or Germany? Check your qualification tier, age criteria, document checklist, and visa processing timelines.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => navigateTo('visa-eligibility')}
                className="px-6 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95"
              >
                Launch Visa Eligibility Checker →
              </button>
            </div>
          </div>

          <div className="bg-navy-900/90 border border-gold-500/30 p-6 rounded-2xl space-y-4">
            <h4 className="font-serif font-bold text-gold-400 text-sm border-b border-navy-800 pb-2">
              Country-Wise Visa Matrix Overview
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span>🇦🇪 UAE Employer Work Visa</span>
                <span className="font-bold text-emerald-400">7 - 14 Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span>🇸🇦 Saudi Iqama Work Permit</span>
                <span className="font-bold text-emerald-400">14 - 21 Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span>🇶🇦 Qatar Work Residence Permit</span>
                <span className="font-bold text-emerald-400">10 - 18 Days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span>🇸🇬 Singapore Employment Pass</span>
                <span className="font-bold text-emerald-400">14 - 28 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR 6-STEP PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Simple & Transparent</h2>
          <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Our 6-Step Recruitment Lifecycle</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {processSteps.map((step) => (
            <div key={step.num} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl relative space-y-2">
              <div className="font-serif text-3xl font-extrabold text-gold-500/40">
                {step.num}
              </div>
              <h4 className="font-bold text-sm text-navy-900 dark:text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS & SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Client & Candidate Praise</h2>
          <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Success Stories across UAE & GCC</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-glass">
              <div className="flex items-center space-x-1 text-gold-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 dark:border-navy-800">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-gold-500" />
                <div>
                  <h4 className="font-bold text-xs text-navy-900 dark:text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role} • {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST BLOG & NEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-1">Knowledge Hub</h2>
            <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Latest Industry Insights</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 shadow-sm">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                {post.category}
              </span>
              <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white leading-snug">
                {post.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {post.summary}
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800 flex justify-between">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Have Questions?</h2>
          <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden text-xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left p-4 font-bold text-navy-900 dark:text-white flex justify-between items-center"
              >
                <span>{faq.question}</span>
                <span className="text-gold-500 font-extrabold text-base">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

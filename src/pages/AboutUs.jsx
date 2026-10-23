import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Globe, Shield, Award, Users, CheckCircle2, MapPin, Target, Eye,
  ShieldCheck, Compass, GraduationCap, Briefcase, FileCheck, Clock, ArrowRight, Sparkles, Phone, Mail
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';

export const AboutUs = () => {
  const { navigateTo } = useApp();

  const corePillars = [
    {
      icon: ShieldCheck,
      title: '100% Ethical & Legal Compliance',
      desc: 'Govt. Recognized & ISO 9001:2025 certified agency. Strict adherence to Indian MEA/eMigrate, UAE MOHRE, and GCC labor regulations.'
    },
    {
      icon: Globe,
      title: 'Global Footprint & Local Reach',
      desc: 'Direct operational infrastructure bridging talent and students across India, UAE, Saudi Arabia, Qatar, Europe, and worldwide.'
    },
    {
      icon: FileCheck,
      title: 'Rigorous 6-Point Verification',
      desc: 'Every candidate undergoes identity, educational credential checks, police clearance, and past employer verification before placement.'
    },
    {
      icon: GraduationCap,
      title: 'Corporate & Academic Dual-Wing',
      desc: 'Unique synergy handling enterprise executive recruitment and skilled manpower alongside top-tier international university admissions.'
    }
  ];

  const milestones = [
    { value: '25,000+', label: 'Candidates Placed Worldwide', sub: 'Across GCC, Europe & Asia' },
    { value: '12+', label: 'Industry Sectors Served', sub: 'From Health & Tech to Construction' },
    { value: '98.4%', label: 'Visa & Credential Approval', sub: 'Benchmark Regulatory Clearance' },
    { value: 'ISO 9001:2025', label: 'Certified Quality Standards', sub: 'Audited & Govt. Recognized' }
  ];

  const operationalSteps = [
    {
      step: '01',
      title: 'Mandate & Requirements Mapping',
      desc: 'In-depth consultation to map job descriptions, salary benchmarks, skill matrices, or target university requirements.'
    },
    {
      step: '02',
      title: 'Sourcing & Multi-Tier Screening',
      desc: 'Leveraging active international databases, psychometric tests, and technical screening for exact-fit shortlisting.'
    },
    {
      step: '03',
      title: 'Attestations & Visa Processing',
      desc: 'Handling embassy verifications, medical clearances, work permit petitions, and government stamping end-to-end.'
    },
    {
      step: '04',
      title: 'Mobilization & Onboarding Care',
      desc: 'Pre-departure orientation, ticketing, airport transit, and 90-day retention support for guaranteed satisfaction.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      <SEO
        title="About Revival International | Global Recruitment & Academic Advisory"
        description="Learn about Revival International's heritage, India Head Office, GCC presence, and our dual-wing expertise bridging global executive recruitment and international academic advisory."
        canonicalPath="about"
        keywords="about Revival International, India Head Office recruitment, Dubai recruitment agency, executive headhunting, UAE MOHRE visa compliance, international education consulting"
        breadcrumbs={[
          { name: 'Home', item: '' },
          { name: 'About Us', item: 'about' }
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Revival International',
          description: 'Overview of Revival International, global presence, core values, and human capital and education advisory services.',
          url: 'https://www.revivalinternational.com/about',
          mainEntity: {
            '@type': 'Organization',
            name: 'Revival International',
            url: 'https://www.revivalinternational.com',
            telephone: '+91 9003475405',
            email: 'enquiry@therevivalinternational.com'
          }
        }}
      />
      
      {/* Header */}
      <ScrollReveal>
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            About The Revival International
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            Your Trusted Global Gateway for Human Capital & Higher Education
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            Operating from our India Head Office with an expansive international footprint across Dubai, GCC, Europe, and worldwide, The Revival International empowers global enterprises and ambitious individuals with benchmark recruitment, visa processing, and academic advisory.
          </p>
        </div>
      </ScrollReveal>

      {/* Office Visual Banner */}
      <ScrollReveal>
        <div className="relative rounded-3xl overflow-hidden shadow-luxury border border-slate-200 dark:border-gold-500/30 max-h-[420px]">
          <img 
            src="/images/dubai_office.png" 
            alt="Revival International Corporate Network" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent flex items-end p-6 sm:p-10">
            <div className="text-white space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2 text-gold-400 text-xs font-bold">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Global Network: India Head Office • Dubai • GCC & Worldwide</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Global Footprint, Uncompromised Compliance Standards
              </h3>
              <p className="text-xs text-slate-200 font-medium hidden sm:block">
                Licensed overseas recruitment and academic counseling with verifiable track records across 15+ countries.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Mission & Vision Grid */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 rounded-3xl space-y-4 shadow-glass hover:border-gold-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Our Mission</h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              To bridge global talent reserves with high-growth employment markets across the UAE, Saudi Arabia, Qatar, Europe, and Asia through transparent, tech-enabled, and fully compliant recruitment solutions.
            </p>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 rounded-3xl space-y-4 shadow-glass hover:border-gold-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Our Vision</h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              To be recognized globally as the most trusted human capital and educational consultancy, setting benchmark standards in background verification, executive search, ethical manpower deployment, and career enablement.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Core Pillars / Why Choose Us */}
      <ScrollReveal>
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">
              The Pillars of Our Distinction
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Every mandate we execute is backed by rigid adherence to legal ethics, candidate welfare, and unmatched speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 shadow-sm hover:border-gold-500/50 hover:shadow-gold-glow transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-navy-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Track Record & Milestones Counter Grid */}
      <ScrollReveal>
        <div className="rounded-3xl bg-gradient-to-br from-navy-950 via-[#0a1628] to-navy-900 border border-gold-500/30 p-8 sm:p-12 shadow-luxury text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {milestones.map((ms, idx) => (
              <div key={idx} className={`space-y-2 ${idx > 0 ? 'pt-6 lg:pt-0 lg:px-4' : 'lg:pr-4'}`}>
                <p className="font-serif text-3xl sm:text-4xl font-black text-gold-400 tracking-tight">
                  {ms.value}
                </p>
                <p className="font-bold text-xs sm:text-sm text-white">
                  {ms.label}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {ms.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* 4-Stage Operational Process */}
      <ScrollReveal>
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
              Our Methodology
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">
              End-to-End Operational Process
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              From requirement definition to post-placement mobilization, we ensure zero bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {operationalSteps.map((step, idx) => (
              <div 
                key={idx}
                className="relative glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 shadow-sm hover:border-gold-500/40 transition"
              >
                <span className="font-mono text-3xl font-black text-gold-500/20 dark:text-gold-400/20 block">
                  {step.step}
                </span>
                <h4 className="font-bold text-sm text-navy-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Direct Contact & Collaboration CTA Card */}
      <ScrollReveal>
        <div className="glass-card bg-gradient-to-r from-gold-500/10 via-white to-gold-500/10 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border border-gold-500/30 p-8 sm:p-10 rounded-3xl shadow-luxury flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300 font-bold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> India Head Office Ready to Assist
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
              Partner With The Revival International
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              Whether you are an enterprise seeking skilled workforce deployments, or a student aspiring for overseas university admissions, our advisory team is at your service.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <a href="tel:+919003475405" className="flex items-center gap-1.5 hover:text-gold-600 dark:hover:text-gold-400 transition">
                <Phone className="w-3.5 h-3.5 text-gold-500" />
                <span>+91 9003475405</span>
              </a>
              <span>•</span>
              <a href="mailto:enquiry@therevivalinternational.com" className="flex items-center gap-1.5 hover:text-gold-600 dark:hover:text-gold-400 transition">
                <Mail className="w-3.5 h-3.5 text-gold-500" />
                <span>enquiry@therevivalinternational.com</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigateTo('contact')}
              className="px-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span>Contact India Head Office</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('services')}
              className="px-6 py-3.5 bg-white dark:bg-navy-950 border border-slate-300 dark:border-gold-500/40 text-slate-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition cursor-pointer"
            >
              <span>Explore All 24 Services</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};

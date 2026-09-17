import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Phone, Mail, MapPin, Globe, Shield, Award, 
  Send, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube, CheckCircle2 
} from 'lucide-react';
import { COUNTRIES_LIST } from '../data/mockData';

export const Footer = () => {
  const { navigateTo, setActiveModal, activeTab } = useApp();

  const NavLink = ({ tab, label, onClick, isModal }) => {
    const isActive = !isModal && activeTab === tab;
    return (
      <li>
        <button 
          onClick={onClick || (() => navigateTo(tab))} 
          className={`hover:text-gold-400 transition flex items-center gap-2 ${isActive ? 'text-amber-400 font-bold' : ''}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600'}`}></span>
          <span className="text-left">{label}</span>
        </button>
      </li>
    );
  };

  return (
    <footer className="bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-navy-800 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Top Newsletter & Banner Callout */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl p-8 mb-16 shadow-luxury flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-gold-500/20 text-gold-600 dark:text-gold-400 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>International Recruitment Intelligence</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Stay Ahead of GCC Visa Laws & Executive Vacancies
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
              Subscribe to the Revival Executive Briefing. Delivered bi-weekly to 40,000+ HR Directors & C-Suite Executives.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter corporate email address..." 
              className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 w-full sm:min-w-[260px] focus:outline-none focus:border-gold-500 font-medium"
            />
            <button className="bg-gold-shimmer text-navy-950 font-bold text-xs px-6 py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 w-full sm:w-auto">
              <span>Subscribe Now</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-navy-800 text-xs">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-navy-900 border-2 border-gold-500 flex items-center justify-center shadow-lg">
                <span className="font-serif text-xl font-extrabold text-gold-500">R</span>
                <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">I</span>
              </div>
              <div className="font-serif text-xl font-black text-navy-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Revival <span className="text-gold-500 font-sans text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 dark:bg-navy-900 text-gold-400 rounded shadow-sm">Intl</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pr-4 font-medium">
              Revival International is a Dubai-headquartered premier international recruitment consultancy, executive search firm, and licensed manpower outsourcing vendor operating across the UAE, GCC, Europe, and Asia.
            </p>

            <div className="space-y-2 pt-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>Level 34, Rolex Tower, Financial Center Road, Business Bay, Dubai, United Arab Emirates</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span>+971 4 123 4567 / +971 50 987 6543</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <span>contact@revivalinternational.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:border-gold-500 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:border-gold-500 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:border-gold-500 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:border-gold-500 transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider text-gold-500 border-b border-slate-200 dark:border-navy-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-medium">
              <NavLink tab="home" label="Home" />
              <NavLink tab="about" label="About Us" />
              <NavLink tab="services" label="Core Services" />
              <NavLink tab="industries" label="Industries We Serve" />
              <NavLink tab="jobs" label="Browse Job Portal" />
              <NavLink tab="employers" label="Employer Solutions" />
              <NavLink tab="candidates" label="Candidate Hub" />
              <NavLink tab="crm" label="Recruiter CRM Portal" />
              <NavLink tab="contact" label="Office Locations" />
            </ul>
          </div>

          {/* Col 3: Key Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider text-gold-500 border-b border-slate-200 dark:border-navy-800 pb-2">
              Visa & Verification
            </h4>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-medium">
              <NavLink tab="visa-eligibility" label="Visa Eligibility Checker" />
              <NavLink tab="visa-eligibility" label="GCC Country Visa Matrix" />
              <NavLink tab="background-verification" label="Background Verification" />
              <NavLink tab="background-verification" label="Education Attestation" />
              <NavLink isModal label="AI Resume Analyzer" onClick={() => setActiveModal('ai-resume')} />
              <NavLink isModal label="Resume Builder Tool" onClick={() => setActiveModal('resume-builder')} />
              <NavLink isModal label="Online Payment Gateway" onClick={() => setActiveModal('payment')} />
            </ul>
          </div>

          {/* Col 4: Top Destinations */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider text-gold-500 border-b border-slate-200 dark:border-navy-800 pb-2">
              Global Destinations
            </h4>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-medium">
              {COUNTRIES_LIST.slice(0, 7).map((c) => (
                <li key={c.code} className="flex items-center space-x-2">
                  <span>{c.flag}</span>
                  <button onClick={() => navigateTo('visa-eligibility')} className={`hover:text-gold-400 transition text-left ${activeTab === 'visa-eligibility' ? 'text-amber-400 font-bold' : ''}`}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Rights & Certifications */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Revival International Consultancy FZ-LLC. All Rights Reserved. Managed under Dubai Economic Department & MOHRE Regulations.</p>

          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-bit Encrypted</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
              <span>GDPR Compliant</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

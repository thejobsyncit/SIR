import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import {
  Building2, Phone, Mail, MapPin, Globe, Shield, Award,
  Send, MessageSquare, Linkedin, Twitter, Facebook, Instagram, Youtube, CheckCircle2
} from 'lucide-react';
import { COUNTRIES_LIST } from '../data/mockData';
import SITE_CONFIG from '../config/siteConfig';

export const Footer = ({ hideNewsletter = false }) => {
  const { navigateTo, setActiveModal, activeTab, isExamDetailsPage, user, openAuthModal } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleSubscribe = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setNewsletterMsg('');
    const cleanEmail = (newsletterEmail || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid corporate email address (e.g. name@company.com).');
      return;
    }

    setNewsletterStatus('loading');
    try {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            source: 'Newsletter: GCC Visa Laws & Executive Vacancies',
            type: 'newsletter_subscription'
          })
        });
      } catch {}

      setNewsletterStatus('success');
      setNewsletterMsg('Thank you for subscribing! You will receive our bi-weekly executive briefing.');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg('Subscription failed. Please try again.');
    }
  };

const isStudentAcademyTab = Boolean(
    activeTab && (
      activeTab === 'education-school-academy' ||
      activeTab === 'school-academy' ||
      activeTab === 'student-academy' ||
      activeTab === 'education-student-academy' ||
      activeTab === 'education/school-academy' ||
      activeTab === 'education/student-academy' ||
      activeTab === 'academy-for-school-students' ||
      activeTab === 'education/academy-for-school-students' ||
      activeTab.includes('school-academy') ||
      activeTab.includes('student-academy') ||
      activeTab.includes('academy-for-school-students')
    )
  );

  const isCareerGuidanceTab = Boolean(
    activeTab && (
      activeTab === 'education-school-career' ||
      activeTab === 'school-career' ||
      activeTab === 'education/school-career' ||
      activeTab === 'education-career-guidance' ||
      activeTab === 'career-guidance' ||
      activeTab === 'education/career-guidance' ||
      activeTab === 'school-student-career-guidance' ||
      activeTab === 'education-school-student-career-guidance' ||
      activeTab === 'education/school-student-career-guidance' ||
      activeTab.includes('school-career') ||
      activeTab.includes('career-guidance') ||
      activeTab.includes('school-student-career-guidance')
    )
  );

  const [isExamViewActive, setIsExamViewActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    return hash.includes('exam=') || hash.includes('exam-enquiry') || hash.includes('view=exam-enquiry');
  });

const [isStudentAcademyActive, setIsStudentAcademyActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    return (
      hash.includes('school-academy') ||
      hash.includes('student-academy') ||
      hash.includes('academy-for-school-students') ||
      path.includes('school-academy') ||
      path.includes('student-academy') ||
      path.includes('academy-for-school-students')
    );
  });

  const [isCareerGuidanceActive, setIsCareerGuidanceActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    return (
      hash.includes('school-career') ||
      hash.includes('career-guidance') ||
      hash.includes('school-student-career-guidance') ||
      path.includes('school-career') ||
      path.includes('career-guidance') ||
      path.includes('school-student-career-guidance')
    );
  });

  useEffect(() => {
    const checkPages = () => {
      const hash = typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '';
      const path = typeof window !== 'undefined' ? (window.location.pathname || '').toLowerCase() : '';

      const hasExamHash = hash.includes('exam=') || hash.includes('exam-enquiry') || hash.includes('view=exam-enquiry');
      const hasDomEl = Boolean(typeof document !== 'undefined' && document.getElementById('exam-enquiry-page'));
      setIsExamViewActive(hasExamHash || hasDomEl || Boolean(isExamDetailsPage));

      const hasCareerHash = 
        hash.includes('school-career') || 
        hash.includes('career-guidance') || 
        hash.includes('school-student-career-guidance');
      const hasCareerPath = 
        path.includes('school-career') || 
        path.includes('career-guidance') || 
        path.includes('school-student-career-guidance');
      const hasCareerEl = Boolean(typeof document !== 'undefined' && document.getElementById('career-guidance-page'));
      setIsCareerGuidanceActive(hasCareerHash || hasCareerPath || hasCareerEl);

      const hasAcademyHash = 
        hash.includes('school-academy') || 
        hash.includes('student-academy') || 
        hash.includes('academy-for-school-students');
      const hasAcademyPath = 
        path.includes('school-academy') || 
        path.includes('student-academy') || 
        path.includes('academy-for-school-students');
      const hasAcademyEl = Boolean(typeof document !== 'undefined' && (
        document.getElementById('student-academy-page') || 
        document.getElementById('student-academy-search') ||
        document.getElementById('browse-exams-section')
      ));
      setIsStudentAcademyActive(hasAcademyHash || hasAcademyPath || hasAcademyEl);

    };

    checkPages();
    window.addEventListener('hashchange', checkPages);
    window.addEventListener('popstate', checkPages);

    const observer = typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.body
      ? new MutationObserver(checkPages)
      : null;

    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('hashchange', checkPages);
      window.removeEventListener('popstate', checkPages);
      if (observer) observer.disconnect();
    };
  }, [isExamDetailsPage]);

  const shouldHideNewsletter = 
    hideNewsletter || 
    Boolean(isExamDetailsPage) || 
    isExamViewActive || 
    isCareerGuidanceTab || 
    isCareerGuidanceActive || 
    isStudentAcademyTab || 
    isStudentAcademyActive;

  const NavLink = ({ tab, label, onClick, isModal }) => {
    const isActive = !isModal && activeTab === tab;
    if (isModal) {
      return (
        <li>
          <button
            type="button"
            onClick={onClick}
            className={`hover:text-gold-400 transition flex items-center gap-2 ${isActive ? 'text-amber-400 font-bold' : ''}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600'}`}></span>
            <span className="text-left">{label}</span>
          </button>
        </li>
      );
    }

    return (
      <li>
        <a
          href={tab === 'home' ? '/' : `#${tab}`}
          onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
            else navigateTo(tab);
          }}
          className={`hover:text-gold-400 transition flex items-center gap-2 ${isActive ? 'text-amber-400 font-bold' : ''}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600'}`}></span>
          <span className="text-left">{label}</span>
        </a>
      </li>
    );
  };

  return (
    <footer className={`bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-300 ${shouldHideNewsletter ? 'pt-12 sm:pt-14' : 'pt-16'} pb-36 sm:pb-44 lg:pb-48 border-t border-slate-200 dark:border-navy-800 relative overflow-hidden`}>
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* Top Newsletter & Banner Callout (Omitted on Examination Details Pages) */}
        {!shouldHideNewsletter && (
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
                Subscribe to the Revival Executive Briefing. Curated bi-weekly analysis on GCC labor regulations, MOHRE attestation updates, and executive mobility.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus === 'error') setNewsletterStatus('idle');
                  }}
                  placeholder="Enter corporate email address..."
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 w-full sm:min-w-[260px] focus:outline-none focus:border-gold-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-gold-shimmer text-navy-950 font-bold text-xs px-6 py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 w-full sm:w-auto cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <span>{newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {newsletterStatus === 'success' && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{newsletterMsg}</span>
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-[11px] font-bold text-rose-500">
                  {newsletterMsg}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-200 dark:border-navy-800 text-xs">

          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <BrandLogoIcon className="w-10 h-10 shadow-md" />
              <div className="font-serif text-xl font-black text-navy-900 dark:text-white tracking-tight flex items-center gap-1.5 flex-wrap">
                The Revival <span className="text-gold-500 font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-50/50 dark:bg-navy-900/50 rounded">International</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed pr-4 font-medium">
              The Revival International is a premier international recruitment consultancy, executive search firm, and licensed manpower outsourcing vendor operating across India, UAE, GCC, Europe, and Asia.
            </p>

            <div className="space-y-2 pt-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span><strong>Global HQ:</strong> {SITE_CONFIG.offices[0].fullAddress}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>India Regional Hub:</strong> {SITE_CONFIG.offices[1].fullAddress}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`tel:${SITE_CONFIG.brand.supportPhone.replace(/\s+/g, '')}`} className="hover:text-gold-500 transition">{SITE_CONFIG.brand.supportPhone}</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`mailto:${SITE_CONFIG.brand.primaryEmail}`} className="hover:text-gold-500 transition">{SITE_CONFIG.brand.primaryEmail}</a>
              </div>
            </div>

            {/* Social Icons (Issue #2: Render verified channels only) */}
            <div className="flex space-x-3 pt-2">
              {Object.entries(SITE_CONFIG.social).some(([_, s]) => s.approved && s.url) ? (
                Object.entries(SITE_CONFIG.social).map(([key, soc]) => {
                  if (!soc.approved || !soc.url) return null;
                  const Icon = key === 'linkedin' ? Linkedin : key === 'twitter' ? Twitter : key === 'facebook' ? Facebook : key === 'instagram' ? Instagram : Youtube;
                  return (
                    <a
                      key={key}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={soc.ariaLabel}
                      aria-label={soc.ariaLabel}
                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-gold-400 hover:border-gold-500 transition"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })
              ) : (
                <div className="text-[11px] text-slate-500 font-medium">
                  Official verified social channels launching soon.
                </div>
              )}
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
              <NavLink tab="international-consulting" label="International Consulting" />
              <NavLink tab="education" label="Academic Advisory" />
              <NavLink tab="industries" label="Industries We Serve" />
              <NavLink tab="jobs" label="Browse Job Portal" />
              <NavLink tab="candidates" label="Candidate Hub" />
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
              <NavLink 
                isModal 
                label="AI Resume Analyzer" 
                onClick={() => {
                  if (!user) {
                    openAuthModal('login', 'candidate');
                  } else {
                    setActiveModal('ai-resume');
                  }
                }} 
              />
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

          {/* Col 5: Legal & Statutory Compliance (Issue #3) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider text-gold-500 border-b border-slate-200 dark:border-navy-800 pb-2">
              Legal & Compliance
            </h4>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-medium">
              <NavLink tab="legal/privacy-policy" label="Privacy Policy (Draft)" />
              <NavLink tab="legal/terms-of-use" label="Terms of Use" />
              <NavLink tab="legal/cookie-policy" label="Cookie Policy" />
              <NavLink tab="legal/refund-policy" label="Refund & Cancellation" />
              <NavLink tab="legal/candidate-consent" label="Candidate Data Consent" />
              <NavLink tab="fraud-awareness" label="Zero-Fee Placement Policy" />
            </ul>
          </div>

        </div>

        {/* Statutory Regulatory Licences Strip (Issue #10) */}
        <div className="py-6 border-b border-slate-200 dark:border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Commercial Registration</span>
            <p className="font-bold text-slate-900 dark:text-white">{SITE_CONFIG.licences.tradeLicence.label}</p>
            <span className="text-[10px] text-amber-500 font-semibold">{SITE_CONFIG.licences.tradeLicence.number} (Pending Legal Confirmation)</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">UAE Labor Compliance</span>
            <p className="font-bold text-slate-900 dark:text-white">{SITE_CONFIG.licences.mohreLicence.label}</p>
            <span className="text-[10px] text-amber-500 font-semibold">{SITE_CONFIG.licences.mohreLicence.number} (Pending Legal Confirmation)</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Emigration Oversight</span>
            <p className="font-bold text-slate-900 dark:text-white">{SITE_CONFIG.licences.meaLicence.label}</p>
            <span className="text-[10px] text-amber-500 font-semibold">{SITE_CONFIG.licences.meaLicence.number} (Pending Legal Confirmation)</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Quality Governance</span>
            <p className="font-bold text-slate-900 dark:text-white">{SITE_CONFIG.licences.isoCertification.standard}</p>
            <span className="text-[10px] text-emerald-500 font-semibold">Verified Active Standards</span>
          </div>
        </div>

        {/* Bottom Rights & Certifications */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Revival International Consultancy FZ-LLC. All Rights Reserved. Managed under Dubai Economic Department & MOHRE Regulations.</p>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigateTo('crm')}
              className="text-slate-400 dark:text-slate-500 hover:text-gold-500 transition text-[11px] underline"
            >
              Recruiter Staff Login
            </button>
            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-bit Encrypted</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
              <span>UAE PDPL & India DPDP Act 2023 Aligned</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

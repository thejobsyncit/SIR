import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-300 pt-10 sm:pt-12 pb-8 border-t border-slate-200 dark:border-navy-800 relative overflow-hidden text-xs">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 4-Column Layout with Vertical Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-0">

          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-5 lg:border-r border-slate-200 dark:border-navy-800 lg:pr-8 space-y-3.5">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigateTo('home')}>
              <BrandLogoIcon className="w-8 h-8 rounded-lg shadow-xs" />
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold text-navy-950 dark:text-white tracking-tight">The Revival</span>
                <span className="text-[#C89B27] dark:text-gold-400 font-sans text-xs font-bold uppercase tracking-widest">INTERNATIONAL</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal text-xs">
              The Revival International is a premier international recruitment consultancy, executive search firm, and licensed manpower outsourcing vendor operating across India, UAE, GCC, Europe, and Asia.
            </p>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#C89B27] shrink-0 mt-0.5" />
                <span><strong className="text-navy-950 dark:text-white font-semibold">Global HQ:</strong> Business Center, Meydan Free Zone, Nad Al Sheba, Dubai, United Arab Emirates</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong className="text-navy-950 dark:text-white font-semibold">India Regional Hub:</strong> The Revival International Corporate Center, Anna Salai, Chennai, Tamil Nadu 600002, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#C89B27] shrink-0" />
                <a href="tel:+919003475405" className="hover:text-gold-500 transition font-medium">+919003475405</a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#C89B27] shrink-0" />
                <a href="mailto:enquiry@therevivalinternational.com" className="hover:text-gold-500 transition font-medium">enquiry@therevivalinternational.com</a>
              </div>
            </div>

            {/* Social Icons (Instagram, Facebook, X, LinkedIn) */}
            <div className="flex items-center space-x-2.5 pt-1.5">
              <a
                href="#social-instagram"
                onClick={(e) => { e.preventDefault(); navigateTo('social-instagram'); }}
                aria-label="Instagram"
                title="The Revival International on Instagram"
                className="w-7 h-7 rounded-[7px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#social-facebook"
                onClick={(e) => { e.preventDefault(); navigateTo('social-facebook'); }}
                aria-label="Facebook"
                title="The Revival International on Facebook"
                className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#social-twitter"
                onClick={(e) => { e.preventDefault(); navigateTo('social-twitter'); }}
                aria-label="Twitter (X)"
                title="The Revival International on Twitter"
                className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#social-linkedin"
                onClick={(e) => { e.preventDefault(); navigateTo('social-linkedin'); }}
                aria-label="LinkedIn"
                title="The Revival International on LinkedIn"
                className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0 0-3.3 1.66 1.66 0 0 0 0 3.3m1.38 9.74V9.93H5.08v8.57h2.76z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="lg:col-span-2 lg:border-r border-slate-200 dark:border-navy-800 lg:px-6 space-y-3">
            <h4 className="font-bold text-navy-950 dark:text-white uppercase text-xs tracking-wider pb-2 border-b border-slate-200 dark:border-navy-800">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#home" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className="hover:text-gold-500 transition">Home</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#jobs" onClick={(e) => { e.preventDefault(); navigateTo('jobs'); }} className="hover:text-gold-500 transition">Jobs</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#services" onClick={(e) => { e.preventDefault(); navigateTo('services'); }} className="hover:text-gold-500 transition">Services</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#visa-eligibility" onClick={(e) => { e.preventDefault(); navigateTo('visa-eligibility'); }} className="hover:text-gold-500 transition">Visa Eligibility</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#background-verification" onClick={(e) => { e.preventDefault(); navigateTo('background-verification'); }} className="hover:text-gold-500 transition">Verification</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#about" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} className="hover:text-gold-500 transition">About Us</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }} className="hover:text-gold-500 transition">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Column 3: SERVICES */}
          <div className="lg:col-span-3 lg:border-r border-slate-200 dark:border-navy-800 lg:px-6 space-y-3">
            <h4 className="font-bold text-navy-950 dark:text-white uppercase text-xs tracking-wider pb-2 border-b border-slate-200 dark:border-navy-800">
              SERVICES
            </h4>
            <ul className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#international-consulting" onClick={(e) => { e.preventDefault(); navigateTo('international-consulting'); }} className="hover:text-gold-500 transition">International Consulting</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#education/college-admission-assistance" onClick={(e) => { e.preventDefault(); navigateTo('education/college-admission-assistance'); }} className="hover:text-gold-500 transition">College Admission Assistance</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#education/school-student-career-guidance" onClick={(e) => { e.preventDefault(); navigateTo('education/school-student-career-guidance'); }} className="hover:text-gold-500 transition">School Student Career Guidance</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#education/international-admissions" onClick={(e) => { e.preventDefault(); navigateTo('education/international-admissions'); }} className="hover:text-gold-500 transition">International Admissions</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#education/academy-for-school-students" onClick={(e) => { e.preventDefault(); navigateTo('education/academy-for-school-students'); }} className="hover:text-gold-500 transition">Academy for School Students</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#education/executive-seminars-and-language-test-preparation" onClick={(e) => { e.preventDefault(); navigateTo('education/executive-seminars-and-language-test-preparation'); }} className="hover:text-gold-500 transition truncate" title="Executive Seminars & Language Test Preparation">Executive Seminars & Language...</a>
              </li>
            </ul>
          </div>

          {/* Column 4: LEGAL & COMPLIANCE */}
          <div className="lg:col-span-2 lg:pl-6 space-y-3">
            <h4 className="font-bold text-navy-950 dark:text-white uppercase text-xs tracking-wider pb-2 border-b border-slate-200 dark:border-navy-800">
              LEGAL & COMPLIANCE
            </h4>
            <ul className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#privacy-policy" onClick={(e) => { e.preventDefault(); navigateTo('legal/privacy-policy'); }} className="hover:text-gold-500 transition">Privacy Policy</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#terms-of-use" onClick={(e) => { e.preventDefault(); navigateTo('legal/terms-of-use'); }} className="hover:text-gold-500 transition">Terms & Condition</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-navy-950 dark:text-slate-400 font-black text-xs leading-none">•</span>
                <a href="#report-issue" onClick={(e) => { e.preventDefault(); navigateTo('report-issue'); }} className="hover:text-gold-500 transition">Report Issue</a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};

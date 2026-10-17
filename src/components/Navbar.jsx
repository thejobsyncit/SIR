import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { 
  Building2, Globe, Phone, Mail, Moon, Sun, Search, 
  User, Briefcase, ChevronDown, ChevronRight, Menu, X, Shield, Award, Sparkles, LogIn,
  GraduationCap, Compass, BookOpen, FileCheck, ArrowRight, Users, FileText
} from 'lucide-react';
import { SERVICES_LIST, INDUSTRIES_LIST } from '../data/mockData';

export const Navbar = () => {
  const { darkMode, toggleDarkMode, language, setLanguage, t, activeTab, navigateTo, navigateToService, navigateToIndustry, setActiveModal, openAuthModal, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuType, setMegaMenuType] = useState(null); // 'services' | 'industries' | null

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'services', label: t('nav.services'), hasMega: 'services' },
    { id: 'industries', label: t('nav.industries'), hasMega: 'industries' },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'visa-eligibility', label: t('nav.visa') },
    { id: 'background-verification', label: t('nav.verification') },
    { id: 'contact', label: t('nav.contact') }
  ];

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Corporate Bar */}
      <div className="bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-gold-500" />
            <span>{t('nav.dubaiHQ')}: <strong className="text-slate-900 dark:text-white">+971 4 123 4567</strong></span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-gold-500" />
            <span>info@revivalinternational.com</span>
          </div>
          <div className="hidden lg:flex items-center space-x-1 text-gold-400">
            <Award className="w-3.5 h-3.5" />
            <span>{t('nav.mohreBadge')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">


          {/* Quick AI Tools Button */}
          <button 
            onClick={() => setActiveModal('ai-resume')}
            className="hidden sm:flex items-center space-x-1.5 bg-gold-500/20 text-gold-400 hover:bg-gold-500 hover:text-slate-900 dark:text-white px-2.5 py-1 rounded text-xs font-medium transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t('nav.aiResume')}</span>
          </button>

          {/* Language Selector */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-navy-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-gold-500 font-bold"
          >
            <option value="EN">🇺🇸 EN</option>
            <option value="AR">🇦🇪 العربية</option>
            <option value="FR">🇫🇷 FR</option>
            <option value="DE">🇩🇪 DE</option>
          </select>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-gold-400 transition"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Glass Header */}
      <nav className="glass-card bg-white/90 dark:bg-navy-900/90 shadow-glass backdrop-blur-md border-b border-white/20 dark:border-navy-800 px-4 sm:px-8 py-3 transition">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div 
            onClick={() => navigateTo('home')} 
            className="cursor-pointer flex items-center space-x-2 sm:space-x-3.5 group"
          >
            <BrandLogoIcon className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition duration-300 shadow-md" />
            <div>
              <div className="font-serif text-xl sm:text-2xl font-black tracking-tight text-navy-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                Revival <span className="inline-block text-gold-500 font-sans text-[8px] sm:text-[11px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 bg-slate-50 dark:bg-navy-900 text-gold-400 rounded-md shadow-sm">International</span>
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 font-extrabold">Dubai • GCC • Worldwide</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => (
              <div 
                key={item.id}
                className="relative"
                onMouseEnter={() => item.hasMega && setMegaMenuType(item.hasMega)}
                onMouseLeave={() => setMegaMenuType(null)}
              >
                <a
                  href={item.id === 'home' ? '/' : `#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.id);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition flex items-center space-x-1 ${
                    activeTab === item.id 
                      ? 'text-gold-500 bg-gold-500/10 dark:bg-gold-500/20 font-bold' 
                      : 'text-navy-900 dark:text-slate-200 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />}
                </a>

                {/* Compact Modern Dropdown Menus */}
                {megaMenuType === item.hasMega && (
                  <div 
                    className={`absolute top-full pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                      item.hasMega === 'services'
                        ? 'left-1/2 -translate-x-1/2 sm:-translate-x-1/3 w-[92vw] sm:w-[490px] max-w-[95vw]'
                        : 'left-1/2 -translate-x-1/2 w-[88vw] sm:w-[360px] max-w-[92vw]'
                    }`}
                  >
                    <div className="relative bg-white dark:bg-[#0c1c32] rounded-xl p-3 sm:p-3.5 shadow-xl border border-slate-200/90 dark:border-navy-700 overflow-hidden">
                      
                      {/* Slim Gold Accent Indicator */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500/20 via-gold-500 to-gold-500/20" />

                      {/* SERVICES DROPDOWN - COMPACT 2-COLUMN */}
                      {item.hasMega === 'services' && (
                        <div>
                          {/* Slim Header */}
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-navy-800">
                            <span className="text-[11px] font-black uppercase tracking-wider text-navy-950 dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                              <span>Services Portfolio</span>
                            </span>
                            <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20 font-mono">
                              24 Services
                            </span>
                          </div>

                          {/* 2-Column Compact Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            
                            {/* Column 1: Academic Advisory */}
                            <div className="space-y-0.5">
                              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gold-700 dark:text-gold-400 flex items-center gap-1 border-b border-gold-500/15 mb-1">
                                <GraduationCap className="w-3 h-3 text-gold-500" />
                                <span>Academic Advisory</span>
                              </div>
                              {[
                                { id: 'intl-consult', title: 'International Consulting' },
                                { id: 'college-adm', title: 'College Admissions' },
                                { id: 'school-career', title: 'Career Guidance' },
                                { id: 'intl-adm', title: 'Intl Admissions' },
                                { id: 'school-academy', title: 'Student Academy' },
                                { id: 'exec-seminars-lang', title: 'Language & Test Prep' }
                              ].map((srv) => (
                                <a
                                  key={srv.id}
                                  href={`#education-${srv.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigateTo(`education-${srv.id}`);
                                    setMegaMenuType(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gold-50 dark:hover:bg-navy-800/80 text-slate-700 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold-400 font-medium transition flex items-center justify-between group"
                                >
                                  <span className="truncate text-[11px]">• {srv.title}</span>
                                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-gold-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                </a>
                              ))}
                            </div>

                            {/* Column 2: Recruitment & HR */}
                            <div className="space-y-0.5">
                              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 border-b border-slate-200 dark:border-navy-700 mb-1">
                                <Briefcase className="w-3 h-3 text-gold-500" />
                                <span>Executive & HR</span>
                              </div>
                              {[
                                { id: 'exec-search', title: 'Executive Search' },
                                { id: 'intl-rec', title: 'International Recruitment' },
                                { id: 'dom-rec', title: 'Domestic Recruitment' },
                                { id: 'perm-staff', title: 'Permanent Staffing' },
                                { id: 'contract-staff', title: 'Contract Staffing' },
                                { id: 'visa-assist', title: 'Visa & Work Permits' }
                              ].map((srv) => (
                                <a
                                  key={srv.id}
                                  href={`#services`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigateToService(srv.id);
                                    setMegaMenuType(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-navy-800/80 text-slate-700 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold-400 font-medium transition flex items-center justify-between group"
                                >
                                  <span className="truncate text-[11px]">• {srv.title}</span>
                                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-gold-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                </a>
                              ))}
                            </div>

                          </div>

                          {/* Slim Bottom Actions */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center text-[11px] px-1">
                            <a
                              href="#education"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateTo('education');
                                setMegaMenuType(null);
                              }}
                              className="text-gold-700 dark:text-gold-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>🎓 Academic Directory</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                            <a
                              href="#services"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateTo('services');
                                setMegaMenuType(null);
                              }}
                              className="text-slate-600 dark:text-slate-400 font-bold hover:text-navy-950 dark:hover:text-white flex items-center gap-1"
                            >
                              <span>💼 All 24 Services</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* INDUSTRIES DROPDOWN - COMPACT 2-COLUMN */}
                      {item.hasMega === 'industries' && (
                        <div>
                          {/* Slim Header */}
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-navy-800">
                            <span className="text-[11px] font-black uppercase tracking-wider text-navy-950 dark:text-white flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gold-500" />
                              <span>Sectors & Industries</span>
                            </span>
                            <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20 font-mono">
                              12 Sectors
                            </span>
                          </div>

                          {/* 2-Column Compact Grid */}
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {INDUSTRIES_LIST.map((ind) => (
                              <button
                                key={ind.id}
                                onClick={() => {
                                  navigateToIndustry(ind.id);
                                  setMegaMenuType(null);
                                }}
                                className="text-left px-2 py-1.5 rounded-md hover:bg-gold-50 dark:hover:bg-navy-800/80 text-slate-700 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold-400 transition flex items-center justify-between group"
                              >
                                <span className="text-[11px] font-medium truncate">• {ind.name}</span>
                                <span className="text-[9px] text-slate-400 group-hover:text-gold-500 font-mono shrink-0 ml-1">
                                  {ind.openJobs}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Slim Bottom Link */}
                          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-navy-800 text-center">
                            <button
                              onClick={() => {
                                navigateTo('jobs');
                                setMegaMenuType(null);
                              }}
                              className="text-[11px] font-bold text-gold-700 dark:text-gold-400 hover:underline flex items-center justify-center gap-1 w-full"
                            >
                              <span>Explore All Industry Vacancies</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action CTAs: Matching Image 1 Layout with Revival Theme Colors (Gold Shimmer & Gold Outline) */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 dark:bg-navy-950/90 border border-slate-200 dark:border-gold-500/40 px-3.5 py-1.5 rounded-full text-xs shadow-md">
                <div className="w-7 h-7 rounded-full bg-gold-500 text-navy-950 font-bold flex items-center justify-center text-xs shadow-gold-glow">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-white leading-tight text-[11px] truncate max-w-[120px]">{user.name}</p>
                  <span className="text-[9px] text-gold-400 font-semibold uppercase">{user.role}</span>
                </div>
                <button
                  onClick={() => navigateTo(user.role === 'employer' ? 'employers' : 'candidates')}
                  className="px-2.5 py-1 bg-gold-500/20 hover:bg-gold-500 hover:text-slate-900 dark:text-white text-gold-400 rounded-full text-[10px] font-bold transition ml-1"
                >
                  Portal
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 hover:text-slate-900 dark:text-white text-rose-300 rounded-full text-[10px] font-bold transition"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                {/* Register button: Outline style matching Image 1 layout with website Revival Gold theme */}
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-navy-900 dark:text-gold-400 bg-white dark:bg-navy-900 border-2 border-gold-500 hover:bg-gold-500/10 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-gold-500" />
                  <span>Register</span>
                </button>
                
                {/* Sign In button: Solid style matching Image 1 layout with website Revival Gold theme */}
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2 rounded-full text-xs font-bold text-slate-900 dark:text-white bg-gold-500 hover:bg-gold-600 shadow-gold-glow transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span>Sign In</span>
                </button>


              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white shadow-sm active:scale-95 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer - Premium Glassmorphism */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-4 border-t border-slate-200/50 dark:border-navy-700/50 flex flex-col gap-2.5 animate-in slide-in-from-top-4 duration-300">
            
            {/* Dedicated Academic Advisory Mobile Card */}
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gold-700 dark:text-gold-400 uppercase tracking-wide">
                  🎓 Academic & Education Advisory
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                  NEW
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: 'intl-consult', label: 'Intl Consulting' },
                  { id: 'college-adm', label: 'College Admissions' },
                  { id: 'school-career', label: 'Career Guidance' },
                  { id: 'intl-adm', label: 'Intl Admissions' },
                  { id: 'school-academy', label: 'Student Academy' },
                  { id: 'exec-seminars-lang', label: 'Language Tests' }
                ].map((s) => (
                  <a
                    key={s.id}
                    href={`#education-${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(`education-${s.id}`);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left p-1.5 rounded-lg bg-white/70 dark:bg-navy-900/80 text-navy-900 dark:text-slate-200 font-semibold truncate hover:text-gold-500 block"
                  >
                    • {s.label}
                  </a>
                ))}
              </div>
              <a
                href="#education"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('education');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-lg shadow-gold-glow text-center block"
              >
                Explore Education Directory →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {navItems.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.id === 'home' ? '/' : `#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all duration-300 active:scale-95 shadow-sm block ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-slate-900 dark:text-white font-bold shadow-gold-glow'
                      : 'bg-slate-50 dark:bg-navy-800/80 text-navy-900 dark:text-slate-200 border border-slate-200 dark:border-navy-700 hover:border-slate-200 dark:border-gold-500/50'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex gap-2.5 mt-2 border-t border-slate-200/50 dark:border-navy-700/50 pt-4">
              {!user ? (
                <>
                  <button
                    onClick={() => { openAuthModal('register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-3.5 bg-white dark:bg-navy-900 border-2 border-gold-500 text-gold-600 dark:text-gold-400 font-bold rounded-xl text-xs shadow-sm active:scale-95 transition flex items-center justify-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                  <button
                    onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-3.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl text-xs shadow-gold-glow active:scale-95 transition flex items-center justify-center space-x-1"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold rounded-xl text-xs shadow-sm active:scale-95 transition"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

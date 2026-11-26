import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import {
  Building2, Globe, Phone, Mail, Moon, Sun, Search,
  User, Briefcase, ChevronDown, ChevronRight, Menu, X, Shield, Award, Sparkles, LogIn, LogOut, LayoutDashboard,
  GraduationCap, Compass, BookOpen, FileCheck, ArrowRight, Users, FileText,
  ShieldCheck, UserCheck, Languages, School, Flame, HeartPulse, Utensils, Code, Wrench, Factory,
  ShoppingBag, Truck, Plane, Landmark
} from 'lucide-react';
import { SERVICES_LIST, INDUSTRIES_LIST } from '../data/mockData';

const INDUSTRY_ICON_MAP = {
  'const': Building2,
  'oil-gas': Flame,
  'health': HeartPulse,
  'hosp': Utensils,
  'it-sw': Code,
  'eng': Wrench,
  'mfg': Factory,
  'rtl': ShoppingBag,
  'log': Truck,
  'avi': Plane,
  'bnk': Landmark,
  'edu': GraduationCap
};

export const Navbar = () => {
  const { darkMode, toggleDarkMode, language, setLanguage, t, activeTab, navigateTo, navigateToService, navigateToIndustry, setActiveModal, openAuthModal, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuType, setMegaMenuType] = useState(null); // 'services' | 'industries' | null
  const menuTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuEnter = (type) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setMegaMenuType(type);
  };

  const handleMenuLeave = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    menuTimeoutRef.current = setTimeout(() => {
      setMegaMenuType(null);
    }, 240);
  };

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'services', label: t('nav.services'), hasMega: 'services' },
    { id: 'visa-verification', label: 'Visa & Verification' },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') }
  ];

  const isNavActive = (itemId) => {
    if (activeTab === itemId) return true;
    if (itemId === 'visa-verification' && (
      activeTab === 'visa-eligibility' ||
      activeTab === 'background-verification' ||
      activeTab === 'visa-and-verification' ||
      activeTab === 'verification'
    )) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Main Glass Header */}
      <nav className="bg-[#FFFFFF] dark:bg-navy-900/95 shadow-sm backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 px-3 sm:px-6 lg:px-4 2xl:px-8 py-2.5 sm:py-3 transition">
        <div className="max-w-[1440px] w-full mx-auto flex justify-between items-center gap-2 sm:gap-4 lg:gap-5 xl:gap-7 2xl:gap-8">

          {/* Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="cursor-pointer flex items-center space-x-2 sm:space-x-3 group shrink-0"
          >
            <BrandLogoIcon className="w-9 h-9 sm:w-11 sm:h-11 group-hover:scale-105 transition duration-300 shadow-md" />
            <div>
              <div className="font-serif text-lg sm:text-2xl font-black tracking-tight text-[#0B1B33] dark:text-white flex items-center gap-1.5 sm:gap-2">
                The Revival <span className="inline-block text-gold-500 font-sans text-[8px] sm:text-[11px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 bg-slate-50 dark:bg-navy-900 text-gold-400 rounded-md shadow-sm">International</span>
              </div>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 font-extrabold">India • GCC • Worldwide</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="desktop-nav-links hidden nav:flex items-center space-x-1 xl:space-x-1.5 2xl:space-x-2 shrink-0">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => item.hasMega && handleMenuEnter(item.hasMega)}
                onMouseLeave={() => item.hasMega && handleMenuLeave()}
              >
                <a
                  href={item.id === 'home' ? '/' : `#${item.id}`}
                  onClick={(e) => {
                    if (item.hasMega) {
                      e.preventDefault();
                      setMegaMenuType((prev) => (prev === item.hasMega ? null : item.hasMega));
                    } else {
                      e.preventDefault();
                      navigateTo(item.id);
                    }
                  }}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-[13px] xl:text-[14px] font-semibold tracking-normal transition flex items-center space-x-1.5 cursor-pointer select-none whitespace-nowrap ${isNavActive(item.id)
                    ? 'text-gold-600 dark:text-gold-400 bg-gold-500/15 dark:bg-gold-500/20 font-bold shadow-xs'
                    : 'text-[#0B1B33] dark:text-slate-100 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.hasMega && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${megaMenuType === item.hasMega ? 'rotate-180 text-gold-500' : ''}`} />
                  )}
                </a>

                {/* Mega Menu Dropdown - Original High-Contrast Design */}
                {megaMenuType === item.hasMega && (
                  <div
                    onMouseEnter={() => handleMenuEnter(item.hasMega)}
                    onMouseLeave={() => handleMenuLeave()}
                    className={`absolute top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 left-1/2 -translate-x-1/2 w-[92vw] ${item.hasMega === 'industries' ? 'sm:w-[400px] md:w-[420px]' : item.hasMega === 'services' ? 'sm:w-[490px] md:w-[530px]' : 'sm:w-[320px] md:w-[340px]'
                      } max-w-[95vw]`}
                  >
                    <div className="relative bg-white dark:bg-[#0a1628] rounded-2xl p-3 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)] border border-slate-200 dark:border-navy-700 overflow-hidden">
                      {/* Slim Gold Accent Indicator */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500/20 via-gold-500 to-gold-500/20" />

                      {/* SERVICES DROPDOWN - 6 CORE ACADEMIC & ADVISORY SERVICES */}
                      {item.hasMega === 'services' && (
                        <div className="space-y-2.5">
                          {/* Elegant Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-600 dark:text-gold-400">
                                <GraduationCap className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[10.5px] font-black uppercase tracking-wider text-navy-950 dark:text-white block leading-tight">
                                  Academic & Global Advisory
                                </span>
                                <span className="text-[9.5px] text-slate-400 font-medium block">
                                  Certified International Education & Executive Pathways
                                </span>
                              </div>
                            </div>
                            <span className="text-[9.5px] font-extrabold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20 font-mono flex items-center gap-1.5 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>6 Services</span>
                            </span>
                          </div>

                          {/* 6 Services Grid (2 Columns x 3 Rows) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              {
                                id: 'intl-consult',
                                title: 'International Consulting',
                                tagline: 'Global Destination & Strategic Planning',
                                icon: Globe,
                                href: '/international-consulting',
                                tab: 'international-consulting',
                                badge: 'Global'
                              },
                              {
                                id: 'college-adm',
                                title: 'College Admission Assistance',
                                tagline: 'UG & PG Institutional Placements',
                                icon: GraduationCap,
                                href: '/education/college-admission-assistance',
                                tab: 'education-college-adm',
                                badge: 'Admissions'
                              },
                              {
                                id: 'school-career',
                                title: 'School Student Career Guidance',
                                tagline: 'Aptitude Evaluation & Stream Selection',
                                icon: Compass,
                                href: '/education/school-student-career-guidance',
                                tab: 'education-school-career',
                                badge: 'Guidance'
                              },
                              {
                                id: 'intl-adm',
                                title: 'International Admissions',
                                tagline: 'University Applications & Visa Filing',
                                icon: Plane,
                                href: '/education/international-admissions',
                                tab: 'education-intl-adm',
                                badge: 'Worldwide'
                              },
                              {
                                id: 'school-academy',
                                title: 'Academy for School Students',
                                tagline: 'Enrichment, Study Skills & Speaking',
                                icon: School,
                                href: '/education/academy-for-school-students',
                                tab: 'education-school-academy',
                                badge: 'Academy'
                              },
                              {
                                id: 'exec-seminars-lang',
                                title: 'Executive Seminars & Language Prep',
                                tagline: 'IELTS, OET, DET Preparation & Seminars',
                                icon: Languages,
                                href: '/education/executive-seminars-and-language-test-preparation',
                                tab: 'education-exec-seminars-lang',
                                badge: 'Testing'
                              }
                            ].map((srv) => {
                              const SrvIcon = srv.icon;
                              return (
                                <a
                                  key={srv.id}
                                  href={srv.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigateTo(srv.tab);
                                    setMegaMenuType(null);
                                  }}
                                  className="p-2 rounded-xl border border-slate-200/80 dark:border-navy-800 hover:border-gold-500/50 bg-slate-50 dark:bg-navy-900 hover:bg-gold-500/10 dark:hover:bg-navy-800 transition-all duration-200 group flex items-center gap-2 cursor-pointer text-left"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-gold-500/15 dark:bg-gold-500/15 border border-gold-500/25 text-gold-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors flex items-center justify-center shrink-0">
                                    <SrvIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-navy-950 dark:text-slate-100 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors block leading-tight truncate">
                                      {srv.title}
                                    </span>
                                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors truncate mt-0.5">
                                      {srv.tagline}
                                    </p>
                                  </div>
                                </a>
                              );
                            })}
                          </div>

                          {/* Slim Bottom Action Bar */}
                          <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs px-1">
                            <button
                              onClick={() => {
                                navigateTo('services');
                                setMegaMenuType(null);
                              }}
                              className="text-[11px] font-bold text-gold-700 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 flex items-center gap-1.5 cursor-pointer group"
                            >
                              <span>Explore All 6 Services</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveModal('education-enquiry');
                                setMegaMenuType(null);
                              }}
                              className="text-[10.5px] font-bold bg-gold-shimmer hover:opacity-95 text-navy-950 px-3 py-1 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-navy-950" />
                              <span>Enquire Now</span>
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

          {/* Right Header Actions & Mobile Menu Wrapper */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Selector (Pill format matching Profile design) */}
            <div className="relative hidden md:inline-flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white dark:bg-navy-900 border-2 border-gold-500/40 hover:border-gold-500 pl-3.5 pr-8 py-1.5 rounded-full text-xs font-bold text-[#0B1B33] dark:text-white shadow-md transition-all active:scale-95 cursor-pointer focus:outline-none focus:border-gold-500"
              >
                <option value="EN">🇺🇸 EN</option>
                <option value="AR">🇦🇪 AR</option>
                <option value="FR">🇫🇷 FR</option>
                <option value="DE">🇩🇪 DE</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Dark Mode Toggle (Squircle shape with gold border & white inside) */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-xl bg-white dark:bg-navy-900 border-2 border-gold-500/40 hover:border-gold-500 text-slate-700 dark:text-gold-400 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Action CTAs: Matching Master Logged-Out Layout with Revival Theme Colors */}
            <div className="hidden sm:flex items-center justify-start shrink-0">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  {/* Interactive Profile Pill Trigger */}
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-white dark:bg-navy-900 border-2 border-gold-500/40 hover:border-gold-500 pl-1.5 pr-3 py-1 rounded-full text-xs shadow-md transition-all active:scale-95 cursor-pointer group"
                    title="Account Menu"
                  >
                    {/* User Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden border border-white dark:border-navy-900">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>

                    {/* Username & Role */}
                    <div className="text-left leading-tight shrink-0 max-w-[95px]">
                      <p className="font-bold text-[#0B1B33] dark:text-white text-xs truncate">
                        {user.name}
                      </p>
                      <span className="text-[9px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider block truncate">
                        {user.role}
                      </span>
                    </div>

                    {/* Animated Chevron Arrow */}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-gold-500' : ''}`} />
                  </button>

                  {/* User Profile & Actions Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 p-2 z-50 overflow-hidden"
                      >
                        {/* User Profile Header */}
                        <div className="p-3 bg-slate-50 dark:bg-navy-800/80 rounded-xl mb-1.5 border border-slate-100 dark:border-navy-700/50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-navy-900 dark:text-white text-xs truncate">
                                {user.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                {user.email || 'Candidate Account'}
                              </p>
                              <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 uppercase tracking-wider">
                                {user.role === 'employer' ? 'Corporate Employer' : 'Verified Candidate'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Navigation Actions */}
                        <div className="space-y-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo(user?.role === 'employer' ? 'employers' : 'candidates');
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition flex items-center gap-2.5 cursor-pointer group"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gold-500 group-hover:scale-110 transition shrink-0" />
                            <span className="truncate">Candidate Dashboard</span>
                          </button>

                          {(user?.role === 'admin' || user?.email?.toLowerCase() === 'thejobsyncit@gmail.com') && (
                            <button
                              type="button"
                              onClick={() => {
                                navigateTo('crm');
                                setUserMenuOpen(false);
                              }}
                              className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition flex items-center gap-2.5 cursor-pointer group"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition shrink-0" />
                              <span className="truncate">Super Admin CRM</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              navigateTo('jobs');
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition flex items-center gap-2.5 cursor-pointer group"
                          >
                            <Briefcase className="w-4 h-4 text-gold-500 group-hover:scale-110 transition shrink-0" />
                            <span className="truncate">Browse Open Vacancies</span>
                          </button>
                        </div>

                        {/* Divider */}
                        <div className="my-1.5 border-t border-slate-100 dark:border-navy-800" />

                        {/* Logout Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setShowSignOutModal(true);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2.5 cursor-pointer group"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition shrink-0" />
                          <span>Sign Out (Logout)</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3.5">
                  {/* Register button (Matching gold border reference from dark mode button) */}
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 rounded-full text-xs font-bold text-[#0B1B33] dark:text-gold-400 bg-white dark:bg-navy-900 border-2 border-gold-500/40 hover:border-gold-500 hover:bg-gold-500/10 transition-all active:scale-95 flex items-center space-x-1.5 shadow-md cursor-pointer whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 text-gold-500" />
                    <span>Register</span>
                  </button>

                  {/* Sign In button (Matching gold border reference from dark mode button) */}
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-5 py-2 rounded-full text-xs font-bold text-[#0B1B33] dark:text-navy-950 bg-[#D9AF2B] hover:bg-[#c99f24] border-2 border-gold-500/40 hover:border-gold-500 shadow-gold-glow transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#0B1B33]" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="mobile-nav-toggle nav:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white shadow-sm active:scale-95 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Menu Drawer - Premium Glassmorphism */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer nav:hidden mt-3 pt-4 border-t border-slate-200/50 dark:border-navy-700/50 flex flex-col gap-2.5 animate-in slide-in-from-top-4 duration-300">

            {/* Mobile Language & Theme Controls */}
            <div className="flex items-center justify-between gap-2.5 p-2 bg-slate-50 dark:bg-navy-800/60 rounded-2xl border border-slate-200 dark:border-navy-700">
              <div className="relative flex-1">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-navy-900 border-2 border-gold-500/40 text-slate-800 dark:text-white rounded-full pl-3.5 pr-8 py-1.5 text-xs font-bold cursor-pointer shadow-xs focus:outline-none"
                >
                  <option value="EN">🇺🇸 English (EN)</option>
                  <option value="AR">🇦🇪 العربية (AR)</option>
                  <option value="FR">🇫🇷 Français (FR)</option>
                  <option value="DE">🇩🇪 Deutsch (DE)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-navy-900 text-slate-700 dark:text-gold-400 border-2 border-gold-500/40 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-gold-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            {/* Dedicated Academic Advisory Mobile Card */}
            <div className="p-3.5 bg-gradient-to-br from-gold-500/10 via-amber-500/5 to-transparent border border-gold-500/30 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                  <span>Academic & Advisory Services</span>
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  6 Pathways
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: 'intl-consult', label: 'International Consulting', icon: Globe, href: '/international-consulting', tab: 'international-consulting' },
                  { id: 'college-adm', label: 'College Admission Assistance', icon: GraduationCap, href: '/education/college-admission-assistance', tab: 'education-college-adm' },
                  { id: 'school-career', label: 'School Student Career Guidance', icon: Compass, href: '/education/school-student-career-guidance', tab: 'education-school-career' },
                  { id: 'intl-adm', label: 'International Admissions', icon: Plane, href: '/education/international-admissions', tab: 'education-intl-adm' },
                  { id: 'school-academy', label: 'Academy for School Students', icon: School, href: '/education/academy-for-school-students', tab: 'education-school-academy' },
                  { id: 'exec-seminars-lang', label: 'Executive Seminars & Language Prep', icon: Languages, href: '/education/executive-seminars-and-language-test-preparation', tab: 'education-exec-seminars-lang' }
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <a
                      key={s.id}
                      href={s.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo(s.tab);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left p-2 rounded-xl bg-white/80 dark:bg-navy-900/90 border border-slate-100 dark:border-navy-800 text-navy-950 dark:text-slate-200 font-semibold truncate hover:text-gold-500 flex items-center gap-2 block"
                    >
                      <div className="w-5 h-5 rounded-md bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                        <SIcon className="w-3 h-3" />
                      </div>
                      <span className="truncate">{s.label}</span>
                    </a>
                  );
                })}
              </div>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('services');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow text-center block"
              >
                Explore All 6 Services →
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
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all duration-300 active:scale-95 shadow-sm block ${isNavActive(item.id)
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
                    className="flex-1 h-[44px] px-4 rounded-full border-2 border-gold-500/40 hover:border-gold-500 bg-white text-navy-950 dark:bg-navy-900 dark:text-gold-400 font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer select-none"
                    aria-label="Register Account"
                  >
                    <User className="w-[18px] h-[18px] text-gold-500 dark:text-gold-400 shrink-0" strokeWidth={2} />
                    <span>Register</span>
                  </button>
                  <button
                    onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                    className="flex-1 h-[44px] px-4 rounded-full bg-gold-500 hover:bg-[#c29d2b] dark:bg-gold-500 dark:hover:bg-[#dfb93e] border-2 border-gold-500/40 hover:border-gold-500 text-navy-950 dark:text-white font-bold text-sm shadow-[0_2px_14px_rgba(212,175,55,0.35)] dark:shadow-[0_0_24px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer select-none"
                    aria-label="Sign In to Portal"
                  >
                    <LogIn className="w-[18px] h-[18px] text-navy-950 dark:text-white shrink-0" strokeWidth={2.2} />
                    <span>Sign In</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-navy-900 border border-[#E0B32D] dark:border-gold-500/40 rounded-2xl shadow-[0_4px_14px_rgba(15,23,42,0.10)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#D9AF2B] text-[#0B1B33] font-bold flex items-center justify-center text-xs shadow-sm shrink-0 overflow-hidden border border-gold-500/30">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="text-left leading-tight">
                        <p className="font-semibold text-[#0B1B33] dark:text-white text-xs truncate max-w-[150px]">
                          {user.name}
                        </p>
                        <span className="text-[10px] text-[#C99A00] dark:text-gold-400 font-bold uppercase tracking-wider block">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigateTo(user?.role === 'employer' ? 'employers' : 'candidates'); setMobileMenuOpen(false); }}
                      className="px-3 py-1.5 bg-[#F8F1D9] hover:bg-[#F0E3BD] dark:bg-gold-500/20 text-[#B88A00] dark:text-gold-400 border border-[#E0B32D] dark:border-gold-500/40 rounded-full text-xs font-semibold transition cursor-pointer"
                    >
                      Portal
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowSignOutModal(true); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-[#F8E7EB] hover:bg-[#F2D6DC] dark:bg-rose-500/20 text-[#B83250] dark:text-rose-300 border border-[#F0C9D2] dark:border-rose-500/40 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to sign out of your account? Your active session will be ended.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
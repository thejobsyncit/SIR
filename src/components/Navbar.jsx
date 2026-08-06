import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { 
  Building2, Globe, Phone, Mail, Moon, Sun, Search, 
  User, Briefcase, ChevronDown, Menu, X, Shield, Award, Sparkles, LogIn
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
      <div className="bg-navy-950 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-navy-800 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-gold-500" />
            <span>{t('nav.dubaiHQ')}: <strong className="text-white">+971 4 123 4567</strong></span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-gold-500" />
            <span>info@sirrecruitment.com</span>
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
            className="hidden sm:flex items-center space-x-1.5 bg-gold-500/20 text-gold-400 hover:bg-gold-500 hover:text-navy-950 px-2.5 py-1 rounded text-xs font-medium transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t('nav.aiResume')}</span>
          </button>

          {/* Language Selector */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-navy-900 text-slate-200 border border-navy-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-gold-500 font-bold"
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
            className="cursor-pointer flex items-center space-x-3.5 group"
          >
            <BrandLogoIcon className="w-12 h-12 group-hover:scale-105 transition duration-300 shadow-md" />
            <div>
              <div className="font-serif text-2xl font-black tracking-tight text-navy-900 dark:text-white flex items-center gap-2">
                SIR <span className="text-gold-500 font-sans text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 bg-navy-900 text-gold-400 rounded-md shadow-sm">Recruitment</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 font-extrabold">Dubai • GCC • Worldwide</p>
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
                <button
                  onClick={() => navigateTo(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition flex items-center space-x-1 ${
                    activeTab === item.id 
                      ? 'text-gold-500 bg-gold-500/10 dark:bg-gold-500/20 font-bold' 
                      : 'text-navy-900 dark:text-slate-200 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown className="w-3 h-3 text-slate-400" />}
                </button>

                {/* Mega Menu Dropdown */}
                {megaMenuType === item.hasMega && (
                  <div className="absolute top-full left-0 w-96 glass-card bg-white dark:bg-navy-900 shadow-luxury rounded-xl p-4 border border-gold-500/20 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {item.hasMega === 'services' && (
                      <div>
                        <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2 border-b pb-1 border-slate-200 dark:border-navy-700">
                          18+ Executive HR & Visa Services
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {SERVICES_LIST.slice(0, 10).map((srv) => (
                            <button
                              key={srv.id}
                              onClick={() => {
                                navigateToService(srv.id);
                                setMegaMenuType(null);
                              }}
                              className="text-left p-1.5 rounded hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 font-medium text-slate-700 dark:text-slate-300 truncate"
                            >
                              • {srv.title}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => { navigateTo('services'); setMegaMenuType(null); }}
                          className="w-full mt-3 text-center text-xs font-bold text-navy-900 dark:text-gold-400 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-white py-1.5 rounded transition"
                        >
                          View All 18 Services →
                        </button>
                      </div>
                    )}

                    {item.hasMega === 'industries' && (
                      <div>
                        <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-2 border-b pb-1 border-slate-200 dark:border-navy-700">
                          Sectors & Industry Expertise
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {INDUSTRIES_LIST.map((ind) => (
                            <button
                              key={ind.id}
                              onClick={() => {
                                navigateToIndustry(ind.id);
                                setMegaMenuType(null);
                              }}
                              className="text-left p-1.5 rounded hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 font-medium text-slate-700 dark:text-slate-300 truncate"
                            >
                              • {ind.name} ({ind.openJobs})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action CTAs: Matching Image 1 Layout with SIR Theme Colors (Gold Shimmer & Gold Outline) */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-navy-950/90 border border-gold-500/40 px-3.5 py-1.5 rounded-full text-xs shadow-md">
                <div className="w-7 h-7 rounded-full bg-gold-500 text-navy-950 font-bold flex items-center justify-center text-xs shadow-gold-glow">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="font-bold text-white leading-tight text-[11px] truncate max-w-[120px]">{user.name}</p>
                  <span className="text-[9px] text-gold-400 font-semibold uppercase">{user.role}</span>
                </div>
                <button
                  onClick={() => navigateTo(user.role === 'employer' ? 'employers' : 'candidates')}
                  className="px-2.5 py-1 bg-gold-500/20 hover:bg-gold-500 hover:text-navy-950 text-gold-400 rounded-full text-[10px] font-bold transition ml-1"
                >
                  Portal
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 rounded-full text-[10px] font-bold transition"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                {/* Register button: Outline style matching Image 1 layout with website SIR Gold theme */}
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-navy-900 dark:text-gold-400 bg-white dark:bg-navy-900 border-2 border-gold-500 hover:bg-gold-500/10 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-gold-500" />
                  <span>Register</span>
                </button>
                
                {/* Sign In button: Solid style matching Image 1 layout with website SIR Gold theme */}
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2 rounded-full text-xs font-bold text-navy-950 bg-gold-500 hover:bg-gold-600 shadow-gold-glow transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-navy-950" />
                  <span>Sign In</span>
                </button>


              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-800 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Drawer - Premium Glassmorphism */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-4 border-t border-slate-200/50 dark:border-navy-700/50 flex flex-col gap-2.5 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-2.5">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all duration-300 active:scale-95 shadow-sm ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-bold shadow-gold-glow'
                      : 'bg-slate-50 dark:bg-navy-800/80 text-navy-900 dark:text-slate-200 border border-slate-200 dark:border-navy-700 hover:border-gold-500/50'
                  }`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {item.label}
                </button>
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

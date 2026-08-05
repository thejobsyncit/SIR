import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Globe, Phone, Mail, Moon, Sun, Search, 
  User, Briefcase, ChevronDown, Menu, X, Shield, Award, Sparkles 
} from 'lucide-react';
import { SERVICES_LIST, INDUSTRIES_LIST } from '../data/mockData';

export const Navbar = () => {
  const { darkMode, toggleDarkMode, language, setLanguage, t, activeTab, navigateTo, setActiveModal, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuType, setMegaMenuType] = useState(null); // 'services' | 'industries' | null

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'services', label: t('nav.services'), hasMega: 'services' },
    { id: 'industries', label: t('nav.industries'), hasMega: 'industries' },
    { id: 'jobs', label: t('nav.jobs') },
    { id: 'employers', label: t('nav.employers') },
    { id: 'candidates', label: t('nav.candidates') },
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
            className="cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-navy-900 border-2 border-gold-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition duration-300">
              <span className="font-serif text-xl font-extrabold text-gold-500">S</span>
              <span className="font-serif text-lg font-bold text-white">IR</span>
            </div>
            <div>
              <div className="font-serif text-xl font-bold tracking-tight text-navy-900 dark:text-white flex items-center gap-1.5">
                SIR <span className="text-gold-500 font-sans text-xs uppercase tracking-widest px-1.5 py-0.5 bg-navy-900 text-gold-400 rounded">Recruitment</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 font-bold">Dubai • GCC • Worldwide</p>
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
                                navigateTo('services');
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
                                navigateTo('industries');
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

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-navy-950/80 border border-gold-500/30 px-3 py-1.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-gold-500 text-navy-950 font-bold flex items-center justify-center text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="font-bold text-white leading-tight text-[11px] truncate max-w-[120px]">{user.name}</p>
                  <span className="text-[9px] text-gold-400 font-semibold uppercase">{user.role}</span>
                </div>
                <button
                  onClick={() => navigateTo(user.role === 'employer' ? 'employers' : 'candidates')}
                  className="px-2 py-1 bg-gold-500/20 hover:bg-gold-500 hover:text-navy-950 text-gold-400 rounded text-[10px] font-bold transition ml-1"
                >
                  Portal
                </button>
                <button
                  onClick={logout}
                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 rounded text-[10px] font-bold transition"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('employers')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-navy-900 dark:text-white bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-gold-500 hover:text-gold-500 transition shadow-sm"
                >
                  Employer Portal
                </button>
                
                <button
                  onClick={() => navigateTo('candidates')}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-navy-950 bg-gold-shimmer hover:opacity-95 transition shadow-gold-glow flex items-center space-x-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Candidate Portal</span>
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-slate-200 dark:border-navy-800 grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-xs font-semibold text-left ${
                  activeTab === item.id
                    ? 'bg-gold-500 text-navy-950 font-bold'
                    : 'bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { navigateTo('candidates'); setMobileMenuOpen(false); }}
              className="col-span-2 mt-2 py-3 bg-gold-500 text-navy-950 font-bold rounded-lg text-xs text-center"
            >
              Access Candidate & Employer Portal
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock, Plus, X, Clock, AlertTriangle, LogOut, ChevronDown, Check, Sliders, Users, Target, Briefcase, CheckSquare, Layers, Shield
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

// Rich metadata for the custom enterprise role switcher
const ROLE_DETAILS = [
  {
    role: 'Super Admin',
    badge: 'Executive Command',
    desc: 'Full enterprise governance, workforce & master financials',
    icon: ShieldCheck,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500'
  },
  {
    role: 'Admin',
    badge: 'Administration',
    desc: 'System settings, user accounts & portal security',
    icon: Sliders,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30',
    dot: 'bg-blue-500'
  },
  {
    role: 'HR Lead',
    badge: 'Workforce & Talent',
    desc: 'Team attendance, leaves, shifts & onboarding',
    icon: Users,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  {
    role: 'Recruiter',
    badge: 'ATS & Sourcing',
    desc: 'Candidates, vacancies, pipeline & interviews',
    icon: Target,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30',
    dot: 'bg-purple-500'
  },
  {
    role: 'Placement Coordinator',
    badge: 'Campus & Drives',
    desc: 'Student dossiers, college drives & placements',
    icon: Briefcase,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/30',
    dot: 'bg-indigo-500'
  },
  {
    role: 'HR Operations',
    badge: 'Daily Enquiries & KYC',
    desc: 'Assigned tasks, document check & candidate directory',
    icon: CheckSquare,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-500/20 border-teal-300 dark:border-teal-500/30',
    dot: 'bg-teal-500'
  }
];

export const CrmHeader = ({ collapsed, setCollapsed }) => {
  const { 
    user, currentRole, switchRole, 
    darkMode, toggleDarkMode,
    setCommandPaletteOpen, 
    setAiDrawerOpen, 
    notificationsOpen, setNotificationsOpen, 
    notifications,
    showIdleModal, setShowIdleModal, logout,
    setActiveModule,
    setGlobalAddCandidateOpen,
    setGlobalAddClientOpen,
    setGlobalAddInterviewOpen,
    setGlobalAddInvoiceOpen
  } = useCrm();

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    if (roleMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [roleMenuOpen]);

  const activeRoleMeta = ROLE_DETAILS.find(r => r.role === currentRole) || ROLE_DETAILS[0];
  const ActiveRoleIcon = activeRoleMeta.icon;

  const handleSelectRole = (roleName) => {
    if (switchRole && roleName !== currentRole) {
      switchRole(roleName);
    }
    setRoleMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#070c1e]/90 backdrop-blur-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 flex justify-between items-center z-20 font-sans shadow-sm shrink-0">
      
      {/* Left Search & Sidebar Toggle */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center space-x-3 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 hover:border-gold-500 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs min-w-[260px] md:min-w-[300px] transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-gold-500" />
          <span>Global Search (Candidates, Clients, Passports)...</span>
          <kbd className="ml-auto bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 dark:border-navy-700 font-mono font-bold">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
        
        {/* Quick Create Action Menu */}
        <div className="relative">
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="flex items-center space-x-1.5 bg-gold-500 text-navy-950 hover:bg-gold-400 px-3 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Quick Create</span>
          </button>

          {quickMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card bg-white dark:bg-navy-950 border border-gold-500/30 rounded-2xl p-2 shadow-luxury space-y-1 z-50 text-xs font-semibold animate-in fade-in">
              <button 
                onClick={() => { 
                  setActiveModule('candidates'); 
                  setGlobalAddCandidateOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition cursor-pointer"
              >
                👤 Add Candidate
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('clients'); 
                  setGlobalAddClientOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition cursor-pointer"
              >
                🏢 Register Client
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('interviews'); 
                  setGlobalAddInterviewOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition cursor-pointer"
              >
                📅 Schedule Interview
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('accounts'); 
                  setGlobalAddInvoiceOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition cursor-pointer"
              >
                📄 Generate Invoice
              </button>
            </div>
          )}
        </div>

        {/* CUSTOM ENTERPRISE ROLE SELECTOR DROPDOWN (Replaces ugly native browser select) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => setRoleMenuOpen(prev => !prev)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-amber-100/80 dark:from-navy-900 dark:to-navy-900/90 hover:from-amber-100 hover:to-amber-200 dark:hover:from-navy-800 dark:hover:to-navy-800/90 border border-amber-300 dark:border-gold-500/40 px-3 py-1.5 rounded-xl transition duration-200 shadow-xs cursor-pointer group"
            title="Switch Active Workspace Role"
          >
            <div className={`p-1 rounded-lg ${activeRoleMeta.bg} shrink-0`}>
              <ActiveRoleIcon className={`w-3.5 h-3.5 ${activeRoleMeta.color}`} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 leading-none">Role</div>
              <div className="text-xs font-bold text-amber-950 dark:text-gold-300 leading-tight flex items-center gap-1.5">
                <span>{currentRole}</span>
              </div>
            </div>
            <span className="sm:hidden text-xs font-bold text-amber-950 dark:text-gold-300">
              {currentRole}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-amber-700 dark:text-gold-400 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Luxury Dropdown Menu */}
          {roleMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[95vw] bg-white dark:bg-[#0c142b] border border-amber-200 dark:border-gold-500/30 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="px-3 py-2 border-b border-slate-100 dark:border-navy-800/80 flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Switch Workspace Role
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Preview and operate under all enterprise roles
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30 font-bold">
                  6 Roles
                </span>
              </div>

              <div className="space-y-1 max-h-[360px] overflow-y-auto crm-sidebar-scroll py-1">
                {ROLE_DETAILS.map((r) => {
                  const RoleIcon = r.icon;
                  const isSelected = r.role === currentRole;

                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleSelectRole(r.role)}
                      className={`w-full text-left p-2 rounded-xl transition duration-150 flex items-center justify-between gap-2.5 cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-100/80 dark:bg-gold-500/20 border border-amber-300/80 dark:border-gold-500/40 shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-navy-800/70 border border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl ${r.bg} shrink-0`}>
                          <RoleIcon className={`w-4 h-4 ${r.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-950 dark:text-gold-300' : 'text-slate-900 dark:text-white'}`}>
                              {r.role}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-200/80 dark:bg-navy-800 text-slate-600 dark:text-slate-300 shrink-0">
                              {r.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {r.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Dark / Light Mode Switcher */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* AI Assistant Drawer Trigger */}
        <button 
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center space-x-1.5 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 px-3 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 relative transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-500 rounded-full animate-ping"></span>
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] sm:max-w-none glass-card bg-white dark:bg-navy-950 border border-gold-500/30 rounded-2xl p-4 shadow-luxury text-xs z-50 animate-in fade-in space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">System Audit Notifications</span>
                <span className="text-[10px] text-gold-500 font-bold">{notifications.length} New</span>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
                    <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Session Timeout Warning Modal */}
      {showIdleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl max-w-sm w-full p-6 shadow-luxury text-center space-y-4">
            <Clock className="w-12 h-12 text-gold-500 mx-auto animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Session Expiry Warning</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You have been inactive for 14 minutes. For enterprise security, your CRM session will auto-terminate in 60 seconds.
            </p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowIdleModal(false)}
                className="flex-1 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow text-xs"
              >
                Extend Session
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2.5 bg-slate-200 dark:bg-navy-950 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold border border-slate-300 dark:border-navy-800"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock, Plus, X, Clock, AlertTriangle, LogOut, ChevronDown,
  Building2, Users, Briefcase, GraduationCap, Layers, Check
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

const ROLE_DEFINITIONS = [
  {
    name: 'Super Admin',
    badge: 'Executive',
    description: 'Full System Control & Governance',
    icon: ShieldCheck,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60',
  },
  {
    name: 'Admin',
    badge: 'Management',
    description: 'Executive Operations & Oversight',
    icon: Building2,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
  },
  {
    name: 'HR Lead',
    badge: 'Leadership',
    description: 'People Strategy & Team Management',
    icon: Users,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-950/60',
  },
  {
    name: 'Recruiter',
    badge: 'Sourcing',
    description: 'Talent Sourcing & Candidate Pipeline',
    icon: Briefcase,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
  },
  {
    name: 'Placement Coordinator',
    badge: 'Campus',
    description: 'Campus Drives, Colleges & Students',
    icon: GraduationCap,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
  },
  {
    name: 'HR Operations',
    badge: 'Operations',
    description: 'Daily Onboarding, Attendance & Records',
    icon: Layers,
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-950/60',
  },
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
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setRoleDropdownOpen(false);
      }
    };

    if (roleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [roleDropdownOpen]);

  const activeRoleConfig = ROLE_DEFINITIONS.find((r) => r.name === currentRole) || {
    name: currentRole || 'Super Admin',
    badge: 'Active Role',
    description: 'Enterprise Role Access',
    icon: UserCheck,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60',
  };
  const ActiveRoleIcon = activeRoleConfig.icon;

  return (
    <header className="bg-white dark:bg-[#070c1e]/90 backdrop-blur-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex justify-between items-center z-30 font-sans shadow-sm shrink-0">
      
      {/* Left Search & Sidebar Toggle */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center space-x-3 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 hover:border-gold-500 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs min-w-[240px] md:min-w-[280px] transition"
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
            onClick={() => {
              setQuickMenuOpen(!quickMenuOpen);
              if (roleDropdownOpen) setRoleDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 bg-gold-500 text-navy-950 hover:bg-gold-400 px-3 sm:px-3.5 py-2 rounded-xl font-bold transition shadow-sm"
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
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition"
              >
                👤 Add Candidate
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('clients'); 
                  setGlobalAddClientOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition"
              >
                🏢 Register Client
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('interviews'); 
                  setGlobalAddInterviewOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition"
              >
                📅 Schedule Interview
              </button>
              <button 
                onClick={() => { 
                  setActiveModule('accounts'); 
                  setGlobalAddInvoiceOpen(true);
                  setQuickMenuOpen(false); 
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-800 dark:text-slate-200 hover:text-gold-500 transition"
              >
                📄 Generate Invoice
              </button>
            </div>
          )}
        </div>

        {/* Enterprise Role Selector Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              if (quickMenuOpen) setQuickMenuOpen(false);
            }}
            aria-expanded={roleDropdownOpen}
            aria-haspopup="listbox"
            title="Switch Active CRM Role"
            className="group flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-900 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-gold-500/50 dark:hover:border-gold-500/50 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          >
            {/* Active Role Icon */}
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${activeRoleConfig.iconBg} ${activeRoleConfig.iconColor}`}>
              <ActiveRoleIcon className="w-3.5 h-3.5" />
            </div>

            {/* Role: Label (hidden on small mobile screens to keep header tidy) */}
            <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider whitespace-nowrap">
              Role:
            </span>

            {/* Active Role Name */}
            <span className="text-[13px] sm:text-[14px] font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
              {currentRole}
            </span>

            {/* Animated Chevron */}
            <ChevronDown 
              className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                roleDropdownOpen ? 'rotate-180 text-gold-600 dark:text-gold-400' : 'group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`} 
            />
          </button>

          {/* Premium Enterprise Dropdown Panel */}
          {roleDropdownOpen && (
            <div 
              role="listbox"
              aria-label="Select Active CRM Role"
              className="absolute right-0 top-full mt-2 w-80 sm:w-88 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/70 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right focus:outline-none"
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1.5">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-gold-500" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Switch Active Role
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-700">
                  {CRM_ROLES.length} Roles
                </span>
              </div>

              {/* Roles List */}
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5">
                {ROLE_DEFINITIONS.map((role) => {
                  const isSelected = currentRole === role.name;
                  const RoleIcon = role.icon;

                  return (
                    <button
                      key={role.name}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        if (switchRole) {
                          switchRole(role.name);
                        }
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-150 group border ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700/80 text-sky-950 dark:text-sky-100 font-bold shadow-xs'
                          : 'bg-white dark:bg-[#070c1e] border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Role Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mr-3 transition-colors ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                            : `${role.iconBg} ${role.iconColor}`
                        }`}
                      >
                        <RoleIcon className="w-4 h-4" />
                      </div>

                      {/* Role Label & Description */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[14.5px] leading-snug font-bold truncate ${
                            isSelected ? 'text-sky-950 dark:text-sky-100' : 'text-slate-900 dark:text-white'
                          }`}>
                            {role.name}
                          </span>
                          <span className={`text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-sky-200/70 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200'
                              : 'bg-slate-100 dark:bg-navy-900 text-slate-500 dark:text-slate-400'
                          }`}>
                            {role.badge}
                          </span>
                        </div>
                        <p className={`text-[11.5px] leading-tight truncate mt-0.5 ${
                          isSelected ? 'text-sky-700 dark:text-sky-300 font-medium' : 'text-slate-500 dark:text-slate-400 font-normal'
                        }`}>
                          {role.description}
                        </p>
                      </div>

                      {/* Selected Checkmark or Hover Dot */}
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-700 shrink-0 mr-1.5 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>Instant Live Role Synchronization</span>
                <span className="font-semibold text-gold-500">Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Switcher */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 transition"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* AI Assistant Drawer Trigger */}
        <button 
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center space-x-1.5 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 px-3 py-2 rounded-xl font-bold transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 relative transition"
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

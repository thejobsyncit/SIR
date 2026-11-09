import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock, Plus, X, Clock, AlertTriangle, LogOut, ChevronDown 
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const formatUserName = (rawName) => {
    if (!rawName) return 'The Job Sync IT';
    const trimmed = rawName.trim();
    if (trimmed.toLowerCase() === 'thejobsyncit' || trimmed.toLowerCase() === 'the job sync it') {
      return 'The Job Sync IT';
    }
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
      return trimmed.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
    return trimmed;
  };

  const getEmpId = (rawId) => {
    if (!rawId) return 'EMP-923';
    const idStr = String(rawId).trim().toUpperCase();
    if (idStr === 'EMP-1' || idStr === 'USR-1') return 'EMP-923';
    if (idStr.startsWith('USR-')) return 'EMP-' + idStr.substring(4);
    if (!idStr.startsWith('EMP-')) return 'EMP-' + idStr;
    return idStr;
  };

  return (
    <header className="bg-white dark:bg-[#070c1e]/90 backdrop-blur-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 px-6 py-3 flex justify-between items-center z-20 font-sans shadow-sm shrink-0">
      
      {/* Left Search & Sidebar Toggle */}
      <div className="flex items-center space-x-4">
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
          className="hidden sm:flex items-center space-x-3 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 hover:border-gold-500 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs min-w-[280px] transition"
        >
          <Search className="w-3.5 h-3.5 text-gold-500" />
          <span>Global Search (Candidates, Clients, Passports)...</span>
          <kbd className="ml-auto bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[10px] border border-slate-300 dark:border-navy-700 font-mono font-bold">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 text-xs">
        
        {/* Quick Create Action Menu */}
        <div className="relative">
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="flex items-center space-x-1.5 bg-gold-500 text-navy-950 hover:bg-gold-400 px-3.5 py-2 rounded-xl font-bold transition shadow-sm"
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

        {/* Role Selector / Active Role (Allows immediate switching and testing across all 6 roles) */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-2.5 py-1 rounded-xl">
          <UserCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-extrabold whitespace-nowrap">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => switchRole && switchRole(e.target.value)}
            className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-extrabold px-2 py-0.5 rounded-lg border border-amber-300 dark:border-gold-500/30 text-xs outline-none cursor-pointer"
            title="Switch Active Role"
          >
            {CRM_ROLES.map((r) => (
              <option key={r} value={r} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                {r}
              </option>
            ))}
          </select>
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

        {/* EXECUTIVE VIP USER PROFILE & LOGOUT CAPSULE ("vera mari" Unified Luxury Design) */}
        <div className="relative flex items-center">
          
          {/* Unified Luxury Glass Capsule Container */}
          <div className="flex items-center p-1 pl-2 pr-1 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-amber-50/20 dark:from-[#080d24] dark:via-[#0c1436] dark:to-[#080d24] border border-slate-200/90 dark:border-gold-500/35 shadow-sm hover:shadow-md transition-all duration-200">
            
            {/* Left Interactive Identity Area (Click to toggle detailed executive card) */}
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2.5 pr-2 cursor-pointer group"
              title="Click to view executive profile & session credentials"
            >
              {/* Avatar with Double Metallic Gold Ring & Glowing Online Dot */}
              <div className="relative shrink-0">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-gold-500 to-yellow-300 shadow-xs">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} 
                    alt={formatUserName(user?.name)} 
                    className="w-8 h-8 rounded-full object-cover border border-white dark:border-[#080d24]" 
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#080d24] rounded-full shadow-[0_0_6px_rgba(16,185,129,0.9)]" title="Online & Active" />
              </div>

              {/* Name, ID Badge & Email/Role Stack */}
              <div className="hidden sm:flex flex-col justify-center text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[130px] leading-tight tracking-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition" title={formatUserName(user?.name)}>
                    {formatUserName(user?.name)}
                  </span>
                  <span className="inline-flex items-center font-mono text-[9px] font-black px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-500/20 to-gold-500/20 text-amber-800 dark:text-gold-300 border border-gold-500/40 uppercase tracking-wider shrink-0 shadow-2xs" title={'Employee ID: ' + getEmpId(user?.id)}>
                    {getEmpId(user?.id)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  <span className="font-semibold text-amber-700 dark:text-gold-400 flex items-center gap-0.5 shrink-0">
                    <ShieldCheck className="w-2.5 h-2.5 text-gold-500" />
                    <span>{currentRole || user?.role || 'Super Admin'}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="truncate max-w-[135px]" title={user?.email || 'thejobsyncit@gmail.com'}>
                    {user?.email || 'thejobsyncit@gmail.com'}
                  </span>
                </div>
              </div>

              {/* Dropdown Chevron Indicator */}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500 transition-transform duration-200 hidden sm:block ${profileMenuOpen ? 'rotate-180 text-gold-500' : ''}`} />
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-7 w-px bg-slate-200 dark:bg-gold-500/25 shrink-0 mx-1" />

            {/* Seamless Embedded Vibrant Red Logout Button */}
            <button 
              type="button"
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-sm shadow-rose-950/30 hover:shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shrink-0"
              title="Sign Out / Logout of Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Logout</span>
            </button>

          </div>

          {/* Luxury Dropdown Profile Card */}
          {profileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card bg-white dark:bg-navy-950 border border-gold-500/35 rounded-2xl p-4 shadow-luxury text-xs z-50 animate-in fade-in space-y-3.5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  Revival Enterprise CRM • Profile
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Online
                </span>
              </div>

              {/* User Identity Details */}
              <div className="flex items-center space-x-3">
                <div className="relative shrink-0">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-gold-500 to-yellow-300 shadow-sm">
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} 
                      alt={formatUserName(user?.name)} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-navy-950" 
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-navy-950 rounded-full" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {formatUserName(user?.name)}
                    </h4>
                    <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-500/35 shrink-0">
                      {getEmpId(user?.id)}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-gold-400 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-gold-500 shrink-0" />
                    <span>{currentRole || user?.role || 'Super Admin'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={user?.email || 'thejobsyncit@gmail.com'}>
                    {user?.email || 'thejobsyncit@gmail.com'}
                  </div>
                </div>
              </div>

              {/* Account Meta & Security status */}
              <div className="space-y-1.5 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 font-medium">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Department:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.department || 'Executive Operations HQ'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Security Level:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    256-Bit SSL • Authenticated
                  </span>
                </div>
              </div>

              {/* Full Logout Button in Drawer */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 shadow-md transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Logout / Sign Out of Portal</span>
              </button>
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

import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock, Plus, X, Clock, AlertTriangle 
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

export const CrmHeader = ({ collapsed, setCollapsed }) => {
  const { 
    currentRole, switchRole, 
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

  return (
    <header className="bg-white dark:bg-[#070c1e]/90 backdrop-blur-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 px-6 py-3 flex justify-between items-center z-20 font-sans shadow-sm">
      
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

        {/* Fixed Active Role Badge (Assigned by Super Admin) */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl">
          <UserCheck className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-slate-700 dark:text-slate-300 font-extrabold">Active Role:</span>
          <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-extrabold px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-gold-500/30 text-xs">
            {currentRole}
          </span>
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
            <div className="absolute right-0 top-full mt-2 w-80 glass-card bg-white dark:bg-navy-950 border border-gold-500/30 rounded-2xl p-4 shadow-luxury text-xs z-50 animate-in fade-in space-y-3">
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

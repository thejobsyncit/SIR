import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock } from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

export const CrmHeader = ({ collapsed, setCollapsed }) => {
  const { 
    currentRole, switchRole, 
    setCommandPaletteOpen, 
    setAiDrawerOpen, 
    notificationsOpen, setNotificationsOpen, 
    notifications,
    activeModule
  } = useCrm();

  return (
    <header className="bg-navy-950 text-white border-b border-navy-800 px-6 py-3 flex justify-between items-center z-20">
      
      {/* Left Search & Toggle */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center space-x-3 bg-navy-900 border border-navy-700 hover:border-gold-500/50 text-slate-400 px-4 py-2 rounded-xl text-xs min-w-[280px] transition"
        >
          <Search className="w-3.5 h-3.5 text-gold-500" />
          <span>Global Search (Candidates, Clients, Passport)...</span>
          <kbd className="ml-auto bg-navy-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-navy-700 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 text-xs">
        
        {/* Role Switcher Demo */}
        <div className="hidden lg:flex items-center space-x-2 bg-navy-900 border border-navy-700 px-3 py-1.5 rounded-xl">
          <UserCheck className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-slate-400 font-semibold">Active Role:</span>
          <select 
            value={currentRole}
            onChange={(e) => switchRole(e.target.value)}
            className="bg-navy-950 text-gold-400 font-bold border border-navy-800 rounded px-2 py-0.5 text-xs focus:outline-none"
          >
            {CRM_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* AI Assistant Drawer Trigger */}
        <button 
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center space-x-1.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 px-3 py-2 rounded-xl font-bold transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications Trigger */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-500 rounded-full"></span>
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card bg-navy-950 border border-gold-500/30 rounded-2xl p-4 shadow-luxury text-xs z-50 animate-in fade-in space-y-3">
              <div className="flex justify-between items-center border-b border-navy-800 pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">System Audit Notifications</span>
                <span className="text-[10px] text-gold-400 font-bold">{notifications.length} New</span>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 bg-navy-900 rounded-xl border border-navy-800 space-y-1">
                    <p className="text-slate-200">{n.text}</p>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

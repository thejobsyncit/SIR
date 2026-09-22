import React, { useState, useEffect } from 'react';
import { ErpLogin } from './components/ErpLogin';
import { ErpDashboard } from './pages/ErpDashboard';
import { useApp } from '../context/AppContext';

import { Moon, Sun } from 'lucide-react';

export const ErpApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const { navigateTo, darkMode, toggleDarkMode } = useApp();

  // Ensure ERP follows the global dark mode toggle from AppContext
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!isAuthenticated) {
    return <ErpLogin onLogin={(user) => {
      setAdminUser(user);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040714] text-slate-900 dark:text-white flex flex-col font-sans selection:bg-gold-500 selection:text-navy-950 transition-colors duration-300">
      {/* Simple Top Header for ERP */}
      <header className="h-16 border-b border-slate-200 dark:border-gold-500/30 flex items-center justify-between px-6 bg-white dark:bg-navy-900 shadow-sm dark:shadow-luxury shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center font-bold text-navy-950 font-serif shadow-gold-glow">
            SIR
          </div>
          <div>
            <h1 className="font-serif font-bold text-slate-900 dark:text-gold-400 text-lg tracking-wider uppercase leading-none">Enterprise ERP</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Super Admin Portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => {
              navigateTo('home');
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            Back to Website
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{adminUser?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-gold-600 dark:text-gold-500 uppercase tracking-wider">{adminUser?.role || 'System Administrator'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-gold-500/50 flex items-center justify-center text-gold-600 dark:text-gold-500 font-bold shadow-sm">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10 transition shadow-sm"
          >
            End Session
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#040714] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <ErpDashboard adminUser={adminUser} />
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const ErpLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      const saved = localStorage.getItem('sir_crm_registered_users');
      let users = [];
      if (saved) {
        try { users = JSON.parse(saved); } catch (e) {}
      } else {
        // Fallback default
        users = [
          { name: 'Super Admin', email: 'tariq.admin@sirrecruitment.com', password: 'Super@Secret2026!', role: 'Super Admin' }
        ];
      }

      // Allow any user that has 'Super Admin' role
      const admin = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.role === 'Super Admin');

      if (!admin) {
        setErrorMsg('Access Denied: Invalid credentials or insufficient permissions. Only Super Admins can access the ERP.');
        return;
      }

      if (admin.password !== password) {
        setErrorMsg('Access Denied: Incorrect password.');
        return;
      }

      onLogin(admin);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold-500/20 dark:bg-gold-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px]"></div>
      </div>

      <ScrollReveal className="w-full max-w-md z-10">
        <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-slate-200 dark:border-navy-700 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>
          
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-10 h-10 text-gold-500 dark:text-gold-400" />
            </div>
            <div className="text-center space-y-1.5">
              <h1 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide drop-shadow-sm">Enterprise ERP</h1>
              <p className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">Super Admin Gateway</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-400 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <KeyRound className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-gold-500 dark:group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@sirrecruitment.com"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium focus:border-gold-500 dark:focus:border-gold-400 focus:ring-1 focus:ring-gold-500 dark:focus:ring-gold-400 transition-all placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-300 dark:hover:border-navy-600 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Master Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-gold-500 dark:group-focus-within:text-gold-400 transition-colors" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white text-sm font-medium tracking-widest focus:border-gold-500 dark:focus:border-gold-400 focus:ring-1 focus:ring-gold-500 dark:focus:ring-gold-400 transition-all placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-slate-300 dark:hover:border-navy-600 shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-bold text-sm rounded-xl shadow-gold-glow transition-all flex items-center justify-center space-x-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAuthenticating ? (
                <span className="animate-pulse">Authenticating Session...</span>
              ) : (
                <>
                  <span>Initialize ERP Session</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-200 dark:border-navy-700 pt-6">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              This gateway is strictly restricted to authorized Super Administrators.<br/>
              All access attempts are logged, encrypted, and monitored.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

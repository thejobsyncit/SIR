import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldAlert, Lock, Mail, FileCheck, ArrowRight, Sparkles, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';

export const EmployerAuth = () => {
  const { loginEmployer } = useApp();
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide corporate email and password.');
      return;
    }
    loginEmployer(email, accountId || 'SIR-EMP-9902', password);
  };

  const handleDemoLogin = () => {
    loginEmployer('hr@alhabtoorcontracting.com', 'SIR-EMP-9902', 'enterprise123');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Security Header / Verification Info */}
        <div className="md:col-span-5 bg-gradient-to-br from-gold-500/15 via-slate-50 to-yellow-100/30 dark:from-navy-950 dark:via-navy-900 dark:to-black p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-gold-500/20">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-2xl shadow-gold-glow">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Restricted Enterprise Access
                </span>
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-0.5">Employer Client Portal</h2>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-yellow-950 dark:text-gold-300 text-xs flex items-start space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  Access to candidate CV databases, job postings, and visa processing mandates is restricted to verified enterprise partners.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Verified GCC & International Talent Pool</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>End-to-End MOHRE Visa & Clearance Tracking</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>AI Candidate Matching Engine</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-navy-800">
            <div className="flex items-center space-x-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-gold-500" />
              <span>ISO 27001 Certified Secure Data Vault</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="md:col-span-7 p-6 sm:p-8 bg-slate-50/50 dark:bg-navy-900/70 flex flex-col justify-center">
          
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Enterprise Sign In</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">Please enter your corporate credentials to unlock your mandate dashboard.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-500" />
                Corporate Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. hr@alhabtoor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-gold-500" />
                Enterprise Account ID / Trade License No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SIR-EMP-9902 or DED-98214"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-500" />
                  Portal Password *
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset requested. Account Manager will contact your corporate HR team.'); }} className="text-gold-600 hover:text-gold-700 dark:text-gold-400 hover:underline text-[11px] font-semibold">
                  Forgotten corporate password?
                </a>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-shimmer hover:opacity-95 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>Unlock Employer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 text-center space-y-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-gold-400 font-semibold rounded-xl border border-gold-500/30 transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>Instant Enterprise Demo Login (Al Habtoor)</span>
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-gold-500" />
                Need to register your organization? <a href="#contact" onClick={(e) => { e.preventDefault(); window.location.hash = 'contact'; }} className="text-gold-600 dark:text-gold-400 font-bold underline">Contact Enterprise Sales</a>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

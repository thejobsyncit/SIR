import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertOctagon, CheckCircle2, Phone, Mail, Building2, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import SITE_CONFIG from '../config/siteConfig';

export const FraudAwarenessPage = () => {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-gold-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Hero Alert Header */}
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <AlertOctagon className="w-9 h-9" />
          </div>

          <span className="inline-block bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Mandatory Public Advisory • Ethical Recruitment Charter
          </span>

          <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white">
            Zero-Fee Placement Policy & Fraud Awareness Notice
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Revival International Consultancy FZ-LLC strictly operates in compliance with UAE Federal Law, MOHRE recruitment regulations, and international ethical staffing conventions.
          </p>
        </div>

        {/* Core Guarantee Card */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-bold">100% Free Placement for All Job Seekers</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {SITE_CONFIG.zeroFeePolicy.statement}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Registration Fees</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Interview Charges</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Visa Surcharge</span>
            </div>
          </div>
        </div>

        {/* How to Spot Fake Offers */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <span>How to Identify Fraudulent Recruiters Impersonating Us</span>
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="font-bold text-rose-500">🚩 Demand for Payment or Security Deposits:</span>
              <p>Any individual requesting payment for medical exams, embassy appointment stamps, or flight booking guarantees is fraudulent. Revival International never demands funds from candidates.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="font-bold text-rose-500">🚩 Non-Official Email Domains:</span>
              <p>Official communications originate solely from <code className="text-gold-500">@therevivalinternational.com</code>. We never use personal Gmail, Yahoo, or Outlook accounts for official recruitment.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-1">
              <span className="font-bold text-rose-500">🚩 Unrealistic Job Offers Without Formal Interview:</span>
              <p>We never issue employment offer letters without conducting structured video or in-person technical interviews and employer approval.</p>
            </div>
          </div>
        </div>

        {/* Report Fraud / Contact Authority */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gold-400">
            <Mail className="w-5 h-5" />
            <span>Report Suspicious Solicitations Immediately</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            If you receive any suspicious communication, payment request, or unauthorized offer claiming to represent Revival International, forward the details immediately to our dedicated legal compliance team:
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="mailto:compliance@therevivalinternational.com"
              className="inline-flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-gold-glow"
            >
              <Mail className="w-4 h-4" />
              <span>Email: compliance@therevivalinternational.com</span>
            </a>
            <button
              onClick={() => navigateTo('contact')}
              className="inline-flex items-center justify-center space-x-2 bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs px-6 py-3 rounded-xl border border-navy-700 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Verify at Official Offices</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FraudAwarenessPage;


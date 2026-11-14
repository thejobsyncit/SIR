import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, FileText, AlertTriangle, ArrowLeft, CheckCircle2, Scale, ExternalLink } from 'lucide-react';

export const LEGAL_SECTIONS = [
  { id: 'legal-privacy', path: 'legal/privacy-policy', label: 'Privacy Policy' },
  { id: 'legal-terms', path: 'legal/terms-of-use', label: 'Terms of Use' },
  { id: 'legal-cookie', path: 'legal/cookie-policy', label: 'Cookie Policy' },
  { id: 'legal-refund', path: 'legal/refund-policy', label: 'Refund & Cancellation' },
  { id: 'legal-consent', path: 'legal/candidate-consent', label: 'Candidate Consent Notice' },
  { id: 'fraud-awareness', path: 'fraud-awareness', label: 'Zero-Fee & Fraud Awareness' }
];

export const LegalPageLayout = ({ activeLegalId, title, lastUpdated = '13 November 2026', children }) => {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-gold-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Governance & Legal Framework v2.0
          </span>
        </div>

        {/* Mandatory Legal Draft Banner (Issue #3 & Rule 2) */}
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-400">
                Draft Document – Marked &quot;Pending Legal Review&quot;
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed font-medium">
                This document is a formal draft prepared for Revival International Consultancy FZ-LLC, Dubai. It is formulated in strict accordance with the <strong>UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (UAE PDPL)</strong> and the <strong>India Digital Personal Data Protection Act 2023 (DPDP Act 2023)</strong>. Operational policies are subject to ongoing legal confirmation by appointed corporate counsel.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200 dark:border-navy-800 shadow-sm sticky top-24">
              <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100 dark:border-navy-800">
                <Scale className="w-4 h-4 text-gold-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Legal Documents
                </span>
              </div>

              <nav className="space-y-1">
                {LEGAL_SECTIONS.map((sec) => {
                  const isActive = activeLegalId === sec.id || activeLegalId === sec.path;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => navigateTo(sec.path)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        isActive
                          ? 'bg-gold-500 text-white shadow-gold-glow'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                      }`}
                    >
                      <span>{sec.label}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-500 space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Placement-Fee Corridors</span>
                </div>
                <p>
                  Candidates are never charged placement fees. All agency fees are employer-funded.
                </p>
              </div>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
              
              <div className="border-b border-slate-200 dark:border-navy-800 pb-6">
                <span className="text-xs font-bold text-gold-500 uppercase tracking-widest">
                  Corporate Governance & Statutory Compliance
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white mt-1">
                  {title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Last Updated: {lastUpdated} • Entity: Revival International Consultancy FZ-LLC, Dubai
                </p>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-6 font-medium">
                {children}
              </div>

              {/* Footer Sign-off */}
              <div className="pt-8 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <p>
                  Questions or Data Requests? Email: <a href="mailto:compliance@therevivalinternational.com" className="text-gold-500 font-bold hover:underline">compliance@therevivalinternational.com</a>
                </p>
                <span>Revival International Compliance Unit</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LegalPageLayout;


import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X } from 'lucide-react';
import { initAnalytics } from '../services/analytics';

export const CookieConsent = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('sir_cookie_consent');
    if (!consent) {
      setAccepted(false);
    } else if (consent === 'all' || consent === 'true') {
      initAnalytics();
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('sir_cookie_consent', 'all');
    setAccepted(true);
    initAnalytics();
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('sir_cookie_consent', 'essential');
    setAccepted(true);
  };

  if (accepted || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      role="region" 
      aria-label="Cookie Privacy Banner"
      className="fixed bottom-0 inset-x-0 z-[99999] p-3.5 sm:p-4 bg-white/95 dark:bg-navy-950/95 backdrop-blur-lg border-t-2 border-gold-500/50 shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Banner Information */}
        <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center shrink-0 border border-gold-500/30">
            <ShieldCheck className="w-5 h-5 text-gold-500" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
              GDPR & Cookie Privacy Preference
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-3xl font-medium">
              Revival International uses cookies & encrypted storage to personalize overseas job recommendations, preserve your candidate evaluation session, and analyze platform traffic.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-1 md:pt-0">
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="flex-1 md:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-300 dark:border-navy-700 cursor-pointer"
          >
            Essential Only
          </button>
          
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 md:flex-initial px-5 py-2 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl text-xs shadow-gold-glow hover:opacity-95 transition cursor-pointer"
          >
            Accept All Cookies
          </button>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition shrink-0 ml-1"
            title="Dismiss cookie notice"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

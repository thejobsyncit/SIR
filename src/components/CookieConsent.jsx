import React, { useState, useEffect } from 'react';
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

  if (accepted) return null;

  return (
    <div 
      role="region"
      aria-label="Cookie Preferences"
      className="fixed bottom-20 sm:bottom-22 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md glass-card bg-white/95 dark:bg-navy-950/95 text-slate-900 dark:text-white border border-slate-200 dark:border-gold-500/40 rounded-2xl p-4 shadow-luxury animate-in fade-in slide-in-from-bottom-4 duration-300 text-xs"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center shrink-0 border border-gold-500/30">
          <ShieldCheck className="w-4 h-4 text-gold-500" />
        </div>
        
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              GDPR & Cookie Preference
            </h4>
            <button
              onClick={handleEssentialOnly}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Close cookie notice"
              aria-label="Close cookie notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] font-medium">
            Revival International uses cookies & encrypted local storage to personalize job recommendations, preserve your visa evaluation session, and analyze platform traffic.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 bg-gold-shimmer text-navy-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-gold-glow hover:opacity-95 transition cursor-pointer text-center whitespace-nowrap"
            >
              Accept All Cookies
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition border border-slate-300 dark:border-navy-700 cursor-pointer whitespace-nowrap"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

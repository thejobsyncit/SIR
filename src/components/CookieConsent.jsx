import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieConsent = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('sir_cookie_consent');
    if (!consent) setAccepted(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sir_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-md glass-card bg-navy-950 text-white border border-gold-500/40 rounded-2xl p-4 shadow-luxury animate-in slide-in-from-bottom-5 text-xs">
      <div className="flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-bold text-white">GDPR & Cookie Preference</h4>
          <p className="text-slate-300 leading-relaxed text-[11px] font-medium">
            SIR Recruitment uses cookies & encrypted local storage to personalize job recommendations, preserve your visa evaluation session, and analyze platform traffic.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="bg-gold-shimmer text-navy-950 font-bold px-4 py-1.5 rounded-lg text-xs hover:opacity-95"
            >
              Accept All Cookies
            </button>
            <button
              onClick={handleAccept}
              className="bg-navy-800 text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-navy-700"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

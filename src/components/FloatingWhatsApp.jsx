import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { trackContactClick } from '../services/analytics';

export const FloatingWhatsApp = () => {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="fixed bottom-[80px] sm:bottom-[86px] right-4 sm:right-6 z-40 flex items-center group">
      <a
        href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20would%20like%20to%20inquire%20about%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContactClick('whatsapp', 'India / Global Consultation Desk')}
        aria-label="Contact Revival International on WhatsApp"
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 cursor-pointer backdrop-blur-sm"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full ring-2 ring-emerald-500 animate-pulse" />
        </div>
        {!isCompact && (
          <span className="hidden sm:inline font-bold text-xs pr-1 text-white">WhatsApp Consultation</span>
        )}
      </a>
      
      {/* Discreet minimize toggle to ensure underlying wording is never obstructed */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsCompact(!isCompact);
        }}
        title={isCompact ? "Expand WhatsApp box" : "Minimize to circle icon to view text underneath"}
        className="hidden sm:flex ml-1 w-5 h-5 rounded-full bg-slate-200/80 dark:bg-navy-800/80 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 items-center justify-center text-[10px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCompact ? '+' : '–'}
      </button>
    </div>
  );
};

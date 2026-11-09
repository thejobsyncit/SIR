import React from 'react';
import { MessageSquare } from 'lucide-react';
import { trackContactClick } from '../services/analytics';

export const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20would%20like%20to%20inquire%20about%20your%20services."
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContactClick('whatsapp', 'India / Global Consultation Desk')}
      aria-label="Contact Revival International on WhatsApp"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
    >
      <div className="relative">
        <MessageSquare className="w-5 h-5 fill-current text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full ring-2 ring-emerald-500 animate-pulse" />
      </div>
      <span className="hidden sm:inline font-bold text-xs pr-1 text-white">WhatsApp Consultation</span>
    </a>
  );
};

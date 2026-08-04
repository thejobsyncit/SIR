import React from 'react';
import { MessageSquare } from 'lucide-react';

export const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/971509876543?text=Hello%20SIR%20Recruitment,%20I%20would%20like%20to%20inquire%20about%20your%20services."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact SIR Recruitment on WhatsApp"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-3.5 rounded-full shadow-luxury hover:bg-emerald-600 hover:scale-110 transition duration-300 flex items-center space-x-2 group"
    >
      <MessageSquare className="w-6 h-6 fill-current" />
      <span className="hidden sm:inline font-bold text-xs pr-1">WhatsApp Consultation</span>
    </a>
  );
};

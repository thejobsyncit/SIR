import React from 'react';

export const BrandLogoIcon = ({ className = "w-14 h-14" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-2xl bg-navy-900 border-2 border-gold-500 shadow-luxury p-2 select-none shrink-0 ${className}`}>
      <span className="font-serif font-black text-gold-500 text-2xl tracking-tighter leading-none">S</span>
      <span className="font-serif font-bold text-white text-xl leading-none">IR</span>
    </div>
  );
};

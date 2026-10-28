import React from 'react';

export const BrandLogoIcon = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}>
      <img 
        src="/images/logo.png" 
        alt="The Revival International Logo" 
        className="w-full h-full object-contain drop-shadow-md"
        loading="eager"
      />
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAuth } from './UnifiedAuth';

export const UnifiedAuthModal = () => {
  const { activeModal, setActiveModal, authModalConfig } = useApp();

  if (activeModal !== 'auth' && activeModal !== 'unified-auth') return null;

  const mode = authModalConfig?.mode || 'login';
  const role = authModalConfig?.role || null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 dark:bg-navy-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setActiveModal(null);
        }
      }}
    >
      <div className="relative w-full max-w-lg my-auto max-h-[98vh] flex flex-col justify-center">
        <UnifiedAuth 
          defaultMode={mode} 
          defaultRole={role} 
          onSuccess={() => setActiveModal(null)} 
          onClose={() => setActiveModal(null)} 
        />
      </div>
    </div>
  );
};


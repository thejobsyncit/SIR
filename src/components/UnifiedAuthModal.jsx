import React from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAuth } from './UnifiedAuth';
import { X } from 'lucide-react';

export const UnifiedAuthModal = () => {
  const { activeModal, setActiveModal, authModalConfig } = useApp();

  if (activeModal !== 'auth' && activeModal !== 'unified-auth') return null;

  const mode = authModalConfig?.mode || 'login';
  const role = authModalConfig?.role || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition shadow-md"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <UnifiedAuth defaultMode={mode} defaultRole={role} onSuccess={() => setActiveModal(null)} />
      </div>
    </div>
  );
};

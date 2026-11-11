import React, { useEffect, useRef } from 'react';
import { LogOut, X } from 'lucide-react';

export const HrLogoutConfirmModal = ({
  isOpen,
  isLoggingOut = false,
  onCancel,
  onConfirm
}) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Move focus to Cancel so accidental Enter key does not immediately log out
    const focusTimer = window.setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        e.preventDefault();
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoggingOut, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="presentation"
      data-testid="hr-logout-confirm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoggingOut) {
          onCancel?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-logout-confirm-title"
        aria-describedby="hr-logout-confirm-desc"
        data-testid="hr-logout-confirm-modal"
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 shadow-2xl p-6 space-y-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="hr-logout-confirm-title"
                className="font-serif text-base font-bold text-slate-900 dark:text-white leading-snug"
              >
                Are you sure you want to log out?
              </h3>
              <p
                id="hr-logout-confirm-desc"
                className="text-xs text-slate-500 dark:text-slate-400 mt-1"
              >
                You will be signed out of your active CRM session and returned to the login screen.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => !isLoggingOut && onCancel?.()}
            aria-label="Close logout confirmation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            ref={cancelBtnRef}
            type="button"
            disabled={isLoggingOut}
            onClick={() => !isLoggingOut && onCancel?.()}
            data-testid="hr-logout-cancel-btn"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => !isLoggingOut && onConfirm?.()}
            data-testid="hr-logout-confirm-btn"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-rose-400/40 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Yes, Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HrLogoutConfirmModal;


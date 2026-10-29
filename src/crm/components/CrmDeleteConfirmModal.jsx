import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw, ShieldAlert, CheckCircle } from 'lucide-react';

export const CrmDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Permanent Deletion',
  recordName,
  recordRef,
  recordType = 'Record',
  warningText,
  isProcessing = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isProcessing && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="glass-card bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-luxury space-y-5 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  Superadmin Action Required
                </span>
              </div>
              <h3 id="delete-modal-title" className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition disabled:opacity-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Record Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Entity Type:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {recordType}
            </span>
          </div>

          {recordRef && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Reference Code:</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                {recordRef}
              </span>
            </div>
          )}

          {recordName && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Subject / Title:</span>
              <span className="font-bold text-slate-900 dark:text-white text-right max-w-[260px] truncate">
                {recordName}
              </span>
            </div>
          )}
        </div>

        {/* Warning Text */}
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Permanent Irreversible Action</span>
          </div>
          <p className="leading-relaxed text-[11px] text-rose-700/90 dark:text-rose-300/90">
            {warningText || (
              <>
                Deleting this record will permanently remove it from the SQLite database. All linked activity logs, follow-up appointments, notes, and metrics associations will be safely purged. This operation <strong>cannot be undone</strong>.
              </>
            )}
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-navy-700 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Deleting Record...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Delete Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

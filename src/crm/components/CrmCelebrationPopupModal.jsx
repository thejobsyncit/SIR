import React, { useState, useEffect, useCallback } from 'react';
import { useCrm } from '../context/CrmContext';
import { PartyPopper, Cake, Award, Megaphone, Sparkles, X, ChevronRight, Calendar } from 'lucide-react';

export const OCCASION_THEMES = {
  Festival: {
    label: 'Festival Wishes',
    icon: PartyPopper,
    headerGradient: 'from-amber-500 via-gold-500 to-orange-500',
    badgeClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
    accentBorder: 'border-amber-400/50 dark:border-gold-500/50',
    emoji: '🎉'
  },
  Birthday: {
    label: 'Birthday Celebration',
    icon: Cake,
    headerGradient: 'from-rose-500 via-pink-500 to-amber-500',
    badgeClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
    accentBorder: 'border-rose-400/50 dark:border-rose-500/40',
    emoji: '🎂'
  },
  Anniversary: {
    label: 'Work Anniversary',
    icon: Award,
    headerGradient: 'from-indigo-500 via-purple-500 to-gold-500',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40',
    accentBorder: 'border-indigo-400/50 dark:border-indigo-500/40',
    emoji: '🏆'
  },
  Celebration: {
    label: 'Company Celebration',
    icon: Megaphone,
    headerGradient: 'from-emerald-500 via-teal-500 to-gold-500',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
    accentBorder: 'border-emerald-400/50 dark:border-emerald-500/40',
    emoji: '✨'
  }
};

export const CelebrationPopupCard = ({ popup, onClose, currentIndex = 0, totalCount = 1, isPreview = false }) => {
  if (!popup) return null;
  const theme = OCCASION_THEMES[popup.occasion_type] || OCCASION_THEMES.Festival;
  const Icon = theme.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
      <div className={`relative bg-white dark:bg-navy-900 border-2 ${theme.accentBorder} rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl`}>
        {/* Festive Gradient Banner */}
        <div className={`bg-gradient-to-r ${theme.headerGradient} px-6 py-5 text-white relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 opacity-20">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  {theme.emoji} {theme.label}
                </span>
                <p className="text-[11px] text-white/90 font-semibold mt-1">
                  The Revival International • Company Broadcast
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {popup.title}
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {popup.message}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <span>Shared by</span>
              <strong className="text-slate-800 dark:text-slate-200">{popup.created_by || 'Super Admin'}</strong>
              {popup.created_by_role && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-[10px] font-bold">
                  {popup.created_by_role}
                </span>
              )}
            </div>
            {popup.created_at && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(popup.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {totalCount > 1 ? (
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Message {currentIndex + 1} of {totalCount}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {isPreview ? 'Live Preview Mode' : 'Visible to all CRM team members'}
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:opacity-95 text-navy-950 font-extrabold text-xs shadow-gold-glow transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{totalCount > 1 && currentIndex < totalCount - 1 ? 'Next' : isPreview ? 'Close Preview' : 'Close'}</span>
              {totalCount > 1 && currentIndex < totalCount - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CrmCelebrationPopupModal = () => {
  const { isAuthenticated, user, currentEmployee, currentRole } = useCrm();
  const [queue, setQueue] = useState([]);

  const userKey = (currentEmployee?.employeeId || user?.email || currentRole || 'crm_user').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const storageKey = `revival_dismissed_crm_popups_${userKey}`;

  const getDismissedMap = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }, [storageKey]);

  const fetchActivePopups = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/crm-popups/active');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.popups)) return;

      const dismissed = getDismissedMap();
      const unseen = data.popups.filter((p) => {
        const version = p.updated_at || p.created_at || '1';
        return dismissed[p.id] !== version;
      });
      setQueue(unseen);
    } catch {
      // Fail silently on background poll
    }
  }, [isAuthenticated, getDismissedMap]);

  useEffect(() => {
    fetchActivePopups();
    const interval = setInterval(fetchActivePopups, 30000);
    const handleUpdate = () => fetchActivePopups();
    window.addEventListener('crm-popup-updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('crm-popup-updated', handleUpdate);
    };
  }, [fetchActivePopups]);

  const handleDismissCurrent = () => {
    if (queue.length === 0) return;
    const current = queue[0];
    try {
      const dismissed = getDismissedMap();
      dismissed[current.id] = current.updated_at || current.created_at || '1';
      localStorage.setItem(storageKey, JSON.stringify(dismissed));
    } catch {
      // Ignore storage quota errors
    }
    setQueue((prev) => prev.slice(1));
  };

  if (!isAuthenticated || queue.length === 0) return null;

  return (
    <CelebrationPopupCard
      popup={queue[0]}
      onClose={handleDismissCurrent}
      currentIndex={0}
      totalCount={queue.length}
    />
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { CelebrationPopupCard, OCCASION_THEMES } from '../components/CrmCelebrationPopupModal';
import {
  PartyPopper,
  Cake,
  Award,
  Megaphone,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

const OCCASION_OPTIONS = [
  {
    type: 'Festival',
    label: 'Festival Wish',
    emoji: '🎉',
    icon: PartyPopper,
    sampleTitle: 'Happy Diwali to Team Revival!',
    sampleMessage: 'Wishing everyone at The Revival International a bright, joyful, and prosperous celebration! May this occasion bring happiness and success to you and your family.'
  },
  {
    type: 'Birthday',
    label: 'Birthday Wish',
    emoji: '🎂',
    icon: Cake,
    sampleTitle: 'Happy Birthday!',
    sampleMessage: 'Warmest birthday wishes from everyone at The Revival International! Thank you for your dedication and hard work. Have a wonderful year ahead!'
  },
  {
    type: 'Anniversary',
    label: 'Work Anniversary',
    emoji: '🏆',
    icon: Award,
    sampleTitle: 'Happy Work Anniversary!',
    sampleMessage: 'Congratulations on another wonderful milestone with The Revival International! We truly appreciate your commitment and contributions to our team.'
  },
  {
    type: 'Celebration',
    label: 'Announcement',
    emoji: '✨',
    icon: Megaphone,
    sampleTitle: 'Company Announcement',
    sampleMessage: 'We are excited to share an important celebration update with our entire CRM team!'
  }
];

export const CrmAutomation = () => {
  const { user, currentEmployee, currentRole } = useCrm();
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [previewPopup, setPreviewPopup] = useState(null);

  const [form, setForm] = useState({
    occasion_type: 'Festival',
    title: '',
    message: ''
  });

  const loadPopups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm-popups');
      const data = await res.json();
      if (res.ok && data.success) {
        setPopups(data.popups || []);
      }
    } catch {
      // Ignore silent fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPopups();
  }, [loadPopups]);

  const notifyGlobalPopup = () => {
    window.dispatchEvent(new CustomEvent('crm-popup-updated'));
  };

  const handleSelectOccasion = (option) => {
    setForm((prev) => ({
      ...prev,
      occasion_type: option.type,
      title: prev.title.trim() ? prev.title : option.sampleTitle,
      message: prev.message.trim() ? prev.message : option.sampleMessage
    }));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/crm-popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion_type: form.occasion_type,
          title: form.title.trim(),
          message: form.message.trim(),
          is_active: 1,
          created_by: currentEmployee?.name || user?.name || 'Priya Sharma',
          created_by_role: currentRole || 'Super Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.message || 'Failed to send popup.' });
        return;
      }

      setForm({ occasion_type: form.occasion_type, title: '', message: '' });
      setFeedback({ type: 'success', text: 'Popup sent! All CRM roles will see it as a popup.' });
      await loadPopups();
      notifyGlobalPopup();
    } catch {
      setFeedback({ type: 'error', text: 'Network error while sending popup.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (popup) => {
    try {
      const res = await fetch(`/api/crm-popups/${encodeURIComponent(popup.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: popup.is_active ? 0 : 1 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPopups((prev) => prev.map((p) => (p.id === popup.id ? data.popup : p)));
        notifyGlobalPopup();
      }
    } catch {
      // Ignore
    }
  };

  const handleDeletePopup = async (popup) => {
    if (!window.confirm(`Delete "${popup.title}"?`)) return;
    try {
      const res = await fetch(`/api/crm-popups/${encodeURIComponent(popup.id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
        notifyGlobalPopup();
      }
    } catch {
      // Ignore
    }
  };

  return (
    <ScrollReveal>
      <div className="max-w-4xl mx-auto space-y-6 text-xs font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-gold-500/30 shadow-luxury relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48 text-gold-400" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Company Announcement Popup
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-2">
                Festivals, Birthdays & Live Team Popups
              </h1>
              <p className="text-slate-300 mt-1 max-w-2xl">
                Send a festival greeting, birthday wish, or celebration message — it appears as an instant popup for all CRM roles and disappears as soon as they close it.
              </p>
            </div>
          </div>
        </div>

        {/* Popup Composer Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Select Occasion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {OCCASION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = form.occasion_type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSelectOccasion(opt)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
                      selected
                        ? 'border-gold-500 bg-gold-500/10 dark:bg-gold-500/15 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:border-gold-500/40'
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selected ? 'bg-gold-500 text-navy-950' : 'bg-white dark:bg-navy-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-extrabold text-xs">{opt.emoji} {opt.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {feedback && (
            <div className={`p-3.5 rounded-2xl border font-bold flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}>
              <span>{feedback.text}</span>
              <button type="button" onClick={() => setFeedback(null)} className="text-xs underline cursor-pointer">Dismiss</button>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                2. Popup Heading / Title *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Happy Diwali! or Happy Birthday Diviya!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                3. Popup Message Text *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write your festival wishes, birthday greeting, or celebration text to pop up for everyone in the CRM..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={!form.title.trim() && !form.message.trim()}
                onClick={() => setPreviewPopup({
                  occasion_type: form.occasion_type,
                  title: form.title || 'Preview Heading',
                  message: form.message || 'Your celebration message will appear here.',
                  created_by: currentEmployee?.name || user?.name || 'Priya Sharma',
                  created_by_role: currentRole || 'Super Admin',
                  created_at: new Date().toISOString()
                })}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-300 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Popup</span>
              </button>

              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.message.trim()}
                className="px-6 py-3 rounded-2xl bg-gold-500 hover:opacity-95 text-navy-950 font-extrabold shadow-gold-glow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Sending Popup...' : 'Send Popup to All Roles'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sent Popups Log (Visible here so sender can see what was sent) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Sent Popups ({popups.length})
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Messages sent from here — other roles only see them as a popup.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-slate-500 dark:text-slate-400 font-bold">
              Loading sent popups...
            </div>
          ) : popups.length === 0 ? (
            <div className="py-6 text-center text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
              No popups sent yet. Messages you send above will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {popups.map((popup) => {
                const theme = OCCASION_THEMES[popup.occasion_type] || OCCASION_THEMES.Festival;
                const Icon = theme.icon;
                const isActive = popup.is_active === 1;

                return (
                  <div
                    key={popup.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-500/40 transition"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${theme.badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          {theme.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {isActive ? 'Live Popup' : 'Paused'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {popup.created_at ? new Date(popup.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{popup.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {popup.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewPopup(popup)}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 font-bold hover:border-gold-500 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(popup)}
                        className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                        <span>{isActive ? 'Active' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePopup(popup)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition cursor-pointer"
                        title="Delete popup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewPopup && (
        <CelebrationPopupCard
          popup={previewPopup}
          onClose={() => setPreviewPopup(null)}
          isPreview={true}
        />
      )}
    </ScrollReveal>
  );
};

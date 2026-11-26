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
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';

const PRESETS = [
  {
    label: 'Festival Wish',
    occasion_type: 'Festival',
    title: 'Happy Diwali to Team Revival!',
    message: 'Wishing everyone at The Revival International a bright, joyful, and prosperous Diwali! May this festival of lights bring happiness and success to you and your family.'
  },
  {
    label: 'Employee Birthday',
    occasion_type: 'Birthday',
    title: 'Happy Birthday!',
    message: 'Warmest birthday wishes from everyone at The Revival International! Thank you for your dedication and hard work. Have a wonderful year ahead!'
  },
  {
    label: 'Work Anniversary',
    occasion_type: 'Anniversary',
    title: 'Happy Work Anniversary!',
    message: 'Congratulations on another wonderful milestone with The Revival International! We truly appreciate your commitment and contributions to our team.'
  },
  {
    label: 'Company Celebration',
    occasion_type: 'Celebration',
    title: 'Special Company Announcement!',
    message: 'We are thrilled to share a special milestone with our entire team. Thank you all for making this achievement possible!'
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
    message: '',
    expires_at: ''
  });

  const loadPopups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/crm-popups');
      const data = await res.json();
      if (res.ok && data.success) {
        setPopups(data.popups || []);
      }
    } catch (err) {
      console.error('Failed to load broadcast popups:', err);
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

  const handleApplyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      occasion_type: preset.occasion_type,
      title: preset.title,
      message: preset.message
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
          expires_at: form.expires_at || null,
          is_active: 1,
          created_by: currentEmployee?.name || user?.name || 'Priya Sharma',
          created_by_role: currentRole || 'Super Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.message || 'Failed to publish popup.' });
        return;
      }

      setForm({ occasion_type: 'Festival', title: '', message: '', expires_at: '' });
      setFeedback({ type: 'success', text: 'Popup published! It will now appear for all CRM users.' });
      await loadPopups();
      notifyGlobalPopup();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error while publishing popup.' });
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
    } catch (err) {
      console.error('Failed to toggle popup status:', err);
    }
  };

  const handleDelete = async (popup) => {
    if (!window.confirm(`Delete "${popup.title}"?`)) return;
    try {
      const res = await fetch(`/api/crm-popups/${encodeURIComponent(popup.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
        notifyGlobalPopup();
      }
    } catch (err) {
      console.error('Failed to delete popup:', err);
    }
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
              CRM-Wide Celebration & Broadcast Popups
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Festivals, Birthdays & Team Popups
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Enter any festival greeting, employee birthday wish, or company celebration message below — it automatically pops up for everyone logged into the CRM.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{popups.filter((p) => p.is_active === 1).length} Active Popup{popups.filter((p) => p.is_active === 1).length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Compose Broadcast Popup Form */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Post a New Celebration / Festival Popup
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Choose an occasion or quick template and write the message to display across the CRM.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-gold-500/15 hover:text-gold-700 dark:hover:text-gold-400 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                >
                  {OCCASION_THEMES[preset.occasion_type]?.emoji} {preset.label}
                </button>
              ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Occasion Type *
                </label>
                <select
                  value={form.occasion_type}
                  onChange={(e) => setForm({ ...form, occasion_type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                >
                  <option value="Festival">🎉 Festival</option>
                  <option value="Birthday">🎂 Birthday</option>
                  <option value="Anniversary">🏆 Work Anniversary</option>
                  <option value="Celebration">✨ Company Celebration / Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Popup Heading / Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Happy Diwali! or Happy Birthday Diviya!"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Auto-Hide After Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Popup Message Text *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write your festival wishes, birthday greeting, or celebration message to show in a popup to all CRM users..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-3 font-medium focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={!form.title.trim() && !form.message.trim()}
                onClick={() => setPreviewPopup({
                  occasion_type: form.occasion_type,
                  title: form.title || 'Preview Heading',
                  message: form.message || 'Your celebration message will appear here.',
                  created_by: currentEmployee?.name || user?.name || 'Super Admin',
                  created_by_role: currentRole || 'Super Admin',
                  created_at: new Date().toISOString()
                })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-300 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Popup</span>
              </button>

              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.message.trim()}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:opacity-95 text-navy-950 font-extrabold shadow-gold-glow transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Publishing...' : 'Publish Popup to All CRM Users'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Published Popups History & Controls */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white px-1">
            Published & Scheduled Popups ({popups.length})
          </h3>

          {loading ? (
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
              Loading broadcast popups...
            </div>
          ) : popups.length === 0 ? (
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">
              No celebration or festival popups have been posted yet. Use the form above to broadcast your first popup to the team!
            </div>
          ) : (
            popups.map((popup) => {
              const theme = OCCASION_THEMES[popup.occasion_type] || OCCASION_THEMES.Festival;
              const Icon = theme.icon;
              const isActive = popup.is_active === 1;

              return (
                <div
                  key={popup.id}
                  className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-gold-500/40 transition shadow-sm"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${theme.badgeClass}`}>
                        <Icon className="w-3 h-3" />
                        {theme.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isActive ? 'Showing to CRM Users' : 'Paused'}
                      </span>
                      {popup.expires_at && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3" /> Expires: {popup.expires_at}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{popup.title}</h4>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {popup.message}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Posted by <strong className="text-slate-700 dark:text-slate-200">{popup.created_by || 'Super Admin'}</strong>
                      {popup.created_by_role ? ` (${popup.created_by_role})` : ''} • {popup.created_at ? new Date(popup.created_at).toLocaleString() : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewPopup(popup)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(popup)}
                      className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer ${
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
                      onClick={() => handleDelete(popup)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 transition cursor-pointer"
                      title="Delete popup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
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

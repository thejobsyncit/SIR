import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Megaphone, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getKolkataDateStr = (val) => {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
};

const formatKolkataDateTime = (val) => {
  if (!val) return '—';
  const s = String(val).trim();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) ? `${s.replace(' ', 'T')}Z` : s;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return s;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return s;
  }
};

const getAnnouncementVisualStatus = (ann, todayStr) => {
  const expStr = ann.expires_at ? getKolkataDateStr(ann.expires_at) : '';
  const pubStr = getKolkataDateStr(ann.publishDate || ann.published_at || ann.created_at);
  if (ann.isDeleted || ann.is_deleted || ann.status === 'Deleted') {
    return {
      label: 'Deleted',
      isDeleted: true,
      cardClass: 'bg-slate-100/90 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      badgeClass: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
    };
  }
  if (ann.status === 'Expired' || (expStr && expStr < todayStr && ann.status !== 'Draft')) {
    return {
      label: 'Expired',
      cardClass: 'bg-rose-50/90 dark:bg-rose-950/35 border-rose-200 dark:border-rose-800/70 text-rose-900 dark:text-rose-200',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
    };
  }
  if (ann.status === 'Draft') {
    return {
      label: 'Draft',
      cardClass: 'bg-slate-100 dark:bg-navy-950 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300',
      badgeClass: 'bg-slate-200 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
    };
  }
  if (ann.status === 'Scheduled' || (pubStr && pubStr > todayStr)) {
    return {
      label: 'Scheduled',
      cardClass: 'bg-indigo-50/90 dark:bg-indigo-950/35 border-indigo-200 dark:border-indigo-800/70 text-indigo-950 dark:text-indigo-200',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
    };
  }
  if (ann.expiryState === 'Expiring Soon' || (expStr && expStr >= todayStr && Math.ceil((Date.parse(`${expStr}T00:00:00Z`) - Date.parse(`${todayStr}T00:00:00Z`)) / 86400000) <= 3)) {
    return {
      label: 'Expiring Soon',
      cardClass: 'bg-amber-50/95 dark:bg-amber-950/35 border-amber-300 dark:border-amber-800/70 text-amber-950 dark:text-amber-200',
      badgeClass: 'bg-amber-200/80 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200'
    };
  }
  return {
    label: 'Published',
    cardClass: 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
  };
};

export const SharedAnnouncementCalendar = ({
  announcements = [],
  onSelectAnnouncement,
  onClose,
  title = 'Announcement Calendar'
}) => {
  const todayStr = useMemo(() => getKolkataDateStr(new Date()), []);
  const [anchorDate, setAnchorDate] = useState(() => todayStr);
  const [selectedDayIso, setSelectedDayIso] = useState('');
  const [detailAnnouncement, setDetailAnnouncement] = useState(null);

  const [anchorY, anchorM] = useMemo(() => {
    const parts = anchorDate.split('-').map(Number);
    return [parts[0] || new Date().getFullYear(), (parts[1] || 1) - 1];
  }, [anchorDate]);

  const byDate = useMemo(() => {
    const map = new Map();
    (announcements || []).forEach((ann) => {
      const dateKey = getKolkataDateStr(ann.publishDate || ann.published_at || ann.created_at) || todayStr;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey).push(ann);
    });
    return map;
  }, [announcements, todayStr]);

  const handlePrev = () => {
    const prev = new Date(Date.UTC(anchorY, anchorM - 1, 1));
    setAnchorDate(prev.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const next = new Date(Date.UTC(anchorY, anchorM + 1, 1));
    setAnchorDate(next.toISOString().slice(0, 10));
  };

  const monthlyCells = useMemo(() => {
    const first = new Date(anchorY, anchorM, 1);
    const startOffset = (first.getDay() + 6) % 7; // Mon = 0 .. Sun = 6
    const daysInMonth = new Date(anchorY, anchorM + 1, 0).getDate();
    const prevMonthDays = new Date(anchorY, anchorM, 0).getDate();
    const cells = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const pm = anchorM === 0 ? 11 : anchorM - 1;
      const py = anchorM === 0 ? anchorY - 1 : anchorY;
      cells.push({
        dayNumber: dNum,
        iso: `${py}-${String(pm + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`,
        isCurrentMonth: false
      });
    }
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      cells.push({
        dayNumber: dNum,
        iso: `${anchorY}-${String(anchorM + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`,
        isCurrentMonth: true
      });
    }
    const targetTotal = cells.length <= 35 ? 35 : 42;
    const rem = targetTotal - cells.length;
    for (let dNum = 1; dNum <= rem; dNum++) {
      const nm = anchorM === 11 ? 0 : anchorM + 1;
      const ny = anchorM === 11 ? anchorY + 1 : anchorY;
      cells.push({
        dayNumber: dNum,
        iso: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`,
        isCurrentMonth: false
      });
    }
    return cells;
  }, [anchorY, anchorM]);

  const headerLabel = `${MONTH_NAMES[anchorM]} ${anchorY}`;

  const calendarContent = (
    <div className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 ${onClose ? 'w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150' : ''}`}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-gold-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">{title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-[10px] mt-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Expiring Soon
              </span>
              <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Scheduled
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Expired
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Deleted
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end lg:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-900 dark:text-white min-w-[130px] text-center">
            {headerLabel}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate(todayStr)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Today</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 cursor-pointer ml-1"
              title="Close Calendar"
              aria-label="Close Calendar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Monthly View */}
      <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-100/90 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-2.5 border-r last:border-r-0 border-slate-200/70 dark:border-navy-800">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-navy-800">
            {monthlyCells.map((cell, idx) => {
              const items = byDate.get(cell.iso) || [];
              const isToday = cell.iso === todayStr;
              return (
                <div
                  key={cell.iso + idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedDayIso(cell.iso);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDayIso(cell.iso);
                    }
                  }}
                  aria-label={`View announcements for ${cell.iso}`}
                  className={`min-h-[100px] p-2 flex flex-col gap-1 transition cursor-pointer hover:bg-amber-50/30 dark:hover:bg-navy-800/40 ${!cell.isCurrentMonth ? 'bg-slate-50/50 dark:bg-navy-950/40 opacity-50' : 'bg-white dark:bg-navy-900'} ${isToday ? 'ring-1 ring-inset ring-amber-400 bg-amber-50/20 dark:bg-amber-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isToday ? 'w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                      {cell.dayNumber}
                    </span>
                    {isToday && <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300">Today</span>}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[82px]">
                    {items.map((ann) => {
                      const vis = getAnnouncementVisualStatus(ann, todayStr);
                      return (
                        <div
                          key={ann.id}
                          className={`w-full text-left p-1.5 rounded-lg border text-[10px] leading-tight transition hover:brightness-95 ${vis.cardClass}`}
                          title={`${ann.title} (${vis.label}) — Click date to view all`}
                        >
                          <div className={`font-bold truncate ${vis.isDeleted ? 'line-through opacity-75' : ''}`}>{ann.title}</div>
                          <div className="flex items-center justify-between gap-1 mt-0.5 text-[9px] opacity-85">
                            <span className="truncate">{ann.category}</span>
                            <span className={`px-1 rounded font-bold shrink-0 ${vis.badgeClass}`}>{vis.label}</span>
                          </div>
                          {ann.expires_at && (
                            <div className="text-[8px] opacity-80 truncate mt-0.5">Exp: {ann.expires_at}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Day Announcements Pop-up Modal */}
      {selectedDayIso && (
        <div
          className="fixed inset-0 z-[60] bg-navy-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDayIso('');
          }}
        >
          <div
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-gold-400">
                  Announcements for Date ({(byDate.get(selectedDayIso) || []).length})
                </span>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white font-mono">
                  {selectedDayIso}
                </h4>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDayIso('');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                title="Close"
                aria-label="Close date announcements"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(byDate.get(selectedDayIso) || []).length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
                <Megaphone className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                No announcements for this date
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {(byDate.get(selectedDayIso) || []).map((ann) => {
                  const vis = getAnnouncementVisualStatus(ann, todayStr);
                  const pubDateStr = getKolkataDateStr(ann.publishDate || ann.published_at || ann.created_at);
                  return (
                    <div
                      key={ann.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailAnnouncement(ann);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          setDetailAnnouncement(ann);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition hover:brightness-95 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${vis.cardClass}`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vis.badgeClass}`}>{vis.label}</span>
                          {vis.isDeleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                              {ann.wasPublished || ann.was_published || ann.published_at ? 'Was Published' : 'Never Published'}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold opacity-85">{ann.category}</span>
                          <span className="text-[10px] opacity-75">• {ann.target_audience}</span>
                        </div>
                        <div className={`font-serif font-bold text-sm truncate ${vis.isDeleted ? 'line-through opacity-80' : ''}`}>{ann.title}</div>
                        <div className="text-[11px] opacity-85">
                          By <strong>{ann.created_by_name || 'HR Lead'}</strong> ({ann.created_by_role || 'HR Lead'})
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 text-[10px] font-mono">
                        <span>Published: {ann.published_at ? formatKolkataDateTime(ann.published_at) : (pubDateStr || '—')}</span>
                        <span>{ann.expires_at ? `Expires: ${ann.expires_at}` : 'No Expiry'}</span>
                        <span className="font-sans text-[11px] font-bold underline pt-0.5">View Details</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcement Full Details Modal (Preserves Date List Underneath) */}
      {detailAnnouncement && (() => {
        const vis = getAnnouncementVisualStatus(detailAnnouncement, todayStr);
        const pubDateStr = getKolkataDateStr(detailAnnouncement.publishDate || detailAnnouncement.published_at || detailAnnouncement.created_at);
        return (
          <div
            className="fixed inset-0 z-[70] bg-navy-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setDetailAnnouncement(null);
            }}
          >
            <div
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${vis.badgeClass}`}>{vis.label}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200">
                      {detailAnnouncement.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {detailAnnouncement.target_audience}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white pt-1">
                    {detailAnnouncement.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailAnnouncement(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  title="Close Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {detailAnnouncement.description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Issued By</span>
                  <strong className="text-slate-800 dark:text-slate-100">
                    {detailAnnouncement.created_by_name || 'HR Lead'} ({detailAnnouncement.created_by_role || 'HR Lead'})
                  </strong>
                  {detailAnnouncement.created_by && (
                    <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{detailAnnouncement.created_by}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">Publication Date</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-100">
                    {detailAnnouncement.published_at ? formatKolkataDateTime(detailAnnouncement.published_at) : (pubDateStr || 'Never Published')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Expiry Date</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-100">{detailAnnouncement.expires_at || 'No Expiry'}</strong>
                </div>
              </div>

              {(detailAnnouncement.isDeleted || detailAnnouncement.is_deleted || detailAnnouncement.status === 'Deleted') && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider text-[10px]">
                      Soft-Deleted Announcement
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 dark:bg-navy-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                      {detailAnnouncement.wasPublished || detailAnnouncement.was_published || detailAnnouncement.published_at
                        ? 'Previously Published'
                        : 'Never Published (Draft)'}
                    </span>
                  </div>
                  <div className="text-rose-900 dark:text-rose-100 text-[11px] space-y-0.5">
                    <div>
                      Deleted by: <strong>{detailAnnouncement.deleted_by_name || 'HR Lead'}</strong> ({detailAnnouncement.deleted_by_role || 'HR Lead'})
                      {detailAnnouncement.deleted_at ? ` on ${formatKolkataDateTime(detailAnnouncement.deleted_at)}` : ''}
                    </div>
                    <div>
                      Reason: <span className="italic">{detailAnnouncement.deletion_reason || 'No reason recorded'}</span>
                    </div>
                  </div>
                </div>
              )}

              {Array.isArray(detailAnnouncement.auditLogs) && detailAnnouncement.auditLogs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Audit History ({detailAnnouncement.auditLogs.length})
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {detailAnnouncement.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{log.action}</span>
                          <span className="font-mono text-[10px] text-slate-400">{formatKolkataDateTime(log.created_at)}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          By <strong>{log.actor_name || 'System'}</strong> ({log.actor_role || 'System'})
                          {log.details ? ` — ${log.details}` : ''}
                        </div>
                        {log.reason && (
                          <div className="text-rose-600 dark:text-rose-300 italic">Reason: {log.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailAnnouncement(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {selectedDayIso ? 'Back to Date List' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
          {calendarContent}
        </div>
      </div>
    );
  }

  return calendarContent;
};

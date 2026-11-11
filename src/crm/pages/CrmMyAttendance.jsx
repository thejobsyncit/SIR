import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coffee,
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
  FileEdit,
  History,
  BarChart3,
  Bell,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Timer,
  Info,
  X
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

const formatDuration = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${String(rem).padStart(2, '0')}m`;
};

const formatClockTime = (isoOrTime, timeZone = 'Asia/Kolkata') => {
  if (!isoOrTime) return '—';
  if (/^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime;
  const d = new Date(isoOrTime);
  if (Number.isNaN(d.getTime())) return String(isoOrTime);
  return d.toLocaleTimeString('en-IN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: true
  });
};

const formatLiveElapsed = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const STATUS_BADGE_MAP = {
  Present: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  Late: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
  Absent: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  'On Leave': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  Holiday: 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-300 dark:border-white/15',
  'Weekly Off': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10',
  'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  'Missing Checkout': 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
  'Not Checked In': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25',
  Upcoming: 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-white/5 dark:text-slate-500 dark:border-white/10'
};

const CALENDAR_CELL_STYLE = {
  Present: 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-200',
  Late: 'bg-orange-50 border-orange-300 text-orange-900 dark:bg-orange-500/15 dark:border-orange-500/40 dark:text-orange-200',
  Absent: 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-500/15 dark:border-rose-500/40 dark:text-rose-200',
  'On Leave': 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-200',
  Holiday: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-white/10 dark:border-white/20 dark:text-slate-300',
  'Weekly Off': 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400',
  'In Progress': 'bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-200',
  'Missing Checkout': 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200',
  'Not Checked In': 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-200',
  Upcoming: 'bg-white border-slate-200 text-slate-400 dark:bg-navy-900/50 dark:border-white/10 dark:text-slate-500'
};

const getStatusBadgeClass = (status) =>
  STATUS_BADGE_MAP[status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10';

const getInitialMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const CrmMyAttendance = () => {
  const { currentRole, user, crmToken, authTokenLoading, logout, syncAttendanceNotifications } = useCrm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'calendar' | 'regularization' | 'hours'
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth);
  const [rangeMode, setRangeMode] = useState('monthly'); // 'weekly' | 'monthly' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  // Live clock & active elapsed working seconds ticker
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [shiftNote, setShiftNote] = useState('');
  const [breakType, setBreakType] = useState('General Break');

  // History filters & pagination
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calendar inspection
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Record Details Modal
  const [detailModalDate, setDetailModalDate] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Regularization form
  const [regDate, setRegDate] = useState('');
  const [regType, setRegType] = useState('Missed Check-Out');
  const [regReqIn, setRegReqIn] = useState('');
  const [regReqOut, setRegReqOut] = useState('');
  const [regReqStatus, setRegReqStatus] = useState('Present');
  const [regReason, setRegReason] = useState('');
  const [regExisting, setRegExisting] = useState(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Notifications Drawer inline
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const buildDashboardQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set('month', selectedMonth);
    if (rangeMode === 'weekly') {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const [y, m, d] = todayStr.split('-').map(Number);
      const startObj = new Date(Date.UTC(y, m - 1, d - 6));
      params.set('startDate', startObj.toISOString().slice(0, 10));
      params.set('endDate', todayStr);
    } else if (rangeMode === 'custom' && customStart && customEnd && customStart <= customEnd) {
      params.set('startDate', customStart);
      params.set('endDate', customEnd);
    }
    return params.toString();
  }, [selectedMonth, rangeMode, customStart, customEnd]);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!crmToken) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setErrorMsg('');
    try {
      const qs = buildDashboardQuery();
      const res = await fetch(`/api/hr-ops/attendance/dashboard?${qs}`, {
        headers: {
          Authorization: `Bearer ${crmToken}`
        }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to load attendance data.');
      }
      setDashboard(json.data);
      if (json.data?.notifications && syncAttendanceNotifications) {
        syncAttendanceNotifications(json.data.notifications);
      }
      if (!regDate && json.data?.todayDate) {
        setRegDate(json.data.todayDate);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, [crmToken, buildDashboardQuery, syncAttendanceNotifications, regDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Populate existing DB values whenever user picks an attendanceDate on Regularization tab
  useEffect(() => {
    if (!regDate || !crmToken) return;
    let active = true;
    fetch(`/api/hr-ops/attendance/records/${regDate}`, {
      headers: { Authorization: `Bearer ${crmToken}` }
    })
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        const d = json.data?.day;
        const rec = json.data?.record;
        setRegExisting({
          checkIn: rec?.checkInAt ? d?.checkInFormatted : null,
          checkOut: rec?.checkOutAt ? d?.checkOutFormatted : null,
          status: d?.status || 'Absent'
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [regDate, crmToken, dashboard]);

  const runAttendanceAction = async (endpoint, payload = {}) => {
    if (!crmToken) {
      setFeedback({ type: 'error', text: 'Authenticated CRM session token missing. Please re-login.' });
      return;
    }
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Operation failed.');
      }
      setFeedback({ type: 'success', text: json.message || 'Attendance updated.' });
      setShiftNote('');
      await fetchDashboard(true);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = async (workDate) => {
    setDetailModalDate(workDate);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/hr-ops/attendance/records/${workDate}`, {
        headers: { Authorization: `Bearer ${crmToken}` }
      });
      const json = await res.json();
      if (json.success) {
        setDetailData(json.data);
      }
    } catch (_) {
    } finally {
      setDetailLoading(false);
    }
  };

  const jumpToRegularizeDate = (day) => {
    setRegDate(day.date);
    if (day.status === 'Missing Checkout') {
      setRegType('Missed Check-Out');
    } else if (!day.checkInAt) {
      setRegType('Missed Check-In');
    } else {
      setRegType('Incorrect Timestamps');
    }
    setActiveTab('regularization');
  };

  const handleRegularizationSubmit = async (e) => {
    e.preventDefault();
    if (!crmToken) return;
    setRegSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/hr-ops/attendance/regularizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({
          attendanceDate: regDate,
          correctionType: regType,
          requestedCheckIn: regReqIn || null,
          requestedCheckOut: regReqOut || null,
          requestedStatus: regType === 'Incorrect Status' ? regReqStatus : undefined,
          reason: regReason
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to submit regularization.');
      }
      setFeedback({ type: 'success', text: json.message });
      setRegReason('');
      setRegReqIn('');
      setRegReqOut('');
      await fetchDashboard(true);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Submission failed.' });
    } finally {
      setRegSubmitting(false);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!crmToken) return;
    try {
      await fetch('/api/hr-ops/attendance/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${crmToken}` }
      });
      await fetchDashboard(true);
    } catch (_) {}
  };

  const markOneNotificationRead = async (id) => {
    if (!crmToken) return;
    try {
      await fetch(`/api/hr-ops/attendance/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${crmToken}` }
      });
      await fetchDashboard(true);
    } catch (_) {}
  };

  const shiftMonth = (delta) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
    setSelectedMonth(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`);
    setSelectedCalendarDay(null);
    setCurrentPage(1);
  };

  // Filtered History Rows
  const filteredHistory = useMemo(() => {
    const rows = dashboard?.history || [];
    return rows.filter((row) => {
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${row.date} ${row.day} ${row.shiftName} ${row.status} ${row.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dashboard, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const paginatedHistory = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, totalPages]);

  // Calendar leading empty slots so weekday aligns accurately
  const calendarLeadingBlanks = useMemo(() => {
    const firstDateStr = `${selectedMonth}-01`;
    const [y, m, d] = firstDateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  }, [selectedMonth]);

  // Real-time worked timer when actively checked in
  const liveWorkedSeconds = useMemo(() => {
    const rec = dashboard?.today?.record;
    if (!rec || !rec.checkInAt) return 0;
    if (rec.checkOutAt) return Math.round((rec.netWorkMinutes || 0) * 60);
    const startMs = new Date(rec.checkInAt).getTime();
    const openBreak = rec.activeBreak;
    const completedBreakSec = Number(rec.totalBreakMinutes || 0) * 60;
    const openBreakSec = openBreak
      ? Math.max(0, Math.floor((nowMs - new Date(openBreak.breakStartAt).getTime()) / 1000))
      : 0;
    const grossSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
    return Math.max(0, grossSec - completedBreakSec - openBreakSec);
  }, [dashboard, nowMs]);

  if (currentRole !== 'HR Operations') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            HR Operations Portal Only
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            My Attendance is exclusively available for HR Operations employees.
          </p>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const workingHours = dashboard?.workingHours || {};
  const todayState = dashboard?.today || {};
  const activeShift = dashboard?.activeShift || {};
  const tz = dashboard?.timezone || 'Asia/Kolkata';
  const todayRecord = todayState.record;
  const todayStatus =
    todayState.daySummary?.status ||
    todayRecord?.status ||
    (todayState.isCheckedIn ? 'In Progress' : 'Not Checked In');

  const unreadCount = dashboard?.unreadNotificationsCount || 0;
  const missingList = dashboard?.missingCheckoutRecords || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-gold-500/15 flex items-center justify-center text-amber-600 dark:text-gold-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                My Attendance
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {dashboard?.employee?.name || user?.name} • {dashboard?.employee?.operationTeam || 'HR Operations'} • {activeShift.name || 'General Shift'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Company Time ({tz})
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">
              {new Date(nowMs).toLocaleTimeString('en-IN', {
                timeZone: tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNotifDrawer((p) => !p)}
            className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold transition"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchDashboard()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-gold-500 text-white dark:text-navy-950 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Inline Notifications Drawer */}
      {showNotifDrawer && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Attendance Notifications
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs font-semibold text-amber-600 dark:text-gold-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowNotifDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {!dashboard?.notifications?.length ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
              No attendance notifications recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-64 overflow-y-auto">
              {dashboard.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-2.5 flex items-start justify-between gap-3 ${
                    Number(n.isRead) === 0 ? 'bg-amber-50/40 dark:bg-gold-500/5 px-2 rounded-lg' : 'opacity-75'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {Number(n.isRead) === 0 && (
                    <button
                      type="button"
                      onClick={() => markOneNotificationRead(n.id)}
                      className="shrink-0 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Missing Checkout Alert Banner */}
      {missingList.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Missing Check-Out Detected ({missingList.length} shift{missingList.length > 1 ? 's' : ''})
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Date(s): {missingList.map((r) => r.workDate).join(', ')}. Please submit a regularization request so HR Lead can finalize your working hours.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              jumpToRegularizeDate({
                date: missingList[0].workDate,
                status: 'Missing Checkout',
                checkInAt: missingList[0].checkInAt
              })
            }
            className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
          >
            Fix Missing Checkout
          </button>
        </div>
      )}

      {/* Feedback Banner / Auth Waiting State */}
      {!crmToken && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              {authTokenLoading
                ? 'Securing authenticated session token with the server...'
                : 'Your CRM session needs re-authentication before loading attendance records.'}
            </span>
          </span>
          {!authTokenLoading && (
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition"
            >
              Sign In Again
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl p-4 text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => fetchDashboard()} className="underline font-semibold text-xs">
            Retry
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-xl p-3.5 border text-sm font-medium flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {feedback.text}
          </span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Row: Live Today Punch Console + 5 Summary KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Check-In / Break / Check-Out Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today ({dashboard?.todayDate || 'Today'})
              </p>
              <div className="mt-1.5 flex items-center gap-2.5 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(todayStatus)}`}>
                  {todayStatus}
                </span>
                {todayRecord?.lateMinutes > 0 && (
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    +{todayRecord.lateMinutes}m late
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {todayState.isCheckedIn ? 'Live Worked' : 'Net Worked'}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {todayRecord?.checkInAt
                  ? todayState.isCheckedIn
                    ? formatLiveElapsed(liveWorkedSeconds)
                    : formatDuration(todayRecord.netWorkMinutes)
                  : '00:00:00'}
              </p>
            </div>
          </div>

          {/* Check-in, Check-out, Break readouts */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Check-In</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                {formatClockTime(todayRecord?.checkInAt, tz)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Check-Out</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                {formatClockTime(todayRecord?.checkOutAt, tz)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Break</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                {formatDuration(todayRecord?.totalBreakMinutes || 0)}
              </p>
            </div>
          </div>

          {/* Optional Shift Note before check-in */}
          {todayState.canCheckIn && (
            <input
              type="text"
              value={shiftNote}
              onChange={(e) => setShiftNote(e.target.value)}
              placeholder="Optional check-in note (e.g., Working from Dubai Desk)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!todayState.canCheckIn || actionLoading || !crmToken}
              onClick={() => runAttendanceAction('/api/hr-ops/attendance/check-in', { notes: shiftNote })}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 text-white text-sm font-bold transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Check In</span>
            </button>

            {Number(activeShift.breakTrackingEnabled ?? 1) === 1 && todayState.isCheckedIn && (
              todayState.isOnBreak ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runAttendanceAction('/api/hr-ops/attendance/break/end')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition"
                >
                  <Coffee className="w-4 h-4" />
                  <span>End Break</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <select
                    value={breakType}
                    onChange={(e) => setBreakType(e.target.value)}
                    aria-label="Break type"
                    className="px-2 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <option value="General Break">Break</option>
                    <option value="Lunch Break">Lunch</option>
                    <option value="Tea Break">Tea</option>
                  </select>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => runAttendanceAction('/api/hr-ops/attendance/break/start', { breakType })}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs sm:text-sm font-bold transition"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                </div>
              )
            )}

            <button
              type="button"
              disabled={!todayState.canCheckOut || actionLoading || !crmToken}
              onClick={() => runAttendanceAction('/api/hr-ops/attendance/check-out')}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-400 text-white text-sm font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Check Out</span>
            </button>
          </div>
        </div>

        {/* Monthly KPI Summary Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Present Days</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.presentDays ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">On-time: {summary.onTimePresentDays ?? 0}</p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Absent Days</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {summary.absentDays ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Missing checkout: {summary.missingCheckoutDays ?? 0}</p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Leave Days</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {summary.leaveDays ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Holidays: {summary.holidayDays ?? 0}</p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Late Arrivals</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {summary.lateArrivals ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Grace: {activeShift.graceMinutes ?? 15}m after {activeShift.startTime || '09:00'}
            </p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attendance %</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {summary.attendancePercentage ?? 100}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Scheduled elapsed workdays</p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Work Hours</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-gold-400 mt-1">
              {workingHours.monthlyTotalFormatted || '0h 00m'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Avg: {workingHours.avgDailyFormatted || '0h 00m'} / day
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        {[
          { id: 'overview', label: 'Attendance History', icon: History },
          { id: 'calendar', label: 'Attendance Calendar', icon: CalendarIcon },
          { id: 'regularization', label: 'Regularization', icon: FileEdit },
          { id: 'hours', label: 'My Working Hours', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                active
                  ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'regularization' &&
                (dashboard?.regularizations || []).filter((r) => r.status === 'Pending').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-white">
                    {(dashboard?.regularizations || []).filter((r) => r.status === 'Pending').length}
                  </span>
                )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ATTENDANCE HISTORY TABLE */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['weekly', 'monthly', 'custom'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setRangeMode(mode);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    rangeMode === mode
                      ? 'bg-amber-500 text-white dark:bg-gold-500 dark:text-navy-950'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}

              {rangeMode === 'monthly' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    if (e.target.value) setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-700 dark:text-white"
                />
              )}

              {rangeMode === 'custom' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-700 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search date, status, shift..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by attendance status"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-700 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Holiday">Holiday</option>
                <option value="Weekly Off">Weekly Off</option>
                <option value="In Progress">In Progress</option>
                <option value="Missing Checkout">Missing Checkout</option>
                <option value="Not Checked In">Not Checked In</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {/* 9-column Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Day</th>
                  <th className="py-3 px-3">Shift</th>
                  <th className="py-3 px-3">Check-In Time</th>
                  <th className="py-3 px-3">Check-Out Time</th>
                  <th className="py-3 px-3">Break Duration</th>
                  <th className="py-3 px-3">Total Working Hours</th>
                  <th className="py-3 px-3">Attendance Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs sm:text-sm">
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      No attendance entries match the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.day}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="block font-medium text-xs text-slate-800 dark:text-slate-200">
                          {row.shiftName}
                        </span>
                        <span className="text-[11px] text-slate-400">{row.shiftTiming}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {formatClockTime(row.checkInAt, tz)}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {formatClockTime(row.checkOutAt, tz)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDuration(row.totalBreakMinutes)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {row.hasRealRecord ? formatDuration(row.netWorkMinutes) : '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(row.date)}
                            title="View Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {row.date <= (dashboard?.todayDate || '') &&
                            !['Holiday', 'Weekly Off'].includes(row.status) && (
                              <button
                                type="button"
                                onClick={() => jumpToRegularizeDate(row)}
                                title="Request Correction"
                                className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-gold-400 hover:bg-amber-50 dark:hover:bg-gold-500/10 transition"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {paginatedHistory.length} of {filteredHistory.length} days
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-semibold text-slate-700 dark:text-white">
                Page {Math.min(currentPage, totalPages)} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ATTENDANCE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
                  {selectedMonth}
                </h3>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Color + Accessible Text Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  Green: Present
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                  Orange: Late
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">
                  Red: Absent
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                  Blue: On Leave
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-white/15 dark:text-slate-300">
                  Grey: Holiday / Off
                </span>
              </div>
            </div>

            {/* Day of Week Headings */}
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: calendarLeadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/40 dark:bg-white/[0.02]" />
              ))}
              {(dashboard?.calendarDays || []).map((day) => {
                const dayNum = Number(day.date.split('-')[2]);
                const isSelected = selectedCalendarDay?.date === day.date;
                const cellClass =
                  CALENDAR_CELL_STYLE[day.status] ||
                  'bg-slate-50 border-slate-200 text-slate-700';

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedCalendarDay(day)}
                    className={`h-20 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition ${cellClass} ${
                      isSelected ? 'ring-2 ring-amber-500 dark:ring-gold-400 scale-[1.01]' : 'hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs sm:text-sm font-bold">{dayNum}</span>
                      {day.date === dashboard?.todayDate && (
                        <span className="text-[9px] font-bold px-1 py-0.2 bg-slate-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded">
                          TODAY
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold truncate">{day.status}</span>
                      {day.checkInFormatted && (
                        <span className="hidden sm:block text-[10px] opacity-80 truncate">
                          {day.checkInFormatted}
                          {day.checkOutFormatted ? ` - ${day.checkOutFormatted}` : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Inspector Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            {selectedCalendarDay ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedCalendarDay.date} ({selectedCalendarDay.day})
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedCalendarDay.status)}`}>
                      {selectedCalendarDay.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 rounded-xl p-3.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shift:</span>
                      <span className="font-semibold text-right">{selectedCalendarDay.shiftName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-In:</span>
                      <span className="font-semibold">{formatClockTime(selectedCalendarDay.checkInAt, tz)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Check-Out:</span>
                      <span className="font-semibold">{formatClockTime(selectedCalendarDay.checkOutAt, tz)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Break Duration:</span>
                      <span className="font-semibold">{formatDuration(selectedCalendarDay.totalBreakMinutes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Working Hours:</span>
                      <span className="font-semibold">{formatDuration(selectedCalendarDay.netWorkMinutes)}</span>
                    </div>
                    {selectedCalendarDay.notes && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                        <span className="text-slate-400 block mb-0.5">Note:</span>
                        <span>{selectedCalendarDay.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedCalendarDay.date <= (dashboard?.todayDate || '') &&
                  !['Holiday', 'Weekly Off'].includes(selectedCalendarDay.status) && (
                    <button
                      type="button"
                      onClick={() => jumpToRegularizeDate(selectedCalendarDay)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-gold-500 dark:text-navy-950 text-white text-xs font-bold transition"
                    >
                      Request Correction for {selectedCalendarDay.date}
                    </button>
                  )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto opacity-60" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Select any date
                </p>
                <p className="text-xs">
                  Click any calendar cell to view full shift, timestamp, break, and leave/holiday details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE REGULARIZATION */}
      {activeTab === 'regularization' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Request Form */}
          <form
            onSubmit={handleRegularizationSubmit}
            className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Attendance Correction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All correction requests require HR Lead / Admin approval before records are updated.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  required
                  max={dashboard?.todayDate || undefined}
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correction Type
                </label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Missed Check-In">Missed Check-In</option>
                  <option value="Missed Check-Out">Missed Check-Out</option>
                  <option value="Incorrect Timestamps">Incorrect Timestamps</option>
                  <option value="Incorrect Status">Incorrect Status</option>
                </select>
              </div>

              {/* Existing Recorded Values (Server Read-Only) */}
              <div className="rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 p-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Existing Recorded Values (Database)
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block">Check-In</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {regExisting?.checkIn || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-Out</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {regExisting?.checkOut || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {regExisting?.status || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Check-In
                  </label>
                  <input
                    type="time"
                    required={regType === 'Missed Check-In'}
                    value={regReqIn}
                    onChange={(e) => setRegReqIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Check-Out
                  </label>
                  <input
                    type="time"
                    required={regType === 'Missed Check-Out'}
                    value={regReqOut}
                    onChange={(e) => setRegReqOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {regType === 'Incorrect Status' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Status
                  </label>
                  <select
                    value={regReqStatus}
                    onChange={(e) => setRegReqStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Justification
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Describe why the attendance correction is needed (e.g., Client orientation extended past 6:30 PM; forgot to punch out)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={regSubmitting || !crmToken}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-gold-500 text-white dark:text-navy-950 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
              >
                {regSubmitting ? 'Submitting Request...' : 'Submit Regularization Request'}
              </button>
            </div>
          </form>

          {/* Submitted Regularizations Status Table */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Regularization Requests
            </h3>
            {!(dashboard?.regularizations || []).length ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No regularization requests submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.regularizations.map((reg) => {
                  const statusColor =
                    reg.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : reg.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300';

                  return (
                    <div
                      key={reg.id}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-navy-950 p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {reg.attendanceDate} • {reg.correctionType}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Ref: {reg.id} • Submitted {new Date(reg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                          {reg.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 block">Existing In/Out</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {reg.existingCheckIn || '—'} / {reg.existingCheckOut || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Requested In/Out</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {reg.requestedCheckIn || '—'} / {reg.requestedCheckOut || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Existing Status</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {reg.existingStatus || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Requested Status</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {reg.requestedStatus || 'Present'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Reason:</span> {reg.reason}
                      </p>

                      {reg.reviewerComments && (
                        <div className="rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-2.5 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            Reviewer ({reg.reviewerName || reg.reviewerRole || 'HR Lead'}):
                          </span>{' '}
                          <span className="text-slate-600 dark:text-slate-300">{reg.reviewerComments}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MY WORKING HOURS BREAKDOWN */}
      {activeTab === 'hours' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Monthly Net Work Hours</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {workingHours.monthlyTotalFormatted || '0h 00m'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Across {workingHours.workedDaysCount || 0} completed workday(s)
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Average Daily Hours</span>
                <Timer className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {workingHours.avgDailyFormatted || '0h 00m'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Shift target: {activeShift.startTime || '09:00'} - {activeShift.endTime || '18:00'}
                {Number(activeShift.isOvernight) === 1 ? ' (Overnight)' : ''}
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase">Total Break Duration</span>
                <Coffee className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {workingHours.totalBreakFormatted || '0h 00m'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Deducted automatically from gross span
              </p>
            </div>

            {workingHours.overtimeEnabled ? (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase">Approved Overtime</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-gold-400">
                  {workingHours.overtimeFormatted || '0h 00m'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Net work &gt; {Math.round((activeShift.overtimeThresholdMinutes || 480) / 60)}h threshold/shift
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase">Late Arrivals</span>
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {workingHours.lateArrivalsCount ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Total late: {formatDuration(workingHours.totalLateMinutes)}
                </p>
              </div>
            )}
          </div>

          {/* Daily Hours Visual Bar Breakdown */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Working Hours Breakdown ({selectedMonth})
            </h3>
            {!(dashboard?.history || []).some((d) => d.hasRealRecord) ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No completed work logs yet for this period. Check in to begin recording working hours.
              </p>
            ) : (
              <div className="space-y-2.5">
                {(dashboard?.history || [])
                  .filter((d) => d.hasRealRecord)
                  .map((d) => {
                    const targetMin = activeShift.overtimeThresholdMinutes || 480;
                    const pct = Math.min(100, Math.round((d.netWorkMinutes / targetMin) * 100));
                    return (
                      <div key={d.date} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {d.date} ({d.day}) • {d.status}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Net {formatDuration(d.netWorkMinutes)}
                            {d.totalBreakMinutes > 0 ? ` • Break ${formatDuration(d.totalBreakMinutes)}` : ''}
                            {d.overtimeMinutes > 0 ? ` • OT +${formatDuration(d.overtimeMinutes)}` : ''}
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.status === 'Missing Checkout'
                                ? 'bg-amber-500'
                                : d.status === 'Late'
                                  ? 'bg-orange-500'
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD DETAILS MODAL (Breaks & Audit Logs) */}
      {detailModalDate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full p-5 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Details — {detailModalDate}
                </h3>
                <p className="text-xs text-slate-400">Server-verified timestamps, breaks & audit history</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalDate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <p className="text-sm text-slate-400 py-8 text-center">Loading attendance audit details...</p>
            ) : detailData?.day ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-navy-950 rounded-xl p-3.5 border border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-900 dark:text-white">{detailData.day.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-In</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatClockTime(detailData.day.checkInAt, tz)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-Out</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatClockTime(detailData.day.checkOutAt, tz)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Gross Span</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatDuration(detailData.day.grossMinutes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Break Deducted</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatDuration(detailData.day.totalBreakMinutes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Net Work Hours</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatDuration(detailData.day.netWorkMinutes)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Break Logs</h4>
                  {!detailData.breaks?.length ? (
                    <p className="text-slate-400">No breaks recorded for this date.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {detailData.breaks.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10"
                        >
                          <span className="font-semibold">{b.breakType}</span>
                          <span>
                            {formatClockTime(b.breakStartAt, tz)} – {b.breakEndAt ? formatClockTime(b.breakEndAt, tz) : 'Active'} ({b.durationMinutes}m)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Audit Trail</h4>
                  {!detailData.auditLogs?.length ? (
                    <p className="text-slate-400">No audit entries for this date.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {detailData.auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10"
                        >
                          <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                            <span>{log.action}</span>
                            <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-rose-500 py-4 text-center">Unable to load day details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

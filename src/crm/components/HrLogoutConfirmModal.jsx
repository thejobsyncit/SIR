import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  X
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

const formatTime12h = (hhmm) => {
  if (!hhmm || !String(hhmm).includes(':')) return hhmm || '—';
  const [hStr, mStr] = String(hhmm).split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const formatClockIso = (isoStr) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatCountdown = (totalSeconds) => {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
};

export const HrLogoutConfirmModal = ({
  isOpen,
  isLoggingOut = false,
  onCancel,
  onConfirm
}) => {
  const { user, crmToken } = useCrm();
  const cancelBtnRef = useRef(null);

  const [step, setStep] = useState('warning'); // 'warning' | 'report'
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [ctxError, setCtxError] = useState('');
  const [reportCtx, setReportCtx] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Form state (preserved on validation/API/checkout errors)
  const [workCompleted, setWorkCompleted] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [workInProgress, setWorkInProgress] = useState('');
  const [issuesBlockers, setIssuesBlockers] = useState('');
  const [plannedNextSteps, setPlannedNextSteps] = useState('');
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reportSavedPendingCheckout, setReportSavedPendingCheckout] = useState(false);

  const buildAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (crmToken) headers.Authorization = `Bearer ${crmToken}`;
    if (user) {
      headers['x-user-data'] = JSON.stringify({
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        name: user.name
      });
    }
    return headers;
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    setStep('warning');
    setCtxError('');
    setSubmitError('');
    setValidationErrors({});
    setReportSavedPendingCheckout(false);
    setNowMs(Date.now());

    const focusTimer = window.setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 0);

    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut && !submitting) {
        e.preventDefault();
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Fetch authoritative shift, attendance, tasks, and existing daily report from backend
    let cancelled = false;
    (async () => {
      setLoadingCtx(true);
      try {
        const res = await fetch('/api/hr-ops/daily-reports/me', {
          headers: buildAuthHeaders()
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Unable to verify shift and daily report status.');
        }
        setReportCtx(json.data);
        const existing = json.data?.existingReport;
        if (existing) {
          setWorkCompleted(existing.workCompleted || '');
          setTasksCompleted(existing.tasksCompleted || '');
          setWorkInProgress(existing.workInProgress || '');
          setIssuesBlockers(existing.issuesBlockers || '');
          setPlannedNextSteps(existing.plannedNextSteps || '');
          setAdditionalRemarks(existing.additionalRemarks || '');
        } else {
          setWorkCompleted('');
          setTasksCompleted('');
          setWorkInProgress('');
          setIssuesBlockers('');
          setPlannedNextSteps('');
          setAdditionalRemarks('');
        }
      } catch (err) {
        if (!cancelled) {
          setCtxError(err.message || 'Failed to load shift & attendance details.');
        }
      } finally {
        if (!cancelled) setLoadingCtx(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(focusTimer);
      window.clearInterval(tick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const shiftInfo = reportCtx?.shift || null;
  const attendanceInfo = reportCtx?.attendance || null;
  const existingReport = reportCtx?.existingReport || null;
  const assignedTasks = reportCtx?.assignedTasks || [];

  const remainingSeconds = useMemo(() => {
    if (!shiftInfo?.shiftEndAtIso) return 0;
    const endMs = new Date(shiftInfo.shiftEndAtIso).getTime();
    if (!Number.isFinite(endMs)) return 0;
    return Math.max(0, Math.floor((endMs - nowMs) / 1000));
  }, [shiftInfo?.shiftEndAtIso, nowMs]);

  const isShiftFinished = shiftInfo ? remainingSeconds <= 0 : false;
  const hasSubmittedReport = Boolean(existingReport && existingReport.submissionStatus === 'SUBMITTED');

  const broadcastAttendanceUpdate = () => {
    try {
      localStorage.setItem('sir_attendance_updated_at', String(Date.now()));
      window.dispatchEvent(new CustomEvent('sir-attendance-updated', { detail: { source: 'daily-report-checkout' } }));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('sir_attendance_updated');
        bc.postMessage({ source: 'daily-report-checkout', updatedAt: Date.now() });
        bc.close();
      }
    } catch (_) {}
  };

  const handleCheckoutWithExistingReport = async () => {
    if (submitting || isLoggingOut) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/hr-ops/daily-reports/submit-and-checkout', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ useExistingReport: true })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.reportSaved || !json?.checkoutCompleted) {
        if (json?.reportSaved) setReportSavedPendingCheckout(true);
        throw new Error(json?.message || 'Failed to complete attendance checkout.');
      }
      broadcastAttendanceUpdate();
      onConfirm?.();
    } catch (err) {
      setSubmitError(err.message || 'Network or server error while completing checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReportAndLogout = async (e) => {
    e?.preventDefault?.();
    if (submitting || isLoggingOut) return;

    if (reportSavedPendingCheckout) {
      await handleCheckoutWithExistingReport();
      return;
    }

    const errs = {};
    if (!workCompleted.trim()) errs.workCompleted = 'Please describe the work completed today.';
    if (!tasksCompleted.trim()) errs.tasksCompleted = 'Please list the tasks completed today.';
    if (!workInProgress.trim()) errs.workInProgress = 'Please summarize work currently in progress.';
    if (!plannedNextSteps.trim()) errs.plannedNextSteps = 'Please specify planned next steps.';

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      setSubmitError('Please complete all required fields before submitting.');
      return;
    }

    setValidationErrors({});
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/hr-ops/daily-reports/submit-and-checkout', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          workCompleted: workCompleted.trim(),
          tasksCompleted: tasksCompleted.trim(),
          workInProgress: workInProgress.trim(),
          issuesBlockers: issuesBlockers.trim(),
          plannedNextSteps: plannedNextSteps.trim(),
          additionalRemarks: additionalRemarks.trim()
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success || !json?.reportSaved || !json?.checkoutCompleted) {
        if (json?.errors) setValidationErrors(json.errors);
        if (json?.reportSaved && !json?.checkoutCompleted) {
          setReportSavedPendingCheckout(true);
        }
        throw new Error(json?.message || 'Could not submit daily report and complete checkout.');
      }

      broadcastAttendanceUpdate();
      onConfirm?.();
    } catch (err) {
      setSubmitError(err.message || 'Network error. Your entered report data has been preserved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const busy = isLoggingOut || submitting;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      role="presentation"
      data-testid="hr-logout-confirm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onCancel?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-logout-confirm-title"
        data-testid="hr-logout-confirm-modal"
        className={`w-full ${step === 'report' ? 'max-w-2xl' : 'max-w-md'} rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 shadow-2xl p-6 space-y-5 text-left my-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              step === 'report'
                ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                : !isShiftFinished
                  ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}>
              {step === 'report' ? (
                <FileText className="w-5 h-5" />
              ) : !isShiftFinished ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                id="hr-logout-confirm-title"
                className="font-serif text-base font-bold text-slate-900 dark:text-white leading-snug"
              >
                {step === 'report'
                  ? 'Daily Work Report & Checkout'
                  : !isShiftFinished && shiftInfo
                    ? 'Your shift has not finished yet.'
                    : hasSubmittedReport
                      ? 'Confirm Checkout & Logout'
                      : 'Daily Work Report Required'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {step === 'report'
                  ? 'Submit your end-of-day work summary to record checkout and sign out.'
                  : hasSubmittedReport
                    ? 'Today’s daily work report is already submitted. You may proceed to checkout.'
                    : 'Please review your shift status before logging out.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => !busy && onCancel?.()}
            aria-label="Close logout confirmation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading state */}
        {loadingCtx ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>Checking shift schedule, attendance, and daily report status...</span>
          </div>
        ) : ctxError ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
              {ctxError}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => onCancel?.()}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Continue Working
              </button>
            </div>
          </div>
        ) : step === 'warning' ? (
          <div className="space-y-4">
            {/* Shift & Attendance Summary Box */}
            <div className="rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Assigned Shift</span>
                <span className="font-bold text-slate-900 dark:text-white">{shiftInfo?.name || 'General Shift'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Shift Ends At</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatTime12h(shiftInfo?.endTime)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Time Remaining</span>
                <span className={`font-bold tabular-nums ${
                  isShiftFinished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isShiftFinished ? '0m (Shift Finished)' : formatCountdown(remainingSeconds)}
                </span>
              </div>
              {attendanceInfo?.checkInAt && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400">First Check-In / Worked</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatClockIso(attendanceInfo.checkInAt)} · {attendanceInfo.workingHours || '0h 00m'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Daily Report Status</span>
                {hasSubmittedReport ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submitted
                  </span>
                ) : (
                  <span className="font-bold text-amber-600 dark:text-amber-400">Pending Submission</span>
                )}
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
                {submitError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                ref={cancelBtnRef}
                type="button"
                disabled={busy}
                onClick={() => !busy && onCancel?.()}
                data-testid="hr-logout-cancel-btn"
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Continue Working
              </button>

              {hasSubmittedReport ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCheckoutWithExistingReport}
                  data-testid="hr-logout-confirm-btn"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-rose-400/40 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  <span>{submitting ? 'Completing Checkout...' : 'Checkout & Logout'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStep('report')}
                  data-testid="hr-logout-open-report-btn"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submit Daily Report</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Phase 2: Mandatory Daily Work Report Form */
          <form onSubmit={handleSubmitReportAndLogout} className="space-y-4">
            {/* Employee & Shift Context Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-white/10 p-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">Employee</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {reportCtx?.employee?.name || user?.name} ({reportCtx?.employee?.employeeId || user?.employeeId})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Report Date</span>
                <span className="font-bold text-slate-800 dark:text-white">{reportCtx?.reportDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Shift</span>
                <span className="font-bold text-slate-800 dark:text-white">{shiftInfo?.name || 'General Shift'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Check-In / Hours</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatClockIso(attendanceInfo?.checkInAt)} · {attendanceInfo?.workingHours || '0h 00m'}
                </span>
              </div>
            </div>

            {/* Assigned Tasks Reference (read-only from HR Task System) */}
            {assignedTasks.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-navy-950/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
                  <span>Your Assigned Tasks ({assignedTasks.length})</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {assignedTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-2">{t.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 shrink-0">
                        {t.status || 'Assigned'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Completed Today <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="Summarize the key work accomplished during your shift..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {validationErrors.workCompleted && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.workCompleted}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tasks Completed <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="List completed tasks or tickets..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {validationErrors.tasksCompleted && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.tasksCompleted}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work in Progress <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={workInProgress}
                  onChange={(e) => setWorkInProgress(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="Ongoing items carrying forward..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {validationErrors.workInProgress && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.workInProgress}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Planned Next Steps <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={plannedNextSteps}
                  onChange={(e) => setPlannedNextSteps(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="Priorities for the next workday..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {validationErrors.plannedNextSteps && (
                  <p className="text-[11px] text-rose-500 mt-1">{validationErrors.plannedNextSteps}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issues or Blockers
                </label>
                <textarea
                  rows={2}
                  value={issuesBlockers}
                  onChange={(e) => setIssuesBlockers(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="Any blockers or escalations (optional)..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Remarks
                </label>
                <input
                  type="text"
                  value={additionalRemarks}
                  onChange={(e) => setAdditionalRemarks(e.target.value)}
                  disabled={reportSavedPendingCheckout || busy}
                  placeholder="Optional handover notes or remarks..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
                {submitError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                disabled={busy}
                onClick={() => !busy && setStep('warning')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
              >
                Back
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => !busy && onCancel?.()}
                  data-testid="hr-logout-cancel-btn"
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Continue Working
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  data-testid="hr-submit-report-logout-btn"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-rose-400/40 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : reportSavedPendingCheckout ? (
                    <RefreshCw className="w-3.5 h-3.5" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {submitting
                      ? 'Submitting & Checking Out...'
                      : reportSavedPendingCheckout
                        ? 'Retry Checkout & Logout'
                        : 'Submit Report & Logout'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HrLogoutConfirmModal;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldAlert, RefreshCw, Check, X, CheckCircle2, Crown, Clock } from 'lucide-react';

export const ShiftLateArrivalApprovalSection = ({ currentRole = 'Super Admin', crmToken, onAuditClick }) => {
  const [pendingLateApprovals, setPendingLateApprovals] = useState([]);
  const [loadingLateApprovals, setLoadingLateApprovals] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [lateApprovalNotice, setLateApprovalNotice] = useState('');

  // Keep references updated to prevent interval teardown and duplicate fetches
  const roleRef = useRef(currentRole);
  const tokenRef = useRef(crmToken);
  const isFetchingRef = useRef(false);
  const recentlyHandledIds = useRef(new Set());

  useEffect(() => {
    roleRef.current = currentRole;
    tokenRef.current = crmToken;
  }, [currentRole, crmToken]);

  const isSuperAdmin = currentRole === 'Super Admin' || currentRole === 'Admin';
  const isHrLead = currentRole === 'HR Lead';

  // Stable, flicker-free fetcher
  const fetchPendingLateApprovals = useCallback(async (isManual = false) => {
    const activeRole = roleRef.current || 'Super Admin';
    const isLeadership = activeRole === 'Super Admin' || activeRole === 'Admin' || activeRole === 'HR Lead';
    if (!isLeadership) return;

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManual) {
      setLoadingLateApprovals(true);
    }

    try {
      const res = await fetch('/api/hr-ops/attendance/late-approvals/pending', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-crm-role': activeRole,
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {})
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          // Filter out items that were just approved or rejected in this local session
          const cleanData = json.data.filter(item => !recentlyHandledIds.current.has(item.id));

          // Deep signature check: avoid re-rendering if data is unchanged
          setPendingLateApprovals(prev => {
            const prevSignature = prev.map(p => `${p.id}:${p.lateApprovalStatus}:${p.lateMinutes}`).join('|');
            const newSignature = cleanData.map(p => `${p.id}:${p.lateApprovalStatus}:${p.lateMinutes}`).join('|');
            if (prevSignature === newSignature) {
              return prev; // Exact match: keep reference to prevent flicker
            }
            return cleanData;
          });
        }
      }
    } catch (e) {
      console.error('Error fetching pending late approvals:', e);
    } finally {
      isFetchingRef.current = false;
      if (isManual) {
        setLoadingLateApprovals(false);
      }
    }
  }, []);

  // Stable interval: run silently in the background every 10 seconds when tab is visible
  useEffect(() => {
    fetchPendingLateApprovals(false);
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchPendingLateApprovals(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchPendingLateApprovals]);

  // Instant 0ms Optimistic UI updates on decision
  const handleLateApprovalDecision = async (attendanceId, decision, employeeName = 'Employee') => {
    const isApprove = decision === 'APPROVED';

    // 1. Immediately remove from local state for 0ms instantaneous feedback
    recentlyHandledIds.current.add(attendanceId);
    setPendingLateApprovals(prev => prev.filter(req => req.id !== attendanceId));
    setApprovingId(attendanceId);

    setLateApprovalNotice(
      isApprove 
        ? `✓ Authorized late workspace entry for ${employeeName}. Access unlocked.`
        : `✕ Rejected late arrival entry for ${employeeName}. Access restricted.`
    );

    setTimeout(() => {
      setLateApprovalNotice(prev => (prev.includes(employeeName) ? '' : prev));
    }, 5000);

    // 2. Dispatch background server request
    try {
      const activeRole = roleRef.current || 'Super Admin';
      const res = await fetch(`/api/hr-ops/attendance/late-approvals/${attendanceId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-crm-role': activeRole,
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {})
        },
        body: JSON.stringify({
          decision,
          approvedBy: `${activeRole} (${activeRole.includes('Lead') ? 'HR Leadership Console' : 'Executive Console'})`,
          notes: isApprove
            ? `Authorized late entry by ${activeRole}`
            : `Access denied by ${activeRole}`
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || 'Server returned failure response');
      }

      // Retain in recentlyHandledIds for 12 seconds so server synchronization catches up cleanly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('late-approvals-updated'));
      }
      setTimeout(() => {
        recentlyHandledIds.current.delete(attendanceId);
      }, 12000);
    } catch (err) {
      console.error('Failed to submit late approval decision:', err);
      recentlyHandledIds.current.delete(attendanceId);
      setLateApprovalNotice(`⚠️ Could not save decision for ${employeeName}: ${err.message || 'Network error'}. Retrying...`);
      fetchPendingLateApprovals(true);
    } finally {
      setApprovingId(null);
    }
  };

  const formatLateDelayText = (mins) => {
    const m = Math.max(0, parseInt(mins, 10) || 0);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `+${h}h ${rem}m Late` : `+${h}h Late`;
    }
    return `+${m}m Late`;
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
      pendingLateApprovals.length > 0
        ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-[#21090d] dark:via-[#1f1307] dark:to-[#170a0c] border-rose-400 dark:border-rose-500/60'
        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800'
    }`}>
      {/* Notice Alert */}
      {lateApprovalNotice && (
        <div className="mb-4 p-3 bg-slate-900 text-white rounded-2xl text-xs font-bold animate-in fade-in flex items-center justify-between shadow-lg">
          <span>{lateApprovalNotice}</span>
          <button onClick={() => setLateApprovalNotice('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-rose-200/60 dark:border-rose-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${
            pendingLateApprovals.length > 0 
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse' 
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Shift Late Arrival Approvals
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                pendingLateApprovals.length > 0
                  ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
              }`}>
                {pendingLateApprovals.length} {pendingLateApprovals.length === 1 ? 'Pending Action' : 'Pending Actions'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {pendingLateApprovals.length > 0
                ? isHrLead
                  ? 'Team members logged in after scheduled shift grace. HR Lead authorization is active to unlock employee workspace access.'
                  : 'Team members logged in after scheduled shift grace. Super Admin authorization is required to unlock workspace access.'
                : 'All active team member clock-ins are compliant within scheduled shift grace windows. No access blocks active.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchPendingLateApprovals(true)}
            disabled={loadingLateApprovals}
            className="px-3 py-1.5 bg-white/80 dark:bg-navy-950/80 hover:bg-white dark:hover:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Refresh approval queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLateApprovals ? 'animate-spin text-rose-500' : ''}`} />
            <span>Refresh Queue</span>
          </button>
          {onAuditClick && (
            <button
              onClick={onAuditClick}
              className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Full Attendance Audit →
            </button>
          )}
        </div>
      </div>

      {/* Pending Requests Cards */}
      {pendingLateApprovals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
          {pendingLateApprovals.map((req) => {
            const isProcessing = approvingId === req.id;
            const formattedLoginTime = req.checkInAt 
              ? new Date(req.checkInAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
              : '--:--';
            const isTargetHrLead = String(req.role || '').toLowerCase().includes('lead');

            return (
              <div
                key={req.id}
                className="p-4 bg-white dark:bg-navy-950 border-2 border-rose-300 dark:border-rose-900/60 rounded-2xl shadow-sm flex flex-col justify-between gap-3.5 transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {(req.employeeName || 'EM').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {req.employeeName}
                          </h4>
                          {isTargetHrLead && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase flex items-center gap-0.5" title="HR Lead: Super Admin authorization required">
                              <Crown className="w-2.5 h-2.5" />
                              Lead
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium truncate">
                          {req.employeeId || 'ID Pending'} • {req.role || req.department || 'Employee'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0">
                      {formatLateDelayText(req.lateMinutes)}
                    </span>
                  </div>

                  {isTargetHrLead && isSuperAdmin && (
                    <div className="mt-2 py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-600/30 text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 shrink-0 text-amber-600" />
                      <span>Executive Level: Only Super Admin can authorize HR Lead late arrivals</span>
                    </div>
                  )}

                  <div className="mt-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-navy-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.department || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Shift Roster:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={req.shiftName}>
                        {req.shiftStart ? `${req.shiftStart} - ${req.shiftEnd || '18:00'}` : (req.shiftName || 'General Shift')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Login Attempt:</span>
                      <span className="font-mono font-bold text-amber-700 dark:text-gold-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedLoginTime}
                      </span>
                    </div>
                    {req.notes && (
                      <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-navy-700 text-[11px] text-amber-800 dark:text-gold-300">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-slate-400">Employee Note:</span>
                        <span className="font-medium italic leading-tight block mt-0.5">{req.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-navy-800">
                  <button
                    onClick={() => handleLateApprovalDecision(req.id, 'APPROVED', req.employeeName)}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    <span>{isProcessing ? 'Unlocking...' : 'Approve Access'}</span>
                  </button>
                  <button
                    onClick={() => handleLateApprovalDecision(req.id, 'REJECTED', req.employeeName)}
                    disabled={isProcessing}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Deny workspace access"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No shift late approvals pending. All employees within grace window have direct workspace access.</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ Enterprise Governance Active
          </span>
        </div>
      )}
    </div>
  );
};

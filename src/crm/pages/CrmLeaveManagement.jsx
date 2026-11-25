import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, CheckCircle2, AlertCircle, Clock, ShieldCheck, Lock, 
  Search, Filter, Plus, Edit3, X, Check, XCircle, ArrowRight, UserCheck, Send, RefreshCw, MessageSquare
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const CrmLeaveManagement = ({ isSuperAdmin, currentRole }) => {
  const { crmToken, currentRole: ctxRole, user } = useCrm();
  const effectiveRole = currentRole || ctxRole || 'Super Admin';
  const isSuperAdminOrAdmin = isSuperAdmin || effectiveRole === 'Super Admin' || effectiveRole === 'Admin';
  const isHrLead = effectiveRole === 'HR Lead';
  const canReviewLeaves = isSuperAdminOrAdmin || isHrLead;

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, declinedCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Apply Leave Modal (Available to all roles)
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // Decline / Reject Modal with remarks
  const [declineModalLeave, setDeclineModalLeave] = useState(null);
  const [declineNotes, setDeclineNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-crm-role': effectiveRole,
    'x-employee-email': user?.email || (isHrLead ? 'priya.lead@revivalinternational.com' : 'thejobsyncit@gmail.com'),
    'x-employee-id': user?.employeeId || '',
    ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
  }), [effectiveRole, user, isHrLead, crmToken]);

  const fetchLeavesAndBalances = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const queryParams = new URLSearchParams({
        role: effectiveRole,
        email: user?.email || '',
        employeeId: user?.employeeId || '',
        ...(!canReviewLeaves ? { myOnly: 'true' } : {})
      });

      const [leavesRes, balRes] = await Promise.all([
        fetch(`/api/hr-ops/leaves?${queryParams.toString()}`, { headers: getAuthHeaders() }),
        fetch('/api/hr-ops/leaves/balances', { headers: getAuthHeaders() })
      ]);

      if (leavesRes.ok) {
        const data = await leavesRes.json();
        if (data?.success) {
          setLeaves(data.leaves || []);
          if (data.stats) setStats(data.stats);
        }
      }

      if (balRes.ok) {
        const balData = await balRes.json();
        if (balData?.success) {
          setBalances(balData.balances || []);
        }
      }
    } catch (err) {
      console.error('Failed to sync leave data:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [effectiveRole, user, canReviewLeaves, getAuthHeaders]);

  useEffect(() => {
    fetchLeavesAndBalances(true);
    // Live 3-second polling so approvals/rejections or new applications reflect in real time
    const interval = setInterval(() => {
      fetchLeavesAndBalances(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLeavesAndBalances]);

  // Apply for Leave Submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.reason.trim()) {
      showToast('Please enter a reason or message for your leave request.', 'error');
      return;
    }

    const d1 = new Date(applyForm.startDate);
    const d2 = new Date(applyForm.endDate);
    if (d2 < d1) {
      showToast('End date cannot be earlier than start date.', 'error');
      return;
    }
    const days = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    setApplySubmitting(true);
    try {
      const res = await fetch('/api/hr-ops/leaves/apply', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          leaveType: applyForm.leaveType,
          startDate: applyForm.startDate,
          endDate: applyForm.endDate,
          days,
          reason: applyForm.reason.trim(),
          employeeId: user?.employeeId,
          email: user?.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('✓ Leave application submitted! Awaiting managerial review.');
        setIsApplyOpen(false);
        setApplyForm({
          leaveType: 'Casual Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: ''
        });
        await fetchLeavesAndBalances(false);
      } else {
        showToast(data.message || 'Failed to submit leave request.', 'error');
      }
    } catch (err) {
      showToast('Network error submitting leave application.', 'error');
    } finally {
      setApplySubmitting(false);
    }
  };

  // Manager Decision: Approve Leave
  const handleApproveLeave = async (leave) => {
    if (!canReviewLeaves) return;
    setProcessingId(leave.id);
    try {
      const res = await fetch(`/api/hr-ops/leaves/${leave.id}/decision`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision: 'Approved',
          notes: `Sanctioned by ${effectiveRole}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Approved ${leave.leaveType} for ${leave.name}. Employee notified.`);
        await fetchLeavesAndBalances(false);
      } else {
        showToast(data.message || 'Could not approve leave request.', 'error');
      }
    } catch (err) {
      showToast('Network error processing approval.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Manager Decision: Decline / Reject Leave
  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!declineModalLeave || !canReviewLeaves) return;
    setProcessingId(declineModalLeave.id);
    try {
      const res = await fetch(`/api/hr-ops/leaves/${declineModalLeave.id}/decision`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision: 'Declined',
          notes: declineNotes.trim() || 'Declined due to operational requirements'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Leave request for ${declineModalLeave.name} marked as Declined.`);
        setDeclineModalLeave(null);
        setDeclineNotes('');
        await fetchLeavesAndBalances(false);
      } else {
        showToast(data.message || 'Could not decline leave request.', 'error');
      }
    } catch (err) {
      showToast('Network error processing rejection.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const myBalance = balances.find(b => 
    (user?.employeeId && b.id === user.employeeId) || 
    (user?.name && b.name.toLowerCase() === user.name.toLowerCase())
  ) || { casual: 8, sick: 10, paid: 15, total: 33 };

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = !search || 
      String(l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(l.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      String(l.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      String(l.leaveType || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Pending' && String(l.status).toLowerCase().includes('pending')) ||
      (statusFilter === 'Approved' && String(l.status).toLowerCase() === 'approved') ||
      (statusFilter === 'Declined' && (String(l.status).toLowerCase().includes('decline') || String(l.status).toLowerCase().includes('reject')));
    return matchesSearch && matchesStatus;
  });

  const pendingLeaves = leaves.filter(l => String(l.status).toLowerCase().includes('pending'));
  const approvedLeaves = leaves.filter(l => String(l.status).toLowerCase() === 'approved');
  const declinedLeaves = leaves.filter(l => String(l.status).toLowerCase().includes('decline') || String(l.status).toLowerCase().includes('reject'));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3 ${
          toastType === 'error'
            ? 'bg-rose-950 text-rose-100 border-rose-500/60'
            : 'bg-navy-950 text-white border-gold-500/50'
        }`}>
          {toastType === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-serif font-black text-xl text-slate-900 dark:text-white">
              {canReviewLeaves ? 'Workforce Leave Governance & Approval Ledger' : 'My Leave Requests & Entitlements'}
            </h2>
            {canReviewLeaves ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-gold-400 border border-amber-300 dark:border-gold-500/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-gold-500" />
                {effectiveRole} Authorization Mode
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 inline-flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-500" />
                {effectiveRole} Portal
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {canReviewLeaves
              ? 'Review employee leave messages, approve or decline absence requests, and track workforce leave quotas in real time.'
              : 'Submit leave applications with reasons and track live approval or rejection decisions from HR Lead & Super Admin.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => fetchLeavesAndBalances(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh live leave feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsApplyOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-navy-950 font-extrabold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">
            {canReviewLeaves ? 'Pending Applications' : 'My Pending Requests'}
          </span>
          <p className="text-2xl font-serif font-black text-amber-600 mt-1">{pendingLeaves.length}</p>
          <span className="text-[10px] text-amber-600 font-semibold">
            {canReviewLeaves ? 'Awaiting Decision' : 'Awaiting Manager Approval'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">
            {canReviewLeaves ? 'Approved Leaves' : 'My Approved Leaves'}
          </span>
          <p className="text-2xl font-serif font-black text-emerald-600 mt-1">{approvedLeaves.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Sanctioned & Okay ✓</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">
            {canReviewLeaves ? 'Declined Requests' : 'My Declined Requests'}
          </span>
          <p className="text-2xl font-serif font-black text-rose-600 mt-1">{declinedLeaves.length}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Not Approved ✕</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">
            {canReviewLeaves ? 'On-Roll Workforce' : 'My Leave Balance'}
          </span>
          <p className="text-2xl font-serif font-black text-slate-800 dark:text-slate-200 mt-1">
            {canReviewLeaves ? balances.length : `${myBalance.total} Days`}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">
            {canReviewLeaves ? 'Live Quota Tracked' : `Casual: ${myBalance.casual} • Sick: ${myBalance.sick} • Paid: ${myBalance.paid}`}
          </span>
        </div>
      </div>

      {/* SECTION 1: Leave Applications List */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              {canReviewLeaves ? 'Submitted Leave Applications' : 'My Leave Application History & Decision Status'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {canReviewLeaves
                ? 'Review employee messages, dates, and approve or decline leave requests with real-time notifications'
                : 'Live status updates: Approved (Sanctioned) or Declined (Not Approved) appear automatically'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, type or message..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending ({pendingLeaves.length})</option>
              <option value="Approved">Approved ({approvedLeaves.length})</option>
              <option value="Declined">Declined ({declinedLeaves.length})</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {loading && leaves.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading live leave applications from database...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-10 text-center space-y-2 border-2 border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-500">No leave requests found matching your filter.</p>
              <button
                onClick={() => setIsApplyOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-gold-400 font-bold text-xs hover:bg-amber-500/20 transition cursor-pointer"
              >
                + Submit New Leave Request
              </button>
            </div>
          ) : (
            filteredLeaves.map(l => {
              const isPending = String(l.status || '').toLowerCase().includes('pending');
              const isApproved = String(l.status || '').toLowerCase() === 'approved';
              const isDeclined = String(l.status || '').toLowerCase().includes('decline') || String(l.status || '').toLowerCase().includes('reject');

              const isTargetHrLead = String(l.role || '').toLowerCase().includes('lead');
              const isSelf = user?.employeeId && l.employeeId === user.employeeId;
              const canApproveThis = isSuperAdminOrAdmin ? !isSelf : (isHrLead && !isTargetHrLead && !isSelf);

              return (
                <div
                  key={l.id}
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                    isPending
                      ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-500/30'
                      : isApproved
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-500/25'
                        : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200/70 dark:border-rose-500/25'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{l.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({l.employeeId} • {l.role || l.department})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {l.leaveType || l.type}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 bg-white/80 dark:bg-navy-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        "{l.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 flex-wrap">
                      <span>📅 {l.startDate} to {l.endDate} ({l.days} Day{l.days > 1 ? 's' : ''})</span>
                      <span>• Submitted: {l.submittedAt}</span>
                      {l.reviewedBy && (
                        <span className="text-slate-600 dark:text-slate-400 font-semibold">
                          • Reviewed by: {l.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decision / Status Column */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      canReviewLeaves ? (
                        canApproveThis ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setDeclineModalLeave(l);
                                setDeclineNotes('');
                              }}
                              disabled={processingId === l.id}
                              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                            <button
                              onClick={() => handleApproveLeave(l)}
                              disabled={processingId === l.id}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>{processingId === l.id ? 'Processing...' : 'Approve Leave'}</span>
                            </button>
                          </div>
                        ) : isTargetHrLead && isHrLead ? (
                          <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/40 inline-flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>Requires Super Admin</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-500 border border-slate-200 dark:border-navy-700 inline-flex items-center gap-1.5">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Pending Review</span>
                          </span>
                        )
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pending Approval</span>
                        </span>
                      )
                    ) : isApproved ? (
                      <div className="flex flex-col items-end">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 inline-flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Approved ✓ (Okay)</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 inline-flex items-center gap-1.5 shadow-2xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Declined ✕ (Not Approved)</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: Workforce Leave Quota Matrix (Visible to Leadership, or Personal Summary for Staff) */}
      {canReviewLeaves && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                Annual Workforce Leave Quota Matrix
              </h3>
              <p className="text-[10px] text-slate-500">Live leave balances computed from database records</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Auto-deducted upon Leave Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Employee Name & ID</th>
                  <th className="p-4 font-bold">Department & Role</th>
                  <th className="p-4 font-bold text-center">Casual Leave</th>
                  <th className="p-4 font-bold text-center">Medical / Sick</th>
                  <th className="p-4 font-bold text-center">Privilege / Paid</th>
                  <th className="p-4 font-bold text-center">Total Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {balances.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {b.name}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{b.id}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {b.department}
                      <span className="block text-[10px] text-slate-400">{b.role}</span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-blue-600">{b.casual} Days</td>
                    <td className="p-4 text-center font-mono font-bold text-amber-600">{b.sick} Days</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600">{b.paid} Days</td>
                    <td className="p-4 text-center font-mono font-black text-slate-900 dark:text-white">
                      {b.total} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Submit Leave Application
                </h3>
                <p className="text-[11px] text-slate-500">
                  Applying as <strong>{user?.name || 'Staff'}</strong> ({effectiveRole})
                </p>
              </div>
              <button
                onClick={() => setIsApplyOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Leave Category
                </label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
                >
                  <option value="Casual Leave">Casual Leave (Available: {myBalance.casual}d)</option>
                  <option value="Sick Leave">Sick / Medical Leave (Available: {myBalance.sick}d)</option>
                  <option value="Privilege / Earned Leave">Privilege / Paid Leave (Available: {myBalance.paid}d)</option>
                  <option value="Emergency Leave">Emergency Personal Leave</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reason / Message for Manager
                </label>
                <textarea
                  rows={3}
                  required
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Enter reason for leave (e.g. Viral fever rest, Family function, Urgent travel)..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-navy-950 font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applySubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECLINE / REJECT REASON MODAL */}
      {declineModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-rose-300 dark:border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-rose-700 dark:text-rose-400">
                  Decline Leave Request
                </h3>
                <p className="text-[11px] text-slate-500">
                  Declining <strong>{declineModalLeave.name}</strong>'s {declineModalLeave.leaveType}
                </p>
              </div>
              <button
                onClick={() => setDeclineModalLeave(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Rejection Remarks (Visible to Employee)
                </label>
                <textarea
                  rows={3}
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  placeholder="Optional reason for declining (e.g., Critical project deadline / Insufficient team coverage)..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalLeave(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === declineModalLeave.id}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {processingId === declineModalLeave.id ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmLeaveManagement;

import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, Building2, Globe, Briefcase, Award, TrendingUp, Calendar, Clock, 
  DollarSign, ShieldCheck, CheckCircle2, ArrowUpRight, GraduationCap, 
  Compass, BookOpen, AlertCircle, ChevronRight, Phone, MessageSquare, 
  Filter, RefreshCw, CheckSquare, Layers, UserCheck, XCircle, LayoutDashboard, Eye,
  ShieldAlert, Check, X, Lock
} from 'lucide-react';
import { RECRUITER_LEADERBOARD, AUDIT_LOGS } from '../data/mockCrmData';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmHrLeadDashboard } from './CrmHrLeadDashboard';
import { CrmRecruiterDashboard } from './CrmRecruiterDashboard';
import { CrmPlacementCoordinatorDashboard } from './CrmPlacementCoordinatorDashboard';
import { CrmHrOperationsDashboard } from './CrmHrOperationsDashboard';
import { CrmInterviewerDashboard } from './CrmInterviewerDashboard';

export const CrmDashboard = () => {
  const { 
    currentRole, 
    crmToken,
    consultingMetrics, 
    fetchConsultingMetrics,
    leadMetrics,
    fetchLeadMetrics,
    serviceBreakdown,
    followUpsSummary,
    fetchFollowUpsSummary,
    setActiveModule,
    updateFollowUpStatus,
    leads,
    fetchLeads,
    candidates = [],
    clients = [],
    invoices = [],
    interviews = []
  } = useCrm();

  // Admin/Super Admin preview tab for inspecting other role dashboards
  const [adminRoleView, setAdminRoleView] = useState('master');
  const [dateRange, setDateRange] = useState('all');
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Executive Shift Late Arrival Approvals (Super Admin / Admin authorization)
  const [pendingLateApprovals, setPendingLateApprovals] = useState([]);
  const [loadingLateApprovals, setLoadingLateApprovals] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [lateApprovalNotice, setLateApprovalNotice] = useState('');

  const fetchPendingLateApprovals = async () => {
    if (currentRole !== 'Super Admin' && currentRole !== 'Admin') return;
    try {
      setLoadingLateApprovals(true);
      const endpoints = [
        '/api/hr-ops/attendance/late-approvals/pending',
        'http://localhost:5000/api/hr-ops/attendance/late-approvals/pending'
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            headers: {
              'Content-Type': 'application/json',
              'x-crm-role': currentRole || 'Super Admin',
              ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
            }
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
              setPendingLateApprovals(json.data);
              break;
            }
          }
        } catch (_) {}
      }
    } catch (e) {
      console.error('Error fetching pending late approvals:', e);
    } finally {
      setLoadingLateApprovals(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'Super Admin' || currentRole === 'Admin') {
      fetchPendingLateApprovals();
      const interval = setInterval(fetchPendingLateApprovals, 4000);
      return () => clearInterval(interval);
    }
  }, [currentRole, crmToken]);

  const handleLateApprovalDecision = async (attendanceId, decision, employeeName = 'Employee') => {
    try {
      setApprovingId(attendanceId);
      const isApprove = decision === 'APPROVED';
      const endpoints = [
        `/api/hr-ops/attendance/late-approvals/${attendanceId}/decision`,
        `http://localhost:5000/api/hr-ops/attendance/late-approvals/${attendanceId}/decision`
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-crm-role': currentRole || 'Super Admin',
              ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
            },
            body: JSON.stringify({
              decision,
              approvedBy: `${currentRole} (Executive Console)`,
              notes: isApprove ? 'Authorized from Executive Performance Dashboard' : 'Access denied from Executive Performance Dashboard'
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.success) {
              setLateApprovalNotice(
                isApprove 
                  ? `✓ Authorized late workspace entry for ${employeeName}. Access unlocked.`
                  : `✕ Rejected late arrival entry for ${employeeName}. Access restricted.`
              );
              setTimeout(() => setLateApprovalNotice(''), 6000);
              await fetchPendingLateApprovals();
              break;
            }
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Failed to submit late approval decision:', err);
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    if (fetchConsultingMetrics) fetchConsultingMetrics();
    if (fetchLeadMetrics) fetchLeadMetrics(dateRange);
    if (fetchFollowUpsSummary) fetchFollowUpsSummary();
  }, [dateRange]);

  // Direct role routing for non-admin roles
  if (currentRole === 'HR Lead') {
    return <CrmHrLeadDashboard />;
  }
  if (currentRole === 'Recruiter') {
    return <CrmRecruiterDashboard />;
  }
  if (currentRole === 'Placement Coordinator') {
    return <CrmPlacementCoordinatorDashboard />;
  }
  if (currentRole === 'HR Operations') {
    return <CrmHrOperationsDashboard />;
  }
  if (currentRole === 'Interviewer') {
    return <CrmInterviewerDashboard />;
  }
  

  // If Super Admin or Admin chose to inspect a role dashboard
  if ((currentRole === 'Super Admin' || currentRole === 'Admin') && adminRoleView !== 'master') {
    return (
      <div className="space-y-4">
        {/* Admin Role Switcher Bar */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Admin Inspection Mode: Previewing {adminRoleView} Dashboard
            </span>
          </div>
          <button
            onClick={() => setAdminRoleView('master')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
          >
            ← Return to Master Executive Dashboard
          </button>
        </div>

        {adminRoleView === 'HR Lead' && <CrmHrLeadDashboard />}
        {adminRoleView === 'Recruiter' && <CrmRecruiterDashboard />}
        {adminRoleView === 'Placement Coordinator' && <CrmPlacementCoordinatorDashboard />}
        {adminRoleView === 'HR Operations' && <CrmHrOperationsDashboard />}
        
      </div>
    );
  }

  const handleRangeChange = async (range) => {
    setDateRange(range);
    setLoadingMetrics(true);
    if (fetchLeadMetrics) await fetchLeadMetrics(range);
    setLoadingMetrics(false);
  };

  const paidRevenue = invoices
    .filter(i => (i.status || '').toLowerCase() === 'paid')
    .reduce((sum, i) => sum + (Number(i.totalUSD || i.amountUSD || 0)), 0);

  const convertedLeadsCount = (leads || []).filter(l => 
    (l.status || '').toLowerCase().includes('convert') || 
    (l.status || '').toLowerCase().includes('complet')
  ).length;

  const scheduledConsultationsCount = (leads || []).filter(l => 
    (l.status || '').toLowerCase().includes('sched') || 
    l.consultationDate
  ).length;

  const widgets = [
    { 
      label: 'Live Active Bookings', 
      val: String((leads || []).length), 
      change: 'Synchronized Real-Time', 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#0d1c3a] dark:to-[#071126] border-slate-200 dark:border-blue-500/40 text-slate-900 dark:text-white',
      valColor: 'text-slate-900 dark:text-blue-300'
    },
    { 
      label: 'Scheduled Consultations', 
      val: String(scheduledConsultationsCount), 
      change: 'Upcoming Advisory Roadmaps', 
      icon: Briefcase, 
      color: 'text-amber-600 dark:text-gold-400',
      badgeBg: 'bg-amber-100 dark:bg-gold-500/20 border-amber-300 dark:border-gold-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#241c09] dark:to-[#120d04] border-slate-200 dark:border-gold-500/40 text-slate-900 dark:text-white',
      valColor: 'text-amber-700 dark:text-gold-400'
    },
    { 
      label: 'Corporate Client Accounts', 
      val: String(clients.length), 
      change: 'Verified Institutional Partners', 
      icon: Building2, 
      color: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#1d0e3d] dark:to-[#0d061c] border-slate-200 dark:border-purple-500/35 text-slate-900 dark:text-white',
      valColor: 'text-purple-800 dark:text-purple-300'
    },
    { 
      label: 'Billed Revenue (USD)', 
      val: `$${paidRevenue.toLocaleString()}`, 
      change: 'Active Invoicing Ledger', 
      icon: DollarSign, 
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#062c1f] dark:to-[#03150e] border-slate-200 dark:border-emerald-500/40 text-slate-900 dark:text-white',
      valColor: 'text-emerald-700 dark:text-emerald-400'
    },
    { 
      label: "Scheduled Interviews", 
      val: String(interviews.length), 
      change: 'Panels & Candidate Meets', 
      icon: Calendar, 
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#09263e] dark:to-[#04121e] border-slate-200 dark:border-cyan-500/35 text-slate-900 dark:text-white',
      valColor: 'text-cyan-800 dark:text-cyan-300'
    },
    { 
      label: 'Talent Pool Candidates', 
      val: String(candidates.length), 
      change: 'Registered Profiles', 
      icon: ShieldCheck, 
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#2e1906] dark:to-[#170c03] border-slate-200 dark:border-amber-500/35 text-slate-900 dark:text-white',
      valColor: 'text-amber-800 dark:text-amber-300'
    },
    { 
      label: 'Follow-Ups Pending', 
      val: String(followUpsSummary?.counts?.totalPending || 0), 
      change: 'Action Required', 
      icon: Clock, 
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#330b18] dark:to-[#1a040b] border-slate-200 dark:border-rose-500/35 text-slate-900 dark:text-white',
      valColor: 'text-rose-800 dark:text-rose-300'
    },
    { 
      label: 'Completed / Converted', 
      val: String(convertedLeadsCount), 
      change: 'Successfully Finalized', 
      icon: CheckCircle2, 
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#082d1a] dark:to-[#03170c] border-slate-200 dark:border-emerald-500/40 text-slate-900 dark:text-white',
      valColor: 'text-emerald-700 dark:text-emerald-400'
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Banner */}
      <ScrollReveal>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-[#101b38] dark:via-[#0b1328] dark:to-[#060a17] p-6 rounded-3xl border-2 border-slate-200 dark:border-gold-500/40 shadow-sm">
        <div>
          <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-amber-300 dark:border-gold-500/30">
            Enterprise Command Center
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-1">
            Executive Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Viewing real-time metrics under active role: <strong className="text-amber-800 dark:text-gold-400 font-bold">{currentRole}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-ping"></span>
            Real-Time Sync Active
          </span>
        </div>
      </div>
      </ScrollReveal>

      {/* Toast Feedback for Late Approval Actions */}
      {lateApprovalNotice && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 font-bold rounded-2xl flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm">{lateApprovalNotice}</span>
          </div>
          <button 
            onClick={() => setLateApprovalNotice('')}
            className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/30 rounded-lg text-emerald-800 dark:text-emerald-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EXECUTIVE SHIFT LATE ARRIVAL APPROVALS (SUPER ADMIN / ADMIN PRIORITY BANNER) */}
      {(currentRole === 'Super Admin' || currentRole === 'Admin') && (
        <ScrollReveal>
          <div className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-md ${
            pendingLateApprovals.length > 0
              ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-[#21090d] dark:via-[#1f1307] dark:to-[#170a0c] border-rose-400 dark:border-rose-500/60'
              : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800'
          }`}>
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
                      ? 'Team members logged in after scheduled shift grace. Super Admin authorization is required to unlock workspace access.'
                      : 'All active team member clock-ins are compliant within scheduled shift grace windows. No access blocks active.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={fetchPendingLateApprovals}
                  disabled={loadingLateApprovals}
                  className="px-3 py-1.5 bg-white/80 dark:bg-navy-950/80 hover:bg-white dark:hover:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Refresh approval queue"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLateApprovals ? 'animate-spin text-rose-500' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
                <button
                  onClick={() => setActiveModule('super-admin')}
                  className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Full Attendance Audit →
                </button>
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
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {req.employeeName}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium truncate">
                                {req.employeeId || 'ID Pending'} • {req.role || req.department || 'Employee'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0">
                            {formatLateDelayText(req.lateMinutes)}
                          </span>
                        </div>

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
                            <span className="font-mono font-bold text-amber-700 dark:text-gold-400">{formattedLoginTime}</span>
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
        </ScrollReveal>
      )}

      {/* KPI Widgets Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {widgets.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className={`glass-card p-4 sm:p-5 rounded-2xl space-y-2.5 border-2 transition-all duration-300 hover:scale-[1.01] shadow-xs ${w.cardStyle}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-950 dark:text-slate-100 uppercase tracking-wider">{w.label}</span>
                <div className={`p-1.5 rounded-xl border ${w.badgeBg}`}>
                  <Icon className={`w-4 h-4 ${w.color}`} />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${w.valColor}`}>{w.val}</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                <span>{w.change}</span>
              </p>
            </div>
          );
        })}
      </div>
      </ScrollReveal>

      {/* PHASE 12: ADMIN DASHBOARD, LEAD MANAGEMENT & CUSTOMER TRACKING SYSTEM */}
      <ScrollReveal>
      <div className="glass-card bg-white dark:bg-gradient-to-r dark:from-[#061126] dark:via-[#0a1936] dark:to-[#071329] border border-slate-200 dark:border-gold-500/35 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-6 w-full max-w-full overflow-hidden box-border">
        
        {/* Header & Date Range Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-5">
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Phase 12 • Enterprise Lead Tracking & Metrics
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SQLite Live Sync
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex flex-wrap items-center gap-2 break-words">
              <Layers className="w-6 h-6 text-gold-500 shrink-0" />
              <span>Customer Enquiries & Lead Lifecycle Intelligence</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Real-time audit across all 6 verified service catalogs, student advising funnels, follow-up queues, and conversion tracking.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Period:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                disabled={loadingMetrics}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateRange === r.id
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-navy-900'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => handleRangeChange(dateRange)}
              className="p-1.5 text-slate-500 hover:text-gold-500 transition cursor-pointer"
              title="Refresh Live Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin text-gold-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Alert Banner for Overdue / Today Follow-ups */}
        {(leadMetrics?.overdueFollowUps > 0 || leadMetrics?.dueTodayFollowUps > 0) && (
          <div className="p-4 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-xs text-rose-700 dark:text-rose-300">
                  Customer Follow-Up Action Required
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {leadMetrics.overdueFollowUps > 0 && <span className="font-extrabold text-rose-600 dark:text-rose-400">{leadMetrics.overdueFollowUps} Overdue Follow-up{leadMetrics.overdueFollowUps > 1 ? 's' : ''} </span>}
                  {leadMetrics.overdueFollowUps > 0 && leadMetrics.dueTodayFollowUps > 0 && '• '}
                  {leadMetrics.dueTodayFollowUps > 0 && <span className="font-extrabold text-amber-600 dark:text-amber-400">{leadMetrics.dueTodayFollowUps} Due Today</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModule('super-admin')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
            >
              <span>Manage Due Follow-ups</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real SQLite 8-Metric Lifecycle Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
            <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">
              {leadMetrics?.totalEnquiries || 0}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Inbound Received</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">New Enquiries</span>
            <p className="font-serif text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {leadMetrics?.newEnquiries || 0}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Uncontacted</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Contact Pending</span>
            <p className="font-serif text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {leadMetrics?.contactPending || 0}
            </p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Outreach Attempted</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Awaiting Action</span>
            <p className="font-serif text-2xl font-extrabold text-amber-600 dark:text-gold-400">
              {leadMetrics?.awaitingFollowUp || 0}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-gold-400 font-bold">Follow-up Due</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">In Progress</span>
            <p className="font-serif text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {leadMetrics?.inProgress || 0}
            </p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Active Advising</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Qualified</span>
            <p className="font-serif text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {leadMetrics?.qualified || 0}
            </p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Eligible & Ready</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Converted</span>
            <div className="flex items-baseline gap-1">
              <p className="font-serif text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {leadMetrics?.converted || 0}
              </p>
              {leadMetrics?.conversionRate > 0 && (
                <span className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400">
                  ({leadMetrics.conversionRate}%)
                </span>
              )}
            </div>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Enrolled / Placed</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Closed / Lost</span>
            <p className="font-serif text-2xl font-extrabold text-slate-500 dark:text-slate-400">
              {leadMetrics?.closedLost || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Archived</p>
          </div>
        </div>

        {/* Master Service Performance Breakdown Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gold-500" />
              Service-Wise Enquiry Breakdown & Conversion Rates
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Data synchronized from SQLite leads table across 6 Academic Catalogs
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-extrabold">ACADEMIC / RECRUITMENT SERVICE</th>
                  <th className="p-3 font-extrabold">CATEGORY</th>
                  <th className="p-3 font-extrabold text-center">TOTAL LEADS</th>
                  <th className="p-3 font-extrabold text-center">NEW</th>
                  <th className="p-3 font-extrabold text-center">AWAITING FOLLOW-UP</th>
                  <th className="p-3 font-extrabold text-center">IN PROGRESS</th>
                  <th className="p-3 font-extrabold text-center">CONVERTED</th>
                  <th className="p-3 font-extrabold text-center">CONVERSION RATE</th>
                  <th className="p-3 font-extrabold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                {(serviceBreakdown.length > 0 ? serviceBreakdown : [
                  { serviceId: 'intl-consult', serviceTitle: 'International Consulting', category: 'Consulting', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 },
                  { serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', category: 'Higher Education', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 },
                  { serviceId: 'school-career', serviceTitle: 'School Student Career Guidance', category: 'K-12 & High School', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 },
                  { serviceId: 'intl-adm', serviceTitle: 'International Admissions', category: 'Admissions', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 },
                  { serviceId: 'school-academy', serviceTitle: 'Academy for School Students', category: 'Academic Enrichment', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 },
                  { serviceId: 'exec-seminars-lang', serviceTitle: 'Seminars & Language', category: 'Test Prep & Executive', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 }
                ]).map(srv => (
                  <tr key={srv.serviceId} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gold-500/20">
                        🎓
                      </div>
                      <span className="truncate">{srv.serviceTitle}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 dark:border-navy-700">
                        {srv.category}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {srv.total}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {srv.newCount}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {srv.awaitingFollowUp}
                    </td>
                    <td className="p-3 text-center font-bold text-purple-600 dark:text-purple-400 font-mono">
                      {srv.inProgress}
                    </td>
                    <td className="p-3 text-center font-bold text-teal-600 dark:text-teal-400 font-mono">
                      {srv.converted}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                        srv.conversionRate > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-navy-900 dark:text-slate-400'
                      }`}>
                        {srv.conversionRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (srv.serviceId === 'school-career' || (srv.serviceTitle || '').toLowerCase().includes('career')) {
                            setActiveModule('career-guidance');
                          } else if (srv.serviceId === 'school-academy' || (srv.serviceTitle || '').toLowerCase().includes('academy')) {
                            setActiveModule('student-academy');
                          } else {
                            setActiveModule('consulting');
                          }
                        }}
                        className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition cursor-pointer flex items-center gap-1 ml-auto"
                        title={`Open bookings for ${srv.serviceTitle}`}
                      >
                        <span>View Bookings</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Live Consultation Bookings Feed */}
          {leads && leads.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-navy-800 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Recent Consultation & Advisory Bookings
                </h4>
                <button
                  onClick={() => setActiveModule('consulting')}
                  className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Consulting CRM</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {leads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setActiveModule('consulting')}
                    className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 transition cursor-pointer space-y-1.5 shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {lead.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-400 shrink-0">
                        {lead.status || 'Scheduled'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lead.serviceTitle || lead.serviceId || 'International Consulting'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-navy-800/60 font-mono">
                      <span>{lead.referenceNumber || lead.id.slice(0, 10)}</span>
                      <span className="text-gold-600 dark:text-gold-400 font-bold">
                        {lead.consultationDate || 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      </ScrollReveal>

      {/* Analytics & Leaderboard Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recruiter Leaderboard */}
        <div className="lg:col-span-6 glass-card bg-white dark:bg-gradient-to-b dark:from-[#0d162d] dark:to-[#070c1a] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              Monthly Recruiter Leaderboard
            </h3>
            <span className="text-xs text-amber-700 dark:text-gold-400 font-extrabold">Top Headhunters</span>
          </div>

          <div className="space-y-3 text-xs">
            {RECRUITER_LEADERBOARD.map(r => (
              <div key={r.rank} className="p-3.5 bg-slate-50 dark:bg-[#070c1a] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded-full font-extrabold flex items-center justify-center text-xs border ${
                    r.rank === 1 
                      ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border-gold-500/40' 
                      : r.rank === 2
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      : 'bg-amber-100 dark:bg-amber-800/20 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700/40'
                  }`}>
                    #{r.rank}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{r.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{r.placements} Candidates Placed</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">${r.revenueUSD.toLocaleString()} USD</p>
                  <p className="text-[10px] text-amber-800 dark:text-gold-400 font-bold">{r.targetPct}% of Target</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="lg:col-span-6 glass-card bg-white dark:bg-gradient-to-b dark:from-[#0d162d] dark:to-[#070c1a] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 text-xs shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" />
              Security & Activity Audit Log
            </h3>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">Live Stream</span>
          </div>

          <div className="space-y-3">
            {AUDIT_LOGS.map((log, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#070c1a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-amber-800 dark:text-gold-400">{log.user} ({log.role})</span>
                  <span className="font-medium">{log.timestamp}</span>
                </div>
                <p className="text-slate-900 dark:text-slate-200 font-semibold text-xs">{log.action}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">IP: {log.ip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      </ScrollReveal>

    </div>
  );
};

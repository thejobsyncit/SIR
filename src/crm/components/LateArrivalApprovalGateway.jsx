import React, { useState, useEffect } from 'react';
import { 
  Clock, ShieldAlert, CheckCircle2, XCircle, RefreshCw, LogOut, 
  AlertTriangle, UserCheck, ShieldCheck, ArrowRight, Lock, Send,
  FileText, Building2, Calendar, Check, AlertCircle, Sparkles, ExternalLink
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const LateArrivalApprovalGateway = ({ 
  gate, 
  onApproved, 
  onLogout, 
  checkStatus 
}) => {
  const { crmToken, user } = useCrm();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(gate?.status || 'PENDING');
  const [statusMessage, setStatusMessage] = useState('');

  // Justification submission state
  const [reasonCategory, setReasonCategory] = useState('Traffic / Commuter Congestion on Transit Route');
  const [reasonDetails, setReasonDetails] = useState('');
  const [submittingJustification, setSubmittingJustification] = useState(false);
  const [justificationSubmitted, setJustificationSubmitted] = useState(false);

  // Helper to format delay into professional hours and minutes
  const formatLateDelay = (mins) => {
    const m = Math.max(0, parseInt(mins, 10) || 0);
    if (m === 0) return '0 mins';
    const hours = Math.floor(m / 60);
    const remMins = m % 60;
    if (hours > 0 && remMins > 0) {
      return `${hours}h ${remMins}m Late (${m} mins)`;
    } else if (hours > 0) {
      return `${hours}h 00m Late (${m} mins)`;
    } else {
      return `+${m} mins Late`;
    }
  };

  // 1.5-second automatic polling for real-time unlock once Super Admin or HR Lead approves
  useEffect(() => {
    if (status === 'APPROVED') return;

    const interval = setInterval(async () => {
      if (checkStatus) {
        const res = await checkStatus();
        if (res === 'APPROVED') {
          setStatus('APPROVED');
          setStatusMessage('✓ Authorization Granted! Initializing workspace session...');
          setTimeout(() => {
            if (onApproved) onApproved();
          }, 300);
        } else if (res === 'REJECTED') {
          setStatus('REJECTED');
          setStatusMessage('✕ Late arrival access declined. Please contact HR Leadership.');
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [checkStatus, onApproved, status]);

  const handleManualCheck = async () => {
    setChecking(true);
    setStatusMessage('');
    try {
      if (checkStatus) {
        const res = await checkStatus();
        if (res === 'APPROVED') {
          setStatus('APPROVED');
          setStatusMessage('✓ Authorization Granted! Initializing workspace session...');
          setTimeout(() => {
            if (onApproved) onApproved();
          }, 300);
        } else if (res === 'REJECTED') {
          setStatus('REJECTED');
          setStatusMessage('✕ Late arrival access declined. Please consult HR.');
        } else {
          setStatusMessage('Review is currently pending in Command Center.');
        }
      }
    } catch (_) {
      setStatusMessage('Network synchronization active. Re-checking...');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmitJustification = async (e) => {
    e.preventDefault();
    setSubmittingJustification(true);
    try {
      const res = await fetch('/api/hr-ops/attendance/late-justification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
        },
        body: JSON.stringify({
          attendanceId: gate?.attendanceId,
          reasonCategory,
          reasonDetails
        })
      });
      if (res.ok) {
        setJustificationSubmitted(true);
        setStatusMessage('✓ Formal justification registered in compliance audit log.');
      }
    } catch (err) {
      console.error('Error submitting justification:', err);
    } finally {
      setSubmittingJustification(false);
    }
  };

  const employeeDisplayName = gate?.employeeName || user?.name || 'Staff Specialist';
  const employeeRole = gate?.role || user?.role || 'Operations Specialist';
  const employeeId = gate?.employeeId || user?.employeeId || 'REV-EMP-004';
  const shiftTitle = gate?.shiftName || 'General Day Shift (09:00 AM – 06:00 PM IST)';
  const shiftStartTime = gate?.shiftStart || '09:00 AM';
  const checkInTimeFormatted = gate?.checkInAt || 'Current Session';
  const delayFormatted = formatLateDelay(gate?.lateMinutes || 18);
  const isTargetHrLead = String(employeeRole || '').toLowerCase().includes('lead');
  const approverLabel = isTargetHrLead ? 'Super Admin' : 'Super Admin or HR Lead';

  return (
    <div className="fixed inset-0 z-50 bg-[#020512]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans selection:bg-gold-500 selection:text-navy-950">
      
      {/* Background ambient enterprise lighting */}
      <div className="absolute top-1/6 left-1/4 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/6 right-1/4 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="max-w-2xl w-full bg-white dark:bg-navy-900 border-2 border-amber-400 dark:border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 my-auto">
        
        {/* Corporate Brand & Security Protocol Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-5">
          <div className="flex items-center space-x-3.5">
            <img 
              src="/images/logo.png" 
              alt="The Revival International" 
              className="w-11 h-11 object-contain drop-shadow" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  The Revival International
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                  Global ERP/CRM
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-gold-400 font-extrabold mt-0.5">
                Workforce Attendance Governance & Shift Compliance Protocol
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Access</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              REF: RI-HR-POL-04
            </span>
          </div>
        </div>

        {/* Status Callout Card */}
        {status === 'APPROVED' ? (
          <div className="bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 font-serif">
              Shift Late Ingress Authorized by Super Admin
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium max-w-md mx-auto leading-relaxed">
              Super Admin has approved your attendance exception for this workday. Your compliance record has been regularized and full enterprise CRM workspace permissions are being initialized.
            </p>
          </div>
        ) : status === 'REJECTED' ? (
          <div className="bg-rose-50 dark:bg-rose-500/15 border-2 border-rose-400 dark:border-rose-500/50 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-rose-900 dark:text-rose-200 font-serif">
              Late Arrival Access Declined
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium max-w-md mx-auto leading-relaxed">
              Super Admin has denied authorization for this session in accordance with corporate shift adherence policies. Please contact HR Operations or your Department Head for attendance regularization.
            </p>
            <div className="pt-2">
              <button
                onClick={onLogout}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Sign Out of Enterprise Portal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Notice Callout Box */}
            <div className="bg-amber-50/90 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/35 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-500/30 text-amber-900 dark:text-amber-300">
                      Official Notice of Shift Schedule Exception
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                    Shift Late Ingress Detected — Executive Authorization Required
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pt-0.5">
                    In accordance with Revival International Corporate Attendance & Punctuality Policy (Standard Ref: RI-HR-04), all rostered staff members are required to log into the corporate portal within their designated shift window. A mandatory 15-minute standard grace period is provided (concluding at 09:15 AM IST for General Shift).
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Your workday check-in occurred after the allowable grace threshold. Pursuant to corporate governance, portal workspace access is temporarily restricted until authorized by <strong className="text-slate-900 dark:text-white">{approverLabel}</strong>.
                  </p>
                </div>
              </div>

              {/* Shift & Lateness Breakdown Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-amber-200/80 dark:border-amber-500/20 text-xs">
                <div className="bg-white/90 dark:bg-navy-950 p-2.5 rounded-xl border border-amber-200/60 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Employee</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block" title={employeeDisplayName}>
                    {employeeDisplayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">{employeeId}</span>
                </div>

                <div className="bg-white/90 dark:bg-navy-950 p-2.5 rounded-xl border border-amber-200/60 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Role & Dept</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block" title={employeeRole}>
                    {employeeRole}
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-gold-400 truncate block">Workforce Core</span>
                </div>

                <div className="bg-white/90 dark:bg-navy-950 p-2.5 rounded-xl border border-amber-200/60 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Timing</span>
                  <span className="font-bold text-slate-900 dark:text-white block font-mono">
                    {shiftStartTime}
                  </span>
                  <span className="text-[10px] text-slate-400 block">15m Grace Elapsed</span>
                </div>

                <div className="bg-white/90 dark:bg-navy-950 p-2.5 rounded-xl border border-amber-200/60 dark:border-white/5 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Recorded Delay</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 block text-xs">
                    {delayFormatted}
                  </span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-semibold">Flagged for Audit</span>
                </div>
              </div>
            </div>

            {/* Corporate Compliance Three-Step Flow Indicator */}
            <div className="bg-slate-50 dark:bg-navy-950/80 p-3 rounded-2xl border border-slate-200 dark:border-navy-800">
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Check-In Timestamp Logged</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-gold-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>2. Shift Exception Flagged</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. {isTargetHrLead ? 'Super Admin Review' : 'Super Admin / HR Lead Review'}</span>
                </div>
              </div>
            </div>

            {/* Employee Justification Submission Form */}
            <div className="bg-white dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-gold-400" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Late Ingress Justification Submission (Optional)
                  </h4>
                </div>
                {justificationSubmitted && (
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Justification Filed</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                To expedite authorization, submit a brief formal explanation to accompany this attendance exception record for {approverLabel}'s review.
              </p>

              {!justificationSubmitted ? (
                <form onSubmit={handleSubmitJustification} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Reason Category
                    </label>
                    <select
                      value={reasonCategory}
                      onChange={(e) => setReasonCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="Traffic / Commuter Congestion on Transit Route">Traffic / Commuter Congestion on Transit Route</option>
                      <option value="Medical Consultation / Healthcare Emergency">Medical Consultation / Healthcare Emergency</option>
                      <option value="Client Engagement / Off-site Client Meeting">Client Engagement / Off-site Client Meeting</option>
                      <option value="Technical, Power, or Network Connectivity Outage">Technical, Power, or Network Connectivity Outage</option>
                      <option value="Prior Sanctioned Managerial Permission">Prior Sanctioned Managerial Permission</option>
                      <option value="Urgent Personal or Family Obligation">Urgent Personal or Family Obligation</option>
                      <option value="Other Corporate Operational Reason">Other Corporate Operational Reason</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Explanation Details / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={reasonDetails}
                      onChange={(e) => setReasonDetails(e.target.value)}
                      placeholder="e.g. Flight delay on return travel / Severe traffic delay on GST road / Doctor visit"
                      className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submittingJustification}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-navy-800 dark:hover:bg-navy-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingJustification ? 'Submitting...' : `Submit Justification to ${approverLabel}`}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your justification (<strong>{reasonCategory}</strong>{reasonDetails ? ` - ${reasonDetails}` : ''}) has been attached to your attendance docket for {approverLabel} authorization.
                  </span>
                </div>
              )}
            </div>

            {/* Live Polling Status & Operational Action Buttons */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span>Awaiting {approverLabel} Authorization in Command Center...</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Auto-sync active (1.5s)</span>
              </div>

              {statusMessage && (
                <p className="text-xs text-amber-700 dark:text-gold-400 font-medium">
                  {statusMessage}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Synchronizing Approval Status...' : 'Re-Check Authorization Status'}</span>
                </button>

                <button
                  onClick={onLogout}
                  className="py-3 px-5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Legal & Compliance Security Footer */}
        <div className="border-t border-slate-100 dark:border-navy-800 pt-3 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            Revival International Human Resources & Enterprise Legal Compliance Bureau
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
            Cryptographic Biometric Audit Trail • ISO 27001 & SOC-2 Type II Certified Portal
          </p>
        </div>

      </div>
    </div>
  );
};

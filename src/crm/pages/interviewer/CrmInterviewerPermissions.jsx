import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Lock, ShieldCheck, Eye, EyeOff, UserCheck, 
  FileKey, AlertTriangle, Key, CheckCircle2 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerPermissions = () => {
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [blindReviewActive, setBlindReviewActive] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const auditLogs = [
    {
      action: 'Scorecard Decryption & View',
      target: 'CAN-801 (Rohan Deshmukh)',
      timestamp: 'Today • 02:45 PM',
      ip: '103.21.144.20 (Bangalore VPN)',
      status: 'Authorized'
    },
    {
      action: 'Resume PII Access (Contact Data)',
      target: 'CAN-802 (Priyanka Venkatesh)',
      timestamp: 'Today • 01:10 PM',
      ip: '103.21.144.20 (Bangalore VPN)',
      status: 'Authorized'
    },
    {
      action: 'Blind Review Gate Enforced',
      target: 'CAN-804 (Ananya Sundaram)',
      timestamp: 'Yesterday • 05:00 PM',
      ip: 'System Policy Engine',
      status: 'Access Shielded'
    }
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #12
              </span>
              <span className="text-[10px] font-mono text-slate-400">ZERO-TRUST SECURITY & PII GOVERNANCE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Confidentiality and Access Permissions
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Enforce candidate data protection, non-disclosure compliance, blind-review debrief shielding, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● NDA Signed & Active
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Access Scope</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">Strictly Assigned</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Only allocated candidate dossiers</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Blind Review Mode</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">Enforced</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Peer scores hidden until submission</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">PII Masking</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">256-Bit AES</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Candidate personal data encrypted</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Audit Trail Retention</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <FileKey className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">365 Days</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Compliant with Global Hiring Standards</span>
          </div>
        </div>

        {/* Security Controls & NDA Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                Interviewer Confidentiality Declaration
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              As an accredited technical interviewer for The Revival Enterprise CRM, you agree that candidate code submissions, salary discussions, personal portfolio materials, and peer panel discussions are strictly confidential.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Annual Technical Assessor NDA</p>
                <span className="text-[10px] text-slate-400">Signed on Jan 15, 2026 • Valid until Jan 15, 2027</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                Verified Active
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                Independent Blind Review Protocol
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              To prevent anchoring bias, fellow interviewers' scorecards and hiring recommendations are shielded until you formally submit your own evaluation scorecard.
            </p>

            <div className="p-3 bg-amber-50/50 dark:bg-navy-950 rounded-2xl border border-amber-200/50 dark:border-navy-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Blind Review Bias Shielding:
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-gold-400">
                Active & Mandatory
              </span>
            </div>
          </div>
        </div>

        {/* Security Audit Log */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Session Security & Access Audit Log</span>
            <span className="text-[10px] font-mono text-slate-400">Real-time IP Tracker</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Action Logged</th>
                  <th className="p-4 font-bold">Target Dossier</th>
                  <th className="p-4 font-bold">Timestamp</th>
                  <th className="p-4 font-bold font-mono">Origin Network</th>
                  <th className="p-4 font-bold text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="p-4 text-amber-700 dark:text-gold-400 font-semibold font-mono">
                      {log.target}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {log.timestamp}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {log.ip}
                    </td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerPermissions;


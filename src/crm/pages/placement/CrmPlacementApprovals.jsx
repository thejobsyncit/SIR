import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  ShieldCheck, Lock, UserCheck, AlertCircle, CheckCircle2, 
  Clock, Eye, FileKey, Key, Settings2 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'APR-501',
      title: 'TechVision International: Drive Criteria & Registration Authorization',
      requestedBy: 'Divya Sharma (Placement Officer)',
      requestType: 'Campus Drive Approval',
      submittedDate: '2026-11-06 08:30 AM',
      impact: 'Unlocks registration for 142 CSE & IT Students',
      status: 'Pending Review'
    },
    {
      id: 'APR-502',
      title: 'Correction Request: Rohan Deshmukh Semester 6 CGPA Update (8.6 to 8.9)',
      requestedBy: 'Dr. K. Raman (Dept Coordinator, CSE)',
      requestType: 'Student Record Override',
      submittedDate: '2026-11-05 03:45 PM',
      impact: 'Enables Tier-1 international eligibility',
      status: 'Pending Review'
    },
    {
      id: 'APR-503',
      title: 'Bulk Export of Confidential Student Contact & Offer Data',
      requestedBy: 'Analytics Wing (External Audit)',
      requestType: 'Data Export Permission',
      submittedDate: '2026-11-04 11:20 AM',
      impact: 'Downloads unmasked email and phone numbers',
      status: 'Requires Super Admin Sign-off'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAction = (id, action) => {
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    showToast(`✓ Request ${id} has been marked as ${action.toUpperCase()}. Audit log recorded.`);
  };

  const permissionMatrix = [
    { role: 'TPO Director / Super Admin', editProfiles: true, approveDrives: true, postNotices: true, exportData: true, viewSalary: true },
    { role: 'Placement Coordinator', editProfiles: true, approveDrives: false, postNotices: true, exportData: true, viewSalary: true },
    { role: 'Department Faculty Coordinator', editProfiles: false, approveDrives: false, postNotices: false, exportData: false, viewSalary: false },
    { role: 'Student Placement Volunteer', editProfiles: false, approveDrives: false, postNotices: false, exportData: false, viewSalary: false }
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #12
              </span>
              <span className="text-[10px] font-mono text-slate-400">DATA GOVERNANCE & ACCESS CONTROL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Access Control and Approvals
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Define who can edit student records, authorize campus drives, and inspect confidential student salary & placement offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-700 dark:text-purple-300">
              ● Role-Based Access Enforced
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Approvals</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{pendingApprovals.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Requires Coordinator Action</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Authorized Personnel</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">12 Staff</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Active Placement Cells</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Locked Student Records</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">540 Profiles</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Protected against unauthorized edits</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Audit Trail Integrity</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">100% Verified</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Tamper-proof activity logs</span>
          </div>
        </div>

        {/* Pending Approvals Queue */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex justify-between items-center">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Pending Approval & Sign-off Requests</span>
            <span className="text-xs text-slate-500 font-mono">{pendingApprovals.length} actionable items</span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-navy-800">
            {pendingApprovals.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">All approval requests have been processed!</p>
              </div>
            ) : (
              pendingApprovals.map(apr => (
                <div key={apr.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{apr.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                        {apr.requestType}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{apr.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Requested by <strong className="text-slate-700 dark:text-slate-300">{apr.requestedBy}</strong> • {apr.submittedDate}
                    </p>
                    <p className="text-[10px] text-purple-600 font-medium">Impact: {apr.impact}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleAction(apr.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-rose-50 text-rose-600 font-bold transition text-xs cursor-pointer"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleAction(apr.id, 'approved')}
                      className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold shadow-xs transition text-xs cursor-pointer"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Access Rights Matrix */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Role Permission & Security Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">User Role</th>
                  <th className="p-4 font-bold text-center">Edit Student Records</th>
                  <th className="p-4 font-bold text-center">Approve Campus Drives</th>
                  <th className="p-4 font-bold text-center">Publish Circulars</th>
                  <th className="p-4 font-bold text-center">Export Data</th>
                  <th className="p-4 font-bold text-center">View Confidential CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {permissionMatrix.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {p.role}
                    </td>
                    <td className="p-4 text-center">
                      {p.editProfiles ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {p.approveDrives ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {p.postNotices ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {p.exportData ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {p.viewSalary ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
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

export default CrmPlacementApprovals;


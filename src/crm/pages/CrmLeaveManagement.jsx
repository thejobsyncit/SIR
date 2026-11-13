import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, AlertCircle, Clock, ShieldCheck, Lock, 
  Search, Filter, Plus, Edit3, X, Check, XCircle, ArrowRight, UserCheck
} from 'lucide-react';

const INITIAL_LEAVES = [
  {
    id: 'LEV-501',
    employeeId: 'REV-EMP-106',
    name: 'Arjun Venkatesh',
    role: 'Full Stack Cloud Engineer',
    department: 'Engineering',
    type: 'Sick Leave',
    startDate: '2026-11-07',
    endDate: '2026-11-08',
    days: 2,
    reason: 'Viral fever and prescribed medical rest by physician.',
    submittedAt: 'Today at 07:30 AM',
    status: 'Pending Super Admin Decision'
  },
  {
    id: 'LEV-502',
    employeeId: 'REV-EMP-102',
    name: 'Diviya R.',
    role: 'Senior Talent Acquisition Specialist',
    department: 'Talent Acquisition',
    type: 'Casual Leave',
    startDate: '2026-11-12',
    endDate: '2026-11-12',
    days: 1,
    reason: 'Attending sibling university convocation ceremony.',
    submittedAt: 'Yesterday at 04:15 PM',
    status: 'Pending Super Admin Decision'
  },
  {
    id: 'LEV-503',
    employeeId: 'REV-EMP-105',
    name: 'Sreeja Nair',
    role: 'Campus Placement & University Relations Head',
    department: 'Placement & Relations',
    type: 'Privilege / Earned Leave',
    startDate: '2026-11-18',
    endDate: '2026-11-20',
    days: 3,
    reason: 'Family outstation travel planned in advance.',
    submittedAt: 'Nov 04, 2026',
    status: 'Approved'
  }
];

const INITIAL_BALANCES = [
  { id: 'REV-EMP-101', name: 'Balavarshini S.', department: 'HR Operations', casual: 6, sick: 7, paid: 12 },
  { id: 'REV-EMP-102', name: 'Diviya R.', department: 'Talent Acquisition', casual: 5, sick: 8, paid: 14 },
  { id: 'REV-EMP-103', name: 'Chentamilselvi M.', department: 'HR Operations', casual: 7, sick: 6, paid: 10 },
  { id: 'REV-EMP-104', name: 'Kishore Kumar', department: 'Talent Acquisition', casual: 8, sick: 5, paid: 15 },
  { id: 'REV-EMP-105', name: 'Sreeja Nair', department: 'Placement & Relations', casual: 6, sick: 9, paid: 11 },
  { id: 'REV-EMP-106', name: 'Arjun Venkatesh', department: 'Engineering', casual: 3, sick: 2, paid: 8 },
  { id: 'REV-EMP-107', name: 'Meenakshi Sundaram', department: 'Academic Advisory', casual: 4, sick: 4, paid: 6 },
  { id: 'REV-EMP-108', name: 'Dr. Vigneshwaran K.', department: 'Client Advisory', casual: 9, sick: 10, paid: 16 }
];

export const CrmLeaveManagement = ({ isSuperAdmin, currentRole }) => {
  // Can edit only if active role is Super Admin
  const canEdit = isSuperAdmin || currentRole === 'Super Admin';

  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_workforce_leaves');
      return saved ? JSON.parse(saved) : INITIAL_LEAVES;
    } catch {
      return INITIAL_LEAVES;
    }
  });

  const [balances, setBalances] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_workforce_leave_balances');
      return saved ? JSON.parse(saved) : INITIAL_BALANCES;
    } catch {
      return INITIAL_BALANCES;
    }
  });

  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Super Admin: Edit Quota Modal
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ casual: 0, sick: 0, paid: 0, reason: '' });

  // Super Admin: Grant Special Leave Modal
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({
    employeeId: 'REV-EMP-101',
    type: 'Compensatory Off / Special Leave',
    days: 1,
    startDate: new Date().toISOString().split('T')[0],
    reason: 'Approved by Super Admin for weekend project milestone'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const saveLeaves = (newLeaves) => {
    setLeaves(newLeaves);
    try {
      localStorage.setItem('crm_workforce_leaves', JSON.stringify(newLeaves));
    } catch {}
  };

  const saveBalances = (newBalances) => {
    setBalances(newBalances);
    try {
      localStorage.setItem('crm_workforce_leave_balances', JSON.stringify(newBalances));
    } catch {}
  };

  // Super Admin: Approve Leave
  const handleApproveLeave = (leaveId) => {
    if (!canEdit) return;
    const targetLeave = leaves.find(l => l.id === leaveId);
    if (!targetLeave) return;

    // Deduct from balance
    const updatedBalances = balances.map(b => {
      if (b.id === targetLeave.employeeId) {
        if (targetLeave.type.toLowerCase().includes('sick')) {
          return { ...b, sick: Math.max(0, b.sick - targetLeave.days) };
        } else if (targetLeave.type.toLowerCase().includes('casual')) {
          return { ...b, casual: Math.max(0, b.casual - targetLeave.days) };
        } else {
          return { ...b, paid: Math.max(0, b.paid - targetLeave.days) };
        }
      }
      return b;
    });
    saveBalances(updatedBalances);

    // Update leave status
    const updatedLeaves = leaves.map(l => l.id === leaveId ? { ...l, status: 'Approved' } : l);
    saveLeaves(updatedLeaves);
    showToast(`✓ Leave request ${leaveId} for ${targetLeave.name} AUTHORIZED & balance deducted.`);
  };

  // Super Admin: Reject Leave
  const handleRejectLeave = (leaveId) => {
    if (!canEdit) return;
    const targetLeave = leaves.find(l => l.id === leaveId);
    const updatedLeaves = leaves.map(l => l.id === leaveId ? { ...l, status: 'Declined by Super Admin' } : l);
    saveLeaves(updatedLeaves);
    showToast(`Leave request ${leaveId} for ${targetLeave?.name || ''} marked as DECLINED.`);
  };

  // Super Admin: Approve All Pending
  const handleApproveAll = () => {
    if (!canEdit) return;
    const updatedLeaves = leaves.map(l => l.status.includes('Pending') ? { ...l, status: 'Approved' } : l);
    saveLeaves(updatedLeaves);
    showToast('✓ All pending leave applications authorized by Super Admin.');
  };

  // Super Admin: Open Balance Adjustment Modal
  const handleOpenBalanceEdit = (emp) => {
    if (!canEdit) return;
    setEditingBalance(emp);
    setBalanceForm({
      casual: emp.casual,
      sick: emp.sick,
      paid: emp.paid,
      reason: 'Super Admin annual leave entitlement adjustment'
    });
  };

  // Super Admin: Save Balance Adjustment
  const handleSaveBalanceEdit = (e) => {
    e.preventDefault();
    if (!canEdit || !editingBalance) return;

    const updated = balances.map(b => {
      if (b.id === editingBalance.id) {
        return {
          ...b,
          casual: Number(balanceForm.casual),
          sick: Number(balanceForm.sick),
          paid: Number(balanceForm.paid)
        };
      }
      return b;
    });

    saveBalances(updated);
    setEditingBalance(null);
    showToast(`✓ Leave quota balances updated for ${editingBalance.name}.`);
  };

  // Super Admin: Grant Special Leave Submit
  const handleGrantSubmit = (e) => {
    e.preventDefault();
    if (!canEdit) return;

    const emp = balances.find(b => b.id === grantForm.employeeId);
    const newReq = {
      id: `LEV-${Math.floor(504 + Math.random() * 400)}`,
      employeeId: grantForm.employeeId,
      name: emp ? emp.name : 'Workforce Member',
      role: 'Enterprise Associate',
      department: emp ? emp.department : 'Operations',
      type: grantForm.type,
      startDate: grantForm.startDate,
      endDate: grantForm.startDate,
      days: Number(grantForm.days),
      reason: grantForm.reason,
      submittedAt: 'Direct Grant by Super Admin',
      status: 'Approved'
    };

    saveLeaves([newReq, ...leaves]);
    setIsGrantOpen(false);
    showToast(`✓ Special leave granted to ${newReq.name} (${newReq.employeeId}).`);
  };

  const pendingLeaves = leaves.filter(l => l.status.includes('Pending'));
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-navy-950 text-white border border-gold-500/50 shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-black text-xl text-slate-900 dark:text-white">
              Workforce Leave Governance & Absence Ledger
            </h2>
            {canEdit ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-gold-400 border border-amber-300 dark:border-gold-500/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-gold-500" />
                Super Admin Mode (Authorize & Quota Edit)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-navy-700 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Admin View Mode (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official leave applications, vacation calendars, statutory quotas, and managerial sanction decisions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => setIsGrantOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Grant Special Leave</span>
              </button>

              {pendingLeaves.length > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorize All Pending ({pendingLeaves.length})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Notice Banner */}
      {!canEdit && (
        <div className="p-3.5 bg-slate-100 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Admin View Only Notice:</strong> As Admin, you can review all employee leave applications, submitted reasons, and quota balances. Sanctioning approvals, issuing rejections, and quota balance modifications are strictly reserved for <strong>Super Admin</strong>.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Pending Applications</span>
          <p className="text-2xl font-serif font-black text-amber-600 mt-1">{pendingLeaves.length}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{canEdit ? 'Awaiting Your Decision' : 'Awaiting Super Admin'}</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Approved Leaves</span>
          <p className="text-2xl font-serif font-black text-emerald-600 mt-1">{approvedLeaves.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Active & Sanctioned</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Declined Requests</span>
          <p className="text-2xl font-serif font-black text-rose-600 mt-1">{leaves.filter(l => l.status.includes('Declined')).length}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Rejected with notes</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">On-Roll Workforce</span>
          <p className="text-2xl font-serif font-black text-slate-800 dark:text-slate-200 mt-1">{balances.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Leave Quota Enforced</span>
        </div>
      </div>

      {/* SECTION 1: Pending Leave Applications */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              Submitted Leave Applications
            </h3>
            <p className="text-[11px] text-slate-500">Review employee absence requests, dates, and medical or personal reasons</p>
          </div>
          <span className="text-[10px] font-mono text-amber-700 dark:text-gold-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingLeaves.length} Pending Actions
          </span>
        </div>

        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{l.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({l.employeeId} • {l.department})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">
                    {l.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">"{l.reason}"</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>📅 Duration: {l.startDate} to {l.endDate} ({l.days} Day{l.days > 1 ? 's' : ''})</span>
                  <span>• Submitted: {l.submittedAt}</span>
                </div>
              </div>

              {/* Decision Action Column */}
              <div className="flex items-center gap-2 shrink-0">
                {l.status.includes('Pending') ? (
                  canEdit ? (
                    /* Super Admin Action Buttons */
                    <>
                      <button
                        onClick={() => handleRejectLeave(l.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveLeave(l.id)}
                        className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Leave</span>
                      </button>
                    </>
                  ) : (
                    /* Admin View Only Label */
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-navy-800 text-slate-500 border border-slate-200 dark:border-navy-700 inline-flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Pending Super Admin Decision</span>
                    </span>
                  )
                ) : (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    l.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                  }`}>
                    ✓ {l.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Employee Leave Balance Matrix */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex justify-between items-center">
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
              Annual Workforce Leave Quota Matrix
            </h3>
            <p className="text-[10px] text-slate-500">Statutory casual, medical sick, and paid privilege leave balances</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {canEdit ? '⚡ Super Admin Quota Adjustments Enabled' : '🔒 Read-Only Quotas'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                <th className="p-4 font-bold">Employee Name & ID</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 font-bold text-center">Casual Leave</th>
                <th className="p-4 font-bold text-center">Medical / Sick</th>
                <th className="p-4 font-bold text-center">Privilege / Paid</th>
                <th className="p-4 font-bold text-center">Total Balance</th>
                <th className="p-4 font-bold text-right">
                  {canEdit ? 'Quota Action' : 'Permission'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {balances.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {b.name}
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">{b.id}</span>
                  </td>
                  <td className="p-4 text-slate-500">{b.department}</td>
                  <td className="p-4 text-center font-mono font-bold text-blue-600">{b.casual} Days</td>
                  <td className="p-4 text-center font-mono font-bold text-amber-600">{b.sick} Days</td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-600">{b.paid} Days</td>
                  <td className="p-4 text-center font-mono font-black text-slate-900 dark:text-white">
                    {b.casual + b.sick + b.paid} Days
                  </td>
                  <td className="p-4 text-right">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => handleOpenBalanceEdit(b)}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500/20 text-slate-700 dark:text-slate-200 hover:text-gold-600 font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs border border-slate-200 dark:border-navy-700"
                        title="Super Admin edit leave quota"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Adjust Quota</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 font-bold inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Locked</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin: Adjust Quota Modal */}
      {canEdit && editingBalance && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-navy-950 text-white flex justify-between items-center border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-sm text-white">Super Admin — Adjust Leave Quotas</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBalance(null)}
                className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{editingBalance.name}</p>
                <p className="text-[11px] text-slate-500">{editingBalance.id} • {editingBalance.department}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Casual Days</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={balanceForm.casual}
                    onChange={(e) => setBalanceForm({ ...balanceForm, casual: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sick Days</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={balanceForm.sick}
                    onChange={(e) => setBalanceForm({ ...balanceForm, sick: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paid Days</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={balanceForm.paid}
                    onChange={(e) => setBalanceForm({ ...balanceForm, paid: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Adjustment Justification</label>
                <textarea
                  rows="2"
                  value={balanceForm.reason}
                  onChange={(e) => setBalanceForm({ ...balanceForm, reason: e.target.value })}
                  placeholder="e.g. Compensatory credit for overseas recruitment drive..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBalance(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold shadow-xs transition cursor-pointer"
                >
                  Save Quota Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin: Grant Special Leave Modal */}
      {canEdit && isGrantOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-navy-950 text-white flex justify-between items-center border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-sm text-white">Super Admin — Grant Special Sanctioned Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGrantOpen(false)}
                className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Employee</label>
                <select
                  value={grantForm.employeeId}
                  onChange={(e) => setGrantForm({ ...grantForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-bold"
                >
                  {balances.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.id} • {b.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Days Granted</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={grantForm.days}
                    onChange={(e) => setGrantForm({ ...grantForm, days: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={grantForm.startDate}
                    onChange={(e) => setGrantForm({ ...grantForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Classification</label>
                <input
                  type="text"
                  value={grantForm.type}
                  onChange={(e) => setGrantForm({ ...grantForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grant Reason / Executive Note</label>
                <textarea
                  rows="2"
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGrantOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold shadow-xs transition cursor-pointer"
                >
                  Issue Special Leave
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


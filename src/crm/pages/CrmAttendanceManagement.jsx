import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, AlertCircle, Calendar, Download, Search, 
  Filter, Plus, Edit3, ShieldCheck, Lock, Eye, X, Check, ArrowRight,
  UserCheck, AlertTriangle, RefreshCw, FileText
} from 'lucide-react';

const INITIAL_ATTENDANCE = [
  {
    id: 'REV-EMP-101',
    name: 'Balavarshini S.',
    role: 'Lead HR Operations Specialist',
    department: 'HR Operations',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '08:52 AM',
    checkOut: '06:05 PM',
    hours: '9.2 hrs',
    status: 'Present',
    late: false,
    remarks: 'Punctual • Biometric Verified'
  },
  {
    id: 'REV-EMP-102',
    name: 'Diviya R.',
    role: 'Senior Talent Acquisition Specialist',
    department: 'Talent Acquisition',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '09:18 AM',
    checkOut: '06:15 PM',
    hours: '9.0 hrs',
    status: 'Present',
    late: true,
    remarks: 'Late arrival (+18m) • Traffic delay'
  },
  {
    id: 'REV-EMP-103',
    name: 'Chentamilselvi M.',
    role: 'HR Compliance & Verification Officer',
    department: 'HR Operations',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '08:58 AM',
    checkOut: '06:00 PM',
    hours: '9.0 hrs',
    status: 'Present',
    late: false,
    remarks: 'On Time • Biometric'
  },
  {
    id: 'REV-EMP-104',
    name: 'Kishore Kumar',
    role: 'Senior Recruitment Partner (GCC & Tech)',
    department: 'Talent Acquisition',
    location: 'Bangalore Office',
    date: '2026-11-10',
    checkIn: '08:45 AM',
    checkOut: '06:10 PM',
    hours: '9.4 hrs',
    status: 'Present',
    late: false,
    remarks: 'Early punch • Direct terminal'
  },
  {
    id: 'REV-EMP-105',
    name: 'Sreeja Nair',
    role: 'Campus Placement & University Relations Head',
    department: 'Placement & Relations',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '-',
    checkOut: '-',
    hours: '0 hrs',
    status: 'On Leave',
    late: false,
    remarks: 'Pre-approved Earned Leave (LEV-503)'
  },
  {
    id: 'REV-EMP-106',
    name: 'Arjun Venkatesh',
    role: 'Full Stack Cloud Engineer',
    department: 'Engineering',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '09:25 AM',
    checkOut: '06:30 PM',
    hours: '9.1 hrs',
    status: 'Present',
    late: true,
    remarks: 'Late arrival (+25m) • Remote sync'
  },
  {
    id: 'REV-EMP-107',
    name: 'Meenakshi Sundaram',
    role: 'Senior International Admissions Consultant',
    department: 'Academic Advisory',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '08:50 AM',
    checkOut: '06:05 PM',
    hours: '9.2 hrs',
    status: 'Present',
    late: false,
    remarks: 'Punctual • Biometric'
  },
  {
    id: 'REV-EMP-108',
    name: 'Dr. Vigneshwaran K.',
    role: 'Executive Career Advisor & Principal Mentor',
    department: 'Client Advisory',
    location: 'Chennai HQ',
    date: '2026-11-10',
    checkIn: '-',
    checkOut: '-',
    hours: '0 hrs',
    status: 'Absent',
    late: false,
    remarks: 'Unscheduled absence • Awaiting documentation'
  }
];

export const CrmAttendanceManagement = ({ isSuperAdmin, currentRole }) => {
  // Can edit only if active role is Super Admin
  const canEdit = isSuperAdmin || currentRole === 'Super Admin';

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_workforce_attendance');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  // Edit Attendance Modal State (Super Admin Only)
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    hours: '9.0 hrs',
    late: false,
    remarks: ''
  });

  // Manual Punch Modal State (Super Admin Only)
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    id: '',
    department: 'HR Operations',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    hours: '9.0 hrs',
    remarks: 'Super Admin manual regularization'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    try {
      localStorage.setItem('crm_workforce_attendance', JSON.stringify(newRecords));
    } catch {}
  };

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    if (!canEdit) return;
    setEditingRecord(rec);
    setEditForm({
      status: rec.status,
      checkIn: rec.checkIn === '-' ? '09:00 AM' : rec.checkIn,
      checkOut: rec.checkOut === '-' ? '06:00 PM' : rec.checkOut,
      hours: rec.hours === '0 hrs' ? '9.0 hrs' : rec.hours,
      late: rec.late,
      remarks: rec.remarks || ''
    });
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!canEdit || !editingRecord) return;

    const updated = records.map(r => {
      if (r.id === editingRecord.id) {
        return {
          ...r,
          status: editForm.status,
          checkIn: editForm.status === 'Absent' || editForm.status === 'On Leave' ? '-' : editForm.checkIn,
          checkOut: editForm.status === 'Absent' || editForm.status === 'On Leave' ? '-' : editForm.checkOut,
          hours: editForm.status === 'Absent' || editForm.status === 'On Leave' ? '0 hrs' : editForm.hours,
          late: editForm.late,
          remarks: editForm.remarks
        };
      }
      return r;
    });

    saveRecords(updated);
    setEditingRecord(null);
    showToast(`✓ Attendance record for ${editingRecord.name} (${editingRecord.id}) updated successfully.`);
  };

  // Quick Toggle Status (Super Admin Only)
  const handleQuickToggle = (recId) => {
    if (!canEdit) return;
    const updated = records.map(r => {
      if (r.id === recId) {
        const nextStatus = r.status === 'Present' ? 'Absent' : 'Present';
        return {
          ...r,
          status: nextStatus,
          checkIn: nextStatus === 'Present' ? '09:00 AM' : '-',
          checkOut: nextStatus === 'Present' ? '06:00 PM' : '-',
          hours: nextStatus === 'Present' ? '9.0 hrs' : '0 hrs',
          late: false,
          remarks: `Quick override by Super Admin on ${new Date().toLocaleDateString('en-GB')}`
        };
      }
      return r;
    });
    saveRecords(updated);
    showToast(`✓ Attendance status toggled by Super Admin.`);
  };

  // Bulk Mark All Present (Super Admin Only)
  const handleBulkMarkAllPresent = () => {
    if (!canEdit) return;
    const updated = records.map(r => ({
      ...r,
      status: 'Present',
      checkIn: r.checkIn === '-' ? '09:00 AM' : r.checkIn,
      checkOut: r.checkOut === '-' ? '06:00 PM' : r.checkOut,
      hours: r.hours === '0 hrs' ? '9.0 hrs' : r.hours,
      remarks: 'Super Admin bulk regularization'
    }));
    saveRecords(updated);
    showToast('✓ All workforce records marked as Present for today.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Location', 'Date', 'Status', 'Check-In', 'Check-Out', 'Hours', 'Late Alert', 'Remarks'];
    const rows = records.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.department}"`,
      `"${r.location}"`,
      r.date,
      r.status,
      r.checkIn,
      r.checkOut,
      r.hours,
      r.late ? 'Late Arrival' : 'On Time',
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Revival_Workforce_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Attendance CSV exported successfully.');
  };

  // Filtered Records
  const filtered = records.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.role.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'All' || r.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.late).length;
  const leaveCount = records.filter(r => r.status === 'On Leave').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

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
              Workforce Attendance & Biometric Registry
            </h2>
            {canEdit ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-gold-400 border border-amber-300 dark:border-gold-500/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-gold-500" />
                Super Admin Mode (Full Edit & Override)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-navy-700 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Admin View Mode (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric punch logs, shift compliance, and working hour summaries across all offices.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {canEdit && (
            <button
              onClick={handleBulkMarkAllPresent}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Super Admin override: Mark all workforce as Present for today"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-navy-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner */}
      {!canEdit && (
        <div className="p-3.5 bg-slate-100 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Admin View Only Notice:</strong> As Admin, you have full observational visibility over all attendance metrics and punch times. Attendance regularization, manual overrides, and record editing are strictly reserved for <strong>Super Admin</strong>.
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Present Today</span>
          <p className="text-2xl font-serif font-black text-emerald-600 mt-1">{presentCount} <span className="text-xs text-slate-400 font-sans font-normal">/ {records.length}</span></p>
          <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((presentCount / records.length) * 100)}% Workforce Active</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Late Arrivals</span>
          <p className="text-2xl font-serif font-black text-rose-600 mt-1">{lateCount}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Flagged for Punctuality</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">On Approved Leave</span>
          <p className="text-2xl font-serif font-black text-amber-600 mt-1">{leaveCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Sanctioned Leaves</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Unexcused Absences</span>
          <p className="text-2xl font-serif font-black text-slate-700 dark:text-slate-300 mt-1">{absentCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Follow-Up Required</span>
        </div>
      </div>

      {/* Attendance Registry Table Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs space-y-0">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name, ID or role..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="All">All Departments</option>
              <option value="HR Operations">HR Operations</option>
              <option value="Talent Acquisition">Talent Acquisition</option>
              <option value="Placement & Relations">Placement & Relations</option>
              <option value="Engineering">Engineering</option>
              <option value="Academic Advisory">Academic Advisory</option>
              <option value="Client Advisory">Client Advisory</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                <th className="p-4 font-bold">Employee Name & ID</th>
                <th className="p-4 font-bold">Department & Branch</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Check-In</th>
                <th className="p-4 font-bold text-center">Check-Out</th>
                <th className="p-4 font-bold text-center">Logged Hours</th>
                <th className="p-4 font-bold text-center">Punctuality Alert</th>
                <th className="p-4 font-bold text-right">
                  {canEdit ? 'Super Admin Actions' : 'Access Level'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                  {/* Name */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white leading-tight">{r.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.id} • {r.role}</div>
                  </td>

                  {/* Dept & Location */}
                  <td className="p-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{r.department}</div>
                    <div className="text-[10px] text-amber-700 dark:text-gold-400 font-semibold">{r.location}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.status === 'Present'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                        : r.status === 'On Leave'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Times */}
                  <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {r.checkIn}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-300">
                    {r.checkOut}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-emerald-600">
                    {r.hours}
                  </td>

                  {/* Punctuality */}
                  <td className="p-4 text-center">
                    {r.late ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200">
                        ⚠️ Late Arrival
                      </span>
                    ) : r.status === 'Present' ? (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ On Time</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    {canEdit ? (
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickToggle(r.id)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                          title="Toggle Present / Absent"
                        >
                          Toggle
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(r)}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Super Admin edit attendance record"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    ) : (
                      /* Admin View Only badge */
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-navy-700 inline-flex items-center gap-1" title="Editing attendance is restricted to Super Admin">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>View Only</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Edit Attendance Modal */}
      {canEdit && editingRecord && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-navy-950 text-white flex justify-between items-center border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gold-400" />
                <h3 className="font-serif font-bold text-sm text-white">Super Admin — Regularize & Edit Attendance</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{editingRecord.name}</p>
                <p className="text-[11px] text-slate-500">{editingRecord.id} • {editingRecord.role} • {editingRecord.department}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Attendance Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-bold"
                >
                  <option value="Present">Present</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {editForm.status === 'Present' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Check-In Time</label>
                    <input
                      type="text"
                      value={editForm.checkIn}
                      onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                      placeholder="e.g. 08:55 AM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      value={editForm.checkOut}
                      onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                      placeholder="e.g. 06:00 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono"
                    />
                  </div>
                </div>
              )}

              {editForm.status === 'Present' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Logged Hours</label>
                    <input
                      type="text"
                      value={editForm.hours}
                      onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                      placeholder="e.g. 9.1 hrs"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Late Arrival Alert</label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.late}
                          onChange={(e) => setEditForm({ ...editForm, late: e.target.checked })}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Flag as Late</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Super Admin Regularization Remarks</label>
                <textarea
                  rows="2"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Reason for manual adjustment (e.g. Biometric machine offline, verified by Super Admin)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold shadow-xs transition cursor-pointer"
                >
                  Save Attendance Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmAttendanceManagement;


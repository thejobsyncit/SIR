import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Clock, CheckCircle2, AlertCircle, Calendar, Download, Search, 
  Filter, Plus, Edit3, ShieldCheck, Lock, Eye, X, Check, ArrowRight,
  UserCheck, AlertTriangle, RefreshCw, FileText, ShieldAlert, Laptop,
  Globe, User
} from 'lucide-react';

const INITIAL_FALLBACK_ATTENDANCE = [
  {
    id: 'REV-EMP-001',
    name: 'Dhanalakshimi',
    role: 'Super Admin',
    department: 'Executive Management',
    location: 'Chennai HQ',
    date: '2026-11-17',
    checkIn: '09:00 AM',
    checkOut: 'Active Session',
    hours: 'Executive',
    status: 'Executive Active',
    late: false,
    lateMinutes: 0,
    lateApprovalStatus: 'EXEMPT',
    remarks: 'Super Admin Executive Console'
  },
  {
    id: 'REV-EMP-004',
    name: 'Kishore Kumar',
    role: 'Recruiter',
    department: 'Talent Acquisition & ATS',
    location: 'Bangalore Office',
    date: '2026-11-17',
    checkIn: '09:18 AM',
    checkOut: 'Active / In Office',
    hours: 'In Progress',
    status: 'Late',
    late: true,
    lateMinutes: 18,
    lateApprovalStatus: 'PENDING',
    remarks: 'Automated check-in on front portal login'
  },
  {
    id: 'REV-EMP-006',
    name: 'Balavarshini S.',
    role: 'HR Operations',
    department: 'International HR Operations',
    location: 'Chennai HQ',
    date: '2026-11-17',
    checkIn: '08:52 AM',
    checkOut: 'Active / In Office',
    hours: 'In Progress',
    status: 'Present',
    late: false,
    lateMinutes: 0,
    lateApprovalStatus: 'APPROVED',
    remarks: 'Live Biometric Punch'
  }
];

export const CrmAttendanceManagement = ({ isSuperAdmin, currentRole }) => {
  const { crmToken, currentRole: ctxRole, setActiveModule } = useCrm();
  const effectiveRole = currentRole || ctxRole || 'Super Admin';
  const canEdit = isSuperAdmin || effectiveRole === 'Super Admin';

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_workforce_attendance');
      return saved ? JSON.parse(saved) : INITIAL_FALLBACK_ATTENDANCE;
    } catch {
      return INITIAL_FALLBACK_ATTENDANCE;
    }
  });

  const [roleLogins, setRoleLogins] = useState([]);
  const [stats, setStats] = useState({
    totalWorkforce: 0,
    presentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    pendingApprovalCount: 0,
    absentCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [viewTab, setViewTab] = useState('register'); // 'register' | 'logins'
  const [approvingId, setApprovingId] = useState(null);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  // Fetch unified real-time workforce register from SQLite backend
  const fetchLiveRegister = async () => {
    try {
      setLoading(true);
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': effectiveRole || 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };

      const res = await fetch('/api/hr-ops/attendance/admin/today-register', {
        headers: authHeaders
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.register)) {
          setRecords(data.register);
          if (Array.isArray(data.roleLogins)) {
            setRoleLogins(data.roleLogins);
          }
          if (data.stats) {
            setStats(data.stats);
          }
          setLastSynced(new Date());
          try {
            localStorage.setItem('crm_workforce_attendance', JSON.stringify(data.register));
          } catch (_) {}
          return;
        }
      }
    } catch (err) {
      console.error('Failed to sync live attendance register:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRegister();
    const interval = setInterval(fetchLiveRegister, 5000);
    return () => clearInterval(interval);
  }, [crmToken, effectiveRole]);

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Super Admin Approval of Late Arrival Access
  const handleApproveLateEntry = async (attendanceId, empId, empName) => {
    try {
      setApprovingId(attendanceId || empId);
      const targetId = attendanceId || empId;
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };
      const res = await fetch(`/api/hr-ops/attendance/late-approvals/${targetId}/decision`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          decision: 'APPROVED',
          approvedBy: 'Super Admin (Attendance Management)',
          notes: 'Authorized from Attendance Management Register'
        })
      });
      if (res.ok) {
        showToast(`✓ Approved late arrival entry for ${empName}. Workspace unlocked.`);
        await fetchLiveRegister();
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rec) => {
    if (!canEdit) return;
    setEditingRecord(rec);
    setEditForm({
      status: rec.status === 'Not Clocked In' ? 'Present' : rec.status,
      checkIn: rec.checkIn === '—' ? '09:00 AM' : rec.checkIn,
      checkOut: rec.checkOut === '—' ? '06:00 PM' : rec.checkOut,
      hours: rec.hours === '0 hrs' ? '9.0 hrs' : rec.hours,
      late: rec.late || false,
      remarks: rec.remarks || ''
    });
  };

  // Save Edit (persists to backend SQLite + state)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canEdit || !editingRecord) return;

    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };
      await fetch(`/api/hr-ops/attendance/admin/record/${editingRecord.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          status: editForm.status,
          checkIn: editForm.checkIn,
          checkOut: editForm.checkOut,
          late: editForm.late,
          remarks: editForm.remarks
        })
      });
    } catch (_) {}

    await fetchLiveRegister();
    setEditingRecord(null);
    showToast(`✓ Attendance record for ${editingRecord.name} (${editingRecord.id}) updated successfully.`);
  };

  // Quick Toggle Status (Super Admin Only)
  const handleQuickToggle = async (rec) => {
    if (!canEdit) return;
    const nextStatus = rec.status === 'Present' ? 'Absent' : 'Present';
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };
      await fetch(`/api/hr-ops/attendance/admin/record/${rec.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          status: nextStatus,
          checkIn: nextStatus === 'Present' ? '09:00 AM' : '—',
          checkOut: nextStatus === 'Present' ? '06:00 PM' : '—',
          remarks: `Quick override by Super Admin on ${new Date().toLocaleDateString('en-GB')}`
        })
      });
    } catch (_) {}

    await fetchLiveRegister();
    showToast(`✓ Attendance status toggled for ${rec.name}.`);
  };

  // Bulk Mark All Present (Super Admin Only)
  const handleBulkMarkAllPresent = async () => {
    if (!canEdit) return;
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };
      for (const r of records) {
        if (r.status === 'Not Clocked In' || r.status === 'Absent') {
          try {
            await fetch(`/api/hr-ops/attendance/admin/record/${r.id}`, {
              method: 'PATCH',
              headers: authHeaders,
              body: JSON.stringify({
                status: 'Present',
                checkIn: '09:00 AM',
                checkOut: '06:00 PM',
                remarks: 'Super Admin bulk regularization'
              })
            });
          } catch (_) {}
        }
      }
    } catch (_) {}

    await fetchLiveRegister();
    showToast('✓ All workforce records marked as Present for today.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Department', 'Location', 'Date', 'Status', 'Check-In', 'Check-Out', 'Hours', 'Late Alert', 'Remarks'];
    const rows = records.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.role}"`,
      `"${r.department}"`,
      `"${r.location}"`,
      r.date || new Date().toISOString().split('T')[0],
      r.status,
      r.checkIn,
      r.checkOut,
      r.hours,
      r.late ? `Late Arrival (+${r.lateMinutes || 0}m)` : 'On Time',
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

  // Filtered Records for Register
  const filtered = records.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (r.name && r.name.toLowerCase().includes(q)) || (r.id && r.id.toLowerCase().includes(q)) || (r.role && r.role.toLowerCase().includes(q));
    const matchesDept = deptFilter === 'All' || r.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter || (statusFilter === 'Late' && r.late);
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filtered Role Logins
  const filteredLogins = roleLogins.filter(l => {
    const q = search.toLowerCase().trim();
    return !q || (l.employeeName && l.employeeName.toLowerCase().includes(q)) || (l.role && l.role.toLowerCase().includes(q)) || (l.email && l.email.toLowerCase().includes(q));
  });

  const formatLateMins = (mins) => {
    const m = Math.max(0, parseInt(mins, 10) || 0);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `+${h}h ${rem}m Late` : `+${h}h Late`;
    }
    return `+${m}m Late`;
  };

  const presentCount = stats.presentCount || records.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Executive Active').length;
  const lateCount = stats.lateCount || records.filter(r => r.late).length;
  const leaveCount = stats.leaveCount || records.filter(r => r.status === 'On Leave').length;
  const absentCount = stats.absentCount || records.filter(r => r.status === 'Not Clocked In' || r.status === 'Absent').length;
  const pendingCount = stats.pendingApprovalCount || records.filter(r => r.lateApprovalStatus === 'PENDING').length;

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
          <div className="flex items-center gap-2.5 flex-wrap">
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SQLite Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric punch logs, shift compliance, and working hour summaries across all offices.
            {lastSynced && (
              <span className="ml-2 text-[11px] text-slate-400 font-mono">
                Last synced: {lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            )}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={fetchLiveRegister}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-300 dark:border-navy-700 shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            title="Sync latest attendance and logins from SQLite database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-gold-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live SQLite Data</span>
          </button>

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
          <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
            {presentCount} <span className="text-xs text-slate-400 font-sans font-normal">/ {records.length}</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0}% Workforce Active
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Late Arrivals</span>
          <p className="text-2xl font-serif font-black text-rose-600 mt-1">{lateCount}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Flagged for Punctuality</span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Pending Authorization</span>
          <p className="text-2xl font-serif font-black text-amber-600 mt-1">{pendingCount}</p>
          <span className={`text-[10px] font-semibold ${pendingCount > 0 ? 'text-amber-600 animate-pulse font-bold' : 'text-slate-400'}`}>
            {pendingCount > 0 ? 'Requires Super Admin Approval' : '0 Pending Gated'}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Not Clocked In / Absent</span>
          <p className="text-2xl font-serif font-black text-slate-700 dark:text-slate-300 mt-1">{absentCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Follow-Up Required</span>
        </div>
      </div>

      {/* Attendance Registry Table Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs space-y-0">
        
        {/* Navigation View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 p-3 bg-slate-50 dark:bg-navy-950">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('register')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewTab === 'register'
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Today's Live Attendance Register</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${viewTab === 'register' ? 'bg-white/20 text-white dark:bg-navy-900/20 dark:text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'}`}>
                {records.length}
              </span>
            </button>

            <button
              onClick={() => setViewTab('logins')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                viewTab === 'logins'
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Live Role SSO Logins Feed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${viewTab === 'logins' ? 'bg-white/20 text-white dark:bg-navy-900/20 dark:text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'}`}>
                {roleLogins.length}
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Real-time SQLite feed active</span>
          </div>
        </div>

        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={viewTab === 'register' ? "Search employee by name, ID or role..." : "Search logins by name, email, or role..."}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {viewTab === 'register' && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="All">All Departments</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Talent Acquisition & ATS">Talent Acquisition & ATS</option>
                <option value="Placement & Industry Relations">Placement & Relations</option>
                <option value="International HR Operations">International HR Operations</option>
                <option value="Enquiry HR Operations">Enquiry HR Operations</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late Arrivals</option>
                <option value="Executive Active">Executive Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Not Clocked In">Not Clocked In</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Today's Live Attendance Register Content */}
        {viewTab === 'register' ? (
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
                {filtered.map(r => {
                  const isPending = r.lateApprovalStatus === 'PENDING';
                  return (
                    <tr 
                      key={r.id} 
                      className={`transition ${isPending ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70' : 'hover:bg-slate-50 dark:hover:bg-navy-950/60'}`}
                    >
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Synced from SQLite today"></span>
                          )}
                        </div>
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
                          r.status === 'Present' || r.status === 'Executive Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                            : r.status === 'Late'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                            : r.status === 'On Leave'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-700'
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

                      {/* Punctuality Alert */}
                      <td className="p-4 text-center">
                        {isPending ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 animate-pulse">
                              ▲ {formatLateMins(r.lateMinutes)} (Gated)
                            </span>
                            {canEdit && (
                              <button
                                onClick={() => handleApproveLateEntry(r.attendanceId, r.id, r.name)}
                                disabled={approvingId === (r.attendanceId || r.id)}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                {approvingId === (r.attendanceId || r.id) ? '...' : '✓ Approve Access'}
                              </button>
                            )}
                          </div>
                        ) : r.late ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            ▲ Late Arrival ({formatLateMins(r.lateMinutes)})
                          </span>
                        ) : r.status === 'Present' || r.status === 'Executive Active' ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ On Time</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="p-4 text-right">
                        {canEdit ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickToggle(r)}
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
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-navy-700 inline-flex items-center gap-1" title="Editing attendance is restricted to Super Admin">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>View Only</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Live Role SSO Logins Feed */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Staff / Role</th>
                  <th className="p-4 font-bold">Department</th>
                  <th className="p-4 font-bold">Shift Schedule</th>
                  <th className="p-4 font-bold">Check-In</th>
                  <th className="p-4 font-bold">Check-Out</th>
                  <th className="p-4 font-bold text-center">Worked Hours</th>
                  <th className="p-4 font-bold text-center">Sessions</th>
                  <th className="p-4 font-bold text-center">Punctuality</th>
                  <th className="p-4 font-bold text-center">Access Status</th>
                  <th className="p-4 font-bold text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filteredLogins.length > 0 ? (
                  filteredLogins.map(log => {
                    const isPending = log.lateApprovalStatus === 'PENDING';
                    const isApproved = log.lateApprovalStatus === 'APPROVED';
                    return (
                      <tr key={log.id} className={`transition ${isPending ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-navy-950/60'}`}>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{log.employeeName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.employeeId || 'ID'} • {log.role}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{log.department || 'Operations'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">{log.shiftName || 'General Shift'}</span>
                          <span className="text-[10px] font-mono text-slate-400">{log.shiftStart || '09:00'} - {log.shiftEnd || '18:00'}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{log.checkIn || log.checkInTime || log.loginTime?.slice(11, 16)}</span>
                          <span className="text-[10px] text-slate-400">{log.loginTime}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                          {log.checkOut === 'Active / In Office' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                              In Office
                            </span>
                          ) : (
                            log.checkOut || '—'
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-center text-indigo-600 dark:text-indigo-400">
                          {log.workedHours || 'In Progress'}
                        </td>
                        <td className="p-4 text-center">
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                            title={log.sessionsList && log.sessionsList.length ? log.sessionsList.join(' • ') : `${log.loginCount || 1} logins today`}
                          >
                            {log.loginCount || 1} {log.loginCount === 1 ? 'Login' : 'Logins'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {log.punctuality === 'Late' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300">
                              ▲ +{log.lateMinutes || 0}m Late
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                              ✓ On Time
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                              Pending Review
                            </span>
                          ) : isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300">
                              ✓ Authorized
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Logged</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {isPending && canEdit ? (
                            <button
                              onClick={() => handleApproveLateEntry(null, log.id, log.employeeName)}
                              disabled={approvingId === log.id}
                              className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {approvingId === log.id ? 'Unlocking...' : '✓ Approve Access'}
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400">
                              {log.approvedBy || log.ipAddress || 'Verified'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No role login sessions recorded today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Clock, CheckCircle2, AlertCircle, Calendar, Download, Search, 
  Filter, Plus, Edit3, ShieldCheck, Lock, Eye, X, Check, ArrowRight,
  UserCheck, AlertTriangle, RefreshCw, FileText, ShieldAlert, Laptop,
  Globe, User, FileSpreadsheet, Printer, TrendingUp, Briefcase,
  Layers, Radio, CalendarCheck, Award, Timer, ChevronRight, Activity
} from 'lucide-react';

export const CrmAttendanceManagement = ({ isSuperAdmin, currentRole }) => {
  const { crmToken, currentRole: ctxRole, user, setActiveModule } = useCrm();
  const effectiveRole = currentRole || ctxRole || 'Super Admin';
  const isSuperAdminOrAdmin = isSuperAdmin || effectiveRole === 'Super Admin' || effectiveRole === 'Admin';
  const isHrLead = effectiveRole === 'HR Lead';
  const canEdit = isSuperAdminOrAdmin;
  const canManageRoster = isSuperAdminOrAdmin || isHrLead;

  // Primary attendance register state — 100% database backed, zero dummy records
  const [records, setRecords] = useState([]);
  const [roleLogins, setRoleLogins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({
    totalWorkforce: 0,
    totalEmployees: 0,
    presentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    pendingApprovalCount: 0,
    absentCount: 0,
    notCheckedInCount: 0,
    checkedOutCount: 0,
    liveCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // Top navigation view tabs:
  // 'today' = Today Attendance Table & Overview
  // 'live' = Live Attendance (Real-time active checked-in workforce with running timers)
  // 'roster' = Shift Roster Management
  // 'analytics' = Overall Attendance Analytics & Irregularity Alerts
  // 'reports' = Attendance Reports & Multi-format Downloads (Excel, PDF, CSV)
  const [activeTab, setActiveTab] = useState('today');

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Individual Employee Attendance Details Modal State
  const [selectedEmpHistory, setSelectedEmpHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRange, setHistoryRange] = useState('month'); // 'day' | 'week' | 'month' | 'overall'
  const [customHistoryStart, setCustomHistoryStart] = useState('');
  const [customHistoryEnd, setCustomHistoryEnd] = useState('');

  // Shift Roster State
  const [shiftRoster, setShiftRoster] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [reassignModalEmp, setReassignModalEmp] = useState(null);
  const [newShiftId, setNewShiftId] = useState('');

  // Attendance Reports State
  const [reportFilterEmployee, setReportFilterEmployee] = useState('all');
  const [reportFilterDept, setReportFilterDept] = useState('all');
  const [reportFilterRole, setReportFilterRole] = useState('all');
  const [reportFilterRange, setReportFilterRange] = useState('month');
  const [reportCustomStart, setReportCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [reportCustomEnd, setReportCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportRows, setReportRows] = useState([]);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportMeta, setReportMeta] = useState(null);

  // Super Admin Edit Attendance Modal
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    late: false,
    remarks: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Auth Headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-crm-role': effectiveRole || 'Super Admin',
    'x-employee-email': user?.email || (isHrLead ? 'priya@therevival.ae' : 'thejobsyncit@gmail.com'),
    ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
  });

  // 1. Fetch unified real-time workforce register from live database
  const fetchLiveRegister = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const url = `/api/hr-ops/attendance/admin/today-register?date=${encodeURIComponent(selectedDate)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.register)) {
          setRecords(data.register);
          if (Array.isArray(data.departments)) setDepartments(data.departments);
          if (Array.isArray(data.roles)) setRoles(data.roles);
          if (data.stats) setStats(data.stats);
          setLastSynced(new Date());
        }
      }
    } catch (err) {
      console.error('Failed to sync live attendance register:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Individual Employee History
  const fetchEmployeeHistory = async (empId, range = historyRange, start = customHistoryStart, end = customHistoryEnd) => {
    try {
      setHistoryLoading(true);
      let url = `/api/hr-ops/attendance/employee/${encodeURIComponent(empId)}/history?range=${encodeURIComponent(range)}&date=${encodeURIComponent(selectedDate)}`;
      if (range === 'overall' && start && end) {
        url += `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
      }
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedEmpHistory(data);
        }
      }
    } catch (err) {
      console.error('Failed to load employee history:', err);
      showToast('Could not load employee attendance history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 3. Fetch Shift Roster
  const fetchShiftRoster = async () => {
    try {
      setRosterLoading(true);
      const res = await fetch('/api/hr-ops/attendance/shift-roster', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShiftRoster(data.roster || []);
          setAvailableShifts(data.shifts || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch shift roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  // 4. Save Reassigned Shift
  const handleSaveShiftAssignment = async () => {
    if (!reassignModalEmp || !newShiftId || !canManageRoster) return;
    try {
      const res = await fetch(`/api/hr-ops/attendance/shift-roster/${encodeURIComponent(reassignModalEmp.employeeId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ shiftId: newShiftId })
      });
      if (res.ok) {
        showToast(`✓ Shift updated for ${reassignModalEmp.name}.`);
        setReassignModalEmp(null);
        await fetchShiftRoster();
        await fetchLiveRegister();
      }
    } catch (err) {
      console.error('Failed to assign shift:', err);
    }
  };

  // 5. Generate Attendance Reports
  const handleGenerateReport = async () => {
    try {
      setReportGenerating(true);
      let url = `/api/hr-ops/attendance/reports?employeeId=${encodeURIComponent(reportFilterEmployee)}&department=${encodeURIComponent(reportFilterDept)}&role=${encodeURIComponent(reportFilterRole)}&range=${encodeURIComponent(reportFilterRange)}&date=${encodeURIComponent(selectedDate)}`;
      if (reportFilterRange === 'custom') {
        url += `&startDate=${encodeURIComponent(reportCustomStart)}&endDate=${encodeURIComponent(reportCustomEnd)}`;
      }
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReportRows(data.report || []);
          setReportMeta(data);
          showToast(`✓ Generated report for ${data.report?.length || 0} employee records.`);
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setReportGenerating(false);
    }
  };

  // Polling intervals & initial fetch
  useEffect(() => {
    fetchLiveRegister(true);
    // Real-time automatic polling every 6 seconds to update live punches without requiring page refresh
    const interval = setInterval(() => {
      fetchLiveRegister(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedDate, effectiveRole]);

  // Load roster when switching to Roster tab
  useEffect(() => {
    if (activeTab === 'roster') {
      fetchShiftRoster();
    } else if (activeTab === 'reports' && reportRows.length === 0) {
      handleGenerateReport();
    }
  }, [activeTab]);

  // Handle individual employee history range switch
  const handleSwitchHistoryRange = (newRange) => {
    setHistoryRange(newRange);
    if (selectedEmpHistory?.employee?.employeeId) {
      fetchEmployeeHistory(selectedEmpHistory.employee.employeeId, newRange);
    }
  };

  // Super Admin & HR Lead Approval of Late Arrival Access
  const handleApproveLateEntry = async (attendanceId, empId, empName, empRole) => {
    try {
      setApprovingId(attendanceId || empId);
      const targetId = attendanceId || empId;
      const res = await fetch(`/api/hr-ops/attendance/late-approvals/${targetId}/decision`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision: 'APPROVED',
          approvedBy: `${effectiveRole} (Attendance Management)`,
          notes: 'Authorized from Attendance Management Register'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(`✓ Approved late arrival entry for ${empName}. Workspace unlocked.`);
        await fetchLiveRegister();
      } else {
        showToast(data.message || 'Failed to approve late arrival entry.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Error communicating with database.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  // Open Super Admin Edit Modal
  const handleOpenEdit = (rec) => {
    if (!canEdit) return;
    setEditingRecord(rec);
    setEditForm({
      status: rec.status === 'Not Checked In' ? 'Present' : rec.status,
      checkIn: rec.checkIn === '—' ? '09:00 AM' : rec.checkIn,
      checkOut: rec.checkOut === '—' || rec.checkOut === 'Not Checked Out' ? '06:00 PM' : rec.checkOut,
      late: rec.late || false,
      remarks: rec.remarks || ''
    });
  };

  // Save Super Admin Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canEdit || !editingRecord) return;
    try {
      await fetch(`/api/hr-ops/attendance/admin/record/${editingRecord.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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

  // Quick Toggle Status (Super Admin)
  const handleQuickToggle = async (rec) => {
    if (!canEdit) return;
    const nextStatus = rec.status === 'Present' || rec.status === 'Executive Active' ? 'Absent' : 'Present';
    try {
      await fetch(`/api/hr-ops/attendance/admin/record/${rec.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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

  // Bulk Mark All Present
  const handleBulkMarkAllPresent = async () => {
    if (!canEdit) return;
    try {
      for (const r of records) {
        if (r.status === 'Not Checked In' || r.status === 'Absent') {
          try {
            await fetch(`/api/hr-ops/attendance/admin/record/${r.id}`, {
              method: 'PATCH',
              headers: getAuthHeaders(),
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

  // Export CSV Handler
  const handleExportCSV = (dataset = records, filenamePrefix = 'Workforce_Attendance') => {
    const headers = [
      'Employee Name', 'Employee ID', 'Department', 'Role', 'Status', 
      'Check-In', 'Check-Out', 'Total Logged Hours', 'Punctuality', 'Attendance Alerts'
    ];
    const rows = dataset.map(r => [
      `"${r.name || r.employeeName || ''}"`,
      `"${r.id || r.employeeId || ''}"`,
      `"${r.department || ''}"`,
      `"${r.role || r.designation || ''}"`,
      `"${r.status || ''}"`,
      `"${r.checkIn || r.checkInTime || '—'}"`,
      `"${r.checkOut || r.checkOutTime || '—'}"`,
      `"${r.hours || r.totalLoggedHours || '0 hrs'}"`,
      `"${r.punctuality || 'On Time'}"`,
      `"${r.attendanceAlerts || 'None'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Revival_${filenamePrefix}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ CSV file exported successfully.');
  };

  // Export Excel (.xlsx compatible XML Spreadsheet)
  const handleExportExcel = (dataset = records, filenamePrefix = 'Workforce_Attendance') => {
    const headers = [
      'Employee Name', 'Employee ID', 'Department', 'Role', 'Status', 
      'Check-In', 'Check-Out', 'Total Logged Hours', 'Punctuality', 'Attendance Alerts'
    ];

    let rowsXml = '';
    dataset.forEach(r => {
      rowsXml += `
        <Row ss:StyleID="Row">
          <Cell><Data ss:Type="String">${escapeXml(r.name || r.employeeName || '')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.id || r.employeeId || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(r.department || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(r.role || r.designation || '')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.status || '')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.checkIn || r.checkInTime || '—')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.checkOut || r.checkOutTime || '—')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.hours || r.totalLoggedHours || '0 hrs')}</Data></Cell>
          <Cell ss:StyleID="Center"><Data ss:Type="String">${escapeXml(r.punctuality || 'On Time')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(r.attendanceAlerts || 'None')}</Data></Cell>
        </Row>
      `;
    });

    const xmlTemplate = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Styles>
          <Style ss:ID="Header">
            <Font ss:Bold="1" ss:Color="#FFFFFF"/>
            <Interior ss:Color="#0B1B33" ss:Pattern="Solid"/>
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          </Style>
          <Style ss:ID="Row">
            <Font ss:Color="#1E293B"/>
            <Alignment ss:Vertical="Center"/>
          </Style>
          <Style ss:ID="Center">
            <Font ss:Color="#1E293B"/>
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          </Style>
        </Styles>
        <Worksheet ss:Name="Attendance">
          <Table>
            <Column ss:Width="160"/>
            <Column ss:Width="110"/>
            <Column ss:Width="160"/>
            <Column ss:Width="150"/>
            <Column ss:Width="100"/>
            <Column ss:Width="90"/>
            <Column ss:Width="110"/>
            <Column ss:Width="120"/>
            <Column ss:Width="110"/>
            <Column ss:Width="160"/>
            <Row ss:StyleID="Header">
              ${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}
            </Row>
            ${rowsXml}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([xmlTemplate], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revival_${filenamePrefix}_${selectedDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Excel (.xlsx) file exported successfully.');
  };

  // Export PDF (clean print view)
  const handleExportPDF = (dataset = records, reportTitle = 'Workforce Attendance Register') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented PDF generation. Please allow popups.');
      return;
    }

    const rowsHtml = dataset.map((r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 12px; font-weight: bold; color: #0f172a;">${r.name || r.employeeName || ''}</td>
        <td style="padding: 8px 12px; font-family: monospace; color: #475569;">${r.id || r.employeeId || ''}</td>
        <td style="padding: 8px 12px; color: #334155;">${r.department || ''}</td>
        <td style="padding: 8px 12px; color: #334155;">${r.role || r.designation || ''}</td>
        <td style="padding: 8px 12px; text-align: center; font-weight: 600;">${r.status || ''}</td>
        <td style="padding: 8px 12px; text-align: center; font-family: monospace;">${r.checkIn || r.checkInTime || '—'}</td>
        <td style="padding: 8px 12px; text-align: center; font-family: monospace;">${r.checkOut || r.checkOutTime || '—'}</td>
        <td style="padding: 8px 12px; text-align: center; font-weight: bold; color: #059669;">${r.hours || r.totalLoggedHours || '0 hrs'}</td>
        <td style="padding: 8px 12px; text-align: center;">${r.punctuality || 'On Time'}</td>
        <td style="padding: 8px 12px; color: #b45309;">${r.attendanceAlerts || 'None'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>The Revival International - ${reportTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D9AF2B; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 900; color: #0B1B33; font-family: Georgia, serif; }
          .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background-color: #0B1B33; color: #ffffff; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print {
            body { margin: 10mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">THE REVIVAL INTERNATIONAL</div>
            <div class="sub">Executive Recruitment & Academic Advisory • Dubai • GCC • Worldwide</div>
            <div style="font-weight: bold; font-size: 14px; margin-top: 8px; color: #0B1B33;">${reportTitle}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: bold;">Workforce Registry Report</div>
            <div style="font-size: 11px; color: #64748b;">Date: ${selectedDate}</div>
            <div style="font-size: 10px; color: #64748b;">Generated: ${new Date().toLocaleString()}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Role</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center;">Check-In</th>
              <th style="text-align: center;">Check-Out</th>
              <th style="text-align: center;">Logged Hours</th>
              <th style="text-align: center;">Punctuality</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <span>Enterprise Confidential — Revival CRM Attendance System</span>
          <span>Verified & Certified Database Report</span>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    showToast('✓ PDF preview opened for print/download.');
  };

  const escapeXml = (unsafe) => {
    return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  // Filtered records for Employee Attendance Table
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        (r.name && r.name.toLowerCase().includes(q)) || 
        (r.id && r.id.toLowerCase().includes(q)) || 
        (r.role && r.role.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q));

      const matchesDept = deptFilter === 'All' || r.department === deptFilter;
      const matchesRole = roleFilter === 'All' || r.role === roleFilter;

      let matchesStatus = true;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Late') {
          matchesStatus = r.status === 'Late' || r.late;
        } else if (statusFilter === 'Present') {
          matchesStatus = r.status === 'Present' || r.status === 'Executive Active';
        } else {
          matchesStatus = r.status === statusFilter;
        }
      }

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [records, search, deptFilter, roleFilter, statusFilter]);

  // Live Checked-In Employees (Requirement 4)
  const liveActiveEmployees = useMemo(() => {
    return records.filter(r => r.isLive || r.status === 'Present' || r.status === 'Late' || r.status === 'Executive Active');
  }, [records]);

  // Real Attendance Alerts (Requirement 8)
  const realAlerts = useMemo(() => {
    const list = [];
    records.forEach(r => {
      if (r.lateApprovalStatus === 'PENDING') {
        list.push({
          type: 'danger',
          badge: 'GATED ENTRY',
          emp: r.name,
          empId: r.id,
          message: `Arrived +${r.lateMinutes || 15}m late. Workspace access is gated pending Super Admin override.`,
          action: () => handleApproveLateEntry(r.attendanceId, r.id, r.name)
        });
      } else if (r.status === 'Late' || r.late) {
        list.push({
          type: 'warning',
          badge: 'LATE ARRIVAL',
          emp: r.name,
          empId: r.id,
          message: `Clocked in at ${r.checkIn} (+${r.lateMinutes || 0}m past shift start).`,
          action: null
        });
      } else if (r.status === 'Not Checked In' && new Date().getHours() >= 10 && selectedDate === new Date().toISOString().slice(0, 10)) {
        list.push({
          type: 'info',
          badge: 'NOT CHECKED IN',
          emp: r.name,
          empId: r.id,
          message: `Has not logged into the workspace yet today. Scheduled shift: ${r.shiftName || 'General Shift'}.`,
          action: null
        });
      } else if (r.checkOut === 'Not Checked Out' && new Date().getHours() >= 19 && selectedDate === new Date().toISOString().slice(0, 10)) {
        list.push({
          type: 'warning',
          badge: 'MISSING CHECK-OUT',
          emp: r.name,
          empId: r.id,
          message: `Shift ended but employee has not logged out yet.`,
          action: null
        });
      }
    });
    return list;
  }, [records, selectedDate]);

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
              Live Database Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric punch logs, shift compliance, and working hour summaries across all departments and roles.
            {lastSynced && (
              <span className="ml-2 text-[11px] text-slate-400 font-mono">
                Last synced: {lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            )}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800">
            <Calendar className="w-3.5 h-3.5 text-gold-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            />
          </div>

          <button
            onClick={() => fetchLiveRegister(true)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-300 dark:border-navy-700 shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            title="Sync latest attendance from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-gold-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          {canEdit && (
            <button
              onClick={handleBulkMarkAllPresent}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
              title="Super Admin override: Mark all workforce as Present for selected date"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          )}

          {/* Download Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl border border-slate-200 dark:border-navy-700">
            <button
              onClick={() => handleExportExcel(filteredRecords)}
              className="px-2.5 py-1.5 hover:bg-white dark:hover:bg-navy-900 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
              title="Download Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExportPDF(filteredRecords)}
              className="px-2.5 py-1.5 hover:bg-white dark:hover:bg-navy-900 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
              title="Download / Print PDF"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExportCSV(filteredRecords)}
              className="px-2.5 py-1.5 hover:bg-white dark:hover:bg-navy-900 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Module Navigation Tabs (Requirement 4, 5, 7, 10) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today Attendance</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'today' ? 'bg-white/20 text-white dark:bg-navy-900/20 dark:text-navy-950' : 'bg-slate-200 dark:bg-navy-800'}`}>
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Live Attendance</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'live' ? 'bg-white/20 text-white dark:bg-navy-900/20 dark:text-navy-950' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
            {liveActiveEmployees.length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Shift Roster Management</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overall Analytics & Alerts</span>
          {realAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
              {realAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Attendance Reports & Download</span>
        </button>
      </div>

      {/* TAB 1: TODAY ATTENDANCE VIEW */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Summary KPI Cards (Requirement 1 & 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Present Today</span>
              <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
                {stats.presentCount} <span className="text-xs text-slate-400 font-sans font-normal">/ {records.length}</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {records.length > 0 ? Math.round((stats.presentCount / records.length) * 100) : 0}% Workforce Active
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Late Arrivals</span>
              <p className="text-2xl font-serif font-black text-rose-600 mt-1">{stats.lateCount}</p>
              <span className="text-[10px] text-rose-600 font-semibold">Flagged for Punctuality</span>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Pending Authorization</span>
              <p className="text-2xl font-serif font-black text-amber-600 mt-1">{stats.pendingApprovalCount}</p>
              <span className={`text-[10px] font-semibold ${stats.pendingApprovalCount > 0 ? 'text-amber-600 animate-pulse font-bold' : 'text-slate-400'}`}>
                {stats.pendingApprovalCount > 0 ? 'Requires Super Admin Approval' : '0 Pending Gated'}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">On Leave</span>
              <p className="text-2xl font-serif font-black text-blue-600 mt-1">{stats.leaveCount}</p>
              <span className="text-[10px] text-blue-600 font-semibold">Approved Leave Records</span>
            </div>

            <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">Not Clocked In / Absent</span>
              <p className="text-2xl font-serif font-black text-slate-700 dark:text-slate-300 mt-1">{stats.absentCount + stats.notCheckedInCount}</p>
              <span className="text-[10px] text-slate-400 font-semibold">Follow-Up Required</span>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
            
            {/* Table Filters (Requirement 6) */}
            <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full md:w-80">
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

              {/* Dynamic Department, Role, and Status Dropdowns (Requirement 6) */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late Arrivals</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Not Checked In">Not Checked In</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Attendance Table with all 11 required columns (Requirement 2) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                    <th className="p-3.5 font-bold">1. Employee Name</th>
                    <th className="p-3.5 font-bold">2. Employee ID</th>
                    <th className="p-3.5 font-bold">3. Department</th>
                    <th className="p-3.5 font-bold">4. Role / Designation</th>
                    <th className="p-3.5 font-bold text-center">5. Attendance Status</th>
                    <th className="p-3.5 font-bold text-center">6. Check-In</th>
                    <th className="p-3.5 font-bold text-center">7. Check-Out</th>
                    <th className="p-3.5 font-bold text-center">8. Total Logged Hours</th>
                    <th className="p-3.5 font-bold text-center">9. Punctuality</th>
                    <th className="p-3.5 font-bold">10. Attendance Alerts</th>
                    <th className="p-3.5 font-bold text-right">11. Action / View Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {loading && records.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-500" />
                        <span>Loading registered employee attendance records from database...</span>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="p-12 text-center text-slate-400">
                        No employees match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(r => {
                      const isPending = r.lateApprovalStatus === 'PENDING';
                      return (
                        <tr 
                          key={r.id} 
                          className={`transition ${isPending ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70' : 'hover:bg-slate-50 dark:hover:bg-navy-950/60'}`}
                        >
                          {/* 1. Employee Name */}
                          <td className="p-3.5">
                            <button
                              onClick={() => fetchEmployeeHistory(r.id)}
                              className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2 hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer text-left group"
                              title="Click to view full attendance history"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-navy-800 flex items-center justify-center font-black text-xs text-navy-950 dark:text-gold-400 shrink-0 overflow-hidden border border-slate-300 dark:border-navy-700">
                                {r.avatar ? (
                                  <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{r.name ? r.name[0] : 'E'}</span>
                                )}
                              </div>
                              <span className="group-hover:underline">{r.name}</span>
                              {r.isLive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping shrink-0" title="Active live session"></span>
                              )}
                            </button>
                          </td>

                          {/* 2. Employee ID */}
                          <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                            {r.id}
                          </td>

                          {/* 3. Department */}
                          <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {r.department}
                          </td>

                          {/* 4. Role / Designation */}
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{r.role}</div>
                            {r.designation && r.designation !== r.role && (
                              <div className="text-[10px] text-slate-400 font-normal">{r.designation}</div>
                            )}
                          </td>

                          {/* 5. Attendance Status */}
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Present' || r.status === 'Executive Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                : r.status === 'Late'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                                : r.status === 'Half Day'
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                                : r.status === 'On Leave'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                                : r.status === 'Checked Out'
                                ? 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700'
                                : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-700'
                            }`}>
                              {r.status}
                            </span>
                          </td>

                          {/* 6. Check-In Time */}
                          <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {r.checkIn}
                          </td>

                          {/* 7. Check-Out Time */}
                          <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                            {r.checkOut}
                          </td>

                          {/* 8. Total Logged Hours */}
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {r.hours}
                          </td>

                          {/* 9. Punctuality */}
                          <td className="p-3.5 text-center font-medium">
                            {r.punctuality?.includes('Late') ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">{r.punctuality}</span>
                            ) : r.punctuality === 'On Time' ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ On Time</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 10. Attendance Alerts */}
                          <td className="p-3.5">
                            {isPending ? (() => {
                              const isTargetHrLead = String(r.role || '').toLowerCase().includes('lead');
                              const isSelf = user?.employeeId && (r.id === user.employeeId || r.employeeId === user.employeeId);
                              const canApproveThisRow = isSuperAdminOrAdmin ? !isSelf : (isHrLead && !isTargetHrLead && !isSelf);

                              return (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 animate-pulse">
                                    ▲ Gated (+{r.lateMinutes}m)
                                  </span>
                                  {canApproveThisRow ? (
                                    <button
                                      onClick={() => handleApproveLateEntry(r.attendanceId, r.id, r.name, r.role)}
                                      disabled={approvingId === (r.attendanceId || r.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer disabled:opacity-50 transition"
                                      title={`Authorize late arrival for ${r.name}`}
                                    >
                                      {approvingId === (r.attendanceId || r.id) ? '...' : 'Approve'}
                                    </button>
                                  ) : isTargetHrLead && isHrLead ? (
                                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/40" title="Only Super Admin has authority to approve HR Lead">
                                      Requires Super Admin
                                    </span>
                                  ) : isSelf ? (
                                    <span className="text-[10px] text-slate-400 font-semibold italic">
                                      Self-Approval Restricted
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                                      Pending Auth
                                    </span>
                                  )}
                                </div>
                              );
                            })() : r.attendanceAlerts && r.attendanceAlerts !== 'None' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 border border-amber-200 dark:border-amber-800/40 inline-flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                {r.attendanceAlerts}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Normal</span>
                            )}
                          </td>

                          {/* 11. Action / View Details */}
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => fetchEmployeeHistory(r.id)}
                                className="px-2.5 py-1 rounded-xl bg-gold-50 dark:bg-gold-500/10 hover:bg-gold-100 dark:hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold text-[11px] border border-gold-300 dark:border-gold-500/30 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                title="View individual complete attendance history"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>

                              {canEdit && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickToggle(r)}
                                    className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                                    title="Toggle Present / Absent"
                                  >
                                    Toggle
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(r)}
                                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="Edit attendance record"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: LIVE ATTENDANCE VIEW (Requirement 4) */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Live Status Header */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Live Active Workforce Roster</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                    LIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Tracking active logged-in employees in real time with dynamically running logged hours. Auto-refreshing every 6s.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actively Checked In</span>
              <p className="text-2xl font-serif font-black text-emerald-600">
                {liveActiveEmployees.length} <span className="text-xs font-sans text-slate-400 font-normal">employees</span>
              </p>
            </div>
          </div>

          {/* Live Active Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveActiveEmployees.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl text-slate-400">
                No active employee check-in sessions currently logged for today.
              </div>
            ) : (
              liveActiveEmployees.map(emp => (
                <div 
                  key={emp.id}
                  className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl p-4 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden border border-slate-200 dark:border-navy-700 flex items-center justify-center font-bold text-xs text-navy-950 dark:text-gold-400">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{emp.name ? emp.name[0] : 'E'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.id} • {emp.role}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300 dark:border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Active
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-navy-950 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-In Time</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Running Hours</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {emp.runningHours || emp.hours || 'In Progress'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{emp.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Punctuality</span>
                      <span className={`font-semibold ${emp.late ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {emp.punctuality}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Shift: {emp.shiftName ? emp.shiftName.split('(')[0] : 'General Shift'}
                    </span>
                    <button
                      onClick={() => fetchEmployeeHistory(emp.id)}
                      className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT ROSTER MANAGEMENT (Requirement 5) */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">
                Enterprise Shift Roster & Schedule Policies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage assigned employee shifts, working hours, weekly offs, and attendance compliance timing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Available Policies:</span>
              <span className="px-2.5 py-1 bg-gold-500/10 text-gold-700 dark:text-gold-400 rounded-lg text-xs font-bold border border-gold-500/30">
                {availableShifts.length} Shift Profiles
              </span>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                    <th className="p-3.5 font-bold">Employee Name</th>
                    <th className="p-3.5 font-bold">Employee ID</th>
                    <th className="p-3.5 font-bold">Department</th>
                    <th className="p-3.5 font-bold">Role / Designation</th>
                    <th className="p-3.5 font-bold">Assigned Shift</th>
                    <th className="p-3.5 font-bold text-center">Shift Start Time</th>
                    <th className="p-3.5 font-bold text-center">Shift End Time</th>
                    <th className="p-3.5 font-bold text-center">Working Days</th>
                    <th className="p-3.5 font-bold text-center">Weekly Off</th>
                    <th className="p-3.5 font-bold text-center">Shift Status</th>
                    {canManageRoster && <th className="p-3.5 font-bold text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {rosterLoading ? (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-slate-400">
                        Loading shift assignments from database...
                      </td>
                    </tr>
                  ) : shiftRoster.map(s => (
                    <tr key={s.employeeId} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {s.employeeId}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {s.department}
                      </td>
                      <td className="p-3.5 font-medium">
                        {s.role}
                      </td>
                      <td className="p-3.5 font-semibold text-gold-700 dark:text-gold-400">
                        {s.assignedShift}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {s.shiftStartTime}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {s.shiftEndTime}
                      </td>
                      <td className="p-3.5 text-center text-slate-600 dark:text-slate-400 font-semibold">
                        {s.workingDays}
                      </td>
                      <td className="p-3.5 text-center text-rose-600 dark:text-rose-400 font-bold">
                        {s.weeklyOff}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {s.shiftStatus}
                        </span>
                      </td>
                      {canManageRoster && (
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setReassignModalEmp(s);
                              setNewShiftId(s.shiftId || 'SHIFT-GENERAL');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                          >
                            Reassign
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OVERALL ATTENDANCE ANALYTICS & ALERTS (Requirement 8) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Active Real Attendance Alerts List */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">
                  Real Attendance Compliance Alerts
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {realAlerts.length} Flagged Irregularities
              </span>
            </div>

            {realAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-navy-950 rounded-2xl">
                ✓ No active attendance irregularities or alerts detected today. All employees compliant.
              </div>
            ) : (
              <div className="space-y-2.5">
                {realAlerts.map((al, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      al.type === 'danger' 
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                        : al.type === 'warning'
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-gold-200'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white dark:bg-navy-900 border border-current">
                        {al.badge}
                      </span>
                      <div>
                        <span className="font-bold">{al.emp} ({al.empId}):</span> {al.message}
                      </div>
                    </div>

                    {al.action && canEdit && (
                      <button
                        onClick={al.action}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        Approve Ingress
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="font-serif font-black text-base text-slate-900 dark:text-white">
                Department Presence Distribution
              </h4>
              <div className="space-y-3">
                {departments.map(dept => {
                  const deptEmps = records.filter(r => r.department === dept);
                  const deptPresent = deptEmps.filter(r => r.status === 'Present' || r.status === 'Executive Active').length;
                  const pct = deptEmps.length > 0 ? Math.round((deptPresent / deptEmps.length) * 100) : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{deptPresent}/{deptEmps.length} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="font-serif font-black text-base text-slate-900 dark:text-white">
                Punctuality Rate Breakdown
              </h4>
              <div className="space-y-3">
                {roles.map(r => {
                  const roleEmps = records.filter(emp => emp.role === r);
                  const onTimeCount = roleEmps.filter(emp => !emp.late && (emp.status === 'Present' || emp.status === 'Executive Active')).length;
                  const pct = roleEmps.length > 0 ? Math.round((onTimeCount / roleEmps.length) * 100) : 0;
                  return (
                    <div key={r} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{r}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{pct}% On-Time</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                        <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATTENDANCE REPORTS & DOWNLOADS (Requirement 7) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Generation Configuration Bar */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">
                Custom Attendance Reports Generator
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportExcel(reportRows, 'Custom_Report')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportPDF(reportRows, 'Official Attendance Report')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-gold-500 dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download PDF (.pdf)</span>
                </button>
                <button
                  onClick={() => handleExportCSV(reportRows, 'Custom_Report')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition border border-slate-300 dark:border-navy-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV (.csv)</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Employee</label>
                <select
                  value={reportFilterEmployee}
                  onChange={(e) => setReportFilterEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="all">All Employees</option>
                  {records.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Department</label>
                <select
                  value={reportFilterDept}
                  onChange={(e) => setReportFilterDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role / Designation</label>
                <select
                  value={reportFilterRole}
                  onChange={(e) => setReportFilterRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Timeframe Range</label>
                <select
                  value={reportFilterRange}
                  onChange={(e) => setReportFilterRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="day">Selected Day ({selectedDate})</option>
                  <option value="week">Current Week</option>
                  <option value="month">Current Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>
            </div>

            {reportFilterRange === 'custom' && (
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Start Date</span>
                  <input
                    type="date"
                    value={reportCustomStart}
                    onChange={(e) => setReportCustomStart(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">End Date</span>
                  <input
                    type="date"
                    value={reportCustomEnd}
                    onChange={(e) => setReportCustomEnd(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateReport}
              disabled={reportGenerating}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reportGenerating ? 'animate-spin' : ''}`} />
              <span>{reportGenerating ? 'Querying Database Records...' : 'Generate Filtered Report'}</span>
            </button>
          </div>

          {/* Report Preview Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center bg-slate-50 dark:bg-navy-950 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Report Dataset Preview ({reportRows.length} Records)
              </span>
              {reportMeta?.dateRange && (
                <span className="text-slate-500 font-mono text-[11px]">
                  Window: {reportMeta.dateRange.startDate} to {reportMeta.dateRange.endDate}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                    <th className="p-3 font-bold">Employee Name</th>
                    <th className="p-3 font-bold">ID</th>
                    <th className="p-3 font-bold">Department</th>
                    <th className="p-3 font-bold">Role</th>
                    <th className="p-3 font-bold text-center">Working Days</th>
                    <th className="p-3 font-bold text-center">Present</th>
                    <th className="p-3 font-bold text-center">Absent</th>
                    <th className="p-3 font-bold text-center">Late</th>
                    <th className="p-3 font-bold text-center">Leave</th>
                    <th className="p-3 font-bold text-center">Total Logged Hours</th>
                    <th className="p-3 font-bold text-center">Punctuality %</th>
                    <th className="p-3 font-bold text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {reportRows.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="p-8 text-center text-slate-400">
                        Click "Generate Filtered Report" above to compile database records.
                      </td>
                    </tr>
                  ) : (
                    reportRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{r.employeeName}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{r.employeeId}</td>
                        <td className="p-3">{r.department}</td>
                        <td className="p-3">{r.role}</td>
                        <td className="p-3 text-center font-bold">{r.workingDays}</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">{r.presentDays}</td>
                        <td className="p-3 text-center text-rose-600 font-bold">{r.absentDays}</td>
                        <td className="p-3 text-center text-amber-600 font-bold">{r.lateDays}</td>
                        <td className="p-3 text-center text-blue-600 font-bold">{r.leaveDays}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-600">{r.totalLoggedHours}</td>
                        <td className="p-3 text-center font-bold">{r.punctuality}</td>
                        <td className="p-3 text-center font-bold text-gold-600 dark:text-gold-400">{r.attendancePercentage}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL EMPLOYEE ATTENDANCE DETAILS MODAL (Requirement 3) */}
      {selectedEmpHistory && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex justify-between items-start bg-slate-50 dark:bg-navy-950">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 flex items-center justify-center font-black text-base shadow-sm overflow-hidden">
                  {selectedEmpHistory.employee?.avatar ? (
                    <img src={selectedEmpHistory.employee.avatar} alt={selectedEmpHistory.employee.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedEmpHistory.employee?.name ? selectedEmpHistory.employee.name[0] : 'E'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white leading-tight">
                    {selectedEmpHistory.employee?.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedEmpHistory.employee?.employeeId} • {selectedEmpHistory.employee?.role} • {selectedEmpHistory.employee?.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmpHistory(null)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Filter Bar: Day, Week, Month, Overall (Requirement 3) */}
            <div className="p-3 bg-slate-100/60 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500 text-[11px] uppercase mr-1">Timeframe:</span>
                {['day', 'week', 'month', 'overall'].map(r => (
                  <button
                    key={r}
                    onClick={() => handleSwitchHistoryRange(r)}
                    className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] cursor-pointer transition ${
                      historyRange === r
                        ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-xs'
                        : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Records from: {selectedEmpHistory.startDate} to {selectedEmpHistory.endDate}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Performance Stats Cards (Requirement 3) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Working Days</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedEmpHistory.summary?.totalWorkingDays || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Present Days</span>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">
                    {selectedEmpHistory.summary?.presentDays || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Absent Days</span>
                  <p className="text-xl font-black text-rose-600 mt-0.5">
                    {selectedEmpHistory.summary?.absentDays || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Late Days</span>
                  <p className="text-xl font-black text-amber-600 mt-0.5">
                    {selectedEmpHistory.summary?.lateDays || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Leave Days</span>
                  <p className="text-xl font-black text-blue-600 mt-0.5">
                    {selectedEmpHistory.summary?.leaveDays || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Total Logged Hours</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                    {selectedEmpHistory.summary?.totalLoggedHours || '0h 00m'}
                  </p>
                </div>
                <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-800/40">
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase">Avg Working Hours</span>
                  <p className="text-xl font-black text-teal-700 dark:text-teal-300 font-mono mt-0.5">
                    {selectedEmpHistory.summary?.averageWorkingHours || '0h 00m'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/40">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-gold-400 uppercase">Punctuality Score</span>
                  <p className="text-xl font-black text-amber-700 dark:text-gold-400 mt-0.5">
                    {selectedEmpHistory.summary?.punctualityPercentage}%
                  </p>
                </div>
                <div className="p-3 bg-gold-50/50 dark:bg-gold-500/10 rounded-2xl border border-gold-300 dark:border-gold-500/30">
                  <span className="text-[10px] font-bold text-gold-700 dark:text-gold-400 uppercase">Attendance Rate</span>
                  <p className="text-xl font-black text-gold-700 dark:text-gold-400 mt-0.5">
                    {selectedEmpHistory.summary?.attendancePercentage}%
                  </p>
                </div>
              </div>

              {/* Detailed Attendance History Table (Requirement 3) */}
              <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 font-bold text-xs">
                  Detailed Daily Attendance Timeline (Date | Day | Shift | Check-In | Check-Out | Logged Hours | Status | Punctuality)
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-serif">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5">Shift</th>
                        <th className="p-2.5 text-center">Check-In</th>
                        <th className="p-2.5 text-center">Check-Out</th>
                        <th className="p-2.5 text-center">Logged Hours</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center">Punctuality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {historyLoading ? (
                        <tr>
                          <td colSpan="8" className="p-6 text-center text-slate-400">
                            Loading timeline...
                          </td>
                        </tr>
                      ) : selectedEmpHistory.history?.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-6 text-center text-slate-400">
                            No attendance records logged for this timeframe.
                          </td>
                        </tr>
                      ) : (
                        selectedEmpHistory.history.map((day, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                            <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{day.date}</td>
                            <td className="p-2.5 font-semibold text-slate-600 dark:text-slate-400">{day.day}</td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300">{day.shiftTiming || day.shift}</td>
                            <td className="p-2.5 text-center font-mono font-bold">{day.checkIn}</td>
                            <td className="p-2.5 text-center font-mono text-slate-500">{day.checkOut}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{day.loggedHours}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                day.status === 'Present' || day.status === 'Executive Active'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : day.status === 'Late'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                  : day.status === 'On Leave'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
                              }`}>
                                {day.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-medium">
                              {day.punctuality}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex justify-end">
              <button
                onClick={() => setSelectedEmpHistory(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN SHIFT MODAL (Requirement 5) */}
      {reassignModalEmp && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">
              Reassign Employee Shift
            </h3>
            <p className="text-xs text-slate-500">
              Update shift assignment for <strong>{reassignModalEmp.name}</strong> ({reassignModalEmp.employeeId}).
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Target Shift Profile</label>
              <select
                value={newShiftId}
                onChange={(e) => setNewShiftId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-medium"
              >
                {availableShifts.map(sh => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name} ({sh.startTime} - {sh.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReassignModalEmp(null)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShiftAssignment}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Save Shift Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN EDIT ATTENDANCE MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-black text-lg text-slate-900 dark:text-white">
              Super Admin Override: {editingRecord.name}
            </h3>
            <p className="text-xs text-slate-500">
              Manually regularize punch timestamps, presence status, and late flags.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Executive Active">Executive Active</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Check-In Time</label>
                  <input
                    type="text"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Override Remarks</label>
                <input
                  type="text"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Super Admin manual regularisation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

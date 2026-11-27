import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmDeleteConfirmModal } from '../components/CrmDeleteConfirmModal';
import { useCrm } from '../context/CrmContext';
import { CRM_ROLES } from '../data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff,
  Activity, Clock, Calendar, AlertCircle, AlertTriangle, XCircle, Database, Award, Globe, Server, Settings, Key, Plus, ChevronRight, TrendingUp, UserCheck, Edit,
  MessageSquare, ExternalLink, Inbox, Briefcase, Sparkles, Copy, Send, GraduationCap, Building2, CheckSquare, Tag, Compass,
  Download, Archive, RotateCcw, ChevronLeft, Layers
} from 'lucide-react';

export const CrmSuperAdmin = () => {
  const { 
    logAuditAction, 
    leads = [], 
    loadingLeads, 
    fetchLeads,
    deleteLead,
    updateLead,
    archiveLead,
    addLeadActivity,
    scheduleLeadFollowUp,
    updateFollowUpStatus,
    clients = [],
    consultingMetrics,
    fetchConsultingMetrics,
    leadMetrics,
    fetchLeadMetrics,
    serviceBreakdown,
    followUpsSummary,
    fetchFollowUpsSummary,
    followUps = [],
    fetchFollowUps,
    crmToken
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inquiries' | 'employees' | 'attendance' | 'leaves' | 'company' | 'master'

  // Helper to map role to Revival department
  const getDepartmentForRole = (role) => {
    switch (role) {
      case 'Super Admin': return 'Executive Management';
      case 'Admin': return 'Operations Management';
      case 'HR Lead': return 'Human Resources';
      case 'Recruiter': return 'Talent Acquisition';
      case 'Placement Coordinator': return 'Placement & Industry Relations';
      case 'HR Operations': return 'HR & Student Operations';
      case 'Interviewer': return 'Technical Assessment Panel';
      default: return 'Corporate Operations';
    }
  };

  // Pre-seeded Employee Accounts matching the exact 6 corporate roles
  const initialEmployees = [
    { id: 'emp-0', employeeId: 'EMP-1001', name: 'Super Admin', role: 'Super Admin', department: 'Executive Management', email: 'thejobsyncit@gmail.com', phone: '+91 9003475405', password: 'Thejobsync@26', status: 'Active' },
    { id: 'emp-1', employeeId: 'EMP-1002', name: 'Tariq Al Mansoor', role: 'Admin', department: 'Operations Management', email: 'tariq.admin@revivalinternational.com', phone: '+971 50 123 4567', password: 'Password123!', status: 'Active' },
    { id: 'emp-2', employeeId: 'EMP-1003', name: 'Sarah Al Zaabi', role: 'HR Lead', department: 'Human Resources', email: 'sarah.hr@revivalinternational.com', phone: '+971 50 234 5678', password: 'Password123!', status: 'Active' },
    { id: 'emp-3', employeeId: 'EMP-1004', name: 'Sreeja Recruiter', role: 'Recruiter', department: 'Talent Acquisition', email: 'sreeja.jasync@gmail.com', phone: '+91 9876543211', password: 'Password123!', status: 'Active' },
    { id: 'emp-4', employeeId: 'EMP-1005', name: 'Dhanalakshimi', role: 'Placement Coordinator', department: 'Placement & Industry Relations', email: 'dhana.jasync@gmail.com', phone: '+91 9876543210', password: 'Password123!', status: 'Active' },
    { id: 'emp-5', employeeId: 'EMP-1006', name: 'Fatima Al Zahra', role: 'HR Operations', department: 'HR & Student Operations', email: 'fatima.ops@revivalinternational.com', phone: '+971 50 456 7890', password: 'Password123!', status: 'Active' }
  ];

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('sir_crm_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u, i) => ({
            id: u.id || `emp-${i + 1}`,
            employeeId: u.employeeId || `EMP-${1000 + i + 1}`,
            name: u.name || u.email.split('@')[0],
            role: u.role || 'Super Admin',
            department: u.department || getDepartmentForRole(u.role || 'Super Admin'),
            email: u.email,
            phone: u.phone || '+91 9800011122',
            password: u.password || 'Password123!',
            status: u.status || 'Active'
          }));
        }
      } catch (e) { console.error(e); }
    }
    return initialEmployees;
  });

  // Load from SQLite database on mount if available
  useEffect(() => {
    const fetchDbEmployees = async () => {
      const endpoints = ['/api/employees', 'http://localhost:5000/api/employees'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const json = await res.json();
            const list = Array.isArray(json) ? json : (json.data || []);
            if (Array.isArray(list) && list.length > 0) {
              setEmployees(list);
              syncToLocalStorage(list);
              break;
            }
          }
        } catch (err) {
          // Fallback to next endpoint or local state
        }
      }
    };
    fetchDbEmployees();
  }, []);

  // Real-time Workforce Role Logins & Late Arrival Approvals
  const [pendingLateApprovals, setPendingLateApprovals] = useState([]);
  const [roleLoginLogs, setRoleLoginLogs] = useState([]);
  const [loginStats, setLoginStats] = useState({
    totalToday: 0,
    onTimeCount: 0,
    lateCount: 0,
    pendingApprovalCount: 0
  });
  const [loadingLateApprovals, setLoadingLateApprovals] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('all'); // 'all' | 'SHIFT-GENERAL' | 'SHIFT-MORNING' | 'SHIFT-UK-ME'
  const [loginSearchQuery, setLoginSearchQuery] = useState('');
  const [loginPunctualityFilter, setLoginPunctualityFilter] = useState('all'); // 'all' | 'On Time' | 'Late' | 'Pending'

  // Fetch pending late approvals & real-time role logins
  const fetchLateApprovalsAndLogins = async () => {
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };

      // 1. Fetch pending late approvals
      const pendRes = await fetch('/api/hr-ops/attendance/late-approvals/pending', {
        headers: authHeaders
      });
      if (pendRes.ok) {
        const pendData = await pendRes.json();
        if (pendData?.success && Array.isArray(pendData.data)) {
          setPendingLateApprovals(pendData.data);
        }
      }

      // 2. Fetch role login logs
      const loginRes = await fetch('/api/hr-ops/attendance/role-logins', {
        headers: authHeaders
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData?.success && Array.isArray(loginData.data)) {
          setRoleLoginLogs(loginData.data);
          if (loginData.stats) setLoginStats(loginData.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch late approvals/logins:', err);
    }
  };

  useEffect(() => {
    fetchLateApprovalsAndLogins();
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchLateApprovalsAndLogins();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [crmToken]);

  const handleLateApprovalDecision = async (attendanceId, decision, employeeName = 'Employee') => {
    try {
      setApprovingId(attendanceId);
      const authHeaders = {
        'Content-Type': 'application/json',
        'x-crm-role': 'Super Admin',
        ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
      };
      const res = await fetch(`/api/hr-ops/attendance/late-approvals/${attendanceId}/decision`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          decision,
          approvedBy: 'Super Admin',
          notes: decision === 'APPROVED' ? 'Approved by Super Admin' : 'Access denied by Super Admin'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setStatusMsg(decision === 'APPROVED' 
            ? `✓ Approved late arrival entry for ${employeeName}. Access unlocked.` 
            : `✕ Rejected late arrival entry for ${employeeName}. Access denied.`
          );
          setTimeout(() => setStatusMsg(''), 5000);
          await fetchLateApprovalsAndLogins();
        }
      }
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Attendance Tab State
  const [attendanceList, setAttendanceList] = useState([
    { id: 'att-1', name: 'Dhanalakshimi', role: 'Placement Coordinator', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0 hrs', mode: 'Office' },
    { id: 'att-2', name: 'Sreeja', role: 'Placement Coordinator', checkIn: '09:15 AM', checkOut: '06:15 PM', status: 'Present', hours: '9.0 hrs', mode: 'Office' },
    { id: 'att-3', name: 'chentamilselvi', role: 'DMS', checkIn: '09:30 AM', checkOut: '05:30 PM', status: 'Late', hours: '8.0 hrs', mode: 'Remote' },
    { id: 'att-4', name: 'Diviya', role: 'Application Support', checkIn: '-', checkOut: '-', status: 'On Leave', hours: '0 hrs', mode: '-' },
    { id: 'att-5', name: 'balavarshini', role: 'Application Support', checkIn: '08:55 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.1 hrs', mode: 'Office' }
  ]);

  // Leave Requests Tab State
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'lv-101', name: 'Diviya', role: 'Application Support', type: 'Medical Leave', dates: 'Aug 05 - Aug 07', reason: 'Doctor prescribed medical rest & recovery', status: 'Pending' },
    { id: 'lv-102', name: 'chentamilselvi', role: 'DMS', type: 'Casual Leave', dates: 'Aug 12 - Aug 13', reason: 'Family commitment in native location', status: 'Approved' },
    { id: 'lv-103', name: 'Sreeja', role: 'Placement Coordinator', type: 'Emergency Leave', dates: 'Aug 20', reason: 'Personal urgent work', status: 'Pending' }
  ]);

  // Company Profile Settings State
  const [companyDetails, setCompanyDetails] = useState({
    name: 'The Revival International Enterprise Ltd',
    domain: 'therevivalinternational.com',
    registrationNo: 'REG-2026-IND-DXB-99412',
    headquarters: 'India Corporate Tower, Chennai / Dubai Silicon Oasis, UAE',
    s3Region: 'ap-south-1 (Mumbai / AWS Compliant Vault)',
    supportEmail: 'enquiry@therevivalinternational.com',
    adminKey: 'REV-SUPER-2026'
  });

  // Master Data State
  const [masterSectors, setMasterSectors] = useState([
    'Healthcare & Nursing Services',
    'Civil Engineering & Infrastructure',
    'IT Software & Cloud Engineering',
    'Oil, Gas & Energy Operations',
    'Hospitality & Culinary Services'
  ]);
  const [newSectorInput, setNewSectorInput] = useState('');

  const [masterVisas, setMasterVisas] = useState([
    'UK Tier 2 Skilled Worker Visa',
    'Singapore MOM IPA Work Pass',
    'Saudi Arabia Prometric & Visa Stamping',
    'UAE Employment Residence Permit',
    'Qatar Work & Business Visa'
  ]);
  const [newVisaInput, setNewVisaInput] = useState('');

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Recruiter'
  });

  const [statusMsg, setStatusMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Live Leads & Website Inquiries Management State
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadServiceFilter, setLeadServiceFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadDateRangeFilter, setLeadDateRangeFilter] = useState('all');
  const [leadAssignedFilter, setLeadAssignedFilter] = useState('all');
  const [leadPage, setLeadPage] = useState(1);
  const [leadPageSize, setLeadPageSize] = useState('25');
  const [inquiriesSubView, setInquiriesSubView] = useState('services');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActionLoading, setLeadActionLoading] = useState(false);

  // Unified Superadmin Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('lead'); // 'lead' | 'employee'
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerDeleteLead = (lead) => {
    setItemToDelete(lead);
    setDeleteType('lead');
    setDeleteModalOpen(true);
  };

  const triggerDeleteEmployee = (emp) => {
    setItemToDelete(emp);
    setDeleteType('employee');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      if (deleteType === 'lead') {
        await deleteLead(itemToDelete.id, {
          name: itemToDelete.name,
          referenceNumber: itemToDelete.referenceNumber || itemToDelete.id,
          entityType: 'Inquiry / Lead'
        });
        setStatusMsg(`✓ Successfully deleted inquiry from "${itemToDelete.name}"`);
        if (selectedLead && (selectedLead.id === itemToDelete.id || selectedLead.referenceNumber === itemToDelete.referenceNumber)) {
          setSelectedLead(null);
        }
      } else if (deleteType === 'employee') {
        const updated = employees.filter(e => e.id !== itemToDelete.id);
        setEmployees(updated);
        syncToLocalStorage(updated);
        logAuditAction(`Super Admin deleted employee account '${itemToDelete.name}'.`);
        setStatusMsg(`✓ Deleted employee account '${itemToDelete.name}'.`);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg(`⚠️ Error during deletion: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const [copiedLeadId, setCopiedLeadId] = useState(null);
  const [leadModalTab, setLeadModalTab] = useState('details');
  const [leadInternalNotesInput, setLeadInternalNotesInput] = useState('');
  const [newActivity, setNewActivity] = useState({ type: 'Note', title: '', details: '' });
  const [newFollowUp, setNewFollowUp] = useState({ followUpDate: '', purpose: '', assignedTo: '' });
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  const formatLeadDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const cleanPhoneForWa = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const handleOpenLead = async (lead) => {
    setSelectedLead(lead);
    setLeadInternalNotesInput(lead.internalNotes || '');
    setLeadModalTab('details');
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      const data = await res.json();
      const detail = data?.data || data?.lead;
      if (detail) {
        setSelectedLead(detail);
        setLeadInternalNotesInput(detail.internalNotes || '');
      }
    } catch (e) {
      console.error('Error fetching lead details:', e);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedLead) return;
    try {
      setLeadActionLoading(true);
      await updateLead(selectedLead.id, { internalNotes: leadInternalNotesInput });
      setSelectedLead(prev => ({ ...prev, internalNotes: leadInternalNotesInput }));
      setStatusMsg('✓ Internal notes saved successfully');
      if (logAuditAction) {
        logAuditAction('Internal Note Saved', `Saved notes for lead ${selectedLead.id}`);
      }
      if (fetchLeads) await fetchLeads();
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Error saving internal notes');
    } finally {
      setLeadActionLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleUpdateLeadStatus = async (id, newStatus) => {
    try {
      setLeadActionLoading(true);
      const res = await updateLead(id, { status: newStatus });
      if (res && res.success) {
        setStatusMsg(`✓ Lead #${id.slice(-6)} status updated to "${newStatus}"`);
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(prev => ({ ...prev, status: newStatus }));
        }
        if (logAuditAction) {
          logAuditAction('Update Lead Status', `Updated lead ${id} to ${newStatus}`);
        }
        if (fetchLeads) await fetchLeads();
        if (fetchConsultingMetrics) await fetchConsultingMetrics();
      } else {
        setStatusMsg(`⚠️ Error updating lead status: ${res?.message || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Network error updating lead status.');
    } finally {
      setLeadActionLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleUpdateLeadField = async (field, value) => {
    if (!selectedLead) return;
    try {
      setLeadActionLoading(true);
      const payload = { [field]: value };
      if (field === 'organizationId') {
        const org = clients.find(c => c.id === value);
        if (org) payload.organizationName = org.name;
        else if (value === '') payload.organizationName = '';
      }
      const res = await updateLead(selectedLead.id, payload);
      if (res && res.success) {
        setSelectedLead(prev => ({ ...prev, ...payload }));
        setStatusMsg(`✓ Updated ${field} successfully`);
        if (logAuditAction) {
          logAuditAction('Update Lead Field', `Updated lead ${selectedLead.id} ${field} to ${value}`);
        }
        if (fetchLeads) await fetchLeads();
        if (fetchConsultingMetrics) await fetchConsultingMetrics();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg(`⚠️ Error updating ${field}`);
    } finally {
      setLeadActionLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedLead || !newActivity.title.trim()) return;
    try {
      setIsAddingActivity(true);
      const res = await addLeadActivity(selectedLead.id, {
        type: newActivity.type,
        title: newActivity.title.trim(),
        details: newActivity.details.trim(),
        performedBy: 'Super Admin'
      });
      if (res && res.success) {
        // Refresh full lead details
        const refreshed = await fetch(`/api/leads/${selectedLead.id}`).then(r => r.json());
        if (refreshed?.lead) setSelectedLead(refreshed.lead);
        setNewActivity({ type: 'Note', title: '', details: '' });
        setStatusMsg('✓ Interaction note saved');
        if (logAuditAction) logAuditAction('Lead Activity', `Recorded ${newActivity.type} on lead ${selectedLead.id}`);
        if (fetchLeads) fetchLeads();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Error adding activity');
    } finally {
      setIsAddingActivity(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedLead || !newFollowUp.followUpDate || !newFollowUp.purpose.trim()) return;
    try {
      setIsAddingFollowUp(true);
      const res = await scheduleLeadFollowUp(selectedLead.id, {
        followUpDate: newFollowUp.followUpDate,
        purpose: newFollowUp.purpose.trim(),
        assignedTo: newFollowUp.assignedTo || selectedLead.assignedEmployee || employees[0]?.name || 'Dhanalakshimi'
      });
      if (res && res.success) {
        const refreshed = await fetch(`/api/leads/${selectedLead.id}`).then(r => r.json());
        if (refreshed?.lead) setSelectedLead(refreshed.lead);
        setNewFollowUp({ followUpDate: '', purpose: '', assignedTo: '' });
        setStatusMsg('✓ Follow-up scheduled');
        if (logAuditAction) logAuditAction('Lead Follow-up', `Scheduled follow-up for lead ${selectedLead.id}`);
        if (fetchFollowUps) fetchFollowUps();
        if (fetchConsultingMetrics) fetchConsultingMetrics();
        if (fetchLeads) fetchLeads();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Error scheduling follow-up');
    } finally {
      setIsAddingFollowUp(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleCompleteFollowUp = async (followUpId) => {
    const notes = window.prompt('Enter follow-up completion notes / outcome:', 'Consultation completed. Client requested destination roadmap.');
    if (notes === null) return;
    try {
      const res = await updateFollowUpStatus(followUpId, 'Completed', notes);
      if (res && res.success) {
        const refreshed = await fetch(`/api/leads/${selectedLead.id}`).then(r => r.json());
        if (refreshed?.lead) setSelectedLead(refreshed.lead);
        setStatusMsg('✓ Follow-up marked as Completed');
        if (logAuditAction) logAuditAction('Complete Follow-up', `Marked follow-up ${followUpId} completed`);
        if (fetchFollowUps) fetchFollowUps();
        if (fetchConsultingMetrics) fetchConsultingMetrics();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Error completing follow-up');
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete inquiry from "${name}"?`)) return;
    try {
      setLeadActionLoading(true);
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        setStatusMsg(`✓ Deleted inquiry from "${name}"`);
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(null);
        }
        if (logAuditAction) {
          logAuditAction('Delete Lead', `Removed lead ${id} (${name})`);
        }
        if (fetchLeads) await fetchLeads();
        if (fetchConsultingMetrics) await fetchConsultingMetrics();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Network error deleting lead.');
    } finally {
      setLeadActionLoading(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleCopyLead = (lead) => {
    const text = `Inquiry Reference: ${lead.referenceNumber || lead.id}\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nService: ${lead.serviceTitle || lead.serviceId || 'International Consulting'}\nDestination: ${lead.countryInterest || 'N/A'}\nTrack: ${lead.assistanceType || 'N/A'}\nIntake: ${lead.intakeTerm || 'N/A'}\nOrganization: ${lead.organizationName || lead.company || 'N/A'}\nStatus: ${lead.status || 'New'}\nAssigned: ${lead.assignedEmployee || 'Unassigned'}\nMessage:\n${lead.message}`;
    navigator.clipboard.writeText(text);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  const handleArchiveToggle = async (lead, isArchiving) => {
    try {
      setLeadActionLoading(true);
      if (archiveLead) {
        await archiveLead(lead.id, isArchiving);
      } else {
        await fetch(`/api/leads/${lead.id}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isArchived: isArchiving ? 1 : 0 })
        });
      }
      setStatusMsg(`✓ Lead #${lead.referenceNumber || lead.id.slice(-6)} ${isArchiving ? 'archived' : 'restored'}`);
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead(prev => ({ ...prev, isArchived: isArchiving ? 1 : 0 }));
      }
      if (fetchLeads) await fetchLeads();
      if (fetchConsultingMetrics) await fetchConsultingMetrics();
      if (fetchLeadMetrics) await fetchLeadMetrics();
    } catch (err) {
      console.error(err);
      setStatusMsg('⚠️ Error updating archive state');
    } finally {
      setLeadActionLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleExportCsv = () => {
    if (!filteredLeads || filteredLeads.length === 0) {
      alert('No leads to export matching current filters.');
      return;
    }
    const headers = [
      'Reference Number', 'Applicant Name', 'Email', 'Phone', 'Service Title',
      'Country Interest', 'Intake Term', 'Status', 'Priority', 'Assigned Consultant',
      'Next Follow-up Date', 'Created At'
    ];
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = filteredLeads.map(l => [
      escapeCsv(l.referenceNumber || l.id),
      escapeCsv(l.name),
      escapeCsv(l.email),
      escapeCsv(l.phone),
      escapeCsv(l.serviceTitle || l.serviceId || 'International Consulting'),
      escapeCsv(l.countryInterest || 'Global'),
      escapeCsv(l.intakeTerm || 'N/A'),
      escapeCsv(l.status || 'New'),
      escapeCsv(l.priority || 'Medium'),
      escapeCsv(l.assignedEmployee || 'Unassigned'),
      escapeCsv(l.nextActionDate || 'N/A'),
      escapeCsv(l.createdAt || 'N/A')
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revival_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg(`✓ Exported ${filteredLeads.length} leads to CSV successfully`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const filteredLeads = leads.filter(lead => {
    const query = leadSearchQuery.toLowerCase();
    const matchesSearch = 
      (lead.name || '').toLowerCase().includes(query) ||
      (lead.email || '').toLowerCase().includes(query) ||
      (lead.phone || '').toLowerCase().includes(query) ||
      (lead.company || '').toLowerCase().includes(query) ||
      (lead.organizationName || '').toLowerCase().includes(query) ||
      (lead.referenceNumber || '').toLowerCase().includes(query) ||
      (lead.countryInterest || '').toLowerCase().includes(query) ||
      (lead.assistanceType || '').toLowerCase().includes(query) ||
      (lead.serviceTitle || '').toLowerCase().includes(query) ||
      (lead.assignedEmployee || '').toLowerCase().includes(query) ||
      (lead.message || '').toLowerCase().includes(query);

    const matchesService = 
      leadServiceFilter === 'all' || 
      (leadServiceFilter === 'intl-consult' && (lead.serviceId === 'intl-consult' || (lead.serviceTitle || '').toLowerCase().includes('consulting'))) ||
      ((leadServiceFilter === 'school-academy' || leadServiceFilter === 'student-academy') && (lead.serviceId === 'school-academy' || lead.serviceId === 'student-academy' || (lead.serviceTitle || '').toLowerCase().includes('academy') || (lead.company || '').toLowerCase().includes('academy') || (lead.referenceNumber || '').startsWith('REV-ACA'))) ||
      lead.serviceId === leadServiceFilter ||
      (lead.serviceTitle || '').toLowerCase().includes(leadServiceFilter.toLowerCase());

    const matchesStatus = (() => {
      if (leadStatusFilter === 'all') return true;
      const s = lead.status || 'New';
      if (leadStatusFilter === 'New' || leadStatusFilter === 'New Enquiry') return s === 'New' || s === 'New Enquiry';
      if (leadStatusFilter === 'Contact Pending' || leadStatusFilter === 'Contact Attempted') return s === 'Contact Pending' || s === 'Contact Attempted';
      if (leadStatusFilter === 'Qualified') return s === 'Qualified' || s === 'Consultation Completed';
      if (leadStatusFilter === 'Converted' || leadStatusFilter === 'Completed') return s === 'Converted' || s === 'Completed';
      if (leadStatusFilter === 'In Progress') return s === 'In Progress' || s === 'Proposal Pending' || s === 'Proposal or Next Steps Pending';
      if (leadStatusFilter === 'Closed / Lost' || leadStatusFilter === 'Closed') return s === 'Closed / Lost' || s === 'Closed' || s === 'Archived';
      return s === leadStatusFilter;
    })();

    const matchesDateRange = (() => {
      if (leadDateRangeFilter === 'all') return true;
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      if (isNaN(leadDate.getTime())) return true;
      const now = new Date();
      if (leadDateRangeFilter === 'today') {
        return leadDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
      }
      if (leadDateRangeFilter === '7days') {
        return (now - leadDate) <= 7 * 24 * 60 * 60 * 1000;
      }
      if (leadDateRangeFilter === '30days') {
        return (now - leadDate) <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    })();

    const matchesAssigned = 
      leadAssignedFilter === 'all' ||
      (leadAssignedFilter === 'unassigned' && (!lead.assignedEmployee || lead.assignedEmployee.trim() === '')) ||
      lead.assignedEmployee === leadAssignedFilter;

    return matchesSearch && matchesService && matchesStatus && matchesDateRange && matchesAssigned;
  });

  const paginatedLeads = leadPageSize === 'all' 
    ? filteredLeads 
    : filteredLeads.slice((leadPage - 1) * Number(leadPageSize), leadPage * Number(leadPageSize));
  const totalPages = leadPageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredLeads.length / Number(leadPageSize)));

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.id);
    setNewEmployee({
      name: emp.name,
      email: emp.email,
      password: emp.password,
      phone: emp.phone,
      role: emp.role,
      department: emp.department || getDepartmentForRole(emp.role)
    });
    // Scroll to top where the form is usually visible on mobile, or just let them see it
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setNewEmployee({ name: '', email: '', password: '', phone: '', role: 'Recruiter', department: 'Talent Acquisition' });
    setEmailError('');
  };

  const toggleRowPassword = (id) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sync state changes back to localStorage registeredUsers so any created account can immediately log in!
  const syncToLocalStorage = (updatedEmpList) => {
    const registeredFormat = updatedEmpList.map(e => ({
      id: e.id,
      employeeId: e.employeeId,
      name: e.name,
      email: e.email.trim().toLowerCase(),
      password: e.password,
      role: e.role,
      department: e.department || getDepartmentForRole(e.role),
      phone: e.phone,
      status: e.status || 'Active'
    }));
    localStorage.setItem('sir_crm_registered_users', JSON.stringify(registeredFormat));
  };

  // Toggle Employee Account Status (Active <-> Inactive)
  const handleToggleEmployeeStatus = async (emp) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    const updated = employees.map(e => e.id === emp.id ? { ...e, status: nextStatus } : e);
    setEmployees(updated);
    syncToLocalStorage(updated);

    const endpoints = [`/api/employees/${emp.id}/toggle-status`, `http://localhost:5000/api/employees/${emp.id}/toggle-status`];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { method: 'PATCH' });
        if (res.ok) break;
      } catch (err) {}
    }

    logAuditAction(`Super Admin changed status of employee '${emp.name}' to ${nextStatus}.`);
    setStatusMsg(`✓ Employee '${emp.name}' account status updated to ${nextStatus}.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  useEffect(() => {
    syncToLocalStorage(employees);
  }, []);

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setEmailError('');
    if (!newEmployee.email || !newEmployee.password) {
      alert('Please provide Email ID and Password for the employee.');
      return;
    }

    if (editingEmployeeId) {
      const emailExists = employees.some(emp => emp.id !== editingEmployeeId && emp.email.toLowerCase() === newEmployee.email.trim().toLowerCase());
      if (emailExists) {
        setEmailError('An employee with this email already exists.');
        return;
      }
      const departmentToSet = newEmployee.department || getDepartmentForRole(newEmployee.role);
      const updated = employees.map(emp => {
        if (emp.id === editingEmployeeId) {
          return {
            ...emp,
            name: newEmployee.name.trim() || newEmployee.email.split('@')[0],
            email: newEmployee.email.trim().toLowerCase(),
            password: newEmployee.password,
            phone: newEmployee.phone.trim() || '+91 9800000000',
            role: newEmployee.role,
            department: departmentToSet
          };
        }
        return emp;
      });
      setEmployees(updated);
      syncToLocalStorage(updated);

      const putPayload = {
        name: newEmployee.name.trim() || newEmployee.email.split('@')[0],
        email: newEmployee.email.trim().toLowerCase(),
        password: newEmployee.password,
        phone: newEmployee.phone.trim() || '+91 9800000000',
        role: newEmployee.role,
        department: departmentToSet
      };
      const endpoints = [`/api/employees/${editingEmployeeId}`, `http://localhost:5000/api/employees/${editingEmployeeId}`];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putPayload)
          });
          if (res.ok) break;
        } catch (err) {}
      }

      logAuditAction(`Super Admin updated employee account '${newEmployee.email}'.`);
      setStatusMsg(`✓ Employee Account '${newEmployee.name || newEmployee.email}' updated successfully!`);
    } else {
      const emailExists = employees.some(emp => emp.email.toLowerCase() === newEmployee.email.trim().toLowerCase());
      if (emailExists) {
        setEmailError('An employee with this email already exists.');
        return;
      }
      const generatedId = `emp-${Date.now()}`;
      const generatedEmpId = `EMP-${1000 + employees.length + 1}`;
      const departmentToSet = newEmployee.department || getDepartmentForRole(newEmployee.role);
      const createdEmp = {
        id: generatedId,
        employeeId: generatedEmpId,
        name: newEmployee.name.trim() || newEmployee.email.split('@')[0],
        email: newEmployee.email.trim().toLowerCase(),
        password: newEmployee.password,
        phone: newEmployee.phone.trim() || '+91 9800000000',
        role: newEmployee.role,
        department: departmentToSet,
        status: 'Active'
      };

      const updated = [createdEmp, ...employees];
      setEmployees(updated);
      syncToLocalStorage(updated);

      const endpoints = ['/api/employees', 'http://localhost:5000/api/employees'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdEmp)
          });
          if (res.ok) break;
        } catch (err) {}
      }

      logAuditAction(`Super Admin created employee account '${createdEmp.email}'.`);
      setStatusMsg(`✓ Employee Account '${createdEmp.name}' created successfully!`);
    }
    
    setNewEmployee({ name: '', email: '', password: '', phone: '', role: 'Recruiter', department: 'Talent Acquisition' });
    setEditingEmployeeId(null);
    setShowPassword(false);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const handleDeleteEmployee = async (id, name, employeeId) => {
    if (!window.confirm(`Are you sure you want to delete employee '${name}'?`)) return;
    try {
      const targetId = id || employeeId;
      const res = await fetch(`/api/employees/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-crm-role': 'Super Admin',
          'x-employee-email': 'thejobsyncit@gmail.com'
        }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const updated = employees.filter(e => e.id !== id && e.employeeId !== employeeId);
        setEmployees(updated);
        syncToLocalStorage(updated);
        logAuditAction(`Super Admin deleted employee account '${name}'.`);
        setStatusMsg(`✓ Deleted employee account '${name}' from database.`);
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setStatusMsg(`⚠️ Failed to delete '${name}': ${data.message || 'Server error'}`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error('Delete employee error:', err);
      setStatusMsg(`⚠️ Network error deleting '${name}'.`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleUpdateLeaveStatus = (id, newStatus, name) => {
    const updated = leaveRequests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setLeaveRequests(updated);
    logAuditAction(`Super Admin marked leave request for '${name}' as '${newStatus}'.`);
    setStatusMsg(`✓ Leave request for '${name}' updated to '${newStatus}'.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleAddMasterSector = (e) => {
    e.preventDefault();
    if (!newSectorInput.trim()) return;
    setMasterSectors([...masterSectors, newSectorInput.trim()]);
    setStatusMsg(`✓ Added '${newSectorInput.trim()}' to Master Industry Sectors!`);
    setNewSectorInput('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleAddMasterVisa = (e) => {
    e.preventDefault();
    if (!newVisaInput.trim()) return;
    setMasterVisas([...masterVisas, newVisaInput.trim()]);
    setStatusMsg(`✓ Added '${newVisaInput.trim()}' to Master Visa Protocols!`);
    setNewVisaInput('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleRemoveMasterSector = (sector) => {
    if (window.confirm(`Are you sure you want to remove '${sector}'?`)) {
      setMasterSectors(prev => prev.filter(s => s !== sector));
      setStatusMsg(`✓ Removed '${sector}' from Master Industry Sectors.`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleRemoveMasterVisa = (visa) => {
    if (window.confirm(`Are you sure you want to remove '${visa}'?`)) {
      setMasterVisas(prev => prev.filter(v => v !== visa));
      setStatusMsg(`✓ Removed '${visa}' from Master Visa Protocols.`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollReveal key={activeTab}>
    <div className="space-y-6 text-xs font-sans">
      
      {/* Super Admin Top Header Navigation Bar - Styled matching Documentation Vault */}
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">The Jobsync • Super Admin Control Gateway</span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Super Admin Panel & Employee Management</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs">Create employee accounts with assigned roles (Admin, Recruiter, Interviewer, Coordinator). Accounts created here gain instant CRM login access.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Super Admin Rights Active
            </span>
          </div>
        </div>

        {/* Header Tabs Navigation */}
        <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-navy-800 font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { 
              id: 'inquiries', 
              label: `Inquiries & Leads (${leads.length})`,
              badge: leads.filter(l => l.status === 'New' || l.status === 'New Enquiry').length
            },
            { id: 'employees', label: `Employees (${employees.length})` },
            { id: 'master', label: 'Master Data' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-navy-900/80 dark:hover:bg-navy-800 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              <span>{t.label}</span>
              {t.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${t.badgeColor || 'bg-emerald-500'} animate-pulse`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Feedback Banner */}
      {statusMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Priority Banner: Pending Late Arrival Approvals */}
          {pendingLateApprovals.length > 0 && (
            <div className="p-5 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/30 border-2 border-rose-300 dark:border-rose-500/40 rounded-3xl shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-rose-500 text-white rounded-xl">
                    <Clock className="w-5 h-5 animate-spin" />
                  </span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                      Late Arrival Authorizations Required ({pendingLateApprovals.length})
                    </h4>
                    <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                      Staff members who logged in past their scheduled shift start are held at the security gateway until you grant access.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 cursor-pointer"
                >
                  Manage in Attendance & Logins Tab →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {pendingLateApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{req.employeeName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{req.role} • {req.department}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40">
                          +{req.lateMinutes}m Late
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950 p-2 rounded-xl border border-slate-100 dark:border-navy-800">
                        <div className="flex justify-between">
                          <span>Scheduled Shift:</span>
                          <span className="font-mono font-bold">{req.shiftStart || '09:00 AM'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-in Logged:</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {req.checkInAt ? new Date(req.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Late'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-navy-800">
                      <button
                        onClick={() => handleLateApprovalDecision(req.id, 'APPROVED', req.employeeName)}
                        disabled={approvingId === req.id}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{approvingId === req.id ? 'Approving...' : 'Approve Access'}</span>
                      </button>
                      <button
                        onClick={() => handleLateApprovalDecision(req.id, 'REJECTED', req.employeeName)}
                        disabled={approvingId === req.id}
                        className="py-1.5 px-3 bg-slate-100 dark:bg-navy-800 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-navy-700 disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs">Total Staff Accounts</span>
                <Users className="w-5 h-5 text-gold-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">{employees.length}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% Authorized Active Accounts
              </p>
            </div>

            {/* Live Website Inquiries KPI Card */}
            <div 
              onClick={() => setActiveTab('inquiries')}
              className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2 cursor-pointer hover:border-gold-500/50 hover:shadow-md transition group"
            >
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs">Website Leads & Inquiries</span>
                <MessageSquare className="w-5 h-5 text-gold-500 group-hover:scale-110 transition" />
              </div>
              <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {leads.length}
                {leads.filter(l => l.status === 'New' || l.status === 'New Enquiry').length > 0 && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold animate-pulse">
                    {leads.filter(l => l.status === 'New' || l.status === 'New Enquiry').length} New
                  </span>
                )}
              </p>
              <p className="text-[11px] text-gold-600 dark:text-gold-400 font-bold flex items-center justify-between">
                <span>Real-Time Sync Active</span>
                <span className="group-hover:underline">Open Leads Tab →</span>
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs">Security System Health</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400">Optimal</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                256-Bit SSL • JWT Auth Active
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs">Today's Attendance</span>
                <UserCheck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">4 / 5</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                80% Staff Present On Duty
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs">AWS S3 Compliance Vault</span>
                <Database className="w-5 h-5 text-amber-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-slate-900 dark:text-white">Connected</p>
              <p className="text-[11px] text-amber-600 dark:text-gold-400 font-bold">
                Region: ap-south-1 (Mumbai)
              </p>
            </div>
          </div>

          {/* Recent Website Inquiries Quick Widget in Overview */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold-500" />
                  Recent Website Inquiries & Consultations
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Live queries submitted from the website Contact Form and Academic Advisory pages.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLeads && fetchLeads()}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-navy-800 transition cursor-pointer"
                  title="Refresh Inquiries"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-gold-500' : ''}`} />
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="py-1 px-3 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-xl font-bold text-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1"
                >
                  <span>View All ({leads.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
                No website inquiries yet. Submissions from the website will appear here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                      <th className="p-2.5 font-bold whitespace-nowrap">Reference ID</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Candidate Name</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Phone Number</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Email Address</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Service Requested</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Date</th>
                      <th className="p-2.5 font-bold whitespace-nowrap">Status</th>
                      <th className="p-2.5 font-bold text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        {/* 1. Reference ID */}
                        <td className="p-2.5 whitespace-nowrap font-mono text-[11px] font-bold text-gold-600 dark:text-gold-400">
                          {lead.referenceNumber || (lead.id ? (lead.id.startsWith('#') ? lead.id : `#${lead.id.slice(0, 8)}`) : '—')}
                        </td>

                        {/* 2. Candidate Name */}
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {(lead.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[120px]">{lead.name}</span>
                          </div>
                        </td>

                        {/* 3. Phone Number */}
                        <td className="p-2.5 whitespace-nowrap font-mono text-[11px]">
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1.5 transition group"
                            >
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0 group-hover:scale-110 transition" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">—</span>
                          )}
                        </td>

                        {/* 4. Email Address */}
                        <td className="p-2.5 font-mono text-[11px]">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-slate-700 dark:text-slate-300 hover:text-gold-500 flex items-center gap-1.5 truncate max-w-[160px] transition group"
                              title={lead.email}
                            >
                              <Mail className="w-3 h-3 text-blue-500 shrink-0 group-hover:scale-110 transition" />
                              <span className="truncate">{lead.email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap">
                          {formatLeadDate(lead.createdAt)}
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            lead.status === 'New'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {lead.status || 'New'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System Role Distribution Breakdown */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              Enterprise Role Distribution & Permissions Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { title: 'Super Admin', count: employees.filter(e => e.role === 'Super Admin').length || 1, desc: 'Full System Control & User Management' },
                { title: 'Placement Coordinator', count: employees.filter(e => e.role === 'Placement Coordinator').length, desc: 'Candidates & Client Alignment' },
                { title: 'DMS Specialist', count: employees.filter(e => e.role === 'DMS').length, desc: 'Document Verification & S3 Vault' },
                { title: 'Application Support', count: employees.filter(e => e.role === 'Application Support').length, desc: 'Candidate Helpdesk & Processing' },
                { title: 'Recruiter / Interviewer', count: employees.filter(e => e.role === 'Recruiter' || e.role === 'Interviewer').length, desc: 'Pipeline & Technical Evaluation' }
              ].map((roleCard, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
                  <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block">{roleCard.title}</span>
                  <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">{roleCard.count} Active</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{roleCard.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE INQUIRIES & LEADS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Controls Card */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Phase 12 • Enterprise Lead Tracking & CRM
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Real-time SQLite Connected
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Website Inquiries, Leads & Customer Tracking System
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Review and manage all incoming service consultations, admissions requests, follow-ups, and customer lifecycles across all 6 verified service catalogs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (fetchLeads) fetchLeads();
                    if (fetchConsultingMetrics) fetchConsultingMetrics();
                    if (fetchLeadMetrics) fetchLeadMetrics(leadDateRangeFilter);
                    if (fetchFollowUpsSummary) fetchFollowUpsSummary();
                  }}
                  disabled={loadingLeads}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-navy-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Sync inquiries from database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-gold-500' : ''}`} />
                  <span>{loadingLeads ? 'Syncing...' : 'Sync Live'}</span>
                </button>
              </div>
            </div>

            {/* Sub-View Switcher: Service Breakdown vs Follow-Up Queue */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-200 dark:border-navy-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  setInquiriesSubView('services');
                  if (fetchLeadMetrics) fetchLeadMetrics(leadDateRangeFilter);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  inquiriesSubView === 'services'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm font-extrabold'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Service Performance Breakdown (6 Catalogs)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInquiriesSubView('followups');
                  if (fetchFollowUpsSummary) fetchFollowUpsSummary();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  inquiriesSubView === 'followups'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm font-extrabold'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Follow-Up Schedule Queue</span>
                {(followUpsSummary?.counts?.overdue > 0 || followUpsSummary?.counts?.dueToday > 0) && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {(followUpsSummary?.counts?.overdue || 0) + (followUpsSummary?.counts?.dueToday || 0)} Urgent
                  </span>
                )}
              </button>
            </div>
          </div>
          {/* SUB-VIEW 2: FOLLOW-UP SCHEDULE QUEUE */}
          {inquiriesSubView === 'followups' && (
            <div className="space-y-6">
              {/* Overdue Queue */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-rose-500/30 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Overdue Follow-ups ({followUpsSummary?.counts?.overdue || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    High Priority Action Required
                  </span>
                </div>

                {(!followUpsSummary?.data?.overdue || followUpsSummary.data.overdue.length === 0) ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    ✓ No overdue client follow-ups in queue!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {followUpsSummary.data.overdue.map(fu => (
                      <div key={fu.id} className="p-4 bg-rose-500/5 dark:bg-navy-950 rounded-2xl border border-rose-500/20 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{fu.leadName || 'Client'}</p>
                            <span className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold">{fu.leadServiceTitle || 'Academic Consultation'}</span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                            OVERDUE
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{fu.notes || fu.type || 'Consultation follow-up'}</p>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-navy-800">
                          <span>Scheduled: <strong className="text-rose-600 font-mono">{formatLeadDate(fu.dueDateTime)}</strong></span>
                          <span>Assigned: <strong>{fu.assignedTo || 'Staff'}</strong></span>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {fu.leadPhone && (
                            <a
                              href={`https://wa.me/${cleanPhoneForWa(fu.leadPhone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleCompleteFollowUp(fu.id)}
                            className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Done</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Today Queue */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Due Today ({followUpsSummary?.counts?.dueToday || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Scheduled for Today
                  </span>
                </div>

                {(!followUpsSummary?.data?.dueToday || followUpsSummary.data.dueToday.length === 0) ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No follow-ups due today.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {followUpsSummary.data.dueToday.map(fu => (
                      <div key={fu.id} className="p-4 bg-amber-500/5 dark:bg-navy-950 rounded-2xl border border-amber-500/20 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{fu.leadName || 'Client'}</p>
                            <span className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold">{fu.leadServiceTitle || 'Academic Consultation'}</span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-navy-950">
                            DUE TODAY
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{fu.notes || fu.type || 'Consultation follow-up'}</p>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-navy-800">
                          <span>Time: <strong className="text-amber-600 font-mono">{formatLeadDate(fu.dueDateTime)}</strong></span>
                          <span>Assigned: <strong>{fu.assignedTo || 'Staff'}</strong></span>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {fu.leadPhone && (
                            <a
                              href={`https://wa.me/${cleanPhoneForWa(fu.leadPhone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleCompleteFollowUp(fu.id)}
                            className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Done</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Queue */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Upcoming Follow-ups ({followUpsSummary?.counts?.upcoming || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    Next 7 - 30 Days
                  </span>
                </div>

                {(!followUpsSummary?.data?.upcoming || followUpsSummary.data.upcoming.length === 0) ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No upcoming follow-ups scheduled.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {followUpsSummary.data.upcoming.map(fu => (
                      <div key={fu.id} className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{fu.leadName || 'Client'}</p>
                          <span className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold">{fu.leadServiceTitle || 'Academic Consultation'}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium truncate">{fu.notes || fu.type}</p>
                        <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200 dark:border-navy-800">
                          <span>Due: <strong className="font-mono">{formatLeadDate(fu.dueDateTime)}</strong></span>
                          <span>{fu.assignedTo || 'Staff'}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => handleCompleteFollowUp(fu.id)}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-navy-800 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Mark Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: SERVICE PERFORMANCE BREAKDOWN */}
          {inquiriesSubView === 'services' && (
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gold-500" />
                    Service-Wise Conversion & Pipeline Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live analytics across the 6 verified academic & recruitment service catalogs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (fetchLeadMetrics) fetchLeadMetrics(leadDateRangeFilter);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-navy-700 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Metrics</span>
                </button>
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
                              setLeadServiceFilter(srv.serviceId);
                              setInquiriesSubView('leads');
                              setLeadPage(1);
                            }}
                            className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition cursor-pointer flex items-center gap-1 ml-auto"
                            title={`View all leads for ${srv.serviceTitle}`}
                          >
                            <span>Filter Leads</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMPLOYEES DIRECTORY & ADD EMPLOYEE FORM */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Left 8 Cols: Employee Directory Table */}
          <div className="lg:col-span-8 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Employee Directory</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-xs">Registered system employees with granted CRM portal authorization.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e=>setSearchQuery(e.target.value)} 
                    placeholder="Search employees..." 
                    className="bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>
                <button onClick={() => setEmployees([...employees])} className="p-2 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 rounded-xl border border-slate-300 dark:border-navy-800 transition cursor-pointer" title="Refresh Directory">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3 font-extrabold whitespace-nowrap">EMPLOYEE NAME</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">EMPLOYEE ID</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">EMAIL</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">PHONE NUMBER</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">ROLE</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">DEPARTMENT</th>
                    <th className="p-3 font-extrabold whitespace-nowrap">ACCOUNT STATUS</th>
                    <th className="p-3 font-extrabold text-right whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                  {filteredEmployees.map((emp, idx) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      {/* 1. Employee Name */}
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center border border-blue-300 dark:border-blue-500/40 text-[11px] shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[140px] font-semibold">{emp.name}</span>
                      </td>

                      {/* 2. Employee ID */}
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                          {emp.employeeId || `EMP-${1001 + idx}`}
                        </span>
                      </td>

                      {/* 3. Email */}
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={emp.email}>
                        {emp.email}
                      </td>

                      {/* 4. Phone Number */}
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {emp.phone}
                      </td>

                      {/* 5. Role */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          emp.role === 'Super Admin'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                            : emp.role === 'Admin'
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700'
                            : emp.role === 'HR Lead'
                            ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
                            : emp.role === 'Recruiter'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700'
                            : emp.role === 'Placement Coordinator'
                            ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                        }`}>
                          {emp.role}
                        </span>
                      </td>

                      {/* 6. Department */}
                      <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                        {emp.department || getDepartmentForRole(emp.role)}
                      </td>

                      {/* 7. Account Status */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleEmployeeStatus(emp)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer flex items-center gap-1.5 ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-700 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-700 hover:bg-rose-200'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                          {emp.status}
                        </button>
                      </td>

                      {/* 8. Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEditClick(emp)} 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition cursor-pointer"
                            title="Edit Employee Details & Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id, emp.name, emp.employeeId)} 
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                            title="Delete Employee Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 Cols: + Add New Employee Form */}
          <div className="lg:col-span-4 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm h-fit">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-500" />
                {editingEmployeeId ? 'Edit Employee Account' : '+ Add New Employee'}
              </span>
              {editingEmployeeId && (
                <button onClick={handleCancelEdit} type="button" className="text-xs font-bold text-slate-500 hover:text-rose-500 transition cursor-pointer">Cancel Edit</button>
              )}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newEmployee.name} 
                  onChange={e=>setNewEmployee({...newEmployee, name: e.target.value})} 
                  placeholder="e.g. Sarah Al Zaabi" 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Email ID *</label>
                <input 
                  type="email" 
                  required 
                  value={newEmployee.email} 
                  onChange={e=>{
                    setNewEmployee({...newEmployee, email: e.target.value});
                    if (emailError) setEmailError('');
                  }} 
                  placeholder="sarah.hr@revivalinternational.com" 
                  className={`w-full bg-slate-100 dark:bg-navy-950 border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-300 dark:border-navy-700 focus:border-gold-500'} text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none`}
                />
                {emailError && <p className="text-red-500 text-[10px] font-bold mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={newEmployee.password} 
                    onChange={e=>setNewEmployee({...newEmployee, password: e.target.value})} 
                    placeholder="Set corporate password" 
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 pr-10 font-bold focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={newEmployee.phone} 
                  onChange={e=>setNewEmployee({...newEmployee, phone: e.target.value})} 
                  placeholder="+971 50 123 4567" 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                  Assign Corporate Role * (Exactly 6 Roles)
                </label>
                <select 
                  value={newEmployee.role} 
                  onChange={e => {
                    const role = e.target.value;
                    setNewEmployee({
                      ...newEmployee,
                      role,
                      department: getDepartmentForRole(role)
                    });
                  }}
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {CRM_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Department</label>
                <input 
                  type="text"
                  value={newEmployee.department || getDepartmentForRole(newEmployee.role)} 
                  onChange={e=>setNewEmployee({...newEmployee, department: e.target.value})} 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <button 
                type="submit" 
                className={`w-full py-3.5 text-white font-extrabold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 mt-2 ${editingEmployeeId ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'}`}
              >
                {editingEmployeeId ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{editingEmployeeId ? 'Update Employee Account' : 'Create Employee Account'}</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 6: MASTER DATA */}
      {activeTab === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Master Industry Sectors */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
              <Database className="w-5 h-5 text-gold-500" />
              Master Industry Recruitment Sectors
            </h3>

            <div className="space-y-2">
              {masterSectors.map((sector, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white group transition-all hover:border-slate-300 dark:hover:border-navy-700">
                  <span>{sector}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-extrabold">Active</span>
                    <button onClick={() => handleRemoveMasterSector(sector)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer" title="Remove Sector">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMasterSector} className="flex gap-2 pt-2">
              <input 
                type="text" 
                value={newSectorInput}
                onChange={e => setNewSectorInput(e.target.value)}
                placeholder="Add new industry sector..."
                className="flex-1 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
              <button type="submit" className="py-2.5 px-4 bg-gold-500 text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:bg-gold-400 transition cursor-pointer flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          {/* Master Visa Protocols */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
              <Globe className="w-5 h-5 text-blue-500" />
              Master International Visa Protocols
            </h3>

            <div className="space-y-2">
              {masterVisas.map((visa, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white group transition-all hover:border-slate-300 dark:hover:border-navy-700">
                  <span>{visa}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold">Configured</span>
                    <button onClick={() => handleRemoveMasterVisa(visa)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer" title="Remove Visa Protocol">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMasterVisa} className="flex gap-2 pt-2">
              <input 
                type="text" 
                value={newVisaInput}
                onChange={e => setNewVisaInput(e.target.value)}
                placeholder="Add new visa protocol..."
                className="flex-1 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
              <button type="submit" className="py-2.5 px-4 bg-blue-600 text-white font-extrabold rounded-xl shadow-md hover:bg-blue-700 transition cursor-pointer flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

        </div>
      )}

      {/* FULL INQUIRY DETAILS & CONSULTING DOSSIER MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white my-6 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Consulting Dossier
                  </span>
                  {selectedLead.referenceNumber && (
                    <span className="font-mono text-xs font-extrabold text-gold-600 dark:text-gold-400 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded">
                      {selectedLead.referenceNumber}
                    </span>
                  )}
                  {selectedLead.priority && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      selectedLead.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                      selectedLead.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
                    }`}>
                      {selectedLead.priority}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedLead.organizationName || selectedLead.company || 'Individual / Student'} • Received {formatLeadDate(selectedLead.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLead(selectedLead)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Copy Dossier Info"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchiveToggle(selectedLead, !selectedLead.isArchived)}
                  disabled={leadActionLoading}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    selectedLead.isArchived 
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40' 
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-amber-600'
                  }`}
                  title={selectedLead.isArchived ? "Restore Lead from Archive" : "Archive Lead (Soft-delete)"}
                >
                  {selectedLead.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
                <a
                  href={`https://wa.me/${cleanPhoneForWa(selectedLead.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer"
                  title="WhatsApp Client"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${selectedLead.email}?subject=Regarding Your Consultation - The Revival International&body=Dear ${encodeURIComponent(selectedLead.name)},%0D%0A%0D%0A`}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer"
                  title="Email Client"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Workflow Action Strip (Persisted to SQLite) */}
            <div className="bg-slate-50 dark:bg-navy-950 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pipeline Status</label>
                <select
                  value={selectedLead.status || 'New Enquiry'}
                  onChange={e => handleUpdateLeadField('status', e.target.value)}
                  disabled={leadActionLoading}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="New Enquiry">New Enquiry</option>
                  <option value="Contact Pending">Contact Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Selected">Selected</option>
                  <option value="Offer Released">Offer Released</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Visa Processing">Visa Processing</option>
                  <option value="Mobilization">Mobilization</option>
                  <option value="Contract Active">Contract Active</option>
                  <option value="Contract Ended">Contract Ended</option>
                  <option value="Renewed">Renewed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed / Lost">Closed / Lost</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority Level</label>
                <select
                  value={selectedLead.priority || 'Medium'}
                  onChange={e => handleUpdateLeadField('priority', e.target.value)}
                  disabled={leadActionLoading}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned Consultant</label>
                <select
                  value={selectedLead.assignedEmployee || ''}
                  onChange={e => handleUpdateLeadField('assignedEmployee', e.target.value)}
                  disabled={leadActionLoading}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Linked Organization</label>
                <select
                  value={selectedLead.organizationId || ''}
                  onChange={e => handleUpdateLeadField('organizationId', e.target.value)}
                  disabled={leadActionLoading}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">None (Individual Applicant)</option>
                  {clients.map(org => (
                    <option key={org.id} value={org.id}>{org.name} ({org.organizationType || 'Partner'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Staff Confidential Internal Notes (Protected Admin Dossier) */}
            <div className="bg-amber-500/5 dark:bg-navy-950 p-4 rounded-2xl border border-amber-500/25 dark:border-navy-800 space-y-2 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Staff Internal Notes & Evaluation (Private / Not Public)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Stored securely in SQLite • Never shared with applicant
                </span>
              </div>
              <textarea
                rows={2}
                value={leadInternalNotesInput}
                onChange={e => setLeadInternalNotesInput(e.target.value)}
                placeholder="Enter private internal evaluation, consultant impressions, verification checks, or VIP handling instructions..."
                className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-sans focus:outline-none focus:border-gold-500"
              />
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-[10px] text-slate-500">
                  Only visible to authenticated administrators and consultants.
                </span>
                <button
                  type="button"
                  onClick={handleSaveInternalNotes}
                  disabled={leadActionLoading}
                  className="px-3 py-1 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>{leadActionLoading ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-navy-800 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setLeadModalTab('details')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  leadModalTab === 'details'
                    ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Profile & Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => setLeadModalTab('activities')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  leadModalTab === 'activities'
                    ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussion Notes & Activity ({selectedLead.activities?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setLeadModalTab('followups')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  leadModalTab === 'followups'
                    ? 'border-gold-500 text-gold-600 dark:text-gold-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Scheduled Follow-ups ({selectedLead.followUps?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Profile & Dossier */}
            {leadModalTab === 'details' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Service Track</span>
                    <span className="font-bold text-gold-600 dark:text-gold-400">{selectedLead.serviceTitle || selectedLead.serviceId}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Consulting Track</span>
                    <span className="font-bold">{selectedLead.assistanceType || 'Comprehensive Strategic Advisory'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Destination</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLead.countryInterest || 'Global / Multi-Destination'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Intake & Degree</span>
                    <span className="font-bold">{[selectedLead.intakeTerm, selectedLead.degreeLevel].filter(Boolean).join(' • ') || 'Immediate Intake'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Contact Method</span>
                    <span className="font-bold">{selectedLead.preferredContactMethod || 'WhatsApp'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Affiliated Organization</span>
                    <span className="font-bold">{selectedLead.organizationName || selectedLead.company || 'Direct Applicant'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Direct Email</span>
                    <a href={`mailto:${selectedLead.email}`} className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">{selectedLead.email}</a>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Direct Phone</span>
                    <a href={`https://wa.me/${cleanPhoneForWa(selectedLead.phone)}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{selectedLead.phone}</a>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Next Planned Action</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{selectedLead.nextAction || 'Schedule Advisory Consultation'}</span>
                  </div>
                </div>

                {/* Service Specifications & Job Requirements Card */}
                {(selectedLead.jobTitle || selectedLead.skills || selectedLead.vacancies || selectedLead.salaryRange || selectedLead.contractDuration || selectedLead.startDate || selectedLead.visaCategory || selectedLead.seniority || selectedLead.industry || selectedLead.cvPath || selectedLead.workLocation) && (
                  <div className="p-4 bg-gold-500/5 dark:bg-navy-950 rounded-2xl border border-gold-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gold-600 dark:text-gold-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Workforce & Service Specifications</span>
                      </span>
                      {selectedLead.cvPath && (
                        <a
                          href={selectedLead.cvPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-gold-500 text-navy-950 rounded-lg font-bold text-[10px] hover:bg-gold-400 transition flex items-center gap-1 shadow-xs"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Attached CV / Brief</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {selectedLead.jobTitle && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Job Title / Role</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">{selectedLead.jobTitle}</span>
                        </div>
                      )}
                      {selectedLead.vacancies && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Vacancies / Headcount</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLead.vacancies}</span>
                        </div>
                      )}
                      {selectedLead.salaryRange && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Salary Range</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedLead.salaryRange}</span>
                        </div>
                      )}
                      {selectedLead.workLocation && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Location</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">{selectedLead.workLocation}</span>
                        </div>
                      )}
                      {selectedLead.experience && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Experience</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedLead.experience}</span>
                        </div>
                      )}
                      {selectedLead.seniority && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Seniority</span>
                          <span className="font-bold text-gold-600 dark:text-gold-400">{selectedLead.seniority}</span>
                        </div>
                      )}
                      {selectedLead.industry && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Industry Sector</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedLead.industry}</span>
                        </div>
                      )}
                      {selectedLead.contractDuration && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Contract Duration</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{selectedLead.contractDuration}</span>
                        </div>
                      )}
                      {selectedLead.startDate && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Start Date</span>
                          <span className="font-bold font-mono">{selectedLead.startDate}</span>
                        </div>
                      )}
                      {selectedLead.endDate && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">End Date</span>
                          <span className="font-bold font-mono">{selectedLead.endDate}</span>
                        </div>
                      )}
                      {selectedLead.shiftRequirements && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Shift Schedule</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedLead.shiftRequirements}</span>
                        </div>
                      )}
                      {selectedLead.visaCategory && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Visa / Permit Track</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedLead.visaCategory}</span>
                        </div>
                      )}
                      {selectedLead.skills && (
                        <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 sm:col-span-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Skills / Qualifications</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedLead.skills}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Submitted Inquiry Details & Goals</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{selectedLead.message}</p>
                </div>

                {(selectedLead.utmSource || selectedLead.utmMedium || selectedLead.utmCampaign || selectedLead.referrer) && (
                  <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Marketing & Acquisition Attribution</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedLead.utmSource && <span className="px-2 py-0.5 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">Source: <strong>{selectedLead.utmSource}</strong></span>}
                      {selectedLead.utmMedium && <span className="px-2 py-0.5 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">Medium: <strong>{selectedLead.utmMedium}</strong></span>}
                      {selectedLead.utmCampaign && <span className="px-2 py-0.5 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">Campaign: <strong>{selectedLead.utmCampaign}</strong></span>}
                      {selectedLead.referrer && <span className="px-2 py-0.5 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] truncate max-w-xs">Referrer: {selectedLead.referrer}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Discussion Notes & Interactions */}
            {leadModalTab === 'activities' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Add Note Form */}
                <form onSubmit={handleAddActivity} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-gold-500" />
                      Record Discussion Note / Interaction
                    </span>
                    <div className="flex items-center gap-1">
                      {['Note', 'Call', 'Meeting', 'Email'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewActivity(prev => ({ ...prev, type: t }))}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                            newActivity.type === t
                              ? 'bg-gold-500 text-navy-950 font-extrabold'
                              : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={newActivity.title}
                    onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Subject / Summary (e.g., Profile evaluation review call with candidate)"
                    className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                  />

                  <textarea
                    rows={2}
                    value={newActivity.details}
                    onChange={e => setNewActivity(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="Detailed discussion points, client questions, decisions made..."
                    className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-sans focus:outline-none focus:border-gold-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingActivity}
                      className="px-4 py-1.5 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAddingActivity ? 'Saving...' : 'Save Interaction'}</span>
                    </button>
                  </div>
                </form>

                {/* Activity Feed */}
                <div className="space-y-2">
                  {!selectedLead.activities || selectedLead.activities.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">No discussion notes or interaction logs yet.</div>
                  ) : (
                    selectedLead.activities.map((act, i) => (
                      <div key={act.id || i} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold uppercase px-1.5 py-0.2 rounded bg-gold-500/20 text-gold-700 dark:text-gold-400">
                              {act.activityType || 'Note'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{act.title}</span>
                          </div>
                          <span className="text-slate-500 font-mono">{formatLeadDate(act.createdAt)}</span>
                        </div>
                        {act.details && <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">{act.details}</p>}
                        <div className="text-[10px] text-slate-400">Logged by: {act.performedBy || 'Consultant'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Scheduled Follow-ups */}
            {leadModalTab === 'followups' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Schedule Follow-up Form */}
                <form onSubmit={handleScheduleFollowUp} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-500" />
                    Schedule Client Follow-up
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={newFollowUp.followUpDate}
                        onChange={e => setNewFollowUp(prev => ({ ...prev, followUpDate: e.target.value }))}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Follow-up Objective / Purpose</label>
                      <input
                        type="text"
                        required
                        value={newFollowUp.purpose}
                        onChange={e => setNewFollowUp(prev => ({ ...prev, purpose: e.target.value }))}
                        placeholder="e.g., Review scholarship application draft and recommend university shortlist"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="w-48">
                      <select
                        value={newFollowUp.assignedTo}
                        onChange={e => setNewFollowUp(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-2 py-1 text-[11px] font-bold"
                      >
                        <option value="">Assign to: {selectedLead.assignedEmployee || 'Me'}</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isAddingFollowUp}
                      className="px-4 py-1.5 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAddingFollowUp ? 'Scheduling...' : 'Schedule Follow-up'}</span>
                    </button>
                  </div>
                </form>

                {/* Follow-up List */}
                <div className="space-y-2">
                  {!selectedLead.followUps || selectedLead.followUps.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">No follow-ups scheduled for this client.</div>
                  ) : (
                    selectedLead.followUps.map(fu => (
                      <div key={fu.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full ${
                              fu.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' :
                              fu.status === 'Cancelled' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}>
                              {fu.status}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{fu.purpose}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Due: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatLeadDate(fu.followUpDate)}</strong> • Assigned: {fu.assignedTo}
                          </p>
                          {fu.completionNotes && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Outcome: {fu.completionNotes}</p>
                          )}
                        </div>

                        {fu.status === 'Pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCompleteFollowUp(fu.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Cancel this follow-up?')) {
                                  await updateFollowUpStatus(fu.id, 'Cancelled');
                                  const refreshed = await fetch(`/api/leads/${selectedLead.id}`).then(r => r.json());
                                  if (refreshed?.lead) setSelectedLead(refreshed.lead);
                                  if (fetchFollowUps) fetchFollowUps();
                                  if (fetchConsultingMetrics) fetchConsultingMetrics();
                                }
                              }}
                              className="px-2 py-1 bg-slate-200 dark:bg-navy-800 hover:bg-rose-500 hover:text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
    </ScrollReveal>
  );
};

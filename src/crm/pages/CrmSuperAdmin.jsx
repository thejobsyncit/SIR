import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { CRM_ROLES } from '../data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff,
  Activity, Clock, Calendar, AlertCircle, XCircle, Database, Award, Globe, Server, Settings, Key, Plus, ChevronRight, TrendingUp, UserCheck, Edit,
  MessageSquare, ExternalLink, Inbox, Briefcase, Sparkles, Copy, Send, GraduationCap, Building2, CheckSquare, Tag, Compass,
  Download, Archive, RotateCcw, ChevronLeft, Layers
} from 'lucide-react';

export const CrmSuperAdmin = () => {
  const { 
    logAuditAction, 
    leads = [], 
    loadingLeads, 
    fetchLeads,
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
    fetchFollowUps
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inquiries' | 'employees' | 'attendance' | 'leaves' | 'company' | 'master'

  // Pre-seeded Employee Accounts matching the user's reference UI
  const initialEmployees = [
    { id: 'emp-1', name: 'Dhanalakshimi', role: 'Placement Coordinator', email: 'dhana.jasync@gmail.com', phone: '+91 9876543210', password: 'Password123!', status: 'Active' },
    { id: 'emp-2', name: 'Sreeja', role: 'Placement Coordinator', email: 'sreeja.jasync@gmail.com', phone: '+91 9876543211', password: 'Password123!', status: 'Active' },
    { id: 'emp-3', name: 'chentamilselvi', role: 'DMS', email: 'chentamilselvip7@gmail.com', phone: '+91 9876543212', password: 'Password123!', status: 'Active' },
    { id: 'emp-4', name: 'Diviya', role: 'Application Support', email: 'abi.jasync@gmail.com', phone: '+91 9876543213', password: 'Password123!', status: 'Active' },
    { id: 'emp-5', name: 'balavarshini', role: 'Application Support', email: 'balavarshini2223@gmail.com', phone: '+91 9876543214', password: 'Password123!', status: 'Active' }
  ];

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('sir_crm_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u, i) => ({
            id: `emp-${i + 1}`,
            name: u.name || u.email.split('@')[0],
            role: u.role || 'Super Admin',
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
    name: 'Revival International Enterprise Ltd',
    domain: 'revivalinternational.com',
    registrationNo: 'REG-2026-DXB-99412',
    headquarters: 'Dubai Silicon Oasis, UAE / Chennai, India',
    s3Region: 'ap-south-1 (Mumbai / AWS Compliant Vault)',
    supportEmail: 'support@revivalinternational.com',
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
  const [inquiriesSubView, setInquiriesSubView] = useState('leads');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActionLoading, setLeadActionLoading] = useState(false);
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
      role: emp.role
    });
    // Scroll to top where the form is usually visible on mobile, or just let them see it
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setNewEmployee({ name: '', email: '', password: '', phone: '', role: 'Recruiter' });
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
      name: e.name,
      email: e.email.trim().toLowerCase(),
      password: e.password,
      role: e.role,
      phone: e.phone,
      status: e.status || 'Active'
    }));
    localStorage.setItem('sir_crm_registered_users', JSON.stringify(registeredFormat));
  };

  useEffect(() => {
    syncToLocalStorage(employees);
  }, []);

  const handleSaveEmployee = (e) => {
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
      const updated = employees.map(emp => {
        if (emp.id === editingEmployeeId) {
          return {
            ...emp,
            name: newEmployee.name.trim() || newEmployee.email.split('@')[0],
            email: newEmployee.email.trim().toLowerCase(),
            password: newEmployee.password,
            phone: newEmployee.phone.trim() || '+91 9800000000',
            role: newEmployee.role
          };
        }
        return emp;
      });
      setEmployees(updated);
      syncToLocalStorage(updated);
      logAuditAction(`Super Admin updated employee account '${newEmployee.email}'.`);
      setStatusMsg(`✓ Employee Account '${newEmployee.name || newEmployee.email}' updated successfully!`);
    } else {
      const emailExists = employees.some(emp => emp.email.toLowerCase() === newEmployee.email.trim().toLowerCase());
      if (emailExists) {
        setEmailError('An employee with this email already exists.');
        return;
      }
      const createdEmp = {
        id: `emp-${Date.now()}`,
        name: newEmployee.name.trim() || newEmployee.email.split('@')[0],
        email: newEmployee.email.trim().toLowerCase(),
        password: newEmployee.password,
        phone: newEmployee.phone.trim() || '+91 9800000000',
        role: newEmployee.role,
        status: 'Active'
      };

      const updated = [createdEmp, ...employees];
      setEmployees(updated);
      syncToLocalStorage(updated);
      logAuditAction(`Super Admin created employee account '${createdEmp.email}'.`);
      setStatusMsg(`✓ Employee Account '${createdEmp.name}' created successfully!`);
    }
    
    setNewEmployee({ name: '', email: '', password: '', phone: '', role: 'Recruiter' });
    setEditingEmployeeId(null);
    setShowPassword(false);
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const handleDeleteEmployee = (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee '${name}'?`)) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      syncToLocalStorage(updated);
      logAuditAction(`Super Admin deleted employee account '${name}'.`);
      setStatusMsg(`Deleted employee account '${name}'.`);
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
              badge: leads.filter(l => l.status === 'New').length
            },
            { id: 'employees', label: `Employees (${employees.length})` },
            { id: 'attendance', label: 'Attendance' },
            { id: 'leaves', label: 'Leaves' },
            { id: 'company', label: 'Company' },
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
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title={`${t.badge} New Inquiries`}></span>
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
                {leads.filter(l => l.status === 'New').length > 0 && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold animate-pulse">
                    {leads.filter(l => l.status === 'New').length} New
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
                      <th className="p-2.5 font-bold">CLIENT / INQUIRER</th>
                      <th className="p-2.5 font-bold">SERVICE REQUESTED</th>
                      <th className="p-2.5 font-bold">CONTACT</th>
                      <th className="p-2.5 font-bold">DATE</th>
                      <th className="p-2.5 font-bold">STATUS</th>
                      <th className="p-2.5 font-bold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {(lead.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[120px]">{lead.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full text-[10px] border border-blue-300 dark:border-blue-500/30 truncate max-w-[150px] inline-block">
                            {lead.serviceTitle || lead.serviceId || 'General Inquiry'}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">
                          <div className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[140px]">{lead.email}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{lead.phone}</div>
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

            {/* Sub-View Switcher: All Leads Directory vs Follow-Up Queue vs Service Breakdown */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-200 dark:border-navy-800 pb-3">
              <button
                type="button"
                onClick={() => setInquiriesSubView('leads')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  inquiriesSubView === 'leads'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm font-extrabold'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>All Leads Directory ({filteredLeads.length})</span>
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
            </div>

            {/* Live Database-Derived KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Leads</span>
                <p className="font-serif text-xl font-extrabold text-slate-900 dark:text-white">{leadMetrics?.totalEnquiries || leads.length}</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Inbound Received</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">New Inbound</span>
                <p className="font-serif text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{leadMetrics?.newEnquiries || 0}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Uncontacted</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Contact Pending</span>
                <p className="font-serif text-xl font-extrabold text-cyan-600 dark:text-cyan-400">{leadMetrics?.contactPending || 0}</p>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Attempted</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Follow-up Due</span>
                <div className="flex items-center gap-1">
                  <p className="font-serif text-xl font-extrabold text-amber-600 dark:text-amber-400">{leadMetrics?.awaitingFollowUp || 0}</p>
                  {leadMetrics?.overdueFollowUps > 0 && (
                    <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1 py-0.2 rounded-full">
                      {leadMetrics.overdueFollowUps} Overdue
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-amber-600 dark:text-gold-400 font-bold">Action Needed</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">In Progress</span>
                <p className="font-serif text-xl font-extrabold text-purple-600 dark:text-purple-400">{leadMetrics?.inProgress || 0}</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Active Advising</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Qualified</span>
                <p className="font-serif text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{leadMetrics?.qualified || 0}</p>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Ready</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Converted</span>
                <div className="flex items-baseline gap-1">
                  <p className="font-serif text-xl font-extrabold text-teal-600 dark:text-teal-400">{leadMetrics?.converted || 0}</p>
                  {leadMetrics?.conversionRate > 0 && (
                    <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">({leadMetrics.conversionRate}%)</span>
                  )}
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Admitted / Placed</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Closed / Lost</span>
                <p className="font-serif text-xl font-extrabold text-slate-500 dark:text-slate-400">{leadMetrics?.closedLost || 0}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Archived</span>
              </div>
            </div>

            {/* Filters & Search Row (Visible in Leads Subview) */}
            {inquiriesSubView === 'leads' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-2 border-t border-slate-200 dark:border-navy-800">
                <div className="relative lg:col-span-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={e => { setLeadSearchQuery(e.target.value); setLeadPage(1); }}
                    placeholder="Search name, ref #, email, phone..."
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div>
                  <select
                    value={leadServiceFilter}
                    onChange={e => { setLeadServiceFilter(e.target.value); setLeadPage(1); }}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Services ({leads.length})</option>
                    <optgroup label="Workforce & Recruitment Services">
                      <option value="dom-rec">🏢 Domestic Recruitment</option>
                      <option value="intl-rec">🌐 International Recruitment</option>
                      <option value="exec-search">👔 Executive Search</option>
                      <option value="perm-staff">💼 Permanent Staffing</option>
                      <option value="contract-staff">⏱️ Contract Staffing</option>
                      <option value="bulk-hiring">👥 Bulk Hiring</option>
                      <option value="overseas-place">✈️ Overseas Placement</option>
                      <option value="visa-assist">📄 Visa Assistance</option>
                      <option value="work-permit">🏅 Work Permit Guidance</option>
                    </optgroup>
                    <optgroup label="Academic & Strategic Advisory">
                      <option value="intl-consult">🎓 International Consulting</option>
                      <option value="college-adm">College Admission Assistance</option>
                      <option value="school-career">School Student Career Guidance</option>
                      <option value="intl-adm">Study Abroad Visa & Admissions</option>
                      <option value="school-academy">School Academy & Skills</option>
                      <option value="exec-seminars-lang">Executive Seminars & Language</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <select
                    value={leadStatusFilter}
                    onChange={e => { setLeadStatusFilter(e.target.value); setLeadPage(1); }}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Pipeline Stages</option>
                    <option value="New Enquiry">New Enquiry</option>
                    <option value="Contact Pending">Contact Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed / Lost">Closed / Lost</option>
                  </select>
                </div>

                <div>
                  <select
                    value={leadDateRangeFilter}
                    onChange={e => { 
                      setLeadDateRangeFilter(e.target.value); 
                      setLeadPage(1);
                      if (fetchLeadMetrics) fetchLeadMetrics(e.target.value);
                    }}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <select
                    value={leadAssignedFilter}
                    onChange={e => { setLeadAssignedFilter(e.target.value); setLeadPage(1); }}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Consultants</option>
                    <option value="unassigned">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={leadPageSize}
                    onChange={e => { setLeadPageSize(e.target.value); setLeadPage(1); }}
                    className="w-20 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2 py-1.5 rounded-xl text-xs focus:outline-none font-semibold cursor-pointer"
                    title="Items per page"
                  >
                    <option value="25">25 / pg</option>
                    <option value="50">50 / pg</option>
                    <option value="100">100 / pg</option>
                    <option value="all">All</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex-1 px-2.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    title="Export filtered leads to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: LEADS DIRECTORY TABLE */}
          {inquiriesSubView === 'leads' && (
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Showing {paginatedLeads.length} of {filteredLeads.length} filtered inquiries ({leads.length} total)</span>
                {(leadSearchQuery || leadServiceFilter !== 'all' || leadStatusFilter !== 'all' || leadDateRangeFilter !== 'all' || leadAssignedFilter !== 'all') && (
                  <button
                    onClick={() => { 
                      setLeadSearchQuery(''); 
                      setLeadServiceFilter('all'); 
                      setLeadStatusFilter('all'); 
                      setLeadDateRangeFilter('all');
                      setLeadAssignedFilter('all');
                      setLeadPage(1);
                    }}
                    className="text-gold-600 dark:text-gold-400 hover:underline cursor-pointer font-bold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {filteredLeads.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-navy-950/50 rounded-2xl border border-dashed border-slate-300 dark:border-navy-800">
                  <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-serif text-base font-bold text-slate-700 dark:text-slate-300">No Enquiries Found</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
                    {leads.length === 0 
                      ? "Inquiries submitted through the website Contact and Consulting forms will automatically populate here in real time."
                      : "No inquiries matched your filter criteria. Try adjusting your search term or filters."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                          <th className="p-3 font-extrabold">APPLICANT & REF #</th>
                          <th className="p-3 font-extrabold">SERVICE & TRACK</th>
                          <th className="p-3 font-extrabold">DESTINATION / INTAKE</th>
                          <th className="p-3 font-extrabold">CONTACT INFO</th>
                          <th className="p-3 font-extrabold">ASSIGNED CONSULTANT</th>
                          <th className="p-3 font-extrabold">STATUS & PRIORITY</th>
                          <th className="p-3 font-extrabold text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                        {paginatedLeads.map(lead => (
                          <tr key={lead.id} className={`hover:bg-slate-50 dark:hover:bg-navy-950/60 transition group ${lead.isArchived ? 'opacity-60 bg-slate-50/50 dark:bg-navy-950/30' : ''}`}>
                            <td className="p-3">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center border border-gold-500/30 text-xs shrink-0">
                                  {(lead.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{lead.name}</p>
                                    {lead.isArchived ? (
                                      <span className="text-[9px] bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-extrabold">Archived</span>
                                    ) : null}
                                  </div>
                                  {lead.referenceNumber && (
                                    <span className="font-mono text-[9px] text-gold-600 dark:text-gold-400 font-bold block truncate">
                                      {lead.referenceNumber}
                                    </span>
                                  )}
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                    {lead.organizationName || lead.company || 'Individual / Student'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <div>
                                <span className="inline-block bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border border-blue-300 dark:border-blue-500/30">
                                  {lead.serviceTitle || lead.serviceId || 'General Inquiry'}
                                </span>
                                {lead.assistanceType && (
                                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">
                                    {lead.assistanceType}
                                  </p>
                                )}
                                {lead.utmSource && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <span className="inline-flex items-center text-[9px] font-mono font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 truncate max-w-[150px]" title={`Attribution: ${lead.utmSource} / ${lead.utmMedium || 'cpc'}`}>
                                      📍 {lead.utmSource}{lead.utmMedium ? ` / ${lead.utmMedium}` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                                  {lead.countryInterest || 'Global'}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">
                                  {[lead.intakeTerm, lead.degreeLevel].filter(Boolean).join(' • ') || 'Immediate'}
                                </p>
                              </div>
                            </td>

                            <td className="p-3 font-mono">
                              <a 
                                href={`mailto:${lead.email}`} 
                                className="font-bold text-slate-900 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold-400 flex items-center gap-1 truncate max-w-[160px]"
                                title={`Email ${lead.email}`}
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </a>
                              <a 
                                href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                                title={`WhatsApp ${lead.phone}`}
                              >
                                <Phone className="w-3 h-3 shrink-0" />
                                <span>{lead.phone}</span>
                              </a>
                            </td>

                            <td className="p-3">
                              <select
                                value={lead.assignedEmployee || ''}
                                onChange={async (e) => {
                                  const emp = e.target.value;
                                  await updateLead(lead.id, { assignedEmployee: emp });
                                  if (fetchLeads) fetchLeads();
                                  setStatusMsg(`✓ Assigned consultant updated to "${emp || 'Unassigned'}"`);
                                  setTimeout(() => setStatusMsg(''), 3000);
                                }}
                                className="text-[10px] font-bold bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2 py-1 rounded-xl focus:outline-none cursor-pointer max-w-[130px]"
                              >
                                <option value="">Unassigned</option>
                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                                ))}
                              </select>
                            </td>

                            <td className="p-3">
                              <div className="space-y-1">
                                <select
                                  value={lead.status || 'New Enquiry'}
                                  onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                                  disabled={leadActionLoading}
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                                    lead.status === 'New' || lead.status === 'New Enquiry'
                                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                      : lead.status === 'Contact Attempted' || lead.status === 'Contact Pending'
                                      ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30'
                                      : lead.status === 'Contacted' || lead.status === 'Consultation Scheduled'
                                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                                      : lead.status === 'Follow-up Required'
                                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                      : lead.status === 'Qualified' || lead.status === 'Consultation Completed'
                                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30'
                                      : lead.status === 'In Progress' || lead.status === 'Proposal Pending'
                                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                                      : lead.status === 'Converted' || lead.status === 'Completed'
                                      ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/30'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  <option value="New Enquiry">New Enquiry</option>
                                  <option value="Contact Pending">Contact Pending</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Follow-up Required">Follow-up Required</option>
                                  <option value="Qualified">Qualified</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Converted">Converted</option>
                                  <option value="Closed / Lost">Closed / Lost</option>
                                </select>

                                {lead.priority && (
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded block text-center uppercase tracking-wider ${
                                    lead.priority === 'Urgent' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' :
                                    lead.priority === 'High' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {lead.priority}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenLead(lead)}
                                  className="p-1.5 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:text-gold-500 rounded-lg border border-slate-200 dark:border-navy-800 transition cursor-pointer"
                                  title="Open Full Workspace Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition cursor-pointer"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`mailto:${lead.email}?subject=Regarding Your Consultation - Revival International&body=Dear ${encodeURIComponent(lead.name)},%0D%0A%0D%0AThank you for reaching out to Revival International regarding ${encodeURIComponent(lead.serviceTitle || 'our consulting services')}.%0D%0A%0D%0A`}
                                  className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
                                  title="Send Email"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleArchiveToggle(lead, !lead.isArchived)}
                                  disabled={leadActionLoading}
                                  className="p-1.5 bg-slate-100 dark:bg-navy-950 text-slate-500 hover:text-amber-500 rounded-lg border border-slate-200 dark:border-navy-800 transition cursor-pointer"
                                  title={lead.isArchived ? "Restore Lead" : "Archive Lead"}
                                >
                                  {lead.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id, lead.name)}
                                  className="p-1.5 bg-slate-100 dark:bg-navy-950 text-slate-400 hover:text-rose-500 rounded-lg border border-slate-200 dark:border-navy-800 transition cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-200 dark:border-navy-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Page <strong>{leadPage}</strong> of <strong>{totalPages}</strong> ({filteredLeads.length} leads matching filters)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLeadPage(prev => Math.max(1, prev - 1))}
                        disabled={leadPage <= 1}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-navy-800 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                      <span className="px-2 font-bold font-mono text-slate-700 dark:text-slate-300">{leadPage} / {totalPages}</span>
                      <button
                        type="button"
                        onClick={() => setLeadPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={leadPage >= totalPages}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-navy-800 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

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
                      { serviceId: 'exec-seminars-lang', serviceTitle: 'Executive Seminars & Language Test Preparation', category: 'Test Prep & Executive', total: 0, newCount: 0, awaitingFollowUp: 0, inProgress: 0, converted: 0, conversionRate: 0 }
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
                    <th className="p-3 font-extrabold">NAME</th>
                    <th className="p-3 font-extrabold">ROLE</th>
                    <th className="p-3 font-extrabold">CONTACT INFO</th>
                    <th className="p-3 font-extrabold text-red-600 dark:text-red-400">PASSWORD</th>
                    <th className="p-3 font-extrabold">STATUS</th>
                    <th className="p-3 font-extrabold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center border border-blue-300 dark:border-blue-500/40 text-[11px] shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{emp.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 font-extrabold px-2.5 py-1 rounded-full text-[10px] border border-purple-300 dark:border-purple-500/30">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]" title={emp.email}>{emp.email}</div>
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{emp.phone}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] font-bold text-red-600 dark:text-red-400">
                        <div className="flex items-center gap-2">
                          {visiblePasswords.has(emp.id) ? emp.password : '••••••••'}
                          <button 
                            onClick={() => toggleRowPassword(emp.id)} 
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                          >
                            {visiblePasswords.has(emp.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded text-[10px] border border-emerald-300 dark:border-emerald-500/30">
                          ● {emp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEditClick(emp)} 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition cursor-pointer"
                            title="Edit Employee Account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)} 
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
                  placeholder="e.g. Dhanalakshimi" 
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
                  placeholder="dhana.jasync@gmail.com" 
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
                  placeholder="+91 9876543210" 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Role *</label>
                <select 
                  value={newEmployee.role} 
                  onChange={e=>setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                >
                  {CRM_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
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

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Daily Staff Attendance Tracker (August 05, 2026)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">Real-time check-in logs and work hours tracking for active staff members.</p>
            </div>
            <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-xl border border-blue-300 dark:border-blue-500/30">
              Today: 4 Present • 1 On Leave
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-extrabold">EMPLOYEE</th>
                  <th className="p-3 font-extrabold">ROLE</th>
                  <th className="p-3 font-extrabold">CHECK-IN</th>
                  <th className="p-3 font-extrabold">CHECK-OUT</th>
                  <th className="p-3 font-extrabold">WORK HOURS</th>
                  <th className="p-3 font-extrabold">MODE</th>
                  <th className="p-3 font-extrabold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300 font-medium">
                {attendanceList.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{att.name}</td>
                    <td className="p-3">{att.role}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{att.checkIn}</td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{att.checkOut}</td>
                    <td className="p-3 font-mono font-extrabold text-blue-600 dark:text-blue-400">{att.hours}</td>
                    <td className="p-3 font-bold">{att.mode}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                        att.status === 'Present' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' :
                        att.status === 'Late' ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30' :
                        'bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                      }`}>
                        ● {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVES */}
      {activeTab === 'leaves' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Employee Leave Requests & Approvals
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">Review, approve, or reject employee leave applications.</p>
            </div>
            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-xl border border-amber-300 dark:border-amber-500/30">
              {leaveRequests.filter(r => r.status === 'Pending').length} Pending Approvals
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{req.name}</span>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded">
                      {req.role}
                    </span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-0.5 rounded">
                      {req.type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                    Dates: <span className="text-gold-600 dark:text-gold-400">{req.dates}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Reason: "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateLeaveStatus(req.id, 'Approved', req.name)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateLeaveStatus(req.id, 'Rejected', req.name)}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs flex items-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                    }`}>
                      {req.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPANY */}
      {activeTab === 'company' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm animate-in fade-in">
          <div className="border-b border-slate-200 dark:border-navy-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-gold-500" />
              Company Profile & Corporate Credentials
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">Configure global enterprise settings, headquarters locations, and master authorization passcode key.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setStatusMsg('✓ Company profile & security key updated successfully!'); setTimeout(() => setStatusMsg(''), 4000); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Company Legal Name</label>
              <input 
                type="text" 
                value={companyDetails.name} 
                onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Corporate Domain</label>
              <input 
                type="text" 
                value={companyDetails.domain} 
                onChange={e => setCompanyDetails({...companyDetails, domain: e.target.value})}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Enterprise Registration No.</label>
              <input 
                type="text" 
                value={companyDetails.registrationNo} 
                onChange={e => setCompanyDetails({...companyDetails, registrationNo: e.target.value})}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">AWS S3 Vault Region</label>
              <input 
                type="text" 
                value={companyDetails.s3Region} 
                onChange={e => setCompanyDetails({...companyDetails, s3Region: e.target.value})}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Super Admin Master Key Authorization Passcode</label>
              <input 
                type="text" 
                value={companyDetails.adminKey} 
                onChange={e => setCompanyDetails({...companyDetails, adminKey: e.target.value})}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-amber-800 dark:text-gold-400 font-mono font-bold rounded-xl p-2.5 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button 
                type="submit" 
                className="py-3 px-6 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Corporate Settings
              </button>
            </div>
          </form>
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
                  href={`mailto:${selectedLead.email}?subject=Regarding Your Consultation - Revival International&body=Dear ${encodeURIComponent(selectedLead.name)},%0D%0A%0D%0A`}
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

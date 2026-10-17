import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { CRM_ROLES } from '../data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff,
  Activity, Clock, Calendar, AlertCircle, XCircle, Database, Award, Globe, Server, Settings, Key, Plus, ChevronRight, TrendingUp, UserCheck, Edit,
  MessageSquare, ExternalLink, Inbox, Briefcase, Sparkles, Copy, Send, GraduationCap, Building2, CheckSquare, Tag, Compass
} from 'lucide-react';

export const CrmSuperAdmin = () => {
  const { 
    logAuditAction, 
    leads = [], 
    loadingLeads, 
    fetchLeads,
    updateLead,
    addLeadActivity,
    scheduleLeadFollowUp,
    updateFollowUpStatus,
    clients = [],
    consultingMetrics,
    fetchConsultingMetrics,
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
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActionLoading, setLeadActionLoading] = useState(false);
  const [copiedLeadId, setCopiedLeadId] = useState(null);
  const [leadModalTab, setLeadModalTab] = useState('details'); // 'details' | 'activities' | 'followups'
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
    setLeadModalTab('details');
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      const data = await res.json();
      if (data && data.success && data.lead) {
        setSelectedLead(data.lead);
      }
    } catch (e) {
      console.error('Error fetching lead details:', e);
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

    const matchesStatus = 
      leadStatusFilter === 'all' || 
      lead.status === leadStatusFilter;

    return matchesSearch && matchesService && matchesStatus;
  });

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
                  <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">Live Inbound Stream</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Real-time SQLite Connected
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Website Inquiries & Consultation Leads</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Review and manage all incoming service consultations, admissions requests, and enterprise contact forms submitted through the website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (fetchLeads) fetchLeads();
                    if (fetchConsultingMetrics) fetchConsultingMetrics();
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

            {/* Quick Stream Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-navy-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stream:</span>
              <button
                type="button"
                onClick={() => setLeadServiceFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  leadServiceFilter === 'all'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                All Inquiries ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setLeadServiceFilter('intl-consult')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  leadServiceFilter === 'intl-consult' || leadServiceFilter === 'International Consulting'
                    ? 'bg-gold-500 text-navy-950 shadow-sm ring-2 ring-gold-400 font-extrabold'
                    : 'bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/30 hover:bg-gold-500/20'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>🎓 International Consulting ({consultingMetrics?.totalEnquiries || leads.filter(l => l.serviceId === 'intl-consult' || (l.serviceTitle || '').includes('Consulting')).length})</span>
              </button>
            </div>

            {/* Live Database-Derived KPI Metrics Strip */}
            {consultingMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Enquiries</span>
                  <p className="font-serif text-xl font-extrabold text-slate-900 dark:text-white">{consultingMetrics.totalEnquiries || 0}</p>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Consulting Stream</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">New Inbound</span>
                  <p className="font-serif text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{consultingMetrics.newEnquiries || 0}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Awaiting Contact</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Consultations</span>
                  <p className="font-serif text-xl font-extrabold text-amber-600 dark:text-gold-400">{consultingMetrics.consultationsScheduled || 0}</p>
                  <span className="text-[10px] text-amber-600 dark:text-gold-400 font-bold">Scheduled / Active</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Engagements</span>
                  <p className="font-serif text-xl font-extrabold text-purple-600 dark:text-purple-400">{consultingMetrics.activeEngagements || 0}</p>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">In Progress</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Follow-ups Due</span>
                  <div className="flex items-center gap-1.5">
                    <p className="font-serif text-xl font-extrabold text-rose-600 dark:text-rose-400">{consultingMetrics.followUpsDue || 0}</p>
                    {consultingMetrics.overdueFollowUps > 0 && (
                      <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                        {consultingMetrics.overdueFollowUps} Overdue
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Action Required</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Completed</span>
                  <p className="font-serif text-xl font-extrabold text-teal-600 dark:text-teal-400">{consultingMetrics.completedEngagements || 0}</p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Advisories Concluded</span>
                </div>
              </div>
            )}

            {/* Filters & Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={leadSearchQuery}
                  onChange={e => setLeadSearchQuery(e.target.value)}
                  placeholder="Search by name, ref #, email, phone, country, or track..."
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold"
                />
              </div>

              <div>
                <select
                  value={leadServiceFilter}
                  onChange={e => setLeadServiceFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Services ({leads.length})</option>
                  <option value="intl-consult">🎓 International Consulting</option>
                  <option value="College Admission Assistance">College Admission Assistance</option>
                  <option value="School Student Career Guidance">School Student Career Guidance</option>
                  <option value="Executive Development Seminars">Executive Development Seminars</option>
                  <option value="Study Abroad Visa Guidance">Study Abroad Visa Guidance</option>
                  <option value="Corporate Talent & Leadership Advisory">Corporate Talent & Leadership</option>
                </select>
              </div>

              <div>
                <select
                  value={leadStatusFilter}
                  onChange={e => setLeadStatusFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Pipeline Stages</option>
                  <option value="New Enquiry">New Enquiry</option>
                  <option value="Contact Attempted">Contact Attempted</option>
                  <option value="Consultation Scheduled">Consultation Scheduled</option>
                  <option value="Consultation Completed">Consultation Completed</option>
                  <option value="Proposal or Next Steps Pending">Proposal Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inquiries Table */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Showing {filteredLeads.length} of {leads.length} Enquiries & Leads</span>
              {(leadSearchQuery || leadServiceFilter !== 'all' || leadStatusFilter !== 'all') && (
                <button
                  onClick={() => { setLeadSearchQuery(''); setLeadServiceFilter('all'); setLeadStatusFilter('all'); }}
                  className="text-gold-600 dark:text-gold-400 hover:underline cursor-pointer font-bold"
                >
                  Clear Filters
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
                    : "No inquiries matched your search or filter criteria. Try adjusting your search term."}
                </p>
              </div>
            ) : (
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
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition group">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center border border-gold-500/30 text-xs shrink-0">
                              {(lead.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{lead.name}</p>
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
                              value={lead.status || 'New'}
                              onChange={e => handleUpdateLeadStatus(lead.id, e.target.value)}
                              disabled={leadActionLoading}
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                                lead.status === 'New' || lead.status === 'New Enquiry'
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                  : lead.status === 'Contact Attempted' || lead.status === 'Contacted'
                                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                                  : lead.status === 'Consultation Scheduled'
                                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                  : lead.status === 'Consultation Completed'
                                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30'
                                  : lead.status === 'Proposal or Next Steps Pending'
                                  ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30'
                                  : lead.status === 'In Progress'
                                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                                  : lead.status === 'Completed' || lead.status === 'Converted'
                                  ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/30'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              <option value="New Enquiry">New Enquiry</option>
                              <option value="Contact Attempted">Contact Attempted</option>
                              <option value="Consultation Scheduled">Consultation Scheduled</option>
                              <option value="Consultation Completed">Consultation Completed</option>
                              <option value="Proposal or Next Steps Pending">Proposal Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Closed">Closed</option>
                            </select>

                            {lead.priority && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded block text-center uppercase tracking-wider ${
                                lead.priority === 'Urgent' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' :
                                lead.priority === 'High' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {lead.priority} Priority
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
            )}
          </div>
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
                  <option value="Contact Attempted">Contact Attempted</option>
                  <option value="Consultation Scheduled">Consultation Scheduled</option>
                  <option value="Consultation Completed">Consultation Completed</option>
                  <option value="Proposal or Next Steps Pending">Proposal Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
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

                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Submitted Inquiry Details & Goals</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{selectedLead.message}</p>
                </div>
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

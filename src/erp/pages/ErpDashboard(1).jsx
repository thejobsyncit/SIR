import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { CRM_ROLES } from '../../crm/data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff,
  Activity, Clock, Calendar, AlertCircle, XCircle, Database, Award, Globe, Server, Settings, Key, Plus, ChevronRight, TrendingUp, UserCheck, Edit
} from 'lucide-react';

import { ErpCmsJobs } from '../components/ErpCmsJobs';
import { ErpCmsCandidates } from '../components/ErpCmsCandidates';
import { ErpCmsEmployers } from '../components/ErpCmsEmployers';
import { ErpCmsPages } from '../components/ErpCmsPages';
import { ErpCmsInquiries } from '../components/ErpCmsInquiries';

export const ErpDashboard = ({ adminUser }) => {
  // Local Audit Log function since we aren't using CrmContext
  const logAuditAction = (actionText) => {
    console.log(`[ERP AUDIT LOG] ${new Date().toISOString()}: ${actionText}`);
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'employees' | 'attendance' | 'leaves' | 'company' | 'master'

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

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.id);
    setNewEmployee({
      name: emp.name,
      email: emp.email,
      password: emp.password,
      phone: emp.phone,
      role: emp.role
    });
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
  }, [employees]);

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
    <ScrollReveal>
    <div className="space-y-6 text-xs font-sans max-w-7xl mx-auto">
      
      {/* Super Admin Top Header Navigation Bar - Styled matching Documentation Vault */}
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white p-6 rounded-[2rem] border border-gold-500/20 shadow-luxury space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">The Jobsync • Super Admin Control Gateway</span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Super Admin Panel & Employee Management</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Create employee accounts with assigned roles (Admin, Recruiter, Interviewer, Coordinator). Accounts created here gain instant CRM login access.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Super Admin Rights Active
            </span>
          </div>
        </div>

        {/* Header Tabs Navigation */}
        <div className="flex space-x-3 pt-3 border-t border-slate-200 dark:border-navy-800 font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'employees', label: `Employees (${employees.length})` },
            { id: 'attendance', label: 'Attendance' },
            { id: 'leaves', label: 'Leaves' },
            { id: 'company', label: 'Company' },
            { id: 'master', label: 'Master Data' },
            { id: 'cms-pages', label: 'Website CMS' },
            { id: 'cms-jobs', label: 'Jobs Pipeline' },
            { id: 'cms-candidates', label: 'Candidates Vault' },
            { id: 'cms-employers', label: 'Employers' },
            { id: 'cms-inquiries', label: 'Enquiries' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 shadow-gold-glow'
                  : 'bg-slate-50 dark:bg-navy-900 hover:bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 hover:border-gold-500/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Feedback Banner */}
      {statusMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-gold-500/30 transition-colors p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs uppercase tracking-wider">Total Staff Accounts</span>
                <Users className="w-5 h-5 text-gold-500" />
              </div>
              <p className="font-serif text-4xl font-extrabold text-slate-900 dark:text-white">{employees.length}</p>
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% Authorized Active Accounts
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-gold-500/30 transition-colors p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs uppercase tracking-wider">Security Health</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="font-serif text-4xl font-extrabold text-emerald-400">Optimal</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                256-Bit SSL • JWT Auth Active
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-gold-500/30 transition-colors p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs uppercase tracking-wider">Today's Attendance</span>
                <UserCheck className="w-5 h-5 text-blue-500" />
              </div>
              <p className="font-serif text-4xl font-extrabold text-slate-900 dark:text-white">4 / 5</p>
              <p className="text-[11px] text-blue-400 font-bold">
                80% Staff Present On Duty
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-gold-500/30 transition-colors p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-bold text-xs uppercase tracking-wider">AWS S3 Compliance Vault</span>
                <Database className="w-5 h-5 text-amber-500" />
              </div>
              <p className="font-serif text-4xl font-extrabold text-slate-900 dark:text-white">Connected</p>
              <p className="text-[11px] text-gold-400 font-bold">
                Region: ap-south-1 (Mumbai)
              </p>
            </div>
          </div>

          {/* System Role Distribution Breakdown */}
          <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-8 rounded-[2rem] space-y-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-gold-500" />
              </div>
              Enterprise Role Distribution & Permissions Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Super Admin', count: employees.filter(e => e.role === 'Super Admin').length || 1, desc: 'Full System Control & User Management' },
                { title: 'Placement Coordinator', count: employees.filter(e => e.role === 'Placement Coordinator').length, desc: 'Candidates & Client Alignment' },
                { title: 'DMS Specialist', count: employees.filter(e => e.role === 'DMS').length, desc: 'Document Verification & S3 Vault' },
                { title: 'Application Support', count: employees.filter(e => e.role === 'Application Support').length, desc: 'Candidate Helpdesk & Processing' },
                { title: 'Recruiter / Interviewer', count: employees.filter(e => e.role === 'Recruiter' || e.role === 'Interviewer').length, desc: 'Pipeline & Technical Evaluation' }
              ].map((roleCard, idx) => (
                <div key={idx} className="p-5 bg-slate-50 dark:bg-navy-900/50 rounded-2xl border border-slate-200 dark:border-navy-800 hover:border-gold-500/40 transition-colors space-y-2">
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">{roleCard.title}</span>
                  <p className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">{roleCard.count} Active</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{roleCard.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEES DIRECTORY & ADD EMPLOYEE FORM */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Left 8 Cols: Employee Directory Table */}
          <div className="xl:col-span-8 glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 rounded-[2rem] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Employee Directory</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">Registered system employees with granted CRM portal authorization.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e=>setSearchQuery(e.target.value)} 
                    placeholder="Search employees..." 
                    className="bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-medium"
                  />
                </div>
                <button onClick={() => setEmployees([...employees])} className="p-2 bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:text-gold-400 hover:bg-slate-200 dark:bg-navy-800 rounded-xl border border-slate-300 dark:border-navy-700 transition cursor-pointer" title="Refresh Directory">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900 text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-4 rounded-tl-xl font-extrabold">NAME</th>
                    <th className="p-4 font-extrabold">ROLE</th>
                    <th className="p-4 font-extrabold">CONTACT INFO</th>
                    <th className="p-4 font-extrabold text-rose-400">PASSWORD</th>
                    <th className="p-4 font-extrabold">STATUS</th>
                    <th className="p-4 rounded-tr-xl font-extrabold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-navy-900/60 transition group">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30 text-xs shrink-0 shadow-sm">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{emp.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-full text-[10px] border border-purple-500/30">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]" title={emp.email}>{emp.email}</div>
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{emp.phone}</div>
                      </td>
                      <td className="p-4 font-mono text-[10px] font-bold text-rose-400">
                        <div className="flex items-center gap-2">
                          {visiblePasswords.has(emp.id) ? emp.password : '••••••••'}
                          <button 
                            onClick={() => toggleRowPassword(emp.id)} 
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-300 transition cursor-pointer"
                          >
                            {visiblePasswords.has(emp.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1.5 rounded-lg text-[10px] border border-emerald-500/30">
                          ● {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditClick(emp)} 
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition cursor-pointer"
                            title="Edit Employee Account"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)} 
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
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
          <div className="xl:col-span-4 glass-card bg-white dark:bg-navy-950 border border-gold-500/30 p-6 rounded-[2rem] space-y-4 shadow-luxury h-fit">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-4">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-gold-500" />
                </div>
                {editingEmployeeId ? 'Edit Account' : 'New Account'}
              </span>
              {editingEmployeeId && (
                <button onClick={handleCancelEdit} type="button" className="text-xs font-bold text-slate-500 hover:text-rose-400 transition cursor-pointer bg-rose-500/10 px-3 py-1.5 rounded-lg">Cancel</button>
              )}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newEmployee.name} 
                  onChange={e=>setNewEmployee({...newEmployee, name: e.target.value})} 
                  placeholder="e.g. Dhanalakshimi" 
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors placeholder-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Email ID *</label>
                <input 
                  type="email" 
                  required 
                  value={newEmployee.email} 
                  onChange={e=>{
                    setNewEmployee({...newEmployee, email: e.target.value});
                    if (emailError) setEmailError('');
                  }} 
                  placeholder="dhana.jasync@gmail.com" 
                  className={`w-full bg-slate-50 dark:bg-navy-900 border ${emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-navy-700 focus:border-gold-500'} text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none transition-colors placeholder-slate-600`}
                />
                {emailError && <p className="text-rose-500 text-[10px] font-bold">{emailError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={newEmployee.password} 
                    onChange={e=>setNewEmployee({...newEmployee, password: e.target.value})} 
                    placeholder="Set corporate password" 
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-10 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold-400 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Phone Number</label>
                <input 
                  type="text" 
                  value={newEmployee.phone} 
                  onChange={e=>setNewEmployee({...newEmployee, phone: e.target.value})} 
                  placeholder="+91 9876543210" 
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors placeholder-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Role *</label>
                <select 
                  value={newEmployee.role} 
                  onChange={e=>setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors appearance-none"
                >
                  {CRM_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className={`w-full py-4 text-navy-950 font-extrabold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 mt-6 ${editingEmployeeId ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300' : 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400'}`}
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
        <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                Daily Staff Attendance Tracker (August 05, 2026)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">Real-time check-in logs and work hours tracking for active staff members.</p>
            </div>
            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-xl border border-blue-500/30">
              Today: 4 Present • 1 On Leave
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-900 text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-4 rounded-tl-xl font-extrabold">EMPLOYEE</th>
                  <th className="p-4 font-extrabold">ROLE</th>
                  <th className="p-4 font-extrabold">CHECK-IN</th>
                  <th className="p-4 font-extrabold">CHECK-OUT</th>
                  <th className="p-4 font-extrabold">WORK HOURS</th>
                  <th className="p-4 font-extrabold">MODE</th>
                  <th className="p-4 rounded-tr-xl font-extrabold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300 font-medium">
                {attendanceList.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-navy-900/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{att.name}</td>
                    <td className="p-4">{att.role}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{att.checkIn}</td>
                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">{att.checkOut}</td>
                    <td className="p-4 font-mono font-extrabold text-blue-400">{att.hours}</td>
                    <td className="p-4 font-bold">{att.mode}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border ${
                        att.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        att.status === 'Late' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
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
        <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                Employee Leave Requests
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">Review, approve, or reject employee leave applications.</p>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-xl border border-amber-500/30">
              {leaveRequests.filter(r => r.status === 'Pending').length} Pending Approvals
            </span>
          </div>

          <div className="space-y-4">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-5 bg-slate-50 dark:bg-navy-900/50 rounded-2xl border border-slate-200 dark:border-navy-800 hover:border-gold-500/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{req.name}</span>
                    <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg">
                      {req.role}
                    </span>
                    <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg">
                      {req.type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    Dates: <span className="text-gold-400">{req.dates}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Reason: "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateLeaveStatus(req.id, 'Approved', req.name)}
                        className="py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-extrabold rounded-xl transition cursor-pointer text-xs flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateLeaveStatus(req.id, 'Rejected', req.name)}
                        className="py-2 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 font-extrabold rounded-xl transition cursor-pointer text-xs flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-xs font-extrabold border ${
                      req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
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
        <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm animate-in fade-in">
          <div className="border-b border-slate-200 dark:border-navy-800 pb-4">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Building className="w-4 h-4 text-gold-500" />
              </div>
              Company Profile & Corporate Credentials
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">Configure global enterprise settings, headquarters locations, and master authorization passcode key.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setStatusMsg('✓ Company profile & security key updated successfully!'); setTimeout(() => setStatusMsg(''), 4000); }} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Company Legal Name</label>
              <input 
                type="text" 
                value={companyDetails.name} 
                onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Corporate Domain</label>
              <input 
                type="text" 
                value={companyDetails.domain} 
                onChange={e => setCompanyDetails({...companyDetails, domain: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Enterprise Registration No.</label>
              <input 
                type="text" 
                value={companyDetails.registrationNo} 
                onChange={e => setCompanyDetails({...companyDetails, registrationNo: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">AWS S3 Vault Region</label>
              <input 
                type="text" 
                value={companyDetails.s3Region} 
                onChange={e => setCompanyDetails({...companyDetails, s3Region: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Super Admin Master Key Authorization Passcode</label>
              <input 
                type="text" 
                value={companyDetails.adminKey} 
                onChange={e => setCompanyDetails({...companyDetails, adminKey: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-400 font-mono font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2 pt-4">
              <button 
                type="submit" 
                className="py-4 px-8 bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-5 h-5" /> Save Corporate Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: MASTER DATA */}
      {activeTab === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Master Industry Sectors */}
          <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-gold-500" />
              </div>
              Master Industry Sectors
            </h3>

            <div className="space-y-3">
              {masterSectors.map((sector, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white group transition-colors hover:border-gold-500/30">
                  <span>{sector}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 rounded-lg font-extrabold border border-emerald-500/30">Active</span>
                    <button onClick={() => handleRemoveMasterSector(sector)} className="text-slate-500 hover:text-rose-400 transition cursor-pointer bg-slate-200 dark:bg-navy-800 hover:bg-rose-500/10 p-2 rounded-lg" title="Remove Sector">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMasterSector} className="flex gap-3 pt-4">
              <input 
                type="text" 
                value={newSectorInput}
                onChange={e => setNewSectorInput(e.target.value)}
                placeholder="Add new industry sector..."
                className="flex-1 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button type="submit" className="py-3 px-6 bg-gold-500 text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:bg-gold-400 transition cursor-pointer flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          {/* Master Visa Protocols */}
          <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              Master Visa Protocols
            </h3>

            <div className="space-y-3">
              {masterVisas.map((visa, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white group transition-colors hover:border-gold-500/30">
                  <span>{visa}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] px-3 py-1 rounded-lg font-extrabold border border-blue-500/30">Configured</span>
                    <button onClick={() => handleRemoveMasterVisa(visa)} className="text-slate-500 hover:text-rose-400 transition cursor-pointer bg-slate-200 dark:bg-navy-800 hover:bg-rose-500/10 p-2 rounded-lg" title="Remove Visa Protocol">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMasterVisa} className="flex gap-3 pt-4">
              <input 
                type="text" 
                value={newVisaInput}
                onChange={e => setNewVisaInput(e.target.value)}
                placeholder="Add new visa protocol..."
                className="flex-1 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button type="submit" className="py-3 px-6 bg-blue-600 text-white font-extrabold rounded-xl shadow-md hover:bg-blue-500 transition cursor-pointer flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

        </div>
      )}

      {/* CMS TABS */}
      {activeTab === 'cms-pages' && <ErpCmsPages />}
      {activeTab === 'cms-jobs' && <ErpCmsJobs />}
      {activeTab === 'cms-candidates' && <ErpCmsCandidates />}
      {activeTab === 'cms-employers' && <ErpCmsEmployers />}
      {activeTab === 'cms-inquiries' && <ErpCmsInquiries />}

    </div>
    </ScrollReveal>
  );
};

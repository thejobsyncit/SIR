import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { CRM_ROLES } from '../data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff,
  Activity, Clock, Calendar, AlertCircle, XCircle, Database, Award, Globe, Server, Settings, Key, Plus, ChevronRight, TrendingUp, UserCheck
} from 'lucide-react';

export const CrmSuperAdmin = () => {
  const { logAuditAction } = useCrm();

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
    name: 'SIR Recruitment Enterprise Ltd',
    domain: 'sirrecruitment.com',
    registrationNo: 'REG-2026-DXB-99412',
    headquarters: 'Dubai Silicon Oasis, UAE / Chennai, India',
    s3Region: 'ap-south-1 (Mumbai / AWS Compliant Vault)',
    supportEmail: 'support@sirrecruitment.com',
    adminKey: 'SIR-SUPER-2026'
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

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

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!newEmployee.email || !newEmployee.password) {
      alert('Please provide Email ID and Password for the new employee.');
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

    logAuditAction(`Super Admin created employee account '${createdEmp.email}' under role '${createdEmp.role}'.`);
    setStatusMsg(`✓ Employee Account '${createdEmp.name}' (${createdEmp.role}) created successfully!`);
    
    setNewEmployee({ name: '', email: '', password: '', phone: '', role: 'Recruiter' });
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

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            { id: 'employees', label: `Employees (${employees.length})` },
            { id: 'attendance', label: 'Attendance' },
            { id: 'leaves', label: 'Leaves' },
            { id: 'company', label: 'Company' },
            { id: 'master', label: 'Master Data' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                activeTab === t.id
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-navy-900/80 dark:hover:bg-navy-800 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {t.label}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <th className="p-3 font-extrabold">EMAIL</th>
                    <th className="p-3 font-extrabold">PHONE</th>
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
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">{emp.email}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-300">{emp.phone}</td>
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
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)} 
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                          title="Delete Employee Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 Cols: + Add New Employee Form */}
          <div className="lg:col-span-4 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-sm h-fit">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
              <UserPlus className="w-5 h-5 text-gold-500" />
              + Add New Employee
            </h3>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
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
                  onChange={e=>setNewEmployee({...newEmployee, email: e.target.value})} 
                  placeholder="dhana.jasync@gmail.com" 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                />
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
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Employee Account</span>
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
                <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>{sector}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-extrabold">Active</span>
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
                <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center font-bold text-slate-900 dark:text-white">
                  <span>{visa}</span>
                  <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-extrabold">Configured</span>
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

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { CRM_ROLES } from '../data/mockCrmData';
import { 
  Users, UserPlus, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Mail, Phone, Lock, Search, Filter, Check, Building, FileText, Eye, EyeOff
} from 'lucide-react';

export const CrmSuperAdmin = () => {
  const { logAuditAction } = useCrm();

  const [activeTab, setActiveTab] = useState('employees'); // 'overview' | 'employees' | 'attendance' | 'leaves' | 'company' | 'master'

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
            status: 'Active'
          }));
        }
      } catch (e) { console.error(e); }
    }
    return initialEmployees;
  });

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

  // Sync state changes back to localStorage registeredUsers so any created account can immediately log in!
  const syncToLocalStorage = (updatedEmpList) => {
    const registeredFormat = updatedEmpList.map(e => ({
      name: e.name,
      email: e.email.trim().toLowerCase(),
      password: e.password,
      role: e.role,
      phone: e.phone
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

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Super Admin Top Header Navigation Bar - High Contrast Dual Mode */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 dark:from-[#080e24] dark:to-[#040817] text-white p-6 rounded-3xl border border-navy-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">The Jobsync • Super Admin Control Gateway</span>
            <h1 className="font-serif text-2xl font-bold text-white mt-1">Super Admin Panel & Employee Management</h1>
            <p className="text-slate-300 text-xs">Create employee accounts with assigned roles (Admin, Recruiter, Interviewer, Coordinator). Accounts created here gain instant CRM login access.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Super Admin Rights Active
            </span>
          </div>
        </div>

        {/* Header Tabs Navigation */}
        <div className="flex space-x-2 pt-2 border-t border-navy-800 font-bold overflow-x-auto">
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-navy-900/80 text-slate-200 hover:bg-navy-800 hover:text-white border border-navy-700'
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

      {/* Main Grid: Left Directory Table + Right Add Employee Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Employee Directory Table (High Contrast Light & Dark Mode) */}
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

        {/* Right 4 Cols: + Add New Employee Form (High Contrast Light & Dark Mode) */}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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

    </div>
  );
};

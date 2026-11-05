import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, UserCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  Globe, Compass, GraduationCap, School, Languages, Plane, Calendar, 
  BarChart3, RefreshCw, Search, Filter, Phone, Mail, MessageSquare, 
  CheckSquare, ChevronRight, UserPlus, FileText, TrendingUp, CalendarCheck
} from 'lucide-react';

export const REVIVAL_SERVICES = [
  { id: 'intl-consult', label: 'International Consulting', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'college-adm', label: 'College Admission Assistance', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'school-career', label: 'School Student Career Guidance', icon: Compass, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'intl-adm', label: 'International Admissions', icon: Plane, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { id: 'school-academy', label: 'Academy for School Students', icon: School, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'exec-seminars-lang', label: 'Executive Seminars & Language Training', icon: Languages, color: 'text-rose-500', bg: 'bg-rose-500/10' }
];

export const CrmHrLeadDashboard = () => {
  const { 
    leads = [], 
    loadingLeads, 
    fetchLeads, 
    updateLead, 
    scheduleLeadFollowUp,
    candidates = [],
    setActiveModule,
    setConsultingServiceFilter
  } = useCrm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'operations' | 'attendance' | 'candidates' | 'reports'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [statusMsg, setStatusMsg] = useState('');

  // Team roster for HR Lead monitoring
  const [teamMembers] = useState([
    { id: 'emp-6', name: 'Balavarshini', role: 'HR Operations', assignedLeads: 12, completedTasks: 28, pendingFollowUps: 4, conversionRate: 75, status: 'Active' },
    { id: 'emp-7', name: 'Diviya', role: 'HR Operations', assignedLeads: 14, completedTasks: 31, pendingFollowUps: 2, conversionRate: 80, status: 'Active' },
    { id: 'emp-8', name: 'Chentamilselvi', role: 'HR Operations', assignedLeads: 9, completedTasks: 22, pendingFollowUps: 1, conversionRate: 72, status: 'Active' },
    { id: 'emp-4', name: 'Kishore Kumar', role: 'Recruiter', assignedLeads: 18, completedTasks: 45, pendingFollowUps: 5, conversionRate: 85, status: 'Active' },
    { id: 'emp-5', name: 'Sreeja Nair', role: 'Placement Coordinator', assignedLeads: 16, completedTasks: 38, pendingFollowUps: 3, conversionRate: 88, status: 'Active' }
  ]);

  // Attendance Records
  const [attendanceRecords] = useState([
    { id: 'att-1', name: 'Balavarshini', role: 'HR Operations', checkIn: '08:55 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0 hrs', late: false, leaveBalance: 12 },
    { id: 'att-2', name: 'Diviya', role: 'HR Operations', checkIn: '09:05 AM', checkOut: '06:10 PM', status: 'Present', hours: '9.0 hrs', late: true, leaveBalance: 14 },
    { id: 'att-3', name: 'Chentamilselvi', role: 'HR Operations', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0 hrs', late: false, leaveBalance: 11 },
    { id: 'att-4', name: 'Kishore Kumar', role: 'Recruiter', checkIn: '08:50 AM', checkOut: '06:15 PM', status: 'Present', hours: '9.4 hrs', late: false, leaveBalance: 15 },
    { id: 'att-5', name: 'Sreeja Nair', role: 'Placement Coordinator', checkIn: '09:12 AM', checkOut: '06:15 PM', status: 'Present', hours: '9.0 hrs', late: true, leaveBalance: 10 }
  ]);

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Compute Overall KPI Metrics
  const totalLeads = leads.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const freshLeadsToday = leads.filter(l => (l.createdAt && l.createdAt.startsWith(todayStr)) || l.status === 'New').length;
  const assignedLeads = leads.filter(l => l.assignedEmployee && l.assignedEmployee !== 'Unassigned').length;
  const pendingLeads = leads.filter(l => l.status === 'Contact Pending' || l.status === 'New' || l.status === 'Pending').length;
  const completedLeads = leads.filter(l => l.status === 'Completed' || l.status === 'Consultation Done').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted' || (l.status || '').toLowerCase().includes('convert')).length;
  const overallConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Compute Service-Wise Metrics
  const getServiceStats = (srvId) => {
    const srvLeads = leads.filter(l => {
      const sId = (l.serviceId || '').toLowerCase();
      const title = (l.serviceTitle || '').toLowerCase();
      switch (srvId) {
        case 'intl-consult':
          return sId.includes('consult') || title.includes('international consulting');
        case 'college-adm':
          return sId.includes('college') || title.includes('college admission');
        case 'school-career':
          return sId.includes('career') || title.includes('career guidance');
        case 'intl-adm':
          return (sId.includes('adm') && !sId.includes('college')) || title.includes('international admission');
        case 'school-academy':
          return sId.includes('academy') || title.includes('student academy');
        case 'exec-seminars-lang':
          return sId.includes('seminar') || sId.includes('lang') || title.includes('seminar');
        default:
          return false;
      }
    });

    const srvTotal = srvLeads.length;
    const srvFresh = srvLeads.filter(l => l.status === 'New' || (l.createdAt && l.createdAt.startsWith(todayStr))).length;
    const srvAssigned = srvLeads.filter(l => l.assignedEmployee && l.assignedEmployee !== 'Unassigned').length;
    const srvPending = srvLeads.filter(l => l.status === 'New' || l.status === 'Contact Pending' || l.status === 'Pending').length;
    const srvCompleted = srvLeads.filter(l => l.status === 'Completed' || l.status === 'Consultation Done').length;
    const srvConverted = srvLeads.filter(l => (l.status || '').toLowerCase().includes('convert')).length;
    const srvConvRate = srvTotal > 0 ? Math.round((srvConverted / srvTotal) * 100) : 0;

    return { total: srvTotal, fresh: srvFresh, assigned: srvAssigned, pending: srvPending, completed: srvCompleted, converted: srvConverted, rate: srvConvRate };
  };

  const handleAssignLead = async (leadId, employeeName) => {
    try {
      if (updateLead) {
        await updateLead(leadId, { assignedEmployee: employeeName });
        showNotification(`✓ Lead successfully assigned to ${employeeName}`);
        if (fetchLeads) fetchLeads();
      }
    } catch {
      showNotification('⚠️ Failed to reassign lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      if (updateLead) {
        await updateLead(leadId, { status: newStatus });
        showNotification(`✓ Lead status updated to ${newStatus}`);
        if (fetchLeads) fetchLeads();
      }
    } catch {
      showNotification('⚠️ Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Leadership Console
            </span>
            <span className="text-xs text-slate-400 font-mono">HR-LEAD-HQ</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            HR Lead Operations Dashboard
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Service-wise lead monitoring, team workload allocation, attendance tracking, and candidate conversion analytics.
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 text-xs">
          {[
            { id: 'overview', label: 'Main Dashboard' },
            { id: 'services', label: '6 Services Overview' },
            { id: 'operations', label: 'Operations Monitoring' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'candidates', label: 'Candidate Leads' },
            { id: 'reports', label: 'Reports & Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gold-500 text-navy-950 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
          {statusMsg}
        </div>
      )}

      {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main 7 KPI Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {[
              { label: 'Total Leads', val: totalLeads, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
              { label: "Today's Fresh", val: freshLeadsToday, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
              { label: 'Assigned Leads', val: assignedLeads, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
              { label: 'Pending Leads', val: pendingLeads, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
              { label: 'Completed Leads', val: completedLeads, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
              { label: 'Converted Leads', val: convertedLeads, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20' },
              { label: 'Conversion Rate', val: `${overallConversionRate}%`, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-500/10 border-gold-200 dark:border-gold-500/20' }
            ].map((kpi, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} shadow-sm transition hover:scale-[1.02]`}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block truncate">{kpi.label}</span>
                <span className={`text-xl sm:text-2xl font-extrabold font-mono mt-1 block ${kpi.color}`}>{kpi.val}</span>
              </div>
            ))}
          </div>

          {/* Quick Team Workload Summary & Recent Enquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Team Operations Status (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gold-500" />
                  <span>HR Operations Workload & Performance</span>
                </h3>
                <button onClick={() => setActiveTab('operations')} className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline">
                  View All Team →
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.slice(0, 4).map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800/80 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold flex items-center justify-center border border-gold-500/30">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{member.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Assigned Leads</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{member.assignedLeads}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tasks Done</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{member.completedTasks}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Conversion</span>
                        <span className="font-bold text-gold-500">{member.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 6 Services Glance (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold-500" />
                  <span>6 Services Breakdown</span>
                </h3>
                <button onClick={() => setActiveTab('services')} className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline">
                  Full Grid →
                </button>
              </div>

              <div className="space-y-2">
                {REVIVAL_SERVICES.map(srv => {
                  const SrvIcon = srv.icon;
                  const stats = getServiceStats(srv.id);
                  return (
                    <div key={srv.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-950 transition text-xs">
                      <div className="flex items-center gap-2.5 truncate max-w-[200px]">
                        <SrvIcon className={`w-4 h-4 shrink-0 ${srv.color}`} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{srv.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 font-bold text-slate-700 dark:text-slate-300">
                          {stats.total} Leads
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                          {stats.rate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 6 SERVICES-WISE LEAD OVERVIEW (SEPARATE PANELS) */}
      {activeTab === 'services' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-1">
              Revival International 6 Services — Dedicated Lead Breakdown
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mb-6">
              Each of the six official services is tracked independently with full pipeline visibility from fresh inquiry to final conversion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {REVIVAL_SERVICES.map(srv => {
                const SrvIcon = srv.icon;
                const stats = getServiceStats(srv.id);

                return (
                  <div key={srv.id} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800/90 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gold-500/50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${srv.bg}`}>
                          <SrvIcon className={`w-5 h-5 ${srv.color}`} />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {srv.label}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            Service ID: {srv.id}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400">
                        {stats.rate}% Conv.
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-navy-800 text-center font-mono text-xs">
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Total</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{stats.total}</span>
                      </div>
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Fresh</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{stats.fresh}</span>
                      </div>
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Assigned</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{stats.assigned}</span>
                      </div>
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Pending</span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</span>
                      </div>
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Completed</span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">{stats.completed}</span>
                      </div>
                      <div className="bg-white dark:bg-navy-900 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Converted</span>
                        <span className="font-extrabold text-teal-600 dark:text-teal-400">{stats.converted}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (setConsultingServiceFilter) setConsultingServiceFilter(srv.id);
                        setActiveModule('consulting');
                      }}
                      className="w-full py-2 bg-slate-200/80 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Manage Inquiries & Bookings</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONS MONITORING */}
      {activeTab === 'operations' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Operations KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {[
              { label: 'Total HR Ops Staff', val: teamMembers.filter(m => m.role === 'HR Operations').length, color: 'text-indigo-600' },
              { label: 'Total Leads Assigned', val: teamMembers.reduce((sum, m) => sum + m.assignedLeads, 0), color: 'text-blue-600' },
              { label: 'Pending Follow-Ups', val: teamMembers.reduce((sum, m) => sum + m.pendingFollowUps, 0), color: 'text-amber-600' },
              { label: 'Overdue Follow-Ups', val: 2, color: 'text-rose-600' },
              { label: 'Tasks Completed', val: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0), color: 'text-emerald-600' }
            ].map((kpi, i) => (
              <div key={i} className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">{kpi.label}</span>
                <span className={`text-2xl font-mono font-extrabold mt-1 block ${kpi.color}`}>{kpi.val}</span>
              </div>
            ))}
          </div>

          {/* Employee-Wise Performance Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gold-500" />
              <span>Employee-Wise Operational Performance & Allocation</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3 font-bold">Employee</th>
                    <th className="p-3 font-bold">Assigned Role</th>
                    <th className="p-3 font-bold text-center">Active Leads</th>
                    <th className="p-3 font-bold text-center">Tasks Done</th>
                    <th className="p-3 font-bold text-center">Pending Follow-Ups</th>
                    <th className="p-3 font-bold text-center">Conversion Rate</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {teamMembers.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold flex items-center justify-center text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <span>{emp.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{emp.assignedLeads}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{emp.completedTasks}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{emp.pendingFollowUps}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-gold-500">{emp.conversionRate}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          ● {emp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => showNotification(`Reallocating tasks for ${emp.name}`)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE MONITORING */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Attendance Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {[
              { label: 'Total Present', val: attendanceRecords.filter(a => a.status === 'Present').length, color: 'text-emerald-600' },
              { label: 'Absent', val: attendanceRecords.filter(a => a.status === 'Absent').length, color: 'text-rose-600' },
              { label: 'Late Arrivals', val: attendanceRecords.filter(a => a.late).length, color: 'text-amber-600' },
              { label: 'On Leave', val: attendanceRecords.filter(a => a.status === 'On Leave').length, color: 'text-purple-600' },
              { label: 'Monthly Avg Hours', val: '184 hrs', color: 'text-blue-600' }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block truncate">{stat.label}</span>
                <span className={`text-2xl font-mono font-extrabold mt-1 block ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Attendance Roster Table */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-500" />
              <span>Team Attendance Roster & Daily Hours</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3 font-bold">Employee</th>
                    <th className="p-3 font-bold">Role</th>
                    <th className="p-3 font-bold">Check-In</th>
                    <th className="p-3 font-bold">Check-Out</th>
                    <th className="p-3 font-bold text-center">Today's Hours</th>
                    <th className="p-3 font-bold text-center">Late Arrival</th>
                    <th className="p-3 font-bold text-center">Leave Balance</th>
                    <th className="p-3 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {attendanceRecords.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{att.name}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{att.role}</td>
                      <td className="p-3 font-mono">{att.checkIn}</td>
                      <td className="p-3 font-mono">{att.checkOut}</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{att.hours}</td>
                      <td className="p-3 text-center">
                        {att.late ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                            Late Flag
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">{att.leaveBalance} Days</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${att.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
                          ● {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CANDIDATE & ENQUIRY MANAGEMENT */}
      {activeTab === 'candidates' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Candidate Inquiries & Lead Management
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Assign and reassign leads to HR Operations or Recruiters, update status, and track follow-ups.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate name or email..."
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3 font-bold">Candidate</th>
                    <th className="p-3 font-bold">Service Category</th>
                    <th className="p-3 font-bold">Assigned Staff</th>
                    <th className="p-3 font-bold text-center">Status</th>
                    <th className="p-3 font-bold text-center">Follow-Up Date</th>
                    <th className="p-3 font-bold text-right">Quick Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {leads
                    .filter(l => !searchQuery || (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 15)
                    .map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{lead.name}</p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{lead.email}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                            {lead.serviceTitle || lead.serviceId || 'International Consulting'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                          {lead.assignedEmployee || 'Unassigned'}
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={lead.status || 'New'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none"
                          >
                            {['New', 'Contact Pending', 'Contacted', 'In Progress', 'Completed', 'Converted', 'Closed Lost'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center font-mono">
                          {lead.consultationDate || lead.nextActionDate || 'Pending'}
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={lead.assignedEmployee || ''}
                            onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                            className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="">Reassign to...</option>
                            {teamMembers.map(m => (
                              <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold-500" />
              <span>Service-Wise & Team Conversion Analytics</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Daily, weekly, and monthly conversion ratios across all 6 service lines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REVIVAL_SERVICES.map(srv => {
                const stats = getServiceStats(srv.id);
                return (
                  <div key={srv.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{srv.label}</span>
                      <span className="font-mono font-bold text-gold-500">{stats.rate}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gold-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(stats.rate, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Total: {stats.total}</span>
                      <span>Converted: {stats.converted}</span>
                      <span>Pending: {stats.pending}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


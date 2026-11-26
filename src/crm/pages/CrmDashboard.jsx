import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, Building2, Globe, Briefcase, Award, TrendingUp, Calendar, Clock, 
  DollarSign, ShieldCheck, CheckCircle2, ArrowUpRight, GraduationCap, 
  Compass, BookOpen, AlertCircle, ChevronRight, Phone, MessageSquare, 
  Filter, RefreshCw, CheckSquare, Layers, UserCheck, XCircle, LayoutDashboard, Eye,
  ShieldAlert, Check, X, Lock, Search, Download, Mail, Inbox, ChevronLeft
} from 'lucide-react';
import { RECRUITER_LEADERBOARD, AUDIT_LOGS } from '../data/mockCrmData';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmHrLeadDashboard } from './CrmHrLeadDashboard';
import { CrmRecruiterDashboard } from './CrmRecruiterDashboard';
import { CrmPlacementCoordinatorDashboard } from './CrmPlacementCoordinatorDashboard';
import { CrmHrOperationsDashboard } from './CrmHrOperationsDashboard';
import { CrmInterviewerDashboard } from './CrmInterviewerDashboard';
import { ShiftLateArrivalApprovalSection } from '../components/ShiftLateArrivalApprovalSection';

export const CrmDashboard = () => {
  const { 
    currentRole, 
    crmToken,
    consultingMetrics, 
    fetchConsultingMetrics,
    leadMetrics,
    fetchLeadMetrics,
    serviceBreakdown,
    followUpsSummary,
    fetchFollowUpsSummary,
    setActiveModule,
    updateFollowUpStatus,
    leads = [],
    fetchLeads,
    updateLead,
    employees = [],
    candidates = [],
    clients = [],
    invoices = [],
    interviews = []
  } = useCrm();

  // Admin/Super Admin preview tab for inspecting other role dashboards
  const [adminRoleView, setAdminRoleView] = useState('master');
  const [dateRange, setDateRange] = useState('all');
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // All Leads Directory filter & pagination state
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadServiceFilter, setLeadServiceFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadAssignedFilter, setLeadAssignedFilter] = useState('all');
  const [leadPage, setLeadPage] = useState(1);
  const [leadPageSize, setLeadPageSize] = useState('25');

  const cleanPhoneForWa = (p) => String(p || '').replace(/[^0-9]/g, '');

  const isContactUsLead = (lead) => {
    if (!lead) return false;
    if (lead.serviceId === 'contact_us') return true;
    if (lead.customFields) {
      if (typeof lead.customFields === 'string') {
        return lead.customFields.includes('Contact Us Page');
      }
      if (typeof lead.customFields === 'object') {
        return lead.customFields.source === 'Contact Us Page';
      }
    }
    return false;
  };

  const contactUsLeads = (leads || []).filter(isContactUsLead);

  const filteredLeads = contactUsLeads.filter(lead => {
    const q = leadSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (lead.name || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.phone || '').toLowerCase().includes(q) ||
      (lead.referenceNumber || '').toLowerCase().includes(q) ||
      (lead.company || '').toLowerCase().includes(q);
    const reasonText = (
      (typeof lead.customFields === 'object' && lead.customFields?.reasonForContact) ||
      lead.serviceTitle ||
      ''
    ).toLowerCase();
    const matchesService = leadServiceFilter === 'all' ||
      lead.serviceId === leadServiceFilter ||
      reasonText.includes(leadServiceFilter.toLowerCase());
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    const matchesAssigned = leadAssignedFilter === 'all' ||
      (leadAssignedFilter === 'unassigned' ? !lead.assignedEmployee : lead.assignedEmployee === leadAssignedFilter);
    return matchesSearch && matchesService && matchesStatus && matchesAssigned;
  });

  const paginatedLeads = leadPageSize === 'all'
    ? filteredLeads
    : filteredLeads.slice((leadPage - 1) * Number(leadPageSize), leadPage * Number(leadPageSize));
  const totalPages = leadPageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredLeads.length / Number(leadPageSize)));

  const handleExportLeadsCsv = () => {
    if (!filteredLeads || filteredLeads.length === 0) return;
    const headers = ['Reference ID', 'Name', 'Phone', 'Email', 'Company', 'Service', 'Status', 'Assigned Consultant', 'Created At'];
    const rows = filteredLeads.map(l => [
      l.referenceNumber || l.id,
      l.name || '',
      l.phone || '',
      l.email || '',
      l.company || '',
      l.serviceTitle || l.serviceId || '',
      l.status || '',
      l.assignedEmployee || 'Unassigned',
      l.createdAt || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revival_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (fetchConsultingMetrics) fetchConsultingMetrics();
    if (fetchLeadMetrics) fetchLeadMetrics(dateRange);
    if (fetchFollowUpsSummary) fetchFollowUpsSummary();
  }, [dateRange]);

  // Direct role routing for non-admin roles
  if (currentRole === 'HR Lead') {
    return <CrmHrLeadDashboard />;
  }
  if (currentRole === 'Recruiter') {
    return <CrmRecruiterDashboard />;
  }
  if (currentRole === 'Placement Coordinator') {
    return <CrmPlacementCoordinatorDashboard />;
  }
  if (currentRole === 'HR Operations') {
    return <CrmHrOperationsDashboard />;
  }
  if (currentRole === 'Interviewer') {
    return <CrmInterviewerDashboard />;
  }
  

  // If Super Admin or Admin chose to inspect a role dashboard
  if ((currentRole === 'Super Admin' || currentRole === 'Admin') && adminRoleView !== 'master') {
    return (
      <div className="space-y-4">
        {/* Admin Role Switcher Bar */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Admin Inspection Mode: Previewing {adminRoleView} Dashboard
            </span>
          </div>
          <button
            onClick={() => setAdminRoleView('master')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
          >
            ← Return to Master Executive Dashboard
          </button>
        </div>

        {adminRoleView === 'HR Lead' && <CrmHrLeadDashboard />}
        {adminRoleView === 'Recruiter' && <CrmRecruiterDashboard />}
        {adminRoleView === 'Placement Coordinator' && <CrmPlacementCoordinatorDashboard />}
        {adminRoleView === 'HR Operations' && <CrmHrOperationsDashboard />}
        
      </div>
    );
  }

  const handleRangeChange = async (range) => {
    setDateRange(range);
    setLoadingMetrics(true);
    if (fetchLeadMetrics) await fetchLeadMetrics(range);
    setLoadingMetrics(false);
  };

  const paidRevenue = invoices
    .filter(i => (i.status || '').toLowerCase() === 'paid')
    .reduce((sum, i) => sum + (Number(i.totalUSD || i.amountUSD || 0)), 0);

  const convertedLeadsCount = (leads || []).filter(l => 
    (l.status || '').toLowerCase().includes('convert') || 
    (l.status || '').toLowerCase().includes('complet')
  ).length;

  const scheduledConsultationsCount = (leads || []).filter(l => 
    (l.status || '').toLowerCase().includes('sched') || 
    l.consultationDate
  ).length;

  const widgets = [
    { 
      label: 'Live Active Bookings', 
      val: String((leads || []).length), 
      change: 'Synchronized Real-Time', 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#0d1c3a] dark:to-[#071126] border-slate-200 dark:border-blue-500/40 text-slate-900 dark:text-white',
      valColor: 'text-slate-900 dark:text-blue-300'
    },
    { 
      label: 'Scheduled Consultations', 
      val: String(scheduledConsultationsCount), 
      change: 'Upcoming Advisory Roadmaps', 
      icon: Briefcase, 
      color: 'text-amber-600 dark:text-gold-400',
      badgeBg: 'bg-amber-100 dark:bg-gold-500/20 border-amber-300 dark:border-gold-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#241c09] dark:to-[#120d04] border-slate-200 dark:border-gold-500/40 text-slate-900 dark:text-white',
      valColor: 'text-amber-700 dark:text-gold-400'
    },
    { 
      label: 'Corporate Client Accounts', 
      val: String(clients.length), 
      change: 'Verified Institutional Partners', 
      icon: Building2, 
      color: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#1d0e3d] dark:to-[#0d061c] border-slate-200 dark:border-purple-500/35 text-slate-900 dark:text-white',
      valColor: 'text-purple-800 dark:text-purple-300'
    },
    { 
      label: 'Billed Revenue (USD)', 
      val: `$${paidRevenue.toLocaleString()}`, 
      change: 'Active Invoicing Ledger', 
      icon: DollarSign, 
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#062c1f] dark:to-[#03150e] border-slate-200 dark:border-emerald-500/40 text-slate-900 dark:text-white',
      valColor: 'text-emerald-700 dark:text-emerald-400'
    },
    { 
      label: "Scheduled Interviews", 
      val: String(interviews.length), 
      change: 'Panels & Candidate Meets', 
      icon: Calendar, 
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#09263e] dark:to-[#04121e] border-slate-200 dark:border-cyan-500/35 text-slate-900 dark:text-white',
      valColor: 'text-cyan-800 dark:text-cyan-300'
    },
    { 
      label: 'Talent Pool Candidates', 
      val: String(candidates.length), 
      change: 'Registered Profiles', 
      icon: ShieldCheck, 
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#2e1906] dark:to-[#170c03] border-slate-200 dark:border-amber-500/35 text-slate-900 dark:text-white',
      valColor: 'text-amber-800 dark:text-amber-300'
    },
    { 
      label: 'Follow-Ups Pending', 
      val: String(followUpsSummary?.counts?.totalPending || 0), 
      change: 'Action Required', 
      icon: Clock, 
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#330b18] dark:to-[#1a040b] border-slate-200 dark:border-rose-500/35 text-slate-900 dark:text-white',
      valColor: 'text-rose-800 dark:text-rose-300'
    },
    { 
      label: 'Completed / Converted', 
      val: String(convertedLeadsCount), 
      change: 'Successfully Finalized', 
      icon: CheckCircle2, 
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#082d1a] dark:to-[#03170c] border-slate-200 dark:border-emerald-500/40 text-slate-900 dark:text-white',
      valColor: 'text-emerald-700 dark:text-emerald-400'
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Banner */}
      <ScrollReveal>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-[#101b38] dark:via-[#0b1328] dark:to-[#060a17] p-6 rounded-3xl border-2 border-slate-200 dark:border-gold-500/40 shadow-sm">
        <div>
          <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-amber-300 dark:border-gold-500/30">
            Enterprise Command Center
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-1">
            Executive Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Viewing real-time metrics under active role: <strong className="text-amber-800 dark:text-gold-400 font-bold">{currentRole}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-ping"></span>
            Real-Time Sync Active
          </span>
        </div>
      </div>
      </ScrollReveal>

      {/* EXECUTIVE SHIFT LATE ARRIVAL APPROVALS (SUPER ADMIN / ADMIN PRIORITY BANNER) */}
      {(currentRole === 'Super Admin' || currentRole === 'Admin') && (
        <ScrollReveal>
          <ShiftLateArrivalApprovalSection
            currentRole={currentRole}
            crmToken={crmToken}
            onAuditClick={() => setActiveModule('super-admin')}
          />
        </ScrollReveal>
      )}

      {/* KPI Widgets Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {widgets.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className={`glass-card p-4 sm:p-5 rounded-2xl space-y-2.5 border-2 transition-all duration-300 hover:scale-[1.01] shadow-xs ${w.cardStyle}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-950 dark:text-slate-100 uppercase tracking-wider">{w.label}</span>
                <div className={`p-1.5 rounded-xl border ${w.badgeBg}`}>
                  <Icon className={`w-4 h-4 ${w.color}`} />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${w.valColor}`}>{w.val}</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                <span>{w.change}</span>
              </p>
            </div>
          );
        })}
      </div>
      </ScrollReveal>

      {/* PHASE 12: ADMIN DASHBOARD, LEAD MANAGEMENT & CUSTOMER TRACKING SYSTEM */}
      <ScrollReveal>
      <div className="glass-card bg-white dark:bg-gradient-to-r dark:from-[#061126] dark:via-[#0a1936] dark:to-[#071329] border border-slate-200 dark:border-gold-500/35 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-6 w-full max-w-full overflow-hidden box-border">
        
        {/* Header & Date Range Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-5">
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Phase 12 • Enterprise Lead Tracking & Metrics
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SQLite Live Sync
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex flex-wrap items-center gap-2 break-words">
              <Layers className="w-6 h-6 text-gold-500 shrink-0" />
              <span>Customer Enquiries & Lead Lifecycle Intelligence</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Real-time audit across all 6 verified service catalogs, student advising funnels, follow-up queues, and conversion tracking.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Period:
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                disabled={loadingMetrics}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateRange === r.id
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-navy-900'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => handleRangeChange(dateRange)}
              className="p-1.5 text-slate-500 hover:text-gold-500 transition cursor-pointer"
              title="Refresh Live Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin text-gold-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Alert Banner for Overdue / Today Follow-ups */}
        {(leadMetrics?.overdueFollowUps > 0 || leadMetrics?.dueTodayFollowUps > 0) && (
          <div className="p-4 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-xs text-rose-700 dark:text-rose-300">
                  Customer Follow-Up Action Required
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  {leadMetrics.overdueFollowUps > 0 && <span className="font-extrabold text-rose-600 dark:text-rose-400">{leadMetrics.overdueFollowUps} Overdue Follow-up{leadMetrics.overdueFollowUps > 1 ? 's' : ''} </span>}
                  {leadMetrics.overdueFollowUps > 0 && leadMetrics.dueTodayFollowUps > 0 && '• '}
                  {leadMetrics.dueTodayFollowUps > 0 && <span className="font-extrabold text-amber-600 dark:text-amber-400">{leadMetrics.dueTodayFollowUps} Due Today</span>}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModule('super-admin')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
            >
              <span>Manage Due Follow-ups</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Real SQLite 8-Metric Lifecycle Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
            <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">
              {leadMetrics?.totalEnquiries || 0}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Inbound Received</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">New Enquiries</span>
            <p className="font-serif text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {leadMetrics?.newEnquiries || 0}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Uncontacted</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Contact Pending</span>
            <p className="font-serif text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {leadMetrics?.contactPending || 0}
            </p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Outreach Attempted</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Awaiting Action</span>
            <p className="font-serif text-2xl font-extrabold text-amber-600 dark:text-gold-400">
              {leadMetrics?.awaitingFollowUp || 0}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-gold-400 font-bold">Follow-up Due</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">In Progress</span>
            <p className="font-serif text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {leadMetrics?.inProgress || 0}
            </p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Active Advising</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Qualified</span>
            <p className="font-serif text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {leadMetrics?.qualified || 0}
            </p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Eligible & Ready</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Converted</span>
            <div className="flex items-baseline gap-1">
              <p className="font-serif text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {leadMetrics?.converted || 0}
              </p>
              {leadMetrics?.conversionRate > 0 && (
                <span className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400">
                  ({leadMetrics.conversionRate}%)
                </span>
              )}
            </div>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Enrolled / Placed</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Closed / Lost</span>
            <p className="font-serif text-2xl font-extrabold text-slate-500 dark:text-slate-400">
              {leadMetrics?.closedLost || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Archived</p>
          </div>
        </div>

        {/* Contact Us Enquiries Directory */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-gold-500" />
              Contact Us Enquiries ({filteredLeads.length})
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Showing {paginatedLeads.length} of {filteredLeads.length} filtered Contact Us inquiries ({contactUsLeads.length} total)
            </span>
          </div>

          {/* Search & Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200 dark:border-navy-800">
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
                <option value="all">All Reasons ({contactUsLeads.length})</option>
                <option value="Attract & Retain the Best Talents">Attract &amp; Retain the Best Talents</option>
                <option value="Request a Direct Callback">Request a Direct Callback</option>
                <option value="Corporate Recruitment Enquiry">Corporate Recruitment Enquiry</option>
                <option value="Submit a Partnership Proposal">Submit a Partnership Proposal</option>
                <option value="Schedule an Office Visit">Schedule an Office Visit</option>
                <option value="Study Abroad Consultation">Study Abroad Consultation</option>
                <option value="Visa & Verification Enquiry">Visa &amp; Verification Enquiry</option>
                <option value="Job Application Support">Job Application Support</option>
                <option value="General Enquiry">General Enquiry</option>
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
                value={leadAssignedFilter}
                onChange={e => { setLeadAssignedFilter(e.target.value); setLeadPage(1); }}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
              >
                <option value="all">All Consultants</option>
                <option value="unassigned">Unassigned</option>
                {(employees || []).map(emp => (
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
                onClick={handleExportLeadsCsv}
                className="flex-1 px-2.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                title="Export filtered leads to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-slate-50 dark:bg-navy-950/50 rounded-2xl border border-dashed border-slate-300 dark:border-navy-800">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-serif text-sm font-bold text-slate-700 dark:text-slate-300">No Enquiries Found</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                No inquiries matched your current filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                      <th className="p-3 font-extrabold whitespace-nowrap">Reference ID</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Full Name</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Phone Number</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Email Address</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Reason for Contact</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Company</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Assigned Consultant</th>
                      <th className="p-3 font-extrabold whitespace-nowrap">Status & Priority</th>
                      <th className="p-3 font-extrabold text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                    {paginatedLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-3 whitespace-nowrap font-mono text-xs font-bold text-gold-600 dark:text-gold-400">
                          {lead.referenceNumber || (lead.id ? `#${lead.id.slice(0, 8)}` : '—')}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center border border-gold-500/30 text-xs shrink-0">
                              {(lead.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{lead.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                {lead.organizationName || lead.company || 'Individual / Student'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-xs">
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${cleanPhoneForWa(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1.5 transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{lead.phone}</span>
                            </a>
                          ) : '—'}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-gold-500 flex items-center gap-1.5 truncate max-w-[180px] transition"
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </a>
                          ) : '—'}
                        </td>
                        <td className="p-3">
                          <span className="inline-block bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border border-blue-300 dark:border-blue-500/30">
                            {(typeof lead.customFields === 'object' && lead.customFields?.reasonForContact) || lead.serviceTitle || 'General Enquiry'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                            {lead.company || lead.organizationName || (typeof lead.customFields === 'object' && lead.customFields?.company) || '—'}
                          </p>
                        </td>
                        <td className="p-3">
                          <select
                            value={lead.assignedEmployee || ''}
                            onChange={async (e) => {
                              const emp = e.target.value;
                              if (updateLead) await updateLead(lead.id, { assignedEmployee: emp });
                              if (fetchLeads) fetchLeads();
                            }}
                            className="text-[10px] font-bold bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white px-2 py-1 rounded-xl focus:outline-none cursor-pointer max-w-[130px]"
                          >
                            <option value="">Unassigned</option>
                            {(employees || []).map(emp => (
                              <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={lead.status || 'New Enquiry'}
                            onChange={async (e) => {
                              if (updateLead) await updateLead(lead.id, { status: e.target.value });
                              if (fetchLeads) fetchLeads();
                            }}
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-navy-950 border-slate-300 dark:border-navy-700 text-slate-800 dark:text-white cursor-pointer"
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
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setActiveModule('consulting')}
                            className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-slate-500">Page <strong>{leadPage}</strong> of <strong>{totalPages}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLeadPage(p => Math.max(1, p - 1))}
                      disabled={leadPage <= 1}
                      className="px-3 py-1 rounded-xl border border-slate-300 dark:border-navy-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadPage(p => Math.min(totalPages, p + 1))}
                      disabled={leadPage >= totalPages}
                      className="px-3 py-1 rounded-xl border border-slate-300 dark:border-navy-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </ScrollReveal>

      {/* Analytics & Leaderboard Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recruiter Leaderboard */}
        <div className="lg:col-span-6 glass-card bg-white dark:bg-gradient-to-b dark:from-[#0d162d] dark:to-[#070c1a] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              Monthly Recruiter Leaderboard
            </h3>
            <span className="text-xs text-amber-700 dark:text-gold-400 font-extrabold">Top Headhunters</span>
          </div>

          <div className="space-y-3 text-xs">
            {RECRUITER_LEADERBOARD.map(r => (
              <div key={r.rank} className="p-3.5 bg-slate-50 dark:bg-[#070c1a] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded-full font-extrabold flex items-center justify-center text-xs border ${
                    r.rank === 1 
                      ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border-gold-500/40' 
                      : r.rank === 2
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      : 'bg-amber-100 dark:bg-amber-800/20 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700/40'
                  }`}>
                    #{r.rank}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{r.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{r.placements} Candidates Placed</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-xs">${r.revenueUSD.toLocaleString()} USD</p>
                  <p className="text-[10px] text-amber-800 dark:text-gold-400 font-bold">{r.targetPct}% of Target</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="lg:col-span-6 glass-card bg-white dark:bg-gradient-to-b dark:from-[#0d162d] dark:to-[#070c1a] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 text-xs shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" />
              Security & Activity Audit Log
            </h3>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">Live Stream</span>
          </div>

          <div className="space-y-3">
            {AUDIT_LOGS.map((log, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#070c1a] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-amber-800 dark:text-gold-400">{log.user} ({log.role})</span>
                  <span className="font-medium">{log.timestamp}</span>
                </div>
                <p className="text-slate-900 dark:text-slate-200 font-semibold text-xs">{log.action}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">IP: {log.ip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      </ScrollReveal>

    </div>
  );
};

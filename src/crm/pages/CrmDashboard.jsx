import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, Building2, Globe, Briefcase, Award, TrendingUp, Calendar, Clock, 
  DollarSign, ShieldCheck, CheckCircle2, ArrowUpRight, GraduationCap, 
  Compass, BookOpen, AlertCircle, ChevronRight, Phone, MessageSquare, 
  Filter, RefreshCw, CheckSquare, Layers, UserCheck, XCircle 
} from 'lucide-react';
import { RECRUITER_LEADERBOARD, AUDIT_LOGS } from '../data/mockCrmData';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmDashboard = () => {
  const { 
    currentRole, 
    consultingMetrics, 
    fetchConsultingMetrics,
    leadMetrics,
    fetchLeadMetrics,
    serviceBreakdown,
    followUpsSummary,
    fetchFollowUpsSummary,
    setActiveModule,
    updateFollowUpStatus,
    leads,
    fetchLeads
  } = useCrm();

  const [dateRange, setDateRange] = useState('all');
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    if (fetchConsultingMetrics) fetchConsultingMetrics();
    if (fetchLeadMetrics) fetchLeadMetrics(dateRange);
    if (fetchFollowUpsSummary) fetchFollowUpsSummary();
  }, [dateRange]);

  const handleRangeChange = async (range) => {
    setDateRange(range);
    setLoadingMetrics(true);
    if (fetchLeadMetrics) await fetchLeadMetrics(range);
    setLoadingMetrics(false);
  };

  const widgets = [
    { 
      label: 'Total Database Candidates', 
      val: '54,210', 
      change: '+12% this month', 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#0d1c3a] dark:to-[#071126] border-slate-200 dark:border-blue-500/40 text-slate-900 dark:text-white',
      valColor: 'text-slate-900 dark:text-blue-300'
    },
    { 
      label: 'Active Open Mandates', 
      val: '340', 
      change: '142 Domestic / 198 Overseas', 
      icon: Briefcase, 
      color: 'text-amber-600 dark:text-gold-400',
      badgeBg: 'bg-amber-100 dark:bg-gold-500/20 border-amber-300 dark:border-gold-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#241c09] dark:to-[#120d04] border-slate-200 dark:border-gold-500/40 text-slate-900 dark:text-white',
      valColor: 'text-amber-700 dark:text-gold-400'
    },
    { 
      label: 'Corporate Client Accounts', 
      val: '520', 
      change: 'UAE, KSA, Qatar, EU', 
      icon: Building2, 
      color: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#1d0e3d] dark:to-[#0d061c] border-slate-200 dark:border-purple-500/35 text-slate-900 dark:text-white',
      valColor: 'text-purple-800 dark:text-purple-300'
    },
    { 
      label: 'Monthly Revenue (USD)', 
      val: '$485,000', 
      change: '+18.4% YoY', 
      icon: DollarSign, 
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#062c1f] dark:to-[#03150e] border-slate-200 dark:border-emerald-500/40 text-slate-900 dark:text-white',
      valColor: 'text-emerald-700 dark:text-emerald-400'
    },
    { 
      label: "Today's Panel Interviews", 
      val: '28', 
      change: '8 Teams / 12 Zoom / 8 In-Person', 
      icon: Calendar, 
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-300 dark:border-cyan-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#09263e] dark:to-[#04121e] border-slate-200 dark:border-cyan-500/35 text-slate-900 dark:text-white',
      valColor: 'text-cyan-800 dark:text-cyan-300'
    },
    { 
      label: 'Visa Applications in Progress', 
      val: '84', 
      change: '34 UAE / 28 KSA / 22 Qatar', 
      icon: ShieldCheck, 
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#2e1906] dark:to-[#170c03] border-slate-200 dark:border-amber-500/35 text-slate-900 dark:text-white',
      valColor: 'text-amber-800 dark:text-amber-300'
    },
    { 
      label: 'Background Checks Pending', 
      val: '19', 
      change: '6-Point Verification', 
      icon: Clock, 
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/30',
      cardStyle: 'bg-white dark:bg-gradient-to-br dark:from-[#330b18] dark:to-[#1a040b] border-slate-200 dark:border-rose-500/35 text-slate-900 dark:text-white',
      valColor: 'text-rose-800 dark:text-rose-300'
    },
    { 
      label: 'Placements Joined This Month', 
      val: '32', 
      change: '78.4% Acceptance Rate', 
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-[#101b38] dark:via-[#0b1328] dark:to-[#060a17] p-6 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Enterprise Command Center</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Executive Performance Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">Viewing real-time metrics under active role: <strong className="text-amber-700 dark:text-gold-400 font-bold">{currentRole}</strong></p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-ping"></span>
            Real-Time Sync Active
          </span>
        </div>
      </div>
      </ScrollReveal>

      {/* KPI Widgets Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className={`glass-card p-5 rounded-2xl space-y-2.5 border transition-all duration-300 hover:scale-[1.02] shadow-sm ${w.cardStyle}`}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{w.label}</span>
                <div className={`p-2 rounded-xl border ${w.badgeBg}`}>
                  <Icon className={`w-4 h-4 ${w.color}`} />
                </div>
              </div>
              <div className={`font-serif text-3xl font-extrabold tracking-tight ${w.valColor}`}>{w.val}</div>
              <p className="text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{w.change}</span>
              </p>
            </div>
          );
        })}
      </div>
      </ScrollReveal>

      {/* PHASE 12: ADMIN DASHBOARD, LEAD MANAGEMENT & CUSTOMER TRACKING SYSTEM */}
      <ScrollReveal>
      <div className="glass-card bg-white dark:bg-gradient-to-r dark:from-[#061126] dark:via-[#0a1936] dark:to-[#071329] border border-slate-200 dark:border-gold-500/35 p-6 rounded-3xl shadow-sm space-y-6">
        
        {/* Header & Date Range Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Phase 12 • Enterprise Lead Tracking & Metrics
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SQLite Live Sync
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-gold-500" />
              Customer Enquiries & Lead Lifecycle Intelligence
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Real-time audit across all 6 verified service catalogs, student advising funnels, follow-up queues, and conversion tracking.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200 dark:border-navy-800 shrink-0">
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

        {/* Master Service Performance Breakdown Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gold-500" />
              Service-Wise Enquiry Breakdown & Conversion Rates
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Data synchronized from SQLite leads table across 6 Academic Catalogs
            </span>
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
                          setActiveModule('super-admin');
                        }}
                        className="px-2.5 py-1 bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 rounded-lg font-bold text-[10px] hover:opacity-90 transition cursor-pointer flex items-center gap-1 ml-auto"
                        title={`Open leads for ${srv.serviceTitle}`}
                      >
                        <span>View Leads</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

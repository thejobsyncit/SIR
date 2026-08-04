import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Users, Building2, Globe, Briefcase, Award, TrendingUp, Calendar, Clock, DollarSign, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { RECRUITER_LEADERBOARD, AUDIT_LOGS } from '../data/mockCrmData';

export const CrmDashboard = () => {
  const { currentRole } = useCrm();

  const widgets = [
    { label: 'Total Database Candidates', val: '54,210', change: '+12% this month', icon: Users, color: 'text-blue-400' },
    { label: 'Active Open Mandates', val: '340', change: '142 Domestic / 198 Overseas', icon: Briefcase, color: 'text-gold-400' },
    { label: 'Corporate Client Accounts', val: '520', change: 'UAE, KSA, Qatar, EU', icon: Building2, color: 'text-purple-400' },
    { label: 'Monthly Revenue (USD)', val: '$485,000', change: '+18.4% YoY', icon: DollarSign, color: 'text-emerald-400' },
    { label: "Today's Panel Interviews", val: '28', change: '8 Teams / 12 Zoom / 8 In-Person', icon: Calendar, color: 'text-cyan-400' },
    { label: 'Visa Applications in Progress', val: '84', change: '34 UAE / 28 KSA / 22 Qatar', icon: ShieldCheck, color: 'text-amber-400' },
    { label: 'Background Checks Pending', val: '19', change: '6-Point Verification', icon: Clock, color: 'text-rose-400' },
    { label: 'Placements Joined This Month', val: '32', change: '78.4% Acceptance Rate', icon: CheckCircle2, color: 'text-emerald-500' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Enterprise Command Center</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Executive Performance Dashboard</h1>
          <p className="text-xs text-slate-400">Viewing real-time metrics under active role: <strong className="text-gold-400">{currentRole}</strong></p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            Real-Time Sync Active
          </span>
        </div>
      </div>

      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className="glass-card bg-navy-900 border border-navy-800 p-5 rounded-2xl space-y-2 hover:border-gold-500/40 transition">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{w.label}</span>
                <Icon className={`w-5 h-5 ${w.color}`} />
              </div>
              <div className="font-serif text-2xl font-extrabold text-white">{w.val}</div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>{w.change}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recruiter Leaderboard */}
        <div className="lg:col-span-6 glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-navy-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              Monthly Recruiter Leaderboard
            </h3>
            <span className="text-xs text-gold-400 font-bold">Top Headhunters</span>
          </div>

          <div className="space-y-3 text-xs">
            {RECRUITER_LEADERBOARD.map(r => (
              <div key={r.rank} className="p-3 bg-navy-950 rounded-xl border border-navy-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center text-xs">#{r.rank}</span>
                  <div>
                    <p className="font-bold text-white">{r.name}</p>
                    <p className="text-[10px] text-slate-400">{r.placements} Placements Placed</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-emerald-400">${r.revenueUSD.toLocaleString()} USD</p>
                  <p className="text-[10px] text-gold-400 font-bold">{r.targetPct}% of Target</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="lg:col-span-6 glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-navy-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" />
              Security & Activity Audit Log
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Stream</span>
          </div>

          <div className="space-y-3">
            {AUDIT_LOGS.map((log, idx) => (
              <div key={idx} className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-gold-400">{log.user} ({log.role})</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-slate-200 font-medium">{log.action}</p>
                <p className="text-[10px] text-slate-500 font-mono">IP: {log.ip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

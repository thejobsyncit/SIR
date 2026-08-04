import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Users, Building2, Globe, Briefcase, Award, TrendingUp, Calendar, Clock, DollarSign, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { RECRUITER_LEADERBOARD, AUDIT_LOGS } from '../data/mockCrmData';

export const CrmDashboard = () => {
  const { currentRole } = useCrm();

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

      {/* KPI Widgets Grid */}
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

      {/* Analytics & Leaderboard Grid */}
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

    </div>
  );
};

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  AlertCircle, Clock, Bell, CheckCircle2, ArrowRight, 
  Send, ShieldAlert, Sparkles, User, ExternalLink 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerReminders = () => {
  const { setActiveModule } = useCrm();
  const [reminders, setReminders] = useState([
    {
      id: 'REM-301',
      candidateName: 'Ananya Sundaram',
      role: 'Civil Project Planning Lead',
      interviewConducted: 'Yesterday • 04:00 PM',
      hoursLeft: '8 Hours Left',
      slaDeadline: 'Today by 04:00 PM (24h Policy)',
      priority: 'Urgent SLA Warning',
      nudgedBy: 'Priya Lead (HR Lead)',
      round: 'Technical Evaluation Round'
    },
    {
      id: 'REM-302',
      candidateName: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      interviewConducted: 'Upcoming Today • 05:30 PM',
      hoursLeft: 'Pre-Session Alert',
      slaDeadline: 'Tomorrow 05:30 PM',
      priority: 'Upcoming Session Reminder',
      nudgedBy: 'Automated Calendar Bot',
      round: 'Round 1 Core Coding'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #9
              </span>
              <span className="text-[10px] font-mono text-slate-400">24H SLA COMPLIANCE ENGINE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Evaluation & Feedback Reminders
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Active SLA countdown timers for conducted interviews, coordinator nudges, and pending scorecard alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-300">
              ● 1 Scorecard Nearing SLA
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Feedback</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">1</p>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 block">↗ 8 Hours Remaining</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SLA Adherence Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">94.8%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Submitted within 24h</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Average Turnaround</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">4.2 Hrs</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Industry leading benchmark</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Active Alert Channels</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">Email & Slack</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Instant Push Notifications</span>
          </div>
        </div>

        {/* Actionable Reminders List */}
        <div className="space-y-4">
          {reminders.map(rem => (
            <div 
              key={rem.id} 
              className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{rem.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rem.priority.includes('Urgent')
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                  }`}>
                    {rem.priority}
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-gold-400 font-bold">
                    ⏳ {rem.hoursLeft}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {rem.candidateName}
                </h3>
                <p className="text-xs text-amber-700 dark:text-gold-400 font-semibold">
                  {rem.role} • {rem.round}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Conducted: {rem.interviewConducted} • <strong>Deadline: {rem.slaDeadline}</strong>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Triggered by: {rem.nudgedBy}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setActiveModule('int-evaluation');
                    showToast(`Opening evaluation scorecard for ${rem.candidateName}`);
                  }}
                  className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  Complete Evaluation Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerReminders;


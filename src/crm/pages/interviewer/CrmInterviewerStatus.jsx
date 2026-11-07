import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, Calendar, 
  RefreshCw, User, ShieldAlert, ArrowRight 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerStatus = () => {
  const [sessions, setSessions] = useState([
    {
      id: 'INT-901',
      candidateName: 'Rohan Deshmukh',
      role: 'Senior Cloud Infrastructure Architect',
      round: 'Round 2 System Architecture',
      scheduledSlot: 'Today • 03:00 PM',
      currentStatus: 'Scheduled',
      statusNote: 'Candidate confirmed attendance via email.'
    },
    {
      id: 'INT-902',
      candidateName: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      round: 'Round 1 Core Coding',
      scheduledSlot: 'Today • 05:30 PM',
      currentStatus: 'Scheduled',
      statusNote: 'Google Meet link delivered.'
    },
    {
      id: 'INT-903',
      candidateName: 'Mohammed Tariq',
      role: 'DevOps & CI/CD Specialist',
      round: 'Round 2 Technical',
      scheduledSlot: 'Yesterday • 04:00 PM',
      currentStatus: 'Completed',
      statusNote: 'Interview conducted successfully. 60 mins duration.'
    },
    {
      id: 'INT-904',
      candidateName: 'Kavitha Rangarajan',
      role: 'Cloud Security Analyst',
      round: 'Round 1 Technical',
      scheduledSlot: 'Yesterday • 11:30 AM',
      currentStatus: 'Absent / No-Show',
      statusNote: 'Candidate did not join meeting room after 15 mins grace period.'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, currentStatus: newStatus } : s));
    showToast(`✓ Interview session ${id} status updated to [${newStatus}].`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #8
              </span>
              <span className="text-[10px] font-mono text-slate-400">SESSION LIFECYCLE MANAGEMENT</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Interview Attendance & Status Tracker
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Mark live session outcomes: Scheduled, Completed, Absent / No-Show, Rescheduled, or Cancelled with instant coordinator sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-700 dark:text-blue-300">
              ● Real-time Sync Active
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Scheduled Active</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2 Panels</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Scheduled for Today</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Completed Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">18</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Feedback Submitted</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">No-Shows / Absent</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">1</p>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 block">↗ Grace Period Expired</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Reschedule Requests</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">0 Pending</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Calendar Clear</span>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Active & Recent Interview Sessions</span>
            <span className="text-xs text-slate-500 font-mono">{sessions.length} recorded interviews</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Interview ID & Candidate</th>
                  <th className="p-4 font-bold">Target Role & Round</th>
                  <th className="p-4 font-bold">Scheduled Time</th>
                  <th className="p-4 font-bold text-center">Current Status</th>
                  <th className="p-4 font-bold text-right">Quick Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{s.candidateName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{s.id}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.statusNote}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.role}</p>
                      <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">{s.round}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {s.scheduledSlot}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.currentStatus === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                          : s.currentStatus === 'Scheduled'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                          : s.currentStatus.includes('Absent')
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                      }`}>
                        {s.currentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={s.currentStatus}
                        onChange={e => handleUpdateStatus(s.id, e.target.value)}
                        className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Mark Completed</option>
                        <option value="Absent / No-Show">Mark Absent</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerStatus;


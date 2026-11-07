import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Calendar, Clock, Video, Phone, Mail, User, 
  MapPin, CheckCircle2, ChevronRight, ExternalLink, CalendarCheck 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerSchedule = () => {
  const [selectedDay, setSelectedDay] = useState('Today');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const scheduleSlots = [
    {
      id: 'SLOT-1',
      time: '03:00 PM - 04:00 PM',
      duration: '60 Mins',
      candidateName: 'Rohan Deshmukh',
      role: 'Senior Cloud Infrastructure Architect',
      round: 'Round 2: Technical & Architecture Design',
      mode: 'Google Meet (Video Conference)',
      meetingUrl: 'https://meet.google.com/qam-revival-tech',
      coordinator: { name: 'Divya Sharma', role: 'Placement Lead', phone: '+91 98765 43210', email: 'divya.s@revivalcrm.com' },
      status: 'Ready to Start'
    },
    {
      id: 'SLOT-2',
      time: '05:30 PM - 06:30 PM',
      duration: '60 Mins',
      candidateName: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      round: 'Round 1: Coding & Real-world Problem Solving',
      mode: 'Google Meet (Video Conference)',
      meetingUrl: 'https://meet.google.com/dxf-eng-interviews',
      coordinator: { name: 'Divya Sharma', role: 'Placement Lead', phone: '+91 98765 43210', email: 'divya.s@revivalcrm.com' },
      status: 'Confirmed'
    },
    {
      id: 'SLOT-3',
      time: 'Tomorrow • 11:00 AM - 12:00 PM',
      duration: '60 Mins',
      candidateName: 'Mohammed Tariq',
      role: 'DevOps & CI/CD Specialist',
      round: 'Round 2: Infrastructure as Code & Reliability',
      mode: 'Microsoft Teams',
      meetingUrl: 'https://teams.microsoft.com/l/meetup-join/revival-cloud',
      coordinator: { name: 'Priya Lead', role: 'HR Lead', phone: '+91 98765 12345', email: 'priya.lead@revivalcrm.com' },
      status: 'Confirmed'
    }
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #4
              </span>
              <span className="text-[10px] font-mono text-slate-400">PANEL TIMELINE & DISPATCH</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Interview Schedule and Session Details
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Synchronized panel slots, one-click video room access, meeting agendas, and dedicated coordinator emergency contacts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => showToast('✓ Calendar synchronized with Google Workspace / Outlook successfully.')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              Sync with Outlook / GCal
            </button>
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Sessions Today</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2 Sessions</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Total 120 Minutes Allocated</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">This Week's Panels</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">6 Panels</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ 4 Tech • 2 Managerial</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Attendance Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">100%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Zero Candidate No-Shows</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Video Link Health</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">Verified Active</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Google Meet Enterprise</span>
          </div>
        </div>

        {/* Schedule Cards Timeline */}
        <div className="space-y-4">
          {scheduleSlots.map(slot => (
            <div 
              key={slot.id} 
              className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs hover:border-amber-300 transition"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Left: Timing & Candidate */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-gold-400 rounded-2xl border border-amber-200/70 text-center shrink-0">
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-[10px] font-black uppercase font-mono block">{slot.duration}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{slot.time}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                        {slot.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {slot.candidateName}
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-gold-400 font-semibold">
                      {slot.role}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      🎯 {slot.round}
                    </p>
                  </div>
                </div>

                {/* Middle: Coordinator Info */}
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Coordinator: {slot.coordinator.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {slot.coordinator.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {slot.coordinator.email}
                    </span>
                  </div>
                </div>

                {/* Right: Join Meet Action */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <a 
                    href={slot.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Video className="w-4 h-4" />
                    Launch Interview Room
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerSchedule;


import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Calendar, Users, MapPin, Video, Clock, CheckCircle2, 
  Send, Plus, Award, AlertCircle, Building2, Bell 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementEvents = () => {
  const [events, setEvents] = useState([
    {
      id: 'EVT-301',
      title: 'TechVision International Technical Interview Panel',
      company: 'TechVision International',
      date: '2026-11-12',
      time: '10:00 AM - 04:00 PM',
      venue: 'Online Google Meet / Lab 3',
      meetingLink: 'https://meet.google.com/tech-interview-vels',
      panelsAssigned: ['Dr. Rajesh Kannan', 'Er. Vigneshwaran (Principal Cloud Eng)'],
      registeredAttendees: 18,
      attendanceMarked: 16,
      status: 'Scheduled',
      notificationsSent: true
    },
    {
      id: 'EVT-302',
      title: 'Al Habtoor Contracting Face-to-Face Evaluation',
      company: 'Al Habtoor Contracting LLC',
      date: '2026-11-16',
      time: '09:30 AM - 02:00 PM',
      venue: 'Civil Engineering Executive Seminar Hall',
      meetingLink: 'In-Person (Executive Suite)',
      panelsAssigned: ['Eng. Khalid Al-Habtoor', 'Fatima Al-Zahra'],
      registeredAttendees: 14,
      attendanceMarked: 14,
      status: 'Confirmed',
      notificationsSent: true
    },
    {
      id: 'EVT-303',
      title: 'L&T Mega Pre-Placement Talk & Aptitude Assessment',
      company: 'L&T Construction',
      date: '2026-11-20',
      time: '11:00 AM - 01:00 PM',
      venue: 'Main University Auditorium (All Batches)',
      meetingLink: 'Auditorium Hall A',
      panelsAssigned: ['S. Ramanathan (HR Lead)', 'Placement Coordinator Team'],
      registeredAttendees: 88,
      attendanceMarked: 0,
      status: 'Upcoming',
      notificationsSent: false
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSendReminder = (evtId) => {
    setEvents(prev => prev.map(e => e.id === evtId ? { ...e, notificationsSent: true } : e));
    showToast(`✓ Event notifications and calendar invites sent to student attendees!`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #8
              </span>
              <span className="text-[10px] font-mono text-slate-400">VENUE & PANELS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Interview & Event Coordination
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage schedules, venues, interview panels, attendance and student notifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Panels Synchronized
            </span>
            <button
              onClick={() => showToast('New event coordination scheduler opened')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Event</span>
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Scheduled Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{events.length}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Active Panel Schedules</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Registered Candidates</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">120</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Student Attendees</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Assigned Panelists</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">6</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Technical Assessors</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Notification Alerts</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">100%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Broadcast Delivery Rate</span>
          </div>
        </div>

        {/* Events Schedule Cards */}
        <div className="space-y-4">
          {events.map(evt => (
            <div key={evt.id} className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{evt.title}</h3>
                  <p className="text-xs font-bold text-amber-700 dark:text-gold-400 mt-0.5">{evt.company}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">
                  ● {evt.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{evt.date}</span>
                  <span className="text-[10px] text-slate-500 block">{evt.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Venue / Link</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{evt.venue}</span>
                  <span className="text-[10px] text-indigo-500 block truncate">{evt.meetingLink}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Panels Assigned</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{evt.panelsAssigned.join(' • ')}</span>
                  <span className="text-[10px] text-emerald-600 block">{evt.registeredAttendees} Attendees Expected</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Student Notifications: <strong className={evt.notificationsSent ? 'text-emerald-600' : 'text-amber-600'}>{evt.notificationsSent ? 'Broadcast Sent ✓' : 'Pending Send'}</strong></span>
                <button
                  onClick={() => handleSendReminder(evt.id)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Broadcast Reminder →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};


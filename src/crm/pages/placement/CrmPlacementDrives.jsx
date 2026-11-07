import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Briefcase, Plus, Calendar, MapPin, Users, CheckCircle2, 
  Clock, AlertCircle, ArrowRight, ExternalLink, Filter, Search, Award 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementDrives = () => {
  const [drives, setDrives] = useState([
    {
      id: 'DRV-2026-01',
      title: 'TechVision International On-Campus Drive 2026',
      company: 'TechVision International (Singapore)',
      driveDate: '2026-11-15',
      deadline: '2026-11-12',
      venue: 'Auditorium Block A & Virtual Meet',
      roles: ['Graduate Cloud Architect', 'DevOps Associate'],
      cgpaCutoff: 8.0,
      eligibleBatches: 'B.Tech CSE / IT / ECE (2026)',
      registeredCount: 64,
      shortlistedCount: 18,
      status: 'Open for Registration'
    },
    {
      id: 'DRV-2026-02',
      title: 'Al Habtoor UAE Campus Recruitment Drive',
      company: 'Al Habtoor Contracting LLC (Dubai)',
      driveDate: '2026-11-20',
      deadline: '2026-11-16',
      venue: 'Civil Engineering Seminar Hall',
      roles: ['Junior Site Engineer', 'Planning Associate'],
      cgpaCutoff: 7.5,
      eligibleBatches: 'B.E Civil / Mechanical (2026)',
      registeredCount: 42,
      shortlistedCount: 14,
      status: 'In Screening'
    },
    {
      id: 'DRV-2026-03',
      title: 'L&T Mega Engineering Hiring Drive',
      company: 'L&T Construction',
      driveDate: '2026-11-28',
      deadline: '2026-11-22',
      venue: 'Main Placement Cell Hub',
      roles: ['Graduate Engineer Trainee (GET)'],
      cgpaCutoff: 7.0,
      eligibleBatches: 'B.E All Core Branches (2026)',
      registeredCount: 88,
      shortlistedCount: 26,
      status: 'Upcoming'
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
                Placement Suite • Feature #5
              </span>
              <span className="text-[10px] font-mono text-slate-400">CAMPUS CALENDAR</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Placement Drive Management
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Create drives with dates, venue or link, job roles, eligibility and registration deadline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Drives Active
            </span>
            <button
              onClick={() => showToast('New campus drive creation wizard opened')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Drive</span>
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Scheduled Drives</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{drives.length}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Active Recruitment Drives</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Registrations</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">194</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Enrolled Candidates</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Shortlisted for Rounds</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">58</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Written & Tech Rounds</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Registration Closes</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2 Days</p>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 block">↗ TechVision Deadline</span>
          </div>
        </div>

        {/* Drives List */}
        <div className="space-y-4">
          {drives.map(drive => (
            <div key={drive.id} className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{drive.title}</h3>
                  <p className="text-xs font-bold text-amber-700 dark:text-gold-400 mt-0.5">{drive.company}</p>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">
                  ● {drive.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Drive Date & Venue</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{drive.driveDate}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{drive.venue}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Registration Deadline</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{drive.deadline}</span>
                  <span className="text-[10px] text-slate-500 block">Min {drive.cgpaCutoff} CGPA Cutoff</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Enrolled Candidates</span>
                  <span className="font-bold text-emerald-600">{drive.registeredCount} Registered</span>
                  <span className="text-[10px] text-purple-600 block">{drive.shortlistedCount} Shortlisted</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-medium">Eligible: <strong className="text-slate-800 dark:text-slate-200">{drive.eligibleBatches}</strong></span>
                <button
                  onClick={() => showToast(`Opening registered candidates roster for ${drive.company}`)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  View Registrations →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};


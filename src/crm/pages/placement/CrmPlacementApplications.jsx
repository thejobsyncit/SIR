import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  GitMerge, Search, Filter, CheckCircle2, Clock, 
  Award, Building2, UserCheck, ArrowRight, User 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementApplications = () => {
  const [applications, setApplications] = useState([
    { id: 'APP-101', studentName: 'Rohan Deshmukh', rollNo: '22CS104', company: 'TechVision International', role: 'Graduate Cloud Architect', stage: 'Selected', roundDate: '2026-11-04', notes: 'Top coding round score (98/100). Final offer extended.' },
    { id: 'APP-102', studentName: 'Ananya Sundaram', rollNo: '22CV045', company: 'Al Habtoor Contracting LLC', role: 'Junior Site Engineer', stage: 'Selected', roundDate: '2026-10-30', notes: 'Passed structural design & Primavera practical assessment.' },
    { id: 'APP-103', studentName: 'Mohammed Tariq', rollNo: '22ME089', company: 'L&T Construction', role: 'Graduate Engineer Trainee', stage: 'Interview', roundDate: '2026-11-10', notes: 'Shortlisted for technical round with L&T panel.' },
    { id: 'APP-104', studentName: 'Karthik Subramanian', rollNo: '22IT078', company: 'TechVision International', role: 'DevOps Associate', stage: 'Shortlisted', roundDate: '2026-11-08', notes: 'Online coding round cleared. Awaiting tech interview link.' },
    { id: 'APP-105', studentName: 'Sanjay Kumar', rollNo: '22CS119', company: 'TechVision International', role: 'Graduate Cloud Architect', stage: 'Applied', roundDate: '2026-11-05', notes: 'Application under review against CGPA cutoff.' },
    { id: 'APP-106', studentName: 'Pooja Venkatesh', rollNo: '22EC055', company: 'Al Habtoor Contracting LLC', role: 'Junior Site Engineer', stage: 'Rejected', roundDate: '2026-11-01', notes: 'Did not match civil domain specialization requirements.' }
  ]);

  const [filterStage, setFilterStage] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleStageChange = (appId, newStage) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    showToast(`✓ Candidate application stage updated to "${newStage}"`);
  };

  const filtered = applications.filter(a => 
    filterStage === 'all' || a.stage.toLowerCase() === filterStage.toLowerCase()
  );

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #7
              </span>
              <span className="text-[10px] font-mono text-slate-400">APPLICATION FUNNEL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Application Tracking
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Track applications through applied, shortlisted, interview, selected and rejected stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Pipeline Active
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 5 Funnel Stage Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Applied', val: applications.filter(a => a.stage === 'Applied').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
            { label: 'Shortlisted', val: applications.filter(a => a.stage === 'Shortlisted').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
            { label: 'Interview Round', val: applications.filter(a => a.stage === 'Interview').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
            { label: 'Selected / Placed', val: applications.filter(a => a.stage === 'Selected').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
            { label: 'Rejected', val: applications.filter(a => a.stage === 'Rejected').length, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' }
          ].map((st, idx) => (
            <div key={idx} className={`p-4 rounded-3xl border border-slate-200/80 dark:border-navy-800 ${st.bg} text-center shadow-xs`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{st.label}</span>
              <p className={`text-3xl font-serif font-black ${st.color} mt-2`}>{st.val}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-4 rounded-2xl flex justify-between items-center shadow-xs">
          <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">Active Stage Progression</span>
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied Only</option>
            <option value="shortlisted">Shortlisted Only</option>
            <option value="interview">Interview Round Only</option>
            <option value="selected">Selected Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        {/* Applications List */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Student Name & Roll No</th>
                  <th className="p-4 font-bold">Target Employer & Role</th>
                  <th className="p-4 font-bold">Feedback / Progress Notes</th>
                  <th className="p-4 font-bold text-center">Stage Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{app.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{app.rollNo}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{app.company}</p>
                      <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">{app.role}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-600 dark:text-slate-300 text-xs">{app.notes}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Date: {app.roundDate}</span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={app.stage}
                        onChange={e => handleStageChange(app.id, e.target.value)}
                        className={`rounded-xl px-3 py-1 font-bold text-xs border focus:outline-none cursor-pointer ${
                          app.stage === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          app.stage === 'Interview' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          app.stage === 'Shortlisted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          app.stage === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
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


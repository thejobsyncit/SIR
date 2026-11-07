import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  UserCheck, Search, Filter, CheckCircle2, Clock, 
  XCircle, FileText, Download, Award, Briefcase, Plus 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementRegistration = () => {
  const [registrations, setRegistrations] = useState([
    {
      id: 'REG-501',
      studentName: 'Rohan Deshmukh',
      rollNo: '22CS104',
      driveName: 'TechVision International On-Campus Drive 2026',
      company: 'TechVision International',
      cgpa: 9.15,
      eligibilityMet: true,
      registeredAt: '2026-11-02 10:15 AM',
      hallTicket: 'HT-TECH-014',
      status: 'Hall Ticket Issued',
      notes: 'CGPA 9.15 verified. Eligible for online coding round.'
    },
    {
      id: 'REG-502',
      studentName: 'Ananya Sundaram',
      rollNo: '22CV045',
      driveName: 'Al Habtoor UAE Campus Recruitment Drive',
      company: 'Al Habtoor Contracting LLC',
      cgpa: 8.80,
      eligibilityMet: true,
      registeredAt: '2026-11-03 02:40 PM',
      hallTicket: 'HT-HABT-009',
      status: 'Shortlisted for Interview',
      notes: 'Cleared initial technical screening. Venue: Seminar Hall.'
    },
    {
      id: 'REG-503',
      studentName: 'Divya Krishnan',
      rollNo: '22EC012',
      driveName: 'TechVision International On-Campus Drive 2026',
      company: 'TechVision International',
      cgpa: 7.95,
      eligibilityMet: false,
      registeredAt: '2026-11-04 11:20 AM',
      hallTicket: 'N/A',
      status: 'Ineligible (CGPA < 8.0)',
      notes: 'Cutoff is 8.0 CGPA. Registration placed on hold.'
    },
    {
      id: 'REG-504',
      studentName: 'Mohammed Tariq',
      rollNo: '22ME089',
      driveName: 'L&T Mega Engineering Hiring Drive',
      company: 'L&T Construction',
      cgpa: 8.45,
      eligibilityMet: true,
      registeredAt: '2026-11-04 04:05 PM',
      hallTicket: 'HT-LNT-038',
      status: 'Registered',
      notes: 'Awaiting online aptitude round schedule.'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleIssueHallTicket = (regId) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Hall Ticket Issued', hallTicket: `HT-${Math.floor(100 + Math.random() * 900)}` } : r));
    showToast(`✓ Hall ticket generated and sent to student.`);
  };

  const filtered = registrations.filter(r => 
    !searchQuery ||
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #6
              </span>
              <span className="text-[10px] font-mono text-slate-400">STUDENT ENROLLMENT</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Student Registration
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Allow eligible students to register or apply for a drive and track registration status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Registration Portal Active
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Enrolled</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{registrations.length}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Active Drive Applications</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Eligibility Approved</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">3</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Qualified by CGPA Cutoff</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Hall Tickets Issued</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Assessment Admit Cards</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Ineligible / On Hold</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">1</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Cutoff Gap / Backlogs</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registrations by student name, roll number, or drive company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Registrations Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Student Name & Roll No</th>
                  <th className="p-4 font-bold">Target Drive & Company</th>
                  <th className="p-4 font-bold text-center">CGPA & Eligibility</th>
                  <th className="p-4 font-bold text-center">Hall Ticket</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{r.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{r.rollNo} • {r.registeredAt}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{r.company}</p>
                      <span className="text-[10px] text-slate-500 truncate block max-w-xs">{r.driveName}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono font-extrabold text-amber-700 dark:text-gold-400 text-xs block">{r.cgpa} CGPA</span>
                      <span className={`text-[10px] font-bold ${r.eligibilityMet ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.eligibilityMet ? 'Eligible ✓' : 'Below Cutoff'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-xs font-extrabold text-slate-700 dark:text-slate-300">{r.hallTicket}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status.includes('Issued') ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' :
                        r.status.includes('Shortlisted') ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200' :
                        r.status.includes('Ineligible') ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'Registered' && r.eligibilityMet && (
                        <button
                          onClick={() => handleIssueHallTicket(r.id)}
                          className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Issue Hall Ticket
                        </button>
                      )}
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


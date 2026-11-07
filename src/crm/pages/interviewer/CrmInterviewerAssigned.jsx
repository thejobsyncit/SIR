import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Users, Calendar, Clock, Video, CheckCircle2, 
  ExternalLink, Search, Filter, AlertCircle, FileText, ArrowRight 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerAssigned = () => {
  const { setActiveModule } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRound, setFilterRound] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  const [assignedCandidates, setAssignedCandidates] = useState([
    {
      id: 'CAN-801',
      name: 'Rohan Deshmukh',
      role: 'Senior Cloud Infrastructure Architect',
      department: 'Enterprise Cloud Practice',
      round: 'Round 2: System Design & Kubernetes',
      scheduledTime: 'Today • 03:00 PM - 04:00 PM',
      meetLink: 'https://meet.google.com/qam-revival-tech',
      status: 'Upcoming Today',
      experience: '5.5 Years',
      currentCompany: 'Cognizant Cloud Labs',
      coordinator: 'Divya Sharma (+91 98765 43210)',
      feedbackSubmitted: false
    },
    {
      id: 'CAN-802',
      name: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      department: 'Digital Engineering',
      round: 'Round 1: Core Coding & Architecture',
      scheduledTime: 'Today • 05:30 PM - 06:30 PM',
      meetLink: 'https://meet.google.com/dxf-eng-interviews',
      status: 'Upcoming Today',
      experience: '4.2 Years',
      currentCompany: 'Infosys FinTech Group',
      coordinator: 'Divya Sharma (+91 98765 43210)',
      feedbackSubmitted: false
    },
    {
      id: 'CAN-803',
      name: 'Mohammed Tariq',
      role: 'DevOps & CI/CD Specialist',
      department: 'Platform Reliability',
      round: 'Round 2: Terraform & Cloud Security',
      scheduledTime: 'Tomorrow • 11:00 AM - 12:00 PM',
      meetLink: 'https://meet.google.com/zxc-cloud-ops',
      status: 'Scheduled',
      experience: '3.8 Years',
      currentCompany: 'Wipro Digital Cloud',
      coordinator: 'Priya Lead (+91 98765 12345)',
      feedbackSubmitted: false
    },
    {
      id: 'CAN-804',
      name: 'Ananya Sundaram',
      role: 'Civil Project Planning Lead',
      department: 'Infrastructure Projects (Dubai)',
      round: 'Technical Evaluation Round',
      scheduledTime: 'Yesterday • Completed',
      meetLink: 'https://meet.google.com/past-meet',
      status: 'Awaiting Feedback',
      experience: '6.0 Years',
      currentCompany: 'L&T Infrastructure',
      coordinator: 'Priya Lead (+91 98765 12345)',
      feedbackSubmitted: false
    }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filtered = assignedCandidates.filter(c => {
    const matchQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRound = filterRound === 'All' || c.round.includes(filterRound);
    return matchQuery && matchRound;
  });

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #2
              </span>
              <span className="text-[10px] font-mono text-slate-400">CANDIDATE ALLOCATION ROSTER</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Assigned Candidate List
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Candidates and technical assessment rounds allocated to you with real-time meeting rooms and coordinator contacts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● 2 Panels Scheduled Today
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Allocated</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{assignedCandidates.length}</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Current Evaluation Cycle</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Today's Schedule</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2 Sessions</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Next slot at 03:00 PM</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Awaiting Feedback</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">1 Candidate</p>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 block">↗ 24hr Deadline ticking</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Evaluations Completed</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">18 Candidates</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ 89% On-time submission</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidate name, role, ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase text-slate-400">Round:</span>
            <select 
              value={filterRound} 
              onChange={e => setFilterRound(e.target.value)}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">All Interview Rounds</option>
              <option value="Round 1">Round 1</option>
              <option value="Round 2">Round 2</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        </div>

        {/* Assigned List Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Candidate Details</th>
                  <th className="p-4 font-bold">Target Position & Practice</th>
                  <th className="p-4 font-bold">Assigned Round</th>
                  <th className="p-4 font-bold">Date & Time Slot</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Interviewer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{c.id} • {c.experience} Exp</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.currentCompany}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.role}</p>
                      <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">{c.department}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.round}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{c.scheduledTime}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Coord: {c.coordinator}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status.includes('Today')
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 animate-pulse'
                          : c.status.includes('Awaiting')
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={c.meetLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold flex items-center gap-1 transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Meet
                        </a>
                        <button 
                          onClick={() => {
                            setActiveModule('int-evaluation');
                            showToast(`Navigating to scorecard evaluation for ${c.name}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold shadow-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Scorecard
                        </button>
                      </div>
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

export default CrmInterviewerAssigned;


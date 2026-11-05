import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Building2, Users, CheckCircle2, Clock, Calendar, DollarSign, 
  Send, Phone, MessageSquare, AlertCircle, FileText, ChevronRight, 
  Award, Briefcase, Plus, Filter, Search, ArrowRight, UserCheck
} from 'lucide-react';

export const CrmPlacementCoordinatorDashboard = () => {
  const { candidates = [], clients = [], updateCandidateStage } = useCrm();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'submissions' | 'offers' | 'timeline' | 'clients'
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Placement Candidates State
  const [placements, setPlacements] = useState([
    {
      id: 'PLC-201',
      candidateName: 'Alexander Wright',
      role: 'Chief Technology Officer',
      clientCompany: 'Al Habtoor Contracting LLC',
      status: 'Submitted to Employer',
      submissionDate: '2026-11-01',
      clientResponse: 'Shortlisted for Client Interview',
      interviewDate: '2026-11-08 at 02:00 PM',
      offeredSalary: '28,000 AED / month',
      joiningDate: '2026-12-01',
      joiningStatus: 'Offer Under Review',
      notes: 'Employer reviewed CV; requested technical panel on Thursday.'
    },
    {
      id: 'PLC-202',
      candidateName: 'Dr. Sarah Al-Mansoori',
      role: 'Consultant Cardiologist',
      clientCompany: 'Saudi German Hospital (Riyadh)',
      status: 'Offer Received',
      submissionDate: '2026-10-25',
      clientResponse: 'Interview Passed - Offer Issued',
      interviewDate: 'Completed on 2026-10-28',
      offeredSalary: '55,000 SAR / month',
      joiningDate: '2026-11-20',
      joiningStatus: 'Offer Accepted & Visa Processing',
      notes: 'Prometric license verified. Hospital issued official MOH contract.'
    },
    {
      id: 'PLC-203',
      candidateName: 'Elena Rostova',
      role: 'Senior Mechanical Engineer',
      clientCompany: 'TechVision International (Singapore)',
      status: 'Placements Completed',
      submissionDate: '2026-10-18',
      clientResponse: 'Hired & Onboarded',
      interviewDate: 'Completed',
      offeredSalary: '11,500 SGD / month',
      joiningDate: '2026-11-01',
      joiningStatus: 'Joined & Verified',
      notes: 'MOM Work Pass issued. Candidate joined client Singapore HQ.'
    },
    {
      id: 'PLC-204',
      candidateName: 'Rajesh Subramanian',
      role: 'Lead DevOps Architect',
      clientCompany: 'Al Habtoor Contracting LLC',
      status: 'Ready for Placement',
      submissionDate: 'Pending Submission',
      clientResponse: 'Matching Criteria 94%',
      interviewDate: '-',
      offeredSalary: '20,000 AED (Expected)',
      joiningDate: '-',
      joiningStatus: 'Awaiting Client Slot',
      notes: 'Matches GCC High-Rise IT Infrastructure mandate.'
    }
  ]);

  // Employer Interaction Log
  const [employerNotes, setEmployerNotes] = useState([
    { id: 1, company: 'Al Habtoor Contracting LLC', contact: 'Mr. Khalid Al-Habtoor (HR Director)', note: 'Client confirmed 3 civil engineering vacancies. Demands minimum 5 years GCC experience.', date: 'Today at 10:30 AM' },
    { id: 2, company: 'Saudi German Hospital', contact: 'Dr. Tariq Al-Ghamdi', note: 'Requested 2 consultant cardiologists for Riyadh clinic expansion.', date: 'Yesterday at 04:15 PM' }
  ]);
  const [newEmployerNote, setNewEmployerNote] = useState({ company: 'Al Habtoor Contracting LLC', note: '' });

  // Record Offer Details Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [offerForm, setOfferForm] = useState({
    offeredSalary: '',
    offeredRole: '',
    joiningDate: '',
    joiningStatus: 'Offer Received'
  });

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Metrics for Placement Coordinator Dashboard
  const totalAssigned = placements.length + candidates.length;
  const availableOpportunities = 18;
  const readyForPlacement = placements.filter(p => p.status === 'Ready for Placement').length + 4;
  const submittedToEmployers = placements.filter(p => p.status === 'Submitted to Employer').length;
  const interviewsScheduled = placements.filter(p => p.interviewDate && p.interviewDate.includes('at')).length;
  const interviewsCompleted = placements.filter(p => p.interviewDate && p.interviewDate.includes('Completed')).length;
  const offersReceived = placements.filter(p => p.status === 'Offer Received').length;
  const placementsCompleted = placements.filter(p => p.status === 'Placements Completed').length;
  const pendingFollowUps = placements.filter(p => p.joiningStatus.includes('Under Review') || p.joiningStatus.includes('Awaiting')).length;

  const handleUpdatePlacementStatus = (id, newStatus) => {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showNotification(`✓ Placement status updated to "${newStatus}"`);
  };

  const handleOpenOfferModal = (plc) => {
    setSelectedPlacement(plc);
    setOfferForm({
      offeredSalary: plc.offeredSalary || '25,000 AED',
      offeredRole: plc.role,
      joiningDate: plc.joiningDate && plc.joiningDate !== '-' ? plc.joiningDate : '2026-12-15',
      joiningStatus: 'Offer Received'
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (!selectedPlacement) return;
    setPlacements(prev => prev.map(p => {
      if (p.id === selectedPlacement.id) {
        return {
          ...p,
          status: 'Offer Received',
          offeredSalary: offerForm.offeredSalary,
          role: offerForm.offeredRole,
          joiningDate: offerForm.joiningDate,
          joiningStatus: offerForm.joiningStatus
        };
      }
      return p;
    }));
    showNotification(`✓ Offer details recorded for ${selectedPlacement.candidateName}!`);
    setOfferModalOpen(false);
  };

  const handleAddEmployerNote = (e) => {
    e.preventDefault();
    if (!newEmployerNote.note.trim()) return;
    setEmployerNotes(prev => [
      { id: Date.now(), company: newEmployerNote.company, contact: 'Client Coordinator', note: newEmployerNote.note.trim(), date: 'Just now' },
      ...prev
    ]);
    setNewEmployerNote({ company: 'Al Habtoor Contracting LLC', note: '' });
    showNotification('✓ Employer interaction note saved!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-navy-950 via-teal-950 to-navy-900 p-6 rounded-3xl border border-teal-500/30 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-navy-950 uppercase tracking-wider">
              Employer Coordination Console
            </span>
            <span className="text-xs text-slate-400 font-mono">PLACEMENT-COORDINATOR</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Placement Coordinator Dashboard
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Candidate-opportunity matching, employer submissions, offer negotiation, and placement timeline tracking.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 text-xs">
          {[
            { id: 'overview', label: 'Placement Overview' },
            { id: 'submissions', label: 'Candidate Submissions' },
            { id: 'offers', label: 'Offers & Joinings' },
            { id: 'timeline', label: 'Placement Timeline' },
            { id: 'clients', label: 'Employer Communications' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-navy-950 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-teal-500/20 border border-teal-500/40 text-teal-800 dark:text-teal-300 rounded-2xl text-xs font-bold animate-in fade-in">
          {statusMsg}
        </div>
      )}

      {/* 9 PLACEMENT OVERVIEW KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {[
          { label: 'Assigned Pool', val: totalAssigned, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
          { label: 'Open Mandates', val: availableOpportunities, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
          { label: 'Ready Placement', val: readyForPlacement, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
          { label: 'Submitted', val: submittedToEmployers, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' },
          { label: 'Interviews Sched.', val: interviewsScheduled, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
          { label: 'Interviews Done', val: interviewsCompleted, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20' },
          { label: 'Offers Received', val: offersReceived, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
          { label: 'Placements Done', val: placementsCompleted, color: 'text-gold-600', bg: 'bg-gold-50 dark:bg-gold-500/10 border-gold-200 dark:border-gold-500/20' },
          { label: 'Follow-ups', val: pendingFollowUps, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl border ${kpi.bg} text-center shadow-sm`}>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{kpi.label}</span>
            <span className={`text-xl font-extrabold font-mono mt-1 block ${kpi.color}`}>{kpi.val}</span>
          </div>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & CANDIDATE MATCHING */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Active Submissions List (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-500" />
                <span>Active Employer Submissions & Feedback</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">{placements.length} Candidates</span>
            </div>

            <div className="space-y-3">
              {placements.map(plc => (
                <div key={plc.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2 hover:border-teal-500/40 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{plc.candidateName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{plc.role} → <strong className="text-teal-600 dark:text-teal-400">{plc.clientCompany}</strong></p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300">
                      {plc.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/60 dark:border-navy-800/80 text-[11px] space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Employer Feedback: <span className="text-teal-600 dark:text-teal-400 font-bold">{plc.clientResponse}</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">{plc.notes}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                    <span>Interview: {plc.interviewDate}</span>
                    <button
                      onClick={() => handleOpenOfferModal(plc)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition cursor-pointer"
                    >
                      Record Offer Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Coordinator Employer Notes & Communications (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>Employer Interaction Notes</span>
            </h3>

            <form onSubmit={handleAddEmployerNote} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Client Employer</label>
                <select
                  value={newEmployerNote.company}
                  onChange={e => setNewEmployerNote({...newEmployerNote, company: e.target.value})}
                  className="w-full p-2 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-700 font-bold"
                >
                  <option value="Al Habtoor Contracting LLC">Al Habtoor Contracting LLC (UAE)</option>
                  <option value="Saudi German Hospital (Riyadh)">Saudi German Hospital (KSA)</option>
                  <option value="TechVision International (Singapore)">TechVision International (SG)</option>
                  <option value="Emaar Hospitality Group">Emaar Hospitality Group (UAE)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interaction Summary / Decision</label>
                <textarea
                  rows={2}
                  required
                  value={newEmployerNote.note}
                  onChange={e => setNewEmployerNote({...newEmployerNote, note: e.target.value})}
                  placeholder="e.g. HR approved salary bracket of 24k AED; awaiting visa quota clearance."
                  className="w-full p-2 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-700"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition cursor-pointer">
                Log Employer Discussion
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {employerNotes.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/60 dark:border-navy-800 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-white truncate">{item.company}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFERS & JOININGS */}
      {activeTab === 'offers' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-3">
            Confirmed Offers, Joining Dates & Onboarding Status
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold">Candidate</th>
                  <th className="p-3 font-bold">Employer & Role</th>
                  <th className="p-3 font-bold">Offered CTC / Salary</th>
                  <th className="p-3 font-bold text-center">Expected Joining</th>
                  <th className="p-3 font-bold text-center">Joining Status</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {placements.map(plc => (
                  <tr key={plc.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{plc.candidateName}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{plc.role}</p>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">{plc.clientCompany}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{plc.offeredSalary}</td>
                    <td className="p-3 text-center font-mono">{plc.joiningDate}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        plc.joiningStatus.includes('Joined') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' :
                        plc.joiningStatus.includes('Accepted') ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                      }`}>
                        {plc.joiningStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenOfferModal(plc)}
                        className="px-2 py-1 bg-slate-100 dark:bg-navy-800 hover:bg-teal-600 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Edit Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-3">
            Candidate Placement Activity Timeline
          </h3>

          <div className="space-y-6">
            {placements.map(plc => (
              <div key={plc.id} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {plc.candidateName} — <span className="text-teal-600 dark:text-teal-400">{plc.role} at {plc.clientCompany}</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-500">{plc.id}</span>
                </div>

                {/* Horizontal Progress Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-teal-500/30 text-xs">
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold block">1. Submission</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plc.submissionDate}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-teal-500/30 text-xs">
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold block">2. Interview</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plc.interviewDate}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-teal-500/30 text-xs">
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold block">3. Offer Release</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{plc.offeredSalary}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-teal-500/30 text-xs">
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold block">4. Joining Status</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{plc.joiningStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD OFFER MODAL */}
      {offerModalOpen && selectedPlacement && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-2">
              Record Placement Offer Details
            </h3>
            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Candidate</label>
                <input type="text" readOnly value={`${selectedPlacement.candidateName} (${selectedPlacement.clientCompany})`} className="w-full p-2 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-700 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Offered Role / Title</label>
                <input type="text" required value={offerForm.offeredRole} onChange={e => setOfferForm({...offerForm, offeredRole: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Offered CTC / Salary</label>
                  <input type="text" required value={offerForm.offeredSalary} onChange={e => setOfferForm({...offerForm, offeredSalary: e.target.value})} placeholder="e.g. 26,000 AED" className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Joining Date</label>
                  <input type="date" required value={offerForm.joiningDate} onChange={e => setOfferForm({...offerForm, joiningDate: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joining / Onboarding Status</label>
                <select value={offerForm.joiningStatus} onChange={e => setOfferForm({...offerForm, joiningStatus: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 font-bold">
                  <option value="Offer Under Review">Offer Under Review</option>
                  <option value="Offer Accepted & Visa Processing">Offer Accepted & Visa Processing</option>
                  <option value="Joined & Verified">Joined & Verified (Placement Closed)</option>
                  <option value="Offer Rejected by Candidate">Offer Rejected by Candidate</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOfferModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-navy-800 rounded-xl font-bold text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm">
                  Save Offer Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


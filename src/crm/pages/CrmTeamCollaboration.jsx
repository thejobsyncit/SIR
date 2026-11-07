import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, Share2, Award, CheckCircle2, MessageSquare, Plus, 
  ArrowRight, UserCheck, Briefcase, Sparkles, Building2, Clock 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmTeamCollaboration = () => {
  const { candidates = [], user } = useCrm();

  const [teamMembers] = useState([
    {
      id: 'rec-1',
      name: 'Kishore Kumar',
      role: 'Principal Recruiter (GCC Lead)',
      activeVacancies: 5,
      activeCandidates: 28,
      placementsThisMonth: 8,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Online'
    },
    {
      id: 'rec-2',
      name: 'Harish Durai',
      role: 'Senior International Recruiter',
      activeVacancies: 4,
      activeCandidates: 22,
      placementsThisMonth: 6,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'Online'
    },
    {
      id: 'rec-3',
      name: 'Fatima Al-Zahra',
      role: 'Head of Executive Sourcing',
      activeVacancies: 6,
      activeCandidates: 34,
      placementsThisMonth: 11,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'In Meeting'
    },
    {
      id: 'rec-4',
      name: 'Dhanush J',
      role: 'Domestic Recruitment Lead',
      activeVacancies: 4,
      activeCandidates: 19,
      placementsThisMonth: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'Online'
    }
  ]);

  // Shared Hiring Decisions & Notes Feed
  const [decisionsFeed, setDecisionsFeed] = useState([
    {
      id: 'DEC-1',
      author: 'Fatima Al-Zahra',
      action: 'Offer Approved by Client',
      candidateName: 'Alexander Wright',
      role: 'Senior Civil Project Manager',
      company: 'Al Habtoor Contracting LLC',
      notes: 'Client Managing Director approved monthly compensation of AED 26,000 + family medical. Ready for offer dispatch.',
      time: '1 hour ago',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'DEC-2',
      author: 'Kishore Kumar',
      action: 'Recommended for Client Final Round',
      candidateName: 'Dr. Priya Sharma',
      role: 'Consultant Cardiologist',
      company: 'Saudi German Hospital',
      notes: 'Cleared technical competency check with Dr. Rajesh Kannan. Recommendation letter forwarded to Hospital HR Director.',
      time: '3 hours ago',
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'DEC-3',
      author: 'Harish Durai',
      action: 'Candidate Shortlisted',
      candidateName: 'Rahul Verma',
      role: 'Lead DevOps Cloud Architect',
      company: 'TechVision International',
      notes: 'AWS and Kubernetes skills matched 95% on ATS scoring. Moved to Screening stage.',
      time: 'Yesterday',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    }
  ]);

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedCandidateToAssign, setSelectedCandidateToAssign] = useState(candidates[0]?.id || 'REV-CAN-101');
  const [selectedTargetRecruiter, setSelectedTargetRecruiter] = useState('Harish Durai');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [notification, setNotification] = useState('');

  // New Shared Decision Form
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newDecisionCandidate, setNewDecisionCandidate] = useState(candidates[0]?.name || 'Alexander Wright');
  const [newDecisionAction, setNewDecisionAction] = useState('Candidate Shortlisted');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleConfirmReassign = (e) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === selectedCandidateToAssign) || candidates[0];
    showToast(`✓ Candidate ${cand?.name || 'Selected'} reassigned to ${selectedTargetRecruiter}`);
    setReassignModalOpen(false);

    // Also push to decisions feed
    setDecisionsFeed(prev => [
      {
        id: `DEC-${Date.now()}`,
        author: user?.name || 'Recruiter',
        action: 'Candidate Reassigned',
        candidateName: cand?.name || 'Candidate',
        role: cand?.currentRole || 'Position',
        company: 'Reassigned Mandate',
        notes: `Reassigned to ${selectedTargetRecruiter}. Note: ${assignmentNote || 'Transferred for pipeline follow-up'}`,
        time: 'Just now',
        badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
      },
      ...prev
    ]);
  };

  const handlePostDecision = (e) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    setDecisionsFeed(prev => [
      {
        id: `DEC-${Date.now()}`,
        author: user?.name || 'Recruiter',
        action: newDecisionAction,
        candidateName: newDecisionCandidate,
        role: 'Assigned Position',
        company: 'Active Mandate',
        notes: newDecisionText.trim(),
        time: 'Just now',
        badgeColor: 'bg-gold-500/20 text-gold-600 dark:text-gold-400'
      },
      ...prev
    ]);

    setNewDecisionText('');
    showToast('✓ Shared hiring decision posted to team feed.');
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
                Recruiter Feature #12
              </span>
              <span className="text-xs text-slate-400 font-mono">TEAM-COORDINATION</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Team Collaboration
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Assign vacancies and candidates to recruiters; share notes and hiring decisions.
            </p>
          </div>

          <button
            onClick={() => setReassignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-2xl shadow-gold-glow transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Reassign Candidate / Vacancy</span>
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        {/* RECRUITER TEAM ROSTER (4 CARDS) */}
        <div>
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-500" />
            <span>Recruiter Team Roster & Active Workloads</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map(member => (
              <div 
                key={member.id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-gold-500/50 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-gold-500/40 shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{member.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{member.role}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      ● {member.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-navy-800 text-center font-mono">
                  <div className="p-1.5 bg-slate-50 dark:bg-navy-950 rounded-xl">
                    <span className="text-[9px] text-slate-400 block">Vacancies</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">{member.activeVacancies}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-navy-950 rounded-xl">
                    <span className="text-[9px] text-slate-400 block">Candidates</span>
                    <span className="font-extrabold text-gold-600 dark:text-gold-400 text-xs">{member.activeCandidates}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-navy-950 rounded-xl">
                    <span className="text-[9px] text-slate-400 block">Placements</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{member.placementsThisMonth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SHARED HIRING DECISIONS FEED & COLLABORATION POSTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: DECISION STREAM */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gold-500" />
                <span>Shared Team Hiring Decisions & Notes Feed</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Live Team Stream</span>
            </div>

            <div className="space-y-3">
              {decisionsFeed.map(dec => (
                <div 
                  key={dec.id}
                  className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{dec.candidateName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${dec.badgeColor}`}>
                          {dec.action}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{dec.role} • {dec.company}</p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">{dec.time}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                    {dec.notes}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-navy-800/60 font-mono">
                    <span>Decided by: <strong className="text-gold-600 dark:text-gold-400">{dec.author}</strong></span>
                    <span className="text-indigo-500 font-bold">Collaborative Sync ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: POST NEW DECISION & BULLETIN */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Post Decision Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-800 pb-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Share Hiring Decision / Team Note</span>
              </h3>

              <form onSubmit={handlePostDecision} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Related Candidate:
                  </label>
                  <select
                    value={newDecisionCandidate}
                    onChange={e => setNewDecisionCandidate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    {candidates.map(c => <option key={c.id} value={c.name}>{c.name} — {c.currentRole}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Decision Type:
                  </label>
                  <select
                    value={newDecisionAction}
                    onChange={e => setNewDecisionAction(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="Candidate Shortlisted">Candidate Shortlisted</option>
                    <option value="Recommended for Client Final Round">Recommended for Client Final Round</option>
                    <option value="Offer Approved by Client">Offer Approved by Client</option>
                    <option value="Candidate Accepted Offer">Candidate Accepted Offer</option>
                    <option value="Screening Feedback Added">Screening Feedback Added</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Decision Remarks & Hiring Team Notes:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter hiring decision details, interview assessment feedback, or client consensus..."
                    value={newDecisionText}
                    onChange={e => setNewDecisionText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Share Decision to Team Feed
                </button>
              </form>
            </div>

            {/* Team Urgent Bulletin */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-5 rounded-3xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-gold-400 block">
                Urgent Team Sourcing Mandate
              </span>
              <h4 className="font-serif text-xs font-bold text-amber-900 dark:text-amber-200">
                Al Habtoor Contracting LLC - Fast-Track Hiring
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                4 Senior Civil Project Managers required on immediate 30-day joiner basis. Recruiters please prioritize shortlisted UAE & GCC profiles.
              </p>
            </div>

          </div>

        </div>

        {/* REASSIGN CANDIDATE / VACANCY MODAL */}
        {reassignModalOpen && (
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-2">
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-gold-500" />
                  <span>Reassign Candidate / Vacancy</span>
                </h3>
                <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleConfirmReassign} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Candidate:</label>
                  <select
                    value={selectedCandidateToAssign}
                    onChange={e => setSelectedCandidateToAssign(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold"
                  >
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name} — {c.currentRole}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assign to Recruiter:</label>
                  <select
                    value={selectedTargetRecruiter}
                    onChange={e => setSelectedTargetRecruiter(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold"
                  >
                    {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name} ({m.role})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transfer Note / Reason:</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Handing over candidate for technical evaluation..."
                    value={assignmentNote}
                    onChange={e => setAssignmentNote(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition"
                  >
                    Confirm Reassignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};


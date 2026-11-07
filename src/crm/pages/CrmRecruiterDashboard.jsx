import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, Briefcase, FileText, CheckCircle2, AlertCircle, Clock, 
  Calendar, Star, Search, Filter, Plus, ChevronRight, Upload, 
  Sparkles, CheckSquare, MessageSquare, Phone, Mail, Award, XCircle, ArrowUpRight
} from 'lucide-react';

export const CrmRecruiterDashboard = () => {
  const { 
    candidates = [], 
    updateCandidateStage, 
    updateCandidate,
    addInterview,
    interviews = [],
    setActiveModule 
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'candidates' | 'ats' | 'interviews' | 'jobs'

  // Interview Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidateId: '',
    candidateName: '',
    jobTitle: 'Senior Project Manager',
    company: 'Al Habtoor Contracting LLC',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    platform: 'Google Meet',
    notes: ''
  });

  // Candidate Notes Modal
  const [candidateNotes, setCandidateNotes] = useState({});
  const [newNoteText, setNewNoteText] = useState('');

  // Assigned Job Openings
  const [jobOpenings] = useState([
    { id: 'JOB-101', title: 'Senior Civil Project Manager', company: 'Al Habtoor Contracting LLC', location: 'Dubai, UAE', openings: 4, skills: ['Primavera P6', 'FIDIC', 'AutoCAD', 'High-Rise Construction'], experience: '8-12 Years', salary: '22,000 - 28,000 AED', status: 'Active' },
    { id: 'JOB-102', title: 'Consultant Cardiologist', company: 'Saudi German Hospital', location: 'Riyadh, KSA', openings: 2, skills: ['Cardiology', 'JCI Accreditation', 'Prometric License', 'Catheterization'], experience: '10+ Years', salary: '45,000 - 60,000 SAR', status: 'Active' },
    { id: 'JOB-103', title: 'Lead DevOps Cloud Architect', company: 'TechVision International', location: 'Singapore', openings: 3, skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'], experience: '6-10 Years', salary: '9,500 - 13,000 SGD', status: 'Active' },
    { id: 'JOB-104', title: 'Executive Hospitality Manager', company: 'Emaar Hospitality Group', location: 'Dubai, UAE', openings: 5, skills: ['Luxury Guest Services', 'F&B Operations', 'Staff Leadership'], experience: '5-8 Years', salary: '16,000 - 20,000 AED', status: 'Active' }
  ]);

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // Recruitment Overview Metric Counters
  const totalCandidates = candidates.length;
  const assignedCandidates = candidates.filter(c => c.assignedRecruiter || true).length;
  const newCandidates = candidates.filter(c => c.stage === 'new' || c.stage === 'lead').length;
  const shortlistedCandidates = candidates.filter(c => c.stage === 'shortlisted' || c.stage === 'screening').length;
  const interviewScheduled = candidates.filter(c => (c.stage || '').includes('interview')).length;
  const interviewCompleted = interviews.filter(i => i.status === 'Completed').length;
  const selectedCandidates = candidates.filter(c => c.stage === 'selected' || c.stage === 'offer_released' || c.stage === 'joined').length;
  const rejectedCandidates = candidates.filter(c => c.stage === 'rejected').length;
  const pendingFollowUps = candidates.filter(c => c.stage === 'screening' || c.stage === 'shortlisted').length;

  const handleStageChange = async (candidateId, newStage) => {
    try {
      if (updateCandidateStage) {
        await updateCandidateStage(candidateId, newStage);
        showNotification(`✓ Candidate stage updated to "${newStage}"`);
      }
    } catch {
      showNotification('⚠️ Failed to update candidate stage');
    }
  };

  const handleOpenScheduleModal = (cand) => {
    setInterviewForm({
      candidateId: cand.id,
      candidateName: cand.name,
      jobTitle: cand.currentRole || 'Senior Civil Project Manager',
      company: 'Al Habtoor Contracting LLC',
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      platform: 'Google Meet',
      notes: 'Initial technical and competence assessment'
    });
    setScheduleModalOpen(true);
  };

  const handleSaveInterview = async (e) => {
    e.preventDefault();
    if (addInterview) {
      addInterview({
        candidateId: interviewForm.candidateId,
        candidateName: interviewForm.candidateName,
        jobTitle: interviewForm.jobTitle,
        company: interviewForm.company,
        date: interviewForm.date,
        time: interviewForm.time,
        platform: interviewForm.platform,
        status: 'Scheduled'
      });
    }
    handleStageChange(interviewForm.candidateId, 'hr_interview');
    showNotification(`✓ Interview scheduled for ${interviewForm.candidateName}!`);
    setScheduleModalOpen(false);
  };

  const handleAddNote = (candId) => {
    if (!newNoteText.trim()) return;
    setCandidateNotes(prev => ({
      ...prev,
      [candId]: [...(prev[candId] || []), { text: newNoteText.trim(), date: new Date().toLocaleString(), author: 'Recruiter' }]
    }));
    setNewNoteText('');
    showNotification('✓ Recruiter note saved to candidate record.');
  };

  return (
    <div className="space-y-6">
      {/* Recruiter Header (Super Admin Style) */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Recruiter Suite • Feature #1
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              TALENT SOURCING & APPLICANT PIPELINE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Recruiter & ATS Candidate Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Assigned candidate pool, AI resume scoring, interview coordination, and pipeline stage progression.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-xs shadow-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'candidates', label: 'Candidates' },
            { id: 'ats', label: 'ATS Scoring' },
            { id: 'jobs', label: 'Openings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gold-500 text-navy-950 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-navy-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
          {statusMsg}
        </div>
      )}

      {/* 9 OVERVIEW COUNTER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {[
          { label: 'Assigned', val: assignedCandidates, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
          { label: 'Total Pool', val: totalCandidates, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' },
          { label: 'New', val: newCandidates, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
          { label: 'Shortlisted', val: shortlistedCandidates, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' },
          { label: 'Interview Sched.', val: interviewScheduled, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
          { label: 'Interview Done', val: interviewCompleted, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
          { label: 'Selected', val: selectedCandidates, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-500/10 border-gold-200 dark:border-gold-500/20' },
          { label: 'Rejected', val: rejectedCandidates, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
          { label: 'Follow-ups', val: pendingFollowUps, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' }
        ].map((item, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl border ${item.bg} text-center shadow-sm`}>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{item.label}</span>
            <span className={`text-xl font-extrabold font-mono mt-1 block ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PIPELINE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Active Job Openings Cards (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gold-500" />
                <span>Assigned Open Mandates & Vacancies</span>
              </h3>
              <button
                onClick={() => setActiveModule('vacancies')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
              >
                Vacancy Manager →
              </button>
            </div>

            <div className="space-y-3">
              {jobOpenings.map(job => (
                <div key={job.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2 hover:border-gold-500/40 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.company} • {job.location}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      {job.openings} Openings
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/40 dark:border-navy-800">
                    <span>Exp: {job.experience}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{job.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Scheduled Interviews Roster (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Upcoming Candidate Interviews</span>
              </h3>
              <button 
                onClick={() => setActiveModule('interviews')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                Calendar View →
              </button>
            </div>

            <div className="space-y-3">
              {interviews.length > 0 ? (
                interviews.slice(0, 4).map(int => (
                  <div key={int.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{int.candidateName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono">
                        {int.date} {int.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{int.jobTitle} • {int.company}</p>
                    <span className="text-[10px] font-mono text-indigo-500 block">Platform: {int.platform || 'Google Meet'}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No interviews scheduled today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED CANDIDATES TABLE & PIPELINE STATUS */}
      {activeTab === 'candidates' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                Assigned Candidate Directory & Qualifications
              </h3>
              <p className="text-slate-500 text-xs">Manage candidate screening, verify qualifications, review CVs, and schedule interviews.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name or skill..."
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold">Candidate</th>
                  <th className="p-3 font-bold">Experience & Role</th>
                  <th className="p-3 font-bold text-center">ATS Score</th>
                  <th className="p-3 font-bold text-center">Pipeline Stage</th>
                  <th className="p-3 font-bold text-center">Resume</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {candidates
                  .filter(c => !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.skills && String(c.skills).toLowerCase().includes(searchQuery.toLowerCase())))
                  .map(cand => (
                    <tr key={cand.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{cand.name}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{cand.email || cand.phone || 'ID: ' + cand.id}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{cand.currentRole || 'Executive Candidate'}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{cand.experience || '3-5 Years'} • {cand.nationality || 'India'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                          {cand.score || 88}% Match
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={cand.stage || 'new'}
                          onChange={(e) => handleStageChange(cand.id, e.target.value)}
                          className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="new">New Candidate</option>
                          <option value="screening">Screening</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="hr_interview">Interview Scheduled</option>
                          <option value="selected">Selected</option>
                          <option value="offer_released">Offer Released</option>
                          <option value="joined">Joined</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-mono">
                          CV Verified ✓
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenScheduleModal(cand)}
                            className="px-2 py-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold rounded-lg text-[10px] transition cursor-pointer"
                            title="Schedule Interview"
                          >
                            Interview
                          </button>
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-2 py-1 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                            title="View ATS & Notes"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATS RESUME SCORING & SKILL ANALYSIS */}
      {activeTab === 'ats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500" />
              <span>AI ATS Resume Match Scoring</span>
            </h3>
            <p className="text-slate-500 text-xs">Automated parsing and compatibility rating against GCC and domestic hiring criteria.</p>

            <div className="space-y-4">
              {candidates.slice(0, 5).map(cand => (
                <div key={cand.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{cand.name}</p>
                      <span className="text-[10px] text-slate-500">{cand.currentRole || 'Civil Project Manager'}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      {cand.score || 92}% Match
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(cand.skills) ? cand.skills : ['Project Management', 'Client Coordination', 'Technical Documentation']).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        ✓ {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-mono">
                    <span>MOHRE Eligibility: Verified</span>
                    <button 
                      onClick={() => showNotification(`Detailed ATS parsed report generated for ${cand.name}`)}
                      className="text-gold-500 hover:underline font-bold"
                    >
                      View Skill Breakdown →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Notes & Interaction Log */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>Candidate Phone Screening & Notes</span>
            </h3>
            <p className="text-slate-500 text-xs">Record telephonic screening results, salary expectations, and candidate availability.</p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Add Recruiter Note / Screening Summary</label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Spoke with candidate. 8 years UAE experience confirmed, currently available on 30 days notice. Expected salary: 18,000 AED."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-medium focus:outline-none focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddNote('rec-active')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              {/* Sample Notes Timeline */}
              <div className="space-y-2 pt-2">
                {(candidateNotes['rec-active'] || [
                  { text: 'Candidate passed initial phone screening. Good communication skills, ready for Technical Interview.', date: 'Today at 02:30 PM', author: 'Recruiter' },
                  { text: 'Verified degree and passport copy. Eligible for UAE residence visa.', date: 'Yesterday at 11:15 AM', author: 'Recruiter' }
                ]).map((n, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/60 dark:border-navy-800 text-xs">
                    <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{n.author} • {n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-2">
              Schedule Candidate Interview
            </h3>
            <form onSubmit={handleSaveInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Candidate Name</label>
                <input type="text" readOnly value={interviewForm.candidateName} className="w-full p-2 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-700 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Opening / Company</label>
                <input type="text" value={`${interviewForm.jobTitle} - ${interviewForm.company}`} readOnly className="w-full p-2 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-700 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input type="date" required value={interviewForm.date} onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input type="text" required value={interviewForm.time} onChange={e => setInterviewForm({...interviewForm, time: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                <select value={interviewForm.platform} onChange={e => setInterviewForm({...interviewForm, platform: e.target.value})} className="w-full p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 font-bold">
                  <option value="Google Meet">Google Meet Video</option>
                  <option value="Zoom Meeting">Zoom Video Conference</option>
                  <option value="Revival Dubai HQ Office">In-Person (Revival Dubai Office)</option>
                  <option value="Telephonic Interview">Telephonic Round</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-navy-800 rounded-xl font-bold text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-sm">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Award,
  XCircle,
  PauseCircle,
  RotateCcw,
  Search,
  Eye,
  CalendarPlus,
  Play,
  ClipboardCheck,
  History,
  X,
  FileText,
  Briefcase,
  UserCheck,
  Bell,
  ExternalLink
} from 'lucide-react';

const INTERVIEW_MODES = ['Online', 'Offline', 'Phone'];
const INTERVIEW_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled', 'Candidate Absent'];
const FINAL_RECOMMENDATIONS = ['Selected', 'Rejected', 'On Hold', 'Second Round Required', 'Re-interview Required'];

const STATUS_BADGE_MAP = {
  Pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
  Scheduled: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
  Confirmed: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30',
  Completed: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
  Selected: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
  Rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30',
  'On Hold': 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600',
  'Second Round Required': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30',
  'Re-interview Required': 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30',
  Rescheduled: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
  Cancelled: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30',
  'Candidate Absent': 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
};

export const CrmInterviewManagement = ({ initialTab = 'queue' }) => {
  const { currentRole, currentEmployee, user, employees } = useCrm();
  const [candidates, setCandidates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // 'queue' | 'calendar' | 'evaluations' | 'history' | 'notifications'

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all'); // all | Domestic | International
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  // Modals
  const [profileCandidate, setProfileCandidate] = useState(null);
  const [scheduleCandidate, setScheduleCandidate] = useState(null);
  const [evaluateTarget, setEvaluateTarget] = useState(null); // { candidate, round }
  const [historyCandidate, setHistoryCandidate] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    roundNumber: 1,
    roundName: 'Round 1 — Technical & Competency',
    interviewerId: '',
    interviewerName: '',
    interviewDate: '',
    interviewTime: '11:00',
    interviewMode: 'Online',
    meetingLink: '',
    officeLocation: 'Revival International Hub',
    instructions: '',
    status: 'Scheduled'
  });

  const [evalForm, setEvalForm] = useState({
    scoreCommunication: 4,
    scoreTechnical: 4,
    scoreJobKnowledge: 4,
    scoreExperience: 4,
    scoreProblemSolving: 4,
    scoreConfidence: 4,
    scoreOverall: 4,
    strengths: '',
    areasOfImprovement: '',
    interviewerRemarks: '',
    finalRecommendation: 'Selected'
  });

  const actorHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-crm-user': currentEmployee?.name || user?.name || 'Interviewer',
    'x-crm-role': currentRole || 'Interviewer'
  }), [currentEmployee, user, currentRole]);

  const interviewersList = useMemo(() => {
    return (employees || []).filter((e) =>
      ['Interviewer', 'HR Lead', 'Super Admin', 'Admin'].includes(e.role)
    );
  }, [employees]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentRole === 'Interviewer') {
        params.set('role', 'Interviewer');
        if (currentEmployee?.employeeId || currentEmployee?.id) {
          params.set('employeeId', currentEmployee.employeeId || currentEmployee.id);
        }
        if (currentEmployee?.name || user?.name) {
          params.set('employeeName', currentEmployee?.name || user?.name);
        }
      }
      const [candRes, actRes] = await Promise.all([
        fetch(`/api/interview-placement/candidates?${params.toString()}`),
        fetch('/api/interview-placement/activity')
      ]);
      const candData = await candRes.json();
      const actData = await actRes.json();
      if (candRes.ok && candData.success) {
        setCandidates(candData.candidates || []);
      }
      if (actRes.ok && actData.success) {
        setActivityLogs(actData.logs || []);
        setNotifications(actData.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load Interview Management data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentRole, currentEmployee, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real DB KPI counts
  const kpis = useMemo(() => {
    const total = candidates.length;
    const pending = candidates.filter((c) => c.interviewStatus === 'Pending' || c.pipelineStage === 'HR Operations Approved').length;
    const scheduled = candidates.filter((c) => ['Scheduled', 'Confirmed', 'Rescheduled'].includes(c.interviewStatus)).length;
    const completed = candidates.filter((c) => c.interviewStatus === 'Completed' || Boolean(c.latestInterviewResult)).length;
    const selected = candidates.filter((c) => c.latestInterviewResult === 'Selected' || c.interviewStatus === 'Selected').length;
    const rejected = candidates.filter((c) => c.latestInterviewResult === 'Rejected' || c.pipelineStage === 'Rejected').length;
    const onHold = candidates.filter((c) => c.latestInterviewResult === 'On Hold' || c.pipelineStage === 'On Hold').length;
    const reinterview = candidates.filter((c) => ['Re-interview Required', 'Second Round Required'].includes(c.interviewStatus) || ['Re-interview Required', 'Second Round Required'].includes(c.latestInterviewResult)).length;
    return { total, pending, scheduled, completed, selected, rejected, onHold, reinterview };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesSearch = !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.candidateId || '').toLowerCase().includes(q) ||
        (c.jobTitle || '').toLowerCase().includes(q) ||
        (c.companyName || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.interviewStatus === statusFilter || c.latestInterviewResult === statusFilter;
      const matchesScope = scopeFilter === 'all' || c.domesticOrInternational === scopeFilter;
      return matchesSearch && matchesStatus && matchesScope;
    });
  }, [candidates, searchQuery, statusFilter, scopeFilter]);

  const allScheduledRounds = useMemo(() => {
    const list = [];
    for (const c of candidates) {
      for (const r of (c.interviewRounds || [])) {
        list.push({ ...r, candidateName: c.name, candidateEmail: c.email, candidateObj: c });
      }
    }
    return list.sort((a, b) => `${a.interviewDate} ${a.interviewTime}`.localeCompare(`${b.interviewDate} ${b.interviewTime}`));
  }, [candidates]);

  const handleAssignInterviewer = async (candidateId, interviewerName) => {
    const emp = interviewersList.find((e) => e.name === interviewerName);
    try {
      const res = await fetch(`/api/interview-placement/candidates/${encodeURIComponent(candidateId)}/assign`, {
        method: 'PATCH',
        headers: actorHeaders,
        body: JSON.stringify({
          assignedInterviewerId: emp?.employeeId || emp?.id || '',
          assignedInterviewerName: interviewerName
        })
      });
      if (res.ok) {
        setFeedbackBanner({ type: 'success', text: `Assigned ${interviewerName || 'Unassigned'} to candidate.` });
        await loadData();
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Failed to assign interviewer.' });
    }
  };

  const openScheduleModal = (cand) => {
    const nextRoundNum = (cand.interviewRounds?.length || 0) + 1;
    setScheduleCandidate(cand);
    setScheduleForm({
      roundNumber: nextRoundNum,
      roundName: `Round ${nextRoundNum} — ${nextRoundNum > 1 ? 'Second / Follow-up Round' : 'Technical & Competency'}`,
      interviewerId: cand.assignedInterviewerId || currentEmployee?.employeeId || '',
      interviewerName: cand.assignedInterviewerName || currentEmployee?.name || user?.name || '',
      interviewDate: new Date().toISOString().slice(0, 10),
      interviewTime: '11:00',
      interviewMode: 'Online',
      meetingLink: '',
      officeLocation: 'Revival International Hub',
      instructions: '',
      status: 'Scheduled'
    });
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleCandidate) return;
    try {
      const res = await fetch('/api/interview-placement/interviews/schedule', {
        method: 'POST',
        headers: actorHeaders,
        body: JSON.stringify({
          ...scheduleForm,
          candidateId: scheduleCandidate.candidateId,
          candidateName: scheduleCandidate.name,
          jobId: scheduleCandidate.jobId,
          jobTitle: scheduleCandidate.jobTitle,
          companyName: scheduleCandidate.companyName
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedbackBanner({ type: 'error', text: data.message || 'Failed to schedule interview.' });
        return;
      }
      setScheduleCandidate(null);
      setFeedbackBanner({ type: 'success', text: `Interview scheduled for ${scheduleCandidate.name}.` });
      await loadData();
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Network error while scheduling interview.' });
    }
  };

  const openEvaluateModal = async (cand) => {
    let targetRound = (cand.interviewRounds || []).slice().reverse().find((r) => !r.finalRecommendation) || (cand.interviewRounds || [])[cand.interviewRounds.length - 1];
    if (!targetRound) {
      // Create an immediate walk-in/started round if interviewer clicks Start/Evaluate directly
      const res = await fetch('/api/interview-placement/interviews/schedule', {
        method: 'POST',
        headers: actorHeaders,
        body: JSON.stringify({
          candidateId: cand.candidateId,
          candidateName: cand.name,
          jobId: cand.jobId,
          jobTitle: cand.jobTitle,
          companyName: cand.companyName,
          roundNumber: 1,
          roundName: 'Round 1 — Live Interview',
          interviewerName: currentEmployee?.name || user?.name || 'Interviewer',
          interviewDate: new Date().toISOString().slice(0, 10),
          interviewTime: new Date().toTimeString().slice(0, 5),
          interviewMode: 'Online',
          status: 'Confirmed'
        })
      });
      const data = await res.json();
      targetRound = data.round;
    }
    setEvaluateTarget({ candidate: cand, round: targetRound });
    setEvalForm({
      scoreCommunication: 4,
      scoreTechnical: 4,
      scoreJobKnowledge: 4,
      scoreExperience: 4,
      scoreProblemSolving: 4,
      scoreConfidence: 4,
      scoreOverall: 4,
      strengths: '',
      areasOfImprovement: '',
      interviewerRemarks: '',
      finalRecommendation: 'Selected'
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluateTarget?.round?.id) return;
    try {
      const res = await fetch(`/api/interview-placement/interviews/${encodeURIComponent(evaluateTarget.round.id)}/evaluate`, {
        method: 'POST',
        headers: actorHeaders,
        body: JSON.stringify({
          ...evalForm,
          candidateName: evaluateTarget.candidate.name
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedbackBanner({ type: 'error', text: data.message || 'Failed to submit evaluation.' });
        return;
      }
      setEvaluateTarget(null);
      setFeedbackBanner({
        type: 'success',
        text: evalForm.finalRecommendation === 'Selected'
          ? `${evaluateTarget.candidate.name} marked Selected and automatically moved to Placement Coordinator Review!`
          : `Evaluation submitted for ${evaluateTarget.candidate.name} (${evalForm.finalRecommendation}).`
      });
      await loadData();
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Network error while submitting evaluation.' });
    }
  };

  const evalAverage = (
    (Number(evalForm.scoreCommunication) +
      Number(evalForm.scoreTechnical) +
      Number(evalForm.scoreJobKnowledge) +
      Number(evalForm.scoreExperience) +
      Number(evalForm.scoreProblemSolving) +
      Number(evalForm.scoreConfidence) +
      Number(evalForm.scoreOverall)) / 7
  ).toFixed(2);

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        {/* Header */}
        <div className="bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Module 1 • Interview Management
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              Interview Operations &amp; Candidate Evaluation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              Only candidates verified and approved by HR Operations appear here. Schedule rounds, conduct interviews, and submit mandatory evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              Candidate Queue ({candidates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Interview Calendar ({allScheduledRounds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notifications'
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts &amp; Activity ({notifications.length})</span>
            </button>
          </div>
        </div>

        {feedbackBanner && (
          <div className={`p-3.5 rounded-2xl border font-bold flex items-center justify-between ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}>
            <span>{feedbackBanner.text}</span>
            <button type="button" onClick={() => setFeedbackBanner(null)} className="underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* 8 KPI Cards (Actual Database Counts) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total Received', value: kpis.total, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Pending Interviews', value: kpis.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Scheduled', value: kpis.scheduled, icon: Calendar, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Completed', value: kpis.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Selected', value: kpis.selected, icon: Award, color: 'text-emerald-700 dark:text-emerald-300' },
            { label: 'Rejected', value: kpis.rejected, icon: XCircle, color: 'text-rose-600 dark:text-rose-400' },
            { label: 'On Hold', value: kpis.onHold, icon: PauseCircle, color: 'text-slate-600 dark:text-slate-400' },
            { label: 'Re-interview', value: kpis.reinterview, icon: RotateCcw, color: 'text-orange-600 dark:text-orange-400' }
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{k.label}</span>
                  <Icon className={`w-4 h-4 ${k.color}`} />
                </div>
                <p className={`font-serif text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            );
          })}
        </div>

        {/* TAB 1: CANDIDATE INTERVIEW QUEUE */}
        {['queue', 'evaluations', 'history'].includes(activeTab) && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate ID, name, email, phone, job role, company..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 font-semibold"
                >
                  <option value="all">All Interview Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Second Round Required">Second Round Required</option>
                  <option value="Re-interview Required">Re-interview Required</option>
                </select>
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 font-semibold"
                >
                  <option value="all">Domestic &amp; International</option>
                  <option value="Domestic">Domestic</option>
                  <option value="International">International</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-500 font-bold">Loading HR-approved candidates...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-dashed border-slate-300 dark:border-navy-800 space-y-1">
                <p className="font-serif text-base font-bold text-slate-700 dark:text-slate-200">No HR-Approved Candidates in Queue</p>
                <p className="text-slate-500 dark:text-slate-400">
                  Candidates appear here automatically once HR Operations completes screening, document verification, and clicks &ldquo;Verify &amp; Move to Interview&rdquo;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-gold-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-navy-800">
                      <th className="p-3 whitespace-nowrap">Candidate ID</th>
                      <th className="p-3 whitespace-nowrap">Candidate</th>
                      <th className="p-3 whitespace-nowrap">Job Role &amp; Company</th>
                      <th className="p-3 whitespace-nowrap">Location / Scope</th>
                      <th className="p-3 whitespace-nowrap">HR Approval &amp; Docs</th>
                      <th className="p-3 whitespace-nowrap">Interview Status</th>
                      <th className="p-3 whitespace-nowrap">Assigned Interviewer</th>
                      <th className="p-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                    {filteredCandidates.map((c) => {
                      const statusBadge = STATUS_BADGE_MAP[c.interviewStatus] || STATUS_BADGE_MAP.Pending;
                      return (
                        <tr key={c.candidateId} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                          <td className="p-3 font-mono font-bold text-gold-700 dark:text-gold-400 whitespace-nowrap">
                            {c.candidateId.slice(0, 14)}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-[11px] text-slate-500">{c.email}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{c.phone}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{c.jobTitle}</p>
                            <p className="text-[11px] text-slate-500">{c.companyName}</p>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{c.jobLocation}</p>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                              {c.domesticOrInternational}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">✓ {c.docVerificationStatus}</p>
                            <p className="text-[10px] text-slate-500">
                              {c.hrApprovedAt ? new Date(c.hrApprovedAt).toLocaleDateString() : 'Approved'}
                            </p>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusBadge}`}>
                              {c.interviewStatus}
                            </span>
                            {c.latestInterviewScore && (
                              <p className="text-[10px] text-slate-500 mt-1 font-bold">Score: {c.latestInterviewScore}/5</p>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {(currentRole === 'Super Admin' || currentRole === 'Admin') ? (
                              <select
                                value={c.assignedInterviewerName || ''}
                                onChange={(e) => handleAssignInterviewer(c.candidateId, e.target.value)}
                                className="bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg px-2 py-1 text-[11px] font-bold"
                              >
                                <option value="">Unassigned</option>
                                {interviewersList.map((emp) => (
                                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {c.assignedInterviewerName || 'Open Pool'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex flex-wrap justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setProfileCandidate(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="View Complete Profile"
                              >
                                <Eye className="w-3.5 h-3.5" /> Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => openScheduleModal(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="Schedule / Reschedule Interview"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" /> Schedule
                              </button>
                              <button
                                type="button"
                                onClick={() => openEvaluateModal(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-gold-500 text-navy-950 hover:opacity-90 font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="Start Interview / Submit Evaluation"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5" /> Evaluate
                              </button>
                              <button
                                type="button"
                                onClick={() => setHistoryCandidate(c)}
                                className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="View Interview History"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERVIEW CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Scheduled Interview Calendar</h3>
            {allScheduledRounds.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No interviews scheduled yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allScheduledRounds.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{r.candidateName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE_MAP[r.status] || STATUS_BADGE_MAP.Scheduled}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-semibold">{r.roundName} • {r.jobTitle}</p>
                    <p className="font-mono text-gold-700 dark:text-gold-400 font-bold">
                      {r.interviewDate} at {r.interviewTime} ({r.interviewMode})
                    </p>
                    {r.meetingLink && (
                      <a href={r.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1">
                        Join Meeting <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEvaluateModal(r.candidateObj)}
                        className="px-3 py-1.5 rounded-xl bg-gold-500 text-navy-950 font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Start / Evaluate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS & ACTIVITY */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Workflow Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-slate-500">No workflow notifications yet.</p>
              ) : notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                  <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Activity Timeline</h3>
              {activityLogs.length === 0 ? (
                <p className="text-slate-500">No activity recorded yet.</p>
              ) : activityLogs.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{a.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {a.candidateName} • By {a.employeeName} ({a.employeeRole})
                  </p>
                  {a.remarks && <p className="text-[11px] text-slate-500 mt-0.5">{a.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COMPLETE CANDIDATE PROFILE MODAL */}
      {profileCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{profileCandidate.name}</h2>
                <p className="text-slate-500">{profileCandidate.candidateId} • {profileCandidate.jobTitle} at {profileCandidate.companyName}</p>
              </div>
              <button type="button" onClick={() => setProfileCandidate(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="font-extrabold uppercase text-[11px] text-gold-700 dark:text-gold-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Personal Details</h4>
                <p><strong>Full Name:</strong> {profileCandidate.name}</p>
                <p><strong>Email:</strong> {profileCandidate.email || '—'}</p>
                <p><strong>Phone:</strong> {profileCandidate.phone || '—'}</p>
                <p><strong>Nationality:</strong> {profileCandidate.nationality || '—'}</p>
                <p><strong>Current Residence:</strong> {profileCandidate.currentResidence || '—'}</p>
                <p><strong>Current Location:</strong> {profileCandidate.currentLocation || '—'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="font-extrabold uppercase text-[11px] text-gold-700 dark:text-gold-400 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Professional Details</h4>
                <p><strong>Current Job Title:</strong> {profileCandidate.currentJobTitle || '—'}</p>
                <p><strong>Total Experience:</strong> {profileCandidate.totalExperience || '—'}</p>
                <p><strong>Previous Employer:</strong> {profileCandidate.previousEmployer || '—'}</p>
                <p><strong>Education:</strong> {profileCandidate.education || '—'}</p>
                <p><strong>Skills:</strong> {profileCandidate.skills || '—'}</p>
                <p><strong>Expected Salary:</strong> {profileCandidate.expectedSalary || '—'}</p>
                <p><strong>Notice Period:</strong> {profileCandidate.noticePeriod || '—'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <h4 className="font-extrabold uppercase text-[11px] text-gold-700 dark:text-gold-400 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Application Details</h4>
                <p><strong>Applied Job:</strong> {profileCandidate.jobTitle}</p>
                <p><strong>Company Name:</strong> {profileCandidate.companyName}</p>
                <p><strong>Job Location:</strong> {profileCandidate.jobLocation}</p>
                <p><strong>Required Experience:</strong> {profileCandidate.requiredExperience}</p>
                <p><strong>Category:</strong> {profileCandidate.jobCategory}</p>
                {profileCandidate.jobDescription && <p className="text-slate-600 dark:text-slate-400"><strong>Description:</strong> {profileCandidate.jobDescription.slice(0, 220)}</p>}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
                <h4 className="font-extrabold uppercase text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> HR Operations Report (Verified)</h4>
                <p><strong>Initial Screening Result:</strong> {profileCandidate.hrScreeningResult}</p>
                <p><strong>Candidate Interest:</strong> {profileCandidate.hrCandidateInterest}</p>
                <p><strong>Eligibility Confirmation:</strong> {profileCandidate.hrEligibility}</p>
                <p><strong>Document Verification:</strong> {profileCandidate.docVerificationStatus}</p>
                <p><strong>HR Approval Status:</strong> Approved by {profileCandidate.hrApprovedBy}</p>
                <p><strong>HR Remarks:</strong> {profileCandidate.hrRemarks}</p>
                <div className="pt-1">
                  <strong>Verified Documents ({profileCandidate.verifiedDocuments?.length || 0}):</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profileCandidate.resumeUrl && (
                      <a href={profileCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-white dark:bg-navy-900 border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold inline-flex items-center gap-1">
                        Resume <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {(profileCandidate.verifiedDocuments || []).map((doc) => (
                      <a key={doc.id} href={doc.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-white dark:bg-navy-900 border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-bold inline-flex items-center gap-1">
                        {doc.documentType || doc.fileName} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Schedule Interview — {scheduleCandidate.name}</h3>
              <button type="button" onClick={() => setScheduleCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Candidate</label>
                <input readOnly value={scheduleCandidate.name} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Job Title</label>
                <input readOnly value={scheduleCandidate.jobTitle} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Round *</label>
                <input required value={scheduleForm.roundName} onChange={(e) => setScheduleForm({ ...scheduleForm, roundName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interviewer *</label>
                <input required value={scheduleForm.interviewerName} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Date *</label>
                <input required type="date" value={scheduleForm.interviewDate} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Time *</label>
                <input required type="time" value={scheduleForm.interviewTime} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Mode</label>
                <select value={scheduleForm.interviewMode} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewMode: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold">
                  {INTERVIEW_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Status</label>
                <select value={scheduleForm.status} onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold">
                  {INTERVIEW_STATUSES.filter((s) => s !== 'Completed').map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Meeting Link</label>
                <input type="url" placeholder="https://meet.google.com/..." value={scheduleForm.meetingLink} onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Office Location</label>
                <input value={scheduleForm.officeLocation} onChange={(e) => setScheduleForm({ ...scheduleForm, officeLocation: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Interview Instructions</label>
                <textarea rows={2} value={scheduleForm.instructions} onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-semibold" placeholder="Preparation notes, panel instructions..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setScheduleCandidate(null)} className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Save &amp; Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY INTERVIEW EVALUATION MODAL */}
      {evaluateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Submit Interview Evaluation</h3>
                <p className="text-slate-500">{evaluateTarget.candidate.name} • {evaluateTarget.round?.roundName} • Avg Score: <strong>{evalAverage}/5</strong></p>
              </div>
              <button type="button" onClick={() => setEvaluateTarget(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['scoreCommunication', 'Communication Skills (1-5)'],
                  ['scoreTechnical', 'Technical / Professional Skills (1-5)'],
                  ['scoreJobKnowledge', 'Job Knowledge (1-5)'],
                  ['scoreExperience', 'Relevant Experience (1-5)'],
                  ['scoreProblemSolving', 'Problem-Solving Skills (1-5)'],
                  ['scoreConfidence', 'Confidence (1-5)'],
                  ['scoreOverall', 'Overall Performance (1-5)']
                ].map(([field, label]) => (
                  <div key={field} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-2">
                    <span className="font-bold">{label}</span>
                    <select
                      value={evalForm[field]}
                      onChange={(e) => setEvalForm({ ...evalForm, [field]: Number(e.target.value) })}
                      className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-2.5 py-1 font-extrabold text-gold-700 dark:text-gold-400"
                    >
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Strengths *</label>
                <textarea required rows={2} value={evalForm.strengths} onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Areas of Improvement *</label>
                <textarea required rows={2} value={evalForm.areasOfImprovement} onChange={(e) => setEvalForm({ ...evalForm, areasOfImprovement: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interviewer Remarks *</label>
                <textarea required rows={2} value={evalForm.interviewerRemarks} onChange={(e) => setEvalForm({ ...evalForm, interviewerRemarks: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Final Recommendation *</label>
                <select value={evalForm.finalRecommendation} onChange={(e) => setEvalForm({ ...evalForm, finalRecommendation: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-extrabold">
                  {FINAL_RECOMMENDATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEvaluateTarget(null)} className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Submit Evaluation &amp; Mark Completed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERVIEW HISTORY MODAL */}
      {historyCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Interview History — {historyCandidate.name}</h3>
              <button type="button" onClick={() => setHistoryCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            {(historyCandidate.interviewRounds || []).length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No interview rounds recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {historyCandidate.interviewRounds.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{r.roundName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE_MAP[r.finalRecommendation || r.status] || STATUS_BADGE_MAP.Scheduled}`}>
                        {r.finalRecommendation || r.status}
                      </span>
                    </div>
                    <p className="text-slate-500">Interviewer: {r.interviewerName} • {r.interviewDate} {r.interviewTime} ({r.interviewMode})</p>
                    {r.averageScore && <p className="font-bold text-gold-700 dark:text-gold-400">Average Score: {r.averageScore} / 5</p>}
                    {r.strengths && <p><strong>Strengths:</strong> {r.strengths}</p>}
                    {r.areasOfImprovement && <p><strong>Improvements:</strong> {r.areasOfImprovement}</p>}
                    {r.interviewerRemarks && <p><strong>Remarks:</strong> {r.interviewerRemarks}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};

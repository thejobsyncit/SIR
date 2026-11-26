import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import {
  Users,
  Clock,
  CheckCircle2,
  Send,
  Calendar,
  Award,
  Briefcase,
  Search,
  Eye,
  FileCheck,
  Building2,
  X,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

const PLACEMENT_QUALIFIED_STAGES = new Set([
  'Interview Selected',
  'Placement Coordinator Review',
  'Approved for Company Submission',
  'Submitted to Employer',
  'Employer Interview',
  'Employer Selected',
  'Offer Released',
  'Joining Pending',
  'Successfully Placed',
  'On Hold',
  'Rejected'
]);

const SUBMISSION_STATUSES = [
  'Ready for Submission',
  'Submitted',
  'Awaiting Employer Response',
  'Shortlisted',
  'Interview Requested',
  'Interview Scheduled',
  'Rejected by Employer',
  'Selected by Employer'
];

const EMPLOYER_FEEDBACK_OPTIONS = [
  'Awaiting Feedback',
  'Selected',
  'Rejected',
  'On Hold',
  'Second Round Required',
  'Final Round Required'
];

const OFFER_STATUSES = ['Pending', 'Released', 'Accepted', 'Declined', 'Expired'];

export const CrmPlacementCoordinator = () => {
  const { currentRole, currentEmployee, user, employees } = useCrm();
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  // Modals
  const [reviewCandidate, setReviewCandidate] = useState(null);
  const [submitCandidate, setSubmitCandidate] = useState(null);
  const [empInterviewCandidate, setEmpInterviewCandidate] = useState(null);
  const [offerCandidate, setOfferCandidate] = useState(null);

  const [decisionForm, setDecisionForm] = useState({ decision: 'Approved for Company Submission', remarks: '' });
  const [subForm, setSubForm] = useState({
    companyName: '',
    employerContactName: '',
    employerEmail: '',
    jobTitle: '',
    jobLocation: '',
    proposedSalary: '',
    submissionDate: new Date().toISOString().slice(0, 10),
    submissionRemarks: '',
    consentRecorded: true,
    status: 'Submitted'
  });
  const [empIntForm, setEmpIntForm] = useState({
    submissionId: '',
    companyName: '',
    jobRole: '',
    interviewRound: 'Round 1',
    employerInterviewer: '',
    interviewDate: new Date().toISOString().slice(0, 10),
    interviewTime: '14:00',
    interviewMode: 'Online',
    meetingLink: '',
    instructions: ''
  });
  const [offerForm, setOfferForm] = useState({
    offeredJobRole: '',
    companyName: '',
    salary: '',
    currency: 'AED',
    benefits: '',
    offerReleaseDate: new Date().toISOString().slice(0, 10),
    offerExpiryDate: '',
    joiningDate: '',
    offerLetterRef: '',
    candidateAcceptance: 'Pending',
    offerStatus: 'Released',
    finalPlacementStatus: 'Placement In Progress'
  });

  const actorHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-crm-user': currentEmployee?.name || user?.name || 'Placement Coordinator',
    'x-crm-role': currentRole || 'Placement Coordinator'
  }), [currentEmployee, user, currentRole]);

  const coordinatorsList = useMemo(() => {
    return (employees || []).filter((e) =>
      ['Placement Coordinator', 'Super Admin', 'Admin'].includes(e.role)
    );
  }, [employees]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/interview-placement/candidates');
      const data = await res.json();
      if (res.ok && data.success) {
        setAllCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error('Failed to load Placement Coordinator data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only candidates who have HR approval AND Selected interview result (or progressed into placement)
  const qualifiedCandidates = useMemo(() => {
    return allCandidates.filter((c) => {
      if (c.latestInterviewResult === 'Selected') return true;
      return PLACEMENT_QUALIFIED_STAGES.has(c.pipelineStage) && Boolean(c.latestInterviewResult || c.placementDecision);
    });
  }, [allCandidates]);

  // 9 Real KPIs
  const kpis = useMemo(() => {
    const totalQualified = qualifiedCandidates.length;
    const pendingReview = qualifiedCandidates.filter((c) => c.pipelineStage === 'Placement Coordinator Review' || c.pipelineStage === 'Interview Selected').length;
    const approvedSubmission = qualifiedCandidates.filter((c) => c.pipelineStage === 'Approved for Company Submission' || c.placementDecision === 'Approved for Company Submission').length;
    const submittedCompanies = qualifiedCandidates.filter((c) => (c.employerSubmissions || []).length > 0).length;
    const empIntScheduled = qualifiedCandidates.filter((c) => (c.employerInterviews || []).some((ei) => ei.feedback === 'Awaiting Feedback')).length;
    const empIntCompleted = qualifiedCandidates.filter((c) => (c.employerInterviews || []).some((ei) => ei.feedback && ei.feedback !== 'Awaiting Feedback')).length;
    const selectedByEmployer = qualifiedCandidates.filter((c) => c.pipelineStage === 'Employer Selected' || (c.employerInterviews || []).some((ei) => ei.feedback === 'Selected') || (c.employerSubmissions || []).some((s) => s.status === 'Selected by Employer')).length;
    const offersReleased = qualifiedCandidates.filter((c) => (c.placementOffers || []).some((o) => ['Released', 'Accepted'].includes(o.offerStatus))).length;
    const successfullyPlaced = qualifiedCandidates.filter((c) => c.pipelineStage === 'Successfully Placed' || c.finalPlacementStatus === 'Successfully Placed').length;
    return {
      totalQualified,
      pendingReview,
      approvedSubmission,
      submittedCompanies,
      empIntScheduled,
      empIntCompleted,
      selectedByEmployer,
      offersReleased,
      successfullyPlaced
    };
  }, [qualifiedCandidates]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return qualifiedCandidates.filter((c) => {
      const matchesSearch = !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.candidateId || '').toLowerCase().includes(q) ||
        (c.jobTitle || '').toLowerCase().includes(q) ||
        (c.companyName || '').toLowerCase().includes(q);
      const matchesStage = stageFilter === 'all' || c.pipelineStage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [qualifiedCandidates, searchQuery, stageFilter]);

  const handleAssignCoordinator = async (candidateId, coordName) => {
    const emp = coordinatorsList.find((e) => e.name === coordName);
    const res = await fetch(`/api/interview-placement/candidates/${encodeURIComponent(candidateId)}/assign`, {
      method: 'PATCH',
      headers: actorHeaders,
      body: JSON.stringify({
        assignedCoordinatorId: emp?.employeeId || emp?.id || '',
        assignedCoordinatorName: coordName
      })
    });
    if (res.ok) {
      setFeedbackBanner({ type: 'success', text: `Assigned ${coordName || 'Unassigned'} as Placement Coordinator.` });
      await loadData();
    }
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!reviewCandidate) return;
    const res = await fetch(`/api/interview-placement/placement/${encodeURIComponent(reviewCandidate.candidateId)}/decision`, {
      method: 'POST',
      headers: actorHeaders,
      body: JSON.stringify({
        ...decisionForm,
        candidateName: reviewCandidate.name
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setFeedbackBanner({ type: 'error', text: data.message || 'Failed to save placement decision.' });
      return;
    }
    setReviewCandidate(null);
    setFeedbackBanner({ type: 'success', text: `Decision "${decisionForm.decision}" saved for ${reviewCandidate.name}.` });
    await loadData();
  };

  const openSubmitModal = (cand) => {
    setSubmitCandidate(cand);
    setSubForm({
      companyName: cand.companyName || '',
      employerContactName: '',
      employerEmail: '',
      jobTitle: cand.jobTitle || '',
      jobLocation: cand.jobLocation || '',
      proposedSalary: cand.expectedSalary || '',
      submissionDate: new Date().toISOString().slice(0, 10),
      submissionRemarks: '',
      consentRecorded: true,
      status: 'Submitted'
    });
  };

  const handleSubmitToCompany = async (e) => {
    e.preventDefault();
    if (!submitCandidate) return;
    const res = await fetch(`/api/interview-placement/placement/${encodeURIComponent(submitCandidate.candidateId)}/submissions`, {
      method: 'POST',
      headers: actorHeaders,
      body: JSON.stringify({
        ...subForm,
        candidateName: submitCandidate.name
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setFeedbackBanner({ type: 'error', text: data.message || 'Failed to submit to company.' });
      return;
    }
    setFeedbackBanner({ type: 'success', text: `${submitCandidate.name} submitted to ${subForm.companyName}.` });
    await loadData();
    // Refresh modal candidate
    setSubmitCandidate((prev) => prev ? { ...prev, employerSubmissions: [data.submission, ...(prev.employerSubmissions || [])] } : null);
  };

  const handleSubmissionStatusChange = async (subId, status) => {
    const res = await fetch(`/api/interview-placement/submissions/${encodeURIComponent(subId)}/status`, {
      method: 'PATCH',
      headers: actorHeaders,
      body: JSON.stringify({ status, candidateName: submitCandidate?.name || '' })
    });
    if (res.ok) {
      await loadData();
      setSubmitCandidate((prev) => prev ? {
        ...prev,
        employerSubmissions: (prev.employerSubmissions || []).map((s) => s.id === subId ? { ...s, status } : s)
      } : null);
    }
  };

  const openEmployerInterviewModal = (cand) => {
    const latestSub = (cand.employerSubmissions || [])[0];
    setEmpInterviewCandidate(cand);
    setEmpIntForm({
      submissionId: latestSub?.id || '',
      companyName: latestSub?.companyName || cand.companyName || '',
      jobRole: latestSub?.jobTitle || cand.jobTitle || '',
      interviewRound: `Round ${(cand.employerInterviews?.length || 0) + 1}`,
      employerInterviewer: '',
      interviewDate: new Date().toISOString().slice(0, 10),
      interviewTime: '14:00',
      interviewMode: 'Online',
      meetingLink: '',
      instructions: ''
    });
  };

  const handleScheduleEmployerInterview = async (e) => {
    e.preventDefault();
    if (!empInterviewCandidate) return;
    const res = await fetch(`/api/interview-placement/placement/${encodeURIComponent(empInterviewCandidate.candidateId)}/employer-interviews`, {
      method: 'POST',
      headers: actorHeaders,
      body: JSON.stringify({ ...empIntForm, candidateName: empInterviewCandidate.name })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setFeedbackBanner({ type: 'error', text: data.message || 'Failed to schedule employer interview.' });
      return;
    }
    setFeedbackBanner({ type: 'success', text: `Employer interview scheduled with ${empIntForm.companyName}.` });
    await loadData();
    setEmpInterviewCandidate((prev) => prev ? { ...prev, employerInterviews: [data.employerInterview, ...(prev.employerInterviews || [])] } : null);
  };

  const handleEmployerFeedback = async (eiId, feedback, feedbackNotes = '', nextInterviewDate = '') => {
    const res = await fetch(`/api/interview-placement/employer-interviews/${encodeURIComponent(eiId)}/feedback`, {
      method: 'PATCH',
      headers: actorHeaders,
      body: JSON.stringify({ feedback, feedbackNotes, nextInterviewDate, candidateName: empInterviewCandidate?.name || '' })
    });
    if (res.ok) {
      setFeedbackBanner({ type: 'success', text: `Employer feedback "${feedback}" recorded.` });
      await loadData();
      setEmpInterviewCandidate((prev) => prev ? {
        ...prev,
        employerInterviews: (prev.employerInterviews || []).map((ei) => ei.id === eiId ? { ...ei, feedback, feedbackNotes, nextInterviewDate } : ei)
      } : null);
    }
  };

  const openOfferModal = (cand) => {
    const latestSub = (cand.employerSubmissions || [])[0];
    setOfferCandidate(cand);
    setOfferForm({
      offeredJobRole: latestSub?.jobTitle || cand.jobTitle || '',
      companyName: latestSub?.companyName || cand.companyName || '',
      salary: latestSub?.proposedSalary || cand.expectedSalary || '',
      currency: 'AED',
      benefits: 'Visa, Medical Insurance, Annual Ticket',
      offerReleaseDate: new Date().toISOString().slice(0, 10),
      offerExpiryDate: '',
      joiningDate: '',
      offerLetterRef: `OFF-${Date.now().toString().slice(-6)}`,
      candidateAcceptance: 'Pending',
      offerStatus: 'Released',
      finalPlacementStatus: 'Placement In Progress'
    });
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!offerCandidate) return;
    const res = await fetch(`/api/interview-placement/placement/${encodeURIComponent(offerCandidate.candidateId)}/offers`, {
      method: 'POST',
      headers: actorHeaders,
      body: JSON.stringify({ ...offerForm, candidateName: offerCandidate.name })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setFeedbackBanner({ type: 'error', text: data.message || 'Failed to release offer.' });
      return;
    }
    setFeedbackBanner({ type: 'success', text: `Offer released for ${offerCandidate.name} at ${offerForm.companyName}.` });
    await loadData();
    setOfferCandidate((prev) => prev ? { ...prev, placementOffers: [data.offer, ...(prev.placementOffers || [])] } : null);
  };

  const handleConfirmJoining = async (offerId) => {
    const res = await fetch(`/api/interview-placement/offers/${encodeURIComponent(offerId)}`, {
      method: 'PATCH',
      headers: actorHeaders,
      body: JSON.stringify({
        offerStatus: 'Accepted',
        candidateAcceptance: 'Accepted',
        joiningConfirmed: true,
        finalPlacementStatus: 'Successfully Placed',
        candidateName: offerCandidate?.name || ''
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setFeedbackBanner({ type: 'success', text: `${offerCandidate?.name} joining confirmed and marked Successfully Placed!` });
      await loadData();
      setOfferCandidate((prev) => prev ? {
        ...prev,
        placementOffers: (prev.placementOffers || []).map((o) => o.id === offerId ? { ...o, offerStatus: 'Accepted', candidateAcceptance: 'Accepted', finalPlacementStatus: 'Successfully Placed' } : o)
      } : null);
    }
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        {/* Header */}
        <div className="bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Module 2 • Placement Coordinator Management
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            Placement Review, Employer Submissions &amp; Offer Tracking
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-0.5">
            Review interview-qualified candidates, approve for company submission, manage employer interviews, release offers, and confirm actual joining.
          </p>
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

        {/* 9 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {[
            { label: 'Qualified', value: kpis.totalQualified, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Pending Review', value: kpis.pendingReview, icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Approved Sub.', value: kpis.approvedSubmission, icon: CheckCircle2, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Submitted', value: kpis.submittedCompanies, icon: Send, color: 'text-cyan-600 dark:text-cyan-400' },
            { label: 'Emp. Int. Sched', value: kpis.empIntScheduled, icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Emp. Int. Done', value: kpis.empIntCompleted, icon: FileCheck, color: 'text-teal-600 dark:text-teal-400' },
            { label: 'Emp. Selected', value: kpis.selectedByEmployer, icon: Building2, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Offers Released', value: kpis.offersReleased, icon: Briefcase, color: 'text-amber-700 dark:text-gold-400' },
            { label: 'Placed', value: kpis.successfullyPlaced, icon: Award, color: 'text-emerald-700 dark:text-emerald-300' }
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{k.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${k.color}`} />
                </div>
                <p className={`font-serif text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            );
          })}
        </div>

        {/* Placement Candidate Queue */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate ID, name, applied job, company..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 font-semibold"
            >
              <option value="all">All Placement Stages</option>
              <option value="Placement Coordinator Review">Pending Placement Review</option>
              <option value="Approved for Company Submission">Approved for Company Submission</option>
              <option value="Submitted to Employer">Submitted to Employer</option>
              <option value="Employer Interview">Employer Interview</option>
              <option value="Employer Selected">Employer Selected</option>
              <option value="Offer Released">Offer Released</option>
              <option value="Joining Pending">Joining Pending</option>
              <option value="Successfully Placed">Successfully Placed</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 font-bold">Loading interview-qualified candidates...</div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-dashed border-slate-300 dark:border-navy-800 space-y-1">
              <p className="font-serif text-base font-bold text-slate-700 dark:text-slate-200">No Qualified Candidates Ready for Placement</p>
              <p className="text-slate-500 dark:text-slate-400">
                Candidates automatically appear here once they pass HR Operations verification and receive a &ldquo;Selected&rdquo; evaluation in Interview Management.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-gold-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Applied Job &amp; Company</th>
                    <th className="p-3">Country / Exp / Salary</th>
                    <th className="p-3">HR &amp; Interview Score</th>
                    <th className="p-3">Placement Status</th>
                    <th className="p-3">Coordinator</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                  {filteredCandidates.map((c) => (
                    <tr key={c.candidateId} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3">
                        <p className="font-mono text-[10px] text-gold-700 dark:text-gold-400 font-bold">{c.candidateId.slice(0, 14)}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.nationality}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{c.jobTitle}</p>
                        <p className="text-[11px] text-slate-500">{c.companyName}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{c.jobLocation}</p>
                        <p className="text-[10px] text-slate-500">{c.totalExperience} • {c.expectedSalary}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">HR: {c.docVerificationStatus}</p>
                        <p className="text-[11px] font-bold text-gold-700 dark:text-gold-400">
                          Int: {c.latestInterviewResult || 'Selected'} {c.latestInterviewScore ? `(${c.latestInterviewScore}/5)` : ''}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                          {c.pipelineStage}
                        </span>
                      </td>
                      <td className="p-3">
                        {(currentRole === 'Super Admin' || currentRole === 'Admin') ? (
                          <select
                            value={c.assignedCoordinatorName || ''}
                            onChange={(e) => handleAssignCoordinator(c.candidateId, e.target.value)}
                            className="bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg px-2 py-1 text-[11px] font-bold"
                          >
                            <option value="">Unassigned</option>
                            {coordinatorsList.map((emp) => (
                              <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-semibold">{c.assignedCoordinatorName || 'Placement Desk'}</span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReviewCandidate(c);
                              setDecisionForm({ decision: 'Approved for Company Submission', remarks: '' });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review &amp; Decide
                          </button>
                          <button
                            type="button"
                            onClick={() => openSubmitModal(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Submit ({(c.employerSubmissions || []).length})
                          </button>
                          <button
                            type="button"
                            onClick={() => openEmployerInterviewModal(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Emp. Interview
                          </button>
                          <button
                            type="button"
                            onClick={() => openOfferModal(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-gold-500 text-navy-950 font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" /> Offer &amp; Joining
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PLACEMENT REVIEW & DECISION MODAL */}
      {reviewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Placement Review — {reviewCandidate.name}</h3>
                <p className="text-slate-500">{reviewCandidate.jobTitle} • {reviewCandidate.jobLocation} • Expected Salary: {reviewCandidate.expectedSalary}</p>
              </div>
              <button type="button" onClick={() => setReviewCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1.5">
                <h4 className="font-extrabold uppercase text-[11px] text-gold-700 dark:text-gold-400">Profile &amp; HR Screening Summary</h4>
                <p><strong>Email / Phone:</strong> {reviewCandidate.email} / {reviewCandidate.phone}</p>
                <p><strong>Experience:</strong> {reviewCandidate.totalExperience}</p>
                <p><strong>Skills:</strong> {reviewCandidate.skills || '—'}</p>
                <p><strong>HR Screening:</strong> {reviewCandidate.hrScreeningResult}</p>
                <p><strong>Docs Verified:</strong> {reviewCandidate.docVerificationStatus}</p>
                {reviewCandidate.resumeUrl && (
                  <a href={reviewCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-1 font-bold">
                    View Resume <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                <h4 className="font-extrabold uppercase text-[11px] text-emerald-700 dark:text-emerald-300">Internal Interview Evaluation Report</h4>
                <p><strong>Interview Result:</strong> {reviewCandidate.latestInterviewResult || 'Selected'}</p>
                <p><strong>Overall Average Score:</strong> {reviewCandidate.latestInterviewScore || '—'} / 5</p>
                {(reviewCandidate.interviewRounds || []).slice(-1).map((r) => (
                  <div key={r.id} className="space-y-1 pt-1 border-t border-emerald-200/60">
                    <p><strong>Interviewer:</strong> {r.interviewerName}</p>
                    <p><strong>Strengths:</strong> {r.strengths || '—'}</p>
                    <p><strong>Feedback / Remarks:</strong> {r.interviewerRemarks || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitDecision} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3">
              <h4 className="font-serif text-base font-bold">Placement Coordinator Decision</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Decision *</label>
                  <select value={decisionForm.decision} onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })} className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold">
                    <option value="Approved for Company Submission">Approved for Company Submission</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Return for Re-interview">Return for Re-interview</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Remarks (Mandatory) *</label>
                  <input required value={decisionForm.remarks} onChange={(e) => setDecisionForm({ ...decisionForm, remarks: e.target.value })} placeholder="Reason / instructions for submission..." className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewCandidate(null)} className="px-4 py-2 rounded-xl border border-slate-300 font-bold cursor-pointer">Close</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Save Placement Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYER / COMPANY SUBMISSION MODAL */}
      {submitCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold">Employer Submission — {submitCandidate.name}</h3>
              <button type="button" onClick={() => setSubmitCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmitToCompany} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Company Name *</label>
                <input required value={subForm.companyName} onChange={(e) => setSubForm({ ...subForm, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Job Title *</label>
                <input required value={subForm.jobTitle} onChange={(e) => setSubForm({ ...subForm, jobTitle: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Employer Contact Name</label>
                <input value={subForm.employerContactName} onChange={(e) => setSubForm({ ...subForm, employerContactName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Employer Email</label>
                <input type="email" value={subForm.employerEmail} onChange={(e) => setSubForm({ ...subForm, employerEmail: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Job Location</label>
                <input value={subForm.jobLocation} onChange={(e) => setSubForm({ ...subForm, jobLocation: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Proposed Salary</label>
                <input value={subForm.proposedSalary} onChange={(e) => setSubForm({ ...subForm, proposedSalary: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Submission Date</label>
                <input type="date" value={subForm.submissionDate} onChange={(e) => setSubForm({ ...subForm, submissionDate: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Initial Status</label>
                <select value={subForm.status} onChange={(e) => setSubForm({ ...subForm, status: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold">
                  {SUBMISSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Submission Remarks</label>
                <textarea rows={2} value={subForm.submissionRemarks} onChange={(e) => setSubForm({ ...subForm, submissionRemarks: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input id="cand-consent" type="checkbox" checked={subForm.consentRecorded} onChange={(e) => setSubForm({ ...subForm, consentRecorded: e.target.checked })} />
                <label htmlFor="cand-consent" className="font-bold">Candidate consent is recorded for this company submission *</label>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Submit Candidate to Company</button>
              </div>
            </form>

            {/* Submission History */}
            <div className="space-y-2 border-t border-slate-200 dark:border-navy-800 pt-4">
              <h4 className="font-bold text-sm">Company Submission History ({(submitCandidate.employerSubmissions || []).length})</h4>
              {(submitCandidate.employerSubmissions || []).map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <p className="font-bold">{s.companyName} — {s.jobTitle}</p>
                    <p className="text-[11px] text-slate-500">Date: {s.submissionDate} • Salary: {s.proposedSalary || '—'}</p>
                  </div>
                  <select
                    value={s.status}
                    onChange={(e) => handleSubmissionStatusChange(s.id, e.target.value)}
                    className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-2 py-1 font-bold"
                  >
                    {SUBMISSION_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYER INTERVIEW MANAGEMENT MODAL */}
      {empInterviewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold">Employer Interviews — {empInterviewCandidate.name}</h3>
              <button type="button" onClick={() => setEmpInterviewCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleScheduleEmployerInterview} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Company *</label>
                <input required value={empIntForm.companyName} onChange={(e) => setEmpIntForm({ ...empIntForm, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Job Role *</label>
                <input required value={empIntForm.jobRole} onChange={(e) => setEmpIntForm({ ...empIntForm, jobRole: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Round</label>
                <input value={empIntForm.interviewRound} onChange={(e) => setEmpIntForm({ ...empIntForm, interviewRound: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Employer Interviewer</label>
                <input value={empIntForm.employerInterviewer} onChange={(e) => setEmpIntForm({ ...empIntForm, employerInterviewer: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Date *</label>
                <input required type="date" value={empIntForm.interviewDate} onChange={(e) => setEmpIntForm({ ...empIntForm, interviewDate: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Interview Time *</label>
                <input required type="time" value={empIntForm.interviewTime} onChange={(e) => setEmpIntForm({ ...empIntForm, interviewTime: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Mode</label>
                <select value={empIntForm.interviewMode} onChange={(e) => setEmpIntForm({ ...empIntForm, interviewMode: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5">
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Meeting Link</label>
                <input value={empIntForm.meetingLink} onChange={(e) => setEmpIntForm({ ...empIntForm, meetingLink: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Schedule Employer Interview</button>
              </div>
            </form>

            <div className="space-y-2 border-t border-slate-200 dark:border-navy-800 pt-4">
              <h4 className="font-bold text-sm">Employer Interview Rounds &amp; Feedback ({(empInterviewCandidate.employerInterviews || []).length})</h4>
              {(empInterviewCandidate.employerInterviews || []).map((ei) => (
                <div key={ei.id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <p className="font-bold">{ei.companyName} — {ei.interviewRound} ({ei.jobRole})</p>
                    <p className="text-[11px] text-slate-500">{ei.interviewDate} at {ei.interviewTime} • Panel: {ei.employerInterviewer || 'Employer Panel'}</p>
                  </div>
                  <select
                    value={ei.feedback}
                    onChange={(e) => handleEmployerFeedback(ei.id, e.target.value)}
                    className="bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-2 py-1 font-bold"
                  >
                    {EMPLOYER_FEEDBACK_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OFFER & PLACEMENT MANAGEMENT MODAL */}
      {offerCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold">Offer &amp; Placement — {offerCandidate.name}</h3>
              <button type="button" onClick={() => setOfferCandidate(null)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Candidate will not be marked &ldquo;Successfully Placed&rdquo; until actual joining is confirmed.</span>
            </div>

            <form onSubmit={handleCreateOffer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Offered Job Role *</label>
                <input required value={offerForm.offeredJobRole} onChange={(e) => setOfferForm({ ...offerForm, offeredJobRole: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Company *</label>
                <input required value={offerForm.companyName} onChange={(e) => setOfferForm({ ...offerForm, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">Salary</label>
                <input value={offerForm.salary} onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Currency</label>
                <input value={offerForm.currency} onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Offer Release Date</label>
                <input type="date" value={offerForm.offerReleaseDate} onChange={(e) => setOfferForm({ ...offerForm, offerReleaseDate: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Expected Joining Date</label>
                <input type="date" value={offerForm.joiningDate} onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold mb-1">Offer Status</label>
                <select value={offerForm.offerStatus} onChange={(e) => setOfferForm({ ...offerForm, offerStatus: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold">
                  {OFFER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Offer Letter Ref</label>
                <input value={offerForm.offerLetterRef} onChange={(e) => setOfferForm({ ...offerForm, offerLetterRef: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Benefits</label>
                <input value={offerForm.benefits} onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-extrabold cursor-pointer">Release Offer</button>
              </div>
            </form>

            <div className="space-y-2 border-t border-slate-200 dark:border-navy-800 pt-4">
              <h4 className="font-bold text-sm">Released Offers &amp; Joining Confirmation ({(offerCandidate.placementOffers || []).length})</h4>
              {(offerCandidate.placementOffers || []).map((o) => (
                <div key={o.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-bold">{o.offeredJobRole} at {o.companyName} ({o.salary} {o.currency})</p>
                    <p className="text-[11px] text-slate-500">
                      Offer Status: <strong>{o.offerStatus}</strong> • Final Status: <strong>{o.finalPlacementStatus}</strong>
                    </p>
                  </div>
                  {o.finalPlacementStatus !== 'Successfully Placed' ? (
                    <button
                      type="button"
                      onClick={() => handleConfirmJoining(o.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer"
                    >
                      Confirm Joining &amp; Mark Placed
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold">
                      ✓ Successfully Placed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};

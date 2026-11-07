import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Calendar, Clock, Video, UserCheck, Star, FileText, CheckCircle2, 
  XCircle, AlertCircle, MessageSquare, ShieldCheck, ChevronRight, 
  ExternalLink, Send, Plus, Filter, Search, Award, Lock, CheckSquare, 
  ThumbsUp, ThumbsDown, HelpCircle, Eye
} from 'lucide-react';

export const CrmInterviewerDashboard = ({ initialSection }) => {
  const { currentEmployee, interviews = [], candidates = [], activeModule } = useCrm();

  const getTabFromModule = (mod) => {
    switch (mod) {
      case 'int-calendar': return 'availability';
      case 'int-feedback': return 'completed';
      case 'int-overview':
      case 'int-assigned':
      case 'int-profiles':
      case 'int-schedule':
      case 'int-evaluation':
      case 'int-decision':
      case 'int-status':
      case 'int-reminders':
      case 'int-context':
      case 'int-permissions':
      case 'dashboard':
      default:
        return 'schedule';
    }
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromModule(initialSection || activeModule));
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // 1. Assigned Interviews State (Feature 1, 2, 4, 8)
  const [assignedInterviews, setAssignedInterviews] = useState([
    {
      id: 'INT-301',
      candidateId: 'CAN-101',
      candidateName: 'Alexander Wright',
      role: 'Senior Civil Project Manager',
      company: 'Al Habtoor Contracting LLC',
      round: 'Round 2: Technical Deep-Dive',
      date: 'Today',
      time: '02:30 PM - 03:15 PM (45 mins)',
      mode: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-revival-int',
      status: 'Scheduled', // 'Scheduled' | 'Completed' | 'Absent' | 'Rescheduled' | 'Cancelled'
      coordinator: 'Priya Sharma (HR Lead) • +91 98400 11003',
      experience: '10 Years',
      skills: ['Primavera P6', 'FIDIC Contracts', 'High-Rise RCC', 'AutoCAD Civil'],
      previousFeedback: {
        round: 'Round 1: Screening (Priya Sharma)',
        rating: '4.5 / 5',
        notes: 'Excellent domain clarity, managed 500M+ AED projects in Dubai. Needs structural technical verification.'
      },
      evaluation: null
    },
    {
      id: 'INT-302',
      candidateId: 'CAN-102',
      candidateName: 'Dr. Sarah Al-Mansoori',
      role: 'Consultant Cardiologist',
      company: 'Saudi German Hospital (Riyadh)',
      round: 'Round 1: Clinical Competency Panel',
      date: 'Today',
      time: '04:30 PM - 05:15 PM (45 mins)',
      mode: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/revival-sgh',
      status: 'Pending Feedback',
      coordinator: 'Sreeja Nair (Coordinator) • +91 98765 43211',
      experience: '12 Years',
      skills: ['Invasive Cardiology', 'Echocardiography', 'MOH KSA License', 'JCI Protocols'],
      previousFeedback: {
        round: 'Credential Verification (DMS)',
        rating: 'Verified',
        notes: 'Prometric passing scorecard & valid Saudi MOH eligibility certificate verified on file.'
      },
      evaluation: null
    },
    {
      id: 'INT-303',
      candidateId: 'CAN-103',
      candidateName: 'Elena Rostova',
      role: 'Senior Mechanical Engineer',
      company: 'TechVision International (Singapore)',
      round: 'Final Technical & System Architecture',
      date: 'Tomorrow, 11:00 AM',
      time: '11:00 AM - 12:00 PM (60 mins)',
      mode: 'Google Meet',
      meetingLink: 'https://meet.google.com/xyz-tech-singapore',
      status: 'Scheduled',
      coordinator: 'Kishore Kumar (Recruiter) • +91 98400 11004',
      experience: '8 Years',
      skills: ['SolidWorks', 'CFD Simulation', 'Cleanroom HVAC', 'Semiconductor MEP'],
      previousFeedback: {
        round: 'Round 1: Core Mechanical Test',
        rating: '4.8 / 5',
        notes: 'Top 5% score in Singapore MEP baseline exam. Good communication skills.'
      },
      evaluation: null
    },
    {
      id: 'INT-304',
      candidateId: 'CAN-104',
      candidateName: 'Mohamed Farooq',
      role: 'Lead Cloud DevOps Architect',
      company: 'Dubai Financial Market',
      round: 'Round 2: Cloud Infrastructure & Kubernetes',
      date: 'Completed Yesterday',
      time: '03:00 PM',
      mode: 'Google Meet',
      meetingLink: 'https://meet.google.com/completed',
      status: 'Completed',
      coordinator: 'Priya Sharma (HR Lead)',
      experience: '7 Years',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'SecOps', 'CI/CD'],
      previousFeedback: {
        round: 'Round 1: Screening',
        rating: '4.0 / 5',
        notes: 'Clear understanding of Terraform modules.'
      },
      evaluation: {
        technicalRating: 5,
        communicationRating: 4,
        problemSolvingRating: 5,
        roleFitRating: 5,
        strengths: 'Deep knowledge of EKS clusters, zero-downtime Blue/Green deployments, and Vault secret management.',
        concerns: 'Expected salary is at the upper tier of the client budget.',
        evidence: 'Successfully walked through disaster recovery architecture for banking client during technical whiteboard.',
        decision: 'Strong Hire',
        submittedAt: '2026-11-05 04:30 PM'
      }
    }
  ]);

  // 5, 6, 7. Evaluation Form State (Evaluation criteria, structured feedback, decision submission)
  const [evalForm, setEvalForm] = useState({
    technicalRating: 4,
    communicationRating: 4,
    problemSolvingRating: 4,
    roleFitRating: 4,
    strengths: '',
    concerns: '',
    evidence: '',
    generalComments: '',
    decision: 'Hire' // 'Strong Hire' | 'Hire' | 'Hold' | 'No Hire'
  });

  // 11. Availability Calendar Slots State
  const [availabilitySlots, setAvailabilitySlots] = useState([
    { id: 'slot-1', day: 'Monday', time: '10:00 AM - 01:00 PM', slots: 3, status: 'Active' },
    { id: 'slot-2', day: 'Wednesday', time: '02:00 PM - 05:00 PM', slots: 4, status: 'Active' },
    { id: 'slot-3', day: 'Friday', time: '11:00 AM - 02:00 PM', slots: 3, status: 'Active' }
  ]);
  const [newSlotDay, setNewSlotDay] = useState('Tuesday');
  const [newSlotTime, setNewSlotTime] = useState('02:00 PM - 04:00 PM');

  const showNotification = (msg) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(''), 4500);
  };

  // Metric Overview Counters (Feature 1)
  const todayCount = assignedInterviews.filter(i => i.date === 'Today').length;
  const pendingFeedbackCount = assignedInterviews.filter(i => i.status === 'Pending Feedback' || (i.status === 'Completed' && !i.evaluation)).length;
  const completedCount = assignedInterviews.filter(i => i.evaluation !== null || i.status === 'Completed').length;
  const totalAssigned = assignedInterviews.length;

  // Open Evaluation Modal
  const handleOpenEvaluation = (interview) => {
    setSelectedInterview(interview);
    if (interview.evaluation) {
      setEvalForm({
        ...interview.evaluation,
        generalComments: interview.evaluation.generalComments || ''
      });
    } else {
      setEvalForm({
        technicalRating: 4,
        communicationRating: 4,
        problemSolvingRating: 4,
        roleFitRating: 4,
        strengths: '',
        concerns: '',
        evidence: '',
        generalComments: '',
        decision: 'Hire'
      });
    }
    setEvaluationModalOpen(true);
  };

  const handleOpenProfile = (interview) => {
    setSelectedInterview(interview);
    setProfileModalOpen(true);
  };

  useEffect(() => {
    const mod = initialSection || activeModule;
    if (mod) {
      setActiveTab(getTabFromModule(mod));
      if (mod === 'int-evaluation' && assignedInterviews.length > 0) {
        handleOpenEvaluation(assignedInterviews[0]);
      } else if (mod === 'int-profiles' && assignedInterviews.length > 0) {
        handleOpenProfile(assignedInterviews[0]);
      }
    }
  }, [initialSection, activeModule]);

  // Submit Evaluation Decision (Feature 5, 6, 7)
  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    if (!evalForm.strengths.trim() || !evalForm.evidence.trim()) {
      alert('Please provide key strengths and observational evidence before submitting.');
      return;
    }

    const updatedInterviews = assignedInterviews.map(item => {
      if (item.id === selectedInterview.id) {
        return {
          ...item,
          status: 'Completed',
          evaluation: {
            ...evalForm,
            submittedAt: new Date().toLocaleString()
          }
        };
      }
      return item;
    });

    setAssignedInterviews(updatedInterviews);
    setEvaluationModalOpen(false);
    showNotification(`✓ Evaluation and recommendation (${evalForm.decision}) submitted successfully for ${selectedInterview.candidateName}.`);
  };

  // Update Status (Feature 8)
  const handleUpdateStatus = (interviewId, newStatus) => {
    setAssignedInterviews(prev => prev.map(item => {
      if (item.id === interviewId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
    showNotification(`Status updated to "${newStatus}".`);
  };

  // Add Availability Slot (Feature 11)
  const handleAddSlot = (e) => {
    e.preventDefault();
    const newSlot = {
      id: `slot-${Date.now()}`,
      day: newSlotDay,
      time: newSlotTime,
      slots: 2,
      status: 'Active'
    };
    setAvailabilitySlots([...availabilitySlots, newSlot]);
    showNotification(`✓ Availability slot added for ${newSlotDay} (${newSlotTime}).`);
  };

  const removeSlot = (id) => {
    setAvailabilitySlots(availabilitySlots.filter(s => s.id !== id));
    showNotification('Availability slot removed.');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {statusNotice && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice('')} className="text-emerald-700 hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* HEADER SECTION (Super Admin Style) */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Interviewer Suite • Feature #1
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              PANEL CONSOLE & ASSESSMENT DISPATCH
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Interviewer Assessment Hub & Executive Overview
          </h1>
          <p className="text-slate-500 text-xs mt-1 max-w-2xl">
            Conduct structured technical interviews, review candidate profiles, submit standardized hiring scorecards, and sync assessment availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
            ● Panel Live Ready
          </span>
          <button
            onClick={() => setActiveTab('availability')}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer text-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Availability Slots</span>
          </button>
        </div>
      </div>

      {/* 9. FEEDBACK REMINDERS BANNER (Feature 9) */}
      {pendingFeedbackCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold">Feedback Pending: {pendingFeedbackCount} Candidate Evaluation(s) Awaiting Decision</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Please submit your structured scorecard within 24 hours of round completion to prevent recruiter workflow delays.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('schedule')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm shrink-0 cursor-pointer"
          >
            Review Pending →
          </button>
        </div>
      )}

      {/* 1. DASHBOARD OVERVIEW METRIC CARDS (Super Admin KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Today's Schedule</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{todayCount}</p>
          <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Scheduled Sessions Today</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Feedback</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-amber-600 dark:text-gold-400 mt-3">{pendingFeedbackCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Action Required Within 24h</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Completed Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-emerald-600 mt-3">{completedCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Evaluations Submitted</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{totalAssigned}</p>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Active Panel Mandates</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 dark:border-navy-700 gap-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Assigned Interviews & Schedule</span>
          {pendingFeedbackCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {pendingFeedbackCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'availability'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Availability / Calendar Sync</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED INTERVIEWS & SCHEDULE (Feature 2, 3, 4, 8, 10) */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {assignedInterviews.map((interview) => (
              <div 
                key={interview.id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 shadow-sm hover:border-gold-500/40 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {interview.candidateName}
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-[10px] font-bold">
                        {interview.round}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Target Role: <span className="font-bold text-slate-800 dark:text-slate-200">{interview.role}</span> • Client: <span className="font-medium text-slate-700 dark:text-slate-300">{interview.company}</span>
                    </p>
                  </div>

                  {/* Status Dropdown (Feature 8) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Status:</span>
                    <select
                      value={interview.status}
                      onChange={(e) => handleUpdateStatus(interview.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${
                        interview.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : interview.status === 'Pending Feedback'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                          : interview.status === 'Cancelled' || interview.status === 'Absent'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending Feedback">Pending Feedback</option>
                      <option value="Absent">Candidate Absent</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid (Feature 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-navy-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-navy-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Interview Schedule & Duration</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gold-500" />
                      <span>{interview.date} • {interview.time}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Meeting Platform & Link</span>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                      <span>Join via {interview.mode}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Interview Coordinator</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {interview.coordinator}
                    </p>
                  </div>
                </div>

                {/* 10. PREVIOUS-ROUND CONTEXT (Feature 10) */}
                {interview.previousFeedback && (
                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        Previous-Round Context ({interview.previousFeedback.round})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-200/60 dark:bg-purple-900 text-purple-900 dark:text-purple-200 rounded font-bold">
                        Score: {interview.previousFeedback.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 dark:text-purple-200 italic">
                      "{interview.previousFeedback.notes}"
                    </p>
                  </div>
                )}

                {/* Evaluation Result if already evaluated */}
                {interview.evaluation && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">
                        Recommendation Submitted: <span className="underline">{interview.evaluation.decision}</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        ({interview.evaluation.submittedAt})
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Technical: {interview.evaluation.technicalRating}/5 • Problem Solving: {interview.evaluation.problemSolvingRating}/5 • Role Fit: {interview.evaluation.roleFitRating}/5
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <button
                    onClick={() => {
                      setSelectedInterview(interview);
                      setProfileModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Resume & Profile</span>
                  </button>

                  <button
                    onClick={() => handleOpenEvaluation(interview)}
                    className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{interview.evaluation ? 'Edit Scorecard' : 'Fill Evaluation Scorecard'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY & CALENDAR SYNC (Feature 11) */}
      {activeTab === 'availability' && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-500" />
              <span>Interviewer Availability & Calendar Sync</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure your open interview slots so HR Leads and Recruiters can automatically schedule technical rounds without manual back-and-forth.
            </p>
          </div>

          {/* Add Slot Form */}
          <form onSubmit={handleAddSlot} className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl flex flex-wrap items-end gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold text-slate-800 dark:text-white outline-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot Window</label>
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 01:00 PM"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold text-slate-800 dark:text-white outline-none w-56"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Open Slot</span>
            </button>
          </form>

          {/* Active Slots List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Your Shared Open Interview Windows
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-navy-800 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
              {availabilitySlots.map((slot) => (
                <div key={slot.id} className="p-3.5 flex items-center justify-between bg-white dark:bg-navy-900 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {slot.day.substring(0, 3)}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{slot.day} • {slot.time}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Max {slot.slots} candidates/day</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    Remove Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5, 6, 7. EVALUATION SCORECARD MODAL (Feature 5, 6, 7) */}
      {evaluationModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  <span>Interview Evaluation Scorecard</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Candidate: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInterview.candidateName}</span> ({selectedInterview.role})
                </p>
              </div>
              <button 
                onClick={() => setEvaluationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* Rating Scales (Feature 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Skills & Domain Mastery (1-5)
                  </label>
                  <select
                    value={evalForm.technicalRating}
                    onChange={(e) => setEvalForm({ ...evalForm, technicalRating: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                  >
                    <option value={5}>5 - Exceptional / Subject Matter Expert</option>
                    <option value={4}>4 - Strong / Meets all Senior Requirements</option>
                    <option value={3}>3 - Acceptable / Baseline Competency</option>
                    <option value={2}>2 - Marginal / Noticeable Knowledge Gaps</option>
                    <option value={1}>1 - Unacceptable / Inadequate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Problem-Solving & Critical Thinking (1-5)
                  </label>
                  <select
                    value={evalForm.problemSolvingRating}
                    onChange={(e) => setEvalForm({ ...evalForm, problemSolvingRating: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                  >
                    <option value={5}>5 - Creative & Highly Analytical</option>
                    <option value={4}>4 - Good Structured Reasoning</option>
                    <option value={3}>3 - Average Problem-Solving</option>
                    <option value={2}>2 - Struggles with Unstructured Scenarios</option>
                    <option value={1}>1 - Unable to solve core problems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Communication & Articulation (1-5)
                  </label>
                  <select
                    value={evalForm.communicationRating}
                    onChange={(e) => setEvalForm({ ...evalForm, communicationRating: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                  >
                    <option value={5}>5 - Excellent, Clear & Persuasive</option>
                    <option value={4}>4 - Clear and Professional</option>
                    <option value={3}>3 - Adequate Communication</option>
                    <option value={2}>2 - Difficult to follow at times</option>
                    <option value={1}>1 - Poor articulation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Fit & Cultural Alignment (1-5)
                  </label>
                  <select
                    value={evalForm.roleFitRating}
                    onChange={(e) => setEvalForm({ ...evalForm, roleFitRating: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 font-bold"
                  >
                    <option value={5}>5 - Outstanding Match for Client Culture</option>
                    <option value={4}>4 - Good Fit with Strong Enthusiasm</option>
                    <option value={3}>3 - Neutral Alignment</option>
                    <option value={2}>2 - Potential Culture Friction</option>
                    <option value={1}>1 - Mismatched Expectation</option>
                  </select>
                </div>
              </div>

              {/* 6. Structured Feedback Fields (Feature 6) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Key Strengths Observed *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Highlight core technical depth, notable past accomplishments, leadership qualities..."
                    value={evalForm.strengths}
                    onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Areas of Concern / Skill Deficits
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any technical gaps, behavioral hesitations, or salary/relocation red flags..."
                    value={evalForm.concerns}
                    onChange={(e) => setEvalForm({ ...evalForm, concerns: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observational Evidence & Notes from Interview *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific questions asked, candidate responses, technical architecture designs discussed..."
                    value={evalForm.evidence}
                    onChange={(e) => setEvalForm({ ...evalForm, evidence: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* 7. Final Decision Submission (Feature 7) */}
              <div className="p-4 bg-gold-50/50 dark:bg-gold-500/10 border border-gold-500/30 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Final Hiring Recommendation *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'Strong Hire', color: 'bg-emerald-600 text-white', icon: ThumbsUp },
                    { val: 'Hire', color: 'bg-blue-600 text-white', icon: CheckCircle2 },
                    { val: 'Hold', color: 'bg-amber-600 text-white', icon: HelpCircle },
                    { val: 'No Hire', color: 'bg-rose-600 text-white', icon: ThumbsDown }
                  ].map(btn => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setEvalForm({ ...evalForm, decision: btn.val })}
                      className={`py-2 px-3 rounded-xl font-extrabold text-xs transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                        evalForm.decision === btn.val
                          ? `${btn.color} border-transparent shadow-md scale-105`
                          : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700'
                      }`}
                    >
                      <btn.icon className="w-3.5 h-3.5" />
                      <span>{btn.val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvaluationModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black shadow-luxury cursor-pointer"
                >
                  Submit Official Evaluation Scorecard →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CANDIDATE PROFILE MODAL (Feature 3) */}
      {profileModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {selectedInterview.candidateName}
                </h3>
                <p className="text-xs text-slate-500">{selectedInterview.role} • {selectedInterview.experience}</p>
              </div>
              <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Verified Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInterview.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 rounded-lg text-[11px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Candidate CV Document:</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Verified international curriculum vitae on file in Revival S3 Document Vault.
                </p>
                <div className="pt-2">
                  <a
                    href="#download"
                    onClick={(e) => { e.preventDefault(); alert(`Downloading official CV for ${selectedInterview.candidateName}`); }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                  >
                    <FileText className="w-4 h-4" /> Download Official Candidate CV.pdf
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


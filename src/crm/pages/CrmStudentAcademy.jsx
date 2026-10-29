import React, { useState, useEffect, useMemo } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { 
  GraduationCap, Calendar, Clock, Globe, Building2,
  Users, CheckCircle2, AlertCircle, Phone, Mail, MessageSquare, Plus, Search,
  Filter, RefreshCw, Download, ChevronRight, X, UserCheck, ShieldCheck,
  MapPin, ExternalLink, Sparkles, Send, Trash2, ArrowRight, Eye, CheckSquare,
  FileText, Briefcase, Award, ChevronLeft, BookOpen, Layers
} from 'lucide-react';

export const CrmStudentAcademy = () => {
  const {
    leads = [],
    loadingLeads,
    fetchLeads,
    updateLead,
    archiveLead,
    addLeadActivity,
    scheduleLeadFollowUp,
    currentRole
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Local state for exact records fetched from student_academy_enquiries
  const [saDbEnquiries, setSaDbEnquiries] = useState({});

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Follow-up form state
  const [followUpForm, setFollowUpForm] = useState({
    title: 'Exam Preparation & Coaching Follow-Up',
    purpose: 'Syllabus Breakdown & Coaching Batch Enrollment',
    dueDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    assignedTo: 'Dhanalakshimi'
  });

  // Manual enquiry form state
  const [manualForm, setManualForm] = useState({
    studentName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    examName: 'Civil Services Examination (IAS, IPS, IFS, IRS) (UPSC CSE)',
    qualification: 'Undergraduate Degree (B.A./B.Sc/B.Com)',
    preferredLearningMode: 'Online Live',
    preferredLocation: 'Online / Remote',
    assignedEmployee: 'Dhanalakshimi',
    priority: 'Medium',
    message: ''
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Counselors / Advisors List
  const counselors = [
    'Dhanalakshimi',
    'Sreeja',
    'chentamilselvi',
    'Diviya',
    'balavarshini'
  ];

  // Fetch primary student_academy_enquiries database records
  const fetchSaEnquiries = async () => {
    try {
      const res = await fetch('/api/student-academy/enquiries');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          const map = {};
          json.data.forEach(item => {
            if (item.referenceNumber) map[item.referenceNumber] = item;
            if (item.id) map[item.id] = item;
          });
          setSaDbEnquiries(map);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch student academy database records:', err);
    }
  };

  // Refresh data on mount
  useEffect(() => {
    if (fetchLeads) fetchLeads();
    fetchSaEnquiries();
  }, []);

  const handleRefresh = async () => {
    if (fetchLeads) await fetchLeads();
    await fetchSaEnquiries();
  };

  // Filter logic to isolate Student Academy inquiries
  const isAcademyLead = (l) => {
    if (!l) return false;
    const sId = (l.serviceId || '').toLowerCase();
    const title = (l.serviceTitle || '').toLowerCase();
    const company = (l.company || '').toLowerCase();
    const msg = (l.message || '').toLowerCase();
    const ref = (l.referenceNumber || '').toUpperCase();

    return (
      sId === 'school-academy' ||
      sId === 'student-academy' ||
      ref.startsWith('REV-ACA') ||
      title.includes('student academy') ||
      company.includes('student academy') ||
      msg.startsWith('exam enquiry:') ||
      msg.includes('student academy')
    );
  };

  const academyLeads = useMemo(() => leads.filter(isAcademyLead), [leads]);

  // Extract helper fields from leads without any truncation
  const parseLeadDetails = (lead) => {
    let custom = {};
    if (lead.customFields) {
      try {
        custom = typeof lead.customFields === 'string' ? JSON.parse(lead.customFields) : lead.customFields;
      } catch (_) {}
    }

    const ref = lead.referenceNumber || lead.id;
    const saRecord = saDbEnquiries[ref] || {};

    // 1. Examination Name Resolution: Priority given to exact database records
    let examName = saRecord.examName || custom.examName;

    // Check if assistanceType contains the exam
    if (!examName && lead.assistanceType) {
      const assist = lead.assistanceType.trim();
      if (assist.includes('(') && assist.includes(')')) {
        if (assist.toLowerCase().startsWith('integrated') || assist.toLowerCase().startsWith('study skills')) {
          const match = assist.match(/\((Civil Services Examination[^\)]*|SAT[^\)]*|NEET[^\)]*|JEE[^\)]*|UPSC[^\)]*|[^\(]+)\)$/i);
          if (match && match[1]) {
            examName = match[1].trim();
          }
        }
      }
      if (!examName && assist !== 'Destination & Profile Assessment') {
        examName = assist;
      }
    }

    if (!examName && lead.organizationName && lead.organizationName !== 'null' && !lead.organizationName.startsWith('Service Inquiry:')) {
      examName = lead.organizationName.trim();
    }

    if (!examName && lead.message && lead.message.includes('Exam Enquiry:')) {
      // Lookahead regex up to '. Qualification:' prevents cutting off internal dots
      const match = lead.message.match(/Exam Enquiry:\s*([\s\S]+?)(?=\.\s*Qualification:|\.\s*Preferred|\.\s*Message:|\.|$)/i);
      if (match && match[1]) {
        examName = match[1].trim();
      }
    }

    if (!examName) {
      examName = 'Competitive Examination';
    }

    // 2. Educational Qualification Resolution
    let qualification = saRecord.qualification || custom.qualification || lead.degreeLevel;
    if (!qualification && lead.message && lead.message.includes('Qualification:')) {
      const match = lead.message.match(/Qualification:\s*([\s\S]+?)(?=\.\s*Preferred|\.\s*Message:|\.|$)/i);
      if (match && match[1]) qualification = match[1].trim();
    }
    if (!qualification) qualification = 'High School / 12th Standard';

    // 3. Coaching Mode Resolution
    let coachingMode = saRecord.preferredLearningMode || saRecord.coachingMode || custom.coachingMode || custom.preferredLearningMode || lead.consultationMode;
    if (!coachingMode && lead.message && lead.message.includes('Preferred Coaching Mode:')) {
      const match = lead.message.match(/Preferred Coaching Mode:\s*([\s\S]+?)(?=\.\s*Preferred|\.\s*Message:|\.|$)/i);
      if (match && match[1]) coachingMode = match[1].trim();
    }
    if (!coachingMode) coachingMode = 'Online Live';

    // 4. Study Location Resolution
    let studyLocation = saRecord.preferredLocation || custom.studyLocation || custom.preferredLocation || lead.workLocation;
    if (!studyLocation && lead.message && lead.message.includes('Preferred Study Location:')) {
      const match = lead.message.match(/Preferred Study Location:\s*([\s\S]+?)(?=\.\s*Message:|\.|$)/i);
      if (match && match[1]) studyLocation = match[1].trim();
    }
    if (!studyLocation) studyLocation = 'Online / Remote';

    // 5. Course / Cohort Name
    const courseName = saRecord.courseName || custom.courseName || '';

    // 6. Student Message & Questions
    let studentQuestions = saRecord.questions || custom.questions;
    if (!studentQuestions && lead.message && lead.message.includes('Message:')) {
      const match = lead.message.match(/Message:\s*([\s\S]+)$/i);
      if (match && match[1]) studentQuestions = match[1].trim();
    }
    if (!studentQuestions) studentQuestions = lead.message || '';

    return {
      examName,
      courseName,
      qualification,
      coachingMode,
      studyLocation,
      studentQuestions
    };
  };

  // Extract unique examination names for filter dropdown (un-truncated)
  const uniqueExams = useMemo(() => {
    const set = new Set();
    academyLeads.forEach(l => {
      const { examName } = parseLeadDetails(l);
      if (examName && examName !== 'Competitive Examination') {
        set.add(examName);
      }
    });

    // Comprehensive list of verified examinations
    [
      'Civil Services Examination (IAS, IPS, IFS, IRS) (UPSC CSE)',
      'SSC Combined Graduate Level (SSC CGL)',
      'National Eligibility cum Entrance Test (NEET UG)',
      'Joint Entrance Examination (JEE Main & Advanced)',
      'Graduate Aptitude Test in Engineering (GATE)',
      'Common Admission Test (CAT / IIM)',
      'SAT — Scholastic Assessment Test',
      'Tamil Nadu Public Service Commission (TNPSC Group 1)',
      'IBPS Bank Probationary Officer (IBPS PO)'
    ].forEach(e => set.add(e));

    return Array.from(set).sort();
  }, [academyLeads, saDbEnquiries]);

  // Summary Metrics calculated dynamically from real database records
  const totalCount = academyLeads.length;
  const newCount = academyLeads.filter(l => l.status === 'New' || l.status === 'New Enquiry').length;
  const inProgressCount = academyLeads.filter(l => 
    ['In Progress', 'Contacted', 'Contact Pending', 'Consultation Scheduled', 'Proposal Pending', 'Course Selection'].includes(l.status)
  ).length;
  const completedCount = academyLeads.filter(l => 
    ['Converted', 'Completed', 'Consultation Completed', 'Qualified', 'Enrollment in Progress', 'Closed', 'Closed / Lost'].includes(l.status)
  ).length;

  // Filtered Leads
  const filteredLeads = academyLeads.filter(b => {
    const details = parseLeadDetails(b);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.referenceNumber && b.referenceNumber.toLowerCase().includes(q)) ||
        (details.examName && details.examName.toLowerCase().includes(q)) ||
        (details.qualification && details.qualification.toLowerCase().includes(q)) ||
        (details.studyLocation && details.studyLocation.toLowerCase().includes(q)) ||
        (details.coachingMode && details.coachingMode.toLowerCase().includes(q)) ||
        (details.studentQuestions && details.studentQuestions.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Examination Filter
    if (examFilter !== 'all') {
      if (!details.examName.toLowerCase().includes(examFilter.toLowerCase())) return false;
    }

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'New') {
        if (!['New', 'New Enquiry'].includes(b.status)) return false;
      } else if (statusFilter === 'InProgress') {
        if (!['In Progress', 'Contacted', 'Contact Pending', 'Proposal Pending', 'Course Selection', 'Consultation Scheduled'].includes(b.status)) return false;
      } else if (statusFilter === 'Completed') {
        if (!['Converted', 'Completed', 'Consultation Completed', 'Qualified', 'Enrollment in Progress'].includes(b.status)) return false;
      } else if (statusFilter === 'Closed') {
        if (!['Closed / Lost', 'Closed', 'Archived'].includes(b.status)) return false;
      }
    }

    // Coaching Mode Filter
    if (modeFilter !== 'all') {
      if (!details.coachingMode.toLowerCase().includes(modeFilter.toLowerCase())) return false;
    }

    // Study Location Filter
    if (locationFilter !== 'all') {
      if (!details.studyLocation.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }

    // Counselor Filter
    if (counselorFilter !== 'all') {
      if (counselorFilter === 'unassigned') {
        if (b.assignedEmployee && b.assignedEmployee.trim()) return false;
      } else {
        if (b.assignedEmployee !== counselorFilter) return false;
      }
    }

    // Date Range Filter
    if (dateRangeFilter !== 'all' && b.createdAt) {
      const created = new Date(b.createdAt);
      const now = new Date();
      if (dateRangeFilter === 'today') {
        if (created.toDateString() !== now.toDateString()) return false;
      } else if (dateRangeFilter === '7days') {
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else if (dateRangeFilter === '30days') {
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
      case 'New Enquiry':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'In Progress':
      case 'Contacted':
      case 'Contact Pending':
      case 'Proposal Pending':
      case 'Course Selection':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'Consultation Scheduled':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Qualified':
      case 'Consultation Completed':
      case 'Completed':
      case 'Converted':
      case 'Enrollment in Progress':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Closed / Lost':
      case 'Closed':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  // Coaching mode badge styling
  const getModeBadge = (mode) => {
    if (!mode) return 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300';
    const m = mode.toLowerCase();
    if (m.includes('online')) {
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    }
    if (m.includes('offline') || m.includes('classroom')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (m.includes('hybrid')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  // Handle Status Update
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLead(leadId, { status: newStatus, currentStage: newStatus });
      await handleRefresh();
      if (selectedEnquiry && selectedEnquiry.id === leadId) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update student academy status:', err);
    }
  };

  // Handle Counselor Assignment
  const handleAssignChange = async (leadId, employeeName) => {
    try {
      await updateLead(leadId, { assignedEmployee: employeeName });
      await handleRefresh();
      if (selectedEnquiry && selectedEnquiry.id === leadId) {
        setSelectedEnquiry(prev => ({ ...prev, assignedEmployee: employeeName }));
      }
    } catch (err) {
      console.error('Failed to assign counsellor:', err);
    }
  };

  // Handle Note Submission in Dossier
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!activityNote.trim() || !selectedEnquiry || submittingNote) return;
    setSubmittingNote(true);

    try {
      if (addLeadActivity) {
        await addLeadActivity(selectedEnquiry.id, {
          activityType: 'Note',
          title: 'Student Academy Advisory Note',
          description: activityNote.trim()
        });
      }
      setActivityNote('');
      await handleRefresh();
    } catch (err) {
      console.error('Failed to add advisory note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Manual Enquiry Creation
  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (manualSubmitting) return;
    setManualSubmitting(true);

    try {
      const fullPhone = `${manualForm.countryCode} ${manualForm.phone}`.trim();
      const payload = {
        studentName: manualForm.studentName.trim(),
        email: manualForm.email.trim(),
        phone: fullPhone,
        examName: manualForm.examName,
        qualification: manualForm.qualification,
        preferredLearningMode: manualForm.preferredLearningMode,
        preferredLocation: manualForm.preferredLocation,
        assignedEmployee: manualForm.assignedEmployee,
        questions: manualForm.message.trim() || 'Manual student inquiry logged by advisor desk.',
        enquiryType: 'Exam Enquiry'
      };

      const res = await fetch('/api/student-academy/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        setNewBookingModalOpen(false);
        setManualForm({
          studentName: '',
          email: '',
          phone: '',
          countryCode: '+91',
          examName: 'Civil Services Examination (IAS, IPS, IFS, IRS) (UPSC CSE)',
          qualification: 'Undergraduate Degree (B.A./B.Sc/B.Com)',
          preferredLearningMode: 'Online Live',
          preferredLocation: 'Online / Remote',
          assignedEmployee: 'Dhanalakshimi',
          priority: 'Medium',
          message: ''
        });
        await handleRefresh();
      } else {
        alert(data.message || 'Failed to record student enquiry');
      }
    } catch (err) {
      console.error('Failed to create manual academy enquiry:', err);
      alert('Network or server error while creating enquiry.');
    } finally {
      setManualSubmitting(false);
    }
  };

  // Handle Follow-Up Creation
  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpLead) return;

    try {
      if (scheduleLeadFollowUp) {
        await scheduleLeadFollowUp(followUpLead.id, {
          title: followUpForm.title,
          purpose: followUpForm.purpose,
          dueDateTime: followUpForm.dueDateTime,
          assignedTo: followUpForm.assignedTo
        });
      }
      setFollowUpModalOpen(false);
      setFollowUpLead(null);
      await handleRefresh();
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    }
  };

  // CSV Export
  const exportToCsv = () => {
    if (!academyLeads || academyLeads.length === 0) return;
    const headers = [
      'Reference No',
      'Created Date',
      'Student Full Name',
      'Email',
      'Mobile Phone',
      'Selected Examination',
      'Educational Qualification',
      'Coaching Mode',
      'Study Location',
      'Assigned Counselor',
      'Status'
    ];
    const rows = academyLeads.map(l => {
      const p = parseLeadDetails(l);
      return [
        `"${l.referenceNumber || l.id || ''}"`,
        `"${l.createdAt || ''}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${p.examName.replace(/"/g, '""')}"`,
        `"${p.qualification.replace(/"/g, '""')}"`,
        `"${p.coachingMode.replace(/"/g, '""')}"`,
        `"${p.studyLocation.replace(/"/g, '""')}"`,
        `"${(l.assignedEmployee || 'Unassigned').replace(/"/g, '""')}"`,
        `"${l.status || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revival_student_academy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card bg-white dark:bg-navy-900/90 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Student Academy Module
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Verified Academies &amp; Competitive Exam Enquiries
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Student Academy &amp; Examination Enquiries
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Live examination enquiries, student educational qualifications, preferred coaching modes, and counsellor assignments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={loadingLeads}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-navy-700"
            title="Refresh enquiries from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={academyLeads.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-navy-700 disabled:opacity-50"
            title="Export filtered enquiries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setNewBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold-shimmer text-navy-950 text-xs font-bold shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Academy Enquiry</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Dynamic Live Counts from SQLite database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enquiries */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Academy Enquiries</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{totalCount}</span>
            <span className="text-[11px] font-bold text-slate-500">records</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Competitive exam &amp; academy queries</span>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-emerald-500/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">New Enquiries</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{newCount}</span>
            <span className="text-[11px] font-bold text-emerald-600/70">pending first contact</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Requires student allocation</span>
          </div>
        </div>

        {/* In-Progress Enquiries */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-amber-500/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In-Progress Enquiries</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{inProgressCount}</span>
            <span className="text-[11px] font-bold text-amber-600/70">active coaching sessions</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Course &amp; batch advisory underway</span>
          </div>
        </div>

        {/* Completed / Closed */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-purple-500/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Completed / Enrolled</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">{completedCount}</span>
            <span className="text-[11px] font-bold text-purple-600/70">
              {totalCount > 0 ? `${((completedCount / totalCount) * 100).toFixed(0)}% resolved` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Successfully guided applicants</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card bg-white dark:bg-navy-900/80 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by student name, email, mobile, ref code, examination, location..."
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Examination Filter - Full examination name in dropdown without artificial truncation */}
            <select
              value={examFilter}
              onChange={(e) => { setExamFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[220px] max-w-[340px]"
              title="Filter by Examination"
            >
              <option value="all">All Examinations</option>
              {uniqueExams.map(ex => (
                <option key={ex} value={ex} title={ex}>
                  {ex}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New Enquiry</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed / Enrolled</option>
              <option value="Closed">Closed / Lost</option>
            </select>

            {/* Coaching Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="Online">Online Live</option>
              <option value="Offline">Offline Classroom</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {/* Study Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="Dubai">Dubai / UAE</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi / NCR</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Online">Online / Remote</option>
            </select>

            {/* Counselor Filter */}
            <select
              value={counselorFilter}
              onChange={(e) => { setCounselorFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Counselors</option>
              {counselors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="unassigned">Unassigned</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-white font-bold">{filteredLeads.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-white font-bold">{academyLeads.length}</strong> academy enquiries
          </span>
          {(searchQuery || examFilter !== 'all' || statusFilter !== 'all' || modeFilter !== 'all' || locationFilter !== 'all' || counselorFilter !== 'all' || dateRangeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setExamFilter('all');
                setStatusFilter('all');
                setModeFilter('all');
                setLocationFilter('all');
                setCounselorFilter('all');
                setDateRangeFilter('all');
                setCurrentPage(1);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="glass-card bg-white dark:bg-navy-900/90 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/75 dark:bg-navy-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Ref Code &amp; Date</th>
                <th className="py-3.5 px-4 min-w-[150px]">Full Name</th>
                <th className="py-3.5 px-4 min-w-[200px]">Email Address</th>
                <th className="py-3.5 px-4 min-w-[160px]">Mobile Number</th>
                <th className="py-3.5 px-4 min-w-[280px] max-w-[420px]">Selected Examination</th>
                <th className="py-3.5 px-4">Educational Qualification</th>
                <th className="py-3.5 px-4">Mode &amp; Location</th>
                <th className="py-3.5 px-4">Assigned Counselor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center space-y-3">
                    <GraduationCap className="w-10 h-10 text-slate-300 dark:text-navy-700 mx-auto" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
                      No Student Academy enquiries found matching current filters.
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Clear filter criteria, or log a new academy examination enquiry using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((b) => {
                  const details = parseLeadDetails(b);
                  const cleanPhone = (b.phone || '').replace(/[\s\-\(\)\+]/g, '');
                  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition duration-150 group"
                    >
                      {/* Ref Code & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {b.referenceNumber || b.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4 align-top min-w-[150px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs whitespace-normal break-words">
                          {b.name || 'Anonymous Student'}
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="py-3.5 px-4 align-top min-w-[200px] max-w-[260px]">
                        {b.email ? (
                          <a
                            href={`mailto:${b.email}`}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-start gap-1.5 whitespace-normal break-all group/mail"
                            title={b.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover/mail:text-indigo-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{b.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3.5 px-4 align-top min-w-[160px]">
                        {b.phone ? (
                          <div className="flex items-center gap-2 font-mono text-xs text-slate-800 dark:text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold whitespace-nowrap">{b.phone}</span>
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-flex items-center gap-0.5 transition"
                                title="Open WhatsApp chat"
                              >
                                WA
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Selected Examination - Full examination name displayed with multi-line text wrapping */}
                      <td className="py-3.5 px-4 align-top min-w-[280px] max-w-[420px]">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-500/20 text-indigo-950 dark:text-indigo-200 shadow-xs">
                          <BookOpen className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                          <span className="font-bold text-xs leading-relaxed whitespace-normal break-words">
                            {details.examName}
                          </span>
                        </div>
                      </td>

                      {/* Educational Qualification */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-normal break-words">
                          {details.qualification}
                        </div>
                        <span className="text-[10px] text-slate-400">Current Qualification</span>
                      </td>

                      {/* Coaching Mode & Study Location */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getModeBadge(details.coachingMode)}`}>
                          {details.coachingMode}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="whitespace-normal break-words" title={details.studyLocation}>{details.studyLocation}</span>
                        </div>
                      </td>

                      {/* Assigned Counselor */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={b.assignedEmployee || 'Unassigned'}
                          onChange={(e) => handleAssignChange(b.id, e.target.value)}
                          className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="Unassigned">Unassigned</option>
                          {counselors.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={b.status || 'New Enquiry'}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${getStatusBadge(b.status)}`}
                        >
                          <option value="New Enquiry">New Enquiry</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Course Selection">Course Selection</option>
                          <option value="Converted">Converted / Enrolled</option>
                          <option value="Closed / Lost">Closed / Lost</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedEnquiry(b);
                            setDossierModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="View Full Student Dossier"
                        >
                          <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>

                        <button
                          onClick={() => {
                            setFollowUpLead(b);
                            setFollowUpModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Schedule Follow-Up Task"
                        >
                          <Calendar className="w-4 h-4 text-amber-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong className="text-slate-900 dark:text-white font-bold">{currentPage}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 inline" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dossier Detail Modal */}
      {dossierModalOpen && selectedEnquiry && (() => {
        const details = parseLeadDetails(selectedEnquiry);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-luxury space-y-5">
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Student Academy Enquiry Dossier
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {selectedEnquiry.referenceNumber || selectedEnquiry.id}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedEnquiry.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Received on {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDossierModalOpen(false);
                    setSelectedEnquiry(null);
                  }}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Selected Examination Banner in Dossier */}
              <div className="p-4 bg-indigo-50/90 dark:bg-indigo-950/60 rounded-2xl border border-indigo-500/30 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Selected Examination (Full Official Title)
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug whitespace-normal break-words">
                  {details.examName}
                </h3>
                {details.courseName && details.courseName !== details.examName && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Target Course / Cohort: <strong className="text-indigo-600 dark:text-indigo-400">{details.courseName}</strong>
                  </p>
                )}
              </div>

              {/* Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Contact Information */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block">
                    Student Contact Details
                  </span>
                  <div className="space-y-1">
                    <div><strong>Full Name:</strong> {selectedEnquiry.name}</div>
                    <div><strong>Email:</strong> <a href={`mailto:${selectedEnquiry.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{selectedEnquiry.email}</a></div>
                    <div><strong>Mobile:</strong> <span className="font-mono">{selectedEnquiry.phone || 'N/A'}</span></div>
                    <div><strong>Privacy:</strong> <span className="text-emerald-600 font-semibold">Contact Confidentiality Confirmed</span></div>
                  </div>
                </div>

                {/* Selected Examination Context */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block">
                    Academic Background
                  </span>
                  <div className="space-y-1">
                    <div><strong>Current Qualification:</strong> <span className="font-semibold">{details.qualification}</span></div>
                    <div><strong>Category:</strong> Student Academy / Competitive Exams</div>
                    <div><strong>Study Location:</strong> {details.studyLocation}</div>
                  </div>
                </div>

                {/* Coaching Preferences */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block">
                    Coaching Preferences
                  </span>
                  <div className="space-y-1">
                    <div><strong>Coaching Mode:</strong> <span className="font-semibold">{details.coachingMode}</span></div>
                    <div><strong>Study Location:</strong> {details.studyLocation}</div>
                    <div><strong>Batch Preference:</strong> Standard Cohort</div>
                  </div>
                </div>

                {/* Advisory Management */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400 block">
                    Enquiry Allocation &amp; Stage
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span><strong>Assigned Advisor:</strong></span>
                      <select
                        value={selectedEnquiry.assignedEmployee || 'Unassigned'}
                        onChange={(e) => handleAssignChange(selectedEnquiry.id, e.target.value)}
                        className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="Unassigned">Unassigned</option>
                        {counselors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span><strong>Status / Stage:</strong></span>
                      <select
                        value={selectedEnquiry.status || 'New Enquiry'}
                        onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                        className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs rounded-lg px-2 py-1 font-bold cursor-pointer"
                      >
                        <option value="New Enquiry">New Enquiry</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Course Selection">Course Selection</option>
                        <option value="Converted">Converted / Enrolled</option>
                        <option value="Closed / Lost">Closed / Lost</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message / Questions */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                  Student Message &amp; Questions
                </span>
                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {details.studentQuestions || 'No specific questions provided.'}
                </div>
              </div>

              {/* Add Counselor Activity Note */}
              <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Log Counselor Advisory Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    placeholder="Record call summary, test series counseling, batch recommendation..."
                    className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!activityNote.trim() || submittingNote}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition disabled:opacity-40 cursor-pointer"
                  >
                    {submittingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Follow-Up Scheduling Modal */}
      {followUpModalOpen && followUpLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Schedule Academy Follow-Up</h3>
                <p className="text-xs text-slate-500">For {followUpLead.name} ({followUpLead.referenceNumber || followUpLead.id})</p>
              </div>
              <button onClick={() => setFollowUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Follow-Up Title</label>
                <input
                  type="text"
                  value={followUpForm.title}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Purpose / Agenda</label>
                <input
                  type="text"
                  value={followUpForm.purpose}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, purpose: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Due Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={followUpForm.dueDateTime}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, dueDateTime: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Assign Counselor</label>
                  <select
                    value={followUpForm.assignedTo}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, assignedTo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    {counselors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setFollowUpModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold shadow-sm cursor-pointer"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual New Academy Enquiry Modal */}
      {newBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Log Student Academy Enquiry
                </h3>
                <p className="text-xs text-slate-500">Record a phone, walk-in, or referred examination enquiry</p>
              </div>
              <button onClick={() => setNewBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.studentName}
                    onChange={(e) => setManualForm({ ...manualForm, studentName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={manualForm.countryCode}
                      onChange={(e) => setManualForm({ ...manualForm, countryCode: e.target.value })}
                      className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-2 w-24"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+971">+971 (AE)</option>
                      <option value="+966">+966 (SA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+1">+1 (US)</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      placeholder="9876543210"
                      className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Selected Examination <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualForm.examName}
                    onChange={(e) => setManualForm({ ...manualForm, examName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    {uniqueExams.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Educational Qualification
                  </label>
                  <select
                    value={manualForm.qualification}
                    onChange={(e) => setManualForm({ ...manualForm, qualification: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="High School / 12th Standard">High School / 12th Standard</option>
                    <option value="Undergraduate Degree (B.A./B.Sc/B.Com)">Undergraduate Degree (B.A./B.Sc/B.Com)</option>
                    <option value="Engineering Degree (B.E./B.Tech)">Engineering Degree (B.E./B.Tech)</option>
                    <option value="Medical / Dental / Allied Health (MBBS/BDS/B.Pharm)">Medical / Dental / Allied Health (MBBS/BDS/B.Pharm)</option>
                    <option value="Postgraduate Degree (M.A./M.Sc/M.Com/MBA/M.Tech)">Postgraduate Degree (M.A./M.Sc/M.Com/MBA/M.Tech)</option>
                    <option value="Polytechnic Diploma Holder">Polytechnic Diploma Holder</option>
                    <option value="Working Professional / Other">Working Professional / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Preferred Coaching Mode
                  </label>
                  <select
                    value={manualForm.preferredLearningMode}
                    onChange={(e) => setManualForm({ ...manualForm, preferredLearningMode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="Online Live">Online Live</option>
                    <option value="Offline Classroom">Offline Classroom</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Preferred Study Location
                  </label>
                  <input
                    type="text"
                    value={manualForm.preferredLocation}
                    onChange={(e) => setManualForm({ ...manualForm, preferredLocation: e.target.value })}
                    placeholder="e.g. Dubai, Chennai, Online"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Assign Counselor
                  </label>
                  <select
                    value={manualForm.assignedEmployee}
                    onChange={(e) => setManualForm({ ...manualForm, assignedEmployee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    {counselors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Student Notes / Questions</label>
                <textarea
                  rows={2}
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Ask about batch timings, foundation course syllabus, mock tests..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setNewBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold-shimmer text-navy-950 font-bold shadow-gold-glow hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {manualSubmitting ? 'Recording...' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CrmStudentAcademy;

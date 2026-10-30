import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmDeleteConfirmModal } from '../components/CrmDeleteConfirmModal';
import { CrmTableScrollContainer } from '../components/CrmTableScrollContainer';
import { useCrm } from '../context/CrmContext';
import { 
  Compass, Calendar, Clock, Globe, GraduationCap, Building2,
  Users, CheckCircle2, AlertCircle, Phone, Mail, MessageSquare, Plus, Search,
  Filter, RefreshCw, Download, ChevronRight, X, UserCheck, ShieldCheck,
  MapPin, ExternalLink, Sparkles, Send, Trash2, ArrowRight, Eye, CheckSquare,
  FileText, Briefcase, Award, ChevronLeft
} from 'lucide-react';

export const CrmCareerGuidance = () => {
  const {
    leads = [],
    loadingLeads,
    fetchLeads,
    updateLead,
    archiveLead,
    addLeadActivity,
    scheduleLeadFollowUp,
    currentRole,
    isSuperAdmin,
    deleteLead
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [activityNote, setActivityNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Superadmin Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const handleConfirmDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeletingLead(true);
      await deleteLead(leadToDelete.id, {
        name: leadToDelete.name,
        referenceNumber: leadToDelete.referenceNumber,
        entityType: 'Career Guidance Enquiry'
      });
      setStatusNotice(`✓ Career Guidance enquiry for "${leadToDelete.name}" (${leadToDelete.referenceNumber || leadToDelete.id}) permanently deleted.`);
      setDeleteModalOpen(false);
      if (selectedEnquiry && (selectedEnquiry.id === leadToDelete.id || selectedEnquiry.referenceNumber === leadToDelete.referenceNumber)) {
        setDossierModalOpen(false);
        setSelectedEnquiry(null);
      }
      setLeadToDelete(null);
      setTimeout(() => setStatusNotice(''), 5000);
    } catch (err) {
      console.error('Delete error:', err);
      setStatusNotice(`⚠️ Error deleting enquiry: ${err.message}`);
    } finally {
      setIsDeletingLead(false);
    }
  };


  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({
    title: 'Career & Stream Advisory Follow-Up',
    purpose: 'Academic Profile Review & Stream Selection',
    dueDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    assignedTo: 'Dhanalakshimi'
  });

  // Manual booking form state
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    organization: '',
    degreeLevel: 'Undergraduate (Bachelor Degree)',
    countryInterest: 'India',
    consultationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    consultationTime: '11:00 AM - 12:00 PM IST',
    consultationMode: 'Virtual Video Call (Google Meet / Zoom)',
    priority: 'Medium',
    assignedEmployee: 'Dhanalakshimi',
    message: ''
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Counselors / Advisors List (India & GCC Team)
  const counselors = [
    'Dhanalakshimi',
    'Sreeja',
    'chentamilselvi',
    'Diviya',
    'balavarshini'
  ];

  const timeSlots = [
    '09:30 AM - 10:30 AM IST',
    '11:00 AM - 12:00 PM IST',
    '02:00 PM - 03:00 PM IST',
    '04:00 PM - 05:00 PM IST',
    '06:00 PM - 07:00 PM IST'
  ];

  const consultationModes = [
    'Virtual Video Call (Google Meet / Zoom)',
    'India HQ Office In-Person (Chennai)',
    'WhatsApp Consultation Call',
    'Direct Phone Call'
  ];

  // Refresh data on mount
  useEffect(() => {
    if (fetchLeads) fetchLeads();
  }, []);

  // Parse lead details and extract stream, course, level, and abbreviation
  const parseCareerDetails = (lead) => {
    if (!lead) return {};
    let custom = {};
    if (lead.customFields) {
      try {
        custom = typeof lead.customFields === 'string' ? JSON.parse(lead.customFields) : lead.customFields;
      } catch (_) {}
    }

    let streamName = lead.streamName || lead.department || custom.streamName || custom.department || custom.stream || '';
    let courseName = lead.courseName || custom.courseName || custom.selectedCourse || custom.course || '';
    let courseAbbr = custom.courseAbbr || '';
    const subProgram = custom.subProgram || '';

    // If stream or course not directly in customFields, parse subProgram
    if (!streamName && subProgram && subProgram.includes('[') && subProgram.includes(']')) {
      streamName = subProgram.split('[')[1].split(']')[0].trim();
    }
    if (!courseName && subProgram) {
      let rawCourse = subProgram.split(' [')[0].trim();
      if (rawCourse.includes(' - ')) {
        const parts = rawCourse.split(' - ');
        if (!courseAbbr) courseAbbr = parts[0].trim();
        courseName = parts.slice(1).join(' - ').trim();
      } else {
        courseName = rawCourse;
      }
    }

    // Check assistanceType if still missing
    if (!courseName && lead.assistanceType && lead.assistanceType !== 'Destination & Profile Assessment' && lead.assistanceType !== 'Stream Planning & Course Advisory' && lead.assistanceType !== 'General Academic Consultation') {
      courseName = lead.assistanceType;
    }

    // Check serviceTitle if still missing
    if ((!streamName || !courseName) && lead.serviceTitle && lead.serviceTitle.includes('Sub-Track:')) {
      const parts = lead.serviceTitle.split('Sub-Track:');
      if (parts[1]) {
        const track = parts[1].trim();
        if (!streamName && track.includes('[') && track.includes(']')) {
          streamName = track.split('[')[1].split(']')[0].trim();
        }
        if (!courseName) {
          courseName = track.split(' [')[0].trim();
        }
      }
    } else if (!courseName && lead.serviceTitle && lead.serviceTitle.includes('Career Guidance |')) {
      courseName = lead.serviceTitle.split('Career Guidance |')[1].trim();
    } else if (!courseName && lead.serviceTitle && lead.serviceTitle.includes('Career Guidance -')) {
      courseName = lead.serviceTitle.split('Career Guidance -')[1].trim();
    }

    // Program level resolution & badge
    const programLevel = custom.programLevel || lead.degreeLevel || (custom.degreeLevel === 'PG' ? 'Postgraduate (Master Degree / MBA)' : 'Undergraduate (Bachelor Degree)');
    let levelBadge = 'UG';
    if (
      custom.degreeLevel === 'PG' ||
      (programLevel && (programLevel.toLowerCase().includes('post') || programLevel.toLowerCase().includes('master') || programLevel === 'PG')) ||
      (courseName && (courseName.startsWith('M.') || courseName.startsWith('MBA') || courseName.startsWith('MCA') || courseName.startsWith('M.Sc') || courseName.startsWith('M.Tech') || courseName.startsWith('M.E.')))
    ) {
      levelBadge = 'PG';
    } else {
      levelBadge = 'UG';
    }

    return {
      streamName: streamName || 'General Academic Stream',
      courseName: courseName || 'General Academic Consultation',
      courseAbbr,
      programLevel,
      levelBadge,
      ...custom
    };
  };

  // Filter logic to isolate Career Guidance inquiries
  const isCareerLead = (l) => {
    if (!l) return false;
    const sId = (l.serviceId || '').toLowerCase();
    const title = (l.serviceTitle || '').toLowerCase();
    const company = (l.company || '').toLowerCase();
    const msg = (l.message || '').toLowerCase();
    const ref = (l.referenceNumber || '').toUpperCase();

    return (
      sId === 'school-career' ||
      sId === 'career-guidance' ||
      ref.startsWith('REV-CAR') ||
      title.includes('career guidance') ||
      company.includes('career guidance') ||
      (title.includes('career') && !sId.includes('dom-rec') && !sId.includes('intl-rec')) ||
      (msg.includes('career guidance') || msg.includes('stream selection'))
    );
  };

  const careerLeads = leads.filter(isCareerLead);

  // Summary Metrics calculated dynamically from real database records
  const totalCount = careerLeads.length;
  const newCount = careerLeads.filter(l => l.status === 'New' || l.status === 'New Enquiry').length;
  const inProgressCount = careerLeads.filter(l => 
    ['In Progress', 'Contacted', 'Contact Pending', 'Consultation Scheduled', 'Proposal Pending'].includes(l.status)
  ).length;
  const convertedCount = careerLeads.filter(l => 
    ['Converted', 'Completed', 'Consultation Completed', 'Qualified'].includes(l.status)
  ).length;

  // Filtered Leads
  const filteredLeads = careerLeads.filter(b => {
    const details = parseCareerDetails(b);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.referenceNumber && b.referenceNumber.toLowerCase().includes(q)) ||
        (b.organizationName && b.organizationName.toLowerCase().includes(q)) ||
        (b.company && b.company.toLowerCase().includes(q)) ||
        (b.degreeLevel && b.degreeLevel.toLowerCase().includes(q)) ||
        (details.programLevel && details.programLevel.toLowerCase().includes(q)) ||
        (details.streamName && details.streamName.toLowerCase().includes(q)) ||
        (details.courseName && details.courseName.toLowerCase().includes(q)) ||
        (b.countryInterest && b.countryInterest.toLowerCase().includes(q)) ||
        (b.message && b.message.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'New') {
        if (!['New', 'New Enquiry'].includes(b.status)) return false;
      } else if (statusFilter === 'Scheduled') {
        if (b.status !== 'Consultation Scheduled') return false;
      } else if (statusFilter === 'InProgress') {
        if (!['In Progress', 'Contacted', 'Contact Pending', 'Proposal Pending'].includes(b.status)) return false;
      } else if (statusFilter === 'Completed') {
        if (!['Converted', 'Completed', 'Consultation Completed', 'Qualified'].includes(b.status)) return false;
      } else if (statusFilter === 'Closed') {
        if (!['Closed / Lost', 'Closed', 'Archived'].includes(b.status)) return false;
      }
    }

    // Academic Level Filter
    if (levelFilter !== 'all') {
      const levelCombined = `${b.degreeLevel || ''} ${details.programLevel || ''}`.toLowerCase();
      if (!levelCombined.includes(levelFilter.toLowerCase())) return false;
    }

    // Destination Filter
    if (destinationFilter !== 'all') {
      if (!b.countryInterest || !b.countryInterest.toLowerCase().includes(destinationFilter.toLowerCase())) return false;
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
      case 'Consultation Scheduled':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'In Progress':
      case 'Contacted':
      case 'Contact Pending':
      case 'Proposal Pending':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Qualified':
      case 'Consultation Completed':
      case 'Completed':
      case 'Converted':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Closed / Lost':
      case 'Closed':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  // Handle Status Update
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLead(leadId, { status: newStatus, currentStage: newStatus });
      if (fetchLeads) await fetchLeads();
      if (selectedEnquiry && selectedEnquiry.id === leadId) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update career guidance status:', err);
    }
  };

  // Handle Counselor Assignment
  const handleAssignChange = async (leadId, employeeName) => {
    try {
      await updateLead(leadId, { assignedEmployee: employeeName });
      if (fetchLeads) await fetchLeads();
      if (selectedEnquiry && selectedEnquiry.id === leadId) {
        setSelectedEnquiry(prev => ({ ...prev, assignedEmployee: employeeName }));
      }
    } catch (err) {
      console.error('Failed to assign career advisor:', err);
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
          title: 'Career Advisory Consultation Note',
          description: activityNote.trim()
        });
      }
      setActivityNote('');
      if (fetchLeads) await fetchLeads();
    } catch (err) {
      console.error('Failed to add advisory note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Direct Manual Booking Submission
  const handleCreateManualBooking = async (e) => {
    e.preventDefault();
    if (manualSubmitting) return;
    setManualSubmitting(true);

    try {
      const fullPhone = `${manualForm.countryCode} ${manualForm.phone}`.trim();
      const payload = {
        name: manualForm.name.trim(),
        email: manualForm.email.trim(),
        phone: fullPhone,
        company: 'Career Guidance',
        organizationName: manualForm.organization.trim() || null,
        serviceId: 'school-career',
        serviceTitle: 'School Student Career Guidance',
        countryInterest: manualForm.countryInterest,
        assistanceType: 'Aptitude & Stream Planning',
        degreeLevel: manualForm.degreeLevel,
        consultationDate: manualForm.consultationDate,
        consultationTime: manualForm.consultationTime,
        consultationMode: manualForm.consultationMode,
        status: 'Consultation Scheduled',
        priority: manualForm.priority,
        assignedEmployee: manualForm.assignedEmployee,
        message: manualForm.message.trim() || `[Manual Career Guidance Consultation Scheduled]\nSchool: ${manualForm.organization}\nTarget: ${manualForm.degreeLevel} (${manualForm.countryInterest})\nDate: ${manualForm.consultationDate} at ${manualForm.consultationTime}\nMode: ${manualForm.consultationMode}`,
        customFields: JSON.stringify({
          organization: manualForm.organization.trim(),
          programLevel: manualForm.degreeLevel,
          countryInterest: manualForm.countryInterest,
          mode: manualForm.consultationMode,
          manualEntry: true
        })
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        setNewBookingModalOpen(false);
        setManualForm({
          name: '',
          email: '',
          phone: '',
          countryCode: '+91',
          organization: '',
          degreeLevel: 'Undergraduate (Bachelor Degree)',
          countryInterest: 'Global / Flexible',
          consultationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          consultationTime: '11:00 AM - 12:00 PM IST',
          consultationMode: 'Virtual Video Call (Google Meet / Zoom)',
          priority: 'Medium',
          assignedEmployee: 'Dhanalakshimi',
          message: ''
        });
        if (fetchLeads) await fetchLeads();
      } else {
        alert(data.message || 'Failed to create career booking');
      }
    } catch (err) {
      console.error('Failed to create manual booking:', err);
      alert('Network or server error while creating booking.');
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
      if (fetchLeads) await fetchLeads();
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
    }
  };

  // CSV Export
  const exportToCsv = () => {
    if (!careerLeads || careerLeads.length === 0) return;
    const headers = [
      'Reference No',
      'Created Date',
      'Student/Parent Name',
      'Email',
      'Phone',
      'School / Organization',
      'Target Academic Level',
      'Selected Stream',
      'Selected Course',
      'Target Destination',
      'Consultation Date',
      'Time Slot',
      'Mode',
      'Assigned Counselor',
      'Status'
    ];
    const rows = careerLeads.map(l => {
      const details = parseCareerDetails(l);
      return [
        `"${l.referenceNumber || l.id || ''}"`,
        `"${l.createdAt || ''}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${(l.organizationName || l.company || '').replace(/"/g, '""')}"`,
        `"${(l.degreeLevel || details.programLevel || '').replace(/"/g, '""')}"`,
        `"${(details.streamName || '').replace(/"/g, '""')}"`,
        `"${(details.courseName || '').replace(/"/g, '""')}"`,
        `"${(l.countryInterest || '').replace(/"/g, '""')}"`,
        `"${l.consultationDate || ''}"`,
        `"${l.consultationTime || ''}"`,
        `"${(l.consultationMode || '').replace(/"/g, '""')}"`,
        `"${(l.assignedEmployee || 'Unassigned').replace(/"/g, '""')}"`,
        `"${l.status || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revival_career_guidance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card bg-white dark:bg-navy-900/90 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                K-12 & Higher Secondary
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Aptitude & Stream Planning Desk
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Career Guidance & Student Advisory
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Live consultation inquiries, student aptitude profiles, stream planning, and advisor allocations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => { if (fetchLeads) fetchLeads(); }}
            disabled={loadingLeads}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-navy-700"
            title="Refresh from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-cyan-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={careerLeads.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-navy-700 disabled:opacity-50"
            title="Export filtered enquiries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setNewBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold-shimmer text-navy-950 text-xs font-bold shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Dynamic Live Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enquiries */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enquiries</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{totalCount}</span>
            <span className="text-[11px] font-bold text-slate-500">records</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Career guidance & stream queries</span>
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
            <span>Requires counsellor dispatch</span>
          </div>
        </div>

        {/* In Progress & Scheduled */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-amber-500/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In-Progress / Scheduled</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{inProgressCount}</span>
            <span className="text-[11px] font-bold text-amber-600/70">active sessions</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Roadmap discussions underway</span>
          </div>
        </div>

        {/* Completed / Converted */}
        <div className="glass-card bg-white dark:bg-navy-900/80 p-5 rounded-2xl border border-purple-500/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Completed / Converted</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">{convertedCount}</span>
            <span className="text-[11px] font-bold text-purple-600/70">
              {totalCount > 0 ? `${((convertedCount / totalCount) * 100).toFixed(0)}% conversion` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span>Successfully guided students</span>
          </div>
        </div>
      </div>

      
      {/* Superadmin Status Notification Toast */}
      {statusNotice && (
        <div className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-between animate-in fade-in ${
          statusNotice.includes('Error') || statusNotice.includes('⚠️')
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusNotice.includes('Error') || statusNotice.includes('⚠️') ? (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{statusNotice}</span>
          </div>
          <button 
            onClick={() => setStatusNotice('')} 
            className={`p-1 rounded-lg transition ${
              statusNotice.includes('Error') || statusNotice.includes('⚠️')
                ? 'text-rose-700 hover:text-rose-900 dark:text-rose-400' 
                : 'text-emerald-700 hover:text-emerald-900 dark:text-emerald-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              placeholder="Search by student/parent name, phone, email, reference code, school..."
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New Enquiry</option>
              <option value="Scheduled">Consultation Scheduled</option>
              <option value="InProgress">In Progress / Contacted</option>
              <option value="Completed">Completed / Converted</option>
              <option value="Closed">Closed / Lost</option>
            </select>

            {/* Academic Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Academic Levels</option>
              <option value="Undergraduate">Undergraduate (Bachelor Degree)</option>
              <option value="Postgraduate">Postgraduate (Master Degree / MBA)</option>
            </select>

            {/* Destination Filter */}
            <select
              value={destinationFilter}
              onChange={(e) => { setDestinationFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Destinations</option>
              <option value="India">India</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia & NZ</option>
              <option value="Europe">Europe</option>
              <option value="UAE & GCC">UAE & GCC</option>
              <option value="Flexible">Global / Flexible</option>
            </select>

            {/* Counselor Filter */}
            <select
              value={counselorFilter}
              onChange={(e) => { setCounselorFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
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
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-white font-bold">{filteredLeads.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-white font-bold">{careerLeads.length}</strong> career enquiries
          </span>
          {(searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || destinationFilter !== 'all' || counselorFilter !== 'all' || dateRangeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setLevelFilter('all');
                setDestinationFilter('all');
                setCounselorFilter('all');
                setDateRangeFilter('all');
                setCurrentPage(1);
              }}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Career Guidance Enquiries Table */}
      <div className="glass-card bg-white dark:bg-navy-900/90 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <CrmTableScrollContainer label="Columns">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50/75 dark:bg-navy-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Reference Code & Date</th>
                <th className="py-3.5 px-4 min-w-[150px]">Student Name</th>
                <th className="py-3.5 px-4 min-w-[180px]">Email Address</th>
                <th className="py-3.5 px-4 min-w-[150px]">Mobile Number</th>
                <th className="py-3.5 px-4 min-w-[220px]">Selected Course / Degree</th>
                <th className="py-3.5 px-4 text-center">Academic Level</th>
                <th className="py-3.5 px-4 min-w-[180px]">Department / Stream</th>
                <th className="py-3.5 px-4">Study Destination</th>
                <th className="py-3.5 px-4">Assigned Counsellor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center space-y-3">
                    <Compass className="w-10 h-10 text-slate-300 dark:text-navy-700 mx-auto" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
                      No career guidance enquiries found matching current filters.
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try clearing search parameters, or book a new career guidance consultation session using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((b) => {
                  const details = parseCareerDetails(b);
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

                      {/* Student Name */}
                      <td className="py-3.5 px-4 align-top min-w-[150px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs whitespace-normal break-words">
                          {b.name || 'Anonymous Student'}
                        </div>
                        {(b.organizationName || b.company) && (b.organizationName !== 'Individual' && b.company !== 'Career Guidance') && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5" title={b.organizationName || b.company}>
                            {b.organizationName || b.company}
                          </div>
                        )}
                      </td>

                      {/* Email Address */}
                      <td className="py-3.5 px-4 align-top min-w-[200px] max-w-[260px]">
                        {b.email ? (
                          <a
                            href={`mailto:${b.email}`}
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-start gap-1.5 whitespace-normal break-all group/mail"
                            title={b.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover/mail:text-cyan-500 shrink-0 mt-0.5" />
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

                      {/* Selected Course / Degree */}
                      <td className="py-3.5 px-4 align-top min-w-[220px] max-w-[320px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs whitespace-normal break-words leading-snug" title={details.courseName}>
                          {details.courseName}
                        </div>
                        {details.courseAbbr && details.courseAbbr !== details.courseName && (
                          <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            {details.courseAbbr}
                          </div>
                        )}
                      </td>

                      {/* Academic Level */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                          details.levelBadge === 'PG'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        }`}>
                          <GraduationCap className="w-3 h-3" />
                          <span>{details.levelBadge}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {details.levelBadge === 'PG' ? 'Postgraduate' : 'Undergraduate'}
                        </div>
                      </td>

                      {/* Department / Stream */}
                      <td className="py-3.5 px-4 align-top min-w-[180px] max-w-[240px]">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-snug" title={details.streamName}>
                          {details.streamName}
                        </div>
                      </td>

                      {/* Study Destination */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span>{b.countryInterest || 'Global / Flexible'}</span>
                        </div>
                        {b.consultationDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                            <span>{b.consultationDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned Counselor */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={b.assignedEmployee || 'Unassigned'}
                          onChange={(e) => handleAssignChange(b.id, e.target.value)}
                          className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
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
                          <option value="Consultation Scheduled">Consultation Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Converted">Converted</option>
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
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition"
                          title="View Full Student Dossier"
                        >
                          <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </button>

                        <button
                          onClick={() => {
                            setFollowUpLead(b);
                            setFollowUpModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition"
                          title="Schedule Follow-Up Task"
                        >
                          <Calendar className="w-4 h-4 text-amber-500" />
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setLeadToDelete(b);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Delete Enquiry (Superadmin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CrmTableScrollContainer>

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
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 inline" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dossier Detail Modal */}
      {dossierModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-luxury space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    Career Guidance Enquiry Dossier
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
              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setLeadToDelete(selectedEnquiry);
                      setDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Delete this career guidance record (Superadmin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                )}
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
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-600 dark:text-cyan-400 block">
                  Contact Information
                </span>
                <div className="space-y-1">
                  <div><strong>Email:</strong> <a href={`mailto:${selectedEnquiry.email}`} className="text-cyan-600 dark:text-cyan-400 hover:underline">{selectedEnquiry.email}</a></div>
                  <div><strong>Phone:</strong> <span className="font-mono">{selectedEnquiry.phone || 'N/A'}</span></div>
                  <div><strong>Consent:</strong> <span className="text-emerald-600 font-semibold">Direct Communication Consent Confirmed</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-600 dark:text-cyan-400 block">
                  Academic Focus
                </span>
                {(() => {
                  const dossierDetails = parseCareerDetails(selectedEnquiry);
                  return (
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <strong>Selected Course / Degree:</strong>{' '}
                        <span className="text-amber-600 dark:text-amber-400 font-bold block sm:inline mt-0.5 sm:mt-0">
                          {dossierDetails.courseName}
                        </span>
                      </div>
                      {dossierDetails.courseAbbr && dossierDetails.courseAbbr !== dossierDetails.courseName && (
                        <div><strong>Degree / Abbr:</strong> <span className="font-mono font-semibold">{dossierDetails.courseAbbr}</span></div>
                      )}
                      <div><strong>Academic Level:</strong> <span className="font-semibold">{dossierDetails.programLevel} ({dossierDetails.levelBadge})</span></div>
                      <div><strong>Department / Stream:</strong> <span className="font-semibold">{dossierDetails.streamName}</span></div>
                      <div><strong>Current Institution:</strong> {selectedEnquiry.organizationName || selectedEnquiry.company || 'Not Specified'}</div>
                      <div><strong>Target Destination:</strong> {selectedEnquiry.countryInterest || 'Global / Flexible'}</div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-600 dark:text-cyan-400 block">
                  Consultation Appointment
                </span>
                <div className="space-y-1">
                  <div><strong>Date:</strong> {selectedEnquiry.consultationDate || 'Not specified'}</div>
                  <div><strong>Time Slot:</strong> {selectedEnquiry.consultationTime || 'Not specified'}</div>
                  <div><strong>Format / Mode:</strong> {selectedEnquiry.consultationMode || 'Virtual Video Call'}</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-600 dark:text-cyan-400 block">
                  Advisory Management
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span><strong>Assigned Advisor:</strong></span>
                    <select
                      value={selectedEnquiry.assignedEmployee || 'Unassigned'}
                      onChange={(e) => handleAssignChange(selectedEnquiry.id, e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs rounded-lg px-2 py-1"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {counselors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><strong>Stage / Status:</strong></span>
                    <select
                      value={selectedEnquiry.status || 'New Enquiry'}
                      onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs rounded-lg px-2 py-1 font-bold"
                    >
                      <option value="New Enquiry">New Enquiry</option>
                      <option value="Consultation Scheduled">Consultation Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed / Lost">Closed / Lost</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Background & Questions Message */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                Academic Background & Specific Inquiries
              </span>
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                {selectedEnquiry.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Attribution Meta */}
            {(selectedEnquiry.utmSource || selectedEnquiry.referrer) && (
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold block uppercase text-[10px] text-slate-400">Marketing Attribution</span>
                <div>Source: {selectedEnquiry.utmSource || 'Direct'} {selectedEnquiry.utmMedium ? `(${selectedEnquiry.utmMedium})` : ''}</div>
                {selectedEnquiry.referrer && <div>Referrer: {selectedEnquiry.referrer}</div>}
              </div>
            )}

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
                  placeholder="Record call outcome, aptitude assessment notes, or next action..."
                  className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!activityNote.trim() || submittingNote}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-40"
                >
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-Up Scheduling Modal */}
      {followUpModalOpen && followUpLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Schedule Advisory Follow-Up</h3>
                <p className="text-xs text-slate-500">For {followUpLead.name} ({followUpLead.referenceNumber || followUpLead.id})</p>
              </div>
              <button onClick={() => setFollowUpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Due Date & Time</label>
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
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold shadow-sm"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual New Consultation Booking Modal */}
      {newBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Log Career Guidance Consultation
                </h3>
                <p className="text-xs text-slate-500">Record a phone, walk-in, or referred student consultation</p>
              </div>
              <button onClick={() => setNewBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Student / Parent Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
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
                    Phone / WhatsApp <span className="text-rose-500">*</span>
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
                    Current School / College
                  </label>
                  <input
                    type="text"
                    value={manualForm.organization}
                    onChange={(e) => setManualForm({ ...manualForm, organization: e.target.value })}
                    placeholder="e.g. Delhi Public School"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Academic Level
                  </label>
                  <select
                    value={manualForm.degreeLevel}
                    onChange={(e) => setManualForm({ ...manualForm, degreeLevel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="Undergraduate (Bachelor Degree)">Undergraduate (Bachelor Degree)</option>
                    <option value="Postgraduate (Master Degree / MBA)">Postgraduate (Master Degree / MBA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Destination
                  </label>
                  <select
                    value={manualForm.countryInterest}
                    onChange={(e) => setManualForm({ ...manualForm, countryInterest: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="India">India</option>
                    <option value="Global / Flexible">Global / Flexible</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia & NZ</option>
                    <option value="Europe">Europe</option>
                    <option value="UAE & GCC">UAE & GCC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Date</label>
                  <input
                    type="date"
                    value={manualForm.consultationDate}
                    onChange={(e) => setManualForm({ ...manualForm, consultationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Time Slot</label>
                  <select
                    value={manualForm.consultationTime}
                    onChange={(e) => setManualForm({ ...manualForm, consultationTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-2"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Mode</label>
                  <select
                    value={manualForm.consultationMode}
                    onChange={(e) => setManualForm({ ...manualForm, consultationMode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-2"
                  >
                    {consultationModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Assign Counselor</label>
                  <select
                    value={manualForm.assignedEmployee}
                    onChange={(e) => setManualForm({ ...manualForm, assignedEmployee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    {counselors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Priority</label>
                  <select
                    value={manualForm.priority}
                    onChange={(e) => setManualForm({ ...manualForm, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Student Notes / Background</label>
                <textarea
                  rows={2}
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Aptitude assessment request, stream dilemma (Science vs Commerce), etc."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setNewBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-xl bg-gold-shimmer text-navy-950 font-bold shadow-gold-glow hover:opacity-95 disabled:opacity-50"
                >
                  {manualSubmitting ? 'Recording...' : 'Save Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Superadmin Delete Confirmation Modal */}
      <CrmDeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeletingLead) {
            setDeleteModalOpen(false);
            setLeadToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteLead}
        title="Delete Career Guidance Enquiry"
        recordName={leadToDelete?.name}
        recordRef={leadToDelete?.referenceNumber || leadToDelete?.id}
        recordType="Career Guidance Enquiry"
        isProcessing={isDeletingLead}
      />
    </div>
  );
};
export default CrmCareerGuidance;


import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { 
  CalendarCheck, Calendar, Clock, Globe, Compass, GraduationCap, Building2,
  Users, CheckCircle2, AlertCircle, Phone, Mail, MessageSquare, Plus, Search,
  Filter, RefreshCw, Download, ChevronRight, X, UserCheck, ShieldCheck,
  MapPin, ExternalLink, Sparkles, Send, Trash2, ArrowRight, Eye, CheckSquare,
  FileText, Briefcase
} from 'lucide-react';

export const CrmConsultingBookings = () => {
  const {
    leads = [],
    loadingLeads,
    fetchLeads,
    updateLead,
    archiveLead,
    addLeadActivity,
    scheduleLeadFollowUp,
    consultingMetrics,
    fetchConsultingMetrics
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [intakeFilter, setIntakeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSavedMsg, setTrackingSavedMsg] = useState('');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpLead, setFollowUpLead] = useState(null);

  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({
    title: 'Consultation Follow-Up',
    purpose: 'Academic / Destination Roadmap Review',
    dueDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    assignedTo: 'Dhanalakshimi'
  });

  // Manual booking form state
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    company: 'Individual',
    serviceId: 'intl-consult',
    serviceTitle: 'International Consulting',
    countryInterest: 'United Kingdom',
    assistanceType: 'Destination Selection & Comparison',
    degreeLevel: 'Postgraduate / Master Degree',
    intakeTerm: 'Fall 2026',
    consultationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    consultationTime: '11:00 AM - 12:00 PM IST',
    consultationMode: 'Virtual Video Call (Google Meet / Zoom)',
    priority: 'Medium',
    assignedEmployee: 'Dhanalakshimi',
    message: ''
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Counselors / Advisors List (India Office Team)
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
    if (fetchConsultingMetrics) fetchConsultingMetrics();
  }, []);

  // Filter leads to include all consulting, academic advisory, and direct consultation bookings
  const isConsultingLead = (l) => {
    const sId = (l.serviceId || '').toLowerCase();
    const title = (l.serviceTitle || '').toLowerCase();
    const msg = (l.message || '').toLowerCase();
    return (
      l.consultationDate ||
      l.status === 'Consultation Scheduled' ||
      l.status === 'Consultation Completed' ||
      sId.includes('consult') ||
      sId.includes('adm') ||
      sId.includes('career') ||
      sId.includes('academy') ||
      sId.includes('lang') ||
      title.includes('consult') ||
      title.includes('advisory') ||
      title.includes('admission') ||
      msg.includes('consultation')
    );
  };

  const consultingBookings = leads.filter(isConsultingLead);

  // Apply Search & Filters
  const filteredBookings = consultingBookings.filter(b => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.referenceNumber && b.referenceNumber.toLowerCase().includes(q)) ||
        (b.countryInterest && b.countryInterest.toLowerCase().includes(q)) ||
        (b.serviceTitle && b.serviceTitle.toLowerCase().includes(q)) ||
        (b.message && b.message.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Service Filter
    if (serviceFilter !== 'all') {
      if (serviceFilter === 'intl-consult') {
        const match = (b.serviceId === 'intl-consult' || (b.serviceTitle || '').toLowerCase().includes('international consulting'));
        if (!match) return false;
      } else if (serviceFilter === 'admissions') {
        const match = ((b.serviceId || '').includes('adm') || (b.serviceTitle || '').toLowerCase().includes('admission'));
        if (!match) return false;
      } else if (serviceFilter === 'career') {
        const match = ((b.serviceId || '').includes('career') || (b.serviceId || '').includes('academy'));
        if (!match) return false;
      } else if (serviceFilter === 'lang') {
        const match = ((b.serviceId || '').includes('lang') || (b.serviceTitle || '').toLowerCase().includes('language'));
        if (!match) return false;
      } else if (serviceFilter === 'corporate') {
        const match = (!b.serviceId || b.serviceId.includes('rec') || b.serviceId.includes('staff') || b.serviceId.includes('exec'));
        if (!match) return false;
      }
    }

    // Status Filter (supports both legacy groups and exact 10-stage workflow statuses)
    if (statusFilter !== 'all') {
      if (statusFilter === 'Scheduled') {
        if (b.status !== 'Consultation Scheduled') return false;
      } else if (statusFilter === 'New') {
        if (b.status !== 'New' && b.status !== 'New Enquiry') return false;
      } else if (statusFilter === 'InProgress') {
        if (!['In Progress', 'Contacted', 'Contact Pending', 'Course Selection', 'Documents Pending', 'Application in Preparation', 'Application Submitted', 'Awaiting Institution Decision'].includes(b.status)) return false;
      } else if (statusFilter === 'Completed') {
        if (!['Consultation Completed', 'Qualified', 'Offer Received'].includes(b.status)) return false;
      } else if (statusFilter === 'Converted') {
        if (!['Converted', 'Completed', 'Enrollment in Progress'].includes(b.status)) return false;
      } else if (b.status !== statusFilter) {
        return false;
      }
    }

    // Destination Filter
    if (destinationFilter !== 'all') {
      const dest = (b.countryInterest || '').toLowerCase();
      if (!dest.includes(destinationFilter.toLowerCase())) return false;
    }

    // Intake Filter
    if (intakeFilter !== 'all') {
      const intake = (b.intakeTerm || '').toLowerCase();
      if (!intake.includes(intakeFilter.toLowerCase())) return false;
    }

    // Mode Filter
    if (modeFilter !== 'all') {
      const mode = (b.consultationMode || b.preferredContactMethod || '').toLowerCase();
      if (modeFilter === 'virtual' && !mode.includes('virtual') && !mode.includes('video') && !mode.includes('meet') && !mode.includes('zoom')) return false;
      if (modeFilter === 'in-person' && !mode.includes('in-person') && !mode.includes('dubai') && !mode.includes('office')) return false;
      if (modeFilter === 'whatsapp' && !mode.includes('whatsapp')) return false;
      if (modeFilter === 'phone' && !mode.includes('phone') && !mode.includes('call')) return false;
    }

    return true;
  });

  // KPI Counts
  const totalCount = consultingBookings.length;
  const scheduledCount = consultingBookings.filter(b => b.status === 'Consultation Scheduled' || b.consultationDate).length;
  const intlConsultCount = consultingBookings.filter(b => b.serviceId === 'intl-consult' || (b.serviceTitle || '').toLowerCase().includes('international consulting')).length;
  const completedCount = consultingBookings.filter(b => b.status === 'Consultation Completed' || b.status === 'Qualified').length;
  const convertedCount = consultingBookings.filter(b => b.status === 'Converted' || b.status === 'Completed').length;
  const virtualCount = consultingBookings.filter(b => (b.consultationMode || '').toLowerCase().includes('virtual') || (b.consultationMode || '').toLowerCase().includes('video')).length;
  const indiaHqCount = consultingBookings.filter(b => (b.consultationMode || '').toLowerCase().includes('india') || (b.consultationMode || '').toLowerCase().includes('in-person') || (b.consultationMode || '').toLowerCase().includes('chennai') || (b.consultationMode || '').toLowerCase().includes('dubai')).length;

  // Parse customFields JSON helper for College Admission Tracking
  const parseCustomFields = (booking) => {
    if (!booking || !booking.customFields) return {};
    if (typeof booking.customFields === 'object') return booking.customFields;
    try {
      return JSON.parse(booking.customFields);
    } catch (_) {
      return {};
    }
  };

  // Handle Status Update (with confirmation guard for Application Submitted / Offer Received)
  const handleStatusChange = async (leadId, newStatus) => {
    if (
      (newStatus === 'Application Submitted' || newStatus === 'Offer Received') &&
      typeof window !== 'undefined' &&
      typeof window.confirm === 'function'
    ) {
      const confirmed = window.confirm(
        `Please confirm: Has "${newStatus}" been officially verified with the student/institution dossier before updating this status?`
      );
      if (!confirmed) return;
    }
    try {
      await updateLead(leadId, { status: newStatus, currentStage: newStatus });
      if (fetchLeads) await fetchLeads();
      if (fetchConsultingMetrics) await fetchConsultingMetrics();
    } catch (err) {
      console.error('Failed to update consultation status:', err);
    }
  };

  // Handle Counselor Assignment
  const handleAssignChange = async (leadId, employeeName) => {
    try {
      await updateLead(leadId, { assignedEmployee: employeeName });
      if (fetchLeads) await fetchLeads();
    } catch (err) {
      console.error('Failed to assign counselor:', err);
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
        company: manualForm.company.trim() || 'Individual Client',
        serviceId: manualForm.serviceId,
        serviceTitle: manualForm.serviceTitle,
        countryInterest: manualForm.countryInterest,
        assistanceType: manualForm.assistanceType,
        degreeLevel: manualForm.degreeLevel,
        intakeTerm: manualForm.intakeTerm,
        consultationDate: manualForm.consultationDate,
        consultationTime: manualForm.consultationTime,
        consultationMode: manualForm.consultationMode,
        status: 'Consultation Scheduled',
        priority: manualForm.priority,
        assignedEmployee: manualForm.assignedEmployee,
        message: manualForm.message.trim() || `[Consultation Scheduled by Advisor]\nTarget Destination: ${manualForm.countryInterest}\nDate: ${manualForm.consultationDate} at ${manualForm.consultationTime}\nMode: ${manualForm.consultationMode}`
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
          countryCode: '+971',
          company: 'Individual',
          serviceId: 'intl-consult',
          serviceTitle: 'International Consulting',
          countryInterest: 'United Kingdom',
          assistanceType: 'Destination Selection & Comparison',
          degreeLevel: 'Postgraduate / Master Degree',
          intakeTerm: 'Fall 2026',
          consultationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          consultationTime: '11:00 AM - 12:00 PM IST',
          consultationMode: 'Virtual Video Call (Google Meet / Zoom)',
          priority: 'Medium',
          assignedEmployee: 'Dhanalakshimi',
          message: ''
        });
        if (fetchLeads) await fetchLeads();
        if (fetchConsultingMetrics) await fetchConsultingMetrics();
      } else {
        alert(data.message || 'Failed to save booking.');
      }
    } catch (err) {
      console.error('Manual booking error:', err);
      alert('Error creating consultation booking.');
    } finally {
      setManualSubmitting(false);
    }
  };

  // Handle Follow-Up Creation
  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpLead) return;
    try {
      await scheduleLeadFollowUp(followUpLead.id, {
        title: followUpForm.title,
        purpose: followUpForm.purpose,
        dueDateTime: followUpForm.dueDateTime,
        assignedTo: followUpForm.assignedTo
      });
      setFollowUpModalOpen(false);
      setFollowUpLead(null);
      if (fetchLeads) await fetchLeads();
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
      alert('Error scheduling follow-up.');
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Reference Number', 'Date Submitted', 'Client Name', 'Email', 'Phone',
      'Service Track', 'Target Destination', 'Consultation Date', 'Time Slot',
      'Mode', 'Assigned Counselor', 'Status', 'Priority', 'Inquiry Context'
    ];
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredBookings.map(b => [
      escapeCsv(b.referenceNumber || b.id),
      escapeCsv(b.createdAt ? b.createdAt.slice(0, 10) : ''),
      escapeCsv(b.name),
      escapeCsv(b.email),
      escapeCsv(b.phone),
      escapeCsv(b.serviceTitle || b.serviceId || 'International Consulting'),
      escapeCsv(b.countryInterest || 'All'),
      escapeCsv(b.consultationDate || 'Not specified'),
      escapeCsv(b.consultationTime || 'Flexible'),
      escapeCsv(b.consultationMode || b.preferredContactMethod || 'Virtual'),
      escapeCsv(b.assignedEmployee || 'Unassigned'),
      escapeCsv(b.status || 'New'),
      escapeCsv(b.priority || 'Medium'),
      escapeCsv(b.message || '')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revival_Consulting_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans pb-12">

        {/* HERO / HEADER SECTION */}
        <div className="glass-card bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300 dark:border-gold-500/30">
                Live Advisory Pipeline
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Real-Time Synchronized
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-gold-500" />
              Consulting & Advisory Bookings CRM
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
              Manage all client and candidate consultation appointments, destination roadmaps, admissions counseling, and executive strategy sessions from one unified portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (fetchLeads) fetchLeads();
                if (fetchConsultingMetrics) fetchConsultingMetrics();
              }}
              className="px-3.5 py-2 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-navy-700"
              title="Refresh leads and bookings from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin text-gold-500' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-navy-700"
              title="Download bookings as CSV"
            >
              <Download className="w-3.5 h-3.5 text-gold-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setNewBookingModalOpen(true)}
              className="px-4 py-2 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Direct Consultation</span>
            </button>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <p className="font-serif text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </p>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
              All Advisory Inquiries
            </span>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-amber-300 dark:border-gold-500/30 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 dark:text-gold-400 uppercase tracking-wider block">
              Scheduled
            </span>
            <p className="font-serif text-2xl font-black text-amber-600 dark:text-gold-400">
              {scheduledCount}
            </p>
            <span className="text-[10px] text-amber-700 dark:text-gold-500/80 font-bold">
              Upcoming Appointments
            </span>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Intl Consulting
            </span>
            <p className="font-serif text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {intlConsultCount}
            </p>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-300 font-semibold">
              UK, US, Canada, EU
            </span>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
              Virtual / Video
            </span>
            <p className="font-serif text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {virtualCount}
            </p>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold">
              Google Meet / Zoom
            </span>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              India HQ Office
            </span>
            <p className="font-serif text-2xl font-black text-purple-600 dark:text-purple-400">
              {indiaHqCount}
            </p>
            <span className="text-[10px] text-purple-500 dark:text-purple-300 font-semibold">
              Chennai HQ In-Person
            </span>
          </div>

          <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Converted
            </span>
            <p className="font-serif text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {convertedCount}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Enrolled & Placed
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, ref code, phone, country..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              {/* Service Filter */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Consultation Services</option>
                <option value="intl-consult">🎓 International Consulting</option>
                <option value="admissions">🏛️ Admissions (College & Intl)</option>
                <option value="career">🧭 Career Guidance & Academy</option>
                <option value="lang">🗣️ Executive & Language Prep</option>
                <option value="corporate">💼 Corporate & Recruitment Consulting</option>
              </select>

              {/* Status Filter (10-Stage Workflow + General) */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Workflow Statuses</option>
                <option value="New Enquiry">1. New Enquiry</option>
                <option value="Consultation Scheduled">2. Consultation Scheduled</option>
                <option value="Course Selection">3. Course Selection</option>
                <option value="Documents Pending">4. Documents Pending</option>
                <option value="Application in Preparation">5. Application in Preparation</option>
                <option value="Application Submitted">6. Application Submitted</option>
                <option value="Awaiting Institution Decision">7. Awaiting Institution Decision</option>
                <option value="Offer Received">8. Offer Received</option>
                <option value="Enrollment in Progress">9. Enrollment in Progress</option>
                <option value="Closed">10. Closed</option>
              </select>

              {/* Destination Filter */}
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Destinations</option>
                <option value="india">India</option>
                <option value="united arab emirates">UAE</option>
                <option value="united kingdom">United Kingdom</option>
                <option value="united states">United States</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
                <option value="germany">Germany / Europe</option>
              </select>

              {/* Intake Filter */}
              <select
                value={intakeFilter}
                onChange={(e) => setIntakeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Intakes</option>
                <option value="fall">Fall / Autumn Intake</option>
                <option value="spring">Spring / January Intake</option>
                <option value="summer">Summer Intake</option>
                <option value="2026">2026–2027 Academic Intake</option>
              </select>

              {/* Mode Filter */}
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">All Consultation Modes</option>
                <option value="virtual">💻 Virtual Video Call</option>
                <option value="in-person">🏢 India HQ In-Person</option>
                <option value="whatsapp">💬 WhatsApp Consultation</option>
                <option value="phone">📞 Direct Phone Call</option>
              </select>

              {(searchQuery || serviceFilter !== 'all' || statusFilter !== 'all' || destinationFilter !== 'all' || intakeFilter !== 'all' || modeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setServiceFilter('all');
                    setStatusFilter('all');
                    setDestinationFilter('all');
                    setIntakeFilter('all');
                    setModeFilter('all');
                  }}
                  className="px-2.5 py-2 text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div className="glass-card bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Bookings & Consultations</span>
                <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-extrabold text-[11px] font-mono">
                  {filteredBookings.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live entries synchronized from website forms, international consulting portals, and CRM.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3.5 font-extrabold">REF CODE & DATE</th>
                  <th className="p-3.5 font-extrabold">CLIENT / CANDIDATE</th>
                  <th className="p-3.5 font-extrabold">CONSULTATION TRACK</th>
                  <th className="p-3.5 font-extrabold">SCHEDULED APPOINTMENT</th>
                  <th className="p-3.5 font-extrabold">CONSULTATION MODE</th>
                  <th className="p-3.5 font-extrabold">ASSIGNED ADVISOR</th>
                  <th className="p-3.5 font-extrabold">STATUS</th>
                  <th className="p-3.5 font-extrabold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-sm">No consultation bookings match your current criteria.</p>
                      <p className="text-[11px] mt-1">Try resetting filters or click "Book Direct Consultation" to record a new booking.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
                    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(booking.name)},%20regarding%20your%20consultation%20booking%20with%20The%20Revival%20International...` : null;
                    const mailtoUrl = `mailto:${booking.email}?subject=Regarding Your Consultation - The Revival International&body=Dear ${encodeURIComponent(booking.name)},%0D%0A%0D%0AThank you for booking a consultation with The Revival International regarding ${encodeURIComponent(booking.serviceTitle || 'our advisory services')}.%0D%0A%0D%0A`;

                    return (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition group"
                      >
                        {/* Ref Code & Date */}
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-gold-600 dark:text-gold-400 block">
                            {booking.referenceNumber || booking.id.slice(0, 12)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {booking.createdAt ? booking.createdAt.slice(0, 10) : 'Recent'}
                          </span>
                        </td>

                        {/* Client / Candidate Contact */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{booking.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="truncate max-w-[150px]">{booking.email}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-semibold">{booking.phone}</span>
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <a
                              href={mailtoUrl}
                              className="text-blue-600 dark:text-blue-400 hover:opacity-80 transition"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        {/* Consultation Track */}
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[160px]">
                            {booking.serviceTitle || booking.serviceId || 'International Consulting'}
                          </span>
                          {booking.countryInterest && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                              🌍 {booking.countryInterest}
                            </span>
                          )}
                          {booking.degreeLevel && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">
                              {booking.degreeLevel}
                            </span>
                          )}
                        </td>

                        {/* Scheduled Appointment */}
                        <td className="p-3.5">
                          {booking.consultationDate ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                                {booking.consultationDate}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.consultationTime || 'Flexible Slot'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              To Be Scheduled
                            </span>
                          )}
                        </td>

                        {/* Consultation Mode */}
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            (booking.consultationMode || '').toLowerCase().includes('india') || (booking.consultationMode || '').toLowerCase().includes('in-person') || (booking.consultationMode || '').toLowerCase().includes('chennai') || (booking.consultationMode || '').toLowerCase().includes('office') || (booking.consultationMode || '').toLowerCase().includes('dubai')
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                              : (booking.consultationMode || '').toLowerCase().includes('whatsapp')
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                          }`}>
                            {(booking.consultationMode || '').toLowerCase().includes('india') || (booking.consultationMode || '').toLowerCase().includes('in-person') || (booking.consultationMode || '').toLowerCase().includes('chennai') || (booking.consultationMode || '').toLowerCase().includes('office') || (booking.consultationMode || '').toLowerCase().includes('dubai') ? '🏢 India HQ Office' :
                             (booking.consultationMode || '').toLowerCase().includes('whatsapp') ? '💬 WhatsApp Video' :
                             (booking.consultationMode || '').toLowerCase().includes('phone') ? '📞 Phone Call' :
                             '💻 Virtual (Meet/Zoom)'}
                          </span>
                        </td>

                        {/* Assigned Advisor */}
                        <td className="p-3.5">
                          <select
                            value={booking.assignedEmployee || 'Dhanalakshimi'}
                            onChange={(e) => handleAssignChange(booking.id, e.target.value)}
                            className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-[11px] rounded-lg p-1.5 font-bold focus:outline-none focus:border-gold-500 cursor-pointer"
                          >
                            {counselors.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-3.5">
                          <select
                            value={booking.status || 'New Enquiry'}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className={`text-[11px] font-extrabold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                              booking.status === 'Consultation Scheduled'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-gold-500/20 dark:text-gold-300 dark:border-gold-500/40'
                                : booking.status === 'Consultation Completed' || booking.status === 'Qualified'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40'
                                : booking.status === 'Converted' || booking.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                                : booking.status === 'In Progress' || booking.status === 'Contacted'
                                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-navy-950 dark:text-slate-300 dark:border-navy-700'
                            }`}
                          >
                            <option value="New Enquiry">1. New Enquiry</option>
                            <option value="Consultation Scheduled">2. Consultation Scheduled</option>
                            <option value="Course Selection">3. Course Selection</option>
                            <option value="Documents Pending">4. Documents Pending</option>
                            <option value="Application in Preparation">5. Application in Preparation</option>
                            <option value="Application Submitted">6. Application Submitted</option>
                            <option value="Awaiting Institution Decision">7. Awaiting Institution Decision</option>
                            <option value="Offer Received">8. Offer Received</option>
                            <option value="Enrollment in Progress">9. Enrollment in Progress</option>
                            <option value="Closed">10. Closed</option>
                            <option value="Contacted">📞 Contacted</option>
                            <option value="In Progress">⏳ In Progress</option>
                            <option value="Consultation Completed">✅ Completed</option>
                            <option value="Qualified">🎓 Qualified</option>
                            <option value="Converted">🏆 Converted / Enrolled</option>
                            <option value="Closed / Lost">❌ Closed / Lost</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setDossierModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                              title="View full booking dossier"
                            >
                              <Eye className="w-3 h-3 text-gold-500" />
                              <span>Dossier</span>
                            </button>

                            <button
                              onClick={() => {
                                setFollowUpLead(booking);
                                setFollowUpModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-gold-500/10 dark:hover:bg-gold-500/20 text-amber-800 dark:text-gold-400 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 border border-amber-200 dark:border-gold-500/30"
                              title="Schedule CRM follow-up"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Follow-Up</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* FULL CONSULTATION DOSSIER MODAL */}
        {dossierModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-luxury space-y-5 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                    {selectedBooking.referenceNumber || selectedBooking.id}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Consultation Dossier: {selectedBooking.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Service: {selectedBooking.serviceTitle || selectedBooking.serviceId || 'International Consulting'}
                  </p>
                </div>
                <button
                  onClick={() => setDossierModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Profile Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.email}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone / WhatsApp</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.phone}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Destination</span>
                  <p className="font-bold text-slate-900 dark:text-white">🌍 {selectedBooking.countryInterest || 'All Global Destinations'}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Program / Degree Level</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.degreeLevel || 'Undergraduate / Postgraduate'}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Booked Consultation Date</span>
                  <p className="font-bold text-gold-600 dark:text-gold-400">
                    {selectedBooking.consultationDate ? `${selectedBooking.consultationDate} (${selectedBooking.consultationTime || 'Time TBD'})` : 'Not yet scheduled'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consultation Mode</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.consultationMode || selectedBooking.preferredContactMethod || 'Virtual Video Call'}</p>
                </div>
              </div>

              {/* Inquiry & Academic Message Context */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Candidate Inquiry & Goals:</span>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed text-[11px]">
                  {selectedBooking.message || 'No additional message provided.'}
                </div>
              </div>

              {/* Phase 7: College & University Application Tracking Panel */}
              {(() => {
                const cf = parseCustomFields(selectedBooking);
                const docChecklist = cf.documentChecklistStatus || {
                  marksheets10and12: 'Pending Review',
                  diplomaOrDegreeCertificate: 'If Required',
                  academicTranscripts: 'Pending Review',
                  governmentIdOrPassport: 'Pending Review',
                  statementOfPurpose: 'If Required',
                  recommendationLetters: 'If Required',
                  englishProficiency: 'If Required',
                  institutionSpecificDocs: 'If Required'
                };

                const updateCustomField = (key, val) => {
                  const nextCf = { ...cf, [key]: val };
                  setSelectedBooking({ ...selectedBooking, customFields: nextCf });
                };

                const updateDocStatus = (docKey, statusVal) => {
                  const nextDocs = { ...docChecklist, [docKey]: statusVal };
                  updateCustomField('documentChecklistStatus', nextDocs);
                };

                const saveApplicationTracking = async () => {
                  setSavingTracking(true);
                  setTrackingSavedMsg('');
                  try {
                    await updateLead(selectedBooking.id, {
                      customFields: parseCustomFields(selectedBooking),
                      nextActionDate: selectedBooking.nextActionDate || null,
                      internalNotes: selectedBooking.internalNotes || null
                    });
                    if (fetchLeads) await fetchLeads();
                    setTrackingSavedMsg('Application tracking & document checklist saved.');
                  } catch (e) {
                    console.error('Error saving tracking:', e);
                  } finally {
                    setSavingTracking(false);
                  }
                };

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2.5">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gold-600 dark:text-gold-400">
                          Admission &amp; Application Tracking
                        </span>
                        <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                          Document Checklist, Deadlines &amp; Offer Status
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={saveApplicationTracking}
                        disabled={savingTracking}
                        className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-[11px] rounded-lg transition cursor-pointer"
                      >
                        {savingTracking ? 'Saving...' : 'Save Tracking'}
                      </button>
                    </div>

                    {trackingSavedMsg && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        {trackingSavedMsg}
                      </div>
                    )}

                    {/* Dates, Offer Status & Conditions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Application Submission Date</label>
                        <input
                          type="date"
                          value={cf.applicationSubmissionDate || ''}
                          onChange={(e) => updateCustomField('applicationSubmissionDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Institution Application Deadline</label>
                        <input
                          type="date"
                          value={cf.applicationDeadline || ''}
                          onChange={(e) => updateCustomField('applicationDeadline', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Offer Status</label>
                        <select
                          value={cf.offerStatus || 'Not Applied Yet'}
                          onChange={(e) => updateCustomField('offerStatus', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white font-bold"
                        >
                          <option value="Not Applied Yet">Not Applied Yet</option>
                          <option value="Application Under Review">Application Under Review</option>
                          <option value="Conditional Offer Received">Conditional Offer Received</option>
                          <option value="Unconditional Offer Received">Unconditional Offer Received</option>
                          <option value="Offer Accepted / Enrolled">Offer Accepted / Enrolled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Next Follow-Up Date</label>
                        <input
                          type="date"
                          value={selectedBooking.nextActionDate ? selectedBooking.nextActionDate.slice(0, 10) : ''}
                          onChange={(e) => setSelectedBooking({ ...selectedBooking, nextActionDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Outstanding Offer Conditions / Advisor Notes</label>
                      <input
                        type="text"
                        value={cf.outstandingConditions || ''}
                        onChange={(e) => updateCustomField('outstandingConditions', e.target.value)}
                        placeholder="e.g. Awaiting final semester marksheet or tuition deposit deadline..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Configurable Document Checklist Status */}
                    <div className="space-y-2 pt-1">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Configurable Document Checklist Status</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: 'marksheets10and12', label: 'Class 10 & 12 Marksheets' },
                          { key: 'diplomaOrDegreeCertificate', label: 'Diploma / Degree Certificate' },
                          { key: 'academicTranscripts', label: 'Academic Transcripts' },
                          { key: 'governmentIdOrPassport', label: 'Govt ID / Passport' },
                          { key: 'statementOfPurpose', label: 'Statement of Purpose (SOP)' },
                          { key: 'recommendationLetters', label: 'Recommendation Letters' },
                          { key: 'englishProficiency', label: 'English Proficiency Results' },
                          { key: 'institutionSpecificDocs', label: 'Institution-Specific Docs' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                            <select
                              value={docChecklist[item.key] || 'Pending Review'}
                              onChange={(e) => updateDocStatus(item.key, e.target.value)}
                              className="text-[10px] font-bold px-1.5 py-1 rounded bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200"
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Verified">Verified</option>
                              <option value="Missing">Missing</option>
                              <option value="If Required">If Required</option>
                              <option value="Not Applicable">Not Applicable</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Actions in Dossier */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBooking.status || 'New Enquiry'}
                    onChange={(e) => {
                      handleStatusChange(selectedBooking.id, e.target.value);
                      setSelectedBooking({ ...selectedBooking, status: e.target.value });
                    }}
                    className="bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="New Enquiry">1. New Enquiry</option>
                    <option value="Consultation Scheduled">2. Consultation Scheduled</option>
                    <option value="Course Selection">3. Course Selection</option>
                    <option value="Documents Pending">4. Documents Pending</option>
                    <option value="Application in Preparation">5. Application in Preparation</option>
                    <option value="Application Submitted">6. Application Submitted</option>
                    <option value="Awaiting Institution Decision">7. Awaiting Institution Decision</option>
                    <option value="Offer Received">8. Offer Received</option>
                    <option value="Enrollment in Progress">9. Enrollment in Progress</option>
                    <option value="Closed">10. Closed</option>
                    <option value="Contacted">📞 Contacted</option>
                    <option value="In Progress">⏳ In Progress</option>
                    <option value="Consultation Completed">✅ Completed</option>
                    <option value="Qualified">🎓 Qualified</option>
                    <option value="Converted">🏆 Converted / Enrolled</option>
                    <option value="Closed / Lost">❌ Closed / Lost</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFollowUpLead(selectedBooking);
                      setDossierModalOpen(false);
                      setFollowUpModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                  >
                    Schedule Follow-Up
                  </button>
                  <button
                    onClick={() => setDossierModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MANUAL CONSULTATION BOOKING MODAL */}
        {newBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    Book Direct Consultation
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Manually schedule an in-person, video, or telephone consultation with an advisor.
                  </p>
                </div>
                <button
                  onClick={() => setNewBookingModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Client / Student Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={manualForm.name}
                      onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                      placeholder="e.g. Faisal Al-Sabah"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      placeholder="e.g. faisal@example.com"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualForm.countryCode}
                        onChange={(e) => setManualForm({ ...manualForm, countryCode: e.target.value })}
                        className="w-20 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white text-center"
                      />
                      <input
                        required
                        type="tel"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="50 123 4567"
                        className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Target Study Destination
                    </label>
                    <select
                      value={manualForm.countryInterest}
                      onChange={(e) => setManualForm({ ...manualForm, countryInterest: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="United States">🇺🇸 United States</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="Germany & Europe">🇩🇪 Germany & Europe</option>
                      <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                      <option value="All Global Destinations">🌍 All Global Destinations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Consultation Date *
                    </label>
                    <input
                      required
                      type="date"
                      value={manualForm.consultationDate}
                      onChange={(e) => setManualForm({ ...manualForm, consultationDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={manualForm.consultationTime}
                      onChange={(e) => setManualForm({ ...manualForm, consultationTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {timeSlots.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Consultation Mode *
                    </label>
                    <select
                      value={manualForm.consultationMode}
                      onChange={(e) => setManualForm({ ...manualForm, consultationMode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {consultationModes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Advisor / Counselor
                    </label>
                    <select
                      value={manualForm.assignedEmployee}
                      onChange={(e) => setManualForm({ ...manualForm, assignedEmployee: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      {counselors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Program Level
                    </label>
                    <select
                      value={manualForm.degreeLevel}
                      onChange={(e) => setManualForm({ ...manualForm, degreeLevel: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Undergraduate / Bachelor Degree">Undergraduate / Bachelor Degree</option>
                      <option value="Postgraduate / Master Degree">Postgraduate / Master Degree</option>
                      <option value="Doctorate / PhD Track">Doctorate / PhD Track</option>
                      <option value="Executive MBA">Executive MBA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Preliminary Diagnostic Details
                  </label>
                  <textarea
                    rows="3"
                    value={manualForm.message}
                    onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                    placeholder="Candidate academic background, target universities, or initial phone consultation summary..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setNewBookingModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="px-5 py-2 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {manualSubmitting ? 'Recording Booking...' : 'Confirm Consultation Booking'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* SCHEDULE FOLLOW-UP MODAL */}
        {followUpModalOpen && followUpLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-md w-full p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Schedule Consultation Follow-Up
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Client: <strong className="text-slate-900 dark:text-white">{followUpLead.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setFollowUpModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleFollowUp} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-Up Title
                  </label>
                  <input
                    required
                    type="text"
                    value={followUpForm.title}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Purpose / Notes
                  </label>
                  <input
                    required
                    type="text"
                    value={followUpForm.purpose}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, purpose: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Due Date & Time
                    </label>
                    <input
                      required
                      type="datetime-local"
                      value={followUpForm.dueDateTime}
                      onChange={(e) => setFollowUpForm({ ...followUpForm, dueDateTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={followUpForm.assignedTo}
                      onChange={(e) => setFollowUpForm({ ...followUpForm, assignedTo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2 font-bold text-slate-900 dark:text-white"
                    >
                      {counselors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setFollowUpModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow"
                  >
                    Schedule
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

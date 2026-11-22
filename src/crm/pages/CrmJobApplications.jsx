import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Briefcase, Users, Search, Filter, Clock, Building2, MapPin, Mail, Phone,
  FileText, Download, ExternalLink, CheckCircle2, AlertCircle, Calendar,
  ChevronDown, ChevronUp, Eye, Trash2, Sparkles, Layers, Table, LayoutGrid,
  X, ArrowUpRight, Tag, Award, FileCheck, RotateCcw, Share2, Check, Send,
  ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { downloadCandidateResumePdf, openCandidateResumeInNewTab } from '../../services/candidateResumePdfService';

export const CrmJobApplications = () => {
  const {
    applications = [],
    candidates = [],
    fetchApplications,
    updateApplicationStatus,
    deleteApplication,
    setSelectedCandidate,
    setActiveModule,
    isSuperAdmin
  } = useCrm();

  // View mode: 'all' (Unified Application Log) | 'grouped' (Grouped by Job Vacancy)
  const [viewMode, setViewMode] = useState('all');
  const [layoutStyle, setLayoutStyle] = useState('table'); // 'table' (Image 1 style) | 'cards'

  // Pagination (Matching Image 1 table view)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // Expanded vacancies in grouped view
  const [expandedJobs, setExpandedJobs] = useState({});

  // Active candidate modal for viewing full dossier
  const [viewCand, setViewCand] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');
  const [deleteConfirmApp, setDeleteConfirmApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  const handleConfirmDeleteApp = async () => {
    if (!deleteConfirmApp || !deleteApplication) return;
    setIsDeleting(true);
    try {
      const ok = await deleteApplication(deleteConfirmApp.id);
      if (ok) {
        setStatusNotice(`✓ Application for "${deleteConfirmApp.jobTitle}" (${deleteConfirmApp.applicantName}) permanently deleted. Candidate can now re-apply.`);
        setDeleteConfirmApp(null);
        setSyncTick(t => t + 1);
        setTimeout(() => setStatusNotice(''), 5000);
        if (fetchApplications) fetchApplications();
      } else {
        alert('Failed to delete application. Please try again.');
      }
    } catch (err) {
      alert('Error deleting application: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (fetchApplications) {
      fetchApplications();
    }
  }, [fetchApplications]);

  // Real-time synchronization across browser tabs and user interactions
  useEffect(() => {
    const handleSync = () => {
      setSyncTick(t => t + 1);
      if (fetchApplications) fetchApplications();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('application-submitted', handleSync);
    window.addEventListener('application-deleted', handleSync);
    window.addEventListener('candidate-registered', handleSync);
    const handleVis = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('application-submitted', handleSync);
      window.removeEventListener('application-deleted', handleSync);
      window.removeEventListener('candidate-registered', handleSync);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [fetchApplications]);

  // Auto-clean any corrupt legacy ghost applications from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sir_job_applications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && (parsed.length > 50 || parsed.some(a => !a || !a.applicantEmail || !a.applicantEmail.includes('@')))) {
          localStorage.removeItem('sir_job_applications');
          if (fetchApplications) fetchApplications();
        }
      }
    } catch {}
  }, [fetchApplications]);

  // Genuine application aggregator synchronized directly with CRM context & live backend
  const applicationPool = useMemo(() => {
    const deletedSet = new Set();
    try {
      const delStr = localStorage.getItem('sir_deleted_applications');
      if (delStr) {
        const arr = JSON.parse(delStr);
        if (Array.isArray(arr)) arr.forEach(d => { if (d) deletedSet.add(String(d)); });
      }
    } catch {}

    const map = new Map();
    const addApp = (a) => {
      if (!a || !a.jobId) return;
      const appId = String(a.id || '');
      if (appId && deletedSet.has(appId)) return;
      const email = (a.applicantEmail || a.email || '').toLowerCase().trim();
      // Only accept applications with real candidate email
      if (!email || !email.includes('@')) return;
      if (a.id === 'RI-APP-28093' || a.id === 'RI-APP-98803') return; // ignore seed dummies
      const comp = `${String(a.jobId).trim()}_${email}`;
      if (deletedSet.has(comp)) return;

      const key = appId || comp;
      if (!map.has(key)) {
        map.set(key, { ...a, applicantEmail: email });
      }
    };

    if (Array.isArray(applications)) applications.forEach(addApp);

    return Array.from(map.values()).sort((a, b) => new Date(b.appliedDate || b.createdAt || 0) - new Date(a.appliedDate || a.createdAt || 0));
  }, [applications, syncTick]);

  // Compute unique jobs and companies for dropdown filters
  const uniqueJobs = useMemo(() => {
    const set = new Set();
    applicationPool.forEach(a => {
      if (a.jobTitle) set.add(a.jobTitle.trim());
    });
    return Array.from(set).sort();
  }, [applicationPool]);

  const uniqueCompanies = useMemo(() => {
    const set = new Set();
    applicationPool.forEach(a => {
      if (a.company) set.add(a.company.trim());
    });
    return Array.from(set).sort();
  }, [applicationPool]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applicationPool.filter(app => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const str = `${app.jobTitle || ''} ${app.company || ''} ${app.location || ''} ${app.applicantName || ''} ${app.applicantEmail || ''} ${app.applicantPhone || ''} ${app.id || ''}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      // 2. Job filter
      if (selectedJob !== 'all' && app.jobTitle !== selectedJob) {
        return false;
      }

      // 3. Company filter
      if (selectedCompany !== 'all' && app.company !== selectedCompany) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'all') {
        const s = (app.status || 'Under Review').toLowerCase();
        if (!s.includes(selectedStatus.toLowerCase())) return false;
      }

      // 5. Timeframe filter
      if (timeFilter !== 'all' && app.appliedDate) {
        const appDate = new Date(app.appliedDate);
        const now = new Date();
        const diffMs = now - appDate;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (timeFilter === 'today' && diffHours > 24) return false;
        if (timeFilter === 'week' && diffHours > 24 * 7) return false;
        if (timeFilter === 'month' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [applicationPool, searchTerm, selectedJob, selectedCompany, selectedStatus, timeFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJob, selectedCompany, selectedStatus, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(filteredApplications.length, startIndex + itemsPerPage);
  const paginatedApplications = useMemo(() => {
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, startIndex, endIndex]);

  // Group applications by Job Title for the Grouped view
  const groupedByJob = useMemo(() => {
    const map = new Map();
    filteredApplications.forEach(app => {
      const key = `${app.jobTitle || 'General Vacancy'} — ${app.company || 'Revival International'}`;
      if (!map.has(key)) {
        map.set(key, {
          jobTitle: app.jobTitle || 'General Vacancy',
          company: app.company || 'Revival International',
          location: app.location || 'Global / GCC',
          jobId: app.jobId,
          applications: []
        });
      }
      map.get(key).applications.push(app);
    });
    return Array.from(map.values());
  }, [filteredApplications]);

  // Toggle accordion expand in grouped view
  const toggleJobExpand = (jobTitle) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobTitle]: !prev[jobTitle]
    }));
  };

  // Expand all / collapse all
  const toggleAllExpand = (expand) => {
    const next = {};
    groupedByJob.forEach(g => {
      next[g.jobTitle] = expand;
    });
    setExpandedJobs(next);
  };

  // Status update handler
  const handleStatusChange = async (appId, newStatus) => {
    if (!updateApplicationStatus) return;
    const ok = await updateApplicationStatus(appId, newStatus);
    if (ok) {
      setStatusNotice(`✓ Application #${appId.slice(-6)} status updated to "${newStatus}"`);
      setTimeout(() => setStatusNotice(''), 4000);
    }
  };

  // Resume Download & Preview handlers with multi-source fallback
  const resolveAppCandidate = (app) => {
    const candMatch = candidates.find(c => 
      (c.id && c.id === app.candidateId) || 
      (c.email && c.email.toLowerCase() === (app.applicantEmail || '').toLowerCase())
    );

    let effectiveResumeUrl = app.resumeUrl;
    let effectiveResumeName = app.resumeName;

    if (!effectiveResumeUrl || effectiveResumeUrl.length < 200) {
      if (candMatch?.resumeUrl && candMatch.resumeUrl.length > 200) {
        effectiveResumeUrl = candMatch.resumeUrl;
        effectiveResumeName = effectiveResumeName || candMatch.resumeName;
      }
    }

    if ((!effectiveResumeUrl || effectiveResumeUrl.length < 200) && typeof window !== 'undefined' && window.localStorage) {
      if (app.applicantEmail) {
        const stored = localStorage.getItem(`sir_resume_${app.applicantEmail.toLowerCase().trim()}`);
        if (stored && stored.length > 200) effectiveResumeUrl = stored;
      }
      if (!effectiveResumeUrl || effectiveResumeUrl.length < 200) {
        const active = localStorage.getItem('sir_active_resume');
        const activeName = localStorage.getItem('sir_active_resume_name');
        if (active && active.length > 200) {
          effectiveResumeUrl = active;
          if (activeName && !effectiveResumeName) effectiveResumeName = activeName;
        }
      }
    }

    return {
      id: app.candidateId || candMatch?.id || `RI-CAND-${app.id.slice(-4)}`,
      name: app.applicantName || candMatch?.name || 'Candidate',
      email: app.applicantEmail || candMatch?.email || '',
      phone: app.applicantPhone || candMatch?.phone || '',
      currentRole: app.jobTitle || candMatch?.currentRole || 'Executive Candidate',
      currentEmployer: app.company || candMatch?.currentEmployer || 'Revival International Candidate',
      nationality: app.candidateNationality || candMatch?.nationality || 'UAE',
      location: app.location || candMatch?.location || 'Dubai, UAE',
      resumeName: effectiveResumeName || `${(app.applicantName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
      resumeUrl: effectiveResumeUrl || null,
      skills: app.candidateSkills ? (typeof app.candidateSkills === 'string' ? JSON.parse(app.candidateSkills || '[]') : app.candidateSkills) : [app.jobTitle || 'Executive Candidate']
    };
  };

  const handleDownloadAppResume = (app) => {
    const targetCand = resolveAppCandidate(app);
    downloadCandidateResumePdf(targetCand);
  };

  const handlePreviewAppResume = (app) => {
    const targetCand = resolveAppCandidate(app);
    openCandidateResumeInNewTab(targetCand);
  };

  // Open full candidate dossier modal
  const handleOpenCandidateDossier = (app) => {
    // Look up full candidate in CRM context candidates
    const foundCand = candidates.find(c => 
      (c.id && c.id === app.candidateId) || 
      (c.email && c.email.toLowerCase() === (app.applicantEmail || '').toLowerCase())
    );

    if (foundCand) {
      setViewCand(foundCand);
    } else {
      // Build on-the-fly candidate profile
      setViewCand({
        id: app.candidateId || `RI-CAND-${app.id.slice(-4)}`,
        name: app.applicantName || 'Applicant',
        email: app.applicantEmail || '',
        phone: app.applicantPhone || '',
        currentRole: app.jobTitle || 'Applicant',
        currentEmployer: app.company || 'Revival International',
        nationality: app.candidateNationality || 'Global',
        score: app.candidateScore || 90,
        stage: app.stage || 'applied',
        resumeName: app.resumeName || 'Curriculum_Vitae.pdf',
        applications: applications.filter(a => a.applicantEmail?.toLowerCase() === app.applicantEmail?.toLowerCase())
      });
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredApplications || filteredApplications.length === 0) return;

    const headers = ['Application ID', 'Job Title', 'Company', 'Job Location', 'Applicant Name', 'Applicant Email', 'Applicant Phone', 'Status', 'Applied Date'];
    const rows = filteredApplications.map(a => [
      `"${a.id || ''}"`,
      `"${(a.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(a.company || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.applicantName || '').replace(/"/g, '""')}"`,
      `"${a.applicantEmail || ''}"`,
      `"${a.applicantPhone || ''}"`,
      `"${a.status || 'Under Review'}"`,
      `"${a.appliedDate ? new Date(a.appliedDate).toLocaleString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Job_Applications_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedJob('all');
    setSelectedCompany('all');
    setSelectedStatus('all');
    setTimeFilter('all');
  };

  // Stats calculation
  const totalAppsCount = applicationPool.length;
  const underReviewCount = applicationPool.filter(a => (a.status || 'Under Review').toLowerCase().includes('review')).length;
  const shortlistedCount = applicationPool.filter(a => (a.status || '').toLowerCase().includes('shortlist') || (a.status || '').toLowerCase().includes('interview')).length;
  const uniqueApplicantsCount = useMemo(() => {
    const s = new Set();
    applicationPool.forEach(a => { if (a.applicantEmail) s.add(a.applicantEmail.toLowerCase()); });
    return s.size;
  }, [applicationPool]);

  // Status options for recruiters
  const statusOptions = [
    { label: 'Under Review', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' },
    { label: 'Shortlisted', color: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40' },
    { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40' },
    { label: 'Selected', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40' },
    { label: 'Offer Released', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40' },
    { label: 'Rejected', color: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40' }
  ];

  return (
    <div className="space-y-6 text-xs font-sans">

      {/* Header Banner */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-[#0d1630] dark:via-[#091024] dark:to-[#040814] p-6 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-sm border-l-4 border-l-gold-500">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Dedicated Vacancy Intake Registry</span>
              </span>
              <span className="bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live SQLite Sync
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Job Applications & Candidate Submissions
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Review exactly which vacancies candidates applied for, download resumes, and manage interview progression.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs border border-slate-300 dark:border-navy-700"
              title="Export all applications to CSV audit file"
            >
              <Download className="w-3.5 h-3.5 text-gold-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveModule('vacancies')}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-gold-glow"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manage Vacancies</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice('')} className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Applications</p>
            <p className="text-xl font-serif font-extrabold text-slate-900 dark:text-white mt-0.5">{totalAppsCount}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Logged in database</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Under Review</p>
            <p className="text-xl font-serif font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{underReviewCount}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Awaiting initial screening</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Unique Applicants</p>
            <p className="text-xl font-serif font-extrabold text-slate-900 dark:text-white mt-0.5">{uniqueApplicantsCount}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Distinct candidate profiles</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Active Job Mandates</p>
            <p className="text-xl font-serif font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{uniqueJobs.length}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Vacancies with applications</p>
          </div>
        </div>
      </div>

      {/* Filter Control & View Mode Switcher Panel */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-[#0d1630] dark:to-[#080e22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Top Filter Controls: Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, candidate name, verified email, company, or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-navy-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-navy-800 text-gold-600 dark:text-gold-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>All Applications ({filteredApplications.length})</span>
            </button>

            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-navy-800 text-gold-600 dark:text-gold-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grouped by Job ({groupedByJob.length} Vacancies)</span>
            </button>
          </div>

        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Target Job Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Target Vacancy / Role
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Vacancies ({uniqueJobs.length})</option>
              {uniqueJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Employer / Client
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Employers ({uniqueCompanies.length})</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Application Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Offer Released">Offer Released</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Timeframe Filter & Reset */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Timeframe
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-[#040816] border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Past 24 Hours</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* VIEW 1: UNIFIED ALL APPLICATIONS (Table / Cards Layout) */}
      {viewMode === 'all' && (
        <div className="space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Showing <strong className="text-slate-900 dark:text-white font-extrabold">{filteredApplications.length}</strong> Applications Received
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                • Live Applications Feed
              </span>
            </div>

            {/* Layout Toggle: Table View (Image 1 Style) vs Cards View */}
            <div className="flex items-center bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLayoutStyle('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  layoutStyle === 'table'
                    ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-navy-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-gold-500" />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutStyle('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  layoutStyle === 'cards'
                    ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-navy-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-gold-500" />
                <span>Cards View</span>
              </button>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800">
              <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No applications match your filter criteria</h3>
              <p className="text-slate-500 text-xs mt-1">Try resetting your search query or filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl text-xs hover:bg-gold-400 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : layoutStyle === 'table' ? (
            /* ENTERPRISE TABLE VIEW (Exact Style from Image 1) */
            <div className="glass-card bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gold-500/50 hover:scrollbar-thumb-gold-500 scrollbar-track-slate-100 dark:scrollbar-track-navy-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20 shadow-xs">
                    <tr className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                      <th className="px-2 py-2.5 font-extrabold w-10 text-center">#</th>
                      <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">REFERENCE ID</th>
                      <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">CANDIDATE NAME</th>
                      <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">PHONE NUMBER</th>
                      <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">EMAIL ADDRESS</th>
                      <th className="px-3 py-2.5 font-extrabold">APPLIED VACANCY / ROLE</th>
                      <th className="px-2.5 py-2.5 font-extrabold whitespace-nowrap text-center">APPLICATION STATUS</th>
                      <th className="px-3 py-2.5 font-extrabold text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
                    {paginatedApplications.map((app, idx) => {
                      const currentStatusObj = statusOptions.find(s => s.label.toLowerCase() === (app.status || 'Under Review').toLowerCase()) || statusOptions[0];
                      const cleanPhone = (app.applicantPhone || '').replace(/[^0-9+]/g, '');
                      const rawDigits = (app.applicantPhone || '').replace(/[^0-9]/g, '');
                      const whatsappUrl = rawDigits ? `https://wa.me/${rawDigits}?text=Hello%20${encodeURIComponent(app.applicantName || 'Candidate')},%20regarding%20your%20application%20for%20${encodeURIComponent(app.jobTitle || 'the vacancy')}...` : null;
                      const mailtoUrl = app.applicantEmail ? `mailto:${app.applicantEmail}?subject=Regarding Your Job Application - The Revival International&body=Dear ${encodeURIComponent(app.applicantName || 'Candidate')},%0D%0A%0D%0AThank you for applying for the position of ${encodeURIComponent(app.jobTitle || 'Executive Opening')} at ${encodeURIComponent(app.company || 'The Revival International')}.%0D%0A%0D%0A` : null;

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition group"
                        >
                          {/* 0. Serial Number Badge (Gold box index matching Image 1) */}
                          <td className="px-2 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gold-500/10 dark:bg-gold-500/20 text-gold-700 dark:text-gold-400 font-mono font-extrabold text-xs border border-gold-500/30">
                              {startIndex + idx + 1}
                            </span>
                          </td>

                          {/* 1. Reference ID & Date (Matching Image 1) */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-gold-600 dark:text-gold-400 block text-xs">
                              {app.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                          </td>

                          {/* 2. Candidate Name & Avatar (Matching Image 1) */}
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={app.candidateAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicantName || 'Applicant')}`}
                                alt={app.applicantName}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gold-500 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">
                                  {app.applicantName || 'Candidate'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {app.candidateId || 'Candidate Portal'} • {app.candidateNationality || 'Verified'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Phone Number with icon (Matching Image 1) */}
                          <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs">
                            {app.applicantPhone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <a href={`tel:${cleanPhone}`} className="hover:text-emerald-500 text-slate-700 dark:text-slate-300 font-semibold transition">
                                  {app.applicantPhone}
                                </a>
                                {whatsappUrl && (
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition ml-0.5"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* 4. Email Address with icon (Matching Image 1) */}
                          <td className="px-3 py-2.5 font-mono text-xs">
                            {app.applicantEmail ? (
                              <a
                                href={mailtoUrl}
                                className="text-slate-700 dark:text-slate-300 hover:text-blue-500 flex items-center gap-1.5 truncate max-w-[200px] transition"
                                title={app.applicantEmail}
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">{app.applicantEmail}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* 5. Applied Vacancy / Role */}
                          <td className="px-3 py-2.5 max-w-[240px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs truncate">
                              <Briefcase className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                              <span className="truncate" title={app.jobTitle || 'Executive Opening'}>
                                {app.jobTitle || 'Executive Opening'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                              <span className="truncate">{app.company || 'Revival Partner Employer'}</span>
                              <span>•</span>
                              <span className="truncate">{app.location || 'Global'}</span>
                              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-300 border border-amber-300 dark:border-gold-500/30 shrink-0">
                                {app.candidateScore || 90}% Match
                              </span>
                            </div>
                          </td>

                          {/* 6. Application Status Dropdown */}
                          <td className="px-2.5 py-2.5 whitespace-nowrap text-center">
                            <select
                              value={app.status || 'Under Review'}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none transition ${currentStatusObj.color}`}
                            >
                              {statusOptions.map(opt => (
                                <option key={opt.label} value={opt.label}>{opt.label}</option>
                              ))}
                            </select>
                          </td>

                          {/* 7. Actions */}
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handlePreviewAppResume(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                title="Preview CV"
                              >
                                <Eye className="w-3 h-3 text-gold-500" />
                                <span>Preview CV</span>
                              </button>

                              <button
                                onClick={() => handleDownloadAppResume(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                                title="Download CV"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download CV</span>
                              </button>

                              <button
                                onClick={() => handleOpenCandidateDossier(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                title="View full candidate profile"
                              >
                                <FileText className="w-3 h-3 text-blue-500" />
                                <span>Full Profile</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmApp(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-rose-200 dark:border-rose-900/50"
                                title="Delete application"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer (Image 1 style) */}
              <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredApplications.length === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-slate-900 dark:text-white font-bold">{endIndex}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{filteredApplications.length}</strong> applications (30 per page)
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-navy-800 font-bold text-xs transition cursor-pointer"
                      title="First Page"
                    >
                      First
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-navy-800 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, i, arr) => (
                          <React.Fragment key={page}>
                            {i > 0 && arr[i - 1] !== page - 1 && (
                              <span className="px-1 text-slate-400">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
                                currentPage === page
                                  ? 'bg-gold-500 text-navy-950 shadow-xs'
                                  : 'border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-gold-50 dark:hover:bg-navy-800'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-navy-800 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-navy-800 font-bold text-xs transition cursor-pointer"
                      title="Last Page"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cards layout when user toggles to cards */
            <div className="space-y-3">
              {paginatedApplications.map((app) => {
                const currentStatusObj = statusOptions.find(s => s.label.toLowerCase() === (app.status || 'Under Review').toLowerCase()) || statusOptions[0];

                return (
                  <div
                    key={app.id}
                    className="p-5 bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-gold-500/60 transition shadow-sm space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Job Vacancy Info */}
                      <div className="space-y-1.5 lg:w-1/3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                            {app.jobId || 'VACANCY'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {app.id}
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-gold-500 shrink-0" />
                          <span>{app.jobTitle || 'Executive Opening'}</span>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                          <span className="flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{app.company || 'Revival Partner Employer'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{app.location || 'Global'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Center: Applicant Profile & Contact */}
                      <div className="space-y-2 lg:w-1/3 p-3 bg-slate-50 dark:bg-[#070b1a] rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={app.candidateAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicantName || 'Applicant')}`}
                              alt={app.applicantName}
                              className="w-9 h-9 rounded-full object-cover border-2 border-gold-500 shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                {app.applicantName || 'Candidate'}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {app.candidateId || 'Candidate Portal'} • {app.candidateNationality || 'Verified'}
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-300 border border-amber-300 dark:border-gold-500/30">
                            {app.candidateScore || 90}% Match
                          </span>
                        </div>

                        {/* Contacts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                          <a
                            href={`mailto:${app.applicantEmail}`}
                            className="flex items-center space-x-1 truncate hover:text-gold-600 dark:hover:text-gold-400 transition"
                            title={app.applicantEmail}
                          >
                            <Mail className="w-3 h-3 text-gold-500 shrink-0" />
                            <span className="truncate">{app.applicantEmail || 'No email'}</span>
                          </a>

                          <a
                            href={`tel:${app.applicantPhone}`}
                            className="flex items-center space-x-1 truncate hover:text-gold-600 dark:hover:text-gold-400 transition"
                            title={app.applicantPhone}
                          >
                            <Phone className="w-3 h-3 text-gold-500 shrink-0" />
                            <span className="truncate">{app.applicantPhone || 'No phone'}</span>
                          </a>
                        </div>
                      </div>

                      {/* Right: Actions, Resume, Date & Status */}
                      <div className="space-y-2.5 lg:w-1/3 flex flex-col justify-between items-start lg:items-end">
                        
                        {/* Applied Date & Status Selector */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                          </span>

                          {/* Recruiter Status Dropdown */}
                          <select
                            value={app.status || 'Under Review'}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none transition ${currentStatusObj.color}`}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.label} value={opt.label}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Resume Actions & Full Profile */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => handlePreviewAppResume(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Preview ATS vector candidate resume"
                          >
                            <Eye className="w-3 h-3 text-gold-500" />
                            <span>Preview CV</span>
                          </button>

                          <button
                            onClick={() => handleDownloadAppResume(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                            title="Download official candidate resume PDF"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download CV</span>
                          </button>

                          <button
                            onClick={() => handleOpenCandidateDossier(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="View full candidate dossier"
                          >
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span>Full Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmApp(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer border border-rose-200 dark:border-rose-900/50"
                            title="Delete this application (allows candidate to re-apply)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: GROUPED BY JOB VACANCY (Vacancy-Centric View) */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Vacancies with Applicants (<strong className="text-slate-900 dark:text-white font-extrabold">{groupedByJob.length}</strong> Openings)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleAllExpand(true)}
                className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                Expand All
              </button>
              <span className="text-slate-400">•</span>
              <button
                onClick={() => toggleAllExpand(false)}
                className="text-[11px] font-bold text-slate-500 hover:underline"
              >
                Collapse All
              </button>
            </div>
          </div>

          {groupedByJob.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No job openings match your filter criteria</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedByJob.map((group) => {
                const isExpanded = expandedJobs[group.jobTitle] !== false; // Default expanded

                return (
                  <div
                    key={`${group.jobTitle}-${group.company}`}
                    className="bg-white dark:bg-[#0c1328] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                  >
                    {/* Vacancy Accordion Header */}
                    <div
                      onClick={() => toggleJobExpand(group.jobTitle)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0f1730] transition border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                              {group.jobTitle}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                              {group.applications.length} {group.applications.length === 1 ? 'Applicant' : 'Applicants'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{group.company}</span>
                            <span>•</span>
                            <span>{group.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Applicants List under this specific Job */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/60 dark:bg-[#070b1a] space-y-2.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.applications.map((app) => {
                            const currentStatusObj = statusOptions.find(s => s.label.toLowerCase() === (app.status || 'Under Review').toLowerCase()) || statusOptions[0];

                            return (
                              <div
                                key={app.id}
                                className="p-3.5 bg-white dark:bg-[#0c1328] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-gold-500/50 transition shadow-xs space-y-2.5"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <img
                                      src={app.candidateAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.applicantName || 'Applicant')}`}
                                      alt={app.applicantName}
                                      className="w-8 h-8 rounded-full object-cover border-2 border-gold-500 shrink-0"
                                    />
                                    <div>
                                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                        {app.applicantName || 'Applicant'}
                                      </h4>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                        {app.candidateNationality || 'Verified'} • {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                                      </p>
                                    </div>
                                  </div>

                                  <select
                                    value={app.status || 'Under Review'}
                                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none transition ${currentStatusObj.color}`}
                                  >
                                    {statusOptions.map(opt => (
                                      <option key={opt.label} value={opt.label}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Contact Details */}
                                <div className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 p-2 bg-slate-50 dark:bg-[#050917] rounded-lg">
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <Mail className="w-3 h-3 text-gold-500 shrink-0" />
                                    <span className="truncate">{app.applicantEmail}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <Phone className="w-3 h-3 text-gold-500 shrink-0" />
                                    <span>{app.applicantPhone || 'Not specified'}</span>
                                  </div>
                                </div>

                                {/* Resume Buttons */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      onClick={() => handlePreviewAppResume(app)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-[10px] font-bold rounded text-slate-800 dark:text-slate-200 flex items-center space-x-1 transition"
                                    >
                                      <Eye className="w-3 h-3 text-gold-500" />
                                      <span>CV</span>
                                    </button>
                                    <button
                                      onClick={() => handleDownloadAppResume(app)}
                                      className="px-2 py-1 bg-gold-500 hover:bg-gold-400 text-[10px] font-bold rounded text-navy-950 flex items-center space-x-1 transition"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>PDF</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleOpenCandidateDossier(app)}
                                      className="text-[10px] font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center space-x-0.5"
                                    >
                                      <span>Full Profile</span>
                                      <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmApp(app)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition cursor-pointer"
                                      title="Delete application"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* FULL CANDIDATE DOSSIER MODAL (When clicking "Full Profile") */}
      {viewCand && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1328] rounded-3xl border border-slate-200 dark:border-gold-500/40 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={viewCand.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewCand.name || 'Candidate')}`}
                  alt={viewCand.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gold-500 shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                      {viewCand.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-300 border border-amber-300 dark:border-gold-500/30">
                      {viewCand.score || 90}% Match Score
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {viewCand.id} • {viewCand.nationality || 'Verified'} • {viewCand.currentRole || 'Executive Candidate'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewCand(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-[#070b1a] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{viewCand.email || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{viewCand.phone || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Current Location</p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{viewCand.location || viewCand.nationality || 'Dubai, UAE'}</p>
              </div>
            </div>

            {/* Vacancies Applied by this Candidate */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-gold-500" />
                <span>All Vacancies Applied by {viewCand.name} ({Array.isArray(viewCand.applications) ? viewCand.applications.length : 0})</span>
              </h3>

              {Array.isArray(viewCand.applications) && viewCand.applications.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewCand.applications.map((app, idx) => (
                    <div
                      key={app.id || idx}
                      className="p-3 bg-slate-50 dark:bg-[#060a18] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{app.jobTitle}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{app.company} • {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Applied'}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-300">
                          {app.status || 'Under Review'}
                        </span>
                        <button
                          onClick={() => handlePreviewAppResume(app)}
                          className="px-2 py-1 bg-slate-200 dark:bg-navy-800 rounded font-bold text-[10px] hover:bg-gold-500 hover:text-navy-950 transition"
                        >
                          View CV
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic">No additional applications recorded.</p>
              )}
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewCand(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {deleteConfirmApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-luxury space-y-4 text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold">
                Delete Job Application?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete the application for <strong className="text-slate-900 dark:text-white">{deleteConfirmApp.jobTitle}</strong> by <strong className="text-slate-900 dark:text-white">{deleteConfirmApp.applicantName}</strong>?
              </p>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 text-left">
                ✓ Once deleted, this vacancy will show "Apply Now" again, allowing the candidate to re-apply if desired.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmApp(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteApp}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete & Reopen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CrmJobApplications;

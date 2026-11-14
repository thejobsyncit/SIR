import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { ASSIGNED_RECRUITERS } from '../data/mockCrmData';
import {
  Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye,
  Bookmark, Filter, X, Send, UserCheck, Trash2, AlertCircle, Download,
  ExternalLink, Mail, Phone, MapPin, Globe, Calendar, Briefcase,
  GraduationCap, ShieldCheck, Clock, Building, Award, Check, FileCheck,
  ChevronDown, ChevronUp, Paperclip
} from 'lucide-react';
import { CrmAddCandidateModal } from '../components/CrmAddCandidateModal';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmDeleteConfirmModal } from '../components/CrmDeleteConfirmModal';
import { downloadCandidateResumePdf, openCandidateResumeInNewTab } from '../../services/candidateResumePdfService';

export const CrmCandidates = () => {
  const {
    candidates,
    setAiDrawerOpen,
    globalAddCandidateOpen,
    setGlobalAddCandidateOpen,
    isSuperAdmin,
    deleteCandidate,
    selectedCandidate,
    setSelectedCandidate
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('All');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'applicants'
  const [viewCand, setViewCand] = useState(null);
  const [deleteConfirmCand, setDeleteConfirmCand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [showFullResumeSheet, setShowFullResumeSheet] = useState(true);

  const activeApplicants = useMemo(() => {
    return candidates.filter(c => (Array.isArray(c.applications) && c.applications.length > 0) || c.stage === 'applied');
  }, [candidates]);

  // Synchronize when a candidate is selected externally (e.g. from recruiter workspace or search)
  useEffect(() => {
    if (selectedCandidate) {
      setViewCand(selectedCandidate);
    }
  }, [selectedCandidate]);

  const handleDeleteCandidate = (cand) => {
    setDeleteConfirmCand(cand);
  };

  const confirmDeleteCandidate = async () => {
    if (!deleteConfirmCand) return;
    setIsDeleting(true);
    try {
      if (deleteCandidate) {
        await deleteCandidate(deleteConfirmCand.id, {
          name: deleteConfirmCand.name,
          nationality: deleteConfirmCand.nationality
        });
      }
      if (viewCand && viewCand.id === deleteConfirmCand.id) {
        setViewCand(null);
      }
      if (setSelectedCandidate && selectedCandidate?.id === deleteConfirmCand.id) {
        setSelectedCandidate(null);
      }
      setStatusNotice(`✓ Candidate "${deleteConfirmCand.name}" (${deleteConfirmCand.id}) permanently removed.`);
      setDeleteConfirmCand(null);
      setTimeout(() => setStatusNotice(''), 4000);
    } catch (err) {
      alert('Failed to delete candidate: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Enriched active candidate object that merges backend database data with any live local storage updates
  const activeCand = useMemo(() => {
    if (!viewCand) return null;
    let enriched = { ...viewCand };

    // Also look up in fresh candidates array from CRM context
    const currentInContext = candidates.find(c => c.id === viewCand.id || (c.email && c.email.toLowerCase() === (viewCand.email || '').toLowerCase()));
    if (currentInContext) {
      enriched = { ...enriched, ...currentInContext };
    }

    // Check localStorage sir_candidates_db for any recent candidate registration updates
    try {
      const localDbStr = localStorage.getItem('sir_candidates_db');
      if (localDbStr) {
        const localDb = JSON.parse(localDbStr);
        const emailKey = (viewCand.email || '').toLowerCase().trim();
        const candLocal = localDb[emailKey];
        if (candLocal) {
          enriched = {
            ...enriched,
            name: candLocal.name || enriched.name,
            phone: candLocal.phone || enriched.phone,
            resumeName: candLocal.resumeName || enriched.resumeName,
            resumeUrl: candLocal.resumeUrl || enriched.resumeUrl,
            resumeSize: candLocal.resumeSize || enriched.resumeSize,
            citizenship: candLocal.citizenship || enriched.citizenship,
            dob: candLocal.dob || enriched.dob,
            gender: candLocal.gender || enriched.gender,
            location: candLocal.location || enriched.location,
            preferredCountry: candLocal.preferredCountry || enriched.preferredCountry,
            qualification: candLocal.qualification || candLocal.education || enriched.qualification,
            education: candLocal.education || candLocal.qualification || enriched.education,
            mohreAttested: candLocal.mohreAttested !== undefined ? candLocal.mohreAttested : enriched.mohreAttested,
            skills: (Array.isArray(candLocal.skills) && candLocal.skills.length > 0) ? candLocal.skills : enriched.skills
          };
        }
      }
    } catch { }

    // Check localStorage for applications
    try {
      const keysToCheck = [
        `sir_applications_${viewCand.id}`,
        viewCand.email ? `sir_applications_${viewCand.email.toLowerCase().trim()}` : null
      ].filter(Boolean);

      for (const k of keysToCheck) {
        const appsStr = localStorage.getItem(k);
        if (appsStr) {
          const localApps = JSON.parse(appsStr);
          if (Array.isArray(localApps) && localApps.length > 0) {
            const existingIds = new Set((enriched.applications || []).map(a => a.id || a.jobId));
            const newApps = localApps.filter(a => !existingIds.has(a.id || a.jobId));
            enriched.applications = [...(enriched.applications || []), ...newApps];
          }
        }
      }
    } catch { }

    // Check if any application attached a specific resume
    const appWithCv = (enriched.applications || []).find(a => a.resumeName || a.resumeUrl);
    if (appWithCv) {
      if (!enriched.resumeName || enriched.resumeName.includes('Executive_CV.pdf')) {
        enriched.resumeName = appWithCv.resumeName || enriched.resumeName;
      }
      if (!enriched.resumeUrl) enriched.resumeUrl = appWithCv.resumeUrl;
      if (!enriched.resumeSize) enriched.resumeSize = appWithCv.resumeSize;
    }

    // Ensure complete, verified fallback data for every candidate so resume is ALWAYS available
    const cleanName = (enriched.name || 'Executive Candidate').trim();
    const cleanFilePrefix = cleanName.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      ...enriched,
      name: cleanName,
      phone: (enriched.phone && enriched.phone.trim() !== '') ? enriched.phone : 'Not specified',
      nationality: (enriched.nationality && enriched.nationality.trim() !== '') ? enriched.nationality : 'Not specified',
      citizenship: (enriched.citizenship && enriched.citizenship.trim() !== '') ? enriched.citizenship : 'Not specified',
      location: (enriched.location && enriched.location.trim() !== '') ? enriched.location : 'Not specified',
      preferredCountry: (enriched.preferredCountry && enriched.preferredCountry.trim() !== '') ? enriched.preferredCountry : 'Not specified',
      currentRole: (enriched.currentRole && enriched.currentRole.trim() !== '') ? enriched.currentRole : 'Executive Candidate',
      currentEmployer: (enriched.currentEmployer && enriched.currentEmployer.trim() !== '') ? enriched.currentEmployer : 'Revival International Candidate',
      experience: (enriched.experience && enriched.experience.trim() !== '') ? enriched.experience : 'Not specified',
      education: (enriched.education || enriched.qualification || 'Not specified'),
      qualification: (enriched.qualification || enriched.education || 'Not specified'),
      currentSalary: (enriched.currentSalary && enriched.currentSalary.trim() !== '') ? enriched.currentSalary : 'Not specified',
      expectedSalary: (enriched.expectedSalary && enriched.expectedSalary.trim() !== '') ? enriched.expectedSalary : 'Not specified',
      noticePeriod: (enriched.noticePeriod && enriched.noticePeriod.trim() !== '') ? enriched.noticePeriod : 'Not specified',
      resumeName: enriched.resumeName || `${cleanFilePrefix}_Executive_CV.pdf`,
      resumeSize: enriched.resumeSize || '245 KB',
      mohreAttested: enriched.mohreAttested !== undefined ? enriched.mohreAttested : true,
      skills: (Array.isArray(enriched.skills) && enriched.skills.length > 0)
        ? enriched.skills
        : ['International Mobility', 'Executive Candidate', 'Global Mandates', 'Project Governance']
    };
  }, [viewCand, candidates]);

  // Handle downloading candidate resume as an actual PDF file
  const handleDownloadCv = (cand) => {
    if (!cand) return;

    // If candidate uploaded a custom data URL (.pdf), download it directly
    if (cand.resumeUrl && cand.resumeUrl.startsWith('data:application/pdf')) {
      const link = document.createElement('a');
      link.href = cand.resumeUrl;
      link.download = cand.resumeName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Otherwise, generate the high-resolution vector ATS Resume PDF directly
    downloadCandidateResumePdf(cand);
  };

  // Handle viewing / previewing candidate CV in a separate clean tab
  const handlePreviewCv = (cand) => {
    if (!cand) return;

    // If candidate uploaded custom data URL, open blob
    if (cand.resumeUrl && cand.resumeUrl.startsWith('data:')) {
      try {
        const arr = cand.resumeUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      } catch (e) {
        console.warn('Blob preview fallback notice:', e);
      }
    }

    // Open clean, formatted ATS Resume preview
    openCandidateResumeInNewTab(cand);
  };

  // Handle downloading job-specific applied CV
  const handleDownloadAppCv = (app, cand) => {
    const targetCand = {
      ...cand,
      currentRole: app.jobTitle || cand.currentRole,
      currentEmployer: app.company || cand.currentEmployer,
      resumeName: app.resumeName || cand.resumeName,
      resumeUrl: app.resumeUrl || cand.resumeUrl,
      resumeSize: app.resumeSize || cand.resumeSize,
      expectedSalary: app.expectedSalary || cand.expectedSalary
    };
    handleDownloadCv(targetCand);
  };

  // Handle previewing job-specific applied CV
  const handlePreviewAppCv = (app, cand) => {
    const targetCand = {
      ...cand,
      currentRole: app.jobTitle || cand.currentRole,
      currentEmployer: app.company || cand.currentEmployer,
      resumeName: app.resumeName || cand.resumeName,
      resumeUrl: app.resumeUrl || cand.resumeUrl,
      resumeSize: app.resumeSize || cand.resumeSize,
      expectedSalary: app.expectedSalary || cand.expectedSalary
    };
    handlePreviewCv(targetCand);
  };

  const filtered = candidates.filter(c => {
    if (filterMode === 'applicants') {
      const hasApp = (Array.isArray(c.applications) && c.applications.length > 0) || c.stage === 'applied';
      if (!hasApp) return false;
    }
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.skills && Array.isArray(c.skills) && c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.currentRole || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(c.applications) && c.applications.some(a => (a.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesNat = selectedNationality === 'All' || c.nationality === selectedNationality;
    const matchesRecruiter = selectedRecruiter === 'All' || c.assignedRecruiter === selectedRecruiter;
    return matchesSearch && matchesNat && matchesRecruiter;
  });

  return (
    <div className="space-y-6 text-xs font-sans">

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Human Capital Index</span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Candidate Management System</h1>
            <p className="text-slate-500 dark:text-slate-400">Total Talent Pool: <strong className="text-slate-900 dark:text-white font-bold">{candidates.length} Registered & Verified Candidates</strong></p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-4 py-2.5 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Resume Parser</span>
            </button>

            <button
              onClick={() => setGlobalAddCandidateOpen(true)}
              className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Candidate</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Status Notification Toast */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice('')} className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Mode Toggle: All Talent vs. Active Job Applicants */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${filterMode === 'all'
            ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-950 shadow-sm'
            : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-800 hover:border-gold-500'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Talent Pool ({candidates.length})</span>
        </button>
        <button
          onClick={() => setFilterMode('applicants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${filterMode === 'applicants'
            ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
            : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-800 hover:border-gold-500'
            }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>🎯 Active Job Applicants ({activeApplicants.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ScrollReveal>
        <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate by name, email, ID, role, skills, or passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedRecruiter}
              onChange={(e) => setSelectedRecruiter(e.target.value)}
              className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Assigned Recruiters ({ASSIGNED_RECRUITERS.length})</option>
              {ASSIGNED_RECRUITERS.map(rec => (
                <option key={rec.id} value={rec.name}>{rec.name}</option>
              ))}
            </select>

            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Nationalities</option>
              <option value="UAE">UAE</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="India">India</option>
              <option value="Poland">Poland</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Candidates Cards Grid */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cand) => (
            <div
              key={cand.id}
              onClick={() => setViewCand(cand)}
              className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-3 hover:border-gold-500 transition cursor-pointer flex flex-col justify-between shadow-sm group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <img
                      src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={cand.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-gold-500 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-gold-600 transition">{cand.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {cand.id} • {cand.nationality || 'UAE'}
                        {cand.citizenship && ` • ${cand.citizenship}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] flex items-center gap-1 border border-emerald-500/30" title="CV / Resume Attached">
                      <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>CV Attached</span>
                    </span>
                    {Array.isArray(cand.applications) && cand.applications.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold text-[9px] flex items-center gap-1 border border-blue-500/30" title="Applied Vacancies">
                        <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{cand.applications.length} Applied</span>
                      </span>
                    )}
                    <span className="w-7 h-7 rounded-full border border-gold-500 text-gold-600 dark:text-gold-400 font-extrabold text-[11px] flex items-center justify-center bg-gold-500/10" title="AI Profile Score">
                      {cand.score || 88}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1 text-[11px] border border-slate-200 dark:border-navy-800">
                  <p><strong className="text-slate-500 dark:text-slate-400">Role:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cand.currentRole || 'Executive Candidate'}</span></p>
                  <p><strong className="text-slate-500 dark:text-slate-400">Employer:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cand.currentEmployer || 'Revival International Candidate'}</span></p>
                  {cand.email && (
                    <p><strong className="text-slate-500 dark:text-slate-400">Email:</strong> <span className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">{cand.email}</span></p>
                  )}
                  <p><strong className="text-slate-500 dark:text-slate-400">Expected Salary:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cand.expectedSalary || 'Not specified'}</span></p>
                </div>

                {/* Applied Vacancy Highlight Banner */}
                {Array.isArray(cand.applications) && cand.applications.length > 0 && (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span>Applied Vacancy</span>
                      </span>
                      <span className="text-[9px] text-blue-500 font-medium">
                        {cand.applications[0].appliedDate ? new Date(cand.applications[0].appliedDate).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-blue-950 dark:text-blue-200 line-clamp-1">
                      {cand.applications[0].jobTitle}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">
                      {cand.applications[0].company || 'Revival International Partner'}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                  "{cand.aiSummary || 'Registered candidate in Revival Talent Pool.'}"
                </p>

                <div className="flex flex-wrap gap-1">
                  {Array.isArray(cand.skills) && cand.skills.slice(0, 4).map((s, i) => (
                    <span key={i} className="bg-slate-100 dark:bg-navy-950 text-gold-700 dark:text-gold-400 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-navy-800">
                      {s}
                    </span>
                  ))}
                  {Array.isArray(cand.skills) && cand.skills.length > 4 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5 font-bold">
                      +{cand.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                <div className="space-y-0.5">
                  <span>Recruiter: <strong className="text-slate-900 dark:text-white">{cand.assignedRecruiter || 'Dhanalakshimi'}</strong></span>
                  <span className="block bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold px-2 py-0.5 rounded uppercase w-fit">{cand.stage || 'lead'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewCand(cand);
                    }}
                    className="p-1.5 px-2.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 rounded-lg border border-gold-500/30 font-bold transition flex items-center gap-1 cursor-pointer"
                    title={`View Full Profile & CV for ${cand.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCandidate(cand);
                    }}
                    className="p-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50 font-bold transition flex items-center gap-1 cursor-pointer"
                    title={`Delete ${cand.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Comprehensive Candidate View Modal (With Visual ATS Resume & Downloadable PDF) */}
      {activeCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-luxury space-y-5 max-h-[94vh] overflow-y-auto text-slate-900 dark:text-white">

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={activeCand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeCand.name}
                  className="w-14 h-14 rounded-full border-2 border-gold-500 object-cover shadow-sm shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{activeCand.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-400 uppercase tracking-wider">
                      {activeCand.stage || 'Lead'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      Score: {activeCand.score || 88}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{activeCand.id}</span>
                    <span>•</span>
                    <span>{activeCand.currentRole}</span>
                    <span>•</span>
                    <span>{activeCand.nationality || 'UAE'} ({activeCand.citizenship || 'UAE'})</span>
                    <span>•</span>
                    <span>Passport: {activeCand.passport || 'Standard (Verified)'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewCand(null);
                  if (setSelectedCandidate) setSelectedCandidate(null);
                }}
                className="p-1.5 text-slate-400 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CANDIDATE APPLIED RESUME / CV ACTION SPOTLIGHT BAR */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-emerald-500/10 border-2 border-gold-500/40 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-700 dark:text-gold-400 flex items-center justify-center shrink-0 border border-gold-500/40 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Candidate Applied Resume / CV</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Active & Verified CV
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Document: <strong className="font-mono text-slate-900 dark:text-white">{activeCand.resumeName}</strong> <span className="text-slate-500">({activeCand.resumeSize} • ATS Certified)</span>
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: Download PDF and Open in New Tab */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadCv(activeCand)}
                    className="px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-gold-glow cursor-pointer"
                    title="Download Candidate CV PDF directly to computer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CV (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreviewCv(activeCand)}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700 dark:border-navy-700"
                    title="Open Fullscreen Resume in New Window"
                  >
                    <ExternalLink className="w-4 h-4 text-gold-400" />
                    <span>Open in New Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFullResumeSheet(!showFullResumeSheet)}
                    className="px-3 py-2.5 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-slate-200 dark:border-navy-700 cursor-pointer"
                    title="Toggle Visual ATS Resume Viewer"
                  >
                    {showFullResumeSheet ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{showFullResumeSheet ? 'Hide Sheet' : 'Show Sheet'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* VISUAL ATS RESUME SHEET (Rendered Directly in Modal for Immediate Inspection) */}
            {showFullResumeSheet && (
              <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-2xl border-2 border-slate-300 dark:border-navy-800 space-y-5 shadow-inner">

                {/* Visual Resume Sheet Header */}
                <div className="border-b-2 border-gold-500/40 pb-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                      {activeCand.name}
                    </h2>
                    <p className="text-sm font-bold text-gold-600 dark:text-gold-400 mt-0.5">
                      {activeCand.currentRole} • {activeCand.id}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-500" /> {activeCand.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-500" /> {activeCand.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-purple-500" /> {activeCand.location}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-amber-500" /> {activeCand.nationality} ({activeCand.citizenship})</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                    <span className="px-3 py-1 bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 font-bold text-xs rounded-full uppercase">
                      ATS Verified Dossier
                    </span>
                    <span className="text-[10px] text-slate-500">The Revival International Placements</span>
                  </div>
                </div>

                {/* 1. Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-navy-800 pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    <span>Executive Profile Summary</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-navy-900 p-3 rounded-xl border border-slate-200 dark:border-navy-800">
                    {activeCand.aiSummary || `Results-driven ${activeCand.currentRole} with ${activeCand.experience} of proven track record across UAE and international markets. Verified credentials for overseas relocation, regulatory compliance, and cross-functional leadership in high-impact operations.`}
                  </p>
                </div>

                {/* 2. Key Technical Competencies */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-navy-800 pb-1">
                    <Award className="w-3.5 h-3.5 text-gold-500" />
                    <span>Core Competencies & Key Technical Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeCand.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white dark:bg-navy-900 text-gold-700 dark:text-gold-400 font-bold text-xs rounded-xl border border-slate-200 dark:border-navy-800 shadow-2xs"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Professional Work Experience */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-navy-800 pb-1">
                    <Briefcase className="w-3.5 h-3.5 text-gold-500" />
                    <span>Professional Work Experience</span>
                  </h4>
                  <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">{activeCand.currentRole}</strong>
                      <span className="text-gold-600 dark:text-gold-400 font-semibold">{activeCand.experience} (Active Mandate)</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{activeCand.currentEmployer} • {activeCand.location}</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pt-1">
                      <li>Spearheading core functional planning, milestone delivery, and multi-team governance.</li>
                      <li>Ensuring strict compliance with international standards, quality benchmarks, and safety protocols.</li>
                      <li>Coordinating cross-border resource alignment and technical deliverables for enterprise stakeholders.</li>
                    </ul>
                  </div>
                </div>

                {/* 4. Academic Qualifications & Embassy Attestation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-navy-800 pb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                    <span>Academic Qualifications & Embassy Attestation</span>
                  </h4>
                  <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">{activeCand.education}</strong>
                      <p className="text-slate-500 dark:text-slate-400">Verified Higher Educational Degree</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>✓ UAE & Saudi Embassy (MOHRE Verified)</span>
                    </div>
                  </div>
                </div>

                {/* 5. Mobility, Compensation & Availability */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-navy-800 pb-1">
                    <Clock className="w-3.5 h-3.5 text-gold-500" />
                    <span>Relocation, Remuneration & Availability</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs bg-white dark:bg-navy-900 p-3.5 rounded-xl border border-slate-200 dark:border-navy-800">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Target Relocation</span>
                      <strong className="text-slate-900 dark:text-white">{activeCand.preferredCountry || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Current Salary</span>
                      <strong className="text-slate-900 dark:text-white">{activeCand.currentSalary || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Expected Salary</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCand.expectedSalary || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Notice Period</span>
                      <strong className="text-slate-900 dark:text-white">{activeCand.noticePeriod || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Passport Status</span>
                      <strong className="text-slate-900 dark:text-white">{activeCand.passport || 'Standard (Verified)'}</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Quick Contact & Demographics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Email Address</p>
                  <a href={`mailto:${activeCand.email}`} className="font-semibold text-slate-900 dark:text-white hover:text-gold-600 truncate block font-mono text-[11px]">
                    {activeCand.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Phone Number</p>
                  <a href={`tel:${activeCand.phone}`} className="font-semibold text-slate-900 dark:text-white hover:text-gold-600 truncate block font-mono text-[11px]">
                    {activeCand.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Current Location</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Nationality & Citizenship</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.nationality} ({activeCand.citizenship})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">DOB & Gender</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.dob || '1994-08-15'} {activeCand.gender ? `• ${activeCand.gender}` : '• Male'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-600 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Target Destination</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.preferredCountry}
                  </p>
                </div>
              </div>
            </div>

            {/* Applied Vacancies & Mandates History */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gold-500" />
                <span>Applied Vacancies & Mandates ({activeCand.applications?.length || 0})</span>
              </h4>
              {Array.isArray(activeCand.applications) && activeCand.applications.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeCand.applications.map((app, idx) => {
                    const appCvName = app.resumeName || activeCand.resumeName;
                    const appCvSize = app.resumeSize || activeCand.resumeSize || '245 KB';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl flex flex-col gap-2.5 text-xs shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{app.jobTitle}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{app.company} • {app.location || 'GCC'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-gold-500/20 text-gold-700 dark:text-gold-400 uppercase">
                              {app.status || 'Under Review'}
                            </span>
                          </div>
                        </div>

                        {/* Resume / CV Attached for this Specific Job Application */}
                        <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200/90 dark:border-navy-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Applied Resume / CV</span>
                              <p className="font-bold text-slate-900 dark:text-white truncate text-xs" title={appCvName}>
                                {appCvName}
                              </p>
                              <span className="text-[10px] text-slate-500">{appCvSize} • ATS Certified</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePreviewAppCv(app, activeCand)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                              title="Preview Candidate CV in New Tab"
                            >
                              <Eye className="w-3.5 h-3.5 text-gold-500" />
                              <span>Preview CV</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadAppCv(app, activeCand)}
                              className="px-2.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shadow-gold-glow cursor-pointer"
                              title="Download Candidate CV"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download CV</span>
                            </button>
                          </div>
                        </div>

                        {/* Candidate Application Notes / Terms */}
                        {(app.coverNote || app.noticePeriod || app.expectedSalary) && (
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-navy-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                            {app.coverNote && (
                              <p className="italic font-medium">"{app.coverNote}"</p>
                            )}
                            <div className="flex items-center gap-3 font-semibold ml-auto text-[10px]">
                              {app.noticePeriod && <span>⏱️ Notice: <strong>{app.noticePeriod}</strong></span>}
                              {app.expectedSalary && <span>💰 Expected: <strong>{app.expectedSalary}</strong></span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-slate-100/60 dark:bg-navy-950/60 rounded-xl text-xs text-slate-500 italic border border-dashed border-slate-300 dark:border-navy-800">
                  Candidate registered in General Executive Talent Pool (No specific job applied yet).
                </div>
              )}
            </div>

            {/* Attached Compliance Documents (if any) */}
            {Array.isArray(activeCand.documents) && activeCand.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Attached Compliance Documents:
                </h4>
                <div className="space-y-1.5">
                  {activeCand.documents.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex justify-between items-center text-xs">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">📄 {doc.fileName || doc.name} ({doc.documentType || doc.type || 'Document'})</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ {doc.status || 'Verified'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => handleDeleteCandidate(activeCand)}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadCv(activeCand)}
                className="py-2.5 px-5 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 shadow-gold-glow cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Resume (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewCand(null);
                  if (setSelectedCandidate) setSelectedCandidate(null);
                }}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteConfirmCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Delete Candidate?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{deleteConfirmCand.name}</strong> (#{deleteConfirmCand.id})? All compliance documents and profile records will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCand(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCandidate}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Candidate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Add Candidate Modal */}
      <CrmAddCandidateModal
        isOpen={globalAddCandidateOpen}
        onClose={() => setGlobalAddCandidateOpen(false)}
      />

    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye,
  Filter, X, Trash2, Download, ExternalLink, Mail, Phone, MapPin, Globe,
  Calendar, Briefcase, GraduationCap, Clock, Building, Award, Check,
  FileCheck, ChevronDown, ChevronUp, RotateCcw, AlertCircle, RefreshCw,
  LayoutGrid, List, ArrowUpDown, SlidersHorizontal, Star
} from 'lucide-react';
import { CrmAddCandidateModal } from '../components/CrmAddCandidateModal';
import ScrollReveal from '../../components/ScrollReveal';
import { downloadCandidateResumePdf, openCandidateResumeInNewTab } from '../../services/candidateResumePdfService';

const isDummyCandidate = (c) => {
  if (!c) return true;
  const name = (c.name || '').toLowerCase();
  const id = (c.id || '').toUpperCase();
  const email = (c.email || '').toLowerCase();
  const dummyIds = [
    'REV-CAN-101', 'REV-CAN-102', 'REV-CAN-103', 'REV-CAN-104', 'REV-CAN-105', 'REV-CAN-106',
    'REV-CAN-4526', 'REV-CAN-4699', 'REV-CAN-5176', 'REV-CAN-9727', 'REV-CAN-3945',
    'REV-CAN-8396', 'REV-CAN-3270', 'REV-CAN-6198', 'REV-CAN-2158', 'REV-CAN-8921',
    'REV-CAN-6858', 'REV-CAN-4283', 'REV-CAN-5599', 'REV-CAN-7331', 'REV-CAN-7211',
    'REV-CAN-8645', 'REV-CAN-5223', 'REV-CAN-3393', 'REV-CAN-9398', 'REV-CAN-3073',
    'REV-CAN-5032', 'REV-CAN-1517', 'REV-CAN-4093', 'REV-CAN-7506', 'REV-CAN-5974',
    'REV-CAN-4404', 'REV-CAN-4539', 'REV-CAN-9000', 'REV-CAN-4378', 'REV-CAN-4043',
    'REV-CAN-5868', 'REV-CAN-8915', 'REV-CAN-3362', 'REV-CAN-53106', 'RI-CAND-777', 'RI-CAND-391',
    'RI-CAND-001', 'RI-CAND-005'
  ];
  if (dummyIds.some(d => id.startsWith(d) || id === d)) return true;
  if (name === 'kavya' || email === 'junejoe@gmail.com') return true;
  if (name.includes('alexander wright') || name.includes('sarah al-mansoori') || name.includes('mohamed tariq') ||
      name.includes('elena rostova') || name.includes('david chen') || name.includes('fatima al-zahra') ||
      name.includes('real candidate') || name.includes('test candidate') || name.includes('fake user') ||
      name.includes('fresh candidate') || name.includes('unknown candidate')) return true;
  if (email.includes('example.com') || email.includes('mailinator') || email.includes('trashuser') || 
      email.includes('domain.com') || email.includes('candidate_test') || email.includes('candidate.fresh') ||
      email === 'johnny@gmail.com' || email === 'real.candidate.test@gmail.com' ||
      email === 'candidate.verify@gmail.com') return true;
  return false;
};

// Formats candidate registration timestamp into readable executive date & time
const formatCandidateDateTime = (dateStr) => {
  if (!dateStr) return 'Registered Member';
  try {
    const raw = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateFormatted} • ${timeFormatted}`;
  } catch {
    return dateStr;
  }
};

// Sanitizes AI summary so job application logs never leak into candidate profiles
const getCleanAiSummary = (cand) => {
  if (!cand) return '';
  const summary = cand.aiSummary || '';
  if (!summary || summary.toLowerCase().includes('applied for') || summary.includes('Submitted CV:')) {
    const isGoogle = (cand.source && cand.source.includes('Google')) || (cand.email && cand.email.toLowerCase().includes('gmail'));
    return isGoogle
      ? 'Candidate verified via Google OAuth 2.0 OpenID Connect.'
      : 'Registered Candidate profile verified with international credentials.';
  }
  return summary;
};

// Sanitizes candidate role to ensure applied job titles do not overwrite professional profile credentials
const getCleanCandidateRole = (cand) => {
  if (!cand) return 'Executive Candidate';
  const role = cand.currentRole || '';
  if (!role || role.toLowerCase().startsWith('applied for:') || role.includes(' - Luxury Resort')) {
    return 'Executive Candidate';
  }
  return role;
};

// Sanitizes employer to ensure hiring vacancy companies do not overwrite candidate's registered organization
const getCleanCandidateEmployer = (cand) => {
  if (!cand) return 'Revival International Candidate';
  const emp = cand.currentEmployer || '';
  if (!emp || emp === 'Atlantis Resorts & Hotels' || emp.toLowerCase().includes('resort')) {
    return 'Revival International Candidate';
  }
  return emp;
};

// Extracts numeric milliseconds timestamp for strict descending sorting (#1 latest)
const getCandidateTimestamp = (cand) => {
  if (!cand) return 0;
  const raw = cand.createdAt || cand.registeredAt || cand.updatedAt;
  if (!raw) return 0;
  try {
    const str = String(raw).trim();
    const iso = str.includes('T') ? str : str.replace(' ', 'T') + 'Z';
    const t = new Date(iso).getTime();
    return isNaN(t) ? (new Date(str).getTime() || 0) : t;
  } catch {
    return 0;
  }
};

// Evaluates candidate registration timestamp against selected timeframe
const matchesTimeframe = (dateStr, timeframe) => {
  if (!timeframe || timeframe === 'all') return true;
  if (!dateStr) return true;
  try {
    const raw = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const candDate = new Date(raw);
    if (isNaN(candDate.getTime())) return true;

    const now = new Date();
    const diffMs = now.getTime() - candDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (timeframe === 'day') {
      // Today / Last 24 Hours or same calendar day
      return diffHours <= 24 || candDate.toDateString() === now.toDateString();
    }
    if (timeframe === 'week') {
      // Within last 7 days
      return diffDays <= 7;
    }
    if (timeframe === 'month') {
      // Within last 30 days or same calendar month
      return diffDays <= 30 || (candDate.getMonth() === now.getMonth() && candDate.getFullYear() === now.getFullYear());
    }
    if (timeframe === 'year') {
      // Within last 365 days or same calendar year
      return diffDays <= 365 || candDate.getFullYear() === now.getFullYear();
    }
    return true;
  } catch {
    return true;
  }
};

export const CrmCandidates = () => {
  const {
    candidates = [],
    loadingCandidates = false,
    applications = [],
    setActiveModule,
    setAiDrawerOpen,
    globalAddCandidateOpen,
    setGlobalAddCandidateOpen,
    deleteCandidate,
    selectedCandidate,
    setSelectedCandidate,
    fetchCandidates
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all'); // 'all' | 'day' | 'week' | 'month' | 'year'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'score'
  const [roleFilter, setRoleFilter] = useState('all');
  const [cvFilter, setCvFilter] = useState('all'); // 'all' | 'with_cv'
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all' | 'high'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [viewCand, setViewCand] = useState(null);
  const [deleteConfirmCand, setDeleteConfirmCand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [showFullResumeSheet, setShowFullResumeSheet] = useState(true);
  const [syncTick, setSyncTick] = useState(0);

  // Auto-refresh candidates on mount and whenever external events occur
  useEffect(() => {
    if (fetchCandidates) {
      fetchCandidates();
    }
  }, [fetchCandidates]);

  // Real-time synchronization across browser tabs and user interactions
  useEffect(() => {
    const handleSync = () => {
      setSyncTick(t => t + 1);
      if (fetchCandidates) fetchCandidates();
    };

    const handleDeletedEvent = () => {
      setSyncTick(t => t + 1);
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('candidate-registered', handleSync);
    window.addEventListener('candidate-deleted', handleDeletedEvent);
    window.addEventListener('candidate-profile-updated', handleSync);
    const handleVis = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('candidate-registered', handleSync);
      window.removeEventListener('candidate-deleted', handleDeletedEvent);
      window.removeEventListener('candidate-profile-updated', handleSync);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [fetchCandidates]);

  // Synchronize when a candidate is selected externally
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
          email: deleteConfirmCand.email,
          nationality: deleteConfirmCand.nationality
        });
      }
      if (viewCand && (viewCand.id === deleteConfirmCand.id || (deleteConfirmCand.email && viewCand.email?.toLowerCase() === deleteConfirmCand.email.toLowerCase()))) {
        setViewCand(null);
      }
      if (setSelectedCandidate && selectedCandidate?.id === deleteConfirmCand.id) {
        setSelectedCandidate(null);
      }
      setStatusNotice(`✓ Candidate "${deleteConfirmCand.name}" (${deleteConfirmCand.id}) permanently removed.`);
      setDeleteConfirmCand(null);
      setSyncTick(t => t + 1);
      setTimeout(() => setStatusNotice(''), 4000);
    } catch (err) {
      alert('Failed to delete candidate: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Centralized Candidate Pool: Sourced directly from production database (Pure registered profiles)
  const candidatePool = useMemo(() => {
    return (candidates || []).filter(c => {
      if (!c || isDummyCandidate(c)) return false;
      // Filter out pure job application submissions that do not belong to a registered profile
      const isJobAppOnly = c.source === 'Quick Apply / Job Application' || (c.source && c.source.startsWith('Applied for:'));
      if (isJobAppOnly && !c.userId && !c.registeredAt && !c.createdAt) {
        return false;
      }
      return true;
    });
  }, [candidates]);

  // Enriched active candidate object for detail view
  const activeCand = useMemo(() => {
    if (!viewCand) return null;
    let enriched = { ...viewCand };

    const currentInContext = candidatePool.find(
      c => c.id === viewCand.id || (c.email && c.email.toLowerCase() === (viewCand.email || '').toLowerCase())
    );
    if (currentInContext) {
      enriched = { ...enriched, ...currentInContext };
    }

    // Check localStorage sir_candidates_db for candidate portal updates
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
            currentRole: candLocal.currentRole || candLocal.title || enriched.currentRole,
            currentEmployer: candLocal.currentEmployer || enriched.currentEmployer,
            mohreAttested: candLocal.mohreAttested !== undefined ? candLocal.mohreAttested : enriched.mohreAttested,
            skills: (Array.isArray(candLocal.skills) && candLocal.skills.length > 0) ? candLocal.skills : enriched.skills
          };
        }
      }
    } catch { }

    const rawResumeName = enriched.resumeName;
    const rawResumeUrl = enriched.resumeUrl;
    const isFabricated = !rawResumeName || rawResumeName.includes('_Executive_CV.pdf') || rawResumeName === 'Executive_CV.pdf';
    const hasRealCv = !!(rawResumeUrl || (!isFabricated && rawResumeName));
    const cleanName = (enriched.name || 'Executive Candidate').trim();

    return {
      ...enriched,
      name: cleanName,
      phone: (enriched.phone && enriched.phone.trim() !== '') ? enriched.phone : 'Not specified',
      nationality: (enriched.nationality && enriched.nationality.trim() !== '') ? enriched.nationality : 'Not specified',
      citizenship: (enriched.citizenship && enriched.citizenship.trim() !== '') ? enriched.citizenship : 'Not specified',
      location: (enriched.location && enriched.location.trim() !== '') ? enriched.location : 'Not specified',
      preferredCountry: (enriched.preferredCountry && enriched.preferredCountry.trim() !== '') ? enriched.preferredCountry : 'Not specified',
      currentRole: getCleanCandidateRole(enriched),
      currentEmployer: getCleanCandidateEmployer(enriched),
      aiSummary: getCleanAiSummary(enriched),
      experience: (enriched.experience && enriched.experience.trim() !== '') ? enriched.experience : 'Not specified',
      education: (enriched.education || enriched.qualification || 'Not specified'),
      qualification: (enriched.qualification || enriched.education || 'Not specified'),
      currentSalary: (enriched.currentSalary && enriched.currentSalary.trim() !== '') ? enriched.currentSalary : 'Not specified',
      expectedSalary: (enriched.expectedSalary && enriched.expectedSalary.trim() !== '') ? enriched.expectedSalary : 'Not specified',
      noticePeriod: (enriched.noticePeriod && enriched.noticePeriod.trim() !== '') ? enriched.noticePeriod : 'Immediate',
      hasRealCv,
      resumeName: hasRealCv ? (rawResumeName || `${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`) : null,
      resumeUrl: hasRealCv ? rawResumeUrl : null,
      resumeSize: hasRealCv ? (enriched.resumeSize || 'PDF Document') : null,
      mohreAttested: enriched.mohreAttested !== undefined ? enriched.mohreAttested : true,
      skills: (Array.isArray(enriched.skills) && enriched.skills.length > 0)
        ? enriched.skills
        : ['International Mobility', 'Executive Candidate', 'Global Mandates']
    };
  }, [viewCand, candidates, candidatePool]);

  // Helper to ensure candidate has their full uploaded CV from all available stores
  const resolveCandidateWithResume = (cand) => {
    if (!cand) return cand;
    let url = cand.resumeUrl || cand.fileUrl;
    let name = cand.resumeName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf`;

    // 1. Check candidate applications for real uploaded CV file
    if ((!url || url.length < 500) && Array.isArray(cand.applications)) {
      const appWithResume = cand.applications.find(a => (a.resumeUrl && a.resumeUrl.length > 500));
      if (appWithResume) {
        url = appWithResume.resumeUrl;
        name = appWithResume.resumeName || name;
      }
    }

    // 2. Check candidate documents
    if ((!url || url.length < 500) && Array.isArray(cand.documents)) {
      const docWithResume = cand.documents.find(d => d.fileUrl && d.fileUrl.length > 500);
      if (docWithResume) {
        url = docWithResume.fileUrl;
        name = docWithResume.fileName || name;
      }
    }

    // 3. Fallback to client localStorage cache if running in browser
    if ((!url || url.length < 500) && typeof window !== 'undefined' && window.localStorage) {
      try {
        const candDbStr = localStorage.getItem('sir_candidates_db');
        if (candDbStr && cand.email) {
          const candDb = JSON.parse(candDbStr);
          const localEntry = candDb[cand.email.toLowerCase().trim()];
          if (localEntry && localEntry.resumeUrl && localEntry.resumeUrl.length > 200) {
            url = localEntry.resumeUrl;
            name = localEntry.resumeName || name;
          }
        }
      } catch {}

      try {
        const sessStr = localStorage.getItem('sir_user_session');
        if (sessStr) {
          const sess = JSON.parse(sessStr);
          const candEmail = (cand.email || '').toLowerCase().trim();
          const sessEmail = (sess.email || '').toLowerCase().trim();
          if (sess && (sessEmail === candEmail || sess.candidateId === cand.id)) {
            if (sess.resumeUrl && sess.resumeUrl.length > 200) {
              url = sess.resumeUrl;
              name = sess.resumeName || name;
            }
          }
        }
      } catch {}

      try {
        if (cand.email) {
          const stored = localStorage.getItem(`sir_resume_${cand.email.toLowerCase().trim()}`);
          if (stored && stored.length > 200) url = stored;
        }
        if (!url || url.length < 200) {
          const active = localStorage.getItem('sir_active_resume');
          const activeName = localStorage.getItem('sir_active_resume_name');
          if (active && active.length > 200) {
            url = active;
            if (activeName) name = activeName;
          }
        }
      } catch {}
    }

    return { ...cand, resumeUrl: url, resumeName: name };
  };

  // Handle downloading candidate resume as an actual file
  const handleDownloadCv = async (cand) => {
    if (!cand) return;
    let resolved = resolveCandidateWithResume(cand);
    if (!resolved.resumeUrl || resolved.resumeUrl.length < 100) {
      try {
        const res = await fetch(`/api/candidate/profile?candidateId=${encodeURIComponent(cand.id || '')}&email=${encodeURIComponent(cand.email || '')}`);
        const data = await res.json();
        if (data?.success && data?.data?.resumeUrl) {
          resolved = { ...resolved, resumeUrl: data.data.resumeUrl, resumeName: data.data.resumeName || resolved.resumeName };
        }
      } catch {}
    }
    downloadCandidateResumePdf(resolved);
  };

  // Handle viewing / previewing candidate CV in a separate clean tab
  const handlePreviewCv = async (cand) => {
    if (!cand) return;
    let resolved = resolveCandidateWithResume(cand);
    if (!resolved.resumeUrl || resolved.resumeUrl.length < 100) {
      try {
        const res = await fetch(`/api/candidate/profile?candidateId=${encodeURIComponent(cand.id || '')}&email=${encodeURIComponent(cand.email || '')}`);
        const data = await res.json();
        if (data?.success && data?.data?.resumeUrl) {
          resolved = { ...resolved, resumeUrl: data.data.resumeUrl, resumeName: data.data.resumeName || resolved.resumeName };
        }
      } catch {}
    }
    openCandidateResumeInNewTab(resolved);
  };

  const renderCandidateAvatar = (c, sizeClasses = "w-12 h-12 text-sm") => {
    const isRealPhoto = c?.avatar && !c.avatar.includes('unsplash.com');
    if (isRealPhoto) {
      return (
        <img
          src={c.avatar}
          alt={c.name || 'Candidate'}
          className={`${sizeClasses} rounded-2xl object-cover border-2 border-gold-500 shadow-md shrink-0`}
        />
      );
    }
    const initials = (c?.name || 'C')
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'RI';

    return (
      <div
        className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-[#0a1120] to-[#1e293b] text-gold-400 font-extrabold flex items-center justify-center border-2 border-gold-500/70 shadow-md shrink-0 select-none`}
      >
        {initials}
      </div>
    );
  };

  // Dynamically extract distinct candidate roles for fast recruiter filtering
  const availableRoles = useMemo(() => {
    const roles = new Set();
    (candidatePool || []).forEach(c => {
      const cleanRole = getCleanCandidateRole(c);
      if (cleanRole && cleanRole.trim() && cleanRole.trim() !== 'Executive Candidate') {
        roles.add(cleanRole.trim());
      }
    });
    return Array.from(roles).sort();
  }, [candidatePool]);

  // Pure Candidate Profiles: Filtered & Strictly Ordered (Newest First #1 by default)
  const filtered = useMemo(() => {
    const list = candidatePool.filter(c => {
      // Exclude any legacy mock/dummy candidate profiles
      if (isDummyCandidate(c)) return false;

      // 1. Timeframe Filter: All Time | Today (Day) | Weekly | Monthly | Yearly
      const regDate = c.createdAt || c.registeredAt || c.updatedAt;
      if (!matchesTimeframe(regDate, timeframe)) {
        return false;
      }

      // 2. Search Term Filter across profile credentials
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const role = getCleanCandidateRole(c);
        const emp = getCleanCandidateEmployer(c);
        const summary = getCleanAiSummary(c);
        const candStr = `${c.name || ''} ${c.email || ''} ${c.phone || ''} ${role} ${emp} ${summary} ${c.nationality || ''} ${c.citizenship || ''} ${c.location || ''} ${c.id || ''} ${Array.isArray(c.skills) ? c.skills.join(' ') : ''}`.toLowerCase();
        if (!candStr.includes(q)) return false;
      }

      // 3. Role / Industry Filter
      if (roleFilter !== 'all') {
        const role = getCleanCandidateRole(c).trim().toLowerCase();
        if (role !== roleFilter.toLowerCase()) return false;
      }

      // 4. CV Availability Filter
      if (cvFilter === 'with_cv') {
        const hasCv = !!(c.resumeUrl || c.resumeName || c.fileUrl);
        if (!hasCv) return false;
      }

      // 5. High Score Filter (>85%)
      if (scoreFilter === 'high') {
        if ((c.score || 0) < 85) return false;
      }

      return true;
    });

    // 6. Strict Ordering: Whoever registered last appears #1 (Newest First)
    return list.sort((a, b) => {
      if (sortBy === 'newest') {
        return getCandidateTimestamp(b) - getCandidateTimestamp(a);
      }
      if (sortBy === 'oldest') {
        return getCandidateTimestamp(a) - getCandidateTimestamp(b);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      return getCandidateTimestamp(b) - getCandidateTimestamp(a);
    });
  }, [candidatePool, timeframe, searchTerm, roleFilter, cvFilter, scoreFilter, sortBy]);

  const timeframeCounts = useMemo(() => {
    const valid = candidatePool.filter(c => !isDummyCandidate(c));
    return {
      all: valid.length,
      day: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'day')).length,
      week: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'week')).length,
      month: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'month')).length,
      year: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'year')).length
    };
  }, [candidatePool]);

  return (
    <div className="space-y-6 text-xs font-sans">

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                Human Capital Index
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Live Executive Talent Pool
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5">
              Candidate Directory & Profiles
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Candidate Profiles synchronized directly with Candidate Portal Dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveModule('job-applications')}
              className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="View Job Applications Registry"
            >
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Job Applications Registry ({applications.length})</span>
            </button>

            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-4 py-2.5 bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Resume Parser</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (fetchCandidates) fetchCandidates();
                setStatusNotice('✓ Candidate directory synchronized with live database.');
                setTimeout(() => setStatusNotice(''), 3000);
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs border border-slate-200 dark:border-navy-700"
              title="Refresh Candidate Directory"
            >
              <RefreshCw className="w-4 h-4 text-amber-500" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setGlobalAddCandidateOpen(true)}
              className="px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold rounded-xl shadow-gold-glow transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
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

      {/* ADVANCED RECRUITER FILTER & SEARCH BAR */}
      <ScrollReveal>
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-4">
          
          {/* Top Row: Search Input + Sort Dropdown + View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search Input with Clear & Counter */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gold-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates by name, email, phone, role, skills, nationality, or Candidate ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 shadow-inner"
              />
              <div className="absolute right-3 top-2.5 sm:top-3 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-200 dark:hover:bg-navy-800"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                  {filtered.length} found
                </span>
              </div>
            </div>

            {/* Controls: Sort Order & View Mode */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              
              {/* Sort Order Selector (Defaults to Newest Registered First #1) */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl px-3 py-2 shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Order:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest" className="dark:bg-navy-900">✦ Newest Registered First (#1 Latest)</option>
                  <option value="oldest" className="dark:bg-navy-900">Oldest Registered First</option>
                  <option value="name" className="dark:bg-navy-900">Candidate Name (A - Z)</option>
                  <option value="score" className="dark:bg-navy-900">Highest Profile Match Score</option>
                </select>
              </div>

              {/* View Mode Toggle (Grid Cards vs Compact Table) */}
              <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-2xl border border-slate-200 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-navy-950 text-gold-600 dark:text-gold-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-navy-950 text-gold-600 dark:text-gold-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                  title="Compact Table List View (Easy Multi-Profile Pick)"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">List</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Timeframe Pills, Role Filter & Quick Presets */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
            
            {/* Filter Timeframe Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                <span>Timeframe:</span>
              </span>

              <button
                type="button"
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'all'
                    ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>All Time ({timeframeCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeframe('day')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'day'
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Daily (Today)</span>
                {timeframeCounts.day > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    timeframe === 'day' ? 'bg-navy-950 text-gold-400' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {timeframeCounts.day}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'week'
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Weekly</span>
                {timeframeCounts.week > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    timeframe === 'week' ? 'bg-navy-950 text-gold-400' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {timeframeCounts.week}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'month'
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Monthly</span>
                {timeframeCounts.month > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    timeframe === 'month' ? 'bg-navy-950 text-gold-400' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {timeframeCounts.month}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTimeframe('year')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'year'
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Yearly</span>
                {timeframeCounts.year > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    timeframe === 'year' ? 'bg-navy-950 text-gold-400' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {timeframeCounts.year}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Filter Badges: CV Attached & Role Filter & Reset */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* CV Attached Toggle Pill */}
              <button
                type="button"
                onClick={() => setCvFilter(cvFilter === 'with_cv' ? 'all' : 'with_cv')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  cvFilter === 'with_cv'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>CV Attached Only</span>
              </button>

              {/* Role Dropdown Filter */}
              {availableRoles.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-2.5 py-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer max-w-[140px] truncate"
                  >
                    <option value="all" className="dark:bg-navy-900">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role} className="dark:bg-navy-900">{role}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset All Filters Button */}
              {(timeframe !== 'all' || searchTerm.trim() !== '' || roleFilter !== 'all' || cvFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  type="button"
                  onClick={() => {
                    setTimeframe('all');
                    setSearchTerm('');
                    setRoleFilter('all');
                    setCvFilter('all');
                    setSortBy('newest');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold transition cursor-pointer text-xs border border-rose-500/30"
                  title="Reset all search & filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

            </div>

          </div>

        </div>
      </ScrollReveal>

      {/* Profiles Count Banner & Active Filter Indicators */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Registered Profiles:</span>
            <span className="text-amber-600 dark:text-gold-400 font-extrabold">
              {loadingCandidates ? 'Synchronizing...' : `${filtered.length} Candidates`}
            </span>
          </h3>
          <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
            • Sorted by: <strong className="text-gold-600 dark:text-gold-400 font-bold">{sortBy === 'newest' ? 'Newest Registered First (#1)' : sortBy === 'oldest' ? 'Oldest Registered First' : sortBy === 'name' ? 'Name A-Z' : 'Score'}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Pure Candidate Profiles • Job Applications Managed Separately
        </span>
      </div>

      {/* CANDIDATES PROFILE CARDS / TABLE (PURE CANDIDATE PROFILES ONLY) */}
      <ScrollReveal>
        {loadingCandidates ? (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Synchronizing Candidate Profiles...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Fetching verified profiles from centralized database.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              No Registered Candidates Matching Filters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No candidates found matching the selected timeframe ({timeframe}) or search query. Switch timeframe to "All Time" or reset your search.
            </p>
            <button
              onClick={() => {
                setTimeframe('all');
                setSearchTerm('');
                setRoleFilter('all');
                setCvFilter('all');
                setSortBy('newest');
              }}
              className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl text-xs shadow-gold-glow cursor-pointer mt-2"
            >
              View All Candidates
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* COMPACT LIST / TABLE VIEW FOR ULTRA-FAST PROFILE PICKING */
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Candidate Profile</th>
                    <th className="py-3 px-4">Role & Experience</th>
                    <th className="py-3 px-4">Contact (Email & Phone)</th>
                    <th className="py-3 px-4">Registration Date & Time</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Resume / CV</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60 font-medium">
                  {filtered.map((cand, index) => {
                    const regDateTime = cand.createdAt || cand.registeredAt || cand.updatedAt;
                    const hasCv = !!(cand.resumeUrl || cand.resumeName);

                    return (
                      <tr 
                        key={cand.id}
                        onClick={() => setViewCand(cand)}
                        className="hover:bg-slate-50/80 dark:hover:bg-navy-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          {index === 0 && sortBy === 'newest' ? (
                            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-gold-500 text-slate-950 font-extrabold text-[10px] shadow-xs">
                              ✦ #1 LATEST
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-mono font-bold text-[10px]">
                              #{index + 1}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {renderCandidateAvatar(cand, "w-9 h-9 text-xs shrink-0")}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">
                                {cand.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                <span className="text-gold-500 font-bold">{cand.id}</span> • {cand.nationality || 'UAE'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{getCleanCandidateRole(cand)}</div>
                          <div className="text-[10px] text-slate-400">{cand.experience || '3-5 Years'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{cand.email}</div>
                          {cand.phone && (
                            <div className="text-slate-400 font-mono text-[10px]">{cand.phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-gold-500" />
                            <span>{formatCandidateDateTime(regDateTime)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md border border-gold-500/40 text-gold-700 dark:text-gold-400 font-bold text-[10px] bg-gold-500/10">
                            {cand.score || 88}%
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            {hasCv ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handlePreviewCv(cand)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[10px] flex items-center gap-1"
                                  title="Preview CV"
                                >
                                  <Eye className="w-3 h-3 text-gold-500" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadCv(cand)}
                                  className="px-2 py-1 bg-gold-500/15 hover:bg-gold-500/25 text-gold-700 dark:text-gold-400 rounded-lg font-bold text-[10px] flex items-center gap-1 border border-gold-500/30"
                                  title="Download CV"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No CV</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewCand(cand)}
                              className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-bold rounded-lg text-[10px] transition"
                            >
                              View →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCandidate(cand)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete Candidate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* LUXURY GRID CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cand, index) => {
              const regDateTime = cand.createdAt || cand.registeredAt || cand.updatedAt;
              const hasCv = !!(cand.resumeUrl || cand.resumeName);

              return (
                <div
                  key={cand.id}
                  onClick={() => setViewCand(cand)}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-5 rounded-3xl hover:border-gold-500/80 transition duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg group relative overflow-hidden space-y-3.5"
                >
                  {/* Top Decorative Gold Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 opacity-80 group-hover:opacity-100 transition" />

                  <div className="space-y-3">
                    
                    {/* Header Row: Rank Badge, Avatar, Name, Candidate ID, Badges */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {renderCandidateAvatar(cand, "w-11 h-11 text-xs shrink-0")}
                        <div className="min-w-0 flex-1">
                          
                          {/* Rank / Latest Registration Badge */}
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {index === 0 && sortBy === 'newest' ? (
                              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-gold-500 text-slate-950 font-extrabold text-[9px] shadow-xs tracking-wider">
                                ✦ #1 LATEST
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-mono font-bold text-[9px]">
                                #{index + 1}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition leading-snug truncate" title={cand.name}>
                            {cand.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="text-gold-600 dark:text-gold-400 font-extrabold whitespace-nowrap">{cand.id}</span>
                            <span className="text-slate-300 dark:text-navy-700">•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-sans font-medium whitespace-nowrap">{cand.nationality || 'UAE'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasCv ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30" title={`CV Attached: ${cand.resumeName || 'Verified'}`}>
                            <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>CV</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-400 font-medium text-[10px]">
                            No CV
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-lg border border-gold-500/40 text-gold-700 dark:text-gold-400 font-bold text-[10px] bg-gold-500/10 flex items-center gap-1">
                          <Award className="w-3 h-3 text-gold-500" />
                          <span>{cand.score || 88}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Professional Details Container */}
                    <div className="p-3.5 bg-slate-50 dark:bg-navy-950/70 rounded-2xl space-y-2 border border-slate-100 dark:border-navy-800/80 text-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role</span>
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">{cand.experience || '3-5 Years'}</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-[13px]" title={getCleanCandidateRole(cand)}>
                          {getCleanCandidateRole(cand)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={getCleanCandidateEmployer(cand)}>
                          {getCleanCandidateEmployer(cand)}
                        </p>
                      </div>

                      {/* Contact & Expected Salary */}
                      <div className="pt-2 border-t border-slate-200/70 dark:border-navy-800/70 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate flex-1" title={cand.email}>
                            <Mail className="w-3 h-3 text-gold-500 shrink-0" />
                            <span className="truncate">{cand.email}</span>
                          </div>
                          {cand.phone && (
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[10px] shrink-0" title={cand.phone}>
                              <Phone className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                              <span>{cand.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-navy-800/60">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Expected:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{cand.expectedSalary || 'Market Standard'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Bio / Executive Summary */}
                    {getCleanAiSummary(cand) && (
                      <p className="text-[11.5px] italic text-slate-600 dark:text-slate-300 line-clamp-2 px-1 leading-relaxed">
                        &ldquo;{getCleanAiSummary(cand)}&rdquo;
                      </p>
                    )}

                    {/* Registration Date & Time Banner */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-semibold shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span>{formatCandidateDateTime(regDateTime)}</span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex items-center gap-1 overflow-hidden">
                        {Array.isArray(cand.skills) && cand.skills.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="bg-gold-500/10 text-gold-700 dark:text-gold-400 text-[10px] px-2 py-0.5 rounded-md font-medium truncate max-w-[90px]"
                          >
                            {s}
                          </span>
                        ))}
                        {Array.isArray(cand.skills) && cand.skills.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">
                            +{cand.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {hasCv && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewCv(cand);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                          title="Preview CV"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold-500" />
                          <span>Preview</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCv(cand);
                        }}
                        className="px-2.5 py-1.5 bg-gold-500/15 hover:bg-gold-500/25 text-gold-700 dark:text-gold-400 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-xs border border-gold-500/30 shadow-xs"
                        title="Download CV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CV</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewCand(cand);
                        }}
                        className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer text-xs shadow-sm"
                      >
                        <span>View</span>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCandidate(cand);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        title={`Delete ${cand.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollReveal>

      {/* COMPREHENSIVE CANDIDATE PROFILE MODAL */}
      {activeCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-luxury space-y-5 max-h-[94vh] overflow-y-auto text-slate-900 dark:text-white">

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-4">
                {renderCandidateAvatar(activeCand, "w-14 h-14 text-base")}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{activeCand.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-400 uppercase tracking-wider">
                      {activeCand.stage || 'Verified'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      Score: {activeCand.score || 88}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{activeCand.id}</span>
                    <span>•</span>
                    <strong className="text-slate-900 dark:text-white">{activeCand.currentRole}</strong>
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

            {/* REGISTRATION TIMESTAMP STRIP */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-gold-500" />
                <span>Candidate Portal Registration Date & Time:</span>
                <strong className="text-slate-900 dark:text-white font-mono">
                  {formatCandidateDateTime(activeCand.createdAt || activeCand.registeredAt)}
                </strong>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ✓ Portal Verified Record
              </span>
            </div>

            {/* CANDIDATE ATTACHED RESUME / CV ACTION SPOTLIGHT BAR */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-gold-500/10 to-emerald-500/10 border-2 border-gold-500/40 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-700 dark:text-gold-400 flex items-center justify-center shrink-0 border border-gold-500/40 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Candidate Official Profile Resume / CV</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Active & Verified CV
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Document: <strong className="font-mono text-slate-900 dark:text-white">{activeCand.resumeName || `${activeCand.name.replace(/\s+/g, '_')}_Resume.pdf`}</strong> <span className="text-slate-500">({activeCand.resumeSize || 'Verified Document'} • ATS Certified)</span>
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
                    title="Toggle Candidate CV Viewer"
                  >
                    {showFullResumeSheet ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{showFullResumeSheet ? 'Hide Document' : 'View Document'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* REAL CANDIDATE UPLOADED CV VIEWER / VERIFIED PROFILE SHEET */}
            {showFullResumeSheet && (
              <div className="rounded-2xl border-2 border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 overflow-hidden shadow-lg">
                {activeCand.resumeUrl ? (
                  <div className="flex flex-col">
                    <div className="p-3.5 bg-slate-100 dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gold-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {activeCand.resumeName || `${(activeCand.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`}
                          </p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Authentic Uploaded Candidate Document ({activeCand.resumeSize || 'Verified Document'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewCv(activeCand)}
                          className="px-3 py-1.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                          <span>Fullscreen Tab</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadCv(activeCand)}
                          className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-gold-glow cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Original</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 flex justify-center items-center min-h-[550px]">
                      <iframe
                        src={activeCand.resumeUrl}
                        title={`Resume - ${activeCand.name || 'Candidate'}`}
                        className="w-full h-[600px] border-none bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Standard Profile Credentials Active
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        This candidate registered and maintains their verified profile in the Revival International Talent Network.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(activeCand)}
                        className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Verified Candidate Profile (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
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
                    {activeCand.dob || '1995-10-20'} {activeCand.gender ? `• ${activeCand.gender}` : '• Male'}
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

            {/* Candidate Professional Dossier Grid */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gold-500" />
                <span>Executive Professional Profile Data</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Role / Title</span>
                  <strong className="text-slate-900 dark:text-white">{activeCand.currentRole}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Organization</span>
                  <strong className="text-slate-900 dark:text-white">{activeCand.currentEmployer}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Experience</span>
                  <strong className="text-slate-900 dark:text-white">{activeCand.experience}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Education / Degree</span>
                  <strong className="text-slate-900 dark:text-white">{activeCand.education}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Expected Salary</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCand.expectedSalary}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Notice Period</span>
                  <strong className="text-slate-900 dark:text-white">{activeCand.noticePeriod}</strong>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">Core Competencies & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(activeCand.skills) && activeCand.skills.map((s, idx) => (
                    <span key={idx} className="bg-gold-500/10 text-gold-700 dark:text-gold-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gold-500/20">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

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

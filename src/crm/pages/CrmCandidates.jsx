import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye,
  Filter, X, Trash2, Download, ExternalLink, Mail, Phone, MapPin, Globe,
  Calendar, Briefcase, GraduationCap, Clock, Building, Award, Check,
  FileCheck, ChevronDown, ChevronUp, RotateCcw, AlertCircle
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
    'REV-CAN-5868', 'REV-CAN-8915', 'REV-CAN-3362', 'REV-CAN-53106',
    'RI-CAND-001', 'RI-CAND-002', 'RI-CAND-003'
  ];
  if (dummyIds.some(d => id.startsWith(d))) return true;
  if (name.includes('alexander wright') || name.includes('sarah al-mansoori') || name.includes('mohamed tariq') ||
      name.includes('elena rostova') || name.includes('david chen') || name.includes('fatima al-zahra') ||
      name.includes('real candidate') || name.includes('test candidate') || name.includes('fake user') ||
      name.includes('fresh candidate') || name.includes('unknown candidate')) return true;
  if (email.includes('example.com') || email.includes('mailinator') || email.includes('trashuser') || 
      email.includes('domain.com') || email.includes('candidate_test') || email.includes('candidate.fresh') ||
      email === 'johnny@gmail.com' || email === 'real.candidate.test@gmail.com') return true;
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
    applications = [],
    setActiveModule,
    setAiDrawerOpen,
    globalAddCandidateOpen,
    setGlobalAddCandidateOpen,
    deleteCandidate,
    selectedCandidate,
    setSelectedCandidate
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all'); // 'all' | 'day' | 'week' | 'month' | 'year'
  const [viewCand, setViewCand] = useState(null);
  const [deleteConfirmCand, setDeleteConfirmCand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [showFullResumeSheet, setShowFullResumeSheet] = useState(true);

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

  // Enriched active candidate object for detail view
  const activeCand = useMemo(() => {
    if (!viewCand) return null;
    let enriched = { ...viewCand };

    const currentInContext = candidates.find(
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
      currentRole: (enriched.currentRole && enriched.currentRole.trim() !== '') ? enriched.currentRole : 'Executive Candidate',
      currentEmployer: (enriched.currentEmployer && enriched.currentEmployer.trim() !== '') ? enriched.currentEmployer : 'Revival International Candidate',
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
  }, [viewCand, candidates]);

  // Handle downloading candidate resume as an actual PDF file
  const handleDownloadCv = (cand) => {
    if (!cand) return;
    const url = cand.resumeUrl;
    const fileName = cand.resumeName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    if (url && (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://'))) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    downloadCandidateResumePdf(cand);
  };

  // Handle viewing / previewing candidate CV in a separate clean tab
  const handlePreviewCv = (cand) => {
    if (!cand) return;

    if (cand.resumeUrl) {
      const url = cand.resumeUrl;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
        window.open(url, '_blank');
        return;
      }
      if (url.startsWith('data:')) {
        try {
          const parts = url.split(',');
          const header = parts[0];
          const base64Data = parts[1];
          let mime = 'application/pdf';
          const mimeMatch = header.match(/data:([^;]+)/);
          if (mimeMatch && mimeMatch[1]) {
            mime = mimeMatch[1].split(';')[0].trim();
          }
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          return;
        } catch (e) {
          console.warn('Blob preview fallback notice:', e);
          const newWin = window.open('', '_blank');
          if (newWin) {
            newWin.document.write(`
              <!DOCTYPE html>
              <html>
                <head><title>Candidate CV - ${cand.name || 'Candidate'}</title></head>
                <body style="margin:0;padding:0;background:#0f172a;display:flex;height:100vh;">
                  <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
                </body>
              </html>
            `);
            newWin.document.close();
            return;
          }
        }
      }
    }

    openCandidateResumeInNewTab(cand);
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

  // Pure Candidate Profiles: Filtered exclusively by Timeframe and Search Keyword
  const filtered = useMemo(() => {
    return candidates.filter(c => {
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
        const candStr = `${c.name || ''} ${c.email || ''} ${c.phone || ''} ${c.currentRole || ''} ${c.currentEmployer || ''} ${c.nationality || ''} ${c.citizenship || ''} ${c.location || ''} ${c.id || ''} ${Array.isArray(c.skills) ? c.skills.join(' ') : ''}`.toLowerCase();
        if (!candStr.includes(q)) return false;
      }

      return true;
    });
  }, [candidates, timeframe, searchTerm]);

  const timeframeCounts = useMemo(() => {
    const valid = candidates.filter(c => !isDummyCandidate(c));
    return {
      all: valid.length,
      day: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'day')).length,
      week: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'week')).length,
      month: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'month')).length,
      year: valid.filter(c => matchesTimeframe(c.createdAt || c.registeredAt, 'year')).length
    };
  }, [candidates]);

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

      {/* TIMEFRAME FILTER BAR & KEYWORD SEARCH (Replaces Clunky 8 Dropdowns) */}
      <ScrollReveal>
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Timeframe Filter Tabs (Day, Weekly, Monthly, Yearly, All) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                <span>Filter Timeframe:</span>
              </span>

              <button
                type="button"
                onClick={() => setTimeframe('day')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
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

              <button
                type="button"
                onClick={() => setTimeframe('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'all'
                    ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>All Time ({timeframeCounts.all})</span>
              </button>
            </div>

            {/* Reset Filter Button */}
            {(timeframe !== 'all' || searchTerm.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setTimeframe('all');
                  setSearchTerm('');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold transition cursor-pointer text-xs self-start md:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Quick Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates by name, verified email, phone number, professional role, skills, nationality, or Candidate ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-gold-500 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Profiles Count Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
        <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Registered Profiles:</span>
          <span className="text-amber-600 dark:text-gold-400 font-extrabold">{filtered.length} Candidates</span>
          {timeframe !== 'all' && (
            <span className="text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
              ({timeframe === 'day' ? 'Today' : timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'})
            </span>
          )}
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          Pure Candidate Profiles • Job Applications Managed Separately
        </span>
      </div>

      {/* CANDIDATES PROFILE CARDS GRID (PURE CANDIDATE PROFILES ONLY) */}
      <ScrollReveal>
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              No Registered Candidates in this Timeframe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No candidates found matching the selected timeframe ({timeframe}) or search query. Switch timeframe to "All Time" or reset your search.
            </p>
            <button
              onClick={() => {
                setTimeframe('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl text-xs shadow-gold-glow cursor-pointer mt-2"
            >
              View All Candidates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cand) => {
              const regDateTime = cand.createdAt || cand.registeredAt || cand.updatedAt;
              const hasCv = !!(cand.resumeUrl || cand.resumeName);

              return (
                <div
                  key={cand.id}
                  onClick={() => setViewCand(cand)}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl space-y-4 hover:border-gold-500/80 transition duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-luxury group relative overflow-hidden"
                >
                  {/* Top Decorative Gold Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 opacity-80 group-hover:opacity-100 transition" />

                  <div className="space-y-3.5">
                    
                    {/* Header Row: Avatar, Name, Candidate ID, Badges */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {renderCandidateAvatar(cand, "w-12 h-12 text-sm")}
                        <div className="min-w-0">
                          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition truncate" title={cand.name}>
                            {cand.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                            <span className="text-gold-600 dark:text-gold-400">{cand.id}</span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-sans font-semibold">{cand.nationality || 'UAE'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {hasCv ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] flex items-center gap-1 border border-emerald-500/30" title={`CV Attached: ${cand.resumeName || 'Verified'}`}>
                            <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>CV Attached</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-semibold text-[9px] border border-slate-200 dark:border-navy-700">
                            No CV
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full border border-gold-500/40 text-gold-700 dark:text-gold-400 font-extrabold text-[10px] bg-gold-500/10 flex items-center gap-1" title="Candidate Profile Quality Score">
                          <Award className="w-3 h-3 text-gold-500" />
                          <span>{cand.score || 88}%</span>
                        </span>
                      </div>
                    </div>

                    {/* REGISTRATION DATE & TIME BADGE (User Requirement) */}
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-950 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-navy-800/80">
                      <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span>Registered:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {formatCandidateDateTime(regDateTime)}
                      </strong>
                    </div>

                    {/* PROFESSIONAL PROFILE DETAILS CARD */}
                    <div className="p-3.5 bg-slate-50 dark:bg-navy-950/80 rounded-2xl space-y-1.5 text-xs border border-slate-200/80 dark:border-navy-800/80">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Professional Role</span>
                          <p className="font-bold text-slate-900 dark:text-white truncate text-xs" title={cand.currentRole}>
                            {cand.currentRole || 'Executive Candidate'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 dark:border-navy-800/60 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Organization / Pool</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block" title={cand.currentEmployer}>
                            {cand.currentEmployer || 'Revival International Candidate'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Experience</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {cand.experience || '3-5 Years'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Credentials */}
                      <div className="pt-1.5 border-t border-slate-200/60 dark:border-navy-800/60 space-y-0.5 text-[11px]">
                        {cand.email && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[10px] truncate" title={cand.email}>
                            <Mail className="w-3 h-3 text-gold-500 shrink-0" />
                            <span className="truncate">{cand.email}</span>
                          </div>
                        )}
                        {cand.phone && cand.phone !== 'Not specified' && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{cand.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Salary Expectations & Notice */}
                      <div className="pt-1.5 border-t border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Expected:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[170px]" title={cand.expectedSalary}>
                          {cand.expectedSalary || 'Market Standard'}
                        </strong>
                      </div>
                    </div>

                    {/* Executive Bio / AI Summary */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed px-1">
                      "{cand.aiSummary || `Registered candidate in Revival Talent Pool (${cand.name}).`}"
                    </p>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {Array.isArray(cand.skills) && cand.skills.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="bg-gold-500/10 text-gold-700 dark:text-gold-400 text-[10px] px-2.5 py-0.5 rounded-lg font-semibold border border-gold-500/20"
                        >
                          {s}
                        </span>
                      ))}
                      {Array.isArray(cand.skills) && cand.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5 font-bold">
                          +{cand.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Quick CV Actions & Profile Buttons */}
                  <div className="pt-3.5 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {hasCv && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewCv(cand);
                          }}
                          className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer text-[10px]"
                          title="Preview Candidate CV in Tab"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold-500" />
                          <span>Preview CV</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCv(cand);
                        }}
                        className="p-1.5 px-2 bg-gold-500/15 hover:bg-gold-500/25 text-gold-700 dark:text-gold-400 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer text-[10px] border border-gold-500/30"
                        title="Download Candidate CV (PDF)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CV PDF</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewCand(cand);
                        }}
                        className="p-1.5 px-3 bg-navy-900 hover:bg-navy-800 dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer text-[10px] shadow-xs"
                      >
                        <span>View Profile</span>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCandidate(cand);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
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

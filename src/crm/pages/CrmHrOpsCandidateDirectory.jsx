import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  CalendarPlus,
  StickyNote,
  History,
  Layers,
  UserCheck,
  ShieldAlert,
  X,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import {
  formatDateTime,
  getInitials,
  getStatusBadgeClass,
  getPriorityBadgeClass
} from '../components/hrCandidate/hrCandidateUtils';
import { HrEnquiryDetailModal } from '../components/hrCandidate/HrEnquiryDetailModal';
import {
  EditCandidateModal,
  UpdateEnquiryStatusModal,
  ScheduleFollowUpModal,
  AddInternalNoteModal,
  CompleteFollowUpModal
} from '../components/hrCandidate/HrCandidateModals';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'enquiries', label: 'All Enquiries', icon: FileText },
  { id: 'followups', label: 'Follow-ups', icon: Calendar },
  { id: 'timeline', label: 'Activity History', icon: History }
];

const getTimelineIconStyle = (eventType) => {
  switch (eventType) {
    case 'ENQUIRY_SUBMITTED':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30';
    case 'ENQUIRY_ASSIGNED':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30';
    case 'STATUS_CHANGED':
      return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30';
    case 'PRIORITY_CHANGED':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30';
    case 'FOLLOW_UP':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
    case 'FOLLOW_UP_COMPLETED':
    case 'ENQUIRY_RESOLVED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
    case 'ENQUIRY_REOPENED':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15';
  }
};

const InfoItem = ({ icon: Icon, label, value }) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </div>
        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5 break-words">
          {value}
        </div>
      </div>
    </div>
  );
};

export const CrmHrOpsCandidateDirectory = () => {
  const { crmToken, setCrmToken, currentRole, authTokenLoading, logout } = useCrm();

  // Directory state (preserved across opening & returning from candidate profile)
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [directoryRows, setDirectoryRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalCount: 0, totalPages: 1 });
  const [dirLoading, setDirLoading] = useState(true);
  const [dirError, setDirError] = useState('');
  const [dirErrorCode, setDirErrorCode] = useState(null);

  // Selected candidate profile state
  const [selectedCandidateKey, setSelectedCandidateKey] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('candidateKey') || '';
    } catch {
      return '';
    }
  });
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileErrorCode, setProfileErrorCode] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timelineOrder, setTimelineOrder] = useState('asc'); // 'asc' chronological | 'desc' newest first

  // Modals & action feedback
  const [feedback, setFeedback] = useState(null);
  const [actionSaving, setActionSaving] = useState(false);
  const [detailEnquiry, setDetailEnquiry] = useState(null);
  const [editCandidateOpen, setEditCandidateOpen] = useState(false);
  const [statusModalEnquiry, setStatusModalEnquiry] = useState(null);
  const [followUpModalState, setFollowUpModalState] = useState({ open: false, enquiryId: '' });
  const [noteModalState, setNoteModalState] = useState({ open: false, enquiryId: '' });
  const [completeFollowUpTarget, setCompleteFollowUpTarget] = useState(null);

  // Debounce directory search and reset to page 1 cleanly outside any state updater
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  const fetchDirectory = useCallback(async () => {
    if (authTokenLoading) {
      setDirLoading(true);
      setDirError('');
      setDirErrorCode(null);
      return;
    }

    let activeToken = crmToken;
    if (!activeToken) {
      try {
        const tokRes = await fetch('/api/crm/auth/preview-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRole: 'HR Operations' })
        });
        if (tokRes.ok) {
          const tokData = await tokRes.json();
          if (tokData?.success && tokData.token) {
            activeToken = tokData.token;
            setCrmToken?.(tokData.token);
            try {
              const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
              if (cur && cur.isAuthenticated) {
                localStorage.setItem('sir_crm_session', JSON.stringify({ ...cur, crmToken: tokData.token }));
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    if (!activeToken) {
      setDirLoading(false);
      setDirErrorCode(401);
      setDirError('Your CRM session needs re-authentication. Please sign in again to access Candidate Directory.');
      return;
    }

    setDirLoading(true);
    setDirError('');
    setDirErrorCode(null);
    try {
      const qs = new URLSearchParams({
        search: debouncedSearch,
        page: String(currentPage),
        limit: String(pageSize)
      });
      const res = await fetch(`/api/hr-ops/candidates?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDirErrorCode(res.status);
        throw new Error(json.message || 'Unable to fetch candidate directory.');
      }
      setDirectoryRows(json.data?.candidates || []);
      setPagination(json.data?.pagination || { page: currentPage, limit: pageSize, totalCount: 0, totalPages: 1 });
    } catch (err) {
      setDirError(err.message || 'Failed to load candidate directory.');
      setDirectoryRows([]);
    } finally {
      setDirLoading(false);
    }
  }, [crmToken, setCrmToken, authTokenLoading, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const fetchCandidateProfile = useCallback(async (candidateKey, { resetTab = false } = {}) => {
    if (!candidateKey) return;
    if (authTokenLoading) {
      setProfileLoading(true);
      setProfileError('');
      setProfileErrorCode(null);
      return;
    }

    let activeToken = crmToken;
    if (!activeToken) {
      try {
        const tokRes = await fetch('/api/crm/auth/preview-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRole: 'HR Operations' })
        });
        if (tokRes.ok) {
          const tokData = await tokRes.json();
          if (tokData?.success && tokData.token) {
            activeToken = tokData.token;
            setCrmToken?.(tokData.token);
            try {
              const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
              if (cur && cur.isAuthenticated) {
                localStorage.setItem('sir_crm_session', JSON.stringify({ ...cur, crmToken: tokData.token }));
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    if (!activeToken) {
      setProfileLoading(false);
      setProfileErrorCode(401);
      setProfileError('Your CRM session needs re-authentication. Please sign in again to view this candidate.');
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    setProfileErrorCode(null);
    if (resetTab) setActiveTab('overview');
    try {
      const res = await fetch(`/api/hr-ops/candidates/${encodeURIComponent(candidateKey)}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setProfileErrorCode(res.status);
        throw new Error(json.message || 'Unable to load candidate profile.');
      }
      setProfileData(json.data);
      // Keep detail modal synchronized if open
      setDetailEnquiry((prev) => {
        if (!prev) return null;
        return json.data?.enquiries?.find((e) => e.id === prev.id) || prev;
      });
    } catch (err) {
      setProfileError(err.message || 'Failed to fetch candidate details.');
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  }, [crmToken, setCrmToken, authTokenLoading]);

  useEffect(() => {
    if (selectedCandidateKey) {
      fetchCandidateProfile(selectedCandidateKey, { resetTab: false });
    }
  }, [selectedCandidateKey, fetchCandidateProfile]);

  const handleOpenCandidate = (candidateKey) => {
    setSelectedCandidateKey(candidateKey);
    setActiveTab('overview');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('candidateKey', candidateKey);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore history errors
    }
  };

  const handleBackToDirectory = () => {
    setSelectedCandidateKey('');
    setProfileData(null);
    setProfileError('');
    setProfileErrorCode(null);
    setDetailEnquiry(null);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('candidateKey')) {
        url.searchParams.delete('candidateKey');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Ignore history errors
    }
    fetchDirectory();
  };

  const runProfileMutation = async (url, method, body, successMessage, onSuccessClose) => {
    if (!crmToken) {
      setFeedback({ type: 'error', text: 'Your CRM session has expired. Please sign in again to save changes.' });
      return;
    }
    setActionSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Operation failed.');
      }
      if (json.data?.candidate) {
        setProfileData(json.data);
        setDetailEnquiry((prev) => (prev ? json.data.enquiries?.find((e) => e.id === prev.id) || null : null));
        if (json.data.candidate.candidateKey && json.data.candidate.candidateKey !== selectedCandidateKey) {
          const nextKey = json.data.candidate.candidateKey;
          setSelectedCandidateKey(nextKey);
          try {
            const urlObj = new URL(window.location.href);
            urlObj.searchParams.set('candidateKey', nextKey);
            window.history.replaceState({}, '', urlObj.toString());
          } catch {
            // Ignore history errors
          }
        }
      } else if (selectedCandidateKey) {
        await fetchCandidateProfile(selectedCandidateKey);
      }
      if (onSuccessClose) onSuccessClose();
      setFeedback({ type: 'success', text: successMessage || json.message || 'Updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setActionSaving(false);
    }
  };

  const orderedTimeline = useMemo(() => {
    const items = profileData?.timeline || [];
    return timelineOrder === 'asc' ? items : [...items].reverse();
  }, [profileData, timelineOrder]);

  if (currentRole && currentRole !== 'HR Operations') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Restricted Access</h2>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              This Candidate Directory portal is restricted to authorized HR Operations employees.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: COMPLETE CANDIDATE PROFILE PAGE
  // =========================================================================
  if (selectedCandidateKey) {
    const cand = profileData?.candidate;
    const summary = profileData?.summary || {};
    const enquiries = profileData?.enquiries || [];
    const followUps = profileData?.followUps || [];
    const notes = profileData?.notes || [];
    const hasEditableEnquiry = enquiries.some((e) => e.canEditThisEnquiry);

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        {/* Top Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBackToDirectory}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Candidates
          </button>

          {cand && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fetchCandidateProfile(selectedCandidateKey)}
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${profileLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setEditCandidateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Candidate Info
              </button>
            </div>
          )}
        </div>

        {/* Action Feedback Toast */}
        {feedback && (
          <div
            role="status"
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="p-1 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {profileLoading && !profileData && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 rounded bg-slate-200 dark:bg-white/10" />
                <div className="h-4 w-36 rounded bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
              ))}
            </div>
          </div>
        )}

        {/* Error / Unauthorized State */}
        {profileError && !profileLoading && (
          <div className="bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {profileErrorCode === 403 ? 'Access Restricted' : profileErrorCode === 401 ? 'Session Authentication Required' : 'Candidate Profile Unavailable'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{profileError}</p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              {profileErrorCode === 401 && (
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
                >
                  Sign In Again
                </button>
              )}
              <button
                type="button"
                onClick={handleBackToDirectory}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Return to Candidate Directory
              </button>
              {profileErrorCode !== 403 && profileErrorCode !== 401 && (
                <button
                  type="button"
                  onClick={() => fetchCandidateProfile(selectedCandidateKey)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loaded Profile */}
        {cand && (
          <>
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {cand.avatar ? (
                    <img
                      src={cand.avatar}
                      alt={cand.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-white/15 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-navy-800 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(cand.fullName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                        {cand.fullName}
                      </h1>
                      {cand.status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(cand.status)}`}>
                          {cand.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                        Ref: {cand.candidateReferenceNumber}
                      </span>
                      {cand.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> {cand.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{summary.totalEnquiries ?? enquiries.length}</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Enquiries</div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20 text-center">
                    <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{summary.activeEnquiries ?? 0}</div>
                    <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Active</div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 text-center">
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{summary.completedEnquiries ?? 0}</div>
                    <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Resolved</div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 text-center">
                    <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{summary.pendingFollowUps ?? 0}</div>
                    <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Follow-ups</div>
                  </div>
                </div>
              </div>

              {/* Essential Candidate Fields (DB-backed, conditionally rendered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <InfoItem icon={Users} label="Full Name" value={cand.fullName} />
                <InfoItem icon={FileText} label="Candidate Reference Number" value={cand.candidateReferenceNumber} />
                <InfoItem icon={Mail} label="Email Address" value={cand.email} />
                <InfoItem icon={Phone} label="Phone Number" value={cand.phone} />
                <InfoItem icon={MapPin} label="Location" value={cand.location} />
                <InfoItem icon={Calendar} label="Registration Date" value={formatDateTime(cand.registrationDate, false)} />
                <InfoItem icon={Clock} label="Latest Enquiry Date" value={formatDateTime(cand.latestEnquiryDate)} />
                <InfoItem icon={CheckCircle2} label="Candidate Status" value={cand.status} />
              </div>
            </div>

            {/* Section Tabs */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 pt-3 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
                <div className="flex items-center gap-1" role="tablist">
                  {PROFILE_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const badgeCount =
                      tab.id === 'enquiries'
                        ? enquiries.length
                        : tab.id === 'followups'
                          ? followUps.length
                          : tab.id === 'timeline'
                            ? orderedTimeline.length
                            : null;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                          isActive
                            ? 'border-indigo-600 text-indigo-600 dark:border-amber-400 dark:text-amber-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {badgeCount !== null && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasEditableEnquiry && (
                  <div className="hidden md:flex items-center gap-2 pb-2">
                    <button
                      type="button"
                      onClick={() => setFollowUpModalState({ open: true, enquiryId: '' })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Schedule Follow-up
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteModalState({ open: true, enquiryId: '' })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                    >
                      <StickyNote className="w-3.5 h-3.5" /> Add Note
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Optional Extended Candidate Attributes (Only shown when stored in DB) */}
                    {(cand.currentRole || cand.currentEmployer || cand.experience || cand.education || cand.source || cand.skills) && (
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                          Additional Candidate Background
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <InfoItem icon={UserCheck} label="Current Role" value={cand.currentRole} />
                          <InfoItem icon={Layers} label="Current Employer" value={cand.currentEmployer} />
                          <InfoItem icon={Clock} label="Experience" value={cand.experience} />
                          <InfoItem icon={FileText} label="Education" value={cand.education} />
                          <InfoItem icon={Layers} label="Registration Source" value={cand.source} />
                          <InfoItem icon={FileText} label="Skills" value={cand.skills?.join(', ')} />
                        </div>
                      </div>
                    )}

                    {/* Quick Action Bar for Mobile */}
                    {hasEditableEnquiry && (
                      <div className="flex flex-wrap gap-2 md:hidden">
                        <button
                          type="button"
                          onClick={() => setFollowUpModalState({ open: true, enquiryId: '' })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" /> Schedule Follow-up
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteModalState({ open: true, enquiryId: '' })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white dark:bg-white/10"
                        >
                          <StickyNote className="w-3.5 h-3.5" /> Add Note
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Recent Associated Enquiries Snapshot */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Recent Associated Enquiries
                          </h2>
                          {enquiries.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('enquiries')}
                              className="text-xs font-semibold text-indigo-600 dark:text-amber-400 hover:underline"
                            >
                              View All ({enquiries.length})
                            </button>
                          )}
                        </div>
                        {enquiries.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400">No enquiries recorded.</p>
                        ) : (
                          enquiries.slice(0, 3).map((enq) => (
                            <div
                              key={enq.id}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                      {enq.referenceNumber || enq.id}
                                    </span>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(enq.status)}`}>
                                      {enq.status}
                                    </span>
                                    {enq.priority && (
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(enq.priority)}`}>
                                        {enq.priority}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {enq.serviceTitle}
                                  </div>
                                  {(enq.courseName || enq.department) && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {[enq.department, enq.courseName].filter(Boolean).join(' • ')}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDetailEnquiry(enq)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 shrink-0"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>
                              </div>
                              {enq.assignmentNotes && (
                                <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-lg px-2.5 py-1.5">
                                  <span className="font-semibold">HR Lead Note:</span> {enq.assignmentNotes}
                                </div>
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                <span>Assigned: <strong className="text-slate-700 dark:text-slate-200">{enq.assignedEmployee}</strong></span>
                                <span>{formatDateTime(enq.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Pending Follow-ups & Recent Timeline Snapshot */}
                      <div className="space-y-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Upcoming & Recent Follow-ups
                            </h2>
                            <button
                              type="button"
                              onClick={() => setActiveTab('followups')}
                              className="text-xs font-semibold text-indigo-600 dark:text-amber-400 hover:underline"
                            >
                              Manage ({followUps.length})
                            </button>
                          </div>
                          {followUps.length === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                              No follow-ups scheduled for this candidate yet.
                            </div>
                          ) : (
                            followUps.slice(0, 3).map((fu) => (
                              <div
                                key={fu.id}
                                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{fu.title}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {fu.purpose} • {formatDateTime(fu.dueDateTime)} • {fu.enquiryReference}
                                  </div>
                                </div>
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${getStatusBadgeClass(fu.status)}`}>
                                  {fu.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Latest Activity
                            </h2>
                            <button
                              type="button"
                              onClick={() => setActiveTab('timeline')}
                              className="text-xs font-semibold text-indigo-600 dark:text-amber-400 hover:underline"
                            >
                              Full Timeline ({orderedTimeline.length})
                            </button>
                          </div>
                          {profileData.timeline?.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">No recorded activity yet.</p>
                          ) : (
                            [...profileData.timeline].reverse().slice(0, 4).map((evt) => (
                              <div
                                key={evt.id}
                                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{evt.title}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{evt.description}</div>
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                                  {formatDateTime(evt.timestamp)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ALL ASSOCIATED ENQUIRIES */}
                {activeTab === 'enquiries' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          All Associated Enquiries ({enquiries.length})
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Every historical and newly assigned enquiry linked to {cand.fullName}
                        </p>
                      </div>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                        No enquiries associated with this candidate.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enquiries.map((enq) => (
                          <div
                            key={enq.id}
                            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30">
                                    {enq.referenceNumber || enq.id}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(enq.status)}`}>
                                    {enq.status}
                                  </span>
                                  {enq.priority && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(enq.priority)}`}>
                                      {enq.priority} Priority
                                    </span>
                                  )}
                                  {enq.isAssignedToMe && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                                      Assigned to You
                                    </span>
                                  )}
                                  {!enq.canEditThisEnquiry && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10">
                                      <Lock className="w-3 h-3" /> View Only
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                  {enq.serviceTitle || 'Enquiry'}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                                  {enq.category && <span>Category: <strong>{enq.category}</strong></span>}
                                  {enq.enquiryType && <span>Type: <strong>{enq.enquiryType}</strong></span>}
                                  {enq.courseName && <span>Course: <strong>{enq.courseName}</strong></span>}
                                  {enq.department && <span>Department: <strong>{enq.department}</strong></span>}
                                  {enq.examDetails && <span>Exam: <strong>{enq.examDetails}</strong></span>}
                                  {enq.collegeName && <span>College: <strong>{enq.collegeName}</strong></span>}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setDetailEnquiry(enq)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>
                                {enq.canEditThisEnquiry && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setStatusModalEnquiry(enq)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" /> Update Status
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFollowUpModalState({ open: true, enquiryId: enq.id })}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                                    >
                                      <CalendarPlus className="w-3.5 h-3.5" /> Follow-up
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setNoteModalState({ open: true, enquiryId: enq.id })}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20"
                                    >
                                      <StickyNote className="w-3.5 h-3.5" /> Add Note
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {enq.message && (
                              <p className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 whitespace-pre-wrap">
                                {enq.message}
                              </p>
                            )}

                            {enq.assignmentNotes && (
                              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-100">
                                <span className="font-bold uppercase tracking-wider mr-1.5">HR Lead Instructions:</span>
                                {enq.assignmentNotes}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                              <div>
                                Assigned Specialist: <span className="font-semibold text-slate-800 dark:text-slate-200">{enq.assignedEmployee}</span>
                              </div>
                              <div>
                                Submitted: <span className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(enq.createdAt)}</span>
                              </div>
                              <div>
                                Follow-ups: <span className="font-medium text-slate-700 dark:text-slate-200">{enq.followUps?.length || 0}</span>
                                {enq.nextActionDate && ` (Next: ${formatDateTime(enq.nextActionDate)})`}
                              </div>
                              <div>
                                {enq.completedAt ? (
                                  <>Resolved: <span className="font-medium text-emerald-700 dark:text-emerald-300">{formatDateTime(enq.completedAt)}</span></>
                                ) : (
                                  <>Last Updated: <span className="font-medium text-slate-700 dark:text-slate-200">{formatDateTime(enq.updatedAt)}</span></>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: FOLLOW-UPS & INTERNAL NOTES */}
                {activeTab === 'followups' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Scheduled Follow-ups ({followUps.length})
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Manage and complete follow-ups linked to this candidate's enquiries
                          </p>
                        </div>
                        {hasEditableEnquiry && (
                          <button
                            type="button"
                            onClick={() => setFollowUpModalState({ open: true, enquiryId: '' })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" /> Schedule Follow-up
                          </button>
                        )}
                      </div>

                      {followUps.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                          No follow-ups scheduled for this candidate yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {followUps.map((fu) => (
                            <div
                              key={fu.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                    {fu.enquiryReference}
                                  </span>
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(fu.status)}`}>
                                    {fu.status}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{fu.purpose}</span>
                                </div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{fu.title}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Due: {formatDateTime(fu.dueDateTime)} • Assigned to: {fu.assignedTo || 'HR Operations'}
                                </div>
                                {fu.completionNotes && (
                                  <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                    Outcome Note: {fu.completionNotes}
                                  </div>
                                )}
                              </div>
                              {fu.canModify && fu.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => setCompleteFollowUpTarget(fu)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shrink-0 self-start sm:self-center"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Update Outcome
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Internal Notes History */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Internal Notes ({notes.length})
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Persistent HR team observations and documentation remarks
                          </p>
                        </div>
                        {hasEditableEnquiry && (
                          <button
                            type="button"
                            onClick={() => setNoteModalState({ open: true, enquiryId: '' })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20"
                          >
                            <StickyNote className="w-3.5 h-3.5" /> Add Note
                          </button>
                        )}
                      </div>

                      {notes.length === 0 ? (
                        <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                          No internal notes added yet.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {notes.map((n) => (
                            <div
                              key={n.id}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                  {n.enquiryReference} • {n.serviceTitle}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {n.createdBy} • {formatDateTime(n.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{n.note}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: CHRONOLOGICAL ACTIVITY HISTORY */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Activity History ({orderedTimeline.length})
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Chronological audit trail of genuine enquiry submissions, assignments, status changes, notes, and follow-ups
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTimelineOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/20"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {timelineOrder === 'asc' ? 'Oldest First (Chronological)' : 'Newest First'}
                      </button>
                    </div>

                    {orderedTimeline.length === 0 ? (
                      <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
                        No chronological activity recorded for this candidate yet.
                      </div>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                        {orderedTimeline.map((evt) => (
                          <div key={evt.id} className="relative">
                            <span
                              className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center ${getTimelineIconStyle(evt.eventType)}`}
                            >
                              <Clock className="w-3 h-3" />
                            </span>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{evt.title}</span>
                                  {evt.enquiryReference && (
                                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                      {evt.enquiryReference}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {formatDateTime(evt.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                {evt.description}
                              </p>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                                Actor: <span className="font-semibold text-slate-600 dark:text-slate-300">{evt.actorName || 'System'}</span>
                                {evt.actorRole ? ` (${evt.actorRole})` : ''}
                                {evt.serviceTitle ? ` • ${evt.serviceTitle}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Complete Enquiry Details Modal */}
        <HrEnquiryDetailModal
          enquiry={detailEnquiry}
          candidateName={cand?.fullName}
          onClose={() => setDetailEnquiry(null)}
          onUpdateStatus={(eq) => setStatusModalEnquiry(eq)}
          onAddNote={(eq) => setNoteModalState({ open: true, enquiryId: eq.id })}
          onScheduleFollowUp={(eq) => setFollowUpModalState({ open: true, enquiryId: eq.id })}
        />

        {/* Permitted Employee Action Modals */}
        <EditCandidateModal
          open={editCandidateOpen}
          candidate={cand}
          saving={actionSaving}
          onClose={() => setEditCandidateOpen(false)}
          onSave={(payload) =>
            runProfileMutation(
              `/api/hr-ops/candidates/${encodeURIComponent(cand.candidateKey)}`,
              'PATCH',
              payload,
              'Candidate information updated successfully.',
              () => setEditCandidateOpen(false)
            )
          }
        />

        <UpdateEnquiryStatusModal
          open={Boolean(statusModalEnquiry)}
          enquiry={statusModalEnquiry}
          saving={actionSaving}
          onClose={() => setStatusModalEnquiry(null)}
          onSave={(enqId, payload) =>
            runProfileMutation(
              `/api/hr-ops/enquiries/${encodeURIComponent(enqId)}/status`,
              'PATCH',
              payload,
              'Enquiry status updated successfully.',
              () => setStatusModalEnquiry(null)
            )
          }
        />

        <ScheduleFollowUpModal
          open={followUpModalState.open}
          enquiries={enquiries}
          preselectedEnquiryId={followUpModalState.enquiryId}
          saving={actionSaving}
          onClose={() => setFollowUpModalState({ open: false, enquiryId: '' })}
          onSave={(enqId, payload) =>
            runProfileMutation(
              `/api/hr-ops/enquiries/${encodeURIComponent(enqId)}/follow-ups`,
              'POST',
              payload,
              'Follow-up scheduled successfully.',
              () => setFollowUpModalState({ open: false, enquiryId: '' })
            )
          }
        />

        <AddInternalNoteModal
          open={noteModalState.open}
          enquiries={enquiries}
          preselectedEnquiryId={noteModalState.enquiryId}
          saving={actionSaving}
          onClose={() => setNoteModalState({ open: false, enquiryId: '' })}
          onSave={(enqId, payload) =>
            runProfileMutation(
              `/api/hr-ops/enquiries/${encodeURIComponent(enqId)}/notes`,
              'POST',
              payload,
              'Internal note saved.',
              () => setNoteModalState({ open: false, enquiryId: '' })
            )
          }
        />

        <CompleteFollowUpModal
          open={Boolean(completeFollowUpTarget)}
          followUp={completeFollowUpTarget}
          saving={actionSaving}
          onClose={() => setCompleteFollowUpTarget(null)}
          onSave={(fuId, payload) =>
            runProfileMutation(
              `/api/hr-ops/follow-ups/${encodeURIComponent(fuId)}`,
              'PATCH',
              payload,
              'Follow-up updated successfully.',
              () => setCompleteFollowUpTarget(null)
            )
          }
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW A: MINIMAL TWO-COLUMN CANDIDATE DIRECTORY
  // =========================================================================
  const totalCount = pagination.totalCount || 0;
  const totalPages = pagination.totalPages || 1;
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Candidate Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select a candidate to view complete profile details, associated enquiries, follow-ups, and activity history.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDirectory}
          disabled={dirLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dirLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search & Controls Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by candidate name or reference number..."
            aria-label="Search candidates by name or reference number"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-navy-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setCurrentPage(1);
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <label htmlFor="hr-cand-page-size" className="font-medium">
            Rows per page:
          </label>
          <select
            id="hr-cand-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {dirError && !dirLoading && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                {dirErrorCode === 401 ? 'Session Authentication Required' : 'Unable to Load Candidate Directory'}
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">{dirError}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(dirErrorCode === 401 || !crmToken) && (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                Sign In Again
              </button>
            )}
            <button
              type="button"
              onClick={fetchDirectory}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-navy-900 text-rose-700 dark:text-rose-200 hover:bg-rose-100/60 dark:hover:bg-rose-500/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Two-Column Directory Table (ONLY Candidate Name & Candidate Reference Number) */}
      {!dirError && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Candidate Directory">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03]">
                  <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Candidate Name
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Candidate Reference Number
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {dirLoading && (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4">
                          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-white/10" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-white/10" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {!dirLoading && directoryRows.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                          {debouncedSearch ? 'No matching candidates found' : 'No assigned candidates yet'}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {debouncedSearch
                            ? `No authorized candidate matched "${debouncedSearch}". Try a different name or reference number.`
                            : 'Candidates will appear here once enquiries are assigned to your HR Operations profile.'}
                        </p>
                        {debouncedSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchInput('');
                              setCurrentPage(1);
                            }}
                            className="mt-2 inline-flex px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!dirLoading &&
                  directoryRows.map((row) => (
                    <tr
                      key={row.candidateKey}
                      onClick={() => handleOpenCandidate(row.candidateKey)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenCandidate(row.candidateKey);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View profile for ${row.fullName} (${row.candidateReferenceNumber})`}
                      className="cursor-pointer transition-colors hover:bg-indigo-50/60 dark:hover:bg-white/[0.04] focus:outline-none focus:bg-indigo-50 dark:focus:bg-white/[0.06]"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {row.fullName}
                      </td>
                      <td className="px-5 py-4 text-sm font-mono font-medium text-indigo-700 dark:text-amber-300">
                        {row.candidateReferenceNumber}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!dirLoading && totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startEntry}</span>–
                <span className="font-semibold text-slate-800 dark:text-slate-200">{endEntry}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> unique candidate
                {totalCount === 1 ? '' : 's'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/15 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/15 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


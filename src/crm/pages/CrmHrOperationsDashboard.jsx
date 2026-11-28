import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Globe,
  Inbox,
  ListTodo,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Timer,
  UserCheck,
  X
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { SharedAnnouncementCalendar } from '../components/SharedAnnouncementCalendar';

const COMPANY_TIMEZONE = 'Asia/Kolkata';

const FALLBACK_STATUS_OPTIONS = [
  'Assigned',
  'Pending',
  'In Progress',
  'Contacted',
  'Awaiting Response',
  'Follow-up Required',
  'Completed'
];

const formatDateShort = (raw) => {
  if (!raw) return '—';
  const normalized =
    typeof raw === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(raw.trim())
      ? `${raw.trim().replace(' ', 'T')}Z`
      : raw;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return String(raw);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: COMPANY_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
};

const formatDateTimeShort = (raw) => {
  if (!raw) return '—';
  const str = String(raw).trim();
  // Local datetime-local input without offset (YYYY-MM-DDTHH:mm)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    const [datePart, timePart] = str.split('T');
    const [y, m, day] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${String(day).padStart(2, '0')} ${months[m - 1] || ''} ${y}, ${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
  }
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)
    ? `${str.replace(' ', 'T')}Z`
    : str;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return str;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: COMPANY_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
};

const getEnquiryStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
    case 'Converted':
    case 'Closed / Won':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
    case 'In Progress':
    case 'Processing':
    case 'Contacted':
    case 'Follow-up Required':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
    case 'Assigned':
    case 'Pending':
    case 'Awaiting Response':
    case 'New':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
    case 'Cancelled':
    case 'Closed / Lost':
    case 'Archived':
    case 'Rejected':
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getAttendanceBadgeClass = (status) => {
  switch (status) {
    case 'Present':
    case 'In Progress':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
    case 'Late':
    case 'Missing Checkout':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
    case 'Absent':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
    case 'On Leave':
    case 'Holiday':
    case 'Weekly Off':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getAnnouncementCategoryBadgeClass = (category) => {
  switch (category) {
    case 'HR Policy':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    case 'Holiday':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'Important Update':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'Emergency Alert':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    case 'Welfare & Benefits':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30';
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

const getFollowUpBucketBadge = (bucket) => {
  switch (bucket) {
    case 'overdue':
      return {
        label: 'Overdue',
        classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
      };
    case 'today':
      return {
        label: 'Due Today',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
      };
    case 'completed':
      return {
        label: 'Completed',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
      };
    default:
      return {
        label: 'Upcoming',
        classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
      };
  }
};

const CrmHrOperationsDashboard = ({ initialSection } = {}) => {
  const {
    crmToken,
    setCrmToken,
    authTokenLoading,
    currentRole,
    currentEmployee,
    user: crmUser,
    switchRole,
    setActiveModule,
    logout
  } = useCrm();
  const user = crmUser || currentEmployee || null;

  const workspaceRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [mutatingId, setMutatingId] = useState(null);

  // Determine whether this view is the dedicated "My Assigned Enquiries" page or "Company Announcements" page
  const isEnquiriesPage = initialSection === 'tasks' || initialSection === 'hr-tasks' || initialSection === 'enquiries';
  const isAnnouncementsPage = initialSection === 'announcements' || initialSection === 'hr-announcements';

  // Interactive workspace tabs & filters
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'followups'

  useEffect(() => {
    if (initialSection === 'enquiries' || initialSection === 'hr-tasks' || initialSection === 'tasks') {
      setActiveTab('enquiries');
    }
  }, [initialSection]);
  const [enquiryQuickFilter, setEnquiryQuickFilter] = useState('all'); // 'all' | 'pending' | 'completed-month' | 'completed'
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [followUpBucketFilter, setFollowUpBucketFilter] = useState('all'); // 'all' | 'today' | 'overdue' | 'upcoming' | 'completed'
  const [taskFilter, setTaskFilter] = useState('pending'); // 'pending' | 'completed' | 'all'

  // Modals for enquiry status update & follow-up scheduling
  const [statusModalEnquiry, setStatusModalEnquiry] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'In Progress', resolutionNotes: '', nextAction: '', nextActionDate: '' });
  const [followUpModalEnquiry, setFollowUpModalEnquiry] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({ title: '', purpose: 'Call', dueDateTime: '' });
  const [savingModal, setSavingModal] = useState(false);

  // Company Announcements State (Published by HR Lead)
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [calendarAnnouncements, setCalendarAnnouncements] = useState([]);
  const [showAnnouncementCalendar, setShowAnnouncementCalendar] = useState(false);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState('all');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState(null);

  const isHrOpsSession = currentRole === 'HR Operations' || currentRole === 'HR Lead' || currentRole === 'Super Admin' || currentRole === 'Admin';

  const fetchDashboardSummary = useCallback(async (isManualRefresh = false) => {
    if (!isHrOpsSession) {
      setLoading(false);
      setErrorState({
        code: 'ROLE_PREVIEW',
        message: 'You are viewing the HR Operations Dashboard from another active role session. Switch your active preview role to HR Operations to load employee-scoped records.'
      });
      return;
    }
    if (authTokenLoading) return;

    let activeToken = crmToken;
    if (!activeToken) {
      try {
        setLoading(true);
        const tokRes = await fetch('/api/crm/auth/preview-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetRole: currentRole || 'HR Operations',
            targetEmail: user?.email,
            employeeId: user?.employeeId || user?.id
          })
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
            } catch (_) { }
          }
        }
      } catch (_) { }
    }

    if (!activeToken) {
      setLoading(false);
      setErrorState({
        code: 401,
        message: 'Your authenticated CRM session token is unavailable or has expired. Please sign in again to load your dashboard.'
      });
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading((prev) => (dashboard ? false : prev));
    setErrorState(null);

    try {
      const res = await fetch('/api/hr-ops/dashboard/summary', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${activeToken}`
        }
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setErrorState({
          code: 401,
          message: json.message || 'Your session has expired. Please sign in again.'
        });
        return;
      }
      if (res.status === 403) {
        // If 403 occurs (e.g. holding a non-HR Operations session token),
        // seamlessly request an HR Operations token and re-fetch!
        try {
          const tokRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Operations',
              targetEmail: user?.email,
              employeeId: user?.employeeId || user?.id
            })
          });
          if (tokRes.ok) {
            const tokData = await tokRes.json();
            if (tokData?.success && tokData.token) {
              setCrmToken?.(tokData.token);
              try {
                const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                if (cur && cur.isAuthenticated) {
                  localStorage.setItem('sir_crm_session', JSON.stringify({ ...cur, crmToken: tokData.token }));
                }
              } catch (_) { }
              const retryRes = await fetch('/api/hr-ops/dashboard/summary', {
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                  Authorization: `Bearer ${tokData.token}`
                }
              });
              const retryJson = await retryRes.json().catch(() => ({}));
              if (retryRes.ok && retryJson.success && retryJson.data) {
                setDashboard(retryJson.data);
                return;
              }
            }
          }
        } catch (_) { }

        setErrorState({
          code: 403,
          message: json.message || 'Access denied: Only active HR Operations employees can view this dashboard.'
        });
        return;
      }
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || 'Unable to load Daily Operations Dashboard.');
      }

      // Self-heal if a cached crmToken belongs to a different employee than the logged-in user (e.g. Balavarshini vs Fatima)
      const returnedEmail = String(json.data?.employee?.email || '').toLowerCase().trim();
      const loggedEmail = String(user?.email || '').toLowerCase().trim();
      if (loggedEmail && returnedEmail && returnedEmail !== loggedEmail) {
        try {
          const healTokRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Operations',
              targetEmail: user.email,
              employeeId: user.employeeId || user.id
            })
          });
          if (healTokRes.ok) {
            const healTokData = await healTokRes.json();
            if (healTokData?.success && healTokData.token) {
              setCrmToken?.(healTokData.token);
              try {
                const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                if (cur && cur.isAuthenticated) {
                  localStorage.setItem('sir_crm_session', JSON.stringify({ ...cur, crmToken: healTokData.token }));
                }
              } catch (_) { }
              const healRes = await fetch('/api/hr-ops/dashboard/summary', {
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                  Authorization: `Bearer ${healTokData.token}`
                }
              });
              const healJson = await healRes.json().catch(() => ({}));
              if (healRes.ok && healJson.success && healJson.data) {
                setDashboard(healJson.data);
                return;
              }
            }
          }
        } catch (_) { }
      }

      setDashboard(json.data);
    } catch (err) {
      setErrorState({
        code: 500,
        message: err.message || 'Failed to load Daily Operations Dashboard.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authTokenLoading, crmToken, isHrOpsSession]);

  // Auto-sync dashboard summary (shift & task assignments) on broadcast, focus, and 15s interval
  useEffect(() => {
    if (!isHrOpsSession) return undefined;
    const handleSync = () => fetchDashboardSummary(false);
    const onStorage = (e) => {
      if (
        e.key === 'sir_shifts_updated_at' ||
        e.key === 'sir_tasks_updated_at' ||
        e.key === 'sir_attendance_updated_at'
      ) {
        handleSync();
      }
    };
    window.addEventListener('sir-shifts-updated', handleSync);
    window.addEventListener('sir-tasks-updated', handleSync);
    window.addEventListener('sir-attendance-updated', handleSync);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', handleSync);

    let bcShift = null;
    let bcTask = null;
    let bcAttendance = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bcShift = new BroadcastChannel('sir_shift_assignments');
        bcShift.onmessage = handleSync;
      } catch (_) { }
      try {
        bcTask = new BroadcastChannel('sir_hr_tasks');
        bcTask.onmessage = handleSync;
      } catch (_) { }
      try {
        bcAttendance = new BroadcastChannel('sir_attendance_updated');
        bcAttendance.onmessage = handleSync;
      } catch (_) { }
    }

    const timer = setInterval(handleSync, 5000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('sir-shifts-updated', handleSync);
      window.removeEventListener('sir-tasks-updated', handleSync);
      window.removeEventListener('sir-attendance-updated', handleSync);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', handleSync);
      if (bcShift) bcShift.close();
      if (bcTask) bcTask.close();
      if (bcAttendance) bcAttendance.close();
    };
  }, [isHrOpsSession, fetchDashboardSummary]);

  const announcementsReqSeqRef = useRef(0);
  const fetchCompanyAnnouncements = useCallback(async (silent = false) => {
    const reqSeq = ++announcementsReqSeqRef.current;
    if (!silent) setAnnouncementsLoading(true);
    try {
      let token = crmToken;
      if (!token) {
        try {
          const tokRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Operations',
              targetEmail: user?.email,
              employeeId: user?.employeeId || user?.id
            })
          });
          if (tokRes.ok) {
            const tokData = await tokRes.json();
            if (tokData?.success && tokData.token) {
              token = tokData.token;
              setCrmToken?.(tokData.token);
            }
          }
        } catch (_) { }
      }

      const res = await fetch('/api/company-announcements', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (reqSeq !== announcementsReqSeqRef.current) return;
        if (data?.success && Array.isArray(data.announcements)) {
          setCompanyAnnouncements(data.announcements);
          setCalendarAnnouncements(Array.isArray(data.calendarAnnouncements) ? data.calendarAnnouncements : data.announcements);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch company announcements:', err);
    } finally {
      if (!silent && reqSeq === announcementsReqSeqRef.current) setAnnouncementsLoading(false);
    }
  }, [crmToken, setCrmToken]);

  useEffect(() => {
    fetchDashboardSummary(false);
    fetchCompanyAnnouncements(false);
  }, [fetchDashboardSummary, fetchCompanyAnnouncements]);

  // Auto-refresh Company Announcements (polling every 10s + focus/visibility + cross-tab BroadcastChannel/storage)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCompanyAnnouncements(true);
    }, 10000);

    const handleFocusOrSync = () => {
      fetchCompanyAnnouncements(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCompanyAnnouncements(true);
      }
    };
    const handleStorage = (e) => {
      if (e.key === 'sir_announcements_updated_at') {
        fetchCompanyAnnouncements(true);
      }
    };

    window.addEventListener('focus', handleFocusOrSync);
    window.addEventListener('sir-announcements-updated', handleFocusOrSync);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);

    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('sir_company_announcements');
        bc.onmessage = () => fetchCompanyAnnouncements(true);
      }
    } catch (_) { }

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusOrSync);
      window.removeEventListener('sir-announcements-updated', handleFocusOrSync);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      try { bc?.close(); } catch (_) { }
    };
  }, [fetchCompanyAnnouncements]);

  useEffect(() => {
    if (initialSection === 'announcements') {
      setTimeout(() => {
        const el = document.getElementById('hr-company-announcements');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, [initialSection]);

  const filteredCompanyAnnouncements = useMemo(() => {
    let list = companyAnnouncements || [];
    if (announcementCategoryFilter !== 'all') {
      list = list.filter(a => a.category === announcementCategoryFilter);
    }
    if (announcementSearch.trim()) {
      const q = announcementSearch.toLowerCase();
      list = list.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.created_by_name && a.created_by_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [companyAnnouncements, announcementCategoryFilter, announcementSearch]);

  const showToast = (type, message) => {
    setActionFeedback({ type, message });
    window.clearTimeout(window.__hrDashToastTimer);
    window.__hrDashToastTimer = window.setTimeout(() => setActionFeedback(null), 4500);
  };

  const scrollToWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCandidateProfile = (candidateKey) => {
    if (!candidateKey) return;
    const url = new URL(window.location.href);
    url.searchParams.set('candidateKey', candidateKey);
    window.history.replaceState({}, '', url.toString());
    setActiveModule('candidates');
  };

  const openStatusModal = (enq) => {
    setStatusModalEnquiry(enq);
    setStatusForm({
      status: enq.status === 'New' || enq.status === 'Assigned' ? 'In Progress' : enq.status || 'In Progress',
      resolutionNotes: '',
      nextAction: enq.nextAction || '',
      nextActionDate: enq.nextActionDate || ''
    });
  };

  const handleSubmitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalEnquiry || !crmToken) return;
    setSavingModal(true);
    try {
      const payload = {
        status: statusForm.status,
        resolutionNotes: statusForm.resolutionNotes?.trim() || undefined,
        nextAction: statusForm.nextAction?.trim() || undefined,
        nextActionDate: statusForm.nextActionDate?.trim() || undefined
      };
      const res = await fetch(`/api/hr-ops/enquiries/${encodeURIComponent(statusModalEnquiry.id)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update enquiry status.');
      }
      setStatusModalEnquiry(null);
      await fetchDashboardSummary(true);
      showToast('success', `Enquiry ${statusModalEnquiry.referenceNumber} updated to ${statusForm.status}.`);
    } catch (err) {
      showToast('error', err.message || 'Could not update enquiry status.');
    } finally {
      setSavingModal(false);
    }
  };

  const handleQuickCompleteEnquiry = async (enq) => {
    if (!crmToken || !enq) return;
    setMutatingId(enq.id);
    try {
      const res = await fetch(`/api/hr-ops/enquiries/${encodeURIComponent(enq.id)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({
          status: 'Completed',
          resolutionNotes: 'Completed from Daily Operations Dashboard.'
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to mark enquiry completed.');
      }
      await fetchDashboardSummary(true);
      showToast('success', `${enq.referenceNumber} marked as Completed.`);
    } catch (err) {
      showToast('error', err.message || 'Unable to complete enquiry.');
    } finally {
      setMutatingId(null);
    }
  };

  const openFollowUpModal = (enq) => {
    setFollowUpModalEnquiry(enq);
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 2, 0, 0, 0);
    const localIso = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}T${String(defaultDate.getHours()).padStart(2, '0')}:${String(defaultDate.getMinutes()).padStart(2, '0')}`;
    setFollowUpForm({
      title: `Follow up with ${enq.candidateName || 'Candidate'}`,
      purpose: 'Call',
      dueDateTime: localIso
    });
  };

  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpModalEnquiry || !crmToken) return;
    if (!followUpForm.title.trim() || !followUpForm.dueDateTime.trim()) {
      showToast('error', 'Follow-up title and due date/time are required.');
      return;
    }
    setSavingModal(true);
    try {
      const res = await fetch(`/api/hr-ops/enquiries/${encodeURIComponent(followUpModalEnquiry.id)}/follow-ups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({
          title: followUpForm.title.trim(),
          purpose: followUpForm.purpose || 'Call',
          dueDateTime: followUpForm.dueDateTime
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to schedule follow-up.');
      }
      setFollowUpModalEnquiry(null);
      await fetchDashboardSummary(true);
      showToast('success', 'Follow-up scheduled successfully.');
    } catch (err) {
      showToast('error', err.message || 'Could not schedule follow-up.');
    } finally {
      setSavingModal(false);
    }
  };

  const handleCompleteFollowUp = async (fu) => {
    if (!crmToken || !fu) return;
    if (fu.source === 'lead_next_action') {
      const linked = (dashboard?.assignedEnquiries || []).find((e) => e.id === fu.enquiryId);
      if (linked) openStatusModal(linked);
      return;
    }
    setMutatingId(fu.id);
    try {
      const res = await fetch(`/api/hr-ops/follow-ups/${encodeURIComponent(fu.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({
          status: 'Completed',
          completionNotes: 'Completed from Daily Operations Dashboard.'
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to complete follow-up.');
      }
      await fetchDashboardSummary(true);
      showToast('success', 'Follow-up marked as Completed.');
    } catch (err) {
      showToast('error', err.message || 'Could not update follow-up.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    if (!crmToken || !task) return;
    const linkedEnq = (dashboard?.assignedEnquiries || []).find(
      (e) => e.id === task.enquiryId || (task.referenceNumber && e.referenceNumber === task.referenceNumber)
    );
    if (task.isCompleted && linkedEnq?.isResolved) {
      showToast('error', 'Linked enquiry is resolved. Reopen the enquiry status to reopen this task.');
      return;
    }
    const nextTaskStatus = task.isCompleted ? 'To Do' : 'Completed';
    setMutatingId(task.id);
    try {
      const res = await fetch(`/api/hr-ops/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({ taskStatus: nextTaskStatus })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update task status.');
      }
      if (json.data) {
        setDashboard(json.data);
      } else {
        await fetchDashboardSummary(true);
      }
      showToast('success', `Task updated to ${nextTaskStatus}.`);
    } catch (err) {
      showToast('error', err.message || 'Could not update task.');
    } finally {
      setMutatingId(null);
    }
  };

  const employeeInfo = dashboard?.employee || {
    name: currentEmployee?.name || 'HR Operations',
    designation: currentEmployee?.designation || currentRole || 'HR Operations',
    operationTeam: currentEmployee?.operationTeam || null
  };

  const shiftInfo = dashboard?.shift || null;
  const attendanceToday = dashboard?.attendanceToday || null;
  const metrics = dashboard?.metrics || {
    myAssignedEnquiries: 0,
    pendingEnquiries: 0,
    followUpsDueToday: 0,
    overdueFollowUps: 0,
    completedEnquiriesThisMonth: 0,
    pendingTasks: 0
  };
  const assignedEnquiries = dashboard?.assignedEnquiries || [];
  const followUps = dashboard?.followUps || [];
  const tasks = dashboard?.tasks || [];
  const statusOptions = dashboard?.permittedEnquiryStatuses || FALLBACK_STATUS_OPTIONS;

  const availableTeams = useMemo(() => {
    const set = new Set();
    assignedEnquiries.forEach((e) => {
      if (e.operationTeam) set.add(e.operationTeam);
    });
    return Array.from(set);
  }, [assignedEnquiries]);

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignedEnquiries.filter((enq) => {
      if (enquiryQuickFilter === 'pending' && enq.isResolved) return false;
      if (enquiryQuickFilter === 'completed' && !enq.isResolved) return false;
      if (enquiryQuickFilter === 'completed-month' && !enq.isCompletedThisMonth) return false;
      if (statusFilter !== 'all' && enq.status !== statusFilter) return false;
      if (teamFilter !== 'all' && enq.operationTeam !== teamFilter) return false;
      if (q) {
        const hay = [
          enq.candidateName,
          enq.referenceNumber,
          enq.candidateReferenceNumber,
          enq.serviceTitle,
          enq.phone,
          enq.email,
          enq.status,
          enq.operationTeam
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [assignedEnquiries, enquiryQuickFilter, searchQuery, statusFilter, teamFilter]);

  const filteredFollowUps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return followUps.filter((fu) => {
      if (followUpBucketFilter !== 'all' && fu.bucket !== followUpBucketFilter) return false;
      if (q) {
        const hay = [fu.title, fu.purpose, fu.candidateName, fu.enquiryReference, fu.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [followUps, followUpBucketFilter, searchQuery]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      if (taskFilter === 'pending' && t.isCompleted) return false;
      if (taskFilter === 'completed' && !t.isCompleted) return false;
      if (q) {
        const hay = [t.customerName, t.referenceNumber, t.serviceTitle, t.notes, t.taskStatus]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, taskFilter, searchQuery]);

  const summaryCards = [
    {
      key: 'myAssignedEnquiries',
      label: 'My Assigned Enquiries',
      value: metrics.myAssignedEnquiries,
      icon: Inbox
    },
    {
      key: 'pendingEnquiries',
      label: 'Pending Enquiries',
      value: metrics.pendingEnquiries,
      icon: Clock
    },
    {
      key: 'followUpsDueToday',
      label: 'Follow-ups Due Today',
      value: metrics.followUpsDueToday,
      icon: CalendarClock
    },
    {
      key: 'completedEnquiriesThisMonth',
      label: 'Completed Enquiries This Month',
      value: metrics.completedEnquiriesThisMonth,
      icon: CheckCircle2
    }
  ];

  const enquiriesSummaryCards = summaryCards;

  // Role Preview / Auth / Fatal Error states
  if (authTokenLoading || (loading && !dashboard && !errorState)) {
    return (
      <div className="space-y-6 animate-pulse" data-testid="hr-ops-dashboard-loading">
        <div className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-amber-500/40" />
          ))}
        </div>
        <div className="h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  if (errorState && !dashboard) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center max-w-2xl mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {errorState.code === 'ROLE_PREVIEW'
            ? 'HR Operations Employee Session Required'
            : errorState.code === 401
              ? 'Authentication Required'
              : 'Unable to Load Daily Operations Dashboard'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {errorState.message}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {errorState.code === 'ROLE_PREVIEW' && (
            <button
              type="button"
              onClick={() => switchRole?.('HR Operations')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              Switch Active Role to HR Operations
            </button>
          )}
          {errorState.code === 401 ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setErrorState(null);
                  try {
                    const res = await fetch('/api/crm/auth/preview-token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        targetRole: currentRole || 'HR Operations',
                        targetEmail: user?.email,
                        employeeId: user?.employeeId || user?.id
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data?.success && data.token) {
                        setCrmToken?.(data.token);
                        try {
                          const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                          if (cur && cur.isAuthenticated) {
                            localStorage.setItem('sir_crm_session', JSON.stringify({ ...cur, crmToken: data.token }));
                          }
                        } catch (_) { }
                        fetchDashboardSummary(true);
                        return;
                      }
                    }
                  } catch (_) { }
                  fetchDashboardSummary(true);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                ⚡ Reconnect Session ({user?.name || 'HR Operations'})
              </button>
              <button
                type="button"
                onClick={() => logout?.()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Sign In with Different Account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fetchDashboardSummary(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8" data-testid="hr-ops-daily-dashboard">
      {/* Feedback Toast */}
      {actionFeedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm ${actionFeedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-200'
            }`}
        >
          <span>{actionFeedback.message}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Dashboard / Assigned Enquiries Header */}
      {!isAnnouncementsPage && (
        <header className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {isEnquiriesPage ? 'My Assigned Enquiries' : 'My Dashboard'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!isEnquiriesPage && (() => {
                const hasShiftForToday = Boolean(shiftInfo && !shiftInfo.isOff);
                return (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer hover:shadow-xs transition ${
                    hasShiftForToday
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 hover:border-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                  data-testid="hr-dashboard-shift-timing"
                  onClick={() => setActiveModule?.('hr-shifts')}
                  title="Click to view My Shift"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold ${
                    hasShiftForToday
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-tight">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      hasShiftForToday
                        ? 'text-amber-900 dark:text-amber-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      Today’s Assigned Shift
                      {hasShiftForToday && shiftInfo?.name
                        ? ` • ${shiftInfo.name.replace(/\s*\([^)]*\)\s*$/, '').trim()}`
                        : ''}
                    </p>
                    <p className="text-xs font-bold text-slate-950 dark:text-white">
                      {hasShiftForToday ? (
                        <>
                          {shiftInfo.formattedTiming}
                          {shiftInfo.assignmentDate ? (
                            <span className="ml-1.5 text-[10px] font-normal text-slate-500 dark:text-slate-400 font-mono">
                              ({formatDateShort(shiftInfo.assignmentDate)})
                            </span>
                          ) : null}
                        </>
                      ) : (
                        'No shift assigned for today'
                      )}
                    </p>
                  </div>
                </div>
                );
              })()}

              <button
                type="button"
                onClick={() => fetchDashboardSummary(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. Redesigned KPI Cards for HR Operations */}
      {!isAnnouncementsPage && (
        <section aria-label="Employee Operations Metrics">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const isActionable = card.key === 'myAssignedEnquiries' || card.key === 'pendingEnquiries';
              return (
                <div
                  key={card.key}
                  data-testid={`kpi-card-${card.key}`}
                  onClick={() => {
                    if (isActionable && setActiveModule) {
                      setActiveModule('hr-tasks');
                      if (card.key === 'pendingEnquiries') {
                        setEnquiryQuickFilter('pending');
                      }
                    }
                  }}
                  className={`group relative rounded-2xl p-4 sm:p-4.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-amber-500 dark:border-l-gold-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center justify-between min-h-[134px] select-none ${
                    isActionable ? 'cursor-pointer hover:border-amber-400/80' : 'cursor-default'
                  }`}
                >
                  {/* Top: Small, consistent icon in light-gold container */}
                  <div className="flex items-center justify-center mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-gold-400 shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* KPI Number prominently in bold, dark navy typography (centered), with label below */}
                  <div className="w-full flex flex-col items-center text-center">
                    <div
                      className="text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white tabular-nums tracking-tight leading-none text-center"
                      data-testid={`kpi-value-${card.key}`}
                    >
                      {card.value}
                    </div>
                    <div className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 mt-2 leading-snug text-center">
                      {card.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Attendance Summary (Shown on My Dashboard only) */}
      {!isEnquiriesPage && !isAnnouncementsPage && (
        <section
          aria-label="Attendance Summary"
          data-testid="hr-dashboard-attendance-summary"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/70 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Attendance Summary
                </h2>
                {attendanceToday?.workDate && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({formatDateShort(attendanceToday.workDate)})
                  </span>
                )}
                {attendanceToday?.remainingShiftLabel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/20">
                    Shift Remaining: {attendanceToday.remainingShiftLabel}
                  </span>
                )}
                {attendanceToday?.dailyReport && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    attendanceToday.dailyReport.hasSubmitted
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    Daily Report: {attendanceToday.dailyReport.hasSubmitted ? 'Submitted' : 'Pending'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModule?.('my-attendance')}
              data-testid="link-open-my-attendance"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 transition-colors shrink-0 self-start sm:self-auto"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open My Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Check-In Time */}
            <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                <span>Check-In Time</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-checkin">
                {attendanceToday?.checkInTime || '—'}
              </div>
            </div>

            {/* Checkout Time */}
            <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                <LogOut className="w-3.5 h-3.5 text-amber-500" />
                <span>Checkout Time</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-checkout">
                {attendanceToday?.checkOutTime || (attendanceToday?.isCheckedIn ? 'Active Shift' : '—')}
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                <Timer className="w-3.5 h-3.5 text-blue-500" />
                <span>Working Hours</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-hours">
                {attendanceToday?.workingHours || '0h 00m'}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3b. Company Announcements Section (Dedicated Company Announcement Page) */}
      {isAnnouncementsPage && (
        <>
        <section
          id="hr-company-announcements"
          aria-label="Company Announcement"
          data-testid="hr-dashboard-company-announcements"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-serif">
                    Company Announcement
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Corporate circulars, HR policies, and urgent announcements published by HR Leadership
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowAnnouncementCalendar(prev => !prev)}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 border ${showAnnouncementCalendar
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 border-slate-900 dark:border-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                title="Toggle Announcement Calendar"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{showAnnouncementCalendar ? 'Hide Calendar' : 'Calendar'}</span>
              </button>
              <button
                type="button"
                onClick={() => fetchCompanyAnnouncements(false)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5"
                title="Refresh Announcements"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${announcementsLoading ? 'animate-spin text-amber-500' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {['all', 'General Notice', 'HR Policy', 'Holiday', 'Important Update'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAnnouncementCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${announcementCategoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {cat === 'all' ? 'All Notices' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={announcementSearch}
                onChange={e => setAnnouncementSearch(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-9 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
              {announcementSearch && (
                <button
                  type="button"
                  onClick={() => setAnnouncementSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Announcements Cards */}
          {filteredCompanyAnnouncements.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400">
              <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">
                No company announcements available.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {announcementSearch || announcementCategoryFilter !== 'all'
                  ? 'No announcements match the selected filter.'
                  : 'New announcements published by HR Lead will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 w-full">
              {filteredCompanyAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-500/40 transition group shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Category, audience, title, description, and issuer details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAnnouncementCategoryBadgeClass(ann.category)}`}>
                          {ann.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{ann.target_audience}</span>
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors break-words">
                        {ann.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words line-clamp-2 md:line-clamp-3">
                        {ann.description}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Issued by:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                          {ann.created_by_name || 'HR Lead'}
                        </strong>
                        <span className="text-[11px] text-slate-400">({ann.created_by_role || 'HR Lead'})</span>
                      </div>
                    </div>

                    {/* Right: Expiry badge, Published date/time and “Read Full Notice” button, aligned neatly */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                      {ann.expires_at && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                          Expires: {ann.expires_at}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateTimeShort(ann.published_at || ann.created_at)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAnnouncementForModal(ann)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/15 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400/80 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Full Notice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showAnnouncementCalendar && (
          <SharedAnnouncementCalendar
            announcements={calendarAnnouncements}
            onSelectAnnouncement={(ann) => {
              setShowAnnouncementCalendar(false);
              setSelectedAnnouncementForModal(ann);
            }}
            onClose={() => setShowAnnouncementCalendar(false)}
            title="Shared Announcement Calendar"
          />
        )}
        </>
      )}

      {/* 4. Interactive Employee Workspace (Enquiries / Follow-ups / Tasks) - Shown on My Assigned Enquiries only */}
      {isEnquiriesPage && (
        <section
          ref={workspaceRef}
          id="hr-ops-workspace"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          {/* Tab Bar + Search */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0" role="tablist" aria-label="Operational queues">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'enquiries'}
                onClick={() => setActiveTab('enquiries')}
                data-testid="tab-enquiries"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors shrink-0 ${activeTab === 'enquiries'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Assigned Enquiries</span>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-black/10 dark:bg-white/10 font-mono">
                  {assignedEnquiries.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'followups'}
                onClick={() => setActiveTab('followups')}
                data-testid="tab-followups"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors shrink-0 ${activeTab === 'followups'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Follow-ups</span>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-black/10 dark:bg-white/10 font-mono">
                  {followUps.length}
                </span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 min-w-0 w-full md:w-auto">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {!isEnquiriesPage && (
                <button
                  type="button"
                  onClick={() => setActiveModule?.('hr-tasks')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 whitespace-nowrap"
                >
                  <span>Enquiries Desk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-filters */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {activeTab === 'enquiries' && (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Enquiries' },
                    { id: 'pending', label: `Pending (${metrics.pendingEnquiries})` },
                    { id: 'completed-month', label: `Completed This Month (${metrics.completedEnquiriesThisMonth})` },
                    { id: 'completed', label: 'All Completed' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setEnquiryQuickFilter(opt.id);
                        setStatusFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${enquiryQuickFilter === opt.id
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Filter className="w-3.5 h-3.5" />
                    <select
                      aria-label="Filter by enquiry status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {availableTeams.length > 1 && (
                    <select
                      aria-label="Filter by operation team"
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="all">All Assigned Teams</option>
                      {availableTeams.map((tm) => (
                        <option key={tm} value={tm}>{tm}</option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            )}

            {activeTab === 'followups' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All (${followUps.length})` },
                  { id: 'overdue', label: `Overdue (${metrics.overdueFollowUps})` },
                  { id: 'today', label: `Due Today (${metrics.followUpsDueToday})` },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Completed' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFollowUpBucketFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${followUpBucketFilter === opt.id
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'pending', label: `Pending (${metrics.pendingTasks})` },
                  { id: 'completed', label: 'Completed' },
                  { id: 'all', label: `All Tasks (${tasks.length})` }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTaskFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${taskFilter === opt.id
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Content */}
          <div className="p-4 sm:p-5">
            {activeTab === 'enquiries' && (
              filteredEnquiries.length === 0 ? (
                <div className="py-12 text-center">
                  <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No assigned enquiries match the selected filters
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Try switching filters or clearing the search box.
                  </p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="enquiries-list">
                  {filteredEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {enq.referenceNumber}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getEnquiryStatusBadgeClass(enq.status)}`}>
                              {enq.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(enq.priority)}`}>
                              {enq.priority || 'Normal'}
                            </span>
                            {enq.operationTeam && (
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {enq.operationTeam}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {enq.candidateKey ? (
                              <button
                                type="button"
                                onClick={() => handleOpenCandidateProfile(enq.candidateKey)}
                                className="text-base font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left"
                              >
                                {enq.candidateName}
                              </button>
                            ) : (
                              <span className="text-base font-bold text-slate-900 dark:text-white">
                                {enq.candidateName}
                              </span>
                            )}
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {enq.serviceTitle}{enq.company ? ` • ${enq.company}` : ''}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            {enq.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {enq.phone}
                              </span>
                            )}
                            {enq.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {enq.email}
                              </span>
                            )}
                            <span>Assigned: {formatDateShort(enq.assignedAt || enq.createdAt)}</span>
                            {enq.nextAction && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                Next: {enq.nextAction}
                                {enq.nextActionDate ? ` (${formatDateShort(enq.nextActionDate)})` : ''}
                              </span>
                            )}
                          </div>

                          {(enq.assignmentNotes || enq.internalNotes) && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 rounded-lg px-3 py-2 border border-slate-200/60 dark:border-slate-700/60 mt-1">
                              {enq.assignmentNotes || enq.internalNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openStatusModal(enq)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            Update Status
                          </button>
                          <button
                            type="button"
                            onClick={() => openFollowUpModal(enq)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                          >
                            Schedule Follow-up
                          </button>
                          {!enq.isResolved && (
                            <button
                              type="button"
                              disabled={mutatingId === enq.id}
                              onClick={() => handleQuickCompleteEnquiry(enq)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{mutatingId === enq.id ? 'Saving...' : 'Complete'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'followups' && (
              filteredFollowUps.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarClock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No follow-ups found for this filter
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Schedule follow-ups directly from any assigned enquiry.
                  </p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="followups-list">
                  {filteredFollowUps.map((fu) => {
                    const badge = getFollowUpBucketBadge(fu.bucket);
                    const isCompleted = fu.bucket === 'completed';
                    return (
                      <div
                        key={fu.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes}`}>
                              {badge.label}
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {fu.enquiryReference}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {fu.purpose}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {fu.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            {fu.candidateKey ? (
                              <button
                                type="button"
                                onClick={() => handleOpenCandidateProfile(fu.candidateKey)}
                                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                {fu.candidateName}
                              </button>
                            ) : (
                              <span className="font-semibold">{fu.candidateName}</span>
                            )}
                            <span>Due: {formatDateTimeShort(fu.dueDateTime)}</span>
                          </div>
                          {fu.completionNotes && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                              Note: {fu.completionNotes}
                            </p>
                          )}
                        </div>

                        {!isCompleted && (
                          <button
                            type="button"
                            disabled={mutatingId === fu.id}
                            onClick={() => handleCompleteFollowUp(fu)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {mutatingId === fu.id
                                ? 'Updating...'
                                : fu.source === 'lead_next_action'
                                  ? 'Update Enquiry'
                                  : 'Mark Completed'}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'tasks' && (
              filteredTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No assigned tasks in this view
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tasks assigned to you by HR Lead appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="tasks-list">
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.referenceNumber}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${t.isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                            : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30'
                            }`}>
                            {t.taskStatus}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {t.candidateKey ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCandidateProfile(t.candidateKey)}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"
                            >
                              {t.customerName}
                            </button>
                          ) : (
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {t.customerName}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {t.serviceTitle}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span>Assigned by: {t.assignedByName}</span>
                          <span>Assigned: {formatDateShort(t.assignedAt)}</span>
                          {t.dueDate && <span>Due: {formatDateShort(t.dueDate)}</span>}
                        </div>

                        {t.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            {t.notes}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={mutatingId === t.id}
                        onClick={() => handleToggleTaskStatus(t)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-60 ${t.isCompleted
                          ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                      >
                        {t.isCompleted ? <Sparkles className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>
                          {mutatingId === t.id
                            ? 'Saving...'
                            : t.isCompleted
                              ? 'Mark To Do'
                              : 'Mark Completed'}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Update Enquiry Status Modal */}
      {statusModalEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 id="status-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Update Enquiry Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {statusModalEnquiry.candidateName} ({statusModalEnquiry.referenceNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalEnquiry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enquiry Status
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Call / Progress Note
                </label>
                <textarea
                  rows={3}
                  value={statusForm.resolutionNotes}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
                  placeholder="Enter discussion outcome or status remarks..."
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Next Action
                  </label>
                  <input
                    type="text"
                    value={statusForm.nextAction}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, nextAction: e.target.value }))}
                    placeholder="e.g. Call back"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Next Action Date
                  </label>
                  <input
                    type="date"
                    value={statusForm.nextActionDate ? String(statusForm.nextActionDate).slice(0, 10) : ''}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, nextActionDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-60"
                >
                  {savingModal ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {followUpModalEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="followup-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 id="followup-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Schedule Follow-up
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {followUpModalEnquiry.candidateName} ({followUpModalEnquiry.referenceNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpModalEnquiry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Follow-up Title
                </label>
                <input
                  type="text"
                  required
                  value={followUpForm.title}
                  onChange={(e) => setFollowUpForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Confirm document submission"
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Purpose
                  </label>
                  <select
                    value={followUpForm.purpose}
                    onChange={(e) => setFollowUpForm((prev) => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Document Check">Document Check</option>
                    <option value="Counselling">Counselling</option>
                    <option value="Status Update">Status Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={followUpForm.dueDateTime}
                    onChange={(e) => setFollowUpForm((prev) => ({ ...prev, dueDateTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFollowUpModalEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-60"
                >
                  {savingModal ? 'Scheduling...' : 'Schedule Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only View Announcement Modal for HR Operations */}
      {selectedAnnouncementForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAnnouncementCategoryBadgeClass(selectedAnnouncementForModal.category)}`}>
                    {selectedAnnouncementForModal.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{selectedAnnouncementForModal.target_audience}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.status === 'Deleted'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      : selectedAnnouncementForModal.status === 'Expired'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : selectedAnnouncementForModal.status === 'Scheduled'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.status === 'Deleted'
                      ? 'Deleted'
                      : (selectedAnnouncementForModal.status || 'Published')}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white pt-1">
                  {selectedAnnouncementForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncementForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span>Published by: <strong className="text-slate-800 dark:text-slate-200">{selectedAnnouncementForModal.created_by_name || 'HR Lead'}</strong> ({selectedAnnouncementForModal.created_by_role || 'HR Lead'})</span>
              {selectedAnnouncementForModal.created_by && (
                <span className="font-mono text-[10px] text-slate-400">[{selectedAnnouncementForModal.created_by}]</span>
              )}
              <span>•</span>
              <span className="font-mono">{formatDateTimeShort(selectedAnnouncementForModal.published_at || selectedAnnouncementForModal.created_at)}</span>
              {selectedAnnouncementForModal.expires_at && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Valid until: {selectedAnnouncementForModal.expires_at}</span>
                </>
              )}
            </div>

            {(selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.is_deleted || selectedAnnouncementForModal.status === 'Deleted') && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 text-xs space-y-1">
                <div className="font-bold text-rose-800 dark:text-rose-200 text-[11px]">
                  Soft-Deleted Announcement ({selectedAnnouncementForModal.wasPublished || selectedAnnouncementForModal.published_at ? 'Previously Published' : 'Never Published'})
                </div>
                <div className="text-rose-900 dark:text-rose-100 text-[11px]">
                  Deleted by <strong>{selectedAnnouncementForModal.deleted_by_name || 'HR Lead'}</strong>
                  {selectedAnnouncementForModal.deleted_at ? ` on ${formatDateTimeShort(selectedAnnouncementForModal.deleted_at)}` : ''}
                </div>
                <div className="text-rose-700 dark:text-rose-300 text-[11px] italic">
                  Reason: {selectedAnnouncementForModal.deletion_reason || 'No reason recorded'}
                </div>
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed py-2">
              {selectedAnnouncementForModal.description}
            </div>

            {Array.isArray(selectedAnnouncementForModal.auditLogs) && selectedAnnouncementForModal.auditLogs.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Audit History ({selectedAnnouncementForModal.auditLogs.length})
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedAnnouncementForModal.auditLogs.map((log) => (
                    <div key={log.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{log.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">{formatDateTimeShort(log.created_at)}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {log.actor_name || 'System'} ({log.actor_role || 'System'}) {log.details ? `— ${log.details}` : ''}
                      </div>
                      {log.reason && <div className="text-rose-600 dark:text-rose-300 italic">Reason: {log.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnnouncementForModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CrmHrOperationsDashboard };
export default CrmHrOperationsDashboard;

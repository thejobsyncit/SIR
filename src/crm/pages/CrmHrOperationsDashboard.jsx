import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  Filter,
  Inbox,
  ListTodo,
  LogIn,
  LogOut,
  Mail,
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
    switchRole,
    setActiveModule,
    logout
  } = useCrm();

  const workspaceRef = useRef(null);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [mutatingId, setMutatingId] = useState(null);

  // Determine whether this view is the dedicated "My Assigned Enquiries" page
  const isEnquiriesPage = initialSection === 'tasks' || initialSection === 'hr-tasks' || initialSection === 'enquiries';

  // Interactive workspace tabs & filters
  const [activeCardId, setActiveCardId] = useState('myAssignedEnquiries');
  const [activeTab, setActiveTab] = useState(() => (initialSection === 'tasks') ? 'tasks' : 'enquiries'); // 'enquiries' | 'followups' | 'tasks'

  useEffect(() => {
    if (initialSection === 'tasks') {
      setActiveTab('tasks');
    } else if (initialSection === 'enquiries' || initialSection === 'hr-tasks') {
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

  const isHrOpsSession = currentRole === 'HR Operations';

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
        headers: {
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
            body: JSON.stringify({ targetRole: 'HR Operations' })
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
              } catch (_) {}
              const retryRes = await fetch('/api/hr-ops/dashboard/summary', {
                headers: { Authorization: `Bearer ${tokData.token}` }
              });
              const retryJson = await retryRes.json().catch(() => ({}));
              if (retryRes.ok && retryJson.success && retryJson.data) {
                setDashboard(retryJson.data);
                return;
              }
            }
          }
        } catch (_) {}

        setErrorState({
          code: 403,
          message: json.message || 'Access denied: Only active HR Operations employees can view this dashboard.'
        });
        return;
      }
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || 'Unable to load Daily Operations Dashboard.');
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

  useEffect(() => {
    fetchDashboardSummary(false);
  }, [fetchDashboardSummary]);

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

  const handleSummaryCardClick = (cardKey) => {
    setActiveCardId(cardKey);
    switch (cardKey) {
      case 'myAssignedEnquiries':
        setActiveTab('enquiries');
        setEnquiryQuickFilter('all');
        setStatusFilter('all');
        break;
      case 'pendingEnquiries':
        setActiveTab('enquiries');
        setEnquiryQuickFilter('pending');
        setStatusFilter('all');
        break;
      case 'followUpsDueToday':
        setActiveTab('followups');
        setFollowUpBucketFilter('today');
        break;
      case 'overdueFollowUps':
        setActiveTab('followups');
        setFollowUpBucketFilter('overdue');
        break;
      case 'completedEnquiriesThisMonth':
        setActiveTab('enquiries');
        setEnquiryQuickFilter('completed-month');
        setStatusFilter('all');
        break;
      case 'pendingTasks':
        setActiveTab('tasks');
        setTaskFilter('pending');
        break;
      default:
        break;
    }
    scrollToWorkspace();
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
      hint: 'View assigned queue',
      icon: Inbox,
      accent: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-500/15 border-blue-200/70 dark:border-blue-500/30',
      activeRing: 'ring-2 ring-blue-500 border-blue-400 dark:border-blue-500'
    },
    {
      key: 'pendingEnquiries',
      label: 'Pending Enquiries',
      value: metrics.pendingEnquiries,
      hint: 'Open items needing action',
      icon: Clock,
      accent: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200/70 dark:border-amber-500/30',
      activeRing: 'ring-2 ring-amber-500 border-amber-400 dark:border-amber-500'
    },
    {
      key: 'followUpsDueToday',
      label: 'Follow-ups Due Today',
      value: metrics.followUpsDueToday,
      hint: 'Scheduled for today',
      icon: CalendarClock,
      accent: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200/70 dark:border-indigo-500/30',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-400 dark:border-indigo-500'
    },
    {
      key: 'overdueFollowUps',
      label: 'Overdue Follow-ups',
      value: metrics.overdueFollowUps,
      hint: 'Past due follow-ups',
      icon: AlertTriangle,
      accent: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-500/15 border-rose-200/70 dark:border-rose-500/30',
      activeRing: 'ring-2 ring-rose-500 border-rose-400 dark:border-rose-500'
    },
    {
      key: 'completedEnquiriesThisMonth',
      label: 'Completed Enquiries This Month',
      value: metrics.completedEnquiriesThisMonth,
      hint: 'Resolved this month',
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/70 dark:border-emerald-500/30',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-400 dark:border-emerald-500'
    },
    {
      key: 'pendingTasks',
      label: 'Pending Tasks',
      value: metrics.pendingTasks,
      hint: 'Open assigned tasks',
      icon: ListTodo,
      accent: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-50 dark:bg-violet-500/15 border-violet-200/70 dark:border-violet-500/30',
      activeRing: 'ring-2 ring-violet-500 border-violet-400 dark:border-violet-500'
    }
  ];

  const enquiriesSummaryCards = summaryCards.filter((card) =>
    ['myAssignedEnquiries', 'pendingEnquiries', 'followUpsDueToday', 'completedEnquiriesThisMonth'].includes(card.key)
  );

  // Role Preview / Auth / Fatal Error states
  if (authTokenLoading || (loading && !dashboard && !errorState)) {
    return (
      <div className="space-y-6 animate-pulse" data-testid="hr-ops-dashboard-loading">
        <div className="h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
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
                      body: JSON.stringify({ targetRole: 'HR Operations' })
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
                        } catch (_) {}
                        fetchDashboardSummary(true);
                        return;
                      }
                    }
                  } catch (_) {}
                  fetchDashboardSummary(true);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
              >
                ⚡ Sign In as HR Operations (Balavarshini S.)
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
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm ${
            actionFeedback.type === 'error'
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
      <header className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-gold-500/20 dark:text-gold-300 border border-amber-300 dark:border-gold-500/30">
                {isEnquiriesPage ? 'Enquiries Desk • Active Pipeline' : 'Operations Desk • Daily Workspace'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {isEnquiriesPage ? 'My Assigned Enquiries & Active Pipeline' : 'Daily Operations Work Queue & Console'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {isEnquiriesPage
                ? 'Review assigned candidate and student enquiries, schedule follow-ups, and update pipeline status.'
                : 'Centralized workforce workspace for shift tracking, attendance logs, and operational workflow.'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span data-testid="hr-dashboard-employee-name">{employeeInfo.name}</span>
              </span>
              <span>•</span>
              <span data-testid="hr-dashboard-employee-designation">{employeeInfo.designation}</span>
              {employeeInfo.operationTeam && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-slate-800 dark:text-slate-300">
                    {employeeInfo.operationTeam}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isEnquiriesPage && shiftInfo?.formattedTiming && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30"
                data-testid="hr-dashboard-shift-timing"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Today’s Shift
                    {shiftInfo.name
                      ? ` • ${shiftInfo.name.replace(/\s*\([^)]*\)\s*$/, '').trim()}`
                      : ''}
                  </p>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">
                    {shiftInfo.formattedTiming}
                  </p>
                </div>
              </div>
            )}

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

      {/* 2. Summary Cards */}
      <section aria-label="Employee Operations Metrics">
        <div className={`grid gap-3 sm:gap-3.5 ${
          isEnquiriesPage
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6'
        }`}>
          {(isEnquiriesPage ? enquiriesSummaryCards : summaryCards).map((card) => {
            const Icon = card.icon;
            const isActive = activeCardId === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => handleSummaryCardClick(card.key)}
                data-testid={`kpi-card-${card.key}`}
                className={`group text-left rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? card.activeRing
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${card.accent}`} />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tabular-nums" data-testid={`kpi-value-${card.key}`}>
                  {card.value}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                  {card.label}
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.hint}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Attendance Summary (Shown on Operations Work Queue only) */}
      {!isEnquiriesPage && (
        <section
          aria-label="Attendance Summary"
          data-testid="hr-dashboard-attendance-summary"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/70 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Attendance Summary
                  </h2>
                  {attendanceToday?.workDate && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      ({formatDateShort(attendanceToday.workDate)})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live daily attendance status and logged working time for your profile
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModule?.('my-attendance')}
              data-testid="link-open-my-attendance"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 transition-colors shrink-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open My Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Today's Status */}
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Attendance Status
              </div>
              <div className="flex items-center gap-2">
                <span
                  data-testid="attendance-summary-status"
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${getAttendanceBadgeClass(
                    attendanceToday?.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {attendanceToday?.status || 'Not Checked In'}
                </span>
                {attendanceToday?.isOnBreak && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    On Break
                  </span>
                )}
              </div>
            </div>

            {/* Check-In Time */}
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                <span>Check-In Time</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-checkin">
                {attendanceToday?.checkInTime || '—'}
              </div>
            </div>

            {/* Checkout Time */}
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <LogOut className="w-3.5 h-3.5 text-amber-500" />
                <span>Checkout Time</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-checkout">
                {attendanceToday?.checkOutTime || (attendanceToday?.isCheckedIn ? 'Active Shift' : '—')}
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <Timer className="w-3.5 h-3.5 text-blue-500" />
                <span>Working Hours</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums" data-testid="attendance-summary-hours">
                {attendanceToday?.workingHours || '0h 00m'}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Interactive Employee Workspace (Enquiries / Follow-ups / Tasks) */}
      <section
        ref={workspaceRef}
        id="hr-ops-workspace"
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* Tab Bar + Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Operational queues">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'enquiries'}
              onClick={() => setActiveTab('enquiries')}
              data-testid="tab-enquiries"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors ${
                activeTab === 'enquiries'
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors ${
                activeTab === 'followups'
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

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tasks'}
              onClick={() => setActiveTab('tasks')}
              data-testid="tab-tasks"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Assigned Tasks</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-black/10 dark:bg-white/10 font-mono">
                {tasks.length}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, ref #, service..."
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      enquiryQuickFilter === opt.id
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    followUpBucketFilter === opt.id
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    taskFilter === opt.id
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
                            {enq.serviceTitle}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          t.isCompleted
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
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-60 ${
                        t.isCompleted
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
    </div>
  );
};

export { CrmHrOperationsDashboard };
export default CrmHrOperationsDashboard;

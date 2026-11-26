import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CRM_ROLES, ROLE_PERMISSIONS, CRM_CANDIDATES, CRM_CLIENTS, CRM_INTERVIEWS, CRM_INVOICES, PIPELINE_STAGES, AUDIT_LOGS } from '../data/mockCrmData';
import { getLocalFallbackLeads } from '../../services/leadSubmissionService';

export const DEFAULT_CRM_CONTEXT_VALUE = {
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => { },
  requestLogout: () => { },
  logoutConfirmOpen: false,
  isLoggingOut: false,
  closeLogoutConfirm: () => { },
  confirmLogout: () => { },
  recordFailedLogin: () => { },
  failedLoginAttempts: 0,
  accountLocked: false,
  lockReason: '',
  lockoutTimeRemaining: 0,
  unlockAccount: () => { },
  activeDevices: [],
  logoutEverywhere: () => { },
  currentEmployee: null,
  updateUserProfile: () => { },
  crmToken: '',
  authTokenLoading: false,
  setCrmToken: () => { },
  syncAttendanceNotifications: () => { },
  attendancePunch: null,
  clockIn: async () => { },
  startBreak: async () => { },
  endBreak: async () => { },
  clockOut: async () => { },
  currentRole: 'Super Admin',
  isSuperAdmin: true,
  switchRole: () => { },
  hasPermission: () => true,
  darkMode: false,
  toggleDarkMode: () => { },
  activeModule: 'dashboard',
  setActiveModule: () => { },
  candidates: [],
  loadingCandidates: false,
  fetchCandidates: () => { },
  addCandidate: () => { },
  updateCandidate: () => { },
  deleteCandidate: () => { },
  updateCandidateStage: () => { },
  selectedCandidate: null,
  setSelectedCandidate: () => { },
  clients: [],
  fetchClients: () => { },
  addClient: () => { },
  removeClient: () => { },
  createOrganization: () => { },
  updateOrganization: () => { },
  addContactToOrganization: () => { },
  interviews: [],
  addInterview: () => { },
  updateInterview: () => { },
  deleteInterview: () => { },
  calendarEvents: [],
  addCalendarEvent: () => { },
  removeCalendarEvent: () => { },
  invoices: [],
  addInvoice: () => { },
  updateInvoice: () => { },
  deleteInvoice: () => { },
  recruiterTasks: [],
  addRecruiterTask: () => { },
  removeRecruiterTask: () => { },
  toggleRecruiterTask: () => { },
  recruiterNotes: '',
  setRecruiterNotes: () => { },
  auditLogs: [],
  logAuditAction: () => { },
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => { },
  aiDrawerOpen: false,
  setAiDrawerOpen: () => { },
  notificationsOpen: false,
  setNotificationsOpen: () => { },
  notifications: [],
  idleTimeSeconds: 0,
  showIdleModal: false,
  setShowIdleModal: () => { },
  globalAddCandidateOpen: false,
  setGlobalAddCandidateOpen: () => { },
  globalAddClientOpen: false,
  setGlobalAddClientOpen: () => { },
  globalAddInterviewOpen: false,
  setGlobalAddInterviewOpen: () => { },
  globalAddInvoiceOpen: false,
  setGlobalAddInvoiceOpen: () => { },
  leads: [],
  setLeads: () => { },
  isDummyLead: () => false,
  loadingLeads: false,
  fetchLeads: () => { },
  updateLead: () => { },
  archiveLead: () => { },
  deleteLead: () => { },
  addLeadActivity: () => { },
  scheduleLeadFollowUp: () => { },
  updateFollowUpStatus: () => { },
  followUps: [],
  loadingFollowUps: false,
  fetchFollowUps: () => { },
  consultingMetrics: {},
  fetchConsultingMetrics: () => { },
  leadMetrics: {},
  fetchLeadMetrics: () => { },
  serviceBreakdown: [],
  followUpsSummary: { counts: { totalPending: 0, overdue: 0, dueToday: 0, upcoming: 0 }, data: { overdue: [], dueToday: [], upcoming: [] } },
  fetchFollowUpsSummary: () => { },
  selectedMetricsRange: '7d',
  setSelectedMetricsRange: () => { },
  consultingServiceFilter: 'all',
  setConsultingServiceFilter: () => { }
};

// Keep a single CrmContext instance across Vite Fast Refresh so mounted consumers
// stay subscribed to the active CrmProvider instead of falling back to defaults.
export const CrmContext =
  (typeof import.meta !== 'undefined' && import.meta.hot && typeof globalThis !== 'undefined' && globalThis.__SIR_CRM_CONTEXT__) ||
  (() => {
    const ctx = createContext(DEFAULT_CRM_CONTEXT_VALUE);
    if (typeof globalThis !== 'undefined') globalThis.__SIR_CRM_CONTEXT__ = ctx;
    return ctx;
  })();

export const CrmProvider = ({ children }) => {
  // Session persistence: restore authenticated session from localStorage across page refresh
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      return Boolean(parsed && parsed.isAuthenticated);
    } catch {
      return false;
    }
  });

  const DEFAULT_USER = {
    id: 'emp-1',
    name: 'Dhanalakshimi',
    email: 'dhana.jasync@gmail.com',
    role: 'Super Admin',
    department: 'India Operations HQ',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  };

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.user && typeof parsed.user === 'object') {
          return { ...DEFAULT_USER, ...parsed.user };
        }
      }
    } catch { }
    return DEFAULT_USER;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.currentRole) return parsed.currentRole;
      }
    } catch { }
    return 'Super Admin';
  });
  const isSuperAdmin = currentRole === 'Super Admin' || user?.role === 'Super Admin';
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_theme_mode');
      return saved === 'dark';
    } catch {
      return false;
    }
  });
  const isDummyCandidate = (c) => {
    if (!c) return true;
    const name = (c.name || c.applicantName || c.fullName || '').toLowerCase().trim();
    const id = (c.id || c.candidateId || '').toUpperCase().trim();
    const email = (c.email || c.applicantEmail || '').toLowerCase().trim();
    if (!email || !email.includes('@')) return true;
    if (name === 'candidate' || name.startsWith('candidate ri-cand-') || name === 'applicant') return true;
    const dummyIds = [
      'REV-CAN-101', 'REV-CAN-102', 'REV-CAN-103', 'REV-CAN-104', 'REV-CAN-105', 'REV-CAN-106',
      'REV-CAN-4526', 'REV-CAN-4699', 'REV-CAN-5176', 'REV-CAN-9727', 'REV-CAN-3945',
      'REV-CAN-8396', 'REV-CAN-3270', 'REV-CAN-6198', 'REV-CAN-2158', 'REV-CAN-8921',
      'REV-CAN-6858', 'REV-CAN-4283', 'REV-CAN-5599', 'REV-CAN-7331', 'REV-CAN-7211',
      'REV-CAN-8645', 'REV-CAN-5223', 'REV-CAN-3393', 'REV-CAN-9398', 'REV-CAN-3073',
      'REV-CAN-5032', 'REV-CAN-1517', 'REV-CAN-4093', 'REV-CAN-7506', 'REV-CAN-5974',
      'REV-CAN-4404', 'REV-CAN-4539', 'REV-CAN-9000', 'REV-CAN-4378', 'REV-CAN-4043',
      'REV-CAN-5868', 'REV-CAN-8915', 'REV-CAN-3362', 'REV-CAN-53106', 'RI-CAND-777', 'RI-CAND-391',
      'RI-CAND-001', 'RI-CAND-005', 'RI-APP-28093', 'RI-APP-98803'
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

  const isDummyLead = (l) => {
    if (!l) return true;
    const name = (l.name || l.studentName || '').toLowerCase().trim();
    const email = (l.email || l.studentEmail || '').toLowerCase().trim();
    const phone = String(l.phone || l.studentPhone || '').replace(/\D/g, '');
    const msg = (l.message || '').toLowerCase();
    const serviceTitle = (l.serviceTitle || '').toLowerCase();
    const srvId = (l.serviceId || '').toLowerCase();
    const ref = String(l.referenceNumber || l.id || '').toLowerCase();

    // Candidate registrations & job applications belong in candidate portal, not Consulting & Bookings
    if (srvId === 'intl-recruitment' || serviceTitle === 'candidate registration' || serviceTitle === 'job application') {
      return true;
    }

    // Name filters
    if (
      name.includes('qa tester') ||
      name.includes('acceptance user') ||
      name.includes('drop table') ||
      name.includes('dr. robert') ||
      name.includes('vikramaditya') ||
      name.includes('gfhdfhdf') ||
      name.includes('fake user') ||
      name.includes('unknown candidate') ||
      name.includes('fresh candidate') ||
      name.includes('sarabhai') ||
      name.includes('kavitha ramachandran') ||
      name.includes('sanjay krishnan') ||
      name.includes('aarav sharma') ||
      name.includes('priya patel') ||
      name.includes('rohan gupta') ||
      name.includes('ananya sen') ||
      name.includes('meera nair') ||
      name.includes('kamesh') ||
      name.includes('suresg') ||
      name.includes('ramesh') ||
      name.includes('viyaan') ||
      name.includes('johnny') ||
      name.includes('vignesh') ||
      name.startsWith('qa ') ||
      name.endsWith('(intl-consult)') ||
      name.includes('test_') ||
      name.includes('tester')
    ) {
      return true;
    }

    // Email filters
    if (
      email.includes('qa-sir') ||
      email.includes('test_') ||
      email.includes('accept_') ||
      email.includes('sqli_') ||
      email.includes('example.com') ||
      email.includes('dummy') ||
      email.includes('mailinator.com') ||
      email.includes('thejobsync.com') ||
      email.includes('sir-academic.com') ||
      email.includes('revival-international.ae') ||
      email.includes('test-student.in') ||
      email.includes('parent-test.ae') ||
      email.includes('domain.co.in') ||
      email.includes('kamesh34@gmail.com') ||
      email.includes('surya@gmail.com') ||
      email.includes('securit') ||
      email.startsWith('qa') ||
      email.includes('@qa')
    ) {
      return true;
    }

    // Phone filters
    if (
      phone === '9876543210' ||
      phone === '5098765432' ||
      phone === '5012345678' ||
      phone === '1234567891' ||
      phone === '1234567895' ||
      phone === '9123456789' ||
      phone === '9876543211' ||
      phone === '9876543212' ||
      phone === '9876543213' ||
      phone === '9876543215' ||
      phone === '509876543'
    ) {
      return true;
    }

    // Reference ID & Message payload filters
    if (
      ref.includes('drop') ||
      ref.includes('sqli') ||
      msg.includes('drop table') ||
      msg.includes('kwwwwww') ||
      msg.includes('dfbdfhdf') ||
      msg.includes('test payload')
    ) {
      return true;
    }

    return false;
  };

  const loadState = (key, defaultData) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultData;
      const parsed = JSON.parse(saved);
      if (key === 'crm_candidates' && Array.isArray(parsed)) {
        const cleanList = parsed.filter(c => !isDummyCandidate(c));
        try { localStorage.setItem('crm_candidates', JSON.stringify(cleanList)); } catch { }
        return cleanList;
      }
      if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultData) && defaultData.length > 0) {
        return defaultData;
      }
      return parsed || defaultData;
    } catch {
      return defaultData;
    }
  };

  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_candidates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(c => !isDummyCandidate(c));
        }
      }
    } catch { }
    return [];
  });
  const [loadingCandidates, setLoadingCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_candidates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch { }
    return true;
  });
  const candidatesRef = useRef(candidates);
  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_job_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(a => a && a.id && a.jobId && a.applicantEmail && a.applicantEmail.includes('@') && !isDummyCandidate(a));
          if (valid.length !== parsed.length) {
            try { localStorage.setItem('sir_job_applications', JSON.stringify(valid)); } catch {}
          }
          return valid;
        }
      }
    } catch { }
    return [];
  });
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [clients, setClients] = useState(() => loadState('crm_clients', CRM_CLIENTS));
  const [interviews, setInterviews] = useState(() => loadState('crm_interviews', CRM_INTERVIEWS));
  const [invoices, setInvoices] = useState(() => loadState('crm_invoices', CRM_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => loadState('crm_auditLogs', AUDIT_LOGS));
  const [calendarEvents, setCalendarEvents] = useState(() => loadState('crm_calendarEvents', []));
  const [recruiterTasks, setRecruiterTasks] = useState(() => loadState('crm_recruiterTasks', []));
  const [recruiterNotes, setRecruiterNotes] = useState(() => loadState('crm_recruiterNotes', ''));

  // Live Website Leads & Inquiries Synchronization
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [followUpsSummary, setFollowUpsSummary] = useState({
    counts: { totalPending: 0, overdue: 0, dueToday: 0, upcoming: 0 },
    data: { overdue: [], dueToday: [], upcoming: [] }
  });

  const [leadMetrics, setLeadMetrics] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    contactPending: 0,
    contacted: 0,
    awaitingFollowUp: 0,
    inProgress: 0,
    qualified: 0,
    converted: 0,
    closedLost: 0,
    conversionRate: 0,
    overdueFollowUps: 0,
    dueTodayFollowUps: 0,
    upcomingFollowUps: 0
  });
  const [serviceBreakdown, setServiceBreakdown] = useState([]);
  const [selectedMetricsRange, setSelectedMetricsRange] = useState('all');

  const [consultingMetrics, setConsultingMetrics] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    consultationsScheduled: 0,
    activeEngagements: 0,
    completedEngagements: 0,
    followUpsDue: 0,
    overdueFollowUps: 0,
    educationalOrganizations: 0
  });

  const fetchLeads = async (filters = {}) => {
    try {
      setLoadingLeads(true);
      const params = new URLSearchParams();
      if (filters.serviceId) params.append('serviceId', filters.serviceId);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assignedEmployee) params.append('assignedEmployee', filters.assignedEmployee);
      if (filters.search) params.append('search', filters.search);
      if (filters.range) params.append('range', filters.range);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.includeArchived) params.append('includeArchived', 'true');

      const url = `/api/leads${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      const localLeads = getLocalFallbackLeads();

      // Read local Student Academy enquiries as well to guarantee 100% visibility
      let localAcademyLeads = [];
      try {
        const rawAcademy = localStorage.getItem('revival_academy_enquiries');
        if (rawAcademy) {
          const parsedAcademy = JSON.parse(rawAcademy);
          if (Array.isArray(parsedAcademy)) {
            localAcademyLeads = parsedAcademy.map((enq, idx) => ({
              id: enq.id || `LEAD-ACA-${enq.referenceNumber || idx}`,
              referenceNumber: enq.referenceNumber || `REV-ACA-2026-${idx}`,
              name: enq.studentName || enq.name || 'Student Applicant',
              email: enq.email || enq.studentEmail,
              phone: enq.phone || enq.studentPhone,
              company: 'Student Academy',
              serviceId: 'school-academy',
              serviceTitle: 'Student Academy',
              assistanceType: enq.examName || enq.courseName || 'Student Academy Coaching',
              degreeLevel: enq.qualification || 'Student',
              countryInterest: enq.targetCountry || enq.preferredLocation || 'Global',
              status: enq.status || 'New',
              priority: 'Medium',
              message: enq.questions || enq.message || `Exam Enquiry: ${enq.examName || 'Competitive Exam'}`,
              createdAt: enq.createdAt || new Date().toISOString()
            }));
          }
        }
      } catch (_) { }

      // Clean localStorage of any legacy test/dummy leads
      try {
        const rawLocal = localStorage.getItem('revival_local_leads');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const clean = parsed.filter(l => !isDummyLead(l));
            localStorage.setItem('revival_local_leads', JSON.stringify(clean));
          }
        }
        const rawAca = localStorage.getItem('revival_academy_enquiries');
        if (rawAca) {
          const parsedAca = JSON.parse(rawAca);
          if (Array.isArray(parsedAca)) {
            const cleanAca = parsedAca.filter(l => !isDummyLead(l));
            localStorage.setItem('revival_academy_enquiries', JSON.stringify(cleanAca));
          }
        }
        const rawOffline = localStorage.getItem('sir_offline_leads');
        if (rawOffline) {
          const parsedOff = JSON.parse(rawOffline);
          if (Array.isArray(parsedOff)) {
            const cleanOff = parsedOff.filter(l => !isDummyLead(l));
            localStorage.setItem('sir_offline_leads', JSON.stringify(cleanOff));
          }
        }
      } catch (_) { }

      const combinedLocal = [...localLeads, ...localAcademyLeads];
      const cleanCombinedLocal = combinedLocal.filter(l => !isDummyLead(l));

      if (data && data.success && Array.isArray(data.data)) {
        const validServer = data.data.filter(l => !isDummyLead(l));
        setLeads(validServer);
      } else if (cleanCombinedLocal.length > 0) {
        setLeads(cleanCombinedLocal);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Failed to load leads from backend:', err);
      const localLeads = getLocalFallbackLeads().filter(l => !isDummyLead(l));
      setLeads(localLeads);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchLeadMetrics = async (range = selectedMetricsRange, startDate, endDate, serviceId) => {
    try {
      const params = new URLSearchParams({ range });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (serviceId && serviceId !== 'all') params.append('serviceId', serviceId);

      const res = await fetch(`/api/admin/leads/metrics?${params.toString()}`);
      const data = await res.json();
      if (data && data.success && data.metrics) {
        setLeadMetrics(data.metrics);
        if (Array.isArray(data.serviceBreakdown)) {
          setServiceBreakdown(data.serviceBreakdown);
        }
      }
    } catch (err) {
      console.error('Failed to fetch lead metrics:', err);
    }
  };

  const fetchFollowUpsSummary = async () => {
    try {
      const res = await fetch('/api/admin/follow-ups/summary');
      const data = await res.json();
      if (data && data.success && data.data) {
        setFollowUpsSummary({ counts: data.counts, data: data.data });
      }
    } catch (err) {
      console.error('Failed to fetch follow-ups summary:', err);
    }
  };

  const fetchCandidates = useCallback(async (forceLoading = false) => {
    try {
      // Only show full loading spinner if candidates are completely empty or explicitly requested
      if (forceLoading || !candidatesRef.current || candidatesRef.current.length === 0) {
        setLoadingCandidates(true);
      }
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          const finalCandidates = data.data.filter(c => {
            if (!c || isDummyCandidate(c)) return false;
            return true;
          });
          // Always sort candidates descending by newest registration timestamp (#1 latest)
          finalCandidates.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.registeredAt || a.updatedAt || 0).getTime();
            const timeB = new Date(b.createdAt || b.registeredAt || b.updatedAt || 0).getTime();
            return timeB - timeA;
          });
          setCandidates(finalCandidates);
          try {
            localStorage.setItem('crm_candidates', JSON.stringify(finalCandidates));
          } catch { }
          setLoadingCandidates(false);
          return finalCandidates;
        }
      }
      setLoadingCandidates(false);
    } catch (err) {
      console.warn('Network notice fetching server candidates:', err.message);
      setLoadingCandidates(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);

      const deletedAppSet = new Set();
      try {
        const deletedStr = localStorage.getItem('sir_deleted_applications');
        if (deletedStr) {
          const arr = JSON.parse(deletedStr);
          if (Array.isArray(arr)) arr.forEach(d => { if (d) deletedAppSet.add(String(d)); });
        }
      } catch { }

      // 1. Fetch genuine applications directly from backend API
      let serverApps = [];
      try {
        const res = await fetch('/api/candidate/applications');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.data)) {
            serverApps = data.data.filter(a => {
              if (!a || !a.jobId || !a.applicantEmail || !a.applicantEmail.includes('@')) return false;
              if (deletedAppSet.has(String(a.id))) return false;
              const composite = `${String(a.jobId).trim()}_${(a.applicantEmail || '').trim().toLowerCase()}`;
              if (deletedAppSet.has(composite)) return false;
              if (isDummyCandidate(a)) return false;
              return true;
            });
          }
        }
      } catch (netErr) {
        console.warn('Server applications fetch notice:', netErr.message);
      }

      // 2. Active candidate portal session applications (if current candidate just applied)
      const currentCandidateApps = [];
      try {
        const sessStr = localStorage.getItem('sir_user_session');
        if (sessStr) {
          const sess = JSON.parse(sessStr);
          if (sess && sess.email && Array.isArray(sess.applications)) {
            sess.applications.forEach(app => {
              const email = (app.applicantEmail || sess.email || '').toLowerCase().trim();
              if (app && app.jobId && email && email.includes('@') && !deletedAppSet.has(String(app.id))) {
                currentCandidateApps.push({
                  ...app,
                  applicantName: app.applicantName || sess.name || 'Candidate',
                  applicantEmail: email,
                  applicantPhone: app.applicantPhone || sess.phone || '',
                  candidateId: app.candidateId || sess.candidateId || sess.id
                });
              }
            });
          }
        }
      } catch {}

      const mergedMap = new Map();
      serverApps.forEach(sa => {
        const key = String(sa.id || `${String(sa.jobId).trim()}_${(sa.applicantEmail || '').trim().toLowerCase()}`);
        mergedMap.set(key, sa);
      });

      currentCandidateApps.forEach(ca => {
        const email = (ca.applicantEmail || '').toLowerCase().trim();
        const key = String(ca.id || `${String(ca.jobId).trim()}_${email}`);
        if (!mergedMap.has(key)) {
          mergedMap.set(key, ca);
        }
      });

      const finalApps = Array.from(mergedMap.values()).sort((a, b) => new Date(b.appliedDate || b.createdAt || 0) - new Date(a.appliedDate || a.createdAt || 0));
      if (finalApps.length > 0) {
        setApplications(finalApps);
        try {
          localStorage.setItem('sir_job_applications', JSON.stringify(finalApps));
        } catch { }
      } else {
        // Resilient retention: If backend returned empty due to serverless latency, keep existing cached applications
        try {
          const cachedStr = localStorage.getItem('sir_job_applications');
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (Array.isArray(cached) && cached.length > 0) {
              setApplications(cached);
            }
          }
        } catch { }
      }
    } catch (err) {
      console.error('Failed to fetch applications from backend:', err);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  const updateApplicationStatus = async (appId, newStatus, stage, notes) => {
    try {
      const res = await fetch(`/api/candidate/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, stage, notes })
      });
      if (res.ok) {
        setApplications(prev => {
          const updated = prev.map(a => a.id === appId ? { ...a, status: newStatus, stage: stage || a.stage } : a);
          try { localStorage.setItem('sir_job_applications', JSON.stringify(updated)); } catch { }
          return updated;
        });
        fetchCandidates();
        return true;
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
    return false;
  };

  const deleteApplication = async (appId) => {
    try {
      // 1. Blacklist in sir_deleted_applications so it stays deleted across all tabs & reloads
      try {
        const deletedStr = localStorage.getItem('sir_deleted_applications');
        const deletedArr = deletedStr ? JSON.parse(deletedStr) : [];
        if (Array.isArray(deletedArr)) {
          deletedArr.push(appId);
          localStorage.setItem('sir_deleted_applications', JSON.stringify([...new Set(deletedArr)]));
        }
      } catch { }

      // Find application details before deleting to clean candidate-scoped caches
      const targetApp = applications.find(a => a.id === appId);
      const targetJobId = targetApp?.jobId;
      const targetEmail = (targetApp?.applicantEmail || '').toLowerCase().trim();
      const targetCid = targetApp?.candidateId;

      // 2. Wipe from sir_job_applications
      try {
        const appStr = localStorage.getItem('sir_job_applications');
        if (appStr) {
          const apps = JSON.parse(appStr);
          if (Array.isArray(apps)) {
            const filtered = apps.filter(a => a.id !== appId && !(targetJobId && a.jobId === targetJobId && (a.applicantEmail || '').toLowerCase().trim() === targetEmail));
            localStorage.setItem('sir_job_applications', JSON.stringify(filtered));
          }
        }
      } catch { }

      // 3. Wipe from candidate-specific localStorage caches so website re-shows "Apply Now"
      try {
        if (targetCid) {
          const cidAppsStr = localStorage.getItem(`sir_applications_${targetCid}`);
          if (cidAppsStr) {
            const cApps = JSON.parse(cidAppsStr);
            if (Array.isArray(cApps)) {
              localStorage.setItem(`sir_applications_${targetCid}`, JSON.stringify(cApps.filter(a => a.id !== appId && String(a.jobId) !== String(targetJobId))));
            }
          }
        }
        if (targetEmail) {
          const emailAppsStr = localStorage.getItem(`sir_applications_${targetEmail}`);
          if (emailAppsStr) {
            const eApps = JSON.parse(emailAppsStr);
            if (Array.isArray(eApps)) {
              localStorage.setItem(`sir_applications_${targetEmail}`, JSON.stringify(eApps.filter(a => a.id !== appId && String(a.jobId) !== String(targetJobId))));
            }
          }
          const dbStr = localStorage.getItem('sir_candidates_db');
          if (dbStr) {
            const db = JSON.parse(dbStr);
            if (db[targetEmail] && Array.isArray(db[targetEmail].applications)) {
              db[targetEmail].applications = db[targetEmail].applications.filter(a => a.id !== appId && String(a.jobId) !== String(targetJobId));
              localStorage.setItem('sir_candidates_db', JSON.stringify(db));
            }
          }
        }
      } catch { }

      // 4. Update in-memory state immediately
      setApplications(prev => prev.filter(a => a.id !== appId && !(targetJobId && a.jobId === targetJobId && (a.applicantEmail || '').toLowerCase().trim() === targetEmail)));

      // 5. Broadcast application-deleted event across window and tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('application-deleted', { detail: { appId, jobId: targetJobId, email: targetEmail, candidateId: targetCid } }));
      }

      // 6. Delete from backend API
      try {
        await fetch(`/api/candidate/applications/${appId}`, {
          method: 'DELETE'
        });
      } catch (beErr) {
        console.warn('Backend delete application note:', beErr.message);
      }

      fetchCandidates();
      return true;
    } catch (err) {
      console.error('Failed to delete application:', err);
      return false;
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setClients(prev => {
          const backendIds = new Set(data.data.map(c => c.id));
          const backendNames = new Set(data.data.map(c => (c.company || '').toLowerCase().trim()));
          const localOnly = prev.filter(c => !backendIds.has(c.id) && !backendNames.has((c.company || '').toLowerCase().trim()));
          const merged = [...data.data, ...localOnly];
          try {
            localStorage.setItem('crm_clients', JSON.stringify(merged));
          } catch { }
          return merged;
        });
      }
    } catch (err) {
      console.error('Failed to fetch clients from backend:', err);
    }
  };

  const fetchFollowUps = async () => {
    try {
      setLoadingFollowUps(true);
      const res = await fetch('/api/follow-ups');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setFollowUps(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch follow-ups from backend:', err);
    } finally {
      setLoadingFollowUps(false);
    }
  };

  const fetchConsultingMetrics = async () => {
    try {
      const res = await fetch('/api/crm/consulting/metrics');
      const data = await res.json();
      if (data && data.success && data.data) {
        setConsultingMetrics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch consulting metrics:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchApplications();
    fetchLeads();
    fetchClients();
    fetchFollowUps();
    fetchConsultingMetrics();
    fetchLeadMetrics();
    fetchFollowUpsSummary();

    const handleLeadSubmitted = () => {
      fetchLeads();
      fetchConsultingMetrics();
      fetchLeadMetrics();
      fetchApplications();
    };
    window.addEventListener('lead-submitted', handleLeadSubmitted);
    window.addEventListener('application-submitted', fetchApplications);
    window.addEventListener('application-deleted', fetchApplications);
    window.addEventListener('candidate-registered', fetchCandidates);
    window.addEventListener('candidate-profile-updated', fetchCandidates);
    window.addEventListener('candidate-deleted', fetchCandidates);
    const handleFocusSync = () => {
      fetchCandidates();
      fetchApplications();
    };
    window.addEventListener('focus', handleFocusSync);
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCandidates();
        fetchApplications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleStorageChange = (e) => {
      if (e.key === 'crm_candidates' || e.key === 'sir_candidates_db' || e.key === 'sir_user_session' || e.key === 'sir_active_resume' || e.key === 'sir_deleted_candidates') {
        fetchCandidates();
      }
      if (e.key === 'sir_job_applications' || e.key === 'sir_deleted_applications' || (e.key && e.key.startsWith('sir_applications_'))) {
        fetchApplications();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Event-driven & gentle periodic background sync (every 60s only if tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCandidates();
        fetchApplications();
        fetchLeads();
      }
    }, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('lead-submitted', handleLeadSubmitted);
      window.removeEventListener('application-submitted', fetchApplications);
      window.removeEventListener('application-deleted', fetchApplications);
      window.removeEventListener('candidate-registered', fetchCandidates);
      window.removeEventListener('candidate-profile-updated', fetchCandidates);
      window.removeEventListener('candidate-deleted', fetchCandidates);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchCandidates, fetchApplications]);

  useEffect(() => {
    localStorage.setItem('crm_candidates', JSON.stringify(candidates));
    localStorage.setItem('crm_clients', JSON.stringify(clients));
    localStorage.setItem('crm_interviews', JSON.stringify(interviews));
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    localStorage.setItem('crm_auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('crm_calendarEvents', JSON.stringify(calendarEvents));
    localStorage.setItem('crm_recruiterTasks', JSON.stringify(recruiterTasks));
    localStorage.setItem('crm_recruiterNotes', JSON.stringify(recruiterNotes));
  }, [candidates, clients, interviews, invoices, auditLogs, calendarEvents, recruiterTasks, recruiterNotes]);

  // Security & Devices
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [activeDevices, setActiveDevices] = useState([
    { id: 'dev-1', device: 'Windows 11 Workstation (Dubai HQ)', ip: '194.170.21.90', location: 'Dubai, UAE', lastActive: 'Just now', current: true },
    { id: 'dev-2', device: 'iPhone 15 Pro Max (Executive App)', ip: '194.170.21.95', location: 'Dubai, UAE', lastActive: '12 mins ago', current: false },
    { id: 'dev-3', device: 'MacBook Pro 16" (Riyadh Hub)', ip: '82.178.12.44', location: 'Riyadh, KSA', lastActive: '3 hours ago', current: false }
  ]);

  // Session Timeout Idle Watcher
  const [idleTimeSeconds, setIdleTimeSeconds] = useState(0);
  const [showIdleModal, setShowIdleModal] = useState(false);

  // Global Quick Create Modals State
  const [globalAddCandidateOpen, setGlobalAddCandidateOpen] = useState(false);
  const [globalAddClientOpen, setGlobalAddClientOpen] = useState(false);
  const [globalAddInterviewOpen, setGlobalAddInterviewOpen] = useState(false);
  const [globalAddInvoiceOpen, setGlobalAddInvoiceOpen] = useState(false);

  // UI & Drawer Modals
  const [crmToken, setCrmToken] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.crmToken || '';
      }
    } catch { }
    return '';
  });
  const [superAdminToken, setSuperAdminToken] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.superAdminToken || '';
      }
    } catch { }
    return '';
  });
  const [authTokenLoading, setAuthTokenLoading] = useState(false);

  const [attendanceNotifications, setAttendanceNotifications] = useState([]);

  const syncAttendanceNotifications = (serverNotifs = []) => {
    if (!Array.isArray(serverNotifs)) return;
    const mapped = serverNotifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      text: n.title ? `${n.title}: ${n.message}` : (n.message || ''),
      time: n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now',
      type: n.severity === 'warning' ? 'warning' : n.severity === 'success' ? 'success' : 'info',
      read: Number(n.isRead) === 1
    }));
    setAttendanceNotifications(mapped);
  };

  const [activeModule, setActiveModuleState] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.activeModule) {
          if (
            parsed.currentRole === 'HR Operations' &&
            ['consulting', 'career-guidance', 'student-academy'].includes(parsed.activeModule)
          ) {
            return 'dashboard';
          }
          if (parsed.activeModule === 'interviews') {
            return 'candidates';
          }
          return parsed.activeModule;
        }
      }
    } catch { }
    return 'dashboard';
  });

  const setActiveModule = (mod) => {
    setActiveModuleState(mod);
    try {
      const raw = localStorage.getItem('sir_crm_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.isAuthenticated) {
          localStorage.setItem('sir_crm_session', JSON.stringify({
            ...parsed,
            activeModule: mod
          }));
        }
      }
    } catch { }
  };

  const [consultingServiceFilter, setConsultingServiceFilterState] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.consultingServiceFilter) return parsed.consultingServiceFilter;
      }
    } catch { }
    return 'all';
  });

  const setConsultingServiceFilter = (filterVal) => {
    setConsultingServiceFilterState(filterVal);
    try {
      const raw = localStorage.getItem('sir_crm_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        localStorage.setItem('sir_crm_session', JSON.stringify({
          ...parsed,
          consultingServiceFilter: filterVal
        }));
      }
    } catch { }
  };
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Portal candidate application received for Offshore Drilling Engineer', time: '10 mins ago', type: 'success' },
    { id: 2, text: 'Verified candidate credentials synced to recruiter dashboard', time: '1 hour ago', type: 'info' }
  ]);

  // Remove duplicate global dark mode sync as AppContext handles it

  // Handle Account Lockout Countdown
  useEffect(() => {
    let interval;
    if (accountLocked && lockoutTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            setAccountLocked(false);
            setFailedLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [accountLocked, lockoutTimeRemaining]);

  // Handle Session Idle Timeout Watcher (15 minutes = 900 seconds)
  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    const resetIdle = () => {
      setIdleTimeSeconds(0);
      if (showIdleModal) setShowIdleModal(false);
    };

    activityEvents.forEach(evt => window.addEventListener(evt, resetIdle));
    const timer = setInterval(() => {
      if (isAuthenticated) {
        setIdleTimeSeconds(prev => {
          if (prev >= 840 && !showIdleModal) {
            setShowIdleModal(true);
          }
          if (prev >= 900) {
            setIsAuthenticated(false);
            setCrmToken('');
            setSuperAdminToken('');
            setAuthTokenLoading(false);
            setShowIdleModal(false);
            try {
              localStorage.removeItem('sir_crm_session');
            } catch (e) { }
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdle));
      clearInterval(timer);
    };
  }, [isAuthenticated, showIdleModal]);

  // Global Keyboard Shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-acquire authenticated CRM session token if session is active but token is absent/empty
  useEffect(() => {
    if (isAuthenticated && !crmToken && currentRole && typeof fetch !== 'undefined') {
      fetch('/api/crm/auth/preview-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: currentRole,
          targetEmail: user?.email,
          employeeId: user?.id
        })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data.token) {
            setCrmToken(data.token);
            try {
              const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
              if (cur && cur.isAuthenticated) {
                localStorage.setItem('sir_crm_session', JSON.stringify({
                  ...cur,
                  crmToken: data.token
                }));
              }
            } catch (_) { }

            if (data.attendance && data.attendance.checkInAt && !data.attendance.checkOutAt) {
              const att = data.attendance;
              const sIn = new Date(att.checkInAt);
              const formatted = formatAttendanceClockTime(sIn);
              const isLate = Number(att.lateMinutes || 0) > 0;
              const punch = {
                status: isLate ? 'Late' : (att.status || 'Present'),
                checkInAt: att.checkInAt,
                checkOutAt: null,
                checkInFormatted: formatted,
                checkOutFormatted: null,
                isOnBreak: false,
                breakType: null,
                breakStartedAt: null,
                totalBreakMinutes: Number(att.totalBreakMinutes || 0),
                workDate: att.workDate || getAttendanceTodayDateStr(),
                liveWorkedSeconds: Math.max(1, Math.floor((Date.now() - sIn.getTime()) / 1000)),
                liveBreakSeconds: 0,
                lateMinutes: Number(att.lateMinutes || 0),
                isLate,
                shiftName: att.shiftName || 'General Day Shift (09:00 AM - 06:00 PM)',
                userEmail: user?.email,
                userName: user?.name,
                employeeId: user?.employeeId || user?.id
              };
              setAttendancePunch(punch);
              try {
                localStorage.setItem('sir_crm_my_attendance_active', JSON.stringify(punch));
              } catch (_) {}
            }
          }
        })
        .catch(() => { });
    }
  }, [isAuthenticated, crmToken, currentRole, user]);

  // Restore active attendance session directly from SQLite database on mount / token change
  useEffect(() => {
    if (!isAuthenticated || !crmToken || currentRole === 'Super Admin') return;
    fetch('/api/crm/auth/me', {
      headers: { Authorization: `Bearer ${crmToken}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.attendance && data.attendance.checkInAt && !data.attendance.checkOutAt) {
          const att = data.attendance;
          const sIn = new Date(att.checkInAt);
          const formatted = formatAttendanceClockTime(sIn);
          const isLate = Number(att.lateMinutes || 0) > 0;
          setAttendancePunch((prev) => {
            if (prev && prev.checkInAt === att.checkInAt && prev.checkOutAt) {
              return prev; // don't overwrite if explicitly checked out
            }
            const punch = {
              status: isLate ? 'Late' : (att.status || 'Present'),
              checkInAt: att.checkInAt,
              checkOutAt: null,
              checkInFormatted: formatted,
              checkOutFormatted: null,
              isOnBreak: false,
              breakType: null,
              breakStartedAt: null,
              totalBreakMinutes: Number(att.totalBreakMinutes || 0),
              workDate: att.workDate || getAttendanceTodayDateStr(),
              liveWorkedSeconds: Math.max(1, Math.floor((Date.now() - sIn.getTime()) / 1000)),
              liveBreakSeconds: 0,
              lateMinutes: Number(att.lateMinutes || 0),
              isLate,
              shiftName: att.shiftName || 'General Day Shift (09:00 AM - 06:00 PM)',
              userEmail: user?.email,
              userName: user?.name,
              employeeId: user?.employeeId || user?.id
            };
            try {
              localStorage.setItem('sir_crm_my_attendance_active', JSON.stringify(punch));
            } catch (_) {}
            return punch;
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated, crmToken, currentRole]);

  // =========================================================================
  // UNIVERSAL ATTENDANCE PUNCH STATE & CONTROLS (Clock In, Break, Clock Out)
  // =========================================================================
  const formatAttendanceClockTime = (isoOrTime) => {
    if (!isoOrTime) return '—';
    if (/^\d{2}:\d{2}(\s*(AM|PM))?$/i.test(isoOrTime)) return isoOrTime;
    const d = new Date(isoOrTime);
    if (Number.isNaN(d.getTime())) return String(isoOrTime);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceTodayDateStr = () =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const [attendancePunch, setAttendancePunch] = useState(() => {
    const today = getAttendanceTodayDateStr();
    try {
      const saved = localStorage.getItem('sir_crm_my_attendance_active');
      if (saved) {
        const p = JSON.parse(saved);
        if (p && p.workDate === today) {
          if (p.checkInAt && !p.checkOutAt) {
            const totalElapsed = Math.max(0, Math.floor((Date.now() - new Date(p.checkInAt).getTime()) / 1000));
            const netSeconds = Math.max(0, totalElapsed - ((p.totalBreakMinutes || 0) * 60));
            return { ...p, liveWorkedSeconds: netSeconds };
          }
          return p;
        }
      }
    } catch (_) { }
    return {
      status: 'Not Checked In',
      checkInAt: null,
      checkOutAt: null,
      checkInFormatted: null,
      checkOutFormatted: null,
      isOnBreak: false,
      breakType: null,
      breakStartedAt: null,
      totalBreakMinutes: 0,
      workDate: today,
      liveWorkedSeconds: 0,
      liveBreakSeconds: 0,
      lateMinutes: 0,
      isLate: false,
      shiftName: 'General Day Shift (09:00 AM - 06:00 PM)'
    };
  });

  // Keep attendancePunch in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sir_crm_my_attendance_active', JSON.stringify(attendancePunch));
    } catch (_) { }
  }, [attendancePunch]);

  // Live timer ticker effect (1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setAttendancePunch(prev => {
        if (!prev || !prev.checkInAt || prev.checkOutAt) return prev;
        if (prev.isOnBreak && prev.breakStartedAt) {
          const breakSecs = Math.max(0, Math.floor((Date.now() - new Date(prev.breakStartedAt).getTime()) / 1000));
          return { ...prev, liveBreakSeconds: breakSecs };
        }
        if (!prev.checkOutAt && (prev.status === 'Present' || prev.status === 'Late' || prev.status === 'In Progress' || prev.checkInAt)) {
          const totalElapsed = Math.max(0, Math.floor((Date.now() - new Date(prev.checkInAt).getTime()) / 1000));
          const netSeconds = Math.max(0, totalElapsed - ((prev.totalBreakMinutes || 0) * 60));
          return { ...prev, liveWorkedSeconds: netSeconds };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getOrFetchActiveToken = async (targetRole = null, targetUser = null) => {
    const role = targetRole || currentRole || 'HR Operations';
    const usr = targetUser || user;
    if (crmToken) return crmToken;
    try {
      const r = await fetch('/api/crm/auth/preview-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: role,
          targetEmail: usr?.email,
          employeeId: usr?.id || usr?.employeeId
        })
      });
      const d = await r.json();
      if (d?.success && d.token) {
        setCrmToken(d.token);
        return d.token;
      }
    } catch (_) { }
    return null;
  };

  // Late Arrival Super Admin Approval Gate State
  const [lateApprovalGate, setLateApprovalGate] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_late_approval_gate');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (lateApprovalGate) {
        localStorage.setItem('sir_crm_late_approval_gate', JSON.stringify(lateApprovalGate));
      } else {
        localStorage.removeItem('sir_crm_late_approval_gate');
      }
    } catch (_) { }
  }, [lateApprovalGate]);

  const checkLateApprovalStatus = async () => {
    try {
      const tok = await getOrFetchActiveToken(currentRole, user);
      const cleanEmail = (user?.email || '').trim().toLowerCase();
      const res = await fetch(`/api/hr-ops/attendance/late-approval-status?email=${encodeURIComponent(cleanEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-crm-role': currentRole || user?.role || 'Employee',
          'x-employee-email': cleanEmail,
          ...(tok ? { Authorization: `Bearer ${tok}` } : {})
        }
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.lateApprovalStatus === 'APPROVED' || data.lateApprovalStatus === 'EXEMPT') {
          setLateApprovalGate(null);
          localStorage.removeItem('sir_crm_late_approval_gate');
          return 'APPROVED';
        } else if (data.lateApprovalStatus === 'REJECTED') {
          setLateApprovalGate(prev => ({ ...prev, status: 'REJECTED' }));
          return 'REJECTED';
        } else if (data.lateApprovalStatus === 'PENDING') {
          setLateApprovalGate(prev => ({
            ...prev,
            isBlocked: true,
            status: 'PENDING',
            lateMinutes: data.lateMinutes,
            shiftName: data.shiftName,
            shiftStart: data.shiftStart,
            checkInAt: data.checkInAt ? new Date(data.checkInAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) : prev?.checkInAt,
            workDate: data.workDate
          }));
          return 'PENDING';
        }
      }
    } catch (_) { }
    return null;
  };

  const clockIn = async (notes = '', overrideUser = null, overrideRole = null) => {
    const activeUser = overrideUser || user;
    const activeRole = overrideRole || currentRole;

    // Super Admin is system root; exempt from employee attendance check-in
    if (activeRole === 'Super Admin') {
      return null;
    }

    const today = getAttendanceTodayDateStr();

    // Check if an active check-in for today already exists
    let existingPunch = null;
    try {
      const saved = localStorage.getItem('sir_crm_my_attendance_active');
      if (saved) {
        const p = JSON.parse(saved);
        if (p && p.workDate === today && p.checkInAt && (!p.userEmail || p.userEmail === activeUser?.email)) {
          existingPunch = p;
        }
      }
    } catch (_) { }

    if (existingPunch && existingPunch.checkInAt && !existingPunch.checkOutAt) {
      setAttendancePunch(existingPunch);
      return existingPunch;
    }

    const now = new Date();
    const checkInIso = now.toISOString();
    const formatted = formatAttendanceClockTime(now);

    // Calculate punctuality against 09:00 AM
    const parts = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' }).split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const totalMins = h * 60 + m;
    const shiftStartMins = 9 * 60; // 09:00 AM
    const lateM = Math.max(0, totalMins - shiftStartMins);
    const isLate = lateM > 15;

    const newPunch = {
      status: isLate ? 'Late' : 'Present',
      checkInAt: checkInIso,
      checkOutAt: null,
      checkInFormatted: formatted,
      checkOutFormatted: null,
      isOnBreak: false,
      breakType: null,
      breakStartedAt: null,
      totalBreakMinutes: 0,
      workDate: today,
      liveWorkedSeconds: 1,
      liveBreakSeconds: 0,
      lateMinutes: lateM,
      isLate,
      shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
      userEmail: activeUser?.email,
      userName: activeUser?.name,
      employeeId: activeUser?.employeeId || activeUser?.id
    };

    setAttendancePunch(newPunch);

    // Sync to localStorage
    try {
      localStorage.setItem('sir_crm_my_attendance_active', JSON.stringify(newPunch));
    } catch (_) { }

    // Sync to sir_crm_workforce_directory_v2
    try {
      const savedDir = localStorage.getItem('sir_crm_workforce_directory_v2');
      if (savedDir) {
        const dir = JSON.parse(savedDir);
        if (Array.isArray(dir)) {
          const updatedDir = dir.map(emp => {
            if (emp.email === activeUser?.email || emp.name === activeUser?.name || emp.role === activeRole) {
              return {
                ...emp,
                attendanceToday: {
                  ...emp.attendanceToday,
                  status: isLate ? 'Late' : 'Present',
                  checkIn: formatted,
                  checkOut: 'In Office',
                  late: isLate,
                  lateMinutes: lateM,
                  hours: 'Active',
                  punchSource: 'Portal Login SSO',
                  loginStatus: isLate ? `Late (${lateM} mins)` : 'On Time'
                }
              };
            }
            return emp;
          });
          localStorage.setItem('sir_crm_workforce_directory_v2', JSON.stringify(updatedDir));
        }
      }
    } catch (_) { }

    // Call backend API
    try {
      const tok = await getOrFetchActiveToken(activeRole, activeUser);
      if (tok) {
        const res = await fetch('/api/hr-ops/attendance/check-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tok}`
          },
          body: JSON.stringify({ notes: notes || 'Automated Portal Login Check-In' })
        });
        const resJson = await res.json();
        if (resJson?.data?.lateApprovalStatus) {
          const status = resJson.data.lateApprovalStatus;
          if (status === 'PENDING' && activeRole !== 'Super Admin' && activeRole !== 'Admin') {
            const gateObj = {
              isBlocked: true,
              status: 'PENDING',
              lateMinutes: resJson.data.lateMinutes || lateM,
              shiftName: resJson.data.shiftName || newPunch.shiftName,
              shiftStart: resJson.data.shiftStart || '09:00 AM',
              checkInAt: formatted,
              employeeName: activeUser?.name,
              role: activeRole,
              attendanceId: resJson.data.id,
              workDate: today
            };
            setLateApprovalGate(gateObj);
            try { localStorage.setItem('sir_crm_late_approval_gate', JSON.stringify(gateObj)); } catch (_) { }
          } else if (status === 'APPROVED' || status === 'EXEMPT') {
            setLateApprovalGate(null);
            try { localStorage.removeItem('sir_crm_late_approval_gate'); } catch (_) { }
          }
        }
      }
    } catch (_) { }

    // If locally determined late and non-executive, guarantee approval gate engages ONLY if not approved
    const serverApproval = resJson?.data?.lateApprovalStatus;
    if (isLate && activeRole !== 'Super Admin' && activeRole !== 'Admin' && serverApproval !== 'APPROVED' && serverApproval !== 'EXEMPT') {
      setLateApprovalGate(prev => (prev?.status === 'APPROVED' ? null : (prev || {
        isBlocked: true,
        status: 'PENDING',
        lateMinutes: lateM,
        shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
        shiftStart: '09:00 AM',
        checkInAt: formatted,
        employeeName: activeUser?.name,
        role: activeRole,
        workDate: today
      })));
    }

    return newPunch;
  };

  const startBreak = async (breakType = 'General Break') => {
    const nowIso = new Date().toISOString();
    setAttendancePunch(prev => ({
      ...prev,
      status: 'On Break',
      isOnBreak: true,
      breakType,
      breakStartedAt: nowIso,
      liveBreakSeconds: 1
    }));

    try {
      const tok = await getOrFetchActiveToken();
      if (tok) {
        await fetch('/api/hr-ops/attendance/break/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tok}`
          },
          body: JSON.stringify({ breakType })
        });
      }
    } catch (_) { }
  };

  const endBreak = async () => {
    let addMins = 0;
    setAttendancePunch(prev => {
      if (prev.breakStartedAt) {
        addMins = Math.max(1, Math.round((Date.now() - new Date(prev.breakStartedAt).getTime()) / 60000));
      }
      return {
        ...prev,
        status: prev.isLate ? 'Late' : 'Present',
        isOnBreak: false,
        breakType: null,
        breakStartedAt: null,
        totalBreakMinutes: (prev.totalBreakMinutes || 0) + addMins,
        liveBreakSeconds: 0
      };
    });

    try {
      const tok = await getOrFetchActiveToken();
      if (tok) {
        await fetch('/api/hr-ops/attendance/break/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tok}`
          },
          body: JSON.stringify({})
        });
      }
    } catch (_) { }
  };

  const clockOut = async (overrideUser = null, overrideRole = null) => {
    const activeUser = overrideUser || user;
    const activeRole = overrideRole || currentRole;

    if (activeRole === 'Super Admin') {
      return null;
    }

    const now = new Date();
    const checkOutIso = now.toISOString();
    const formattedOut = formatAttendanceClockTime(now);

    setAttendancePunch(prev => {
      const totalMins = prev?.checkInAt ? Math.max(0, Math.floor((now.getTime() - new Date(prev.checkInAt).getTime()) / 60000) - (prev.totalBreakMinutes || 0)) : 0;
      const hrs = (totalMins / 60).toFixed(1);
      const updated = {
        ...(prev || {}),
        status: 'Completed',
        checkOutAt: checkOutIso,
        checkOutFormatted: formattedOut,
        isOnBreak: false,
        breakType: null,
        breakStartedAt: null
      };

      try {
        localStorage.setItem('sir_crm_my_attendance_active', JSON.stringify(updated));
      } catch (_) { }

      try {
        const savedDir = localStorage.getItem('sir_crm_workforce_directory_v2');
        if (savedDir) {
          const dir = JSON.parse(savedDir);
          if (Array.isArray(dir)) {
            const updatedDir = dir.map(emp => {
              if (emp.email === activeUser?.email || emp.name === activeUser?.name || emp.role === activeRole) {
                return {
                  ...emp,
                  attendanceToday: {
                    ...emp.attendanceToday,
                    checkOut: formattedOut,
                    hours: `${hrs} hrs`,
                    status: 'Present'
                  }
                };
              }
              return emp;
            });
            localStorage.setItem('sir_crm_workforce_directory_v2', JSON.stringify(updatedDir));
          }
        }
      } catch (_) { }

      return updated;
    });
  };
  const hasPermission = (moduleName) => {
    if (!moduleName) return true;
    if (moduleName === 'my-profile') return true;
    if (moduleName === 'my-attendance') {
      return true;
    }
    if (moduleName === 'super-admin') {
      return currentRole === 'Super Admin';
    }
    if (currentRole === 'Super Admin') return true;
    if (typeof moduleName === 'string' && moduleName.startsWith('consulting')) {
      moduleName = 'consulting';
    }
    if (moduleName === 'hr-tasks') {
      return currentRole === 'HR Lead' || currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR Operations' || currentRole === 'HR & Talent Manager';
    }
    if (moduleName === 'hr-shifts') {
      const normRole = (currentRole || user?.role || user?.designation || '').toLowerCase().replace(/[-_]/g, ' ').trim();
      return normRole === 'hr lead' || normRole === 'super admin' || normRole === 'admin' || normRole === 'hr operations' || normRole.includes('hr') || normRole.includes('operations');
    }
    const permissions = (currentRole && ROLE_PERMISSIONS[currentRole]) || [];
    return permissions.includes('all') || permissions.includes(moduleName);
  };

  const updateUserProfile = (updatedFields) => {
    if (!updatedFields || typeof updatedFields !== 'object') return;
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      try {
        const saved = localStorage.getItem('sir_crm_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('sir_crm_session', JSON.stringify({
            ...parsed,
            user: next
          }));
        }
      } catch (_) { }
      return next;
    });
  };

  const login = (email, password, roleName, customData) => {
    if (accountLocked) return false;

    const assignedRole = roleName || currentRole;
    const emailLower = (email || '').toLowerCase().trim();

    let registeredInfo = customData;
    if (!registeredInfo) {
      try {
        const rawUsers = localStorage.getItem('sir_crm_registered_users');
        if (rawUsers) {
          const list = JSON.parse(rawUsers);
          registeredInfo = list.find(u => u.email && u.email.toLowerCase() === emailLower);
        }
      } catch (e) { }
    }

    let canonicalName = registeredInfo?.name;
    let canonicalEmployeeId = registeredInfo?.employeeId || registeredInfo?.id;
    let canonicalDept = registeredInfo?.department;
    let canonicalTeam = registeredInfo?.operationTeam;

    if (!canonicalName) {
      if (emailLower.includes('fatima')) {
        canonicalName = 'Fatima';
        canonicalEmployeeId = 'REV-EMP-107';
        canonicalDept = 'International HR Operations';
        canonicalTeam = 'International HR Operations';
      } else if (emailLower.includes('balavarshini')) {
        canonicalName = 'Balavarshini S.';
        canonicalEmployeeId = 'REV-EMP-006';
        canonicalDept = 'International HR Operations';
        canonicalTeam = 'International HR Operations';
      } else if (emailLower.includes('divya') || emailLower.includes('diviya')) {
        canonicalName = 'Divya R.';
        canonicalEmployeeId = 'REV-EMP-102';
        canonicalDept = 'Enquiry HR Operations';
        canonicalTeam = 'Enquiry HR Operations';
      } else if (emailLower.includes('praveen')) {
        canonicalName = 'Praveen Kumar';
        canonicalEmployeeId = 'REV-EMP-108';
        canonicalDept = 'Enquiry HR Operations';
        canonicalTeam = 'Enquiry HR Operations';
      } else if (emailLower.includes('priya')) {
        canonicalName = 'Priya Sharma';
        canonicalEmployeeId = 'REV-EMP-003';
        canonicalDept = 'Human Resources';
      } else if (emailLower.includes('thejobsyncit') || emailLower.includes('tariq')) {
        canonicalName = 'Super Admin';
        canonicalEmployeeId = 'REV-EMP-001';
        canonicalDept = 'Executive Management';
      } else if (emailLower.includes('sarah')) {
        canonicalName = 'Sarah Jenkins';
        canonicalEmployeeId = 'REV-EMP-002';
        canonicalDept = 'Administration';
      } else {
        canonicalName = email.split('@')[0].replace(/[0-9]/g, '').replace('.', ' ').trim();
        canonicalName = canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1);
      }
    }

    const resolvedTeamMemberId = registeredInfo?.teamMemberId || (
      canonicalName === 'Fatima' ? 'INTL-HR-101' :
        canonicalName?.includes('Balavarshini') ? 'INTL-HR-102' :
          canonicalName?.includes('Divya') ? 'ENQ-HR-201' :
            canonicalName?.includes('Praveen') ? 'ENQ-HR-202' : undefined
    );

    const resolvedDesignation = registeredInfo?.designation || (
      canonicalName === 'Fatima' ? 'International HR Operations Specialist' :
        canonicalName?.includes('Balavarshini') ? 'Lead HR Operations Specialist' :
          (canonicalName?.includes('Divya') || canonicalName?.includes('Praveen')) ? 'HR Operations Specialist' : undefined
    );

    const resolvedAvatar = registeredInfo?.avatar !== undefined ? registeredInfo.avatar : (
      assignedRole === 'HR Operations' ? '' : (
        canonicalName === 'Fatima' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' :
          canonicalName?.includes('Balavarshini') ? '' :
            canonicalName?.includes('Divya') ? '' :
              canonicalName?.includes('Praveen') ? '' :
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      )
    );

    const userData = {
      id: canonicalEmployeeId || ('usr-' + Math.floor(100 + Math.random() * 900)),
      employeeId: canonicalEmployeeId || registeredInfo?.employeeId || 'REV-EMP-006',
      teamMemberId: resolvedTeamMemberId,
      name: canonicalName || registeredInfo?.name || 'HR Specialist',
      email,
      workEmail: registeredInfo?.workEmail || email,
      role: assignedRole,
      department: canonicalDept || registeredInfo?.department || (assignedRole === 'HR Operations' ? 'HR Operations' : 'Enterprise Talent'),
      designation: resolvedDesignation,
      operationTeam: canonicalTeam || registeredInfo?.operationTeam || (
        assignedRole === 'HR Operations' ? (
          (canonicalName === 'Fatima' || canonicalName?.includes('Balavarshini')) ? 'International HR Operations' : 'Enquiry HR Operations'
        ) : undefined
      ),
      avatar: resolvedAvatar
    };


    setIsAuthenticated(true);
    setFailedLoginAttempts(0);
    setCurrentRole(assignedRole);
    setUser(userData);

    // Land directly on role dashboard upon login
    const nextModule = 'dashboard';
    setActiveModuleState(nextModule);

    try {
      localStorage.setItem('sir_crm_session', JSON.stringify({
        isAuthenticated: true,
        user: userData,
        currentRole: assignedRole,
        activeModule: nextModule,
        loginTime: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not save CRM session to localStorage', e);
    }

    // Exchange credentials for HMAC-signed server session token (non-blocking for sync login API)
    setCrmToken('');
    setSuperAdminToken('');
    if (typeof fetch !== 'undefined' && email && password) {
      setAuthTokenLoading(true);
      const loginPayload = {
        email,
        password,
        role: assignedRole,
        name: userData.name,
        department: userData.department,
        employeeId: userData.employeeId,
        operationTeam: userData.operationTeam,
        designation: userData.designation
      };
      const tryFetchLogin = async () => {
        const endpoints = ['/api/crm/auth/login', 'http://localhost:5000/api/crm/auth/login'];
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginPayload)
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.success && data.token) {
                setCrmToken(data.token);
                const isAdminAccount = data.employee?.role === 'Super Admin' || assignedRole === 'Super Admin';
                if (isAdminAccount) {
                  setSuperAdminToken(data.token);
                }
                try {
                  const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                  if (cur && cur.isAuthenticated) {
                    localStorage.setItem('sir_crm_session', JSON.stringify({
                      ...cur,
                      crmToken: data.token,
                      ...(isAdminAccount ? { superAdminToken: data.token } : {})
                    }));
                  }
                } catch { }
                break;
              }
            }
          } catch (_) { }
        }
        setAuthTokenLoading(false);
      };
      tryFetchLogin();
    } else {
      setAuthTokenLoading(false);
    }

    // Automatic Check-In on Login for all employees except Super Admin
    const isExecutive = assignedRole === 'Super Admin';
    if (!isExecutive) {
      setTimeout(() => {
        clockIn('Automated check-in on front portal login', userData, assignedRole);
      }, 50);
    }

    logAuditAction(`User ${email} logged in under role '${assignedRole}'.`);
    return true;
  };

  const recordFailedLogin = () => {
    // Lockout timer disabled - direct error messages shown instead
    setFailedLoginAttempts(prev => prev + 1);
  };

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutLockRef = useRef(false);

  const logout = () => {
    // If user is a non-executive employee and has active unlocked workspace, automatically clock them out upon logout.
    // If they are currently gated at the late arrival gate, do NOT record a workday checkout.
    const isExecutive = currentRole === 'Super Admin';
    if (!isExecutive && user && !lateApprovalGate?.isBlocked) {
      try {
        clockOut(user, currentRole);
      } catch (_) { }
    }

    setIsAuthenticated(false);
    setLogoutConfirmOpen(false);
    setActiveModuleState('dashboard');
    setCrmToken('');
    setSuperAdminToken('');
    setAuthTokenLoading(false);
    setAttendanceNotifications([]);
    setLateApprovalGate(null);
    try {
      localStorage.removeItem('sir_crm_late_approval_gate');
      localStorage.removeItem('sir_crm_session');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('candidateKey')) {
          url.searchParams.delete('candidateKey');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (e) { }
    logAuditAction(`User ${user.name} logged out.`);
  };

  const requestLogout = () => {
    if (logoutLockRef.current) return;
    if (currentRole === 'HR Operations') {
      setLogoutConfirmOpen(true);
      return;
    }
    logout();
  };

  const closeLogoutConfirm = () => {
    if (logoutLockRef.current) return;
    setLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    if (logoutLockRef.current) return;
    logoutLockRef.current = true;
    setIsLoggingOut(true);
    try {
      logout();
    } finally {
      setLogoutConfirmOpen(false);
      window.setTimeout(() => {
        logoutLockRef.current = false;
        setIsLoggingOut(false);
      }, 0);
    }
  };

  const logoutEverywhere = () => {
    setActiveDevices(prev => prev.filter(d => d.current));
    logAuditAction(`Revoked all active remote session refresh tokens.`);
  };

  const updateCandidateStage = (candidateId, newStage) => {
    setCandidates(prev => prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c)));
    logAuditAction(`Updated candidate ${candidateId} stage to '${newStage}'.`);
  };

  const addCandidate = async (newCand) => {
    const candidateToAdd = { ...newCand, id: newCand.id || `REV-CAN-${Math.floor(Math.random() * 9000) + 1000}` };
    setCandidates(prev => {
      const updated = [candidateToAdd, ...prev.filter(c => c.id !== candidateToAdd.id)];
      try {
        localStorage.setItem('crm_candidates', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    logAuditAction(`Added new candidate ${candidateToAdd.name} (${candidateToAdd.id}).`);
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateToAdd)
      });
    } catch (err) {
      console.error('Failed to sync added candidate to backend:', err);
    }
  };

  const updateCandidate = async (updatedCand) => {
    setCandidates(prev => {
      const updated = prev.map(c => c.id === updatedCand.id ? updatedCand : c);
      try {
        localStorage.setItem('crm_candidates', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    logAuditAction(`Updated candidate profile ${updatedCand.id}.`);
    try {
      await fetch(`/api/candidates/${updatedCand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCand)
      });
    } catch (err) { }
  };

  const deleteCandidate = useCallback(async (candidateId, metadata = {}) => {
    try {
      const activeRole = currentRole || user?.role || 'Super Admin';
      const activeUserName = user?.name || 'Super Admin';
      const activeUserId = user?.id || 'usr-superadmin';
      const candEmail = (metadata.email || '').toLowerCase().trim();

      // 1. Wipe candidate from deleted candidates blacklist so they can freshly re-register from scratch
      try {
        const deletedStr = localStorage.getItem('sir_deleted_candidates');
        if (deletedStr) {
          const deletedArr = JSON.parse(deletedStr);
          if (Array.isArray(deletedArr)) {
            const cleaned = deletedArr.filter(x => {
              const str = String(x).toLowerCase().trim();
              return str !== candidateId.toLowerCase().trim() && (candEmail ? str !== candEmail : true);
            });
            localStorage.setItem('sir_deleted_candidates', JSON.stringify(cleaned));
          }
        }
      } catch { }

      // 2. Eradicate from sir_candidates_db so it can never resurrect
      try {
        const dbStr = localStorage.getItem('sir_candidates_db');
        if (dbStr) {
          const db = JSON.parse(dbStr);
          if (candEmail && db[candEmail]) {
            delete db[candEmail];
          }
          Object.keys(db).forEach(k => {
            if (db[k]?.id === candidateId || db[k]?.candidateId === candidateId || (candEmail && db[k]?.email?.toLowerCase().trim() === candEmail)) {
              delete db[k];
            }
          });
          localStorage.setItem('sir_candidates_db', JSON.stringify(db));
        }
      } catch { }

      // 3. Clear sir_user_session if current session matches deleted candidate
      try {
        const sessStr = localStorage.getItem('sir_user_session');
        if (sessStr) {
          const sess = JSON.parse(sessStr);
          if (sess?.id === candidateId || sess?.candidateId === candidateId || (candEmail && sess?.email?.toLowerCase().trim() === candEmail)) {
            localStorage.removeItem('sir_user_session');
          }
        }
      } catch { }

      // 4. Wipe candidate application session cache while preserving central sir_job_applications for CRM registry
      try {
        localStorage.removeItem(`sir_applications_${candidateId}`);
        if (candEmail) {
          localStorage.removeItem(`sir_applications_${candEmail}`);
        }
      } catch { }

      // 5. Send DELETE request to backend & cloud database with authoritative candidate ID & email
      const candPhone = (metadata.phone || '').trim();
      const queryParams = new URLSearchParams();
      if (candEmail) queryParams.set('email', candEmail);
      if (candPhone) queryParams.set('phone', candPhone);
      const queryString = queryParams.toString();
      const deleteUrl = `/api/candidates/${encodeURIComponent(candidateId)}${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CRM-Role': activeRole,
          'X-CRM-User': activeUserName,
          'X-CRM-User-Id': activeUserId
        },
        body: JSON.stringify({
          id: candidateId,
          email: candEmail,
          phone: candPhone,
          name: metadata.name || ''
        })
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};

      // 6. Update CRM candidates state & crm_candidates localStorage
      setCandidates(prev => {
        const updated = (prev || []).filter(c => c.id !== candidateId && (candEmail ? c.email?.toLowerCase().trim() !== candEmail : true));
        try {
          localStorage.setItem('crm_candidates', JSON.stringify(updated));
        } catch { }
        return updated;
      });

      // 7. Broadcast candidate-deleted event across window and tabs
      window.dispatchEvent(new CustomEvent('candidate-deleted', { detail: { candidateId, email: candEmail } }));

      logAuditAction(`Permanently deleted candidate '${candidateId}' (${metadata.name || ''}).`);
      return data;
    } catch (err) {
      console.error('Error in deleteCandidate:', err);
      logAuditAction(`Permanently deleted candidate '${candidateId}' (${metadata.name || ''}).`);
      return { success: true };
    }
  }, [currentRole, user]);

  const addClient = (newClient) => {
    const clientToAdd = { ...newClient, id: `CLI-${Math.floor(Math.random() * 9000) + 1000}`, agreementStatus: 'Active', logo: newClient.company.charAt(0).toUpperCase() };
    setClients(prev => [clientToAdd, ...prev]);
    logAuditAction(`Registered new client account ${clientToAdd.company} (${clientToAdd.id}).`);
  };

  const removeClient = async (clientId) => {
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend delete error (continuing with local removal):', err);
    }
    setClients(prev => prev.filter(c => c.id !== clientId));
    logAuditAction(`Deleted corporate client account ${clientId}.`);
    await fetchConsultingMetrics();
  };

  const addInterview = async (newInterview) => {
    const interviewToAdd = { ...newInterview, id: newInterview.id || `INT-${Math.floor(Math.random() * 9000) + 1000}` };
    setInterviews(prev => [interviewToAdd, ...prev]);
    setCalendarEvents(prev => [
      ...prev,
      { id: Date.now(), title: `${interviewToAdd.candidateName} ${interviewToAdd.platform || 'Interview'}`, time: interviewToAdd.time, type: 'Interview', candidate: interviewToAdd.candidateName, date: interviewToAdd.date }
    ]);
    logAuditAction(`Scheduled new interview for ${interviewToAdd.candidateName}.`);

    if (interviewToAdd.candidateId) {
      updateCandidateStage(interviewToAdd.candidateId, 'hr_interview');
    }

    try {
      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewToAdd)
      });
    } catch (err) {
      console.warn('Failed to sync added interview to backend:', err);
    }
  };

  const updateInterview = async (updatedInterview) => {
    setInterviews(prev => prev.map(i => i.id === updatedInterview.id ? updatedInterview : i));
    logAuditAction(`Updated interview record ${updatedInterview.id}.`);

    const isSelected = updatedInterview.result === 'Selected' || updatedInterview.result === 'Passed' || updatedInterview.status === 'Passed' || updatedInterview.status === 'Selected';
    if (isSelected && updatedInterview.candidateId) {
      updateCandidateStage(updatedInterview.candidateId, 'selected');
    } else if ((updatedInterview.result === 'Rejected' || updatedInterview.status === 'Rejected') && updatedInterview.candidateId) {
      updateCandidateStage(updatedInterview.candidateId, 'rejected');
    }

    try {
      await fetch(`/api/interviews/${updatedInterview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInterview)
      });
    } catch (err) {
      console.warn('Failed to sync updated interview to backend:', err);
    }
  };

  const issueOfferLetter = async (candidateId, offerData) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/issue-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        updateCandidateStage(candidateId, 'offer_released');
        setCandidates(prev => prev.map(c => c.id === candidateId ? {
          ...c,
          stage: 'offer_released',
          offerDetails: data.offerDetails,
          placementStatus: 'Offered'
        } : c));
        logAuditAction(`Issued official ${offerData.offerType === 'college_admission' ? 'Admission' : 'Offer'} Letter to candidate ${candidateId}.`);
      }
      return data;
    } catch (err) {
      console.error('Failed to issue offer letter:', err);
      updateCandidateStage(candidateId, 'offer_released');
      setCandidates(prev => prev.map(c => c.id === candidateId ? {
        ...c,
        stage: 'offer_released',
        offerDetails: offerData,
        placementStatus: 'Offered'
      } : c));
      return { success: true, fallback: true };
    }
  };

  const respondToOffer = async (candidateId, action, reason = '') => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/respond-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json().catch(() => ({}));
      const nextStage = action === 'accept' ? 'offer_accepted' : 'rejected';
      updateCandidateStage(candidateId, nextStage);
      setCandidates(prev => prev.map(c => c.id === candidateId ? {
        ...c,
        stage: nextStage,
        placementStatus: action === 'accept' ? 'Offer Accepted' : 'Declined'
      } : c));
      logAuditAction(`Candidate ${candidateId} ${action === 'accept' ? 'Accepted' : 'Declined'} offer.`);
      return data;
    } catch (err) {
      const nextStage = action === 'accept' ? 'offer_accepted' : 'rejected';
      updateCandidateStage(candidateId, nextStage);
      return { success: true, nextStage };
    }
  };

  const deleteInterview = async (interviewId, metadata = {}) => {
    try {
      const activeRole = currentRole || user?.role || 'Super Admin';
      const activeUserName = user?.name || 'Super Admin';
      const activeUserId = user?.id || 'usr-superadmin';

      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CRM-Role': activeRole,
          'X-CRM-User': activeUserName,
          'X-CRM-User-Id': activeUserId
        }
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      logAuditAction(`Permanently deleted interview '${interviewId}' (${metadata.candidateName || ''}).`);
      setInterviews(prev => prev.filter(i => i.id !== interviewId));
      return data;
    } catch (err) {
      console.error('Error in deleteInterview:', err);
      setInterviews(prev => prev.filter(i => i.id !== interviewId));
      logAuditAction(`Permanently deleted interview '${interviewId}' (${metadata.candidateName || ''}).`);
      throw err;
    }
  };

  const addCalendarEvent = (newEvent) => {
    setCalendarEvents(prev => [...prev, { ...newEvent, id: Date.now() }]);
    logAuditAction(`Added new calendar event: ${newEvent.title}.`);
  };

  const removeCalendarEvent = (eventId) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
    logAuditAction(`Removed calendar event ${eventId}.`);
  };

  const addInvoice = (newInvoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    logAuditAction(`Generated new invoice for ${newInvoice.client}.`);
  };

  const updateInvoice = (updatedInvoice) => {
    setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    logAuditAction(`Updated invoice ${updatedInvoice.id}.`);
  };

  const addRecruiterTask = (task) => setRecruiterTasks(prev => [...prev, task]);
  const removeRecruiterTask = (id) => setRecruiterTasks(prev => prev.filter(t => t.id !== id));
  const toggleRecruiterTask = (id) => setRecruiterTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const switchRole = (newRole) => {
    setCurrentRole(newRole);

    // Realistic corporate profile personas for authentic role-testing
    const ROLE_PERSONAS = {
      'Super Admin': { id: 'emp-tariq', employeeId: 'REV-EMP-000', name: 'Tariq Mansoor', email: 'tariq.admin@revivalinternational.com', altEmail: 'thejobsyncit@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', department: 'Executive Management' },
      'Admin': { id: 'emp-2', employeeId: 'REV-EMP-002', name: 'Sarah Jenkins', email: 'sarah.admin@revivalinternational.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', department: 'Administration' },
      'HR Lead': { id: 'emp-3', employeeId: 'REV-EMP-003', name: 'Sarah Al Zaabi', email: 'sarah.hr@revivalinternational.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', department: 'Human Resources' },
      'Recruiter': { id: 'emp-4', employeeId: 'REV-EMP-004', name: 'Kishore Kumar', email: 'kishore.recruiter@revivalinternational.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', department: 'Recruitment & ATS' },
      'Placement Coordinator': { id: 'emp-5', employeeId: 'REV-EMP-005', name: 'Dhanalakshimi', email: 'dhana.jasync@gmail.com', altEmail: 'dhanalakshimi@revivalinternational.com', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80', department: 'Placement & Industry Relations' },
      'HR Operations': { id: 'emp-6', employeeId: 'REV-EMP-006', name: 'Balavarshini S.', email: 'balavarshini.s@revivalinternational.com', altEmail: 'balavarshini2223@gmail.com', avatar: '', department: 'International HR Operations', operationTeam: 'International HR Operations', designation: 'Lead HR Operations Specialist' },
      'Interviewer': { id: 'emp-tariq', employeeId: 'REV-EMP-007', name: 'Dr. Tariq Al-Hashimi', email: 'tariq.interviewer@revivalinternational.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', department: 'Technical & Academic Assessment Panel', designation: 'Senior Technical Interviewer & Panellist' }
    };

    const persona = ROLE_PERSONAS[newRole] || { id: 'EMP-001', name: newRole, email: `${newRole.toLowerCase().replace(/\s+/g, '.')}@revivalinternational.com` };
    const updatedUser = { ...user, ...persona, role: newRole };
    setUser(updatedUser);

    setLateApprovalGate(null);
    try { localStorage.removeItem('sir_crm_late_approval_gate'); } catch (_) { }

    let nextMod = 'dashboard';
    setActiveModule('dashboard');
    if (newRole !== 'HR Operations' && typeof window !== 'undefined') {
      try {
        const urlObj = new URL(window.location.href);
        if (urlObj.searchParams.has('candidateKey')) {
          urlObj.searchParams.delete('candidateKey');
          window.history.replaceState({}, '', urlObj.toString());
        }
      } catch { }
    }
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem('sir_crm_session');
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem('sir_crm_session', JSON.stringify({
          ...prev,
          isAuthenticated: true,
          user: updatedUser,
          currentRole: newRole,
          activeModule: 'dashboard'
        }));
      } catch (e) { }
      const activeBearer = crmToken || superAdminToken;
      if (typeof fetch !== 'undefined') {
        const restoreTok = superAdminToken || (user?.role === 'Super Admin' ? crmToken : '');
        if (restoreTok && !superAdminToken) {
          setSuperAdminToken(restoreTok);
        }
        setAuthTokenLoading(true);

        const acquireTokenForSwitch = async () => {
          let tokenAcquired = false;
          if (activeBearer) {
            try {
              const res = await fetch('/api/crm/auth/switch-preview-role', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${activeBearer}`
                },
                body: JSON.stringify({ targetRole: newRole, restoreToken: restoreTok })
              });
              if (res.ok) {
                const data = await res.json();
                if (data?.success && data.token) {
                  tokenAcquired = true;
                  setCrmToken(data.token);
                  const resolvedEmp = data.employee ? { ...updatedUser, ...data.employee, role: newRole } : updatedUser;
                  setUser(resolvedEmp);
                  try {
                    const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                    if (cur && cur.isAuthenticated) {
                      localStorage.setItem('sir_crm_session', JSON.stringify({
                        ...cur,
                        user: resolvedEmp,
                        currentRole: newRole,
                        crmToken: data.token,
                        ...(restoreTok ? { superAdminToken: restoreTok } : {})
                      }));
                    }
                  } catch { }
                }
              }
            } catch { }
          }

          if (!tokenAcquired) {
            try {
              const res = await fetch('/api/crm/auth/preview-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetRole: newRole })
              });
              if (res.ok) {
                const data = await res.json();
                if (data?.success && data.token) {
                  tokenAcquired = true;
                  setCrmToken(data.token);
                  const resolvedEmp = data.employee ? { ...updatedUser, ...data.employee, role: newRole } : updatedUser;
                  setUser(resolvedEmp);
                  try {
                    const cur = JSON.parse(localStorage.getItem('sir_crm_session') || '{}');
                    if (cur && cur.isAuthenticated) {
                      localStorage.setItem('sir_crm_session', JSON.stringify({
                        ...cur,
                        user: resolvedEmp,
                        currentRole: newRole,
                        crmToken: data.token,
                        ...(restoreTok ? { superAdminToken: restoreTok } : {})
                      }));
                    }
                  } catch { }
                }
              }
            } catch { }
          }
          setAuthTokenLoading(false);
        };

        acquireTokenForSwitch();
      }
    } else {
      try {
        const raw = localStorage.getItem('sir_crm_session');
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem('sir_crm_session', JSON.stringify({
          ...prev,
          user: updatedUser,
          currentRole: newRole,
          activeModule: 'dashboard'
        }));
      } catch (e) { }
    }
    logAuditAction(`Switched active session view role to '${newRole}'.`);
  };

  const logAuditAction = (actionText) => {
    const newLog = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: user ? user.name : 'System',
      role: currentRole,
      action: actionText,
      ip: '194.170.21.90'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sir_theme_mode', next ? 'dark' : 'light');
      } catch (e) { }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const createOrganization = async (orgData) => {
    const localId = `ORG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrgRecord = {
      id: localId,
      ...orgData,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    // Immediately persist locally to state & localStorage
    setClients(prev => {
      const updated = [newOrgRecord, ...prev.filter(c => c.id !== localId && (c.company || '').toLowerCase().trim() !== (orgData.company || '').toLowerCase().trim())];
      try {
        localStorage.setItem('crm_clients', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        logAuditAction(`Registered organization account '${orgData.company}' (${data.data?.id || localId}).`);
        setClients(prev => {
          const updated = prev.map(c => c.id === localId ? { ...c, ...data.data } : c);
          try {
            localStorage.setItem('crm_clients', JSON.stringify(updated));
          } catch { }
          return updated;
        });
        await fetchConsultingMetrics();
        return data.data;
      }
    } catch (err) {
      console.warn('Network sync warning in createOrganization (saved in localStorage):', err);
    }

    logAuditAction(`Registered organization account '${orgData.company}' (${localId}).`);
    await fetchConsultingMetrics();
    return newOrgRecord;
  };

  const updateOrganization = async (orgId, updates) => {
    try {
      const res = await fetch(`/api/clients/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update organization');
      }
      logAuditAction(`Updated organization profile '${orgId}'.`);
      await fetchClients();
      return data.data;
    } catch (err) {
      console.error('Error in updateOrganization:', err);
      throw err;
    }
  };

  const addContactToOrganization = async (orgId, contactData) => {
    try {
      const res = await fetch(`/api/clients/${orgId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add contact');
      }
      logAuditAction(`Added contact '${contactData.name}' to organization '${orgId}'.`);
      return data.data;
    } catch (err) {
      console.error('Error in addContactToOrganization:', err);
      throw err;
    }
  };

  const updateLead = async (leadId, updates) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedBy: user?.name || 'Staff' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update lead');
      }
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data.data } : l));
      logAuditAction(`Updated enquiry '${leadId}' status to '${updates.status || 'Updated'}'.`);
      await fetchConsultingMetrics();
      return data.data;
    } catch (err) {
      console.error('Error in updateLead:', err);
      throw err;
    }
  };

  const addLeadActivity = async (leadId, activityData) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activityData, createdBy: user?.name || 'Staff' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to log activity');
      }
      logAuditAction(`Logged '${activityData.type}' activity for enquiry '${leadId}'.`);
      return data.data;
    } catch (err) {
      console.error('Error in addLeadActivity:', err);
      throw err;
    }
  };

  const scheduleLeadFollowUp = async (leadId, followUpData) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...followUpData, createdBy: user?.name || 'Staff' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to schedule follow-up');
      }
      logAuditAction(`Scheduled follow-up '${followUpData.title}' for enquiry '${leadId}'.`);
      await fetchFollowUps();
      await fetchConsultingMetrics();
      await fetchLeads();
      return data.data;
    } catch (err) {
      console.error('Error in scheduleLeadFollowUp:', err);
      throw err;
    }
  };

  const updateFollowUpStatus = async (followUpId, status, completionNotes) => {
    try {
      const res = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completionNotes, updatedBy: user?.name || 'Staff' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update follow-up');
      }
      logAuditAction(`Marked follow-up '${followUpId}' as '${status}'.`);
      await fetchFollowUps();
      await fetchConsultingMetrics();
      return data.data;
    } catch (err) {
      console.error('Error in updateFollowUpStatus:', err);
      throw err;
    }
  };

  const archiveLead = async (leadId, isArchived = true) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: isArchived ? 1 : 0, updatedBy: user?.name || 'Staff' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to archive lead');
      }
      logAuditAction(`${isArchived ? 'Archived' : 'Restored'} lead '${leadId}'.`);
      await fetchLeads();
      await fetchLeadMetrics();
      await fetchConsultingMetrics();
      return data;
    } catch (err) {
      console.error('Error in archiveLead:', err);
      throw err;
    }
  };

  const deleteLead = async (leadId, metadata = {}) => {
    try {
      const activeRole = currentRole || user?.role || 'Super Admin';
      const activeUserName = user?.name || 'Super Admin';
      const activeUserId = user?.id || 'usr-superadmin';

      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CRM-Role': activeRole,
          'X-CRM-User': activeUserName,
          'X-CRM-User-Id': activeUserId
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete record');
      }

      // Also remove from localStorage offline leads fallback
      try {
        const stored = localStorage.getItem('sir_offline_leads');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(l => l.id !== leadId && l.referenceNumber !== leadId);
            localStorage.setItem('sir_offline_leads', JSON.stringify(filtered));
          }
        }
      } catch (e) { }

      logAuditAction(`Permanently deleted ${metadata.entityType || 'lead'} '${leadId}' (${metadata.name || metadata.referenceNumber || ''}).`);
      setLeads(prev => prev.filter(l => l.id !== leadId && l.referenceNumber !== leadId));
      if (fetchLeads) await fetchLeads();
      if (fetchLeadMetrics) await fetchLeadMetrics();
      if (fetchConsultingMetrics) await fetchConsultingMetrics();
      return data;
    } catch (err) {
      console.error('Error in deleteLead:', err);
      throw err;
    }
  };

  const deleteInvoice = (invoiceId, metadata = {}) => {
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));
    logAuditAction(`Permanently deleted invoice '${invoiceId}' (${metadata.client || ''}).`);
  };

  const currentEmployee = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id || user.employeeId || 'REV-EMP-006',
      employeeId: user.employeeId || user.id || 'REV-EMP-006',
      teamMemberId: user.teamMemberId || (
        user.name === 'Fatima' ? 'INTL-HR-101' :
          user.name?.includes('Balavarshini') ? 'INTL-HR-102' :
            user.name?.includes('Divya') ? 'ENQ-HR-201' :
              user.name?.includes('Praveen') ? 'ENQ-HR-202' : 'INTL-HR-102'
      ),
      name: user.name || (currentRole === 'HR Operations' ? 'Balavarshini S.' : 'HR Lead'),
      email: user.email || 'balavarshini.s@revivalinternational.com',
      workEmail: user.workEmail || user.email || 'balavarshini.s@revivalinternational.com',
      role: currentRole || user.role,
      department: user.department || 'HR Operations',
      designation: user.designation || (
        user.name === 'Fatima' ? 'International HR Operations Specialist' :
          user.name?.includes('Balavarshini') ? 'Lead HR Operations Specialist' :
            (user.name?.includes('Divya') || user.name?.includes('Praveen')) ? 'HR Operations Specialist' : 'HR Operations Specialist'
      ),
      operationTeam: user.operationTeam || (
        (user.name === 'Fatima' || user.name?.includes('Balavarshini')) ? 'International HR Operations' : 'Enquiry HR Operations'
      )
    };
  }, [user, currentRole]);

  return (
    <CrmContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        requestLogout,
        logoutConfirmOpen,
        isLoggingOut,
        closeLogoutConfirm,
        confirmLogout,
        logoutEverywhere,
        recordFailedLogin,
        failedLoginAttempts,
        accountLocked,
        lockoutTimeRemaining,
        activeDevices,
        user,
        currentEmployee,
        attendancePunch,
        clockIn,
        startBreak,
        endBreak,
        clockOut,
        updateUserProfile,
        crmToken,
        authTokenLoading,
        setCrmToken,
        syncAttendanceNotifications,
        lateApprovalGate,
        setLateApprovalGate,
        checkLateApprovalStatus,
        currentRole,
        isSuperAdmin,
        switchRole,
        hasPermission,
        darkMode,
        toggleDarkMode,
        activeModule,
        setActiveModule,
        candidates,
        loadingCandidates,
        fetchCandidates,
        applications,
        loadingApplications,
        fetchApplications,
        updateApplicationStatus,
        deleteApplication,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        updateCandidateStage,
        selectedCandidate,
        setSelectedCandidate,
        clients,
        fetchClients,
        addClient,
        removeClient,
        createOrganization,
        updateOrganization,
        addContactToOrganization,
        interviews,
        addInterview,
        updateInterview,
        deleteInterview,
        issueOfferLetter,
        respondToOffer,
        calendarEvents,
        addCalendarEvent,
        removeCalendarEvent,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recruiterTasks,
        addRecruiterTask,
        removeRecruiterTask,
        toggleRecruiterTask,
        recruiterNotes,
        setRecruiterNotes,
        auditLogs,
        logAuditAction,
        commandPaletteOpen,
        setCommandPaletteOpen,
        aiDrawerOpen,
        setAiDrawerOpen,
        notificationsOpen,
        setNotificationsOpen,
        notifications: [...attendanceNotifications, ...notifications],
        idleTimeSeconds,
        showIdleModal,
        setShowIdleModal,
        globalAddCandidateOpen,
        setGlobalAddCandidateOpen,
        globalAddClientOpen,
        setGlobalAddClientOpen,
        globalAddInterviewOpen,
        setGlobalAddInterviewOpen,
        globalAddInvoiceOpen,
        setGlobalAddInvoiceOpen,
        leads,
        setLeads,
        isDummyLead,
        loadingLeads,
        fetchLeads,
        updateLead,
        archiveLead,
        deleteLead,
        addLeadActivity,
        scheduleLeadFollowUp,
        updateFollowUpStatus,
        followUps,
        loadingFollowUps,
        fetchFollowUps,
        consultingMetrics,
        fetchConsultingMetrics,
        leadMetrics,
        fetchLeadMetrics,
        serviceBreakdown,
        followUpsSummary,
        fetchFollowUpsSummary,
        selectedMetricsRange,
        setSelectedMetricsRange,
        consultingServiceFilter,
        setConsultingServiceFilter
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);

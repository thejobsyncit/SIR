import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRM_ROLES, ROLE_PERMISSIONS, CRM_CANDIDATES, CRM_CLIENTS, CRM_INTERVIEWS, CRM_INVOICES, PIPELINE_STAGES, AUDIT_LOGS } from '../data/mockCrmData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  // Default to false so user sees the Login screen first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    id: 'emp-1',
    name: 'Dhanalakshimi',
    email: 'dhana.jasync@gmail.com',
    role: 'Super Admin',
    department: 'India Operations HQ',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  });

  const [currentRole, setCurrentRole] = useState('Super Admin');
  const isSuperAdmin = currentRole === 'Super Admin' || user?.role === 'Super Admin';

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_theme_mode');
      return saved === 'dark';
    } catch {
      return false;
    }
  });
  const loadState = (key, defaultData) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultData;
      const parsed = JSON.parse(saved);
      // Auto-purge any stale fake/mock data from previous seeds
      if (Array.isArray(parsed)) {
        const hasMockData = parsed.some(item => 
          item?.id?.includes?.('REV-CAN-100') ||
          item?.id?.includes?.('CLI-50') ||
          item?.id?.includes?.('INT-88') ||
          item?.id?.includes?.('INV-2026-') ||
          item?.candidate === 'Alexander Wright' ||
          item?.name === 'Alexander Wright' ||
          item?.candidateName === 'Alexander Wright'
        );
        if (hasMockData) {
          localStorage.removeItem(key);
          return defaultData;
        }
      } else if (typeof parsed === 'string' && (parsed.includes('Hassan Al-Habtoor') || parsed.includes('Riyadh candidates'))) {
        localStorage.removeItem(key);
        return defaultData;
      }
      return parsed;
    } catch {
      return defaultData;
    }
  };

  const [candidates, setCandidates] = useState(() => loadState('crm_candidates', CRM_CANDIDATES));
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
      if (data && data.success && Array.isArray(data.data)) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Failed to load leads from backend:', err);
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

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setClients(data.data);
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
    fetchLeads();
    fetchClients();
    fetchFollowUps();
    fetchConsultingMetrics();
    fetchLeadMetrics();
    fetchFollowUpsSummary();
    // Periodically sync new inquiries, follow-ups, and metrics every 15 seconds
    const interval = setInterval(() => {
      fetchLeads();
      fetchFollowUps();
      fetchConsultingMetrics();
      fetchLeadMetrics();
      fetchFollowUpsSummary();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
  const [activeModule, setActiveModule] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Degree Attestation Verified for Candidate Alexander Wright', time: '10 mins ago', type: 'success' },
    { id: 2, text: 'MOM Singapore Work Pass Approved for Elena Rostova', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'Invoice INV-2026-091 Payment Reminder Triggered', time: '3 hours ago', type: 'warning' }
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
            setShowIdleModal(false);
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

  const hasPermission = (moduleName) => {
    if (moduleName === 'super-admin') {
      return currentRole === 'Super Admin';
    }
    if (currentRole === 'Super Admin') return true;
    const permissions = ROLE_PERMISSIONS[currentRole] || [];
    return permissions.includes('all') || permissions.includes(moduleName);
  };

  const login = (email, password, roleName) => {
    if (accountLocked) return false;
    
    const assignedRole = roleName || currentRole;
    setIsAuthenticated(true);
    setFailedLoginAttempts(0);
    setCurrentRole(assignedRole);
    setUser({
      id: 'usr-' + Math.floor(100 + Math.random() * 900),
      name: email.split('@')[0].toUpperCase().replace('.', ' '),
      email,
      role: assignedRole,
      department: 'Enterprise Talent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // Ensure active module is allowed for assigned role
    const perms = ROLE_PERMISSIONS[assignedRole] || [];
    if (assignedRole !== 'Super Admin' && !perms.includes('all') && !perms.includes(activeModule)) {
      setActiveModule(perms[0] || 'workspace');
    }

    logAuditAction(`User ${email} logged in under role '${assignedRole}'.`);
    return true;
  };

  const recordFailedLogin = () => {
    // Lockout timer disabled - direct error messages shown instead
    setFailedLoginAttempts(prev => prev + 1);
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAuditAction(`User ${user.name} logged out.`);
  };

  const logoutEverywhere = () => {
    setActiveDevices(prev => prev.filter(d => d.current));
    logAuditAction(`Revoked all active remote session refresh tokens.`);
  };

  const updateCandidateStage = (candidateId, newStage) => {
    setCandidates(prev => prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c)));
    logAuditAction(`Updated candidate ${candidateId} stage to '${newStage}'.`);
  };

  const addCandidate = (newCand) => {
    const candidateToAdd = { ...newCand, id: `CAND-${Math.floor(Math.random() * 9000) + 1000}` };
    setCandidates(prev => [candidateToAdd, ...prev]);
    logAuditAction(`Added new candidate ${candidateToAdd.name} (${candidateToAdd.id}).`);
  };

  const updateCandidate = (updatedCand) => {
    setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c));
    logAuditAction(`Updated candidate profile ${updatedCand.id}.`);
  };

  const addClient = (newClient) => {
    const clientToAdd = { ...newClient, id: `CLI-${Math.floor(Math.random() * 9000) + 1000}`, agreementStatus: 'Active', logo: newClient.company.charAt(0).toUpperCase() };
    setClients(prev => [clientToAdd, ...prev]);
    logAuditAction(`Registered new client account ${clientToAdd.company} (${clientToAdd.id}).`);
  };

  const removeClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    logAuditAction(`Deleted corporate client account ${clientId}.`);
  };

  const addInterview = (newInterview) => {
    const interviewToAdd = { ...newInterview, id: `INT-${Math.floor(Math.random() * 9000) + 1000}` };
    setInterviews(prev => [interviewToAdd, ...prev]);
    setCalendarEvents(prev => [
      ...prev,
      { id: Date.now(), title: `${interviewToAdd.candidateName} ${interviewToAdd.platform} Interview`, time: interviewToAdd.time, type: 'Interview', candidate: interviewToAdd.candidateName, date: interviewToAdd.date }
    ]);
    logAuditAction(`Scheduled new interview for ${interviewToAdd.candidateName}.`);
  };

  const updateInterview = (updatedInterview) => {
    setInterviews(prev => prev.map(i => i.id === updatedInterview.id ? updatedInterview : i));
    logAuditAction(`Updated interview record ${updatedInterview.id}.`);
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
    setUser(prev => ({ ...prev, role: newRole }));
    if (newRole !== 'Super Admin' && activeModule === 'super-admin') {
      setActiveModule('dashboard');
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
      } catch (e) {}
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
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create organization');
      }
      logAuditAction(`Registered organization account '${orgData.company}' (${data.data?.id || 'ID'}).`);
      await fetchClients();
      await fetchConsultingMetrics();
      return data.data;
    } catch (err) {
      console.error('Error in createOrganization:', err);
      throw err;
    }
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

  const deleteCandidate = async (candidateId, metadata = {}) => {
    try {
      const activeRole = currentRole || user?.role || 'Super Admin';
      const activeUserName = user?.name || 'Super Admin';
      const activeUserId = user?.id || 'usr-superadmin';

      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CRM-Role': activeRole,
          'X-CRM-User': activeUserName,
          'X-CRM-User-Id': activeUserId
        }
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      logAuditAction(`Permanently deleted candidate '${candidateId}' (${metadata.name || ''}).`);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      return data;
    } catch (err) {
      console.error('Error in deleteCandidate:', err);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      logAuditAction(`Permanently deleted candidate '${candidateId}' (${metadata.name || ''}).`);
      throw err;
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

  const deleteInvoice = (invoiceId, metadata = {}) => {
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));
    logAuditAction(`Permanently deleted invoice '${invoiceId}' (${metadata.client || ''}).`);
  };

  return (
    <CrmContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        logoutEverywhere,
        recordFailedLogin,
        failedLoginAttempts,
        accountLocked,
        lockoutTimeRemaining,
        activeDevices,
        user,
        currentRole,
        isSuperAdmin,
        switchRole,
        hasPermission,
        darkMode,
        toggleDarkMode,
        activeModule,
        setActiveModule,
        candidates,
        addCandidate,
        updateCandidate,
        updateCandidateStage,
        deleteCandidate,
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
        notifications,
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
        setSelectedMetricsRange
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);

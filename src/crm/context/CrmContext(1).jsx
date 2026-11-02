import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRM_ROLES, ROLE_PERMISSIONS, CRM_CANDIDATES, CRM_CLIENTS, CRM_INTERVIEWS, CRM_INVOICES, PIPELINE_STAGES, AUDIT_LOGS } from '../data/mockCrmData';

const CrmContext = createContext();

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
    id: 'usr-901',
    name: 'Tariq Al-Mansoori',
    email: 'tariq.admin@revivalinternational.com',
    role: 'Super Admin',
    department: 'Executive Board',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
    } catch {}
    return DEFAULT_USER;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.currentRole) return parsed.currentRole;
      }
    } catch {}
    return 'Super Admin';
  });
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
    if (!moduleName) return true;
    if (moduleName === 'super-admin') {
      return currentRole === 'Super Admin';
    }
    if (currentRole === 'Super Admin') return true;
    if (typeof moduleName === 'string' && moduleName.startsWith('consulting')) {
      moduleName = 'consulting';
    }
    const permissions = (currentRole && ROLE_PERMISSIONS[currentRole]) || [];
    return permissions.includes('all') || permissions.includes(moduleName);
  };

  const login = (email, password, roleName) => {
    if (accountLocked) return false;
    
    const assignedRole = roleName || currentRole;
    const userData = {
      id: 'usr-' + Math.floor(100 + Math.random() * 900),
      name: email.split('@')[0].toUpperCase().replace('.', ' '),
      email,
      role: assignedRole,
      department: 'Enterprise Talent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setIsAuthenticated(true);
    setFailedLoginAttempts(0);
    setCurrentRole(assignedRole);
    setUser(userData);

    // Ensure active module is allowed for assigned role
    const perms = ROLE_PERMISSIONS[assignedRole] || [];
    let nextModule = activeModule;
    if (assignedRole !== 'Super Admin' && !perms.includes('all') && !perms.includes(activeModule)) {
      nextModule = perms[0] || 'workspace';
      setActiveModule(nextModule);
    }

    try {
      localStorage.setItem('sir_crm_session', JSON.stringify({
        isAuthenticated: true,
        user: userData,
        currentRole: assignedRole,
        activeModule: nextModule,
        loginTime: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not save CRM session', e);
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
    try {
      localStorage.removeItem('sir_crm_session');
    } catch (e) {}
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
        selectedCandidate,
        setSelectedCandidate,
        clients,
        addClient,
        removeClient,
        interviews,
        addInterview,
        updateInterview,
        calendarEvents,
        addCalendarEvent,
        removeCalendarEvent,
        invoices,
        addInvoice,
        updateInvoice,
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
        setGlobalAddInvoiceOpen
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRM_ROLES, ROLE_PERMISSIONS, CRM_CANDIDATES, CRM_CLIENTS, CRM_INTERVIEWS, CRM_INVOICES, PIPELINE_STAGES, AUDIT_LOGS } from '../data/mockCrmData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  // Default to false so user sees the Login screen first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({
    id: 'usr-901',
    name: 'Tariq Al-Mansoori',
    email: 'tariq.admin@sirrecruitment.com',
    role: 'Super Admin',
    department: 'Executive Board',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [currentRole, setCurrentRole] = useState('Super Admin');
  const [darkMode, setDarkMode] = useState(true);
  const loadState = (key, defaultData) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  };

  const [candidates, setCandidates] = useState([]);
  const [clients, setClients] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [invoices, setInvoices] = useState(() => loadState('crm_invoices', CRM_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => loadState('crm_auditLogs', AUDIT_LOGS));
  const [calendarEvents, setCalendarEvents] = useState(() => loadState('crm_calendarEvents', [
    { id: 1, title: 'Alexander Wright MS Teams Panel Interview', time: '02:00 PM GST', type: 'Interview', candidate: 'Alexander Wright', date: '2026-08-08' },
    { id: 2, title: 'MOHRE Visa Quota Review Meeting', time: '04:00 PM GST', type: 'Meeting', candidate: 'N/A', date: '2026-08-09' },
    { id: 3, title: 'Elena Rostova Departure to Singapore', time: '09:30 PM GST', type: 'Travel', candidate: 'Elena Rostova', date: '2026-08-21' },
    { id: 4, title: 'Dr. Sarah Joining at Saudi German Hospital', time: '08:00 AM AST', type: 'Joining', candidate: 'Dr. Sarah Al-Mansoori', date: '2026-08-18' }
  ]));
  const [recruiterTasks, setRecruiterTasks] = useState(() => loadState('crm_recruiterTasks', [
    { id: 1, text: 'Conduct HR Screening Interview for Alexander Wright', priority: 'High', due: '11:00 AM', completed: false },
    { id: 2, text: 'Submit 3 ICU Nurse Profiles to Saudi German Hospital', priority: 'Medium', due: '02:00 PM', completed: true },
    { id: 3, text: 'Follow up on Degree Attestation for Dr. Sarah', priority: 'Urgent', due: '04:30 PM', completed: false }
  ]));
  const [recruiterNotes, setRecruiterNotes] = useState(() => loadState('crm_recruiterNotes', 
    '1. Remind Client VP Hassan Al-Habtoor regarding 90-day replacement clause.\n2. Verify Prometric license for Riyadh candidates.'
  ));

  useEffect(() => {
    // Fetch initial data from SQLite backend
    const fetchInitialData = async () => {
      try {
        const [candRes, clientRes, intRes] = await Promise.all([
          fetch('http://localhost:5000/api/candidates').then(r => r.json()),
          fetch('http://localhost:5000/api/clients').then(r => r.json()),
          fetch('http://localhost:5000/api/interviews').then(r => r.json())
        ]);
        if (candRes.success) setCandidates(candRes.data);
        if (clientRes.success) setClients(clientRes.data);
        if (intRes.success) setInterviews(intRes.data);
      } catch (err) {
        console.error('Failed to load CRM data from backend API:', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    localStorage.setItem('crm_auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('crm_calendarEvents', JSON.stringify(calendarEvents));
    localStorage.setItem('crm_recruiterTasks', JSON.stringify(recruiterTasks));
    localStorage.setItem('crm_recruiterNotes', JSON.stringify(recruiterNotes));
  }, [invoices, auditLogs, calendarEvents, recruiterTasks, recruiterNotes]);

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

  // Sync Dark Mode Class to HTML Element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const updateCandidateStage = async (candidateId, newStage) => {
    try {
      const res = await fetch(`http://localhost:5000/api/candidates/${candidateId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        setCandidates(prev => prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c)));
        logAuditAction(`Updated candidate ${candidateId} stage to '${newStage}'.`);
      }
    } catch (err) { console.error(err); }
  };

  const addCandidate = async (newCand) => {
    try {
      const res = await fetch('http://localhost:5000/api/candidates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCand)
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(prev => [data.data, ...prev]);
        logAuditAction(`Added new candidate ${data.data.name} (${data.data.id}).`);
      }
    } catch (err) { console.error(err); }
  };

  const updateCandidate = async (updatedCand) => {
    try {
      const res = await fetch(`http://localhost:5000/api/candidates/${updatedCand.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCand)
      });
      if (res.ok) {
        setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c));
        logAuditAction(`Updated candidate profile ${updatedCand.id}.`);
      }
    } catch (err) { console.error(err); }
  };

  const addClient = async (newClient) => {
    try {
      const res = await fetch('http://localhost:5000/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (data.success) {
        setClients(prev => [data.data, ...prev]);
        logAuditAction(`Registered new client account ${data.data.company} (${data.data.id}).`);
      }
    } catch (err) { console.error(err); }
  };

  const removeClient = async (clientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        logAuditAction(`Deleted corporate client account ${clientId}.`);
      }
    } catch (err) { console.error(err); }
  };

  const addInterview = async (newInterview) => {
    try {
      const res = await fetch('http://localhost:5000/api/interviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInterview)
      });
      const data = await res.json();
      if (data.success) {
        setInterviews(prev => [data.data, ...prev]);
        setCalendarEvents(prev => [
          ...prev,
          { id: Date.now(), title: `${data.data.candidateName} ${data.data.platform} Interview`, time: data.data.time, type: 'Interview', candidate: data.data.candidateName, date: data.data.date }
        ]);
        logAuditAction(`Scheduled new interview for ${data.data.candidateName}.`);
      }
    } catch (err) { console.error(err); }
  };

  const updateInterview = (updatedInterview) => {
    // Only local state for now unless backend updated
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
    setDarkMode(prev => !prev);
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

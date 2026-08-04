import React, { createContext, useContext, useState, useEffect } from 'react';
import { CRM_ROLES, ROLE_PERMISSIONS, CRM_CANDIDATES, CRM_CLIENTS, CRM_INTERVIEWS, CRM_INVOICES, PIPELINE_STAGES } from '../data/mockCrmData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for instant exploration or toggled via CrmLogin
  const [user, setUser] = useState({
    id: 'usr-901',
    name: 'Tariq Al-Mansoori',
    email: 'tariq.admin@sirrecruitment.com',
    role: 'Super Admin',
    department: 'Executive Board',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [currentRole, setCurrentRole] = useState('Super Admin');
  const [candidates, setCandidates] = useState(CRM_CANDIDATES);
  const [clients, setClients] = useState(CRM_CLIENTS);
  const [interviews, setInterviews] = useState(CRM_INTERVIEWS);
  const [invoices, setInvoices] = useState(CRM_INVOICES);
  
  // UI & Modals
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
    if (currentRole === 'Super Admin') return true;
    const permissions = ROLE_PERMISSIONS[currentRole] || [];
    return permissions.includes('all') || permissions.includes(moduleName);
  };

  const login = (email, password) => {
    setIsAuthenticated(true);
    setUser({
      id: 'usr-901',
      name: email.split('@')[0].toUpperCase(),
      email,
      role: currentRole,
      department: 'Enterprise Talent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateCandidateStage = (candidateId, newStage) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
  };

  const addCandidate = (newCand) => {
    const candidateObj = {
      ...newCand,
      id: 'SIR-CAN-' + Math.floor(2000 + Math.random() * 8000),
      score: 90,
      stage: newCand.stage || 'lead',
      documents: [{ name: 'Resume_Attached.pdf', type: 'Resume', status: 'Verified' }]
    };
    setCandidates(prev => [candidateObj, ...prev]);
  };

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    setUser(prev => ({ ...prev, role: newRole }));
  };

  return (
    <CrmContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        currentRole,
        switchRole,
        hasPermission,
        activeModule,
        setActiveModule,
        candidates,
        addCandidate,
        updateCandidateStage,
        selectedCandidate,
        setSelectedCandidate,
        clients,
        interviews,
        invoices,
        commandPaletteOpen,
        setCommandPaletteOpen,
        aiDrawerOpen,
        setAiDrawerOpen,
        notificationsOpen,
        setNotificationsOpen,
        notifications
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);

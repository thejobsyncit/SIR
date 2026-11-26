import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Bell, Sparkles, UserCheck, ShieldCheck, Menu, Moon, Sun, Lock, Plus, X, Clock, AlertTriangle, LogOut, ChevronDown, Check, Sliders, Users, Target, Briefcase, CheckSquare, Layers, Shield, FileText, ChevronRight, ShieldAlert, CheckCircle2, Award
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

// Notification helpers for compact dropdown
const formatRelativeTime = (timestampOrStr) => {
  if (!timestampOrStr) return 'Just now';
  const str = String(timestampOrStr).trim();
  if (str.toLowerCase().includes('ago') || str.toLowerCase() === 'just now' || str.toLowerCase() === 'yesterday') {
    return str;
  }
  const normalized = str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str;
  const parsed = new Date(normalized);
  if (isNaN(parsed.getTime())) return str;

  const now = Date.now();
  const diffSec = Math.floor((now - parsed.getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) {
    const mins = Math.max(1, Math.floor(diffSec / 60));
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 172800) return 'Yesterday';
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days} days ago`;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const categorizeNotification = (item) => {
  const fullText = `${item.rawTitle || ''} ${item.rawMessage || ''} ${item.type || ''}`.toLowerCase();

  // 1. Security
  if (
    fullText.includes('security') ||
    fullText.includes('password') ||
    fullText.includes('lockout') ||
    fullText.includes('token') ||
    fullText.includes('2fa') ||
    fullText.includes('revoked') ||
    fullText.includes('unauthorized') ||
    fullText.includes('session expiry')
  ) {
    return {
      category: 'Security',
      title: item.rawTitle || (item.user ? `Security Event (${item.user})` : 'Security Notice'),
      icon: ShieldAlert,
      accentBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
    };
  }

  // 2. Access Approval
  if (
    fullText.includes('approval') ||
    fullText.includes('permission') ||
    fullText.includes('access granted') ||
    fullText.includes('role') ||
    fullText.includes('leave request') ||
    fullText.includes('leave approval') ||
    fullText.includes('unlocked')
  ) {
    return {
      category: 'Access Approval',
      title: item.rawTitle || 'Access & Approval Update',
      icon: UserCheck,
      accentBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
    };
  }

  // 3. Attendance
  if (
    fullText.includes('attendance') ||
    fullText.includes('check-in') ||
    fullText.includes('check-out') ||
    fullText.includes('checkout') ||
    fullText.includes('shift') ||
    fullText.includes('break') ||
    fullText.includes('late arrival') ||
    fullText.includes('missing check') ||
    item.type === 'attendance'
  ) {
    return {
      category: 'Attendance',
      title: item.rawTitle || 'Attendance Event',
      icon: Clock,
      accentBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
    };
  }

  // 4. System Audit (default for system events and audit logs)
  return {
    category: 'System Audit',
    title: item.rawTitle || (item.user ? `System Audit • ${item.user}` : 'System Audit Log'),
    icon: FileText,
    accentBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
  };
};

const getNotificationDestination = (item) => {
  const text = `${item.rawTitle || ''} ${item.rawMessage || ''}`.toLowerCase();
  if (text.includes('attendance') || text.includes('shift') || text.includes('late arrival') || text.includes('check-in') || text.includes('checkout')) {
    return { moduleId: 'my-attendance', label: 'View Attendance' };
  }
  if (text.includes('candidate') || text.includes('applicant')) {
    return { moduleId: 'candidates', label: 'View Candidates' };
  }
  if (text.includes('interview')) {
    return { moduleId: 'interviews', label: 'View Interviews' };
  }
  if (text.includes('invoice')) {
    return { moduleId: 'invoices', label: 'View Invoices' };
  }
  if (text.includes('client') || text.includes('organization')) {
    return { moduleId: 'clients', label: 'View Clients' };
  }
  return null;
};

// Rich metadata for the custom enterprise role switcher
const ROLE_DETAILS = [
  {
    role: 'Super Admin',
    badge: 'Executive Command',
    desc: 'Full enterprise governance, workforce & master financials',
    icon: ShieldCheck,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500'
  },
  {
    role: 'Admin',
    badge: 'Administration',
    desc: 'System settings, user accounts & portal security',
    icon: Sliders,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30',
    dot: 'bg-blue-500'
  },
  {
    role: 'HR Lead',
    badge: 'Workforce & Talent',
    desc: 'Team attendance, leaves, shifts & onboarding',
    icon: Users,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  {
    role: 'Recruiter',
    badge: 'ATS & Sourcing',
    desc: 'Candidates, vacancies, pipeline & interviews',
    icon: Target,
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30',
    dot: 'bg-purple-500'
  },
  {
    role: 'Placement Coordinator',
    badge: 'Campus & Drives',
    desc: 'Student dossiers, college drives & placements',
    icon: Briefcase,
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/30',
    dot: 'bg-indigo-500'
  },
  {
    role: 'HR Operations',
    badge: 'Daily Enquiries & KYC',
    desc: 'Assigned tasks, document check & candidates',
    icon: CheckSquare,
    color: 'text-teal-700 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-500/20 border-teal-300 dark:border-teal-500/30',
    dot: 'bg-teal-500'
  },
  {
    role: 'Interviewer',
    badge: 'Technical & Panel',
    desc: 'Evaluations, scorecard grading & feedback',
    icon: Award,
    color: 'text-amber-700 dark:text-gold-400',
    bg: 'bg-amber-100 dark:bg-gold-500/20 border-amber-300 dark:border-gold-500/30',
    dot: 'bg-amber-500'
  }
];

export const CrmHeader = ({ collapsed, setCollapsed }) => {
  const { 
    user, currentRole, switchRole, 
    darkMode, toggleDarkMode,
    setCommandPaletteOpen, 
    setAiDrawerOpen, 
    notificationsOpen, setNotificationsOpen, 
    notifications,
    auditLogs,
    showIdleModal, setShowIdleModal, logout,
    setActiveModule,
    setGlobalAddCandidateOpen,
    setGlobalAddClientOpen,
    setGlobalAddInterviewOpen,
    setGlobalAddInvoiceOpen,
    crmToken
  } = useCrm();

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [pendingLateCount, setPendingLateCount] = useState(0);

  // Notification dropdown state
  const [notifTab, setNotifTab] = useState('all'); // 'all' | 'unread'
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  const notifDropdownRef = useRef(null);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_read_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Close notifications dropdown on outside click or Escape key
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleOutsideClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notificationsOpen, setNotificationsOpen]);

  const unifiedNotifications = useMemo(() => {
    const list = [];
    const seen = new Set();

    (notifications || []).forEach((n, idx) => {
      const id = n.id ? String(n.id) : `notif-${idx}`;
      if (!seen.has(id)) {
        seen.add(id);
        let title = n.title;
        let message = n.message || n.text || '';
        if (!title && n.text && n.text.includes(': ')) {
          const parts = n.text.split(': ');
          title = parts[0].trim();
          message = parts.slice(1).join(': ').trim();
        }
        list.push({
          id,
          rawTitle: title,
          rawMessage: message,
          time: n.time || n.createdAt || 'Just now',
          type: n.type || 'info',
          read: Boolean(n.read || Number(n.isRead) === 1),
          source: 'notification'
        });
      }
    });

    (auditLogs || []).slice(0, 15).forEach((log, idx) => {
      const id = `audit-${log.timestamp || idx}-${idx}`;
      if (!seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          rawTitle: `System Audit • ${log.user || 'System'}`,
          rawMessage: log.action || 'Audit event recorded',
          time: log.timestamp || 'Just now',
          type: 'info',
          read: false,
          user: log.user,
          ip: log.ip,
          source: 'audit'
        });
      }
    });

    return list;
  }, [notifications, auditLogs]);

  const isItemRead = (n) => {
    if (readNotifIds.has(n.id)) return true;
    if (n.read) return true;
    return false;
  };

  const unreadItems = unifiedNotifications.filter(n => !isItemRead(n));
  const unreadCount = unreadItems.length;
  const displayedNotifications = notifTab === 'unread' ? unreadItems : unifiedNotifications;

  const handleMarkAllRead = () => {
    const allIds = unifiedNotifications.map(n => n.id);
    const nextSet = new Set([...readNotifIds, ...allIds]);
    setReadNotifIds(nextSet);
    try {
      localStorage.setItem('sir_crm_read_notifications', JSON.stringify(Array.from(nextSet)));
    } catch (_) {}

    if (crmToken) {
      fetch('/api/hr-ops/attendance/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        }
      }).catch(() => {});
    }
  };

  const handleMarkSingleRead = (id) => {
    if (readNotifIds.has(id)) return;
    const nextSet = new Set(readNotifIds);
    nextSet.add(id);
    setReadNotifIds(nextSet);
    try {
      localStorage.setItem('sir_crm_read_notifications', JSON.stringify(Array.from(nextSet)));
    } catch (_) {}

    if (crmToken && typeof id === 'string' && id.startsWith('emp-notif-')) {
      fetch(`/api/hr-ops/attendance/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        }
      }).catch(() => {});
    }
  };

  // Auto-poll pending late arrivals count for Super Admin & HR Lead
  useEffect(() => {
    const isLeadership = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR Lead';
    if (!isLeadership) {
      setPendingLateCount(0);
      return;
    }
    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/hr-ops/attendance/late-approvals/pending', {
          headers: {
            'Content-Type': 'application/json',
            'x-crm-role': currentRole || 'Super Admin',
            ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {})
          }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && typeof data.count === 'number') {
            setPendingLateCount(data.count);
          }
        }
      } catch (_) {}
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentRole, crmToken]);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    if (roleMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [roleMenuOpen]);

  const activeRoleMeta = ROLE_DETAILS.find(r => r.role === currentRole) || ROLE_DETAILS[0];
  const ActiveRoleIcon = activeRoleMeta.icon;

  const handleSelectRole = (roleName) => {
    if (switchRole && roleName !== currentRole) {
      switchRole(roleName);
    }
    setRoleMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-[#070c1e]/90 backdrop-blur-xl text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex justify-between items-center z-20 font-sans shadow-xs shrink-0">
      
      {/* Left Search & Sidebar Toggle */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0 mr-3 sm:mr-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-800 text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-gold-500 transition cursor-pointer shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center space-x-3 bg-slate-100/90 dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-700 hover:border-amber-500 text-slate-900 dark:text-slate-100 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex-1 min-w-0 transition cursor-pointer shadow-xs"
        >
          <Search className="w-4 h-4 text-amber-600 dark:text-gold-500 shrink-0" />
          <span className="truncate">Global Search (Candidates, Clients, Passports)...</span>
          <kbd className="ml-auto bg-slate-200 dark:bg-navy-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded text-xs border border-slate-300 dark:border-navy-700 font-mono font-bold shrink-0">⌘K</kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm shrink-0">

        {/* Super Admin Late Arrival Authorization Indicator */}
        {currentRole === 'Super Admin' && pendingLateCount > 0 && (
          <button
            onClick={() => setActiveModule('superadmin')}
            className="flex items-center space-x-1.5 bg-rose-500/15 hover:bg-rose-500/25 border-2 border-rose-400 text-rose-800 dark:text-rose-200 px-2.5 py-1.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer animate-pulse"
            title={`${pendingLateCount} late arrival authorization(s) pending`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden md:inline">{pendingLateCount} Late Approvals</span>
            <span className="md:hidden">{pendingLateCount} Late</span>
          </button>
        )}
        
        {/* Quick Create Action Menu - Excluded for HR Operations */}
        {currentRole !== 'HR Operations' && (
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer border border-amber-400"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Quick Create</span>
            </button>

            {quickMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-card bg-white dark:bg-navy-950 border-2 border-amber-300 dark:border-gold-500/30 rounded-2xl p-2 shadow-xl space-y-1 z-50 text-xs font-bold animate-in fade-in">
                <button 
                  onClick={() => { 
                    setActiveModule('candidates'); 
                    setGlobalAddCandidateOpen(true);
                    setQuickMenuOpen(false); 
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-gold-400 transition cursor-pointer"
                >
                  👤 Add Candidate
                </button>
                <button 
                  onClick={() => { 
                    setActiveModule('clients'); 
                    setGlobalAddClientOpen(true);
                    setQuickMenuOpen(false); 
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-gold-400 transition cursor-pointer"
                >
                  🏢 Register Client
                </button>
                <button 
                  onClick={() => { 
                    setActiveModule('interviews'); 
                    setGlobalAddInterviewOpen(true);
                    setQuickMenuOpen(false); 
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-gold-400 transition cursor-pointer"
                >
                  📅 Schedule Interview
                </button>
                <button 
                  onClick={() => { 
                    setActiveModule('accounts'); 
                    setGlobalAddInvoiceOpen(true);
                    setQuickMenuOpen(false); 
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-gold-400 transition cursor-pointer"
                >
                  📄 Generate Invoice
                </button>
              </div>
            )}
          </div>
        )}

        {/* CUSTOM ENTERPRISE ROLE SELECTOR DROPDOWN (Balanced Size & No Screen Overflow) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => setRoleMenuOpen(prev => !prev)}
            className="flex items-center space-x-2 bg-amber-50 dark:bg-navy-900 hover:bg-amber-100/90 dark:hover:bg-navy-800 border-2 border-amber-300 dark:border-gold-500/40 px-2.5 py-1.5 rounded-xl transition duration-200 shadow-xs cursor-pointer group"
            title="Switch Active Workspace Role"
          >
            <div className={`p-1.5 rounded-lg ${activeRoleMeta.bg} shrink-0`}>
              <ActiveRoleIcon className={`w-3.5 h-3.5 ${activeRoleMeta.color}`} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 dark:text-gold-400 leading-none">Role</div>
              <div className="text-xs sm:text-[13px] font-bold text-slate-950 dark:text-gold-200 leading-tight flex items-center gap-1.5">
                <span>{currentRole}</span>
              </div>
            </div>
            <span className="sm:hidden text-xs font-bold text-slate-950 dark:text-gold-200">
              {currentRole}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-amber-800 dark:text-gold-400 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Luxury Dropdown Menu */}
          {roleMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[92vw] bg-white dark:bg-[#0c142b] border-2 border-amber-300 dark:border-gold-500/30 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-navy-800/80 flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                    Switch Workspace Role
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Preview and operate under enterprise roles
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-gold-500/20 dark:text-gold-300 border border-amber-300 dark:border-gold-500/40 font-bold">
                  {ROLE_DETAILS.length} Roles
                </span>
              </div>

              <div className="space-y-1 max-h-[290px] overflow-y-auto crm-sidebar-scroll py-0.5">
                {ROLE_DETAILS.map((r) => {
                  const RoleIcon = r.icon;
                  const isSelected = r.role === currentRole;

                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleSelectRole(r.role)}
                      className={`w-full text-left p-2 rounded-xl transition duration-150 flex items-center justify-between gap-2.5 cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-gold-500/25 border-2 border-amber-400 dark:border-gold-500/50 shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-navy-800/70 border border-transparent text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className={`p-1.5 rounded-lg ${r.bg} shrink-0`}>
                          <RoleIcon className={`w-3.5 h-3.5 ${r.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs sm:text-[13px] font-bold truncate ${isSelected ? 'text-amber-950 dark:text-gold-200' : 'text-slate-950 dark:text-white'}`}>
                              {r.role}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 shrink-0 border border-slate-300 dark:border-navy-700">
                              {r.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {r.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Dark / Light Mode Switcher */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-gold-400 transition cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* AI Assistant Drawer Trigger */}
        <button 
          onClick={() => setAiDrawerOpen(true)}
          className="flex items-center space-x-1.5 bg-gold-500/20 text-amber-900 dark:text-gold-400 border-2 border-amber-400 dark:border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold-400" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications Trigger & Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button 
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label={`Notifications (${unreadCount} unread)`}
            aria-expanded={notificationsOpen}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-gold-400 relative transition cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-navy-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div 
              role="dialog"
              aria-label="Notifications panel"
              className="absolute right-0 top-full mt-2 w-[92vw] sm:w-[380px] max-w-[390px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="p-3.5 pb-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="text-xs font-semibold text-amber-600 dark:text-gold-400 hover:text-amber-700 dark:hover:text-gold-300 disabled:opacity-40 disabled:hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* Tabs: All & Unread */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl" role="tablist" aria-label="Notification filters">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={notifTab === 'all'}
                    onClick={() => setNotifTab('all')}
                    className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      notifTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All ({unifiedNotifications.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={notifTab === 'unread'}
                    onClick={() => setNotifTab('unread')}
                    className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      notifTab === 'unread'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Scrollable Notification List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 overscroll-contain">
                {displayedNotifications.length === 0 ? (
                  <div className="py-10 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                      {notifTab === 'unread' ? <Check className="w-5 h-5 text-emerald-500" /> : <Bell className="w-5 h-5 text-slate-400" />}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {notifTab === 'unread' ? "You're all caught up!" : "No notifications yet"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] mx-auto">
                      {notifTab === 'unread'
                        ? 'No unread notifications at this time.'
                        : 'System audit logs and attendance alerts will appear here.'}
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const isRead = isItemRead(n);
                    const isExpanded = expandedNotifId === n.id;
                    const cat = categorizeNotification(n);
                    const CatIcon = cat.icon;
                    const dest = getNotificationDestination(n);
                    const relativeTime = formatRelativeTime(n.time);

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          handleMarkSingleRead(n.id);
                          if (n.rawMessage && n.rawMessage.length > 70) {
                            setExpandedNotifId(isExpanded ? null : n.id);
                          }
                        }}
                        className={`p-3 sm:p-3.5 transition-colors flex items-start gap-3 relative cursor-pointer group ${
                          !isRead 
                            ? 'bg-amber-50/40 dark:bg-amber-500/[0.04] hover:bg-amber-50/70 dark:hover:bg-amber-500/[0.07]' 
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Category Icon */}
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cat.accentBg}`}>
                          <CatIcon className={`w-3.5 h-3.5 ${cat.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.badgeBg}`}>
                              {cat.category}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                              {relativeTime}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                            {cat.title}
                          </p>

                          <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {n.rawMessage}
                          </p>

                          {/* Expanded metadata */}
                          {isExpanded && (n.user || n.ip) && (
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap gap-x-2">
                              {n.user && <span>User: {n.user}</span>}
                              {n.ip && <span>IP: {n.ip}</span>}
                            </div>
                          )}

                          {/* Actions: View details & Destination */}
                          <div className="pt-0.5 flex items-center gap-3 text-[11px]">
                            {n.rawMessage && n.rawMessage.length > 70 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedNotifId(isExpanded ? null : n.id);
                                  handleMarkSingleRead(n.id);
                                }}
                                className="font-semibold text-amber-600 dark:text-gold-400 hover:underline cursor-pointer"
                              >
                                {isExpanded ? 'Show less' : 'View details'}
                              </button>
                            )}

                            {dest && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkSingleRead(n.id);
                                  setNotificationsOpen(false);
                                  if (setActiveModule) setActiveModule(dest.moduleId);
                                }}
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{dest.label}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {!isRead && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkSingleRead(n.id);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto cursor-pointer"
                                title="Mark as read"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subtle unread dot */}
                        {!isRead && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" title="Unread" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom bar */}
              <div className="p-2.5 px-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
                <span className="font-medium">
                  {displayedNotifications.length} notification{displayedNotifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="font-bold text-amber-600 dark:text-gold-400 hover:text-amber-700 dark:hover:text-gold-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Session Timeout Warning Modal */}
      {showIdleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border-2 border-gold-500/50 rounded-2xl max-w-sm w-full p-6 shadow-luxury text-center space-y-4">
            <Clock className="w-12 h-12 text-gold-500 mx-auto animate-pulse" />
            <h3 className="font-serif text-xl font-bold text-slate-950 dark:text-white">Session Expiry Warning</h3>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              You have been inactive for 14 minutes. For enterprise security, your CRM session will auto-terminate in 60 seconds.
            </p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowIdleModal(false)}
                className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-black rounded-xl shadow-gold-glow text-sm"
              >
                Extend Session
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2.5 bg-slate-200 dark:bg-navy-950 text-slate-800 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-xl text-sm font-bold border border-slate-300 dark:border-navy-800"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

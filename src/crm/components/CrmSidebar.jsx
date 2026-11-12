import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  LayoutDashboard, Users, GitMerge, Home, Globe, Building2, UserCheck,
  Calendar, FileText, ShieldCheck, CreditCard, BarChart3, Sparkles, Zap,
  Settings, Lock, LogOut, Award, ChevronRight, ChevronDown, CalendarCheck,
  GraduationCap, Compass, School, Languages, Plane,
  Briefcase, Search, Tag, MessageSquare, Users2,
  CheckCircle2, Bell, CheckSquare, Clock, AlertCircle, BookOpen,
  TrendingUp, UserPlus, Mail, User, FolderCheck
} from 'lucide-react';

export const HR_OPERATIONS_MENU_ORDER = [
  'dashboard',
  'hr-tasks',
  'candidates',
  'my-attendance',
  'documentation',
  'verification',
  'my-profile'
];

export const CONSULTING_SUB_SERVICES = [
  { id: 'all', label: 'All Bookings', icon: CalendarCheck },
  { id: 'intl-consult', label: 'International Consulting', icon: Globe },
  { id: 'college-adm', label: 'College Admission Assistance', icon: GraduationCap },
  { id: 'career-guidance', label: 'Career Guidance', icon: Compass },
  { id: 'student-academy', label: 'Student Academy', icon: GraduationCap },
  { id: 'intl-adm', label: 'International Admissions', icon: Plane },
  { id: 'exec-seminars-lang', label: 'Executive Seminars & Language', icon: Languages }
];

export const CrmSidebar = ({ collapsed, setCollapsed }) => {
  const {
    activeModule,
    setActiveModule,
    hasPermission,
    logout,
    requestLogout,
    currentRole,
    user,
    leads = [],
    consultingServiceFilter = 'all',
    setConsultingServiceFilter
  } = useCrm();

  const isHrOperationsRole = currentRole === 'HR Operations';
  const isRecruiterRole = currentRole === 'Recruiter' || currentRole === 'Domestic Recruiter' || currentRole === 'International Recruiter';
  const isPlacementRole = currentRole === 'Placement Coordinator';
  const isInterviewerRole = currentRole === 'Interviewer';
  const isHrLeadRole = currentRole === 'HR Lead';
  const isExecutiveRole = currentRole === 'Super Admin' || currentRole === 'Admin';

  const [consultingOpen, setConsultingOpen] = useState(false);

  // Automatically keep Consulting & Bookings submenu expanded when any child module or consulting is active (except HR Operations)
  useEffect(() => {
    if (isHrOperationsRole) {
      setConsultingOpen(false);
      return;
    }
    if (activeModule === 'consulting' || activeModule === 'career-guidance' || activeModule === 'student-academy') {
      setConsultingOpen(true);
    }
  }, [activeModule, isHrOperationsRole]);

  const getServiceCount = (srvId) => {
    if (!Array.isArray(leads)) return 0;
    if (srvId === 'all') {
      return leads.filter(l =>
        l && (
          l.consultationDate ||
          l.status === 'Consultation Scheduled' ||
          (l.referenceNumber && (l.referenceNumber.startsWith('REV-CAR') || l.referenceNumber.startsWith('REV-ACA'))) ||
          (l.serviceId && (
            l.serviceId.includes('consult') ||
            l.serviceId.includes('adm') ||
            l.serviceId.includes('academy') ||
            l.serviceId.includes('career') ||
            l.serviceId.includes('lang') ||
            l.serviceId.includes('seminar')
          ))
        )
      ).length;
    }
    return leads.filter(l => {
      if (!l) return false;
      const sId = (l.serviceId || '').toLowerCase();
      const title = (l.serviceTitle || '').toLowerCase();
      const company = (l.company || '').toLowerCase();
      const msg = (l.message || '').toLowerCase();
      const ref = (l.referenceNumber || '').toUpperCase();
      switch (srvId) {
        case 'intl-consult':
          return sId === 'intl-consult' || sId.includes('intl-consult') || title.includes('international consulting') || title.includes('intl consulting');
        case 'college-adm':
          return sId === 'college-adm' || sId.includes('college') || title.includes('college admission') || title.includes('college');
        case 'career-guidance':
          return (
            sId === 'career-guidance' ||
            sId === 'school-career' ||
            ref.startsWith('REV-CAR') ||
            title.includes('career guidance') ||
            company.includes('career guidance') ||
            (title.includes('career') && !sId.includes('dom-rec') && !sId.includes('intl-rec')) ||
            (msg.includes('career guidance') || msg.includes('stream selection'))
          );
        case 'student-academy':
          return (
            sId === 'student-academy' ||
            sId === 'school-academy' ||
            ref.startsWith('REV-ACA') ||
            title.includes('student academy') ||
            company.includes('student academy') ||
            msg.startsWith('exam enquiry:') ||
            msg.includes('student academy')
          );
        case 'intl-adm':
          return sId === 'intl-adm' || sId === 'intl-admissions' || (sId.includes('adm') && !sId.includes('college')) || (title.includes('international admission') || title.includes('intl admission'));
        case 'exec-seminars-lang':
          return sId === 'exec-seminars-lang' || sId.includes('seminar') || sId.includes('lang') || title.includes('seminar') || title.includes('language');
        default:
          return false;
      }
    }).length;
  };

  // Structured Sections for Super Admin / Admin
  const executiveSections = [
    {
      category: 'Command Center',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'hr-tasks', label: 'HR Task Assignment', icon: CheckSquare },
        { id: 'consulting', label: 'Consulting & Bookings', icon: CalendarCheck }
      ]
    },
    {
      category: 'Talent & Recruitment',
      items: [
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'pipeline', label: 'Recruitment Pipeline', icon: GitMerge },
        { id: 'workspace', label: 'Recruiter Workspace', icon: UserCheck },
        { id: 'interviews', label: 'Interviews', icon: Calendar },
        { id: 'domestic', label: 'Domestic Hiring', icon: Home },
        { id: 'international', label: 'International Hiring', icon: Globe },
        { id: 'clients', label: 'Client Accounts', icon: Building2 }
      ]
    },
    {
      category: 'Operations & Compliance',
      items: [
        { id: 'attendance', label: 'Attendance Management', icon: Clock },
        { id: 'leave', label: 'Leave Management', icon: Calendar },
        { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck },
        { id: 'documentation', label: 'Documentation', icon: FileText },
        { id: 'visa', label: 'Visa Processing', icon: ShieldCheck },
        { id: 'verification', label: 'Background Check', icon: ShieldCheck }
      ]
    },
    {
      category: 'System & Analytics',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'ai-suite', label: 'AI Features Suite', icon: Sparkles },
        { id: 'automation', label: 'Automations', icon: Zap },
        { id: 'super-admin', label: 'Super Admin Panel', icon: ShieldCheck },
        { id: 'settings', label: 'Admin Settings', icon: Settings }
      ]
    },
    {
      category: 'Account',
      items: [
        { id: 'my-profile', label: 'My Profile', icon: User }
      ]
    }
  ];

  // Tailored HR Operations menu (Clean, no spec numbering tags)
  const hrOpsMenuItems = [
    { id: 'dashboard', label: 'Operations Work Queue', icon: LayoutDashboard },
    { id: 'hr-tasks', label: 'My Assigned Enquiries', icon: CheckSquare },
    { id: 'candidates', label: 'Candidate Directory', icon: Users },
    { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'documentation', label: 'Document Verification & KYC', icon: FileText },
    { id: 'verification', label: 'Background Verification (BGV)', icon: ShieldCheck },
    { id: 'my-profile', label: 'My Profile', icon: User }
  ];

  // Recruiter Dashboard features (Clean, professional labels)
  const recruiterMenuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'vacancies', label: 'Job & Vacancy Management', icon: Briefcase },
    { id: 'candidates', label: 'Candidate Management', icon: Users },
    { id: 'search-filters', label: 'Search & Talent Filters', icon: Search },
    { id: 'pipeline', label: 'Application Pipeline', icon: GitMerge },
    { id: 'documentation', label: 'Resume & Dossier Storage', icon: FileText },
    { id: 'interviews', label: 'Interview Scheduling', icon: Calendar },
    { id: 'offers', label: 'Offers & Joining', icon: Award },
    { id: 'reports', label: 'Recruiter Analytics', icon: BarChart3 },
    { id: 'my-profile', label: 'My Profile', icon: User }
  ];

  // Placement Coordinator Dashboard features
  const placementMenuItems = [
    { id: 'plc-overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'plc-students', label: 'Student Directory', icon: GraduationCap },
    { id: 'plc-companies', label: 'Corporate Partners', icon: Building2 },
    { id: 'plc-drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'plc-registration', label: 'Student Registration', icon: UserCheck },
    { id: 'plc-applications', label: 'Application Tracking', icon: GitMerge },
    { id: 'plc-events', label: 'Recruitment & Drive Meets', icon: Calendar },
    { id: 'plc-offers', label: 'Offer & Placement Records', icon: Award },
    { id: 'plc-announcements', label: 'Announcements & Alerts', icon: Bell },
    { id: 'plc-reports', label: 'Reports & Exports', icon: BarChart3 },
    { id: 'plc-approvals', label: 'Access & Approvals', icon: ShieldCheck },
    { id: 'my-profile', label: 'My Profile', icon: User }
  ];

  // Interviewer Dashboard features
  const interviewerMenuItems = [
    { id: 'int-overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'int-assigned', label: 'Assigned Candidates', icon: Users },
    { id: 'int-profiles', label: 'Candidate Profiles', icon: FileText },
    { id: 'int-schedule', label: 'Interview Schedule', icon: Calendar },
    { id: 'int-evaluation', label: 'Evaluation Forms', icon: CheckSquare },
    { id: 'int-feedback', label: 'Structured Feedback', icon: MessageSquare },
    { id: 'int-decision', label: 'Decision Submission', icon: Award },
    { id: 'int-status', label: 'Interview Status', icon: Clock },
    { id: 'int-reminders', label: 'Feedback Reminders', icon: AlertCircle },
    { id: 'int-context', label: 'Previous Round Notes', icon: BookOpen },
    { id: 'int-calendar', label: 'Availability Calendar', icon: CalendarCheck },
    { id: 'int-permissions', label: 'Confidentiality & Access', icon: Lock },
    { id: 'my-profile', label: 'My Profile', icon: User }
  ];

  // HR Lead Dashboard features
  const hrLeadMenuItems = [
    { id: 'hr-overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'hr-tasks', label: 'HR Task Assignment', icon: CheckSquare },
    { id: 'hr-attendance', label: 'Attendance Oversight', icon: Clock },
    { id: 'hr-leave', label: 'Leave Approvals', icon: Calendar },
    { id: 'hr-employees', label: 'Workforce Directory', icon: Users },
    { id: 'hr-performance', label: 'Performance Metrics', icon: TrendingUp },
    { id: 'hr-recruitment', label: 'Onboarding & Hiring', icon: UserPlus },
    { id: 'hr-announcements', label: 'Company Announcements', icon: Bell },
    { id: 'hr-shifts', label: 'Shift Management', icon: CalendarCheck },
    { id: 'hr-documents', label: 'Document Repository', icon: FileText },
    { id: 'my-profile', label: 'My Profile', icon: User }
  ];

  // Role-based filtering for Consulting & Bookings sub-services
  const permittedSubServices = isHrOperationsRole
    ? []
    : CONSULTING_SUB_SERVICES.filter(srv => {
      if (srv.id === 'career-guidance') return hasPermission('career-guidance');
      if (srv.id === 'student-academy') return hasPermission('student-academy');
      return true;
    });

  const formatUserName = (rawName) => {
    if (!rawName) return 'Dhanalakshimi';
    const trimmed = rawName.trim();
    if (trimmed.toLowerCase() === 'thejobsyncit' || trimmed.toLowerCase() === 'the job sync it') {
      return 'The Job Sync IT';
    }
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
      return trimmed.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
    return trimmed;
  };

  // Helper to render an individual menu button
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = activeModule === item.id ||
      (item.id === 'dashboard' && (activeModule === 'dashboard' || activeModule === 'plc-overview' || activeModule === 'int-overview' || activeModule === 'hr-overview')) ||
      (item.id === 'plc-overview' && (activeModule === 'dashboard' || activeModule === 'plc-overview')) ||
      (item.id === 'int-overview' && (activeModule === 'dashboard' || activeModule === 'int-overview')) ||
      (item.id === 'hr-overview' && (activeModule === 'dashboard' || activeModule === 'hr-overview'));

    // Special dropdown handling for Consulting & Bookings
    if (item.id === 'consulting' && !isHrOperationsRole) {
      const isConsultingActive = activeModule === 'consulting';
      const isParentActive = isConsultingActive || activeModule === 'career-guidance' || activeModule === 'student-academy';
      const totalCount = getServiceCount('all');

      return (
        <div key="consulting-section" className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
                setConsultingOpen(true);
                setActiveModule('consulting');
                if (setConsultingServiceFilter) setConsultingServiceFilter('all');
              } else {
                setConsultingOpen(prev => !prev);
                if (!isParentActive) {
                  setActiveModule('consulting');
                  if (setConsultingServiceFilter) setConsultingServiceFilter('all');
                }
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition duration-150 group cursor-pointer ${
              isConsultingActive && consultingServiceFilter === 'all'
                ? 'bg-amber-100/90 dark:bg-gold-500/20 text-amber-950 dark:text-gold-300 font-extrabold border border-amber-300/80 dark:border-gold-500/40 shadow-xs'
                : isParentActive
                  ? 'bg-amber-50 dark:bg-gold-500/10 text-amber-900 dark:text-gold-300 font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-navy-900/90 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-200 font-semibold'
            }`}
            title={item.label}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Icon className={`w-4 h-4 shrink-0 ${isParentActive ? 'text-amber-600 dark:text-gold-400' : 'text-slate-500 dark:text-slate-400'}`} />
              {!collapsed && <span className="truncate flex-1 text-left text-xs">{item.label}</span>}
            </div>
            {!collapsed && (
              <div className="flex items-center space-x-1.5 shrink-0">
                {totalCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-amber-500 text-navy-950 font-mono shadow-xs">
                    {totalCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${consultingOpen ? 'rotate-180 text-gold-500' : ''}`} />
              </div>
            )}
          </button>

          {/* Consulting sub-services */}
          {!collapsed && consultingOpen && (
            <div className="ml-3 pl-2.5 border-l-2 border-gold-500/30 space-y-0.5 py-1 animate-in fade-in duration-150">
              {permittedSubServices.map(srv => {
                const SrvIcon = srv.icon;
                const isSrvActive = srv.id === 'career-guidance'
                  ? activeModule === 'career-guidance'
                  : srv.id === 'student-academy'
                    ? activeModule === 'student-academy'
                    : isConsultingActive && (consultingServiceFilter === srv.id || (!consultingServiceFilter && srv.id === 'all'));
                const srvCount = getServiceCount(srv.id);

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      if (srv.id === 'career-guidance') {
                        setActiveModule('career-guidance');
                      } else if (srv.id === 'student-academy') {
                        setActiveModule('student-academy');
                      } else {
                        setActiveModule('consulting');
                        if (setConsultingServiceFilter) setConsultingServiceFilter(srv.id);
                      }
                      if (window.innerWidth < 1024) setCollapsed(true);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition duration-150 cursor-pointer ${
                      isSrvActive
                        ? 'bg-amber-100 dark:bg-gold-500/25 text-amber-950 dark:text-gold-200 font-extrabold border border-amber-300 dark:border-gold-500/40 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900/80 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`}
                    title={srv.label}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <SrvIcon className={`w-3.5 h-3.5 shrink-0 ${isSrvActive ? 'text-gold-500' : 'text-slate-400 dark:text-slate-400'}`} />
                      <span className="truncate">{srv.label}</span>
                    </div>
                    {srvCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                        isSrvActive
                          ? 'bg-gold-500 text-navy-950'
                          : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {srvCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          setActiveModule(item.id);
          setConsultingOpen(false);
          if (window.innerWidth < 1024) setCollapsed(true);
        }}
        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition duration-150 cursor-pointer ${
          isActive
            ? 'bg-amber-100/90 dark:bg-gold-500/20 text-amber-950 dark:text-gold-300 font-extrabold border border-amber-300/80 dark:border-gold-500/40 shadow-xs'
            : 'hover:bg-slate-100 dark:hover:bg-navy-900/90 hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-200 font-semibold'
        }`}
        title={item.label}
      >
        <Icon className={`w-4 h-4 shrink-0 ${
          isActive
            ? 'text-amber-700 dark:text-gold-400'
            : 'text-slate-500 dark:text-slate-400'
        }`} />
        {!collapsed && <span className="truncate flex-1 text-left text-xs">{item.label}</span>}
        {!collapsed && item.id === 'super-admin' && Array.isArray(leads) && leads.filter(l => l && l.status === 'New').length > 0 && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white animate-pulse">
            {leads.filter(l => l && l.status === 'New').length}
          </span>
        )}
      </button>
    );
  };

  // Render role-specific navigation content
  const renderNavContent = () => {
    if (isExecutiveRole) {
      return (
        <div className="space-y-4">
          {executiveSections.map((sec, idx) => {
            const permittedInSec = sec.items.filter(item => hasPermission(item.id));
            if (permittedInSec.length === 0) return null;

            return (
              <div key={sec.category || idx} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pt-1 pb-1">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                      {sec.category}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {permittedInSec.map(item => renderMenuItem(item))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Role-tailored lists
    let currentList = [];
    let roleSectionTitle = '';
    let roleBadge = '';

    if (isHrOperationsRole) {
      currentList = hrOpsMenuItems;
      roleSectionTitle = 'Operations Desk';
      roleBadge = 'Daily Workspace';
    } else if (isRecruiterRole) {
      currentList = recruiterMenuItems;
      roleSectionTitle = 'Recruiter Workspace';
      roleBadge = 'ATS Pipeline';
    } else if (isPlacementRole) {
      currentList = placementMenuItems;
      roleSectionTitle = 'Placement Desk';
      roleBadge = 'Campus Drives';
    } else if (isHrLeadRole) {
      currentList = hrLeadMenuItems;
      roleSectionTitle = 'HR Lead Suite';
      roleBadge = 'Workforce';
    } else if (isInterviewerRole) {
      currentList = interviewerMenuItems;
      roleSectionTitle = 'Interviewer Desk';
      roleBadge = 'Panels & Meets';
    }

    // Universal guarantee: 'my-profile' is always strictly placed at the very end
    const nonProfileItems = currentList.filter(item => item.id !== 'my-profile');
    const profileItem = currentList.find(item => item.id === 'my-profile') || { id: 'my-profile', label: 'My Profile', icon: User };

    return (
      <div className="space-y-3">
        {!collapsed && roleSectionTitle && (
          <div className="px-2 pt-1 pb-1">
            <div className="flex items-center justify-between px-1 text-[10px] font-extrabold tracking-wider uppercase text-gold-600 dark:text-gold-400">
              <span>{roleSectionTitle}</span>
              <span className="font-mono bg-gold-500/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded text-[9px] border border-gold-500/30">
                {roleBadge}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          {nonProfileItems.map(item => renderMenuItem(item))}
        </div>

        {/* Separator before My Profile */}
        <div className="pt-2 border-t border-slate-200 dark:border-navy-800/80">
          {!collapsed && (
            <div className="px-3 pb-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Account
              </span>
            </div>
          )}
          {renderMenuItem(profileItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`bg-white dark:bg-[#070c1e] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col h-full min-h-0 overflow-hidden shrink-0 z-50 fixed inset-y-0 left-0 lg:static lg:h-full lg:max-h-full transition-all duration-300 transform ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}`}>

        {/* Top Brand Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <img src="/images/logo.png" alt="The Revival International" className="w-9 h-9 object-contain shrink-0 drop-shadow-sm" />
            {!collapsed && (
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">The Revival CRM</h2>
                <span className="text-[9px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-bold">Enterprise Edition</span>
              </div>
            )}
          </div>
        </div>

        {/* Clean, Grouped Nav Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain crm-sidebar-scroll py-3 px-3">
          {renderNavContent()}
        </div>

        {/* PINNED BOTTOM USER PROFILE & LOGOUT FOOTER */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#070c1e]/95 p-2 z-20 shadow-md">
          {!collapsed ? (
            <div className="rounded-xl p-2 bg-slate-50 dark:bg-[#0a1128] border border-slate-200 dark:border-gold-500/30 shadow-xs flex items-center justify-between gap-2">

              {/* Left: Avatar + Name + Role (Clickable to My Profile) */}
              <div
                onClick={() => {
                  setActiveModule('my-profile');
                  if (window.innerWidth < 1024) setCollapsed(true);
                }}
                className="flex items-center space-x-2 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition rounded-lg p-1 -m-1"
                title="View & Edit My Profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                    alt={formatUserName(user?.name)}
                    className="w-8 h-8 rounded-full border-2 border-gold-500 object-cover shadow-xs ring-1 ring-gold-500/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white dark:border-[#070c1e] rounded-full shadow-xs" title="Online & Active" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className="font-bold text-slate-900 dark:text-white text-xs truncate leading-tight tracking-tight"
                    title={formatUserName(user?.name)}
                  >
                    {formatUserName(user?.name)}
                  </h4>

                  <div
                    className="flex items-center space-x-1 text-[10px] text-amber-700 dark:text-gold-400 font-semibold truncate mt-0.5"
                    title={currentRole || user?.designation || user?.role || 'Super Admin'}
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-gold-500 shrink-0" />
                    <span className="truncate">{currentRole || user?.designation || user?.role || 'Super Admin'}</span>
                  </div>
                </div>
              </div>

              {/* Right: VIBRANT RED LOGOUT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1024) setCollapsed(true);
                  (requestLogout || logout)();
                }}
                className="shrink-0 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-rose-400/40 shadow-sm shadow-rose-950/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                title="Logout / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Logout</span>
              </button>

            </div>
          ) : (
            /* Collapsed View (Narrow Sidebar) */
            <div className="flex flex-col items-center space-y-2 py-1">
              <div
                onClick={() => setActiveModule('my-profile')}
                className="relative cursor-pointer hover:scale-105 transition"
                title={'View My Profile (' + formatUserName(user?.name) + ')'}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                  alt={formatUserName(user?.name)}
                  className="w-8 h-8 rounded-full border-2 border-gold-500 object-cover shadow-sm ring-1 ring-gold-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white dark:border-navy-900 rounded-full" />
              </div>
              <button
                type="button"
                onClick={requestLogout || logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md transition-all duration-200 cursor-pointer group hover:scale-105"
                title={'Logout / Sign Out (' + formatUserName(user?.name) + ')'}
              >
                <LogOut className="w-3.5 h-3.5 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};

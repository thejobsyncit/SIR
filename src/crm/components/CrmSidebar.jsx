import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, Users, GitMerge, Home, Globe, Building2, UserCheck, 
  Calendar, FileText, ShieldCheck, CreditCard, BarChart3, Sparkles, Zap, 
  Settings, Lock, LogOut, Award, ChevronRight, ChevronDown, CalendarCheck,
  GraduationCap, Compass, School, Languages, Plane,
  Briefcase, Search, Tag, MessageSquare, Users2,
  CheckCircle2, Bell, CheckSquare, Clock, AlertCircle, BookOpen,
  TrendingUp, UserPlus, Mail
} from 'lucide-react';

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
    currentRole, 
    user, 
    leads = [],
    consultingServiceFilter = 'all',
    setConsultingServiceFilter
  } = useCrm();

  const [consultingOpen, setConsultingOpen] = useState(false);

  // Automatically keep Consulting & Bookings submenu expanded when any child module or consulting is active
  useEffect(() => {
    if (activeModule === 'consulting' || activeModule === 'career-guidance' || activeModule === 'student-academy') {
      setConsultingOpen(true);
    }
  }, [activeModule]);

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
        case 'school-career':
          return sId === 'school-career' || (sId.includes('career') && !sId.includes('career-guidance')) || title.includes('school student career');
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
        case 'school-academy':
          return sId === 'school-academy' || sId.includes('academy') || title.includes('student academy') || title.includes('academy');
        case 'exec-seminars-lang':
          return sId === 'exec-seminars-lang' || sId.includes('seminar') || sId.includes('lang') || title.includes('seminar') || title.includes('language');
        default:
          return false;
      }
    }).length;
  };

  // Main CRM Sidebar Navigation Items (Standalone Career Guidance and Student Academy moved inside Consulting & Bookings)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'consulting', label: 'Consulting & Bookings', icon: CalendarCheck },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'pipeline', label: 'Recruitment Pipeline', icon: GitMerge },
    { id: 'domestic', label: 'Domestic Hiring', icon: Home },
    { id: 'international', label: 'International Hiring', icon: Globe },
    { id: 'clients', label: 'Client Accounts', icon: Building2 },
    { id: 'workspace', label: 'Recruiter Workspace', icon: UserCheck },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'visa', label: 'Visa Processing', icon: ShieldCheck },
    { id: 'verification', label: 'Background Check', icon: ShieldCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'ai-suite', label: 'AI Features Suite', icon: Sparkles },
    { id: 'automation', label: 'Automations', icon: Zap },
    { id: 'super-admin', label: 'Super Admin Panel', icon: ShieldCheck },
    { id: 'settings', label: 'Admin Settings', icon: Settings }
  ];

  const isRecruiterRole = currentRole === 'Recruiter' || currentRole === 'Domestic Recruiter' || currentRole === 'International Recruiter';
  const isPlacementRole = currentRole === 'Placement Coordinator';
  const isInterviewerRole = currentRole === 'Interviewer';
  const isHrLeadRole = currentRole === 'HR Lead';

  // 12 Recruiter Dashboard features as defined in Page 1 of the Recruitment Requirements PDF
  const recruiterMenuItems = [
    { id: 'dashboard', label: 'Dashboard overview', icon: LayoutDashboard, tag: '1' },
    { id: 'vacancies', label: 'Job / vacancy management', icon: Briefcase, tag: '2' },
    { id: 'candidates', label: 'Candidate management', icon: Users, tag: '3' },
    { id: 'search-filters', label: 'Search and filters', icon: Search, tag: '4' },
    { id: 'pipeline', label: 'Application pipeline', icon: GitMerge, tag: '5' },
    { id: 'documentation', label: 'Resume upload and storage', icon: FileText, tag: '6' },
    { id: 'notes-tags', label: 'Candidate notes and tags', icon: Tag, tag: '7' },
    { id: 'interviews', label: 'Interview scheduling', icon: Calendar, tag: '8' },
    { id: 'communication', label: 'Candidate communication', icon: MessageSquare, tag: '9' },
    { id: 'offers', label: 'Offers and joining', icon: Award, tag: '10' },
    { id: 'reports', label: 'Reports and analytics', icon: BarChart3, tag: '11' },
    { id: 'collaboration', label: 'Team collaboration', icon: Users2, tag: '12' }
  ];

  // 12 Placement Coordinator Dashboard features as defined in Page 2 of the Recruitment Requirements PDF
  const placementMenuItems = [
    { id: 'plc-overview', label: 'Dashboard overview', icon: LayoutDashboard, tag: '1' },
    { id: 'plc-students', label: 'Student profile management', icon: GraduationCap, tag: '2' },
    { id: 'plc-eligibility', label: 'Eligibility management', icon: CheckCircle2, tag: '3' },
    { id: 'plc-companies', label: 'Company management', icon: Building2, tag: '4' },
    { id: 'plc-drives', label: 'Placement drive management', icon: Briefcase, tag: '5' },
    { id: 'plc-registration', label: 'Student registration', icon: UserCheck, tag: '6' },
    { id: 'plc-applications', label: 'Application tracking', icon: GitMerge, tag: '7' },
    { id: 'plc-events', label: 'Interview & event coordination', icon: Calendar, tag: '8' },
    { id: 'plc-offers', label: 'Offer & placement records', icon: Award, tag: '9' },
    { id: 'plc-announcements', label: 'Announcements & notifications', icon: Bell, tag: '10' },
    { id: 'plc-reports', label: 'Reports and exports', icon: BarChart3, tag: '11' },
    { id: 'plc-approvals', label: 'Access and approvals', icon: ShieldCheck, tag: '12' }
  ];

  // 12 Interviewer Dashboard features as defined in Page 3 of the Recruitment Requirements PDF
  const interviewerMenuItems = [
    { id: 'int-overview', label: 'Dashboard overview', icon: LayoutDashboard, tag: '1' },
    { id: 'int-assigned', label: 'Assigned candidate list', icon: Users, tag: '2' },
    { id: 'int-profiles', label: 'Candidate interview profile', icon: FileText, tag: '3' },
    { id: 'int-schedule', label: 'Interview schedule and details', icon: Calendar, tag: '4' },
    { id: 'int-evaluation', label: 'Interview evaluation form', icon: CheckSquare, tag: '5' },
    { id: 'int-feedback', label: 'Structured feedback', icon: MessageSquare, tag: '6' },
    { id: 'int-decision', label: 'Decision submission', icon: Award, tag: '7' },
    { id: 'int-status', label: 'Interview status', icon: Clock, tag: '8' },
    { id: 'int-reminders', label: 'Feedback reminders', icon: AlertCircle, tag: '9' },
    { id: 'int-context', label: 'Previous-round context', icon: BookOpen, tag: '10' },
    { id: 'int-calendar', label: 'Availability / calendar', icon: CalendarCheck, tag: '11' },
    { id: 'int-permissions', label: 'Confidentiality & permissions', icon: Lock, tag: '12' }
  ];

  // 13 HR Lead Dashboard features as defined in the HR Lead Feature Plan
  const hrLeadMenuItems = [
    { id: 'hr-overview', label: 'Dashboard overview', icon: LayoutDashboard, tag: '1' },
    { id: 'hr-attendance', label: 'Attendance management', icon: Clock, tag: '2' },
    { id: 'hr-leave', label: 'Leave management', icon: Calendar, tag: '3' },
    { id: 'hr-employees', label: 'Employee management', icon: Users, tag: '4' },
    { id: 'hr-performance', label: 'Employee performance', icon: TrendingUp, tag: '5' },
    { id: 'hr-recruitment', label: 'Recruitment & onboarding', icon: UserPlus, tag: '6' },
    { id: 'hr-payroll', label: 'Payroll management', icon: CreditCard, tag: '7' },
    { id: 'hr-announcements', label: 'Announcements & alerts', icon: Bell, tag: '8' },
    { id: 'hr-shifts', label: 'Shift management', icon: CalendarCheck, tag: '9' },
    { id: 'hr-documents', label: 'Document repository', icon: FileText, tag: '10' },
    { id: 'hr-grievances', label: 'Grievance management', icon: AlertCircle, tag: '11' },
    { id: 'hr-approvals', label: 'Central approval center', icon: CheckSquare, tag: '12' },
    { id: 'hr-reports', label: 'Workforce analytics', icon: BarChart3, tag: '13' }
  ];

  let permittedItems = menuItems.filter(item => hasPermission(item.id));
  if (isRecruiterRole) {
    permittedItems = recruiterMenuItems;
  } else if (isPlacementRole) {
    permittedItems = placementMenuItems;
  } else if (isInterviewerRole) {
    permittedItems = interviewerMenuItems;
  } else if (isHrLeadRole) {
    permittedItems = hrLeadMenuItems;
  }

  // Role-based filtering for Consulting & Bookings sub-services
  const permittedSubServices = CONSULTING_SUB_SERVICES.filter(srv => {
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

  const getEmpId = (rawId) => {
    if (!rawId) return 'EMP-001';
    const idStr = String(rawId).trim().toUpperCase();
    if (idStr === 'EMP-1' || idStr === 'USR-1') return 'EMP-001';
    if (idStr.startsWith('USR-')) return 'EMP-' + idStr.substring(4);
    if (!idStr.startsWith('EMP-')) return 'EMP-' + idStr;
    return idStr;
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

      <aside className={`bg-white dark:bg-[#070c1e] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-all duration-300 z-50 fixed inset-y-0 left-0 lg:static lg:h-full lg:max-h-full min-h-0 overflow-hidden shrink-0 transform ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}`}>
      
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

      {/* Nav Menu */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain crm-sidebar-scroll py-4 px-3 space-y-1 text-xs font-semibold">
        {isRecruiterRole && !collapsed && (
          <div className="px-2 pt-0.5 pb-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-extrabold tracking-wider uppercase text-gold-600 dark:text-gold-400">
              <span>Recruiter Features</span>
              <span className="font-mono bg-gold-500/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded text-[9px] border border-gold-500/30">12 Features</span>
            </div>
          </div>
        )}

        {isPlacementRole && !collapsed && (
          <div className="px-2 pt-0.5 pb-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-extrabold tracking-wider uppercase text-gold-600 dark:text-gold-400">
              <span>Placement Features</span>
              <span className="font-mono bg-gold-500/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded text-[9px] border border-gold-500/30">12 Features</span>
            </div>
          </div>
        )}

        {isInterviewerRole && !collapsed && (
          <div className="px-2 pt-0.5 pb-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-extrabold tracking-wider uppercase text-gold-600 dark:text-gold-400">
              <span>Interviewer Features</span>
              <span className="font-mono bg-gold-500/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded text-[9px] border border-gold-500/30">12 Features</span>
            </div>
          </div>
        )}

        {isHrLeadRole && !collapsed && (
          <div className="px-2 pt-0.5 pb-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-extrabold tracking-wider uppercase text-gold-600 dark:text-gold-400">
              <span>HR Lead Workspace</span>
              <span className="font-mono bg-gold-500/15 text-gold-700 dark:text-gold-300 px-1.5 py-0.5 rounded text-[9px] border border-gold-500/30">13 Modules</span>
            </div>
          </div>
        )}
        {permittedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id || 
            (item.id === 'dashboard' && (activeModule === 'dashboard' || activeModule === 'plc-overview' || activeModule === 'int-overview' || activeModule === 'hr-overview')) ||
            (item.id === 'plc-overview' && (activeModule === 'dashboard' || activeModule === 'plc-overview')) ||
            (item.id === 'int-overview' && (activeModule === 'dashboard' || activeModule === 'int-overview')) ||
            (item.id === 'hr-overview' && (activeModule === 'dashboard' || activeModule === 'hr-overview'));

          if (item.id === 'consulting') {
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition duration-200 group cursor-pointer ${
                    isConsultingActive && consultingServiceFilter === 'all'
                      ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 font-bold shadow-sm'
                      : isParentActive
                      ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isParentActive ? 'text-gold-500' : 'text-slate-600 dark:text-slate-200'}`} />
                    {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {totalCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500 text-navy-950 font-mono shadow-xs">
                          {totalCount}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${consultingOpen ? 'transform rotate-180 text-gold-500' : ''}`} />
                    </div>
                  )}
                </button>

                {/* Individual Consulting & Booking Services list */}
                {!collapsed && consultingOpen && (
                  <div className="ml-4 pl-2.5 border-l-2 border-gold-500/30 space-y-0.5 py-1 animate-in fade-in duration-200">
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
                              ? 'bg-gold-500/25 text-gold-600 dark:text-gold-300 font-extrabold border border-gold-500/40 shadow-xs'
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
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition duration-200 ${
                isActive
                  ? 'bg-amber-100/70 dark:bg-gold-500/20 text-amber-900 dark:text-gold-300 font-bold border border-amber-300/60 dark:border-gold-500/30 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold'
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isActive 
                  ? 'text-amber-700 dark:text-gold-400' 
                  : 'text-slate-600 dark:text-slate-200'
              }`} />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!collapsed && item.tag && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold shrink-0 ${
                  isActive 
                    ? 'bg-gold-500 text-navy-950 shadow-xs' 
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
                }`}>
                  #{item.tag}
                </span>
              )}
              {!collapsed && item.id === 'super-admin' && Array.isArray(leads) && leads.filter(l => l && l.status === 'New').length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white animate-pulse">
                  {leads.filter(l => l && l.status === 'New').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* PINNED BOTTOM USER PROFILE & LOGOUT FOOTER (High-End Executive Glass Card & 100% Solid Visible Logout) */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#070c1e]/95 p-3 z-20 shadow-md backdrop-blur-md">
        {!collapsed ? (
          <div className="rounded-2xl p-3 bg-slate-50/95 dark:bg-gradient-to-b dark:from-[#0d1636] dark:to-[#080d24] border border-slate-200/90 dark:border-gold-500/25 shadow-sm space-y-3">
            
            {/* Top Row: User Avatar + Name & Emp ID */}
            <div className="flex items-center space-x-3">
              {/* Avatar with Ring & Live Indicator */}
              <div className="relative shrink-0">
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} 
                  alt={formatUserName(user?.name)} 
                  className="w-10 h-10 rounded-full border-2 border-gold-500 object-cover shadow-sm ring-2 ring-gold-500/30" 
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#070c1e] rounded-full shadow-xs" title="Online & Active" />
              </div>
              
              {/* User Identity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate tracking-tight" title={formatUserName(user?.name)}>
                    {formatUserName(user?.name)}
                  </h4>
                  <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-500/40 shrink-0 uppercase tracking-wider" title={'Employee ID: ' + getEmpId(user?.id)}>
                    {getEmpId(user?.id)}
                  </span>
                </div>
                
                {/* Role Pill & Active Status */}
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="font-semibold text-amber-700 dark:text-gold-400 flex items-center gap-1 truncate">
                    <ShieldCheck className="w-3 h-3 text-gold-500 shrink-0" />
                    <span className="truncate">{currentRole || user?.role || 'Super Admin'}</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Email Address Line */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-navy-950/70 border border-slate-200/70 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
              <Mail className="w-3 h-3 text-slate-400 dark:text-gold-400/80 shrink-0" />
              <span className="truncate flex-1" title={user?.email || 'thejobsyncit@gmail.com'}>
                {user?.email || 'thejobsyncit@gmail.com'}
              </span>
            </div>

            {/* HIGH-CONTRAST, 100% VISIBLE EXECUTIVE LOGOUT BUTTON */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) setCollapsed(true);
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs tracking-wide text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 border border-rose-400/40 shadow-md shadow-rose-950/40 hover:shadow-rose-600/30 transition-all duration-200 cursor-pointer group active:scale-[0.99]"
              title="Logout / Sign Out of Portal"
            >
              <LogOut className="w-4 h-4 text-white shrink-0 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Logout / Sign Out</span>
            </button>

          </div>
        ) : (
          /* Collapsed View (Narrow Sidebar) */
          <div className="flex flex-col items-center space-y-2.5 py-1">
            <div className="relative">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} 
                alt={formatUserName(user?.name)} 
                className="w-9 h-9 rounded-full border-2 border-gold-500 object-cover shadow-sm ring-1 ring-gold-500/40" 
                title={formatUserName(user?.name) + ' (' + getEmpId(user?.id) + ' - ' + (currentRole || 'Super Admin') + ')'} 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-navy-900 rounded-full" />
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md transition-all duration-200 cursor-pointer group hover:scale-105"
              title={'Logout / Sign Out (' + formatUserName(user?.name) + ')'}
            >
              <LogOut className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      </aside>
    </>
  );
};
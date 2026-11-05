import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, Users, GitMerge, Home, Globe, Building2, UserCheck, 
  Calendar, FileText, ShieldCheck, CreditCard, BarChart3, Sparkles, Zap, 
  Settings, Lock, LogOut, Award, ChevronRight, ChevronDown, CalendarCheck,
  GraduationCap, Compass, School, Languages, Plane
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

  const permittedItems = menuItems.filter(item => hasPermission(item.id));

  // Role-based filtering for Consulting & Bookings sub-services
  const permittedSubServices = CONSULTING_SUB_SERVICES.filter(srv => {
    if (srv.id === 'career-guidance') return hasPermission('career-guidance');
    if (srv.id === 'student-academy') return hasPermission('student-academy');
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`bg-white dark:bg-[#070c1e] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-all duration-300 z-50 fixed inset-y-0 left-0 lg:static lg:h-full lg:max-h-full min-h-0 overflow-hidden shrink-0 transform ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}`}>
      
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
        {permittedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

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
                  ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 font-bold shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold'
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-500' : 'text-slate-600 dark:text-slate-200'}`} />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!collapsed && item.id === 'super-admin' && Array.isArray(leads) && leads.filter(l => l && l.status === 'New').length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white animate-pulse">
                  {leads.filter(l => l && l.status === 'New').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 shrink-0">
        {!collapsed ? (
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2.5 truncate">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full border border-gold-500 object-cover" 
              />
              <div className="truncate">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold truncate">{currentRole || 'Super Admin'}</p>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-navy-800 transition cursor-pointer" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-500 cursor-pointer">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      </aside>
    </>
  );
};
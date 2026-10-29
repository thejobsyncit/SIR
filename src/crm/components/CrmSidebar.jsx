import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, Users, GitMerge, Home, Globe, Building2, UserCheck, 
  Calendar, FileText, ShieldCheck, CreditCard, BarChart3, Sparkles, Zap, 
  Settings, Lock, LogOut, Award, ChevronRight, CalendarCheck, Compass, GraduationCap
} from 'lucide-react';

export const CrmSidebar = ({ collapsed, setCollapsed }) => {
  const { activeModule, setActiveModule, hasPermission, logout, currentRole, user, leads = [] } = useCrm();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'consulting', label: 'Consulting & Bookings', icon: CalendarCheck },
    { id: 'career-guidance', label: 'Career Guidance', icon: Compass },
    { id: 'student-academy', label: 'Student Academy', icon: GraduationCap },
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
    { id: 'accounts', label: 'Accounts & Billing', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'ai-suite', label: 'AI Features Suite', icon: Sparkles },
    { id: 'automation', label: 'Automations', icon: Zap },
    { id: 'calendar', label: 'Schedule Calendar', icon: Calendar },
    { id: 'super-admin', label: 'Super Admin Panel', icon: ShieldCheck },
    { id: 'settings', label: 'Admin Settings', icon: Settings }
  ];

  const permittedItems = menuItems.filter(item => hasPermission(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`bg-white dark:bg-[#070c1e] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-all duration-300 z-50 fixed inset-y-0 left-0 lg:static transform ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}`}>
      
      {/* Top Brand Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
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
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-xs font-semibold">
        {permittedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
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
              {!collapsed && item.id === 'consulting' && leads.filter(l => l.consultationDate || l.status === 'Consultation Scheduled' || (l.serviceId && (l.serviceId.includes('consult') || l.serviceId.includes('adm')))).length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-500 text-navy-950 font-mono shadow-xs">
                  {leads.filter(l => l.consultationDate || l.status === 'Consultation Scheduled' || (l.serviceId && (l.serviceId.includes('consult') || l.serviceId.includes('adm')))).length}
                </span>
              )}
              {!collapsed && item.id === 'super-admin' && leads.filter(l => l.status === 'New').length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white animate-pulse">
                  {leads.filter(l => l.status === 'New').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50">
        {!collapsed ? (
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2.5 truncate">
              <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full border border-gold-500 object-cover" />
              <div className="truncate">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold truncate">{currentRole}</p>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-navy-800 transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-500">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      </aside>
    </>
  );
};

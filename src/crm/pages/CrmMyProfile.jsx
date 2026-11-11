import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  User, Mail, Phone, ShieldCheck, Briefcase, Calendar, MapPin,
  Clock, CheckCircle2, AlertCircle, Key, Bell, Edit3, Save, X,
  Lock, RefreshCw, LogOut, Copy, Check, Eye, EyeOff, Building2,
  Globe, GraduationCap, Sparkles, CheckSquare, Shield, Activity,
  ChevronRight, AlertTriangle
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Executive 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-2', label: 'Executive 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-3', label: 'Executive 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-4', label: 'Executive 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-5', label: 'Executive 5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-6', label: 'Executive 6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
];

export const CrmMyProfile = () => {
  const { currentEmployee, currentRole, user, updateUserProfile, logout, requestLogout, setActiveModule } = useCrm();

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Copy indicator
  const [copiedField, setCopiedField] = useState('');

  // Active section tab: 'overview' | 'work-info' | 'security' | 'notifications'
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    address: '',
    dateOfBirth: '',
    avatar: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', text: '' });

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    emailTaskAssignments: true,
    urgentFollowUpAlerts: true,
    dailyMorningSummary: true,
    systemAnnouncements: false
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Resolved identity
  const activeEmployeeId = useMemo(() => {
    return currentEmployee?.employeeId || currentEmployee?.id || user?.employeeId || user?.id || (
      user?.name === 'Fatima' ? 'REV-EMP-107' :
        user?.name?.includes('Divya') ? 'REV-EMP-102' :
          user?.name?.includes('Praveen') ? 'REV-EMP-108' : 'REV-EMP-006'
    );
  }, [currentEmployee, user]);

  const activeEmployeeEmail = useMemo(() => {
    return currentEmployee?.email || user?.email || (
      user?.name === 'Fatima' ? 'fatima.intl@revivalinternational.com' :
        user?.name?.includes('Divya') ? 'divya.enq@revivalinternational.com' :
          user?.name?.includes('Praveen') ? 'praveen.enq@revivalinternational.com' : 'balavarshini.s@revivalinternational.com'
    );
  }, [currentEmployee, user]);

  const activeEmployeeName = useMemo(() => {
    return currentEmployee?.name || user?.name || 'Balavarshini S.';
  }, [currentEmployee, user]);

  // Fetch full employee profile and real-time task metrics from backend
  const fetchProfileData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        employeeId: activeEmployeeId,
        employeeEmail: activeEmployeeEmail,
        employeeName: activeEmployeeName
      });

      const res = await fetch(`/api/employees/me/profile?${queryParams.toString()}`, {
        headers: {
          'x-employee-id': activeEmployeeId,
          'x-employee-email': activeEmployeeEmail,
          'x-employee-name': activeEmployeeName,
          'x-user-role': currentRole || 'HR Operations'
        }
      });

      const json = await res.json();
      if (json && json.success && json.data) {
        setProfile(json.data);
        if (json.data.notificationPreferences) {
          setNotifPrefs(prev => ({ ...prev, ...json.data.notificationPreferences }));
        }
        setEditFormData({
          phone: json.data.phone || '',
          address: json.data.address || '',
          dateOfBirth: json.data.dateOfBirth || '',
          avatar: json.data.avatar || ''
        });
      } else {
        // Fallback to local user context if backend returns empty
        const fallbackProfile = {
          id: activeEmployeeId,
          employeeId: activeEmployeeId,
          name: activeEmployeeName,
          email: activeEmployeeEmail,
          phone: currentEmployee?.phone || user?.phone || '+91 9876543214',
          role: currentRole || 'HR Operations',
          department: currentEmployee?.department || user?.department || 'International HR Operations',
          designation: currentEmployee?.designation || user?.designation || 'HR Operations Specialist',
          operationTeam: currentEmployee?.operationTeam || user?.operationTeam || 'International HR Operations',
          assignedBranch: (activeEmployeeName === 'Fatima' || activeEmployeeName.includes('Balavarshini'))
            ? 'Branch A: International HR Operations (International Admissions & Consulting)'
            : 'Branch B: Enquiry HR Operations (Career Guidance, Student Academy, College Admissions)',
          reportingManager: 'Priya Sharma (HR Lead)',
          joiningDate: '2023-08-10',
          employmentStatus: 'Full-Time (Active)',
          dateOfBirth: '1996-11-14',
          address: 'OMR IT Corridor, Chennai, India',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          status: 'Active',
          stats: {
            totalTasks: 4,
            pendingTasks: 2,
            inProgressTasks: 1,
            completedTasks: 1,
            overdueTasks: 0
          }
        };
        setProfile(fallbackProfile);
        setEditFormData({
          phone: fallbackProfile.phone,
          address: fallbackProfile.address,
          dateOfBirth: fallbackProfile.dateOfBirth,
          avatar: fallbackProfile.avatar
        });
      }
    } catch (err) {
      console.warn('Could not load profile from backend, using context values:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeEmployeeId, activeEmployeeEmail, activeEmployeeName, currentRole, currentEmployee, user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Copy to clipboard helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  // Open Edit Profile Modal
  const handleOpenEditModal = () => {
    if (profile) {
      setEditFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth || '',
        avatar: profile.avatar || ''
      });
    }
    setEditError('');
    setEditModalOpen(true);
  };

  // Submit Profile Edits (Only permitted personal fields)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');

    try {
      const payload = {
        employeeId: profile?.employeeId || activeEmployeeId,
        email: profile?.email || activeEmployeeEmail,
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
        dateOfBirth: editFormData.dateOfBirth,
        avatar: editFormData.avatar.trim()
      };

      const res = await fetch('/api/employees/me/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-id': activeEmployeeId,
          'x-employee-email': activeEmployeeEmail,
          'x-user-role': currentRole || 'HR Operations'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update profile.');
      }

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        ...payload
      }));

      // Update CRM context user object so top header and sidebar reflect immediately
      if (updateUserProfile) {
        updateUserProfile({
          phone: payload.phone,
          address: payload.address,
          dateOfBirth: payload.dateOfBirth,
          avatar: payload.avatar || profile?.avatar || user?.avatar
        });
      }

      setFeedbackMsg({
        type: 'success',
        text: '✓ Profile updated successfully! Your personal information is up to date.'
      });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 5000);
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || 'Error saving changes. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // Calculate live password strength
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-300 dark:bg-slate-700' };
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong (Enterprise Compliant)', color: 'bg-emerald-500' };
  };

  const passStrength = calculatePasswordStrength(passwordData.newPassword);

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/employees/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-id': activeEmployeeId,
          'x-employee-email': activeEmployeeEmail
        },
        body: JSON.stringify({
          employeeId: activeEmployeeId,
          email: activeEmployeeEmail,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to change password.');
      }

      // Also update local registered user list if present in localStorage
      try {
        const rawUsers = localStorage.getItem('sir_crm_registered_users');
        if (rawUsers) {
          const list = JSON.parse(rawUsers);
          const updated = list.map(u => {
            if (u.email && u.email.toLowerCase() === activeEmployeeEmail.toLowerCase()) {
              return { ...u, password: passwordData.newPassword };
            }
            return u;
          });
          localStorage.setItem('sir_crm_registered_users', JSON.stringify(updated));
        }
      } catch (_) { }

      setPasswordFeedback({
        type: 'success',
        text: '✓ Password changed securely! Your new password is now active.'
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordFeedback({ type: '', text: '' }), 6000);
    } catch (err) {
      setPasswordFeedback({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Save Notification Preferences
  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    try {
      await fetch('/api/employees/me/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-employee-id': activeEmployeeId,
          'x-employee-email': activeEmployeeEmail
        },
        body: JSON.stringify({
          employeeId: activeEmployeeId,
          notificationPreferences: notifPrefs
        })
      });

      setFeedbackMsg({
        type: 'success',
        text: '✓ Notification preferences saved successfully!'
      });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      console.warn('Could not save notification preferences:', err);
    } finally {
      setNotifSaving(false);
    }
  };

  // Team Branch formatting
  const isInternationalTeam = (profile?.operationTeam || '').includes('International') ||
    (profile?.name || '').includes('Fatima') ||
    (profile?.name || '').includes('Balavarshini');

  const resolvedBranchName = isInternationalTeam
    ? 'Branch A: International HR Operations'
    : 'Branch B: Enquiry HR Operations';

  const resolvedBranchSub = isInternationalTeam
    ? 'International Admissions, Global Consulting & Candidate Attestation'
    : 'Career Guidance, Student Academy & College Admissions Operations';

  const lastLoginFormatted = useMemo(() => {
    try {
      const saved = localStorage.getItem('sir_crm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.loginTime) {
          const d = new Date(parsed.loginTime);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch (_) { }
    return 'Active Session (Today)';
  }, []);

  if (loading && !profile) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-8 space-y-4 flex-col text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
        <p className="text-sm font-medium">Loading authenticated employee profile...</p>
      </div>
    );
  }

  const p = profile || {};
  const stats = p.stats || {
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Top Notification Feedback Alert */}
      {feedbackMsg.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all duration-300 ${feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
          }`}>
          <div className="flex items-center space-x-3">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Luxury subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-gold-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Left: Avatar + Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0 group">
              <img
                src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={p.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-3 border-gold-500/80 shadow-lg ring-4 ring-gold-500/20 group-hover:scale-[1.02] transition duration-300"
              />
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#070c1e] rounded-full shadow-md animate-pulse"
                title="Account Status: Active & Authenticated"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {p.name}
                </h1>

                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/40 uppercase tracking-wider">
                  {p.employeeId}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {p.status || 'Active'}
                </span>
              </div>

              <p className="text-sm font-semibold text-amber-700 dark:text-gold-400">
                {p.designation}
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {isInternationalTeam ? (
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  )}
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{p.operationTeam}</span>
                </div>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.department}</span>
                </div>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Last login: {lastLoginFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchProfileData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 hover:border-gold-500 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition duration-200 cursor-pointer"
              title="Refresh profile and task counts"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-gold-500' : ''}`} />
            </button>

            <button
              onClick={handleOpenEditModal}
              className="px-5 py-2.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-gold-500/20 transition duration-200 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-navy-800/80 pt-4 mt-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'overview'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
              }`}
          >
            Overview & Tasks
          </button>
          <button
            onClick={() => setActiveTab('work-info')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'work-info'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
              }`}
          >
            Work & Operations Branch
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'security'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
              }`}
          >
            Account Security & Password
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'notifications'
                ? 'bg-gold-500 text-navy-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900'
              }`}
          >
            Notification Preferences
          </button>
        </div>

      </div>

      {/* 2. WORK SUMMARY STATS CARDS (5 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

        {/* 1. Total Assigned Tasks */}
        <div
          onClick={() => setActiveModule('hr-tasks')}
          className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 p-4 rounded-2xl space-y-2 hover:border-gold-500/50 transition duration-200 cursor-pointer shadow-xs group"
          title="Click to view all assigned tasks in HR Task Assignment"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center group-hover:scale-110 transition">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalTasks}
            </span>
            <span className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold group-hover:underline flex items-center gap-0.5">
              View Queue <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">Total enquiries in your queue</p>
        </div>

        {/* 2. Pending Tasks */}
        <div
          onClick={() => setActiveModule('hr-tasks')}
          className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 p-4 rounded-2xl space-y-2 hover:border-amber-500/50 transition duration-200 cursor-pointer shadow-xs group"
          title="Click to view pending enquiries"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.pendingTasks}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">New / Assigned</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">Awaiting initial specialist contact</p>
        </div>

        {/* 3. In-Progress Tasks */}
        <div
          onClick={() => setActiveModule('hr-tasks')}
          className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 p-4 rounded-2xl space-y-2 hover:border-blue-500/50 transition duration-200 cursor-pointer shadow-xs group"
          title="Click to view in-progress enquiries"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              In-Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
              {stats.inProgressTasks}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Active Work</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">Under consultation & processing</p>
        </div>

        {/* 4. Completed Tasks */}
        <div
          onClick={() => setActiveModule('hr-tasks')}
          className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 p-4 rounded-2xl space-y-2 hover:border-emerald-500/50 transition duration-200 cursor-pointer shadow-xs group"
          title="Click to view completed enquiries"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.completedTasks}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Fulfilled</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">Successfully closed & enrolled</p>
        </div>

        {/* 5. Overdue Tasks */}
        <div
          onClick={() => setActiveModule('hr-tasks')}
          className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 p-4 rounded-2xl space-y-2 hover:border-rose-500/50 transition duration-200 cursor-pointer shadow-xs group col-span-2 sm:col-span-1"
          title="Click to review overdue items"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.overdueTasks}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">SLA Critical</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">Follow-up deadline exceeded</p>
        </div>

      </div>

      {/* 3. MAIN SECTION CARDS (Based on Active Tab) */}

      {/* TAB 1: OVERVIEW & PERSONAL INFORMATION */}
      {(activeTab === 'overview' || activeTab === 'work-info') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Card A: Personal Information */}
          <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-400">Verified identity & contact credentials</p>
                </div>
              </div>

              <button
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Details
              </button>
            </div>

            <div className="space-y-4 text-xs">

              {/* Full Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Full Legal Name</span>
                <span className="font-bold text-slate-900 dark:text-white sm:text-right">{p.name}</span>
              </div>

              {/* Employee ID (Read-Only) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Employee ID (Read-Only)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{p.employeeId}</span>
                  <button
                    onClick={() => handleCopy(p.employeeId, 'empId')}
                    className="text-slate-400 hover:text-gold-500 p-1"
                    title="Copy Employee ID"
                  >
                    {copiedField === 'empId' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Corporate Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Corporate Email Address</span>
                <div className="flex items-center gap-2 truncate">
                  <a href={`mailto:${p.email}`} className="font-mono font-bold text-slate-900 dark:text-white hover:text-gold-500 truncate">
                    {p.email}
                  </a>
                  <button
                    onClick={() => handleCopy(p.email, 'email')}
                    className="text-slate-400 hover:text-gold-500 p-1 shrink-0"
                    title="Copy Email Address"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <a href={`tel:${p.phone}`} className="font-mono font-bold text-slate-900 dark:text-white hover:text-emerald-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{p.phone || 'Not Specified'}</span>
                </a>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'November 14, 1996'}
                </span>
              </div>

              {/* Residential / Work Location Address */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-2">
                <span className="text-slate-500 font-medium shrink-0">Official Address</span>
                <div className="flex items-start gap-1.5 sm:text-right text-slate-800 dark:text-slate-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{p.address || 'OMR IT Corridor, Chennai, India'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Card B: Work & Operational Branch Information */}
          <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                    Work & Operations Assignment
                  </h3>
                  <p className="text-xs text-slate-400">Read-only enterprise organizational record</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-navy-700">
                <Lock className="w-3 h-3" /> Managed by HR
              </span>
            </div>

            <div className="space-y-4 text-xs">

              {/* Department & Operational Team */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned HR Team</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${isInternationalTeam
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/40'
                      : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/40'
                    }`}>
                    {p.operationTeam}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Department: <strong className="text-slate-800 dark:text-slate-200">{p.department}</strong>
                </p>
              </div>

              {/* Assigned Operations Branch */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/10 to-amber-500/5 border border-gold-500/30 space-y-1">
                <div className="flex items-center gap-2">
                  {isInternationalTeam ? (
                    <Globe className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  )}
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    {resolvedBranchName}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {resolvedBranchSub}
                </p>
              </div>

              {/* Designation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Official Designation</span>
                <span className="font-bold text-slate-900 dark:text-white sm:text-right">{p.designation}</span>
              </div>

              {/* Reporting Manager */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Reporting Manager</span>
                <span className="font-bold text-slate-900 dark:text-white sm:text-right">{p.reportingManager || 'Priya Sharma (HR Lead)'}</span>
              </div>

              {/* Date of Joining */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Date of Joining</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {p.joiningDate ? new Date(p.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'August 10, 2023'}
                </span>
              </div>

              {/* Employment Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 gap-1">
                <span className="text-slate-500 font-medium">Employment Type</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {p.employmentStatus || 'Full-Time (Active)'}
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ACCOUNT SECURITY & CHANGE PASSWORD */}
      {(activeTab === 'overview' || activeTab === 'security') && (
        <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Account Security & Password Management
                </h3>
                <p className="text-xs text-slate-400">Enterprise password credentials and session access</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700/40 font-bold">
                🔒 TLS 1.3 Encrypted
              </span>
            </div>
          </div>

          {/* Password Feedback Alert */}
          {passwordFeedback.text && (
            <div className={`p-4 rounded-2xl flex items-center justify-between border text-xs sm:text-sm font-semibold ${passwordFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
              }`}>
              <div className="flex items-center space-x-3">
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{passwordFeedback.text}</span>
              </div>
              <button onClick={() => setPasswordFeedback({ type: '', text: '' })} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-500" />
                  <span>Current Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-500" />
                  <span>New Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-500" />
                  <span>Confirm New Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Re-type new password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Password strength progress indicator */}
            {passwordData.newPassword && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Password Strength:</span>
                  <span className={`font-bold ${passStrength.score >= 75 ? 'text-emerald-500' : (passStrength.score >= 40 ? 'text-amber-500' : 'text-rose-500')
                    }`}>
                    {passStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passStrength.color}`}
                    style={{ width: `${passStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800 flex-wrap gap-3">
              <span className="text-[11px] text-slate-400">
                Never share your password with anyone. Passwords are encrypted before database persistence.
              </span>

              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs sm:text-sm transition duration-200 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Session Termination & Logout Row */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Session Management & Sign Out</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Terminate active corporate session on this browser. You will be redirected to the secure CRM portal login.
              </p>
            </div>

            <button
              type="button"
              onClick={() => (currentRole === 'HR Operations' && requestLogout ? requestLogout() : logout())}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition duration-200 shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Now</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: NOTIFICATION PREFERENCES */}
      {(activeTab === 'overview' || activeTab === 'notifications') && (
        <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-400">Configure alert channels for operational assignments and follow-ups</p>
              </div>
            </div>

            <button
              onClick={handleSaveNotifications}
              disabled={notifSaving}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{notifSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

            {/* Pref 1: Task Assignment Alerts */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">New Task Assignment Notifications</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive instant alerts whenever the HR Lead or Super Admin allocates new candidate enquiries to your queue.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={notifPrefs.emailTaskAssignments}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, emailTaskAssignments: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-600 peer-checked:bg-gold-500" />
              </label>
            </div>

            {/* Pref 2: Urgent Follow-Up Alerts */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">Approaching Follow-Up Alerts</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive timely reminders 30 minutes before a scheduled candidate consultation call or dossier verification due date.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={notifPrefs.urgentFollowUpAlerts}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, urgentFollowUpAlerts: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-600 peer-checked:bg-gold-500" />
              </label>
            </div>

            {/* Pref 3: Daily Morning Queue Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">Daily Morning Queue Digest</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive a consolidated digest of pending tasks and pending enquiries every morning at 08:30 AM GST.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={notifPrefs.dailyMorningSummary}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, dailyMorningSummary: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-600 peer-checked:bg-gold-500" />
              </label>
            </div>

            {/* Pref 4: System Announcements */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">HR & Corporate Circulars</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive company-wide policy updates, shift change alerts, and executive notices issued by HR Lead Priya Sharma.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={notifPrefs.systemAnnouncements}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, systemAnnouncements: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-600 peer-checked:bg-gold-500" />
              </label>
            </div>

          </div>
        </div>
      )}

      {/* 4. EDIT PROFILE POPUP MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#070c1e] border border-slate-200 dark:border-navy-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto crm-main-scroll">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Edit Personal Profile
                  </h3>
                  <p className="text-xs text-slate-400">Update approved personal contact and avatar details</p>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error notice */}
            {editError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">

              {/* Locked System Fields (Read-Only Warning) */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/40 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-[11px]">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Administrative Role & Work Assignment Locked</span>
                </div>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-400 leading-relaxed">
                  Employee ID (<strong>{p.employeeId}</strong>), Official Name, Designation, and Assigned Team are governed by Central HR Administration and cannot be modified directly.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Choose Profile Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditFormData(prev => ({ ...prev, avatar: av.url }))}
                      className={`relative rounded-2xl overflow-hidden border-2 transition p-0.5 cursor-pointer ${editFormData.avatar === av.url
                          ? 'border-gold-500 scale-105 shadow-md ring-2 ring-gold-500/30'
                          : 'border-transparent hover:border-slate-300 dark:hover:border-navy-600 opacity-75 hover:opacity-100'
                        }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-12 rounded-xl object-cover" />
                      {editFormData.avatar === av.url && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center text-[9px] font-black">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Custom Avatar URL */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Or Custom Image URL</label>
                <input
                  type="url"
                  value={editFormData.avatar}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Phone Number Input */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43214"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              {/* Date of Birth Input */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Address Input */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Residential / Work Location Address</span>
                </label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street Address, City, Country"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {editSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

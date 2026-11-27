import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, 
  CheckCircle2, UserCheck, AlertTriangle, AlertCircle, RefreshCw, X, Clock, Send
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';
import ScrollReveal from '../../components/ScrollReveal';

// Master Default Corporate Accounts with full role, department, team & credential metadata
export const DEFAULT_CRM_ACCOUNTS = [
  { 
    name: 'Super Admin', 
    email: 'thejobsyncit@gmail.com', 
    altEmail: 'thejobsyncit@gmail.com', 
    password: 'Thejobsync@26', 
    role: 'Super Admin', 
    phone: '+91 9003475405', 
    department: 'Executive Management',
    employeeId: 'REV-EMP-001'
  },
  { 
    name: 'Tariq Mansoor', 
    email: 'tariq.admin@revivalinternational.com', 
    altEmail: 'tariq@revivalinternational.com', 
    password: 'Super@Secret2026!', 
    role: 'Super Admin', 
    phone: '+971 50 123 4567',
    department: 'Executive Management',
    employeeId: 'REV-EMP-011'
  },
  { 
    name: 'Dhanalakshimi', 
    email: 'dhana.jasync@gmail.com', 
    altEmail: 'dhanalakshimi@revivalinternational.com', 
    password: 'Password123!', 
    role: 'Super Admin', 
    phone: '+91 9876543210', 
    department: 'India Operations HQ',
    employeeId: 'REV-EMP-000'
  },
  { 
    name: 'Sarah Jenkins', 
    email: 'sarah.admin@revivalinternational.com', 
    password: 'Password123!', 
    role: 'Admin', 
    phone: '+91 98400 11002', 
    department: 'Administration',
    employeeId: 'REV-EMP-002'
  },
  { 
    name: 'Priya Sharma', 
    email: 'priya.lead@revivalinternational.com', 
    password: 'Password123!', 
    role: 'HR Lead', 
    phone: '+91 98400 11003', 
    department: 'Human Resources',
    employeeId: 'REV-EMP-003'
  },
  { 
    name: 'Sarah Al Zaabi', 
    email: 'sarah.hr@revivalinternational.com', 
    password: 'Password123!', 
    role: 'HR Lead', 
    phone: '+971 50 234 5678', 
    department: 'Human Resources',
    employeeId: 'REV-EMP-013'
  },
  { 
    name: 'Kishore Kumar', 
    email: 'kishore.recruiter@revivalinternational.com', 
    password: 'Password123!', 
    role: 'Recruiter', 
    phone: '+91 98400 11004', 
    department: 'Recruitment & ATS',
    employeeId: 'REV-EMP-004'
  },
  { 
    name: 'Sreeja Nair', 
    email: 'sreeja.jasync@gmail.com', 
    altEmail: 'sreeja.placement@revivalinternational.com', 
    password: 'Password123!', 
    role: 'Placement Coordinator', 
    phone: '+91 9876543211', 
    department: 'Placement & Industry Relations',
    employeeId: 'REV-EMP-005'
  },
  { 
    name: 'Balavarshini S.', 
    email: 'balavarshini.s@revivalinternational.com', 
    altEmail: 'balavarshini2223@gmail.com', 
    password: 'Password123!', 
    role: 'HR Operations', 
    phone: '+91 9876543214', 
    department: 'International HR Operations',
    operationTeam: 'International HR Operations',
    designation: 'Lead HR Operations Specialist',
    employeeId: 'REV-EMP-006'
  },
  { 
    name: 'Fatima', 
    email: 'fatima.intl@revivalinternational.com', 
    altEmail: 'fatima.ops@revivalinternational.com', 
    password: 'Password123!', 
    role: 'HR Operations', 
    phone: '+971 50 876 5432', 
    department: 'International HR Operations',
    operationTeam: 'International HR Operations',
    designation: 'International HR Operations Specialist',
    employeeId: 'REV-EMP-107'
  },
  { 
    name: 'Divya R.', 
    email: 'divya.enq@revivalinternational.com', 
    password: 'Password123!', 
    role: 'HR Operations', 
    phone: '+91 98401 11202', 
    department: 'Enquiry HR Operations',
    operationTeam: 'Enquiry HR Operations',
    designation: 'HR Operations Specialist',
    employeeId: 'REV-EMP-102'
  },
  { 
    name: 'Praveen Kumar', 
    email: 'praveen.enq@revivalinternational.com', 
    password: 'Password123!', 
    role: 'HR Operations', 
    phone: '+91 98401 11208', 
    department: 'Enquiry HR Operations',
    operationTeam: 'Enquiry HR Operations',
    designation: 'HR Operations Specialist',
    employeeId: 'REV-EMP-108'
  },
  { 
    name: 'Dr. Tariq Al-Hashimi', 
    email: 'tariq.interviewer@revivalinternational.com', 
    password: 'Password123!', 
    role: 'Interviewer', 
    phone: '+971 50 456 7890', 
    department: 'Technical & Academic Assessment Panel',
    designation: 'Senior Technical Interviewer & Panellist',
    employeeId: 'REV-EMP-007'
  }
];

export const CrmLogin = () => {
  const { 
    login, recordFailedLogin = () => {}, failedLoginAttempts = 0, 
    accountLocked = false, lockoutTimeRemaining = 0, 
    currentRole, switchRole = () => {},
    lateApprovalGate, setLateApprovalGate, checkLateApprovalStatus
  } = useCrm();

  // Inputs start completely empty - NO dummy pre-filled text
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  // Direct login without 2FA OTP step
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  
  // Modals & Popups (Direct Reset - Zero OTP)
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Helper to match email or altEmail
  const matchesUser = (u, target) => {
    if (!u || !target) return false;
    const uEm = (u.email || '').toLowerCase().trim();
    const uAlt = (u.altEmail || '').toLowerCase().trim();
    return uEm === target || uAlt === target;
  };

  // Persistent Registered Accounts DB (Created via Super Admin Employee Directory)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    let users = [...DEFAULT_CRM_ACCOUNTS];
    const saved = localStorage.getItem('sir_crm_registered_users');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          users = parsed;
          // Merge DEFAULT_CRM_ACCOUNTS and ensure credentials are up to date
          DEFAULT_CRM_ACCOUNTS.forEach(def => {
            const idx = users.findIndex(u => matchesUser(u, def.email.toLowerCase()));
            if (idx === -1) {
              users.unshift(def);
            } else {
              users[idx] = { ...users[idx], ...def };
            }
          });
        }
      } catch (e) { console.error(e); }
    }
    localStorage.setItem('sir_crm_registered_users', JSON.stringify(users));
    return users;
  });

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 15;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong (Enterprise Grade)', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(password);

  // Executive Late Arrival Ingress Gate State (displayed at top of login form)
  const [loginLateGate, setLoginLateGate] = useState(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [lateReason, setLateReason] = useState('Traffic / Transit Congestion');
  const [lateDetails, setLateDetails] = useState('');
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [reasonSubmitted, setReasonSubmitted] = useState(false);
  const [lateApprovalMsg, setLateApprovalMsg] = useState('');

  const formatLateDelay = (mins) => {
    const m = Math.max(0, Number(mins) || 0);
    if (m < 60) return `+${m}m Late`;
    const hrs = Math.floor(m / 60);
    const rem = m % 60;
    return `+${hrs}h ${rem}m Late (${m} mins)`;
  };

  // If restored session has an active lateApprovalGate from CrmContext, show inline banner on Login & auto-poll every 1s
  useEffect(() => {
    if (!lateApprovalGate?.isBlocked) return;
    const mins = lateApprovalGate.lateMinutes || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const delayText = h > 0 ? `${h}h ${m}m late` : `${m} mins late`;
    const isLead = String(lateApprovalGate.role || '').toLowerCase().includes('lead');
    const approverText = isLead ? 'Super Admin only' : 'Super Admin or HR Lead';
    setAuthErrorMsg(`⚠️ Late Arrival Error (${delayText}): Grace period (15 mins after ${lateApprovalGate.shiftStart || '09:00 AM'}) has passed for ${lateApprovalGate.shiftName || 'Assigned Shift'}. Approval from ${approverText} is required to sign in.`);

    const timer = setInterval(async () => {
      if (!checkLateApprovalStatus) return;
      const status = await checkLateApprovalStatus();
      if (status === 'APPROVED') {
        if (setLateApprovalGate) setLateApprovalGate(null);
      } else if (status === 'REJECTED') {
        setAuthErrorMsg('❌ Access Declined: Super Admin has rejected your late arrival check-in for today. Contact HR Operations.');
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lateApprovalGate, checkLateApprovalStatus, setLateApprovalGate]);

  // Live rapid auto-polling (every 1s) for Super Admin / HR Lead approval while late gate is active
  useEffect(() => {
    if (!loginLateGate || loginLateGate.status !== 'PENDING') return;

    let isMounted = true;
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const cleanEmail = loginLateGate.userAccount.email.trim().toLowerCase();
        const role = loginLateGate.userAccount.role || 'Employee';
        const res = await fetch(`/api/hr-ops/attendance/late-approval-status?email=${encodeURIComponent(cleanEmail)}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'x-employee-email': cleanEmail,
            'x-crm-role': role
          }
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json && json.success) {
            if (json.lateApprovalStatus === 'APPROVED' || json.lateApprovalStatus === 'EXEMPT') {
              setLoginLateGate(prev => ({ ...prev, status: 'APPROVED' }));
              setLateApprovalMsg('✓ Late Ingress Approved! Unlocking your CRM workspace...');
              clearInterval(interval);
              setTimeout(() => {
                login(loginLateGate.userAccount.email, loginLateGate.password, loginLateGate.userAccount.role, loginLateGate.userAccount);
              }, 250);
            } else if (json.lateApprovalStatus === 'REJECTED') {
              setLoginLateGate(prev => ({ ...prev, status: 'REJECTED' }));
              setLateApprovalMsg('❌ Access Declined: Late arrival entry was rejected for today.');
              clearInterval(interval);
            }
          }
        }
      } catch (_) {}
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loginLateGate, login]);

  const handleManualCheckApproval = async () => {
    if (!loginLateGate) return;
    setIsCheckingApproval(true);
    setLateApprovalMsg('Querying approval decision from live database...');
    try {
      const cleanEmail = loginLateGate.userAccount.email.trim().toLowerCase();
      const role = loginLateGate.userAccount.role || 'Employee';
      const res = await fetch(`/api/hr-ops/attendance/late-approval-status?email=${encodeURIComponent(cleanEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-employee-email': cleanEmail,
          'x-crm-role': role
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.lateApprovalStatus === 'APPROVED' || json?.lateApprovalStatus === 'EXEMPT') {
          setLoginLateGate(prev => ({ ...prev, status: 'APPROVED' }));
          setLateApprovalMsg('✓ Authorization Approved! Unlocking CRM workspace...');
          setTimeout(() => {
            login(loginLateGate.userAccount.email, loginLateGate.password, loginLateGate.userAccount.role, loginLateGate.userAccount);
          }, 200);
        } else if (json?.lateApprovalStatus === 'REJECTED') {
          setLoginLateGate(prev => ({ ...prev, status: 'REJECTED' }));
          setLateApprovalMsg('❌ Access Denied: Late arrival request was rejected.');
        } else {
          setLateApprovalMsg('Authorization review is still pending. Please wait a moment.');
        }
      } else {
        setLateApprovalMsg('Authorization review is pending in Executive / HR Lead console.');
      }
    } catch (_) {
      setLateApprovalMsg('Connecting to live server. Retrying...');
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const handleSubmitJustification = async () => {
    if (!loginLateGate) return;
    setIsSubmittingReason(true);
    try {
      await fetch('/api/hr-ops/attendance/late-justification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginLateGate.userAccount.email,
          attendanceId: loginLateGate.attendanceId,
          reasonCategory: lateReason,
          reasonDetails: lateDetails
        })
      });
      setReasonSubmitted(true);
    } catch (_) {}
    setIsSubmittingReason(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthErrorMsg('');

    // If late gate is active and pending, clicking submit re-checks status
    if (loginLateGate && loginLateGate.status === 'PENDING') {
      await handleManualCheckApproval();
      return;
    }

    if (!email || !password) {
      setAuthErrorMsg('Please enter your Corporate Email Address and Password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Reload latest registered users from localStorage to catch any recently created accounts
    let currentUsers = [...DEFAULT_CRM_ACCOUNTS];
    const latestSaved = localStorage.getItem('sir_crm_registered_users');
    if (latestSaved) {
      try {
        const parsed = JSON.parse(latestSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(p => {
            const idx = currentUsers.findIndex(u => matchesUser(u, (p.email || '').toLowerCase().trim()));
            if (idx === -1) {
              currentUsers.push(p);
            } else {
              currentUsers[idx] = { ...currentUsers[idx], ...p };
            }
          });
        }
      } catch (err) {}
    }

    let userAccount = currentUsers.find(u => matchesUser(u, cleanEmail));

    // Try backend authentication endpoint if user account not found or password mismatch locally
    if (!userAccount || userAccount.password !== password) {
      const endpoints = ['/api/crm/auth/login', 'http://localhost:5000/api/crm/auth/login'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.employee) {
              userAccount = {
                name: data.employee.name,
                email: data.employee.email,
                altEmail: data.employee.altEmail,
                role: data.employee.role,
                password: password,
                employeeId: data.employee.employeeId || data.employee.id,
                department: data.employee.department,
                operationTeam: data.employee.operationTeam,
                phone: data.employee.phone,
                token: data.token
              };
              currentUsers = [userAccount, ...currentUsers.filter(u => !matchesUser(u, cleanEmail))];
              localStorage.setItem('sir_crm_registered_users', JSON.stringify(currentUsers));
              setRegisteredUsers(currentUsers);
              break;
            }
          }
        } catch (_) {}
      }
    }

    // Account validation & Direct Entry for Any Added/Demo Account (No OTP!)
    if (userAccount) {
      if (userAccount.password && userAccount.password !== password) {
        setAuthErrorMsg(`❌ Incorrect password for registered account '${email}'. Please verify your password.`);
        return;
      }
    } else {
      // Auto-provision demo account so user can enter directly without roadblocks!
      const roleToAssign = 'Super Admin';
      const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      userAccount = {
        id: `emp-${Date.now()}`,
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: defaultName,
        email: cleanEmail,
        password: password,
        role: roleToAssign,
        department: 'Executive Management',
        status: 'Active'
      };
      currentUsers = [userAccount, ...currentUsers];
      localStorage.setItem('sir_crm_registered_users', JSON.stringify(currentUsers));
      setRegisteredUsers(currentUsers);
    }

    // Executive Role: Super Admin & Admin bypass all late gates immediately
    const isExecutive = userAccount.role === 'Super Admin' || userAccount.role === 'Admin';
    if (isExecutive) {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        login(userAccount.email, password, userAccount.role || 'Super Admin', userAccount);
      }, 200);
      return;
    }

    // Non-executive employee: Compute Shift Timing & Late Arrival
    const now = new Date();
    const istParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(now);
    const h = Number(istParts.find(p => p.type === 'hour')?.value || 0);
    const m = Number(istParts.find(p => p.type === 'minute')?.value || 0);
    const currentMinutesFromMidnight = h * 60 + m;
    const shiftStartMinutes = 9 * 60; // 09:00 AM (540 mins)
    const graceEndMinutes = shiftStartMinutes + 15; // 09:15 AM (555 mins)
    const isShiftLate = currentMinutesFromMidnight > graceEndMinutes;
    const computedLateMinutes = isShiftLate ? (currentMinutesFromMidnight - shiftStartMinutes) : 0;

    // Call server to record login attempt / check approval
    setIsAuthenticating(true);
    let checkResult = null;
    let checkStatus = 0;
    try {
      const res = await fetch('/api/crm/auth/record-late-login', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      checkStatus = res.status;
      checkResult = await res.json().catch(() => null);
    } catch (_) {}

    setIsAuthenticating(false);

    if (checkStatus === 401 || checkStatus === 403) {
      setAuthErrorMsg(`❌ ${checkResult?.message || 'Invalid credentials or access denied.'}`);
      return;
    }

    if (checkResult?.lateApprovalStatus === 'REJECTED') {
      setAuthErrorMsg('❌ Access Declined: Super Admin has rejected your late arrival check-in for today. Contact HR Operations.');
      return;
    }

    // Allow entry ONLY when backend explicitly grants allowed: true (on-time or approved), or genuinely offline & on-time
    if ((checkResult?.success && checkResult?.allowed === true) || (checkStatus === 0 && !checkResult && !isShiftLate)) {
      login(userAccount.email, password, userAccount.role || 'HR Operations', userAccount);
      return;
    }

    // If employee (including HR Lead) is late after grace period and pending approval (or server unreachable while late)
    if (
      (checkResult && (checkResult.allowed === false || (checkResult.isLate && checkResult.lateApprovalStatus === 'PENDING'))) ||
      (!checkResult && (isShiftLate || checkStatus >= 500))
    ) {
      if (checkStatus >= 500 && !isShiftLate) {
        setAuthErrorMsg(`⚠️ Unable to verify shift attendance on server (${checkStatus}). Please retry in a moment.`);
        return;
      }
      const isLead = String(userAccount.role || checkResult?.role || '').toLowerCase().includes('lead');
      const approverText = isLead ? 'Super Admin only' : 'Super Admin or HR Lead';
      const delayText = formatLateDelay(checkResult?.lateMinutes || computedLateMinutes || 16);
      const shiftStartTime = checkResult?.shiftStart || '09:00 AM';
      const shiftTitle = checkResult?.shiftName || 'Assigned Shift';

      setLoginLateGate({
        status: 'PENDING',
        lateMinutes: checkResult?.lateMinutes || computedLateMinutes || 16,
        delayTag: delayText,
        shiftStart: shiftStartTime,
        shiftName: shiftTitle,
        role: checkResult?.role || userAccount.role,
        employeeName: checkResult?.employeeName || userAccount.name,
        attendanceId: checkResult?.attendanceId,
        userAccount,
        password
      });

      setAuthErrorMsg(`⚠️ Late Arrival Error (${delayText}): Grace period (15 mins after ${shiftStartTime}) has passed for ${shiftTitle}. Approval from ${approverText} is required before CRM access.`);
      setLateApprovalMsg(`Awaiting ${approverText} authorization in live console... (Auto-checking every 1s)`);
      return;
    }

    // Clearance granted (on-time, approved, or executive exempt)
    setLoginLateGate(null);
    login(userAccount.email, password, userAccount.role || 'HR Operations', userAccount);
  };

  const handleDirectResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    const clean = (forgotEmail || '').trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setForgotError('Please enter a valid corporate email address.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter confirm password.');
      return;
    }

    // Update registered users in state and localStorage
    setRegisteredUsers(prev => {
      const updated = prev.map(u => {
        if (matchesUser(u, clean)) {
          return { ...u, password: forgotNewPassword };
        }
        return u;
      });
      if (!updated.some(u => matchesUser(u, clean))) {
        updated.push({
          id: `emp-${Date.now()}`,
          name: clean.split('@')[0],
          email: clean,
          password: forgotNewPassword,
          role: 'Super Admin',
          department: 'Executive Management'
        });
      }
      try {
        localStorage.setItem('sir_crm_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also sync password to backend
    const endpoints = ['/api/crm/auth/reset-password', 'http://localhost:5000/api/crm/auth/reset-password'];
    for (const ep of endpoints) {
      try {
        await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: clean, newPassword: forgotNewPassword })
        });
        break;
      } catch (_) {}
    }

    setEmail(clean);
    setPassword(forgotNewPassword);
    setForgotSuccess(`✓ Password successfully updated for ${clean}! Credentials pre-filled.`);
  };

  return (
    <div className="dark fixed inset-0 w-full h-full bg-navy-950 text-white flex items-center justify-center p-4 overflow-y-auto font-sans selection:bg-gold-500 selection:text-navy-950">
      
      {/* Ambient Animated Luxury Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <ScrollReveal>
      <div className="max-w-md w-full glass-card bg-navy-900/90 border border-gold-500/30 rounded-3xl p-8 shadow-luxury relative z-10 space-y-6 animate-in fade-in zoom-in-95">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-2 select-none">
            <img src="/images/logo.png" alt="The Revival International" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-white tracking-tight">
            The Revival International Enterprise CRM
          </h2>
          <p className="text-xs text-gold-400 font-bold uppercase tracking-wider">
            Private Corporate Portal • Restricted Gateway
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            
            {authErrorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 text-rose-200 font-bold rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authErrorMsg}</span>
              </div>
            )}

            {/* Simple, Professional, Short Late Warning */}
            {loginLateGate && loginLateGate.status === 'PENDING' && (
              <div className="py-2.5 px-3 bg-rose-950/80 border border-rose-500/70 text-rose-200 rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-rose-100">
                    Late Arrival ({loginLateGate.delayTag || `+${loginLateGate.lateMinutes}m`}) • {String(loginLateGate.role || '').toLowerCase().includes('lead') ? 'Super Admin' : 'HR Lead / Super Admin'} approval required
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-rose-300 font-mono shrink-0 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  Pending
                </span>
              </div>
            )}

            {/* Approved State Notice */}
            {loginLateGate && loginLateGate.status === 'APPROVED' && (
              <div className="py-2.5 px-3 bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-100">✓ Access Approved! Logging in...</span>
              </div>
            )}

            {/* Rejected State Notice */}
            {loginLateGate && loginLateGate.status === 'REJECTED' && (
              <div className="py-2.5 px-3 bg-rose-950/80 border border-rose-500/70 text-rose-200 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-[11px] font-bold text-rose-100">❌ Access Declined: Check-in rejected for today</span>
              </div>
            )}

            <div>
              <label className="block font-extrabold text-white text-xs mb-1.5">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginLateGate) {
                      setLoginLateGate(null);
                      setAuthErrorMsg('');
                      setLateApprovalMsg('');
                    }
                  }}
                  className="w-full bg-navy-950 border border-gold-500/50 focus:border-gold-400 text-white placeholder:text-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs focus:outline-none font-bold"
                  placeholder="Enter your corporate email id"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-white text-xs mb-1.5">Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full bg-navy-950 border border-gold-500/50 focus:border-gold-400 text-white placeholder:text-slate-300 rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none font-bold"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300 font-semibold">Password Strength:</span>
                    <span className="font-bold text-white">{strength.label}</span>
                  </div>
                  <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden border border-navy-800">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${Math.max(10, strength.score)}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-200 font-bold">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-navy-700 text-gold-500 focus:ring-0"
                />
                <span>Remember Session (JWT)</span>
              </label>

              <button 
                type="button" 
                onClick={() => setForgotModalOpen(true)}
                className="text-gold-400 hover:text-gold-300 hover:underline font-extrabold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating || isCheckingApproval}
              className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
            >
              {isAuthenticating || isCheckingApproval ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : loginLateGate?.status === 'APPROVED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              ) : loginLateGate?.status === 'PENDING' ? (
                <Clock className="w-4 h-4 text-amber-950" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {isAuthenticating || isCheckingApproval
                  ? 'Verifying Authorization...'
                  : loginLateGate?.status === 'APPROVED'
                    ? '✓ Authorized — Launching Workspace...'
                    : loginLateGate?.status === 'PENDING'
                      ? 'Awaiting Authorization... (Auto-Checking)'
                      : 'Sign In to Enterprise CRM →'}
              </span>
            </button>

            {/* Live Auto-Polling Status Badge & Message */}
            {loginLateGate && loginLateGate.status === 'PENDING' && (
              <div className="pt-2 text-center animate-in fade-in">
                <p className="text-[11px] font-semibold text-amber-300 dark:text-gold-400 flex items-center justify-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span>{lateApprovalMsg || 'Awaiting managerial authorization in Command Center... (Auto-refresh active)'}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Your workspace will unlock automatically as soon as approval is granted.
                </p>
              </div>
            )}
          </form>

        {/* Security Badge */}
        <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-300 flex justify-center items-center font-bold">
          <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            256-bit SSL Encrypted Gateway
          </span>
        </div>

      </div>
      </ScrollReveal>

      {/* Forgot Password Modal (Zero OTP) */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Reset Corporate Password</h3>
              <button 
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotError('');
                  setForgotSuccess('');
                }} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSuccess('');
                  }}
                  className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl text-xs shadow-gold-glow cursor-pointer"
                >
                  Proceed to Sign In →
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectResetPassword} className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Enter your registered corporate email address and chosen new password below.
                </p>
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Corporate Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                    placeholder="email@revivalinternational.com"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">New Password (Min 6 chars) *</label>
                  <input 
                    type="password" 
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
                  <input 
                    type="password" 
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow cursor-pointer transition">
                  Update Password & Pre-fill Login →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

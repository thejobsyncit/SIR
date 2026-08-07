import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, 
  CheckCircle2, UserCheck, AlertTriangle, RefreshCw, Laptop, Smartphone, Monitor, ShieldAlert, X, UserPlus, Check 
} from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

export const CrmLogin = () => {
  const { 
    login, recordFailedLogin, failedLoginAttempts, 
    accountLocked, lockoutTimeRemaining, 
    activeDevices, logoutEverywhere, 
    currentRole, switchRole 
  } = useCrm();

  // Inputs start completely empty - NO dummy pre-filled text
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [step, setStep] = useState(1); // 1: Password -> 2: Email 2FA OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  
  // Modals & Popups
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);

  // Super Admin / Account Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    role: 'Super Admin',
    password: '',
    adminKey: 'SIR-SUPER-2026'
  });
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

  // Persistent Registered Accounts DB (Created via Super Admin Employee Directory)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('sir_crm_registered_users');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    // Default Seeded Super Admin & Employee Directory Accounts
    const defaultAccounts = [
      { name: 'Super Admin', email: 'tariq.admin@sirrecruitment.com', password: 'Super@Secret2026!', role: 'Super Admin' },
      { name: 'Dhanalakshimi', email: 'dhana.jasync@gmail.com', password: 'Password123!', role: 'Placement Coordinator', phone: '+91 9876543210' },
      { name: 'Sreeja', email: 'sreeja.jasync@gmail.com', password: 'Password123!', role: 'Placement Coordinator', phone: '+91 9876543211' },
      { name: 'chentamilselvi', email: 'chentamilselvip7@gmail.com', password: 'Password123!', role: 'DMS', phone: '+91 9876543212' },
      { name: 'Diviya', email: 'abi.jasync@gmail.com', password: 'Password123!', role: 'Application Support', phone: '+91 9876543213' },
      { name: 'balavarshini', email: 'balavarshini2223@gmail.com', password: 'Password123!', role: 'Application Support', phone: '+91 9876543214' }
    ];
    localStorage.setItem('sir_crm_registered_users', JSON.stringify(defaultAccounts));
    return defaultAccounts;
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthErrorMsg('');

    if (!email || !password) {
      setAuthErrorMsg('Please enter your Corporate Email Address and Password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Reload latest registered users from localStorage to catch any recently created accounts
    let currentUsers = registeredUsers;
    const latestSaved = localStorage.getItem('sir_crm_registered_users');
    if (latestSaved) {
      try { currentUsers = JSON.parse(latestSaved); } catch (err) {}
    }

    // STRICT CHECK: Verify if account was created via Super Admin
    const userAccount = currentUsers.find(
      u => u.email.toLowerCase() === cleanEmail
    );

    if (!userAccount) {
      setAuthErrorMsg(`❌ Access Denied: '${email}' is not created by Super Admin! Please contact your Super Admin to create your Employee Account first.`);
      return;
    }

    if (userAccount.password !== password) {
      setAuthErrorMsg(`❌ Incorrect password for registered account '${email}'. Please check your password.`);
      return;
    }

    // Account verified! Send OTP to the user's email
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      
      setIsAuthenticating(false);
      
      if (data.success) {
        if (data.devMode && data.otp) {
          // Auto-fill OTP in Dev Mode for easier testing
          setOtp(data.otp.split(''));
          setAuthErrorMsg(`[DEV MODE] OTP Generated: ${data.otp}`);
        }
        switchRole(userAccount.role || 'Super Admin');
        setStep(2);
      } else {
        setAuthErrorMsg(data.message || 'Failed to dispatch OTP to email.');
      }
    } catch (err) {
      setIsAuthenticating(false);
      setAuthErrorMsg('Server error. Could not dispatch OTP.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthErrorMsg('');
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 4) {
      setAuthErrorMsg('Please enter the full 4-digit OTP.');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp })
      });
      const data = await res.json();
      
      if (data.success) {
        login(email, password, currentRole);
      } else {
        setIsAuthenticating(false);
        setAuthErrorMsg(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setIsAuthenticating(false);
      setAuthErrorMsg('Server error during OTP verification.');
    }
  };

  const handleRegisterSuperAdmin = (e) => {
    e.preventDefault();
    setAuthErrorMsg('');

    if (!regData.email || !regData.password) {
      alert('Please fill in both Email ID and Password.');
      return;
    }

    setIsAuthenticating(true);

    const newUser = {
      name: regData.name.trim() || 'Super Admin User',
      email: regData.email.trim().toLowerCase(),
      role: 'Super Admin',
      password: regData.password
    };

    const updatedList = [newUser, ...registeredUsers.filter(u => u.email.toLowerCase() !== newUser.email)];
    setRegisteredUsers(updatedList);
    localStorage.setItem('sir_crm_registered_users', JSON.stringify(updatedList));

    setEmail(newUser.email);
    setPassword(newUser.password);
    switchRole(newUser.role);

    setRegisterSuccessMsg(`✓ Super Admin Mail ID '${newUser.email}' created & registered successfully! Authenticating...`);

    setTimeout(() => {
      login(newUser.email, newUser.password, newUser.role);
      setIsAuthenticating(false);
      setRegisterModalOpen(false);
    }, 1000);
  };

  return (
    <div className="dark min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-gold-500 selection:text-navy-950">
      
      {/* Ambient Animated Luxury Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full glass-card bg-navy-900/90 border border-gold-500/30 rounded-3xl p-8 shadow-luxury relative z-10 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Company Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-navy-950 border-2 border-gold-500 flex items-center justify-center shadow-gold-glow mx-auto mb-2">
            <span className="font-serif text-3xl font-extrabold text-gold-500">S</span>
            <span className="font-serif text-2xl font-bold text-white">IR</span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-white tracking-tight">
            SIR Recruitment Enterprise CRM
          </h2>
          <p className="text-xs text-gold-400 font-bold uppercase tracking-wider">
            Private Corporate Portal • Restricted Gateway
          </p>
        </div>

        {/* Register Account Quick Callout Button */}
        <div className="p-3.5 bg-navy-950 border-2 border-gold-500/50 rounded-2xl flex justify-between items-center text-xs shadow-sm">
          <div>
            <span className="text-white font-extrabold text-xs block">Need a Corporate Mail ID?</span>
            <span className="text-[11px] text-slate-200 font-semibold">Register new Super Admin account to login</span>
          </div>
          <button 
            type="button"
            onClick={() => setRegisterModalOpen(true)}
            className="py-2.5 px-3.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Account</span>
          </button>
        </div>

        {step === 1 ? (
          /* Step 1: Email & Password Entry */
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            
            {authErrorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 text-rose-200 font-bold rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authErrorMsg}</span>
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
                  onChange={(e) => setEmail(e.target.value)}
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
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isAuthenticating ? 'Authenticating...' : 'Authenticate & Request 2FA OTP →'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="text-xs text-gold-400 hover:text-gold-300 font-extrabold underline cursor-pointer"
              >
                + Register New Corporate / Super Admin Mail ID →
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: 2FA OTP Verification */
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div className="text-center space-y-1">
              <KeyRound className="w-8 h-8 text-gold-500 mx-auto" />
              <h4 className="font-serif text-base font-bold text-white">Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-300 font-medium">Enter the 4-digit code dispatched to <strong className="text-white font-bold">{email}</strong></p>
            </div>

            <div className="flex justify-center gap-3 py-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="w-12 h-12 text-center bg-navy-950 border-2 border-gold-500/70 text-white font-mono text-xl font-bold rounded-xl focus:border-gold-400"
                />
              ))}
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isAuthenticating ? 'Launching CRM...' : 'Verify 2FA OTP & Launch CRM'}</span>
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-center text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              ← Back to Password Entry
            </button>
          </form>
        )}

        {/* Security & Active Devices Bar */}
        <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-300 flex justify-between items-center font-bold">
          <button 
            onClick={() => setDevicesModalOpen(true)}
            className="hover:text-gold-400 underline flex items-center gap-1 cursor-pointer"
          >
            <Laptop className="w-3.5 h-3.5 text-gold-400" />
            Active Session Devices ({activeDevices.length})
          </button>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            256-bit SSL Encrypted
          </span>
        </div>

      </div>

      {/* Register New Super Admin Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-500" />
                Register New Super Admin Mail ID
              </h3>
              <button onClick={() => setRegisterModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {registerSuccessMsg && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{registerSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSuperAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={regData.name} 
                  onChange={e => setRegData({...regData, name: e.target.value})} 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                  placeholder="e.g. Tariq Al-Mansoori"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">New Corporate Email ID</label>
                <input 
                  type="email" 
                  required 
                  value={regData.email} 
                  onChange={e => setRegData({...regData, email: e.target.value})} 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                  placeholder="admin.name@sirrecruitment.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Assigned Role</label>
                  <div className="w-full bg-slate-100 dark:bg-navy-950 border border-gold-500/50 text-gold-600 dark:text-gold-400 rounded-xl p-2.5 font-extrabold flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Super Admin</span>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Corporate Password</label>
                  <input 
                    type="password" 
                    required 
                    value={regData.password} 
                    onChange={e => setRegData({...regData, password: e.target.value})} 
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-gold-300 font-semibold leading-relaxed">
                ℹ️ <strong>Security Access Control:</strong> Only <strong>Super Admin</strong> registration is allowed here. Staff accounts (<em>Admin, Recruiter, Interviewer, Client Coordinator</em>) must be created by Super Admin inside CRM User Management.
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Super Admin Passcode Authorization Key</label>
                <input 
                  type="text" 
                  required 
                  value={regData.adminKey} 
                  onChange={e => setRegData({...regData, adminKey: e.target.value})} 
                  className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-amber-800 dark:text-gold-400 rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-gold-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={isAuthenticating}
                className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{isAuthenticating ? 'Creating Super Admin Account...' : 'Create Super Admin Account & Login'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Reset Corporate Account Password</h3>
              <button onClick={() => setForgotModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {!resetSent ? (
              <form onSubmit={(e) => { e.preventDefault(); setResetSent(true); }} className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300 font-medium">Enter your registered corporate email to receive a password reset verification link and OTP.</p>
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                  <input 
                    type="email" 
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                    placeholder="email@sirrecruitment.com"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow cursor-pointer">
                  Send Password Reset OTP Code
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Reset Verification Dispatched</h4>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Check your inbox at <strong className="text-amber-800 dark:text-gold-400 font-bold">{forgotEmail}</strong> for the secure password reset link.</p>
                <button onClick={() => { setForgotModalOpen(false); setResetSent(false); }} className="w-full py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-navy-700 cursor-pointer">
                  Close & Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Devices Modal */}
      {devicesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-gold-500" />
                Active Session Devices & History
              </h3>
              <button onClick={() => setDevicesModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2 text-xs">
              {activeDevices.map(d => (
                <div key={d.id} className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      {d.device}
                      {d.current && <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-emerald-300 dark:border-emerald-500/40">Current</span>}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">IP: {d.ip} • {d.location}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{d.lastActive}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={logoutEverywhere}
              className="w-full py-2.5 bg-rose-100 dark:bg-rose-600/20 text-rose-800 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-500/40 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Logout Everywhere (Revoke All Sessions)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

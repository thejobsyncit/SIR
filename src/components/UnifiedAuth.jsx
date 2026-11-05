import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Briefcase, ArrowRight, User, Lock, Mail, Phone, Sparkles, CheckCircle2, X, Settings, ExternalLink } from 'lucide-react';

export const COUNTRY_PHONE_CONFIG = [
  { code: '+91', country: 'India', flag: '🇮🇳', digits: 10, placeholder: '9876543210' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', digits: 9, placeholder: '50 123 4567' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', digits: 9, placeholder: '50 123 4567' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', digits: 8, placeholder: '3312 3456' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', digits: 8, placeholder: '9123 4567' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', digits: 8, placeholder: '9123 4567' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', digits: 8, placeholder: '3912 3456' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', digits: 10, placeholder: '7911 123456' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸', digits: 10, placeholder: '555 123 4567' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', digits: 8, placeholder: '8123 4567' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', digits: 9, placeholder: '12 345 6789' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', digits: 10, placeholder: '912 345 6789' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', digits: 9, placeholder: '71 234 5678' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', digits: 10, placeholder: '981 234 5678' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', digits: 10, placeholder: '1712 345678' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', digits: 10, placeholder: '300 1234567' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', digits: 10, placeholder: '100 123 4567' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', digits: 9, placeholder: '412 345 678' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', digits: 9, placeholder: '21 123 4567' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', digits: 10, placeholder: '151 12345678' },
  { code: '+33', country: 'France', flag: '🇫🇷', digits: 9, placeholder: '6 12 34 56 78' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', digits: 10, placeholder: '312 345 6789' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', digits: 9, placeholder: '6 12345678' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', digits: 9, placeholder: '78 123 4567' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', digits: 9, placeholder: '83 123 4567' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', digits: 9, placeholder: '82 123 4567' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', digits: 10, placeholder: '802 123 4567' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', digits: 9, placeholder: '712 345 678' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', digits: 9, placeholder: '24 123 4567' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', digits: 10, placeholder: '812 3456 7890' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', digits: 9, placeholder: '91 234 5678' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', digits: 10, placeholder: '90 1234 5678' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', digits: 10, placeholder: '10 1234 5678' }
];

export const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    name: 'Kishore Kumar',
    email: 'kishorekumaroff1@gmail.com',
    avatar: '/images/avatar_kishore.png',
    initial: 'K',
    bg: 'bg-blue-600'
  },
  {
    name: 'Harish Durai',
    email: 'harishdurai2508@gmail.com',
    avatar: '/images/avatar_harish.png',
    initial: 'H',
    bg: 'bg-emerald-600'
  },
  {
    name: 'thejobsync',
    email: 'thejobsyncit@gmail.com',
    avatar: null,
    initial: 'T',
    bg: 'bg-sky-600'
  },
  {
    name: 'mrjobsync',
    email: 'mrjobsync@gmail.com',
    avatar: null,
    initial: 'm',
    bg: 'bg-teal-700'
  }
];

export const UnifiedAuth = ({ defaultMode = 'login', defaultRole = 'candidate', onSuccess }) => {
  const { 
    loginCandidate, 
    registerCandidate, 
    loginWithGoogle, 
    setActiveModal, 
    navigateTo, 
    pendingJobToApply, 
    setPendingJobToApply, 
    applyForJob 
  } = useApp();

  const [authMode, setAuthMode] = useState(defaultMode); // 'login' | 'register'
  const [error, setError] = useState('');

  // Google OAuth & Google Identity Services (GIS) State
  const googleBtnRef = useRef(null);
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('sir_google_client_id') || '';
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Candidate Form States
  const [candidateLogin, setCandidateLogin] = useState({ email: '', password: '' });
  const [isCustomCountryCode, setIsCustomCountryCode] = useState(false);
  const [candidateReg, setCandidateReg] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    preferredCountry: 'UAE',
    industry: 'Engineering & Construction',
    password: '',
    confirmPassword: '',
    resumeName: ''
  });

  // Reset error when switching states
  const handleModeSwitch = (newMode) => {
    setAuthMode(newMode);
    setError('');
  };

  // Strict Email Validation Regex
  const isValidEmail = (emailStr) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(emailStr).trim().toLowerCase());
  };

  // Decode JWT credential from Google Identity Services
  const decodeGoogleJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.warn('Failed to decode Google JWT:', err);
      return null;
    }
  };

  // Google Credential Response Callback (Official Google GIS)
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    try {
      const profile = decodeGoogleJwt(response.credential);
      if (profile && profile.email) {
        await handleGoogleAuthSubmit(profile.email, profile.name || profile.given_name, profile.picture);
      }
    } catch (err) {
      console.error('Google Auth Token Processing Error:', err);
      setGoogleError('Failed to process Google sign-in response.');
    }
  };

  // Initialize Native Google Identity Services if Client ID is configured
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%'
          });
        }

        // Trigger Google One Tap account chooser popup with device's accounts
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google Identity Services Init Failed:', err);
      }
    }
  }, [googleClientId, authMode]);

  // Handle Google OAuth Authentication
  const handleGoogleAuthSubmit = async (selectedEmail, selectedName, selectedAvatar) => {
    setGoogleError('');
    const emailToUse = (selectedEmail || '').trim().toLowerCase();
    const nameToUse = (selectedName || emailToUse.split('@')[0]).trim();

    if (!emailToUse || !isValidEmail(emailToUse)) {
      setGoogleError('Please enter a valid Gmail / Google email address (e.g. name@gmail.com).');
      return;
    }

    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle({
        email: emailToUse,
        name: nameToUse,
        phone: candidateReg.phone ? `${candidateReg.countryCode} ${candidateReg.phone}` : '',
        avatar: selectedAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}`
      });

      if (!result || !result.success) {
        setGoogleError(result?.message || 'Google authentication failed.');
        setGoogleLoading(false);
        return;
      }

      // Save account to device Google accounts list for instant one-click login
      try {
        const devList = JSON.parse(localStorage.getItem('sir_device_google_accounts') || '[]');
        const idx = devList.findIndex(a => a.email.toLowerCase() === emailToUse);
        const item = {
          email: emailToUse,
          name: nameToUse,
          avatar: selectedAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}`
        };
        if (idx >= 0) devList[idx] = item;
        else devList.unshift(item);
        localStorage.setItem('sir_device_google_accounts', JSON.stringify(devList.slice(0, 8)));
      } catch {}

      setGoogleLoading(false);
      setShowGoogleChooser(false);
      setActiveModal(null);

      // If applying for a specific pending job, submit automatically
      if (pendingJobToApply) {
        await applyForJob(pendingJobToApply);
        setPendingJobToApply(null);
      }
      
      // Navigate to Candidate Dashboard immediately
      navigateTo('candidates');
      window.location.hash = 'candidates';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setGoogleError('Authentication error. Please try again.');
      setGoogleLoading(false);
    }
  };

  // Get active Google accounts present on this device
  const getDeviceAccounts = () => {
    const avatarMap = {
      'kishorekumaroff1@gmail.com': '/images/avatar_kishore.png',
      'kishorekumaroffl@gmail.com': '/images/avatar_kishore.png',
      'harishdurai2508@gmail.com': '/images/avatar_harish.png'
    };

    const list = DEFAULT_GOOGLE_ACCOUNTS.map(acc => {
      const emailLower = acc.email.toLowerCase();
      const isNoAvatar = emailLower === 'thejobsyncit@gmail.com' || emailLower === 'mrjobsync@gmail.com';
      return {
        ...acc,
        avatar: isNoAvatar ? null : (avatarMap[emailLower] || acc.avatar)
      };
    });

    try {
      const devStr = localStorage.getItem('sir_device_google_accounts');
      if (devStr) {
        const parsed = JSON.parse(devStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(acc => {
            const cleanAccEmail = (acc?.email || '').toLowerCase().trim();
            const isKishoreVariant = cleanAccEmail === 'kishorekumaroffl@gmail.com' || cleanAccEmail === 'kishorekumaroff1@gmail.com';
            if (cleanAccEmail && !list.some(x => x.email.toLowerCase() === cleanAccEmail) && !isKishoreVariant) {
              const noImg = cleanAccEmail === 'thejobsyncit@gmail.com' || cleanAccEmail === 'mrjobsync@gmail.com';
              list.push({
                ...acc,
                avatar: noImg ? null : (avatarMap[cleanAccEmail] || null),
                initial: (acc.name || acc.email).charAt(0).toUpperCase(),
                bg: 'bg-purple-600'
              });
            }
          });
        }
      }
    } catch {}
    return list;
  };

  // Trigger Google Account Chooser
  const handleTriggerGoogleAuth = () => {
    setError('');
    setGoogleError('');
    setShowCustomGoogleInput(false);
    setShowGoogleChooser(true);

    // If native Google Identity One-Tap is available, trigger it directly
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.prompt();
      } catch {}
    }
  };

  const handleSelectGoogleAccount = async (account) => {
    await handleGoogleAuthSubmit(account.email, account.name, account.avatar);
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const cleanName = customGoogleName.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setGoogleError('Please provide a valid Gmail address (e.g. name@gmail.com).');
      return;
    }

    await handleGoogleAuthSubmit(cleanEmail, cleanName);
  };

  // Submit Candidate Login
  const handleCandidateLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = candidateLogin.email.trim();
    if (!cleanEmail || !candidateLogin.password) {
      setError('Please provide both email and password.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    const result = loginCandidate(cleanEmail, candidateLogin.password);
    if (!result || !result.success) {
      setError(result?.message || 'Invalid credentials. Please register if you do not have an account.');
      return;
    }

    if (pendingJobToApply) {
      await applyForJob(pendingJobToApply);
      setPendingJobToApply(null);
    } else {
      navigateTo('candidates');
      window.location.hash = 'candidates';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Submit Candidate Registration
  const handleCandidateRegSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Full Name check
    if (!candidateReg.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    // 2. Strict Email check
    const cleanEmail = candidateReg.email.trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please provide a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    // 3. Country-specific or international phone validation
    const currentConfig = COUNTRY_PHONE_CONFIG.find(c => c.code === candidateReg.countryCode);
    const digitsOnly = candidateReg.phone.replace(/\D/g, '');
    
    if (currentConfig) {
      if (digitsOnly.length !== currentConfig.digits) {
        setError(`Phone number for ${currentConfig.flag} ${currentConfig.country} (${currentConfig.code}) must be exactly ${currentConfig.digits} digits.`);
        return;
      }
    } else {
      // Custom / International Country Code (7 to 15 digits as per E.164)
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError(`Please enter a valid phone number (7 to 15 digits). Current: ${digitsOnly.length} digits.`);
        return;
      }
    }

    // 4. Password validation
    if (!candidateReg.password || candidateReg.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (candidateReg.password !== candidateReg.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await registerCandidate({
      fullName: candidateReg.fullName.trim(),
      email: cleanEmail,
      password: candidateReg.password,
      phone: `${candidateReg.countryCode || '+91'} ${digitsOnly}`,
      preferredCountry: candidateReg.preferredCountry,
      industry: candidateReg.industry,
      resumeName: candidateReg.resumeName || 'Uploaded_CV.pdf'
    });

    if (!result || !result.success) {
      setError(result?.message || 'Registration failed. Please try again.');
      return;
    }

    if (pendingJobToApply) {
      await applyForJob(pendingJobToApply);
      setPendingJobToApply(null);
    } else {
      navigateTo('candidates');
    }

    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Quick Demo Login
  const handleDemoCandidateLogin = async () => {
    setError('');
    const result = loginCandidate('candidate@revivalinternational.com', 'demo123');
    if (result && result.success) {
      if (pendingJobToApply) {
        await applyForJob(pendingJobToApply);
        setPendingJobToApply(null);
      } else {
        navigateTo('candidates');
      }
      if (onSuccess) onSuccess();
      setActiveModal(null);
    } else {
      setError(result?.message || 'Demo access failed.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-navy-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-gold-500/30">
        
        {/* Revival Branding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogoIcon className="w-20 h-20 shadow-luxury mb-3" />
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            {authMode === 'login' ? 'Sign In to Your Account' : 'Create Your Candidate Account'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            {authMode === 'login' 
              ? 'Access your Candidate Portal to track job applications and interview updates.'
              : 'Register with verified credentials to apply for international vacancies.'}
          </p>
        </div>

        {/* Position Application Banner (if gated from Apply Now) */}
        {pendingJobToApply && (
          <div className="mb-5 p-4 bg-gold-500/10 border-2 border-gold-500/40 rounded-2xl flex items-start gap-3 text-left">
            <div className="p-2 rounded-xl bg-gold-500/20 text-gold-500 font-bold shrink-0 mt-0.5">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Position Application</span>
              <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white">
                {pendingJobToApply.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {pendingJobToApply.company} • {pendingJobToApply.location} ({pendingJobToApply.country})
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                {authMode === 'register' ? '✦ Complete registration or continue with Google to submit your verified application directly.' : '✦ Sign in below to submit your application with your existing candidate profile.'}
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="p-0.5 text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1-CLICK GOOGLE AUTHENTICATION BUTTON */}
        <div className="space-y-3 mb-5">
          {/* Native Google Identity Services Button Container (if initialized) */}
          <div ref={googleBtnRef} className="w-full empty:hidden flex justify-center mb-2"></div>

          <button
            type="button"
            onClick={handleTriggerGoogleAuth}
            className="w-full py-3 px-4 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 border-2 border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 rounded-2xl flex items-center justify-center gap-3 transition shadow-sm font-bold text-slate-800 dark:text-white text-xs cursor-pointer group"
          >
            {/* Official Multi-Color Google G Logo SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{authMode === 'login' ? 'Sign in with Google' : 'Continue with Google (Gmail Verified)'}</span>
          </button>

          <div className="relative text-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-navy-800" />
            </div>
            <span className="relative bg-white dark:bg-navy-950 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* CANDIDATE AUTH FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleCandidateLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={candidateLogin.email}
                  onChange={(e) => setCandidateLogin({ ...candidateLogin, email: e.target.value })}
                  placeholder="e.g. candidate@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={candidateLogin.password}
                  onChange={(e) => setCandidateLogin({ ...candidateLogin, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 dark:text-white font-bold rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 text-sm mt-4 cursor-pointer"
            >
              <span>Sign In to Candidate Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={handleDemoCandidateLogin}
                className="w-full py-2.5 bg-slate-50 dark:bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold rounded-xl transition text-xs border border-slate-200 dark:border-gold-500/30 cursor-pointer"
              >
                ⚡ Quick Demo Candidate Sign In (Instant Access)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCandidateRegSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={candidateReg.fullName}
                onChange={(e) => setCandidateReg({ ...candidateReg, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Gmail / Email Input */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gmail / Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={candidateReg.email}
                  onChange={(e) => setCandidateReg({ ...candidateReg, email: e.target.value })}
                  placeholder="john@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* DYNAMIC COUNTRY-SPECIFIC PHONE NUMBER INPUT (SELECT OR TYPE ANY COUNTRY CODE) */}
            <div>
              {(() => {
                const activeConfig = COUNTRY_PHONE_CONFIG.find(c => c.code === candidateReg.countryCode);
                const currentDigits = candidateReg.phone.replace(/\D/g, '');
                const maxDigits = activeConfig ? activeConfig.digits : 15;
                const isComplete = activeConfig 
                  ? currentDigits.length === activeConfig.digits 
                  : (currentDigits.length >= 7 && currentDigits.length <= 15);

                const currentFlag = activeConfig ? activeConfig.flag : '🌐';
                const currentCountryName = activeConfig ? activeConfig.country : 'International';

                return (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                          Phone Number *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCountryCode(!isCustomCountryCode);
                            if (!isCustomCountryCode && !candidateReg.countryCode) {
                              setCandidateReg({ ...candidateReg, countryCode: '+' });
                            }
                          }}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                          {isCustomCountryCode ? '← Select from list' : '✏️ Type custom code'}
                        </button>
                      </div>
                      <span className={`text-[11px] font-mono font-bold flex items-center gap-1 ${
                        isComplete ? 'text-emerald-500 font-bold' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />}
                        <span>
                          {currentFlag} {currentCountryName}: {currentDigits.length}/{activeConfig ? `${activeConfig.digits}` : '7-15'} Digits
                        </span>
                      </span>
                    </div>

                    <div className="flex rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 overflow-hidden shadow-sm transition">
                      {/* Country Selector: Select Mode or Type Mode */}
                      {isCustomCountryCode ? (
                        <div className="w-28 shrink-0 bg-slate-100 dark:bg-navy-800 border-r border-slate-200 dark:border-navy-700 flex items-center px-2">
                          <span className="text-xs mr-1">{currentFlag}</span>
                          <input
                            type="text"
                            value={candidateReg.countryCode}
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9+]/g, '');
                              if (!val.startsWith('+')) val = '+' + val.replace(/\+/g, '');
                              setCandidateReg({ ...candidateReg, countryCode: val.slice(0, 5) });
                            }}
                            placeholder="+XX"
                            className="w-full text-xs font-bold font-mono text-slate-800 dark:text-white bg-transparent focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="relative w-32 shrink-0 bg-slate-100 dark:bg-navy-800 border-r border-slate-200 dark:border-navy-700 flex items-center">
                          <select
                            value={candidateReg.countryCode}
                            onChange={(e) => {
                              const newCode = e.target.value;
                              if (newCode === '__CUSTOM__') {
                                setIsCustomCountryCode(true);
                                setCandidateReg({ ...candidateReg, countryCode: '+' });
                                return;
                              }
                              const newCfg = COUNTRY_PHONE_CONFIG.find(c => c.code === newCode);
                              const trimmedPhone = newCfg 
                                ? candidateReg.phone.replace(/\D/g, '').slice(0, newCfg.digits)
                                : candidateReg.phone.replace(/\D/g, '').slice(0, 15);
                              setCandidateReg({
                                ...candidateReg,
                                countryCode: newCode,
                                phone: trimmedPhone
                              });
                            }}
                            className="w-full h-full pl-2.5 pr-6 py-2.5 text-xs font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none cursor-pointer appearance-none truncate"
                          >
                            <option value="__CUSTOM__" className="text-blue-600 font-bold dark:bg-navy-900">
                              ✏️ Type other country code...
                            </option>
                            {COUNTRY_PHONE_CONFIG.map((c) => (
                              <option key={c.code} value={c.code} className="dark:bg-navy-900 text-slate-900 dark:text-white">
                                {c.flag} {c.code} ({c.country})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2 top-3 text-slate-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Spacious Phone Number Input */}
                      <div className="relative flex-1 min-w-0 flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={maxDigits}
                          required
                          value={candidateReg.phone}
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
                            setCandidateReg({ ...candidateReg, phone: digitsOnly });
                          }}
                          placeholder={activeConfig ? `Enter ${activeConfig.digits} digits (e.g. ${activeConfig.placeholder})` : 'Enter mobile number (7-15 digits)'}
                          className="w-full pl-9 pr-3 py-2.5 bg-transparent focus:outline-none text-slate-900 dark:text-white font-medium text-xs tracking-wider font-mono placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password (Min 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={candidateReg.password}
                    onChange={(e) => setCandidateReg({ ...candidateReg, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={candidateReg.confirmPassword}
                    onChange={(e) => setCandidateReg({ ...candidateReg, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 dark:text-white font-bold rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 text-sm mt-4 cursor-pointer"
            >
              <span>Complete Candidate Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Bottom Switch between Sign In and Register */}
        <div className="border-t border-slate-200 dark:border-navy-800 pt-5 mt-6 text-center text-xs font-medium">
          {authMode === 'login' ? (
            <p className="text-slate-600 dark:text-slate-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="text-gold-500 hover:text-gold-600 font-bold transition inline-flex items-center gap-1 cursor-pointer"
              >
                Create Candidate Account →
              </button>
            </p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-gold-500 hover:text-gold-600 font-bold transition inline-flex items-center gap-1 cursor-pointer"
              >
                Sign In to Candidate Portal →
              </button>
            </p>
          )}
        </div>

      </div>

      {/* AUTHENTIC GOOGLE ACCOUNT CHOOSER MODAL */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-navy-700 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                if (!googleLoading) {
                  setShowGoogleChooser(false);
                  setShowCustomGoogleInput(false);
                }
              }}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Brand Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="font-sans text-xl sm:text-2xl font-normal text-slate-800 dark:text-slate-100 mt-3 tracking-tight">
                Choose an account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                to continue to <span className="font-medium text-slate-800 dark:text-slate-200">The Revival International</span>
              </p>
            </div>

            {/* Error Message */}
            {googleError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
                <span>{googleError}</span>
                <button onClick={() => setGoogleError('')} className="p-0.5 text-rose-500 hover:text-rose-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Loading Spinner */}
            {googleLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <h4 className="text-sm font-medium text-slate-800 dark:text-white">Signing in with Google...</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Opening candidate dashboard...
                </p>
              </div>
            ) : showCustomGoogleInput ? (
              /* Custom Gmail Entry Form */
              <form onSubmit={handleCustomGoogleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kishore Kumar"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gmail / Google Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                  >
                    Sign In with Gmail →
                  </button>
                </div>
              </form>
            ) : (
              /* Clean Google Accounts List (NO INNER SCROLLBAR) */
              <div className="mt-5">
                <div className="divide-y divide-slate-100 dark:divide-navy-800 border-y border-slate-100 dark:border-navy-800">
                  {getDeviceAccounts().map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full py-3 px-2 flex items-center gap-3.5 hover:bg-slate-100/80 dark:hover:bg-navy-800 transition rounded-xl text-left cursor-pointer group"
                    >
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-navy-700 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full ${acc.bg || 'bg-blue-600'} text-white flex items-center justify-center font-medium text-sm shrink-0 shadow-sm`}>
                          {acc.initial || acc.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Use another account */}
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full mt-2 py-3 px-2 flex items-center gap-3.5 hover:bg-slate-100/80 dark:hover:bg-navy-800 transition rounded-xl text-left cursor-pointer text-slate-700 dark:text-slate-300 group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-navy-700 group-hover:text-blue-600 transition">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Use another account
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Google Chooser Footer Disclaimer */}
            <p className="mt-5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              To continue, Google will share your name, email address, language preference, and profile picture with The Revival International.
            </p>
          </div>
        </div>
      )}

      </div>
  );
};

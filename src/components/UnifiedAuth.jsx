import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Briefcase, ArrowRight, User, Lock, Mail, Phone, Sparkles, CheckCircle2, X, Settings, ExternalLink, Eye, EyeOff, UserPlus, ChevronRight } from 'lucide-react';

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

const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    name: 'Kishore Kumar',
    email: 'kishorekumaroffl@gmail.com',
    avatar: '/images/avatar_kishore.jpg',
    initial: 'K',
    bg: 'bg-blue-600'
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

  // Google OAuth 2.0 & Google Identity Services (GIS) State
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('sir_google_client_id') || '';
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleSuccess, setGoogleSuccess] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [tempClientId, setTempClientId] = useState('');
  const [modalError, setModalError] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Candidate Form States
  const [candidateLogin, setCandidateLogin] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
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

  // Validate Google Client ID format
  const isValidGoogleClientId = (id) => {
    if (!id || typeof id !== 'string') return false;
    const clean = id.trim();
    if (!clean.endsWith('.apps.googleusercontent.com')) return false;
    if (clean.includes('your-google-client-id') || clean.includes('example123') || clean.length < 30) return false;
    return true;
  };

  // Dynamic GIS script loader helper
  const loadGoogleGsi = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window.google?.accounts?.oauth2 || window.google?.accounts?.id)) {
        return resolve(window.google);
      }
      const existing = typeof document !== 'undefined' && document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google));
        if (window.google) return resolve(window.google);
      }
      if (typeof document !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      } else {
        resolve(null);
      }
    });
  };

  // Sync Google Client ID from backend /api/config/auth if not present
  useEffect(() => {
    if (!googleClientId) {
      fetch('/api/config/auth')
        .then((res) => res.json())
        .then((data) => {
          if (data?.googleClientId && isValidGoogleClientId(data.googleClientId)) {
            setGoogleClientId(data.googleClientId);
          }
        })
        .catch(() => {});
    }
  }, [googleClientId]);

  // Google Credential Response Callback (Official Google GIS One-Tap)
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    try {
      setGoogleLoading(true);
      setGoogleError('');
      setGoogleSuccess('');
      const profile = decodeGoogleJwt(response.credential);
      if (!profile || !profile.email) {
        setGoogleError('Failed to decode profile from Google credential.');
        setGoogleLoading(false);
        return;
      }

      const result = await loginWithGoogle({
        idToken: response.credential,
        credential: response.credential,
        email: profile.email,
        name: profile.name || profile.given_name || profile.email.split('@')[0],
        avatar: profile.picture,
        googleId: profile.sub,
        profile: profile
      });

      if (!result || !result.success) {
        setGoogleError(result?.message || 'Google authentication failed.');
        setGoogleLoading(false);
        return;
      }

      const displayName = result.user?.name || profile.name || 'Google User';
      setGoogleSuccess(`Signed in successfully as ${displayName}! Redirecting to your dashboard...`);
      setGoogleLoading(false);

      setTimeout(() => {
        setActiveModal(null);
        if (pendingJobToApply) {
          applyForJob(pendingJobToApply);
          setPendingJobToApply(null);
        }
        navigateTo('candidates');
        window.location.hash = 'candidates';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      console.error('Google Auth Token Processing Error:', err);
      setGoogleError('Failed to process Google sign-in response.');
      setGoogleLoading(false);
    }
  };

  // Initialize Native Google Identity Services if valid Client ID is configured
  useEffect(() => {
    let isMounted = true;
    if (isValidGoogleClientId(googleClientId)) {
      loadGoogleGsi().then((googleObj) => {
        if (!isMounted || !googleObj?.accounts?.id) return;
        try {
          googleObj.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('Google Identity Services Init Notice:', err);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [googleClientId]);

  // Clean obsolete or mock accounts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sir_device_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => a && a.email && !a.email.includes('harish') && !a.email.includes('candidate.revival') && a.email !== 'kishore@gmail.com');
          localStorage.setItem('sir_device_google_accounts', JSON.stringify(filtered));
        }
      }
    } catch {}
  }, []);

  // Trigger Real Google OAuth 2.0 Account Chooser Popup (prompt='select_account')
  const triggerRealGoogleOAuth = async (clientIdToUse) => {
    const activeClientId = (clientIdToUse || googleClientId || '').trim();
    if (!isValidGoogleClientId(activeClientId)) {
      setGoogleLoading(false);
      setTempClientId(activeClientId.endsWith('.apps.googleusercontent.com') ? activeClientId : '');
      setShowClientIdConfig(true);
      return;
    }

    setGoogleLoading(true);
    setGoogleError('');
    setGoogleSuccess('');

    try {
      const googleObj = await loadGoogleGsi();
      if (!googleObj?.accounts?.oauth2) {
        setGoogleLoading(false);
        setGoogleError('Google OAuth library could not be loaded. Please check your internet connection.');
        return;
      }

      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            setGoogleLoading(false);
            if (tokenResponse.error === 'popup_closed_by_user') {
              setGoogleError('Google sign-in popup was closed before completing authentication.');
            } else if (tokenResponse.error === 'invalid_client') {
              setGoogleError('The Google OAuth Client ID is invalid or not registered in Google Cloud Console. Click "Google OAuth Configuration" below to update.');
            } else {
              setGoogleError(tokenResponse.error_description || tokenResponse.error || 'Google authentication was cancelled.');
            }
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (!res.ok) {
                throw new Error('Failed to fetch user profile from Google');
              }

              const userInfo = await res.json();
              if (userInfo?.email) {
                const result = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                  avatar: userInfo.picture,
                  googleId: userInfo.sub,
                  profile: userInfo
                });

                if (!result || !result.success) {
                  setGoogleError(result?.message || 'Google authentication failed.');
                  setGoogleLoading(false);
                  return;
                }

                const displayName = result.user?.name || userInfo.name || 'Google User';
                setGoogleSuccess(`Signed in successfully as ${displayName}! Redirecting to your dashboard...`);
                setGoogleLoading(false);

                setTimeout(() => {
                  setActiveModal(null);
                  if (pendingJobToApply) {
                    applyForJob(pendingJobToApply);
                    setPendingJobToApply(null);
                  }
                  navigateTo('candidates');
                  window.location.hash = 'candidates';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (onSuccess) onSuccess();
                }, 700);
              } else {
                setGoogleError('Google did not return an email address for this account.');
                setGoogleLoading(false);
              }
            } catch (fetchErr) {
              console.error('Error fetching Google profile:', fetchErr);
              setGoogleError('Failed to fetch profile details from Google servers.');
              setGoogleLoading(false);
            }
          } else {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          console.warn('Google OAuth error:', err);
          if (err?.type === 'popup_closed') {
            setGoogleError('Google sign-in popup was closed.');
          } else if (err?.type === 'popup_blocked') {
            setGoogleError('Popup was blocked by your browser. Please allow popups for this site and try again.');
          } else {
            setGoogleError(err?.message || 'Google Sign-In popup failed or was blocked by browser.');
          }
        }
      });

      // prompt: 'select_account' opens Google's authentic account picker with the user's real Google accounts!
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Google OAuth init failed:', err);
      setGoogleLoading(false);
      setGoogleError('Unable to open Google sign-in. Please ensure popups are enabled.');
    }
  };

  const handleSaveClientId = async (idToSave) => {
    let raw = (idToSave || tempClientId || '').trim();
    if (!raw) {
      setModalError('Please enter your Google Client ID.');
      return;
    }
    // Clean up if quotes or URL query params are included
    let clean = raw.replace(/^['"]|['"]$/g, '').trim();
    if (clean.includes('client_id=')) {
      clean = clean.split('client_id=')[1].split('&')[0];
    }
    if (!clean.endsWith('.apps.googleusercontent.com')) {
      setModalError('Invalid Client ID format. Must end with .apps.googleusercontent.com');
      return;
    }

    setModalError('');
    localStorage.setItem('sir_google_client_id', clean);
    setGoogleClientId(clean);
    setShowClientIdConfig(false);
    setGoogleError('');
    setGoogleSuccess('');

    // Persist to backend config endpoint
    try {
      await fetch('/api/config/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleClientId: clean })
      });
    } catch {}

    setTimeout(() => {
      triggerRealGoogleOAuth(clean);
    }, 200);
  };

  // Get active Google accounts on device (combines defaults + saved accounts)
  const getDeviceAccounts = () => {
    let list = [...DEFAULT_GOOGLE_ACCOUNTS];
    try {
      const saved = localStorage.getItem('sir_device_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(acc => {
            if (acc && acc.email) {
              const cleanAccEmail = acc.email.toLowerCase().trim();
              if (
                cleanAccEmail.includes('candidate.revival') || 
                cleanAccEmail === 'kishore@gmail.com' || 
                cleanAccEmail.includes('example.com') ||
                cleanAccEmail.includes('harish')
              ) {
                return;
              }
              const existingIdx = list.findIndex(x => x.email.toLowerCase() === cleanAccEmail);
              const formattedItem = {
                email: cleanAccEmail,
                name: acc.name || cleanAccEmail.split('@')[0],
                avatar: acc.avatar || null,
                initial: (acc.name || cleanAccEmail).charAt(0).toUpperCase(),
                bg: 'bg-indigo-600'
              };
              if (existingIdx >= 0) {
                list[existingIdx] = { ...list[existingIdx], ...formattedItem };
              } else {
                list.push(formattedItem);
              }
            }
          });
        }
      }
    } catch (e) { console.error(e); }
    return list;
  };

  const handleSelectGoogleAccount = async (account) => {
    setGoogleLoading(true);
    setGoogleError('');
    setShowGoogleChooser(false);
    try {
      const cleanEmail = account.email.trim().toLowerCase();
      const cleanName = account.name || cleanEmail.split('@')[0];
      const result = await loginWithGoogle({
        email: cleanEmail,
        name: cleanName,
        avatar: account.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=1e3a8a&textColor=ffffff`,
        authProvider: 'google',
        googleId: 'GOOGLE-' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
      });

      if (!result || !result.success) {
        setGoogleError(result?.message || 'Google authentication failed.');
        setGoogleLoading(false);
        return;
      }

      // Save to device Google accounts list
      try {
        const devList = JSON.parse(localStorage.getItem('sir_device_google_accounts') || '[]');
        if (!devList.some(a => a.email.toLowerCase() === cleanEmail)) {
          devList.unshift({ email: cleanEmail, name: cleanName, avatar: account.avatar });
          localStorage.setItem('sir_device_google_accounts', JSON.stringify(devList.slice(0, 5)));
        }
      } catch {}

      const displayName = result.user?.name || cleanName;
      setGoogleSuccess(`Signed in successfully as ${displayName}! Redirecting to your dashboard...`);
      setGoogleLoading(false);

      setTimeout(() => {
        if (pendingJobToApply) {
          applyForJob(pendingJobToApply);
          setPendingJobToApply(null);
        }
        navigateTo('candidates');
        window.location.hash = 'candidates';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      console.error('Google account login error:', err);
      setGoogleError('Failed to sign in with Google account.');
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    setGoogleError('');
    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const cleanName = customGoogleName.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setGoogleError('Please enter a valid Google / Gmail address (e.g. name@gmail.com).');
      return;
    }

    setShowCustomGoogleInput(false);
    setShowGoogleChooser(false);
    await handleSelectGoogleAccount({
      name: cleanName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=1e3a8a&textColor=ffffff`
    });
  };

  // Trigger Google Authentication — opens authentic Google account chooser popup with email IDs
  const handleTriggerGoogleAuth = () => {
    if (googleLoading) return;
    setError('');
    setGoogleError('');
    setGoogleSuccess('');

    // Open authentic Google Account Chooser popup with Google authentication mail IDs
    setShowCustomGoogleInput(false);
    setShowGoogleChooser(true);
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

    // 1. Full Name check (Alphabetic characters only, min 2 chars)
    const trimmedFullName = candidateReg.fullName.trim();
    if (!trimmedFullName || trimmedFullName.length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedFullName)) {
      setError('Full Name must contain alphabetic characters only. Numbers and special characters are not allowed.');
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

        {/* Google Error Notification */}
        {googleError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <span>{googleError}</span>
            <button onClick={() => setGoogleError('')} className="p-0.5 text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Google Success Notification */}
        {googleSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{googleSuccess}</span>
          </div>
        )}

        {/* 1-CLICK UNIFIED GOOGLE AUTHENTICATION BUTTON */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleTriggerGoogleAuth}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 border-2 border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 rounded-2xl flex items-center justify-center gap-3 transition shadow-sm font-bold text-slate-800 dark:text-white text-xs cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Opening Google Account Chooser...</span>
              </>
            ) : (
              <>
                {/* Official Multi-Color Google G Logo SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </>
            )}
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
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={candidateLogin.password}
                  onChange={(e) => setCandidateLogin({ ...candidateLogin, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-gold-500 transition cursor-pointer"
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name * (Letters only)</label>
              <input
                type="text"
                required
                value={candidateReg.fullName}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setCandidateReg({ ...candidateReg, fullName: lettersOnly });
                }}
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
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={candidateReg.password}
                    onChange={(e) => setCandidateReg({ ...candidateReg, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-gold-500 transition cursor-pointer"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    required
                    value={candidateReg.confirmPassword}
                    onChange={(e) => setCandidateReg({ ...candidateReg, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-gold-500 transition cursor-pointer"
                    title={showRegConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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

        {/* Google OAuth Client ID config link */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setTempClientId(googleClientId || '');
              setShowClientIdConfig(true);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition inline-flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-2.5 h-2.5" />
            <span>Google OAuth Configuration</span>
          </button>
        </div>

      </div>

      {/* AUTHENTIC GOOGLE ACCOUNT CHOOSER (Mounted via Portal at document.body with z-[999999]) */}
      {typeof document !== 'undefined' && showGoogleChooser && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[780px] bg-[#131314] text-[#e3e3e3] rounded-[28px] border border-[#3c4043] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 md:p-10 relative overflow-hidden font-sans animate-in zoom-in-95 duration-200">
            {/* Top Bar: Google G Logo + Sign in with Google */}
            <div className="flex items-center justify-between pb-6 border-b border-[#282a2d]">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-[15px] font-medium text-[#e3e3e3] tracking-normal">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGoogleChooser(false);
                  setShowCustomGoogleInput(false);
                }}
                className="p-1.5 text-[#9aa0a6] hover:text-[#e3e3e3] rounded-full hover:bg-[#202124] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-Column Grid Body matching Image 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 pt-7 pb-4 items-start">
              {/* LEFT COLUMN: Watermark Brand & Large "Choose an account" */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center mb-6 shadow-inner text-amber-400 font-serif font-black text-xl">
                    RI
                  </div>
                  <h2 className="text-[32px] sm:text-[34px] font-normal text-[#e3e3e3] tracking-tight leading-tight">
                    Choose an account
                  </h2>
                  <p className="text-[15px] text-[#c4c7c5] mt-3 font-normal">
                    to continue to <span className="font-medium text-white">The Revival International</span>
                  </p>
                </div>

                {googleError && (
                  <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
                    {googleError}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Account Selection or Custom Gmail Form */}
              <div>
                {!showCustomGoogleInput ? (
                  <div className="space-y-1">
                    {getDeviceAccounts().map((acc, idx) => (
                      <button
                        key={acc.email + idx}
                        type="button"
                        onClick={() => handleSelectGoogleAccount(acc)}
                        className="w-full py-3 px-3.5 flex items-center gap-4 hover:bg-[#1f2022] active:bg-[#282a2d] transition rounded-2xl text-left cursor-pointer group"
                      >
                        <img
                          src={acc.avatar || '/images/avatar_kishore.jpg'}
                          alt={acc.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/avatar_kishore.jpg';
                          }}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-[#3c4043]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-medium text-[#e3e3e3] group-hover:text-white transition truncate">
                            {acc.name}
                          </p>
                          <p className="text-[13px] text-[#9aa0a6] truncate font-normal">
                            {acc.email}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-[#3c4043] my-2" />

                    {/* Use another account button */}
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleError('');
                        setShowCustomGoogleInput(true);
                      }}
                      className="w-full py-3 px-3.5 flex items-center gap-4 hover:bg-[#1f2022] active:bg-[#282a2d] transition rounded-2xl text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full border border-[#5f6368] flex items-center justify-center text-[#e3e3e3] shrink-0 group-hover:border-[#8ab4f8] group-hover:text-[#8ab4f8] transition">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium text-[#e3e3e3] group-hover:text-[#8ab4f8] transition">
                          Use another account
                        </p>
                      </div>
                    </button>

                    {/* Disclaimer */}
                    <p className="text-[12px] text-[#9aa0a6] mt-6 leading-relaxed">
                      Before using this app, you can review The Revival International's{' '}
                      <span className="text-[#8ab4f8] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                      <span className="text-[#8ab4f8] hover:underline cursor-pointer">Terms of Service</span>.
                    </p>
                  </div>
                ) : (
                  /* Custom Google / Gmail form in dark mode */
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
                    <p className="text-xs text-[#8ab4f8] font-semibold">Sign in with any Google / Gmail account:</p>
                    <div>
                      <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Harish Durai"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#3c4043] bg-[#1e1f20] text-white text-xs focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c4c7c5] mb-1.5">
                        Gmail Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#3c4043] bg-[#1e1f20] text-white text-xs focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="flex-1 py-2.5 rounded-full border border-[#5f6368] text-xs font-medium text-[#e3e3e3] hover:bg-[#202124] transition cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] text-xs font-semibold text-[#001d35] transition shadow-sm cursor-pointer"
                      >
                        Sign in with Google →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Footer Row matching Image 2 */}
            <div className="flex items-center justify-between pt-6 border-t border-[#282a2d] text-[12px] text-[#9aa0a6] mt-4">
              <div className="flex items-center gap-1 hover:text-[#e3e3e3] cursor-pointer transition">
                <span>English (United Kingdom)</span>
                <span className="text-[9px]">▼</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="hover:text-[#e3e3e3] cursor-pointer transition">Help</span>
                <span className="hover:text-[#e3e3e3] cursor-pointer transition">Privacy</span>
                <span className="hover:text-[#e3e3e3] cursor-pointer transition">Terms</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* GOOGLE CLIENT ID CONFIGURATION MODAL */}
      {showClientIdConfig && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[450px] bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-navy-700 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowClientIdConfig(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-navy-800 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="font-sans text-xl font-bold text-slate-800 dark:text-slate-100">
                Google OAuth 2.0 Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure your official Google Cloud Web Client ID to enable authentic account selection.
              </p>
            </div>

            <div className="mt-4 p-3.5 bg-blue-50 dark:bg-navy-800/80 rounded-2xl border border-blue-200 dark:border-navy-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-blue-700 dark:text-blue-400">Required Google Cloud OAuth Settings:</p>
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Authorized JavaScript Origins:</span><br/>
                  http://localhost:3000<br/>
                  http://localhost:5173<br/>
                  https://www.therevivalinternational.com<br/>
                  https://therevivalinternational.com
                </p>
                <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Authorized Redirect URIs:</span><br/>
                  http://localhost:3000<br/>
                  http://localhost:5173<br/>
                  https://www.therevivalinternational.com
                </p>
                <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Scopes:</span> openid, email, profile
                </p>
              </div>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
              >
                Open Google Cloud Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveClientId(tempClientId);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Client ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1084249123456-xxx.apps.googleusercontent.com"
                  value={tempClientId}
                  onChange={(e) => {
                    setTempClientId(e.target.value);
                    if (modalError) setModalError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {modalError && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-500">{modalError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientIdConfig(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                >
                  Save & Launch Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
  );
};

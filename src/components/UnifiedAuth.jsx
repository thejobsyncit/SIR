import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Briefcase, ArrowRight, User, Lock, Mail, Phone, Sparkles, CheckCircle2, X, Settings, ExternalLink, Eye, EyeOff, UserPlus, ChevronRight, AlertCircle, LogIn, ShieldCheck, RefreshCw } from 'lucide-react';
import { validateCandidateEmail } from '../utils/emailValidation';

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

export const UnifiedAuth = ({ defaultMode = 'login', defaultRole = 'candidate', onSuccess, onClose }) => {
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
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('sir_google_client_id') || '667233488295-vi442pug1eqttt418c8sbfnksbf3qc20.apps.googleusercontent.com';
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleSuccess, setGoogleSuccess] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [tempClientId, setTempClientId] = useState('');
  const [modalError, setModalError] = useState('');

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
    resumeName: '',
    consentAgreed: false
  });

  // Candidate Registration OTP Verification Flow
  const [regStep, setRegStep] = useState('form'); // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [emailDuplicate, setEmailDuplicate] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // OTP Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Debounced duplicate email check on typing
  useEffect(() => {
    if (authMode !== 'register' || regStep !== 'form') return;
    const clean = (candidateReg.email || '').trim().toLowerCase();
    if (!clean || clean.length < 5 || !clean.includes('@') || !clean.includes('.')) {
      setEmailDuplicate(false);
      return;
    }
    const emailCheck = validateCandidateEmail(clean);
    if (!emailCheck.isValid) {
      setEmailDuplicate(false);
      return;
    }

    const timer = setTimeout(() => {
      checkDuplicateCandidate('email', clean);
    }, 500);

    return () => clearTimeout(timer);
  }, [candidateReg.email, authMode, regStep]);

  // Reset error when switching states
  const handleModeSwitch = (newMode) => {
    setAuthMode(newMode);
    setRegStep('form');
    setError('');
    setGoogleError('');
    setOtpError('');
    setOtpSuccess('');
    setEmailDuplicate(false);
  };

  // Reset errors and purge stale local cache when entering register mode
  useEffect(() => {
    setError('');
    setGoogleError('');
    try {
      const sessStr = localStorage.getItem('sir_user_session');
      const sess = sessStr ? JSON.parse(sessStr) : null;
      if (!sess || !sess.email) {
        localStorage.removeItem('sir_candidates_db');
      }
    } catch {}
  }, [authMode]);

  // Strict Enterprise Email Validation (Disallowing fake/disposable/dummy addresses - Bug #12)
  const isValidEmail = (emailStr) => {
    return validateCandidateEmail(emailStr).isValid;
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

  // Sync Google Client ID from backend /api/config/auth
  useEffect(() => {
    fetch('/api/config/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data?.googleClientId && isValidGoogleClientId(data.googleClientId)) {
          setGoogleClientId(data.googleClientId);
          try {
            localStorage.setItem('sir_google_client_id', data.googleClientId);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Google Credential Response Callback (Official Google GIS One-Tap)
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    try {
      setGoogleLoading(true);
      setGoogleError('');
      setGoogleSuccess('');
      setError('');
      const profile = decodeGoogleJwt(response.credential);
      if (!profile || !profile.email) {
        setGoogleError('Failed to decode profile from Google credential.');
        setGoogleLoading(false);
        return;
      }

      const cleanGoogleEmail = (profile.email || '').toLowerCase().trim();

      const result = await loginWithGoogle({
        idToken: response.credential,
        credential: response.credential,
        email: profile.email,
        name: profile.name || profile.given_name || profile.email.split('@')[0],
        avatar: profile.picture,
        googleId: profile.sub,
        profile: profile,
        mode: authMode
      });

      if (!result || !result.success) {
        if (result?.code === 'DUPLICATE_EMAIL' || result?.message?.includes('already exists')) {
          setError(result?.message || 'An account with this email address or phone number already exists. Please sign in to your existing account.');
          setGoogleError('');
        } else {
          setGoogleError(result?.message || 'Google authentication failed.');
        }
        setGoogleLoading(false);
        return;
      }

      const displayName = result.user?.name || profile.name || 'Google User';
      setGoogleSuccess(`Signed in successfully as ${displayName}! Redirecting to your dashboard...`);
      setGoogleLoading(false);

      setTimeout(() => {
        setActiveModal(null);
        if (pendingJobToApply) {
          navigateTo('jobs');
          window.location.hash = 'jobs';
        } else {
          navigateTo('candidates');
          window.location.hash = 'candidates';
        }
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
            const isNonStandardPort = typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port && window.location.port !== '3000' && window.location.port !== '5173';
            if (tokenResponse.error === 'popup_closed_by_user') {
              if (isNonStandardPort) {
                setGoogleError(`Google OAuth origin is authorized for port 3000. You are currently on port ${window.location.port}. Please open http://localhost:3000 or use the email form below.`);
              } else {
                setGoogleError('Google sign-in popup was closed before completing authentication.');
              }
            } else if (tokenResponse.error === 'invalid_client') {
              setGoogleError('The Google OAuth Client ID is invalid or not registered in Google Cloud Console. Click "Google OAuth Configuration" below to update.');
            } else {
              setGoogleError(tokenResponse.error_description || tokenResponse.error || 'Google authentication was cancelled.');
            }
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              let userInfo = null;
              const hintEmail = (candidateLogin.email || candidateReg.email || '').trim().toLowerCase();

              // Tier 1: Direct Google v3 UserInfo endpoint
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (res.ok) {
                  userInfo = await res.json();
                }
              } catch (e1) {
                console.warn('Direct Google v3 userinfo notice:', e1.message);
              }

              // Tier 2: Direct Google v2 UserInfo endpoint
              if (!userInfo || !userInfo.email) {
                try {
                  const res2 = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  if (res2.ok) {
                    userInfo = await res2.json();
                  }
                } catch (e2) {
                  console.warn('Direct Google v2 userinfo notice:', e2.message);
                }
              }

              // Tier 3: Server-Side Proxy (/api/auth/google/userinfo) - bypasses browser extensions, CORS & network shields
              if (!userInfo || !userInfo.email) {
                try {
                  const pRes = await fetch('/api/auth/google/userinfo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      accessToken: tokenResponse.access_token,
                      hintEmail: hintEmail || undefined
                    })
                  });
                  if (pRes.ok) {
                    const pData = await pRes.json();
                    if (pData?.success && pData?.user) {
                      userInfo = pData.user;
                    }
                  }
                } catch (e3) {
                  console.warn('Server proxy userinfo notice:', e3.message);
                }
              }

              // Tier 4: Fallback to existing typed or remembered Google email
              if (!userInfo || !userInfo.email) {
                if (hintEmail && hintEmail.includes('@')) {
                  userInfo = {
                    email: hintEmail,
                    name: hintEmail.split('@')[0],
                    picture: '',
                    sub: ''
                  };
                }
              }

              if (userInfo?.email) {
                const cleanGoogleEmail = (userInfo.email || '').toLowerCase().trim();

                const result = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                  avatar: userInfo.picture,
                  googleId: userInfo.sub,
                  profile: userInfo,
                  mode: authMode
                });

                if (!result || !result.success) {
                  if (result?.code === 'DUPLICATE_EMAIL' || result?.message?.includes('already exists')) {
                    setError(result?.message || 'An account with this email address or phone number already exists. Please sign in to your existing account.');
                    setGoogleError('');
                  } else {
                    setGoogleError(result?.message || 'Google authentication failed.');
                  }
                  setGoogleLoading(false);
                  return;
                }

                const displayName = result.user?.name || userInfo.name || 'Google User';
                setGoogleSuccess(`Signed in successfully as ${displayName}! Redirecting to your dashboard...`);
                setGoogleLoading(false);

                setTimeout(() => {
                  setActiveModal(null);
                  if (pendingJobToApply) {
                    navigateTo('jobs');
                    window.location.hash = 'jobs';
                  } else {
                    navigateTo('candidates');
                    window.location.hash = 'candidates';
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (onSuccess) onSuccess();
                }, 700);
              } else {
                setGoogleError('Google did not return an email address for this account.');
                setGoogleLoading(false);
              }
            } catch (fetchErr) {
              console.error('Error fetching Google profile:', fetchErr);
              setGoogleError('Google sign-in could not retrieve profile. Please sign in using your email.');
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

  // Trigger Official Google OAuth 2.0 Flow (accounts.google.com)
  const handleTriggerGoogleAuth = () => {
    if (googleLoading) return;
    setError('');
    setGoogleError('');
    setGoogleSuccess('');

    const activeId = (googleClientId || localStorage.getItem('sir_google_client_id') || '').trim();
    if (isValidGoogleClientId(activeId)) {
      triggerRealGoogleOAuth(activeId);
      return;
    }

    setTempClientId('');
    setShowClientIdConfig(true);
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

    const result = await loginCandidate(cleanEmail, candidateLogin.password);
    if (!result || !result.success) {
      setError(result?.message || 'Invalid credentials. Please register if you do not have an account.');
      return;
    }

    if (pendingJobToApply) {
      navigateTo('jobs');
      window.location.hash = 'jobs';
    } else {
      navigateTo('candidates');
      window.location.hash = 'candidates';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Check if email or phone is already registered (Strict 1-Time Registration)
  const checkDuplicateCandidate = async (field, val) => {
    if (!val) return;
    try {
      setCheckingDuplicate(true);
      const payload = field === 'email' ? { email: val } : { phone: val };
      const res = await fetch('/api/candidate/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 409) {
        const data = await res.json();
        const msg = data.message || 'An account with this email address or phone number already exists. Please sign in to your existing account.';
        setError(msg);
        if (field === 'email') setEmailDuplicate(true);
      } else {
        if (field === 'email') setEmailDuplicate(false);
        setError(prev => (prev && prev.includes('already exists')) ? '' : prev);
      }
    } catch (_) {
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Submit Candidate Registration - Initiates Email Verification Code Dispatch
  const handleCandidateRegSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Full Name check (Alphabetic characters only, min 2 chars, max 50 chars)
    const trimmedFullName = candidateReg.fullName.trim();
    if (!trimmedFullName || trimmedFullName.length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (trimmedFullName.length > 50) {
      setError('Full Name cannot exceed 50 characters.');
      return;
    }
    if (!/^[a-zA-Z\s\.\'-]+$/.test(trimmedFullName)) {
      setError('Full Name must contain alphabetic characters only. Numbers and special characters are not allowed.');
      return;
    }

    // 2. Strict Email check (Valid format, max 80 chars)
    const cleanEmail = candidateReg.email.trim().toLowerCase();
    if (cleanEmail.length > 80) {
      setError('Email address cannot exceed 80 characters.');
      return;
    }
    const emailCheck = validateCandidateEmail(cleanEmail);
    if (!emailCheck.isValid) {
      setError(emailCheck.message);
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

    // 4. Password validation (Minimum 8 chars with complexity)
    if (!candidateReg.password || candidateReg.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    const hasUpper = /[A-Z]/.test(candidateReg.password);
    const hasLower = /[a-z]/.test(candidateReg.password);
    const hasDigit = /\d/.test(candidateReg.password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(candidateReg.password);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    if (candidateReg.password !== candidateReg.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // 5. Consent validation (UAE PDPL / India DPDP Act)
    if (!candidateReg.consentAgreed) {
      setError('You must provide mandatory consent under the Privacy Policy & Candidate Consent Notice.');
      return;
    }

    // 6. Pre-flight check: ensure email or phone not already registered
    try {
      const checkRes = await fetch('/api/candidate/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, phone: `${candidateReg.countryCode || '+91'} ${digitsOnly}` })
      });
      if (checkRes.status === 409) {
        const checkData = await checkRes.json();
        setError(checkData.message || 'An account with this email address or phone number already exists. Please sign in to your existing account.');
        setEmailDuplicate(true);
        return;
      }
    } catch (_) {}

    // 7. Dispatch Email Verification OTP
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: trimmedFullName,
          role: 'candidate'
        })
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok || !otpData.success) {
        setError(otpData.message || 'Failed to dispatch verification code. Please check your email and try again.');
        setOtpLoading(false);
        return;
      }

      setOtpToken(otpData.token || '');
      setDevOtpHint(otpData.devOtp || '');
      setOtpCooldown(60);
      setRegStep('otp');
      setOtpCode('');
      setOtpLoading(false);
    } catch (err) {
      console.error('OTP send failed:', err);
      setError('Unable to send verification code. Please check your connection and try again.');
      setOtpLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (otpCooldown > 0 || otpLoading) return;
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const cleanEmail = candidateReg.email.trim().toLowerCase();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: candidateReg.fullName.trim(),
          role: 'candidate'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || 'Failed to resend code. Please wait a moment.');
        setOtpLoading(false);
        return;
      }

      setOtpToken(data.token || '');
      setDevOtpHint(data.devOtp || '');
      setOtpCooldown(60);
      setOtpSuccess(`A fresh verification code has been dispatched to ${cleanEmail}`);
      setTimeout(() => setOtpSuccess(''), 4000);
      setOtpLoading(false);
    } catch (err) {
      setOtpError('Failed to resend verification code. Please check your network.');
      setOtpLoading(false);
    }
  };

  // Verify OTP and Complete Registration -> Automatically Opens Dashboard
  const handleVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = (otpCode || '').trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      setOtpError('Please enter the complete 4-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const cleanEmail = candidateReg.email.trim().toLowerCase();
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          token: otpToken
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setOtpError(verifyData.message || 'Invalid or expired verification code. Please check and try again.');
        setOtpLoading(false);
        return;
      }

      setOtpSuccess('Email verified! Activating your candidate account and opening dashboard...');

      const digitsOnly = candidateReg.phone.replace(/\D/g, '');
      const result = await registerCandidate({
        fullName: candidateReg.fullName.trim(),
        email: cleanEmail,
        password: candidateReg.password,
        phone: `${candidateReg.countryCode || '+91'} ${digitsOnly}`,
        preferredCountry: candidateReg.preferredCountry,
        industry: candidateReg.industry,
        resumeName: candidateReg.resumeName || 'Uploaded_CV.pdf',
        consentGivenAt: new Date().toISOString(),
        consentVersion: 'v2.0-nov2026'
      });

      if (!result || !result.success) {
        setOtpError(result?.message || 'Registration failed. Please try again.');
        setOtpLoading(false);
        return;
      }

      setTimeout(() => {
        setActiveModal(null);
        if (pendingJobToApply) {
          navigateTo('jobs');
          window.location.hash = 'jobs';
        } else {
          navigateTo('candidates');
          window.location.hash = 'candidates';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      console.error('OTP verification error:', err);
      setOtpError('Network error while verifying code. Please check your connection.');
      setOtpLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative bg-white dark:bg-navy-950 rounded-2xl p-3.5 sm:p-5 shadow-2xl border border-slate-200 dark:border-gold-500/30 overflow-hidden">
        
        {/* Modal Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition z-10 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Revival Branding Header */}
        <div className="flex flex-col items-center text-center mb-2">
          <BrandLogoIcon className="w-8 h-8 sm:w-9 sm:h-9 shadow-luxury mb-1" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {authMode === 'login' 
              ? 'Sign In to Your Account' 
              : regStep === 'otp'
                ? 'Verify Your Email Address'
                : 'Create Your Candidate Account'}
          </h2>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            {authMode === 'login' 
              ? 'Access your Candidate Portal to track job applications and interview updates.'
              : regStep === 'otp'
                ? 'Enter the 4-digit code sent to your email to activate your account.'
                : 'Register with verified credentials to apply for international vacancies.'}
          </p>
        </div>

        {/* Position Application Banner (if gated from Apply Now) */}
        {pendingJobToApply && (
          <div className="mb-2 p-2 bg-gold-500/10 border border-gold-500/40 rounded-xl flex items-start gap-2 text-left text-xs">
            <div className="p-1 rounded-lg bg-gold-500/20 text-gold-500 font-bold shrink-0 mt-0.5">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5 leading-tight">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Position Application</span>
              <h4 className="font-serif text-xs font-bold text-navy-900 dark:text-white">
                {pendingJobToApply.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {pendingJobToApply.company} • {pendingJobToApply.location} ({pendingJobToApply.country})
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-slate-900 dark:text-slate-100 text-xs shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-amber-950 dark:text-amber-100 font-bold text-xs leading-snug">
                    {error}
                  </p>
                  {(error.includes('already exists') || error.includes('sign in')) && authMode === 'register' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('login')}
                      className="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 underline hover:text-amber-950 dark:hover:text-amber-100 text-[11px] cursor-pointer mt-0.5 transition"
                    >
                      <span>Sign In to your existing account</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Google Error Notification */}
        {googleError && (
          <div className="mb-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <span className="text-[11px]">{googleError}</span>
            <button type="button" onClick={() => setGoogleError('')} className="p-0.5 text-rose-500 hover:text-rose-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Google Success Notification */}
        {googleSuccess && (
          <div className="mb-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>{googleSuccess}</span>
          </div>
        )}

        {/* 1-CLICK UNIFIED GOOGLE AUTHENTICATION BUTTON */}
        {regStep !== 'otp' && (
          <div className="mb-2">
            <button
              type="button"
              onClick={handleTriggerGoogleAuth}
              disabled={googleLoading}
              className="w-full py-2 px-3 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 border-2 border-slate-300 dark:border-navy-600 hover:border-slate-400 rounded-xl flex items-center justify-center gap-2 transition shadow-xs font-bold text-slate-900 dark:text-white text-xs cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-xs font-semibold">Opening Google Chooser...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-xs font-bold">{authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                </>
              )}
            </button>

            <div className="relative text-center my-1.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-navy-800" />
              </div>
              <span className="relative bg-white dark:bg-navy-950 px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Or continue with email
              </span>
            </div>
          </div>
        )}

        {/* CANDIDATE AUTH FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleCandidateLoginSubmit} className="space-y-2.5 text-xs">
            <div>
              <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-1">
                Email Address <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={candidateLogin.email}
                  onChange={(e) => setCandidateLogin({ ...candidateLogin, email: e.target.value })}
                  placeholder="candidate@gmail.com"
                  className="w-full pl-8 pr-2.5 py-1.5 sm:py-2 text-xs bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-1">
                Password <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={candidateLogin.password}
                  onChange={(e) => setCandidateLogin({ ...candidateLogin, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-1.5 sm:py-2 text-xs bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-gold-500 transition cursor-pointer"
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm font-sans tracking-wide cursor-pointer mt-1"
            >
              <span>Sign In to Candidate Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : regStep === 'otp' ? (
          <div className="py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-3">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                We sent a 4-digit verification code to
              </p>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs font-bold text-slate-900 dark:text-gold-400 max-w-full truncate">
                <Mail className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span className="truncate">{candidateReg.email.trim().toLowerCase()}</span>
              </div>
            </div>

            {otpError && (
              <div className="mb-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-semibold">{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="mb-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-semibold">{otpSuccess}</span>
              </div>
            )}

            {devOtpHint && (
              <div className="mb-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-[11px] text-center font-mono font-bold">
                Verification Code: <span className="underline tracking-widest">{devOtpHint}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-3">
              <div>
                <label className="block text-center text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Enter 4-Digit Code
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setOtpCode(val);
                      if (otpError) setOtpError('');
                    }}
                    placeholder="••••"
                    className="w-44 py-2 text-center text-2xl font-mono font-bold tracking-[0.4em] bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 4}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {otpLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800 text-[11px]">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpCooldown > 0 || otpLoading}
                  className="text-gold-600 dark:text-gold-400 hover:underline font-bold disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                >
                  {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegStep('form');
                    setOtpError('');
                    setOtpCode('');
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline font-semibold cursor-pointer"
                >
                  Change Email / Edit Details
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleCandidateRegSubmit} className="space-y-2 text-xs">
            {/* Row 1: Full Name & Email side-by-side ALWAYS in 2 columns */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-0.5 truncate">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={candidateReg.fullName}
                    onChange={(e) => {
                      if (error) setError('');
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, '').slice(0, 50);
                      setCandidateReg({ ...candidateReg, fullName: lettersOnly });
                    }}
                    placeholder="Kishore Kumar"
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-0.5 truncate">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    maxLength={80}
                    value={candidateReg.email}
                    onChange={(e) => {
                      if (error) setError('');
                      const val = e.target.value.slice(0, 80);
                      setCandidateReg({ ...candidateReg, email: val });
                      setEmailDuplicate(false);
                    }}
                    onBlur={() => {
                      const clean = (candidateReg.email || '').trim().toLowerCase();
                      if (clean && validateCandidateEmail(clean).isValid) {
                        checkDuplicateCandidate('email', clean);
                      }
                    }}
                    placeholder="candidate@gmail.com"
                    className={`w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-navy-900 border-2 ${
                      emailDuplicate 
                        ? 'border-amber-500 dark:border-amber-500 focus:border-amber-500 focus:ring-amber-500' 
                        : 'border-slate-300 dark:border-navy-600 focus:border-gold-500 focus:ring-gold-500'
                    } rounded-xl focus:outline-none focus:ring-1 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs transition`}
                  />
                  {checkingDuplicate && (
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-2.5 top-2 pointer-events-none" />
                  )}
                  {!checkingDuplicate && candidateReg.email && validateCandidateEmail(candidateReg.email.trim()).isValid && !emailDuplicate && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 absolute right-2.5 top-2 pointer-events-none" />
                  )}
                </div>
                {emailDuplicate && (
                  <div className="mt-1 flex items-center justify-between text-[10.5px] leading-tight">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Already registered</span>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('login')}
                      className="text-gold-600 dark:text-gold-400 hover:underline font-bold cursor-pointer"
                    >
                      Sign In →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Phone Number Input */}
            <div>
              {(() => {
                const activeConfig = COUNTRY_PHONE_CONFIG.find(c => c.code === candidateReg.countryCode);
                const currentDigits = candidateReg.phone.replace(/\D/g, '');
                const maxDigits = activeConfig ? activeConfig.digits : 15;
                const isComplete = activeConfig 
                  ? currentDigits.length === activeConfig.digits 
                  : (currentDigits.length >= 7 && currentDigits.length <= 15);
                const currentFlag = activeConfig ? activeConfig.flag : '🌐';

                return (
                  <>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="block text-slate-900 dark:text-white font-bold text-[11px]">
                        Phone Number <span className="text-rose-500 font-bold">*</span>
                      </label>
                      {currentDigits.length > 0 && (
                        <span className={`text-[10px] font-mono flex items-center gap-1 ${
                          isComplete ? 'text-emerald-500 font-bold' : 'text-slate-400'
                        }`}>
                          {isComplete && <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />}
                          <span>{currentDigits.length}/{activeConfig ? `${activeConfig.digits}` : '15'} digits</span>
                        </span>
                      )}
                    </div>

                    <div className="flex rounded-xl border-2 border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 focus-within:border-gold-500 focus-within:ring-1 focus-within:ring-gold-500 overflow-hidden shadow-xs transition">
                      {isCustomCountryCode ? (
                        <div className="w-20 shrink-0 bg-slate-100 dark:bg-navy-800 border-r border-slate-200 dark:border-navy-700 flex items-center px-1.5">
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
                            className="w-full text-xs font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="relative w-24 sm:w-28 shrink-0 bg-slate-100 dark:bg-navy-800 border-r border-slate-200 dark:border-navy-700 flex items-center">
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
                            className="w-full h-full pl-2 pr-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer appearance-none truncate"
                          >
                            {COUNTRY_PHONE_CONFIG.map((c) => (
                              <option key={c.code} value={c.code} className="dark:bg-navy-900 text-slate-900 dark:text-white">
                                {c.flag} {c.code} ({c.country})
                              </option>
                            ))}
                            <option value="__CUSTOM__" className="text-blue-600 font-bold dark:bg-navy-900">
                              🌐 Other
                            </option>
                          </select>
                          <div className="pointer-events-none absolute right-1 top-2 text-slate-400">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      <div className="relative flex-1 min-w-0 flex items-center">
                        <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={maxDigits}
                          required
                          value={candidateReg.phone}
                          onChange={(e) => {
                            if (error) setError('');
                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
                            setCandidateReg({ ...candidateReg, phone: digitsOnly });
                          }}
                          onBlur={() => {
                            const digitsOnly = candidateReg.phone.replace(/\D/g, '');
                            if (digitsOnly.length >= 7) {
                              const fullPhone = `${candidateReg.countryCode || '+91'} ${digitsOnly}`;
                              checkDuplicateCandidate('phone', fullPhone);
                            }
                          }}
                          placeholder="Enter mobile number"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-transparent focus:outline-none text-slate-900 dark:text-white font-bold text-xs tracking-wider font-mono placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium placeholder:tracking-normal"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Row 3: Passwords side-by-side ALWAYS in 2 columns */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-0.5 truncate">
                  Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={candidateReg.password}
                    onChange={(e) => {
                      if (error) setError('');
                      setCandidateReg({ ...candidateReg, password: e.target.value });
                    }}
                    placeholder="Min. 8 chars"
                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-2 text-slate-500 hover:text-gold-500 transition cursor-pointer"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 dark:text-white font-bold text-[11px] mb-0.5 truncate">
                  Confirm Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    required
                    value={candidateReg.confirmPassword}
                    onChange={(e) => {
                      if (error) setError('');
                      setCandidateReg({ ...candidateReg, confirmPassword: e.target.value });
                    }}
                    placeholder="Re-enter password"
                    className="w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-navy-900 border-2 border-slate-300 dark:border-navy-600 rounded-xl focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-slate-900 dark:text-white font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-medium shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2 top-2 text-slate-500 hover:text-gold-500 transition cursor-pointer"
                    title={showRegConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-0.5">
              <label className="flex items-start gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={candidateReg.consentAgreed}
                  onChange={(e) => setCandidateReg({ ...candidateReg, consentAgreed: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium leading-tight">
                  I consent to Revival International processing my profile in accordance with{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveModal(null); navigateTo('legal/privacy-policy'); }}
                    className="text-amber-600 dark:text-gold-400 font-bold hover:underline"
                  >
                    Privacy Policy
                  </button>{' '}
                  and Terms.
                </span>
              </label>
            </div>

            {/* Complete Registration Button */}
            <button
              type="submit"
              disabled={otpLoading}
              className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm font-sans tracking-wide cursor-pointer mt-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Complete Candidate Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Switch between Sign In and Register */}
        {regStep !== 'otp' && (
          <div className="border-t border-slate-100 dark:border-navy-800 pt-1.5 mt-1.5 text-center text-xs font-medium">
            {authMode === 'login' ? (
              <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="text-amber-600 dark:text-gold-400 hover:text-amber-700 font-extrabold transition inline-flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Create Candidate Account →
                </button>
              </p>
            ) : (
              <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-amber-600 dark:text-gold-400 hover:text-amber-700 font-extrabold transition inline-flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Sign In to Candidate Portal →
                </button>
              </p>
            )}
          </div>
        )}

        {/* Google OAuth Client ID config link */}
        {regStep !== 'otp' && (
          <div className="mt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setTempClientId(googleClientId || '');
                setShowClientIdConfig(true);
              }}
              className="text-[9px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-2.5 h-2.5" />
              <span>Google OAuth Configuration</span>
            </button>
          </div>
        )}

      </div>

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

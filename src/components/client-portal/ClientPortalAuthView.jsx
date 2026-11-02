import React, { useState } from 'react';
import {
  Building2, User, Mail, Lock, Phone, Globe, ShieldCheck, ArrowRight,
  CheckCircle2, AlertCircle, Sparkles, KeyRound, Briefcase, FileCheck
} from 'lucide-react';
import { BrandLogoIcon } from '../BrandLogoIcon';

export const ClientPortalAuthView = ({ onAuthenticated, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [clientType, setClientType] = useState('Corporate'); // 'Individual' | 'Corporate'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '+971 ',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyRegNumber: '',
    industry: 'Engineering & Construction',
    designation: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    website: ''
  });

  // Forgot/Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = request code, 2 = verify & set new password
  const [generatedCodeHint, setGeneratedCodeHint] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/client-portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Sign in failed. Please verify your credentials.');
      }
      onAuthenticated(data.client, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/client-portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true, email: 'client@therevivalinternational.com' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Demo login failed.');
      }
      onAuthenticated(data.client, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (clientType === 'Corporate' && !regForm.companyName.trim()) {
      setError('Company Name is required for Corporate Client registration.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/client-portal/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          clientType
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }
      onAuthenticated(data.client, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/client-portal/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not send reset code.');
      }
      setResetStep(2);
      if (data.verificationHint) {
        setGeneratedCodeHint(data.verificationHint);
      }
      setSuccessMsg('A 6-digit verification code has been generated for your account.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/client-portal/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          resetCode,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed.');
      }
      setSuccessMsg('Password reset complete! You can now sign in with your new password.');
      setMode('login');
      setLoginEmail(resetEmail);
      setResetStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[84vh] bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#050b16] dark:via-navy-950 dark:to-[#081226] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-gold-500/30 bg-white dark:bg-navy-900">
        
        {/* Left Branding & Value Proposition Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0a1628] via-[#0f213d] to-[#07101e] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <BrandLogoIcon className="w-12 h-12 shadow-lg" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gold-400 block">
                  The Revival International
                </span>
                <h1 className="font-serif text-xl font-extrabold text-white">
                  Client Advisory Portal
                </h1>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30">
                <Sparkles className="w-3 h-3" /> Centralized Service Workspace
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-white">
                Manage Your Enquiries, Admissions & Hiring Mandates in Real Time
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Designed for both Corporate Enterprises and Individual Academic & Visa Clients across all 24 Revival International services.
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-xs">
              {[
                {
                  icon: FileCheck,
                  title: 'Live Multi-Stage Service Tracking',
                  desc: 'Tailored progress workflows for Recruitment, College Admissions, International Consulting & Visas.'
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure Document Vault & Verification',
                  desc: 'Upload transcripts, trade licenses, and passports with instant consultant verification feedback.'
                },
                {
                  icon: Briefcase,
                  title: 'Direct Consultant Desk & Appointments',
                  desc: 'Book consultations with real-time slot availability and message your assigned advisor directly.'
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{item.title}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 mt-8 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span>ISO 9001:2025 Certified</span>
            <span className="text-gold-400 font-semibold">End-to-End Encrypted Portal</span>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-4 mb-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Client Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Client Registration
              </button>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Dedicated Client Role
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white">
                  Sign In to Client Dashboard
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Enter your registered client email to access your service enquiries, documents, and consultations.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Registered Client Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. client@therevivalinternational.com or your enquiry email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-gold-600 dark:text-gold-400 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-sm shadow-gold-glow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Access Client Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-200 dark:border-navy-800 space-y-2.5">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-navy-950 dark:hover:bg-navy-800 text-gold-400 border border-gold-500/40 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Instant Demo Client Access (Corporate & Academic Enquiries)</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  Submitted an enquiry on the website? Register with the <strong>same email address</strong> to automatically link all your existing enquiries!
                </p>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white">
                  Create Your Client Portal Account
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Select your account profile type to customize your service workspace.
                </p>
              </div>

              {/* Client Type Selector: Individual vs Corporate */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setClientType('Individual')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    clientType === 'Individual'
                      ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold-400 shadow-sm border border-gold-500/40'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4 text-gold-500" />
                  <span>Individual / Student Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('Corporate')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    clientType === 'Corporate'
                      ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold-400 shadow-sm border border-gold-500/40'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-gold-500" />
                  <span>Corporate / Employer Client</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {clientType === 'Corporate' ? 'Authorized Contact Full Name *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="e.g. Kishore Kumar / Tariq Al-Mansoori"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {clientType === 'Corporate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gold-500/5 border border-gold-500/20">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Company / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.companyName}
                      onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                      placeholder="e.g. Crescent Gulf Holdings LLC"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Trade License / Reg. No.
                    </label>
                    <input
                      type="text"
                      value={regForm.companyRegNumber}
                      onChange={(e) => setRegForm({ ...regForm, companyRegNumber: e.target.value })}
                      placeholder="e.g. DED-DXB-884920"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={regForm.industry}
                      onChange={(e) => setRegForm({ ...regForm, industry: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option>Engineering & Construction</option>
                      <option>Oil, Gas & Energy</option>
                      <option>Healthcare & Medical</option>
                      <option>IT, AI & Cloud Software</option>
                      <option>Higher Education & Research</option>
                      <option>Hospitality & Aviation</option>
                      <option>Banking, Finance & Legal</option>
                      <option>Manufacturing & Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Your Designation
                    </label>
                    <input
                      type="text"
                      value={regForm.designation}
                      onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                      placeholder="e.g. HR Director / VP Operations"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Country *
                  </label>
                  <select
                    value={regForm.country}
                    onChange={(e) => setRegForm({ ...regForm, country: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  >
                    <option>United Arab Emirates</option>
                    <option>India</option>
                    <option>Saudi Arabia</option>
                    <option>Qatar</option>
                    <option>Oman</option>
                    <option>Kuwait</option>
                    <option>Bahrain</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>Singapore</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    placeholder="e.g. Dubai / Chennai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-sm shadow-gold-glow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Creating Client Account...' : `Register ${clientType} Client Account`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT / RESET PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-gold-500" />
                  <span>Reset Client Portal Password</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {resetStep === 1
                    ? 'Enter your registered email address to receive a 6-digit password reset verification code.'
                    : 'Enter the 6-digit verification code and your new password below.'}
                </p>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Registered Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="client@therevivalinternational.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-xs shadow-gold-glow transition cursor-pointer"
                  >
                    {loading ? 'Generating Verification Code...' : 'Send 6-Digit Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {generatedCodeHint && (
                    <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/40 text-navy-900 dark:text-gold-300 font-mono text-xs">
                      Verification Code for <strong>{resetEmail}</strong>: <span className="font-black text-sm tracking-widest">{generatedCodeHint}</span>
                    </div>
                  )}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 482910"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      New Password (min 6 characters) *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-xs shadow-gold-glow transition cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Confirm & Reset Password'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setMode('login'); setResetStep(1); setError(''); }}
                className="text-slate-500 hover:text-navy-900 dark:hover:text-white font-bold text-xs cursor-pointer"
              >
                ← Back to Client Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


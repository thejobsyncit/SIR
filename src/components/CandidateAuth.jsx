import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Mail, Phone, Briefcase, Globe, FileUp, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, UserPlus, KeyRound } from 'lucide-react';

export const CandidateAuth = () => {
  const { loginCandidate, registerCandidate } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+971',
    preferredCountry: 'UAE',
    industry: 'Construction & Engineering',
    password: '',
    confirmPassword: '',
    resumeName: '',
    agreeTerms: true
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.email || !loginData.password) {
      setError('Please provide both email and password.');
      return;
    }
    loginCandidate(loginData.email, loginData.password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!regData.fullName || !regData.email || !regData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    registerCandidate({
      fullName: regData.fullName,
      email: regData.email,
      phone: `${regData.countryCode} ${regData.phone}`,
      preferredCountry: regData.preferredCountry,
      industry: regData.industry,
      resumeName: regData.resumeName || 'Uploaded_Executive_CV.pdf'
    });
  };

  const handleDemoLogin = () => {
    loginCandidate('candidate@sirrecruitment.com', 'demo123');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRegData({ ...regData, resumeName: e.target.files[0].name });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-gold-500/30 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Branding Sidebar */}
        <div className="md:col-span-5 bg-gradient-to-br from-gold-500/15 via-slate-50 to-yellow-100/30 dark:from-navy-900 dark:via-navy-950 dark:to-black p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-gold-500/20">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-serif font-extrabold text-xl shadow-gold-glow">
                S
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white tracking-tight">SIR Candidate Hub</h2>
                <p className="text-[10px] text-gold-700 dark:text-gold-400 uppercase tracking-widest font-semibold">Global Executive Network</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-snug">
                Access High-Paying GCC & International Opportunities
              </h3>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                Connect with Tier-1 contractors, healthcare groups, and tech conglomerates across UAE, KSA, Qatar, and Singapore.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Automated AI ATS CV Screening</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Direct Employer Interview Scheduling</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Zero Candidate Fee & Visa Assistance</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-navy-800">
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-gold-500" />
              <span>MOHRE & ISO 9001:2025 Compliant Portal</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="md:col-span-7 p-6 sm:p-8 bg-slate-50/50 dark:bg-navy-900/60 flex flex-col justify-center">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-200/70 dark:bg-navy-950 p-1 rounded-xl border border-slate-300/60 dark:border-navy-800 mb-6 text-xs font-bold">
            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center space-x-2 ${
                authMode === 'login' 
                  ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Candidate Sign In</span>
            </button>
            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center space-x-2 ${
                authMode === 'register' 
                  ? 'bg-gold-500 text-navy-950 shadow-md font-extrabold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Registration</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gold-500" />
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email.'); }} className="text-gold-600 hover:text-gold-700 dark:text-gold-400 hover:underline text-[11px] font-semibold">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-navy-700 text-gold-500 focus:ring-gold-500 bg-white dark:bg-navy-950" />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-shimmer hover:opacity-95 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2"
              >
                <span>Sign In to Candidate Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 text-center">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-gold-400 font-semibold rounded-xl border border-gold-500/30 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  <span>Instant Candidate Demo Login</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={regData.fullName}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Phone Number</label>
                  <div className="flex space-x-1.5">
                    <select
                      value={regData.countryCode}
                      onChange={(e) => setRegData({ ...regData, countryCode: e.target.value })}
                      className="bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-2 py-2 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Preferred Country</label>
                  <select
                    value={regData.preferredCountry}
                    onChange={(e) => setRegData({ ...regData, preferredCountry: e.target.value })}
                    className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="UAE">United Arab Emirates (Dubai / Abu Dhabi)</option>
                    <option value="Saudi Arabia">Saudi Arabia (Riyadh / NEOM)</option>
                    <option value="Qatar">Qatar (Doha)</option>
                    <option value="Oman">Oman (Muscat)</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Singapore">Singapore</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">Industry / Specialization</label>
                <select
                  value={regData.industry}
                  onChange={(e) => setRegData({ ...regData, industry: e.target.value })}
                  className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Construction & Engineering">Construction & Infrastructure</option>
                  <option value="Healthcare & Nursing">Healthcare & Medical</option>
                  <option value="IT & Software Development">IT, AI & Cloud Computing</option>
                  <option value="Oil & Gas">Energy, Oil & Gas</option>
                  <option value="Banking & Executive">Banking, Finance & Executive</option>
                  <option value="Hospitality">Hospitality & Luxury Aviation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* CV Upload Dropzone */}
              <div className="space-y-1 pt-1">
                <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <FileUp className="w-3.5 h-3.5 text-gold-500" />
                  Attach Resume / CV (PDF or DOCX)
                </label>
                <div className="border border-dashed border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 hover:border-gold-500 rounded-xl p-3 text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-gold-600 dark:text-gold-400 font-semibold">
                    {regData.resumeName ? `Attached: ${regData.resumeName}` : 'Click or Drag CV here for Instant AI Analysis'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold-shimmer hover:opacity-95 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Submit Profile</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

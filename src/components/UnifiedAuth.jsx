import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Briefcase, Building2, ArrowRight, ArrowLeft, User, Lock, Mail, Phone, FileUp, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const UnifiedAuth = ({ defaultMode = 'login', defaultRole = null, onSuccess }) => {
  const { loginCandidate, registerCandidate, loginEmployer, setActiveModal, navigateTo } = useApp();
  const [authMode, setAuthMode] = useState(defaultMode); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(defaultRole); // null | 'candidate' | 'employer'
  const [error, setError] = useState('');

  // Candidate Form States
  const [candidateLogin, setCandidateLogin] = useState({ email: '', password: '' });
  const [candidateReg, setCandidateReg] = useState({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+971',
    preferredCountry: 'UAE',
    industry: 'Engineering & Construction',
    password: '',
    confirmPassword: '',
    resumeName: ''
  });

  // Employer Form States
  const [employerLogin, setEmployerLogin] = useState({ email: '', accountId: '', password: '' });

  // Reset error when switching states
  const handleModeSwitch = (newMode) => {
    setAuthMode(newMode);
    setError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  // Submit Candidate Login
  const handleCandidateLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!candidateLogin.email || !candidateLogin.password) {
      setError('Please provide email and password.');
      return;
    }
    loginCandidate(candidateLogin.email, candidateLogin.password);
    navigateTo('candidates');
    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Submit Candidate Registration
  const handleCandidateRegSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!candidateReg.fullName || !candidateReg.email || !candidateReg.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (candidateReg.password !== candidateReg.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    registerCandidate({
      fullName: candidateReg.fullName,
      email: candidateReg.email,
      phone: `${candidateReg.countryCode} ${candidateReg.phone}`,
      preferredCountry: candidateReg.preferredCountry,
      industry: candidateReg.industry,
      resumeName: candidateReg.resumeName || 'Uploaded_CV.pdf'
    });
    navigateTo('candidates');
    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Submit Employer Login
  const handleEmployerLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!employerLogin.email || !employerLogin.password) {
      setError('Please provide corporate email and password.');
      return;
    }
    loginEmployer(employerLogin.email, employerLogin.accountId || 'SIR-EMP-9902', employerLogin.password);
    navigateTo('employers');
    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // Quick Demo Logins
  const handleDemoCandidateLogin = () => {
    loginCandidate('candidate@sirrecruitment.com', 'demo123');
    navigateTo('candidates');
    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  const handleDemoEmployerLogin = () => {
    loginEmployer('hr@alhabtoorcontracting.com', 'SIR-EMP-9902', 'enterprise123');
    navigateTo('employers');
    if (onSuccess) onSuccess();
    setActiveModal(null);
  };

  // VIEW 1: Account Type Selection View (Matching Image 2 layout with SIR branding & website theme)
  if (!selectedRole) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-navy-950 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-gold-500/30 text-center">
          
          {/* SIR Logo Avatar at top */}
          <div className="flex justify-center mb-5">
            <BrandLogoIcon className="w-24 h-24 shadow-luxury" />
          </div>

          {/* Heading & Subheading */}
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            {authMode === 'login' ? 'Sign In to SIR' : 'Create Your SIR Account'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-2">
            {authMode === 'login'
              ? 'Select your account type to access your portal'
              : 'Select your account type to get started'}
          </p>

          {/* Two Side-by-Side Account Type Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            
            {/* Card 1: Job Seeker / Candidate */}
            <div 
              onClick={() => handleRoleSelect('candidate')}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 dark:hover:border-gold-500 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-luxury transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gold-500/10 dark:bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-gold-500" />
              </div>

              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mb-2">
                {authMode === 'login' ? 'Job Seeker Sign In' : 'Job Seeker Registration'}
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
                Access your candidate dashboard, track applications, and manage your profile.
              </p>

              <div className="mt-auto text-gold-500 group-hover:text-gold-600 font-bold text-sm flex items-center space-x-1 transition">
                <span>{authMode === 'login' ? 'Job Seeker Login' : 'Register as Job Seeker'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Company / Employer */}
            <div 
              onClick={() => handleRoleSelect('employer')}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 dark:hover:border-gold-500 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-luxury transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-navy-900/10 dark:bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-gold-500" />
              </div>

              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mb-2">
                {authMode === 'login' ? 'Company Sign In' : 'Company Registration'}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-6">
                Manage your candidate pipeline, review resumes, post jobs, and hire talent.
              </p>

              <div className="mt-auto text-gold-500 group-hover:text-gold-600 font-bold text-sm flex items-center space-x-1 transition">
                <span>{authMode === 'login' ? 'Employer Login' : 'Register as Company'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

          {/* Bottom Divider & Toggle Link */}
          <div className="border-t border-slate-200 dark:border-navy-800 pt-6 mt-8 flex justify-center items-center text-sm font-medium">
            {authMode === 'login' ? (
              <p className="text-slate-600 dark:text-slate-300">
                Don't have an account yet?{' '}
                <button
                  onClick={() => handleModeSwitch('register')}
                  className="text-gold-500 hover:text-gold-600 font-bold transition inline-flex items-center gap-1"
                >
                  Create an Account →
                </button>
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">
                Already have an account?{' '}
                <button
                  onClick={() => handleModeSwitch('login')}
                  className="text-gold-500 hover:text-gold-600 font-bold transition inline-flex items-center gap-1"
                >
                  Sign In →
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    );
  }

  // VIEW 2: Role-Specific Auth Form (Candidate or Employer) with SIR Theme
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-navy-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-gold-500/30">
        
        {/* Top Back Navigation Button */}
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center space-x-2 text-xs font-bold text-gold-500 hover:text-gold-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Select Account Type</span>
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-500 flex items-center justify-center border border-gold-500/30">
            {selectedRole === 'candidate' ? <Briefcase className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
              {selectedRole === 'candidate' 
                ? (authMode === 'login' ? 'Job Seeker Sign In' : 'Job Seeker Registration')
                : (authMode === 'login' ? 'Company / Employer Sign In' : 'Company / Employer Registration')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enter your SIR credentials to access your {selectedRole === 'candidate' ? 'Candidate' : 'Employer'} Portal.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* CANDIDATE AUTH FORM */}
        {selectedRole === 'candidate' && (
          authMode === 'login' ? (
            <form onSubmit={handleCandidateLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={candidateLogin.email}
                    onChange={(e) => setCandidateLogin({ ...candidateLogin, email: e.target.value })}
                    placeholder="e.g. candidate@sirrecruitment.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 text-sm mt-4"
              >
                <span>Sign In to Candidate Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={handleDemoCandidateLogin}
                  className="w-full py-2.5 bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold rounded-xl transition text-xs border border-gold-500/30"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={candidateReg.email}
                    onChange={(e) => setCandidateReg({ ...candidateReg, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={candidateReg.phone}
                    onChange={(e) => setCandidateReg({ ...candidateReg, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={candidateReg.password}
                    onChange={(e) => setCandidateReg({ ...candidateReg, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={candidateReg.confirmPassword}
                    onChange={(e) => setCandidateReg({ ...candidateReg, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 text-sm mt-4"
              >
                <span>Complete SIR Candidate Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )
        )}

        {/* EMPLOYER AUTH FORM */}
        {selectedRole === 'employer' && (
          <form onSubmit={handleEmployerLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Corporate Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={employerLogin.email}
                  onChange={(e) => setEmployerLogin({ ...employerLogin, email: e.target.value })}
                  placeholder="hr@alhabtoorcontracting.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Account ID / License No.</label>
              <input
                type="text"
                value={employerLogin.accountId}
                onChange={(e) => setEmployerLogin({ ...employerLogin, accountId: e.target.value })}
                placeholder="e.g. SIR-EMP-9902"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={employerLogin.password}
                  onChange={(e) => setEmployerLogin({ ...employerLogin, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:border-gold-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-gold-glow transition flex items-center justify-center space-x-2 text-sm mt-4"
            >
              <span>Sign In to SIR Enterprise Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

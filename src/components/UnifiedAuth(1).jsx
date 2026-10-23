import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { Briefcase, ArrowRight, User, Lock, Mail, Phone, Sparkles, CheckCircle2 } from 'lucide-react';

export const UnifiedAuth = ({ defaultMode = 'login', defaultRole = 'candidate', onSuccess }) => {
  const { loginCandidate, registerCandidate, setActiveModal, navigateTo } = useApp();
  const [authMode, setAuthMode] = useState(defaultMode); // 'login' | 'register'
  const [error, setError] = useState('');

  // Candidate Form States
  const [candidateLogin, setCandidateLogin] = useState({ email: '', password: '' });
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

  // Quick Demo Login
  const handleDemoCandidateLogin = () => {
    loginCandidate('candidate@revivalinternational.com', 'demo123');
    navigateTo('candidates');
    if (onSuccess) onSuccess();
    setActiveModal(null);
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
              : 'Register to apply for international vacancies and explore overseas opportunities.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

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
                  placeholder="e.g. candidate@revivalinternational.com"
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
                  placeholder="+91 9003475405"
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
    </div>
  );
};

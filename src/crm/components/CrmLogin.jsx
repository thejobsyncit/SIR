import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { CRM_ROLES } from '../data/mockCrmData';

export const CrmLogin = () => {
  const { login, currentRole, switchRole } = useCrm();
  const [email, setEmail] = useState('tariq.admin@sirrecruitment.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [step, setStep] = useState(1); // 1: Password -> 2: Email OTP Verification
  const [otp, setOtp] = useState(['8', '4', '2', '9']);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setStep(2); // Proceed to 2FA OTP
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Ambient Animated Luxury Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full glass-card bg-navy-900/80 border border-gold-500/30 rounded-3xl p-8 shadow-luxury relative z-10 space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-navy-950 border-2 border-gold-500 flex items-center justify-center shadow-lg mx-auto mb-2">
            <span className="font-serif text-2xl font-extrabold text-gold-500">S</span>
            <span className="font-serif text-xl font-bold text-white">IR</span>
          </div>
          <h2 className="font-serif text-2xl font-extrabold text-white tracking-tight">
            SIR Recruitment Enterprise CRM
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Private Internal Gateway • Restricted Access Only
          </p>
        </div>

        {/* Role Switcher Demo Bar */}
        <div className="p-3 bg-navy-950 border border-navy-800 rounded-2xl space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gold-400 font-bold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              Demo Role Selector ({CRM_ROLES.length} Roles):
            </span>
          </div>
          <select 
            value={currentRole}
            onChange={(e) => switchRole(e.target.value)}
            className="w-full bg-navy-900 border border-navy-700 text-white rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-gold-500"
          >
            {CRM_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {step === 1 ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px]">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 font-medium">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-navy-700 text-gold-500 focus:ring-0"
                />
                <span>Remember Session</span>
              </label>

              <button type="button" className="text-gold-400 hover:underline font-bold">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Request 2FA OTP →</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div className="text-center space-y-1">
              <KeyRound className="w-8 h-8 text-gold-500 mx-auto" />
              <h4 className="font-serif text-base font-bold text-white">Two-Factor Authentication</h4>
              <p className="text-[11px] text-slate-400">Enter the 4-digit code sent to <strong className="text-white">{email}</strong></p>
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
                  className="w-12 h-12 text-center bg-navy-950 border border-gold-500/50 text-white font-mono text-xl font-bold rounded-xl focus:border-gold-500"
                />
              ))}
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
            >
              Verify OTP & Launch CRM Dashboard
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-center text-slate-400 hover:text-white text-[11px]"
            >
              ← Back to Password Entry
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="pt-4 border-t border-navy-800 text-[10px] text-slate-500 flex justify-between items-center">
          <span>IP: 194.170.21.90 (Dubai, UAE)</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            256-bit SSL Encrypted
          </span>
        </div>

      </div>
    </div>
  );
};

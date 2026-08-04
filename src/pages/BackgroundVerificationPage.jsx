import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, CheckCircle2, Clock, AlertCircle, FileSpreadsheet, Lock, RefreshCw, Send } from 'lucide-react';

export const BackgroundVerificationPage = () => {
  const { setActiveModal } = useApp();
  
  // Verification Request Form State
  const [candidateName, setCandidateName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [verificationType, setVerificationType] = useState('6-Point Comprehensive Audit');
  const [loading, setLoading] = useState(false);
  const [submittedCase, setSubmittedCase] = useState(null);

  // Tracking Tool State
  const [trackId, setTrackId] = useState('');
  const [trackedStatus, setTrackedStatus] = useState(null);

  const handleInitiateVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName, passportNumber, verificationType })
      });
      const data = await res.json();
      setSubmittedCase(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = () => {
    if (!trackId) return;
    setTrackedStatus({
      caseId: trackId,
      candidate: 'Alexander Wright',
      type: '6-Point Comprehensive Audit',
      status: 'In Progress - Embassy Degree Attestation',
      progress: 65,
      steps: [
        { name: 'Identity & Passport Clearance', status: 'Completed' },
        { name: 'University Degree Attestation', status: 'In Progress (Embassy)' },
        { name: '5-Year Employment History Audit', status: 'Completed' },
        { name: 'Criminal & Police Records Check', status: 'In Progress' },
        { name: 'Physical Address Verification', status: 'Queued' },
        { name: 'Executive Reference Audit', status: 'Completed' }
      ]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          Enterprise Security & Audit
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          Background Verification Module
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Screen corporate candidates with 6-point verification covering education attestation, past employment, police clearances, and identity audits across UAE, GCC, & global institutions.
        </p>
      </div>

      {/* 6 Verification Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Employee Verification', desc: 'Pre-employment screening & reference audit.' },
          { title: 'Education Check', desc: 'Direct university & MOE attestation.' },
          { title: 'Employment History', desc: '5-year past HR & payroll verification.' },
          { title: 'Address Check', desc: 'Physical residence & legal address check.' },
          { title: 'Identity Check', desc: 'Emirates ID & passport authenticity.' },
          { title: 'Police Clearance', desc: 'Criminal background & Interpol check.' }
        ].map((item, idx) => (
          <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-2xl text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-gold-500 mx-auto" />
            <h4 className="font-bold text-xs text-navy-900 dark:text-white">{item.title}</h4>
            <p className="text-[10px] text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Request Verification & Live Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form: Initiate Verification */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-navy-800 pb-3">
            <Lock className="w-5 h-5 text-gold-500" />
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Request Background Audit</h3>
          </div>

          {!submittedCase ? (
            <form onSubmit={handleInitiateVerification} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Candidate Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="Enter full legal name as per passport"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Passport / Emirates ID Number</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. N1234567 / 784-1990-1234567-1"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Verification Package</label>
                <select 
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white font-semibold"
                >
                  <option value="Standard Education & Past Employment ($99)">Standard Education & Past Employment ($99)</option>
                  <option value="6-Point Comprehensive Audit ($199)">6-Point Comprehensive Audit ($199)</option>
                  <option value="Executive C-Suite Deep Audit ($399)">Executive C-Suite Deep Audit ($399)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initiating Case ID...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Verification Request</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-navy-950 text-white rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gold-400 font-bold">Case Opened!</span>
                <span className="font-mono text-xs bg-navy-900 px-2 py-1 rounded">{submittedCase.caseId}</span>
              </div>
              <p className="text-xs text-slate-300">Candidate: {submittedCase.candidateName}</p>
              <p className="text-xs text-slate-300">Type: {submittedCase.verificationType}</p>
              <p className="text-xs text-emerald-400 font-bold">Estimated Turnaround: {submittedCase.estimatedCompletionDays} Business Days</p>

              <button 
                onClick={() => { setTrackId(submittedCase.caseId); handleTrack(); }}
                className="w-full py-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl"
              >
                Track Case Progress Live →
              </button>
            </div>
          )}
        </div>

        {/* Live Case Tracking Tool */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-navy-800 pb-3">
            <Search className="w-5 h-5 text-gold-500" />
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Live Verification Tracking</h3>
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Enter Case ID e.g. SIR-BGV-881290"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white font-mono"
            />
            <button 
              onClick={handleTrack}
              className="px-5 py-2.5 bg-navy-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-navy-950 transition"
            >
              Track Status
            </button>
          </div>

          {trackedStatus && (
            <div className="space-y-4 pt-2 animate-in fade-in">
              <div className="p-3 bg-navy-950 text-white rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-gold-400">{trackedStatus.caseId}</p>
                  <p className="text-[10px] text-slate-400">{trackedStatus.candidate} • {trackedStatus.type}</p>
                </div>
                <span className="font-bold text-emerald-400 text-xs">{trackedStatus.progress}% Complete</span>
              </div>

              <div className="space-y-2">
                {trackedStatus.steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-navy-950 border rounded-xl flex justify-between items-center">
                    <span className="font-medium text-navy-900 dark:text-white">{step.name}</span>
                    <span className={`font-bold text-[11px] ${step.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

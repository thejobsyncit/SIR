import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Award, CheckCircle2, XCircle, Clock, PauseCircle, 
  Send, ShieldCheck, User, Sparkles, AlertCircle 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerDecision = () => {
  const [selectedCandidate, setSelectedCandidate] = useState('CAN-801: Rohan Deshmukh');
  const [decision, setDecision] = useState('STRONG HIRE');
  const [calibratedLevel, setCalibratedLevel] = useState('Senior Cloud Architect (L5)');
  const [decisionNotes, setDecisionNotes] = useState('Candidate is a decisive Strong Hire. Excellent technical architecture problem-solving, mature communication, and immediate project impact for our overseas Enterprise Cloud practices.');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const decisionOptions = [
    {
      value: 'STRONG HIRE',
      label: 'Strong Hire',
      desc: 'Top 5% candidate. Exceeds competency bar; accelerates team delivery.',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200',
      activeBorder: 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600'
    },
    {
      value: 'HIRE',
      label: 'Hire',
      desc: 'Solid candidate. Meets technical criteria and aligns with company values.',
      badgeStyle: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200',
      activeBorder: 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20',
      icon: CheckCircle2,
      iconColor: 'text-blue-600'
    },
    {
      value: 'HOLD',
      label: 'Hold / Re-evaluate',
      desc: 'Borderline or pending team fit validation. Consider alternate team match.',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200',
      activeBorder: 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20',
      icon: PauseCircle,
      iconColor: 'text-amber-600'
    },
    {
      value: 'NO HIRE',
      label: 'No Hire',
      desc: 'Does not meet technical requirements or lacks required seniority depth.',
      badgeStyle: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200',
      activeBorder: 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20',
      icon: XCircle,
      iconColor: 'text-rose-600'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`✓ Official hiring decision [${decision}] recorded for ${selectedCandidate}. Sent to Hiring Lead & Super Admin.`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #7
              </span>
              <span className="text-[10px] font-mono text-slate-400">FINAL HIRING COMMITTEE VOTE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Official Decision Submission
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Submit your formal hiring verdict (Strong Hire, Hire, Hold, or No Hire), calibrated job seniority level, and committee rationale.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Formal Verdict Mode
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Candidate Switcher Header */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Candidate:</span>
            <select 
              value={selectedCandidate} 
              onChange={e => setSelectedCandidate(e.target.value)}
              className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
            >
              <option>CAN-801: Rohan Deshmukh (Cloud Architect)</option>
              <option>CAN-802: Priyanka Venkatesh (Full Stack Lead)</option>
              <option>CAN-803: Mohammed Tariq (DevOps Specialist)</option>
            </select>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Current Stage: Round 2 System Architecture
          </span>
        </div>

        {/* Decision Cards Grid */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Select Your Hiring Verdict:
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Every interviewer verdict is permanently signed with cryptographic audit trail.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {decisionOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = decision === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setDecision(opt.value)}
                    className={`p-5 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? `${opt.activeBorder} shadow-sm` 
                        : 'border-slate-200/80 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 bg-white dark:bg-navy-950'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${opt.badgeStyle}`}>
                          {opt.label}
                        </span>
                        <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">Click to Select</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-600">✓ Selected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seniority & Calibration Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Calibrated Seniority Level
                </label>
                <select
                  value={calibratedLevel}
                  onChange={e => setCalibratedLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option>Senior Cloud Architect (L5)</option>
                  <option>Lead Cloud Architect (L6)</option>
                  <option>Principal Architect (L7)</option>
                  <option>Mid-Level Cloud Engineer (L4)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Offer Urgency
                </label>
                <select className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white">
                  <option>Immediate (Fast-track offer within 24 hours)</option>
                  <option>Standard (Within 3 business days)</option>
                  <option>Flexible (Pending other candidate pipelines)</option>
                </select>
              </div>
            </div>

            {/* Decision Rationale */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Executive Justification for Hiring Committee
              </label>
              <textarea
                rows="3"
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
                placeholder="Summarize the core reason for your verdict..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-navy-800">
              <span className="text-[11px] text-slate-400">
                🔒 Decision is confidential and visible only to Hiring Lead & HR Director.
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Send className="w-4 h-4" />
                Submit Formal Verdict
              </button>
            </div>

          </div>
        </form>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerDecision;


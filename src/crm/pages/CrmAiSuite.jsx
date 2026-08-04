import React, { useState } from 'react';
import { Sparkles, FileText, Send, CheckCircle2, RefreshCw, MessageSquare, Bot } from 'lucide-react';

export const CrmAiSuite = () => {
  const [candidateName, setCandidateName] = useState('Alexander Wright');
  const [role, setRole] = useState('Senior Civil Project Manager');
  const [emailDraft, setEmailDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/ai/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-email', candidateName, targetRole: role })
      });
      const data = await res.json();
      setEmailDraft(data.draft);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">AI Talent Intelligence</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Enterprise AI Features Suite</h1>
          <p className="text-slate-400">AI Resume Parser, Candidate Matching, Interview Question Generator & Automated Drafts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Email & WhatsApp Writer */}
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            AI Executive Communication Draft Generator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Candidate Name</label>
              <input type="text" value={candidateName} onChange={e=>setCandidateName(e.target.value)} className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl p-2.5" />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Position / Mandate</label>
              <input type="text" value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl p-2.5" />
            </div>

            <button 
              onClick={handleGenerateEmail}
              disabled={loading}
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Shortlist Email & WhatsApp Draft</span>
            </button>

            {emailDraft && (
              <div className="p-4 bg-navy-950 rounded-xl border border-gold-500/30 space-y-2">
                <p className="font-bold text-gold-400">AI Generated Draft:</p>
                <textarea rows={6} readOnly value={emailDraft} className="w-full bg-transparent text-slate-200 focus:outline-none leading-relaxed" />
              </div>
            )}
          </div>
        </div>

        {/* AI Candidate Ranking & Matcher */}
        <div className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-gold-500" />
            AI Smart Candidate Ranking Engine
          </h3>
          <div className="p-4 bg-navy-950 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">Alexander Wright</span>
              <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">94% Role Match</span>
            </div>
            <p className="text-slate-400 text-[11px]">Matched skills: Primavera P6, FIDIC Contracts, High-Rise Civil PM.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

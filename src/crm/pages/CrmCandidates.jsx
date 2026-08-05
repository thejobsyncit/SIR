import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye, Bookmark, Filter, X, Send, UserCheck } from 'lucide-react';
import { CrmAddCandidateModal } from '../components/CrmAddCandidateModal';

export const CrmCandidates = () => {
  const { candidates, setAiDrawerOpen, globalAddCandidateOpen, setGlobalAddCandidateOpen } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('All');
  const [viewCand, setViewCand] = useState(null);

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.skills && c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNat = selectedNationality === 'All' || c.nationality === selectedNationality;
    return matchesSearch && matchesNat;
  });

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Human Capital Index</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Candidate Management System</h1>
          <p className="text-slate-500 dark:text-slate-400">Total Talent Pool: <strong className="text-slate-900 dark:text-white font-bold">{candidates.length + 54200} Verified Profiles</strong></p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2.5 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Parser</span>
          </button>
          
          <button 
            onClick={() => setGlobalAddCandidateOpen(true)}
            className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search candidate by name, ID, skills, or passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
          />
        </div>

        <select 
          value={selectedNationality}
          onChange={(e) => setSelectedNationality(e.target.value)}
          className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
        >
          <option value="All">All Nationalities</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="United Arab Emirates">United Arab Emirates</option>
          <option value="Poland">Poland</option>
          <option value="India">India</option>
        </select>
      </div>

      {/* Candidates Cards Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cand) => (
          <div 
            key={cand.id}
            onClick={() => setViewCand(cand)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-3 hover:border-gold-500 transition cursor-pointer flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={cand.name} className="w-10 h-10 rounded-full object-cover border-2 border-gold-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cand.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{cand.id} • {cand.nationality}</p>
                  </div>
                </div>
                <span className="w-9 h-9 rounded-full border-2 border-gold-500 text-gold-600 dark:text-gold-400 font-extrabold text-xs flex items-center justify-center bg-gold-500/10">
                  {cand.score || 90}
                </span>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1 text-[11px]">
                <p><strong className="text-slate-500 dark:text-slate-400">Current Employer:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cand.currentEmployer}</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Expected Salary:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cand.expectedSalary}</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Passport:</strong> <span className="font-mono text-slate-700 dark:text-slate-300">{cand.passport}</span></p>
              </div>

              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                "{cand.aiSummary}"
              </p>

              <div className="flex flex-wrap gap-1">
                {cand.skills && cand.skills.map((s, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-navy-950 text-gold-600 dark:text-gold-400 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-navy-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>Recruiter: <strong className="text-slate-900 dark:text-white">{cand.assignedRecruiter}</strong></span>
              <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold px-2 py-0.5 rounded uppercase">{cand.stage}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Candidate Modal */}
      {viewCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center space-x-3">
                <img src={viewCand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={viewCand.name} className="w-12 h-12 rounded-full border-2 border-gold-500 object-cover" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{viewCand.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{viewCand.id} • {viewCand.nationality} • Passport: {viewCand.passport}</p>
                </div>
              </div>
              <button onClick={() => setViewCand(null)} className="text-slate-400 hover:text-gold-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-navy-800">
              <p className="font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">AI Skill Match Summary</p>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{viewCand.aiSummary}</p>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-navy-800">
                <span>Current Salary: <strong className="text-slate-900 dark:text-white">{viewCand.currentSalary || 'AED 25,000 / month'}</strong></span>
                <span>Expected Salary: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{viewCand.expectedSalary}</strong></span>
                <span>Notice Period: <strong className="text-slate-900 dark:text-white">{viewCand.noticePeriod || '30 Days'}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Attached Compliance Documents:</h4>
              {viewCand.documents && viewCand.documents.map((doc, idx) => (
                <div key={idx} className="p-2.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-800 dark:text-slate-200">📄 {doc.name} ({doc.type})</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ {doc.status}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setViewCand(null)} className="flex-1 py-2 bg-slate-200 dark:bg-navy-800 text-slate-900 dark:text-white font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Add Candidate Modal */}
      <CrmAddCandidateModal 
        isOpen={globalAddCandidateOpen} 
        onClose={() => setGlobalAddCandidateOpen(false)} 
      />

    </div>
  );
};

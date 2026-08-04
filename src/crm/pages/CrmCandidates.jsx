import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye, Bookmark, Filter, X, Send, UserCheck } from 'lucide-react';

export const CrmCandidates = () => {
  const { candidates, addCandidate, setSelectedCandidate, setAiDrawerOpen } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewCand, setViewCand] = useState(null);

  // New Candidate Form
  const [newCand, setNewCand] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: 'United Kingdom',
    currentEmployer: '',
    experience: '5 Years',
    expectedSalary: 'AED 30,000 / month',
    assignedRecruiter: 'Fatima Al-Zahra'
  });

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNat = selectedNationality === 'All' || c.nationality === selectedNationality;
    return matchesSearch && matchesNat;
  });

  const handleCreateCandidate = (e) => {
    e.preventDefault();
    addCandidate(newCand);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Human Capital Index</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Candidate Management System</h1>
          <p className="text-slate-400">Total Talent Pool: <strong className="text-white">54,210 Verified Profiles</strong></p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Parser</span>
          </button>
          
          <button 
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Candidate</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card bg-navy-900 p-4 rounded-2xl border border-navy-800 flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search candidate by name, ID, skills, or passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
          />
        </div>

        <select 
          value={selectedNationality}
          onChange={(e) => setSelectedNationality(e.target.value)}
          className="bg-navy-950 border border-navy-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
        >
          <option value="All">All Nationalities</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
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
            className="glass-card bg-navy-900 border border-navy-800 p-5 rounded-2xl space-y-3 hover:border-gold-500/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img src={cand.avatar} alt={cand.name} className="w-10 h-10 rounded-full object-cover border-2 border-gold-500" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{cand.name}</h3>
                    <p className="text-[10px] text-slate-400">{cand.id} • {cand.nationality}</p>
                  </div>
                </div>
                <span className="w-9 h-9 rounded-full border-2 border-gold-500 text-gold-400 font-extrabold text-xs flex items-center justify-center">
                  {cand.score}
                </span>
              </div>

              <div className="p-2.5 bg-navy-950 rounded-xl space-y-1 text-[11px]">
                <p><strong className="text-slate-400">Current Employer:</strong> <span className="text-white">{cand.currentEmployer}</span></p>
                <p><strong className="text-slate-400">Expected Salary:</strong> <span className="text-emerald-400 font-bold">{cand.expectedSalary}</span></p>
                <p><strong className="text-slate-400">Passport:</strong> <span className="font-mono text-slate-300">{cand.passport}</span></p>
              </div>

              <p className="text-[11px] text-slate-300 italic line-clamp-2 leading-relaxed">
                "{cand.aiSummary}"
              </p>

              <div className="flex flex-wrap gap-1">
                {cand.skills.map((s, i) => (
                  <span key={i} className="bg-navy-950 text-gold-400 text-[10px] px-2 py-0.5 rounded font-medium border border-navy-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-between items-center text-[10px] text-slate-400">
              <span>Recruiter: <strong className="text-white">{cand.assignedRecruiter}</strong></span>
              <span className="bg-gold-500/20 text-gold-400 font-bold px-2 py-0.5 rounded uppercase">{cand.stage}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Candidate Modal */}
      {viewCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-navy-900 border border-gold-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-3">
                <img src={viewCand.avatar} alt={viewCand.name} className="w-12 h-12 rounded-full border-2 border-gold-500 object-cover" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{viewCand.name}</h3>
                  <p className="text-xs text-slate-400">{viewCand.id} • {viewCand.nationality} • Passport: {viewCand.passport}</p>
                </div>
              </div>
              <button onClick={() => setViewCand(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 bg-navy-950 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-gold-400 uppercase tracking-wider">AI Skill Match Summary</p>
              <p className="text-slate-200 leading-relaxed">{viewCand.aiSummary}</p>
              <div className="flex justify-between pt-2 border-t border-navy-800">
                <span>Current Salary: <strong className="text-white">{viewCand.currentSalary}</strong></span>
                <span>Expected Salary: <strong className="text-emerald-400 font-bold">{viewCand.expectedSalary}</strong></span>
                <span>Notice Period: <strong className="text-white">{viewCand.noticePeriod}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Attached Compliance Documents:</h4>
              {viewCand.documents.map((doc, idx) => (
                <div key={idx} className="p-2.5 bg-navy-950 border border-navy-800 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-200">📄 {doc.name} ({doc.type})</span>
                  <span className="text-emerald-400 font-bold">✓ {doc.status}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setViewCand(null)} className="flex-1 py-2 bg-navy-800 text-white font-bold rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Candidate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-navy-900 border border-gold-500/30 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-white">Create Candidate Profile</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Candidate Full Name</label>
                <input required type="text" value={newCand.name} onChange={e=>setNewCand({...newCand, name: e.target.value})} className="w-full bg-navy-950 border border-navy-700 text-white rounded-lg p-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Email</label>
                  <input required type="email" value={newCand.email} onChange={e=>setNewCand({...newCand, email: e.target.value})} className="w-full bg-navy-950 border border-navy-700 text-white rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone</label>
                  <input required type="text" value={newCand.phone} onChange={e=>setNewCand({...newCand, phone: e.target.value})} className="w-full bg-navy-950 border border-navy-700 text-white rounded-lg p-2 text-xs" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
                Save Candidate to Enterprise CRM
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

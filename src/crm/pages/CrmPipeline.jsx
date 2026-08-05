import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { PIPELINE_STAGES, ASSIGNED_RECRUITERS } from '../data/mockCrmData';
import { 
  GitMerge, User, ArrowRight, CheckCircle2, ChevronRight, Search, Filter, 
  Sparkles, Inbox, UserCheck, Mail, Phone, MapPin, Award, TrendingUp, X, 
  ChevronDown, ChevronUp, Briefcase, Star, ExternalLink, ShieldCheck
} from 'lucide-react';

export const CrmPipeline = () => {
  const { candidates, updateCandidateStage } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All');
  const [showRecruiterDetails, setShowRecruiterDetails] = useState(true);
  const [viewRecruiterModal, setViewRecruiterModal] = useState(null);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRecruiter = selectedRecruiter === 'All' || c.assignedRecruiter === selectedRecruiter;
    return matchesSearch && matchesRecruiter;
  });

  const getRecruiterCandidatesCount = (recruiterName) => {
    return candidates.filter(c => c.assignedRecruiter === recruiterName).length;
  };

  const selectedRecruiterData = ASSIGNED_RECRUITERS.find(r => r.name === selectedRecruiter);

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-[#0f1c3f] dark:via-[#0a132b] dark:to-[#060a17] p-6 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-sm border-l-4 border-l-gold-500">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Kanban Recruitment Workflow</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">18-Stage Enterprise Recruitment Pipeline</h1>
          <p className="text-slate-600 dark:text-slate-300">Track candidates seamlessly from Lead to Joined & Deployment status.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-3.5 py-1.5 rounded-xl shadow-xs">
            {candidates.length} Total Candidates Active in Pipeline
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card bg-white dark:bg-gradient-to-r dark:from-[#101b36] dark:to-[#0a1124] p-4 rounded-2xl border border-slate-200 dark:border-gold-500/30 flex flex-col sm:flex-row justify-between gap-3 shadow-md items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gold-500 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search candidate by name, skills, or candidate ID in pipeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
            <UserCheck className="w-4 h-4 text-gold-500" />
            <select 
              value={selectedRecruiter}
              onChange={(e) => setSelectedRecruiter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-navy-900">All Assigned Recruiters ({ASSIGNED_RECRUITERS.length})</option>
              {ASSIGNED_RECRUITERS.map(rec => (
                <option key={rec.id} value={rec.name} className="bg-white dark:bg-navy-900">
                  {rec.name} ({rec.role})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowRecruiterDetails(!showRecruiterDetails)}
            className="px-3 py-2 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 rounded-xl font-bold hover:bg-gold-500 hover:text-navy-950 transition flex items-center space-x-1 shrink-0"
            title="Toggle Recruiter Showcase Panel"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Details</span>
            {showRecruiterDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Recruiter Showcase & Detailed Info Section */}
      {showRecruiterDetails && (
        <div className="bg-white dark:bg-gradient-to-r dark:from-[#0d162d] dark:via-[#091124] dark:to-[#050a17] p-5 rounded-2xl border border-slate-200 dark:border-gold-500/30 shadow-md space-y-4 animate-in fade-in">
          
          {/* Header row */}
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-gold-500/20 text-gold-500 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  {selectedRecruiter === 'All' ? 'All Assigned Recruiters Directory & Metrics' : `Recruiter Details: ${selectedRecruiter}`}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedRecruiter === 'All' 
                    ? 'Showing full executive recruiter performance, contact details & active assignments' 
                    : `Active pipeline management details for ${selectedRecruiter}`}
                </p>
              </div>
            </div>

            {selectedRecruiter !== 'All' && (
              <button
                onClick={() => setSelectedRecruiter('All')}
                className="text-[11px] text-gold-600 dark:text-gold-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>Reset to All Recruiters</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* If 'All' is selected: Show grid of all recruiters */}
          {selectedRecruiter === 'All' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ASSIGNED_RECRUITERS.map((rec) => {
                const candCount = getRecruiterCandidatesCount(rec.name);
                return (
                  <div 
                    key={rec.id}
                    className="p-4 bg-slate-50 dark:bg-[#070d1e] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-gold-500/60 transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img src={rec.avatar} alt={rec.name} className="w-11 h-11 rounded-full object-cover border-2 border-gold-500" />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-950"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">{rec.name}</h3>
                          <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold truncate">{rec.role}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                            <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                            <span>{rec.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 p-2 bg-slate-100 dark:bg-[#040813] rounded-lg text-[10px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Mail className="w-3 h-3 text-gold-500 shrink-0" />
                          <span className="truncate">{rec.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate">
                          <Phone className="w-3 h-3 text-gold-500 shrink-0" />
                          <span>{rec.phone}</span>
                        </div>
                      </div>

                      {/* Key Performance Stats */}
                      <div className="grid grid-cols-3 gap-1 text-center bg-slate-100 dark:bg-[#091024] p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        <div>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">Active</p>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{candCount}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">Placed</p>
                          <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{rec.totalPlacements}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">SLA Target</p>
                          <p className="font-bold text-xs text-gold-600 dark:text-gold-400">{rec.targetPct}%</p>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1">
                        {rec.specialties.map((spec, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-gold-500/10 text-gold-700 dark:text-gold-300 text-[9px] rounded font-medium border border-gold-500/20">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-1 border-t border-slate-200 dark:border-slate-800 mt-2">
                      <button
                        onClick={() => setSelectedRecruiter(rec.name)}
                        className="flex-1 py-1.5 bg-gold-500 text-navy-950 text-[10px] font-bold rounded-lg hover:opacity-90 transition text-center"
                      >
                        Filter Pipeline
                      </button>
                      <button
                        onClick={() => setViewRecruiterModal(rec)}
                        className="px-2.5 py-1.5 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-lg hover:bg-gold-500 hover:text-navy-950 transition"
                        title="View Full Recruiter Profile"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* If a Specific Recruiter is Selected: Show Detailed Single Card */}
          {selectedRecruiter !== 'All' && selectedRecruiterData && (
            <div className="p-5 bg-slate-50 dark:bg-[#070d1e] rounded-xl border border-gold-500/50 space-y-4 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={selectedRecruiterData.avatar} 
                      alt={selectedRecruiterData.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold-500 shadow-md"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-950"></span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                        {selectedRecruiterData.name}
                      </h3>
                      <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/40">
                        ✓ {selectedRecruiterData.status}
                      </span>
                    </div>
                    <p className="text-gold-600 dark:text-gold-400 font-bold text-xs">{selectedRecruiterData.role}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center space-x-2 mt-0.5">
                      <span><MapPin className="w-3 h-3 inline mr-1 text-gold-500" />{selectedRecruiterData.location}</span>
                      <span>•</span>
                      <span>Rating: <Star className="w-3 h-3 inline text-gold-500 fill-gold-500" /> {selectedRecruiterData.rating}</span>
                    </p>
                  </div>
                </div>

                {/* Direct Contact Links */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <a 
                    href={`mailto:${selectedRecruiterData.email}`} 
                    className="px-3 py-2 bg-slate-200 dark:bg-[#0a1226] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:border-gold-500 flex items-center space-x-1.5 font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold-500" />
                    <span>{selectedRecruiterData.email}</span>
                  </a>
                  <a 
                    href={`tel:${selectedRecruiterData.phone}`} 
                    className="px-3 py-2 bg-slate-200 dark:bg-[#0a1226] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:border-gold-500 flex items-center space-x-1.5 font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-500" />
                    <span>{selectedRecruiterData.phone}</span>
                  </a>
                  <button
                    onClick={() => setViewRecruiterModal(selectedRecruiterData)}
                    className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-90 transition flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Full Profile</span>
                  </button>
                </div>

              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#040814] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[#081024]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Active Candidates</p>
                  <p className="text-base font-serif font-extrabold text-slate-900 dark:text-white">
                    {getRecruiterCandidatesCount(selectedRecruiterData.name)}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[#081024]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Total Placements</p>
                  <p className="text-base font-serif font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedRecruiterData.totalPlacements}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[#081024]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Billed Revenue</p>
                  <p className="text-base font-serif font-extrabold text-gold-600 dark:text-gold-400">
                    ${selectedRecruiterData.revenueUSD.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[#081024]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">SLA Target</p>
                  <p className="text-base font-serif font-extrabold text-purple-600 dark:text-purple-400">
                    {selectedRecruiterData.targetPct}%
                  </p>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Specialties:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecruiterData.specialties.map((spec, idx) => (
                    <span key={idx} className="bg-gold-500/20 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 18-Stage Horizontal Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[3600px]">
          {PIPELINE_STAGES.map((stage, idx) => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);
            
            // Color theme presets for columns in dark mode
            const columnColorStyles = [
              'dark:from-[#0f1d3e] dark:to-[#081126] dark:border-blue-500/40',
              'dark:from-[#1b103b] dark:to-[#0c061d] dark:border-purple-500/40',
              'dark:from-[#09263e] dark:to-[#04111d] dark:border-cyan-500/40',
              'dark:from-[#241a09] dark:to-[#120c04] dark:border-amber-500/40',
              'dark:from-[#082e1c] dark:to-[#03160d] dark:border-emerald-500/40',
            ];
            const columnStyle = columnColorStyles[idx % columnColorStyles.length];

            return (
              <div 
                key={stage.id}
                className={`w-72 bg-white dark:bg-gradient-to-b ${columnStyle} border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shrink-0 min-h-[550px] shadow-lg text-slate-900 dark:text-white`}
              >
                <div>
                  {/* Stage Column Header */}
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${stage.color} shadow-sm`}></span>
                      <h3 className="font-serif font-bold text-slate-900 dark:text-white text-xs tracking-wide">{stage.title}</h3>
                    </div>
                    <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] border border-amber-300 dark:border-gold-500/40">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidates Cards in this Stage */}
                  <div className="space-y-3">
                    {stageCandidates.map((cand) => (
                      <div key={cand.id} className="p-4 bg-slate-50 dark:bg-gradient-to-b dark:from-[#121f3f] dark:to-[#0a1228] rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-md hover:border-gold-500/70 hover:shadow-[0_8px_25px_rgba(212,175,55,0.15)] transition duration-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-extrabold text-slate-900 dark:text-white text-xs">{cand.name}</h4>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">{cand.id} • {cand.nationality}</p>
                          </div>
                          <span className="font-mono text-[10px] text-amber-800 dark:text-gold-400 font-extrabold bg-amber-100 dark:bg-gold-500/20 px-2 py-0.5 rounded border border-amber-300 dark:border-gold-500/40">
                            {cand.score}% Score
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-800 dark:text-slate-200 font-bold">{cand.currentEmployer}</p>
                        
                        <div className="p-2 bg-slate-100 dark:bg-[#060a17] rounded-lg text-[10px] flex justify-between border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Recruiter:</span>
                          <span className="text-slate-900 dark:text-white font-bold">{cand.assignedRecruiter}</span>
                        </div>

                        {/* Quick 1-Click Stage Shift Menu */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 font-extrabold uppercase block">Advance Stage:</span>
                          <div className="flex flex-wrap gap-1">
                            {PIPELINE_STAGES.map(s => (
                              <button
                                key={s.id}
                                onClick={() => updateCandidateStage(cand.id, s.id)}
                                className={`px-1.5 py-0.5 text-[9px] rounded font-bold transition ${
                                  s.id === cand.stage 
                                    ? 'bg-gold-500 text-navy-950 font-extrabold shadow-sm' 
                                    : 'bg-slate-200 dark:bg-[#0c1427] text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-navy-800 border border-slate-300 dark:border-navy-800'
                                }`}
                                title={`Move to ${s.title}`}
                              >
                                {s.title.substring(0, 4)}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}

                    {stageCandidates.length === 0 && (
                      <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl bg-slate-100/80 dark:bg-[#0a1329]/60 shadow-inner space-y-1">
                        <Inbox className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto opacity-70" />
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold italic">
                          No candidates in {stage.title}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruiter Full Profile Modal */}
      {viewRecruiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-[#0c152a] border border-gold-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={viewRecruiterModal.avatar} alt={viewRecruiterModal.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold-500 shadow-md" />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-950"></span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{viewRecruiterModal.name}</h3>
                  <p className="text-gold-600 dark:text-gold-400 font-semibold text-xs">{viewRecruiterModal.role}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gold-500 shrink-0" />
                    <span>{viewRecruiterModal.location}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setViewRecruiterModal(null)} className="text-slate-400 hover:text-gold-500 transition"><X className="w-5 h-5" /></button>
            </div>

            {/* Performance Metric Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-[#060b18] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Placements</p>
                <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{viewRecruiterModal.totalPlacements}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">Billed Revenue</p>
                <p className="font-bold text-sm text-gold-600 dark:text-gold-400">${viewRecruiterModal.revenueUSD.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">SLA Target</p>
                <p className="font-bold text-sm text-purple-600 dark:text-purple-400">{viewRecruiterModal.targetPct}%</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-3 bg-slate-100 dark:bg-[#070e21] rounded-xl space-y-2 border border-slate-200 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">Contact & Credentials</p>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Email:</span>
                <strong className="text-slate-900 dark:text-white">{viewRecruiterModal.email}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Direct Phone:</span>
                <strong className="text-slate-900 dark:text-white">{viewRecruiterModal.phone}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● {viewRecruiterModal.status} (Verified Executive Recruiter)</span>
              </div>
            </div>

            {/* Managed Candidates in Current Pipeline */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Active Managed Candidates in Pipeline:</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {candidates.filter(c => c.assignedRecruiter === viewRecruiterModal.name).map(cand => (
                  <div key={cand.id} className="p-2.5 bg-slate-50 dark:bg-[#070e20] border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{cand.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{cand.id} • {cand.currentEmployer}</p>
                    </div>
                    <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      {cand.stage}
                    </span>
                  </div>
                ))}

                {candidates.filter(c => c.assignedRecruiter === viewRecruiterModal.name).length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No candidates currently assigned in active pipeline.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedRecruiter(viewRecruiterModal.name);
                  setViewRecruiterModal(null);
                }}
                className="px-4 py-2 bg-gold-500 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
              >
                Filter Pipeline to {viewRecruiterModal.name}
              </button>
              <button
                onClick={() => setViewRecruiterModal(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

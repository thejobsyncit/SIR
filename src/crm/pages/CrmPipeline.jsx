import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { PIPELINE_STAGES } from '../data/mockCrmData';
import { GitMerge, User, ArrowRight, CheckCircle2, ChevronRight, Search, Filter, Sparkles, Inbox } from 'lucide-react';

export const CrmPipeline = () => {
  const { candidates, updateCandidateStage } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All');

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRecruiter = selectedRecruiter === 'All' || c.assignedRecruiter === selectedRecruiter;
    return matchesSearch && matchesRecruiter;
  });

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
      <div className="glass-card bg-white dark:bg-gradient-to-r dark:from-[#101b36] dark:to-[#0a1124] p-4 rounded-2xl border border-slate-200 dark:border-gold-500/30 flex flex-col sm:flex-row justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gold-500 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search candidate by name, skills, or candidate ID in pipeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-bold"
          />
        </div>

        <select 
          value={selectedRecruiter}
          onChange={(e) => setSelectedRecruiter(e.target.value)}
          className="bg-slate-100 dark:bg-[#070d1e] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
        >
          <option value="All">All Assigned Recruiters</option>
          <option value="Fatima Al-Zahra">Fatima Al-Zahra</option>
          <option value="Tariq Al-Hashemi">Tariq Al-Hashemi</option>
          <option value="David Sterling">David Sterling</option>
          <option value="Rajesh Kumar">Rajesh Kumar</option>
        </select>
      </div>

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

    </div>
  );
};

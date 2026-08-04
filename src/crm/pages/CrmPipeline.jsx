import React from 'react';
import { useCrm } from '../context/CrmContext';
import { PIPELINE_STAGES } from '../data/mockCrmData';
import { GitMerge, User, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export const CrmPipeline = () => {
  const { candidates, updateCandidateStage } = useCrm();

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Kanban Workflow</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">17-Stage Recruitment Pipeline</h1>
          <p className="text-slate-400">Track candidates seamlessly from Lead to Joined status.</p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[2800px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = candidates.filter(c => c.stage === stage.id);
            return (
              <div 
                key={stage.id}
                className="w-72 glass-card bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col justify-between shrink-0 min-h-[500px]"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-navy-800 pb-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                      <h3 className="font-bold text-white text-xs">{stage.title}</h3>
                    </div>
                    <span className="bg-navy-950 text-gold-400 font-bold px-2 py-0.5 rounded text-[10px]">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Stage Candidates List */}
                  <div className="space-y-3">
                    {stageCandidates.map((cand) => (
                      <div key={cand.id} className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2 shadow-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white">{cand.name}</h4>
                          <span className="font-mono text-[10px] text-gold-400 font-bold">{cand.score}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{cand.currentEmployer} • {cand.nationality}</p>

                        <div className="flex gap-1 pt-1">
                          {PIPELINE_STAGES.slice(0, 5).map(s => (
                            <button
                              key={s.id}
                              onClick={() => updateCandidateStage(cand.id, s.id)}
                              className={`flex-1 h-1.5 rounded-full ${s.id === cand.stage ? 'bg-gold-500' : 'bg-navy-800 hover:bg-navy-700'}`}
                              title={`Move to ${s.title}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    {stageCandidates.length === 0 && (
                      <p className="text-[10px] text-slate-500 italic text-center py-8 border border-dashed border-navy-800 rounded-xl">
                        No candidates in {stage.title} stage
                      </p>
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

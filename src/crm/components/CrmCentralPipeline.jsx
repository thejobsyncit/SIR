import React, { useState, useEffect, useCallback } from 'react';
import { GitMerge, XCircle, PauseCircle, RefreshCw } from 'lucide-react';

const CENTRAL_STAGES = [
  'HR Operations Approved',
  'Interview Pending',
  'Interview Scheduled',
  'Interview Completed',
  'Interview Selected',
  'Placement Coordinator Review',
  'Approved for Company Submission',
  'Submitted to Employer',
  'Employer Interview',
  'Employer Selected',
  'Offer Released',
  'Joining Pending',
  'Successfully Placed'
];

export const CrmCentralPipeline = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedStage, setSelectedStage] = useState('HR Operations Approved');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/interview-placement/candidates');
      const data = await res.json();
      if (res.ok && data.success) {
        setCandidates(data.candidates || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const countForStage = (stage) => candidates.filter((c) => c.pipelineStage === stage).length;
  const stageCandidates = candidates.filter((c) => c.pipelineStage === selectedStage);

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
        <div>
          <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            Module 4 • Central Recruitment Pipeline
          </span>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-gold-500" />
            End-to-End HR → Interview → Placement Pipeline ({candidates.length} Active Records)
          </h3>
        </div>
        <button type="button" onClick={load} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 font-bold flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 13 Pipeline Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {CENTRAL_STAGES.map((stage, idx) => {
          const count = countForStage(stage);
          const isSelected = selectedStage === stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-gold-500 bg-gold-500/15 dark:bg-gold-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 hover:border-gold-500/40'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-extrabold text-slate-400">#{idx + 1}</span>
                <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
              <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 leading-tight">{stage}</p>
            </button>
          );
        })}

        {/* Separate Rejected & On Hold Trackers */}
        <button
          type="button"
          onClick={() => setSelectedStage('On Hold')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            selectedStage === 'On Hold'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/15'
              : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-serif text-lg font-bold text-amber-600">{countForStage('On Hold')}</span>
          </div>
          <p className="font-bold text-[11px]">On Hold</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStage('Rejected')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            selectedStage === 'Rejected'
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15'
              : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-serif text-lg font-bold text-rose-600">{countForStage('Rejected')}</span>
          </div>
          <p className="font-bold text-[11px]">Rejected</p>
        </button>
      </div>

      {/* Selected Stage Candidate List */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
          Stage: {selectedStage} ({stageCandidates.length})
        </h4>
        {stageCandidates.length === 0 ? (
          <p className="text-slate-500 py-3">No candidates currently in &ldquo;{selectedStage}&rdquo;.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stageCandidates.map((c) => (
              <div key={c.candidateId} className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                <p className="text-[11px] text-slate-500">{c.jobTitle} • {c.companyName}</p>
                <p className="text-[10px] text-gold-700 dark:text-gold-400 font-bold mt-1">
                  Int: {c.assignedInterviewerName || 'Unassigned'} • Coord: {c.assignedCoordinatorName || 'Unassigned'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

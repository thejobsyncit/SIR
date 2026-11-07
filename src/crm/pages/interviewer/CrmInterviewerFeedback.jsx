import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  MessageSquare, ThumbsUp, AlertTriangle, FileCheck, 
  Send, Sparkles, CheckCircle2, User, Award 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerFeedback = () => {
  const { setActiveModule } = useCrm();
  const [selectedCandidate, setSelectedCandidate] = useState('CAN-801: Rohan Deshmukh');
  const [feedback, setFeedback] = useState({
    strengths: 'Outstanding depth in multi-region Kubernetes deployments and automated disaster recovery. Demonstrated crisp architectural thinking with zero hesitation on networking failover strategies.',
    concerns: 'Slightly less hands-on with front-end React integrations, but that is expected and not critical for an Enterprise Cloud Architect position.',
    evidence: 'When tasked with designing a system handling 50k requests/second under 100ms latency, he correctly decomposed the service into asynchronous worker pools, used Redis for rate limiting, and calculated memory footprint accurately.',
    recommendationSummary: 'Strong candidate for our Enterprise Infrastructure group. High potential to lead cloud migration roadmaps across Dubai and Singapore clients.'
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`✓ Structured feedback recorded for ${selectedCandidate}. Ready for hiring decision submission.`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #6
              </span>
              <span className="text-[10px] font-mono text-slate-400">QUALITATIVE ASSESSMENT DEBRIEF</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Structured Interview Feedback
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Document strengths, technical concerns, verifiable problem evidence, and qualitative hiring recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-700 dark:text-purple-300">
              ● Peer Review Ready
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
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Candidate:</span>
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

          <span className="text-[11px] font-mono text-slate-400">
            Interview Round: Technical & System Architecture
          </span>
        </div>

        {/* Structured Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Core Strengths & Highlights</h4>
                  <p className="text-[10px] text-slate-400">Notable positive technical & behavioral signals</p>
                </div>
              </div>
              <textarea
                rows="4"
                value={feedback.strengths}
                onChange={e => setFeedback({...feedback, strengths: e.target.value})}
                placeholder="What did the candidate excel at during this session?"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed"
              ></textarea>
            </div>

            {/* Areas of Concern */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Areas of Concern or Gaps</h4>
                  <p className="text-[10px] text-slate-400">Identified weaknesses or knowledge deficiencies</p>
                </div>
              </div>
              <textarea
                rows="4"
                value={feedback.concerns}
                onChange={e => setFeedback({...feedback, concerns: e.target.value})}
                placeholder="What areas require training or present risk for this role?"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed"
              ></textarea>
            </div>

            {/* Observational Evidence */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Verifiable Problem Evidence</h4>
                  <p className="text-[10px] text-slate-400">Specific interview scenario, coding question, or challenge solved</p>
                </div>
              </div>
              <textarea
                rows="4"
                value={feedback.evidence}
                onChange={e => setFeedback({...feedback, evidence: e.target.value})}
                placeholder="Give concrete examples of how candidate approached and resolved questions..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed"
              ></textarea>
            </div>

            {/* Overall Recommendation Summary */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Overall Synthesis & Debrief</h4>
                  <p className="text-[10px] text-slate-400">Final takeaway for Hiring Manager & Committee</p>
                </div>
              </div>
              <textarea
                rows="4"
                value={feedback.recommendationSummary}
                onChange={e => setFeedback({...feedback, recommendationSummary: e.target.value})}
                placeholder="Executive takeaway for the next interview round..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed"
              ></textarea>
            </div>

          </div>

          {/* Form Actions */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-2xl p-4 flex justify-between items-center shadow-xs">
            <span className="text-[11px] text-slate-400">
              Structured feedback will be aggregated into the official candidate hiring packet.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Send className="w-4 h-4" />
                Submit Structured Feedback
              </button>
            </div>
          </div>
        </form>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerFeedback;


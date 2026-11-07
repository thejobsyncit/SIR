import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  CheckSquare, Star, Save, CheckCircle2, User, 
  HelpCircle, Sparkles, AlertCircle, ArrowRight 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerEvaluation = () => {
  const { setActiveModule } = useCrm();
  const [selectedCandidate, setSelectedCandidate] = useState('CAN-801: Rohan Deshmukh');
  const [ratings, setRatings] = useState({
    techDepth: 5,
    systemDesign: 4,
    communication: 4,
    problemSolving: 5,
    culturalFit: 4
  });
  const [notes, setNotes] = useState({
    techDepth: 'Excellent understanding of distributed consensus, Raft algorithm, and zero-downtime rolling upgrades on EKS.',
    systemDesign: 'Designed a clean, partition-tolerant rate limiter using Redis and token bucket algorithm.',
    communication: 'Clear, crisp explanations. Listens patiently before jumping into technical trade-offs.',
    problemSolving: 'Demonstrated proactive thinking when faced with simulated network latency spikes.',
    culturalFit: 'High ownership mentality; demonstrated experience mentoring junior engineers.'
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleScoreChange = (param, val) => {
    setRatings(prev => ({ ...prev, [param]: val }));
  };

  const averageScore = (
    Object.values(ratings).reduce((acc, curr) => acc + curr, 0) / Object.values(ratings).length
  ).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`✓ Evaluation Scorecard (${averageScore} / 5.0) recorded for ${selectedCandidate}. Ready for structured feedback debrief.`);
  };

  const criteriaList = [
    { key: 'techDepth', title: 'Technical Architecture & Coding Depth', desc: 'Core language mastery, concurrency primitives, code cleanliness, and security awareness.' },
    { key: 'systemDesign', title: 'System Design & Distributed Scalability', desc: 'Partition tolerance, caching strategies, horizontal scale, API design, and trade-off analysis.' },
    { key: 'problemSolving', title: 'Analytical Problem-Solving & Edge Cases', desc: 'Structured algorithmic thinking, handling ambiguous constraints, and resilience under pressure.' },
    { key: 'communication', title: 'Communication & Stakeholder Articulation', desc: 'Ability to explain complex technical concepts simply, listen effectively, and justify architectural decisions.' },
    { key: 'culturalFit', title: 'Culture Alignment & Team Leadership', desc: 'Ownership mentality, collaboration ethos, empathy, and readiness to adapt to changing roadmap priorities.' }
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #5
              </span>
              <span className="text-[10px] font-mono text-slate-400">STANDARDIZED EVALUATION FORM</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Candidate Scorecard & Evaluation Form
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Rate technical competency across standardized rubrics, record rubric observations, and calculate objective hiring benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gold-500/15 border border-gold-500/30 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              <span className="font-serif font-black text-sm text-gold-700 dark:text-gold-300">
                Score: {averageScore} / 5.0
              </span>
            </div>
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
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Candidate:</span>
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

          <span className="text-[11px] font-mono text-emerald-600 font-bold">
            Round: System Design & Deep Technical Assessment
          </span>
        </div>

        {/* Evaluation Rubric Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-6">
            
            <div className="divide-y divide-slate-100 dark:divide-navy-800 space-y-6">
              {criteriaList.map((crit, idx) => (
                <div key={crit.key} className={idx > 0 ? "pt-6" : ""}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                        {idx + 1}. {crit.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</p>
                    </div>

                    {/* Star Rating Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-navy-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleScoreChange(crit.key, star)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                            ratings[crit.key] >= star
                              ? 'bg-gold-500 text-navy-950 shadow-xs'
                              : 'bg-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${ratings[crit.key] >= star ? 'fill-navy-950' : ''}`} />
                        </button>
                      ))}
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-gold-400 ml-1.5 mr-1">
                        {ratings[crit.key]}.0
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows="2"
                    value={notes[crit.key]}
                    onChange={e => setNotes({...notes, [crit.key]: e.target.value})}
                    placeholder="Specific observations, technical answers, or trade-offs discussed..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none text-slate-700 dark:text-slate-300"
                  ></textarea>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-navy-800">
              <span className="text-[11px] text-slate-400">
                Evaluation auto-saved as draft in compliance with hiring policy.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast('✓ Draft scorecard saved locally.')}
                  className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  Save & Proceed to Feedback
                </button>
              </div>
            </div>

          </div>
        </form>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerEvaluation;


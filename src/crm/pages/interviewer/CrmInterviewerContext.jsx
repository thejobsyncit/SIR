import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  BookOpen, CheckCircle2, AlertCircle, HelpCircle, 
  Clock, User, Code, FileText, ChevronRight, Sparkles 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerContext = () => {
  const candidates = [
    {
      id: 'CAN-801',
      name: 'Rohan Deshmukh',
      role: 'Senior Cloud Infrastructure Architect',
      experience: '5.5 Years',
      roundsHistory: [
        {
          round: 'Round 1: Screening & Problem Solving',
          interviewer: 'Anand Kumar (Lead Architect)',
          date: 'Nov 04, 2026',
          status: 'Passed (Score: 4.5/5.0)',
          questionsAsked: [
            'Explain how Goroutines and channels prevent race conditions in Go services.',
            'Implement an in-memory LRU Cache with O(1) get and put operations.',
            'Handling split-brain scenarios in distributed consensus (Raft/Paxos).'
          ],
          notes: 'Candidate solved LRU cache in under 20 mins with clean idiomatic Go. Good explanation of locks vs atomic primitives.',
          coverageSummary: 'Coding foundations & basic distributed consensus covered thoroughly.'
        },
        {
          round: 'HR & Cultural Alignment Screening',
          interviewer: 'Priya Lead (HR Lead)',
          date: 'Nov 02, 2026',
          status: 'Passed (Score: 5.0/5.0)',
          questionsAsked: [
            'Why are you looking to transition to global client architecture?',
            'How do you manage disagreements with product leads on tech debt vs feature delivery?',
            'Discussion on notice period and international travel readiness to Dubai/Singapore.'
          ],
          notes: 'Excellent cultural fit. High leadership empathy. Ready to relocate or travel for key project kick-offs.',
          coverageSummary: 'Compensation and cultural motivation verified.'
        }
      ],
      topicsCovered: [
        'LRU Cache in Go',
        'Goroutines / Concurrency',
        'Raft Consensus Basics',
        'Relocation & Travel Readiness',
        'Notice Period Verification'
      ],
      recommendedFocusForNextRound: [
        'Multi-region AWS EKS high-availability architecture',
        'Zero-downtime database schema migration strategies',
        'Cost optimization on multi-cloud Kubernetes clusters',
        'Disaster recovery RTO/RPO trade-offs'
      ]
    },
    {
      id: 'CAN-802',
      name: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      experience: '4.2 Years',
      roundsHistory: [
        {
          round: 'HR & Technical Pre-Screening',
          interviewer: 'Priya Lead (HR Lead)',
          date: 'Nov 03, 2026',
          status: 'Passed (Score: 4.8/5.0)',
          questionsAsked: [
            'Experience leading front-end sub-teams in agile sprints.',
            'Familiarity with SSR and Next.js App router.',
            'Salary expectations and immediate joining availability.'
          ],
          notes: 'Strong communicator. Has 15-day notice period. High energy.',
          coverageSummary: 'HR screening complete.'
        }
      ],
      topicsCovered: [
        'Agile Sprint Leadership',
        'Notice Period (15 Days)',
        'Next.js 14 Basics'
      ],
      recommendedFocusForNextRound: [
        'State management & micro-frontends in React',
        'Node.js stream processing & event loop bottlenecks',
        'PostgreSQL indexing & query tuning'
      ]
    }
  ];

  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #10
              </span>
              <span className="text-[10px] font-mono text-slate-400">ASSESSMENT CONTINUITY & QUESTION DEDUPLICATION</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Previous-Round Context & Assessment History
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Review prior interviewer debriefs, specific technical questions already solved, and avoid duplicate assessment puzzles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-700 dark:text-purple-300">
              ● Context Deduplication Active
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Candidate Selector Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {candidates.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCandidate(c)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-3 shrink-0 cursor-pointer ${
                selectedCandidate.id === c.id
                  ? 'bg-amber-100/70 dark:bg-gold-500/20 text-amber-900 dark:text-gold-300 border-amber-300/60 dark:border-gold-500/30 shadow-xs'
                  : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-[11px]">
                {c.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-serif font-bold text-slate-900 dark:text-white leading-tight">{c.name}</p>
                <span className="text-[10px] text-slate-400 font-mono">{c.role}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Two Column Layout: Round History vs Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Chronological Round History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  Chronological Evaluation Trail for {selectedCandidate.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedCandidate.roundsHistory.length} Previous Rounds
                </span>
              </div>

              <div className="space-y-4">
                {selectedCandidate.roundsHistory.map((rh, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{rh.round}</h4>
                        <p className="text-[10px] text-slate-400">
                          Evaluator: <strong className="text-slate-700 dark:text-slate-300">{rh.interviewer}</strong> • {rh.date}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                        {rh.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Questions Asked in This Round:</p>
                      <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300 text-[11px]">
                        {rh.questionsAsked.map((q, qi) => (
                          <li key={qi}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/50 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{rh.notes}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Deduplication Checklist & Recommended Focus */}
          <div className="space-y-6">
            
            {/* Topics Already Covered */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Already Assessed</h4>
              </div>
              <p className="text-[10px] text-slate-400">Do NOT re-test candidate on these completed topics:</p>

              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.topicsCovered.map((t, ti) => (
                  <span key={ti} className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Questions & Deep-Dive */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Suggested Focus Areas</h4>
              </div>
              <p className="text-[10px] text-slate-400">High-leverage topics recommended for your upcoming session:</p>

              <div className="space-y-2">
                {selectedCandidate.recommendedFocusForNextRound.map((f, fi) => (
                  <div key={fi} className="p-2.5 bg-amber-50/50 dark:bg-navy-950 rounded-xl border border-amber-200/50 dark:border-navy-800 flex items-start gap-2 text-[11px] text-slate-800 dark:text-slate-200">
                    <span className="text-amber-700 dark:text-gold-400 font-bold shrink-0">→</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerContext;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, X, Upload, ArrowRight, RefreshCw } from 'lucide-react';

export const AIResumeAnalyzerModal = () => {
  const { activeModal, setActiveModal, navigateTo } = useApp();
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (activeModal !== 'ai-resume') return null;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeText || 'Senior Project Manager with 8 years experience in Dubai high rise construction.' })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-luxury relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">SIR AI Resume Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">GCC ATS Scoring Engine & Headhunter Skill Extractor</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-liteblue-50 dark:bg-navy-800 border border-liteblue-200 dark:border-navy-700 text-xs text-slate-600 dark:text-slate-300">
              Paste your CV/Resume text below or upload a draft to evaluate your compatibility with top Dubai, Saudi Arabia & European employers.
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 mb-1">
                Paste CV / Resume Text:
              </label>
              <textarea 
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste work experience, skills, qualifications, certifications..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-6 text-center hover:border-gold-500 cursor-pointer transition">
              <Upload className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-navy-900 dark:text-slate-200">Drag & Drop PDF or DOCX Resume</p>
              <p className="text-[10px] text-slate-500">Supports files up to 10MB</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing GCC ATS Compliance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Resume Score & Matching</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-950 text-white border border-gold-500/40">
              <div>
                <p className="text-xs uppercase text-gold-400 font-semibold tracking-wider">Overall ATS Score</p>
                <div className="text-3xl font-serif font-extrabold text-white flex items-baseline gap-2">
                  <span>{result.atsScore}%</span>
                  <span className="text-xs font-sans text-emerald-400 font-semibold">[{result.grade}]</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-gold-500 flex items-center justify-center font-extrabold text-gold-400 text-lg">
                {result.atsScore}
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 p-3 rounded-lg border leading-relaxed">
              {result.summary}
            </p>

            {/* Extracted Skills */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Detected High Impact Skills:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.extractedSkills.map((s, idx) => (
                  <span key={idx} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] px-2.5 py-1 rounded-md font-semibold border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing GCC Keywords */}
            <div>
              <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Recommended Keywords to Add:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((k, idx) => (
                  <span key={idx} className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] px-2.5 py-1 rounded-md font-semibold border border-amber-500/20">
                    + {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-300"
              >
                Analyze Another CV
              </button>
              <button 
                onClick={() => { setActiveModal(null); navigateTo('jobs'); }}
                className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 flex items-center justify-center space-x-1"
              >
                <span>View Matching Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

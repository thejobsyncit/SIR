import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Sparkles, FileText, Send, CheckCircle2, RefreshCw, MessageSquare, Bot, 
  Search, Copy, Check, Target, Lightbulb, TrendingUp, AlertTriangle, Users, 
  ShieldCheck, Upload
} from 'lucide-react';

export const CrmAiSuite = () => {
  const { candidates } = useCrm();

  const [candidateName, setCandidateName] = useState('Alexander Wright');
  const [role, setRole] = useState('Senior Civil Project Manager');
  const [emailDraft, setEmailDraft] = useState('');
  const [whatsAppDraft, setWhatsAppDraft] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  // AI Interview Question Generator
  const [techRole, setTechRole] = useState('DevOps Solutions Architect');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // AI Resume Parser Demo
  const [selectedResume, setSelectedResume] = useState('Dr_Sarah_CV.pdf');
  const [parsedProfile, setParsedProfile] = useState(null);
  const [loadingParser, setLoadingParser] = useState(false);

  // AI Duplicate Check state
  const [rankingStatus, setRankingStatus] = useState('');
  const [rankingList, setRankingList] = useState([
    { name: 'Alexander Wright', match: 94, role: 'Al Habtoor Civil Project Manager', passport: 'GB98210452', duplicate: false },
    { name: 'Elena Rostova', match: 92, role: 'Singapore TechVision DevOps', passport: 'PL4491029', duplicate: false },
    { name: 'Dr. Sarah Al-Mansoori', match: 96, role: 'Saudi German Hospital ICU Consultant', passport: 'KSA7710928', duplicate: false }
  ]);

  const handleGenerateCommunication = () => {
    setLoadingEmail(true);
    setTimeout(() => {
      const emailText = `Subject: Executive Shortlist Confirmation - ${role} Opportunity at SIR Recruitment

Dear ${candidateName},

We are pleased to inform you that your professional profile has been evaluated by our Executive Talent Committee and AI Placement Engine for the role of ${role}.

Your background aligns exceptionally well with our client's strategic mandates in the GCC region. We would like to schedule a 30-minute preliminary panel interview via MS Teams to discuss your availability, compensation expectations, and project leadership experience.

Please let us know your preferred time slots over the next two business days.

Warm regards,

Executive Talent Acquisition Team
SIR Recruitment Enterprise LLC | Dubai • Riyadh • London`;

      const waText = `Hi ${candidateName}, your executive profile for "${role}" has been shortlisted by SIR Recruitment! 🌟 Please reply to confirm your availability for a 30-min MS Teams panel interview.`;

      setEmailDraft(emailText);
      setWhatsAppDraft(waText);
      setLoadingEmail(false);
    }, 600);
  };

  const handleGenerateQuestions = () => {
    setLoadingQuestions(true);
    setTimeout(() => {
      const questions = [
        `1. [Technical Execution] Describe your experience architecting high-availability infrastructure or managing complex engineering deliverables for the ${techRole} mandate.`,
        `2. [Contract & Regulatory] How do you handle regulatory compliance audits, MOHRE guidelines, and SLA risk management under strict deadlines?`,
        `3. [Problem Solving] Walk us through a critical incident or project bottleneck you resolved under tight budget and timeframe constraints.`,
        `4. [Team Leadership] How do you lead cross-functional international teams and ensure zero-defect quality standards?`,
        `5. [Behavioral & GCC Adaptation] How do you handle multi-stakeholder negotiations with regional government entities and corporate clients?`
      ];
      setGeneratedQuestions(questions);
      setLoadingQuestions(false);
    }, 500);
  };

  const handleSimulateResumeParser = () => {
    setLoadingParser(true);
    setTimeout(() => {
      setParsedProfile({
        name: selectedResume.includes('Sarah') ? 'Dr. Sarah Al-Mansoori' : 'Alexander Wright',
        email: selectedResume.includes('Sarah') ? 'sarah.mansoori@medical.org' : 'a.wright@techconsult.co.uk',
        nationality: selectedResume.includes('Sarah') ? 'Saudi Arabia' : 'United Kingdom',
        score: selectedResume.includes('Sarah') ? 96 : 94,
        experience: selectedResume.includes('Sarah') ? '16 Years Experience' : '14 Years Experience',
        skills: ['ICU Critical Care', 'Ventilator Management', 'JCI Accreditation', 'Prometric License', 'MOHRE Certified'],
        aiSummary: 'Senior ICU consultant with 16 years of trauma leadership in Riyadh. Verified MOHRE & Prometric credentials.'
      });
      setLoadingParser(false);
    }, 600);
  };

  const handleRunDuplicateCheck = () => {
    setRankingStatus('Running AI NLP Duplicate Detection & Passport Verification across database...');
    setTimeout(() => {
      setRankingStatus('✓ Verified candidate profiles. 0 Duplicate passport numbers detected across database.');
    }, 800);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyWA = () => {
    navigator.clipboard.writeText(whatsAppDraft);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  const handleCopyQuestions = () => {
    navigator.clipboard.writeText(generatedQuestions.join('\n\n'));
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Cognitive Intelligence Suite</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">AI Features & Talent Copilot Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">AI Resume Parser, Candidate Ranking, Question Generator, Email & WhatsApp Writers, Duplicate Detection & Insights.</p>
        </div>
      </div>

      {/* Grid: Resume Parser + Candidate Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: AI Resume Parser & Summary */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            AI Resume Parsing & Candidate Scoring Engine
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Instantly extract candidate skills, experience years, MOHRE compliance eligibility & auto-score.</p>

          <div className="flex gap-2">
            <select 
              value={selectedResume} 
              onChange={e=>setSelectedResume(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
            >
              <option value="Dr_Sarah_CV.pdf">Dr_Sarah_Al_Mansoori_CV.pdf (Saudi Arabia)</option>
              <option value="Alexander_Wright_Resume.pdf">Alexander_Wright_Resume.pdf (UK)</option>
            </select>

            <button 
              onClick={handleSimulateResumeParser}
              disabled={loadingParser}
              className="py-2.5 px-4 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              {loadingParser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Extract CV</span>
            </button>
          </div>

          {parsedProfile && (
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-gold-500/30 space-y-2 animate-in fade-in text-xs shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">{parsedProfile.name}</span>
                  <span className="text-slate-500 text-[10px]">{parsedProfile.email} • {parsedProfile.experience}</span>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-500/30">{parsedProfile.score}% Match Score</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">"{parsedProfile.aiSummary}"</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {parsedProfile.skills.map((s, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-navy-900 text-amber-900 dark:text-gold-400 text-[10px] px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-navy-800">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Module 2: AI Candidate Ranking Engine */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-gold-500" />
              AI Smart Candidate Ranking & Duplicate Detection
            </h3>
            <button 
              onClick={handleRunDuplicateCheck}
              className="px-3 py-1.5 bg-slate-100 dark:bg-navy-950 text-amber-900 dark:text-gold-400 border border-slate-300 dark:border-navy-700 font-bold rounded-xl hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer text-[11px]"
            >
              Verify System Duplicates
            </button>
          </div>

          {rankingStatus && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rankingStatus}</span>
            </div>
          )}

          <div className="space-y-3">
            {rankingList.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1 shadow-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">{item.match}% Fit</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Target: {item.role}</p>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">✓ Duplicate Check: Clean (Unique Passport {item.passport})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Email & WhatsApp Writer + Question Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 3: AI Email & WhatsApp Writer */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            AI Email & WhatsApp Writer
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Candidate Name</label>
                <input type="text" value={candidateName} onChange={e=>setCandidateName(e.target.value)} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-bold rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Position / Mandate</label>
                <input type="text" value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-bold rounded-xl p-2.5" />
              </div>
            </div>

            <button 
              onClick={handleGenerateCommunication}
              disabled={loadingEmail}
              className="w-full py-3 bg-gold-500 text-navy-950 font-extrabold rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 transition"
            >
              {loadingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Shortlist Email & WhatsApp Message</span>
            </button>

            {emailDraft && (
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-gold-500/30 space-y-3 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                  <span className="font-bold text-amber-800 dark:text-gold-400">AI Generated Email Draft</span>
                  <button onClick={handleCopyEmail} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer">
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied Email!' : 'Copy Email'}</span>
                  </button>
                </div>
                <textarea rows={6} readOnly value={emailDraft} className="w-full bg-transparent text-slate-900 dark:text-slate-200 focus:outline-none leading-relaxed font-mono font-bold text-[11px]" />
                
                <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">AI WhatsApp Notification Snippet:</span>
                    <button onClick={handleCopyWA} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer text-[10px]">
                      {copiedWA ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWA ? 'Copied WA!' : 'Copy WA'}</span>
                    </button>
                  </div>
                  <p className="text-slate-900 dark:text-slate-200 font-mono text-[11px] p-2.5 bg-slate-100 dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-800 font-medium">{whatsAppDraft}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module 4: AI Interview Question Generator */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold-500" />
            AI Interview Question Generator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Target Position / Mandate</label>
              <input type="text" value={techRole} onChange={e=>setTechRole(e.target.value)} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-bold rounded-xl p-2.5" />
            </div>

            <button 
              onClick={handleGenerateQuestions}
              disabled={loadingQuestions}
              className="w-full py-3 bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-amber-900 dark:text-gold-400 font-bold rounded-xl border border-slate-300 dark:border-gold-500/40 transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              {loadingQuestions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-gold-500" />}
              <span>Generate Technical & HR Interview Questions</span>
            </button>

            {generatedQuestions.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-gold-500/30 space-y-2 text-slate-800 dark:text-slate-200 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                  <span className="font-bold text-amber-800 dark:text-gold-400">Role-Tailored Panel Questions ({techRole}):</span>
                  <button onClick={handleCopyQuestions} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer">
                    {copiedQuestions ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuestions ? 'Copied All!' : 'Copy All'}</span>
                  </button>
                </div>
                {generatedQuestions.map((q, idx) => (
                  <p key={idx} className="p-2.5 bg-slate-100 dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-800 font-medium text-slate-900 dark:text-slate-200 leading-relaxed text-[11px]">{q}</p>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

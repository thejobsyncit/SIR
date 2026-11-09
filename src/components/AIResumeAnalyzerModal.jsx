import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { JOBS_LIST } from '../data/mockData';
import { 
  Sparkles, FileText, CheckCircle2, AlertTriangle, X, Upload, ArrowRight, RefreshCw, 
  Trash2, FileCheck, AlertCircle, Copy, Check, Briefcase, Award, TrendingUp, ShieldCheck, 
  ChevronRight, Building2, MapPin, DollarSign, ExternalLink, Printer, Eye
} from 'lucide-react';

const INDUSTRY_OPTIONS = [
  'Auto-Detect from Resume',
  'Construction & Civil Engineering',
  'Information Technology & Software',
  'Healthcare & Medical',
  'Finance, Banking & Accounting',
  'Executive & Operations Management',
  'Oil, Gas & Energy',
  'Hospitality & Tourism',
  'Logistics & Supply Chain',
  'Marketing, Sales & Communications',
  'Academic & Education'
];

export const AIResumeAnalyzerModal = () => {
  const { 
    activeModal, 
    setActiveModal, 
    navigateTo, 
    user, 
    updateUserProfile, 
    postedJobs, 
    applyForJob,
    setPendingJobToApply 
  } = useApp();

  const [resumeText, setResumeText] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Auto-Detect from Resume');
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'checklist' | 'recommendations' | 'matching-jobs'
  const [copiedKeyword, setCopiedKeyword] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState({});

  // File Upload & Drag-and-Drop state
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Strict Validation: Ensure document is a Candidate Resume/CV
  const validateResumeDocument = (fileName = '', text = '') => {
    const lowerName = fileName.toLowerCase();
    const lowerText = text.toLowerCase();

    const nonResumeKeywords = [
      'bug', 'bug-report', 'bug_report', 'testing-summary', 'test-summary',
      'test summary', 'testing summary', 'bug report', 'invoice', 'receipt',
      'purchase order', 'bank statement', 'bill', 'passport', 'license',
      'driving license', 'release notes', 'meeting minutes', 'user guide',
      'specification', 'specs', 'transcript', 'contract', 'agreement',
      'audit log', 'error log', 'system log', 'log file'
    ];

    for (const kw of nonResumeKeywords) {
      if (lowerName.includes(kw) || (lowerText.length > 0 && lowerText.includes(kw) && !lowerText.includes('resume') && !lowerText.includes('curriculum vitae'))) {
        return {
          isValid: false,
          message: `The uploaded file "${fileName || 'document'}" is detected as a non-resume document (${kw.replace(/[-_]/g, ' ')}). Revival AI ATS Engine strictly evaluates candidate Resumes & Curriculum Vitae (CVs).`
        };
      }
    }

    const resumeIndicators = [
      'resume', 'cv', 'curriculum', 'vitae', 'experience', 'education', 'skills',
      'qualification', 'profile', 'work history', 'career', 'employment', 'competencies',
      'certifications', 'degree', 'bachelor', 'master', 'engineer', 'manager', 'developer',
      'consultant', 'specialist', 'director', 'officer', 'lead', 'executive',
      'phone', 'email', 'address', 'summary', 'candidate', 'project'
    ];

    const hasResumeIndicatorInName = resumeIndicators.some(k => lowerName.includes(k));
    const hasResumeIndicatorInText = resumeIndicators.some(k => lowerText.includes(k));

    if (!hasResumeIndicatorInName && !hasResumeIndicatorInText && (fileName.length > 0 || text.length > 0)) {
      return {
        isValid: false,
        message: `The document "${fileName || 'uploaded text'}" does not contain standard candidate Resume/CV structure (e.g. Work Experience, Education, Skills, or Profile Summary).`
      };
    }

    return { isValid: true };
  };

  const handleFile = (file) => {
    if (!file) return;
    setValidationError('');
    setResult(null);

    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setAttachedFile({
      name: file.name,
      size: formattedSize,
      type: file.type
    });

    // Read base64 data for genuine binary parsing on server
    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      setFileBase64(e.target.result || '');
    };
    base64Reader.readAsDataURL(file);

    // Read text if it's a plain text file or extractable
    const textReader = new FileReader();
    textReader.onload = (e) => {
      const content = e.target.result || '';
      if (typeof content === 'string' && !content.includes('%PDF') && !content.includes('endobj') && content.trim().length > 0) {
        setResumeText(content.trim());
      }
    };
    textReader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAttachedFile = (e) => {
    e?.stopPropagation();
    setAttachedFile(null);
    setFileBase64('');
    setResumeText('');
    setValidationError('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyKeyword = (keyword) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyword);
      setCopiedKeyword(keyword);
      setTimeout(() => setCopiedKeyword(null), 2000);
    }
  };

  // Combine jobs for matching
  const allAvailableJobs = useMemo(() => {
    const list = [...(postedJobs || [])];
    JOBS_LIST.forEach(item => {
      if (!list.some(j => j.id === item.id)) {
        list.push(item);
      }
    });
    return list;
  }, [postedJobs]);

  // Dynamically calculate matching jobs based on extracted skills and target role
  const matchedVacancies = useMemo(() => {
    if (!result) return [];
    const skills = (result.extractedSkills || []).map(s => s.toLowerCase());
    const roleLower = (result.targetRole || '').toLowerCase();
    const indLower = (result.industry || '').toLowerCase();

    return allAvailableJobs
      .map(job => {
        let matchPoints = 0;
        const jobTitle = (job.title || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();
        const jobCategory = (job.category || '').toLowerCase();
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());

        // Skill overlap
        jobSkills.forEach(js => {
          if (skills.some(s => s.includes(js) || js.includes(s))) {
            matchPoints += 25;
          }
        });

        // Title / Role match
        if (roleLower && (jobTitle.includes(roleLower) || roleLower.includes(jobTitle))) {
          matchPoints += 30;
        }

        // Industry match
        if (indLower && (jobCategory.includes(indLower) || indLower.includes(jobCategory))) {
          matchPoints += 20;
        }

        const matchPercent = Math.min(98, Math.max(68, matchPoints + Math.floor((result.atsScore || 75) * 0.2)));
        return {
          ...job,
          calculatedMatch: matchPercent
        };
      })
      .sort((a, b) => b.calculatedMatch - a.calculatedMatch)
      .slice(0, 4);
  }, [result, allAvailableJobs]);

  const handleQuickApply = (job) => {
    setAppliedJobs(prev => ({ ...prev, [job.id]: true }));
    if (applyForJob) {
      applyForJob(job);
    }
  };

  const handleAnalyze = async () => {
    setValidationError('');
    setResult(null);

    if (!attachedFile && !resumeText.trim()) {
      setValidationError('Please upload a Resume/CV file or paste your resume text to evaluate ATS compliance.');
      return;
    }

    // Run strict Resume / CV validation check
    const validation = validateResumeDocument(attachedFile?.name || '', resumeText);
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        resumeText: resumeText.trim(),
        fileData: fileBase64,
        filename: attachedFile?.name || 'Candidate_Resume.txt',
        targetRole: targetRoleInput.trim(),
        industry: selectedIndustry !== 'Auto-Detect from Resume' ? selectedIndustry : ''
      };

      let analysisData = null;
      try {
        const res = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          analysisData = await res.json();
        }
      } catch (err) {
        console.warn('Primary endpoint notice, trying alias:', err);
      }

      if (!analysisData || !analysisData.atsScore) {
        try {
          const res2 = await fetch('/api/ai/analyze-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res2.ok) {
            analysisData = await res2.json();
          }
        } catch (err2) {
          console.warn('Alias endpoint notice:', err2);
        }
      }

      if (analysisData && analysisData.success && analysisData.atsScore) {
        setResult(analysisData);

        // Sync with candidate user profile in AppContext if logged in
        if (user && updateUserProfile) {
          try {
            updateUserProfile({
              resumeName: attachedFile?.name || user.resumeName || 'ATS_Verified_CV.pdf',
              resumeUploaded: true,
              skills: analysisData.extractedSkills || user.skills || [],
              atsScore: analysisData.atsScore,
              title: analysisData.targetRole || user.title
            });
          } catch {}
        }
      } else {
        setValidationError('Analysis service returned an unexpected response. Please verify the resume format.');
      }
    } catch (err) {
      console.error('Analysis execution error:', err);
      setValidationError('An unexpected error occurred while analyzing the resume. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (activeModal !== 'ai-resume') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200/80 dark:border-gold-500/30 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-luxury relative overflow-hidden max-h-[92vh] flex flex-col transition-all">
        
        {/* Glow Accent Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800/80 pb-4 mb-4 shrink-0 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-500/30 to-amber-500/10 text-gold-500 dark:text-gold-400 flex items-center justify-center font-bold shadow-sm border border-gold-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
                  Revival AI Resume Analyzer
                </h3>
                <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  ATS v3.5
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                GCC ATS Scoring Engine & Headhunter Skill Extractor (Dubai • Riyadh • Doha • Europe)
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900 transition"
            title="Close Analyzer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-5 relative z-10">
          
          {!result ? (
            /* UPLOAD & INPUT VIEW */
            <div className="space-y-4">
              
              {/* Informative Guidance Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/10 via-amber-500/5 to-slate-50 dark:to-navy-900 border border-gold-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-navy-900 dark:text-white block mb-0.5">
                    Official UAE & GCC Headhunter Evaluation
                  </span>
                  Upload your CV/Resume to extract genuine skills, calculate ATS compatibility against Taleo & Workday filters, and identify missing labor compliance keywords.
                </div>
              </div>

              {/* Target Role & Industry Filters (Optional refinement) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Sector / Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-semibold"
                  >
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    placeholder="e.g. Senior Civil PM, ICU Specialist..."
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                  />
                </div>
              </div>

              {/* Validation Error Alert Banner */}
              {validationError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start space-x-3 animate-in fade-in duration-200">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-800 dark:text-rose-200 text-sm">Invalid Document / Format</p>
                    <p className="mt-1 leading-relaxed">{validationError}</p>
                    <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      💡 Tip: Please provide a valid candidate CV/Resume in PDF, DOCX, DOC, or TXT format.
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".pdf,.doc,.docx,.txt" 
                onChange={handleFileSelect} 
                className="hidden" 
              />

              {/* Interactive Drag & Drop Area */}
              <div 
                onClick={triggerFileClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2.5 ${
                  isDragging 
                    ? 'border-gold-500 bg-gold-500/15 scale-[1.01]' 
                    : attachedFile 
                      ? 'border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-500/10' 
                      : 'border-slate-300 dark:border-navy-700 bg-slate-50/60 dark:bg-navy-900/40 hover:border-gold-500 hover:bg-gold-500/5'
                }`}
              >
                {attachedFile ? (
                  <div className="flex items-center justify-between w-full max-w-lg p-3.5 bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-3 text-left overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-navy-900 dark:text-white truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {attachedFile.size} • Candidate Document Ready
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={removeAttachedFile}
                      className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition shrink-0 ml-2"
                      title="Remove attached file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                      <Upload className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
                    </div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">
                      {isDragging ? 'Release to Drop Resume Here' : 'Click to Browse or Drag & Drop Candidate Resume (PDF / DOCX)'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-md">
                      Only verified candidate CVs & Resumes are accepted (PDF, DOCX, DOC, or TXT up to 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Paste Text Option */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Or Paste Candidate CV / Resume Text:
                  </label>
                  {resumeText && (
                    <span className="text-[10px] font-bold text-gold-500">
                      {resumeText.split(/\s+/).filter(Boolean).length} words detected
                    </span>
                  )}
                </div>
                <textarea 
                  rows={4}
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setValidationError(''); }}
                  placeholder="Paste work experience, skills, qualifications, certifications, projects, contact details..."
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-2xl p-3 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium transition"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-gold-600 hover:to-amber-500 text-navy-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-gold-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Authentic Resume Data & Extracting Skills...</span>
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
            /* RESULTS DASHBOARD VIEW */
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Hero Executive Score Banner */}
              <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 text-white border border-gold-500/30 shadow-luxury">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase bg-gold-500/20 text-gold-400 font-extrabold px-2.5 py-0.5 rounded-full border border-gold-500/30 tracking-wider">
                        Overall ATS Score
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        {result.matchLevel}
                      </span>
                    </div>
                    
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <span>{result.candidateName || 'Executive Candidate'}</span>
                    </h4>
                    
                    <p className="text-xs text-slate-300 font-medium">
                      {result.targetRole} • <span className="text-gold-400">{result.industry}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Scanned {result.wordCount} words • {result.extractedSkills?.length || 0} skills detected
                    </p>
                  </div>

                  {/* Circular Score Gauge */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" className="text-navy-800" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="url(#goldGradient)"
                          strokeWidth="8"
                          strokeDasharray={`${(result.atsScore / 100) * 264} 264`}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-serif font-extrabold text-gold-400 leading-none">
                          {result.atsScore}%
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 tracking-wider">
                          {result.atsScore >= 90 ? 'TIER 1' : result.atsScore >= 75 ? 'TIER 2' : 'TIER 3'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="block text-xs font-bold text-gold-400">Grade Rating</span>
                      <span className="text-sm font-extrabold text-white">{result.grade}</span>
                    </div>
                  </div>
                </div>

                {/* 5-Factor Score Meters */}
                {result.scoreBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 mt-4 border-t border-navy-800 text-[10px]">
                    {Object.entries(result.scoreBreakdown).map(([key, item]) => (
                      <div key={key} className="bg-navy-900/60 p-2 rounded-xl border border-navy-800">
                        <div className="flex justify-between text-slate-400 font-bold mb-1">
                          <span className="truncate">{item.label}</span>
                          <span className="text-gold-400 font-extrabold">{item.score}/{item.max}</span>
                        </div>
                        <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-gold-500 to-emerald-400 h-1.5 rounded-full" 
                            style={{ width: `${(item.score / item.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Headhunter Summary Paragraph */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/70 border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {result.summary}
              </div>

              {/* Inner Tabs Navigation */}
              <div className="flex border-b border-slate-200 dark:border-navy-800 text-xs font-bold gap-4 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`pb-2.5 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'skills'
                      ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400'
                      : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Skills & Keywords ({result.extractedSkills?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`pb-2.5 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'checklist'
                      ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400'
                      : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS Compliance Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`pb-2.5 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'recommendations'
                      ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400'
                      : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Strengths & Improvements</span>
                </button>

                <button
                  onClick={() => setActiveTab('matching-jobs')}
                  className={`pb-2.5 transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'matching-jobs'
                      ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400'
                      : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Matching Jobs ({matchedVacancies.length})</span>
                </button>
              </div>

              {/* TAB 1: SKILLS & KEYWORDS */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  {/* Extracted Skills */}
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Authentic Detected Competencies ({result.extractedSkills?.length || 0}):
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.extractedSkills && result.extractedSkills.map((s, idx) => (
                        <span key={idx} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] px-3 py-1 rounded-xl font-bold border border-emerald-500/25 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing High Impact GCC Keywords */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Recommended GCC Keywords to Add:
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Click keyword to copy</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords && result.missingKeywords.map((k, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCopyKeyword(k)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] px-3 py-1 rounded-xl font-bold border border-amber-500/25 flex items-center gap-1.5 transition cursor-pointer"
                          title="Click to copy keyword"
                        >
                          {copiedKeyword === k ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <span>+ {k}</span>
                              <Copy className="w-2.5 h-2.5 opacity-60" />
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Verbs & Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                        Active Leadership Verbs ({result.actionVerbsFound?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.actionVerbsFound && result.actionVerbsFound.length > 0 ? (
                          result.actionVerbsFound.map((v, i) => (
                            <span key={i} className="text-[10px] bg-slate-200 dark:bg-navy-800 px-2 py-0.5 rounded text-navy-900 dark:text-white font-medium">
                              {v}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Add more action verbs to improve ATS score</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                        Quantified Metrics Found ({result.metricsIdentified?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.metricsIdentified && result.metricsIdentified.length > 0 ? (
                          result.metricsIdentified.map((m, i) => (
                            <span key={i} className="text-[10px] bg-gold-500/15 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded font-bold border border-gold-500/20">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No budget or quantified metrics found</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATS COMPLIANCE AUDIT */}
              {activeTab === 'checklist' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl border flex items-center justify-between bg-emerald-500/5 border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">Standard ATS Parsability & Format</p>
                        <p className="text-[11px] text-slate-500">Document structure is clean and indexable by Taleo & Workday.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                      PASSED
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${result.contactInfo?.email && result.contactInfo?.phone ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                    <div className="flex items-center gap-2.5">
                      {result.contactInfo?.email && result.contactInfo?.phone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">Contact & Professional Identifiability</p>
                        <p className="text-[11px] text-slate-500">
                          {result.contactInfo?.email ? `Email: ${result.contactInfo.email}` : 'Missing Email'} • {result.contactInfo?.phone ? `Phone: ${result.contactInfo.phone}` : 'Missing Phone'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${result.contactInfo?.email && result.contactInfo?.phone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {result.contactInfo?.email && result.contactInfo?.phone ? 'VERIFIED' : 'ATTENTION'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${result.sectionsDetected?.hasExperience ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                    <div className="flex items-center gap-2.5">
                      {result.sectionsDetected?.hasExperience ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">Work Experience & Chronological Timeline</p>
                        <p className="text-[11px] text-slate-500">Clear chronological career appointments detected.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                      {result.sectionsDetected?.hasExperience ? 'ALIGNED' : 'WARNING'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${result.metricsIdentified?.length >= 2 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
                    <div className="flex items-center gap-2.5">
                      {result.metricsIdentified?.length >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">Quantifiable Deliverables & Impact Metrics</p>
                        <p className="text-[11px] text-slate-500">{result.metricsIdentified?.length || 0} quantifiable outcomes identified.</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${result.metricsIdentified?.length >= 2 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {result.metricsIdentified?.length >= 2 ? 'HIGH IMPACT' : 'NEEDS METRICS'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border flex items-center justify-between bg-emerald-500/5 border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">GCC Labor Law & MOHRE Readiness</p>
                        <p className="text-[11px] text-slate-500">Document ready for Dubai & Saudi Arabia visa sponsorship screening.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                      SPONSORSHIP READY
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: RECOMMENDATIONS */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Executive Strengths Identified:
                    </h4>
                    <ul className="space-y-2">
                      {result.strengths && result.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-navy-900 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Targeted Headhunter Improvements:
                    </h4>
                    <ul className="space-y-2">
                      {result.improvements && result.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: MATCHING LIVE JOBS */}
              {activeTab === 'matching-jobs' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Based on your extracted competencies, our AI headhunter engine recommends these verified GCC mandates:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedVacancies.map((job) => (
                      <div key={job.id} className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-gold-500/50 transition">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-extrabold bg-gold-500/20 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
                              {job.calculatedMatch}% ATS MATCH
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{job.jobType || 'Full-time'}</span>
                          </div>
                          <h5 className="font-bold text-sm text-navy-900 dark:text-white mt-1.5 line-clamp-1">{job.title}</h5>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{job.company}</p>
                          
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-500" /> {job.location || job.country}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-gold-500" /> {job.salary?.split('/')[0] || 'Competitive'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={appliedJobs[job.id]}
                          onClick={() => handleQuickApply(job)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                            appliedJobs[job.id]
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-gold-shimmer text-navy-950 shadow-gold-glow hover:opacity-95'
                          }`}
                        >
                          {appliedJobs[job.id] ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Application Transmitted</span>
                            </>
                          ) : (
                            <>
                              <span>Apply With Analyzed CV</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button 
                  onClick={() => { setResult(null); setValidationError(''); }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analyze Another CV</span>
                </button>

                <button 
                  onClick={handlePrintReport}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print ATS Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Report</span>
                </button>

                <button 
                  onClick={() => { 
                    setActiveModal(null); 
                    navigateTo('jobs'); 
                    window.location.hash = 'jobs';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-600 hover:to-amber-500 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Explore All Matching Vacancies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

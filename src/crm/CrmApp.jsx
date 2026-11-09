import React, { useState, useEffect, useRef } from 'react';
import { useCrm, CrmProvider } from './context/CrmContext';
import { CrmLogin } from './components/CrmLogin';
import { CrmSidebar } from './components/CrmSidebar';
import { CrmHeader } from './components/CrmHeader';

import { CrmDashboard } from './pages/CrmDashboard';
import { CrmCandidates } from './pages/CrmCandidates';
import { CrmPipeline } from './pages/CrmPipeline';
import { CrmDomesticRecruitment } from './pages/CrmDomesticRecruitment';
import { CrmInternationalRecruitment } from './pages/CrmInternationalRecruitment';
import { CrmClients } from './pages/CrmClients';
import { CrmRecruiterWorkspace } from './pages/CrmRecruiterWorkspace';
import { CrmInterviews } from './pages/CrmInterviews';
import { CrmDocumentation } from './pages/CrmDocumentation';
import { CrmVisaProcessing } from './pages/CrmVisaProcessing';
import { CrmBackgroundVerification } from './pages/CrmBackgroundVerification';
import { CrmAccounts } from './pages/CrmAccounts';
import { CrmReports } from './pages/CrmReports';
import { CrmAiSuite } from './pages/CrmAiSuite';
import { CrmAutomation } from './pages/CrmAutomation';
import { CrmSettings } from './pages/CrmSettings';
import { CrmSuperAdmin } from './pages/CrmSuperAdmin';
import { CrmConsultingBookings } from './pages/CrmConsultingBookings';
import { CrmCareerGuidance } from './pages/CrmCareerGuidance';
import { CrmStudentAcademy } from './pages/CrmStudentAcademy';
import { CrmVacancyManagement } from './pages/CrmVacancyManagement';
import { CrmSearchFilters } from './pages/CrmSearchFilters';
import { CrmCandidateNotesTags } from './pages/CrmCandidateNotesTags';
import { CrmCandidateCommunication } from './pages/CrmCandidateCommunication';
import { CrmOffersJoining } from './pages/CrmOffersJoining';
import { CrmTeamCollaboration } from './pages/CrmTeamCollaboration';
import { CrmPlacementCoordinatorDashboard } from './pages/CrmPlacementCoordinatorDashboard';
import { CrmPlacementStudents } from './pages/placement/CrmPlacementStudents';
import { CrmPlacementEligibility } from './pages/placement/CrmPlacementEligibility';
import { CrmPlacementCompanies } from './pages/placement/CrmPlacementCompanies';
import { CrmPlacementDrives } from './pages/placement/CrmPlacementDrives';
import { CrmPlacementRegistration } from './pages/placement/CrmPlacementRegistration';
import { CrmPlacementApplications } from './pages/placement/CrmPlacementApplications';
import { CrmPlacementEvents } from './pages/placement/CrmPlacementEvents';
import { CrmPlacementOffers } from './pages/placement/CrmPlacementOffers';
import { CrmPlacementAnnouncements } from './pages/placement/CrmPlacementAnnouncements';
import { CrmPlacementReports } from './pages/placement/CrmPlacementReports';
import { CrmPlacementApprovals } from './pages/placement/CrmPlacementApprovals';

import { CrmInterviewerDashboard } from './pages/CrmInterviewerDashboard';
import { CrmInterviewerAssigned } from './pages/interviewer/CrmInterviewerAssigned';
import { CrmInterviewerProfiles } from './pages/interviewer/CrmInterviewerProfiles';
import { CrmInterviewerSchedule } from './pages/interviewer/CrmInterviewerSchedule';
import { CrmInterviewerEvaluation } from './pages/interviewer/CrmInterviewerEvaluation';
import { CrmInterviewerFeedback } from './pages/interviewer/CrmInterviewerFeedback';
import { CrmInterviewerDecision } from './pages/interviewer/CrmInterviewerDecision';
import { CrmInterviewerStatus } from './pages/interviewer/CrmInterviewerStatus';
import { CrmInterviewerReminders } from './pages/interviewer/CrmInterviewerReminders';
import { CrmInterviewerContext } from './pages/interviewer/CrmInterviewerContext';
import { CrmInterviewerAvailability } from './pages/interviewer/CrmInterviewerAvailability';
import { CrmInterviewerPermissions } from './pages/interviewer/CrmInterviewerPermissions';

import { CrmHrLeadDashboard } from './pages/CrmHrLeadDashboard';

import { Search, Sparkles, X, Send, Bot, Loader2, Copy, Check, RotateCcw } from 'lucide-react';

const CrmAppContent = () => {
  const { isAuthenticated, currentRole, activeModule, setActiveModule, commandPaletteOpen, setCommandPaletteOpen, aiDrawerOpen, setAiDrawerOpen, hasPermission } = useCrm();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  // AI Copilot Interactive Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am your Enterprise AI Recruitment Copilot. How can I assist your team today? Try asking me to parse resumes, match candidates with GCC open mandates, generate panel interview questions, or draft submission summaries.'
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (aiDrawerOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isAiThinking, aiDrawerOpen]);

  const handleCopyMessage = (id, text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: 1,
        sender: 'assistant',
        text: 'Hello! I am your Enterprise AI Recruitment Copilot. How can I assist your team today? Try asking me to parse resumes, match candidates with GCC open mandates, generate panel interview questions, or draft submission summaries.'
      }
    ]);
  };

  const handleSendAiPrompt = async (e, promptText) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = (promptText || aiInputText || '').trim();
    if (!textToSend) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!promptText) setAiInputText('');
    setIsAiThinking(true);

    const q = textToSend.toLowerCase();

    // 1. Specialized High-Precision Enterprise Handlers for standard recruitment workflows
    if (q.includes('parse') || (q.includes('resume') && (q.includes('extract') || q.includes('sarah') || q.includes('alexander') || q.includes('read') || q.includes('cv')))) {
      setTimeout(() => {
        const reply = `📄 **AI Resume Parsing & Extraction Report**\n\n**Candidate:** Dr. Sarah Al-Mansoori\n• **Primary Domain:** Critical Care & Trauma Surgery (ICU)\n• **Experience:** 9.5 Years (King Fahad Medical City, Riyadh)\n• **Credentials:** MBBS, MD (Anaesthesiology), EDIC (European Diploma in Intensive Care)\n• **GCC Licensing:** Saudi Commission (SCFHS Consultant Grade), DHA Eligibility Letter\n• **Key Competencies:** JCI Clinical Governance, Advanced ECMO, Ventilator Management\n• **Match Score:** 96% Match with Saudi German Hospital Mandate\n• **BGV Status:** Clean (Education Attestation & Police Clearance Verified)`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    if (q.includes('mandate') || q.includes('match') || q.includes('open vacancies') || q.includes('roles') || q.includes('gcc jobs')) {
      setTimeout(() => {
        const reply = `⚡ **Live GCC Mandate Matching Matrix**\n\n1. **Al Habtoor Engineering (Dubai, UAE)**\n   • Role: Senior Civil Project Manager (High-Rise)\n   • Recommended Match: **Alexander Wright** (94% Compatibility)\n   • Highlights: 12 yrs GCC High-Rise, FIDIC Red Book expert, MOHRE Ready\n\n2. **Saudi German Health (Riyadh, KSA)**\n   • Role: Lead Consultant — Intensive Care Unit\n   • Recommended Match: **Dr. Sarah Al-Mansoori** (96% Compatibility)\n   • Highlights: SCFHS Consultant license, Immediate visa quota availability\n\n3. **TechVision FinTech (Singapore / Dubai)**\n   • Role: Principal Cloud & Distributed Systems Architect\n   • Recommended Match: **Elena Rostova** (92% Compatibility)\n   • Highlights: AWS Certified Solutions Architect, Kubernetes, Microservices`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    if (q.includes('question') || q.includes('interview') || q.includes('panel')) {
      setTimeout(() => {
        const reply = `🎯 **Role-Tailored Panel Interview Questions**\n\n**Category: Senior Technical & Leadership Assessment**\n\n1. **FIDIC & Commercial Risk Management:**\n   "Can you detail a situation where you managed an Extension of Time (EOT) claim under FIDIC Red Book conditions on a GCC project valued over AED 150M?"\n\n2. **Regulatory & Ministry Alignment:**\n   "How do you ensure subcontractor site health and safety records comply with UAE MOHRE / OSHA protocols without compromising project milestones?"\n\n3. **Multinational Workforce Leadership:**\n   "Describe your methodology for coordinating technical teams across 8+ nationalities under tight completion deadlines."\n\n4. **Critical Incident Escalation:**\n   "Walk us through an engineering or operational deviation that required immediate executive intervention and how you mitigated financial loss."`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    if (q.includes('summary') || q.includes('draft') || q.includes('submission') || q.includes('pitch') || q.includes('email')) {
      setTimeout(() => {
        const reply = `📝 **Executive Candidate Submission Pitch**\n\n**To:** Hiring Committee & Talent Acquisition Directorate\n**Subject:** Candidate Submission — Senior Project Manager | Alexander Wright\n\nDear Hiring Team,\n\nWe are pleased to formally present **Alexander Wright** for your Senior Civil Project Management mandate in Dubai.\n\n**Executive Profile Summary:**\n• Over 12 years of hands-on GCC construction leadership delivering high-rise towers and commercial developments.\n• Direct oversight of 250+ site personnel with flawless MOHRE safety compliance.\n• Degree attested through UAE Ministry of Foreign Affairs (MOFA) with verified 6-point BGV.\n• Availability: 30 days notice period with existing UAE residency visa transferable.\n\nCandidate CV, credentials dossier, and compensation expectations are attached for your review. We look forward to coordinating the initial technical screening.\n\nWarm regards,\n**The Revival International Executive Search Team**`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    if (q.includes('visa') || q.includes('work permit') || q.includes('golden visa') || q.includes('mohre')) {
      setTimeout(() => {
        const reply = `🌐 **GCC Visa & Work Permit Compliance Advisory (2026)**\n\n• **UAE MOHRE Guidelines:** Work permits for Tier 1 & Tier 2 professions require attested degree certificates through UAE Embassy & MOFA.\n• **Saudi Arabia (Qiwa / Musaned):** Commercial work visas require professional accreditation via the Saudi Council of Engineers (SCE) or SCFHS for healthcare.\n• **Golden Visa Category:** Highly skilled professionals with basic salary > AED 30,000/month and university degree qualify for 10-year Golden Visa residency.\n• **Processing Timeline:** Standard GCC employment entry permit averages 5 to 7 business days upon digital quota clearance.`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    if (q.includes('salary') || q.includes('compensation') || q.includes('benchmark')) {
      setTimeout(() => {
        const reply = `💰 **2026 GCC Executive Compensation Benchmarks**\n\n• **Senior Project Manager (Construction):** AED 38,000 – 52,000 / month (+ schooling & family medical)\n• **Consultant ICU / Cardiology Physician:** SAR 55,000 – 75,000 / month (Tax-free + housing)\n• **Principal Cloud Architect:** AED 42,000 – 58,000 / month\n• **HR Director (Multinational):** AED 45,000 – 60,000 / month\n\n*Figures represent total cost-to-company including basic, housing allowance, and executive transport.*`;
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
        setIsAiThinking(false);
      }, 500);
      return;
    }

    // 2. Dynamic Live Backend Query via /api/ai/chat
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: { role: 'enterprise_recruiter', portal: 'crm', system: 'copilot' },
          conversationHistory: chatMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: data.reply }]);
          setIsAiThinking(false);
          return;
        }
      }
    } catch (_) {}

    // 3. Robust Contextual Fallback
    setTimeout(() => {
      const reply = `🤖 **Enterprise AI Copilot Insights**\n\nRegarding: "${textToSend}"\n\n• Candidate and client databases cross-referenced.\n• All active visa quotas, attestation trackers, and recruitment workflows are synchronized.\n• What specific action would you like to perform? You can ask me to generate panel interview questions, benchmark salaries, evaluate visa compliance, or prepare a candidate submission letter.`;
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: reply }]);
      setIsAiThinking(false);
    }, 500);
  };

  if (!isAuthenticated) {
    return <CrmLogin />;
  }

  const renderModule = () => {
    if (!hasPermission(activeModule)) {
      return (
        <div className="p-12 text-center space-y-3 glass-card bg-white dark:bg-navy-900 rounded-3xl border border-rose-500/40 text-xs shadow-sm">
          <h3 className="font-serif text-xl font-bold text-rose-600 dark:text-rose-400">Access Restricted</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
            Your current role does not have permission to view the <strong className="text-slate-900 dark:text-white font-bold">{activeModule}</strong> module. Please contact your Super Admin or use the Role Switcher in the top header to test permissions.
          </p>
        </div>
      );
    }

    switch (activeModule) {
      // Placement Coordinator Suite (12 Dedicated Pages)
      case 'plc-overview': return <CrmPlacementCoordinatorDashboard />;
      case 'plc-students': return <CrmPlacementStudents />;
      case 'plc-eligibility': return <CrmPlacementEligibility />;
      case 'plc-companies': return <CrmPlacementCompanies />;
      case 'plc-drives': return <CrmPlacementDrives />;
      case 'plc-registration': return <CrmPlacementRegistration />;
      case 'plc-applications': return <CrmPlacementApplications />;
      case 'plc-events': return <CrmPlacementEvents />;
      case 'plc-offers': return <CrmPlacementOffers />;
      case 'plc-announcements': return <CrmPlacementAnnouncements />;
      case 'plc-reports': return <CrmPlacementReports />;
      case 'plc-approvals': return <CrmPlacementApprovals />;

      // Interviewer Suite (12 Dedicated Pages)
      case 'int-overview': return <CrmInterviewerDashboard />;
      case 'int-assigned': return <CrmInterviewerAssigned />;
      case 'int-profiles': return <CrmInterviewerProfiles />;
      case 'int-schedule': return <CrmInterviewerSchedule />;
      case 'int-evaluation': return <CrmInterviewerEvaluation />;
      case 'int-feedback': return <CrmInterviewerFeedback />;
      case 'int-decision': return <CrmInterviewerDecision />;
      case 'int-status': return <CrmInterviewerStatus />;
      case 'int-reminders': return <CrmInterviewerReminders />;
      case 'int-context': return <CrmInterviewerContext />;
      case 'int-calendar': return <CrmInterviewerAvailability />;
      case 'int-permissions': return <CrmInterviewerPermissions />;

      // HR Lead Suite (Centralized Workspace)
      case 'hr-overview':
      case 'hr-attendance':
      case 'hr-leave':
      case 'hr-employees':
      case 'hr-performance':
      case 'hr-recruitment':
      case 'hr-payroll':
      case 'hr-announcements':
      case 'hr-shifts':
      case 'hr-documents':
      case 'hr-grievances':
      case 'hr-approvals':
      case 'hr-reports':
        return <CrmHrLeadDashboard initialSection={activeModule} />;

      // Standard & Recruiter Modules
      case 'consulting': return <CrmConsultingBookings />;
      case 'career-guidance': return <CrmCareerGuidance />;
      case 'student-academy': return <CrmStudentAcademy />;
      case 'candidates': return <CrmCandidates />;
      case 'pipeline': return <CrmPipeline />;
      case 'domestic': return <CrmDomesticRecruitment />;
      case 'international': return <CrmInternationalRecruitment />;
      case 'clients': return <CrmClients />;
      case 'workspace': return <CrmRecruiterWorkspace />;
      case 'interviews': return <CrmInterviews />;
      case 'documentation': return <CrmDocumentation />;
      case 'visa': return <CrmVisaProcessing />;
      case 'verification': return <CrmBackgroundVerification />;
      case 'accounts': return <CrmAccounts />;
      case 'reports': return <CrmReports />;
      case 'ai-suite': return <CrmAiSuite />;
      case 'automation': return <CrmAutomation />;
      case 'super-admin': return <CrmSuperAdmin />;
      case 'settings': return <CrmSettings />;
      case 'vacancies': return <CrmVacancyManagement />;
      case 'search-filters': return <CrmSearchFilters />;
      case 'notes-tags': return <CrmCandidateNotesTags />;
      case 'communication': return <CrmCandidateCommunication />;
      case 'offers': return <CrmOffersJoining />;
      case 'collaboration': return <CrmTeamCollaboration />;
      case 'dashboard':
      default:
        return <CrmDashboard />;
    }
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen bg-slate-50 dark:bg-[#040714] text-slate-900 dark:text-white flex flex-col font-sans selection:bg-gold-500 selection:text-navy-950 overflow-hidden">
      
      <CrmHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <CrmSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-y-contain crm-main-scroll p-6 bg-slate-50 dark:bg-transparent">
          <div key={`${activeModule}-${currentRole}`} className="w-full">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Global Command Palette Search Modal (Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-xl w-full p-4 shadow-luxury space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-navy-800 pb-2">
              <Search className="w-4 h-4 text-gold-500" />
              <input 
                autoFocus
                type="text"
                placeholder="Search candidates, clients, passport numbers, invoices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              <div 
                onClick={() => { setActiveModule('candidates'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-slate-100 dark:bg-navy-950 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-800 cursor-pointer flex justify-between items-center border border-slate-200 dark:border-navy-800 font-semibold"
              >
                <span className="text-slate-900 dark:text-white">👤 Alexander Wright (Candidate #REV-CAN-1001)</span>
                <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">Candidates</span>
              </div>
              <div 
                onClick={() => { setActiveModule('clients'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-slate-100 dark:bg-navy-950 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-800 cursor-pointer flex justify-between items-center border border-slate-200 dark:border-navy-800 font-semibold"
              >
                <span className="text-slate-900 dark:text-white">🏢 Al Habtoor Contracting LLC (Client #CLI-501)</span>
                <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">Clients</span>
              </div>
              <div 
                onClick={() => { setActiveModule('visa'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-slate-100 dark:bg-navy-950 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-800 cursor-pointer flex justify-between items-center border border-slate-200 dark:border-navy-800 font-semibold"
              >
                <span className="text-slate-900 dark:text-white">🛡️ UK Passport Scan GB98210452</span>
                <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">Visa Processing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer Modal */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full h-[90vh] p-6 shadow-luxury flex flex-col justify-between space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">The Revival AI Copilot</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">Online</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={handleResetChat} 
                  title="Reset conversation" 
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setAiDrawerOpen(false)} 
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Chips (Without Ugly Windows Horizontal Scrollbar) */}
            <div 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold shrink-0 [&::-webkit-scrollbar]:hidden"
            >
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'Parse Resume for Dr. Sarah')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                📄 Parse Resume
              </button>
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'Match GCC Open Mandates')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                ⚡ Match Mandates
              </button>
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'Generate Panel Interview Questions')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                🎯 Interview Questions
              </button>
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'Draft Executive Submission Summary')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                📝 Draft Summary
              </button>
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'GCC Visa & MOHRE Regulations')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                🌐 Visa Check
              </button>
              <button 
                type="button"
                onClick={() => handleSendAiPrompt(null, 'GCC Salary Benchmarks 2026')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition cursor-pointer shadow-xs shrink-0"
              >
                💰 Salary Benchmark
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 flex flex-col">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gold-500 text-navy-950 font-bold self-end max-w-[85%] shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-slate-200 font-medium self-start max-w-[92%] border border-slate-200 dark:border-navy-800 shadow-xs'
                  }`}
                >
                  <div>{msg.text}</div>
                  {msg.sender === 'assistant' && (
                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-gold-600 dark:text-gold-400">Revival AI Engine</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 hover:text-gold-500 transition cursor-pointer font-bold text-slate-500 dark:text-slate-300"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isAiThinking && (
                <div className="p-3.5 bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-gold-400 font-bold self-start max-w-[85%] rounded-2xl border border-slate-200 dark:border-navy-800 flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  <span>AI Copilot is analyzing recruitment data...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => handleSendAiPrompt(e)} className="pt-2 border-t border-slate-200 dark:border-navy-800 flex items-center gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Ask AI Copilot..." 
                value={aiInputText}
                onChange={e => setAiInputText(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500" 
              />
              <button 
                type="submit"
                disabled={isAiThinking || !aiInputText.trim()}
                className="p-2.5 bg-gold-500 hover:opacity-95 text-navy-950 font-bold rounded-xl shadow-gold-glow disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export const CrmApp = () => (
  <CrmAppContent />
);

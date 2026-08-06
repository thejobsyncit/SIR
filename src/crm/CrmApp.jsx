import React, { useState } from 'react';
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
import { CrmCalendar } from './pages/CrmCalendar';
import { CrmSettings } from './pages/CrmSettings';
import { CrmSuperAdmin } from './pages/CrmSuperAdmin';

import { Search, Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';

const CrmAppContent = () => {
  const { isAuthenticated, activeModule, setActiveModule, commandPaletteOpen, setCommandPaletteOpen, aiDrawerOpen, setAiDrawerOpen, hasPermission } = useCrm();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSendAiPrompt = (e, promptText) => {
    if (e) e.preventDefault();
    const textToSend = promptText || aiInputText;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    if (!promptText) setAiInputText('');
    setIsAiThinking(true);

    setTimeout(() => {
      let aiResponseText = '';
      const query = textToSend.toLowerCase();

      if (query.includes('resume') || query.includes('parse') || query.includes('sarah')) {
        aiResponseText = '📄 AI Resume Extraction Result (Dr. Sarah Al-Mansoori):\n• Match Score: 96% (ICU Consultant Mandate)\n• Experience: 9 Years Trauma Leadership (Riyadh)\n• Skills: ICU Critical Care, Ventilator Mgmt, JCI Accreditation, Prometric License\n• Verification: 6-Point BGV Clear.';
      } else if (query.includes('question') || query.includes('interview') || query.includes('panel')) {
        aiResponseText = '🎯 Role-Tailored Panel Questions Generated:\n1. Describe your experience managing FIDIC Red Book contract disputes.\n2. How do you integrate Primavera P6 baseline schedules with MOHRE labor compliance audits?\n3. Walk us through a major structural design challenge solved under budget constraints.';
      } else if (query.includes('mandate') || query.includes('match') || query.includes('gcc') || query.includes('client')) {
        aiResponseText = '⚡ Active GCC Mandate Match Analysis:\n1. Al Habtoor Contracting (UAE): Alexander Wright — 94% Match\n2. Saudi German Hospital (KSA): Dr. Sarah Al-Mansoori — 96% Match\n3. Singapore TechVision (SG): Elena Rostova — 92% Match';
      } else if (query.includes('summary') || query.includes('draft') || query.includes('submission') || query.includes('email')) {
        aiResponseText = '📝 Executive Candidate Submission Summary:\n\n"Dear Client Hiring Panel,\nWe are pleased to submit Alexander Wright for the Senior Civil Project Manager mandate. Alexander brings 12+ years of GCC high-rise experience, full MOHRE eligibility, and clean BGV clearance."';
      } else {
        aiResponseText = `🤖 AI Analysis for: "${textToSend}"\nAll systems operational. Candidate pipeline verified, 4 visa applications in entry permit stage, and 0 security discrepancies flagged. What specific task would you like me to execute?`;
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'assistant', text: aiResponseText }]);
      setIsAiThinking(false);
    }, 700);
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
      case 'calendar': return <CrmCalendar />;
      case 'super-admin': return <CrmSuperAdmin />;
      case 'settings': return <CrmSettings />;
      case 'dashboard':
      default:
        return <CrmDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040714] text-slate-900 dark:text-white flex flex-col font-sans selection:bg-gold-500 selection:text-navy-950">
      
      <CrmHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex overflow-hidden">
        <CrmSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-transparent">
          {renderModule()}
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
                <span className="text-slate-900 dark:text-white">👤 Alexander Wright (Candidate #SIR-CAN-1001)</span>
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
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">SIR Executive AI Copilot</h3>
              </div>
              <button onClick={() => setAiDrawerOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold shrink-0">
              <button 
                onClick={() => handleSendAiPrompt(null, 'Parse Resume (Dr. Sarah)')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition"
              >
                📄 Parse Resume
              </button>
              <button 
                onClick={() => handleSendAiPrompt(null, 'Match GCC Mandates')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition"
              >
                ⚡ Match Mandates
              </button>
              <button 
                onClick={() => handleSendAiPrompt(null, 'Generate Panel Questions')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition"
              >
                🎯 Interview Questions
              </button>
              <button 
                onClick={() => handleSendAiPrompt(null, 'Draft Submission Summary')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 border border-slate-200 dark:border-navy-800 rounded-lg whitespace-nowrap hover:bg-gold-500 hover:text-navy-950 transition"
              >
                📝 Draft Summary
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1 flex flex-col">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gold-500 text-navy-950 font-bold self-end max-w-[85%] shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-slate-200 font-medium self-start max-w-[90%] border border-slate-200 dark:border-navy-800 shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isAiThinking && (
                <div className="p-3 bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-gold-400 font-bold self-start max-w-[85%] rounded-2xl border border-slate-200 dark:border-navy-800 flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  <span>AI Copilot is analyzing recruitment data...</span>
                </div>
              )}
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
                className="p-2.5 bg-gold-500 hover:opacity-95 text-navy-950 font-bold rounded-xl shadow-gold-glow disabled:opacity-50 transition"
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

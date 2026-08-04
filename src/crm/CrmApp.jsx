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

import { Search, Sparkles, X } from 'lucide-react';

const CrmAppContent = () => {
  const { isAuthenticated, activeModule, setActiveModule, commandPaletteOpen, setCommandPaletteOpen, aiDrawerOpen, setAiDrawerOpen, hasPermission } = useCrm();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) {
    return <CrmLogin />;
  }

  const renderModule = () => {
    if (!hasPermission(activeModule)) {
      return (
        <div className="p-12 text-center space-y-3 glass-card bg-navy-900 rounded-3xl border border-rose-500/40 text-xs">
          <h3 className="font-serif text-xl font-bold text-rose-400">Access Restricted</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Your current role does not have permission to view the <strong className="text-white">{activeModule}</strong> module. Please contact your Super Admin or use the Role Switcher in the top header to test permissions.
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
      case 'settings': return <CrmSettings />;
      case 'dashboard':
      default:
        return <CrmDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col font-sans selection:bg-gold-500 selection:text-navy-950">
      
      <CrmHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex overflow-hidden">
        <CrmSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto p-6 bg-navy-950/95">
          {renderModule()}
        </main>
      </div>

      {/* Global Command Palette Search Modal (Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-navy-900 border border-gold-500/40 rounded-2xl max-w-xl w-full p-4 shadow-luxury space-y-3">
            <div className="flex items-center space-x-2 border-b border-navy-800 pb-2">
              <Search className="w-4 h-4 text-gold-500" />
              <input 
                autoFocus
                type="text"
                placeholder="Search candidates, clients, passport numbers, invoices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              <div 
                onClick={() => { setActiveModule('candidates'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-navy-950 rounded-xl hover:bg-navy-800 cursor-pointer flex justify-between items-center"
              >
                <span>👤 Alexander Wright (Candidate #SIR-CAN-1001)</span>
                <span className="text-[10px] text-gold-400 font-bold">Candidates</span>
              </div>
              <div 
                onClick={() => { setActiveModule('clients'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-navy-950 rounded-xl hover:bg-navy-800 cursor-pointer flex justify-between items-center"
              >
                <span>🏢 Al Habtoor Contracting LLC (Client #CLI-501)</span>
                <span className="text-[10px] text-gold-400 font-bold">Clients</span>
              </div>
              <div 
                onClick={() => { setActiveModule('visa'); setCommandPaletteOpen(false); }}
                className="p-2.5 bg-navy-950 rounded-xl hover:bg-navy-800 cursor-pointer flex justify-between items-center"
              >
                <span>🛡️ UK Passport Scan GB98210452</span>
                <span className="text-[10px] text-gold-400 font-bold">Visa Processing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer Modal */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-navy-900 border border-gold-500/40 rounded-2xl max-w-md w-full h-[90vh] p-6 shadow-luxury flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif text-lg font-bold text-white">SIR Executive AI Copilot</h3>
              </div>
              <button onClick={() => setAiDrawerOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 leading-relaxed">
                Hello! I am your Enterprise AI Recruitment Copilot. I can parse resumes, match candidates with GCC open mandates, generate interview questions, and draft candidate submission summaries.
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800">
              <input type="text" placeholder="Ask AI Copilot..." className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl p-2.5 text-xs" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const CrmApp = () => (
  <CrmProvider>
    <CrmAppContent />
  </CrmProvider>
);

import React, { useState } from 'react';
import { Zap, Bell, Mail, MessageSquare, CheckCircle2, Plus, X, Clock, Play } from 'lucide-react';

export const CrmAutomation = () => {
  const [automations, setAutomations] = useState([
    { id: 1, title: 'Automated Interview Reminder via WhatsApp & Email', trigger: '24 Hours Before Interview Date', action: 'Send Personal Meeting Link to Candidate & Client Panel', status: 'Active', executions: 342 },
    { id: 2, title: 'Passport & Visa Expiry Warning System', trigger: '60 Days Prior to Expiration', action: 'Alert Candidate & Assigned Documentation Executive', status: 'Active', executions: 184 },
    { id: 3, title: 'Payment Due Follow-Up Automation', trigger: '3 Days After Invoice Due Date', action: 'Send Statement to Client Accounts Department', status: 'Active', executions: 92 },
    { id: 4, title: 'Candidate Birthday & Joining Anniversary Wishes', trigger: 'Candidate Birthday Date', action: 'Dispatch Personal Greetings via WhatsApp API', status: 'Active', executions: 512 }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: 'New Candidate Stage Transition Alert',
    trigger: 'Stage Changed to Offer Released',
    action: 'Auto-Generate Employment Contract & WhatsApp Candidate'
  });

  const toggleAutomation = (id) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    const ruleObj = {
      id: Date.now(),
      title: newRule.title,
      trigger: newRule.trigger,
      action: newRule.action,
      status: 'Active',
      executions: 0
    };
    setAutomations([ruleObj, ...automations]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Workflow Engine & Event Dispatcher</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Automations & Triggers Control Center</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure automated emails, WhatsApp alerts, task assignments, and passport expiry rules.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation Rule</span>
        </button>
      </div>

      {/* Active Rules List */}
      <div className="space-y-4">
        {automations.map((a) => (
          <div key={a.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-500/50 transition shadow-sm">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-gold-600 dark:text-gold-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Trigger Event: <strong className="text-slate-900 dark:text-white font-bold">{a.trigger}</strong></p>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Automated Action: <strong className="text-amber-700 dark:text-gold-400 font-bold">{a.action}</strong></p>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">Executions Triggered: {a.executions} times</span>
            </div>

            <button 
              onClick={() => toggleAutomation(a.id)}
              className={`px-4 py-2 rounded-xl font-bold transition text-xs flex items-center gap-1.5 border ${
                a.status === 'Active' 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40' 
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-navy-800'
              }`}
            >
              <span>{a.status === 'Active' ? '✓ Rule Active' : 'Paused'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Create Automation Workflow Rule</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input required type="text" value={newRule.title} onChange={e=>setNewRule({...newRule, title: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Trigger Event</label>
                <input required type="text" value={newRule.trigger} onChange={e=>setNewRule({...newRule, trigger: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Automated Action</label>
                <input required type="text" value={newRule.action} onChange={e=>setNewRule({...newRule, action: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                Activate Workflow Automation Rule
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

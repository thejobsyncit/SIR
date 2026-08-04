import React from 'react';
import { Zap, Bell, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

export const CrmAutomation = () => {
  const automations = [
    { title: 'Automated Interview Reminder via WhatsApp & Email', trigger: '24 Hours Before Interview Date', action: 'Send Personal Meeting Link to Candidate & Client Panel', status: 'Active' },
    { title: 'Passport & Visa Expiry Warning System', trigger: '60 Days Prior to Expiration', action: 'Alert Candidate & Assigned Documentation Executive', status: 'Active' },
    { title: 'Payment Due Follow-Up Automation', trigger: '3 Days After Invoice Due Date', action: 'Send Statement to Client Accounts Department', status: 'Active' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Workflow Engine</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Automations & Triggers</h1>
          <p className="text-slate-400">Configure automated email, WhatsApp alerts, and task dispatch rules.</p>
        </div>
      </div>

      <div className="space-y-4">
        {automations.map((a, idx) => (
          <div key={idx} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-gold-500" />
                <h3 className="font-bold text-white text-sm">{a.title}</h3>
              </div>
              <p className="text-slate-400 text-xs">Trigger: <strong className="text-white">{a.trigger}</strong></p>
              <p className="text-slate-400 text-xs">Action: <strong className="text-gold-400">{a.action}</strong></p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs">
              ✓ {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

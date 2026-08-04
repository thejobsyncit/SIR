import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, FileText } from 'lucide-react';

export const CrmVisaProcessing = () => {
  const visaMilestones = [
    { id: 'VISA-801', candidate: 'Alexander Wright', country: 'UAE', type: 'Work Permit', stage: 'MOHRE Approval Granted', medical: 'Passed DHA', eid: 'Processed' },
    { id: 'VISA-802', candidate: 'Elena Rostova', country: 'Singapore', type: 'Employment Pass', stage: 'IPA Approved by MOM', medical: 'Completed', eid: 'Pending Arrival' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Immigration & Work Permits</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Visa Processing Milestone Tracker</h1>
          <p className="text-slate-400">Track entry permits, medical fitness appointments, embassy submissions, and Emirates ID issuing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visaMilestones.map((item) => (
          <div key={item.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-navy-800 pb-2">
              <h3 className="font-serif text-lg font-bold text-white">{item.candidate}</h3>
              <span className="bg-gold-500/20 text-gold-400 font-bold px-2 py-0.5 rounded">{item.country}</span>
            </div>
            <p className="text-slate-300">Milestone Stage: <strong className="text-emerald-400">{item.stage}</strong></p>
            <div className="p-3 bg-navy-950 rounded-xl flex justify-between text-[11px]">
              <span>Medical: <strong className="text-white">{item.medical}</strong></span>
              <span>Identity/EID: <strong className="text-white">{item.eid}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

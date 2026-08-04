import React from 'react';
import { Globe, ShieldCheck, Plane, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export const CrmInternationalRecruitment = () => {
  const intlOrders = [
    { id: 'INT-901', country: 'Saudi Arabia', employer: 'Saudi German Hospital', position: 'Senior ICU Consultant', visaType: 'Iqama Work Visa', medical: 'Passed GAMCA', pcc: 'Verified', flight: 'Booked SV-821', arrival: 'Riyadh (2026-08-18)' },
    { id: 'INT-902', country: 'Singapore', employer: 'TechVision Int.', position: 'DevOps Solutions Architect', visaType: 'Employment Pass (EP)', medical: 'Completed', pcc: 'Verified', flight: 'Scheduled SQ-421', arrival: 'Changi (2026-08-22)' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Cross-Border Talent Deployment</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">International Recruitment Operations</h1>
          <p className="text-slate-400">Overseas candidate deployment across KSA, Qatar, Oman, Singapore, UK & Germany.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intlOrders.map((item) => (
          <div key={item.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between items-start border-b border-navy-800 pb-2">
              <div>
                <span className="bg-gold-500/20 text-gold-400 font-bold px-2 py-0.5 rounded text-[10px]">{item.country}</span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">{item.position}</h3>
                <p className="text-slate-400 text-[11px]">{item.employer}</p>
              </div>
              <span className="font-mono text-gold-400 font-bold">{item.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-navy-950 rounded-lg"><span className="text-slate-400">Visa Type:</span> <strong className="text-white">{item.visaType}</strong></div>
              <div className="p-2 bg-navy-950 rounded-lg"><span className="text-slate-400">Medical Fitness:</span> <strong className="text-emerald-400">{item.medical}</strong></div>
              <div className="p-2 bg-navy-950 rounded-lg"><span className="text-slate-400">Police Check:</span> <strong className="text-emerald-400">{item.pcc}</strong></div>
              <div className="p-2 bg-navy-950 rounded-lg"><span className="text-slate-400">Flight Booking:</span> <strong className="text-gold-400">{item.flight}</strong></div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Target Arrival: <strong className="text-white">{item.arrival}</strong></span>
              <span className="text-emerald-400 font-bold">✓ Ready for Departure</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

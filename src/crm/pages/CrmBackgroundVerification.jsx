import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const CrmBackgroundVerification = () => {
  const bgvCases = [
    { id: 'BGV-991', candidate: 'Alexander Wright', type: '6-Point Comprehensive Audit', education: 'Verified (Uni of Manchester)', employment: 'Verified (Al Habtoor)', police: 'Clear', status: 'Approved' },
    { id: 'BGV-992', candidate: 'Dr. Sarah Al-Mansoori', type: 'Executive Healthcare Audit', education: 'Verified (King Saud Uni)', employment: 'Verified (King Faisal Hospital)', police: 'Clear', status: 'Approved' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Credential Audits</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Background Verification Hub</h1>
          <p className="text-slate-400">Manage 6-point verification checklists, university attestations, and criminal background clearances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bgvCases.map((item) => (
          <div key={item.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-navy-800 pb-2">
              <h3 className="font-serif text-lg font-bold text-white">{item.candidate}</h3>
              <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">✓ {item.status}</span>
            </div>
            <div className="p-3 bg-navy-950 rounded-xl space-y-1 text-[11px]">
              <p>🎓 <strong>Degree Audit:</strong> {item.education}</p>
              <p>🏢 <strong>Past Employment:</strong> {item.employment}</p>
              <p>🛡️ <strong>Police Clearance:</strong> {item.police}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

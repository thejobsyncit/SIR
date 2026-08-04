import React from 'react';
import { Home, MapPin, Building2, Calendar, CheckCircle2 } from 'lucide-react';

export const CrmDomesticRecruitment = () => {
  const domesticOrders = [
    { id: 'DOM-101', client: 'Al Habtoor Contracting LLC', position: 'Senior MEP Engineer', city: 'Dubai', state: 'Dubai', salary: 'AED 28,000', status: 'Interviewing', joining: '2026-08-20' },
    { id: 'DOM-102', client: 'Emirates Global Aluminium', position: 'Maintenance Supervisor', city: 'Abu Dhabi', state: 'Abu Dhabi', salary: 'AED 22,000', status: 'Offer Released', joining: '2026-08-15' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">UAE Local Market</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Domestic Recruitment Operations</h1>
          <p className="text-slate-400">Manage in-country talent placement across Dubai, Abu Dhabi, Sharjah & Northern Emirates.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy-800 glass-card bg-navy-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-navy-950 text-gold-400 font-serif border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <th className="p-4">Mandate ID</th>
              <th className="p-4">Client Company</th>
              <th className="p-4">Position</th>
              <th className="p-4">Emirate / City</th>
              <th className="p-4">Offered Salary</th>
              <th className="p-4">Interview Status</th>
              <th className="p-4">Target Joining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800 text-slate-300">
            {domesticOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-navy-950/60">
                <td className="p-4 font-mono font-bold text-white">{ord.id}</td>
                <td className="p-4 font-semibold text-white">{ord.client}</td>
                <td className="p-4">{ord.position}</td>
                <td className="p-4">{ord.city}, {ord.state}</td>
                <td className="p-4 font-bold text-emerald-400">{ord.salary}</td>
                <td className="p-4"><span className="bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded font-bold">{ord.status}</span></td>
                <td className="p-4 font-mono">{ord.joining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

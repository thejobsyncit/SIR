import React from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';

export const CrmReports = () => {
  const reportsList = [
    { title: 'Monthly Recruiter Placement & Revenue Performance', format: 'PDF & Excel', desc: 'Breakdown of candidate placements, candidate sources, and revenue per recruiter.' },
    { title: 'Country-Wise Overseas Visa Processing Timeline Audit', format: 'CSV & Excel', desc: 'Average days from interview pass to entry permit issuance across UAE, KSA, Qatar, & Singapore.' },
    { title: 'Executive Client SLA & Outstanding Invoice Aging', format: 'PDF & Excel', desc: 'Corporate accounts aging summary and pending mandate fulfillments.' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Executive Intelligence</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Reports & Export Center</h1>
          <p className="text-slate-400">Generate executive PDF, Excel, and CSV reports for board meetings & audit reviews.</p>
        </div>
      </div>

      <div className="space-y-4">
        {reportsList.map((item, idx) => (
          <div key={idx} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs">{item.desc}</p>
              <span className="text-[10px] text-gold-400 font-bold">Formats: {item.format}</span>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
              <button className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl flex items-center gap-1 shadow-gold-glow">
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

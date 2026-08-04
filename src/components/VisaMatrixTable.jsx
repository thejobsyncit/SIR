import React, { useState } from 'react';
import { Download, Search, Globe, CheckCircle2, ShieldAlert, FileSpreadsheet, FileText } from 'lucide-react';
import { VISA_MATRIX_FULL } from '../data/mockData';

export const VisaMatrixTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const filtered = VISA_MATRIX_FULL.filter(item => {
    const matchesSearch = item.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const handleExportCSV = () => {
    const headers = ['Country', 'Visa Type', 'Key Requirements', 'Age', 'Min Qualification', 'Experience', 'Language', 'Processing Time', 'Avg Cost'];
    const rows = VISA_MATRIX_FULL.map(i => [
      `"${i.country}"`,
      `"${i.visaType}"`,
      `"${i.requirements}"`,
      `"${i.age}"`,
      `"${i.minQualification}"`,
      `"${i.experience}"`,
      `"${i.language}"`,
      `"${i.processingTime}"`,
      `"${i.avgCost}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SIR_Recruitment_Country_Visa_Matrix_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Matrix Controls & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-navy-950 p-4 rounded-2xl border border-navy-800 text-xs">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search visa rules by country, requirement, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
          >
            <option value="All">All 18 Countries</option>
            {VISA_MATRIX_FULL.map(c => (
              <option key={c.country} value={c.country}>{c.country}</option>
            ))}
          </select>
        </div>

        {/* Download Matrix Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl flex items-center space-x-1.5 shadow-gold-glow hover:opacity-95 transition"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800 shadow-luxury">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-navy-900 text-gold-400 font-serif border-b border-navy-800 uppercase tracking-wider text-[11px]">
              <th className="p-4 font-bold">Country</th>
              <th className="p-4 font-bold min-w-[160px]">Common Work Visa</th>
              <th className="p-4 font-bold min-w-[220px]">Key Requirements</th>
              <th className="p-4 font-bold">Eligible Age</th>
              <th className="p-4 font-bold">Min Qualification</th>
              <th className="p-4 font-bold">Experience</th>
              <th className="p-4 font-bold">Language</th>
              <th className="p-4 font-bold">Processing Time</th>
              <th className="p-4 font-bold">Average Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-navy-800 bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-300">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-liteblue-50/50 dark:hover:bg-navy-900/60 transition">
                <td className="p-4 font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gold-500" />
                  <span>{item.country}</span>
                </td>
                <td className="p-4 font-semibold text-navy-800 dark:text-slate-200">
                  {item.visaType}
                </td>
                <td className="p-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.requirements}
                </td>
                <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {item.age}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="bg-slate-100 dark:bg-navy-800 px-2 py-1 rounded text-navy-900 dark:text-gold-400 font-semibold border border-slate-200 dark:border-navy-700">
                    {item.minQualification}
                  </span>
                </td>
                <td className="p-4 font-mono whitespace-nowrap">
                  {item.experience}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {item.language}
                </td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  ⚡ {item.processingTime}
                </td>
                <td className="p-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {item.avgCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-100 dark:bg-navy-900 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Updated as of August 2026. Includes UAE MOHRE, Saudi Iqama, Qatar Work Visa & EU Blue Card frameworks.</span>
        </p>
        <span className="font-bold text-gold-500">Showing {filtered.length} of {VISA_MATRIX_FULL.length} Countries</span>
      </div>

    </div>
  );
};

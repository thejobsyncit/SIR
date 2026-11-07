import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  BarChart3, Download, FileSpreadsheet, FileText, 
  TrendingUp, Award, Building2, Users, Filter, CheckCircle2 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementReports = () => {
  const [selectedBatch, setSelectedBatch] = useState('2026 Batch (Current)');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const departmentStats = [
    { dept: 'Computer Science & Engineering', registered: 180, placed: 168, rate: '93.3%', avgPackage: '8.4 LPA', topPackage: '18.0 AED (~49 LPA)' },
    { dept: 'Information Technology', registered: 95, placed: 86, rate: '90.5%', avgPackage: '7.8 LPA', topPackage: '14.2 LPA' },
    { dept: 'Electronics & Communication', registered: 120, placed: 104, rate: '86.6%', avgPackage: '6.9 LPA', topPackage: '16.0 LPA' },
    { dept: 'Mechanical Engineering', registered: 85, placed: 69, rate: '81.1%', avgPackage: '5.8 LPA', topPackage: '11.5 LPA' },
    { dept: 'Civil Engineering', registered: 60, placed: 48, rate: '80.0%', avgPackage: '5.4 LPA', topPackage: '18.0 AED (~49 LPA)' }
  ];

  const companyStats = [
    { company: 'TechVision International', hires: 38, avgCtc: '9,500 SGD (~6.2L/mo)', roleType: 'Cloud & AI Engineering', sector: 'IT Services / Global' },
    { company: 'Al Habtoor Contracting LLC', hires: 14, avgCtc: '18,000 AED (~4.1L/mo)', roleType: 'Infrastructure & Site Project', sector: 'Civil Engineering / Middle East' },
    { company: 'L&T Construction', hires: 26, avgCtc: '11.50 LPA', roleType: 'Graduate Engineer Trainee', sector: 'Core Engineering' },
    { company: 'Cognizant Technology Solutions', hires: 64, avgCtc: '6.50 LPA', roleType: 'Programmer Analyst Trainee', sector: 'IT Consulting' },
    { company: 'Tata Consultancy Services', hires: 78, avgCtc: '7.20 LPA', roleType: 'Digital Innovator', sector: 'Technology' }
  ];

  const handleExport = (type) => {
    showToast(`✓ Preparing ${type} export for ${selectedBatch}... download will begin in a moment.`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #11
              </span>
              <span className="text-[10px] font-mono text-slate-400">EXECUTIVE ANALYTICS & COMPLIANCE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Reports and Placement Statistics
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Generate department-wise, batch-wise, company-wise conversion analytics, and audit-ready accreditation reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExport('CSV')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('PDF')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Board PDF
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Overall Placement Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">88.4%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ 475 of 540 Eligible Placed</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Average Salary CTC</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">7.8 LPA</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ +18.4% vs Previous Year</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Global Corporate Partners</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">48 Companies</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ 12 International Multi-Nationals</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Multiple Offer Holders</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">134 Students</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Holding 2 or more formal offers</span>
          </div>
        </div>

        {/* Department-wise Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
            <div>
              <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Departmental Placement Conversion</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Academic Year 2025-2026 Graduating Cohort</p>
            </div>
            <select 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold"
            >
              <option>2026 Batch (Current)</option>
              <option>2025 Batch (Completed)</option>
              <option>2024 Batch (Archive)</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Academic Department</th>
                  <th className="p-4 font-bold text-center">Registered</th>
                  <th className="p-4 font-bold text-center">Placed</th>
                  <th className="p-4 font-bold text-center">Conversion Ratio</th>
                  <th className="p-4 font-bold text-center">Average Package</th>
                  <th className="p-4 font-bold text-right">Highest CTC Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {departmentStats.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {d.dept}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400">
                      {d.registered}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600">
                      {d.placed}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{d.rate}</span>
                        <div className="w-20 bg-slate-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-gold-500 h-full rounded-full" 
                            style={{ width: d.rate }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {d.avgPackage}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {d.topPackage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Company-wise Hiring Matrix */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Top Recruiting Employers & Volume</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Employer Name</th>
                  <th className="p-4 font-bold">Industry Sector</th>
                  <th className="p-4 font-bold">Designation Offered</th>
                  <th className="p-4 font-bold text-center">Offers Issued</th>
                  <th className="p-4 font-bold text-right">Compensation Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {companyStats.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {c.company}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {c.sector}
                    </td>
                    <td className="p-4 text-amber-700 dark:text-gold-400 font-semibold">
                      {c.roleType}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 font-mono">
                        {c.hires} Hires
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {c.avgCtc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmPlacementReports;


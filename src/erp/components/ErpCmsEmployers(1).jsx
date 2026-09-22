import React from 'react';
import { Building2, Globe, Eye, Edit, Trash2 } from 'lucide-react';

export const ErpCmsEmployers = () => {
  const employers = [
    { id: 'EMP-001', name: 'Al Habtoor Group', industry: 'Construction', jobs: 5, status: 'Premium' },
    { id: 'EMP-002', name: 'Emirates NBD', industry: 'Banking', jobs: 2, status: 'Active' },
    { id: 'EMP-003', name: 'Etisalat', industry: 'Telecommunications', jobs: 8, status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Registered Employers</h2>
        <button className="bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-bold px-4 py-2 rounded-xl text-sm shadow-glass-gold hover:shadow-gold-glow transition">
          + Add Employer
        </button>
      </div>
      
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 font-bold">Company Name</th>
                <th className="p-4 font-bold">Industry</th>
                <th className="p-4 font-bold">Active Jobs</th>
                <th className="p-4 font-bold">Plan/Status</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {employers.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors">{emp.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{emp.industry}</td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-bold">{emp.jobs}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === 'Premium' ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Globe className="w-4 h-4" /></button>
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-gold-500 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

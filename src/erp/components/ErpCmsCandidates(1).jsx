import React from 'react';
import { User, FileText, Download, Eye, ShieldCheck, Star } from 'lucide-react';

export const ErpCmsCandidates = () => {
  const candidates = [
    { id: 'CAN-802', name: 'Alexander Wright', email: 'alex@example.com', role: 'Project Manager', status: 'Verified', rating: 4.8 },
    { id: 'CAN-803', name: 'Sarah Connor', email: 'sarah@example.com', role: 'Software Engineer', status: 'Pending Verification', rating: 4.2 },
    { id: 'CAN-804', name: 'John Doe', email: 'john@example.com', role: 'Financial Analyst', status: 'Verified', rating: 4.5 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Candidate Database</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search candidates..." className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-gold-500" />
          <button className="bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-700 transition">Filter</button>
        </div>
      </div>
      
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 font-bold">Candidate Info</th>
                <th className="p-4 font-bold">Role Applied For</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Rating</th>
                <th className="p-4 font-bold">Resume</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {candidates.map(can => (
                <tr key={can.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors">{can.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{can.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{can.role}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                      can.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {can.status === 'Verified' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {can.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-gold-500 font-bold text-sm">
                      <Star className="w-4 h-4 fill-gold-500" /> {can.rating}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                      <FileText className="w-4 h-4" /> View
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-gold-500 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
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

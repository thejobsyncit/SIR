import React from 'react';
import { Briefcase, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const ErpCmsJobs = () => {
  const jobs = [
    { id: 'JOB-201', title: 'Senior Civil Engineer', company: 'Al Habtoor Group', status: 'Active', applications: 24 },
    { id: 'JOB-202', title: 'Finance Director', company: 'Emirates NBD', status: 'Active', applications: 12 },
    { id: 'JOB-203', title: 'IT Project Manager', company: 'Etisalat', status: 'Closed', applications: 45 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Jobs Pipeline Management</h2>
        <button className="bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-bold px-4 py-2 rounded-xl text-sm shadow-glass-gold hover:shadow-gold-glow transition">
          + Post New Job
        </button>
      </div>
      
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 font-bold">Job ID & Title</th>
                <th className="p-4 font-bold">Company</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Applications</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-gold-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition-colors">{job.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{job.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{job.company}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-bold">{job.applications}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
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

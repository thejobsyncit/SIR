import React from 'react';
import { Mail, MessageSquare, ExternalLink, Reply } from 'lucide-react';

export const ErpCmsInquiries = () => {
  const inquiries = [
    { id: 'INQ-1042', name: 'James Wilson', email: 'james.w@example.com', subject: 'Corporate Hiring Plan', date: '2 hours ago', status: 'Unread' },
    { id: 'INQ-1041', name: 'Fatima Al Zahra', email: 'fatima@example.ae', subject: 'Visa Processing Query', date: '5 hours ago', status: 'Read' },
    { id: 'INQ-1040', name: 'Tech Solutions LLC', email: 'hr@techsolutions.com', subject: 'Partnership Inquiry', date: '1 day ago', status: 'Replied' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Contact & Enquiries Inbox</h2>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 transition">Mark all as read</button>
        </div>
      </div>
      
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 font-bold">Sender</th>
                <th className="p-4 font-bold">Subject</th>
                <th className="p-4 font-bold">Date Received</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {inquiries.map(inq => (
                <tr key={inq.id} className={`transition-colors group ${inq.status === 'Unread' ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-navy-800/50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-navy-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {inq.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm ${inq.status === 'Unread' ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{inq.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {inq.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 text-sm ${inq.status === 'Unread' ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                    {inq.subject}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{inq.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inq.status === 'Unread' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 
                      inq.status === 'Replied' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
                      'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-700'
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-navy-950"><MessageSquare className="w-4 h-4" /></button>
                      <button className="p-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-gold-500 rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-navy-950"><Reply className="w-4 h-4" /></button>
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

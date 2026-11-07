import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Bell, Send, Users, CheckCircle2, AlertTriangle, 
  Clock, Filter, Search, Megaphone, Mail, MessageSquare, Plus 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ANN-101',
      title: 'TechVision International: Mandatory Pre-Placement Talk Tomorrow at 10 AM',
      category: 'Campus Drive',
      priority: 'Urgent',
      audience: 'B.Tech CSE & IT (2026 Batch, CGPA >= 7.5)',
      recipientsCount: 142,
      deliveryChannels: ['Email', 'Portal Notification', 'SMS'],
      postedDate: '2026-11-06 09:30 AM',
      readCount: 128,
      status: 'Active'
    },
    {
      id: 'ANN-102',
      title: 'L&T Construction Online Aptitude Test Link & Guidelines',
      category: 'Assessment',
      priority: 'High',
      audience: 'B.Tech Civil & Mechanical (2026 Batch)',
      recipientsCount: 96,
      deliveryChannels: ['Email', 'Portal Notification'],
      postedDate: '2026-11-05 04:15 PM',
      readCount: 91,
      status: 'Active'
    },
    {
      id: 'ANN-103',
      title: 'Resume Correction Window Closes Tonight at 11:59 PM',
      category: 'Deadline Alert',
      priority: 'Urgent',
      audience: 'All Registered Students (2026 Batch)',
      recipientsCount: 420,
      deliveryChannels: ['WhatsApp Group', 'Email', 'Portal Notification'],
      postedDate: '2026-11-05 11:00 AM',
      readCount: 395,
      status: 'Expiring Soon'
    },
    {
      id: 'ANN-104',
      title: 'Accredited Soft Skills Workshop & Mock Group Discussion Series',
      category: 'Training',
      priority: 'Normal',
      audience: 'All Unplaced Final Year Students',
      recipientsCount: 180,
      deliveryChannels: ['Portal Notification'],
      postedDate: '2026-11-03 02:00 PM',
      readCount: 165,
      status: 'Archived'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'Campus Drive',
    priority: 'Urgent',
    audience: 'B.Tech CSE & IT (2026 Batch)',
    message: ''
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    const item = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      title: newNotice.title,
      category: newNotice.category,
      priority: newNotice.priority,
      audience: newNotice.audience,
      recipientsCount: 145,
      deliveryChannels: ['Email', 'Portal Notification'],
      postedDate: 'Just now',
      readCount: 0,
      status: 'Active'
    };
    setAnnouncements([item, ...announcements]);
    setIsModalOpen(false);
    setNewNotice({ title: '', category: 'Campus Drive', priority: 'Urgent', audience: 'B.Tech CSE & IT (2026 Batch)', message: '' });
    showToast('✓ Placement circular broadcasted successfully across student portals & email alerts.');
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #10
              </span>
              <span className="text-[10px] font-mono text-slate-400">COMMUNICATION DISPATCH ENGINE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Announcements and Notifications
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Share official placement circulars, drive schedules, deadlines, instructions, and instant alerts with targeted batches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Broadcast Circular
            </button>
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Push Notification Active
            </span>
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Circulars Issued</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{announcements.length}</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Active Fall 2026 Season</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Average Read Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">94.2%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Highest Student Engagement</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Urgent Broadcasts</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">2</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Require Immediate Acknowledgement</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Channels Dispatched</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">3 Multi-channel</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Email • SMS • Student Portal</span>
          </div>
        </div>

        {/* Announcements List Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 flex justify-between items-center bg-slate-50/50 dark:bg-navy-950/50">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Active Notices & Circulars</span>
            <span className="text-xs text-slate-500">Showing {announcements.length} broadcasts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Circular Subject</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Priority</th>
                  <th className="p-4 font-bold">Targeted Student Cohort</th>
                  <th className="p-4 font-bold text-center">Broadcast Time</th>
                  <th className="p-4 font-bold text-center">Audience Reach</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {announcements.map(ann => (
                  <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4 max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">{ann.id}</span>
                        <div className="flex gap-1">
                          {ann.deliveryChannels.map((c, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 dark:bg-navy-800 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        {ann.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ann.priority === 'Urgent' 
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200' 
                          : ann.priority === 'High'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                      }`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                      {ann.audience}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-500">
                      {ann.postedDate}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ann.readCount} / {ann.recipientsCount}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {Math.round((ann.readCount / ann.recipientsCount) * 100)}% read
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ann.status === 'Active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                          : ann.status === 'Expiring Soon'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-500'
                      }`}>
                        {ann.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for creating announcement */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Broadcast Placement Circular</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Circular Headline</label>
                  <input 
                    type="text" 
                    required 
                    value={newNotice.title} 
                    onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                    placeholder="e.g., Google India Final Shortlist & GD Schedule"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                    <select 
                      value={newNotice.category} 
                      onChange={e => setNewNotice({...newNotice, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs"
                    >
                      <option>Campus Drive</option>
                      <option>Assessment</option>
                      <option>Deadline Alert</option>
                      <option>Training</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Priority</label>
                    <select 
                      value={newNotice.priority} 
                      onChange={e => setNewNotice({...newNotice, priority: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs"
                    >
                      <option>Urgent</option>
                      <option>High</option>
                      <option>Normal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Audience</label>
                  <input 
                    type="text" 
                    value={newNotice.audience} 
                    onChange={e => setNewNotice({...newNotice, audience: e.target.value})}
                    placeholder="e.g. B.Tech All Branches (2026 Batch)"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Details</label>
                  <textarea 
                    rows="3" 
                    value={newNotice.message} 
                    onChange={e => setNewNotice({...newNotice, message: e.target.value})}
                    placeholder="Instructions, reporting venue, dress code, required documents..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-600 cursor-pointer"
                  >
                    Send Instant Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

export default CrmPlacementAnnouncements;


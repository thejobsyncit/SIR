import React, { useState } from 'react';
import { Home, MapPin, Building2, Calendar, CheckCircle2, Plus, Search, Filter, X } from 'lucide-react';

export const CrmDomesticRecruitment = () => {
  const [domesticOrders, setDomesticOrders] = useState([
    { id: 'DOM-101', client: 'Al Habtoor Contracting LLC', position: 'Senior MEP Engineer', city: 'Dubai', state: 'Emirate of Dubai', salary: 'AED 28,000', followup: '2026-08-05', interviewStatus: 'Scheduled', offerStatus: 'Pending Final Interview', joining: '2026-08-20' },
    { id: 'DOM-102', client: 'Emirates Global Aluminium', position: 'Maintenance Supervisor', city: 'Abu Dhabi', state: 'Emirate of Abu Dhabi', salary: 'AED 22,000', followup: '2026-08-04', interviewStatus: 'Passed', offerStatus: 'Offer Released', joining: '2026-08-15' },
    { id: 'DOM-103', client: 'Sharjah National Oil Company', position: 'HSE Safety Auditor', city: 'Sharjah', state: 'Emirate of Sharjah', salary: 'AED 19,500', followup: '2026-08-06', interviewStatus: 'Screening', offerStatus: 'Under Review', joining: '2026-09-01' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client: 'Al Habtoor Contracting LLC',
    position: '',
    city: 'Dubai',
    state: 'Dubai',
    salary: 'AED 25,000',
    joining: '2026-08-30'
  });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const orderObj = {
      ...newOrder,
      id: 'DOM-' + Math.floor(100 + Math.random() * 900),
      followup: new Date().toISOString().split('T')[0],
      interviewStatus: 'Screening',
      offerStatus: 'Draft'
    };
    setDomesticOrders([orderObj, ...domesticOrders]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">UAE Local Talent Operations</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Domestic Recruitment Module</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage in-country talent placement across Dubai, Abu Dhabi, Sharjah & Northern Emirates.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Domestic Mandate</span>
        </button>
      </div>

      {/* Domestic Mandates Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800 glass-card bg-white dark:bg-navy-900 shadow-luxury">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif border-b border-slate-200 dark:border-navy-800 uppercase tracking-wider text-[10px]">
              <th className="p-4 font-bold">Mandate ID</th>
              <th className="p-4 font-bold">Client Company</th>
              <th className="p-4 font-bold">Position</th>
              <th className="p-4 font-bold">State / City</th>
              <th className="p-4 font-bold">Offered Salary</th>
              <th className="p-4 font-bold">Follow-up Date</th>
              <th className="p-4 font-bold">Interview Status</th>
              <th className="p-4 font-bold">Offer Status</th>
              <th className="p-4 font-bold">Joining Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
            {domesticOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{ord.id}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{ord.client}</td>
                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{ord.position}</td>
                <td className="p-4 text-slate-700 dark:text-slate-300">{ord.city}, <span className="text-slate-500 dark:text-slate-400">{ord.state}</span></td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{ord.salary}</td>
                <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{ord.followup}</td>
                <td className="p-4"><span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 px-2 py-0.5 rounded font-bold text-[10px] border border-amber-300 dark:border-gold-500/30">{ord.interviewStatus}</span></td>
                <td className="p-4"><span className="bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 px-2 py-0.5 rounded font-bold text-[10px] border border-purple-300 dark:border-purple-500/30">{ord.offerStatus}</span></td>
                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{ord.joining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Domestic Mandate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Create Domestic Hiring Mandate</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Position Title</label>
                <input required type="text" value={newOrder.position} onChange={e=>setNewOrder({...newOrder, position: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input required type="text" value={newOrder.city} onChange={e=>setNewOrder({...newOrder, city: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">State / Emirate</label>
                  <input required type="text" value={newOrder.state} onChange={e=>setNewOrder({...newOrder, state: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                Save Domestic Hiring Mandate
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Building2, Phone, Mail, MessageSquare, Plus, FileText, CheckCircle2 } from 'lucide-react';

export const CrmClients = () => {
  const { clients } = useCrm();

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Corporate Accounts</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Client Company Directory</h1>
          <p className="text-slate-400">Manage enterprise employer SLAs, active mandates, and communication timelines.</p>
        </div>
        <button className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
          + Add New Client Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((cli) => (
          <div key={cli.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-navy-800 pb-3">
              <div>
                <span className="text-xl font-bold">{cli.logo}</span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">{cli.company}</h3>
                <p className="text-slate-400 text-[11px]">{cli.industry} • {cli.country}</p>
              </div>
              <span className="bg-gold-500/20 text-gold-400 font-bold px-2.5 py-1 rounded text-[10px]">{cli.agreementStatus}</span>
            </div>

            <div className="p-3 bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
              <p><strong className="text-slate-400">Key Contact:</strong> <span className="text-white">{cli.contactPerson} ({cli.designation})</span></p>
              <p><strong className="text-slate-400">Email:</strong> <span className="text-slate-300">{cli.email}</span></p>
              <p><strong className="text-slate-400">Phone:</strong> <span className="text-slate-300">{cli.phone}</span></p>
            </div>

            <div className="flex justify-between text-xs pt-1">
              <div><p className="text-[10px] text-slate-400">Active Mandates</p><p className="font-bold text-white">{cli.activeMandates} Open Roles</p></div>
              <div><p className="text-[10px] text-slate-400">Total Placements</p><p className="font-bold text-gold-400">{cli.totalPlacements} Placed</p></div>
              <div><p className="text-[10px] text-slate-400">Pending Invoices</p><p className="font-bold text-emerald-400">${cli.pendingInvoiceUSD.toLocaleString()} USD</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

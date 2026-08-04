import React from 'react';
import { useCrm } from '../context/CrmContext';
import { CreditCard, DollarSign, FileSpreadsheet, Plus, CheckCircle2, Clock } from 'lucide-react';

export const CrmAccounts = () => {
  const { invoices } = useCrm();

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Finance & Billing</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Accounts & Revenue Management</h1>
          <p className="text-slate-400">Generate executive tax invoices, track GST/VAT bills, and monitor corporate client dues.</p>
        </div>
        <button className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
          + Generate New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoices.map((inv) => (
          <div key={inv.id} className="glass-card bg-navy-900 border border-navy-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-navy-800 pb-3">
              <div>
                <span className="font-mono text-gold-400 font-bold">{inv.id}</span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">{inv.client}</h3>
                <p className="text-slate-400 text-[11px]">{inv.service}</p>
              </div>
              <span className={`px-2.5 py-1 rounded font-bold ${inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {inv.status}
              </span>
            </div>

            <div className="p-3 bg-navy-950 rounded-xl space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Base Amount:</span> <strong className="text-white">${inv.amountUSD.toLocaleString()} USD</strong></div>
              <div className="flex justify-between"><span>VAT / Tax (5%):</span> <strong className="text-white">${inv.vatAmountUSD.toLocaleString()} USD</strong></div>
              <div className="flex justify-between border-t border-navy-800 pt-1 text-sm"><span className="font-bold">Total Payable:</span> <strong className="text-gold-400 font-extrabold">${inv.totalUSD.toLocaleString()} USD</strong></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Candidate Placed: <strong className="text-white">{inv.candidatePlaced}</strong></span>
              <span>Due: <strong className="text-white">{inv.dueDate}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

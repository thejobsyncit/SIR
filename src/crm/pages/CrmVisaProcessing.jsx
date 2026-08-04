import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, FileText, AlertTriangle, Plane, X } from 'lucide-react';

export const CrmVisaProcessing = () => {
  const [visaMilestones, setVisaMilestones] = useState([
    {
      id: 'VISA-801',
      candidate: 'Alexander Wright',
      country: 'UAE',
      type: 'Work Permit & Residence Visa',
      stage: 'MOHRE Approval Granted',
      medical: 'Passed DHA Clinic',
      pcc: 'Verified UK ACRO Clearance',
      embassy: 'Attested in London',
      visaSubmitted: '2026-08-01',
      visaApproved: '2026-08-03',
      ticketBooking: 'Emirates EK-008 Booked',
      departure: '2026-08-18',
      arrival: 'Dubai Airport (DXB)',
      workPermit: 'MOHRE Issued',
      residencePermit: 'EID In Processing',
      expiryAlert: 'Valid (2 Years)'
    },
    {
      id: 'VISA-802',
      candidate: 'Elena Rostova',
      country: 'Singapore',
      type: 'Employment Pass (EP)',
      stage: 'IPA Approved by MOM',
      medical: 'Completed',
      pcc: 'Verified',
      embassy: 'N/A (Online Portal)',
      visaSubmitted: '2026-07-25',
      visaApproved: '2026-08-02',
      ticketBooking: 'SQ-421 Booked',
      departure: '2026-08-21',
      arrival: 'Changi Airport (SIN)',
      workPermit: 'MOM IPA Active',
      residencePermit: 'EP Pass Digital Issued',
      expiryAlert: 'Expiring in 24 Months'
    }
  ]);

  const [selectedVisa, setSelectedVisa] = useState(null);

  const visaSteps = [
    'Medical Fitness', 'PCC Clearance', 'Embassy Submission', 
    'Visa Approved', 'Ticket Booking', 'Departure', 'Arrival & Work Permit'
  ];

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Immigration & Work Permits</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Visa Processing Milestone Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400">Track entry permits, medical fitness, embassy appointments, flight bookings & Emirates ID issuing.</p>
        </div>
      </div>

      {/* Visa Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visaMilestones.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedVisa(item)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition cursor-pointer shadow-sm"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/30">{item.country}</span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{item.candidate}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">{item.type}</p>
              </div>
              <span className="font-mono text-gold-600 dark:text-gold-400 font-bold text-xs">{item.id}</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <p><strong className="text-slate-600 dark:text-slate-400">Current Milestone:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.stage}</span></p>
              
              {/* Progress Steps Visualizer */}
              <div className="flex gap-1 pt-1">
                {visaSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex-1 h-2 rounded-full ${idx <= 4 ? 'bg-gold-500' : 'bg-navy-800'}`}
                    title={step}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 bg-navy-950 rounded-xl grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-slate-400">Medical:</span> <strong className="text-white block">{item.medical}</strong></div>
              <div><span className="text-slate-400">Ticket & Departure:</span> <strong className="text-gold-400 block">{item.departure}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Visa Details Modal */}
      {selectedVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">{selectedVisa.country} Visa Case</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedVisa.candidate}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{selectedVisa.type} • Case ID: {selectedVisa.id}</p>
              </div>
              <button onClick={() => setSelectedVisa(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Medical Status:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedVisa.medical}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Police Clearance (PCC):</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedVisa.pcc}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Embassy Attestation:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedVisa.embassy}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Visa Submitted Date:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedVisa.visaSubmitted}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Visa Approved Date:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedVisa.visaApproved}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Ticket Booking Details:</span> <strong className="text-amber-800 dark:text-gold-400 block font-bold">{selectedVisa.ticketBooking}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Departure Date:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedVisa.departure}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Target Arrival:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedVisa.arrival}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Work Permit Status:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedVisa.workPermit}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Residence Permit (EID):</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedVisa.residencePermit}</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-end">
              <button onClick={() => setSelectedVisa(null)} className="px-6 py-2 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-300 dark:border-navy-700 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Globe, ShieldCheck, Plane, CheckCircle2, AlertTriangle, FileText, Plus, X } from 'lucide-react';

export const CrmInternationalRecruitment = () => {
  const [intlOrders, setIntlOrders] = useState([
    {
      id: 'INT-901',
      country: 'Saudi Arabia',
      client: 'Saudi German Hospital Group',
      employer: 'Saudi German Hospital (Riyadh)',
      position: 'Senior ICU Consultant',
      visaType: 'Iqama Work Visa',
      passportStatus: 'Valid (Exp 2029)',
      medicalStatus: 'Passed GAMCA Clinic',
      pccStatus: 'Police Clearance Verified',
      embassyAppointment: '2026-08-04',
      offerLetter: 'Signed',
      contract: 'Attested by Saudi Culture',
      ticketBooking: 'SV-821 Confirmed',
      departureDate: '2026-08-17',
      arrivalConfirmation: 'Pending',
      accommodation: 'Provided (Olaya Staff Compound)',
      insurance: 'Bupa Arabia Executive Plan',
      workPermit: 'MISA Approved',
      visaExpiry: '2028-08-17'
    },
    {
      id: 'INT-902',
      country: 'Singapore',
      client: 'TechVision International',
      employer: 'TechVision APAC Headquarters',
      position: 'DevOps Solutions Architect',
      visaType: 'Employment Pass (EP)',
      passportStatus: 'Valid (Exp 2030)',
      medicalStatus: 'Completed',
      pccStatus: 'Interpol Clearance Valid',
      embassyAppointment: 'N/A (MOM Online)',
      offerLetter: 'Signed',
      contract: 'Executed',
      ticketBooking: 'SQ-421 Booked',
      departureDate: '2026-08-21',
      arrivalConfirmation: 'Pending',
      accommodation: 'Provided (Tanjong Pagar Suite)',
      insurance: 'Allianz Global Health',
      workPermit: 'MOM IPA Approved',
      visaExpiry: '2028-08-21'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Cross-Border Overseas Deployment</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">International Recruitment & Overseas Operations</h1>
          <p className="text-slate-600 dark:text-slate-400">Overseas candidate deployment across KSA, Qatar, Oman, Singapore, UK & Germany.</p>
        </div>
      </div>

      {/* International Mandates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {intlOrders.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition cursor-pointer shadow-sm"
          >
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/30">{item.country}</span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{item.position}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">{item.employer}</p>
              </div>
              <span className="font-mono text-gold-600 dark:text-gold-400 font-bold text-xs">{item.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-100 dark:bg-navy-950 rounded-lg"><span className="text-slate-500 dark:text-slate-400">Visa Type:</span> <strong className="text-slate-900 dark:text-white block font-bold">{item.visaType}</strong></div>
              <div className="p-2 bg-slate-100 dark:bg-navy-950 rounded-lg"><span className="text-slate-500 dark:text-slate-400">Medical Status:</span> <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">{item.medicalStatus}</strong></div>
              <div className="p-2 bg-slate-100 dark:bg-navy-950 rounded-lg"><span className="text-slate-500 dark:text-slate-400">Police Check (PCC):</span> <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">{item.pccStatus}</strong></div>
              <div className="p-2 bg-slate-100 dark:bg-navy-950 rounded-lg"><span className="text-slate-500 dark:text-slate-400">Ticket Booking:</span> <strong className="text-amber-600 dark:text-gold-400 block font-bold">{item.ticketBooking}</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px]">
              <span className="text-slate-600 dark:text-slate-400">Target Departure: <strong className="text-slate-900 dark:text-white font-mono font-bold">{item.departureDate}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Departure
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected International Deployment Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">{selectedItem.country} Deployment</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedItem.position}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Client: {selectedItem.client} • Employer: {selectedItem.employer}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Passport Status:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedItem.passportStatus}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Medical Fitness:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedItem.medicalStatus}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">PCC Status:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedItem.pccStatus}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Embassy Appointment:</span> <strong className="text-amber-800 dark:text-gold-400 block font-bold">{selectedItem.embassyAppointment}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Offer Letter Status:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedItem.offerLetter}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Employment Contract:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedItem.contract}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Flight Ticket:</span> <strong className="text-amber-800 dark:text-gold-400 block font-bold">{selectedItem.ticketBooking}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Departure Date:</span> <strong className="text-slate-900 dark:text-white block font-bold">{selectedItem.departureDate}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Accommodation:</span> <strong className="text-slate-900 dark:text-slate-200 block font-bold">{selectedItem.accommodation}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Health Insurance:</span> <strong className="text-slate-900 dark:text-slate-200 block font-bold">{selectedItem.insurance}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Work Permit Approval:</span> <strong className="text-emerald-700 dark:text-emerald-400 block font-bold">{selectedItem.workPermit}</strong></div>
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800"><span className="text-slate-600 dark:text-slate-400 font-medium">Visa Expiration Alert:</span> <strong className="text-amber-800 dark:text-amber-400 block font-bold">{selectedItem.visaExpiry}</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-end">
              <button onClick={() => setSelectedItem(null)} className="px-6 py-2 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-300 dark:border-navy-700 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

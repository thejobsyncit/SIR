import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock, Eye, X, Check, FileCheck } from 'lucide-react';

export const CrmBackgroundVerification = () => {
  const [bgvCases, setBgvCases] = useState([
    {
      id: 'BGV-991',
      candidate: 'Alexander Wright',
      type: '6-Point Comprehensive Audit',
      education: 'Verified (University of Manchester)',
      employment: 'Verified (Al Habtoor Contracting)',
      address: 'Verified (Dubai, Business Bay)',
      police: 'Clear (UK ACRO Certificate)',
      reference: 'Verified (2 VP Recommendations)',
      identity: 'Verified (UK Passport GB98210452)',
      status: 'Approved',
      timeline: 'Completed in 4 Days'
    },
    {
      id: 'BGV-992',
      candidate: 'Dr. Sarah Al-Mansoori',
      type: 'Executive Healthcare Audit',
      education: 'Verified (King Saud University)',
      employment: 'Verified (King Faisal Specialist Hospital)',
      address: 'Verified (Riyadh, Olaya)',
      police: 'Clear (Saudi Police Certificate)',
      reference: 'Verified (Chief Medical Officer)',
      identity: 'Verified (Saudi National ID)',
      status: 'Approved',
      timeline: 'Completed in 3 Days'
    },
    {
      id: 'BGV-993',
      candidate: 'Elena Rostova',
      type: 'Tech & Financial Audit',
      education: 'Verified (Warsaw Uni of Tech)',
      employment: 'Verified (Warsaw Fintech)',
      address: 'Verified (Warsaw, Poland)',
      police: 'Clear (Polish Justice Ministry)',
      reference: 'Pending 2nd Ref Check',
      identity: 'Verified (EU Passport)',
      status: 'In Audit',
      timeline: 'Day 2 of 5'
    }
  ]);

  const [selectedCase, setSelectedCase] = useState(null);

  const handleApproveCase = (id) => {
    setBgvCases(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase({ ...selectedCase, status: 'Approved' });
    }
  };

  const handleFlagCase = (id) => {
    setBgvCases(prev => prev.map(c => c.id === id ? { ...c, status: 'Flagged Discrepancy' } : c));
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase({ ...selectedCase, status: 'Flagged Discrepancy' });
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Credential & Integrity Audits</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">6-Point Background Verification Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Education, employment history, police clearance, reference checks, address & identity validation.</p>
        </div>
      </div>

      {/* Cases Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bgvCases.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedCase(item)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition cursor-pointer shadow-sm"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{item.candidate}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">{item.type}</p>
              </div>
              <span className={`px-2.5 py-1 rounded font-bold text-[10px] border ${
                item.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' :
                item.status === 'Flagged Discrepancy' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
              }`}>
                {item.status === 'Approved' ? '✓ Approved' : item.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
              <p>🎓 <strong className="text-slate-600 dark:text-slate-400">Education:</strong> <span className="text-slate-900 dark:text-white font-bold">{item.education}</span></p>
              <p>🏢 <strong className="text-slate-600 dark:text-slate-400">Past Employment:</strong> <span className="text-slate-900 dark:text-white font-bold">{item.employment}</span></p>
              <p>🛡️ <strong className="text-slate-600 dark:text-slate-400">Police Clearance:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.police}</span></p>
              <p>👥 <strong className="text-slate-600 dark:text-slate-400">Ref Checks:</strong> <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.reference}</span></p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400">
              <span>Timeline: <strong className="text-slate-900 dark:text-white font-mono font-bold">{item.timeline}</strong></span>
              <span className="text-amber-700 dark:text-gold-400 font-bold">Audit Case #{item.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Case Modal with Approval Workflow */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-xl w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">Audit Report Case #{selectedCase.id}</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedCase.candidate}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{selectedCase.type}</p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1.5 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-medium">
                <p>🎓 <strong>1. Education Verification:</strong> {selectedCase.education}</p>
                <p>🏢 <strong>2. Employment Verification:</strong> {selectedCase.employment}</p>
                <p>📍 <strong>3. Residential Address Check:</strong> {selectedCase.address}</p>
                <p>🛡️ <strong>4. Police & Criminal Background:</strong> {selectedCase.police}</p>
                <p>👥 <strong>5. Professional Reference Check:</strong> {selectedCase.reference}</p>
                <p>🆔 <strong>6. Identity Document Check:</strong> {selectedCase.identity}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => handleApproveCase(selectedCase.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve Verification (Pass Audit)</span>
              </button>

              <button 
                onClick={() => handleFlagCase(selectedCase.id)}
                className="py-2.5 px-4 bg-rose-100 dark:bg-rose-600/20 text-rose-800 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-500/40 font-bold rounded-xl text-xs cursor-pointer"
              >
                Flag Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

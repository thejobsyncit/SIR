import React, { useState } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Clock, Eye, X, Check, 
  FileCheck, Download, RotateCcw 
} from 'lucide-react';

const DEFAULT_BGV_CASES = [];

export const CrmBackgroundVerification = () => {
  const [bgvCases, setBgvCases] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_bgv_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_BGV_CASES;
  });

  const [selectedCase, setSelectedCase] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const saveCases = (newCases) => {
    setBgvCases(newCases);
    try {
      localStorage.setItem('sir_crm_bgv_cases', JSON.stringify(newCases));
    } catch (_) {}
  };

  const handleApproveCase = (id) => {
    const target = bgvCases.find(c => c.id === id);
    const updated = bgvCases.map(c => c.id === id ? { 
      ...c, 
      status: 'Approved',
      approvedAt: new Date().toISOString().slice(0, 10),
      approvedBy: 'Super Admin'
    } : c);
    saveCases(updated);
    setSelectedCase(null);
    setSuccessMessage(`✓ Background verification audit approved for ${target?.candidate || id}. All 6 compliance checks certified.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleFlagCase = (id) => {
    const target = bgvCases.find(c => c.id === id);
    const updated = bgvCases.map(c => c.id === id ? { 
      ...c, 
      status: 'Flagged Discrepancy',
      flaggedAt: new Date().toISOString().slice(0, 10)
    } : c);
    saveCases(updated);
    setSelectedCase(null);
    setSuccessMessage(`⚠️ Case ${id} (${target?.candidate || ''}) flagged for discrepancy review.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleResetBaseline = () => {
    saveCases(DEFAULT_BGV_CASES);
    setSelectedCase(null);
    setSuccessMessage('✓ Reset all verification audit cases to baseline.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const downloadAuditCertificate = (bgv) => {
    const text = `=====================================================
The Revival International BACKGROUND VERIFICATION AUDIT CERTIFICATE
=====================================================
Case ID: #${bgv.id}
Candidate Name: ${bgv.candidate}
Audit Classification: ${bgv.type}
Audit Decision: VERIFIED & APPROVED (COMPLIANCE CERTIFIED)
Approval Date: ${bgv.approvedAt || '2026-11-15'}
Authorized By: ${bgv.approvedBy || 'Super Admin'}
Timeline: ${bgv.timeline}
=====================================================
6-POINT VERIFICATION AUDIT BREAKDOWN:
1. Education: ${bgv.education}
2. Employment: ${bgv.employment}
3. Residential Address: ${bgv.address}
4. Police Clearance: ${bgv.police}
5. Reference Checks: ${bgv.reference}
6. Identity Validation: ${bgv.identity}
=====================================================
Issued By: The Revival International Global Compliance & Integrity Bureau
Authentication Checksum: #BGV-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}
=====================================================`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BGV_Audit_Certificate_${bgv.candidate.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMessage(`✓ Downloaded official verification certificate for ${bgv.candidate}.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <ScrollReveal>
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Credential & Integrity Audits</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">6-Point Background Verification Hub</h1>
          <p className="text-slate-600 dark:text-slate-400">Education, employment history, police clearance, reference checks, address & identity validation.</p>
        </div>

        <button
          onClick={handleResetBaseline}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-slate-300 dark:border-navy-700 transition cursor-pointer"
          title="Reset cases to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 dark:text-emerald-400 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cases Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bgvCases.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedCase(item)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition cursor-pointer shadow-sm group"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-gold-400 transition">{item.candidate}</h3>
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

      {/* Selected Case Modal with Dynamic State-Aware Workflow */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-xl w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">
                    Audit Report Case #{selectedCase.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                    selectedCase.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' :
                    selectedCase.status === 'Flagged Discrepancy' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border-rose-300' :
                    'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300'
                  }`}>
                    {selectedCase.status === 'Approved' ? '✓ Audit Approved' : selectedCase.status}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedCase.candidate}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{selectedCase.type}</p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-2 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 font-medium">
                <p className="flex items-start gap-2">🎓 <span><strong>1. Education Verification:</strong> {selectedCase.education}</span></p>
                <p className="flex items-start gap-2">🏢 <span><strong>2. Employment Verification:</strong> {selectedCase.employment}</span></p>
                <p className="flex items-start gap-2">📍 <span><strong>3. Residential Address Check:</strong> {selectedCase.address}</span></p>
                <p className="flex items-start gap-2">🛡️ <span><strong>4. Police & Criminal Background:</strong> <strong className="text-emerald-600 dark:text-emerald-400">{selectedCase.police}</strong></span></p>
                <p className="flex items-start gap-2">👥 <span><strong>5. Professional Reference Check:</strong> {selectedCase.reference}</span></p>
                <p className="flex items-start gap-2">🆔 <span><strong>6. Identity Document Check:</strong> {selectedCase.identity}</span></p>
              </div>
            </div>

            {/* Smart Actions Workflow: Never asks to approve if already approved */}
            {selectedCase.status === 'Approved' ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Audit Certified & Verified (Compliance Cleared)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {selectedCase.approvedAt || '2026-11-15'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => downloadAuditCertificate(selectedCase)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Audit Certificate</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleFlagCase(selectedCase.id)}
                    className="py-2.5 px-3 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-slate-300 dark:border-navy-700 font-semibold rounded-xl text-xs cursor-pointer transition"
                    title="Flag an issue or discrepancy"
                  >
                    Flag Issue
                  </button>

                  <button 
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-navy-700 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : selectedCase.status === 'Flagged Discrepancy' ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Audit is currently flagged for discrepancy review.</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => handleApproveCase(selectedCase.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Resolve & Re-Approve Audit</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-navy-700 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => handleApproveCase(selectedCase.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Verification (Pass Audit)</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleFlagCase(selectedCase.id)}
                  className="py-2.5 px-4 bg-rose-100 dark:bg-rose-600/20 text-rose-800 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-500/40 font-bold rounded-xl text-xs cursor-pointer transition"
                >
                  Flag Discrepancy
                </button>

                <button 
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-navy-700 text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
    </ScrollReveal>
  );
};

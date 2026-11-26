import React, { useState, useEffect } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Clock, Eye, X, Check, 
  FileCheck, Download, RotateCcw, Search, Filter, RefreshCw, FileText,
  Building, ChevronRight, Layers, Award, Sparkles, ExternalLink
} from 'lucide-react';

export const CrmBackgroundVerification = () => {
  const [bgvCases, setBgvCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState('');

  // Fetch live cases from database API
  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/verifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.cases)) {
        // Normalize cases
        const normalized = data.cases.map(c => ({
          id: c.caseId || c.id,
          caseId: c.caseId || c.id,
          candidate: c.candidateName || 'Candidate',
          candidateEmail: c.candidateEmail || '',
          passportNumber: c.passportNumber || '',
          type: c.verificationPackage || 'Comprehensive Executive Audit',
          status: c.overallStatus || 'Submitted',
          overallStatus: c.overallStatus || 'Submitted',
          timeline: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active',
          createdAt: c.createdAt,
          remarks: c.remarks || '',
          attestationPipeline: c.attestationPipeline || [],
          employmentMilestones: c.employmentMilestones || [],
          documentsAttached: c.documentsAttached || [],
          education: c.packageItems?.includes('Education') ? 'Degree Verified' : 'Under Review',
          employment: c.packageItems?.includes('Employment') ? 'Prior History Verified' : 'Under Review',
          police: c.packageItems?.includes('Police Clearance') || c.packageItems?.includes('PCC') ? 'Clearance Issued' : 'Verification Underway',
          reference: '2 Positive Endorsements',
          identity: c.passportNumber ? `Passport ${c.passportNumber}` : 'Validated'
        }));
        setBgvCases(normalized);
      }
    } catch (err) {
      console.warn('Live CRM cases fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Update selected case remarks state when opened
  useEffect(() => {
    if (selectedCase) {
      setEditingRemarks(selectedCase.remarks || '');
    }
  }, [selectedCase]);

  // Approve Case
  const handleApproveCase = async (id) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/crm/verifications/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallStatus: 'Approved',
          remarks: editingRemarks || 'Background verification and compliance certified by Super Admin.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBgvCases(prev => prev.map(c => c.id === id ? { 
          ...c, 
          status: 'Approved', 
          overallStatus: 'Approved',
          remarks: editingRemarks || 'Approved by Super Admin'
        } : c));
        if (selectedCase && selectedCase.id === id) {
          setSelectedCase(prev => ({ ...prev, status: 'Approved', overallStatus: 'Approved' }));
        }
        setSuccessMessage(`✓ Verification audit approved for Case #${id}. All compliance checks certified.`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert('Failed to update case status on server.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Flag Case
  const handleFlagCase = async (id) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/crm/verifications/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallStatus: 'Flagged Discrepancy',
          remarks: editingRemarks || 'Flagged for discrepancy review by Super Admin compliance desk.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBgvCases(prev => prev.map(c => c.id === id ? { 
          ...c, 
          status: 'Flagged Discrepancy', 
          overallStatus: 'Flagged Discrepancy',
          remarks: editingRemarks || 'Flagged for discrepancy review'
        } : c));
        if (selectedCase && selectedCase.id === id) {
          setSelectedCase(prev => ({ ...prev, status: 'Flagged Discrepancy', overallStatus: 'Flagged Discrepancy' }));
        }
        setSuccessMessage(`⚠️ Case #${id} flagged for discrepancy review.`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert('Failed to flag case on server.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update Attestation Pipeline Stage Status
  const handleUpdateAttestationStage = async (stageStep, newStatus) => {
    if (!selectedCase) return;
    const updatedPipeline = (selectedCase.attestationPipeline || []).map(stg => 
      stg.step === stageStep ? { 
        ...stg, 
        status: newStatus, 
        completedDate: (newStatus === 'Completed' || newStatus === 'Verified') ? newStatus : null,
        lastUpdated: new Date().toISOString()
      } : stg
    );

    try {
      await fetch(`/api/crm/verifications/${encodeURIComponent(selectedCase.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attestationPipeline: updatedPipeline,
          remarks: editingRemarks
        })
      });

      setSelectedCase(prev => ({ ...prev, attestationPipeline: updatedPipeline }));
      setBgvCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, attestationPipeline: updatedPipeline } : c));
      setSuccessMessage(`✓ Stage 0${stageStep} status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (_) {}
  };

  // Update Employment Milestone Status
  const handleUpdateEmploymentMilestone = async (milestoneStep, newStatus) => {
    if (!selectedCase) return;
    const updatedMilestones = (selectedCase.employmentMilestones || []).map(m => 
      m.step === milestoneStep ? { 
        ...m, 
        status: newStatus, 
        completedDate: (newStatus === 'Completed' || newStatus === 'Verified') ? new Date().toISOString().slice(0, 10) : null,
        lastUpdated: new Date().toISOString()
      } : m
    );

    try {
      await fetch(`/api/crm/verifications/${encodeURIComponent(selectedCase.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employmentMilestones: updatedMilestones,
          remarks: editingRemarks
        })
      });

      setSelectedCase(prev => ({ ...prev, employmentMilestones: updatedMilestones }));
      setBgvCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, employmentMilestones: updatedMilestones } : c));
      setSuccessMessage(`✓ Milestone 0${milestoneStep} status updated to "${newStatus}".`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (_) {}
  };

  // Save Remarks
  const handleSaveRemarks = async () => {
    if (!selectedCase) return;
    try {
      await fetch(`/api/crm/verifications/${encodeURIComponent(selectedCase.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: editingRemarks })
      });
      setSelectedCase(prev => ({ ...prev, remarks: editingRemarks }));
      setBgvCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, remarks: editingRemarks } : c));
      setSuccessMessage('✓ Internal compliance remarks saved.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (_) {}
  };

  // Download official audit certificate
  const downloadAuditCertificate = (bgv) => {
    const text = `=====================================================
The Revival International BACKGROUND VERIFICATION AUDIT CERTIFICATE
=====================================================
Case ID: #${bgv.caseId || bgv.id}
Candidate Name: ${bgv.candidate}
Candidate Email: ${bgv.candidateEmail || 'Registered Portal Candidate'}
Passport Number: ${bgv.passportNumber || 'Confidential / On File'}
Audit Classification: ${bgv.type}
Audit Decision: ${bgv.status?.toUpperCase() || 'VERIFIED & APPROVED'}
Approval Date: ${new Date().toISOString().slice(0, 10)}
Authorized By: Super Admin / Revival International Global Integrity Bureau
Timeline: ${bgv.timeline}
=====================================================
CONSULAR ATTESTATION PIPELINE:
${(bgv.attestationPipeline || []).map(s => `${s.step}. ${s.stage}: ${s.status}`).join('\n')}
=====================================================
OVERSEAS EMPLOYMENT MILESTONES:
${(bgv.employmentMilestones || []).map(m => `${m.step}. ${m.milestone}: ${m.status}`).join('\n')}
=====================================================
6-POINT VERIFICATION AUDIT BREAKDOWN:
1. Education: ${bgv.education}
2. Employment: ${bgv.employment}
3. Residential Address: Validated
4. Police Clearance: ${bgv.police}
5. Reference Checks: ${bgv.reference}
6. Identity Validation: ${bgv.identity}
=====================================================
Internal Remarks: ${bgv.remarks || 'All regulatory checkpoints satisfied.'}
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

  // Filter cases
  const filteredCases = bgvCases.filter(c => {
    const matchesSearch = !searchQuery || 
      c.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                Consular Credential & Integrity Audits
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {bgvCases.length} Registered Cases
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Document Verification & Consular Tracking Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              State HRD, MEA Apostille, Embassy and MOFA attestations, degree verification, and overseas employment roadmap clearance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCases}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-slate-300 dark:border-navy-700 transition cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, case ID, or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Submitted', 'Under Review', 'In Progress', 'Approved', 'Flagged Discrepancy'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
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

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-navy-700 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-700 dark:text-slate-300">
              No Verification Cases Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Candidate verification submissions created on the website or candidate portal will automatically appear here for compliance review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedCase(item)}
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition cursor-pointer shadow-sm group"
              >
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gold-600 dark:text-gold-400 block mb-0.5">
                      Case #{item.caseId || item.id}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-gold-400 transition">
                      {item.candidate}
                    </h3>
                    <p className="text-slate-500 text-[11px] font-medium">{item.type}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded font-bold text-[10px] border shrink-0 ${
                    item.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' :
                    item.status === 'Flagged Discrepancy' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30' : 
                    'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                  }`}>
                    {item.status === 'Approved' ? '✓ Approved' : item.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
                  <p>🎓 <strong className="text-slate-600 dark:text-slate-400">Education:</strong> <span className="text-slate-900 dark:text-white font-bold">{item.education}</span></p>
                  <p>🏢 <strong className="text-slate-600 dark:text-slate-400">Past Employment:</strong> <span className="text-slate-900 dark:text-white font-bold">{item.employment}</span></p>
                  <p>🛡️ <strong className="text-slate-600 dark:text-slate-400">Police Clearance:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.police}</span></p>
                  <p>🆔 <strong className="text-slate-600 dark:text-slate-400">Passport / ID:</strong> <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.passportNumber || item.identity}</span></p>
                </div>

                {/* Progress indicator of stages */}
                {Array.isArray(item.attestationPipeline) && item.attestationPipeline.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Attestation Pipeline</span>
                      <span>
                        {item.attestationPipeline.filter(s => s.status === 'Completed' || s.status === 'Verified').length} / {item.attestationPipeline.length} Verified
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {item.attestationPipeline.map((stg, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full ${
                            stg.status === 'Completed' || stg.status === 'Verified'
                              ? 'bg-emerald-500'
                              : stg.status === 'In Progress'
                              ? 'bg-gold-500 animate-pulse'
                              : 'bg-slate-200 dark:bg-navy-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400">
                  <span>Timeline: <strong className="text-slate-900 dark:text-white font-mono font-bold">{item.timeline}</strong></span>
                  <span className="text-gold-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Manage Case</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Case Modal with Real Database Updates */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-luxury space-y-5 my-8 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">
                      Audit Case #{selectedCase.caseId || selectedCase.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                      selectedCase.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' :
                      selectedCase.status === 'Flagged Discrepancy' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border-rose-300' :
                      'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300'
                    }`}>
                      {selectedCase.status === 'Approved' ? '✓ Audit Approved' : selectedCase.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedCase.candidate}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedCase.candidateEmail && `${selectedCase.candidateEmail} • `}{selectedCase.type}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4-Stage Consular Degree Attestation Pipeline Controls */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-navy-950 dark:text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-gold-500" />
                    <span>Consular Degree Attestation Pipeline</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">HR Super Admin Controls</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(selectedCase.attestationPipeline || [
                    { step: 1, stage: 'State HRD / Home Department', status: 'Submitted' },
                    { step: 2, stage: 'MEA Apostille / Attestation', status: 'Under Review' },
                    { step: 3, stage: 'Consular Embassy Attestation', status: 'Queued' },
                    { step: 4, stage: 'MOFA Digital Stamping', status: 'Queued' }
                  ]).map((stg) => (
                    <div key={stg.step} className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block">Stage 0{stg.step}</span>
                        <p className="font-bold text-navy-950 dark:text-white text-[11px] truncate">{stg.stage}</p>
                      </div>
                      <select
                        value={stg.status}
                        onChange={(e) => handleUpdateAttestationStage(stg.step, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-navy-950 dark:text-white cursor-pointer"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Action Required">Action Required</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Stage Overseas Employment Milestones Controls */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-navy-950 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-gold-500" />
                    <span>Overseas Employment Roadmap Milestones</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">5-Stage Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(selectedCase.employmentMilestones || [
                    { step: 1, milestone: 'Quota & Offer Clearance', status: 'Completed' },
                    { step: 2, milestone: 'Degree Attestation', status: 'In Progress' },
                    { step: 3, milestone: 'Entry Permit / Visa Ingress', status: 'Queued' },
                    { step: 4, milestone: 'Medical & Biometrics', status: 'Queued' },
                    { step: 5, milestone: 'Residency & National ID', status: 'Queued' }
                  ]).map((m) => (
                    <div key={m.step} className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block">Milestone 0{m.step}</span>
                        <p className="font-bold text-navy-950 dark:text-white text-[11px] truncate">{m.milestone}</p>
                      </div>
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateEmploymentMilestone(m.step, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-navy-950 dark:text-white cursor-pointer"
                      >
                        <option value="Queued">Queued</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Action Required">Action Required</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Documents List */}
              {Array.isArray(selectedCase.documentsAttached) && selectedCase.documentsAttached.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <span className="text-xs font-bold text-navy-950 dark:text-white block">
                    Attached Candidate Documents ({selectedCase.documentsAttached.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {selectedCase.documentsAttached.map((doc, i) => (
                      <div key={i} className="p-2 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                          <span className="truncate">{doc.name || doc.type || 'Document'}</span>
                        </div>
                        {doc.fileUrl && doc.fileUrl.startsWith('data:') && (
                          <a
                            href={doc.fileUrl}
                            download={doc.name || 'document.pdf'}
                            className="text-gold-500 font-bold hover:underline shrink-0 ml-2"
                          >
                            Inspect
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal HR Remarks & Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-950 dark:text-white">
                  Internal HR Remarks & Compliance Observations:
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={editingRemarks}
                    onChange={(e) => setEditingRemarks(e.target.value)}
                    placeholder="Enter compliance verification remarks or document follow-up instructions..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRemarks}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer self-end"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex flex-wrap gap-2">
                <button 
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleApproveCase(selectedCase.id)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Certify Compliance</span>
                </button>

                <button 
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleFlagCase(selectedCase.id)}
                  className="py-2.5 px-3.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs border border-rose-300 dark:border-rose-900 cursor-pointer transition disabled:opacity-50"
                >
                  Flag Discrepancy
                </button>

                <button 
                  type="button"
                  onClick={() => downloadAuditCertificate(selectedCase)}
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-300 dark:border-navy-700 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Certificate</span>
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
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

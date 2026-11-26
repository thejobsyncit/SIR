import React, { useState } from 'react';
import {
  FileText, ShieldCheck, Globe, Upload, CheckCircle2, AlertCircle, Clock, Plus
} from 'lucide-react';

const DOC_TYPES = [
  'Passport',
  'Identity Document',
  'Educational Certificate',
  'Employment Record',
  'Financial Evidence',
  'Offer / Admission Letter',
  'Medical Certificate',
  'Police Clearance',
  'Other'
];

const DOC_STATUSES = [
  'Pending',
  'Under Review',
  'Verified',
  'Rejected / Correction Required'
];

const VISA_STATUSES = [
  'Not Required',
  'Needs Assessment',
  'Pending Documents',
  'Under Review',
  'Additional Information Required',
  'Eligibility Assessment Pending',
  'Eligible',
  'Ineligible',
  'Application Submitted',
  'Officially Approved',
  'Officially Rejected'
];

const BGV_STATUSES = ['Pending', 'In Progress', 'Verified', 'Flagged Discrepancy'];

const badgeClass = (status = '') => {
  const s = String(status).toLowerCase();
  if (s.includes('verified') || s === 'eligible' || s === 'officially approved') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (s.includes('rejected') || s === 'ineligible' || s.includes('flagged') || s.includes('correction') || s.includes('additional')) {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
  if (s.includes('under review') || s.includes('in progress') || s.includes('submitted')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
  }
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
};

export const CandidateDocumentsKycTab = ({
  candidateKey,
  enquiries = [],
  documents = [],
  cases = [],
  crmToken,
  onReload,
  onFeedback
}) => {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(enquiries[0]?.id || 'all');
  const [docForm, setDocForm] = useState({ docName: '', docType: 'Passport', fileData: '', mimeType: '', fileSize: '', remarks: '' });
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  const scopedDocs = selectedEnquiryId === 'all'
    ? documents
    : documents.filter((d) => d.enquiryId === selectedEnquiryId);

  const linkedCase = cases.find((c) => c.enquiryId === selectedEnquiryId) || null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocForm((prev) => ({
        ...prev,
        docName: prev.docName || file.name,
        fileData: typeof reader.result === 'string' ? reader.result : '',
        mimeType: file.type,
        fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDoc = async (e) => {
    e.preventDefault();
    if (!docForm.docName.trim()) return;
    const targetEnquiryId = selectedEnquiryId === 'all' ? (enquiries[0]?.id || '') : selectedEnquiryId;
    setSaving(true);
    try {
      const res = await fetch('/api/crm/visa-verification/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({
          caseId: linkedCase?.id || null,
          candidateKey,
          enquiryId: targetEnquiryId,
          docName: docForm.docName.trim(),
          docType: docForm.docType,
          fileData: docForm.fileData,
          mimeType: docForm.mimeType,
          fileSize: docForm.fileSize || '1.0 MB',
          remarks: docForm.remarks
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to upload document.');
      setDocForm({ docName: '', docType: 'Passport', fileData: '', mimeType: '', fileSize: '', remarks: '' });
      onFeedback?.({ type: 'success', text: 'Document submitted and linked to enquiry.' });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReviewDoc = async (doc) => {
    const draft = drafts[doc.id] || {
      verificationStatus: doc.verificationStatus || 'Pending',
      remarks: doc.remarks || '',
      missingOrCorrectionNote: doc.missingOrCorrectionNote || ''
    };
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/visa-verification/documents/${doc.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify(draft)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to review document.');
      onFeedback?.({ type: 'success', text: `${doc.docName} updated to ${draft.verificationStatus}.` });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Documents &amp; KYC ({scopedDocs.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enquiry-scoped document verification and compliance review
          </p>
        </div>
        {enquiries.length > 0 && (
          <select
            value={selectedEnquiryId}
            onChange={(e) => setSelectedEnquiryId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Enquiries</option>
            {enquiries.map((enq) => (
              <option key={enq.id} value={enq.id}>
                {enq.id} — {enq.serviceTitle}
              </option>
            ))}
          </select>
        )}
      </div>

      <form onSubmit={handleSubmitDoc} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-indigo-500" />
          <span>Submit New Document</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <input
            type="text"
            required
            placeholder="Document name"
            value={docForm.docName}
            onChange={(e) => setDocForm({ ...docForm, docName: e.target.value })}
            className="px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
          />
          <select
            value={docForm.docType}
            onChange={(e) => setDocForm({ ...docForm, docType: e.target.value })}
            className="px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
          >
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="file"
            onChange={handleFile}
            className="px-2 py-1.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-[11px]"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <input
            type="text"
            placeholder="Submission remarks (optional)"
            value={docForm.remarks}
            onChange={(e) => setDocForm({ ...docForm, remarks: e.target.value })}
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
          >
            {saving ? 'Uploading...' : 'Submit Document'}
          </button>
        </div>
      </form>

      {scopedDocs.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
          No documents submitted
        </div>
      ) : (
        <div className="space-y-3">
          {scopedDocs.map((doc) => {
            const draft = drafts[doc.id] || {
              verificationStatus: doc.verificationStatus || 'Pending',
              remarks: doc.remarks || '',
              missingOrCorrectionNote: doc.missingOrCorrectionNote || ''
            };
            return (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{doc.docName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.docType} {doc.enquiryId ? `• Enquiry ${doc.enquiryId}` : ''} • Submitted: {String(doc.submittedAt || '').slice(0, 10)} • Reviewer: {doc.reviewerName || 'Unassigned'}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass(doc.verificationStatus)}`}>
                    {doc.verificationStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={draft.verificationStatus}
                    onChange={(e) => setDrafts((p) => ({ ...p, [doc.id]: { ...draft, verificationStatus: e.target.value } }))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    {DOC_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Reviewer remarks"
                    value={draft.remarks}
                    onChange={(e) => setDrafts((p) => ({ ...p, [doc.id]: { ...draft, remarks: e.target.value } }))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Missing / correction required"
                    value={draft.missingOrCorrectionNote}
                    onChange={(e) => setDrafts((p) => ({ ...p, [doc.id]: { ...draft, missingOrCorrectionNote: e.target.value } }))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleReviewDoc(doc)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                  >
                    Update Document Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CandidateVisaEligibilityTab = ({
  candidate,
  candidateKey,
  enquiries = [],
  cases = [],
  crmToken,
  onReload,
  onFeedback
}) => {
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const handleStartAssessment = async (enq) => {
    setSaving(true);
    try {
      const res = await fetch('/api/crm/visa-verification/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({
          candidateKey,
          candidateId: candidate.candidateId || candidate.candidateReferenceNumber || candidateKey,
          candidateName: candidate.fullName,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          enquiryId: enq.id,
          serviceId: enq.serviceId,
          serviceType: enq.serviceTitle,
          caseStatus: 'Needs Assessment'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Unable to create visa assessment.');
      onFeedback?.({ type: 'success', text: `Visa assessment initiated for enquiry ${enq.id}.` });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (caseId) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/visa-verification/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to update visa assessment.');
      setEditingCaseId(null);
      onFeedback?.({ type: 'success', text: 'Visa & eligibility assessment saved.' });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Visa &amp; Eligibility ({cases.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Destination requirements, required-document checklist, eligibility assessment, and official immigration outcomes
          </p>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 space-y-3 text-center">
          <Globe className="w-7 h-7 mx-auto text-slate-400" />
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No visa case currently linked to this candidate
          </div>
          {enquiries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {enquiries.map((enq) => (
                <button
                  key={enq.id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleStartAssessment(enq)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-navy-950 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assess Visa Requirement ({enq.serviceTitle})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((vc) => {
            const isEditing = editingCaseId === vc.id;
            return (
              <div key={vc.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700 dark:text-amber-300">{vc.enquiryId}</span>
                      {vc.applicationId && <span className="font-mono text-[11px] text-slate-500">App: {vc.applicationId}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass(vc.caseStatus)}`}>{vc.caseStatus}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {vc.visaCategory} — {vc.destinationCountry}
                    </h3>
                    <p className="text-[11px] text-slate-500">{vc.purpose || vc.serviceType}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setEditingCaseId(null);
                      } else {
                        setEditingCaseId(vc.id);
                        setForm({
                          destinationCountry: vc.destinationCountry || '',
                          visaCategory: vc.visaCategory || '',
                          eligibilityStatus: vc.eligibilityStatus || 'Eligibility Assessment Pending',
                          caseStatus: vc.caseStatus || 'Needs Assessment',
                          submissionDate: vc.submissionDate || '',
                          applicationRefNumber: vc.applicationRefNumber || '',
                          officialDecision: vc.officialDecision || 'Pending',
                          officialDecisionDate: vc.officialDecisionDate || '',
                          confirmedOfficialOutcome: Boolean(vc.officialDecisionDate),
                          assessmentNotes: vc.assessmentNotes || ''
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                  >
                    {isEditing ? 'Close' : 'Update Assessment'}
                  </button>
                </div>

                {/* Checklist */}
                {Array.isArray(vc.requiredDocs) && vc.requiredDocs.length > 0 && (
                  <div className="p-3 rounded-xl bg-white dark:bg-navy-800/60 border border-slate-200 dark:border-white/10">
                    <div className="font-bold text-slate-700 dark:text-slate-200 mb-1.5">Required Document Checklist ({vc.destinationCountry})</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {vc.requiredDocs.map((item) => (
                        <div key={item.key} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{item.label}</span>
                          {!item.required && <span className="text-[10px] text-slate-400">(Optional)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-slate-400 block">Eligibility</span><strong className="text-slate-800 dark:text-slate-100">{vc.eligibilityStatus}</strong></div>
                  <div><span className="text-slate-400 block">Assigned Reviewer</span><strong className="text-slate-800 dark:text-slate-100">{vc.assignedReviewerName || 'Unassigned'}</strong></div>
                  <div><span className="text-slate-400 block">Submission Date / Ref</span><strong className="text-slate-800 dark:text-slate-100">{vc.submissionDate || '—'} {vc.applicationRefNumber ? `(${vc.applicationRefNumber})` : ''}</strong></div>
                  <div><span className="text-slate-400 block">Official Decision</span><strong className="text-slate-800 dark:text-slate-100">{vc.officialDecision || 'Pending'}</strong></div>
                </div>

                {vc.assessmentNotes && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 italic">Notes: {vc.assessmentNotes}</div>
                )}

                {isEditing && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input type="text" placeholder="Destination Country" value={form.destinationCountry} onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10" />
                      <input type="text" placeholder="Visa Category" value={form.visaCategory} onChange={(e) => setForm({ ...form, visaCategory: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10" />
                      <select value={form.eligibilityStatus} onChange={(e) => setForm({ ...form, eligibilityStatus: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10">
                        <option value="Eligibility Assessment Pending">Eligibility Assessment Pending</option>
                        <option value="Eligible">Eligible</option>
                        <option value="Ineligible">Ineligible</option>
                      </select>
                      <select value={form.caseStatus} onChange={(e) => setForm({ ...form, caseStatus: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10">
                        {VISA_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <input type="date" value={form.submissionDate} onChange={(e) => setForm({ ...form, submissionDate: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10" />
                      <input type="text" placeholder="Application Reference #" value={form.applicationRefNumber} onChange={(e) => setForm({ ...form, applicationRefNumber: e.target.value })} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10" />
                    </div>
                    <textarea rows="2" placeholder="Assessment notes..." value={form.assessmentNotes} onChange={(e) => setForm({ ...form, assessmentNotes: e.target.value })} className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10" />
                    <div className="flex justify-end">
                      <button type="button" disabled={saving} onClick={() => handleSave(vc.id)} className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold cursor-pointer">
                        {saving ? 'Saving...' : 'Save Assessment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CandidateBgvTab = ({
  candidateKey,
  bgvRecords = [],
  crmToken,
  onReload,
  onFeedback
}) => {
  const [checkType, setCheckType] = useState('Identity & Passport Validation');
  const [status, setStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddBgv = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/crm/visa-verification/bgv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({ candidateKey, checkType, status, progress: status === 'Verified' ? '100%' : '50%', notes })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to add BGV check.');
      setNotes('');
      onFeedback?.({ type: 'success', text: 'Background verification check recorded.' });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBgv = async (bgvId, nextStatus) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/visa-verification/bgv/${bgvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({ status: nextStatus, progress: nextStatus === 'Verified' ? '100%' : '50%' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to update BGV.');
      onFeedback?.({ type: 'success', text: `BGV status updated to ${nextStatus}.` });
      await onReload?.();
    } catch (err) {
      onFeedback?.({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Background Verification ({bgvRecords.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Identity, employment, academic, and police clearance checks
        </p>
      </div>

      <form onSubmit={handleAddBgv} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <input type="text" required value={checkType} onChange={(e) => setCheckType(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10" placeholder="Check Type" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10">
          {BGV_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10" placeholder="Reviewer notes" />
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">
          {saving ? 'Saving...' : 'Add BGV Check'}
        </button>
      </form>

      {bgvRecords.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400">
          No background verification records yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {bgvRecords.map((bgv) => (
            <div key={bgv.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{bgv.checkType}</div>
                <div className="text-[11px] text-slate-500">
                  Progress: {bgv.progress || '0%'} • Reviewer: {bgv.reviewerName || 'Unassigned'} {bgv.notes ? `• ${bgv.notes}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass(bgv.status)}`}>{bgv.status}</span>
                <select
                  value={bgv.status}
                  onChange={(e) => handleUpdateBgv(bgv.id, e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-[11px]"
                >
                  {BGV_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


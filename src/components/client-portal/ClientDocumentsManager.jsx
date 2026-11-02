import React, { useState } from 'react';
import {
  FileText, Upload, Download, CheckCircle2, AlertCircle, Clock,
  Trash2, Plus, ShieldCheck, X, FileCheck
} from 'lucide-react';
import { CLIENT_PORTAL_SERVICES_CATALOG } from '../../data/clientPortalWorkflows';

export const ClientDocumentsManager = ({
  documents = [],
  services = [],
  onUploadDocument,
  onDeleteDocument,
  initialPreselectedService = null,
  initialPreselectedDocSlot = null
}) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(Boolean(initialPreselectedService || initialPreselectedDocSlot));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [docForm, setDocForm] = useState({
    documentId: initialPreselectedDocSlot?.id || '',
    enquiryId: initialPreselectedService?.id || initialPreselectedDocSlot?.enquiryId || (services[0]?.id || ''),
    serviceId: initialPreselectedService?.serviceId || initialPreselectedDocSlot?.serviceId || (services[0]?.serviceId || 'intl-consult'),
    documentName: initialPreselectedDocSlot?.documentName || '',
    documentCategory: initialPreselectedDocSlot?.documentCategory || 'Supporting Document',
    notes: '',
    fileName: '',
    fileData: '',
    fileType: ''
  });

  const handleOpenUploadModal = (slotDoc = null, serviceEnq = null) => {
    setUploadError('');
    setDocForm({
      documentId: slotDoc?.id || '',
      enquiryId: slotDoc?.enquiryId || serviceEnq?.id || (services[0]?.id || ''),
      serviceId: slotDoc?.serviceId || serviceEnq?.serviceId || (services[0]?.serviceId || 'intl-consult'),
      documentName: slotDoc?.documentName || '',
      documentCategory: slotDoc?.documentCategory || 'Supporting Document',
      notes: '',
      fileName: '',
      fileData: '',
      fileType: ''
    });
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      setUploadError('Invalid file format. Only PDF, JPG, JPEG, and PNG files are permitted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds maximum size of 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileData: reader.result,
        fileType: file.type || 'application/pdf',
        documentName: prev.documentName || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!docForm.documentName.trim()) {
      setUploadError('Please enter a document title.');
      return;
    }
    if (!docForm.fileName || !docForm.fileData) {
      setUploadError('Please select a PDF, JPG, JPEG, or PNG file to upload.');
      return;
    }

    setUploading(true);
    try {
      const matchedEnq = services.find((s) => s.id === docForm.enquiryId);
      const matchedCat = CLIENT_PORTAL_SERVICES_CATALOG.find((c) => c.id === docForm.serviceId);
      await onUploadDocument({
        ...docForm,
        serviceTitle: matchedEnq?.serviceTitle || matchedCat?.title || 'Advisory Service'
      });
      setUploadModalOpen(false);
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (statusFilter === 'All') return true;
    return d.verificationStatus === statusFilter;
  });

  const counts = {
    total: documents.length,
    verified: documents.filter((d) => d.verificationStatus === 'Verified').length,
    pending: documents.filter((d) => d.verificationStatus === 'Pending Verification').length,
    actionRequired: documents.filter((d) => d.verificationStatus === 'Requested' || d.verificationStatus === 'Rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Upload Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400">
            Encrypted Document Vault
          </span>
          <h2 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white">
            My Documents & Verification Checklist
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload required transcripts, passports, trade licenses, and credentials (PDF, JPG, JPEG, PNG — max 10MB).
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenUploadModal()}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold text-xs shadow-gold-glow flex items-center gap-2 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: counts.total, color: 'text-navy-900 dark:text-white', bg: 'bg-slate-50 dark:bg-navy-900' },
          { label: 'Verified & Approved', value: counts.verified, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Pending Verification', value: counts.pending, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Action Required / Requested', value: counts.actionRequired, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5' }
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border border-slate-200 dark:border-navy-800 ${stat.bg}`}>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{stat.label}</span>
            <span className={`font-serif text-2xl font-extrabold mt-1 block ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Requested', 'Pending Verification', 'Verified', 'Rejected'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === st
                ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:border-gold-500/40'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl bg-white dark:bg-navy-900 border transition shadow-sm flex flex-col justify-between space-y-4 ${
                doc.verificationStatus === 'Rejected'
                  ? 'border-rose-500/50'
                  : doc.verificationStatus === 'Requested'
                  ? 'border-amber-500/50'
                  : 'border-slate-200 dark:border-navy-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {doc.serviceTitle || 'General Advisory'} • {doc.documentCategory}
                      </span>
                      <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                        {doc.documentName}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      doc.verificationStatus === 'Verified'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : doc.verificationStatus === 'Rejected'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : doc.verificationStatus === 'Requested'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {doc.verificationStatus}
                  </span>
                </div>

                {doc.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Verification Revision Needed:</strong>
                      <span>{doc.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {doc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-slate-500">
                  {doc.fileName ? (
                    <span>File: <strong className="text-slate-700 dark:text-slate-300">{doc.fileName}</strong></span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Requested by {doc.requestedBy || 'Revival Consultant'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {doc.fileName && (
                    <a
                      href={`/api/client-portal/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-gold-500" />
                      <span>Download</span>
                    </a>
                  )}

                  {(doc.verificationStatus === 'Requested' || doc.verificationStatus === 'Rejected') && (
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{doc.verificationStatus === 'Rejected' ? 'Upload Revised File' : 'Fulfill Request'}</span>
                    </button>
                  )}

                  {doc.verificationStatus === 'Pending Verification' && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove pending upload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-10 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center space-y-3">
            <FileCheck className="w-10 h-10 text-gold-500 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">No Documents Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your academic transcripts, passport copies, or corporate registration documents to accelerate service verification.
            </p>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                Secure Document Upload
              </span>
              <h3 className="font-serif text-xl font-extrabold text-navy-900 dark:text-white">
                {docForm.documentId ? 'Fulfill / Replace Document' : 'Upload Service Document'}
              </h3>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmitUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Associated Service Enquiry
                </label>
                <select
                  value={docForm.enquiryId}
                  onChange={(e) => {
                    const enq = services.find((s) => s.id === e.target.value);
                    setDocForm({
                      ...docForm,
                      enquiryId: e.target.value,
                      serviceId: enq?.serviceId || docForm.serviceId
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="">General Account Document</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceTitle} (#{s.referenceNumber || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Document Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.documentName}
                    onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })}
                    placeholder="e.g. Passport Copy / Class 12 Transcript"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docForm.documentCategory}
                    onChange={(e) => setDocForm({ ...docForm, documentCategory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    <option>Academic Transcripts</option>
                    <option>Passport & Identity</option>
                    <option>Corporate Compliance</option>
                    <option>Visa & Immigration</option>
                    <option>Statement of Purpose / CV</option>
                    <option>Supporting Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Select File (PDF, JPG, JPEG, PNG — Max 10MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-dashed border-gold-500/50 text-slate-700 dark:text-slate-300 cursor-pointer"
                />
                {docForm.fileName && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    ✓ Selected: {docForm.fileName}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Notes for Consultant (Optional)
                </label>
                <input
                  type="text"
                  value={docForm.notes}
                  onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                  placeholder="Any additional context regarding this document..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-extrabold shadow-gold-glow cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload & Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


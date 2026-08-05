import React, { useState } from 'react';
import { 
  FileText, ShieldAlert, Download, Eye, AlertTriangle, Upload, 
  CheckCircle2, Clock, X, Cloud, Lock, Check 
} from 'lucide-react';

export const CrmDocumentation = () => {
  const [documents, setDocuments] = useState([
    { id: 'DOC-101', candidate: 'Alexander Wright', docName: 'UK_Passport_Scan.pdf', type: 'Passport', expiry: '2031-10-15', status: 'Valid', version: 'v2.1', size: '2.4 MB' },
    { id: 'DOC-102', candidate: 'Elena Rostova', docName: 'MOM_Work_Pass_IPA.pdf', type: 'Visa Approval', expiry: '2026-09-01', status: 'Expiring Soon', version: 'v1.0', size: '1.8 MB' },
    { id: 'DOC-103', candidate: 'Dr. Sarah Al-Mansoori', docName: 'Saudi_Prometric_License.pdf', type: 'Medical License', expiry: '2028-04-20', status: 'Valid', version: 'v1.2', size: '3.1 MB' },
    { id: 'DOC-104', candidate: 'Rajesh Subramanian', docName: 'Degree_Attestation_IIT.pdf', type: 'Degree', expiry: '2035-12-31', status: 'Attested', version: 'v1.0', size: '4.2 MB' }
  ]);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  const [newDoc, setNewDoc] = useState({
    candidate: 'Alexander Wright',
    docName: 'Offer_Letter_Signed.pdf',
    type: 'Offer Letter',
    expiry: '2027-08-01',
    size: '1.5 MB'
  });

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewDoc({
        ...newDoc,
        docName: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
  };

  const handleUploadDoc = (e) => {
    e.preventDefault();
    const docObj = {
      id: 'DOC-' + Math.floor(200 + Math.random() * 800),
      candidate: newDoc.candidate,
      docName: newDoc.docName,
      type: newDoc.type,
      expiry: newDoc.expiry,
      status: 'Valid',
      version: 'v1.0',
      size: newDoc.size || '1.5 MB'
    };
    setDocuments([docObj, ...documents]);
    setUploadModalOpen(false);
    setNotificationMsg(`✓ Successfully encrypted and uploaded '${docObj.docName}' to AWS S3 Compliance Vault!`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const triggerDownload = (doc) => {
    const docName = typeof doc === 'string' ? doc : doc.docName;
    const candidate = doc.candidate || 'Alexander Wright';
    const type = doc.type || 'Compliance Audit Certificate';
    const id = doc.id || 'DOC-VERIFIED';
    const expiry = doc.expiry || '2031-10-15';
    const size = doc.size || '2.4 MB';

    const text = `=====================================================
SIR RECRUITMENT COMPLIANCE VAULT - VERIFIED DOCUMENT
=====================================================
Document Name: ${docName}
Document ID: ${id}
Candidate Name: ${candidate}
Document Type: ${type}
Expiration Date: ${expiry}
Status: Valid & Attested
Version: v2.1
File Size: ${size}
Encryption: 256-Bit SSL AWS S3 (Bucket: sir-recruitment-compliance-vault)
Security Checksum: #SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}
=====================================================
THIS IS AN OFFICIAL VERIFIED DIGITAL COMPLIANCE CERTIFICATE.
DISTRIBUTED UNDER SIR RECRUITMENT ENTERPRISE COMPLIANCE GOVERNANCE.
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotificationMsg(`Successfully downloaded '${docName}' from AWS S3 Vault!`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleDispatchRenewal = () => {
    setNotificationMsg("✓ Renewal alert email & SMS dispatched to candidate Elena Rostova for Singapore MOM IPA Visa Approval (Expires in 28 days). Renewal case logged!");
    setDocuments(documents.map(d => d.id === 'DOC-102' ? { ...d, status: 'Renewal Dispatched' } : d));
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">AWS S3 Compliance Vault</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Documentation Vault & Expiry Alerts</h1>
          <p className="text-slate-600 dark:text-slate-400">Store resumes, passports, visas, attestations, employment contracts, Aadhaar & PAN with version history.</p>
        </div>

        <button 
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document to Cloud</span>
        </button>
      </div>

      {/* Notification Alert Banner */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Expiry Alerts Warning Box */}
      <div className="p-4 bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-300">1 Document Nearing Expiration Alert</h4>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Candidate Elena Rostova's Singapore MOM IPA Visa Approval expires in less than 30 days.</p>
          </div>
        </div>
        <button 
          onClick={handleDispatchRenewal}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer shrink-0 transition"
        >
          Dispatch Renewal Request
        </button>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800 glass-card bg-white dark:bg-navy-900 shadow-luxury">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif border-b border-slate-200 dark:border-navy-800 uppercase tracking-wider text-[10px]">
              <th className="p-4 font-bold">Doc ID</th>
              <th className="p-4 font-bold">Candidate</th>
              <th className="p-4 font-bold">Document File Name</th>
              <th className="p-4 font-bold">Type</th>
              <th className="p-4 font-bold">Version</th>
              <th className="p-4 font-bold">Expiration Date</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-300">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{doc.id}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{doc.candidate}</td>
                <td className="p-4 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.docName}</span>
                </td>
                <td className="p-4"><span className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-navy-800 font-semibold text-[10px]">{doc.type}</span></td>
                <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{doc.version}</td>
                <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{doc.expiry}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                    doc.status === 'Valid' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-navy-800 cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => triggerDownload(doc)}
                      className="p-2 bg-slate-100 dark:bg-navy-950 text-amber-800 dark:text-gold-400 hover:text-amber-950 dark:hover:text-white rounded-lg border border-slate-300 dark:border-navy-800 cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-xl w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{previewDoc.docName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{previewDoc.type} • Candidate: {previewDoc.candidate} • Version: {previewDoc.version}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-center space-y-3">
              <FileText className="w-16 h-16 text-gold-500 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white text-sm">Secure Cloud PDF Viewer Simulation</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">File verified & stored in encrypted S3 bucket `sir-recruitment-compliance-vault`.</p>
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold px-3 py-1 rounded text-xs inline-block border border-emerald-300 dark:border-emerald-500/40">
                ✓ 256-bit SSL Verified Document
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => triggerDownload(previewDoc)} className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow cursor-pointer flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-navy-700 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Upload Document to Cloud Storage</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Candidate Name</label>
                <input required type="text" value={newDoc.candidate} onChange={e=>setNewDoc({...newDoc, candidate: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
                  <select value={newDoc.type} onChange={e=>setNewDoc({...newDoc, type: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500">
                    <option value="Resume">Resume</option>
                    <option value="Passport">Passport</option>
                    <option value="Visa Approval">Visa Approval</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Employment Contract">Employment Contract</option>
                    <option value="Medical Report">Medical Report</option>
                    <option value="PCC">Police Clearance (PCC)</option>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Expiration Date</label>
                  <input required type="text" value={newDoc.expiry} onChange={e=>setNewDoc({...newDoc, expiry: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Select File to Upload</label>
                <div className="relative p-4 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl text-center space-y-1 bg-slate-50 dark:bg-navy-950">
                  <input type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-gold-500 mx-auto" />
                  <p className="text-slate-700 dark:text-slate-300 font-bold">{newDoc.docName ? `Selected: ${newDoc.docName}` : 'Click or Drag & Drop PDF/JPG file here'}</p>
                  <p className="text-[10px] text-slate-500">{newDoc.size || 'Max 25 MB'}</p>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                Encrypt & Upload to AWS S3
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

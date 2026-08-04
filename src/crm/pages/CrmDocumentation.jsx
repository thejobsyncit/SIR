import React from 'react';
import { FileText, ShieldAlert, Download, Eye, AlertTriangle } from 'lucide-react';

export const CrmDocumentation = () => {
  const documents = [
    { id: 'DOC-101', candidate: 'Alexander Wright', docName: 'UK_Passport_Scan.pdf', type: 'Passport', expiry: '2031-10-15', status: 'Valid' },
    { id: 'DOC-102', candidate: 'Elena Rostova', docName: 'MOM_Work_Pass_IPA.pdf', type: 'Visa Approval', expiry: '2026-09-01', status: 'Expiring Soon' }
  ];

  return (
    <div className="space-y-6 text-xs">
      <div className="flex justify-between items-center bg-navy-950 p-6 rounded-3xl border border-navy-800">
        <div>
          <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Compliance Cloud Storage</span>
          <h1 className="font-serif text-2xl font-bold text-white mt-1">Documentation Vault & Expiry Alerts</h1>
          <p className="text-slate-400">Store resumes, degree attestations, passports, visas, and employment contracts.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy-800 glass-card bg-navy-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-navy-950 text-gold-400 font-serif border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <th className="p-4">Doc ID</th>
              <th className="p-4">Candidate</th>
              <th className="p-4">File Name</th>
              <th className="p-4">Document Type</th>
              <th className="p-4">Expiration Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800 text-slate-300">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-navy-950/60">
                <td className="p-4 font-mono font-bold text-white">{doc.id}</td>
                <td className="p-4 font-bold text-white">{doc.candidate}</td>
                <td className="p-4">{doc.docName}</td>
                <td className="p-4">{doc.type}</td>
                <td className="p-4 font-mono">{doc.expiry}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded font-bold ${doc.status === 'Valid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="px-3 py-1 bg-navy-950 text-gold-400 font-bold rounded-lg border border-navy-800 hover:bg-gold-500 hover:text-navy-950 transition">
                    Preview / Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

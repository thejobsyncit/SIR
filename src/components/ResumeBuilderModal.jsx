import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, X, Plus, Trash2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ResumeBuilderModal = () => {
  const { activeModal, setActiveModal } = useApp();
  const [step, setStep] = useState(1);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Alexander Wright',
    email: 'a.wright@executive-tech.com',
    phone: '+971 50 123 9876',
    location: 'Dubai, UAE',
    summary: 'Senior Engineering Manager with 10+ years experience delivering $50M+ infrastructure & MEP projects in GCC region. Expert in FIDIC contracts and MOHRE compliance.',
    skills: 'Project Management, FIDIC Contracts, Primavera P6, Team Leadership, Budget Control',
    education: 'B.Sc. Civil Engineering - University of Manchester',
    experience: 'Senior PM at Al Habtoor Contracting (2021-Present) | Project Lead at Emaar Properties (2017-2021)'
  });

  if (activeModal !== 'resume-builder') return null;

  const handleDownloadPDF = async () => {
    setShowExportOptions(false);
    setDownloading(true);
    try {
      const element = document.getElementById('printable-cv');
      if (element) {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
        pdf.save(`${formData.fullName.replace(/\s+/g, '_')}_Executive_Resume.pdf`);
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-3xl w-full p-6 shadow-luxury relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white">SIR PDF Resume Builder</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Generate Executive ATS-Formatted CVs for UAE & GCC Markets</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, '')})}
                  placeholder="Letters only..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Phone Number (with Country Code)</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Target Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Professional Executive Summary</label>
              <textarea 
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Core Competencies & Skills (Comma Separated)</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Work History Summary</label>
              <textarea 
                rows={2}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95"
            >
              Generate ATS Resume Preview →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live ATS Printable CV Template */}
            <div id="printable-cv" className="bg-white text-navy-950 p-8 rounded-xl border shadow-md font-sans text-xs space-y-4">
              <div className="border-b-2 border-navy-900 pb-3 flex justify-between items-end">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-900 tracking-tight">{formData.fullName}</h2>
                  <p className="text-slate-600 font-semibold">{formData.location} • {formData.phone} • {formData.email}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold uppercase">
                  Verified Executive CV Format
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Executive Summary</h3>
                <p className="text-slate-700 leading-relaxed">{formData.summary}</p>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Core Competencies</h3>
                <p className="text-slate-800 font-semibold">{formData.skills}</p>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Work History</h3>
                <p className="text-slate-700">{formData.experience}</p>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Education & Qualifications</h3>
                <p className="text-slate-700">{formData.education}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-200 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-300"
              >
                ← Edit Details
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Generating PDF...' : 'Download PDF Resume (.pdf)'}</span>
              </button>

              <button 
                onClick={() => setShowExportOptions(true)}
                className="flex-1 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Export Options...</span>
              </button>
            </div>
          </div>
        )}

        {/* Export Permission Choice Dialog */}
        {showExportOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4 relative">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h4 className="font-serif font-bold text-navy-950 dark:text-white text-base">Select Resume Output Action</h4>
                <button onClick={() => setShowExportOptions(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">How would you like to export candidate <strong className="text-gold-600 dark:text-gold-400">{formData.fullName}</strong>'s executive CV?</p>
              
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold text-xs flex items-center space-x-3 transition text-left group"
                >
                  <Download className="w-6 h-6 shrink-0 text-emerald-500 group-hover:scale-110 transition" />
                  <div>
                    <p className="font-bold text-sm">Download PDF Document Directly (.pdf)</p>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">Saves high-resolution .pdf document directly to your device without opening print window.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setShowExportOptions(false); window.print(); }}
                  className="w-full p-4 rounded-xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-navy-950 dark:text-gold-400 font-bold text-xs flex items-center space-x-3 transition text-left group"
                >
                  <Printer className="w-6 h-6 shrink-0 text-gold-500 group-hover:scale-110 transition" />
                  <div>
                    <p className="font-bold text-sm">Print via Browser / Save as PDF</p>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">Launches standard browser Print window for hardcopy or Save-as-PDF.</p>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <button onClick={() => setShowExportOptions(false)} className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

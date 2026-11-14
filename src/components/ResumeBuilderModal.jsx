import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, X, Plus, Trash2, Printer, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ResumeBuilderModal = () => {
  const { activeModal, setActiveModal, user } = useApp();
  const [step, setStep] = useState(1);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Initialize cleanly with user's actual profile if available, or empty fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    education: '',
    experience: ''
  });

  // Sync profile data when modal opens
  useEffect(() => {
    if (activeModal === 'resume-builder') {
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: (user?.phone || '').includes('http') ? '' : (user?.phone || ''),
        location: user?.location || '',
        summary: '',
        skills: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || ''),
        education: user?.qualification || user?.education || '',
        experience: user?.experience || ''
      });
      setStep(1);
    }
  }, [activeModal, user]);

  const handleClearForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: '',
      education: '',
      experience: ''
    });
  };

  if (activeModal !== 'resume-builder') return null;

  const handleDownloadPDF = async () => {
    setShowExportOptions(false);
    setDownloading(true);
    try {
      const element = document.getElementById('printable-cv');
      if (element) {
        // High-resolution canvas capture with standard desktop width
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#FFFFFF',
          windowWidth: 800
        });

        // Exact Standard A4 Dimensions (210mm x 297mm)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;
        const marginX = 14;
        const marginY = 14;
        const printableWidth = pdfWidth - (marginX * 2); // 182mm
        const printableHeight = pdfHeight - (marginY * 2); // 269mm

        const imgWidth = printableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= printableHeight) {
          // Fits within single A4 page with 14mm margins
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', marginX, marginY, imgWidth, imgHeight);
        } else {
          // Multi-page A4 handling maintaining strict margins on each page
          let heightLeft = imgHeight;
          let page = 1;
          while (heightLeft > 0) {
            if (page > 1) {
              pdf.addPage('a4', 'p');
            }
            pdf.addImage(
              canvas.toDataURL('image/png'),
              'PNG',
              marginX,
              marginY - ((page - 1) * printableHeight),
              imgWidth,
              imgHeight
            );
            heightLeft -= printableHeight;
            page++;
          }
        }

        const fileName = (formData.fullName || 'Executive_Candidate')
          .trim()
          .replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${fileName}_A4_Resume.pdf`);
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-2xl max-w-3xl w-full p-6 shadow-luxury relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Revival PDF Resume Builder</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Generate Executive ATS-Formatted CVs for UAE & GCC Markets</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Enter your professional details below to generate an ATS-compliant resume:
              </span>
              <button
                type="button"
                onClick={handleClearForm}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                title="Clear all fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, '')})}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. rahul.sharma@gmail.com"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Phone Number (with Country Code) *</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Location / Target City *</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Dubai, UAE / Chennai, India"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Professional Executive Summary</label>
              <textarea 
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="Brief 2-3 sentence summary of your career accomplishments, expertise, and leadership..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Core Competencies & Key Technical Skills</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g. Project Management, AutoCAD, MEP Systems, Team Leadership, Budget Control"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Highest Degree / Education</label>
                <input 
                  type="text" 
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                  placeholder="e.g. B.Tech Mechanical Engineering"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Work History Summary</label>
                <input 
                  type="text" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g. Senior PM at Al Habtoor (2021-Present)"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white font-medium focus:border-gold-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearForm}
                className="py-3 px-4 border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
              >
                Generate ATS Resume Preview →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live ATS Printable CV Template strictly formatted for A4 */}
            <div id="printable-cv" className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl border border-slate-300 shadow-sm font-sans text-xs space-y-4 max-w-[780px] mx-auto box-border">
              <div className="border-b-2 border-navy-900 pb-3 flex justify-between items-end">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-navy-900 tracking-tight">
                    {formData.fullName || 'Executive Candidate Name'}
                  </h2>
                  <p className="text-slate-600 font-semibold pt-1">
                    {[formData.location, formData.phone, formData.email].filter(Boolean).join(' • ') || 'Contact Details'}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Verified Executive CV Format
                </div>
              </div>

              {formData.summary && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Executive Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{formData.summary}</p>
                </div>
              )}

              {formData.skills && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Core Competencies</h3>
                  <p className="text-slate-800 font-semibold">{formData.skills}</p>
                </div>
              )}

              {formData.experience && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Work History</h3>
                  <p className="text-slate-700">{formData.experience}</p>
                </div>
              )}

              {formData.education && (
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-navy-900 border-b border-slate-200 pb-1 mb-1">Education & Qualifications</h3>
                  <p className="text-slate-700">{formData.education}</p>
                </div>
              )}
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
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4 relative">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base">Select Resume Output Action</h4>
                <button onClick={() => setShowExportOptions(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"><X className="w-5 h-5" /></button>
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
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-slate-900 dark:text-white dark:text-gold-400 font-bold text-xs flex items-center space-x-3 transition text-left group"
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

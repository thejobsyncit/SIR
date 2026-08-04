import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, X, Plus, Trash2, Printer } from 'lucide-react';

export const ResumeBuilderModal = () => {
  const { activeModal, setActiveModal } = useApp();
  const [step, setStep] = useState(1);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-3xl w-full p-6 shadow-luxury relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">SIR PDF Resume Builder</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate Executive ATS-Formatted CVs for UAE & GCC Markets</p>
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
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
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
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Target Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Professional Executive Summary</label>
              <textarea 
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Core Competencies & Skills (Comma Separated)</label>
              <input 
                type="text" 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Work History Summary</label>
              <textarea 
                rows={2}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2.5 text-navy-900 dark:text-white"
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

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-slate-200 text-navy-900 font-bold text-xs rounded-xl"
              >
                ← Edit Details
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download PDF Resume</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

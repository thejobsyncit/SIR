import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { ASSIGNED_RECRUITERS } from '../data/mockCrmData';
import {
  Users, Search, Plus, Sparkles, FileText, CheckCircle2, Shield, Eye,
  Bookmark, Filter, X, Send, UserCheck, Trash2, AlertCircle, Download,
  ExternalLink, Mail, Phone, MapPin, Globe, Calendar, Briefcase,
  GraduationCap, ShieldCheck, Clock, Building, Award, Check
} from 'lucide-react';
import { CrmAddCandidateModal } from '../components/CrmAddCandidateModal';
import ScrollReveal from '../../components/ScrollReveal';
import { CrmDeleteConfirmModal } from '../components/CrmDeleteConfirmModal';

export const CrmCandidates = () => {
  const {
    candidates,
    setAiDrawerOpen,
    globalAddCandidateOpen,
    setGlobalAddCandidateOpen,
    isSuperAdmin,
    deleteCandidate,
    selectedCandidate,
    setSelectedCandidate
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('All');
  const [selectedRecruiter, setSelectedRecruiter] = useState('All');
  const [viewCand, setViewCand] = useState(null);
  const [deleteConfirmCand, setDeleteConfirmCand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // Synchronize when a candidate is selected externally (e.g. from recruiter workspace or search)
  useEffect(() => {
    if (selectedCandidate) {
      setViewCand(selectedCandidate);
    }
  }, [selectedCandidate]);

  const handleDeleteCandidate = (cand) => {
    setDeleteConfirmCand(cand);
  };

  const confirmDeleteCandidate = async () => {
    if (!deleteConfirmCand) return;
    setIsDeleting(true);
    try {
      if (deleteCandidate) {
        await deleteCandidate(deleteConfirmCand.id, {
          name: deleteConfirmCand.name,
          nationality: deleteConfirmCand.nationality
        });
      }
      if (viewCand && viewCand.id === deleteConfirmCand.id) {
        setViewCand(null);
      }
      if (setSelectedCandidate && selectedCandidate?.id === deleteConfirmCand.id) {
        setSelectedCandidate(null);
      }
      setStatusNotice(`✓ Candidate "${deleteConfirmCand.name}" (${deleteConfirmCand.id}) permanently removed.`);
      setDeleteConfirmCand(null);
      setTimeout(() => setStatusNotice(''), 4000);
    } catch (err) {
      alert('Failed to delete candidate: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Enriched active candidate object that merges backend database data with any live local storage updates
  const activeCand = useMemo(() => {
    if (!viewCand) return null;
    let enriched = { ...viewCand };

    // Also look up in fresh candidates array from CRM context
    const currentInContext = candidates.find(c => c.id === viewCand.id || (c.email && c.email.toLowerCase() === (viewCand.email || '').toLowerCase()));
    if (currentInContext) {
      enriched = { ...enriched, ...currentInContext };
    }

    // Check localStorage sir_candidates_db for any recent candidate registration updates
    try {
      const localDbStr = localStorage.getItem('sir_candidates_db');
      if (localDbStr) {
        const localDb = JSON.parse(localDbStr);
        const emailKey = (viewCand.email || '').toLowerCase().trim();
        const candLocal = localDb[emailKey];
        if (candLocal) {
          enriched = {
            ...enriched,
            name: candLocal.name || enriched.name,
            phone: candLocal.phone || enriched.phone,
            resumeName: candLocal.resumeName || enriched.resumeName,
            resumeUrl: candLocal.resumeUrl || enriched.resumeUrl,
            resumeSize: candLocal.resumeSize || enriched.resumeSize,
            citizenship: candLocal.citizenship || enriched.citizenship,
            dob: candLocal.dob || enriched.dob,
            gender: candLocal.gender || enriched.gender,
            location: candLocal.location || enriched.location,
            preferredCountry: candLocal.preferredCountry || enriched.preferredCountry,
            qualification: candLocal.qualification || candLocal.education || enriched.qualification,
            education: candLocal.education || candLocal.qualification || enriched.education,
            mohreAttested: candLocal.mohreAttested !== undefined ? candLocal.mohreAttested : enriched.mohreAttested,
            skills: (Array.isArray(candLocal.skills) && candLocal.skills.length > 0) ? candLocal.skills : enriched.skills
          };
        }
      }
    } catch {}

    // Check localStorage for applications
    try {
      const appsStr = localStorage.getItem(`sir_applications_${viewCand.id}`);
      if (appsStr) {
        const localApps = JSON.parse(appsStr);
        if (Array.isArray(localApps) && localApps.length > 0) {
          const existingIds = new Set((enriched.applications || []).map(a => a.id || a.jobId));
          const newApps = localApps.filter(a => !existingIds.has(a.id || a.jobId));
          enriched.applications = [...(enriched.applications || []), ...newApps];
        }
      }
    } catch {}

    return enriched;
  }, [viewCand, candidates]);

  // Handle downloading candidate uploaded resume / CV
  const handleDownloadCv = (cand) => {
    if (!cand) return;
    const filename = cand.resumeName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;

    if (cand.resumeUrl && cand.resumeUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = cand.resumeUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (cand.resumeUrl && (cand.resumeUrl.startsWith('http') || cand.resumeUrl.startsWith('blob:'))) {
      const link = document.createElement('a');
      link.href = cand.resumeUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Fallback: Export and print candidate dossier
    handleExportDossier(cand);
  };

  // Handle viewing / previewing candidate CV in separate tab or window
  const handlePreviewCv = (cand) => {
    if (!cand) return;
    if (cand.resumeUrl && cand.resumeUrl.startsWith('data:')) {
      try {
        const arr = cand.resumeUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      } catch (e) {
        console.warn('Blob preview fallback notice:', e);
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`<iframe src="${cand.resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
        return;
      }
    }

    if (cand.resumeUrl) {
      window.open(cand.resumeUrl, '_blank');
      return;
    }

    handleExportDossier(cand);
  };

  // Generate and print candidate summary dossier
  const handleExportDossier = (cand) => {
    if (!cand) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the candidate dossier.');
      return;
    }

    const skillsHtml = (Array.isArray(cand.skills) ? cand.skills : []).map(s => `<span style="background:#f1f5f9;padding:4px 8px;border-radius:6px;font-size:12px;margin-right:6px;display:inline-block;margin-bottom:6px;">${s}</span>`).join('');
    const appsHtml = (Array.isArray(cand.applications) && cand.applications.length > 0)
      ? cand.applications.map(a => `
        <div style="border-bottom:1px solid #e2e8f0;padding:8px 0;">
          <strong>${a.jobTitle || 'Applied Vacancy'}</strong> - ${a.company || 'Corporate Client'} (${a.location || 'GCC'})
          <br/><span style="font-size:11px;color:#64748b;">Applied: ${a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : 'Recent'} | Status: ${a.status || 'Under Review'}</span>
        </div>
      `).join('')
      : '<p style="color:#64748b;font-style:italic;">Candidate registered in Revival International Talent Pool</p>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Candidate Profile Dossier - ${cand.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 2px solid #d97706; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; margin: 0; color: #0f172a; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .badge { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #d97706; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px; }
          .field { margin-bottom: 6px; }
          .field-label { color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; }
          .field-value { font-weight: 600; color: #0f172a; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${cand.name}</h1>
            <p class="sub">${cand.id} • ${cand.currentRole || 'Executive Candidate'} • ${cand.nationality || 'UAE'}</p>
          </div>
          <div>
            <span class="badge">Revival Verified Dossier</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Personal & Contact Profile</div>
          <div class="grid">
            <div class="field"><div class="field-label">Email Address</div><div class="field-value">${cand.email || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Phone Number</div><div class="field-value">${cand.phone || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Nationality</div><div class="field-value">${cand.nationality || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Citizenship</div><div class="field-value">${cand.citizenship || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Current Location</div><div class="field-value">${cand.location || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Preferred Destination</div><div class="field-value">${cand.preferredCountry || 'UAE / GCC'}</div></div>
            <div class="field"><div class="field-label">Date of Birth</div><div class="field-value">${cand.dob || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Gender</div><div class="field-value">${cand.gender || 'N/A'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Experience & Qualifications</div>
          <div class="grid">
            <div class="field"><div class="field-label">Current Role / Designation</div><div class="field-value">${cand.currentRole || 'Executive Candidate'}</div></div>
            <div class="field"><div class="field-label">Current Employer</div><div class="field-value">${cand.currentEmployer || 'Revival International Talent Pool'}</div></div>
            <div class="field"><div class="field-label">Total Work Experience</div><div class="field-value">${cand.experience || '3-5 Years'}</div></div>
            <div class="field"><div class="field-label">Highest Degree / Qualification</div><div class="field-value">${cand.qualification || cand.education || 'Bachelor Degree / Professional Diploma'}</div></div>
            <div class="field"><div class="field-label">MOHRE Attestation Status</div><div class="field-value">${cand.mohreAttested ? '✓ Attested by UAE / Saudi Embassy (MOHRE Verified)' : 'Pending Embassy Attestation'}</div></div>
            <div class="field"><div class="field-label">Expected Salary</div><div class="field-value">${cand.expectedSalary || 'Market Standard'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Key Technical Skills</div>
          <div>${skillsHtml || '<span style="color:#64748b;">General Talent</span>'}</div>
        </div>

        <div class="section">
          <div class="section-title">AI Skill Match Summary</div>
          <p style="font-size:13px;color:#334155;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${cand.aiSummary || 'Profile registered with verified credentials.'}</p>
        </div>

        <div class="section">
          <div class="section-title">Applied Vacancies & Mandates</div>
          ${appsHtml}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = candidates.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.skills && Array.isArray(c.skills) && c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                          (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.currentRole || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNat = selectedNationality === 'All' || c.nationality === selectedNationality;
    const matchesRecruiter = selectedRecruiter === 'All' || c.assignedRecruiter === selectedRecruiter;
    return matchesSearch && matchesNat && matchesRecruiter;
  });

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <ScrollReveal>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Human Capital Index</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Candidate Management System</h1>
          <p className="text-slate-500 dark:text-slate-400">Total Talent Pool: <strong className="text-slate-900 dark:text-white font-bold">{candidates.length} Registered & Verified Candidates</strong></p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setAiDrawerOpen(true)}
            className="px-4 py-2.5 bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Parser</span>
          </button>
          
          <button 
            onClick={() => setGlobalAddCandidateOpen(true)}
            className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Candidate</span>
          </button>
        </div>
      </div>
      </ScrollReveal>

      {/* Status Notification Toast */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice('')} className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <ScrollReveal>
      <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search candidate by name, email, ID, role, skills, or passport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold-500 font-semibold"
          />
        </div>

        <div className="flex gap-2">
          <select 
            value={selectedRecruiter}
            onChange={(e) => setSelectedRecruiter(e.target.value)}
            className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Assigned Recruiters ({ASSIGNED_RECRUITERS.length})</option>
            {ASSIGNED_RECRUITERS.map(rec => (
              <option key={rec.id} value={rec.name}>{rec.name}</option>
            ))}
          </select>

          <select 
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Nationalities</option>
            <option value="UAE">UAE</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="India">India</option>
            <option value="Poland">Poland</option>
          </select>
        </div>
      </div>
      </ScrollReveal>

      {/* Candidates Cards Grid */}
      <ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cand) => (
          <div 
            key={cand.id}
            onClick={() => setViewCand(cand)}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-3 hover:border-gold-500 transition cursor-pointer flex flex-col justify-between shadow-sm group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img
                    src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={cand.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gold-500 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-gold-600 transition">{cand.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {cand.id} • {cand.nationality || 'UAE'}
                      {cand.citizenship && ` • ${cand.citizenship}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {(cand.resumeName || cand.resumeUrl || cand.documents?.some(d => d.type === 'Resume')) ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] flex items-center gap-1 border border-emerald-500/30" title="CV / Resume Attached">
                      <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>CV Attached</span>
                    </span>
                  ) : null}
                  <span className="w-7 h-7 rounded-full border border-gold-500 text-gold-600 dark:text-gold-400 font-extrabold text-[11px] flex items-center justify-center bg-gold-500/10" title="AI Profile Score">
                    {cand.score || 88}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1 text-[11px] border border-slate-200 dark:border-navy-800">
                <p><strong className="text-slate-500 dark:text-slate-400">Role:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cand.currentRole || 'Executive Candidate'}</span></p>
                <p><strong className="text-slate-500 dark:text-slate-400">Employer:</strong> <span className="text-slate-900 dark:text-white font-semibold">{cand.currentEmployer || 'Revival International Candidate'}</span></p>
                {cand.email && (
                  <p><strong className="text-slate-500 dark:text-slate-400">Email:</strong> <span className="text-slate-800 dark:text-slate-200 font-mono text-[10px]">{cand.email}</span></p>
                )}
                <p><strong className="text-slate-500 dark:text-slate-400">Expected Salary:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cand.expectedSalary || 'Market Standard'}</span></p>
              </div>

              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                "{cand.aiSummary || 'Registered candidate in Revival Talent Pool.'}"
              </p>

              <div className="flex flex-wrap gap-1">
                {Array.isArray(cand.skills) && cand.skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-navy-950 text-gold-700 dark:text-gold-400 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-navy-800">
                    {s}
                  </span>
                ))}
                {Array.isArray(cand.skills) && cand.skills.length > 4 && (
                  <span className="text-[10px] text-slate-500 px-1 py-0.5 font-bold">
                    +{cand.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <div className="space-y-0.5">
                <span>Recruiter: <strong className="text-slate-900 dark:text-white">{cand.assignedRecruiter || 'Dhanalakshimi'}</strong></span>
                <span className="block bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold px-2 py-0.5 rounded uppercase w-fit">{cand.stage || 'lead'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewCand(cand);
                  }}
                  className="p-1.5 px-2.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 rounded-lg border border-gold-500/30 font-bold transition flex items-center gap-1 cursor-pointer"
                  title={`View Full Profile & CV for ${cand.name}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCandidate(cand);
                  }}
                  className="p-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50 font-bold transition flex items-center gap-1 cursor-pointer"
                  title={`Delete ${cand.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </ScrollReveal>

      {/* Comprehensive Candidate View Modal (With Full Details & Applied CV) */}
      {activeCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-luxury space-y-5 max-h-[92vh] overflow-y-auto text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={activeCand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeCand.name}
                  className="w-14 h-14 rounded-full border-2 border-gold-500 object-cover shadow-sm shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{activeCand.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gold-500/20 text-gold-700 dark:text-gold-400 uppercase tracking-wider">
                      {activeCand.stage || 'Lead'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      Score: {activeCand.score || 88}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{activeCand.id}</span>
                    <span>•</span>
                    <span>{activeCand.nationality || 'UAE'}</span>
                    {activeCand.citizenship && (
                      <>
                        <span>•</span>
                        <span>Citizen: {activeCand.citizenship}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Passport: {activeCand.passport || 'Standard (Verified)'}</span>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-300">Recruiter: {activeCand.assignedRecruiter || 'Dhanalakshimi'}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setViewCand(null);
                  if (setSelectedCandidate) setSelectedCandidate(null);
                }}
                className="p-1.5 text-slate-400 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Demographics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Email Address</p>
                  {activeCand.email ? (
                    <a href={`mailto:${activeCand.email}`} className="font-semibold text-slate-900 dark:text-white hover:text-gold-600 truncate block font-mono text-[11px]">
                      {activeCand.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Phone Number</p>
                  {activeCand.phone ? (
                    <a href={`tel:${activeCand.phone}`} className="font-semibold text-slate-900 dark:text-white hover:text-gold-600 truncate block font-mono text-[11px]">
                      {activeCand.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Current Location</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.location || activeCand.nationality || 'Dubai, UAE'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Nationality & Citizenship</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.nationality || 'UAE'} {activeCand.citizenship ? `(${activeCand.citizenship})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">DOB & Gender</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.dob || 'Not Provided'} {activeCand.gender ? `• ${activeCand.gender}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-600 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Target Destination</p>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {activeCand.preferredCountry || 'AE UAE (Dubai / Abu Dhabi)'}
                  </p>
                </div>
              </div>
            </div>

            {/* APPLIED RESUME / CV DOCUMENT SECTION (Crucial Core Feature) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-amber-500/5 border border-gold-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gold-500/20 text-gold-700 dark:text-gold-400 flex items-center justify-center shrink-0 border border-gold-500/30 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Candidate Applied Resume / CV</span>
                      {(activeCand.resumeName || activeCand.resumeUrl) ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> CV Attached
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                          Pending File Upload
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(activeCand.resumeName || activeCand.resumeUrl)
                        ? `Attached File: ${activeCand.resumeName || `${(activeCand.name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf`} (${activeCand.resumeSize || 'Verified Document'})`
                        : 'No direct CV file uploaded by candidate yet. You can export their registered profile dossier.'}
                    </p>
                  </div>
                </div>

                {/* Resume Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {(activeCand.resumeName || activeCand.resumeUrl) ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDownloadCv(activeCand)}
                        className="px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-gold-glow cursor-pointer"
                        title="Download Candidate CV File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePreviewCv(activeCand)}
                        className="px-3.5 py-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-navy-700"
                        title="View / Preview CV Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleExportDossier(activeCand)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-300 dark:border-navy-700 cursor-pointer"
                      title="Generate and Print Candidate Profile Dossier"
                    >
                      <FileText className="w-3.5 h-3.5 text-gold-600" />
                      <span>Print Profile Dossier</span>
                    </button>
                  )}
                </div>
              </div>

              {(activeCand.resumeName || activeCand.resumeUrl) && (
                <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-navy-900/70 p-2.5 rounded-xl border border-gold-500/20 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">📄 {activeCand.resumeName || `${activeCand.name.replace(/\s+/g, '_')}_CV.pdf`}</span>
                    <span className="text-slate-500 font-mono text-[10px]">({activeCand.resumeSize || 'Verified PDF / Doc'})</span>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Corporate Client Submission
                  </span>
                </div>
              )}
            </div>

            {/* Professional Career & Qualifications Details */}
            <div className="p-4 bg-slate-100 dark:bg-navy-950 rounded-2xl space-y-3 text-xs border border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-1.5 font-bold text-gold-700 dark:text-gold-400 uppercase tracking-wider text-[11px]">
                <Briefcase className="w-4 h-4" />
                <span>Professional Background & Qualifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Designation / Role</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeCand.currentRole || 'Executive Candidate'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Current Employer</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeCand.currentEmployer || 'Revival International Candidate'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Work Experience</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeCand.experience || '3-5 Years'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Highest Degree / Qualification</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeCand.qualification || activeCand.education || 'Bachelor Degree / Professional Diploma'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Expected Monthly Salary</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCand.expectedSalary || 'Market Standard'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Notice Period</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeCand.noticePeriod || '30 Days'}</strong>
                </div>
              </div>

              {/* MOHRE Attestation Status Badge */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Educational Degree Attestation:</span>
                {activeCand.mohreAttested ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>✓ Attested by UAE / Saudi Embassy (MOHRE Verified)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5 border border-amber-500/30">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Attestation Under Verification</span>
                  </span>
                )}
              </div>
            </div>

            {/* Key Technical Skills */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-gold-500" />
                <span>Key Technical Skills & Competencies</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(activeCand.skills) && activeCand.skills.length > 0 ? (
                  activeCand.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-gold-700 dark:text-gold-400 font-bold text-xs rounded-xl border border-slate-200 dark:border-navy-800"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-xs">General Talent Pool</span>
                )}
              </div>
            </div>

            {/* AI Skill Match & Profiling Summary */}
            <div className="p-4 bg-slate-100 dark:bg-navy-950 rounded-2xl space-y-1.5 text-xs border border-slate-200 dark:border-navy-800">
              <p className="font-bold text-gold-700 dark:text-gold-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>AI Skill Match & Profiling Summary</span>
              </p>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {activeCand.aiSummary || 'Profile registered with verified credentials in Revival International Candidate Database.'}
              </p>
            </div>

            {/* Applied Vacancies & Mandates History */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gold-500" />
                <span>Applied Vacancies & Mandates ({activeCand.applications?.length || 0})</span>
              </h4>
              {Array.isArray(activeCand.applications) && activeCand.applications.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCand.applications.map((app, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{app.jobTitle}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.company} • {app.location || 'GCC'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-gold-500/20 text-gold-700 dark:text-gold-400 uppercase">
                          {app.status || 'Under Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-100/60 dark:bg-navy-950/60 rounded-xl text-xs text-slate-500 italic border border-dashed border-slate-300 dark:border-navy-800">
                  Candidate registered in General Executive Talent Pool (No specific job applied yet).
                </div>
              )}
            </div>

            {/* Attached Compliance Documents (if any) */}
            {Array.isArray(activeCand.documents) && activeCand.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Attached Compliance Documents:
                </h4>
                <div className="space-y-1.5">
                  {activeCand.documents.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex justify-between items-center text-xs">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">📄 {doc.fileName || doc.name} ({doc.documentType || doc.type || 'Document'})</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ {doc.status || 'Verified'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
              <button 
                type="button"
                onClick={() => handleDeleteCandidate(activeCand)} 
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Candidate</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleExportDossier(activeCand)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300 dark:border-navy-700 cursor-pointer text-xs"
              >
                <FileText className="w-3.5 h-3.5 text-gold-600" />
                <span>Print Profile</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setViewCand(null);
                  if (setSelectedCandidate) setSelectedCandidate(null);
                }} 
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteConfirmCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-luxury space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Delete Candidate?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{deleteConfirmCand.name}</strong> (#{deleteConfirmCand.id})? All compliance documents and profile records will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCand(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCandidate}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Candidate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Add Candidate Modal */}
      <CrmAddCandidateModal 
        isOpen={globalAddCandidateOpen} 
        onClose={() => setGlobalAddCandidateOpen(false)} 
      />

    </div>
  );
};

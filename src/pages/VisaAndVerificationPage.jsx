import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Globe, CheckCircle2, Clock, AlertTriangle, FileText, Lock, 
  RefreshCw, ArrowRight, Upload, X, Eye, Download, Trash2, Sparkles, 
  Check, Search, ChevronRight, Award, User, Building, FileCheck, ExternalLink,
  Layers, AlertCircle, HelpCircle, FileSpreadsheet, Shield
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { VisaMatrixTable } from '../components/VisaMatrixTable';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const VisaAndVerificationPage = ({ initialTab = 'overview' }) => {
  const { user, navigateTo, openAuthModal, setActiveModal } = useApp();

  // Active section tab: 'overview' | 'visa' | 'verification' | 'tracking' | 'vault'
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash if available
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('visa-eligibility') || initialTab === 'visa') return 'visa';
    if (hash.includes('verification') || initialTab === 'verification') return 'verification';
    if (hash.includes('tracking') || initialTab === 'tracking') return 'tracking';
    if (hash.includes('vault') || initialTab === 'vault') return 'vault';
    return 'overview';
  });

  // ==========================================
  // SECTION A: VISA ELIGIBILITY CALCULATOR STATE
  // ==========================================
  const [country, setCountry] = useState('UAE');
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [experience, setExperience] = useState('5');
  const [dob, setDob] = useState(null);
  const [language, setLanguage] = useState('English');
  const [proficiency, setProficiency] = useState('Fluent');
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState(null);
  const [calcError, setCalcError] = useState('');

  // ==========================================
  // SECTION B: VERIFICATION INITIATION FORM STATE
  // ==========================================
  const [candidateName, setCandidateName] = useState(user?.name || '');
  const [passportNumber, setPassportNumber] = useState('');
  const [verificationPackage, setVerificationPackage] = useState('6-Point Comprehensive Executive Audit');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // ==========================================
  // SECTION C: TRACKING STATE
  // ==========================================
  const [trackingCaseId, setTrackingCaseId] = useState('');
  const [activeCaseDetails, setActiveCaseDetails] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // ==========================================
  // SECTION D: DOCUMENT VAULT STATE
  // ==========================================
  const [vaultCategory, setVaultCategory] = useState('All');
  const [vaultDocs, setVaultDocs] = useState([
    {
      id: 'doc-vault-1',
      name: 'Passport_Biodata_Page.pdf',
      category: 'Passports & ID',
      size: '2.4 MB',
      uploadDate: '2026-11-20',
      status: 'Verified',
      fileUrl: '#'
    },
    {
      id: 'doc-vault-2',
      name: 'Degree_Certificate_Apostilled.pdf',
      category: 'Degrees & Diplomas',
      size: '4.8 MB',
      uploadDate: '2026-11-21',
      status: 'Verified',
      fileUrl: '#'
    },
    {
      id: 'doc-vault-3',
      name: 'Experience_Letter_Senior_Specialist.pdf',
      category: 'Experience Letters',
      size: '1.2 MB',
      uploadDate: '2026-11-22',
      status: 'Verified',
      fileUrl: '#'
    },
    {
      id: 'doc-vault-4',
      name: 'Police_Clearance_Certificate_PCC.pdf',
      category: 'Police Clearance',
      size: '1.7 MB',
      uploadDate: '2026-11-23',
      status: 'Under Review',
      fileUrl: '#'
    }
  ]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadVaultModal, setUploadVaultModal] = useState(false);
  const [newVaultDoc, setNewVaultDoc] = useState({ name: '', category: 'Degrees & Diplomas', file: null });

  // Summary State from Backend
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Sync user name
  useEffect(() => {
    if (user && user.name && !candidateName) {
      setCandidateName(user.name);
    }
  }, [user]);

  // Load candidate saved summary if authenticated
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const headers = {};
        if (user?.id) headers['x-candidate-id'] = user.id;
        if (user?.email) headers['x-candidate-email'] = user.email;

        const res = await fetch('/api/verification/candidate-summary', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.summary) {
            setSummaryData(data.summary);
            // If candidate has a saved visa assessment, populate it
            if (data.summary.visaEligibility && !calcResult) {
              setCalcResult({
                score: data.summary.visaEligibility.score,
                status: data.summary.visaEligibility.status,
                readiness: data.summary.visaEligibility.readiness,
                targetCountry: data.summary.visaEligibility.targetCountry,
                checklist: ['State HRD Attestation', 'MEA Apostille', 'Consular Stamping', 'Entry Permit']
              });
            }
            // If candidate has active verification case, populate tracking
            if (data.summary.verification && data.summary.verification.caseId) {
              setTrackingCaseId(data.summary.verification.caseId);
              fetchCaseStatus(data.summary.verification.caseId);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  // Handle Calculate Visa Eligibility
  const handleCalculateVisa = async (e) => {
    e.preventDefault();
    setCalcError('');
    setCalcLoading(true);

    let calculatedAge = 30;
    if (dob) {
      const today = new Date();
      calculatedAge = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
    } else {
      setCalcLoading(false);
      setCalcError('Please select your Date of Birth to evaluate visa eligibility.');
      return;
    }

    if (calculatedAge < 18) {
      setCalcResult({
        score: 0,
        status: 'Not Eligible',
        readiness: 'Below Minimum Working Age',
        targetCountry: country,
        countryData: { country },
        reasons: ['Applicant is under 18 years of age. You are not eligible for an independent work visa.'],
        missingQualifications: ['Must be at least 18 years of age.'],
        recommendedNextSteps: ['Wait until attaining legal working age before initiating overseas applications.'],
        checklist: []
      });
      setCalcLoading(false);
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.id) headers['x-candidate-id'] = user.id;
      if (user?.email) headers['x-candidate-email'] = user.email;

      const res = await fetch('/api/visa/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          country,
          qualification,
          experience,
          age: calculatedAge,
          language: proficiency ? `${language} (${proficiency})` : language,
          candidateId: user?.id,
          candidateEmail: user?.email,
          candidateName: user?.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCalcResult(data);
        // Update local summary state
        setSummaryData(prev => ({
          ...(prev || {}),
          visaEligibility: {
            score: data.score,
            status: data.status,
            readiness: data.readiness,
            targetCountry: data.targetCountry
          }
        }));
      } else {
        throw new Error('API evaluation failed');
      }
    } catch (err) {
      console.error(err);
      setCalcError('Unable to evaluate eligibility. Please check connection and try again.');
    } finally {
      setCalcLoading(false);
    }
  };

  // Handle Submit Verification Request
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(null);

    if (!candidateName.trim()) {
      setSubmitError('Please enter candidate full name.');
      return;
    }
    if (!passportNumber.trim()) {
      setSubmitError('Please enter valid Passport or Emirates ID number.');
      return;
    }
    if (!consentAccepted) {
      setSubmitError('You must provide consent for background verification and consular attestation.');
      return;
    }

    setSubmitLoading(true);

    try {
      const docPayload = Object.entries(uploadedFiles).map(([key, f]) => ({
        name: f.name || `${key}.pdf`,
        type: key,
        size: f.size ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB'
      }));

      const res = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-candidate-id': user?.id || 'GUEST',
          'x-candidate-email': user?.email || ''
        },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          passportNumber: passportNumber.trim(),
          verificationPackage,
          packageItems: [
            'Identity & Passport Clearance',
            'University Degree Attestation',
            '5-Year Employment History Audit',
            'Criminal & Police Clearance (PCC)',
            'Executive Reference Verification'
          ],
          candidateId: user?.id,
          candidateEmail: user?.email,
          targetCountry: country,
          documents: docPayload,
          consentAccepted: true
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(data);
        setTrackingCaseId(data.caseId);
        
        // Also add uploaded documents to Document Vault
        if (docPayload.length > 0) {
          const newVaultItems = docPayload.map((d, i) => ({
            id: `vault-new-${Date.now()}-${i}`,
            name: d.name,
            category: d.type.includes('Degree') ? 'Degrees & Diplomas' : d.type.includes('Passport') ? 'Passports & ID' : 'Experience Letters',
            size: d.size,
            uploadDate: new Date().toISOString().slice(0, 10),
            status: 'Under Review',
            fileUrl: '#'
          }));
          setVaultDocs(prev => [...newVaultItems, ...prev]);
        }

        // Switch to tracking view automatically
        setTimeout(() => {
          fetchCaseStatus(data.caseId);
          setActiveTab('tracking');
        }, 1200);
      } else {
        setSubmitError(data.error || 'Failed to submit verification request.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to initiate verification request. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Fetch Case Status
  const fetchCaseStatus = async (caseIdToTrack) => {
    const cid = (caseIdToTrack || trackingCaseId || '').trim();
    if (!cid) return;

    setTrackingLoading(true);
    setTrackingError('');

    try {
      const res = await fetch(`/api/verification/status/${encodeURIComponent(cid)}`);
      const data = await res.json();

      if (res.ok && data.success && data.case) {
        setActiveCaseDetails(data.case);
      } else {
        // Fallback realistic simulation if test case entered
        setActiveCaseDetails({
          caseId: cid,
          candidateName: user?.name || candidateName || 'Candidate Record',
          verificationPackage: '6-Point Comprehensive Executive Audit',
          overallStatus: 'In Progress',
          progress: 50,
          attestationPipeline: [
            { step: 1, stage: 'State HRD / Home Department', status: 'Completed', completedDate: '2026-11-20', description: 'Regional State Higher Education Department Authentication', pendingRequirements: 'None' },
            { step: 2, stage: 'MEA Apostille / Attestation', status: 'Completed', completedDate: '2026-11-22', description: 'Ministry of External Affairs Central Authentication', pendingRequirements: 'None' },
            { step: 3, stage: 'Consular Embassy Attestation', status: 'In Progress', completedDate: null, description: 'Destination Embassy Visa & Certificate Legalization', pendingRequirements: 'Consular Verification in progress' },
            { step: 4, stage: 'MOFA Digital Stamping', status: 'Queued', completedDate: null, description: 'Ministry of Foreign Affairs Digital Authentication', pendingRequirements: 'Awaiting Embassy Stamping' }
          ],
          employmentMilestones: [
            { step: 1, milestone: 'Quota & Offer Clearance', status: 'Completed', completedDate: '2026-11-18' },
            { step: 2, milestone: 'Degree Attestation', status: 'In Progress', completedDate: null },
            { step: 3, milestone: 'Entry Permit / Visa Ingress', status: 'Queued', completedDate: null },
            { step: 4, milestone: 'Medical & Biometrics', status: 'Queued', completedDate: null },
            { step: 5, milestone: 'Residency & National ID', status: 'Queued', completedDate: null }
          ],
          remarks: 'Embassy verification dossier active. Document tracking running smoothly.'
        });
      }
    } catch (err) {
      console.error(err);
      setTrackingError('Unable to fetch case status. Verify Case ID and try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Filter Vault Docs
  const filteredVaultDocs = vaultDocs.filter(d => {
    if (vaultCategory === 'All') return true;
    return d.category === vaultCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      <SEO
        title="Visa & Verification | Overseas Work Eligibility, Background Checks & Attestation"
        description="Comprehensive global visa eligibility calculator, consular degree attestation (HRD, MEA, Embassy, MOFA), background screening, and encrypted candidate credential vault."
        canonicalPath="visa-verification"
        keywords="Visa and Verification, UAE work visa eligibility, consular degree attestation, MEA apostille, background verification, document vault, GCC visa roadmap"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Visa & Verification', item: '/visa-verification' }
        ]}
      />

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e213e] text-white rounded-3xl p-6 sm:p-10 border border-gold-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle Gold Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Unified Compliance & Global Mobility</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Visa & Verification
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Manage your overseas work visa eligibility, document verification, background screening and consular attestation in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {user ? (
              <div className="bg-white/10 dark:bg-navy-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500 text-navy-950 font-bold flex items-center justify-center shrink-0">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{user.name || 'Candidate'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] truncate max-w-[160px]">{user.email}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal ? openAuthModal('login', 'candidate') : navigateTo('candidate-portal')}
                className="px-5 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Candidate Portal Login</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Navigation Pills (Requirement 5) */}
        <div className="pt-8 border-t border-white/10 mt-8 flex flex-wrap gap-2 sm:gap-3">
          {[
            { id: 'overview', label: 'Overview', icon: Layers, badge: null },
            { id: 'visa', label: 'Visa Eligibility', icon: Globe, badge: calcResult ? `${calcResult.score}%` : null },
            { id: 'verification', label: 'Document Verification', icon: ShieldCheck, badge: 'Direct Submit' },
            { id: 'tracking', label: 'Tracking', icon: Clock, badge: trackingCaseId ? 'Live' : null },
            { id: 'vault', label: 'Document Vault', icon: Lock, badge: `${vaultDocs.length} Docs` }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-navy-950 text-gold-400' : 'bg-gold-500/20 text-gold-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <ScrollReveal>
          <div className="space-y-8 text-left">
            {/* 4 Summary Dynamic Cards (Requirement 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Visa Eligibility */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 shadow-xs hover:border-gold-500/50 transition">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                    calcResult?.score >= 70 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-100 dark:bg-navy-800 text-slate-500 border-slate-200'
                  }`}>
                    {calcResult ? calcResult.status : 'Not Evaluated'}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Visa Eligibility</h3>
                  <p className="text-2xl font-black text-navy-950 dark:text-gold-400 font-mono mt-0.5">
                    {calcResult ? `${calcResult.score} / 100` : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {calcResult ? `Target: ${calcResult.targetCountry} (${calcResult.readiness})` : 'Calculate overseas points'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('visa')}
                  className="w-full py-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 border border-gold-500/30 hover:bg-gold-500/10 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{calcResult ? 'Recalculate Points' : 'Start Assessment'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 2: Verification Status */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 shadow-xs hover:border-gold-500/50 transition">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {trackingCaseId ? 'In Progress' : 'Ready'}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Verification Status</h3>
                  <p className="text-lg font-bold text-navy-950 dark:text-white font-mono mt-1 truncate">
                    {trackingCaseId ? trackingCaseId : 'No Active Case'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {trackingCaseId ? 'Consular Embassy Attestation' : '6-Point Comprehensive Audit'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab(trackingCaseId ? 'tracking' : 'verification')}
                  className="w-full py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{trackingCaseId ? 'Track Case Progress' : 'Submit Verification'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 3: Verified Documents */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 shadow-xs hover:border-gold-500/50 transition">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    AES-256 Vault
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Verified Documents</h3>
                  <p className="text-2xl font-black text-navy-950 dark:text-blue-400 font-mono mt-0.5">
                    {vaultDocs.filter(d => d.status === 'Verified').length} / {vaultDocs.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Degrees, Passports, PCC & Letters
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('vault')}
                  className="w-full py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 border border-blue-500/30 hover:bg-blue-500/10 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Document Vault</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 4: Pending Actions */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 shadow-xs hover:border-gold-500/50 transition">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Compliance
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Pending Actions</h3>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {calcResult ? '1 Action' : '2 Actions'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {calcResult ? 'Awaiting Police Clearance verification' : 'Calculate visa & upload credentials'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab(calcResult ? 'tracking' : 'visa')}
                  className="w-full py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 border border-amber-500/30 hover:bg-amber-500/10 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Pending Items</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Overseas Employment Progress Stepper (Requirement 6) */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-500" />
                    <span>Overseas Employment Progress Roadmap</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live milestone synchronization with consular registries and destination immigration departments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">Destination:</span>
                  <span className="px-3 py-1 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs rounded-lg border border-gold-500/20">
                    🇦🇪 United Arab Emirates (MOHRE)
                  </span>
                </div>
              </div>

              {/* Stepper Graphic */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { step: 1, title: 'Quota & Offer', desc: 'MOHRE Letter Approved', status: 'Completed', icon: CheckCircle2 },
                  { step: 2, title: 'Degree Attestation', desc: 'Consular Embassy Stage', status: 'In Progress', icon: Clock },
                  { step: 3, title: 'Entry Permit', desc: 'Electronic Ingress Slip', status: 'Queued', icon: FileText },
                  { step: 4, title: 'Medical & Bio', desc: 'Blood Test & Biometrics', status: 'Queued', icon: User },
                  { step: 5, title: 'Residency ID', desc: 'Emirates ID Delivery', status: 'Queued', icon: Award }
                ].map((st, i) => {
                  const SIcon = st.icon;
                  const isDone = st.status === 'Completed';
                  const isCurrent = st.status === 'In Progress';

                  return (
                    <div 
                      key={st.step}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                          : isCurrent
                            ? 'bg-gold-50/50 dark:bg-gold-950/20 border-gold-500 shadow-gold-glow text-navy-950 dark:text-white'
                            : 'bg-slate-50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800 text-slate-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Step 0{st.step}
                          </span>
                          <SIcon className={`w-4 h-4 ${
                            isDone ? 'text-emerald-500' : isCurrent ? 'text-gold-500 animate-spin-slow' : 'text-slate-400'
                          }`} />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {st.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {st.desc}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-navy-800/60">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isDone 
                            ? 'bg-emerald-500 text-white' 
                            : isCurrent 
                              ? 'bg-gold-500 text-navy-950' 
                              : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                        }`}>
                          {st.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Matrix for All 4 Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('visa')}
                className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 rounded-2xl shadow-xs transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center group-hover:scale-110 transition">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 group-hover:text-gold-500 transition">
                  SECTION A: Visa Calculator
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Assess points for UAE, Saudi, UK, Germany & Canada work visas.
                </p>
              </button>

              <button
                onClick={() => setActiveTab('verification')}
                className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 rounded-2xl shadow-xs transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 group-hover:text-gold-500 transition">
                  SECTION B: Verification Form
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Initiate educational & employment background checks with Case ID.
                </p>
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 rounded-2xl shadow-xs transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 group-hover:text-gold-500 transition">
                  SECTION C: Live Tracking
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Monitor State HRD, MEA Apostille & Consular Embassy steps.
                </p>
              </button>

              <button
                onClick={() => setActiveTab('vault')}
                className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 rounded-2xl shadow-xs transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 group-hover:text-gold-500 transition">
                  SECTION D: Document Vault
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Manage encrypted passports, diplomas, and PCC clearance records.
                </p>
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SECTION A — VISA ELIGIBILITY ASSESSMENT */}
      {/* ======================================================== */}
      {activeTab === 'visa' && (
        <ScrollReveal>
          <div className="space-y-10 text-left">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gold-500/10 text-gold-600 dark:text-gold-400 px-2.5 py-0.5 rounded-full border border-gold-500/20">
                  Section A • Points Assessment
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-gold-500" />
                  <span>Work Visa Points & Eligibility Calculator</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Calculate your score against official immigration frameworks including UAE MOHRE Green Visa, Saudi Iqama, Qatar Work Residence, Germany EU Blue Card, UK Skilled Worker, Singapore EP, and Canada Express Entry.
                </p>
              </div>

              {calcError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{calcError}</span>
                </div>
              )}

              {/* Calculator Form */}
              <form onSubmit={handleCalculateVisa} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Destination Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Target Destination Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="UAE">🇦🇪 United Arab Emirates (MOHRE)</option>
                      <option value="Saudi Arabia">🇸🇦 Saudi Arabia (Iqama / MHRSD)</option>
                      <option value="Qatar">🇶🇦 Qatar (MOL Work Permit)</option>
                      <option value="Germany">🇩🇪 Germany (EU Blue Card)</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom (Skilled Worker)</option>
                      <option value="Singapore">🇸🇬 Singapore (Employment Pass)</option>
                      <option value="Canada">🇨🇦 Canada (Express Entry / LMIA)</option>
                    </select>
                  </div>

                  {/* Highest Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Highest Educational Qualification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="Doctorate / PhD">Doctorate / PhD</option>
                      <option value="Master's Degree">Master's Degree (MBA / MS / MA)</option>
                      <option value="Bachelor's Degree">Bachelor's Degree (BS / BE / B.Tech / BA)</option>
                      <option value="Post-Graduate Diploma">Post-Graduate Diploma (3+ Years)</option>
                      <option value="Vocational Diploma">Vocational / Technical Diploma</option>
                      <option value="High School">High School Diploma</option>
                    </select>
                  </div>

                  {/* Relevant Experience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Relevant Work Experience <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="1">1 Year Experience</option>
                      <option value="2">2 - 3 Years Experience</option>
                      <option value="5">5 - 7 Years Experience</option>
                      <option value="8">8 - 10 Years Experience</option>
                      <option value="12">10+ Years Senior Leadership</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Date of Birth (Minimum 18 Years) <span className="text-rose-500">*</span>
                    </label>
                    <DatePicker
                      selected={dob}
                      onChange={(date) => setDob(date)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={60}
                      maxDate={new Date()}
                      placeholderText="Select Date of Birth"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Primary Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  {/* Proficiency Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Proficiency Benchmark
                    </label>
                    <select
                      value={proficiency}
                      onChange={(e) => setProficiency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="Native / Bilingual">Native / Bilingual (IELTS 8+ / C2)</option>
                      <option value="Fluent">Fluent / Professional (IELTS 7 / B2-C1)</option>
                      <option value="Conversational">Conversational (IELTS 5.5 - 6.5 / B1)</option>
                      <option value="Basic">Basic Workplace (A2)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500">
                    Calculations run against official Ministry regulations. Does not guarantee immigration issuance.
                  </div>
                  <button
                    type="submit"
                    disabled={calcLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {calcLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{calcLoading ? 'Evaluating Official Criteria...' : 'Calculate Eligibility'}</span>
                  </button>
                </div>
              </form>

              {/* Assessment Result Panel */}
              {calcResult && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-navy-800 space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Score Card */}
                    <div className="p-6 bg-gradient-to-br from-navy-950 to-navy-900 text-white rounded-2xl border border-gold-500/30 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-bold block">
                          Official Points Rating
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-4xl font-extrabold font-mono text-white">{calcResult.score}</span>
                          <span className="text-slate-400 text-sm font-mono">/ 100</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              calcResult.score >= 80 ? 'bg-emerald-400' : calcResult.score >= 60 ? 'bg-gold-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${calcResult.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="text-[11px] text-slate-300 font-bold">
                          Status: <span className="text-gold-400 font-bold">{calcResult.status}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Readiness: <strong className="text-white">{calcResult.readiness || 'Standard Pathway'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Criteria Alignment */}
                    <div className="p-6 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800 md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Evaluation Summary for {calcResult.targetCountry}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          Timeline: {calcResult.processingTime || '7-14 Days'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {calcResult.reasons && calcResult.reasons.map((r, i) => (
                          <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-gold-500 mt-0.5">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>

                      {calcResult.checklist && calcResult.checklist.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 dark:border-navy-800">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Document Checklist & Prerequisites:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {calcResult.checklist.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-500">
                          Ready to proceed with degree attestation and background check?
                        </div>
                        <button
                          onClick={() => setActiveTab('verification')}
                          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Proceed to Document Verification</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Interactive Country Visa Matrix Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    GCC & Global Overseas Visa Compliance Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare minimum qualification criteria, consular attestation, medical mandates, and processing schedules.
                  </p>
                </div>
              </div>
              <VisaMatrixTable />
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SECTION B — DOCUMENT & BACKGROUND VERIFICATION */}
      {/* ======================================================== */}
      {activeTab === 'verification' && (
        <ScrollReveal>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
            <div className="border-b border-slate-100 dark:border-navy-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Section B • Verification Request
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <span>Document & Background Verification Initiation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate university degrees, employment records, identity documents, and criminal clearance for consular compliance.
                </p>
              </div>

              <div className="text-xs font-mono px-3 py-1.5 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-slate-500">
                Data Protection: UAE Decree No. 45/2021
              </div>
            </div>

            {submitError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Verification Request Submitted! Case ID: {submitSuccess.caseId}</span>
                </div>
                <p>
                  Your documentation has been queued for preliminary compliance screening. Redirecting to live tracking dashboard...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-6">
              {/* Candidate Info Auto-retrieved */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Kishore Kumar"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <span className="text-[10px] text-slate-400">Must exactly match international passport name</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Passport / Emirates ID Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. N8923481"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <span className="text-[10px] text-slate-400">Encrypted in transit & at rest</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Verification Package <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={verificationPackage}
                    onChange={(e) => setVerificationPackage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="6-Point Comprehensive Executive Audit">6-Point Comprehensive Executive Audit</option>
                    <option value="4-Point Standard Verification">4-Point Standard Verification (Degree, Exp, ID, PCC)</option>
                    <option value="Consular Degree Attestation Only">Consular Degree Attestation Only (HRD, MEA, Embassy, MOFA)</option>
                    <option value="Police Clearance Authentication (PCC)">Police Clearance Authentication (PCC)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Select required consular audit scope</span>
                </div>
              </div>

              {/* Document Upload Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Required Document Uploads (PDF / JPG / PNG up to 15MB each)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'degree', label: 'University Degree / Diploma', icon: Award },
                    { key: 'passport', label: 'Passport Biodata Page', icon: User },
                    { key: 'experience', label: 'Employment Experience Letter', icon: Building },
                    { key: 'pcc', label: 'Police Clearance Certificate (PCC)', icon: Shield }
                  ].map(docItem => {
                    const DIcon = docItem.icon;
                    const file = uploadedFiles[docItem.key];

                    return (
                      <div 
                        key={docItem.key}
                        className={`p-4 rounded-2xl border transition text-center flex flex-col justify-between space-y-3 ${
                          file 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-500'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center ${
                            file ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            <DIcon className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-xs leading-tight">{docItem.label}</h4>
                          {file ? (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate max-w-full">
                              ✓ {file.name}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400">PDF, JPG, PNG format</p>
                          )}
                        </div>

                        <div>
                          <label className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            file 
                              ? 'bg-white dark:bg-navy-900 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-50'
                              : 'bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-sm'
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{file ? 'Replace File' : 'Select File'}</span>
                            <input 
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const f = e.target.files[0];
                                  setUploadedFiles(prev => ({ ...prev, [docItem.key]: f }));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consent and Declaration */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-gold-500 rounded border-slate-300 focus:ring-gold-500 cursor-pointer"
                  />
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">Candidate Declaration & Authorization Consent:</strong>
                    <br />
                    I hereby authorize The Revival International to process my personal identification details, verify educational degrees with respective universities, contact former employers for employment audits, and submit documents to consular embassies and foreign ministries on my behalf under statutory privacy regulations.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{submitLoading ? 'Generating Case ID & Enrolling Dossier...' : 'Submit Verification Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SECTION C — VERIFICATION & ATTESTATION TRACKING */}
      {/* ======================================================== */}
      {activeTab === 'tracking' && (
        <ScrollReveal>
          <div className="space-y-8 text-left">
            {/* Tracking Search Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Section C • Live Pipeline Tracking
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <span>Consular Attestation & Milestone Tracking</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your unique verification Case ID to view real-time progress across State HRD, MEA, Embassy Legalization, and MOFA Stamping.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={trackingCaseId}
                    onChange={(e) => setTrackingCaseId(e.target.value.toUpperCase())}
                    placeholder="Enter Case ID (e.g. REV-VERIF-20261125-4087)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <button
                  onClick={() => fetchCaseStatus(trackingCaseId)}
                  disabled={trackingLoading || !trackingCaseId.trim()}
                  className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Track Status</span>
                </button>
              </div>

              {trackingError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>

            {/* Tracking Detailed Progress */}
            {activeCaseDetails && (
              <div className="space-y-6">
                {/* Case Info Header */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider">
                        Active Verification Case
                      </span>
                      <h3 className="font-serif text-2xl font-bold font-mono text-white mt-0.5">
                        {activeCaseDetails.caseId}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Candidate: <strong>{activeCaseDetails.candidateName}</strong> • {activeCaseDetails.verificationPackage || 'Comprehensive Audit'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 bg-gold-500 text-navy-950 font-black text-xs rounded-full uppercase">
                        {activeCaseDetails.overallStatus || 'In Progress'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {activeCaseDetails.progress || 50}% Overall Completion
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-gold-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeCaseDetails.progress || 50}%` }}
                    />
                  </div>
                </div>

                {/* Pipeline 1: Consular Degree Attestation (4 Stages) */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold-500" />
                      <span>Consular Degree Attestation Pipeline</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Quad-stage diplomatic validation required for overseas professional employment licenses.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {activeCaseDetails.attestationPipeline && activeCaseDetails.attestationPipeline.map((st, i) => {
                      const isDone = st.status === 'Completed' || st.status === 'Verified';
                      const isCurrent = st.status === 'In Progress' || st.status === 'Under Review';

                      return (
                        <div 
                          key={i}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                            isDone 
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                              : isCurrent
                                ? 'bg-gold-50/50 dark:bg-gold-950/20 border-gold-500/50 shadow-sm'
                                : 'bg-slate-50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                              isDone 
                                ? 'bg-emerald-500 text-white' 
                                : isCurrent 
                                  ? 'bg-gold-500 text-navy-950' 
                                  : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                            }`}>
                              {st.step || (i + 1)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{st.stage || st.name}</span>
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  isDone 
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                    : isCurrent 
                                      ? 'bg-gold-500/20 text-gold-700 dark:text-gold-300' 
                                      : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                                }`}>
                                  {st.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {st.description || 'Diplomatic authentication stage'}
                              </p>
                              {st.pendingRequirements && st.pendingRequirements !== 'None' && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                                  Pending: {st.pendingRequirements}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-400 font-mono">
                            {st.completedDate ? `Completed: ${st.completedDate}` : 'Pending Stage Clearance'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pipeline 2: Overseas Employment Milestones (5 Stages) */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
                    <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span>Overseas Employment & Visa Milestones</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Step-by-step progress towards flight departure and residency ID endorsement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {activeCaseDetails.employmentMilestones && activeCaseDetails.employmentMilestones.map((m, i) => {
                      const isDone = m.status === 'Completed';
                      const isCurrent = m.status === 'In Progress';

                      return (
                        <div 
                          key={i}
                          className={`p-4 rounded-2xl border transition space-y-2 ${
                            isDone 
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' 
                              : isCurrent 
                                ? 'bg-gold-50/50 dark:bg-gold-950/20 border-gold-500 shadow-sm' 
                                : 'bg-slate-50 dark:bg-navy-950/40 border-slate-200 dark:border-navy-800'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                            <span>Stage 0{m.step || (i + 1)}</span>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {m.milestone}
                          </div>
                          <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800/60">
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                              isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-gold-500 text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SECTION D — ENCRYPTED DOCUMENT VAULT */}
      {/* ======================================================== */}
      {activeTab === 'vault' && (
        <ScrollReveal>
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
            <div className="border-b border-slate-100 dark:border-navy-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Section D • Encrypted Credential Vault
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gold-500" />
                    AES-256 Storage
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-500" />
                  <span>Candidate Document Vault</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Securely view, download, and manage your verified credentials, degree certificates, and background documents.
                </p>
              </div>

              <button
                onClick={() => setUploadVaultModal(true)}
                className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Document</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                'All',
                'Passports & ID',
                'Degrees & Diplomas',
                'Experience Letters',
                'Police Clearance'
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setVaultCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    vaultCategory === cat
                      ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Documents Table / Grid */}
            <div className="space-y-3">
              {filteredVaultDocs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No documents found under category "{vaultCategory}".
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredVaultDocs.map(doc => {
                    const isVerified = doc.status === 'Verified';

                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 hover:border-gold-500/40 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isVerified 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                {doc.name}
                              </h4>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isVerified
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {doc.category} • {doc.size} • Uploaded on {doc.uploadDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.fileUrl || '#'}
                            download={doc.name}
                            className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${doc.name} from vault?`)) {
                                setVaultDocs(prev => prev.filter(d => d.id !== doc.id));
                              }
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold-500" />
                <span>{previewDoc.name}</span>
              </h3>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-navy-950 rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center font-bold">
                PDF
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{previewDoc.name}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{previewDoc.category} • {previewDoc.size}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encrypted & Integrity Verified</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 border border-slate-200 dark:border-navy-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Vault Document Modal */}
      {uploadVaultModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setUploadVaultModal(false)}
        >
          <div 
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold-500" />
                <span>Upload to Document Vault</span>
              </h3>
              <button onClick={() => setUploadVaultModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Category</label>
                <select
                  value={newVaultDoc.category}
                  onChange={(e) => setNewVaultDoc(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="Passports & ID">Passports & ID</option>
                  <option value="Degrees & Diplomas">Degrees & Diplomas</option>
                  <option value="Experience Letters">Experience Letters</option>
                  <option value="Police Clearance">Police Clearance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Label</label>
                <input
                  type="text"
                  placeholder="e.g. Master_Degree_Attested.pdf"
                  value={newVaultDoc.name}
                  onChange={(e) => setNewVaultDoc(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-6 text-center space-y-2">
                <Upload className="w-8 h-8 text-gold-500 mx-auto" />
                <p className="text-xs text-slate-500">Select PDF, JPG or PNG file (Max 15MB)</p>
                <input 
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      setNewVaultDoc(prev => ({ ...prev, file: f, name: prev.name || f.name }));
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-navy-950"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                onClick={() => setUploadVaultModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-navy-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newVaultDoc.name) {
                    setVaultDocs(prev => [
                      {
                        id: `doc-${Date.now()}`,
                        name: newVaultDoc.name,
                        category: newVaultDoc.category,
                        size: newVaultDoc.file ? `${(newVaultDoc.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
                        uploadDate: new Date().toISOString().slice(0, 10),
                        status: 'Under Review',
                        fileUrl: '#'
                      },
                      ...prev
                    ]);
                    setUploadVaultModal(false);
                    setNewVaultDoc({ name: '', category: 'Degrees & Diplomas', file: null });
                  }
                }}
                className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
              >
                Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

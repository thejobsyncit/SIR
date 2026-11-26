import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, Search, Filter, RefreshCw,
  Eye, FileCheck, ClipboardEdit, Globe, X, Upload, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

const VISA_STATUS_OPTIONS = [
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

const DOC_STATUS_OPTIONS = [
  'Pending',
  'Under Review',
  'Verified',
  'Rejected / Correction Required'
];

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

const statusBadge = (status = '') => {
  const s = String(status).toLowerCase();
  if (s.includes('verified') || s === 'eligible' || s === 'officially approved') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (s.includes('rejected') || s === 'ineligible' || s.includes('correction') || s.includes('additional')) {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
  if (s.includes('under review') || s.includes('submitted')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
  }
  if (s === 'not required') {
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15';
  }
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
};

export const CrmVisaVerification = () => {
  const { crmToken, setCrmToken, currentRole, user, setActiveModule } = useCrm();

  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState({ totalCases: 0, pendingReview: 0, documentsVerified: 0, actionRequired: 0 });
  const [filterOptions, setFilterOptions] = useState({ countries: [], serviceTypes: [], assignedEmployees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [docStatusFilter, setDocStatusFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [reviewCase, setReviewCase] = useState(null);
  const [reviewDocs, setReviewDocs] = useState([]);
  const [reviewDocsLoading, setReviewDocsLoading] = useState(false);
  const [docForm, setDocForm] = useState({ docName: '', docType: 'Passport', fileData: '', mimeType: '', fileSize: '', remarks: '' });
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [savingDoc, setSavingDoc] = useState(false);

  const [assessCase, setAssessCase] = useState(null);
  const [assessForm, setAssessForm] = useState({});
  const [savingAssess, setSavingAssess] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const getAuthHeaders = useCallback(async () => {
    let token = crmToken;
    if (!token) {
      try {
        const res = await fetch('/api/crm/auth/preview-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetRole: currentRole || 'HR Operations', targetEmail: user?.email, employeeId: user?.id })
        });
        const json = await res.json();
        if (json?.success && json.token) {
          token = json.token;
          if (setCrmToken) setCrmToken(token);
        }
      } catch (_) {}
    }
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-user-data': JSON.stringify(user || { role: currentRole || 'HR Operations', email: user?.email })
    };
  }, [crmToken, setCrmToken, currentRole, user]);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (countryFilter !== 'all') params.set('destinationCountry', countryFilter);
      if (serviceFilter !== 'all') params.set('serviceType', serviceFilter);
      if (employeeFilter !== 'all') params.set('assignedEmployee', employeeFilter);
      if (docStatusFilter !== 'all') params.set('verificationStatus', docStatusFilter);
      if (eligibilityFilter !== 'all') params.set('eligibilityStatus', eligibilityFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/crm/visa-verification/cases?${params.toString()}`, { headers });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Failed to load visa verification cases.');
      }
      setCases(data.cases || []);
      setSummary(data.summary || { totalCases: 0, pendingReview: 0, documentsVerified: 0, actionRequired: 0 });
      setFilterOptions(data.filterOptions || { countries: [], serviceTypes: [], assignedEmployees: [] });
    } catch (err) {
      setError(err.message || 'Unable to load visa cases.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, search, countryFilter, serviceFilter, employeeFilter, docStatusFilter, eligibilityFilter, startDate, endDate]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return cases.slice(start, start + pageSize);
  }, [cases, page]);

  const totalPages = Math.max(1, Math.ceil(cases.length / pageSize));

  const openViewCandidate = (row) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('candidateKey', row.candidateKey);
      window.history.replaceState({}, '', url.toString());
    } catch (_) {}
    setActiveModule('candidates');
  };

  const openReviewDocuments = async (row) => {
    setReviewCase(row);
    setReviewDocs([]);
    setReviewDocsLoading(true);
    setDocForm({ docName: '', docType: 'Passport', fileData: '', mimeType: '', fileSize: '', remarks: '' });
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/crm/visa-verification/candidate/${encodeURIComponent(row.candidateKey)}?enquiryIds=${encodeURIComponent(row.enquiryId || '')}`, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        // Strictly scope documents to this case's enquiryId
        const scopedDocs = (data.documents || []).filter((d) => !row.enquiryId || d.enquiryId === row.enquiryId || d.caseId === row.id);
        setReviewDocs(scopedDocs);
        const drafts = {};
        scopedDocs.forEach((d) => {
          drafts[d.id] = {
            verificationStatus: d.verificationStatus || 'Pending',
            remarks: d.remarks || '',
            missingOrCorrectionNote: d.missingOrCorrectionNote || ''
          };
        });
        setReviewDrafts(drafts);
      }
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setReviewDocsLoading(false);
    }
  };

  const handleFileInput = (e) => {
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

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    if (!reviewCase || !docForm.docName.trim()) return;
    setSavingDoc(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/crm/visa-verification/documents', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          caseId: reviewCase.id,
          candidateKey: reviewCase.candidateKey,
          enquiryId: reviewCase.enquiryId,
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
      showToast('✓ Document submitted and linked to enquiry.');
      await openReviewDocuments(reviewCase);
      await loadCases();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setSavingDoc(false);
    }
  };

  const handleSaveDocReview = async (docId) => {
    const draft = reviewDrafts[docId];
    if (!draft) return;
    setSavingDoc(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/crm/visa-verification/documents/${docId}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(draft)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to save review.');
      showToast(`✓ Document marked ${draft.verificationStatus}.`);
      await openReviewDocuments(reviewCase);
      await loadCases();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setSavingDoc(false);
    }
  };

  const openAssessModal = (row) => {
    setAssessCase(row);
    setAssessForm({
      destinationCountry: row.destinationCountry || '',
      visaCategory: row.visaCategory || 'Needs Assessment',
      purpose: row.purpose || '',
      requirementStatus: row.requirementStatus || 'Required',
      eligibilityStatus: row.eligibilityStatus || 'Eligibility Assessment Pending',
      caseStatus: row.caseStatus || 'Needs Assessment',
      submissionDate: row.submissionDate || '',
      applicationRefNumber: row.applicationRefNumber || '',
      officialDecision: row.officialDecision || 'Pending',
      officialDecisionDate: row.officialDecisionDate || '',
      officialDecisionNotes: row.officialDecisionNotes || '',
      confirmedOfficialOutcome: Boolean(row.officialDecisionDate),
      assessmentNotes: row.assessmentNotes || ''
    });
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!assessCase) return;
    setSavingAssess(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/crm/visa-verification/cases/${assessCase.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(assessForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || 'Failed to update assessment.');
      showToast('✓ Visa assessment updated.');
      setAssessCase(null);
      await loadCases();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setSavingAssess(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-navy-950 text-white border border-amber-500/40 shadow-xl text-xs font-bold">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-gold-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Visa &amp; Verification
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Enquiry-linked visa eligibility, KYC document verification, and background compliance
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadCases}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Dashboard Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Visa Cases', value: summary.totalCases, icon: Globe, tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'Pending Review', value: summary.pendingReview, icon: Clock, tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Documents Verified', value: summary.documentsVerified, icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Action Required', value: summary.actionRequired, icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{card.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search & Filters */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search candidate, ID, enquiry, country..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200">
            <option value="all">All Countries</option>
            {filterOptions.countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={serviceFilter} onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200">
            <option value="all">All Services</option>
            {filterOptions.serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={employeeFilter} onChange={(e) => { setEmployeeFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200">
            <option value="all">All Assigned HR</option>
            {filterOptions.assignedEmployees.map((emp) => <option key={emp} value={emp}>{emp}</option>)}
          </select>
          <select value={docStatusFilter} onChange={(e) => { setDocStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200">
            <option value="all">All Doc Statuses</option>
            <option value="Pending Documents">Pending Documents</option>
            {DOC_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <select value={eligibilityFilter} onChange={(e) => { setEligibilityFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200">
            <option value="all">All Eligibility</option>
            <option value="Eligibility Assessment Pending">Assessment Pending</option>
            <option value="Eligible">Eligible</option>
            <option value="Ineligible">Ineligible</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Updated Date Range:</span>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200" />
            <span className="text-slate-400">to</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200" />
          </div>
          {(search || countryFilter !== 'all' || serviceFilter !== 'all' || employeeFilter !== 'all' || docStatusFilter !== 'all' || eligibilityFilter !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setSearch(''); setCountryFilter('all'); setServiceFilter('all'); setEmployeeFilter('all');
                setDocStatusFilter('all'); setEligibilityFilter('all'); setStartDate(''); setEndDate(''); setPage(1);
              }}
              className="text-amber-600 dark:text-gold-400 font-bold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-navy-800">
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Candidate ID</th>
                <th className="p-3">Enquiry ID</th>
                <th className="p-3">Enquiry / Service Type</th>
                <th className="p-3">Destination Country</th>
                <th className="p-3">Visa Category</th>
                <th className="p-3">Assigned HR Employee</th>
                <th className="p-3">Document Status</th>
                <th className="p-3">Eligibility Status</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan="11" className="p-10 text-center text-slate-400">
                    Loading visa verification cases...
                  </td>
                </tr>
              ) : paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-12 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    No visa cases require processing
                  </td>
                </tr>
              ) : (
                paginatedCases.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{row.candidateName}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.candidateId || row.candidateKey}</td>
                    <td className="p-3 font-mono text-[11px] text-amber-700 dark:text-gold-400 whitespace-nowrap">{row.enquiryId}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">{row.serviceType}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.destinationCountry}</td>
                    <td className="p-3 whitespace-nowrap">{row.visaCategory}</td>
                    <td className="p-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{row.assignedEmployeeName || 'Unassigned'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(row.documentStatus)}`}>
                        {row.documentStatus}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(row.caseStatus === 'Eligible' || row.caseStatus === 'Ineligible' || row.caseStatus === 'Officially Approved' || row.caseStatus === 'Officially Rejected' ? row.caseStatus : row.eligibilityStatus)}`}>
                        {row.eligibilityStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {String(row.updatedAt || row.createdAt || '').slice(0, 10)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openViewCandidate(row)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                          title="View Candidate"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openReviewDocuments(row)}
                          className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 cursor-pointer"
                          title="Review Documents"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAssessModal(row)}
                          className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-gold-300 cursor-pointer"
                          title="Update Assessment"
                        >
                          <ClipboardEdit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {cases.length > pageSize && (
          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
            <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, cases.length)} of {cases.length} cases</span>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold px-2">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Documents Modal */}
      {reviewCase && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Enquiry {reviewCase.enquiryId}
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Document Verification — {reviewCase.candidateName}
                </h3>
                <p className="text-[11px] text-slate-500">{reviewCase.visaCategory} • {reviewCase.destinationCountry}</p>
              </div>
              <button type="button" onClick={() => setReviewCase(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submit New Document */}
            <form onSubmit={handleSubmitDocument} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Add / Submit Document for this Enquiry</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Document name (e.g. Passport_Scan.pdf)"
                  value={docForm.docName}
                  onChange={(e) => setDocForm({ ...docForm, docName: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
                <select
                  value={docForm.docType}
                  onChange={(e) => setDocForm({ ...docForm, docType: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="file"
                  onChange={handleFileInput}
                  className="px-2 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-[11px]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Initial submission remarks (optional)"
                  value={docForm.remarks}
                  onChange={(e) => setDocForm({ ...docForm, remarks: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold cursor-pointer"
                >
                  {savingDoc ? 'Saving...' : 'Submit Document'}
                </button>
              </div>
            </form>

            {/* Submitted Documents List */}
            {reviewDocsLoading ? (
              <div className="py-8 text-center text-slate-400">Loading documents...</div>
            ) : reviewDocs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
                <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="font-semibold">No documents submitted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewDocs.map((doc) => {
                  const draft = reviewDrafts[doc.id] || { verificationStatus: doc.verificationStatus, remarks: doc.remarks || '', missingOrCorrectionNote: doc.missingOrCorrectionNote || '' };
                  return (
                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950/60 space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{doc.docName}</div>
                          <div className="text-[11px] text-slate-500">
                            {doc.docType} • Submitted: {String(doc.submittedAt || '').slice(0, 10)} • Reviewer: {doc.reviewerName || 'Unassigned'}
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(doc.verificationStatus)}`}>
                          {doc.verificationStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={draft.verificationStatus}
                          onChange={(e) => setReviewDrafts((prev) => ({ ...prev, [doc.id]: { ...draft, verificationStatus: e.target.value } }))}
                          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                        >
                          {DOC_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Reviewer remarks"
                          value={draft.remarks}
                          onChange={(e) => setReviewDrafts((prev) => ({ ...prev, [doc.id]: { ...draft, remarks: e.target.value } }))}
                          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Missing / correction details (if any)"
                          value={draft.missingOrCorrectionNote}
                          onChange={(e) => setReviewDrafts((prev) => ({ ...prev, [doc.id]: { ...draft, missingOrCorrectionNote: e.target.value } }))}
                          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={savingDoc}
                          onClick={() => handleSaveDocReview(doc.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                        >
                          Save Document Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Assessment Modal */}
      {assessCase && (
        <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveAssessment} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Visa &amp; Eligibility Assessment — {assessCase.candidateName}
                </h3>
                <p className="text-[11px] text-slate-500">Enquiry: {assessCase.enquiryId} • Service: {assessCase.serviceType}</p>
              </div>
              <button type="button" onClick={() => setAssessCase(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destination Country</label>
                <input
                  type="text"
                  value={assessForm.destinationCountry}
                  onChange={(e) => setAssessForm({ ...assessForm, destinationCountry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visa Category</label>
                <input
                  type="text"
                  value={assessForm.visaCategory}
                  onChange={(e) => setAssessForm({ ...assessForm, visaCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Eligibility Assessment</label>
                <select
                  value={assessForm.eligibilityStatus}
                  onChange={(e) => setAssessForm({ ...assessForm, eligibilityStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="Eligibility Assessment Pending">Eligibility Assessment Pending</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Ineligible">Ineligible</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Overall Case Progress</label>
                <select
                  value={assessForm.caseStatus}
                  onChange={(e) => setAssessForm({ ...assessForm, caseStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  {VISA_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Application Submission Date</label>
                <input
                  type="date"
                  value={assessForm.submissionDate}
                  onChange={(e) => setAssessForm({ ...assessForm, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Application Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. VFS-2026-9910"
                  value={assessForm.applicationRefNumber}
                  onChange={(e) => setAssessForm({ ...assessForm, applicationRefNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Official Immigration Decision (Separate from Eligibility) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2.5">
              <div className="font-bold text-slate-800 dark:text-slate-200">Official Immigration Outcome (Separate from Eligibility)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={assessForm.officialDecision}
                  onChange={(e) => setAssessForm({ ...assessForm, officialDecision: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="Pending">Pending Official Decision</option>
                  <option value="Officially Approved">Officially Approved</option>
                  <option value="Officially Rejected">Officially Rejected</option>
                </select>
                <input
                  type="date"
                  value={assessForm.officialDecisionDate}
                  onChange={(e) => setAssessForm({ ...assessForm, officialDecisionDate: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assessForm.confirmedOfficialOutcome}
                  onChange={(e) => setAssessForm({ ...assessForm, confirmedOfficialOutcome: e.target.checked })}
                />
                <span>Confirmed official immigration authority decision received</span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Notes</label>
              <textarea
                rows="3"
                value={assessForm.assessmentNotes}
                onChange={(e) => setAssessForm({ ...assessForm, assessmentNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                placeholder="Reviewer assessment notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
              <button type="button" onClick={() => setAssessCase(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={savingAssess} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold cursor-pointer">
                {savingAssess ? 'Saving...' : 'Save Assessment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


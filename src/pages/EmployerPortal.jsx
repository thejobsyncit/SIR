import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAuth } from '../components/UnifiedAuth';
import {
  Building2, Users, PlusCircle, Search, Calendar, BarChart3, CheckCircle2,
  FileText, Send, Sparkles, LogOut, ArrowRight, Trash2, Filter, Eye, Video,
  Check, Clock, UserCheck, ChevronRight, X, Phone, Mail, Award, Briefcase, MapPin, Globe, UserX, AlertCircle
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';

export const STANDARD_BENEFITS = [
  'Health Insurance (Comprehensive / Family Coverage)',
  'Paid Annual Leave (30 Calendar Days)',
  'Annual Return Flight Tickets / Travel Allowance',
  'Performance Bonus & Annual Profit Share',
  'Retirement & End-of-Service Gratuity',
  'Tax-Free Monthly Compensation',
  'Family Visa Sponsorship & Status Support',
  'Overtime & Shift Allowances'
];

export const EmployerPortal = () => {
  const { user, logout, addJob, deleteJob, navigateTo, postedJobs, applications, updateApplicationStatus } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'post-job' | 'applicants' | 'candidates'
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [lastPostedTitle, setLastPostedTitle] = useState('');

  // Filtering for Applicants tab
  const [applicantFilterStatus, setApplicantFilterStatus] = useState('All');
  const [applicantSearch, setApplicantSearch] = useState('');

  // Selected candidate for screening modal or interview modal
  const [screenCandidate, setScreenCandidate] = useState(null);
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    mode: 'Microsoft Teams Video Call',
    interviewer: 'HR Director & Technical Lead',
    notes: 'Please bring copies of attested degree certificates and passport.'
  });
  const [interviewSuccess, setInterviewSuccess] = useState(false);

  // Not Shortlisted Modal & Notification State
  const [notShortlistedCandidate, setNotShortlistedCandidate] = useState(null);
  const [notShortlistedSuccess, setNotShortlistedSuccess] = useState(false);
  const [demoStatusOverrides, setDemoStatusOverrides] = useState({});
  const [notShortlistedForm, setNotShortlistedForm] = useState({
    reasonCategory: 'Experience Gap',
    message: ''
  });

  const [customBenefitInput, setCustomBenefitInput] = useState('');
  const [formError, setFormError] = useState('');

  const [jobForm, setJobForm] = useState({
    title: '',
    country: 'UAE',
    location: 'Dubai, Business Bay',
    category: 'Construction',
    jobType: 'Full-time',
    salary: '',
    experience: '3 - 5 Years',
    vacancies: '5',
    skills: '',
    // Qualifications
    educationLevel: "Bachelor's Degree",
    requiredDegree: '',
    academicQualifications: '',
    mandatoryLicences: '',
    // Contract Length
    contractType: 'Permanent',
    contractDuration: '2 Years',
    contractRenewal: 'Yes, Renewable upon mutual agreement',
    // Accommodation & Transportation
    accommodation: 'Allowance Provided',
    transportation: 'Allowance Provided',
    livingAllowancesDetails: '',
    // Visa Sponsorship
    visaSponsorship: 'Visa sponsorship provided',
    visaSupportDetails: 'Employer sponsors 2-year employment residency visa, MOHRE work permit, and government medical exams.',
    // Benefits
    benefits: [
      'Health Insurance (Comprehensive / Family Coverage)',
      'Paid Annual Leave (30 Calendar Days)',
      'Annual Return Flight Tickets / Travel Allowance',
      'Tax-Free Monthly Compensation'
    ],
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });

  if (!user || user.role !== 'employer') {
    return <UnifiedAuth defaultRole="employer" />;
  }

  // Combined candidate applicants pool (demo candidate profiles + live user applications)
  const rawCandidatePool = [
    ...applications.map(app => ({
      id: app.id,
      name: app.candidateName || 'Executive Applicant (' + app.id + ')',
      email: app.candidateEmail || 'applicant@sir-talent.com',
      phone: '+971 50 892 1420',
      role: app.jobTitle,
      appliedJobId: app.jobId,
      company: app.company,
      country: app.country,
      appliedDate: app.appliedDate || '2026-08-03',
      exp: '7 Yrs',
      location: 'Dubai, UAE',
      match: '96%',
      status: app.status || 'Under AI Resume Screening',
      step: app.step || 1,
      skills: ['Project Management', 'Site Supervision', 'FIDIC Contracts', 'Team Leadership'],
      education: "B.Tech Civil Engineering (Attested by UAE Embassy)",
      interviewDetails: app.interviewDetails || null,
      notShortlistedDetails: app.notShortlistedDetails || null,
      isLive: true
    })),
    {
      id: 'APP-1029',
      name: 'Dr. Rahul Sharma',
      email: 'rahul.sharma@healthnet.org',
      phone: '+91 98765 43210',
      role: 'Senior ICU Specialist',
      appliedJobId: 'job-103',
      company: user.companyName || 'Al Habtoor Contracting LLC',
      country: 'Saudi Arabia',
      appliedDate: '2026-08-02',
      exp: '9 Yrs',
      location: 'India (Relocating to KSA)',
      match: '98%',
      status: 'Shortlisted',
      step: 2,
      skills: ['Critical Care', 'Ventilator Management', 'ACLS/BLS Certified', 'Emergency Medicine'],
      education: 'MD Cardiology / MBBS (Saudi Prometric Verified)',
      interviewDetails: null
    },
    {
      id: 'APP-1030',
      name: 'Elena Rostova',
      email: 'elena.rostova@devcloud.io',
      phone: '+48 601 234 567',
      role: 'DevOps & Cloud Solutions Lead',
      appliedJobId: 'job-105',
      company: user.companyName || 'Al Habtoor Contracting LLC',
      country: 'UAE',
      appliedDate: '2026-08-01',
      exp: '6 Yrs',
      location: 'Poland (Relocating to Dubai)',
      match: '95%',
      status: 'Interview Scheduled',
      step: 3,
      skills: ['AWS Architect', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'],
      education: 'M.Sc. Computer Science (Warsaw University)',
      interviewDetails: {
        date: '2026-08-08',
        time: '02:00 PM GST',
        mode: 'Microsoft Teams Video Call',
        interviewer: 'VP of Engineering'
      }
    },
    {
      id: 'APP-1031',
      name: 'Mohammed Al-Kindi',
      email: 'm.alkindi@dubaimunicipality.gov.ae',
      phone: '+971 55 123 4567',
      role: 'Senior Civil Project Director',
      appliedJobId: 'job-101',
      company: user.companyName || 'Al Habtoor Contracting LLC',
      country: 'UAE',
      appliedDate: '2026-07-30',
      exp: '14 Yrs',
      location: 'Dubai, UAE',
      match: '92%',
      status: 'Under AI Resume Screening',
      step: 1,
      skills: ['High-Rise Construction', 'Primavera P6', 'Commercial PMO', 'Budget Control'],
      education: 'B.Sc. Civil Engineering (UAE University)',
      interviewDetails: null
    },
    {
      id: 'APP-1032',
      name: 'David Miller',
      email: 'd.miller@energycorp.co.uk',
      phone: '+44 7700 900077',
      role: 'Offshore Drilling Superintendent',
      appliedJobId: 'job-102',
      company: user.companyName || 'Al Habtoor Contracting LLC',
      country: 'Saudi Arabia',
      appliedDate: '2026-07-28',
      exp: '11 Yrs',
      location: 'UK (Rotational Expat)',
      match: '89%',
      status: 'Shortlisted',
      step: 2,
      skills: ['Deepwater Drilling', 'IWCF Certification', 'Subsea HSE', 'Well Control'],
      education: 'B.Eng Petroleum Engineering (Imperial College London)',
      interviewDetails: null
    }
  ];

  const candidatePool = rawCandidatePool.map(cand => {
    if (demoStatusOverrides[cand.id]) {
      return {
        ...cand,
        status: demoStatusOverrides[cand.id].status,
        notShortlistedDetails: demoStatusOverrides[cand.id].notShortlistedDetails
      };
    }
    return cand;
  });

  const [closingDateError, setClosingDateError] = useState('');

  const handleToggleBenefit = (benefit) => {
    setJobForm(prev => {
      const exists = prev.benefits.includes(benefit);
      return {
        ...prev,
        benefits: exists
          ? prev.benefits.filter(b => b !== benefit)
          : [...prev.benefits, benefit]
      };
    });
  };

  const handleAddCustomBenefit = (e) => {
    e.preventDefault();
    const trimmed = customBenefitInput.trim();
    if (!trimmed) return;
    if (!jobForm.benefits.includes(trimmed)) {
      setJobForm(prev => ({
        ...prev,
        benefits: [...prev.benefits, trimmed]
      }));
    }
    setCustomBenefitInput('');
  };

  const handleRemoveBenefit = (benefit) => {
    setJobForm(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (jobForm.closingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(jobForm.closingDate);
      if (chosen < today) {
        setClosingDateError('Application closing date cannot be earlier than today.');
        return;
      }
    }
    setClosingDateError('');
    const created = await addJob({
      ...jobForm,
      company: user.companyName || 'Al Habtoor Contracting LLC'
    });
    setLastPostedTitle(created.title || jobForm.title);
    setPostedSuccess(true);
  };

  const handleResetForm = () => {
    setJobForm({
      title: '',
      country: 'UAE',
      location: 'Dubai, Business Bay',
      category: 'Construction',
      jobType: 'Full-time',
      salary: '',
      experience: '3 - 5 Years',
      vacancies: '5',
      skills: '',
      educationLevel: "Bachelor's Degree",
      requiredDegree: '',
      academicQualifications: '',
      mandatoryLicences: '',
      contractType: 'Permanent',
      contractDuration: '2 Years',
      contractRenewal: 'Yes, Renewable upon mutual agreement',
      accommodation: 'Allowance Provided',
      transportation: 'Allowance Provided',
      livingAllowancesDetails: '',
      visaSponsorship: 'Visa sponsorship provided',
      visaSupportDetails: 'Employer sponsors 2-year employment residency visa, MOHRE work permit, and government medical exams.',
      benefits: [
        'Health Insurance (Comprehensive / Family Coverage)',
        'Paid Annual Leave (30 Calendar Days)',
        'Annual Return Flight Tickets / Travel Allowance',
        'Tax-Free Monthly Compensation'
      ],
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: ''
    });
    setCustomBenefitInput('');
    setClosingDateError('');
    setPostedSuccess(false);
  };

  const handleShortlistCandidate = (cand) => {
    updateApplicationStatus(cand.id, 'Shortlisted', 2);
    setDemoStatusOverrides(prev => ({
      ...prev,
      [cand.id]: { status: 'Shortlisted', notShortlistedDetails: null }
    }));
    if (screenCandidate?.id === cand.id) {
      setScreenCandidate({ ...screenCandidate, status: 'Shortlisted', step: 2 });
    }
  };

  const handleOpenNotShortlistedModal = (cand) => {
    setNotShortlistedCandidate(cand);
    setNotShortlistedSuccess(false);
    setNotShortlistedForm({
      reasonCategory: 'Experience Gap',
      message: `Dear ${cand.name},\n\nThank you for your interest in the position of ${cand.role} at ${user.companyName || cand.company || 'Al Habtoor Contracting LLC'}.\n\nAfter careful review of your application by our executive recruiting team, we regret to inform you that you have not been shortlisted for this specific mandate at this time.\n\nYour profile will remain active in the Revival Executive Talent Database for upcoming GCC opportunities.\n\nBest regards,\nRecruitment Team - Revival International`
    });
  };

  const handleConfirmNotShortlisted = (e) => {
    e.preventDefault();
    if (!notShortlistedCandidate) return;

    const notShortlistedDetailsObj = {
      reasonCategory: notShortlistedForm.reasonCategory,
      message: notShortlistedForm.message,
      dateNotified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    updateApplicationStatus(
      notShortlistedCandidate.id,
      'Not Shortlisted',
      0,
      null,
      notShortlistedDetailsObj
    );

    setDemoStatusOverrides(prev => ({
      ...prev,
      [notShortlistedCandidate.id]: {
        status: 'Not Shortlisted',
        notShortlistedDetails: notShortlistedDetailsObj
      }
    }));

    if (screenCandidate?.id === notShortlistedCandidate.id) {
      setScreenCandidate({ ...screenCandidate, status: 'Not Shortlisted', step: 0 });
    }

    setNotShortlistedSuccess(true);
    setTimeout(() => {
      setNotShortlistedCandidate(null);
      setNotShortlistedSuccess(false);
    }, 2200);
  };

  const handleOpenInterviewModal = (cand) => {
    setInterviewCandidate(cand);
    setInterviewSuccess(false);
    setInterviewForm({
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '11:00 AM GST',
      mode: 'Microsoft Teams Video Call',
      interviewer: `${user.companyName || 'Al Habtoor'} Technical Panel`,
      notes: 'Initial Technical & Visa Eligibility Evaluation.'
    });
  };

  const handleConfirmInterview = (e) => {
    e.preventDefault();
    if (!interviewCandidate) return;

    updateApplicationStatus(
      interviewCandidate.id,
      'Interview Scheduled',
      3,
      {
        date: interviewForm.date,
        time: interviewForm.time,
        mode: interviewForm.mode,
        interviewer: interviewForm.interviewer,
        notes: interviewForm.notes
      }
    );

    setDemoStatusOverrides(prev => ({
      ...prev,
      [interviewCandidate.id]: { status: 'Interview Scheduled' }
    }));

    setInterviewSuccess(true);
    setTimeout(() => {
      setInterviewCandidate(null);
      setInterviewSuccess(false);
    }, 2000);
  };

  const filteredApplicants = candidatePool.filter(c => {
    const matchesStatus = applicantFilterStatus === 'All' || c.status === applicantFilterStatus;
    const matchesSearch = !applicantSearch ||
      c.name.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      c.role.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(applicantSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalActivePostings = (user.activeMandates || 8) + (postedJobs ? postedJobs.length : 0);
  const totalCandidatesReceived = candidatePool.length + 138;
  const interviewsCount = candidatePool.filter(c => c.status === 'Interview Scheduled').length + 24;

  return (
    <ScrollReveal>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
        <SEO
          title="Enterprise Employer Portal & Talent Acquisition | Revival International"
          description="Post global job vacancies, manage vetted applicant shortlists, schedule technical interviews, and oversee international workforce deployment from Dubai."
          canonicalPath="employers"
          keywords="employer portal Dubai, hire international talent UAE, executive search client portal, post jobs GCC"
          breadcrumbs={[
            { name: 'Home', item: '' },
            { name: 'Employer Portal', item: 'employers' }
          ]}
        />

        {/* Employer Header Banner */}
        <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-gold-500/30 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-gold-glow">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-slate-200 dark:border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Enterprise Employer Portal</span>
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">MOHRE Verified</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">{user.companyName || 'Al Habtoor Contracting LLC'}</h1>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                Account ID: {user.accountId || 'REV-EMP-9902'} • Active Mandates: <strong>{totalActivePostings} Jobs</strong> • Total Applicants: <strong>{totalCandidatesReceived}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('post-job'); setPostedSuccess(false); }}
              className="px-6 py-3 bg-gold-shimmer hover:opacity-95 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center space-x-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a New Job Mandate</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-3 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 hover:bg-rose-500 hover:text-slate-900 dark:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              title="Sign Out of Employer Portal"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Employer Dashboard & Analytics
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-3 px-4 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'applicants' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            <span>Applicants & Candidate Screening</span>
            <span className="bg-gold-500 text-navy-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{candidatePool.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('post-job')}
            className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'post-job' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Post a Job Wizard
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'candidates' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Search Talent Database
          </button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-xs">
              <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Active Postings</span>
                <p className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">{totalActivePostings}</p>
              </div>

              <div
                onClick={() => setActiveTab('applicants')}
                className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1 cursor-pointer hover:border-gold-500 transition group"
              >
                <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                  <span>Candidates Received</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gold-500 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="font-serif text-3xl font-extrabold text-gold-500">{totalCandidatesReceived}</p>
              </div>

              <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Interviews Conducted</span>
                <p className="font-serif text-3xl font-extrabold text-emerald-500">{interviewsCount}</p>
              </div>

              <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Visas Issued</span>
                <p className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">12</p>
              </div>
            </div>

            {/* Shortcut Banner to Applicant Screening */}
            <div className="bg-white dark:bg-navy-950 border border-slate-300 dark:border-gold-500/30 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs shadow-lg text-slate-900 dark:text-white">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                  <h3 className="font-serif text-lg font-extrabold text-slate-900 dark:text-white">AI Candidate Screening & Interview Hub</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">Review {candidatePool.length} pre-screened applicants for your open job mandates and schedule video interviews directly.</p>
              </div>
              <button
                onClick={() => setActiveTab('applicants')}
                className="px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow flex items-center gap-2 hover:opacity-95 transition whitespace-nowrap"
              >
                <span>Screen & Interview Applicants ({candidatePool.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Manage Posted Job Mandates */}
            {postedJobs && postedJobs.length > 0 && (
              <div className="glass-card bg-white dark:bg-navy-900 border p-6 rounded-2xl space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Your Live Posted Job Mandates</h3>
                  <button onClick={() => navigateTo('jobs')} className="text-gold-500 font-bold hover:underline flex items-center gap-1">
                    <span>View Public Jobs Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-navy-800">
                  {postedJobs.map((pj) => (
                    <div key={pj.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-navy-900 dark:text-white text-sm">{pj.title}</h4>
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Live & Active</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">{pj.country} ({pj.location}) • {pj.category} • {pj.salary} • {pj.vacancies || 5} Vacancies</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setActiveTab('applicants')}
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-50 dark:bg-navy-900 text-gold-400 font-bold rounded-lg border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 transition text-[11px] flex items-center justify-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Applicants</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the mandate for "${pj.title}"?`)) {
                              deleteJob(pj.id);
                            }
                          }}
                          className="px-3 py-1.5 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition font-bold text-[11px] flex items-center justify-center gap-1"
                          title="Delete Job Mandate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* APPLICANTS & CANDIDATE SCREENING TAB */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Applicant Management & Interview Portal</h2>
                <p className="text-xs text-slate-500">Screen candidate qualifications, view AI ATS match scores, and conduct video interviews.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Status:</span>
                <select
                  value={applicantFilterStatus}
                  onChange={(e) => setApplicantFilterStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="All">All Applicants ({candidatePool.length})</option>
                  <option value="Under AI Resume Screening">Under AI Resume Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Not Shortlisted">Not Shortlisted</option>
                </select>
              </div>
            </div>

            {/* Applicants List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredApplicants.map((cand) => (
                <div
                  key={cand.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-200 dark:border-gold-500/50 transition"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">{cand.name}</h3>

                      {/* Match Score Badge */}
                      <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 border border-emerald-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        {cand.match} AI ATS Match
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${cand.status === 'Interview Scheduled'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
                        : cand.status === 'Shortlisted'
                          ? 'bg-gold-500/15 text-gold-700 dark:text-gold-400 border-slate-200 dark:border-gold-500/30'
                          : cand.status === 'Not Shortlisted'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        }`}>
                        ● {cand.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <p><strong className="text-navy-900 dark:text-white">Applied Role:</strong> {cand.role}</p>
                      <p><strong className="text-navy-900 dark:text-white">Experience:</strong> {cand.exp}</p>
                      <p><strong className="text-navy-900 dark:text-white">Location:</strong> {cand.location}</p>
                      <p><strong className="text-navy-900 dark:text-white">Education:</strong> {cand.education}</p>
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cand.skills.map((sk, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-navy-800">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Interview Scheduled details box */}
                    {cand.interviewDetails && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 text-xs text-purple-900 dark:text-purple-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Video className="w-4 h-4 text-purple-500" />
                          <span>Confirmed Interview Scheduled: {cand.interviewDetails.date} at {cand.interviewDetails.time}</span>
                        </div>
                        <p className="text-[11px] opacity-90">Format: {cand.interviewDetails.mode} • Panel: {cand.interviewDetails.interviewer}</p>
                      </div>
                    )}

                    {/* Not Shortlisted details box */}
                    {cand.notShortlistedDetails && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs text-rose-900 dark:text-rose-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          <UserX className="w-4 h-4 text-rose-500" />
                          <span>Candidate Marked as Not Shortlisted (Notified on {cand.notShortlistedDetails.dateNotified})</span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">Category: {cand.notShortlistedDetails.reasonCategory} • Official notification dispatched</p>
                      </div>
                    )}
                  </div>

                  {/* Screening & Interview Action Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-52">
                    <button
                      onClick={() => setScreenCandidate(cand)}
                      className="py-2 px-3 bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-navy-700 hover:border-gold-500 transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-gold-500" />
                      <span>Screen Resume / Profile</span>
                    </button>

                    {cand.status !== 'Shortlisted' && cand.status !== 'Interview Scheduled' && (
                      <button
                        onClick={() => handleShortlistCandidate(cand)}
                        className="py-2 px-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900 dark:text-white transition flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Shortlist Candidate</span>
                      </button>
                    )}

                    {cand.status !== 'Not Shortlisted' && (
                      <button
                        onClick={() => handleOpenNotShortlistedModal(cand)}
                        className="py-2 px-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 hover:bg-rose-500 hover:text-slate-900 dark:text-white transition flex items-center justify-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Not Shortlisted</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenInterviewModal(cand)}
                      className="py-2 px-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{cand.status === 'Interview Scheduled' ? 'Reschedule Interview' : 'Schedule Interview'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POST A JOB WIZARD TAB */}
        {activeTab === 'post-job' && (
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-2xl max-w-3xl mx-auto space-y-4 text-xs">
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Create Job Vacancy Mandate</h3>

            {!postedSuccess ? (
              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Job Title *</label>
                  <input
                    required
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Senior Project Manager"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Destination Country</label>
                    <select
                      value={jobForm.country}
                      onChange={(e) => setJobForm({ ...jobForm, country: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi)</option>
                      <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                      <option value="Qatar">🇶🇦 Qatar</option>
                      <option value="Singapore">🇸🇬 Singapore</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Industry Sector</label>
                    <select
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="Construction">Construction & MEP</option>
                      <option value="Oil & Gas">Oil & Gas</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="IT & Software">IT & Software</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Aviation">Aviation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Specific City / Location</label>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      placeholder="e.g. Dubai, Business Bay"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Job Type</label>
                    <select
                      value={jobForm.jobType}
                      onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="Full-time">Full-time Permanent</option>
                      <option value="Contract">Project Contract</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Offered Monthly Salary (Tax Free)</label>
                    <input
                      type="text"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                      placeholder="e.g. AED 30,000 - 40,000 / month"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Vacancies Count (Bulk Hiring)</label>
                    <input
                      type="number"
                      value={jobForm.vacancies}
                      onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Experience Required</label>
                    <input
                      type="text"
                      value={jobForm.experience}
                      onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                      placeholder="e.g. 5 - 8 Years"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Key Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                      placeholder="e.g. Project Management, FIDIC, Budgeting"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* SECTION A: QUALIFICATIONS & MANDATORY LICENCES */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">A. Qualifications & Mandatory Licences</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Minimum Education Level</label>
                      <select
                        value={jobForm.educationLevel}
                        onChange={(e) => setJobForm({ ...jobForm, educationLevel: e.target.value })}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="High School / Secondary">High School / Secondary</option>
                        <option value="Associate Degree / Diploma">Associate Degree / Diploma</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate / Ph.D.">Doctorate / Ph.D.</option>
                        <option value="Professional Certification">Professional Certification</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Required Degree or Field</label>
                      <input
                        type="text"
                        value={jobForm.requiredDegree}
                        onChange={(e) => setJobForm({ ...jobForm, requiredDegree: e.target.value })}
                        placeholder="e.g. B.Sc. in Civil Engineering / MBBS"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Academic / Professional Qualifications</label>
                      <input
                        type="text"
                        value={jobForm.academicQualifications}
                        onChange={(e) => setJobForm({ ...jobForm, academicQualifications: e.target.value })}
                        placeholder="e.g. PMP, FIDIC Specialist, ACLS"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Mandatory Licences (if any)</label>
                      <input
                        type="text"
                        value={jobForm.mandatoryLicences}
                        onChange={(e) => setJobForm({ ...jobForm, mandatoryLicences: e.target.value })}
                        placeholder="e.g. UAE Driving License, MOHRE Healthcare Card"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION B: BENEFITS */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <Award className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">B. Employer Provided Benefits</h4>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select standard compensation benefits and add custom allowances:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STANDARD_BENEFITS.map((benefit) => {
                      const isSelected = jobForm.benefits.includes(benefit);
                      return (
                        <label
                          key={benefit}
                          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition select-none ${
                            isSelected
                              ? 'bg-gold-500/10 border-gold-500/40 text-navy-950 dark:text-gold-300 font-bold'
                              : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleBenefit(benefit)}
                            className="w-4 h-4 rounded text-[#102B45] focus:ring-gold-500 accent-[#102B45] cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] leading-tight">{benefit}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Active selected benefits badges & custom benefit adder */}
                  <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-navy-800/80">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Selected ({jobForm.benefits.length}):</span>
                      {jobForm.benefits.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-medium"
                        >
                          <span>{b}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(b)}
                            className="hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={customBenefitInput}
                        onChange={(e) => setCustomBenefitInput(e.target.value)}
                        placeholder="Add another custom benefit (e.g. Children School Allowance)..."
                        className="flex-1 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomBenefit(e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomBenefit}
                        className="px-3.5 py-1.5 bg-[#102B45] hover:bg-[#0c2236] text-white dark:bg-gold-500 dark:text-navy-950 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        + Add Benefit
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION C: CONTRACT LENGTH */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <Clock className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">C. Contract Length & Renewal</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Contract Type</label>
                      <select
                        value={jobForm.contractType}
                        onChange={(e) => setJobForm({ ...jobForm, contractType: e.target.value })}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Permanent">Permanent</option>
                        <option value="Fixed-term contract">Fixed-term contract</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Contract Renewal Possibility</label>
                      <select
                        value={jobForm.contractRenewal}
                        onChange={(e) => setJobForm({ ...jobForm, contractRenewal: e.target.value })}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Yes, Renewable upon mutual agreement">Yes, Renewable upon mutual agreement</option>
                        <option value="No, Fixed non-renewable project">No, Fixed non-renewable project</option>
                        <option value="Performance-based Renewal">Performance-based Renewal</option>
                      </select>
                    </div>
                  </div>

                  {jobForm.contractType !== 'Permanent' && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Contract Duration (Fixed / Temporary)</label>
                      <input
                        type="text"
                        value={jobForm.contractDuration}
                        onChange={(e) => setJobForm({ ...jobForm, contractDuration: e.target.value })}
                        placeholder="e.g. 6 Months, 1 Year, 2 Years"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  )}
                </div>

                {/* SECTION D: ACCOMMODATION AND TRANSPORTATION */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <Building2 className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">D. Accommodation and Transportation</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Accommodation Provided</label>
                      <select
                        value={jobForm.accommodation}
                        onChange={(e) => setJobForm({ ...jobForm, accommodation: e.target.value })}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Yes, Employer Provided Housing">Yes, Employer Provided Housing</option>
                        <option value="No, Not Provided">No, Not Provided</option>
                        <option value="Allowance Provided">Allowance Provided</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Transportation Provided</label>
                      <select
                        value={jobForm.transportation}
                        onChange={(e) => setJobForm({ ...jobForm, transportation: e.target.value })}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Yes, Employer Provided Transportation">Yes, Employer Provided Transportation</option>
                        <option value="No, Not Provided">No, Not Provided</option>
                        <option value="Allowance Provided">Allowance Provided</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Additional Living Allowance Specifics & Conditions</label>
                    <input
                      type="text"
                      value={jobForm.livingAllowancesDetails}
                      onChange={(e) => setJobForm({ ...jobForm, livingAllowancesDetails: e.target.value })}
                      placeholder="e.g. Monthly housing allowance AED 5,000, company transport van to job site provided"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* SECTION E: VISA SPONSORSHIP */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <Globe className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">E. Visa Sponsorship</h4>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Employer Work Visa Sponsorship</label>
                    <select
                      value={jobForm.visaSponsorship}
                      onChange={(e) => setJobForm({ ...jobForm, visaSponsorship: e.target.value })}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="Visa sponsorship provided">Visa sponsorship provided</option>
                      <option value="Sponsorship not provided">Sponsorship not provided</option>
                      <option value="Sponsorship details to be confirmed">Sponsorship details to be confirmed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Visa Support Description</label>
                    <input
                      type="text"
                      value={jobForm.visaSupportDetails}
                      onChange={(e) => setJobForm({ ...jobForm, visaSupportDetails: e.target.value })}
                      placeholder="e.g. Employer covers 100% of work permit, residence visa stamping, and medical fitness."
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Notice:</strong> Work visa issuance is subject to destination country immigration authority approval and candidate background clearance.
                    </span>
                  </div>
                </div>

                {/* SECTION F: APPLICATION CLOSING DATE */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
                    <Calendar className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">F. Application Closing Date</h4>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Application Deadline *</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={jobForm.closingDate}
                      onChange={(e) => {
                        setJobForm({ ...jobForm, closingDate: e.target.value });
                        setClosingDateError('');
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                    />
                    {closingDateError && (
                      <p className="text-rose-500 text-[11px] font-bold mt-1">{closingDateError}</p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Vacancies will remain open until midnight (23:59:59) on this date across destination timezones. Expired postings will automatically disable new applicant submissions.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Role Description & Requirements *</label>
                  <textarea
                    required
                    rows={4}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Specify responsibilities, qualifications, degree attestation requirements..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                  Publish Mandate to Revival Talent Portal →
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Job Mandate Published Successfully!</h4>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  <strong>"{lastPostedTitle}"</strong> is now live on the public Jobs section and Revival AI Matching Engine is scanning 50,000+ candidates for your position.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigateTo('jobs')}
                    className="py-3 px-6 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center justify-center gap-2 hover:opacity-95 transition"
                  >
                    <span>View in Jobs Section</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="py-3 px-6 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition"
                  >
                    Post Another Role
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEARCH TALENT DATABASE TAB */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="glass-card bg-white dark:bg-navy-900 border p-6 rounded-2xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Headhunter Pre-Screened Candidates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {candidatePool.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 border rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-navy-900 dark:text-white">{c.name}</h4>
                      <span className="bg-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded text-[10px]">{c.match} Match</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{c.role} • {c.exp} Exp</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">{c.location}</p>
                    <button
                      onClick={() => handleOpenInterviewModal(c)}
                      className="w-full py-1.5 bg-slate-50 dark:bg-navy-900 text-gold-400 font-bold rounded-lg text-[11px]"
                    >
                      Schedule Interview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN CANDIDATE MODAL */}
        {screenCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 w-full max-w-2xl rounded-3xl p-6 space-y-6 shadow-2xl relative text-xs">
              <button
                onClick={() => setScreenCandidate(null)}
                className="absolute right-4 top-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full bg-slate-100 dark:bg-navy-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-navy-800 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gold-500 text-navy-950 font-serif font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-gold-glow">
                  {screenCandidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-slate-200 dark:border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Candidate Screening Report</span>
                  <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1">{screenCandidate.name}</h3>
                  <p className="text-slate-500 font-medium">{screenCandidate.role} • Applied for {screenCandidate.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">AI ATS Score</span>
                  <span className="text-emerald-500 font-serif text-2xl font-extrabold">{screenCandidate.match} Match</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Current Application Status</span>
                  <span className="text-gold-500 font-bold text-sm">{screenCandidate.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy-900 dark:text-white">Qualifications & Background:</h4>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• <strong>Education:</strong> {screenCandidate.education}</li>
                  <li>• <strong>Experience:</strong> {screenCandidate.exp} in international project management</li>
                  <li>• <strong>Contact:</strong> {screenCandidate.email} • {screenCandidate.phone}</li>
                  <li>• <strong>Location:</strong> {screenCandidate.location}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy-900 dark:text-white">Verified Skills Matrix:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {screenCandidate.skills.map((sk, idx) => (
                    <span key={idx} className="bg-gold-500/15 text-gold-700 dark:text-gold-400 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-slate-200 dark:border-gold-500/30">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
                {screenCandidate.status !== 'Shortlisted' && screenCandidate.status !== 'Interview Scheduled' && (
                  <button
                    onClick={() => handleShortlistCandidate(screenCandidate)}
                    className="flex-1 py-3 bg-emerald-500 text-slate-900 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Shortlist Candidate</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const target = screenCandidate;
                    setScreenCandidate(null);
                    handleOpenInterviewModal(target);
                  }}
                  className="flex-1 py-3 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center justify-center gap-2 hover:opacity-95 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Video Interview →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE INTERVIEW MODAL */}
        {interviewCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative text-xs">
              <button
                onClick={() => setInterviewCandidate(null)}
                className="absolute right-4 top-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full bg-slate-100 dark:bg-navy-800"
              >
                <X className="w-4 h-4" />
              </button>

              {!interviewSuccess ? (
                <form onSubmit={handleConfirmInterview} className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-navy-800 pb-3">
                    <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Conduct Candidate Interview</span>
                    <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1">Schedule Interview with {interviewCandidate.name}</h3>
                    <p className="text-slate-500">Position: {interviewCandidate.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Interview Date</label>
                      <input
                        type="date"
                        required
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Interview Time (GST / Local)</label>
                      <input
                        type="text"
                        required
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                        placeholder="e.g. 11:00 AM GST"
                        className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Interview Mode / Platform</label>
                    <select
                      value={interviewForm.mode}
                      onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="Microsoft Teams Video Call">🎥 Microsoft Teams Video Call</option>
                      <option value="Google Meet Video Link">📹 Google Meet Video Link</option>
                      <option value="On-Site Head Office Interview (Dubai HQ)">🏢 On-Site Head Office Interview (Dubai HQ)</option>
                      <option value="Direct Telephonic Screening">📞 Direct Telephonic Screening</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Interviewer / Panel Name</label>
                    <input
                      type="text"
                      value={interviewForm.interviewer}
                      onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Notes & Instructions for Candidate</label>
                    <textarea
                      rows={3}
                      value={interviewForm.notes}
                      onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center gap-2 hover:opacity-95 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Official Interview Invitation →</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Interview Invitation Sent!</h4>
                  <p className="text-slate-500 text-xs">
                    {interviewCandidate.name} has been notified and sent calendar invitations for {interviewForm.date} at {interviewForm.time}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOT SHORTLISTED NOTIFICATION MODAL */}
        {notShortlistedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-lg w-full p-6 shadow-luxury relative text-xs">

              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Mark Candidate as Not Shortlisted</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Inform candidate about application status decision</p>
                  </div>
                </div>
                <button onClick={() => setNotShortlistedCandidate(null)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!notShortlistedSuccess ? (
                <form onSubmit={handleConfirmNotShortlisted} className="space-y-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 font-medium text-[11px] leading-relaxed flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      Marking <strong>{notShortlistedCandidate.name}</strong> as Not Shortlisted will update their status in the candidate portal and dispatch an automated status update to <strong>{notShortlistedCandidate.email}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Applied Role</label>
                    <input
                      readOnly
                      value={`${notShortlistedCandidate.role} (${user.companyName || notShortlistedCandidate.company || 'Revival Partner'})`}
                      className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-xl p-2.5 text-slate-700 dark:text-slate-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Select Rejection / Feedback Category</label>
                    <select
                      value={notShortlistedForm.reasonCategory}
                      onChange={(e) => setNotShortlistedForm({ ...notShortlistedForm, reasonCategory: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                    >
                      <option value="Experience Gap">Experience Level Below Mandate Requirements</option>
                      <option value="Skill Set Misalignment">Specific Technical / Certification Skill Gap</option>
                      <option value="Location / Visa Mandate">GCC Relocation / Visa Constraint</option>
                      <option value="Position Filled">Mandate Quota Filled by Other Candidates</option>
                      <option value="General Profile Feedback">General Profile Evaluation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Automated Email & Portal Notification Message (Preview)
                    </label>
                    <textarea
                      rows={5}
                      value={notShortlistedForm.message}
                      onChange={(e) => setNotShortlistedForm({ ...notShortlistedForm, message: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-[11px] text-slate-900 dark:text-white dark:text-slate-200 focus:outline-none focus:border-gold-500 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setNotShortlistedCandidate(null)}
                      className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-slate-900 dark:text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Notification & Mark Not Shortlisted</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Candidate Notified Successfully</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {notShortlistedCandidate.name}'s application status has been marked as <strong>Not Shortlisted</strong>. An official notification has been dispatched to {notShortlistedCandidate.email}.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

import { getPendingCareerEnquiry } from '../utils/careerGuidanceAuth.js';
import { getPendingStudentAcademyEnquiry } from '../utils/studentAcademyAuth.js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { useCrm } from '../crm/context/CrmContext';
import { trackPageView, trackFunnelStep } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const crm = useCrm();
  const [localDarkMode, setLocalDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_theme_mode');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  const darkMode = crm ? crm.darkMode : localDarkMode;
  const toggleDarkMode = () => {
    if (crm && crm.toggleDarkMode) {
      crm.toggleDarkMode();
    } else {
      setLocalDarkMode(prev => {
        const next = !prev;
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        try {
          localStorage.setItem('sir_theme_mode', next ? 'dark' : 'light');
        } catch (e) { }
        return next;
      });
    }
  };
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('AED');
  const [selectedJobCategory, setSelectedJobCategory] = useState('All');

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['EN']?.[key] || key;
  };

  useEffect(() => {
    if (language === 'AR') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language ? language.toLowerCase() : 'en');
    }
  }, [language]);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const rawHash = window.location.hash.replace('#', '');
      const hash = rawHash.split('?')[0];
      if (path === 'crm' || path.startsWith('crm/') || hash === 'crm') return 'crm';
      if (hash) return hash;
      if (path && path !== '') return path;
    }
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const rawHash = window.location.hash.replace('#', '');
        const hash = rawHash.split('?')[0];
        if (hash) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'apply', 'ai-resume', 'payment', 'resume-builder', 'post-job', 'verification-modal', 'auth'
  const [authModalConfig, setAuthModalConfig] = useState({ mode: 'login', role: null });

  const openAuthModal = (mode = 'login', role = null) => {
    setAuthModalConfig({ mode, role });
    setActiveModal('auth');
  };

  const [pendingJobToApply, setPendingJobToApplyState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sir_pending_job_apply');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPendingJobToApply = (job) => {
    setPendingJobToApplyState(job);
    try {
      if (job) {
        sessionStorage.setItem('sir_pending_job_apply', JSON.stringify(job));
      } else {
        sessionStorage.removeItem('sir_pending_job_apply');
      }
    } catch { }
  };
  const [savedJobs, setSavedJobs] = useState(['job-101']);
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_job_applications');
      return saved ? JSON.parse(saved) : [
        {
          id: 'APP-9982',
          jobId: 'job-101',
          jobTitle: 'Senior Civil Project Manager',
          company: 'Al Habtoor Contracting LLC',
          country: 'UAE',
          appliedDate: '2026-08-01',
          status: 'Interview Scheduled',
          step: 3
        }
      ];
    } catch {
      return [];
    }
  });

  // Auth State Management & Candidate Profile Database Persistence
  const getCandidateDB = () => {
    try {
      const saved = localStorage.getItem('sir_candidates_db');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveCandidateToDB = (candidateObj) => {
    if (!candidateObj || !candidateObj.email) return;
    const normalizedEmail = candidateObj.email.toLowerCase().trim();
    const db = getCandidateDB();
    db[normalizedEmail] = {
      ...db[normalizedEmail],
      ...candidateObj,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('sir_candidates_db', JSON.stringify(db));
  };

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sir_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email && parsed.role === 'candidate') {
          const db = getCandidateDB();
          const storedProfile = db[parsed.email.toLowerCase().trim()];
          return storedProfile ? { ...parsed, ...storedProfile } : parsed;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('sir_user_session', JSON.stringify(userData));
      if (userData.role === 'candidate' && userData.email) {
        saveCandidateToDB(userData);
      }
    } else {
      localStorage.removeItem('sir_user_session');
    }
  };

  const loginCandidate = (email, password) => {
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    const db = getCandidateDB();
    let candidateUser = db[normalizedEmail];

    // Predefined thejobsync candidate account
    if (normalizedEmail === 'thejobsyncit@gmail.com' && password === 'Thejobsync@26') {
      if (!candidateUser) {
        candidateUser = {
          name: 'thejobsync',
          email: 'thejobsyncit@gmail.com',
          password: 'Thejobsync@26',
          phone: '+91 9876543210',
          title: 'Executive Director & Candidate',
          location: 'Chennai, India',
          preferredCountry: 'UAE',
          experience: '5+ Years',
          avatar: '',
          role: 'candidate',
          isAdmin: true,
          isRegistered: true,
          candidateId: 'REV-CAN-THEJOBSYNC',
          loginTime: new Date().toISOString()
        };
      } else {
        candidateUser = { ...candidateUser, isRegistered: true, password: 'Thejobsync@26', loginTime: new Date().toISOString() };
      }

      saveCandidateToDB(candidateUser);
      saveUserSession(candidateUser);
      const pendingAcademy = typeof getPendingStudentAcademyEnquiry === 'function' ? getPendingStudentAcademyEnquiry() : null;
      const pendingCareer = typeof getPendingCareerEnquiry === 'function' ? getPendingCareerEnquiry() : null;
      const targetTab = (pendingAcademy && pendingAcademy.route)
        ? pendingAcademy.route
        : ((pendingCareer && pendingCareer.route) ? pendingCareer.route : 'candidates');
      setActiveTab(targetTab);
      if (typeof window !== 'undefined' && targetTab !== 'candidates') {
        window.location.hash = targetTab;
      }
      return { success: true, user: candidateUser };
    }

    // Regular users MUST be registered first
    if (!candidateUser || !candidateUser.isRegistered) {
      return {
        success: false,
        message: 'No registered account found with this email. Please click "Create Candidate Account" below to register first.'
      };
    }

    // Verify password
    if (candidateUser.password && candidateUser.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      };
    }

    candidateUser = { ...candidateUser, loginTime: new Date().toISOString() };
    saveCandidateToDB(candidateUser);
    saveUserSession(candidateUser);
    const pendingAcademy = typeof getPendingStudentAcademyEnquiry === 'function' ? getPendingStudentAcademyEnquiry() : null;
      const pendingCareer = typeof getPendingCareerEnquiry === 'function' ? getPendingCareerEnquiry() : null;
      const targetTab = (pendingAcademy && pendingAcademy.route)
        ? pendingAcademy.route
        : ((pendingCareer && pendingCareer.route) ? pendingCareer.route : 'candidates');
      setActiveTab(targetTab);
      if (typeof window !== 'undefined' && targetTab !== 'candidates') {
        window.location.hash = targetTab;
      }
    return { success: true, user: candidateUser };
  };

  const loginWithGoogle = async (googleUser) => {
    const normalizedEmail = (googleUser.email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, message: 'Valid Google email is required.' };
    }

    const db = getCandidateDB();
    const existing = db[normalizedEmail] || {};

    const KNOWN_AVATARS = {
      'kishorekumaroff1@gmail.com': '/images/avatar_kishore.png',
      'kishorekumaroffl@gmail.com': '/images/avatar_kishore.png',
      'harishdurai2508@gmail.com': '/images/avatar_harish.png'
    };

    const isNoPhotoAccount = normalizedEmail === 'thejobsyncit@gmail.com' || normalizedEmail === 'mrjobsync@gmail.com';

    const candidateUser = {
      ...existing,
      name: googleUser.name || existing.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: googleUser.phone || existing.phone || '',
      password: existing.password || 'GoogleOAuth2Verified',
      avatar: isNoPhotoAccount ? (existing.avatar || '') : (KNOWN_AVATARS[normalizedEmail] || googleUser.avatar || existing.avatar || ''),
      role: 'candidate',
      isAdmin: normalizedEmail === 'thejobsyncit@gmail.com',
      isRegistered: true,
      authProvider: 'google',
      googleVerified: true,
      candidateId: existing.candidateId || ('REV-CAN-' + Math.floor(10000 + Math.random() * 90000)),
      preferredCountry: existing.preferredCountry || 'UAE',
      title: existing.title || (normalizedEmail === 'thejobsyncit@gmail.com' ? 'Super Admin & Executive Candidate' : 'Executive Candidate'),
      experience: existing.experience || '3-5 Years',
      skills: existing.skills && existing.skills.length > 0 ? existing.skills : ['General Talent'],
      registeredAt: existing.registeredAt || new Date().toISOString(),
      loginTime: new Date().toISOString()
    };

    saveCandidateToDB(candidateUser);
    saveUserSession(candidateUser);
    setActiveTab('candidates');

    // Sync to backend SQLite database & CRM leads
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidateUser.candidateId,
          name: candidateUser.name,
          email: candidateUser.email,
          phone: candidateUser.phone,
          nationality: candidateUser.preferredCountry,
          currentEmployer: 'Google Verified Candidate',
          currentRole: candidateUser.title,
          expectedSalary: 'Market Standard',
          stage: 'lead',
          score: 92,
          skills: candidateUser.skills,
          source: 'Google Authentication (Gmail)',
          aiSummary: `Candidate verified via Google Authentication (${candidateUser.email}).`
        })
      });
    } catch (err) {
      console.error('Failed to sync Google candidate to backend:', err);
    }

    if (crm && crm.addCandidate) {
      crm.addCandidate({
        id: candidateUser.candidateId,
        name: candidateUser.name,
        email: candidateUser.email,
        phone: candidateUser.phone,
        title: candidateUser.title,
        status: 'Web Lead (Google Verified)',
        score: 92,
        stage: 'lead',
        nationality: candidateUser.preferredCountry,
        skills: candidateUser.skills
      });
    }

    return { success: true, user: candidateUser };
  };

  const registerCandidate = async (data) => {
    const normalizedEmail = (data.email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return { success: false, message: 'Valid email is required.' };
    }
    if (!data.password) {
      return { success: false, message: 'Password is required for registration.' };
    }

    const db = getCandidateDB();
    const existing = db[normalizedEmail] || {};

    if (existing && existing.isRegistered) {
      return {
        success: false,
        message: 'An account with this email is already registered. Please sign in.'
      };
    }

    const candidateUser = {
      ...existing,
      name: data.fullName || existing.name || '',
      email: normalizedEmail,
      password: data.password,
      phone: data.phone || existing.phone || '',
      dob: existing.dob || '',
      gender: existing.gender || '',
      title: data.industry || existing.title || 'Executive Candidate',
      location: existing.location || '',
      preferredCountry: data.preferredCountry || existing.preferredCountry || 'UAE',
      experience: existing.experience || '3-5 Years',
      qualification: existing.qualification || '',
      skills: existing.skills && existing.skills.length > 0 ? existing.skills : [data.industry || 'General Talent'],
      expectedSalary: existing.expectedSalary || 'Market Standard',
      avatar: existing.avatar || '',
      role: 'candidate',
      isRegistered: true,
      candidateId: existing.candidateId || ('REV-CAN-' + Math.floor(10000 + Math.random() * 90000)),
      resumeUploaded: !!data.resumeName || existing.resumeUploaded || false,
      resumeName: data.resumeName || existing.resumeName || '',
      mohreAttested: existing.mohreAttested || false,
      registeredAt: existing.registeredAt || new Date().toISOString(),
      loginTime: new Date().toISOString()
    };

    saveCandidateToDB(candidateUser);
    saveUserSession(candidateUser);
    const pendingAcademy = typeof getPendingStudentAcademyEnquiry === 'function' ? getPendingStudentAcademyEnquiry() : null;
      const pendingCareer = typeof getPendingCareerEnquiry === 'function' ? getPendingCareerEnquiry() : null;
      const targetTab = (pendingAcademy && pendingAcademy.route)
        ? pendingAcademy.route
        : ((pendingCareer && pendingCareer.route) ? pendingCareer.route : 'candidates');
      setActiveTab(targetTab);
      if (typeof window !== 'undefined' && targetTab !== 'candidates') {
        window.location.hash = targetTab;
      }

    // Post to backend Candidates API to persist into SQLite database & CRM leads
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidateUser.candidateId,
          name: candidateUser.name,
          email: candidateUser.email,
          phone: candidateUser.phone,
          nationality: candidateUser.preferredCountry,
          currentEmployer: 'Revival International Talent Pool',
          currentRole: candidateUser.title,
          expectedSalary: candidateUser.expectedSalary,
          stage: 'lead',
          score: 85,
          skills: candidateUser.skills,
          source: 'Website Candidate Registration',
          aiSummary: `Candidate registered online for ${candidateUser.preferredCountry} opportunities in ${candidateUser.title}.`
        })
      });
    } catch (err) {
      console.error('Failed to sync registered candidate to backend:', err);
    }

    // CRM Integration: Add candidate to internal CRM database
    if (crm && crm.addCandidate) {
      crm.addCandidate({
        id: candidateUser.candidateId,
        name: candidateUser.name,
        email: candidateUser.email,
        phone: candidateUser.phone,
        title: candidateUser.title,
        status: 'Web Lead',
        score: 85,
        stage: 'lead',
        nationality: candidateUser.preferredCountry,
        skills: candidateUser.skills
      });
    }

    return { success: true, user: candidateUser };
  };

  const updateUserProfile = (profileData) => {
    setUser(prev => {
      const updated = { ...prev, ...profileData };
      saveUserSession(updated);
      saveCandidateToDB(updated);
      return updated;
    });
  };

  const loginEmployer = (companyEmail, accountId, password) => {
    const employerUser = {
      name: companyEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Corporate HR Director',
      companyName: 'Al Habtoor Contracting LLC',
      email: companyEmail,
      role: 'employer',
      accountId: accountId || 'REV-EMP-9902',
      mohreVerified: true,
      activeMandates: 8,
      loginTime: new Date().toISOString()
    };
    saveUserSession(employerUser);
    setActiveTab('employers');
    return employerUser;
  };

  const logout = () => {
    saveUserSession(null);
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const applyForJob = async (job) => {
    if (!job || !job.id) return;
    const newApp = {
      id: 'APP-' + Math.floor(1000 + Math.random() * 9000),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      country: job.country,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Under AI Resume Screening',
      step: 1
    };

    // Post to backend Candidates API as a new application and CRM lead
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.candidateId || ('REV-CAN-' + Math.floor(1000 + Math.random() * 9000)),
          name: user ? user.name : 'Unknown Candidate',
          email: user ? user.email : '',
          phone: user ? user.phone : '',
          nationality: user?.preferredCountry || job.country || 'UAE',
          currentEmployer: user?.companyName || 'Talent Applicant',
          currentRole: job.title,
          expectedSalary: job.salary || 'Standard',
          source: `Applied for: ${job.title} (${job.company})`,
          stage: 'applied',
          score: 90,
          skills: user?.skills && user.skills.length > 0 ? user.skills : (job.skills || [job.category || 'Executive']),
          aiSummary: `Candidate applied for ${job.title} at ${job.company} (${job.location || job.country}). Resume: ${user?.resumeName || 'Attached'}`
        })
      });
    } catch (err) {
      console.error('Failed to sync application to CRM:', err);
    }

    setApplications(prev => {
      if (prev.some(a => a.jobId === job.id)) return prev;
      const updated = [newApp, ...prev];
      try {
        localStorage.setItem('sir_job_applications', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const updateApplicationStatus = (appId, newStatus, step, interviewDetails = null, notShortlistedDetails = null) => {
    setApplications(prev => {
      const updated = prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            status: newStatus,
            step: step !== undefined ? step : app.step,
            interviewDetails: interviewDetails || app.interviewDetails,
            notShortlistedDetails: notShortlistedDetails || app.notShortlistedDetails
          };
        }
        return app;
      });
      try {
        localStorage.setItem('sir_job_applications', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  // Sync URL pathname & hash routing
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const hash = window.location.hash.replace('#', '');
      if (path === 'crm' || path.startsWith('crm/') || hash === 'crm') {
        setActiveTab('crm');
      } else if (hash) {
        setActiveTab(hash);
      } else if (path && path !== '') {
        setActiveTab(path);
      } else {
        setActiveTab('home');
      }
    };
    handleUrlSync();
    window.addEventListener('hashchange', handleUrlSync);
    window.addEventListener('popstate', handleUrlSync);
    return () => {
      window.removeEventListener('hashchange', handleUrlSync);
      window.removeEventListener('popstate', handleUrlSync);
    };
  }, []);

  // Track Page Views & Landing Page Funnel Step on Active Tab Change
  useEffect(() => {
    try {
      const attribution = getAttributionData();
      const pageTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | Revival International`;
      trackPageView(activeTab === 'home' ? '/' : `/${activeTab}`, pageTitle, {
        utm_source: attribution.utmSource,
        utm_medium: attribution.utmMedium,
        utm_campaign: attribution.utmCampaign
      });
      if (activeTab === 'home' || activeTab === '') {
        trackFunnelStep(1, 'landing_page_visit', 'home');
      }
    } catch (e) {
      console.debug('Analytics page view tracking error:', e);
    }
  }, [activeTab]);

  // Posted Jobs State Management
  const [postedJobs, setPostedJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_posted_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addJob = async (jobData) => {
    const newJob = {
      id: 'job-' + Date.now(),
      title: jobData.title || 'Untitled Role',
      company: user?.companyName || jobData.company || 'Al Habtoor Contracting LLC',
      country: jobData.country || 'UAE',
      location: jobData.location || `${jobData.country || 'UAE'}, Business District`,
      salary: jobData.salary || 'Negotiable',
      experience: jobData.experience || '2 - 5 Years',
      jobType: jobData.jobType || 'Full-time',
      category: jobData.category || 'Construction',
      description: jobData.description || 'Job mandate posted via Revival Employer Portal.',
      vacancies: jobData.vacancies || '5',
      skills: Array.isArray(jobData.skills)
        ? jobData.skills
        : (jobData.skills ? jobData.skills.split(',').map(s => s.trim()) : ['Management', 'Operations']),
      qualification: jobData.qualification || "Bachelor's Degree",
      benefits: Array.isArray(jobData.benefits)
        ? jobData.benefits
        : (jobData.benefits ? jobData.benefits.split(',').map(b => b.trim()) : ['Tax-free salary', 'Visa Sponsorship', 'Medical Insurance']),
      postedDate: 'Just now',
      featured: true
    };

    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
    } catch (err) {
      console.warn('Backend offline, posting job to local state:', err);
    }

    setPostedJobs(prev => {
      const updated = [newJob, ...prev];
      localStorage.setItem('sir_posted_jobs', JSON.stringify(updated));
      return updated;
    });

    // CRM Integration: Log client requirement
    if (crm && crm.addClient) {
      crm.addClient({
        company: newJob.company,
        email: user?.email || 'employer@web.com',
        industry: newJob.category,
        requirements: [{ title: newJob.title, description: newJob.description }],
        status: 'Active'
      });
    }

    return newJob;
  };

  const deleteJob = async (jobId) => {
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend offline, deleting job from local state:', err);
    }

    setPostedJobs(prev => {
      const updated = prev.filter(j => j.id !== jobId);
      localStorage.setItem('sir_posted_jobs', JSON.stringify(updated));
      return updated;
    });
  };

  const [selectedServiceId, setSelectedServiceIdState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlService = urlParams.get('service');
        if (urlService) return urlService;
        const saved = sessionStorage.getItem('sir_selected_service_id');
        return saved || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const setSelectedServiceId = (serviceId) => {
    setSelectedServiceIdState(serviceId);
    try {
      if (serviceId) {
        sessionStorage.setItem('sir_selected_service_id', serviceId);
      } else {
        sessionStorage.removeItem('sir_selected_service_id');
      }
    } catch { }
  };

  const [selectedIndustryId, setSelectedIndustryId] = useState(null);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    if (tab === 'crm') {
      window.history.pushState({}, '', '/crm');
    } else {
      if (window.location.pathname.startsWith('/crm')) {
        window.history.pushState({}, '', '/' + (tab === 'home' ? '' : `#${tab}`));
      } else {
        window.location.hash = tab;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToService = (serviceId) => {
    setSelectedServiceId(serviceId);
    const eduIds = ['intl-consult', 'college-adm', 'school-career', 'intl-adm', 'school-academy', 'exec-seminars-lang'];
    if (eduIds.includes(serviceId)) {
      navigateTo(`education-${serviceId}`);
      return;
    }
    setActiveTab('services');
    window.location.hash = 'services';
    setTimeout(() => {
      const elem = document.getElementById(`service-${serviceId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  };

  const navigateToIndustry = (industryId) => {
    setSelectedIndustryId(industryId);
    setActiveTab('industries');
    window.location.hash = 'industries';
    setTimeout(() => {
      const elem = document.getElementById(`industry-${industryId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        activeTab,
        navigateTo,
        selectedServiceId,
        setSelectedServiceId,
        selectedIndustryId,
        setSelectedIndustryId,
        navigateToService,
        navigateToIndustry,
        selectedJob,
        setSelectedJob,
        selectedJobCategory,
        setSelectedJobCategory,
        activeModal,
        setActiveModal,
        authModalConfig,
        openAuthModal,
        pendingJobToApply,
        setPendingJobToApply,
        savedJobs,
        toggleSaveJob,
        applications,
        applyForJob,
        updateApplicationStatus,
        postedJobs,
        addJob,
        deleteJob,
        user,
        setUser,
        updateUserProfile,
        loginCandidate,
        registerCandidate,
        loginWithGoogle,
        loginEmployer,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

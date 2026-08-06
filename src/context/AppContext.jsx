import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('AED');

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
      const hash = window.location.hash.replace('#', '');
      if (path === 'crm' || path.startsWith('crm/') || hash === 'crm') return 'crm';
      if (hash) return hash;
      if (path && path !== '') return path;
    }
    return 'home';
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'apply', 'ai-resume', 'payment', 'resume-builder', 'post-job', 'verification-modal', 'auth'
  const [authModalConfig, setAuthModalConfig] = useState({ mode: 'login', role: null });

  const openAuthModal = (mode = 'login', role = null) => {
    setAuthModalConfig({ mode, role });
    setActiveModal('auth');
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
    const db = getCandidateDB();
    let candidateUser = db[normalizedEmail];

    if (!candidateUser) {
      candidateUser = {
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Executive Candidate',
        email: email,
        phone: '',
        dob: '',
        gender: '',
        title: '',
        location: '',
        preferredCountry: '',
        experience: '',
        qualification: '',
        skills: [],
        expectedSalary: '',
        avatar: '',
        role: 'candidate',
        candidateId: 'SIR-CAN-' + Math.floor(10000 + Math.random() * 90000),
        resumeUploaded: false,
        resumeName: '',
        mohreAttested: false,
        loginTime: new Date().toISOString()
      };
    } else {
      candidateUser = { ...candidateUser, loginTime: new Date().toISOString() };
    }

    saveCandidateToDB(candidateUser);
    saveUserSession(candidateUser);
    setActiveTab('candidates');
    return candidateUser;
  };

  const registerCandidate = (data) => {
    const normalizedEmail = (data.email || '').toLowerCase().trim();
    const db = getCandidateDB();
    const existing = db[normalizedEmail] || {};

    const candidateUser = {
      ...existing,
      name: data.fullName || existing.name || '',
      email: data.email || existing.email || '',
      phone: data.phone || existing.phone || '',
      dob: existing.dob || '',
      gender: existing.gender || '',
      title: data.industry || existing.title || '',
      location: existing.location || '',
      preferredCountry: data.preferredCountry || existing.preferredCountry || '',
      experience: existing.experience || '',
      qualification: existing.qualification || '',
      skills: existing.skills || [],
      expectedSalary: existing.expectedSalary || '',
      avatar: existing.avatar || '',
      role: 'candidate',
      candidateId: existing.candidateId || ('SIR-CAN-' + Math.floor(10000 + Math.random() * 90000)),
      resumeUploaded: !!data.resumeName || existing.resumeUploaded || false,
      resumeName: data.resumeName || existing.resumeName || '',
      mohreAttested: existing.mohreAttested || false,
      registeredAt: existing.registeredAt || new Date().toISOString()
    };

    saveCandidateToDB(candidateUser);
    saveUserSession(candidateUser);
    setActiveTab('candidates');
    return candidateUser;
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
      accountId: accountId || 'SIR-EMP-9902',
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

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const applyForJob = (job) => {
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
    setApplications(prev => {
      if (prev.some(a => a.jobId === job.id)) return prev;
      const updated = [newApp, ...prev];
      try {
        localStorage.setItem('sir_job_applications', JSON.stringify(updated));
      } catch {}
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
      } catch {}
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
      description: jobData.description || 'Job mandate posted via SIR Employer Portal.',
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

  const [selectedServiceId, setSelectedServiceId] = useState(null);
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
        selectedCategory,
        setSelectedCategory,
        navigateToCategoryJobs,
        navigateToService,
        navigateToIndustry,
        selectedJob,
        setSelectedJob,
        activeModal,
        setActiveModal,
        authModalConfig,
        openAuthModal,
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
        loginEmployer,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

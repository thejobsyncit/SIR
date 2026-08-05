import React, { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { TRANSLATIONS } from '../data/translations';
=======
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('AED');
<<<<<<< HEAD

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
=======
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
  const [activeTab, setActiveTab] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'apply', 'ai-resume', 'payment', 'resume-builder', 'post-job', 'verification-modal'
  const [savedJobs, setSavedJobs] = useState(['job-101']);
  const [applications, setApplications] = useState([
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
  ]);

<<<<<<< HEAD
  // Auth State Management
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sir_user_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('sir_user_session', JSON.stringify(userData));
    } else {
      localStorage.removeItem('sir_user_session');
    }
  };

  const loginCandidate = (email, password) => {
    const candidateUser = {
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Executive Candidate',
      email: email,
      role: 'candidate',
      candidateId: 'SIR-CAN-' + Math.floor(10000 + Math.random() * 90000),
      resumeUploaded: true,
      resumeName: 'Updated_Executive_CV.pdf',
      loginTime: new Date().toISOString()
    };
    saveUserSession(candidateUser);
    return candidateUser;
  };

  const registerCandidate = (data) => {
    const candidateUser = {
      name: data.fullName || 'Executive Candidate',
      email: data.email,
      phone: data.phone || '',
      preferredCountry: data.preferredCountry || 'UAE',
      industry: data.industry || 'Construction & Engineering',
      role: 'candidate',
      candidateId: 'SIR-CAN-' + Math.floor(10000 + Math.random() * 90000),
      resumeUploaded: !!data.resumeName,
      resumeName: data.resumeName || 'Uploaded_Resume.pdf',
      registeredAt: new Date().toISOString()
    };
    saveUserSession(candidateUser);
    return candidateUser;
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
    return employerUser;
  };

  const logout = () => {
    saveUserSession(null);
  };

=======
  const [user, setUser] = useState({
    name: 'Executive Candidate',
    email: 'candidate@sirrecruitment.com',
    role: 'candidate', // 'candidate' | 'employer' | 'admin'
    resumeUploaded: true,
    resumeName: 'John_Doe_Executive_CV.pdf'
  });

>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
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
    setApplications(prev => [newApp, ...prev]);
  };

<<<<<<< HEAD
  const updateApplicationStatus = (appId, newStatus, step, interviewDetails = null) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: newStatus,
          step: step || app.step,
          interviewDetails: interviewDetails || app.interviewDetails
        };
      }
      return app;
    }));
  };

=======
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

<<<<<<< HEAD
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

=======
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
  const navigateTo = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
<<<<<<< HEAD
        t,
=======
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
        currency,
        setCurrency,
        activeTab,
        navigateTo,
        selectedJob,
        setSelectedJob,
        activeModal,
        setActiveModal,
        savedJobs,
        toggleSaveJob,
        applications,
        applyForJob,
<<<<<<< HEAD
        updateApplicationStatus,
        postedJobs,
        addJob,
        deleteJob,
        user,
        setUser,
        loginCandidate,
        registerCandidate,
        loginEmployer,
        logout
=======
        user,
        setUser
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

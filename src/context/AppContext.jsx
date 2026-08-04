import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('AED');
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

  const [user, setUser] = useState({
    name: 'Executive Candidate',
    email: 'candidate@sirrecruitment.com',
    role: 'candidate', // 'candidate' | 'employer' | 'admin'
    resumeUploaded: true,
    resumeName: 'John_Doe_Executive_CV.pdf'
  });

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
        user,
        setUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

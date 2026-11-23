import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAuth } from '../components/UnifiedAuth';
import { JOBS_LIST } from '../data/mockData';
import { BrandLogoIcon } from '../components/BrandLogoIcon';
import { SEO } from '../components/SEO';
import { openCandidateResumeInNewTab, downloadCandidateResumePdf } from '../services/candidateResumePdfService';
import {
  Sun, Moon,
  LayoutDashboard, User, FileText, Bookmark, Send, Clock, Calendar, Shield,
  Settings, LogOut, Bell, Search, Menu, X, ChevronRight, ChevronDown, CheckCircle2,
  AlertCircle, Briefcase, Building2, MapPin, Sparkles, Upload, Download, Trash2,
  Eye, Video, Phone, Mail, Globe, Award, Edit3, Camera, Check, Plus, Star,
  SlidersHorizontal, Paperclip, Lock, RefreshCw, ExternalLink, Filter, ArrowRight,
  ArrowLeft, CheckCheck, KeyRound, Key, FolderCheck, AlertTriangle, ShieldCheck,
  RotateCcw

} from 'lucide-react';

export const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪', maxDigits: 9, placeholder: '50 123 4567' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', maxDigits: 9, placeholder: '50 123 4567' },
  { code: '+91', country: 'India', flag: '🇮🇳', maxDigits: 10, placeholder: '98765 43210' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', maxDigits: 8, placeholder: '5512 3456' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', maxDigits: 8, placeholder: '9123 4567' },
  { code: '+44', country: 'UK', flag: '🇬🇧', maxDigits: 10, placeholder: '7911 123456' },
  { code: '+1', country: 'US/Canada', flag: '🇨🇦', maxDigits: 10, placeholder: '202 555 0123' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', maxDigits: 11, placeholder: '151 12345678' }
];

export const PRESET_NATIONALITIES = [
  'Indian', 'Emirati (UAE)', 'Saudi', 'Qatari', 'Omani', 'Kuwaiti', 'Bahraini',
  'Pakistani', 'Filipino', 'Egyptian', 'British', 'American', 'Canadian',
  'Australian', 'Jordanian', 'Lebanese', 'South African', 'Bangladeshi',
  'Sri Lankan', 'Nepali', 'German', 'French', 'Singaporean', 'Malaysian'
];

export const PRESET_CITIZENSHIPS = [
  'India', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait',
  'Bahrain', 'Pakistan', 'Philippines', 'Egypt', 'United Kingdom', 'United States',
  'Canada', 'Australia', 'Singapore', 'South Africa', 'Bangladesh', 'Sri Lanka',
  'Nepal', 'Germany', 'France', 'Malaysia'
];

export const DEFAULT_DOC_TYPES = [
  {
    type: 'Passport / National ID',
    desc: 'Valid international passport biodata page (min 6 months validity) for visa sponsorship & flight booking.',
    defaultFileName: 'Passport_Copy_Attested.pdf',
    category: 'identity'
  },
  {
    type: 'Educational Degree / Diploma',
    desc: 'Highest university degree certificate with Ministry of Foreign Affairs (MOFA) attestation.',
    defaultFileName: 'Bachelors_Degree_MOFA_Attested.pdf',
    category: 'education'
  },
  {
    type: 'Experience Certificates',
    desc: 'Service letters, employment contracts, and experience certificates from previous employers.',
    defaultFileName: 'Experience_Letters_Combined.pdf',
    category: 'experience'
  },
  {
    type: 'Professional Certifications',
    desc: 'Professional licenses, PMP, AWS, ACCA, Cisco, or medical board certifications.',
    defaultFileName: 'Professional_Licences_2026.pdf',
    category: 'certification'
  },
  {
    type: 'Police Clearance Certificate (PCC)',
    desc: 'Good conduct & criminal clearance record required for Gulf residency visa clearance.',
    defaultFileName: 'Police_Clearance_Certificate.pdf',
    category: 'compliance'
  }
];

export const CandidateAvatar = ({ name, avatar, size = 'md', className = '', onClick, title }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (name || 'Candidate').trim().charAt(0).toUpperCase() || 'C';
  const hasValidPhoto = Boolean(avatar && !avatar.includes('dicebear') && !imgFailed);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-11 h-11 text-base rounded-xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl rounded-2xl'
  }[size] || 'w-11 h-11 text-base rounded-xl';

  if (hasValidPhoto) {
    return (
      <img
        src={avatar}
        alt={`${name || 'Candidate'}'s Photo`}
        onError={() => setImgFailed(true)}
        onClick={onClick}
        className={`${sizeClasses} object-cover border-2 border-amber-500/80 dark:border-gold-500/80 shadow-xs shrink-0 ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
        title={title}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${sizeClasses} bg-gradient-to-br from-amber-400 via-amber-500 to-gold-600 text-slate-950 font-serif font-black flex items-center justify-center border-2 border-amber-500 dark:border-gold-500/90 shadow-xs shrink-0 select-none ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      title={title}
    >
      <span>{initial}</span>
    </div>
  );
};

export const CandidatePortal = () => {
  const { user, updateUserProfile, applications, savedJobs, toggleSaveJob, applyForJob, postedJobs, deleteApplication, withdrawApplication, setActiveModal, navigateTo, logout, darkMode, toggleDarkMode } = useApp();

  // Navigation tab state: 'dashboard' | 'profile' | 'resume' | 'saved-jobs' | 'applications' | 'application-status' | 'interviews' | 'documents' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Profile 85% Completed',
      message: 'Add your attested degree certificate to reach 100% verified status for tier-1 GCC employers.',
      time: '2 hours ago',
      isRead: false,
      type: 'profile'
    },
    {
      id: 'notif-2',
      title: 'Application Under Review',
      message: 'Your CV has been matched and shortlisted for Senior Project Engineer in Dubai.',
      time: '1 day ago',
      isRead: false,
      type: 'application'
    },
    {
      id: 'notif-3',
      title: 'Interview Scheduled',
      message: 'Technical panel interview scheduled with Al Habtoor Contracting for Thursday 11:00 AM GST.',
      time: '2 days ago',
      isRead: true,
      type: 'interview'
    }
  ]);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(DEFAULT_DOC_TYPES[0].type);
  const [docFileToUpload, setDocFileToUpload] = useState(null);
  const [docUploadSuccessMsg, setDocUploadSuccessMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Applications Filter & Search
  const [appFilterStatus, setAppFilterStatus] = useState('All');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [screeningModalApp, setScreeningModalApp] = useState(null);

  // Application Status selection
  const [selectedStatusAppId, setSelectedStatusAppId] = useState(null);

  // Apply Modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applyCvChoice, setApplyCvChoice] = useState('profile');
  const [applyCustomCv, setApplyCustomCv] = useState({ name: '', size: '', url: '' });
  const [applyCoverNote, setApplyCoverNote] = useState('');
  const [applyNoticePeriod, setApplyNoticePeriod] = useState('Immediate (Ready to Join)');
  const [applyExpectedSalary, setApplyExpectedSalary] = useState('');
  const [applyIsSubmitting, setApplyIsSubmitting] = useState(false);
  const [applyModalError, setApplyModalError] = useState('');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const applyFileInputRef = useRef(null);

  // Video Interview Modal state
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  // Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [emailPrefs, setEmailPrefs] = useState({
    jobAlerts: true,
    statusAlerts: true,
    interviewReminders: true,
    newsletter: false
  });
  const [prefsSavedMsg, setPrefsSavedMsg] = useState('');

  const [privacySettings, setPrivacySettings] = useState({
    publicToHeadhunters: true,
    twoFactorAuth: false
  });

  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Resume drag-drop state
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [resumeActionMsg, setResumeActionMsg] = useState('');
  const resumeInputRef = useRef(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    nationality: user?.nationality || 'Indian',
    citizenship: user?.citizenship || 'India',
    title: user?.title || user?.currentRole || 'Executive Candidate',
    currentEmployer: user?.currentEmployer || '',
    location: user?.location || 'Dubai, UAE',
    preferredCountry: user?.preferredCountry || 'UAE',
    experience: user?.experience || '5-8 Years',
    qualification: user?.qualification || user?.education || "Bachelor's Degree",
    currentSalary: user?.currentSalary || 'AED 15,000 / Month',
    expectedSalary: user?.expectedSalary || 'AED 20,000 / Month',
    noticePeriod: user?.noticePeriod || '30 Days',
    avatar: (user?.avatar && !user.avatar.includes('dicebear')) ? user.avatar : '',
    resumeName: user?.resumeName || (typeof window !== 'undefined' ? localStorage.getItem('sir_active_resume_name') : null) || 'Executive_Candidate_CV.pdf',
    resumeUrl: user?.resumeUrl || (typeof window !== 'undefined' ? localStorage.getItem('sir_active_resume') : null) || '',
    resumeSize: user?.resumeSize || '161 KB',
    mohreAttested: user?.mohreAttested || false,
    skillsInput: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || 'Project Management, Construction, Procurement, Budgeting, AutoCAD')
  });

  const [skillPillList, setSkillPillList] = useState(() => {
    if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) return user.skills;
    return ['Project Management', 'Commercial PMO', 'Budget Control', 'Civil Construction', 'GCC Procurement'];
  });
  const [newSkillText, setNewSkillText] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileFormError, setProfileFormError] = useState('');
  const profileAvatarInputRef = useRef(null);
  const sidebarAvatarInputRef = useRef(null);

  // Load backend documents on mount
  useEffect(() => {
    if (user) {
      const cid = user.candidateId || user.email || 'REV-CAN';
      fetch(`/api/candidate/documents?candidateId=${encodeURIComponent(cid)}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data) && d.data.length > 0) {
            setDocuments(d.data);
          } else {
            // Seed initial verified documents structure
            setDocuments(DEFAULT_DOC_TYPES.map((dt, idx) => ({
              id: `RI-DOC-INIT-${idx + 1}`,
              documentType: dt.type,
              fileName: dt.defaultFileName,
              fileUrl: '',
              uploadDate: '2026-11-12 10:30:00',
              verificationStatus: idx < 3 ? 'Verified' : 'Under Review'
            })));
          }
        })
        .catch(() => {
          setDocuments(DEFAULT_DOC_TYPES.map((dt, idx) => ({
            id: `RI-DOC-INIT-${idx + 1}`,
            documentType: dt.type,
            fileName: dt.defaultFileName,
            fileUrl: '',
            uploadDate: '2026-11-12 10:30:00',
            verificationStatus: idx < 3 ? 'Verified' : 'Under Review'
          })));
        });

      // Load backend notifications
      fetch(`/api/candidate/notifications?candidateId=${encodeURIComponent(cid)}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data) && d.data.length > 0) {
            setNotifications(d.data);
          }
        })
        .catch(() => {});

      // Load backend candidate profile to sync custom uploaded CV and latest details
      fetch(`/api/candidate/profile?candidateId=${encodeURIComponent(cid)}&email=${encodeURIComponent(user.email || '')}`)
        .then(r => r.json())
        .then(p => {
          if (p.success && p.data) {
            const prof = p.data;
            if (prof.resumeUrl && prof.resumeUrl.length > 100) {
              setProfileForm(prev => ({
                ...prev,
                resumeName: prof.resumeName || prev.resumeName,
                resumeUrl: prof.resumeUrl,
                resumeSize: prof.resumeSize || prev.resumeSize
              }));
              try {
                sessionStorage.setItem('sir_active_resume', prof.resumeUrl);
                if (prof.resumeName) {
                  sessionStorage.setItem('sir_active_resume_name', prof.resumeName);
                  localStorage.setItem('sir_active_resume_name', prof.resumeName);
                }
                if (user.email) sessionStorage.setItem(`sir_resume_${user.email.toLowerCase().trim()}`, prof.resumeUrl);
              } catch {}
            }
          }
        })
        .catch(() => {});
    }
  }, [user?.candidateId, user?.email]);

  // Sync profileForm if user changes
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        title: user.title || user.currentRole || prev.title,
        currentEmployer: user.currentEmployer || prev.currentEmployer,
        location: user.location || prev.location,
        preferredCountry: user.preferredCountry || prev.preferredCountry,
        experience: user.experience || prev.experience,
        qualification: user.qualification || user.education || prev.qualification,
        currentSalary: user.currentSalary || prev.currentSalary,
        expectedSalary: user.expectedSalary || prev.expectedSalary,
        noticePeriod: user.noticePeriod || prev.noticePeriod,
        avatar: (user.avatar && !user.avatar.includes('dicebear')) ? user.avatar : prev.avatar,
        resumeName: user.resumeName || prev.resumeName || (typeof window !== 'undefined' ? localStorage.getItem('sir_active_resume_name') : null) || 'Executive_Candidate_CV.pdf',
        resumeUrl: user.resumeUrl || prev.resumeUrl || (typeof window !== 'undefined' ? localStorage.getItem('sir_active_resume') : null) || '',
        resumeSize: user.resumeSize || prev.resumeSize || '161 KB',
        skillsInput: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || prev.skillsInput)
      }));
      if (user.skills && Array.isArray(user.skills)) {
        setSkillPillList(user.skills);
      }
    }
  }, [user]);

  // Combined jobs list
  const allJobs = [...(postedJobs || []), ...(JOBS_LIST || [])];

  const formatAppDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
      const dt = new Date(dateVal);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
    return String(dateVal);
  };

  // Candidate applications: Real applications from context/backend database.
  // Sample demo applications are exclusively reserved for the unauthenticated/demo walkthrough account.
  const isDemoAccount = user?.email === 'candidate@revivalinternational.com';
  const candidateApplications = (applications && applications.length > 0)
    ? applications
    : (isDemoAccount ? [
        {
          id: 'APP-1029',
          jobId: 'job-101',
          jobTitle: 'Senior Civil Project Director',
          company: 'Al Habtoor Contracting LLC',
          location: 'Dubai, UAE',
          appliedDate: '2026-11-12',
          status: 'Shortlisted',
          stage: 'Shortlisted',
          resumeName: user?.resumeName || 'Executive_Candidate_CV.pdf',
          interviewDetails: {
            date: '2026-11-20',
            time: '11:00 AM GST',
            platform: 'Microsoft Teams Video Call',
            interviewer: 'Eng. Tariq Al-Hashimi (VP Projects)',
            meetingLink: 'https://teams.microsoft.com/l/meetup-join/revival-interview-101'
          }
        },
        {
          id: 'APP-1030',
          jobId: 'job-102',
          jobTitle: 'Mechanical Engineering Lead',
          company: 'Arabian MEP Contracting',
          location: 'Doha, Qatar',
          appliedDate: '2026-11-14',
          status: 'Under Review',
          stage: 'Under Review',
          resumeName: user?.resumeName || 'Executive_Candidate_CV.pdf',
          interviewDetails: null
        },
        {
          id: 'APP-1031',
          jobId: 'job-105',
          jobTitle: 'Hospitality Operations Manager',
          company: 'Jumeirah Luxury Resorts',
          location: 'Dubai, UAE',
          appliedDate: '2026-11-05',
          status: 'Interview Scheduled',
          stage: 'Interview',
          resumeName: user?.resumeName || 'Executive_Candidate_CV.pdf',
          interviewDetails: {
            date: '2026-11-24',
            time: '02:30 PM GST',
            platform: 'Google Meet Executive Panel',
            interviewer: 'Sarah Jenkins (Regional Talent Director)',
            meetingLink: 'https://meet.google.com/rev-jumeirah-exec'
          }
        }
      ] : []);

  // Selected application for Application Status tab
  const activeStatusApp = candidateApplications.find(a => a.id === selectedStatusAppId) || candidateApplications[0] || null;

  // Filtered applications
  const filteredApplications = candidateApplications.filter(app => {
    const matchesFilter = appFilterStatus === 'All' || app.status.toLowerCase() === appFilterStatus.toLowerCase();
    const matchesSearch = !appSearchQuery ||
      app.jobTitle.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(appSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate profile completion score
  const calculateProfileScore = () => {
    let score = 20; // baseline registration
    if (profileForm.name && profileForm.name.trim().length >= 2) score += 10;
    if (profileForm.phone && profileForm.phone.trim().length >= 7) score += 10;
    if (profileForm.avatar) score += 10;
    if (profileForm.title && profileForm.title.trim() !== '') score += 10;
    if (profileForm.location && profileForm.location.trim() !== '') score += 10;
    if (profileForm.qualification && profileForm.qualification.trim() !== '') score += 10;
    if (skillPillList && skillPillList.length >= 3) score += 10;
    if (profileForm.resumeName) score += 10;
    if (documents.some(d => d.verificationStatus === 'Verified')) score += 10;
    return Math.min(100, score);
  };
  const profileCompletionScore = calculateProfileScore();

  // Profile save handler
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setProfileFormError('');

    if (!profileForm.name || profileForm.name.trim().length < 2) {
      setProfileFormError('Please enter your full legal name.');
      return;
    }

    try {
      const updatedData = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        title: profileForm.title.trim(),
        currentEmployer: profileForm.currentEmployer.trim(),
        location: profileForm.location.trim(),
        preferredCountry: profileForm.preferredCountry.trim(),
        experience: profileForm.experience.trim(),
        qualification: profileForm.qualification.trim(),
        currentSalary: profileForm.currentSalary.trim(),
        expectedSalary: profileForm.expectedSalary.trim(),
        noticePeriod: profileForm.noticePeriod.trim(),
        avatar: profileForm.avatar,
        resumeName: profileForm.resumeName,
        resumeUrl: profileForm.resumeUrl,
        resumeSize: profileForm.resumeSize,
        skills: skillPillList
      };

      await updateUserProfile(updatedData);

      // Also persist to backend API
      await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.candidateId || 'REV-CAN',
          email: user?.email,
          ...updatedData
        })
      }).catch(() => {});

      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      setProfileFormError('Failed to save profile changes. Please try again.');
    }
  };

  // Add skill pill
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const clean = newSkillText.trim();
    if (clean && !skillPillList.includes(clean)) {
      setSkillPillList([...skillPillList, clean]);
      setNewSkillText('');
    }
  };

  // Remove skill pill
  const handleRemoveSkill = (skillToRemove) => {
    setSkillPillList(skillPillList.filter(s => s !== skillToRemove));
  };

  // Avatar upload with immediate profile synchronization
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
      updateUserProfile({ avatar: dataUrl });
      fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.candidateId || user?.email || 'REV-CAN',
          email: user?.email,
          avatar: dataUrl
        })
      }).catch(() => {});
    };
    reader.readAsDataURL(file);
  };

  // Reset custom photo to first letter of name
  const handleRemoveAvatar = () => {
    setProfileForm(prev => ({ ...prev, avatar: '' }));
    updateUserProfile({ avatar: '' });
    fetch('/api/candidate/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: user?.candidateId || user?.email || 'REV-CAN',
        email: user?.email,
        avatar: ''
      })
    }).catch(() => {});
  };

  // Resume file upload with full Base64 persistence to backend
  const handleResumeUpload = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setResumeActionMsg('File size exceeds 10MB limit. Please upload a smaller document.');
      return;
    }
    const validExts = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      setResumeActionMsg('Invalid format. Please attach a PDF, DOC, or DOCX document.');
      return;
    }

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setProfileForm(prev => ({
        ...prev,
        resumeName: file.name,
        resumeSize: formattedSize,
        resumeUrl: dataUrl
      }));

      updateUserProfile({
        resumeName: file.name,
        resumeSize: formattedSize,
        resumeUrl: dataUrl,
        resumeUploaded: true
      });

      // Cache in client storage so preview and download work immediately across all tabs
      try {
        sessionStorage.setItem('sir_active_resume', dataUrl);
        sessionStorage.setItem('sir_active_resume_name', file.name);
        localStorage.setItem('sir_active_resume_name', file.name);
        if (user?.email) {
          sessionStorage.setItem(`sir_resume_${user.email.toLowerCase().trim()}`, dataUrl);
        }
      } catch (storeErr) {
        console.warn('Session resume cache warning:', storeErr);
      }

      // Synchronize directly to backend database so CRM receives the actual uploaded CV
      try {
        await fetch('/api/candidate/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: user?.candidateId || user?.email || 'REV-CAN',
            email: user?.email,
            resumeName: file.name,
            resumeSize: formattedSize,
            resumeUrl: dataUrl
          })
        });

        await fetch('/api/candidate/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: user?.candidateId || user?.email || 'REV-CAN',
            email: user?.email,
            documentType: 'Resume / CV',
            fileName: file.name,
            fileUrl: dataUrl
          })
        }).catch(() => {});

        // Direct CRM candidate update
        await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user?.candidateId || user?.id,
            email: user?.email,
            name: profileForm.name || user?.name,
            phone: profileForm.phone || user?.phone,
            resumeName: file.name,
            resumeUrl: dataUrl,
            resumeSize: formattedSize
          })
        }).catch(() => {});

        // Broadcast event so CRM candidates tab updates immediately
        window.dispatchEvent(new CustomEvent('candidate-profile-updated', {
          detail: {
            email: user?.email,
            resumeName: file.name,
            resumeUrl: dataUrl,
            resumeSize: formattedSize
          }
        }));
      } catch (err) {
        console.warn('Backend resume sync warning:', err);
      }

      setResumeActionMsg(`✓ CV "${file.name}" successfully uploaded and saved.`);
      setTimeout(() => setResumeActionMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Preview the candidate's active uploaded resume
  const handlePreviewActiveResume = async () => {
    let activeUrl = profileForm.resumeUrl ||
      user?.resumeUrl ||
      (typeof window !== 'undefined' ? (sessionStorage.getItem('sir_active_resume') || localStorage.getItem('sir_active_resume')) : null) ||
      (user?.email && typeof window !== 'undefined' ? (sessionStorage.getItem(`sir_resume_${user.email.toLowerCase().trim()}`) || localStorage.getItem(`sir_resume_${user.email.toLowerCase().trim()}`)) : null) ||
      (documents.find(d => d.documentType === 'Resume / CV' || (d.fileName && d.fileName.toLowerCase().endsWith('.pdf')))?.fileUrl);

    let activeName = profileForm.resumeName || 
      user?.resumeName || 
      (typeof window !== 'undefined' ? (sessionStorage.getItem('sir_active_resume_name') || localStorage.getItem('sir_active_resume_name')) : null) || 
      'Candidate_Resume.pdf';

    // If still missing, attempt fetching from backend profile directly
    if (!activeUrl || activeUrl.length < 100) {
      try {
        const cid = user?.candidateId || user?.email || 'REV-CAN';
        const res = await fetch(`/api/candidate/profile?candidateId=${encodeURIComponent(cid)}&email=${encodeURIComponent(user?.email || '')}`);
        const data = await res.json();
        if (data?.success && data?.data?.resumeUrl) {
          activeUrl = data.data.resumeUrl;
          activeName = data.data.resumeName || activeName;
          setProfileForm(prev => ({ ...prev, resumeUrl: activeUrl, resumeName: activeName }));
        }
      } catch {}
    }

    openCandidateResumeInNewTab({
      ...profileForm,
      id: user?.candidateId || user?.id || 'RI-CAND',
      name: profileForm.name || user?.name || 'Candidate',
      email: profileForm.email || user?.email,
      phone: profileForm.phone || user?.phone,
      resumeUrl: activeUrl,
      resumeName: activeName
    });
  };

  // Download the candidate's active uploaded resume
  const handleDownloadActiveResume = async () => {
    let activeUrl = profileForm.resumeUrl ||
      user?.resumeUrl ||
      (typeof window !== 'undefined' ? (sessionStorage.getItem('sir_active_resume') || localStorage.getItem('sir_active_resume')) : null) ||
      (user?.email && typeof window !== 'undefined' ? (sessionStorage.getItem(`sir_resume_${user.email.toLowerCase().trim()}`) || localStorage.getItem(`sir_resume_${user.email.toLowerCase().trim()}`)) : null) ||
      (documents.find(d => d.documentType === 'Resume / CV' || (d.fileName && d.fileName.toLowerCase().endsWith('.pdf')))?.fileUrl);

    let activeName = profileForm.resumeName || 
      user?.resumeName || 
      (typeof window !== 'undefined' ? (sessionStorage.getItem('sir_active_resume_name') || localStorage.getItem('sir_active_resume_name')) : null) || 
      `${(profileForm.name || user?.name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf`;

    if (!activeUrl || activeUrl.length < 100) {
      try {
        const cid = user?.candidateId || user?.email || 'REV-CAN';
        const res = await fetch(`/api/candidate/profile?candidateId=${encodeURIComponent(cid)}&email=${encodeURIComponent(user?.email || '')}`);
        const data = await res.json();
        if (data?.success && data?.data?.resumeUrl) {
          activeUrl = data.data.resumeUrl;
          activeName = data.data.resumeName || activeName;
          setProfileForm(prev => ({ ...prev, resumeUrl: activeUrl, resumeName: activeName }));
        }
      } catch {}
    }

    downloadCandidateResumePdf({
      ...profileForm,
      id: user?.candidateId || user?.id || 'RI-CAND',
      name: profileForm.name || user?.name || 'Candidate',
      email: profileForm.email || user?.email,
      phone: profileForm.phone || user?.phone,
      resumeUrl: activeUrl,
      resumeName: activeName
    });
  };

  // Document upload handler
  const handleUploadDocument = async () => {
    if (!docFileToUpload) {
      alert('Please select a document file to upload.');
      return;
    }
    const cid = user?.candidateId || user?.email || 'REV-CAN';
    const newDocId = `RI-DOC-${Date.now().toString(36).toUpperCase()}`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      const newDocObj = {
        id: newDocId,
        candidateId: cid,
        documentType: selectedDocType,
        fileName: docFileToUpload.name,
        fileUrl: dataUrl,
        uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        verificationStatus: 'Under Review'
      };

      try {
        await fetch('/api/candidate/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDocObj)
        });

        // If uploaded document is Resume / CV, sync to primary candidate profile
        if (selectedDocType === 'Resume / CV') {
          setProfileForm(prev => ({
            ...prev,
            resumeName: docFileToUpload.name,
            resumeUrl: dataUrl
          }));
          updateUserProfile({
            resumeName: docFileToUpload.name,
            resumeUrl: dataUrl,
            resumeUploaded: true
          });
          await fetch('/api/candidate/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId: cid,
              email: user?.email,
              resumeName: docFileToUpload.name,
              resumeUrl: dataUrl
            })
          }).catch(() => {});
        }

        setDocuments(prev => [newDocObj, ...prev.filter(d => d.documentType !== selectedDocType)]);
        setDocUploadSuccessMsg(`✓ "${selectedDocType}" uploaded successfully! Sent for consular verification.`);
        setUploadDocModalOpen(false);
        setDocFileToUpload(null);
        setTimeout(() => setDocUploadSuccessMsg(''), 4000);
      } catch (err) {
        alert('Failed to upload document. Please try again.');
      }
    };
    reader.readAsDataURL(docFileToUpload);
  };

  // Delete document handler
  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      await fetch(`/api/candidate/documents/${docId}`, { method: 'DELETE' });
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
    }
  };

  // Password update handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/candidate/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, newPassword })
      });
      const d = await res.json();
      if (d.success) {
        setPasswordMsg({ text: '✓ Password updated successfully! Please use it for your next login.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: d.message || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      setPasswordMsg({ text: 'Network error updating password. Please try again.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save email preferences
  const handleSaveEmailPrefs = () => {
    setPrefsSavedMsg('✓ Notification preferences saved successfully.');
    setTimeout(() => setPrefsSavedMsg(''), 3000);
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }
    setIsDeletingAccount(true);
    try {
      await fetch('/api/candidate/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, candidateId: user?.candidateId })
      });
      logout();
      navigateTo('home');
    } catch (err) {
      setDeleteError('Failed to delete account. Please contact support.');
      setIsDeletingAccount(false);
    }
  };

  // Quick Apply Handler
  const openApplyModal = (job) => {
    setApplyModalJob(job);
    setApplyCvChoice('profile');
    setApplyCustomCv({ name: '', size: '', url: '' });
    setApplyCoverNote('');
    setApplyExpectedSalary(job.salary || user?.expectedSalary || 'Market Standard');
    setApplyNoticePeriod('Immediate (Ready to Join)');
    setApplyModalError('');
  };

  const handleQuickSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyModalJob) return;

    setApplyIsSubmitting(true);
    setApplyModalError('');

    try {
      const cvToUse = applyCvChoice === 'profile'
        ? (profileForm.resumeName || user?.resumeName || 'Executive_Candidate_CV.pdf')
        : (applyCustomCv.name || 'Custom_Uploaded_CV.pdf');

      await applyForJob(applyModalJob, {
        coverNote: applyCoverNote,
        noticePeriod: applyNoticePeriod,
        expectedSalary: applyExpectedSalary,
        resumeName: cvToUse
      });

      setApplySuccessMsg(`✓ Application for "${applyModalJob.title}" at ${applyModalJob.company} submitted successfully!`);
      setApplyModalJob(null);
      setTimeout(() => setApplySuccessMsg(''), 5000);
    } catch (err) {
      setApplyModalError('Submission failed. Please try again.');
    } finally {
      setApplyIsSubmitting(false);
    }
  };

  // Video Camera Stream handlers
  const startCameraStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera preview notice:', err);
    }
  };

  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // If user is not authenticated, show unified auth screen
  if (!user) {
    return <UnifiedAuth defaultRole="candidate" />;
  }

  // Sidebar Items Definition (10 Navigation Items)
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'resume', label: 'CV / Resume', icon: FileText },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark, badge: savedJobs?.length || 0 },
    { id: 'applications', label: 'My Applications', icon: Send, badge: candidateApplications.length },
    { id: 'application-status', label: 'Application Status', icon: Clock },
    { id: 'interviews', label: 'Interview Schedule', icon: Calendar, badge: candidateApplications.filter(a => a.status === 'Interview Scheduled').length },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#070c1e] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-gold-500 selection:text-navy-950 transition-colors duration-200">
      <SEO
        title="Candidate Portal | The Revival International"
        description="Candidate dashboard for tracking overseas job applications, managing interviews, updating CV credentials, and monitoring GCC visa milestones."
        canonicalPath="candidates"
      />

      {/* 1. TOP HEADER (Dark navy-blue with Revival International Logo) */}
      <header className="h-16 shrink-0 z-40 bg-white dark:bg-[#071526] border-b-2 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-white shadow-xs transition-colors duration-200">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-navy-900 border border-slate-300 dark:border-navy-800 transition cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5 text-gold-400" /> : <Menu className="w-5 h-5 text-gold-400" />}
            </button>

            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
              title="Return to The Revival International Home"
            >
              <BrandLogoIcon className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-105 transition duration-300 shadow-md" />
              <div>
                <div className="font-serif text-base sm:text-xl font-black text-slate-950 dark:text-white flex items-center gap-1.5 tracking-tight">
                  <span>The Revival</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-sans font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-gold-500/20 dark:text-gold-400 dark:border-gold-500/30">
                    International
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
                  Candidate Portal • India • GCC • Worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Vacancies, Notifications & Profile Dropdown */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Browse Jobs Shortcut */}
            <button
              onClick={() => navigateTo('jobs')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-200 dark:hover:text-white dark:bg-navy-900 dark:hover:bg-navy-800 dark:border-navy-700/80 transition shadow-xs cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-gold-400" />
              <span>Browse Vacancies</span>
            </button>

            
            {/* Theme Mode Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-navy-900 dark:hover:bg-navy-800 dark:text-gold-400 border border-slate-300 dark:border-navy-800 transition shadow-xs flex items-center justify-center cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileDropdownOpen(false); }}
                className="relative p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 dark:text-slate-300 dark:hover:text-white dark:bg-navy-900 dark:border-navy-800 transition shadow-xs cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-gold-400" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 ring-2 ring-white dark:ring-[#071526] animate-pulse" />
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-2xl p-4 text-slate-900 dark:text-white z-50 animate-fade-in text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications ({notifications.filter(n => !n.isRead).length} Unread)</span>
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                      className="text-[11px] text-gold-500 hover:underline font-bold"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-navy-800/80 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`py-3 ${n.isRead ? 'opacity-70' : 'bg-gold-500/5 -mx-2 px-2 rounded-xl'}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-navy-950 dark:text-white">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotificationsOpen(false); }}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-navy-900/90 dark:hover:bg-navy-800 dark:border-navy-700/80 text-left transition shadow-xs cursor-pointer"
              >
                <CandidateAvatar
                  name={profileForm.name || user?.name}
                  avatar={profileForm.avatar}
                  size="sm"
                  title={`${profileForm.name || user?.name || 'Candidate'}'s Profile`}
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1 leading-tight">
                    <span className="max-w-[120px] truncate">{user.name || 'Executive Candidate'}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold block leading-none mt-0.5">
                    {profileCompletionScore}% Completed
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-2xl p-2 text-slate-800 dark:text-white z-50 animate-fade-in text-left">
                  <div className="p-3 border-b border-slate-100 dark:border-navy-800">
                    <p className="text-xs font-bold text-navy-950 dark:text-white truncate">{user.name || 'Executive Candidate'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email || 'candidate@revival.international'}</p>
                  </div>
                  <div className="py-1 text-xs">
                    <button
                      onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5 text-gold-500" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('resume'); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg flex items-center gap-2 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-gold-500" />
                      <span>CV / Resume</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('applications'); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg flex items-center gap-2 transition"
                    >
                      <Send className="w-3.5 h-3.5 text-gold-500" />
                      <span>My Applications</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg flex items-center gap-2 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-gold-500" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-navy-800">
                    <button
                      onClick={() => { setShowSignOutModal(true); setProfileDropdownOpen(false); }}
                      className="w-full px-3 py-2 text-left text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition text-xs font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. BODY LAYOUT: FIXED LEFT SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">

        {/* Backdrop overlay for mobile drawer */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs z-30 lg:hidden animate-fade-in"
          />
        )}

        {/* LEFT SIDEBAR (Fixed in place, non-scrolling) */}
        <aside
          className={`fixed inset-y-0 left-0 lg:static z-30 lg:z-auto h-full max-h-full w-64 bg-white dark:bg-[#071526] border-r-2 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 overflow-hidden shadow-xs ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top: Mini Profile Card */}
          <div className="p-4 border-b-2 border-slate-200 dark:border-navy-800/80 shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 shadow-xs">
              <div className="relative group shrink-0">
                <CandidateAvatar
                  name={profileForm.name || user?.name}
                  avatar={profileForm.avatar}
                  size="md"
                  onClick={() => sidebarAvatarInputRef.current?.click()}
                  title="Click to upload/change photo"
                />
                <button
                  type="button"
                  onClick={() => sidebarAvatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1 bg-slate-900 text-amber-400 dark:bg-navy-950 dark:text-gold-400 rounded-lg shadow-sm border border-amber-500/50 dark:border-gold-500/50 hover:scale-110 transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
                <input
                  ref={sidebarAvatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <h3 className="font-bold text-slate-950 dark:text-white text-xs truncate">{user.name || 'Executive Candidate'}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex-1 bg-slate-200 dark:bg-navy-950 h-1.5 rounded-full overflow-hidden border border-slate-300 dark:border-navy-800">
                    <div className="bg-gradient-to-r from-gold-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${profileCompletionScore}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-amber-700 dark:text-gold-400 shrink-0">{profileCompletionScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: 9 Sidebar Navigation Items (Fixed, non-scrolling) */}
          <nav className="p-3 space-y-1 flex-1 text-left overflow-hidden">
            {sidebarItems.map(item => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-100 dark:bg-gold-500/20 text-slate-950 dark:text-gold-300 font-bold border-2 border-amber-400 dark:border-gold-500/40 shadow-xs rounded-xl'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-navy-900/80 font-medium rounded-xl border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-800 dark:text-gold-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-amber-200 text-amber-950 border border-amber-300 dark:bg-gold-500 dark:text-navy-950' : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-navy-900 dark:text-slate-300 dark:border-navy-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Pinned: Sign Out (No gap, cleanly pinned at bottom) */}
          <div className="p-3 border-t-2 border-slate-200 dark:border-navy-800/80 bg-white dark:bg-[#071526] shrink-0 text-left">
            <button
              type="button"
              onClick={() => { setShowSignOutModal(true); setMobileSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA: RIGHT SIDE ONLY CAN SCROLL */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overscroll-y-contain p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] dark:bg-[#070c1e]">

          {/* Global Alert Banners (if any) */}
          {applySuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{applySuccessMsg}</span>
            </div>
          )}
          {resumeActionMsg && (
            <div className="mb-6 p-4 bg-gold-500/10 border border-gold-500/30 rounded-2xl text-gold-600 dark:text-gold-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in text-left">
              <Sparkles className="w-5 h-5 shrink-0 text-gold-500" />
              <span>{resumeActionMsg}</span>
            </div>
          )}
          {docUploadSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in text-left">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{docUploadSuccessMsg}</span>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 1: DASHBOARD PAGE */}
          {/* ========================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 text-left">
              
              {/* Welcome Section */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
                    Welcome back, {user.name || 'Candidate'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    Track your active job applications, view upcoming interviews, and manage certified credentials for tier-1 GCC employer opportunities.
                  </p>
                </div>

                {/* Profile Completion Indicator & Update Action */}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shrink-0 w-full md:w-auto justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Profile Completion</span>
                    <span className="font-serif text-2xl font-black text-amber-600 dark:text-gold-500">{profileCompletionScore}%</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-navy-950 font-black text-xs rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              {/* Statistics Cards (5 Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                {/* 1. Applications */}
                <div
                  onClick={() => setActiveTab('applications')}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applications</span>
                    <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-slate-950 dark:text-white">{candidateApplications.length}</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                  </div>
                </div>

                {/* 2. Under Review */}
                <div
                  onClick={() => { setActiveTab('applications'); setAppFilterStatus('Under Review'); }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-amber-600 dark:text-amber-400">
                      {candidateApplications.filter(a => a.status === 'Under Review' || a.status === 'Applied').length}
                    </span>
                    <span className="text-[10px] text-slate-400">Screening</span>
                  </div>
                </div>

                {/* 3. Shortlisted */}
                <div
                  onClick={() => { setActiveTab('applications'); setAppFilterStatus('Shortlisted'); }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shortlisted</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-emerald-600 dark:text-emerald-400">
                      {candidateApplications.filter(a => a.status === 'Shortlisted').length}
                    </span>
                    <span className="text-[10px] text-slate-400">Committee</span>
                  </div>
                </div>

                {/* 4. Interviews */}
                <div
                  onClick={() => setActiveTab('interviews')}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
                    <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-navy-950 dark:text-white">
                      {candidateApplications.filter(a => a.status === 'Interview Scheduled').length}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold">Scheduled</span>
                  </div>
                </div>

                {/* 5. Saved Jobs */}
                <div
                  onClick={() => setActiveTab('saved-jobs')}
                  className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 shadow-sm hover:border-gold-500/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saved Jobs</span>
                    <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-navy-950 dark:text-white">{savedJobs?.length || 0}</span>
                    <span className="text-[10px] text-slate-400">Bookmarked</span>
                  </div>
                </div>

              </div>

              {/* 2-Column Section: Recent Applications & Upcoming Interviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Applications Card */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                    <h3 className="font-serif text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-gold-500" />
                      Recent Applications
                    </h3>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-bold text-gold-500 hover:underline flex items-center gap-1"
                    >
                      <span>View All ({candidateApplications.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {candidateApplications.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                      <Briefcase className="w-10 h-10 text-gold-500/50 mx-auto" />
                      <p className="text-xs text-slate-500">No applications submitted yet.</p>
                      <button
                        onClick={() => navigateTo('jobs')}
                        className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                      >
                        Explore Open Vacancies →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidateApplications.slice(0, 3).map(app => (
                        <div
                          key={app.id}
                          className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl flex items-center justify-between gap-3 hover:border-gold-500/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 font-bold flex items-center justify-center shrink-0 text-sm">
                              {app.company.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-navy-950 dark:text-white">{app.jobTitle}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{app.company} • {formatAppDate(app.appliedDate)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              app.status === 'Shortlisted' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                              app.status === 'Interview Scheduled' ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400' :
                              'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}>
                              {app.status}
                            </span>
                            <button
                              onClick={() => setScreeningModalApp(app)}
                              className="block text-[10px] font-bold text-gold-500 hover:underline mt-1 cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Interviews Card */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                    <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-500" />
                      Upcoming Interviews
                    </h3>
                    <button
                      onClick={() => setActiveTab('interviews')}
                      className="text-xs font-bold text-gold-500 hover:underline flex items-center gap-1"
                    >
                      <span>Schedule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {candidateApplications.filter(a => a.status === 'Interview Scheduled' || a.interviewDetails).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                      <Calendar className="w-10 h-10 text-gold-500/50 mx-auto" />
                      <p className="text-xs text-slate-500">No interviews currently scheduled.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        When employers shortlist your profile, video conference details will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidateApplications.filter(a => a.status === 'Interview Scheduled' || a.interviewDetails).map(app => (
                        <div
                          key={app.id}
                          className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-500 flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" />
                              {app.interviewDetails?.platform || 'Video Interview'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              {app.interviewDetails?.date || 'Thu, Nov 20, 2026'} • {app.interviewDetails?.time || '11:00 AM GST'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-navy-950 dark:text-white">{app.jobTitle}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{app.company} • Technical Panel</p>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setInterviewModalApp(app); startCameraStream(); }}
                              className="flex-1 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                            >
                              Join Video Call
                            </button>
                            <button
                              onClick={() => setScreeningModalApp(app)}
                              className="px-3 py-2 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: MY PROFILE PAGE */}
          {/* ========================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left">
              
              {/* Profile Header & Avatar Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative group shrink-0">
                    <CandidateAvatar
                      name={profileForm.name || user?.name}
                      avatar={profileForm.avatar}
                      size="lg"
                      onClick={() => profileAvatarInputRef.current?.click()}
                      title="Click to upload/change profile photo"
                    />
                    <button
                      type="button"
                      onClick={() => profileAvatarInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-amber-400 dark:bg-navy-950 dark:text-gold-400 rounded-xl shadow-lg border border-amber-500/50 dark:border-gold-500/40 hover:scale-105 transition cursor-pointer"
                      title="Upload photo from device"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={profileAvatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white">{profileForm.name || 'Candidate Name'}</h2>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-amber-700 dark:text-gold-400 font-bold mt-0.5">{profileForm.title || 'Professional Title'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{profileForm.location || 'Location Not Specified'}</span>
                      <span>•</span>
                      <span>{profileForm.experience || 'Experience Not Set'}</span>
                    </p>

                    {/* Photo Action Controls */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => profileAvatarInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{profileForm.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                      </button>

                      {profileForm.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                          title="Reset to default initial letter badge"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Use Initial Letter</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Defaults to the first letter of your name. Upload JPG, PNG or WEBP up to 5MB.
                    </p>
                  </div>
                </div>

                {/* Profile Completion Indicator */}
                <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 w-full md:w-auto text-left">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profile Readiness</span>
                    <span className="text-sm font-black text-amber-600 dark:text-gold-500">{profileCompletionScore}%</span>
                  </div>
                  <div className="w-full md:w-48 bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${profileCompletionScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {profileFormError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileFormError}</span>
                  </div>
                )}
                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>✓ Profile changes saved and synced across all employer applications!</span>
                  </div>
                )}

                {/* Section A: Personal Information */}
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white pb-2 border-b border-slate-100 dark:border-navy-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-500" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="e.g. Rahul Sharma"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address (Verified)</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Telephone Number *</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="+971 50 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nationality</label>
                      <select
                        value={profileForm.nationality}
                        onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                      >
                        {PRESET_NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Citizenship / Passport</label>
                      <select
                        value={profileForm.citizenship}
                        onChange={e => setProfileForm({ ...profileForm, citizenship: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                      >
                        {PRESET_CITIZENSHIPS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Residence Location</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="Dubai, UAE / Mumbai, India"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Professional Background */}
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white pb-2 border-b border-slate-100 dark:border-navy-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gold-500" />
                    Professional Background & Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Job Title / Designation</label>
                      <input
                        type="text"
                        value={profileForm.title}
                        onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="Senior Civil Project Director"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Employer / Organization</label>
                      <input
                        type="text"
                        value={profileForm.currentEmployer}
                        onChange={e => setProfileForm({ ...profileForm, currentEmployer: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="Al Habtoor Contracting LLC"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Years of Total Experience</label>
                      <input
                        type="text"
                        value={profileForm.experience}
                        onChange={e => setProfileForm({ ...profileForm, experience: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="8+ Years (GCC Experience)"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Highest Educational Degree</label>
                      <input
                        type="text"
                        value={profileForm.qualification}
                        onChange={e => setProfileForm({ ...profileForm, qualification: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="B.Sc. Civil Engineering / MBA"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expected Monthly Compensation</label>
                      <input
                        type="text"
                        value={profileForm.expectedSalary}
                        onChange={e => setProfileForm({ ...profileForm, expectedSalary: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="AED 25,000 / Month (Tax-Free)"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notice Period / Availability</label>
                      <input
                        type="text"
                        value={profileForm.noticePeriod}
                        onChange={e => setProfileForm({ ...profileForm, noticePeriod: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                        placeholder="Immediate / 30 Days"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Skills Manager */}
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white pb-2 border-b border-slate-100 dark:border-navy-800 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold-500" />
                    Key Technical & Managerial Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillPillList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={newSkillText}
                      onChange={e => setNewSkillText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(e); }}
                      placeholder="Add a skill (e.g. Primavera P6, AutoCAD, BIM)..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: CV / RESUME MANAGEMENT PAGE */}
          {/* ========================================================== */}
          {activeTab === 'resume' && (
            <div className="space-y-6 text-left">
              
              {/* Header Info */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-500" />
                      CV / Resume Management
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Manage your primary executive resume dispatched to international hiring managers across Dubai, Riyadh & Doha.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal('ai-resume')}
                    className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Scan with Revival AI</span>
                  </button>
                </div>
              </div>

              {/* Primary Active Resume Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Resume File</span>
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Primary Active CV
                  </span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-navy-950 dark:text-white">{profileForm.resumeName || 'Executive_Candidate_CV.pdf'}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PDF Document • {profileForm.resumeSize || '2.4 MB'} • Verified for GCC ATS Screening
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviewActiveResume}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition flex items-center gap-1 cursor-pointer"
                      title="Preview candidate uploaded CV in new tab"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadActiveResume}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition flex items-center gap-1 cursor-pointer"
                      title="Download candidate uploaded CV file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-navy-950 dark:bg-white text-white dark:text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload New Resume Drag & Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDraggingResume(true); }}
                onDragLeave={() => setIsDraggingResume(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                  if (e.dataTransfer.files?.[0]) handleResumeUpload(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition ${
                  isDraggingResume
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900'
                }`}
              >
                <Upload className="w-12 h-12 text-gold-500 mx-auto mb-3" />
                <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white">
                  Drag and drop your updated CV here
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Accepts PDF, DOC, or DOCX formats (max file size 10MB). Automatically parsed for MOHRE compliance.
                </p>
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                >
                  Browse Document from Device
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => { if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]); }}
                  className="hidden"
                />
              </div>

              {/* ATS Resume Compliance Insights */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                  <h3 className="font-serif text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ATS Compliance Verification
                  </h3>
                  <span className="text-xs font-black text-emerald-500">92% Match Score</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Taleo & Workday Parsing Compatible</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Clean Typography & Contact Headers</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>GCC High-Demand Technical Keywords</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: SAVED JOBS PAGE */}
          {/* ========================================================== */}
          {activeTab === 'saved-jobs' && (
            <div className="space-y-6 text-left">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-gold-500" />
                  Saved Jobs & Bookmarks ({savedJobs?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Keep track of bookmarked international openings and apply whenever you are ready.
                </p>
              </div>

              {(!savedJobs || savedJobs.length === 0) ? (
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-4">
                  <Bookmark className="w-12 h-12 text-gold-500/40 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">No Saved Jobs Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    While browsing verified international vacancies, click the bookmark icon to save roles for instant review.
                  </p>
                  <button
                    onClick={() => navigateTo('jobs')}
                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                  >
                    Browse Open Opportunities →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allJobs.filter(j => savedJobs.includes(j.id)).map(job => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:border-gold-500/40 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 uppercase">
                            {job.category || 'General'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded">
                            {job.jobType || 'Full-time'}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">{job.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          {job.company} • {job.location || job.country} • {job.salary || 'Tax-Free Package'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Experience: <strong>{job.experience || '3-5 Years'}</strong> • Vacancies: <strong>{job.vacancies || '1'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-navy-800">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openApplyModal(job)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 5: MY APPLICATIONS PAGE */}
          {/* ========================================================== */}
          {activeTab === 'applications' && (
            <div className="space-y-6 text-left">
              
              {/* Header Bar */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-gold-500" />
                      My Applications ({candidateApplications.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Real-time status updates and recruiter reviews for all submitted vacancies.
                    </p>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={appSearchQuery}
                      onChange={e => setAppSearchQuery(e.target.value)}
                      placeholder="Search application..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 pt-4 overflow-x-auto text-xs font-bold border-t border-slate-100 dark:border-navy-800 mt-4">
                  {['All', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Placed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setAppFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                        appFilterStatus === status
                          ? 'bg-gold-500 text-navy-950 font-extrabold shadow-sm'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Applications List */}
              {filteredApplications.length === 0 ? (
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-3">
                  <Briefcase className="w-12 h-12 text-gold-500/40 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">No Matching Applications</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing the filter or search query to view all your candidate applications.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map(app => (
                    <div
                      key={app.id}
                      className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:border-gold-500/40 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">ID: {app.id}</span>
                          <span className="text-[10px] text-slate-400">• Applied on {formatAppDate(app.appliedDate)}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">{app.jobTitle}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          {app.company} • {app.location || 'GCC'}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                          <Paperclip className="w-3.5 h-3.5 text-gold-500" />
                          <span>Attached CV: <strong>{app.resumeName || 'Primary CV'}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-navy-800 justify-between md:justify-end">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                          app.status === 'Shortlisted' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                          app.status === 'Interview Scheduled' ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30' :
                          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedStatusAppId(app.id); setActiveTab('application-status'); }}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-950 dark:text-white font-bold text-xs rounded-xl transition"
                          >
                            Timeline
                          </button>
                          <button
                            onClick={() => setScreeningModalApp(app)}
                            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Withdraw and delete your application for "${app.jobTitle}"? Once withdrawn, you will be able to apply to this vacancy again.`)) {
                                if (withdrawApplication) {
                                  await withdrawApplication(app.id);
                                } else if (deleteApplication) {
                                  await deleteApplication(app.id);
                                }
                              }
                            }}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition border border-rose-200/60 dark:border-rose-900/40"
                            title="Withdraw application & allow re-applying"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 6: APPLICATION STATUS TIMELINE PAGE */}
          {/* ========================================================== */}
          {activeTab === 'application-status' && (
            <div className="space-y-6 text-left">
              
              {/* Header Bar */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-500" />
                  Application Progress Timeline
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track every milestone from initial submission through ATS screening, employer shortlisting, and final visa placement.
                </p>
              </div>

              {!activeStatusApp ? (
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-3">
                  <Clock className="w-12 h-12 text-gold-500/40 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">No Active Applications</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have not submitted any applications yet. Browse open vacancies and apply to track your progress timeline here.
                  </p>
                  <button
                    onClick={() => navigateTo('jobs')}
                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                  >
                    Explore Open Vacancies →
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Application Selector */}
                  {candidateApplications.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {candidateApplications.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedStatusAppId(app.id)}
                      className={`px-4 py-2.5 rounded-2xl border transition font-bold whitespace-nowrap cursor-pointer ${
                        activeStatusApp?.id === app.id
                          ? 'border-gold-500 bg-gold-500/15 text-gold-600 dark:text-gold-400'
                          : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {app.jobTitle} ({app.company})
                    </button>
                  ))}
                </div>
              )}

              {/* Timeline Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Job Summary Banner */}
                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Application Reference: {activeStatusApp.id}</span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white mt-0.5">{activeStatusApp.jobTitle}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{activeStatusApp.company} • Applied on {formatAppDate(activeStatusApp.appliedDate)}</p>
                  </div>
                  <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/40 text-xs font-bold px-3 py-1 rounded-full">
                    Current Stage: {activeStatusApp.status}
                  </span>
                </div>

                {/* 5-Step Visual Pipeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Milestone Progress Pipeline</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {[
                      { step: 1, label: '1. Submitted', desc: 'Application Received' },
                      { step: 2, label: '2. Under Review', desc: 'ATS Screening' },
                      { step: 3, label: '3. Shortlisted', desc: 'Employer Committee' },
                      { step: 4, label: '4. Interview', desc: 'Technical Round' },
                      { step: 5, label: '5. Final Decision', desc: 'Offer & Visa' }
                    ].map(st => {
                      const isComplete = (activeStatusApp.status === 'Shortlisted' && st.step <= 3) ||
                                         (activeStatusApp.status === 'Interview Scheduled' && st.step <= 4) ||
                                         (activeStatusApp.status === 'Placed' && st.step <= 5) ||
                                         st.step === 1;
                      const isCurrent = (activeStatusApp.status === 'Under Review' && st.step === 2) ||
                                        (activeStatusApp.status === 'Shortlisted' && st.step === 3) ||
                                        (activeStatusApp.status === 'Interview Scheduled' && st.step === 4);

                      return (
                        <div
                          key={st.step}
                          className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition ${
                            isCurrent
                              ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow'
                              : isComplete
                              ? 'border-emerald-500/40 bg-emerald-500/10'
                              : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-navy-950 dark:text-white">{st.label}</h5>
                          <p className="text-[10px] text-slate-500">{st.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status History Timeline Log */}
                <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Audit Log</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-navy-950 dark:text-white">Profile Dispatched to Recruitment Advisor</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">CV attached and routed directly to GCC hiring director for initial compliance review.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-navy-950 dark:text-white">ATS Semantic Match & Degree Attestation Check</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Scored 92% match against job specs. MOFA educational equivalency validated.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 7: INTERVIEW SCHEDULE PAGE */}
          {/* ========================================================== */}
          {activeTab === 'interviews' && (
            <div className="space-y-6 text-left">
              
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  Interview Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Confirmed technical and HR interview rounds with employer panellists.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {candidateApplications.filter(a => a.interviewDetails || a.status === 'Interview Scheduled').length === 0 ? (
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-12 text-center space-y-3 col-span-full">
                    <Calendar className="w-12 h-12 text-gold-500/40 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">No Interviews Scheduled Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When hiring managers review your application and confirm an interview session, calendar details and video links will be listed here.
                    </p>
                  </div>
                ) : candidateApplications.filter(a => a.interviewDetails || a.status === 'Interview Scheduled').map(app => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Interview Confirmed
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">Time Zone: GST (UTC+4)</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">{app.jobTitle}</h3>
                      <p className="text-xs text-gold-500 font-bold">{app.company} • {app.location || 'Dubai'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Panellist: <strong>{app.interviewDetails?.interviewer || 'Technical Committee & HR Director'}</strong>
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 pt-1">
                        📅 {app.interviewDetails?.date || 'Thursday, Nov 20, 2026'} • ⏰ {app.interviewDetails?.time || '11:00 AM GST'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <strong className="block text-navy-950 dark:text-white">Interview Format:</strong>
                      <p>{app.interviewDetails?.platform || 'Microsoft Teams Video Call (Executive Panel Room)'}</p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => { setInterviewModalApp(app); startCameraStream(); }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Video Room</span>
                      </button>
                      <button
                        onClick={() => setScreeningModalApp(app)}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preparation Guidelines Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  International Video Interview Preparation Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <strong className="block text-navy-950 dark:text-white mb-0.5">1. Stable Internet & Camera</strong>
                    <p className="text-[11px] text-slate-500">Test camera preview, microphone levels, and quiet lighting before entering room.</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <strong className="block text-navy-950 dark:text-white mb-0.5">2. Degree Attestation Ready</strong>
                    <p className="text-[11px] text-slate-500">Have attested diploma/degree scans readily accessible on your screen.</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
                    <strong className="block text-navy-950 dark:text-white mb-0.5">3. Notice Period Readiness</strong>
                    <p className="text-[11px] text-slate-500">Be ready to confirm flight availability and residency visa paperwork timelines.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 8: SECURE DOCUMENT UPLOAD PAGE */}
          {/* ========================================================== */}
          {activeTab === 'documents' && (
            <div className="space-y-6 text-left">
              
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gold-500" />
                      Secure Document Upload & Verification
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Private, encrypted document vault for MOHRE work permits, consular attestation, and residency sponsorship.
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadDocModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Document</span>
                  </button>
                </div>
              </div>

              {/* Documents Table / Cards */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-navy-800">
                  {DEFAULT_DOC_TYPES.map(docType => {
                    const uploadedDoc = documents.find(d => d.documentType === docType.type);
                    const isUploaded = !!uploadedDoc;
                    const status = uploadedDoc?.verificationStatus || 'Pending Upload';

                    return (
                      <div key={docType.type} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-navy-950/40 transition">
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            status === 'Verified' ? 'bg-emerald-500/15 text-emerald-500' :
                            isUploaded ? 'bg-amber-500/15 text-amber-500' :
                            'bg-slate-100 dark:bg-navy-800 text-slate-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-xs text-navy-950 dark:text-white">{docType.type}</h3>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                status === 'Verified' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                                isUploaded ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                                'bg-slate-200 dark:bg-navy-800 text-slate-500'
                              }`}>
                                {status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg">{docType.desc}</p>
                            {isUploaded && (
                              <p className="text-[10px] text-gold-500 font-mono mt-1">
                                File: <strong>{uploadedDoc.fileName}</strong> • Uploaded: {uploadedDoc.uploadDate}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          {isUploaded ? (
                            <>
                              <button
                                onClick={() => setPreviewDoc(uploadedDoc)}
                                className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => alert(`Downloading "${uploadedDoc.fileName}"...`)}
                                className="px-3 py-1.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => { setSelectedDocType(docType.type); setUploadDocModalOpen(true); }}
                                className="px-3 py-1.5 bg-navy-950 dark:bg-white text-white dark:text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition"
                              >
                                Replace
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(uploadedDoc.id)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                                title="Delete document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => { setSelectedDocType(docType.type); setUploadDocModalOpen(true); }}
                              className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload File</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 9: ACCOUNT SETTINGS PAGE */}
          {/* ========================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left max-w-4xl">
              
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold-500" />
                  Account Settings & Security
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your candidate account credentials, email alerts, privacy options, and security policies.
                </p>
              </div>

              {/* 1. Change Password Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-500" />
                  Change Password
                </h3>

                {passwordMsg.text && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Password (min 8 characters) *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* 2. Email Preferences Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-500" />
                  Email & Alert Notifications
                </h3>

                {prefsSavedMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{prefsSavedMsg}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950 rounded-xl cursor-pointer">
                    <div>
                      <strong className="block text-navy-950 dark:text-white">Job Matches & Vacancy Alerts</strong>
                      <span className="text-slate-500 text-[11px]">Receive emails when verified employers post matching jobs.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPrefs.jobAlerts}
                      onChange={e => setEmailPrefs({ ...emailPrefs, jobAlerts: e.target.checked })}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950 rounded-xl cursor-pointer">
                    <div>
                      <strong className="block text-navy-950 dark:text-white">Application Status Updates</strong>
                      <span className="text-slate-500 text-[11px]">Instant notifications on shortlists, screening, and interview invites.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPrefs.statusAlerts}
                      onChange={e => setEmailPrefs({ ...emailPrefs, statusAlerts: e.target.checked })}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950 rounded-xl cursor-pointer">
                    <div>
                      <strong className="block text-navy-950 dark:text-white">Interview Schedule Reminders</strong>
                      <span className="text-slate-500 text-[11px]">Calendar reminders 24h and 1h prior to video interview calls.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPrefs.interviewReminders}
                      onChange={e => setEmailPrefs({ ...emailPrefs, interviewReminders: e.target.checked })}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSaveEmailPrefs}
                  className="px-5 py-2.5 bg-navy-950 dark:bg-white text-white dark:text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  Save Alert Preferences
                </button>
              </div>

              {/* 3. Privacy & Security Card */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Privacy & Data Governance
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="block text-navy-950 dark:text-white">Direct Recruiter Visibility</strong>
                      <span className="text-slate-500 text-[11px]">Allow verified GCC employers to contact you directly.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.publicToHeadhunters}
                      onChange={e => setPrivacySettings({ ...privacySettings, publicToHeadhunters: e.target.checked })}
                      className="w-4 h-4 accent-gold-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl">
                    <strong className="block text-navy-950 dark:text-white">Data Protection Compliance:</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your profile and documents are protected under UAE PDPL (Federal Decree-Law No. 45/2021) and India DPDP Act 2023. Zero third-party marketing sharing.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Delete Account Danger Zone */}
              <div className="border border-rose-500/30 bg-rose-500/5 rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="font-serif text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Danger Zone: Delete Candidate Account
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Permanently erase your candidate profile, uploaded resumes, attested documents, and pending job applications from The Revival International portal. This action is irreversible.
                </p>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmText(''); setDeleteError(''); setDeleteAccountModalOpen(true); }}
                  className="px-4 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 transition cursor-pointer"
                >
                  Delete My Candidate Account
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================== */}
      {/* GLOBAL MODALS */}
      {/* ========================================================== */}

      {/* 1. DOCUMENT UPLOAD MODAL */}
      {uploadDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-navy-800 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">Upload Attested Document</h3>
              <button onClick={() => setUploadDocModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Document Category *</label>
                <select
                  value={selectedDocType}
                  onChange={e => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                >
                  {DEFAULT_DOC_TYPES.map(dt => <option key={dt.type} value={dt.type}>{dt.type}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Attach File (PDF, JPG, PNG up to 15MB) *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={e => setDocFileToUpload(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-500/15 file:text-gold-600 file:cursor-pointer"
                />
              </div>

              {docFileToUpload && (
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  ✓ Selected: {docFileToUpload.name} ({Math.round(docFileToUpload.size / 1024)} KB)
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setUploadDocModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={!docFileToUpload}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition disabled:opacity-50"
              >
                Upload & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-navy-800 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-navy-800">
              <div>
                <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">{previewDoc.documentType || previewDoc.type || 'Document'}</h3>
                <p className="text-xs text-slate-500">{previewDoc.fileName || previewDoc.name}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
              {previewDoc.fileUrl ? (
                <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-navy-800 bg-navy-950">
                  <iframe src={previewDoc.fileUrl} title={previewDoc.fileName || previewDoc.name} className="w-full h-full border-none" />
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <FileText className="w-16 h-16 text-gold-500 mx-auto" />
                  <h4 className="font-bold text-sm text-navy-950 dark:text-white">{previewDoc.fileName || previewDoc.name}</h4>
                  <p className="text-xs text-slate-500">MOHRE Consular Attestation Hash: 0x7E3F...992A</p>
                  <span className="inline-block bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                    Encrypted & Authenticated
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              {previewDoc.fileUrl ? (
                <button
                  type="button"
                  onClick={() => openCandidateResumeInNewTab({
                    name: user?.name,
                    email: user?.email,
                    resumeUrl: previewDoc.fileUrl,
                    resumeName: previewDoc.fileName || previewDoc.name
                  })}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Tab</span>
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2.5 bg-navy-950 dark:bg-white text-white dark:text-navy-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCREENING DETAILS MODAL */}
      {screeningModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-navy-800 shadow-2xl">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-navy-800">
              <div>
                <span className="text-[10px] font-mono text-gold-500 font-bold">APPLICATION ID: {screeningModalApp.id}</span>
                <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white mt-1">{screeningModalApp.jobTitle}</h3>
                <p className="text-xs text-slate-500">{screeningModalApp.company} • {screeningModalApp.location || 'GCC'}</p>
              </div>
              <button onClick={() => setScreeningModalApp(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-950 dark:text-white">Current Application Status:</span>
                  <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    {screeningModalApp.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your profile and ATS resume match (92%) have been transmitted directly to the hiring director at <strong>{screeningModalApp.company}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">Applied Date</span>
                  <span className="font-bold text-navy-950 dark:text-white">{screeningModalApp.appliedDate}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">Attached Resume</span>
                  <span className="font-bold text-navy-950 dark:text-white truncate block">{screeningModalApp.resumeName || 'Primary CV'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setScreeningModalApp(null)}
                className="px-6 py-2.5 bg-navy-950 dark:bg-white text-white dark:text-navy-950 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUICK APPLY MODAL */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-navy-800 shadow-2xl">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-navy-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-500">Quick Job Application</span>
                <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white mt-1">{applyModalJob.title}</h3>
                <p className="text-xs text-slate-500">{applyModalJob.company} • {applyModalJob.location || applyModalJob.country}</p>
              </div>
              <button onClick={() => setApplyModalJob(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyModalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyModalError}</span>
              </div>
            )}

            <form onSubmit={handleQuickSubmitApplication} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
                <label className="font-bold text-navy-950 dark:text-white block">Resume / CV Attachment *</label>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gold-500 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{profileForm.resumeName || 'Primary CV'}</span>
                    <span className="text-[10px] text-slate-400">Default verified resume from profile</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expected Salary</label>
                <input
                  type="text"
                  value={applyExpectedSalary}
                  onChange={e => setApplyExpectedSalary(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                  placeholder="e.g. AED 25,000 / Month"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notice Period</label>
                <input
                  type="text"
                  value={applyNoticePeriod}
                  onChange={e => setApplyNoticePeriod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white outline-none focus:border-gold-500"
                  placeholder="Immediate / 30 Days"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalJob(null)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyIsSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition disabled:opacity-50"
                >
                  {applyIsSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIDEO INTERVIEW MEETING MODAL */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-navy-800 shadow-2xl">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-navy-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Live Video Conference Panel
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white mt-1">{interviewModalApp.jobTitle}</h3>
                <p className="text-xs text-slate-500">{interviewModalApp.company} • {interviewModalApp.interviewDetails?.platform || 'Teams Call'}</p>
              </div>
              <button onClick={() => { stopCameraStream(); setInterviewModalApp(null); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Camera View */}
            <div className="relative aspect-video bg-navy-950 rounded-2xl overflow-hidden flex items-center justify-center border border-navy-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-navy-950/80 px-2.5 py-1 rounded-lg text-[10px] text-white font-mono font-bold flex items-center gap-1.5 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{user.name || 'Candidate'} (Encrypted 1080p Stream)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs space-y-1">
              <strong className="block text-navy-950 dark:text-white">Panel Time:</strong>
              <p className="text-slate-600 dark:text-slate-400">
                {interviewModalApp.interviewDetails?.date || 'Today'} at {interviewModalApp.interviewDetails?.time || '11:00 AM GST'}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Panellists: <strong>{interviewModalApp.interviewDetails?.interviewer || 'Technical Committee'}</strong>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { stopCameraStream(); setInterviewModalApp(null); }}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Close Room
              </button>
              {interviewModalApp.interviewDetails?.meetingLink && (
                <a
                  href={interviewModalApp.interviewDetails.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Official Call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. SIGN OUT CONFIRMATION MODAL */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-navy-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white">Sign Out</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to sign out of your Candidate Portal session?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                  navigateTo('home');
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE ACCOUNT MODAL */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-500/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-rose-500/20">
              <h3 className="font-serif text-lg font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Confirm Account Deletion
              </h3>
              <button onClick={() => setDeleteAccountModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will immediately delete your candidate credentials, applications, and documents from our servers. Type <strong>DELETE</strong> below to confirm.
            </p>

            {deleteError && (
              <p className="text-xs text-rose-500 font-bold">{deleteError}</p>
            )}

            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE..."
              className="w-full px-3 py-2.5 rounded-xl border border-rose-500/30 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs outline-none focus:border-rose-500 font-mono"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAccountModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidatePortal;

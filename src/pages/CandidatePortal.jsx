import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAuth } from '../components/UnifiedAuth';
import { JOBS_LIST } from '../data/mockData';
import { 
  User, FileText, Sparkles, CheckCircle2, Clock, Calendar as CalendarIcon, Bookmark, Bell, 
  Upload, Shield, ArrowRight, ArrowLeft, LogOut, Edit3, Camera, AlertCircle, Award, 
  Briefcase, MapPin, DollarSign, Check, X, Plus, Star, ChevronRight, Zap, Globe, Trash2, Video, Mic, MicOff, VideoOff, Search, Eye,
  Building2, Send, Paperclip, Download
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  'Indian',
  'Emirati (UAE)',
  'Saudi',
  'Qatari',
  'Omani',
  'Kuwaiti',
  'Bahraini',
  'Pakistani',
  'Filipino',
  'Egyptian',
  'British',
  'American',
  'Canadian',
  'Australian',
  'Jordanian',
  'Lebanese',
  'South African',
  'Bangladeshi',
  'Sri Lankan',
  'Nepali',
  'German',
  'French',
  'Singaporean',
  'Malaysian',
  'Nigerian',
  'Kenyan'
];

export const PRESET_CITIZENSHIPS = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'Pakistan',
  'Philippines',
  'Egypt',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Singapore',
  'South Africa',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'Germany',
  'France',
  'Malaysia',
  'Nigeria',
  'Kenya'
];

export const CandidatePortal = () => {
  const { user, updateUserProfile, applications, savedJobs, toggleSaveJob, applyForJob, postedJobs, setActiveModal, navigateTo, logout } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'browse-jobs' | 'edit-profile' | 'applications' | 'saved' | 'interviews'
  const [editSuccess, setEditSuccess] = useState(false);
  const [profileFormError, setProfileFormError] = useState('');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobCountryFilter, setJobCountryFilter] = useState('All');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  // Combine postedJobs and JOBS_LIST for candidate job center
  const allJobs = [...(postedJobs || [])];
  JOBS_LIST.forEach(item => {
    if (!allJobs.some(j => j.id === item.id)) {
      allJobs.push(item);
    }
  });

  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  // Parse phone string into country code and numeric digits
  const parsePhone = (phoneStr) => {
    if (!phoneStr) return { code: '+971', digits: '' };
    const matched = COUNTRY_CODES.find(c => phoneStr.startsWith(c.code));
    if (matched) {
      const digitsOnly = phoneStr.slice(matched.code.length).replace(/\D/g, '').slice(0, matched.maxDigits);
      return { code: matched.code, digits: digitsOnly };
    }
    const digitsOnly = phoneStr.replace(/\D/g, '').slice(0, 10);
    return { code: '+971', digits: digitsOnly };
  };

  const initialPhoneState = parsePhone(user?.phone || '');
  const [selectedCountryCode, setSelectedCountryCode] = useState(initialPhoneState.code);
  const [phoneDigits, setPhoneDigits] = useState(initialPhoneState.digits);
  const quickPhotoInputRef = useRef(null);

  // Handle direct quick photo upload from candidate header avatar
  const handleQuickPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setProfileForm(prev => ({ ...prev, avatar: photoData }));
        updateUserProfile({ avatar: photoData });
      };
      reader.readAsDataURL(file);
    }
  };
  const [screeningModalApp, setScreeningModalApp] = useState(null);
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [selectedMic, setSelectedMic] = useState('Default Microphone (Built-in)');
  const [selectedCamera, setSelectedCamera] = useState('Default HD Webcam');
  const [availableAudioDevices, setAvailableAudioDevices] = useState([
    'Default Microphone (Built-in Audio)',
    'Realtek High Definition Audio',
    'Bluetooth Headset / External Mic'
  ]);
  const [availableVideoDevices, setAvailableVideoDevices] = useState([
    'Integrated HD Camera (Built-in)',
    'External USB Camera'
  ]);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);
  const [permissionCheckMessage, setPermissionCheckMessage] = useState('');

  const startCameraStream = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMediaStream(stream);
        setMediaPermissionGranted(true);
        setIsCameraOff(false);
        setIsMicMuted(false);
        setPermissionCheckMessage('✓ Live Camera & Microphone active! Camera turned ON.');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(d => d.kind === 'audioinput').map((d, i) => d.label || `Microphone ${i+1}`);
          const videoInputs = devices.filter(d => d.kind === 'videoinput').map((d, i) => d.label || `Camera ${i+1}`);
          if (audioInputs.length > 0) setAvailableAudioDevices(audioInputs);
          if (videoInputs.length > 0) setAvailableVideoDevices(videoInputs);
        }
      } else {
        setIsCameraOff(false);
        setMediaPermissionGranted(true);
        setPermissionCheckMessage('✓ Camera turned ON (Browser Preview Mode).');
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setIsCameraOff(false);
      setMediaPermissionGranted(true);
      setPermissionCheckMessage('✓ Camera preview turned ON.');
    }
  };

  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOff(true);
    setPermissionCheckMessage('📷 Camera turned OFF.');
  };

  useEffect(() => {
    if (videoRef.current && mediaStream && !isCameraOff) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [videoRef, mediaStream, isCameraOff]);

  // Strictly bind form inputs ONLY to candidate data without preset defaults
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    nationality: user?.nationality || '',
    citizenship: user?.citizenship || '',
    title: user?.title || '',
    location: user?.location || '',
    preferredCountry: user?.preferredCountry || '',
    experience: user?.experience || '',
    qualification: user?.qualification || '',
    expectedSalary: user?.expectedSalary || '',
    avatar: user?.avatar || '',
    resumeName: user?.resumeName || '',
    resumeUrl: user?.resumeUrl || '',
    resumeSize: user?.resumeSize || '',
    mohreAttested: user?.mohreAttested || false,
    skillsInput: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || '')
  });

  const [selectedNationalityOption, setSelectedNationalityOption] = useState(() => {
    if (!user?.nationality) return '';
    return PRESET_NATIONALITIES.includes(user.nationality) ? user.nationality : 'Other';
  });

  const [selectedCitizenshipOption, setSelectedCitizenshipOption] = useState(() => {
    if (!user?.citizenship) return '';
    return PRESET_CITIZENSHIPS.includes(user.citizenship) ? user.citizenship : 'Other';
  });

  // Sync profileForm whenever user changes in AppContext
  useEffect(() => {
    if (user) {
      const phoneState = parsePhone(user.phone || '');
      setSelectedCountryCode(phoneState.code);
      setPhoneDigits(phoneState.digits);

      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        citizenship: user.citizenship || '',
        title: user.title || '',
        location: user.location || '',
        preferredCountry: user.preferredCountry || '',
        experience: user.experience || '',
        qualification: user.qualification || '',
        expectedSalary: user.expectedSalary || '',
        avatar: user.avatar || '',
        resumeName: user.resumeName || '',
        resumeUrl: user.resumeUrl || '',
        resumeSize: user.resumeSize || '',
        mohreAttested: user.mohreAttested || false,
        skillsInput: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '')
      });

      setSelectedNationalityOption(
        user.nationality ? (PRESET_NATIONALITIES.includes(user.nationality) ? user.nationality : 'Other') : ''
      );
      setSelectedCitizenshipOption(
        user.citizenship ? (PRESET_CITIZENSHIPS.includes(user.citizenship) ? user.citizenship : 'Other') : ''
      );
    }
  }, [user]);

  if (!user) {
    return <UnifiedAuth defaultRole="candidate" />;
  }

  const activeCountryObj = COUNTRY_CODES.find(c => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    const matched = COUNTRY_CODES.find(c => c.code === newCode) || COUNTRY_CODES[0];
    const clampedDigits = phoneDigits.slice(0, matched.maxDigits);
    setPhoneDigits(clampedDigits);
    setProfileForm(prev => ({
      ...prev,
      phone: clampedDigits ? `${newCode} ${clampedDigits}` : ''
    }));
  };

  const handlePhoneDigitsChange = (e) => {
    // Strictly extract digits only (removes all alphabets/symbols)
    const rawDigits = e.target.value.replace(/\D/g, '');
    const clampedDigits = rawDigits.slice(0, activeCountryObj.maxDigits);
    setPhoneDigits(clampedDigits);
    setProfileForm(prev => ({
      ...prev,
      phone: clampedDigits ? `${selectedCountryCode} ${clampedDigits}` : ''
    }));
  };

  // Handle local image file upload from candidate device/folders
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfileForm(prev => ({ ...prev, avatar: '' }));
  };

  // Handle CV / Resume Document Upload (.pdf, .doc, .docx)
  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileFormError('CV file size exceeds 10MB limit. Please upload a smaller PDF or Word document.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const sizeStr = (file.size / 1024) > 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setProfileForm(prev => ({
        ...prev,
        resumeName: file.name,
        resumeUrl: reader.result,
        resumeSize: sizeStr
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeCvAttachment = () => {
    setProfileForm(prev => ({
      ...prev,
      resumeName: '',
      resumeUrl: '',
      resumeSize: ''
    }));
  };

  // Calculate STRICT & AUTHENTIC Candidate Profile Score Percentage
  const calculateProfileScore = () => {
    let score = 0;
    if (user.name && user.name.trim() !== '') score += 10;
    if (user.email && user.email.trim() !== '') score += 10;
    if (user.phone && user.phone.trim() !== '') score += 10;
    if (user.dob && user.dob.trim() !== '') score += 5;
    if (user.gender && user.gender.trim() !== '') score += 5;
    if (user.nationality && user.nationality.trim() !== '') score += 5;
    if (user.citizenship && user.citizenship.trim() !== '') score += 5;
    if (user.title && user.title.trim() !== '') score += 10;
    if (user.location && user.location.trim() !== '') score += 10;
    if (user.preferredCountry && user.preferredCountry.trim() !== '') score += 10;
    if (user.qualification && user.qualification.trim() !== '') score += 10;
    if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) score += 5;
    if (user.resumeName || user.resumeUploaded) score += 5;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileScore();

  // Actionable suggestions checklist based STRICTLY on missing candidate data
  const getSuggestions = () => {
    const suggestions = [];
    if (!user.avatar || user.avatar.trim() === '') {
      suggestions.push({ id: 'avatar', title: 'Upload Profile Photo from Device (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.resumeName && !user.resumeUploaded) {
      suggestions.push({ id: 'cv', title: 'Attach CV / Resume (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    if (!user.nationality || user.nationality.trim() === '') {
      suggestions.push({ id: 'nationality', title: 'Add Nationality (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    if (!user.citizenship || user.citizenship.trim() === '') {
      suggestions.push({ id: 'citizenship', title: 'Add Citizenship (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    if (!user.phone || user.phone.trim() === '') {
      suggestions.push({ id: 'phone', title: 'Add Phone Number (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.dob || user.dob.trim() === '') {
      suggestions.push({ id: 'dob', title: 'Add Date of Birth (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    if (!user.gender || user.gender.trim() === '') {
      suggestions.push({ id: 'gender', title: 'Select Gender (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    if (!user.title || user.title.trim() === '') {
      suggestions.push({ id: 'title', title: 'Add Professional Designation / Role (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.location || user.location.trim() === '') {
      suggestions.push({ id: 'location', title: 'Add Current Location (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.qualification || user.qualification.trim() === '') {
      suggestions.push({ id: 'qualification', title: 'Add Educational Qualification (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.skills || (Array.isArray(user.skills) && user.skills.length === 0)) {
      suggestions.push({ id: 'skills', title: 'Add Key Technical Skills (+5%)', targetTab: 'edit-profile', points: 5 });
    }
    return suggestions;
  };

  const suggestionsList = getSuggestions();

  const handleSaveProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setProfileFormError('');

    // 1. Mandatory Full Name Validation (Alphabetic only, min 2 chars)
    const cleanName = (profileForm.name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      setProfileFormError('Full Name is mandatory and must be at least 2 characters.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      setProfileFormError('Full Name must contain alphabetic characters only. Numbers and special characters are not allowed.');
      return;
    }

    // 2. Mandatory Email Address Validation (Valid format)
    const cleanEmail = (profileForm.email || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail) {
      setProfileFormError('Email Address is mandatory.');
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setProfileFormError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    // 3. Mandatory Phone Number Validation
    const cleanDigits = (phoneDigits || '').replace(/\D/g, '');
    if (!cleanDigits) {
      setProfileFormError(`Phone number is mandatory. Please enter ${activeCountryObj.maxDigits} digits.`);
      return;
    }
    if (cleanDigits.length !== activeCountryObj.maxDigits) {
      setProfileFormError(`Phone number must be exactly ${activeCountryObj.maxDigits} digits for ${activeCountryObj.country}. Current: ${cleanDigits.length} digits.`);
      return;
    }

    // 4. Mandatory Educational Degree Attestation Checkbox Validation
    if (!profileForm.mohreAttested) {
      setProfileFormError('Educational Degree Attestation (MOHRE Verified) is mandatory. Please select the checkbox to proceed.');
      return;
    }

    const skillsArray = profileForm.skillsInput
      ? profileForm.skillsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const formattedPhone = `${selectedCountryCode} ${cleanDigits}`;

    const updatedData = {
      name: cleanName,
      email: cleanEmail,
      phone: formattedPhone,
      dob: (profileForm.dob || '').trim(),
      gender: (profileForm.gender || '').trim(),
      nationality: (profileForm.nationality || '').trim(),
      citizenship: (profileForm.citizenship || '').trim(),
      title: (profileForm.title || '').trim(),
      location: (profileForm.location || '').trim(),
      preferredCountry: (profileForm.preferredCountry || '').trim(),
      experience: (profileForm.experience || '').trim(),
      qualification: (profileForm.qualification || '').trim(),
      expectedSalary: (profileForm.expectedSalary || '').trim(),
      avatar: profileForm.avatar,
      resumeName: profileForm.resumeName,
      resumeUrl: profileForm.resumeUrl,
      resumeSize: profileForm.resumeSize,
      resumeUploaded: !!profileForm.resumeName,
      mohreAttested: profileForm.mohreAttested,
      skills: skillsArray
    };

    updateUserProfile(updatedData);
    setEditSuccess(true);

    setTimeout(() => {
      setEditSuccess(false);
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  return (
    <ScrollReveal>
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <SEO
        title="Candidate Portal & Job Tracker | Revival International"
        description="Access your Revival International candidate dashboard to track job applications, manage interviews, update CV credentials, and monitor international visa progress."
        canonicalPath="candidates"
        keywords="candidate portal, international job applications, track job application Dubai, CV submission GCC"
        breadcrumbs={[
          { name: 'Home', item: '' },
          { name: 'Candidate Portal', item: 'candidates' }
        ]}
      />
      
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-gold-500/30 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center space-x-5">
          {/* Avatar with Profile Score Percentage Badge Below */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gold-500 shadow-gold-glow"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gold-500 text-navy-950 font-serif font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-gold-glow">
                  {user.name ? user.name.split(' ').map(n=>n[0]).join('') : 'CAN'}
                </div>
              )}
              
              <input 
                type="file" 
                ref={quickPhotoInputRef} 
                onChange={handleQuickPhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => quickPhotoInputRef.current && quickPhotoInputRef.current.click()}
                className="absolute -bottom-1 -right-1 bg-slate-50 dark:bg-navy-900 text-gold-400 p-1.5 rounded-lg border border-slate-200 dark:border-gold-500/50 hover:bg-gold-500 hover:text-slate-900 dark:text-white transition shadow cursor-pointer"
                title="Click to Upload Profile Picture from Device"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Percentage below photo */}
            <span className={`mt-2 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm ${profileScore >= 80 ? 'bg-emerald-600 text-slate-900 dark:text-white' : profileScore >= 50 ? 'bg-gold-500 text-navy-950' : 'bg-rose-600 text-slate-900 dark:text-white'}`}>
              Score: {profileScore}% Complete
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-slate-200 dark:border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified Candidate Profile</span>
              {user.mohreAttested && (
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> MOHRE Attested
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {user.name || 'Candidate Profile'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-gold-400 bg-slate-100 dark:bg-navy-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-gold-500/20">
                {user.email}
              </span>
              {user.googleVerified && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Google Authenticated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
              {user.title ? user.title : <span className="text-rose-400 italic">No Designation Added</span>} • {user.location ? user.location : <span className="text-slate-500 dark:text-slate-400 italic">No Location Set</span>}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Candidate ID: {user.candidateId || 'REV-CAN-88219'} • Preferred Destination: {user.preferredCountry ? user.preferredCountry : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveModal('ai-resume')}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-slate-200 dark:border-gold-500/30 hover:bg-gold-500 hover:text-slate-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI ATS Score CV</span>
          </button>
          
          <button 
            onClick={() => setShowSignOutModal(true)}
            className="px-3 py-2.5 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 hover:bg-rose-500 hover:text-slate-900 dark:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
            title="Sign Out of Candidate Account"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 text-xs font-bold overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Profile Overview & Status
        </button>
        <button 
          onClick={() => setActiveTab('browse-jobs')} 
          className={`pb-3 px-4 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'browse-jobs' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          <Briefcase className="w-3.5 h-3.5 text-gold-500" />
          <span>Browse & Apply Jobs ({allJobs.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('edit-profile')} 
          className={`pb-3 px-4 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'edit-profile' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          <Edit3 className="w-3.5 h-3.5 text-gold-500" />
          <span>Edit Basic Info & Details</span>
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'applications' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Applications ({applications.length})
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'saved' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('interviews')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'interviews' ? 'border-b-2 border-gold-500 text-gold-500 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Interview Schedule (1)
        </button>
      </div>

      {/* DASHBOARD OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 text-xs font-sans">
          
          {/* Executive KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-luxury flex flex-col justify-between space-y-2 hover:border-gold-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applied</span>
                <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy-900 dark:text-white font-serif">{applications.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Active Mandates</span>
              </div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-luxury flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ATS Score</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-serif">{user.atsScore || profileScore}%</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified</span>
              </div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-luxury flex flex-col justify-between space-y-2 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Review</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-serif">
                  {applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Under AI Resume Screening').length}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Recruiter Queue</span>
              </div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-5 shadow-luxury flex flex-col justify-between space-y-2 hover:border-gold-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interview Status</span>
                <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy-900 dark:text-white font-serif">
                  {applications.filter(a => a.status === 'Interview Scheduled').length > 0 ? '1' : '0'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${applications.filter(a => a.status === 'Interview Scheduled').length > 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 dark:bg-navy-800 text-slate-500'}`}>
                  {applications.filter(a => a.status === 'Interview Scheduled').length > 0 ? 'Scheduled' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Candidate Detailed Info Card */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-luxury">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-gold-500" />
                  Authentic Executive Profile
                </h3>
                <button
                  onClick={() => setActiveTab('edit-profile')}
                  className="text-gold-500 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="flex items-center space-x-3.5 bg-slate-50 dark:bg-navy-950 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800">
                {user.avatar ? (
                  <img src={user.avatar} alt="Candidate Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-500 shadow-gold-glow shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-navy-900 text-gold-400 font-serif font-extrabold text-xl flex items-center justify-center border-2 border-gold-500 shadow-gold-glow shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white truncate">{user.name || 'Executive Candidate'}</h4>
                  <p className="text-xs text-gold-500 font-bold truncate">{user.title || 'Candidate Designation'}</p>
                  <span className="inline-block bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Score: {user.atsScore || profileScore}% Calculated
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-slate-700 dark:text-slate-300">
                <p><strong className="text-navy-900 dark:text-white">Full Name:</strong> {user.name || <span className="text-slate-500 dark:text-slate-400 italic">Not set</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Email:</strong> {user.email || <span className="text-slate-500 dark:text-slate-400 italic">Not set</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Phone:</strong> {user.phone ? user.phone : <span className="text-rose-400 italic">Not provided</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Nationality:</strong> {user.nationality ? <span className="font-semibold text-slate-900 dark:text-slate-100">{user.nationality}</span> : <span className="text-slate-400 italic">Not specified</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Citizenship:</strong> {user.citizenship ? <span className="font-semibold text-slate-900 dark:text-slate-100">{user.citizenship}</span> : <span className="text-slate-400 italic">Not specified</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Designation:</strong> {user.title ? user.title : <span className="text-rose-400 italic">Not provided</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Location:</strong> {user.location ? user.location : <span className="text-slate-500 dark:text-slate-400 italic">Dubai / International</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Target Country:</strong> {user.preferredCountry ? user.preferredCountry : <span className="text-rose-400 italic">UAE / Saudi Arabia</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Experience:</strong> {user.experience ? user.experience : <span className="text-slate-500 italic">Executive Experience</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Education:</strong> {user.qualification ? user.qualification : <span className="text-slate-500 italic">Professional Degree</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">Expected Salary:</strong> {user.expectedSalary ? user.expectedSalary : <span className="text-slate-500 dark:text-slate-400 italic">Negotiable</span>}</p>
                <p><strong className="text-navy-900 dark:text-white">CV Attachment:</strong> {user.resumeName ? <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5"><Paperclip className="w-3.5 h-3.5 text-amber-500 shrink-0" /><span>{user.resumeName}</span></span> : <span className="text-amber-600 dark:text-amber-400 italic">No CV attached yet</span>}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-2">
                <span className="font-bold text-navy-900 dark:text-white block">Key Technical Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
                    user.skills.map((sk, idx) => (
                      <span key={idx} className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-slate-200 dark:border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-rose-400 italic text-[11px]">No technical skills added yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Active Application Tracker & Resume Status */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active CV Status Card */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-luxury">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-500" />
                      Active ATS Resume & Documents
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      MOHRE & GCC ATS Applicant Tracking Compliance
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveModal('ai-resume')}
                      className="px-3.5 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold rounded-xl text-xs shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan CV with Revival AI</span>
                    </button>
                    <button 
                      onClick={() => setActiveModal('resume-builder')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-white font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-gold-500" />
                      <span>Build PDF CV</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl space-y-3 border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 dark:text-white text-sm">{user.resumeName || 'Executive_Candidate_CV.pdf'}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${user.resumeUploaded ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {user.resumeUploaded ? 'MOHRE Verified PDF' : 'Ready for ATS Scan'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Structured for Taleo, Workday & GCC headhunter automated screening.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">ATS Score</span>
                      <span className="text-xl font-extrabold text-gold-500 font-serif">{user.atsScore || profileScore}% Match</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-extrabold text-gold-500 text-sm shadow-gold-glow">
                      {user.atsScore || profileScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Tracker */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-luxury">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-500" />
                    Real-Time Application Status Tracker
                  </h3>
                  {applications.length > 0 && (
                    <span className="text-xs text-slate-500 font-bold">
                      {applications.length} Active {applications.length === 1 ? 'Application' : 'Applications'}
                    </span>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                    <Briefcase className="w-10 h-10 text-gold-500/60 mx-auto" />
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white text-sm">No Applications Submitted Yet</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Use our Revival AI Resume Analyzer to match your profile with open tier-1 GCC vacancies in Dubai, Riyadh & Doha.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('browse-jobs')}
                      className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                    >
                      Browse {allJobs.length} Verified Overseas Vacancies →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div 
                        key={app.id} 
                        onClick={() => setScreeningModalApp(app)}
                        className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl space-y-3 hover:border-gold-500/40 transition cursor-pointer shadow-sm"
                        title="Click to view AI ATS Screening Report"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-navy-900 dark:text-white text-sm hover:text-gold-500 transition">{app.jobTitle}</h4>
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">{app.company} • {app.country}</p>
                          </div>
                          <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            {app.status}
                          </span>
                        </div>

                        {/* Progress Steps */}
                        <div className="grid grid-cols-6 gap-1 pt-1 text-[9px] text-center font-bold">
                          <div className="p-1 bg-emerald-500 text-white rounded-lg">1. Applied</div>
                          <div className={`p-1 rounded-lg ${app.status !== 'Pending Review' ? 'bg-emerald-500 text-white' : 'bg-gold-500 text-navy-950 animate-pulse'}`}>2. Screened</div>
                          <div className={`p-1 rounded-lg ${app.status === 'Interview Scheduled' || app.status === 'Placed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-500'}`}>3. Interview</div>
                          <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-500 rounded-lg">4. Offer</div>
                          <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-500 rounded-lg">5. Visa</div>
                          <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-500 rounded-lg">6. Placed</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* BROWSE & APPLY JOBS TAB */}
      {activeTab === 'browse-jobs' && (
        <div className="space-y-6 text-xs">
          
          {/* Header & Filter Bar */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-4 shadow-luxury">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gold-500" />
                  Explore Executive Overseas Opportunities
                </h3>
                <p className="text-slate-500 mt-0.5">Apply directly from your candidate portal for instant headhunter review.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Available Mandates:</span>
                <span className="bg-gold-500 text-navy-950 font-extrabold px-3 py-1 rounded-full text-xs">
                  {allJobs.length} Jobs
                </span>
              </div>
            </div>

            {/* Search & Country Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search jobs by title, company, or key skills..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={jobCountryFilter}
                  onChange={(e) => setJobCountryFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-bold text-xs"
                >
                  <option value="All">🌍 All Destination Countries</option>
                  <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi)</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="Canada">🇨🇦 Canada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Success Banner when Applied */}
          {applySuccessMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between shadow animate-bounce">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{applySuccessMsg}</span>
              </div>
              <button 
                onClick={() => setApplySuccessMsg('')}
                className="text-xs underline hover:text-emerald-300 ml-4 font-extrabold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Job Listings List */}
          <div className="space-y-4">
            {allJobs
              .filter(j => {
                const matchesSearch = !jobSearch || 
                  j.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
                  j.company.toLowerCase().includes(jobSearch.toLowerCase()) ||
                  (j.skills && j.skills.some(s => s.toLowerCase().includes(jobSearch.toLowerCase())));
                const matchesCountry = jobCountryFilter === 'All' || j.country.toLowerCase().includes(jobCountryFilter.toLowerCase());
                return matchesSearch && matchesCountry;
              })
              .map(job => {
                const hasApplied = applications.some(a => a.jobId === job.id);
                const isSaved = savedJobs.includes(job.id);

                return (
                  <div key={job.id} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition hover:shadow-md">
                    <div className="flex gap-4 items-start w-full">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-navy-950 flex items-center justify-center text-gold-400 text-2xl font-bold shrink-0 mt-1 shadow-sm border border-slate-200 dark:border-gold-500/30">
                        {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[17px] text-navy-900 dark:text-white leading-tight">{job.title}</h4>
                            <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">{job.company}</p>
                          </div>
                          <button 
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-full border transition ${isSaved ? 'bg-gold-500/20 text-gold-600 border-slate-200 dark:border-gold-500/50' : 'bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-navy-700 hover:text-gold-500'}`}
                            title={isSaved ? "Saved Job" : "Bookmark Job"}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 text-[13px] line-clamp-2 pr-4">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-5 text-[13px] text-slate-500 font-medium pt-2">
                          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>{job.location || job.country}</span></div>
                          <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>{job.salary || 'Competitive'}</span></div>
                          <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>{job.experience || '3+ Years'}</span></div>
                        </div>

                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {job.skills.slice(0, 4).map((sk, i) => (
                              <span key={i} className="bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-200 dark:border-navy-800">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 pt-2 font-medium">
                          <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>Posted {job.postedDate || 'recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto self-stretch md:self-auto items-end md:items-center justify-end shrink-0">
                      {hasApplied ? (
                        <button className="w-full md:w-auto px-8 py-2.5 rounded-full border border-[#08a2c2] text-[#08a2c2] bg-[#08a2c2]/5 hover:bg-[#08a2c2]/10 font-bold text-[13px] flex items-center justify-center gap-1.5 transition">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            applyForJob(job);
                            setApplySuccessMsg(`✓ Application for "${job.title}" submitted successfully! Real-time status updated under Applications tab.`);
                          }}
                          className="w-full md:w-auto px-8 py-2.5 rounded-full border border-gold-500 text-slate-900 dark:text-white bg-gold-500 hover:bg-gold-400 font-bold text-[13px] flex items-center justify-center gap-1.5 transition shadow-gold-glow cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Apply Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* EDIT BASIC INFO & PROFILE DETAILS TAB */}
      {activeTab === 'edit-profile' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl max-w-4xl mx-auto space-y-6 text-xs shadow-luxury">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gold-500" />
                Edit Candidate Profile Information
              </h3>
              <p className="text-slate-500 mt-0.5">Upload your own photo and fill in your details to update your candidate score.</p>
            </div>
            
            <span className="bg-gold-500 text-navy-950 font-extrabold px-3 py-1 rounded-full text-xs">
              Current Score: {profileScore}%
            </span>
          </div>

          {editSuccess && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5" />
              <span>Authentic Candidate Profile Saved! Recalculating profile score ({profileScore}%)...</span>
            </div>
          )}

          {profileFormError && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{profileFormError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Custom Local File Photo Upload */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
              <label className="block font-bold text-slate-800 dark:text-slate-200">Upload Profile Photo from Your Device / Folders</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {profileForm.avatar ? (
                  <img src={profileForm.avatar} alt="Candidate Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-gold-500 shadow-gold-glow" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-serif font-extrabold text-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-navy-700">
                    No Photo
                  </div>
                )}
                
                <div className="space-y-2">
                  <input 
                    type="file" 
                    id="profileImageUpload" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <div className="flex flex-wrap gap-2">
                    <label 
                      htmlFor="profileImageUpload" 
                      className="px-4 py-2.5 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-gold-500 hover:text-slate-900 dark:text-white transition flex items-center gap-1.5 shadow"
                    >
                      <Upload className="w-4 h-4 text-gold-400" />
                      <span>Select Photo from Computer / Phone</span>
                    </label>

                    {profileForm.avatar && (
                      <button 
                        type="button" 
                        onClick={removeAvatar} 
                        className="px-3 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-slate-900 dark:text-white rounded-xl font-bold text-xs transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Supported formats: JPG, PNG, WEBP. Select any photo from your local device.</p>
                </div>
              </div>
            </div>

            {/* CV / Resume File Attachment */}
            <div className="space-y-3 p-5 bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-navy-950 dark:to-navy-900 rounded-2xl border-2 border-slate-200 dark:border-navy-800 hover:border-amber-400/50 transition">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Attach CV / Resume (PDF, DOC, DOCX)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload your updated CV for headhunter screening and automated ATS parsing.
                  </p>
                </div>
                {profileForm.resumeName && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 shrink-0">
                    ✓ Attached
                  </span>
                )}
              </div>

              <input 
                type="file" 
                id="cvDocumentUpload" 
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleCvUpload} 
                className="hidden" 
              />

              {profileForm.resumeName ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-navy-900 rounded-xl border border-amber-300 dark:border-navy-700 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-gold-400 flex items-center justify-center shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate" title={profileForm.resumeName}>
                        {profileForm.resumeName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{profileForm.resumeSize || 'Document'}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready for Headhunters</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {profileForm.resumeUrl && (
                      <a
                        href={profileForm.resumeUrl}
                        download={profileForm.resumeName || 'Candidate_CV.pdf'}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Download Attached CV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                    <label
                      htmlFor="cvDocumentUpload"
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </label>
                    <button
                      type="button"
                      onClick={removeCvAttachment}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Remove CV"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/70 dark:bg-navy-900/60 rounded-xl border border-dashed border-slate-300 dark:border-navy-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">No CV Attached Yet</p>
                      <p className="text-[11px] text-slate-500">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </div>
                  <label
                    htmlFor="cvDocumentUpload"
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Attach CV from Device</span>
                  </label>
                </div>
              )}
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name <span className="text-rose-500">*</span> (Letters only)
                </label>
                <input 
                  type="text" 
                  required
                  value={profileForm.name}
                  onChange={(e) => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setProfileForm({ ...profileForm, name: lettersOnly });
                  }}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>
            </div>

            {/* Country Code & Phone Number Field */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Phone Number (With International Country Code) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <select
                    value={selectedCountryCode}
                    onChange={handleCountryCodeChange}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-bold"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 relative">
                  <input 
                    type="text"
                    pattern="[0-9]*"
                    value={phoneDigits}
                    onChange={handlePhoneDigitsChange}
                    placeholder={`Enter ${activeCountryObj.maxDigits}-digit number (e.g. ${activeCountryObj.placeholder})`}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                  />
                  <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    {phoneDigits.length}/{activeCountryObj.maxDigits} digits
                  </span>
                </div>
              </div>
              {phoneDigits.length > 0 && phoneDigits.length < activeCountryObj.maxDigits && (
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  ⚠️ Must be {activeCountryObj.maxDigits} digits for {activeCountryObj.country} ({phoneDigits.length}/{activeCountryObj.maxDigits} entered)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Date of Birth</label>
                <div className="relative z-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <CalendarIcon className="h-5 w-5 text-gold-500" />
                  </div>
                  <DatePicker 
                    selected={profileForm.dob ? new Date(profileForm.dob) : null}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setProfileForm({ ...profileForm, dob: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setProfileForm({ ...profileForm, dob: '' });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="DD/MM/YYYY"
                    maxDate={new Date()}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl pl-10 pr-3 py-2.5 text-navy-900 dark:text-white font-medium focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Gender</label>
                <select 
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Nationality & Citizenship Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gold-500" />
                    <span>Nationality</span>
                  </span>
                  {selectedNationalityOption === 'Other' && (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-gold-400">
                      Type Country Below
                    </span>
                  )}
                </label>
                <select 
                  id="candidate-nationality-select"
                  value={selectedNationalityOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedNationalityOption(val);
                    if (val === 'Other') {
                      if (PRESET_NATIONALITIES.includes(profileForm.nationality)) {
                        setProfileForm(prev => ({ ...prev, nationality: '' }));
                      }
                    } else {
                      setProfileForm(prev => ({ ...prev, nationality: val }));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium cursor-pointer"
                >
                  <option value="">-- Select Nationality --</option>
                  {PRESET_NATIONALITIES.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                  <option value="Other">Other (Type Country / Nationality)</option>
                </select>

                {/* When 'Other' is selected, candidate can type country */}
                {selectedNationalityOption === 'Other' && (
                  <div className="mt-2 animate-in fade-in duration-150">
                    <input 
                      type="text" 
                      id="candidate-nationality-custom-input"
                      value={profileForm.nationality}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Type your country or nationality (e.g. Italian, Brazilian, Japanese, etc.)"
                      className="w-full bg-white dark:bg-navy-900 border-2 border-gold-500/70 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium text-sm shadow-xs"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-gold-500" />
                    <span>Citizenship</span>
                  </span>
                  {selectedCitizenshipOption === 'Other' && (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-gold-400">
                      Type Country Below
                    </span>
                  )}
                </label>
                <select 
                  id="candidate-citizenship-select"
                  value={selectedCitizenshipOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCitizenshipOption(val);
                    if (val === 'Other') {
                      if (PRESET_CITIZENSHIPS.includes(profileForm.citizenship)) {
                        setProfileForm(prev => ({ ...prev, citizenship: '' }));
                      }
                    } else {
                      setProfileForm(prev => ({ ...prev, citizenship: val }));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium cursor-pointer"
                >
                  <option value="">-- Select Citizenship Country --</option>
                  {PRESET_CITIZENSHIPS.map((cit) => (
                    <option key={cit} value={cit}>{cit}</option>
                  ))}
                  <option value="Other">Other (Type Country)</option>
                </select>

                {/* When 'Other' is selected, candidate can type citizenship country */}
                {selectedCitizenshipOption === 'Other' && (
                  <div className="mt-2 animate-in fade-in duration-150">
                    <input 
                      type="text" 
                      id="candidate-citizenship-custom-input"
                      value={profileForm.citizenship}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, citizenship: e.target.value }))}
                      placeholder="Type your citizenship country (e.g. Italy, Brazil, Japan, etc.)"
                      className="w-full bg-white dark:bg-navy-900 border-2 border-gold-500/70 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium text-sm shadow-xs"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Professional Designation / Role</label>
              <input 
                type="text" 
                value={profileForm.title}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                placeholder="e.g. Senior Civil Engineer / ICU Specialist"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Current Location (City, Country)</label>
                <input 
                  type="text" 
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="e.g. Dubai, UAE or Mumbai, India"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Preferred Destination Country</label>
                <select 
                  value={profileForm.preferredCountry}
                  onChange={(e) => setProfileForm({ ...profileForm, preferredCountry: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                >
                  <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi)</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Total Work Experience</label>
                <input 
                  type="text" 
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  placeholder="e.g. 7 Years"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Highest Degree / Qualification</label>
                <input 
                  type="text" 
                  value={profileForm.qualification}
                  onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                  placeholder="e.g. B.Tech Civil Engineering"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Expected Monthly Salary (Tax Free)</label>
              <input 
                type="text" 
                value={profileForm.expectedSalary}
                onChange={(e) => setProfileForm({ ...profileForm, expectedSalary: e.target.value })}
                placeholder="e.g. AED 25,000 / month"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Key Technical Skills (Comma separated)</label>
              <input 
                type="text" 
                value={profileForm.skillsInput}
                onChange={(e) => setProfileForm({ ...profileForm, skillsInput: e.target.value })}
                placeholder="e.g. Project Management, FIDIC, Site Supervision, AutoCAD"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox"
                id="mohreCheck"
                checked={profileForm.mohreAttested}
                onChange={(e) => setProfileForm({ ...profileForm, mohreAttested: e.target.checked })}
                className="w-4 h-4 text-gold-500 rounded focus:ring-gold-500"
              />
              <label htmlFor="mohreCheck" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Educational Degree Attested by UAE / Saudi Embassy (MOHRE Verified) <span className="text-rose-500">*</span>
              </label>
            </div>

            <button 
              type="button"
              onClick={handleSaveProfile}
              className="w-full py-4 bg-gold-shimmer text-navy-950 font-extrabold text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <SaveIcon />
              <span>Save Candidate Info (Calculated Score: {profileScore}%) →</span>
            </button>

          </form>
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="space-y-6 font-sans">
          
          <div className="space-y-1 mb-8 mt-2">
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white">My Applications</h2>
            <p className="text-[13px] text-slate-500 font-medium">Track the status of all your job applications in real-time.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-[20px] p-8 flex flex-col items-center justify-center space-y-3 shadow-sm">
              <span className="text-[40px] font-bold text-[#08a2c2] leading-none">{applications.length}</span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">Total Applied</span>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-[20px] p-8 flex flex-col items-center justify-center space-y-3 shadow-sm">
              <span className="text-[40px] font-bold text-[#ff8f00] leading-none">{applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Under AI Resume Screening').length}</span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">In Progress</span>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-[20px] p-8 flex flex-col items-center justify-center space-y-3 shadow-sm">
              <span className="text-[40px] font-bold text-[#03b879] leading-none">{applications.filter(a => a.status === 'Placed').length}</span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">Selected / Offered</span>
            </div>
            <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-[20px] p-8 flex flex-col items-center justify-center space-y-3 shadow-sm">
              <span className="text-[40px] font-bold text-[#0a66c2] leading-none">{applications.filter(a => a.status === 'Under AI Resume Screening').length}</span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400 font-semibold">Pending Review</span>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            {applications.map((app) => (
              <div key={app.id} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition hover:shadow-md cursor-pointer" onClick={() => setScreeningModalApp(app)}>
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-[#2e5e1e] flex items-center justify-center text-slate-900 dark:text-white text-2xl font-bold shrink-0 mt-1 shadow-sm">
                    {app.company ? app.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-[17px] text-navy-900 dark:text-white leading-tight">{app.jobTitle}</h4>
                    <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">{app.company}</p>
                    <div className="flex flex-wrap items-center gap-5 text-[13px] text-slate-500 font-medium pt-1">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>{app.country || 'Location'}</span></div>
                      <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>Negotiable</span></div>
                      <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" /> <span>Experienced</span></div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-slate-500 pt-2 font-medium">
                      <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Applied on {app.appliedDate || 'August 4, 2026'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-4 md:mt-0 w-full md:w-auto self-stretch md:self-auto items-end md:items-center">
                  <button className="w-full md:w-auto px-6 py-2.5 rounded-full border border-[#08a2c2] text-[#08a2c2] bg-[#08a2c2]/5 hover:bg-[#08a2c2]/10 font-bold text-[13px] flex items-center justify-center gap-1.5 transition">
                    <Clock className="w-4 h-4" />
                    <span>Applied</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI RESUME SCREENING REPORT MODAL */}
      {screeningModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 shadow-luxury text-xs text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <span className="bg-gold-500/20 text-gold-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">Automated ATS Screening Report</span>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">AI Resume Screening Breakdown</h3>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">{screeningModalApp.jobTitle} • {screeningModalApp.company}</p>
              </div>
              <button onClick={() => setScreeningModalApp(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* AI Score Overview Box */}
            <div className="p-4 bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-gold-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">AI ATS Compatibility Score</span>
                <span className="font-serif text-3xl font-extrabold text-gold-400">94% Match</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Keywords & Candidate Profile aligned with GCC Job Mandate</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-400 border border-slate-200 dark:border-gold-500/40 flex items-center justify-center font-serif text-xl font-extrabold shadow-gold-glow">
                94%
              </div>
            </div>

            {/* Where Screening Takes Place Section */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
              <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5 text-sm">
                <Shield className="w-4 h-4 text-gold-500" />
                Where & How Screening Takes Place:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                1. <strong>AI Parsing at Revival HQ (Dubai)</strong>: Your uploaded CV and Candidate details were processed by our MOHRE-certified AI parser.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                2. <strong>Recruiter Portal Synchronization</strong>: Your profile and ATS Score (94%) have been transmitted directly to the <strong>{screeningModalApp.company}</strong> Employer Portal dashboard.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                3. <strong>Hiring Manager Review</strong>: The employer’s recruitment team screens candidates in real-time. When they shortlist or schedule a video interview, your status updates instantly.
              </p>
            </div>

            {/* 4-Stage Pipeline Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-navy-900 dark:text-white text-xs">Live 4-Stage Screening Timeline:</h4>
              <div className="space-y-2">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Stage 1: Application Submission</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Completed ({screeningModalApp.appliedDate})</span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Stage 2: AI ATS Keyword & Skills Analysis</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Completed (94% Match)</span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Stage 3: Employer Review & Shortlisting</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Shortlisted by Recruiter</span>
                </div>

                <div className={`p-3 rounded-xl flex items-center justify-between ${screeningModalApp.status === 'Interview Scheduled' ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800'}`}>
                  <div className="flex items-center gap-2">
                    <Video className={`w-4 h-4 ${screeningModalApp.status === 'Interview Scheduled' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className={`font-bold ${screeningModalApp.status === 'Interview Scheduled' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                      Stage 4: Video Interview & Visa Offer
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${screeningModalApp.status === 'Interview Scheduled' ? 'bg-emerald-500 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {screeningModalApp.status === 'Interview Scheduled' ? 'Interview Confirmed' : 'Pending Shortlist'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setScreeningModalApp(null)}
                className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIDEO INTERVIEW MEETING & SCHEDULE MODAL */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 dark:bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-luxury text-xs text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-900 dark:text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed Interview Schedule
                  </span>
                  <span className="bg-gold-500/20 text-gold-500 text-[10px] font-bold px-2 py-0.5 rounded">MS Teams Video Panel</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">Executive Video Interview Invitation</h3>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">{interviewModalApp.jobTitle} • {interviewModalApp.company}</p>
              </div>
              <button onClick={() => { stopCameraStream(); setInterviewModalApp(null); }} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PRE-CALL EQUIPMENT & PERMISSION CHECK BOX */}
            <div className="p-5 bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-gold-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="text-gold-400 font-bold text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Equipment & Device Permission Check
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">Grant webcam/microphone access and select your audio/video devices before joining.</p>
                </div>

                <button 
                  onClick={startCameraStream}
                  className="px-3.5 py-1.5 bg-gold-500/20 text-gold-400 border border-slate-200 dark:border-gold-500/40 hover:bg-gold-500 hover:text-slate-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Turn On Camera & Test Access</span>
                </button>
              </div>

              {permissionCheckMessage && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{permissionCheckMessage}</span>
                </div>
              )}

              {/* Device Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-gold-400" />
                    <span>Select Audio Input (Microphone / Headset)</span>
                  </label>
                  <select 
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    {availableAudioDevices.map((dev, i) => (
                      <option key={i} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-gold-400" />
                    <span>Select Video Input (Webcam / External Camera)</span>
                  </label>
                  <select 
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    {availableVideoDevices.map((dev, i) => (
                      <option key={i} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Interactive Controls & Real Camera Preview Box */}
              <div className="p-4 bg-slate-800/90 dark:bg-navy-900/90 rounded-2xl border border-slate-300 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-20 rounded-xl bg-black border border-slate-200 dark:border-gold-500/40 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {isCameraOff ? (
                      <span className="text-[10px] text-rose-400 font-bold text-center p-1">Camera Off</span>
                    ) : (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMicMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {isMicMuted ? '🔴 Microphone Muted' : '🎙️ Mic Active & Listening'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCameraOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {isCameraOff ? '📷 Camera Off' : '🟢 Camera On'}
                      </span>
                    </div>

                    {/* Live Sound Equalizer Wave */}
                    {!isMicMuted && (
                      <div className="flex items-center space-x-1 pt-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Audio Level:</span>
                        <div className="flex items-end space-x-1 h-3">
                          <span className="w-1 h-2 bg-emerald-400 rounded animate-pulse"></span>
                          <span className="w-1 h-3 bg-emerald-500 rounded animate-pulse delay-75"></span>
                          <span className="w-1 h-1 bg-emerald-400 rounded animate-pulse delay-150"></span>
                          <span className="w-1 h-2.5 bg-emerald-500 rounded animate-pulse"></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pre-Call Mic & Camera Toggle Test Buttons */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${isMicMuted ? 'bg-rose-600 text-slate-900 dark:text-white border-rose-500' : 'bg-emerald-600 text-slate-900 dark:text-white border-emerald-500'}`}
                    title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (isCameraOff) {
                        startCameraStream();
                      } else {
                        stopCameraStream();
                      }
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${isCameraOff ? 'bg-rose-600 text-slate-900 dark:text-white border-rose-500' : 'bg-emerald-600 text-slate-900 dark:text-white border-emerald-500'}`}
                    title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
                  >
                    {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Meeting Details Summary */}
            <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-navy-900 dark:text-white">Scheduled Interview Date & Time:</span>
                <span className="font-extrabold text-gold-600 dark:text-gold-400">
                  {interviewModalApp.interviewDetails?.date || 'Today'} at {interviewModalApp.interviewDetails?.time || '14:00 GST'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Interviewer Panel: <strong>{interviewModalApp.interviewDetails?.interviewer || `${interviewModalApp.company} Technical Panel`}</strong>
              </p>
            </div>

            {/* DIRECT MICROSOFT TEAMS REDIRECT */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-navy-900 dark:text-white block">Official Interview Meeting Link:</span>

              <a 
                href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_Revival_International_Executive_Panel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition cursor-pointer text-center"
              >
                <Globe className="w-5 h-5" />
                <span>Launch & Join Official Microsoft Teams Video Call ↗</span>
              </a>

              <button 
                onClick={() => {
                  stopCameraStream();
                  setInterviewModalApp(null);
                }}
                className="w-full py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-300 transition"
              >
                Close Invitation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SAVED JOBS TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-6 text-xs">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-gold-500" />
                Saved Job Bookmarks ({savedJobs.length})
              </h3>
              <p className="text-slate-500 mt-1">Review, apply, or manage your bookmarked international opportunities.</p>
            </div>
            <button
              onClick={() => setActiveTab('browse-jobs')}
              className="py-2.5 px-5 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-95 transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Vacancies</span>
            </button>
          </div>

          {allJobs.filter(j => savedJobs.includes(j.id)).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allJobs.filter(j => savedJobs.includes(j.id)).map((job) => (
                <div
                  key={job.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
                        {job.category || 'Executive'}
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gold-500" />
                      <span>{job.company}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gold-500" />
                        {job.country || job.location || 'UAE'}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          {job.salary}
                        </span>
                      )}
                      {job.experience && (
                        <span className="flex items-center gap-1">
                          Exp: {job.experience}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex gap-2">
                    <button
                      onClick={() => handleApply(job)}
                      className="flex-1 py-2.5 px-3 bg-gold-500 hover:bg-gold-600 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply Now</span>
                    </button>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className="py-2.5 px-4 border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-10 rounded-3xl text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
                <Bookmark className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">No Saved Jobs Yet</h4>
              <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
                You haven't bookmarked any jobs yet. Browse available vacancies and bookmark jobs you are interested in to review and apply anytime.
              </p>
              <button
                onClick={() => setActiveTab('browse-jobs')}
                className="py-2.5 px-6 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow cursor-pointer text-xs"
              >
                Browse Open Vacancies →
              </button>
            </div>
          )}
        </div>
      )}

      {/* INTERVIEWS TAB */}
      {activeTab === 'interviews' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-medium">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>
                <strong>Confirmed Interview Portal:</strong> Below are your scheduled executive interviews. Click <strong>"Join Video Interview"</strong> to enter the live MS Teams meeting room.
              </span>
            </div>
          </div>

          {applications.filter(a => a.status === 'Interview Scheduled').length > 0 ? (
            applications.filter(a => a.status === 'Interview Scheduled').map((app) => (
              <div key={app.id} className="glass-card bg-white dark:bg-navy-900 border-2 border-emerald-500/40 p-6 rounded-2xl space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-emerald-500 text-slate-900 dark:text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded">Confirmed Schedule</span>
                    <h4 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1">{app.jobTitle}</h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{app.company} • {app.country}</p>
                  </div>

                  <button 
                    onClick={() => { setInterviewModalApp(app); startCameraStream(); }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-slate-900 dark:text-white" />
                    <span>Join Video Call Now →</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Scheduled Time</span>
                    <p className="font-bold text-navy-900 dark:text-white">{app.interviewDetails?.date || 'Today'} at {app.interviewDetails?.time || '14:00 GST'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Meeting Format</span>
                    <p className="font-bold text-navy-900 dark:text-white">{app.interviewDetails?.mode || 'Microsoft Teams Video'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Interviewer Panel</span>
                    <p className="font-bold text-navy-900 dark:text-white">{app.interviewDetails?.interviewer || `${app.company} HR Panel`}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl text-xs space-y-3">
              <div className="flex items-center space-x-3 text-gold-500 font-bold">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Upcoming Executive Video Panel Interview</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">Scheduled Date: <strong>August 8, 2026 at 14:00 GST (Dubai Time)</strong></p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Format: Executive Microsoft Teams Video Panel with HR Director & VP of Engineering.</p>
              <button 
                onClick={() => setInterviewModalApp({
                  id: 'APP-9982',
                  jobTitle: 'Senior Civil Project Manager',
                  company: 'Al Habtoor Contracting LLC',
                  interviewDetails: {
                    date: 'August 8, 2026',
                    time: '14:00 GST',
                    mode: 'Microsoft Teams Video Call',
                    interviewer: 'Al Habtoor HR Director & Technical Lead',
                    notes: 'Please bring degree certificates and passport copies.'
                  }
                })} 
                className="px-4 py-2 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-gold-500 hover:text-slate-900 dark:text-white transition flex items-center gap-1.5"
              >
                <Video className="w-4 h-4 text-gold-400" />
                <span>Join MS Teams Meeting Link →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to sign out of your candidate account? Your active session will be closed safely.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-navy-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </ScrollReveal>
  );
};

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

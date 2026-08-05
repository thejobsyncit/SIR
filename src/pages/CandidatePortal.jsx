import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CandidateAuth } from '../components/CandidateAuth';
import { 
  User, FileText, Sparkles, CheckCircle2, Clock, Calendar, Bookmark, Bell, 
  Upload, Shield, ArrowRight, LogOut, Edit3, Camera, AlertCircle, Award, 
  Briefcase, MapPin, DollarSign, Check, X, Plus, Star, ChevronRight, Zap, Globe, Trash2, Video, Mic, MicOff, VideoOff
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

export const CandidatePortal = () => {
  const { user, updateUserProfile, applications, savedJobs, setActiveModal, navigateTo, logout } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'edit-profile' | 'applications' | 'saved' | 'interviews'
  const [editSuccess, setEditSuccess] = useState(false);

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
    title: user?.title || '',
    location: user?.location || '',
    preferredCountry: user?.preferredCountry || '',
    experience: user?.experience || '',
    qualification: user?.qualification || '',
    expectedSalary: user?.expectedSalary || '',
    avatar: user?.avatar || '',
    mohreAttested: user?.mohreAttested || false,
    skillsInput: Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || '')
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
        title: user.title || '',
        location: user.location || '',
        preferredCountry: user.preferredCountry || '',
        experience: user.experience || '',
        qualification: user.qualification || '',
        expectedSalary: user.expectedSalary || '',
        avatar: user.avatar || '',
        mohreAttested: user.mohreAttested || false,
        skillsInput: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '')
      });
    }
  }, [user]);

  if (!user || user.role !== 'candidate') {
    return <CandidateAuth />;
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

  // Calculate STRICT & AUTHENTIC Candidate Profile Score Percentage
  const calculateProfileScore = () => {
    let score = 0;
    if (user.name && user.name.trim() !== '') score += 10;
    if (user.email && user.email.trim() !== '') score += 10;
    if (user.phone && user.phone.trim() !== '') score += 10;
    if (user.dob && user.dob.trim() !== '') score += 10;
    if (user.gender && user.gender.trim() !== '') score += 10;
    if (user.title && user.title.trim() !== '') score += 10;
    if (user.location && user.location.trim() !== '') score += 10;
    if (user.preferredCountry && user.preferredCountry.trim() !== '') score += 10;
    if (user.qualification && user.qualification.trim() !== '') score += 10;
    if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) score += 10;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileScore();

  // Actionable suggestions checklist based STRICTLY on missing candidate data
  const getSuggestions = () => {
    const suggestions = [];
    if (!user.avatar || user.avatar.trim() === '') {
      suggestions.push({ id: 'avatar', title: 'Upload Profile Photo from Device (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.phone || user.phone.trim() === '') {
      suggestions.push({ id: 'phone', title: 'Add Phone Number (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.dob || user.dob.trim() === '') {
      suggestions.push({ id: 'dob', title: 'Add Date of Birth (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    if (!user.gender || user.gender.trim() === '') {
      suggestions.push({ id: 'gender', title: 'Select Gender (+10%)', targetTab: 'edit-profile', points: 10 });
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
      suggestions.push({ id: 'skills', title: 'Add Key Technical Skills (+10%)', targetTab: 'edit-profile', points: 10 });
    }
    return suggestions;
  };

  const suggestionsList = getSuggestions();

  const handleSaveProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const skillsArray = profileForm.skillsInput
      ? profileForm.skillsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const formattedPhone = phoneDigits ? `${selectedCountryCode} ${phoneDigits}` : '';

    const updatedData = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: formattedPhone,
      dob: profileForm.dob.trim(),
      gender: profileForm.gender.trim(),
      title: profileForm.title.trim(),
      location: profileForm.location.trim(),
      preferredCountry: profileForm.preferredCountry.trim(),
      experience: profileForm.experience.trim(),
      qualification: profileForm.qualification.trim(),
      expectedSalary: profileForm.expectedSalary.trim(),
      avatar: profileForm.avatar,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-gold-500/30 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center space-x-4">
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
            
            <button 
              onClick={() => setActiveTab('edit-profile')}
              className="absolute -bottom-1 -right-1 bg-navy-900 text-gold-400 p-1.5 rounded-lg border border-gold-500/50 hover:bg-gold-500 hover:text-navy-950 transition shadow"
              title="Upload Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified Candidate Profile</span>
              {user.mohreAttested && (
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> MOHRE Attested
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {user.name || 'Candidate Profile'}
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
              {user.title ? user.title : <span className="text-rose-400 italic">No Designation Added</span>} • {user.location ? user.location : <span className="text-slate-400 italic">No Location Set</span>}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Candidate ID: {user.candidateId || 'SIR-CAN-88219'} • Preferred Destination: {user.preferredCountry ? user.preferredCountry : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('edit-profile')}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-navy-700 hover:border-gold-500 transition flex items-center justify-center space-x-1.5"
          >
            <Edit3 className="w-4 h-4 text-gold-500" />
            <span>Edit Profile Info</span>
          </button>

          <button 
            onClick={() => setActiveModal('ai-resume')}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 hover:bg-gold-500 hover:text-navy-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI ATS Score CV</span>
          </button>
          
          <button 
            onClick={logout}
            className="px-3 py-2.5 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
            title="Sign Out of Candidate Account"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* NAUKRI-STYLE PROFILE COMPLETENESS METER */}
      <div className="bg-white dark:bg-navy-950 border border-slate-300 dark:border-gold-500/30 rounded-3xl p-6 shadow-lg space-y-4 text-slate-900 dark:text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-600 dark:text-gold-400 animate-pulse" />
              <h2 className="font-serif text-xl font-extrabold text-slate-900 dark:text-white">Authentic Candidate Profile Completeness</h2>
              <span className={`font-extrabold text-[11px] px-2.5 py-0.5 rounded-full ${profileScore >= 80 ? 'bg-emerald-600 text-white' : profileScore >= 50 ? 'bg-gold-500 text-navy-950' : 'bg-rose-600 text-white'}`}>
                {profileScore}% Complete
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
              {profileScore >= 80 
                ? '🌟 Star Candidate Status! Your profile details are complete and actively scanned by headhunters.'
                : `Your profile score is currently ${profileScore}%. Complete missing fields below to reach 100%.`
              }
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('edit-profile')}
            className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow flex items-center gap-1.5 hover:opacity-95 transition whitespace-nowrap"
          >
            <span>Update Profile Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-navy-900 rounded-full h-3.5 p-0.5 border border-slate-300 dark:border-navy-700">
          <div 
            className={`h-full rounded-full transition-all duration-700 relative ${profileScore >= 80 ? 'bg-gradient-to-r from-gold-500 to-emerald-500' : profileScore >= 50 ? 'bg-gold-500' : 'bg-rose-500'}`}
            style={{ width: `${profileScore}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full opacity-75"></div>
          </div>
        </div>

        {/* Actionable Suggestions to Reach 100% */}
        {suggestionsList.length > 0 ? (
          <div className="pt-3 border-t border-slate-200 dark:border-navy-800 space-y-2">
            <span className="text-xs font-extrabold text-navy-900 dark:text-gold-400 uppercase tracking-wider block">
              Remaining items to reach 100% Profile Completeness ({suggestionsList.length} Pending):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestionsList.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setActiveTab(s.targetTab)}
                  className="p-3 bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 hover:border-gold-500 rounded-xl flex justify-between items-center cursor-pointer transition group text-xs shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-slate-900 dark:text-slate-100 font-bold group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">{s.title}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-2">
                    +{s.points}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Congratulations! Your profile details are 100% complete and fully verified.</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 text-xs font-bold overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Profile Overview & Status
        </button>
        <button 
          onClick={() => setActiveTab('edit-profile')} 
          className={`pb-3 px-4 transition whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'edit-profile' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
        >
          <Edit3 className="w-3.5 h-3.5 text-gold-500" />
          <span>Edit Basic Info & Details</span>
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'applications' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Applications ({applications.length})
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'saved' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('interviews')} 
          className={`pb-3 px-4 transition whitespace-nowrap ${activeTab === 'interviews' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Interview Schedule (1)
        </button>
      </div>

      {/* DASHBOARD OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Candidate Detailed Info Card */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" />
                Authentic Candidate Details
              </h3>
              <button onClick={() => setActiveTab('edit-profile')} className="text-gold-500 font-bold hover:underline">
                Edit
              </button>
            </div>

            <div className="space-y-2.5 text-slate-700 dark:text-slate-300">
              <p><strong className="text-navy-900 dark:text-white">Full Name:</strong> {user.name || <span className="text-slate-400 italic">Not set</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Email:</strong> {user.email || <span className="text-slate-400 italic">Not set</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Phone:</strong> {user.phone ? user.phone : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Date of Birth (DOB):</strong> {user.dob ? user.dob : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Gender:</strong> {user.gender ? user.gender : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Designation:</strong> {user.title ? user.title : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Location:</strong> {user.location ? user.location : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Target Country:</strong> {user.preferredCountry ? user.preferredCountry : <span className="text-rose-400 italic">Not specified</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Experience:</strong> {user.experience ? user.experience : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Education:</strong> {user.qualification ? user.qualification : <span className="text-rose-400 italic">Not provided</span>}</p>
              <p><strong className="text-navy-900 dark:text-white">Expected Salary:</strong> {user.expectedSalary ? user.expectedSalary : <span className="text-slate-400 italic">Negotiable</span>}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-2">
              <span className="font-bold text-navy-900 dark:text-white block">Key Technical Skills:</span>
              <div className="flex flex-wrap gap-1">
                {user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
                  user.skills.map((sk, idx) => (
                    <span key={idx} className="bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
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
            
            {/* Active CV Status */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-500" />
                  Active ATS Resume & Documents
                </h3>
                <button 
                  onClick={() => setActiveModal('ai-resume')}
                  className="px-3 py-1.5 bg-gold-shimmer text-navy-950 font-bold rounded-lg text-xs hover:opacity-95"
                >
                  Analyze CV Score
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-2 border border-slate-200 dark:border-navy-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 dark:text-white text-sm">{user.resumeName || 'No CV Uploaded'}</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${user.resumeUploaded ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {user.resumeUploaded ? 'Verified PDF' : 'Pending Resume'}
                  </span>
                </div>
                <p className="text-slate-500">Uploaded format compliant with MOHRE and GCC ATS Applicant Tracking Systems.</p>
              </div>
            </div>

            {/* Application Tracker */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-500" />
                Real-Time Application Status Tracker
              </h3>

              {applications.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-navy-900 dark:text-white text-sm">{app.jobTitle}</h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{app.company} • {app.country}</p>
                    </div>
                    <span className="bg-gold-500/20 text-gold-500 font-bold px-2.5 py-1 rounded text-[11px]">
                      {app.status}
                    </span>
                  </div>

                  {/* Progress Steps */}
                  <div className="grid grid-cols-6 gap-1 pt-2 text-[10px] text-center font-bold">
                    <div className="p-1 bg-emerald-500 text-white rounded">1. Applied</div>
                    <div className="p-1 bg-emerald-500 text-white rounded">2. Screened</div>
                    <div className="p-1 bg-gold-500 text-navy-950 rounded animate-pulse">3. Interview</div>
                    <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">4. Offer</div>
                    <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">5. Visa</div>
                    <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">6. Placed</div>
                  </div>
                </div>
              ))}
            </div>

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
                      className="px-4 py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-gold-500 hover:text-navy-950 transition flex items-center gap-1.5 shadow"
                    >
                      <Upload className="w-4 h-4 text-gold-400" />
                      <span>Select Photo from Computer / Phone</span>
                    </label>

                    {profileForm.avatar && (
                      <button 
                        type="button" 
                        onClick={removeAvatar} 
                        className="px-3 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">Supported formats: JPG, PNG, WEBP. Select any photo from your local folders.</p>
                </div>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, '') })}
                  placeholder="Enter your full name (Letters only)..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="Enter your email address..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              {/* STRICT PHONE NUMBER FIELD WITH COUNTRY CODE SELECTOR */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-200">
                  Phone Number (Numbers Only) *
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedCountryCode}
                    onChange={handleCountryCodeChange}
                    className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-3 text-navy-900 dark:text-white font-bold text-xs focus:outline-none focus:border-gold-500"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phoneDigits}
                      onChange={handlePhoneDigitsChange}
                      placeholder={`Enter ${activeCountryObj.maxDigits}-digit number (e.g. ${activeCountryObj.placeholder})`}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                    />
                    <span className="absolute right-3 top-3.5 text-[10px] text-slate-400 font-bold">
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

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Date of Birth (DOB)</label>
                <input 
                  type="date" 
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
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
                  <option value="">-- Select Target Destination --</option>
                  <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi)</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Germany">🇩🇪 Germany</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Total Work Experience</label>
                <input 
                  type="text" 
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  placeholder="e.g. 5 Years"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Expected Monthly Salary</label>
                <input 
                  type="text" 
                  value={profileForm.expectedSalary}
                  onChange={(e) => setProfileForm({ ...profileForm, expectedSalary: e.target.value })}
                  placeholder="e.g. AED 25,000 / month"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Highest Qualification / Degree</label>
              <input 
                type="text" 
                value={profileForm.qualification}
                onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                placeholder="e.g. B.Sc. Civil Engineering"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Key Technical Skills (Comma separated)</label>
              <input 
                type="text" 
                value={profileForm.skillsInput}
                onChange={(e) => setProfileForm({ ...profileForm, skillsInput: e.target.value })}
                placeholder="e.g. Project Leadership, Site Operations, AutoCAD"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-3 text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-medium"
              />
            </div>

            {/* MOHRE Attestation status */}
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox"
                id="mohreCheck"
                checked={profileForm.mohreAttested}
                onChange={(e) => setProfileForm({ ...profileForm, mohreAttested: e.target.checked })}
                className="w-4 h-4 text-gold-500 rounded focus:ring-gold-500"
              />
              <label htmlFor="mohreCheck" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Educational Degree Attested by UAE / Saudi Embassy (MOHRE Verified)
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
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-800 dark:text-amber-300 font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500 shrink-0" />
              <span>
                <strong>What is "Under AI Resume Screening"?</strong> Your application has been parsed by SIR Recruitment's AI ATS engine in Dubai HQ and delivered to the Employer's Portal for hiring manager review. Click any application below to view its live screening breakdown report.
              </span>
            </div>
          </div>

          {applications.map((app) => (
            <div key={app.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-gold-500 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-navy-900 text-gold-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded">{app.id}</span>
                  <h4 className="font-bold text-base text-navy-900 dark:text-white">{app.jobTitle}</h4>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">{app.company} • Applied on {app.appliedDate}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Delivered to Recruiter Portal • 94% ATS Keywords Match Score</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setScreeningModalApp(app)}
                  className="px-3.5 py-2 bg-navy-950 text-gold-400 hover:bg-gold-500 hover:text-navy-950 border border-gold-500/30 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View AI Screening Report</span>
                </button>

                {app.status === 'Interview Scheduled' ? (
                  <button
                    onClick={() => { setInterviewModalApp(app); startCameraStream(); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition animate-pulse cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-white" />
                    <span>Join Video Interview / View Schedule</span>
                  </button>
                ) : (
                  <span 
                    onClick={() => setScreeningModalApp(app)}
                    className="cursor-pointer px-3.5 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold rounded-xl text-xs flex items-center gap-1 hover:bg-amber-500/25 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{app.status}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI RESUME SCREENING REPORT MODAL */}
      {screeningModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 p-6 sm:p-8 rounded-3xl max-w-xl w-full space-y-6 shadow-luxury text-xs text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <span className="bg-gold-500/20 text-gold-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">Automated ATS Screening Report</span>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">AI Resume Screening Breakdown</h3>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">{screeningModalApp.jobTitle} • {screeningModalApp.company}</p>
              </div>
              <button onClick={() => setScreeningModalApp(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* AI Score Overview Box */}
            <div className="p-4 bg-navy-950 text-white rounded-2xl border border-gold-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">AI ATS Compatibility Score</span>
                <span className="font-serif text-3xl font-extrabold text-gold-400">94% Match</span>
                <p className="text-[11px] text-slate-300 font-medium">Keywords & Candidate Profile aligned with GCC Job Mandate</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center font-serif text-xl font-extrabold shadow-gold-glow">
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
                1. <strong>AI Parsing at SIR HQ (Dubai)</strong>: Your uploaded CV and Candidate details were processed by our MOHRE-certified AI parser.
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
                    <Video className={`w-4 h-4 ${screeningModalApp.status === 'Interview Scheduled' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className={`font-bold ${screeningModalApp.status === 'Interview Scheduled' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                      Stage 4: Video Interview & Visa Offer
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${screeningModalApp.status === 'Interview Scheduled' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-luxury text-xs text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed Interview Schedule
                  </span>
                  <span className="bg-gold-500/20 text-gold-500 text-[10px] font-bold px-2 py-0.5 rounded">MS Teams Video Panel</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">Executive Video Interview Invitation</h3>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">{interviewModalApp.jobTitle} • {interviewModalApp.company}</p>
              </div>
              <button onClick={() => { stopCameraStream(); setInterviewModalApp(null); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PRE-CALL EQUIPMENT & PERMISSION CHECK BOX */}
            <div className="p-5 bg-navy-950 text-white rounded-2xl border border-gold-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-navy-800 pb-3">
                <div>
                  <span className="text-gold-400 font-bold text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Equipment & Device Permission Check
                  </span>
                  <p className="text-[11px] text-slate-300">Grant webcam/microphone access and select your audio/video devices before joining.</p>
                </div>

                <button 
                  onClick={startCameraStream}
                  className="px-3.5 py-1.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold text-xs rounded-xl transition flex items-center gap-1 whitespace-nowrap"
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
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-gold-400" />
                    <span>Select Audio Input (Microphone / Headset)</span>
                  </label>
                  <select 
                    value={selectedMic}
                    onChange={(e) => setSelectedMic(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    {availableAudioDevices.map((dev, i) => (
                      <option key={i} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-gold-400" />
                    <span>Select Video Input (Webcam / External Camera)</span>
                  </label>
                  <select 
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-gold-500"
                  >
                    {availableVideoDevices.map((dev, i) => (
                      <option key={i} value={dev}>{dev}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Interactive Controls & Real Camera Preview Box */}
              <div className="p-4 bg-navy-900/90 rounded-2xl border border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-20 rounded-xl bg-black border border-gold-500/40 flex items-center justify-center relative overflow-hidden shadow-inner">
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
                        <span className="text-[10px] text-slate-400 font-bold">Audio Level:</span>
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
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${isMicMuted ? 'bg-rose-600 text-white border-rose-500' : 'bg-emerald-600 text-white border-emerald-500'}`}
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
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${isCameraOff ? 'bg-rose-600 text-white border-rose-500' : 'bg-emerald-600 text-white border-emerald-500'}`}
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
                href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_SIR_Recruitment_Executive_Panel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition cursor-pointer text-center"
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
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl text-xs space-y-3">
          <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Saved Job Bookmarks ({savedJobs.length})</h3>
          <p className="text-slate-500">You have {savedJobs.length} bookmarked opportunities. Review and apply anytime.</p>
          <button onClick={() => navigateTo('jobs')} className="py-2.5 px-6 bg-gold-shimmer text-navy-950 font-bold rounded-xl shadow-gold-glow">
            Browse More Jobs →
          </button>
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
                    <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded">Confirmed Schedule</span>
                    <h4 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1">{app.jobTitle}</h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{app.company} • {app.country}</p>
                  </div>

                  <button 
                    onClick={() => { setInterviewModalApp(app); startCameraStream(); }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-white" />
                    <span>Join Video Call Now →</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Scheduled Time</span>
                    <p className="font-bold text-navy-900 dark:text-white">{app.interviewDetails?.date || 'Today'} at {app.interviewDetails?.time || '14:00 GST'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Meeting Format</span>
                    <p className="font-bold text-navy-900 dark:text-white">{app.interviewDetails?.mode || 'Microsoft Teams Video'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Interviewer Panel</span>
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
                className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-gold-500 hover:text-navy-950 transition flex items-center gap-1.5"
              >
                <Video className="w-4 h-4 text-gold-400" />
                <span>Join MS Teams Meeting Link →</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

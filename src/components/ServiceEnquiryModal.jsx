import React, { useState, useEffect } from 'react';
import { 
  X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2, Globe,
  UserCheck, Briefcase, Clock, Users, Plane, FileText, Award, Upload,
  ExternalLink, Calendar, MapPin, ShieldCheck, CheckSquare, ChevronRight
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';
import { submitLeadWithFallback } from '../services/leadSubmissionService';

const serviceIcons = {
  'dom-rec': Building2,
  'intl-rec': Globe,
  'exec-search': UserCheck,
  'perm-staff': Briefcase,
  'contract-staff': Clock,
  'bulk-hiring': Users,
  'overseas-place': Plane,
  'visa-assist': FileText,
  'work-permit': Award
};

export const ServiceEnquiryModal = ({ isOpen, onClose, service, onNavigateToJobs }) => {
  if (!isOpen || !service) return null;

  const ServiceIcon = serviceIcons[service.id] || Briefcase;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    // Service-specific
    subType: 'employer', // for dom-rec: employer | candidate
    jobTitle: '',
    skills: '',
    experience: '2-5 Years',
    workLocation: 'Dubai, UAE',
    salaryRange: '',
    vacancies: '1',
    targetCountry: 'UAE',
    seniority: 'Director / VP',
    industry: 'General Corporate',
    hiringTimeline: 'Immediate (Within 30 Days)',
    joiningDate: '',
    contractDuration: '12 Months',
    startDate: '',
    endDate: '',
    shiftRequirements: 'Standard Day Shift',
    jobCategory: 'General Technical',
    visaCategory: 'MOHRE Employment Residence Permit',
    currentStage: 'Initial Planning / Not Applied',
    consultationCall: true,
    consultationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    consultationTime: '11:00 AM - 12:00 PM IST',
    consultationMode: 'Virtual Video Call (Google Meet / Zoom)',
    consent: true
  });

  const [uploadedCv, setUploadedCv] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedLead, setSubmittedLead] = useState(null);

  // Initialize service defaults on open
  useEffect(() => {
    if (isOpen && service) {
      setSubmittedLead(null);
      setSubmitError(null);
      setFormErrors({});
      setUploadedCv(null);
      trackEnquiryStart('service_modal', service.id);
    }
  }, [isOpen, service]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // CV Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    if (!allowed.includes(ext)) {
      setUploadError('Supported formats: PDF, DOC, DOCX, PNG, JPG.');
      return;
    }

    try {
      setUploadingCv(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: reader.result,
              fileType: file.type
            })
          });
          const json = await res.json();
          if (json.success && json.data) {
            setUploadedCv(json.data);
            setUploadError(null);
          } else {
            setUploadError(json.message || 'File upload failed');
          }
        } catch (err) {
          console.error(err);
          setUploadError('Network error uploading file');
        } finally {
          setUploadingCv(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingCv(false);
      setUploadError('Unable to process file');
    }
  };

  // Client Validation
  const validate = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Valid email address is required.';
    }
    const cleanPhone = (formData.phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 20) {
      errors.phone = 'Valid phone number with country code is required (min 7 digits).';
    }
    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = 'Please provide inquiry or requirement details (minimum 10 characters).';
    }

    // Service-specific validation
    if (service.id === 'contract-staff' && formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = 'Contract end date cannot be earlier than start date.';
      }
    }

    if (!formData.consent) {
      errors.consent = 'You must acknowledge the communication consent to proceed.';
    }

    return errors;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const attribution = getAttributionData ? getAttributionData() : {};
      
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company ? formData.company.trim() : (formData.subType === 'employer' ? 'Corporate Client' : 'Individual Candidate'),
        message: formData.message.trim(),
        serviceId: service.id,
        serviceTitle: service.title,
        priority: service.id === 'exec-search' ? 'High' : 'Medium',
        // Attribution
        utmSource: attribution.utm_source || 'website_service_modal',
        utmMedium: attribution.utm_medium || 'direct',
        utmCampaign: attribution.utm_campaign || 'services_page',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        // Service specific fields
        jobTitle: formData.jobTitle || (service.id === 'exec-search' ? 'Executive Leadership' : service.title),
        skills: formData.skills || '',
        experience: formData.experience || '',
        workLocation: formData.workLocation || '',
        salaryRange: formData.salaryRange || '',
        vacancies: formData.vacancies || '1',
        seniority: formData.seniority || '',
        industry: formData.industry || '',
        hiringTimeline: formData.hiringTimeline || '',
        joiningDate: formData.joiningDate || '',
        contractDuration: formData.contractDuration || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        shiftRequirements: formData.shiftRequirements || '',
        jobCategory: formData.jobCategory || '',
        visaCategory: formData.visaCategory || '',
        currentStage: formData.currentStage || '',
        targetCountry: formData.targetCountry || 'UAE',
        cvPath: uploadedCv ? uploadedCv.filePath : null,
        consultationDate: formData.consultationCall ? formData.consultationDate : null,
        consultationTime: formData.consultationCall ? formData.consultationTime : null,
        consultationMode: formData.consultationCall ? formData.consultationMode : null,
        status: (formData.consultationCall && formData.consultationDate) ? 'Consultation Scheduled' : 'New'
      };

      const { ok, data: json } = await submitLeadWithFallback(payload);

      if (ok && json?.success) {
        setSubmittedLead(json.data || json.lead);
        trackEnquiryConversion('service_modal', service.id, json.data?.referenceNumber);
      } else {
        setSubmitError(json.message || 'Error saving enquiry to database. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Unable to reach server. Please check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 dark:bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div 
        className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-enquiry-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-800 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 dark:bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400 shrink-0 mt-0.5 shadow-sm">
              <ServiceIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {service.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-medium">#{service.id}</span>
              </div>
              <h2 id="service-enquiry-title" className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white leading-tight">
                {service.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Revival International • Verified Official Inbound Channel
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {submittedLead ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Request Securely Recorded
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your request for <strong>{service.title}</strong> has been transmitted to our senior recruiters and CRM database.
              </p>
            </div>

            <div className="p-4 bg-gold-500/10 border border-gold-500/30 rounded-2xl max-w-sm mx-auto text-center space-y-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">
                Official Reference Number
              </span>
              <span className="font-extrabold text-gold-600 dark:text-gold-400 text-base tracking-wider block">
                {submittedLead.referenceNumber || submittedLead.id}
              </span>

              {submittedLead.consultationDate && (
                <div className="pt-2 border-t border-gold-500/20 text-left font-sans space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Consultation Slot Confirmed:</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold">
                    {submittedLead.consultationDate} at {submittedLead.consultationTime}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Mode: {submittedLead.consultationMode || 'Virtual Video Call'}
                  </p>
                </div>
              )}

              <span className="text-[10px] text-slate-500 block pt-1">
                Save this reference for priority follow-up with our Dubai advisory office.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
              >
                Done
              </button>
              {onNavigateToJobs && (service.id === 'intl-rec' || service.id === 'dom-rec') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToJobs();
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>Explore Open Jobs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Service-Specific Workflow Guidance Banner */}
            {service.id === 'exec-search' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-navy-900 dark:text-white">Confidential Executive Search Mandate</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    All submissions are protected under strict Non-Disclosure Protocols. Records are restricted exclusively to authorized Senior Managing Partners.
                  </p>
                </div>
              </div>
            )}

            {service.id === 'dom-rec' && (
              <div className="flex rounded-xl bg-slate-100 dark:bg-navy-950 p-1 border border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, subType: 'employer' }))}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    formData.subType === 'employer'
                      ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-gold-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🏢 Employer Hiring Request
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, subType: 'candidate' }))}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    formData.subType === 'candidate'
                      ? 'bg-white dark:bg-navy-800 text-navy-950 dark:text-gold-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👤 Candidate Job Application
                </button>
              </div>
            )}

            {/* Top Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tariq Al Mansoor"
                  className={`w-full bg-slate-50 dark:bg-navy-950 border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tariq@example.com"
                  className={`w-full bg-slate-50 dark:bg-navy-950 border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                  }`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Phone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+971 50 123 4567"
                  className={`w-full bg-slate-50 dark:bg-navy-950 border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                  }`}
                />
                {formErrors.phone && <p className="text-[10px] text-rose-500">{formErrors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Al Habtoor Contracting LLC"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* DYNAMIC SERVICE-SPECIFIC FIELDS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 dark:text-gold-400 block">
                {service.title} • Specifications & Requirements
              </span>

              {/* 1. Domestic Recruitment / 4. Permanent Staffing */}
              {(service.id === 'dom-rec' || service.id === 'perm-staff') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Target Job Title / Role</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior MEP Project Engineer"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Work Location (Emirate / City)</label>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleInputChange}
                      placeholder="Dubai / Abu Dhabi"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Required Skills</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. AutoCAD, MEP, Project Planning"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">Headcount / Vacancies</label>
                      <input
                        type="number"
                        name="vacancies"
                        min="1"
                        value={formData.vacancies}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block">
                        {service.id === 'perm-staff' ? 'Expected Joining' : 'Salary Range'}
                      </label>
                      <input
                        type="text"
                        name={service.id === 'perm-staff' ? 'joiningDate' : 'salaryRange'}
                        value={service.id === 'perm-staff' ? formData.joiningDate : formData.salaryRange}
                        onChange={handleInputChange}
                        placeholder={service.id === 'perm-staff' ? 'e.g. Immediate / 30 Days' : 'AED 20,000 - 30,000'}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. International Recruitment & 7. Overseas Placement */}
              {(service.id === 'intl-rec' || service.id === 'overseas-place') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Preferred Destination Country</label>
                    <select
                      name="targetCountry"
                      value={formData.targetCountry}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="UAE">United Arab Emirates (Dubai / Abu Dhabi)</option>
                      <option value="Saudi Arabia">Kingdom of Saudi Arabia (Riyadh / Jeddah / NEOM)</option>
                      <option value="Qatar">Qatar (Doha)</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Oman">Oman</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany (EU Blue Card)</option>
                      <option value="Canada">Canada</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Target Job Role</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Registered Nurse / Civil Engineer / Hotel Manager"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="1-3 Years">1 - 3 Years (Junior / Associate)</option>
                      <option value="3-7 Years">3 - 7 Years (Mid-Level Professional)</option>
                      <option value="7-12 Years">7 - 12 Years (Senior / Lead)</option>
                      <option value="12+ Years">12+ Years (Executive / Director)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Key Qualifications</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. B.Tech / MBBS / MBA"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* 3. Executive Search */}
              {service.id === 'exec-search' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Position Title & Seniority</label>
                    <select
                      name="seniority"
                      value={formData.seniority}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="C-Suite (CEO / CFO / COO / CTO)">C-Suite (CEO / CFO / COO / CTO)</option>
                      <option value="Managing Director / General Manager">Managing Director / General Manager</option>
                      <option value="Vice President / Regional Head">Vice President / Regional Head</option>
                      <option value="Senior Director / Division Head">Senior Director / Division Head</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Industry Sector</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Banking & Financial Services (BFSI)">Banking & Financial Services (BFSI)</option>
                      <option value="Real Estate & Infrastructure">Real Estate & Infrastructure</option>
                      <option value="Oil, Gas & Energy">Oil, Gas & Energy</option>
                      <option value="Technology, Cloud & AI">Technology, Cloud & AI</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="Hospitality & Luxury Retail">Hospitality & Luxury Retail</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Hiring Timeline</label>
                    <select
                      name="hiringTimeline"
                      value={formData.hiringTimeline}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Immediate (Within 30 Days)">Immediate (Within 30 Days)</option>
                      <option value="60 Days Target">60 Days Target</option>
                      <option value="90 Days Strategic Plan">90 Days Strategic Plan</option>
                      <option value="Confidential Board Succession">Confidential Board Succession</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Location Requirements</label>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleInputChange}
                      placeholder="Dubai / Abu Dhabi / Riyadh"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* 5. Contract Staffing */}
              {service.id === 'contract-staff' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Contract Duration</label>
                    <select
                      name="contractDuration"
                      value={formData.contractDuration}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="3 Months">3 Months (Short Term Spike)</option>
                      <option value="6 Months">6 Months (Project Milestone)</option>
                      <option value="12 Months">12 Months (Annual Contract)</option>
                      <option value="24 Months">24 Months (Multi-Year Project)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Required Workforce Headcount</label>
                    <input
                      type="number"
                      name="vacancies"
                      min="1"
                      value={formData.vacancies}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Project Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Project End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full bg-white dark:bg-navy-900 border px-3 py-1.5 rounded-xl ${
                        formErrors.endDate ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      }`}
                    />
                    {formErrors.endDate && <p className="text-[10px] text-rose-500">{formErrors.endDate}</p>}
                  </div>
                </div>
              )}

              {/* 6. Bulk Hiring */}
              {service.id === 'bulk-hiring' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Primary Job Category</label>
                    <select
                      name="jobCategory"
                      value={formData.jobCategory}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Hospitality & Culinary">Hospitality & Culinary Crew</option>
                      <option value="Construction & MEP Technicians">Construction & MEP Technicians</option>
                      <option value="Oil & Gas Field Crew">Oil & Gas Field Crew</option>
                      <option value="Logistics, Drivers & Warehousing">Logistics, Drivers & Warehousing</option>
                      <option value="Facilities Management & Cleaning">Facilities Management & Cleaning</option>
                      <option value="Retail & Customer Service">Retail & Customer Service</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Required Worker Volume</label>
                    <select
                      name="vacancies"
                      value={formData.vacancies}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="10-50 Workers">10 - 50 Workers</option>
                      <option value="50-100 Workers">50 - 100 Workers</option>
                      <option value="100-250 Workers">100 - 250 Workers</option>
                      <option value="250-500 Workers">250 - 500 Workers</option>
                      <option value="500+ Workers">500+ Large-Scale Deployment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Shift Requirements</label>
                    <select
                      name="shiftRequirements"
                      value={formData.shiftRequirements}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Standard Day Shift">Standard Day Shift (8-9 hrs)</option>
                      <option value="Rotational Shifts (24/7 Operations)">Rotational Shifts (24/7 Operations)</option>
                      <option value="Night Shift Dedicated">Night Shift Dedicated</option>
                      <option value="Split Shifts">Split Shifts (Hospitality)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Deployment Location</label>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleInputChange}
                      placeholder="Dubai / Abu Dhabi / KSA"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* 8. Visa Assistance & 9. Work Permit Guidance */}
              {(service.id === 'visa-assist' || service.id === 'work-permit') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Destination Jurisdiction</label>
                    <select
                      name="targetCountry"
                      value={formData.targetCountry}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="UAE">UAE (MOHRE / GDRFA / ICP)</option>
                      <option value="Saudi Arabia">Saudi Arabia (Qiwa / Muqeem / Enjaz)</option>
                      <option value="Qatar">Qatar (Ministry of Labour)</option>
                      <option value="Kuwait">Kuwait (PAM / Ministry)</option>
                      <option value="Bahrain">Bahrain (LMRA)</option>
                      <option value="United Kingdom">United Kingdom (Home Office CoS)</option>
                      <option value="Germany">Germany (EU Blue Card)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Visa / Permit Category</label>
                    <select
                      name="visaCategory"
                      value={formData.visaCategory}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="MOHRE Standard Employment Residence Permit">Standard Employment Residence (2-Year)</option>
                      <option value="Golden Visa (10-Year Investor / Specialist)">Golden Visa (10-Year)</option>
                      <option value="Green Visa (5-Year Skilled Worker)">Green Visa (5-Year)</option>
                      <option value="Temporary Mission Work Permit">Temporary Mission Work Permit</option>
                      <option value="Freelance & Remote Work Permit">Freelance & Remote Work Permit</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Current Stage of Processing</label>
                    <select
                      name="currentStage"
                      value={formData.currentStage}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-xl"
                    >
                      <option value="Initial Planning / Not Applied">Initial Planning / Not Applied Yet</option>
                      <option value="Employment Offer Issued">Employment Offer Issued</option>
                      <option value="Quota / Entry Permit In Progress">Quota / Entry Permit In Progress</option>
                      <option value="Medical & Biometrics Scheduling">Medical & Biometrics Scheduling</option>
                      <option value="Residency Stamping & Emirates ID">Residency Stamping & Emirates ID</option>
                    </select>
                  </div>
                </div>
              )}

              {/* CV / Credentials Upload (Supported for all candidate services or employer specs) */}
              {(service.id === 'intl-rec' || service.id === 'overseas-place' || formData.subType === 'candidate' || service.id === 'exec-search') && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      {service.id === 'exec-search' ? 'Executive Bio / Search Brief (Optional)' : 'Upload CV / Resume (Optional)'}
                    </label>
                    <span className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</span>
                  </div>

                  {uploadedCv ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{uploadedCv.originalName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({Math.round(uploadedCv.sizeBytes / 1024)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedCv(null)}
                        className="text-slate-400 hover:text-rose-500 text-[11px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="p-3 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-gold-500 transition group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploadingCv ? (
                        <div className="flex items-center gap-2 text-gold-500 font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Document...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 group-hover:text-gold-500 transition">
                          <Upload className="w-4 h-4" />
                          <span className="font-bold">Choose File to Attach</span>
                        </div>
                      )}
                    </label>
                  )}
                  {uploadError && <p className="text-[10px] text-rose-500 pt-1">{uploadError}</p>}
                </div>
              )}
            </div>

            {/* Detailed Message Textarea */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Requirement Details / Candidate Background <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Provide specific workforce requirements, project scope, qualifications, or consultation goals..."
                className={`w-full bg-slate-50 dark:bg-navy-950 border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  formErrors.message ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                }`}
              />
              {formErrors.message && <p className="text-[10px] text-rose-500">{formErrors.message}</p>}
            </div>

            {/* Optional 1-on-1 Consultation Appointment Booking */}
            <div className="p-3.5 rounded-2xl bg-gold-500/5 dark:bg-navy-950 border border-gold-500/25 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="consultationCall"
                  checked={formData.consultationCall}
                  onChange={handleInputChange}
                  className="rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="font-bold text-navy-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" />
                  <span>Book Free 1-on-1 Strategy & Advisory Consultation</span>
                </span>
              </label>

              {formData.consultationCall && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      name="consultationDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.consultationDate}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 rounded-xl font-semibold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      Time Slot (IST)
                    </label>
                    <select
                      name="consultationTime"
                      value={formData.consultationTime}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 rounded-xl font-semibold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gold-500 cursor-pointer"
                    >
                      <option value="10:00 AM - 11:00 AM IST">10:00 AM - 11:00 AM IST</option>
                      <option value="11:30 AM - 12:30 PM IST">11:30 AM - 12:30 PM IST</option>
                      <option value="02:00 PM - 03:00 PM IST">02:00 PM - 03:00 PM IST</option>
                      <option value="03:30 PM - 04:30 PM IST">03:30 PM - 04:30 PM IST</option>
                      <option value="05:00 PM - 06:00 PM IST">05:00 PM - 06:00 PM IST</option>
                      <option value="06:30 PM - 07:30 PM IST">06:30 PM - 07:30 PM IST</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      Session Mode
                    </label>
                    <select
                      name="consultationMode"
                      value={formData.consultationMode}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 px-2.5 py-1.5 rounded-xl font-semibold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gold-500 cursor-pointer"
                    >
                      <option value="Virtual Video Call (Google Meet / Zoom)">Virtual Video Call (Google Meet / Zoom)</option>
                      <option value="Direct Phone Call">Direct Phone Call</option>
                      <option value="WhatsApp Video Call">WhatsApp Video Call</option>
                      <option value="In-Person (India HQ Office, Chennai)">In-Person (India HQ Office, Chennai)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Compliance & Consent */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-navy-800">
              {/* Compliance Disclaimers for Visa & Overseas Placement */}
              {(service.id === 'visa-assist' || service.id === 'work-permit' || service.id === 'overseas-place') && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-slate-100 dark:bg-navy-950 p-2.5 rounded-xl border border-slate-200 dark:border-navy-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500 inline mr-1 -mt-0.5" />
                  <strong>Regulatory Transparency:</strong> Revival International operates strictly in compliance with MOHRE and official destination immigration guidelines. We provide certified advisory, quota administration, and application filing support; we do not guarantee approvals or issue unsupported legal claims.
                </p>
              )}

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  I authorize Revival International to review my information and contact me via Phone, Email, or WhatsApp regarding this service request.
                </span>
              </label>
              {formErrors.consent && <p className="text-[10px] text-rose-500">{formErrors.consent}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-navy-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingCv}
                className="flex-1 py-2.5 rounded-xl bg-gold-shimmer text-navy-950 font-bold shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Service Request</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceEnquiryModal;

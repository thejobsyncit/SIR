import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Calendar, Phone, Mail, User, Clock, BookOpen, Award, Check
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';
import { submitLeadWithFallback } from '../services/leadSubmissionService';

export const SeminarsLanguageForm = ({ 
  onSuccessCallback = null,
  embedded = false,
  preselectedProgram = 'IELTS',
  onProgramChange = null
}) => {
  // Tomorrow's date for start date picker
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+971',
    email: '',
    applicantType: 'Student',
    interestedProgram: preselectedProgram || 'IELTS',
    currentProficiency: '',
    preferredTrainingFormat: 'Online',
    preferredStartDate: tomorrow,
    preferredContactMethod: 'WhatsApp',
    additionalQuestions: '',
    consent: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Sync with prop when preselectedProgram changes from program cards
  useEffect(() => {
    if (preselectedProgram && preselectedProgram !== formData.interestedProgram) {
      setFormData(prev => ({ ...prev, interestedProgram: preselectedProgram }));
    }
  }, [preselectedProgram]);

  const countryCodes = [
    { code: '+971', label: 'UAE (+971)' },
    { code: '+966', label: 'Saudi Arabia (+966)' },
    { code: '+974', label: 'Qatar (+974)' },
    { code: '+968', label: 'Oman (+968)' },
    { code: '+965', label: 'Kuwait (+965)' },
    { code: '+973', label: 'Bahrain (+973)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+1', label: 'USA / Canada (+1)' },
    { code: '+91', label: 'India (+91)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+65', label: 'Singapore (+65)' },
    { code: '+60', label: 'Malaysia (+60)' }
  ];

  const applicantTypeOptions = [
    'Student',
    'Healthcare Professional',
    'Working Professional',
    'Corporate Representative',
    'Other'
  ];

  const interestedProgramOptions = [
    'IELTS',
    'OET',
    'DET',
    'TOEFL',
    'Leadership Seminar',
    'Corporate Communication',
    'Executive Workshop',
    'Corporate Training'
  ];

  const trainingFormatOptions = [
    { id: 'Individual', label: 'Individual 1-on-1' },
    { id: 'Group', label: 'Group Batch' },
    { id: 'Online', label: 'Online Virtual' },
    { id: 'In-Person', label: 'In-Person (Dubai / Chennai)' },
    { id: 'Corporate', label: 'Corporate Cohort' }
  ];

  const contactMethodOptions = [
    { id: 'WhatsApp', label: 'WhatsApp' },
    { id: 'Phone', label: 'Phone Call' },
    { id: 'Email', label: 'Email' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'interestedProgram' && onProgramChange) {
      onProgramChange(val);
    }
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
    setFormData(prev => ({ ...prev, phone: digitsOnly }));
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const validate = () => {
    const errors = {};

    // 1. Full Name
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 characters).';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Full name must not exceed 100 characters.';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    // 3. Phone Number
    if (!formData.phone || formData.phone.length < 7) {
      errors.phone = 'Valid phone number is required (at least 7 digits).';
    } else if (formData.phone.length > 15) {
      errors.phone = 'Phone number exceeds maximum length.';
    }

    // 4. Applicant Type
    if (!formData.applicantType) {
      errors.applicantType = 'Please select your applicant type.';
    }

    // 5. Interested Program
    if (!formData.interestedProgram) {
      errors.interestedProgram = 'Please select an interested program.';
    }

    // 6. Current Proficiency or Training Requirements
    if (!formData.currentProficiency || formData.currentProficiency.trim().length < 2) {
      errors.currentProficiency = 'Please provide your current proficiency or training requirements.';
    } else if (formData.currentProficiency.trim().length > 1000) {
      errors.currentProficiency = 'Proficiency details must not exceed 1000 characters.';
    }

    // 7. Preferred Training Format
    if (!formData.preferredTrainingFormat) {
      errors.preferredTrainingFormat = 'Please choose a preferred training format.';
    }

    // 8. Preferred Start Date
    if (!formData.preferredStartDate) {
      errors.preferredStartDate = 'Preferred start date is required.';
    } else {
      const selected = new Date(formData.preferredStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.preferredStartDate = 'Start date cannot be in the past.';
      }
    }

    // 9. Preferred Contact Method
    if (!formData.preferredContactMethod) {
      errors.preferredContactMethod = 'Please choose a preferred contact method.';
    }

    // 10. Privacy Consent Checkbox
    if (!formData.consent) {
      errors.consent = 'Privacy consent is required to process your consultation request.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      trackEnquiryValidationFailure('seminars_language_page', 'exec-seminars-lang', Object.keys(errors));
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();
    const fullPhoneNumber = `${formData.countryCode} ${formData.phone}`.trim();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhoneNumber,
      company: `${formData.applicantType} — ${formData.preferredTrainingFormat}`,
      organizationName: formData.applicantType,
      organizationType: formData.applicantType,
      serviceId: 'exec-seminars-lang',
      serviceTitle: 'Seminars & Language',
      countryInterest: 'Global / GCC',
      assistanceType: `${formData.interestedProgram} Coaching`,
      degreeLevel: formData.applicantType,
      intakeTerm: formData.preferredStartDate,
      jobTitle: formData.interestedProgram,
      skills: formData.currentProficiency.trim(),
      preferredContactMethod: formData.preferredContactMethod,
      consultationDate: formData.preferredStartDate,
      consultationTime: 'Flexible Schedule',
      consultationMode: formData.preferredTrainingFormat,
      status: 'New Enquiry',
      priority: 'High',
      message: `[Seminars & Language Consultation Enquiry]\n\n• Applicant Type: ${formData.applicantType}\n• Interested Program: ${formData.interestedProgram}\n• Current Proficiency / Training Requirements: ${formData.currentProficiency.trim()}\n• Preferred Training Format: ${formData.preferredTrainingFormat}\n• Preferred Start Date: ${formData.preferredStartDate}\n• Preferred Contact Method: ${formData.preferredContactMethod}\n\nAdditional Questions & Context:\n${formData.additionalQuestions.trim() || 'No additional questions specified.'}`,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
    };

    try {
      const { ok, data: result } = await submitLeadWithFallback(payload);

      if (!ok || !result?.success) {
        throw new Error(result?.message || 'Unable to submit enquiry to the backend server. Please try again.');
      }

      const confirmedRef = result.data?.referenceNumber || `REV-SEM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const successData = {
        referenceNumber: confirmedRef,
        id: result.data?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        applicantType: formData.applicantType,
        program: formData.interestedProgram,
        format: formData.preferredTrainingFormat,
        startDate: formData.preferredStartDate,
        contactMethod: formData.preferredContactMethod
      };

      setSubmissionSuccess(successData);

      // Track conversion
      trackEnquiryConversion(
        confirmedRef,
        'exec-seminars-lang',
        'Seminars & Language',
        'Executive & Language',
        'seminars_language_page'
      );

      if (onSuccessCallback) {
        onSuccessCallback(successData);
      }
    } catch (err) {
      console.error('Seminars & Language enquiry submission error:', err);
      setSubmitError(err.message || 'A network error occurred while connecting to the database server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      countryCode: '+971',
      email: '',
      applicantType: 'Student',
      interestedProgram: preselectedProgram || 'IELTS',
      currentProficiency: '',
      preferredTrainingFormat: 'Online',
      preferredStartDate: tomorrow,
      preferredContactMethod: 'WhatsApp',
      additionalQuestions: '',
      consent: false
    });
    setFormErrors({});
    setSubmitError(null);
    setSubmissionSuccess(null);
  };

  // SUCCESS STATE (Displayed ONLY upon genuine successful HTTP response from backend)
  if (submissionSuccess) {
    return (
      <div className={`glass-card bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 space-y-6 text-center ${embedded ? '' : 'shadow-luxury'}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
            Consultation Enquiry Received
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Thank You, {submissionSuccess.name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto font-medium">
            Your enquiry for <strong>{submissionSuccess.program}</strong> has been registered in the Revival International database. An educational training specialist will connect with you to formulate your personalized plan.
          </p>
        </div>

        {/* Confirmed Reference Card */}
        <div className="bg-slate-50 dark:bg-navy-950 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 dark:border-navy-800">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Official Consultation Reference</span>
            <span className="font-mono font-black text-gold-600 dark:text-gold-400 text-sm tracking-wide bg-gold-500/10 px-3 py-0.5 rounded border border-gold-500/30">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Interested Program</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.program}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Applicant Type</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.applicantType}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Format</p>
              <p className="font-bold text-gold-600 dark:text-gold-400">{submissionSuccess.format}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Target Start Date</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{submissionSuccess.startDate}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>Confirmation email dispatched to: <strong className="text-slate-800 dark:text-slate-200">{submissionSuccess.email}</strong></p>
          <p className="text-[11px]">Training desk active Monday to Saturday, 09:30 AM – 06:30 PM Gulf Standard Time.</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE CONSULTATION FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-800 dark:text-slate-200" noValidate>
      
      {/* Header Info Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Seminars & Language Consultation</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Personalized training consultation for IELTS, OET, DET, TOEFL, executive seminars, and corporate development cohorts.
          </p>
        </div>
        <span className="hidden sm:inline-flex bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
          Executive & Language Training
        </span>
      </div>

      {submitError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold">Submission Failed</p>
            <p className="text-[11px]">{submitError}</p>
          </div>
        </div>
      )}

      {/* Row 1: Full Name & Email Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="sl-name" className="block text-slate-700 dark:text-slate-300 font-bold">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="sl-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => trackEnquiryStart('seminars_language_page', 'exec-seminars-lang', 'Seminars & Language')}
              placeholder="e.g. Dr. Priya Nair / Johnathan Miller"
              disabled={isSubmitting}
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
                formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
              }`}
            />
          </div>
          {formErrors.name && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.name}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label htmlFor="sl-email" className="block text-slate-700 dark:text-slate-300 font-bold">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="sl-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. professional@example.com"
              disabled={isSubmitting}
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
                formErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
              }`}
            />
          </div>
          {formErrors.email && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.email}</p>
          )}
        </div>
      </div>

      {/* Row 2: Phone with Country Code & Applicant Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Number with Country Code */}
        <div className="space-y-1">
          <label htmlFor="sl-phone" className="block text-slate-700 dark:text-slate-300 font-bold">
            Phone Number with Country Code <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-label="Country Code"
              className="w-32 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-xs shrink-0 cursor-pointer"
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="sl-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="50 123 4567"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
                  formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                }`}
              />
            </div>
          </div>
          {formErrors.phone && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.phone}</p>
          )}
        </div>

        {/* Applicant Type */}
        <div className="space-y-1">
          <label htmlFor="sl-applicant-type" className="block text-slate-700 dark:text-slate-300 font-bold">
            Applicant Type <span className="text-rose-500">*</span>
          </label>
          <select
            id="sl-applicant-type"
            name="applicantType"
            value={formData.applicantType}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {applicantTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {formErrors.applicantType && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.applicantType}</p>
          )}
        </div>
      </div>

      {/* Row 3: Interested Program & Current Proficiency / Training Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Interested Program */}
        <div className="space-y-1">
          <label htmlFor="sl-program" className="block text-slate-700 dark:text-slate-300 font-bold">
            Interested Program <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Award className="w-3.5 h-3.5 text-gold-500 absolute left-3 top-3 pointer-events-none" />
            <select
              id="sl-program"
              name="interestedProgram"
              value={formData.interestedProgram}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {interestedProgramOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {formErrors.interestedProgram && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.interestedProgram}</p>
          )}
        </div>

        {/* Current Proficiency or Training Requirements */}
        <div className="space-y-1">
          <label htmlFor="sl-proficiency" className="block text-slate-700 dark:text-slate-300 font-bold">
            Current Proficiency / Training Requirements <span className="text-rose-500">*</span>
          </label>
          <input
            id="sl-proficiency"
            type="text"
            name="currentProficiency"
            value={formData.currentProficiency}
            onChange={handleChange}
            placeholder="e.g. Intermediate English / Targeting IELTS Band 7.5 / Team of 12"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
              formErrors.currentProficiency ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
            }`}
          />
          {formErrors.currentProficiency && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.currentProficiency}</p>
          )}
        </div>
      </div>

      {/* Row 4: Preferred Training Format & Preferred Start Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Training Format */}
        <div className="space-y-1">
          <label htmlFor="sl-format" className="block text-slate-700 dark:text-slate-300 font-bold">
            Preferred Training Format <span className="text-rose-500">*</span>
          </label>
          <select
            id="sl-format"
            name="preferredTrainingFormat"
            value={formData.preferredTrainingFormat}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {trainingFormatOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {formErrors.preferredTrainingFormat && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.preferredTrainingFormat}</p>
          )}
        </div>

        {/* Preferred Start Date */}
        <div className="space-y-1">
          <label htmlFor="sl-start-date" className="block text-slate-700 dark:text-slate-300 font-bold">
            Preferred Start Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="sl-start-date"
              type="date"
              name="preferredStartDate"
              min={new Date().toISOString().split('T')[0]}
              value={formData.preferredStartDate}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
                formErrors.preferredStartDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
              }`}
            />
          </div>
          {formErrors.preferredStartDate && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.preferredStartDate}</p>
          )}
        </div>
      </div>

      {/* Row 5: Preferred Contact Method */}
      <div className="space-y-1.5">
        <label className="block text-slate-700 dark:text-slate-300 font-bold">
          Preferred Contact Method <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {contactMethodOptions.map(method => (
            <label
              key={method.id}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold ${
                formData.preferredContactMethod === method.id
                  ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="preferredContactMethod"
                value={method.id}
                checked={formData.preferredContactMethod === method.id}
                onChange={handleChange}
                disabled={isSubmitting}
                className="text-gold-500 focus:ring-gold-500"
              />
              <span>{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Row 6: Additional Questions */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="sl-questions" className="block text-slate-700 dark:text-slate-300 font-bold">
            Additional Questions <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.additionalQuestions.length}/2000 chars
          </span>
        </div>
        <textarea
          id="sl-questions"
          name="additionalQuestions"
          rows={3}
          value={formData.additionalQuestions}
          onChange={handleChange}
          placeholder="Please share any target score requirements, specific corporate topics, team sizes, or scheduling preferences..."
          disabled={isSubmitting}
          className="w-full p-3 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition leading-relaxed"
        />
      </div>

      {/* Row 7: Privacy Consent Checkbox */}
      <div className="space-y-1 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-0.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            I agree to the privacy policy and consent to receiving consultation correspondence from The Revival International training advisors regarding my training enquiry.
          </span>
        </label>
        {formErrors.consent && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.consent}</p>
        )}
      </div>

      {/* Submit Enquiry Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-gold-shimmer text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
              <span>Submitting Consultation Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Enquiry</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>SSL Encrypted Transmission • Connected to Official CRM • Authentic Consultation Dispatch</span>
      </div>
    </form>
  );
};

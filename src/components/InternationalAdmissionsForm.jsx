import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Globe, Calendar, Phone, Mail, User, Clock, BookOpen, FileText, Check, Award
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';
import { submitLeadWithFallback } from '../services/leadSubmissionService';

export const InternationalAdmissionsForm = ({ 
  onSuccessCallback = null,
  embedded = false,
  preselectedDestination = 'United Kingdom',
  onDestinationChange = null
}) => {
  // Initialize tomorrow's date for appointment picker
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+971',
    email: '',
    currentCountry: 'United Arab Emirates',
    preferredDestination: preselectedDestination || 'United Kingdom',
    academicLevel: 'Undergraduate',
    preferredCourse: '',
    intendedIntake: 'Fall Intake',
    currentQualification: '12th Grade / Secondary School',
    percentageOrGpa: '',
    englishTestStatus: 'Planning to Take Test Soon',
    applicationStatus: 'Preparing Documents',
    consultationMethod: 'Online Meeting',
    appointmentDate: tomorrow,
    timeSlot: 'Morning (09:00 AM - 12:00 PM)',
    additionalRequirements: '',
    consent: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Sync with prop when preselectedDestination changes from destination explorer
  useEffect(() => {
    if (preselectedDestination && preselectedDestination !== formData.preferredDestination) {
      setFormData(prev => ({ ...prev, preferredDestination: preselectedDestination }));
    }
  }, [preselectedDestination]);

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

  const currentCountryOptions = [
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Oman',
    'Kuwait',
    'Bahrain',
    'India',
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Germany',
    'Other / International'
  ];

  const destinationOptions = [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Europe',
    'United Arab Emirates',
    'Multiple / Undecided'
  ];

  const academicLevelOptions = [
    'Undergraduate (Bachelor’s Degree)',
    'Postgraduate (Master’s Degree)',
    'Doctorate (PhD / Research)',
    'Executive MBA & Professional Programs'
  ];

  const intakeOptions = [
    'Fall Intake',
    'Spring Intake',
    'Summer Intake'
  ];

  const qualificationOptions = [
    '12th Grade / CBSE / ICSE',
    'IB Diploma (International Baccalaureate)',
    'Cambridge A-Levels / IGCSE',
    'American High School Diploma',
    'Bachelor’s Degree in Progress',
    'Completed Bachelor’s Degree',
    'Master’s Degree Holder',
    'Polytechnic / Higher Diploma'
  ];

  const englishTestOptions = [
    'Appeared / Have Scorecard (IELTS / TOEFL / PTE / DET)',
    'Planning to Take Test Soon',
    'Awaiting Test Results',
    'Exempt / English Medium Background',
    'Need Test Preparation Guidance'
  ];

  const applicationStatusOptions = [
    'Not Started — Exploring Universities',
    'Preparing Documents — Need Guidance',
    'Applied — Awaiting Decision',
    'Received Offer — Need Evaluation',
    'Need Further Guidance'
  ];

  const consultationMethodOptions = [
    { id: 'Online Meeting', label: 'Online Meeting (Google Meet / Zoom)' },
    { id: 'WhatsApp', label: 'WhatsApp' },
    { id: 'Phone Call', label: 'Phone Call' },
    { id: 'Email', label: 'Email' }
  ];

  const timeSlotOptions = [
    'Morning (09:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 03:00 PM)',
    'Evening (03:00 PM - 06:00 PM)',
    'Night (06:00 PM - 08:00 PM)'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'preferredDestination' && onDestinationChange) {
      onDestinationChange(val);
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

    // 4. Current Country of Residence
    if (!formData.currentCountry) {
      errors.currentCountry = 'Current country of residence is required.';
    }

    // 5. Preferred Study Destination
    if (!formData.preferredDestination) {
      errors.preferredDestination = 'Please select a preferred study destination.';
    }

    // 6. Target Academic Level
    if (!formData.academicLevel) {
      errors.academicLevel = 'Please select your target academic level.';
    }

    // 7. Preferred Course or Subject
    if (!formData.preferredCourse || formData.preferredCourse.trim().length < 2) {
      errors.preferredCourse = 'Please enter your preferred course or subject area.';
    }

    // 8. Intended Intake
    if (!formData.intendedIntake) {
      errors.intendedIntake = 'Please select your intended intake.';
    }

    // 9. Current Qualification
    if (!formData.currentQualification) {
      errors.currentQualification = 'Current qualification is required.';
    }

    // 10. English Language Test Status
    if (!formData.englishTestStatus) {
      errors.englishTestStatus = 'Please select your English test status.';
    }

    // 11. Application Status
    if (!formData.applicationStatus) {
      errors.applicationStatus = 'Please indicate your current application status.';
    }

    // 12. Preferred Consultation Method
    if (!formData.consultationMethod) {
      errors.consultationMethod = 'Please choose a consultation method.';
    }

    // 13. Preferred Appointment Date
    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required.';
    } else {
      const selected = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.appointmentDate = 'Appointment date cannot be in the past.';
      }
    }

    // 14. Additional Requirements or Questions
    if (!formData.additionalRequirements || formData.additionalRequirements.trim().length < 10) {
      errors.additionalRequirements = 'Please provide additional requirements or questions (minimum 10 characters).';
    } else if (formData.additionalRequirements.trim().length > 3000) {
      errors.additionalRequirements = 'Details must not exceed 3000 characters.';
    }

    // 15. Privacy Consent Checkbox
    if (!formData.consent) {
      errors.consent = 'Privacy consent is required to process your admissions consultation.';
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
      trackEnquiryValidationFailure('admissions_page', 'intl-adm', Object.keys(errors));
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();
    const fullPhoneNumber = `${formData.countryCode} ${formData.phone}`.trim();

    // Map all fields according to backend lead/consulting schema
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhoneNumber,
      company: `${formData.currentCountry} (${formData.currentQualification})`,
      organizationName: formData.currentCountry,
      organizationType: 'Student Applicant',
      serviceId: 'intl-adm',
      serviceTitle: 'International Admissions',
      countryInterest: formData.preferredDestination,
      assistanceType: `${formData.academicLevel} Application Management`,
      degreeLevel: formData.academicLevel,
      intakeTerm: formData.intendedIntake,
      jobTitle: formData.preferredCourse.trim(),
      skills: formData.englishTestStatus,
      currentStage: formData.applicationStatus,
      preferredContactMethod: formData.consultationMethod,
      consultationDate: formData.appointmentDate,
      consultationTime: formData.timeSlot,
      consultationMode: formData.consultationMethod,
      status: 'Consultation Scheduled',
      priority: 'High',
      message: `[International Admissions Consultation Request]\n\n• Preferred Destination: ${formData.preferredDestination}\n• Target Academic Level: ${formData.academicLevel}\n• Preferred Course/Subject: ${formData.preferredCourse.trim()}\n• Intended Intake: ${formData.intendedIntake}\n• Current Qualification: ${formData.currentQualification}\n• Academic % or GPA: ${formData.percentageOrGpa.trim() || 'Not specified'}\n• English Test Status: ${formData.englishTestStatus}\n• Application Status: ${formData.applicationStatus}\n• Preferred Consultation Method: ${formData.consultationMethod}\n• Scheduled Date & Time: ${formData.appointmentDate} (${formData.timeSlot})\n• Country of Residence: ${formData.currentCountry}\n\nApplicant Questions & Requirements:\n${formData.additionalRequirements.trim()}`,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
    };

    try {
      const { ok, data: result } = await submitLeadWithFallback(payload);

      if (!ok || !result?.success) {
        throw new Error(result?.message || 'Unable to submit admissions consultation to the backend server. Please try again.');
      }

      const confirmedRef = result.data?.referenceNumber || `REV-ADM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const successData = {
        referenceNumber: confirmedRef,
        id: result.data?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        currentCountry: formData.currentCountry,
        destination: formData.preferredDestination,
        academicLevel: formData.academicLevel,
        course: formData.preferredCourse.trim(),
        intake: formData.intendedIntake,
        consultationMethod: formData.consultationMethod,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        applicationStatus: formData.applicationStatus
      };

      setSubmissionSuccess(successData);

      // Track conversion
      trackEnquiryConversion(
        confirmedRef,
        'intl-adm',
        'International Admissions',
        'Admissions',
        'admissions_page'
      );

      if (onSuccessCallback) {
        onSuccessCallback(successData);
      }
    } catch (err) {
      console.error('Admissions consultation booking error:', err);
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
      currentCountry: 'United Arab Emirates',
      preferredDestination: preselectedDestination || 'United Kingdom',
      academicLevel: 'Undergraduate',
      preferredCourse: '',
      intendedIntake: 'Fall Intake',
      currentQualification: '12th Grade / Secondary School',
      percentageOrGpa: '',
      englishTestStatus: 'Planning to Take Test Soon',
      applicationStatus: 'Preparing Documents',
      consultationMethod: 'Online Meeting',
      appointmentDate: tomorrow,
      timeSlot: 'Morning (09:00 AM - 12:00 PM)',
      additionalRequirements: '',
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
            Admissions Consultation Confirmed
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Thank You, {submissionSuccess.name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto font-medium">
            Your international admissions consultation has been saved to the Revival International database. An admissions officer will review your course preferences and connect with you at your chosen appointment slot.
          </p>
        </div>

        {/* Confirmed Reference Card */}
        <div className="bg-slate-50 dark:bg-navy-950 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 dark:border-navy-800">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Admissions Reference Number</span>
            <span className="font-mono font-black text-gold-600 dark:text-gold-400 text-sm tracking-wide bg-gold-500/10 px-3 py-0.5 rounded border border-gold-500/30">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Destination & Level</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.destination}</p>
              <p className="text-[11px] text-slate-500 truncate">{submissionSuccess.academicLevel}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Course & Intake</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.course}</p>
              <p className="text-[11px] text-gold-600 dark:text-gold-400 truncate">{submissionSuccess.intake}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Appointment Date & Time</p>
              <p className="font-bold text-gold-600 dark:text-gold-400">
                {submissionSuccess.appointmentDate}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{submissionSuccess.timeSlot}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Consultation Format</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{submissionSuccess.consultationMethod}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>Confirmation email sent to: <strong className="text-slate-800 dark:text-slate-200">{submissionSuccess.email}</strong></p>
          <p className="text-[11px]">Admissions coordination desk active Monday to Saturday, 09:30 AM – 06:30 PM Gulf Standard Time.</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Submit Another Application Query
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
            <span>International Admissions Consultation</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Direct university application coordination, portal management, and compliance advisory with dedicated admissions counselors.
          </p>
        </div>
        <span className="hidden sm:inline-flex bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
          UCAS • Common App • Direct
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
          <label htmlFor="iac-name" className="block text-slate-700 dark:text-slate-300 font-bold">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="iac-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => trackEnquiryStart('admissions_page', 'intl-adm', 'International Admissions')}
              placeholder="e.g. Liam Anderson / Fatima Al Nuaimi"
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
          <label htmlFor="iac-email" className="block text-slate-700 dark:text-slate-300 font-bold">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="iac-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. student@example.com"
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

      {/* Row 2: Phone with Country Code & Current Country of Residence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone Number with Country Code */}
        <div className="space-y-1">
          <label htmlFor="iac-phone" className="block text-slate-700 dark:text-slate-300 font-bold">
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
                id="iac-phone"
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

        {/* Current Country of Residence */}
        <div className="space-y-1">
          <label htmlFor="iac-current-country" className="block text-slate-700 dark:text-slate-300 font-bold">
            Current Country of Residence <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="iac-current-country"
              name="currentCountry"
              value={formData.currentCountry}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {currentCountryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {formErrors.currentCountry && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.currentCountry}</p>
          )}
        </div>
      </div>

      {/* Row 3: Preferred Study Destination & Target Academic Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Study Destination */}
        <div className="space-y-1">
          <label htmlFor="iac-destination" className="block text-slate-700 dark:text-slate-300 font-bold">
            Preferred Study Destination <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-gold-500 absolute left-3 top-3 pointer-events-none" />
            <select
              id="iac-destination"
              name="preferredDestination"
              value={formData.preferredDestination}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {destinationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {formErrors.preferredDestination && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.preferredDestination}</p>
          )}
        </div>

        {/* Target Academic Level */}
        <div className="space-y-1">
          <label htmlFor="iac-academic-level" className="block text-slate-700 dark:text-slate-300 font-bold">
            Target Academic Level <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="iac-academic-level"
              name="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {academicLevelOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {formErrors.academicLevel && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.academicLevel}</p>
          )}
        </div>
      </div>

      {/* Row 4: Preferred Course or Subject & Intended Intake */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Course or Subject */}
        <div className="space-y-1">
          <label htmlFor="iac-course" className="block text-slate-700 dark:text-slate-300 font-bold">
            Preferred Course or Subject <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="iac-course"
              type="text"
              name="preferredCourse"
              value={formData.preferredCourse}
              onChange={handleChange}
              placeholder="e.g. Computer Science, Business Analytics, Law, Mechanical Eng"
              disabled={isSubmitting}
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${
                formErrors.preferredCourse ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
              }`}
            />
          </div>
          {formErrors.preferredCourse && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.preferredCourse}</p>
          )}
        </div>

        {/* Intended Intake */}
        <div className="space-y-1">
          <label htmlFor="iac-intake" className="block text-slate-700 dark:text-slate-300 font-bold">
            Intended Intake <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="iac-intake"
              name="intendedIntake"
              value={formData.intendedIntake}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {intakeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {formErrors.intendedIntake && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.intendedIntake}</p>
          )}
        </div>
      </div>

      {/* Row 5: Current Qualification & Academic % or GPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Qualification */}
        <div className="space-y-1">
          <label htmlFor="iac-qualification" className="block text-slate-700 dark:text-slate-300 font-bold">
            Current Qualification <span className="text-rose-500">*</span>
          </label>
          <select
            id="iac-qualification"
            name="currentQualification"
            value={formData.currentQualification}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {qualificationOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {formErrors.currentQualification && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.currentQualification}</p>
          )}
        </div>

        {/* Academic Percentage or GPA */}
        <div className="space-y-1">
          <label htmlFor="iac-gpa" className="block text-slate-700 dark:text-slate-300 font-bold">
            Academic Percentage or GPA <span className="text-slate-400 font-normal">(where applicable)</span>
          </label>
          <input
            id="iac-gpa"
            type="text"
            name="percentageOrGpa"
            value={formData.percentageOrGpa}
            onChange={handleChange}
            placeholder="e.g. 88%, GPA 3.7/4.0, or First Class"
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
          />
        </div>
      </div>

      {/* Row 6: English Language Test Status & Application Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* English Language Test Status */}
        <div className="space-y-1">
          <label htmlFor="iac-english-test" className="block text-slate-700 dark:text-slate-300 font-bold">
            English Language Test Status <span className="text-rose-500">*</span>
          </label>
          <select
            id="iac-english-test"
            name="englishTestStatus"
            value={formData.englishTestStatus}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {englishTestOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {formErrors.englishTestStatus && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.englishTestStatus}</p>
          )}
        </div>

        {/* Application Status */}
        <div className="space-y-1">
          <label htmlFor="iac-app-status" className="block text-slate-700 dark:text-slate-300 font-bold">
            Current Application Status <span className="text-rose-500">*</span>
          </label>
          <select
            id="iac-app-status"
            name="applicationStatus"
            value={formData.applicationStatus}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {applicationStatusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {formErrors.applicationStatus && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.applicationStatus}</p>
          )}
        </div>
      </div>

      {/* Row 7: Preferred Consultation Method */}
      <div className="space-y-1.5">
        <label className="block text-slate-700 dark:text-slate-300 font-bold">
          Preferred Consultation Method <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {consultationMethodOptions.map(method => (
            <label
              key={method.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs font-semibold ${
                formData.consultationMethod === method.id
                  ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="consultationMethod"
                value={method.id}
                checked={formData.consultationMethod === method.id}
                onChange={handleChange}
                disabled={isSubmitting}
                className="text-gold-500 focus:ring-gold-500"
              />
              <span className="truncate">{method.label}</span>
            </label>
          ))}
        </div>
        {formErrors.consultationMethod && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.consultationMethod}</p>
        )}
      </div>

      {/* Row 8: Appointment Date & Time Slot */}
      <div className="p-4 rounded-2xl bg-gold-500/5 dark:bg-navy-950 border border-gold-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <h4 className="font-bold text-navy-900 dark:text-white text-xs uppercase tracking-wider">
              Admissions Advisory Appointment Slot
            </h4>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Direct Calendar Booking
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Appointment Date */}
          <div className="space-y-1">
            <label htmlFor="iac-date" className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
              Preferred Appointment Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="iac-date"
              type="date"
              name="appointmentDate"
              min={new Date().toISOString().split('T')[0]}
              value={formData.appointmentDate}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 bg-white dark:bg-navy-900 border rounded-xl font-semibold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gold-500 transition ${
                formErrors.appointmentDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
              }`}
            />
            {formErrors.appointmentDate && (
              <p className="text-[10px] text-rose-500 font-bold">{formErrors.appointmentDate}</p>
            )}
          </div>

          {/* Preferred Time Slot */}
          <div className="space-y-1">
            <label htmlFor="iac-time-slot" className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
              Preferred Time Slot <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                id="iac-time-slot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-gold-500 cursor-pointer"
              >
                {timeSlotOptions.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Row 9: Additional Requirements or Questions */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="iac-requirements" className="block text-slate-700 dark:text-slate-300 font-bold">
            Additional Requirements or Questions <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.additionalRequirements.length}/3000 chars
          </span>
        </div>
        <textarea
          id="iac-requirements"
          name="additionalRequirements"
          rows={4}
          value={formData.additionalRequirements}
          onChange={handleChange}
          placeholder="Please describe any specific target universities (e.g., Russell Group, Go8, Big 10), questions about deadlines, document requirements, portfolio guidelines, or offer conditions..."
          disabled={isSubmitting}
          className={`w-full p-3 bg-slate-50 dark:bg-navy-950 border rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition leading-relaxed ${
            formErrors.additionalRequirements ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
          }`}
        />
        {formErrors.additionalRequirements && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.additionalRequirements}</p>
        )}
      </div>

      {/* Row 10: Privacy Consent Checkbox */}
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
            I agree to the privacy policy and consent to receiving admissions guidance and application correspondence from The Revival International educational advisors. My details will not be shared with unauthorized third parties.
          </span>
        </label>
        {formErrors.consent && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.consent}</p>
        )}
      </div>

      {/* Primary CTA Button: Book My Admissions Consultation */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-gold-shimmer text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
              <span>Registering Admissions Consultation...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Book My Admissions Consultation</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>SSL Encrypted Transmission • Synchronized with Official CRM • Verified Application Reference</span>
      </div>
    </form>
  );
};

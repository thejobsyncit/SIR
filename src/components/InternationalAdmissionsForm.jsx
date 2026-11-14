import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Globe, Calendar, Phone, Mail, User, Clock, BookOpen, FileText, Check, Award,
  ChevronRight, ChevronLeft, Building2, GraduationCap, MapPin
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

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // 1-4. Personal Information
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    currentCountry: 'United Arab Emirates',

    // 5-10. Academic Information
    preferredDestination: preselectedDestination || 'United Kingdom',
    academicLevel: 'Undergraduate',
    preferredCourse: '',
    currentQualification: '12th Grade / CBSE / ICSE',
    percentageOrGpa: '',
    englishTestStatus: 'Planning to Take Test Soon',

    // 11-12. Application Information
    applicationStatus: 'Shortlisting Universities',
    intendedIntake: 'Fall Intake',

    // 13-17. Consultation Preferences
    consultationMethod: 'Online Meeting (Google Meet / Zoom)',
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
      setCurrentStep(2);
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

  const destinationOptions = [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Europe',
    'United Arab Emirates'
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
    'Germany / EU',
    'Other / International'
  ];

  const academicLevelOptions = [
    'Undergraduate (Bachelor’s Degree)',
    'Postgraduate (Master’s Degree)',
    'Doctoral / PhD',
    'Diploma / Foundation',
    'Other Academic Program'
  ];

  const qualificationOptions = [
    '12th Grade / CBSE / ICSE',
    'Diploma / Polytechnic',
    'Bachelor’s Degree',
    'Master’s Degree',
    'Other Qualification'
  ];

  const englishTestOptions = [
    'IELTS',
    'TOEFL',
    'PTE',
    'Duolingo',
    'Planning to Take Test Soon',
    'Not Yet Started'
  ];

  const applicationStatusOptions = [
    'Not Started – Exploring Universities',
    'Shortlisting Universities',
    'Applications in Progress',
    'Received Conditional Offer',
    'Received Unconditional Offer'
  ];

  const intakeOptions = [
    'Fall Intake',
    'Spring Intake',
    'Summer Intake',
    'Flexible'
  ];

  const consultationMethodOptions = [
    { id: 'Online Meeting (Google Meet / Zoom)', label: 'Online Meeting (Google Meet / Zoom)' },
    { id: 'WhatsApp', label: 'WhatsApp Call / Chat' },
    { id: 'Phone Call', label: 'Direct Phone Call' },
    { id: 'Email', label: 'Email Advisory' }
  ];

  const timeSlotOptions = [
    'Morning (09:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 03:00 PM)',
    'Evening (03:00 PM - 06:00 PM)'
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

  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Full name is required (minimum 2 characters).';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email.trim())) {
        errors.email = 'Please provide a valid email address.';
      }
      if (!formData.phone || formData.phone.length < 7) {
        errors.phone = 'Valid phone number is required (at least 7 digits).';
      }
      if (!formData.currentCountry) {
        errors.currentCountry = 'Current country of residence is required.';
      }
    }

    if (stepNumber === 2) {
      if (!formData.preferredDestination) {
        errors.preferredDestination = 'Preferred destination is required.';
      }
      if (!formData.academicLevel) {
        errors.academicLevel = 'Target academic level is required.';
      }
      if (!formData.preferredCourse || formData.preferredCourse.trim().length < 2) {
        errors.preferredCourse = 'Preferred course or subject is required.';
      }
      if (!formData.currentQualification) {
        errors.currentQualification = 'Current qualification is required.';
      }
      if (!formData.englishTestStatus) {
        errors.englishTestStatus = 'Please select your English test status.';
      }
      if (!formData.intendedIntake) {
        errors.intendedIntake = 'Intended intake is required.';
      }
    }

    if (stepNumber === 3) {
      if (!formData.consultationMethod) {
        errors.consultationMethod = 'Please choose a consultation method.';
      }
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
      if (!formData.timeSlot) {
        errors.timeSlot = 'Please select a preferred time slot.';
      }
      if (!formData.consent) {
        errors.consent = 'Privacy consent is required to process your admissions consultation.';
      }
    }

    return errors;
  };

  const goToNextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setFormErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);

    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      if (Object.keys(step1Errors).length > 0) setCurrentStep(1);
      else if (Object.keys(step2Errors).length > 0) setCurrentStep(2);
      else setCurrentStep(3);
      trackEnquiryValidationFailure('admissions_page', 'intl-adm', Object.keys(allErrors));
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
      message: `[International Admissions Consultation Request]

• Applicant Name: ${formData.name.trim()}
• Country of Residence: ${formData.currentCountry}
• Preferred Study Destination: ${formData.preferredDestination}
• Target Academic Level: ${formData.academicLevel}
• Preferred Course / Subject: ${formData.preferredCourse.trim()}
• Current Qualification: ${formData.currentQualification}
• Academic % or GPA: ${formData.percentageOrGpa.trim() || 'Not specified'}
• English Language Test Status: ${formData.englishTestStatus}
• Current Application Status: ${formData.applicationStatus}
• Intended Admission Intake: ${formData.intendedIntake}
• Preferred Consultation Method: ${formData.consultationMethod}
• Scheduled Appointment Date: ${formData.appointmentDate} (${formData.timeSlot})

Additional Requirements & Notes:
${formData.additionalRequirements.trim() || 'No additional questions specified.'}`,
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
      console.error('Admissions consultation booking submission error:', err);
      setSubmitError(err.message || 'A network error occurred while connecting to the database server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      countryCode: '+971',
      phone: '',
      currentCountry: 'United Arab Emirates',
      preferredDestination: 'United Kingdom',
      academicLevel: 'Undergraduate',
      preferredCourse: '',
      currentQualification: '12th Grade / CBSE / ICSE',
      percentageOrGpa: '',
      englishTestStatus: 'Planning to Take Test Soon',
      applicationStatus: 'Shortlisting Universities',
      intendedIntake: 'Fall Intake',
      consultationMethod: 'Online Meeting (Google Meet / Zoom)',
      appointmentDate: tomorrow,
      timeSlot: 'Morning (09:00 AM - 12:00 PM)',
      additionalRequirements: '',
      consent: false
    });
    setFormErrors({});
    setSubmissionSuccess(null);
    setCurrentStep(1);
  };

  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-8 md:p-10 shadow-xl text-center max-w-2xl mx-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 uppercase tracking-wider mb-3">
          Application Consultation Confirmed
        </span>

        <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#102A43] mb-3">
          Admissions Advisory Scheduled
        </h3>

        <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base mb-6 leading-relaxed">
          Thank you, <strong className="text-gray-900">{submissionSuccess.name}</strong>. Your international admissions dossier request has been registered in our CRM. A senior admissions coordinator will review your academic background and connect with you.
        </p>

        {/* Reference & Application Summary Card */}
        <div className="bg-[#F7F9FC] border border-gray-200/80 rounded-xl p-5 mb-6 text-left text-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Admissions Reference:</span>
            <span className="font-mono font-bold text-[#102A43] bg-white px-2.5 py-1 rounded border border-gray-200">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Target Destination</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.destination}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Target Program</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.course}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Scheduled Date</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.appointmentDate}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Preferred Time Slot</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.timeSlot}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Consultation Format</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.consultationMethod}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 mb-6 text-xs text-amber-900 text-left">
          <strong>Admissions Compliance Note:</strong> Please prepare digital scans of your current transcripts and valid passport information page for your advisory meeting to ensure expedited portal evaluation.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={resetForm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors cursor-pointer"
          >
            Submit Another Admissions Request
          </button>
          <a
            href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20have%20submitted%20an%20International%20Admissions%20consultation%20request."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-medium text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4" /> Connect on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${embedded ? '' : 'max-w-3xl mx-auto'}`}>
      {/* Form Header */}
      <div className="bg-[#102A43] text-white px-6 py-6 md:px-8 border-b border-[#1b3d60]">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C6A45C]/20 text-[#C6A45C] border border-[#C6A45C]/30 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> University Placement Intake
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
              International Admissions Consultation
            </h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Personalized university application coordination, portal management, and compliance advisory support.
            </p>
          </div>
        </div>

        {/* 3-Step Wizard Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Personal Info', desc: 'Contact & Country' },
              { num: 2, title: 'Academic Profile', desc: 'Target Course & Level' },
              { num: 3, title: 'Consultation', desc: 'Status & Schedule' }
            ].map(step => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <div key={step.num} className="relative">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted 
                          ? 'bg-[#C6A45C] text-white' 
                          : isActive 
                            ? 'bg-white text-[#102A43] ring-2 ring-[#C6A45C]' 
                            : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                    </div>
                    <div className="hidden sm:block text-left leading-tight">
                      <div className={`text-xs font-bold ${isActive ? 'text-white' : isCompleted ? 'text-gray-200' : 'text-white/50'}`}>
                        {step.title}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                  <div className={`h-1 w-full rounded mt-2.5 transition-all ${
                    isCompleted ? 'bg-[#C6A45C]' : isActive ? 'bg-white' : 'bg-white/10'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Booking Submission Notice</strong>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C6A45C]" /> Step 1: Personal &amp; Contact Information
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Please provide your verified contact details for admissions correspondence.</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Jessica Williams"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                    formErrors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 transition-all`}
                  required
                />
              </div>
              {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                    formErrors.email ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 transition-all`}
                  required
                />
              </div>
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>

            {/* Phone Number with Country Code */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Phone Number (with Country Code) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-2/5 min-w-[120px]">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 font-medium"
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                      formErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 transition-all`}
                    required
                  />
                </div>
              </div>
              {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
            </div>

            {/* Current Country of Residence */}
            <div>
              <label htmlFor="currentCountry" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Current Country of Residence <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="currentCountry"
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {currentCountryOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {formErrors.currentCountry && <p className="text-xs text-red-600 mt-1">{formErrors.currentCountry}</p>}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#193a5c] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                Continue to Academic Profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Academic & Destination Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C6A45C]" /> Step 2: Target Destination &amp; Academic Credentials
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Tell us about your target study destination, program, and current qualification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Study Destination */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Study Destination <span className="text-red-500">*</span>
                </label>
                <select
                  name="preferredDestination"
                  value={formData.preferredDestination}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 font-medium"
                >
                  {destinationOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.preferredDestination && <p className="text-xs text-red-600 mt-1">{formErrors.preferredDestination}</p>}
              </div>

              {/* Target Academic Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Target Academic Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {academicLevelOptions.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                {formErrors.academicLevel && <p className="text-xs text-red-600 mt-1">{formErrors.academicLevel}</p>}
              </div>

              {/* Preferred Course or Subject */}
              <div>
                <label htmlFor="preferredCourse" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Course or Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="preferredCourse"
                  type="text"
                  name="preferredCourse"
                  placeholder="e.g. Computer Science (BSc / MSc) or Law"
                  value={formData.preferredCourse}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    formErrors.preferredCourse ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900`}
                  required
                />
                {formErrors.preferredCourse && <p className="text-xs text-red-600 mt-1">{formErrors.preferredCourse}</p>}
              </div>

              {/* Current Qualification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Current Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  name="currentQualification"
                  value={formData.currentQualification}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {qualificationOptions.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Academic Percentage or GPA */}
              <div>
                <label htmlFor="percentageOrGpa" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Academic Percentage or GPA (Optional)
                </label>
                <input
                  id="percentageOrGpa"
                  type="text"
                  name="percentageOrGpa"
                  placeholder="e.g. 88%, GPA 3.7 / 4.0, or Predicted"
                  value={formData.percentageOrGpa}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                />
              </div>

              {/* English Language Test Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  English Language Test Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="englishTestStatus"
                  value={formData.englishTestStatus}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {englishTestOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Current Application Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Current Application Status
                </label>
                <select
                  name="applicationStatus"
                  value={formData.applicationStatus}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {applicationStatusOptions.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Intended Intake */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Intended Intake <span className="text-red-500">*</span>
                </label>
                <select
                  name="intendedIntake"
                  value={formData.intendedIntake}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {intakeOptions.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={goToPrevStep}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Personal
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#193a5c] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                Continue to Scheduling <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Consultation Preferences & Requirements */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C6A45C]" /> Step 3: Consultation Preferences &amp; Scheduling
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Select how you would like our international admissions team to connect with you.</p>
            </div>

            {/* Preferred Consultation Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Preferred Consultation Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {consultationMethodOptions.map(m => (
                  <label
                    key={m.id}
                    className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer text-center transition-all ${
                      formData.consultationMethod === m.id
                        ? 'border-[#102A43] bg-[#102A43] text-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consultationMethod"
                      value={m.id}
                      checked={formData.consultationMethod === m.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
              {formErrors.consultationMethod && <p className="text-xs text-red-600 mt-1">{formErrors.consultationMethod}</p>}
            </div>

            {/* Preferred Appointment Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="appointmentDate" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Appointment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="appointmentDate"
                    type="date"
                    name="appointmentDate"
                    min={tomorrow}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                      formErrors.appointmentDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900`}
                    required
                  />
                </div>
                {formErrors.appointmentDate && <p className="text-xs text-red-600 mt-1">{formErrors.appointmentDate}</p>}
              </div>

              <div>
                <label htmlFor="timeSlot" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Time Slot <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                  >
                    {timeSlotOptions.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                {formErrors.timeSlot && <p className="text-xs text-red-600 mt-1">{formErrors.timeSlot}</p>}
              </div>
            </div>

            {/* Additional Requirements or Questions */}
            <div>
              <label htmlFor="additionalRequirements" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Additional Requirements or Questions
              </label>
              <textarea
                id="additionalRequirements"
                name="additionalRequirements"
                rows={2}
                placeholder="Mention specific target universities, application portals (UCAS, Common App), or scholarship requirements."
                value={formData.additionalRequirements}
                onChange={handleChange}
                className="w-full p-3 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 transition-all"
              />
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#102A43] focus:ring-[#102A43]"
                  required
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I consent to The Revival International processing my academic and contact details to coordinate my university admissions consultation in accordance with the Privacy Policy. <span className="text-red-500">*</span>
                </span>
              </label>
              {formErrors.consent && <p className="text-xs text-red-600 mt-1">{formErrors.consent}</p>}
            </div>

            {/* Submit & Back Controls */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Academic
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#102A43]" />
                    <span>Booking Admissions Consultation...</span>
                  </>
                ) : (
                  <>
                    <span>Book My Admissions Consultation</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InternationalAdmissionsForm;

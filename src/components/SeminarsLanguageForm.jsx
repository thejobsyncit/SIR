import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Calendar, Phone, Mail, User, Clock, BookOpen, Award, Check,
  ChevronRight, ChevronLeft, Briefcase, GraduationCap, Languages, Building2
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

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    applicantType: 'Student', // Student, Working Professional, Healthcare Professional, Corporate Representative

    // Step 2: Program & Training Requirements
    interestedProgram: preselectedProgram || 'IELTS',
    currentProficiency: '',
    preferredTrainingFormat: 'Online', // Online, Classroom, Corporate
    preferredStartDate: tomorrow,

    // Step 3: Contact & Questions
    preferredContactMethod: 'WhatsApp', // WhatsApp, Phone Call, Email
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
      // Advance to step 2 so user immediately sees their selected program
      setCurrentStep(2);
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
    'Working Professional',
    'Healthcare Professional',
    'Corporate Representative'
  ];

  const programOptions = [
    'IELTS Preparation',
    'OET Preparation',
    'TOEFL Preparation',
    'Duolingo English Test (DET)',
    'Leadership & Management',
    'Corporate Communication',
    'Executive Development Workshops',
    'Corporate Training Programs'
  ];

  const trainingFormatOptions = [
    { id: 'Online', label: 'Online Training (Live Virtual)' },
    { id: 'Classroom', label: 'Classroom Training (In-Person)' },
    { id: 'Corporate', label: 'Corporate / On-site Training' }
  ];

  const contactMethodOptions = [
    { id: 'WhatsApp', label: 'WhatsApp Call / Chat' },
    { id: 'Phone Call', label: 'Direct Phone Call' },
    { id: 'Email', label: 'Email Advisory' }
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
      if (!formData.applicantType) {
        errors.applicantType = 'Please select your applicant type.';
      }
    }

    if (stepNumber === 2) {
      if (!formData.interestedProgram) {
        errors.interestedProgram = 'Please select a training or test prep program.';
      }
      if (!formData.currentProficiency || formData.currentProficiency.trim().length < 2) {
        errors.currentProficiency = 'Please provide your current proficiency or training requirements.';
      }
      if (!formData.preferredTrainingFormat) {
        errors.preferredTrainingFormat = 'Please select a preferred training format.';
      }
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
    }

    if (stepNumber === 3) {
      if (!formData.preferredContactMethod) {
        errors.preferredContactMethod = 'Please choose a preferred contact method.';
      }
      if (!formData.consent) {
        errors.consent = 'Privacy consent is required to process your consultation request.';
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
      trackEnquiryValidationFailure('seminars_language_page', 'exec-seminars-lang', Object.keys(allErrors));
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
      message: `[Seminars & Language Consultation Enquiry]

• Applicant Name: ${formData.name.trim()}
• Applicant Type: ${formData.applicantType}
• Interested Program: ${formData.interestedProgram}
• Current Proficiency / Training Requirements: ${formData.currentProficiency.trim()}
• Preferred Training Format: ${formData.preferredTrainingFormat}
• Preferred Start Date: ${formData.preferredStartDate}
• Preferred Contact Method: ${formData.preferredContactMethod}

Additional Questions & Context:
${formData.additionalQuestions.trim() || 'No additional questions specified.'}`,
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
      console.error('Seminars & Language consultation booking error:', err);
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
      applicantType: 'Student',
      interestedProgram: 'IELTS Preparation',
      currentProficiency: '',
      preferredTrainingFormat: 'Online',
      preferredStartDate: tomorrow,
      preferredContactMethod: 'WhatsApp',
      additionalQuestions: '',
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
          Training Enquiry Synchronized
        </span>

        <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#102A43] mb-3">
          Consultation Request Confirmed
        </h3>

        <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base mb-6 leading-relaxed">
          Thank you, <strong className="text-gray-900">{submissionSuccess.name}</strong>. Your training and diagnostic assessment request has been logged. Our lead instructor will contact you via {submissionSuccess.contactMethod}.
        </p>

        {/* Reference & Training Summary Card */}
        <div className="bg-[#F7F9FC] border border-gray-200/80 rounded-xl p-5 mb-6 text-left text-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Consultation Reference:</span>
            <span className="font-mono font-bold text-[#102A43] bg-white px-2.5 py-1 rounded border border-gray-200">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Interested Program</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.program}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Applicant Category</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.applicantType}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Training Format</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.format}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider">Preferred Start Date</span>
              <span className="font-semibold text-gray-900">{submissionSuccess.startDate}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 mb-6 text-xs text-amber-900 text-left">
          <strong>Advisor Note:</strong> A trainer will connect with you via {submissionSuccess.contactMethod} to administer your diagnostic assessment and finalize your cohort timetable.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={resetForm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors cursor-pointer"
          >
            Submit Another Request
          </button>
          <a
            href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20have%20submitted%20a%20Seminars%20and%20Language%20Preparation%20enquiry."
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
              <Sparkles className="w-3.5 h-3.5" /> Direct Training Intake
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
              Seminars &amp; Language Consultation
            </h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Get personalized training recommendations based on your goals, proficiency level, and format.
            </p>
          </div>
        </div>

        {/* 3-Step Wizard Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Personal Info', desc: 'Contact Details' },
              { num: 2, title: 'Program & Goals', desc: 'Target Modules' },
              { num: 3, title: 'Consultation', desc: 'Mode & Schedule' }
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

        {/* STEP 1: Personal & Contact Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C6A45C]" /> Step 1: Personal &amp; Contact Information
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Please provide your primary contact details for training correspondence.</p>
            </div>

            {/* Applicant Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Applicant Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {applicantTypeOptions.map(t => (
                  <label
                    key={t}
                    className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer text-center transition-all ${
                      formData.applicantType === t
                        ? 'border-[#102A43] bg-[#102A43] text-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicantType"
                      value={t}
                      checked={formData.applicantType === t}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              {formErrors.applicantType && <p className="text-xs text-red-600 mt-1">{formErrors.applicantType}</p>}
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
                  placeholder="e.g. Dr. Ayesha Siddiqua / David Miller"
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
                    placeholder="50 123 4567"
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

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#193a5c] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                Continue to Program Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Program & Training Details */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C6A45C]" /> Step 2: Target Program &amp; Training Requirements
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Tell us about your learning objectives, current proficiency, and timeline.</p>
            </div>

            {/* Interested Program Selection */}
            <div>
              <label htmlFor="interestedProgram" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Interested Program <span className="text-red-500">*</span>
              </label>
              <select
                id="interestedProgram"
                name="interestedProgram"
                value={formData.interestedProgram}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 font-medium"
              >
                {programOptions.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
              {formErrors.interestedProgram && <p className="text-xs text-red-600 mt-1">{formErrors.interestedProgram}</p>}
            </div>

            {/* Current Proficiency / Training Requirements */}
            <div>
              <label htmlFor="currentProficiency" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Current Proficiency / Training Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                id="currentProficiency"
                name="currentProficiency"
                rows={3}
                placeholder="Mention your target band/score (e.g. IELTS 7.5, OET B in all sub-tests) or executive training goals for your team."
                value={formData.currentProficiency}
                onChange={handleChange}
                className={`w-full p-3 text-sm rounded-xl border ${
                  formErrors.currentProficiency ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900 transition-all`}
                required
              />
              {formErrors.currentProficiency && <p className="text-xs text-red-600 mt-1">{formErrors.currentProficiency}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Training Format */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Training Format <span className="text-red-500">*</span>
                </label>
                <select
                  name="preferredTrainingFormat"
                  value={formData.preferredTrainingFormat}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900"
                >
                  {trainingFormatOptions.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                {formErrors.preferredTrainingFormat && <p className="text-xs text-red-600 mt-1">{formErrors.preferredTrainingFormat}</p>}
              </div>

              {/* Preferred Start Date */}
              <div>
                <label htmlFor="preferredStartDate" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Preferred Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="preferredStartDate"
                    type="date"
                    name="preferredStartDate"
                    min={tomorrow}
                    value={formData.preferredStartDate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${
                      formErrors.preferredStartDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#102A43] text-gray-900`}
                    required
                  />
                </div>
                {formErrors.preferredStartDate && <p className="text-xs text-red-600 mt-1">{formErrors.preferredStartDate}</p>}
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

        {/* STEP 3: Consultation & Scheduling */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C6A45C]" /> Step 3: Contact Method &amp; Scheduling
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Select how you would like our instructors or corporate advisors to connect with you.</p>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Preferred Contact Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {contactMethodOptions.map(method => (
                  <label
                    key={method.id}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.preferredContactMethod === method.id
                        ? 'border-[#102A43] bg-[#102A43] text-white shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={method.id}
                      checked={formData.preferredContactMethod === method.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold">{method.label}</span>
                  </label>
                ))}
              </div>
              {formErrors.preferredContactMethod && <p className="text-xs text-red-600 mt-1">{formErrors.preferredContactMethod}</p>}
            </div>

            {/* Additional Questions */}
            <div>
              <label htmlFor="additionalQuestions" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Additional Questions (Optional)
              </label>
              <textarea
                id="additionalQuestions"
                name="additionalQuestions"
                rows={2}
                placeholder="Any specific scheduling preferences, corporate cohort sizes, or previous test attempts?"
                value={formData.additionalQuestions}
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
                  I consent to The Revival International processing my contact details to arrange my training diagnostic session in accordance with the Privacy Policy. <span className="text-red-500">*</span>
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
                <ChevronLeft className="w-4 h-4" /> Back to Program
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#102A43]" />
                    <span>Scheduling Consultation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Book Free Consultation</span>
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

export default SeminarsLanguageForm;

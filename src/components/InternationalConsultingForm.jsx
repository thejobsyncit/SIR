import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Globe, Calendar, Phone, Mail, User, Clock, Users, BookOpen, Check
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';
import { submitLeadWithFallback } from '../services/leadSubmissionService';

export const InternationalConsultingForm = ({ 
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
    role: 'Student', // 'Student' or 'Parent'
    currentCountry: 'United Arab Emirates',
    preferredDestination: preselectedDestination || 'United Kingdom',
    academicLevel: 'Postgraduate',
    intendedIntake: 'Fall Intake',
    consultationMethod: 'Online Meeting', // WhatsApp, Phone Call, Email, Online Meeting
    appointmentDate: tomorrow,
    timeSlot: 'Morning (09:00 AM - 12:00 PM)',
    academicBackground: '',
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
    'Germany and Europe',
    'United Arab Emirates',
    'Undecided / Open to Advisory'
  ];

  const academicLevelOptions = [
    'Undergraduate',
    'Postgraduate',
    'Executive MBA'
  ];

  const intakeOptions = [
    'Fall Intake',
    'Spring Intake',
    'Summer Intake'
  ];

  const consultationMethodOptions = [
    { id: 'Online Meeting', label: 'Online Meeting (Google Meet / Zoom)' },
    { id: 'WhatsApp', label: 'WhatsApp Call / Message' },
    { id: 'Phone Call', label: 'Phone Call' },
    { id: 'Email', label: 'Email Advisory' }
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
      errors.email = 'Please provide a valid email address for consultation correspondence.';
    }

    // 3. Phone Number
    if (!formData.phone || formData.phone.length < 7) {
      errors.phone = 'Valid phone number is required (at least 7 digits).';
    } else if (formData.phone.length > 15) {
      errors.phone = 'Phone number exceeds maximum length.';
    }

    // 4. Role (Student or Parent)
    if (!formData.role) {
      errors.role = 'Please specify whether you are a Student or Parent.';
    }

    // 5. Current Country
    if (!formData.currentCountry) {
      errors.currentCountry = 'Current country is required.';
    }

    // 6. Preferred Study Destination
    if (!formData.preferredDestination) {
      errors.preferredDestination = 'Please select a preferred study destination.';
    }

    // 7. Target Academic Level
    if (!formData.academicLevel) {
      errors.academicLevel = 'Please select your target academic level.';
    }

    // 8. Intended Intake
    if (!formData.intendedIntake) {
      errors.intendedIntake = 'Please select your intended intake.';
    }

    // 9. Preferred Consultation Method
    if (!formData.consultationMethod) {
      errors.consultationMethod = 'Please choose a consultation method.';
    }

    // 10. Preferred Appointment Date
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

    // 11. Preferred Time Slot
    if (!formData.timeSlot) {
      errors.timeSlot = 'Please select a preferred time slot.';
    }

    // 12. Academic Background and Specific Requirements
    if (!formData.academicBackground || formData.academicBackground.trim().length < 10) {
      errors.academicBackground = 'Please provide details on your academic background and requirements (minimum 10 characters).';
    } else if (formData.academicBackground.trim().length > 3000) {
      errors.academicBackground = 'Academic background details must not exceed 3000 characters.';
    }

    // 13. Privacy Consent Checkbox
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
      trackEnquiryValidationFailure('consulting_page', 'intl-consult', Object.keys(errors));
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
      company: `${formData.role} - ${formData.currentCountry}`,
      organizationName: formData.currentCountry,
      organizationType: formData.role,
      serviceId: 'intl-consult',
      serviceTitle: 'International Consulting',
      countryInterest: formData.preferredDestination,
      assistanceType: `${formData.academicLevel} Planning & Advisory`,
      degreeLevel: formData.academicLevel,
      intakeTerm: formData.intendedIntake,
      preferredContactMethod: formData.consultationMethod,
      consultationDate: formData.appointmentDate,
      consultationTime: formData.timeSlot,
      consultationMode: formData.consultationMethod,
      status: 'Consultation Scheduled',
      priority: 'High',
      message: `[Strategic Consultation Booking - International Consulting]\n\n• Applicant Category: ${formData.role}\n• Current Country of Residence: ${formData.currentCountry}\n• Preferred Study Destination: ${formData.preferredDestination}\n• Target Academic Level: ${formData.academicLevel}\n• Intended Intake: ${formData.intendedIntake}\n• Preferred Consultation Method: ${formData.consultationMethod}\n• Scheduled Appointment Date: ${formData.appointmentDate}\n• Preferred Time Slot: ${formData.timeSlot}\n\nAcademic Background & Specific Requirements:\n${formData.academicBackground.trim()}`,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
    };

    try {
      const { ok, data: result } = await submitLeadWithFallback(payload);

      if (!ok || !result?.success) {
        throw new Error(result?.message || 'Unable to schedule consultation with the backend server. Please try again.');
      }

      const confirmedRef = result.data?.referenceNumber || `REV-IC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const successData = {
        referenceNumber: confirmedRef,
        id: result.data?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        role: formData.role,
        currentCountry: formData.currentCountry,
        destination: formData.preferredDestination,
        academicLevel: formData.academicLevel,
        intake: formData.intendedIntake,
        consultationMethod: formData.consultationMethod,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot
      };

      setSubmissionSuccess(successData);

      // Track conversion
      trackEnquiryConversion(
        confirmedRef,
        'intl-consult',
        'International Consulting',
        'Consulting',
        'consulting_page'
      );

      if (onSuccessCallback) {
        onSuccessCallback(successData);
      }
    } catch (err) {
      console.error('Consultation booking submission error:', err);
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
      role: 'Student',
      currentCountry: 'United Arab Emirates',
      preferredDestination: preselectedDestination || 'United Kingdom',
      academicLevel: 'Postgraduate',
      intendedIntake: 'Fall Intake',
      consultationMethod: 'Online Meeting',
      appointmentDate: tomorrow,
      timeSlot: 'Morning (09:00 AM - 12:00 PM)',
      academicBackground: '',
      consent: false
    });
    setFormErrors({});
    setSubmitError(null);
    setSubmissionSuccess(null);
  };

  // SUCCESS STATE (Displayed only upon genuine successful HTTP response from backend)
  if (submissionSuccess) {
    return (
      <div className={`glass-card bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 space-y-6 text-center ${embedded ? '' : 'shadow-luxury'}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
            Consultation Appointment Confirmed
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Thank You, {submissionSuccess.name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto font-medium">
            Your strategic consultation booking has been verified and registered in the Revival International database. An educational advisory counselor will connect with you via your preferred consultation channel.
          </p>
        </div>

        {/* Confirmed Reference Card */}
        <div className="bg-slate-50 dark:bg-navy-950 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 dark:border-navy-800">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Official Booking Reference</span>
            <span className="font-mono font-black text-gold-600 dark:text-gold-400 text-sm tracking-wide bg-gold-500/10 px-3 py-0.5 rounded border border-gold-500/30">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Target Destination</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.destination}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Academic Level & Intake</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.academicLevel} • {submissionSuccess.intake}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Appointment Date & Time</p>
              <p className="font-bold text-gold-600 dark:text-gold-400">
                {submissionSuccess.appointmentDate}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{submissionSuccess.timeSlot}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Consultation Method</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{submissionSuccess.consultationMethod}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>Confirmation email dispatched to: <strong className="text-slate-800 dark:text-slate-200">{submissionSuccess.email}</strong></p>
          <p className="text-[11px]">Academic advisory desk active Monday to Saturday, 09:30 AM – 06:30 PM Gulf Standard Time.</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Book Another Consultation
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE BOOKING FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-800 dark:text-slate-200" noValidate>
      
      {/* Header Info Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Strategic Consultation Booking</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Personalized one-to-one global education advisory with certified international destination planners.
          </p>
        </div>
        <span className="hidden sm:inline-flex bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
          Direct Advisory • No Obligation
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
        {/* Field 1: Full Name */}
        <div className="space-y-1">
          <label htmlFor="scb-name" className="block text-slate-700 dark:text-slate-300 font-bold">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="scb-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => trackEnquiryStart('consulting_page', 'intl-consult', 'International Consulting')}
              placeholder="e.g. John Doe / Sarah Al Mansoori"
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

        {/* Field 3: Email Address */}
        <div className="space-y-1">
          <label htmlFor="scb-email" className="block text-slate-700 dark:text-slate-300 font-bold">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="scb-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. applicant@example.com"
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

      {/* Row 2: Phone Number with Country Code & Student or Parent Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Field 2: Phone Number with country code */}
        <div className="space-y-1">
          <label htmlFor="scb-phone" className="block text-slate-700 dark:text-slate-300 font-bold">
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
                id="scb-phone"
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

        {/* Field 4: Student or Parent */}
        <div className="space-y-1">
          <label className="block text-slate-700 dark:text-slate-300 font-bold">
            I am a <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <label
              className={`p-2 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold ${
                formData.role === 'Student'
                  ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Student"
                checked={formData.role === 'Student'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="text-gold-500 focus:ring-gold-500"
              />
              <span>Student</span>
            </label>

            <label
              className={`p-2 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold ${
                formData.role === 'Parent'
                  ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Parent"
                checked={formData.role === 'Parent'}
                onChange={handleChange}
                disabled={isSubmitting}
                className="text-gold-500 focus:ring-gold-500"
              />
              <span>Parent / Guardian</span>
            </label>
          </div>
          {formErrors.role && (
            <p className="text-[10px] text-rose-500 font-bold">{formErrors.role}</p>
          )}
        </div>
      </div>

      {/* Row 3: Current Country & Preferred Study Destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Field 5: Current Country */}
        <div className="space-y-1">
          <label htmlFor="scb-current-country" className="block text-slate-700 dark:text-slate-300 font-bold">
            Current Country of Residence <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="scb-current-country"
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

        {/* Field 6: Preferred Study Destination */}
        <div className="space-y-1">
          <label htmlFor="scb-destination" className="block text-slate-700 dark:text-slate-300 font-bold">
            Preferred Study Destination <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-gold-500 absolute left-3 top-3 pointer-events-none" />
            <select
              id="scb-destination"
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
      </div>

      {/* Row 4: Target Academic Level & Intended Intake */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Field 7: Target Academic Level */}
        <div className="space-y-1">
          <label htmlFor="scb-academic-level" className="block text-slate-700 dark:text-slate-300 font-bold">
            Target Academic Level <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="scb-academic-level"
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

        {/* Field 8: Intended Intake */}
        <div className="space-y-1">
          <label htmlFor="scb-intake" className="block text-slate-700 dark:text-slate-300 font-bold">
            Intended Intake <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="scb-intake"
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

      {/* Row 5: Field 9: Preferred Consultation Method */}
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

      {/* Row 6: Field 10 & 11: Appointment Date & Time Slot */}
      <div className="p-4 rounded-2xl bg-gold-500/5 dark:bg-navy-950 border border-gold-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <h4 className="font-bold text-navy-900 dark:text-white text-xs uppercase tracking-wider">
              Consultation Appointment Details
            </h4>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Live Booking Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Field 10: Preferred Appointment Date */}
          <div className="space-y-1">
            <label htmlFor="scb-date" className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
              Preferred Appointment Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="scb-date"
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

          {/* Field 11: Preferred Time Slot */}
          <div className="space-y-1">
            <label htmlFor="scb-time-slot" className="block text-slate-700 dark:text-slate-300 font-bold text-[11px]">
              Preferred Time Slot <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                id="scb-time-slot"
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
            {formErrors.timeSlot && (
              <p className="text-[10px] text-rose-500 font-bold">{formErrors.timeSlot}</p>
            )}
          </div>
        </div>
      </div>

      {/* Field 12: Academic Background and Specific Requirements */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="scb-background" className="block text-slate-700 dark:text-slate-300 font-bold">
            Academic Background and Specific Requirements <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.academicBackground.length}/3000 chars
          </span>
        </div>
        <textarea
          id="scb-background"
          name="academicBackground"
          rows={4}
          value={formData.academicBackground}
          onChange={handleChange}
          placeholder="Please describe your current qualification (e.g., 12th Grade CBSE, Bachelor in Computer Science), GPA or marks, target courses/majors, budget parameters, and any specific questions on universities or visas..."
          disabled={isSubmitting}
          className={`w-full p-3 bg-slate-50 dark:bg-navy-950 border rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition leading-relaxed ${
            formErrors.academicBackground ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
          }`}
        />
        {formErrors.academicBackground && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.academicBackground}</p>
        )}
      </div>

      {/* Field 13: Privacy Consent Checkbox */}
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
            I agree to the privacy policy and consent to receiving consultation correspondence from The Revival International academic advisors regarding my educational inquiry. We do not sell or distribute personal information to external commercial entities.
          </span>
        </label>
        {formErrors.consent && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.consent}</p>
        )}
      </div>

      {/* Prominent CTA Button: Book My Consultation */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-gold-shimmer text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
              <span>Registering Consultation with Advisory Desk...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Book My Consultation</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>SSL Encrypted Transmission • Connected to Official CRM • Authentic Booking Confirmation</span>
      </div>
    </form>
  );
};

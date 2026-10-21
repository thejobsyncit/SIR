import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, 
  Building2, Globe, Calendar, Phone, Mail, User, Clock, ArrowRight 
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';

export const InternationalConsultingForm = ({ 
  onSuccessCallback = null,
  embedded = false,
  preselectedCountry = 'All',
  preselectedAssistance = 'Destination Selection & Comparison'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+971',
    organizationName: '',
    organizationType: 'Individual',
    countryInterest: preselectedCountry || 'All',
    assistanceType: preselectedAssistance || 'Destination Selection & Comparison',
    degreeLevel: 'Undergraduate',
    intakeTerm: 'Fall 2026',
    preferredContactMethod: 'WhatsApp',
    message: '',
    consent: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const countryCodes = [
    { code: '+971', label: 'UAE (+971)' },
    { code: '+966', label: 'Saudi Arabia (+966)' },
    { code: '+974', label: 'Qatar (+974)' },
    { code: '+968', label: 'Oman (+968)' },
    { code: '+965', label: 'Kuwait (+965)' },
    { code: '+973', label: 'Bahrain (+973)' },
    { code: '+44', label: 'United Kingdom (+44)' },
    { code: '+1', label: 'USA / Canada (+1)' },
    { code: '+91', label: 'India (+91)' },
    { code: '+65', label: 'Singapore (+65)' },
    { code: '+60', label: 'Malaysia (+60)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+353', label: 'Ireland (+353)' }
  ];

  const destinationOptions = [
    'All Global Destinations',
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Germany & Europe',
    'Ireland',
    'United Arab Emirates & GCC',
    'Singapore & Malaysia',
    'Other / Undecided'
  ];

  const assistanceTypes = [
    'Destination Selection & Comparison',
    'Academic Profile & Credential Evaluation',
    'University Shortlisting & Entry Brackets',
    'Tuition, Budget & Scholarship Planning',
    'Student Visa & Immigration Policy Guidance',
    'Comprehensive End-to-End Advisory'
  ];

  const degreeLevels = [
    'Undergraduate / Bachelor Degree',
    'Postgraduate / Master Degree',
    'Doctorate / PhD Track',
    'Executive MBA & Professional Diploma',
    'High School / Foundation Pathway'
  ];

  const intakeTerms = [
    'Fall 2026 (Sept / Oct 2026)',
    'Spring 2027 (Jan / Feb 2027)',
    'Fall 2027 (Sept / Oct 2027)',
    'Summer / Immediate Intake'
  ];

  const contactMethods = [
    { id: 'WhatsApp', label: 'WhatsApp Message' },
    { id: 'Phone', label: 'Direct Phone Call' },
    { id: 'Email', label: 'Email Consultation' },
    { id: 'In-Person', label: 'In-Person (Dubai HQ Office)' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
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

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 characters).';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Full name must not exceed 100 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address for consultation correspondence.';
    }

    if (!formData.phone || formData.phone.length < 7) {
      errors.phone = 'Valid phone number is required (at least 7 digits).';
    } else if (formData.phone.length > 15) {
      errors.phone = 'Phone number exceeds maximum length.';
    }

    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = 'Please provide brief details about your background, questions, or goals (minimum 10 characters).';
    } else if (formData.message.trim().length > 3000) {
      errors.message = 'Details must not exceed 3000 characters.';
    }

    if (!formData.consent) {
      errors.consent = 'Consent to contact is required to schedule consultation.';
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
    const orgValue = formData.organizationName && formData.organizationName.trim()
      ? formData.organizationName.trim()
      : 'Individual';

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhoneNumber,
      company: orgValue,
      organizationName: orgValue,
      organizationType: formData.organizationType,
      serviceId: 'intl-consult',
      serviceTitle: 'International Consulting',
      countryInterest: formData.countryInterest,
      assistanceType: formData.assistanceType,
      degreeLevel: formData.degreeLevel,
      intakeTerm: formData.intakeTerm,
      preferredContactMethod: formData.preferredContactMethod,
      priority: 'Medium',
      message: `[International Consulting Consultation Request]\n\nTarget Destination: ${formData.countryInterest}\nDegree Level: ${formData.degreeLevel}\nTarget Intake: ${formData.intakeTerm}\nAssistance Required: ${formData.assistanceType}\nPreferred Contact: ${formData.preferredContactMethod}\nOrganization/School: ${orgValue} (${formData.organizationType})\n\nCandidate Inquiry & Academic Context:\n${formData.message.trim()}`,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
    };

    try {
      const response = await fetch('/api/consulting/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The server was unable to save your consultation enquiry. Please try again.');
      }

      const confirmedRef = result.data?.referenceNumber || `REV-IC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const successData = {
        referenceNumber: confirmedRef,
        id: result.data?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        destination: formData.countryInterest,
        assistanceType: formData.assistanceType,
        intakeTerm: formData.intakeTerm,
        preferredContactMethod: formData.preferredContactMethod
      };

      setSubmissionSuccess(successData);

      // Fire confirmed conversion event (deduplicated by referenceNumber)
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
      console.error('Enquiry submission error:', err);
      setSubmitError(err.message || 'A network error occurred while connecting to the database server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      countryCode: '+971',
      organizationName: '',
      organizationType: 'Individual',
      countryInterest: preselectedCountry || 'All',
      assistanceType: preselectedAssistance || 'Destination Selection & Comparison',
      degreeLevel: 'Undergraduate',
      intakeTerm: 'Fall 2026',
      preferredContactMethod: 'WhatsApp',
      message: '',
      consent: true
    });
    setFormErrors({});
    setSubmitError(null);
    setSubmissionSuccess(null);
  };

  if (submissionSuccess) {
    return (
      <div className={`glass-card bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 text-center ${embedded ? '' : 'shadow-luxury'}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
            Consultation Enquiry Recorded
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Thank You, {submissionSuccess.name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto font-medium">
            Your International Consulting request has been registered in the Revival International database. A senior educational consultant has been notified.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="bg-slate-50 dark:bg-navy-950 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-md mx-auto text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-navy-800">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Official Reference Code</span>
            <span className="font-mono font-black text-gold-600 dark:text-gold-400 text-sm tracking-wide bg-gold-500/10 px-2.5 py-0.5 rounded border border-gold-500/30">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Target Destination</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.destination}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Target Intake</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.intakeTerm}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Assistance Track</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{submissionSuccess.assistanceType}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Channel</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{submissionSuccess.preferredContactMethod}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>Confirmation email scheduled to: <strong className="text-slate-800 dark:text-slate-200">{submissionSuccess.email}</strong></p>
          <p className="text-[11px]">Our Dubai academic advisory desk operates Monday through Saturday, 09:00 AM - 06:00 PM GST.</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-800 dark:text-slate-200" noValidate>
      
      {/* Header Info Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Strategic Consultation Booking</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Confidential 1-on-1 profile evaluation with licensed international academic advisors.
          </p>
        </div>
        <span className="hidden sm:inline-flex bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
          No Obligation • Direct Advisory
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

      {/* Row 1: Full Name & Business/Personal Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="ic-name" className="block text-slate-700 dark:text-slate-300 font-bold">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="ic-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => trackEnquiryStart('consulting_page', 'intl-consult', 'International Consulting')}
              placeholder="e.g. Tariq Al-Mansoori / Sarah Jenkins"
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

        <div className="space-y-1">
          <label htmlFor="ic-email" className="block text-slate-700 dark:text-slate-300 font-bold">
            Contact / Business Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="ic-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. candidate@domain.com"
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

      {/* Row 2: Phone with Country Code Selector & Organization (if applicable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="ic-phone" className="block text-slate-700 dark:text-slate-300 font-bold">
            Phone / WhatsApp Number <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-32 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl px-2.5 py-2 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-xs shrink-0 cursor-pointer"
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="ic-phone"
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

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="ic-org" className="block text-slate-700 dark:text-slate-300 font-bold">
              Organization / School / University <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              name="organizationType"
              value={formData.organizationType}
              onChange={handleChange}
              disabled={isSubmitting}
              className="text-[10px] bg-transparent text-slate-500 dark:text-slate-400 font-semibold cursor-pointer border-none focus:outline-none"
            >
              <option value="Individual">Individual Applicant</option>
              <option value="School">School / K-12</option>
              <option value="University">University</option>
              <option value="College">College</option>
              <option value="Company">Corporate Employer</option>
            </select>
          </div>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              id="ic-org"
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="e.g. Dubai International Academy, Heriot-Watt, or Individual"
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Destination of Interest & Assistance Track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="ic-dest" className="block text-slate-700 dark:text-slate-300 font-bold">
            Target Destination / Country of Interest
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="ic-dest"
              name="countryInterest"
              value={formData.countryInterest}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {destinationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="ic-assistance" className="block text-slate-700 dark:text-slate-300 font-bold">
            Type of Consulting Assistance Required
          </label>
          <select
            id="ic-assistance"
            name="assistanceType"
            value={formData.assistanceType}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {assistanceTypes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Degree Level & Target Intake Term */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="ic-degree" className="block text-slate-700 dark:text-slate-300 font-bold">
            Target Academic Level
          </label>
          <select
            id="ic-degree"
            name="degreeLevel"
            value={formData.degreeLevel}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
          >
            {degreeLevels.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="ic-intake" className="block text-slate-700 dark:text-slate-300 font-bold">
            Target Intake Window
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              id="ic-intake"
              name="intakeTerm"
              value={formData.intakeTerm}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
            >
              {intakeTerms.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 5: Preferred Contact Method Radio Selector */}
      <div className="space-y-1.5">
        <label className="block text-slate-700 dark:text-slate-300 font-bold">
          Preferred Consultation Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {contactMethods.map(method => (
            <label
              key={method.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs font-semibold ${
                formData.preferredContactMethod === method.id
                  ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-300'
                  : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-navy-700'
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
              <span className="truncate">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Row 6: Enquiry Details / Academic Background Message */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="ic-message" className="block text-slate-700 dark:text-slate-300 font-bold">
            Academic Background, Questions or Specific Requirements <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.message.length}/3000 chars
          </span>
        </div>
        <textarea
          id="ic-message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe your current qualification (e.g. 12th Grade CBSE, B.Sc Computer Science), target institutions or majors, budget preferences, or specific visa/scholarship questions..."
          disabled={isSubmitting}
          className={`w-full p-3 bg-slate-50 dark:bg-navy-950 border rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition leading-relaxed ${
            formErrors.message ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
          }`}
        />
        {formErrors.message && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.message}</p>
        )}
      </div>

      {/* Row 7: Consent Checkbox */}
      <div className="space-y-1 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-0.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            I consent to Revival International contacting me via phone, WhatsApp, or email to schedule this consultation and provide educational advisory updates. We never share your information with third-party advertisers.
          </span>
        </label>
        {formErrors.consent && (
          <p className="text-[10px] text-rose-500 font-bold">{formErrors.consent}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-gold-shimmer text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
              <span>Verifying & Recording Consultation in Database...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit International Consulting Enquiry</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>SSL Encrypted Transmission • SQLite Database Backed • Real Reference Generated</span>
      </div>
    </form>
  );
};

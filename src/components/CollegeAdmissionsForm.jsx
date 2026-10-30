import React, { useState, useEffect } from 'react';
import {
  Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck,
  Globe, Calendar, Phone, Mail, User, Clock, BookOpen, FileText, Check, Award, Building2, GraduationCap
} from 'lucide-react';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';
import { submitLeadWithFallback } from '../services/leadSubmissionService';

export const CollegeAdmissionsForm = ({
  onSuccessCallback = null,
  embedded = false,
  initialValues = null
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+91',
    phone: '',
    email: '',
    currentQualification: 'Class 12 / Higher Secondary (Completed or Appearing)',
    academicResults: '',
    preferredCourse: '',
    preferredCollege: '',
    preferredDestination: 'India (Premier Colleges & Universities)',
    intendedIntake: '2026–2027 Academic Intake (Fall / Autumn)',
    estimatedBudget: '',
    consultationMethod: 'Online Video Consultation',
    appointmentDate: tomorrow,
    timeSlot: 'Morning (10:00 AM - 01:00 PM)',
    additionalQuestions: '',
    consent: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Sync prefilled values from Eligibility Assessment CTA or Service Card
  useEffect(() => {
    if (initialValues && typeof initialValues === 'object') {
      setFormData(prev => ({
        ...prev,
        ...(initialValues.currentQualification ? { currentQualification: initialValues.currentQualification } : {}),
        ...(initialValues.academicResults ? { academicResults: initialValues.academicResults } : {}),
        ...(initialValues.preferredCourse ? { preferredCourse: initialValues.preferredCourse } : {}),
        ...(initialValues.preferredDestination ? { preferredDestination: initialValues.preferredDestination } : {}),
        ...(initialValues.additionalQuestions ? { additionalQuestions: initialValues.additionalQuestions } : {})
      }));
    }
  }, [initialValues]);

  const countryCodes = [
    { code: '+91', label: 'India (+91)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+966', label: 'Saudi Arabia (+966)' },
    { code: '+974', label: 'Qatar (+974)' },
    { code: '+968', label: 'Oman (+968)' },
    { code: '+965', label: 'Kuwait (+965)' },
    { code: '+973', label: 'Bahrain (+973)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+1', label: 'USA / Canada (+1)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+65', label: 'Singapore (+65)' }
  ];

  const qualificationOptions = [
    'Class 12 / Higher Secondary (Completed or Appearing)',
    'CBSE / ICSE / State Board Class 12',
    'Cambridge A-Levels / IB Diploma',
    'Polytechnic / 3-Year Diploma Holder (Lateral / Degree Entry)',
    'Undergraduate Student (Exploring Course / College Transfer)',
    'Bachelor’s Degree Completed or Final Year (Planning PG)',
    'Other Qualification'
  ];

  const destinationOptions = [
    'India (Premier Colleges & Universities)',
    'United Arab Emirates (Dubai / Abu Dhabi Campuses)',
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Germany & Europe',
    'Singapore & Malaysia',
    'Open to Multiple Study Destinations'
  ];

  const intakeOptions = [
    '2026–2027 Academic Intake (Fall / Autumn)',
    '2027 Spring / January Intake',
    '2027 Summer Intake',
    '2027–2028 Academic Year (Early Planning)',
    'Immediate / Lateral Transfer Intake'
  ];

  const budgetOptions = [
    'Not Yet Decided / Need Fee Guidance',
    'Up to ₹2 Lakhs / year (or AED 10,000 / year)',
    '₹2 Lakhs – ₹5 Lakhs / year (or AED 10,000 – 25,000 / year)',
    '₹5 Lakhs – ₹15 Lakhs / year (or AED 25,000 – 65,000 / year)',
    '₹15 Lakhs+ / year (International / Private University Track)'
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
      errors.name = 'Student full name is required (minimum 2 characters).';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Student full name must not exceed 100 characters.';
    }

    if (!formData.phone || formData.phone.length < 7) {
      errors.phone = 'Valid contact number is required (at least 7 digits).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.currentQualification) {
      errors.currentQualification = 'Please select your current qualification.';
    }

    if (!formData.academicResults || formData.academicResults.trim().length < 2) {
      errors.academicResults = 'Please enter your current or most recent academic results (e.g. 85%, CGPA 8.2, or Predicted Grades).';
    }

    if (!formData.preferredCourse || formData.preferredCourse.trim().length < 2) {
      errors.preferredCourse = 'Please specify your preferred course or degree (e.g. B.E. Computer Science, B.Sc., B.A., MBA).';
    }

    if (!formData.preferredDestination) {
      errors.preferredDestination = 'Please select a preferred study destination.';
    }

    if (!formData.intendedIntake) {
      errors.intendedIntake = 'Please select your intended admission year or intake.';
    }

    if (!formData.consent) {
      errors.consent = 'Please confirm privacy consent to submit your admission enquiry.';
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
      trackEnquiryValidationFailure('college_admissions_page', 'college-adm', Object.keys(errors));
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();
    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    const notesText = formData.additionalQuestions && formData.additionalQuestions.trim()
      ? formData.additionalQuestions.trim()
      : 'Requesting structured guidance on course eligibility, college options, and admission checklist.';

    const customMetadata = {
      serviceType: 'College Admission Assistance',
      currentQualification: formData.currentQualification,
      academicResults: formData.academicResults.trim(),
      preferredCourse: formData.preferredCourse.trim(),
      preferredCollege: formData.preferredCollege ? formData.preferredCollege.trim() : 'Open to Advisor Recommendations',
      preferredDestination: formData.preferredDestination,
      intendedIntake: formData.intendedIntake,
      estimatedBudget: formData.estimatedBudget || 'Not specified',
      documentChecklistStatus: {
        marksheets10and12: 'Pending Review',
        diplomaOrDegreeCertificate: 'Not Assessed',
        academicTranscripts: 'Pending Review',
        governmentIdOrPassport: 'Pending Review',
        statementOfPurpose: 'If Required',
        recommendationLetters: 'If Required',
        englishProficiency: 'If Required',
        institutionSpecificDocs: 'If Required'
      },
      applicationSubmissionDate: '',
      applicationDeadline: '',
      offerStatus: 'Not Applied Yet',
      outstandingConditions: 'Pending initial eligibility & document review'
    };

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhone,
      company: formData.preferredCollege && formData.preferredCollege.trim()
        ? `Target: ${formData.preferredCollege.trim()}`
        : `Applicant (${formData.currentQualification})`,
      organizationName: formData.preferredDestination,
      serviceId: 'college-adm',
      serviceTitle: 'College Admission Assistance',
      countryInterest: formData.preferredDestination,
      assistanceType: 'Course Selection, Eligibility & Application Support',
      degreeLevel: formData.preferredCourse.trim(),
      intakeTerm: formData.intendedIntake,
      jobTitle: formData.preferredCourse.trim(),
      skills: `Results: ${formData.academicResults.trim()}`,
      salaryRange: formData.estimatedBudget || null,
      currentStage: 'New Enquiry',
      preferredContactMethod: formData.consultationMethod,
      consultationDate: formData.appointmentDate || null,
      consultationTime: formData.timeSlot || null,
      consultationMode: formData.consultationMethod || 'Online Video Consultation',
      status: 'New Enquiry',
      priority: 'High',
      customFields: customMetadata,
      message: `[College Admission Consultation Enquiry]\n\n• Student Name: ${formData.name.trim()}\n• Current Qualification: ${formData.currentQualification}\n• Academic Results: ${formData.academicResults.trim()}\n• Preferred Course / Degree: ${formData.preferredCourse.trim()}\n• Preferred College / University: ${formData.preferredCollege.trim() || 'Open to suitable recommendations'}\n• Preferred Study Destination: ${formData.preferredDestination}\n• Intended Admission Intake: ${formData.intendedIntake}\n• Estimated Budget: ${formData.estimatedBudget || 'Not specified'}\n• Preferred Consultation Mode: ${formData.consultationMethod} (${formData.appointmentDate} - ${formData.timeSlot})\n\nAdditional Questions:\n${notesText}`,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
    };

    try {
      const { ok, data: result } = await submitLeadWithFallback(payload);

      if (!ok || !result?.success) {
        throw new Error(result?.message || 'Unable to submit your college admission enquiry right now. Please check your details and try again.');
      }

      const confirmedRef = result.data?.referenceNumber || `REV-CADM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const successData = {
        referenceNumber: confirmedRef,
        id: result.data?.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhone,
        currentQualification: formData.currentQualification,
        academicResults: formData.academicResults.trim(),
        preferredCourse: formData.preferredCourse.trim(),
        preferredCollege: formData.preferredCollege.trim() || 'Advisor Shortlist Requested',
        preferredDestination: formData.preferredDestination,
        intendedIntake: formData.intendedIntake,
        estimatedBudget: formData.estimatedBudget || 'To be discussed',
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot
      };

      setSubmissionSuccess(successData);

      trackEnquiryConversion(
        confirmedRef,
        'college-adm',
        'College Admission Assistance',
        'Admissions',
        'college_admissions_page'
      );

      if (onSuccessCallback) {
        onSuccessCallback(successData);
      }
    } catch (err) {
      console.error('College admission enquiry submission error:', err);
      setSubmitError(err.message || 'A network error occurred while saving your enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      countryCode: '+91',
      phone: '',
      email: '',
      currentQualification: 'Class 12 / Higher Secondary (Completed or Appearing)',
      academicResults: '',
      preferredCourse: '',
      preferredCollege: '',
      preferredDestination: 'India (Premier Colleges & Universities)',
      intendedIntake: '2026–2027 Academic Intake (Fall / Autumn)',
      estimatedBudget: '',
      consultationMethod: 'Online Video Consultation',
      appointmentDate: tomorrow,
      timeSlot: 'Morning (10:00 AM - 01:00 PM)',
      additionalQuestions: '',
      consent: false
    });
    setFormErrors({});
    setSubmitError(null);
    setSubmissionSuccess(null);
  };

  if (submissionSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`glass-card bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 space-y-6 text-center ${embedded ? '' : 'shadow-luxury'}`}
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
            Admission Enquiry Recorded
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
            Thank You, {submissionSuccess.name}!
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto font-medium">
            Your College Admission Assistance enquiry has been saved to our admissions database and assigned to an academic advisor. We will review your qualifications and connect with you regarding suitable course and college options.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950 p-5 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 dark:border-navy-800">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Official Application Reference</span>
            <span className="font-mono font-black text-gold-600 dark:text-gold-400 text-sm tracking-wide bg-gold-500/10 px-3 py-0.5 rounded border border-gold-500/30">
              {submissionSuccess.referenceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Course / Degree</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{submissionSuccess.preferredCourse}</p>
              <p className="text-[11px] text-slate-500">{submissionSuccess.currentQualification}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Destination & Intake</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{submissionSuccess.preferredDestination}</p>
              <p className="text-[11px] text-gold-600 dark:text-gold-400">{submissionSuccess.intendedIntake}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred College / University</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{submissionSuccess.preferredCollege}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Application Status</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">New Enquiry (Logged in CRM)</p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Please keep your reference number (<strong>{submissionSuccess.referenceNumber}</strong>) for future follow-ups. Note that final admission eligibility and offer decisions rest with the respective institution.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Submit Another Admission Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 ${embedded ? '' : 'shadow-luxury'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-navy-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-gold-600 dark:text-gold-400 text-[11px] font-black uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Direct Admissions Desk • CRM Synchronized</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
            College Admission Consultation
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Share your academic background and course preferences to receive structured eligibility and application guidance.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs shrink-0">
          <p className="text-[10px] font-bold uppercase text-slate-400">Service Association</p>
          <p className="font-extrabold text-navy-900 dark:text-gold-400">College Admission Assistance</p>
        </div>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Unable to Submit Enquiry</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onFocus={() => trackEnquiryStart('college_admissions_page', 'college-adm')}
        noValidate
        className="space-y-6"
      >
        {/* Row 1: Student Full Name, Contact Number with Country Code, Email Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="ca-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ca-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student's full name"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
                }`}
              />
            </div>
            {formErrors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="ca-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Number (with Country Code) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="countryCode"
                aria-label="Country Dialing Code"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-28 px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {countryCodes.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                id="ca-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className={`flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
                }`}
              />
            </div>
            {formErrors.phone && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="ca-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ca-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                  formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
                }`}
              />
            </div>
            {formErrors.email && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.email}</p>}
          </div>
        </div>

        {/* Row 2: Current Qualification & Current or Most Recent Academic Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="ca-qualification" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Qualification <span className="text-rose-500">*</span>
            </label>
            <select
              id="ca-qualification"
              name="currentQualification"
              value={formData.currentQualification}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                formErrors.currentQualification ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
              }`}
            >
              {qualificationOptions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {formErrors.currentQualification && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.currentQualification}</p>}
          </div>

          <div>
            <label htmlFor="ca-results" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current or Most Recent Academic Results <span className="text-rose-500">*</span>
            </label>
            <input
              id="ca-results"
              name="academicResults"
              type="text"
              required
              value={formData.academicResults}
              onChange={handleChange}
              placeholder="e.g. Class 12: 88% (PCM), Diploma: 8.4 CGPA, or Predicted Score"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                formErrors.academicResults ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
              }`}
            />
            {formErrors.academicResults && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.academicResults}</p>}
          </div>
        </div>

        {/* Row 3: Preferred Course or Degree & Preferred College or University (if known) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="ca-course" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Course or Degree <span className="text-rose-500">*</span>
            </label>
            <input
              id="ca-course"
              name="preferredCourse"
              type="text"
              required
              value={formData.preferredCourse}
              onChange={handleChange}
              placeholder="e.g. B.E. Computer Science, B.Sc. Data Science, B.Com, B.A., MBA"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                formErrors.preferredCourse ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
              }`}
            />
            {formErrors.preferredCourse && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.preferredCourse}</p>}
          </div>

          <div>
            <label htmlFor="ca-college" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred College or University (if known)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ca-college"
                name="preferredCollege"
                type="text"
                value={formData.preferredCollege}
                onChange={handleChange}
                placeholder="Optional — enter target college/university or leave blank for recommendations"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Preferred Study Destination, Intended Admission Year or Intake, Estimated Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="ca-destination" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Study Destination <span className="text-rose-500">*</span>
            </label>
            <select
              id="ca-destination"
              name="preferredDestination"
              value={formData.preferredDestination}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                formErrors.preferredDestination ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
              }`}
            >
              {destinationOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {formErrors.preferredDestination && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.preferredDestination}</p>}
          </div>

          <div>
            <label htmlFor="ca-intake" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Intended Admission Year or Intake <span className="text-rose-500">*</span>
            </label>
            <select
              id="ca-intake"
              name="intendedIntake"
              value={formData.intendedIntake}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                formErrors.intendedIntake ? 'border-rose-500' : 'border-slate-200 dark:border-navy-800'
              }`}
            >
              {intakeOptions.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            {formErrors.intendedIntake && <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.intendedIntake}</p>}
          </div>

          <div>
            <label htmlFor="ca-budget" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Estimated Budget (if relevant)
            </label>
            <select
              id="ca-budget"
              name="estimatedBudget"
              value={formData.estimatedBudget}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {budgetOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Additional Questions */}
        <div>
          <label htmlFor="ca-questions" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Additional Questions or Specific Admission Requirements
          </label>
          <textarea
            id="ca-questions"
            name="additionalQuestions"
            rows={3}
            value={formData.additionalQuestions}
            onChange={handleChange}
            placeholder="Share any questions regarding course eligibility, lateral entry, credit transfer, document checklist, or application timelines..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>

        {/* Privacy Consent */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              I consent to The Revival International collecting and processing my academic and contact details to provide College Admission Assistance and consultation follow-up. I understand that final admission and offer decisions are made solely by the respective educational institution. <span className="text-rose-500 font-bold">*</span>
            </span>
          </label>
          {formErrors.consent && <p className="text-[11px] text-rose-500 font-medium pl-7">{formErrors.consent}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Confidential student data protection • No guaranteed admission claims</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Admission Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Admission Enquiry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


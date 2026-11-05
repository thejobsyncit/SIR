import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, ShieldCheck, Sparkles, Building2, Globe2,
  BookOpen, AlertCircle, Loader2, ArrowRight, User, Mail, Phone,
  GraduationCap, MapPin, Monitor
} from 'lucide-react';
import { submitExamEnquiry } from '../../services/academyService';
import { isInternationalOrGccExam } from './SearchableCountrySelect';
import { useApp } from '../../context/AppContext';
import {
  savePendingStudentAcademyEnquiry,
  getPendingStudentAcademyEnquiry,
  clearPendingStudentAcademyEnquiry
} from '../../utils/studentAcademyAuth.js';

export const ExamEnquiryModal = ({ isOpen, onClose, exam, selectedCourse, category }) => {
  const { user, navigateTo } = useApp();
  const isInternationalOrGcc = isInternationalOrGccExam(exam, category);

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    qualification: '',
    preferredLearningMode: selectedCourse?.deliveryMode || '',
    preferredLocation: '',
    consent: false
  });

  
  // Pre-fill user details or restore saved inquiry formData
  useEffect(() => {
    if (isOpen) {
      const pending = getPendingStudentAcademyEnquiry();
      if (pending && pending.formData) {
        setFormData(prev => ({
          ...prev,
          ...pending.formData,
          studentName: pending.formData.studentName || user?.fullName || user?.name || prev.studentName,
          email: pending.formData.email || user?.email || prev.email,
          phone: pending.formData.phone || user?.phone || prev.phone
        }));
        clearPendingStudentAcademyEnquiry();
      } else if (user) {
        setFormData(prev => ({
          ...prev,
          studentName: prev.studentName || user.fullName || user.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || ''
        }));
      }
    }
  }, [isOpen, user]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Sync defaults whenever exam or selectedCourse changes
  useEffect(() => {
    if (exam) {
      setFormData((prev) => ({
        ...prev,
        preferredLocation: '',
        preferredLearningMode: selectedCourse?.deliveryMode || prev.preferredLearningMode || ''
      }));
    }
  }, [exam, selectedCourse, category]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleModalClose();
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
  }, [isOpen, loading]);

  if (!isOpen || !exam) return null;

  const handleModalClose = () => {
    setError(null);
    setFieldErrors({});
    setSuccessResult(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newVal
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  };

  const validate = () => {
    const errors = {};

    // 1. Selected Examination / Pathway
    if (!exam || (!exam.id && !exam.name && !exam.code)) {
      errors.exam = 'A valid examination or pathway must be selected.';
    }

    // 2. Student Full Name
    const trimmedName = (formData.studentName || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.studentName = 'Please enter your full name (minimum 2 characters).';
    } else if (/^\d+$/.test(trimmedName)) {
      errors.studentName = 'Full name cannot consist only of numbers.';
    } else if (!/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s.'\-(),]+$/.test(trimmedName)) {
      errors.studentName = 'Full name cannot contain numbers or unsupported special characters.';
    }

    // 3. Email Address
    const trimmedEmail = (formData.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address with a domain extension (e.g. name@example.com).';
    }

    // 4. Mobile / WhatsApp Number
    const rawPhone = (formData.phone || '').trim();
    const cleanPhone = rawPhone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please provide a valid mobile or WhatsApp number with country code.';
    } else if (!/^[0-9+\s\-()]+$/.test(rawPhone)) {
      errors.phone = 'Phone number can only contain digits, spaces, and formatting characters (+, -, ()).';
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.phone = `Phone number must be between 7 and 15 digits (currently ${cleanPhone.length} digits).`;
    }

    // 5. Current Qualification
    const trimmedQual = (formData.qualification || '').trim();
    if (!trimmedQual) {
      errors.qualification = 'Please select your current educational qualification.';
    }

    // 6. Preferred Learning Mode
    const trimmedMode = (formData.preferredLearningMode || '').trim();
    if (!trimmedMode) {
      errors.preferredLearningMode = 'Please select your preferred learning mode.';
    }

    // 7. Target Country
    const trimmedLoc = (formData.preferredLocation || '').trim();
    if (!trimmedLoc) {
      errors.preferredLocation = 'Please enter your target country.';
    }

    // 8. Communication Consent Checkbox
    if (!formData.consent) {
      errors.consent = 'You must acknowledge the communication consent to proceed.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please resolve the highlighted required fields before submitting.');
      return;
    }

    // Authentication Guard: If guest user, preserve entered details and redirect to login
    const isAuthenticated = Boolean(user && user.email);
    if (!isAuthenticated) {
      savePendingStudentAcademyEnquiry({
        exam,
        selectedCourse,
        category,
        route: 'education-school-academy',
        formData: {
          studentName: formData.studentName,
          email: formData.email,
          phone: formData.phone,
          qualification: formData.qualification,
          preferredLearningMode: formData.preferredLearningMode,
          preferredLocation: formData.preferredLocation,
          consent: formData.consent
        },
        action: 'submit_exam_enquiry',
        view: 'directory_modal'
      });
      navigateTo('login');
      handleModalClose();
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        examId: exam.id,
        examName: exam.name,
        qualification: formData.qualification.trim(),
        preferredLearningMode: formData.preferredLearningMode.trim(),
        preferredLocation: formData.preferredLocation.trim(),
        targetCountry: formData.preferredLocation.trim(),
        countryInterest: formData.preferredLocation.trim(),
        message: '',
        academyId: selectedCourse ? 'verified-academy-partner' : 'revival-advisory',
        academyName: selectedCourse ? selectedCourse.academyName : 'Revival International Academic Advisory',
        courseId: selectedCourse ? selectedCourse.id : `${exam.id}-guidance`,
        courseName: selectedCourse ? selectedCourse.courseName : `${exam.code} Examination & Licensing Guidance`,
        enquiryType: selectedCourse ? 'Course Enquiry' : 'Exam Enquiry',
        consent: Boolean(formData.consent),
        isExamEnquiry: true
      };

      const result = await submitExamEnquiry(payload);

      setSuccessResult({
        referenceNumber: result.referenceNumber,
        studentName: formData.studentName.trim(),
        examName: exam.name,
        examCode: exam.code,
        categoryName: exam.categoryName || category?.name || 'Competitive Examinations',
        country: exam.country,
        targetCountry: formData.preferredLocation.trim(),
        isInternationalOrGcc,
        courseName: selectedCourse ? selectedCourse.courseName : '1-on-1 Strategic Advisory & Preparation Plan',
        academyName: selectedCourse ? selectedCourse.academyName : 'Revival International Student Advisory'
      });
    } catch (err) {
      setError(err.message || 'Failed to submit examination enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-navy-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      onClick={handleModalClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b border-slate-200 dark:border-navy-800 shrink-0">
          <button
            onClick={handleModalClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1.5 pr-8">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30 uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Student Academy • Official Advisory Enquiry</span>
            </span>

            <h2 id="enquiry-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
              {selectedCourse ? 'Enquire for Course & Academy' : 'Request Examination Consultation'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit your academic background to receive authenticated course fees, verified dates, and registration assistance.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {successResult ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Enquiry Confirmed &amp; Logged to CRM
                </span>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                  Consultation Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <strong className="text-navy-900 dark:text-white">{successResult.studentName}</strong>. Your examination inquiry has been securely registered in our student advisory CRM.
                </p>
              </div>

              {/* Inquiry Details Card */}
              <div className="max-w-md mx-auto bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 text-left space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Reference ID</span>
                  <span className="text-xs font-mono font-black text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-md border border-gold-500/20">
                    {successResult.referenceNumber}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Selected Examination:</span>
                    <span className="font-bold text-navy-900 dark:text-white">{successResult.examName} ({successResult.examCode})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Academic Category:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{successResult.categoryName}</span>
                  </div>

                  {selectedCourse && (
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Selected Course &amp; Academy:</span>
                      <span className="font-bold text-gold-600 dark:text-gold-400">{successResult.courseName}</span>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{successResult.academyName}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      {successResult.isInternationalOrGcc ? 'Target Country:' : 'Target Study Location:'}
                    </span>
                    <span className="font-bold text-navy-900 dark:text-white">
                      {successResult.targetCountry || successResult.country}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>A Senior Academic Advisor will review your profile and connect within 24 hours.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleModalClose}
                  className="px-8 py-3 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                >
                  Done &amp; Return to Directory
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Highlighted Selected Exam Context Banner */}
              <div className={`bg-slate-50 dark:bg-navy-950 border ${fieldErrors.exam ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-gold-500/30'} rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>Selected Examination / Pathway</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Auto-Populated
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-gold-600 dark:text-gold-400">
                      {exam.code}
                    </div>
                    <div className="font-serif text-xs font-bold text-navy-900 dark:text-white">
                      {exam.name}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                    {exam.country && <div>{exam.country}</div>}
                    <div>{exam.conductingBody}</div>
                  </div>
                </div>

                {selectedCourse && (
                  <div className="pt-2 border-t border-slate-200 dark:border-navy-800 mt-2 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Academy Course:</span>
                      <span className="font-bold text-navy-900 dark:text-white">{selectedCourse.courseName}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gold-600 dark:text-gold-400 shrink-0">
                      {selectedCourse.academyName}
                    </span>
                  </div>
                )}
              </div>
              {fieldErrors.exam && (
                <p className="text-[11px] text-rose-500 font-medium">{fieldErrors.exam}</p>
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="input-enquiry-studentName" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-500" />
                    <span>Student Full Name</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-enquiry-studentName"
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.studentName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition`}
                  />
                  {fieldErrors.studentName && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.studentName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="input-enquiry-email" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-500" />
                    <span>Email Address</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-enquiry-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Mobile / WhatsApp */}
                <div className="space-y-1">
                  <label htmlFor="input-enquiry-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-500" />
                    <span>Mobile Number</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="input-enquiry-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Academic Qualification */}
                <div className="space-y-1">
                  <label htmlFor="select-enquiry-qualification" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                    <span>Current Qualification</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    id="select-enquiry-qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.qualification ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition cursor-pointer`}
                  >
                    <option value="">Select your qualification</option>
                    <option value="High School (10th / 12th)">High School (10th / 12th)</option>
                    <option value="Undergraduate Student (Pursuing)">Undergraduate Student (Pursuing)</option>
                    <option value="Bachelor's Degree">Bachelor's Degree (B.E./B.Tech/B.Sc/B.Com/B.A.)</option>
                    <option value="MBBS / BDS / Medical Graduate">MBBS / BDS / Medical Graduate</option>
                    <option value="Master's / Post Graduate">Master's / Post Graduate (M.Tech/MBA/M.Sc)</option>

                  </select>
                  {fieldErrors.qualification && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.qualification}</p>
                  )}
                </div>

                {/* Preferred Learning Mode */}
                <div className="space-y-1">
                  <label htmlFor="select-enquiry-learning-mode" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-gold-500" />
                    <span>Preferred Learning Mode</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    id="select-enquiry-learning-mode"
                    name="preferredLearningMode"
                    value={formData.preferredLearningMode}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.preferredLearningMode ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition cursor-pointer`}
                  >
                    <option value="">Select preferred learning mode</option>
                    <option value="Online Live">Online Live Interactive</option>
                    <option value="Classroom (Dubai / Branch)">Classroom </option>
                    <option value="Hybrid (Classroom + Online)">Hybrid (Classroom + Online)</option>
                  </select>
                  {fieldErrors.preferredLearningMode && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.preferredLearningMode}</p>
                  )}
                </div>

                {/* Target Country Selection (International Exams & GCC Licensing) */}
                {isInternationalOrGcc ? (
                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor="input-enquiry-target-country"
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-gold-500" />
                      <span>Target Country</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-enquiry-target-country"
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      placeholder="Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.preferredLocation ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition`}
                    />
                    {fieldErrors.preferredLocation && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.preferredLocation}</p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Specify your preferred destination country or GCC licensing jurisdiction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor="input-enquiry-target-location"
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gold-500" />
                      <span>Target Country</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="input-enquiry-target-location"
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      placeholder="Enter your target country (e.g., India, UAE, UK, Saudi Arabia)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${fieldErrors.preferredLocation ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-navy-700 focus:ring-gold-500'} bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:outline-none transition`}
                    />
                    {fieldErrors.preferredLocation && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.preferredLocation}</p>
                    )}
                  </div>
                )}

                {/* Consent Checkbox */}
                <div className="sm:col-span-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      id="checkbox-enquiry-consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className={`mt-0.5 rounded ${fieldErrors.consent ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'} text-gold-600 focus:ring-gold-500 w-4 h-4 cursor-pointer`}
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      I agree to receive verified course syllabus details, fee estimates, and consultation advice from Revival International Academic Advisory via WhatsApp, phone, or email. <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </label>
                  {fieldErrors.consent && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium pl-6.5">{fieldErrors.consent}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gold-shimmer text-navy-950 font-extrabold text-xs shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Consultation Enquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

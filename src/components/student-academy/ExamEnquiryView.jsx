import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, CheckCircle2, Award, Calendar, BookOpen,
  ShieldCheck, HelpCircle,
  Clock, Globe, ExternalLink, FileText, Send, AlertCircle,
  Building2, MapPin, User, Mail, Phone, Layers, Check
} from 'lucide-react';
import { getExamById } from '../../data/studentAcademyData';
import { getExamEnquiryDetails } from '../../data/examEnquiryDetailsData';
import { submitExamEnquiry } from '../../services/academyService';
import {
  SearchableCountrySelect,
  isInternationalOrGccExam,
  resolveDefaultExamCountry
} from './SearchableCountrySelect';

export const ExamEnquiryView = ({ examId, onBackToExams }) => {
  const exam = useMemo(() => getExamById(examId), [examId]);
  const details = useMemo(() => getExamEnquiryDetails(examId, exam), [examId, exam]);
  const isInternationalOrGcc = useMemo(
    () => isInternationalOrGccExam(exam, { id: exam?.category || exam?.categoryId }),
    [exam]
  );

  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    qualification: 'Undergraduate Degree (B.A./B.Sc/B.Com)',
    preferredLearningMode: 'Online Live',
    preferredLocation: isInternationalOrGcc ? resolveDefaultExamCountry(exam) : 'Online / Remote',
    message: '',
    selectedCourseOption: ''
  });

  React.useEffect(() => {
    if (exam && isInternationalOrGcc) {
      setFormData(prev => ({
        ...prev,
        preferredLocation: resolveDefaultExamCountry(exam)
      }));
    }
  }, [exam, isInternationalOrGcc]);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);

  if (!exam || !details) {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The selected examination information is currently unavailable or the link may have expired.
        </p>
        <button
          onClick={onBackToExams}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs uppercase tracking-wider hover:bg-gold-400 transition"
          id="btn-return-to-directory"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Examinations Directory</span>
        </button>
      </div>
    );
  }

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.studentName.trim() || formData.studentName.trim().length < 2) {
      errors.studentName = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim() || phoneDigits.length < 7) {
      errors.phone = 'Please enter a valid mobile number with country code.';
    }

    if (!formData.qualification.trim()) {
      errors.qualification = 'Please select your current educational qualification.';
    }

    if (!formData.preferredLocation.trim()) {
      errors.preferredLocation = isInternationalOrGcc ? 'Please select your target country.' : 'Please specify your preferred study location.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentName: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        examId: exam.id,
        examName: `${details.fullName} (${details.abbreviation})`,
        qualification: formData.qualification,
        preferredLearningMode: formData.preferredLearningMode,
        preferredLocation: formData.preferredLocation,
        targetCountry: formData.preferredLocation,
        countryInterest: formData.preferredLocation,
        message: formData.message,
        courseName: formData.selectedCourseOption || `${details.abbreviation} Comprehensive Coaching & Advisory`
      };

      const result = await submitExamEnquiry(payload);
      setSubmissionSuccess(result);
    } catch (err) {
      console.error('Submission error:', err);
      setApiError(err.message || 'An error occurred while submitting your enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in" id="exam-enquiry-page">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToExams}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 transition"
          id="btn-back-to-exams"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Examinations</span>
        </button>

        <span className="text-xs font-black px-3.5 py-1 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30 uppercase tracking-wider">
          Official Exam Enquiry Portal
        </span>
      </div>

      {/* Hero Banner: Selected Exam Overview */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-luxury space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-black uppercase tracking-wider">
              {details.abbreviation}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Conducted by: <strong className="text-navy-900 dark:text-white font-bold">{details.conductingBody}</strong>
            </span>
            {details.importantDates?.examinationDates && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase border border-emerald-500/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next Cycle: {details.importantDates.examinationDates}</span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-navy-900 dark:text-white tracking-tight leading-tight">
            {details.fullName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
            {details.overview}
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-navy-900 dark:text-white font-serif">Target Career Mandate:</span>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{details.purpose}</p>
            </div>
            {details.officialWebsite && (
              <a
                href={details.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs transition border border-slate-200 dark:border-navy-700 shrink-0"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3 text-gold-500" />
              </a>
            )}
          </div>

          {/* Eligibility & Qualification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1">
              <div className="flex items-center gap-2 text-navy-900 dark:text-white font-bold font-serif">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Educational Qualification</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6 font-medium text-xs">{details.educationalQualifications}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1">
              <div className="flex items-center gap-2 text-navy-900 dark:text-white font-bold font-serif">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Age Limits &amp; Category Relaxations</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6 font-medium text-xs">{details.ageLimit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Exam Enquiry & Support */}
      <div className="glass-card bg-white dark:bg-navy-900 border-2 border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-6" id="enquiry-form-card">
        {submissionSuccess ? (
          /* Success State */
          <div className="space-y-5 text-center py-6 animate-fade-in" id="enquiry-success-message">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Enquiry Registered Successfully
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Thank You, {submissionSuccess.data.studentName}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
                Your enquiry for <strong>{details.fullName}</strong> has been assigned to our senior academic counselor.
              </p>
            </div>

            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-navy-800">
                <span className="text-slate-500">Reference Number:</span>
                <strong className="text-gold-500 font-mono text-sm">{submissionSuccess.referenceNumber}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Selected Exam:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{details.abbreviation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Preferred Mode:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{submissionSuccess.data.preferredLearningMode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{isInternationalOrGcc ? 'Target Country:' : 'Study Location:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{submissionSuccess.data.preferredLocation}</span>
              </div>
            </div>

            <div className="max-w-md mx-auto pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  setFormData(prev => ({
                    ...prev,
                    studentName: '',
                    email: '',
                    phone: '',
                    message: ''
                  }));
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-navy-700"
              >
                Submit Another Query
              </button>
              <button
                onClick={onBackToExams}
                className="flex-1 py-2.5 rounded-xl bg-gold-shimmer hover:opacity-95 text-navy-950 text-xs font-extrabold uppercase tracking-wider transition shadow-gold-glow active-scale"
              >
                Return to All Examinations
              </button>
            </div>
          </div>
        ) : (
          /* Active Form */
          <form onSubmit={handleSubmit} className="space-y-5" id="form-exam-enquiry">
            <div className="flex items-center gap-2.5 text-gold-600 dark:text-gold-400 border-b border-slate-100 dark:border-navy-800 pb-3">
              <Send className="w-5 h-5 text-gold-500" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                Exam Enquiry &amp; Support
              </h2>
            </div>

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Auto-populated Selected Exam */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selected Examination (Pre-populated)
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs font-bold text-gold-600 dark:text-gold-400 flex items-center justify-between">
                <span>{details.fullName} ({details.abbreviation})</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-500 uppercase font-black">
                  Locked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar / Sarah Jenkins"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border ${formErrors.studentName ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      } text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium`}
                    id="input-enquiry-studentName"
                  />
                </div>
                {formErrors.studentName && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.studentName}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border ${formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      } text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium`}
                    id="input-enquiry-email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+971 50 123 4567 or +91 98400 12345"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border ${formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      } text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium`}
                    id="input-enquiry-phone"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Educational Qualification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Educational Qualification <span className="text-rose-500">*</span>
                </label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium cursor-pointer"
                  id="select-enquiry-qualification"
                >
                  <option value="High School / 12th Standard">High School / 12th Standard</option>
                  <option value="Undergraduate Degree (B.A./B.Sc/B.Com)">Undergraduate Degree (B.A./B.Sc/B.Com)</option>
                  <option value="Engineering Degree (B.E./B.Tech)">Engineering Degree (B.E./B.Tech)</option>
                  <option value="Medical / Dental / Allied Health (MBBS/BDS/B.Pharm)">Medical / Dental / Allied Health (MBBS/BDS/B.Pharm)</option>
                  <option value="Postgraduate Degree (M.A./M.Sc/M.Com/MBA/M.Tech)">Postgraduate Degree (M.A./M.Sc/M.Com/MBA/M.Tech)</option>
                  <option value="Polytechnic Diploma Holder">Polytechnic Diploma Holder</option>
                  <option value="Working Professional / Other">Working Professional / Other</option>
                </select>
              </div>

              {/* Preferred Coaching Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Coaching Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Online Live', 'Offline Classroom', 'Hybrid'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredLearningMode: mode }))}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${formData.preferredLearningMode === mode
                        ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 border-navy-900 dark:border-gold-500 shadow-md font-bold'
                        : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:border-gold-500/50 font-medium'
                        }`}
                      id={`btn-mode-${mode.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Country (International & GCC) vs Preferred Study Location (Indian) */}
              {isInternationalOrGcc ? (
                <div>
                  <label 
                    htmlFor="input-enquiry-target-country"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Target Country <span className="text-rose-500">*</span>
                  </label>
                  <SearchableCountrySelect
                    id="input-enquiry-target-country"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={(countryName) => {
                      setFormData(prev => ({ ...prev, preferredLocation: countryName }));
                      if (formErrors.preferredLocation) {
                        setFormErrors(prev => ({ ...prev, preferredLocation: null }));
                      }
                    }}
                    error={formErrors.preferredLocation}
                    placeholder="Select Target Country..."
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Select your preferred destination country or GCC licensing jurisdiction.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Study Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      placeholder="e.g. Dubai, Chennai, Delhi, Bangalore, or Online"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border ${formErrors.preferredLocation ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                        } text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium`}
                      id="input-enquiry-location"
                    />
                  </div>
                  {formErrors.preferredLocation && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.preferredLocation}</p>
                  )}
                </div>
              )}
            </div>

            {/* Message or Additional Questions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Message or Questions (Optional)
              </label>
              <textarea
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleChange}
                placeholder="Ask about test series, batch timings, fees, or specific subject guidance..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none font-medium"
                id="textarea-enquiry-message"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-shimmer hover:opacity-95 text-navy-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-gold-glow active-scale disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              id="btn-submit-exam-enquiry"
            >
              {isSubmitting ? (
                <span>Registering Enquiry...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Exam Enquiry</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
              🔒 Your contact information is kept strictly confidential. Zero spam guarantee.
            </p>
          </form>
        )}
      </div>

      {/* 2. Exam Pattern, Stages & Marking Scheme */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 text-gold-600 dark:text-gold-400 border-b border-slate-100 dark:border-navy-800 pb-3">
          <Award className="w-5 h-5 text-gold-500" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white uppercase tracking-wider">
            Exam Pattern, Stages &amp; Marking Scheme
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          <strong className="text-navy-900 dark:text-white">Structure:</strong> {details.pattern}
        </p>

        {/* Stages Stack */}
        {details.stages && details.stages.length > 0 && (
          <div className="space-y-3 pt-1">
            {details.stages.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 text-xs sm:text-sm space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif font-bold text-navy-900 dark:text-white">{stage.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold text-xs border border-gold-500/30">
                    {stage.marks}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">{stage.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-medium">
          <strong>Marking Scheme &amp; Penalty:</strong> {details.markingScheme}
        </div>
      </div>

      {/* 3. Syllabus & Important Topics */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 text-gold-600 dark:text-gold-400 border-b border-slate-100 dark:border-navy-800 pb-3">
          <BookOpen className="w-5 h-5 text-gold-500" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white uppercase tracking-wider">
            Syllabus &amp; Important Topics
          </h2>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          {Array.isArray(details.syllabusTopics) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {details.syllabusTopics.map((topic, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{details.syllabusTopics}</p>
          )}
        </div>
      </div>

      {/* 4. Application Process & Required Documents */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 text-gold-600 dark:text-gold-400 border-b border-slate-100 dark:border-navy-800 pb-3">
          <FileText className="w-5 h-5 text-gold-500" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white uppercase tracking-wider">
            Application Process &amp; Required Documents
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-2.5">
            <strong className="text-navy-900 dark:text-white block font-serif font-bold text-xs sm:text-sm">How to Apply:</strong>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 font-medium">
              {details.applicationProcess.map((step, idx) => (
                <li key={idx} className="leading-relaxed pl-1">{step}</li>
              ))}
            </ol>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2.5">
            <strong className="text-navy-900 dark:text-white block font-serif font-bold text-xs sm:text-sm">Mandatory Documents Checklist:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {details.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

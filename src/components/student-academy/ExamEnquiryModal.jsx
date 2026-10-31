import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, ShieldCheck, Sparkles, Building2, Globe2,
  BookOpen, AlertCircle, Loader2, ArrowRight, User, Mail, Phone,
  GraduationCap, MapPin, Monitor
} from 'lucide-react';
import { submitExamEnquiry } from '../../services/academyService';
import {
  SearchableCountrySelect,
  isInternationalOrGccExam,
  resolveDefaultExamCountry
} from './SearchableCountrySelect';

export const ExamEnquiryModal = ({ isOpen, onClose, exam, selectedCourse, category }) => {
  const isInternationalOrGcc = isInternationalOrGccExam(exam, category);

  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    qualification: 'Bachelor\'s Degree',
    preferredLearningMode: selectedCourse?.deliveryMode || 'Online Live',
    preferredLocation: isInternationalOrGcc ? resolveDefaultExamCountry(exam) : (exam?.country || 'Dubai, UAE'),
    message: '',
    consent: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Sync defaults whenever exam or selectedCourse changes
  useEffect(() => {
    if (exam) {
      const isIntlOrGcc = isInternationalOrGccExam(exam, category);
      const initialLocation = isIntlOrGcc
        ? resolveDefaultExamCountry(exam)
        : (exam.country || 'Dubai, UAE');

      setFormData((prev) => ({
        ...prev,
        preferredLocation: initialLocation,
        preferredLearningMode: selectedCourse?.deliveryMode || 'Online Live',
        message: selectedCourse 
          ? `I am inquiring about the ${selectedCourse.courseName} by ${selectedCourse.academyName} for ${exam.code}. Please provide upcoming batch dates and enrollment details.`
          : `I am seeking advisory and preparation guidance for ${exam.name} (${exam.code}).`
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
    setSuccessResult(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.studentName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (formData.phone.trim().length < 7) {
      setError('Please provide a valid mobile or WhatsApp number with country code.');
      return;
    }
    if (!formData.qualification.trim()) {
      setError('Please specify your current educational qualification.');
      return;
    }
    if (!formData.preferredLocation || !formData.preferredLocation.trim()) {
      setError(isInternationalOrGcc ? 'Please select your target country.' : 'Please specify your preferred study location.');
      return;
    }
    if (!formData.consent) {
      setError('Please acknowledge the communication consent to proceed.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        examId: exam.id,
        examName: exam.name,
        qualification: formData.qualification.trim(),
        preferredLearningMode: formData.preferredLearningMode,
        preferredLocation: formData.preferredLocation.trim(),
        targetCountry: formData.preferredLocation.trim(),
        countryInterest: formData.preferredLocation.trim(),
        message: formData.message.trim(),
        academyId: selectedCourse ? 'verified-academy-partner' : 'revival-advisory',
        academyName: selectedCourse ? selectedCourse.academyName : 'Revival International Academic Advisory',
        courseId: selectedCourse ? selectedCourse.id : `${exam.id}-guidance`,
        courseName: selectedCourse ? selectedCourse.courseName : `${exam.code} Examination & Licensing Guidance`,
        enquiryType: selectedCourse ? 'Course Enquiry' : 'Exam Enquiry'
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Highlighted Selected Exam Context Banner */}
              <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Selected Examination / Pathway
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-500" />
                    <span>Student Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-500" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                {/* Mobile / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-500" />
                    <span>Mobile / WhatsApp Number *</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +971 50 123 4567 / +91 98765 43210"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                {/* Academic Qualification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                    <span>Current Qualification *</span>
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="High School (10th / 12th)">High School (10th / 12th)</option>
                    <option value="Undergraduate Student (Pursuing)">Undergraduate Student (Pursuing)</option>
                    <option value="Bachelor's Degree">Bachelor's Degree (B.E./B.Tech/B.Sc/B.Com/B.A.)</option>
                    <option value="MBBS / BDS / Medical Graduate">MBBS / BDS / Medical Graduate</option>
                    <option value="Master's / Post Graduate">Master's / Post Graduate (M.Tech/MBA/M.Sc)</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>

                {/* Preferred Learning Mode */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-gold-500" />
                    <span>Preferred Learning Mode</span>
                  </label>
                  <select
                    name="preferredLearningMode"
                    value={formData.preferredLearningMode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="Online Live">Online Live Interactive</option>
                    <option value="Classroom (Dubai / Branch)">Classroom (Dubai / Branch)</option>
                    <option value="Hybrid (Classroom + Online)">Hybrid (Classroom + Online)</option>
                    <option value="Weekend Batch">Weekend Batch</option>
                    <option value="Self-Paced with Mentorship">Self-Paced with Mentorship</option>
                  </select>
                </div>

                {/* Target Country Selection (International Exams & GCC Licensing) vs Study Location (Indian Exams) */}
                {isInternationalOrGcc ? (
                  <div className="space-y-1 sm:col-span-2">
                    <label 
                      htmlFor="input-enquiry-target-country"
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-gold-500" />
                      <span>Target Country *</span>
                    </label>
                    <SearchableCountrySelect
                      id="input-enquiry-target-country"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={(countryName) => {
                        setFormData(prev => ({ ...prev, preferredLocation: countryName }));
                        if (error) setError(null);
                      }}
                      placeholder="Select Target Country..."
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Select your preferred destination country or GCC licensing jurisdiction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-500" />
                      <span>Target Study Destination / Country *</span>
                    </label>
                    <input
                      type="text"
                      name="preferredLocation"
                      value={formData.preferredLocation}
                      onChange={handleChange}
                      placeholder="e.g. Dubai / UAE, Saudi Arabia, UK, Germany, USA, India"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Questions / Message */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Specific Questions or Background (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your target score, exam timeline, or specific coaching requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-navy-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-gold-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="sm:col-span-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-300 text-gold-600 focus:ring-gold-500 w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      I agree to receive verified course syllabus details, fee estimates, and consultation advice from Revival International Academic Advisory via WhatsApp, phone, or email.
                    </span>
                  </label>
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


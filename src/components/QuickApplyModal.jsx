import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import CountryPhoneInput from './common/CountryPhoneInput';
import SITE_CONFIG from '../config/siteConfig';

export const QuickApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user, applyForJob, navigateTo, openAuthModal, setPendingJobToApply } = useApp();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(() => {
    // Only pre-fill if it's a real user-entered phone, never a dummy mock number
    if (user?.phone && !user.phone.includes('123 4567') && !user.phone.includes('1234567') && !user.phone.includes('9876543210')) {
      return user.phone;
    }
    return '';
  });

  useEffect(() => {
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone && !user.phone.includes('123 4567') && !user.phone.includes('1234567') && !user.phone.includes('9876543210')) {
      setPhone(user.phone);
    }
  }, [user]);
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, error: null });
  const [resumeFile, setResumeFile] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Post-submission state
  const [isSuccess, setIsSuccess] = useState(false);

  const isExpired = Boolean(
    job?.closingDate && new Date(job.closingDate).setHours(23, 59, 59, 999) < Date.now()
  );

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('CV file size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const validTypes = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      setErrorMsg('Invalid file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    setErrorMsg('');
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user || !user.email) {
      if (setPendingJobToApply) setPendingJobToApply(job);
      if (onClose) onClose();
      if (openAuthModal) openAuthModal('register', 'candidate');
      return;
    }

    if (isExpired) {
      setErrorMsg(`Applications for this position closed on ${job.closingDate}. Submissions are no longer accepted.`);
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!phoneValidation.isValid) {
      setErrorMsg(phoneValidation.error || 'Please enter a valid telephone number.');
      return;
    }

    if (!resumeFile && !user?.resumeName) {
      setErrorMsg('Please attach your CV/Resume file.');
      return;
    }

    if (!consentAgreed) {
      setErrorMsg('You must provide consent for data processing under UAE PDPL & India DPDP Act.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedRef = `RI-APP-${Math.floor(100000 + Math.random() * 900000)}`;

      // Prepare application payload with complete candidate identification
      const appPayload = {
        candidateId: user?.candidateId || user?.id,
        userId: user?.userId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company || 'Revival International Partner Employer',
        location: job.location,
        salary: job.salary,
        name: fullName.trim(),
        applicantName: fullName.trim(),
        email: email.trim().toLowerCase(),
        applicantEmail: email.trim().toLowerCase(),
        phone: phone.trim(),
        applicantPhone: phone.trim(),
        referenceNumber: generatedRef,
        resumeName: resumeFile ? resumeFile.name : (user?.resumeName || 'Applicant-CV.pdf'),
        consentGivenAt: new Date().toISOString(),
        consentVersion: 'v2.0-nov2026'
      };

      // 1. Submit application via applyForJob context (syncs state, localStorage, candidateDB, and SQLite backend)
      if (applyForJob) {
        await applyForJob(job, appPayload);
      } else {
        await fetch('/api/candidate/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appPayload)
        });
      }

      // 2. Also record in CRM leads work queue
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            serviceId: 'quick-apply',
            serviceTitle: `Job Application: ${job.title} (${job.company})`,
            referenceNumber: generatedRef,
            countryInterest: job.country || 'UAE',
            source: 'Quick Apply Portal'
          })
        });
      } catch (err) {
        console.warn('Leads queue sync notice:', err);
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(generatedRef);
      }
    } catch (err) {
      console.error('Quick apply failed:', err);
      setErrorMsg('Unable to submit your application. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-navy-800 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <span className="text-[10px] uppercase font-black tracking-widest text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Instant Quick Apply • 100% Free Placement
          </span>
          <h2 className="text-xl font-bold text-white line-clamp-1">{job.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
            <span>{job.company || 'Leading Enterprise Employer'}</span>
            <span>•</span>
            <span>{job.location}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isExpired ? (
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Applications Closed</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                The application deadline for <strong>{job.title}</strong> at <strong>{job.company}</strong> was <strong>{job.closingDate}</strong>. Submissions for this vacancy are now closed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition cursor-pointer"
              >
                Close & View Open Vacancies
              </button>
            </div>
          ) : !user || !user.email ? (
            <div className="p-5 bg-amber-50 dark:bg-navy-950/60 border border-amber-300 dark:border-gold-500/30 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-gold-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-gold-500" />
                <span>Candidate Registration Required</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                To apply for <strong>{job.title}</strong> at <strong>{job.company}</strong>, you must register a candidate account. Once registered, you will be redirected straight back here to complete your application.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (setPendingJobToApply) setPendingJobToApply(job);
                  if (onClose) onClose();
                  if (openAuthModal) openAuthModal('register', 'candidate');
                }}
                className="w-full mt-2 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Register to Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tariq.mansoor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Country-Aware Phone (Issue #6: Auto-detects region, strictly enforces digit limits) */}
              <CountryPhoneInput
                value={phone}
                onChange={setPhone}
                onValidationChange={setPhoneValidation}
                required
              />

              {/* CV File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Curriculum Vitae (CV) <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-gold-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-navy-950/50">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <Upload className="w-5 h-5 text-gold-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {resumeFile ? resumeFile.name : (user?.resumeName || 'Click to upload PDF, DOCX or DOC')}
                    </span>
                    <span className="text-[10px] text-slate-500">Maximum file size: 10MB</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Consent Checkbox (Issue #3 & #4) */}
              <div className="pt-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    I consent to Revival International processing my CV and contact data under the{' '}
                    <button
                      type="button"
                      onClick={() => navigateTo('legal/privacy-policy')}
                      className="text-gold-500 font-bold hover:underline"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => navigateTo('legal/candidate-consent')}
                      className="text-gold-500 font-bold hover:underline"
                    >
                      Candidate Consent Notice
                    </button>
                    . I acknowledge that placement services are 100% free of charge.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Quick Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Success Screen with Reference Number & Optional Password Setup */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Your profile and CV have been routed directly to the recruitment advisor managing this vacancy.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuickApplyModal;


import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  UserPlus,
  LogIn,
  Key,
  Info,
  Loader2 
} from 'lucide-react';
import CountryPhoneInput from './common/CountryPhoneInput';
import SITE_CONFIG from '../config/siteConfig';

export const QuickApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user, applyForJob, navigateTo, openAuthModal, setPendingJobToApply } = useApp();

  // Candidate Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(() => {
    if (user?.phone && !user.phone.includes('123 4567') && !user.phone.includes('1234567') && !user.phone.includes('9876543210')) {
      return user.phone;
    }
    return '';
  });
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, error: null });
  const [resumeFile, setResumeFile] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Sync state if user logs in while modal is active
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone && !user.phone.includes('123 4567') && !user.phone.includes('1234567')) {
        setPhone(user.phone);
      }
    }
  }, [user]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Whenever modal opens or a different job is selected, ALWAYS reset form & success state
  useEffect(() => {
    if (isOpen && job) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setErrorMsg('');
      setErrorCode('');
      setSuccessResult(null);
      setResumeFile(null);
      setConsentAgreed(false);
      if (user) {
        if (user.name) setFullName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phone && !user.phone.includes('123 4567') && !user.phone.includes('1234567') && !user.phone.includes('9876543210')) {
          setPhone(user.phone);
        } else {
          setPhone('');
        }
      }
    }
  }, [isOpen, job?.id]);

  const handleModalClose = () => {
    setIsSuccess(false);
    setIsSubmitting(false);
    setErrorMsg('');
    setErrorCode('');
    setSuccessResult(null);
    setResumeFile(null);
    setConsentAgreed(false);
    onClose();
  };

  const isExpired = Boolean(
    job?.closingDate && new Date(job.closingDate).setHours(23, 59, 59, 999) < Date.now()
  );

  if (!isOpen || !job) return null;

  // Convert uploaded CV file to Base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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

  /**
   * One-Click Application Submission:
   * Requires candidate registration. Directly generates role-specific email,
   * attaches CV, and dispatches to candidate Gmail and official desk.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode('');

    if (!user || !user.email) {
      setErrorMsg('Candidate registration is required before submitting an application.');
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

    if (!phoneValidation.isValid && !user?.phone) {
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
      let cvPayload = null;
      if (resumeFile) {
        const base64Data = await fileToBase64(resumeFile);
        cvPayload = {
          filename: resumeFile.name,
          mimeType: resumeFile.type || 'application/pdf',
          size: resumeFile.size,
          base64: base64Data
        };
      }

      const generatedRef = `RI-APP-${Math.floor(100000 + Math.random() * 900000)}`;

      // Direct submission to email application service
      const response = await fetch('/api/jobs/apply-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidate: {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || user?.phone || '',
            location: user?.location || job.location || 'Dubai, UAE',
            experience: user?.experience || '3+ Years',
            noticePeriod: 'Immediate / 30 Days'
          },
          cvFile: cvPayload
        })
      });

      const result = await response.json();

      if (response.status === 429) {
        setErrorCode('RATE_LIMIT');
        setErrorMsg(result.message || 'Rate limit reached: Maximum 5 applications per hour allowed. Please wait before submitting again.');
        return;
      }

      if (response.status === 409) {
        setErrorCode('DUPLICATE');
        setErrorMsg(result.message || 'You have already submitted an application for this vacancy.');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to dispatch application email.');
      }

      // Record in CRM leads work queue for follow-up
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || user?.phone || '',
            serviceId: 'quick-apply',
            serviceTitle: `Job Application: ${job.title} (${job.company})`,
            referenceNumber: result.applicationId || generatedRef,
            countryInterest: job.country || 'UAE',
            source: 'Quick Apply Portal'
          })
        });
      } catch (crmErr) {
        console.warn('Leads queue sync note:', crmErr);
      }

      // Update client context
      if (applyForJob) {
        await applyForJob(job);
      }

      setSuccessResult({
        ...result,
        applicationId: result.applicationId || generatedRef,
        recipient: result.recipient || 'enquiry@therevivalinternational.com'
      });
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess(result.applicationId || generatedRef);
      }
    } catch (err) {
      console.error('[Quick Apply Failed]:', err);
      setErrorMsg(err.message || 'Unable to submit your application. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg my-auto sm:my-8 rounded-3xl bg-white dark:bg-navy-900 shadow-2xl border border-slate-200 dark:border-navy-800 transition-all flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Fixed & Never Squeezed */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={handleModalClose}
            aria-label="Close Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <span className="text-[10px] uppercase font-black tracking-widest text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            INSTANT QUICK APPLY • 100% FREE PLACEMENT
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-1 pr-8">{job.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{job.company || 'Revival International Partner Employer'}</span>
            <span>•</span>
            <span>{job.location}</span>
          </p>
        </div>

        {/* Modal Body - Scrollable & Well-Proportioned */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* GUARD 1: Position Expired */}
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
                onClick={handleModalClose}
                className="w-full mt-2 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition cursor-pointer"
              >
                Close & View Open Vacancies
              </button>
            </div>
          ) : !user || !user.email ? (
            /* GUARD 2: Registration Required Screen */
            <div className="text-center py-6 px-2 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center">
                <UserPlus className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-gold-500 bg-gold-400/10 px-2.5 py-0.5 rounded-full inline-block">
                  Registration Required
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Candidate Profile Required to Apply
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  To apply for <strong>{job.title}</strong>, please create a free candidate profile or sign in. Your application and CV will be linked to your candidate dashboard.
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPendingJobToApply(job);
                    handleModalClose();
                    openAuthModal('register', 'candidate');
                  }}
                  className="w-full bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Free Candidate Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingJobToApply(job);
                    handleModalClose();
                    openAuthModal('login', 'candidate');
                  }}
                  className="w-full bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Already Registered? Sign In</span>
                </button>
              </div>
            </div>
          ) : !isSuccess ? (
            /* Authenticated Candidate Quick Apply Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {errorMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  errorCode === 'RATE_LIMIT' 
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' 
                    : errorCode === 'DUPLICATE'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Registered Account Status Pill */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 px-3 py-1.5 rounded-xl text-[11px]">
                <span className="text-slate-500">Applying as:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  {user.name || user.email}
                </span>
              </div>

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
                  placeholder="e.g. Kishore Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-gold-500 transition"
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
                  placeholder="e.g. kishorekumaroffl@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Phone / WhatsApp Number */}
              <CountryPhoneInput
                value={phone}
                onChange={setPhone}
                onValidationChange={setPhoneValidation}
                required
              />

              {/* Attach CV File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Curriculum Vitae (CV) <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-gold-500 rounded-xl p-3 text-center cursor-pointer transition bg-slate-50/50 dark:bg-navy-950/50">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <Upload className="w-5 h-5 text-gold-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                      {resumeFile ? resumeFile.name : (user?.resumeName || 'Click to upload PDF, DOCX or DOC')}
                    </span>
                    <span className="text-[10px] text-slate-500">Maximum file size: 10MB</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Consent Checkbox */}
              <div className="pt-0.5">
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

              {/* Single Direct Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                    <span>Sending Application via Email...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Quick Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Screen exactly matching Image 1 */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your profile and CV have been routed directly to the recruitment advisor managing this vacancy.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-full bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-navy-700 transition cursor-pointer"
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

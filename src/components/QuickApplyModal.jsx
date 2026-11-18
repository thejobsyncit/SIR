import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Mail, 
  Loader2 
} from 'lucide-react';
import CountryPhoneInput from './common/CountryPhoneInput';
import SITE_CONFIG from '../config/siteConfig';

export const QuickApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user, applyForJob, navigateTo } = useApp();

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

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

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
   * One-Click Instant Submission:
   * Directly sends the role-specific email from enquiry@therevivalinternational.com
   * with the candidate's CV attached to the hiring desk.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode('');

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
            phone: phone.trim(),
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
            phone: phone.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-navy-800 transition-all my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <span className="text-[10px] uppercase font-black tracking-widest text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            INSTANT QUICK APPLY • 100% FREE PLACEMENT
          </span>
          <h2 className="text-xl font-bold text-white line-clamp-1">{job.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{job.company || 'Revival International Partner Employer'}</span>
            <span>•</span>
            <span>{job.location}</span>
          </p>
        </div>

        {/* Modal Body */}
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
          ) : !isSuccess ? (
            /* Clean Candidate Quick Apply Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                  placeholder="e.g. kishorekumaroffl@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-gold-500 transition"
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

              {/* Mandatory Consent Checkbox */}
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

              {/* Single Direct Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm py-3.5 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
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
            /* Direct Success Screen */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block">
                  Dispatched Directly via Email
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your customized, role-tailored application email and CV have been dispatched directly to{' '}
                  <strong className="text-slate-900 dark:text-white">enquiry@therevivalinternational.com</strong>.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 text-left space-y-2 max-w-sm mx-auto text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference Number:</span>
                  <span className="font-mono font-bold text-gold-500">{successResult?.applicationId || 'RI-APP-SUCCESS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Position:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Company:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{job.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Routing:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">enquiry@therevivalinternational.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate Reply-To:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-navy-900 dark:bg-navy-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-navy-800 dark:hover:bg-navy-700 transition cursor-pointer"
                >
                  Close & Back to Vacancies
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

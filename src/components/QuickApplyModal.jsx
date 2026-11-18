import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Send, 
  Sparkles, 
  Clock, 
  MapPin, 
  Briefcase,
  Loader2,
  Edit3
} from 'lucide-react';
import CountryPhoneInput from './common/CountryPhoneInput';
import SITE_CONFIG from '../config/siteConfig';

export const QuickApplyModal = ({ job, isOpen, onClose, onSuccess }) => {
  const { user, applyForJob, navigateTo } = useApp();

  // Wizard Steps: 1 = Candidate Form, 2 = Preview & Edit Email, 3 = Sent Confirmation
  const [currentStep, setCurrentStep] = useState(1);

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
  const [location, setLocation] = useState(user?.location || 'Dubai, UAE');
  const [experience, setExperience] = useState('3-5 Years');
  const [noticePeriod, setNoticePeriod] = useState('15-30 Days');
  const [resumeFile, setResumeFile] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Email Preview & Edit State
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const isExpired = Boolean(
    job?.closingDate && new Date(job.closingDate).setHours(23, 59, 59, 999) < Date.now()
  );

  if (!isOpen || !job) return null;

  // Convert File to Base64 data URL for API transmission
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
   * STEP 1 -> STEP 2: Validate form & Request Role-Specific Email Preview
   */
  const handleProceedToPreview = async (e) => {
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

    if (!location.trim()) {
      setErrorMsg('Please provide your current city/country location.');
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

    setIsPreviewLoading(true);

    try {
      const response = await fetch('/api/jobs/apply-email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidate: {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            location: location.trim(),
            experience,
            noticePeriod
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate role-specific email preview.');
      }

      setPreviewData(data);
      setEditedSubject(data.email?.subject || `Application for ${job.title} – ${job.location}`);
      setEditedBody(data.email?.textBody || '');
      setCurrentStep(2);
    } catch (err) {
      console.error('[Preview Generation Failed]:', err);
      setErrorMsg(err.message || 'Unable to generate role-specific preview. Please try again.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  /**
   * STEP 2 -> STEP 3: Send Application via Nodemailer
   */
  const handleSendApplication = async () => {
    setErrorMsg('');
    setErrorCode('');
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

      const payload = {
        jobId: job.id,
        candidate: {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          location: location.trim(),
          experience,
          noticePeriod
        },
        editedSubject: editedSubject.trim(),
        editedTextBody: editedBody.trim(),
        cvFile: cvPayload
      };

      const response = await fetch('/api/jobs/apply-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 429) {
        setErrorCode('RATE_LIMIT');
        setErrorMsg(result.message || 'Rate limit reached: Maximum 5 applications per hour allowed. Please wait before submitting again.');
        return;
      }

      if (response.status === 409) {
        setErrorCode('DUPLICATE');
        setErrorMsg(result.message || 'Duplicate application detected: You have already applied for this job.');
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to dispatch application email.');
      }

      // Record in CRM leads work queue
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            serviceId: 'apply-via-email',
            serviceTitle: `Email Application: ${job.title} (${job.company})`,
            referenceNumber: result.applicationId,
            countryInterest: job.country || 'UAE',
            source: 'Apply via Email Portal'
          })
        });
      } catch (crmErr) {
        console.warn('Leads queue sync note:', crmErr);
      }

      // Update client context if available
      if (applyForJob) {
        await applyForJob(job);
      }

      setSuccessResult(result);
      setCurrentStep(3);

      if (onSuccess) {
        onSuccess(result.applicationId);
      }
    } catch (err) {
      console.error('[Send Application Error]:', err);
      setErrorMsg(err.message || 'Unable to dispatch email. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-navy-800 transition-all my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-full inline-block">
              Apply via Role-Specific Email • Nodemailer SMTP
            </span>
            {currentStep === 2 && (
              <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Step 2: Preview & Customize
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white line-clamp-1">{job.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{job.company || 'Revival International Partner Employer'}</span>
            <span>•</span>
            <span>{job.location}</span>
            {job.department && (
              <>
                <span>•</span>
                <span className="text-gold-400/90 font-medium">{job.department}</span>
              </>
            )}
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
          ) : currentStep === 1 ? (
            /* STEP 1: Candidate Input Form */
            <form onSubmit={handleProceedToPreview} className="space-y-4 text-left">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Reply-To) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. applicant@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <CountryPhoneInput
                value={phone}
                onChange={setPhone}
                onValidationChange={setPhoneValidation}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dubai, UAE"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Experience <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition cursor-pointer"
                  >
                    <option value="Entry Level / 0-1 Year">Entry Level / 0-1 Year</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-8 Years">5-8 Years</option>
                    <option value="8-12 Years">8-12 Years</option>
                    <option value="12+ Years Executive">12+ Years Executive</option>
                  </select>
                </div>

                {/* Notice Period */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notice Period <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition cursor-pointer"
                  >
                    <option value="Immediate Joiner">Immediate Joiner</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60-90 Days">60-90 Days</option>
                    <option value="Serving Notice Period">Serving Notice</option>
                  </select>
                </div>
              </div>

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
                    <span className="text-[10px] text-slate-500">Maximum file size: 10MB (Validated server-side)</span>
                  </div>
                </div>
              </div>

              {/* Consent Checkbox */}
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

              {/* Preview & Continue Button */}
              <button
                type="submit"
                disabled={isPreviewLoading}
                className="w-full bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm py-3 rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isPreviewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Role-Specific Email Preview...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-navy-950" />
                    <span>Preview Role-Specific Email & Apply</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : currentStep === 2 ? (
            /* STEP 2: Interactive Email Preview & Edit Step */
            <div className="space-y-4 text-left">
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

              {/* Metadata Banner */}
              <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-navy-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Routing Summary</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {previewData?.email?.generationSource || 'Role Category Matched'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">To (Employer):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {previewData?.email?.recipientEmail || job.companyEmail || 'thejobsyncit@gmail.com'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Reply-To (Candidate):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{email}</span>
                  </div>
                </div>

                {resumeFile && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-gold-500" />
                    <span>CV Attached: <strong>{resumeFile.name}</strong> ({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                    <span className="text-emerald-500 font-bold">✓ Validated</span>
                  </div>
                )}
              </div>

              {/* Editable Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Email Subject Line</span>
                  <span className="text-[10px] text-slate-400 font-normal">Editable</span>
                </label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Editable Email Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Application Email Body (Plain Text Preview)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Feel free to tweak or personalize</span>
                </label>
                <textarea
                  rows={9}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-800 dark:text-slate-200 text-xs font-mono leading-relaxed outline-none focus:border-gold-500 transition resize-y"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                  className="w-1/3 py-2.5 px-3 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendApplication}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-gold-shimmer text-navy-950 font-bold text-xs sm:text-sm rounded-xl hover:opacity-95 transition shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending via Nodemailer SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Application via Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 3: Success Confirmation Screen */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block">
                  Transmission Verified
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Sent Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your customized, role-specific application email and CV attachment have been dispatched via Nodemailer SMTP to <strong>{successResult?.recipient || job.companyEmail || 'the hiring team'}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 text-left space-y-2 max-w-md mx-auto text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Reference:</span>
                  <span className="font-mono font-bold text-gold-500">{successResult?.applicationId || 'REV-EMAIL-APP'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Role:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{job.company}</span>
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
                  className="w-full bg-navy-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-navy-800 transition shadow cursor-pointer"
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

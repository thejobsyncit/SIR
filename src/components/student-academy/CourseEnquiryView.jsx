import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Clock, DollarSign,
  Building2, BookOpen, Send, Sparkles, AlertCircle, Copy, Check
} from 'lucide-react';
import {
  getCourseById,
  getAcademyById,
  getExamById
} from '../../data/studentAcademyData';
import { submitAcademyCourseEnquiry } from '../../services/academyService';

export const CourseEnquiryView = ({
  courseId,
  academyId: propAcademyId,
  examId: propExamId,
  onBackToAcademy,
  onBackToExams
}) => {
  const course = useMemo(() => getCourseById(courseId), [courseId]);

  // Auto-preserve IDs from course object or props
  const resolvedAcademyId = course ? course.academyId : propAcademyId;
  const resolvedExamId = course ? course.examId : propExamId;

  const academy = useMemo(() => getAcademyById(resolvedAcademyId), [resolvedAcademyId]);
  const exam = useMemo(() => getExamById(resolvedExamId), [resolvedExamId]);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    preferredLearningMode: course?.learningMode || 'Classroom',
    batchPreference: course?.batches?.[0]?.name || 'Immediate Upcoming Batch',
    questions: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.studentName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, and Mobile Number).');
      return;
    }

    setLoading(true);

    try {
      const res = await submitAcademyCourseEnquiry({
        studentName: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        preferredLearningMode: formData.preferredLearningMode,
        batchPreference: formData.batchPreference,
        questions: formData.questions,
        academyId: resolvedAcademyId,
        academyName: academy ? academy.name : 'Verified Academy',
        examId: resolvedExamId,
        examName: exam ? exam.name : 'Competitive Exam',
        courseId: course ? course.id : courseId,
        courseName: course ? course.title : 'Academy Course'
      });

      if (res && res.success) {
        setSubmissionResult(res);
      } else {
        setErrorMsg('Submission could not be completed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Submission error. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const copyReference = () => {
    if (submissionResult?.referenceNumber) {
      navigator.clipboard.writeText(submissionResult.referenceNumber);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600 dark:text-slate-400">Course details could not be loaded.</p>
        <button
          onClick={onBackToExams}
          className="text-gold-500 font-bold hover:underline"
        >
          Return to Examinations Directory
        </button>
      </div>
    );
  }

  // Confirmation Screen (Only shown after successful submission)
  if (submissionResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-6">
        <div className="glass-card bg-white dark:bg-navy-900 border-2 border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-luxury">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              Enquiry Confirmed &amp; Dispatched
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Course Enquiry Successfully Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Your inquiry has been registered in the Revival International Admissions Desk and forwarded to the admissions cell at <strong>{academy?.name}</strong>.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 max-w-md mx-auto space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Official Reference ID:</span>
              <button
                onClick={copyReference}
                className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-400 font-bold"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-xl font-mono font-black text-gold-600 dark:text-gold-400 tracking-wider">
              {submissionResult.referenceNumber}
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 text-left space-y-1">
              <p><strong>Student:</strong> {formData.studentName}</p>
              <p><strong>Academy:</strong> {academy?.name}</p>
              <p><strong>Exam:</strong> {exam?.name} ({exam?.code})</p>
              <p><strong>Course:</strong> {course.title}</p>
              <p><strong>Batch:</strong> {formData.batchPreference}</p>
            </div>
          </div>

          {/* Next steps timeline */}
          <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto space-y-1 text-left">
            <p className="font-bold text-gold-600 dark:text-gold-400">Next Steps:</p>
            <p>1. Our certified academic advisor will contact you within 2 business hours via WhatsApp/Phone.</p>
            <p>2. We will arrange your fee concessions, demo lectures, and campus visit coordination.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onBackToAcademy}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition"
            >
              Back to {academy?.shortName || 'Academy'}
            </button>
            <button
              onClick={onBackToExams}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider transition shadow-md"
            >
              Browse Other Examinations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToAcademy}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 transition"
          id="btn-back-to-academy-detail"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {academy?.shortName || 'Academy'} Details</span>
        </button>
      </div>

      {/* Selected Course Context Summary Banner (Preserves IDs) */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Course Selection</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
            Auto-Preserved
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                {academy?.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-gold-600 dark:text-gold-400">
                {exam?.code}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>Duration: <strong>{course.duration}</strong></span>
              <span>Mode: <strong>{course.learningMode}</strong></span>
              <span>Verified Fee: <strong className="text-emerald-600 dark:text-emerald-400">{course.fee}</strong></span>
            </div>
          </div>

          {/* Preserved IDs Badges */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[10px] font-mono text-slate-400 space-y-0.5">
            <p>Academy ID: <span className="text-slate-700 dark:text-slate-300">{resolvedAcademyId}</span></p>
            <p>Exam ID: <span className="text-slate-700 dark:text-slate-300">{resolvedExamId}</span></p>
            <p>Course ID: <span className="text-slate-700 dark:text-slate-300">{course.id}</span></p>
          </div>
        </div>
      </div>

      {/* Course Enquiry Form */}
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 shadow-luxury space-y-6">
        <div className="space-y-1 border-b border-slate-100 dark:border-navy-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Student Course Enquiry Form
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit your inquiry to receive verified admission guidance, demo lecture links, and official fee concession benefits.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                id="student-name-input"
              />
            </div>

            {/* Mobile / WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Mobile Number (with WhatsApp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                id="student-phone-input"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rahul.sharma@example.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              id="student-email-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Learning Mode */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Preferred Learning Mode
              </label>
              <select
                value={formData.preferredLearningMode}
                onChange={(e) => setFormData({ ...formData, preferredLearningMode: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                id="learning-mode-select"
              >
                <option value="Classroom">Classroom / Offline Centers</option>
                <option value="Online Live">Live Online Interactive</option>
                <option value="Hybrid">Hybrid (Classroom + Online Portal)</option>
              </select>
            </div>

            {/* Batch Preference */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Batch Preference
              </label>
              <select
                value={formData.batchPreference}
                onChange={(e) => setFormData({ ...formData, batchPreference: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                id="batch-preference-select"
              >
                {course.batches && course.batches.length > 0 ? (
                  course.batches.map((b, idx) => (
                    <option key={idx} value={b.name}>
                      {b.name} ({b.timing})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Morning Batch">Morning Batch (08:00 AM - 11:00 AM)</option>
                    <option value="Evening Batch">Evening Batch (06:00 PM - 09:00 PM)</option>
                    <option value="Weekend Batch">Weekend Intensive</option>
                  </>
                )}
                <option value="Immediate Upcoming Cohort">Immediate Upcoming Cohort</option>
              </select>
            </div>
          </div>

          {/* Questions / Specific Requirements */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Questions or Specific Requirements (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.questions}
              onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
              placeholder="e.g. Inquiring about hostel accommodation, instalment fee options, or demo class availability..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none"
              id="student-questions-textarea"
            />
          </div>

          {/* Privacy & RLS notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Student Privacy Guarantee:</strong> Your information is encrypted and secured under Revival International Row Level Security (RLS) policies. It is never sold to third parties.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            id="submit-academy-enquiry-btn"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                <span>Transmitting Course Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Course Enquiry &amp; Reserve Consultation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

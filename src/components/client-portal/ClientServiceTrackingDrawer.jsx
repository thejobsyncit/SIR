import React, { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock, FileText, Upload, MessageSquare,
  Calendar, UserCheck, ShieldCheck, AlertCircle, Download, Send, Sparkles
} from 'lucide-react';

export const ClientServiceTrackingDrawer = ({
  serviceEnquiry,
  onBack,
  onOpenUploadForService,
  onOpenBookAppointmentForService,
  onSendMessage,
  sendingMessage
}) => {
  const [messageText, setMessageText] = useState('');

  if (!serviceEnquiry) return null;

  const stages = serviceEnquiry.stages || [];
  const activeStep = serviceEnquiry.activeStep || 1;
  const totalSteps = serviceEnquiry.totalSteps || stages.length || 6;
  const progressPercent = serviceEnquiry.progressPercent || Math.round((activeStep / totalSteps) * 100);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    await onSendMessage({
      enquiryId: serviceEnquiry.id,
      serviceTitle: serviceEnquiry.serviceTitle,
      message: messageText.trim()
    });
    setMessageText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Header Card */}
      <div className="bg-gradient-to-r from-[#0a1628] via-[#102342] to-[#0a1628] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gold-400" />
            <span>Back to My Services</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40">
              #{serviceEnquiry.referenceNumber || serviceEnquiry.id}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {serviceEnquiry.currentStageLabel || serviceEnquiry.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gold-400 block">
              {serviceEnquiry.serviceGroup || 'Revival Advisory'} • {serviceEnquiry.workflowLabel}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              {serviceEnquiry.serviceTitle}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {serviceEnquiry.message}
            </p>
          </div>

          <div className="lg:col-span-4 bg-white/5 border border-white/15 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Workflow Completion</span>
              <span className="text-gold-400 font-extrabold text-sm">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span>Stage {activeStep} of {totalSteps}</span>
              <span>Updated: {serviceEnquiry.updatedAt ? new Date(serviceEnquiry.updatedAt).toLocaleDateString() : new Date(serviceEnquiry.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Consultant & Next Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-gold-400">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Recommended Next Action & Current Milestone</span>
          </div>
          <p className="text-sm font-bold text-navy-900 dark:text-white leading-relaxed">
            {serviceEnquiry.nextAction || serviceEnquiry.currentStageDescription}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onOpenUploadForService(serviceEnquiry)}
              className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Service Document</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBookAppointmentForService(serviceEnquiry)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              <span>Schedule Consultation</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 dark:bg-gold-500/20 text-gold-400 font-serif font-extrabold text-lg flex items-center justify-center border border-gold-500/30 shrink-0">
              {(serviceEnquiry.assignedEmployee || 'D')[0]}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Assigned Revival Specialist
              </span>
              <h4 className="font-serif text-base font-extrabold text-navy-900 dark:text-white">
                {serviceEnquiry.assignedEmployee || 'Dhanalakshimi'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {serviceEnquiry.assignedConsultantFull || 'Senior Global Advisory Lead'}
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <UserCheck className="w-3.5 h-3.5" /> Active SLA
            </span>
            <p className="mt-0.5">Target Country: <strong className="text-navy-900 dark:text-white">{serviceEnquiry.countryInterest || 'Global'}</strong></p>
          </div>
        </div>
      </div>

      {/* Tailored Multi-Stage Service Workflow Stepper */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-extrabold text-navy-900 dark:text-white">
              {serviceEnquiry.workflowLabel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each stage is verified and updated by your assigned Revival specialist as milestones are completed.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-gold-400">
            Stage {activeStep} of {totalSteps}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < activeStep || activeStep === totalSteps;
            const isCurrent = stepNum === activeStep && activeStep < totalSteps;

            return (
              <div
                key={st.key}
                className={`p-4 rounded-2xl border transition relative ${
                  isCurrent
                    ? 'bg-gold-500/10 border-gold-500 shadow-md ring-1 ring-gold-500/40'
                    : isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-slate-50/70 dark:bg-navy-950/60 border-slate-200 dark:border-navy-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-extrabold flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-gold-500 text-navy-950 shadow-sm'
                        : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                        ? 'bg-gold-500 text-navy-950'
                        : 'bg-slate-200/70 dark:bg-navy-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Current Stage' : 'Upcoming'}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-navy-900 dark:text-white mb-1">
                  {st.label}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 3-Column Grid: Service Documents, Activity Log, Direct Consultant Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Service Documents & Checklist */}
        <div className="lg:col-span-4 bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-500" />
              <span>Service Documents</span>
            </h4>
            <button
              type="button"
              onClick={() => onOpenUploadForService(serviceEnquiry)}
              className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
            >
              + Upload File
            </button>
          </div>

          {serviceEnquiry.documents && serviceEnquiry.documents.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {serviceEnquiry.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-navy-900 dark:text-white">{doc.documentName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : doc.verificationStatus === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : doc.verificationStatus === 'Requested'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                  {doc.rejectionReason && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg">
                      Reason: {doc.rejectionReason}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">{doc.fileName || 'Awaiting client upload'}</span>
                    {doc.fileName ? (
                      <a
                        href={`/api/client-portal/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenUploadForService(serviceEnquiry, doc)}
                        className="text-[11px] font-bold text-amber-600 dark:text-gold-400 hover:underline cursor-pointer"
                      >
                        Upload Now →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 space-y-2">
              <p>Recommended checklist for <strong>{serviceEnquiry.serviceTitle}</strong>:</p>
              <ul className="space-y-1 pl-4 list-disc text-[11px]">
                {(serviceEnquiry.requiredDocumentsTemplate || []).map((reqDoc, idx) => (
                  <li key={idx}>{reqDoc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Column 2: Audit & Progress History */}
        <div className="lg:col-span-4 bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <h4 className="font-serif text-base font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-500" />
            <span>Service Progress History</span>
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            {(serviceEnquiry.activities || []).length > 0 ? (
              serviceEnquiry.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border-l-4 border-gold-500 space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-bold text-gold-600 dark:text-gold-400 uppercase">{act.type}</span>
                    <span>{act.createdAt ? new Date(act.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <p className="font-bold text-navy-900 dark:text-white">{act.title}</p>
                  {act.notes && <p className="text-[11px] text-slate-600 dark:text-slate-400">{act.notes}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs">Service request logged and under initial review.</p>
            )}
          </div>
        </div>

        {/* Column 3: Direct Consultant Message Thread */}
        <div className="lg:col-span-4 bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-serif text-base font-extrabold text-navy-900 dark:text-white flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gold-500" />
              <span>Message Assigned Consultant</span>
            </h4>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {(serviceEnquiry.messages || []).length > 0 ? (
                serviceEnquiry.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl ${
                      m.senderRole === 'Client'
                        ? 'bg-gold-500/15 border border-gold-500/30 ml-4'
                        : 'bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-navy-900 dark:text-gold-400">{m.senderName}</span>
                      <span>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">{m.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  Have a question about <strong>#{serviceEnquiry.referenceNumber}</strong>? Send a direct message to {serviceEnquiry.assignedEmployee || 'your advisor'} below.
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${serviceEnquiry.assignedEmployee || 'Consultant'}...`}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={sendingMessage || !messageText.trim()}
              className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


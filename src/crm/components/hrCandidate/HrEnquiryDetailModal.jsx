import React from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  CalendarPlus,
  StickyNote,
  RefreshCw,
  Lock
} from 'lucide-react';
import { formatDateTime, getStatusBadgeClass, getPriorityBadgeClass } from './hrCandidateUtils';

const DetailField = ({ label, value }) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  return (
    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">
        {value}
      </div>
    </div>
  );
};

export const HrEnquiryDetailModal = ({
  enquiry,
  candidateName,
  onClose,
  onUpdateStatus,
  onAddNote,
  onScheduleFollowUp
}) => {
  if (!enquiry) return null;

  const customFieldEntries = enquiry.customFields && typeof enquiry.customFields === 'object'
    ? Object.entries(enquiry.customFields).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-detail-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30">
                {enquiry.referenceNumber || enquiry.id}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(enquiry.status)}`}>
                {enquiry.status}
              </span>
              {enquiry.priority && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(enquiry.priority)}`}>
                  {enquiry.priority} Priority
                </span>
              )}
              {!enquiry.canEditThisEnquiry && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10">
                  <Lock className="w-3 h-3" /> Read-only
                </span>
              )}
            </div>
            <h2 id="enquiry-detail-modal-title" className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {enquiry.serviceTitle || 'Enquiry Details'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Candidate: <span className="font-medium text-slate-700 dark:text-slate-200">{candidateName}</span>
              {enquiry.id !== (enquiry.referenceNumber || enquiry.id) && (
                <span className="ml-2 font-mono text-[11px] opacity-80">ID: {enquiry.id}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enquiry details"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Core Identifiers & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailField label="Enquiry ID / Reference" value={enquiry.referenceNumber || enquiry.id} />
            <DetailField label="Internal Record ID" value={enquiry.id} />
            <DetailField label="Service / Module" value={enquiry.serviceTitle} />
            <DetailField label="Category / Domain" value={enquiry.category} />
            <DetailField label="Enquiry Type" value={enquiry.enquiryType} />
            <DetailField label="Submitted At" value={formatDateTime(enquiry.createdAt)} />
            <DetailField label="Assigned Employee" value={enquiry.assignedEmployee} />
            <DetailField label="Operations Team" value={enquiry.operationTeam} />
            <DetailField label="Assigned At" value={formatDateTime(enquiry.assignedAt)} />
            <DetailField label="Due Date" value={formatDateTime(enquiry.taskDueDate, false)} />
            <DetailField label="Preferred Contact" value={enquiry.preferredContactMethod} />
            <DetailField label="Last Updated" value={formatDateTime(enquiry.updatedAt)} />
          </div>

          {/* Academic / Service-Specific Details */}
          {(enquiry.courseName || enquiry.department || enquiry.streamName || enquiry.specialization || enquiry.collegeName || enquiry.academyName || enquiry.examDetails || enquiry.marksOrPercentage || enquiry.qualifyingDegree || enquiry.countryInterest || enquiry.intakeTerm || enquiry.preferredLocation || enquiry.consultationDate) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-500" /> Course, Examination & Program Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <DetailField label="Course / Program" value={enquiry.courseName} />
                <DetailField label="Department" value={enquiry.department} />
                <DetailField label="Stream" value={enquiry.streamName} />
                <DetailField label="Specialization" value={enquiry.specialization} />
                <DetailField label="College / University" value={enquiry.collegeName} />
                <DetailField label="Academy" value={enquiry.academyName} />
                <DetailField label="Examination / Entrance" value={enquiry.examDetails} />
                <DetailField label="Degree Level" value={enquiry.degreeLevel} />
                <DetailField label="Marks / Percentage / CGPA" value={enquiry.marksOrPercentage} />
                <DetailField label="Qualifying Degree" value={enquiry.qualifyingDegree} />
                <DetailField label="Graduation Discipline" value={enquiry.graduationDiscipline} />
                <DetailField label="Work Experience" value={enquiry.workExperience} />
                <DetailField label="Country Interest" value={enquiry.countryInterest} />
                <DetailField label="Intake Term" value={enquiry.intakeTerm} />
                <DetailField label="Preferred Location" value={enquiry.preferredLocation} />
                <DetailField label="Learning / Coaching Mode" value={enquiry.preferredLearningMode} />
                <DetailField label="Batch Preference" value={enquiry.batchPreference} />
                <DetailField label="Student Class / Grade" value={enquiry.studentClassGrade} />
                <DetailField label="Parent / Guardian Name" value={enquiry.parentGuardianName} />
                <DetailField label="Consultation Schedule" value={[enquiry.consultationDate, enquiry.consultationTime, enquiry.consultationMode].filter(Boolean).join(' • ') || null} />
                <DetailField label="Assistance Type" value={enquiry.assistanceType} />
              </div>
            </div>
          )}

          {/* Original Submitted Message */}
          {enquiry.message && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-500" /> Original Message & Enquiry Content
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {enquiry.message}
              </div>
            </div>
          )}

          {/* Submitted Custom Form Fields */}
          {customFieldEntries.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" /> Submitted Additional Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFieldEntries.map(([key, val]) => (
                  <DetailField
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    value={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* HR Lead Instructions */}
          {enquiry.assignmentNotes && (
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> HR Lead Instructions
              </div>
              <p className="text-sm text-amber-950 dark:text-amber-100 whitespace-pre-wrap">
                {enquiry.assignmentNotes}
              </p>
            </div>
          )}

          {/* Resolution & Follow-up Summary */}
          {(enquiry.nextAction || enquiry.nextActionDate || enquiry.completedAt || enquiry.internalNotes) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolution & Notes Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailField label="Next Planned Action" value={enquiry.nextAction} />
                <DetailField label="Next Follow-up Date" value={formatDateTime(enquiry.nextActionDate)} />
                <DetailField label="Completed / Resolved At" value={formatDateTime(enquiry.completedAt)} />
              </div>
              {enquiry.internalNotes && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Internal Notes Log
                  </div>
                  <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {enquiry.internalNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents if present */}
          {(enquiry.cvPath || (enquiry.documentUrls && enquiry.documentUrls.length > 0)) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Submitted Documents
              </h3>
              <div className="flex flex-wrap gap-2">
                {enquiry.cvPath && (
                  <a
                    href={enquiry.cvPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Resume / CV
                  </a>
                )}
                {enquiry.documentUrls?.map((docUrl, idx) => (
                  <a
                    key={`${docUrl}-${idx}`}
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Document #{idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Linked Follow-ups for this enquiry */}
          {enquiry.followUps?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" /> Scheduled Follow-ups ({enquiry.followUps.length})
              </h3>
              <div className="space-y-2">
                {enquiry.followUps.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {f.purpose} • Due: {formatDateTime(f.dueDateTime)}
                      </div>
                      {f.completionNotes && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                          Completion Note: {f.completionNotes}
                        </div>
                      )}
                    </div>
                    <span className={`self-start sm:self-center inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(f.status)}`}>
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Activity History for this enquiry */}
          {enquiry.activities?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" /> Enquiry Activity Log ({enquiry.activities.length})
              </h3>
              <div className="space-y-2">
                {enquiry.activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.title}</div>
                      {a.notes && <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{a.notes}</div>}
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">By {a.createdBy || 'CRM Staff'}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDateTime(a.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Strictly permitted actions only) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex flex-wrap items-center gap-2">
            {enquiry.canEditThisEnquiry && (
              <>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(enquiry)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Update Status
                </button>
                <button
                  type="button"
                  onClick={() => onScheduleFollowUp(enquiry)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Schedule Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => onAddNote(enquiry)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5" /> Add Note
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


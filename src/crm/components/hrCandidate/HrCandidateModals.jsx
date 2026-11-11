import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { PERMITTED_ENQUIRY_STATUSES } from './hrCandidateUtils';

const ModalShell = ({ title, subtitle, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
  >
    <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const EditCandidateModal = ({ open, candidate, onClose, onSave, saving }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (open && candidate) {
      setFullName(candidate.fullName || '');
      setEmail(candidate.email || '');
      setPhone(candidate.phone || '');
      setLocation(candidate.location || '');
    }
  }, [open, candidate]);

  if (!open || !candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ fullName, email, phone, location });
  };

  return (
    <ModalShell
      title="Edit Candidate Information"
      subtitle={`Reference Number: ${candidate.candidateReferenceNumber} (Read-only)`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State or Country"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const UpdateEnquiryStatusModal = ({ open, enquiry, onClose, onSave, saving }) => {
  const [status, setStatus] = useState('In Progress');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (open && enquiry) {
      setStatus(enquiry.status || 'In Progress');
      setNextAction(enquiry.nextAction || '');
      setNextActionDate(enquiry.nextActionDate ? String(enquiry.nextActionDate).slice(0, 16) : '');
      setResolutionNotes('');
    }
  }, [open, enquiry]);

  if (!open || !enquiry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(enquiry.id, {
      status,
      nextAction: nextAction || undefined,
      nextActionDate: nextActionDate || undefined,
      resolutionNotes: resolutionNotes || undefined
    });
  };

  return (
    <ModalShell
      title="Update Enquiry Status"
      subtitle={`${enquiry.referenceNumber || enquiry.id} • ${enquiry.serviceTitle}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PERMITTED_ENQUIRY_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Next Action (Optional)
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g., Document verification call"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Next Action Date
            </label>
            <input
              type="datetime-local"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Status Update / Resolution Note
          </label>
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Summarize outcome, candidate response, or resolution details..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Status
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const ScheduleFollowUpModal = ({ open, enquiries, preselectedEnquiryId, onClose, onSave, saving }) => {
  const editableEnquiries = (enquiries || []).filter((e) => e.canEditThisEnquiry);
  const [enquiryId, setEnquiryId] = useState('');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('Call');
  const [dueDateTime, setDueDateTime] = useState('');

  useEffect(() => {
    if (open) {
      setEnquiryId(preselectedEnquiryId || editableEnquiries[0]?.id || '');
      setTitle('');
      setPurpose('Call');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setDueDateTime(tomorrow.toISOString().slice(0, 16));
    }
  }, [open, preselectedEnquiryId]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!enquiryId) return;
    onSave(enquiryId, { title, purpose, dueDateTime });
  };

  return (
    <ModalShell
      title="Schedule Follow-up"
      subtitle="Link a follow-up reminder to an authorized enquiry"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Enquiry *
          </label>
          <select
            required
            value={enquiryId}
            onChange={(e) => setEnquiryId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {editableEnquiries.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.referenceNumber || eq.id} — {eq.serviceTitle} ({eq.status})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Follow-up Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Confirm IELTS score and SOP readiness"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Document Check">Document Check</option>
              <option value="Consultation">Consultation</option>
              <option value="Final Confirmation">Final Confirmation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !enquiryId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Schedule Follow-up
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const AddInternalNoteModal = ({ open, enquiries, preselectedEnquiryId, onClose, onSave, saving }) => {
  const editableEnquiries = (enquiries || []).filter((e) => e.canEditThisEnquiry);
  const [enquiryId, setEnquiryId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setEnquiryId(preselectedEnquiryId || editableEnquiries[0]?.id || '');
      setNote('');
    }
  }, [open, preselectedEnquiryId]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!enquiryId || !note.trim()) return;
    onSave(enquiryId, { note: note.trim() });
  };

  return (
    <ModalShell
      title="Add Internal Note"
      subtitle="Internal HR note attached to the selected enquiry and timeline"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Enquiry *
          </label>
          <select
            required
            value={enquiryId}
            onChange={(e) => setEnquiryId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {editableEnquiries.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.referenceNumber || eq.id} — {eq.serviceTitle}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Internal Note *
          </label>
          <textarea
            rows={4}
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record call observations, verification remarks, or pending candidate clarifications..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !enquiryId || !note.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Note
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export const CompleteFollowUpModal = ({ open, followUp, onClose, onSave, saving }) => {
  const [status, setStatus] = useState('Completed');
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    if (open && followUp) {
      setStatus('Completed');
      setCompletionNotes('');
    }
  }, [open, followUp]);

  if (!open || !followUp) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(followUp.id, { status, completionNotes });
  };

  return (
    <ModalShell
      title="Update Follow-up Outcome"
      subtitle={`${followUp.title} (${followUp.enquiryReference})`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Outcome Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Keep Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Completion Notes
          </label>
          <textarea
            rows={3}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Record follow-up summary or next steps..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-navy-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Outcome
          </button>
        </div>
      </form>
    </ModalShell>
  );
};


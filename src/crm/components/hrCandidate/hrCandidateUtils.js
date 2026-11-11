export const PERMITTED_ENQUIRY_STATUSES = [
  'New',
  'New Enquiry',
  'Assigned',
  'In Progress',
  'Contacted',
  'Consultation Scheduled',
  'Document Verification',
  'Pending',
  'Follow-up Required',
  'On Hold',
  'Completed',
  'Resolved',
  'Closed',
  'Cancelled'
];

export const RESOLVED_STATUS_SET = new Set([
  'Completed',
  'Closed',
  'Resolved',
  'Enrolled',
  'Converted'
]);

export const formatDateTime = (isoOrStr, includeTime = true) => {
  if (!isoOrStr) return null;
  const d = new Date(isoOrStr);
  if (Number.isNaN(d.getTime())) return String(isoOrStr);
  if (!includeTime) {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getInitials = (name) => {
  const clean = String(name || '').trim();
  if (!clean) return 'C';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getStatusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (['completed', 'resolved', 'closed', 'enrolled', 'converted'].includes(s)) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (['in progress', 'contacted', 'consultation scheduled', 'document verification'].includes(s)) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30';
  }
  if (['follow-up required', 'pending', 'on hold'].includes(s)) {
    return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
  }
  if (['cancelled', 'rejected'].includes(s)) {
    return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
  return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30';
};

export const getPriorityBadgeClass = (priority) => {
  const p = String(priority || 'Normal').toLowerCase();
  if (p === 'urgent' || p === 'critical') {
    return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
  if (p === 'high') {
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30';
  }
  if (p === 'low') {
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/15';
};


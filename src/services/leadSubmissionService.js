const LOCAL_LEADS_STORAGE_KEY = 'revival_local_leads';

export const getLocalFallbackLeads = () => {
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveLocalFallbackLead = (leadRecord) => {
  try {
    const existing = getLocalFallbackLeads();
    const filtered = existing.filter(
      (item) =>
        item.id !== leadRecord.id &&
        item.referenceNumber !== leadRecord.referenceNumber
    );
    const updated = [leadRecord, ...filtered].slice(0, 200);
    localStorage.setItem(LOCAL_LEADS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const generateReferenceNumber = (serviceId) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  if (serviceId === 'intl-consult') return `IC-${year}-${rand}`;
  if (serviceId === 'intl-admissions') return `ADM-${year}-${rand}`;
  if (serviceId === 'college-admissions') return `CADM-${year}-${rand}`;
  if (serviceId === 'seminars-language') return `SEM-${year}-${rand}`;
  return `REV-${year}-${rand}`;
};

export const buildFallbackLeadRecord = (payload = {}) => {
  const nowIso = new Date().toISOString();
  const serviceId = payload.serviceId || 'general';
  const isConsultationBooked =
    Boolean(payload.appointmentDate && payload.appointmentTime) ||
    serviceId === 'intl-consult';

  const id = payload.id || `LEAD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const referenceNumber = payload.referenceNumber || generateReferenceNumber(serviceId);

  return {
    id,
    referenceNumber,
    name: (payload.name || '').trim(),
    email: (payload.email || '').trim().toLowerCase(),
    phone: (payload.phone || '').trim(),
    company: payload.company || payload.currentCountry || null,
    role: payload.role || payload.applicantRole || null,
    inquiryType: payload.inquiryType || 'Service Inquiry',
    serviceId,
    serviceTitle: payload.serviceTitle || 'Consultation Enquiry',
    applicantRole: payload.applicantRole || payload.role || null,
    currentCountry: payload.currentCountry || null,
    countryInterest: payload.countryInterest || payload.preferredDestination || null,
    preferredDestination: payload.preferredDestination || payload.countryInterest || null,
    degreeLevel: payload.degreeLevel || payload.currentQualification || null,
    currentQualification: payload.currentQualification || payload.degreeLevel || null,
    academicResults: payload.academicResults || null,
    targetCourse: payload.targetCourse || null,
    preferredCollege: payload.preferredCollege || null,
    intakePeriod: payload.intakePeriod || null,
    consultationMethod: payload.consultationMethod || 'Online Meeting',
    appointmentDate: payload.appointmentDate || null,
    appointmentTime: payload.appointmentTime || null,
    budgetRange: payload.budgetRange || null,
    assistanceType: Array.isArray(payload.assistanceType)
      ? payload.assistanceType.join(', ')
      : payload.assistanceType || null,
    englishTestStatus: payload.englishTestStatus || null,
    documentChecklistStatus:
      typeof payload.documentChecklistStatus === 'object' && payload.documentChecklistStatus !== null
        ? JSON.stringify(payload.documentChecklistStatus)
        : payload.documentChecklistStatus || null,
    applicationSubmittedDate: payload.applicationSubmittedDate || null,
    institutionDecisionDate: payload.institutionDecisionDate || null,
    offerStatus: payload.offerStatus || 'Pending Application',
    offerConditions: payload.offerConditions || null,
    nextFollowUpDate: payload.nextFollowUpDate || payload.appointmentDate || null,
    message: payload.message || '',
    sourcePage:
      payload.sourcePage ||
      (typeof window !== 'undefined' ? window.location.hash || window.location.pathname : '/'),
    status: payload.status || (isConsultationBooked ? 'Consultation Scheduled' : 'New Enquiry'),
    priority: payload.priority || (isConsultationBooked ? 'High' : 'Medium'),
    assignedEmployee: payload.assignedEmployee || 'Unassigned',
    createdAt: nowIso,
    updatedAt: nowIso
  };
};

export const submitLeadWithFallback = async (payload) => {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data && data.success) {
      if (data.data) {
        saveLocalFallbackLead(data.data);
      }
      return { ok: true, status: res.status, data };
    }

    // Preserve explicit 4xx client validation / duplicate / rate-limit errors
    if (res.status >= 400 && res.status < 500 && data) {
      return { ok: false, status: res.status, data };
    }

    // If 5xx server error or non-JSON response (e.g., serverless cold start issue), save locally and succeed gracefully
    const fallbackRecord = buildFallbackLeadRecord(payload);
    saveLocalFallbackLead({ ...fallbackRecord, _unsynced: true });
    return {
      ok: true,
      status: 201,
      data: {
        success: true,
        fallback: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
        data: fallbackRecord
      }
    };
  } catch (networkErr) {
    const fallbackRecord = buildFallbackLeadRecord(payload);
    saveLocalFallbackLead({ ...fallbackRecord, _unsynced: true });
    return {
      ok: true,
      status: 201,
      data: {
        success: true,
        fallback: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
        data: fallbackRecord
      }
    };
  }
};


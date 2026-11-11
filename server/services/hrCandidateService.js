/**
 * HR Operations Candidate Directory & Complete Candidate Profile Service
 *
 * Aggregates verified unique candidates across CRM records (candidates, candidate_profiles,
 * leads, student_academy_enquiries, career_guidance_enquiries) without deleting or falsely
 * merging distinct records sharing only similar names. Enforces HR Operations role &
 * ownership authorization and compiles real-time enquiries, follow-ups, notes, and timelines.
 */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

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

export const RESOLVED_STATUS_SET = new Set(['Completed', 'Closed', 'Resolved', 'Enrolled', 'Converted']);

const FORBIDDEN_REASSIGN_FIELDS = [
  'assignedEmployee',
  'assignedEmployeeId',
  'assignedEmployeeEmail',
  'assignedBy',
  'operationTeam',
  'assigned_counsellor_id',
  'assigned_counsellor_name'
];

const FORBIDDEN_CANDIDATE_FIELDS = [
  'id',
  'candidateReferenceNumber',
  'userId',
  'deleted',
  'isDeleted',
  'assignedEmployee',
  'assignedEmployeeId',
  'approved',
  'approvalStatus'
];

// Normalization helpers
export const cleanStr = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
  return s;
};

const normalizeEmail = (email) => {
  const s = cleanStr(email).toLowerCase();
  if (!s || !s.includes('@') || s === 'n/a' || s === '-') return '';
  return s;
};

const normalizePhone = (phone) => {
  const digits = cleanStr(phone).replace(/\D/g, '');
  if (digits.length < 7) return '';
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const normalizeName = (name) => cleanStr(name).toLowerCase().replace(/\s+/g, ' ');

const parseJsonSafe = (raw, fallback = null) => {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const toIsoTimestamp = (val) => {
  const s = cleanStr(val);
  if (!s) return null;
  // Handle SQLite "YYYY-MM-DD HH:MM:SS" strings as UTC consistently
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    return s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toISOString();
};

export const compareAsc = (a, b) => {
  const ta = a ? Date.parse(toIsoTimestamp(a) || a) : Number.MAX_SAFE_INTEGER;
  const tb = b ? Date.parse(toIsoTimestamp(b) || b) : Number.MAX_SAFE_INTEGER;
  if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return ta - tb;
  return String(a || '').localeCompare(String(b || ''));
};

export const compareDesc = (a, b) => -compareAsc(a, b);

/**
 * Resolve known employee identifier aliases matching existing HR Operations scoping rules.
 */
export const getEmployeeMatchProfile = (employee) => {
  const empName = cleanStr(employee?.name);
  const empId = cleanStr(employee?.employeeId || employee?.id);
  const empRecordId = cleanStr(employee?.id);
  const empEmail = normalizeEmail(employee?.email);
  const nameAlpha = empName.toLowerCase().replace(/[^a-z]/g, '');

  if (nameAlpha.includes('fatima') || empEmail.includes('fatima') || ['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(empId)) {
    return {
      ids: new Set(['REV-EMP-107', 'INTL-HR-101', 'emp-fatima', empId, empRecordId].filter(Boolean)),
      nameTokens: ['fatima'],
      emailTokens: ['fatima'],
      exactEmail: empEmail
    };
  }
  if (nameAlpha.includes('bala') || empEmail.includes('bala') || ['REV-EMP-006', 'INTL-HR-102', 'emp-6'].includes(empId)) {
    return {
      ids: new Set(['REV-EMP-006', 'INTL-HR-102', 'emp-6', empId, empRecordId].filter(Boolean)),
      nameTokens: ['bala', 'balavarshini'],
      emailTokens: ['bala'],
      exactEmail: empEmail
    };
  }
  if (nameAlpha.includes('divya') || nameAlpha.includes('diviya') || empEmail.includes('divya') || empEmail.includes('diviya') || ['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(empId)) {
    return {
      ids: new Set(['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya', empId, empRecordId].filter(Boolean)),
      nameTokens: ['divya', 'diviya'],
      emailTokens: ['divya', 'diviya'],
      exactEmail: empEmail
    };
  }
  if (nameAlpha.includes('praveen') || empEmail.includes('praveen') || ['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(empId)) {
    return {
      ids: new Set(['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen', empId, empRecordId].filter(Boolean)),
      nameTokens: ['praveen'],
      emailTokens: ['praveen'],
      exactEmail: empEmail
    };
  }

  return {
    ids: new Set([empId, empRecordId].filter(Boolean)),
    nameTokens: empName ? [empName.toLowerCase()] : [],
    emailTokens: [],
    exactEmail: empEmail,
    exactNameLower: empName.toLowerCase()
  };
};

export const matchesEmployeeAssignment = ({ assignedEmployeeId, assignedEmployee, assignedEmployeeEmail }, employeeProfile) => {
  const idVal = cleanStr(assignedEmployeeId);
  const nameVal = cleanStr(assignedEmployee).toLowerCase();
  const emailVal = normalizeEmail(assignedEmployeeEmail);

  if (idVal && employeeProfile.ids.has(idVal)) return true;
  if (employeeProfile.exactEmail && emailVal && emailVal === employeeProfile.exactEmail) return true;
  if (employeeProfile.emailTokens?.length && emailVal) {
    if (employeeProfile.emailTokens.some((tok) => emailVal.includes(tok))) return true;
  }
  if (nameVal) {
    if (employeeProfile.exactNameLower && nameVal === employeeProfile.exactNameLower) return true;
    if (employeeProfile.nameTokens?.some((tok) => nameVal.includes(tok))) return true;
  }
  return false;
};

const hasExplicitDifferentAssignee = (enquiry, employeeProfile) => {
  const aId = cleanStr(enquiry.assignedEmployeeId);
  const aName = cleanStr(enquiry.assignedEmployee);
  const aEmail = normalizeEmail(enquiry.assignedEmployeeEmail);
  const hasAssignee = Boolean(
    (aId && aId.toLowerCase() !== 'unassigned') ||
    (aName && aName.toLowerCase() !== 'unassigned') ||
    aEmail
  );
  if (!hasAssignee) return false;
  return !matchesEmployeeAssignment(enquiry, employeeProfile);
};

/**
 * Union-Find structure that preserves email-disjoint safety so two records
 * holding different verified emails are never merged on phone/name alone.
 */
class CandidateDisjointSet {
  constructor() {
    this.parent = new Map();
    this.emailsByRoot = new Map();
  }

  addNode(key, email = '') {
    if (!this.parent.has(key)) {
      this.parent.set(key, key);
      this.emailsByRoot.set(key, email ? new Set([email]) : new Set());
    }
  }

  find(key) {
    let cur = key;
    while (this.parent.get(cur) !== cur) {
      cur = this.parent.get(cur);
    }
    let path = key;
    while (path !== cur) {
      const next = this.parent.get(path);
      this.parent.set(path, cur);
      path = next;
    }
    return cur;
  }

  union(a, b, { requireNonConflictingEmails = true } = {}) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return true;

    const ea = this.emailsByRoot.get(ra) || new Set();
    const eb = this.emailsByRoot.get(rb) || new Set();

    if (requireNonConflictingEmails && ea.size > 0 && eb.size > 0) {
      let sharesEmail = false;
      for (const em of ea) {
        if (eb.has(em)) {
          sharesEmail = true;
          break;
        }
      }
      if (!sharesEmail) return false;
    }

    this.parent.set(rb, ra);
    for (const em of eb) ea.add(em);
    this.emailsByRoot.set(ra, ea);
    this.emailsByRoot.delete(rb);
    return true;
  }
}

const chooseCanonicalReference = (group) => {
  // 1. Existing candidate_profiles ID (RI-CAND-*)
  if (group.candidateProfiles.length > 0) {
    const sorted = [...group.candidateProfiles].sort((a, b) => compareAsc(a.createdAt, b.createdAt) || a.id.localeCompare(b.id));
    return sorted[0].id;
  }
  // 2. Existing candidates ID (RI-CAND-* preferred over REV-CAN-*, earliest createdAt, deterministic id tiebreak)
  if (group.candidateRows.length > 0) {
    const sorted = [...group.candidateRows].sort((a, b) => {
      const aRi = a.id.startsWith('RI-CAND-') ? 0 : 1;
      const bRi = b.id.startsWith('RI-CAND-') ? 0 : 1;
      if (aRi !== bRi) return aRi - bRi;
      return compareAsc(a.createdAt, b.createdAt) || a.id.localeCompare(b.id);
    });
    return sorted[0].id;
  }
  // 3. Explicit clientId attached to enquiries
  const clientIds = group.enquiries.map((e) => cleanStr(e.clientId)).filter(Boolean).sort();
  if (clientIds.length > 0) return clientIds[0];

  // 4. Existing earliest enquiry referenceNumber (never invent a new ref per enquiry)
  const withRef = group.enquiries
    .filter((e) => cleanStr(e.referenceNumber))
    .sort((a, b) => compareAsc(a.createdAt, b.createdAt) || cleanStr(a.referenceNumber).localeCompare(cleanStr(b.referenceNumber)));
  if (withRef.length > 0) return cleanStr(withRef[0].referenceNumber);

  // 5. Fallback to earliest enquiry id
  const sortedEnq = [...group.enquiries].sort((a, b) => compareAsc(a.createdAt, b.createdAt) || a.id.localeCompare(b.id));
  return sortedEnq[0]?.id || 'UNKNOWN';
};

const pickBestField = (candidatesArr, accessor) => {
  for (const item of candidatesArr) {
    const val = cleanStr(accessor(item));
    if (val) return val;
  }
  return null;
};

const deriveLocation = (cpList, candList, enqList) => {
  const fromProfile = pickBestField(cpList, (r) => r.nationality);
  if (fromProfile) return fromProfile;

  for (const enq of enqList) {
    const cityState = [cleanStr(enq.preferred_city), cleanStr(enq.preferred_state)].filter(Boolean).join(', ');
    if (cityState) return cityState;
    const loc = cleanStr(enq.preferredLocation) || cleanStr(enq.workLocation) || cleanStr(enq.countryInterest);
    if (loc) return loc;
  }

  const fromCand = pickBestField(candList, (r) => r.nationality);
  return fromCand || null;
};

const buildEnrichedEnquiries = ({ leads, academyRows, careerRows, taskRows, employeeProfile }) => {
  const academyByRef = new Map();
  for (const s of academyRows) {
    const ref = cleanStr(s.referenceNumber);
    if (ref) academyByRef.set(ref, s);
  }

  const careerByRef = new Map();
  for (const c of careerRows) {
    const ref = cleanStr(c.enquiry_reference);
    if (ref) careerByRef.set(ref, c);
  }

  const tasksByEnquiryKey = new Map();
  for (const t of taskRows) {
    const keys = [cleanStr(t.enquiryId), cleanStr(t.referenceNumber)].filter(Boolean);
    for (const k of keys) {
      if (!tasksByEnquiryKey.has(k)) tasksByEnquiryKey.set(k, []);
      tasksByEnquiryKey.get(k).push(t);
    }
  }

  const matchedAcaRefs = new Set();
  const matchedCgRefs = new Set();
  const enriched = [];

  for (const l of leads) {
    const ref = cleanStr(l.referenceNumber);
    const aca = ref ? academyByRef.get(ref) : null;
    const cg = ref ? careerByRef.get(ref) : null;
    if (aca && ref) matchedAcaRefs.add(ref);
    if (cg && ref) matchedCgRefs.add(ref);

    const relatedTasks = [
      ...(tasksByEnquiryKey.get(cleanStr(l.id)) || []),
      ...(ref ? tasksByEnquiryKey.get(ref) || [] : [])
    ];
    const uniqueTasks = Array.from(new Map(relatedTasks.map((t) => [t.id, t])).values())
      .sort((a, b) => compareDesc(a.assignedAt || a.createdAt, b.assignedAt || b.createdAt));
    const latestTask = uniqueTasks[0] || null;

    const customFields = parseJsonSafe(l.customFields, {});
    const documentUrls = parseJsonSafe(l.documentUrls, []);

    const isLeadAssigned = matchesEmployeeAssignment(
      {
        assignedEmployeeId: l.assignedEmployeeId,
        assignedEmployee: l.assignedEmployee,
        assignedEmployeeEmail: l.assignedEmployeeEmail
      },
      employeeProfile
    );
    const isTaskAssigned = uniqueTasks.some((t) =>
      matchesEmployeeAssignment(
        {
          assignedEmployeeId: t.assignedEmployeeId,
          assignedEmployee: t.assignedEmployeeName
        },
        employeeProfile
      )
    );
    const isAcaAssigned = aca && matchesEmployeeAssignment({ assignedEmployee: aca.assignedEmployee }, employeeProfile);
    const isCgAssigned = cg && matchesEmployeeAssignment({ assignedEmployeeId: cg.assigned_counsellor_id, assignedEmployee: cg.assigned_counsellor_name }, employeeProfile);

    const assignedToMe = isLeadAssigned || isTaskAssigned || Boolean(isAcaAssigned) || Boolean(isCgAssigned);

    const status = cleanStr(l.status) || cleanStr(aca?.status) || cleanStr(cg?.status) || 'New';
    const isResolved = RESOLVED_STATUS_SET.has(status);
    const completedAt =
      cleanStr(latestTask?.completedAt) ||
      (isResolved ? cleanStr(l.updatedAt) || cleanStr(l.createdAt) : null);

    enriched.push({
      id: l.id,
      sourceTable: aca ? 'leads+student_academy' : cg ? 'leads+career_guidance' : 'leads',
      referenceNumber: ref || null,
      clientId: cleanStr(l.clientId) || cleanStr(cg?.student_id) || null,
      serviceId: cleanStr(l.serviceId) || (aca ? 'school-academy' : cg ? 'school-career' : null),
      serviceTitle: cleanStr(l.serviceTitle) || (aca ? 'Academy for School Students' : cg ? 'Career Guidance' : 'General Enquiry'),
      category:
        cleanStr(l.category_name) ||
        cleanStr(cg?.category_name) ||
        cleanStr(l.jobCategory) ||
        cleanStr(customFields?.category) ||
        null,
      enquiryType:
        cleanStr(aca?.enquiryType) ||
        cleanStr(l.workflowType) ||
        cleanStr(l.assistanceType) ||
        cleanStr(customFields?.enquiryType) ||
        cleanStr(cg?.programme_level) ||
        cleanStr(l.degreeLevel) ||
        null,
      name: cleanStr(l.name) || cleanStr(aca?.studentName) || cleanStr(cg?.student_name) || null,
      email: cleanStr(l.email) || cleanStr(aca?.email) || cleanStr(aca?.studentEmail) || cleanStr(cg?.email) || null,
      phone: cleanStr(l.phone) || cleanStr(aca?.phone) || cleanStr(aca?.studentPhone) || cleanStr(cg?.mobile_number) || null,
      company: cleanStr(l.company) || cleanStr(aca?.academyName) || null,
      courseName: cleanStr(l.courseName) || cleanStr(aca?.courseName) || cleanStr(cg?.course_name) || cleanStr(aca?.interestedProgram) || null,
      streamName: cleanStr(l.streamName) || null,
      department: cleanStr(l.department) || cleanStr(cg?.department_name) || cleanStr(customFields?.department) || null,
      specialization: cleanStr(l.specialization) || cleanStr(cg?.specialization_name) || null,
      collegeName: cleanStr(l.college_name) || cleanStr(cg?.college_name) || null,
      examDetails: cleanStr(l.entrance_exam_details) || cleanStr(cg?.entrance_exam_details) || cleanStr(aca?.examName) || cleanStr(customFields?.exam) || null,
      academyName: cleanStr(aca?.academyName) || null,
      marksOrPercentage: cleanStr(l.marks_or_percentage) || cleanStr(cg?.marks_or_percentage) || null,
      qualifyingDegree: cleanStr(l.qualifying_degree) || cleanStr(cg?.qualifying_degree) || cleanStr(cg?.academic_qualification) || cleanStr(aca?.qualification) || null,
      graduationDiscipline: cleanStr(l.graduation_discipline) || cleanStr(cg?.graduation_discipline) || null,
      workExperience: cleanStr(l.work_experience) || cleanStr(cg?.work_experience) || cleanStr(l.experience) || null,
      countryInterest: cleanStr(l.countryInterest) || null,
      intakeTerm: cleanStr(l.intakeTerm) || null,
      degreeLevel: cleanStr(l.degreeLevel) || cleanStr(cg?.programme_level) || null,
      preferredLearningMode: cleanStr(aca?.preferredLearningMode) || cleanStr(aca?.coachingMode) || null,
      batchPreference: cleanStr(aca?.batchPreference) || null,
      parentGuardianName: cleanStr(aca?.parentGuardianName) || null,
      studentClassGrade: cleanStr(aca?.studentClassGrade) || null,
      preferredLocation: cleanStr(aca?.preferredLocation) || [cleanStr(l.preferred_city || cg?.preferred_city), cleanStr(l.preferred_state || cg?.preferred_state)].filter(Boolean).join(', ') || cleanStr(l.workLocation) || null,
      preferred_city: cleanStr(l.preferred_city) || cleanStr(cg?.preferred_city) || null,
      preferred_state: cleanStr(l.preferred_state) || cleanStr(cg?.preferred_state) || null,
      workLocation: cleanStr(l.workLocation) || null,
      preferredContactMethod: cleanStr(l.preferredContactMethod) || cleanStr(aca?.preferredContactMethod) || null,
      assistanceType: cleanStr(l.assistanceType) || null,
      consultationDate: cleanStr(l.consultationDate) || null,
      consultationTime: cleanStr(l.consultationTime) || null,
      consultationMode: cleanStr(l.consultationMode) || null,
      message: cleanStr(l.message) || cleanStr(aca?.questions) || cleanStr(cg?.message) || null,
      customFields: customFields && typeof customFields === 'object' ? customFields : {},
      documentUrls: Array.isArray(documentUrls) ? documentUrls : [],
      cvPath: cleanStr(l.cvPath) || null,
      status,
      priority: cleanStr(l.priority) || cleanStr(latestTask?.priority) || 'Normal',
      assignedEmployee: cleanStr(l.assignedEmployee) || cleanStr(latestTask?.assignedEmployeeName) || cleanStr(aca?.assignedEmployee) || cleanStr(cg?.assigned_counsellor_name) || 'Unassigned',
      assignedEmployeeId: cleanStr(l.assignedEmployeeId) || cleanStr(latestTask?.assignedEmployeeId) || cleanStr(cg?.assigned_counsellor_id) || null,
      assignedEmployeeEmail: cleanStr(l.assignedEmployeeEmail) || null,
      operationTeam: cleanStr(l.operationTeam) || cleanStr(latestTask?.operationTeam) || null,
      assignmentNotes: cleanStr(l.assignmentNotes) || cleanStr(latestTask?.notes) || null,
      assignedBy: cleanStr(l.assignedBy) || cleanStr(latestTask?.assignedByName) || null,
      assignedAt: toIsoTimestamp(l.assignedAt || latestTask?.assignedAt),
      taskStatus: cleanStr(l.taskStatus) || cleanStr(latestTask?.taskStatus) || null,
      taskDueDate: cleanStr(l.taskDueDate) || cleanStr(latestTask?.dueDate) || null,
      nextAction: cleanStr(l.nextAction) || null,
      nextActionDate: cleanStr(l.nextActionDate) || null,
      internalNotes: cleanStr(l.internalNotes) || null,
      completedAt: toIsoTimestamp(completedAt),
      createdAt: toIsoTimestamp(l.createdAt || aca?.createdAt || cg?.createdAt),
      updatedAt: toIsoTimestamp(l.updatedAt || aca?.updatedAt || cg?.updatedAt),
      taskAssignments: uniqueTasks,
      isAssignedToMe: assignedToMe,
      canEditThisEnquiry: assignedToMe || !hasExplicitDifferentAssignee(
        {
          assignedEmployeeId: l.assignedEmployeeId || latestTask?.assignedEmployeeId || cg?.assigned_counsellor_id,
          assignedEmployee: l.assignedEmployee || latestTask?.assignedEmployeeName || aca?.assignedEmployee || cg?.assigned_counsellor_name,
          assignedEmployeeEmail: l.assignedEmployeeEmail
        },
        employeeProfile
      )
    });
  }

  // Include any unmirrored student_academy_enquiries rows safely
  for (const aca of academyRows) {
    const ref = cleanStr(aca.referenceNumber);
    if (ref && matchedAcaRefs.has(ref)) continue;
    const assignedToMe = matchesEmployeeAssignment({ assignedEmployee: aca.assignedEmployee }, employeeProfile);
    enriched.push({
      id: aca.id,
      sourceTable: 'student_academy_enquiries',
      referenceNumber: ref || null,
      clientId: null,
      serviceId: 'school-academy',
      serviceTitle: 'Academy for School Students',
      category: 'Academy',
      enquiryType: cleanStr(aca.enquiryType) || 'Academy Enquiry',
      name: cleanStr(aca.studentName) || null,
      email: cleanStr(aca.email) || cleanStr(aca.studentEmail) || null,
      phone: cleanStr(aca.phone) || cleanStr(aca.studentPhone) || null,
      company: cleanStr(aca.academyName) || null,
      courseName: cleanStr(aca.courseName) || cleanStr(aca.interestedProgram) || null,
      examDetails: cleanStr(aca.examName) || null,
      academyName: cleanStr(aca.academyName) || null,
      qualifyingDegree: cleanStr(aca.qualification) || null,
      preferredLearningMode: cleanStr(aca.preferredLearningMode) || cleanStr(aca.coachingMode) || null,
      batchPreference: cleanStr(aca.batchPreference) || null,
      parentGuardianName: cleanStr(aca.parentGuardianName) || null,
      studentClassGrade: cleanStr(aca.studentClassGrade) || null,
      preferredLocation: cleanStr(aca.preferredLocation) || null,
      preferredContactMethod: cleanStr(aca.preferredContactMethod) || null,
      message: cleanStr(aca.questions) || null,
      customFields: {},
      documentUrls: [],
      status: cleanStr(aca.status) || 'New',
      priority: 'Normal',
      assignedEmployee: cleanStr(aca.assignedEmployee) || 'Unassigned',
      assignedEmployeeId: null,
      operationTeam: 'Enquiry HR Operations',
      createdAt: toIsoTimestamp(aca.createdAt),
      updatedAt: toIsoTimestamp(aca.updatedAt),
      taskAssignments: [],
      isAssignedToMe: assignedToMe,
      canEditThisEnquiry: assignedToMe || !hasExplicitDifferentAssignee({ assignedEmployee: aca.assignedEmployee }, employeeProfile)
    });
  }

  // Include any unmirrored career_guidance_enquiries rows safely
  for (const cg of careerRows) {
    const ref = cleanStr(cg.enquiry_reference);
    if (ref && matchedCgRefs.has(ref)) continue;
    const assignedToMe = matchesEmployeeAssignment(
      { assignedEmployeeId: cg.assigned_counsellor_id, assignedEmployee: cg.assigned_counsellor_name },
      employeeProfile
    );
    enriched.push({
      id: cg.id,
      sourceTable: 'career_guidance_enquiries',
      referenceNumber: ref || null,
      clientId: cleanStr(cg.student_id) || null,
      serviceId: 'school-career',
      serviceTitle: 'Career Guidance',
      category: cleanStr(cg.category_name) || null,
      enquiryType: cleanStr(cg.programme_level) || 'Career Guidance',
      name: cleanStr(cg.student_name) || null,
      email: cleanStr(cg.email) || null,
      phone: cleanStr(cg.mobile_number) || null,
      courseName: cleanStr(cg.course_name) || null,
      department: cleanStr(cg.department_name) || null,
      specialization: cleanStr(cg.specialization_name) || null,
      collegeName: cleanStr(cg.college_name) || null,
      examDetails: cleanStr(cg.entrance_exam_details) || null,
      marksOrPercentage: cleanStr(cg.marks_or_percentage) || null,
      qualifyingDegree: cleanStr(cg.qualifying_degree) || cleanStr(cg.academic_qualification) || null,
      graduationDiscipline: cleanStr(cg.graduation_discipline) || null,
      workExperience: cleanStr(cg.work_experience) || null,
      degreeLevel: cleanStr(cg.programme_level) || null,
      preferredLocation: [cleanStr(cg.preferred_city), cleanStr(cg.preferred_state)].filter(Boolean).join(', ') || null,
      preferred_city: cleanStr(cg.preferred_city) || null,
      preferred_state: cleanStr(cg.preferred_state) || null,
      message: cleanStr(cg.message) || null,
      customFields: {},
      documentUrls: [],
      status: cleanStr(cg.status) || 'New',
      priority: 'Normal',
      assignedEmployee: cleanStr(cg.assigned_counsellor_name) || 'Unassigned',
      assignedEmployeeId: cleanStr(cg.assigned_counsellor_id) || null,
      operationTeam: 'Enquiry HR Operations',
      createdAt: toIsoTimestamp(cg.createdAt),
      updatedAt: toIsoTimestamp(cg.updatedAt),
      taskAssignments: [],
      isAssignedToMe: assignedToMe,
      canEditThisEnquiry: assignedToMe || !hasExplicitDifferentAssignee(
        { assignedEmployeeId: cg.assigned_counsellor_id, assignedEmployee: cg.assigned_counsellor_name },
        employeeProfile
      )
    });
  }

  return enriched;
};

/**
 * Build unified deduplicated candidate groups and resolve authorization for the given HR employee.
 */
export const buildCandidateDirectoryModel = async (db, employee) => {
  const employeeProfile = getEmployeeMatchProfile(employee);

  const [candidatesRows, profilesRows, leadsRows, academyRows, careerRows, taskRows] = await Promise.all([
    db.all('SELECT * FROM candidates ORDER BY createdAt DESC'),
    db.all('SELECT * FROM candidate_profiles ORDER BY createdAt DESC'),
    db.all('SELECT * FROM leads WHERE (isArchived IS NULL OR isArchived = 0) ORDER BY createdAt DESC'),
    db.all('SELECT * FROM student_academy_enquiries ORDER BY createdAt DESC'),
    db.all('SELECT * FROM career_guidance_enquiries ORDER BY createdAt DESC'),
    db.all('SELECT * FROM hr_task_assignments ORDER BY createdAt DESC')
  ]);

  const enrichedEnquiries = buildEnrichedEnquiries({
    leads: leadsRows || [],
    academyRows: academyRows || [],
    careerRows: careerRows || [],
    taskRows: taskRows || [],
    employeeProfile
  });

  const dsu = new CandidateDisjointSet();
  const nodeMeta = new Map();
  const firstByEmail = new Map();
  const candNodeById = new Map();
  const cpNodeById = new Map();
  const cpNodeByUserId = new Map();
  const firstPhoneNameNoEmail = new Map();

  const registerNode = (nodeKey, kind, record, emailRaw, phoneRaw, nameRaw) => {
    const email = normalizeEmail(emailRaw);
    const phone = normalizePhone(phoneRaw);
    const name = normalizeName(nameRaw);
    dsu.addNode(nodeKey, email);
    nodeMeta.set(nodeKey, { kind, record, email, phone, name });

    if (email) {
      if (firstByEmail.has(email)) {
        dsu.union(firstByEmail.get(email), nodeKey, { requireNonConflictingEmails: true });
      } else {
        firstByEmail.set(email, nodeKey);
      }
    } else if (phone && name) {
      const pnKey = `${phone}|${name}`;
      if (firstPhoneNameNoEmail.has(pnKey)) {
        dsu.union(firstPhoneNameNoEmail.get(pnKey), nodeKey, { requireNonConflictingEmails: true });
      } else {
        firstPhoneNameNoEmail.set(pnKey, nodeKey);
      }
    }
  };

  for (const cp of profilesRows || []) {
    const key = `cp:${cp.id}`;
    cpNodeById.set(cp.id, key);
    if (cleanStr(cp.userId)) cpNodeByUserId.set(cleanStr(cp.userId), key);
    registerNode(key, 'cp', cp, cp.email, cp.phone, cp.name);
  }

  for (const cand of candidatesRows || []) {
    const key = `cand:${cand.id}`;
    candNodeById.set(cand.id, key);
    registerNode(key, 'cand', cand, cand.email, cand.phone, cand.name);
    if (cpNodeById.has(cand.id)) {
      dsu.union(cpNodeById.get(cand.id), key, { requireNonConflictingEmails: true });
    }
  }

  for (const enq of enrichedEnquiries) {
    const key = `enq:${enq.id}`;
    registerNode(key, 'enq', enq, enq.email, enq.phone, enq.name);

    const cId = cleanStr(enq.clientId);
    if (cId) {
      if (cpNodeById.has(cId)) dsu.union(cpNodeById.get(cId), key, { requireNonConflictingEmails: true });
      else if (cpNodeByUserId.has(cId)) dsu.union(cpNodeByUserId.get(cId), key, { requireNonConflictingEmails: true });
      else if (candNodeById.has(cId)) dsu.union(candNodeById.get(cId), key, { requireNonConflictingEmails: true });
    }

    // Fallback link: if enquiry lacks email, link only with candidate having same normalized phone + exact same name and no conflicting emails
    const email = normalizeEmail(enq.email);
    const phone = normalizePhone(enq.phone);
    const name = normalizeName(enq.name);
    if (!email && phone && name) {
      for (const [otherKey, meta] of nodeMeta.entries()) {
        if (otherKey !== key && meta.phone === phone && meta.name === name) {
          dsu.union(otherKey, key, { requireNonConflictingEmails: true });
          break;
        }
      }
    }
  }

  // Group into consolidated candidate buckets
  const groupsByRoot = new Map();
  for (const [nodeKey, meta] of nodeMeta.entries()) {
    const root = dsu.find(nodeKey);
    if (!groupsByRoot.has(root)) {
      groupsByRoot.set(root, {
        candidateProfiles: [],
        candidateRows: [],
        enquiries: [],
        aliasKeys: new Set()
      });
    }
    const g = groupsByRoot.get(root);
    if (meta.kind === 'cp') {
      g.candidateProfiles.push(meta.record);
      g.aliasKeys.add(meta.record.id);
      if (cleanStr(meta.record.userId)) g.aliasKeys.add(cleanStr(meta.record.userId));
    } else if (meta.kind === 'cand') {
      g.candidateRows.push(meta.record);
      g.aliasKeys.add(meta.record.id);
    } else if (meta.kind === 'enq') {
      g.enquiries.push(meta.record);
      g.aliasKeys.add(meta.record.id);
      if (cleanStr(meta.record.referenceNumber)) g.aliasKeys.add(cleanStr(meta.record.referenceNumber));
      if (cleanStr(meta.record.clientId)) g.aliasKeys.add(cleanStr(meta.record.clientId));
    }
  }

  const candidates = [];
  const lookupByKey = new Map();
  const groupByEnquiryId = new Map();

  for (const g of groupsByRoot.values()) {
    g.enquiries.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    const sortedCands = [...g.candidateRows].sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    const sortedProfiles = [...g.candidateProfiles].sort((a, b) => compareDesc(a.createdAt, b.createdAt));

    const candidateReferenceNumber = chooseCanonicalReference(g);
    const candidateKey = candidateReferenceNumber;
    g.aliasKeys.add(candidateKey);

    const fullName =
      pickBestField(sortedProfiles, (r) => r.name) ||
      pickBestField(sortedCands, (r) => r.name) ||
      pickBestField(g.enquiries, (r) => r.name) ||
      'Unnamed Candidate';

    const email =
      pickBestField(sortedProfiles, (r) => normalizeEmail(r.email)) ||
      pickBestField(sortedCands, (r) => normalizeEmail(r.email)) ||
      pickBestField(g.enquiries, (r) => normalizeEmail(r.email)) ||
      null;

    const phone =
      pickBestField(sortedProfiles, (r) => r.phone) ||
      pickBestField(sortedCands, (r) => r.phone) ||
      pickBestField(g.enquiries, (r) => r.phone) ||
      null;

    const location = deriveLocation(sortedProfiles, sortedCands, g.enquiries);

    const allCreatedDates = [
      ...sortedProfiles.map((r) => r.createdAt),
      ...sortedCands.map((r) => r.createdAt),
      ...g.enquiries.map((r) => r.createdAt)
    ]
      .filter(Boolean)
      .sort(compareAsc);

    const registrationDate = allCreatedDates.length > 0 ? toIsoTimestamp(allCreatedDates[0]) : null;
    const latestEnquiryDate = g.enquiries.length > 0 ? g.enquiries[0].createdAt : null;

    const status =
      pickBestField(sortedProfiles, (r) => r.stage) ||
      pickBestField(sortedCands, (r) => r.stage) ||
      (g.enquiries[0]?.status || null);

    const isAuthorizedForEmployee = g.enquiries.some((e) => e.isAssignedToMe);

    const consolidated = {
      candidateKey,
      candidateReferenceNumber,
      fullName,
      email,
      phone,
      location,
      registrationDate,
      latestEnquiryDate,
      status,
      avatar: pickBestField(sortedProfiles, (r) => r.avatar) || pickBestField(sortedCands, (r) => r.avatar),
      nationality: pickBestField(sortedProfiles, (r) => r.nationality) || pickBestField(sortedCands, (r) => r.nationality),
      currentRole: pickBestField(sortedProfiles, (r) => r.currentRole) || pickBestField(sortedCands, (r) => r.currentRole),
      currentEmployer: pickBestField(sortedProfiles, (r) => r.currentEmployer) || pickBestField(sortedCands, (r) => r.currentEmployer),
      experience: pickBestField(sortedProfiles, (r) => r.experience) || pickBestField(sortedCands, (r) => r.experience),
      education: pickBestField(sortedProfiles, (r) => r.education),
      skills: parseJsonSafe(sortedProfiles[0]?.skills || sortedCands[0]?.skills, []),
      source: pickBestField(sortedCands, (r) => r.source),
      candidateProfileIds: sortedProfiles.map((r) => r.id),
      candidateRecordIds: sortedCands.map((r) => r.id),
      enquiries: g.enquiries,
      aliasKeys: g.aliasKeys,
      isAuthorizedForEmployee
    };

    candidates.push(consolidated);

    // Index canonical key directly; also index alias keys cleanly (canonical wins on collision)
    lookupByKey.set(candidateKey, consolidated);
    lookupByKey.set(candidateKey.toLowerCase(), consolidated);
    for (const alias of g.aliasKeys) {
      if (!lookupByKey.has(alias)) lookupByKey.set(alias, consolidated);
      const lowerAlias = alias.toLowerCase();
      if (!lookupByKey.has(lowerAlias)) lookupByKey.set(lowerAlias, consolidated);
    }

    for (const enq of g.enquiries) {
      groupByEnquiryId.set(enq.id, { candidate: consolidated, enquiry: enq });
      if (enq.referenceNumber) {
        groupByEnquiryId.set(enq.referenceNumber, { candidate: consolidated, enquiry: enq });
      }
    }
  }

  return { candidates, lookupByKey, groupByEnquiryId, employeeProfile };
};

/**
 * List authorized unique candidates for the authenticated HR Operations employee.
 */
export const listHrCandidateDirectory = async (db, employee, { search = '', page = 1, limit = 15 } = {}) => {
  const model = await buildCandidateDirectoryModel(db, employee);
  const authorized = model.candidates
    .filter((c) => c.isAuthorizedForEmployee)
    .sort((a, b) => compareDesc(a.latestEnquiryDate || a.registrationDate, b.latestEnquiryDate || b.registrationDate) || a.fullName.localeCompare(b.fullName));

  const q = cleanStr(search).toLowerCase();
  const filtered = q
    ? authorized.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.candidateReferenceNumber.toLowerCase().includes(q)
      )
    : authorized;

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 100);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
  const safePage = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);
  const offset = (safePage - 1) * safeLimit;
  const paged = filtered.slice(offset, offset + safeLimit);

  return {
    candidates: paged.map((c) => ({
      candidateKey: c.candidateKey,
      candidateReferenceNumber: c.candidateReferenceNumber,
      fullName: c.fullName
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages
    }
  };
};

/**
 * Assemble complete candidate profile, associated enquiries, follow-ups, notes,
 * and genuine chronological activity timeline with strict authorization enforcement.
 */
export const getHrCandidateProfile = async (db, employee, candidateKey) => {
  const model = await buildCandidateDirectoryModel(db, employee);
  const rawKey = cleanStr(candidateKey);
  const candidate = model.lookupByKey.get(rawKey) || model.lookupByKey.get(rawKey.toLowerCase());

  if (!candidate) {
    throw new HttpError(404, 'Candidate record not found.');
  }
  if (!candidate.isAuthorizedForEmployee) {
    throw new HttpError(403, 'Access denied: you are not authorized to view this candidate profile.');
  }

  const enqIdSet = new Set();
  const enqByKey = new Map();
  for (const e of candidate.enquiries) {
    enqIdSet.add(e.id);
    enqByKey.set(e.id, e);
    if (e.referenceNumber) {
      enqIdSet.add(e.referenceNumber);
      enqByKey.set(e.referenceNumber, e);
    }
  }

  const enquiryKeys = Array.from(enqIdSet);
  const entityAuditIds = Array.from(new Set([
    ...enquiryKeys,
    candidate.candidateReferenceNumber,
    ...candidate.candidateRecordIds,
    ...candidate.candidateProfileIds
  ]));

  let followUpRows = [];
  let activityRows = [];
  let auditRows = [];

  if (enquiryKeys.length > 0) {
    const placeholders = enquiryKeys.map(() => '?').join(', ');
    followUpRows = await db.all(
      `SELECT * FROM follow_ups WHERE enquiryId IN (${placeholders}) ORDER BY dueDateTime DESC, createdAt DESC`,
      enquiryKeys
    );
    activityRows = await db.all(
      `SELECT * FROM enquiry_activities WHERE enquiryId IN (${placeholders}) ORDER BY createdAt ASC`,
      enquiryKeys
    );
  }

  if (entityAuditIds.length > 0) {
    const auditPlaceholders = entityAuditIds.map(() => '?').join(', ');
    auditRows = await db.all(
      `SELECT * FROM audit_logs WHERE entityId IN (${auditPlaceholders}) ORDER BY createdAt ASC`,
      entityAuditIds
    );
  }

  const followUps = (followUpRows || []).map((f) => {
    const linkedEnq = enqByKey.get(f.enquiryId);
    return {
      id: f.id,
      enquiryId: linkedEnq?.id || f.enquiryId,
      enquiryReference: linkedEnq?.referenceNumber || f.enquiryId,
      serviceTitle: linkedEnq?.serviceTitle || 'Enquiry',
      title: f.title,
      purpose: f.purpose,
      dueDateTime: toIsoTimestamp(f.dueDateTime) || f.dueDateTime,
      assignedTo: f.assignedTo,
      status: f.status || 'Pending',
      completionNotes: cleanStr(f.completionNotes) || null,
      createdBy: f.createdBy,
      createdAt: toIsoTimestamp(f.createdAt),
      completedAt: toIsoTimestamp(f.completedAt),
      canModify: linkedEnq ? linkedEnq.canEditThisEnquiry : false
    };
  });

  // Attach followUps & activity rows onto each enquiry
  const enquiriesWithDetails = candidate.enquiries.map((e) => {
    const enqFollowUps = followUps.filter((f) => f.enquiryId === e.id || (e.referenceNumber && f.enquiryId === e.referenceNumber));
    const enqActivities = (activityRows || [])
      .filter((a) => a.enquiryId === e.id || (e.referenceNumber && a.enquiryId === e.referenceNumber))
      .map((a) => ({
        id: a.id,
        enquiryId: e.id,
        type: a.type,
        title: a.title,
        notes: cleanStr(a.notes) || null,
        createdBy: a.createdBy,
        createdAt: toIsoTimestamp(a.createdAt)
      }));

    return {
      ...e,
      followUps: enqFollowUps,
      activities: enqActivities
    };
  });

  // Extract genuine notes from enquiry_activities + audit/internalNotes
  const notesList = [];
  for (const a of activityRows || []) {
    if ((a.type || '').toLowerCase().includes('note') || (a.title || '').toLowerCase().includes('internal note')) {
      const linkedEnq = enqByKey.get(a.enquiryId);
      notesList.push({
        id: a.id,
        enquiryId: linkedEnq?.id || a.enquiryId,
        enquiryReference: linkedEnq?.referenceNumber || a.enquiryId,
        serviceTitle: linkedEnq?.serviceTitle || 'Enquiry',
        note: cleanStr(a.notes) || cleanStr(a.title),
        createdBy: a.createdBy || 'CRM Staff',
        createdAt: toIsoTimestamp(a.createdAt)
      });
    }
  }
  notesList.sort((a, b) => compareDesc(a.createdAt, b.createdAt));

  // Build genuine chronological activity timeline without fabricating events
  const timeline = [];
  const dedupKeys = new Set();
  const pushTimelineEvent = (evt) => {
    if (!evt.timestamp) return;
    const dedupSig = `${evt.eventType}|${evt.enquiryId || ''}|${evt.timestamp.slice(0, 19)}|${evt.title}`;
    if (dedupKeys.has(dedupSig)) return;
    dedupKeys.add(dedupSig);
    timeline.push(evt);
  };

  // 1. Enquiry submission & HR task assignments directly from DB tables
  for (const e of candidate.enquiries) {
    if (e.createdAt) {
      pushTimelineEvent({
        id: `sub-${e.id}`,
        eventType: 'ENQUIRY_SUBMITTED',
        title: `Enquiry Submitted (${e.serviceTitle || 'Service'})`,
        description: e.message || `${e.serviceTitle || 'Enquiry'} recorded`,
        enquiryId: e.id,
        enquiryReference: e.referenceNumber || e.id,
        serviceTitle: e.serviceTitle,
        actorName: candidate.fullName,
        actorRole: 'Candidate',
        timestamp: e.createdAt
      });
    }

    for (const t of e.taskAssignments || []) {
      const assignTs = toIsoTimestamp(t.assignedAt || t.createdAt);
      if (assignTs) {
        pushTimelineEvent({
          id: `assign-${t.id}`,
          eventType: 'ENQUIRY_ASSIGNED',
          title: `Assigned to ${t.assignedEmployeeName || 'HR Specialist'}`,
          description: cleanStr(t.notes) || `${t.operationTeam || 'HR Operations'} task assigned (Priority: ${t.priority || 'Normal'})`,
          enquiryId: e.id,
          enquiryReference: e.referenceNumber || e.id,
          serviceTitle: e.serviceTitle,
          actorName: t.assignedByName || e.assignedBy || 'HR Lead',
          actorRole: 'HR Lead',
          timestamp: assignTs
        });
      }
      if (t.completedAt) {
        pushTimelineEvent({
          id: `task-done-${t.id}`,
          eventType: 'ENQUIRY_RESOLVED',
          title: 'Enquiry Task Completed',
          description: `Marked ${t.taskStatus || 'Completed'}`,
          enquiryId: e.id,
          enquiryReference: e.referenceNumber || e.id,
          serviceTitle: e.serviceTitle,
          actorName: t.assignedEmployeeName || 'HR Operations',
          actorRole: 'HR Operations',
          timestamp: toIsoTimestamp(t.completedAt)
        });
      }
    }
  }

  // 2. Real rows in enquiry_activities
  for (const a of activityRows || []) {
    const linkedEnq = enqByKey.get(a.enquiryId);
    const ts = toIsoTimestamp(a.createdAt);
    const titleStr = cleanStr(a.title) || cleanStr(a.type) || 'Activity';
    const typeLower = (a.type || '').toLowerCase();
    const titleLower = titleStr.toLowerCase();

    // Avoid duplicating Enquiry Submitted if Inquiry Received was inserted at same timestamp
    if ((typeLower === 'inquiry received' || titleLower.includes('submitted')) && linkedEnq?.createdAt) {
      const dt = Math.abs(Date.parse(ts || '') - Date.parse(linkedEnq.createdAt));
      if (!Number.isNaN(dt) && dt < 5000) continue;
    }

    let eventType = 'ACTIVITY';
    if (typeLower.includes('assign') || titleLower.includes('assign')) eventType = 'ENQUIRY_ASSIGNED';
    else if (titleLower.includes('reopen')) eventType = 'ENQUIRY_REOPENED';
    else if (titleLower.includes('resolv') || titleLower.includes('closed') || titleLower.includes('completed')) eventType = 'ENQUIRY_RESOLVED';
    else if (typeLower.includes('status') || titleLower.includes('status')) eventType = 'STATUS_CHANGED';
    else if (typeLower.includes('priority') || titleLower.includes('priority')) eventType = 'PRIORITY_CHANGED';
    else if (typeLower.includes('follow-up') || typeLower.includes('follow up') || titleLower.includes('follow')) eventType = 'FOLLOW_UP';
    else if (typeLower.includes('note') || titleLower.includes('note')) eventType = 'NOTE_ADDED';

    pushTimelineEvent({
      id: `act-${a.id}`,
      eventType,
      title: titleStr,
      description: cleanStr(a.notes) || titleStr,
      enquiryId: linkedEnq?.id || a.enquiryId,
      enquiryReference: linkedEnq?.referenceNumber || a.enquiryId,
      serviceTitle: linkedEnq?.serviceTitle || 'Enquiry',
      actorName: a.createdBy || 'CRM Staff',
      actorRole: null,
      timestamp: ts
    });
  }

  // 3. Follow-ups (Scheduled & Completed events)
  for (const f of followUps) {
    if (f.createdAt) {
      pushTimelineEvent({
        id: `fu-sched-${f.id}`,
        eventType: 'FOLLOW_UP',
        title: `Follow-up Scheduled: ${f.title}`,
        description: `${f.purpose || 'Follow-up'} (Due: ${f.dueDateTime || 'Scheduled'})`,
        enquiryId: f.enquiryId,
        enquiryReference: f.enquiryReference,
        serviceTitle: f.serviceTitle,
        actorName: f.createdBy || f.assignedTo || 'HR Operations',
        actorRole: null,
        timestamp: f.createdAt
      });
    }
    if (f.completedAt) {
      pushTimelineEvent({
        id: `fu-comp-${f.id}`,
        eventType: 'FOLLOW_UP_COMPLETED',
        title: `Follow-up Completed: ${f.title}`,
        description: f.completionNotes || 'Follow-up marked as completed',
        enquiryId: f.enquiryId,
        enquiryReference: f.enquiryReference,
        serviceTitle: f.serviceTitle,
        actorName: f.assignedTo || 'HR Operations',
        actorRole: null,
        timestamp: f.completedAt
      });
    }
  }

  // 4. Genuine audit_logs matching candidate or enquiries
  for (const log of auditRows || []) {
    const linkedEnq = enqByKey.get(log.entityId);
    const detailsObj = parseJsonSafe(log.details, {});
    const ts = toIsoTimestamp(log.createdAt);
    const action = cleanStr(log.action);

    let eventType = 'AUDIT_EVENT';
    let title = action.replace(/_/g, ' ');
    let desc = '';

    if (action.includes('PRIORITY')) {
      eventType = 'PRIORITY_CHANGED';
      title = 'Priority Updated';
      desc = detailsObj?.priority ? `Priority changed to ${detailsObj.priority}` : 'Enquiry priority updated';
    } else if (action.includes('STATUS') || action === 'UPDATE_ENQUIRY_STATUS') {
      eventType = RESOLVED_STATUS_SET.has(detailsObj?.newStatus || detailsObj?.status) ? 'ENQUIRY_RESOLVED' : 'STATUS_CHANGED';
      title = `Status Changed${detailsObj?.newStatus ? ` to ${detailsObj.newStatus}` : ''}`;
      desc = detailsObj?.previousStatus ? `${detailsObj.previousStatus} → ${detailsObj.newStatus || detailsObj.status}` : (detailsObj?.reason || title);
    } else if (action.includes('ASSIGN')) {
      eventType = 'ENQUIRY_ASSIGNED';
      title = `Assigned${detailsObj?.assignedEmployee ? ` to ${detailsObj.assignedEmployee}` : ''}`;
      desc = cleanStr(detailsObj?.notes) || title;
    } else if (action === 'UPDATE_CANDIDATE_PROFILE') {
      eventType = 'CANDIDATE_UPDATED';
      title = 'Candidate Information Updated';
      desc = cleanStr(detailsObj?.summary) || 'Permitted candidate fields updated';
    } else if (action === 'ADD_INTERNAL_NOTE') {
      eventType = 'NOTE_ADDED';
      title = 'Internal Note Added';
      desc = cleanStr(detailsObj?.note) || 'Internal note logged';
    } else if (action.includes('FOLLOW_UP')) {
      eventType = action.includes('COMPLETE') ? 'FOLLOW_UP_COMPLETED' : 'FOLLOW_UP';
      title = detailsObj?.title || title;
      desc = cleanStr(detailsObj?.notes || detailsObj?.purpose) || title;
    }

    pushTimelineEvent({
      id: `audit-${log.id}`,
      eventType,
      title,
      description: desc || title,
      enquiryId: linkedEnq?.id || null,
      enquiryReference: linkedEnq?.referenceNumber || candidate.candidateReferenceNumber,
      serviceTitle: linkedEnq?.serviceTitle || 'Candidate Profile',
      actorName: log.userName || 'System',
      actorRole: log.role || null,
      timestamp: ts
    });
  }

  // Sort timeline in chronological order (oldest -> newest) so lifecycle flows top-to-bottom cleanly
  timeline.sort((a, b) => compareAsc(a.timestamp, b.timestamp));

  const activeCount = enquiriesWithDetails.filter((e) => !RESOLVED_STATUS_SET.has(e.status) && e.status !== 'Cancelled').length;
  const completedCount = enquiriesWithDetails.filter((e) => RESOLVED_STATUS_SET.has(e.status)).length;
  const pendingFollowUpsCount = followUps.filter((f) => (f.status || 'Pending') === 'Pending').length;

  return {
    candidate: {
      candidateKey: candidate.candidateKey,
      candidateReferenceNumber: candidate.candidateReferenceNumber,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
      registrationDate: candidate.registrationDate,
      latestEnquiryDate: candidate.latestEnquiryDate,
      status: candidate.status,
      avatar: candidate.avatar || null,
      nationality: candidate.nationality || null,
      currentRole: candidate.currentRole || null,
      currentEmployer: candidate.currentEmployer || null,
      experience: candidate.experience || null,
      education: candidate.education || null,
      skills: Array.isArray(candidate.skills) && candidate.skills.length > 0 ? candidate.skills : null,
      source: candidate.source || null
    },
    summary: {
      totalEnquiries: enquiriesWithDetails.length,
      activeEnquiries: activeCount,
      completedEnquiries: completedCount,
      totalFollowUps: followUps.length,
      pendingFollowUps: pendingFollowUpsCount,
      timelineCount: timeline.length
    },
    enquiries: enquiriesWithDetails,
    followUps,
    notes: notesList,
    timeline
  };
};

/**
 * Retrieve complete single enquiry details after verifying candidate access authorization.
 */
export const getHrEnquiryDetails = async (db, employee, enquiryId, logAuditFn, clientIp) => {
  const model = await buildCandidateDirectoryModel(db, employee);
  const resolved = model.groupByEnquiryId.get(cleanStr(enquiryId));
  if (!resolved) {
    throw new HttpError(404, 'Enquiry record not found.');
  }
  if (!resolved.candidate.isAuthorizedForEmployee) {
    throw new HttpError(403, 'Access denied: you are not authorized to access this enquiry.');
  }

  const profile = await getHrCandidateProfile(db, employee, resolved.candidate.candidateKey);
  const enquiry = profile.enquiries.find((e) => e.id === resolved.enquiry.id);
  if (!enquiry) {
    throw new HttpError(404, 'Enquiry details not found.');
  }

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'VIEW_HR_ENQUIRY_DETAIL',
      entityType: 'Lead',
      entityId: enquiry.id,
      details: { candidateRef: resolved.candidate.candidateReferenceNumber },
      ip: clientIp
    });
  }

  return {
    candidate: {
      candidateKey: resolved.candidate.candidateKey,
      candidateReferenceNumber: resolved.candidate.candidateReferenceNumber,
      fullName: resolved.candidate.fullName,
      email: resolved.candidate.email,
      phone: resolved.candidate.phone
    },
    enquiry
  };
};

/**
 * Update permitted candidate contact/location fields only.
 */
export const updateHrCandidateInfo = async (db, employee, candidateKey, payload, logAuditFn, clientIp) => {
  for (const field of FORBIDDEN_CANDIDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload || {}, field)) {
      throw new HttpError(403, `Access denied: modification of '${field}' is restricted for HR Operations.`);
    }
  }

  const model = await buildCandidateDirectoryModel(db, employee);
  const rawKey = cleanStr(candidateKey);
  const candidate = model.lookupByKey.get(rawKey) || model.lookupByKey.get(rawKey.toLowerCase());
  if (!candidate) {
    throw new HttpError(404, 'Candidate record not found.');
  }
  if (!candidate.isAuthorizedForEmployee) {
    throw new HttpError(403, 'Access denied: you are not authorized to modify this candidate.');
  }

  const nextFullName = payload.fullName !== undefined ? cleanStr(payload.fullName) : undefined;
  const nextEmail = payload.email !== undefined ? normalizeEmail(payload.email) : undefined;
  const nextPhone = payload.phone !== undefined ? cleanStr(payload.phone) : undefined;
  const nextLocation = payload.location !== undefined ? cleanStr(payload.location) : undefined;

  if (nextFullName !== undefined && !nextFullName) {
    throw new HttpError(400, 'Candidate full name cannot be empty.');
  }
  if (payload.email !== undefined && cleanStr(payload.email) && !nextEmail) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }

  // Prevent changing email to an email belonging to another candidate group
  if (nextEmail && nextEmail !== candidate.email) {
    const conflict = model.candidates.find((c) => c.candidateKey !== candidate.candidateKey && c.email === nextEmail);
    if (conflict) {
      throw new HttpError(409, 'This email address is already associated with another candidate record.');
    }
  }

  const updatedFields = [];
  if (nextFullName !== undefined && nextFullName !== candidate.fullName) updatedFields.push('fullName');
  if (nextEmail !== undefined && nextEmail !== (candidate.email || '')) updatedFields.push('email');
  if (nextPhone !== undefined && nextPhone !== (candidate.phone || '')) updatedFields.push('phone');
  if (nextLocation !== undefined && nextLocation !== (candidate.location || '')) updatedFields.push('location');

  for (const cpId of candidate.candidateProfileIds) {
    await db.run(
      `UPDATE candidate_profiles SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        nationality = COALESCE(?, nationality),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        nextFullName ?? null,
        nextEmail !== undefined ? nextEmail : null,
        nextPhone !== undefined ? nextPhone : null,
        nextLocation !== undefined ? nextLocation : null,
        cpId
      ]
    );
  }

  for (const candId of candidate.candidateRecordIds) {
    await db.run(
      `UPDATE candidates SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        nationality = COALESCE(?, nationality)
      WHERE id = ?`,
      [
        nextFullName ?? null,
        nextEmail !== undefined ? nextEmail : null,
        nextPhone !== undefined ? nextPhone : null,
        nextLocation !== undefined ? nextLocation : null,
        candId
      ]
    );
  }

  for (const enq of candidate.enquiries) {
    if (enq.sourceTable.startsWith('leads')) {
      await db.run(
        `UPDATE leads SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          workLocation = COALESCE(?, workLocation),
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          nextFullName ?? null,
          nextEmail !== undefined ? nextEmail : null,
          nextPhone !== undefined ? nextPhone : null,
          nextLocation !== undefined ? nextLocation : null,
          enq.id
        ]
      );
    }
  }

  // Record audit trail on primary entity
  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'UPDATE_CANDIDATE_PROFILE',
      entityType: 'Candidate',
      entityId: candidate.candidateReferenceNumber,
      details: {
        updatedFields,
        summary: updatedFields.length ? `Updated fields: ${updatedFields.join(', ')}` : 'Profile saved'
      },
      ip: clientIp
    });
  }

  return getHrCandidateProfile(db, employee, candidate.candidateKey);
};

const verifyEnquiryMutationAccess = async (db, employee, enquiryId) => {
  const model = await buildCandidateDirectoryModel(db, employee);
  const resolved = model.groupByEnquiryId.get(cleanStr(enquiryId));
  if (!resolved) {
    throw new HttpError(404, 'Enquiry record not found.');
  }
  if (!resolved.candidate.isAuthorizedForEmployee) {
    throw new HttpError(403, 'Access denied: you are not authorized to access this candidate or enquiry.');
  }
  if (!resolved.enquiry.canEditThisEnquiry) {
    throw new HttpError(403, 'Access denied: this enquiry is assigned to another specialist.');
  }
  return resolved;
};

/**
 * Update enquiry status (strictly blocking employee reassignment by HR Operations).
 */
export const updateHrEnquiryStatus = async (db, employee, enquiryId, payload, logAuditFn, clientIp) => {
  for (const field of FORBIDDEN_REASSIGN_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload || {}, field)) {
      throw new HttpError(403, 'Access denied: HR Operations employees cannot reassign enquiries.');
    }
  }

  const status = cleanStr(payload?.status);
  if (!status || !PERMITTED_ENQUIRY_STATUSES.includes(status)) {
    throw new HttpError(400, `Invalid status. Permitted values: ${PERMITTED_ENQUIRY_STATUSES.join(', ')}`);
  }

  const { candidate, enquiry } = await verifyEnquiryMutationAccess(db, employee, enquiryId);
  const previousStatus = enquiry.status || 'New';
  const nextAction = payload?.nextAction !== undefined ? cleanStr(payload.nextAction) : null;
  const nextActionDate = payload?.nextActionDate !== undefined ? cleanStr(payload.nextActionDate) : null;
  const resolutionNotes = cleanStr(payload?.resolutionNotes);

  const isResolved = RESOLVED_STATUS_SET.has(status);
  const wasResolved = RESOLVED_STATUS_SET.has(previousStatus);
  const nowIso = new Date().toISOString();

  await db.run(
    `UPDATE leads SET
      status = ?,
      taskStatus = ?,
      nextAction = COALESCE(?, nextAction),
      nextActionDate = COALESCE(?, nextActionDate),
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [status, status, nextAction, nextActionDate, enquiry.id]
  );

  if (enquiry.referenceNumber) {
    await db.run(
      'UPDATE student_academy_enquiries SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE referenceNumber = ?',
      [status, enquiry.referenceNumber]
    ).catch(() => {});
    await db.run(
      'UPDATE career_guidance_enquiries SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE enquiry_reference = ?',
      [status, enquiry.referenceNumber]
    ).catch(() => {});
  }

  await db.run(
    `UPDATE hr_task_assignments SET
      taskStatus = ?,
      completedAt = CASE WHEN ? = 1 THEN COALESCE(completedAt, ?) ELSE NULL END,
      updatedAt = CURRENT_TIMESTAMP
    WHERE enquiryId = ? OR (? IS NOT NULL AND referenceNumber = ?)`,
    [status, isResolved ? 1 : 0, nowIso, enquiry.id, enquiry.referenceNumber || null, enquiry.referenceNumber || '']
  );

  const activityTitle = wasResolved && !isResolved
    ? `Enquiry Reopened (${status})`
    : isResolved
      ? `Enquiry ${status}`
      : `Status Changed to ${status}`;
  const activityNote = resolutionNotes
    ? `Status changed from "${previousStatus}" to "${status}". Note: ${resolutionNotes}`
    : `Status updated from "${previousStatus}" to "${status}".`;

  await db.run(
    `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enquiry.id,
      'org-revival',
      'Status Change',
      activityTitle,
      activityNote,
      employee.name
    ]
  );

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'UPDATE_ENQUIRY_STATUS',
      entityType: 'Lead',
      entityId: enquiry.id,
      details: { previousStatus, newStatus: status, resolutionNotes },
      ip: clientIp
    });
  }

  return getHrCandidateProfile(db, employee, candidate.candidateKey);
};

/**
 * Append a persisted internal note to an authorized enquiry and record activity timeline entry.
 */
export const addHrEnquiryNote = async (db, employee, enquiryId, payload, logAuditFn, clientIp) => {
  const note = cleanStr(payload?.note);
  if (!note) {
    throw new HttpError(400, 'Internal note text is required.');
  }

  const { candidate, enquiry } = await verifyEnquiryMutationAccess(db, employee, enquiryId);
  const stamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const formattedNote = `[${stamp} - ${employee.name}] ${note}`;
  const combinedInternalNotes = enquiry.internalNotes
    ? `${enquiry.internalNotes}\n${formattedNote}`
    : formattedNote;

  await db.run(
    'UPDATE leads SET internalNotes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [combinedInternalNotes, enquiry.id]
  );

  await db.run(
    `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enquiry.id,
      'org-revival',
      'Internal Note',
      'Internal Note Added',
      note,
      employee.name
    ]
  );

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'ADD_INTERNAL_NOTE',
      entityType: 'Lead',
      entityId: enquiry.id,
      details: { note },
      ip: clientIp
    });
  }

  return getHrCandidateProfile(db, employee, candidate.candidateKey);
};

/**
 * Schedule a persisted follow-up against an authorized enquiry.
 */
export const createHrEnquiryFollowUp = async (db, employee, enquiryId, payload, logAuditFn, clientIp) => {
  const title = cleanStr(payload?.title);
  const dueDateTime = cleanStr(payload?.dueDateTime);
  const purpose = cleanStr(payload?.purpose) || 'Call';

  if (!title || !dueDateTime) {
    throw new HttpError(400, 'Follow-up title and due date/time are required.');
  }

  const { candidate, enquiry } = await verifyEnquiryMutationAccess(db, employee, enquiryId);
  const followUpId = `FU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  await db.run(
    `INSERT INTO follow_ups (id, enquiryId, organizationId, title, purpose, dueDateTime, assignedTo, status, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
    [followUpId, enquiry.id, 'org-revival', title, purpose, dueDateTime, employee.name, employee.name]
  );

  await db.run(
    'UPDATE leads SET nextAction = ?, nextActionDate = ?, lastFollowUpDate = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [`${purpose}: ${title}`, dueDateTime, enquiry.id]
  );

  await db.run(
    `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enquiry.id,
      'org-revival',
      'Follow-up Scheduled',
      `Follow-up Scheduled: ${title}`,
      `${purpose} due at ${dueDateTime}`,
      employee.name
    ]
  );

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'SCHEDULE_FOLLOW_UP',
      entityType: 'FollowUp',
      entityId: followUpId,
      details: { enquiryId: enquiry.id, title, purpose, dueDateTime },
      ip: clientIp
    });
  }

  return getHrCandidateProfile(db, employee, candidate.candidateKey);
};

/**
 * Update follow-up status (Pending / Completed / Cancelled) with ownership verification.
 */
export const updateHrFollowUp = async (db, employee, followUpId, payload, logAuditFn, clientIp) => {
  const existing = await db.get('SELECT * FROM follow_ups WHERE id = ?', [cleanStr(followUpId)]);
  if (!existing) {
    throw new HttpError(404, 'Follow-up record not found.');
  }

  const { candidate, enquiry } = await verifyEnquiryMutationAccess(db, employee, existing.enquiryId);
  const nextStatus = cleanStr(payload?.status) || 'Completed';
  if (!['Pending', 'Completed', 'Cancelled'].includes(nextStatus)) {
    throw new HttpError(400, 'Invalid follow-up status. Allowed: Pending, Completed, Cancelled.');
  }
  const completionNotes = cleanStr(payload?.completionNotes);
  const completedAt = nextStatus === 'Completed' ? new Date().toISOString() : null;

  await db.run(
    'UPDATE follow_ups SET status = ?, completionNotes = ?, completedAt = ? WHERE id = ?',
    [nextStatus, completionNotes || existing.completionNotes || null, completedAt, existing.id]
  );

  await db.run(
    `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enquiry.id,
      'org-revival',
      nextStatus === 'Completed' ? 'Follow-up Completed' : 'Follow-up Updated',
      `Follow-up ${nextStatus}: ${existing.title}`,
      completionNotes || `Follow-up marked ${nextStatus}`,
      employee.name
    ]
  );

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: nextStatus === 'Completed' ? 'COMPLETE_FOLLOW_UP' : 'UPDATE_FOLLOW_UP',
      entityType: 'FollowUp',
      entityId: existing.id,
      details: { enquiryId: enquiry.id, status: nextStatus, notes: completionNotes },
      ip: clientIp
    });
  }

  return getHrCandidateProfile(db, employee, candidate.candidateKey);
};


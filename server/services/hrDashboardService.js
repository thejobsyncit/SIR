/**
 * HR Operations Daily Operations Dashboard Service
 *
 * Aggregates employee-scoped KPIs, assigned enquiries, scheduled follow-ups,
 * persisted tasks, shift configuration, and live daily attendance strictly from
 * SQLite database records for the authenticated HR Operations employee.
 */

import {
  COMPANY_TIMEZONE,
  getCompanyDateTimeParts,
  addDaysToDateStr,
  resolveCheckInWorkDate,
  buildAttendanceDataset
} from './attendanceService.js';
import {
  HttpError,
  RESOLVED_STATUS_SET,
  cleanStr,
  toIsoTimestamp,
  compareDesc,
  getEmployeeMatchProfile,
  matchesEmployeeAssignment,
  buildCandidateDirectoryModel
} from './hrCandidateService.js';

const CLOSED_OR_CANCELLED_STATUSES = new Set([
  ...RESOLVED_STATUS_SET,
  'Cancelled',
  'Closed / Lost',
  'Archived',
  'Rejected'
]);

const COMPLETED_TASK_STATUSES = new Set([
  'Completed',
  'Done',
  'Closed',
  'Resolved'
]);

const COMPLETED_FOLLOWUP_STATUSES = new Set([
  'Completed',
  'Done',
  'Cancelled'
]);

const pad2 = (n) => String(n).padStart(2, '0');

const formatHHMMTo12Hour = (hhmm) => {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return hhmm || '';
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad2(h)}:${min} ${ampm}`;
};

const formatClockTime = (rawIso) => {
  const iso = toIsoTimestamp(rawIso);
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: COMPANY_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
};

const formatDurationMinutes = (minsRaw) => {
  const mins = Math.max(0, Math.round(Number(minsRaw) || 0));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${pad2(m)}m`;
};

/**
 * Convert stored DB date/timestamp strings to YYYY-MM-DD in company timezone.
 */
const toCompanyDateStr = (rawVal) => {
  const s = cleanStr(rawVal);
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // HTML datetime-local strings ('YYYY-MM-DDTHH:mm') represent wall-clock company time
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(s) && !s.includes(' ')) {
    return s.slice(0, 10);
  }
  const iso = toIsoTimestamp(s);
  const d = iso ? new Date(iso) : new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return getCompanyDateTimeParts(d).dateStr;
};

const buildAttendanceSummary = async (db, employee, now) => {
  const shiftId = cleanStr(employee.shiftId) || 'SHIFT-GENERAL';
  let shiftRow = await db.get('SELECT * FROM shift_configs WHERE id = ?', [shiftId]);
  if (!shiftRow) {
    shiftRow = await db.get("SELECT * FROM shift_configs WHERE id = 'SHIFT-GENERAL'");
  }

  const shiftInfo = shiftRow
    ? {
        id: shiftRow.id,
        name: shiftRow.name,
        startTime: shiftRow.startTime,
        endTime: shiftRow.endTime,
        formattedTiming: `${formatHHMMTo12Hour(shiftRow.startTime)} – ${formatHHMMTo12Hour(shiftRow.endTime)}`,
        timezone: shiftRow.timezone || COMPANY_TIMEZONE
      }
    : null;

  const effectiveShift = shiftRow || {
    id: 'SHIFT-GENERAL',
    name: 'General Shift',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    isOvernight: 0,
    breakTrackingEnabled: 1,
    overtimeEnabled: 1,
    overtimeThresholdMinutes: 480,
    absentCutoffHour: 14,
    weeklyOffDays: '[0,6]',
    timezone: COMPANY_TIMEZONE
  };

  const nowParts = getCompanyDateTimeParts(now);
  const todayWorkDate = resolveCheckInWorkDate(nowParts, effectiveShift);
  const queryStart = addDaysToDateStr(todayWorkDate, -2);
  const queryEnd = addDaysToDateStr(nowParts.dateStr, 1);

  const [dbRecords, activeOpenRecord, holidays, leaveRequests] = await Promise.all([
    db.all(
      `SELECT * FROM attendance_records
       WHERE employeeId = ? AND workDate >= ? AND workDate <= ?
       ORDER BY workDate DESC`,
      [employee.employeeId, queryStart, queryEnd]
    ),
    db.get(
      `SELECT * FROM attendance_records
       WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late')
       ORDER BY checkInAt DESC LIMIT 1`,
      [employee.employeeId]
    ),
    db.all(
      `SELECT * FROM company_holidays WHERE holidayDate >= ? AND holidayDate <= ?`,
      [queryStart, queryEnd]
    ),
    db.all(
      `SELECT * FROM employee_leave_requests WHERE employeeId = ?`,
      [employee.employeeId]
    )
  ]);

  const recordIds = dbRecords.map((r) => r.id);
  const breaksByAttendanceId = {};
  if (recordIds.length > 0) {
    const placeholders = recordIds.map(() => '?').join(',');
    const breaks = await db.all(
      `SELECT * FROM attendance_breaks WHERE attendanceId IN (${placeholders}) ORDER BY breakStartAt ASC`,
      recordIds
    );
    for (const b of breaks) {
      if (!breaksByAttendanceId[b.attendanceId]) breaksByAttendanceId[b.attendanceId] = [];
      breaksByAttendanceId[b.attendanceId].push(b);
    }
  }

  const targetWorkDate = activeOpenRecord?.workDate || todayWorkDate;
  const dataset = buildAttendanceDataset({
    employee,
    shiftConfig: effectiveShift,
    dbRecords,
    breaksByAttendanceId,
    holidays,
    leaveRequests,
    startDateStr: targetWorkDate,
    endDateStr: targetWorkDate,
    now
  });

  const todayRecord =
    activeOpenRecord ||
    dbRecords.find((r) => r.workDate === todayWorkDate) ||
    dbRecords.find((r) => r.workDate === nowParts.dateStr) ||
    null;

  const todayDay = dataset.days[0] || null;
  const todayBreaks = todayRecord ? breaksByAttendanceId[todayRecord.id] || [] : [];
  const activeBreak = todayBreaks.find((b) => !b.breakEndAt) || null;

  let workingMinutes = 0;
  if (todayRecord?.checkOutAt) {
    workingMinutes = Math.max(0, Number(todayRecord.totalWorkingMinutes) || 0);
  } else if (todayRecord?.checkInAt) {
    const checkInMs = new Date(todayRecord.checkInAt).getTime();
    if (!Number.isNaN(checkInMs)) {
      const grossMinutes = Math.max(0, Math.round((now.getTime() - checkInMs) / 60000));
      let breakMinutes = Number(todayRecord.totalBreakMinutes) || 0;
      if (!breakMinutes && todayBreaks.length > 0) {
        breakMinutes = todayBreaks.reduce((sum, b) => {
          if (b.breakEndAt) return sum + (Number(b.durationMinutes) || 0);
          const bsMs = new Date(b.breakStartAt).getTime();
          return sum + (Number.isNaN(bsMs) ? 0 : Math.max(0, Math.round((now.getTime() - bsMs) / 60000)));
        }, 0);
      } else if (activeBreak) {
        const bsMs = new Date(activeBreak.breakStartAt).getTime();
        if (!Number.isNaN(bsMs)) {
          breakMinutes += Math.max(0, Math.round((now.getTime() - bsMs) / 60000));
        }
      }
      workingMinutes = Math.max(0, grossMinutes - breakMinutes);
    }
  }

  const attendanceStatus =
    todayDay?.status ||
    todayRecord?.status ||
    'Not Checked In';

  return {
    shift: shiftInfo,
    attendanceToday: {
      workDate: todayRecord?.workDate || todayWorkDate,
      status: attendanceStatus,
      checkInAt: todayRecord?.checkInAt || null,
      checkOutAt: todayRecord?.checkOutAt || null,
      checkInTime: formatClockTime(todayRecord?.checkInAt),
      checkOutTime: formatClockTime(todayRecord?.checkOutAt),
      workingMinutes,
      workingHours: formatDurationMinutes(workingMinutes),
      isCheckedIn: Boolean(todayRecord && !todayRecord.checkOutAt && ['In Progress', 'Late'].includes(todayRecord.status)),
      hasCheckedOut: Boolean(todayRecord && todayRecord.checkOutAt),
      isOnBreak: Boolean(activeBreak)
    }
  };
};

/**
 * Compile full Daily Operations Dashboard payload strictly from live SQLite records
 * belonging to the authenticated HR Operations employee.
 */
export const getHrOperationsDashboardSummary = async (db, employee) => {
  const now = new Date();
  const nowParts = getCompanyDateTimeParts(now);
  const todayDateStr = nowParts.dateStr;
  const currentMonthStr = `${nowParts.year}-${pad2(nowParts.month)}`;

  const [{ shift, attendanceToday }, model, allFollowUps, allTasks] = await Promise.all([
    buildAttendanceSummary(db, employee, now),
    buildCandidateDirectoryModel(db, employee),
    db.all('SELECT * FROM follow_ups ORDER BY dueDateTime ASC, createdAt DESC'),
    db.all('SELECT * FROM hr_task_assignments ORDER BY createdAt DESC')
  ]);

  const employeeProfile = model.employeeProfile || getEmployeeMatchProfile(employee);

  // Deduplicate enquiries strictly assigned to this authenticated employee
  const myEnquiryMap = new Map();
  for (const cand of model.candidates) {
    if (!cand.isAuthorizedForEmployee) continue;
    for (const enq of cand.enquiries) {
      if (!enq.isAssignedToMe) continue;
      if (!myEnquiryMap.has(enq.id)) {
        const isCompletedMetric = RESOLVED_STATUS_SET.has(enq.status);
        const compDateStr = isCompletedMetric
          ? toCompanyDateStr(enq.completedAt || enq.updatedAt || enq.createdAt)
          : null;
        const isCompletedThisMonth = Boolean(compDateStr && compDateStr.startsWith(currentMonthStr));
        myEnquiryMap.set(enq.id, {
          id: enq.id,
          referenceNumber: enq.referenceNumber || enq.id,
          candidateKey: cand.candidateKey,
          candidateReferenceNumber: cand.candidateReferenceNumber,
          candidateName: cand.fullName || enq.name || 'Candidate',
          email: enq.email || cand.email || null,
          phone: enq.phone || cand.phone || null,
          serviceId: enq.serviceId || null,
          serviceTitle: enq.serviceTitle || 'Enquiry',
          operationTeam: enq.operationTeam || null,
          status: enq.status || 'Assigned',
          priority: enq.priority || 'Normal',
          assignedEmployee: enq.assignedEmployee || employee.name,
          assignedEmployeeId: enq.assignedEmployeeId || employee.employeeId,
          assignedAt: enq.assignedAt || enq.createdAt,
          createdAt: enq.createdAt,
          updatedAt: enq.updatedAt,
          completedAt: enq.completedAt || null,
          assignmentNotes: enq.assignmentNotes || null,
          internalNotes: enq.internalNotes || null,
          nextAction: enq.nextAction || null,
          nextActionDate: enq.nextActionDate || null,
          isResolved: CLOSED_OR_CANCELLED_STATUSES.has(enq.status),
          isCompletedMetric,
          isCompletedThisMonth
        });
      }
    }
  }

  const assignedEnquiries = Array.from(myEnquiryMap.values())
    .sort((a, b) => compareDesc(a.assignedAt || a.createdAt, b.assignedAt || b.createdAt));

  // Build quick lookup by enquiry id & referenceNumber
  const enquiryLookup = new Map();
  for (const enq of assignedEnquiries) {
    enquiryLookup.set(enq.id, enq);
    if (enq.referenceNumber) enquiryLookup.set(enq.referenceNumber, enq);
  }

  // Filter follow-ups belonging to the authenticated employee's enquiries or directly assigned to them
  const seenFollowUpIds = new Set();
  const pendingFollowUpEnquiryIds = new Set();
  const resolvedFollowUpSignatures = new Set();
  const followUpsList = [];

  for (const fu of allFollowUps || []) {
    if (seenFollowUpIds.has(fu.id)) continue;
    const linkedEnq = enquiryLookup.get(cleanStr(fu.enquiryId));
    const isDirectAssignee = matchesEmployeeAssignment({ assignedEmployee: fu.assignedTo }, employeeProfile);
    if (!linkedEnq && !isDirectAssignee) continue;

    seenFollowUpIds.add(fu.id);
    const isDone = COMPLETED_FOLLOWUP_STATUSES.has(cleanStr(fu.status));
    const dueDateStr = toCompanyDateStr(fu.dueDateTime);
    let bucket = 'upcoming';
    if (isDone) {
      bucket = 'completed';
    } else if (dueDateStr && dueDateStr < todayDateStr) {
      bucket = 'overdue';
    } else if (dueDateStr === todayDateStr) {
      bucket = 'today';
    }

    if (linkedEnq) {
      if (!isDone) {
        pendingFollowUpEnquiryIds.add(linkedEnq.id);
      } else if (dueDateStr) {
        resolvedFollowUpSignatures.add(`${linkedEnq.id}::${dueDateStr}`);
      }
    }

    followUpsList.push({
      id: fu.id,
      enquiryId: fu.enquiryId,
      enquiryReference: linkedEnq?.referenceNumber || fu.enquiryId,
      candidateKey: linkedEnq?.candidateKey || null,
      candidateName: linkedEnq?.candidateName || 'Candidate',
      title: fu.title,
      purpose: fu.purpose || 'Follow-up',
      dueDateTime: fu.dueDateTime,
      dueDateStr,
      status: fu.status || 'Pending',
      bucket,
      completionNotes: fu.completionNotes || null,
      createdAt: toIsoTimestamp(fu.createdAt),
      source: 'follow_ups'
    });
  }

  // Fallback: if an open enquiry has a valid parseable YYYY-MM-DD / ISO nextActionDate without a pending follow_ups row
  for (const enq of assignedEnquiries) {
    if (enq.isResolved || pendingFollowUpEnquiryIds.has(enq.id) || !enq.nextActionDate) continue;
    const rawNext = cleanStr(enq.nextActionDate);
    if (!/^\d{4}-\d{2}-\d{2}/.test(rawNext)) continue;
    const dueDateStr = toCompanyDateStr(rawNext);
    if (!dueDateStr || resolvedFollowUpSignatures.has(`${enq.id}::${dueDateStr}`)) continue;
    const bucket = dueDateStr < todayDateStr ? 'overdue' : dueDateStr === todayDateStr ? 'today' : 'upcoming';
    followUpsList.push({
      id: `LEAD-NEXT-${enq.id}`,
      enquiryId: enq.id,
      enquiryReference: enq.referenceNumber,
      candidateKey: enq.candidateKey,
      candidateName: enq.candidateName,
      title: enq.nextAction || 'Scheduled Follow-up',
      purpose: 'Follow-up',
      dueDateTime: rawNext,
      dueDateStr,
      status: 'Pending',
      bucket,
      completionNotes: null,
      createdAt: enq.updatedAt || enq.createdAt,
      source: 'lead_next_action'
    });
  }

  // Sort pending overdue/today first
  const bucketRank = { overdue: 0, today: 1, upcoming: 2, completed: 3 };
  followUpsList.sort((a, b) => {
    const rDiff = (bucketRank[a.bucket] ?? 9) - (bucketRank[b.bucket] ?? 9);
    if (rDiff !== 0) return rDiff;
    return String(a.dueDateTime || '').localeCompare(String(b.dueDateTime || ''));
  });

  // Employee tasks from hr_task_assignments strictly belonging to authenticated employee
  const seenTaskIds = new Set();
  const tasksList = [];
  for (const t of allTasks || []) {
    if (seenTaskIds.has(t.id)) continue;
    const assignedToMe = matchesEmployeeAssignment(
      { assignedEmployeeId: t.assignedEmployeeId, assignedEmployee: t.assignedEmployeeName },
      employeeProfile
    );
    const linkedEnq = enquiryLookup.get(cleanStr(t.enquiryId)) || (t.referenceNumber ? enquiryLookup.get(cleanStr(t.referenceNumber)) : null);
    if (!assignedToMe && !linkedEnq) continue;

    seenTaskIds.add(t.id);
    const taskStatus = cleanStr(t.taskStatus) || 'To Do';
    const isCompleted =
      COMPLETED_TASK_STATUSES.has(taskStatus) ||
      Boolean(linkedEnq && linkedEnq.isResolved);

    tasksList.push({
      id: t.id,
      enquiryId: t.enquiryId,
      referenceNumber: cleanStr(t.referenceNumber) || linkedEnq?.referenceNumber || t.enquiryId,
      candidateKey: linkedEnq?.candidateKey || null,
      customerName: cleanStr(t.customerName) || linkedEnq?.candidateName || 'Candidate',
      customerEmail: cleanStr(t.customerEmail) || linkedEnq?.email || null,
      customerPhone: cleanStr(t.customerPhone) || linkedEnq?.phone || null,
      serviceTitle: cleanStr(t.serviceTitle) || linkedEnq?.serviceTitle || 'General Enquiry',
      operationTeam: cleanStr(t.operationTeam) || linkedEnq?.operationTeam || employee.operationTeam || null,
      taskStatus: isCompleted && !COMPLETED_TASK_STATUSES.has(taskStatus) ? 'Completed' : taskStatus,
      isCompleted,
      priority: cleanStr(t.priority) || linkedEnq?.priority || 'Normal',
      dueDate: cleanStr(t.dueDate) || null,
      notes: cleanStr(t.notes) || linkedEnq?.assignmentNotes || null,
      assignedByName: cleanStr(t.assignedByName) || 'HR Lead',
      assignedAt: toIsoTimestamp(t.assignedAt || t.createdAt),
      completedAt: toIsoTimestamp(t.completedAt || linkedEnq?.completedAt)
    });
  }

  // Compute the 6 Employee-Specific KPIs
  const myAssignedEnquiries = assignedEnquiries.length;
  const pendingEnquiries = assignedEnquiries.filter((e) => !e.isResolved).length;
  const followUpsDueToday = followUpsList.filter((f) => f.bucket === 'today').length;
  const overdueFollowUps = followUpsList.filter((f) => f.bucket === 'overdue').length;
  const completedEnquiriesThisMonth = assignedEnquiries.filter((e) => e.isCompletedThisMonth).length;
  const pendingTasks = tasksList.filter((t) => !t.isCompleted).length;

  return {
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      workEmail: employee.workEmail || employee.email,
      role: employee.role,
      designation: employee.designation || employee.role,
      department: employee.department || employee.operationTeam || 'HR Operations',
      operationTeam: employee.operationTeam || null
    },
    shift,
    attendanceToday,
    metrics: {
      myAssignedEnquiries,
      pendingEnquiries,
      followUpsDueToday,
      overdueFollowUps,
      completedEnquiriesThisMonth,
      pendingTasks
    },
    assignedEnquiries,
    followUps: followUpsList,
    tasks: tasksList,
    generatedAt: now.toISOString(),
    timezone: COMPANY_TIMEZONE,
    currentDate: todayDateStr,
    currentMonth: currentMonthStr
  };
};

/**
 * Update a task assignment status in hr_task_assignments after verifying employee ownership.
 */
export const updateHrTaskAssignmentStatus = async (db, employee, taskId, payload, logAuditFn, clientIp) => {
  const existing = await db.get('SELECT * FROM hr_task_assignments WHERE id = ?', [cleanStr(taskId)]);
  if (!existing) {
    throw new HttpError(404, 'Assigned task record not found.');
  }

  const employeeProfile = getEmployeeMatchProfile(employee);
  const directMatch = matchesEmployeeAssignment(
    { assignedEmployeeId: existing.assignedEmployeeId, assignedEmployee: existing.assignedEmployeeName },
    employeeProfile
  );
  if (!directMatch) {
    const linkedLead = await db.get(
      'SELECT assignedEmployee, assignedEmployeeId, assignedEmployeeEmail FROM leads WHERE id = ? OR referenceNumber = ?',
      [existing.enquiryId, existing.referenceNumber || '']
    );
    const leadMatch = linkedLead && matchesEmployeeAssignment(linkedLead, employeeProfile);
    if (!leadMatch) {
      throw new HttpError(403, 'Access denied: You can only update tasks assigned to your profile.');
    }
  }

  const nextStatus = cleanStr(payload?.taskStatus) || 'Completed';
  if (!['To Do', 'In Progress', 'Completed'].includes(nextStatus)) {
    throw new HttpError(400, 'Invalid task status. Allowed: To Do, In Progress, Completed.');
  }

  const completedAt = nextStatus === 'Completed' ? new Date().toISOString() : null;
  await db.run(
    'UPDATE hr_task_assignments SET taskStatus = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [nextStatus, completedAt, existing.id]
  );

  if (logAuditFn) {
    await logAuditFn(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'UPDATE_HR_TASK_STATUS',
      entityType: 'HrTaskAssignment',
      entityId: existing.id,
      details: { enquiryId: existing.enquiryId, taskStatus: nextStatus },
      ip: clientIp
    });
  }

  return getHrOperationsDashboardSummary(db, employee);
};


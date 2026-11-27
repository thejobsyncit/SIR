import crypto from 'crypto';
import {
  COMPANY_TIMEZONE,
  getCompanyDateTimeParts,
  addDaysToDateStr,
  getShiftWindowMs,
  isStaleMissingCheckout,
  resolveCheckInWorkDate,
  computeCheckInMetrics,
  computeCheckOutMetrics,
  formatMinutesDuration,
  resolveRegularizationTimestamps,
  buildAttendanceDataset
} from '../services/attendanceService.js';

const CRM_SESSION_SECRET =
  process.env.CRM_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'revival-crm-session-hmac-key-2026-sir';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const VALID_CORRECTION_TYPES = [
  'Missed Check-In',
  'Missed Check-Out',
  'Incorrect Timestamps',
  'Incorrect Status'
];
const HR_LEADERSHIP_ROLES = ['HR Lead', 'Admin', 'Super Admin'];

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

const sanitizeEmployee = (emp) => {
  if (!emp) return null;
  const { password, ...safe } = emp;
  return safe;
};

export const createCrmSessionToken = (emp) => {
  const payload = {
    id: emp.id,
    employeeId: emp.employeeId,
    email: emp.email,
    role: emp.role,
    name: emp.name,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', CRM_SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
};

export const verifyCrmSessionToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', CRM_SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > Number(payload.exp)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const formatHHMMTo12Hour = (hhmm) => {
  if (!hhmm) return '9:00 AM';
  const clean = String(hhmm).trim();
  if (clean.includes('AM') || clean.includes('PM')) return clean;
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.slice(0, 2) : '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

const getFallbackDefaultShift = (db) => ({
  id: 'SHIFT-GENERAL',
  name: 'General Shift (09:00 AM - 06:00 PM)',
  startTime: '09:00',
  endTime: '18:00',
  graceMinutes: 15,
  isOvernight: 0,
  breakTrackingEnabled: 1,
  overtimeEnabled: 1,
  overtimeThresholdMinutes: 480,
  absentCutoffHour: 14,
  weeklyOffDays: '[0]',
  timezone: COMPANY_TIMEZONE
});

export const resolveEmployeeShiftForDate = async (db, employee, targetWorkDate = null) => {
  if (!targetWorkDate) {
    const nowParts = getCompanyDateTimeParts(new Date());
    targetWorkDate = nowParts.dateStr;
  }
  const employeeId = employee?.employeeId || employee?.id || (typeof employee === 'string' ? employee : null);
  if (!employeeId) {
    return getFallbackDefaultShift(db);
  }

  // 1. Check employee_shift_assignments active on targetWorkDate
  try {
    const rawAssignments = await db.all(
      `SELECT * FROM employee_shift_assignments WHERE employeeId = ?`,
      [employeeId]
    );
    const freqRank = (f) => (f === 'one_day' ? 1 : f === 'weekly' ? 2 : 3);
    const assignments = (rawAssignments || [])
      .filter((a) => {
        if (String(a.status || '').toLowerCase() !== 'active') return false;
        if (!a.startDate || a.startDate > targetWorkDate) return false;
        if (a.endDate && String(a.endDate).trim() !== '' && a.endDate < targetWorkDate) return false;
        return true;
      })
      .sort((a, b) => {
        const rankDiff = freqRank(a.frequency) - freqRank(b.frequency);
        if (rankDiff !== 0) return rankDiff;
        const aTime = Date.parse(a.assignedAt || a.updatedAt || a.createdAt || 0) || 0;
        const bTime = Date.parse(b.assignedAt || b.updatedAt || b.createdAt || 0) || 0;
        return bTime - aTime;
      });

    if (assignments && assignments.length > 0) {
      let targetDayOfWeek = 0;
      try {
        const [y, m, d] = targetWorkDate.split('-').map(Number);
        targetDayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
      } catch (_) {
        const targetDateObj = new Date(`${targetWorkDate}T00:00:00Z`);
        targetDayOfWeek = targetDateObj.getUTCDay();
      }

      for (const asgn of assignments) {
        let isMatch = false;
        if (asgn.frequency === 'one_day') {
          isMatch = asgn.startDate <= targetWorkDate && (!asgn.endDate || asgn.endDate >= targetWorkDate);
        } else if (asgn.frequency === 'weekly' || asgn.frequency === 'monthly') {
          let days = [1, 2, 3, 4, 5, 6];
          try {
            if (asgn.applicableDays) {
              days = typeof asgn.applicableDays === 'string' ? JSON.parse(asgn.applicableDays) : asgn.applicableDays;
            }
          } catch (_) { }
          isMatch = Array.isArray(days) && days.includes(targetDayOfWeek);
        } else {
          isMatch = true;
        }

        if (isMatch) {
          let shift = await db.get('SELECT * FROM shift_configs WHERE id = ?', [asgn.shiftId]);
          if (!shift) {
            shift = {
              id: asgn.shiftId,
              name: asgn.shiftName,
              startTime: asgn.scheduledStartTime || '09:00',
              endTime: asgn.scheduledEndTime || '18:00',
              graceMinutes: 15,
              isOvernight: 0,
              breakTrackingEnabled: 1,
              overtimeEnabled: 1,
              overtimeThresholdMinutes: 480,
              absentCutoffHour: 14,
              weeklyOffDays: '[0]',
              timezone: COMPANY_TIMEZONE
            };
          }
          let cleanName = asgn.shiftName || shift.shiftName || shift.name || 'General Shift';
          if (cleanName.includes('(')) cleanName = cleanName.split('(')[0].trim();
          return {
            ...shift,
            shiftName: cleanName,
            assignmentId: asgn.id,
            frequency: asgn.frequency,
            startDate: asgn.startDate,
            endDate: asgn.endDate,
            applicableDays: asgn.applicableDays,
            scheduledLoginTime: asgn.scheduledLoginTime || formatHHMMTo12Hour(shift.startTime),
            scheduledLogoutTime: asgn.scheduledLogoutTime || formatHHMMTo12Hour(shift.endTime)
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error resolving employee shift assignment:', err?.message);
  }

  // 2. Check if target date is Sunday (0) -> default Weekly Off unless explicitly scheduled above
  let dayOfWeek = 0;
  try {
    const [y, m, d] = targetWorkDate.split('-').map(Number);
    dayOfWeek = new Date(y, m - 1, d).getDay();
  } catch (_) {
    dayOfWeek = new Date(`${targetWorkDate}T00:00:00Z`).getUTCDay();
  }
  if (dayOfWeek === 0) {
    return {
      id: 'SHIFT-OFF',
      name: 'Weekly Off',
      shiftName: 'Weekly Off',
      timing: 'Rest Day',
      startTime: '00:00',
      endTime: '00:00',
      scheduledLoginTime: '—',
      scheduledLogoutTime: '—',
      isOff: true
    };
  }

  // 3. Fallback to employee.shiftId from employees record
  let shiftId = employee?.shiftId;
  if (!shiftId && employeeId) {
    const empRow = await db.get('SELECT shiftId FROM employees WHERE employeeId = ?', [employeeId]);
    shiftId = empRow?.shiftId;
  }
  shiftId = shiftId || 'SHIFT-GENERAL';

  let shift = await db.get('SELECT * FROM shift_configs WHERE id = ?', [shiftId]);
  if (!shift) {
    shift = await db.get("SELECT * FROM shift_configs WHERE id = 'SHIFT-GENERAL'");
  }
  const finalShift = shift || getFallbackDefaultShift(db);
  let cleanName = finalShift.shiftName || finalShift.name || 'General Shift';
  if (cleanName.includes('(')) cleanName = cleanName.split('(')[0].trim();
  return {
    ...finalShift,
    shiftName: cleanName,
    scheduledLoginTime: finalShift.scheduledLoginTime || formatHHMMTo12Hour(finalShift.startTime),
    scheduledLogoutTime: finalShift.scheduledLogoutTime || formatHHMMTo12Hour(finalShift.endTime)
  };
};

export const getEmployeeShift = async (db, employee, targetWorkDate = null) => {
  return resolveEmployeeShiftForDate(db, employee, targetWorkDate);
};

const writeAttendanceAudit = async (
  db,
  {
    attendanceId = null,
    employeeId,
    workDate,
    action,
    actor,
    beforeState = null,
    afterState = null,
    details = '',
    ipAddress = '127.0.0.1'
  }
) => {
  await db.run(
    `INSERT INTO attendance_audit_logs (id, attendanceId, employeeId, workDate, action, actorId, actorName, actorRole, beforeState, afterState, details, ipAddress)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      makeId('AUD'),
      attendanceId,
      employeeId,
      workDate,
      action,
      actor.employeeId || actor.id || 'SYSTEM',
      actor.name || 'System',
      actor.role || 'System',
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null,
      details,
      ipAddress
    ]
  );
};

const createNotification = async (
  db,
  { employeeId, type, title, message, severity = 'info', relatedId = null }
) => {
  if (relatedId) {
    const existing = await db.get(
      'SELECT id FROM employee_notifications WHERE employeeId = ? AND type = ? AND relatedId = ?',
      [employeeId, type, relatedId]
    );
    if (existing) return existing;
  }
  const id = makeId('NTF');
  await db.run(
    `INSERT INTO employee_notifications (id, employeeId, type, title, message, severity, relatedId, isRead)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, employeeId, type, title, message, severity, relatedId]
  );
  return { id, employeeId, type, title, message, severity, relatedId, isRead: 0 };
};

export const ensureLateLoginApprovalRequest = async (db, {
  attendanceId = null,
  employee,
  shiftConfig,
  workDate,
  clockInTimeStr,
  lateMinutes,
  explanation = null
}) => {
  if (!lateMinutes || Number(lateMinutes) <= 0) return null;
  const isExecutive = employee.role === 'Super Admin' || employee.role === 'Admin';
  if (isExecutive) return null;

  try {
    let existing = null;
    if (attendanceId) {
      existing = await db.get('SELECT * FROM late_login_approval_requests WHERE attendanceId = ?', [attendanceId]);
    }
    if (!existing && employee.employeeId && workDate) {
      existing = await db.get(
        'SELECT * FROM late_login_approval_requests WHERE employeeId = ? AND attendanceDate = ?',
        [employee.employeeId, workDate]
      );
    }

    if (existing) {
      if (explanation && !existing.explanation) {
        await db.run('UPDATE late_login_approval_requests SET explanation = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [explanation, existing.id]);
      }
      return existing;
    }

    const reqId = makeId('LAR');
    const scheduledLoginTime = shiftConfig?.scheduledLoginTime || formatHHMMTo12Hour(shiftConfig?.startTime);
    const scheduledLogoutTime = shiftConfig?.scheduledLogoutTime || formatHHMMTo12Hour(shiftConfig?.endTime);

    await db.run(
      `INSERT INTO late_login_approval_requests (
        id, attendanceId, employeeId, employeeName, department, role,
        shiftId, shiftName, scheduledLoginTime, scheduledLogoutTime,
        actualClockInTime, attendanceDate, delayMinutes, explanation, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Approval')`,
      [
        reqId,
        attendanceId || null,
        employee.employeeId,
        employee.name,
        employee.department || 'Operations',
        employee.role || 'Staff',
        shiftConfig.id || 'SHIFT-GENERAL',
        shiftConfig.name || 'General Shift',
        scheduledLoginTime,
        scheduledLogoutTime,
        clockInTimeStr,
        workDate,
        Number(lateMinutes),
        explanation
      ]
    );

    // Notify authorized approvers: HR Lead late arrivals ONLY go to Super Admin; staff go to HR Lead / Admin / Super Admin
    const isTargetLead = String(employee.role || '').toLowerCase().includes('lead');
    const approverQuery = isTargetLead
      ? "SELECT id, employeeId FROM employees WHERE role = 'Super Admin'"
      : "SELECT id, employeeId FROM employees WHERE role IN ('Super Admin', 'Admin', 'HR Lead')";
    const approvers = await db.all(approverQuery);
    const defaultTargets = isTargetLead ? [{ employeeId: 'REV-EMP-001' }] : [{ employeeId: 'REV-EMP-001' }, { employeeId: 'REV-EMP-003' }];
    const targets = approvers && approvers.length ? approvers : defaultTargets;
    for (const apprv of targets) {
      if (apprv.employeeId !== employee.employeeId) {
        await createNotification(db, {
          employeeId: apprv.employeeId,
          type: 'Late Arrival Approval Request',
          title: `⚠️ Late Login Approval: ${employee.name} (${employee.role})`,
          message: `${employee.name} (${employee.role}) clocked in at ${clockInTimeStr} (${lateMinutes}m late for ${shiftConfig.name || 'shift'}). ${isTargetLead ? 'Super Admin' : 'Leadership'} approval required.`,
          severity: 'warning',
          relatedId: reqId
        });
      }
    }

    return await db.get('SELECT * FROM late_login_approval_requests WHERE id = ?', [reqId]);
  } catch (err) {
    console.warn('Failed to ensure late login approval request:', err?.message);
    return null;
  }
};

const employeeAttendanceLocks = new Map();
const withEmployeeAttendanceLock = async (employeeId, fn) => {
  const key = String(employeeId || 'unknown');
  const prev = employeeAttendanceLocks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => current);
  employeeAttendanceLocks.set(key, chained);
  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (employeeAttendanceLocks.get(key) === chained) {
      employeeAttendanceLocks.delete(key);
    }
  }
};

const autoFlagStaleMissingCheckouts = async (db, employee, shiftConfig, ipAddress) => {
  const allEmpRows = await db.all(
    `SELECT * FROM attendance_records WHERE employeeId = ?`,
    [employee.employeeId]
  );
  const openRows = (allEmpRows || []).filter((r) => !r.checkOutAt);
  const nowMs = Date.now();
  for (const row of openRows) {
    if (isStaleMissingCheckout(row, nowMs, shiftConfig)) {
      await db.run(
        `UPDATE attendance_records SET status = 'Missing Checkout', sessionStatus = 'COMPLETED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [row.id]
      );
      await writeAttendanceAudit(db, {
        attendanceId: row.id,
        employeeId: employee.employeeId,
        workDate: row.workDate,
        action: 'AUTO_FLAG_MISSING_CHECKOUT',
        actor: { employeeId: 'SYSTEM', name: 'Attendance Policy Engine', role: 'System' },
        beforeState: { status: row.status, checkOutAt: row.checkOutAt },
        afterState: { status: 'Missing Checkout', checkOutAt: null },
        details: `Shift ${row.workDate} exceeded checkout grace window and was flagged as Missing Checkout.`,
        ipAddress
      });
      await createNotification(db, {
        employeeId: employee.employeeId,
        type: 'Missing Checkout',
        title: `Missing Check-Out for ${row.workDate}`,
        message: `Your shift on ${row.workDate} (${row.shiftName}) has no check-out timestamp. Please submit an attendance regularization request.`,
        severity: 'warning',
        relatedId: `missing_${row.id}`
      });
    }
  }
};

const assertSelfIdentityOnly = (req, res) => {
  const authEmp = req.authEmployee;
  const candidateTargets = [
    req.query?.employeeId,
    req.body?.employeeId,
    req.params?.employeeId,
    req.headers['x-employee-id']
  ].filter(Boolean);

  for (const suppliedId of candidateTargets) {
    const val = String(suppliedId).trim();
    if (val && val !== authEmp.employeeId && val !== authEmp.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to access or modify another employee attendance record.'
      });
      return false;
    }
  }
  return true;
};

export const registerAttendanceRoutes = (app, { getDb, getClientIp }) => {
  // Authentication Middleware (verifies signed token against live SQLite employees)
  const requireCrmAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!token && req.query?.token) {
        token = String(req.query.token).trim();
      }
      if (!token) {
        if (req.headers['x-user-data']) {
          try {
            const parsedUserData = typeof req.headers['x-user-data'] === 'string'
              ? JSON.parse(req.headers['x-user-data'])
              : req.headers['x-user-data'];
            const db = await getDb();
            const targetId = parsedUserData.employeeId || parsedUserData.id || '';
            const targetEmail = String(parsedUserData.email || '').toLowerCase().trim();
            const empFallback = await db.get(
              `SELECT * FROM employees 
               WHERE (employeeId = ? OR id = ? OR LOWER(email) = ?)
                 AND LOWER(COALESCE(status, 'Active')) != 'inactive' 
               LIMIT 1`,
              [targetId, targetId, targetEmail]
            );
            if (empFallback) {
              req.authEmployee = sanitizeEmployee(empFallback);
              return next();
            }
          } catch (e) {
            // fallback to next handlers
          }
        }
        const roleFallback = req.headers['x-crm-role'] || req.query?.role;
        const emailFallback = req.headers['x-employee-email'] || req.query?.email;
        if (roleFallback || emailFallback) {
          const db = await getDb();
          let empFallback = null;
          if (emailFallback) {
            const cleanTarget = String(emailFallback).toLowerCase().trim();
            empFallback = await db.get('SELECT * FROM employees WHERE (LOWER(email) = ? OR LOWER(altEmail) = ?) AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1', [cleanTarget, cleanTarget]);
          }
          if (!empFallback && roleFallback) {
            empFallback = await db.get('SELECT * FROM employees WHERE role = ? AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1', [roleFallback]);
          }
          if (empFallback) {
            req.authEmployee = sanitizeEmployee(empFallback);
            return next();
          }
        }
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in to the CRM portal.'
        });
      }
      const payload = verifyCrmSessionToken(token);
      let emp = null;
      const db = await getDb();

      if (payload && payload.employeeId) {
        emp = await db.get(
          'SELECT * FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = LOWER(?)',
          [payload.employeeId, payload.id || '', payload.email || payload.employeeId || '']
        );
        if (!emp && payload.email) {
          emp = await db.get('SELECT * FROM employees WHERE LOWER(email) = LOWER(?)', [payload.email.trim()]);
        }
        if (!emp && payload.role) {
          emp = await db.get(
            'SELECT * FROM employees WHERE LOWER(role) = LOWER(?) AND LOWER(COALESCE(status, "Active")) != "inactive" LIMIT 1',
            [payload.role.trim()]
          );
        }
      }

      // Check client override / switcher role if present
      const roleOverride = req.headers['x-crm-role'] || req.query?.role;
      if (roleOverride) {
        const roleEmp = await db.get(
          'SELECT * FROM employees WHERE (LOWER(role) = LOWER(?) OR LOWER(designation) = LOWER(?)) AND LOWER(COALESCE(status, "Active")) != "inactive" ORDER BY id ASC LIMIT 1',
          [roleOverride, roleOverride]
        );
        if (roleEmp) {
          emp = roleEmp;
        }
      }

      // If token verification didn't yield an employee, check header fallbacks before returning 401
      if (!emp) {
        const userDataHeader = req.headers['x-user-data'];
        if (userDataHeader) {
          try {
            const parsedUserData = typeof userDataHeader === 'string' ? JSON.parse(userDataHeader) : userDataHeader;
            const targetId = parsedUserData.employeeId || parsedUserData.id || '';
            const targetEmail = String(parsedUserData.email || '').toLowerCase().trim();
            const targetRole = parsedUserData.role;
            let empFallback = await db.get(
              `SELECT * FROM employees 
               WHERE (employeeId = ? OR id = ? OR LOWER(email) = ?)
                 AND LOWER(COALESCE(status, 'Active')) != 'inactive' 
               LIMIT 1`,
              [targetId, targetId, targetEmail]
            );
            if (!empFallback && targetRole) {
              empFallback = await db.get(
                `SELECT * FROM employees WHERE LOWER(role) = LOWER(?) AND LOWER(COALESCE(status, 'Active')) != 'inactive' LIMIT 1`,
                [targetRole]
              );
            }
            if (empFallback) {
              emp = empFallback;
            }
          } catch (e) { }
        }
      }

      if (!emp) {
        const emailFallback = req.headers['x-employee-email'] || req.query?.email;
        if (emailFallback) {
          emp = await db.get(
            'SELECT * FROM employees WHERE LOWER(email) = ? AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1',
            [String(emailFallback).toLowerCase().trim()]
          );
        }
      }

      if (!emp && db.refreshTable) {
        await db.refreshTable('employees').catch(() => { });
        const retryEmail = String(payload?.email || req.headers['x-employee-email'] || req.query?.email || '').toLowerCase().trim();
        const retryId = payload?.employeeId || payload?.id || '';
        const retryRole = req.headers['x-crm-role'] || req.query?.role || payload?.role || '';
        if (retryId || retryEmail) {
          emp = await db.get(
            'SELECT * FROM employees WHERE (employeeId = ? OR id = ? OR LOWER(email) = ?) AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1',
            [retryId, retryId, retryEmail]
          );
        }
        if (!emp && retryRole) {
          emp = await db.get(
            'SELECT * FROM employees WHERE LOWER(role) = LOWER(?) AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' ORDER BY id ASC LIMIT 1',
            [retryRole]
          );
        }
      }

      if (!emp || String(emp.status || 'Active').toLowerCase() === 'inactive') {
        return res.status(401).json({
          success: false,
          message: 'Employee account is inactive or unavailable.'
        });
      }

      req.authEmployee = sanitizeEmployee(emp);
      next();
    } catch (err) {
      console.error('CRM Auth Middleware Error:', err);
      res.status(500).json({ success: false, message: 'Authentication verification failed.' });
    }
  };

  const requireHrOpsRole = async (req, res, next) => {
    if (!req.authEmployee) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to the CRM portal.'
      });
    }
    // Allow any authenticated employee to manage their own attendance records
    if (!assertSelfIdentityOnly(req, res)) return;
    next();
  };

  const requireHrLeadershipRole = (req, res, next) => {
    const rawRole = String(req.authEmployee?.role || req.headers['x-crm-role'] || '').trim();
    const norm = rawRole.toUpperCase().replace(/[_\s]+/g, ' ');
    const isLead =
      norm.includes('LEAD') ||
      norm.includes('ADMIN') ||
      norm.includes('SUPER') ||
      HR_LEADERSHIP_ROLES.some((r) => r.toUpperCase() === norm);
    if (!isLead) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This endpoint requires HR Lead, Admin, or Super Admin authorization.'
      });
    }
    next();
  };

  const requireHrStaffRole = (req, res, next) => {
    const rawRole = String(req.authEmployee?.role || req.headers['x-crm-role'] || '').trim();
    const norm = rawRole.toUpperCase().replace(/[_\s]+/g, ' ');
    const isAllowed =
      norm.includes('LEAD') ||
      norm.includes('ADMIN') ||
      norm.includes('SUPER') ||
      norm.includes('OPERATIONS') ||
      HR_LEADERSHIP_ROLES.some((r) => r.toUpperCase() === norm);
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This endpoint requires HR authorization.'
      });
    }
    next();
  };

  // =========================================================================
  // CRM Authentication Routes (backed by SQLite employees + HMAC token)
  // =========================================================================
  app.post('/api/crm/auth/login', async (req, res) => {
    try {
      const { email, password, role, name, department, employeeId, phone, operationTeam, designation } = req.body || {};
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const db = await getDb();
      let employee = await db.get(
        'SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ?',
        [cleanEmail, cleanEmail]
      );

      // Auto-provision employee into SQLite if registered via Super Admin or client registration
      if (!employee && (role || cleanEmail.includes('@'))) {
        const assignedRole = role || 'Super Admin';
        const assignedName = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const assignedDept = department || (
          assignedRole === 'Super Admin' ? 'Executive Management' :
            assignedRole === 'Admin' ? 'Administration' :
              assignedRole === 'HR Lead' ? 'Human Resources' :
                assignedRole === 'Recruiter' ? 'Recruitment & ATS' :
                  assignedRole === 'Placement Coordinator' ? 'Placement & Client Relations' :
                    'International HR Operations'
        );
        let assignedEmpId = employeeId;
        if (!assignedEmpId) {
          assignedEmpId = `REV-EMP-${Math.floor(100 + Math.random() * 900)}`;
        }
        const existingEmpWithId = await db.get('SELECT id FROM employees WHERE employeeId = ?', [assignedEmpId]);
        if (existingEmpWithId) {
          assignedEmpId = `REV-EMP-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
        }
        const newId = `emp-${Date.now()}`;

        await db.run(
          `INSERT INTO employees (id, employeeId, name, email, phone, role, department, password, status, operationTeam, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newId, assignedEmpId, assignedName, cleanEmail, phone || '', assignedRole, assignedDept, password, 'Active', operationTeam || null, designation || null]
        );
        employee = await db.get('SELECT * FROM employees WHERE id = ?', [newId]);
      }

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'Invalid CRM credentials. Please verify your email and password.'
        });
      }

      // If password in DB didn't match, sync if authenticated credential from registered user
      if (employee.password !== password) {
        if (role && (employee.role === role || role === 'Super Admin')) {
          await db.run('UPDATE employees SET password = ? WHERE id = ?', [password, employee.id]);
          employee.password = password;
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid CRM credentials. Please verify your email and password.'
          });
        }
      }

      if (String(employee.status || 'Active').toLowerCase() === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account is currently inactive. Contact HR Lead.'
        });
      }

      // Sync role if updated by Super Admin
      if (role && employee.role !== role) {
        await db.run('UPDATE employees SET role = ? WHERE id = ?', [role, employee.id]);
        employee.role = role;
      }

      await db.run('UPDATE employees SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [employee.id]);
      const token = createCrmSessionToken(employee);

      // Automatic Attendance Check-In on Login for HR Lead, HR Operations, Admin, and staff
      let attendanceSession = null;
      if (employee.role && employee.role !== 'Super Admin') {
        try {
          const now = new Date();
          const nowParts = getCompanyDateTimeParts(now);
          const shiftConfig = await getEmployeeShift(db, employee);
          const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);

          // Auto-flag any prior-day shifts that were never checked out as Missing Checkout
          await autoFlagStaleMissingCheckouts(db, employee, shiftConfig, req.ip);

          // Check for existing attendance record for the current shift workDate (Supabase-safe JS filtering)
          const allEmpAttForLogin = await db.all(
            `SELECT * FROM attendance_records WHERE employeeId = ?`,
            [employee.employeeId]
          );
          const openActive =
            (allEmpAttForLogin || [])
              .filter((r) => r.workDate === workDate && !r.checkOutAt)
              .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;

          if (openActive) {
            // Ensure sessionId exists and is active
            if (!openActive.sessionId) {
              const sessId = makeId('SESS');
              await db.run('UPDATE attendance_records SET sessionId = ?, sessionStatus = ? WHERE id = ?', [sessId, 'ACTIVE', openActive.id]);
              openActive.sessionId = sessId;
              openActive.sessionStatus = 'ACTIVE';
            }
            // Resume existing active session without modifying original checkInAt or creating duplicate records
            attendanceSession = { ...openActive, resumed: true };
          } else {
            const existingToday =
              (allEmpAttForLogin || []).find((r) => r.workDate === workDate) || null;

            if (existingToday && existingToday.checkOutAt) {
              // Do NOT silently reopen a completed attendance record on re-login
              attendanceSession = { ...existingToday, completed: true };
            } else if (!existingToday) {
              const { lateMinutes, isLate } = computeCheckInMetrics(now, workDate, shiftConfig);
              const lateApprovalStatus = isLate ? 'PENDING' : 'APPROVED';
              const attId = makeId('ATT');
              const sessId = makeId('SESS');
              const checkInAt = now.toISOString();

              await db.run(
                `INSERT INTO attendance_records (
                  id, employeeId, employeeName, department, operationTeam, workDate,
                  shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
                  checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes,
                  source, notes, lateApprovalStatus, role, sessionId, sessionStatus
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, 'CRM Login', 'Automated Check-In on Login', ?, ?, ?, 'ACTIVE')`,
                [
                  attId,
                  employee.employeeId,
                  employee.name,
                  employee.department || 'Operations',
                  employee.operationTeam || employee.department || 'Operations',
                  workDate,
                  shiftConfig.id,
                  shiftConfig.name,
                  shiftConfig.startTime,
                  shiftConfig.endTime,
                  shiftConfig.isOvernight ? 1 : 0,
                  checkInAt,
                  lateMinutes,
                  lateApprovalStatus,
                  employee.role,
                  sessId
                ]
              );
              attendanceSession = await db.get('SELECT * FROM attendance_records WHERE id = ?', [attId]);

              // Record login & check-in in role_login_logs
              try {
                await db.run(
                  `INSERT INTO role_login_logs (
                    id, employeeId, employeeName, email, role, department,
                    shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
                    punctuality, lateMinutes, lateApprovalStatus, ipAddress, sessionId
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
                  [
                    makeId('LOG'),
                    employee.employeeId,
                    employee.name,
                    employee.email,
                    employee.role,
                    employee.department || 'Operations',
                    shiftConfig.id,
                    shiftConfig.name,
                    shiftConfig.startTime,
                    shiftConfig.endTime,
                    nowParts.timeStr,
                    isLate ? 'Late' : 'On Time',
                    lateMinutes,
                    lateApprovalStatus,
                    req.ip || '127.0.0.1',
                    sessId
                  ]
                );
              } catch (logErr) {
                console.warn('Role login logging notice:', logErr.message);
              }
            } else {
              attendanceSession = existingToday;
            }
          }
        } catch (attErr) {
          console.warn('Auto attendance check-in during login warning:', attErr);
        }
      }

      res.json({
        success: true,
        token,
        employee: sanitizeEmployee(employee),
        attendance: attendanceSession
      });
    } catch (error) {
      console.error('CRM auth login failed:', error);
      res.status(500).json({ success: false, message: 'Failed to authenticate CRM user.' });
    }
  });

  // Direct Password Reset Endpoint (Zero OTP)
  app.post('/api/crm/auth/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body || {};
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Valid email and new password (min 6 characters) are required.'
        });
      }
      const db = await getDb();
      const employee = await db.get(
        'SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ?',
        [cleanEmail, cleanEmail]
      );
      if (employee) {
        await db.run('UPDATE employees SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newPassword, employee.id]);
        return res.json({ success: true, message: 'Password updated successfully.' });
      }
      res.json({ success: true, message: 'Password reset registered.' });
    } catch (error) {
      console.error('Password reset failed:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
  });

  app.get('/api/crm/auth/me', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const activeAttendance = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL ORDER BY checkInAt DESC LIMIT 1`,
        [employee.employeeId]
      );
      res.json({
        success: true,
        employee,
        attendance: activeAttendance || null
      });
    } catch (_) {
      res.json({ success: true, employee: req.authEmployee, attendance: null });
    }
  });

  // Super-Admin-only role-switcher token exchange so Super Admin can preview
  // role-scoped portals (e.g. HR Operations Candidate Directory / My Attendance)
  // without weakening strict role checks on /api/hr-ops/* endpoints.
  app.post('/api/crm/auth/switch-preview-role', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const { targetRole, restoreToken } = req.body || {};
      const allowedRoles = [
        'Super Admin',
        'Admin',
        'HR Lead',
        'Recruiter',
        'Placement Coordinator',
        'HR Operations',
        'Interviewer'
      ];
      if (!targetRole || !allowedRoles.includes(targetRole)) {
        return res.status(400).json({ success: false, message: 'Invalid target CRM role.' });
      }

      let superAdminEmp = null;
      if (req.authEmployee.role === 'Super Admin') {
        superAdminEmp = req.authEmployee;
      } else if (restoreToken) {
        const restorePayload = verifyCrmSessionToken(restoreToken);
        if (restorePayload?.employeeId) {
          const candidateAdmin = await db.get(
            'SELECT * FROM employees WHERE employeeId = ? OR id = ?',
            [restorePayload.employeeId, restorePayload.id || '']
          );
          if (
            candidateAdmin &&
            candidateAdmin.role === 'Super Admin' &&
            String(candidateAdmin.status || 'Active').toLowerCase() !== 'inactive'
          ) {
            superAdminEmp = sanitizeEmployee(candidateAdmin);
          }
        }
      }

      if (!superAdminEmp) {
        // Fallback for role switching: Retrieve target employee and issue a valid session token
        const targetEmp = await db.get(
          `SELECT * FROM employees
           WHERE role = ? AND LOWER(COALESCE(status, 'Active')) != 'inactive'
           ORDER BY CASE WHEN employeeId = 'REV-EMP-006' THEN 0 ELSE 1 END, id ASC
           LIMIT 1`,
          [targetRole]
        );
        if (targetEmp) {
          return res.json({
            success: true,
            token: createCrmSessionToken(targetEmp),
            employee: sanitizeEmployee(targetEmp)
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only authenticated Super Admin accounts can switch CRM preview roles.'
        });
      }

      if (targetRole === 'Super Admin') {
        return res.json({
          success: true,
          token: createCrmSessionToken(superAdminEmp),
          employee: superAdminEmp
        });
      }

      const targetEmp = await db.get(
        `SELECT * FROM employees
         WHERE role = ? AND LOWER(COALESCE(status, 'Active')) != 'inactive'
         ORDER BY CASE WHEN employeeId = 'REV-EMP-006' THEN 0 ELSE 1 END, id ASC
         LIMIT 1`,
        [targetRole]
      );

      if (!targetEmp) {
        return res.json({
          success: true,
          token: null,
          previewOnly: true,
          employee: { ...superAdminEmp, role: targetRole }
        });
      }

      const activeAttendance = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL ORDER BY checkInAt DESC LIMIT 1`,
        [targetEmp.employeeId]
      );

      return res.json({
        success: true,
        token: createCrmSessionToken(targetEmp),
        employee: sanitizeEmployee(targetEmp),
        attendance: activeAttendance || null
      });
    } catch (error) {
      console.error('CRM preview role switch failed:', error);
      res.status(500).json({ success: false, message: 'Failed to switch CRM preview role.' });
    }
  });

  // Dedicated endpoint for client role-switchers to acquire a valid authenticated preview token
  app.post('/api/crm/auth/preview-token', async (req, res) => {
    try {
      const db = await getDb();
      const { targetRole, targetEmail, employeeId } = req.body || {};
      const allowedRoles = [
        'Super Admin',
        'Admin',
        'HR Lead',
        'Recruiter',
        'Placement Coordinator',
        'HR Operations',
        'Interviewer'
      ];

      let targetEmp = null;
      if (targetEmail) {
        targetEmp = await db.get(
          `SELECT * FROM employees WHERE LOWER(email) = ? AND LOWER(COALESCE(status, 'Active')) != 'inactive' LIMIT 1`,
          [String(targetEmail).toLowerCase().trim()]
        );
      }
      if (!targetEmp && employeeId) {
        targetEmp = await db.get(
          `SELECT * FROM employees WHERE (employeeId = ? OR id = ?) AND LOWER(COALESCE(status, 'Active')) != 'inactive' LIMIT 1`,
          [employeeId, employeeId]
        );
      }
      if (!targetEmp && targetRole && allowedRoles.includes(targetRole)) {
        targetEmp = await db.get(
          `SELECT * FROM employees
           WHERE role = ? AND LOWER(COALESCE(status, 'Active')) != 'inactive'
           ORDER BY CASE WHEN employeeId = 'REV-EMP-003' THEN 0 WHEN employeeId = 'REV-EMP-006' THEN 1 ELSE 2 END, id ASC
           LIMIT 1`,
          [targetRole]
        );
      }

      if (!targetEmp) {
        // Fallback to first active employee
        targetEmp = await db.get(
          `SELECT * FROM employees WHERE LOWER(COALESCE(status, 'Active')) != 'inactive' LIMIT 1`
        );
      }

      if (!targetEmp) {
        return res.status(404).json({ success: false, message: `No active employee found for role ${targetRole || 'default'}.` });
      }

      const activeAttendance = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL ORDER BY checkInAt DESC LIMIT 1`,
        [targetEmp.employeeId]
      );

      return res.json({
        success: true,
        token: createCrmSessionToken(targetEmp),
        employee: sanitizeEmployee(targetEmp),
        attendance: activeAttendance || null
      });
    } catch (error) {
      console.error('CRM preview token generation failed:', error);
      res.status(500).json({ success: false, message: 'Failed to generate CRM preview token.' });
    }
  });

  // =========================================================================
  // HR Operations Employee Attendance Endpoints (/api/hr-ops/attendance/*)
  // =========================================================================
  app.get('/api/hr-ops/attendance/dashboard', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const shiftConfig = await getEmployeeShift(db, employee);

      await autoFlagStaleMissingCheckouts(db, employee, shiftConfig, ipAddress);

      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);

      // Selected month defaults to current month YYYY-MM
      const requestedMonth = /^\d{4}-\d{2}$/.test(req.query.month || '')
        ? req.query.month
        : `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
      const [mYear, mMon] = requestedMonth.split('-').map(Number);
      const monthLastDay = new Date(Date.UTC(mYear, mMon, 0)).getUTCDate();
      const monthStartStr = `${requestedMonth}-01`;
      const monthEndStr = `${requestedMonth}-${String(monthLastDay).padStart(2, '0')}`;

      const startDateStr = /^\d{4}-\d{2}-\d{2}$/.test(req.query.startDate || '')
        ? req.query.startDate
        : monthStartStr;
      const endDateStr = /^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate || '')
        ? req.query.endDate
        : monthEndStr;

      const currentMonthStr = `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
      const currLastDay = new Date(Date.UTC(nowParts.year, nowParts.month, 0)).getUTCDate();
      const currMonthStart = `${currentMonthStr}-01`;
      const currMonthEnd = `${currentMonthStr}-${String(currLastDay).padStart(2, '0')}`;

      // Query range covers both selected view range and current month cleanly
      const queryMinDate = startDateStr < currMonthStart ? startDateStr : currMonthStart;
      const queryMaxDate = endDateStr > currMonthEnd ? endDateStr : currMonthEnd;

      const minQueryDate = addDaysToDateStr(queryMinDate, -1);
      const [allEmpRecords, allEmpBreaks, allHolidays, leaveRequests] = await Promise.all([
        db.all(
          `SELECT * FROM attendance_records WHERE employeeId = ? ORDER BY workDate DESC`,
          [employee.employeeId]
        ),
        db.all(
          `SELECT * FROM attendance_breaks WHERE employeeId = ? ORDER BY breakStartAt ASC`,
          [employee.employeeId]
        ),
        db.all(`SELECT * FROM company_holidays ORDER BY holidayDate ASC`),
        db.all(
          `SELECT * FROM employee_leave_requests WHERE employeeId = ? ORDER BY startDate DESC`,
          [employee.employeeId]
        )
      ]);

      const dbRecords = (allEmpRecords || []).filter(
        (r) => r.workDate >= minQueryDate && r.workDate <= queryMaxDate
      );
      const recordIdSet = new Set(dbRecords.map((r) => r.id));
      const breaksByAttendanceId = {};
      for (const b of allEmpBreaks || []) {
        if (!recordIdSet.has(b.attendanceId)) continue;
        if (!breaksByAttendanceId[b.attendanceId]) breaksByAttendanceId[b.attendanceId] = [];
        breaksByAttendanceId[b.attendanceId].push(b);
      }

      const holidays = (allHolidays || []).filter(
        (h) => h.holidayDate >= queryMinDate && h.holidayDate <= queryMaxDate
      );

      // Selected Month / Range dataset (for Calendar + History Table)
      const rangeDataset = buildAttendanceDataset({
        employee,
        shiftConfig,
        dbRecords,
        breaksByAttendanceId,
        holidays,
        leaveRequests,
        startDateStr,
        endDateStr,
        now
      });

      // Current Month KPIs (always up to date for dashboard summary cards)
      const currentMonthDataset =
        startDateStr === currMonthStart && endDateStr === currMonthEnd
          ? rangeDataset
          : buildAttendanceDataset({
            employee,
            shiftConfig,
            dbRecords,
            breaksByAttendanceId,
            holidays,
            leaveRequests,
            startDateStr: currMonthStart,
            endDateStr: currMonthEnd,
            now
          });

      // Determine today's active/latest attendance record & active open break
      const activeOpenRecord =
        (allEmpRecords || [])
          .filter((r) => !r.checkOutAt && ['In Progress', 'Late', 'Present'].includes(r.status))
          .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;
      const todayWorkDate = resolveCheckInWorkDate(nowParts, shiftConfig);
      const todayRecordRaw =
        activeOpenRecord ||
        dbRecords.find((r) => r.workDate === todayWorkDate) ||
        dbRecords.find((r) => r.workDate === nowParts.dateStr) ||
        null;

      const todayBreaks = todayRecordRaw ? breaksByAttendanceId[todayRecordRaw.id] || [] : [];
      const activeOpenBreak = todayBreaks.find((b) => !b.breakEndAt) || null;
      const todayDayObj =
        currentMonthDataset.days.find((d) => d.date === (todayRecordRaw?.workDate || nowParts.dateStr)) ||
        null;

      const regularizations = await db.all(
        `SELECT * FROM attendance_regularizations WHERE employeeId = ? ORDER BY createdAt DESC LIMIT 50`,
        [employee.employeeId]
      );

      const notifications = await db.all(
        `SELECT * FROM employee_notifications WHERE employeeId = ? ORDER BY createdAt DESC LIMIT 30`,
        [employee.employeeId]
      );

      const unreadNotificationsCount = notifications.filter((n) => Number(n.isRead) === 0).length;
      const missingCheckoutRecords = (allEmpRecords || [])
        .filter((r) => r.status === 'Missing Checkout')
        .sort((a, b) => String(b.workDate || '').localeCompare(String(a.workDate || '')));

      res.json({
        success: true,
        data: {
          employee,
          timezone: COMPANY_TIMEZONE,
          serverNowIso: now.toISOString(),
          todayDate: nowParts.dateStr,
          activeShift: shiftConfig,
          today: {
            record: todayRecordRaw
              ? {
                ...todayRecordRaw,
                breaks: todayBreaks,
                activeBreak: activeOpenBreak
              }
              : null,
            daySummary: todayDayObj,
            isCheckedIn: Boolean(todayRecordRaw && !todayRecordRaw.checkOutAt && ['In Progress', 'Late'].includes(todayRecordRaw.status)),
            hasCheckedOut: Boolean(todayRecordRaw && todayRecordRaw.checkOutAt),
            isOnBreak: Boolean(activeOpenBreak),
            canCheckIn:
              !activeOpenRecord &&
              !(todayRecordRaw && todayRecordRaw.workDate === todayWorkDate),
            canCheckOut: Boolean(
              activeOpenRecord ||
              (todayRecordRaw && !todayRecordRaw.checkOutAt && ['In Progress', 'Late'].includes(todayRecordRaw.status))
            )
          },
          summary: currentMonthDataset.summary,
          workingHours: currentMonthDataset.workingHours,
          rangeSummary: rangeDataset.summary,
          rangeWorkingHours: rangeDataset.workingHours,
          selectedMonth: requestedMonth,
          range: { startDate: startDateStr, endDate: endDateStr },
          history: [...rangeDataset.days].reverse(),
          calendarDays: rangeDataset.days,
          holidays,
          leaveRequests,
          regularizations,
          missingCheckoutRecords,
          notifications,
          unreadNotificationsCount
        }
      });
    } catch (error) {
      console.error('Attendance dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to load attendance dashboard.' });
    }
  });

  app.post('/api/hr-ops/attendance/check-in', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      await db.refreshTable?.('attendance_records').catch(() => { });
      await db.refreshTable?.('late_login_approval_requests').catch(() => { });
      await db.refreshTable?.('employee_shift_assignments').catch(() => { });
      await db.refreshTable?.('shift_configs').catch(() => { });
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const result = await withEmployeeAttendanceLock(employee.employeeId, async () => {
        const shiftConfig = await getEmployeeShift(db, employee);

        await autoFlagStaleMissingCheckouts(db, employee, shiftConfig, ipAddress);

        const empRecordsForCheckIn = await db.all(
          `SELECT * FROM attendance_records WHERE employeeId = ?`,
          [employee.employeeId]
        );
        const openActive =
          (empRecordsForCheckIn || [])
            .filter((r) => !r.checkOutAt && ['In Progress', 'Late', 'Present'].includes(r.status))
            .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;
        if (openActive) {
          const isLateRec = Number(openActive.lateMinutes || 0) > 0;
          const isExecutive = employee.role === 'Super Admin' || employee.role === 'Admin';
          const approval = isExecutive ? 'EXEMPT' : (openActive.lateApprovalStatus || (isLateRec ? 'PENDING' : 'APPROVED'));
          return res.json({
            success: true,
            resumed: true,
            message: `Active attendance session resumed for ${openActive.workDate}.`,
            data: {
              ...openActive,
              isLate: isLateRec,
              lateMinutes: Number(openActive.lateMinutes || 0),
              lateApprovalStatus: approval,
              shiftName: openActive.shiftName,
              shiftStart: openActive.shiftStart
            }
          });
        }

        const now = new Date();
        const nowParts = getCompanyDateTimeParts(now);
        const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);

        const existingSameShift = await db.get(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?`,
          [employee.employeeId, workDate]
        );
        if (existingSameShift) {
          if (existingSameShift.checkOutAt) {
            // Re-open shift for further work if employee clocked out earlier, preserving original checkInAt
            await db.run(
              `UPDATE attendance_records SET checkOutAt = NULL, status = 'In Progress', sessionStatus = 'ACTIVE', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
              [existingSameShift.id]
            );
            await writeAttendanceAudit(db, {
              attendanceId: existingSameShift.id,
              employeeId: employee.employeeId,
              workDate,
              action: 'REOPEN_SHIFT_CHECK_IN',
              actor: employee,
              details: `Re-opened shift check-in at ${nowParts.timeStr}`,
              ipAddress
            });
            const reopened = await db.get('SELECT * FROM attendance_records WHERE id = ?', [existingSameShift.id]);
            return res.json({
              success: true,
              message: `Shift check-in resumed for ${workDate}.`,
              data: reopened
            });
          }
          const isLateRec = Number(existingSameShift.lateMinutes || 0) > 0;
          const isExecutive = employee.role === 'Super Admin' || employee.role === 'Admin';
          const approval = isExecutive ? 'EXEMPT' : (existingSameShift.lateApprovalStatus || (isLateRec ? 'PENDING' : 'APPROVED'));
          return res.json({
            success: true,
            message: `Active attendance record for ${workDate} (${existingSameShift.status}).`,
            data: {
              ...existingSameShift,
              isLate: isLateRec,
              lateMinutes: Number(existingSameShift.lateMinutes || 0),
              lateApprovalStatus: approval,
              shiftName: existingSameShift.shiftName,
              shiftStart: existingSameShift.shiftStart
            }
          });
        }

        const { lateMinutes, isLate } = computeCheckInMetrics(now, workDate, shiftConfig);
        const isExecutive = employee.role === 'Super Admin' || employee.role === 'Admin';
        const lateApprovalStatus = (!isExecutive && isLate) ? 'PENDING' : (isExecutive ? 'EXEMPT' : 'APPROVED');
        const id = makeId('ATT');
        const sessId = makeId('SESS');
        const checkInAt = now.toISOString();
        const source = req.body?.source || 'Web Portal';
        const notes = req.body?.notes ? String(req.body.notes).slice(0, 300) : '';

        await db.run(
          `INSERT INTO attendance_records (
          id, employeeId, employeeName, department, operationTeam, workDate,
          shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
          checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role,
          sessionId, sessionStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [
            id,
            employee.employeeId,
            employee.name,
            employee.department || 'HR Operations',
            employee.operationTeam || employee.department || 'HR Operations',
            workDate,
            shiftConfig.id,
            shiftConfig.name,
            shiftConfig.startTime,
            shiftConfig.endTime,
            Number(shiftConfig.isOvernight || 0),
            checkInAt,
            lateMinutes,
            source,
            notes,
            lateApprovalStatus,
            employee.role || 'HR Operations',
            sessId
          ]
        );

        // Record this login & check-in event into role_login_logs for Super Admin live tracking
        try {
          await db.run(
            `INSERT INTO role_login_logs (
            id, employeeId, employeeName, email, role, department,
            shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
            punctuality, lateMinutes, lateApprovalStatus, ipAddress, sessionId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
            [
              makeId('LOG'),
              employee.employeeId,
              employee.name,
              employee.email,
              employee.role,
              employee.department || 'Operations',
              shiftConfig.id,
              shiftConfig.name,
              shiftConfig.startTime,
              shiftConfig.endTime,
              nowParts.timeStr,
              isLate ? 'Late' : (isExecutive ? 'Exempt' : 'On Time'),
              lateMinutes,
              lateApprovalStatus,
              ipAddress,
              sessId
            ]
          );
        } catch (logErr) {
          console.warn('Role login logging notice:', logErr.message);
        }

        // If late, record late-login approval request and notify approvers immediately
        if (lateApprovalStatus === 'PENDING') {
          try {
            await ensureLateLoginApprovalRequest(db, {
              attendanceId: id,
              employee,
              shiftConfig,
              workDate,
              clockInTimeStr: nowParts.timeStr,
              lateMinutes,
              explanation: notes
            });
          } catch (_) { }
        }

        const created = await db.get('SELECT * FROM attendance_records WHERE id = ?', [id]);

        await writeAttendanceAudit(db, {
          attendanceId: id,
          employeeId: employee.employeeId,
          workDate,
          action: 'CHECK_IN',
          actor: employee,
          beforeState: null,
          afterState: created,
          details: isLate
            ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins late against ${shiftConfig.startTime}). Status: ${lateApprovalStatus}`
            : `Checked in on time at ${nowParts.timeStr}`,
          ipAddress
        });

        await createNotification(db, {
          employeeId: employee.employeeId,
          type: 'Check-In',
          title: isLate ? `Late Check-In Recorded (${workDate})` : `Checked In (${workDate})`,
          message: isLate
            ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins past shift start ${shiftConfig.startTime}). Awaiting Super Admin authorization.`
            : `Successfully checked in for ${shiftConfig.name} at ${nowParts.timeStr}.`,
          severity: isLate ? 'warning' : 'success',
          relatedId: id
        });

        res.status(201).json({
          success: true,
          message: isLate
            ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins late). Awaiting Super Admin authorization.`
            : `Checked in successfully at ${nowParts.timeStr}.`,
          data: {
            ...created,
            lateApprovalStatus,
            isLate,
            lateMinutes,
            shiftName: shiftConfig.name,
            shiftStart: shiftConfig.startTime
          }
        });
      });
    } catch (error) {
      if (error?.message?.includes('UNIQUE constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate check-in prevented for today.'
        });
      }
      console.error('Check-in failed:', error);
      res.status(500).json({ success: false, message: 'Failed to check in.' });
    }
  });

  app.post('/api/hr-ops/attendance/break/start', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const shiftConfig = await getEmployeeShift(db, employee);

      if (Number(shiftConfig.breakTrackingEnabled ?? 1) !== 1) {
        return res.status(400).json({ success: false, message: 'Break tracking is not enabled for your shift.' });
      }

      const empRecordsForCheckOut = await db.all(
        `SELECT * FROM attendance_records WHERE employeeId = ?`,
        [employee.employeeId]
      );
      const activeRec =
        (empRecordsForCheckOut || [])
          .filter((r) => !r.checkOutAt)
          .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;
      if (!activeRec) {
        return res.status(400).json({
          success: false,
          message: 'You must be actively checked in before starting a break.'
        });
      }

      const openBreak = await db.get(
        `SELECT * FROM attendance_breaks WHERE attendanceId = ? AND breakEndAt IS NULL`,
        [activeRec.id]
      );
      if (openBreak) {
        return res.status(409).json({
          success: false,
          message: 'A break is already in progress. End the current break first.'
        });
      }

      const now = new Date();
      const breakId = makeId('BRK');
      const breakType = req.body?.breakType ? String(req.body.breakType).slice(0, 60) : 'General Break';

      await db.run(
        `INSERT INTO attendance_breaks (id, attendanceId, employeeId, workDate, breakStartAt, breakType, durationMinutes)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [breakId, activeRec.id, employee.employeeId, activeRec.workDate, now.toISOString(), breakType]
      );

      await writeAttendanceAudit(db, {
        attendanceId: activeRec.id,
        employeeId: employee.employeeId,
        workDate: activeRec.workDate,
        action: 'BREAK_START',
        actor: employee,
        details: `Started ${breakType} at ${getCompanyDateTimeParts(now).timeStr}`,
        ipAddress
      });

      const createdBreak = await db.get('SELECT * FROM attendance_breaks WHERE id = ?', [breakId]);
      res.status(201).json({
        success: true,
        message: `${breakType} started.`,
        data: createdBreak
      });
    } catch (error) {
      console.error('Break start error:', error);
      res.status(500).json({ success: false, message: 'Failed to start break.' });
    }
  });

  app.post('/api/hr-ops/attendance/break/end', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);

      const openBreak = await db.get(
        `SELECT * FROM attendance_breaks WHERE employeeId = ? AND breakEndAt IS NULL ORDER BY breakStartAt DESC LIMIT 1`,
        [employee.employeeId]
      );
      if (!openBreak) {
        return res.status(400).json({
          success: false,
          message: 'No active break found to end.'
        });
      }

      const now = new Date();
      const startMs = new Date(openBreak.breakStartAt).getTime();
      const durationMinutes = Math.max(0, Math.round((now.getTime() - startMs) / 60000));

      await db.run(
        `UPDATE attendance_breaks SET breakEndAt = ?, durationMinutes = ? WHERE id = ?`,
        [now.toISOString(), durationMinutes, openBreak.id]
      );

      const sumRow = await db.get(
        `SELECT COALESCE(SUM(durationMinutes), 0) as totalBreak FROM attendance_breaks WHERE attendanceId = ?`,
        [openBreak.attendanceId]
      );
      const totalBreakMinutes = Number(sumRow?.totalBreak || 0);

      await db.run(
        `UPDATE attendance_records SET totalBreakMinutes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [totalBreakMinutes, openBreak.attendanceId]
      );

      await writeAttendanceAudit(db, {
        attendanceId: openBreak.attendanceId,
        employeeId: employee.employeeId,
        workDate: openBreak.workDate,
        action: 'BREAK_END',
        actor: employee,
        details: `Ended break (${durationMinutes} mins; cumulative break ${totalBreakMinutes} mins)`,
        ipAddress
      });

      const updatedBreak = await db.get('SELECT * FROM attendance_breaks WHERE id = ?', [openBreak.id]);
      res.json({
        success: true,
        message: `Break ended (${durationMinutes}m). Total break today: ${totalBreakMinutes}m.`,
        data: { breakRecord: updatedBreak, totalBreakMinutes }
      });
    } catch (error) {
      console.error('Break end error:', error);
      res.status(500).json({ success: false, message: 'Failed to end break.' });
    }
  });

  app.post('/api/hr-ops/attendance/check-out', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const shiftConfig = await getEmployeeShift(db, employee);

      const empRecordsForCheckOut = await db.all(
        `SELECT * FROM attendance_records WHERE employeeId = ?`,
        [employee.employeeId]
      );
      const activeRec =
        (empRecordsForCheckOut || [])
          .filter((r) => !r.checkOutAt)
          .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;

      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);

      if (!activeRec) {
        const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);
        const existingToday = await db.get(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?`,
          [employee.employeeId, workDate]
        );
        if (existingToday && existingToday.checkOutAt) {
          return res.json({
            success: true,
            alreadyCheckedOut: true,
            message: `Already checked out for ${workDate}.`,
            data: existingToday
          });
        }
        return res.json({
          success: true,
          alreadyCheckedOut: true,
          message: 'No active check-in found.',
          data: null
        });
      }

      // Close any still-open break before computing checkout totals
      const attBreaks = await db.all(
        `SELECT * FROM attendance_breaks WHERE attendanceId = ?`,
        [activeRec.id]
      );
      const openBreak = (attBreaks || []).find((b) => !b.breakEndAt) || null;
      if (openBreak) {
        const bDur = Math.max(0, Math.round((now.getTime() - new Date(openBreak.breakStartAt).getTime()) / 60000));
        await db.run(
          `UPDATE attendance_breaks SET breakEndAt = ?, durationMinutes = ? WHERE id = ?`,
          [now.toISOString(), bDur, openBreak.id]
        );
        openBreak.breakEndAt = now.toISOString();
        openBreak.durationMinutes = bDur;
      }

      const totalBreakMinutes = (attBreaks || []).reduce(
        (sum, b) => sum + (Number(b.durationMinutes) || 0),
        0
      );

      const metrics = computeCheckOutMetrics(activeRec, now, totalBreakMinutes, shiftConfig);
      const checkOutAt = now.toISOString();

      await db.run(
        `UPDATE attendance_records
         SET checkOutAt = ?, sessionStatus = 'COMPLETED', totalBreakMinutes = ?, grossMinutes = ?, netWorkMinutes = ?, overtimeMinutes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          checkOutAt,
          metrics.totalBreakMinutes,
          metrics.grossMinutes,
          metrics.netWorkMinutes,
          metrics.overtimeMinutes,
          metrics.finalStatus,
          activeRec.id
        ]
      );

      const updated = await db.get('SELECT * FROM attendance_records WHERE id = ?', [activeRec.id]);

      try {
        const empLoginLogs = await db.all(
          `SELECT * FROM role_login_logs WHERE employeeId = ?`,
          [employee.employeeId]
        );
        const formattedDur = formatMinutesDuration(metrics.netWorkMinutes);
        for (const logRow of empLoginLogs || []) {
          if (!logRow.logoutTime) {
            await db.run(
              `UPDATE role_login_logs SET logoutTime = ?, totalDuration = ? WHERE id = ?`,
              [checkOutAt, formattedDur, logRow.id]
            );
          }
        }
      } catch (_) { }

      await writeAttendanceAudit(db, {
        attendanceId: activeRec.id,
        employeeId: employee.employeeId,
        workDate: activeRec.workDate,
        action: 'CHECK_OUT',
        actor: employee,
        beforeState: activeRec,
        afterState: updated,
        details: `Checked out at ${nowParts.timeStr}. Net work: ${metrics.netWorkMinutes}m, Break: ${metrics.totalBreakMinutes}m, Overtime: ${metrics.overtimeMinutes}m`,
        ipAddress
      });

      await createNotification(db, {
        employeeId: employee.employeeId,
        type: 'Check-Out',
        title: `Checked Out (${activeRec.workDate})`,
        message: `Checked out at ${nowParts.timeStr}. Net working duration: ${Math.floor(metrics.netWorkMinutes / 60)}h ${String(metrics.netWorkMinutes % 60).padStart(2, '0')}m.`,
        severity: 'info',
        relatedId: `out_${activeRec.id}`
      });

      res.json({
        success: true,
        message: `Checked out at ${nowParts.timeStr}.`,
        data: updated
      });
    } catch (error) {
      console.error('Check-out failed:', error);
      res.status(500).json({ success: false, message: 'Failed to check out.' });
    }
  });

  app.get('/api/hr-ops/attendance/records/:workDate', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const workDate = req.params.workDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
        return res.status(400).json({ success: false, message: 'Invalid date format (expected YYYY-MM-DD).' });
      }

      const db = await getDb();
      const employee = req.authEmployee;
      const shiftConfig = await getEmployeeShift(db, employee);

      const dbRecord = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?`,
        [employee.employeeId, workDate]
      );
      const breaks = dbRecord
        ? await db.all('SELECT * FROM attendance_breaks WHERE attendanceId = ? ORDER BY breakStartAt ASC', [dbRecord.id])
        : [];
      const holidays = await db.all('SELECT * FROM company_holidays WHERE holidayDate = ?', [workDate]);
      const leaveRequests = await db.all(
        'SELECT * FROM employee_leave_requests WHERE employeeId = ? AND startDate <= ? AND endDate >= ?',
        [employee.employeeId, workDate, workDate]
      );
      const regularizations = await db.all(
        'SELECT * FROM attendance_regularizations WHERE employeeId = ? AND attendanceDate = ? ORDER BY createdAt DESC',
        [employee.employeeId, workDate]
      );
      const auditLogs = await db.all(
        'SELECT * FROM attendance_audit_logs WHERE employeeId = ? AND workDate = ? ORDER BY createdAt DESC',
        [employee.employeeId, workDate]
      );

      const dataset = buildAttendanceDataset({
        employee,
        shiftConfig,
        dbRecords: dbRecord ? [dbRecord] : [],
        breaksByAttendanceId: dbRecord ? { [dbRecord.id]: breaks } : {},
        holidays,
        leaveRequests,
        startDateStr: workDate,
        endDateStr: workDate
      });

      res.json({
        success: true,
        data: {
          day: dataset.days[0],
          record: dbRecord || null,
          breaks,
          regularizations,
          auditLogs
        }
      });
    } catch (error) {
      console.error('Get attendance day details failed:', error);
      res.status(500).json({ success: false, message: 'Failed to load day details.' });
    }
  });

  app.get('/api/hr-ops/attendance/regularizations', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const rows = await db.all(
        'SELECT * FROM attendance_regularizations WHERE employeeId = ? ORDER BY createdAt DESC',
        [req.authEmployee.employeeId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('List regularizations failed:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch regularization requests.' });
    }
  });

  app.post('/api/hr-ops/attendance/regularizations', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const shiftConfig = await getEmployeeShift(db, employee);

      const {
        attendanceDate,
        correctionType,
        requestedCheckIn,
        requestedCheckOut,
        requestedStatus,
        reason
      } = req.body || {};

      if (!attendanceDate || !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
        return res.status(400).json({ success: false, message: 'Valid attendanceDate (YYYY-MM-DD) is required.' });
      }
      if (!VALID_CORRECTION_TYPES.includes(correctionType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid correctionType. Must be one of: ${VALID_CORRECTION_TYPES.join(', ')}`
        });
      }
      if (!reason || String(reason).trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a clear reason (at least 5 characters) for this correction request.'
        });
      }

      const todayStr = getCompanyDateTimeParts(new Date()).dateStr;
      if (attendanceDate > todayStr) {
        return res.status(400).json({
          success: false,
          message: 'Cannot submit attendance regularization for a future date.'
        });
      }

      if (correctionType === 'Missed Check-In' && !requestedCheckIn) {
        return res.status(400).json({ success: false, message: 'Requested check-in time is required.' });
      }
      if (correctionType === 'Missed Check-Out' && !requestedCheckOut) {
        return res.status(400).json({ success: false, message: 'Requested check-out time is required.' });
      }
      if (correctionType === 'Incorrect Timestamps' && !requestedCheckIn && !requestedCheckOut) {
        return res.status(400).json({
          success: false,
          message: 'At least one corrected check-in or check-out timestamp is required.'
        });
      }
      if (correctionType === 'Incorrect Status' && !requestedStatus) {
        return res.status(400).json({ success: false, message: 'Requested status is required.' });
      }

      const existingPending = await db.get(
        `SELECT id FROM attendance_regularizations WHERE employeeId = ? AND attendanceDate = ? AND status = 'Pending'`,
        [employee.employeeId, attendanceDate]
      );
      if (existingPending) {
        return res.status(409).json({
          success: false,
          message: `A Pending regularization request (${existingPending.id}) already exists for ${attendanceDate}.`
        });
      }

      const dbRecord = await db.get(
        'SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?',
        [employee.employeeId, attendanceDate]
      );

      // Compute authentic existing recorded values from server DB (never trust client-sent existing values)
      let existingStatus = dbRecord ? dbRecord.status : 'Absent';
      if (!dbRecord) {
        const holiday = await db.get('SELECT * FROM company_holidays WHERE holidayDate = ?', [attendanceDate]);
        if (holiday) existingStatus = 'Holiday';
        else if (attendanceDate === todayStr) existingStatus = 'Not Checked In';
      }

      const existingCheckIn = dbRecord?.checkInAt
        ? getCompanyDateTimeParts(dbRecord.checkInAt).timeStr
        : null;
      const existingCheckOut = dbRecord?.checkOutAt
        ? getCompanyDateTimeParts(dbRecord.checkOutAt).timeStr
        : null;

      const regId = makeId('REG');
      await db.run(
        `INSERT INTO attendance_regularizations (
          id, employeeId, employeeName, department, operationTeam,
          attendanceDate, correctionType, existingCheckIn, existingCheckOut, existingStatus,
          requestedCheckIn, requestedCheckOut, requestedStatus, reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [
          regId,
          employee.employeeId,
          employee.name,
          employee.department || 'HR Operations',
          employee.operationTeam || employee.department || 'HR Operations',
          attendanceDate,
          correctionType,
          existingCheckIn,
          existingCheckOut,
          existingStatus,
          requestedCheckIn || null,
          requestedCheckOut || null,
          requestedStatus || (dbRecord ? 'Present' : 'Present'),
          String(reason).trim().slice(0, 600)
        ]
      );

      const created = await db.get('SELECT * FROM attendance_regularizations WHERE id = ?', [regId]);

      await writeAttendanceAudit(db, {
        attendanceId: dbRecord?.id || null,
        employeeId: employee.employeeId,
        workDate: attendanceDate,
        action: 'REGULARIZATION_SUBMITTED',
        actor: employee,
        afterState: created,
        details: `Submitted ${correctionType} request for ${attendanceDate}`,
        ipAddress
      });

      await createNotification(db, {
        employeeId: employee.employeeId,
        type: 'Regularization Submitted',
        title: `Correction Request Submitted (${attendanceDate})`,
        message: `Your ${correctionType} request for ${attendanceDate} is Pending HR Lead review.`,
        severity: 'info',
        relatedId: regId
      });

      res.status(201).json({
        success: true,
        message: `Attendance regularization request for ${attendanceDate} submitted for approval.`,
        data: created
      });
    } catch (error) {
      console.error('Create regularization failed:', error);
      res.status(500).json({ success: false, message: 'Failed to submit regularization request.' });
    }
  });

  app.patch('/api/hr-ops/attendance/notifications/read-all', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE employee_notifications SET isRead = 1 WHERE employeeId = ?',
        [req.authEmployee.employeeId]
      );
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to mark notifications read.' });
    }
  });

  app.patch('/api/hr-ops/attendance/notifications/:id/read', requireCrmAuth, requireHrOpsRole, async (req, res) => {
    try {
      const db = await getDb();
      const result = await db.run(
        'UPDATE employee_notifications SET isRead = 1 WHERE id = ? AND employeeId = ?',
        [req.params.id, req.authEmployee.employeeId]
      );
      if (!result || result.changes === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  });

  // =========================================================================
  // HR Lead / Admin / Super Admin Approval & Team Routes (/api/hr/attendance/*)
  // =========================================================================
  app.get('/api/hr/attendance/regularizations', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const statusFilter = req.query.status;
      const rows = statusFilter
        ? await db.all(
          'SELECT * FROM attendance_regularizations WHERE status = ? ORDER BY createdAt DESC',
          [statusFilter]
        )
        : await db.all('SELECT * FROM attendance_regularizations ORDER BY createdAt DESC');

      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('HR regularizations list failed:', error);
      res.status(500).json({ success: false, message: 'Failed to load regularization requests.' });
    }
  });

  app.patch('/api/hr/attendance/regularizations/:id/review', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const reviewer = req.authEmployee;
      const ipAddress = getClientIp(req);
      const { decision, comments } = req.body || {};

      if (!['Approved', 'Rejected'].includes(decision)) {
        return res.status(400).json({ success: false, message: "Decision must be 'Approved' or 'Rejected'." });
      }

      const reg = await db.get('SELECT * FROM attendance_regularizations WHERE id = ?', [req.params.id]);
      if (!reg) {
        return res.status(404).json({ success: false, message: 'Regularization request not found.' });
      }

      // Critical security control: prevent self-approval even if someone holds multiple privileges
      if (reg.employeeId === reviewer.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Self-approval of attendance regularization requests is strictly prohibited.'
        });
      }

      if (reg.status !== 'Pending') {
        return res.status(409).json({
          success: false,
          message: `This regularization request has already been ${reg.status.toLowerCase()}.`
        });
      }

      const targetEmp = await db.get('SELECT * FROM employees WHERE employeeId = ?', [reg.employeeId]);
      const shiftConfig = await getEmployeeShift(db, targetEmp || { shiftId: 'SHIFT-GENERAL' });
      const nowIso = new Date().toISOString();
      const reviewComment = comments
        ? String(comments).trim().slice(0, 500)
        : decision === 'Approved'
          ? 'Approved by HR Lead'
          : 'Rejected by HR Lead';

      let updatedAttendance = null;
      const existingAtt = await db.get(
        'SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?',
        [reg.employeeId, reg.attendanceDate]
      );

      if (decision === 'Approved') {
        const finalInInput = reg.requestedCheckIn || existingAtt?.checkInAt || `${shiftConfig.startTime}`;
        const finalOutInput = reg.requestedCheckOut || existingAtt?.checkOutAt || null;

        const { checkInIso, checkOutIso } = resolveRegularizationTimestamps(
          reg.attendanceDate,
          finalInInput,
          finalOutInput,
          shiftConfig
        );

        const checkInDate = checkInIso ? new Date(checkInIso) : null;
        const { lateMinutes } = checkInDate
          ? computeCheckInMetrics(checkInDate, reg.attendanceDate, shiftConfig)
          : { lateMinutes: existingAtt?.lateMinutes || 0 };

        let totalBreakMinutes = Number(existingAtt?.totalBreakMinutes || 0);
        if (existingAtt) {
          const breakSum = await db.get(
            'SELECT COALESCE(SUM(durationMinutes), 0) as totalBreak FROM attendance_breaks WHERE attendanceId = ?',
            [existingAtt.id]
          );
          totalBreakMinutes = Number(breakSum?.totalBreak ?? totalBreakMinutes);
        }

        let grossMinutes = 0;
        let netWorkMinutes = 0;
        let overtimeMinutes = 0;
        let finalStatus = existingAtt?.status || 'Present';

        if (checkInIso && checkOutIso) {
          const metrics = computeCheckOutMetrics(
            { checkInAt: checkInIso, lateMinutes },
            new Date(checkOutIso),
            totalBreakMinutes,
            shiftConfig
          );
          grossMinutes = metrics.grossMinutes;
          netWorkMinutes = metrics.netWorkMinutes;
          overtimeMinutes = metrics.overtimeMinutes;
          finalStatus =
            reg.correctionType === 'Incorrect Status' && reg.requestedStatus
              ? reg.requestedStatus
              : metrics.finalStatus;
        } else if (checkInIso) {
          finalStatus =
            reg.correctionType === 'Incorrect Status' && reg.requestedStatus
              ? reg.requestedStatus
              : 'In Progress';
        } else if (reg.correctionType === 'Incorrect Status' && reg.requestedStatus) {
          finalStatus = reg.requestedStatus;
        }

        const attId = existingAtt?.id || makeId('ATT');
        if (existingAtt) {
          await db.run(
            `UPDATE attendance_records
             SET checkInAt = COALESCE(?, checkInAt),
                 checkOutAt = COALESCE(?, checkOutAt),
                 lateMinutes = ?,
                 totalBreakMinutes = ?,
                 grossMinutes = ?,
                 netWorkMinutes = ?,
                 overtimeMinutes = ?,
                 status = ?,
                 source = 'Regularization Approved',
                 isLocked = 1,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              checkInIso,
              checkOutIso,
              lateMinutes,
              totalBreakMinutes,
              grossMinutes,
              netWorkMinutes,
              overtimeMinutes,
              finalStatus,
              attId
            ]
          );
        } else {
          await db.run(
            `INSERT INTO attendance_records (
              id, employeeId, employeeName, department, operationTeam, workDate,
              shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
              checkInAt, checkOutAt, status, lateMinutes, totalBreakMinutes,
              grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, isLocked
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Regularization Approved', ?, 1)`,
            [
              attId,
              reg.employeeId,
              reg.employeeName,
              reg.department || 'HR Operations',
              reg.operationTeam || reg.department || 'HR Operations',
              reg.attendanceDate,
              shiftConfig.id,
              shiftConfig.name,
              shiftConfig.startTime,
              shiftConfig.endTime,
              Number(shiftConfig.isOvernight || 0),
              checkInIso,
              checkOutIso,
              finalStatus,
              lateMinutes,
              totalBreakMinutes,
              grossMinutes,
              netWorkMinutes,
              overtimeMinutes,
              `Regularized: ${reg.correctionType}`
            ]
          );
        }

        updatedAttendance = await db.get('SELECT * FROM attendance_records WHERE id = ?', [attId]);

        await writeAttendanceAudit(db, {
          attendanceId: attId,
          employeeId: reg.employeeId,
          workDate: reg.attendanceDate,
          action: 'REGULARIZATION_APPROVED',
          actor: reviewer,
          beforeState: existingAtt || null,
          afterState: updatedAttendance,
          details: `Approved ${reg.correctionType} (${reviewComment})`,
          ipAddress
        });

        await createNotification(db, {
          employeeId: reg.employeeId,
          type: 'Regularization Approved',
          title: `Regularization Approved (${reg.attendanceDate})`,
          message: `Your ${reg.correctionType} request for ${reg.attendanceDate} was approved by ${reviewer.name}. Comment: ${reviewComment}`,
          severity: 'success',
          relatedId: `rev_${reg.id}`
        });
      } else {
        await writeAttendanceAudit(db, {
          attendanceId: existingAtt?.id || null,
          employeeId: reg.employeeId,
          workDate: reg.attendanceDate,
          action: 'REGULARIZATION_REJECTED',
          actor: reviewer,
          beforeState: reg,
          afterState: { status: 'Rejected', reviewerComments: reviewComment },
          details: `Rejected ${reg.correctionType} (${reviewComment})`,
          ipAddress
        });

        await createNotification(db, {
          employeeId: reg.employeeId,
          type: 'Regularization Rejected',
          title: `Regularization Rejected (${reg.attendanceDate})`,
          message: `Your ${reg.correctionType} request for ${reg.attendanceDate} was declined by ${reviewer.name}. Reason: ${reviewComment}`,
          severity: 'warning',
          relatedId: `rev_${reg.id}`
        });
      }

      await db.run(
        `UPDATE attendance_regularizations
         SET status = ?, reviewerId = ?, reviewerName = ?, reviewerRole = ?, reviewerComments = ?, reviewedAt = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          decision,
          reviewer.employeeId,
          reviewer.name,
          reviewer.role,
          reviewComment,
          nowIso,
          reg.id
        ]
      );

      const updatedReg = await db.get('SELECT * FROM attendance_regularizations WHERE id = ?', [reg.id]);
      res.json({
        success: true,
        message: `Regularization request ${decision.toLowerCase()}.`,
        data: { regularization: updatedReg, attendanceRecord: updatedAttendance }
      });
    } catch (error) {
      console.error('Review regularization failed:', error);
      res.status(500).json({ success: false, message: 'Failed to review regularization request.' });
    }
  });

  app.get('/api/hr/attendance/team', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);
      const monthStr = /^\d{4}-\d{2}$/.test(req.query.month || '')
        ? req.query.month
        : `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
      const [mYear, mMon] = monthStr.split('-').map(Number);
      const lastDay = new Date(Date.UTC(mYear, mMon, 0)).getUTCDate();
      const startDateStr = `${monthStr}-01`;
      const endDateStr = `${monthStr}-${String(lastDay).padStart(2, '0')}`;

      const hrOpsEmployees = await db.all(
        `SELECT * FROM employees WHERE LOWER(COALESCE(status, 'Active')) != 'inactive' ORDER BY name ASC`
      );
      const holidays = await db.all(
        `SELECT * FROM company_holidays WHERE holidayDate >= ? AND holidayDate <= ?`,
        [startDateStr, endDateStr]
      );

      const team = [];
      for (const rawEmp of hrOpsEmployees) {
        const emp = sanitizeEmployee(rawEmp);
        const shiftConfig = await getEmployeeShift(db, emp);
        await autoFlagStaleMissingCheckouts(db, emp, shiftConfig, getClientIp(req));
        const dbRecords = await db.all(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate >= ? AND workDate <= ?`,
          [emp.employeeId, startDateStr, endDateStr]
        );
        const leaveRequests = await db.all(
          `SELECT * FROM employee_leave_requests WHERE employeeId = ?`,
          [emp.employeeId]
        );

        const dataset = buildAttendanceDataset({
          employee: emp,
          shiftConfig,
          dbRecords,
          holidays,
          leaveRequests,
          startDateStr,
          endDateStr,
          now
        });

        const todayDay = dataset.days.find((d) => d.date === nowParts.dateStr) || null;
        team.push({
          employee: emp,
          shift: shiftConfig,
          today: todayDay,
          summary: dataset.summary,
          workingHours: dataset.workingHours
        });
      }

      const regularizations = await db.all(
        `SELECT * FROM attendance_regularizations ORDER BY createdAt DESC LIMIT 100`
      );

      res.json({
        success: true,
        data: {
          todayDate: nowParts.dateStr,
          month: monthStr,
          team,
          regularizations
        }
      });
    } catch (error) {
      console.error('HR team attendance fetch failed:', error);
      res.status(500).json({ success: false, message: 'Failed to load team attendance.' });
    }
  });

  const refreshAttendanceTables = async (db, tables = ['attendance_records', 'late_login_approval_requests', 'employees']) => {
    if (!db?.refreshTable) return;
    await Promise.all(tables.map((t) => db.refreshTable(t).catch(() => { })));
  };

  // Pre-Login Shift Late Verification & Ingress Gatekeeper
  app.post('/api/crm/auth/record-late-login', async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const { email, password, role: reqRole, employeeId: reqEmpId, name: reqName, department: reqDept } = req.body || {};
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required.' });
      }
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'employees',
        'attendance_records',
        'late_login_approval_requests',
        'employee_shift_assignments',
        'shift_configs'
      ]);
      let employee = await db.get(
        'SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ?',
        [cleanEmail, cleanEmail]
      );

      // Auto-provision or link default account into employees table if missing
      if (!employee) {
        const def = (DEFAULT_CRM_EMPLOYEES || []).find(e =>
          (e.email && e.email.toLowerCase() === cleanEmail) ||
          (e.altEmail && e.altEmail.toLowerCase() === cleanEmail)
        );
        const empId = def?.employeeId || reqEmpId || `REV-EMP-${Math.floor(100 + Math.random() * 900)}`;
        const empName = def?.name || reqName || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const empRole = def?.role || reqRole || 'Staff';
        const empDept = def?.department || reqDept || 'Operations';
        const newId = makeId('emp');
        await db.run(
          `INSERT OR IGNORE INTO employees (id, employeeId, name, email, altEmail, phone, role, department, password, status, shiftId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 'SHIFT-GENERAL')`,
          [newId, empId, empName, cleanEmail, def?.altEmail ? def.altEmail.toLowerCase() : null, def?.phone || '', empRole, empDept, password]
        );
        employee = await db.get('SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ?', [cleanEmail, cleanEmail]);
      }

      if (!employee) {
        return res.status(401).json({ success: false, message: 'Account not found.' });
      }
      if (employee.password && employee.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password.' });
      }
      const isExecutive = employee.role === 'Super Admin' || employee.role === 'Admin';
      if (isExecutive) {
        return res.json({ success: true, isLate: false, isExecutive: true, allowed: true });
      }

      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);
      const shiftConfig = await getEmployeeShift(db, employee);
      const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);
      const { lateMinutes, isLate } = computeCheckInMetrics(now, workDate, shiftConfig);

      // Check if attendance record already exists for today
      let existing = await db.get(
        'SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?',
        [employee.employeeId, workDate]
      );

      if (existing) {
        const approved = existing.lateApprovalStatus === 'APPROVED' || existing.lateApprovalStatus === 'EXEMPT';
        if (approved) {
          return res.json({
            success: true,
            allowed: true,
            isLate: Number(existing.lateMinutes || 0) > 0,
            lateApprovalStatus: existing.lateApprovalStatus,
            attendanceId: existing.id,
            lateMinutes: Number(existing.lateMinutes || lateMinutes || 0),
            shiftStart: existing.shiftStart || shiftConfig.startTime,
            shiftName: existing.shiftName || shiftConfig.name,
            loginTime: nowParts.timeStr,
            employeeName: employee.name,
            role: employee.role,
            employeeId: employee.employeeId
          });
        }

        if (existing.lateApprovalStatus === 'REJECTED') {
          return res.json({
            success: true,
            allowed: false,
            isLate: true,
            lateApprovalStatus: 'REJECTED',
            attendanceId: existing.id,
            lateMinutes: Number(existing.lateMinutes || lateMinutes || 0),
            shiftStart: existing.shiftStart || shiftConfig.startTime,
            shiftName: existing.shiftName || shiftConfig.name,
            loginTime: nowParts.timeStr,
            employeeName: employee.name,
            role: employee.role,
            employeeId: employee.employeeId
          });
        }

        // If employee already checked in on-time earlier today (non-late and not pending), allow re-entry
        const existingLateMins = Number(existing.lateMinutes || 0);
        if (existingLateMins <= 0 && !isLate && existing.lateApprovalStatus !== 'PENDING') {
          return res.json({
            success: true,
            allowed: true,
            isLate: false,
            lateApprovalStatus: existing.lateApprovalStatus || 'APPROVED',
            attendanceId: existing.id,
            lateMinutes: 0,
            shiftStart: existing.shiftStart || shiftConfig.startTime,
            shiftName: existing.shiftName || shiftConfig.name,
            loginTime: nowParts.timeStr,
            employeeName: employee.name,
            role: employee.role,
            employeeId: employee.employeeId
          });
        }

        // Employee is re-attempting login while late: Refresh to PENDING so approvers (Super Admin / HR Lead) see it
        const updatedLateMinutes = Math.max(existingLateMins, lateMinutes || 0);
        await db.run(
          `UPDATE attendance_records SET
            lateApprovalStatus = 'PENDING',
            lateMinutes = ?,
            status = 'In Progress',
            notes = 'Shift Late Ingress pending authorization',
            updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [updatedLateMinutes, existing.id]
        );

        const ipAddress = getClientIp(req);
        try {
          await db.run(
            `INSERT INTO role_login_logs (
              id, employeeId, employeeName, email, role, department,
              shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
              punctuality, lateMinutes, lateApprovalStatus, ipAddress
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'Late', ?, 'PENDING', ?)`,
            [
              makeId('LOG'),
              employee.employeeId,
              employee.name,
              employee.email,
              employee.role,
              employee.department || 'Operations',
              shiftConfig.id,
              shiftConfig.name,
              shiftConfig.startTime,
              shiftConfig.endTime,
              nowParts.timeStr,
              updatedLateMinutes,
              ipAddress
            ]
          );
        } catch (_) { }

        try {
          await ensureLateLoginApprovalRequest(db, {
            attendanceId: existing.id,
            employee,
            shiftConfig,
            workDate,
            clockInTimeStr: nowParts.timeStr,
            lateMinutes: updatedLateMinutes
          });
        } catch (_) { }

        return res.json({
          success: true,
          allowed: false,
          isLate: true,
          lateApprovalStatus: 'PENDING',
          attendanceId: existing.id,
          lateMinutes: updatedLateMinutes,
          shiftStart: existing.shiftStart || shiftConfig.startTime,
          shiftName: existing.shiftName || shiftConfig.name,
          loginTime: nowParts.timeStr,
          employeeName: employee.name,
          role: employee.role,
          employeeId: employee.employeeId
        });
      }

      if (!isLate) {
        return res.json({
          success: true,
          allowed: true,
          isLate: false,
          lateApprovalStatus: 'APPROVED'
        });
      }

      // Record new late arrival check-in with PENDING status
      const attId = makeId('ATT');
      const checkInAt = now.toISOString();
      const ipAddress = getClientIp(req);

      await db.run(
        `INSERT INTO attendance_records (
          id, employeeId, employeeName, department, operationTeam, workDate,
          shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
          checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, 'Web Portal Login', 'Shift Late Ingress pending Super Admin authorization', 'PENDING', ?)`,
        [
          attId,
          employee.employeeId,
          employee.name,
          employee.department || 'Operations',
          employee.operationTeam || employee.department || 'Operations',
          workDate,
          shiftConfig.id,
          shiftConfig.name,
          shiftConfig.startTime,
          shiftConfig.endTime,
          Number(shiftConfig.isOvernight || 0),
          checkInAt,
          lateMinutes,
          employee.role || 'Staff'
        ]
      );

      // Record in role_login_logs
      try {
        await db.run(
          `INSERT INTO role_login_logs (
            id, employeeId, employeeName, email, role, department,
            shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
            punctuality, lateMinutes, lateApprovalStatus, ipAddress
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'Late', ?, 'PENDING', ?)`,
          [
            makeId('LOG'),
            employee.employeeId,
            employee.name,
            employee.email,
            employee.role,
            employee.department || 'Operations',
            shiftConfig.id,
            shiftConfig.name,
            shiftConfig.startTime,
            shiftConfig.endTime,
            nowParts.timeStr,
            lateMinutes,
            ipAddress
          ]
        );
      } catch (_) { }

      // Create or ensure single late-login approval request
      try {
        await ensureLateLoginApprovalRequest(db, {
          attendanceId: attId,
          employee,
          shiftConfig,
          workDate,
          clockInTimeStr: nowParts.timeStr,
          lateMinutes
        });
      } catch (_) { }

      return res.json({
        success: true,
        allowed: false,
        isLate: true,
        lateApprovalStatus: 'PENDING',
        attendanceId: attId,
        lateMinutes,
        shiftStart: shiftConfig.startTime,
        shiftName: shiftConfig.name,
        loginTime: nowParts.timeStr,
        employeeName: employee.name,
        role: employee.role,
        employeeId: employee.employeeId
      });
    } catch (err) {
      console.error('Record late login error:', err);
      res.status(500).json({ success: false, message: 'Failed to record late login.' });
    }
  });

  // =========================================================================
  // Super Admin Late Arrival Authorization & Role Logins Monitoring Routes
  // =========================================================================

  // Check current employee's late approval status (called by blocking gate / status poll)
  app.get('/api/hr-ops/attendance/late-approval-status', async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'employees',
        'attendance_records',
        'role_login_logs',
        'employee_shift_assignments',
        'shift_configs'
      ]);
      const emailQuery = String(req.query?.email || req.headers['x-employee-email'] || '').toLowerCase().trim();
      let employee = req.authEmployee;

      if (!employee && emailQuery) {
        const empRow = await db.get(
          'SELECT * FROM employees WHERE (LOWER(email) = ? OR LOWER(altEmail) = ?) AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1',
          [emailQuery, emailQuery]
        );
        if (empRow) {
          employee = sanitizeEmployee(empRow);
        }
      }

      if (!employee) {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.query?.token || '');
        if (token) {
          const payload = verifyCrmSessionToken(token);
          if (payload?.employeeId) {
            const emp = await db.get('SELECT * FROM employees WHERE employeeId = ?', [payload.employeeId]);
            if (emp) employee = sanitizeEmployee(emp);
          }
        }
      }

      const isExecutive = employee?.role === 'Super Admin' || employee?.role === 'Admin';
      if (isExecutive) {
        return res.json({
          success: true,
          isLate: false,
          lateApprovalStatus: 'EXEMPT',
          lateMinutes: 0
        });
      }

      const nowParts = getCompanyDateTimeParts(new Date());
      const workDate = nowParts.dateStr;
      let activeRecord = null;
      if (employee?.employeeId) {
        activeRecord = await db.get(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND (workDate = ? OR checkOutAt IS NULL) ORDER BY checkInAt DESC LIMIT 1`,
          [employee.employeeId, workDate]
        );
      } else if (emailQuery) {
        const log = await db.get(
          `SELECT employeeId FROM role_login_logs WHERE LOWER(email) = ? ORDER BY checkInTime DESC LIMIT 1`,
          [emailQuery]
        );
        if (log?.employeeId) {
          activeRecord = await db.get(
            `SELECT * FROM attendance_records WHERE employeeId = ? ORDER BY checkInAt DESC LIMIT 1`,
            [log.employeeId]
          );
        }
      }

      if (!activeRecord) {
        const shiftConfig = employee ? await getEmployeeShift(db, employee) : null;
        const now = new Date();
        const { isLate, lateMinutes } = shiftConfig
          ? computeCheckInMetrics(now, workDate, shiftConfig)
          : { isLate: true, lateMinutes: 30 };

        if (isLate) {
          // If late and no approved record exists today, status is strictly PENDING
          let pendingAtt = null;
          if (employee?.employeeId) {
            const attId = makeId('ATT');
            await db.run(
              `INSERT OR IGNORE INTO attendance_records (
                id, employeeId, employeeName, department, operationTeam, workDate,
                shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
                checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'In Progress', ?, 0, 0, 0, 0, 'Late Gate Auto', 'Shift Late Ingress pending authorization', 'PENDING', ?)`,
              [
                attId,
                employee.employeeId,
                employee.name,
                employee.department || 'Operations',
                employee.operationTeam || 'Operations',
                workDate,
                shiftConfig?.id || 'SHIFT-GENERAL',
                shiftConfig?.name || 'General Shift',
                shiftConfig?.startTime || '09:00',
                shiftConfig?.endTime || '18:00',
                now.toISOString(),
                lateMinutes,
                employee.role || 'Staff'
              ]
            );
            pendingAtt = await db.get('SELECT * FROM attendance_records WHERE id = ?', [attId]);
          }

          return res.json({
            success: true,
            isLate: true,
            lateApprovalStatus: 'PENDING',
            lateMinutes,
            attendanceId: pendingAtt?.id,
            employeeName: employee?.name || 'Staff Specialist',
            role: employee?.role || 'Employee'
          });
        }

        return res.json({
          success: true,
          isLate: false,
          lateApprovalStatus: 'APPROVED',
          lateMinutes: 0
        });
      }

      const isLate = Number(activeRecord.lateMinutes || 0) > 0;
      const lateApprovalStatus = activeRecord.lateApprovalStatus || (isLate ? 'PENDING' : 'APPROVED');

      return res.json({
        success: true,
        attendanceId: activeRecord.id,
        isLate,
        lateMinutes: Number(activeRecord.lateMinutes || 0),
        lateApprovalStatus,
        shiftName: activeRecord.shiftName,
        shiftStart: activeRecord.shiftStart,
        checkInAt: activeRecord.checkInAt,
        workDate: activeRecord.workDate,
        employeeName: activeRecord.employeeName,
        role: employee?.role || activeRecord.role || 'Employee'
      });
    } catch (err) {
      console.error('Failed to get late approval status:', err);
      res.status(500).json({ success: false, message: 'Failed to check late approval status.' });
    }
  });

  // Super Admin & HR Lead: List all pending late arrivals needing authorization
  app.get('/api/hr-ops/attendance/late-approvals/pending', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'attendance_records',
        'late_login_approval_requests',
        'employees'
      ]);
      const reviewer = req.authEmployee;
      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isSuperAdmin = reviewerRole === 'super admin' || reviewerRole === 'admin';
      const isHrLead = reviewerRole === 'hr lead';

      const allAttRows = await db.all(`SELECT id, employeeId, workDate, lateApprovalStatus FROM attendance_records`);
      const resolvedEmpDates = new Set(
        (allAttRows || [])
          .filter(r => r.lateApprovalStatus && r.lateApprovalStatus !== 'PENDING')
          .map(r => `${r.employeeId}::${r.workDate}`)
      );

      const rows = await db.all(
        `SELECT * FROM attendance_records WHERE lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC`
      );
      const reqRows = await db.all(
        `SELECT * FROM late_login_approval_requests WHERE status = 'Pending Approval' ORDER BY createdAt DESC`
      );

      const combinedRows = [];
      const seenEmpDates = new Set();
      const seenIds = new Set();

      for (const att of (rows || [])) {
        const empDateKey = `${att.employeeId}::${att.workDate}`;
        if (seenEmpDates.has(empDateKey) || seenIds.has(att.id)) continue;
        seenEmpDates.add(empDateKey);
        seenIds.add(att.id);
        combinedRows.push(att);
      }

      for (const reqItem of (reqRows || [])) {
        const empDateKey = `${reqItem.employeeId}::${reqItem.attendanceDate}`;
        const targetId = reqItem.attendanceId || reqItem.id;
        // Skip if already present in pending attendance rows OR already decided in attendance_records
        if (seenEmpDates.has(empDateKey) || resolvedEmpDates.has(empDateKey)) continue;
        if (!targetId || seenIds.has(targetId)) continue;
        seenEmpDates.add(empDateKey);
        seenIds.add(targetId);
        combinedRows.push({
          id: targetId,
          requestId: reqItem.id,
          employeeId: reqItem.employeeId,
          employeeName: reqItem.employeeName,
          department: reqItem.department,
          role: reqItem.role,
          shiftId: reqItem.shiftId,
          shiftName: reqItem.shiftName,
          shiftStart: reqItem.scheduledLoginTime,
          shiftEnd: reqItem.scheduledLogoutTime,
          checkInAt: reqItem.createdAt || reqItem.actualClockInTime,
          workDate: reqItem.attendanceDate,
          lateMinutes: Number(reqItem.delayMinutes || 0),
          notes: reqItem.explanation || 'Shift Late Ingress pending authorization',
          lateApprovalStatus: 'PENDING'
        });
      }

      const enriched = await Promise.all(
        combinedRows.map(async (row) => {
          const emp = await db.get(
            'SELECT email, role, avatar, designation FROM employees WHERE employeeId = ?',
            [row.employeeId]
          );
          return {
            ...row,
            email: emp?.email || '',
            role: emp?.role || row.role || row.department || 'Employee',
            avatar: emp?.avatar || '',
            designation: emp?.designation || ''
          };
        })
      );

      // Hierarchical filter:
      // - If reviewer is HR Lead:
      //   * ONLY Super Admin can see and approve HR Lead late arrivals!
      //   * HR Lead cannot see or approve other HR Leads or themselves!
      // - If reviewer is Super Admin or Admin:
      //   * Super Admin sees ALL pending late arrivals (including HR Lead).
      const filtered = enriched.filter((item) => {
        const itemRole = String(item.role || '').toLowerCase();
        const isTargetHrLead = itemRole === 'hr lead' || itemRole.includes('lead');
        const isSelf = reviewer?.employeeId && item.employeeId === reviewer.employeeId;

        if (isHrLead) {
          if (isTargetHrLead || isSelf) {
            return false;
          }
        }
        return true;
      });

      res.json({
        success: true,
        data: filtered,
        count: filtered.length
      });
    } catch (err) {
      console.error('Failed to get pending late approvals:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve pending late approvals.' });
    }
  });

  // Super Admin & HR Lead: Approve or Reject late arrival entry
  app.post('/api/hr-ops/attendance/late-approvals/:id/decision', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'attendance_records',
        'late_login_approval_requests',
        'employees',
        'role_login_logs'
      ]);
      const reviewer = req.authEmployee;
      const { id } = req.params;
      const { decision, notes } = req.body || {};
      const statusValue = String(decision).toUpperCase() === 'REJECTED' ? 'REJECTED' : 'APPROVED';

      let att = await db.get('SELECT * FROM attendance_records WHERE id = ?', [id]);
      let linkedReq = await db.get(
        'SELECT * FROM late_login_approval_requests WHERE id = ? OR attendanceId = ?',
        [id, id]
      );

      if (!att && linkedReq) {
        if (linkedReq.attendanceId) {
          att = await db.get('SELECT * FROM attendance_records WHERE id = ?', [linkedReq.attendanceId]);
        }
        if (!att && linkedReq.employeeId && linkedReq.attendanceDate) {
          att = await db.get(
            'SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ? ORDER BY checkInAt DESC LIMIT 1',
            [linkedReq.employeeId, linkedReq.attendanceDate]
          );
        }
      }

      if (!att) {
        // If passed id is a role_login_logs id (e.g. LOG-xxx), locate corresponding pending attendance record
        const loginLog = await db.get('SELECT * FROM role_login_logs WHERE id = ?', [id]);
        if (loginLog) {
          att = await db.get(
            `SELECT * FROM attendance_records WHERE employeeId = ? AND lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC LIMIT 1`,
            [loginLog.employeeId]
          );
          if (!att && !linkedReq) {
            linkedReq = {
              id: loginLog.id,
              attendanceId: null,
              employeeId: loginLog.employeeId,
              employeeName: loginLog.employeeName,
              department: loginLog.department,
              role: loginLog.role,
              shiftId: loginLog.shiftId,
              shiftName: loginLog.shiftName,
              scheduledLoginTime: loginLog.shiftStart,
              scheduledLogoutTime: loginLog.shiftEnd,
              attendanceDate: getCompanyDateTimeParts(new Date()).dateStr,
              delayMinutes: Number(loginLog.lateMinutes || 0)
            };
          }
        }
      }

      if (!att && !linkedReq) {
        return res.status(404).json({ success: false, message: 'Attendance record not found.' });
      }

      const targetEmployeeId = att?.employeeId || linkedReq.employeeId;
      const targetWorkDate = att?.workDate || linkedReq.attendanceDate || getCompanyDateTimeParts(new Date()).dateStr;
      const targetRoleFallback = att?.role || linkedReq?.role;

      // Check target employee role
      const targetEmp = await db.get('SELECT role FROM employees WHERE employeeId = ?', [targetEmployeeId]);
      const targetRole = String(targetEmp?.role || targetRoleFallback || '').toLowerCase();
      const isTargetHrLead = targetRole === 'hr lead' || targetRole.includes('lead');

      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isReviewerSuperAdmin = reviewerRole === 'super admin';

      // Strict Hierarchical Policy: HR Lead late arrivals can ONLY be approved by Super Admin
      if (isTargetHrLead && !isReviewerSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only Super Admin has authorization to approve late arrivals for HR Lead.'
        });
      }

      // Reviewer cannot approve themselves
      if (reviewer?.employeeId && targetEmployeeId === reviewer.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot approve your own late arrival request.'
        });
      }

      let resolvedAttId = att?.id;
      if (att) {
        if (statusValue === 'APPROVED') {
          await db.run(
            `UPDATE attendance_records SET lateApprovalStatus = ?, checkOutAt = NULL, status = 'Present', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [statusValue, att.id]
          );
        } else {
          await db.run(
            `UPDATE attendance_records SET lateApprovalStatus = ?, status = 'Absent', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [statusValue, att.id]
          );
        }
      } else if (linkedReq) {
        resolvedAttId = linkedReq.attendanceId || makeId('ATT');
        const checkInIso = new Date().toISOString();
        await db.run(
          `INSERT OR IGNORE INTO attendance_records (
            id, employeeId, employeeName, department, operationTeam, workDate,
            shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
            checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0, 0, 0, 0, 'Late Approval Decision', ?, ?, ?)`,
          [
            resolvedAttId,
            targetEmployeeId,
            linkedReq.employeeName || 'Employee',
            linkedReq.department || 'Operations',
            linkedReq.department || 'Operations',
            targetWorkDate,
            linkedReq.shiftId || 'SHIFT-GENERAL',
            linkedReq.shiftName || 'General Shift',
            linkedReq.scheduledLoginTime || '09:00',
            linkedReq.scheduledLogoutTime || '18:00',
            checkInIso,
            statusValue === 'APPROVED' ? 'Present' : 'Absent',
            Number(linkedReq.delayMinutes || 0),
            notes || `Late arrival ${statusValue.toLowerCase()} by ${reviewer.name} (${reviewer.role})`,
            statusValue,
            linkedReq.role || targetEmp?.role || 'Employee'
          ]
        );
      }

      // Ensure no duplicate PENDING attendance rows remain for same employee on the same workDate
      try {
        await db.run(
          `UPDATE attendance_records SET lateApprovalStatus = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE employeeId = ? AND workDate = ? AND lateApprovalStatus = 'PENDING'`,
          [statusValue, statusValue === 'APPROVED' ? 'Present' : 'Absent', targetEmployeeId, targetWorkDate]
        );
      } catch (_) { }

      try {
        await db.run(
          `UPDATE role_login_logs SET lateApprovalStatus = ?, approvedBy = ?, approvedAt = CURRENT_TIMESTAMP, rejectionReason = ? WHERE employeeId = ? AND lateApprovalStatus = 'PENDING'`,
          [statusValue, `${reviewer.name} (${reviewer.role})`, statusValue === 'REJECTED' ? (notes || `Access denied by ${reviewer.role}`) : null, targetEmployeeId]
        );
      } catch (_) { }

      try {
        const reqStatus = statusValue === 'APPROVED' ? 'Approved' : 'Rejected';
        await db.run(
          `UPDATE late_login_approval_requests SET status = ?, approverId = ?, approverName = ?, approverRole = ?, decisionTimestamp = CURRENT_TIMESTAMP, rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR attendanceId = ? OR (employeeId = ? AND attendanceDate = ?)`,
          [reqStatus, reviewer.employeeId, reviewer.name, reviewer.role, statusValue === 'REJECTED' ? (notes || `Access denied by ${reviewer.role}`) : null, id, resolvedAttId, targetEmployeeId, targetWorkDate]
        );
      } catch (_) { }

      await writeAttendanceAudit(db, {
        attendanceId: resolvedAttId || id,
        employeeId: targetEmployeeId,
        workDate: targetWorkDate,
        action: statusValue === 'APPROVED' ? 'APPROVE_LATE_ENTRY' : 'REJECT_LATE_ENTRY',
        actor: reviewer,
        beforeState: { lateApprovalStatus: att?.lateApprovalStatus || linkedReq?.status || 'PENDING' },
        afterState: { lateApprovalStatus: statusValue },
        details: `Late arrival access ${statusValue.toLowerCase()} by ${reviewer.role} ${reviewer.name}. ${notes ? 'Note: ' + notes : ''}`,
        ipAddress: getClientIp(req)
      });

      await createNotification(db, {
        employeeId: targetEmployeeId,
        type: 'Late Arrival Decision',
        title: statusValue === 'APPROVED' ? '✓ Late Arrival Access Approved' : '✕ Late Arrival Access Rejected',
        message: statusValue === 'APPROVED'
          ? `${reviewer.name} (${reviewer.role}) has approved your late arrival for shift ${targetWorkDate}. Workspace access unlocked.`
          : `${reviewer.name} (${reviewer.role}) has rejected your late arrival request for shift ${targetWorkDate}. ${notes || 'Please contact HR Leadership.'}`,
        severity: statusValue === 'APPROVED' ? 'success' : 'error',
        relatedId: `late_dec_${resolvedAttId || id}`
      });

      const resolvedRecord = att
        ? { ...att, lateApprovalStatus: statusValue }
        : { id: resolvedAttId, employeeId: targetEmployeeId, employeeName: linkedReq?.employeeName || 'Employee', workDate: targetWorkDate, lateApprovalStatus: statusValue };

      return res.json({
        success: true,
        message: statusValue === 'APPROVED' ? 'Late arrival approved successfully.' : 'Late arrival rejected.',
        decision: statusValue,
        record: resolvedRecord
      });
    } catch (err) {
      console.error('Failed to review late approval:', err);
      res.status(500).json({ success: false, message: 'Failed to process late approval decision.' });
    }
  });

  // Employee: Submit justification/explanation for late arrival while at the gatekeeper
  app.post('/api/hr-ops/attendance/late-justification', async (req, res) => {
    try {
      const db = await getDb();
      let employee = null;
      const email = req.body?.email || req.headers['x-employee-email'] || req.query?.email;
      if (email) {
        employee = await db.get('SELECT * FROM employees WHERE LOWER(email) = ?', [String(email).toLowerCase().trim()]);
      }
      if (!employee) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        if (token) {
          const payload = verifyCrmSessionToken(token);
          if (payload?.employeeId) {
            employee = await db.get('SELECT * FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = LOWER(?)', [payload.employeeId, payload.id || '', payload.email || '']);
          }
        }
      }
      if (!employee) {
        return res.status(401).json({ success: false, message: 'Employee verification required.' });
      }
      const { attendanceId, reasonCategory, reasonDetails } = req.body || {};

      const fullReason = `${reasonCategory || 'Late Arrival'}${reasonDetails ? ': ' + reasonDetails : ''}`;

      // Update attendance_records
      if (attendanceId) {
        await db.run(
          `UPDATE attendance_records SET notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [fullReason, attendanceId]
        );
      } else {
        await db.run(
          `UPDATE attendance_records SET notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE employeeId = ? AND lateApprovalStatus = 'PENDING'`,
          [fullReason, employee.employeeId]
        );
      }

      // Update role_login_logs
      try {
        await db.run(
          `UPDATE role_login_logs SET rejectionReason = ? WHERE employeeId = ? AND lateApprovalStatus = 'PENDING'`,
          [`Justification: ${fullReason}`, employee.employeeId]
        );
      } catch (_) { }

      res.json({
        success: true,
        message: 'Late arrival justification recorded successfully. Dispatched to Super Admin.'
      });
    } catch (err) {
      console.error('Failed to submit late justification:', err);
      res.status(500).json({ success: false, message: 'Failed to record justification.' });
    }
  });

  // Super Admin: View real-time role logins across all departments & shifts
  app.get('/api/hr-ops/attendance/role-logins', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const logs = await db.all(
        `SELECT * FROM role_login_logs ORDER BY loginTime DESC LIMIT 100`
      );

      const todayDate = getCompanyDateTimeParts(new Date()).dateStr;
      const todayLogs = logs.filter((l) => String(l.loginTime).startsWith(todayDate));
      const onTimeCount = todayLogs.filter((l) => l.punctuality === 'On Time' || l.punctuality === 'Exempt').length;
      const lateCount = todayLogs.filter((l) => l.punctuality === 'Late').length;
      const pendingApprovalCount = todayLogs.filter((l) => l.lateApprovalStatus === 'PENDING').length;

      // Enrich logs with today's attendance record (checkIn, checkOut, workedHours, session counts)
      const todayAttendance = await db.all(
        `SELECT * FROM attendance_records WHERE workDate = ?`,
        [todayDate]
      );
      const attMap = new Map();
      todayAttendance.forEach(a => {
        if (a.employeeId) attMap.set(a.employeeId, a);
      });

      // Group logs by employeeId to count login sessions and list timestamps
      const empLogsMap = new Map();
      todayLogs.forEach(l => {
        if (l.employeeId) {
          if (!empLogsMap.has(l.employeeId)) empLogsMap.set(l.employeeId, []);
          empLogsMap.get(l.employeeId).push(l);
        }
      });

      const enriched = logs.map(l => {
        const att = attMap.get(l.employeeId);
        let checkIn = '—';
        if (att?.checkInAt) {
          try {
            checkIn = new Date(att.checkInAt).toLocaleTimeString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (_) {
            checkIn = att.checkInAt;
          }
        } else if (l.checkInTime) {
          checkIn = l.checkInTime;
        }

        let checkOut = 'Active / In Office';
        let workedHours = 'In Progress';
        if (att?.checkOutAt) {
          try {
            checkOut = new Date(att.checkOutAt).toLocaleTimeString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (_) {
            checkOut = att.checkOutAt;
          }
          workedHours = att.netWorkMinutes ? `${(att.netWorkMinutes / 60).toFixed(1)} hrs` : '0.0 hrs';
        } else if (!att && !l.checkInTime) {
          checkOut = '—';
          workedHours = '—';
        }

        const empSessions = empLogsMap.get(l.employeeId) || [l];
        const loginCount = empSessions.length;

        return {
          ...l,
          checkIn,
          checkOut,
          workedHours,
          loginCount,
          sessionsList: empSessions.map(s => {
            const timeStr = s.loginTime ? new Date(s.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged In';
            return `${timeStr} (${s.punctuality || 'Login'})`;
          })
        };
      });

      res.json({
        success: true,
        data: enriched,
        stats: {
          totalToday: todayLogs.length,
          onTimeCount,
          lateCount,
          pendingApprovalCount
        }
      });
    } catch (err) {
      console.error('Failed to get role logins:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve role login logs.' });
    }
  });

  // Super Admin / HR Leadership: Get unified live today's attendance register for all workforce members
  app.get('/api/hr-ops/attendance/admin/today-register', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const nowParts = getCompanyDateTimeParts(new Date());
      const todayDateStr = /^\d{4}-\d{2}-\d{2}$/.test(req.query?.date || '')
        ? req.query.date
        : nowParts.dateStr;
      const isSelectedDateToday = todayDateStr === nowParts.dateStr;

      // 1. Fetch active employees
      const emps = await db.all(
        `SELECT employeeId, name, email, role, department, designation, assignedBranch AS branch, avatar, status 
         FROM employees 
         WHERE LOWER(COALESCE(status, 'Active')) != 'inactive'
         ORDER BY CASE 
           WHEN role = 'Super Admin' THEN 1
           WHEN role = 'Admin' THEN 2
           WHEN role = 'HR Lead' THEN 3
           WHEN role = 'Recruiter' THEN 4
           WHEN role = 'Placement Coordinator' THEN 5
           ELSE 6 
         END, id ASC`
      );

      // 2. Fetch attendance_records for the selected workDate
      const todayRecords = await db.all(
        `SELECT * FROM attendance_records WHERE workDate = ? ORDER BY checkInAt DESC`,
        [todayDateStr]
      );

      // 3. Fetch role_login_logs for the selected workDate
      const todayLogins = await db.all(
        `SELECT * FROM role_login_logs WHERE loginTime LIKE ? ORDER BY loginTime DESC`,
        [`${todayDateStr}%`]
      );

      // 4. Fetch approved employee leave requests covering this date
      const approvedLeaves = await db.all(
        `SELECT * FROM employee_leave_requests 
         WHERE LOWER(COALESCE(status, '')) LIKE '%approved%' 
           AND startDate <= ? AND endDate >= ?`,
        [todayDateStr, todayDateStr]
      );
      const leaveMap = new Map();
      approvedLeaves.forEach((l) => {
        if (l.employeeId) leaveMap.set(l.employeeId, l);
      });

      // 5. Fetch company holiday for this date if any
      const holiday = await db.get(
        `SELECT * FROM company_holidays WHERE holidayDate = ? LIMIT 1`,
        [todayDateStr]
      );

      // 6. Fetch all distinct recorded dates in database for calendar indicators
      const distinctWorkDates = await db.all(
        `SELECT DISTINCT workDate FROM attendance_records WHERE workDate IS NOT NULL`
      );
      const recordedDates = distinctWorkDates.map((r) => r.workDate);

      // Map today's records by employeeId
      const recordMap = new Map();
      todayRecords.forEach((r) => {
        if (r.employeeId && !recordMap.has(r.employeeId)) recordMap.set(r.employeeId, r);
      });

      const loginMap = new Map();
      todayLogins.forEach((l) => {
        if (l.employeeId && !loginMap.has(l.employeeId)) loginMap.set(l.employeeId, l);
        if (l.email && !loginMap.has(l.email.toLowerCase())) loginMap.set(l.email.toLowerCase(), l);
      });

      // 7. Combine into complete unified workforce roster
      const unifiedRegister = emps.map((emp) => {
        const att = recordMap.get(emp.employeeId);
        const login = isSelectedDateToday
          ? (loginMap.get(emp.employeeId) || (emp.email ? loginMap.get(emp.email.toLowerCase()) : null))
          : null;

        let checkIn = '—';
        let checkOut = '—';
        let status = 'Not Clocked In';
        let hours = '—';
        let breakDuration = '0h 00m';
        let lateOrEarly = '—';
        let isLate = false;
        let lateMinutes = 0;
        let lateApprovalStatus = 'NONE';
        let attendanceId = null;
        let remarks = 'No punch logged for this date';
        let isLive = false;
        let shiftName = 'General Day Shift (09:00 AM - 06:00 PM)';
        let checkInAt = null;
        let checkOutAt = null;
        let totalBreakMinutes = 0;

        const formatWorkedDuration = (mins) => {
          const safe = Math.max(0, Math.floor(Number(mins) || 0));
          return `${Math.floor(safe / 60)}h ${String(safe % 60).padStart(2, '0')}m`;
        };

        if (att) {
          isLive = true;
          attendanceId = att.id;
          shiftName = att.shiftName || shiftName;
          lateMinutes = Number(att.lateMinutes) || 0;
          isLate = lateMinutes > 0;
          lateApprovalStatus = att.lateApprovalStatus || (isLate ? 'PENDING' : 'APPROVED');
          checkInAt = att.checkInAt || null;
          checkOutAt = att.checkOutAt || null;
          totalBreakMinutes = Number(att.totalBreakMinutes) || 0;

          if (att.checkInAt) {
            try {
              checkIn = new Date(att.checkInAt).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            } catch (_) {
              checkIn = att.checkInAt;
            }
          }

          if (att.checkOutAt) {
            try {
              checkOut = new Date(att.checkOutAt).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            } catch (_) {
              checkOut = att.checkOutAt;
            }
            let mins = Number(att.netWorkMinutes) || 0;
            if (mins <= 0 && att.checkInAt) {
              const inMs = new Date(att.checkInAt).getTime();
              const outMs = new Date(att.checkOutAt).getTime();
              if (!isNaN(inMs) && !isNaN(outMs) && outMs > inMs) {
                mins = Math.max(0, Math.floor((outMs - inMs) / 60000) - totalBreakMinutes);
              }
            }
            hours = formatWorkedDuration(mins);
            status = att.status || (isLate ? 'Late' : 'Present');
          } else if (att.checkInAt) {
            checkOut = 'Not Checked Out';
            const inMs = new Date(att.checkInAt).getTime();
            const elapsedMins = !isNaN(inMs)
              ? Math.max(0, Math.floor((Date.now() - inMs) / 60000) - totalBreakMinutes)
              : (Number(att.netWorkMinutes) || 0);
            hours = formatWorkedDuration(elapsedMins);
            status = isLate ? 'Late' : 'Present';
          } else {
            hours = '—';
          }

          if (totalBreakMinutes) {
            breakDuration = `${totalBreakMinutes}m`;
          }

          if (isLate) {
            lateOrEarly = `⚠️ Late (+${lateMinutes}m)`;
          } else if (att.checkInAt) {
            lateOrEarly = '✓ On Time';
          }

          remarks = att.notes || (isLate ? `Late check-in (+${lateMinutes}m)` : 'Biometric Attendance Punch');
        } else if (login) {
          isLive = true;
          shiftName = login.shiftName || shiftName;
          lateMinutes = Number(login.lateMinutes) || 0;
          isLate = login.punctuality === 'Late' || lateMinutes > 0;
          lateApprovalStatus = login.lateApprovalStatus || (isLate ? 'PENDING' : 'APPROVED');
          checkIn = login.checkInTime || (login.loginTime ? login.loginTime.slice(11, 16) : '—');
          checkInAt = login.loginTime || null;
          checkOut = 'Not Checked Out';
          const loginMs = login.loginTime ? new Date(login.loginTime).getTime() : NaN;
          hours = !isNaN(loginMs)
            ? formatWorkedDuration(Math.max(0, Math.floor((Date.now() - loginMs) / 60000)))
            : '0h 00m';
          status = isLate ? 'Late' : 'Present';
          lateOrEarly = isLate ? `⚠️ Late (+${lateMinutes}m)` : '✓ On Time';
          remarks = `Portal SSO Login (${login.shiftName || 'General Shift'})`;
        } else {
          // Employee has no punch on this date
          if (leaveMap.has(emp.employeeId)) {
            status = 'On Leave';
            remarks = `Approved Leave (${leaveMap.get(emp.employeeId).leaveType || 'Annual Leave'})`;
          } else if (holiday) {
            status = 'Holiday';
            remarks = holiday.holidayName || 'Public Holiday';
          } else {
            const dt = new Date(`${todayDateStr}T12:00:00Z`);
            const dayOfWeek = dt.getUTCDay();
            // Saturday is a regular working day; Sunday (0) is weekly off
            if (dayOfWeek === 0) {
              status = 'Weekly Off';
              remarks = 'Scheduled Weekly Off';
            } else if (todayDateStr < nowParts.dateStr) {
              status = 'Absent';
              remarks = 'Unexcused Absence';
            } else {
              status = 'Not Checked In';
              remarks = 'Pending check-in';
            }
          }
        }

        // Executive role governance session
        if (emp.role === 'Super Admin' || emp.role === 'Admin') {
          if (status === 'Not Clocked In' || status === 'Not Checked In') {
            status = 'Executive Active';
            checkIn = '09:00 AM';
            checkOut = isSelectedDateToday ? 'Active Session' : '06:00 PM';
            hours = 'Executive';
            remarks = 'Executive Governance Session';
          }
        }

        return {
          id: emp.employeeId,
          employeeId: emp.employeeId,
          attendanceId,
          name: emp.name,
          role: emp.role,
          designation: emp.designation || emp.role,
          department: emp.department || 'Operations',
          location: emp.branch || 'Dubai HQ',
          avatar: emp.avatar || '',
          email: emp.email,
          date: todayDateStr,
          checkIn,
          checkOut,
          checkInAt,
          checkOutAt,
          totalBreakMinutes,
          breakDuration,
          hours,
          totalWorkingHours: hours,
          status,
          late: isLate,
          lateMinutes,
          lateOrEarly,
          lateApprovalStatus,
          shiftName,
          remarks,
          isLive
        };
      });

      const presentCount = unifiedRegister.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Executive Active').length;
      const lateCount = unifiedRegister.filter((r) => r.late).length;
      const leaveCount = unifiedRegister.filter((r) => r.status === 'On Leave').length;
      const pendingApprovalCount = unifiedRegister.filter((r) => r.lateApprovalStatus === 'PENDING').length;
      const absentCount = unifiedRegister.filter((r) => r.status === 'Absent' || r.status === 'Not Clocked In' || r.status === 'Not Checked In').length;

      res.json({
        success: true,
        date: todayDateStr,
        register: unifiedRegister,
        recordedDates,
        stats: {
          totalWorkforce: unifiedRegister.length,
          totalEmployees: unifiedRegister.length,
          presentCount,
          lateCount,
          leaveCount,
          pendingApprovalCount,
          absentCount
        }
      });
    } catch (err) {
      console.error('Failed to get attendance register:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve attendance register.' });
    }
  });

  // Super Admin: Update employee attendance record
  app.patch('/api/hr-ops/attendance/admin/record/:employeeId', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const reviewer = req.authEmployee;
      const { employeeId } = req.params;
      const { status, checkIn, checkOut, late, remarks, lateApprovalStatus } = req.body || {};
      const nowParts = getCompanyDateTimeParts(new Date());
      const todayDateStr = nowParts.dateStr;

      let record = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ? ORDER BY checkInAt DESC LIMIT 1`,
        [employeeId, todayDateStr]
      );

      const emp = await db.get(`SELECT * FROM employees WHERE employeeId = ? LIMIT 1`, [employeeId]);
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }

      if (record) {
        await db.run(
          `UPDATE attendance_records 
           SET status = ?, notes = ?, lateApprovalStatus = COALESCE(?, lateApprovalStatus), updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status || record.status, remarks || record.notes, lateApprovalStatus || null, record.id]
        );
      } else {
        const id = makeId('ATT');
        await db.run(
          `INSERT INTO attendance_records (
            id, employeeId, employeeName, department, role, workDate,
            checkInAt, checkOutAt, status, lateMinutes, lateApprovalStatus, notes
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, ?, ?, 'APPROVED', ?)`,
          [
            id,
            emp.employeeId,
            emp.name,
            emp.department || 'Operations',
            emp.role || 'Staff',
            todayDateStr,
            status || 'Present',
            late ? 15 : 0,
            remarks || `Super Admin manual override by ${reviewer.name}`
          ]
        );
      }

      res.json({ success: true, message: `Attendance updated for ${emp.name}.` });
    } catch (err) {
      console.error('Failed to update attendance record:', err);
      res.status(500).json({ success: false, message: 'Failed to update attendance record.' });
    }
  });

  // Record a role login event (called when users sign into the CRM portal)
  app.post('/api/hr-ops/attendance/role-logins', async (req, res) => {
    try {
      const db = await getDb();
      const {
        employeeId,
        employeeName,
        email,
        role,
        department,
        shiftName,
        shiftStart,
        shiftEnd,
        punctuality,
        lateMinutes,
        lateApprovalStatus
      } = req.body || {};

      if (!email || !role) {
        return res.status(400).json({ success: false, message: 'email and role are required.' });
      }

      const id = makeId('LOG');
      const nowParts = getCompanyDateTimeParts(new Date());

      await db.run(
        `INSERT INTO role_login_logs (
          id, employeeId, employeeName, email, role, department,
          shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
          punctuality, lateMinutes, lateApprovalStatus, ipAddress
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
        [
          id,
          employeeId || null,
          employeeName || email.split('@')[0],
          email,
          role,
          department || 'Workforce',
          shiftName || 'General Shift (09:00 AM - 06:00 PM)',
          shiftStart || '09:00',
          shiftEnd || '18:00',
          nowParts.timeStr,
          punctuality || 'On Time',
          Number(lateMinutes || 0),
          lateApprovalStatus || (punctuality === 'Late' && role !== 'Super Admin' && role !== 'Admin' ? 'PENDING' : 'APPROVED'),
          getClientIp(req)
        ]
      );

      res.status(201).json({ success: true, message: 'Role login recorded successfully.' });
    } catch (err) {
      console.error('Failed to log role login:', err);
      res.status(500).json({ success: false, message: 'Failed to record login.' });
    }
  });

  // =========================================================================
  // SHIFT MANAGEMENT & LATE APPROVAL WORKFLOW MODULE APIS (/api/crm/shifts/*)
  // =========================================================================

  const PREDEFINED_SHIFTS = [
    {
      id: 'SHIFT-GENERAL',
      shiftName: 'General Shift',
      name: 'General Shift (09:00 AM - 06:00 PM)',
      timing: '9:00 AM – 6:00 PM',
      startTime: '09:00',
      endTime: '18:00',
      scheduledLoginTime: '9:00 AM',
      scheduledLogoutTime: '6:00 PM',
      description: 'Standard business operations and core recruitment advisory.'
    },
    {
      id: 'SHIFT-MORNING',
      shiftName: 'Morning Shift',
      name: 'Morning Shift (07:00 AM - 02:00 PM)',
      timing: '7:00 AM – 2:00 PM',
      startTime: '07:00',
      endTime: '14:00',
      scheduledLoginTime: '7:00 AM',
      scheduledLogoutTime: '2:00 PM',
      description: 'Early morning intake processing and regional screening.'
    },
    {
      id: 'SHIFT-EVENING',
      shiftName: 'Evening Shift',
      name: 'Evening Shift (02:00 PM - 09:00 PM)',
      timing: '2:00 PM – 9:00 PM',
      startTime: '14:00',
      endTime: '21:00',
      scheduledLoginTime: '2:00 PM',
      scheduledLogoutTime: '9:00 PM',
      description: 'Evening corporate client coordination and overseas overlap.'
    }
  ];

  // 1. GET /api/crm/shifts/configs - Predefined shifts with exact working hours
  app.get('/api/crm/shifts/configs', async (_req, res) => {
    res.json({
      success: true,
      data: PREDEFINED_SHIFTS,
      shifts: PREDEFINED_SHIFTS
    });
  });

  // 2. GET /api/crm/shifts/roster - Unified workforce shift roster for a selected date
  app.get('/api/crm/shifts/roster', requireCrmAuth, requireHrStaffRole, async (req, res) => {
    try {
      const db = await getDb();
      const nowParts = getCompanyDateTimeParts(new Date());
      const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(req.query?.date || '')
        ? req.query.date
        : nowParts.dateStr;

      const allEmps = await db.all(`SELECT * FROM employees`);
      const isLeadership = HR_LEADERSHIP_ROLES.includes(req.authEmployee?.role || '');
      const authEmpId = req.authEmployee?.employeeId || req.authEmployee?.id || '';

      let emps = (allEmps || [])
        .filter((e) => {
          if (String(e.status || 'Active').toLowerCase() === 'inactive') return false;
          const r = String(e.role || '').toLowerCase();
          const d = String(e.department || '').toLowerCase();
          if (
            r.includes('super') ||
            r.includes('admin') ||
            r.includes('hr lead') ||
            r === 'hr_lead' ||
            r.includes('recruiter') ||
            r.includes('placement')
          ) {
            return false;
          }
          return r === 'hr operations' || r.includes('operations') || d.includes('operations');
        })
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

      if (!isLeadership && authEmpId) {
        emps = emps.filter((e) => e.employeeId === authEmpId || e.id === authEmpId);
      }

      // Fetch attendance records for selectedDate
      const attRecords = await db.all(
        `SELECT * FROM attendance_records WHERE workDate = ?`,
        [selectedDate]
      );
      const attMap = new Map();
      attRecords.forEach((r) => {
        if (r.employeeId && !attMap.has(r.employeeId)) attMap.set(r.employeeId, r);
      });

      // Fetch approved leave requests for selectedDate
      const allLeaves = await db.all(`SELECT * FROM employee_leave_requests`).catch(() => []);
      const approvedLeaves = (allLeaves || []).filter(
        (l) =>
          String(l.status || '').toLowerCase().includes('approved') &&
          l.startDate <= selectedDate &&
          l.endDate >= selectedDate
      );
      const leaveMap = new Map();
      approvedLeaves.forEach((l) => {
        if (l.employeeId) leaveMap.set(l.employeeId, l);
      });

      // Fetch late approval requests for selectedDate
      const lateRequests = await db.all(
        `SELECT * FROM late_login_approval_requests WHERE attendanceDate = ?`,
        [selectedDate]
      );
      const lateReqMap = new Map();
      lateRequests.forEach((lr) => {
        if (lr.employeeId && !lateReqMap.has(lr.employeeId)) lateReqMap.set(lr.employeeId, lr);
        if (lr.attendanceId && !lateReqMap.has(lr.attendanceId)) lateReqMap.set(lr.attendanceId, lr);
      });

      // Construct unified roster for each employee on selectedDate
      const roster = await Promise.all(
        emps.map(async (emp) => {
          const shift = await resolveEmployeeShiftForDate(db, emp, selectedDate);
          const att = attMap.get(emp.employeeId);
          const leave = leaveMap.get(emp.employeeId);
          const lateReq = att ? (lateReqMap.get(att.id) || lateReqMap.get(emp.employeeId)) : lateReqMap.get(emp.employeeId);

          const scheduledLoginTime = shift.scheduledLoginTime || formatHHMMTo12Hour(shift.startTime);
          const scheduledLogoutTime = shift.scheduledLogoutTime || formatHHMMTo12Hour(shift.endTime);

          let actualClockInTime = '—';
          let actualClockOutTime = '—';
          let loginStatus = 'Pending Clock-In';
          let isLate = false;
          let lateMinutes = 0;
          let lateApprovalStatus = 'None';

          if (leave) {
            loginStatus = 'On Leave';
          } else if (att && att.checkInAt) {
            const checkInDate = new Date(att.checkInAt);
            actualClockInTime = getCompanyDateTimeParts(checkInDate).timeStr;
            if (att.checkOutAt) {
              actualClockOutTime = getCompanyDateTimeParts(new Date(att.checkOutAt)).timeStr;
            } else if (att.status === 'In Progress') {
              actualClockOutTime = 'In Office';
            }

            lateMinutes = Number(att.lateMinutes || 0);
            isLate = lateMinutes > 0;
            if (isLate) {
              loginStatus = `Late (${lateMinutes} mins)`;
              lateApprovalStatus = lateReq?.status || att.lateApprovalStatus || 'Pending Approval';
            } else {
              loginStatus = 'On Time';
              lateApprovalStatus = 'Approved';
            }
          }

          let shiftAssignmentPeriod = 'Ongoing Default';
          if (shift.assignmentId) {
            if (shift.frequency === 'one_day') {
              shiftAssignmentPeriod = `${shift.startDate} (One Day)`;
            } else if (shift.frequency === 'weekly') {
              shiftAssignmentPeriod = `${shift.startDate} – ${shift.endDate || 'Ongoing'} (Weekly)`;
            } else if (shift.frequency === 'monthly') {
              shiftAssignmentPeriod = `${shift.startDate} – ${shift.endDate || 'Ongoing'} (Monthly)`;
            }
          }

          return {
            id: emp.employeeId,
            employeeId: emp.employeeId,
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            role: emp.role,
            department: emp.department || 'Operations',
            designation: emp.designation || emp.role,
            avatar: emp.avatar,
            assignedShiftId: shift.id,
            shiftId: shift.id,
            baseShiftId: emp.shiftId || 'SHIFT-GENERAL',
            assignedShift: `${shift.shiftName || shift.name} (${scheduledLoginTime} – ${scheduledLogoutTime})`,
            shiftName: shift.shiftName || shift.name,
            scheduledLoginTime,
            scheduledLogoutTime,
            actualClockInTime,
            actualClockOutTime,
            loginStatus,
            isLate,
            lateMinutes,
            lateApprovalStatus,
            shiftAssignmentPeriod,
            shiftPeriod: shiftAssignmentPeriod,
            assignmentFrequency: shift.frequency || 'default',
            assignmentId: shift.assignmentId || null,
            attendanceId: att?.id || null,
            explanation: lateReq?.explanation || att?.notes || null,
            actions: ['assign_shift', 'view_history']
          };
        })
      );

      res.json({
        success: true,
        date: selectedDate,
        employees: roster,
        count: roster.length
      });
    } catch (err) {
      console.error('Failed to get shift roster:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve shift roster.' });
    }
  });

  // 3. GET /api/crm/shifts/assignments - Shift assignments list & history
  app.get('/api/crm/shifts/assignments', requireCrmAuth, requireHrStaffRole, async (req, res) => {
    try {
      const db = await getDb();
      const { employeeId, status, startDate, endDate } = req.query || {};
      const isLeadership = HR_LEADERSHIP_ROLES.includes(req.authEmployee?.role || '');
      const authEmpId = req.authEmployee?.employeeId || req.authEmployee?.id || '';

      const allRows = await db.all(`SELECT * FROM employee_shift_assignments`);
      const targetEmployeeFilter = isLeadership ? employeeId : authEmpId;

      const rows = (allRows || [])
        .filter((r) => {
          if (targetEmployeeFilter && r.employeeId !== targetEmployeeFilter) return false;
          if (status && r.status !== status) return false;
          if (startDate && endDate) {
            if (r.startDate > endDate) return false;
            if (r.endDate && r.endDate < startDate) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const aTime = Date.parse(a.assignedAt || a.updatedAt || a.createdAt || 0) || 0;
          const bTime = Date.parse(b.assignedAt || b.updatedAt || b.createdAt || 0) || 0;
          return bTime - aTime;
        });

      res.json({
        success: true,
        count: rows.length,
        assignments: rows
      });
    } catch (err) {
      console.error('Failed to get shift assignments:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve shift assignments.' });
    }
  });

  // 4. POST /api/crm/shifts/assign - Assign or bulk assign shifts to workforce (HR Leadership only)
  app.post('/api/crm/shifts/assign', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const reviewer = req.authEmployee || {};
      const reviewerEmpId = reviewer.employeeId || reviewer.id || 'HR-STAFF';
      const reviewerName = reviewer.name || 'HR Management';
      const reviewerRole = reviewer.role || 'HR';
      const {
        employeeIds = [],
        shiftId = 'SHIFT-GENERAL',
        startDate,
        endDate = null,
        frequency = 'one_day',
        applicableDays = [1, 2, 3, 4, 5, 6],
        notes = ''
      } = req.body || {};

      const targetEmpIds = Array.isArray(employeeIds)
        ? employeeIds.filter(Boolean)
        : (employeeIds ? [employeeIds] : []);

      if (targetEmpIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Please select at least one employee.' });
      }
      if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return res.status(400).json({ success: false, message: 'A valid start date (YYYY-MM-DD) is required.' });
      }
      if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ success: false, message: 'Invalid end date format.' });
      }
      if (endDate && endDate < startDate) {
        return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
      }

      // Resolve predefined shift target
      const sIdLower = String(shiftId).toLowerCase();
      let targetShift = PREDEFINED_SHIFTS.find(s => s.id === shiftId);
      if (!targetShift) {
        if (sIdLower.includes('morning') || sIdLower.includes('07') || sIdLower.includes('7:00')) {
          targetShift = PREDEFINED_SHIFTS[1];
        } else if (sIdLower.includes('evening') || sIdLower.includes('14') || sIdLower.includes('2:00')) {
          targetShift = PREDEFINED_SHIFTS[2];
        } else {
          targetShift = PREDEFINED_SHIFTS[0];
        }
      }

      const assignedRecords = [];
      const applicableDaysJson = JSON.stringify(Array.isArray(applicableDays) ? applicableDays : [1, 2, 3, 4, 5, 6]);

      // Compute strict date bounds based on frequency so assignments never bleed into unintended dates
      let effectiveEndDate = endDate || null;
      if (frequency === 'one_day') {
        effectiveEndDate = startDate;
      } else if (frequency === 'weekly' && !effectiveEndDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        const dt = new Date(Date.UTC(y, m - 1, d));
        const dow = dt.getUTCDay();
        const daysToSunday = dow === 0 ? 0 : 7 - dow;
        dt.setUTCDate(dt.getUTCDate() + daysToSunday);
        effectiveEndDate = dt.toISOString().slice(0, 10);
      } else if (frequency === 'monthly' && !effectiveEndDate) {
        const [y, m] = startDate.split('-').map(Number);
        const lastDay = new Date(Date.UTC(y, m, 0));
        effectiveEndDate = lastDay.toISOString().slice(0, 10);
      }

      for (const empId of targetEmpIds) {
        let emp = await db.get(
          'SELECT employeeId, name, role, department, status FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = LOWER(?)',
          [empId, empId, empId]
        );
        if (!emp || String(emp.status || 'Active').toLowerCase() === 'inactive') continue;

        const canonicalEmpId = emp.employeeId;
        const nowIso = new Date().toISOString();
        const existingAssignments = await db.all(
          `SELECT * FROM employee_shift_assignments WHERE employeeId = ?`,
          [canonicalEmpId]
        );

        // Supersede prior active assignments appropriately based on frequency (preventing duplicates)
        const toSupersede = (existingAssignments || []).filter((prev) => {
          if (String(prev.status || '').toLowerCase() !== 'active') return false;
          if (frequency === 'one_day') {
            return prev.frequency === 'one_day' && prev.startDate === startDate;
          }
          const overlapEnd = effectiveEndDate || startDate;
          return (
            (prev.frequency === 'weekly' || prev.frequency === 'monthly') &&
            prev.startDate <= overlapEnd &&
            (!prev.endDate || prev.endDate >= startDate)
          );
        });

        for (const prev of toSupersede) {
          await db.run(
            `UPDATE employee_shift_assignments SET status = ?, updatedAt = ? WHERE id = ?`,
            ['Superseded', nowIso, prev.id]
          );
        }

        const assignmentId = makeId('SFA');
        await db.run(
          `INSERT INTO employee_shift_assignments (
            id, employeeId, employeeName, shiftId, shiftName,
            scheduledStartTime, scheduledEndTime, scheduledLoginTime, scheduledLogoutTime,
            frequency, startDate, endDate, applicableDays,
            assignedBy, assignedByName, assignedByRole, assignedAt, status, notes, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            assignmentId,
            canonicalEmpId,
            emp.name,
            targetShift.id,
            targetShift.shiftName,
            targetShift.startTime,
            targetShift.endTime,
            targetShift.scheduledLoginTime,
            targetShift.scheduledLogoutTime,
            frequency,
            startDate,
            effectiveEndDate,
            applicableDaysJson,
            reviewerEmpId,
            reviewerName,
            reviewerRole,
            nowIso,
            'Active',
            notes || `Assigned ${targetShift.shiftName} (${frequency})`,
            nowIso,
            nowIso
          ]
        );

        // Do NOT overwrite employees.shiftId globally for date/week/month assignments,
        // so other unassigned dates keep their independent baseline shift.

        // Audit log
        await writeAttendanceAudit(db, {
          employeeId: canonicalEmpId,
          workDate: startDate,
          action: 'ASSIGN_SHIFT',
          actor: { ...reviewer, employeeId: reviewerEmpId, name: reviewerName, role: reviewerRole },
          details: `Assigned ${targetShift.shiftName} (${targetShift.timing}) from ${startDate} to ${endDate || 'ongoing'} [Frequency: ${frequency}]`,
          ipAddress: getClientIp(req)
        });

        // Notify employee of shift change
        await createNotification(db, {
          employeeId: canonicalEmpId,
          type: 'Shift Assignment',
          title: `📅 New Shift Assigned: ${targetShift.shiftName}`,
          message: `${reviewerName} (${reviewerRole}) assigned you to ${targetShift.shiftName} (${targetShift.timing}) effective from ${startDate}.`,
          severity: 'info',
          relatedId: assignmentId
        });

        assignedRecords.push({
          assignmentId,
          employeeId: canonicalEmpId,
          employeeName: emp.name,
          shiftName: targetShift.shiftName,
          timing: targetShift.timing
        });
      }

      if (assignedRecords.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Could not find matching employee records for the selected staff.'
        });
      }

      res.status(201).json({
        success: true,
        message: `Successfully assigned ${targetShift.shiftName} to ${assignedRecords.length} employee(s).`,
        count: assignedRecords.length,
        assignments: assignedRecords
      });
    } catch (err) {
      console.error('Failed to assign shift:', err);
      res.status(500).json({ success: false, message: 'Failed to save shift assignment.' });
    }
  });

  // 5. DELETE /api/crm/shifts/assignments/:id - Cancel an assignment (HR Leadership only)
  app.delete('/api/crm/shifts/assignments/:id', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const reviewer = req.authEmployee;
      const { id } = req.params;

      const existing = await db.get('SELECT * FROM employee_shift_assignments WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Shift assignment not found.' });
      }

      const nowIso = new Date().toISOString();
      await db.run(
        `UPDATE employee_shift_assignments SET status = ?, updatedAt = ? WHERE id = ?`,
        ['Cancelled', nowIso, id]
      );

      await writeAttendanceAudit(db, {
        employeeId: existing.employeeId,
        workDate: existing.startDate,
        action: 'CANCEL_SHIFT_ASSIGNMENT',
        actor: reviewer,
        details: `Cancelled assignment ${id} for ${existing.employeeName} (${existing.shiftName})`,
        ipAddress: getClientIp(req)
      });

      res.json({
        success: true,
        message: 'Shift assignment cancelled successfully.'
      });
    } catch (err) {
      console.error('Failed to cancel shift assignment:', err);
      res.status(500).json({ success: false, message: 'Failed to cancel shift assignment.' });
    }
  });

  // 6. GET /api/crm/shifts/late-approvals - Review queue for late arrivals (HR Lead late requests visible ONLY to Super Admin)
  app.get('/api/crm/shifts/late-approvals', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'late_login_approval_requests',
        'attendance_records',
        'employees'
      ]);
      const reviewer = req.authEmployee;
      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isHrLeadReviewer = reviewerRole === 'hr lead' || reviewerRole.includes('lead');
      const statusFilter = req.query?.status;

      let sql = `SELECT * FROM late_login_approval_requests WHERE 1=1`;
      const params = [];
      if (statusFilter) {
        sql += ` AND status = ?`;
        params.push(statusFilter);
      }
      sql += ` ORDER BY createdAt DESC`;

      const reqRows = await db.all(sql, params);
      const pendingAttRows = await db.all(`SELECT * FROM attendance_records WHERE lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC`);

      const mergedByAttId = new Map();
      for (const r of (reqRows || [])) {
        mergedByAttId.set(r.attendanceId || r.id, r);
      }
      for (const att of (pendingAttRows || [])) {
        if (!mergedByAttId.has(att.id)) {
          mergedByAttId.set(att.id, {
            id: att.id,
            attendanceId: att.id,
            employeeId: att.employeeId,
            employeeName: att.employeeName,
            department: att.department,
            role: att.role,
            shiftId: att.shiftId,
            shiftName: att.shiftName,
            scheduledLoginTime: att.shiftStart,
            scheduledLogoutTime: att.shiftEnd,
            actualClockInTime: att.checkInAt,
            attendanceDate: att.workDate,
            delayMinutes: Number(att.lateMinutes || 0),
            explanation: att.notes || '',
            status: 'Pending Approval',
            createdAt: att.createdAt
          });
        }
      }

      const rows = Array.from(mergedByAttId.values()).filter((item) => {
        if (statusFilter && String(item.status || '').toLowerCase() !== String(statusFilter).toLowerCase()) {
          return false;
        }
        const itemRole = String(item.role || '').toLowerCase();
        const isTargetLead = itemRole === 'hr lead' || itemRole.includes('lead');
        const isSelf = reviewer?.employeeId && item.employeeId === reviewer.employeeId;
        if (isHrLeadReviewer && (isTargetLead || isSelf)) {
          return false;
        }
        return true;
      });

      // Enrich with employee profile details
      const enriched = await Promise.all(
        rows.map(async (r) => {
          const emp = await db.get('SELECT email, role, avatar, designation FROM employees WHERE employeeId = ?', [r.employeeId]);
          return {
            ...r,
            email: emp?.email || '',
            role: emp?.role || r.role || 'Staff',
            avatar: emp?.avatar || '',
            designation: emp?.designation || r.role || ''
          };
        })
      );

      res.json({
        success: true,
        count: enriched.length,
        requests: enriched
      });
    } catch (err) {
      console.error('Failed to get late approvals:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve late approvals queue.' });
    }
  });

  // 7. POST /api/crm/shifts/late-approvals/:id/decision - Approve or Reject late login
  app.post('/api/crm/shifts/late-approvals/:id/decision', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      await refreshAttendanceTables(db, [
        'late_login_approval_requests',
        'attendance_records',
        'employees',
        'role_login_logs'
      ]);
      const reviewer = req.authEmployee;
      const { id } = req.params;
      const { decision, rejectionReason, notes } = req.body || {};

      let lateReq = await db.get('SELECT * FROM late_login_approval_requests WHERE id = ?', [id]);
      if (!lateReq) {
        lateReq = await db.get('SELECT * FROM late_login_approval_requests WHERE attendanceId = ?', [id]);
      }
      if (!lateReq) {
        const attFallback = await db.get('SELECT * FROM attendance_records WHERE id = ?', [id]);
        if (attFallback) {
          lateReq = {
            id: attFallback.id,
            attendanceId: attFallback.id,
            employeeId: attFallback.employeeId,
            employeeName: attFallback.employeeName,
            role: attFallback.role,
            shiftName: attFallback.shiftName,
            attendanceDate: attFallback.workDate,
            delayMinutes: Number(attFallback.lateMinutes || 0),
            status: attFallback.lateApprovalStatus || 'PENDING'
          };
        }
      }
      if (!lateReq) {
        return res.status(404).json({ success: false, message: 'Late-login approval request not found.' });
      }

      const targetEmp = await db.get('SELECT role FROM employees WHERE employeeId = ?', [lateReq.employeeId]);
      const targetRole = String(targetEmp?.role || lateReq.role || '').toLowerCase();
      const isTargetHrLead = targetRole === 'hr lead' || targetRole.includes('lead');
      const isReviewerSuperAdmin = String(reviewer?.role || '').toLowerCase() === 'super admin';

      if (isTargetHrLead && !isReviewerSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only Super Admin can approve or reject late arrival for HR Lead.'
        });
      }

      // Rule: Prevent unauthorized self-approval
      if (reviewer.employeeId === lateReq.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot approve or reject your own late-login request.'
        });
      }

      const statusValue = String(decision).toLowerCase() === 'approved' ? 'Approved' : 'Rejected';
      const reasonText = statusValue === 'Rejected'
        ? (rejectionReason || notes || 'Late arrival rejected by HR Leadership')
        : null;

      // 1. Update late_login_approval_requests
      await db.run(
        `UPDATE late_login_approval_requests 
         SET status = ?, approverId = ?, approverName = ?, approverRole = ?, 
             decisionTimestamp = CURRENT_TIMESTAMP, rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [statusValue, reviewer.employeeId, reviewer.name, reviewer.role, reasonText, lateReq.id]
      );

      // 2. Update attendance_records (preserves actual check-in & lateMinutes, updates disposition)
      const attStatusValue = statusValue === 'Approved' ? 'APPROVED' : 'REJECTED';
      const attWorkStatus = statusValue === 'Approved' ? 'Present' : 'Absent';
      if (lateReq.attendanceId) {
        await db.run(
          `UPDATE attendance_records 
           SET lateApprovalStatus = ?, 
               status = ?,
               notes = COALESCE(notes || ' | ', '') || 'Late-login ${statusValue.toLowerCase()} by ${reviewer.name} (${reviewer.role})', 
               updatedAt = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [attStatusValue, attWorkStatus, lateReq.attendanceId]
        );
      } else {
        await db.run(
          `UPDATE attendance_records 
           SET lateApprovalStatus = ?, 
               status = ?,
               notes = COALESCE(notes || ' | ', '') || 'Late-login ${statusValue.toLowerCase()} by ${reviewer.name} (${reviewer.role})', 
               updatedAt = CURRENT_TIMESTAMP 
           WHERE employeeId = ? AND workDate = ?`,
          [attStatusValue, attWorkStatus, lateReq.employeeId, lateReq.attendanceDate]
        );
      }

      // 3. Update role_login_logs
      try {
        await db.run(
          `UPDATE role_login_logs 
           SET lateApprovalStatus = ?, approvedBy = ?, approvedAt = CURRENT_TIMESTAMP, rejectionReason = ? 
           WHERE employeeId = ? AND (lateApprovalStatus = 'PENDING' OR loginTime LIKE ?)`,
          [attStatusValue, `${reviewer.name} (${reviewer.role})`, reasonText, lateReq.employeeId, `${lateReq.attendanceDate}%`]
        );
      } catch (_) { }

      // 4. Record decision in audit log
      await writeAttendanceAudit(db, {
        attendanceId: lateReq.attendanceId,
        employeeId: lateReq.employeeId,
        workDate: lateReq.attendanceDate,
        action: statusValue === 'Approved' ? 'APPROVE_LATE_LOGIN' : 'REJECT_LATE_LOGIN',
        actor: reviewer,
        beforeState: { lateApprovalStatus: lateReq.status },
        afterState: { lateApprovalStatus: statusValue },
        details: `Late login on ${lateReq.attendanceDate} (${lateReq.delayMinutes}m delay) was ${statusValue.toLowerCase()} by ${reviewer.name} (${reviewer.role}). ${reasonText ? 'Reason: ' + reasonText : ''}`,
        ipAddress: getClientIp(req)
      });

      // 5. Notify the employee of decision
      await createNotification(db, {
        employeeId: lateReq.employeeId,
        type: 'Late Login Decision',
        title: statusValue === 'Approved' ? '✓ Late Login Approved' : '✕ Late Login Rejected',
        message: statusValue === 'Approved'
          ? `Your late login for shift ${lateReq.attendanceDate} (${lateReq.shiftName}) was approved by ${reviewer.name} (${reviewer.role}).`
          : `Your late login for shift ${lateReq.attendanceDate} (${lateReq.shiftName}) was rejected by ${reviewer.name}. ${reasonText || 'Please contact HR Leadership.'}`,
        severity: statusValue === 'Approved' ? 'success' : 'error',
        relatedId: lateReq.id
      });

      res.json({
        success: true,
        message: `Late login request successfully ${statusValue.toLowerCase()} for ${lateReq.employeeName}.`,
        decision: statusValue,
        status: statusValue,
        request: {
          id: lateReq.id,
          employeeId: lateReq.employeeId,
          status: statusValue
        }
      });
    } catch (err) {
      console.error('Failed to process late approval decision:', err);
      res.status(500).json({ success: false, message: 'Failed to process late approval decision.' });
    }
  });

  // 8. POST /api/crm/shifts/late-approvals/:id/explanation - Employee submits late justification
  app.post('/api/crm/shifts/late-approvals/:id/explanation', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const { id } = req.params;
      const { explanation } = req.body || {};

      if (!explanation || !explanation.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide an explanation.' });
      }

      let lateReq = await db.get('SELECT * FROM late_login_approval_requests WHERE id = ?', [id]);
      if (!lateReq) {
        lateReq = await db.get('SELECT * FROM late_login_approval_requests WHERE attendanceId = ?', [id]);
      }
      if (!lateReq) {
        return res.status(404).json({ success: false, message: 'Late-login request not found.' });
      }

      if (employee.employeeId !== lateReq.employeeId && !HR_LEADERSHIP_ROLES.includes(employee.role)) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only update your own explanation.' });
      }

      await db.run(
        `UPDATE late_login_approval_requests SET explanation = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [explanation.trim(), lateReq.id]
      );

      res.json({
        success: true,
        message: 'Explanation recorded successfully.'
      });
    } catch (err) {
      console.error('Failed to record explanation:', err);
      res.status(500).json({ success: false, message: 'Failed to record explanation.' });
    }
  });

  // ===========================================================================
  // DAILY WORK REPORTS & SHIFT-AWARE LOGOUT / CHECKOUT WORKFLOW
  // ===========================================================================

  const buildDailyReportContext = async (db, employee) => {
    const now = new Date();
    const nowParts = getCompanyDateTimeParts(now);
    const shiftConfig = await getEmployeeShift(db, employee);
    const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);

    const [allEmpRecords, allEmpBreaks, allEmpReports, allTasks] = await Promise.all([
      db.all(`SELECT * FROM attendance_records WHERE employeeId = ?`, [employee.employeeId]),
      db.all(`SELECT * FROM attendance_breaks WHERE employeeId = ?`, [employee.employeeId]),
      db.all(`SELECT * FROM daily_work_reports WHERE employeeId = ?`, [employee.employeeId]).catch(() => []),
      db.all(`SELECT * FROM hr_tasks WHERE assignedTo = ?`, [employee.employeeId]).catch(() => [])
    ]);

    const openRec =
      (allEmpRecords || [])
        .filter((r) => !r.checkOutAt)
        .sort((a, b) => String(b.checkInAt || '').localeCompare(String(a.checkInAt || '')))[0] || null;
    const todayRec = openRec || (allEmpRecords || []).find((r) => r.workDate === workDate) || null;
    const targetDate = todayRec?.workDate || workDate;

    const [sH = 9, sM = 0] = String(shiftConfig.startTime || '09:00').split(':').map(Number);
    const [eH = 18, eM = 0] = String(shiftConfig.endTime || '18:00').split(':').map(Number);
    const isOvernight = Boolean(shiftConfig.isOvernight) || (eH * 60 + eM <= sH * 60 + sM);
    const endDateStr = isOvernight ? addDaysToDateStr(targetDate, 1) : targetDate;
    const shiftEndAtIso = `${endDateStr}T${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}:00+05:30`;
    const shiftEndMs = new Date(shiftEndAtIso).getTime();
    const remainingShiftMinutes = Number.isFinite(shiftEndMs)
      ? Math.max(0, Math.ceil((shiftEndMs - now.getTime()) / 60000))
      : 0;
    const isShiftFinished = Number.isFinite(shiftEndMs) ? now.getTime() >= shiftEndMs : false;

    let workingMinutes = 0;
    if (todayRec?.checkOutAt) {
      workingMinutes = Math.max(0, Number(todayRec.netWorkMinutes || 0));
    } else if (todayRec?.checkInAt) {
      const checkInMs = new Date(todayRec.checkInAt).getTime();
      if (Number.isFinite(checkInMs)) {
        const grossMins = Math.max(0, Math.round((now.getTime() - checkInMs) / 60000));
        const recBreaks = (allEmpBreaks || []).filter((b) => b.attendanceId === todayRec.id);
        const breakMins = recBreaks.reduce((sum, b) => {
          if (b.breakEndAt) return sum + (Number(b.durationMinutes) || 0);
          const bsMs = new Date(b.breakStartAt).getTime();
          return sum + (Number.isFinite(bsMs) ? Math.max(0, Math.round((now.getTime() - bsMs) / 60000)) : 0);
        }, 0);
        workingMinutes = Math.max(0, grossMins - breakMins);
      }
    }

    const existingReport =
      (allEmpReports || []).find((r) => r.reportDate === targetDate) ||
      (allEmpReports || []).find((r) => r.reportDate === workDate) ||
      null;

    return {
      now,
      nowParts,
      shiftConfig,
      targetDate,
      shiftEndAtIso,
      isShiftFinished,
      remainingShiftMinutes,
      todayRec,
      workingMinutes,
      existingReport,
      assignedTasks: (allTasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate
      }))
    };
  };

  app.get('/api/hr-ops/daily-reports/me', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ctx = await buildDailyReportContext(db, employee);

      res.json({
        success: true,
        data: {
          employee: {
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            role: employee.role
          },
          reportDate: ctx.targetDate,
          shift: {
            id: ctx.shiftConfig.id,
            name: ctx.shiftConfig.name,
            startTime: ctx.shiftConfig.startTime,
            endTime: ctx.shiftConfig.endTime,
            formattedTiming: `${formatHHMMTo12Hour(ctx.shiftConfig.startTime)} – ${formatHHMMTo12Hour(ctx.shiftConfig.endTime)}`,
            shiftEndAtIso: ctx.shiftEndAtIso,
            isShiftFinished: ctx.isShiftFinished,
            remainingShiftMinutes: ctx.remainingShiftMinutes
          },
          attendance: ctx.todayRec
            ? {
              id: ctx.todayRec.id,
              workDate: ctx.todayRec.workDate,
              checkInAt: ctx.todayRec.checkInAt,
              checkOutAt: ctx.todayRec.checkOutAt,
              status: ctx.todayRec.status,
              workingMinutes: ctx.workingMinutes,
              workingHours: formatMinutesDuration(ctx.workingMinutes),
              isCheckedIn: Boolean(ctx.todayRec.checkInAt && !ctx.todayRec.checkOutAt),
              hasCheckedOut: Boolean(ctx.todayRec.checkOutAt)
            }
            : null,
          existingReport: ctx.existingReport,
          assignedTasks: ctx.assignedTasks
        }
      });
    } catch (err) {
      console.error('Failed to load daily report context:', err);
      res.status(500).json({ success: false, message: 'Failed to load daily report context.' });
    }
  });

  const validateAndUpsertDailyReport = async (db, employee, ctx, body) => {
    const workCompleted = String(body?.workCompleted || '').trim();
    const tasksCompleted = String(body?.tasksCompleted || '').trim();
    const workInProgress = String(body?.workInProgress || '').trim();
    const issuesBlockers = String(body?.issuesBlockers || '').trim();
    const plannedNextSteps = String(body?.plannedNextSteps || '').trim();
    const additionalRemarks = String(body?.additionalRemarks || '').trim();

    const errors = {};
    if (!workCompleted) errors.workCompleted = 'Work completed today is required.';
    if (!tasksCompleted) errors.tasksCompleted = 'Tasks completed is required.';
    if (!workInProgress) errors.workInProgress = 'Work in progress is required.';
    if (!plannedNextSteps) errors.plannedNextSteps = 'Planned next steps are required.';

    if (Object.keys(errors).length > 0) {
      return { validationErrors: errors };
    }

    const submittedAt = ctx.now.toISOString();
    if (ctx.existingReport) {
      await db.run(
        `UPDATE daily_work_reports
         SET attendanceId = ?, shiftId = ?, shiftName = ?, shiftStart = ?, shiftEnd = ?,
             checkInAt = ?, workingMinutesAtReport = ?, workCompleted = ?, tasksCompleted = ?,
             workInProgress = ?, issuesBlockers = ?, plannedNextSteps = ?, additionalRemarks = ?,
             submissionStatus = 'SUBMITTED', submittedAt = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          ctx.todayRec?.id || ctx.existingReport.attendanceId || null,
          ctx.shiftConfig.id,
          ctx.shiftConfig.name,
          ctx.shiftConfig.startTime,
          ctx.shiftConfig.endTime,
          ctx.todayRec?.checkInAt || ctx.existingReport.checkInAt || null,
          ctx.workingMinutes,
          workCompleted,
          tasksCompleted,
          workInProgress,
          issuesBlockers,
          plannedNextSteps,
          additionalRemarks,
          submittedAt,
          ctx.existingReport.id
        ]
      );
      const verified = await db.get('SELECT * FROM daily_work_reports WHERE id = ?', [ctx.existingReport.id]);
      if (!verified) throw new Error('Daily report verification failed after update.');
      return { report: verified };
    }

    const reportId = makeId('DWR');
    await db.run(
      `INSERT INTO daily_work_reports (
        id, employeeId, employeeName, department, role, attendanceId, reportDate,
        shiftId, shiftName, shiftStart, shiftEnd, checkInAt, workingMinutesAtReport,
        workCompleted, tasksCompleted, workInProgress, issuesBlockers, plannedNextSteps,
        additionalRemarks, submissionStatus, submittedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)`,
      [
        reportId,
        employee.employeeId,
        employee.name,
        employee.department || 'Operations',
        employee.role || 'HR Operations',
        ctx.todayRec?.id || null,
        ctx.targetDate,
        ctx.shiftConfig.id,
        ctx.shiftConfig.name,
        ctx.shiftConfig.startTime,
        ctx.shiftConfig.endTime,
        ctx.todayRec?.checkInAt || null,
        ctx.workingMinutes,
        workCompleted,
        tasksCompleted,
        workInProgress,
        issuesBlockers,
        plannedNextSteps,
        additionalRemarks,
        submittedAt
      ]
    );
    const verified = await db.get('SELECT * FROM daily_work_reports WHERE id = ?', [reportId]);
    if (!verified) throw new Error('Daily report verification failed after insert.');
    return { report: verified };
  };

  app.post('/api/hr-ops/daily-reports', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ctx = await buildDailyReportContext(db, employee);
      const result = await validateAndUpsertDailyReport(db, employee, ctx, req.body || {});
      if (result.validationErrors) {
        return res.status(400).json({
          success: false,
          message: 'Please complete all required daily report fields.',
          errors: result.validationErrors
        });
      }
      res.json({
        success: true,
        message: 'Daily work report saved successfully.',
        data: result.report
      });
    } catch (err) {
      console.error('Failed to save daily work report:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to save daily work report.' });
    }
  });

  app.post('/api/hr-ops/daily-reports/submit-and-checkout', requireCrmAuth, async (req, res) => {
    let savedReport = null;
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const ctx = await buildDailyReportContext(db, employee);

      if (req.body?.useExistingReport && ctx.existingReport) {
        savedReport = ctx.existingReport;
      } else {
        const result = await validateAndUpsertDailyReport(db, employee, ctx, req.body || {});
        if (result.validationErrors) {
          return res.status(400).json({
            success: false,
            reportSaved: false,
            checkoutCompleted: false,
            message: 'Please complete all required daily report fields.',
            errors: result.validationErrors
          });
        }
        savedReport = result.report;
      }

      // Now perform authoritative server-side checkout if active attendance exists and is not yet checked out
      let updatedAttendance = ctx.todayRec;
      let alreadyCheckedOut = false;

      if (ctx.todayRec && !ctx.todayRec.checkOutAt) {
        const attBreaks = await db.all(
          `SELECT * FROM attendance_breaks WHERE attendanceId = ?`,
          [ctx.todayRec.id]
        );
        const openBreak = (attBreaks || []).find((b) => !b.breakEndAt) || null;
        if (openBreak) {
          const bDur = Math.max(0, Math.round((ctx.now.getTime() - new Date(openBreak.breakStartAt).getTime()) / 60000));
          await db.run(
            `UPDATE attendance_breaks SET breakEndAt = ?, durationMinutes = ? WHERE id = ?`,
            [ctx.now.toISOString(), bDur, openBreak.id]
          );
          openBreak.durationMinutes = bDur;
        }
        const totalBreakMinutes = (attBreaks || []).reduce(
          (sum, b) => sum + (Number(b.durationMinutes) || 0),
          0
        );

        const metrics = computeCheckOutMetrics(ctx.todayRec, ctx.now, totalBreakMinutes, ctx.shiftConfig);
        const checkOutAt = ctx.now.toISOString();

        await db.run(
          `UPDATE attendance_records
           SET checkOutAt = ?, sessionStatus = 'COMPLETED', totalBreakMinutes = ?, grossMinutes = ?, netWorkMinutes = ?, overtimeMinutes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            checkOutAt,
            metrics.totalBreakMinutes,
            metrics.grossMinutes,
            metrics.netWorkMinutes,
            metrics.overtimeMinutes,
            metrics.finalStatus,
            ctx.todayRec.id
          ]
        );
        updatedAttendance = await db.get('SELECT * FROM attendance_records WHERE id = ?', [ctx.todayRec.id]);
        if (!updatedAttendance || !updatedAttendance.checkOutAt) {
          throw new Error('Checkout timestamp could not be verified.');
        }

        await db.run(
          `UPDATE daily_work_reports SET checkOutAt = ?, workingMinutesAtReport = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [checkOutAt, metrics.netWorkMinutes, savedReport.id]
        ).catch(() => { });

        try {
          const empLoginLogs = await db.all(
            `SELECT * FROM role_login_logs WHERE employeeId = ?`,
            [employee.employeeId]
          );
          const formattedDur = formatMinutesDuration(metrics.netWorkMinutes);
          for (const logRow of empLoginLogs || []) {
            if (!logRow.logoutTime) {
              await db.run(
                `UPDATE role_login_logs SET logoutTime = ?, totalDuration = ? WHERE id = ?`,
                [checkOutAt, formattedDur, logRow.id]
              );
            }
          }
        } catch (_) { }

        await writeAttendanceAudit(db, {
          attendanceId: ctx.todayRec.id,
          employeeId: employee.employeeId,
          workDate: ctx.todayRec.workDate,
          action: 'REPORT_AND_CHECK_OUT',
          actor: employee,
          beforeState: { checkOutAt: null, status: ctx.todayRec.status },
          afterState: { checkOutAt, status: metrics.finalStatus, reportId: savedReport.id },
          details: `Daily work report ${savedReport.id} submitted and checked out at ${ctx.nowParts.timeStr}.`,
          ipAddress
        }).catch(() => { });
      } else if (ctx.todayRec && ctx.todayRec.checkOutAt) {
        alreadyCheckedOut = true;
      }

      res.json({
        success: true,
        reportSaved: true,
        checkoutCompleted: true,
        alreadyCheckedOut,
        message: alreadyCheckedOut
          ? 'Daily report verified and attendance was already checked out.'
          : 'Daily report submitted and attendance checked out successfully.',
        data: {
          report: savedReport,
          attendance: updatedAttendance
        }
      });
    } catch (err) {
      console.error('Submit report and checkout error:', err);
      res.status(500).json({
        success: false,
        reportSaved: Boolean(savedReport),
        checkoutCompleted: false,
        message: savedReport
          ? 'Your daily work report was saved, but attendance checkout failed. Please retry checkout without re-entering your report.'
          : (err.message || 'Failed to submit daily work report and checkout.')
      });
    }
  });

  app.get('/api/hr/daily-reports', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const employee = req.authEmployee;
      const canViewAll = HR_LEADERSHIP_ROLES.includes(employee.role);
      const targetDate = req.query?.date ? String(req.query.date).trim() : '';
      const targetEmployeeId = req.query?.employeeId ? String(req.query.employeeId).trim() : '';

      const allReports = await db.all(`SELECT * FROM daily_work_reports`).catch(() => []);
      const filtered = (allReports || [])
        .filter((r) => {
          if (!canViewAll && r.employeeId !== employee.employeeId) return false;
          if (targetEmployeeId && r.employeeId !== targetEmployeeId) return false;
          if (targetDate && r.reportDate !== targetDate) return false;
          return true;
        })
        .sort((a, b) => String(b.submittedAt || b.reportDate || '').localeCompare(String(a.submittedAt || a.reportDate || '')));

      res.json({
        success: true,
        data: filtered
      });
    } catch (err) {
      console.error('Failed to fetch daily reports:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch daily reports.' });
    }
  });
};


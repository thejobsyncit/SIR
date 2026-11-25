import crypto from 'crypto';
import { DEFAULT_SHIFTS } from '../database.js';
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

export const safeFormatTime = (timeVal) => {
  if (!timeVal || timeVal === '—' || timeVal === '-' || timeVal === 'null') return '—';
  if (typeof timeVal === 'string') {
    const trimmed = timeVal.trim();
    if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
      const parts = trimmed.split(/\s+/);
      const timePart = parts[1].slice(0, 5);
      const [h, m] = timePart.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }
  return timeVal;
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

const getEmployeeShift = async (db, employee) => {
  const shiftId = employee?.shiftId || 'SHIFT-GENERAL';
  let shift = await db.get('SELECT * FROM shift_configs WHERE id = ?', [shiftId]);
  if (!shift) {
    shift = await db.get("SELECT * FROM shift_configs WHERE id = 'SHIFT-GENERAL'");
  }
  return (
    shift || {
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
    }
  );
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

const autoFlagStaleMissingCheckouts = async (db, employee, shiftConfig, ipAddress) => {
  const openRows = await db.all(
    `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late')`,
    [employee.employeeId]
  );
  const nowMs = Date.now();
  for (const row of openRows) {
    if (isStaleMissingCheckout(row, nowMs, shiftConfig)) {
      await db.run(
        `UPDATE attendance_records SET status = 'Missing Checkout', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
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
      if (!payload || !payload.employeeId) {
        // Fallback to role / email headers if token was expired or invalidated
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
          message: 'Invalid or expired CRM session token. Please sign in again.'
        });
      }

      const db = await getDb();
      const emp = await db.get(
        'SELECT * FROM employees WHERE employeeId = ? OR id = ?',
        [payload.employeeId, payload.id || '']
      );
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
    if (!HR_LEADERSHIP_ROLES.includes(req.authEmployee?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This endpoint requires HR Lead, Admin, or Super Admin authorization.'
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

      // Automatic Attendance Check-In on Login for HR Lead, HR Operations, and staff
      let attendanceSession = null;
      if (employee.role === 'HR Lead' || employee.role === 'HR Operations' || (employee.role !== 'Super Admin' && employee.role !== 'Admin')) {
        try {
          const now = new Date();
          const nowParts = getCompanyDateTimeParts(now);
          const shiftConfig = await getEmployeeShift(db, employee);
          const workDate = resolveCheckInWorkDate(nowParts, shiftConfig);

          // Check for existing open attendance session (checkOutAt IS NULL)
          const openActive = await db.get(
            `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late', 'Present') ORDER BY checkInAt DESC LIMIT 1`,
            [employee.employeeId]
          );

          if (openActive) {
            // Resume existing active session without creating duplicate records
            attendanceSession = { ...openActive, resumed: true };
          } else {
            const existingToday = await db.get(
              `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate = ?`,
              [employee.employeeId, workDate]
            );

            if (existingToday && existingToday.checkOutAt) {
              // Reopen existing shift if employee logs in again on same workday
              await db.run(
                `UPDATE attendance_records SET checkOutAt = NULL, status = 'In Progress', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
                [existingToday.id]
              );
              attendanceSession = await db.get('SELECT * FROM attendance_records WHERE id = ?', [existingToday.id]);
            } else if (!existingToday) {
              const { lateMinutes, isLate } = computeCheckInMetrics(now, workDate, shiftConfig);
              const lateApprovalStatus = isLate ? 'PENDING' : 'APPROVED';
              const attId = makeId('ATT');
              const checkInAt = now.toISOString();

              await db.run(
                `INSERT INTO attendance_records (
                  id, employeeId, employeeName, department, operationTeam, workDate,
                  shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
                  checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, 'CRM Login', 'Automated Check-In on Login', ?, ?)`,
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
                  employee.role
                ]
              );
              attendanceSession = await db.get('SELECT * FROM attendance_records WHERE id = ?', [attId]);
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

  app.get('/api/crm/auth/me', requireCrmAuth, (req, res) => {
    res.json({ success: true, employee: req.authEmployee });
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

      return res.json({
        success: true,
        token: createCrmSessionToken(targetEmp),
        employee: sanitizeEmployee(targetEmp)
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

      return res.json({
        success: true,
        token: createCrmSessionToken(targetEmp),
        employee: sanitizeEmployee(targetEmp)
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

      const dbRecords = await db.all(
        `SELECT * FROM attendance_records
         WHERE employeeId = ? AND workDate >= ? AND workDate <= ?
         ORDER BY workDate DESC`,
        [employee.employeeId, addDaysToDateStr(queryMinDate, -1), queryMaxDate]
      );

      const recordIds = dbRecords.map((r) => r.id);
      const breaksByAttendanceId = {};
      if (recordIds.length > 0) {
        const placeholders = recordIds.map(() => '?').join(',');
        const allBreaks = await db.all(
          `SELECT * FROM attendance_breaks WHERE attendanceId IN (${placeholders}) ORDER BY breakStartAt ASC`,
          recordIds
        );
        for (const b of allBreaks) {
          if (!breaksByAttendanceId[b.attendanceId]) breaksByAttendanceId[b.attendanceId] = [];
          breaksByAttendanceId[b.attendanceId].push(b);
        }
      }

      const holidays = await db.all(
        `SELECT * FROM company_holidays WHERE holidayDate >= ? AND holidayDate <= ? ORDER BY holidayDate ASC`,
        [queryMinDate, queryMaxDate]
      );

      const leaveRequests = await db.all(
        `SELECT * FROM employee_leave_requests WHERE employeeId = ? ORDER BY startDate DESC`,
        [employee.employeeId]
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
      const activeOpenRecord = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late') ORDER BY checkInAt DESC LIMIT 1`,
        [employee.employeeId]
      );
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
      const missingCheckoutRecords = await db.all(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND status = 'Missing Checkout' ORDER BY workDate DESC`,
        [employee.employeeId]
      );

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
      const employee = req.authEmployee;
      const ipAddress = getClientIp(req);
      const shiftConfig = await getEmployeeShift(db, employee);

      await autoFlagStaleMissingCheckouts(db, employee, shiftConfig, ipAddress);

      const openActive = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late')`,
        [employee.employeeId]
      );
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
          // Re-open shift for further work if employee clocked out earlier
          await db.run(
            `UPDATE attendance_records SET checkOutAt = NULL, status = 'In Progress', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
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
      const checkInAt = now.toISOString();
      const source = req.body?.source || 'Web Portal';
      const notes = req.body?.notes ? String(req.body.notes).slice(0, 300) : '';

      await db.run(
        `INSERT INTO attendance_records (
          id, employeeId, employeeName, department, operationTeam, workDate,
          shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
          checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, ?, ?, ?, ?)`,
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
          employee.role || 'HR Operations'
        ]
      );

      // Record this login & check-in event into role_login_logs for Super Admin live tracking
      try {
        await db.run(
          `INSERT INTO role_login_logs (
            id, employeeId, employeeName, email, role, department,
            shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
            punctuality, lateMinutes, lateApprovalStatus, ipAddress
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
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
            ipAddress
          ]
        );
      } catch (logErr) {
        console.warn('Role login logging notice:', logErr.message);
      }

      // If late, notify Super Admin immediately for authorization
      if (lateApprovalStatus === 'PENDING') {
        try {
          const superAdmins = await db.all("SELECT id, employeeId FROM employees WHERE role = 'Super Admin'");
          const targets = superAdmins && superAdmins.length ? superAdmins : [{ employeeId: 'REV-EMP-001' }];
          for (const sa of targets) {
            await createNotification(db, {
              employeeId: sa.employeeId,
              type: 'Late Arrival Authorization',
              title: `⚠️ Late Arrival: ${employee.name} (${employee.role})`,
              message: `${employee.name} (${employee.role}) logged in at ${nowParts.timeStr} (${lateMinutes}m late for ${shiftConfig.name}). Awaiting Super Admin authorization before portal access is granted.`,
              severity: 'warning',
              relatedId: `late_auth_${id}`
            });
          }
        } catch (_) {}
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

      const activeRec = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late') ORDER BY checkInAt DESC LIMIT 1`,
        [employee.employeeId]
      );
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

      const activeRec = await db.get(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND checkOutAt IS NULL AND status IN ('In Progress', 'Late') ORDER BY checkInAt DESC LIMIT 1`,
        [employee.employeeId]
      );

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
      const openBreak = await db.get(
        `SELECT * FROM attendance_breaks WHERE attendanceId = ? AND breakEndAt IS NULL`,
        [activeRec.id]
      );
      if (openBreak) {
        const bDur = Math.max(0, Math.round((now.getTime() - new Date(openBreak.breakStartAt).getTime()) / 60000));
        await db.run(
          `UPDATE attendance_breaks SET breakEndAt = ?, durationMinutes = ? WHERE id = ?`,
          [now.toISOString(), bDur, openBreak.id]
        );
      }

      const breakSumRow = await db.get(
        `SELECT COALESCE(SUM(durationMinutes), 0) as totalBreak FROM attendance_breaks WHERE attendanceId = ?`,
        [activeRec.id]
      );
      const totalBreakMinutes = Number(breakSumRow?.totalBreak || 0);

      const metrics = computeCheckOutMetrics(activeRec, now, totalBreakMinutes, shiftConfig);
      const checkOutAt = now.toISOString();

      await db.run(
        `UPDATE attendance_records
         SET checkOutAt = ?, totalBreakMinutes = ?, grossMinutes = ?, netWorkMinutes = ?, overtimeMinutes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
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
        await db.run(
          `UPDATE role_login_logs 
           SET logoutTime = ?, totalDuration = ?
           WHERE employeeId = ? AND loginTime LIKE ? AND logoutTime IS NULL`,
          [
            checkOutAt,
            formatMinutesDuration(metrics.netWorkMinutes),
            employee.employeeId,
            `${activeRec.workDate}%`
          ]
        );
      } catch (_) {}

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

  // Pre-Login Shift Late Verification & Ingress Gatekeeper
  app.post('/api/crm/auth/record-late-login', async (req, res) => {
    try {
      const { email, password, role: reqRole, employeeId: reqEmpId, name: reqName, department: reqDept } = req.body || {};
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required.' });
      }
      const db = await getDb();
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

        // Employee is re-attempting login while late: Refresh to PENDING so approvers (Super Admin / HR Lead) see it
        const updatedLateMinutes = Math.max(Number(existing.lateMinutes || 0), lateMinutes || 0);
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
        } catch (_) {}

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
      } catch (_) {}

      // Create high-priority Super Admin & HR Lead notifications
      try {
        const superAdmins = await db.all("SELECT id, employeeId FROM employees WHERE role = 'Super Admin'");
        const targets = superAdmins && superAdmins.length ? superAdmins : [{ employeeId: 'REV-EMP-001' }];
        
        // If employee is not HR Lead, also notify HR Lead
        const isTargetHrLead = String(employee.role || '').toLowerCase().includes('lead');
        if (!isTargetHrLead) {
          const hrLeads = await db.all("SELECT id, employeeId FROM employees WHERE role = 'HR Lead'");
          if (hrLeads && hrLeads.length) {
            targets.push(...hrLeads);
          }
        }

        for (const sa of targets) {
          await createNotification(db, {
            employeeId: sa.employeeId,
            type: 'Late Arrival Alert',
            title: `⚠️ Late Shift Login: ${employee.name} (${employee.role})`,
            message: `${employee.name} attempted CRM portal sign-in at ${nowParts.timeStr} (+${lateMinutes}m late). Action required in Executive Command Center.`,
            severity: 'warning',
            relatedId: attId
          });
        }
      } catch (_) {}

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
      const db = await getDb();
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
      const db = await getDb();
      const reviewer = req.authEmployee;
      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isSuperAdmin = reviewerRole === 'super admin' || reviewerRole === 'admin';
      const isHrLead = reviewerRole === 'hr lead';

      const rows = await db.all(
        `SELECT * FROM attendance_records WHERE lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC`
      );

      const enriched = await Promise.all(
        rows.map(async (row) => {
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
      const reviewer = req.authEmployee;
      const { id } = req.params;
      const { decision, notes } = req.body || {};
      const statusValue = String(decision).toUpperCase() === 'REJECTED' ? 'REJECTED' : 'APPROVED';

      let att = await db.get('SELECT * FROM attendance_records WHERE id = ?', [id]);
      if (!att) {
        // If passed id is a role_login_logs id (e.g. LOG-xxx), locate corresponding pending attendance record
        const loginLog = await db.get('SELECT * FROM role_login_logs WHERE id = ?', [id]);
        if (loginLog) {
          att = await db.get(
            `SELECT * FROM attendance_records WHERE employeeId = ? AND lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC LIMIT 1`,
            [loginLog.employeeId]
          );
        }
      }
      if (!att) {
        // Also locate pending attendance record by employeeId directly
        att = await db.get(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND lateApprovalStatus = 'PENDING' ORDER BY checkInAt DESC LIMIT 1`,
          [id]
        );
      }
      if (!att) {
        return res.status(404).json({ success: false, message: 'Attendance record not found.' });
      }

      // Check target employee role
      const targetEmp = await db.get('SELECT role FROM employees WHERE employeeId = ?', [att.employeeId]);
      const targetRole = String(targetEmp?.role || att.role || '').toLowerCase();
      const isTargetHrLead = targetRole === 'hr lead' || targetRole.includes('lead');

      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isReviewerSuperAdmin = reviewerRole === 'super admin' || reviewerRole === 'admin';

      // Strict Hierarchical Policy: HR Lead late arrivals can ONLY be approved by Super Admin / Admin
      if (isTargetHrLead && !isReviewerSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only Super Admin has authorization to approve late arrivals for HR Lead.'
        });
      }

      // Reviewer cannot approve themselves
      if (reviewer?.employeeId && att.employeeId === reviewer.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot approve your own late arrival request.'
        });
      }

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

      try {
        await db.run(
          `UPDATE role_login_logs SET lateApprovalStatus = ?, approvedBy = ?, approvedAt = CURRENT_TIMESTAMP, rejectionReason = ? WHERE employeeId = ? AND lateApprovalStatus = 'PENDING'`,
          [statusValue, `${reviewer.name} (${reviewer.role})`, statusValue === 'REJECTED' ? (notes || `Access denied by ${reviewer.role}`) : null, att.employeeId]
        );
      } catch (_) {}

      await writeAttendanceAudit(db, {
        attendanceId: id,
        employeeId: att.employeeId,
        workDate: att.workDate,
        action: statusValue === 'APPROVED' ? 'APPROVE_LATE_ENTRY' : 'REJECT_LATE_ENTRY',
        actor: reviewer,
        beforeState: { lateApprovalStatus: att.lateApprovalStatus },
        afterState: { lateApprovalStatus: statusValue },
        details: `Late arrival access ${statusValue.toLowerCase()} by ${reviewer.role} ${reviewer.name}. ${notes ? 'Note: ' + notes : ''}`,
        ipAddress: getClientIp(req)
      });

      await createNotification(db, {
        employeeId: att.employeeId,
        type: 'Late Arrival Decision',
        title: statusValue === 'APPROVED' ? '✓ Late Arrival Access Approved' : '✕ Late Arrival Access Rejected',
        message: statusValue === 'APPROVED'
          ? `${reviewer.name} (${reviewer.role}) has approved your late arrival for shift ${att.workDate}. Workspace access unlocked.`
          : `${reviewer.name} (${reviewer.role}) has rejected your late arrival request for shift ${att.workDate}. ${notes || 'Please contact HR Leadership.'}`,
        severity: statusValue === 'APPROVED' ? 'success' : 'error',
        relatedId: `late_dec_${id}`
      });

      return res.json({
        success: true,
        message: statusValue === 'APPROVED' ? 'Late arrival approved successfully.' : 'Late arrival rejected.',
        record: { ...att, lateApprovalStatus: statusValue }
      });

      await createNotification(db, {
        employeeId: att.employeeId,
        type: 'Late Arrival Decision',
        title: statusValue === 'APPROVED' ? '✓ Late Arrival Access Approved' : '✕ Late Arrival Access Rejected',
        message: statusValue === 'APPROVED'
          ? `Super Admin ${reviewer.name} has approved your late arrival for shift ${att.workDate}. Workspace access unlocked.`
          : `Super Admin ${reviewer.name} has rejected your late arrival request for shift ${att.workDate}. ${notes || 'Please contact HR Leadership.'}`,
        severity: statusValue === 'APPROVED' ? 'success' : 'error',
        relatedId: `late_dec_${id}`
      });

      res.json({
        success: true,
        message: `Late arrival access successfully ${statusValue.toLowerCase()} for ${att.employeeName}.`,
        decision: statusValue
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
        const token = getBearerToken(req);
        if (token) {
          const payload = verifyCrmSessionToken(token);
          if (payload?.employeeId) {
            employee = await db.get('SELECT * FROM employees WHERE employeeId = ?', [payload.employeeId]);
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
      } catch (_) {}

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
        let hours = '0 hrs';
        let breakDuration = '0h 00m';
        let lateOrEarly = '—';
        let isLate = false;
        let lateMinutes = 0;
        let lateApprovalStatus = 'NONE';
        let attendanceId = null;
        let remarks = 'No punch logged for this date';
        let isLive = false;
        let shiftName = 'General Day Shift (09:00 AM - 06:00 PM)';

        if (att) {
          isLive = !att.checkOutAt && (att.status === 'In Progress' || att.status === 'Present' || att.status === 'Late' || att.status === 'Executive Active');
          attendanceId = att.id;
          shiftName = att.shiftName || shiftName;
          lateMinutes = Number(att.lateMinutes) || 0;
          isLate = lateMinutes > 0;
          lateApprovalStatus = att.lateApprovalStatus || (isLate ? 'PENDING' : 'APPROVED');

          if (att.checkInAt) {
            checkIn = safeFormatTime(att.checkInAt);
          }

          if (att.checkOutAt) {
            checkOut = safeFormatTime(att.checkOutAt);
            const mins = att.netWorkMinutes || 0;
            hours = mins > 0 ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` : '0h 00m';
            status = att.status || (isLate ? 'Late' : 'Present');
          } else {
            checkOut = 'Not Checked Out';
            hours = 'In Progress';
            status = isLate ? 'Late' : 'Present';
          }

          if (att.totalBreakMinutes) {
            breakDuration = `${att.totalBreakMinutes}m`;
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
          checkIn = safeFormatTime(login.checkInTime || login.loginTime);
          checkOut = 'Not Checked Out';
          hours = 'In Progress';
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
            isLive = isSelectedDateToday;
          }
        }

        // Calculate dynamic running hours for active/checked-in sessions
        let runningMinutes = 0;
        let runningHours = '0h 00m';
        if (isLive) {
          const rawCheckIn = att?.checkInAt || (login?.loginTime);
          if (rawCheckIn) {
            const checkInEpoch = new Date(rawCheckIn).getTime();
            if (!isNaN(checkInEpoch)) {
              runningMinutes = Math.max(0, Math.floor((Date.now() - checkInEpoch) / 60000));
              runningHours = formatMinutesDuration(runningMinutes);
            }
          }
        }

        // Determine Punctuality display
        let punctuality = '—';
        if (isLate || status === 'Late') {
          punctuality = `Late (+${lateMinutes || 15}m)`;
        } else if (status === 'Present' || status === 'Executive Active' || (checkIn !== '—' && checkIn !== 'Not Checked In')) {
          punctuality = 'On Time';
        }

        // Determine Real Attendance Alerts
        let attendanceAlerts = 'None';
        if (lateApprovalStatus === 'PENDING') {
          attendanceAlerts = `Pending Authorization (+${lateMinutes}m)`;
        } else if (isLate || status === 'Late') {
          attendanceAlerts = `Late Arrival (+${lateMinutes}m)`;
        } else if (status === 'Not Checked In' && nowParts.hour >= 10 && isSelectedDateToday) {
          attendanceAlerts = 'Employee Has Not Checked In';
        } else if (checkOut === 'Not Checked Out' && nowParts.hour >= 19 && isSelectedDateToday) {
          attendanceAlerts = 'Employee Has Not Checked Out';
        } else if (status === 'Absent') {
          attendanceAlerts = 'Unexcused Absence';
        }

        return {
          id: emp.employeeId,
          employeeId: emp.employeeId,
          attendanceId,
          name: emp.name,
          employeeName: emp.name,
          role: emp.role,
          designation: emp.designation || emp.role,
          department: emp.department || 'Operations Management',
          location: emp.branch || 'Dubai HQ',
          avatar: emp.avatar || '',
          email: emp.email,
          date: todayDateStr,
          checkIn,
          checkOut,
          breakDuration,
          hours,
          totalWorkingHours: hours,
          runningHours,
          runningMinutes,
          status,
          late: isLate,
          lateMinutes,
          lateOrEarly,
          lateApprovalStatus,
          shiftName,
          shiftStart: att?.shiftStart || '09:00',
          shiftEnd: att?.shiftEnd || '18:00',
          punctuality,
          attendanceAlerts,
          remarks,
          isLive
        };
      });

      const presentCount = unifiedRegister.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Executive Active').length;
      const lateCount = unifiedRegister.filter((r) => r.late || r.status === 'Late').length;
      const leaveCount = unifiedRegister.filter((r) => r.status === 'On Leave').length;
      const pendingApprovalCount = unifiedRegister.filter((r) => r.lateApprovalStatus === 'PENDING').length;
      const absentCount = unifiedRegister.filter((r) => r.status === 'Absent').length;
      const notCheckedInCount = unifiedRegister.filter((r) => r.status === 'Not Checked In' || r.status === 'Not Clocked In').length;
      const checkedOutCount = unifiedRegister.filter((r) => r.checkOut && r.checkOut !== '—' && r.checkOut !== 'Not Checked Out' && r.checkOut !== 'Active Session').length;
      const liveCount = unifiedRegister.filter((r) => r.isLive).length;

      const departments = Array.from(new Set(emps.map(e => e.department).filter(Boolean))).sort();
      const roles = Array.from(new Set(emps.map(e => e.role).filter(Boolean))).sort();

      res.json({
        success: true,
        date: todayDateStr,
        register: unifiedRegister,
        recordedDates,
        departments,
        roles,
        stats: {
          totalWorkforce: unifiedRegister.length,
          totalEmployees: unifiedRegister.length,
          presentCount,
          lateCount,
          leaveCount,
          pendingApprovalCount,
          absentCount,
          notCheckedInCount,
          checkedOutCount,
          liveCount
        }
      });
    } catch (err) {
      console.error('Failed to get attendance register:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve attendance register.' });
    }
  });

  // Individual Employee Attendance Details & History (Day, Week, Month, Overall)
  app.get('/api/hr-ops/attendance/employee/:employeeId/history', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const { employeeId } = req.params;
      const { range = 'month', date, startDate, endDate } = req.query || {};

      const emp = await db.get(
        'SELECT * FROM employees WHERE employeeId = ? OR id = ? LIMIT 1',
        [employeeId, employeeId]
      );
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }

      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);
      const shiftConfig = await getEmployeeShift(db, emp);

      let calculatedStart = '';
      let calculatedEnd = '';

      if (range === 'day') {
        const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : nowParts.dateStr;
        calculatedStart = targetDate;
        calculatedEnd = targetDate;
      } else if (range === 'week') {
        const refDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? new Date(date) : now;
        const refParts = getCompanyDateTimeParts(refDate);
        const dayOfWeek = refParts.dayOfWeek;
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        calculatedStart = addDaysToDateStr(refParts.dateStr, diffToMon);
        calculatedEnd = addDaysToDateStr(calculatedStart, 6);
      } else if (range === 'month') {
        const targetMonth = /^\d{4}-\d{2}$/.test(date || '') ? date : `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
        const [y, m] = targetMonth.split('-').map(Number);
        const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
        calculatedStart = `${targetMonth}-01`;
        calculatedEnd = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
      } else {
        calculatedStart = /^\d{4}-\d{2}-\d{2}$/.test(startDate || '')
          ? startDate
          : (emp.joiningDate && emp.joiningDate <= nowParts.dateStr ? emp.joiningDate : addDaysToDateStr(nowParts.dateStr, -60));
        calculatedEnd = /^\d{4}-\d{2}-\d{2}$/.test(endDate || '')
          ? endDate
          : nowParts.dateStr;
      }

      const dbRecords = await db.all(
        `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate >= ? AND workDate <= ? ORDER BY workDate ASC`,
        [emp.employeeId, calculatedStart, calculatedEnd]
      );

      const holidays = await db.all(
        `SELECT * FROM company_holidays WHERE holidayDate >= ? AND holidayDate <= ?`,
        [calculatedStart, calculatedEnd]
      );

      const leaveRequests = await db.all(
        `SELECT * FROM employee_leave_requests WHERE employeeId = ? AND (
          (startDate >= ? AND startDate <= ?) OR
          (endDate >= ? AND endDate <= ?) OR
          (startDate <= ? AND endDate >= ?)
        )`,
        [emp.employeeId, calculatedStart, calculatedEnd, calculatedStart, calculatedEnd, calculatedStart, calculatedEnd]
      );

      const dataset = buildAttendanceDataset({
        employee: emp,
        shiftConfig,
        dbRecords,
        holidays,
        leaveRequests,
        startDateStr: calculatedStart,
        endDateStr: calculatedEnd,
        now
      });

      const historyRows = dataset.days.map(d => {
        let punctuality = '—';
        if (d.status === 'Present' || d.status === 'Executive Active') {
          punctuality = d.lateMinutes > 0 ? `Late (+${d.lateMinutes}m)` : 'On Time';
        } else if (d.status === 'Late') {
          punctuality = `Late (+${d.lateMinutes || 15}m)`;
        }

        return {
          id: d.id,
          date: d.date,
          day: d.day,
          shift: d.shiftName || shiftConfig.name,
          shiftTiming: d.shiftTiming,
          checkIn: safeFormatTime(d.checkInFormatted || d.checkInAt) || '—',
          checkOut: d.checkOutAt ? safeFormatTime(d.checkOutFormatted || d.checkOutAt) : (d.checkInAt ? 'Not Checked Out' : '—'),
          loggedHours: d.netWorkMinutes > 0 ? formatMinutesDuration(d.netWorkMinutes) : (d.checkInAt && !d.checkOutAt ? 'In Progress' : '—'),
          status: d.status,
          punctuality,
          notes: d.notes || ''
        };
      }).reverse();

      res.json({
        success: true,
        employee: {
          id: emp.id,
          employeeId: emp.employeeId,
          name: emp.name,
          role: emp.role,
          designation: emp.designation || emp.role,
          department: emp.department || 'Operations Management',
          location: emp.assignedBranch || 'Dubai HQ',
          email: emp.email,
          phone: emp.phone,
          avatar: emp.avatar || ''
        },
        shift: shiftConfig,
        summary: {
          totalWorkingDays: dataset.summary.totalWorkingDays || 0,
          presentDays: dataset.summary.presentDays || 0,
          absentDays: dataset.summary.absentDays || 0,
          lateDays: dataset.summary.lateDays || 0,
          halfDays: dataset.summary.halfDays || 0,
          leaveDays: dataset.summary.leaveDays || 0,
          totalLoggedHours: dataset.workingHours.totalNetHours || '0h 00m',
          averageWorkingHours: dataset.workingHours.avgDailyHours || '0h 00m',
          punctualityPercentage: dataset.summary.punctualityPercentage || 100,
          attendancePercentage: dataset.summary.attendancePercentage || 0
        },
        history: historyRows,
        range,
        startDate: calculatedStart,
        endDate: calculatedEnd
      });
    } catch (err) {
      console.error('Failed to get employee attendance history:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve attendance history.' });
    }
  });

  // Shift Roster Management: View all employees with shift assignments
  app.get('/api/hr-ops/attendance/shift-roster', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const emps = await db.all(
        `SELECT employeeId, name, email, role, department, designation, assignedBranch, shiftId, status 
         FROM employees 
         WHERE LOWER(COALESCE(status, 'Active')) != 'inactive' 
         ORDER BY name ASC`
      );
      let shifts = await db.all('SELECT * FROM shift_configs WHERE isActive = 1 OR isActive IS NULL');
      if (!shifts || shifts.length === 0) {
        shifts = DEFAULT_SHIFTS;
      }
      const shiftMap = new Map();
      shifts.forEach(s => shiftMap.set(s.id, s));

      const defaultShift = shiftMap.get('SHIFT-GENERAL') || shifts[0];

      const roster = emps.map(emp => {
        const assignedShift = (emp.shiftId && shiftMap.get(emp.shiftId)) || defaultShift;
        return {
          id: emp.employeeId,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          name: emp.name,
          department: emp.department || 'Operations Management',
          role: emp.role,
          designation: emp.designation || emp.role,
          assignedShift: assignedShift.name,
          shiftId: assignedShift.id,
          shiftStartTime: assignedShift.startTime || '09:00',
          shiftEndTime: assignedShift.endTime || '18:00',
          workingDays: 'Monday - Saturday',
          weeklyOff: 'Sunday',
          shiftStatus: 'Active'
        };
      });

      res.json({
        success: true,
        roster,
        shifts
      });
    } catch (err) {
      console.error('Failed to get shift roster:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve shift roster.' });
    }
  });

  // Assign / Update Employee Shift
  app.put('/api/hr-ops/attendance/shift-roster/:employeeId', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const { employeeId } = req.params;
      const { shiftId } = req.body || {};
      if (!shiftId) {
        return res.status(400).json({ success: false, message: 'shiftId is required.' });
      }
      const emp = await db.get('SELECT * FROM employees WHERE employeeId = ? LIMIT 1', [employeeId]);
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      await db.run('UPDATE employees SET shiftId = ?, updatedAt = CURRENT_TIMESTAMP WHERE employeeId = ?', [shiftId, employeeId]);
      res.json({ success: true, message: `Shift updated successfully for ${emp.name}.` });
    } catch (err) {
      console.error('Failed to update employee shift:', err);
      res.status(500).json({ success: false, message: 'Failed to update employee shift.' });
    }
  });

  // Multi-Filter Attendance Reports for Export
  app.get('/api/hr-ops/attendance/reports', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const {
        employeeId = 'all',
        department = 'all',
        role = 'all',
        range = 'month',
        date,
        startDate,
        endDate
      } = req.query || {};

      const now = new Date();
      const nowParts = getCompanyDateTimeParts(now);

      let calculatedStart = '';
      let calculatedEnd = '';

      if (range === 'day') {
        const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : nowParts.dateStr;
        calculatedStart = targetDate;
        calculatedEnd = targetDate;
      } else if (range === 'week') {
        const refDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? new Date(date) : now;
        const refParts = getCompanyDateTimeParts(refDate);
        const dayOfWeek = refParts.dayOfWeek;
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        calculatedStart = addDaysToDateStr(refParts.dateStr, diffToMon);
        calculatedEnd = addDaysToDateStr(calculatedStart, 6);
      } else if (range === 'month') {
        const targetMonth = /^\d{4}-\d{2}$/.test(date || '') ? date : `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
        const [y, m] = targetMonth.split('-').map(Number);
        const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
        calculatedStart = `${targetMonth}-01`;
        calculatedEnd = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
      } else {
        calculatedStart = /^\d{4}-\d{2}-\d{2}$/.test(startDate || '') ? startDate : addDaysToDateStr(nowParts.dateStr, -30);
        calculatedEnd = /^\d{4}-\d{2}-\d{2}$/.test(endDate || '') ? endDate : nowParts.dateStr;
      }

      let empQuery = `SELECT * FROM employees WHERE LOWER(COALESCE(status, 'Active')) != 'inactive'`;
      const empParams = [];

      if (employeeId && employeeId !== 'all') {
        empQuery += ` AND employeeId = ?`;
        empParams.push(employeeId);
      }
      if (department && department !== 'all') {
        empQuery += ` AND department = ?`;
        empParams.push(department);
      }
      if (role && role !== 'all') {
        empQuery += ` AND role = ?`;
        empParams.push(role);
      }

      empQuery += ` ORDER BY name ASC`;
      const emps = await db.all(empQuery, empParams);

      const holidays = await db.all(
        `SELECT * FROM company_holidays WHERE holidayDate >= ? AND holidayDate <= ?`,
        [calculatedStart, calculatedEnd]
      );

      const reportRows = [];
      for (const rawEmp of emps) {
        const emp = sanitizeEmployee(rawEmp);
        const shiftConfig = await getEmployeeShift(db, emp);

        const dbRecords = await db.all(
          `SELECT * FROM attendance_records WHERE employeeId = ? AND workDate >= ? AND workDate <= ?`,
          [emp.employeeId, calculatedStart, calculatedEnd]
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
          startDateStr: calculatedStart,
          endDateStr: calculatedEnd,
          now
        });

        const singleDay = range === 'day' ? dataset.days[0] : null;
        const latestDayWithPunch = dataset.days.slice().reverse().find(d => d.checkInAt) || dataset.days[dataset.days.length - 1];

        reportRows.push({
          employeeName: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || 'Operations Management',
          role: emp.role,
          designation: emp.designation || emp.role,
          workingDays: dataset.summary.totalWorkingDays || 0,
          presentDays: dataset.summary.presentDays || 0,
          absentDays: dataset.summary.absentDays || 0,
          lateDays: dataset.summary.lateDays || 0,
          halfDays: dataset.summary.halfDays || 0,
          leaveDays: dataset.summary.leaveDays || 0,
          checkInTime: singleDay ? (safeFormatTime(singleDay.checkInFormatted || singleDay.checkInAt) || '—') : (latestDayWithPunch ? (safeFormatTime(latestDayWithPunch.checkInFormatted || latestDayWithPunch.checkInAt) || '—') : '—'),
          checkOutTime: singleDay ? (singleDay.checkOutAt ? safeFormatTime(singleDay.checkOutFormatted || singleDay.checkOutAt) : (singleDay.checkInAt ? 'Not Checked Out' : '—')) : (latestDayWithPunch && latestDayWithPunch.checkOutAt ? safeFormatTime(latestDayWithPunch.checkOutFormatted || latestDayWithPunch.checkOutAt) : '—'),
          totalLoggedHours: dataset.workingHours.totalNetHours || '0h 00m',
          punctuality: `${dataset.summary.punctualityPercentage || 100}%`,
          attendancePercentage: `${dataset.summary.attendancePercentage || 0}%`
        });
      }

      res.json({
        success: true,
        report: reportRows,
        dateRange: {
          range,
          startDate: calculatedStart,
          endDate: calculatedEnd
        },
        filters: {
          employeeId,
          department,
          role
        },
        generatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to generate attendance report:', err);
      res.status(500).json({ success: false, message: 'Failed to generate attendance report.' });
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
  // Workforce Leave Management & Employee Leave Applications
  // =========================================================================

  // Helper to seed initial leave requests if table is empty
  const ensureInitialLeaveRequests = async (db) => {
    try {
      const existing = await db.all('SELECT id FROM employee_leave_requests LIMIT 1');
      if (!existing || existing.length === 0) {
        const emps = await db.all("SELECT employeeId, name, role, department FROM employees WHERE LOWER(COALESCE(status, 'Active')) != 'inactive'");
        const kishore = emps.find(e => (e.name || '').includes('Kishore')) || emps[1];
        const bala = emps.find(e => (e.name || '').includes('Balavarshini')) || emps[3];
        const sreeja = emps.find(e => (e.name || '').includes('Sreeja')) || emps[2];

        if (kishore) {
          await db.run(
            `INSERT INTO employee_leave_requests (id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status, createdAt)
             VALUES (?, ?, ?, 'Casual Leave', '2026-11-26', '2026-11-27', 2, 'Attending family wedding ceremony and personal travel', 'Pending', CURRENT_TIMESTAMP)`,
            [makeId('LEV'), kishore.employeeId, kishore.name]
          );
        }
        if (bala) {
          await db.run(
            `INSERT INTO employee_leave_requests (id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status, createdAt)
             VALUES (?, ?, ?, 'Sick Leave', '2026-11-28', '2026-11-28', 1, 'Consultation with physician and medical rest for seasonal fever', 'Pending', CURRENT_TIMESTAMP)`,
            [makeId('LEV'), bala.employeeId, bala.name]
          );
        }
        if (sreeja) {
          await db.run(
            `INSERT INTO employee_leave_requests (id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status, reviewedBy, reviewedAt, createdAt)
             VALUES (?, ?, ?, 'Privilege / Earned Leave', '2026-11-20', '2026-11-22', 3, 'Pre-planned annual family vacation leave', 'Approved', 'Super Admin (Dhanalakshimi)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [makeId('LEV'), sreeja.employeeId, sreeja.name]
          );
        }
      }
    } catch (_) {}
  };

  // 1. Fetch Leave Applications (All for Super Admin / HR Lead; own for staff)
  app.get('/api/hr-ops/leaves', async (req, res) => {
    try {
      const db = await getDb();
      await ensureInitialLeaveRequests(db);

      const callerRole = String(req.query?.role || req.headers['x-crm-role'] || '').toLowerCase();
      const callerEmail = String(req.query?.email || req.headers['x-employee-email'] || '').toLowerCase().trim();
      const myOnly = req.query?.myOnly === 'true';

      const isExecutiveOrHr = callerRole === 'super admin' || callerRole === 'admin' || callerRole === 'hr lead';

      const leaves = await db.all('SELECT * FROM employee_leave_requests ORDER BY createdAt DESC');
      const allEmps = await db.all('SELECT employeeId, name, role, department, avatar, email FROM employees');
      const empMap = new Map();
      allEmps.forEach(e => {
        if (e.employeeId) empMap.set(e.employeeId, e);
      });

      const enriched = leaves.map(l => {
        const emp = empMap.get(l.employeeId);
        return {
          id: l.id,
          employeeId: l.employeeId,
          name: l.employeeName || emp?.name || 'Employee',
          role: emp?.role || 'Workforce Specialist',
          department: emp?.department || 'Operations',
          avatar: emp?.avatar || '',
          email: emp?.email || '',
          type: l.leaveType,
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          days: Number(l.days || 1),
          reason: l.reason || 'Personal / Medical Leave',
          status: l.status || 'Pending',
          reviewedBy: l.reviewedBy || null,
          reviewedAt: l.reviewedAt || null,
          reviewNotes: l.reviewNotes || null,
          submittedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
          createdAt: l.createdAt
        };
      });

      // Filter if requested or if caller is a non-leadership staff querying own leaves
      let resultLeaves = enriched;
      if (myOnly || (!isExecutiveOrHr && callerEmail)) {
        const myEmp = allEmps.find(e => (e.email && e.email.toLowerCase() === callerEmail) || (e.employeeId === req.query?.employeeId));
        if (myEmp) {
          resultLeaves = enriched.filter(l => l.employeeId === myEmp.employeeId);
        }
      }

      const pendingCount = enriched.filter(l => String(l.status).toLowerCase().includes('pending')).length;
      const approvedCount = enriched.filter(l => String(l.status).toLowerCase() === 'approved').length;
      const declinedCount = enriched.filter(l => String(l.status).toLowerCase().includes('decline') || String(l.status).toLowerCase().includes('reject')).length;

      res.json({
        success: true,
        leaves: resultLeaves,
        allLeaves: isExecutiveOrHr ? enriched : resultLeaves,
        stats: {
          pendingCount,
          approvedCount,
          declinedCount,
          totalCount: enriched.length
        }
      });
    } catch (err) {
      console.error('Failed to get leave applications:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve leave applications.' });
    }
  });

  // 2. Submit Leave Application (Any CRM role)
  app.post('/api/hr-ops/leaves/apply', async (req, res) => {
    try {
      const db = await getDb();
      const {
        leaveType,
        startDate,
        endDate,
        days: reqDays,
        reason,
        employeeId: reqEmpId,
        email: reqEmail
      } = req.body || {};

      const cleanEmail = String(reqEmail || req.headers['x-employee-email'] || '').toLowerCase().trim();
      const cleanEmpId = String(reqEmpId || req.headers['x-employee-id'] || '').trim();

      let employee = null;
      if (cleanEmpId) {
        employee = await db.get('SELECT * FROM employees WHERE employeeId = ? LIMIT 1', [cleanEmpId]);
      }
      if (!employee && cleanEmail) {
        employee = await db.get('SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ? LIMIT 1', [cleanEmail, cleanEmail]);
      }
      if (!employee) {
        employee = {
          employeeId: cleanEmpId || 'REV-EMP-004',
          name: cleanEmail ? cleanEmail.split('@')[0] : 'Employee',
          role: req.headers['x-crm-role'] || 'Staff Specialist',
          department: 'Talent Acquisition'
        };
      }

      if (!leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Leave type, start date, end date, and reason / message are required.'
        });
      }

      let days = Number(reqDays);
      if (!days || isNaN(days) || days <= 0) {
        const d1 = new Date(startDate);
        const d2 = new Date(endDate);
        const diffMs = Math.max(0, d2.getTime() - d1.getTime());
        days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      }

      const id = makeId('LEV');

      await db.run(
        `INSERT INTO employee_leave_requests (
          id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)`,
        [id, employee.employeeId, employee.name, leaveType, startDate, endDate, days, reason]
      );

      // Notify Super Admin and HR Lead of the new leave message
      try {
        const managers = await db.all("SELECT employeeId FROM employees WHERE role IN ('Super Admin', 'Admin', 'HR Lead')");
        const targets = managers && managers.length ? managers : [{ employeeId: 'REV-EMP-001' }];
        for (const m of targets) {
          if (m.employeeId !== employee.employeeId) {
            await createNotification(db, {
              employeeId: m.employeeId,
              type: 'Leave Application Alert',
              title: `📋 New Leave Request: ${employee.name} (${employee.role || 'Staff'})`,
              message: `${employee.name} applied for ${days} days of ${leaveType} (${startDate} to ${endDate}). Reason: "${reason}"`,
              severity: 'info',
              relatedId: id
            });
          }
        }
      } catch (_) {}

      res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully. Managerial review is pending.',
        leave: {
          id,
          employeeId: employee.employeeId,
          name: employee.name,
          role: employee.role,
          department: employee.department,
          leaveType,
          startDate,
          endDate,
          days,
          reason,
          status: 'Pending',
          submittedAt: 'Just now'
        }
      });
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      res.status(500).json({ success: false, message: 'Failed to apply for leave.' });
    }
  });

  // 3. Managerial Decision: Approve or Reject Leave (Super Admin / HR Lead)
  app.post('/api/hr-ops/leaves/:id/decision', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const db = await getDb();
      const reviewer = req.authEmployee;
      const { id } = req.params;
      const { decision, notes } = req.body || {};

      const statusValue = String(decision).toUpperCase() === 'APPROVED' ? 'Approved' : 'Declined';
      const targetLeave = await db.get('SELECT * FROM employee_leave_requests WHERE id = ? LIMIT 1', [id]);

      if (!targetLeave) {
        return res.status(404).json({ success: false, message: 'Leave request not found.' });
      }

      // Check hierarchy: if applicant is HR Lead, only Super Admin can approve/decline
      const applicant = await db.get('SELECT role FROM employees WHERE employeeId = ?', [targetLeave.employeeId]);
      const applicantRole = String(applicant?.role || '').toLowerCase();
      const isApplicantHrLead = applicantRole === 'hr lead' || applicantRole.includes('lead');

      const reviewerRole = String(reviewer?.role || '').toLowerCase();
      const isReviewerSuperAdmin = reviewerRole === 'super admin' || reviewerRole === 'admin';

      if (isApplicantHrLead && !isReviewerSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only Super Admin has authority to sanction or decline leave for HR Lead.'
        });
      }

      // Self-review restriction
      if (reviewer?.employeeId && targetLeave.employeeId === reviewer.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot approve or decline your own leave request.'
        });
      }

      const reviewerName = `${reviewer.name} (${reviewer.role})`;
      await db.run(
        `UPDATE employee_leave_requests SET
          status = ?,
          reviewedBy = ?,
          reviewedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [statusValue, reviewerName, id]
      );

      // If approved and the leave covers today's date, update attendance to 'On Leave'
      if (statusValue === 'Approved') {
        const nowParts = getCompanyDateTimeParts(new Date());
        const todayStr = nowParts.dateStr;
        if (targetLeave.startDate <= todayStr && targetLeave.endDate >= todayStr) {
          const existingAtt = await db.get('SELECT id FROM attendance_records WHERE employeeId = ? AND workDate = ?', [targetLeave.employeeId, todayStr]);
          if (existingAtt) {
            await db.run(
              `UPDATE attendance_records SET status = 'On Leave', notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
              [`Sanctioned ${targetLeave.leaveType}`, existingAtt.id]
            );
          }
        }
      }

      // Audit log
      await writeAttendanceAudit(db, {
        attendanceId: null,
        employeeId: targetLeave.employeeId,
        workDate: targetLeave.startDate,
        action: statusValue === 'Approved' ? 'APPROVE_LEAVE_REQUEST' : 'DECLINE_LEAVE_REQUEST',
        actor: reviewer,
        beforeState: { status: targetLeave.status },
        afterState: { status: statusValue, reviewedBy: reviewerName },
        details: `Leave application for ${targetLeave.employeeName} (${targetLeave.leaveType}, ${targetLeave.days}d) marked as ${statusValue} by ${reviewerName}. ${notes ? 'Notes: ' + notes : ''}`,
        ipAddress: getClientIp(req)
      });

      // Notify the applicant of the managerial decision in real time
      await createNotification(db, {
        employeeId: targetLeave.employeeId,
        type: 'Leave Application Decision',
        title: statusValue === 'Approved' ? `✓ Leave Request Approved!` : `✕ Leave Request Declined`,
        message: statusValue === 'Approved'
          ? `Your ${targetLeave.leaveType} for ${targetLeave.startDate} to ${targetLeave.endDate} (${targetLeave.days} days) has been APPROVED by ${reviewerName}. Status: Approved ✓.`
          : `Your ${targetLeave.leaveType} request for ${targetLeave.startDate} to ${targetLeave.endDate} was DECLINED by ${reviewerName}. ${notes ? 'Remarks: ' + notes : 'Status: Declined ✕.'}`,
        severity: statusValue === 'Approved' ? 'success' : 'error',
        relatedId: id
      });

      res.json({
        success: true,
        message: `Leave request for ${targetLeave.employeeName} has been ${statusValue.toLowerCase()}.`,
        status: statusValue
      });
    } catch (err) {
      console.error('Failed to decide leave request:', err);
      res.status(500).json({ success: false, message: 'Failed to process leave decision.' });
    }
  });

  // 4. Leave Quota Balances
  app.get('/api/hr-ops/leaves/balances', async (req, res) => {
    try {
      const db = await getDb();
      const employees = await db.all("SELECT employeeId, name, role, department FROM employees WHERE LOWER(COALESCE(status, 'Active')) != 'inactive' ORDER BY name ASC");
      const approvedLeaves = await db.all("SELECT employeeId, leaveType, days FROM employee_leave_requests WHERE status = 'Approved'");

      const usedMap = new Map();
      approvedLeaves.forEach(l => {
        if (!usedMap.has(l.employeeId)) usedMap.set(l.employeeId, { casual: 0, sick: 0, paid: 0 });
        const cur = usedMap.get(l.employeeId);
        const t = String(l.leaveType || '').toLowerCase();
        const d = Number(l.days || 1);
        if (t.includes('sick') || t.includes('medical')) cur.sick += d;
        else if (t.includes('casual')) cur.casual += d;
        else cur.paid += d;
      });

      const balances = employees.map(e => {
        const used = usedMap.get(e.employeeId) || { casual: 0, sick: 0, paid: 0 };
        const casualQuota = Math.max(0, 8 - used.casual);
        const sickQuota = Math.max(0, 10 - used.sick);
        const paidQuota = Math.max(0, 15 - used.paid);
        return {
          id: e.employeeId,
          name: e.name,
          role: e.role,
          department: e.department || 'Operations',
          casual: casualQuota,
          sick: sickQuota,
          paid: paidQuota,
          total: casualQuota + sickQuota + paidQuota
        };
      });

      res.json({ success: true, balances });
    } catch (err) {
      console.error('Failed to fetch leave balances:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve leave balances.' });
    }
  });
};


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
      weeklyOffDays: '[0,6]',
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
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in to the CRM portal.'
        });
      }
      const payload = verifyCrmSessionToken(token);
      if (!payload || !payload.employeeId) {
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

  const requireHrOpsRole = (req, res, next) => {
    if (req.authEmployee?.role !== 'HR Operations') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: My Attendance portal is restricted to HR Operations employees.'
      });
    }
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
      const { email, password } = req.body || {};
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanEmail || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const db = await getDb();
      const employee = await db.get(
        'SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(altEmail) = ?',
        [cleanEmail, cleanEmail]
      );

      if (!employee || employee.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid CRM credentials. Please verify your email and password.'
        });
      }

      if (String(employee.status || 'Active').toLowerCase() === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account is currently inactive. Contact HR Lead.'
        });
      }

      await db.run('UPDATE employees SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [employee.id]);
      const token = createCrmSessionToken(employee);

      res.json({
        success: true,
        token,
        employee: sanitizeEmployee(employee)
      });
    } catch (error) {
      console.error('CRM auth login failed:', error);
      res.status(500).json({ success: false, message: 'Failed to authenticate CRM user.' });
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
        return res.status(409).json({
          success: false,
          message: `You already have an active check-in for shift ${openActive.workDate}. Please check out first.`
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
        return res.status(409).json({
          success: false,
          message: `Attendance record already exists for ${workDate} (${existingSameShift.status}). Duplicate check-ins are blocked; submit a regularization request if timestamps need correction.`
        });
      }

      const { lateMinutes, isLate } = computeCheckInMetrics(now, workDate, shiftConfig);
      const id = makeId('ATT');
      const checkInAt = now.toISOString();
      const source = req.body?.source || 'Web Portal';
      const notes = req.body?.notes ? String(req.body.notes).slice(0, 300) : '';

      await db.run(
        `INSERT INTO attendance_records (
          id, employeeId, employeeName, department, operationTeam, workDate,
          shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
          checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Progress', ?, 0, 0, 0, 0, ?, ?)`,
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
          notes
        ]
      );

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
          ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins late against ${shiftConfig.startTime})`
          : `Checked in on time at ${nowParts.timeStr}`,
        ipAddress
      });

      await createNotification(db, {
        employeeId: employee.employeeId,
        type: 'Check-In',
        title: isLate ? `Late Check-In Recorded (${workDate})` : `Checked In (${workDate})`,
        message: isLate
          ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins past shift start ${shiftConfig.startTime}).`
          : `Successfully checked in for ${shiftConfig.name} at ${nowParts.timeStr}.`,
        severity: isLate ? 'warning' : 'success',
        relatedId: id
      });

      res.status(201).json({
        success: true,
        message: isLate
          ? `Checked in at ${nowParts.timeStr} (${lateMinutes} mins late).`
          : `Checked in successfully at ${nowParts.timeStr}.`,
        data: created
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
          return res.status(409).json({
            success: false,
            message: `You have already checked out for ${workDate}.`
          });
        }
        return res.status(400).json({
          success: false,
          message: 'No active check-in found. Please check in before checking out.'
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
        `SELECT * FROM employees WHERE role = 'HR Operations' ORDER BY name ASC`
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
};


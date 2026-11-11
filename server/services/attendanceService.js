/**
 * Attendance Policy, Timezone, Working Hours & Calendar Computation Service
 * Handles real SQLite attendance records, overnight shifts, break tracking,
 * missed-checkout detection, holiday/leave resolution, and server-side audit state.
 */

export const COMPANY_TIMEZONE = process.env.COMPANY_TIMEZONE || 'Asia/Kolkata';

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Returns local company wall-clock date/time components for a JS Date or ISO timestamp.
 */
export const getCompanyDateTimeParts = (dateInput = new Date(), timeZone = COMPANY_TIMEZONE) => {
  const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = {};
  for (const p of formatter.formatToParts(dateObj)) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour === '24' ? '00' : parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  const dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  const timeStr = `${pad2(hour)}:${pad2(minute)}`;
  const utcDay = new Date(Date.UTC(year, month - 1, day));

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dateStr,
    timeStr,
    dayOfWeek: utcDay.getUTCDay(), // 0 = Sun ... 6 = Sat
    dayName: utcDay.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    epochMs: dateObj.getTime()
  };
};

/**
 * Gregorian date arithmetic on 'YYYY-MM-DD' strings.
 */
export const addDaysToDateStr = (dateStr, deltaDays) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
};

export const getDayOfWeek = (dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const getDayName = (dateStr, style = 'short') => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { weekday: style, timeZone: 'UTC' });
};

/**
 * Computes timezone offset in milliseconds (local - UTC) at a given UTC instant.
 */
const getTimezoneOffsetMs = (utcMs, timeZone = COMPANY_TIMEZONE) => {
  const parts = getCompanyDateTimeParts(new Date(utcMs), timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - utcMs;
};

/**
 * Converts a company local ('YYYY-MM-DD', 'HH:mm') pair into an exact UTC epoch ms and ISO string.
 */
export const companyLocalToUtcDate = (dateStr, timeHHMM = '00:00', timeZone = COMPANY_TIMEZONE) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const [hh, mm] = String(timeHHMM || '00:00').split(':').map(Number);
  const guessUtc = Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0);
  const offset = getTimezoneOffsetMs(guessUtc, timeZone);
  const adjustedUtc = guessUtc - offset;
  // Second pass handles rare DST boundaries accurately
  const offset2 = getTimezoneOffsetMs(adjustedUtc, timeZone);
  return new Date(guessUtc - offset2);
};

/**
 * Computes shift window bounds in UTC milliseconds for a given shift start workDate.
 */
export const getShiftWindowMs = (workDate, shiftConfig) => {
  const shiftStartDate = companyLocalToUtcDate(workDate, shiftConfig.startTime || '09:00');
  const endDateStr = Number(shiftConfig.isOvernight) === 1 ? addDaysToDateStr(workDate, 1) : workDate;
  const shiftEndDate = companyLocalToUtcDate(endDateStr, shiftConfig.endTime || '18:00');
  return {
    shiftStartMs: shiftStartDate.getTime(),
    shiftEndMs: shiftEndDate.getTime()
  };
};

/**
 * Determines whether an open (no checkOutAt) prior-shift record is stale -> Missing Checkout.
 * Allows overnight shifts to cross midnight cleanly and gives a 4-hour post-shift checkout grace buffer.
 */
export const isStaleMissingCheckout = (attendanceRow, nowMs = Date.now(), shiftConfig = null) => {
  if (!attendanceRow || attendanceRow.checkOutAt || !attendanceRow.checkInAt) return false;
  if (attendanceRow.status === 'Missing Checkout') return true;
  if (attendanceRow.status !== 'In Progress' && attendanceRow.status !== 'Late') return false;

  const isOvernight = Number(attendanceRow.isOvernightShift || shiftConfig?.isOvernight || 0) === 1;
  const endTime = attendanceRow.shiftEnd || shiftConfig?.endTime || '18:00';
  const startTime = attendanceRow.shiftStart || shiftConfig?.startTime || '09:00';

  const { shiftEndMs } = getShiftWindowMs(attendanceRow.workDate, {
    startTime,
    endTime,
    isOvernight: isOvernight ? 1 : 0
  });

  // 4 hours post-shift grace; if current time exceeds shiftEnd + 4h OR > 16h from checkIn, flag missing checkout
  const checkInMs = new Date(attendanceRow.checkInAt).getTime();
  const pastShiftBuffer = nowMs > shiftEndMs + 4 * 60 * 60 * 1000;
  const exceededMaxShift = nowMs - checkInMs > 16 * 60 * 60 * 1000;

  return pastShiftBuffer || exceededMaxShift;
};

/**
 * Determines the effective workDate for an incoming check-in based on shift config.
 * For an overnight shift (e.g. 22:00-07:00), checking in at 00:30 AM maps to the previous date's night shift.
 */
export const resolveCheckInWorkDate = (nowParts, shiftConfig) => {
  if (Number(shiftConfig?.isOvernight) === 1) {
    const [endH] = String(shiftConfig.endTime || '07:00').split(':').map(Number);
    // Early morning check-in before shift ends belongs to previous calendar date's overnight shift
    if (nowParts.hour < endH) {
      return addDaysToDateStr(nowParts.dateStr, -1);
    }
  }
  return nowParts.dateStr;
};

/**
 * Calculates late arrival minutes upon check-in relative to shiftStart + graceMinutes.
 */
export const computeCheckInMetrics = (checkInDate, workDate, shiftConfig) => {
  const { shiftStartMs } = getShiftWindowMs(workDate, shiftConfig);
  const diffFromStartMin = Math.floor((checkInDate.getTime() - shiftStartMs) / 60000);
  const graceMinutes = Number(shiftConfig?.graceMinutes ?? 15);
  const isLate = diffFromStartMin > graceMinutes;
  return {
    lateMinutes: isLate ? diffFromStartMin : 0,
    isLate
  };
};

/**
 * Calculates gross, break deduction, net working hours, overtime, and final status on check-out.
 */
export const computeCheckOutMetrics = (attendanceRow, checkOutDate, totalBreakMinutes, shiftConfig) => {
  const checkInMs = new Date(attendanceRow.checkInAt).getTime();
  const checkOutMs = checkOutDate.getTime();
  const grossMinutes = Math.max(0, Math.round((checkOutMs - checkInMs) / 60000));
  const clampedBreakMinutes = Math.min(grossMinutes, Math.max(0, Math.round(Number(totalBreakMinutes) || 0)));
  const netWorkMinutes = Math.max(0, grossMinutes - clampedBreakMinutes);

  const overtimeEnabled = Number(shiftConfig?.overtimeEnabled ?? 1) === 1;
  const otThreshold = Number(shiftConfig?.overtimeThresholdMinutes ?? 480);
  const overtimeMinutes = overtimeEnabled && netWorkMinutes > otThreshold ? netWorkMinutes - otThreshold : 0;

  const isLate = Number(attendanceRow.lateMinutes || 0) > 0;
  const finalStatus = isLate ? 'Late' : 'Present';

  return {
    grossMinutes,
    totalBreakMinutes: clampedBreakMinutes,
    netWorkMinutes,
    overtimeMinutes,
    finalStatus
  };
};

/**
 * Parses regularization HH:mm inputs + workDate into server UTC ISO timestamps cleanly,
 * automatically rolling check-out across midnight when checkOut <= checkIn or shift is overnight.
 */
export const resolveRegularizationTimestamps = (workDate, requestedCheckInHHMM, requestedCheckOutHHMM, shiftConfig) => {
  let checkInIso = null;
  let checkOutIso = null;

  if (requestedCheckInHHMM) {
    // Support full ISO or 'HH:mm'
    if (String(requestedCheckInHHMM).includes('T')) {
      checkInIso = new Date(requestedCheckInHHMM).toISOString();
    } else {
      checkInIso = companyLocalToUtcDate(workDate, requestedCheckInHHMM).toISOString();
    }
  }

  if (requestedCheckOutHHMM) {
    if (String(requestedCheckOutHHMM).includes('T')) {
      checkOutIso = new Date(requestedCheckOutHHMM).toISOString();
    } else {
      let outDateStr = workDate;
      if (requestedCheckInHHMM && !String(requestedCheckInHHMM).includes('T')) {
        if (requestedCheckOutHHMM <= requestedCheckInHHMM) {
          outDateStr = addDaysToDateStr(workDate, 1);
        }
      } else if (Number(shiftConfig?.isOvernight) === 1) {
        outDateStr = addDaysToDateStr(workDate, 1);
      }
      checkOutIso = companyLocalToUtcDate(outDateStr, requestedCheckOutHHMM).toISOString();
    }
  }

  return { checkInIso, checkOutIso };
};

/**
 * Parses employee shift weeklyOffDays safely (default Sat/Sun [0, 6]).
 */
export const parseWeeklyOffDays = (weeklyOffJson) => {
  if (!weeklyOffJson) return [0, 6];
  try {
    const parsed = JSON.parse(weeklyOffJson);
    if (Array.isArray(parsed)) return parsed.map(Number);
  } catch (_) {}
  return [0, 6];
};

/**
 * Formats integer minutes cleanly into "Xh Ym".
 */
export const formatMinutesDuration = (mins) => {
  const m = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${pad2(rem)}m`;
};

/**
 * Combines real DB attendance records, breaks, holidays, approved leaves, and shift rules
 * into unified daily timeline records + monthly KPI & Working Hours summaries.
 * Strictly obeys future-date & pre-cutoff non-absent policies.
 */
export const buildAttendanceDataset = ({
  employee,
  shiftConfig,
  dbRecords = [],
  breaksByAttendanceId = {},
  holidays = [],
  leaveRequests = [],
  startDateStr,
  endDateStr,
  now = new Date()
}) => {
  const nowParts = getCompanyDateTimeParts(now);
  const todayStr = nowParts.dateStr;
  const weeklyOffDays = parseWeeklyOffDays(shiftConfig?.weeklyOffDays);
  const cutoffHour = Number(shiftConfig?.absentCutoffHour ?? 14);

  const recordsByDate = {};
  for (const r of dbRecords) {
    recordsByDate[r.workDate] = r;
  }

  const holidayByDate = {};
  for (const h of holidays) {
    holidayByDate[h.holidayDate] = h;
  }

  const approvedLeaves = leaveRequests.filter(l => String(l.status || '').toLowerCase() === 'approved');
  const findLeaveForDate = (dateStr) =>
    approvedLeaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate) || null;

  const days = [];
  let cursor = startDateStr;
  let guard = 0;

  while (cursor <= endDateStr && guard < 366) {
    guard++;
    const dbRec = recordsByDate[cursor] || null;
    const holiday = holidayByDate[cursor] || null;
    const approvedLeave = findLeaveForDate(cursor);
    const dow = getDayOfWeek(cursor);
    const dayName = getDayName(cursor, 'short');
    const isWeeklyOff = weeklyOffDays.includes(dow);

    if (dbRec) {
      const breaks = breaksByAttendanceId[dbRec.id] || [];
      const staleMissing = !dbRec.checkOutAt && isStaleMissingCheckout(dbRec, now.getTime(), shiftConfig);
      let effectiveStatus = staleMissing ? 'Missing Checkout' : dbRec.status;
      if (effectiveStatus === 'In Progress' && Number(dbRec.lateMinutes || 0) > 0 && dbRec.checkOutAt) {
        effectiveStatus = 'Late';
      }

      days.push({
        id: dbRec.id,
        date: cursor,
        day: dayName,
        shiftId: dbRec.shiftId,
        shiftName: dbRec.shiftName || shiftConfig.name,
        shiftTiming: `${dbRec.shiftStart || shiftConfig.startTime} - ${dbRec.shiftEnd || shiftConfig.endTime}`,
        isOvernightShift: Number(dbRec.isOvernightShift || shiftConfig.isOvernight || 0) === 1,
        checkInAt: dbRec.checkInAt,
        checkOutAt: dbRec.checkOutAt,
        checkInFormatted: dbRec.checkInAt ? getCompanyDateTimeParts(dbRec.checkInAt).timeStr : null,
        checkOutFormatted: dbRec.checkOutAt ? getCompanyDateTimeParts(dbRec.checkOutAt).timeStr : null,
        totalBreakMinutes: Number(dbRec.totalBreakMinutes || 0),
        grossMinutes: Number(dbRec.grossMinutes || 0),
        netWorkMinutes: Number(dbRec.netWorkMinutes || 0),
        overtimeMinutes: Number(dbRec.overtimeMinutes || 0),
        lateMinutes: Number(dbRec.lateMinutes || 0),
        status: effectiveStatus,
        source: dbRec.source || 'Web Portal',
        notes: dbRec.notes || '',
        breaks,
        hasRealRecord: true,
        isMissingCheckout: staleMissing || effectiveStatus === 'Missing Checkout',
        isLocked: Number(dbRec.isLocked || 0) === 1
      });
    } else if (holiday) {
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: 'Holiday',
        source: 'Company Calendar',
        notes: holiday.name,
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    } else if (approvedLeave) {
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: 'On Leave',
        source: 'Leave Policy',
        notes: `${approvedLeave.leaveType}${approvedLeave.reason ? `: ${approvedLeave.reason}` : ''}`,
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    } else if (isWeeklyOff) {
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: 'Weekly Off',
        source: 'Shift Policy',
        notes: 'Scheduled Weekly Off',
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    } else if (cursor > todayStr) {
      // Future dates MUST never be marked absent
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: 'Upcoming',
        source: 'Schedule',
        notes: 'Scheduled Workday',
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    } else if (cursor === todayStr) {
      // Today before attendance cutoff MUST NOT be marked absent
      const pastCutoff = nowParts.hour >= cutoffHour;
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: pastCutoff ? 'Absent' : 'Not Checked In',
        source: 'Live Status',
        notes: pastCutoff ? `No check-in recorded before ${pad2(cutoffHour)}:00 cutoff` : 'Awaiting Check-In',
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    } else {
      // Past workday before today with no check-in/holiday/leave/weekoff
      days.push({
        id: null,
        date: cursor,
        day: dayName,
        shiftId: shiftConfig.id,
        shiftName: shiftConfig.name,
        shiftTiming: `${shiftConfig.startTime} - ${shiftConfig.endTime}`,
        isOvernightShift: Number(shiftConfig.isOvernight || 0) === 1,
        checkInAt: null,
        checkOutAt: null,
        checkInFormatted: null,
        checkOutFormatted: null,
        totalBreakMinutes: 0,
        grossMinutes: 0,
        netWorkMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: 0,
        status: 'Absent',
        source: 'Policy Engine',
        notes: 'No attendance check-in recorded',
        breaks: [],
        hasRealRecord: false,
        isMissingCheckout: false,
        isLocked: false
      });
    }

    cursor = addDaysToDateStr(cursor, 1);
  }

  // Monthly / Range Summary Metrics computed directly from days array
  const onTimePresentDays = days.filter(d => d.status === 'Present').length;
  const lateArrivals = days.filter(d => d.status === 'Late' || (d.status === 'In Progress' && d.lateMinutes > 0)).length;
  const activeInProgressDays = days.filter(d => d.status === 'In Progress').length;
  const missingCheckoutDays = days.filter(d => d.status === 'Missing Checkout').length;
  const presentDays = onTimePresentDays + days.filter(d => d.status === 'Late').length + activeInProgressDays;
  const absentDays = days.filter(d => d.status === 'Absent').length;
  const leaveDays = days.filter(d => d.status === 'On Leave').length;
  const holidayDays = days.filter(d => d.status === 'Holiday').length;
  const weeklyOffDaysCount = days.filter(d => d.status === 'Weekly Off').length;

  // Elapsed scheduled workdays denominator for attendance %
  const workedAndAbsentDenominator = presentDays + missingCheckoutDays + absentDays;
  const attendancePercentage =
    workedAndAbsentDenominator > 0
      ? Number(((presentDays / workedAndAbsentDenominator) * 100).toFixed(1))
      : 100.0;

  // Working Hours Summary (across completed / worked records in range)
  const workedDaysWithMinutes = days.filter(d => d.hasRealRecord && d.netWorkMinutes > 0);
  const totalNetWorkMinutes = days.reduce((acc, d) => acc + (d.netWorkMinutes || 0), 0);
  const totalBreakMinutes = days.reduce((acc, d) => acc + (d.totalBreakMinutes || 0), 0);
  const totalOvertimeMinutes = days.reduce((acc, d) => acc + (d.overtimeMinutes || 0), 0);
  const totalLateMinutes = days.reduce((acc, d) => acc + (d.lateMinutes || 0), 0);
  const avgDailyMinutes = workedDaysWithMinutes.length > 0 ? Math.round(totalNetWorkMinutes / workedDaysWithMinutes.length) : 0;

  return {
    days,
    nowParts,
    summary: {
      presentDays,
      onTimePresentDays,
      absentDays,
      leaveDays,
      lateArrivals,
      activeInProgressDays,
      missingCheckoutDays,
      holidayDays,
      weeklyOffDays: weeklyOffDaysCount,
      attendancePercentage
    },
    workingHours: {
      monthlyTotalMinutes: totalNetWorkMinutes,
      monthlyTotalFormatted: formatMinutesDuration(totalNetWorkMinutes),
      avgDailyMinutes,
      avgDailyFormatted: formatMinutesDuration(avgDailyMinutes),
      totalBreakMinutes,
      totalBreakFormatted: formatMinutesDuration(totalBreakMinutes),
      overtimeMinutes: totalOvertimeMinutes,
      overtimeFormatted: formatMinutesDuration(totalOvertimeMinutes),
      overtimeEnabled: Number(shiftConfig?.overtimeEnabled ?? 1) === 1,
      lateArrivalsCount: lateArrivals,
      totalLateMinutes,
      workedDaysCount: workedDaysWithMinutes.length
    }
  };
};


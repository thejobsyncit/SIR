/**
 * Shared IST-safe Shift Definitions & Resolver Service
 * Used identically by HR Operations Dashboard (/api/hr-ops/dashboard/summary)
 * and HR Operations My Shift Calendar (/api/hr-ops/shifts/me).
 */

export const COMPANY_TIMEZONE = 'Asia/Kolkata';

export const SHIFT_DEFINITIONS = {
  GENERAL: {
    type: 'General',
    shiftId: 'SHIFT-GENERAL',
    name: 'General Shift',
    start: '09:00',
    end: '18:00',
    scheduledLoginTime: '9:00 AM',
    scheduledLogoutTime: '6:00 PM',
    isOff: false
  },
  MORNING: {
    type: 'Morning',
    shiftId: 'SHIFT-MORNING',
    name: 'Morning Shift',
    start: '07:00',
    end: '14:00',
    scheduledLoginTime: '7:00 AM',
    scheduledLogoutTime: '2:00 PM',
    isOff: false
  },
  EVENING: {
    type: 'Evening',
    shiftId: 'SHIFT-EVENING',
    name: 'Evening Shift',
    start: '14:00',
    end: '21:00',
    scheduledLoginTime: '2:00 PM',
    scheduledLogoutTime: '9:00 PM',
    isOff: false
  },
  WEEKLY_OFF: {
    type: 'Weekly Off',
    shiftId: 'SHIFT-OFF',
    name: 'Weekly Off',
    start: '00:00',
    end: '00:00',
    scheduledLoginTime: '—',
    scheduledLogoutTime: '—',
    isOff: true
  }
};

export const formatHHMM12Hour = (hhmm) => {
  if (!hhmm || !String(hhmm).includes(':')) return hhmm || '—';
  const [hStr, mStr] = String(hhmm).split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

/**
 * Safely compute day of week (0 = Sunday .. 6 = Saturday) from plain 'YYYY-MM-DD'
 * using Date.UTC so server local timezone (e.g. UTC on Vercel) never shifts the day.
 */
export const getDayOfWeekFromDateStr = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) return 0;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const isSunday = (dateStr) => getDayOfWeekFromDateStr(dateStr) === 0;

export const getCurrentIstDateStr = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: COMPANY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
};

export const getMonthDateList = (monthStr) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(String(monthStr))) return [];
  const [y, m] = String(monthStr).split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const out = [];
  for (let day = 1; day <= daysInMonth; day++) {
    out.push(`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return out;
};

const normalizeShiftDefinitionFromAssignment = (asgn) => {
  const rawId = String(asgn.shiftId || asgn.shiftid || '').toUpperCase();
  const rawName = String(asgn.shiftName || asgn.shiftname || '').toLowerCase();

  let base = SHIFT_DEFINITIONS.GENERAL;
  if (rawId === 'SHIFT-OFF' || rawName.includes('off')) {
    base = SHIFT_DEFINITIONS.WEEKLY_OFF;
  } else if (rawId === 'SHIFT-MORNING' || rawName.includes('morning')) {
    base = SHIFT_DEFINITIONS.MORNING;
  } else if (rawId === 'SHIFT-EVENING' || rawName.includes('evening')) {
    base = SHIFT_DEFINITIONS.EVENING;
  }

  const start = asgn.scheduledStartTime || asgn.scheduledstarttime || base.start;
  const end = asgn.scheduledEndTime || asgn.scheduledendtime || base.end;
  const cleanName = (asgn.shiftName || asgn.shiftname || base.name).replace(/\s*\([^)]*\)\s*$/, '').trim();

  return {
    type: base.type,
    shiftId: asgn.shiftId || asgn.shiftid || base.shiftId,
    name: cleanName || base.name,
    start,
    end,
    scheduledLoginTime: asgn.scheduledLoginTime || asgn.scheduledlogintime || (base.isOff ? '—' : formatHHMM12Hour(start)),
    scheduledLogoutTime: asgn.scheduledLogoutTime || asgn.scheduledlogouttime || (base.isOff ? '—' : formatHHMM12Hour(end)),
    isOff: base.isOff
  };
};

const parseApplicableDays = (rawDays) => {
  if (Array.isArray(rawDays)) return rawDays.map(Number);
  if (typeof rawDays === 'string' && rawDays.trim()) {
    try {
      const parsed = JSON.parse(rawDays);
      if (Array.isArray(parsed)) return parsed.map(Number);
    } catch (_) {}
  }
  return [1, 2, 3, 4, 5, 6];
};

const getAssignmentTimestampMs = (a) => {
  const raw = a.assignedAt || a.assignedat || a.updatedAt || a.updatedat || a.createdAt || a.createdat || 0;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
};

/**
 * Resolve the authoritative shift for a given 'YYYY-MM-DD' date from a list of assignments.
 * Priority:
 *  1. Active 'one_day' assignment for dateStr (newest wins)
 *  2. Active 'weekly' assignment covering dateStr and matching dayOfWeek (newest wins)
 *  3. Active 'monthly' assignment covering dateStr and matching dayOfWeek (newest wins)
 *  4. Default: Sunday = Weekly Off, Mon-Sat = General Shift (9:00 AM - 6:00 PM)
 */
export const resolveShiftForDate = (dateStr, assignments = []) => {
  const dow = getDayOfWeekFromDateStr(dateStr);
  const active = (assignments || [])
    .filter((a) => String(a?.status || '').toLowerCase() === 'active')
    .sort((a, b) => getAssignmentTimestampMs(b) - getAssignmentTimestampMs(a));

  const matchesDateRange = (a) => {
    const start = String(a.startDate || a.startdate || '').slice(0, 10);
    const end = String(a.endDate || a.enddate || '').slice(0, 10);
    if (!start || start > dateStr) return false;
    if (end && end < dateStr) return false;
    return true;
  };

  // 1. One-day explicit assignment
  const oneDay = active.find((a) => {
    const freq = String(a.frequency || 'one_day').toLowerCase();
    if (freq !== 'one_day') return false;
    return matchesDateRange(a);
  });
  if (oneDay) {
    const def = normalizeShiftDefinitionFromAssignment(oneDay);
    return {
      date: dateStr,
      ...def,
      source: 'assigned',
      assignmentId: oneDay.id,
      frequency: oneDay.frequency || 'one_day',
      startDate: String(oneDay.startDate || oneDay.startdate || dateStr).slice(0, 10),
      endDate: String(oneDay.endDate || oneDay.enddate || dateStr).slice(0, 10)
    };
  }

  // 2. Weekly then Monthly recurring assignments
  for (const freqTarget of ['weekly', 'monthly']) {
    const match = active.find((a) => {
      if (String(a.frequency || '').toLowerCase() !== freqTarget) return false;
      if (!matchesDateRange(a)) return false;
      const days = parseApplicableDays(a.applicableDays ?? a.applicabledays);
      return days.includes(dow);
    });
    if (match) {
      const def = normalizeShiftDefinitionFromAssignment(match);
      return {
        date: dateStr,
        ...def,
        source: 'assigned',
        assignmentId: match.id,
        frequency: match.frequency,
        startDate: String(match.startDate || match.startdate || dateStr).slice(0, 10),
        endDate: String(match.endDate || match.enddate || dateStr).slice(0, 10)
      };
    }
  }

  // 3. Default baseline (Sunday = Weekly Off, Mon-Sat = General Shift)
  const fallback = dow === 0 ? SHIFT_DEFINITIONS.WEEKLY_OFF : SHIFT_DEFINITIONS.GENERAL;
  return {
    date: dateStr,
    ...fallback,
    source: 'default',
    assignmentId: null,
    frequency: null,
    startDate: null,
    endDate: null
  };
};

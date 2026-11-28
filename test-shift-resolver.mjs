import assert from 'node:assert/strict';
import { resolveShiftForDate, isSunday, SHIFT_DEFINITIONS } from './server/services/shiftService.js';

// 1. Sunday default -> Weekly Off
{
  const res = resolveShiftForDate('2026-11-29', []);
  assert.equal(isSunday('2026-11-29'), true);
  assert.equal(res.type, SHIFT_DEFINITIONS.WEEKLY_OFF.type);
  assert.equal(res.name, 'Weekly Off');
  assert.equal(res.isOff, true);
  assert.equal(res.source, 'default');
}

// 2. Monday default -> General Shift (9:00 AM - 6:00 PM)
{
  const res = resolveShiftForDate('2026-11-30', []);
  assert.equal(isSunday('2026-11-30'), false);
  assert.equal(res.type, SHIFT_DEFINITIONS.GENERAL.type);
  assert.equal(res.name, 'General Shift');
  assert.equal(res.start, '09:00');
  assert.equal(res.end, '18:00');
  assert.equal(res.isOff, false);
  assert.equal(res.source, 'default');
}

// 3. Assigned Morning shift on a Wednesday
{
  const assignments = [
    {
      id: 'SFA-1',
      employeeId: 'REV-EMP-006',
      shiftId: 'SHIFT-MORNING',
      shiftName: 'Morning Shift',
      scheduledStartTime: '07:00',
      scheduledEndTime: '14:00',
      scheduledLoginTime: '7:00 AM',
      scheduledLogoutTime: '2:00 PM',
      frequency: 'one_day',
      startDate: '2026-12-02', // Wednesday
      endDate: '2026-12-02',
      status: 'Active',
      assignedAt: '2026-11-28T05:00:00.000Z'
    }
  ];
  const res = resolveShiftForDate('2026-12-02', assignments);
  assert.equal(res.type, 'Morning');
  assert.equal(res.name, 'Morning Shift');
  assert.equal(res.start, '07:00');
  assert.equal(res.end, '14:00');
  assert.equal(res.source, 'assigned');
  assert.equal(res.assignmentId, 'SFA-1');
}

// 4. Date-range assignment (weekly/monthly)
{
  const assignments = [
    {
      id: 'SFA-RANGE',
      employeeId: 'REV-EMP-006',
      shiftId: 'SHIFT-EVENING',
      shiftName: 'Evening Shift',
      scheduledStartTime: '14:00',
      scheduledEndTime: '21:00',
      frequency: 'weekly',
      startDate: '2026-12-07',
      endDate: '2026-12-12',
      applicableDays: JSON.stringify([1, 2, 3, 4, 5, 6]),
      status: 'Active',
      assignedAt: '2026-11-28T05:00:00.000Z'
    }
  ];
  const wed = resolveShiftForDate('2026-12-09', assignments);
  assert.equal(wed.type, 'Evening');
  assert.equal(wed.source, 'assigned');
  assert.equal(wed.assignmentId, 'SFA-RANGE');

  const outside = resolveShiftForDate('2026-12-14', assignments);
  assert.equal(outside.type, 'General');
  assert.equal(outside.source, 'default');
}

// 5. Superseded assignment is ignored
{
  const assignments = [
    {
      id: 'SFA-OLD',
      employeeId: 'REV-EMP-006',
      shiftId: 'SHIFT-EVENING',
      shiftName: 'Evening Shift',
      frequency: 'one_day',
      startDate: '2026-12-03',
      endDate: '2026-12-03',
      status: 'Superseded',
      assignedAt: '2026-11-28T06:00:00.000Z'
    }
  ];
  const res = resolveShiftForDate('2026-12-03', assignments);
  assert.equal(res.type, 'General');
  assert.equal(res.source, 'default');
}

// 6. Latest active assignment wins
{
  const assignments = [
    {
      id: 'SFA-FIRST',
      employeeId: 'REV-EMP-006',
      shiftId: 'SHIFT-MORNING',
      shiftName: 'Morning Shift',
      frequency: 'one_day',
      startDate: '2026-12-04',
      endDate: '2026-12-04',
      status: 'Active',
      assignedAt: '2026-11-28T05:00:00.000Z'
    },
    {
      id: 'SFA-SECOND',
      employeeId: 'REV-EMP-006',
      shiftId: 'SHIFT-EVENING',
      shiftName: 'Evening Shift',
      frequency: 'one_day',
      startDate: '2026-12-04',
      endDate: '2026-12-04',
      status: 'Active',
      assignedAt: '2026-11-28T07:00:00.000Z'
    }
  ];
  const res = resolveShiftForDate('2026-12-04', assignments);
  assert.equal(res.type, 'Evening');
  assert.equal(res.assignmentId, 'SFA-SECOND');
  assert.equal(res.source, 'assigned');
}

console.log('✅ All 6 resolveShiftForDate tests passed!');

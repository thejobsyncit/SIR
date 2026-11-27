import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  LayoutDashboard, Users, UserCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight,
  Calendar, BarChart3, RefreshCw, Search, Filter, Phone, Mail, MessageSquare,
  CheckSquare, ChevronRight, ChevronLeft, ChevronDown, UserPlus, FileText, TrendingUp, CalendarCheck,
  CreditCard, DollarSign, Award, Bell, ShieldCheck, Download, Plus, X,
  Briefcase, Gift, Cake, ShieldAlert, HeartHandshake, Eye, EyeOff, FileSpreadsheet,
  Check, XCircle, Send, Sparkles, Building2, MapPin, Layers, Printer, CheckCheck,
  LogIn, LogOut, Coffee, Play, RotateCcw, Megaphone, Trash2, Globe, Radio, BookmarkCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import ScrollReveal from '../../components/ScrollReveal';
import CrmHrTaskAssignment from '../components/CrmHrTaskAssignment';
import { SharedAnnouncementCalendar } from '../components/SharedAnnouncementCalendar';
import { ShiftLateArrivalApprovalSection } from '../components/ShiftLateArrivalApprovalSection';

// Initial Workforce Directory Constants & Shift Configurations
export const SHIFT_CONFIGS = [
  {
    id: 'SHIFT-GENERAL',
    shiftName: 'General Shift',
    timing: '9:00 AM – 6:00 PM',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    scheduledLoginTime: '9:00 AM',
    scheduledLogoutTime: '6:00 PM',
    badge: 'Core Operations',
    description: 'Standard business operations, HR leadership, and client advisory.'
  },
  {
    id: 'SHIFT-MORNING',
    shiftName: 'Morning Shift',
    timing: '7:00 AM – 2:00 PM',
    startTime: '07:00 AM',
    endTime: '02:00 PM',
    scheduledLoginTime: '7:00 AM',
    scheduledLogoutTime: '2:00 PM',
    badge: 'Early Desk',
    description: 'Early morning candidate intake, regional interviews, and screening.'
  },
  {
    id: 'SHIFT-EVENING',
    shiftName: 'Evening Shift',
    timing: '2:00 PM – 9:00 PM',
    startTime: '02:00 PM',
    endTime: '09:00 PM',
    scheduledLoginTime: '2:00 PM',
    scheduledLogoutTime: '9:00 PM',
    badge: 'Overseas Overlap',
    description: 'Corporate client accounts, candidate evening debriefs, and global tech hiring.'
  }
];

export const normalizeShiftId = (shiftId) => {
  if (!shiftId) return 'SHIFT-GENERAL';
  const clean = String(shiftId).toLowerCase();
  if (clean === 'shift-10-7' || clean.includes('evening') || clean.includes('14') || clean.includes('uk-me')) return 'SHIFT-EVENING';
  if (clean === 'shift-1-930' || clean.includes('morning') || clean.includes('07')) return 'SHIFT-MORNING';
  return 'SHIFT-GENERAL';
};

export const computePunctuality = (checkInStr, shiftId) => {
  if (!checkInStr || checkInStr === '-' || checkInStr.toLowerCase().includes('pending')) {
    return { isLate: false, lateMinutes: 0, status: 'Pending Clock-In' };
  }
  const shift = SHIFT_CONFIGS.find(s => s.id === shiftId || s.id === normalizeShiftId(shiftId)) || SHIFT_CONFIGS[0];
  const [shiftHourStr, shiftMinPart] = shift.startTime.split(':');
  let shiftH = parseInt(shiftHourStr, 10);
  const shiftM = parseInt(shiftMinPart.slice(0, 2), 10);
  if (shift.startTime.toUpperCase().includes('PM') && shiftH !== 12) shiftH += 12;
  if (shift.startTime.toUpperCase().includes('AM') && shiftH === 12) shiftH = 0;
  const shiftTotalMinutes = shiftH * 60 + shiftM;

  const match = checkInStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { isLate: false, lateMinutes: 0, status: 'On Time' };
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const punchTotalMinutes = h * 60 + m;

  const diff = punchTotalMinutes - shiftTotalMinutes;
  if (diff > 0) {
    return { isLate: true, lateMinutes: diff, status: `Late (${diff} mins)` };
  }
  return { isLate: false, lateMinutes: 0, status: 'On Time' };
};

export const INITIAL_HR_EMPLOYEES = [
  {
    id: 'REV-EMP-101',
    name: 'Balavarshini S.',
    role: 'Lead HR Operations Specialist',
    department: 'HR Operations',
    email: 'balavarshini.s@revivalcrm.com',
    phone: '+91 98401 11201',
    joiningDate: '2023-04-15',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'B',
    salary: '₹68,000 / mo',
    ctc: '₹8.16 LPA',
    leaveBalance: { casual: 6, sick: 7, paid: 12 },
    shiftId: 'shift-9-6',
    shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '08:52 AM', checkOut: '06:05 PM', late: false, lateMinutes: 0, hours: '9.2 hrs', punchSource: 'Biometric Scanner #01', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-102',
    name: 'Diviya R.',
    role: 'Senior Talent Acquisition Specialist',
    department: 'Talent Acquisition',
    email: 'diviya.r@revivalcrm.com',
    phone: '+91 98401 11202',
    joiningDate: '2023-08-01',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'D',
    salary: '₹62,000 / mo',
    ctc: '₹7.44 LPA',
    leaveBalance: { casual: 5, sick: 8, paid: 14 },
    shiftId: 'shift-9-6',
    shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '09:08 AM', checkOut: '06:15 PM', late: true, lateMinutes: 8, hours: '9.1 hrs', punchSource: 'Web Portal SSO', loginStatus: 'Late (8 mins)' }
  },
  {
    id: 'REV-EMP-103',
    name: 'Chentamilselvi M.',
    role: 'HR Compliance & Verification Officer',
    department: 'HR Operations',
    email: 'chentamil.m@revivalcrm.com',
    phone: '+91 98401 11203',
    joiningDate: '2024-01-10',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'C',
    salary: '₹55,000 / mo',
    ctc: '₹6.60 LPA',
    leaveBalance: { casual: 7, sick: 6, paid: 10 },
    shiftId: 'shift-9-6',
    shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '08:58 AM', checkOut: '06:00 PM', late: false, lateMinutes: 0, hours: '9.0 hrs', punchSource: 'Face ID Terminal', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-104',
    name: 'Kishore Kumar',
    role: 'Senior Recruitment Partner (GCC & Tech)',
    department: 'Talent Acquisition',
    email: 'kishore.k@revivalcrm.com',
    phone: '+91 98401 11204',
    joiningDate: '2022-11-15',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Bangalore Office',
    avatarLetter: 'K',
    salary: '₹85,000 / mo',
    ctc: '₹10.20 LPA',
    leaveBalance: { casual: 8, sick: 9, paid: 15 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '09:52 AM', checkOut: '07:15 PM', late: false, lateMinutes: 0, hours: '9.4 hrs', punchSource: 'Web Portal SSO', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-105',
    name: 'Sreeja Nair',
    role: 'Campus Placement & University Relations Head',
    department: 'Placement Cell',
    email: 'sreeja.n@revivalcrm.com',
    phone: '+91 98401 11205',
    joiningDate: '2023-02-01',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'S',
    salary: '₹75,000 / mo',
    ctc: '₹9.00 LPA',
    leaveBalance: { casual: 4, sick: 5, paid: 11 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '10:14 AM', checkOut: '07:08 PM', late: true, lateMinutes: 14, hours: '8.9 hrs', punchSource: 'Mobile App GPS', loginStatus: 'Late (14 mins)' }
  },
  {
    id: 'REV-EMP-106',
    name: 'Arjun Venkatesh',
    role: 'Full Stack Cloud Engineer',
    department: 'Engineering',
    email: 'arjun.v@revivalcrm.com',
    phone: '+91 98401 11206',
    joiningDate: '2024-03-01',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'A',
    salary: '₹95,000 / mo',
    ctc: '₹11.40 LPA',
    leaveBalance: { casual: 6, sick: 6, paid: 9 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'On Leave', checkIn: '-', checkOut: '-', late: false, lateMinutes: 0, hours: '0 hrs', punchSource: '-', loginStatus: 'On Leave' }
  },
  {
    id: 'REV-EMP-107',
    name: 'Meenakshi Sundaram',
    role: 'Senior International Admissions Consultant',
    department: 'Client Advisory',
    email: 'meenakshi.s@revivalcrm.com',
    phone: '+91 98401 11207',
    joiningDate: '2024-06-15',
    status: 'Probation',
    employmentType: 'Probationary (6 Mos)',
    location: 'Chennai HQ',
    avatarLetter: 'M',
    salary: '₹58,000 / mo',
    ctc: '₹6.96 LPA',
    leaveBalance: { casual: 4, sick: 4, paid: 6 },
    shiftId: 'shift-9-6',
    shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '08:50 AM', checkOut: '06:05 PM', late: false, lateMinutes: 0, hours: '9.2 hrs', punchSource: 'Biometric Scanner #02', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-108',
    name: 'Dr. Vigneshwaran K.',
    role: 'Executive Career Advisor & Principal Mentor',
    department: 'Client Advisory',
    email: 'vignesh.k@revivalcrm.com',
    phone: '+91 98401 11208',
    joiningDate: '2022-05-10',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'V',
    salary: '₹1,10,000 / mo',
    ctc: '₹13.20 LPA',
    leaveBalance: { casual: 9, sick: 10, paid: 16 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'Absent', checkIn: 'Pending', checkOut: '-', late: false, lateMinutes: 0, hours: '0 hrs', punchSource: '-', loginStatus: 'Pending Clock-In' }
  },
  {
    id: 'REV-EMP-109',
    name: 'Priyanka Sharma',
    role: 'Senior Technical Talent Scout',
    department: 'Talent Acquisition',
    email: 'priyanka.s@revivalcrm.com',
    phone: '+91 98401 11209',
    joiningDate: '2023-09-01',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'P',
    salary: '₹64,000 / mo',
    ctc: '₹7.68 LPA',
    leaveBalance: { casual: 6, sick: 7, paid: 11 },
    shiftId: 'shift-9-6',
    shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '08:46 AM', checkOut: '06:02 PM', late: false, lateMinutes: 0, hours: '9.3 hrs', punchSource: 'Biometric Scanner #01', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-110',
    name: 'Karthik Subramanian',
    role: 'Global Client Account Partner',
    department: 'Client Advisory',
    email: 'karthik.sub@revivalcrm.com',
    phone: '+91 98401 11210',
    joiningDate: '2023-06-12',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'K',
    salary: '₹78,000 / mo',
    ctc: '₹9.36 LPA',
    leaveBalance: { casual: 7, sick: 5, paid: 13 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '09:56 AM', checkOut: 'In Office', late: false, lateMinutes: 0, hours: 'Active', punchSource: 'Web Portal SSO', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-111',
    name: 'Ananya Roy',
    role: 'Middle East Mobilization Coordinator',
    department: 'HR Operations',
    email: 'ananya.roy@revivalcrm.com',
    phone: '+91 98401 11211',
    joiningDate: '2024-02-15',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Chennai HQ',
    avatarLetter: 'A',
    salary: '₹52,000 / mo',
    ctc: '₹6.24 LPA',
    leaveBalance: { casual: 5, sick: 6, paid: 10 },
    shiftId: 'shift-10-7',
    shiftName: 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)',
    attendanceToday: { status: 'Present', checkIn: '10:07 AM', checkOut: 'In Office', late: true, lateMinutes: 7, hours: 'Active', punchSource: 'Mobile App GPS', loginStatus: 'Late (7 mins)' }
  },
  {
    id: 'REV-EMP-112',
    name: 'Mohammed Farhan',
    role: 'GCC Visa Compliance Specialist',
    department: 'HR Operations',
    email: 'farhan.m@revivalcrm.com',
    phone: '+91 98401 11212',
    joiningDate: '2023-10-20',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Dubai / Chennai Overlap',
    avatarLetter: 'M',
    salary: '₹82,000 / mo',
    ctc: '₹9.84 LPA',
    leaveBalance: { casual: 8, sick: 8, paid: 14 },
    shiftId: 'shift-1-930',
    shiftName: 'UK & Middle East Overlap (01:00 PM - 09:30 PM)',
    attendanceToday: { status: 'Present', checkIn: '12:54 PM', checkOut: 'In Office', late: false, lateMinutes: 0, hours: 'Active', punchSource: 'Face ID Terminal', loginStatus: 'On Time' }
  },
  {
    id: 'REV-EMP-113',
    name: 'Tariq Al-Mansoor',
    role: 'Middle East Corporate Liaison Officer',
    department: 'Client Advisory',
    email: 'tariq.mansoor@revivalcrm.com',
    phone: '+971 50 192 8374',
    joiningDate: '2023-11-01',
    status: 'Active',
    employmentType: 'Full-Time Permanent',
    location: 'Dubai HQ',
    avatarLetter: 'T',
    salary: '₹92,000 / mo',
    ctc: '₹11.04 LPA',
    leaveBalance: { casual: 6, sick: 8, paid: 15 },
    shiftId: 'shift-1-930',
    shiftName: 'UK & Middle East Overlap (01:00 PM - 09:30 PM)',
    attendanceToday: { status: 'Present', checkIn: '01:06 PM', checkOut: 'In Office', late: true, lateMinutes: 6, hours: 'Active', punchSource: 'Web Portal SSO', loginStatus: 'Late (6 mins)' }
  }
];

export const INITIAL_PERFORMANCE_REVIEWS = [
  { id: 'REV-P-1', employee: 'Balavarshini S.', rating: 4.8, targetScore: '114% Achieved', tasksDone: '38/40', feedback: 'Exceptional ownership of student counseling dossiers and verification compliance.', reviewer: 'Priya Lead' },
  { id: 'REV-P-2', employee: 'Diviya R.', rating: 4.7, targetScore: '108% Achieved', tasksDone: '34/35', feedback: 'High candidate submission velocity for GCC civil engineering mandates.', reviewer: 'Priya Lead' },
  { id: 'REV-P-3', employee: 'Kishore Kumar', rating: 4.9, targetScore: '122% Achieved', tasksDone: '46/48', feedback: 'Closed 6 high-value international cloud and healthcare requisitions ahead of SLA.', reviewer: 'Priya Lead' },
  { id: 'REV-P-4', employee: 'Chentamilselvi M.', rating: 4.5, targetScore: '100% Achieved', tasksDone: '28/30', feedback: 'Clean background check records with zero documentation audit defects.', reviewer: 'Priya Lead' }
];

export const CrmHrLeadDashboard = ({ initialSection, isReadOnly = false }) => {
  const {
    candidates = [], setActiveModule, currentRole, crmToken, setCrmToken, user, currentEmployee,
    attendancePunch, clockIn, startBreak, endBreak, clockOut
  } = useCrm();

  const normRole = (currentRole || user?.role || user?.designation || '').toLowerCase().replace(/[-_]/g, ' ').trim();
  const isHrOps = normRole === 'hr operations' || normRole.includes('operations');
  const readOnlyMode = Boolean(isReadOnly || isHrOps || currentRole === 'HR Operations');

  // Helper to map route ID (e.g. 'hr-attendance') to internal tab id
  const getTabFromSection = (sec) => {
    if (readOnlyMode) return 'shifts';
    switch (sec) {
      case 'hr-tasks': return 'tasks';
      case 'hr-attendance': return 'attendance';
      case 'hr-leave': return 'leave';
      case 'hr-employees': return 'employees';
      case 'hr-performance': return 'performance';
      case 'hr-recruitment': return 'recruitment';
      case 'hr-payroll': return 'payroll';
      case 'hr-announcements': return 'announcements';
      case 'hr-shifts': return 'shifts';
      case 'hr-documents': return 'documents';
      case 'hr-grievances': return 'grievances';
      case 'hr-approvals': return 'approvals';
      case 'hr-reports': return 'reports';
      case 'hr-overview':
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState(() => (readOnlyMode ? 'shifts' : getTabFromSection(initialSection)));
  const [toastMsg, setToastMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [maskSalary, setMaskSalary] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [punchNoteInput, setPunchNoteInput] = useState('');
  const [selectedPunchBreak, setSelectedPunchBreak] = useState('General Break');

  const formatPunchElapsed = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const remainingSecs = s % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Sync tab when initialSection changes
  useEffect(() => {
    if (readOnlyMode) {
      setActiveTab('shifts');
    } else if (initialSection) {
      setActiveTab(getTabFromSection(initialSection));
    }
  }, [initialSection, readOnlyMode]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Real SQLite Attendance Regularizations & HR Operations Team Attendance
  const [hrRegularizations, setHrRegularizations] = useState([]);
  const [hrTeamAttendance, setHrTeamAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem('sir_crm_workforce_directory_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(emp => ({
            employee: {
              employeeId: emp.employeeId,
              name: emp.name,
              operationTeam: emp.department,
              department: emp.department,
              avatar: emp.avatar
            },
            today: {
              status: emp.attendanceToday?.status || 'Present',
              checkInFormatted: emp.attendanceToday?.checkIn || '08:55 AM',
              checkOutFormatted: emp.attendanceToday?.checkOut === 'In Office' ? '—' : emp.attendanceToday?.checkOut || '06:05 PM',
            },
            workingHours: {
              monthlyTotalFormatted: emp.attendanceToday?.hours ? `${emp.attendanceToday.hours}` : '168h 30m'
            },
            summary: {
              attendancePercentage: 96
            }
          }));
        }
      }
    } catch (_) { }
    return [];
  });
  const [regCommentMap, setRegCommentMap] = useState({});
  const [reviewingRegId, setReviewingRegId] = useState('');

  const loadHrAttendanceData = async () => {
    let token = crmToken;
    if (!token) {
      try {
        const previewRes = await fetch('/api/crm/auth/preview-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetRole: currentRole || 'HR Lead',
            targetEmail: user?.email,
            employeeId: user?.id
          })
        });
        const previewJson = await previewRes.json();
        if (previewJson?.success && previewJson.token) {
          token = previewJson.token;
          if (setCrmToken) setCrmToken(token);
        }
      } catch (_) { }
    }

    if (!token) return;

    try {
      const [regRes, teamRes] = await Promise.all([
        fetch('/api/hr/attendance/regularizations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/hr/attendance/team', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const regJson = await regRes.json();
      const teamJson = await teamRes.json();
      if (regJson?.success && Array.isArray(regJson.data)) {
        setHrRegularizations(regJson.data);
      }
      if (teamJson?.success && Array.isArray(teamJson.data?.team) && teamJson.data.team.length > 0) {
        setHrTeamAttendance(teamJson.data.team);
      }
    } catch (_) { }
  };

  useEffect(() => {
    loadHrAttendanceData();
  }, [crmToken, currentRole, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHrAttendanceData();
      showToast('HR Lead dashboard updated with live data.');
    } catch (_) {
      showToast('Dashboard refreshed.');
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleReviewRegularization = async (regId, decision) => {
    if (!crmToken) return;
    setReviewingRegId(regId);
    try {
      const comments = regCommentMap[regId] || '';
      const res = await fetch(`/api/hr/attendance/regularizations/${regId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({ decision, comments })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || 'Review failed.');
      } else {
        showToast(json.message || `Regularization ${decision}.`);
        await loadHrAttendanceData();
      }
    } catch (err) {
      showToast(err.message || 'Unable to process regularization review.');
    } finally {
      setReviewingRegId('');
    }
  };

  // Payroll Management States & Helpers
  const [generatingPdfId, setGeneratingPdfId] = useState(null);
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [payrollSearch, setPayrollSearch] = useState('');
  const [payrollDeptFilter, setPayrollDeptFilter] = useState('All');
  const [disbursementStatuses, setDisbursementStatuses] = useState({
    'REV-EMP-101': 'Ready',
    'REV-EMP-102': 'Ready',
    'REV-EMP-103': 'Ready',
    'REV-EMP-104': 'Ready',
    'REV-EMP-105': 'Ready',
    'REV-EMP-106': 'Ready',
    'REV-EMP-107': 'Ready',
    'REV-EMP-108': 'Ready'
  });

  const calculateSalaryBreakdown = (employee) => {
    const grossMonthly = parseInt(String(employee?.salary || '').replace(/[^\d]/g, ''), 10) || 55000;
    const basic = Math.round(grossMonthly * 0.50);
    const hra = Math.round(grossMonthly * 0.25);
    const conveyance = 2500;
    const medical = 1500;
    const specialAllowance = Math.max(0, grossMonthly - (basic + hra + conveyance + medical));

    const pf = Math.min(Math.round(basic * 0.12), 1800);
    const profTax = 200;
    const esi = grossMonthly <= 21000 ? Math.round(grossMonthly * 0.0075) : 0;
    const mediclaim = 500;
    const tds = grossMonthly > 60000 ? Math.round(grossMonthly * 0.05) : 0;

    const totalEarnings = grossMonthly;
    const totalDeductions = pf + profTax + esi + mediclaim + tds;
    const netPay = totalEarnings - totalDeductions;

    return {
      grossMonthly,
      basic,
      hra,
      conveyance,
      medical,
      specialAllowance,
      totalEarnings,
      pf,
      profTax,
      esi,
      mediclaim,
      tds,
      totalDeductions,
      netPay,
      payPeriod: 'November 1, 2026 – November 30, 2026',
      payDate: 'November 28, 2026',
      bankName: 'HDFC Bank Ltd',
      accountMasked: '•••• ' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').slice(-4) || '4892' : '4892'),
      uan: '101928374' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').slice(-3) || '650' : '650'),
      pan: 'ABCDE' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').padStart(4, '0') : '1010') + 'K',
      paidDays: 30,
      lossOfPay: 0
    };
  };

  const numberToWords = (num) => {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    const words = inWords(Math.floor(num));
    return (words ? words.trim() : 'Zero') + ' Rupees Only';
  };

  const toggleEmployeeDisbursement = (empId) => {
    setDisbursementStatuses(prev => {
      const current = prev[empId] || 'Ready';
      const updated = current === 'Credited' ? 'Ready' : 'Credited';
      showToast(updated === 'Credited' ? `✓ Direct deposit marked as Credited for ${empId}` : `Direct deposit status reset to Ready for ${empId}`);
      return { ...prev, [empId]: updated };
    });
  };

  const handleRunAllPayroll = () => {
    const updated = {};
    employees.forEach(e => {
      updated[e.id] = 'Credited';
    });
    setDisbursementStatuses(updated);
    showToast('✓ November 2026 Payroll executed successfully! All salaries processed and credited via Direct Deposit.');
  };

  const handleDownloadPayslipPDF = (employee) => {
    if (!employee) return;
    setGeneratingPdfId(employee.id);
    try {
      const b = calculateSalaryBreakdown(employee);
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const margin = 12;
      const pageWidth = 210;
      const contentWidth = pageWidth - (margin * 2);
      let y = 12;

      // Outer Card Border
      doc.setDrawColor(200, 205, 215);
      doc.setLineWidth(0.4);
      doc.rect(margin - 2, margin - 2, contentWidth + 4, 275);

      // 1. Company Header Banner
      doc.setFillColor(11, 27, 51); // Navy #0B1B33
      doc.rect(margin, y, contentWidth, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('THE REVIVAL INTERNATIONAL', margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(198, 164, 92); // Gold #C6A45C
      doc.text('Global Executive Search, Manpower Recruitment & Enterprise HR Operations', margin + 6, y + 14);

      doc.setFontSize(7.5);
      doc.setTextColor(200, 210, 225);
      doc.text('India HQ: Chennai, Tamil Nadu • GCC HQ: Dubai, UAE • ISO 9001:2025 Certified', margin + 6, y + 19);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ENTERPRISE PAYROLL', pageWidth - margin - 6, y + 10, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(198, 164, 92);
      doc.text('CONFIDENTIAL & PRIVATE', pageWidth - margin - 6, y + 16, { align: 'right' });

      y += 28;

      // 2. Payslip Title Bar
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 10, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('SALARY STATEMENT / PAYSLIP — NOVEMBER 2026', margin + 4, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Ref: REV-PAY-2026-NOV-${employee.id}`, pageWidth - margin - 4, y + 6.5, { align: 'right' });

      y += 14;

      // 3. Employee & Bank Meta Grid
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 34, 'FD');
      doc.line(margin + (contentWidth / 2), y, margin + (contentWidth / 2), y + 34);

      const leftX = margin + 4;
      const metaY = y + 6;
      doc.setFontSize(7.5);

      const renderMetaRow = (label, val, xPos, currentY) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(label, xPos, currentY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`:  ${val}`, xPos + 28, currentY);
      };

      renderMetaRow('Employee Name', employee.name, leftX, metaY);
      renderMetaRow('Employee ID', employee.id, leftX, metaY + 6);
      renderMetaRow('Designation', employee.role, leftX, metaY + 12);
      renderMetaRow('Department', employee.department || 'HR Operations', leftX, metaY + 18);
      renderMetaRow('Location', employee.location || 'Chennai HQ', leftX, metaY + 24);

      const rightX = margin + (contentWidth / 2) + 4;
      renderMetaRow('Pay Period', b.payPeriod, rightX, metaY);
      renderMetaRow('Disbursement Date', b.payDate, rightX, metaY + 6);
      renderMetaRow('Bank & Account', `${b.bankName} (${b.accountMasked})`, rightX, metaY + 12);
      renderMetaRow('PAN / UAN', `${b.pan} / ${b.uan}`, rightX, metaY + 18);
      renderMetaRow('Paid / LOP Days', `${b.paidDays} Days / ${b.lossOfPay} Days`, rightX, metaY + 24);

      y += 38;

      // 4. Earnings & Deductions Table
      const halfWidth = contentWidth / 2;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, halfWidth, 7, 'F');
      doc.rect(margin + halfWidth, y, halfWidth, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('EARNINGS', margin + 4, y + 5);
      doc.text('AMOUNT (₹)', margin + halfWidth - 4, y + 5, { align: 'right' });
      doc.text('DEDUCTIONS', margin + halfWidth + 4, y + 5);
      doc.text('AMOUNT (₹)', margin + contentWidth - 4, y + 5, { align: 'right' });

      y += 7;

      const earningsItems = [
        ['Basic Salary', `₹${b.basic.toLocaleString('en-IN')}`],
        ['House Rent Allowance (HRA)', `₹${b.hra.toLocaleString('en-IN')}`],
        ['Special Executive Allowance', `₹${b.specialAllowance.toLocaleString('en-IN')}`],
        ['Conveyance & Transport', `₹${b.conveyance.toLocaleString('en-IN')}`],
        ['Medical Allowance', `₹${b.medical.toLocaleString('en-IN')}`]
      ];

      const deductionsItems = [
        ['Provident Fund (PF - 12%)', `₹${b.pf.toLocaleString('en-IN')}`],
        ['Professional Tax (PT)', `₹${b.profTax.toLocaleString('en-IN')}`],
        ['Group Health Mediclaim', `₹${b.mediclaim.toLocaleString('en-IN')}`],
        ['Tax Deducted at Source (TDS)', `₹${b.tds.toLocaleString('en-IN')}`],
        ['Statutory ESI / Other', `₹${b.esi.toLocaleString('en-IN')}`]
      ];

      const maxRows = Math.max(earningsItems.length, deductionsItems.length);
      doc.setFontSize(8);

      for (let i = 0; i < maxRows; i++) {
        const rowY = y + (i * 6.5);
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, rowY, halfWidth, 6.5, 'F');
          doc.rect(margin + halfWidth, rowY, halfWidth, 6.5, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin + halfWidth, rowY, margin + halfWidth, rowY + 6.5);

        if (earningsItems[i]) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(earningsItems[i][0], margin + 4, rowY + 4.5);
          doc.setFont('helvetica', 'bold');
          doc.text(earningsItems[i][1], margin + halfWidth - 4, rowY + 4.5, { align: 'right' });
        }

        if (deductionsItems[i]) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(deductionsItems[i][0], margin + halfWidth + 4, rowY + 4.5);
          doc.setFont('helvetica', 'bold');
          doc.text(deductionsItems[i][1], margin + contentWidth - 4, rowY + 4.5, { align: 'right' });
        }
      }

      y += maxRows * 6.5;

      // Subtotals
      doc.setFillColor(238, 242, 246);
      doc.rect(margin, y, halfWidth, 8, 'F');
      doc.rect(margin + halfWidth, y, halfWidth, 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, margin + contentWidth, y);
      doc.line(margin, y + 8, margin + contentWidth, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('TOTAL GROSS EARNINGS', margin + 4, y + 5.5);
      doc.text(`₹${b.totalEarnings.toLocaleString('en-IN')}`, margin + halfWidth - 4, y + 5.5, { align: 'right' });

      doc.text('TOTAL DEDUCTIONS', margin + halfWidth + 4, y + 5.5);
      doc.setTextColor(190, 18, 60);
      doc.text(`₹${b.totalDeductions.toLocaleString('en-IN')}`, margin + contentWidth - 4, y + 5.5, { align: 'right' });

      y += 13;

      // 5. Net Salary Callout Box
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.6);
      doc.rect(margin, y, contentWidth, 22, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(6, 95, 70);
      doc.text('NET SALARY PAYABLE (TAKE-HOME SALARY)', margin + 6, y + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(4, 120, 87);
      doc.text(`₹ ${b.netPay.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 8, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text(`In Words: ${numberToWords(b.netPay)}`, margin + 6, y + 13);

      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text(`Status: ✓ Direct Deposit Credited to Bank Account on Nov 28, 2026 (Ref: REV-DISB-${employee.id})`, margin + 6, y + 18.5);

      y += 28;

      // 6. Signatures and Declarations
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 38, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('EMPLOYER DECLARATION & NOTES:', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('1. All statutory taxes & employee contributions have been remitted to EPFO & State Authorities.', margin + 4, y + 12);
      doc.text('2. This salary statement is generated under Revival International HR & WPS automated payroll ledger.', margin + 4, y + 17);
      doc.text('3. For tax exemptions or investment declaration queries, submit a ticket under HR Grievances.', margin + 4, y + 22);
      doc.text('4. This document is authenticated electronically; no manual signature is required.', margin + 4, y + 27);

      const stampX = pageWidth - margin - 55;
      doc.setDrawColor(198, 164, 92);
      doc.setFillColor(254, 252, 248);
      doc.rect(stampX, y + 4, 50, 30, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(11, 27, 51);
      doc.text('THE REVIVAL INTERNATIONAL', stampX + 25, y + 9, { align: 'center' });

      doc.setFontSize(6.5);
      doc.setTextColor(198, 164, 92);
      doc.text('★ HR & FINANCE DIRECTORATE ★', stampX + 25, y + 14, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129);
      doc.text('✓ DIGITALLY VERIFIED', stampX + 25, y + 22, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Signatory', stampX + 25, y + 30, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} via Revival CRM Enterprise Edition • Confidential`, pageWidth / 2, 282, { align: 'center' });

      const filename = `Payslip_${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_Nov2026.pdf`;
      doc.save(filename);
      showToast(`✓ Official Payslip PDF downloaded for ${employee.name}`);
    } catch (err) {
      console.error('Payslip PDF error:', err);
      showToast(`⚠️ Could not generate PDF: ${err.message}`);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownloadPayrollRegisterPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const margin = 10;
      const pageWidth = 297;
      let y = 14;

      doc.setFillColor(11, 27, 51);
      doc.rect(margin, y, pageWidth - (margin * 2), 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('THE REVIVAL INTERNATIONAL — MONTHLY PAYROLL REGISTER (NOVEMBER 2026)', margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(198, 164, 92);
      doc.text('Official Disbursement Ledger Across All On-Roll Workforce • Certified WPS Compliant', margin + 6, y + 13.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 6, y + 11, { align: 'right' });

      y += 24;

      const cols = [
        { header: 'Emp ID', width: 25 },
        { header: 'Employee Name', width: 45 },
        { header: 'Department', width: 38 },
        { header: 'Designation', width: 55 },
        { header: 'Gross Pay', width: 28, align: 'right' },
        { header: 'Deductions', width: 28, align: 'right' },
        { header: 'Net Salary', width: 30, align: 'right' },
        { header: 'Status', width: 28 }
      ];

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      let currentX = margin + 3;
      cols.forEach(col => {
        const x = col.align === 'right' ? currentX + col.width - 6 : currentX;
        doc.text(col.header, x, y + 5.5, { align: col.align || 'left' });
        currentX += col.width;
      });

      y += 8;

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      employees.forEach((emp, idx) => {
        const b = calculateSalaryBreakdown(emp);
        totalGross += b.totalEarnings;
        totalDeductions += b.totalDeductions;
        totalNet += b.netPay;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 7, pageWidth - margin, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);

        const status = disbursementStatuses[emp.id] === 'Credited' ? 'Credited' : 'Direct Deposit Ready';

        currentX = margin + 3;
        doc.setFont('helvetica', 'bold');
        doc.text(emp.id, currentX, y + 4.8);
        currentX += cols[0].width;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(emp.name, currentX, y + 4.8);
        currentX += cols[1].width;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(emp.department || 'HR Operations', currentX, y + 4.8);
        currentX += cols[2].width;

        doc.text(emp.role.length > 28 ? emp.role.slice(0, 26) + '...' : emp.role, currentX, y + 4.8);
        currentX += cols[3].width;

        doc.text(`₹${b.totalEarnings.toLocaleString('en-IN')}`, currentX + cols[4].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[4].width;

        doc.setTextColor(190, 18, 60);
        doc.text(`₹${b.totalDeductions.toLocaleString('en-IN')}`, currentX + cols[5].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[5].width;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(`₹${b.netPay.toLocaleString('en-IN')}`, currentX + cols[6].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[6].width;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(status === 'Credited' ? 5 : 180, status === 'Credited' ? 150 : 100, status === 'Credited' ? 105 : 20);
        doc.text(status, currentX, y + 4.8);

        y += 7;
      });

      doc.setFillColor(238, 242, 246);
      doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`TOTALS (${employees.length} EMPLOYEES)`, margin + 6, y + 5.5);

      const grossX = margin + 3 + cols[0].width + cols[1].width + cols[2].width + cols[3].width;
      doc.text(`₹${totalGross.toLocaleString('en-IN')}`, grossX + cols[4].width - 6, y + 5.5, { align: 'right' });

      const dedX = grossX + cols[4].width;
      doc.setTextColor(190, 18, 60);
      doc.text(`₹${totalDeductions.toLocaleString('en-IN')}`, dedX + cols[5].width - 6, y + 5.5, { align: 'right' });

      const netX = dedX + cols[5].width;
      doc.setTextColor(5, 150, 105);
      doc.text(`₹${totalNet.toLocaleString('en-IN')}`, netX + cols[6].width - 6, y + 5.5, { align: 'right' });

      doc.save('Revival_Payroll_Register_Nov2026.pdf');
      showToast(`✓ Monthly Payroll Register PDF downloaded for all ${employees.length} employees`);
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    }
  };

  // 1. EMPLOYEES DATA (Feature 1, 4) - With LocalStorage Persistence & Shift Normalization
  const STORAGE_KEY_WORKFORCE = 'sir_crm_workforce_directory_v2';
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKFORCE);
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and assign shiftId if missing or unmigrated
          const needsSync = parsed.some(e => !e.shiftId || !e.attendanceToday?.loginStatus || !e.attendanceToday?.punchSource);
          if (needsSync) {
            parsed = parsed.map((emp, i) => {
              const matchedInitial = INITIAL_HR_EMPLOYEES.find(init => init.id === emp.id || init.name === emp.name);
              const defaultShiftId = emp.shiftId || (matchedInitial ? matchedInitial.shiftId : (i % 3 === 0 ? 'shift-9-6' : (i % 3 === 1 ? 'shift-10-7' : 'shift-1-930')));
              const shiftObj = SHIFT_CONFIGS.find(s => s.id === defaultShiftId) || SHIFT_CONFIGS[0];
              const att = emp.attendanceToday || (matchedInitial ? matchedInitial.attendanceToday : {});
              const isLeave = att.status === 'On Leave' || att.status === 'Leave';
              const isAbsent = att.status === 'Absent' || att.checkIn === '-' || att.checkIn === 'Pending';
              const isLate = !!att.late;
              const loginStatus = isLeave ? 'On Leave' : (isAbsent ? 'Pending Clock-In' : (isLate ? `Late (${att.lateMinutes || 8} mins)` : 'On Time'));
              return {
                ...emp,
                shiftId: defaultShiftId,
                shiftName: `${shiftObj.shiftName} (${shiftObj.timing})`,
                attendanceToday: {
                  status: att.status || (isLeave ? 'On Leave' : 'Present'),
                  checkIn: att.checkIn || (isLeave ? '-' : (isAbsent ? 'Pending' : (defaultShiftId === 'shift-10-7' ? '09:55 AM' : (defaultShiftId === 'shift-1-930' ? '12:55 PM' : '08:52 AM')))),
                  checkOut: att.checkOut || (isLeave || isAbsent ? '-' : (defaultShiftId === 'shift-10-7' ? '07:05 PM' : (defaultShiftId === 'shift-1-930' ? '09:30 PM' : '06:05 PM'))),
                  late: isLate,
                  lateMinutes: att.lateMinutes || (isLate ? 8 : 0),
                  hours: att.hours || (isLeave || isAbsent ? '0 hrs' : '9.1 hrs'),
                  punchSource: att.punchSource || (isLeave || isAbsent ? '-' : 'Biometric Scanner #01'),
                  loginStatus: att.loginStatus || loginStatus
                }
              };
            });
            localStorage.setItem(STORAGE_KEY_WORKFORCE, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) { }
    return INITIAL_HR_EMPLOYEES;
  });

  // Modal for New Employee with Validation State
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [addEmpErrors, setAddEmpErrors] = useState({});
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);

  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    department: 'HR Operations',
    email: '',
    phone: '',
    salary: '₹55,000 / mo',
    ctc: '₹6.60 LPA',
    employmentType: 'Full-Time Permanent'
  });

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    // 1. Full Name Validation: letters, spaces, dots, hyphens only; min 3 chars
    const nameTrim = (newEmp.name || '').trim();
    if (!nameTrim || !/^[A-Za-z\s.'-]{3,60}$/.test(nameTrim)) {
      errors.name = 'Please enter a valid full name (letters only, at least 3 characters).';
    }

    // 2. Email ID Validation: proper corporate email format
    const emailTrim = (newEmp.email || '').trim().toLowerCase();
    if (!emailTrim || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailTrim)) {
      errors.email = 'Please enter a valid corporate email address (e.g. employee@company.com).';
    }

    // 3. Contact Phone Number Validation: 10 to 15 digits
    const digits = (newEmp.phone || '').replace(/[^0-9]/g, '');
    if (!digits || digits.length < 10 || digits.length > 15) {
      errors.phone = 'Please enter a valid contact phone number (10 to 15 digits).';
    }

    // 4. Monthly Salary Validation: positive number
    const numSalary = Number(String(newEmp.salary || '').replace(/[^0-9.]/g, ''));
    if (!numSalary || isNaN(numSalary) || numSalary <= 0) {
      errors.salary = 'Please enter a valid positive monthly salary (e.g. 55000 or ₹55,000).';
    }

    if (Object.keys(errors).length > 0) {
      setAddEmpErrors(errors);
      return;
    }

    const formattedSalary = '₹' + numSalary.toLocaleString('en-IN') + ' / mo';
    const annualCTCVal = (numSalary * 12) / 100000;
    const formattedCtc = '₹' + annualCTCVal.toFixed(2) + ' LPA';

    const item = {
      id: `REV-EMP-${Math.floor(109 + Math.random() * 900)}`,
      name: nameTrim,
      role: (newEmp.role || '').trim() || 'HR Associate',
      department: newEmp.department,
      email: emailTrim,
      phone: newEmp.phone.trim(),
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      employmentType: newEmp.employmentType,
      location: 'Chennai HQ',
      avatarLetter: nameTrim.charAt(0).toUpperCase(),
      salary: formattedSalary,
      ctc: formattedCtc,
      leaveBalance: { casual: 8, sick: 8, paid: 12 },
      shiftId: newEmp.shiftId || 'shift-9-6',
      shiftName: newEmp.shiftId === 'shift-10-7'
        ? 'Corporate Mid-Day Shift (10:00 AM - 07:00 PM)'
        : (newEmp.shiftId === 'shift-1-930' ? 'UK & Middle East Overlap (01:00 PM - 09:30 PM)' : 'General Day Shift (09:00 AM - 06:00 PM)'),
      attendanceToday: {
        status: 'Present',
        checkIn: newEmp.shiftId === 'shift-10-7' ? '09:55 AM' : (newEmp.shiftId === 'shift-1-930' ? '12:55 PM' : '08:55 AM'),
        checkOut: 'In Office',
        late: false,
        lateMinutes: 0,
        hours: 'Active',
        punchSource: 'Biometric Scanner #01',
        loginStatus: 'On Time'
      }
    };

    const updated = [item, ...employees];
    setEmployees(updated);
    try {
      localStorage.setItem(STORAGE_KEY_WORKFORCE, JSON.stringify(updated));

      // Also sync to registered users
      const regSaved = localStorage.getItem('sir_crm_registered_users');
      let registered = regSaved ? JSON.parse(regSaved) : [];
      if (!registered.some(u => u.email.toLowerCase() === item.email.toLowerCase())) {
        registered.push({
          name: item.name,
          email: item.email,
          role: item.role.includes('Super') ? 'Super Admin' : (item.role.includes('Admin') ? 'Admin' : 'HR Operations'),
          password: 'Password123!',
          phone: item.phone,
          department: item.department
        });
        localStorage.setItem('sir_crm_registered_users', JSON.stringify(registered));
      }
    } catch (err) { }

    setIsAddEmployeeOpen(false);
    setNewEmp({ name: '', role: '', department: 'HR Operations', email: '', phone: '', salary: '₹55,000 / mo', ctc: '₹6.60 LPA', employmentType: 'Full-Time Permanent' });
    setAddEmpErrors({});
    showToast(`✓ Employee ${item.name} (${item.id}) added to workforce directory.`);
  };

  // 2. LEAVE REQUESTS STATE (Feature 3)
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LEV-501',
      employeeId: 'REV-EMP-106',
      name: 'Arjun Venkatesh',
      role: 'Full Stack Cloud Engineer',
      department: 'Engineering',
      type: 'Sick Leave',
      startDate: '2026-11-07',
      endDate: '2026-11-08',
      days: 2,
      reason: 'Viral fever and prescribed medical rest by physician.',
      submittedAt: 'Today at 07:30 AM',
      status: 'Pending HR Sign-off'
    },
    {
      id: 'LEV-502',
      employeeId: 'REV-EMP-102',
      name: 'Diviya R.',
      role: 'Senior Talent Acquisition Specialist',
      department: 'Talent Acquisition',
      type: 'Casual Leave',
      startDate: '2026-11-12',
      endDate: '2026-11-13',
      days: 2,
      reason: 'Family wedding function in Coimbatore.',
      submittedAt: 'Yesterday at 04:15 PM',
      status: 'Pending HR Sign-off'
    },
    {
      id: 'LEV-503',
      employeeId: 'REV-EMP-105',
      name: 'Sreeja Nair',
      role: 'Campus Placement Head',
      department: 'Placement Cell',
      type: 'Paid / Earned Leave',
      startDate: '2026-11-20',
      endDate: '2026-11-24',
      days: 5,
      reason: 'Annual family vacation travel.',
      submittedAt: 'Nov 05, 2026',
      status: 'Approved'
    }
  ]);

  const handleLeaveDecision = (leaveId, decision) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: decision } : l));
    showToast(`✓ Leave request ${leaveId} has been marked as ${decision.toUpperCase()}.`);
  };

  // 3. COMPANY ANNOUNCEMENTS STATE & BACKEND DATABASE INTEGRATION
  const [companyAnnouncements, setCompanyAnnouncements] = useState([]);
  const [calendarAnnouncements, setCalendarAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [showAnnouncementCalendar, setShowAnnouncementCalendar] = useState(false);
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState(null);
  const [announcementFilter, setAnnouncementFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'hr-ops'
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementFormErrors, setAnnouncementFormErrors] = useState({});
  const [deleteConfirmAnnouncement, setDeleteConfirmAnnouncement] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    id: null,
    title: '',
    description: '',
    category: 'General Notice',
    target_audience: 'All Employees',
    status: 'Published',
    publish_date: '',
    expires_at: ''
  });

  const announcementsReqSeqRef = useRef(0);
  const loadCompanyAnnouncements = useCallback(async () => {
    const reqSeq = ++announcementsReqSeqRef.current;
    setAnnouncementsLoading(true);
    try {
      let token = crmToken;
      if (!token) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewJson = await previewRes.json();
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
          }
        } catch (_) { }
      }

      const res = await fetch('/api/company-announcements', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      if (res.ok) {
        const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
        if (reqSeq !== announcementsReqSeqRef.current) return;
        if (data?.success && Array.isArray(data.announcements)) {
          setCompanyAnnouncements(data.announcements);
          setCalendarAnnouncements(Array.isArray(data.calendarAnnouncements) ? data.calendarAnnouncements : data.announcements);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load company announcements:', err);
    } finally {
      if (reqSeq === announcementsReqSeqRef.current) {
        setAnnouncementsLoading(false);
      }
    }
  }, [crmToken, currentRole, user?.email, user?.id, setCrmToken]);

  useEffect(() => {
    loadCompanyAnnouncements();
  }, [loadCompanyAnnouncements]);

  const handleSaveAnnouncement = async (statusChoice = 'Published') => {
    const errors = {};
    if (!announcementForm.title.trim()) {
      errors.title = 'Announcement title is required.';
    }
    if (!announcementForm.description.trim()) {
      errors.description = 'Announcement description is required.';
    }
    if (Object.keys(errors).length > 0) {
      setAnnouncementFormErrors(errors);
      return;
    }

    setSavingAnnouncement(true);
    setAnnouncementFormErrors({});

    try {
      let token = crmToken;
      if (!token) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewJson = await previewRes.json();
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
          }
        } catch (_) { }
      }

      const payload = {
        title: announcementForm.title.trim(),
        description: announcementForm.description.trim(),
        category: announcementForm.category,
        target_audience: announcementForm.target_audience,
        status: statusChoice,
        publish_date: announcementForm.publish_date || null,
        expires_at: announcementForm.expires_at || null
      };

      const isEdit = Boolean(announcementForm.id);
      const res = await fetch(
        isEdit ? `/api/company-announcements/${announcementForm.id}` : '/api/company-announcements',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      );

      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
      if (!res.ok || !data.success) {
        showToast(data.message || 'Failed to save announcement.');
      } else {
        showToast(
          isEdit
            ? `✓ Announcement "${payload.title}" updated successfully.`
            : (statusChoice === 'Published'
              ? `✓ Announcement "${payload.title}" published and broadcast successfully.`
              : `✓ Announcement "${payload.title}" saved as draft.`)
        );
        setIsCreateAnnouncementOpen(false);
        setAnnouncementForm({
          id: null,
          title: '',
          description: '',
          category: 'General Notice',
          target_audience: 'All Employees',
          status: 'Published',
          publish_date: '',
          expires_at: ''
        });
        await loadCompanyAnnouncements();
        try {
          localStorage.setItem('sir_announcements_updated_at', String(Date.now()));
          window.dispatchEvent(new Event('sir-announcements-updated'));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sir_company_announcements');
            bc.postMessage({ type: 'updated', at: Date.now() });
            bc.close();
          }
        } catch (_) { }
      }
    } catch (err) {
      showToast('Error saving announcement: ' + (err.message || 'Network error'));
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handlePublishDraft = async (id, title) => {
    try {
      let token = crmToken;
      const res = await fetch(`/api/company-announcements/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
      if (res.ok && data.success) {
        showToast(`✓ Announcement "${title}" published and broadcast.`);
        await loadCompanyAnnouncements();
        try {
          localStorage.setItem('sir_announcements_updated_at', String(Date.now()));
          window.dispatchEvent(new Event('sir-announcements-updated'));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sir_company_announcements');
            bc.postMessage({ type: 'updated', at: Date.now() });
            bc.close();
          }
        } catch (_) { }
      } else {
        showToast(data.message || 'Failed to publish announcement.');
      }
    } catch (err) {
      showToast('Error publishing draft: ' + err.message);
    }
  };

  const handleDeleteAnnouncement = async (id, title, reason = '') => {
    setDeletingAnnouncement(true);
    try {
      let token = crmToken;
      const res = await fetch(`/api/company-announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason: reason.trim() }),
        credentials: 'include'
      });
      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
      if (res.ok && data.success) {
        showToast(`✓ Announcement "${title}" moved to deleted history.`);
        setDeleteConfirmAnnouncement(null);
        setDeleteReason('');
        await loadCompanyAnnouncements();
        try {
          localStorage.setItem('sir_announcements_updated_at', String(Date.now()));
          window.dispatchEvent(new Event('sir-announcements-updated'));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sir_company_announcements');
            bc.postMessage({ type: 'updated', at: Date.now() });
            bc.close();
          }
        } catch (_) { }
      } else {
        showToast(data.message || 'Failed to delete announcement.');
      }
    } catch (err) {
      showToast('Error deleting announcement: ' + err.message);
    } finally {
      setDeletingAnnouncement(false);
    }
  };

  const handleRestoreAnnouncement = async (id, title) => {
    try {
      let token = crmToken;
      const res = await fetch(`/api/company-announcements/${id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
      if (res.ok && data.success) {
        showToast(`✓ Announcement "${title}" restored.`);
        await loadCompanyAnnouncements();
        try {
          localStorage.setItem('sir_announcements_updated_at', String(Date.now()));
          window.dispatchEvent(new Event('sir-announcements-updated'));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sir_company_announcements');
            bc.postMessage({ type: 'updated', at: Date.now() });
            bc.close();
          }
        } catch (_) { }
      } else {
        showToast(data.message || 'Failed to restore announcement.');
      }
    } catch (err) {
      showToast('Error restoring announcement: ' + err.message);
    }
  };

  const filteredCompanyAnnouncements = useMemo(() => {
    let list = announcementFilter === 'deleted'
      ? (calendarAnnouncements || []).filter(a => a.isDeleted || a.status === 'Deleted')
      : (companyAnnouncements || []).filter(a => !a.isDeleted && a.status !== 'Deleted' && !a.isExpired && a.status !== 'Expired');

    if (announcementSearch.trim()) {
      const q = announcementSearch.toLowerCase();
      list = list.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.created_by_name && a.created_by_name.toLowerCase().includes(q))
      );
    }
    if (announcementFilter === 'published') {
      list = list.filter(a => a.status === 'Published' && !a.isExpired);
    } else if (announcementFilter === 'scheduled') {
      list = list.filter(a => a.status === 'Scheduled');
    } else if (announcementFilter === 'draft') {
      list = list.filter(a => a.status === 'Draft');
    } else if (announcementFilter === 'hr-ops') {
      list = list.filter(a => a.target_audience === 'HR Operations');
    }
    return list;
  }, [companyAnnouncements, calendarAnnouncements, announcementFilter, announcementSearch]);

  const formatAnnouncementDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const s = String(dateStr).trim();
      const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) ? `${s.replace(' ', 'T')}Z` : s;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return String(dateStr);
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(d);
    } catch (_) {
      return String(dateStr);
    }
  };

  const getAnnouncementCategoryBadgeClass = (category) => {
    switch (category) {
      case 'HR Policy':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'Holiday':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
      case 'Important Update':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'Emergency Alert':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
      case 'Welfare & Benefits':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  // 4. PERFORMANCE REVIEWS STATE (Feature 5) - With LocalStorage Persistence
  const STORAGE_KEY_PERFORMANCE = 'sir_crm_performance_reviews_v2';
  const [performanceReviews, setPerformanceReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERFORMANCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return INITIAL_PERFORMANCE_REVIEWS;
  });

  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    employee: '',
    rating: 4.8,
    targetScore: '110% Achieved',
    tasksDone: '40/40',
    feedback: '',
    reviewer: 'Priya Lead'
  });
  const [reviewError, setReviewError] = useState('');

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.employee || !newReview.feedback) {
      setReviewError('Please select an employee and enter review feedback.');
      return;
    }
    const createdReview = {
      id: `REV-P-${Math.floor(100 + Math.random() * 900)}`,
      employee: newReview.employee,
      rating: Number(newReview.rating) || 4.5,
      targetScore: newReview.targetScore || '100% Achieved',
      tasksDone: newReview.tasksDone || '35/35',
      feedback: newReview.feedback.trim(),
      reviewer: newReview.reviewer || 'Priya Lead'
    };
    const updated = [createdReview, ...performanceReviews];
    setPerformanceReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PERFORMANCE, JSON.stringify(updated));
    } catch (e) { }
    setIsAddReviewOpen(false);
    setReviewError('');
    showToast(`✓ Performance review submitted for ${createdReview.employee}.`);
  };

  // 5. EXPENSE CLAIMS STATE (Advanced Feature 5)
  const [expenseClaims, setExpenseClaims] = useState([
    { id: 'EXP-101', employee: 'Kishore Kumar', category: 'Client Advisory Travel', amount: '₹14,500', receiptsAttached: 3, date: 'Nov 05, 2026', status: 'Pending Approval', description: 'Bangalore client meetings travel tickets and hotel conveyance.' },
    { id: 'EXP-102', employee: 'Sreeja Nair', category: 'Campus Drive Hospitality', amount: '₹8,200', receiptsAttached: 2, date: 'Nov 04, 2026', status: 'Pending Approval', description: 'Dinner hospitality for TechVision International campus recruitment panel.' }
  ]);

  // 6. SHIFTS & ROSTER STATE (Dynamic Backend Integration & Shift Roster Table)
  const getKolkataTodayIso = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const [shifts] = useState(SHIFT_CONFIGS);
  const [shiftSelectedDate, setShiftSelectedDate] = useState(() => getKolkataTodayIso());
  const [shiftViewMode, setShiftViewMode] = useState(readOnlyMode ? 'monthly' : 'table'); // 'table' | 'weekly' | 'monthly' | 'approvals'
  const [shiftRosterData, setShiftRosterData] = useState([]);
  const [shiftRosterLoading, setShiftRosterLoading] = useState(false);
  const [shiftAssignmentsList, setShiftAssignmentsList] = useState([]);
  const [assignedTasksForCalendar, setAssignedTasksForCalendar] = useState([]);
  const [lateApprovalsList, setLateApprovalsList] = useState([]);
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');
  const [shiftFilterShift, setShiftFilterShift] = useState('all');
  const [shiftFilterStatus, setShiftFilterStatus] = useState('all');
  const [shiftFilterDept, setShiftFilterDept] = useState('all');
  const [bulkSelectedEmpIds, setBulkSelectedEmpIds] = useState([]);
  const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
  const [assignEmpSearch, setAssignEmpSearch] = useState('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [assignFormTarget, setAssignFormTarget] = useState({
    employeeIds: [],
    shiftId: 'SHIFT-GENERAL',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    frequency: 'one_day',
    applicableDays: [1, 2, 3, 4, 5],
    notes: ''
  });
  const [lateDecisionModal, setLateDecisionModal] = useState({
    open: false,
    request: null,
    decision: 'Approved',
    notes: ''
  });
  const [historyModalEmployee, setHistoryModalEmployee] = useState(null);
  const [monthlyViewYear, setMonthlyViewYear] = useState(() => new Date().getFullYear());
  const [monthlyViewMonth, setMonthlyViewMonth] = useState(() => new Date().getMonth());
  const [monthlySelectedEmpId, setMonthlySelectedEmpId] = useState('all');
  const [monthlyActiveDateStr, setMonthlyActiveDateStr] = useState(() => getKolkataTodayIso());
  const [assignModalError, setAssignModalError] = useState('');
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [shiftAssignmentSuccessBanner, setShiftAssignmentSuccessBanner] = useState('');

  // Unified CRM workforce for Shift Management (includes all active CRM roles: HR Operations, HR Lead, Recruiter, Placement, Interviewer, Admin, etc.)
  const displayEmployees = useMemo(() => {
    const raw = (shiftRosterData && shiftRosterData.length > 0)
      ? shiftRosterData
      : employees.map((emp) => {
        const normShiftId = normalizeShiftId(emp.shiftId);
        const shiftObj = SHIFT_CONFIGS.find(s => s.id === normShiftId) || SHIFT_CONFIGS[0];
        const att = emp.attendanceToday || {};
        const isOnLeave = att.status === 'On Leave' || att.loginStatus === 'On Leave';
        const isLate = !!(att.late || (att.loginStatus && att.loginStatus.startsWith('Late')));
        const isPending = !att.checkIn || att.checkIn === '-' || att.loginStatus?.includes('Pending');
        const loginStatus = isOnLeave ? 'On Leave' : (isPending ? 'Pending Clock-In' : (isLate ? `Late (${att.lateMinutes || 8} mins)` : 'On Time'));

        return {
          id: emp.id || emp.employeeId,
          employeeId: emp.id || emp.employeeId,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          role: emp.role,
          department: emp.department || 'Operations',
          designation: emp.role,
          avatar: emp.avatar,
          assignedShiftId: shiftObj.id,
          baseShiftId: shiftObj.id,
          assignedShift: `${shiftObj.shiftName} (${shiftObj.timing})`,
          shiftName: shiftObj.shiftName,
          scheduledLoginTime: shiftObj.scheduledLoginTime,
          scheduledLogoutTime: shiftObj.scheduledLogoutTime,
          actualClockInTime: isPending ? '—' : (isOnLeave ? '—' : (att.checkIn || '09:00 AM')),
          actualClockOutTime: isPending ? '—' : (isOnLeave ? '—' : (att.checkOut || '06:00 PM')),
          loginStatus,
          isLate,
          lateMinutes: att.lateMinutes || (isLate ? 8 : 0),
          lateApprovalStatus: isLate ? 'Pending Approval' : 'None',
          shiftAssignmentPeriod: 'Ongoing Default',
          assignmentFrequency: 'default'
        };
      });

    const activeWorkforce = raw.filter(emp => {
      if (String(emp.status || 'Active').toLowerCase() === 'inactive') return false;
      const emailLower = String(emp.email || '').toLowerCase();
      if (emailLower.startsWith('test.recruiter.') || emailLower.startsWith('qa.late.')) return false;
      return true;
    });

    // When viewed in Read-Only mode by HR Operations, strictly show ONLY the logged-in HR staff's record
    if (readOnlyMode) {
      const myId = (user?.employeeId || user?.id || currentEmployee?.employeeId || currentEmployee?.id || '').toString().trim().toLowerCase();
      const myEmail = (user?.email || currentEmployee?.email || '').toLowerCase().trim();
      const myName = (user?.name || currentEmployee?.name || '').toLowerCase().trim();

      const selfRecord = activeWorkforce.filter(emp => {
        const empId = (emp.employeeId || emp.id || '').toString().trim().toLowerCase();
        const empEmail = (emp.email || '').toLowerCase().trim();
        const empName = (emp.name || '').toLowerCase().trim();

        if (myId && empId && (empId === myId || empId.includes(myId) || myId.includes(empId))) {
          return true;
        }
        if (myEmail && empEmail && empEmail === myEmail) {
          return true;
        }
        if (myName && empName && (empName === myName || empName.includes(myName) || myName.includes(empName))) {
          return true;
        }
        return false;
      });

      return selfRecord;
    }

    return activeWorkforce;
  }, [shiftRosterData, employees, readOnlyMode, user, currentEmployee]);

  const allAssignableEmployees = useMemo(() => {
    const raw = (shiftRosterData && shiftRosterData.length > 0) ? shiftRosterData : employees;
    const filtered = raw.filter(emp => {
      if (String(emp.status || 'Active').toLowerCase() === 'inactive') return false;
      const emailLower = String(emp.email || '').toLowerCase();
      if (emailLower.startsWith('test.recruiter.') || emailLower.startsWith('qa.late.')) return false;
      return true;
    });
    return filtered.length > 0 ? filtered : displayEmployees;
  }, [shiftRosterData, employees, displayEmployees]);

  const loadShiftRosterData = useCallback(async () => {
    setShiftRosterLoading(true);
    try {
      let token = crmToken;
      if (!token) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewJson = await previewRes.json();
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
          }
        } catch (_) { }
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-user-data': JSON.stringify(user || { role: currentRole || 'HR Lead', email: user?.email }),
        'x-employee-email': user?.email || '',
        'x-crm-role': currentRole || 'HR Lead'
      };

      const [rosterRes, assignmentsRes, lateRes, tasksRes] = await Promise.all([
        fetch(`/api/crm/shifts/roster?date=${shiftSelectedDate}`, { cache: 'no-store', headers }),
        fetch('/api/crm/shifts/assignments', { cache: 'no-store', headers }),
        fetch('/api/crm/shifts/late-approvals', { cache: 'no-store', headers }),
        fetch('/api/hr-operations/tasks', {
          cache: 'no-store',
          headers: {
            ...headers,
            'x-user-role': currentRole || (readOnlyMode ? 'HR Operations' : 'HR Lead'),
            'x-employee-id': user?.employeeId || user?.id || '',
            'x-employee-name': user?.name || ''
          }
        })
      ]);

      if (rosterRes.ok) {
        const rosterJson = await rosterRes.json();
        if (rosterJson?.success && Array.isArray(rosterJson.employees)) {
          setShiftRosterData(rosterJson.employees);
        }
      }
      if (assignmentsRes.ok) {
        const asgnJson = await assignmentsRes.json();
        if (asgnJson?.success && Array.isArray(asgnJson.assignments)) {
          setShiftAssignmentsList(asgnJson.assignments);
        }
      }
      if (lateRes.ok) {
        const lateJson = await lateRes.json();
        if (lateJson?.success && Array.isArray(lateJson.requests)) {
          setLateApprovalsList(lateJson.requests);
        }
      }
      if (tasksRes.ok) {
        const tasksJson = await tasksRes.json();
        const tList = Array.isArray(tasksJson?.tasks) ? tasksJson.tasks : (Array.isArray(tasksJson?.data) ? tasksJson.data : []);
        setAssignedTasksForCalendar(tList);
      }
    } catch (err) {
      console.warn('Failed to load shift roster from server:', err);
    } finally {
      setShiftRosterLoading(false);
    }
  }, [crmToken, currentRole, user?.email, user?.id, user?.employeeId, user?.name, setCrmToken, shiftSelectedDate, readOnlyMode]);

  useEffect(() => {
    if (activeTab === 'shifts') {
      loadShiftRosterData();
    }
  }, [activeTab, shiftSelectedDate, loadShiftRosterData]);

  // Auto-sync shift calendar & tasks when updated from another tab or view
  useEffect(() => {
    if (activeTab !== 'shifts') return undefined;
    const handleSync = () => loadShiftRosterData();
    const onStorage = (e) => {
      if (e.key === 'sir_shifts_updated_at' || e.key === 'sir_tasks_updated_at') handleSync();
    };
    window.addEventListener('sir-shifts-updated', handleSync);
    window.addEventListener('sir-tasks-updated', handleSync);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', handleSync);

    let bcShift = null;
    let bcTask = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bcShift = new BroadcastChannel('sir_shift_assignments');
        bcShift.onmessage = handleSync;
      } catch (_) { }
      try {
        bcTask = new BroadcastChannel('sir_hr_tasks');
        bcTask.onmessage = handleSync;
      } catch (_) { }
    }
    const timer = setInterval(handleSync, 15000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('sir-shifts-updated', handleSync);
      window.removeEventListener('sir-tasks-updated', handleSync);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', handleSync);
      if (bcShift) bcShift.close();
      if (bcTask) bcTask.close();
    };
  }, [activeTab, loadShiftRosterData]);

  const handleOpenAssignModal = (employee = null) => {
    setAssignEmpSearch('');
    setAssignModalError('');
    if (!shiftRosterData || shiftRosterData.length === 0) {
      loadShiftRosterData();
    }
    const targetEmp = employee || (readOnlyMode ? displayEmployees[0] : null);
    if (targetEmp) {
      setAssignFormTarget({
        employeeIds: [targetEmp.employeeId || targetEmp.id],
        shiftId: targetEmp.assignedShiftId || 'SHIFT-GENERAL',
        startDate: shiftSelectedDate || new Date().toISOString().slice(0, 10),
        endDate: '',
        frequency: 'one_day',
        applicableDays: [1, 2, 3, 4, 5],
        notes: ''
      });
      setIsEmpDropdownOpen(false);
    } else {
      const selected = bulkSelectedEmpIds.length > 0 ? bulkSelectedEmpIds : [];
      setAssignFormTarget({
        employeeIds: selected,
        shiftId: 'SHIFT-GENERAL',
        startDate: shiftSelectedDate || new Date().toISOString().slice(0, 10),
        endDate: '',
        frequency: 'one_day',
        applicableDays: [1, 2, 3, 4, 5],
        notes: ''
      });
      setIsEmpDropdownOpen(selected.length === 0);
    }
    setIsAssignShiftOpen(true);
  };

  const handleSaveShiftAssignment = async (e) => {
    e?.preventDefault();
    setAssignModalError('');

    if (assignFormTarget.employeeIds.length === 0) {
      setAssignModalError('⚠️ Please select at least one employee from the list below.');
      showToast('⚠️ Please select at least one employee.');
      setIsEmpDropdownOpen(true);
      return;
    }
    if (!assignFormTarget.startDate) {
      setAssignModalError('⚠️ Assignment start date is required.');
      showToast('⚠️ Assignment start date is required.');
      return;
    }
    if (assignFormTarget.endDate && assignFormTarget.endDate < assignFormTarget.startDate) {
      setAssignModalError('⚠️ End date cannot be earlier than start date.');
      showToast('⚠️ End date cannot be earlier than start date.');
      return;
    }

    setIsSavingShift(true);

    try {
      let token = crmToken;
      if (!token) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewJson = await previewRes.json();
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
          }
        } catch (_) { }
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-user-data': JSON.stringify(user || { role: currentRole || 'HR Lead', email: user?.email }),
        'x-employee-email': user?.email || '',
        'x-crm-role': currentRole || 'HR Lead'
      };

      const rosterSnapshot = (typeof displayEmployees !== 'undefined' && Array.isArray(displayEmployees) && displayEmployees.length > 0)
        ? displayEmployees
        : (Array.isArray(shiftRosterData) && shiftRosterData.length > 0 ? shiftRosterData : (Array.isArray(employees) ? employees : []));
      const employeeDetails = assignFormTarget.employeeIds.map((eid) => {
        const matched = rosterSnapshot.find(emp => (emp.employeeId || emp.id) === eid);
        return matched ? { id: eid, employeeId: matched.employeeId || matched.id, name: matched.name, email: matched.email } : { id: eid };
      });

      let res = await fetch('/api/crm/shifts/assign', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employeeIds: assignFormTarget.employeeIds,
          employeeDetails,
          shiftId: assignFormTarget.shiftId,
          startDate: assignFormTarget.startDate,
          endDate: assignFormTarget.endDate || null,
          frequency: assignFormTarget.frequency,
          applicableDays: assignFormTarget.applicableDays,
          notes: assignFormTarget.notes
        })
      });

      if (!res.ok && (res.status === 401 || res.status === 403)) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewText = await previewRes.text();
          let previewJson = null;
          try { previewJson = JSON.parse(previewText); } catch (_) { }
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
            headers.Authorization = `Bearer ${token}`;
            res = await fetch('/api/crm/shifts/assign', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                employeeIds: assignFormTarget.employeeIds,
                employeeDetails,
                shiftId: assignFormTarget.shiftId,
                startDate: assignFormTarget.startDate,
                endDate: assignFormTarget.endDate || null,
                frequency: assignFormTarget.frequency,
                applicableDays: assignFormTarget.applicableDays,
                notes: assignFormTarget.notes
              })
            });
          }
        } catch (_) { }
      }

      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry in a moment.` };
      }
      if (res.ok && data?.success) {
        const targetIds = Array.isArray(assignFormTarget?.employeeIds) ? assignFormTarget.employeeIds : [];
        const rosterList = (typeof displayEmployees !== 'undefined' && Array.isArray(displayEmployees))
          ? displayEmployees
          : (Array.isArray(shiftRosterData) && shiftRosterData.length > 0 ? shiftRosterData : (Array.isArray(employees) ? employees : []));
        const assignedNames = targetIds
          .map(id => rosterList.find(e => (e.employeeId || e.id) === id)?.name || id)
          .join(', ');
        const successMessage = `✓ ${data.message || 'Shift assigned successfully.'}${assignedNames ? ` (${assignedNames})` : ''}`;
        showToast(successMessage);
        setShiftAssignmentSuccessBanner(successMessage);
        setTimeout(() => setShiftAssignmentSuccessBanner(''), 8000);
        setIsAssignShiftOpen(false);
        setAssignEmpSearch('');
        setIsEmpDropdownOpen(false);
        setBulkSelectedEmpIds([]);
        setAssignModalError('');
        if (assignFormTarget.startDate) {
          setShiftSelectedDate(assignFormTarget.startDate);
          setMonthlyActiveDateStr(assignFormTarget.startDate);
        }
        await loadShiftRosterData();
        try {
          localStorage.setItem('sir_shifts_updated_at', String(Date.now()));
          window.dispatchEvent(new Event('sir-shifts-updated'));
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('sir_shift_assignments');
            bc.postMessage({ type: 'updated', at: Date.now() });
            bc.close();
          }
        } catch (_) { }
      } else {
        const errMsg = data?.message || 'Failed to assign shift. Please check authorization.';
        setAssignModalError(`⚠️ ${errMsg}`);
        showToast(`⚠️ ${errMsg}`);
      }
    } catch (err) {
      const errMsg = err.message || 'Unable to connect to server.';
      setAssignModalError(`⚠️ Network error: ${errMsg}`);
      showToast(`⚠️ Error: ${errMsg}`);
    } finally {
      setIsSavingShift(false);
    }
  };

  const handleLateApprovalDecision = async (requestId, decision, notes = '') => {
    try {
      let token = crmToken;
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/crm/shifts/late-approvals/${requestId}/decision`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ decision, notes })
      });

      const rawText = await res.text();
      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        data = { success: false, message: `Server returned status ${res.status}. Please retry.` };
      }
      if (res.ok && data?.success) {
        showToast(`✓ Late login ${decision.toLowerCase()} successfully.`);
        setLateDecisionModal({ open: false, request: null, decision: 'Approved', notes: '' });
        loadShiftRosterData();
      } else {
        showToast(`⚠️ ${data?.message || 'Failed to record decision.'}`);
      }
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    }
  };

  const [selectedShiftId, setSelectedShiftId] = useState('SHIFT-GENERAL');
  const [shiftRosterSearch, setShiftRosterSearch] = useState('');
  const [shiftStatusFilter, setShiftStatusFilter] = useState('All');
  const [editingPunchEmployee, setEditingPunchEmployee] = useState(null);
  const [punchFormData, setPunchFormData] = useState({
    checkIn: '',
    checkOut: '',
    punchSource: 'Biometric Scanner #01',
    loginStatus: 'On Time',
    lateMinutes: 0
  });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleReassignShift = async (employeeId, targetShiftId) => {
    const targetShift = SHIFT_CONFIGS.find(s => s.id === targetShiftId) || SHIFT_CONFIGS[0];
    try {
      let token = crmToken;
      await fetch('/api/crm/shifts/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          employeeIds: [employeeId],
          shiftId: targetShift.id,
          startDate: shiftSelectedDate,
          frequency: 'one_day',
          notes: `Quick reassigned to ${targetShift.shiftName}`
        })
      });
      loadShiftRosterData();
    } catch (_) { }

    showToast(`✓ Shift updated: Reassigned to ${targetShift.shiftName} (${targetShift.timing})`);
  };

  const handleOpenEditPunch = (emp) => {
    setEditingPunchEmployee(emp);
    setPunchFormData({
      checkIn: emp.attendanceToday?.checkIn || '09:00 AM',
      checkOut: emp.attendanceToday?.checkOut || '06:00 PM',
      punchSource: emp.attendanceToday?.punchSource || 'Biometric Scanner #01',
      loginStatus: emp.attendanceToday?.loginStatus || 'On Time',
      lateMinutes: emp.attendanceToday?.lateMinutes || 0
    });
  };

  const handleSavePunch = (e) => {
    e.preventDefault();
    if (!editingPunchEmployee) return;

    const shiftId = editingPunchEmployee.shiftId || 'shift-9-6';
    const punctuality = computePunctuality(punchFormData.checkIn, shiftId);

    const updated = employees.map(emp => {
      if (emp.id === editingPunchEmployee.id) {
        return {
          ...emp,
          attendanceToday: {
            ...emp.attendanceToday,
            checkIn: punchFormData.checkIn.trim(),
            checkOut: punchFormData.checkOut.trim() || 'In Office',
            punchSource: punchFormData.punchSource,
            late: punctuality.isLate,
            lateMinutes: punctuality.lateMinutes,
            loginStatus: punctuality.status,
            status: punctuality.status === 'On Leave' ? 'On Leave' : (punchFormData.checkIn === '-' || punchFormData.checkIn.toLowerCase().includes('pending') ? 'Absent' : 'Present')
          }
        };
      }
      return emp;
    });

    setEmployees(updated);
    try {
      localStorage.setItem(STORAGE_KEY_WORKFORCE, JSON.stringify(updated));
    } catch (err) { }

    showToast(`✓ Punch timestamp updated for ${editingPunchEmployee.name} (${punchFormData.checkIn}) — ${punctuality.status}`);
    setEditingPunchEmployee(null);
  };

  // 7. GRIEVANCES STATE (Advanced Feature 4)
  const [grievances, setGrievances] = useState([
    { id: 'GRV-01', category: 'Facility & Ergonomics', priority: 'Medium', submittedDate: 'Nov 03, 2026', status: 'Under Investigation', details: 'Air conditioning temperature control and ergonomic chair replacement on Floor 2.' },
    { id: 'GRV-02', category: 'Payroll Deduction Query', priority: 'Standard', submittedDate: 'Nov 01, 2026', status: 'Resolved', details: 'Professional tax slab recalculation query resolved with finance team.' }
  ]);

  // Attendance Oversight Date & Interactive Calendar State
  const todayDateStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch (_) {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);

  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch (_) {
      return new Date().toISOString().slice(0, 10);
    }
  });

  const [calendarViewYear, setCalendarViewYear] = useState(() => new Date().getFullYear());
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => new Date().getMonth());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarPopoverRef = useRef(null);

  const [dateAttendanceRecords, setDateAttendanceRecords] = useState([]);
  const [dateAttendanceStats, setDateAttendanceStats] = useState(null);
  const [attendanceRecordedDates, setAttendanceRecordedDates] = useState([]);
  const [dateAttendanceLoading, setDateAttendanceLoading] = useState(false);
  const [attendanceNowMs, setAttendanceNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (activeTab !== 'attendance') return;
    const timer = setInterval(() => setAttendanceNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('All');

  const buildFallbackDateAttendance = (dateStr) => {
    const isToday = dateStr === todayDateStr;
    const dt = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = dt.getUTCDay();
    // Saturday is a regular working day; Sunday (0) is the weekly off
    const isWeeklyOff = dayOfWeek === 0;

    const baseList = employees && employees.length > 0 ? employees : INITIAL_HR_EMPLOYEES;
    return baseList.map(emp => {
      const onLeave = leaveRequests && leaveRequests.some(l =>
        l.employeeId === emp.id &&
        (l.status || '').toLowerCase().includes('approved') &&
        l.startDate <= dateStr && l.endDate >= dateStr
      );

      let status = 'Not Checked In';
      let checkIn = '—';
      let checkOut = '—';
      let breakDuration = '0h 00m';
      let totalWorkingHours = '—';
      let lateOrEarly = '—';
      let late = false;
      let lateMinutes = 0;
      let remarks = 'No punch logged for this date';

      if (onLeave) {
        status = 'On Leave';
        remarks = 'Approved Leave';
      } else if (isWeeklyOff) {
        status = 'Weekly Off';
        remarks = 'Scheduled Weekly Off';
      } else if (isToday) {
        if (emp.attendanceToday?.status === 'Present' || emp.attendanceToday?.status === 'Late') {
          status = emp.attendanceToday?.status === 'Late' ? 'Late' : 'Present';
          checkIn = emp.attendanceToday.checkIn || '08:52 AM';
          checkOut = emp.attendanceToday.checkOut || 'Not Checked Out';
          totalWorkingHours = emp.attendanceToday.hours || '8h 00m';
          breakDuration = '45m';
          late = !!emp.attendanceToday.late || emp.attendanceToday?.status === 'Late';
          lateMinutes = emp.attendanceToday.lateMinutes || (late ? 14 : 0);
          lateOrEarly = late ? `⚠️ Late (+${lateMinutes || 14}m)` : '✓ On Time';
          remarks = late ? `Late check-in (+${lateMinutes || 14}m)` : 'Biometric Attendance Punch';
        } else if (emp.attendanceToday?.status === 'On Leave') {
          status = 'On Leave';
          remarks = 'Approved Leave';
        } else {
          status = 'Not Checked In';
          remarks = 'Pending check-in';
        }
      } else {
        if (dateStr < todayDateStr) {
          if (emp.attendanceToday?.status === 'Present') {
            status = 'Present';
            checkIn = emp.attendanceToday.checkIn || '09:00 AM';
            checkOut = emp.attendanceToday.checkOut && emp.attendanceToday.checkOut !== '—' ? emp.attendanceToday.checkOut : '06:00 PM';
            totalWorkingHours = '8h 30m';
            breakDuration = '45m';
            lateOrEarly = '✓ On Time';
            remarks = 'Biometric Attendance Punch';
          } else {
            status = 'Absent';
            remarks = 'Unexcused Absence';
          }
        } else {
          status = 'Not Checked In';
          remarks = 'Future Date';
        }
      }

      return {
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.department || 'Operations',
        location: emp.location || 'Dubai HQ',
        avatar: emp.avatar || '',
        avatarLetter: emp.avatarLetter || emp.name?.charAt(0) || 'E',
        date: dateStr,
        status,
        checkIn,
        checkOut,
        breakDuration,
        totalWorkingHours,
        late,
        lateMinutes,
        lateOrEarly,
        remarks
      };
    });
  };

  const loadDateAttendance = async (targetDate) => {
    setDateAttendanceLoading(true);
    try {
      let token = crmToken;
      if (!token) {
        try {
          const previewRes = await fetch('/api/crm/auth/preview-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetRole: currentRole || 'HR Lead',
              targetEmail: user?.email,
              employeeId: user?.id
            })
          });
          const previewJson = await previewRes.json();
          if (previewJson?.success && previewJson.token) {
            token = previewJson.token;
            if (setCrmToken) setCrmToken(token);
          }
        } catch (_) { }
      }

      const res = await fetch(`/api/hr-ops/attendance/admin/today-register?date=${targetDate}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.register)) {
          setDateAttendanceRecords(json.register);
          setDateAttendanceStats(json.stats || null);
          if (Array.isArray(json.recordedDates)) {
            setAttendanceRecordedDates(json.recordedDates);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch date attendance register:', err);
    } finally {
      setDateAttendanceLoading(false);
    }

    const fallbackList = buildFallbackDateAttendance(targetDate);
    setDateAttendanceRecords(fallbackList);
    const presentCount = fallbackList.filter(r => r.status === 'Present').length;
    const lateCount = fallbackList.filter(r => r.late).length;
    const leaveCount = fallbackList.filter(r => r.status === 'On Leave').length;
    const absentCount = fallbackList.filter(r => r.status === 'Absent' || r.status === 'Not Checked In').length;
    setDateAttendanceStats({
      totalWorkforce: fallbackList.length,
      totalEmployees: fallbackList.length,
      presentCount,
      lateCount,
      leaveCount,
      absentCount
    });
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (calendarPopoverRef.current && !calendarPopoverRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadDateAttendance(selectedAttendanceDate);
    }
  }, [selectedAttendanceDate, activeTab]);

  const handleSelectDate = (dateStr) => {
    setSelectedAttendanceDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    setCalendarViewYear(y);
    setCalendarViewMonth(m - 1);
    setIsCalendarOpen(false);
  };

  const handleStepDay = (delta) => {
    const cur = new Date(`${selectedAttendanceDate}T12:00:00Z`);
    cur.setUTCDate(cur.getUTCDate() + delta);
    const nextDateStr = cur.toISOString().slice(0, 10);
    setSelectedAttendanceDate(nextDateStr);
    setCalendarViewYear(cur.getUTCFullYear());
    setCalendarViewMonth(cur.getUTCMonth());
  };

  const handleJumpToToday = () => {
    setSelectedAttendanceDate(todayDateStr);
    const today = new Date();
    setCalendarViewYear(today.getFullYear());
    setCalendarViewMonth(today.getMonth());
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (calendarViewMonth === 0) {
      setCalendarViewMonth(11);
      setCalendarViewYear(y => y - 1);
    } else {
      setCalendarViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (calendarViewMonth === 11) {
      setCalendarViewMonth(0);
      setCalendarViewYear(y => y + 1);
    } else {
      setCalendarViewMonth(m => m + 1);
    }
  };

  const formatSelectedDateDisplay = (dateStr) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return dt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (_) {
      return dateStr;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarMonthDays = useMemo(() => {
    const year = calendarViewYear;
    const month = calendarViewMonth;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, dateStr, isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ dayNum: day, dateStr, isCurrentMonth: true });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNum: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [calendarViewYear, calendarViewMonth]);

  const handleExportAttendanceCsv = () => {
    try {
      const recordsToExport = filteredDateAttendance && filteredDateAttendance.length > 0
        ? filteredDateAttendance
        : dateAttendanceRecords;

      if (!recordsToExport || recordsToExport.length === 0) {
        showToast('No attendance records available to export for this date.');
        return;
      }

      const headers = [
        'Employee ID',
        'Employee Name',
        'Department',
        'Attendance Status',
        'Check-In Time',
        'Check-Out Time',
        'Total Working Hours',
        'Late / Early Status',
        'Remarks'
      ];

      const csvRows = [
        headers.join(','),
        ...recordsToExport.map(r => [
          `"${r.employeeId || r.id || ''}"`,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${(r.department || '').replace(/"/g, '""')}"`,
          `"${(r.status || '').replace(/"/g, '""')}"`,
          `"${(r.checkIn || '').replace(/"/g, '""')}"`,
          `"${(r.checkOut || '').replace(/"/g, '""')}"`,
          `"${(r.totalWorkingHours || r.hours || '').replace(/"/g, '""')}"`,
          `"${(r.lateOrEarly || '').replace(/"/g, '""')}"`,
          `"${(r.remarks || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daily_Attendance_${selectedAttendanceDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`✓ Attendance CSV for ${selectedAttendanceDate} exported successfully.`);
    } catch (err) {
      showToast('Export failed. Please try again.');
    }
  };

  const filteredDateAttendance = useMemo(() => {
    let list = dateAttendanceRecords || [];
    if (attendanceSearchQuery.trim()) {
      const q = attendanceSearchQuery.toLowerCase();
      list = list.filter(r =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.employeeId && r.employeeId.toLowerCase().includes(q))
      );
    }
    if (attendanceDeptFilter !== 'All') {
      list = list.filter(r => (r.department || '') === attendanceDeptFilter);
    }
    if (attendanceStatusFilter !== 'All') {
      list = list.filter(r => {
        if (attendanceStatusFilter === 'Present') return r.status === 'Present' || r.status === 'Late';
        if (attendanceStatusFilter === 'Late') return r.late || r.status === 'Late';
        if (attendanceStatusFilter === 'Absent') return r.status === 'Absent' || r.status === 'Not Checked In';
        if (attendanceStatusFilter === 'On Leave') return r.status === 'On Leave';
        if (attendanceStatusFilter === 'Holiday') return r.status === 'Holiday';
        if (attendanceStatusFilter === 'Weekly Off') return r.status === 'Weekly Off';
        if (attendanceStatusFilter === 'Not Checked In') return r.status === 'Not Checked In';
        return r.status === attendanceStatusFilter;
      });
    }
    return list;
  }, [dateAttendanceRecords, attendanceSearchQuery, attendanceDeptFilter, attendanceStatusFilter]);

  const attendanceDepartmentList = useMemo(() => {
    const set = new Set();
    (dateAttendanceRecords || []).forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [dateAttendanceRecords]);

  const renderCompanyAnnouncementsSection = (showCreateButton = false) => (
    <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-gold-400 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Company Announcement
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Official corporate circulars, policy notifications, and operational directives published to workforce.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAnnouncementCalendar(prev => !prev)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border ${showAnnouncementCalendar
              ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 border-slate-900 dark:border-amber-400'
              : 'bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-navy-700'
              }`}
            title="Toggle Announcement Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showAnnouncementCalendar ? 'Hide Calendar' : 'Calendar'}</span>
          </button>

          {Boolean(showCreateButton) && (
            <button
              type="button"
              onClick={() => {
                setAnnouncementFormErrors({});
                setAnnouncementForm({
                  id: null,
                  title: '',
                  description: '',
                  category: 'General Notice',
                  target_audience: 'All Employees',
                  status: 'Published',
                  publish_date: '',
                  expires_at: ''
                });
                setIsCreateAnnouncementOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs border border-amber-400"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-navy-800">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Active', count: companyAnnouncements.filter(a => !a.isDeleted && a.status !== 'Deleted' && !a.isExpired && a.status !== 'Expired').length },
            { id: 'published', label: 'Published', count: companyAnnouncements.filter(a => a.status === 'Published' && !a.isExpired && !a.isDeleted).length },
            { id: 'scheduled', label: 'Scheduled', count: companyAnnouncements.filter(a => a.status === 'Scheduled' && !a.isDeleted).length },
            { id: 'draft', label: 'Drafts', count: companyAnnouncements.filter(a => a.status === 'Draft' && !a.isDeleted).length },
            { id: 'deleted', label: 'Deleted', count: calendarAnnouncements.filter(a => a.isDeleted || a.status === 'Deleted').length },
            { id: 'hr-ops', label: 'For HR Operations', count: companyAnnouncements.filter(a => a.target_audience === 'HR Operations' && !a.isDeleted && !a.isExpired && a.status !== 'Expired').length }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setAnnouncementFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${announcementFilter === f.id
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${announcementFilter === f.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-navy-950 text-slate-600 dark:text-slate-400'
                }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-72">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={announcementSearch}
              onChange={(e) => setAnnouncementSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
            {announcementSearch && (
              <button
                type="button"
                onClick={() => setAnnouncementSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={loadCompanyAnnouncements}
            className="p-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Refresh announcements"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${announcementsLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3.5 pt-1">
        {filteredCompanyAnnouncements.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-dashed border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400">
            <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">
              No Company Announcements Found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {announcementSearch || announcementFilter !== 'all'
                ? 'No announcements match the selected filter.'
                : 'No company announcements published at this time.'}
            </p>
          </div>
        ) : (
          filteredCompanyAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="w-full p-4 sm:p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 transition hover:border-amber-500/40 shadow-xs group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Category, audience, status, title, description, and issuer details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAnnouncementCategoryBadgeClass(ann.category)}`}>
                      {ann.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{ann.target_audience}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${ann.status === 'Published'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : ann.status === 'Expired'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : ann.status === 'Scheduled'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : ann.isDeleted || ann.status === 'Deleted'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                      {ann.status === 'Published' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{ann.isDeleted || ann.status === 'Deleted' ? 'Deleted' : ann.status}</span>
                    </span>
                    {(ann.isDeleted || ann.status === 'Deleted') && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {ann.wasPublished || ann.was_published || ann.published_at ? 'Previously Published' : 'Never Published'}
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors break-words">
                    {ann.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words line-clamp-2 md:line-clamp-3">
                    {ann.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Issued by: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{ann.created_by_name || 'HR Lead'}</strong> ({ann.created_by_role || 'HR Lead'})
                    </span>
                  </div>
                </div>

                {/* Right: Expiry badge, Published date/time, "Read Full Notice" button, and actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-navy-800">
                  {ann.expires_at && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${ann.status === 'Expired'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                      Expires: {ann.expires_at}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ann.status === 'Draft' ? 'Draft (Unpublished)' : formatAnnouncementDateTime(ann.published_at || ann.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncementForModal(ann)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-navy-900 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/15 dark:hover:text-amber-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:border-amber-400/80 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Notice</span>
                    </button>

                    {!(ann.isDeleted || ann.status === 'Deleted') ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setAnnouncementFormErrors({});
                            setAnnouncementForm({
                              id: ann.id,
                              title: ann.title || '',
                              description: ann.description || '',
                              category: ann.category || 'General Notice',
                              target_audience: ann.target_audience || 'All Employees',
                              status: ann.status || 'Published',
                              publish_date: ann.publishDate || (ann.published_at ? String(ann.published_at).slice(0, 10) : ''),
                              expires_at: ann.expires_at || ''
                            });
                            setIsCreateAnnouncementOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 transition cursor-pointer"
                          title="Edit Announcement"
                        >
                          Edit
                        </button>

                        {ann.status === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => handlePublishDraft(ann.id, ann.title)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Publish Announcement"
                          >
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Publish</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteReason('');
                            setDeleteConfirmAnnouncement(ann);
                          }}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/15 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestoreAnnouncement(ann.id, ann.title)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Restore Announcement"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAnnouncementCalendar && (
        <SharedAnnouncementCalendar
          announcements={calendarAnnouncements}
          onSelectAnnouncement={(ann) => {
            setShowAnnouncementCalendar(false);
            setSelectedAnnouncementForModal(ann);
          }}
          onClose={() => setShowAnnouncementCalendar(false)}
          title="Shared Announcement Calendar"
        />
      )}
    </div>
  );

  // COMPUTED TOP METRICS (from Image 1: Feature 1. Dashboard Overview)
  const totalEmployeesCount = 48; // Scaled total enterprise headcount
  const presentTodayCount = employees.filter(e => e.attendanceToday.status === 'Present').length + 35; // 42
  const absentCount = 2;
  const onLeaveCount = 4;
  const newJoinersCount = 3;
  const pendingApprovalsCount = leaveRequests.filter(l => l.status.includes('Pending')).length + expenseClaims.filter(e => e.status.includes('Pending')).length; // 6

  // Filtered Employees
  const filteredEmployees = employees.filter(e => {
    const matchQuery = e.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.role.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.id.toLowerCase().includes(searchEmployee.toLowerCase());
    const matchDept = filterDept === 'All' || e.department === filterDept;
    return matchQuery && matchDept;
  });

  const pendingLeavesCount = leaveRequests.filter(l => l.status.includes('Pending')).length;

  const isAttendanceTab = activeTab === 'attendance';
  const isSelectedDateToday = selectedAttendanceDate === todayDateStr;

  const kpiCards = [
    {
      id: 'total-employees',
      label: 'TOTAL EMPLOYEES',
      value: isAttendanceTab ? (dateAttendanceStats?.totalEmployees ?? totalEmployeesCount) : totalEmployeesCount,
      desc: isAttendanceTab
        ? (isSelectedDateToday ? '↗ 100% On-roll Staff' : `Workforce on ${selectedAttendanceDate}`)
        : '↗ 100% On-roll Staff',
      icon: Users,
      tab: 'employees',
      valueColor: 'text-slate-950 dark:text-white',
      descColor: 'text-blue-700 dark:text-blue-300',
      iconContainer: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
      iconBorder: 'border-blue-200/80 dark:border-blue-500/25'
    },
    {
      id: 'present-today',
      label: isAttendanceTab && !isSelectedDateToday ? 'PRESENT ON DATE' : 'PRESENT TODAY',
      value: isAttendanceTab ? (dateAttendanceStats?.presentCount ?? 0) : presentTodayCount,
      desc: isAttendanceTab
        ? `${dateAttendanceStats?.presentCount ?? 0} Recorded In-Office`
        : '↗ 87.5% Attendance',
      icon: CheckCircle2,
      tab: 'attendance',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      descColor: 'text-emerald-700 dark:text-emerald-300',
      iconContainer: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      iconBorder: 'border-emerald-200/80 dark:border-emerald-500/25'
    },
    {
      id: 'absent-today',
      label: isAttendanceTab && !isSelectedDateToday ? 'ABSENT ON DATE' : 'ABSENT TODAY',
      value: isAttendanceTab ? (dateAttendanceStats?.absentCount ?? 0) : absentCount,
      desc: isAttendanceTab
        ? `${dateAttendanceStats?.absentCount ?? 0} Absent / Pending`
        : '↗ 1 Uninformed Absence',
      icon: XCircle,
      tab: 'attendance',
      valueColor: 'text-rose-700 dark:text-rose-400',
      descColor: 'text-rose-700 dark:text-rose-300',
      iconContainer: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
      iconBorder: 'border-rose-200/80 dark:border-rose-500/25'
    },
    {
      id: 'on-leave',
      label: 'ON LEAVE',
      value: isAttendanceTab ? (dateAttendanceStats?.leaveCount ?? 0) : onLeaveCount,
      desc: '↗ Approved Leaves',
      icon: Calendar,
      tab: 'leave',
      valueColor: 'text-amber-700 dark:text-gold-400',
      descColor: 'text-amber-800 dark:text-gold-300',
      iconContainer: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-gold-400',
      iconBorder: 'border-amber-200/80 dark:border-amber-500/25'
    },
    isAttendanceTab ? {
      id: 'late-arrivals',
      label: 'LATE ARRIVALS',
      value: dateAttendanceStats?.lateCount ?? 0,
      desc: '↗ Check-in Delay',
      icon: AlertCircle,
      tab: 'attendance',
      valueColor: 'text-amber-700 dark:text-amber-400',
      descColor: 'text-amber-700 dark:text-amber-300',
      iconContainer: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      iconBorder: 'border-amber-200/80 dark:border-amber-500/25'
    } : {
      id: 'new-joiners',
      label: 'NEW JOINERS',
      value: newJoinersCount,
      desc: '↗ This Month (Nov 2026)',
      icon: UserPlus,
      tab: 'employees',
      valueColor: 'text-purple-700 dark:text-purple-300',
      descColor: 'text-purple-700 dark:text-purple-300',
      iconContainer: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300',
      iconBorder: 'border-purple-200/80 dark:border-purple-500/25'
    },
    {
      id: 'pending-leaves',
      label: 'PENDING LEAVES',
      value: pendingLeavesCount,
      desc: '↗ Review Required',
      icon: Calendar,
      tab: 'leave',
      valueColor: 'text-amber-900 dark:text-gold-300',
      descColor: 'text-amber-900 dark:text-gold-300',
      iconContainer: 'bg-amber-100/70 dark:bg-gold-500/15 text-amber-900 dark:text-gold-400',
      iconBorder: 'border-amber-300/70 dark:border-gold-500/30'
    }
  ];

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans pb-10">

        {/* TOP COMMAND BANNER (Hidden on Company Announcements and Shift Management views) */}
        {activeTab !== 'announcements' && activeTab !== 'shifts' && (
          <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                HR Lead
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30"
                data-testid="hr-lead-shift-timing"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Today’s Shift • General Shift
                  </p>
                  <p className="text-xs font-bold text-slate-950 dark:text-white">
                    09:00 AM – 06:00 PM
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {activeTab === 'employees' && (
                <button
                  onClick={() => {
                    setAddEmpErrors({});
                    setIsAddEmployeeOpen(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs border border-amber-400"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Employee</span>
                </button>
              )}
            </div>
          </div>
        )}

        {toastMsg && (
          <div className="fixed top-6 right-6 z-[9999] max-w-md p-4 bg-white dark:bg-navy-900 border-2 border-emerald-500 text-slate-900 dark:text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold leading-snug flex-1">
              {toastMsg}
            </div>
            <button
              type="button"
              onClick={() => setToastMsg('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 6 TOP EXECUTIVE KPI CARDS (Hidden on Company Announcements and Shift Management views) */}
        {activeTab !== 'announcements' && activeTab !== 'shifts' && (
          <section aria-label="Workforce Key Performance Indicators">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    data-testid={`kpi-card-${card.id}`}
                    onClick={() => card.tab && setActiveTab(card.tab)}
                    className="group relative bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 border-l-4 border-l-gold-500 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-gold-500/40 transition-all duration-200 flex flex-col justify-between min-h-[105px] cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
                        {card.label}
                      </span>
                      <div className={`w-8 h-8 rounded-xl ${card.iconContainer} flex items-center justify-center shrink-0 border ${card.iconBorder} shadow-2xs group-hover:scale-105 transition-transform duration-200`}>
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className={`text-2xl sm:text-3xl font-bold font-mono ${card.valueColor}`}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            TAB 1: DASHBOARD OVERVIEW (Feature 1)
        ======================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CrmHrTaskAssignment />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* COMPANY ANNOUNCEMENT SECTION (View-only on Dashboard Overview) */}
            {renderCompanyAnnouncementsSection(false)}
          </div>
        )}

        {/* ========================================================
            TAB 2: ATTENDANCE MANAGEMENT (Feature 2)
        ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Shift Late Arrival Approvals (HR Lead & Super Admin Authorization) */}
            <ShiftLateArrivalApprovalSection
              currentRole={currentRole || 'HR Lead'}
              crmToken={crmToken}
              onAuditClick={() => setActiveTab('attendance')}
            />

            {/* Top Toolbar */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 relative">
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white whitespace-nowrap">
                  Daily Employee Attendance
                </h3>

                {/* Interactive Calendar Controller */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 p-1.5 rounded-2xl border border-slate-200 dark:border-navy-800">
                  {/* Previous Day */}
                  <button
                    type="button"
                    onClick={() => handleStepDay(-1)}
                    title="Previous Day"
                    className="p-1.5 hover:bg-white dark:hover:bg-navy-900 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Date Selector Popover Trigger */}
                  <div className="relative" ref={calendarPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="px-3 py-1.5 bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-100 font-bold rounded-xl border border-slate-200 dark:border-navy-700 transition flex items-center gap-2 cursor-pointer text-xs shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{formatSelectedDateDisplay(selectedAttendanceDate)}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Interactive Calendar Popover Dropdown */}
                    {isCalendarOpen && (
                      <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        {/* Month & Year Navigation Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-navy-800">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="Previous Month"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-serif font-bold text-xs text-slate-900 dark:text-white">
                            {monthNames[calendarViewMonth]} {calendarViewYear}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="Next Month"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {calendarMonthDays.map((day, idx) => {
                            const isSelected = day.dateStr === selectedAttendanceDate;
                            const isToday = day.dateStr === todayDateStr;
                            const hasRecords = attendanceRecordedDates.includes(day.dateStr);

                            return (
                              <button
                                key={`${day.dateStr}-${idx}`}
                                type="button"
                                onClick={() => handleSelectDate(day.dateStr)}
                                className={`relative py-1.5 rounded-xl text-xs flex flex-col items-center justify-center transition cursor-pointer ${isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                  : day.isCurrentMonth
                                    ? isToday
                                      ? 'border border-amber-500 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800'
                                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-navy-950'
                                  }`}
                              >
                                <span>{day.dayNum}</span>
                                {hasRecords && !isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" title="Attendance recorded" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Popover Footer: Legend & Jump Today */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span>Logs available</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleJumpToToday}
                            className="px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Day */}
                  <button
                    type="button"
                    onClick={() => handleStepDay(1)}
                    title="Next Day"
                    className="p-1.5 hover:bg-white dark:hover:bg-navy-900 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Quick Today Button */}
                  {selectedAttendanceDate !== todayDateStr && (
                    <button
                      type="button"
                      onClick={handleJumpToToday}
                      className="ml-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-[11px] rounded-xl transition cursor-pointer border border-amber-500/30"
                    >
                      Today
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Actions: Export CSV */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportAttendanceCsv}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Monthly Attendance CSV
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={attendanceSearchQuery}
                    onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                    placeholder="Search by employee name or ID..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  {attendanceSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAttendanceSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Department Filter */}
                <select
                  value={attendanceDeptFilter}
                  onChange={(e) => setAttendanceDeptFilter(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {attendanceDepartmentList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {/* Attendance Status Filter */}
                <select
                  value={attendanceStatusFilter}
                  onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Weekly Off">Weekly Off</option>
                  <option value="Not Checked In">Not Checked In</option>
                </select>
              </div>

              {/* Status Count Summary Badge */}
              <div className="flex items-center gap-2 self-end sm:self-center text-[11px] text-slate-500 whitespace-nowrap">
                <span>Showing <strong className="text-slate-800 dark:text-slate-200">{filteredDateAttendance.length}</strong> records</span>
                {dateAttendanceLoading && (
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold whitespace-nowrap">Employee Name & ID</th>
                      <th className="p-4 font-bold whitespace-nowrap">Department</th>
                      <th className="p-4 font-bold text-center whitespace-nowrap">Attendance Status</th>
                      <th className="p-4 font-bold text-center whitespace-nowrap">Check-In</th>
                      <th className="p-4 font-bold text-center whitespace-nowrap">Check-Out</th>
                      <th className="p-4 font-bold text-center whitespace-nowrap">Total Working Hours</th>
                      <th className="p-4 font-bold text-center whitespace-nowrap">Late Arrival / Early Departure</th>
                      <th className="p-4 font-bold text-left whitespace-nowrap">Attendance Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {filteredDateAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-14 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-500 dark:text-slate-400">
                            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-1" />
                            <p className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">
                              No Attendance Records Found
                            </p>
                            <p className="text-xs text-slate-500">
                              No attendance records match your search or filter for {formatSelectedDateDisplay(selectedAttendanceDate)}.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              {(attendanceSearchQuery || attendanceDeptFilter !== 'All' || attendanceStatusFilter !== 'All') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAttendanceSearchQuery('');
                                    setAttendanceDeptFilter('All');
                                    setAttendanceStatusFilter('All');
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                >
                                  Clear Filters
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={handleJumpToToday}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition cursor-pointer"
                              >
                                Return to Today
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDateAttendance.map((record) => {
                        const isNotCheckedOut = record.checkOut === 'Not Checked Out';
                        const statusBadgeClass =
                          record.status === 'Present'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : record.status === 'Late'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : record.status === 'On Leave'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : record.status === 'Holiday'
                                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                  : record.status === 'Weekly Off'
                                    ? 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                                    : record.status === 'Absent'
                                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                      : 'bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-navy-800';

                        return (
                          <tr key={record.employeeId || record.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                            {/* 1. Employee Name and Employee ID */}
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/20">
                                  {record.avatarLetter || record.name?.charAt(0) || 'E'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-xs">{record.name}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">{record.employeeId || record.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Department */}
                            <td className="p-4 whitespace-nowrap">
                              <p className="font-medium text-slate-700 dark:text-slate-200 text-xs">{record.department}</p>
                              <span className="text-[10px] text-slate-400">{record.role || record.designation || 'Staff'}</span>
                            </td>

                            {/* 3. Attendance Status */}
                            <td className="p-4 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                                {record.status}
                              </span>
                            </td>

                            {/* 4. Check-in Time */}
                            <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {record.checkIn}
                            </td>

                            {/* 5. Check-out Time */}
                            <td className="p-4 text-center whitespace-nowrap">
                              {isNotCheckedOut ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-sans">
                                  Not Checked Out
                                </span>
                              ) : (
                                <span className="font-mono text-slate-600 dark:text-slate-300">
                                  {record.checkOut}
                                </span>
                              )}
                            </td>

                            {/* 6. Total Working Hours */}
                            <td className="p-4 text-center font-mono font-bold whitespace-nowrap">
                              {(() => {
                                const hasCheckIn = record.checkIn && record.checkIn !== '—';
                                if (!hasCheckIn) {
                                  return <span className="text-slate-400">—</span>;
                                }
                                let displayHours = record.totalWorkingHours || record.hours;
                                if (record.checkInAt && !record.checkOutAt) {
                                  const inMs = new Date(record.checkInAt).getTime();
                                  if (!isNaN(inMs)) {
                                    const breakMins = Number(record.totalBreakMinutes) || 0;
                                    const elapsedMins = Math.max(0, Math.floor((attendanceNowMs - inMs) / 60000) - breakMins);
                                    displayHours = `${Math.floor(elapsedMins / 60)}h ${String(elapsedMins % 60).padStart(2, '0')}m`;
                                  }
                                } else if (record.checkInAt && record.checkOutAt && (!displayHours || displayHours === 'In Progress')) {
                                  const inMs = new Date(record.checkInAt).getTime();
                                  const outMs = new Date(record.checkOutAt).getTime();
                                  if (!isNaN(inMs) && !isNaN(outMs) && outMs >= inMs) {
                                    const breakMins = Number(record.totalBreakMinutes) || 0;
                                    const mins = Math.max(0, Math.floor((outMs - inMs) / 60000) - breakMins);
                                    displayHours = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
                                  }
                                }
                                if (!displayHours || displayHours === 'In Progress' || displayHours === '0 hrs') {
                                  displayHours = '0h 00m';
                                }
                                return (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    {displayHours}
                                  </span>
                                );
                              })()}
                            </td>

                            {/* 8. Late Arrival / Early Departure */}
                            <td className="p-4 text-center whitespace-nowrap">
                              {record.late ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  {record.lateOrEarly || `⚠️ Late (+${record.lateMinutes || 14}m)`}
                                </span>
                              ) : record.checkIn && record.checkIn !== '—' ? (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  {record.lateOrEarly || '✓ On Time'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">—</span>
                              )}
                            </td>

                            {/* 9. Attendance Remarks */}
                            <td className="p-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate" title={record.remarks}>
                              {record.remarks || 'No notes'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: LEAVE MANAGEMENT (Feature 3)
        ======================================================== */}
        {activeTab === 'leave' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pending Requests Box */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Pending Leave Applications Awaiting HR Lead Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">Approve or reject requests with automatic balance deduction</p>
                </div>
                <span className="text-[10px] font-mono text-amber-700 dark:text-gold-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
                  {leaveRequests.filter(l => l.status.includes('Pending')).length} Actionable
                </span>
              </div>

              <div className="space-y-3">
                {leaveRequests.map(l => (
                  <div key={l.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{l.name}</span>
                        <span className="text-[10px] text-slate-400">({l.department})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {l.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">"{l.reason}"</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                        <span>📅 Duration: {l.startDate} to {l.endDate} ({l.days} Day{l.days > 1 ? 's' : ''})</span>
                        <span>• Submitted: {l.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {l.status.includes('Pending') ? (
                        <>
                          <button
                            onClick={() => handleLeaveDecision(l.id, 'Rejected')}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(l.id, 'Approved')}
                            className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Authorize Leave
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                          ✓ {l.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Balance Matrix */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
                <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Annual Leave Balance Ledger by Employee</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold">Employee</th>
                      <th className="p-4 font-bold">Department</th>
                      <th className="p-4 font-bold text-center">Casual Leave (12)</th>
                      <th className="p-4 font-bold text-center">Sick Leave (12)</th>
                      <th className="p-4 font-bold text-center">Paid / Earned Leave (18)</th>
                      <th className="p-4 font-bold text-right">Total Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{e.name}</td>
                        <td className="p-4 text-slate-500">{e.department}</td>
                        <td className="p-4 text-center font-mono font-bold text-blue-600">{e.leaveBalance.casual} Days</td>
                        <td className="p-4 text-center font-mono font-bold text-amber-600">{e.leaveBalance.sick} Days</td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600">{e.leaveBalance.paid} Days</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {e.leaveBalance.casual + e.leaveBalance.sick + e.leaveBalance.paid} Days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: EMPLOYEE DIRECTORY & MANAGEMENT (Feature 4)
        ======================================================== */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter & Search Bar - Fixed Mobile Alignment (Bug 4) */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, employee ID..."
                  value={searchEmployee}
                  onChange={e => setSearchEmployee(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-end gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Department:</span>
                  <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="flex-1 sm:flex-initial bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    <option value="HR Operations">HR Operations</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="Placement Cell">Placement Cell</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Client Advisory">Client Advisory</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setAddEmpErrors({});
                    setIsAddEmployeeOpen(true);
                  }}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Employee
                </button>
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(e => (
                <div key={e.id} className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-5 shadow-xs space-y-4 hover:border-amber-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-navy-800 text-amber-900 dark:text-gold-400 font-serif font-black text-xl flex items-center justify-center border border-amber-300/60 dark:border-navy-700 shadow-xs">
                        {e.avatarLetter}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{e.name}</h4>
                        <p className="text-[11px] text-amber-700 dark:text-gold-400 font-semibold">{e.role}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{e.id} • {e.location}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${e.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {e.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800 text-[11px]">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Department:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{e.department}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Employment:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{e.employmentType}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Joining Date:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{e.joiningDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Annual CTC:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {maskSalary ? '₹ •••••••• (Encrypted)' : e.ctc}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{e.email}</span>
                    <button
                      onClick={() => setSelectedProfileEmployee(e)}
                      className="text-xs text-amber-700 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PERFORMANCE REVIEWS (Feature 5)
        ======================================================== */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Quarterly Workforce Performance Review & KPI Scorecards
                  </h3>
                  <p className="text-[11px] text-slate-500">Objective task completion tracking, manager observations, and rating calibrations</p>
                </div>
                <button
                  onClick={() => {
                    setReviewError('');
                    setNewReview({
                      employee: employees[0]?.name || 'Balavarshini S.',
                      rating: 4.8,
                      targetScore: '110% Achieved',
                      tasksDone: '40/42',
                      feedback: 'Consistent delivery on core recruitment mandates with zero compliance escalations.',
                      reviewer: 'Priya Lead'
                    });
                    setIsAddReviewOpen(true);
                  }}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-2xl shadow-xs transition cursor-pointer text-xs"
                >
                  + Add Review
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {performanceReviews.map(p => (
                  <div key={p.id} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{p.employee}</h4>
                        <p className="text-[11px] text-slate-400">Evaluated by: {p.reviewer} • Review ID: {p.id}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          🎯 {p.targetScore}
                        </span>
                        <div className="flex items-center gap-1 bg-gold-500/15 text-gold-700 dark:text-gold-300 px-3 py-1 rounded-xl font-bold font-mono">
                          <Award className="w-3.5 h-3.5" />
                          <span>{p.rating} / 5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/50 dark:border-navy-800 text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                      "{p.feedback}"
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Task Completion Rate: <strong className="text-emerald-600 font-mono">{p.tasksDone}</strong> Tasks Finished</span>
                      <span className="text-emerald-600 font-bold">✓ Exceeds Quarterly Expectations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: ONBOARDING (Feature 6)
        ======================================================== */}
        {activeTab === 'recruitment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Onboarding Checklist Card */}
            <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-slate-950 dark:text-white">
                    New Employee Onboarding Milestones Checklist
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-300 mt-0.5">
                    Mandatory verification and provisioning track for this month's 3 new joiners
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-black font-mono text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 rounded-full border-2 border-emerald-300 dark:border-emerald-700 shadow-xs">
                  80% Completed
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { title: 'Identity & Address Proof Verification (Aadhaar / Passport / MOFA)', done: true },
                  { title: 'Signed Offer Letter, Employment Contract & NDA Executed', done: true },
                  { title: 'Enterprise Laptop, Email Credentials & Slack Provisioning', done: true },
                  { title: 'HR Handbook Orientation, POSH Policy Briefing & Code of Conduct', done: true },
                  { title: 'Department Lead Introduction & 30-Day Mentorship Assignment', done: false }
                ].map((chk, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl flex items-center justify-between border-2 border-slate-200/90 dark:border-navy-800 gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${chk.done ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-navy-800 text-slate-400'}`}>
                        {chk.done ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                      </div>
                      <span className={`text-xs sm:text-sm ${chk.done ? 'font-bold text-slate-950 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-400'}`}>{chk.title}</span>
                    </div>
                    <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-full shrink-0 ${chk.done ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700' : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'}`}>
                      {chk.done ? '✓ Verified' : 'Pending Induction'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Hiring Requisitions */}
            <div className="bg-white dark:bg-navy-900 border-2 border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="font-serif font-black text-lg sm:text-xl text-slate-950 dark:text-white border-b border-slate-200 dark:border-navy-800 pb-3">
                Active Hiring Requisitions & Pipeline Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { role: 'Senior Civil Project Manager', openings: 4, company: 'Al Habtoor Contracting LLC', applicants: 38, interviewed: 12, offered: 3 },
                  { role: 'Lead DevOps Cloud Architect', openings: 3, company: 'TechVision International', applicants: 45, interviewed: 18, offered: 2 },
                  { role: 'Consultant Cardiologist', openings: 2, company: 'Saudi German Hospital', applicants: 14, interviewed: 6, offered: 1 },
                  { role: 'Full Stack React / Node Lead', openings: 2, company: 'Revival Digital Labs', applicants: 62, interviewed: 14, offered: 2 }
                ].map((job, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border-2 border-slate-200/90 dark:border-navy-800 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-slate-950 dark:text-white text-sm sm:text-base">{job.role}</h4>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{job.company}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-gold-300 dark:border-gold-500/30 shrink-0">
                        {job.openings} Openings
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-navy-800">
                      <span>Applicants: {job.applicants}</span>
                      <span>Interviewed: {job.interviewed}</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">Offered: {job.offered}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: PAYROLL MANAGEMENT (Feature 7)
        ======================================================== */}
        {false && activeTab === 'payroll' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Gross Monthly Payroll</span>
                <p className="text-2xl font-serif font-black text-slate-900 dark:text-white mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹28,45,000'}
                </p>
                <span className="text-[10px] text-slate-400">48 On-roll Employees</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Statutory Deductions (PF/ESI)</span>
                <p className="text-2xl font-serif font-black text-rose-600 mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹3,24,000'}
                </p>
                <span className="text-[10px] text-rose-600 font-semibold">100% Tax Compliant</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Net Disbursement</span>
                <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹25,21,000'}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Processed for Nov 2026</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Disbursement Cycle</span>
                <p className="text-2xl font-serif font-black text-amber-600 mt-1">28th of Month</p>
                <span className="text-[10px] text-amber-600 font-semibold">Next on Nov 28, 2026</span>
              </div>
            </div>

            {/* Payslip & Salary Table Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              {/* Header Bar */}
              <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Monthly Employee Salary & Payslip Registry</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 dark:bg-navy-800 text-amber-800 dark:text-gold-400 border border-amber-200/60 dark:border-navy-700">
                    {employees.length} Records
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => setMaskSalary(!maskSalary)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs text-amber-700 dark:text-gold-400 font-bold hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {maskSalary ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{maskSalary ? 'Show Actual Figures' : 'Hide / Mask Figures'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPayrollRegisterPDF}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-navy-700"
                    title="Export full payroll ledger PDF"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Register PDF</span>
                  </button>

                  <button
                    onClick={handleRunAllPayroll}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Disburse direct deposits for all on-roll employees"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Run Nov 2026 Payroll</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3 bg-slate-50/70 dark:bg-navy-950/70 border-b border-slate-200/70 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={payrollSearch}
                    onChange={(e) => setPayrollSearch(e.target.value)}
                    placeholder="Search employee by name, ID or role..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                  />
                  {payrollSearch && (
                    <button onClick={() => setPayrollSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-500 font-medium">Department:</span>
                  <select
                    value={payrollDeptFilter}
                    onChange={(e) => setPayrollDeptFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden"
                  >
                    <option value="All">All Departments</option>
                    <option value="HR Operations">HR Operations</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="Placement & Relations">Placement & Relations</option>
                    <option value="Technology & Engineering">Technology & Engineering</option>
                    <option value="International Admissions">International Admissions</option>
                    <option value="Career Advisory">Career Advisory</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold">Employee Name</th>
                      <th className="p-4 font-bold">Designation</th>
                      <th className="p-4 font-bold text-center">Monthly Gross</th>
                      <th className="p-4 font-bold text-center">Annual CTC</th>
                      <th className="p-4 font-bold text-center">Disbursement Status</th>
                      <th className="p-4 font-bold text-right">Payslip Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {employees
                      .filter(e => {
                        const q = payrollSearch.toLowerCase().trim();
                        const matchesSearch = !q ||
                          e.name.toLowerCase().includes(q) ||
                          e.role.toLowerCase().includes(q) ||
                          (e.id && e.id.toLowerCase().includes(q));
                        const matchesDept = payrollDeptFilter === 'All' || e.department === payrollDeptFilter;
                        return matchesSearch && matchesDept;
                      })
                      .map(e => {
                        const status = disbursementStatuses[e.id] || 'Ready';
                        const isCredited = status === 'Credited';
                        const isGenerating = generatingPdfId === e.id;

                        return (
                          <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                  {e.avatarLetter || e.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{e.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{e.id} • Joined {e.joiningDate}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-medium text-slate-700 dark:text-slate-300">{e.role}</div>
                              <div className="text-[10px] text-amber-700 dark:text-gold-400 font-semibold">{e.department || 'HR Operations'}</div>
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                              {maskSalary ? '₹ ••••••' : e.salary}
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-emerald-600">
                              {maskSalary ? '₹ ••••••••' : e.ctc}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleEmployeeDisbursement(e.id)}
                                title="Click to toggle disbursement status"
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer border ${isCredited
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                  }`}
                              >
                                {isCredited ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>✓ Direct Deposit Credited</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>✓ Direct Deposit Ready</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="p-4 text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewEmployee(e)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs border border-slate-200/80 dark:border-navy-700"
                                  title={`Preview detailed salary statement for ${e.name}`}
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Preview</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadPayslipPDF(e)}
                                  disabled={isGenerating}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs border border-slate-200/80 dark:border-navy-700"
                                  title={`Download official PDF payslip for ${e.name}`}
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                  <span>{isGenerating ? 'Generating...' : 'Payslip PDF'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Payslip Preview Modal */}
            {previewEmployee && (
              <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
                  {/* Modal Header */}
                  <div className="p-4 bg-navy-950 text-white flex justify-between items-center border-b border-navy-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold-400" />
                      <h3 className="font-serif font-bold text-sm text-white">Employee Payslip Statement — {previewEmployee.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewEmployee(null)}
                      className="p-1.5 rounded-xl hover:bg-navy-800 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  {(() => {
                    const b = calculateSalaryBreakdown(previewEmployee);
                    const status = disbursementStatuses[previewEmployee.id] || 'Ready';
                    const isCredited = status === 'Credited';

                    return (
                      <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
                        {/* Company Branding */}
                        <div className="border-b border-slate-200 dark:border-navy-800 pb-4 flex justify-between items-start">
                          <div>
                            <h2 className="font-serif font-black text-lg text-slate-900 dark:text-white">THE REVIVAL INTERNATIONAL</h2>
                            <p className="text-[11px] text-amber-700 dark:text-gold-400 font-semibold">Corporate HR & International Recruitment Operations</p>
                            <p className="text-[10px] text-slate-500">Chennai HQ, Tamil Nadu • Dubai, UAE • ISO 9001:2025 Certified</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-gold-400 border border-navy-300 dark:border-navy-700">
                              Nov 2026 Pay Slip
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">REF: REV-PAY-{previewEmployee.id}</p>
                          </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-[11px]">
                          <div className="space-y-1">
                            <p><strong className="text-slate-500">Employee Name:</strong> <span className="font-bold text-slate-900 dark:text-white">{previewEmployee.name}</span></p>
                            <p><strong className="text-slate-500">Employee ID:</strong> <span className="font-mono font-bold text-amber-600">{previewEmployee.id}</span></p>
                            <p><strong className="text-slate-500">Designation:</strong> {previewEmployee.role}</p>
                            <p><strong className="text-slate-500">Department:</strong> {previewEmployee.department || 'HR Operations'}</p>
                            <p><strong className="text-slate-500">Location:</strong> {previewEmployee.location || 'Chennai HQ'}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong className="text-slate-500">Pay Period:</strong> {b.payPeriod}</p>
                            <p><strong className="text-slate-500">Disbursement Date:</strong> {b.payDate}</p>
                            <p><strong className="text-slate-500">Bank Account:</strong> {b.bankName} ({b.accountMasked})</p>
                            <p><strong className="text-slate-500">PAN / UAN:</strong> {b.pan} / {b.uan}</p>
                            <p><strong className="text-slate-500">Paid Days:</strong> {b.paidDays} Days (LOP: {b.lossOfPay} Days)</p>
                          </div>
                        </div>

                        {/* Earnings & Deductions Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
                            <div className="p-2 bg-slate-100 dark:bg-navy-800 font-bold text-slate-900 dark:text-white text-center text-[11px]">
                              EARNINGS
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex justify-between"><span>Basic Salary</span><strong className="font-mono">₹{b.basic.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>House Rent (HRA)</span><strong className="font-mono">₹{b.hra.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Special Allowance</span><strong className="font-mono">₹{b.specialAllowance.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Conveyance</span><strong className="font-mono">₹{b.conveyance.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Medical Allowance</span><strong className="font-mono">₹{b.medical.toLocaleString('en-IN')}</strong></div>
                              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex justify-between font-bold text-slate-900 dark:text-white">
                                <span>Total Gross</span>
                                <span className="font-mono text-slate-900 dark:text-white">₹{b.totalEarnings.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
                            <div className="p-2 bg-slate-100 dark:bg-navy-800 font-bold text-rose-600 text-center text-[11px]">
                              DEDUCTIONS
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex justify-between"><span>Provident Fund (PF)</span><strong className="font-mono">₹{b.pf.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Professional Tax (PT)</span><strong className="font-mono">₹{b.profTax.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Health Mediclaim</span><strong className="font-mono">₹{b.mediclaim.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>TDS / Income Tax</span><strong className="font-mono">₹{b.tds.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Other Statutory</span><strong className="font-mono">₹{b.esi.toLocaleString('en-IN')}</strong></div>
                              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex justify-between font-bold text-rose-600">
                                <span>Total Deductions</span>
                                <span className="font-mono">₹{b.totalDeductions.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Net Salary Highlight */}
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 dark:text-emerald-400">Net Take-Home Salary</span>
                            <p className="font-serif font-black text-xl text-emerald-700 dark:text-emerald-300">₹{b.netPay.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-emerald-600 italic mt-0.5">{numberToWords(b.netPay)}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isCredited ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                              {isCredited ? '✓ Direct Deposit Credited' : '✓ Direct Deposit Ready'}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">Disbursed on Nov 28, 2026</p>
                          </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400">Digitally Verified via Revival CRM Enterprise Edition</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPayslipPDF(previewEmployee)}
                              disabled={generatingPdfId === previewEmployee.id}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {generatingPdfId === previewEmployee.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Download Official PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 8: ANNOUNCEMENTS & LIFE EVENTS (Feature 8)
        ======================================================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {renderCompanyAnnouncementsSection(true)}
          </div>
        )}

        {/* MODAL: CREATE COMPANY ANNOUNCEMENT */}
        {isCreateAnnouncementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-luxury space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 uppercase tracking-wider border border-amber-500/30">
                      Official Announcement
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Create Company Announcement
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Publish official announcements, HR policy updates, and directives to HR Operations or all workforce members.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateAnnouncementOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementForm.title}
                    onChange={e => {
                      setAnnouncementForm({ ...announcementForm, title: e.target.value });
                      if (announcementFormErrors.title) {
                        setAnnouncementFormErrors(prev => ({ ...prev, title: '' }));
                      }
                    }}
                    placeholder="e.g. Q4 Company All-Hands & Policy Updates"
                    className={`w-full bg-slate-50 dark:bg-navy-950 border ${announcementFormErrors.title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-700'
                      } rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500`}
                  />
                  {announcementFormErrors.title && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {announcementFormErrors.title}</p>
                  )}
                </div>

                {/* Category & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={announcementForm.category}
                      onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="General Notice">General Notice</option>
                      <option value="HR Policy">HR Policy</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Important Update">Important Update</option>
                      <option value="Emergency Alert">Emergency Alert</option>
                      <option value="Welfare & Benefits">Welfare & Benefits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={announcementForm.target_audience}
                      onChange={e => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="All Employees">All Employees (Company-Wide)</option>
                      <option value="HR Operations">HR Operations (Operations Team Only)</option>
                    </select>
                  </div>
                </div>

                {/* Publish Date & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Publish Date <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={announcementForm.publish_date || ''}
                      onChange={e => setAnnouncementForm({ ...announcementForm, publish_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Future date automatically schedules the notice.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={announcementForm.expires_at || ''}
                      onChange={e => setAnnouncementForm({ ...announcementForm, expires_at: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Leave empty if this announcement does not expire.</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Description & Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={announcementForm.description}
                    onChange={e => {
                      setAnnouncementForm({ ...announcementForm, description: e.target.value });
                      if (announcementFormErrors.description) {
                        setAnnouncementFormErrors(prev => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Enter the complete announcement body, guidelines, policy details, or instructions..."
                    className={`w-full bg-slate-50 dark:bg-navy-950 border ${announcementFormErrors.description ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-700'
                      } rounded-xl p-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500`}
                  />
                  {announcementFormErrors.description && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {announcementFormErrors.description}</p>
                  )}
                </div>

                {/* Action Buttons: Save Draft, Publish Announcement, Cancel */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateAnnouncementOpen(false)}
                    disabled={savingAnnouncement}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={savingAnnouncement}
                      onClick={() => handleSaveAnnouncement('Draft')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{savingAnnouncement ? 'Saving...' : 'Save Draft'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={savingAnnouncement}
                      onClick={() => handleSaveAnnouncement('Published')}
                      className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-gold-glow transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>{savingAnnouncement ? 'Publishing...' : 'Publish Announcement'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: READ FULL NOTICE & AUDIT HISTORY (HR LEAD) */}
        {selectedAnnouncementForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getAnnouncementCategoryBadgeClass(selectedAnnouncementForModal.category)}`}>
                      {selectedAnnouncementForModal.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{selectedAnnouncementForModal.target_audience}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.status === 'Deleted'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : selectedAnnouncementForModal.status === 'Published'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : selectedAnnouncementForModal.status === 'Expired'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : selectedAnnouncementForModal.status === 'Scheduled'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.status === 'Deleted' ? 'Deleted' : selectedAnnouncementForModal.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white pt-1">
                    {selectedAnnouncementForModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncementForModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100 dark:border-navy-800">
                <span>Issued by: <strong className="text-slate-800 dark:text-slate-200">{selectedAnnouncementForModal.created_by_name || 'HR Lead'}</strong> ({selectedAnnouncementForModal.created_by_role || 'HR Lead'})</span>
                {selectedAnnouncementForModal.created_by && (
                  <span className="font-mono text-[10px] text-slate-400">[{selectedAnnouncementForModal.created_by}]</span>
                )}
                <span>•</span>
                <span className="font-mono">
                  {selectedAnnouncementForModal.published_at
                    ? formatAnnouncementDateTime(selectedAnnouncementForModal.published_at)
                    : 'Draft (Never Published)'}
                </span>
                {selectedAnnouncementForModal.expires_at && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Valid until: {selectedAnnouncementForModal.expires_at}</span>
                  </>
                )}
              </div>

              {(selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.is_deleted || selectedAnnouncementForModal.status === 'Deleted') && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 text-xs space-y-1">
                  <div className="font-bold text-rose-800 dark:text-rose-200 text-[11px]">
                    Soft-Deleted Announcement ({selectedAnnouncementForModal.wasPublished || selectedAnnouncementForModal.published_at ? 'Previously Published' : 'Never Published Draft'})
                  </div>
                  <div className="text-rose-900 dark:text-rose-100 text-[11px]">
                    Deleted by <strong>{selectedAnnouncementForModal.deleted_by_name || 'HR Lead'}</strong>
                    {selectedAnnouncementForModal.deleted_at ? ` on ${formatAnnouncementDateTime(selectedAnnouncementForModal.deleted_at)}` : ''}
                  </div>
                  <div className="text-rose-700 dark:text-rose-300 text-[11px] italic">
                    Reason: {selectedAnnouncementForModal.deletion_reason || 'No reason recorded'}
                  </div>
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed py-2">
                {selectedAnnouncementForModal.description}
              </div>

              {Array.isArray(selectedAnnouncementForModal.auditLogs) && selectedAnnouncementForModal.auditLogs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Audit History ({selectedAnnouncementForModal.auditLogs.length})
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {selectedAnnouncementForModal.auditLogs.map((log) => (
                      <div key={log.id} className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/70 dark:border-navy-800 text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{log.action}</span>
                          <span className="font-mono text-[10px] text-slate-400">{formatAnnouncementDateTime(log.created_at)}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          {log.actor_name || 'System'} ({log.actor_role || 'System'}) {log.details ? `— ${log.details}` : ''}
                        </div>
                        {log.reason && <div className="text-rose-600 dark:text-rose-300 italic">Reason: {log.reason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end gap-2">
                {(selectedAnnouncementForModal.isDeleted || selectedAnnouncementForModal.status === 'Deleted') && (
                  <button
                    type="button"
                    onClick={() => {
                      const ann = selectedAnnouncementForModal;
                      setSelectedAnnouncementForModal(null);
                      handleRestoreAnnouncement(ann.id, ann.title);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Restore Announcement
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncementForModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close Notice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SOFT-DELETE CONFIRMATION WITH OPTIONAL REASON */}
        {deleteConfirmAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 border border-rose-200 dark:border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200 uppercase">
                    Confirm Soft Delete
                  </span>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    Delete “{deleteConfirmAnnouncement.title}”?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmAnnouncement(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This announcement will be removed from the active dashboard, but its record and audit trail will be preserved in the Shared Announcement Calendar.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deletion Reason <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Superseded by updated circular, published in error..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  disabled={deletingAnnouncement}
                  onClick={() => setDeleteConfirmAnnouncement(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAnnouncement}
                  onClick={() => handleDeleteAnnouncement(deleteConfirmAnnouncement.id, deleteConfirmAnnouncement.title, deleteReason)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-60"
                >
                  {deletingAnnouncement ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 9: SHIFTS & ROSTERS (Complete Unified Shift Management Module)
        ======================================================== */}
        {activeTab === 'shifts' && (() => {
          // Dynamic unique departments from workforce
          const allDepartments = Array.from(
            new Set(displayEmployees.map(e => e.department).filter(Boolean))
          ).sort();

          // Search and Filters
          const filteredEmployees = displayEmployees.filter(emp => {
            const q = shiftSearchQuery.trim().toLowerCase();
            if (q) {
              const matchesName = emp.name?.toLowerCase().includes(q);
              const matchesId = (emp.employeeId || emp.id)?.toLowerCase().includes(q);
              const matchesRole = emp.role?.toLowerCase().includes(q);
              const matchesDept = emp.department?.toLowerCase().includes(q);
              if (!matchesName && !matchesId && !matchesRole && !matchesDept) return false;
            }

            if (shiftFilterShift !== 'all') {
              const norm = normalizeShiftId(emp.assignedShiftId);
              if (norm !== shiftFilterShift && emp.assignedShiftId !== shiftFilterShift) {
                if (!emp.assignedShift?.toLowerCase().includes(shiftFilterShift.toLowerCase())) {
                  return false;
                }
              }
            }

            if (shiftFilterStatus !== 'all') {
              if (shiftFilterStatus === 'On Time' && emp.loginStatus !== 'On Time') return false;
              if (shiftFilterStatus === 'Late' && !emp.loginStatus?.startsWith('Late') && !emp.isLate) return false;
              if (shiftFilterStatus === 'Pending Clock-In' && !emp.loginStatus?.includes('Pending')) return false;
              if (shiftFilterStatus === 'On Leave' && emp.loginStatus !== 'On Leave') return false;
            }

            if (shiftFilterDept !== 'all' && emp.department !== shiftFilterDept) {
              return false;
            }

            return true;
          });

          // Counts for summary pills
          const onTimeCount = displayEmployees.filter(e => e.loginStatus === 'On Time').length;
          const lateCount = displayEmployees.filter(e => e.isLate || e.loginStatus?.startsWith('Late')).length;
          const pendingCount = displayEmployees.filter(e => e.loginStatus?.includes('Pending') || e.actualClockInTime === '—').length;
          const leaveCount = displayEmployees.filter(e => e.loginStatus === 'On Leave').length;
          const pendingLateApprovalsCount = lateApprovalsList.filter(r => r.status === 'Pending Approval').length;

          // Helper to toggle bulk employee checkbox
          const toggleBulkSelect = (empId) => {
            setBulkSelectedEmpIds(prev =>
              prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
            );
          };

          const toggleSelectAll = () => {
            if (bulkSelectedEmpIds.length === filteredEmployees.length) {
              setBulkSelectedEmpIds([]);
            } else {
              setBulkSelectedEmpIds(filteredEmployees.map(e => e.employeeId || e.id));
            }
          };

          // Weekly days generation (Monday - Sunday) around shiftSelectedDate
          const getWeekDays = (selectedDateStr) => {
            const date = new Date(`${selectedDateStr}T00:00:00Z`);
            const dayOfWeek = date.getUTCDay(); // 0 is Sunday, 1 is Monday
            const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(date);
            monday.setUTCDate(date.getUTCDate() + distanceToMonday);

            const days = [];
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            for (let i = 0; i < 7; i++) {
              const current = new Date(monday);
              current.setUTCDate(monday.getUTCDate() + i);
              const iso = current.toISOString().slice(0, 10);
              days.push({
                iso,
                dayName: dayNames[i],
                dayNumber: current.getUTCDate(),
                isCurrentSelected: iso === selectedDateStr
              });
            }
            return days;
          };
          const weekDays = getWeekDays(shiftSelectedDate);

          // Pure date-effective shift resolver for an employee on any given ISO date (Monday–Sunday)
          const resolveShiftForEmpAndDate = (emp, dateIso) => {
            let dayOfWeek = 0;
            try {
              const [y, m, d] = dateIso.split('-').map(Number);
              dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
            } catch (_) {
              dayOfWeek = new Date(`${dateIso}T00:00:00`).getDay();
            }
            const empId = emp.employeeId || emp.id;

            const empAssignments = shiftAssignmentsList.filter(a =>
              (a.employeeId === empId) && a.status === 'Active'
            );

            // 1. One day specific override (priority 1)
            const oneDay = empAssignments.find(a =>
              a.frequency === 'one_day' && a.startDate === dateIso
            );
            if (oneDay) {
              const sc = SHIFT_CONFIGS.find(s => s.id === oneDay.shiftId) || {
                id: oneDay.shiftId,
                shiftName: oneDay.shiftName,
                timing: `${oneDay.scheduledLoginTime || ''} – ${oneDay.scheduledLogoutTime || ''}`,
                scheduledLoginTime: oneDay.scheduledLoginTime,
                scheduledLogoutTime: oneDay.scheduledLogoutTime
              };
              return { ...sc, frequency: 'one_day', isOverride: true, assignmentId: oneDay.id };
            }

            // 2. Weekly recurring assignment (priority 2) then Monthly recurring assignment (priority 3)
            const matchRecurring = (freqTarget) => {
              for (const a of empAssignments) {
                if (a.frequency === freqTarget) {
                  const inRange = a.startDate <= dateIso && (!a.endDate || a.endDate >= dateIso);
                  if (inRange) {
                    let days = [1, 2, 3, 4, 5, 6];
                    try {
                      if (a.applicableDays) {
                        days = typeof a.applicableDays === 'string' ? JSON.parse(a.applicableDays) : a.applicableDays;
                      }
                    } catch (e) { }

                    if (Array.isArray(days) && days.includes(dayOfWeek)) {
                      const sc = SHIFT_CONFIGS.find(s => s.id === a.shiftId) || {
                        id: a.shiftId,
                        shiftName: a.shiftName,
                        timing: `${a.scheduledLoginTime || ''} – ${a.scheduledLogoutTime || ''}`,
                        scheduledLoginTime: a.scheduledLoginTime,
                        scheduledLogoutTime: a.scheduledLogoutTime
                      };
                      return { ...sc, frequency: a.frequency, isOverride: true, assignmentId: a.id };
                    }
                  }
                }
              }
              return null;
            };

            const weeklyMatch = matchRecurring('weekly');
            if (weeklyMatch) return weeklyMatch;

            const monthlyMatch = matchRecurring('monthly');
            if (monthlyMatch) return monthlyMatch;

            // 3. Sunday weekly off (unless overridden)
            if (dayOfWeek === 0) {
              return {
                id: 'OFF',
                shiftName: 'Weekly Off',
                timing: 'Rest Day',
                scheduledLoginTime: '—',
                scheduledLogoutTime: '—',
                isOff: true
              };
            }

            // 4. Default baseline shift (never use date-specific emp.assignedShiftId)
            const baseShiftId = normalizeShiftId(emp.baseShiftId || (!emp.assignedShiftId ? emp.shiftId : null) || 'SHIFT-GENERAL');
            const baseShift = SHIFT_CONFIGS.find(s => s.id === baseShiftId) || SHIFT_CONFIGS[0];
            return { ...baseShift, isDefault: true };
          };

          const effectiveShiftViewMode = readOnlyMode ? 'monthly' : shiftViewMode;

          const shiftMonthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const shiftCurrentMonthLabel = `${shiftMonthNames[monthlyViewMonth]} ${monthlyViewYear}`;

          const handleShiftPrevMonth = () => {
            if (monthlyViewMonth === 0) {
              setMonthlyViewMonth(11);
              setMonthlyViewYear(prev => prev - 1);
            } else {
              setMonthlyViewMonth(prev => prev - 1);
            }
          };

          const handleShiftNextMonth = () => {
            if (monthlyViewMonth === 11) {
              setMonthlyViewMonth(0);
              setMonthlyViewYear(prev => prev + 1);
            } else {
              setMonthlyViewMonth(prev => prev + 1);
            }
          };

          const handleShiftCurrentMonth = () => {
            const now = new Date();
            setMonthlyViewYear(now.getFullYear());
            setMonthlyViewMonth(now.getMonth());
            setMonthlyActiveDateStr(now.toISOString().slice(0, 10));
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className={`bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs ${readOnlyMode ? 'p-4 sm:p-5 space-y-4' : 'p-5 sm:p-6 space-y-6'}`}>

                {/* Dynamic Shift Assignment Success Banner */}
                {shiftAssignmentSuccessBanner && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{shiftAssignmentSuccessBanner}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShiftAssignmentSuccessBanner('')}
                      className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 p-1 cursor-pointer"
                      title="Dismiss confirmation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 1. Header with Title & Date / View Controls */}
                <div className={`flex ${readOnlyMode ? 'flex-wrap items-center justify-between gap-3 pb-3' : 'flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5'} border-b border-slate-200 dark:border-navy-800`}>
                  <div className="flex items-center gap-3">
                    <div className={`${readOnlyMode ? 'w-9 h-9 rounded-xl' : 'w-10 h-10 rounded-2xl'} bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-gold-400 shrink-0 shadow-2xs`}>
                      <Calendar className={`${readOnlyMode ? 'w-4 h-4' : 'w-5 h-5'} text-amber-500`} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{readOnlyMode ? 'My Shift' : 'Shift Management'}</span>
                      </h3>
                      {!readOnlyMode && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Unified workforce schedules, recurring assignments &amp; roster management
                        </p>
                      )}
                    </div>
                  </div>

                  {readOnlyMode ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleShiftPrevMonth}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition cursor-pointer shadow-2xs"
                        title="Previous Month"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 select-none shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{shiftCurrentMonthLabel}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleShiftNextMonth}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition cursor-pointer shadow-2xs"
                        title="Next Month"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleShiftCurrentMonth}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Today</span>
                      </button>
                      <button
                        type="button"
                        onClick={loadShiftRosterData}
                        disabled={shiftRosterLoading}
                        className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer shadow-2xs"
                        title="Refresh Shift Data"
                        aria-label="Refresh Shift Data"
                      >
                        <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${shiftRosterLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                      {/* Date Picker Filter (Only for HR Lead / Admin workforce inspection) */}
                      <div className="h-10 flex items-center gap-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-3 rounded-xl text-xs whitespace-nowrap shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Date:</span>
                        <input
                          type="date"
                          value={shiftSelectedDate}
                          onChange={(e) => setShiftSelectedDate(e.target.value)}
                          className="bg-transparent text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                          title="Select date to inspect shift roster"
                        />
                        <button
                          type="button"
                          onClick={() => setShiftSelectedDate(new Date().toISOString().slice(0, 10))}
                          className="ml-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Today
                        </button>
                      </div>

                      {/* View Switcher: Full selector for Leadership */}
                      <div className="h-10 flex items-center bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800 text-xs shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setShiftViewMode('table')}
                          className={`h-8 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${effectiveShiftViewMode === 'table'
                            ? 'bg-amber-500 text-navy-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Daily Roster</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShiftViewMode('weekly')}
                          className={`h-8 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${effectiveShiftViewMode === 'weekly'
                            ? 'bg-amber-500 text-navy-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Weekly</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShiftViewMode('monthly')}
                          className={`h-8 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${effectiveShiftViewMode === 'monthly'
                            ? 'bg-amber-500 text-navy-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Monthly</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShiftViewMode('approvals')}
                          className={`h-8 px-3 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap relative ${effectiveShiftViewMode === 'approvals'
                            ? 'bg-amber-500 text-navy-950 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Late Approvals</span>
                          {pendingLateApprovalsCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                              {pendingLateApprovalsCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Action: Assign Shift */}
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal()}
                        className="h-10 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign Shift</span>
                      </button>

                      {/* Refresh */}
                      <button
                        type="button"
                        onClick={loadShiftRosterData}
                        disabled={shiftRosterLoading}
                        className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700 transition cursor-pointer shadow-2xs"
                        title="Reload Shift Data from Server"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${shiftRosterLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Search, Filters, and Summary Counters (Leadership mode only) */}
                {!readOnlyMode && (
                  <div className="space-y-4">
                    {/* Summary Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex flex-col justify-between min-h-[76px] shadow-2xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Total Workforce</div>
                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1 truncate">{displayEmployees.length} Staff</div>
                      </div>
                      <div className="px-3.5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between min-h-[76px] shadow-2xs">
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider truncate">On Time</div>
                        <div className="font-mono font-bold text-base text-emerald-800 dark:text-emerald-300 mt-1">{onTimeCount}</div>
                      </div>
                      <div className="px-3.5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between min-h-[76px] shadow-2xs">
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider truncate">Late Login</div>
                        <div className="font-mono font-bold text-base text-amber-800 dark:text-amber-300 mt-1">{lateCount}</div>
                      </div>
                      <div className="px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex flex-col justify-between min-h-[76px] shadow-2xs">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">Pending Clock-In</div>
                        <div className="font-mono font-bold text-base text-slate-700 dark:text-slate-300 mt-1">{pendingCount}</div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 lg:col-span-1 px-3.5 py-3 rounded-2xl bg-purple-50 dark:purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col justify-between min-h-[76px] shadow-2xs">
                        <div className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider truncate">On Leave</div>
                        <div className="font-mono font-bold text-base text-purple-800 dark:text-purple-300 mt-1">{leaveCount}</div>
                      </div>
                    </div>

                    {/* Search and Filters Strip */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search workforce by name, employee ID, role, or department..."
                          value={shiftSearchQuery}
                          onChange={(e) => setShiftSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Filter Dropdowns */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Shift Filter */}
                        <select
                          value={shiftFilterShift}
                          onChange={(e) => setShiftFilterShift(e.target.value)}
                          className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                          title="Filter by Assigned Shift"
                        >
                          <option value="all">All Shifts</option>
                          <option value="SHIFT-GENERAL">General Shift (9 AM – 6 PM)</option>
                          <option value="SHIFT-MORNING">Morning Shift (7 AM – 2 PM)</option>
                          <option value="SHIFT-EVENING">Evening Shift (2 PM – 9 PM)</option>
                        </select>

                        {/* Status Filter */}
                        <select
                          value={shiftFilterStatus}
                          onChange={(e) => setShiftFilterStatus(e.target.value)}
                          className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                          title="Filter by Login Status"
                        >
                          <option value="all">All Login Statuses</option>
                          <option value="On Time">On Time</option>
                          <option value="Late">Late Clock-In</option>
                          <option value="Pending Clock-In">Pending Clock-In</option>
                          <option value="On Leave">On Leave</option>
                        </select>

                        {/* Department Filter */}
                        <select
                          value={shiftFilterDept}
                          onChange={(e) => setShiftFilterDept(e.target.value)}
                          className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                          title="Filter by Department"
                        >
                          <option value="all">All Departments ({allDepartments.length})</option>
                          {allDepartments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Bulk Action Bar */}
                {!readOnlyMode && bulkSelectedEmpIds.length > 0 && (
                  <div className="bg-amber-500/15 border-2 border-amber-500/50 p-3 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="font-bold text-xs text-amber-900 dark:text-gold-300">
                        {bulkSelectedEmpIds.length} employee(s) selected for bulk assignment
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal()}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Bulk Assign Shift</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkSelectedEmpIds([])}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. VIEW A: UNIFIED EMPLOYEE SHIFT ROSTER TABLE (Leadership mode only) */}
                {!readOnlyMode && effectiveShiftViewMode === 'table' && (
                  <div className="overflow-x-auto border border-slate-200/80 dark:border-navy-800 rounded-2xl shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <tr>
                          {!readOnlyMode && (
                            <th className="py-3 px-3 w-10 text-center align-middle whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={filteredEmployees.length > 0 && bulkSelectedEmpIds.length === filteredEmployees.length}
                                onChange={toggleSelectAll}
                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                title="Select all employees"
                              />
                            </th>
                          )}
                          <th className="py-3 px-4 text-left align-middle whitespace-nowrap min-w-[200px]">Employee Name</th>
                          <th className="py-3 px-3 text-left align-middle whitespace-nowrap min-w-[110px]">Employee ID</th>
                          <th className="py-3 px-4 text-left align-middle whitespace-nowrap min-w-[160px]">Role & Department</th>
                          <th className="py-3 px-4 text-left align-middle whitespace-nowrap min-w-[170px]">Assigned Shift</th>
                          <th className="py-3 px-3 text-center align-middle whitespace-nowrap min-w-[120px]">Scheduled Login</th>
                          <th className="py-3 px-3 text-center align-middle whitespace-nowrap min-w-[120px]">Actual Clock-In</th>
                          <th className="py-3 px-4 text-center align-middle whitespace-nowrap min-w-[150px]">Login Status</th>
                          <th className="py-3 px-4 text-center align-middle whitespace-nowrap min-w-[140px]">Shift Period</th>
                          <th className="py-3 px-4 text-right align-middle whitespace-nowrap min-w-[120px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-navy-800 bg-white dark:bg-navy-900">
                        {filteredEmployees.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="py-16 text-center text-slate-400 space-y-2">
                              <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-navy-700" />
                              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                No employees found matching the filter criteria.
                              </p>
                              <p className="text-xs text-slate-400">
                                Adjust your search keyword, shift filter, or department selection.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const isChecked = bulkSelectedEmpIds.includes(emp.employeeId || emp.id);
                            const isLate = emp.isLate || (emp.loginStatus && emp.loginStatus.startsWith('Late'));
                            const isOnLeave = emp.loginStatus === 'On Leave';
                            const isPending = emp.loginStatus?.includes('Pending') || emp.actualClockInTime === '—';

                            return (
                              <tr
                                key={emp.employeeId || emp.id}
                                className={`hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition ${isChecked ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                                  }`}
                              >
                                {/* Checkbox */}
                                {!readOnlyMode && (
                                  <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleBulkSelect(emp.employeeId || emp.id)}
                                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    />
                                  </td>
                                )}

                                {/* 1. Employee Name */}
                                <td className="py-3.5 px-4 text-left align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-navy-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                      {emp.avatarLetter || emp.name?.charAt(0) || 'E'}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                                        {emp.name}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                        {emp.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* 2. Employee ID */}
                                <td className="py-3.5 px-3 text-left align-middle whitespace-nowrap">
                                  <span className="font-mono font-bold text-amber-700 dark:text-gold-400 text-xs">
                                    {emp.employeeId || emp.id}
                                  </span>
                                </td>

                                {/* 3. Role & Department */}
                                <td className="py-3.5 px-4 text-left align-middle whitespace-nowrap">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    {emp.role}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {emp.department}
                                  </div>
                                </td>

                                {/* 4. Assigned Shift */}
                                <td className="py-3.5 px-4 text-left align-middle whitespace-nowrap">
                                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>{emp.shiftName || 'General Shift'}</span>
                                  </div>
                                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                    {emp.assignedShift?.includes('(') ? emp.assignedShift.split('(')[1]?.replace(')', '') : '09:00 AM – 06:00 PM'}
                                  </div>
                                </td>

                                {/* 5. Scheduled Login Time */}
                                <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                    {emp.scheduledLoginTime || '9:00 AM'}
                                  </span>
                                </td>

                                {/* 6. Actual Clock-in Time */}
                                <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                                  {isPending ? (
                                    <span className="text-slate-400 font-mono text-xs">—</span>
                                  ) : isOnLeave ? (
                                    <span className="text-purple-600 font-mono text-xs font-bold">On Leave</span>
                                  ) : (
                                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                      {emp.actualClockInTime}
                                    </span>
                                  )}
                                </td>

                                {/* 7. Login Status */}
                                <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                                  <div className="flex items-center justify-center">
                                    {isOnLeave ? (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200">
                                        🏖️ On Leave
                                      </span>
                                    ) : isPending ? (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200">
                                        ⏱️ Pending Clock-In
                                      </span>
                                    ) : isLate ? (
                                      <div className="space-y-1 flex flex-col items-center">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 flex items-center gap-1 w-fit">
                                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                          <span>Late ({emp.lateMinutes || 8}m)</span>
                                        </span>
                                        {emp.lateApprovalStatus && emp.lateApprovalStatus !== 'None' && (
                                          <div className="text-[10px] font-semibold text-slate-400">
                                            Approval: <span className="font-bold text-amber-600 dark:text-amber-400">{emp.lateApprovalStatus}</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1 w-fit">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        <span>On Time</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* 8. Shift Assignment Period */}
                                <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                    {emp.shiftAssignmentPeriod || 'Ongoing Default'}
                                  </span>
                                </td>

                                {/* 9. Actions */}
                                <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {!readOnlyMode && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAssignModal(emp)}
                                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-[11px] transition cursor-pointer shadow-2xs"
                                        title="Assign or Change Shift"
                                      >
                                        Assign Shift
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setHistoryModalEmployee(emp)}
                                      className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shadow-2xs"
                                      title="View Shift Assignment History"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>

                                    {!readOnlyMode && isLate && emp.lateApprovalStatus === 'Pending Approval' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const req = lateApprovalsList.find(r => r.employeeId === emp.employeeId || r.attendanceId === emp.attendanceId) || {
                                            id: emp.attendanceId,
                                            employeeId: emp.employeeId,
                                            employeeName: emp.name,
                                            delayMinutes: emp.lateMinutes,
                                            attendanceDate: shiftSelectedDate,
                                            shiftName: emp.shiftName,
                                            scheduledLoginTime: emp.scheduledLoginTime,
                                            actualClockInTime: emp.actualClockInTime,
                                            explanation: emp.explanation
                                          };
                                          setLateDecisionModal({ open: true, request: req, decision: 'Approved', notes: '' });
                                        }}
                                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer shadow-2xs"
                                        title="Review Late Login Request"
                                      >
                                        Review Late
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. VIEW B: WEEKLY SCHEDULE VIEW (Leadership mode only) */}
                {!readOnlyMode && effectiveShiftViewMode === 'weekly' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-600 dark:text-slate-300">
                        Weekly Roster Breakdown (Monday – Sunday)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Click any date to switch to that day's roster view
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 dark:bg-navy-950 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                          <tr>
                            <th className="py-3 px-4 min-w-[200px] text-left align-middle whitespace-nowrap">Employee</th>
                            {weekDays.map(d => (
                              <th
                                key={d.iso}
                                onClick={() => setShiftSelectedDate(d.iso)}
                                className={`py-2.5 px-3 text-center align-middle whitespace-nowrap cursor-pointer transition ${d.isCurrentSelected
                                  ? 'bg-amber-500/20 text-amber-900 dark:text-gold-300 font-extrabold border-b-2 border-amber-500'
                                  : 'hover:bg-slate-200 dark:hover:bg-navy-800'
                                  }`}
                              >
                                <div>{d.dayName}</div>
                                <div className="text-[10px] font-mono text-slate-400">{d.dayNumber}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-navy-800 bg-white dark:bg-navy-900">
                          {displayEmployees.map(emp => (
                            <tr key={emp.employeeId || emp.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40">
                              <td className="py-3 px-4 text-left align-middle whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-gold-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {emp.avatarLetter || emp.name?.charAt(0) || 'E'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white leading-tight text-xs">{emp.name}</div>
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{emp.role}</div>
                                  </div>
                                </div>
                              </td>
                              {weekDays.map(d => {
                                const shift = resolveShiftForEmpAndDate(emp, d.iso);
                                const cleanName = (shift?.shiftName || 'General').replace(/\s*\([^)]*\)\s*$/, '');
                                const isOff = shift?.isOff || shift?.id === 'OFF';
                                const isMorning = shift?.id === 'SHIFT-MORNING' || cleanName.toLowerCase().includes('morning');
                                const isEvening = shift?.id === 'SHIFT-EVENING' || cleanName.toLowerCase().includes('evening');
                                const isNight = shift?.id === 'SHIFT-NIGHT' || cleanName.toLowerCase().includes('night');

                                let badgeClass = 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
                                if (isOff) {
                                  badgeClass = 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-navy-950 dark:text-slate-400 dark:border-navy-800';
                                } else if (isMorning) {
                                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
                                } else if (isEvening) {
                                  badgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60';
                                } else if (isNight) {
                                  badgeClass = 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
                                }

                                return (
                                  <td key={d.iso} className={`py-3 px-2 text-center align-middle whitespace-nowrap ${d.isCurrentSelected ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}`}>
                                    <div className="flex items-center justify-center">
                                      <span
                                        title={`${emp.name}: ${cleanName} (${shift?.timing || ''})`}
                                        className={`inline-flex items-center justify-center min-w-[84px] px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-2xs ${badgeClass}`}
                                      >
                                        {cleanName}
                                        {shift?.isOverride && (
                                          <span className="ml-1 text-[8px] opacity-75 font-mono" title={`Assigned (${shift.frequency})`}>•</span>
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. VIEW C: MONTHLY SHIFT CALENDAR */}
                {effectiveShiftViewMode === 'monthly' && (() => {
                  const currentMonthLabel = shiftCurrentMonthLabel;
                  const todayStr = getKolkataTodayIso();

                  const handlePrevMonth = handleShiftPrevMonth;
                  const handleNextMonth = handleShiftNextMonth;
                  const handleCurrentMonth = handleShiftCurrentMonth;

                  // Build 35 or 42 calendar cells
                  const firstDayOfMonth = new Date(monthlyViewYear, monthlyViewMonth, 1);
                  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0, Sun = 6
                  const daysInMonth = new Date(monthlyViewYear, monthlyViewMonth + 1, 0).getDate();
                  const daysInPrevMonth = new Date(monthlyViewYear, monthlyViewMonth, 0).getDate();

                  const calendarDays = [];
                  // Leading days from previous month
                  for (let i = startDayOfWeek - 1; i >= 0; i--) {
                    const dayNum = daysInPrevMonth - i;
                    const prevM = monthlyViewMonth === 0 ? 11 : monthlyViewMonth - 1;
                    const prevY = monthlyViewMonth === 0 ? monthlyViewYear - 1 : monthlyViewYear;
                    const iso = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    calendarDays.push({ dayNumber: dayNum, iso, isCurrentMonth: false });
                  }
                  // Days in current month
                  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                    const iso = `${monthlyViewYear}-${String(monthlyViewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    calendarDays.push({ dayNumber: dayNum, iso, isCurrentMonth: true });
                  }
                  // Trailing days from next month
                  const targetTotalCells = calendarDays.length <= 35 ? 35 : 42;
                  const remaining = targetTotalCells - calendarDays.length;
                  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
                    const nextM = monthlyViewMonth === 11 ? 0 : monthlyViewMonth + 1;
                    const nextY = monthlyViewMonth === 11 ? monthlyViewYear + 1 : monthlyViewYear;
                    const iso = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    calendarDays.push({ dayNumber: dayNum, iso, isCurrentMonth: false });
                  }

                  const selectedEmp = readOnlyMode
                    ? (displayEmployees[0] || null)
                    : (monthlySelectedEmpId !== 'all'
                      ? displayEmployees.find(e => (e.employeeId || e.id) === monthlySelectedEmpId)
                      : (displayEmployees.length === 1 ? displayEmployees[0] : null));

                  // Daily breakdown for monthlyActiveDateStr
                  const activeDateDayRoster = displayEmployees.map(emp => {
                    const shift = resolveShiftForEmpAndDate(emp, monthlyActiveDateStr);
                    return { emp, shift };
                  });

                  return (
                    <div className="space-y-4">
                      {/* Month Navigation & Employee Filter (HR Lead only; HR Operations controls are in top header) */}
                      {!readOnlyMode && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xs space-y-3">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-gold-300">
                                  Monthly Roster View
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  {calendarDays.filter(d => d.isCurrentMonth).length} Days in Cycle
                                </span>
                              </div>
                              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-1">
                                Monthly Shift Calendar & Schedule
                              </h3>
                            </div>

                            {/* Month Navigator Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-slate-50 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={handlePrevMonth}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition cursor-pointer"
                                  title="Previous Month"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="px-3 font-serif font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap min-w-[130px] text-center flex items-center justify-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                  <span>{currentMonthLabel}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleNextMonth}
                                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition cursor-pointer"
                                  title="Next Month"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={handleCurrentMonth}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                              >
                                Today
                              </button>
                              <button
                                type="button"
                                onClick={loadShiftRosterData}
                                disabled={shiftRosterLoading}
                                className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                                title="Refresh Shift Data"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${shiftRosterLoading ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Shift Color Legend & Employee Filter (Filter for leadership only) */}
                          <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-amber-500" />
                                <span>Filter Employee:</span>
                              </label>
                              <select
                                value={monthlySelectedEmpId}
                                onChange={(e) => setMonthlySelectedEmpId(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer transition"
                              >
                                <option value="all">👥 All Employees ({displayEmployees.length} Staff Overview)</option>
                                {displayEmployees.map(e => (
                                  <option key={e.employeeId || e.id} value={e.employeeId || e.id}>
                                    👤 {e.name} — {e.role} ({e.department})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Shift Color Legend */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                              <span className="text-slate-400">Legend:</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-gold-300 border border-amber-200 dark:border-amber-800">
                                ☀️ General Shift (9am–6pm)
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                🌅 Morning (7am–2pm)
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                🌙 Evening (2pm–9pm)
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-800">
                                ☕ Weekly Off
                              </span>
                            </div>
                          </div>

                          {/* Selected Individual Employee Banner (Leadership mode only) */}
                          {selectedEmp && (
                            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs shadow-2xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 dark:text-gold-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {selectedEmp.name?.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white truncate">
                                    {selectedEmp.name}
                                    <span className="text-slate-400 font-normal font-mono ml-2">
                                      ({selectedEmp.employeeId || selectedEmp.id} • {selectedEmp.role})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-amber-800 dark:text-gold-400 font-medium mt-0.5">
                                    Viewing individual monthly shift calendar. Click any date to assign or update shifts.
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(selectedEmp)}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                                >
                                  Assign Shift
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMonthlySelectedEmpId('all')}
                                  className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-white text-xs font-semibold cursor-pointer"
                                >
                                  View All
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 7-Column Monthly Calendar Grid */}
                      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-xs overflow-hidden">
                        {/* Day of Week Headers: Uniform styling for all seven days, including Saturday */}
                        <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-navy-800 bg-slate-100/90 dark:bg-navy-950 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center select-none">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                            <div key={dayName} className="py-3 px-2 border-r last:border-r-0 border-slate-200/70 dark:border-navy-800">
                              {dayName}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Day Cells */}
                        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-navy-800">
                          {calendarDays.map((day, idx) => {
                            const isToday = day.iso === todayStr;
                            const isSelectedDate = day.iso === monthlyActiveDateStr;

                            // Calculate shifts for this day
                            let dayContent = null;
                            if (selectedEmp) {
                              const s = resolveShiftForEmpAndDate(selectedEmp, day.iso);
                              dayContent = (
                                <div className="mt-1.5 space-y-1">
                                  {s.isOff ? (
                                    <div className="py-2 px-1.5 rounded-lg bg-slate-100/90 dark:bg-navy-950/90 text-slate-600 dark:text-slate-400 text-[10px] font-semibold text-center border border-slate-200/80 dark:border-navy-800">
                                      Weekly Off
                                    </div>
                                  ) : s.id === 'SHIFT-MORNING' ? (
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/80 text-[10px] leading-tight">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-[11px] truncate">Morning Shift</span>
                                        {s.isOverride ? (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200/90 text-emerald-950 dark:bg-emerald-800 dark:text-emerald-100 uppercase tracking-wider shrink-0">Active</span>
                                        ) : (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 shrink-0">Active</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300/90 mt-1">
                                        {s.scheduledLoginTime} – {s.scheduledLogoutTime}
                                      </div>
                                    </div>
                                  ) : s.id === 'SHIFT-EVENING' ? (
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 border border-indigo-200/90 dark:border-indigo-800/80 text-[10px] leading-tight">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-[11px] truncate">Evening Shift</span>
                                        {s.isOverride ? (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-200/90 text-indigo-950 dark:bg-indigo-800 dark:text-indigo-100 uppercase tracking-wider shrink-0">Active</span>
                                        ) : (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 shrink-0">Active</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] font-medium text-indigo-800 dark:text-indigo-300/90 mt-1">
                                        {s.scheduledLoginTime} – {s.scheduledLogoutTime}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800/80 text-[10px] leading-tight">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-[11px] truncate">General Shift</span>
                                        {s.isOverride ? (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950 dark:bg-amber-800 dark:text-amber-100 uppercase tracking-wider shrink-0">Active</span>
                                        ) : (
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 shrink-0">Active</span>
                                        )}
                                      </div>
                                      <div className="text-[10px] font-medium text-amber-900/90 dark:text-amber-300/90 mt-1">
                                        {s.scheduledLoginTime} – {s.scheduledLogoutTime}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              // All employees summary for day (Leadership multi-employee view)
                              let countGen = 0, countMorn = 0, countEve = 0, countOff = 0;
                              displayEmployees.forEach(e => {
                                const s = resolveShiftForEmpAndDate(e, day.iso);
                                if (s.isOff) countOff++;
                                else if (s.id === 'SHIFT-MORNING') countMorn++;
                                else if (s.id === 'SHIFT-EVENING') countEve++;
                                else countGen++;
                              });

                              dayContent = (
                                <div className="mt-1 space-y-1">
                                  {countOff === displayEmployees.length ? (
                                    <div className="p-1 rounded-md bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 text-[9px] font-semibold text-center">
                                      Weekly Off
                                    </div>
                                  ) : (
                                    <div className="space-y-0.5 text-[9px] font-semibold">
                                      {countGen > 0 && (
                                        <div className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-gold-300 truncate">
                                          ☀️ Gen: {countGen}
                                        </div>
                                      )}
                                      {countMorn > 0 && (
                                        <div className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 truncate">
                                          🌅 Morn: {countMorn}
                                        </div>
                                      )}
                                      {countEve > 0 && (
                                        <div className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 truncate">
                                          🌙 Eve: {countEve}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={day.iso + idx}
                                onClick={() => {
                                  setMonthlyActiveDateStr(day.iso);
                                  setShiftSelectedDate(day.iso);
                                }}
                                className={`min-h-[105px] p-2.5 transition cursor-pointer flex flex-col justify-between ${!day.isCurrentMonth
                                  ? 'bg-slate-50/50 dark:bg-navy-950/40 opacity-45'
                                  : 'bg-white dark:bg-navy-900 hover:bg-slate-50/80 dark:hover:bg-navy-800/50'
                                  } ${isToday
                                    ? 'ring-1 ring-inset ring-amber-400 bg-amber-50/25 dark:bg-amber-950/20'
                                    : isSelectedDate
                                    ? 'ring-1 ring-inset ring-amber-500 bg-amber-50/10'
                                    : ''
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`text-xs ${isToday
                                      ? 'w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs'
                                      : 'font-semibold text-slate-800 dark:text-slate-200 pl-0.5'
                                      }`}
                                  >
                                    {day.dayNumber}
                                  </span>
                                  {isToday && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                                      Today
                                    </span>
                                  )}
                                </div>

                                {dayContent}

                                {(() => {
                                  const dayTasks = (assignedTasksForCalendar || []).filter((t) => {
                                    const d = (t.dueDate || '').slice(0, 10);
                                    if (d !== day.iso) return false;
                                    if (selectedEmp) {
                                      const empId = selectedEmp.employeeId || selectedEmp.id;
                                      return t.assignedEmployeeId === empId;
                                    }
                                    return true;
                                  });
                                  if (dayTasks.length === 0) return <div className="h-1" />;
                                  return (
                                    <div className="mt-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 text-[9px] font-bold text-sky-800 dark:text-sky-200 truncate">
                                      {dayTasks.length} Task{dayTasks.length > 1 ? 's' : ''} Due
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* HR Operations (Read-Only): Selected Date Shift & Assigned Tasks Details */}
                      {readOnlyMode && (() => {
                        const myEmp = selectedEmp || displayEmployees[0] || null;
                        const myShift = myEmp ? resolveShiftForEmpAndDate(myEmp, monthlyActiveDateStr) : null;
                        const myDayTasks = (assignedTasksForCalendar || []).filter((t) => {
                          const d = (t.dueDate || '').slice(0, 10);
                          if (d !== monthlyActiveDateStr) return false;
                          if (myEmp) return t.assignedEmployeeId === (myEmp.employeeId || myEmp.id);
                          return true;
                        });
                        return (
                          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-2.5">
                              <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Date Schedule</div>
                                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                                  {monthlyActiveDateStr}
                                  {monthlyActiveDateStr === todayStr && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                      Today
                                    </span>
                                  )}
                                </h4>
                              </div>
                            </div>

                            {myShift ? (
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Shift</span>
                                  <strong className="text-slate-900 dark:text-white">{myShift.shiftName || myShift.name}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Working Hours</span>
                                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                    {myShift.isOff ? 'Weekly Off' : `${myShift.scheduledLoginTime} – ${myShift.scheduledLogoutTime}`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assignment Type</span>
                                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                                    {myShift.isOff ? 'Weekly Off' : (myShift.isOverride ? `Assigned (${myShift.frequency})` : 'Default Baseline')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 dark:text-slate-400">No shift assigned for this date.</div>
                            )}

                            {myDayTasks.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                                  Assigned Tasks Due ({myDayTasks.length})
                                </div>
                                {myDayTasks.map((t) => (
                                  <div key={t.id} className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 text-xs flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white">{t.serviceTitle || t.enquiryId || 'Assigned Task'}</div>
                                      <div className="text-[11px] text-slate-600 dark:text-slate-300">{t.notes || t.customerName || '—'}</div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-navy-900 border border-sky-200 dark:border-sky-700 text-sky-800 dark:text-sky-200">
                                      {t.taskStatus || 'To Do'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Leadership Only: Daily Roster Breakdown & Shift Distribution Cards */}
                      {!readOnlyMode && (
                        <>
                          {/* Daily Roster Breakdown for Clicked Date */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xs space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                              <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  Daily Workforce Allocation
                                </div>
                                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                                  <span>Shift Schedule for {monthlyActiveDateStr}</span>
                                  {monthlyActiveDateStr === todayStr && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                      Today
                                    </span>
                                  )}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {activeDateDayRoster.filter(r => !r.shift.isOff).length} Active on Shift
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal()}
                                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Assign Shift</span>
                                </button>
                              </div>
                            </div>

                            {/* Table of staff on selected date */}
                            <div className="overflow-x-auto max-h-72 border border-slate-200/80 dark:border-navy-800 rounded-xl shadow-2xs">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider sticky top-0">
                                  <tr>
                                    <th className="py-2.5 px-3 text-left align-middle whitespace-nowrap min-w-[180px]">Employee</th>
                                    <th className="py-2.5 px-3 text-left align-middle whitespace-nowrap min-w-[140px]">Role & Dept</th>
                                    <th className="py-2.5 px-3 text-left align-middle whitespace-nowrap min-w-[150px]">Assigned Shift</th>
                                    <th className="py-2.5 px-3 text-center align-middle whitespace-nowrap min-w-[140px]">Working Hours</th>
                                    <th className="py-2.5 px-3 text-center align-middle whitespace-nowrap min-w-[140px]">Assignment Type</th>
                                    <th className="py-2.5 px-3 text-right align-middle whitespace-nowrap min-w-[110px]">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-navy-800 bg-white dark:bg-navy-900">
                                  {activeDateDayRoster.map(({ emp, shift }) => {
                                    const isEmpActive = (monthlySelectedEmpId === (emp.employeeId || emp.id));
                                    return (
                                      <tr
                                        key={emp.employeeId || emp.id}
                                        className={`hover:bg-slate-50 dark:hover:bg-navy-800/40 transition ${isEmpActive ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                                          }`}
                                      >
                                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-left align-middle whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-gold-400 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                                              {emp.name?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                              <div className="leading-tight">{emp.name}</div>
                                              <div className="text-[10px] text-slate-400 font-mono font-normal">
                                                {emp.employeeId || emp.id}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-left align-middle whitespace-nowrap">
                                          <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.role}</div>
                                          <div className="text-[10px] text-slate-400">{emp.department}</div>
                                        </td>
                                        <td className="py-2.5 px-3 text-left align-middle whitespace-nowrap">
                                          {shift.isOff ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-500 border border-slate-200">
                                              Weekly Off
                                            </span>
                                          ) : shift.id === 'SHIFT-MORNING' ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                              Morning Shift
                                            </span>
                                          ) : shift.id === 'SHIFT-EVENING' ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                              Evening Shift
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-gold-300 border border-amber-200 dark:border-amber-800">
                                              General Shift
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 text-center align-middle whitespace-nowrap">
                                          {shift.timing || `${shift.scheduledLoginTime} – ${shift.scheduledLogoutTime}`}
                                        </td>
                                        <td className="py-2.5 px-3 text-center align-middle whitespace-nowrap">
                                          {shift.isOverride ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-gold-300 border border-amber-200">
                                              Active Override ({shift.frequency})
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-slate-400">Baseline Default</span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right align-middle whitespace-nowrap">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => setMonthlySelectedEmpId(emp.employeeId || emp.id)}
                                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold transition cursor-pointer shadow-2xs"
                                              title="Filter monthly calendar to this employee"
                                            >
                                              View Month
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenAssignModal(emp)}
                                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                                            >
                                              Assign
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Distribution Overview Cards */}
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3">
                            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                              Monthly Shift Distribution & Recurring Assignments
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              Recurring workforce schedules assigned across the current monthly cycle. Predefined shifts repeat according to weekly off-day policies (Sundays off, Saturdays active).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                              {SHIFT_CONFIGS.map(sc => {
                                const count = displayEmployees.filter(e => normalizeShiftId(e.assignedShiftId) === sc.id).length;
                                return (
                                  <div key={sc.id} className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-xs text-slate-900 dark:text-white">{sc.shiftName}</span>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-gold-300 font-mono">
                                        {count} Staff
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                      {sc.timing}
                                    </div>
                                    <p className="text-[10px] text-slate-400">{sc.description}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* 8. VIEW D: LATE-LOGIN APPROVALS QUEUE */}
                {!readOnlyMode && effectiveShiftViewMode === 'approvals' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                          Late-Login Approvals Queue
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Review employee clock-in delays, justifications, and record formal approval decisions with full audit tracking.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-gold-300 border border-amber-500/30">
                        {lateApprovalsList.length} Total Requests
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 dark:bg-navy-950 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-4">Assigned Shift</th>
                            <th className="py-3 px-3">Actual Clock-In</th>
                            <th className="py-3 px-3">Delay Duration</th>
                            <th className="py-3 px-4">Employee Explanation</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-4 text-right">Decision</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-navy-800 bg-white dark:bg-navy-900">
                          {lateApprovalsList.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400">
                                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                  No late-login approval requests in the queue.
                                </p>
                                <p className="text-xs text-slate-400">
                                  All workforce clock-ins are currently on time or already reviewed.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            lateApprovalsList.map(req => {
                              const isPending = req.status === 'Pending Approval';
                              const isApproved = req.status === 'Approved';

                              return (
                                <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{req.employeeName}</div>
                                    <div className="text-[10px] font-mono text-amber-700 dark:text-gold-400">{req.employeeId}</div>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                                    {req.attendanceDate}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{req.shiftName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">Scheduled: {req.scheduledLoginTime}</div>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                    {req.actualClockInTime}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 font-mono">
                                      +{req.delayMinutes} mins
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                                      {req.explanation || 'No reason provided'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isApproved
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : isPending
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                                        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                                      }`}>
                                      {req.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    {isPending ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setLateDecisionModal({ open: true, request: req, decision: 'Approved', notes: '' })}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setLateDecisionModal({ open: true, request: req, decision: 'Rejected', notes: '' })}
                                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">
                                        Reviewed by {req.approverName || 'Approver'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

              {/* ========================================================
                  MODAL 1: ASSIGN SHIFT (Single & Bulk Assignment Form)
              ======================================================== */}
              {isAssignShiftOpen && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-gold-400">
                          Shift Roster Scheduling
                        </span>
                        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-1">
                          {assignFormTarget.employeeIds.length > 1 ? `Bulk Assign Shift (${assignFormTarget.employeeIds.length} Staff)` : 'Assign Workforce Shift'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Select the working shift hours, assignment frequency, and effective date range.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAssignShiftOpen(false);
                          setIsEmpDropdownOpen(false);
                          setAssignEmpSearch('');
                        }}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveShiftAssignment} className="space-y-4 text-xs">
                      {/* In-Modal Error & Validation Banner */}
                      {assignModalError && (
                        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="flex-1">{assignModalError}</span>
                          <button
                            type="button"
                            onClick={() => setAssignModalError('')}
                            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Employee Selection by Employee Name */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Target Employee(s) <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {assignFormTarget.employeeIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setAssignFormTarget(prev => ({ ...prev, employeeIds: [] }))}
                                className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                              >
                                Clear All
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const q = assignEmpSearch.toLowerCase().trim();
                                const matches = allAssignableEmployees.filter(e =>
                                  !q ||
                                  e.name?.toLowerCase().includes(q) ||
                                  (e.employeeId || e.id || '').toLowerCase().includes(q)
                                );
                                const mIds = matches.map(e => e.employeeId || e.id);
                                setAssignFormTarget(prev => ({
                                  ...prev,
                                  employeeIds: Array.from(new Set([...prev.employeeIds, ...mIds]))
                                }));
                              }}
                              className="text-[10px] font-bold text-amber-600 dark:text-gold-400 hover:underline cursor-pointer"
                            >
                              Select All {assignEmpSearch ? 'Filtered' : `(${allAssignableEmployees.length})`}
                            </button>
                          </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={assignEmpSearch}
                            onChange={(e) => {
                              setAssignEmpSearch(e.target.value);
                              if (!isEmpDropdownOpen) setIsEmpDropdownOpen(true);
                            }}
                            onFocus={() => setIsEmpDropdownOpen(true)}
                            placeholder="Type employee name to search and select..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition"
                          />
                          {assignEmpSearch ? (
                            <button
                              type="button"
                              onClick={() => setAssignEmpSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsEmpDropdownOpen(prev => !prev)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEmpDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Dropdown list of employees */}
                        {isEmpDropdownOpen && (() => {
                          const q = assignEmpSearch.toLowerCase().trim();
                          const matches = allAssignableEmployees.filter(e =>
                            !q ||
                            e.name?.toLowerCase().includes(q) ||
                            (e.employeeId || e.id || '').toLowerCase().includes(q) ||
                            e.role?.toLowerCase().includes(q) ||
                            e.department?.toLowerCase().includes(q)
                          );

                          return (
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 shadow-md divide-y divide-slate-100 dark:divide-navy-800">
                              {matches.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No employee found matching "{assignEmpSearch}"
                                </div>
                              ) : (
                                matches.map(emp => {
                                  const eId = emp.employeeId || emp.id;
                                  const isSelected = assignFormTarget.employeeIds.includes(eId);
                                  return (
                                    <div
                                      key={eId}
                                      onClick={() => {
                                        setAssignFormTarget(prev => ({
                                          ...prev,
                                          employeeIds: isSelected
                                            ? prev.employeeIds.filter(id => id !== eId)
                                            : [...prev.employeeIds, eId]
                                        }));
                                      }}
                                      className={`p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${isSelected
                                        ? 'bg-amber-500/15 dark:bg-amber-500/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-navy-900'
                                        }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${isSelected
                                          ? 'bg-amber-500 border-amber-500 text-navy-950'
                                          : 'border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900'
                                          }`}>
                                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-800 dark:text-gold-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {emp.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 truncate">
                                          <div className="font-bold text-slate-900 dark:text-white truncate">
                                            {emp.name}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-mono truncate">
                                            {eId} • {emp.department} • {emp.role}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                                        {emp.shiftName || 'General'}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })()}

                        {/* Selected Staff Badge List */}
                        <div className="p-2.5 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 max-h-36 overflow-y-auto space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                            <span>Selected Staff ({assignFormTarget.employeeIds.length}):</span>
                            {assignFormTarget.employeeIds.length > 0 && !isEmpDropdownOpen && (
                              <button
                                type="button"
                                onClick={() => setIsEmpDropdownOpen(true)}
                                className="text-amber-600 dark:text-gold-400 hover:underline normal-case text-[10px] font-semibold cursor-pointer"
                              >
                                + Add more
                              </button>
                            )}
                          </div>
                          {assignFormTarget.employeeIds.length === 0 ? (
                            <div className="py-2 text-center text-[11px] text-slate-400">
                              No employees selected yet. Search by name above to add employees to this shift.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {assignFormTarget.employeeIds.map(eId => {
                                const emp = allAssignableEmployees.find(e => (e.employeeId || e.id) === eId);
                                return (
                                  <span
                                    key={eId}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium text-xs shadow-2xs"
                                  >
                                    <span className="font-bold text-amber-700 dark:text-gold-400">{emp?.name || eId}</span>
                                    {emp?.role && (
                                      <span className="text-[10px] text-slate-400 font-mono">({emp.role})</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setAssignFormTarget(prev => ({
                                        ...prev,
                                        employeeIds: prev.employeeIds.filter(id => id !== eId)
                                      }))}
                                      className="text-slate-400 hover:text-rose-500 ml-0.5 p-0.5 rounded cursor-pointer transition"
                                      title="Remove employee"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shift Selection: 3 Standard Shifts */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Select Working Shift <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {SHIFT_CONFIGS.map(sc => {
                            const isSelected = assignFormTarget.shiftId === sc.id;
                            return (
                              <div
                                key={sc.id}
                                onClick={() => setAssignFormTarget({ ...assignFormTarget, shiftId: sc.id })}
                                className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${isSelected
                                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30'
                                  : 'border-slate-200 dark:border-navy-800 hover:border-amber-400/80 bg-white dark:bg-navy-950'
                                  }`}
                              >
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                                    <span>{sc.shiftName}</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                                      {sc.badge}
                                    </span>
                                  </div>
                                  <div className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {sc.timing}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400">Scheduled Login:</span>
                                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    {sc.scheduledLoginTime}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Frequency Selection */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Assignment Frequency <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'one_day', label: 'One Day', desc: 'Single Specific Date' },
                            { key: 'weekly', label: 'Weekly', desc: 'Recurring Weekdays' },
                            { key: 'monthly', label: 'Monthly', desc: 'Recurring Monthly' }
                          ].map(f => (
                            <button
                              key={f.key}
                              type="button"
                              onClick={() => {
                                let nextEnd = '';
                                if (f.key === 'weekly' && assignFormTarget.startDate) {
                                  const [y, m, d] = assignFormTarget.startDate.split('-').map(Number);
                                  const dt = new Date(Date.UTC(y, m - 1, d));
                                  const dow = dt.getUTCDay();
                                  const daysToSunday = dow === 0 ? 0 : 7 - dow;
                                  dt.setUTCDate(dt.getUTCDate() + daysToSunday);
                                  nextEnd = dt.toISOString().slice(0, 10);
                                } else if (f.key === 'monthly' && assignFormTarget.startDate) {
                                  const [y, m] = assignFormTarget.startDate.split('-').map(Number);
                                  nextEnd = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
                                }
                                setAssignFormTarget({
                                  ...assignFormTarget,
                                  frequency: f.key,
                                  endDate: nextEnd
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${assignFormTarget.frequency === f.key
                                ? 'bg-navy-950 text-white dark:bg-amber-500 dark:text-navy-950 border-amber-500 font-bold shadow-xs'
                                : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800'
                                }`}
                            >
                              <div className="font-bold text-xs">{f.label}</div>
                              <div className="text-[9px] opacity-80">{f.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Effective Start Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={assignFormTarget.startDate}
                            onChange={(e) => setAssignFormTarget({ ...assignFormTarget, startDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                          />
                        </div>

                        {assignFormTarget.frequency !== 'one_day' && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              End Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={assignFormTarget.endDate}
                              min={assignFormTarget.startDate}
                              onChange={(e) => setAssignFormTarget({ ...assignFormTarget, endDate: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>

                      {/* Applicable Weekdays (for Weekly/Monthly recurring) */}
                      {assignFormTarget.frequency !== 'one_day' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Applicable Working Weekdays
                          </label>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {[
                              { dayNum: 1, label: 'Mon' },
                              { dayNum: 2, label: 'Tue' },
                              { dayNum: 3, label: 'Wed' },
                              { dayNum: 4, label: 'Thu' },
                              { dayNum: 5, label: 'Fri' },
                              { dayNum: 6, label: 'Sat' },
                              { dayNum: 0, label: 'Sun' }
                            ].map(d => {
                              const isChecked = assignFormTarget.applicableDays?.includes(d.dayNum);
                              return (
                                <button
                                  key={d.dayNum}
                                  type="button"
                                  onClick={() => {
                                    const current = assignFormTarget.applicableDays || [];
                                    const updated = current.includes(d.dayNum)
                                      ? current.filter(x => x !== d.dayNum)
                                      : [...current, d.dayNum];
                                    setAssignFormTarget({ ...assignFormTarget, applicableDays: updated });
                                  }}
                                  className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer border ${isChecked
                                    ? 'bg-amber-500 text-navy-950 border-amber-600 shadow-2xs'
                                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                                    }`}
                                >
                                  {d.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Replacement Notice */}
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-gold-300 leading-relaxed">
                        ⚠️ <strong>Notice:</strong> Saving this assignment will supersede any overlapping active assignments for the selected employee(s) during this effective date range. Historical attendance records will remain preserved for audit compliance.
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Assignment Notes / Authorization Memo (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Approved shift adjustment for Q4 project milestone"
                          value={assignFormTarget.notes}
                          onChange={(e) => setAssignFormTarget({ ...assignFormTarget, notes: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-navy-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAssignShiftOpen(false);
                            setIsEmpDropdownOpen(false);
                            setAssignEmpSearch('');
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingShift}
                          className={`px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs ${isSavingShift ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                          {isSavingShift ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Assigning Shift...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Save & Apply Shift Assignment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ========================================================
                  MODAL 2: REVIEW LATE-LOGIN DECISION MODAL
              ======================================================== */}
              {lateDecisionModal.open && lateDecisionModal.request && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-gold-400">
                          Late-Login Decision Review
                        </span>
                        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-1">
                          {lateDecisionModal.decision === 'Approved' ? 'Approve Late Clock-In' : 'Reject Late Clock-In'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lateDecisionModal.request.employeeName} ({lateDecisionModal.request.employeeId})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLateDecisionModal({ open: false, request: null, decision: 'Approved', notes: '' })}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Shift Date:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{lateDecisionModal.request.attendanceDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Scheduled Login:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{lateDecisionModal.request.scheduledLoginTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Actual Clock-In:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{lateDecisionModal.request.actualClockInTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Delay:</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">+{lateDecisionModal.request.delayMinutes} mins</span>
                        </div>
                        {lateDecisionModal.request.explanation && (
                          <div className="pt-1 border-t border-slate-200 dark:border-navy-800">
                            <span className="text-[10px] text-slate-400">Employee Explanation:</span>
                            <div className="italic text-slate-700 dark:text-slate-300 mt-0.5 font-sans">
                              "{lateDecisionModal.request.explanation}"
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Reviewer Remarks / Audit Note (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder={lateDecisionModal.decision === 'Approved' ? 'Reason for approving late arrival...' : 'Reason for rejection...'}
                          value={lateDecisionModal.notes}
                          onChange={(e) => setLateDecisionModal({ ...lateDecisionModal, notes: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-navy-800">
                        <button
                          type="button"
                          onClick={() => setLateDecisionModal({ open: false, request: null, decision: 'Approved', notes: '' })}
                          className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLateApprovalDecision(lateDecisionModal.request.id, lateDecisionModal.decision, lateDecisionModal.notes)}
                          className={`px-5 py-2 font-bold rounded-xl text-white text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 ${lateDecisionModal.decision === 'Approved'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-rose-600 hover:bg-rose-500'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm {lateDecisionModal.decision}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  MODAL 3: SHIFT ASSIGNMENT HISTORY MODAL
              ======================================================== */}
              {historyModalEmployee && (
                <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-gold-400">
                          Shift Assignment Audit Log
                        </span>
                        <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-1">
                          Historical Assignments: {historyModalEmployee.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {historyModalEmployee.employeeId || historyModalEmployee.id} • {historyModalEmployee.role}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHistoryModalEmployee(null)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="overflow-y-auto flex-1 space-y-2.5 text-xs pr-1">
                      {(() => {
                        const history = [...shiftAssignmentsList]
                          .filter(
                            a => a.employeeId === (historyModalEmployee.employeeId || historyModalEmployee.id)
                          )
                          .sort((a, b) => {
                            // The shift that was lastly assigned comes at the very top:
                            const parseTime = (item) => {
                              if (item.assignedAt) {
                                const iso = String(item.assignedAt).replace(' ', 'T');
                                const t = new Date(iso).getTime();
                                if (!isNaN(t)) return t;
                              }
                              const idMatch = String(item.id || '').match(/SFA-(\d+)/);
                              if (idMatch) return parseInt(idMatch[1], 10);
                              return 0;
                            };
                            const timeA = parseTime(a);
                            const timeB = parseTime(b);
                            if (timeB !== timeA) return timeB - timeA;
                            if (a.rowid && b.rowid && a.rowid !== b.rowid) return b.rowid - a.rowid;
                            if (a.status === 'Active' && b.status !== 'Active') return -1;
                            if (b.status === 'Active' && a.status !== 'Active') return 1;
                            return (b.id || '').localeCompare(a.id || '');
                          });
                        if (history.length === 0) {
                          return (
                            <div className="py-12 text-center text-slate-400">
                              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-1" />
                              <p className="font-bold text-xs text-slate-600 dark:text-slate-300">
                                Operating on Default General Shift
                              </p>
                              <p className="text-[10px] text-slate-400">
                                No custom shift overrides or recurring schedules have been configured yet.
                              </p>
                            </div>
                          );
                        }
                        return history.map((asgn, index) => (
                          <div
                            key={asgn.id || index}
                            className={`p-3 rounded-xl border space-y-1.5 transition ${index === 0
                              ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-xs'
                              : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800'
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">{asgn.shiftName}</span>
                                {index === 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                                    Lastly Assigned
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${asgn.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-slate-400'
                                }`}>
                                {asgn.status}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                              Timing: {asgn.scheduledLoginTime} – {asgn.scheduledLogoutTime}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-navy-800">
                              <span>Period: {asgn.startDate} to {asgn.endDate || 'Ongoing'} ({asgn.frequency})</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                By: {asgn.assignedByName || 'System'}
                                {asgn.assignedAt && (
                                  <span className="text-[9px] text-slate-400 font-mono ml-1.5">
                                    • {asgn.assignedAt.slice(0, 16)}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setHistoryModalEmployee(null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* ========================================================
            TAB 10: DOCUMENT REPOSITORY (Advanced Feature 2)
        ======================================================== */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Employee Confidential Document Repository & Verification Vault
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {[
                  { title: 'Identity & Address Proof (Aadhaar / Passport / MOFA Certificate)', verifiedCount: 48, total: 48, status: '100% Verified' },
                  { title: 'Educational Degree Certificates & University Mark Sheets', verifiedCount: 48, total: 48, status: '100% Verified' },
                  { title: 'Signed Employment Agreements & Confidential Non-Disclosure Agreements', verifiedCount: 48, total: 48, status: '100% Signed' },
                  { title: 'Previous Employer Relieving Letters & Experience Certificates', verifiedCount: 45, total: 48, status: '3 Under Verification' },
                  { title: 'Comprehensive Background Verification (BGV) & Criminal Check Report', verifiedCount: 48, total: 48, status: 'Clean Audit' }
                ].map((doc, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.verifiedCount} of {doc.total} dossiers on secure cloud vault</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 11: GRIEVANCE MANAGEMENT (Advanced Feature 4)
        ======================================================== */}
        {false && activeTab === 'grievances' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Confidential Workplace Grievance & Resolution Log
                  </h3>
                  <p className="text-[11px] text-slate-500">Secure ticketing for employee concerns, peer disputes, and workplace facilities</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  🔒 Encrypted & Confidential
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {grievances.map(g => (
                  <div key={g.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{g.id}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{g.category}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {g.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{g.details}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 12: CENTRAL APPROVAL CENTER (Advanced Feature 6)
        ======================================================== */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Shift Late Arrival Approvals (HR Lead & Super Admin Authorization) */}
            <ShiftLateArrivalApprovalSection
              currentRole={currentRole || 'HR Lead'}
              crmToken={crmToken}
              onAuditClick={() => setActiveTab('attendance')}
            />

            {/* Live Database Attendance Regularization Approvals */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Attendance Regularization Requests (Live Database)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and approve/reject HR Operations employee check-in, check-out, and status corrections.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                  {hrRegularizations.filter((r) => r.status === 'Pending').length} Pending
                </span>
              </div>

              {hrRegularizations.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  No attendance regularization requests found in database.
                </p>
              ) : (
                <div className="space-y-3">
                  {hrRegularizations.map((reg) => (
                    <div
                      key={reg.id}
                      className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {reg.employeeName} ({reg.employeeId}) • {reg.attendanceDate}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {reg.correctionType} • Current: {reg.existingCheckIn || '—'} / {reg.existingCheckOut || '—'} ({reg.existingStatus}) → Requested: {reg.requestedCheckIn || '—'} / {reg.requestedCheckOut || '—'}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${reg.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : reg.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Reason:</span> {reg.reason}
                      </p>

                      {reg.status === 'Pending' ? (
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Reviewer comment (optional)..."
                            value={regCommentMap[reg.id] || ''}
                            onChange={(e) =>
                              setRegCommentMap((prev) => ({ ...prev, [reg.id]: e.target.value }))
                            }
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={reviewingRegId === reg.id}
                              onClick={() => handleReviewRegularization(reg.id, 'Approved')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewingRegId === reg.id}
                              onClick={() => handleReviewRegularization(reg.id, 'Rejected')}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Reviewed by {reg.reviewerName || 'HR Lead'}: {reg.reviewerComments || 'No comment'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Central Unified HR Approval Center
                  </h3>
                  <p className="text-[11px] text-slate-500">Consolidated inbox for leave approvals, expense claims, and onboarding clearance</p>
                </div>

                <button
                  onClick={() => {
                    setLeaveRequests(prev => prev.map(l => ({ ...l, status: 'Approved' })));
                    setExpenseClaims(prev => prev.map(e => ({ ...e, status: 'Approved' })));
                    showToast('✓ All 6 pending workforce requests have been approved!');
                  }}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition cursor-pointer text-xs"
                >
                  ✓ Bulk Authorize All ({pendingApprovalsCount})
                </button>
              </div>

              {/* Expense Claims Awaiting Approval */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Pending Expense Reimbursement Claims</h4>
                {expenseClaims.map(exp => (
                  <div key={exp.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{exp.employee}</span>
                        <span className="text-[10px] font-mono text-slate-400">({exp.id})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {exp.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{exp.description}</p>
                      <span className="text-[10px] font-mono text-slate-400">Submitted: {exp.date} • {exp.receiptsAttached} Receipts Attached</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif font-black text-emerald-600 text-sm">{exp.amount}</span>
                      {exp.status.includes('Pending') ? (
                        <button
                          onClick={() => {
                            setExpenseClaims(prev => prev.map(e => e.id === exp.id ? { ...e, status: 'Approved' } : e));
                            showToast(`✓ Expense claim ${exp.id} approved for reimbursement.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">✓ Approved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 13: WORKFORCE REPORTS & ANALYTICS (Advanced Feature 7)
        ======================================================== */}
        {false && activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Annual Attrition Rate</span>
                <p className="text-3xl font-serif font-black text-emerald-600 mt-2">3.8%</p>
                <span className="text-[10px] text-emerald-600 font-semibold">↗ Industry Leading Retention</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Workforce Gender Diversity</span>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-2">54% F / 46% M</p>
                <span className="text-[10px] text-purple-600 font-semibold">↗ Balanced Leadership Ratio</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Average Tenure</span>
                <p className="text-3xl font-serif font-black text-blue-600 mt-2">2.4 Years</p>
                <span className="text-[10px] text-blue-600 font-semibold">↗ Steadily Growing Team</span>
              </div>
            </div>

            {/* Audit & Compliance Security Box (Access & Data Security from Document) */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    HR Data Governance, Role Permissions & Access Log
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● 256-bit Audit Trail Active
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Role-based access permissions protect employee salary details, medical certificates, and confidential HR review records. All sign-offs and status alterations are permanently logged with audit timestamps.
              </p>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW EMPLOYEE */}
        {isAddEmployeeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Add Employee Profile</h3>
                <button
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={e => {
                      setNewEmp({ ...newEmp, name: e.target.value });
                      if (addEmpErrors.name) setAddEmpErrors({ ...addEmpErrors, name: '' });
                    }}
                    placeholder="e.g. Radhika Ramanathan"
                    className={`w-full bg-slate-50 dark:bg-navy-950 border ${addEmpErrors.name ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-800'} rounded-xl px-3 py-2 text-xs focus:outline-none font-bold`}
                  />
                  {addEmpErrors.name && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {addEmpErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option>HR Operations</option>
                      <option>Talent Acquisition</option>
                      <option>Placement Cell</option>
                      <option>Engineering</option>
                      <option>Client Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={newEmp.role}
                      onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                      placeholder="e.g. HR Operations Associate"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email ID *</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={e => {
                        setNewEmp({ ...newEmp, email: e.target.value });
                        if (addEmpErrors.email) setAddEmpErrors({ ...addEmpErrors, email: '' });
                      }}
                      placeholder="radhika.r@revivalcrm.com"
                      className={`w-full bg-slate-50 dark:bg-navy-950 border ${addEmpErrors.email ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-800'} rounded-xl px-3 py-2 text-xs focus:outline-none font-bold`}
                    />
                    {addEmpErrors.email && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {addEmpErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.phone}
                      onChange={e => {
                        setNewEmp({ ...newEmp, phone: e.target.value });
                        if (addEmpErrors.phone) setAddEmpErrors({ ...addEmpErrors, phone: '' });
                      }}
                      placeholder="+91 98401 22334"
                      className={`w-full bg-slate-50 dark:bg-navy-950 border ${addEmpErrors.phone ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-800'} rounded-xl px-3 py-2 text-xs focus:outline-none font-bold`}
                    />
                    {addEmpErrors.phone && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {addEmpErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monthly Salary *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.salary}
                      onChange={e => {
                        setNewEmp({ ...newEmp, salary: e.target.value });
                        if (addEmpErrors.salary) setAddEmpErrors({ ...addEmpErrors, salary: '' });
                      }}
                      placeholder="₹55,000 / mo"
                      className={`w-full bg-slate-50 dark:bg-navy-950 border ${addEmpErrors.salary ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-navy-800'} rounded-xl px-3 py-2 text-xs focus:outline-none font-bold`}
                    />
                    {addEmpErrors.salary && (
                      <p className="text-rose-500 text-[10px] font-bold mt-1">⚠️ {addEmpErrors.salary}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employment Type</label>
                    <select
                      value={newEmp.employmentType}
                      onChange={e => setNewEmp({ ...newEmp, employmentType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option>Full-Time Permanent</option>
                      <option>Probationary (6 Mos)</option>
                      <option>Contractual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddEmployeeOpen(false);
                      setAddEmpErrors({});
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Save & Create Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW FULL EMPLOYEE PROFILE (Bug 5) */}
        {selectedProfileEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-navy-800 text-amber-900 dark:text-gold-400 font-serif font-black text-2xl flex items-center justify-center border border-amber-300/60 dark:border-navy-700 shadow-sm">
                    {selectedProfileEmployee.avatarLetter || selectedProfileEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                        {selectedProfileEmployee.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ● {selectedProfileEmployee.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-gold-400 font-bold">
                      {selectedProfileEmployee.role} • <span className="text-slate-400 font-mono">{selectedProfileEmployee.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProfileEmployee(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Corporate Position & Branch</span>
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Department:</strong> {selectedProfileEmployee.department}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Branch / HQ:</strong> {selectedProfileEmployee.location || 'Chennai HQ'}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Employment Type:</strong> {selectedProfileEmployee.employmentType || 'Full-Time Permanent'}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Joining Date:</strong> {selectedProfileEmployee.joiningDate}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact & Authentication</span>
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-500" />
                      <a href={`mailto:${selectedProfileEmployee.email}`} className="hover:underline font-bold text-slate-900 dark:text-white">{selectedProfileEmployee.email}</a>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{selectedProfileEmployee.phone}</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Access Level:</strong> Staff Enterprise Gateway</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">ID Attestation:</strong> Verified (MOHRE & Govt UID)</p>
                  </div>
                </div>
              </div>

              {/* Compensation & Statutory Info */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Annual Compensation Structure</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-serif font-black text-slate-900 dark:text-white">{selectedProfileEmployee.salary}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      CTC: {selectedProfileEmployee.ctc}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Disbursement Mode: <strong>Direct Bank Deposit</strong></p>
                  <p>Tax Deduction: <strong>TDS Slabs Compliant</strong></p>
                </div>
              </div>

              {/* Attendance & Leave Quota Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/80 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Today's Punch</span>
                  <span className="font-bold text-emerald-600">{selectedProfileEmployee.attendanceToday?.checkIn || '09:00 AM'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/80 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Casual Leaves</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedProfileEmployee.leaveBalance?.casual || 8} Days</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/80 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Sick Leaves</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedProfileEmployee.leaveBalance?.sick || 8} Days</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200/80 dark:border-navy-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Paid Annual Leaves</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedProfileEmployee.leaveBalance?.paid || 14} Days</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => {
                    const doc = new jsPDF();
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(16);
                    doc.text('THE REVIVAL INTERNATIONAL - EMPLOYEE DOSSIER', 14, 20);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 26);
                    doc.line(14, 30, 196, 30);

                    doc.text(`Full Name: ${selectedProfileEmployee.name}`, 14, 40);
                    doc.text(`Employee ID: ${selectedProfileEmployee.id}`, 14, 48);
                    doc.text(`Designation: ${selectedProfileEmployee.role}`, 14, 56);
                    doc.text(`Department: ${selectedProfileEmployee.department}`, 14, 64);
                    doc.text(`Corporate Email: ${selectedProfileEmployee.email}`, 14, 72);
                    doc.text(`Contact Phone: ${selectedProfileEmployee.phone}`, 14, 80);
                    doc.text(`Employment Type: ${selectedProfileEmployee.employmentType}`, 14, 88);
                    doc.text(`Date of Joining: ${selectedProfileEmployee.joiningDate}`, 14, 96);
                    doc.text(`Gross Salary: ${selectedProfileEmployee.salary}`, 14, 104);
                    doc.text(`Annual CTC: ${selectedProfileEmployee.ctc}`, 14, 112);

                    doc.save(`Employee_Dossier_${selectedProfileEmployee.id}.pdf`);
                    showToast(`✓ Downloaded personnel dossier for ${selectedProfileEmployee.name}`);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5 text-gold-500" />
                  <span>Download Dossier PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProfileEmployee(null)}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs transition"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL: ADD PERFORMANCE REVIEW & KPI SCORECARD (Bug 6) */}
        {isAddReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl max-w-lg w-full space-y-4">

              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Add Quarterly Performance Review
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddReviewOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {reviewError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleAddReviewSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Employee *</label>
                  <select
                    value={newReview.employee}
                    onChange={e => setNewReview({ ...newReview, employee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} — {emp.role} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Score *</label>
                    <input
                      type="text"
                      required
                      value={newReview.targetScore}
                      onChange={e => setNewReview({ ...newReview, targetScore: e.target.value })}
                      placeholder="e.g. 115% Achieved"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Rating (1.0 to 5.0) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      required
                      value={newReview.rating}
                      onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tasks Done *</label>
                    <input
                      type="text"
                      required
                      value={newReview.tasksDone}
                      onChange={e => setNewReview({ ...newReview, tasksDone: e.target.value })}
                      placeholder="e.g. 42/45"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reviewer Name *</label>
                    <input
                      type="text"
                      required
                      value={newReview.reviewer}
                      onChange={e => setNewReview({ ...newReview, reviewer: e.target.value })}
                      placeholder="e.g. Priya Lead"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Manager Qualitative Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    value={newReview.feedback}
                    onChange={e => setNewReview({ ...newReview, feedback: e.target.value })}
                    placeholder="Enter objective appraisal feedback, strengths, and goals..."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsAddReviewOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Submit Performance Review
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
};

export default CrmHrLeadDashboard;

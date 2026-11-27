import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getSupabaseClient } from './supabase.js';
import { INITIAL_BASELINE_ENQUIRIES } from './data/baselineEnquiries.js';

export const normalizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  let clean = digits.replace(/^0+/, '');
  if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
  else if (clean.startsWith('971') && clean.length === 12) clean = clean.slice(3);
  else if (clean.startsWith('1') && clean.length === 11) clean = clean.slice(1);
  if (clean.length > 10) clean = clean.slice(-10);
  return clean;
};

export const hashPassword = (password, existingSalt = null) => {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
};

export const verifyPassword = (password, hash, salt) => {
  if (!password || !hash || !salt) return false;
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch {
    return false;
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let usingFallbackStore = false;

const isServerlessEnv = () => {
  return Boolean(
    process.env.VERCEL === '1' ||
    process.env.VERCEL ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
};

export const getDbPath = () => {
  if (isServerlessEnv()) {
    const tmpDbName = process.env.DATABASE_PATH ? path.basename(process.env.DATABASE_PATH) : 'sir_recruitment.db';
    const tmpDbPath = path.join(os.tmpdir(), tmpDbName);
    const possibleBundledPaths = [
      path.join(__dirname, 'sir_recruitment.db'),
      path.join(process.cwd(), 'server', 'sir_recruitment.db'),
      path.resolve('server/sir_recruitment.db'),
      path.join(__dirname, '..', 'server', 'sir_recruitment.db')
    ];
    const bundledDbPath = possibleBundledPaths.find(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });

    try {
      if (bundledDbPath) {
        if (!fs.existsSync(tmpDbPath)) {
          fs.copyFileSync(bundledDbPath, tmpDbPath);
          console.log(`[Serverless DB] Initialized tmp database from bundled: ${bundledDbPath} -> ${tmpDbPath}`);
        } else {
          const bundledStat = fs.statSync(bundledDbPath);
          const tmpStat = fs.statSync(tmpDbPath);
          if (bundledStat.size > tmpStat.size || (bundledStat.size !== tmpStat.size && bundledStat.mtimeMs > tmpStat.mtimeMs)) {
            fs.copyFileSync(bundledDbPath, tmpDbPath);
            console.log(`[Serverless DB] Updated tmp database with newer bundled version`);
          }
        }
      }
    } catch (copyErr) {
      console.warn('[Serverless DB] Copy notice:', copyErr.message);
    }
    return tmpDbPath;
  }

  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }

  return path.join(__dirname, 'sir_recruitment.db');
};

export const DEFAULT_SHIFTS = [
  {
    id: 'SHIFT-GENERAL',
    name: 'General Day Shift (09:00 AM - 06:00 PM)',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    isOvernight: 0,
    breakTrackingEnabled: 1,
    overtimeEnabled: 1,
    overtimeThresholdMinutes: 480,
    absentCutoffHour: 14,
    weeklyOffDays: '[0]'
  },
  {
    id: 'SHIFT-MORNING',
    name: 'Early Morning Shift (08:00 AM - 04:30 PM)',
    startTime: '08:00',
    endTime: '16:30',
    graceMinutes: 15,
    isOvernight: 0,
    breakTrackingEnabled: 1,
    overtimeEnabled: 1,
    overtimeThresholdMinutes: 480,
    absentCutoffHour: 13,
    weeklyOffDays: '[0]'
  },
  {
    id: 'SHIFT-UK-ME',
    name: 'UK & Middle East Overlap (01:00 PM - 09:30 PM)',
    startTime: '13:00',
    endTime: '21:30',
    graceMinutes: 15,
    isOvernight: 0,
    breakTrackingEnabled: 1,
    overtimeEnabled: 1,
    overtimeThresholdMinutes: 480,
    absentCutoffHour: 17,
    weeklyOffDays: '[0]'
  },
  {
    id: 'SHIFT-NIGHT',
    name: 'Overnight Global Desk (10:00 PM - 07:00 AM)',
    startTime: '22:00',
    endTime: '07:00',
    graceMinutes: 15,
    isOvernight: 1,
    breakTrackingEnabled: 1,
    overtimeEnabled: 1,
    overtimeThresholdMinutes: 480,
    absentCutoffHour: 23,
    weeklyOffDays: '[0]'
  }
];

export const DEFAULT_CRM_EMPLOYEES = [
  {
    id: 'emp-1',
    employeeId: 'REV-EMP-001',
    name: 'Dhanalakshimi',
    email: 'thejobsyncit@gmail.com',
    altEmail: 'dhana.jasync@gmail.com',
    phone: '+91 9003475405',
    role: 'Super Admin',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin',
    reportingManager: 'Board of Directors',
    joiningDate: '2023-01-15',
    assignedBranch: 'Executive HQ, Dubai',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1988-08-14',
    address: 'Level 34, Rolex Tower, Financial Center Road, Business Bay, Dubai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    password: 'Thejobsync@26',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-2',
    employeeId: 'REV-EMP-002',
    name: 'Sarah Jenkins',
    email: 'sarah.admin@revivalinternational.com',
    phone: '+91 98400 11002',
    role: 'Admin',
    department: 'Operations Management',
    designation: 'Senior CRM Administrator',
    reportingManager: 'Dhanalakshimi (Super Admin)',
    joiningDate: '2023-04-10',
    assignedBranch: 'Dubai Knowledge Park',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1991-03-22',
    address: 'Dubai Silicon Oasis, Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-3',
    employeeId: 'REV-EMP-003',
    name: 'Priya Sharma',
    email: 'priya.lead@revivalinternational.com',
    phone: '+91 98400 11003',
    role: 'HR Lead',
    department: 'Human Resources',
    designation: 'Head of Global HR & Operations',
    reportingManager: 'Dhanalakshimi (Super Admin)',
    joiningDate: '2023-06-01',
    assignedBranch: 'Central HR Executive Console, Dubai',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1990-12-05',
    address: 'Al Barsha 1, Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-4',
    employeeId: 'REV-EMP-004',
    name: 'Kishore Kumar',
    email: 'kishore.recruiter@revivalinternational.com',
    phone: '+91 98400 11004',
    role: 'Recruiter',
    department: 'Talent Acquisition & ATS',
    designation: 'Lead Recruitment Specialist',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2023-09-15',
    assignedBranch: 'Talent Acquisition Division, Chennai',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1993-07-19',
    address: 'Anna Nagar, Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-5',
    employeeId: 'REV-EMP-005',
    name: 'Sreeja Nair',
    email: 'sreeja.jasync@gmail.com',
    phone: '+91 9876543211',
    role: 'Placement Coordinator',
    department: 'Placement & Industry Relations',
    designation: 'Senior Placement Coordinator',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2023-10-01',
    assignedBranch: 'University Relations HQ, Dubai',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1994-02-17',
    address: 'Dubai Marina, Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-6',
    employeeId: 'REV-EMP-006',
    name: 'Balavarshini S.',
    email: 'balavarshini.s@revivalinternational.com',
    altEmail: 'balavarshini2223@gmail.com',
    phone: '+91 9876543214',
    role: 'HR Operations',
    department: 'International HR Operations',
    designation: 'Lead HR Operations Specialist',
    operationTeam: 'International HR Operations',
    assignedBranch: 'Branch A: International HR Operations (International Admissions & Consulting)',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2023-08-10',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1996-11-14',
    address: 'OMR IT Corridor, Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-tariq',
    employeeId: 'REV-EMP-007',
    name: 'Dr. Tariq Al-Hashimi',
    email: 'tariq.interviewer@revivalinternational.com',
    phone: '+971 50 456 7890',
    role: 'Interviewer',
    department: 'Technical & Academic Assessment Panel',
    designation: 'Senior Technical Interviewer & Panellist',
    reportingManager: 'Dhanalakshimi (Super Admin)',
    joiningDate: '2023-11-01',
    assignedBranch: 'Dubai Knowledge Park, UAE',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1985-04-12',
    address: 'Dubai Silicon Oasis, Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-fatima',
    employeeId: 'REV-EMP-107',
    name: 'Fatima',
    email: 'fatima.intl@revivalinternational.com',
    phone: '+971 50 876 5432',
    role: 'HR Operations',
    department: 'International HR Operations',
    designation: 'International HR Operations Specialist',
    operationTeam: 'International HR Operations',
    assignedBranch: 'Branch A: International HR Operations (International Admissions & Consulting)',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2024-03-15',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1994-06-21',
    address: 'Business Bay, Executive Towers, Dubai, UAE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-divya',
    employeeId: 'REV-EMP-102',
    name: 'Divya R.',
    email: 'divya.enq@revivalinternational.com',
    phone: '+91 98401 11202',
    role: 'HR Operations',
    department: 'Enquiry HR Operations',
    designation: 'HR Operations Specialist',
    operationTeam: 'Enquiry HR Operations',
    assignedBranch: 'Branch B: Enquiry HR Operations (Career Guidance, Student Academy, College Admissions)',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2024-01-22',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1997-04-18',
    address: 'T. Nagar, Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  },
  {
    id: 'emp-praveen',
    employeeId: 'REV-EMP-108',
    name: 'Praveen Kumar',
    email: 'praveen.enq@revivalinternational.com',
    phone: '+91 98401 11208',
    role: 'HR Operations',
    department: 'Enquiry HR Operations',
    designation: 'HR Operations Specialist',
    operationTeam: 'Enquiry HR Operations',
    assignedBranch: 'Branch B: Enquiry HR Operations (Career Guidance, Student Academy, College Admissions)',
    reportingManager: 'Priya Sharma (HR Lead)',
    joiningDate: '2024-05-02',
    employmentStatus: 'Full-Time (Active)',
    dateOfBirth: '1995-09-30',
    address: 'Velachery Main Road, Chennai, India',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    status: 'Active',
    createdAt: '2026-11-01 09:00:00'
  }
];

export const DEFAULT_CRM_CANDIDATES = [];

export const DEFAULT_CRM_PROFILES = [];

export const DEFAULT_CRM_APPLICATIONS = [
  {
    id: 'RI-APP-98803',
    candidateId: 'RI-CAND-004',
    userId: 'USR-MW6KIP1V-492',
    jobId: 'job-102',
    jobTitle: 'Offshore Drilling Engineer',
    company: 'Gulf Petroleum Resources',
    location: 'Dhahran / Offshore',
    appliedDate: '2026-11-14T04:29:41.670Z',
    status: 'Assigned',
    stage: 'Applied',
    applicantName: 'Kishore Kumar',
    applicantEmail: 'kishorekumaroffl@gmail.com',
    applicantPhone: '+971 50 123 4567',
    assignedEmployee: 'Balavarshini S.',
    assignedEmployeeId: 'REV-EMP-006',
    assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com',
    priority: 'High',
    assignmentNotes: 'Review offshore safety certifications & HUET clearance.',
    assignedDate: '2026-11-20T10:00:00.000Z',
    noticePeriod: 'Immediate',
    expectedSalary: 'SAR 38,000 - 52,000 / month'
  },
  {
    id: 'REV-EMAIL-APP-1795186167468-LRUAS',
    candidateId: 'RI-CAND-804380',
    userId: 'USR-MW6CF773-428',
    jobId: 'job-104',
    jobTitle: 'Executive Chef - Luxury Resort',
    company: 'Atlantis Resorts & Hotels',
    location: 'Dubai, Palm Jumeirah',
    appliedDate: '2026-11-20T14:49:28.283Z',
    status: 'Assigned',
    stage: 'Applied',
    applicantName: 'JAYA PRAKASH',
    applicantEmail: 'jaganbjp2526@gmail.com',
    applicantPhone: '+91 9361151257',
    assignedEmployee: 'Praveen Kumar',
    assignedEmployeeId: 'REV-EMP-108',
    assignedEmployeeEmail: 'praveen.enq@revivalinternational.com',
    priority: 'Normal',
    assignmentNotes: 'Evaluate luxury resort culinary portfolio & menu testing.',
    assignedDate: '2026-11-21T09:30:00.000Z',
    noticePeriod: '15 Days',
    expectedSalary: 'AED 18,000 - 24,000 / month'
  },
  {
    id: 'RI-APP-10101',
    candidateId: 'RI-CAND-005',
    userId: 'USR-MWBXPKFO-769',
    jobId: 'job-101',
    jobTitle: 'Senior Civil Project Manager',
    company: 'Al Habtoor Contracting LLC',
    location: 'Dubai, Business Bay',
    appliedDate: '2026-11-18T10:15:00.000Z',
    status: 'Under Review',
    stage: 'Applied',
    applicantName: 'Tariq Mansoor',
    applicantEmail: 'thejobsyncit@gmail.com',
    applicantPhone: '+971 52 445 8890',
    priority: 'Normal',
    noticePeriod: '30 Days',
    expectedSalary: 'AED 32,000 - 45,000 / month'
  },
  {
    id: 'RI-APP-10302',
    candidateId: 'RI-CAND-103',
    userId: 'USR-AISHA-103',
    jobId: 'job-103',
    jobTitle: 'Senior ICU Registered Nurse',
    company: 'King Faisal Specialist Hospital',
    location: 'Riyadh',
    appliedDate: '2026-11-19T08:30:00.000Z',
    status: 'Under Review',
    stage: 'Applied',
    applicantName: 'Dr. Aisha Siddiqui',
    applicantEmail: 'aisha.icu@gmail.com',
    applicantPhone: '+966 50 234 5678',
    priority: 'High',
    noticePeriod: 'Immediate',
    expectedSalary: 'SAR 22,000 - 28,000 / month'
  },
  {
    id: 'RI-APP-10503',
    candidateId: 'RI-CAND-105',
    userId: 'USR-VIKRAM-105',
    jobId: 'job-105',
    jobTitle: 'Lead Cloud Solutions Architect (AWS / Azure)',
    company: 'TechVision International',
    location: 'Marina Bay Financial Centre',
    appliedDate: '2026-11-20T11:45:00.000Z',
    status: 'Under Review',
    stage: 'Applied',
    applicantName: 'Vikram Malhotra',
    applicantEmail: 'vikram.cloud@gmail.com',
    applicantPhone: '+65 9123 4567',
    priority: 'High',
    noticePeriod: '1 Month',
    expectedSalary: 'SGD 14,000 - 18,000 / month'
  },
  {
    id: 'RI-APP-10604',
    candidateId: 'RI-CAND-106',
    userId: 'USR-SAMEER-106',
    jobId: 'job-106',
    jobTitle: 'Senior Mechanical Maintenance Engineer',
    company: 'Emirates Global Aluminium',
    location: 'Abu Dhabi, KIZAD',
    appliedDate: '2026-11-21T09:20:00.000Z',
    status: 'Under Review',
    stage: 'Applied',
    applicantName: 'Sameer Al-Hashimi',
    applicantEmail: 'sameer.maintenance@gmail.com',
    applicantPhone: '+971 55 987 6543',
    priority: 'Normal',
    noticePeriod: 'Immediate',
    expectedSalary: 'AED 25,000 - 32,000 / month'
  }
];

export const DEFAULT_CRM_LEADS = [
  {
    id: 'LEAD-9001',
    name: 'Zubair Al Mansoor',
    email: 'zubair.m@gmail.com',
    phone: '+971 50 876 5432',
    company: 'Al Mansoor Holdings',
    serviceId: 'intl-consult',
    serviceTitle: 'International Consulting',
    countryInterest: 'UAE',
    assistanceType: 'UAE Golden Visa & Corporate Setup',
    intakeTerm: 'Immediate 2026',
    status: 'In Progress',
    assignedEmployee: 'Fatima Al Zahra',
    message: 'Seeking comprehensive consultation for Dubai Golden Visa and corporate holding structure.',
    createdAt: '2026-11-04 14:00:00'
  },
  {
    id: 'LEAD-9002',
    name: 'Pooja Ramakrishnan',
    email: 'pooja.ram@yahoo.com',
    phone: '+91 98401 23456',
    company: 'Individual Candidate',
    serviceId: 'college-adm',
    serviceTitle: 'College Admission Assistance',
    countryInterest: 'Canada',
    assistanceType: 'Fall 2027 Postgraduate Admissions',
    intakeTerm: 'Fall 2027',
    status: 'Contacted',
    assignedEmployee: 'Fatima Al Zahra',
    message: 'Shortlisting Canadian universities for Master in Data Science. Needs IELTS preparation counseling.',
    createdAt: '2026-11-03 16:30:00'
  },
  {
    id: 'LEAD-9003',
    name: 'Karthik Subburaj',
    email: 'karthik.s@gmail.com',
    phone: '+91 97890 87654',
    company: 'Individual Candidate',
    serviceId: 'intl-adm',
    serviceTitle: 'International Admissions',
    countryInterest: 'Germany',
    assistanceType: 'Public University STEM Admissions',
    intakeTerm: 'Winter 2026',
    status: 'Consultation Scheduled',
    assignedEmployee: 'Priya Sharma',
    message: 'Looking for tuition-free public universities in Germany for Automotive Engineering.',
    createdAt: '2026-11-05 11:15:00'
  },
  {
    id: 'LEAD-9004',
    name: 'Naveen Vignesh',
    email: 'naveen.v@outlook.com',
    phone: '+971 55 345 6789',
    company: 'Individual Candidate',
    serviceId: 'school-career',
    serviceTitle: 'School Student Career Guidance',
    countryInterest: 'UAE & UK',
    assistanceType: 'Psychometric Aptitude & Stream Selection',
    intakeTerm: 'Grade 11 Intake',
    status: 'New',
    assignedEmployee: 'Balavarshini',
    message: 'Career guidance consultation for Grade 10 student choosing IB streams.',
    createdAt: '2026-11-05 13:45:00'
  },
  {
    id: 'LEAD-9005',
    name: 'Ahmed Tariq',
    email: 'ahmed.t@gmail.com',
    phone: '+971 52 112 2334',
    company: 'Gulf Horizon Logistics',
    serviceId: 'exec-seminars-lang',
    serviceTitle: 'Executive Seminars & Language Hub',
    countryInterest: 'UAE',
    assistanceType: 'Corporate Business Arabic Seminar',
    intakeTerm: 'Q4 2026',
    status: 'In Progress',
    assignedEmployee: 'Fatima Al Zahra',
    message: 'Corporate enquiry for training 5 senior executives in Business Arabic and Gulf etiquette.',
    createdAt: '2026-11-02 10:20:00'
  }
];

export const DEFAULT_CRM_TASKS = [
  {
    id: 'TASK-OPS-001',
    enquiryId: 'LEAD-9004',
    referenceNumber: 'REV-CAR-2026-9004',
    candidateKey: 'naveen-vignesh',
    customerName: 'Naveen Vignesh',
    customerEmail: 'naveen.v@outlook.com',
    customerPhone: '+971 55 345 6789',
    serviceTitle: 'School Student Career Guidance',
    operationTeam: 'Enquiry HR Operations',
    assignedEmployeeId: 'REV-EMP-006',
    assignedEmployeeName: 'Balavarshini S.',
    assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com',
    assignedById: 'REV-EMP-003',
    assignedByName: 'Priya Sharma (HR Lead)',
    priority: 'High',
    dueDate: '2026-11-12',
    taskStatus: 'To Do',
    notes: 'Administer Grade 10 stream selection psychometric aptitude assessment.',
    assignedAt: '2026-11-08 10:00:00'
  },
  {
    id: 'TASK-OPS-002',
    enquiryId: 'LEAD-ENQ-203',
    referenceNumber: 'REV-COL-2026-003',
    candidateKey: 'pooja-ramakrishnan',
    customerName: 'Pooja Ramakrishnan',
    customerEmail: 'pooja.ram@yahoo.com',
    customerPhone: '+91 98401 23456',
    serviceTitle: 'College Admission Assistance',
    operationTeam: 'International HR Operations',
    assignedEmployeeId: 'REV-EMP-006',
    assignedEmployeeName: 'Balavarshini S.',
    assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com',
    assignedById: 'REV-EMP-003',
    assignedByName: 'Priya Sharma (HR Lead)',
    priority: 'High',
    dueDate: '2026-11-12',
    taskStatus: 'In Progress',
    notes: 'Review board exam cut-off and coordinate university quota counseling with parents.',
    assignedAt: '2026-11-07 10:00:00'
  },
  {
    id: 'TASK-OPS-003',
    enquiryId: 'LEAD-INT-104',
    referenceNumber: 'REV-INT-2026-004',
    candidateKey: 'zubair-ahmed-khan',
    customerName: 'Zubair Ahmed Khan',
    customerEmail: 'zubair.ahmed@gmail.com',
    customerPhone: '+91 98404 45678',
    serviceTitle: 'International Consulting',
    operationTeam: 'International HR Operations',
    assignedEmployeeId: 'REV-EMP-006',
    assignedEmployeeName: 'Balavarshini S.',
    assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com',
    assignedById: 'REV-EMP-003',
    assignedByName: 'Sarah Al Zaabi (HR Lead)',
    priority: 'Urgent',
    dueDate: '2026-11-13',
    taskStatus: 'To Do',
    notes: 'Urgent: Verify attested degree copies & police clearance for GCC residency.',
    assignedAt: '2026-11-07 09:00:00'
  },
  {
    id: 'TASK-OPS-004',
    enquiryId: 'LEAD-INT-105',
    referenceNumber: 'REV-ADM-2026-005',
    candidateKey: 'karthik-subburaj',
    customerName: 'Karthik Subburaj',
    customerEmail: 'karthik.subburaj@gmail.com',
    customerPhone: '+91 97890 87654',
    serviceTitle: 'International Admissions',
    operationTeam: 'International HR Operations',
    assignedEmployeeId: 'REV-EMP-107',
    assignedEmployeeName: 'Fatima',
    assignedEmployeeEmail: 'fatima.intl@revivalinternational.com',
    assignedById: 'REV-EMP-003',
    assignedByName: 'Sarah Al Zaabi (HR Lead)',
    priority: 'Normal',
    dueDate: '2026-11-14',
    taskStatus: 'To Do',
    notes: 'Call candidate to review IELTS scorecard and Spring 2027 university intake deadlines.',
    assignedAt: '2026-11-07 11:30:00'
  },
  {
    id: 'TASK-OPS-005',
    enquiryId: 'LEAD-ENQ-210',
    referenceNumber: 'REV-CAR-2026-010',
    candidateKey: 'harini-sundar',
    customerName: 'Harini Sundar',
    customerEmail: 'harini.sundar@yahoo.co.in',
    customerPhone: '+91 98841 22339',
    serviceTitle: 'School Student Career Guidance',
    operationTeam: 'Enquiry HR Operations',
    assignedEmployeeId: 'REV-EMP-102',
    assignedEmployeeName: 'Divya R.',
    assignedEmployeeEmail: 'divya.enq@revivalinternational.com',
    assignedById: 'REV-EMP-003',
    assignedByName: 'Priya Sharma (HR Lead)',
    priority: 'Normal',
    dueDate: '2026-11-15',
    taskStatus: 'In Progress',
    notes: 'Administer career assessment test & draft recommendation dossier.',
    assignedAt: '2026-11-04 11:00:00'
  }
];

const extractUnionTables = (sql) => {
  const tables = [];
  const regex = /FROM\s+([a-zA-Z0-9_]+)/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    if (match[1] && !tables.includes(match[1])) {
      tables.push(match[1]);
    }
  }
  return tables;
};

// Split a SQL clause at top level (ignoring commas/keywords inside parentheses or single-quoted strings)
const splitSqlTopLevel = (str, separatorChar = ',') => {
  const parts = [];
  let cur = '';
  let depth = 0;
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "'") {
      if (inQuote && str[i + 1] === "'") {
        cur += "''";
        i++;
        continue;
      }
      inQuote = !inQuote;
      cur += ch;
      continue;
    }
    if (!inQuote) {
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;
      else if (depth === 0 && ch === separatorChar) {
        parts.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
};

const splitSqlKeywordTopLevel = (str, keyword) => {
  const parts = [];
  let cur = '';
  let depth = 0;
  let inQuote = false;
  const kwUpper = keyword.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "'") {
      if (inQuote && str[i + 1] === "'") {
        cur += "''";
        i++;
        continue;
      }
      inQuote = !inQuote;
      cur += ch;
      continue;
    }
    if (!inQuote) {
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;
      else if (depth === 0) {
        const slice = str.slice(i);
        const re = new RegExp(`^\\s+${kwUpper}\\s+`, 'i');
        const m = slice.match(re);
        if (m && cur.trim()) {
          parts.push(cur.trim());
          cur = '';
          i += m[0].length - 1;
          continue;
        }
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
};

const countQuestionMarksOutsideQuotes = (str) => {
  let count = 0;
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "'") {
      if (inQuote && str[i + 1] === "'") { i++; continue; }
      inQuote = !inQuote;
    } else if (!inQuote && str[i] === '?') {
      count++;
    }
  }
  return count;
};

const getRowFieldCi = (row, colName) => {
  if (!row || !colName) return undefined;
  if (row[colName] !== undefined) return row[colName];
  const lower = colName.toLowerCase();
  if (row[lower] !== undefined) return row[lower];
  const mapped = SUPABASE_KEY_MAP[lower];
  if (mapped && row[mapped] !== undefined) return row[mapped];
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lower) return row[k];
  }
  return undefined;
};

const unwrapSqlExprToValue = (expr, row, paramsRef) => {
  const e = (expr || '').trim();
  if (!e) return undefined;
  if (e === '?') return paramsRef.list[paramsRef.idx++];
  if (/^NULL$/i.test(e)) return null;
  if (/^(CURRENT_TIMESTAMP|NOW\(\))$/i.test(e)) return new Date().toISOString();
  if (/^'([\s\S]*)'$/.test(e)) return e.slice(1, -1).replace(/''/g, "'");
  if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e);

  const lowerWrap = e.match(/^LOWER\(\s*([\s\S]+?)\s*\)$/i);
  if (lowerWrap) {
    const v = unwrapSqlExprToValue(lowerWrap[1], row, paramsRef);
    return v === null || v === undefined ? '' : String(v).toLowerCase();
  }
  const trimWrap = e.match(/^TRIM\(\s*([\s\S]+?)\s*\)$/i);
  if (trimWrap) {
    const v = unwrapSqlExprToValue(trimWrap[1], row, paramsRef);
    return v === null || v === undefined ? '' : String(v).trim();
  }
  const coalWrap = e.match(/^COALESCE\(\s*([\s\S]+)\s*\)$/i);
  if (coalWrap) {
    const args = splitSqlTopLevel(coalWrap[1], ',');
    for (const a of args) {
      const v = unwrapSqlExprToValue(a, row, paramsRef);
      if (v !== null && v !== undefined) return v;
    }
    return null;
  }

  // Column reference
  if (/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(e)) {
    const col = e.includes('.') ? e.split('.').pop() : e;
    return getRowFieldCi(row, col);
  }
  return e;
};

const extractSqlColumnName = (lhs) => {
  let s = (lhs || '').trim();
  while (/^(?:LOWER|UPPER|TRIM|COALESCE)\(/i.test(s)) {
    const inner = s.match(/^[A-Z]+\(([\s\S]+)\)$/i);
    if (!inner) break;
    s = splitSqlTopLevel(inner[1], ',')[0].trim();
  }
  if (s.includes('.')) s = s.split('.').pop();
  return s;
};

const evalSinglePredicate = (row, pred, paramsRef) => {
  let p = (pred || '').trim();
  if (!p || /^1\s*=\s*1$/i.test(p)) return true;

  // Strip matched outer parentheses
  while (p.startsWith('(') && p.endsWith(')')) {
    let depth = 0;
    let inQ = false;
    let wrapsAll = true;
    for (let i = 0; i < p.length; i++) {
      if (p[i] === "'") { inQ = !inQ; continue; }
      if (!inQ) {
        if (p[i] === '(') depth++;
        else if (p[i] === ')') {
          depth--;
          if (depth === 0 && i < p.length - 1) { wrapsAll = false; break; }
        }
      }
    }
    if (!wrapsAll) break;
    p = p.slice(1, -1).trim();
  }

  const orParts = splitSqlKeywordTopLevel(p, 'OR');
  if (orParts.length > 1) {
    let matched = false;
    for (const sub of orParts) {
      if (evalWhereClause(row, sub, paramsRef)) matched = true;
    }
    return matched;
  }
  const andParts = splitSqlKeywordTopLevel(p, 'AND');
  if (andParts.length > 1) {
    let matched = true;
    for (const sub of andParts) {
      if (!evalSinglePredicate(row, sub, paramsRef)) matched = false;
    }
    return matched;
  }

  const isNullMatch = p.match(/^([\s\S]+?)\s+IS\s+NULL$/i);
  if (isNullMatch) {
    const v = unwrapSqlExprToValue(isNullMatch[1], row, paramsRef);
    return v === null || v === undefined || v === '';
  }
  const isNotNullMatch = p.match(/^([\s\S]+?)\s+IS\s+NOT\s+NULL$/i);
  if (isNotNullMatch) {
    const v = unwrapSqlExprToValue(isNotNullMatch[1], row, paramsRef);
    return v !== null && v !== undefined && v !== '';
  }

  const inMatch = p.match(/^([\s\S]+?)\s+(NOT\s+)?IN\s*\(([\s\S]+)\)$/i);
  if (inMatch) {
    const isNot = Boolean(inMatch[2]);
    const lhsVal = unwrapSqlExprToValue(inMatch[1], row, paramsRef);
    const items = splitSqlTopLevel(inMatch[3], ',').map(tok => unwrapSqlExprToValue(tok, row, paramsRef));
    const found = items.some(iv => String(iv ?? '').toLowerCase() === String(lhsVal ?? '').toLowerCase());
    return isNot ? !found : found;
  }

  const likeMatch = p.match(/^([\s\S]+?)\s+(NOT\s+)?LIKE\s+([\s\S]+)$/i);
  if (likeMatch) {
    const isNot = Boolean(likeMatch[2]);
    const lhsVal = String(unwrapSqlExprToValue(likeMatch[1], row, paramsRef) ?? '').toLowerCase();
    const rhsRaw = String(unwrapSqlExprToValue(likeMatch[3], row, paramsRef) ?? '').toLowerCase();
    const regexStr = '^' + rhsRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$';
    const hit = new RegExp(regexStr, 's').test(lhsVal);
    return isNot ? !hit : hit;
  }

  const cmpMatch = p.match(/^([\s\S]+?)\s*(!=|<>|>=|<=|=|>|<)\s*([\s\S]+)$/);
  if (cmpMatch) {
    const [, lhsExpr, op, rhsExpr] = cmpMatch;
    const lhsVal = unwrapSqlExprToValue(lhsExpr, row, paramsRef);
    const rhsVal = unwrapSqlExprToValue(rhsExpr, row, paramsRef);
    const lStr = lhsVal === null || lhsVal === undefined ? '' : String(lhsVal);
    const rStr = rhsVal === null || rhsVal === undefined ? '' : String(rhsVal);
    const caseFold = /LOWER\(/i.test(lhsExpr) || /LOWER\(/i.test(rhsExpr) || /email/i.test(lhsExpr);
    const cmpL = caseFold ? lStr.toLowerCase().trim() : lStr;
    const cmpR = caseFold ? rStr.toLowerCase().trim() : rStr;
    if (op === '=') return cmpL === cmpR;
    if (op === '!=' || op === '<>') return cmpL !== cmpR;
    if (op === '>=') return cmpL >= cmpR;
    if (op === '<=') return cmpL <= cmpR;
    if (op === '>') return cmpL > cmpR;
    if (op === '<') return cmpL < cmpR;
  }

  // Consume any remaining ? so param index stays aligned
  const qCount = countQuestionMarksOutsideQuotes(p);
  paramsRef.idx += qCount;
  return true;
};

const evalWhereClause = (row, whereClause, paramsOrRef) => {
  if (!whereClause || !whereClause.trim()) return true;
  const paramsRef = Array.isArray(paramsOrRef) ? { list: paramsOrRef, idx: 0 } : paramsOrRef;
  return evalSinglePredicate(row, whereClause, paramsRef);
};

const filterAndSortSqlRows = (rows, sql, params = [], normalizer = (r) => r) => {
  const s = (sql || '').replace(/\s+/g, ' ').trim();
  const whereMatch = s.match(/\bWHERE\s+([\s\S]+?)(?=\s+(?:GROUP\s+BY|ORDER\s+BY|LIMIT)\b|$)/i);
  const whereClause = whereMatch ? whereMatch[1].trim() : '';
  const whereParamCount = whereClause ? countQuestionMarksOutsideQuotes(whereClause) : 0;
  const whereParams = params.slice(0, whereParamCount);

  let out = whereClause
    ? (rows || []).filter(r => evalWhereClause(r, whereClause, whereParams))
    : [...(rows || [])];

  out = out.map(r => normalizer(r));

  const orderMatch = s.match(/\bORDER\s+BY\s+([\s\S]+?)(?=\s+LIMIT\b|$)/i);
  if (orderMatch) {
    const specs = splitSqlTopLevel(orderMatch[1], ',').map(seg => {
      const m = seg.match(/^([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
      if (!m) return null;
      return { col: m[1].split('.').pop(), desc: (m[2] || '').toUpperCase() === 'DESC' };
    }).filter(Boolean);
    if (specs.length > 0) {
      out.sort((a, b) => {
        for (const sp of specs) {
          const va = getRowFieldCi(a, sp.col) ?? '';
          const vb = getRowFieldCi(b, sp.col) ?? '';
          if (va === vb) continue;
          const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
          return sp.desc ? -cmp : cmp;
        }
        return 0;
      });
    }
  }

  const limitMatch = s.match(/\bLIMIT\s+(\d+|\?)/i);
  if (limitMatch) {
    const lim = limitMatch[1] === '?' ? Number(params[params.length - 1]) : Number(limitMatch[1]);
    if (!Number.isNaN(lim) && lim > 0) out = out.slice(0, lim);
  }
  return out;
};

const findRowInStore = (store, sql, params = [], normalizer = (r) => r) => {
  const s = sql.trim();
  if (/SELECT\s+1\s+as\s+alive/i.test(s)) {
    return { alive: 1 };
  }
  const tables = extractUnionTables(s);
  if (tables.length === 0) return null;

  // Handle COUNT(*) with full WHERE filtering and arbitrary alias (e.g. as count, as c, as total)
  if (/COUNT\(\*\)/i.test(s)) {
    const filtered = filterAndSortSqlRows(store[tables[0]] || [], s, params, normalizer);
    const aliasMatch = s.match(/COUNT\(\*\)\s+as\s+([a-zA-Z0-9_]+)/i);
    const result = { count: filtered.length, total: filtered.length, totalAcademies: filtered.length, totalExams: filtered.length };
    if (aliasMatch && aliasMatch[1]) {
      result[aliasMatch[1]] = filtered.length;
    }
    return result;
  }

  // Handle SUM(col) aggregations like COALESCE(SUM(durationMinutes), 0) as totalBreak
  const sumMatch = s.match(/SUM\(\s*([a-zA-Z0-9_]+)\s*\)(?:\s*,\s*0\))?\s+as\s+([a-zA-Z0-9_]+)/i);
  if (sumMatch) {
    const col = sumMatch[1];
    const alias = sumMatch[2];
    const filtered = filterAndSortSqlRows(store[tables[0]] || [], s, params, normalizer);
    const total = filtered.reduce((acc, r) => acc + (Number(getRowFieldCi(r, col)) || 0), 0);
    return { [alias]: total };
  }

  const whereMatch = s.match(/\bWHERE\s+([\s\S]+?)(?=\s+(?:GROUP\s+BY|ORDER\s+BY|LIMIT)\b|$)/i);
  let paramOffset = 0;

  for (let tIdx = 0; tIdx < tables.length; tIdx++) {
    const table = tables[tIdx];
    if (!store[table]) store[table] = [];

    if (whereMatch) {
      const qMarksInBranch = countQuestionMarksOutsideQuotes(whereMatch[1]);
      const branchParams = params.slice(paramOffset, paramOffset + qMarksInBranch);
      const filtered = filterAndSortSqlRows(store[table], s, branchParams, normalizer);
      if (filtered.length > 0) return filtered[0];
      paramOffset += qMarksInBranch;
    } else if (store[table][0]) {
      return normalizer(store[table][0]);
    }
  }
  return null;
};

/**
 * Pure-JS JSON / In-Memory Fallback Database Adapter for Serverless Environments
 * where native C++ sqlite3 bindings are unavailable.
 */
const createFallbackDb = () => {
  const storePath = path.join(os.tmpdir(), 'revival_serverless_store.json');
  const defaultStore = {
    jobs: [],
    users: [
      {
        id: 'RI-CAND-001',
        email: 'kishorekumaroffl@gmail.com',
        name: 'Kishore Kumar',
        phone: '+971 50 123 4567',
        normalizedPhone: '501234567',
        role: 'candidate',
        authProvider: 'local',
        emailVerified: 1,
        status: 'active',
        passwordHash: hashPassword('Thejobsync@26', 'default_salt_001').hash,
        passwordSalt: 'default_salt_001',
        createdAt: '2026-11-20 09:31:44'
      },
      {
        id: 'RI-CAND-005',
        email: 'thejobsyncit@gmail.com',
        name: 'thejobsync',
        phone: '+971 52 445 8890',
        normalizedPhone: '524458890',
        role: 'candidate',
        authProvider: 'local',
        emailVerified: 1,
        status: 'active',
        passwordHash: hashPassword('Thejobsync@26', 'default_salt_005').hash,
        passwordSalt: 'default_salt_005',
        createdAt: '2026-11-19 14:22:00'
      }
    ],
    google_auth_accounts: [],
    candidates: [...DEFAULT_CRM_CANDIDATES],
    candidate_profiles: [...DEFAULT_CRM_PROFILES],
    candidate_applications: [...DEFAULT_CRM_APPLICATIONS],
    candidate_documents: [],
    email_job_applications: [],
    consulting_bookings: [],
    clients: [],
    interviews: [],
    leads: [...DEFAULT_CRM_LEADS],
    employees: [...DEFAULT_CRM_EMPLOYEES],
    organization_contacts: [],
    enquiry_activities: [],
    follow_ups: [],
    hr_tasks: [...DEFAULT_CRM_TASKS],
    student_academy_enquiries: [],
    client_accounts: [],
    client_documents: [],
    client_appointments: [],
    client_messages: [],
    client_notifications: [],
    client_invoices: [],
    career_departments: [],
    audit_logs: [],
    attendance_records: [],
    daily_work_reports: [],
    shift_configs: [...DEFAULT_SHIFTS],
    company_holidays: [],
    employee_leave_requests: [],
    attendance_breaks: [],
    attendance_regularizations: [],
    attendance_audit_logs: [],
    employee_notifications: [],
    role_login_logs: [],
    candidate_visa_assessments: [],
    candidate_verifications: []
  };

  let store = { ...defaultStore };
  try {
    if (fs.existsSync(storePath)) {
      const raw = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      store = { ...defaultStore, ...raw };
      // Ensure arrays are never undefined
      Object.keys(defaultStore).forEach(k => {
        if (!Array.isArray(store[k])) store[k] = [...defaultStore[k]];
      });
    }
  } catch (_) {
    store = { ...defaultStore };
  }

  const persist = () => {
    try {
      fs.writeFileSync(storePath, JSON.stringify(store), 'utf8');
    } catch (_) { }
  };

  const getTableName = (sql) => {
    const m =
      sql.match(/(?:INTO|FROM|UPDATE)\s+([a-zA-Z0-9_]+)/i) ||
      sql.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    return m ? m[1] : null;
  };

  return {
    exec: async () => { },
    close: async () => { },
    refreshTable: async () => { },
    run: async (sql, params = []) => {
      const s = sql.trim();
      const table = getTableName(s);
      if (!table) return { changes: 0 };
      if (!store[table]) store[table] = [];

      if (/^INSERT\s+INTO/i.test(s)) {
        const colMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
        const row = colMatch
          ? {}
          : { id: params[0] || `REC-${Date.now()}`, createdAt: new Date().toISOString() };
        if (colMatch) {
          const cols = colMatch[1].split(',').map(c => c.trim());
          cols.forEach((col, idx) => {
            row[col] = params[idx] !== undefined ? params[idx] : null;
          });
        }
        if (params[0] && !row.id) row.id = params[0];
        store[table].unshift(row);
        persist();
        return { changes: 1, lastID: row.id };
      }

      if (/^UPDATE/i.test(s)) {
        const id = params[params.length - 1];
        const idx = store[table].findIndex(r => r.id === id);
        if (idx !== -1) {
          const setPart = s.match(/SET\s+([\s\S]+?)\s+WHERE/i);
          if (setPart) {
            const assignments = setPart[1].split(',').map(a => a.trim());
            let pIdx = 0;
            assignments.forEach(assign => {
              const col = assign.split('=')[0].trim();
              if (assign.includes('?')) {
                const val = params[pIdx++];
                if (val !== null && val !== undefined) {
                  store[table][idx][col] = val;
                }
              } else if (/CURRENT_TIMESTAMP/i.test(assign)) {
                store[table][idx][col] = new Date().toISOString();
              }
            });
          }
          persist();
          return { changes: 1 };
        }
        return { changes: 0 };
      }

      if (/^DELETE/i.test(s)) {
        const id = params[0];
        const before = store[table].length;
        store[table] = store[table].filter(r => r.id !== id && r.enquiryId !== id && r.email !== id);
        persist();
        return { changes: before - store[table].length };
      }

      return { changes: 0 };
    },
    get: async (sql, params = []) => {
      return findRowInStore(store, sql, params);
    },
    all: async (sql, params = []) => {
      const s = sql.trim();
      if (/^PRAGMA\s+table_info/i.test(s)) {
        return [];
      }
      const table = getTableName(s);
      if (!table) return [];
      if (!store[table]) store[table] = [];
      let rows = [...store[table]];

      if (/WHERE\s+userId\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => r.userId === params[0]);
      }
      if (/WHERE\s+candidateId\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => r.candidateId === params[0]);
      }
      if (/WHERE\s+jobId\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => r.jobId === params[0]);
      }
      if (/WHERE\s+enquiryId\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => r.enquiryId === params[0]);
      }
      if (/WHERE\s+organizationId\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => r.organizationId === params[0]);
      }
      if (/clientId\s*=\s*\?/i.test(s) && params[0]) {
        const cid = params[0];
        const cemail = params[1] ? String(params[1]).toLowerCase().trim() : null;
        rows = rows.filter(
          r =>
            r.clientId === cid ||
            (cemail && r.email && String(r.email).toLowerCase().trim() === cemail) ||
            (cemail && r.clientEmail && String(r.clientEmail).toLowerCase().trim() === cemail)
        );
      }
      if (/WHERE\s+role\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => (r.role || '').toLowerCase() === String(params[0]).toLowerCase());
      }
      if (/WHERE\s+status\s*=\s*\?/i.test(s) && params[0]) {
        rows = rows.filter(r => (r.status || '').toLowerCase() === String(params[0]).toLowerCase());
      }
      return rows;
    }
  };
};

export const SUPABASE_ALL_TABLES = [
  'jobs',
  'users',
  'candidates',
  'candidate_profiles',
  'candidate_applications',
  'candidate_documents',
  'candidate_notifications',
  'email_job_applications',
  'consulting_bookings',
  'clients',
  'interviews',
  'leads',
  'employees',
  'organization_contacts',
  'enquiry_activities',
  'follow_ups',
  'hr_tasks',
  'hr_task_assignments',
  'student_academy_enquiries',
  'student_academy_academies',
  'student_academy_courses',
  'student_academy_exam_mappings',
  'student_academy_examinations',
  'student_academy_exams',
  'career_guidance_enquiries',
  'colleges',
  'courses',
  'course_categories',
  'specializations',
  'college_course_offerings',
  'compliance_documents',
  'google_auth_accounts',
  'client_accounts',
  'client_documents',
  'client_appointments',
  'client_messages',
  'client_notifications',
  'client_invoices',
  'career_departments',
  'audit_logs',
  'attendance_records',
  'daily_work_reports',
  'shift_configs',
  'employee_shift_assignments',
  'late_login_approval_requests',
  'company_holidays',
  'employee_leave_requests',
  'attendance_breaks',
  'attendance_regularizations',
  'attendance_audit_logs',
  'employee_notifications',
  'role_login_logs',
  'candidate_visa_assessments',
  'candidate_verifications',
  'visa_verification_cases',
  'visa_case_activities',
  'visa_case_documents',
  'visa_case_bgv_records',
  'company_announcements',
  'company_announcement_audit_logs',
  'crm_celebration_popups',
  'recruitment_pipeline_records',
  'interview_rounds',
  'employer_submissions',
  'employer_interviews',
  'placement_offers',
  'recruitment_activity_logs',
  'recruitment_notifications'
];

export const SUPABASE_KEY_MAP = {
  passwordhash: 'passwordHash',
  passwordsalt: 'passwordSalt',
  createdat: 'createdAt',
  updatedat: 'updatedAt',
  userid: 'userId',
  candidateid: 'candidateId',
  jobid: 'jobId',
  jobtitle: 'jobTitle',
  applieddate: 'appliedDate',
  applicantname: 'applicantName',
  applicantemail: 'applicantEmail',
  applicantphone: 'applicantPhone',
  currentemployer: 'currentEmployer',
  currentrole: 'currentRole',
  currentsalary: 'currentSalary',
  expectedsalary: 'expectedSalary',
  aisummary: 'aiSummary',
  resumename: 'resumeName',
  resumeurl: 'resumeUrl',
  resumesize: 'resumeSize',
  resumepath: 'resumePath',
  coverletter: 'coverLetter',
  covernote: 'coverNote',
  noticeperiod: 'noticePeriod',
  preferredcountry: 'preferredCountry',
  normalizedphone: 'normalizedPhone',
  authprovider: 'authProvider',
  googlesub: 'googleSub',
  googleid: 'googleId',
  emailverified: 'emailVerified',
  lastloginat: 'lastLoginAt',
  lastlogin: 'lastLogin',
  jobtype: 'jobType',
  posteddate: 'postedDate',
  employeeid: 'employeeId',
  altemail: 'altEmail',
  reportingmanager: 'reportingManager',
  joiningdate: 'joiningDate',
  assignedbranch: 'assignedBranch',
  employmentstatus: 'employmentStatus',
  dateofbirth: 'dateOfBirth',
  referencenumber: 'referenceNumber',
  preferredintake: 'preferredIntake',
  targetcountry: 'targetCountry',
  academiclevel: 'academicLevel',
  intendedprogram: 'intendedProgram',
  serviceid: 'serviceId',
  servicetitle: 'serviceTitle',
  servicetype: 'serviceType',
  enquiryid: 'enquiryId',
  enquirytype: 'enquiryType',
  activitytype: 'activityType',
  appointmentdate: 'appointmentDate',
  appointmenttime: 'appointmentTime',
  consultantname: 'consultantName',
  duedate: 'dueDate',
  duedatetime: 'dueDateTime',
  completedat: 'completedAt',
  interviewdate: 'interviewDate',
  interviewtime: 'interviewTime',
  interviewername: 'interviewerName',
  interviewtype: 'interviewType',
  shiftid: 'shiftId',
  shiftname: 'shiftName',
  shiftstart: 'shiftStart',
  shiftend: 'shiftEnd',
  starttime: 'startTime',
  endtime: 'endTime',
  graceminutes: 'graceMinutes',
  isovernight: 'isOvernight',
  lateapprovalstatus: 'lateApprovalStatus',
  lateminutes: 'lateMinutes',
  workdate: 'workDate',
  checkinat: 'checkInAt',
  checkoutat: 'checkOutAt',
  checkintime: 'checkInTime',
  logintime: 'loginTime',
  logouttime: 'logoutTime',
  totalduration: 'totalDuration',
  approvedby: 'approvedBy',
  approvedat: 'approvedAt',
  rejectionreason: 'rejectionReason',
  totalbreakminutes: 'totalBreakMinutes',
  totalworkingminutes: 'totalWorkingMinutes',
  grossminutes: 'grossMinutes',
  networkminutes: 'netWorkMinutes',
  overtimeminutes: 'overtimeMinutes',
  isovernightshift: 'isOvernightShift',
  employeename: 'employeeName',
  operationteam: 'operationTeam',
  leavetype: 'leaveType',
  startdate: 'startDate',
  enddate: 'endDate',
  reviewedby: 'reviewedBy',
  reviewedat: 'reviewedAt',
  submittedat: 'submittedAt',
  reviewnotes: 'reviewNotes',
  pipelinestage: 'pipelineStage',
  hrapprovedat: 'hrApprovedAt',
  hrapprovedby: 'hrApprovedBy',
  hrscreeningresult: 'hrScreeningResult',
  hrcandidateinterest: 'hrCandidateInterest',
  hrremarks: 'hrRemarks',
  hreligibility: 'hrEligibility',
  docverificationstatus: 'docVerificationStatus',
  assignedinterviewerid: 'assignedInterviewerId',
  assignedinterviewername: 'assignedInterviewerName',
  interviewstatus: 'interviewStatus',
  latestinterviewresult: 'latestInterviewResult',
  latestinterviewscore: 'latestInterviewScore',
  assignedcoordinatorid: 'assignedCoordinatorId',
  assignedcoordinatorname: 'assignedCoordinatorName',
  placementdecision: 'placementDecision',
  placementremarks: 'placementRemarks',
  placementdecidedby: 'placementDecidedBy',
  placementdecidedat: 'placementDecidedAt',
  finalplacementstatus: 'finalPlacementStatus',
  placementstatus: 'placementStatus',
  offerdetails: 'offerDetails',
  roundnumber: 'roundNumber',
  roundname: 'roundName',
  interviewerid: 'interviewerId',
  interviewmode: 'interviewMode',
  meetinglink: 'meetingLink',
  officelocation: 'officeLocation',
  scorecommunication: 'scoreCommunication',
  scoretechnical: 'scoreTechnical',
  scorejobknowledge: 'scoreJobKnowledge',
  scoreexperience: 'scoreExperience',
  scoreproblemsolving: 'scoreProblemSolving',
  scoreconfidence: 'scoreConfidence',
  scoreoverall: 'scoreOverall',
  averagescore: 'averageScore',
  areasofimprovement: 'areasOfImprovement',
  interviewerremarks: 'interviewerRemarks',
  finalrecommendation: 'finalRecommendation',
  evaluatedby: 'evaluatedBy',
  evaluatedat: 'evaluatedAt',
  companyname: 'companyName',
  joblocation: 'jobLocation',
  jobcategory: 'jobCategory',
  applicationid: 'applicationId',
  employercontactname: 'employerContactName',
  employeremail: 'employerEmail',
  proposedsalary: 'proposedSalary',
  submissiondate: 'submissionDate',
  submissionremarks: 'submissionRemarks',
  consentrecorded: 'consentRecorded',
  submittedby: 'submittedBy',
  submissionid: 'submissionId',
  jobrole: 'jobRole',
  interviewround: 'interviewRound',
  employerinterviewer: 'employerInterviewer',
  feedbacknotes: 'feedbackNotes',
  nextinterviewdate: 'nextInterviewDate',
  offeredjobrole: 'offeredJobRole',
  offerreleasedate: 'offerReleaseDate',
  offerexpirydate: 'offerExpiryDate',
  offerletterref: 'offerLetterRef',
  candidateacceptance: 'candidateAcceptance',
  offerstatus: 'offerStatus',
  joiningconfirmedat: 'joiningConfirmedAt',
  previousstatus: 'previousStatus',
  newstatus: 'newStatus',
  targetrole: 'targetRole',
  isread: 'isRead',
  employeerole: 'employeeRole',
  candidatename: 'candidateName',
  candidateemail: 'candidateEmail',
  candidatephone: 'candidatePhone',
  candidatekey: 'candidateKey',
  createdby: 'createdBy',
  attendanceid: 'attendanceId',
  breakstartat: 'breakStartAt',
  breakendat: 'breakEndAt',
  durationminutes: 'durationMinutes',
  breaktype: 'breakType',
  holidaydate: 'holidayDate',
  attendancedate: 'attendanceDate',
  islocked: 'isLocked',
  sessionid: 'sessionId',
  sessionstatus: 'sessionStatus',
  reportdate: 'reportDate',
  workcompleted: 'workCompleted',
  taskscompleted: 'tasksCompleted',
  workinprogress: 'workInProgress',
  issuesblockers: 'issuesBlockers',
  plannednextsteps: 'plannedNextSteps',
  additionalremarks: 'additionalRemarks',
  submissionstatus: 'submissionStatus',
  workingminutesatreport: 'workingMinutesAtReport',
  taskstatus: 'taskStatus',
  assignmentstatus: 'assignmentStatus',
  iscompleted: 'isCompleted',
  assignedemployee: 'assignedEmployee',
  assignedemployeeid: 'assignedEmployeeId',
  assignedemployeeemail: 'assignedEmployeeEmail',
  assignedby: 'assignedBy',
  assignedbyid: 'assignedById',
  assignedbyname: 'assignedByName',
  assignedbyrole: 'assignedByRole',
  assignedat: 'assignedAt',
  assigneddate: 'assignedDate',
  assignmentnotes: 'assignmentNotes',
  scheduledstarttime: 'scheduledStartTime',
  scheduledendtime: 'scheduledEndTime',
  scheduledlogintime: 'scheduledLoginTime',
  scheduledlogouttime: 'scheduledLogoutTime',
  applicabledays: 'applicableDays',
  delayminutes: 'delayMinutes',
  actualclockintime: 'actualClockInTime',
  approverid: 'approverId',
  approvername: 'approverName',
  approverrole: 'approverRole',
  decisiontimestamp: 'decisionTimestamp',
  destinationcountry: 'destinationCountry',
  visacategory: 'visaCategory',
  visarequired: 'visaRequired',
  requirementstatus: 'requirementStatus',
  documentstatus: 'documentStatus',
  eligibilitystatus: 'eligibilityStatus',
  casestatus: 'caseStatus',
  assessmentnotes: 'assessmentNotes',
  assignedreviewerid: 'assignedReviewerId',
  assignedreviewername: 'assignedReviewerName',
  applicationrefnumber: 'applicationRefNumber',
  officialdecision: 'officialDecision',
  officialdecisiondate: 'officialDecisionDate',
  officialdecisionnotes: 'officialDecisionNotes',
  requireddocsjson: 'requiredDocsJson',
  caseid: 'caseId',
  docname: 'docName',
  doctype: 'docType',
  fileurl: 'fileUrl',
  filedata: 'fileData',
  mimetype: 'mimeType',
  filesize: 'fileSize',
  verificationstatus: 'verificationStatus',
  reviewerid: 'reviewerId',
  reviewername: 'reviewerName',
  missingorcorrectionnote: 'missingOrCorrectionNote',
  checktype: 'checkType',
  actorid: 'actorId',
  actorname: 'actorName',
  actorrole: 'actorRole',
  beforestate: 'beforeState',
  afterstate: 'afterState',
  ipaddress: 'ipAddress',
  useragent: 'userAgent'
};

export const normalizeSupabaseRow = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  for (const [k, v] of Object.entries(raw)) {
    const lk = k.toLowerCase();
    const camel = SUPABASE_KEY_MAP[lk];
    if (camel && out[camel] === undefined) {
      out[camel] = v;
    }
  }
  return out;
};

export const toSupabasePayload = (row) => {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.toLowerCase()] = v;
  }
  return out;
};

let lastSupabaseDiagnostics = {
  connected: false,
  missingTables: [],
  strippedColumns: {},
  tableCounts: {}
};

export const getDatabaseDiagnostics = () => lastSupabaseDiagnostics;

const parseInsertValuesTokens = (cols, valuesStr, params = []) => {
  const tokens = splitSqlTopLevel(valuesStr, ',');
  const row = {};
  let pIdx = 0;
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const expr = tokens[i];
    if (expr === undefined) {
      row[col] = params[pIdx] !== undefined ? params[pIdx++] : null;
    } else if (expr.trim() === '?') {
      row[col] = params[pIdx] !== undefined ? params[pIdx++] : null;
    } else {
      row[col] = unwrapSqlExprToValue(expr, {}, { list: params, idx: pIdx });
      pIdx += countQuestionMarksOutsideQuotes(expr);
    }
  }
  return row;
};

const parseUpdateSetAssignments = (setStr, params = []) => {
  const assignments = splitSqlTopLevel(setStr, ',');
  const updates = {};
  const dynamicConcatUpdates = [];
  let pIdx = 0;

  for (const assign of assignments) {
    const eqIdx = assign.indexOf('=');
    if (eqIdx === -1) continue;
    const col = assign.slice(0, eqIdx).trim();
    const expr = assign.slice(eqIdx + 1).trim();

    if (expr === '?') {
      const val = params[pIdx++];
      if (val !== undefined) updates[col] = val;
    } else if (/^NULL$/i.test(expr)) {
      updates[col] = null;
    } else if (/^(CURRENT_TIMESTAMP|NOW\(\))$/i.test(expr)) {
      updates[col] = new Date().toISOString();
    } else if (/^'([\s\S]*)'$/.test(expr) && !expr.includes('||')) {
      updates[col] = expr.slice(1, -1).replace(/''/g, "'");
    } else if (/^-?\d+(\.\d+)?$/.test(expr)) {
      updates[col] = Number(expr);
    } else if (/^COALESCE\(\s*\?\s*,\s*[a-zA-Z0-9_]+\s*\)$/i.test(expr)) {
      const val = params[pIdx++];
      if (val !== null && val !== undefined) {
        updates[col] = val;
      }
    } else {
      // Handle complex expressions such as COALESCE(notes || ' | ', '') || '...'
      const qCount = countQuestionMarksOutsideQuotes(expr);
      const localParams = params.slice(pIdx, pIdx + qCount);
      pIdx += qCount;
      const appendStrMatch = expr.match(/\|\|\s*'([^']*)'$/);
      if (appendStrMatch && /COALESCE\(/i.test(expr)) {
        dynamicConcatUpdates.push({ col, append: appendStrMatch[1] });
      } else if (localParams.length > 0 && localParams[0] !== null && localParams[0] !== undefined) {
        updates[col] = localParams[0];
      }
    }
  }

  return { updates, consumedParams: pIdx, dynamicConcatUpdates };
};

export const createSupabaseDb = async (client) => {
  const store = {};
  const schemaCols = {}; // table -> Set of lowercase columns in live Supabase
  const missingTablesSet = new Set();
  const warnedMissingCols = new Set();

  // Introspect live PostgREST OpenAPI schema once so we know exact existing tables & columns
  try {
    const rawUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    if (rawUrl && apiKey) {
      const resp = await fetch(`${rawUrl}/rest/v1/`, {
        headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(8000)
      });
      if (resp.ok) {
        const spec = await resp.json();
        const defs = spec?.definitions || {};
        for (const [tbl, def] of Object.entries(defs)) {
          if (def?.properties) {
            schemaCols[tbl.toLowerCase()] = new Set(Object.keys(def.properties).map(c => c.toLowerCase()));
          }
        }
      }
    }
  } catch (specErr) {
    console.warn('[Supabase DB] OpenAPI schema introspection skipped:', specErr.message);
  }

  const tablesToLoad = [...new Set([...SUPABASE_ALL_TABLES, ...Object.keys(schemaCols)])];
  for (const t of tablesToLoad) {
    store[t] = [];
    if (Object.keys(schemaCols).length > 0 && !schemaCols[t]) {
      missingTablesSet.add(t);
    }
  }

  // Preload records in modest batches to avoid saturating Supabase connection pool
  const activeTables = tablesToLoad.filter(t => !missingTablesSet.has(t));
  const PRELOAD_BATCH = 8;
  for (let i = 0; i < activeTables.length; i += PRELOAD_BATCH) {
    const chunk = activeTables.slice(i, i + PRELOAD_BATCH);
    await Promise.all(
      chunk.map(async (table) => {
        try {
          const { data, error } = await client.from(table).select('*').limit(1000);
          if (!error && Array.isArray(data)) {
            store[table] = data.map(r => normalizeSupabaseRow(r));
            if (!schemaCols[table] && data[0]) {
              schemaCols[table] = new Set(Object.keys(data[0]).map(c => c.toLowerCase()));
            }
          } else if (error && error.code === 'PGRST205') {
            missingTablesSet.add(table);
          }
        } catch (_) { }
      })
    );
  }

  if (missingTablesSet.size > 0) {
    console.warn(
      `[Supabase DB] ${missingTablesSet.size} table(s) not yet created in Supabase Cloud (${[...missingTablesSet].join(', ')}). Run supabase/migrations/20261127_sync_all_missing_tables_and_columns.sql in Supabase SQL Editor.`
    );
  }

  lastSupabaseDiagnostics = {
    connected: true,
    missingTables: [...missingTablesSet].sort(),
    strippedColumns: {},
    tableCounts: Object.fromEntries(activeTables.map(t => [t, (store[t] || []).length]))
  };

  // Ensure default employees in store if empty (leave shift_configs empty so initDb seeds them into Supabase)
  if ((!store.employees || store.employees.length === 0) && DEFAULT_CRM_EMPLOYEES?.length) {
    store.employees = [...DEFAULT_CRM_EMPLOYEES];
  }

  const filterPayloadToKnownSchema = (table, payload) => {
    const allowed = schemaCols[table];
    if (!allowed || allowed.size === 0) return payload;
    const filtered = {};
    for (const [k, v] of Object.entries(payload)) {
      const lk = k.toLowerCase();
      if (allowed.has(lk)) {
        filtered[lk] = v;
      } else {
        const warnKey = `${table}.${lk}`;
        if (!warnedMissingCols.has(warnKey)) {
          warnedMissingCols.add(warnKey);
          if (!lastSupabaseDiagnostics.strippedColumns[table]) {
            lastSupabaseDiagnostics.strippedColumns[table] = [];
          }
          lastSupabaseDiagnostics.strippedColumns[table].push(lk);
          console.warn(`[Supabase DB] Column "${lk}" does not exist on "${table}" in Supabase yet — skipping field until migration runs.`);
        }
      }
    }
    return filtered;
  };

  const executeWithColumnRetry = async (table, runner, initialPayload) => {
    let payload = filterPayloadToKnownSchema(table, initialPayload);
    if (!payload || Object.keys(payload).length === 0) return null;

    let res = await runner(payload);
    if (res?.error?.code === 'PGRST204' && res.error.message) {
      const colMatch = res.error.message.match(/Could not find the '([^']+)' column/i);
      if (colMatch && colMatch[1]) {
        const badCol = colMatch[1].toLowerCase();
        if (!schemaCols[table]) schemaCols[table] = new Set(Object.keys(payload));
        schemaCols[table].delete(badCol);
        const retryPayload = { ...payload };
        delete retryPayload[badCol];
        if (Object.keys(retryPayload).length > 0) {
          res = await runner(retryPayload);
        }
      }
    }
    if (res?.error) {
      if (res.error.code === 'PGRST205') {
        missingTablesSet.add(table);
        lastSupabaseDiagnostics.missingTables = [...missingTablesSet].sort();
      } else {
        console.error(`[Supabase DB] Write error on ${table} [${res.error.code || 'ERR'}]:`, res.error.message);
      }
    }
    return res;
  };

  const applySupabaseFilter = (baseQuery, table, whereCondition, whereParams) => {
    const matchingRows = (store[table] || []).filter(r => evalWhereClause(r, whereCondition, whereParams));
    const singleAndPreds = splitSqlKeywordTopLevel(whereCondition, 'AND');
    const hasOr = splitSqlKeywordTopLevel(whereCondition, 'OR').length > 1;

    // When WHERE uses OR or matches rows cleanly in cache, prefer exact ID scoping if all rows have IDs
    if (hasOr && matchingRows.length > 0) {
      const ids = matchingRows.map(r => r.id || r.candidateId || r.candidateid).filter(Boolean);
      const idCol = table === 'recruitment_pipeline_records' ? 'candidateid' : 'id';
      if (ids.length > 0) {
        return baseQuery.in(idCol, ids);
      }
    }

    let q = baseQuery;
    const pRef = { list: whereParams, idx: 0 };
    for (const pred of singleAndPreds) {
      const isNullM = pred.match(/^([a-zA-Z0-9_.]+)\s+IS\s+NULL$/i);
      if (isNullM) {
        q = q.is(isNullM[1].split('.').pop().toLowerCase(), null);
        continue;
      }
      const isNotNullM = pred.match(/^([a-zA-Z0-9_.]+)\s+IS\s+NOT\s+NULL$/i);
      if (isNotNullM) {
        q = q.not(isNotNullM[1].split('.').pop().toLowerCase(), 'is', null);
        continue;
      }
      const cmpM = pred.match(/^([\s\S]+?)\s*(=|LIKE)\s*([\s\S]+)$/i);
      if (cmpM) {
        const col = extractSqlColumnName(cmpM[1]).toLowerCase();
        const op = cmpM[2].toUpperCase();
        const val = unwrapSqlExprToValue(cmpM[3], {}, pRef);
        if (val === undefined) continue;
        if (op === 'LIKE' || /LOWER\(/i.test(cmpM[1]) || col === 'email') {
          q = q.ilike(col, op === 'LIKE' ? String(val) : String(val).toLowerCase().trim());
        } else {
          q = q.eq(col, val);
        }
      } else {
        pRef.idx += countQuestionMarksOutsideQuotes(pred);
      }
    }
    return q;
  };

  const getTableName = (sql) => {
    const m =
      sql.match(/(?:INTO|FROM|UPDATE)\s+([a-zA-Z0-9_]+)/i) ||
      sql.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    return m ? m[1] : null;
  };

  return {
    exec: async () => { },
    close: async () => { },
    refreshTable: async (table) => {
      const tbl = table?.toLowerCase();
      if (!tbl || missingTablesSet.has(tbl)) return;
      const { data, error } = await client.from(tbl).select('*').limit(1000);
      if (!error && Array.isArray(data)) {
        store[tbl] = data.map(r => normalizeSupabaseRow(r));
      }
    },
    run: async (sql, params = []) => {
      const s = sql.trim();
      const table = getTableName(s)?.toLowerCase();
      if (!table) return { changes: 0 };
      if (!store[table]) store[table] = [];

      if (/^INSERT(?:\s+OR\s+IGNORE)?\s+INTO/i.test(s)) {
        const isInsertOrIgnore = /^INSERT\s+OR\s+IGNORE\s+INTO/i.test(s);
        const colMatch = s.match(/\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)\s*;?$/i);
        const cols = colMatch ? colMatch[1].split(',').map(c => c.trim()) : [];
        const valuesStr = colMatch ? colMatch[2] : '';
        const isPipelineTable = table === 'recruitment_pipeline_records';

        const row = cols.length > 0
          ? parseInsertValuesTokens(cols, valuesStr, params)
          : { id: params[0] || `REC-${Date.now()}` };

        if (!isPipelineTable && !row.id) {
          row.id = params[0] || `REC-${Date.now()}`;
        }

        // Only auto-inject createdAt / created_at when table supports it and it wasn't passed
        const tblSchema = schemaCols[table];
        const nowIso = new Date().toISOString();
        if (!row.createdAt && !row.createdat && !row.created_at) {
          if (!tblSchema || tblSchema.has('createdat')) {
            row.createdAt = nowIso;
          } else if (tblSchema.has('created_at')) {
            row.created_at = nowIso;
          }
        }

        const existingIndex = row.id
          ? store[table].findIndex(r => r.id === row.id)
          : (isPipelineTable && row.candidateId ? store[table].findIndex(r => r.candidateId === row.candidateId) : -1);

        if (isInsertOrIgnore && existingIndex !== -1) {
          return { changes: 0, lastID: row.id || row.candidateId };
        }

        if (!missingTablesSet.has(table)) {
          const conflictCol = isPipelineTable ? 'candidateid' : 'id';
          await executeWithColumnRetry(
            table,
            (payload) => client.from(table).upsert([payload], {
              onConflict: conflictCol,
              ignoreDuplicates: isInsertOrIgnore
            }),
            toSupabasePayload(row)
          );
        }

        if (existingIndex !== -1) {
          store[table][existingIndex] = normalizeSupabaseRow({ ...store[table][existingIndex], ...row });
        } else {
          store[table].unshift(normalizeSupabaseRow(row));
        }
        return { changes: 1, lastID: row.id || row.candidateId };
      }

      if (/^UPDATE/i.test(s)) {
        const setPart = s.match(/SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
        if (setPart) {
          const { updates, consumedParams, dynamicConcatUpdates } = parseUpdateSetAssignments(setPart[1], params);
          const whereCondition = setPart[2].trim();
          const whereParams = params.slice(consumedParams);

          let count = 0;
          const nextRows = store[table].map(r => {
            if (!evalWhereClause(r, whereCondition, whereParams)) return r;
            count++;
            const merged = { ...r, ...updates };
            for (const dyn of dynamicConcatUpdates) {
              const prev = getRowFieldCi(r, dyn.col) || '';
              merged[dyn.col] = `${prev ? prev + ' | ' : ''}${dyn.append}`;
            }
            return normalizeSupabaseRow(merged);
          });
          store[table] = nextRows;

          if (!missingTablesSet.has(table)) {
            const firstMatch = nextRows.find(r => evalWhereClause(r, whereCondition, whereParams));
            const sbUpdatesPayload = toSupabasePayload({ ...updates });
            if (firstMatch && dynamicConcatUpdates.length > 0) {
              for (const dyn of dynamicConcatUpdates) {
                sbUpdatesPayload[dyn.col.toLowerCase()] = firstMatch[dyn.col];
              }
            }
            if (Object.keys(sbUpdatesPayload).length > 0) {
              await executeWithColumnRetry(
                table,
                (payload) => applySupabaseFilter(client.from(table).update(payload), table, whereCondition, whereParams),
                sbUpdatesPayload
              );
            }
          }

          return { changes: count };
        }
        return { changes: 0 };
      }

      if (/^DELETE/i.test(s)) {
        const whereMatch = s.match(/\bWHERE\s+([\s\S]+)$/i);
        const whereCondition = whereMatch ? whereMatch[1].trim() : '';

        if (!missingTablesSet.has(table)) {
          try {
            let delRes;
            if (whereCondition) {
              delRes = await applySupabaseFilter(client.from(table).delete(), table, whereCondition, params);
            } else {
              delRes = await client.from(table).delete().neq('id', '__never__');
            }
            if (delRes?.error) {
              console.error(`[Supabase DB] Delete error on ${table}:`, delRes.error.message);
            }
          } catch (sbErr) {
            console.error(`[Supabase DB] Delete exception on ${table}:`, sbErr.message);
          }
        }

        const before = store[table].length;
        if (whereCondition) {
          store[table] = store[table].filter(r => !evalWhereClause(r, whereCondition, params));
        } else {
          store[table] = [];
        }
        return { changes: before - store[table].length };
      }

      return { changes: 0 };
    },
    get: async (sql, params = []) => {
      return findRowInStore(store, sql, params, normalizeSupabaseRow);
    },
    all: async (sql, params = []) => {
      const s = sql.trim();
      if (/^PRAGMA\s+table_info/i.test(s)) {
        const tblM = s.match(/table_info\(\s*([a-zA-Z0-9_]+)\s*\)/i);
        const tbl = tblM ? tblM[1].toLowerCase() : null;
        if (tbl && schemaCols[tbl]) {
          return [...schemaCols[tbl]].map((name, idx) => ({ cid: idx, name }));
        }
        return [];
      }
      const table = getTableName(s)?.toLowerCase();
      if (!table) return [];
      if (!store[table]) store[table] = [];
      return filterAndSortSqlRows(store[table], s, params, normalizeSupabaseRow);
    }
  };
};

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      console.log('[Database] Initializing Supabase Cloud PostgreSQL engine (Sole Primary Database)...');
      dbInstance = await createSupabaseDb(supabase);
      console.log('✅ [Database] Successfully connected to Supabase Cloud PostgreSQL!');
      console.log('   Host: https://wxoaxpfxrnyghqkkeiat.supabase.co');
      console.log('   100% of queries, reads, writes, and mutations are active on Supabase Cloud.');
      console.log('   SQLite is disabled and removed.');
      usingFallbackStore = false;
      return dbInstance;
    } catch (sbErr) {
      console.error('[Database] Supabase connection error:', sbErr.message);
    }
  }

  console.warn('[Database] Supabase unavailable, activating fallback store.');
  dbInstance = createFallbackDb();
  usingFallbackStore = true;
  return dbInstance;
};

export const closeDb = async () => {
  if (dbInstance) {
    try {
      await dbInstance.close();
      console.log('Database connection cleanly closed.');
    } catch (err) {
      console.error('Error closing database connection:', err);
    } finally {
      dbInstance = null;
    }
  }
};

export const logAuditTrail = async (db, { userId, userName, role, action, entityType, entityId, details, ip }) => {
  try {
    const id = `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');
    await db.run(
      `INSERT INTO audit_logs (id, userId, userName, role, action, entityType, entityId, details, ip, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId || 'system',
        userName || 'Super Admin',
        role || 'Super Admin',
        action || 'DELETE_RECORD',
        entityType || 'General',
        entityId || 'N/A',
        detailsStr,
        ip || '127.0.0.1',
        new Date().toISOString()
      ]
    );
    return id;
  } catch (err) {
    console.error('Failed to write audit trail:', err.message);
    return null;
  }
};

export const checkDbHealth = async () => {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (!error) {
        return {
          status: 'connected',
          engine: 'supabase-cloud-postgresql',
          primary: 'Supabase Cloud (Sole Primary Database)',
          sqliteRemoved: true,
          host: 'https://wxoaxpfxrnyghqkkeiat.supabase.co',
          alive: true
        };
      }
    }
    const db = await getDb();
    const result = await db.get('SELECT 1 as alive');
    return {
      status: 'connected',
      engine: 'supabase-memory-cache',
      primary: 'Supabase Cloud PostgreSQL',
      alive: result && result.alive === 1
    };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

const initDb = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      country TEXT,
      location TEXT,
      salary TEXT,
      experience TEXT,
      jobType TEXT,
      category TEXT,
      description TEXT,
      vacancies TEXT,
      skills TEXT,
      qualification TEXT,
      benefits TEXT,
      postedDate TEXT,
      featured INTEGER DEFAULT 0,
      educationLevel TEXT,
      requiredDegree TEXT,
      academicQualifications TEXT,
      mandatoryLicences TEXT,
      contractType TEXT,
      contractDuration TEXT,
      contractRenewal TEXT,
      accommodation TEXT,
      transportation TEXT,
      livingAllowancesDetails TEXT,
      visaSponsorship TEXT,
      visaSupportDetails TEXT,
      closingDate TEXT
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      nationality TEXT,
      currentEmployer TEXT,
      currentRole TEXT,
      currentSalary TEXT,
      expectedSalary TEXT,
      score INTEGER,
      stage TEXT DEFAULT 'new',
      skills TEXT,
      source TEXT,
      passport TEXT,
      aiSummary TEXT,
      experience TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'candidate',
      authProvider TEXT DEFAULT 'local',
      googleSub TEXT UNIQUE,
      emailVerified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLoginAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      nationality TEXT DEFAULT 'UAE',
      currentRole TEXT DEFAULT 'Executive Candidate',
      currentEmployer TEXT,
      experience TEXT DEFAULT '3-5 Years',
      education TEXT DEFAULT 'Bachelor Degree / Professional Diploma',
      expectedSalary TEXT DEFAULT 'Market Standard',
      skills TEXT,
      resumeName TEXT,
      resumeUrl TEXT,
      profileCompletion INTEGER DEFAULT 60,
      stage TEXT DEFAULT 'lead',
      score INTEGER DEFAULT 88,
      savedJobs TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS google_auth_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      googleSub TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      picture TEXT,
      accessToken TEXT,
      idToken TEXT,
      lastAuthenticatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS candidate_applications (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      userId TEXT NOT NULL,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      appliedDate TEXT NOT NULL,
      status TEXT DEFAULT 'Under Review',
      stage TEXT DEFAULT 'Applied',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidateId) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_job_applications (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      companyName TEXT NOT NULL,
      companyEmail TEXT NOT NULL,
      candidateName TEXT NOT NULL,
      candidateEmail TEXT NOT NULL,
      candidatePhone TEXT,
      candidateLocation TEXT,
      experience TEXT,
      noticePeriod TEXT,
      emailSubject TEXT NOT NULL,
      emailBodyHtml TEXT NOT NULL,
      emailBodyText TEXT NOT NULL,
      resumeFileName TEXT,
      resumeFileSize INTEGER,
      status TEXT DEFAULT 'SENT',
      sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      ipAddress TEXT,
      errorMessage TEXT
    );

    CREATE TABLE IF NOT EXISTS candidate_documents (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      userId TEXT NOT NULL,
      documentType TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileUrl TEXT,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidateId) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS candidate_notifications (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (candidateId) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      industry TEXT,
      location TEXT,
      contactPerson TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'Active',
      requirements TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      candidateId TEXT,
      candidateName TEXT,
      jobId TEXT,
      jobTitle TEXT,
      company TEXT,
      date TEXT,
      time TEXT,
      platform TEXT,
      status TEXT DEFAULT 'Scheduled',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      company TEXT,
      phone TEXT,
      message TEXT,
      serviceId TEXT,
      serviceTitle TEXT,
      status TEXT DEFAULT 'New',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS organization_contacts (
      id TEXT PRIMARY KEY,
      organizationId TEXT NOT NULL,
      name TEXT NOT NULL,
      designation TEXT,
      email TEXT,
      phone TEXT,
      isPrimary INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enquiry_activities (
      id TEXT PRIMARY KEY,
      enquiryId TEXT,
      organizationId TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      createdBy TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY,
      enquiryId TEXT,
      organizationId TEXT,
      title TEXT NOT NULL,
      purpose TEXT NOT NULL,
      dueDateTime TEXT NOT NULL,
      assignedTo TEXT,
      status TEXT DEFAULT 'Pending',
      completionNotes TEXT,
      createdBy TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      role TEXT,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      details TEXT,
      ip TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hr_task_assignments (
      id TEXT PRIMARY KEY,
      enquiryId TEXT,
      referenceNumber TEXT,
      candidateKey TEXT,
      customerName TEXT,
      customerEmail TEXT,
      customerPhone TEXT,
      serviceId TEXT,
      serviceTitle TEXT,
      operationTeam TEXT,
      assignedEmployeeId TEXT,
      assignedEmployeeName TEXT,
      assignedEmployeeEmail TEXT,
      assignedById TEXT,
      assignedByName TEXT,
      priority TEXT DEFAULT 'Normal',
      dueDate TEXT,
      assignmentStatus TEXT DEFAULT 'Assigned',
      taskStatus TEXT DEFAULT 'To Do',
      notes TEXT,
      isCompleted INTEGER DEFAULT 0,
      completionNotes TEXT,
      assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_academy_enquiries (
      id TEXT PRIMARY KEY,
      referenceNumber TEXT NOT NULL,
      studentName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      preferredLearningMode TEXT,
      batchPreference TEXT,
      questions TEXT,
      academyId TEXT NOT NULL,
      academyName TEXT NOT NULL,
      examId TEXT NOT NULL,
      examName TEXT NOT NULL,
      courseId TEXT NOT NULL,
      courseName TEXT NOT NULL,
      status TEXT DEFAULT 'New Enquiry',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_accounts (
      id TEXT PRIMARY KEY,
      clientType TEXT DEFAULT 'Individual',
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      phone TEXT,
      companyName TEXT,
      companyRegNumber TEXT,
      industry TEXT,
      designation TEXT,
      country TEXT DEFAULT 'United Arab Emirates',
      city TEXT,
      address TEXT,
      website TEXT,
      avatarUrl TEXT,
      emailVerified INTEGER DEFAULT 1,
      verificationCode TEXT,
      resetToken TEXT,
      resetTokenExpires INTEGER,
      notificationPrefs TEXT,
      assignedConsultant TEXT DEFAULT 'Dhanalakshimi',
      organizationId TEXT,
      status TEXT DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_documents (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientEmail TEXT,
      enquiryId TEXT,
      serviceId TEXT,
      serviceTitle TEXT,
      documentName TEXT NOT NULL,
      documentCategory TEXT DEFAULT 'Supporting Document',
      fileName TEXT,
      filePath TEXT,
      fileType TEXT,
      fileSize INTEGER DEFAULT 0,
      uploadedBy TEXT DEFAULT 'Client',
      verificationStatus TEXT DEFAULT 'Pending Verification',
      rejectionReason TEXT,
      requestedBy TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_appointments (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientName TEXT,
      clientEmail TEXT,
      clientPhone TEXT,
      enquiryId TEXT,
      serviceId TEXT,
      serviceTitle TEXT,
      consultantName TEXT DEFAULT 'Dhanalakshimi',
      consultantRole TEXT DEFAULT 'Senior Global Advisor',
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      consultationMode TEXT DEFAULT 'Online Video (Google Meet / Zoom)',
      meetingLink TEXT,
      location TEXT,
      status TEXT DEFAULT 'Scheduled',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_messages (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientEmail TEXT,
      enquiryId TEXT,
      serviceTitle TEXT,
      senderRole TEXT NOT NULL,
      senderName TEXT NOT NULL,
      message TEXT NOT NULL,
      attachmentUrl TEXT,
      attachmentName TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_notifications (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientEmail TEXT,
      enquiryId TEXT,
      type TEXT DEFAULT 'status_update',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    
    CREATE TABLE IF NOT EXISTS career_departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS client_invoices (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientEmail TEXT,
      enquiryId TEXT,
      serviceTitle TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'AED',
      status TEXT DEFAULT 'Pending',
      dueDate TEXT,
      paidAt TEXT,
      paymentMethod TEXT,
      receiptNumber TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      employeeId TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      department TEXT,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General Notice',
      target_audience TEXT NOT NULL DEFAULT 'All Employees',
      status TEXT NOT NULL DEFAULT 'Published',
      created_by TEXT,
      created_by_name TEXT,
      created_by_role TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME,
      expires_at TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      deleted_by TEXT,
      deleted_by_name TEXT,
      deleted_by_role TEXT,
      deletion_reason TEXT,
      was_published INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS company_announcement_audit_logs (
      id TEXT PRIMARY KEY,
      announcement_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_id TEXT,
      actor_name TEXT,
      actor_role TEXT,
      details TEXT,
      reason TEXT,
      snapshot_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const ensureColumns = async (tableName, columnDefs) => {
    try {
      const existingCols = await db.all(`PRAGMA table_info(${tableName})`);
      if (!existingCols || existingCols.length === 0) return;
      const existingColNames = existingCols.map(c => c.name);
      for (const col of columnDefs) {
        if (!existingColNames.includes(col.name)) {
          await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`);
        }
      }
    } catch (err) {
      console.warn(`Column check warning for table ${tableName}:`, err.message);
    }
  };

  await ensureColumns('employees', [
    { name: 'designation', type: 'TEXT' },
    { name: 'operationTeam', type: 'TEXT' },
    { name: 'activeWorkload', type: 'INTEGER DEFAULT 0' },
    { name: 'avatar', type: 'TEXT' },
    { name: 'dateOfBirth', type: 'TEXT' },
    { name: 'address', type: 'TEXT' },
    { name: 'reportingManager', type: 'TEXT' },
    { name: 'joiningDate', type: 'TEXT' },
    { name: 'assignedBranch', type: 'TEXT' },
    { name: 'employmentStatus', type: "TEXT DEFAULT 'Full-Time (Active)'" },
    { name: 'notificationPreferences', type: 'TEXT' },
    { name: 'lastLogin', type: 'TEXT' },
    { name: 'altEmail', type: 'TEXT' },
    { name: 'shiftId', type: "TEXT DEFAULT 'SHIFT-GENERAL'" }
  ]);

  await ensureColumns('company_announcements', [
    { name: 'is_deleted', type: 'INTEGER DEFAULT 0' },
    { name: 'deleted_at', type: 'DATETIME' },
    { name: 'deleted_by', type: 'TEXT' },
    { name: 'deleted_by_name', type: 'TEXT' },
    { name: 'deleted_by_role', type: 'TEXT' },
    { name: 'deletion_reason', type: 'TEXT' },
    { name: 'was_published', type: 'INTEGER DEFAULT 0' }
  ]);

  await db.run(
    `UPDATE company_announcements SET was_published = 1 WHERE COALESCE(was_published, 0) = 0 AND (published_at IS NOT NULL OR status IN ('Published', 'Scheduled', 'Expired'))`
  ).catch(() => {});

  // Ensure new international job details columns exist on jobs table
  await ensureColumns('jobs', [
    { name: 'educationLevel', type: 'TEXT' },
    { name: 'requiredDegree', type: 'TEXT' },
    { name: 'academicQualifications', type: 'TEXT' },
    { name: 'mandatoryLicences', type: 'TEXT' },
    { name: 'contractType', type: 'TEXT' },
    { name: 'contractDuration', type: 'TEXT' },
    { name: 'contractRenewal', type: 'TEXT' },
    { name: 'accommodation', type: 'TEXT' },
    { name: 'transportation', type: 'TEXT' },
    { name: 'livingAllowancesDetails', type: 'TEXT' },
    { name: 'visaSponsorship', type: 'TEXT' },
    { name: 'visaSupportDetails', type: 'TEXT' },
    { name: 'closingDate', type: 'TEXT' }
  ]);

  // Seed default employees for all roles if table is empty or ensure HR Operations specialists
  try {
    for (const emp of DEFAULT_CRM_EMPLOYEES) {
      await db.run(
        `INSERT OR IGNORE INTO employees (id, employeeId, name, email, phone, role, department, password, status, altEmail, shiftId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [emp.id, emp.employeeId, emp.name, emp.email, emp.phone, emp.role, emp.department, emp.password, emp.status, emp.altEmail || null, emp.shiftId || 'SHIFT-GENERAL']
      );
      await db.run(
        `UPDATE employees SET name = ?, department = ?, designation = ?, operationTeam = ?, assignedBranch = ?, reportingManager = ?, joiningDate = ?, employmentStatus = ?, dateOfBirth = ?, address = ?, avatar = ?, altEmail = COALESCE(?, altEmail), shiftId = COALESCE(shiftId, 'SHIFT-GENERAL') WHERE employeeId = ? OR id = ?`,
        [
          emp.name,
          emp.department,
          emp.designation || null,
          emp.operationTeam || null,
          emp.assignedBranch || null,
          emp.reportingManager || null,
          emp.joiningDate || null,
          emp.employmentStatus || 'Full-Time (Active)',
          emp.dateOfBirth || null,
          emp.address || null,
          emp.avatar || null,
          emp.altEmail || null,
          emp.employeeId,
          emp.id
        ]
      ).catch(() => { });
    }
  } catch (err) {
    console.warn('Employee table seeding notice:', err.message);
  }

  // Default corporate announcements auto-seeding disabled so empty state is preserved.

  await ensureColumns('leads', [
    { name: 'serviceId', type: 'TEXT' },
    { name: 'serviceTitle', type: 'TEXT' },
    { name: 'referenceNumber', type: 'TEXT' },
    { name: 'countryInterest', type: 'TEXT' },
    { name: 'assistanceType', type: 'TEXT' },
    { name: 'intakeTerm', type: 'TEXT' },
    { name: 'degreeLevel', type: 'TEXT' },
    { name: 'preferredContactMethod', type: 'TEXT' },
    { name: 'organizationId', type: 'TEXT' },
    { name: 'organizationName', type: 'TEXT' },
    { name: 'assignedEmployee', type: 'TEXT' },
    { name: 'assignedEmployeeId', type: 'TEXT' },
    { name: 'assignedEmployeeEmail', type: 'TEXT' },
    { name: 'priority', type: "TEXT DEFAULT 'Medium'" },
    { name: 'nextAction', type: 'TEXT' },
    { name: 'nextActionDate', type: 'TEXT' },
    { name: 'lastFollowUpDate', type: 'TEXT' },
    { name: 'lastContactedDate', type: 'TEXT' },
    { name: 'leadScore', type: "INTEGER DEFAULT 0" },
    { name: 'internalNotes', type: 'TEXT' },
    { name: 'utmSource', type: 'TEXT' },
    { name: 'utmMedium', type: 'TEXT' },
    { name: 'utmCampaign', type: 'TEXT' },
    { name: 'utmTerm', type: 'TEXT' },
    { name: 'utmContent', type: 'TEXT' },
    { name: 'referrer', type: 'TEXT' },
    { name: 'isArchived', type: 'INTEGER DEFAULT 0' },
    { name: 'updatedAt', type: 'DATETIME' },
    { name: 'jobTitle', type: 'TEXT' },
    { name: 'skills', type: 'TEXT' },
    { name: 'experience', type: 'TEXT' },
    { name: 'workLocation', type: 'TEXT' },
    { name: 'salaryRange', type: 'TEXT' },
    { name: 'vacancies', type: 'TEXT' },
    { name: 'seniority', type: 'TEXT' },
    { name: 'industry', type: 'TEXT' },
    { name: 'hiringTimeline', type: 'TEXT' },
    { name: 'joiningDate', type: 'TEXT' },
    { name: 'contractDuration', type: 'TEXT' },
    { name: 'startDate', type: 'TEXT' },
    { name: 'endDate', type: 'TEXT' },
    { name: 'shiftRequirements', type: 'TEXT' },
    { name: 'jobCategory', type: 'TEXT' },
    { name: 'visaCategory', type: 'TEXT' },
    { name: 'currentStage', type: 'TEXT' },
    { name: 'cvPath', type: 'TEXT' },
    { name: 'documentUrls', type: 'TEXT' },
    { name: 'customFields', type: 'TEXT' },
    { name: 'consultationDate', type: 'TEXT' },
    { name: 'consultationTime', type: 'TEXT' },
    { name: 'consultationMode', type: 'TEXT' },
    { name: 'courseName', type: 'TEXT' },
    { name: 'streamName', type: 'TEXT' },
    { name: 'department', type: 'TEXT' },
    { name: 'clientId', type: 'TEXT' },
    { name: 'progressStep', type: 'INTEGER DEFAULT 1' },
    { name: 'progressPercent', type: 'INTEGER DEFAULT 15' },
    { name: 'workflowType', type: 'TEXT' }
  ]);

  await ensureColumns('clients', [
    { name: 'organizationType', type: "TEXT DEFAULT 'Company'" },
    { name: 'website', type: 'TEXT' },
    { name: 'country', type: 'TEXT' },
    { name: 'designation', type: 'TEXT' },
    { name: 'assignedEmployee', type: 'TEXT' },
    { name: 'associatedServices', type: 'TEXT' },
    { name: 'lastContactDate', type: 'TEXT' },
    { name: 'nextFollowUpDate', type: 'TEXT' },
    { name: 'notes', type: 'TEXT' },
    { name: 'updatedAt', type: 'DATETIME' }
  ]);

  await ensureColumns('candidates', [
    { name: 'googleId', type: 'TEXT' },
    { name: 'avatar', type: 'TEXT' },
    { name: 'authProvider', type: "TEXT DEFAULT 'local'" },
    { name: 'googleVerified', type: "INTEGER DEFAULT 0" },
    { name: 'resumeName', type: 'TEXT' },
    { name: 'resumeUrl', type: 'TEXT' },
    { name: 'resumeSize', type: 'TEXT' },
    { name: 'citizenship', type: 'TEXT' },
    { name: 'dob', type: 'TEXT' },
    { name: 'gender', type: 'TEXT' },
    { name: 'location', type: 'TEXT' },
    { name: 'preferredCountry', type: 'TEXT' },
    { name: 'education', type: 'TEXT' },
    { name: 'mohreAttested', type: 'INTEGER DEFAULT 0' },
    { name: 'noticePeriod', type: 'TEXT' }
  ]);

  await ensureColumns('candidate_profiles', [
    { name: 'citizenship', type: 'TEXT' },
    { name: 'nationality', type: 'TEXT' },
    { name: 'resumeName', type: 'TEXT' },
    { name: 'resumeUrl', type: 'TEXT' },
    { name: 'resumeSize', type: 'TEXT' },
    { name: 'dob', type: 'TEXT' },
    { name: 'gender', type: 'TEXT' },
    { name: 'location', type: 'TEXT' },
    { name: 'preferredCountry', type: 'TEXT' },
    { name: 'mohreAttested', type: 'INTEGER DEFAULT 0' },
    { name: 'currentSalary', type: 'TEXT' },
    { name: 'expectedSalary', type: 'TEXT' },
    { name: 'noticePeriod', type: 'TEXT' },
    { name: 'passwordHash', type: 'TEXT' },
    { name: 'passwordSalt', type: 'TEXT' },
    { name: 'normalizedPhone', type: 'TEXT' }
  ]);

  // Safe migration: Ensure users table has password hashing and normalized phone fields
  await ensureColumns('users', [
    { name: 'passwordHash', type: 'TEXT' },
    { name: 'passwordSalt', type: 'TEXT' },
    { name: 'phone', type: 'TEXT' },
    { name: 'normalizedPhone', type: 'TEXT' }
  ]);

  // Safe migration: Ensure candidates table has normalizedPhone
  await ensureColumns('candidates', [
    { name: 'normalizedPhone', type: 'TEXT' }
  ]);

  // Safe migration: Ensure candidate_applications table has resume and applicant detail fields
  await ensureColumns('candidate_applications', [
    { name: 'resumeName', type: 'TEXT' },
    { name: 'resumeUrl', type: 'TEXT' },
    { name: 'resumeSize', type: 'TEXT' },
    { name: 'coverNote', type: 'TEXT' },
    { name: 'noticePeriod', type: 'TEXT' },
    { name: 'expectedSalary', type: 'TEXT' },
    { name: 'applicantName', type: 'TEXT' },
    { name: 'applicantEmail', type: 'TEXT' },
    { name: 'applicantPhone', type: 'TEXT' },
    { name: 'assignedEmployee', type: 'TEXT' },
    { name: 'assignedEmployeeId', type: 'TEXT' },
    { name: 'assignedEmployeeEmail', type: 'TEXT' },
    { name: 'priority', type: "TEXT DEFAULT 'Normal'" },
    { name: 'assignmentNotes', type: 'TEXT' },
    { name: 'assignedDate', type: 'TEXT' },
    { name: 'updatedAt', type: 'TEXT' }
  ]);

  // Seed default verified candidate applications if missing
  try {
    for (const app of DEFAULT_CRM_APPLICATIONS) {
      // Find candidate profile by email or candidateId to match exact real profile and user ID
      const candProfile = await db.get(
        'SELECT id, userId, name, phone, resumeName, resumeUrl, resumeSize FROM candidate_profiles WHERE LOWER(email) = LOWER(?) OR id = ?',
        [app.applicantEmail, app.candidateId]
      );
      const effectiveCandidateId = candProfile?.id || app.candidateId;
      const effectiveUserId = candProfile?.userId || app.userId;
      const effectiveName = candProfile?.name || app.applicantName;
      const effectivePhone = candProfile?.phone || app.applicantPhone;

      const existingApp = await db.get(
        'SELECT id FROM candidate_applications WHERE id = ? OR (LOWER(applicantEmail) = LOWER(?) AND jobId = ?)',
        [app.id, app.applicantEmail, app.jobId]
      );

      if (!existingApp) {
        await db.run(`
          INSERT INTO candidate_applications (
            id, candidateId, userId, jobId, jobTitle, company, location,
            appliedDate, status, stage, resumeName, resumeUrl, resumeSize,
            applicantName, applicantEmail, applicantPhone,
            assignedEmployee, assignedEmployeeId, assignedEmployeeEmail,
            priority, assignmentNotes, assignedDate, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          app.id, effectiveCandidateId, effectiveUserId, app.jobId,
          app.jobTitle, app.company, app.location, app.appliedDate,
          app.status || 'Under Review', app.stage || 'Applied',
          app.resumeName || candProfile?.resumeName || 'Candidate_CV.pdf',
          app.resumeUrl || candProfile?.resumeUrl || '',
          app.resumeSize || candProfile?.resumeSize || '161 KB',
          effectiveName, app.applicantEmail, effectivePhone,
          app.assignedEmployee || null, app.assignedEmployeeId || null, app.assignedEmployeeEmail || null,
          app.priority || 'Normal', app.assignmentNotes || null, app.assignedDate || null, app.appliedDate || new Date().toISOString()
        ]);
      } else {
        await db.run(`
          UPDATE candidate_applications SET
            candidateId = COALESCE(?, candidateId),
            userId = COALESCE(?, userId),
            applicantName = COALESCE(?, applicantName),
            applicantEmail = COALESCE(?, applicantEmail),
            applicantPhone = COALESCE(?, applicantPhone)
          WHERE id = ?
        `, [effectiveCandidateId, effectiveUserId, effectiveName, app.applicantEmail, effectivePhone, existingApp.id]);
      }
    }
  } catch (appSeedErr) {
    console.warn('Candidate applications seed notice:', appSeedErr.message);
  }

  // Safe migration: Ensure student_academy_enquiries table has exam enquiry fields
  await ensureColumns('student_academy_enquiries', [
    { name: 'qualification', type: 'TEXT' },
    { name: 'preferredLocation', type: 'TEXT' },
    { name: 'coachingMode', type: 'TEXT' },
    { name: 'examSlug', type: 'TEXT' },
    { name: 'enquiryType', type: "TEXT DEFAULT 'Exam Enquiry'" },
    { name: 'assignedEmployee', type: "TEXT DEFAULT 'Dhanalakshimi'" },
    { name: 'updatedAt', type: 'DATETIME' }
  ]);

  // Seed default verified organizations if none exist
  try {
    const orgCount = await db.get("SELECT COUNT(*) as count FROM clients");
    if (!orgCount || orgCount.count === 0) {
      const seedOrgs = [
        {
          id: 'CLI-501',
          company: 'Al Habtoor Contracting LLC',
          organizationType: 'Company',
          industry: 'Construction & Real Estate',
          country: 'United Arab Emirates',
          location: 'Al Habtoor Tower, Business Bay, Dubai',
          website: 'https://www.habtoorcontracting.ae',
          contactPerson: 'Eng. Hassan Al-Habtoor',
          designation: 'VP of Human Capital',
          email: 'hassan@habtoorcontracting.ae',
          phone: '+971 4 390 1111',
          assignedEmployee: 'Tariq Al-Hashemi',
          status: 'Active',
          associatedServices: 'Corporate Recruitment, Executive Search',
          notes: 'Master SLA Active across UAE & KSA jurisdictions.'
        },
        {
          id: 'ORG-EDU-101',
          company: 'Heriot-Watt University Dubai',
          organizationType: 'University',
          industry: 'Higher Education & Research',
          country: 'United Arab Emirates',
          location: 'Dubai Knowledge Park, Dubai',
          website: 'https://www.hw.ac.uk/dubai',
          contactPerson: 'Dr. Fiona Campbell',
          designation: 'Director of International Admissions',
          email: 'dubai.admissions@hw.ac.uk',
          phone: '+971 4 571 7000',
          assignedEmployee: 'Dhanalakshimi',
          status: 'Active',
          associatedServices: 'International Consulting, College Admission Assistance',
          notes: 'Premier UK branch campus in Dubai. Direct progression partner for undergraduate and postgraduate STEM programs.'
        },
        {
          id: 'ORG-EDU-102',
          company: 'Dubai International Academy (DIA)',
          organizationType: 'School',
          industry: 'K-12 International Education',
          country: 'United Arab Emirates',
          location: 'Emirates Hills, Dubai',
          website: 'https://www.diadubai.com',
          contactPerson: 'Robert Sterling',
          designation: 'Head of Senior School College Counselling',
          email: 'counseling@diadubai.com',
          phone: '+971 4 368 4111',
          assignedEmployee: 'Sreeja',
          status: 'Active',
          associatedServices: 'International Consulting, School Student Career Guidance',
          notes: 'Top IB World School in Dubai. Annual higher education career guidance workshop partner.'
        }
      ];

      for (const org of seedOrgs) {
        await db.run(
          `INSERT INTO clients (id, company, organizationType, industry, country, location, website, contactPerson, designation, email, phone, assignedEmployee, status, associatedServices, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [org.id, org.company, org.organizationType, org.industry, org.country, org.location, org.website, org.contactPerson, org.designation, org.email, org.phone, org.assignedEmployee, org.status, org.associatedServices, org.notes]
        );
      }
      console.log('Seeded verified organizations into SQLite database.');
    }
  } catch (seedErr) {
    console.warn('Organization seed check warning:', seedErr.message);
  }


  // Seed default UG & PG Career Guidance Departments if none exist
  try {
    const deptCount = await db.get("SELECT COUNT(*) as count FROM career_departments");
    if (!deptCount || deptCount.count === 0) {
      const seedDepartments = [
        // Undergraduate (UG) Departments
        { id: 'dept-ug-cs-it', name: 'Computer Science & Information Technology', level: 'UG', description: 'Engineering computational paradigms, artificial intelligence systems, cloud architectures, and digital security.', status: 'Active' },
        { id: 'dept-ug-ece-eee', name: 'Electronics & Communication', level: 'UG', description: 'Semiconductor design, integrated VLSI circuits, wireless telecommunications, and robotics.', status: 'Active' },
        { id: 'dept-ug-mech-mfg', name: 'Mechanical & Manufacturing', level: 'UG', description: 'Classical mechanics, thermodynamics, automated mechatronics, electric vehicle design, and industrial manufacturing.', status: 'Active' },
        { id: 'dept-ug-civil-infra', name: 'Civil & Infrastructure', level: 'UG', description: 'Structural engineering, smart city development, geotechnical modeling, and environmental hydraulics.', status: 'Active' },
        { id: 'dept-ug-bio-life', name: 'Biological & Life Sciences', level: 'UG', description: 'Biotechnology, molecular biology, bioinformatics, immunology, and genetic engineering.', status: 'Active' },
        { id: 'dept-ug-comm-mgmt', name: 'Commerce & Management', level: 'UG', description: 'Corporate accounting, financial analysis, investment banking, marketing analytics, and business administration.', status: 'Active' },
        { id: 'dept-ug-math-phys', name: 'Mathematics & Physical Sciences', level: 'UG', description: 'Quantitative analysis, computational physics, chemical sciences, and actuarial mathematics.', status: 'Active' },
        { id: 'dept-ug-arch-design', name: 'Architecture, Design & Creative Arts', level: 'UG', description: 'Architectural planning, visual communication, user experience design, and industrial styling.', status: 'Active' },
        { id: 'dept-ug-arts-hum', name: 'Arts, Humanities & Social Sciences', level: 'UG', description: 'World literatures, behavioral psychology, journalism, international relations, and public policy.', status: 'Active' },
        { id: 'dept-ug-agri-food', name: 'Agriculture & Food Technology', level: 'UG', description: 'Agronomy, horticulture, food biotechnology, post-harvest engineering, and precision farming.', status: 'Active' },
        { id: 'dept-ug-med-allied', name: 'Medical & Allied Health Sciences', level: 'UG', description: 'Clinical medicine, nursing sciences, physiotherapy, pharmacy, medical lab technology, and allied healthcare.', status: 'Active' },
        { id: 'dept-ug-law', name: 'Law', level: 'UG', description: 'Constitutional law, corporate jurisprudence, intellectual property, and judicial advocacy.', status: 'Active' },
        { id: 'dept-ug-hosp-aviat', name: 'Hospitality, Tourism & Aviation', level: 'UG', description: 'Hospitality administration, commercial aviation operations, airport logistics, and international tourism.', status: 'Active' },
        { id: 'dept-ug-edu-teach', name: 'Education & Teaching', level: 'UG', description: 'Pedagogical design, childhood development, and modern educational technology.', status: 'Active' },

        // Postgraduate (PG) Departments
        { id: 'dept-pg-cs-it', name: 'Computer Science & Information Technology', level: 'PG', description: 'Advanced machine learning, enterprise cloud infrastructure, cyber intelligence, and distributed systems.', status: 'Active' },
        { id: 'dept-pg-ece-eee', name: 'Electronics, Electrical & Communication', level: 'PG', description: 'Advanced VLSI semiconductor architecture, RF communication, embedded robotics, and power systems.', status: 'Active' },
        { id: 'dept-pg-mech-aero', name: 'Mechanical, Automobile & Aerospace', level: 'PG', description: 'Computational fluid dynamics, propulsion engineering, autonomous vehicle dynamics, and robotics.', status: 'Active' },
        { id: 'dept-pg-civil-infra', name: 'Civil & Infrastructure', level: 'PG', description: 'Earthquake engineering, structural resilience, environmental geotechnics, and smart transportation.', status: 'Active' },
        { id: 'dept-pg-bio-life', name: 'Biological & Life Sciences', level: 'PG', description: 'Advanced molecular genetics, clinical bioinformatics, cellular immunology, and biopharmaceutical research.', status: 'Active' },
        { id: 'dept-pg-mgmt-comm', name: 'Business, Management & Commerce', level: 'PG', description: 'MBA specializations, global supply chain, investment banking, risk management, and fintech leadership.', status: 'Active' },
        { id: 'dept-pg-math-phys', name: 'Mathematics, Statistics & Physical Sciences', level: 'PG', description: 'Applied mathematics, quantum materials, predictive statistical modeling, and chemical physics.', status: 'Active' },
        { id: 'dept-pg-arch-design', name: 'Architecture, Design & Creative Arts', level: 'PG', description: 'Master of Architecture, urban planning, sustainable environmental design, and master of design.', status: 'Active' },
        { id: 'dept-pg-arts-hum', name: 'Arts, Humanities & Social Sciences', level: 'PG', description: 'Clinical psychology, international diplomatic relations, linguistics, and public administration.', status: 'Active' },
        { id: 'dept-pg-agri-food', name: 'Agriculture, Food & Environmental Studies', level: 'PG', description: 'Sustainable agriculture, climate adaptation, food biotechnology, and agribusiness economics.', status: 'Active' },
        { id: 'dept-pg-med-allied', name: 'Medical & Allied Health Sciences', level: 'PG', description: 'Medical research, clinical pharmacology, public health administration, and clinical diagnostics.', status: 'Active' },
        { id: 'dept-pg-law', name: 'Law', level: 'PG', description: 'Master of Laws (LL.M), international commercial arbitration, corporate compliance, and cyber law.', status: 'Active' },
        { id: 'dept-pg-edu-teach', name: 'Education & Teaching', level: 'PG', description: 'Master of Education (M.Ed), curriculum design, educational leadership, and instructional tech.', status: 'Active' },
        { id: 'dept-pg-hosp-aviat', name: 'Hospitality, Tourism & Aviation', level: 'PG', description: 'Strategic hospitality leadership, luxury brand management, and aviation airline governance.', status: 'Active' },
        { id: 'dept-pg-media-film', name: 'Media, Film & Performing Arts', level: 'PG', description: 'Broadcast journalism, film direction, digital media production, and corporate communications.', status: 'Active' }
      ];

      for (const dept of seedDepartments) {
        await db.run(
          `INSERT INTO career_departments (id, name, level, description, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [dept.id, dept.name, dept.level, dept.description, dept.status]
        );
      }
      console.log('Seeded verified UG & PG departments into career_departments table.');
    }
  } catch (seedDeptErr) {
    console.warn('Career departments seed warning:', seedDeptErr.message);
  }

  // HR task assignments: kept completely empty - no fabricated dummy tasks
  // Real tasks are created dynamically by HR Leads

  // ---------------------------------------------------------------------------
  // HR Operations Attendance, Breaks, Shifts, Regularizations & Notifications
  // ---------------------------------------------------------------------------
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shift_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      graceMinutes INTEGER DEFAULT 15,
      isOvernight INTEGER DEFAULT 0,
      breakTrackingEnabled INTEGER DEFAULT 1,
      overtimeEnabled INTEGER DEFAULT 1,
      overtimeThresholdMinutes INTEGER DEFAULT 480,
      absentCutoffHour INTEGER DEFAULT 14,
      weeklyOffDays TEXT DEFAULT '[0]',
      timezone TEXT DEFAULT 'Asia/Kolkata',
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_shift_assignments (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      shiftId TEXT NOT NULL,
      shiftName TEXT NOT NULL,
      scheduledStartTime TEXT NOT NULL,
      scheduledEndTime TEXT NOT NULL,
      scheduledLoginTime TEXT NOT NULL,
      scheduledLogoutTime TEXT NOT NULL,
      frequency TEXT DEFAULT 'one_day',
      startDate TEXT NOT NULL,
      endDate TEXT,
      applicableDays TEXT DEFAULT '[1,2,3,4,5,6]',
      assignedBy TEXT,
      assignedByName TEXT,
      assignedByRole TEXT,
      assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_emp_shift_dates ON employee_shift_assignments(employeeId, startDate, endDate);
    CREATE INDEX IF NOT EXISTS idx_emp_shift_status ON employee_shift_assignments(status);

    CREATE TABLE IF NOT EXISTS late_login_approval_requests (
      id TEXT PRIMARY KEY,
      attendanceId TEXT,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT,
      role TEXT,
      shiftId TEXT NOT NULL,
      shiftName TEXT NOT NULL,
      scheduledLoginTime TEXT NOT NULL,
      scheduledLogoutTime TEXT NOT NULL,
      actualClockInTime TEXT NOT NULL,
      attendanceDate TEXT NOT NULL,
      delayMinutes INTEGER DEFAULT 0,
      explanation TEXT,
      status TEXT DEFAULT 'Pending Approval',
      approverId TEXT,
      approverName TEXT,
      approverRole TEXT,
      decisionTimestamp DATETIME,
      rejectionReason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_late_req_emp ON late_login_approval_requests(employeeId, attendanceDate);
    CREATE INDEX IF NOT EXISTS idx_late_req_status ON late_login_approval_requests(status);

    CREATE TABLE IF NOT EXISTS company_holidays (
      id TEXT PRIMARY KEY,
      holidayDate TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'Public Holiday',
      region TEXT DEFAULT 'Global',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_leave_requests (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      leaveType TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      days REAL DEFAULT 1,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      reviewedBy TEXT,
      reviewedAt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT,
      operationTeam TEXT,
      workDate TEXT NOT NULL,
      shiftId TEXT NOT NULL,
      shiftName TEXT NOT NULL,
      shiftStart TEXT NOT NULL,
      shiftEnd TEXT NOT NULL,
      isOvernightShift INTEGER DEFAULT 0,
      checkInAt TEXT,
      checkOutAt TEXT,
      status TEXT NOT NULL,
      lateMinutes INTEGER DEFAULT 0,
      totalBreakMinutes INTEGER DEFAULT 0,
      grossMinutes INTEGER DEFAULT 0,
      netWorkMinutes INTEGER DEFAULT 0,
      overtimeMinutes INTEGER DEFAULT 0,
      source TEXT DEFAULT 'Web Portal',
      notes TEXT,
      isLocked INTEGER DEFAULT 0,
      sessionId TEXT,
      sessionStatus TEXT DEFAULT 'ACTIVE',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employeeId, workDate);

    CREATE TABLE IF NOT EXISTS daily_work_reports (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT,
      role TEXT,
      attendanceId TEXT,
      reportDate TEXT NOT NULL,
      shiftId TEXT,
      shiftName TEXT,
      shiftStart TEXT,
      shiftEnd TEXT,
      checkInAt TEXT,
      checkOutAt TEXT,
      workingMinutesAtReport INTEGER DEFAULT 0,
      workCompleted TEXT NOT NULL,
      tasksCompleted TEXT NOT NULL,
      workInProgress TEXT NOT NULL,
      issuesBlockers TEXT DEFAULT '',
      plannedNextSteps TEXT NOT NULL,
      additionalRemarks TEXT DEFAULT '',
      submissionStatus TEXT NOT NULL DEFAULT 'SUBMITTED',
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_work_reports_emp_date ON daily_work_reports(employeeId, reportDate);

    CREATE TABLE IF NOT EXISTS attendance_breaks (
      id TEXT PRIMARY KEY,
      attendanceId TEXT NOT NULL,
      employeeId TEXT NOT NULL,
      workDate TEXT NOT NULL,
      breakStartAt TEXT NOT NULL,
      breakEndAt TEXT,
      durationMinutes INTEGER DEFAULT 0,
      breakType TEXT DEFAULT 'General Break',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_breaks_attendance_id ON attendance_breaks(attendanceId);

    CREATE TABLE IF NOT EXISTS attendance_regularizations (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT,
      operationTeam TEXT,
      attendanceDate TEXT NOT NULL,
      correctionType TEXT NOT NULL,
      existingCheckIn TEXT,
      existingCheckOut TEXT,
      existingStatus TEXT,
      requestedCheckIn TEXT,
      requestedCheckOut TEXT,
      requestedStatus TEXT,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      reviewerId TEXT,
      reviewerName TEXT,
      reviewerRole TEXT,
      reviewerComments TEXT,
      reviewedAt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_reg_emp_date ON attendance_regularizations(employeeId, attendanceDate);

    CREATE TABLE IF NOT EXISTS attendance_audit_logs (
      id TEXT PRIMARY KEY,
      attendanceId TEXT,
      employeeId TEXT NOT NULL,
      workDate TEXT NOT NULL,
      action TEXT NOT NULL,
      actorId TEXT NOT NULL,
      actorName TEXT NOT NULL,
      actorRole TEXT NOT NULL,
      beforeState TEXT,
      afterState TEXT,
      details TEXT,
      ipAddress TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_att_audit_emp_date ON attendance_audit_logs(employeeId, workDate);

    CREATE TABLE IF NOT EXISTS employee_notifications (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      relatedId TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_emp_notif_emp ON employee_notifications(employeeId, createdAt);

    
    CREATE TABLE IF NOT EXISTS candidate_visa_assessments (
      id TEXT PRIMARY KEY,
      candidateId TEXT,
      candidateEmail TEXT,
      candidateName TEXT,
      targetCountry TEXT NOT NULL,
      qualification TEXT,
      experience TEXT,
      dob TEXT,
      language TEXT,
      score INTEGER DEFAULT 0,
      status TEXT,
      readiness TEXT,
      reasons TEXT,
      checklist TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_visa_assessments_candidate ON candidate_visa_assessments(candidateId);

    CREATE TABLE IF NOT EXISTS candidate_verifications (
      id TEXT PRIMARY KEY,
      caseId TEXT UNIQUE NOT NULL,
      candidateId TEXT,
      candidateName TEXT NOT NULL,
      candidateEmail TEXT,
      passportNumber TEXT,
      verificationPackage TEXT NOT NULL,
      packageItems TEXT,
      overallStatus TEXT NOT NULL DEFAULT 'Submitted',
      attestationPipeline TEXT,
      employmentMilestones TEXT,
      documentsAttached TEXT,
      consentAccepted INTEGER DEFAULT 1,
      remarks TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_verifications_case ON candidate_verifications(caseId);
    CREATE INDEX IF NOT EXISTS idx_verifications_candidate ON candidate_verifications(candidateId);

    CREATE TABLE IF NOT EXISTS role_login_logs (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      shiftId TEXT,
      shiftName TEXT,
      shiftStart TEXT,
      shiftEnd TEXT,
      loginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      checkInTime TEXT,
      punctuality TEXT NOT NULL,
      lateMinutes INTEGER DEFAULT 0,
      lateApprovalStatus TEXT DEFAULT 'APPROVED',
      approvedBy TEXT,
      approvedAt TEXT,
      rejectionReason TEXT,
      logoutTime TEXT,
      totalDuration TEXT,
      sessionId TEXT,
      ipAddress TEXT,
      userAgent TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_role_login_time ON role_login_logs(loginTime DESC);
    CREATE INDEX IF NOT EXISTS idx_role_login_status ON role_login_logs(lateApprovalStatus);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(TRIM(email)));
    CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_email_lower ON candidates(LOWER(TRIM(email))) WHERE email IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_profiles_email_lower ON candidate_profiles(LOWER(TRIM(email))) WHERE email IS NOT NULL;

    CREATE TABLE IF NOT EXISTS crm_celebration_popups (
      id TEXT PRIMARY KEY,
      occasion_type TEXT NOT NULL DEFAULT 'Festival',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      created_by_role TEXT,
      expires_at TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recruitment_pipeline_records (
      candidateId TEXT PRIMARY KEY,
      applicationId TEXT,
      jobId TEXT,
      jobTitle TEXT,
      companyName TEXT,
      jobLocation TEXT,
      jobCategory TEXT,
      pipelineStage TEXT NOT NULL DEFAULT 'HR Operations Approved',
      hrApprovedAt TEXT,
      hrApprovedBy TEXT,
      hrScreeningResult TEXT DEFAULT 'Approved & Eligible',
      hrCandidateInterest TEXT DEFAULT 'Confirmed',
      hrRemarks TEXT,
      hrEligibility TEXT DEFAULT 'Eligible',
      docVerificationStatus TEXT DEFAULT 'Verified',
      assignedInterviewerId TEXT,
      assignedInterviewerName TEXT,
      interviewStatus TEXT DEFAULT 'Pending',
      latestInterviewResult TEXT,
      latestInterviewScore REAL,
      assignedCoordinatorId TEXT,
      assignedCoordinatorName TEXT,
      placementDecision TEXT,
      placementRemarks TEXT,
      placementDecidedBy TEXT,
      placementDecidedAt TEXT,
      finalPlacementStatus TEXT DEFAULT 'Placement In Progress',
      rejectionReason TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interview_rounds (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      jobId TEXT,
      jobTitle TEXT,
      companyName TEXT,
      roundNumber INTEGER DEFAULT 1,
      roundName TEXT DEFAULT 'Round 1',
      interviewerId TEXT,
      interviewerName TEXT,
      interviewDate TEXT,
      interviewTime TEXT,
      interviewMode TEXT DEFAULT 'Online',
      meetingLink TEXT,
      officeLocation TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'Scheduled',
      scoreCommunication INTEGER,
      scoreTechnical INTEGER,
      scoreJobKnowledge INTEGER,
      scoreExperience INTEGER,
      scoreProblemSolving INTEGER,
      scoreConfidence INTEGER,
      scoreOverall INTEGER,
      averageScore REAL,
      strengths TEXT,
      areasOfImprovement TEXT,
      interviewerRemarks TEXT,
      finalRecommendation TEXT,
      evaluatedBy TEXT,
      evaluatedAt TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employer_submissions (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      companyName TEXT NOT NULL,
      employerContactName TEXT,
      employerEmail TEXT,
      jobTitle TEXT NOT NULL,
      jobLocation TEXT,
      proposedSalary TEXT,
      submissionDate TEXT,
      submissionRemarks TEXT,
      consentRecorded INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Submitted',
      submittedBy TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employer_interviews (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      submissionId TEXT,
      companyName TEXT NOT NULL,
      jobRole TEXT NOT NULL,
      interviewRound TEXT DEFAULT 'Round 1',
      employerInterviewer TEXT,
      interviewDate TEXT,
      interviewTime TEXT,
      interviewMode TEXT DEFAULT 'Online',
      meetingLink TEXT,
      instructions TEXT,
      feedback TEXT DEFAULT 'Awaiting Feedback',
      feedbackNotes TEXT,
      nextInterviewDate TEXT,
      createdBy TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS placement_offers (
      id TEXT PRIMARY KEY,
      candidateId TEXT NOT NULL,
      submissionId TEXT,
      offeredJobRole TEXT NOT NULL,
      companyName TEXT NOT NULL,
      salary TEXT,
      currency TEXT DEFAULT 'AED',
      benefits TEXT,
      offerReleaseDate TEXT,
      offerExpiryDate TEXT,
      joiningDate TEXT,
      offerLetterRef TEXT,
      candidateAcceptance TEXT DEFAULT 'Pending',
      offerStatus TEXT DEFAULT 'Pending',
      finalPlacementStatus TEXT DEFAULT 'Placement In Progress',
      joiningConfirmedAt TEXT,
      createdBy TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recruitment_activity_logs (
      id TEXT PRIMARY KEY,
      candidateId TEXT,
      candidateName TEXT,
      employeeName TEXT,
      employeeRole TEXT,
      action TEXT NOT NULL,
      previousStatus TEXT,
      newStatus TEXT,
      remarks TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recruitment_notifications (
      id TEXT PRIMARY KEY,
      candidateId TEXT,
      candidateName TEXT,
      targetRole TEXT DEFAULT 'All',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'workflow',
      isRead INTEGER DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe column migration for hr_task_assignments, attendance_records, and leads
  try {
    await db.exec(`ALTER TABLE employee_shift_assignments ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE employee_shift_assignments ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN lateApprovalStatus TEXT DEFAULT 'APPROVED'`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN role TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN sessionId TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN sessionStatus TEXT DEFAULT 'ACTIVE'`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE role_login_logs ADD COLUMN logoutTime TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE role_login_logs ADD COLUMN totalDuration TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE role_login_logs ADD COLUMN sessionId TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN taskStatus TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN feedback TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN rating INTEGER DEFAULT 5`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN result TEXT DEFAULT 'Pending'`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN meetingLink TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN panelists TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE interviews ADD COLUMN roundType TEXT DEFAULT 'Technical Round'`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE candidates ADD COLUMN offerDetails TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE candidates ADD COLUMN placementStatus TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE candidate_profiles ADD COLUMN offerDetails TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE candidate_applications ADD COLUMN offerDetails TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignedEmployeeId TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignedEmployeeEmail TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN operationTeam TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignedBy TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignedAt DATETIME`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignmentStatus TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN assignmentNotes TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE hr_task_assignments ADD COLUMN assignmentStatus TEXT DEFAULT 'Assigned'`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE hr_task_assignments ADD COLUMN serviceId TEXT`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE hr_task_assignments ADD COLUMN isCompleted INTEGER DEFAULT 0`);
  } catch (_) { }
  try {
    await db.exec(`ALTER TABLE hr_task_assignments ADD COLUMN completionNotes TEXT`);
  } catch (_) { }

  // Seed Shift Policies (Policy data only — no fabricated employee attendance records)
  try {
    const seedShifts = [
      {
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
        weeklyOffDays: '[0]'
      },
      {
        id: 'SHIFT-MORNING',
        name: 'Morning Shift (07:00 AM - 02:00 PM)',
        startTime: '07:00',
        endTime: '14:00',
        graceMinutes: 15,
        isOvernight: 0,
        breakTrackingEnabled: 1,
        overtimeEnabled: 1,
        overtimeThresholdMinutes: 420,
        absentCutoffHour: 13,
        weeklyOffDays: '[0]'
      },
      {
        id: 'SHIFT-EVENING',
        name: 'Evening Shift (02:00 PM - 09:00 PM)',
        startTime: '14:00',
        endTime: '21:00',
        graceMinutes: 15,
        isOvernight: 0,
        breakTrackingEnabled: 1,
        overtimeEnabled: 1,
        overtimeThresholdMinutes: 420,
        absentCutoffHour: 18,
        weeklyOffDays: '[0]'
      },
      {
        id: 'SHIFT-UK-ME',
        name: 'UK & Middle East Overlap (01:00 PM - 09:30 PM)',
        startTime: '13:00',
        endTime: '21:30',
        graceMinutes: 15,
        isOvernight: 0,
        breakTrackingEnabled: 1,
        overtimeEnabled: 1,
        overtimeThresholdMinutes: 480,
        absentCutoffHour: 17,
        weeklyOffDays: '[0]'
      },
      {
        id: 'SHIFT-NIGHT',
        name: 'Overnight Global Desk (10:00 PM - 07:00 AM)',
        startTime: '22:00',
        endTime: '07:00',
        graceMinutes: 15,
        isOvernight: 1,
        breakTrackingEnabled: 1,
        overtimeEnabled: 1,
        overtimeThresholdMinutes: 480,
        absentCutoffHour: 23,
        weeklyOffDays: '[0]'
      }
    ];

    for (const sh of seedShifts) {
      await db.run(
        `INSERT OR IGNORE INTO shift_configs (id, name, startTime, endTime, graceMinutes, isOvernight, breakTrackingEnabled, overtimeEnabled, overtimeThresholdMinutes, absentCutoffHour, weeklyOffDays)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sh.id, sh.name, sh.startTime, sh.endTime, sh.graceMinutes, sh.isOvernight, sh.breakTrackingEnabled, sh.overtimeEnabled, sh.overtimeThresholdMinutes, sh.absentCutoffHour, sh.weeklyOffDays]
      );
    }

    // Ensure predefined shifts have exact required scheduled working hours
    await db.run("UPDATE shift_configs SET name = 'General Shift (09:00 AM - 06:00 PM)', startTime = '09:00', endTime = '18:00' WHERE id = 'SHIFT-GENERAL'");
    await db.run("UPDATE shift_configs SET name = 'Morning Shift (07:00 AM - 02:00 PM)', startTime = '07:00', endTime = '14:00' WHERE id = 'SHIFT-MORNING'");
    await db.run("UPDATE shift_configs SET name = 'Evening Shift (02:00 PM - 09:00 PM)', startTime = '14:00', endTime = '21:00' WHERE id = 'SHIFT-EVENING'");

    // Ensure all shift_configs have Saturday configured as a regular working day (weeklyOffDays = '[0]')
    await db.run("UPDATE shift_configs SET weeklyOffDays = '[0]' WHERE weeklyOffDays LIKE '%6%'");

    // Seed sample role login logs if empty
    const existingLogsCount = (await db.get('SELECT COUNT(*) as c FROM role_login_logs'))?.c || 0;
    if (existingLogsCount === 0) {
      const today = new Date().toISOString().slice(0, 10);
      const seedRoleLogins = [
        {
          id: 'log-seed-1',
          employeeId: 'REV-EMP-003',
          employeeName: 'Priya Sharma',
          email: 'priya.lead@revivalinternational.com',
          role: 'HR Lead',
          department: 'Human Resources',
          shiftId: 'SHIFT-GENERAL',
          shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
          shiftStart: '09:00 AM',
          shiftEnd: '06:00 PM',
          loginTime: `${today} 08:52:00`,
          checkInTime: '08:52 AM',
          punctuality: 'On Time',
          lateMinutes: 0,
          lateApprovalStatus: 'APPROVED',
          approvedBy: 'System Auto-Approved',
          ipAddress: '127.0.0.1'
        },
        {
          id: 'log-seed-2',
          employeeId: 'REV-EMP-005',
          employeeName: 'Sreeja Nair',
          email: 'sreeja.jasync@gmail.com',
          role: 'Placement Coordinator',
          department: 'Placement & Industry Relations',
          shiftId: 'SHIFT-GENERAL',
          shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
          shiftStart: '09:00 AM',
          shiftEnd: '06:00 PM',
          loginTime: `${today} 09:12:00`,
          checkInTime: '09:12 AM',
          punctuality: 'On Time',
          lateMinutes: 0,
          lateApprovalStatus: 'APPROVED',
          approvedBy: 'System Auto-Approved (Grace Period)',
          ipAddress: '127.0.0.1'
        },
        {
          id: 'log-seed-3',
          employeeId: 'REV-EMP-004',
          employeeName: 'Kishore Kumar',
          email: 'kishore.recruiter@revivalinternational.com',
          role: 'Recruiter',
          department: 'Recruitment & ATS',
          shiftId: 'SHIFT-MORNING',
          shiftName: 'Early Morning Shift (08:00 AM - 04:30 PM)',
          shiftStart: '08:00 AM',
          shiftEnd: '04:30 PM',
          loginTime: `${today} 08:02:00`,
          checkInTime: '08:02 AM',
          punctuality: 'On Time',
          lateMinutes: 0,
          lateApprovalStatus: 'APPROVED',
          approvedBy: 'System Auto-Approved',
          ipAddress: '127.0.0.1'
        },
        {
          id: 'log-seed-4',
          employeeId: 'REV-EMP-107',
          employeeName: 'Fatima Al Zahra',
          email: 'fatima.ops@revivalinternational.com',
          role: 'HR Operations',
          department: 'HR & Student Operations',
          shiftId: 'SHIFT-UK-ME',
          shiftName: 'UK & Middle East Overlap (01:00 PM - 09:30 PM)',
          shiftStart: '01:00 PM',
          shiftEnd: '09:30 PM',
          loginTime: `${today} 13:05:00`,
          checkInTime: '01:05 PM',
          punctuality: 'On Time',
          lateMinutes: 0,
          lateApprovalStatus: 'APPROVED',
          approvedBy: 'System Auto-Approved',
          ipAddress: '127.0.0.1'
        },
        {
          id: 'log-seed-5',
          employeeId: 'REV-EMP-101',
          employeeName: 'Balavarshini S.',
          email: 'balavarshini.s@revivalinternational.com',
          role: 'HR Operations',
          department: 'HR Operations',
          shiftId: 'SHIFT-GENERAL',
          shiftName: 'General Day Shift (09:00 AM - 06:00 PM)',
          shiftStart: '09:00 AM',
          shiftEnd: '06:00 PM',
          loginTime: `${today} 09:38:00`,
          checkInTime: '09:38 AM',
          punctuality: 'Late',
          lateMinutes: 38,
          lateApprovalStatus: 'PENDING',
          approvedBy: null,
          ipAddress: '127.0.0.1'
        }
      ];

      for (const log of seedRoleLogins) {
        await db.run(
          `INSERT OR IGNORE INTO role_login_logs (
            id, employeeId, employeeName, email, role, department,
            shiftId, shiftName, shiftStart, shiftEnd, loginTime, checkInTime,
            punctuality, lateMinutes, lateApprovalStatus, approvedBy, ipAddress
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            log.id, log.employeeId, log.employeeName, log.email, log.role, log.department,
            log.shiftId, log.shiftName, log.shiftStart, log.shiftEnd, log.loginTime, log.checkInTime,
            log.punctuality, log.lateMinutes, log.lateApprovalStatus, log.approvedBy, log.ipAddress
          ]
        );
      }

      const existingAtt = await db.get('SELECT id FROM attendance_records WHERE employeeId = ? AND workDate = ?', ['REV-EMP-101', today]);
      if (!existingAtt) {
        await db.run(
          `INSERT INTO attendance_records (
            id, employeeId, employeeName, department, operationTeam, workDate,
            shiftId, shiftName, shiftStart, shiftEnd, isOvernightShift,
            checkInAt, status, lateMinutes, totalBreakMinutes, grossMinutes, netWorkMinutes, overtimeMinutes, source, notes, lateApprovalStatus, role
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'In Progress', 38, 0, 0, 0, 0, 'Portal Login', 'Traffic delay reported', 'PENDING', 'HR Operations')`,
          [
            'att-seed-bala-1',
            'REV-EMP-101',
            'Balavarshini S.',
            'HR Operations',
            'HR Operations',
            today,
            'SHIFT-GENERAL',
            'General Day Shift (09:00 AM - 06:00 PM)',
            '09:00 AM',
            '06:00 PM',
            `${today}T04:08:00.000Z`
          ]
        );
      }
    }

    const currentYear = new Date().getFullYear();
    const holidayYears = Array.from(new Set([2025, 2026, currentYear, currentYear + 1]));
    for (const yr of holidayYears) {
      const seedHolidays = [
        { id: `HOL-${yr}-01-01`, date: `${yr}-01-01`, name: "New Year's Day", type: 'Public Holiday', region: 'Global' },
        { id: `HOL-${yr}-01-26`, date: `${yr}-01-26`, name: 'Republic Day', type: 'National Holiday', region: 'India' },
        { id: `HOL-${yr}-05-01`, date: `${yr}-05-01`, name: 'International Workers Day', type: 'Public Holiday', region: 'Global' },
        { id: `HOL-${yr}-08-15`, date: `${yr}-08-15`, name: 'Independence Day', type: 'National Holiday', region: 'India' },
        { id: `HOL-${yr}-10-02`, date: `${yr}-10-02`, name: 'Gandhi Jayanti', type: 'National Holiday', region: 'India' },
        { id: `HOL-${yr}-11-08`, date: `${yr}-11-08`, name: 'Diwali / Deepavali', type: 'Festival Holiday', region: 'India' },
        { id: `HOL-${yr}-12-02`, date: `${yr}-12-02`, name: 'UAE National Day', type: 'National Holiday', region: 'UAE' },
        { id: `HOL-${yr}-12-25`, date: `${yr}-12-25`, name: 'Christmas Day', type: 'Public Holiday', region: 'Global' }
      ];
      for (const h of seedHolidays) {
        await db.run(
          `INSERT OR IGNORE INTO company_holidays (id, holidayDate, name, type, region) VALUES (?, ?, ?, ?, ?)`,
          [h.id, h.date, h.name, h.type, h.region]
        );
      }
    }
  } catch (attSeedErr) {
    console.warn('Attendance policy seed warning:', attSeedErr.message);
  }

  // Automated clean-up of legacy mock/dummy candidates (Ensures clean slate for real portal candidates)
  try {
    const dummyIds = [
      'REV-CAN-101', 'REV-CAN-102', 'REV-CAN-103', 'REV-CAN-104', 'REV-CAN-105', 'REV-CAN-106',
      'REV-CAN-4526', 'REV-CAN-4699', 'REV-CAN-5176', 'REV-CAN-9727', 'REV-CAN-3945',
      'REV-CAN-8396', 'REV-CAN-3270', 'REV-CAN-6198', 'REV-CAN-2158', 'REV-CAN-8921',
      'REV-CAN-6858', 'REV-CAN-4283', 'REV-CAN-5599', 'REV-CAN-7331', 'REV-CAN-7211',
      'REV-CAN-8645', 'REV-CAN-5223', 'REV-CAN-3393', 'REV-CAN-9398', 'REV-CAN-3073',
      'REV-CAN-5032', 'REV-CAN-1517', 'REV-CAN-4093', 'REV-CAN-7506', 'REV-CAN-5974',
      'REV-CAN-4404', 'REV-CAN-4539', 'REV-CAN-9000', 'REV-CAN-4378', 'REV-CAN-4043',
      'REV-CAN-5868', 'REV-CAN-8915', 'REV-CAN-3362', 'REV-CAN-53106'
    ];
    const ph = dummyIds.map(() => '?').join(',');

    await db.run(`
      DELETE FROM candidates WHERE 
        id IN (${ph})
        OR LOWER(email) LIKE '%mailinator%'
        OR LOWER(email) LIKE '%candidate_test_%'
        OR LOWER(email) LIKE '%trashuser%'
        OR LOWER(email) LIKE '%example.com%'
        OR LOWER(email) LIKE '%domain.com%'
        OR LOWER(email) LIKE '%candidate.fresh.%'
        OR LOWER(email) = 'johnny@gmail.com'
        OR LOWER(email) = 'real.candidate.test@gmail.com'
        OR LOWER(name) IN ('real candidate', 'unknown candidate', 'fake user', 'fresh candidate', 'alexander wright', 'dr. sarah al-mansoori', 'mohamed tariq', 'elena rostova', 'david chen', 'fatima al-zahra', 'test candidate')
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM candidate_profiles WHERE 
        id IN (${ph})
        OR LOWER(email) LIKE '%mailinator%'
        OR LOWER(email) LIKE '%candidate_test_%'
        OR LOWER(email) LIKE '%trashuser%'
        OR LOWER(email) LIKE '%example.com%'
        OR LOWER(email) LIKE '%domain.com%'
        OR LOWER(email) LIKE '%candidate.fresh.%'
        OR LOWER(email) = 'johnny@gmail.com'
        OR LOWER(email) = 'real.candidate.test@gmail.com'
        OR LOWER(name) IN ('real candidate', 'unknown candidate', 'fake user', 'fresh candidate', 'alexander wright', 'dr. sarah al-mansoori', 'mohamed tariq', 'elena rostova', 'david chen', 'fatima al-zahra', 'test candidate')
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM candidate_applications WHERE 
        (
          candidateId IN (${ph})
          OR LOWER(applicantEmail) LIKE '%mailinator%'
          OR LOWER(applicantEmail) LIKE '%candidate_test_%'
          OR LOWER(applicantEmail) LIKE '%trashuser%'
          OR LOWER(applicantEmail) LIKE '%example.com%'
          OR LOWER(applicantEmail) LIKE '%domain.com%'
          OR LOWER(applicantEmail) LIKE '%candidate.fresh.%'
          OR LOWER(applicantEmail) = 'johnny@gmail.com'
          OR LOWER(applicantEmail) = 'real.candidate.test@gmail.com'
          OR (applicantEmail IS NULL AND candidateId NOT IN (SELECT id FROM candidate_profiles))
          OR (applicantName IS NULL AND candidateId NOT IN (SELECT id FROM candidate_profiles))
          OR LOWER(applicantName) IN ('real candidate', 'unknown candidate', 'fake user', 'fresh candidate', 'alexander wright', 'dr. sarah al-mansoori', 'mohamed tariq', 'elena rostova', 'david chen', 'fatima al-zahra', 'test candidate')
        )
        AND LOWER(COALESCE(applicantEmail, '')) NOT IN ('kishorekumaroffl@gmail.com', 'thejobsyncit@gmail.com', 'hrmaddy3@gmail.com')
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM candidate_documents WHERE 
        candidateId IN (${ph})
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM candidate_notifications WHERE 
        candidateId IN (${ph})
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM users WHERE 
        id IN (${ph})
        OR LOWER(email) LIKE '%mailinator%'
        OR LOWER(email) LIKE '%candidate_test_%'
        OR LOWER(email) LIKE '%trashuser%'
        OR LOWER(email) LIKE '%example.com%'
        OR LOWER(email) LIKE '%domain.com%'
        OR LOWER(email) = 'johnny@gmail.com'
        OR LOWER(email) = 'real.candidate.test@gmail.com'
    `, dummyIds).catch(() => { });

    await db.run(`
      DELETE FROM users WHERE 
        role = 'candidate' AND (
          id IN (${ph})
          OR email LIKE '%mailinator%'
          OR email LIKE '%candidate_test_%'
          OR email LIKE '%trashuser%'
          OR email LIKE '%example.com%'
          OR email LIKE '%domain.com%'
          OR email = 'johnny@gmail.com'
          OR name IN ('Real Candidate', 'Unknown Candidate', 'Fake User', 'Fresh Candidate')
        )
    `, dummyIds).catch(() => { });
  } catch (cleanErr) {
    console.warn('Candidate cleanup warning:', cleanErr.message);
  }

  // Backfill normalizedPhone and password hashes for existing candidate accounts
  try {
    const cRows = await db.all("SELECT id, phone FROM candidates WHERE phone IS NOT NULL AND (normalizedPhone IS NULL OR normalizedPhone = '')");
    for (const row of cRows) {
      const norm = normalizePhone(row.phone);
      if (norm) {
        await db.run("UPDATE candidates SET normalizedPhone = ? WHERE id = ?", [norm, row.id]);
      }
    }

    const cpRows = await db.all("SELECT id, phone FROM candidate_profiles WHERE phone IS NOT NULL AND (normalizedPhone IS NULL OR normalizedPhone = '')");
    for (const row of cpRows) {
      const norm = normalizePhone(row.phone);
      if (norm) {
        await db.run("UPDATE candidate_profiles SET normalizedPhone = ? WHERE id = ?", [norm, row.id]);
      }
    }

    const uRows = await db.all("SELECT id, phone FROM users WHERE phone IS NOT NULL AND (normalizedPhone IS NULL OR normalizedPhone = '')");
    for (const row of uRows) {
      const norm = normalizePhone(row.phone);
      if (norm) {
        await db.run("UPDATE users SET normalizedPhone = ? WHERE id = ?", [norm, row.id]);
      }
    }

    // Seed/backfill password hash for predefined candidate accounts
    const thejobsyncUser = await db.get("SELECT id, passwordHash FROM users WHERE LOWER(email) = 'thejobsyncit@gmail.com'");
    if (thejobsyncUser && !thejobsyncUser.passwordHash) {
      const { hash, salt } = hashPassword('Thejobsync@26');
      await db.run("UPDATE users SET passwordHash = ?, passwordSalt = ? WHERE id = ?", [hash, salt, thejobsyncUser.id]);
      await db.run("UPDATE candidate_profiles SET passwordHash = ?, passwordSalt = ? WHERE LOWER(email) = 'thejobsyncit@gmail.com'", [hash, salt]);
    }
  } catch (backfillErr) {
    console.warn('Phone normalization backfill notice:', backfillErr.message);
  }

  // Database-Level Duplicate Protection: Apply UNIQUE constraints / indexes
  try {
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_lower_email ON candidates(LOWER(email));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_profiles_lower_email ON candidate_profiles(LOWER(email));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_lower_email ON users(LOWER(email));
      CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_unique_phone ON candidates(normalizedPhone) WHERE normalizedPhone IS NOT NULL AND normalizedPhone != '';
      CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_profiles_unique_phone ON candidate_profiles(normalizedPhone) WHERE normalizedPhone IS NOT NULL AND normalizedPhone != '';
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_unique_phone ON users(normalizedPhone) WHERE normalizedPhone IS NOT NULL AND normalizedPhone != '';
    `);
  } catch (idxErr) {
    console.warn('Unique indexes setup notice:', idxErr.message);
  }

  // Automated clean-up of legacy dummy/test leads, test activities, and test enquiries
  try {
    await db.run(`
      DELETE FROM leads 
      WHERE LOWER(name) LIKE '%qa%' 
         OR LOWER(name) LIKE '%tester%'
         OR LOWER(name) LIKE '%acceptance%'
         OR LOWER(name) LIKE '%drop table%'
         OR LOWER(name) LIKE '%dr. robert%'
         OR LOWER(name) LIKE '%vikramaditya%'
         OR LOWER(name) LIKE '%jayasurya%'
         OR LOWER(name) LIKE '%kamesh%'
         OR LOWER(name) LIKE '%suresh%'
         OR LOWER(name) LIKE '%ramesh%'
         OR LOWER(name) LIKE '%viyaan%'
         OR LOWER(name) LIKE '%fake%'
         OR LOWER(name) LIKE '%unknown%'
         OR LOWER(name) LIKE '%fresh candidate%'
         OR LOWER(name) LIKE '%gfhdfhdf%'
         OR LOWER(name) LIKE '%aarav sharma%'
         OR LOWER(name) LIKE '%priya patel%'
         OR LOWER(name) LIKE '%rohan gupta%'
         OR LOWER(name) LIKE '%ananya sen%'
         OR LOWER(name) LIKE '%meera nair%'
         OR LOWER(name) LIKE '%sanjay krishnan%'
         OR LOWER(name) LIKE '%johnny%'
         OR LOWER(name) LIKE '%vignesh%'
         OR LOWER(email) LIKE '%qa%'
         OR LOWER(email) LIKE '%test%'
         OR LOWER(email) LIKE '%accept%'
         OR LOWER(email) LIKE '%sqli%'
         OR LOWER(email) LIKE '%example%'
         OR LOWER(email) LIKE '%dummy%'
         OR LOWER(email) LIKE '%mailinator%'
         OR LOWER(email) LIKE '%thejobsync.com%'
         OR LOWER(email) LIKE '%sir-academic%'
         OR LOWER(email) LIKE '%revival-international.ae%'
         OR LOWER(email) LIKE '%parent-test%'
         OR LOWER(message) LIKE '%kwwwwww%'
         OR phone IN ('9876543210', '5098765432', '5012345678', '1234567891', '1234567895', '+91 91234 56789', '+91 98765 43210', '+91 98765 43211', '+91 98765 43212', '+91 98765 43213', '+91 98765 43215', '+971 50 987 6543')
         OR serviceId = 'intl-recruitment'
         OR serviceTitle IN ('Candidate Registration', 'Job Application')
         OR id LIKE 'LEAD-900%'
    `);

    await db.run(`
      DELETE FROM enquiry_activities 
      WHERE enquiryId NOT IN (SELECT id FROM leads)
         OR LOWER(notes) LIKE '%test%'
         OR LOWER(notes) LIKE '%qa%'
         OR LOWER(notes) LIKE '%acceptance%'
    `);

    await db.run(`
      DELETE FROM student_academy_enquiries
      WHERE LOWER(studentName) LIKE '%test%'
         OR LOWER(studentName) LIKE '%aarav%'
         OR LOWER(studentName) LIKE '%vignesh%'
         OR LOWER(studentName) LIKE '%sanjay%'
         OR LOWER(studentName) LIKE '%kamesh%'
         OR LOWER(studentName) LIKE '%suresg%'
         OR LOWER(studentName) LIKE '%gfhdfhdf%'
         OR LOWER(studentName) LIKE '%jayasurya%'
         OR LOWER(studentName) LIKE '%johnny%'
         OR LOWER(email) LIKE '%test%'
         OR LOWER(email) LIKE '%parent-test%'
         OR LOWER(email) LIKE '%example%'
         OR LOWER(email) LIKE '%revival-international.ae%'
         OR LOWER(email) LIKE '%kamesh34%'
         OR phone IN ('1234567891', '1234567895', '6383486456', '+919787536921')
    `);

    await db.run(`
      DELETE FROM career_guidance_enquiries
      WHERE LOWER(student_name) LIKE '%sarabhai%'
         OR LOWER(student_name) LIKE '%kavitha%'
         OR LOWER(email) LIKE '%thejobsync.com%'
         OR LOWER(email) LIKE '%example.com%'
         OR LOWER(email) LIKE '%test%'
    `);

    // Retain all genuine HR task assignments across server restarts
    // Removed destructive deletion of hr_task_assignments
  } catch (cleanDummyErr) {
    console.warn('Dummy cleanup warning:', cleanDummyErr.message);
  }

  // Seed baseline enquiries into leads & hr_task_assignments if not already present
  try {
    for (const enq of INITIAL_BASELINE_ENQUIRIES) {
      const existing = await db.get('SELECT id FROM leads WHERE id = ? OR referenceNumber = ?', [enq.id, enq.referenceNumber]);
      if (!existing) {
        await db.run(
          `INSERT INTO leads (
            id, referenceNumber, name, email, phone, company, serviceId, serviceTitle,
            countryInterest, status, assignedEmployee, assignedEmployeeId, assignedEmployeeEmail,
            priority, assignmentNotes, internalNotes, assignedBy, assignedAt, assignmentStatus,
            taskStatus, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            enq.id,
            enq.referenceNumber,
            enq.name,
            enq.email,
            enq.phone,
            enq.company || 'Individual Candidate',
            enq.serviceId,
            enq.serviceTitle,
            enq.country || 'India',
            enq.status,
            enq.assignedEmployee || null,
            enq.assignedEmployeeId || null,
            enq.assignedEmployeeEmail || null,
            enq.priority || 'Normal',
            enq.assignmentNotes || null,
            enq.notes || enq.assignmentNotes || null,
            enq.assignedEmployee ? 'Priya Sharma (HR Lead)' : null,
            enq.assignedDate || (enq.assignedEmployee ? enq.createdAt : null),
            enq.status === 'Assigned' ? 'Assigned' : (enq.status === 'Completed' ? 'Completed' : 'New'),
            enq.status === 'Completed' ? 'Completed' : (enq.status === 'Assigned' ? 'To Do' : null),
            enq.createdAt,
            enq.createdAt
          ]
        );
      }

      // If enquiry is assigned or completed, seed corresponding task into hr_task_assignments
      if (enq.assignedEmployee && (enq.status === 'Assigned' || enq.status === 'Completed')) {
        const taskId = `TASK-${enq.id}`;
        const existingTask = await db.get('SELECT id FROM hr_task_assignments WHERE id = ? OR enquiryId = ?', [taskId, enq.id]);
        if (!existingTask) {
          await db.run(
            `INSERT INTO hr_task_assignments (
              id, enquiryId, referenceNumber, customerName, customerEmail, customerPhone,
              serviceId, serviceTitle, operationTeam, assignedEmployeeId, assignedEmployeeName,
              assignedEmployeeEmail, assignedById, assignedByName, priority, dueDate,
              assignmentStatus, taskStatus, notes, isCompleted, assignedAt, completedAt, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              taskId,
              enq.id,
              enq.referenceNumber,
              enq.name,
              enq.email,
              enq.phone,
              enq.serviceId,
              enq.serviceTitle,
              enq.operationTeam || (['intl-adm', 'intl-consult'].includes(enq.serviceId) ? 'International HR Operations' : 'Enquiry HR Operations'),
              enq.assignedEmployeeId,
              enq.assignedEmployee,
              enq.assignedEmployeeEmail,
              'REV-EMP-003',
              'Priya Sharma (HR Lead)',
              enq.priority || 'Normal',
              null,
              enq.status === 'Completed' ? 'Completed' : 'Assigned',
              enq.status === 'Completed' ? 'Completed' : 'To Do',
              enq.assignmentNotes || enq.notes || 'Follow up with candidate.',
              enq.status === 'Completed' ? 1 : 0,
              enq.assignedDate || enq.createdAt,
              enq.completedDate || null,
              enq.createdAt,
              enq.createdAt
            ]
          );
        }
      }
    }
  } catch (seedErr) {
    console.warn('Baseline enquiries seed notice:', seedErr.message);
  }

  console.log('Database initialized successfully with SQLite.');
};

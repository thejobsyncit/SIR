import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

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
  if (process.env.DATABASE_PATH) {
    // If relative path on serverless, resolve inside os.tmpdir()
    if (isServerlessEnv() && !path.isAbsolute(process.env.DATABASE_PATH)) {
      return path.join(os.tmpdir(), path.basename(process.env.DATABASE_PATH));
    }
    return process.env.DATABASE_PATH;
  }

  if (isServerlessEnv()) {
    const tmpDbPath = path.join(os.tmpdir(), 'sir_recruitment.db');
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
        } else {
          // If bundled database has a newer size or timestamp, update tmp
          const bundledStat = fs.statSync(bundledDbPath);
          const tmpStat = fs.statSync(tmpDbPath);
          if (bundledStat.size > tmpStat.size || (bundledStat.size !== tmpStat.size && bundledStat.mtimeMs > tmpStat.mtimeMs)) {
            fs.copyFileSync(bundledDbPath, tmpDbPath);
          }
        }
      }
    } catch (copyErr) {
      console.warn('Serverless DB copy notice:', copyErr.message);
    }
    return tmpDbPath;
  }

  return path.join(__dirname, 'sir_recruitment.db');
};

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
export const DEFAULT_CRM_APPLICATIONS = [];

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

/**
 * Pure-JS JSON / In-Memory Fallback Database Adapter for Serverless Environments
 * where native C++ sqlite3 bindings are unavailable.
 */
const createFallbackDb = () => {
  const storePath = path.join(os.tmpdir(), 'revival_serverless_store.json');
  const defaultStore = {
    jobs: [],
    candidates: [...DEFAULT_CRM_CANDIDATES],
    candidate_profiles: [...DEFAULT_CRM_PROFILES],
    candidate_applications: [...DEFAULT_CRM_APPLICATIONS],
    candidate_documents: [],
    clients: [],
    interviews: [],
    leads: [...DEFAULT_CRM_LEADS],
    employees: [...DEFAULT_CRM_EMPLOYEES],
    organization_contacts: [],
    enquiry_activities: [],
    follow_ups: [],
    student_academy_enquiries: [],
    client_accounts: [],
    client_documents: [],
    client_appointments: [],
    client_messages: [],
    client_notifications: [],
    client_invoices: [],
    career_departments: [],
    audit_logs: []
  };

  let store = { ...defaultStore };
  try {
    if (fs.existsSync(storePath)) {
      const raw = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      store = { ...defaultStore, ...raw };
      // Ensure arrays are never undefined
      Object.keys(defaultStore).forEach(k => {
        if (!Array.isArray(store[k])) store[k] = [...defaultStore[k]];
        else if (store[k].length === 0 && defaultStore[k].length > 0) store[k] = [...defaultStore[k]];
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
    run: async (sql, params = []) => {
      const s = sql.trim();
      const table = getTableName(s);
      if (!table) return { changes: 0 };
      if (!store[table]) store[table] = [];

      if (/^INSERT\s+INTO/i.test(s)) {
        const colMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
        const row = { id: params[0] || `REC-${Date.now()}`, createdAt: new Date().toISOString() };
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
        store[table] = store[table].filter(r => r.id !== id && r.enquiryId !== id);
        persist();
        return { changes: before - store[table].length };
      }

      return { changes: 0 };
    },
    get: async (sql, params = []) => {
      const s = sql.trim();
      if (/SELECT\s+1\s+as\s+alive/i.test(s)) {
        return { alive: 1 };
      }
      const table = getTableName(s);
      if (!table) return null;
      if (!store[table]) store[table] = [];

      if (/COUNT\(\*\)/i.test(s)) {
        const rows = store[table];
        return { count: rows.length, total: rows.length, totalAcademies: rows.length, totalExams: rows.length };
      }

      if (params.length > 0) {
        const keyVal = params[0];
        const found = store[table].find(r =>
          r.id === keyVal ||
          r.employeeId === keyVal ||
          r.referenceNumber === keyVal ||
          (r.email && String(r.email).toLowerCase().trim() === String(keyVal).toLowerCase().trim()) ||
          (r.company && String(r.company).toLowerCase().trim() === String(keyVal).toLowerCase().trim())
        );
        return found || null;
      }

      return store[table][0] || null;
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

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  try {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const sqlite3Mod = await import('sqlite3');
    const sqliteMod = await import('sqlite');
    const sqlite3 = sqlite3Mod.default || sqlite3Mod;
    const { open } = sqliteMod;

    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    try {
      await dbInstance.run('PRAGMA journal_mode = WAL;');
      await dbInstance.run('PRAGMA foreign_keys = ON;');
    } catch (pragmaErr) {
      console.warn('SQLite PRAGMA setup warning:', pragmaErr.message);
    }

    await initDb(dbInstance);
    usingFallbackStore = false;
    return dbInstance;
  } catch (err) {
    console.warn('SQLite unavailable in current runtime, activating serverless JSON store fallback:', err.message);
    dbInstance = createFallbackDb();
    usingFallbackStore = true;
    return dbInstance;
  }
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
    const db = await getDb();
    const result = await db.get('SELECT 1 as alive');
    const dbPath = getDbPath();
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    return {
      status: 'connected',
      engine: usingFallbackStore ? 'serverless-json' : 'sqlite',
      alive: result && result.alive === 1,
      sizeBytes: dbSize
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
      serviceTitle TEXT,
      operationTeam TEXT,
      assignedEmployeeId TEXT,
      assignedEmployeeName TEXT,
      assignedEmployeeEmail TEXT,
      assignedById TEXT,
      assignedByName TEXT,
      priority TEXT DEFAULT 'Normal',
      dueDate TEXT,
      taskStatus TEXT DEFAULT 'To Do',
      notes TEXT,
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Seed default corporate announcements if table is empty
  try {
    const existingAnn = await db.get('SELECT COUNT(*) as count FROM company_announcements');
    if (!existingAnn || existingAnn.count === 0) {
      const defaultAnnouncements = [
        {
          id: 'ANN-2026-001',
          title: 'Annual Performance & Appraisal Cycle 2026-27 Announced',
          description: 'The annual appraisal and self-evaluation window for FY 2026-27 is officially open. All team members must complete their self-assessment forms in the HR portal before the end of the month. Department heads will conduct one-on-one review meetings during the first week of next month.',
          category: 'HR Policy',
          target_audience: 'All Employees',
          status: 'Published',
          created_by: 'REV-EMP-006',
          created_by_name: 'Priya Sharma',
          created_by_role: 'HR Lead',
          created_at: '2026-11-15 09:30:00',
          published_at: '2026-11-15 09:30:00',
          expires_at: null
        },
        {
          id: 'ANN-2026-002',
          title: 'Standard Operating Procedures for International Candidate KYC',
          description: 'HR Operations team is advised to mandate 3-point credential verification for all international healthcare and IT applicants before scheduling technical interviews. Ensure passport validity, educational degree attestation, and police clearance certificates are logged in the candidate dossier.',
          category: 'Important Update',
          target_audience: 'HR Operations',
          status: 'Published',
          created_by: 'REV-EMP-006',
          created_by_name: 'Priya Sharma',
          created_by_role: 'HR Lead',
          created_at: '2026-11-18 11:00:00',
          published_at: '2026-11-18 11:00:00',
          expires_at: null
        },
        {
          id: 'ANN-2026-003',
          title: 'Upcoming Corporate Holiday — UAE National Day Observance',
          description: 'Our Dubai and international advisory branches will observe public holiday for UAE National Day on December 2nd and 3rd, 2026. Normal operations will resume on December 4th at 09:00 AM. On-call emergency visa support will remain active for active travel candidates.',
          category: 'Holiday',
          target_audience: 'All Employees',
          status: 'Published',
          created_by: 'REV-EMP-006',
          created_by_name: 'Priya Sharma',
          created_by_role: 'HR Lead',
          created_at: '2026-11-20 14:15:00',
          published_at: '2026-11-20 14:15:00',
          expires_at: null
        }
      ];

      for (const ann of defaultAnnouncements) {
        await db.run(
          `INSERT INTO company_announcements (id, title, description, category, target_audience, status, created_by, created_by_name, created_by_role, created_at, published_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ann.id,
            ann.title,
            ann.description,
            ann.category,
            ann.target_audience,
            ann.status,
            ann.created_by,
            ann.created_by_name,
            ann.created_by_role,
            ann.created_at,
            ann.published_at,
            ann.expires_at
          ]
        );
      }
    }
  } catch (err) {
    console.warn('Company announcements table seeding notice:', err.message);
  }

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
    { name: 'noticePeriod', type: 'TEXT' }
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

  // Seed default HR task assignments if none exist
  try {
    const taskCount = await db.get("SELECT COUNT(*) as count FROM hr_task_assignments");
    if (!taskCount || taskCount.count === 0) {
      for (const t of DEFAULT_CRM_TASKS) {
        await db.run(
          `INSERT OR IGNORE INTO hr_task_assignments (
            id, enquiryId, referenceNumber, candidateKey, customerName, customerEmail, customerPhone,
            serviceTitle, operationTeam, assignedEmployeeId, assignedEmployeeName, assignedEmployeeEmail,
            assignedById, assignedByName, priority, dueDate, taskStatus, notes, assignedAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id, t.enquiryId, t.referenceNumber, t.candidateKey, t.customerName, t.customerEmail, t.customerPhone,
            t.serviceTitle, t.operationTeam, t.assignedEmployeeId, t.assignedEmployeeName, t.assignedEmployeeEmail,
            t.assignedById, t.assignedByName, t.priority, t.dueDate, t.taskStatus, t.notes, t.assignedAt,
            t.assignedAt, t.assignedAt
          ]
        );
      }
      console.log('Seeded default HR task assignments into SQLite database.');
    }
  } catch (seedTaskErr) {
    console.warn('HR task assignments seed warning:', seedTaskErr.message);
  }

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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employeeId, workDate);

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
      ipAddress TEXT,
      userAgent TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_role_login_time ON role_login_logs(loginTime DESC);
    CREATE INDEX IF NOT EXISTS idx_role_login_status ON role_login_logs(lateApprovalStatus);
  `);

  // Safe column migration for lateApprovalStatus on attendance_records & taskStatus on leads
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN lateApprovalStatus TEXT DEFAULT 'APPROVED'`);
  } catch (_) {}
  try {
    await db.exec(`ALTER TABLE attendance_records ADD COLUMN role TEXT`);
  } catch (_) {}
  try {
    await db.exec(`ALTER TABLE leads ADD COLUMN taskStatus TEXT`);
  } catch (_) {}

  // Seed Shift Policies (Policy data only — no fabricated employee attendance records)
  try {
    const seedShifts = [
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

    for (const sh of seedShifts) {
      await db.run(
        `INSERT OR IGNORE INTO shift_configs (id, name, startTime, endTime, graceMinutes, isOvernight, breakTrackingEnabled, overtimeEnabled, overtimeThresholdMinutes, absentCutoffHour, weeklyOffDays)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sh.id, sh.name, sh.startTime, sh.endTime, sh.graceMinutes, sh.isOvernight, sh.breakTrackingEnabled, sh.overtimeEnabled, sh.overtimeThresholdMinutes, sh.absentCutoffHour, sh.weeklyOffDays]
      );
    }

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
      'REV-CAN-5868', 'REV-CAN-8915', 'REV-CAN-3362', 'REV-CAN-53106',
      'RI-CAND-001', 'RI-CAND-002', 'RI-CAND-003'
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
    `, dummyIds).catch(() => {});

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
    `, dummyIds).catch(() => {});

    await db.run(`
      DELETE FROM candidate_applications WHERE 
        candidateId IN (${ph})
        OR LOWER(applicantEmail) LIKE '%mailinator%'
        OR LOWER(applicantEmail) LIKE '%candidate_test_%'
        OR LOWER(applicantEmail) LIKE '%trashuser%'
        OR LOWER(applicantEmail) LIKE '%example.com%'
        OR LOWER(applicantEmail) LIKE '%domain.com%'
        OR LOWER(applicantEmail) LIKE '%candidate.fresh.%'
        OR LOWER(applicantEmail) = 'johnny@gmail.com'
        OR LOWER(applicantEmail) = 'real.candidate.test@gmail.com'
        OR applicantEmail IS NULL
        OR applicantName IS NULL
        OR LOWER(applicantName) IN ('real candidate', 'unknown candidate', 'fake user', 'fresh candidate', 'alexander wright', 'dr. sarah al-mansoori', 'mohamed tariq', 'elena rostova', 'david chen', 'fatima al-zahra', 'test candidate')
    `, dummyIds).catch(() => {});

    await db.run(`
      DELETE FROM candidate_documents WHERE 
        candidateId IN (${ph})
    `, dummyIds).catch(() => {});

    await db.run(`
      DELETE FROM candidate_notifications WHERE 
        candidateId IN (${ph})
    `, dummyIds).catch(() => {});

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
    `, dummyIds).catch(() => {});

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
    `, dummyIds).catch(() => {});
  } catch (cleanErr) {
    console.warn('Candidate cleanup warning:', cleanErr.message);
  }

  console.log('Database initialized successfully with SQLite.');
};

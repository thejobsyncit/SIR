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
    const bundledDbPath = path.join(__dirname, 'sir_recruitment.db');
    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (copyErr) {
      console.warn('Serverless DB copy notice:', copyErr.message);
    }
    return tmpDbPath;
  }

  return path.join(__dirname, 'sir_recruitment.db');
};

export const DEFAULT_CRM_EMPLOYEES = [
  { id: 'emp-1', employeeId: 'REV-EMP-001', name: 'Dhanalakshimi', email: 'thejobsyncit@gmail.com', phone: '+91 9003475405', role: 'Super Admin', department: 'Executive Management', password: 'Thejobsync@26', status: 'Active', createdAt: '2026-11-01 09:00:00' },
  { id: 'emp-2', employeeId: 'REV-EMP-002', name: 'Sarah Jenkins', email: 'sarah.admin@revivalinternational.com', phone: '+91 98400 11002', role: 'Admin', department: 'Operations Management', password: 'Password123!', status: 'Active', createdAt: '2026-11-01 09:00:00' },
  { id: 'emp-3', employeeId: 'REV-EMP-003', name: 'Priya Sharma', email: 'priya.lead@revivalinternational.com', phone: '+91 98400 11003', role: 'HR Lead', department: 'Human Resources', password: 'Password123!', status: 'Active', createdAt: '2026-11-01 09:00:00' },
  { id: 'emp-4', employeeId: 'REV-EMP-004', name: 'Kishore Kumar', email: 'kishore.recruiter@revivalinternational.com', phone: '+91 98400 11004', role: 'Recruiter', department: 'Talent Acquisition & ATS', password: 'Password123!', status: 'Active', createdAt: '2026-11-01 09:00:00' },
  { id: 'emp-5', employeeId: 'REV-EMP-005', name: 'Sreeja Nair', email: 'sreeja.jasync@gmail.com', phone: '+91 9876543211', role: 'Placement Coordinator', department: 'Placement & Industry Relations', password: 'Password123!', status: 'Active', createdAt: '2026-11-01 09:00:00' },
  { id: 'emp-6', employeeId: 'REV-EMP-006', name: 'Balavarshini', email: 'balavarshini2223@gmail.com', phone: '+91 9876543214', role: 'HR Operations', department: 'HR & Student Operations', password: 'Password123!', status: 'Active', createdAt: '2026-11-01 09:00:00' }
];

export const DEFAULT_CRM_CANDIDATES = [
  {
    id: 'REV-CAN-101',
    name: 'Alexander Wright',
    email: 'alexander.wright@gmail.com',
    phone: '+971 50 123 4567',
    nationality: 'British',
    currentEmployer: 'Arabtec Construction LLC',
    currentRole: 'Senior Civil Project Manager',
    currentSalary: 'AED 38,000',
    expectedSalary: 'AED 45,000',
    score: 95,
    stage: 'interview',
    skills: '["FIDIC Red Book", "Primavera P6", "High-Rise Construction", "Budget Control"]',
    source: 'Executive Headhunting',
    passport: 'UK (Valid 2031)',
    aiSummary: 'Tier-1 GCC civil project director with 12+ years of mega high-rise execution across Dubai and Riyadh.',
    experience: '12 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    createdAt: '2026-11-01 10:00:00'
  },
  {
    id: 'REV-CAN-102',
    name: 'Dr. Sarah Al-Mansoori',
    email: 'dr.sarah.mansoori@gmail.com',
    phone: '+966 50 234 5678',
    nationality: 'Saudi / UAE',
    currentEmployer: 'King Faisal Specialist Hospital',
    currentRole: 'Consultant Critical Care & ICU',
    currentSalary: 'SAR 42,000',
    expectedSalary: 'SAR 50,000',
    score: 97,
    stage: 'shortlisted',
    skills: '["Critical Care Medicine", "ICU Ventilation", "JCI Accreditation", "Saudi Prometric"]',
    source: 'Medical Referral',
    passport: 'Saudi Arabia (Verified)',
    aiSummary: 'Board-certified ICU Consultant with Saudi Prometric license and extensive critical care leadership.',
    experience: '9 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    createdAt: '2026-11-02 11:30:00'
  },
  {
    id: 'REV-CAN-103',
    name: 'Mohamed Tariq',
    email: 'candidate_test_1793170475278@domain.com',
    phone: '+971 50 112 2334',
    nationality: 'Indian',
    currentEmployer: 'Emirates NBD Technology',
    currentRole: 'Lead Cloud Solutions Architect',
    currentSalary: 'AED 28,000',
    expectedSalary: 'AED 35,000',
    score: 92,
    stage: 'lead',
    skills: '["AWS Solutions Architect", "Kubernetes", "DevOps CI/CD", "Fintech Compliance"]',
    source: 'Candidate Portal Application',
    passport: 'India (Valid 2029)',
    aiSummary: 'Enterprise cloud architect certified in AWS and Kubernetes with hands-on fintech banking deployments.',
    experience: '8 Years',
    assignedRecruiter: 'Dhanalakshimi (Lead Advisor)',
    createdAt: '2026-10-28 06:54:35'
  },
  {
    id: 'REV-CAN-104',
    name: 'Elena Rostova',
    email: 'elena.rostova@outlook.com',
    phone: '+65 9123 4567',
    nationality: 'Singaporean',
    currentEmployer: 'DBS Bank Singapore',
    currentRole: 'Senior Cybersecurity Operations Lead',
    currentSalary: 'SGD 14,000',
    expectedSalary: 'SGD 16,500',
    score: 94,
    stage: 'screening',
    skills: '["Splunk SIEM", "Threat Hunting", "CISSP", "Incident Response"]',
    source: 'Talent Acquisition',
    passport: 'Singapore (Verified)',
    aiSummary: 'CISSP certified security lead with deep experience in banking SOC leadership and threat mitigation.',
    experience: '7 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    createdAt: '2026-11-03 14:15:00'
  },
  {
    id: 'REV-CAN-105',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98401 55667',
    nationality: 'Indian',
    currentEmployer: 'Larsen & Toubro Heavy Civil',
    currentRole: 'Senior Structural BIM Engineer',
    currentSalary: 'INR 18,00,000',
    expectedSalary: 'AED 22,000',
    score: 89,
    stage: 'applied',
    skills: '["Revit Structural", "Navisworks Manage", "BIM 360", "Clash Detection"]',
    source: 'GCC Career Fair',
    passport: 'India (ECNR Verified)',
    aiSummary: 'Experienced structural BIM professional with international metro and high-rise project credentials.',
    experience: '6 Years',
    assignedRecruiter: 'Sreeja Nair (Placement Coordinator)',
    createdAt: '2026-11-04 09:20:00'
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

/**
 * Pure-JS JSON / In-Memory Fallback Database Adapter for Serverless Environments
 * where native C++ sqlite3 bindings are unavailable.
 */
const createFallbackDb = () => {
  const storePath = path.join(os.tmpdir(), 'revival_serverless_store.json');
  const defaultStore = {
    jobs: [],
    candidates: [...DEFAULT_CRM_CANDIDATES],
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
        if (found) return found;
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
      featured INTEGER DEFAULT 0
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
  `);

  // Seed default employees for all 6 roles if table is empty
  try {
    const existingEmployees = await db.all('SELECT COUNT(*) as count FROM employees');
    if (existingEmployees && existingEmployees[0] && existingEmployees[0].count === 0) {
      const defaultEmps = [
        { id: 'emp-1', employeeId: 'REV-EMP-001', name: 'Dhanalakshimi', email: 'thejobsyncit@gmail.com', phone: '+91 9003475405', role: 'Super Admin', department: 'Executive Management', password: 'Thejobsync@26', status: 'Active' },
        { id: 'emp-2', employeeId: 'REV-EMP-002', name: 'Sarah Jenkins', email: 'sarah.admin@revivalinternational.com', phone: '+91 98400 11002', role: 'Admin', department: 'Administration', password: 'Password123!', status: 'Active' },
        { id: 'emp-3', employeeId: 'REV-EMP-003', name: 'Priya Sharma', email: 'priya.lead@revivalinternational.com', phone: '+91 98400 11003', role: 'HR Lead', department: 'Human Resources', password: 'Password123!', status: 'Active' },
        { id: 'emp-4', employeeId: 'REV-EMP-004', name: 'Kishore Kumar', email: 'kishore.recruiter@revivalinternational.com', phone: '+91 98400 11004', role: 'Recruiter', department: 'Recruitment & ATS', password: 'Password123!', status: 'Active' },
        { id: 'emp-5', employeeId: 'REV-EMP-005', name: 'Sreeja Nair', email: 'sreeja.jasync@gmail.com', phone: '+91 9876543211', role: 'Placement Coordinator', department: 'Placement & Client Relations', password: 'Password123!', status: 'Active' },
        { id: 'emp-6', employeeId: 'REV-EMP-006', name: 'Balavarshini', email: 'balavarshini2223@gmail.com', phone: '+91 9876543214', role: 'HR Operations', department: 'HR Operations', password: 'Password123!', status: 'Active' }
      ];
      for (const emp of defaultEmps) {
        await db.run(
          `INSERT OR IGNORE INTO employees (id, employeeId, name, email, phone, role, department, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [emp.id, emp.employeeId, emp.name, emp.email, emp.phone, emp.role, emp.department, emp.password, emp.status]
        );
      }
      console.log('✓ Seeded default employees across all 6 CRM roles.');
    }
  } catch (err) {
    console.warn('Employee table seeding notice:', err.message);
  }

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

  console.log('Database initialized successfully with SQLite.');
};

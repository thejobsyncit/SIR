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

/**
 * Pure-JS JSON / In-Memory Fallback Database Adapter for Serverless Environments
 * where native C++ sqlite3 bindings are unavailable.
 */
const createFallbackDb = () => {
  const storePath = path.join(os.tmpdir(), 'revival_serverless_store.json');
  const defaultStore = {
    jobs: [],
    candidates: [],
    clients: [],
    interviews: [],
    leads: [],
    organization_contacts: [],
    enquiry_activities: [],
    follow_ups: [],
    student_academy_enquiries: [],
    client_accounts: [],
    client_documents: [],
    client_appointments: [],
    client_messages: [],
    client_notifications: [],
    client_invoices: []
  };

  let store = { ...defaultStore };
  try {
    if (fs.existsSync(storePath)) {
      const raw = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      store = { ...defaultStore, ...raw };
    }
  } catch (_) {
    store = { ...defaultStore };
  }

  const persist = () => {
    try {
      fs.writeFileSync(storePath, JSON.stringify(store), 'utf8');
    } catch (_) {}
  };

  const getTableName = (sql) => {
    const m =
      sql.match(/(?:INTO|FROM|UPDATE)\s+([a-zA-Z0-9_]+)/i) ||
      sql.match(/TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    return m ? m[1] : null;
  };

  return {
    exec: async () => {},
    close: async () => {},
    run: async (sql, params = []) => {
      const s = sql.trim();
      const table = getTableName(s);
      if (!table || !store[table]) return { changes: 0 };

      if (/^INSERT\s+INTO/i.test(s)) {
        const colMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
        const row = { createdAt: new Date().toISOString() };
        if (colMatch) {
          const cols = colMatch[1].split(',').map(c => c.trim());
          cols.forEach((col, idx) => {
            row[col] = params[idx] !== undefined ? params[idx] : null;
          });
        }
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
      if (!table || !store[table]) return null;

      if (/COUNT\(\*\)/i.test(s)) {
        const rows = store[table];
        return { count: rows.length, total: rows.length, totalAcademies: rows.length, totalExams: rows.length };
      }

      if (params.length > 0) {
        const keyVal = params[0];
        return (
          store[table].find(
            r =>
              r.id === keyVal ||
              r.referenceNumber === keyVal ||
              (r.email && String(r.email).toLowerCase().trim() === String(keyVal).toLowerCase().trim()) ||
              (r.company && String(r.company).toLowerCase().trim() === String(keyVal).toLowerCase().trim())
          ) || null
        );
      }

      return store[table][0] || null;
    },
    all: async (sql, params = []) => {
      const s = sql.trim();
      if (/^PRAGMA\s+table_info/i.test(s)) {
        return [];
      }
      const table = getTableName(s);
      if (!table || !store[table]) return [];
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

  await ensureColumns('student_academy_enquiries', [
    { name: 'studentEmail', type: 'TEXT' },
    { name: 'studentPhone', type: 'TEXT' }
  ]);

  console.log('Database initialized successfully.');
};

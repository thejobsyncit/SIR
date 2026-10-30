import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open SQLite database connection
let dbInstance = null;

export const getDbPath = () => {
  return process.env.DATABASE_PATH || path.join(__dirname, 'sir_recruitment.db');
};

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable WAL mode for better concurrency and reliability in production
  try {
    await dbInstance.run('PRAGMA journal_mode = WAL;');
    await dbInstance.run('PRAGMA foreign_keys = ON;');
  } catch (pragmaErr) {
    console.warn('SQLite PRAGMA setup warning:', pragmaErr.message);
  }

  await initDb(dbInstance);
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
    const db = await getDb();
    const result = await db.get('SELECT 1 as alive');
    const dbPath = getDbPath();
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    return { status: 'connected', alive: result && result.alive === 1, sizeBytes: dbSize };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

const initDb = async (db) => {
  // Create tables if they don't exist
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
  `);

  // Safe migration helper
  const ensureColumns = async (tableName, columnDefs) => {
    try {
      const existingCols = await db.all(`PRAGMA table_info(${tableName})`);
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

  // Safe migration: Ensure leads table has consulting, recruitment and workflow columns
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
    // Phase 2: Nine Core Services columns (recruitment, staffing, executive search, visa, work permit)
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
    { name: 'department', type: 'TEXT' }
  ]);

  // Safe migration: Ensure clients/organizations table has enterprise fields
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

  console.log('Database initialized successfully with SQLite.');
};

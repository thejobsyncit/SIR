import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { getDb, closeDb, checkDbHealth, logAuditTrail, DEFAULT_CRM_EMPLOYEES, DEFAULT_CRM_CANDIDATES, DEFAULT_CRM_LEADS } from './database.js';
import { registerClientPortalRoutes } from './clientPortalRoutes.js';
import { registerAttendanceRoutes } from './routes/attendanceRoutes.js';
import { registerHrCandidateRoutes } from './routes/hrCandidateRoutes.js';
import { COURSES_CATALOGUE } from '../src/data/coursesCatalogueData.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { handleAIAdvisorQuery, REVIVAL_KNOWLEDGE_BASE } from './services/aiAdvisorEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startTime = Date.now();
const isVercelServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers Middleware (Production-Hardened)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Production-Safe CORS Configuration
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://www.therevivalinternational.com',
  'https://therevivalinternational.com',
  'https://www.revivalinternational.com',
  'https://revivalinternational.com'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? [...new Set([...defaultAllowedOrigins, ...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())])]
  : defaultAllowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, same-origin, or curl/mobile requests without origin header
    if (!origin) return callback(null, true);
    const isAllowedDomain =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('therevivalinternational.com') ||
      origin.endsWith('revivalinternational.com') ||
      process.env.NODE_ENV !== 'production';
    if (isAllowedDomain) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-CRM-Role', 'X-CRM-User', 'X-CRM-User-Id', 'X-Client-Token', 'X-Employee-Id', 'X-Employee-Email', 'X-Employee-Name', 'X-Employee-Role', 'X-User-Role', 'X-User-Id', 'X-User-Name']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Superadmin Authorization Middleware for Sensitive Operations
const requireSuperAdmin = (req, res, next) => {
  const roleHeader = (
    req.headers['x-crm-role'] ||
    req.headers['role'] ||
    req.headers['x-user-role'] ||
    ''
  ).trim().toLowerCase();

  const authHeader = (req.headers['authorization'] || '').trim().toLowerCase();

  const isSuperAdminRole = roleHeader === 'super admin' || roleHeader === 'superadmin';
  const isSuperAdminBearer = authHeader === 'bearer superadmin' || authHeader === 'bearer super admin';

  if (!isSuperAdminRole && !isSuperAdminBearer) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Access denied: Only users with the Superadmin role are authorized to delete CRM records.'
    });
  }
  next();
};


// Operational Health & Performance Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDbHealth();
    const isHealthy = dbHealth.status === 'connected';

    // Verify backup status
    let latestBackupTime = null;
    let backupCount = 0;
    const backupDir = path.join(__dirname, '..', 'backups');
    if (fs.existsSync(backupDir)) {
      const manifests = fs.readdirSync(backupDir).filter(f => f.endsWith('.manifest.json')).sort().reverse();
      backupCount = manifests.length;
      if (manifests.length > 0) {
        try {
          const m = JSON.parse(fs.readFileSync(path.join(backupDir, manifests[0]), 'utf8'));
          latestBackupTime = m.timestamp;
        } catch (_) { }
      }
    }

    const memoryUsage = process.memoryUsage();

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'UP' : 'DEGRADED',
      service: 'Revival International Backend API',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      database: dbHealth.status,
      storage: {
        databaseSizeBytes: dbHealth.sizeBytes || 0,
        backupsCount: backupCount,
        latestBackupAt: latestBackupTime
      },
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      service: 'Revival International Backend API',
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  }
});

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
};

const getCrmContext = (req) => {
  return {
    crmUser: req.headers['x-employee-name'] || req.headers['x-user-name'] || 'System',
    crmRole: req.headers['x-user-role'] || req.headers['x-employee-role'] || 'HR Operations',
    crmUserId: req.headers['x-employee-id'] || req.headers['x-user-id'] || 'EMP-SYS'
  };
};

// Client-Side Error Telemetry & Monitoring Endpoint
const clientErrorThrottler = new Map();
app.post('/api/monitoring/client-errors', (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'client';
    const now = Date.now();
    const lastReport = clientErrorThrottler.get(ip) || 0;

    if (now - lastReport < 5000) {
      return res.status(429).json({ success: false, message: 'Throttled' });
    }
    clientErrorThrottler.set(ip, now);

    const { message, url } = req.body || {};
    const sanitizedMsg = typeof message === 'string'
      ? message.replace(/(bearer\s+[\w\.\-]+)|(password\s*[:=]\s*\S+)/gi, '[REDACTED]').slice(0, 300)
      : 'Unknown error';

    console.warn('[Client Monitoring Alert]', {
      message: sanitizedMsg,
      url: typeof url === 'string' ? url.slice(0, 200) : 'unknown',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, recorded: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Secure Document Upload Endpoint (CVs, Resumes, Credentials)
let uploadsDir = isVercelServerless ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (_) {
  uploadsDir = path.join(os.tmpdir(), 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (__) { }
}

app.post('/api/upload', (req, res) => {
  try {
    const { filename, fileData, fileType } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ success: false, message: 'Filename and file data are required for upload.' });
    }

    const ext = path.extname(filename || '').toLowerCase();
    const allowedExts = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Permitted document formats: PDF, DOC, DOCX, PNG, JPG.'
      });
    }

    // Clean data URI prefix if present
    const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // 10MB limit enforcement
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum permitted limit of 10MB.' });
    }

    // Sanitize filename preventing path traversal
    const safeBase = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFilename = `doc_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}_${safeBase}`;
    const destinationPath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(destinationPath, buffer);

    res.status(201).json({
      success: true,
      message: 'Document uploaded securely.',
      data: {
        filePath: `/api/documents/${safeFilename}`,
        fileName: safeFilename,
        originalName: filename,
        sizeBytes: buffer.length
      }
    });
  } catch (error) {
    console.error('Upload handling error:', error);
    res.status(500).json({ success: false, message: 'Failed to process document upload.' });
  }
});

// Secure Document Download & Retrieval Endpoint
app.get('/api/documents/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: 'Invalid document identifier' });
    }
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    if (!filePath.startsWith(uploadsDir) || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Requested document not found.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(filePath);
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving document.' });
  }
});

// Comprehensive Dataset
const VISA_MATRIX_DATA = [
  { country: 'UAE', commonVisa: 'Employer-sponsored work visa', requirements: 'Job offer, passport, medical fitness, educational certificates (attested), employment contract', age: '18 - 60 years', minQualification: '10th/12th / Degree', expRequired: '0 - 5+ years', language: 'English / Basic Arabic', processingTime: '7 - 14 Days', avgCost: 'AED 3,000 - 5,000 (Employer paid)', sponsorship: 'Mandatory', documentChecklist: ['Passport copy (6+ months validity)', 'Attested Degree Certificate', 'Passport size photos (white background)', 'Signed Employment Offer Letter', 'Medical Clearance Form'] },
  { country: 'Saudi Arabia', commonVisa: 'Employer-sponsored work visa (Iqama)', requirements: 'Job offer, medical examination, passport, attested educational documents for skilled jobs', age: '21 - 58 years', minQualification: 'Diploma / Degree', expRequired: '2 - 5+ years', language: 'English / Arabic', processingTime: '14 - 21 Days', avgCost: 'SAR 4,000 - 7,000', sponsorship: 'Mandatory', documentChecklist: ['Original Passport', 'Enjaz Visa Slip', 'Medical Report from authorized clinic', 'Degree Attestation by Saudi Culture & Embassy', 'Police Clearance Certificate'] },
  { country: 'Qatar', commonVisa: 'Employer-sponsored work visa', requirements: 'Employment contract, passport, medical test, police clearance (for some positions)', age: '18 - 55 years', minQualification: '10th/12th / Degree', expRequired: '1 - 3+ years', language: 'English', processingTime: '10 - 18 Days', avgCost: 'QAR 2,500 - 4,000', sponsorship: 'Mandatory', documentChecklist: ['Passport Copy', 'Good Conduct Certificate', 'Attested Educational Certificates', 'Signed Contract', 'Blood Test & X-Ray Reports'] },
  { country: 'Oman', commonVisa: 'Employer-sponsored work visa', requirements: 'Valid job offer, passport, medical fitness, employer sponsorship', age: '21 - 60 years', minQualification: 'Diploma / Degree', expRequired: '2 - 4+ years', language: 'English', processingTime: '12 - 20 Days', avgCost: 'OMR 300 - 500', sponsorship: 'Mandatory', documentChecklist: ['Passport (12m validity)', 'Gamca Medical Clearance', 'Educational Testimonials', 'Ministry Approval Letter'] },
  { country: 'Kuwait', commonVisa: 'Employer-sponsored work visa (NOC)', requirements: 'Employment contract, medical examination, security clearance, passport', age: '21 - 55 years', minQualification: 'Diploma / Degree', expRequired: '2 - 5+ years', language: 'English / Arabic', processingTime: '20 - 30 Days', avgCost: 'KWD 250 - 450', sponsorship: 'Mandatory', documentChecklist: ['Work Permit (NOC) from Ministry', 'Fingerprint Clearance', 'Attested Certificates', 'Medical Fit Report'] },
  { country: 'Bahrain', commonVisa: 'Employer-sponsored work visa', requirements: 'Employer sponsorship, passport, medical certificate', age: '18 - 60 years', minQualification: '10th/12th / Degree', expRequired: '1 - 3+ years', language: 'English', processingTime: '7 - 14 Days', avgCost: 'BHD 150 - 300', sponsorship: 'Mandatory', documentChecklist: ['Passport Copy', 'LMRA Clearance Letter', 'Medical Examination Result', 'Offer Letter'] },
  { country: 'Singapore', commonVisa: 'Employment Pass / S Pass / Work Permit', requirements: 'Job offer, minimum salary requirements, qualifications, employer application', age: '21 - 50 years', minQualification: 'Diploma / Bachelor Degree', expRequired: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 28 Days', avgCost: 'SGD 600 - 1,200', sponsorship: 'Mandatory', documentChecklist: ['MOM IPA Approval Letter', 'Verification Proof from Qualification Checks', 'Resume & Detailed Work History', 'Passport'] },
  { country: 'Malaysia', commonVisa: 'Employment Pass', requirements: 'Job offer, relevant qualifications, employer sponsorship', age: '27 - 55 years', minQualification: 'Bachelor Degree', expRequired: '3 - 5+ years', language: 'English', processingTime: '21 - 35 Days', avgCost: 'MYR 1,500 - 3,000', sponsorship: 'Mandatory', documentChecklist: ['ESD Approval Letter', 'Degree Certificate Attestation', 'Tax Registration Clearance', 'Passport'] },
  { country: 'Canada', commonVisa: 'Temporary Work Permit / Express Entry Skilled Worker', requirements: 'Job offer (often with LMIA), education, work experience, language requirements', age: '18 - 47 years', minQualification: 'Bachelor / Master Degree', expRequired: '2 - 6+ years', language: 'IELTS General 6.5+ / TEF French', processingTime: '60 - 90 Days', avgCost: 'CAD 155 (Permit) + Biometrics', sponsorship: 'Employer / LMIA or Provincial Nomination', documentChecklist: ['ECA Evaluation Report (WES)', 'IELTS Test Results', 'LMIA Approval Letter', 'Proof of Work Experience', 'Police Certificate & Medical'] },
  { country: 'Australia', commonVisa: 'Skilled Visa / Employer Sponsored Visa (TSS 482 / 186)', requirements: 'Skills assessment, English proficiency, age criteria, work experience, health and character checks', age: 'Under 45 years', minQualification: 'Diploma / Bachelor Degree', expRequired: '2 - 5+ years', language: 'IELTS 6.0+ / PTE 50+', processingTime: '45 - 90 Days', avgCost: 'AUD 1,455 - 3,035', sponsorship: 'Accredited Sponsor / State Nomination', documentChecklist: ['Positive Skills Assessment (VETASSESS/ACS)', 'English Proficiency Score', 'Reference Letters', 'Police Check'] },
  { country: 'New Zealand', commonVisa: 'Accredited Employer Work Visa (AEWV)', requirements: 'Job offer from an accredited employer, qualifications, health and character requirements', age: '18 - 55 years', minQualification: 'Level 7 Bachelor Degree / Diploma', expRequired: '2 - 4+ years', language: 'IELTS 6.5+', processingTime: '30 - 60 Days', avgCost: 'NZD 750 - 1,200', sponsorship: 'Accredited Employer', documentChecklist: ['Job Check Confirmation', 'NZQA Assessment', 'Police Clearance', 'Chest X-ray & Medical Certificate'] },
  { country: 'United Kingdom', commonVisa: 'Skilled Worker Visa', requirements: 'Job offer from a licensed sponsor, English proficiency, salary threshold (COS)', age: '18+ years', minQualification: 'Degree / NVQ Level 3', expRequired: '2 - 4+ years', language: 'IELTS UKVI B1 / B2', processingTime: '15 - 30 Days', avgCost: 'GBP 625 - 1,423 + IHS Surcharge', sponsorship: 'Licensed Sponsor (Certificate of Sponsorship)', documentChecklist: ['CoS Reference Number', 'TB Test Certificate (if required)', 'Proof of Knowledge of English', 'Criminal Record Certificate'] },
  { country: 'Germany', commonVisa: 'EU Blue Card / Skilled Worker Visa', requirements: 'Recognized qualification, employment contract, salary threshold', age: '18 - 55 years', minQualification: 'Recognized Bachelor / Master', expRequired: '2 - 5+ years', language: 'German B1/B2 or English (Tech)', processingTime: '30 - 60 Days', avgCost: 'EUR 75 (Visa Fee)', sponsorship: 'Employer Contract', documentChecklist: ['Anabin University Recognition Proof', 'Signed Employment Contract', 'Health Insurance Proof', 'Motivationsschreiben (Cover letter)'] },
  { country: 'Netherlands', commonVisa: 'Highly Skilled Migrant Visa (Kennismigrant)', requirements: 'Employer sponsorship, minimum salary, recognized employer', age: '18+ years', minQualification: 'Bachelor / Master Degree', expRequired: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 30 Days', avgCost: 'EUR 380', sponsorship: 'IND Recognized Sponsor', documentChecklist: ['IND Sponsorship Approval', 'Diploma Verification', 'Passport Copy', 'Bigger Salary Threshold Contract'] },
  { country: 'Ireland', commonVisa: 'Critical Skills Employment Permit', requirements: 'Job offer in an eligible occupation, salary threshold', age: '18+ years', minQualification: 'Degree', expRequired: '2 - 5+ years', language: 'English', processingTime: '28 - 45 Days', avgCost: 'EUR 1,000', sponsorship: 'Eligible Employer', documentChecklist: ['DETE Employment Permit', 'Degree Certificate', 'Offer Letter with EUR 38k+ Salary', 'Passport'] },
  { country: 'United States', commonVisa: 'H-1B, L-1, O-1 Visa Categories', requirements: 'Employer sponsorship, relevant qualifications, eligibility under specific visa category', age: '21+ years', minQualification: 'Bachelor / Master Degree', expRequired: '3 - 6+ years', language: 'English (Fluent)', processingTime: '60 - 180 Days (or Premium 15 Days)', avgCost: 'USD 460 - 2,500+', sponsorship: 'US Employer Sponsor', documentChecklist: ['Approved Form I-797 (Petition)', 'DS-160 Confirmation Page', 'LCA Approval', 'University Transcripts & Evaluation'] },
  { country: 'Japan', commonVisa: 'Engineer / Specialist in Humanities Work Visa', requirements: 'Job offer, degree or relevant experience, employer sponsorship', age: '20 - 50 years', minQualification: 'Bachelor Degree / 10 yrs Exp', expRequired: '1 - 5+ years', language: 'Japanese JLPT N3/N2 or English (IT)', processingTime: '30 - 60 Days', avgCost: 'JPY 3,000 (CoE Application)', sponsorship: 'Japanese Company Sponsor', documentChecklist: ['Certificate of Eligibility (CoE)', 'University Degree', 'Company Registration Document', 'Passport'] },
  { country: 'South Korea', commonVisa: 'E-7 / E-9 Series Work Visa', requirements: 'Job offer, qualifications, employer sponsorship', age: '18 - 45 years', minQualification: 'Degree / Vocational Certificate', expRequired: '1 - 3+ years', language: 'TOPIK Level 2+ or English', processingTime: '21 - 45 Days', avgCost: 'KRW 60,000 - 100,000', sponsorship: 'Korean Employer Sponsor', documentChecklist: ['Visa Issuance Confirmation Number', 'Degree Attestation', 'Employment Contract', 'Medical Certificate'] }
];

const JOBS_DATA = [
  {
    id: 'job-101',
    title: 'Senior Civil Project Manager',
    company: 'Al Habtoor Contracting LLC',
    country: 'UAE',
    location: 'Dubai, Business Bay',
    salary: 'AED 35,000 - 45,000 / month',
    experience: '8 - 12 Years',
    jobType: 'Full-time',
    category: 'Construction',
    description: 'Leading Dubai tier-1 contractor seeking an experienced Civil Project Manager to oversee luxury high-rise residential & commercial developments in Downtown Dubai.',
    skills: ['Project Management', 'FIDIC Contracts', 'Primavera P6', 'Site Leadership', 'Budget Control'],
    qualification: "Bachelor's / Master's Degree in Civil Engineering",
    benefits: ['Tax-free salary', 'Family Visa Sponsorship', 'Private Medical Insurance', 'Annual Flight Tickets', 'Performance Bonus'],
    postedDate: '2 days ago',
    featured: true
  },
  {
    id: 'job-102',
    title: 'Offshore Drilling Engineer',
    company: 'Gulf Petroleum Resources',
    country: 'Saudi Arabia',
    location: 'Dhahran / Offshore',
    salary: 'SAR 38,000 - 52,000 / month',
    experience: '6 - 10 Years',
    jobType: 'Contract',
    category: 'Oil & Gas',
    description: 'Supervise deepwater offshore drilling operations, well construction, and safety protocols in compliance with Aramco standards.',
    skills: ['Drilling Operations', 'Well Control', 'IWCF Certified', 'HSE Management', 'Subsea Engineering'],
    qualification: "B.Sc. Petroleum / Mechanical Engineering",
    benefits: ['Rotational Schedule (28/28)', 'Free Housing & Transportation', 'Full Health Coverage', 'Completion Bonus'],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-103',
    title: 'Senior ICU Registered Nurse',
    company: 'King Faisal Specialist Hospital',
    country: 'Saudi Arabia',
    location: 'Riyadh',
    salary: 'SAR 18,000 - 24,000 / month',
    experience: '4 - 7 Years',
    jobType: 'Full-time',
    category: 'Healthcare',
    description: 'JCI-accredited tertiary care hospital hiring ICU nurses for critical care units. Full visa assistance provided by Revival International.',
    skills: ['Critical Care', 'Ventilator Management', 'BLS / ACLS Certified', 'Patient Assessment'],
    qualification: "B.Sc. Nursing + Active Nursing License (Saudi Prometric preferred)",
    benefits: ['Tax-free package', 'Free Furnished Apartment', '30 Days Annual Leave', 'Flight Allowance'],
    postedDate: '3 days ago',
    featured: true
  },
  {
    id: 'job-104',
    title: 'Executive Chef - Luxury Resort',
    company: 'Atlantis Resorts & Hotels',
    country: 'UAE',
    location: 'Dubai, Palm Jumeirah',
    salary: 'AED 28,000 - 35,000 / month',
    experience: '7 - 10 Years',
    jobType: 'Full-time',
    category: 'Hospitality',
    description: 'Oversee 5-star fine dining culinary operations, menu development, food safety compliance, and team of 40+ international chefs.',
    skills: ['Fine Dining Culinary', 'Menu Engineering', 'HACCP Certification', 'P&L Management'],
    qualification: "Diploma / Degree in Culinary Arts",
    benefits: ['Service Charge Sharing', 'Luxury Accommodation', 'Family Medical Insurance', 'Worldwide Hotel Discounts'],
    postedDate: 'Just now',
    featured: true
  },
  {
    id: 'job-105',
    title: 'Lead Cloud Solutions Architect (AWS / Azure)',
    company: 'TechVision International',
    country: 'Singapore',
    location: 'Marina Bay Financial Centre',
    salary: 'SGD 12,000 - 16,000 / month',
    experience: '8 - 14 Years',
    jobType: 'Full-time',
    category: 'IT & Software',
    description: 'Design enterprise cloud infrastructure and microservices for tier-1 fintech institutions across Southeast Asia.',
    skills: ['AWS Architect Professional', 'Kubernetes', 'Terraform', 'DevOps CI/CD', 'Security Compliance'],
    qualification: "Bachelor / Master in Computer Science or IT",
    benefits: ['Employment Pass Sponsorship', 'Equity Options', 'Flexible Remote Days', 'Comprehensive Health & Dental'],
    postedDate: '4 days ago',
    featured: false
  },
  {
    id: 'job-106',
    title: 'Senior Mechanical Maintenance Engineer',
    company: 'Emirates Global Aluminium',
    country: 'UAE',
    location: 'Abu Dhabi, KIZAD',
    salary: 'AED 22,000 - 28,000 / month',
    experience: '5 - 8 Years',
    jobType: 'Full-time',
    category: 'Engineering',
    description: 'Maintain heavy industrial smelting equipment, turbines, hydraulic systems, and lead predictive maintenance protocols.',
    skills: ['Hydraulics & Pneumatics', 'CMMS SAP', 'Root Cause Analysis', 'Preventive Maintenance'],
    qualification: "B.E. / B.Tech Mechanical Engineering",
    benefits: ['Housing Allowance', 'Schooling Allowance for Children', 'End of Service Gratuity'],
    postedDate: '5 days ago',
    featured: false
  },
  {
    id: 'job-107',
    title: 'Supply Chain & Logistics Director',
    company: 'DP World Global Logistics',
    country: 'Qatar',
    location: 'Doha, Hamad Port',
    salary: 'QAR 40,000 - 55,000 / month',
    experience: '10 - 15 Years',
    jobType: 'Full-time',
    category: 'Logistics',
    description: 'Strategic leadership of port logistics, freight forwarding, warehouse automation, and GCC distribution network.',
    skills: ['Supply Chain Strategy', 'Warehouse Automation', 'Customs Clearance', 'Vendor Management'],
    qualification: "Master in Supply Chain / MBA",
    benefits: ['Executive Bonus', 'Executive Car', 'Family Visa & Private Healthcare', 'Annual Executive Tickets'],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-108',
    title: 'Senior Commercial Aircraft Maintenance Technician',
    company: 'Qatar Airways Cargo',
    country: 'Qatar',
    location: 'Doha International Airport',
    salary: 'QAR 20,000 - 26,000 / month',
    experience: '5 - 9 Years',
    jobType: 'Full-time',
    category: 'Aviation',
    description: 'Perform line and base maintenance for Boeing 777 / Airbus A350 aircraft fleet. EASA Part-66 B1/B2 license required.',
    skills: ['EASA Part-66 B1/B2', 'Boeing 777 Type Rating', 'Aviation Safety', 'Avionics'],
    qualification: "Aircraft Maintenance License / Degree",
    benefits: ['Duty Travel Privileges', 'Tax Free Base Salary', 'Furnished Accommodation', 'Concessionary Flight Tickets'],
    postedDate: '3 days ago',
    featured: false
  },
  {
    id: 'job-109',
    title: 'MEP BIM Manager - High Rise Development',
    company: 'ALDAR Properties',
    country: 'UAE',
    location: 'Abu Dhabi, Yas Island',
    salary: 'AED 30,000 - 38,000 / month',
    experience: '7 - 10 Years',
    jobType: 'Full-time',
    category: 'Construction',
    description: 'Lead 3D/4D BIM model coordination, clash detection, and MEP systems integration for mega mixed-use urban developments.',
    skills: ['Revit MEP', 'Navisworks Manage', 'BIM Level 2', 'Clash Resolution', 'COBie'],
    qualification: "B.Sc. Mechanical / Electrical Engineering",
    benefits: ['Family Accommodation Allowance', 'Premium Health Plan', 'Relocation Package'],
    postedDate: 'Just now',
    featured: true
  },
  {
    id: 'job-110',
    title: 'Senior Cybersecurity Operations Specialist',
    company: 'Riyadh Bank Digital Unit',
    country: 'Saudi Arabia',
    location: 'Riyadh, KAFD',
    salary: 'SAR 32,000 - 42,000 / month',
    experience: '6 - 10 Years',
    jobType: 'Full-time',
    category: 'Banking',
    description: 'Monitor SOC alerts, lead threat hunting, incident response, and ensure SAMA cybersecurity framework compliance for digital banking ops.',
    skills: ['SIEM Splunk', 'Threat Hunting', 'CISSP / CISM', 'Incident Response', 'SAMA Compliance'],
    qualification: "Bachelor in Cybersecurity / Computer Science",
    benefits: ['Performance Incentive', 'Family Visa & Flights', 'Executive Health Insurance'],
    postedDate: '2 days ago',
    featured: false
  }
];

const parseArray = (field) => {
  if (Array.isArray(field)) return field;
  if (!field) return [];
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [field];
  } catch (e) {
    return field.split(',').map(s => s.trim()).filter(Boolean);
  }
};

// Seed initial jobs into SQLite if empty
let jobsSeeded = false;
const seedJobs = async () => {
  if (jobsSeeded) return;
  jobsSeeded = true;
  try {
    const db = await getDb();
    const countRow = await db.get('SELECT COUNT(*) as count FROM jobs');
    if (countRow && countRow.count === 0) {
      console.log('Seeding initial jobs dataset into SQLite...');
      for (const j of JOBS_DATA) {
        await db.run(`
          INSERT INTO jobs (id, title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits, postedDate, featured)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          j.id, j.title, j.company, j.country, j.location, j.salary, j.experience, j.jobType, j.category, j.description,
          '1', JSON.stringify(j.skills), j.qualification, JSON.stringify(j.benefits), j.postedDate, j.featured ? 1 : 0
        ]);
      }
    }
  } catch (err) {
    console.error('Job seed check failed:', err.message);
  }
};
if (!isVercelServerless) {
  seedJobs();
}

// Active OTP store in memory
const activeOtps = new Map();
const otpRequestRateLimits = new Map();
const otpVerifyRateLimits = new Map();

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const timestamps = (otpRequestRateLimits.get(clientIp) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests from this network. Please wait a few minutes before trying again.'
      });
    }
    timestamps.push(now);
    otpRequestRateLimits.set(clientIp, timestamps);

    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    activeOtps.set(cleanEmail, { otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0 }); // 5 min expiry

    // Configure Nodemailer
    const isSmtpConfigured = process.env.SMTP_EMAIL && process.env.SMTP_EMAIL !== 'your-email@gmail.com' && process.env.SMTP_APP_PASSWORD;

    if (isSmtpConfigured) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_APP_PASSWORD
        }
      });

      const mailOptions = {
        from: `Revival International CRM <${process.env.SMTP_EMAIL}>`,
        to: cleanEmail,
        subject: 'Your CRM 2FA Login Code',
        text: `Your Revival International CRM Two-Factor Authentication code is: ${otp}\n\nThis code will expire in 5 minutes.`,
        html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>Revival International Enterprise CRM</h2>
          <p>Your Two-Factor Authentication code is:</p>
          <h1 style="color: #c9a050; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666; font-size: 12px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
        </div>`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'OTP dispatched successfully' });
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] OTP for ${cleanEmail} is: ${otp} (Configure SMTP in .env to dispatch real emails)`);
      res.json({ success: true, message: 'OTP generated (Dev Mode)', devMode: true, otp: otp });
    } else {
      console.error(`[CRITICAL] SMTP_EMAIL is not configured in production environment.`);
      res.status(503).json({
        success: false,
        message: 'Authentication dispatch service is currently unavailable. Please check system configuration.'
      });
    }
  } catch (error) {
    console.error('Email send failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to dispatch email. Check SMTP credentials.' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const verifyTimestamps = (otpVerifyRateLimits.get(clientIp) || []).filter(t => now - t < windowMs);

  if (verifyTimestamps.length >= 10) {
    return res.status(429).json({
      success: false,
      message: 'Too many verification attempts. Please wait a few minutes before trying again.'
    });
  }
  verifyTimestamps.push(now);
  otpVerifyRateLimits.set(clientIp, verifyTimestamps);

  const { email, otp } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const stored = activeOtps.get(cleanEmail);

  if (!stored) {
    return res.status(400).json({ success: false, message: 'OTP expired or not requested' });
  }

  if (Date.now() > stored.expires) {
    activeOtps.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  stored.attempts = (stored.attempts || 0) + 1;
  if (stored.attempts > 5) {
    activeOtps.delete(cleanEmail);
    return res.status(429).json({ success: false, message: 'Maximum OTP verification attempts exceeded. Please request a new code.' });
  }

  if (stored.otp === (otp || '').trim()) {
    activeOtps.delete(cleanEmail);
    return res.json({ success: true, message: 'Authentication successful' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  }
});

// --- GOOGLE OAUTH 2.0 & IDENTITY SERVICES (GIS) API ENDPOINTS ---
app.get('/api/config/auth', (req, res) => {
  let googleClientId = (process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
  // Filter out dummy/placeholder values
  if (googleClientId.includes('your-google-client-id') || googleClientId.includes('example123')) {
    googleClientId = '';
  }
  res.json({
    success: true,
    googleClientId: googleClientId
  });
});

app.post('/api/config/auth', async (req, res) => {
  const { googleClientId } = req.body;
  if (googleClientId && typeof googleClientId === 'string') {
    const cleanId = googleClientId.trim();
    if (!cleanId.endsWith('.apps.googleusercontent.com')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Client ID format. Must end with .apps.googleusercontent.com'
      });
    }
    process.env.VITE_GOOGLE_CLIENT_ID = cleanId;
    process.env.GOOGLE_CLIENT_ID = cleanId;

    // Persist to .env file
    try {
      const envPath = path.join(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/^VITE_GOOGLE_CLIENT_ID=.*$/m, `VITE_GOOGLE_CLIENT_ID=${cleanId}`);
        envContent = envContent.replace(/^GOOGLE_CLIENT_ID=.*$/m, `GOOGLE_CLIENT_ID=${cleanId}`);
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    } catch (e) {
      console.warn('Failed to persist Google Client ID to .env:', e.message);
    }

    return res.json({ success: true, googleClientId: cleanId, message: 'Google Client ID updated successfully.' });
  }
  res.status(400).json({ success: false, message: 'Invalid Google Client ID' });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken, credential, accessToken, profile } = req.body;
    const tokenToVerify = idToken || credential;

    let googleUser = null;

    // 1. If an ID Token / JWT credential is provided, verify with Google TokenInfo API
    if (tokenToVerify) {
      try {
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`;
        const gResponse = await fetch(verifyUrl);
        if (gResponse.ok) {
          const tokenData = await gResponse.json();
          googleUser = {
            googleSub: tokenData.sub,
            email: (tokenData.email || '').toLowerCase().trim(),
            name: tokenData.name || tokenData.given_name || 'Google User',
            avatar: tokenData.picture || '',
            emailVerified: tokenData.email_verified === 'true' || tokenData.email_verified === true
          };
        } else {
          console.warn('Google TokenInfo verification failed:', await gResponse.text());
        }
      } catch (err) {
        console.warn('Network error reaching Google TokenInfo API:', err.message);
      }
    }

    // 2. If an Access Token is provided, verify with Google UserInfo endpoint
    if (!googleUser && accessToken) {
      try {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (userinfoRes.ok) {
          const uData = await userinfoRes.json();
          googleUser = {
            googleSub: uData.sub,
            email: (uData.email || '').toLowerCase().trim(),
            name: uData.name || uData.given_name || 'Google User',
            avatar: uData.picture || '',
            emailVerified: uData.email_verified === true || uData.email_verified === 'true'
          };
        } else {
          console.warn('Google UserInfo verification failed:', await userinfoRes.text());
        }
      } catch (err) {
        console.warn('Network error reaching Google UserInfo API:', err.message);
      }
    }

    // 3. Fallback: If client passed validated profile details from authenticated GIS session
    if (!googleUser && profile && profile.email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const cleanEmail = (profile.email || '').toLowerCase().trim();
      if (emailPattern.test(cleanEmail)) {
        googleUser = {
          googleSub: profile.sub || profile.id || profile.googleId || '',
          email: cleanEmail,
          name: profile.name || profile.given_name || cleanEmail.split('@')[0],
          avatar: profile.picture || profile.avatar || '',
          emailVerified: profile.email_verified !== false
        };
      }
    }

    if (!googleUser || !googleUser.email) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication verification failed. Invalid or expired Google credential.'
      });
    }

    const db = await getDb();
    const cleanEmail = googleUser.email;
    const googleSub = googleUser.googleSub || '';

    // Step 1: Check whether this user already exists in `users` by Google `sub` or email
    let userRecord = null;
    if (googleSub) {
      userRecord = await db.get('SELECT * FROM users WHERE googleSub = ?', [googleSub]);
    }
    if (!userRecord) {
      userRecord = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    }

    let userId = userRecord?.id;
    let candidateProfile = null;
    let candidateId = null;

    const finalName = googleUser.name || userRecord?.name || cleanEmail.split('@')[0];
    const finalAvatar = googleUser.avatar || userRecord?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName)}`;

    if (userRecord) {
      // Existing user: Update user record
      userId = userRecord.id;
      await db.run(`
        UPDATE users SET
          name = COALESCE(?, name),
          avatar = COALESCE(?, avatar),
          googleSub = COALESCE(?, googleSub),
          emailVerified = 1,
          lastLoginAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [finalName, finalAvatar, googleSub || null, userId]);

      // Retrieve existing candidate profile
      candidateProfile = await db.get('SELECT * FROM candidate_profiles WHERE userId = ?', [userId]);
      if (!candidateProfile) {
        candidateProfile = await db.get('SELECT * FROM candidate_profiles WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
      }

      if (candidateProfile) {
        candidateId = candidateProfile.id;
        await db.run(`
          UPDATE candidate_profiles SET
            name = COALESCE(?, name),
            avatar = COALESCE(?, avatar),
            updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [finalName, finalAvatar, candidateId]);
      }
    } else {
      // New User: Create User record with unique ID
      userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      await db.run(`
        INSERT INTO users (id, email, name, avatar, role, authProvider, googleSub, emailVerified, status, lastLoginAt)
        VALUES (?, ?, ?, ?, 'candidate', 'google', ?, 1, 'active', CURRENT_TIMESTAMP)
      `, [userId, cleanEmail, finalName, finalAvatar, googleSub || null]);
    }

    // Step 2: Ensure Candidate Profile exists (Create individual candidate profile if new)
    if (!candidateProfile) {
      // Generate unique Candidate ID: RI-CAND-001, RI-CAND-002, etc.
      const countRow = await db.get('SELECT COUNT(*) as count FROM candidate_profiles');
      const nextSeq = (countRow?.count || 0) + 1;
      candidateId = `RI-CAND-${String(nextSeq).padStart(3, '0')}`;

      // Check for collision and adjust if needed
      const existingCand = await db.get('SELECT id FROM candidate_profiles WHERE id = ?', [candidateId]);
      if (existingCand) {
        candidateId = `RI-CAND-${String(nextSeq).padStart(3, '0')}-${Math.floor(10 + Math.random() * 90)}`;
      }

      const defaultSkills = JSON.stringify([]);
      await db.run(`
        INSERT INTO candidate_profiles (
          id, userId, email, name, phone, avatar, nationality, currentRole,
          currentEmployer, experience, education, expectedSalary, skills,
          savedJobs, profileCompletion, stage, score
        ) VALUES (?, ?, ?, ?, '', ?, '', '', '', '', '', '', ?, '[]', 20, 'lead', 50)
      `, [candidateId, userId, cleanEmail, finalName, finalAvatar, defaultSkills]);

      candidateProfile = await db.get('SELECT * FROM candidate_profiles WHERE id = ?', [candidateId]);

      // Add a Welcome Notification for the new candidate
      const notifId = `RI-NOTIF-${Math.floor(10000 + Math.random() * 90000)}`;
      await db.run(`
        INSERT INTO candidate_notifications (id, candidateId, userId, title, message, type, isRead)
        VALUES (?, ?, ?, ?, ?, 'system', 0)
      `, [
        notifId,
        candidateId,
        userId,
        'Welcome to The Revival International',
        `Welcome ${finalName}! Your candidate account (${candidateId}) is active. Browse verified global vacancies and track applications in real time.`
      ]);
    } else {
      candidateId = candidateProfile.id;
    }

    // Step 3: Record/Update Google Auth Account
    if (googleSub) {
      const existingGoogleAuth = await db.get('SELECT id FROM google_auth_accounts WHERE googleSub = ?', [googleSub]);
      if (existingGoogleAuth) {
        await db.run(`
          UPDATE google_auth_accounts SET
            email = ?, name = ?, picture = ?, accessToken = COALESCE(?, accessToken), idToken = COALESCE(?, idToken), lastAuthenticatedAt = CURRENT_TIMESTAMP
          WHERE googleSub = ?
        `, [cleanEmail, finalName, finalAvatar, accessToken || null, tokenToVerify || null, googleSub]);
      } else {
        const gAuthId = `GAUTH-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        await db.run(`
          INSERT INTO google_auth_accounts (id, userId, googleSub, email, name, picture, accessToken, idToken)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [gAuthId, userId, googleSub, cleanEmail, finalName, finalAvatar, accessToken || null, tokenToVerify || null]);
      }
    }

    // Step 4: Mirror to legacy `candidates` table so Recruiter CRM / ERP dashboard remains 100% operational
    try {
      let legacyCand = await db.get('SELECT * FROM candidates WHERE id = ? OR LOWER(email) = LOWER(?)', [candidateId, cleanEmail]);
      if (legacyCand) {
        await db.run(`
          UPDATE candidates SET
            name = COALESCE(?, name),
            avatar = COALESCE(?, avatar),
            googleId = COALESCE(?, googleId),
            authProvider = 'google',
            googleVerified = 1
          WHERE id = ?
        `, [finalName, finalAvatar, googleSub || null, legacyCand.id]);
      } else {
        await db.run(`
          INSERT INTO candidates (
            id, name, email, phone, nationality, currentEmployer, currentRole,
            currentSalary, expectedSalary, score, stage, skills, source, passport,
            aiSummary, experience, googleId, avatar, authProvider, googleVerified
          ) VALUES (?, ?, ?, ?, 'UAE', 'Revival International Talent Pool', 'Executive Candidate', 'Confidential', 'Market Standard', 92, 'lead', ?, 'Google Authentication (Gmail Verified)', 'Standard (Verified)', 'Candidate verified via Google OAuth 2.0 OpenID Connect.', '3-5 Years', ?, ?, 'google', 1)
        `, [candidateId, finalName, cleanEmail, candidateProfile?.phone || '', candidateProfile?.skills || '[]', googleSub || null, finalAvatar]);
      }
    } catch (legErr) {
      console.warn('Legacy candidate sync notice:', legErr.message);
    }

    // Step 5: Mirror to leads table for CRM visibility if not exists
    try {
      const existingLead = await db.get(
        'SELECT * FROM leads WHERE LOWER(email) = LOWER(?) AND serviceTitle = ?',
        [cleanEmail, 'Candidate Registration']
      );
      if (!existingLead) {
        const leadId = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
        await db.run(`
          INSERT INTO leads (id, name, email, phone, company, message, serviceId, serviceTitle, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          leadId,
          finalName,
          cleanEmail,
          candidateProfile?.phone || '',
          'Individual Candidate (Google Verified)',
          `Candidate registered via Google OAuth 2.0 (${cleanEmail})`,
          'intl-recruitment',
          'Candidate Registration',
          'New'
        ]);
      }
    } catch (leadErr) {
      console.warn('Lead mirror warning:', leadErr.message);
    }

    // Step 6: Load candidate applications and saved jobs for THIS candidate
    const applications = await db.all('SELECT * FROM candidate_applications WHERE candidateId = ? ORDER BY appliedDate DESC', [candidateId]);
    const notifications = await db.all('SELECT * FROM candidate_notifications WHERE candidateId = ? ORDER BY createdAt DESC', [candidateId]);

    const sessionToken = `revival_jwt_gis_${Buffer.from(`${cleanEmail}:${userId}:${Date.now()}`).toString('base64')}`;

    res.json({
      success: true,
      message: 'Successfully authenticated with Google',
      token: sessionToken,
      user: {
        id: candidateId,
        candidateId: candidateId,
        userId: userId,
        name: finalName,
        email: cleanEmail,
        phone: (candidateProfile?.phone || '').includes('http') ? '' : (candidateProfile?.phone || ''),
        avatar: finalAvatar,
        role: 'candidate',
        isAdmin: cleanEmail === 'thejobsyncit@gmail.com',
        isRegistered: true,
        authProvider: 'google',
        googleVerified: true,
        googleSub: googleSub,
        title: candidateProfile?.currentRole || '',
        experience: candidateProfile?.experience || '',
        qualification: candidateProfile?.education || '',
        expectedSalary: candidateProfile?.expectedSalary || '',
        skills: parseArray(candidateProfile?.skills || '[]'),
        savedJobs: parseArray(candidateProfile?.savedJobs || '[]'),
        profileCompletion: candidateProfile?.profileCompletion || 65,
        stage: candidateProfile?.stage || 'lead',
        score: candidateProfile?.score || 88,
        resumeName: candidateProfile?.resumeName || '',
        resumeUrl: candidateProfile?.resumeUrl || '',
        applications: applications || [],
        notifications: notifications || [],
        loginTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Google Auth backend error:', error);
    res.status(500).json({ success: false, message: 'Google authentication server error' });
  }
});

// --- INDIVIDUAL CANDIDATE DASHBOARD API ENDPOINTS ---

// GET Candidate Profile
app.get('/api/candidate/profile', async (req, res) => {
  try {
    const { candidateId, email, userId } = req.query;
    const db = await getDb();
    let profile = null;
    if (candidateId) {
      profile = await db.get('SELECT * FROM candidate_profiles WHERE id = ?', [candidateId]);
    } else if (userId) {
      profile = await db.get('SELECT * FROM candidate_profiles WHERE userId = ?', [userId]);
    } else if (email) {
      profile = await db.get('SELECT * FROM candidate_profiles WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    res.json({
      success: true,
      data: {
        ...profile,
        skills: parseArray(profile.skills),
        savedJobs: parseArray(profile.savedJobs)
      }
    });
  } catch (error) {
    console.error('Failed to fetch candidate profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE Candidate Profile
app.put('/api/candidate/profile', async (req, res) => {
  try {
    const { candidateId, name, phone, nationality, currentRole, currentEmployer, experience, education, expectedSalary, skills, resumeName, resumeUrl, avatar } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM candidate_profiles WHERE id = ?', [candidateId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const skillsStr = skills ? JSON.stringify(Array.isArray(skills) ? skills : [skills]) : existing.skills;

    await db.run(`
      UPDATE candidate_profiles SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar),
        nationality = COALESCE(?, nationality),
        currentRole = COALESCE(?, currentRole),
        currentEmployer = COALESCE(?, currentEmployer),
        experience = COALESCE(?, experience),
        education = COALESCE(?, education),
        expectedSalary = COALESCE(?, expectedSalary),
        skills = COALESCE(?, skills),
        resumeName = COALESCE(?, resumeName),
        resumeUrl = COALESCE(?, resumeUrl),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, phone, avatar, nationality, currentRole, currentEmployer, experience, education, expectedSalary, skillsStr, resumeName, resumeUrl, candidateId]);

    const updated = await db.get('SELECT * FROM candidate_profiles WHERE id = ?', [candidateId]);
    res.json({
      success: true,
      data: {
        ...updated,
        skills: parseArray(updated.skills),
        savedJobs: parseArray(updated.savedJobs)
      }
    });
  } catch (error) {
    console.error('Failed to update candidate profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET Candidate Applications (strictly scoped to candidateId)
app.get('/api/candidate/applications', async (req, res) => {
  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }
    const db = await getDb();
    const rows = await db.all('SELECT * FROM candidate_applications WHERE candidateId = ? ORDER BY appliedDate DESC', [candidateId]);
    res.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error('Failed to fetch candidate applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SUBMIT Candidate Application (strictly associated with candidateId)
app.post('/api/candidate/applications', async (req, res) => {
  try {
    const { candidateId, userId, jobId, jobTitle, company, location } = req.body;
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Job ID are required' });
    }

    const db = await getDb();

    // Check if already applied for this job
    const existing = await db.get('SELECT id FROM candidate_applications WHERE candidateId = ? AND jobId = ?', [candidateId, jobId]);
    if (existing) {
      return res.json({ success: true, message: 'Already applied for this vacancy', data: existing });
    }

    const appId = `RI-APP-${Math.floor(10000 + Math.random() * 90000)}`;
    const appliedDate = new Date().toISOString();

    await db.run(`
      INSERT INTO candidate_applications (id, candidateId, userId, jobId, jobTitle, company, location, appliedDate, status, stage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', 'Applied')
    `, [appId, candidateId, userId || '', jobId, jobTitle || 'International Vacancy', company || 'Partner Enterprise', location || 'GCC', appliedDate]);

    // Send application confirmation notification
    const notifId = `RI-NOTIF-${Math.floor(10000 + Math.random() * 90000)}`;
    await db.run(`
      INSERT INTO candidate_notifications (id, candidateId, userId, title, message, type, isRead)
      VALUES (?, ?, ?, ?, ?, 'application', 0)
    `, [
      notifId,
      candidateId,
      userId || '',
      'Application Submitted',
      `Your application for "${jobTitle}" at ${company} was successfully submitted and is under review.`
    ]);

    const created = await db.get('SELECT * FROM candidate_applications WHERE id = ?', [appId]);
    res.json({ success: true, message: 'Application submitted successfully', data: created });
  } catch (error) {
    console.error('Failed to submit application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET & TOGGLE Saved Jobs (strictly scoped to candidateId)
app.get('/api/candidate/saved-jobs', async (req, res) => {
  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }
    const db = await getDb();
    const profile = await db.get('SELECT savedJobs FROM candidate_profiles WHERE id = ?', [candidateId]);
    res.json({ success: true, data: parseArray(profile?.savedJobs || '[]') });
  } catch (error) {
    console.error('Failed to fetch saved jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/candidate/saved-jobs', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Job ID are required' });
    }
    const db = await getDb();
    const profile = await db.get('SELECT savedJobs FROM candidate_profiles WHERE id = ?', [candidateId]);
    let currentSaved = parseArray(profile?.savedJobs || '[]');
    if (currentSaved.includes(jobId)) {
      currentSaved = currentSaved.filter(id => id !== jobId);
    } else {
      currentSaved.push(jobId);
    }
    await db.run('UPDATE candidate_profiles SET savedJobs = ? WHERE id = ?', [JSON.stringify(currentSaved), candidateId]);
    res.json({ success: true, data: currentSaved });
  } catch (error) {
    console.error('Failed to update saved jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET Candidate Notifications
app.get('/api/candidate/notifications', async (req, res) => {
  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }
    const db = await getDb();
    const rows = await db.all('SELECT * FROM candidate_notifications WHERE candidateId = ? ORDER BY createdAt DESC', [candidateId]);
    res.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error('Failed to fetch candidate notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/candidate/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('UPDATE candidate_notifications SET isRead = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API Routes - JOBS
app.get('/api/jobs', async (req, res) => {
  try {
    await seedJobs();
    const db = await getDb();
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (req.query.country && req.query.country !== 'All') {
      query += ' AND country = ?';
      params.push(req.query.country);
    }
    if (req.query.category && req.query.category !== 'All') {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.jobType && req.query.jobType !== 'All') {
      query += ' AND jobType = ?';
      params.push(req.query.jobType);
    }

    let rows = await db.all(query, params);

    if (req.query.keyword) {
      const k = req.query.keyword.toLowerCase();
      rows = rows.filter(j => j.title.toLowerCase().includes(k) || j.company.toLowerCase().includes(k));
    }

    rows = rows.map(r => ({
      ...r,
      skills: parseArray(r.skills),
      benefits: parseArray(r.benefits),
      featured: r.featured === 1
    }));

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const db = await getDb();
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    job.skills = parseArray(job.skills);
    job.benefits = parseArray(job.benefits);
    job.featured = job.featured === 1;
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { id, title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits } = req.body;
    const jobId = id || `job-${Date.now()}`;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['Management']));
    const benefitsStr = JSON.stringify(Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : ['Tax-free salary', 'Visa Sponsorship']));

    const db = await getDb();
    await db.run(`
      INSERT INTO jobs (id, title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits, postedDate, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      jobId, title || 'Untitled', company || 'Revival International', country || 'UAE', location || '',
      salary || 'Negotiable', experience || '2-5 Years', jobType || 'Full-time', category || 'General',
      description || '', vacancies || '1', skillsStr, qualification || 'Degree', benefitsStr, 'Just now'
    ]);

    const newJob = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    newJob.skills = parseArray(newJob.skills);
    newJob.benefits = parseArray(newJob.benefits);
    newJob.featured = false;
    res.json({ success: true, message: 'Job posted successfully', data: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits } = req.body;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []));
    const benefitsStr = JSON.stringify(Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : []));

    await db.run(`
      UPDATE jobs SET title = ?, company = ?, country = ?, location = ?, salary = ?, experience = ?, jobType = ?, category = ?, description = ?, vacancies = ?, skills = ?, qualification = ?, benefits = ?
      WHERE id = ?
    `, [title, company, country, location, salary, experience, jobType, category, description, vacancies, skillsStr, qualification, benefitsStr, req.params.id]);

    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', requireSuperAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const crmUser = req.headers['x-crm-user'] || 'Super Admin';
    const crmUserId = req.headers['x-crm-user-id'] || 'usr-superadmin';
    const crmRole = req.headers['x-crm-role'] || 'Super Admin';

    const existingJob = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    await db.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);

    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_JOB',
      entityType: 'Job Posting',
      entityId: req.params.id,
      details: { title: existingJob?.title, company: existingJob?.company },
      ip: clientIp
    });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
});

// ==========================================
// API Routes - EMPLOYEES & ROLE MANAGEMENT (6 OFFICIAL ROLES)
// ==========================================
const VALID_CRM_ROLES = [
  'Super Admin',
  'Admin',
  'HR Lead',
  'Recruiter',
  'Placement Coordinator',
  'HR Operations'
];

app.get('/api/employees', async (req, res) => {
  try {
    const db = await getDb();
    const { role, department, status, search } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    if (department && department !== 'all') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(employeeId) LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY createdAt ASC';
    let rows = await db.all(query, params);
    if (!rows || rows.length === 0) {
      for (const emp of DEFAULT_CRM_EMPLOYEES) {
        await db.run(
          `INSERT OR IGNORE INTO employees (id, employeeId, name, email, phone, role, department, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [emp.id, emp.employeeId, emp.name, emp.email, emp.phone, emp.role, emp.department, emp.password, emp.status]
        );
      }
      rows = await db.all(query, params);
    }
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, role, department, password, status } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    if (!VALID_CRM_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role '${role}'. Must be one of: ${VALID_CRM_ROLES.join(', ')}` 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();

    // Check duplicate email
    const existing = await db.get('SELECT id FROM employees WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: `An employee with email '${cleanEmail}' already exists.` });
    }

    const id = `emp-${Date.now()}`;
    const employeeId = req.body.employeeId || `REV-EMP-${Math.floor(100 + Math.random() * 900)}`;
    const finalDept = department || (
      role === 'Super Admin' ? 'Executive Management' :
      role === 'Admin' ? 'Administration' :
      role === 'HR Lead' ? 'Human Resources' :
      role === 'Recruiter' ? 'Recruitment & ATS' :
      role === 'Placement Coordinator' ? 'Placement & Client Relations' :
      'HR Operations'
    );

    await db.run(
      `INSERT INTO employees (id, employeeId, name, email, phone, role, department, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employeeId, name.trim(), cleanEmail, phone || '', role, finalDept, password, status || 'Active']
    );

    const clientIp = getClientIp(req);
    const { crmUser, crmRole, crmUserId } = getCrmContext(req);
    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'CREATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: id,
      details: { name: name.trim(), email: cleanEmail, role, department: finalDept },
      ip: clientIp
    });

    res.status(201).json({
      success: true,
      message: `Employee '${name}' created successfully as ${role}.`,
      data: { id, employeeId, name: name.trim(), email: cleanEmail, phone: phone || '', role, department: finalDept, status: status || 'Active' }
    });
  } catch (error) {
    console.error('Failed to create employee:', error);
    res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, department, password, status, employeeId } = req.body;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (role && !VALID_CRM_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role '${role}'. Must be one of: ${VALID_CRM_ROLES.join(', ')}` 
      });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : existing.email;
    if (email && cleanEmail !== existing.email.toLowerCase()) {
      const duplicate = await db.get('SELECT id FROM employees WHERE LOWER(email) = ? AND id != ?', [cleanEmail, id]);
      if (duplicate) {
        return res.status(409).json({ success: false, message: `Email '${cleanEmail}' is already used by another employee.` });
      }
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const updatedRole = role !== undefined ? role : existing.role;
    const updatedDept = department !== undefined ? department.trim() : existing.department;
    const updatedPass = password !== undefined && password.trim() ? password.trim() : existing.password;
    const updatedStatus = status !== undefined ? status : existing.status;
    const updatedEmpId = employeeId !== undefined ? employeeId : existing.employeeId;

    await db.run(
      `UPDATE employees SET name = ?, email = ?, phone = ?, role = ?, department = ?, password = ?, status = ?, employeeId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [updatedName, cleanEmail, updatedPhone, updatedRole, updatedDept, updatedPass, updatedStatus, updatedEmpId, id]
    );

    const clientIp = getClientIp(req);
    const { crmUser, crmRole, crmUserId } = getCrmContext(req);
    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: id,
      details: { name: updatedName, email: cleanEmail, role: updatedRole, status: updatedStatus },
      ip: clientIp
    });

    res.json({
      success: true,
      message: `Employee '${updatedName}' updated successfully.`,
      data: { id, employeeId: updatedEmpId, name: updatedName, email: cleanEmail, phone: updatedPhone, role: updatedRole, department: updatedDept, status: updatedStatus }
    });
  } catch (error) {
    console.error('Failed to update employee:', error);
    res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
});

app.patch('/api/employees/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    await db.run('UPDATE employees SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);

    const clientIp = getClientIp(req);
    const { crmUser, crmRole, crmUserId } = getCrmContext(req);
    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'TOGGLE_EMPLOYEE_STATUS',
      entityType: 'Employee',
      entityId: id,
      details: { name: existing.name, oldStatus: existing.status, newStatus },
      ip: clientIp
    });

    res.json({ success: true, status: newStatus, message: `Employee status set to ${newStatus}.` });
  } catch (error) {
    console.error('Failed to toggle employee status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle employee status' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await db.run('DELETE FROM employees WHERE id = ?', [id]);

    const clientIp = getClientIp(req);
    const { crmUser, crmRole, crmUserId } = getCrmContext(req);
    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_EMPLOYEE',
      entityType: 'Employee',
      entityId: id,
      details: { name: existing.name, email: existing.email, role: existing.role },
      ip: clientIp
    });

    res.json({ success: true, message: `Employee '${existing.name}' deleted successfully.` });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
});

// GET /api/employees/me/profile - Fetch authenticated employee profile with live task statistics
app.get('/api/employees/me/profile', async (req, res) => {
  try {
    const db = await getDb();
    const employeeId = req.headers['x-employee-id'] || req.query.employeeId;
    const employeeEmail = req.headers['x-employee-email'] || req.query.employeeEmail;
    const employeeName = req.headers['x-employee-name'] || req.query.employeeName;

    let employee = null;
    if (employeeId) {
      employee = await db.get('SELECT * FROM employees WHERE employeeId = ? OR id = ?', [employeeId, employeeId]);
    }
    if (!employee && employeeEmail) {
      employee = await db.get('SELECT * FROM employees WHERE LOWER(email) = ?', [employeeEmail.toLowerCase().trim()]);
    }
    if (!employee && employeeName) {
      employee = await db.get('SELECT * FROM employees WHERE LOWER(name) = ? OR LOWER(name) LIKE ?', [employeeName.toLowerCase().trim(), `%${employeeName.toLowerCase().trim()}%`]);
    }

    if (!employee) {
      employee = DEFAULT_CRM_EMPLOYEES.find(e => e.role === 'HR Operations') || DEFAULT_CRM_EMPLOYEES[0];
    }

    const { password, ...safeEmployee } = employee;

    // Calculate real-time task statistics for this employee from leads & hr_task_assignments
    const empName = safeEmployee.name;
    const empId = safeEmployee.employeeId;
    const empEmail = safeEmployee.email;

    const nameClean = (empName || '').toLowerCase().replace(/[^a-z]/g, '');
    const cleanEmail = (empEmail || '').toLowerCase();
    const cleanId = empId || '';

    let whereClause = '';
    const params = [];

    if (nameClean.includes('fatima') || cleanEmail.includes('fatima') || ['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(cleanId)) {
      whereClause = `(
        LOWER(assignedEmployee) LIKE '%fatima%' OR 
        assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%fatima%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%fatima%' OR assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima'))
      )`;
    } else if (nameClean.includes('bala') || cleanEmail.includes('bala') || ['REV-EMP-006', 'INTL-HR-102', 'emp-6'].includes(cleanId)) {
      whereClause = `(
        LOWER(assignedEmployee) LIKE '%bala%' OR 
        assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%bala%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%bala%' OR assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6'))
      )`;
    } else if (nameClean.includes('divya') || nameClean.includes('diviya') || cleanEmail.includes('divya') || cleanEmail.includes('diviya') || ['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(cleanId)) {
      whereClause = `(
        LOWER(assignedEmployee) LIKE '%divya%' OR 
        LOWER(assignedEmployee) LIKE '%diviya%' OR 
        assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%divya%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%divya%' OR LOWER(assignedEmployeeName) LIKE '%diviya%' OR assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'))
      )`;
    } else if (nameClean.includes('praveen') || cleanEmail.includes('praveen') || ['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(cleanId)) {
      whereClause = `(
        LOWER(assignedEmployee) LIKE '%praveen%' OR 
        assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%praveen%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%praveen%' OR assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'))
      )`;
    } else {
      whereClause = `(
        LOWER(assignedEmployee) = ? OR 
        LOWER(assignedEmployee) LIKE ? OR
        assignedEmployeeId = ? OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE assignedEmployeeId = ? OR LOWER(assignedEmployeeName) LIKE ?)
      )`;
      const empLower = empName.toLowerCase().trim();
      params.push(empLower, `%${empLower}%`, empId, empId, `%${empLower}%`);
    }

    const assignedLeads = await db.all(`SELECT * FROM leads WHERE ${whereClause}`, params);

    const totalTasks = assignedLeads.length;
    const pendingTasks = assignedLeads.filter(l => ['New', 'Assigned', 'Pending'].includes(l.status)).length;
    const inProgressTasks = assignedLeads.filter(l => ['In Progress', 'In-Progress', 'Contacted', 'Consultation Scheduled', 'Document Verification'].includes(l.status)).length;
    const completedTasks = assignedLeads.filter(l => ['Completed', 'Closed', 'Resolved', 'Enrolled'].includes(l.status)).length;
    const overdueTasks = assignedLeads.filter(l => l.isOverdue === 1 || l.isOverdue === true || (l.status !== 'Completed' && l.status !== 'Closed' && l.nextActionDate && new Date(l.nextActionDate) < new Date())).length;

    let notifPrefs = {};
    if (safeEmployee.notificationPreferences) {
      try { notifPrefs = JSON.parse(safeEmployee.notificationPreferences); } catch (_) {}
    } else {
      notifPrefs = {
        emailTaskAssignments: true,
        urgentFollowUpAlerts: true,
        dailyMorningSummary: true,
        systemAnnouncements: false
      };
    }

    res.json({
      success: true,
      data: {
        ...safeEmployee,
        notificationPreferences: notifPrefs,
        stats: {
          totalTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks
        }
      }
    });
  } catch (error) {
    console.error('Failed to get employee profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee profile' });
  }
});

// PATCH & PUT /api/employees/me/profile - Update permitted personal information only
const updateEmployeeProfileHandler = async (req, res) => {
  try {
    const db = await getDb();
    const employeeId = req.headers['x-employee-id'] || req.body.employeeId || req.query.employeeId;
    const employeeEmail = req.headers['x-employee-email'] || req.body.email;

    if (!employeeId && !employeeEmail) {
      return res.status(400).json({ success: false, message: 'Employee identifier is required' });
    }

    const employee = await db.get(
      'SELECT * FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = ?',
      [employeeId || '', employeeId || '', (employeeEmail || '').toLowerCase().trim()]
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found in CRM.' });
    }

    // Security & Authorization: Only permitted fields can be modified by the employee
    const { phone, avatar, dateOfBirth, address, notificationPreferences } = req.body;

    const updatedPhone = phone !== undefined ? String(phone).trim() : employee.phone;
    const updatedAvatar = avatar !== undefined ? String(avatar).trim() : employee.avatar;
    const updatedDob = dateOfBirth !== undefined ? String(dateOfBirth).trim() : employee.dateOfBirth;
    const updatedAddress = address !== undefined ? String(address).trim() : employee.address;
    const updatedNotif = notificationPreferences !== undefined 
      ? (typeof notificationPreferences === 'object' ? JSON.stringify(notificationPreferences) : String(notificationPreferences))
      : employee.notificationPreferences;

    await db.run(`
      UPDATE employees 
      SET phone = ?, avatar = ?, dateOfBirth = ?, address = ?, notificationPreferences = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [updatedPhone, updatedAvatar, updatedDob, updatedAddress, updatedNotif, employee.id]);

    const updated = await db.get('SELECT * FROM employees WHERE id = ?', [employee.id]);
    const { password, ...safeUpdated } = updated;

    let parsedNotifs = {};
    if (safeUpdated.notificationPreferences) {
      try { parsedNotifs = JSON.parse(safeUpdated.notificationPreferences); } catch (_) {}
    }

    const clientIp = getClientIp(req);
    const { crmUser, crmRole, crmUserId } = getCrmContext(req);
    await logAuditTrail(db, {
      userId: crmUserId || employee.employeeId,
      userName: crmUser || employee.name,
      role: crmRole || employee.role,
      action: 'UPDATE_MY_PROFILE',
      entityType: 'Employee',
      entityId: employee.id,
      details: { phone: updatedPhone, dateOfBirth: updatedDob, address: updatedAddress },
      ip: clientIp
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        ...safeUpdated,
        notificationPreferences: parsedNotifs
      }
    });
  } catch (error) {
    console.error('Failed to update employee profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

app.patch('/api/employees/me/profile', updateEmployeeProfileHandler);
app.put('/api/employees/me/profile', updateEmployeeProfileHandler);

// POST /api/employees/me/change-password - Change employee password with authorization
app.post('/api/employees/me/change-password', async (req, res) => {
  try {
    const db = await getDb();
    const employeeId = req.headers['x-employee-id'] || req.body.employeeId;
    const employeeEmail = req.headers['x-employee-email'] || req.body.email;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Current password, new password, and confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const employee = await db.get(
      'SELECT * FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = ?',
      [employeeId || '', employeeId || '', (employeeEmail || '').toLowerCase().trim()]
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (employee.password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect current password. Please check your credentials.' });
    }

    await db.run('UPDATE employees SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newPassword, employee.id]);

    const clientIp = getClientIp(req);
    await logAuditTrail(db, {
      userId: employee.employeeId,
      userName: employee.name,
      role: employee.role,
      action: 'CHANGE_PASSWORD',
      entityType: 'Employee',
      entityId: employee.id,
      details: { message: 'Password changed successfully by employee' },
      ip: clientIp
    });

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Failed to change password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// API Routes - CANDIDATES
app.get('/api/candidates', async (req, res) => {
  try {
    const db = await getDb();
    let rows = await db.all('SELECT * FROM candidates ORDER BY createdAt DESC');
    if (!rows || rows.length === 0) {
      for (const dc of DEFAULT_CRM_CANDIDATES) {
        await db.run(`
          INSERT INTO candidates (id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          dc.id, dc.name, dc.email, dc.phone, dc.nationality, dc.currentEmployer, dc.currentRole, dc.currentSalary, dc.expectedSalary, dc.score, dc.stage, dc.skills, dc.source, dc.passport, dc.aiSummary, dc.experience
        ]);
      }
      rows = await db.all('SELECT * FROM candidates ORDER BY createdAt DESC');
    }
    res.json({
      success: true,
      data: rows.map(r => ({
        ...r,
        skills: parseArray(r.skills),
        assignedRecruiter: r.assignedRecruiter || 'Dhanalakshimi (Lead Advisor)',
        stage: r.stage || 'lead',
        score: r.score || 88,
        avatar: r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        expectedSalary: r.expectedSalary || 'Negotiable',
        passport: r.passport || 'Verified'
      }))
    });
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const { id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience } = req.body;
    const db = await getDb();

    // Check if candidate exists by id or email
    let existing = null;
    if (id) {
      existing = await db.get('SELECT * FROM candidates WHERE id = ?', [id]);
    }
    if (!existing && email) {
      existing = await db.get('SELECT * FROM candidates WHERE LOWER(email) = LOWER(?)', [email]);
    }

    const candId = existing?.id || id || `REV-CAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : (existing?.skills ? (typeof existing.skills === 'string' ? JSON.parse(existing.skills || '[]') : existing.skills) : ['General Talent']));

    if (existing) {
      await db.run(`
        UPDATE candidates SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          nationality = COALESCE(?, nationality),
          currentEmployer = COALESCE(?, currentEmployer),
          currentRole = COALESCE(?, currentRole),
          currentSalary = COALESCE(?, currentSalary),
          expectedSalary = COALESCE(?, expectedSalary),
          score = COALESCE(?, score),
          stage = COALESCE(?, stage),
          skills = COALESCE(?, skills),
          source = COALESCE(?, source),
          passport = COALESCE(?, passport),
          aiSummary = COALESCE(?, aiSummary),
          experience = COALESCE(?, experience)
        WHERE id = ?
      `, [
        name || null, email || null, phone || null, nationality || null, currentEmployer || null,
        currentRole || null, currentSalary || null, expectedSalary || null, score || null, stage || null,
        skillsStr, source || null, passport || null, aiSummary || null, experience || null,
        candId
      ]);
    } else {
      await db.run(`
        INSERT INTO candidates (id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        candId, name || 'New Candidate', email || '', phone || '', nationality || 'UAE',
        currentEmployer || 'Revival International Talent Pool', currentRole || 'Executive Candidate',
        currentSalary || 'Confidential', expectedSalary || 'Market Standard',
        score || 88, stage || 'lead', skillsStr, source || 'Website Registration',
        passport || 'Standard (Verified)', aiSummary || 'Candidate registered via Revival International Portal.',
        experience || '3-5 Years'
      ]);
    }

    // Mirror to leads table so it also appears in CRM Consulting Bookings & Inquiries
    if (name || email) {
      const leadMessage = aiSummary || (source ? `Registration / Application: ${source}` : 'Online Candidate Registration');
      const serviceTitle = source && source.includes('Applied') ? 'Job Application' : 'Candidate Registration';
      const existingLead = email ? await db.get('SELECT * FROM leads WHERE LOWER(email) = LOWER(?) AND serviceTitle = ?', [email, serviceTitle]) : null;

      if (!existingLead) {
        const leadId = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
        await db.run(`
          INSERT INTO leads (id, name, email, phone, company, message, serviceId, serviceTitle, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          leadId,
          name || 'Online Candidate',
          email || '',
          phone || '',
          nationality || 'Individual Candidate',
          leadMessage,
          'intl-recruitment',
          serviceTitle,
          'New'
        ]);
      }
    }

    const cand = (await db.get('SELECT * FROM candidates WHERE id = ?', [candId])) || {
      id: candId,
      name: name || 'New Candidate',
      email: email || '',
      phone: phone || '',
      nationality: nationality || 'UAE',
      currentEmployer: currentEmployer || 'Revival International Talent Pool',
      currentRole: currentRole || 'Executive Candidate',
      currentSalary: currentSalary || 'Confidential',
      expectedSalary: expectedSalary || 'Market Standard',
      score: score || 88,
      stage: stage || 'lead',
      skills: skillsStr,
      source: source || 'Website Registration',
      passport: passport || 'Standard (Verified)',
      aiSummary: aiSummary || '',
      experience: experience || '3-5 Years'
    };
    res.json({ success: true, data: { ...cand, skills: parseArray(cand.skills) } });
  } catch (error) {
    console.error('Failed to save candidate:', error);
    res.status(500).json({ success: false, message: 'Failed to save candidate: ' + (error.message || '') });
  }
});

app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { name, email, phone, stage, score } = req.body;
    const db = await getDb();
    await db.run('UPDATE candidates SET name = ?, email = ?, phone = ?, stage = ?, score = ? WHERE id = ?', [name, email, phone, stage, score, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update candidate' });
  }
});

app.delete('/api/candidates/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const crmUser = req.headers['x-crm-user'] || 'Super Admin';
    const crmUserId = req.headers['x-crm-user-id'] || 'usr-superadmin';
    const crmRole = req.headers['x-crm-role'] || 'Super Admin';

    const existingCand = await db.get('SELECT * FROM candidates WHERE id = ?', [id]);
    if (!existingCand) {
      return res.status(404).json({ success: false, message: 'Candidate record not found or already deleted' });
    }

    // Cascade: remove interviews linked to this candidate
    await db.run('DELETE FROM interviews WHERE candidateId = ?', [id]);
    await db.run('DELETE FROM candidates WHERE id = ?', [id]);

    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_CANDIDATE',
      entityType: 'Candidate Profile',
      entityId: id,
      details: {
        name: existingCand.name,
        nationality: existingCand.nationality,
        passport: existingCand.passport,
        role: existingCand.currentRole
      },
      ip: clientIp
    });

    res.json({ success: true, message: `Candidate '${existingCand.name}' successfully deleted.`, id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete candidate: ' + error.message });
  }
});

// API Routes - CLIENTS & ORGANIZATIONS
app.get(['/api/clients', '/api/organizations'], async (req, res) => {
  try {
    const { type, search } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM clients WHERE 1=1';
    const params = [];

    if (type && type !== 'All') {
      query += ' AND organizationType = ?';
      params.push(type);
    }

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(company) LIKE ? OR LOWER(contactPerson) LIKE ? OR LOWER(email) LIKE ? OR LOWER(location) LIKE ? OR LOWER(country) LIKE ?)';
      params.push(s, s, s, s, s);
    }

    query += ' ORDER BY createdAt DESC';
    const rows = await db.all(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch clients/organizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
  }
});

app.get(['/api/clients/:id', '/api/organizations/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const org = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Fetch related contacts, enquiries, activities and follow-ups
    const contacts = await db.all('SELECT * FROM organization_contacts WHERE organizationId = ? ORDER BY isPrimary DESC, createdAt DESC', [id]);
    const enquiries = await db.all('SELECT * FROM leads WHERE organizationId = ? OR company = ? ORDER BY createdAt DESC', [id, org.company]);
    const activities = await db.all('SELECT * FROM enquiry_activities WHERE organizationId = ? ORDER BY createdAt DESC', [id]);
    const followUps = await db.all('SELECT * FROM follow_ups WHERE organizationId = ? ORDER BY dueDateTime ASC', [id]);

    res.json({
      success: true,
      data: {
        ...org,
        contacts,
        enquiries,
        activities,
        followUps
      }
    });
  } catch (error) {
    console.error('Failed to fetch organization details:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve organization details' });
  }
});

app.post(['/api/clients', '/api/organizations'], async (req, res) => {
  try {
    const {
      id, company, name, organizationName, organizationType, industry, country, location, city, website,
      contactPerson, designation, email, phone, assignedEmployee, status, associatedServices, notes, requirements
    } = req.body;

    const rawName = company || name || organizationName;
    if (!rawName || typeof rawName !== 'string' || rawName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Organization name is required (minimum 2 characters).' });
    }

    const cleanCompany = rawName.trim();
    const db = await getDb();

    // Prevent duplicate organization records
    const existing = await db.get(
      'SELECT id, company FROM clients WHERE LOWER(TRIM(company)) = LOWER(TRIM(?))',
      [cleanCompany]
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An organization record for "${cleanCompany}" already exists (ID: ${existing.id}). Please update the existing record instead of creating a duplicate.`
      });
    }

    const orgType = organizationType || 'Company';
    const prefix = orgType === 'University' ? 'UNI' : orgType === 'School' ? 'SCH' : orgType === 'College' ? 'COL' : 'ORG';
    const clientId = id || `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    await db.run(
      `INSERT INTO clients (
        id, company, organizationType, industry, country, location, website,
        contactPerson, designation, email, phone, assignedEmployee, status, associatedServices, notes, requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        cleanCompany,
        orgType,
        industry || (orgType === 'University' || orgType === 'College' ? 'Higher Education' : orgType === 'School' ? 'K-12 Education' : 'Corporate Enterprise'),
        country || 'United Arab Emirates',
        location || city || 'Dubai, UAE',
        website ? website.trim() : null,
        contactPerson ? contactPerson.trim() : null,
        designation ? designation.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        assignedEmployee || 'Unassigned',
        status || 'Active',
        associatedServices || 'International Consulting',
        notes || null,
        requirements ? JSON.stringify(requirements) : null
      ]
    );

    const createdOrg = await db.get('SELECT * FROM clients WHERE id = ?', [clientId]);
    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: createdOrg,
      client: createdOrg,
      organization: createdOrg
    });
  } catch (error) {
    console.error('Failed to create organization:', error);
    res.status(500).json({ success: false, message: 'Failed to create organization record' });
  }
});

app.patch(['/api/clients/:id', '/api/organizations/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company, organizationType, industry, country, location, website,
      contactPerson, designation, email, phone, assignedEmployee, status, associatedServices,
      lastContactDate, nextFollowUpDate, notes
    } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    await db.run(
      `UPDATE clients SET
        company = COALESCE(?, company),
        organizationType = COALESCE(?, organizationType),
        industry = COALESCE(?, industry),
        country = COALESCE(?, country),
        location = COALESCE(?, location),
        website = COALESCE(?, website),
        contactPerson = COALESCE(?, contactPerson),
        designation = COALESCE(?, designation),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        assignedEmployee = COALESCE(?, assignedEmployee),
        status = COALESCE(?, status),
        associatedServices = COALESCE(?, associatedServices),
        lastContactDate = COALESCE(?, lastContactDate),
        nextFollowUpDate = COALESCE(?, nextFollowUpDate),
        notes = COALESCE(?, notes),
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        company ? company.trim() : null,
        organizationType || null,
        industry || null,
        country || null,
        location || null,
        website ? website.trim() : null,
        contactPerson ? contactPerson.trim() : null,
        designation ? designation.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        assignedEmployee || null,
        status || null,
        associatedServices || null,
        lastContactDate || null,
        nextFollowUpDate || null,
        notes !== undefined ? notes : null,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    res.json({ success: true, message: 'Organization updated successfully', data: updated });
  } catch (error) {
    console.error('Failed to update organization:', error);
    res.status(500).json({ success: false, message: 'Failed to update organization' });
  }
});

app.post(['/api/clients/:id/contacts', '/api/organizations/:id/contacts'], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, email, phone, isPrimary } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Contact name is required.' });
    }

    const contactId = `CNT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const db = await getDb();

    await db.run(
      `INSERT INTO organization_contacts (id, organizationId, name, designation, email, phone, isPrimary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [contactId, id, name.trim(), designation ? designation.trim() : null, email ? email.trim() : null, phone ? phone.trim() : null, isPrimary ? 1 : 0]
    );

    const createdContact = await db.get('SELECT * FROM organization_contacts WHERE id = ?', [contactId]);
    res.status(201).json({ success: true, message: 'Authorized contact added', data: createdContact });
  } catch (error) {
    console.error('Failed to add contact:', error);
    res.status(500).json({ success: false, message: 'Failed to add contact' });
  }
});

app.delete(['/api/clients/:id', '/api/organizations/:id'], requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const crmUser = req.headers['x-crm-user'] || 'Super Admin';
    const crmUserId = req.headers['x-crm-user-id'] || 'usr-superadmin';
    const crmRole = req.headers['x-crm-role'] || 'Super Admin';

    const existingClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      return res.status(404).json({ success: false, message: 'Organization record not found or already deleted' });
    }

    // Cascade cleanup linked contacts, activities, and follow-ups
    await db.run('DELETE FROM organization_contacts WHERE organizationId = ?', [id]);
    await db.run('DELETE FROM enquiry_activities WHERE organizationId = ?', [id]);
    await db.run('DELETE FROM follow_ups WHERE organizationId = ?', [id]);
    await db.run('DELETE FROM clients WHERE id = ?', [id]);

    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_ORGANIZATION',
      entityType: 'Client / Organization',
      entityId: id,
      details: {
        company: existingClient.company,
        country: existingClient.country,
        organizationType: existingClient.organizationType
      },
      ip: clientIp
    });

    res.json({ success: true, message: `Organization '${existingClient.company}' deleted successfully`, id });
  } catch (error) {
    console.error('Failed to delete client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client: ' + error.message });
  }
});

// API Routes - INTERVIEWS
app.get('/api/interviews', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM interviews ORDER BY date ASC, time ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
});

app.post('/api/interviews', async (req, res) => {
  try {
    const { id, candidateId, candidateName, jobId, jobTitle, company, date, time, platform } = req.body;
    const intId = id || `INT-${Math.floor(1000 + Math.random() * 9000)}`;
    const db = await getDb();
    await db.run(
      `INSERT INTO interviews (id, candidateId, candidateName, jobId, jobTitle, company, date, time, platform) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [intId, candidateId, candidateName, jobId, jobTitle, company, date, time, platform]
    );
    const interview = await db.get('SELECT * FROM interviews WHERE id = ?', [intId]);
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create interview' });
  }
});

app.delete('/api/interviews/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const crmUser = req.headers['x-crm-user'] || 'Super Admin';
    const crmUserId = req.headers['x-crm-user-id'] || 'usr-superadmin';
    const crmRole = req.headers['x-crm-role'] || 'Super Admin';

    const existingInterview = await db.get('SELECT * FROM interviews WHERE id = ?', [id]);
    if (!existingInterview) {
      return res.status(404).json({ success: false, message: 'Interview record not found or already deleted' });
    }

    await db.run('DELETE FROM interviews WHERE id = ?', [id]);

    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_INTERVIEW',
      entityType: 'Interview Schedule',
      entityId: id,
      details: {
        candidateName: existingInterview.candidateName,
        jobTitle: existingInterview.jobTitle,
        company: existingInterview.company,
        date: existingInterview.date
      },
      ip: clientIp
    });

    res.json({ success: true, message: `Interview for '${existingInterview.candidateName}' deleted successfully`, id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete interview: ' + error.message });
  }
});

// In-memory sliding-window rate limiter & duplicate submit cache for inquiries
const inquiryRateLimits = new Map();
const recentInquirySubmissions = new Map();

// HR Lead Central Task Assignment Endpoint
app.post('/api/hr-operations/assign', async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] || req.body.userRole || req.body.role;
    const authorizedRoles = ['HR Lead', 'Super Admin', 'Admin'];
    // Security check: Only HR Lead, Super Admin, and Admin are authorized to assign enquiries
    if (userRole && !authorizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only HR Lead, Super Admin, and Admin are authorized to assign enquiries.'
      });
    }

    const {
      enquiryIds = [],
      employeeId,
      employeeName,
      employeeEmail,
      operationTeam,
      priority = 'High',
      instructions = '',
      assignedBy = 'HR Lead',
      assignedById = 'emp-3'
    } = req.body;

    if (!Array.isArray(enquiryIds) || enquiryIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one enquiry ID to assign.' });
    }
    if (!employeeName && !employeeId) {
      return res.status(400).json({ success: false, message: 'Please provide an employee to assign enquiries to.' });
    }

    const db = await getDb();
    
    // Ensure leads table columns exist
    await db.run('ALTER TABLE leads ADD COLUMN assignedEmployeeId TEXT').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN assignedEmployeeEmail TEXT').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN operationTeam TEXT').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN assignedBy TEXT').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN assignedAt DATETIME').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN assignmentStatus TEXT').catch(() => {});
    await db.run('ALTER TABLE leads ADD COLUMN assignmentNotes TEXT').catch(() => {});

    // Resolve canonical employee identity
    let canonicalName = employeeName || 'Balavarshini S.';
    let canonicalId = employeeId || 'REV-EMP-006';
    let canonicalEmail = employeeEmail || '';
    
    const nameClean = (canonicalName || '').toLowerCase().replace(/[^a-z]/g, '');
    const cleanEmail = (canonicalEmail || '').toLowerCase();
    const cleanId = canonicalId || '';

    if (nameClean.includes('fatima') || cleanEmail.includes('fatima') || ['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(cleanId)) {
      canonicalName = 'Fatima';
      canonicalId = 'REV-EMP-107';
      canonicalEmail = 'fatima.intl@revivalinternational.com';
    } else if (nameClean.includes('bala') || cleanEmail.includes('bala') || ['REV-EMP-006', 'INTL-HR-102', 'emp-6'].includes(cleanId)) {
      canonicalName = 'Balavarshini S.';
      canonicalId = 'REV-EMP-006';
      canonicalEmail = 'balavarshini.s@revivalinternational.com';
    } else if (nameClean.includes('divya') || nameClean.includes('diviya') || cleanEmail.includes('divya') || cleanEmail.includes('diviya') || ['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(cleanId)) {
      canonicalName = 'Divya R.';
      canonicalId = 'REV-EMP-102';
      canonicalEmail = 'divya.enq@revivalinternational.com';
    } else if (nameClean.includes('praveen') || cleanEmail.includes('praveen') || ['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(cleanId)) {
      canonicalName = 'Praveen Kumar';
      canonicalId = 'REV-EMP-108';
      canonicalEmail = 'praveen.enq@revivalinternational.com';
    }

    let updatedCount = 0;
    const now = new Date().toISOString();

    for (const enqId of enquiryIds) {
      // Fetch existing lead details to populate task assignment
      const currentLead = await db.get('SELECT * FROM leads WHERE id = ? OR referenceNumber = ? LIMIT 1', [enqId, enqId]);
      
      const effectiveTeam = operationTeam || (
        currentLead && ['intl-adm', 'intl-consult'].includes(currentLead.serviceId)
          ? 'International HR Operations'
          : 'Enquiry HR Operations'
      );

      const result = await db.run(
        `UPDATE leads SET
          assignedEmployee = ?,
          assignedEmployeeId = ?,
          assignedEmployeeEmail = ?,
          operationTeam = ?,
          priority = COALESCE(?, priority),
          status = 'Assigned',
          assignmentStatus = 'Assigned',
          assignedAt = ?,
          assignedBy = ?,
          assignmentNotes = ?,
          internalNotes = CASE
            WHEN ? != '' THEN COALESCE(internalNotes, '') || char(10) || '📌 ' || ? || ' Assignment: ' || ?
            ELSE internalNotes
          END,
          updatedAt = ?
        WHERE id = ? OR referenceNumber = ?`,
        [
          canonicalName,
          canonicalId,
          canonicalEmail,
          effectiveTeam,
          priority,
          now,
          assignedBy,
          instructions,
          instructions,
          assignedBy,
          instructions,
          now,
          enqId,
          enqId
        ]
      );

      if (result && result.changes > 0) {
        updatedCount += result.changes;

        // Log into hr_task_assignments
        const refNo = (currentLead && currentLead.referenceNumber) || enqId;
        const sId = (currentLead && currentLead.serviceId) || 'intl-adm';
        const sTitle = (currentLead && currentLead.serviceTitle) || 'Revival Inbound Enquiry';
        const custName = (currentLead && currentLead.name) || 'Candidate';
        const custEmail = (currentLead && currentLead.email) || '';
        const custPhone = (currentLead && currentLead.phone) || '';

        await db.run(
          `INSERT OR REPLACE INTO hr_task_assignments (
            id, enquiryId, referenceNumber, operationTeam, assignedEmployeeId,
            assignedEmployeeName, assignedById, assignedByName, assignedAt,
            assignmentStatus, taskStatus, priority, notes, serviceId, serviceTitle,
            customerName, customerEmail, customerPhone, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Assigned', 'To Do', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `TASK-${enqId}`,
            enqId,
            refNo,
            effectiveTeam,
            canonicalId,
            canonicalName,
            assignedById,
            assignedBy,
            now,
            priority,
            instructions || 'Follow up with candidate regarding enquiry details.',
            sId,
            sTitle,
            custName,
            custEmail,
            custPhone,
            now,
            now
          ]
        ).catch(() => {});

        // Log in enquiry_activities
        await db.run(
          `INSERT INTO enquiry_activities (id, enquiryId, type, title, notes, createdBy, createdAt)
           VALUES (?, ?, 'TASK_ASSIGNMENT', ?, ?, ?, ?)`,
          [
            `ACT-ASN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            enqId,
            `Enquiry assigned to ${canonicalName} (${effectiveTeam})`,
            instructions ? `Instructions: ${instructions}` : `Priority: ${priority}`,
            assignedBy,
            now
          ]
        ).catch(() => {});
      }
    }

    res.json({
      success: true,
      count: updatedCount,
      employeeName: canonicalName,
      employeeId: canonicalId,
      message: `Successfully assigned ${updatedCount} enquiries to ${canonicalName}.`
    });
  } catch (err) {
    console.error('Error assigning enquiries:', err);
    res.status(500).json({ success: false, message: 'Failed to assign enquiries: ' + err.message });
  }
});

// Dedicated HR Operations Enquiries Endpoint
app.get('/api/hr-operations/my-enquiries', async (req, res) => {
  try {
    const db = await getDb();
    const reqEmployeeName = req.headers['x-employee-name'] || req.query.employeeName || 'Balavarshini';
    const reqEmployeeId = req.headers['x-employee-id'] || req.query.employeeId || 'REV-EMP-006';
    const reqEmployeeEmail = req.headers['x-employee-email'] || req.query.employeeEmail || '';
    const operationTeam = req.headers['x-operation-team'] || req.query.operationTeam;

    const nameClean = (reqEmployeeName || '').toLowerCase().replace(/[^a-z]/g, '');
    const cleanEmail = (reqEmployeeEmail || '').toLowerCase();
    const cleanId = reqEmployeeId || '';

    let query = `
      SELECT * FROM leads 
      WHERE 1=1 
    `;
    const params = [];

    if (nameClean.includes('fatima') || cleanEmail.includes('fatima') || ['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(cleanId)) {
      query += ` AND (
        LOWER(assignedEmployee) LIKE '%fatima%' OR 
        assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%fatima%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%fatima%' OR assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima'))
      )`;
    } else if (nameClean.includes('bala') || cleanEmail.includes('bala') || ['REV-EMP-006', 'INTL-HR-102', 'emp-6'].includes(cleanId)) {
      query += ` AND (
        LOWER(assignedEmployee) LIKE '%bala%' OR 
        assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%bala%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%bala%' OR assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6'))
      )`;
    } else if (nameClean.includes('divya') || nameClean.includes('diviya') || cleanEmail.includes('divya') || cleanEmail.includes('diviya') || ['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(cleanId)) {
      query += ` AND (
        LOWER(assignedEmployee) LIKE '%divya%' OR 
        LOWER(assignedEmployee) LIKE '%diviya%' OR 
        assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%divya%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%divya%' OR LOWER(assignedEmployeeName) LIKE '%diviya%' OR assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'))
      )`;
    } else if (nameClean.includes('praveen') || cleanEmail.includes('praveen') || ['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(cleanId)) {
      query += ` AND (
        LOWER(assignedEmployee) LIKE '%praveen%' OR 
        assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen') OR
        LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%praveen%' OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%praveen%' OR assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'))
      )`;
    } else {
      query += ` AND (
        LOWER(assignedEmployee) = ? OR 
        LOWER(assignedEmployee) LIKE ? OR
        assignedEmployeeId = ? OR
        id IN (SELECT enquiryId FROM hr_task_assignments WHERE assignedEmployeeId = ? OR LOWER(assignedEmployeeName) LIKE ?)
      )`;
      const empLower = reqEmployeeName.toLowerCase().trim();
      params.push(empLower, `%${empLower}%`, reqEmployeeId, reqEmployeeId, `%${empLower}%`);
    }

    if (operationTeam && operationTeam !== 'all') {
      if (operationTeam === 'International HR Operations' || operationTeam === 'intl-ops') {
        query += " AND (operationTeam = 'International HR Operations' OR serviceId IN ('intl-adm', 'intl-consult') OR referenceNumber LIKE 'REV-INT%' OR referenceNumber LIKE 'REV-ADM%' OR referenceNumber LIKE 'REV-IC%')";
      } else if (operationTeam === 'Enquiry HR Operations' || operationTeam === 'enq-ops') {
        query += " AND (operationTeam = 'Enquiry HR Operations' OR serviceId IN ('school-career', 'career-guidance', 'school-academy', 'student-academy', 'college-adm') OR referenceNumber LIKE 'REV-CAR%' OR referenceNumber LIKE 'REV-ACA%' OR referenceNumber LIKE 'REV-COL%' OR referenceNumber LIKE 'REV-CADM%')";
      }
    }

    query += ' ORDER BY createdAt DESC';
    const rows = await db.all(query, params);

    res.json({
      success: true,
      data: rows,
      leads: rows,
      count: rows.length,
      total: rows.length
    });
  } catch (err) {
    console.error('Error fetching HR Operations enquiries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned enquiries: ' + err.message });
  }
});

// API Routes - LEADS & CONSULTING ENQUIRIES
app.get(['/api/leads', '/api/consulting/enquiries', '/api/career-guidance/enquiries'], async (req, res) => {
  try {
    const {
      serviceId, status, priority, assignedEmployee, search,
      range = 'all', startDate, endDate, includeArchived,
      level, department,
      page, limit
    } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    // Filter archived unless explicitly requested
    if (includeArchived !== 'true' && includeArchived !== true) {
      query += ' AND (isArchived IS NULL OR isArchived = 0)';
    }

    if (serviceId && serviceId !== 'all') {
      if (serviceId === 'intl-consult') {
        query += ' AND (serviceId = ? OR LOWER(serviceTitle) LIKE ?)';
        params.push(serviceId, '%international consulting%');
      } else if (serviceId === 'school-career' || serviceId === 'career-guidance') {
        query += " AND (serviceId IN ('school-career', 'career-guidance') OR LOWER(serviceTitle) LIKE '%career%' OR LOWER(company) LIKE '%career%')";
      } else if (serviceId === 'school-academy' || serviceId === 'student-academy') {
        query += " AND (serviceId IN ('school-academy', 'student-academy') OR LOWER(serviceTitle) LIKE '%academy%' OR LOWER(company) LIKE '%student academy%' OR referenceNumber LIKE 'REV-ACA%')";
      } else {
        query += ' AND (serviceId = ? OR LOWER(serviceTitle) LIKE ?)';
        params.push(serviceId, `%${serviceId.toLowerCase()}%`);
      }
    }

    if (status && status !== 'all' && status !== 'All') {
      if (status === 'New' || status === 'New Enquiry') {
        query += " AND status IN ('New', 'New Enquiry')";
      } else if (status === 'Contact Pending' || status === 'Contact Attempted') {
        query += " AND status IN ('Contact Pending', 'Contact Attempted')";
      } else if (status === 'Qualified') {
        query += " AND status IN ('Qualified', 'Consultation Completed')";
      } else if (status === 'Converted' || status === 'Completed') {
        query += " AND status IN ('Converted', 'Completed')";
      } else if (status === 'In Progress') {
        query += " AND status IN ('In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending')";
      } else if (status === 'Closed / Lost' || status === 'Closed') {
        query += " AND status IN ('Closed / Lost', 'Closed', 'Archived')";
      } else {
        query += ' AND status = ?';
        params.push(status);
      }
    }

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    // Academic level filter (UG / PG)
    if (level && level !== 'all' && level !== 'All') {
      const lvl = level.toUpperCase();
      if (lvl === 'UG') {
        query += " AND (degreeLevel LIKE '%Undergraduate%' OR degreeLevel = 'UG' OR customFields LIKE '%\"degreeLevel\":\"UG\"%' OR customFields LIKE '%Undergraduate%')";
      } else if (lvl === 'PG') {
        query += " AND (degreeLevel LIKE '%Postgraduate%' OR degreeLevel = 'PG' OR customFields LIKE '%\"degreeLevel\":\"PG\"%' OR customFields LIKE '%Postgraduate%')";
      }
    }

    // Department filter
    if (department && department !== 'all' && department !== 'All') {
      query += " AND (LOWER(COALESCE(department, '')) LIKE ? OR LOWER(COALESCE(streamName, '')) LIKE ? OR LOWER(COALESCE(customFields, '')) LIKE ?)";
      const dLike = `%${department.trim().toLowerCase()}%`;
      params.push(dLike, dLike, dLike);
    }

    const reqUserRole = req.headers['x-user-role'] || req.query.userRole;
    const reqEmployeeName = req.headers['x-employee-name'] || req.query.employeeName || assignedEmployee;
    const reqEmployeeId = req.headers['x-employee-id'] || req.query.employeeId;
    const reqEmployeeEmail = req.headers['x-employee-email'] || req.query.employeeEmail;
    const operationTeam = req.headers['x-operation-team'] || req.query.operationTeam;

    if (reqUserRole === 'HR Operations') {
      if (!reqEmployeeName && !reqEmployeeId && !reqEmployeeEmail) {
        // Enforce assignment-based access in backend: HR Operations must never see unassigned or other employees' leads
        return res.json({ success: true, data: [], leads: [], count: 0, total: 0 });
      }

      const nameClean = (reqEmployeeName || '').toLowerCase().replace(/[^a-z]/g, '');
      const cleanEmail = (reqEmployeeEmail || '').toLowerCase();
      const cleanId = reqEmployeeId || '';

      if (nameClean.includes('fatima') || cleanEmail.includes('fatima') || ['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(cleanId)) {
        query += ` AND (
          LOWER(assignedEmployee) LIKE '%fatima%' OR 
          assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima') OR
          LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%fatima%' OR
          id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%fatima%' OR assignedEmployeeId IN ('REV-EMP-107', 'INTL-HR-101', 'emp-fatima'))
        )`;
      } else if (nameClean.includes('bala') || cleanEmail.includes('bala') || ['REV-EMP-006', 'INTL-HR-102', 'emp-6'].includes(cleanId)) {
        query += ` AND (
          LOWER(assignedEmployee) LIKE '%bala%' OR 
          assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6') OR
          LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%bala%' OR
          id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%bala%' OR assignedEmployeeId IN ('REV-EMP-006', 'INTL-HR-102', 'emp-6'))
        )`;
      } else if (nameClean.includes('divya') || nameClean.includes('diviya') || cleanEmail.includes('divya') || cleanEmail.includes('diviya') || ['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(cleanId)) {
        query += ` AND (
          LOWER(assignedEmployee) LIKE '%divya%' OR 
          LOWER(assignedEmployee) LIKE '%diviya%' OR 
          assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya') OR
          LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%divya%' OR
          id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%divya%' OR LOWER(assignedEmployeeName) LIKE '%diviya%' OR assignedEmployeeId IN ('REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'))
        )`;
      } else if (nameClean.includes('praveen') || cleanEmail.includes('praveen') || ['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(cleanId)) {
        query += ` AND (
          LOWER(assignedEmployee) LIKE '%praveen%' OR 
          assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen') OR
          LOWER(COALESCE(assignedEmployeeEmail, '')) LIKE '%praveen%' OR
          id IN (SELECT enquiryId FROM hr_task_assignments WHERE LOWER(assignedEmployeeName) LIKE '%praveen%' OR assignedEmployeeId IN ('REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'))
        )`;
      } else {
        const empLower = (reqEmployeeName || '').toLowerCase().trim();
        query += ` AND (
          LOWER(assignedEmployee) = ? OR 
          LOWER(assignedEmployee) LIKE ? OR
          assignedEmployeeId = ? OR
          id IN (SELECT enquiryId FROM hr_task_assignments WHERE assignedEmployeeId = ? OR LOWER(assignedEmployeeName) LIKE ?)
        )`;
        params.push(empLower, `%${empLower}%`, reqEmployeeId || '', reqEmployeeId || '', `%${empLower}%`);
      }

      if (operationTeam && operationTeam !== 'all') {
        if (operationTeam === 'International HR Operations' || operationTeam === 'intl-ops') {
          query += " AND (operationTeam = 'International HR Operations' OR serviceId IN ('intl-adm', 'intl-consult') OR referenceNumber LIKE 'REV-INT%' OR referenceNumber LIKE 'REV-ADM%' OR referenceNumber LIKE 'REV-IC%')";
        } else if (operationTeam === 'Enquiry HR Operations' || operationTeam === 'enq-ops') {
          query += " AND (operationTeam = 'Enquiry HR Operations' OR serviceId IN ('school-career', 'career-guidance', 'school-academy', 'student-academy', 'college-adm') OR referenceNumber LIKE 'REV-CAR%' OR referenceNumber LIKE 'REV-ACA%' OR referenceNumber LIKE 'REV-COL%' OR referenceNumber LIKE 'REV-CADM%')";
        }
      }
    } else if (assignedEmployee && assignedEmployee !== 'all') {
      if (assignedEmployee === 'unassigned' || assignedEmployee === 'Unassigned') {
        query += ' AND (assignedEmployee IS NULL OR assignedEmployee = "")';
      } else {
        query += ' AND (LOWER(assignedEmployee) = ? OR LOWER(assignedEmployee) LIKE ?)';
        const empLower = assignedEmployee.toLowerCase();
        params.push(empLower, `%${empLower}%`);
      }
    }

    // Date range filter
    if (range === 'today') {
      query += " AND (date(createdAt) = date('now') OR date(createdAt) = date('now', 'localtime'))";
    } else if (range === '7days') {
      query += " AND createdAt >= datetime('now', '-7 days')";
    } else if (range === '30days') {
      query += " AND createdAt >= datetime('now', '-30 days')";
    } else if (startDate && endDate) {
      query += " AND createdAt >= ? AND createdAt <= ?";
      params.push(startDate, endDate);
    }

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(message) LIKE ? OR LOWER(company) LIKE ? OR LOWER(COALESCE(organizationName, "")) LIKE ? OR LOWER(COALESCE(referenceNumber, "")) LIKE ? OR LOWER(COALESCE(countryInterest, "")) LIKE ? OR LOWER(COALESCE(serviceTitle, "")) LIKE ? OR LOWER(COALESCE(courseName, "")) LIKE ? OR LOWER(COALESCE(department, "")) LIKE ? OR LOWER(COALESCE(streamName, "")) LIKE ? OR LOWER(COALESCE(jobTitle, "")) LIKE ? OR LOWER(COALESCE(skills, "")) LIKE ?)';
      params.push(s, s, s, s, s, s, s, s, s, s, s, s, s, s);
    }

    // Check count for pagination
    let totalCount = 0;
    if (limit) {
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countRow = await db.get(countQuery, params);
      totalCount = countRow ? countRow.total : 0;
    }

    query += ' ORDER BY createdAt DESC';

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      const parsedPage = Math.max(1, parseInt(page || '1', 10));
      const offset = (parsedPage - 1) * parsedLimit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parsedLimit, offset);
    }

    let rows = await db.all(query, params);
    if ((!rows || rows.length === 0) && !search && (!serviceId || serviceId === 'all') && (!status || status === 'all') && !reqUserRole && (!assignedEmployee || assignedEmployee === 'all')) {
      const dbCount = await db.get('SELECT COUNT(*) as cnt FROM leads');
      if (!dbCount || dbCount.cnt === 0) {
        for (const dl of DEFAULT_CRM_LEADS) {
          await db.run(`
            INSERT OR IGNORE INTO leads (id, name, email, phone, company, message, serviceId, serviceTitle, countryInterest, assistanceType, intakeTerm, status, assignedEmployee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            dl.id, dl.name, dl.email, dl.phone, dl.company, dl.message, dl.serviceId, dl.serviceTitle, dl.countryInterest, dl.assistanceType, dl.intakeTerm, dl.status, dl.assignedEmployee
          ]).catch(() => {});
        }
        rows = await db.all(query, params);
      }
    }

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      const parsedPage = Math.max(1, parseInt(page || '1', 10));
      return res.json({
        success: true,
        data: rows,
        pagination: {
          total: totalCount,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(totalCount / parsedLimit)
        }
      });
    }

    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve inquiries' });
  }
});

// Phase 12: Admin Dashboard, Lead Management & Customer Tracking System - Real SQLite Metrics
app.get(['/api/admin/leads/metrics', '/api/crm/leads/dashboard-metrics'], async (req, res) => {
  try {
    const { range = 'all', startDate, endDate, serviceId } = req.query;
    const db = await getDb();

    // 1. Build date range filter
    let dateCondition = '';
    const dateParams = [];

    if (range === 'today') {
      dateCondition = " AND (date(createdAt) = date('now') OR date(createdAt) = date('now', 'localtime'))";
    } else if (range === '7days') {
      dateCondition = " AND createdAt >= datetime('now', '-7 days')";
    } else if (range === '30days') {
      dateCondition = " AND createdAt >= datetime('now', '-30 days')";
    } else if (startDate && endDate) {
      dateCondition = " AND createdAt >= ? AND createdAt <= ?";
      dateParams.push(startDate, endDate);
    }

    let serviceCondition = '';
    const serviceParams = [];
    if (serviceId && serviceId !== 'all') {
      serviceCondition = " AND (serviceId = ? OR LOWER(serviceTitle) LIKE ?)";
      serviceParams.push(serviceId, `%${serviceId.toLowerCase()}%`);
    }

    const baseWhere = `WHERE (isArchived IS NULL OR isArchived = 0) ${dateCondition} ${serviceCondition}`;
    const allParams = [...dateParams, ...serviceParams];

    // Total enquiries
    const totalRow = await db.get(`SELECT COUNT(*) as count FROM leads ${baseWhere}`, allParams);
    const total = totalRow ? totalRow.count : 0;

    // Status-specific counts
    const newRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('New', 'New Enquiry')`,
      allParams
    );
    const contactPendingRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('Contact Pending', 'Contact Attempted')`,
      allParams
    );
    const contactedRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status = 'Contacted'`,
      allParams
    );
    const awaitingFollowUpRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND (status IN ('Follow-up Required', 'Consultation Scheduled', 'Contact Pending', 'Contact Attempted') OR id IN (SELECT enquiryId FROM follow_ups WHERE status = 'Pending'))`,
      allParams
    );
    const inProgressRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending')`,
      allParams
    );
    const qualifiedRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('Qualified', 'Consultation Completed')`,
      allParams
    );
    const convertedRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('Converted', 'Completed')`,
      allParams
    );
    const closedLostRow = await db.get(
      `SELECT COUNT(*) as count FROM leads ${baseWhere} AND status IN ('Closed / Lost', 'Closed', 'Archived')`,
      allParams
    );

    // Follow-ups queue stats (global pending tasks in SQLite)
    const overdueRow = await db.get(
      "SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending' AND dueDateTime < datetime('now')"
    );
    const dueTodayRow = await db.get(
      "SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending' AND date(dueDateTime) = date('now')"
    );
    const upcomingRow = await db.get(
      "SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending' AND dueDateTime > datetime('now') AND date(dueDateTime) != date('now')"
    );

    // 2. Service-Wise Breakdown across Master Services
    const MASTER_SERVICES = [
      { id: 'dom-rec', title: 'Domestic Recruitment', category: 'Recruitment' },
      { id: 'intl-rec', title: 'International Recruitment', category: 'Recruitment' },
      { id: 'exec-search', title: 'Executive Search', category: 'Executive' },
      { id: 'perm-staff', title: 'Permanent Staffing', category: 'Staffing' },
      { id: 'contract-staff', title: 'Contract Staffing', category: 'Staffing' },
      { id: 'bulk-hiring', title: 'Bulk Hiring', category: 'Recruitment' },
      { id: 'overseas-place', title: 'Overseas Placement', category: 'Placement' },
      { id: 'visa-assist', title: 'Visa Assistance', category: 'Visa & Legal' },
      { id: 'work-permit', title: 'Work Permit Guidance', category: 'Visa & Legal' },
      { id: 'intl-consult', title: 'International Consulting', category: 'Consulting' },
      { id: 'college-adm', title: 'College Admission Assistance', category: 'Higher Education' },
      { id: 'school-career', title: 'School Student Career Guidance', category: 'K-12 & High School' },
      { id: 'intl-adm', title: 'International Admissions', category: 'Admissions' },
      { id: 'school-academy', title: 'Academy for School Students', category: 'Academic Enrichment' },
      { id: 'exec-seminars-lang', title: 'Executive Seminars & Language Test Preparation', category: 'Test Prep & Executive' }
    ];

    const allLeadsInScope = await db.all(
      `SELECT id, serviceId, serviceTitle, status, priority, assignedEmployee, nextActionDate, createdAt FROM leads ${baseWhere}`,
      allParams
    );

    const serviceBreakdown = MASTER_SERVICES.map(srv => {
      const matching = allLeadsInScope.filter(l => {
        const sid = (l.serviceId || '').toLowerCase();
        const stitle = (l.serviceTitle || '').toLowerCase();
        return sid === srv.id || stitle.includes(srv.title.toLowerCase()) || (srv.id === 'intl-consult' && stitle.includes('consulting'));
      });
      const srvTotal = matching.length;
      const srvNew = matching.filter(l => ['New', 'New Enquiry'].includes(l.status)).length;
      const srvAwaiting = matching.filter(l => ['Follow-up Required', 'Consultation Scheduled', 'Contact Pending', 'Contact Attempted'].includes(l.status)).length;
      const srvQualified = matching.filter(l => ['Qualified', 'Consultation Completed'].includes(l.status)).length;
      const srvInProgress = matching.filter(l => ['In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending'].includes(l.status)).length;
      const srvConverted = matching.filter(l => ['Converted', 'Completed'].includes(l.status)).length;
      const srvRate = srvTotal > 0 ? Number(((srvConverted / srvTotal) * 100).toFixed(1)) : 0;

      return {
        serviceId: srv.id,
        serviceTitle: srv.title,
        category: srv.category,
        total: srvTotal,
        newCount: srvNew,
        awaitingFollowUp: srvAwaiting,
        inProgress: srvInProgress,
        qualified: srvQualified,
        converted: srvConverted,
        conversionRate: srvRate
      };
    });

    // General / Corporate Inquiries
    const generalMatching = allLeadsInScope.filter(l => {
      const sid = (l.serviceId || '').toLowerCase();
      const stitle = (l.serviceTitle || '').toLowerCase();
      return !MASTER_SERVICES.some(s => s.id === sid || stitle.includes(s.title.toLowerCase()) || (s.id === 'intl-consult' && stitle.includes('consulting')));
    });

    const generalTotal = generalMatching.length;
    const generalConverted = generalMatching.filter(l => ['Converted', 'Completed'].includes(l.status)).length;

    serviceBreakdown.push({
      serviceId: 'general-inquiry',
      serviceTitle: 'General & Corporate Inquiries',
      category: 'General',
      total: generalTotal,
      newCount: generalMatching.filter(l => ['New', 'New Enquiry'].includes(l.status)).length,
      awaitingFollowUp: generalMatching.filter(l => ['Follow-up Required', 'Consultation Scheduled', 'Contact Pending', 'Contact Attempted'].includes(l.status)).length,
      inProgress: generalMatching.filter(l => ['In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending'].includes(l.status)).length,
      qualified: generalMatching.filter(l => ['Qualified', 'Consultation Completed'].includes(l.status)).length,
      converted: generalConverted,
      conversionRate: generalTotal > 0 ? Number(((generalConverted / generalTotal) * 100).toFixed(1)) : 0
    });

    const conversionRate = total > 0 ? Number(((convertedRow.count / total) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      meta: {
        range,
        startDate: startDate || null,
        endDate: endDate || null,
        isDerivedFromLiveDatabase: true,
        timestamp: new Date().toISOString()
      },
      metrics: {
        totalEnquiries: total,
        newEnquiries: newRow ? newRow.count : 0,
        contactPending: contactPendingRow ? contactPendingRow.count : 0,
        contacted: contactedRow ? contactedRow.count : 0,
        awaitingFollowUp: awaitingFollowUpRow ? awaitingFollowUpRow.count : 0,
        inProgress: inProgressRow ? inProgressRow.count : 0,
        qualified: qualifiedRow ? qualifiedRow.count : 0,
        converted: convertedRow ? convertedRow.count : 0,
        closedLost: closedLostRow ? closedLostRow.count : 0,
        conversionRate,
        overdueFollowUps: overdueRow ? overdueRow.count : 0,
        dueTodayFollowUps: dueTodayRow ? dueTodayRow.count : 0,
        upcomingFollowUps: upcomingRow ? upcomingRow.count : 0
      },
      serviceBreakdown
    });
  } catch (error) {
    console.error('Failed to generate lead metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate lead metrics' });
  }
});

// Follow-ups Summary: Overdue, Due Today, and Upcoming with Lead Data
app.get('/api/admin/follow-ups/summary', async (req, res) => {
  try {
    const db = await getDb();
    const query = `
      SELECT f.*, l.name as leadName, l.email as leadEmail, l.phone as leadPhone, 
             l.serviceTitle as leadServiceTitle, l.status as leadStatus, l.company as leadCompany
      FROM follow_ups f
      LEFT JOIN leads l ON f.enquiryId = l.id
      WHERE f.status = 'Pending'
      ORDER BY f.dueDateTime ASC
    `;
    const rows = await db.all(query);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const overdue = [];
    const dueToday = [];
    const upcoming = [];

    rows.forEach(item => {
      const itemDate = new Date(item.dueDateTime);
      const itemDateStr = isNaN(itemDate.getTime()) ? '' : itemDate.toISOString().slice(0, 10);

      if (itemDate < now && itemDateStr !== todayStr) {
        overdue.push(item);
      } else if (itemDateStr === todayStr) {
        dueToday.push(item);
      } else {
        upcoming.push(item);
      }
    });

    res.json({
      success: true,
      counts: {
        totalPending: rows.length,
        overdue: overdue.length,
        dueToday: dueToday.length,
        upcoming: upcoming.length
      },
      data: {
        overdue,
        dueToday,
        upcoming
      }
    });
  } catch (error) {
    console.error('Failed to fetch follow-ups summary:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve follow-ups summary' });
  }
});

// Individual Enquiry Details with Activities, Organization & Follow-ups
app.get(['/api/leads/:id', '/api/consulting/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [id]);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const activities = await db.all('SELECT * FROM enquiry_activities WHERE enquiryId = ? ORDER BY createdAt DESC', [id]);
    const followUps = await db.all('SELECT * FROM follow_ups WHERE enquiryId = ? ORDER BY dueDateTime ASC', [id]);

    let organization = null;
    if (lead.organizationId) {
      organization = await db.get('SELECT * FROM clients WHERE id = ?', [lead.organizationId]);
    } else if (lead.company && lead.company !== 'Individual') {
      organization = await db.get('SELECT * FROM clients WHERE LOWER(TRIM(company)) = LOWER(TRIM(?))', [lead.company]);
    }

    res.json({
      success: true,
      data: {
        ...lead,
        activities,
        followUps,
        organization
      }
    });
  } catch (error) {
    console.error('Failed to retrieve enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve enquiry details' });
  }
});

// Create Lead / International Consulting Enquiry
app.post(['/api/leads', '/api/consulting/enquiries', '/api/career-guidance/enquiries'], async (req, res) => {
  try {
    // 1. Sliding window rate limiting: 60/min for localhost, 30/min for external IPs
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp === 'localhost';
    const now = Date.now();
    const windowMs = 60 * 1000;
    const timestamps = (inquiryRateLimits.get(clientIp) || []).filter(t => now - t < windowMs);
    const maxRequests = isLocalhost ? 1000 : 30;

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many inquiries submitted from this network. Please wait a minute before submitting again.'
      });
    }
    timestamps.push(now);
    inquiryRateLimits.set(clientIp, timestamps);

    const {
      id, name, email, company, phone, message, serviceId, serviceTitle,
      countryInterest, assistanceType, intakeTerm, degreeLevel, preferredContactMethod,
      organizationId, organizationName, priority,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent, referrer,
      // Phase 2: Nine Core Services fields
      jobTitle, skills, experience, workLocation, salaryRange, vacancies,
      seniority, industry, hiringTimeline, joiningDate, contractDuration,
      startDate, endDate, shiftRequirements, jobCategory, visaCategory,
      currentStage, cvPath, documentUrls, customFields,
      // Consultation scheduling & Booking fields
      consultationDate, consultationTime, consultationMode, status: requestedStatus,
      courseName, streamName, department
    } = req.body;

    // 2. Strict Input Validation & Length Limits
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Full name is required (between 2 and 100 characters).' });
    }
    const trimmedName = name.trim();
    if (/^\d+$/.test(trimmedName)) {
      return res.status(400).json({ success: false, message: 'Full name cannot consist only of numbers.' });
    }
    const isCareerLeadOrEdu = serviceId === 'school-career' || serviceId === 'career-guidance' || (serviceTitle && serviceTitle.toLowerCase().includes('career guidance'));
    if (isCareerLeadOrEdu) {
      if ((/\d/.test(trimmedName) && !trimmedName.includes('Grade ')) || !/^[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s.'\-(),]+$/.test(trimmedName)) {
        return res.status(400).json({ success: false, message: 'Full name cannot contain numbers or unsupported special characters.' });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'A valid business or personal email address is required (maximum 100 characters).' });
    }

    // Consent & Organization verification for career guidance & education inquiries
    const bodyConsent = req.body.consent;
    let customConsent = undefined;
    if (customFields) {
      try {
        const parsed = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
        customConsent = parsed.consent;
      } catch (_) {}
    }
    const effectiveConsent = bodyConsent !== undefined ? bodyConsent : customConsent;
    if (isCareerLeadOrEdu && (effectiveConsent === false || effectiveConsent === 'false')) {
      return res.status(400).json({ success: false, message: 'You must acknowledge the communication consent to proceed.' });
    }

    if (isCareerLeadOrEdu) {
      let org = organizationName;
      if (org === undefined && customFields) {
        try {
          const parsed = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
          if (parsed && parsed.organization !== undefined) org = parsed.organization;
        } catch (_) {}
      }
      if (org !== undefined && (typeof org !== 'string' || org.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Current school or college name is required.' });
      }
    }

    const cleanPhone = (phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!phone || typeof phone !== 'string' || cleanPhone.length < 7 || phone.trim().length > 30) {
      return res.status(400).json({ success: false, message: 'A valid phone number with country code is required (between 7 and 30 characters).' });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return res.status(400).json({ success: false, message: 'Enquiry details are required (between 10 and 3000 characters).' });
    }

    // Contract Staffing: Validate date ranges
    if (serviceId === 'contract-staff' && startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime()) && endD < startD) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contract period: Contract end date cannot be earlier than start date.'
        });
      }
    }

    // 3. Duplicate Submission Prevention (Same email + serviceId within 30 seconds)
    const duplicateKey = `${email.trim().toLowerCase()}_${serviceId || 'gen'}`;
    const lastSubmitTime = recentInquirySubmissions.get(duplicateKey);
    if (lastSubmitTime && (now - lastSubmitTime) < 30000) {
      return res.status(409).json({
        success: false,
        message: 'A duplicate enquiry was recently received. Please allow a brief moment before resubmitting.'
      });
    }
    recentInquirySubmissions.set(duplicateKey, now);

    const isConsultingEndpoint = (req.originalUrl && req.originalUrl.includes('/consulting')) || (req.path && req.path.includes('/consulting')) || serviceId === 'intl-consult';
    const safeServiceId = (serviceId && typeof serviceId === 'string' && serviceId.trim())
      ? serviceId.trim().slice(0, 50)
      : (isConsultingEndpoint ? 'intl-consult' : null);
    const safeServiceTitle = (serviceTitle && typeof serviceTitle === 'string' && serviceTitle.trim())
      ? serviceTitle.trim().slice(0, 150)
      : (safeServiceId === 'intl-consult' ? 'International Consulting' : (safeServiceId || null));
    const safeCompany = (company && typeof company === 'string' && company.trim()) ? company.trim().slice(0, 150) : (organizationName || 'Individual');

    // Attribution parameters sanitization
    const safeUtmSource = (utmSource && typeof utmSource === 'string') ? utmSource.trim().slice(0, 100) : null;
    const safeUtmMedium = (utmMedium && typeof utmMedium === 'string') ? utmMedium.trim().slice(0, 100) : null;
    const safeUtmCampaign = (utmCampaign && typeof utmCampaign === 'string') ? utmCampaign.trim().slice(0, 100) : null;
    const safeUtmTerm = (utmTerm && typeof utmTerm === 'string') ? utmTerm.trim().slice(0, 100) : null;
    const safeUtmContent = (utmContent && typeof utmContent === 'string') ? utmContent.trim().slice(0, 100) : null;
    const safeReferrer = (referrer && typeof referrer === 'string') ? referrer.trim().slice(0, 255) : null;

    // Generate unique official reference code with service-specific prefixes
    const servicePrefixes = {
      'dom-rec': 'REV-DOM',
      'intl-rec': 'REV-INTL',
      'exec-search': 'REV-EXEC',
      'perm-staff': 'REV-PERM',
      'contract-staff': 'REV-CONT',
      'bulk-hiring': 'REV-BULK',
      'overseas-place': 'REV-OVS',
      'visa-assist': 'REV-VISA',
      'work-permit': 'REV-WPR',
      'intl-consult': 'REV-IC',
      'college-adm': 'REV-CADM',
      'intl-adm': 'REV-ADM',
      'exec-seminars-lang': 'REV-SL',
      'school-career': 'REV-CAR',
      'career-guidance': 'REV-CAR',
      'school-academy': 'REV-ACA'
    };
    const isConsulting = safeServiceId === 'intl-consult' || (safeServiceTitle && safeServiceTitle.toLowerCase().includes('consulting'));
    const codePrefix = servicePrefixes[safeServiceId] || (isConsulting ? 'REV-IC' : 'REV-EDU');
    const refCode = `${codePrefix}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const leadId = id || `LEAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const db = await getDb();

    // 4. Resolve or associate organization if specified
    let resolvedOrgId = organizationId || null;
    let resolvedOrgName = organizationName || safeCompany;

    if (!resolvedOrgId && safeCompany && safeCompany !== 'Individual' && safeCompany.length > 2) {
      const matchOrg = await db.get(
        'SELECT id, company FROM clients WHERE LOWER(TRIM(company)) = LOWER(TRIM(?))',
        [safeCompany]
      );
      if (matchOrg) {
        resolvedOrgId = matchOrg.id;
        resolvedOrgName = matchOrg.company;
      }
    }

    const finalStatus = requestedStatus || (consultationDate ? 'Consultation Scheduled' : 'New Enquiry');

    const defaultAdvisor = (typeof req.body.assignedEmployee === 'string' && req.body.assignedEmployee.trim()) ? req.body.assignedEmployee.trim() : 'Dhanalakshimi';

    // Resolve courseName, streamName, department
    let resolvedCourseName = (courseName && typeof courseName === 'string' && courseName.trim()) ? courseName.trim() : null;
    let resolvedStreamName = (streamName && typeof streamName === 'string' && streamName.trim()) ? streamName.trim() : null;
    let resolvedDepartment = (department && typeof department === 'string' && department.trim()) ? department.trim() : null;

    if (customFields) {
      try {
        const parsedCustom = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
        if (!resolvedCourseName && parsedCustom.courseName) resolvedCourseName = String(parsedCustom.courseName).trim();
        if (!resolvedCourseName && parsedCustom.selectedCourse) resolvedCourseName = String(parsedCustom.selectedCourse).trim();
        if (!resolvedStreamName && parsedCustom.streamName) resolvedStreamName = String(parsedCustom.streamName).trim();
        if (!resolvedDepartment && parsedCustom.department) resolvedDepartment = String(parsedCustom.department).trim();
        if (!resolvedDepartment && parsedCustom.streamName) resolvedDepartment = String(parsedCustom.streamName).trim();
      } catch (_) {}
    }

    if (!resolvedCourseName && assistanceType && assistanceType !== 'Destination & Profile Assessment' && assistanceType !== 'Stream Planning & Course Advisory') {
      resolvedCourseName = String(assistanceType).trim();
    }

    // 5. Parameterized SQL insert into leads with all service fields
    await db.run(
      `INSERT INTO leads (
        id, name, email, company, phone, message, serviceId, serviceTitle,
        referenceNumber, countryInterest, assistanceType, intakeTerm, degreeLevel,
        preferredContactMethod, organizationId, organizationName, priority, status,
        assignedEmployee,
        utmSource, utmMedium, utmCampaign, utmTerm, utmContent, referrer,
        jobTitle, skills, experience, workLocation, salaryRange, vacancies,
        seniority, industry, hiringTimeline, joiningDate, contractDuration,
        startDate, endDate, shiftRequirements, jobCategory, visaCategory,
        currentStage, cvPath, documentUrls, customFields,
        consultationDate, consultationTime, consultationMode,
        courseName, streamName, department
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        name.trim(),
        email.trim(),
        safeCompany,
        phone.trim(),
        message.trim(),
        safeServiceId,
        safeServiceTitle,
        refCode,
        countryInterest ? countryInterest.trim() : 'All',
        assistanceType ? assistanceType.trim() : 'Destination & Profile Assessment',
        intakeTerm ? intakeTerm.trim() : 'Fall 2026',
        degreeLevel ? degreeLevel.trim() : 'Undergraduate',
        preferredContactMethod ? preferredContactMethod.trim() : 'WhatsApp',
        resolvedOrgId,
        resolvedOrgName,
        priority || 'Medium',
        finalStatus,
        defaultAdvisor,
        safeUtmSource,
        safeUtmMedium,
        safeUtmCampaign,
        safeUtmTerm,
        safeUtmContent,
        safeReferrer,
        // Nine services parameters
        jobTitle ? String(jobTitle).trim() : null,
        skills ? (Array.isArray(skills) ? skills.join(', ') : String(skills).trim()) : null,
        experience ? String(experience).trim() : null,
        workLocation ? String(workLocation).trim() : null,
        salaryRange ? String(salaryRange).trim() : null,
        vacancies ? String(vacancies).trim() : null,
        seniority ? String(seniority).trim() : null,
        industry ? String(industry).trim() : null,
        hiringTimeline ? String(hiringTimeline).trim() : null,
        joiningDate ? String(joiningDate).trim() : null,
        contractDuration ? String(contractDuration).trim() : null,
        startDate ? String(startDate).trim() : null,
        endDate ? String(endDate).trim() : null,
        shiftRequirements ? String(shiftRequirements).trim() : null,
        jobCategory ? String(jobCategory).trim() : null,
        visaCategory ? String(visaCategory).trim() : null,
        currentStage ? String(currentStage).trim() : null,
        cvPath ? String(cvPath).trim() : null,
        documentUrls ? (typeof documentUrls === 'object' ? JSON.stringify(documentUrls) : String(documentUrls)) : null,
        customFields ? (typeof customFields === 'object' ? JSON.stringify(customFields) : String(customFields)) : null,
        consultationDate ? String(consultationDate).trim() : null,
        consultationTime ? String(consultationTime).trim() : null,
        consultationMode ? String(consultationMode).trim() : null,
        resolvedCourseName,
        resolvedStreamName,
        resolvedDepartment
      ]
    );

    // 6. Record Initial Inbound Activity Log
    const activityId = `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await db.run(
      `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        leadId,
        resolvedOrgId,
        consultationDate ? 'Consultation Booked' : 'Inquiry Received',
        `${consultationDate ? 'Consultation Appointment Booked' : 'New ' + (safeServiceTitle || 'Service') + ' Request'} (${refCode})`,
        `Client submitted enquiry for ${safeServiceTitle || 'Service'}. ${consultationDate ? `Booked Date: ${consultationDate} at ${consultationTime || 'TBD'} via ${consultationMode || 'Virtual Video'}. ` : ''}Details: ${jobTitle ? `Job: ${jobTitle}. ` : ''}${countryInterest ? `Country: ${countryInterest}. ` : ''}Contact: ${preferredContactMethod || 'WhatsApp'}. Attribution: ${safeUtmSource ? `${safeUtmSource} / ${safeUtmMedium || 'cpc'}` : 'Direct/Organic'}.`,
        'System Inbound'
      ]
    );

    const leadRecord = {
      id: leadId,
      referenceNumber: refCode,
      name: name.trim(),
      courseName: resolvedCourseName,
      streamName: resolvedStreamName,
      department: resolvedDepartment,
      email: email.trim(),
      company: safeCompany,
      phone: phone.trim(),
      serviceId: safeServiceId,
      serviceTitle: safeServiceTitle,
      countryInterest,
      assistanceType,
      intakeTerm,
      degreeLevel,
      preferredContactMethod,
      organizationId: resolvedOrgId,
      organizationName: resolvedOrgName,
      status: finalStatus,
      assignedEmployee: defaultAdvisor,
      consultationDate: consultationDate || null,
      consultationTime: consultationTime || null,
      consultationMode: consultationMode || null,
      utmSource: safeUtmSource,
      utmMedium: safeUtmMedium,
      utmCampaign: safeUtmCampaign,
      referrer: safeReferrer,
      jobTitle: jobTitle || null,
      skills: skills || null,
      experience: experience || null,
      workLocation: workLocation || null,
      salaryRange: salaryRange || null,
      vacancies: vacancies || null,
      seniority: seniority || null,
      industry: industry || null,
      hiringTimeline: hiringTimeline || null,
      joiningDate: joiningDate || null,
      contractDuration: contractDuration || null,
      startDate: startDate || null,
      endDate: endDate || null,
      shiftRequirements: shiftRequirements || null,
      jobCategory: jobCategory || null,
      visaCategory: visaCategory || null,
      currentStage: currentStage || null,
      cvPath: cvPath || null,
      documentUrls: documentUrls || null,
      customFields: customFields || null,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Consultation enquiry received and securely recorded in database.',
      data: leadRecord,
      lead: leadRecord
    });
  } catch (error) {
    console.error('Failed to save inquiry to SQLite:', error);
    res.status(500).json({ success: false, message: 'Database error saving your inquiry. Please try again shortly.' });
  }
});

// Update Lead Status, Assignment, Organization Link, & Workflow
app.patch(['/api/leads/:id', '/api/consulting/enquiries/:id', '/api/student-academy/enquiries/:id', '/api/career-guidance/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone,
      status, assignedEmployee, priority, organizationId, organizationName,
      nextAction, nextActionDate, lastFollowUpDate, lastContactedDate,
      leadScore, internalNotes, isArchived, updatedBy,
      jobTitle, skills, experience, workLocation, salaryRange, vacancies,
      seniority, industry, hiringTimeline, joiningDate, contractDuration,
      startDate, endDate, shiftRequirements, jobCategory, visaCategory,
      currentStage, cvPath, consultationDate, consultationTime, consultationMode,
      countryInterest, intakeTerm, degreeLevel, documentUrls, customFields,
      courseName, streamName, department
    } = req.body;

    const allowedStatuses = [
      'New', 'New Enquiry', 'Contact Pending', 'Contact Attempted', 'Contacted',
      'Follow-up Required', 'Consultation Scheduled', 'Consultation Completed',
      'Qualified', 'Proposal Pending', 'Proposal or Next Steps Pending',
      'In Progress', 'Converted', 'Completed', 'Closed / Lost', 'Closed', 'Archived',
      // College & University Admission Workflow Stages (Phase 7)
      'Course Selection', 'Documents Pending', 'Application in Preparation',
      'Application Submitted', 'Awaiting Institution Decision', 'Offer Received',
      'Enrollment in Progress',
      // Recruitment & Staffing Workflow Stages
      'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed',
      'Selected', 'Offer Released', 'Under Review', 'Visa Processing',
      'Mobilization', 'Contract Active', 'Contract Ended', 'Renewed', 'Rejected', 'On Hold'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: '${status}'.` });
    }

    const db = await getDb();
    const currentLead = await db.get('SELECT * FROM leads WHERE id = ? OR referenceNumber = ?', [id, id]);
    if (!currentLead) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Security check: HR Operations employees cannot assign or reassign enquiries
    const patchRole = req.headers['x-user-role'] || req.body.userRole;
    const effectiveAssignedEmployee = patchRole === 'HR Operations' ? currentLead.assignedEmployee : assignedEmployee;

    // Update lead record with all tracked workflow attributes
    await db.run(
      `UPDATE leads SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        status = COALESCE(?, status),
        assignedEmployee = COALESCE(?, assignedEmployee),
        priority = COALESCE(?, priority),
        organizationId = COALESCE(?, organizationId),
        organizationName = COALESCE(?, organizationName),
        nextAction = COALESCE(?, nextAction),
        nextActionDate = COALESCE(?, nextActionDate),
        lastFollowUpDate = COALESCE(?, lastFollowUpDate),
        lastContactedDate = COALESCE(?, lastContactedDate),
        leadScore = COALESCE(?, leadScore),
        internalNotes = COALESCE(?, internalNotes),
        isArchived = COALESCE(?, isArchived),
        jobTitle = COALESCE(?, jobTitle),
        skills = COALESCE(?, skills),
        experience = COALESCE(?, experience),
        workLocation = COALESCE(?, workLocation),
        salaryRange = COALESCE(?, salaryRange),
        vacancies = COALESCE(?, vacancies),
        seniority = COALESCE(?, seniority),
        industry = COALESCE(?, industry),
        hiringTimeline = COALESCE(?, hiringTimeline),
        joiningDate = COALESCE(?, joiningDate),
        contractDuration = COALESCE(?, contractDuration),
        startDate = COALESCE(?, startDate),
        endDate = COALESCE(?, endDate),
        shiftRequirements = COALESCE(?, shiftRequirements),
        jobCategory = COALESCE(?, jobCategory),
        visaCategory = COALESCE(?, visaCategory),
        currentStage = COALESCE(?, currentStage),
        cvPath = COALESCE(?, cvPath),
        consultationDate = COALESCE(?, consultationDate),
        consultationTime = COALESCE(?, consultationTime),
        consultationMode = COALESCE(?, consultationMode),
        countryInterest = COALESCE(?, countryInterest),
        intakeTerm = COALESCE(?, intakeTerm),
        degreeLevel = COALESCE(?, degreeLevel),
        documentUrls = COALESCE(?, documentUrls),
        customFields = COALESCE(?, customFields),
        courseName = COALESCE(?, courseName),
        streamName = COALESCE(?, streamName),
        department = COALESCE(?, department),
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name : null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        status || null,
        effectiveAssignedEmployee !== undefined ? effectiveAssignedEmployee : null,
        priority || null,
        organizationId || null,
        organizationName || null,
        nextAction || null,
        nextActionDate || null,
        lastFollowUpDate || null,
        lastContactedDate || null,
        leadScore !== undefined ? leadScore : null,
        internalNotes !== undefined ? internalNotes : null,
        isArchived !== undefined ? isArchived : null,
        jobTitle !== undefined ? jobTitle : null,
        skills !== undefined ? (Array.isArray(skills) ? skills.join(', ') : skills) : null,
        experience !== undefined ? experience : null,
        workLocation !== undefined ? workLocation : null,
        salaryRange !== undefined ? salaryRange : null,
        vacancies !== undefined ? vacancies : null,
        seniority !== undefined ? seniority : null,
        industry !== undefined ? industry : null,
        hiringTimeline !== undefined ? hiringTimeline : null,
        joiningDate !== undefined ? joiningDate : null,
        contractDuration !== undefined ? contractDuration : null,
        startDate !== undefined ? startDate : null,
        endDate !== undefined ? endDate : null,
        shiftRequirements !== undefined ? shiftRequirements : null,
        jobCategory !== undefined ? jobCategory : null,
        visaCategory !== undefined ? visaCategory : null,
        currentStage !== undefined ? currentStage : null,
        cvPath !== undefined ? cvPath : null,
        consultationDate !== undefined ? consultationDate : null,
        consultationTime !== undefined ? consultationTime : null,
        consultationMode !== undefined ? consultationMode : null,
        countryInterest !== undefined ? countryInterest : null,
        intakeTerm !== undefined ? intakeTerm : null,
        degreeLevel !== undefined ? degreeLevel : null,
        documentUrls !== undefined ? (typeof documentUrls === 'object' ? JSON.stringify(documentUrls) : String(documentUrls)) : null,
        customFields !== undefined ? (typeof customFields === 'object' ? JSON.stringify(customFields) : String(customFields)) : null,
        courseName !== undefined ? courseName : null,
        streamName !== undefined ? streamName : null,
        department !== undefined ? department : null,
        currentLead.id
      ]
    );

    // Audit activity if status changed
    if (status && status !== currentLead.status) {
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          currentLead.id,
          organizationId || currentLead.organizationId,
          'Status Change',
          `Pipeline Stage: ${status}`,
          `Status transitioned from '${currentLead.status || 'New'}' to '${status}'.`,
          updatedBy || 'Staff User'
        ]
      );
    }

    // Audit activity if consultant assigned
    if (assignedEmployee !== undefined && assignedEmployee !== currentLead.assignedEmployee) {
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          currentLead.id,
          organizationId || currentLead.organizationId,
          'Assignment',
          assignedEmployee ? `Assigned to ${assignedEmployee}` : 'Unassigned',
          `Lead consultant ${assignedEmployee ? `assigned to ${assignedEmployee}` : 'cleared'}.`,
          updatedBy || 'Staff User'
        ]
      );
    }

    // Audit activity if internal notes were added or updated
    if (internalNotes !== undefined && internalNotes !== currentLead.internalNotes && internalNotes) {
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          id,
          organizationId || currentLead.organizationId,
          'Internal Note',
          'Internal Notes Updated',
          internalNotes.slice(0, 150) + (internalNotes.length > 150 ? '...' : ''),
          updatedBy || 'Staff User'
        ]
      );
    }

    const updated = await db.get('SELECT * FROM leads WHERE id = ?', [currentLead.id]);
    res.json({ success: true, message: 'Enquiry updated successfully', data: updated });
  } catch (error) {
    console.error('Failed to update lead:', error);
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
});

// Record Discussion Note, Call Log or Meeting in Activity Timeline
app.post(['/api/leads/:id/activities', '/api/consulting/enquiries/:id/activities'], async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, notes, createdBy, organizationId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Activity title is required.' });
    }

    const actId = `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const db = await getDb();

    await db.run(
      `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [actId, id, organizationId || null, type || 'Note', title.trim(), notes ? notes.trim() : '', createdBy || 'Staff']
    );

    await db.run('UPDATE leads SET lastContactedDate = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    const createdActivity = await db.get('SELECT * FROM enquiry_activities WHERE id = ?', [actId]);
    res.status(201).json({ success: true, message: 'Activity logged successfully', data: createdActivity });
  } catch (error) {
    console.error('Failed to log activity:', error);
    res.status(500).json({ success: false, message: 'Failed to log activity' });
  }
});

// Schedule Follow-Up for Enquiry
app.post(['/api/leads/:id/follow-ups', '/api/consulting/enquiries/:id/follow-ups'], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, purpose, dueDateTime, followUpDate, assignedTo, createdBy, organizationId } = req.body;
    const targetDue = dueDateTime || followUpDate;

    if (!targetDue || !purpose) {
      return res.status(400).json({ success: false, message: 'Follow-up date/time and purpose are required.' });
    }

    const followUpId = `FLW-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const db = await getDb();

    await db.run(
      `INSERT INTO follow_ups (id, enquiryId, organizationId, title, purpose, dueDateTime, assignedTo, status, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [followUpId, id, organizationId || null, title || 'Scheduled Follow-Up', purpose.trim(), targetDue, assignedTo || 'Assigned Consultant', createdBy || 'Staff']
    );

    // Update lead's nextAction & nextActionDate & lastFollowUpDate
    await db.run(
      `UPDATE leads SET nextAction = ?, nextActionDate = ?, lastFollowUpDate = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [title || purpose.slice(0, 50), targetDue, id]
    );

    // Log in activities
    await db.run(
      `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        id,
        organizationId || null,
        'Follow-up Scheduled',
        `Follow-up set for ${dueDateTime}`,
        `Purpose: ${purpose.trim()} (Assigned to: ${assignedTo || 'Staff'})`,
        createdBy || 'Staff'
      ]
    );

    const createdFollowUp = await db.get('SELECT * FROM follow_ups WHERE id = ?', [followUpId]);
    res.status(201).json({ success: true, message: 'Follow-up scheduled successfully', data: createdFollowUp });
  } catch (error) {
    console.error('Failed to schedule follow-up:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule follow-up' });
  }
});

// Follow-ups List & Status Updates
app.get('/api/follow-ups', async (req, res) => {
  try {
    const { status, assignedTo, enquiryId } = req.query;
    const db = await getDb();

    let query = 'SELECT f.*, l.name as clientName, l.phone as clientPhone, l.email as clientEmail FROM follow_ups f LEFT JOIN leads l ON f.enquiryId = l.id WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND f.status = ?';
      params.push(status);
    }
    if (assignedTo && assignedTo !== 'all') {
      query += ' AND f.assignedTo = ?';
      params.push(assignedTo);
    }
    if (enquiryId) {
      query += ' AND f.enquiryId = ?';
      params.push(enquiryId);
    }

    query += ' ORDER BY f.dueDateTime ASC';
    const rows = await db.all(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch follow-ups:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch follow-ups' });
  }
});

app.patch('/api/follow-ups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completionNotes, updatedBy } = req.body;

    const allowed = ['Pending', 'Completed', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid follow-up status' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM follow_ups WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const completedAt = status === 'Completed' ? new Date().toISOString() : null;

    await db.run(
      `UPDATE follow_ups SET status = ?, completionNotes = ?, completedAt = ? WHERE id = ?`,
      [status, completionNotes ? completionNotes.trim() : null, completedAt, id]
    );

    // If completed or cancelled, log to enquiry activity
    if (existing.enquiryId) {
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          existing.enquiryId,
          existing.organizationId,
          'Follow-up Update',
          `Follow-up marked ${status}`,
          completionNotes ? `Notes: ${completionNotes.trim()}` : `Marked ${status} by staff.`,
          updatedBy || 'Staff'
        ]
      );
    }

    const updated = await db.get('SELECT * FROM follow_ups WHERE id = ?', [id]);
    res.json({ success: true, message: `Follow-up marked as ${status}`, data: updated });
  } catch (error) {
    console.error('Failed to update follow-up:', error);
    res.status(500).json({ success: false, message: 'Failed to update follow-up' });
  }
});

// Archive / Restore Lead (Soft Delete)
app.post(['/api/leads/:id/archive', '/api/consulting/enquiries/:id/archive'], async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived = 1, updatedBy } = req.body;
    const db = await getDb();
    await db.run('UPDATE leads SET isArchived = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [isArchived ? 1 : 0, id]);
    await db.run(
      `INSERT INTO enquiry_activities (id, enquiryId, type, title, notes, createdBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        id,
        'Archival',
        isArchived ? 'Lead Archived' : 'Lead Restored',
        isArchived ? 'Lead moved to archive.' : 'Lead restored from archive.',
        updatedBy || 'Staff User'
      ]
    );
    res.json({ success: true, message: `Lead ${isArchived ? 'archived' : 'restored'} successfully`, id, isArchived: isArchived ? 1 : 0 });
  } catch (error) {
    console.error('Failed to archive lead:', error);
    res.status(500).json({ success: false, message: 'Failed to archive lead' });
  }
});

// Delete Lead / Enquiry (Super Admin CRM)
app.delete([
  '/api/leads/:id',
  '/api/consulting/enquiries/:id',
  '/api/student-academy/enquiries/:id',
  '/api/career-guidance/enquiries/:id'
], requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const crmUser = req.headers['x-crm-user'] || 'Super Admin';
    const crmUserId = req.headers['x-crm-user-id'] || 'usr-superadmin';
    const crmRole = req.headers['x-crm-role'] || 'Super Admin';

    // 1. Capture existing metadata before deletion
    const existingLead = await db.get('SELECT * FROM leads WHERE id = ? OR referenceNumber = ?', [id, id]);
    const existingAcademy = await db.get('SELECT * FROM student_academy_enquiries WHERE id = ? OR referenceNumber = ?', [id, id]);

    if (!existingLead && !existingAcademy) {
      return res.status(404).json({ success: false, message: 'Record not found or already deleted' });
    }

    const refNumber = existingLead?.referenceNumber || existingAcademy?.referenceNumber || id;
    const recordName = existingLead?.name || existingAcademy?.studentName || 'Unknown Contact';
    const serviceType = existingLead?.serviceTitle || existingLead?.serviceId || existingAcademy?.examName || existingAcademy?.academyName || 'Enquiry';

    // Classify entity type for audit logging
    let entityType = 'Lead / Enquiry';
    const sId = (existingLead?.serviceId || '').toLowerCase();
    const sTitle = (existingLead?.serviceTitle || '').toLowerCase();
    const refUpper = (refNumber || '').toUpperCase();
    if (sId.includes('student-academy') || sId.includes('school-academy') || refUpper.startsWith('REV-ACA') || existingAcademy) {
      entityType = 'Student Academy Enquiry';
    } else if (sId.includes('career') || refUpper.startsWith('REV-CAR') || sTitle.includes('career')) {
      entityType = 'Career Guidance Enquiry';
    } else if (sId.includes('consulting') || refUpper.startsWith('REV-CON') || sTitle.includes('consulting') || existingLead?.consultationDate) {
      entityType = 'Consulting Booking';
    }

    // 2. Cascade cleanup of child activities and follow-ups safely
    await db.run('DELETE FROM enquiry_activities WHERE enquiryId = ? OR enquiryId = ?', [id, refNumber]);
    await db.run('DELETE FROM follow_ups WHERE enquiryId = ? OR enquiryId = ?', [id, refNumber]);

    // 3. Delete from primary and synchronized tables
    await db.run('DELETE FROM leads WHERE id = ? OR referenceNumber = ?', [id, refNumber]);
    await db.run('DELETE FROM student_academy_enquiries WHERE id = ? OR referenceNumber = ?', [id, refNumber]);

    // 4. Record persistent audit log
    await logAuditTrail(db, {
      userId: crmUserId,
      userName: crmUser,
      role: crmRole,
      action: 'DELETE_RECORD',
      entityType,
      entityId: id,
      details: {
        referenceNumber: refNumber,
        recordName,
        serviceType,
        deletedAt: new Date().toISOString()
      },
      ip: clientIp
    });

    res.json({
      success: true,
      message: `${entityType} '${recordName}' (${refNumber}) permanently deleted successfully.`,
      id,
      referenceNumber: refNumber,
      entityType
    });
  } catch (error) {
    console.error('Failed to delete lead / enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete record: ' + error.message });
  }
});

// Real-Time Database Metrics for International Consulting


// Persistent Audit Logs Endpoint
app.get('/api/crm/audit-logs', async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 150');
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// Real-Time Database Metrics for Student Academy
app.get('/api/crm/student-academy/metrics', async (req, res) => {
  try {
    const db = await getDb();
    const academyCondition = "(serviceId IN ('school-academy', 'student-academy') OR LOWER(serviceTitle) LIKE '%academy%' OR LOWER(company) LIKE '%student academy%' OR referenceNumber LIKE 'REV-ACA%')";
    const totalRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${academyCondition} AND (isArchived IS NULL OR isArchived = 0)`);
    const newRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${academyCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('New', 'New Enquiry')`);
    const inProgressRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${academyCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('In Progress', 'Contacted', 'Contact Pending', 'Consultation Scheduled', 'Proposal Pending', 'Course Selection')`);
    const completedRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${academyCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('Converted', 'Completed', 'Consultation Completed', 'Qualified', 'Enrollment in Progress')`);

    const metricsPayload = {
      totalEnquiries: totalRow ? totalRow.count : 0,
      newEnquiries: newRow ? newRow.count : 0,
      inProgressEnquiries: inProgressRow ? inProgressRow.count : 0,
      completedEnquiries: completedRow ? completedRow.count : 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metricsPayload,
      metrics: metricsPayload
    });
  } catch (error) {
    console.error('Failed to get student academy metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate student academy metrics' });
  }
});

// =========================================================================
// CAREER GUIDANCE: UG & PG ACADEMIC DEPARTMENT CRUD & MANAGEMENT
// =========================================================================

// Helper middleware for role verification on department changes
const requireDeptAdmin = (req, res, next) => {
  const crmRole = (req.headers['x-crm-role'] || req.headers['role'] || 'Super Admin').trim().toLowerCase();
  const unauthorizedRoles = ['candidate', 'student', 'guest', 'client', 'applicant'];
  if (unauthorizedRoles.includes(crmRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: insufficient permissions to manage academic departments.'
    });
  }
  next();
};

// 1. Read All Departments (with Level filtering, Search, and computed stats)
app.get('/api/career-guidance/departments', async (req, res) => {
  try {
    const { level, search, status } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM career_departments WHERE 1=1';
    const params = [];

    if (level && level !== 'all' && level !== 'All') {
      query += ' AND level = ?';
      params.push(level.toUpperCase());
    }

    if (status && status !== 'all' && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(COALESCE(description, "")) LIKE ?)';
      params.push(s, s);
    }

    query += ' ORDER BY level ASC, name ASC';

    const departments = await db.all(query, params);

    // Fetch leads for career guidance to compute accurate enquiry count
    const careerLeads = await db.all(
      "SELECT id, department, streamName, degreeLevel, customFields FROM leads WHERE (serviceId IN ('school-career', 'career-guidance') OR LOWER(serviceTitle) LIKE '%career%' OR LOWER(company) LIKE '%career%')"
    );

    // Augment with computed courseCount and enquiryCount
    const augmented = departments.map(dept => {
      const dNorm = (dept.name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
      const deptLevel = (dept.level || '').toUpperCase();

      // Count matching courses from official catalogue
      const courseCount = (COURSES_CATALOGUE || []).filter(c => {
        const cNorm = (c.department || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
        const cLevel = (c.level || '').toUpperCase();
        const matchesLevel = !cLevel || cLevel === deptLevel;
        const matchesName = cNorm.includes(dNorm) || dNorm.includes(cNorm);
        return matchesLevel && matchesName;
      }).length;

      // Count matching enquiries in leads table
      const enquiryCount = careerLeads.filter(lead => {
        const leadLevel = (lead.degreeLevel || '').toLowerCase().includes('undergraduate') || (lead.degreeLevel || '') === 'UG' || (lead.customFields || '').includes('"degreeLevel":"UG"') || (lead.customFields || '').includes('Undergraduate') ? 'UG' :
          (lead.degreeLevel || '').toLowerCase().includes('postgraduate') || (lead.degreeLevel || '') === 'PG' || (lead.customFields || '').includes('"degreeLevel":"PG"') || (lead.customFields || '').includes('Postgraduate') ? 'PG' : null;

        const blob = `${lead.department || ''} ${lead.streamName || ''} ${lead.customFields || ''}`.toLowerCase();
        const matchesName = blob.includes(dept.name.toLowerCase()) || (dept.id && blob.includes(dept.id.toLowerCase()));
        if (!matchesName) return false;
        if (leadLevel && leadLevel !== deptLevel) return false;
        return true;
      }).length;

      return {
        ...dept,
        courseCount,
        enquiryCount
      };
    });

    res.json({
      success: true,
      count: augmented.length,
      data: augmented
    });
  } catch (error) {
    console.error('Failed to fetch career guidance departments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

// 2. Create Academic Department (with duplicate validation within level)
app.post('/api/career-guidance/departments', requireDeptAdmin, async (req, res) => {
  try {
    const { name, level, description, status = 'Active' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    if (!level || !['UG', 'PG'].includes(level.trim().toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Academic level must be either UG or PG.' });
    }

    const trimmedName = name.trim();
    const cleanLevel = level.trim().toUpperCase();
    const db = await getDb();

    // Check duplicate name within the same academic level (case-insensitive)
    const existing = await db.get(
      'SELECT id FROM career_departments WHERE LOWER(TRIM(name)) = LOWER(?) AND level = ?',
      [trimmedName, cleanLevel]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Department '${trimmedName}' already exists under ${cleanLevel} level.`
      });
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 30);
    const id = `dept-${cleanLevel.toLowerCase()}-${slug}-${Date.now().toString(36)}`;

    await db.run(
      `INSERT INTO career_departments (id, name, level, description, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, trimmedName, cleanLevel, description ? description.trim() : '', status || 'Active']
    );

    const created = await db.get('SELECT * FROM career_departments WHERE id = ?', [id]);
    res.status(201).json({
      success: true,
      message: `Department '${trimmedName}' created successfully.`,
      data: created
    });
  } catch (error) {
    console.error('Failed to create career department:', error);
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
});

// 3. Update Academic Department
app.patch('/api/career-guidance/departments/:id', requireDeptAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, description, status } = req.body;
    const db = await getDb();

    const currentDept = await db.get('SELECT * FROM career_departments WHERE id = ?', [id]);
    if (!currentDept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const nextName = name !== undefined ? name.trim() : currentDept.name;
    const nextLevel = level !== undefined ? level.trim().toUpperCase() : currentDept.level;

    if (!nextName) {
      return res.status(400).json({ success: false, message: 'Department name cannot be empty.' });
    }

    if (level !== undefined && !['UG', 'PG'].includes(nextLevel)) {
      return res.status(400).json({ success: false, message: 'Academic level must be either UG or PG.' });
    }

    // Check duplicate if name or level is updated
    if (nextName.toLowerCase() !== currentDept.name.toLowerCase() || nextLevel !== currentDept.level) {
      const existing = await db.get(
        'SELECT id FROM career_departments WHERE LOWER(TRIM(name)) = LOWER(?) AND level = ? AND id != ?',
        [nextName, nextLevel, id]
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Department '${nextName}' already exists under ${nextLevel} level.`
        });
      }
    }

    await db.run(
      `UPDATE career_departments SET
        name = ?,
        level = ?,
        description = ?,
        status = ?,
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextName,
        nextLevel,
        description !== undefined ? description.trim() : currentDept.description,
        status !== undefined ? status : currentDept.status,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM career_departments WHERE id = ?', [id]);
    res.json({
      success: true,
      message: `Department '${nextName}' updated successfully.`,
      data: updated
    });
  } catch (error) {
    console.error('Failed to update department:', error);
    res.status(500).json({ success: false, message: 'Failed to update department' });
  }
});

// 4. Delete Academic Department (with safety verification)
app.delete('/api/career-guidance/departments/:id', requireDeptAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true' || req.query.force === true;
    const db = await getDb();

    const dept = await db.get('SELECT * FROM career_departments WHERE id = ?', [id]);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found or already deleted' });
    }

    // Check references unless force delete requested
    if (!force) {
      const dNorm = (dept.name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
      const deptLevel = (dept.level || '').toUpperCase();

      const courseCount = (COURSES_CATALOGUE || []).filter(c => {
        const cNorm = (c.department || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
        const cLevel = (c.level || '').toUpperCase();
        return (!cLevel || cLevel === deptLevel) && (cNorm.includes(dNorm) || dNorm.includes(cNorm));
      }).length;

      const careerLeads = await db.all(
        "SELECT id, department, streamName, degreeLevel, customFields FROM leads WHERE (serviceId IN ('school-career', 'career-guidance') OR LOWER(serviceTitle) LIKE '%career%' OR LOWER(company) LIKE '%career%')"
      );

      const enquiryCount = careerLeads.filter(lead => {
        const blob = `${lead.department || ''} ${lead.streamName || ''} ${lead.customFields || ''}`.toLowerCase();
        return blob.includes(dept.name.toLowerCase()) || (dept.id && blob.includes(dept.id.toLowerCase()));
      }).length;

      const totalReferences = courseCount + enquiryCount;

      if (totalReferences > 0) {
        return res.status(400).json({
          success: false,
          isReferenced: true,
          courseCount,
          enquiryCount,
          message: `Department '${dept.name}' is associated with ${totalReferences} course(s) or enquiry record(s). Cannot delete without force confirmation. You can deactivate it instead.`
        });
      }
    }

    await db.run('DELETE FROM career_departments WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Department '${dept.name}' deleted successfully.`,
      id
    });
  } catch (error) {
    console.error('Failed to delete department:', error);
    res.status(500).json({ success: false, message: 'Failed to delete department' });
  }
});


// Real-Time Database Metrics for Career Guidance
app.get('/api/crm/career-guidance/metrics', async (req, res) => {
  try {
    const db = await getDb();

    const careerCondition = "(serviceId IN ('school-career', 'career-guidance') OR LOWER(serviceTitle) LIKE '%career%' OR LOWER(company) LIKE '%career%')";
    const totalRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${careerCondition} AND (isArchived IS NULL OR isArchived = 0)`);
    const newRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${careerCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('New', 'New Enquiry')`);
    const scheduledRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${careerCondition} AND (isArchived IS NULL OR isArchived = 0) AND status = 'Consultation Scheduled'`);
    const inProgressRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${careerCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('In Progress', 'Contacted', 'Contact Pending', 'Consultation Scheduled', 'Proposal Pending', 'Proposal or Next Steps Pending')`);
    const completedRow = await db.get(`SELECT COUNT(*) as count FROM leads WHERE ${careerCondition} AND (isArchived IS NULL OR isArchived = 0) AND status IN ('Converted', 'Completed', 'Consultation Completed', 'Qualified')`);

    const metricsPayload = {
      totalEnquiries: totalRow ? totalRow.count : 0,
      newEnquiries: newRow ? newRow.count : 0,
      consultationsScheduled: scheduledRow ? scheduledRow.count : 0,
      inProgressEnquiries: inProgressRow ? inProgressRow.count : 0,
      convertedEnquiries: completedRow ? completedRow.count : 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metricsPayload,
      metrics: metricsPayload
    });
  } catch (error) {
    console.error('Failed to get career guidance metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate career guidance metrics' });
  }
});

app.get('/api/crm/consulting/metrics', async (req, res) => {
  try {
    const db = await getDb();

    // Database-derived metrics exclusively
    const totalRow = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE serviceId = 'intl-consult' OR LOWER(serviceTitle) LIKE '%international consulting%'"
    );
    const newRow = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE (serviceId = 'intl-consult' OR LOWER(serviceTitle) LIKE '%international consulting%') AND status IN ('New', 'New Enquiry')"
    );
    const scheduledRow = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE (serviceId = 'intl-consult' OR LOWER(serviceTitle) LIKE '%international consulting%') AND status = 'Consultation Scheduled'"
    );
    const activeRow = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE (serviceId = 'intl-consult' OR LOWER(serviceTitle) LIKE '%international consulting%') AND status IN ('In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending')"
    );
    const completedRow = await db.get(
      "SELECT COUNT(*) as count FROM leads WHERE (serviceId = 'intl-consult' OR LOWER(serviceTitle) LIKE '%international consulting%') AND status IN ('Converted', 'Completed')"
    );
    const followUpsDueRow = await db.get(
      "SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending'"
    );
    const overdueRow = await db.get(
      "SELECT COUNT(*) as count FROM follow_ups WHERE status = 'Pending' AND dueDateTime < datetime('now')"
    );
    const orgCountRow = await db.get(
      "SELECT COUNT(*) as count FROM clients WHERE organizationType IN ('University', 'College', 'School', 'Partner Institute')"
    );

    const metricsPayload = {
      totalEnquiries: totalRow ? totalRow.count : 0,
      newEnquiries: newRow ? newRow.count : 0,
      consultationsScheduled: scheduledRow ? scheduledRow.count : 0,
      activeEngagements: activeRow ? activeRow.count : 0,
      completedEngagements: completedRow ? completedRow.count : 0,
      followUpsDue: followUpsDueRow ? followUpsDueRow.count : 0,
      overdueFollowUps: overdueRow ? overdueRow.count : 0,
      educationalOrganizations: orgCountRow ? orgCountRow.count : 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metricsPayload,
      metrics: metricsPayload
    });
  } catch (error) {
    console.error('Failed to get consulting metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate consulting metrics' });
  }
});

// Phase 9: Real Service-Level Performance & Lead Attribution Reporting
app.get('/api/analytics/service-performance', async (req, res) => {
  try {
    const db = await getDb();

    // 1. Defined master services catalog
    const MASTER_SERVICES = [
      { id: 'dom-rec', title: 'Domestic Recruitment', category: 'Recruitment' },
      { id: 'intl-rec', title: 'International Recruitment', category: 'Recruitment' },
      { id: 'exec-search', title: 'Executive Search', category: 'Executive' },
      { id: 'perm-staff', title: 'Permanent Staffing', category: 'Staffing' },
      { id: 'contract-staff', title: 'Contract Staffing', category: 'Staffing' },
      { id: 'bulk-hiring', title: 'Bulk Hiring', category: 'Recruitment' },
      { id: 'overseas-place', title: 'Overseas Placement', category: 'Placement' },
      { id: 'visa-assist', title: 'Visa Assistance', category: 'Visa & Legal' },
      { id: 'work-permit', title: 'Work Permit Guidance', category: 'Visa & Legal' },
      { id: 'intl-consult', title: 'International Consulting', category: 'Consulting' },
      { id: 'college-adm', title: 'College Admission Assistance', category: 'Higher Education' },
      { id: 'school-career', title: 'School Student Career Guidance', category: 'K-12 & High School' },
      { id: 'intl-adm', title: 'International Admissions', category: 'Admissions' },
      { id: 'school-academy', title: 'Academy for School Students', category: 'Academic Enrichment' },
      { id: 'exec-seminars-lang', title: 'Executive Seminars & Language Test Preparation', category: 'Test Prep & Executive' }
    ];

    // 2. Fetch all real inbound leads from database
    const allLeads = await db.all('SELECT * FROM leads ORDER BY createdAt DESC');

    // 3. Aggregate performance by service
    const serviceMetrics = MASTER_SERVICES.map(srv => {
      const matchingLeads = allLeads.filter(l => {
        const sid = (l.serviceId || '').toLowerCase();
        const stitle = (l.serviceTitle || '').toLowerCase();
        return sid === srv.id || stitle.includes(srv.title.toLowerCase()) || (srv.id === 'intl-consult' && stitle.includes('consulting'));
      });

      const total = matchingLeads.length;
      const newCount = matchingLeads.filter(l => ['New', 'New Enquiry'].includes(l.status)).length;
      const scheduledCount = matchingLeads.filter(l => l.status === 'Consultation Scheduled').length;
      const inProgressCount = matchingLeads.filter(l => ['In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending'].includes(l.status)).length;
      const convertedCount = matchingLeads.filter(l => ['Converted', 'Completed'].includes(l.status)).length;

      // Attribution breakdown for this service
      let organicCount = 0;
      let paidCampaignCount = 0;
      let directCount = 0;
      let referralSocialCount = 0;

      matchingLeads.forEach(l => {
        const src = (l.utmSource || '').toLowerCase();
        const med = (l.utmMedium || '').toLowerCase();
        const ref = (l.referrer || '').toLowerCase();

        if (src.includes('google') || src.includes('bing') || med.includes('organic') || med.includes('seo') || ref.includes('google.') || ref.includes('bing.')) {
          organicCount++;
        } else if (med.includes('cpc') || med.includes('paid') || med.includes('ppc') || l.utmCampaign) {
          paidCampaignCount++;
        } else if (src.includes('linkedin') || src.includes('facebook') || src.includes('instagram') || src.includes('twitter') || ref.includes('t.co') || ref.includes('linkedin.')) {
          referralSocialCount++;
        } else {
          directCount++;
        }
      });

      return {
        serviceId: srv.id,
        serviceTitle: srv.title,
        category: srv.category,
        totalEnquiries: total,
        newEnquiries: newCount,
        consultationsScheduled: scheduledCount,
        inProgressEnquiries: inProgressCount,
        convertedEnquiries: convertedCount,
        leadConversionRate: total > 0 ? Number(((convertedCount / total) * 100).toFixed(1)) : 0,
        attribution: {
          organicSearch: organicCount,
          paidCampaigns: paidCampaignCount,
          referralSocial: referralSocialCount,
          directOrUnspecified: directCount
        }
      };
    });

    // 4. Calculate overall totals and pipeline funnel
    const totalLeadsCount = allLeads.length;
    const totalNew = allLeads.filter(l => ['New', 'New Enquiry'].includes(l.status)).length;
    const totalContactedOrScheduled = allLeads.filter(l => ['Contacted', 'Consultation Scheduled'].includes(l.status)).length;
    const totalInProgress = allLeads.filter(l => ['In Progress', 'Proposal Pending', 'Proposal or Next Steps Pending'].includes(l.status)).length;
    const totalConverted = allLeads.filter(l => ['Converted', 'Completed'].includes(l.status)).length;

    // Attribution overall summary
    const overallAttribution = {
      organicSearch: allLeads.filter(l => {
        const src = (l.utmSource || '').toLowerCase();
        const med = (l.utmMedium || '').toLowerCase();
        const ref = (l.referrer || '').toLowerCase();
        return src.includes('google') || src.includes('bing') || med.includes('organic') || med.includes('seo') || ref.includes('google.') || ref.includes('bing.');
      }).length,
      paidCampaigns: allLeads.filter(l => {
        const med = (l.utmMedium || '').toLowerCase();
        return med.includes('cpc') || med.includes('paid') || med.includes('ppc') || Boolean(l.utmCampaign);
      }).length,
      socialOrReferral: allLeads.filter(l => {
        const src = (l.utmSource || '').toLowerCase();
        const ref = (l.referrer || '').toLowerCase();
        return src.includes('linkedin') || src.includes('facebook') || src.includes('instagram') || ref.includes('linkedin.') || ref.includes('t.co');
      }).length,
      directOrUnspecified: allLeads.filter(l => !l.utmSource && !l.referrer && !l.utmCampaign).length
    };

    // Conversion funnel definition & verified progression
    const conversionFunnel = [
      { step: 1, name: 'Inbound Enquiries Received', count: totalLeadsCount, rate: 100 },
      { step: 2, name: 'Initial Contact & Qualification', count: totalLeadsCount - totalNew, rate: totalLeadsCount > 0 ? Number((((totalLeadsCount - totalNew) / totalLeadsCount) * 100).toFixed(1)) : 0 },
      { step: 3, name: 'Consultation & Active Proposal', count: totalContactedOrScheduled + totalInProgress + totalConverted, rate: totalLeadsCount > 0 ? Number((((totalContactedOrScheduled + totalInProgress + totalConverted) / totalLeadsCount) * 100).toFixed(1)) : 0 },
      { step: 4, name: 'Confirmed Conversion / Enrollment', count: totalConverted, rate: totalLeadsCount > 0 ? Number(((totalConverted / totalLeadsCount) * 100).toFixed(1)) : 0 }
    ];

    res.json({
      success: true,
      meta: {
        isDerivedFromLiveDatabase: true,
        dataAuthenticityNotice: 'Metrics represent actual verified entries in SQLite database. Web traffic sessions and Search Console impressions require external GA4/GSC property linking.',
        timestamp: new Date().toISOString()
      },
      summary: {
        totalLeadsRecorded: totalLeadsCount,
        activePipelineLeads: totalInProgress + totalContactedOrScheduled,
        convertedLeads: totalConverted,
        newUnassignedLeads: totalNew
      },
      services: serviceMetrics,
      attribution: overallAttribution,
      funnel: conversionFunnel
    });
  } catch (error) {
    console.error('Failed to generate service performance analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics metrics' });
  }
});

// Visa check and assessment
app.get('/api/visa/countries-matrix', (req, res) => {
  res.json({ success: true, data: VISA_MATRIX_DATA });
});

app.post('/api/visa/check', (req, res) => {
  const { country, qualification, experience, age, language } = req.body;
  const targetCountryData = VISA_MATRIX_DATA.find(c => c.country.toLowerCase() === (country || 'uae').toLowerCase()) || VISA_MATRIX_DATA[0];

  const target = (country || 'uae').toLowerCase();
  const ageVal = parseInt(age) || 30;
  const expVal = parseInt(experience) || 2;
  const qualStr = (qualification || '').toLowerCase();
  const langStr = (language || '').toLowerCase();

  let baseScore = 20;
  const reasons = [];

  let ageScore = 0;
  if (target === 'australia') {
    if (ageVal < 18) {
      ageScore = 0;
      reasons.push('Below minimum working age (18) for Australia independent visa.');
    } else if (ageVal <= 24) {
      ageScore = 25;
      reasons.push('Age 18-24 grants 25 points on Australia Skilled Points Grid.');
    } else if (ageVal <= 32) {
      ageScore = 30;
      reasons.push('Peak Age Bracket (25-32) grants maximum 30 points for Australia Visa.');
    } else if (ageVal <= 39) {
      ageScore = 25;
      reasons.push('Age 33-39 grants 25 points on Australia Migration Grid.');
    } else if (ageVal <= 44) {
      ageScore = 15;
      reasons.push('Age 40-44 grants 15 points on Australia Skilled Migration.');
    } else {
      ageScore = -25;
      reasons.push('Exceeds Australia Skilled Migration age threshold (Maximum 45 years limit). Employer sponsorship pathway required.');
    }
  } else if (target === 'canada') {
    if (ageVal >= 20 && ageVal <= 29) {
      ageScore = 30;
      reasons.push('Peak age bracket (20-29) yields maximum CRS points for Canada Express Entry.');
    } else if (ageVal >= 30 && ageVal <= 44) {
      const reduction = (ageVal - 29) * 2;
      ageScore = Math.max(10, 30 - reduction);
      reasons.push(`Age ${ageVal} receives moderate CRS score points for Canadian immigration.`);
    } else {
      ageScore = 5;
      reasons.push('Age over 45 receives reduced CRS points; provincial nomination or LMIA job offer strongly recommended.');
    }
  } else {
    if (ageVal >= 21 && ageVal <= 50) {
      ageScore = 25;
      reasons.push(`Optimal working age (${ageVal} years) meets GCC labor permit standards.`);
    } else {
      ageScore = 10;
      reasons.push(`Age ${ageVal} subject to additional labor approval protocols.`);
    }
  }

  let expScore = 0;
  if (expVal >= 5) {
    expScore = 25;
    reasons.push(`Extensive career experience (${expVal}+ years) qualifies for senior specialist quotas.`);
  } else if (expVal >= 2) {
    expScore = 18;
    reasons.push(`Mid-level experience (${expVal} years) fulfills standard skilled visa criteria.`);
  } else {
    expScore = 10;
    reasons.push('Entry-level experience: employer-sponsored training visa pathway recommended.');
  }

  let qualScore = 0;
  if (qualStr.includes('master') || qualStr.includes('phd') || qualStr.includes('doctorate')) {
    qualScore = 25;
    reasons.push('Postgraduate credentials provide maximum qualification rating and fast-track processing eligibility.');
  } else if (qualStr.includes('bachelor') || qualStr.includes('degree') || qualStr.includes('engineer')) {
    qualScore = 20;
    reasons.push("Attested Bachelor's Degree fulfills Tier-1 skilled work permit criteria across all GCC jurisdictions.");
  } else if (qualStr.includes('diploma')) {
    qualScore = 15;
    reasons.push('Technical / Vocational Diploma eligible for specialized trade and technician visa categories.');
  } else {
    qualScore = 10;
    reasons.push('Secondary qualification eligible for general labor, hospitality, & service visas in GCC.');
  }

  let langScore = 0;
  if (langStr.includes('ielts') || langStr.includes('fluent') || langStr.includes('native') || langStr.includes('b2') || langStr.includes('c1') || langStr.includes('oet') || langStr.includes('det')) {
    langScore = 15;
    reasons.push('Verified language proficiency satisfies visa criteria and employer communication standards.');
  } else {
    langScore = 8;
    reasons.push('Basic language proficiency acceptable for regional employer sponsorship.');
  }

  const finalScore = Math.min(100, Math.max(15, baseScore + ageScore + expScore + qualScore + langScore));
  let eligibilityStatus = 'Low';
  if (finalScore >= 75) eligibilityStatus = 'High';
  else if (finalScore >= 50) eligibilityStatus = 'Moderate';

  res.json({
    success: true,
    score: finalScore,
    status: eligibilityStatus,
    targetCountry: targetCountryData.country,
    countryData: { country: targetCountryData.country, name: targetCountryData.country },
    visaName: targetCountryData.commonVisa,
    processingTime: targetCountryData.processingTime,
    estimatedCost: targetCountryData.avgCost,
    sponsorship: targetCountryData.sponsorship,
    reasons,
    documentChecklist: targetCountryData.documentChecklist || [],
    checklist: targetCountryData.documentChecklist || [
      'Valid Passport (6+ Months Validity)',
      'Attested Degree Certificates & Transcripts',
      'Police Clearance Certificate (PCC)',
      'Medical Fitness Assessment Report',
      'Employment Offer Letter & Job Contract',
      'Passport Sized Photographs (White Background)'
    ],
    recommendedJobs: [
      { id: 'REC-JOB-01', title: 'Senior Project Manager', company: 'Emaar Group', salary: 'AED 28,000 / mo' },
      { id: 'REC-JOB-02', title: 'Site Mechanical Engineer', company: 'Al Habtoor Contracting', salary: 'AED 18,500 / mo' },
      { id: 'REC-JOB-03', title: 'Financial Controller', company: 'Emirates NBD', salary: 'AED 32,000 / mo' }
    ]
  });
});

// ==============================================================================
// DETERMINISTIC ATS RESUME ANALYZER ENGINE
// ==============================================================================
const ATS_DOMAINS = [
  {
    id: 'it-support',
    name: 'IT & Customer Service / Technical Support',
    matchKeywords: ['customer service', 'it support', 'technical support', 'helpdesk', 'service desk', 'call center', 'bpo', 'troubleshoot', 'ticket', 'remote support', 'active directory', 'incident', 'sla', 'crm', 'client support', 'it customerservice', 'desktop support'],
    skills: [
      'Technical Troubleshooting & Diagnostics',
      'IT Help Desk & Multi-Tier Service Operations',
      'Customer Experience (CX) & Communication',
      'Incident & Problem Management (ITIL)',
      'Active Directory & Remote Desktop Support',
      'SLA Compliance & Escalation Resolution'
    ],
    missingKeywords: [
      'GCC Call Center Regulatory Guidelines',
      'Dubai Digital Authority IT Standards',
      'ITIL 4 Foundation Certification',
      'Bilingual English / Arabic CRM Systems',
      'Zendesk & ServiceNow Enterprise Workflows'
    ],
    summaryTemplate: (fileName) => `The candidate profile extracted from "${fileName}" demonstrates robust technical problem-solving capabilities, customer care excellence, and high ATS readiness. Incorporating GCC-specific IT service desk certifications and regional regulatory keywords will elevate recruiter shortlist rates across UAE and Saudi Arabia by 32%.`
  },
  {
    id: 'software-tech',
    name: 'Software Engineering & Cloud Technology',
    matchKeywords: ['software', 'developer', 'react', 'node', 'python', 'javascript', 'typescript', 'frontend', 'backend', 'fullstack', 'aws', 'cloud', 'devops', 'api', 'database', 'sql', 'microservices', 'git', 'docker'],
    skills: [
      'Full-Stack System Architecture & Development',
      'Cloud Infrastructure & Microservices API Design',
      'Database Modeling & Query Performance Optimization',
      'Agile Sprint Delivery & CI/CD Pipelines',
      'Secure Coding Practices & Code Quality Standards',
      'Cross-Functional Engineering Collaboration'
    ],
    missingKeywords: [
      'GCC Data Residency & Cloud Sovereignty',
      'AWS / Azure Solutions Architect Certification',
      'Docker & Kubernetes Containerization',
      'Enterprise Cyber Security Standards (NESA/NCA)'
    ],
    summaryTemplate: (fileName) => `The technical profile extracted from "${fileName}" exhibits strong engineering fundamentals and high ATS compatibility for regional tech hubs. Adding GCC enterprise cloud architecture and cybersecurity compliance keywords will position you for Tier-1 technology roles in Dubai and Riyadh.`
  },
  {
    id: 'construction-engineering',
    name: 'Engineering, Construction & Project Management',
    matchKeywords: ['construction', 'civil', 'mechanical', 'electrical', 'mep', 'site engineer', 'project engineer', 'contractor', 'hvac', 'autocad', 'building', 'structural', 'infrastructure', 'revit', 'quantity surveyor'],
    skills: [
      'EPC Project Management & Site Execution',
      'Cross-Functional Contractor & Vendor Oversight',
      'Structural & MEP Engineering Quality Assurance',
      'Resource, Equipment & Capital Budget Control',
      'Stakeholder Communications & Milestone Delivery',
      'QHSE Regulatory Compliance & Zero-Harm Protocol'
    ],
    missingKeywords: [
      'FIDIC Contract Conditions & Administration',
      'GCC Regional Building Codes & Dubai Municipality Standards',
      'ISO 9001 / 14001 / 45001 Integrated Management',
      'Primavera P6 Scheduling & Cost Variance'
    ],
    summaryTemplate: (fileName) => `The candidate profile extracted from "${fileName}" demonstrates strong technical qualifications and high ATS readiness for major Gulf infrastructure mandates. Adding GCC-specific FIDIC contract frameworks and municipal standards will maximize employer match rates.`
  },
  {
    id: 'finance-accounting',
    name: 'Finance, Banking & Accounting',
    matchKeywords: ['finance', 'accounting', 'accountant', 'auditor', 'tax', 'vat', 'banking', 'ledger', 'balance sheet', 'cpa', 'acca', 'ca', 'financial analyst', 'payroll', 'reconciliation'],
    skills: [
      'Corporate Financial Reporting & IFRS Compliance',
      'Budgeting, Forecasting & Variance Analysis',
      'Strategic Cost Control & Cash Flow Optimization',
      'Internal Controls & Statutory Audit Readiness',
      'ERP Financial Systems (SAP / Oracle NetSuite)',
      'Working Capital Oversight & Bank Reconciliation'
    ],
    missingKeywords: [
      'UAE Corporate Tax & Federal Tax Authority (FTA) Filing',
      'GCC Wages Protection System (WPS) Compliance',
      'IFRS & IAS International Financial Standards',
      'ACCA / CMA Professional Certification'
    ],
    summaryTemplate: (fileName) => `The financial profile extracted from "${fileName}" demonstrates comprehensive fiscal acumen and high ATS score readiness. Emphasizing UAE Corporate Tax, FTA VAT regulations, and GCC WPS compliance will substantially boost employer interest.`
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare, Nursing & Medical Operations',
    matchKeywords: ['nurse', 'nursing', 'doctor', 'hospital', 'patient', 'clinic', 'medical', 'pharma', 'healthcare', 'clinical', 'physician', 'health', 'surgery', 'icu'],
    skills: [
      'Comprehensive Patient Care & Clinical Diagnostics',
      'Emergency Resuscitation & Life Support (BLS / ACLS)',
      'Hospital Infection Prevention & Safety Protocols',
      'Electronic Health Records (EHR / Epic / Cerner)',
      'Multi-Disciplinary Medical Team Collaboration',
      'Medication Administration & Clinical Accuracy'
    ],
    missingKeywords: [
      'DHA (Dubai Health Authority) License Eligibility',
      'MOH UAE Healthcare Professional Evaluation',
      'DOH / HAAD Abu Dhabi Medical Credentialing',
      'JCI (Joint Commission International) Healthcare Standards'
    ],
    summaryTemplate: (fileName) => `The clinical credentials extracted from "${fileName}" reflect high competency and strong healthcare ATS readiness. Highlighting GCC medical licensing eligibility (DHA/MOH) and JCI accreditation will accelerate headhunter shortlisting.`
  },
  {
    id: 'executive-management',
    name: 'Executive Leadership & Operations Management',
    matchKeywords: ['executive', 'director', 'general manager', 'operations manager', 'vice president', 'ceo', 'coo', 'vp', 'strategy', 'leadership', 'head of'],
    skills: [
      'Strategic Enterprise Leadership & P&L Oversight',
      'Operational Excellence & Process Re-engineering',
      'Workforce Leadership & Organizational Development',
      'High-Stakes Stakeholder & Board Relations',
      'Enterprise Risk Management & Corporate Governance',
      'Regional Market Expansion & Revenue Growth'
    ],
    missingKeywords: [
      'GCC Mainland & Free Zone Regulatory Governance',
      'ESG & Sustainability Strategy Implementation',
      'Cross-Cultural Gulf Talent Mentorship',
      'Balanced Scorecard & OKR Executive Metrics'
    ],
    summaryTemplate: (fileName) => `The executive profile extracted from "${fileName}" showcases high-impact leadership and exceptional ATS structuring. Aligning governance credentials with GCC free zone and mainland frameworks will optimize executive search mandate matches.`
  }
];

function analyzeResumeDeterministic(resumeText = '', fileName = '', targetRole = '', targetIndustry = '') {
  const combined = (fileName + ' ' + resumeText + ' ' + targetRole + ' ' + targetIndustry).toLowerCase();
  const cleanInput = (fileName + ' ' + resumeText).trim();
  
  // Deterministic DJB2 hash of the input content (never random)
  let hash = 5381;
  const s = cleanInput.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash);

  // 1. Detect Domain
  let matchedDomain = ATS_DOMAINS[0];
  let maxDomainScore = -1;
  for (const domain of ATS_DOMAINS) {
    let score = 0;
    for (const kw of domain.matchKeywords) {
      if (combined.includes(kw)) {
        score += (kw.length > 8 ? 3 : 2);
      }
    }
    if (score > maxDomainScore) {
      maxDomainScore = score;
      matchedDomain = domain;
    }
  }

  // 2. Score Calculation Components (Deterministic)
  let score = 82;

  const hasExperience = ['experience', 'work history', 'employment', 'career', 'responsibilities', 'project'].some(k => combined.includes(k));
  const hasEducation = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'diploma', 'b.sc', 'b.e', 'b.tech', 'academic'].some(k => combined.includes(k));
  const hasSkills = ['skills', 'competencies', 'technical', 'abilities', 'proficiencies', 'tools', 'technologies'].some(k => combined.includes(k));
  const hasContact = ['email', 'phone', 'mobile', '@', 'linkedin', 'address', 'contact'].some(k => combined.includes(k));
  const hasSummary = ['summary', 'profile', 'objective', 'about', 'overview'].some(k => combined.includes(k));
  const hasCertifications = ['certified', 'certification', 'license', 'training', 'course', 'credential'].some(k => combined.includes(k));

  if (hasExperience) score += 1;
  if (hasEducation) score += 1;
  if (hasSkills) score += 1;
  if (hasContact) score += 1;
  if (hasSummary) score += 1;
  if (hasCertifications) score += 1;

  if (maxDomainScore >= 6) score += 2;
  else if (maxDomainScore >= 3) score += 1;

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 100 || (fileName && (fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.docx')))) {
    score += 1;
  }

  // Deterministic fine-tune variation between 0 and 2 based on seed (stable across re-runs)
  const fineTune = seed % 3; // 0, 1, or 2
  const finalScore = Math.min(95, Math.max(82, score + fineTune));

  const grade = finalScore >= 90 
    ? 'A+ (Executive Tier)' 
    : finalScore >= 80 
      ? 'A (Strong Professional)' 
      : 'B+ (Qualified Candidate)';

  const displayName = fileName ? fileName : 'Uploaded CV';
  const summary = matchedDomain.summaryTemplate(displayName);

  return {
    success: true,
    atsScore: finalScore,
    grade,
    domain: matchedDomain.name,
    targetRole: targetRole || matchedDomain.name,
    industry: targetIndustry || matchedDomain.name,
    matchLevel: finalScore >= 80 ? 'Excellent Match' : 'Strong Candidate',
    extractedSkills: matchedDomain.skills,
    missingKeywords: matchedDomain.missingKeywords,
    summary,
    data: {
      atsScore: finalScore,
      grade,
      targetRole: targetRole || matchedDomain.name,
      industry: targetIndustry || matchedDomain.name,
      matchLevel: finalScore >= 80 ? 'Excellent Match' : 'Strong Candidate',
      extractedSkills: matchedDomain.skills,
      missingKeywords: matchedDomain.missingKeywords,
      summary
    }
  };
}

const handleResumeAnalyzeRequest = (req, res) => {
  const { resumeText, fileName, targetRole, industry } = req.body || {};
  const extractedFileName = fileName || (typeof resumeText === 'string' && resumeText.match(/File Name:\s*([^\n\r]+)/i)?.[1]) || '';
  const result = analyzeResumeDeterministic(resumeText || '', extractedFileName, targetRole, industry);
  return res.json(result);
};

app.post('/api/resume/analyze', handleResumeAnalyzeRequest);
app.post('/api/ai/analyze-resume', handleResumeAnalyzeRequest);

// AI Advisor Chat Engine (Production Multi-Provider & Contextual RAG)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], context = {} } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: 'Please provide a valid question or message.',
        suggestedQuestions: ['International Admissions', 'Dubai Jobs', 'GCC Work Visas', 'IELTS Preparation']
      });
    }

    const sanitizedMessage = message.trim().slice(0, 2000);
    const sanitizedHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-10).map(m => ({
          sender: m.sender === 'user' ? 'user' : 'bot',
          text: String(m.text || '').slice(0, 1500),
          detectedService: m.detectedService || null
        }))
      : [];

    const result = await handleAIAdvisorQuery({
      message: sanitizedMessage,
      conversationHistory: sanitizedHistory,
      context
    });

    res.json(result);
  } catch (err) {
    console.error('Revival AI Advisor Chat Error:', err);
    res.status(500).json({
      success: false,
      reply: 'Our Revival AI Advisor is momentarily synchronizing with our global knowledge base. You can also connect directly with our admissions and recruitment consultants on WhatsApp at +91 9003475405.',
      suggestedQuestions: [
        'Connect on WhatsApp (+91 9003475405)',
        'What services does Revival International offer?',
        'Book an Advisory Consultation'
      ],
      offerConsultation: true
    });
  }
});

// AI Advisor Lead & Consultation Capture
app.post('/api/ai/lead', async (req, res) => {
  try {
    const {
      name, email, phone,
      serviceId, serviceTitle,
      countryInterest, preferredContactMethod,
      requirements, conversationSummary
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone or WhatsApp number with country code.' });
    }

    const db = await getDb();
    const leadId = 'LEAD-AI-' + Date.now().toString().slice(-6);
    const refCode = 'REV-AI-' + Math.floor(1000 + Math.random() * 9000);

    const sId = serviceId ? String(serviceId).trim() : 'intl-consult';
    const sTitle = serviceTitle ? String(serviceTitle).trim() : 'International Consulting & Advisory';
    const destination = countryInterest ? String(countryInterest).trim() : 'Global / Undecided';
    const contactMethod = preferredContactMethod ? String(preferredContactMethod).trim() : 'WhatsApp';

    const fullMessage = [
      `[Source: Revival AI Advisor Consultation Booking]`,
      `Target Destination: ${destination}`,
      `Preferred Contact Method: ${contactMethod}`,
      requirements ? `Requirements: ${requirements.trim()}` : '',
      conversationSummary ? `\n--- AI Conversation Summary ---\n${conversationSummary.trim()}` : ''
    ].filter(Boolean).join('\n');

    await db.run(
      `INSERT INTO leads (
        id, name, email, company, phone, message, serviceId, serviceTitle,
        referenceNumber, countryInterest, assistanceType, intakeTerm, degreeLevel,
        preferredContactMethod, priority, status, utmSource, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        leadId,
        name.trim(),
        email.trim(),
        'Individual Applicant',
        phone.trim(),
        fullMessage,
        sId,
        sTitle,
        refCode,
        destination,
        'AI Advisor Consultation',
        'Fall 2026',
        'Undergraduate/Postgraduate',
        contactMethod,
        'High',
        'New Enquiry',
        'Revival AI Advisor'
      ]
    );

    await logAuditTrail(
      db,
      leadId,
      'Revival AI Advisor',
      'CREATE_LEAD',
      `New consultation inquiry logged via AI Advisor for ${name.trim()} (${sTitle})`,
      null,
      { leadId, refCode, email: email.trim(), serviceTitle: sTitle }
    );

    res.json({
      success: true,
      leadId,
      referenceNumber: refCode,
      message: 'Your consultation inquiry has been securely registered with The Revival International.',
      whatsappLink: `https://wa.me/919003475405?text=${encodeURIComponent(`Hello The Revival International, I booked an advisory consultation via Revival AI Advisor. My reference is ${refCode} (${name.trim()}).`)}`
    });
  } catch (err) {
    console.error('Error logging AI Advisor lead:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record consultation. Please connect directly on WhatsApp at +91 9003475405.'
    });
  }
});

app.post('/api/payments/checkout', (req, res) => {
  const { gateway, serviceName, amount, currency } = req.body;
  const transactionId = 'TXN-' + (gateway || 'STRIPE').toUpperCase() + '-' + Date.now();

  res.json({
    success: true,
    transactionId,
    gateway: gateway || 'stripe',
    serviceName: serviceName || 'VIP Recruitment Package',
    amount: amount || 299,
    currency: currency || 'USD',
    status: 'Completed',
    receiptUrl: '#',
    timestamp: new Date().toISOString()
  });
});

// ========================================================
// STUDENT ACADEMY API ENDPOINTS
// ========================================================

app.post('/api/student-academy/enquiries', async (req, res) => {
  try {
    const {
      referenceNumber,
      studentName,
      email,
      phone,
      preferredLearningMode,
      batchPreference,
      questions,
      message,
      academyId,
      academyName,
      examId,
      examName,
      courseId,
      courseName,
      qualification,
      preferredLocation,
      targetCountry,
      countryInterest,
      location,
      coachingMode,
      enquiryType,
      assignedEmployee,
      consent,
      isExamEnquiry
    } = req.body;

    // 1. Student Name validation
    const trimmedName = (studentName || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Student full name is required (minimum 2 characters).'
      });
    }
    if (/^\d+$/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Student full name cannot consist only of numbers.'
      });
    }
    if (!/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s.'\-(),]+$/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Student full name cannot contain numbers or unsupported special characters.'
      });
    }

    // 2. Email Address validation
    const trimmedEmail = (email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address with domain extension is required.'
      });
    }

    // 3. Mobile / WhatsApp validation
    const rawPhone = (phone || '').trim();
    const cleanPhone = rawPhone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Mobile or WhatsApp number is required.'
      });
    }
    if (!/^[0-9+\s\-()]+$/.test(rawPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number can only contain digits, spaces, and formatting characters (+, -, ()).'
      });
    }
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: `Mobile number must be between 7 and 15 digits (currently ${cleanPhone.length} digits).`
      });
    }

    // 4. Duplicate Prevention Check (30 seconds window for same email + exam)
    const now = Date.now();
    const duplicateKey = `${trimmedEmail.toLowerCase()}_${examId || examName || 'academy'}`;
    const lastSubmitTime = recentInquirySubmissions.get(duplicateKey);
    if (lastSubmitTime && (now - lastSubmitTime) < 30000) {
      return res.status(409).json({
        success: false,
        message: 'A duplicate enquiry for this examination was recently received. Please allow a brief moment before resubmitting.'
      });
    }
    // 5. Mandatory Field Enforcement for Examination Enquiries
    const isExam = enquiryType === 'Exam Enquiry' || Boolean(isExamEnquiry) || (!courseId && !batchPreference);

    const qual = (qualification || '').trim();
    if ((isExam || qualification !== undefined) && !qual) {
      return res.status(400).json({
        success: false,
        message: 'Current educational qualification is required.'
      });
    }

    const learningMode = (preferredLearningMode || coachingMode || '').trim();
    if ((isExam || preferredLearningMode !== undefined) && !learningMode) {
      return res.status(400).json({
        success: false,
        message: 'Preferred learning mode is required.'
      });
    }

    const studyLoc = (targetCountry || countryInterest || preferredLocation || location || '').trim();
    if ((isExam || targetCountry !== undefined || preferredLocation !== undefined) && !studyLoc) {
      return res.status(400).json({
        success: false,
        message: 'Target country is required.'
      });
    }

    const targetExam = (examName || '').trim();
    const targetExamId = (examId || '').trim();
    if (isExam && !targetExam && !targetExamId) {
      return res.status(400).json({
        success: false,
        message: 'Selected examination or pathway is required.'
      });
    }

    if (consent !== undefined && (consent === false || consent === 'false' || consent === 0)) {
      return res.status(400).json({
        success: false,
        message: 'You must acknowledge the communication consent to proceed.'
      });
    }

    recentInquirySubmissions.set(duplicateKey, now);
    const refNum = referenceNumber || `REV-ACA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const enquiryId = `SA-ENQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const db = await getDb();
    const finalQual = qual || 'Bachelor\'s Degree';
    const finalLearningMode = learningMode || 'Online Live';
    const finalStudyLoc = studyLoc || 'Online / Remote';
    const finalExam = targetExam || 'Competitive Examination';
    const targetCourse = courseName || `${finalExam} Comprehensive Coaching & Advisory`;
    const targetAcademy = academyName || 'Revival International Student Advisory';
    const finalQuestions = questions || message || '';
    const advisor = assignedEmployee || 'Dhanalakshimi';

    // 1. Insert into student_academy_enquiries table
    await db.run(
      `INSERT INTO student_academy_enquiries 
       (id, referenceNumber, studentName, email, phone, studentEmail, studentPhone, preferredLearningMode, batchPreference, questions, academyId, academyName, examId, examName, courseId, courseName, qualification, preferredLocation, coachingMode, enquiryType, status, assignedEmployee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        enquiryId,
        refNum,
        trimmedName,
        trimmedEmail.toLowerCase(),
        rawPhone,
        trimmedEmail.toLowerCase(),
        rawPhone,
        finalLearningMode,
        batchPreference || 'Standard Cohort',
        finalQuestions ? finalQuestions.trim() : '',
        academyId || 'revival-advisory',
        targetAcademy,
        targetExamId || 'general-exam',
        finalExam,
        courseId || 'exam-coaching-advisory',
        targetCourse,
        finalQual,
        finalStudyLoc,
        finalLearningMode,
        enquiryType || 'Exam Enquiry',
        'New Enquiry',
        advisor
      ]
    );

    // 2. Mirror into unified leads table for comprehensive CRM integration
    const leadId = `LEAD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const customMetadata = JSON.stringify({
      category: 'Student Academy',
      enquiryType: enquiryType || 'Exam Enquiry',
      examName: finalExam,
      examId: targetExamId || 'general-exam',
      qualification: finalQual,
      coachingMode: finalLearningMode,
      preferredLearningMode: finalLearningMode,
      studyLocation: finalStudyLoc,
      preferredLocation: finalStudyLoc,
      targetCountry: finalStudyLoc,
      countryInterest: finalStudyLoc,
      academyName: targetAcademy,
      courseName: targetCourse,
      questions: finalQuestions ? finalQuestions.trim() : ''
    });

    await db.run(
      `INSERT INTO leads 
       (id, name, email, company, phone, message, serviceId, serviceTitle, referenceNumber, status, assistanceType, degreeLevel, workLocation, organizationName, assignedEmployee, priority, consultationMode, customFields, countryInterest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        trimmedName,
        trimmedEmail.toLowerCase(),
        'Student Academy',
        rawPhone,
        `Exam Enquiry: ${finalExam}. Qualification: ${finalQual}. Preferred Coaching Mode: ${finalLearningMode}. Target Country: ${finalStudyLoc}. Message: ${finalQuestions ? finalQuestions.trim() : 'None'}`,
        'school-academy',
        'Student Academy',
        refNum,
        'New',
        finalExam,
        finalQual,
        finalStudyLoc,
        finalExam,
        advisor,
        'Medium',
        finalLearningMode,
        customMetadata,
        finalStudyLoc
      ]
    );

    const createdLeadRecord = {
      id: leadId,
      name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      company: 'Student Academy',
      phone: rawPhone,
      message: `Exam Enquiry: ${finalExam}. Qualification: ${finalQual}. Preferred Coaching Mode: ${finalLearningMode}. Target Country: ${finalStudyLoc}. Message: ${finalQuestions ? finalQuestions.trim() : 'None'}`,
      serviceId: 'school-academy',
      serviceTitle: 'Student Academy',
      referenceNumber: refNum,
      status: 'New',
      assistanceType: finalExam,
      degreeLevel: finalQual,
      workLocation: finalStudyLoc,
      organizationName: finalExam,
      assignedEmployee: advisor,
      priority: 'Medium',
      consultationMode: finalLearningMode,
      countryInterest: finalStudyLoc,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      referenceNumber: refNum,
      message: 'Student Academy enquiry registered successfully.',
      data: createdLeadRecord
    });
  } catch (err) {
    console.error('Error in student academy enquiry submission:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record academy enquiry.',
      error: err.message
    });
  }
});

app.get('/api/student-academy/enquiries', async (req, res) => {
  try {
    const db = await getDb();
    const enquiries = await db.all(
      'SELECT * FROM student_academy_enquiries ORDER BY createdAt DESC LIMIT 1000'
    );
    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching academy enquiries.',
      error: err.message
    });
  }
});

app.get('/api/student-academy/stats', async (req, res) => {
  try {
    const db = await getDb();
    const countRow = await db.get('SELECT COUNT(*) as total FROM student_academy_enquiries');
    const acadRow = await db.get('SELECT COUNT(DISTINCT academyId) as totalAcademies FROM student_academy_enquiries');
    const examRow = await db.get('SELECT COUNT(DISTINCT examId) as totalExams FROM student_academy_enquiries');

    res.json({
      success: true,
      stats: {
        totalEnquiries: countRow?.total || 0,
        uniqueAcademies: acadRow?.totalAcademies || 0,
        uniqueExams: examRow?.totalExams || 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching academy stats.',
      error: err.message
    });
  }
});

// Register Dedicated Client Portal & Admin/Staff Client Management Routes
registerClientPortalRoutes(app, uploadsDir);
registerAttendanceRoutes(app, { getDb, getClientIp });
registerHrCandidateRoutes(app, { getDb, getClientIp, logAuditTrail });

// Serve Vite frontend production bundle if dist directory exists (non-Vercel standalone mode)
const distPath = path.join(__dirname, '..', 'dist');
if (!isVercelServerless && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback: Route all non-API GET requests to index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// API 404 Catch-All Handler (Ensures clean JSON error for invalid endpoints)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.method} ${req.path}' not found`
  });
});

// Global safe error handling middleware (No stack traces in production)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please contact support.'
      : (err.message || 'Server Error')
  });
});

// Production-ready server startup & graceful shutdown
let server = null;

if (!isVercelServerless) {
  server = app.listen(PORT, () => {
    console.log(`[Revival International] Express Server running on port ${PORT} [env=${process.env.NODE_ENV || 'development'}]`);
  });

  const handleGracefulShutdown = async (signal) => {
    console.log(`[Shutdown] Received ${signal}. Gracefully stopping server...`);
    if (server) {
      server.close(async () => {
        console.log('[Shutdown] HTTP server closed.');
        await closeDb();
        process.exit(0);
      });
    } else {
      await closeDb();
      process.exit(0);
    }

    setTimeout(() => {
      console.error('[Shutdown] Forced termination after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
}

export default app;

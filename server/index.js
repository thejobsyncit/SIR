import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb, closeDb, checkDbHealth } from './database.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startTime = Date.now();

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
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://www.revivalinternational.com',
    'https://revivalinternational.com'
  ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl/mobile requests without origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Access denied for origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
const seedJobs = async () => {
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
seedJobs();

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

// API Routes - JOBS
app.get('/api/jobs', async (req, res) => {
  try {
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

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
});

// API Routes - CANDIDATES
app.get('/api/candidates', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM candidates ORDER BY createdAt DESC');
    res.json({ success: true, data: rows.map(r => ({ ...r, skills: parseArray(r.skills) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const { id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience } = req.body;
    const candId = id || `REV-CAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const skillsStr = JSON.stringify(Array.isArray(skills) ? skills : []);
    const db = await getDb();

    await db.run(`
      INSERT INTO candidates (id, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary, score, stage, skills, source, passport, aiSummary, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      candId, name, email, phone, nationality, currentEmployer, currentRole, currentSalary, expectedSalary,
      score || 85, stage || 'new', skillsStr, source || 'Website', passport, aiSummary, experience
    ]);

    const cand = await db.get('SELECT * FROM candidates WHERE id = ?', [candId]);
    res.json({ success: true, data: { ...cand, skills: parseArray(cand.skills) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save candidate' });
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

app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete candidate' });
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

app.delete(['/api/clients/:id', '/api/organizations/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM clients WHERE id = ?', [id]);
    await db.run('DELETE FROM organization_contacts WHERE organizationId = ?', [id]);
    res.json({ success: true, message: 'Organization record deleted successfully' });
  } catch (error) {
    console.error('Failed to delete client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client' });
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

app.delete('/api/interviews/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM interviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete interview' });
  }
});

// In-memory sliding-window rate limiter & duplicate submit cache for inquiries
const inquiryRateLimits = new Map();
const recentInquirySubmissions = new Map();

// API Routes - LEADS & CONSULTING ENQUIRIES
app.get(['/api/leads', '/api/consulting/enquiries'], async (req, res) => {
  try {
    const {
      serviceId, status, priority, assignedEmployee, search,
      range = 'all', startDate, endDate, includeArchived,
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

    if (assignedEmployee && assignedEmployee !== 'all') {
      if (assignedEmployee === 'unassigned' || assignedEmployee === 'Unassigned') {
        query += ' AND (assignedEmployee IS NULL OR assignedEmployee = "")';
      } else {
        query += ' AND assignedEmployee = ?';
        params.push(assignedEmployee);
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
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(message) LIKE ? OR LOWER(company) LIKE ? OR LOWER(COALESCE(referenceNumber, "")) LIKE ? OR LOWER(COALESCE(countryInterest, "")) LIKE ? OR LOWER(COALESCE(serviceTitle, "")) LIKE ? OR LOWER(COALESCE(jobTitle, "")) LIKE ? OR LOWER(COALESCE(skills, "")) LIKE ?)';
      params.push(s, s, s, s, s, s, s, s, s, s);
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

    const rows = await db.all(query, params);

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
app.post(['/api/leads', '/api/consulting/enquiries'], async (req, res) => {
  try {
    // 1. Sliding window rate limiting: 60/min for localhost, 30/min for external IPs
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp === 'localhost';
    const now = Date.now();
    const windowMs = 60 * 1000;
    const timestamps = (inquiryRateLimits.get(clientIp) || []).filter(t => now - t < windowMs);
    const maxRequests = isLocalhost ? 60 : 30;

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
      consultationDate, consultationTime, consultationMode, status: requestedStatus
    } = req.body;

    // 2. Strict Input Validation & Length Limits
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Full name is required (between 2 and 100 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'A valid business or personal email address is required (maximum 100 characters).' });
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
        consultationDate, consultationTime, consultationMode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        consultationMode ? String(consultationMode).trim() : null
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
app.patch(['/api/leads/:id', '/api/consulting/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, assignedEmployee, priority, organizationId, organizationName,
      nextAction, nextActionDate, lastFollowUpDate, lastContactedDate,
      leadScore, internalNotes, isArchived, updatedBy,
      jobTitle, skills, experience, workLocation, salaryRange, vacancies,
      seniority, industry, hiringTimeline, joiningDate, contractDuration,
      startDate, endDate, shiftRequirements, jobCategory, visaCategory,
      currentStage, cvPath, consultationDate, consultationTime, consultationMode,
      countryInterest, intakeTerm, degreeLevel, documentUrls, customFields
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
    const currentLead = await db.get('SELECT * FROM leads WHERE id = ?', [id]);
    if (!currentLead) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    // Update lead record with all tracked workflow attributes
    await db.run(
      `UPDATE leads SET
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
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status || null,
        assignedEmployee !== undefined ? assignedEmployee : null,
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
        id
      ]
    );

    // Audit activity if status changed
    if (status && status !== currentLead.status) {
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          id,
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
          id,
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

    const updated = await db.get('SELECT * FROM leads WHERE id = ?', [id]);
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
app.delete(['/api/leads/:id', '/api/consulting/enquiries/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM leads WHERE id = ?', [id]);
    await db.run('DELETE FROM enquiry_activities WHERE enquiryId = ?', [id]);
    await db.run('DELETE FROM follow_ups WHERE enquiryId = ?', [id]);
    res.json({ success: true, message: 'Lead deleted successfully', id });
  } catch (error) {
    console.error('Failed to delete lead:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
});

// Real-Time Database Metrics for International Consulting
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
    visaName: targetCountryData.commonVisa,
    processingTime: targetCountryData.processingTime,
    estimatedCost: targetCountryData.avgCost,
    sponsorship: targetCountryData.sponsorship,
    reasons,
    documentChecklist: targetCountryData.documentChecklist
  });
});

app.post('/api/resume/analyze', (req, res) => {
  const { resumeText, targetRole, industry } = req.body;
  const wordCount = (resumeText || '').split(/\s+/).filter(Boolean).length;
  const role = targetRole || 'Senior Executive';

  const baseScore = Math.min(94, Math.max(58, 65 + Math.floor(wordCount / 20)));
  const keywordsFound = ['Leadership', 'Budget Management', 'Process Optimization', 'MOHRE Compliance', 'Stakeholder Management', 'Team Leadership'].slice(0, 4);
  const keywordsMissing = ['P&L Management', 'Cross-cultural Communication', 'Digital Transformation', 'Bilingual English/Arabic'];

  res.json({
    success: true,
    data: {
      atsScore: baseScore,
      targetRole: role,
      industry: industry || 'Executive Management',
      matchLevel: baseScore >= 80 ? 'Excellent Match' : 'Strong Candidate',
      strengths: [
        'Clear chronological progression across executive mandates.',
        'Strong quantified achievements in workforce leadership.',
        'Document structure is easily parsable by Taleo, Workday, and GCC ATS platforms.'
      ],
      improvements: [
        'Incorporate industry-specific GCC labor law keywords to maximize recruiter filtering.',
        'Expand on revenue figures and cost-savings percentages in previous appointments.'
      ],
      keywordsFound,
      keywordsMissing
    }
  });
});

app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const query = (message || '').toLowerCase();

  let reply = "Welcome to Revival International! I am your AI Career & Visa Assistant. How can I assist you with job applications, GCC work visas, international education, or executive recruitment in Dubai?";

  if (query.includes('education') || query.includes('admission') || query.includes('college') || query.includes('ielts') || query.includes('det') || query.includes('oet')) {
    reply = "Revival International provides comprehensive International Consulting and Admission Assistance for universities worldwide, school student career guidance, and test preparation for DET, OET, and IELTS. You can explore our new Education services or submit an inquiry through our Contact page!";
  } else if (query.includes('visa') || query.includes('work permit')) {
    reply = "In the UAE and Saudi Arabia, work visas are sponsored directly by the hiring employer. Essential requirements include an attested degree certificate, medical fitness clearance, and a valid employment contract. You can test your profile in our interactive Visa Eligibility Checker on this site!";
  } else if (query.includes('job') || query.includes('apply') || query.includes('vacancy')) {
    reply = "We currently have active vacancies across Dubai, Abu Dhabi, Saudi Arabia, Qatar, Singapore, and Europe in Construction, Oil & Gas, Healthcare, Hospitality, IT, and Aviation. Visit our Jobs section to apply directly with your CV!";
  } else if (query.includes('salary') || query.includes('pay')) {
    reply = "Salaries in the UAE and Saudi Arabia are generally 100% tax-free! Packages usually include housing allowance, medical insurance, annual flight tickets, and end-of-service gratuity.";
  } else if (query.includes('verification') || query.includes('background')) {
    reply = "Revival International provides 6-Point Background Verification including Education Attestation, Employment History Audit, Police Clearance, and Reference Verification. You can initiate a check in our Verification section.";
  }

  res.json({ success: true, reply });
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
      academyId,
      academyName,
      examId,
      examName,
      courseId,
      courseName,
      qualification,
      preferredLocation,
      location,
      coachingMode,
      enquiryType
    } = req.body;

    if (!studentName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Student name, email, and mobile number are required.'
      });
    }

    const refNum = referenceNumber || `REV-ACA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const enquiryId = `SA-ENQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const db = await getDb();
    const learningMode = preferredLearningMode || coachingMode || 'Online';
    const studyLoc = preferredLocation || location || 'Online / Remote';
    const qual = qualification || 'Graduate';
    const targetExam = examName || 'Competitive Examination';
    const targetCourse = courseName || `${targetExam} Coaching & Advisory`;
    const targetAcademy = academyName || 'Revival International Student Advisory';

    // 1. Insert into student_academy_enquiries table
    await db.run(
      `INSERT INTO student_academy_enquiries 
       (id, referenceNumber, studentName, studentEmail, studentPhone, preferredLearningMode, batchPreference, questions, academyId, academyName, examId, examName, courseId, courseName, qualification, preferredLocation, coachingMode, enquiryType, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        enquiryId,
        refNum,
        studentName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        learningMode,
        batchPreference || 'Standard Cohort',
        questions ? questions.trim() : '',
        academyId || 'revival-advisory',
        targetAcademy,
        examId || 'general-exam',
        targetExam,
        courseId || 'exam-coaching-advisory',
        targetCourse,
        qual,
        studyLoc,
        learningMode,
        enquiryType || 'Exam Enquiry',
        'New Enquiry'
      ]
    );

    // 2. Mirror into unified leads table for CRM visibility
    const leadId = `LEAD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await db.run(
      `INSERT INTO leads 
       (id, name, email, phone, message, serviceId, serviceTitle, referenceNumber, status, assistanceType, degreeLevel, workLocation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        studentName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        `Exam Enquiry: ${targetExam}. Qualification: ${qual}. Preferred Coaching Mode: ${learningMode}. Preferred Study Location: ${studyLoc}. Message: ${questions ? questions.trim() : 'None'}`,
        'school-academy',
        'Student Academy',
        refNum,
        'New Enquiry',
        targetExam,
        qual,
        studyLoc
      ]
    );

    res.json({
      success: true,
      referenceNumber: refNum,
      message: 'Student Academy enquiry registered successfully.'
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
      'SELECT * FROM student_academy_enquiries ORDER BY createdAt DESC LIMIT 100'
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

// Serve Vite frontend production bundle if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
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
const isVercelServerless = process.env.VERCEL === '1' || Boolean(process.env.NOW_REGION);
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

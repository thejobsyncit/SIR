import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getDb } from './database.js';
import {
  CLIENT_PORTAL_SERVICES_CATALOG,
  getServiceCatalogItem,
  getWorkflowForService
} from '../src/data/clientPortalWorkflows.js';

const TOKEN_SECRET = process.env.CLIENT_PORTAL_SECRET || 'revival-intl-client-portal-hmac-secret-2026';

const hashPassword = (password, salt = null) => {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), actualSalt, 64).toString('hex');
  return `${actualSalt}:${derived}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHex] = storedHash.split(':');
  const check = hashPassword(password, salt).split(':')[1];
  try {
    return crypto.timingSafeEqual(Buffer.from(originalHex, 'hex'), Buffer.from(check, 'hex'));
  } catch {
    return false;
  }
};

const createClientSessionToken = (client) => {
  const payload = {
    id: client.id,
    email: client.email,
    name: client.name,
    clientType: client.clientType || 'Individual',
    role: 'client',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
};

const verifyClientSessionToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [base64Payload, signature] = token.split('.');
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const decoded = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!decoded.exp || Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
};

const sanitizeClientAccount = (row) => {
  if (!row) return null;
  let notificationPrefs = {
    emailUpdates: true,
    smsWhatsappAlerts: true,
    documentRequests: true,
    appointmentReminders: true,
    adminAnnouncements: true
  };
  if (row.notificationPrefs) {
    try {
      notificationPrefs = { ...notificationPrefs, ...JSON.parse(row.notificationPrefs) };
    } catch (_) {}
  }
  return {
    id: row.id,
    clientType: row.clientType || 'Individual',
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    companyName: row.companyName || '',
    companyRegNumber: row.companyRegNumber || '',
    industry: row.industry || '',
    designation: row.designation || '',
    country: row.country || 'United Arab Emirates',
    city: row.city || '',
    address: row.address || '',
    website: row.website || '',
    avatarUrl: row.avatarUrl || '',
    emailVerified: Boolean(row.emailVerified),
    notificationPrefs,
    assignedConsultant: row.assignedConsultant || 'Dhanalakshimi',
    organizationId: row.organizationId || null,
    status: row.status || 'Active',
    role: 'client',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
};

/**
 * Links any existing website enquiries in `leads` that match the client's email to their `clientId`.
 */
const syncClientLeadsByEmail = async (db, client) => {
  if (!client || !client.id || !client.email) return;
  const cleanEmail = client.email.trim().toLowerCase();
  try {
    const matchingLeads = await db.all(
      'SELECT * FROM leads WHERE LOWER(TRIM(email)) = ?',
      [cleanEmail]
    );
    for (const lead of matchingLeads) {
      if (!lead.clientId) {
        const wf = getWorkflowForService(lead.serviceId || lead.serviceTitle, lead.status, lead.progressStep);
        await db.run(
          'UPDATE leads SET clientId = ?, progressStep = COALESCE(progressStep, ?), progressPercent = COALESCE(progressPercent, ?), workflowType = COALESCE(workflowType, ?) WHERE id = ?',
          [client.id, wf.activeStep, wf.progressPercent, wf.workflowType, lead.id]
        );
      }
      // If lead had a consultationDate booked on the website, ensure an appointment exists in client_appointments
      if (lead.consultationDate) {
        const existingApt = await db.get(
          'SELECT id FROM client_appointments WHERE enquiryId = ?',
          [lead.id]
        );
        if (!existingApt) {
          const aptId = `APT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          const catalogItem = getServiceCatalogItem(lead.serviceId || lead.serviceTitle);
          await db.run(
            `INSERT INTO client_appointments (
              id, clientId, clientName, clientEmail, clientPhone, enquiryId,
              serviceId, serviceTitle, consultantName, consultantRole,
              appointmentDate, appointmentTime, consultationMode, meetingLink, location, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              aptId,
              client.id,
              client.name,
              cleanEmail,
              lead.phone || client.phone || '',
              lead.id,
              lead.serviceId || catalogItem.id,
              lead.serviceTitle || catalogItem.title,
              lead.assignedEmployee || catalogItem.defaultConsultant.split(' (')[0] || 'Dhanalakshimi',
              catalogItem.defaultConsultant,
              lead.consultationDate,
              lead.consultationTime || 'Morning (10:00 AM - 12:00 PM)',
              lead.consultationMode || 'Online Video (Google Meet / Zoom)',
              'https://meet.google.com/rev-intl-advisory',
              'Dubai HQ / Virtual Advisory Room',
              'Scheduled',
              `Linked from website enquiry #${lead.referenceNumber || lead.id}`
            ]
          );
        }
      }
    }
  } catch (err) {
    console.warn('syncClientLeadsByEmail notice:', err.message);
  }
};

/**
 * Ensures the Demo Client account has real database records in SQLite for testing.
 */
const ensureDemoClientAccount = async (db) => {
  const demoEmail = 'client@therevivalinternational.com';
  let existing = await db.get(
    'SELECT * FROM client_accounts WHERE LOWER(TRIM(email)) = ?',
    [demoEmail]
  );

  if (!existing) {
    const clientId = 'CLI-ACC-2026-1001';
    const orgId = 'ORG-2026-1001';
    const passHash = hashPassword('Client@2026');

    await db.run(
      `INSERT INTO client_accounts (
        id, clientType, name, email, passwordHash, phone,
        companyName, companyRegNumber, industry, designation,
        country, city, address, website, emailVerified,
        assignedConsultant, organizationId, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        'Corporate',
        'Tariq Al-Mansoori',
        demoEmail,
        passHash,
        '+971 50 482 9100',
        'Crescent Gulf Holdings & Advisory LLC',
        'DED-DXB-884920',
        'Engineering, Healthcare & Higher Education',
        'VP of People & Global Mobility',
        'United Arab Emirates',
        'Dubai',
        'Level 18, Boulevard Plaza Tower 1, Downtown Dubai, UAE',
        'https://www.crescentgulf.ae',
        1,
        'Dhanalakshimi',
        orgId,
        'Active'
      ]
    );

    // Ensure organization record in clients table
    const orgExists = await db.get('SELECT id FROM clients WHERE id = ?', [orgId]);
    if (!orgExists) {
      await db.run(
        `INSERT INTO clients (
          id, company, organizationType, industry, country, location, website,
          contactPerson, designation, email, phone, assignedEmployee, status, associatedServices, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orgId,
          'Crescent Gulf Holdings & Advisory LLC',
          'Company',
          'Engineering, Healthcare & Higher Education',
          'United Arab Emirates',
          'Dubai, UAE',
          'https://www.crescentgulf.ae',
          'Tariq Al-Mansoori',
          'VP of People & Global Mobility',
          demoEmail,
          '+971 50 482 9100',
          'Dhanalakshimi',
          'Active',
          'Executive Search, International Consulting, College Admission Assistance, Visa Assistance',
          'Registered Enterprise Client Portal Account'
        ]
      );
    }

    // Seed 3 real service enquiries in `leads` linked to this demo client
    const sampleEnquiries = [
      {
        id: 'LEAD-CLI-101',
        referenceNumber: 'REV-EXEC-2026-84102',
        serviceId: 'exec-search',
        serviceTitle: 'Executive Search',
        status: 'Candidates Shared',
        progressStep: 4,
        progressPercent: 55,
        workflowType: 'recruitment',
        assignedEmployee: 'Rajesh Menon',
        priority: 'High',
        nextAction: 'Review 3 shortlisted VP Engineering candidate dossiers and confirm interview panel dates.',
        countryInterest: 'United Arab Emirates',
        jobTitle: 'VP of Civil Infrastructure & PMO',
        message: 'Executive search mandate for VP of Civil Infrastructure in Dubai HQ. 15+ years GCC mega-project experience required.'
      },
      {
        id: 'LEAD-CLI-102',
        referenceNumber: 'REV-CADM-2026-59214',
        serviceId: 'college-adm',
        serviceTitle: 'College Admission Assistance',
        status: 'Application Preparation',
        progressStep: 4,
        progressPercent: 52,
        workflowType: 'college_admissions',
        assignedEmployee: 'Dhanalakshimi',
        priority: 'High',
        nextAction: 'Upload Class 12 Predicted Grade Sheet and Statement of Purpose (SOP) draft for UK Russell Group applications.',
        countryInterest: 'United Kingdom',
        degreeLevel: 'B.Sc. Computer Science & AI',
        intakeTerm: 'Fall 2026 Intake',
        message: 'Sponsored dependent scholarship & undergraduate admission assistance for UK & UAE universities.'
      },
      {
        id: 'LEAD-CLI-103',
        referenceNumber: 'REV-VISA-2026-33910',
        serviceId: 'visa-assist',
        serviceTitle: 'Visa Assistance',
        status: 'Document Collection',
        progressStep: 3,
        progressPercent: 52,
        workflowType: 'visa_permits',
        assignedEmployee: 'Omar Al-Hashemi',
        priority: 'Medium',
        nextAction: 'Provide attested degree certificate copy for MOHRE Employment Entry Permit filing.',
        countryInterest: 'United Arab Emirates',
        visaCategory: 'MOHRE Skilled Executive Work Permit',
        message: 'Executive work permit, medical fitness scheduling, and Emirates ID processing for incoming Project Director.'
      }
    ];

    for (const enq of sampleEnquiries) {
      const checkLead = await db.get('SELECT id FROM leads WHERE id = ?', [enq.id]);
      if (!checkLead) {
        await db.run(
          `INSERT INTO leads (
            id, clientId, name, email, company, phone, message,
            serviceId, serviceTitle, referenceNumber, countryInterest,
            degreeLevel, intakeTerm, jobTitle, visaCategory,
            organizationId, organizationName, priority, status,
            assignedEmployee, nextAction, progressStep, progressPercent, workflowType
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            enq.id,
            clientId,
            'Tariq Al-Mansoori',
            demoEmail,
            'Crescent Gulf Holdings & Advisory LLC',
            '+971 50 482 9100',
            enq.message,
            enq.serviceId,
            enq.serviceTitle,
            enq.referenceNumber,
            enq.countryInterest,
            enq.degreeLevel || null,
            enq.intakeTerm || null,
            enq.jobTitle || null,
            enq.visaCategory || null,
            orgId,
            'Crescent Gulf Holdings & Advisory LLC',
            enq.priority,
            enq.status,
            enq.assignedEmployee,
            enq.nextAction,
            enq.progressStep,
            enq.progressPercent,
            enq.workflowType
          ]
        );

        await db.run(
          `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `ACT-${enq.id}-1`,
            enq.id,
            orgId,
            'Status Update',
            `${enq.serviceTitle} advanced to "${enq.status}"`,
            enq.nextAction,
            enq.assignedEmployee
          ]
        );
      }
    }

    // Seed sample document requests & verified documents in client_documents
    const sampleDocs = [
      {
        id: 'DOC-CLI-201',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-101',
        serviceId: 'exec-search',
        serviceTitle: 'Executive Search',
        documentName: 'Corporate Trade License & Establishment Card',
        documentCategory: 'Corporate Compliance',
        fileName: 'Crescent_Gulf_Trade_License_2026.pdf',
        filePath: '/api/client-portal/documents/DOC-CLI-201/download',
        fileType: 'application/pdf',
        fileSize: 245800,
        uploadedBy: 'Client',
        verificationStatus: 'Verified',
        rejectionReason: null,
        requestedBy: 'Rajesh Menon',
        notes: 'Verified against Dubai DED registry.'
      },
      {
        id: 'DOC-CLI-202',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-102',
        serviceId: 'college-adm',
        serviceTitle: 'College Admission Assistance',
        documentName: 'Class 12 Predicted Grades & Academic Transcript',
        documentCategory: 'Academic Transcripts',
        fileName: null,
        filePath: null,
        fileType: null,
        fileSize: 0,
        uploadedBy: 'Staff',
        verificationStatus: 'Requested',
        rejectionReason: null,
        requestedBy: 'Dhanalakshimi',
        notes: 'Required by University Admissions Desk to finalize UCAS & direct portal submissions.'
      },
      {
        id: 'DOC-CLI-203',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-103',
        serviceId: 'visa-assist',
        serviceTitle: 'Visa Assistance',
        documentName: 'Attested Bachelor Degree Certificate Copy',
        documentCategory: 'Visa & Immigration',
        fileName: 'Unattested_Degree_Scan.jpg',
        filePath: '/api/client-portal/documents/DOC-CLI-203/download',
        fileType: 'image/jpeg',
        fileSize: 184200,
        uploadedBy: 'Client',
        verificationStatus: 'Rejected',
        rejectionReason: 'The uploaded scan does not show the UAE Embassy / MOFA attestation stamp on the reverse page. Please upload both front and back pages.',
        requestedBy: 'Omar Al-Hashemi',
        notes: 'MOFA attestation stamp required for MOHRE Skill Level 1 permit.'
      }
    ];

    for (const doc of sampleDocs) {
      const checkDoc = await db.get('SELECT id FROM client_documents WHERE id = ?', [doc.id]);
      if (!checkDoc) {
        await db.run(
          `INSERT INTO client_documents (
            id, clientId, clientEmail, enquiryId, serviceId, serviceTitle,
            documentName, documentCategory, fileName, filePath, fileType, fileSize,
            uploadedBy, verificationStatus, rejectionReason, requestedBy, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            doc.id, doc.clientId, doc.clientEmail, doc.enquiryId, doc.serviceId, doc.serviceTitle,
            doc.documentName, doc.documentCategory, doc.fileName, doc.filePath, doc.fileType, doc.fileSize,
            doc.uploadedBy, doc.verificationStatus, doc.rejectionReason, doc.requestedBy, doc.notes
          ]
        );
      }
    }

    // Seed upcoming & completed appointments in client_appointments
    const tomorrowDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];

    const sampleAppointments = [
      {
        id: 'APT-CLI-301',
        clientId,
        clientName: 'Tariq Al-Mansoori',
        clientEmail: demoEmail,
        clientPhone: '+971 50 482 9100',
        enquiryId: 'LEAD-CLI-101',
        serviceId: 'exec-search',
        serviceTitle: 'Executive Search',
        consultantName: 'Rajesh Menon',
        consultantRole: 'Principal Executive Search Partner',
        appointmentDate: tomorrowDate,
        appointmentTime: 'Morning (10:00 AM - 11:00 AM)',
        consultationMode: 'Online Video (Google Meet / Zoom)',
        meetingLink: 'https://meet.google.com/rev-exec-panel',
        location: 'Google Meet Virtual Boardroom',
        status: 'Scheduled',
        notes: 'Shortlisted VP Engineering Candidate Dossier Walkthrough & Panel Calibration.'
      },
      {
        id: 'APT-CLI-302',
        clientId,
        clientName: 'Tariq Al-Mansoori',
        clientEmail: demoEmail,
        clientPhone: '+971 50 482 9100',
        enquiryId: 'LEAD-CLI-102',
        serviceId: 'college-adm',
        serviceTitle: 'College Admission Assistance',
        consultantName: 'Dhanalakshimi',
        consultantRole: 'Senior Global Education Advisor',
        appointmentDate: pastDate,
        appointmentTime: 'Afternoon (02:00 PM - 03:00 PM)',
        consultationMode: 'Online Video (Google Meet / Zoom)',
        meetingLink: 'https://meet.google.com/rev-adm-desk',
        location: 'Virtual Advisory Session',
        status: 'Completed',
        notes: 'Completed initial eligibility assessment and finalized 5 target universities.'
      }
    ];

    for (const apt of sampleAppointments) {
      const checkApt = await db.get('SELECT id FROM client_appointments WHERE id = ?', [apt.id]);
      if (!checkApt) {
        await db.run(
          `INSERT INTO client_appointments (
            id, clientId, clientName, clientEmail, clientPhone, enquiryId,
            serviceId, serviceTitle, consultantName, consultantRole,
            appointmentDate, appointmentTime, consultationMode, meetingLink, location, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            apt.id, apt.clientId, apt.clientName, apt.clientEmail, apt.clientPhone, apt.enquiryId,
            apt.serviceId, apt.serviceTitle, apt.consultantName, apt.consultantRole,
            apt.appointmentDate, apt.appointmentTime, apt.consultationMode, apt.meetingLink, apt.location, apt.status, apt.notes
          ]
        );
      }
    }

    // Seed communication messages in client_messages
    const sampleMessages = [
      {
        id: 'MSG-CLI-401',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-101',
        serviceTitle: 'Executive Search',
        senderRole: 'Consultant',
        senderName: 'Rajesh Menon (Principal Executive Search Partner)',
        message: 'Good morning Tariq. We have completed competency and background pre-screening for 3 VP of Civil Infrastructure candidates with 15+ years of UAE/KSA rail and high-rise experience. Their executive dossiers are ready for your review prior to our upcoming calibration call.',
        isRead: 0
      },
      {
        id: 'MSG-CLI-402',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-102',
        serviceTitle: 'College Admission Assistance',
        senderRole: 'Consultant',
        senderName: 'Dhanalakshimi (Admissions Workflow Specialist)',
        message: 'Hello! The university shortlist for B.Sc. Computer Science has been updated to stage 4 (Application Preparation). Kindly upload the Class 12 Predicted Grades in the My Documents section so we can complete the portal verification.',
        isRead: 0
      }
    ];

    for (const msg of sampleMessages) {
      const checkMsg = await db.get('SELECT id FROM client_messages WHERE id = ?', [msg.id]);
      if (!checkMsg) {
        await db.run(
          `INSERT INTO client_messages (
            id, clientId, clientEmail, enquiryId, serviceTitle, senderRole, senderName, message, isRead
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            msg.id, msg.clientId, msg.clientEmail, msg.enquiryId, msg.serviceTitle,
            msg.senderRole, msg.senderName, msg.message, msg.isRead
          ]
        );
      }
    }

    // Seed notifications in client_notifications
    const sampleNotifs = [
      {
        id: 'NOTIF-CLI-501',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-101',
        type: 'status_update',
        title: 'Executive Search Advanced to "Candidates Shared"',
        message: 'Rajesh Menon updated your Executive Search mandate (#REV-EXEC-2026-84102) to Stage 4: Candidates Shared.',
        isRead: 0
      },
      {
        id: 'NOTIF-CLI-502',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-102',
        type: 'document_request',
        title: 'Document Required: Class 12 Predicted Grades',
        message: 'Dhanalakshimi requested "Class 12 Predicted Grades & Academic Transcript" for College Admission Assistance.',
        isRead: 0
      },
      {
        id: 'NOTIF-CLI-503',
        clientId,
        clientEmail: demoEmail,
        enquiryId: 'LEAD-CLI-103',
        type: 'document_verified',
        title: 'Action Required: Attested Degree Scan Replacement',
        message: 'Omar Al-Hashemi noted that your degree scan requires the reverse MOFA attestation page for Visa Assistance.',
        isRead: 0
      }
    ];

    for (const nf of sampleNotifs) {
      const checkNf = await db.get('SELECT id FROM client_notifications WHERE id = ?', [nf.id]);
      if (!checkNf) {
        await db.run(
          `INSERT INTO client_notifications (
            id, clientId, clientEmail, enquiryId, type, title, message, isRead
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [nf.id, nf.clientId, nf.clientEmail, nf.enquiryId, nf.type, nf.title, nf.message, nf.isRead]
        );
      }
    }

    // Seed real invoice linked to the existing PaymentGateway workflow
    const checkInv = await db.get('SELECT id FROM client_invoices WHERE id = ?', ['INV-CLI-2026-901']);
    if (!checkInv) {
      await db.run(
        `INSERT INTO client_invoices (
          id, clientId, clientEmail, enquiryId, serviceTitle, amount, currency, status, dueDate, paidAt, paymentMethod, receiptNumber, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'INV-CLI-2026-901',
          clientId,
          demoEmail,
          'LEAD-CLI-101',
          'Executive Search — Retainer Tranche 1 (VP Civil Infrastructure)',
          12500,
          'AED',
          'Paid',
          pastDate,
          pastDate,
          'Corporate Wire / Stripe Gateway',
          'RCPT-REV-2026-7741',
          'Initial executive search retainer fee settled.'
        ]
      );
      await db.run(
        `INSERT INTO client_invoices (
          id, clientId, clientEmail, enquiryId, serviceTitle, amount, currency, status, dueDate, paidAt, paymentMethod, receiptNumber, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'INV-CLI-2026-902',
          clientId,
          demoEmail,
          'LEAD-CLI-103',
          'Visa Assistance & MOHRE Permit Processing',
          3850,
          'AED',
          'Pending',
          tomorrowDate,
          null,
          null,
          null,
          'Statutory MOHRE permit, medical fitness & Emirates ID processing fee.'
        ]
      );
    }

    existing = await db.get('SELECT * FROM client_accounts WHERE id = ?', [clientId]);
  }

  return existing;
};

/**
 * Middleware: Authenticate Client Portal Requests & Enforce Strict Client Data Isolation
 */
const requireClientAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : (req.headers['x-client-token'] || req.query.token || '');

    const decoded = verifyClientSessionToken(token);
    if (!decoded || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to your Client Portal account.'
      });
    }

    const db = await getDb();
    let client = await db.get(
      'SELECT * FROM client_accounts WHERE id = ? OR LOWER(TRIM(email)) = ?',
      [decoded.id, decoded.email.trim().toLowerCase()]
    );

    if (!client && decoded.email.trim().toLowerCase() === 'client@therevivalinternational.com') {
      client = await ensureDemoClientAccount(db);
    }

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Client session expired or account not found. Please sign in again.'
      });
    }

    req.clientUser = client;
    next();
  } catch (err) {
    console.error('Client auth error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication check failed.' });
  }
};

export const registerClientPortalRoutes = (app, uploadsDir) => {
  // ============================================================================
  // 1. CLIENT AUTHENTICATION & REGISTRATION
  // ============================================================================

  app.post('/api/client-portal/auth/register', async (req, res) => {
    try {
      const {
        clientType = 'Individual',
        name,
        email,
        password,
        phone,
        companyName,
        companyRegNumber,
        industry,
        designation,
        country = 'United Arab Emirates',
        city = '',
        website = ''
      } = req.body || {};

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Full name is required (minimum 2 characters).' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(String(email).trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }
      if (clientType === 'Corporate' && (!companyName || String(companyName).trim().length < 2)) {
        return res.status(400).json({ success: false, message: 'Company name is required for Corporate Client registration.' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const db = await getDb();

      const existing = await db.get(
        'SELECT id FROM client_accounts WHERE LOWER(TRIM(email)) = ?',
        [cleanEmail]
      );
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address is already registered. Please sign in instead.'
        });
      }

      const clientId = `CLI-ACC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const passHash = hashPassword(password);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      let organizationId = null;

      // If Corporate client, link or create organization in `clients`
      if (clientType === 'Corporate' && companyName) {
        const cleanCompany = companyName.trim();
        const existingOrg = await db.get(
          'SELECT id FROM clients WHERE LOWER(TRIM(company)) = LOWER(TRIM(?))',
          [cleanCompany]
        );
        if (existingOrg) {
          organizationId = existingOrg.id;
        } else {
          organizationId = `ORG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
          await db.run(
            `INSERT INTO clients (
              id, company, organizationType, industry, country, location, website,
              contactPerson, designation, email, phone, assignedEmployee, status, associatedServices, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              organizationId,
              cleanCompany,
              'Company',
              industry || 'Corporate Enterprise',
              country,
              city ? `${city}, ${country}` : country,
              website || null,
              name.trim(),
              designation || 'Authorized Representative',
              cleanEmail,
              phone ? phone.trim() : null,
              'Dhanalakshimi',
              'Active',
              'Client Portal Member',
              companyRegNumber ? `Reg No: ${companyRegNumber}` : 'Registered via Client Portal'
            ]
          );
        }
      }

      await db.run(
        `INSERT INTO client_accounts (
          id, clientType, name, email, passwordHash, phone,
          companyName, companyRegNumber, industry, designation,
          country, city, website, emailVerified, verificationCode,
          assignedConsultant, organizationId, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          clientType === 'Corporate' ? 'Corporate' : 'Individual',
          name.trim(),
          cleanEmail,
          passHash,
          phone ? phone.trim() : '',
          companyName ? companyName.trim() : '',
          companyRegNumber ? companyRegNumber.trim() : '',
          industry ? industry.trim() : '',
          designation ? designation.trim() : '',
          country,
          city ? city.trim() : '',
          website ? website.trim() : '',
          1,
          verificationCode,
          'Dhanalakshimi',
          organizationId,
          'Active'
        ]
      );

      const createdClient = await db.get('SELECT * FROM client_accounts WHERE id = ?', [clientId]);

      // Automatically link any existing enquiries submitted on the website with the same email
      await syncClientLeadsByEmail(db, createdClient);

      // Create welcome notification & advisor welcome message
      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, type, title, message, isRead)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-1`,
          clientId,
          cleanEmail,
          'announcement',
          'Welcome to The Revival International Client Portal',
          `Welcome ${name.trim()}! Your dedicated advisor Dhanalakshimi has been assigned to assist you across all requested services.`
        ]
      );

      await db.run(
        `INSERT INTO client_messages (id, clientId, clientEmail, serviceTitle, senderRole, senderName, message, isRead)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          `MSG-${Date.now()}-1`,
          clientId,
          cleanEmail,
          'General Advisory Desk',
          'Consultant',
          'Dhanalakshimi (Senior Global Advisor)',
          `Hello ${name.trim()}, welcome to your Client Portal! Here you can track your service requests in real time, upload required documents, schedule consultations, and message our advisory team directly.`
        ]
      );

      const token = createClientSessionToken(createdClient);
      res.status(201).json({
        success: true,
        message: 'Client account registered successfully.',
        token,
        client: sanitizeClientAccount(createdClient)
      });
    } catch (err) {
      console.error('Client registration error:', err);
      res.status(500).json({ success: false, message: 'Failed to register client account.' });
    }
  });

  app.post('/api/client-portal/auth/login', async (req, res) => {
    try {
      const { email, password, isDemo } = req.body || {};
      const db = await getDb();

      if (isDemo || (email && String(email).trim().toLowerCase() === 'client@therevivalinternational.com')) {
        const demoClient = await ensureDemoClientAccount(db);
        await syncClientLeadsByEmail(db, demoClient);
        const token = createClientSessionToken(demoClient);
        return res.json({
          success: true,
          message: 'Signed in to Client Portal successfully.',
          token,
          client: sanitizeClientAccount(demoClient)
        });
      }

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const client = await db.get(
        'SELECT * FROM client_accounts WHERE LOWER(TRIM(email)) = ?',
        [cleanEmail]
      );

      if (!client || !verifyPassword(password, client.passwordHash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials or register a new Client account.'
        });
      }

      await syncClientLeadsByEmail(db, client);
      const token = createClientSessionToken(client);

      res.json({
        success: true,
        message: 'Signed in successfully.',
        token,
        client: sanitizeClientAccount(client)
      });
    } catch (err) {
      console.error('Client login error:', err);
      res.status(500).json({ success: false, message: 'Unable to sign in at this moment.' });
    }
  });

  app.post('/api/client-portal/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
      }
      const cleanEmail = String(email).trim().toLowerCase();
      const db = await getDb();
      const client = await db.get('SELECT * FROM client_accounts WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);
      if (!client) {
        return res.status(404).json({ success: false, message: 'No registered client account found with that email address.' });
      }
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000;
      await db.run(
        'UPDATE client_accounts SET resetToken = ?, resetTokenExpires = ? WHERE id = ?',
        [resetCode, expires, client.id]
      );
      res.json({
        success: true,
        message: 'Password reset verification code generated.',
        verificationHint: process.env.NODE_ENV !== 'production' ? resetCode : resetCode
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to initiate password reset.' });
    }
  });

  app.post('/api/client-portal/auth/reset-password', async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body || {};
      if (!email || !resetCode || !newPassword || String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Email, 6-digit verification code, and a new password (min 6 chars) are required.'
        });
      }
      const cleanEmail = String(email).trim().toLowerCase();
      const db = await getDb();
      const client = await db.get('SELECT * FROM client_accounts WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);
      if (!client || client.resetToken !== String(resetCode).trim()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset verification code.' });
      }
      const newHash = hashPassword(newPassword);
      await db.run(
        'UPDATE client_accounts SET passwordHash = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?',
        [newHash, client.id]
      );
      res.json({ success: true, message: 'Password has been reset successfully. You can now sign in.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
  });

  // ============================================================================
  // 2. CLIENT PROFILE & SETTINGS
  // ============================================================================

  app.get('/api/client-portal/profile', requireClientAuth, async (req, res) => {
    res.json({
      success: true,
      client: sanitizeClientAccount(req.clientUser)
    });
  });

  app.put('/api/client-portal/profile', requireClientAuth, async (req, res) => {
    try {
      const {
        name,
        phone,
        clientType,
        companyName,
        companyRegNumber,
        industry,
        designation,
        country,
        city,
        address,
        website,
        avatarUrl,
        notificationPrefs
      } = req.body || {};

      const db = await getDb();
      const cid = req.clientUser.id;
      const prefsStr = notificationPrefs
        ? JSON.stringify(notificationPrefs)
        : req.clientUser.notificationPrefs;

      await db.run(
        `UPDATE client_accounts SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          clientType = COALESCE(?, clientType),
          companyName = COALESCE(?, companyName),
          companyRegNumber = COALESCE(?, companyRegNumber),
          industry = COALESCE(?, industry),
          designation = COALESCE(?, designation),
          country = COALESCE(?, country),
          city = COALESCE(?, city),
          address = COALESCE(?, address),
          website = COALESCE(?, website),
          avatarUrl = COALESCE(?, avatarUrl),
          notificationPrefs = COALESCE(?, notificationPrefs),
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          name ? name.trim() : null,
          phone !== undefined ? phone.trim() : null,
          clientType || null,
          companyName !== undefined ? companyName.trim() : null,
          companyRegNumber !== undefined ? companyRegNumber.trim() : null,
          industry !== undefined ? industry.trim() : null,
          designation !== undefined ? designation.trim() : null,
          country || null,
          city !== undefined ? city.trim() : null,
          address !== undefined ? address.trim() : null,
          website !== undefined ? website.trim() : null,
          avatarUrl !== undefined ? avatarUrl : null,
          prefsStr || null,
          cid
        ]
      );

      // Sync with CRM `clients` table if linked
      if (req.clientUser.organizationId && companyName) {
        await db.run(
          `UPDATE clients SET
            company = COALESCE(?, company),
            industry = COALESCE(?, industry),
            country = COALESCE(?, country),
            website = COALESCE(?, website),
            contactPerson = COALESCE(?, contactPerson),
            designation = COALESCE(?, designation),
            phone = COALESCE(?, phone),
            updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            companyName.trim(),
            industry || null,
            country || null,
            website || null,
            name ? name.trim() : null,
            designation || null,
            phone || null,
            req.clientUser.organizationId
          ]
        );
      }

      const updated = await db.get('SELECT * FROM client_accounts WHERE id = ?', [cid]);
      res.json({
        success: true,
        message: 'Client profile updated successfully.',
        client: sanitizeClientAccount(updated)
      });
    } catch (err) {
      console.error('Update client profile error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  });

  app.post('/api/client-portal/auth/change-password', requireClientAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      if (!currentPassword || !newPassword || String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Current password and a new password (minimum 6 characters) are required.'
        });
      }
      if (!verifyPassword(currentPassword, req.clientUser.passwordHash)) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      const db = await getDb();
      const newHash = hashPassword(newPassword);
      await db.run(
        'UPDATE client_accounts SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [newHash, req.clientUser.id]
      );
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
  });

  // ============================================================================
  // 3. CLIENT DASHBOARD OVERVIEW & LIVE DATABASE METRICS
  // ============================================================================

  const getClientEnquiriesEnriched = async (db, client) => {
    await syncClientLeadsByEmail(db, client);
    const cleanEmail = client.email.trim().toLowerCase();
    const rawLeads = await db.all(
      'SELECT * FROM leads WHERE (clientId = ? OR LOWER(TRIM(email)) = ?) AND (isArchived IS NULL OR isArchived = 0) ORDER BY createdAt DESC',
      [client.id, cleanEmail]
    );

    const enriched = [];
    for (const lead of rawLeads) {
      const wf = getWorkflowForService(lead.serviceId || lead.serviceTitle, lead.status, lead.progressStep);
      const activities = await db.all(
        'SELECT * FROM enquiry_activities WHERE enquiryId = ? ORDER BY createdAt DESC',
        [lead.id]
      );
      const docs = await db.all(
        'SELECT * FROM client_documents WHERE enquiryId = ? ORDER BY createdAt DESC',
        [lead.id]
      );
      const appointments = await db.all(
        'SELECT * FROM client_appointments WHERE enquiryId = ? ORDER BY appointmentDate DESC',
        [lead.id]
      );
      const messages = await db.all(
        'SELECT * FROM client_messages WHERE enquiryId = ? ORDER BY createdAt ASC',
        [lead.id]
      );

      enriched.push({
        ...lead,
        referenceNumber: lead.referenceNumber || lead.id,
        serviceId: wf.catalogItem.id,
        serviceTitle: lead.serviceTitle || wf.catalogItem.title,
        serviceGroup: wf.catalogItem.group,
        serviceCategory: wf.catalogItem.category,
        assignedEmployee: lead.assignedEmployee || wf.catalogItem.defaultConsultant.split(' (')[0] || 'Dhanalakshimi',
        assignedConsultantFull: wf.catalogItem.defaultConsultant,
        workflowType: wf.workflowType,
        workflowLabel: wf.workflowLabel,
        stages: wf.stages,
        activeStep: wf.activeStep,
        totalSteps: wf.totalSteps,
        currentStageLabel: wf.currentStageLabel,
        currentStageDescription: wf.currentStageDescription,
        progressPercent: lead.progressPercent || wf.progressPercent,
        nextAction: lead.nextAction || `Next Step: ${wf.nextStepLabel}`,
        requiredDocumentsTemplate: wf.catalogItem.requiredDocuments || [],
        activities,
        documents: docs,
        appointments,
        messages
      });
    }
    return enriched;
  };

  app.get('/api/client-portal/overview', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const cleanEmail = client.email.trim().toLowerCase();

      const enquiries = await getClientEnquiriesEnriched(db, client);
      const documents = await db.all(
        'SELECT * FROM client_documents WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC',
        [client.id, cleanEmail]
      );
      const appointments = await db.all(
        'SELECT * FROM client_appointments WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY appointmentDate ASC',
        [client.id, cleanEmail]
      );
      const notifications = await db.all(
        'SELECT * FROM client_notifications WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC LIMIT 30',
        [client.id, cleanEmail]
      );
      const messages = await db.all(
        'SELECT * FROM client_messages WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC LIMIT 30',
        [client.id, cleanEmail]
      );

      const completedStatuses = ['completed', 'admission confirmed', 'converted', 'decision / completed'];
      const completedServices = enquiries.filter(
        e =>
          completedStatuses.includes(String(e.status || '').toLowerCase()) ||
          e.activeStep === e.totalSteps
      ).length;

      const activeServices = enquiries.filter(
        e =>
          !completedStatuses.includes(String(e.status || '').toLowerCase()) &&
          !String(e.status || '').toLowerCase().includes('closed') &&
          e.activeStep < e.totalSteps
      ).length;

      const pendingDocs = documents.filter(
        d => d.verificationStatus === 'Requested' || d.verificationStatus === 'Rejected'
      );

      const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled');

      const pendingActions =
        pendingDocs.length +
        enquiries.filter(e => e.nextAction && e.activeStep < e.totalSteps).length;

      // Aggregate recent activities across all client enquiries
      const recentActivity = [];
      enquiries.forEach(enq => {
        (enq.activities || []).forEach(act => {
          recentActivity.push({
            ...act,
            serviceTitle: enq.serviceTitle,
            referenceNumber: enq.referenceNumber
          });
        });
      });
      recentActivity.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      res.json({
        success: true,
        stats: {
          totalEnquiries: enquiries.length,
          activeServices,
          pendingActions,
          documentsRequired: pendingDocs.length,
          appointmentsScheduled: upcomingAppointments.length,
          completedServices
        },
        recentActivity: recentActivity.slice(0, 10),
        latestServiceUpdates: enquiries.slice(0, 5),
        pendingDocumentRequests: pendingDocs,
        upcomingAppointments,
        unreadNotificationsCount: notifications.filter(n => !n.isRead).length,
        unreadMessagesCount: messages.filter(m => !m.isRead && m.senderRole !== 'Client').length
      });
    } catch (err) {
      console.error('Client overview error:', err);
      res.status(500).json({ success: false, message: 'Failed to load dashboard overview.' });
    }
  });

  // ============================================================================
  // 4. MY SERVICES & SERVICE TRACKING SYSTEM
  // ============================================================================

  app.get('/api/client-portal/services', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const enquiries = await getClientEnquiriesEnriched(db, req.clientUser);
      res.json({
        success: true,
        data: enquiries,
        catalog: CLIENT_PORTAL_SERVICES_CATALOG
      });
    } catch (err) {
      console.error('Fetch client services error:', err);
      res.status(500).json({ success: false, message: 'Failed to load client services.' });
    }
  });

  app.get('/api/client-portal/services/:enquiryId', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const enquiries = await getClientEnquiriesEnriched(db, req.clientUser);
      const found = enquiries.find(
        e => e.id === req.params.enquiryId || e.referenceNumber === req.params.enquiryId
      );
      if (!found) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found or access denied.'
        });
      }
      res.json({ success: true, data: found });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to load service details.' });
    }
  });

  app.post('/api/client-portal/services', requireClientAuth, async (req, res) => {
    try {
      const {
        serviceId,
        countryInterest = 'United Arab Emirates',
        degreeLevel = '',
        intakeTerm = '',
        jobTitle = '',
        vacancies = '1',
        budgetRange = '',
        preferredDate = '',
        preferredTime = '',
        consultationMode = 'Online Video (Google Meet / Zoom)',
        message = ''
      } = req.body || {};

      if (!serviceId) {
        return res.status(400).json({ success: false, message: 'Please select a service.' });
      }
      if (!message || String(message).trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your service requirements (minimum 10 characters).'
        });
      }

      const db = await getDb();
      const client = req.clientUser;
      const catalogItem = getServiceCatalogItem(serviceId);
      const wf = getWorkflowForService(catalogItem.id, 'Enquiry Received', 1);

      const leadId = `LEAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const refCode = `REV-${catalogItem.id.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const consultantName = catalogItem.defaultConsultant.split(' (')[0] || 'Dhanalakshimi';

      await db.run(
        `INSERT INTO leads (
          id, clientId, name, email, company, phone, message,
          serviceId, serviceTitle, referenceNumber, countryInterest,
          degreeLevel, intakeTerm, jobTitle, vacancies, salaryRange,
          organizationId, organizationName, priority, status,
          assignedEmployee, nextAction, progressStep, progressPercent, workflowType,
          consultationDate, consultationTime, consultationMode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leadId,
          client.id,
          client.name,
          client.email.trim().toLowerCase(),
          client.companyName || (client.clientType === 'Corporate' ? 'Corporate Client' : 'Individual Client'),
          client.phone || '',
          message.trim(),
          catalogItem.id,
          catalogItem.title,
          refCode,
          countryInterest,
          degreeLevel || null,
          intakeTerm || null,
          jobTitle || null,
          vacancies || null,
          budgetRange || null,
          client.organizationId || null,
          client.companyName || client.name,
          'High',
          'Enquiry Received',
          consultantName,
          `Initial requirement review by ${consultantName} and document checklist verification.`,
          1,
          wf.progressPercent,
          wf.workflowType,
          preferredDate || null,
          preferredTime || null,
          consultationMode || null
        ]
      );

      // Log audit activity
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          leadId,
          client.organizationId || null,
          'Inquiry Received',
          `New Service Request Logged from Client Portal (${refCode})`,
          `Client ${client.name} requested ${catalogItem.title}. Assigned to ${consultantName}.`,
          client.name
        ]
      );

      // Create standard initial document request from the service's requiredDocuments template
      if (Array.isArray(catalogItem.requiredDocuments) && catalogItem.requiredDocuments.length > 0) {
        const firstDoc = catalogItem.requiredDocuments[0];
        await db.run(
          `INSERT INTO client_documents (
            id, clientId, clientEmail, enquiryId, serviceId, serviceTitle,
            documentName, documentCategory, uploadedBy, verificationStatus, requestedBy, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Staff', 'Requested', ?, ?)`,
          [
            `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            client.id,
            client.email.trim().toLowerCase(),
            leadId,
            catalogItem.id,
            catalogItem.title,
            firstDoc,
            catalogItem.category,
            consultantName,
            `Standard prerequisite document for ${catalogItem.title} (${refCode}).`
          ]
        );
      }

      // If preferred appointment date was provided, create appointment
      if (preferredDate) {
        await db.run(
          `INSERT INTO client_appointments (
            id, clientId, clientName, clientEmail, clientPhone, enquiryId,
            serviceId, serviceTitle, consultantName, consultantRole,
            appointmentDate, appointmentTime, consultationMode, meetingLink, location, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
          [
            `APT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            client.id,
            client.name,
            client.email.trim().toLowerCase(),
            client.phone || '',
            leadId,
            catalogItem.id,
            catalogItem.title,
            consultantName,
            catalogItem.defaultConsultant,
            preferredDate,
            preferredTime || 'Morning (10:00 AM - 11:00 AM)',
            consultationMode,
            'https://meet.google.com/rev-intl-advisory',
            consultationMode.includes('Office') ? 'Dubai HQ, Business Bay' : 'Virtual Advisory Room',
            `Initial consultation for ${catalogItem.title} (#${refCode})`
          ]
        );
      }

      // Create notification
      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, 'status_update', ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          client.id,
          client.email.trim().toLowerCase(),
          leadId,
          `Service Request Registered: ${catalogItem.title}`,
          `Your request #${refCode} has been assigned to ${catalogItem.defaultConsultant}.`
        ]
      );

      const enriched = await getClientEnquiriesEnriched(db, client);
      const createdEnquiry = enriched.find(e => e.id === leadId);

      res.status(201).json({
        success: true,
        message: 'Service enquiry submitted and linked to your Client Dashboard.',
        data: createdEnquiry
      });
    } catch (err) {
      console.error('Create client service error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit service request.' });
    }
  });

  // ============================================================================
  // 5. DOCUMENT MANAGEMENT (UPLOAD, DOWNLOAD, VERIFICATION STATUS)
  // ============================================================================

  app.get('/api/client-portal/documents', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const docs = await db.all(
        'SELECT * FROM client_documents WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC',
        [client.id, client.email.trim().toLowerCase()]
      );
      res.json({ success: true, data: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to load documents.' });
    }
  });

  app.post('/api/client-portal/documents/upload', requireClientAuth, async (req, res) => {
    try {
      const {
        documentId, // optional if fulfilling a 'Requested' or 'Rejected' document slot
        enquiryId,
        serviceId,
        serviceTitle,
        documentName,
        documentCategory = 'Supporting Document',
        fileName,
        fileData,
        fileType,
        notes = ''
      } = req.body || {};

      if (!fileName || !fileData) {
        return res.status(400).json({ success: false, message: 'File name and file content are required.' });
      }
      if (!documentName || String(documentName).trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Document title is required.' });
      }

      const ext = path.extname(fileName || '').toLowerCase();
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      if (!allowedExts.includes(ext)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported file type. Permitted formats: PDF, JPG, JPEG, PNG.'
        });
      }

      const cleanBase64 = String(fileData).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 10MB security limit.'
        });
      }

      const safeBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const storedFilename = `clientdoc_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}_${safeBase}`;
      const destinationPath = path.join(uploadsDir, storedFilename);
      try {
        fs.writeFileSync(destinationPath, buffer);
      } catch (writeErr) {
        console.warn('Serverless file write notice:', writeErr.message);
      }

      const db = await getDb();
      const client = req.clientUser;
      const catalogItem = getServiceCatalogItem(serviceId || serviceTitle);
      let finalDocId = documentId;

      if (documentId) {
        const existingDoc = await db.get(
          'SELECT * FROM client_documents WHERE id = ? AND (clientId = ? OR LOWER(TRIM(clientEmail)) = ?)',
          [documentId, client.id, client.email.trim().toLowerCase()]
        );
        if (existingDoc) {
          await db.run(
            `UPDATE client_documents SET
              documentName = COALESCE(?, documentName),
              fileName = ?,
              filePath = ?,
              fileType = ?,
              fileSize = ?,
              uploadedBy = 'Client',
              verificationStatus = 'Pending Verification',
              rejectionReason = NULL,
              notes = COALESCE(?, notes),
              updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              documentName.trim(),
              storedFilename,
              `/api/client-portal/documents/${documentId}/download`,
              fileType || ext.replace('.', 'application/'),
              buffer.length,
              notes || existingDoc.notes,
              documentId
            ]
          );
        } else {
          finalDocId = null;
        }
      }

      if (!finalDocId) {
        finalDocId = `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        await db.run(
          `INSERT INTO client_documents (
            id, clientId, clientEmail, enquiryId, serviceId, serviceTitle,
            documentName, documentCategory, fileName, filePath, fileType, fileSize,
            uploadedBy, verificationStatus, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Client', 'Pending Verification', ?)`,
          [
            finalDocId,
            client.id,
            client.email.trim().toLowerCase(),
            enquiryId || null,
            catalogItem.id,
            serviceTitle || catalogItem.title,
            documentName.trim(),
            documentCategory,
            storedFilename,
            `/api/client-portal/documents/${finalDocId}/download`,
            fileType || 'application/pdf',
            buffer.length,
            notes || 'Uploaded via Client Portal'
          ]
        );
      }

      if (enquiryId) {
        await db.run(
          `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
           VALUES (?, ?, ?, 'Document Uploaded', ?, ?, ?)`,
          [
            `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            enquiryId,
            client.organizationId || null,
            `Client Uploaded Document: ${documentName.trim()}`,
            `File: ${fileName} (${Math.round(buffer.length / 1024)} KB) — Status: Pending Verification.`,
            client.name
          ]
        );
      }

      const savedDoc = await db.get('SELECT * FROM client_documents WHERE id = ?', [finalDocId]);
      res.status(201).json({
        success: true,
        message: 'Document uploaded securely and queued for consultant verification.',
        data: savedDoc
      });
    } catch (err) {
      console.error('Client document upload error:', err);
      res.status(500).json({ success: false, message: 'Failed to upload document.' });
    }
  });

  app.get('/api/client-portal/documents/:docId/download', async (req, res) => {
    try {
      const db = await getDb();
      const doc = await db.get('SELECT * FROM client_documents WHERE id = ?', [req.params.docId]);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document record not found.' });
      }

      if (doc.fileName) {
        const diskPath = path.join(uploadsDir, path.basename(doc.fileName));
        if (fs.existsSync(diskPath)) {
          res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
          return res.sendFile(diskPath);
        }
      }

      // Generate official verification summary PDF/text stream if file was seeded or on ephemeral serverless storage
      const summaryContent = [
        '====================================================================',
        '           THE REVIVAL INTERNATIONAL - OFFICIAL DOCUMENT RECORD     ',
        '====================================================================',
        `Document ID         : ${doc.id}`,
        `Document Name       : ${doc.documentName}`,
        `Category            : ${doc.documentCategory || 'General'}`,
        `Associated Service  : ${doc.serviceTitle || 'Advisory Service'}`,
        `Enquiry Reference   : ${doc.enquiryId || 'N/A'}`,
        `Verification Status : ${doc.verificationStatus}`,
        `Uploaded By         : ${doc.uploadedBy}`,
        `Recorded Timestamp  : ${doc.createdAt}`,
        `Notes               : ${doc.notes || 'Verified in Revival Client Portal'}`,
        '===================================================================='
      ].join('\n');

      const downloadName = (doc.fileName || `${doc.documentName.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`);
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(summaryContent);
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to download document.' });
    }
  });

  app.delete('/api/client-portal/documents/:docId', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const doc = await db.get(
        'SELECT * FROM client_documents WHERE id = ? AND (clientId = ? OR LOWER(TRIM(clientEmail)) = ?)',
        [req.params.docId, client.id, client.email.trim().toLowerCase()]
      );
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }
      if (doc.verificationStatus === 'Verified') {
        return res.status(400).json({
          success: false,
          message: 'Verified compliance documents cannot be deleted without consultant authorization.'
        });
      }
      await db.run('DELETE FROM client_documents WHERE id = ?', [doc.id]);
      res.json({ success: true, message: 'Document removed.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to delete document.' });
    }
  });

  // ============================================================================
  // 6. APPOINTMENTS & CONSULTATIONS (WITH AVAILABILITY & DOUBLE-BOOKING PREVENTION)
  // ============================================================================

  const STANDARD_TIME_SLOTS = [
    'Morning (09:00 AM - 10:00 AM)',
    'Morning (10:00 AM - 11:00 AM)',
    'Late Morning (11:30 AM - 12:30 PM)',
    'Afternoon (02:00 PM - 03:00 PM)',
    'Afternoon (03:30 PM - 04:30 PM)',
    'Evening (05:00 PM - 06:00 PM)'
  ];

  app.get('/api/client-portal/appointments/availability', requireClientAuth, async (req, res) => {
    try {
      const { date, consultantName } = req.query;
      if (!date) {
        return res.json({ success: true, availableSlots: STANDARD_TIME_SLOTS, bookedSlots: [] });
      }
      const db = await getDb();
      const existingApts = await db.all(
        "SELECT appointmentTime, consultantName FROM client_appointments WHERE appointmentDate = ? AND status = 'Scheduled'",
        [date]
      );
      const bookedSlots = existingApts
        .filter(a => !consultantName || a.consultantName === consultantName)
        .map(a => a.appointmentTime);

      const availableSlots = STANDARD_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
      res.json({
        success: true,
        date,
        allSlots: STANDARD_TIME_SLOTS,
        bookedSlots,
        availableSlots
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to check slot availability.' });
    }
  });

  app.get('/api/client-portal/appointments', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const appointments = await db.all(
        'SELECT * FROM client_appointments WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY appointmentDate ASC',
        [client.id, client.email.trim().toLowerCase()]
      );
      res.json({
        success: true,
        data: appointments,
        timeSlots: STANDARD_TIME_SLOTS
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
    }
  });

  app.post('/api/client-portal/appointments', requireClientAuth, async (req, res) => {
    try {
      const {
        enquiryId,
        serviceId,
        serviceTitle,
        appointmentDate,
        appointmentTime,
        consultationMode = 'Online Video (Google Meet / Zoom)',
        notes = ''
      } = req.body || {};

      if (!appointmentDate || !appointmentTime) {
        return res.status(400).json({
          success: false,
          message: 'Please select both a valid appointment date and time slot.'
        });
      }

      const selectedDate = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Appointment date cannot be in the past.'
        });
      }

      const db = await getDb();
      const client = req.clientUser;
      const catalogItem = getServiceCatalogItem(serviceId || serviceTitle);
      const consultantName = catalogItem.defaultConsultant.split(' (')[0] || 'Dhanalakshimi';

      // Prevent double booking for the same consultant, date, and time slot
      const existingSlot = await db.get(
        "SELECT id FROM client_appointments WHERE appointmentDate = ? AND appointmentTime = ? AND consultantName = ? AND status = 'Scheduled'",
        [appointmentDate, appointmentTime, consultantName]
      );
      if (existingSlot) {
        return res.status(409).json({
          success: false,
          message: `This time slot (${appointmentTime} on ${appointmentDate}) is already booked with ${consultantName}. Please choose another available slot.`
        });
      }

      const aptId = `APT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const meetingLink = consultationMode.includes('Video')
        ? `https://meet.google.com/rev-${aptId.toLowerCase().slice(-8)}`
        : null;
      const location = consultationMode.includes('Office')
        ? 'The Revival International HQ — Dubai Business Bay / Chennai India HQ'
        : consultationMode;

      await db.run(
        `INSERT INTO client_appointments (
          id, clientId, clientName, clientEmail, clientPhone, enquiryId,
          serviceId, serviceTitle, consultantName, consultantRole,
          appointmentDate, appointmentTime, consultationMode, meetingLink, location, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
        [
          aptId,
          client.id,
          client.name,
          client.email.trim().toLowerCase(),
          client.phone || '',
          enquiryId || null,
          catalogItem.id,
          serviceTitle || catalogItem.title,
          consultantName,
          catalogItem.defaultConsultant,
          appointmentDate,
          appointmentTime,
          consultationMode,
          meetingLink,
          location,
          notes || 'Scheduled via Client Portal'
        ]
      );

      // Create confirmation notification
      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, 'appointment', ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          client.id,
          client.email.trim().toLowerCase(),
          enquiryId || null,
          `Appointment Confirmed: ${appointmentDate}`,
          `Your ${consultationMode} with ${consultantName} for ${serviceTitle || catalogItem.title} is confirmed for ${appointmentDate} (${appointmentTime}).`
        ]
      );

      if (enquiryId) {
        await db.run(
          `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
           VALUES (?, ?, ?, 'Consultation Booked', ?, ?, ?)`,
          [
            `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            enquiryId,
            client.organizationId || null,
            `Consultation Scheduled for ${appointmentDate} (${appointmentTime})`,
            `Mode: ${consultationMode} with ${consultantName}.`,
            client.name
          ]
        );
      }

      const createdApt = await db.get('SELECT * FROM client_appointments WHERE id = ?', [aptId]);
      res.status(201).json({
        success: true,
        message: 'Consultation appointment confirmed.',
        data: createdApt
      });
    } catch (err) {
      console.error('Book appointment error:', err);
      res.status(500).json({ success: false, message: 'Failed to schedule appointment.' });
    }
  });

  app.patch('/api/client-portal/appointments/:id', requireClientAuth, async (req, res) => {
    try {
      const { status, appointmentDate, appointmentTime, consultationMode, notes } = req.body || {};
      const db = await getDb();
      const client = req.clientUser;

      const apt = await db.get(
        'SELECT * FROM client_appointments WHERE id = ? AND (clientId = ? OR LOWER(TRIM(clientEmail)) = ?)',
        [req.params.id, client.id, client.email.trim().toLowerCase()]
      );
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found.' });
      }

      if (appointmentDate && appointmentTime && (appointmentDate !== apt.appointmentDate || appointmentTime !== apt.appointmentTime)) {
        const conflict = await db.get(
          "SELECT id FROM client_appointments WHERE appointmentDate = ? AND appointmentTime = ? AND consultantName = ? AND status = 'Scheduled' AND id != ?",
          [appointmentDate, appointmentTime, apt.consultantName, apt.id]
        );
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: 'The selected reschedule slot is already booked. Please choose another time.'
          });
        }
      }

      await db.run(
        `UPDATE client_appointments SET
          status = COALESCE(?, status),
          appointmentDate = COALESCE(?, appointmentDate),
          appointmentTime = COALESCE(?, appointmentTime),
          consultationMode = COALESCE(?, consultationMode),
          notes = COALESCE(?, notes),
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          status || null,
          appointmentDate || null,
          appointmentTime || null,
          consultationMode || null,
          notes !== undefined ? notes : null,
          apt.id
        ]
      );

      const updated = await db.get('SELECT * FROM client_appointments WHERE id = ?', [apt.id]);
      res.json({
        success: true,
        message: status === 'Cancelled' ? 'Appointment cancelled.' : 'Appointment updated successfully.',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update appointment.' });
    }
  });

  // ============================================================================
  // 7. COMMUNICATION & NOTIFICATIONS
  // ============================================================================

  app.get('/api/client-portal/messages', requireClientAuth, async (req, res) => {
    try {
      const { enquiryId } = req.query;
      const db = await getDb();
      const client = req.clientUser;
      let msgs = await db.all(
        'SELECT * FROM client_messages WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt ASC',
        [client.id, client.email.trim().toLowerCase()]
      );
      if (enquiryId && enquiryId !== 'all') {
        msgs = msgs.filter(m => m.enquiryId === enquiryId);
      }
      res.json({ success: true, data: msgs });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to load messages.' });
    }
  });

  app.post('/api/client-portal/messages', requireClientAuth, async (req, res) => {
    try {
      const { enquiryId, serviceTitle, message } = req.body || {};
      if (!message || !String(message).trim()) {
        return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
      }
      const db = await getDb();
      const client = req.clientUser;
      const msgId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await db.run(
        `INSERT INTO client_messages (
          id, clientId, clientEmail, enquiryId, serviceTitle, senderRole, senderName, message, isRead
        ) VALUES (?, ?, ?, ?, ?, 'Client', ?, ?, 1)`,
        [
          msgId,
          client.id,
          client.email.trim().toLowerCase(),
          enquiryId || null,
          serviceTitle || 'General Advisory',
          client.name,
          message.trim()
        ]
      );

      if (enquiryId) {
        await db.run(
          `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
           VALUES (?, ?, ?, 'Client Message', ?, ?, ?)`,
          [
            `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            enquiryId,
            client.organizationId || null,
            `Message from Client (${client.name})`,
            message.trim().slice(0, 300),
            client.name
          ]
        );
      }

      const created = await db.get('SELECT * FROM client_messages WHERE id = ?', [msgId]);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  });

  app.get('/api/client-portal/notifications', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const list = await db.all(
        'SELECT * FROM client_notifications WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC LIMIT 50',
        [client.id, client.email.trim().toLowerCase()]
      );
      res.json({ success: true, data: list });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
  });

  app.patch('/api/client-portal/notifications/read', requireClientAuth, async (req, res) => {
    try {
      const { notificationId } = req.body || {};
      const db = await getDb();
      const client = req.clientUser;
      if (notificationId) {
        await db.run(
          'UPDATE client_notifications SET isRead = 1 WHERE id = ? AND (clientId = ? OR LOWER(TRIM(clientEmail)) = ?)',
          [notificationId, client.id, client.email.trim().toLowerCase()]
        );
      } else {
        await db.all(
          'SELECT id FROM client_notifications WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ?',
          [client.id, client.email.trim().toLowerCase()]
        ).then(async rows => {
          for (const r of rows) {
            await db.run('UPDATE client_notifications SET isRead = 1 WHERE id = ?', [r.id]);
          }
        });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
  });

  // ============================================================================
  // 8. INVOICES & PAYMENTS (REAL DATABASE RECORDS ONLY)
  // ============================================================================

  app.get('/api/client-portal/invoices', requireClientAuth, async (req, res) => {
    try {
      const db = await getDb();
      const client = req.clientUser;
      const invoices = await db.all(
        'SELECT * FROM client_invoices WHERE clientId = ? OR LOWER(TRIM(clientEmail)) = ? ORDER BY createdAt DESC',
        [client.id, client.email.trim().toLowerCase()]
      );
      res.json({ success: true, data: invoices });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch invoices.' });
    }
  });

  app.post('/api/client-portal/invoices/:id/pay', requireClientAuth, async (req, res) => {
    try {
      const { paymentMethod = 'Online Card / Corporate Gateway' } = req.body || {};
      const db = await getDb();
      const client = req.clientUser;
      const inv = await db.get(
        'SELECT * FROM client_invoices WHERE id = ? AND (clientId = ? OR LOWER(TRIM(clientEmail)) = ?)',
        [req.params.id, client.id, client.email.trim().toLowerCase()]
      );
      if (!inv) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      const paidAt = new Date().toISOString().split('T')[0];
      const receiptNumber = `RCPT-REV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      await db.run(
        `UPDATE client_invoices SET status = 'Paid', paidAt = ?, paymentMethod = ?, receiptNumber = ? WHERE id = ?`,
        [paidAt, paymentMethod, receiptNumber, inv.id]
      );

      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, 'status_update', ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          client.id,
          client.email.trim().toLowerCase(),
          inv.enquiryId || null,
          `Payment Confirmed (${receiptNumber})`,
          `Payment of ${inv.currency} ${inv.amount} for "${inv.serviceTitle}" has been confirmed. Receipt #${receiptNumber}.`
        ]
      );

      const updated = await db.get('SELECT * FROM client_invoices WHERE id = ?', [inv.id]);
      res.json({
        success: true,
        message: 'Payment recorded and official receipt generated.',
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to process invoice payment.' });
    }
  });

  // ============================================================================
  // 9. ADMIN & STAFF DASHBOARD INTEGRATION ENDPOINTS (SECTION 12)
  // ============================================================================

  app.get('/api/admin/client-portal/overview', async (req, res) => {
    try {
      const { assignedEmployee } = req.query;
      const db = await getDb();
      await ensureDemoClientAccount(db);

      let clients = await db.all('SELECT * FROM client_accounts ORDER BY createdAt DESC');
      let documents = await db.all('SELECT * FROM client_documents ORDER BY createdAt DESC');
      let appointments = await db.all('SELECT * FROM client_appointments ORDER BY appointmentDate ASC');
      let messages = await db.all('SELECT * FROM client_messages ORDER BY createdAt DESC LIMIT 100');
      let leads = await db.all('SELECT * FROM leads WHERE (isArchived IS NULL OR isArchived = 0) ORDER BY createdAt DESC');

      if (assignedEmployee && assignedEmployee !== 'All') {
        const empLower = assignedEmployee.toLowerCase();
        clients = clients.filter(c => !c.assignedConsultant || c.assignedConsultant.toLowerCase().includes(empLower));
        leads = leads.filter(l => !l.assignedEmployee || l.assignedEmployee.toLowerCase().includes(empLower));
        appointments = appointments.filter(a => !a.consultantName || a.consultantName.toLowerCase().includes(empLower));
      }

      const sanitizedClients = clients.map(sanitizeClientAccount);
      const enrichedLeads = leads.map(l => {
        const wf = getWorkflowForService(l.serviceId || l.serviceTitle, l.status, l.progressStep);
        return {
          ...l,
          workflowType: wf.workflowType,
          workflowLabel: wf.workflowLabel,
          stages: wf.stages,
          activeStep: wf.activeStep,
          totalSteps: wf.totalSteps,
          currentStageLabel: wf.currentStageLabel,
          progressPercent: l.progressPercent || wf.progressPercent
        };
      });

      res.json({
        success: true,
        clients: sanitizedClients,
        enquiries: enrichedLeads,
        documents,
        appointments,
        messages
      });
    } catch (err) {
      console.error('Admin client portal overview error:', err);
      res.status(500).json({ success: false, message: 'Failed to load Client Portal management data.' });
    }
  });

  app.patch('/api/admin/client-portal/services/:enquiryId/workflow', async (req, res) => {
    try {
      const { enquiryId } = req.params;
      const {
        status,
        progressStep,
        assignedEmployee,
        nextAction,
        updatedBy = 'Admin / Consultant'
      } = req.body || {};

      const db = await getDb();
      const lead = await db.get('SELECT * FROM leads WHERE id = ? OR referenceNumber = ?', [enquiryId, enquiryId]);
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Service enquiry not found.' });
      }

      const wf = getWorkflowForService(
        lead.serviceId || lead.serviceTitle,
        status || lead.status,
        progressStep || null
      );

      const newStageLabel = status || wf.currentStageLabel;
      const newStep = wf.activeStep;
      const newPercent = wf.progressPercent;
      const newNextAction = nextAction !== undefined ? nextAction : `Next Milestone: ${wf.nextStepLabel}`;

      await db.run(
        `UPDATE leads SET
          status = ?,
          progressStep = ?,
          progressPercent = ?,
          workflowType = ?,
          assignedEmployee = COALESCE(?, assignedEmployee),
          nextAction = ?,
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          newStageLabel,
          newStep,
          newPercent,
          wf.workflowType,
          assignedEmployee || null,
          newNextAction,
          lead.id
        ]
      );

      // Audit log in enquiry_activities
      await db.run(
        `INSERT INTO enquiry_activities (id, enquiryId, organizationId, type, title, notes, createdBy)
         VALUES (?, ?, ?, 'Status Update', ?, ?, ?)`,
        [
          `ACT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          lead.id,
          lead.organizationId || null,
          `Service Progress Updated to Stage ${newStep}/${wf.totalSteps}: ${newStageLabel} (${newPercent}%)`,
          `Next Action: ${newNextAction}`,
          updatedBy
        ]
      );

      // Notify client in client_notifications
      if (lead.clientId || lead.email) {
        await db.run(
          `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
           VALUES (?, ?, ?, ?, 'status_update', ?, ?, 0)`,
          [
            `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            lead.clientId || 'CLI-LINKED',
            (lead.email || '').trim().toLowerCase(),
            lead.id,
            `${lead.serviceTitle || 'Service'} Updated: ${newStageLabel}`,
            `Your service request (#${lead.referenceNumber || lead.id}) is now at Stage ${newStep} of ${wf.totalSteps} (${newStageLabel}). ${newNextAction}`
          ]
        );
      }

      const updatedLead = await db.get('SELECT * FROM leads WHERE id = ?', [lead.id]);
      res.json({
        success: true,
        message: 'Service workflow status updated and client notified.',
        data: {
          ...updatedLead,
          stages: wf.stages,
          activeStep: newStep,
          totalSteps: wf.totalSteps,
          progressPercent: newPercent
        }
      });
    } catch (err) {
      console.error('Admin workflow update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update service workflow.' });
    }
  });

  app.post('/api/admin/client-portal/documents/request', async (req, res) => {
    try {
      const {
        clientId,
        clientEmail,
        enquiryId,
        serviceId,
        serviceTitle,
        documentName,
        documentCategory = 'Required Document',
        requestedBy = 'Dhanalakshimi',
        notes = ''
      } = req.body || {};

      if (!documentName || (!clientId && !clientEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Client identifier and document name are required.'
        });
      }

      const db = await getDb();
      const docId = `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await db.run(
        `INSERT INTO client_documents (
          id, clientId, clientEmail, enquiryId, serviceId, serviceTitle,
          documentName, documentCategory, uploadedBy, verificationStatus, requestedBy, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Staff', 'Requested', ?, ?)`,
        [
          docId,
          clientId || 'CLI-LINKED',
          (clientEmail || '').trim().toLowerCase(),
          enquiryId || null,
          serviceId || 'general',
          serviceTitle || 'Advisory Service',
          documentName.trim(),
          documentCategory,
          requestedBy,
          notes || 'Requested by Revival Consultant'
        ]
      );

      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, 'document_request', ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          clientId || 'CLI-LINKED',
          (clientEmail || '').trim().toLowerCase(),
          enquiryId || null,
          `New Document Request: ${documentName.trim()}`,
          `${requestedBy} requested "${documentName.trim()}" for ${serviceTitle || 'your active service'}. ${notes}`
        ]
      );

      const created = await db.get('SELECT * FROM client_documents WHERE id = ?', [docId]);
      res.status(201).json({
        success: true,
        message: 'Document request sent to client.',
        data: created
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to create document request.' });
    }
  });

  app.patch('/api/admin/client-portal/documents/:docId/verify', async (req, res) => {
    try {
      const { verificationStatus, rejectionReason, notes, verifiedBy = 'Dhanalakshimi' } = req.body || {};
      if (!['Verified', 'Rejected', 'Pending Verification'].includes(verificationStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid verification status.' });
      }
      if (verificationStatus === 'Rejected' && (!rejectionReason || !String(rejectionReason).trim())) {
        return res.status(400).json({
          success: false,
          message: 'A clear rejection reason is required when rejecting a client document.'
        });
      }

      const db = await getDb();
      const doc = await db.get('SELECT * FROM client_documents WHERE id = ?', [req.params.docId]);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }

      await db.run(
        `UPDATE client_documents SET
          verificationStatus = ?,
          rejectionReason = ?,
          notes = COALESCE(?, notes),
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          verificationStatus,
          verificationStatus === 'Rejected' ? rejectionReason.trim() : null,
          notes || null,
          doc.id
        ]
      );

      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, 'document_verified', ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          doc.clientId,
          (doc.clientEmail || '').trim().toLowerCase(),
          doc.enquiryId || null,
          `Document ${verificationStatus}: ${doc.documentName}`,
          verificationStatus === 'Verified'
            ? `Your document "${doc.documentName}" has been verified and approved by ${verifiedBy}.`
            : `Your document "${doc.documentName}" requires revision: ${rejectionReason}`
        ]
      );

      const updated = await db.get('SELECT * FROM client_documents WHERE id = ?', [doc.id]);
      res.json({
        success: true,
        message: `Document marked as ${verificationStatus}.`,
        data: updated
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update document verification status.' });
    }
  });

  app.post('/api/admin/client-portal/messages', async (req, res) => {
    try {
      const {
        clientId,
        clientEmail,
        enquiryId,
        serviceTitle = 'Advisory Update',
        senderName = 'Dhanalakshimi (Senior Global Advisor)',
        senderRole = 'Consultant',
        message,
        isAnnouncement = false
      } = req.body || {};

      if (!message || !String(message).trim()) {
        return res.status(400).json({ success: false, message: 'Message text is required.' });
      }

      const db = await getDb();
      const msgId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      await db.run(
        `INSERT INTO client_messages (
          id, clientId, clientEmail, enquiryId, serviceTitle, senderRole, senderName, message, isRead
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          msgId,
          clientId || 'CLI-LINKED',
          (clientEmail || '').trim().toLowerCase(),
          enquiryId || null,
          serviceTitle,
          isAnnouncement ? 'Admin' : senderRole,
          senderName,
          message.trim()
        ]
      );

      await db.run(
        `INSERT INTO client_notifications (id, clientId, clientEmail, enquiryId, type, title, message, isRead)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          clientId || 'CLI-LINKED',
          (clientEmail || '').trim().toLowerCase(),
          enquiryId || null,
          isAnnouncement ? 'announcement' : 'message',
          isAnnouncement ? `Announcement: ${serviceTitle}` : `New Message from ${senderName}`,
          message.trim().slice(0, 200)
        ]
      );

      const created = await db.get('SELECT * FROM client_messages WHERE id = ?', [msgId]);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to send message to client.' });
    }
  });
};


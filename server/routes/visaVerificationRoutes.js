import crypto from 'crypto';
import { verifyCrmSessionToken } from './attendanceRoutes.js';
import {
  VISA_CASE_STATUSES,
  DOCUMENT_VERIFICATION_STATUSES,
  BGV_CHECK_STATUSES,
  ensureVisaVerificationTables,
  getRequiredChecklistTemplate,
  listVisaCases,
  getCandidateVisaVerificationBundle
} from '../services/visaVerificationService.js';

const makeId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

const ALLOWED_ROLES = new Set(['HR Operations', 'HR Lead', 'Admin', 'Super Admin']);

export const registerVisaVerificationRoutes = (app, { getDb, getClientIp, logAuditTrail }) => {
  const requireVisaStaffAuth = async (req, res, next) => {
    try {
      const db = await getDb();
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

      let emp = null;
      if (token) {
        const payload = verifyCrmSessionToken(token);
        if (payload && (payload.employeeId || payload.email)) {
          emp = await db.get(
            `SELECT * FROM employees
             WHERE (employeeId = ? OR id = ? OR LOWER(email) = LOWER(?))
               AND LOWER(COALESCE(status, 'Active')) != 'inactive'
             LIMIT 1`,
            [payload.employeeId || '', payload.id || '', payload.email || '']
          );
        }
      }

      if (!emp && req.headers['x-user-data']) {
        try {
          const parsed = typeof req.headers['x-user-data'] === 'string'
            ? JSON.parse(req.headers['x-user-data'])
            : req.headers['x-user-data'];
          const targetId = parsed.employeeId || parsed.id || '';
          const targetEmail = String(parsed.email || '').toLowerCase().trim();
          emp = await db.get(
            `SELECT * FROM employees
             WHERE (employeeId = ? OR id = ? OR LOWER(email) = ?)
               AND LOWER(COALESCE(status, 'Active')) != 'inactive'
             LIMIT 1`,
            [targetId, targetId, targetEmail]
          );
        } catch (_) {}
      }

      if (!emp) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to access Visa & Verification records.'
        });
      }

      // Check role authorization (also allow role-switcher override header only if authenticated as staff)
      const effectiveRole = String(emp.role || '').trim();
      if (!ALLOWED_ROLES.has(effectiveRole)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Unauthorized role for Visa & Verification documents.'
        });
      }

      req.visaStaff = emp;
      req.db = db;
      next();
    } catch (err) {
      console.error('[VisaVerification Auth Error]:', err);
      res.status(500).json({ success: false, message: 'Authorization check failed.' });
    }
  };

  // 1. GET /api/crm/visa-verification/cases - Dashboard summary + filtered cases
  app.get('/api/crm/visa-verification/cases', requireVisaStaffAuth, async (req, res) => {
    try {
      const result = await listVisaCases(req.db, req.query || {});
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      console.error('[VisaVerification] list cases error:', err);
      res.status(500).json({ success: false, message: 'Failed to load visa verification cases.' });
    }
  });

  // 2. GET /api/crm/visa-verification/candidate/:candidateKey - Candidate details bundle
  app.get('/api/crm/visa-verification/candidate/:candidateKey', requireVisaStaffAuth, async (req, res) => {
    try {
      const candidateKey = decodeURIComponent(req.params.candidateKey);
      const email = req.query?.email || '';
      const enquiryIds = req.query?.enquiryIds ? String(req.query.enquiryIds).split(',').filter(Boolean) : [];
      const bundle = await getCandidateVisaVerificationBundle(req.db, candidateKey, { email, enquiryIds });
      res.json({
        success: true,
        ...bundle
      });
    } catch (err) {
      console.error('[VisaVerification] candidate bundle error:', err);
      res.status(500).json({ success: false, message: 'Failed to load candidate verification details.' });
    }
  });

  // 3. POST /api/crm/visa-verification/cases - Create or confirm visa case for an enquiry (prevents duplicates)
  app.post('/api/crm/visa-verification/cases', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      await ensureVisaVerificationTables(db);
      const staff = req.visaStaff;

      const {
        candidateKey,
        candidateId,
        candidateName,
        candidateEmail,
        candidatePhone,
        enquiryId,
        applicationId = '',
        serviceId = '',
        serviceType = 'International Service',
        destinationCountry = 'To Be Confirmed',
        visaCategory = 'Needs Assessment',
        purpose = '',
        visaRequired = 1,
        requirementStatus = 'Required',
        caseStatus = 'Needs Assessment',
        assessmentNotes = ''
      } = req.body || {};

      if (!candidateKey || !enquiryId) {
        return res.status(400).json({ success: false, message: 'candidateKey and enquiryId are required.' });
      }

      const existing = await db.get(
        `SELECT * FROM visa_verification_cases WHERE enquiryId = ? AND COALESCE(applicationId, '') = ?`,
        [enquiryId, applicationId || '']
      );
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A visa verification case already exists for this enquiry and application.',
          caseRecord: existing
        });
      }

      const safeStatus = VISA_CASE_STATUSES.includes(caseStatus) ? caseStatus : 'Needs Assessment';
      const checklist = getRequiredChecklistTemplate(destinationCountry, visaCategory);
      const id = makeId('VVC');

      await db.run(
        `INSERT INTO visa_verification_cases (
          id, candidateKey, candidateId, candidateName, candidateEmail, candidatePhone,
          enquiryId, applicationId, serviceId, serviceType, destinationCountry, visaCategory, purpose,
          assignedEmployeeId, assignedEmployeeName, visaRequired, requirementStatus,
          documentStatus, eligibilityStatus, caseStatus, assessmentNotes,
          assignedReviewerId, assignedReviewerName, requiredDocsJson
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Documents', 'Eligibility Assessment Pending', ?, ?, ?, ?, ?)`,
        [
          id, candidateKey, candidateId || candidateKey, candidateName || 'Candidate',
          candidateEmail || '', candidatePhone || '', enquiryId, applicationId || '',
          serviceId, serviceType, destinationCountry, visaCategory, purpose,
          staff.employeeId || staff.id, staff.name, Number(visaRequired) || 0, requirementStatus,
          safeStatus, assessmentNotes, staff.employeeId || staff.id, staff.name, JSON.stringify(checklist)
        ]
      );

      await db.run(
        `INSERT INTO visa_case_activities (id, caseId, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, ?, 'VISA_CASE_CREATED', ?, ?, ?, ?)`,
        [
          makeId('VVA'), id, candidateKey, enquiryId,
          `Created visa verification case (${visaCategory} - ${destinationCountry}) with status ${safeStatus}`,
          staff.employeeId || staff.id, staff.name, staff.role
        ]
      );

      if (logAuditTrail) {
        await logAuditTrail(db, {
          userId: staff.employeeId || staff.id,
          userName: staff.name,
          role: staff.role,
          action: 'CREATE_VISA_CASE',
          entityType: 'visa_verification_case',
          entityId: id,
          details: `Enquiry ${enquiryId}: ${visaCategory} (${destinationCountry})`,
          ip: getClientIp ? getClientIp(req) : ''
        });
      }

      const created = await db.get('SELECT * FROM visa_verification_cases WHERE id = ?', [id]);
      res.status(201).json({ success: true, caseRecord: created });
    } catch (err) {
      console.error('[VisaVerification] create case error:', err);
      res.status(500).json({ success: false, message: 'Failed to create visa verification case.' });
    }
  });

  // 4. PATCH /api/crm/visa-verification/cases/:caseId - Update assessment, eligibility, submission, or official outcome
  app.patch('/api/crm/visa-verification/cases/:caseId', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      const staff = req.visaStaff;
      const { caseId } = req.params;

      const existing = await db.get('SELECT * FROM visa_verification_cases WHERE id = ?', [caseId]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Visa verification case not found.' });
      }

      const {
        destinationCountry,
        visaCategory,
        purpose,
        visaRequired,
        requirementStatus,
        documentStatus,
        eligibilityStatus,
        caseStatus,
        assessmentNotes,
        submissionDate,
        applicationRefNumber,
        officialDecision,
        officialDecisionDate,
        officialDecisionNotes,
        confirmedOfficialOutcome
      } = req.body || {};

      // Enforce official outcome safeguard: Officially Approved / Rejected only when confirmed
      if (
        (caseStatus === 'Officially Approved' || caseStatus === 'Officially Rejected' ||
          officialDecision === 'Officially Approved' || officialDecision === 'Officially Rejected') &&
        !confirmedOfficialOutcome && !officialDecisionDate
      ) {
        return res.status(400).json({
          success: false,
          message: 'Official immigration approval or rejection requires an official outcome date and confirmation.'
        });
      }

      const nextCountry = destinationCountry ?? existing.destinationCountry;
      const nextCategory = visaCategory ?? existing.visaCategory;
      const nextChecklist = (destinationCountry || visaCategory)
        ? JSON.stringify(getRequiredChecklistTemplate(nextCountry, nextCategory))
        : existing.requiredDocsJson;

      const nextStatus = (caseStatus && VISA_CASE_STATUSES.includes(caseStatus)) ? caseStatus : existing.caseStatus;

      await db.run(
        `UPDATE visa_verification_cases SET
          destinationCountry = ?,
          visaCategory = ?,
          purpose = ?,
          visaRequired = ?,
          requirementStatus = ?,
          documentStatus = ?,
          eligibilityStatus = ?,
          caseStatus = ?,
          assessmentNotes = ?,
          assignedReviewerId = ?,
          assignedReviewerName = ?,
          submissionDate = ?,
          applicationRefNumber = ?,
          officialDecision = ?,
          officialDecisionDate = ?,
          officialDecisionNotes = ?,
          requiredDocsJson = ?,
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          nextCountry,
          nextCategory,
          purpose ?? existing.purpose,
          visaRequired !== undefined ? Number(visaRequired) : existing.visaRequired,
          requirementStatus ?? existing.requirementStatus,
          documentStatus ?? existing.documentStatus,
          eligibilityStatus ?? existing.eligibilityStatus,
          nextStatus,
          assessmentNotes ?? existing.assessmentNotes,
          staff.employeeId || staff.id,
          staff.name,
          submissionDate ?? existing.submissionDate,
          applicationRefNumber ?? existing.applicationRefNumber,
          officialDecision ?? existing.officialDecision,
          officialDecisionDate ?? existing.officialDecisionDate,
          officialDecisionNotes ?? existing.officialDecisionNotes,
          nextChecklist,
          caseId
        ]
      );

      await db.run(
        `INSERT INTO visa_case_activities (id, caseId, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, ?, 'VISA_ASSESSMENT_UPDATED', ?, ?, ?, ?)`,
        [
          makeId('VVA'), caseId, existing.candidateKey, existing.enquiryId,
          `Status: ${nextStatus} | Eligibility: ${eligibilityStatus ?? existing.eligibilityStatus} | Country: ${nextCountry}${assessmentNotes ? ` | Notes: ${assessmentNotes}` : ''}`,
          staff.employeeId || staff.id, staff.name, staff.role
        ]
      );

      if (logAuditTrail) {
        await logAuditTrail(db, {
          userId: staff.employeeId || staff.id,
          userName: staff.name,
          role: staff.role,
          action: 'UPDATE_VISA_ASSESSMENT',
          entityType: 'visa_verification_case',
          entityId: caseId,
          details: `Updated case ${caseId} -> ${nextStatus}`,
          ip: getClientIp ? getClientIp(req) : ''
        });
      }

      const updated = await db.get('SELECT * FROM visa_verification_cases WHERE id = ?', [caseId]);
      res.json({ success: true, caseRecord: updated });
    } catch (err) {
      console.error('[VisaVerification] update case error:', err);
      res.status(500).json({ success: false, message: 'Failed to update visa case assessment.' });
    }
  });

  // 5. POST /api/crm/visa-verification/documents - Submit a document linked strictly to candidateKey & enquiryId
  app.post('/api/crm/visa-verification/documents', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      await ensureVisaVerificationTables(db);
      const staff = req.visaStaff;

      const {
        caseId = null,
        candidateKey,
        enquiryId = '',
        docName,
        docType,
        fileUrl = '',
        fileData = '',
        mimeType = '',
        fileSize = '1.2 MB',
        remarks = ''
      } = req.body || {};

      if (!candidateKey || !docName || !docType) {
        return res.status(400).json({ success: false, message: 'candidateKey, docName, and docType are required.' });
      }

      const docId = makeId('VCD');
      const secureDownloadUrl = fileUrl || `/api/crm/visa-verification/documents/${docId}/file`;

      await db.run(
        `INSERT INTO visa_case_documents (
          id, caseId, candidateKey, enquiryId, docName, docType, fileUrl, fileData, mimeType, fileSize,
          verificationStatus, reviewerId, reviewerName, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
        [
          docId, caseId, candidateKey, enquiryId, docName, docType,
          secureDownloadUrl, fileData || null, mimeType || null, fileSize,
          staff.employeeId || staff.id, staff.name, remarks
        ]
      );

      if (caseId) {
        await db.run(
          `UPDATE visa_verification_cases SET documentStatus = 'Under Review', updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND documentStatus = 'Pending Documents'`,
          [caseId]
        );
      }

      await db.run(
        `INSERT INTO visa_case_activities (id, caseId, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, ?, 'DOCUMENT_SUBMITTED', ?, ?, ?, ?)`,
        [
          makeId('VVA'), caseId, candidateKey, enquiryId,
          `Submitted ${docType}: ${docName}`,
          staff.employeeId || staff.id, staff.name, staff.role
        ]
      );

      const created = await db.get(
        `SELECT id, caseId, candidateKey, enquiryId, docName, docType, fileUrl, mimeType, fileSize, submittedAt, verificationStatus, reviewerId, reviewerName, remarks, missingOrCorrectionNote, reviewedAt FROM visa_case_documents WHERE id = ?`,
        [docId]
      );
      res.status(201).json({ success: true, document: created });
    } catch (err) {
      console.error('[VisaVerification] upload document error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit verification document.' });
    }
  });

  // 6. PATCH /api/crm/visa-verification/documents/:docId/review - Review individual document & update case documentStatus
  app.patch('/api/crm/visa-verification/documents/:docId/review', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      const staff = req.visaStaff;
      const { docId } = req.params;
      const { verificationStatus, remarks = '', missingOrCorrectionNote = '' } = req.body || {};

      if (!DOCUMENT_VERIFICATION_STATUSES.includes(verificationStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid document verification status.' });
      }

      const doc = await db.get('SELECT * FROM visa_case_documents WHERE id = ?', [docId]);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document record not found.' });
      }

      await db.run(
        `UPDATE visa_case_documents SET
          verificationStatus = ?,
          remarks = ?,
          missingOrCorrectionNote = ?,
          reviewerId = ?,
          reviewerName = ?,
          reviewedAt = CURRENT_TIMESTAMP,
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [verificationStatus, remarks, missingOrCorrectionNote, staff.employeeId || staff.id, staff.name, docId]
      );

      // Recompute overall case document status from all documents linked to this case/enquiry
      const relatedDocs = await db.all(
        `SELECT verificationStatus FROM visa_case_documents WHERE (caseId = ? AND caseId IS NOT NULL) OR (candidateKey = ? AND COALESCE(enquiryId, '') = ?)`,
        [doc.caseId || '', doc.candidateKey, doc.enquiryId || '']
      );

      let nextCaseDocStatus = 'Pending Documents';
      if (relatedDocs.some((d) => d.verificationStatus === 'Rejected / Correction Required')) {
        nextCaseDocStatus = 'Rejected / Correction Required';
      } else if (relatedDocs.length > 0 && relatedDocs.every((d) => d.verificationStatus === 'Verified')) {
        nextCaseDocStatus = 'Verified';
      } else if (relatedDocs.some((d) => d.verificationStatus === 'Under Review' || d.verificationStatus === 'Verified')) {
        nextCaseDocStatus = 'Under Review';
      }

      if (doc.caseId) {
        const nextCaseStatus =
          nextCaseDocStatus === 'Rejected / Correction Required'
            ? 'Additional Information Required'
            : (nextCaseDocStatus === 'Verified' ? 'Eligibility Assessment Pending' : 'Under Review');
        await db.run(
          `UPDATE visa_verification_cases SET documentStatus = ?, caseStatus = CASE WHEN caseStatus IN ('Officially Approved', 'Officially Rejected', 'Application Submitted') THEN caseStatus ELSE ? END, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [nextCaseDocStatus, nextCaseStatus, doc.caseId]
        );
      }

      await db.run(
        `INSERT INTO visa_case_activities (id, caseId, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, ?, 'DOCUMENT_REVIEWED', ?, ?, ?, ?)`,
        [
          makeId('VVA'), doc.caseId, doc.candidateKey, doc.enquiryId,
          `${doc.docName} (${doc.docType}) marked ${verificationStatus}${remarks ? ` — ${remarks}` : ''}`,
          staff.employeeId || staff.id, staff.name, staff.role
        ]
      );

      if (logAuditTrail) {
        await logAuditTrail(db, {
          userId: staff.employeeId || staff.id,
          userName: staff.name,
          role: staff.role,
          action: 'REVIEW_VISA_DOCUMENT',
          entityType: 'visa_case_document',
          entityId: docId,
          details: `${doc.docName} -> ${verificationStatus}`,
          ip: getClientIp ? getClientIp(req) : ''
        });
      }

      const updatedDoc = await db.get(
        `SELECT id, caseId, candidateKey, enquiryId, docName, docType, fileUrl, mimeType, fileSize, submittedAt, verificationStatus, reviewerId, reviewerName, remarks, missingOrCorrectionNote, reviewedAt FROM visa_case_documents WHERE id = ?`,
        [docId]
      );
      res.json({ success: true, document: updatedDoc, caseDocumentStatus: nextCaseDocStatus });
    } catch (err) {
      console.error('[VisaVerification] review document error:', err);
      res.status(500).json({ success: false, message: 'Failed to review document.' });
    }
  });

  // 7. GET /api/crm/visa-verification/documents/:docId/file - Access-controlled document download/preview
  app.get('/api/crm/visa-verification/documents/:docId/file', requireVisaStaffAuth, async (req, res) => {
    try {
      const doc = await req.db.get('SELECT * FROM visa_case_documents WHERE id = ?', [req.params.docId]);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }
      if (doc.fileData && doc.fileData.startsWith('data:')) {
        const match = doc.fileData.match(/^data:([^;]+);base64,(.*)$/);
        if (match) {
          const buf = Buffer.from(match[2], 'base64');
          res.setHeader('Content-Type', match[1]);
          res.setHeader('Content-Disposition', `inline; filename="${doc.docName}"`);
          return res.send(buf);
        }
      }
      res.json({
        success: true,
        document: {
          id: doc.id,
          docName: doc.docName,
          docType: doc.docType,
          verificationStatus: doc.verificationStatus,
          remarks: doc.remarks
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to retrieve document file.' });
    }
  });

  // 8. POST / PATCH BGV checks for candidate
  app.post('/api/crm/visa-verification/bgv', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      await ensureVisaVerificationTables(db);
      const staff = req.visaStaff;
      const { candidateKey, enquiryId = '', checkType, status = 'Pending', progress = '25%', notes = '' } = req.body || {};

      if (!candidateKey || !checkType) {
        return res.status(400).json({ success: false, message: 'candidateKey and checkType are required.' });
      }

      const safeStatus = BGV_CHECK_STATUSES.includes(status) ? status : 'Pending';
      const id = makeId('BGV');
      await db.run(
        `INSERT INTO visa_case_bgv_records (id, candidateKey, enquiryId, checkType, status, progress, reviewerId, reviewerName, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, candidateKey, enquiryId, checkType, safeStatus, progress, staff.employeeId || staff.id, staff.name, notes]
      );

      await db.run(
        `INSERT INTO visa_case_activities (id, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, 'BGV_UPDATED', ?, ?, ?, ?)`,
        [makeId('VVA'), candidateKey, enquiryId, `Added BGV check "${checkType}" (${safeStatus})`, staff.employeeId || staff.id, staff.name, staff.role]
      );

      const created = await db.get('SELECT * FROM visa_case_bgv_records WHERE id = ?', [id]);
      res.status(201).json({ success: true, bgvRecord: created });
    } catch (err) {
      console.error('[VisaVerification] create BGV error:', err);
      res.status(500).json({ success: false, message: 'Failed to add background verification check.' });
    }
  });

  app.patch('/api/crm/visa-verification/bgv/:bgvId', requireVisaStaffAuth, async (req, res) => {
    try {
      const db = req.db;
      const staff = req.visaStaff;
      const { bgvId } = req.params;
      const { status, progress, notes } = req.body || {};

      const existing = await db.get('SELECT * FROM visa_case_bgv_records WHERE id = ?', [bgvId]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'BGV record not found.' });
      }

      const nextStatus = (status && BGV_CHECK_STATUSES.includes(status)) ? status : existing.status;
      await db.run(
        `UPDATE visa_case_bgv_records SET status = ?, progress = ?, notes = ?, reviewerId = ?, reviewerName = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [nextStatus, progress ?? existing.progress, notes ?? existing.notes, staff.employeeId || staff.id, staff.name, bgvId]
      );

      await db.run(
        `INSERT INTO visa_case_activities (id, candidateKey, enquiryId, action, details, actorId, actorName, actorRole)
         VALUES (?, ?, ?, 'BGV_UPDATED', ?, ?, ?, ?)`,
        [makeId('VVA'), existing.candidateKey, existing.enquiryId, `BGV "${existing.checkType}" updated to ${nextStatus}`, staff.employeeId || staff.id, staff.name, staff.role]
      );

      const updated = await db.get('SELECT * FROM visa_case_bgv_records WHERE id = ?', [bgvId]);
      res.json({ success: true, bgvRecord: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update BGV record.' });
    }
  });
};

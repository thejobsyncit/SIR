import { 
  generateApplicationEmail, 
  sendJobApplicationEmail, 
  sendCandidateWelcomeEmail,
  detectRoleCategory 
} from '../services/emailApplicationService.js';
import { JOBS_LIST } from '../../src/data/mockData.js';

/**
 * Register API routes for "Apply via Email" with dynamic role-based template generation.
 */
export const registerEmailApplicationRoutes = (app, { getDb, getClientIp, logAuditTrail }) => {

  // Ensure table email_job_applications exists in SQLite
  const ensureTableInitialized = async (db) => {
    await db.exec(`
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
      CREATE INDEX IF NOT EXISTS idx_email_job_app_candidate ON email_job_applications(candidateEmail, jobId);
      CREATE INDEX IF NOT EXISTS idx_email_job_app_rate ON email_job_applications(candidateEmail, sentAt);
    `);
  };

  // Helper to fetch job from database with fallback to mock data
  const getJobById = async (db, jobId) => {
    if (!jobId) return null;
    let job = null;
    try {
      job = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    } catch (_) {}

    if (!job) {
      job = JOBS_LIST.find(j => String(j.id) === String(jobId));
    }

    if (!job) return null;

    // Check if client company has a specific contact email in clients table
    let companyEmail = job.companyEmail || job.email;
    if (!companyEmail && job.company) {
      try {
        const client = await db.get('SELECT email FROM clients WHERE LOWER(company) = LOWER(?) LIMIT 1', [job.company]);
        if (client?.email) companyEmail = client.email;
      } catch (_) {}
    }

    // Normalize job fields
    return {
      id: job.id,
      title: job.title || job.jobTitle || 'Career Opportunity',
      company: job.company || job.companyName || 'Revival International Partner Employer',
      companyEmail: companyEmail || process.env.PRIMARY_EMAIL || 'enquiry@therevivalinternational.com',
      location: job.location || job.country || 'Target Location',
      department: job.department || job.category || 'Operations',
      skills: job.skills || [],
      description: job.description || '',
      salary: job.salary || 'Competitive',
      experience: job.experience || ''
    };
  };

  /**
   * 1. POST /api/jobs/apply-email/preview
   * Generates a dynamic, role-specific email draft for the candidate to preview and edit.
   */
  app.post('/api/jobs/apply-email/preview', async (req, res) => {
    try {
      const { jobId, candidate } = req.body || {};

      if (!jobId) {
        return res.status(400).json({ success: false, message: 'Job ID is required.' });
      }

      const db = await getDb();
      await ensureTableInitialized(db);

      const job = await getJobById(db, jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
      }

      const candidateData = {
        name: candidate?.name || candidate?.fullName || 'Valued Candidate',
        email: candidate?.email || '',
        phone: candidate?.phone || '',
        location: candidate?.location || 'Dubai, UAE',
        experience: candidate?.experience || '3+ Years',
        noticePeriod: candidate?.noticePeriod || 'Immediate / 30 Days'
      };

      const generatedEmail = await generateApplicationEmail({
        candidate: candidateData,
        job
      });

      res.json({
        success: true,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          companyEmail: job.companyEmail,
          location: job.location,
          department: job.department,
          skills: job.skills
        },
        email: generatedEmail
      });
    } catch (error) {
      console.error('[Apply via Email Preview Error]:', error);
      res.status(500).json({ success: false, message: 'Failed to generate email preview.' });
    }
  });

  /**
   * 2. POST /api/jobs/apply-email/send
   * Validates rate-limits (max 5/hr), duplicate applications, CV file, and dispatches email via Nodemailer.
   */
  app.post('/api/jobs/apply-email/send', async (req, res) => {
    try {
      const {
        jobId,
        candidate,
        editedSubject,
        editedTextBody,
        editedMiddleParagraph,
        cvFile
      } = req.body || {};

      // Basic input validation
      if (!jobId) {
        return res.status(400).json({ success: false, message: 'Job ID is required.' });
      }
      if (!candidate?.name || !candidate?.name.trim()) {
        return res.status(400).json({ success: false, message: 'Candidate full name is required.' });
      }
      if (!candidate?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
        return res.status(400).json({ success: false, message: 'A valid candidate email address is required.' });
      }

      const candidateEmail = candidate.email.trim().toLowerCase();
      const candidateName = candidate.name.trim();
      const candidatePhone = (candidate.phone || '').trim();
      const candidateLocation = candidate.location || 'Dubai, UAE';
      const experience = candidate.experience || 'Experienced';
      const noticePeriod = candidate.noticePeriod || 'Standard notice period';
      const ipAddress = getClientIp ? getClientIp(req) : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');

      const db = await getDb();
      await ensureTableInitialized(db);

      // --- SAFETY 1: Rate Limiting (max 5 applications per user per hour) ---
      const rateCheck = await db.get(`
        SELECT COUNT(*) as recentCount 
        FROM email_job_applications 
        WHERE LOWER(candidateEmail) = LOWER(?) 
          AND sentAt >= datetime('now', '-1 hour')
      `, [candidateEmail]);

      if (rateCheck && rateCheck.recentCount >= 5) {
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit reached: You can submit a maximum of 5 job applications per hour. Please try again later.'
        });
      }

      // --- SAFETY 2: Prevent Duplicate Applications for same vacancy by same candidate ---
      const dupCheck = await db.get(`
        SELECT id, sentAt 
        FROM email_job_applications 
        WHERE LOWER(candidateEmail) = LOWER(?) 
          AND jobId = ? 
          AND status = 'SENT'
        LIMIT 1
      `, [candidateEmail, String(jobId)]);

      if (dupCheck) {
        return res.status(409).json({
          success: false,
          error: 'DUPLICATE_APPLICATION',
          message: `You have already applied for this position on ${dupCheck.sentAt}. Duplicate submissions to the same role are prevented.`
        });
      }

      // --- CV VALIDATION: Must be PDF/DOC/DOCX and max 10MB ---
      let cvBuffer = null;
      let resumeFileName = cvFile?.filename || 'Resume_Curriculum_Vitae.pdf';
      let resumeSize = Number(cvFile?.size) || 0;

      if (cvFile && cvFile.base64) {
        // Strip data URL header if present (e.g. "data:application/pdf;base64,")
        const base64Clean = cvFile.base64.replace(/^data:[^;]+;base64,/, '');
        cvBuffer = Buffer.from(base64Clean, 'base64');
        resumeSize = cvBuffer.length;

        const maxBytes = 10 * 1024 * 1024; // 10MB
        if (resumeSize > maxBytes) {
          return res.status(400).json({
            success: false,
            message: 'CV file exceeds the 10MB size limit. Please upload a smaller document.'
          });
        }

        const allowedExts = ['.pdf', '.doc', '.docx'];
        const ext = (resumeFileName.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
        if (!allowedExts.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid CV file format. Only PDF, DOC, or DOCX documents are accepted.'
          });
        }
      }

      // Fetch Job from database
      const job = await getJobById(db, jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
      }

      // Enrich candidate details dynamically from database if missing
      let candidateProfile = null;
      if (candidateEmail) {
        try {
          candidateProfile = await db.get(
            'SELECT name, phone, email, location FROM candidate_profiles WHERE LOWER(email) = LOWER(?) UNION SELECT name, phone, email, location FROM candidates WHERE LOWER(email) = LOWER(?)',
            [candidateEmail.toLowerCase().trim(), candidateEmail.toLowerCase().trim()]
          );
        } catch (_) {}
      }

      const resolvedName = candidateName || candidateProfile?.name || 'Candidate';
      const resolvedPhone = candidatePhone || candidateProfile?.phone || '';
      const resolvedEmail = candidateEmail || candidateProfile?.email || '';

      // Generate consultant introduction email content
      let emailContent = await generateApplicationEmail({
        candidate: {
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          location: candidateLocation || candidateProfile?.location,
          experience,
          noticePeriod
        },
        job
      });

      // If candidate customized the subject or body in the preview step, honor their edits
      if (editedSubject && editedSubject.trim()) {
        emailContent.subject = editedSubject.trim();
      }
      if (editedTextBody && editedTextBody.trim()) {
        emailContent.textBody = editedTextBody.trim();
      }

      // Generate unique application ID
      const appId = `REV-EMAIL-APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Dispatch Email via Nodemailer
      let sendResult;
      let appStatus = 'SENT';
      let errorDetail = null;

      try {
        sendResult = await sendJobApplicationEmail({
          candidate: { name: candidateName, email: candidateEmail },
          job,
          emailContent,
          cvFile: cvBuffer ? {
            filename: resumeFileName,
            buffer: cvBuffer,
            mimeType: cvFile.mimeType || 'application/pdf',
            size: resumeSize
          } : null
        });

        if (sendResult.simulated) {
          appStatus = 'SIMULATED';
        }
      } catch (mailErr) {
        console.error('[Nodemailer Dispatch Warning]:', mailErr.message);
        // Fallback to SIMULATED status so user's application is not lost
        appStatus = 'SIMULATED';
        errorDetail = mailErr.message;
        sendResult = {
          success: true,
          simulated: true,
          messageId: `sim-err-${Date.now()}`
        };
      }

      // Save application into database (Requirement 12)
      await db.run(`
        INSERT INTO email_job_applications (
          id, jobId, jobTitle, companyName, companyEmail,
          candidateName, candidateEmail, candidatePhone, candidateLocation,
          experience, noticePeriod, emailSubject, emailBodyHtml, emailBodyText,
          resumeFileName, resumeFileSize, status, ipAddress, errorMessage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        appId,
        String(job.id),
        job.title,
        job.company,
        emailContent.recipientEmail,
        candidateName,
        candidateEmail,
        candidatePhone,
        candidateLocation,
        experience,
        noticePeriod,
        emailContent.subject,
        emailContent.htmlBody,
        emailContent.textBody,
        resumeFileName,
        resumeSize,
        appStatus,
        ipAddress,
        errorDetail
      ]);

      // Record in candidate_applications for Candidate Dashboard and CRM Application Pipeline
      try {
        const normEmail = (candidateEmail || '').trim().toLowerCase();

        // 1. Resolve user ID for foreign key integrity
        let userRow = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [normEmail]);
        let effectiveUid = userRow?.id;
        if (!effectiveUid) {
          const fallbackUser = await db.get('SELECT id FROM users WHERE role = "candidate" LIMIT 1') || await db.get('SELECT id FROM users LIMIT 1');
          effectiveUid = fallbackUser?.id || 'USR-MW6CF773-428';
        }

        // 2. Resolve or create candidate profile for foreign key integrity
        let profile = await db.get('SELECT id FROM candidate_profiles WHERE LOWER(email) = LOWER(?)', [normEmail]);
        let effectiveCid = profile?.id;
        if (!effectiveCid) {
          effectiveCid = `RI-CAND-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
          await db.run(`
            INSERT OR IGNORE INTO candidate_profiles (id, userId, name, email, phone, nationality)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [effectiveCid, effectiveUid, candidateName || 'Candidate', candidateEmail, candidatePhone || '', candidateLocation || 'Global']);
        }

        // 3. Insert or update candidate_applications
        await db.run(`
          INSERT OR REPLACE INTO candidate_applications (
            id, candidateId, userId, jobId, jobTitle, company, location,
            applicantName, applicantEmail, applicantPhone, resumeName,
            status, stage, appliedDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', 'Applied', CURRENT_TIMESTAMP)
        `, [
          appId,
          effectiveCid,
          effectiveUid,
          String(job.id),
          job.title,
          job.company,
          job.location,
          candidateName,
          candidateEmail,
          candidatePhone,
          resumeFileName || 'Curriculum_Vitae.pdf'
        ]);

        // 4. Ensure candidate exists in candidates table with stage = 'applied' so they show up in CRM Kanban & Applicants
        const existingInCandidates = await db.get('SELECT id FROM candidates WHERE LOWER(email) = LOWER(?)', [normEmail]);
        if (existingInCandidates) {
          await db.run(`
            UPDATE candidates SET
              stage = 'applied',
              currentRole = COALESCE(?, currentRole),
              currentEmployer = COALESCE(?, currentEmployer)
            WHERE id = ?
          `, [job.title, job.company, existingInCandidates.id]);
        } else {
          await db.run(`
            INSERT INTO candidates (
              id, name, email, phone, nationality, currentEmployer, currentRole,
              stage, score, skills, source, aiSummary, assignedRecruiter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', 90, ?, 'Quick Apply / Job Application', ?, 'Dhanalakshimi (Lead Advisor)')
          `, [
            effectiveCid,
            candidateName,
            candidateEmail,
            candidatePhone,
            candidateLocation || 'Global',
            job.company,
            job.title,
            JSON.stringify([job.title]),
            `Applied for ${job.title} at ${job.company}`
          ]);
        }
      } catch (appSyncErr) {
        console.error('[Application Pipeline Sync Error]:', appSyncErr);
      }

      // Log audit trail
      if (logAuditTrail) {
        await logAuditTrail(db, {
          action: 'APPLY_VIA_EMAIL',
          module: 'JOBS_PORTAL',
          details: `Application ${appId} sent for ${job.title} at ${job.company} by ${candidateEmail} [status=${appStatus}]`,
          ipAddress
        }).catch(() => {});
      }

      res.status(201).json({
        success: true,
        message: appStatus === 'SIMULATED' 
          ? `✓ Application saved and recorded.`
          : `✓ Application successfully sent to ${sendResult?.recipient || emailContent.recipientEmail}!`,
        applicationId: appId,
        recipient: sendResult?.recipient || emailContent.recipientEmail,
        candidateCc: candidateEmail,
        subject: emailContent.subject,
        simulated: appStatus === 'SIMULATED',
        needsAppPassword: appStatus === 'SIMULATED'
      });

    } catch (err) {
      console.error('[Apply via Email Route Error]:', err);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your application. Please try again.'
      });
    }
  });

  /**
   * 3. GET /api/jobs/apply-email/history
   * Retrieves email application logs for auditing or user history.
   */
  app.get('/api/jobs/apply-email/history', async (req, res) => {
    try {
      const { email } = req.query;
      const db = await getDb();
      await ensureTableInitialized(db);

      let rows;
      if (email) {
        rows = await db.all(`
          SELECT * FROM email_job_applications 
          WHERE LOWER(candidateEmail) = LOWER(?) 
          ORDER BY sentAt DESC LIMIT 20
        `, [email.trim()]);
      } else {
        rows = await db.all('SELECT * FROM email_job_applications ORDER BY sentAt DESC LIMIT 50');
      }

      res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('Failed to query email applications:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  /**
   * 4. POST /api/auth/welcome-email
   * Sends an official Welcome & Registration Confirmation Email to new candidates.
   */
  app.post('/api/auth/welcome-email', async (req, res) => {
    try {
      const { name, email, phone, candidateId, authProvider, preferredCountry } = req.body || {};

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email address is required.' });
      }

      const result = await sendCandidateWelcomeEmail({
        name,
        email,
        phone,
        candidateId,
        authProvider: authProvider || 'email',
        preferredCountry
      });

      res.json({
        success: result.success,
        message: result.success ? 'Welcome confirmation email dispatched successfully.' : result.error,
        recipient: result.recipient,
        messageId: result.messageId,
        simulated: result.simulated
      });
    } catch (err) {
      console.error('[Welcome Email Route Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to send welcome email.' });
    }
  });
};

/**
 * Interview Management & Placement Coordinator Routes
 *
 * Integrates with existing candidates, candidate_profiles, candidate_applications,
 * candidate_documents, candidate_verifications, jobs, employees, and interviews tables.
 * Uses standard SQL compatible with PostgreSQL (Supabase) and SQLite.
 */

export const PIPELINE_STAGES_ORDER = [
  'HR Operations Approved',
  'Interview Pending',
  'Interview Scheduled',
  'Interview Completed',
  'Interview Selected',
  'Placement Coordinator Review',
  'Approved for Company Submission',
  'Submitted to Employer',
  'Employer Interview',
  'Employer Selected',
  'Offer Released',
  'Joining Pending',
  'Successfully Placed'
];

const ensureTables = async (db) => {
  await db.exec(`
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
};

const addActivityAndNotify = async (db, {
  candidateId,
  candidateName,
  employeeName = 'CRM User',
  employeeRole = 'Super Admin',
  action,
  previousStatus = '',
  newStatus = '',
  remarks = '',
  notifyTitle,
  notifyMessage,
  targetRole = 'All'
}) => {
  const now = new Date().toISOString();
  const actId = `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await db.run(
    `INSERT INTO recruitment_activity_logs (id, candidateId, candidateName, employeeName, employeeRole, action, previousStatus, newStatus, remarks, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [actId, candidateId || '', candidateName || '', employeeName, employeeRole, action, previousStatus, newStatus, remarks, now]
  );

  if (notifyTitle && notifyMessage) {
    const notifId = `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.run(
      `INSERT INTO recruitment_notifications (id, candidateId, candidateName, targetRole, title, message, type, isRead, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 'workflow', 0, ?)`,
      [notifId, candidateId || '', candidateName || '', targetRole, notifyTitle, notifyMessage, now]
    );
  }
};

const getActor = (req) => ({
  employeeName: req.body?.employeeName || req.headers['x-crm-user'] || 'Priya Sharma',
  employeeRole: req.body?.employeeRole || req.headers['x-crm-role'] || 'Super Admin'
});

/**
 * Assemble complete, non-duplicated candidate dataset by joining existing tables
 * with recruitment_pipeline_records.
 */
const buildEnrichedCandidates = async (db) => {
  await ensureTables(db);

  const [
    pipelineRows,
    candidates,
    profiles,
    applications,
    jobs,
    documents,
    verifications,
    rounds,
    submissions,
    employerInterviews,
    offers
  ] = await Promise.all([
    db.all('SELECT * FROM recruitment_pipeline_records ORDER BY updatedAt DESC').catch(() => []),
    db.all('SELECT * FROM candidates').catch(() => []),
    db.all('SELECT * FROM candidate_profiles').catch(() => []),
    db.all('SELECT * FROM candidate_applications ORDER BY appliedDate DESC').catch(() => []),
    db.all('SELECT * FROM jobs').catch(() => []),
    db.all('SELECT * FROM candidate_documents ORDER BY uploadDate DESC').catch(() => []),
    db.all('SELECT * FROM candidate_verifications').catch(() => []),
    db.all('SELECT * FROM interview_rounds ORDER BY roundNumber ASC, createdAt ASC').catch(() => []),
    db.all('SELECT * FROM employer_submissions ORDER BY createdAt DESC').catch(() => []),
    db.all('SELECT * FROM employer_interviews ORDER BY createdAt DESC').catch(() => []),
    db.all('SELECT * FROM placement_offers ORDER BY createdAt DESC').catch(() => [])
  ]);

  const candById = new Map();
  const candByEmail = new Map();
  for (const c of candidates) {
    if (c.id) candById.set(c.id, c);
    if (c.email) candByEmail.set(c.email.toLowerCase().trim(), c);
  }

  const profById = new Map();
  const profByEmail = new Map();
  for (const p of profiles) {
    if (p.id) profById.set(p.id, p);
    if (p.userId) profById.set(p.userId, p);
    if (p.email) profByEmail.set(p.email.toLowerCase().trim(), p);
  }

  const jobById = new Map();
  for (const j of jobs) {
    if (j.id) jobById.set(j.id, j);
  }

  const appsByCand = new Map();
  for (const a of applications) {
    const key = a.candidateId || a.userId;
    if (!key) continue;
    if (!appsByCand.has(key)) appsByCand.set(key, []);
    appsByCand.get(key).push(a);
  }

  const docsByCand = new Map();
  for (const d of documents) {
    const keys = [d.candidateId, d.userId].filter(Boolean);
    for (const k of keys) {
      if (!docsByCand.has(k)) docsByCand.set(k, []);
      docsByCand.get(k).push(d);
    }
  }

  const verifByCand = new Map();
  for (const v of verifications) {
    if (v.candidateId) verifByCand.set(v.candidateId, v);
  }

  const roundsByCand = new Map();
  for (const r of rounds) {
    if (!roundsByCand.has(r.candidateId)) roundsByCand.set(r.candidateId, []);
    roundsByCand.get(r.candidateId).push(r);
  }

  const subsByCand = new Map();
  for (const s of submissions) {
    if (!subsByCand.has(s.candidateId)) subsByCand.set(s.candidateId, []);
    subsByCand.get(s.candidateId).push(s);
  }

  const empIntByCand = new Map();
  for (const ei of employerInterviews) {
    if (!empIntByCand.has(ei.candidateId)) empIntByCand.set(ei.candidateId, []);
    empIntByCand.get(ei.candidateId).push(ei);
  }

  const offersByCand = new Map();
  for (const o of offers) {
    if (!offersByCand.has(o.candidateId)) offersByCand.set(o.candidateId, []);
    offersByCand.get(o.candidateId).push(o);
  }

  // Also include any candidates whose stage in `candidates` is already hr_interview / verified
  const pipelineMap = new Map();
  for (const pr of pipelineRows) {
    pipelineMap.set(pr.candidateId, pr);
  }

  for (const c of candidates) {
    const st = String(c.stage || '').toLowerCase();
    if (!pipelineMap.has(c.id) && (st === 'hr_interview' || st === 'interview' || st === 'verified')) {
      pipelineMap.set(c.id, {
        candidateId: c.id,
        pipelineStage: 'HR Operations Approved',
        hrApprovedAt: c.createdAt || new Date().toISOString(),
        hrApprovedBy: 'HR Operations',
        hrScreeningResult: 'Approved & Eligible',
        hrCandidateInterest: 'Confirmed',
        hrRemarks: c.aiSummary || 'Cleared HR Operations screening and verification.',
        hrEligibility: 'Eligible',
        docVerificationStatus: 'Verified',
        interviewStatus: 'Pending',
        finalPlacementStatus: 'Placement In Progress',
        createdAt: c.createdAt,
        updatedAt: c.createdAt
      });
    }
  }

  const enriched = [];
  for (const [candidateId, pr] of pipelineMap.entries()) {
    const c = candById.get(candidateId) || {};
    const emailKey = (c.email || '').toLowerCase().trim();
    const p = profById.get(candidateId) || (emailKey ? profByEmail.get(emailKey) : null) || {};
    const candApps = appsByCand.get(candidateId) || appsByCand.get(p.id) || appsByCand.get(p.userId) || [];
    const latestApp = candApps[0] || {};
    const job = jobById.get(pr.jobId || latestApp.jobId) || {};
    const candDocs = docsByCand.get(candidateId) || docsByCand.get(p.id) || docsByCand.get(p.userId) || [];
    const verif = verifByCand.get(candidateId) || verifByCand.get(p.id) || {};

    const jobLocation = pr.jobLocation || latestApp.location || job.location || job.country || 'Dubai, UAE';
    const isDomestic = /india|chennai|mumbai|bangalore|delhi|hyderabad/i.test(jobLocation);

    enriched.push({
      candidateId,
      name: c.name || p.name || 'Candidate',
      email: c.email || p.email || '',
      phone: c.phone || p.phone || '',
      nationality: c.nationality || p.nationality || 'India',
      currentResidence: p.currentResidence || c.nationality || 'India',
      currentLocation: p.currentLocation || jobLocation || 'India',
      currentJobTitle: c.currentRole || p.currentRole || 'Professional',
      totalExperience: c.experience || p.experience || '3+ Years',
      previousEmployer: c.currentEmployer || p.currentEmployer || '—',
      education: p.education || job.qualification || 'Bachelor Degree',
      skills: c.skills || p.skills || '',
      expectedSalary: c.expectedSalary || p.expectedSalary || 'Market Standard',
      noticePeriod: p.noticePeriod || '30 Days',
      resumeName: p.resumeName || '',
      resumeUrl: p.resumeUrl || '',
      jobId: pr.jobId || latestApp.jobId || job.id || '',
      jobTitle: pr.jobTitle || latestApp.jobTitle || job.title || 'International Role',
      companyName: pr.companyName || latestApp.company || job.company || 'Revival Partner',
      jobDescription: job.description || '',
      jobLocation,
      requiredExperience: job.experience || '2-5 Years',
      jobCategory: pr.jobCategory || job.category || (isDomestic ? 'Domestic' : 'International'),
      domesticOrInternational: isDomestic ? 'Domestic' : 'International',
      appliedDate: latestApp.appliedDate || pr.createdAt || '',
      // HR Operations Report (Read-Only from HR Ops)
      hrApprovedAt: pr.hrApprovedAt || pr.createdAt || '',
      hrApprovedBy: pr.hrApprovedBy || 'HR Operations',
      hrScreeningResult: pr.hrScreeningResult || 'Approved & Eligible',
      hrCandidateInterest: pr.hrCandidateInterest || 'Confirmed',
      hrRemarks: pr.hrRemarks || 'Cleared HR Operations screening and document verification.',
      hrEligibility: pr.hrEligibility || 'Eligible',
      docVerificationStatus: verif.overallStatus || pr.docVerificationStatus || 'Verified',
      verifiedDocuments: candDocs,
      // Pipeline & Interview / Placement State
      pipelineStage: pr.pipelineStage || 'HR Operations Approved',
      assignedInterviewerId: pr.assignedInterviewerId || '',
      assignedInterviewerName: pr.assignedInterviewerName || '',
      interviewStatus: pr.interviewStatus || 'Pending',
      latestInterviewResult: pr.latestInterviewResult || '',
      latestInterviewScore: pr.latestInterviewScore || null,
      assignedCoordinatorId: pr.assignedCoordinatorId || '',
      assignedCoordinatorName: pr.assignedCoordinatorName || '',
      placementDecision: pr.placementDecision || '',
      placementRemarks: pr.placementRemarks || '',
      placementDecidedBy: pr.placementDecidedBy || '',
      placementDecidedAt: pr.placementDecidedAt || '',
      finalPlacementStatus: pr.finalPlacementStatus || 'Placement In Progress',
      rejectionReason: pr.rejectionReason || '',
      interviewRounds: roundsByCand.get(candidateId) || [],
      employerSubmissions: subsByCand.get(candidateId) || [],
      employerInterviews: empIntByCand.get(candidateId) || [],
      placementOffers: offersByCand.get(candidateId) || [],
      updatedAt: pr.updatedAt || pr.createdAt
    });
  }

  return enriched;
};

export const registerInterviewPlacementRoutes = (app, { getDb }) => {
  // 1. Unified Workflow Candidates Feed
  app.get('/api/interview-placement/candidates', async (req, res) => {
    try {
      const db = await getDb();
      const candidates = await buildEnrichedCandidates(db);
      const { role, employeeId, employeeName } = req.query || {};

      let filtered = candidates;
      if (role === 'Interviewer' && (employeeId || employeeName)) {
        // Show candidates assigned to this interviewer OR unassigned HR-approved candidates ready for interview
        filtered = candidates.filter((c) => {
          if (!c.assignedInterviewerId && !c.assignedInterviewerName) return true;
          return (
            (employeeId && c.assignedInterviewerId === employeeId) ||
            (employeeName && c.assignedInterviewerName?.toLowerCase() === String(employeeName).toLowerCase())
          );
        });
      }

      res.json({ success: true, candidates: filtered, allCount: candidates.length });
    } catch (err) {
      console.error('Error loading interview/placement candidates:', err);
      res.status(500).json({ success: false, message: 'Failed to load workflow candidates.' });
    }
  });

  // 2. HR Operations Approval -> Forward to Interview Management
  app.post('/api/interview-placement/hr-approve', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const {
        candidateId,
        jobId = '',
        jobTitle = '',
        companyName = '',
        jobLocation = '',
        hrScreeningResult = 'Approved & Eligible',
        hrCandidateInterest = 'Confirmed',
        hrRemarks = 'Cleared HR Operations screening and document verification.',
        hrEligibility = 'Eligible',
        docVerificationStatus = 'Verified',
        assignedInterviewerId = '',
        assignedInterviewerName = ''
      } = req.body || {};

      if (!candidateId) {
        return res.status(400).json({ success: false, message: 'candidateId is required.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();
      const cand = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]).catch(() => null);
      const prof = !cand ? await db.get('SELECT * FROM candidate_profiles WHERE id = ?', [candidateId]).catch(() => null) : null;
      const candName = cand?.name || prof?.name || 'Candidate';

      const existing = await db.get('SELECT * FROM recruitment_pipeline_records WHERE candidateId = ?', [candidateId]);
      if (existing) {
        await db.run(
          `UPDATE recruitment_pipeline_records SET
            pipelineStage = 'HR Operations Approved',
            hrApprovedAt = ?,
            hrApprovedBy = ?,
            hrScreeningResult = ?,
            hrCandidateInterest = ?,
            hrRemarks = ?,
            hrEligibility = ?,
            docVerificationStatus = ?,
            interviewStatus = 'Pending',
            updatedAt = ?
           WHERE candidateId = ?`,
          [now, actor.employeeName, hrScreeningResult, hrCandidateInterest, hrRemarks, hrEligibility, docVerificationStatus, now, candidateId]
        );
      } else {
        await db.run(
          `INSERT INTO recruitment_pipeline_records (
            candidateId, jobId, jobTitle, companyName, jobLocation, pipelineStage,
            hrApprovedAt, hrApprovedBy, hrScreeningResult, hrCandidateInterest, hrRemarks,
            hrEligibility, docVerificationStatus, assignedInterviewerId, assignedInterviewerName,
            interviewStatus, finalPlacementStatus, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, 'HR Operations Approved', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Placement In Progress', ?, ?)`,
          [
            candidateId, jobId, jobTitle, companyName, jobLocation, now, actor.employeeName,
            hrScreeningResult, hrCandidateInterest, hrRemarks, hrEligibility, docVerificationStatus,
            assignedInterviewerId, assignedInterviewerName, now, now
          ]
        );
      }

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candName,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: 'HR Operations Approved for Interview',
        previousStatus: existing?.pipelineStage || 'HR Operations Screening',
        newStatus: 'HR Operations Approved',
        remarks: hrRemarks,
        notifyTitle: 'New Candidate Forwarded by HR Operations',
        notifyMessage: `${candName} has been verified & approved by HR Operations and is ready for Interview Management.`,
        targetRole: 'Interviewer'
      });

      res.json({ success: true, message: 'Candidate forwarded to Interview Management.' });
    } catch (err) {
      console.error('HR Approve error:', err);
      res.status(500).json({ success: false, message: 'Failed to forward candidate to Interview Management.' });
    }
  });

  // 3. Super Admin Assignment (Interviewer / Placement Coordinator)
  app.patch('/api/interview-placement/candidates/:candidateId/assign', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.params;
      const { assignedInterviewerId, assignedInterviewerName, assignedCoordinatorId, assignedCoordinatorName, pipelineStage } = req.body || {};
      const actor = getActor(req);
      const now = new Date().toISOString();

      const existing = await db.get('SELECT * FROM recruitment_pipeline_records WHERE candidateId = ?', [candidateId]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Pipeline record not found.' });
      }

      await db.run(
        `UPDATE recruitment_pipeline_records SET
          assignedInterviewerId = COALESCE(?, assignedInterviewerId),
          assignedInterviewerName = COALESCE(?, assignedInterviewerName),
          assignedCoordinatorId = COALESCE(?, assignedCoordinatorId),
          assignedCoordinatorName = COALESCE(?, assignedCoordinatorName),
          pipelineStage = COALESCE(?, pipelineStage),
          updatedAt = ?
         WHERE candidateId = ?`,
        [
          assignedInterviewerId ?? null,
          assignedInterviewerName ?? null,
          assignedCoordinatorId ?? null,
          assignedCoordinatorName ?? null,
          pipelineStage ?? null,
          now,
          candidateId
        ]
      );

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: 'Updated Workflow Assignment',
        previousStatus: existing.pipelineStage,
        newStatus: pipelineStage || existing.pipelineStage,
        remarks: `Interviewer: ${assignedInterviewerName || existing.assignedInterviewerName || '—'}, Coordinator: ${assignedCoordinatorName || existing.assignedCoordinatorName || '—'}`
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Assign error:', err);
      res.status(500).json({ success: false, message: 'Failed to update assignment.' });
    }
  });

  // 4. Schedule / Reschedule / Update Status of Interview Round
  app.post('/api/interview-placement/interviews/schedule', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const {
        id,
        candidateId,
        candidateName,
        jobId = '',
        jobTitle = '',
        companyName = '',
        roundNumber = 1,
        roundName = 'Round 1',
        interviewerId = '',
        interviewerName = '',
        interviewDate,
        interviewTime,
        interviewMode = 'Online',
        meetingLink = '',
        officeLocation = '',
        instructions = '',
        status = 'Scheduled'
      } = req.body || {};

      if (!candidateId || !interviewDate || !interviewTime) {
        return res.status(400).json({ success: false, message: 'Candidate, interview date, and time are required.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();
      const roundId = id || `RND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const existingRound = id ? await db.get('SELECT * FROM interview_rounds WHERE id = ?', [id]) : null;
      if (existingRound) {
        await db.run(
          `UPDATE interview_rounds SET
            roundNumber = ?, roundName = ?, interviewerId = ?, interviewerName = ?,
            interviewDate = ?, interviewTime = ?, interviewMode = ?, meetingLink = ?,
            officeLocation = ?, instructions = ?, status = ?, updatedAt = ?
           WHERE id = ?`,
          [roundNumber, roundName, interviewerId, interviewerName, interviewDate, interviewTime, interviewMode, meetingLink, officeLocation, instructions, status, now, id]
        );
      } else {
        await db.run(
          `INSERT INTO interview_rounds (
            id, candidateId, jobId, jobTitle, companyName, roundNumber, roundName,
            interviewerId, interviewerName, interviewDate, interviewTime, interviewMode,
            meetingLink, officeLocation, instructions, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [roundId, candidateId, jobId, jobTitle, companyName, roundNumber, roundName, interviewerId, interviewerName, interviewDate, interviewTime, interviewMode, meetingLink, officeLocation, instructions, status, now, now]
        );
      }

      const nextPipelineStage = status === 'Completed' ? 'Interview Completed' : 'Interview Scheduled';
      await db.run(
        `UPDATE recruitment_pipeline_records SET
          interviewStatus = ?,
          assignedInterviewerId = COALESCE(NULLIF(?, ''), assignedInterviewerId),
          assignedInterviewerName = COALESCE(NULLIF(?, ''), assignedInterviewerName),
          pipelineStage = ?,
          updatedAt = ?
         WHERE candidateId = ?`,
        [status, interviewerId, interviewerName, nextPipelineStage, now, candidateId]
      );

      // Also sync into legacy `interviews` calendar table for CRM calendar integration
      await db.run(
        `INSERT INTO interviews (id, candidateId, candidateName, jobId, jobTitle, company, date, time, platform, status, meetingLink, panelists, roundType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [roundId, candidateId, candidateName || '', jobId, jobTitle, companyName, interviewDate, interviewTime, interviewMode, status, meetingLink, interviewerName, roundName]
      ).catch(() => {});

      const isReschedule = Boolean(existingRound || status === 'Rescheduled');
      await addActivityAndNotify(db, {
        candidateId,
        candidateName,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: isReschedule ? 'Interview Rescheduled' : 'Interview Scheduled',
        previousStatus: existingRound?.status || 'Interview Pending',
        newStatus: status,
        remarks: `${roundName} on ${interviewDate} at ${interviewTime} (${interviewMode})`,
        notifyTitle: isReschedule ? 'Interview Rescheduled' : 'Interview Scheduled',
        notifyMessage: `${roundName} for ${candidateName || candidateId} scheduled on ${interviewDate} at ${interviewTime} (${interviewMode}).`,
        targetRole: 'All'
      });

      const saved = await db.get('SELECT * FROM interview_rounds WHERE id = ?', [roundId]);
      res.status(201).json({ success: true, round: saved });
    } catch (err) {
      console.error('Schedule interview error:', err);
      res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
    }
  });

  // 5. Update Interview Round Status (blocks marking Completed without evaluation!)
  app.patch('/api/interview-placement/interviews/:roundId/status', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { roundId } = req.params;
      const { status, candidateName } = req.body || {};
      const actor = getActor(req);
      const now = new Date().toISOString();

      const round = await db.get('SELECT * FROM interview_rounds WHERE id = ?', [roundId]);
      if (!round) {
        return res.status(404).json({ success: false, message: 'Interview round not found.' });
      }

      if (status === 'Completed' && !round.finalRecommendation) {
        return res.status(400).json({
          success: false,
          message: 'Interview evaluation is mandatory before marking the interview as Completed.'
        });
      }

      await db.run('UPDATE interview_rounds SET status = ?, updatedAt = ? WHERE id = ?', [status, now, roundId]);
      await db.run('UPDATE recruitment_pipeline_records SET interviewStatus = ?, updatedAt = ? WHERE candidateId = ?', [status, now, round.candidateId]);

      await addActivityAndNotify(db, {
        candidateId: round.candidateId,
        candidateName: candidateName || round.candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Interview Status Changed to ${status}`,
        previousStatus: round.status,
        newStatus: status
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Update interview status error:', err);
      res.status(500).json({ success: false, message: 'Failed to update interview status.' });
    }
  });

  // 6. Submit Mandatory Interview Evaluation & Auto-Advance Workflow
  app.post('/api/interview-placement/interviews/:roundId/evaluate', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { roundId } = req.params;
      const {
        candidateName,
        scoreCommunication,
        scoreTechnical,
        scoreJobKnowledge,
        scoreExperience,
        scoreProblemSolving,
        scoreConfidence,
        scoreOverall,
        strengths = '',
        areasOfImprovement = '',
        interviewerRemarks = '',
        finalRecommendation
      } = req.body || {};

      const scores = [
        Number(scoreCommunication),
        Number(scoreTechnical),
        Number(scoreJobKnowledge),
        Number(scoreExperience),
        Number(scoreProblemSolving),
        Number(scoreConfidence),
        Number(scoreOverall)
      ];
      if (scores.some((s) => Number.isNaN(s) || s < 1 || s > 5)) {
        return res.status(400).json({ success: false, message: 'All 7 evaluation criteria must be rated between 1 and 5.' });
      }
      const validRecs = ['Selected', 'Rejected', 'On Hold', 'Second Round Required', 'Re-interview Required'];
      if (!validRecs.includes(finalRecommendation)) {
        return res.status(400).json({ success: false, message: 'Valid Final Recommendation is required.' });
      }

      const round = await db.get('SELECT * FROM interview_rounds WHERE id = ?', [roundId]);
      if (!round) {
        return res.status(404).json({ success: false, message: 'Interview round not found.' });
      }

      const avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
      const actor = getActor(req);
      const now = new Date().toISOString();

      await db.run(
        `UPDATE interview_rounds SET
          status = 'Completed',
          scoreCommunication = ?, scoreTechnical = ?, scoreJobKnowledge = ?,
          scoreExperience = ?, scoreProblemSolving = ?, scoreConfidence = ?, scoreOverall = ?,
          averageScore = ?, strengths = ?, areasOfImprovement = ?,
          interviewerRemarks = ?, finalRecommendation = ?, evaluatedBy = ?, evaluatedAt = ?, updatedAt = ?
         WHERE id = ?`,
        [
          scores[0], scores[1], scores[2], scores[3], scores[4], scores[5], scores[6],
          avg, strengths, areasOfImprovement, interviewerRemarks, finalRecommendation,
          actor.employeeName, now, now, roundId
        ]
      );

      // Workflow routing based on Final Recommendation
      let newPipelineStage = 'Interview Completed';
      let notifyTitle = 'Interview Evaluation Submitted';
      let notifyMessage = `${candidateName || round.candidateId} evaluated: ${finalRecommendation} (Score ${avg}/5).`;
      let targetRole = 'All';

      if (finalRecommendation === 'Selected') {
        newPipelineStage = 'Placement Coordinator Review';
        notifyTitle = 'Candidate Selected — Moved to Placement Coordinator';
        notifyMessage = `${candidateName || round.candidateId} passed the interview (${avg}/5) and is now in Placement Coordinator Review.`;
        targetRole = 'Placement Coordinator';
      } else if (finalRecommendation === 'Rejected') {
        newPipelineStage = 'Rejected';
        notifyTitle = 'Candidate Rejected in Interview';
        notifyMessage = `${candidateName || round.candidateId} was marked Rejected. Remarks: ${interviewerRemarks}`;
      } else if (finalRecommendation === 'On Hold') {
        newPipelineStage = 'On Hold';
      } else if (finalRecommendation === 'Second Round Required' || finalRecommendation === 'Re-interview Required') {
        newPipelineStage = 'Interview Pending';
      }

      await db.run(
        `UPDATE recruitment_pipeline_records SET
          interviewStatus = ?,
          latestInterviewResult = ?,
          latestInterviewScore = ?,
          pipelineStage = ?,
          rejectionReason = ?,
          updatedAt = ?
         WHERE candidateId = ?`,
        [
          finalRecommendation,
          finalRecommendation,
          avg,
          newPipelineStage,
          finalRecommendation === 'Rejected' ? interviewerRemarks : '',
          now,
          round.candidateId
        ]
      );

      await addActivityAndNotify(db, {
        candidateId: round.candidateId,
        candidateName: candidateName || round.candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Interview Evaluation: ${finalRecommendation}`,
        previousStatus: round.status,
        newStatus: newPipelineStage,
        remarks: `Avg Score: ${avg}/5. ${interviewerRemarks}`,
        notifyTitle,
        notifyMessage,
        targetRole
      });

      res.json({ success: true, averageScore: avg, newPipelineStage });
    } catch (err) {
      console.error('Evaluate interview error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit interview evaluation.' });
    }
  });

  // 7. Placement Coordinator Decision (Approve / Hold / Return for Re-interview / Reject)
  app.post('/api/interview-placement/placement/:candidateId/decision', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.params;
      const { decision, remarks = '', candidateName = '' } = req.body || {};

      const valid = ['Approved for Company Submission', 'On Hold', 'Return for Re-interview', 'Rejected'];
      if (!valid.includes(decision)) {
        return res.status(400).json({ success: false, message: 'Invalid placement decision.' });
      }
      if (!String(remarks).trim()) {
        return res.status(400).json({ success: false, message: 'Remarks are required for every placement decision.' });
      }

      const existing = await db.get('SELECT * FROM recruitment_pipeline_records WHERE candidateId = ?', [candidateId]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Candidate workflow record not found.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();

      let nextStage = decision;
      let nextInterviewStatus = existing.interviewStatus;
      if (decision === 'Return for Re-interview') {
        nextStage = 'Interview Pending';
        nextInterviewStatus = 'Re-interview Required';
      } else if (decision === 'Rejected') {
        nextStage = 'Rejected';
      } else if (decision === 'On Hold') {
        nextStage = 'On Hold';
      }

      await db.run(
        `UPDATE recruitment_pipeline_records SET
          placementDecision = ?,
          placementRemarks = ?,
          placementDecidedBy = ?,
          placementDecidedAt = ?,
          pipelineStage = ?,
          interviewStatus = ?,
          assignedCoordinatorName = COALESCE(NULLIF(assignedCoordinatorName, ''), ?),
          rejectionReason = ?,
          updatedAt = ?
         WHERE candidateId = ?`,
        [
          decision,
          remarks.trim(),
          actor.employeeName,
          now,
          nextStage,
          nextInterviewStatus,
          actor.employeeName,
          decision === 'Rejected' ? remarks.trim() : existing.rejectionReason,
          now,
          candidateId
        ]
      );

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candidateName || candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Placement Review Decision: ${decision}`,
        previousStatus: existing.pipelineStage,
        newStatus: nextStage,
        remarks: remarks.trim()
      });

      res.json({ success: true, pipelineStage: nextStage });
    } catch (err) {
      console.error('Placement decision error:', err);
      res.status(500).json({ success: false, message: 'Failed to record placement decision.' });
    }
  });

  // 8. Employer / Company Submission
  app.post('/api/interview-placement/placement/:candidateId/submissions', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.params;
      const {
        candidateName = '',
        companyName,
        employerContactName = '',
        employerEmail = '',
        jobTitle,
        jobLocation = '',
        proposedSalary = '',
        submissionDate,
        submissionRemarks = '',
        consentRecorded = true,
        status = 'Submitted'
      } = req.body || {};

      if (!companyName || !jobTitle) {
        return res.status(400).json({ success: false, message: 'Company Name and Job Title are required.' });
      }
      if (!consentRecorded) {
        return res.status(400).json({ success: false, message: 'Candidate consent must be recorded before company submission.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();
      const subId = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.run(
        `INSERT INTO employer_submissions (
          id, candidateId, companyName, employerContactName, employerEmail,
          jobTitle, jobLocation, proposedSalary, submissionDate, submissionRemarks,
          consentRecorded, status, submittedBy, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subId, candidateId, companyName, employerContactName, employerEmail,
          jobTitle, jobLocation, proposedSalary, submissionDate || now.slice(0, 10),
          submissionRemarks, consentRecorded ? 1 : 0, status, actor.employeeName, now, now
        ]
      );

      await db.run(
        `UPDATE recruitment_pipeline_records SET pipelineStage = 'Submitted to Employer', updatedAt = ? WHERE candidateId = ?`,
        [now, candidateId]
      );

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candidateName || candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Submitted to Employer: ${companyName}`,
        previousStatus: 'Approved for Company Submission',
        newStatus: 'Submitted to Employer',
        remarks: `${jobTitle} (${jobLocation}) — ${submissionRemarks}`,
        notifyTitle: 'Employer Submission Completed',
        notifyMessage: `${candidateName || candidateId} submitted to ${companyName} for ${jobTitle}.`
      });

      const created = await db.get('SELECT * FROM employer_submissions WHERE id = ?', [subId]);
      res.status(201).json({ success: true, submission: created });
    } catch (err) {
      console.error('Company submission error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit candidate to employer.' });
    }
  });

  app.patch('/api/interview-placement/submissions/:subId/status', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { subId } = req.params;
      const { status, candidateName = '' } = req.body || {};
      const actor = getActor(req);
      const now = new Date().toISOString();

      const sub = await db.get('SELECT * FROM employer_submissions WHERE id = ?', [subId]);
      if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

      await db.run('UPDATE employer_submissions SET status = ?, updatedAt = ? WHERE id = ?', [status, now, subId]);

      if (status === 'Selected by Employer') {
        await db.run(`UPDATE recruitment_pipeline_records SET pipelineStage = 'Employer Selected', updatedAt = ? WHERE candidateId = ?`, [now, sub.candidateId]);
      } else if (status === 'Interview Scheduled') {
        await db.run(`UPDATE recruitment_pipeline_records SET pipelineStage = 'Employer Interview', updatedAt = ? WHERE candidateId = ?`, [now, sub.candidateId]);
      }

      await addActivityAndNotify(db, {
        candidateId: sub.candidateId,
        candidateName: candidateName || sub.candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Employer Submission Status: ${status}`,
        previousStatus: sub.status,
        newStatus: status,
        remarks: `${sub.companyName} — ${sub.jobTitle}`
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Submission status error:', err);
      res.status(500).json({ success: false, message: 'Failed to update submission status.' });
    }
  });

  // 9. Employer Interview Scheduling & Feedback
  app.post('/api/interview-placement/placement/:candidateId/employer-interviews', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.params;
      const {
        candidateName = '',
        submissionId = '',
        companyName,
        jobRole,
        interviewRound = 'Round 1',
        employerInterviewer = '',
        interviewDate,
        interviewTime,
        interviewMode = 'Online',
        meetingLink = '',
        instructions = ''
      } = req.body || {};

      if (!companyName || !jobRole || !interviewDate || !interviewTime) {
        return res.status(400).json({ success: false, message: 'Company, Job Role, Date, and Time are required.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();
      const eiId = `EINT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.run(
        `INSERT INTO employer_interviews (
          id, candidateId, submissionId, companyName, jobRole, interviewRound,
          employerInterviewer, interviewDate, interviewTime, interviewMode,
          meetingLink, instructions, feedback, createdBy, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Awaiting Feedback', ?, ?, ?)`,
        [eiId, candidateId, submissionId, companyName, jobRole, interviewRound, employerInterviewer, interviewDate, interviewTime, interviewMode, meetingLink, instructions, actor.employeeName, now, now]
      );

      await db.run(`UPDATE recruitment_pipeline_records SET pipelineStage = 'Employer Interview', updatedAt = ? WHERE candidateId = ?`, [now, candidateId]);

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candidateName || candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Employer Interview Scheduled (${companyName})`,
        previousStatus: 'Submitted to Employer',
        newStatus: 'Employer Interview',
        remarks: `${interviewRound} on ${interviewDate} at ${interviewTime}`,
        notifyTitle: 'Employer Interview Scheduled',
        notifyMessage: `Employer interview with ${companyName} scheduled for ${candidateName || candidateId} on ${interviewDate}.`
      });

      const created = await db.get('SELECT * FROM employer_interviews WHERE id = ?', [eiId]);
      res.status(201).json({ success: true, employerInterview: created });
    } catch (err) {
      console.error('Employer interview error:', err);
      res.status(500).json({ success: false, message: 'Failed to schedule employer interview.' });
    }
  });

  app.patch('/api/interview-placement/employer-interviews/:eiId/feedback', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { eiId } = req.params;
      const { feedback, feedbackNotes = '', nextInterviewDate = '', candidateName = '' } = req.body || {};
      const actor = getActor(req);
      const now = new Date().toISOString();

      const ei = await db.get('SELECT * FROM employer_interviews WHERE id = ?', [eiId]);
      if (!ei) return res.status(404).json({ success: false, message: 'Employer interview not found.' });

      await db.run(
        `UPDATE employer_interviews SET feedback = ?, feedbackNotes = ?, nextInterviewDate = ?, updatedAt = ? WHERE id = ?`,
        [feedback, feedbackNotes, nextInterviewDate, now, eiId]
      );

      if (feedback === 'Selected') {
        await db.run(`UPDATE recruitment_pipeline_records SET pipelineStage = 'Employer Selected', updatedAt = ? WHERE candidateId = ?`, [now, ei.candidateId]);
      } else if (feedback === 'Rejected') {
        await db.run(`UPDATE recruitment_pipeline_records SET pipelineStage = 'Rejected', rejectionReason = ?, updatedAt = ? WHERE candidateId = ?`, [feedbackNotes, now, ei.candidateId]);
      }

      await addActivityAndNotify(db, {
        candidateId: ei.candidateId,
        candidateName: candidateName || ei.candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Employer Feedback: ${feedback}`,
        previousStatus: ei.feedback,
        newStatus: feedback,
        remarks: feedbackNotes,
        notifyTitle: 'Employer Feedback Received',
        notifyMessage: `${ei.companyName} feedback for ${candidateName || ei.candidateId}: ${feedback}.`
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Employer feedback error:', err);
      res.status(500).json({ success: false, message: 'Failed to record employer feedback.' });
    }
  });

  // 10. Offer & Placement Management (Joining Confirmation required for Successfully Placed)
  app.post('/api/interview-placement/placement/:candidateId/offers', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.params;
      const {
        candidateName = '',
        submissionId = '',
        offeredJobRole,
        companyName,
        salary = '',
        currency = 'AED',
        benefits = '',
        offerReleaseDate,
        offerExpiryDate = '',
        joiningDate = '',
        offerLetterRef = '',
        candidateAcceptance = 'Pending',
        offerStatus = 'Released',
        finalPlacementStatus = 'Placement In Progress'
      } = req.body || {};

      if (!offeredJobRole || !companyName) {
        return res.status(400).json({ success: false, message: 'Offered Job Role and Company Name are required.' });
      }

      const actor = getActor(req);
      const now = new Date().toISOString();
      const offerId = `OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Enforce rule: do not mark Successfully Placed unless joining is confirmed
      const safeFinalStatus = finalPlacementStatus === 'Successfully Placed' ? 'Awaiting Joining' : finalPlacementStatus;

      await db.run(
        `INSERT INTO placement_offers (
          id, candidateId, submissionId, offeredJobRole, companyName, salary, currency,
          benefits, offerReleaseDate, offerExpiryDate, joiningDate, offerLetterRef,
          candidateAcceptance, offerStatus, finalPlacementStatus, createdBy, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          offerId, candidateId, submissionId, offeredJobRole, companyName, salary, currency,
          benefits, offerReleaseDate || now.slice(0, 10), offerExpiryDate, joiningDate, offerLetterRef,
          candidateAcceptance, offerStatus, safeFinalStatus, actor.employeeName, now, now
        ]
      );

      const nextStage = offerStatus === 'Released' ? 'Offer Released' : 'Employer Selected';
      await db.run(
        `UPDATE recruitment_pipeline_records SET pipelineStage = ?, finalPlacementStatus = ?, updatedAt = ? WHERE candidateId = ?`,
        [nextStage, safeFinalStatus, now, candidateId]
      );

      await addActivityAndNotify(db, {
        candidateId,
        candidateName: candidateName || candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: `Offer ${offerStatus}: ${offeredJobRole} at ${companyName}`,
        previousStatus: 'Employer Selected',
        newStatus: nextStage,
        remarks: `${salary} ${currency} • Joining: ${joiningDate || 'TBD'}`,
        notifyTitle: 'Offer Released',
        notifyMessage: `Offer released for ${candidateName || candidateId} at ${companyName} (${offeredJobRole}).`
      });

      const created = await db.get('SELECT * FROM placement_offers WHERE id = ?', [offerId]);
      res.status(201).json({ success: true, offer: created });
    } catch (err) {
      console.error('Create offer error:', err);
      res.status(500).json({ success: false, message: 'Failed to create offer.' });
    }
  });

  app.patch('/api/interview-placement/offers/:offerId', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { offerId } = req.params;
      const { offerStatus, candidateAcceptance, finalPlacementStatus, joiningConfirmed, candidateName = '' } = req.body || {};
      const actor = getActor(req);
      const now = new Date().toISOString();

      const offer = await db.get('SELECT * FROM placement_offers WHERE id = ?', [offerId]);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

      const nextOfferStatus = offerStatus || offer.offerStatus;
      const nextAcceptance = candidateAcceptance || offer.candidateAcceptance;
      let nextFinalStatus = finalPlacementStatus || offer.finalPlacementStatus;

      if (nextFinalStatus === 'Successfully Placed' && !joiningConfirmed && nextFinalStatus !== 'Joined') {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark candidate as Successfully Placed until actual joining is confirmed.'
        });
      }

      const joiningConfirmedAt = (joiningConfirmed || nextFinalStatus === 'Joined' || nextFinalStatus === 'Successfully Placed')
        ? (offer.joiningConfirmedAt || now)
        : offer.joiningConfirmedAt;

      if (joiningConfirmed) {
        nextFinalStatus = 'Successfully Placed';
      }

      await db.run(
        `UPDATE placement_offers SET
          offerStatus = ?, candidateAcceptance = ?, finalPlacementStatus = ?, joiningConfirmedAt = ?, updatedAt = ?
         WHERE id = ?`,
        [nextOfferStatus, nextAcceptance, nextFinalStatus, joiningConfirmedAt, now, offerId]
      );

      let nextPipelineStage = 'Offer Released';
      if (nextFinalStatus === 'Successfully Placed' || nextFinalStatus === 'Joined') {
        nextPipelineStage = 'Successfully Placed';
      } else if (nextAcceptance === 'Accepted' || nextFinalStatus === 'Awaiting Joining') {
        nextPipelineStage = 'Joining Pending';
      }

      await db.run(
        `UPDATE recruitment_pipeline_records SET pipelineStage = ?, finalPlacementStatus = ?, updatedAt = ? WHERE candidateId = ?`,
        [nextPipelineStage, nextFinalStatus, now, offer.candidateId]
      );

      await addActivityAndNotify(db, {
        candidateId: offer.candidateId,
        candidateName: candidateName || offer.candidateId,
        employeeName: actor.employeeName,
        employeeRole: actor.employeeRole,
        action: joiningConfirmed ? 'Joining Confirmed — Successfully Placed' : `Offer Updated: ${nextOfferStatus} / ${nextFinalStatus}`,
        previousStatus: offer.finalPlacementStatus,
        newStatus: nextPipelineStage,
        remarks: `${offer.companyName} — ${offer.offeredJobRole}`,
        notifyTitle: joiningConfirmed ? 'Joining Confirmed!' : undefined,
        notifyMessage: joiningConfirmed ? `${candidateName || offer.candidateId} has joined ${offer.companyName} and is marked Successfully Placed.` : undefined
      });

      res.json({ success: true, pipelineStage: nextPipelineStage, finalPlacementStatus: nextFinalStatus });
    } catch (err) {
      console.error('Update offer error:', err);
      res.status(500).json({ success: false, message: 'Failed to update offer status.' });
    }
  });

  // 11. Activity History & Notifications
  app.get('/api/interview-placement/activity', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      const { candidateId } = req.query || {};
      const logs = candidateId
        ? await db.all('SELECT * FROM recruitment_activity_logs WHERE candidateId = ? ORDER BY createdAt DESC LIMIT 100', [candidateId])
        : await db.all('SELECT * FROM recruitment_activity_logs ORDER BY createdAt DESC LIMIT 100');
      const notifications = await db.all('SELECT * FROM recruitment_notifications ORDER BY createdAt DESC LIMIT 50');
      res.json({ success: true, logs, notifications });
    } catch (err) {
      console.error('Activity log error:', err);
      res.status(500).json({ success: false, message: 'Failed to load activity history.' });
    }
  });

  app.post('/api/interview-placement/notifications/mark-read', async (req, res) => {
    try {
      const db = await getDb();
      await ensureTables(db);
      await db.run('UPDATE recruitment_notifications SET isRead = 1');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  });
};

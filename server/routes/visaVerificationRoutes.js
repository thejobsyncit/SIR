import express from 'express';
import { getDb } from '../database.js';

export const visaVerificationRouter = express.Router();

// Supported Countries Matrix
const VISA_COUNTRIES_MATRIX = [
  {
    country: 'UAE',
    countryCode: 'AE',
    flag: '🇦🇪',
    visaTypes: ['MOHRE Standard Employment Visa', 'MOHRE Green Visa (5-Year Self-Sponsored)', 'Executive Golden Visa (10-Year)'],
    governingBody: 'Ministry of Human Resources and Emiratisation (MOHRE) & ICP',
    minimumQualification: 'High School Diploma (Skill Level 4-5) / Bachelor\'s Degree (Skill Level 1-2)',
    minimumExperience: '2 - 5 Years depending on skill tier',
    attestationRequirements: ['State HRD', 'Ministry of External Affairs (MEA)', 'UAE Embassy', 'MOFA UAE Digital Stamp'],
    medicalRequirements: ['Blood Test (HIV/Hepatitis B/VDRL)', 'Chest X-Ray (Tuberculosis Screening)'],
    processingTime: '7 - 14 Working Days',
    costPayer: 'Employer-Sponsored under UAE Labour Law (Zero Candidate Fee)',
    keyDeliverables: ['MOHRE Offer Letter', 'Entry Permit Ingress', 'Medical Fitness Certificate', 'Emirates ID Biometrics', 'Residency Stamping']
  },
  {
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    visaTypes: ['Saudi Work Visa (Iqama)', 'Premium Residency (Gold/Silver)', 'Temporary Work Visa'],
    governingBody: 'Ministry of Human Resources and Social Development (MHRSD) & Qiwa',
    minimumQualification: 'Bachelor\'s Degree accredited and attested by Saudi Cultural Mission',
    minimumExperience: '3+ Years relevant field experience',
    attestationRequirements: ['State HRD', 'MEA Apostille/Attestation', 'Saudi Cultural Attaché (SACM)', 'Saudi Embassy Stamping'],
    medicalRequirements: ['GAMCA / Wafid Approved Medical Examination'],
    processingTime: '15 - 25 Working Days',
    costPayer: 'Employer-Sponsored under Saudi Labor Law',
    keyDeliverables: ['Qiwa Digital Contract', 'Enjaz Visa Slip', 'Wafid Medical Fitness', 'Iqama Work Residency Issuance']
  },
  {
    country: 'Qatar',
    countryCode: 'QA',
    flag: '🇶🇦',
    visaTypes: ['Qatar Private Sector Work Residence Permit', 'Executive Specialist Visa'],
    governingBody: 'Ministry of Labour (MOL) & Ministry of Interior (MOI)',
    minimumQualification: 'Bachelor\'s Degree with official transcripts',
    minimumExperience: '2+ Years verified experience',
    attestationRequirements: ['State HRD', 'MEA Central Attestation', 'Qatar Embassy Attestation', 'MOFA Qatar Digital Stamping'],
    medicalRequirements: ['Qatar Visa Center (QVC) Biometrics & Medical Test'],
    processingTime: '10 - 20 Working Days',
    costPayer: 'Employer-Sponsored under Qatar Labour Law',
    keyDeliverables: ['MOL Approved Work Contract', 'QVC Clearance Certificate', 'Qatar ID (QID) Issuance']
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    visaTypes: ['EU Blue Card Germany', 'Skilled Immigration Act (Fachkräfteeinwanderungsgesetz)', 'Opportunity Card (Chancenkarte)'],
    governingBody: 'Federal Employment Agency (Bundesagentur für Arbeit) & Ausländerbehörde',
    minimumQualification: 'Recognized University Degree (ZAB / Anabin H+ comparable rating)',
    minimumExperience: '2+ Years in professional IT, Engineering, Healthcare or Business',
    attestationRequirements: ['Hague Apostille on Degrees & Transcripts', 'ZAB Statement of Comparability', 'Sworn German Translation'],
    medicalRequirements: ['Statutory German Health Insurance (Krankenversicherung)'],
    processingTime: '4 - 8 Weeks',
    costPayer: 'Standard Candidate Application Fee + Employer Relocation Bonus',
    keyDeliverables: ['Anabin H+ University Equivalence', 'Federal Labour Agency Approval (Vorabzustimmung)', 'German National D Visa Stamping']
  },
  {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    visaTypes: ['UK Skilled Worker Visa (Points-Based System)', 'Health and Care Worker Visa', 'Scale-up Worker Visa'],
    governingBody: 'UK Home Office & UK Visas and Immigration (UKVI)',
    minimumQualification: 'RQF Level 3+ (Equivalent to UK A-levels or Bachelor\'s Degree)',
    minimumExperience: 'Eligible Job Code (SOC Code) alignment + 2-5 Years experience',
    attestationRequirements: ['UK ENIC Statement of Comparability', 'IELTS for UKVI (B1/B2 Level)'],
    medicalRequirements: ['UKVI Approved TB (Tuberculosis) Screening'],
    processingTime: '3 - 6 Weeks (Priority Available)',
    costPayer: 'Licensed UK Sponsor (CoS) + Candidate Visa Fee / Immigration Health Surcharge',
    keyDeliverables: ['Certificate of Sponsorship (CoS)', 'English Language Proof (SELT)', 'UK Biometric Residence Permit (BRP)']
  },
  {
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    visaTypes: ['Employment Pass (EP - COMPASS Framework)', 'S Pass (Mid-Level Technical)', 'Overseas Networks & Expertise Pass (ONE Pass)'],
    governingBody: 'Ministry of Manpower (MOM)',
    minimumQualification: 'Recognized Bachelor\'s Degree from accredited institution',
    minimumExperience: '2 - 7 Years depending on candidate age and qualifying salary',
    attestationRequirements: ['MOM-Approved Background Screening Report (DataFlow / Sterling / Revival Certified)'],
    medicalRequirements: ['In-country Singapore MOM Medical Examination & HIV screening'],
    processingTime: '10 - 21 Working Days',
    costPayer: 'Employer-Sponsored under Singapore Employment Act',
    keyDeliverables: ['COMPASS Points Clearance (Min 40 Pts)', 'In-Principle Approval (IPA) Letter', 'Singapore EP Card Biometrics']
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    visaTypes: ['Federal Skilled Worker (Express Entry CRS)', 'Global Talent Stream (LMIA-Exempt / 2-Week Processing)', 'Provincial Nominee Program (PNP)'],
    governingBody: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    minimumQualification: 'Post-Secondary Credential with WES (World Education Services) ECA',
    minimumExperience: '1+ Years continuous full-time skilled work experience (TEER 0, 1, 2, or 3)',
    attestationRequirements: ['Educational Credential Assessment (ECA) by WES / ICAS', 'IELTS General / CELPIP Score'],
    medicalRequirements: ['IRCC Approved Panel Physician Examination'],
    processingTime: '2 Weeks (Global Talent) to 6 Months (Express Entry)',
    costPayer: 'Employer LMIA Sponsorship or Candidate Express Entry Pool',
    keyDeliverables: ['WES ECA Report', 'Language Benchmark (CLB 7+)', 'Invitation to Apply (ITA) / Work Permit Approval']
  }
];

// Helper: Calculate Visa Points & Requirements
function calculateVisaPoints(params) {
  const { country = 'UAE', qualification = "Bachelor's Degree", experience = '5', age = 30, language = 'English (Fluent)' } = params;
  
  const target = country.toLowerCase();
  const ageVal = parseInt(age) || 30;
  const expVal = parseInt(experience) || 2;
  const qualStr = (qualification || '').toLowerCase();
  const langStr = (language || '').toLowerCase();

  let baseScore = 20;
  const reasons = [];
  const missingQualifications = [];
  const recommendedNextSteps = [];

  // 1. Age Calculation
  let ageScore = 0;
  if (ageVal < 18) {
    return {
      score: 0,
      status: 'Not Eligible',
      readiness: 'Below Legal Working Age',
      targetCountry: country,
      reasons: ['Applicant is under 18 years of age. International labour regulations require a minimum age of 18 for overseas employment sponsorship.'],
      missingQualifications: ['Applicant must attain minimum age of 18 years.'],
      recommendedNextSteps: ['Wait until attaining legal working age before initiating overseas employment applications.'],
      checklist: []
    };
  }

  if (target === 'canada') {
    if (ageVal >= 20 && ageVal <= 29) {
      ageScore = 30;
      reasons.push('Peak CRS Age Bracket (20-29): Maximum 30 points awarded under Express Entry criteria.');
    } else if (ageVal >= 30 && ageVal <= 44) {
      ageScore = Math.max(10, 30 - (ageVal - 29) * 2);
      reasons.push(`Age ${ageVal}: Express Entry awards ${ageScore} age points (-2 pts/year after age 29).`);
    } else {
      ageScore = 5;
      reasons.push('Age 45+: Reduced CRS age allocation; requires high educational credentials or Provincial Nomination.');
    }
  } else if (target === 'united kingdom' || target === 'uk') {
    if (ageVal <= 25) {
      ageScore = 25;
      reasons.push('New Entrant Skilled Worker Bracket: Eligible for 30% reduced salary threshold.');
    } else if (ageVal <= 45) {
      ageScore = 25;
      reasons.push('Prime Employment Demographics: Full compliance with Home Office skilled worker criteria.');
    } else {
      ageScore = 15;
      reasons.push('Standard Age Eligibility: Fully eligible with standard Certificate of Sponsorship (CoS).');
    }
  } else if (target === 'germany') {
    if (ageVal <= 45) {
      ageScore = 25;
      reasons.push('Optimal EU Blue Card Demographic: Standard statutory pension threshold applies.');
    } else {
      ageScore = 15;
      reasons.push('Age over 45 requires minimum gross annual salary of €49,830 or proof of adequate retirement pension.');
    }
  } else {
    // GCC (UAE, Saudi, Qatar) & Singapore
    if (ageVal >= 21 && ageVal <= 50) {
      ageScore = 25;
      reasons.push('Optimal Prime Working Age: Fully compliant with GCC Ministry of Labour quotas.');
    } else if (ageVal <= 58) {
      ageScore = 20;
      reasons.push('Standard Eligible Age Bracket: Valid for standard executive and professional work permits.');
    } else {
      ageScore = 12;
      reasons.push('Senior Candidate Demographic: May require ministerial exemption or executive tier designation.');
    }
  }

  // 2. Qualification Calculation
  let qualScore = 15;
  if (qualStr.includes('doctorate') || qualStr.includes('phd')) {
    qualScore = 30;
    reasons.push('Doctorate / PhD: Highest educational credential tier recognized globally.');
  } else if (qualStr.includes('master')) {
    qualScore = 28;
    reasons.push("Master's Degree: Qualifies for Tier-1 professional designations and expedited visa quotas.");
  } else if (qualStr.includes('bachelor')) {
    qualScore = 25;
    reasons.push("Bachelor's Degree: Fulfills international baseline university degree requirements.");
  } else if (qualStr.includes('diploma')) {
    qualScore = 18;
    reasons.push('Post-Secondary Diploma: Qualifies for specialized technical, supervisory, and trade roles.');
    if (target === 'germany' || target === 'canada') {
      missingQualifications.push('University degree comparability (ZAB/WES) recommended for expedited professional clearance.');
    }
  } else {
    qualScore = 12;
    reasons.push('Vocational / High School: Requires employer special exemption or operational skill category.');
    missingQualifications.push('Higher educational credentials (Diploma or Degree) enhance visa approval prospects.');
  }

  // 3. Experience Calculation
  let expScore = 10;
  if (expVal >= 10) {
    expScore = 25;
    reasons.push(`${expVal}+ Years Experience: Veteran career profile qualifying for senior and leadership roles.`);
  } else if (expVal >= 5) {
    expScore = 22;
    reasons.push(`${expVal} Years Experience: Senior mid-level professional fulfilling skilled worker thresholds.`);
  } else if (expVal >= 3) {
    expScore = 18;
    reasons.push(`${expVal} Years Experience: Standard professional experience baseline met.`);
  } else if (expVal >= 1) {
    expScore = 14;
    reasons.push(`${expVal} Year Experience: Junior professional level; qualifies under entry-level employer quotas.`);
  } else {
    expScore = 8;
    reasons.push('Fresh Graduate / Entry Level: Requires specific graduate trainee or new entrant visa allocation.');
    missingQualifications.push('Additional verified employment history will elevate overall points rating.');
  }

  // 4. Language Calculation
  let langScore = 12;
  if (langStr.includes('native') || langStr.includes('fluent') || langStr.includes('advanced')) {
    langScore = 20;
    reasons.push('Advanced / Fluent Language Proficiency: Maximum communication rating achieved.');
  } else if (langStr.includes('conversational') || langStr.includes('intermediate')) {
    langScore = 16;
    reasons.push('Conversational Language Proficiency: Meets general employment workplace standards.');
  } else {
    langScore = 10;
    reasons.push('Basic Language Proficiency: Standard employer-assisted visa pathways applicable.');
    recommendedNextSteps.push('Prepare for IELTS / DET / OET language testing to maximize points and licensing speed.');
  }

  const score = Math.max(15, Math.min(100, baseScore + ageScore + qualScore + expScore + langScore));

  let status = 'Conditional Eligibility';
  let readiness = 'Documentation Pending';

  if (score >= 85) {
    status = 'Highly Eligible';
    readiness = 'Immediate Work Permit Ready';
  } else if (score >= 70) {
    status = 'Eligible (Standard Pathway)';
    readiness = 'Compliant for Employer Sponsorship';
  } else if (score >= 50) {
    status = 'Conditional Eligibility';
    readiness = 'Pending Document Attestation / Language Benchmark';
  } else {
    status = 'Low Eligibility';
    readiness = 'Additional Qualifications Recommended';
  }

  // Next steps recommendations
  recommendedNextSteps.unshift('Submit educational credentials for State HRD and Consular Attestation.');
  recommendedNextSteps.push('Obtain certified Police Clearance Certificate (PCC) valid within 6 months.');
  recommendedNextSteps.push('Verify international passport validity (must have minimum 6 months validity remaining).');

  const countryInfo = VISA_COUNTRIES_MATRIX.find(c => c.country.toLowerCase() === target) || VISA_COUNTRIES_MATRIX[0];

  return {
    score,
    status,
    readiness,
    targetCountry: countryInfo.country,
    countryData: countryInfo,
    reasons,
    missingQualifications,
    recommendedNextSteps,
    checklist: countryInfo.keyDeliverables,
    processingTime: countryInfo.processingTime,
    costPayer: countryInfo.costPayer,
    governingBody: countryInfo.governingBody,
    calculatedAt: new Date().toISOString()
  };
}

// 1. GET /api/visa/countries-matrix
visaVerificationRouter.get('/countries-matrix', (req, res) => {
  res.json({
    success: true,
    data: VISA_COUNTRIES_MATRIX,
    countries: VISA_COUNTRIES_MATRIX
  });
});

// 2. POST /api/visa/check
visaVerificationRouter.post('/check', async (req, res) => {
  try {
    const { country, qualification, experience, age, language, candidateId, candidateEmail, candidateName } = req.body;
    const authCandidateId = req.headers['x-candidate-id'] || candidateId || null;
    const authCandidateEmail = req.headers['x-candidate-email'] || candidateEmail || null;

    const evaluation = calculateVisaPoints({ country, qualification, experience, age, language });

    // If candidate is identified, persist assessment to database
    if (authCandidateId || authCandidateEmail) {
      try {
        const db = await getDb();
        const assessmentId = `VASS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        
        // Check if an existing assessment exists for this candidate
        const existing = await db.get(
          'SELECT id FROM candidate_visa_assessments WHERE candidateId = ? OR candidateEmail = ? ORDER BY createdAt DESC LIMIT 1',
          [authCandidateId, authCandidateEmail]
        );

        if (existing && existing.id) {
          await db.run(
            `UPDATE candidate_visa_assessments SET
              targetCountry = ?,
              qualification = ?,
              experience = ?,
              dob = ?,
              language = ?,
              score = ?,
              status = ?,
              readiness = ?,
              reasons = ?,
              checklist = ?,
              updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
              evaluation.targetCountry,
              qualification,
              String(experience),
              String(age),
              language,
              evaluation.score,
              evaluation.status,
              evaluation.readiness,
              JSON.stringify(evaluation.reasons),
              JSON.stringify(evaluation.checklist),
              existing.id
            ]
          );
          evaluation.assessmentId = existing.id;
        } else {
          await db.run(
            `INSERT INTO candidate_visa_assessments (
              id, candidateId, candidateEmail, candidateName, targetCountry,
              qualification, experience, dob, language, score, status, readiness,
              reasons, checklist, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              assessmentId,
              authCandidateId || 'GUEST',
              authCandidateEmail || 'guest@example.com',
              candidateName || 'Candidate',
              evaluation.targetCountry,
              qualification,
              String(experience),
              String(age),
              language,
              evaluation.score,
              evaluation.status,
              evaluation.readiness,
              JSON.stringify(evaluation.reasons),
              JSON.stringify(evaluation.checklist)
            ]
          );
          evaluation.assessmentId = assessmentId;
        }
      } catch (dbErr) {
        console.warn('[Visa Assessment DB Warning]', dbErr.message);
      }
    }

    res.json({
      success: true,
      ...evaluation
    });
  } catch (err) {
    console.error('Failed to calculate visa points:', err);
    res.status(500).json({ success: false, error: 'Internal calculation error' });
  }
});

// 3. GET /api/visa/candidate-assessment
visaVerificationRouter.get('/candidate-assessment', async (req, res) => {
  try {
    const candidateId = req.headers['x-candidate-id'] || req.query.candidateId;
    const candidateEmail = req.headers['x-candidate-email'] || req.query.candidateEmail;

    if (!candidateId && !candidateEmail) {
      return res.json({ success: true, assessment: null });
    }

    const db = await getDb();
    const row = await db.get(
      'SELECT * FROM candidate_visa_assessments WHERE candidateId = ? OR candidateEmail = ? ORDER BY updatedAt DESC LIMIT 1',
      [candidateId || '', candidateEmail || '']
    );

    if (!row) {
      return res.json({ success: true, assessment: null });
    }

    let reasons = [];
    let checklist = [];
    try { reasons = JSON.parse(row.reasons); } catch (_) {}
    try { checklist = JSON.parse(row.checklist); } catch (_) {}

    res.json({
      success: true,
      assessment: {
        ...row,
        reasons,
        checklist
      }
    });
  } catch (err) {
    console.error('Failed to fetch candidate assessment:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/verification/verify
visaVerificationRouter.post('/verify', async (req, res) => {
  try {
    const { 
      candidateName, 
      passportNumber, 
      verificationType, 
      verificationPackage,
      packageItems,
      candidateId, 
      candidateEmail, 
      targetCountry = 'UAE',
      documents = [],
      consentAccepted = true 
    } = req.body;

    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ success: false, error: 'Candidate name is required.' });
    }

    const pkgName = verificationPackage || verificationType || '6-Point Comprehensive Audit';
    const authCandidateId = req.headers['x-candidate-id'] || candidateId || `RI-CAND-${Math.floor(100 + Math.random() * 900)}`;
    const authCandidateEmail = req.headers['x-candidate-email'] || candidateEmail || '';

    const db = await getDb();

    // Duplicate submission check: prevent exact duplicate submissions within last 24h
    if (authCandidateId && passportNumber) {
      const activeCase = await db.get(
        `SELECT caseId, overallStatus, createdAt FROM candidate_verifications 
         WHERE (candidateId = ? OR passportNumber = ?) 
         AND overallStatus NOT IN ('Completed', 'Rejected')
         ORDER BY createdAt DESC LIMIT 1`,
        [authCandidateId, passportNumber.trim()]
      );

      if (activeCase && req.body.forceResubmit !== true) {
        return res.json({
          success: true,
          isExisting: true,
          message: `Active verification case ${activeCase.caseId} already exists in status "${activeCase.overallStatus}".`,
          caseId: activeCase.caseId
        });
      }
    }

    const todayDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const caseId = `REV-VERIF-${todayDate}-${randCode}`;

    // Default Consular Degree Attestation Pipeline (Requirement 4 Section C)
    const attestationPipeline = [
      {
        step: 1,
        stage: 'State HRD / Home Department',
        description: 'Authentication by Regional State Education Department',
        status: 'In Progress',
        completedDate: null,
        pendingRequirements: 'Original Degree & Marksheet Verification',
        lastUpdated: new Date().toISOString()
      },
      {
        step: 2,
        stage: 'MEA Apostille / Attestation',
        description: 'Ministry of External Affairs Central Government Clearance',
        status: 'Queued',
        completedDate: null,
        pendingRequirements: 'Awaiting State HRD clearance',
        lastUpdated: new Date().toISOString()
      },
      {
        step: 3,
        stage: 'Consular Embassy Attestation',
        description: `${targetCountry} Embassy / Consulate Protocol Verification`,
        status: 'Queued',
        completedDate: null,
        pendingRequirements: 'Awaiting MEA sticker & seal',
        lastUpdated: new Date().toISOString()
      },
      {
        step: 4,
        stage: 'MOFA Digital Stamping',
        description: 'Ministry of Foreign Affairs Destination Country Verification',
        status: 'Queued',
        completedDate: null,
        pendingRequirements: 'In-country digital submission',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Default Overseas Employment Roadmap (Requirement 4 Section C)
    const employmentMilestones = [
      {
        step: 1,
        milestone: 'Quota & Offer Clearance',
        description: 'MOHRE / Ministry Quota Approval & Signed Offer Acceptance',
        status: 'Completed',
        completedDate: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString()
      },
      {
        step: 2,
        milestone: 'Degree Attestation',
        description: 'Quad-level consular attestation (HRD, MEA, Embassy, MOFA)',
        status: 'In Progress',
        completedDate: null,
        lastUpdated: new Date().toISOString()
      },
      {
        step: 3,
        milestone: 'Entry Permit / Visa Ingress',
        description: 'Electronic Work Visa Entry Permit issuance for destination country',
        status: 'Queued',
        completedDate: null,
        lastUpdated: new Date().toISOString()
      },
      {
        step: 4,
        milestone: 'Medical & Biometrics',
        description: 'Authorized medical fitness examination & biometric national registry',
        status: 'Queued',
        completedDate: null,
        lastUpdated: new Date().toISOString()
      },
      {
        step: 5,
        milestone: 'Residency & National ID',
        description: 'Official residency permit endorsement & National ID card delivery',
        status: 'Queued',
        completedDate: null,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Persist case to database
    await db.run(
      `INSERT INTO candidate_verifications (
        id, caseId, candidateId, candidateName, candidateEmail, passportNumber,
        verificationPackage, packageItems, overallStatus, attestationPipeline,
        employmentMilestones, documentsAttached, consentAccepted, remarks,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        caseId,
        caseId,
        authCandidateId,
        candidateName.trim(),
        authCandidateEmail,
        passportNumber ? passportNumber.trim() : null,
        pkgName,
        JSON.stringify(packageItems || ['Education', 'Employment', 'Passport', 'PCC']),
        'Submitted',
        JSON.stringify(attestationPipeline),
        JSON.stringify(employmentMilestones),
        JSON.stringify(documents),
        consentAccepted ? 1 : 0,
        'Application submitted successfully. Initial compliance review initiated.'
      ]
    );

    // If documents were attached, insert into candidate_documents as well
    if (Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        try {
          const docId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await db.run(
            `INSERT INTO candidate_documents (
              id, candidateId, userId, documentType, fileName, fileUrl, uploadDate
            ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              docId,
              authCandidateId,
              authCandidateId,
              doc.type || 'Verification Document',
              doc.name || 'document.pdf',
              doc.fileUrl || null
            ]
          );
        } catch (_) {}
      }
    }

    res.json({
      success: true,
      caseId,
      status: 'Submitted',
      candidateName,
      verificationPackage: pkgName,
      attestationPipeline,
      employmentMilestones,
      message: `Verification Case ${caseId} created successfully. Protocol tracking active.`
    });
  } catch (err) {
    console.error('Failed to initiate verification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/verification/status/:caseId
visaVerificationRouter.get('/status/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const db = await getDb();

    const record = await db.get(
      'SELECT * FROM candidate_verifications WHERE caseId = ? OR id = ?',
      [caseId, caseId]
    );

    if (!record) {
      return res.status(404).json({ success: false, error: `Case ID "${caseId}" not found.` });
    }

    let attestationPipeline = [];
    let employmentMilestones = [];
    let documentsAttached = [];
    let packageItems = [];

    try { attestationPipeline = JSON.parse(record.attestationPipeline); } catch (_) {}
    try { employmentMilestones = JSON.parse(record.employmentMilestones); } catch (_) {}
    try { documentsAttached = JSON.parse(record.documentsAttached); } catch (_) {}
    try { packageItems = JSON.parse(record.packageItems); } catch (_) {}

    // Calculate progress percentage
    const completedStages = attestationPipeline.filter(s => s.status === 'Completed' || s.status === 'Verified').length;
    const progress = Math.round((completedStages / (attestationPipeline.length || 1)) * 100);

    res.json({
      success: true,
      case: {
        ...record,
        attestationPipeline,
        employmentMilestones,
        documentsAttached,
        packageItems,
        progress
      }
    });
  } catch (err) {
    console.error('Failed to get verification status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET /api/verification/candidate-cases
visaVerificationRouter.get('/candidate-cases', async (req, res) => {
  try {
    const candidateId = req.headers['x-candidate-id'] || req.query.candidateId;
    const candidateEmail = req.headers['x-candidate-email'] || req.query.candidateEmail;

    if (!candidateId && !candidateEmail) {
      return res.json({ success: true, cases: [] });
    }

    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM candidate_verifications WHERE candidateId = ? OR candidateEmail = ? ORDER BY createdAt DESC',
      [candidateId || '', candidateEmail || '']
    );

    const parsedCases = rows.map(r => {
      let attestationPipeline = [];
      let employmentMilestones = [];
      let documentsAttached = [];
      try { attestationPipeline = JSON.parse(r.attestationPipeline); } catch (_) {}
      try { employmentMilestones = JSON.parse(r.employmentMilestones); } catch (_) {}
      try { documentsAttached = JSON.parse(r.documentsAttached); } catch (_) {}
      return {
        ...r,
        attestationPipeline,
        employmentMilestones,
        documentsAttached
      };
    });

    res.json({
      success: true,
      cases: parsedCases
    });
  } catch (err) {
    console.error('Failed to list candidate cases:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/verification/candidate-summary (Dynamic 4 Dashboard Cards & Roadmap)
visaVerificationRouter.get('/candidate-summary', async (req, res) => {
  try {
    const candidateId = req.headers['x-candidate-id'] || req.query.candidateId;
    const candidateEmail = req.headers['x-candidate-email'] || req.query.candidateEmail;

    if (!candidateId && !candidateEmail) {
      return res.json({
        success: true,
        summary: null,
        isEmpty: true
      });
    }

    const db = await getDb();

    // 1. Latest Visa Assessment
    const assessment = await db.get(
      'SELECT * FROM candidate_visa_assessments WHERE candidateId = ? OR candidateEmail = ? ORDER BY updatedAt DESC LIMIT 1',
      [candidateId || '', candidateEmail || '']
    );

    // 2. Latest Verification Case
    const verification = await db.get(
      'SELECT * FROM candidate_verifications WHERE candidateId = ? OR candidateEmail = ? ORDER BY createdAt DESC LIMIT 1',
      [candidateId || '', candidateEmail || '']
    );

    // 3. Document Vault Counts
    const docs = await db.all(
      'SELECT * FROM candidate_documents WHERE candidateId = ? OR userId = ?',
      [candidateId || '', candidateId || '']
    );

    let parsedMilestones = [];
    let parsedAttestation = [];
    if (verification) {
      try { parsedMilestones = JSON.parse(verification.employmentMilestones); } catch (_) {}
      try { parsedAttestation = JSON.parse(verification.attestationPipeline); } catch (_) {}
    }

    const verifiedDocsCount = docs.filter(d => (d.verificationStatus || '').toLowerCase() === 'verified').length;
    const totalDocsCount = docs.length;

    // Determine pending actions
    const pendingActions = [];
    if (!assessment) {
      pendingActions.push('Calculate overseas work visa points eligibility.');
    }
    if (!verification) {
      pendingActions.push('Initiate document verification & consular attestation request.');
    } else {
      if (verification.overallStatus === 'Submitted') {
        pendingActions.push('Compliance team is reviewing your initial case submission.');
      } else if (verification.overallStatus === 'Action Required') {
        pendingActions.push(verification.remarks || 'Additional document clarification requested by HR.');
      }
    }
    if (totalDocsCount === 0) {
      pendingActions.push('Upload passport and degree certificates to encrypted vault.');
    }

    res.json({
      success: true,
      isEmpty: !assessment && !verification && totalDocsCount === 0,
      summary: {
        visaEligibility: assessment ? {
          score: assessment.score,
          status: assessment.status,
          readiness: assessment.readiness,
          targetCountry: assessment.targetCountry,
          updatedAt: assessment.updatedAt
        } : null,
        verification: verification ? {
          caseId: verification.caseId,
          status: verification.overallStatus,
          package: verification.verificationPackage,
          submittedAt: verification.createdAt,
          remarks: verification.remarks,
          attestationStages: parsedAttestation
        } : null,
        documentVault: {
          total: totalDocsCount,
          verified: verifiedDocsCount,
          pending: totalDocsCount - verifiedDocsCount
        },
        pendingActions,
        employmentRoadmap: parsedMilestones.length > 0 ? parsedMilestones : [
          { step: 1, milestone: 'Quota & Offer Clearance', status: 'Pending Offer' },
          { step: 2, milestone: 'Degree Attestation', status: 'Not Started' },
          { step: 3, milestone: 'Entry Permit', status: 'Queued' },
          { step: 4, milestone: 'Medical & Biometrics', status: 'Queued' },
          { step: 5, milestone: 'Residency & National ID', status: 'Queued' }
        ]
      }
    });
  } catch (err) {
    console.error('Failed to get candidate unified summary:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// 8. CRM Cases List
const handleGetCrmCases = async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM candidate_verifications ORDER BY createdAt DESC');

    const cases = rows.map(r => {
      let attestationPipeline = [];
      let employmentMilestones = [];
      let documentsAttached = [];
      try { attestationPipeline = JSON.parse(r.attestationPipeline); } catch (_) {}
      try { employmentMilestones = JSON.parse(r.employmentMilestones); } catch (_) {}
      try { documentsAttached = JSON.parse(r.documentsAttached); } catch (_) {}
      return {
        ...r,
        attestationPipeline,
        employmentMilestones,
        documentsAttached
      };
    });

    res.json({
      success: true,
      total: cases.length,
      cases
    });
  } catch (err) {
    console.error('Failed to list CRM verifications:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

visaVerificationRouter.get('/crm/verifications', handleGetCrmCases);
visaVerificationRouter.get('/crm/cases', handleGetCrmCases);

// 9. CRM Cases Update
const handleUpdateCrmCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { overallStatus, attestationPipeline, employmentMilestones, remarks } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM candidate_verifications WHERE caseId = ?', [caseId]);

    if (!existing) {
      return res.status(404).json({ success: false, error: `Case ${caseId} not found.` });
    }

    const updatedStatus = overallStatus || existing.overallStatus;
    const updatedAttestation = attestationPipeline ? JSON.stringify(attestationPipeline) : existing.attestationPipeline;
    const updatedMilestones = employmentMilestones ? JSON.stringify(employmentMilestones) : existing.employmentMilestones;
    const updatedRemarks = remarks !== undefined ? remarks : existing.remarks;

    await db.run(
      `UPDATE candidate_verifications SET
        overallStatus = ?,
        attestationPipeline = ?,
        employmentMilestones = ?,
        remarks = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE caseId = ?`,
      [updatedStatus, updatedAttestation, updatedMilestones, updatedRemarks, caseId]
    );

    res.json({
      success: true,
      message: `Case ${caseId} updated successfully.`,
      caseId,
      overallStatus: updatedStatus
    });
  } catch (err) {
    console.error('Failed to update CRM verification case:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

visaVerificationRouter.put('/crm/verifications/:caseId', handleUpdateCrmCase);
visaVerificationRouter.put('/crm/cases/:caseId', handleUpdateCrmCase);

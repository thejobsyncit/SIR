import crypto from 'crypto';

const makeId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

export const VISA_CASE_STATUSES = [
  'Not Required',
  'Needs Assessment',
  'Pending Documents',
  'Under Review',
  'Additional Information Required',
  'Eligibility Assessment Pending',
  'Eligible',
  'Ineligible',
  'Application Submitted',
  'Officially Approved',
  'Officially Rejected'
];

export const DOCUMENT_VERIFICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Verified',
  'Rejected / Correction Required'
];

export const BGV_CHECK_STATUSES = [
  'Pending',
  'In Progress',
  'Verified',
  'Flagged Discrepancy'
];

const INTERNATIONAL_LOCATIONS = [
  'dubai', 'uae', 'abu dhabi', 'sharjah', 'qatar', 'doha', 'saudi', 'riyadh', 'jeddah',
  'oman', 'muscat', 'kuwait', 'bahrain', 'uk', 'united kingdom', 'london', 'canada',
  'toronto', 'vancouver', 'australia', 'sydney', 'melbourne', 'germany', 'berlin',
  'singapore', 'europe', 'ireland', 'usa', 'united states', 'new zealand', 'malaysia',
  'offshore', 'international', 'overseas', 'abroad'
];

const DOMESTIC_LOCATIONS = [
  'india', 'chennai', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad',
  'kolkata', 'pune', 'kochi', 'coimbatore', 'madurai', 'domestic'
];

export const ensureVisaVerificationTables = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS visa_verification_cases (
      id TEXT PRIMARY KEY,
      candidateKey TEXT NOT NULL,
      candidateId TEXT,
      candidateName TEXT NOT NULL,
      candidateEmail TEXT,
      candidatePhone TEXT,
      enquiryId TEXT NOT NULL,
      applicationId TEXT DEFAULT '',
      serviceId TEXT,
      serviceType TEXT,
      destinationCountry TEXT DEFAULT 'To Be Confirmed',
      visaCategory TEXT DEFAULT 'Needs Assessment',
      purpose TEXT,
      assignedEmployeeId TEXT,
      assignedEmployeeName TEXT,
      visaRequired INTEGER DEFAULT 1,
      requirementStatus TEXT DEFAULT 'Needs Assessment',
      documentStatus TEXT DEFAULT 'Pending Documents',
      eligibilityStatus TEXT DEFAULT 'Eligibility Assessment Pending',
      caseStatus TEXT DEFAULT 'Needs Assessment',
      assessmentNotes TEXT,
      assignedReviewerId TEXT,
      assignedReviewerName TEXT,
      submissionDate TEXT,
      applicationRefNumber TEXT,
      officialDecision TEXT DEFAULT 'Pending',
      officialDecisionDate TEXT,
      officialDecisionNotes TEXT,
      requiredDocsJson TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(enquiryId, applicationId)
    );

    CREATE TABLE IF NOT EXISTS visa_case_documents (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      candidateKey TEXT NOT NULL,
      enquiryId TEXT,
      docName TEXT NOT NULL,
      docType TEXT NOT NULL,
      fileUrl TEXT,
      fileData TEXT,
      mimeType TEXT,
      fileSize TEXT,
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      verificationStatus TEXT DEFAULT 'Pending',
      reviewerId TEXT,
      reviewerName TEXT,
      remarks TEXT,
      missingOrCorrectionNote TEXT,
      reviewedAt DATETIME,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visa_case_bgv_records (
      id TEXT PRIMARY KEY,
      candidateKey TEXT NOT NULL,
      enquiryId TEXT,
      checkType TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      progress TEXT DEFAULT '0%',
      reviewerId TEXT,
      reviewerName TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visa_case_activities (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      candidateKey TEXT NOT NULL,
      enquiryId TEXT,
      action TEXT NOT NULL,
      details TEXT,
      actorId TEXT,
      actorName TEXT,
      actorRole TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

/**
 * Customize required-document checklist based on destination country & visa category.
 * Never forces irrelevant documents on every candidate.
 */
export const getRequiredChecklistTemplate = (destinationCountry = '', visaCategory = '') => {
  const cat = String(visaCategory || '').toLowerCase();
  const dest = String(destinationCountry || '').toLowerCase();

  const checklist = [
    { key: 'passport', label: 'Valid Passport (Min 6 Months Validity)', docType: 'Passport', required: true },
    { key: 'identity', label: 'Government Photo ID', docType: 'Identity Document', required: true }
  ];

  if (cat.includes('student')) {
    checklist.push(
      { key: 'education', label: 'Academic Transcripts & Degree Certificates', docType: 'Educational Certificate', required: true },
      { key: 'admission', label: 'University Offer / Admission Letter', docType: 'Offer / Admission Letter', required: true },
      { key: 'financial', label: 'Financial Sponsorship / Bank Statement', docType: 'Financial Evidence', required: true }
    );
  } else if (cat.includes('work') || cat.includes('employment') || cat.includes('permit')) {
    checklist.push(
      { key: 'employment', label: 'Employment Contract / Experience Letters', docType: 'Employment Record', required: true },
      { key: 'education', label: 'Degree / Trade Qualification Certificate', docType: 'Educational Certificate', required: true }
    );
    if (dest.includes('dubai') || dest.includes('uae') || dest.includes('saudi') || dest.includes('qatar') || dest.includes('oman') || dest.includes('kuwait') || dest.includes('bahrain')) {
      checklist.push(
        { key: 'medical', label: 'GAMCA / Approved Medical Fitness Certificate', docType: 'Medical Certificate', required: true },
        { key: 'pcc', label: 'Police Clearance Certificate (PCC)', docType: 'Police Clearance', required: false }
      );
    }
  } else {
    checklist.push(
      { key: 'supporting', label: 'Supporting Purpose / Sponsorship Document', docType: 'Other', required: false }
    );
  }

  return checklist;
};

const extractCountryFromText = (text = '') => {
  const lower = String(text || '').toLowerCase();
  const countryMap = [
    ['dubai', 'UAE (Dubai)'],
    ['abu dhabi', 'UAE (Abu Dhabi)'],
    ['uae', 'United Arab Emirates'],
    ['uk', 'United Kingdom'],
    ['united kingdom', 'United Kingdom'],
    ['london', 'United Kingdom'],
    ['canada', 'Canada'],
    ['australia', 'Australia'],
    ['germany', 'Germany'],
    ['singapore', 'Singapore'],
    ['qatar', 'Qatar'],
    ['saudi', 'Saudi Arabia'],
    ['oman', 'Oman'],
    ['kuwait', 'Kuwait'],
    ['bahrain', 'Bahrain'],
    ['ireland', 'Ireland'],
    ['usa', 'United States'],
    ['united states', 'United States'],
    ['new zealand', 'New Zealand']
  ];
  for (const [needle, label] of countryMap) {
    if (lower.includes(needle)) return label;
  }
  return '';
};

/**
 * Determine whether an enquiry requires visa processing based on service type,
 * destination country, and job/application metadata.
 */
export const detectVisaRequirementForEnquiry = (enquiry, jobLocation = '') => {
  const serviceId = String(enquiry.serviceId || '').toLowerCase().trim();
  const serviceTitle = String(enquiry.serviceTitle || '').toLowerCase().trim();
  const combinedText = `${serviceTitle} ${enquiry.notes || ''} ${enquiry.message || ''} ${jobLocation || ''}`.toLowerCase();

  const detectedCountry = extractCountryFromText(combinedText);
  const hasIntlSignal = INTERNATIONAL_LOCATIONS.some((kw) => combinedText.includes(kw));
  const hasDomesticSignal = DOMESTIC_LOCATIONS.some((kw) => combinedText.includes(kw));

  // 1. Explicit International Admissions -> Student Visa
  if (serviceId === 'intl-adm' || serviceTitle.includes('international admission')) {
    return {
      shouldCreateCase: true,
      visaRequired: 1,
      requirementStatus: 'Required',
      visaCategory: 'Student Visa',
      destinationCountry: detectedCountry || 'International Destination',
      purpose: 'International College / University Admission',
      caseStatus: 'Needs Assessment'
    };
  }

  // 2. Explicit International Consulting -> Work / Consultancy Visa
  if (serviceId === 'intl-consult' || serviceTitle.includes('international consulting')) {
    return {
      shouldCreateCase: true,
      visaRequired: 1,
      requirementStatus: 'Required',
      visaCategory: 'Work / Consultancy Visa',
      destinationCountry: detectedCountry || 'International Destination',
      purpose: 'Overseas Career & Immigration Advisory',
      caseStatus: 'Needs Assessment'
    };
  }

  // 3. Explicit Visa / Work Permit / Immigration Enquiries
  if (
    serviceId.includes('visa') ||
    serviceId.includes('work-permit') ||
    serviceTitle.includes('visa') ||
    serviceTitle.includes('work permit') ||
    serviceTitle.includes('immigration')
  ) {
    return {
      shouldCreateCase: true,
      visaRequired: 1,
      requirementStatus: 'Required',
      visaCategory: serviceId.includes('student') ? 'Student Visa' : 'Work / Immigration Visa',
      destinationCountry: detectedCountry || 'Target Destination',
      purpose: enquiry.serviceTitle || 'Visa Consultancy',
      caseStatus: 'Needs Assessment'
    };
  }

  // 4. Overseas Recruitment / Jobs Enquiries
  if (serviceId.startsWith('job-') || String(enquiry.operationTeam || '').toLowerCase().includes('jobs')) {
    if (hasIntlSignal && !hasDomesticSignal) {
      return {
        shouldCreateCase: true,
        visaRequired: 1,
        requirementStatus: 'Required',
        visaCategory: 'Work Visa',
        destinationCountry: detectedCountry || jobLocation || 'Overseas Employment',
        purpose: `Overseas Employment (${enquiry.serviceTitle || serviceId})`,
        caseStatus: 'Needs Assessment'
      };
    }
    if (hasIntlSignal && hasDomesticSignal) {
      return {
        shouldCreateCase: true,
        visaRequired: 2,
        requirementStatus: 'Needs Assessment',
        visaCategory: 'Needs Assessment',
        destinationCountry: detectedCountry || 'To Be Confirmed',
        purpose: enquiry.serviceTitle || 'Employment Enquiry',
        caseStatus: 'Needs Assessment'
      };
    }
    return { shouldCreateCase: false };
  }

  // 5. Domestic Career Guidance, School Academy, Domestic College Admission -> Do NOT auto-create
  if (serviceId === 'school-career' || serviceId === 'school-academy' || serviceId === 'direct-task') {
    return { shouldCreateCase: false };
  }

  if (serviceId === 'college-adm' && hasIntlSignal) {
    return {
      shouldCreateCase: true,
      visaRequired: 2,
      requirementStatus: 'Needs Assessment',
      visaCategory: 'Student Visa (Uncertain)',
      destinationCountry: detectedCountry || 'To Be Confirmed',
      purpose: 'Admission Assistance (International Signal)',
      caseStatus: 'Needs Assessment'
    };
  }

  return { shouldCreateCase: false };
};

/**
 * Safely sync qualifying enquiries from hr_task_assignments & leads into visa_verification_cases.
 * Uses INSERT OR IGNORE with UNIQUE(enquiryId, applicationId) so duplicates are never created.
 */
export const syncVisaCasesFromEnquiries = async (db) => {
  await ensureVisaVerificationTables(db);

  const jobs = await db.all('SELECT id, title, location FROM jobs').catch(() => []);
  const jobMap = new Map(jobs.map((j) => [String(j.id).toLowerCase(), j]));

  const tasks = await db.all(
    `SELECT * FROM hr_task_assignments ORDER BY createdAt DESC`
  ).catch(() => []);

  for (const t of tasks) {
    const enquiryId = t.enquiryId || t.id;
    if (!enquiryId) continue;

    const jobInfo = t.serviceId ? jobMap.get(String(t.serviceId).toLowerCase()) : null;
    const detection = detectVisaRequirementForEnquiry(t, jobInfo?.location || '');
    if (!detection.shouldCreateCase) continue;

    const candidateKey = t.candidateKey || `email:${String(t.customerEmail || '').toLowerCase().trim()}` || enquiryId;
    const checklist = getRequiredChecklistTemplate(detection.destinationCountry, detection.visaCategory);

    const existing = await db.get(
      `SELECT id FROM visa_verification_cases WHERE enquiryId = ? AND COALESCE(applicationId, '') = ''`,
      [enquiryId]
    );
    if (existing) continue;

    const caseId = makeId('VVC');
    await db.run(
      `INSERT OR IGNORE INTO visa_verification_cases (
        id, candidateKey, candidateId, candidateName, candidateEmail, candidatePhone,
        enquiryId, applicationId, serviceId, serviceType,
        destinationCountry, visaCategory, purpose,
        assignedEmployeeId, assignedEmployeeName,
        visaRequired, requirementStatus, documentStatus, eligibilityStatus, caseStatus,
        requiredDocsJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Documents', 'Eligibility Assessment Pending', ?, ?, COALESCE(?, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)`,
      [
        caseId,
        candidateKey,
        t.referenceNumber || candidateKey,
        t.customerName || 'Candidate',
        t.customerEmail || '',
        t.customerPhone || '',
        enquiryId,
        t.serviceId || '',
        t.serviceTitle || t.serviceId || 'International Service',
        detection.destinationCountry,
        detection.visaCategory,
        detection.purpose,
        t.assignedEmployeeId || '',
        t.assignedEmployeeName || '',
        detection.visaRequired,
        detection.requirementStatus,
        detection.caseStatus,
        JSON.stringify(checklist),
        t.createdAt || null
      ]
    );
  }
};

export const listVisaCases = async (db, filters = {}) => {
  await syncVisaCasesFromEnquiries(db);

  const allRows = await db.all(
    `SELECT * FROM visa_verification_cases ORDER BY updatedAt DESC, createdAt DESC`
  );

  // Real database summary counts (across all active visa-requiring cases)
  const activeCases = allRows.filter((r) => r.caseStatus !== 'Not Required');
  const summary = {
    totalCases: activeCases.length,
    pendingReview: activeCases.filter((r) =>
      ['Needs Assessment', 'Pending Documents', 'Under Review', 'Eligibility Assessment Pending'].includes(r.caseStatus) ||
      ['Pending', 'Under Review'].includes(r.documentStatus)
    ).length,
    documentsVerified: activeCases.filter((r) => r.documentStatus === 'Verified').length,
    actionRequired: activeCases.filter((r) =>
      ['Additional Information Required', 'Ineligible', 'Officially Rejected'].includes(r.caseStatus) ||
      r.documentStatus === 'Rejected / Correction Required' ||
      r.documentStatus === 'Missing Documents'
    ).length
  };

  const search = String(filters.search || '').toLowerCase().trim();
  const country = String(filters.destinationCountry || '').toLowerCase().trim();
  const serviceType = String(filters.serviceType || '').toLowerCase().trim();
  const assignedEmployee = String(filters.assignedEmployee || '').toLowerCase().trim();
  const verificationStatus = String(filters.verificationStatus || '').toLowerCase().trim();
  const eligibilityStatus = String(filters.eligibilityStatus || '').toLowerCase().trim();
  const startDate = String(filters.startDate || '').trim();
  const endDate = String(filters.endDate || '').trim();

  const filtered = allRows.filter((row) => {
    if (search) {
      const hay = `${row.candidateName} ${row.candidateId} ${row.enquiryId} ${row.serviceType} ${row.destinationCountry} ${row.visaCategory} ${row.assignedEmployeeName}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    if (country && country !== 'all' && String(row.destinationCountry || '').toLowerCase() !== country) return false;
    if (serviceType && serviceType !== 'all' && String(row.serviceType || '').toLowerCase() !== serviceType) return false;
    if (assignedEmployee && assignedEmployee !== 'all') {
      const empMatch = String(row.assignedEmployeeId || '').toLowerCase() === assignedEmployee ||
        String(row.assignedEmployeeName || '').toLowerCase() === assignedEmployee;
      if (!empMatch) return false;
    }
    if (verificationStatus && verificationStatus !== 'all' && String(row.documentStatus || '').toLowerCase() !== verificationStatus) return false;
    if (eligibilityStatus && eligibilityStatus !== 'all' && String(row.eligibilityStatus || '').toLowerCase() !== eligibilityStatus) return false;
    if (startDate && String(row.updatedAt || row.createdAt || '').slice(0, 10) < startDate) return false;
    if (endDate && String(row.updatedAt || row.createdAt || '').slice(0, 10) > endDate) return false;
    return true;
  });

  const filterOptions = {
    countries: Array.from(new Set(allRows.map((r) => r.destinationCountry).filter(Boolean))).sort(),
    serviceTypes: Array.from(new Set(allRows.map((r) => r.serviceType).filter(Boolean))).sort(),
    assignedEmployees: Array.from(new Set(allRows.map((r) => r.assignedEmployeeName).filter(Boolean))).sort()
  };

  return {
    cases: filtered,
    summary,
    filterOptions
  };
};

export const getCandidateVisaVerificationBundle = async (db, candidateKey, candidateIdentifiers = {}) => {
  await syncVisaCasesFromEnquiries(db);

  const email = String(candidateIdentifiers.email || '').toLowerCase().trim();
  const enquiryIds = Array.isArray(candidateIdentifiers.enquiryIds) ? candidateIdentifiers.enquiryIds.filter(Boolean) : [];

  let casesSql = `SELECT * FROM visa_verification_cases WHERE candidateKey = ?`;
  const params = [candidateKey];
  if (email) {
    casesSql += ` OR LOWER(candidateEmail) = ?`;
    params.push(email);
  }
  if (enquiryIds.length > 0) {
    casesSql += ` OR enquiryId IN (${enquiryIds.map(() => '?').join(',')})`;
    params.push(...enquiryIds);
  }
  casesSql += ` ORDER BY updatedAt DESC, createdAt DESC`;

  const cases = await db.all(casesSql, params);

  let docsSql = `SELECT id, caseId, candidateKey, enquiryId, docName, docType, fileUrl, mimeType, fileSize, submittedAt, verificationStatus, reviewerId, reviewerName, remarks, missingOrCorrectionNote, reviewedAt, updatedAt FROM visa_case_documents WHERE candidateKey = ?`;
  const docParams = [candidateKey];
  if (enquiryIds.length > 0) {
    docsSql += ` OR enquiryId IN (${enquiryIds.map(() => '?').join(',')})`;
    docParams.push(...enquiryIds);
  }
  docsSql += ` ORDER BY submittedAt DESC`;
  const documents = await db.all(docsSql, docParams);

  const bgvRecords = await db.all(
    `SELECT * FROM visa_case_bgv_records WHERE candidateKey = ? ORDER BY updatedAt DESC, createdAt DESC`,
    [candidateKey]
  );

  const activities = await db.all(
    `SELECT * FROM visa_case_activities WHERE candidateKey = ? ORDER BY createdAt DESC LIMIT 100`,
    [candidateKey]
  );

  return {
    cases: cases.map((c) => ({
      ...c,
      requiredDocs: (() => {
        try {
          return c.requiredDocsJson ? JSON.parse(c.requiredDocsJson) : getRequiredChecklistTemplate(c.destinationCountry, c.visaCategory);
        } catch {
          return getRequiredChecklistTemplate(c.destinationCountry, c.visaCategory);
        }
      })()
    })),
    documents,
    bgvRecords,
    activities
  };
};


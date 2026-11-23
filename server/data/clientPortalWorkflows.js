/**
 * The Revival International - Complete 24-Service Catalogue & Service-Specific Workflow Engine
 * Used by both the Client Portal Frontend and Backend APIs.
 */

export const WORKFLOW_DEFINITIONS = {
  recruitment: {
    type: 'recruitment',
    label: 'Recruitment & Talent Acquisition Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Hiring mandate and role specifications logged in Revival CRM.', percent: 12 },
      { step: 2, key: 'Requirement Review', label: 'Requirement Review', description: 'Dedicated recruitment lead reviews job description, salary band, and quota.', percent: 25 },
      { step: 3, key: 'Recruitment in Progress', label: 'Recruitment in Progress', description: 'Active executive headhunting, database sourcing, and competency screening.', percent: 40 },
      { step: 4, key: 'Candidates Shared', label: 'Candidates Shared', description: 'Shortlisted, pre-vetted candidate dossiers shared for client review.', percent: 55 },
      { step: 5, key: 'Interview', label: 'Interview', description: 'Client panel interviews and technical assessments in progress.', percent: 70 },
      { step: 6, key: 'Selection', label: 'Selection', description: 'Final candidate selection and reference verification completed.', percent: 85 },
      { step: 7, key: 'Offer', label: 'Offer', description: 'Employment offer letter issued and accepted by selected candidate.', percent: 95 },
      { step: 8, key: 'Completed', label: 'Completed', description: 'Candidate onboarded and mandate successfully fulfilled.', percent: 100 }
    ]
  },
  college_admissions: {
    type: 'college_admissions',
    label: 'Higher Education & Admissions Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Academic admission enquiry registered and advisor assigned.', percent: 12 },
      { step: 2, key: 'Profile Evaluation', label: 'Profile Evaluation', description: 'Evaluation of academic transcripts, qualifications, and eligibility criteria.', percent: 25 },
      { step: 3, key: 'University Shortlisting', label: 'University Shortlisting', description: 'Curated shortlist of eligible colleges, universities, and programs prepared.', percent: 38 },
      { step: 4, key: 'Application Preparation', label: 'Application Preparation', description: 'SOP review, LOR organization, and application portal preparation.', percent: 52 },
      { step: 5, key: 'Application Submitted', label: 'Application Submitted', description: 'Official admission applications submitted to target institutions.', percent: 68 },
      { step: 6, key: 'University Decision', label: 'University Decision', description: 'Awaiting institution review, interview, or admission committee decision.', percent: 80 },
      { step: 7, key: 'Offer Received', label: 'Offer Received', description: 'Conditional or unconditional offer letter received from institution.', percent: 92 },
      { step: 8, key: 'Admission Confirmed', label: 'Admission Confirmed', description: 'Offer accepted, enrollment deposit completed, and admission confirmed.', percent: 100 }
    ]
  },
  international_consulting: {
    type: 'international_consulting',
    label: 'Strategic Global Education & Career Consulting Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Consultation request logged with strategic advisory desk.', percent: 15 },
      { step: 2, key: 'Initial Consultation', label: 'Initial Consultation', description: 'One-to-one advisory session to map goals, budget, and study/career destinations.', percent: 35 },
      { step: 3, key: 'Profile Assessment', label: 'Profile Assessment', description: 'Comprehensive diagnostic of academic/professional profile and eligibility.', percent: 55 },
      { step: 4, key: 'Documentation', label: 'Documentation', description: 'Verification of transcripts, credentials, and financial/regulatory checklist.', percent: 75 },
      { step: 5, key: 'Advisory in Progress', label: 'Advisory in Progress', description: 'Strategic roadmap execution, country comparison, and scholarship guidance.', percent: 90 },
      { step: 6, key: 'Completed', label: 'Completed', description: 'Final strategic roadmap delivered and consultation milestones completed.', percent: 100 }
    ]
  },
  visa_permits: {
    type: 'visa_permits',
    label: 'Visa, Work Permit & Verification Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Visa, work permit, or verification request registered.', percent: 15 },
      { step: 2, key: 'Eligibility Review', label: 'Eligibility Review', description: 'Regulatory compliance and jurisdiction eligibility assessment.', percent: 32 },
      { step: 3, key: 'Document Collection', label: 'Document Collection', description: 'Collection and attestation check of passport, degree, and statutory documents.', percent: 52 },
      { step: 4, key: 'Application Preparation', label: 'Application Preparation', description: 'Ministry/embassy forms, quota filings, and medical/biometric scheduling.', percent: 72 },
      { step: 5, key: 'Submitted', label: 'Submitted', description: 'Application formally lodged with immigration or verification authority.', percent: 88 },
      { step: 6, key: 'Decision / Completed', label: 'Decision / Completed', description: 'Official clearance, visa stamping, or verification report issued.', percent: 100 }
    ]
  },
  training_academy: {
    type: 'training_academy',
    label: 'Academy, Seminars & Language Preparation Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Program or language training enquiry received.', percent: 16 },
      { step: 2, key: 'Diagnostic & Batch Selection', label: 'Diagnostic & Batch Selection', description: 'Baseline proficiency assessment and training schedule selection.', percent: 35 },
      { step: 3, key: 'Enrollment Confirmed', label: 'Enrollment Confirmed', description: 'Batch allocation and learning materials provisioned.', percent: 55 },
      { step: 4, key: 'Training in Progress', label: 'Training in Progress', description: 'Live coaching sessions, practice modules, and mock evaluations.', percent: 80 },
      { step: 5, key: 'Completed', label: 'Completed', description: 'Coursework completed and readiness/completion certificate issued.', percent: 100 }
    ]
  },
  corporate_advisory: {
    type: 'corporate_advisory',
    label: 'Corporate HR, Payroll & Operations Workflow',
    stages: [
      { step: 1, key: 'Enquiry Received', label: 'Enquiry Received', description: 'Corporate advisory or outsourcing enquiry logged.', percent: 16 },
      { step: 2, key: 'Discovery & Audit', label: 'Discovery & Audit', description: 'Organizational requirement audit and compliance review.', percent: 35 },
      { step: 3, key: 'Solution Architecture', label: 'Solution Architecture', description: 'Custom HR, WPS payroll, or branding proposal formulated.', percent: 55 },
      { step: 4, key: 'Implementation', label: 'Implementation', description: 'Active deployment of HR policies, payroll systems, or outsourced teams.', percent: 80 },
      { step: 5, key: 'Completed', label: 'Completed', description: 'Deliverables handed over and operational SLA active.', percent: 100 }
    ]
  }
};

/**
 * Complete 24-Service Catalogue organized by Revival International categories
 */
export const CLIENT_PORTAL_SERVICES_CATALOG = [
  // 1. ACADEMIC ADVISORY (6 Services)
  {
    id: 'intl-consult',
    title: 'International Consulting',
    group: 'Academic Advisory',
    category: 'Consulting',
    workflowType: 'international_consulting',
    defaultConsultant: 'Dhanalakshimi (Senior Global Education Advisor)',
    description: 'Strategic global education advisory, destination comparison, tuition & scholarship planning.',
    requiredDocuments: ['Passport Copy', 'Academic Transcripts / Marksheets', 'CV / Resume', 'English Proficiency Score (if available)']
  },
  {
    id: 'college-adm',
    title: 'College Admission Assistance',
    group: 'Academic Advisory',
    category: 'Admissions',
    workflowType: 'college_admissions',
    defaultConsultant: 'Dhanalakshimi (Admissions Workflow Specialist)',
    description: 'End-to-end UG & PG college admission assistance, course selection, eligibility & offer tracking.',
    requiredDocuments: ['Class 10 & 12 Marksheets', 'Degree / Diploma Transcripts', 'Government ID / Passport', 'Statement of Purpose (SOP)']
  },
  {
    id: 'school-career',
    title: 'School Student Career Guidance',
    group: 'Academic Advisory',
    category: 'Career Guidance',
    workflowType: 'international_consulting',
    defaultConsultant: 'Dr. Kavitha Nair (Career Mapping Counselor)',
    description: 'Scientific aptitude mapping, stream selection (Science, Commerce, Humanities, STEM), and 5-year academic roadmaps.',
    requiredDocuments: ['Recent School Report Card', 'Student Interest & Aptitude Questionnaire']
  },
  {
    id: 'intl-adm',
    title: 'International Admissions',
    group: 'Academic Advisory',
    category: 'Admissions',
    workflowType: 'college_admissions',
    defaultConsultant: 'Dhanalakshimi (International Admissions Lead)',
    description: 'Direct university application management across UK, USA, Canada, Australia, Europe & UAE.',
    requiredDocuments: ['Passport Copy', 'Academic Transcripts', 'Statement of Purpose (SOP)', 'Letters of Recommendation (LOR)', 'IELTS / TOEFL / PTE / DET Score']
  },
  {
    id: 'school-academy',
    title: 'Academy for School Students',
    group: 'Academic Advisory',
    category: 'Student Academy',
    workflowType: 'training_academy',
    defaultConsultant: 'Arun Prakash (Academic Enrichment Coordinator)',
    description: 'Competitive exam foundation (NEET, JEE, CUET, CLAT) and study skills enrichment programs.',
    requiredDocuments: ['Student ID / School ID Card', 'Previous Academic Grade Sheet']
  },
  {
    id: 'exec-seminars-lang',
    title: 'Seminars & Language',
    group: 'Academic Advisory',
    category: 'Executive & Language',
    workflowType: 'training_academy',
    defaultConsultant: 'Sarah Jenkins (Language & Executive Coach)',
    description: 'IELTS, OET, and Duolingo English Test (DET) preparation plus executive leadership seminars.',
    requiredDocuments: ['Passport / National ID', 'Previous Test Score Report (if applicable)']
  },

  // 2. EXECUTIVE & HR (6 Featured + 12 Specialized Services = 18 Services)
  {
    id: 'exec-search',
    title: 'Executive Search',
    group: 'Executive & HR',
    category: 'Executive',
    workflowType: 'recruitment',
    defaultConsultant: 'Rajesh Menon (Principal Executive Search Partner)',
    description: 'Confidential C-suite, VP, and Board-level headhunting for enterprise organizations.',
    requiredDocuments: ['Corporate Trade License', 'Executive Role Mandate & JD', 'Compensation Structure Brief']
  },
  {
    id: 'intl-rec',
    title: 'International Recruitment',
    group: 'Executive & HR',
    category: 'Recruitment',
    workflowType: 'recruitment',
    defaultConsultant: 'Faisal Al-Mansoor (Cross-Border Recruitment Lead)',
    description: 'Cross-border talent acquisition connecting global professionals with GCC & international employers.',
    requiredDocuments: ['Company Trade License', 'Job Descriptions & Quota Details', 'Standard Employment Offer Template']
  },
  {
    id: 'dom-rec',
    title: 'Domestic Recruitment',
    group: 'Executive & HR',
    category: 'Recruitment',
    workflowType: 'recruitment',
    defaultConsultant: 'Priya Sharma (Regional Talent Acquisition Lead)',
    description: 'Rapid domestic talent sourcing across construction, healthcare, IT, retail, and engineering.',
    requiredDocuments: ['Company Registration / GST / Trade License', 'Role Requirements & Hiring Matrix']
  },
  {
    id: 'perm-staff',
    title: 'Permanent Staffing',
    group: 'Executive & HR',
    category: 'Staffing',
    workflowType: 'recruitment',
    defaultConsultant: 'Priya Sharma (Permanent Staffing Specialist)',
    description: 'Long-term core workforce placement backed by structured competency vetting and retention guarantees.',
    requiredDocuments: ['Client Service Agreement', 'Job Specifications & Competency Matrix']
  },
  {
    id: 'contract-staff',
    title: 'Contract Staffing',
    group: 'Executive & HR',
    category: 'Staffing',
    workflowType: 'recruitment',
    defaultConsultant: 'Vikramjit Singh (Project Workforce Manager)',
    description: 'Flexible short-term and project-based workforce deployment for seasonal and project peaks.',
    requiredDocuments: ['Project Scope & Duration Brief', 'Site Safety & Shift Compliance Document']
  },
  {
    id: 'visa-assist',
    title: 'Visa Assistance',
    group: 'Executive & HR',
    category: 'Visa & Permits',
    workflowType: 'visa_permits',
    defaultConsultant: 'omar Al-Hashemi (Immigration & PRO Specialist)',
    description: 'End-to-end employment visa processing, medical fitness scheduling, and Emirates ID / residency stamping.',
    requiredDocuments: ['Passport Copy (6+ Months Validity)', 'Attested Educational Certificates', 'Passport Photo (White Background)', 'Signed Offer / Contract']
  },

  // 3. SPECIALIZED RECRUITMENT, OPERATIONS & CAREER SERVICES (Remaining 12 Services in the 24-Service Catalogue)
  {
    id: 'bulk-hiring',
    title: 'Bulk Hiring',
    group: 'Specialized Workforce & Operations',
    category: 'Recruitment',
    workflowType: 'recruitment',
    defaultConsultant: 'Vikramjit Singh (Mass Mobilization Lead)',
    description: 'High-volume recruitment drives and trade testing for construction, hospitality, and logistics mega-projects.',
    requiredDocuments: ['Bulk Demand Letter', 'Trade Test Specifications', 'Quota Approval Document']
  },
  {
    id: 'overseas-place',
    title: 'Overseas Placement',
    group: 'Specialized Workforce & Operations',
    category: 'Placement',
    workflowType: 'recruitment',
    defaultConsultant: 'Faisal Al-Mansoor (Global Mobility Lead)',
    description: 'End-to-end international placement, pre-departure orientation, and relocation coordination.',
    requiredDocuments: ['Passport Copy', 'Updated Resume / CV', 'Educational & Experience Certificates']
  },
  {
    id: 'work-permit',
    title: 'Work Permit Guidance',
    group: 'Specialized Workforce & Operations',
    category: 'Visa & Permits',
    workflowType: 'visa_permits',
    defaultConsultant: 'Omar Al-Hashemi (Regulatory Counsel)',
    description: 'Regulatory advisory on MOHRE quotas, LMRA permits, Saudi Qiwa, and EU Blue Card compliance.',
    requiredDocuments: ['Company Establishment Card / Passport', 'Qualification & Employment Contract Copies']
  },
  {
    id: 'bg-verify',
    title: 'Background Verification',
    group: 'Specialized Workforce & Operations',
    category: 'Verification',
    workflowType: 'visa_permits',
    defaultConsultant: 'Neha Verma (Compliance & BGV Auditor)',
    description: '6-point credential verification covering education, employment history, identity, and police clearance.',
    requiredDocuments: ['Candidate Authorization Consent Form', 'Degree & Experience Certificates', 'Government ID / Passport Copy']
  },
  {
    id: 'hr-consulting',
    title: 'HR Consulting',
    group: 'Specialized Workforce & Operations',
    category: 'Consulting',
    workflowType: 'corporate_advisory',
    defaultConsultant: 'Rajesh Menon (Principal HR Strategist)',
    description: 'Organizational design, job grading, GCC salary benchmarking, and labor law compliance.',
    requiredDocuments: ['Current Organization Chart', 'Existing HR Policy Handbook (if any)']
  },
  {
    id: 'payroll-mgmt',
    title: 'Payroll Management',
    group: 'Specialized Workforce & Operations',
    category: 'Operations',
    workflowType: 'corporate_advisory',
    defaultConsultant: 'Ananya Iyer (WPS & Payroll Operations Lead)',
    description: 'WPS-compliant payroll processing, end-of-service gratuity computation, and payslip administration.',
    requiredDocuments: ['Company Trade License & WPS Establishment ID', 'Employee Master Roster']
  },
  {
    id: 'manpower-outsrc',
    title: 'Manpower Outsourcing',
    group: 'Specialized Workforce & Operations',
    category: 'Operations',
    workflowType: 'corporate_advisory',
    defaultConsultant: 'Vikramjit Singh (Outsourcing Operations Manager)',
    description: 'Dedicated on-site personnel deployment with full visa, payroll, and insurance administration.',
    requiredDocuments: ['Scope of Work (SOW)', 'Site Deployment Schedule', 'Trade License Copy']
  },
  {
    id: 'interview-coord',
    title: 'Interview Coordination',
    group: 'Specialized Workforce & Operations',
    category: 'Recruitment',
    workflowType: 'recruitment',
    defaultConsultant: 'Priya Sharma (Interview Operations Coordinator)',
    description: 'Multi-timezone interview scheduling, technical panel coordination, and structured evaluation sheets.',
    requiredDocuments: ['Interview Panel Availability Matrix', 'Evaluation Rubric / Role Brief']
  },
  {
    id: 'cand-screening',
    title: 'Candidate Screening',
    group: 'Specialized Workforce & Operations',
    category: 'Recruitment',
    workflowType: 'recruitment',
    defaultConsultant: 'Neha Verma (Talent Assessment Specialist)',
    description: 'Competency screening, psychometric evaluation, and technical shortlisting.',
    requiredDocuments: ['Role Competency Framework', 'Candidate Profiles Batch']
  },
  {
    id: 'resume-build',
    title: 'Resume Building',
    group: 'Specialized Workforce & Operations',
    category: 'Career',
    workflowType: 'international_consulting',
    defaultConsultant: 'Dr. Kavitha Nair (Executive Career Branding Advisor)',
    description: 'ATS-optimized CV transformation and LinkedIn executive branding for GCC and global markets.',
    requiredDocuments: ['Current Resume / CV', 'Target Job Roles & Career Achievements Summary']
  },
  {
    id: 'career-guide',
    title: 'Career Guidance',
    group: 'Specialized Workforce & Operations',
    category: 'Career',
    workflowType: 'international_consulting',
    defaultConsultant: 'Dr. Kavitha Nair (Executive Career Coach)',
    description: 'One-on-one executive career transition coaching, interview mastery, and compensation negotiation.',
    requiredDocuments: ['Updated CV / Resume', 'Career Goals Brief']
  },
  {
    id: 'emp-branding',
    title: 'Employer Branding',
    group: 'Specialized Workforce & Operations',
    category: 'Consulting',
    workflowType: 'corporate_advisory',
    defaultConsultant: 'Rajesh Menon (Employer Brand Strategist)',
    description: 'Employer Value Proposition (EVP) design and recruitment branding to attract top global talent.',
    requiredDocuments: ['Brand Guidelines', 'Company Overview & Culture Deck']
  }
];

export const getServiceCatalogItem = (serviceIdOrTitle) => {
  if (!serviceIdOrTitle) return CLIENT_PORTAL_SERVICES_CATALOG[0];
  const clean = String(serviceIdOrTitle).trim().toLowerCase();
  const byId = CLIENT_PORTAL_SERVICES_CATALOG.find(s => s.id.toLowerCase() === clean);
  if (byId) return byId;
  const byTitle = CLIENT_PORTAL_SERVICES_CATALOG.find(
    s => s.title.toLowerCase() === clean || clean.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(clean)
  );
  return byTitle || CLIENT_PORTAL_SERVICES_CATALOG[0];
};

export const getWorkflowForService = (serviceIdOrTitle, currentStatus = '', currentStepOverride = null) => {
  const catalogItem = getServiceCatalogItem(serviceIdOrTitle);
  const wf = WORKFLOW_DEFINITIONS[catalogItem.workflowType] || WORKFLOW_DEFINITIONS.international_consulting;
  const stages = wf.stages;

  let activeStep = 1;
  const statusLower = String(currentStatus || '').toLowerCase();

  if (currentStepOverride && Number(currentStepOverride) >= 1 && Number(currentStepOverride) <= stages.length) {
    activeStep = Number(currentStepOverride);
  } else {
    // Match exact stage key or map CRM status to workflow stage
    const exactIdx = stages.findIndex(st => st.key.toLowerCase() === statusLower || st.label.toLowerCase() === statusLower);
    if (exactIdx !== -1) {
      activeStep = exactIdx + 1;
    } else if (statusLower.includes('completed') || statusLower.includes('confirmed') || statusLower.includes('converted')) {
      activeStep = stages.length;
    } else if (statusLower.includes('offer')) {
      activeStep = Math.max(1, stages.length - 1);
    } else if (statusLower.includes('submitted') || statusLower.includes('decision') || statusLower.includes('interview')) {
      activeStep = Math.min(stages.length, Math.ceil(stages.length * 0.65));
    } else if (statusLower.includes('progress') || statusLower.includes('preparation') || statusLower.includes('shortlist') || statusLower.includes('shared') || statusLower.includes('document')) {
      activeStep = Math.min(stages.length, Math.ceil(stages.length * 0.5));
    } else if (statusLower.includes('scheduled') || statusLower.includes('contacted') || statusLower.includes('evaluation') || statusLower.includes('review') || statusLower.includes('qualified')) {
      activeStep = 2;
    } else {
      activeStep = 1;
    }
  }

  const currentStageObj = stages[activeStep - 1] || stages[0];
  const nextStageObj = stages[activeStep] || null;

  return {
    workflowType: wf.type,
    workflowLabel: wf.label,
    stages,
    activeStep,
    totalSteps: stages.length,
    currentStageLabel: currentStageObj.label,
    currentStageDescription: currentStageObj.description,
    progressPercent: currentStageObj.percent,
    nextStepLabel: nextStageObj ? nextStageObj.label : 'Service Completed',
    catalogItem
  };
};


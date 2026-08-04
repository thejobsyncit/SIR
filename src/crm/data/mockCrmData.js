export const CRM_ROLES = [
  'Super Admin',
  'Admin',
  'HR Manager',
  'Domestic Recruiter',
  'International Recruiter',
  'Senior Recruiter',
  'Junior Recruiter',
  'Client Coordinator',
  'Interview Coordinator',
  'Documentation Executive',
  'Visa Processing Executive',
  'Background Verification Executive',
  'Accounts',
  'Business Development',
  'Marketing',
  'Read Only Viewer'
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Admin': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'visa', 'verification', 'accounts', 'reports', 'ai-suite', 'automation', 'calendar', 'settings'],
  'HR Manager': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Domestic Recruiter': ['dashboard', 'candidates', 'pipeline', 'domestic', 'workspace', 'interviews', 'calendar'],
  'International Recruiter': ['dashboard', 'candidates', 'pipeline', 'international', 'workspace', 'interviews', 'visa', 'calendar'],
  'Senior Recruiter': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'workspace', 'interviews', 'calendar', 'ai-suite'],
  'Junior Recruiter': ['dashboard', 'candidates', 'pipeline', 'workspace', 'calendar'],
  'Client Coordinator': ['dashboard', 'clients', 'domestic', 'international', 'interviews', 'workspace'],
  'Interview Coordinator': ['dashboard', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Documentation Executive': ['dashboard', 'candidates', 'documentation', 'visa', 'workspace'],
  'Visa Processing Executive': ['dashboard', 'candidates', 'international', 'visa', 'documentation', 'workspace'],
  'Background Verification Executive': ['dashboard', 'candidates', 'verification', 'documentation', 'workspace'],
  'Accounts': ['dashboard', 'accounts', 'clients', 'reports'],
  'Business Development': ['dashboard', 'clients', 'reports'],
  'Marketing': ['dashboard', 'candidates', 'clients', 'reports'],
  'Read Only Viewer': ['dashboard', 'reports']
};

export const PIPELINE_STAGES = [
  { id: 'lead', title: 'Lead', color: 'bg-slate-500' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'screening', title: 'Screening', color: 'bg-indigo-500' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'bg-cyan-500' },
  { id: 'hr_interview', title: 'HR Interview', color: 'bg-purple-500' },
  { id: 'tech_interview', title: 'Technical Interview', color: 'bg-purple-600' },
  { id: 'client_interview', title: 'Client Interview', color: 'bg-violet-600' },
  { id: 'final_interview', title: 'Final Interview', color: 'bg-fuchsia-600' },
  { id: 'selected', title: 'Selected', color: 'bg-amber-500' },
  { id: 'offer_released', title: 'Offer Released', color: 'bg-amber-600' },
  { id: 'offer_accepted', title: 'Offer Accepted', color: 'bg-orange-500' },
  { id: 'documentation', title: 'Documentation', color: 'bg-teal-500' },
  { id: 'bgv', title: 'Background Verification', color: 'bg-teal-600' },
  { id: 'visa_process', title: 'Visa Process', color: 'bg-sky-600' },
  { id: 'travel_process', title: 'Travel Process', color: 'bg-blue-600' },
  { id: 'joined', title: 'Joined', color: 'bg-emerald-600' },
  { id: 'rejected', title: 'Rejected', color: 'bg-rose-600' }
];

export const CRM_CANDIDATES = [
  {
    id: 'SIR-CAN-1001',
    name: 'Alexander Wright',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'a.wright@executive-tech.com',
    phone: '+971 50 123 9876',
    whatsapp: '+971 50 123 9876',
    gender: 'Male',
    dob: '1988-04-12',
    nationality: 'United Kingdom',
    passport: 'GB98210452',
    passportExpiry: '2031-10-15',
    visaStatus: 'Residence Visa (UAE)',
    currentSalary: 'AED 38,000 / month',
    expectedSalary: 'AED 45,000 / month',
    noticePeriod: '30 Days',
    experience: '12 Years',
    currentEmployer: 'Al Habtoor Contracting LLC',
    skills: ['Primavera P6', 'FIDIC Contracts', 'MOHRE Compliance', 'High-Rise Construction'],
    education: 'B.Sc. Civil Engineering - University of Manchester',
    certifications: ['PMP Certified', 'FIDIC Specialist'],
    stage: 'final_interview',
    score: 94,
    aiSummary: 'Top-tier civil project manager with 12 years of high-rise building leadership across London & Dubai.',
    assignedRecruiter: 'Fatima Al-Zahra',
    tags: ['Executive', 'Tier-1 Candidate', 'Immediate Joining'],
    documents: [
      { name: 'Alexander_Wright_CV.pdf', type: 'Resume', status: 'Verified' },
      { name: 'Passport_Copy_UK.pdf', type: 'Passport', status: 'Verified' },
      { name: 'Degree_Attestation_MOHRE.pdf', type: 'Degree', status: 'Attested' }
    ]
  },
  {
    id: 'SIR-CAN-1002',
    name: 'Dr. Sarah Al-Mansoori',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'sarah.mansoori@medical.org',
    phone: '+966 50 987 1234',
    whatsapp: '+966 50 987 1234',
    gender: 'Female',
    dob: '1990-08-25',
    nationality: 'Saudi Arabia',
    passport: 'SA7712091',
    passportExpiry: '2029-06-20',
    visaStatus: 'Saudi Citizen',
    currentSalary: 'SAR 42,000 / month',
    expectedSalary: 'SAR 50,000 / month',
    noticePeriod: '60 Days',
    experience: '9 Years',
    currentEmployer: 'King Faisal Specialist Hospital',
    skills: ['ICU Critical Care', 'Ventilator Management', 'JCI Accreditation', 'Prometric License'],
    education: 'M.D. Internal Medicine - King Saud University',
    certifications: ['Saudi Board Certified', 'ACLS / BLS'],
    stage: 'offer_released',
    score: 96,
    aiSummary: 'Senior ICU consultant specializing in tertiary care and critical trauma units in Riyadh.',
    assignedRecruiter: 'Tariq Al-Hashemi',
    tags: ['Doctor', 'Healthcare', 'JCI Verified'],
    documents: [
      { name: 'Dr_Sarah_CV_2026.pdf', type: 'Resume', status: 'Verified' },
      { name: 'Saudi_Prometric_License.pdf', type: 'Medical License', status: 'Verified' }
    ]
  },
  {
    id: 'SIR-CAN-1003',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'elena.rostova@cloudtech.io',
    phone: '+48 22 891 0023',
    whatsapp: '+48 22 891 0023',
    gender: 'Female',
    dob: '1993-11-04',
    nationality: 'Poland',
    passport: 'PL4491029',
    passportExpiry: '2030-01-18',
    visaStatus: 'Tourist Visa',
    currentSalary: 'EUR 5,500 / month',
    expectedSalary: 'SGD 14,000 / month',
    noticePeriod: 'Immediate',
    experience: '8 Years',
    currentEmployer: 'Warsaw Fintech Solutions',
    skills: ['AWS Architect', 'Kubernetes', 'Terraform', 'DevOps CI/CD', 'Golang'],
    education: 'M.Sc. Computer Science - Warsaw University of Technology',
    certifications: ['AWS Solutions Architect Pro', 'CKA Kubernetes'],
    stage: 'visa_process',
    score: 92,
    aiSummary: 'Senior DevOps Architect eligible for Singapore Employment Pass & Dubai Green Visa.',
    assignedRecruiter: 'David Sterling',
    tags: ['Cloud Tech', 'Relocating', 'EP Qualified'],
    documents: [
      { name: 'Elena_Rostova_DevOps.pdf', type: 'Resume', status: 'Verified' },
      { name: 'MOM_Singapore_IPA_Approval.pdf', type: 'Visa Letter', status: 'Approved' }
    ]
  }
];

export const CRM_CLIENTS = [
  {
    id: 'CLI-501',
    company: 'Al Habtoor Contracting LLC',
    logo: '🏗️ Al Habtoor',
    industry: 'Construction & Real Estate',
    country: 'UAE (Dubai)',
    contactPerson: 'Eng. Hassan Al-Habtoor',
    designation: 'VP of Human Capital',
    email: 'hassan@habtoorcontracting.ae',
    phone: '+971 4 390 1111',
    activeMandates: 6,
    totalPlacements: 48,
    agreementStatus: 'Active Multi-Year SLA',
    pendingInvoiceUSD: 35000,
    coordinator: 'Tariq Al-Hashemi'
  },
  {
    id: 'CLI-502',
    company: 'Saudi German Hospital Group',
    logo: '🏥 SGH Group',
    industry: 'Healthcare & Tertiary Medical',
    country: 'Saudi Arabia (Riyadh)',
    contactPerson: 'Dr. Nawaf Al-Harbi',
    designation: 'Director of Talent Acquisition',
    email: 'nawaf.harbi@sghgroup.sa',
    phone: '+966 11 482 9900',
    activeMandates: 12,
    totalPlacements: 94,
    agreementStatus: 'Exclusive Vendor SLA',
    pendingInvoiceUSD: 62000,
    coordinator: 'Fatima Al-Zahra'
  }
];

export const CRM_INTERVIEWS = [
  {
    id: 'INT-881',
    candidateName: 'Alexander Wright',
    jobTitle: 'Senior Civil Project Manager',
    clientCompany: 'Al Habtoor Contracting LLC',
    date: '2026-08-08',
    time: '14:00 GST',
    platform: 'Microsoft Teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/sir-recruitment-881',
    panelists: ['Eng. Hassan Al-Habtoor (VP)', 'David Sterling (SIR Director)'],
    status: 'Scheduled',
    feedback: 'Pending Panel Conduct'
  },
  {
    id: 'INT-882',
    candidateName: 'Elena Rostova',
    jobTitle: 'Lead Cloud Solutions Architect',
    clientCompany: 'TechVision International',
    date: '2026-08-06',
    time: '11:00 SGT',
    platform: 'Google Meet',
    meetingLink: 'https://meet.google.com/sir-cloud-882',
    panelists: ['Marcus Chen (CTO)', 'Fatima Al-Zahra (Coordinator)'],
    status: 'Completed',
    feedback: 'Passed Technical Assessment with 95% Score'
  }
];

export const CRM_INVOICES = [
  {
    id: 'INV-2026-091',
    client: 'Al Habtoor Contracting LLC',
    service: 'Executive Headhunting Fee - Civil PM Placement',
    amountUSD: 24500,
    vatAmountUSD: 1225,
    totalUSD: 25725,
    dueDate: '2026-08-20',
    status: 'Pending Payment',
    candidatePlaced: 'Alexander Wright'
  },
  {
    id: 'INV-2026-084',
    client: 'Saudi German Hospital Group',
    service: 'Bulk Nursing & Medical Credential Verification',
    amountUSD: 48000,
    vatAmountUSD: 7200,
    totalUSD: 55200,
    dueDate: '2026-08-01',
    status: 'Paid',
    candidatePlaced: 'Multiple Medical Staff (14 Candidates)'
  }
];

export const RECRUITER_LEADERBOARD = [
  { rank: 1, name: 'Fatima Al-Zahra', placements: 24, revenueUSD: 184000, targetPct: 142 },
  { rank: 2, name: 'Tariq Al-Hashemi', placements: 19, revenueUSD: 148000, targetPct: 125 },
  { rank: 3, name: 'David Sterling', placements: 16, revenueUSD: 132000, targetPct: 110 },
  { rank: 4, name: 'Rajesh Kumar', placements: 14, revenueUSD: 98000, targetPct: 98 }
];

export const AUDIT_LOGS = [
  { timestamp: '2026-08-04 10:14:02', user: 'Tariq Al-Mansoori', role: 'Super Admin', action: 'Approved Executive Visa Sponsorship for Candidate SIR-CAN-1002', ip: '194.170.21.90' },
  { timestamp: '2026-08-04 09:45:11', user: 'Fatima Al-Zahra', role: 'International Recruiter', action: 'Moved Candidate SIR-CAN-1003 to Visa Process Stage', ip: '194.170.21.95' },
  { timestamp: '2026-08-04 08:30:00', user: 'System Automated Bot', role: 'System', action: 'Dispatched 14 Passport Expiry Warnings to Executive Candidates', ip: 'localhost' }
];

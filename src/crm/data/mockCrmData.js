export const CRM_ROLES = [
  'Super Admin',
  'Admin',
  'Recruiter',
  'Interviewer',
  'Client Coordinator'
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Admin': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'visa', 'verification', 'accounts', 'reports', 'ai-suite', 'automation', 'calendar', 'settings'],
  'Recruiter': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'workspace', 'interviews', 'documentation', 'calendar', 'reports'],
  'Interviewer': ['dashboard', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Client Coordinator': ['dashboard', 'clients', 'domestic', 'international', 'pipeline', 'interviews', 'workspace', 'reports'],
  
  // Legacy aliases for full backward compatibility
  'HR & Talent Manager': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Domestic Recruiter': ['dashboard', 'candidates', 'pipeline', 'domestic', 'workspace', 'interviews', 'calendar'],
  'International Recruiter': ['dashboard', 'candidates', 'pipeline', 'international', 'workspace', 'interviews', 'visa', 'calendar'],
  'Placement Coordinator': ['dashboard', 'candidates', 'pipeline', 'clients', 'interviews', 'workspace', 'calendar'],
  'Client Account Manager': ['dashboard', 'clients', 'domestic', 'international', 'interviews', 'workspace'],
  'Interview Coordinator': ['dashboard', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Documentation & Visa Specialist': ['dashboard', 'candidates', 'documentation', 'visa', 'workspace'],
  'Background Verification Officer': ['dashboard', 'candidates', 'verification', 'documentation', 'workspace'],
  'Accounts & Billing Executive': ['dashboard', 'accounts', 'clients', 'reports'],
  'HR Professional': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Application Support': ['dashboard', 'candidates', 'documentation', 'visa', 'verification', 'workspace'],
  'DMS': ['dashboard', 'candidates', 'documentation', 'workspace'],
  'HR Manager': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Accounts & Treasury': ['dashboard', 'accounts', 'clients', 'reports'],
  'Accounts': ['dashboard', 'accounts', 'clients', 'reports'],
  'Coordinator': ['dashboard', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'calendar']
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
  { id: 'rejected', title: 'Rejected', color: 'bg-rose-600' },
  { id: 'hold', title: 'Hold', color: 'bg-yellow-600' }
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
    address: 'Business Bay, Tower 4, Dubai, UAE',
    nationality: 'United Kingdom',
    passport: 'GB98210452',
    passportExpiry: '2031-10-15',
    visaStatus: 'Residence Visa (UAE)',
    aadhaar: 'N/A (UK Citizen)',
    pan: 'N/A (UK Citizen)',
    currentSalary: 'AED 38,000 / month',
    expectedSalary: 'AED 45,000 / month',
    noticePeriod: '30 Days',
    preferredLocation: 'Dubai / Abu Dhabi / Riyadh',
    languages: ['English (Native)', 'Arabic (Basic)'],
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
    notes: 'Candidate passed technical assessment with distinction. Client VP Hassan Al-Habtoor gave positive preliminary feedback.',
    documents: [
      { id: 'd-1', name: 'Alexander_Wright_CV.pdf', type: 'Resume', status: 'Verified', date: '2026-08-01' },
      { id: 'd-2', name: 'Passport_Copy_UK.pdf', type: 'Passport', status: 'Verified', date: '2026-08-01' },
      { id: 'd-3', name: 'Degree_Attestation_MOHRE.pdf', type: 'Degree', status: 'Attested', date: '2026-08-02' }
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
    address: 'Olaya District, Riyadh, Saudi Arabia',
    nationality: 'Saudi Arabia',
    passport: 'SA7712091',
    passportExpiry: '2029-06-20',
    visaStatus: 'Saudi Citizen',
    aadhaar: 'N/A',
    pan: 'N/A',
    currentSalary: 'SAR 42,000 / month',
    expectedSalary: 'SAR 50,000 / month',
    noticePeriod: '60 Days',
    preferredLocation: 'Riyadh / Jeddah',
    languages: ['Arabic (Native)', 'English (Fluent)'],
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
    notes: 'Offer letter dispatched on August 3rd for Saudi German Hospital Group.',
    documents: [
      { id: 'd-4', name: 'Dr_Sarah_CV_2026.pdf', type: 'Resume', status: 'Verified', date: '2026-07-28' },
      { id: 'd-5', name: 'Saudi_Prometric_License.pdf', type: 'Medical License', status: 'Verified', date: '2026-07-29' }
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
    address: 'Mokotowska 42, Warsaw, Poland',
    nationality: 'Poland',
    passport: 'PL4491029',
    passportExpiry: '2030-01-18',
    visaStatus: 'Tourist Visa',
    aadhaar: 'N/A',
    pan: 'N/A',
    currentSalary: 'EUR 5,500 / month',
    expectedSalary: 'SGD 14,000 / month',
    noticePeriod: 'Immediate',
    preferredLocation: 'Singapore / Dubai',
    languages: ['Polish (Native)', 'English (Fluent)'],
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
    notes: 'MOM Singapore IPA approval letter generated.',
    documents: [
      { id: 'd-6', name: 'Elena_Rostova_DevOps.pdf', type: 'Resume', status: 'Verified', date: '2026-07-15' },
      { id: 'd-7', name: 'MOM_Singapore_IPA_Approval.pdf', type: 'Visa Letter', status: 'Approved', date: '2026-08-02' }
    ]
  },
  {
    id: 'SIR-CAN-1004',
    name: 'Rajesh Subramanian',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'rajesh.sub@fintech-mumbai.in',
    phone: '+91 98200 45123',
    whatsapp: '+91 98200 45123',
    gender: 'Male',
    dob: '1991-02-18',
    address: 'Bandra West, Mumbai, MH, India',
    nationality: 'India',
    passport: 'Z8910244',
    passportExpiry: '2032-05-10',
    visaStatus: 'Emigration Clearance Required (ECR)',
    aadhaar: '4512-8910-3321',
    pan: 'ABCPS8910K',
    currentSalary: 'INR 28,000,000 / annum',
    expectedSalary: 'AED 32,000 / month',
    noticePeriod: '15 Days',
    preferredLocation: 'Dubai / Abu Dhabi',
    languages: ['English', 'Hindi', 'Tamil'],
    experience: '10 Years',
    currentEmployer: 'HDFC Securities',
    skills: ['Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'React.js'],
    education: 'B.Tech IT - IIT Madras',
    certifications: ['Oracle Certified Java Master'],
    stage: 'client_interview',
    score: 91,
    aiSummary: 'Full-stack financial software architect with high performance banking microservices expertise.',
    assignedRecruiter: 'Rajesh Kumar',
    tags: ['Fintech', 'Java Expert', 'Fast Track'],
    notes: 'Client interview confirmed with Emirates NBD Engineering lead.',
    documents: [
      { id: 'd-8', name: 'Rajesh_Subramanian_CV.pdf', type: 'Resume', status: 'Verified', date: '2026-08-01' }
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
    address: 'Al Habtoor Tower, Business Bay, Dubai',
    contactPerson: 'Eng. Hassan Al-Habtoor',
    designation: 'VP of Human Capital',
    email: 'hassan@habtoorcontracting.ae',
    phone: '+971 4 390 1111',
    activeMandates: 6,
    totalPlacements: 48,
    agreementStatus: 'Active Multi-Year SLA',
    pendingInvoiceUSD: 35000,
    coordinator: 'Tariq Al-Hashemi',
    requirements: [
      { id: 'REQ-101', title: 'Senior MEP Engineer', count: 3, status: 'Active', salary: 'AED 28,000' },
      { id: 'REQ-102', title: 'HSE Safety Manager', count: 2, status: 'Active', salary: 'AED 24,000' }
    ],
    communications: [
      { type: 'Email', date: '2026-08-03', text: 'Confirmed interview slot for candidate Alexander Wright on Teams.' },
      { type: 'WhatsApp', date: '2026-08-02', text: 'Sent updated CV shortlist of 4 Civil PMs.' }
    ]
  },
  {
    id: 'CLI-502',
    company: 'Saudi German Hospital Group',
    logo: '🏥 SGH Group',
    industry: 'Healthcare & Tertiary Medical',
    country: 'Saudi Arabia (Riyadh)',
    address: 'King Fahd Road, Olaya, Riyadh',
    contactPerson: 'Dr. Nawaf Al-Harbi',
    designation: 'Director of Talent Acquisition',
    email: 'nawaf.harbi@sghgroup.sa',
    phone: '+966 11 482 9900',
    activeMandates: 12,
    totalPlacements: 94,
    agreementStatus: 'Exclusive Vendor SLA',
    pendingInvoiceUSD: 62000,
    coordinator: 'Fatima Al-Zahra',
    requirements: [
      { id: 'REQ-201', title: 'ICU Critical Care Consultants', count: 5, status: 'Active', salary: 'SAR 45,000' },
      { id: 'REQ-202', title: 'Senior Surgical Nurses', count: 12, status: 'Active', salary: 'SAR 14,000' }
    ],
    communications: [
      { type: 'Email', date: '2026-08-01', text: 'Approved candidate Dr. Sarah Al-Mansoori for final placement offer.' }
    ]
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
    feedback: 'Pending Panel Conduct',
    candidateConfirmed: true,
    clientConfirmed: true,
    recordingLink: 'https://stream.microsoft.com/video/rec-881'
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
    feedback: 'Passed Technical Assessment with 95% Score',
    candidateConfirmed: true,
    clientConfirmed: true,
    recordingLink: 'https://drive.google.com/file/d/rec-882/view'
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

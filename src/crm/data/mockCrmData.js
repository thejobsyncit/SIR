export const CRM_ROLES = [
  'Super Admin',
  'Admin',
  'HR Lead',
  'Recruiter',
  'Placement Coordinator',
  'HR Operations',
  'Interviewer'
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Admin': [
    'dashboard', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'pipeline', 'domestic', 'international', 'clients', 
    'workspace', 'interviews', 'documentation', 'visa', 'verification', 
    'accounts', 'reports', 'ai-suite', 'calendar', 'settings',
    'vacancies', 'search-filters', 'notes-tags', 'communication', 'offers', 'collaboration',
    'plc-overview', 'plc-students', 'plc-eligibility', 'plc-companies', 'plc-drives', 
    'plc-registration', 'plc-applications', 'plc-events', 'plc-offers', 'plc-announcements', 
    'plc-reports', 'plc-approvals',
    'int-overview', 'int-assigned', 'int-profiles', 'int-schedule', 'int-evaluation', 
    'int-feedback', 'int-decision', 'int-status', 'int-reminders', 'int-context', 
    'int-calendar', 'int-permissions',
    'hr-overview', 'hr-attendance', 'hr-leave', 'hr-employees', 'hr-performance', 
    'hr-recruitment', 'hr-payroll', 'hr-announcements', 'hr-shifts', 'hr-documents', 
    'hr-grievances', 'hr-approvals', 'hr-reports', 'hr-tasks'
  ],
  'HR Lead': [
    'dashboard', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'pipeline', 'workspace', 'interviews', 'reports', 
    'calendar', 'vacancies', 'offers', 'collaboration',
    'hr-overview', 'hr-attendance', 'hr-leave', 'hr-employees', 'hr-performance', 
    'hr-recruitment', 'hr-payroll', 'hr-announcements', 'hr-shifts', 'hr-documents', 
    'hr-grievances', 'hr-approvals', 'hr-reports'
  ],
  'Recruiter': [
    'dashboard', 'vacancies', 'candidates', 'search-filters', 'pipeline', 
    'documentation', 'notes-tags', 'interviews', 'communication', 'offers', 
    'reports', 'collaboration', 'workspace', 'domestic', 'international', 
    'clients', 'calendar'
  ],
  'Placement Coordinator': [
    'dashboard', 'plc-overview', 'plc-students', 'plc-eligibility', 'plc-companies', 
    'plc-drives', 'plc-registration', 'plc-applications', 'plc-events', 'plc-offers', 
    'plc-announcements', 'plc-reports', 'plc-approvals',
    'candidates', 'pipeline', 'clients', 'interviews', 'workspace', 'calendar'
  ],
  'HR Operations': [
    'dashboard', 'hr-tasks', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'documentation', 'calendar'
  ],
  'Interviewer': [
    'dashboard', 'int-overview', 'int-assigned', 'int-profiles', 'int-schedule', 
    'int-evaluation', 'int-feedback', 'int-decision', 'int-status', 'int-reminders', 
    'int-context', 'int-calendar', 'int-permissions',
    'candidates', 'interviews', 'calendar'
  ],
  // Legacy aliases for backward compatibility
  'HR & Talent Manager': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Domestic Recruiter': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'domestic', 'workspace', 'interviews', 'calendar'],
  'International Recruiter': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'international', 'workspace', 'interviews', 'visa', 'calendar'],
  'Client Account Manager': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'clients', 'domestic', 'international', 'interviews', 'workspace'],
  'Interview Coordinator': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Documentation & Visa Specialist': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'documentation', 'visa', 'workspace'],
  'Background Verification Officer': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'verification', 'documentation', 'workspace'],
  'Accounts & Billing Executive': ['dashboard', 'accounts', 'clients', 'reports'],
  'HR Professional': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Application Support': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'documentation', 'visa', 'verification', 'workspace'],
  'DMS': ['dashboard', 'candidates', 'documentation', 'workspace'],
  'HR Manager': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Accounts & Treasury': ['dashboard', 'accounts', 'clients', 'reports'],
  'Accounts': ['dashboard', 'accounts', 'clients', 'reports'],
  'Coordinator': ['dashboard', 'consulting', 'career-guidance', 'student-academy', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'calendar']
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
    id: 'REV-CAN-101',
    name: 'Alexander Wright',
    email: 'alexander.wright@gmail.com',
    phone: '+971 50 123 4567',
    nationality: 'British',
    currentEmployer: 'Arabtec Construction LLC',
    currentRole: 'Senior Civil Project Manager',
    currentSalary: 'AED 38,000',
    expectedSalary: 'AED 45,000',
    score: 95,
    stage: 'interview',
    skills: ['FIDIC Red Book', 'Primavera P6', 'High-Rise Construction', 'Budget Control'],
    source: 'Executive Headhunting',
    passport: 'UK (Valid 2031)',
    aiSummary: 'Tier-1 GCC civil project director with 12+ years of mega high-rise execution across Dubai and Riyadh.',
    experience: '12 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-11-01 10:00:00'
  },
  {
    id: 'REV-CAN-102',
    name: 'Dr. Sarah Al-Mansoori',
    email: 'dr.sarah.mansoori@gmail.com',
    phone: '+966 50 234 5678',
    nationality: 'Saudi / UAE',
    currentEmployer: 'King Faisal Specialist Hospital',
    currentRole: 'Consultant Critical Care & ICU',
    currentSalary: 'SAR 42,000',
    expectedSalary: 'SAR 50,000',
    score: 97,
    stage: 'shortlisted',
    skills: ['Critical Care Medicine', 'ICU Ventilation', 'JCI Accreditation', 'Saudi Prometric'],
    source: 'Medical Referral',
    passport: 'Saudi Arabia (Verified)',
    aiSummary: 'Board-certified ICU Consultant with Saudi Prometric license and extensive critical care leadership.',
    experience: '9 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-11-02 11:30:00'
  },
  {
    id: 'REV-CAN-103',
    name: 'Mohamed Tariq',
    email: 'candidate_test_1793170475278@domain.com',
    phone: '+971 50 112 2334',
    nationality: 'Indian',
    currentEmployer: 'Emirates NBD Technology',
    currentRole: 'Lead Cloud Solutions Architect',
    currentSalary: 'AED 28,000',
    expectedSalary: 'AED 35,000',
    score: 92,
    stage: 'lead',
    skills: ['AWS Solutions Architect', 'Kubernetes', 'DevOps CI/CD', 'Fintech Compliance'],
    source: 'Candidate Portal Application',
    passport: 'India (Valid 2029)',
    aiSummary: 'Enterprise cloud architect certified in AWS and Kubernetes with hands-on fintech banking deployments.',
    experience: '8 Years',
    assignedRecruiter: 'Dhanalakshimi (Lead Advisor)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-28 06:54:35'
  },
  {
    id: 'REV-CAN-104',
    name: 'Elena Rostova',
    email: 'elena.rostova@outlook.com',
    phone: '+65 9123 4567',
    nationality: 'Singaporean',
    currentEmployer: 'DBS Bank Singapore',
    currentRole: 'Senior Cybersecurity Operations Lead',
    currentSalary: 'SGD 14,000',
    expectedSalary: 'SGD 16,500',
    score: 94,
    stage: 'screening',
    skills: ['Splunk SIEM', 'Threat Hunting', 'CISSP', 'Incident Response'],
    source: 'Talent Acquisition',
    passport: 'Singapore (Verified)',
    aiSummary: 'CISSP certified security lead with deep experience in banking SOC leadership and threat mitigation.',
    experience: '7 Years',
    assignedRecruiter: 'Kishore Kumar (Recruiter)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-11-03 14:15:00'
  },
  {
    id: 'REV-CAN-105',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98401 55667',
    nationality: 'Indian',
    currentEmployer: 'Larsen & Toubro Heavy Civil',
    currentRole: 'Senior Structural BIM Engineer',
    currentSalary: 'INR 18,00,000',
    expectedSalary: 'AED 22,000',
    score: 89,
    stage: 'applied',
    skills: ['Revit Structural', 'Navisworks Manage', 'BIM 360', 'Clash Detection'],
    source: 'GCC Career Fair',
    passport: 'India (ECNR Verified)',
    aiSummary: 'Experienced structural BIM professional with international metro and high-rise project credentials.',
    experience: '6 Years',
    assignedRecruiter: 'Sreeja Nair (Placement Coordinator)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-11-04 09:20:00'
  }
];

export const CRM_CLIENTS = [];

export const CRM_INTERVIEWS = [];

export const CRM_INVOICES = [];

export const ASSIGNED_RECRUITERS = [
  {
    id: 'REC-001',
    name: 'Dhanalakshimi',
    role: 'Super Admin & Lead Advisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'dhana.jasync@gmail.com',
    phone: '+91 98400 11221',
    location: 'Chennai HQ, India',
    specialties: ['International Consulting', 'Academic Advisory', 'Executive Strategy'],
    activeCandidates: 0,
    totalPlacements: 0,
    revenueUSD: 0,
    targetPct: 100,
    rating: 5.0,
    status: 'Active'
  },
  {
    id: 'REC-002',
    name: 'Sreeja',
    role: 'Senior Academic Counselor',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    email: 'sreeja@revivalinternational.com',
    phone: '+91 98400 11222',
    location: 'Chennai HQ, India',
    specialties: ['Higher Education Advisory', 'Admissions', 'Destination Roadmaps'],
    activeCandidates: 0,
    totalPlacements: 0,
    revenueUSD: 0,
    targetPct: 100,
    rating: 4.9,
    status: 'Active'
  },
  {
    id: 'REC-003',
    name: 'chentamilselvi',
    role: 'Senior Admissions Specialist',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    email: 'chentamilselvi@revivalinternational.com',
    phone: '+91 98400 11223',
    location: 'Chennai HQ, India',
    specialties: ['College Admission Assistance', 'STEM & Medical Advisory'],
    activeCandidates: 0,
    totalPlacements: 0,
    revenueUSD: 0,
    targetPct: 100,
    rating: 4.8,
    status: 'Active'
  },
  {
    id: 'REC-004',
    name: 'Diviya',
    role: 'International Admissions Advisor',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78c0c?w=150&auto=format&fit=crop&q=80',
    email: 'diviya@revivalinternational.com',
    phone: '+91 98400 11224',
    location: 'Chennai HQ, India',
    specialties: ['UK, US & Canada Consulting', 'Visa & Attestation'],
    activeCandidates: 0,
    totalPlacements: 0,
    revenueUSD: 0,
    targetPct: 100,
    rating: 4.9,
    status: 'Active'
  },
  {
    id: 'REC-005',
    name: 'balavarshini',
    role: 'Student Career Counselor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'balavarshini@revivalinternational.com',
    phone: '+91 98400 11225',
    location: 'Chennai HQ, India',
    specialties: ['School Career Guidance', 'Aptitude & Profile Mapping'],
    activeCandidates: 0,
    totalPlacements: 0,
    revenueUSD: 0,
    targetPct: 100,
    rating: 4.8,
    status: 'Active'
  }
];

export const RECRUITER_LEADERBOARD = [];

export const AUDIT_LOGS = [];

export const CRM_ROLES = [
  'Super Admin',
  'Admin',
  'Recruiter',
  'Interviewer',
  'Client Coordinator'
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Admin': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'visa', 'verification', 'accounts', 'reports', 'ai-suite', 'automation', 'calendar', 'settings'],
  'Recruiter': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'workspace', 'interviews', 'documentation', 'calendar', 'reports'],
  'Interviewer': ['dashboard', 'consulting', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Client Coordinator': ['dashboard', 'consulting', 'clients', 'domestic', 'international', 'pipeline', 'interviews', 'workspace', 'reports'],
  
  // Legacy aliases for full backward compatibility
  'HR & Talent Manager': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Domestic Recruiter': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'workspace', 'interviews', 'calendar'],
  'International Recruiter': ['dashboard', 'consulting', 'candidates', 'pipeline', 'international', 'workspace', 'interviews', 'visa', 'calendar'],
  'Placement Coordinator': ['dashboard', 'consulting', 'candidates', 'pipeline', 'clients', 'interviews', 'workspace', 'calendar'],
  'Client Account Manager': ['dashboard', 'consulting', 'clients', 'domestic', 'international', 'interviews', 'workspace'],
  'Interview Coordinator': ['dashboard', 'consulting', 'candidates', 'interviews', 'calendar', 'workspace'],
  'Documentation & Visa Specialist': ['dashboard', 'consulting', 'candidates', 'documentation', 'visa', 'workspace'],
  'Background Verification Officer': ['dashboard', 'consulting', 'candidates', 'verification', 'documentation', 'workspace'],
  'Accounts & Billing Executive': ['dashboard', 'accounts', 'clients', 'reports'],
  'HR Professional': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Application Support': ['dashboard', 'consulting', 'candidates', 'documentation', 'visa', 'verification', 'workspace'],
  'DMS': ['dashboard', 'candidates', 'documentation', 'workspace'],
  'HR Manager': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'reports', 'calendar'],
  'Accounts & Treasury': ['dashboard', 'accounts', 'clients', 'reports'],
  'Accounts': ['dashboard', 'accounts', 'clients', 'reports'],
  'Coordinator': ['dashboard', 'consulting', 'candidates', 'pipeline', 'domestic', 'international', 'clients', 'workspace', 'interviews', 'documentation', 'calendar']
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

export const CRM_CANDIDATES = [];

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


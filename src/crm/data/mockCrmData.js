export const CRM_ROLES = [
  'Super Admin',
  'Admin',
  'HR Lead',
  'Recruiter',
  'Placement Coordinator',
  'HR Operations'
];

export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Admin': [
    'dashboard', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'pipeline', 'domestic', 'international', 'clients', 
    'workspace', 'interviews', 'documentation', 'visa', 'verification', 
    'accounts', 'reports', 'ai-suite', 'calendar', 'settings'
  ],
  'HR Lead': [
    'dashboard', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'pipeline', 'workspace', 'interviews', 'reports', 
    'calendar'
  ],
  'Recruiter': [
    'dashboard', 'candidates', 'pipeline', 'workspace', 'interviews', 
    'documentation', 'calendar'
  ],
  'Placement Coordinator': [
    'dashboard', 'candidates', 'pipeline', 'clients', 'interviews', 
    'workspace', 'calendar'
  ],
  'HR Operations': [
    'dashboard', 'consulting', 'career-guidance', 'student-academy', 
    'candidates', 'documentation', 'calendar'
  ]
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
  { id: 'visa_applied', title: 'Visa Applied', color: 'bg-emerald-500' },
  { id: 'visa_approved', title: 'Visa Approved', color: 'bg-emerald-600' },
  { id: 'ticket_booked', title: 'Ticket Booked', color: 'bg-sky-500' },
  { id: 'deployed', title: 'Deployed', color: 'bg-green-600' },
  { id: 'joined', title: 'Joined', color: 'bg-emerald-700' },
  { id: 'probation_passed', title: 'Probation Passed', color: 'bg-teal-700' },
  { id: 'rejected', title: 'Rejected', color: 'bg-rose-500' },
  { id: 'withdrawn', title: 'Withdrawn', color: 'bg-slate-400' }
];

export const RECRUITER_LEADERBOARD = [
  { rank: 1, name: 'Sreeja', role: 'Placement Coordinator', score: 98, placements: 14, pipeline: 28, avatar: 'SJ' },
  { rank: 2, name: 'Dhanalakshimi', role: 'Placement Coordinator', score: 94, placements: 12, pipeline: 22, avatar: 'DH' },
  { rank: 3, name: 'Kishore Kumar', role: 'Recruiter', score: 89, placements: 10, pipeline: 19, avatar: 'KK' },
  { rank: 4, name: 'Balavarshini', role: 'HR Operations', score: 85, placements: 8, pipeline: 15, avatar: 'BV' },
  { rank: 5, name: 'Sarah Jenkins', role: 'Admin', score: 82, placements: 7, pipeline: 12, avatar: 'SJ' }
];

export const AUDIT_LOGS = [
  { id: 1, user: 'Super Admin', role: 'Super Admin', action: 'Employee account created: Sarah Jenkins (Admin)', timestamp: '10 mins ago', ip: '192.168.1.1' },
  { id: 2, user: 'Priya Sharma', role: 'HR Lead', action: 'Assigned 6 international consulting leads to HR Operations', timestamp: '25 mins ago', ip: '192.168.1.42' },
  { id: 3, user: 'Kishore Kumar', role: 'Recruiter', action: 'Ran ATS resume scoring on candidate Alexander Wright (94% match)', timestamp: '42 mins ago', ip: '192.168.1.88' },
  { id: 4, user: 'Sreeja Nair', role: 'Placement Coordinator', action: 'Updated candidate submission status for Al Habtoor Contracting', timestamp: '1 hour ago', ip: '192.168.1.15' },
  { id: 5, user: 'Balavarshini', role: 'HR Operations', action: 'Logged follow-up call with UAE Golden Visa applicant', timestamp: '2 hours ago', ip: '192.168.1.33' }
];

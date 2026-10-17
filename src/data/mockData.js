export const SERVICES_LIST = [
  { 
    id: 'dom-rec', 
    title: 'Domestic Recruitment', 
    icon: 'Building2', 
    category: 'Recruitment', 
    description: 'Talent acquisition tailored to UAE domestic business demands across all sectors.',
    targetAudience: 'UAE businesses, regional entities, and domestic employers seeking qualified talent.',
    deliverables: [
      'Sector-specific candidate sourcing',
      'Skill and competency screening',
      'Local employment contract alignment'
    ]
  },
  { 
    id: 'intl-rec', 
    title: 'International Recruitment', 
    icon: 'Globe', 
    category: 'Recruitment', 
    description: 'Cross-border recruitment connecting global professionals from Europe, Asia, & Africa with GCC opportunities.',
    targetAudience: 'GCC enterprises and international professionals seeking cross-border careers.',
    deliverables: [
      'Global talent search & headhunting',
      'Cross-border credential verification',
      'Relocation and onboarding facilitation'
    ]
  },
  { 
    id: 'exec-search', 
    title: 'Executive Search', 
    icon: 'UserCheck', 
    category: 'Executive', 
    description: 'Headhunting C-suite leaders, Vice Presidents, and specialized Senior Directors for enterprise clients.',
    targetAudience: 'Corporate boards, C-suite executives, and enterprise leadership teams.',
    deliverables: [
      'Discreet executive headhunting',
      'Board & VP level competency evaluation',
      'Executive compensation benchmarking'
    ]
  },
  { 
    id: 'perm-staff', 
    title: 'Permanent Staffing', 
    icon: 'Briefcase', 
    category: 'Staffing', 
    description: 'Long-term talent placement with comprehensive 90-day retention guarantees and onboarding support.',
    targetAudience: 'Organizations seeking long-term, high-retention core team members.',
    deliverables: [
      'Rigorous candidate pre-qualification',
      '90-day retention replacement guarantee',
      'Structured onboarding facilitation'
    ]
  },
  { 
    id: 'contract-staff', 
    title: 'Contract Staffing', 
    icon: 'Clock', 
    category: 'Staffing', 
    description: 'Flexible short-term and project-based staffing solutions to meet seasonal workforce spikes.',
    targetAudience: 'Enterprises managing seasonal workloads or fixed-duration projects.',
    deliverables: [
      'Rapid project-based workforce deployment',
      'Compliant short-term contract administration',
      'Flexible workforce scalability'
    ]
  },
  { 
    id: 'bulk-hiring', 
    title: 'Bulk Hiring', 
    icon: 'Users', 
    category: 'Recruitment', 
    description: 'Mass deployment of technical workers, hospitality teams, and construction crews with rapid turnaround.',
    targetAudience: 'Hospitality, construction, retail, and logistics mega-projects.',
    deliverables: [
      'High-volume candidate recruitment drives',
      'Trade and technical skill assessments',
      'Mobilization and logistics coordination'
    ]
  },
  { 
    id: 'overseas-place', 
    title: 'Overseas Placement', 
    icon: 'Plane', 
    category: 'Placement', 
    description: 'End-to-end relocation services, airport transfer coordination, and initial settlement assistance.',
    targetAudience: 'Professionals and technicians relocating to GCC destinations.',
    deliverables: [
      'Pre-departure briefing & flight coordination',
      'Airport reception & transit assistance',
      'Settlement and community orientation'
    ]
  },
  { 
    id: 'visa-assist', 
    title: 'Visa Assistance', 
    icon: 'FileText', 
    category: 'Visa & Legal', 
    description: 'Complete work permit processing, entry visa quotas, medical scheduling, and Emirates ID setup.',
    targetAudience: 'Employers and international workers navigating UAE immigration.',
    deliverables: [
      'MOHRE work permit application handling',
      'Medical fitness test scheduling',
      'Emirates ID & residency stamping'
    ]
  },
  { 
    id: 'work-permit', 
    title: 'Work Permit Guidance', 
    icon: 'Award', 
    category: 'Visa & Legal', 
    description: 'Regulatory counsel on MOHRE rules, LMRA guidelines, and EU Blue Card compliance.',
    targetAudience: 'Companies requiring regulatory compliance across GCC and EU labor markets.',
    deliverables: [
      'MOHRE quota advisory & compliance',
      'LMRA and GCC labor regulation counsel',
      'EU Blue Card documentation support'
    ]
  },
  { 
    id: 'bg-verify', 
    title: 'Background Verification', 
    icon: 'ShieldCheck', 
    category: 'Verification', 
    description: 'Comprehensive 6-point verification covering education, past employment, police record, & identity.',
    targetAudience: 'Corporates and government contractors requiring verified hiring.',
    deliverables: [
      '6-point credential verification',
      'Criminal record & police clearance check',
      'Previous employment & reference checks'
    ]
  },
  { 
    id: 'hr-consulting', 
    title: 'HR Consulting', 
    icon: 'PieChart', 
    category: 'Consulting', 
    description: 'Strategic organizational design, salary benchmarking, policy formulation, and MOHRE compliance.',
    targetAudience: 'Growing enterprises and established firms restructuring operations.',
    deliverables: [
      'Organizational design & job grading',
      'UAE salary benchmarking analysis',
      'HR policy & employee handbook formulation'
    ]
  },
  { 
    id: 'payroll-mgmt', 
    title: 'Payroll Management', 
    icon: 'CreditCard', 
    category: 'Operations', 
    description: 'WPS-compliant salary processing, end-of-service gratuity calculations, and benefit administration.',
    targetAudience: 'UAE businesses seeking compliant and automated payroll processing.',
    deliverables: [
      'WPS (Wages Protection System) compliance',
      'End-of-service gratuity calculation',
      'Automated pay slips & statutory reporting'
    ]
  },
  { 
    id: 'manpower-outsrc', 
    title: 'Manpower Outsourcing', 
    icon: 'Layers', 
    category: 'Operations', 
    description: 'Offload operational payroll & visa liability while deploying dedicated personnel to your sites.',
    targetAudience: 'Companies seeking operational efficiency without direct visa liability.',
    deliverables: [
      'On-site dedicated personnel deployment',
      'Full visa & health insurance liability',
      'Comprehensive payroll & HR administration'
    ]
  },
  { 
    id: 'interview-coord', 
    title: 'Interview Coordination', 
    icon: 'Calendar', 
    category: 'Recruitment', 
    description: 'Automated video interviewing, global timezone scheduling, and panel interview moderation.',
    targetAudience: 'Hiring managers managing high-volume or cross-border interviews.',
    deliverables: [
      'Global timezone scheduling coordination',
      'Automated video interviewing platform',
      'Structured interview feedback synthesis'
    ]
  },
  { 
    id: 'cand-screening', 
    title: 'Candidate Screening', 
    icon: 'CheckCircle2', 
    category: 'Recruitment', 
    description: 'AI-assisted resume filtering, competency assessments, and behavioral psychometric testing.',
    targetAudience: 'Recruitment teams needing rapid, accurate applicant shortlisting.',
    deliverables: [
      'AI-powered resume parsing & matching',
      'Behavioral & psychometric assessments',
      'Role-specific technical competency testing'
    ]
  },
  { 
    id: 'resume-build', 
    title: 'Resume Building', 
    icon: 'FileCode', 
    category: 'Career', 
    description: 'Professional ATS-optimized CV re-writing tailored for GCC and European job markets.',
    targetAudience: 'Job seekers and executives targeting GCC and international markets.',
    deliverables: [
      'ATS-optimized keyword enhancement',
      'Executive CV formatting & restructuring',
      'LinkedIn profile alignment & coaching'
    ]
  },
  { 
    id: 'career-guide', 
    title: 'Career Guidance', 
    icon: 'Compass', 
    category: 'Career', 
    description: 'One-on-one executive career coaching, interview preparation, and compensation negotiation.',
    targetAudience: 'Mid-career professionals seeking advancement or industry transition.',
    deliverables: [
      '1-on-1 executive career strategy sessions',
      'Interview roleplay & feedback coaching',
      'Offer negotiation & compensation strategy'
    ]
  },
  { 
    id: 'emp-branding', 
    title: 'Employer Branding', 
    icon: 'Sparkles', 
    category: 'Consulting', 
    description: 'Elevate your talent brand to attract top-tier global candidates across LinkedIn and media.',
    targetAudience: 'Companies aiming to attract elite talent and reduce hiring cycles.',
    deliverables: [
      'Employer value proposition (EVP) design',
      'Recruitment media & brand enhancement',
      'Talent community engagement strategy'
    ]
  },
  {
    id: 'intl-consult',
    title: 'International Consulting',
    icon: 'Globe',
    category: 'Consulting',
    subCategory: 'Education',
    description: 'Professional guidance and strategic counseling for students planning international education pathways.',
    targetAudience: 'Students, graduates, and working professionals planning overseas education.',
    deliverables: [
      'Study destination guidance',
      'Course and university selection support',
      'Academic eligibility assessment',
      'Application planning',
      'Documentation checklist',
      'Consultation request'
    ]
  },
  {
    id: 'college-adm',
    title: 'College Admission Assistance',
    icon: 'GraduationCap',
    category: 'Education',
    subCategory: 'Admissions',
    description: 'End-to-end guidance for undergraduate and postgraduate college admissions across leading institutions.',
    targetAudience: 'High school seniors, diploma holders, and college transfer applicants.',
    deliverables: [
      'College and course selection',
      'Eligibility assessment',
      'Application form guidance',
      'Document preparation checklist',
      'Admission application support',
      'Application status follow-up'
    ]
  },
  {
    id: 'school-career',
    title: 'School Student Career Guidance',
    icon: 'Compass',
    category: 'Education',
    subCategory: 'Career',
    description: 'Specialized aptitude evaluation and personalized career counseling for middle and high school students.',
    targetAudience: 'Grade 8 to 12 school students and their parents.',
    deliverables: [
      'Career interest assessment',
      'Stream selection guidance',
      'Higher education planning',
      'Career pathway exploration',
      'Skills and aptitude guidance',
      'Parent-student counselling appointments'
    ]
  },
  {
    id: 'intl-adm',
    title: 'International Admissions',
    icon: 'Plane',
    category: 'Education',
    subCategory: 'Admissions',
    description: 'Direct support and structured execution for university applications, admissions, and compliance across global destinations.',
    targetAudience: 'Candidates ready to apply to international universities across the UK, USA, Canada, Europe, Australia, and GCC.',
    deliverables: [
      'International university selection',
      'Admission requirement assessment',
      'Application preparation',
      'Academic document checklist',
      'Application progress tracking',
      'Guidance on country-specific requirements'
    ]
  },
  {
    id: 'school-academy',
    title: 'Academy for School Students',
    icon: 'School',
    category: 'Education',
    subCategory: 'Academy',
    description: 'Holistic student development programs designed to build study skills, communication abilities, and foundational career readiness.',
    targetAudience: 'School pupils seeking academic enrichment, study habit refinement, and leadership growth.',
    deliverables: [
      'Academic support programmes',
      'Communication and presentation skills',
      'Study skills and time management',
      'Personal development workshops',
      'Career-readiness programmes',
      'Course enquiry and enrolment requests'
    ]
  },
  {
    id: 'exec-seminars-lang',
    title: 'Executive Seminars & Language Test Preparation',
    icon: 'Languages',
    category: 'Education',
    subCategory: 'Executive',
    description: 'Focused executive development seminars and structured preparation modules for international language proficiency tests.',
    targetAudience: 'Corporate executives, working professionals, healthcare staff, and candidates seeking language proficiency benchmarks.',
    deliverables: [
      'Executive and professional development seminars',
      'Duolingo English Test (DET) preparation',
      'Occupational English Test (OET) preparation',
      'IELTS preparation'
    ],
    subProgrammes: [
      {
        id: 'exec-seminars',
        title: 'Executive & Professional Development Seminars',
        description: 'Interactive leadership, cross-cultural communication, and professional governance seminars for managers and executives.',
        audience: 'Corporate managers, team leads, and mid-to-senior professionals.'
      },
      {
        id: 'det-prep',
        title: 'Duolingo English Test (DET) Preparation',
        description: 'Targeted preparation modules covering adaptive computerized testing patterns, literacy, comprehension, conversation, and production subscores.',
        audience: 'University candidates and professionals applying to institutions accepting DET.'
      },
      {
        id: 'oet-prep',
        title: 'Occupational English Test (OET) Preparation',
        description: 'Healthcare-specific language preparation focusing on patient consultations, referral letter writing, and clinical role-play scenarios.',
        audience: 'Doctors, registered nurses, and allied health professionals seeking GCC, UK, or global licensing.'
      },
      {
        id: 'ielts-prep',
        title: 'IELTS Preparation (Academic & General)',
        description: 'Comprehensive training covering Listening, Reading, Writing, and Speaking for both Academic and General Training modules.',
        audience: 'Study abroad applicants, skilled migration candidates, and professionals.'
      }
    ]
  }
];

export const INDUSTRIES_LIST = [
  { id: 'const', name: 'Construction', icon: 'Building', openJobs: 142, description: 'Civil, MEP, Structural, High-rise infrastructure & PMO leadership.' },
  { id: 'oil-gas', name: 'Oil & Gas', icon: 'Flame', openJobs: 89, description: 'Upstream, Downstream, Offshore drilling & HSE engineering.' },
  { id: 'health', name: 'Healthcare', icon: 'HeartPulse', openJobs: 115, description: 'Doctors, ICU Nurses, Allied Health & Hospital Administration.' },
  { id: 'hosp', name: 'Hospitality', icon: 'Utensils', openJobs: 164, description: '5-Star Resort Management, Culinary Chiefs, Front of House.' },
  { id: 'it-sw', name: 'IT & Software', icon: 'Code', openJobs: 210, description: 'Cloud Architecture, Cybersecurity, AI Engineering & DevOps.' },
  { id: 'eng', name: 'Engineering', icon: 'Wrench', openJobs: 98, description: 'Mechanical, Electrical, Chemical & Renewable Energy Specialists.' },
  { id: 'mfg', name: 'Manufacturing', icon: 'Factory', openJobs: 76, description: 'Plant Operations, Supply Chain QA, Robotics & Assembly.' },
  { id: 'rtl', name: 'Retail', icon: 'ShoppingBag', openJobs: 132, description: 'Luxury Fashion Managers, Store Directors, E-Commerce Ops.' },
  { id: 'log', name: 'Logistics', icon: 'Truck', openJobs: 94, description: 'Supply Chain, Port Operations, Customs & Fleet Management.' },
  { id: 'avi', name: 'Aviation', icon: 'PlaneTakeoff', openJobs: 58, description: 'EASA Maintenance Technicians, Cabin Crew & Airport Operations.' },
  { id: 'bnk', name: 'Banking', icon: 'Landmark', openJobs: 104, description: 'Investment Banking, Compliance, Fintech & Risk Management.' },
  { id: 'edu', name: 'Education', icon: 'GraduationCap', openJobs: 67, description: 'International School Principals, STEM Faculty & Lecturers.' }
];

export const COUNTRIES_LIST = [
  { code: 'UAE', name: 'United Arab Emirates', flag: '🇦🇪', capital: 'Abu Dhabi / Dubai', mainVisa: 'Employer Work Permit', demand: 'Very High' },
  { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', capital: 'Riyadh', mainVisa: 'Work Visa (Iqama)', demand: 'Very High (Vision 2030)' },
  { code: 'QAT', name: 'Qatar', flag: '🇶🇦', capital: 'Doha', mainVisa: 'Work Residence Permit', demand: 'High' },
  { code: 'OMN', name: 'Oman', flag: '🇴🇲', capital: 'Muscat', mainVisa: 'Employment Visa', demand: 'High' },
  { code: 'KWT', name: 'Kuwait', flag: '🇰🇼', capital: 'Kuwait City', mainVisa: 'Work Visa (NOC)', demand: 'Moderate' },
  { code: 'BHR', name: 'Bahrain', flag: '🇧🇭', capital: 'Manama', mainVisa: 'LMRA Work Permit', demand: 'Moderate' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬', capital: 'Singapore', mainVisa: 'Employment Pass (EP)', demand: 'High (Tech & Finance)' },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾', capital: 'Kuala Lumpur', mainVisa: 'Employment Pass', demand: 'Moderate' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦', capital: 'Ottawa', mainVisa: 'Temporary Work Permit / Express Entry', demand: 'Very High' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', capital: 'Canberra', mainVisa: 'TSS 482 / 186 Visa', demand: 'Very High' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧', capital: 'London', mainVisa: 'Skilled Worker Visa', demand: 'High' },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪', capital: 'Berlin', mainVisa: 'EU Blue Card', demand: 'Very High (Engineering/IT)' }
];

export const VISA_MATRIX_FULL = [
  { country: 'UAE', visaType: 'Employer-sponsored work visa', requirements: 'Job offer, passport, medical fitness, educational certificates, employment contract', age: '18 - 60 years', minQualification: '10th/12th / Degree', experience: '0 - 5+ years', language: 'English / Basic Arabic', processingTime: '7 - 14 Days', avgCost: 'AED 3,000 - 5,000 (Employer paid)' },
  { country: 'Saudi Arabia', visaType: 'Employer-sponsored work visa (Iqama)', requirements: 'Job offer, medical examination, passport, attested educational documents', age: '21 - 58 years', minQualification: 'Diploma / Degree', experience: '2 - 5+ years', language: 'English / Arabic', processingTime: '14 - 21 Days', avgCost: 'SAR 4,000 - 7,000' },
  { country: 'Qatar', visaType: 'Employer-sponsored work visa', requirements: 'Employment contract, passport, medical test, police clearance', age: '18 - 55 years', minQualification: '10th/12th / Degree', experience: '1 - 3+ years', language: 'English', processingTime: '10 - 18 Days', avgCost: 'QAR 2,500 - 4,000' },
  { country: 'Oman', visaType: 'Employer-sponsored work visa', requirements: 'Valid job offer, passport, medical fitness, employer sponsorship', age: '21 - 60 years', minQualification: 'Diploma / Degree', experience: '2 - 4+ years', language: 'English', processingTime: '12 - 20 Days', avgCost: 'OMR 300 - 500' },
  { country: 'Kuwait', visaType: 'Employer-sponsored work visa', requirements: 'Employment contract, medical examination, security clearance, passport', age: '21 - 55 years', minQualification: 'Diploma / Degree', experience: '2 - 5+ years', language: 'English / Arabic', processingTime: '20 - 30 Days', avgCost: 'KWD 250 - 450' },
  { country: 'Bahrain', visaType: 'Employer-sponsored work visa', requirements: 'Employer sponsorship, passport, medical certificate', age: '18 - 60 years', minQualification: '10th/12th / Degree', experience: '1 - 3+ years', language: 'English', processingTime: '7 - 14 Days', avgCost: 'BHD 150 - 300' },
  { country: 'Singapore', visaType: 'Employment Pass / S Pass / Work Permit', requirements: 'Job offer, minimum salary requirements, qualifications, employer application', age: '21 - 50 years', minQualification: 'Diploma / Bachelor Degree', experience: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 28 Days', avgCost: 'SGD 600 - 1,200' },
  { country: 'Malaysia', visaType: 'Employment Pass', requirements: 'Job offer, relevant qualifications, employer sponsorship', age: '27 - 55 years', minQualification: 'Bachelor Degree', experience: '3 - 5+ years', language: 'English', processingTime: '21 - 35 Days', avgCost: 'MYR 1,500 - 3,000' },
  { country: 'Canada', visaType: 'Temporary Work Permit', requirements: 'Job offer (often with LMIA), education, work experience, language requirements', age: '18 - 47 years', minQualification: 'Bachelor / Master Degree', experience: '2 - 6+ years', language: 'IELTS General 6.5+', processingTime: '60 - 90 Days', avgCost: 'CAD 155 (Permit)' },
  { country: 'Australia', visaType: 'Skilled Visa / Employer Sponsored Visa', requirements: 'Skills assessment, English proficiency, age criteria, work experience, health & character', age: 'Under 45 years', minQualification: 'Diploma / Bachelor Degree', experience: '2 - 5+ years', language: 'IELTS 6.0+ / PTE 50+', processingTime: '45 - 90 Days', avgCost: 'AUD 1,455 - 3,035' },
  { country: 'New Zealand', visaType: 'Accredited Employer Work Visa', requirements: 'Job offer from an accredited employer, qualifications, health & character requirements', age: '18 - 55 years', minQualification: 'Bachelor Degree / Diploma', experience: '2 - 4+ years', language: 'IELTS 6.5+', processingTime: '30 - 60 Days', avgCost: 'NZD 750 - 1,200' },
  { country: 'United Kingdom', visaType: 'Skilled Worker Visa', requirements: 'Job offer from a licensed sponsor, English proficiency, salary threshold', age: '18+ years', minQualification: 'Degree / NVQ Level 3', experience: '2 - 4+ years', language: 'IELTS UKVI B1 / B2', processingTime: '15 - 30 Days', avgCost: 'GBP 625 - 1,423' },
  { country: 'Germany', visaType: 'EU Blue Card / Work Visa', requirements: 'Recognized qualification, employment contract, salary threshold', age: '18 - 55 years', minQualification: 'Recognized Bachelor / Master', experience: '2 - 5+ years', language: 'German B1/B2 or English', processingTime: '30 - 60 Days', avgCost: 'EUR 75' },
  { country: 'Netherlands', visaType: 'Highly Skilled Migrant Visa', requirements: 'Employer sponsorship, minimum salary, recognized employer', age: '18+ years', minQualification: 'Bachelor / Master Degree', experience: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 30 Days', avgCost: 'EUR 380' },
  { country: 'Ireland', visaType: 'Critical Skills Employment Permit', requirements: 'Job offer in an eligible occupation, salary threshold', age: '18+ years', minQualification: 'Degree', experience: '2 - 5+ years', language: 'English', processingTime: '28 - 45 Days', avgCost: 'EUR 1,000' },
  { country: 'United States', visaType: 'H-1B, L-1, O-1 Categories', requirements: 'Employer sponsorship, relevant qualifications, visa category eligibility', age: '21+ years', minQualification: 'Bachelor / Master Degree', experience: '3 - 6+ years', language: 'English (Fluent)', processingTime: '60 - 180 Days', avgCost: 'USD 460 - 2,500+' },
  { country: 'Japan', visaType: 'Engineer/Specialist Work Visa', requirements: 'Job offer, degree or relevant experience, employer sponsorship', age: '20 - 50 years', minQualification: 'Bachelor Degree / 10 yrs Exp', experience: '1 - 5+ years', language: 'JLPT N3/N2 or English', processingTime: '30 - 60 Days', avgCost: 'JPY 3,000' },
  { country: 'South Korea', visaType: 'E-series Work Visa', requirements: 'Job offer, qualifications, employer sponsorship', age: '18 - 45 years', minQualification: 'Degree / Vocational', experience: '1 - 3+ years', language: 'TOPIK Level 2+ or English', processingTime: '21 - 45 Days', avgCost: 'KRW 60,000 - 100,000' }
];

export const PRICING_PLANS = [
  {
    name: 'Basic Candidate',
    target: 'Job Seekers',
    price: '$0',
    period: 'forever free',
    features: [
      'Unlimited Job Browsing & Search',
      'Basic Profile Registration',
      'Single Resume Upload',
      'Standard Application Tracking',
      'Email Notifications'
    ],
    recommended: false,
    cta: 'Get Started Free'
  },
  {
    name: 'Professional VIP',
    target: 'Executive Candidates',
    price: '$99',
    period: 'one-time',
    features: [
      'AI Resume Optimization & ATS Score',
      'Priority Headhunter Recommendation',
      'GCC Visa Eligibility Verification',
      'Direct Recruiter Messaging',
      'Guaranteed 3 Interview Introductions'
    ],
    recommended: true,
    cta: 'Upgrade to VIP'
  },
  {
    name: 'Employer Standard',
    target: 'Growing Businesses',
    price: '$499',
    period: 'per active job',
    features: [
      '30-Day Featured Job Listing',
      'Access to Candidate Database (Top 50)',
      'AI Resume Matching Engine',
      'Standard Background Verification (1 Check)',
      'Dedicated Account Manager'
    ],
    recommended: false,
    cta: 'Post a Job Now'
  },
  {
    name: 'Enterprise Custom',
    target: 'Global Corporations & Government',
    price: 'Custom',
    period: 'annual contract',
    features: [
      'Unlimited Bulk Job Postings',
      'Dedicated C-Suite Executive Search Unit',
      'End-to-End MOHRE / GCC Visa Processing',
      '6-Point Comprehensive Background Audit',
      'Custom SLA & 24/7 Priority Support'
    ],
    recommended: false,
    cta: 'Contact Sales'
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Marcus Vance',
    role: 'Vice President of Engineering',
    company: 'Emaar Properties, Dubai',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    quote: 'Revival International placed 14 senior MEP engineers for our Downtown Dubai mega-project in under 21 days. Their GCC visa processing speed and background checks are unmatched.',
    rating: 5,
    videoThumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Dr. Sarah Al-Mansoori',
    role: 'Director of Human Resources',
    company: 'Saudi German Hospital Group',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    quote: 'Finding specialized ICU consultants for our expansion in Riyadh was seamless. Revival International handled credential verification, Prometric licensing, and Iqama visas expertly.',
    rating: 5,
    videoThumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Vikram Malhotra',
    role: 'Senior Offshore Operations Lead',
    company: 'Placed at Gulf Petroleum, KSA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    quote: 'From my initial application on Revival International portal to stepping foot in Dhahran took just 18 days. The candidate dashboard kept me informed at every visa milestone.',
    rating: 5,
    videoThumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80'
  }
];

export const BLOG_POSTS = [
  {
    id: 'post-1',
    title: 'UAE Labour Law Updates 2026: Key Changes for Foreign Workers & Employers',
    category: 'Visa Updates',
    date: 'August 2, 2026',
    author: 'Tariq Al-Hashemi',
    summary: 'Essential breakdown of recent MOHRE regulations regarding end-of-service gratuity schemes, remote work permits, and green visa quotas.',
    readTime: '5 min read'
  },
  {
    id: 'post-2',
    title: 'How Saudi Vision 2030 is Driving Demand for International Tech & Energy Talent',
    category: 'Recruitment Tips',
    date: 'July 28, 2026',
    author: 'Elena Rostova',
    summary: 'A deep dive into mega-projects like NEOM, Qiddiya, and Red Sea Global and the core engineering competencies top recruiters are hunting for.',
    readTime: '7 min read'
  },
  {
    id: 'post-3',
    title: 'Pass the GCC Background Verification: 5 Document Attestation Pitfalls to Avoid',
    category: 'Career Advice',
    date: 'July 20, 2026',
    author: 'James Sterling',
    summary: 'Avoid common embassy attestation delays and fake degree red flags when relocating to Dubai, Riyadh, or Doha.',
    readTime: '4 min read'
  }
];

export const FAQS = [
  {
    category: 'General',
    question: 'How does Revival International differ from standard recruitment agencies?',
    answer: 'Revival International is a full-service international HR consultancy based in Dubai. Beyond talent placement, we manage end-to-end visa processing, 6-point background verifications, WPS payroll, and relocation support across UAE, GCC, Europe, and Asia.'
  },
  {
    category: 'Candidate',
    question: 'Are there any registration or placement fees for job candidates?',
    answer: 'No! Under UAE labor laws and international ethics, candidates are NEVER charged placement fees for basic job applications. Optional VIP services like AI resume rewriting and express headhunter matching are available.'
  },
  {
    category: 'Visa',
    question: 'Who sponsors the work visa when I get hired through Revival International?',
    answer: 'Your employment visa and work permit are sponsored directly by the hiring employer or through Revival Manpower Outsourcing licenses in accordance with UAE MOHRE / Saudi MHRSD regulations.'
  },
  {
    category: 'Verification',
    question: 'What is included in the Revival Background Verification module?',
    answer: 'Our 6-point audit verifies educational degrees with granting universities, audits 5-year employment records with past HR departments, conducts criminal record checks, performs address verification, checks ID authenticity, and obtains peer references.'
  },
  {
    category: 'Employers',
    question: 'What retention guarantee does Revival International provide for executive placements?',
    answer: 'We provide a comprehensive 90-day to 180-day free replacement guarantee. If a placed candidate leaves or does not meet contractual expectations, we replace them at no extra charge.'
  }
];

export const JOBS_LIST = [
  {
    id: 'job-101',
    title: 'Senior Civil Project Manager',
    company: 'Al Habtoor Contracting LLC',
    country: 'UAE',
    location: 'Dubai, Business Bay',
    salary: 'AED 35,000 - 45,000 / month',
    experience: '8 - 12 Years',
    jobType: 'Full-time',
    category: 'Construction',
    description: 'Leading Dubai tier-1 contractor seeking an experienced Civil Project Manager to oversee luxury high-rise residential & commercial developments in Downtown Dubai.',
    skills: ['Project Management', 'FIDIC Contracts', 'Primavera P6', 'Site Leadership', 'Budget Control'],
    qualification: "Bachelor's / Master's Degree in Civil Engineering",
    benefits: ['Tax-free salary', 'Family Visa Sponsorship', 'Private Medical Insurance', 'Annual Flight Tickets', 'Performance Bonus'],
    postedDate: '2 days ago',
    featured: true
  },
  {
    id: 'job-102',
    title: 'Offshore Drilling Engineer',
    company: 'Gulf Petroleum Resources',
    country: 'Saudi Arabia',
    location: 'Dhahran / Offshore',
    salary: 'SAR 38,000 - 52,000 / month',
    experience: '6 - 10 Years',
    jobType: 'Contract',
    category: 'Oil & Gas',
    description: 'Supervise deepwater offshore drilling operations, well construction, and safety protocols in compliance with Aramco standards.',
    skills: ['Drilling Operations', 'Well Control', 'IWCF Certified', 'HSE Management', 'Subsea Engineering'],
    qualification: "B.Sc. Petroleum / Mechanical Engineering",
    benefits: ['Rotational Schedule (28/28)', 'Free Housing & Transportation', 'Full Health Coverage', 'Completion Bonus'],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-103',
    title: 'Senior ICU Registered Nurse',
    company: 'King Faisal Specialist Hospital',
    country: 'Saudi Arabia',
    location: 'Riyadh',
    salary: 'SAR 18,000 - 24,000 / month',
    experience: '4 - 7 Years',
    jobType: 'Full-time',
    category: 'Healthcare',
    description: 'JCI-accredited tertiary care hospital hiring ICU nurses for critical care units. Full visa assistance provided by Revival International.',
    skills: ['Critical Care', 'Ventilator Management', 'BLS / ACLS Certified', 'Patient Assessment'],
    qualification: "B.Sc. Nursing + Active Nursing License (Saudi Prometric preferred)",
    benefits: ['Tax-free package', 'Free Furnished Apartment', '30 Days Annual Leave', 'Flight Allowance'],
    postedDate: '3 days ago',
    featured: true
  },
  {
    id: 'job-104',
    title: 'Executive Chef - Luxury Resort',
    company: 'Atlantis Resorts & Hotels',
    country: 'UAE',
    location: 'Dubai, Palm Jumeirah',
    salary: 'AED 28,000 - 35,000 / month',
    experience: '7 - 10 Years',
    jobType: 'Full-time',
    category: 'Hospitality',
    description: 'Oversee 5-star fine dining culinary operations, menu development, food safety compliance, and team of 40+ international chefs.',
    skills: ['Fine Dining Culinary', 'Menu Engineering', 'HACCP Certification', 'P&L Management'],
    qualification: "Diploma / Degree in Culinary Arts",
    benefits: ['Service Charge Sharing', 'Luxury Accommodation', 'Family Medical Insurance', 'Worldwide Hotel Discounts'],
    postedDate: 'Just now',
    featured: true
  },
  {
    id: 'job-105',
    title: 'Lead Cloud Solutions Architect (AWS / Azure)',
    company: 'TechVision International',
    country: 'Singapore',
    location: 'Marina Bay Financial Centre',
    salary: 'SGD 12,000 - 16,000 / month',
    experience: '8 - 14 Years',
    jobType: 'Full-time',
    category: 'IT & Software',
    description: 'Design enterprise cloud infrastructure and microservices for tier-1 fintech institutions across Southeast Asia.',
    skills: ['AWS Architect Professional', 'Kubernetes', 'Terraform', 'DevOps CI/CD', 'Security Compliance'],
    qualification: "Bachelor / Master in Computer Science or IT",
    benefits: ['Employment Pass Sponsorship', 'Equity Options', 'Flexible Remote Days', 'Comprehensive Health & Dental'],
    postedDate: '4 days ago',
    featured: false
  },
  {
    id: 'job-106',
    title: 'Senior Mechanical Maintenance Engineer',
    company: 'Emirates Global Aluminium',
    country: 'UAE',
    location: 'Abu Dhabi, KIZAD',
    salary: 'AED 22,000 - 28,000 / month',
    experience: '5 - 8 Years',
    jobType: 'Full-time',
    category: 'Engineering',
    description: 'Maintain heavy industrial smelting equipment, turbines, hydraulic systems, and lead predictive maintenance protocols.',
    skills: ['Hydraulics & Pneumatics', 'CMMS SAP', 'Root Cause Analysis', 'Preventive Maintenance'],
    qualification: "B.E. / B.Tech Mechanical Engineering",
    benefits: ['Housing Allowance', 'Schooling Allowance for Children', 'End of Service Gratuity'],
    postedDate: '5 days ago',
    featured: false
  },
  {
    id: 'job-107',
    title: 'Supply Chain & Logistics Director',
    company: 'DP World Global Logistics',
    country: 'Qatar',
    location: 'Doha, Hamad Port',
    salary: 'QAR 40,000 - 55,000 / month',
    experience: '10 - 15 Years',
    jobType: 'Full-time',
    category: 'Logistics',
    description: 'Strategic leadership of port logistics, freight forwarding, warehouse automation, and GCC distribution network.',
    skills: ['Supply Chain Strategy', 'Warehouse Automation', 'Customs Clearance', 'Vendor Management'],
    qualification: "Master in Supply Chain / MBA",
    benefits: ['Executive Bonus', 'Executive Car', 'Family Visa & Private Healthcare', 'Annual Executive Tickets'],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-108',
    title: 'Senior Commercial Aircraft Maintenance Technician',
    company: 'Qatar Airways Cargo',
    country: 'Qatar',
    location: 'Doha International Airport',
    salary: 'QAR 20,000 - 26,000 / month',
    experience: '5 - 9 Years',
    jobType: 'Full-time',
    category: 'Aviation',
    description: 'Perform line and base maintenance for Boeing 777 / Airbus A350 aircraft fleet. EASA Part-66 B1/B2 license required.',
    skills: ['EASA Part-66 B1/B2', 'Boeing 777 Type Rating', 'Aviation Safety', 'Avionics'],
    qualification: "Aircraft Maintenance License / Degree",
    benefits: ['Duty Travel Privileges', 'Tax Free Base Salary', 'Furnished Accommodation', 'Concessionary Flight Tickets'],
    postedDate: '3 days ago',
    featured: false
  },
  {
    id: 'job-109',
    title: 'MEP BIM Manager - High Rise Development',
    company: 'ALDAR Properties',
    country: 'UAE',
    location: 'Abu Dhabi, Yas Island',
    salary: 'AED 30,000 - 38,000 / month',
    experience: '7 - 10 Years',
    jobType: 'Full-time',
    category: 'Construction',
    description: 'Lead 3D/4D BIM model coordination, clash detection, and MEP systems integration for mega mixed-use urban developments.',
    skills: ['Revit MEP', 'Navisworks Manage', 'BIM Level 2', 'Clash Resolution', 'COBie'],
    qualification: "B.Sc. Mechanical / Electrical Engineering",
    benefits: ['Family Accommodation Allowance', 'Premium Health Plan', 'Relocation Package'],
    postedDate: 'Just now',
    featured: true
  },
  {
    id: 'job-110',
    title: 'Senior Cybersecurity Operations Specialist',
    company: 'Riyadh Bank Digital Unit',
    country: 'Saudi Arabia',
    location: 'Riyadh, KAFD',
    salary: 'SAR 32,000 - 42,000 / month',
    experience: '6 - 10 Years',
    jobType: 'Full-time',
    category: 'Banking',
    description: 'Monitor SOC alerts, lead threat hunting, incident response, and ensure SAMA cybersecurity framework compliance for digital banking ops.',
    skills: ['SIEM Splunk', 'Threat Hunting', 'CISSP / CISM', 'Incident Response', 'SAMA Compliance'],
    qualification: "Bachelor in Cybersecurity / Computer Science",
    benefits: ['Performance Incentive', 'Family Visa & Flights', 'Executive Health Insurance'],
    postedDate: '2 days ago',
    featured: false
  }
];

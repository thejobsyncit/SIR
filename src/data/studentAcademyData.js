/**
 * Revival International - Student Academy Data Store
 * Competitive Examinations, Verified Partner Academies, and Audited Courses
 */

export const ACADEMY_DEPARTMENTS = [
  {
    id: 'gov',
    title: 'Government Exams',
    subtitle: 'SSC, UPSC, TNPSC & State Civil Services',
    icon: 'Building2',
    color: 'emerald',
    badge: 'High Demand',
    description: 'Premier coaching for Union and State administrative services, revenue, police, and central commission examinations.'
  },
  {
    id: 'banking',
    title: 'Banking and Finance',
    subtitle: 'SBI, IBPS, RBI & Regulatory Bodies',
    icon: 'Landmark',
    color: 'blue',
    badge: 'Annual Cycles',
    description: 'Specialized preparation for Probationary Officers, Clerical Cadres, and Central Banking Regulatory posts.'
  },
  {
    id: 'engineering',
    title: 'Engineering and Technology',
    subtitle: 'GATE, SSC JE, RRB JE & PSU Recruitments',
    icon: 'Cpu',
    color: 'purple',
    badge: 'Technical',
    description: 'Advanced technical coaching for graduate aptitude, junior engineering, and public sector engineering appointments.'
  },
  {
    id: 'medical',
    title: 'Medical and Healthcare',
    subtitle: 'NEET UG, NEET PG & Allied Healthcare',
    icon: 'HeartPulse',
    color: 'rose',
    badge: 'Prestigious',
    description: 'Rigorous medical entrance guidance for undergraduate MBBS/BDS and postgraduate residency entrance.'
  },
  {
    id: 'teaching',
    title: 'Teaching and Education',
    subtitle: 'CTET, TNTET, UGC NET & State Eligibility',
    icon: 'GraduationCap',
    color: 'amber',
    badge: 'Eligibility',
    description: 'Comprehensive pedagogy and subject-matter coaching for national teacher certification and university lectureship.'
  },
  {
    id: 'defence',
    title: 'Defence and Police',
    subtitle: 'NDA, CDS, AFCAT & Police Sub-Inspectors',
    icon: 'Shield',
    color: 'cyan',
    badge: 'Armed Forces',
    description: 'Officer training academy prep, physical efficiency advice, and SSB interview psychological screening.'
  },
  {
    id: 'management',
    title: 'Management and Business',
    subtitle: 'CAT, MAT, CMAT & Executive MBA',
    icon: 'Briefcase',
    color: 'indigo',
    badge: 'IIMs & Top B-Schools',
    description: 'Quantitative aptitude, data interpretation, verbal ability, and GD-PI coaching for premier business institutes.'
  },
  {
    id: 'law',
    title: 'Law and Judicial Services',
    subtitle: 'CLAT UG/PG, AILET & Judiciary',
    icon: 'Scale',
    color: 'slate',
    badge: 'NLUs',
    description: 'Legal reasoning, constitutional law, and analytical jurisprudence prep for National Law Universities.'
  },
  {
    id: 'science-arts',
    title: 'Science, Arts, Commerce and Humanities',
    subtitle: 'CSIR NET, IIT JAM & CUET (UG/PG)',
    icon: 'BookOpen',
    color: 'teal',
    badge: 'Central Universities',
    description: 'Pure sciences, economics, humanities, and commerce entrance coaching for central university postgraduate research.'
  },
  {
    id: 'railway-design',
    title: 'Railway, Agriculture, Architecture and Design',
    subtitle: 'RRB NTPC, ICAR AIEEA, NATA, NID DAT',
    icon: 'Compass',
    color: 'orange',
    badge: 'Specialized',
    description: 'Non-technical railway posts, agricultural sciences, architecture drawing aptitude, and national design entrance.'
  },
  {
    id: 'intl-tests',
    title: 'International Entrance & Language Tests',
    subtitle: 'IELTS, TOEFL, GRE, GMAT, SAT',
    icon: 'Globe2',
    color: 'gold',
    badge: 'Global Pathways',
    isInternational: true,
    description: 'Official test prep for international university admissions, language proficiency, and global academic migration.'
  }
];

export const ACADEMY_EXAMINATIONS = [
  // 1. Government Exams
  {
    id: 'exam-upsc-cse',
    departmentId: 'gov',
    code: 'UPSC CSE',
    name: 'Civil Services Examination (IAS, IPS, IFS)',
    conductingBody: 'Union Public Service Commission',
    eligibility: "Bachelor's Degree in any discipline",
    pattern: 'Prelims (GS + CSAT) → Mains (9 Papers) → Personality Test',
    popularSubjects: ['General Studies', 'Public Administration', 'Geography', 'Sociology'],
    nextCycle: 'May 2027 Prelims',
    shortDesc: 'The premier competitive examination in India for recruitment to higher civil services including IAS, IPS, and IFS.'
  },
  {
    id: 'exam-ssc-cgl',
    departmentId: 'gov',
    code: 'SSC CGL',
    name: 'Combined Graduate Level Examination',
    conductingBody: 'Staff Selection Commission',
    eligibility: 'Graduate from a recognized university',
    pattern: 'Tier 1 (Computer Based) → Tier 2 (Advanced Aptitude & Language)',
    popularSubjects: ['Quantitative Aptitude', 'General Awareness', 'English Comprehension', 'Reasoning'],
    nextCycle: 'September 2026',
    shortDesc: 'Recruitment to Group B and C gazetted and non-gazetted posts across central government ministries.'
  },
  {
    id: 'exam-tnpsc-grp1',
    departmentId: 'gov',
    code: 'TNPSC Group 1 & 2',
    name: 'Tamil Nadu Public Service Commission Combined Civil Services',
    conductingBody: 'TNPSC',
    eligibility: 'Any Degree with Tamil language competency',
    pattern: 'Prelims (GS + Aptitude) → Mains (Descriptive) → Oral Test',
    popularSubjects: ['Tamil Society & Heritage', 'General Studies', 'Development Admin in TN'],
    nextCycle: 'July 2026',
    shortDesc: 'State administrative recruitment for Deputy Collector, DSP, Commercial Tax Officer, and Municipal Commissioner posts.'
  },

  // 2. Banking and Finance
  {
    id: 'exam-sbi-po',
    departmentId: 'banking',
    code: 'SBI PO',
    name: 'State Bank of India Probationary Officer',
    conductingBody: 'State Bank of India',
    eligibility: 'Graduation in any discipline',
    pattern: 'Prelims (100 Marks) → Mains (250 Marks) → GE & Interview',
    popularSubjects: ['Banking Awareness', 'Data Analysis', 'Reasoning', 'English'],
    nextCycle: 'November 2026',
    shortDesc: 'Flagship probationary officer entrance test for India’s largest public sector banking institution.'
  },
  {
    id: 'exam-ibps-po',
    departmentId: 'banking',
    code: 'IBPS PO / Clerk',
    name: 'Institute of Banking Personnel Selection CWE',
    conductingBody: 'IBPS',
    eligibility: 'Graduation from any recognized university',
    pattern: 'Preliminary Exam → Mains Examination → Interview (PO)',
    popularSubjects: ['Financial Awareness', 'Computer Aptitude', 'Reasoning', 'Quantitative Ability'],
    nextCycle: 'October 2026',
    shortDesc: 'Unified recruitment gateway for 11 participating public sector banks across India.'
  },
  {
    id: 'exam-rbi-grade-b',
    departmentId: 'banking',
    code: 'RBI Grade B',
    name: 'Reserve Bank of India Officers in Grade B (General)',
    conductingBody: 'Reserve Bank of India Services Board',
    eligibility: 'Graduation with min 60% marks',
    pattern: 'Phase 1 (Online Objective) → Phase 2 (Descriptive ESI, FM & English) → Interview',
    popularSubjects: ['Economic & Social Issues', 'Finance & Management', 'General Awareness'],
    nextCycle: 'September 2026',
    shortDesc: 'Elite central banking leadership position managing monetary policy, financial stability, and currency operations.'
  },

  // 3. Engineering and Technology
  {
    id: 'exam-gate',
    departmentId: 'engineering',
    code: 'GATE',
    name: 'Graduate Aptitude Test in Engineering',
    conductingBody: 'IITs & IISc on rotation',
    eligibility: 'Graduating or completed B.E./B.Tech/B.Arch/M.Sc',
    pattern: '3-Hour Computer Based Test (65 Questions, 100 Marks)',
    popularSubjects: ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'ECE'],
    nextCycle: 'February 2027',
    shortDesc: 'Gateway for M.Tech admissions at IITs/NITs and direct recruitment to premier PSUs like ONGC, IOCL, and NTPC.'
  },
  {
    id: 'exam-ssc-je',
    departmentId: 'engineering',
    code: 'SSC JE',
    name: 'Staff Selection Commission Junior Engineer',
    conductingBody: 'Staff Selection Commission',
    eligibility: 'Diploma or Degree in Civil / Electrical / Mechanical Engineering',
    pattern: 'Paper 1 (CBT Objective) → Paper 2 (CBT Core Engineering)',
    popularSubjects: ['Civil Engineering', 'Electrical Engineering', 'General Intelligence'],
    nextCycle: 'June 2026',
    shortDesc: 'Junior Engineer appointments in CPWD, MES, Border Roads Organisation, and Central Water Commission.'
  },
  {
    id: 'exam-rrb-je',
    departmentId: 'engineering',
    code: 'RRB JE',
    name: 'Railway Recruitment Board Junior Engineer',
    conductingBody: 'Ministry of Railways (RRB)',
    eligibility: 'Diploma or B.E./B.Tech in relevant engineering stream',
    pattern: 'CBT 1 (Screening) → CBT 2 (Technical & Environmental Studies)',
    popularSubjects: ['Technical Abilities', 'Basic Computers & Applications', 'Physics & Chemistry'],
    nextCycle: 'August 2026',
    shortDesc: 'Technical engineering supervisor posts in Indian Railways maintenance, rolling stock, and track divisions.'
  },

  // 4. Medical and Healthcare
  {
    id: 'exam-neet-ug',
    departmentId: 'medical',
    code: 'NEET UG',
    name: 'National Eligibility cum Entrance Test (Undergraduate)',
    conductingBody: 'National Testing Agency (NTA)',
    eligibility: '10+2 with Physics, Chemistry, Biology/Biotech (Min 50%)',
    pattern: 'Pen & Paper Test: 200 Questions (Physics 50, Chemistry 50, Biology 100)',
    popularSubjects: ['Human Physiology', 'Genetics', 'Organic Chemistry', 'Electrodynamics'],
    nextCycle: 'May 2027',
    shortDesc: 'The single nationwide entrance test for admission to MBBS, BDS, AYUSH, and veterinary medical colleges.'
  },
  {
    id: 'exam-neet-pg',
    departmentId: 'medical',
    code: 'NEET PG / INI-CET',
    name: 'Postgraduate Medical Entrance & Institutes of National Importance',
    conductingBody: 'NBEMS / AIIMS New Delhi',
    eligibility: 'MBBS Degree with completed 1-year rotating internship',
    pattern: 'Computer Based Test covering Pre-clinical, Para-clinical & Clinical subjects',
    popularSubjects: ['General Medicine', 'Surgery', 'Obstetrics & Gynaecology', 'Pathology'],
    nextCycle: 'March 2027',
    shortDesc: 'Qualifying examination for MD, MS, PG Diploma, and DNB medical specialist training.'
  },

  // 5. Teaching and Education
  {
    id: 'exam-ctet',
    departmentId: 'teaching',
    code: 'CTET',
    name: 'Central Teacher Eligibility Test',
    conductingBody: 'Central Board of Secondary Education (CBSE)',
    eligibility: "Senior Secondary / Graduation with D.El.Ed / B.Ed",
    pattern: 'Paper 1 (Class I to V) & Paper 2 (Class VI to VIII)',
    popularSubjects: ['Child Development & Pedagogy', 'Mathematics', 'Language 1 & 2', 'EVS'],
    nextCycle: 'July 2026',
    shortDesc: 'Mandatory certification for teaching appointments in central schools like KVS, NVS, and Central Tibetan Schools.'
  },
  {
    id: 'exam-tntet',
    departmentId: 'teaching',
    code: 'TNTET',
    name: 'Tamil Nadu Teacher Eligibility Test',
    conductingBody: 'Teachers Recruitment Board (TRB Tamil Nadu)',
    eligibility: 'D.T.Ed / B.Ed with specified educational credentials',
    pattern: 'Paper I (Primary) & Paper II (Upper Primary / Graduate Teacher)',
    popularSubjects: ['Educational Psychology', 'Tamil Pedagogy', 'Social Science / Maths-Science'],
    nextCycle: 'August 2026',
    shortDesc: 'State eligibility certificate required for appointment as primary and graduate teachers in Tamil Nadu schools.'
  },
  {
    id: 'exam-ugc-net',
    departmentId: 'teaching',
    code: 'UGC NET',
    name: 'University Grants Commission National Eligibility Test',
    conductingBody: 'National Testing Agency (NTA)',
    eligibility: "Master's Degree with minimum 55% marks",
    pattern: 'Paper 1 (Teaching & Research Aptitude) + Paper 2 (Specialized Subject)',
    popularSubjects: ['Teaching Aptitude', 'Research Methodology', 'Higher Education System'],
    nextCycle: 'June 2026 & Dec 2026',
    shortDesc: 'Eligibility for Assistant Professorship and award of Junior Research Fellowship (JRF) in Indian universities.'
  },

  // 6. Defence and Police
  {
    id: 'exam-nda',
    departmentId: 'defence',
    code: 'NDA & NA',
    name: 'National Defence Academy & Naval Academy Examination',
    conductingBody: 'Union Public Service Commission',
    eligibility: '12th Class pass (Physics & Maths for Air Force/Navy)',
    pattern: 'Written (Maths 300 + GAT 600) → 5-Day SSB Interview',
    popularSubjects: ['Mathematics', 'English', 'General Knowledge & Current Affairs'],
    nextCycle: 'September 2026',
    shortDesc: 'Direct entry for young cadets into the Army, Navy, and Air Force wings of the National Defence Academy, Khadakwasla.'
  },
  {
    id: 'exam-cds',
    departmentId: 'defence',
    code: 'CDS',
    name: 'Combined Defence Services Examination',
    conductingBody: 'UPSC',
    eligibility: 'Degree for IMA/OTA, Engineering for Naval/Air Force Academy',
    pattern: 'Written (English + GK + Elementary Maths) → SSB Interview',
    popularSubjects: ['English Comprehension', 'General Knowledge', 'Elementary Mathematics'],
    nextCycle: 'September 2026',
    shortDesc: 'Graduate officer entry for Indian Military Academy, Officers Training Academy, Indian Naval Academy, and Air Force Academy.'
  },
  {
    id: 'exam-afcat',
    departmentId: 'defence',
    code: 'AFCAT',
    name: 'Air Force Common Admission Test',
    conductingBody: 'Indian Air Force',
    eligibility: 'Graduate (min 60%) with Maths & Physics at 10+2 level',
    pattern: 'Online Exam (100 Questions, 300 Marks) + EKT (For Technical) → AFSB',
    popularSubjects: ['Verbal Ability', 'Numerical Ability', 'Military Reasoning', 'General Awareness'],
    nextCycle: 'August 2026',
    shortDesc: 'Commissioned officer recruitment for Flying, Ground Duty Technical, and Ground Duty Non-Technical branches of the IAF.'
  },

  // 7. Management and Business
  {
    id: 'exam-cat',
    departmentId: 'management',
    code: 'CAT',
    name: 'Common Admission Test (IIMs)',
    conductingBody: 'Indian Institutes of Management (IIMs)',
    eligibility: "Bachelor's Degree with minimum 50% aggregate",
    pattern: 'CBT: VARC (24 Qs), DILR (20 Qs), Quantitative Aptitude (22 Qs)',
    popularSubjects: ['Data Interpretation', 'Logical Reasoning', 'Quantitative Ability', 'Reading Comprehension'],
    nextCycle: 'November 2026',
    shortDesc: 'The gold standard entrance examination for admission into 21 Indian Institutes of Management and top tier business schools.'
  },
  {
    id: 'exam-mat-cmat',
    departmentId: 'management',
    code: 'MAT / CMAT',
    name: 'Management Aptitude Test & Common Management Admission Test',
    conductingBody: 'AIMA & NTA',
    eligibility: 'Graduates in any discipline',
    pattern: 'Language Comprehension, Math Skills, Data Analysis, Intelligence & Critical Reasoning',
    popularSubjects: ['General Awareness', 'Innovation & Entrepreneurship', 'Logical Reasoning'],
    nextCycle: 'May 2026 / Dec 2026',
    shortDesc: 'National level management entrance tests accepted by over 1,000 AICTE-approved business schools across India.'
  },

  // 8. Law
  {
    id: 'exam-clat',
    departmentId: 'law',
    code: 'CLAT (UG/PG)',
    name: 'Common Law Admission Test',
    conductingBody: 'Consortium of National Law Universities',
    eligibility: '10+2 with 45% (UG) / LL.B. with 50% (PG)',
    pattern: 'Reading-based passage questions (120 Questions in 2 Hours)',
    popularSubjects: ['Legal Reasoning', 'Current Affairs including GK', 'Logical Reasoning', 'English Language'],
    nextCycle: 'December 2026',
    shortDesc: 'Centralized entrance exam for admission into 24 premier National Law Universities in India.'
  },
  {
    id: 'exam-ailet',
    departmentId: 'law',
    code: 'AILET',
    name: 'All India Law Entrance Test',
    conductingBody: 'National Law University, Delhi',
    eligibility: '10+2 with 45% marks',
    pattern: '150 Questions: English Language, Current Affairs & GK, Logical Reasoning',
    popularSubjects: ['Critical Reasoning', 'Analytical Ability', 'Contemporary Legal Current Affairs'],
    nextCycle: 'December 2026',
    shortDesc: 'Exclusive competitive entrance test for BA LL.B. (Hons.) and LL.M. admissions at NLU Delhi.'
  },

  // 9. Science, Arts, Commerce and Humanities
  {
    id: 'exam-csir-net',
    departmentId: 'science-arts',
    code: 'CSIR NET',
    name: 'Council of Scientific & Industrial Research NET',
    conductingBody: 'NTA',
    eligibility: 'M.Sc. or equivalent degree with 55% marks',
    pattern: 'Part A (General Aptitude) + Part B (Subject MCQs) + Part C (Higher Order Scientific Concept)',
    popularSubjects: ['Chemical Sciences', 'Life Sciences', 'Mathematical Sciences', 'Physical Sciences'],
    nextCycle: 'June 2026 & Dec 2026',
    shortDesc: 'Determines eligibility for JRF and Lectureship in basic and applied sciences across national laboratories and universities.'
  },
  {
    id: 'exam-iit-jam',
    departmentId: 'science-arts',
    code: 'IIT JAM',
    name: 'Joint Admission Test for Masters',
    conductingBody: 'IITs on rotation',
    eligibility: "Undergraduate degree in science or mathematics",
    pattern: 'Computer-Based Test with MCQs, MSQs, and Numerical Answer Type (NAT) questions',
    popularSubjects: ['Biotechnology', 'Chemistry', 'Geology', 'Mathematics', 'Mathematical Statistics', 'Physics'],
    nextCycle: 'February 2027',
    shortDesc: 'Entrance test for M.Sc. (2-year), Joint M.Sc.-Ph.D., and Dual Degree programmes at IITs and IISc.'
  },
  {
    id: 'exam-cuet-pg',
    departmentId: 'science-arts',
    code: 'CUET (UG & PG)',
    name: 'Common University Entrance Test',
    conductingBody: 'National Testing Agency',
    eligibility: 'Class 12th for UG / Bachelor’s Degree for PG',
    pattern: 'Domain-Specific Subject Tests + General Aptitude + Language Test',
    popularSubjects: ['Economics', 'English Literature', 'Commerce & Accountancy', 'Political Science'],
    nextCycle: 'May - June 2026',
    shortDesc: 'Single window admission test for central universities including DU, JNU, BHU, and Jamia Millia Islamia.'
  },

  // 10. Railway, Agriculture, Architecture and Design
  {
    id: 'exam-rrb-ntpc',
    departmentId: 'railway-design',
    code: 'RRB NTPC',
    name: 'Non-Technical Popular Categories (Railways)',
    conductingBody: 'Railway Recruitment Control Board',
    eligibility: '12th Pass or Graduate depending on post level',
    pattern: '1st Stage CBT (Screening) → 2nd Stage CBT → Typing Skill Test / CBAT',
    popularSubjects: ['General Awareness', 'Mathematics', 'General Intelligence & Reasoning'],
    nextCycle: 'October 2026',
    shortDesc: 'Recruitment for Station Master, Goods Guard, Commercial Apprentice, and Traffic Assistant in Indian Railways.'
  },
  {
    id: 'exam-icar-aieea',
    departmentId: 'railway-design',
    code: 'ICAR AIEEA',
    name: 'All India Entrance Examination for Admission in Agriculture',
    conductingBody: 'NTA & ICAR',
    eligibility: '10+2 with PCB/PCM/Agriculture for UG; B.Sc. Agri for PG',
    pattern: 'Computer Based Test covering Core Agricultural Sciences & Plant Biotechnology',
    popularSubjects: ['Agronomy', 'Horticulture', 'Soil Science', 'Agricultural Economics'],
    nextCycle: 'June 2026',
    shortDesc: 'Gateway for undergraduate and postgraduate admissions into State Agricultural Universities and ICAR Deemed Universities.'
  },
  {
    id: 'exam-nata-nid',
    departmentId: 'railway-design',
    code: 'NATA & NID DAT',
    name: 'National Aptitude Test in Architecture & NID Design Aptitude',
    conductingBody: 'Council of Architecture & National Institute of Design',
    eligibility: '10+2 with Physics, Chemistry & Mathematics for NATA; 10+2 any stream for NID',
    pattern: 'Drawing Aptitude, Visual Spatial Perception, Design Sensitivity & Mathematics',
    popularSubjects: ['Perspective Drawing', 'Color Theory', 'Architectural Awareness', 'Lateral Thinking'],
    nextCycle: 'April - June 2026',
    shortDesc: 'Premier entrance tests for B.Arch programmes nationwide and Bachelor of Design (B.Des) at National Institute of Design.'
  },

  // 11. International Entrance & Language Tests (Displayed Separately)
  {
    id: 'exam-ielts',
    departmentId: 'intl-tests',
    code: 'IELTS Academic / General',
    name: 'International English Language Testing System',
    conductingBody: 'IDP / British Council / Cambridge English',
    eligibility: 'No formal restriction; recommended for age 16+',
    pattern: 'Listening (30m), Reading (60m), Writing (60m), Speaking (11-14m) — 9-Band scale',
    popularSubjects: ['Academic Writing Task 1 & 2', 'Critical Reading', 'Fluency & Pronunciation'],
    nextCycle: 'Weekly test dates available year-round',
    shortDesc: 'The globally accepted English language assessment for study, work, and migration to UK, Canada, Australia, and New Zealand.'
  },
  {
    id: 'exam-toefl',
    departmentId: 'intl-tests',
    code: 'TOEFL iBT',
    name: 'Test of English as a Foreign Language',
    conductingBody: 'Educational Testing Service (ETS)',
    eligibility: 'Open to all students and professionals',
    pattern: 'Reading, Listening, Speaking, and Writing sections (Score range 0-120)',
    popularSubjects: ['Integrated Writing', 'Campus Audio Comprehension', 'Academic Vocabulary'],
    nextCycle: 'Continuous bi-weekly test windows',
    shortDesc: 'Standardized English proficiency test widely preferred by universities in the United States and global institutions.'
  },
  {
    id: 'exam-gre',
    departmentId: 'intl-tests',
    code: 'GRE General',
    name: 'Graduate Record Examination (Shorter Version)',
    conductingBody: 'Educational Testing Service (ETS)',
    eligibility: 'Undergraduate students and degree holders',
    pattern: 'Analytical Writing (1 task), Verbal Reasoning (27 Qs), Quantitative Reasoning (27 Qs) in under 2 hours',
    popularSubjects: ['Vocabulary in Context', 'Algebra & Data Analysis', 'Argumentative Writing'],
    nextCycle: 'On-demand appointments at testing centers',
    shortDesc: 'Standardized assessment required for admission into Master’s, Ph.D., and business school graduate programs worldwide.'
  },
  {
    id: 'exam-gmat',
    departmentId: 'intl-tests',
    code: 'GMAT Focus Edition',
    name: 'Graduate Management Admission Test Focus',
    conductingBody: 'Graduate Management Admission Council (GMAC)',
    eligibility: 'Prospective MBA and business master’s candidates',
    pattern: 'Quantitative Reasoning (21 Qs), Verbal Reasoning (23 Qs), Data Insights (20 Qs) — Total 2h 15m',
    popularSubjects: ['Data Sufficiency', 'Multi-Source Reasoning', 'Critical Reasoning'],
    nextCycle: 'Flexible year-round appointments',
    shortDesc: 'The premier exam tailored specifically for international MBA, Master in Finance, and Business Analytics programs.'
  },
  {
    id: 'exam-sat',
    departmentId: 'intl-tests',
    code: 'Digital SAT',
    name: 'Scholastic Assessment Test (Digital)',
    conductingBody: 'College Board',
    eligibility: 'High school students preparing for undergraduate study',
    pattern: 'Reading and Writing (2 modules, 54 Qs) + Math (2 modules, 44 Qs) in 2h 14m',
    popularSubjects: ['Passport to Advanced Math', 'Craft and Structure', 'Information and Ideas'],
    nextCycle: 'March, May, June, August, October, December',
    shortDesc: 'Standardized assessment for undergraduate college admissions in the United States and international partner universities.'
  }
];

export const VERIFIED_ACADEMIES = [
  // 1. Shankar IAS Academy
  {
    id: 'aca-shankar-ias',
    name: 'Shankar IAS Academy',
    shortName: 'Shankar IAS',
    establishedYear: 2004,
    rating: 4.9,
    reviewsCount: 1420,
    logoUrl: '/assets/academies/shankar_ias.png',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'AP 107, 12th Main Road, Shanthi Colony, Anna Nagar, Chennai - 600040',
    phone: '+91 44 4340 8003',
    email: 'enquiry@shankarias.in',
    website: 'https://www.shankariasacademy.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Renowned civil services training institute with over two decades of experience, producing top IAS, IPS, and TNPSC Group 1 rankers through structured classroom lectures and all-India test series.',
    facilities: [
      'Air-conditioned smart multimedia lecture halls',
      '24/7 Dedicated library with 15,000+ reference volumes',
      'High-speed Wi-Fi and online digital classroom portals',
      'Separate hostel accommodation guidance for outstation candidates',
      'Biometric attendance and performance telemetry'
    ],
    teachingMethods: [
      'Comprehensive syllabus coverage with subject matter veterans',
      'Daily current affairs analysis dossiers and weekly editorial synthesis',
      'Prelims test series with all-India relative percentile ranking',
      'Rigorous answer-writing enrichment with individual mentor critique',
      'Simulated personality test panels featuring retired civil servants'
    ],
    primaryExams: ['exam-upsc-cse', 'exam-tnpsc-grp1', 'exam-ssc-cgl']
  },

  // 2. Vajiram & Ravi
  {
    id: 'aca-vajiram-ravi',
    name: 'Vajiram & Ravi Institute for Civil Services',
    shortName: 'Vajiram & Ravi',
    establishedYear: 1976,
    rating: 4.8,
    reviewsCount: 2850,
    logoUrl: '/assets/academies/vajiram.png',
    city: 'New Delhi',
    state: 'Delhi',
    address: '9-B, Bada Bazaar Marg, Old Rajinder Nagar, New Delhi - 110060',
    phone: '+91 11 4100 7400',
    email: 'admissions@vajiramandravi.com',
    website: 'https://vajiramandravi.com',
    learningModes: ['Classroom', 'Online Live'],
    description: 'India’s pioneer institute for Civil Services preparation based in Old Rajinder Nagar, New Delhi, renowned for faculty expertise and foundational General Studies coaching.',
    facilities: [
      'Ergonomic acoustic-treated lecture auditoriums',
      'Exclusive digital student portal with recorded lecture archives',
      'Comprehensive printed study material dispatched nationwide',
      'Dedicated doubt-clearing sessions with associate faculty'
    ],
    teachingMethods: [
      'Conceptual clarity with historical and geopolitical continuity',
      'Integrated Prelims-cum-Mains pedagogical framework',
      'Intensive mains answer-writing laboratories',
      'Subject-wise mentorship with former civil service exam toppers'
    ],
    primaryExams: ['exam-upsc-cse']
  },

  // 3. Vision IAS
  {
    id: 'aca-vision-ias',
    name: 'Vision IAS Education Center',
    shortName: 'Vision IAS',
    establishedYear: 2008,
    rating: 4.9,
    reviewsCount: 3100,
    logoUrl: '/assets/academies/vision_ias.png',
    city: 'New Delhi & Chennai',
    state: 'Multi-City',
    address: 'Apex Tower, 19, Pusa Road, Karol Bagh, New Delhi / Anna Nagar, Chennai',
    phone: '+91 84680 22022',
    email: 'enquiry@visionias.in',
    website: 'https://visionias.in',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Tech-forward research-driven civil services preparation network famous for its All-India Test Series, monthly current affairs booklets, and value-added materials.',
    facilities: [
      'Interactive smart touch panels in all classrooms',
      'Custom AI performance analytics dashboard for mock assessments',
      'Extensive offline test rooms simulating UPSC examination conditions'
    ],
    teachingMethods: [
      'Data-driven assessment tracking weak knowledge quadrants',
      'Micro-level current affairs linking to static syllabus themes',
      'One-on-one personal mentorship for Mains strategy formulation'
    ],
    primaryExams: ['exam-upsc-cse', 'exam-ssc-cgl']
  },

  // 4. KingMakers IAS Academy
  {
    id: 'aca-kingmakers-ias',
    name: 'KingMakers IAS Academy',
    shortName: 'KingMakers IAS',
    establishedYear: 2013,
    rating: 4.8,
    reviewsCount: 980,
    logoUrl: '/assets/academies/kingmakers.png',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'No. 614, P.H. Road, Aminjikarai, Chennai - 600029',
    phone: '+91 94442 27273',
    email: 'info@kingmakersias.com',
    website: 'https://kingmakersiasacademy.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Top-tier South Indian civil services institute focusing on personalized guidance, TNPSC Group 1/2 success, and bilingual English-Tamil coaching.',
    facilities: [
      'Quiet air-conditioned study hall with individual cubicles',
      'Dedicated mentoring cabins for daily answer script evaluations',
      'Library with complete TN government Tamil heritage publications'
    ],
    teachingMethods: [
      'Bilingual lecture delivery matching the exact state exam requirements',
      'Weekly unit tests with immediate model answers and mark breakdown',
      'Guest masterclasses by serving IAS, IPS, and District Revenue Officers'
    ],
    primaryExams: ['exam-tnpsc-grp1', 'exam-upsc-cse']
  },

  // 5. Suresh IAS Academy
  {
    id: 'aca-suresh-ias',
    name: 'Suresh IAS Academy',
    shortName: 'Suresh IAS',
    establishedYear: 2006,
    rating: 4.7,
    reviewsCount: 1650,
    logoUrl: '/assets/academies/suresh_ias.png',
    city: 'Madurai & Chennai',
    state: 'Tamil Nadu',
    address: 'Near Mattuthavani Bus Stand, Madurai / Koyambedu, Chennai',
    phone: '+91 98421 88444',
    email: 'contact@sureshias.com',
    website: 'https://sureshiasacademy.store',
    learningModes: ['Classroom', 'Online Live'],
    description: 'Premier coaching institution in Tamil Nadu with consistent record selections in TNPSC Group 1, Group 2, Group 4, and Tamil Nadu Sub-Inspector cadres.',
    facilities: [
      'Massive capacity test halls accommodating 500+ students',
      'Digital library and published Tamil school book compilation guides'
    ],
    teachingMethods: [
      'Strict adherence to Samacheer Kalvi school syllabus foundations',
      'Continuous daily tests and instant ranking leaderboards'
    ],
    primaryExams: ['exam-tnpsc-grp1', 'exam-ssc-cgl']
  },

  // 6. Career Power / Adda247
  {
    id: 'aca-career-power',
    name: 'Career Power (Adda247)',
    shortName: 'Career Power',
    establishedYear: 2010,
    rating: 4.7,
    reviewsCount: 3400,
    logoUrl: '/assets/academies/career_power.png',
    city: 'Chennai & New Delhi',
    state: 'Pan-India',
    address: 'T. Nagar, Chennai / Laxmi Nagar, New Delhi',
    phone: '+91 87500 04873',
    email: 'support@careerpower.in',
    website: 'https://www.careerpower.in',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Leading bank PO, clerk, and regulatory exam coaching network offering high-speed calculation short-cuts and computer lab test practices.',
    facilities: [
      'Dedicated computer lab with 80+ terminals for online mock exams',
      'Mobile learning app with unlimited sectional quizzes'
    ],
    teachingMethods: [
      'Speed math techniques and Vedic arithmetic for rapid calculation',
      'Weekly full-length mocks replicating SBI and IBPS interface',
      'Specialized banking awareness capsules and monetary updates'
    ],
    primaryExams: ['exam-sbi-po', 'exam-ibps-po', 'exam-rbi-grade-b', 'exam-ssc-cgl']
  },

  // 7. Oliveboard Learning
  {
    id: 'aca-oliveboard',
    name: 'Oliveboard Learning Institute',
    shortName: 'Oliveboard',
    establishedYear: 2012,
    rating: 4.8,
    reviewsCount: 4200,
    logoUrl: '/assets/academies/oliveboard.png',
    city: 'Bangalore & Chennai',
    state: 'Karnataka / Tamil Nadu',
    address: 'Koramangala 4th Block, Bangalore / Velachery, Chennai',
    phone: '+91 76760 48848',
    email: 'support@oliveboard.in',
    website: 'https://www.oliveboard.in',
    learningModes: ['Online Live', 'Hybrid'],
    description: 'Renowned for rigorous high-difficulty mock tests and precise performance analytics for SBI PO, RBI Grade B, and Regulatory Bodies.',
    facilities: [
      'Cloud-based live interactive learning platform',
      'AI-enabled weak area recommendation engine'
    ],
    teachingMethods: [
      'Deep conceptual classes for RBI ESI (Economic & Social Issues)',
      'Descriptive English evaluation by professional language examiners'
    ],
    primaryExams: ['exam-rbi-grade-b', 'exam-sbi-po', 'exam-ibps-po']
  },

  // 8. RACE Bank Institute (Veranda RACE)
  {
    id: 'aca-veranda-race',
    name: 'Veranda RACE (Chennai RACE)',
    shortName: 'Veranda RACE',
    establishedYear: 2012,
    rating: 4.7,
    reviewsCount: 2200,
    logoUrl: '/assets/academies/race.png',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'GR Complex, No. 407/408, Mount Road, Nandanam, Chennai - 600035',
    phone: '+91 73977 78555',
    email: 'support@verandarace.com',
    website: 'https://www.verandarace.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Famous for its 6-level practice methodology, Real Intensive Program (RIP), and dedicated mentor labs for Banking, SSC, and Railway examinations.',
    facilities: [
      'Computer lab with 200+ testing stations',
      'Circular doubt clarification tables staffed by senior mentors',
      'Extensive library of speed-practice worksheets'
    ],
    teachingMethods: [
      'Basic foundation classes → Basic circle → Extreme circle practice',
      'Real Intensive Program (RIP) residential immersion bootcamps',
      'Simulated mock banking panel interviews'
    ],
    primaryExams: ['exam-sbi-po', 'exam-ibps-po', 'exam-ssc-cgl', 'exam-rrb-ntpc']
  },

  // 9. Made Easy
  {
    id: 'aca-made-easy',
    name: 'MADE EASY Education',
    shortName: 'MADE EASY',
    establishedYear: 2001,
    rating: 4.9,
    reviewsCount: 5200,
    logoUrl: '/assets/academies/made_easy.png',
    city: 'New Delhi & Hyderabad',
    state: 'Multi-City',
    address: '44-A/1, Kalu Sarai, Sarvapriya Vihar, New Delhi - 110016',
    phone: '+91 11 4512 4612',
    email: 'info@madeeasy.in',
    website: 'https://www.madeeasy.in',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'India’s undisputed leader in GATE and ESE engineering coaching, led by B. Singh (Ex-IES), with highest All-India Rank 1 tallies.',
    facilities: [
      'State-of-the-art engineering demonstration labs',
      'National online test platform replicating GATE IIT interface',
      'Comprehensive MADE EASY publication books and workbook suites'
    ],
    teachingMethods: [
      'Concept derivation from fundamental physical principles',
      'Over 1,000+ solved numerical problems per engineering subject',
      'Specialized engineering interview coaching for ONGC, IOCL, and BARC'
    ],
    primaryExams: ['exam-gate', 'exam-ssc-je', 'exam-rrb-je']
  },

  // 10. ACE Engineering Academy
  {
    id: 'aca-ace-engineering',
    name: 'ACE Engineering Academy',
    shortName: 'ACE Academy',
    establishedYear: 1995,
    rating: 4.8,
    reviewsCount: 3800,
    logoUrl: '/assets/academies/ace_eng.png',
    city: 'Hyderabad & Chennai',
    state: 'Telangana / Tamil Nadu',
    address: 'No. 204, Rahman Plaza, Station Road, Abids, Hyderabad / Anna Nagar, Chennai',
    phone: '+91 40 2323 4418',
    email: 'aceacademy@aceenggacademy.com',
    website: 'https://www.aceenggacademy.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Three decades of excellence in GATE, SSC JE, and State PSC engineering recruitments with top rank achievements across all branches.',
    facilities: [
      'Spacious AC lecture halls with audio-visual projection',
      'Computer testing lab simulating TCS iON test centers',
      'Exclusive hostel tie-ups for long-term outstation students'
    ],
    teachingMethods: [
      'Exhaustive classroom syllabus coverage by senior engineering doctorates',
      'Regular subject-wise test series with video solutions',
      'Post-GATE admission counseling for IIT/NIT specialization selection'
    ],
    primaryExams: ['exam-gate', 'exam-ssc-je', 'exam-rrb-je']
  },

  // 11. Engineers Academy
  {
    id: 'aca-engineers-academy',
    name: 'Engineers Academy',
    shortName: 'Engineers Academy',
    establishedYear: 2007,
    rating: 4.7,
    reviewsCount: 1900,
    logoUrl: '/assets/academies/engineers_academy.png',
    city: 'Jaipur & Delhi',
    state: 'Multi-City',
    address: '100-101, Engineers Academy Building, Gopalpura Bypass, Jaipur',
    phone: '+91 80944 41777',
    email: 'info@engineersacademy.org',
    website: 'https://engineersacademy.org',
    learningModes: ['Classroom', 'Online Live'],
    description: 'Premier national institute focusing on Junior Engineer recruitment (SSC JE, RRB JE, State JE) and diploma-to-degree competitive exams.',
    facilities: [
      'Digital classroom recording studio for missed class reviews',
      'Library equipped with technical standards codes and manuals'
    ],
    teachingMethods: [
      'Concise formula sheets and high-yield technical topic summaries',
      'Extensive MCQ practice aligned with previous 10 years JE papers'
    ],
    primaryExams: ['exam-ssc-je', 'exam-rrb-je', 'exam-gate']
  },

  // 12. Allen Career Institute
  {
    id: 'aca-allen',
    name: 'ALLEN Career Institute',
    shortName: 'ALLEN',
    establishedYear: 1988,
    rating: 4.9,
    reviewsCount: 6500,
    logoUrl: '/assets/academies/allen.png',
    city: 'Kota, Chennai & Bangalore',
    state: 'Multi-City',
    address: 'SANKALP, CP-6, Indra Vihar, Kota / Nelson Manickam Road, Chennai',
    phone: '+91 744 355 6677',
    email: 'info@allen.ac.in',
    website: 'https://www.allen.ac.in',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'India’s foremost medical and engineering entrance coaching system with proven history of top ranks in NEET UG and national Olympiads.',
    facilities: [
      'World-class campuses with monitored study halls',
      'ALLEN App with real-time test analysis, video solutions, and parent portal',
      'Dedicated student welfare and mental wellness counselors'
    ],
    teachingMethods: [
      'Structured academic calendar with topic-by-topic daily worksheets',
      'Rigorous All-India Leader Test Series under exact NEET conditions',
      'Continuous NCERT line-by-line decoding and doubt resolution'
    ],
    primaryExams: ['exam-neet-ug', 'exam-neet-pg']
  },

  // 13. Aakash Educational Services
  {
    id: 'aca-aakash',
    name: 'Aakash Educational Services (AESL)',
    shortName: 'Aakash BYJU’S',
    establishedYear: 1988,
    rating: 4.8,
    reviewsCount: 5800,
    logoUrl: '/assets/academies/aakash.png',
    city: 'Pan-India (300+ Centers)',
    state: 'Multi-City',
    address: 'Aakash Tower, 8, Pusa Road, New Delhi / Anna Salai, Chennai',
    phone: '+91 1800 102 2727',
    email: 'corporate@aesl.in',
    website: 'https://www.aakash.ac.in',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Iconic healthcare education coaching network providing disciplined NEET preparation, AIIMS modules, and school board integration.',
    facilities: [
      'Interactive iTutor digital video kiosks',
      'Extensive biology anatomy model displays and audio-visual diagrams',
      'Center-wide parent consultation and performance reporting'
    ],
    teachingMethods: [
      'Error analysis notebooks tracking individual student mistakes',
      'Fortnightly test series with country-wide percentile ranking'
    ],
    primaryExams: ['exam-neet-ug']
  },

  // 14. DAMS (Delhi Academy of Medical Sciences)
  {
    id: 'aca-dams',
    name: 'DAMS (Delhi Academy of Medical Sciences)',
    shortName: 'DAMS',
    establishedYear: 1999,
    rating: 4.8,
    reviewsCount: 3100,
    logoUrl: '/assets/academies/dams.png',
    city: 'New Delhi & Chennai',
    state: 'Multi-City',
    address: 'East Patel Nagar, New Delhi / Kilpauk, Chennai',
    phone: '+91 98101 27855',
    email: 'info@damsdelhi.com',
    website: 'https://www.damsdelhi.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Premier medical graduate coaching destination for NEET PG, INI-CET, and FMGE under the guidance of Dr. Sumer Sethi and veteran specialists.',
    facilities: [
      'DAMS e-Medicoz digital platform with clinical case discussions',
      'Extensive clinical imaging bank and ECG/Histopathology slides'
    ],
    teachingMethods: [
      'Clinical vignette integration across all 19 medical subjects',
      'High-yield Grand Tests (CBT) with clinical correlation sessions'
    ],
    primaryExams: ['exam-neet-pg']
  },

  // 15. Teachers Academy
  {
    id: 'aca-teachers-academy',
    name: 'Teachers Academy',
    shortName: 'Teachers Academy',
    establishedYear: 2011,
    rating: 4.7,
    reviewsCount: 1100,
    logoUrl: '/assets/academies/teachers_acad.png',
    city: 'Prayagraj & Delhi',
    state: 'Uttar Pradesh / Delhi',
    address: 'Civil Lines, Prayagraj / GTB Nagar, New Delhi',
    phone: '+91 96289 59237',
    email: 'help@teachersacademy.in',
    website: 'https://teachersacademy.in',
    learningModes: ['Online Live', 'Classroom'],
    description: 'Dedicated institution specializing exclusively in teaching entrance examinations including CTET, TNTET, UGC NET, and State Teacher Recruitment.',
    facilities: [
      'Specialized pedagogy research library',
      'Online testing portal with bilingual question papers'
    ],
    teachingMethods: [
      'Constructivist pedagogical theory breakdown with real classroom case studies',
      'Child development psychology question analysis'
    ],
    primaryExams: ['exam-ctet', 'exam-tntet', 'exam-ugc-net']
  },

  // 16. BYJU’S Exam Prep (Teaching & UGC NET)
  {
    id: 'aca-byjus-prep',
    name: 'Gradeup / BYJU’S Exam Prep',
    shortName: 'BYJU’S Exam Prep',
    establishedYear: 2015,
    rating: 4.6,
    reviewsCount: 4800,
    logoUrl: '/assets/academies/byjus_prep.png',
    city: 'Noida & Bangalore',
    state: 'Multi-City',
    address: 'Tower B, Express Trade Towers, Sector 132, Noida',
    phone: '+91 96500 52904',
    email: 'support@byjusexamprep.com',
    website: 'https://byjusexamprep.com',
    learningModes: ['Online Live'],
    description: 'Live interactive classes, daily practice quizzes, and structured mock papers for UGC NET Paper 1 and CTET teacher recruitment.',
    facilities: [
      'Interactive mobile app with live doubt resolution',
      'Downloadable PDF revision notes and formula sheets'
    ],
    teachingMethods: [
      'Structured 90-day comprehensive course plans with mock milestones',
      'Paper 1 research methodology and mathematical reasoning mastery'
    ],
    primaryExams: ['exam-ugc-net', 'exam-ctet', 'exam-tntet']
  },

  // 17. Cavalier India
  {
    id: 'aca-cavalier-india',
    name: 'The Cavalier Defence Academy',
    shortName: 'Cavalier India',
    establishedYear: 1993,
    rating: 4.9,
    reviewsCount: 2400,
    logoUrl: '/assets/academies/cavalier.png',
    city: 'Bangalore, Delhi & Chennai',
    state: 'Multi-City',
    address: 'Near Hebbal Flyover, Bangalore / Mukherjee Nagar, Delhi',
    phone: '+91 80 2343 0084',
    email: 'info@cavalierindia.com',
    website: 'https://www.cavalierindia.com',
    learningModes: ['Classroom', 'Hybrid'],
    description: 'India’s premier defence preparatory academy run by retired Brigadier and Colonel-rank officers, famous for NDA, CDS, AFCAT, and SSB ground obstacles.',
    facilities: [
      'Full-size outdoor SSB obstacle course (GTO ground)',
      'Psychological testing halls matching Service Selection Boards',
      'Military-style drill grounds and boarding accommodation'
    ],
    teachingMethods: [
      'Rigorous academic coaching for NDA/CDS written exams',
      'Realistic SSB interview simulation with personal feedback',
      'Group Planning Exercise (GPE) and lecturette practice sessions'
    ],
    primaryExams: ['exam-nda', 'exam-cds', 'exam-afcat']
  },

  // 18. Centurion Defence Academy
  {
    id: 'aca-centurion-defence',
    name: 'Centurion Defence Academy',
    shortName: 'Centurion Defence',
    establishedYear: 2012,
    rating: 4.8,
    reviewsCount: 1850,
    logoUrl: '/assets/academies/centurion.png',
    city: 'Lucknow & Dehradun',
    state: 'Uttar Pradesh / Uttarakhand',
    address: 'Alambagh, Lucknow / Rajpur Road, Dehradun',
    phone: '+91 97959 77776',
    email: 'info@centuriondefenceacademy.com',
    website: 'https://www.centuriondefenceacademy.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Known for producing officers in Indian Armed Forces with state-of-the-art obstacle training grounds and specialized NDA school-integrated programs.',
    facilities: [
      'Dedicated GTO training obstacle ground with over 20 obstacle types',
      'Air-conditioned digital classrooms with smart interactive whiteboards'
    ],
    teachingMethods: [
      'Officer-like qualities (OLQ) behavioral development mentoring',
      'SSB Psychological Dossier assessments (TAT, WAT, SRT, SDT)'
    ],
    primaryExams: ['exam-nda', 'exam-cds', 'exam-afcat']
  },

  // 19. T.I.M.E. (Triumphant Institute of Management Education)
  {
    id: 'aca-time',
    name: 'T.I.M.E. (Triumphant Institute of Management Education)',
    shortName: 'T.I.M.E.',
    establishedYear: 1992,
    rating: 4.8,
    reviewsCount: 5500,
    logoUrl: '/assets/academies/time.png',
    city: 'Chennai & Hyderabad',
    state: 'Pan-India',
    address: '95B, 2nd Floor, Siddamsetty Complex, Park Lane, Secunderabad / Anna Nagar, Chennai',
    phone: '+91 40 4008 8400',
    email: 'info@time4education.com',
    website: 'https://www.time4education.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'National leader in CAT, MAT, and CMAT coaching, renowned for the AIMCAT test series and comprehensive GD-PI-WAT interview training.',
    facilities: [
      'All-India AIMCAT testing infrastructure with percentile predictors',
      'Student portal with 200+ sectional tests and video explanations'
    ],
    teachingMethods: [
      'Concept modules starting from fundamental arithmetic to advanced CAT DILR',
      'Personal interview grooming sessions by IIM alumni faculty'
    ],
    primaryExams: ['exam-cat', 'exam-mat-cmat', 'exam-clat']
  },

  // 20. IMS Learning
  {
    id: 'aca-ims',
    name: 'IMS Learning Resources',
    shortName: 'IMS',
    establishedYear: 1977,
    rating: 4.8,
    reviewsCount: 4600,
    logoUrl: '/assets/academies/ims.png',
    city: 'Mumbai & Chennai',
    state: 'Pan-India',
    address: 'Nesco Center, Goregaon, Mumbai / Nungambakkam, Chennai',
    phone: '+91 22 6231 6161',
    email: 'enquiry@imsindia.com',
    website: 'https://www.imsindia.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Over 45 years of mentoring students for CAT, CMAT, GRE, and GMAT with personalized mentoring from Lead Mentors and SimCAT benchmarks.',
    facilities: [
      'Modern collaborative learning study lounges',
      'myIMS student learning portal with AI adaptive drill practice'
    ],
    teachingMethods: [
      '1-on-1 myPlan mentorship sessions tailored to individual student target percentiles',
      'Exhaustive workshops on advanced DILR sets and critical reading'
    ],
    primaryExams: ['exam-cat', 'exam-mat-cmat', 'exam-gmat', 'exam-gre']
  },

  // 21. Career Launcher
  {
    id: 'aca-career-launcher',
    name: 'Career Launcher (CL Educate)',
    shortName: 'Career Launcher',
    establishedYear: 1995,
    rating: 4.7,
    reviewsCount: 4900,
    logoUrl: '/assets/academies/cl.png',
    city: 'New Delhi, Chennai & Bangalore',
    state: 'Pan-India',
    address: 'A-45, Mohan Cooperative Industrial Estate, Mathura Road, New Delhi',
    phone: '+91 8882 120 120',
    email: 'support@careerlauncher.com',
    website: 'https://www.careerlauncher.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Premier coaching network for CLAT, CAT, and Civil Services with flagship test series, national rankings, and NLU/IIM alumni mentorship.',
    facilities: [
      'Aspiration.ai portal with real-time test benchmarking',
      'Comprehensive study booklets for legal reasoning and quantitative skills'
    ],
    teachingMethods: [
      'LST (Law School Tutorial) legal aptitude methodology for CLAT and AILET',
      'Passage-based reading techniques tailored to modern exam formats'
    ],
    primaryExams: ['exam-clat', 'exam-ailet', 'exam-cat', 'exam-cuet-pg']
  },

  // 22. LegalEdge by Toprankers
  {
    id: 'aca-legaledge',
    name: 'LegalEdge by Toprankers',
    shortName: 'LegalEdge',
    establishedYear: 2011,
    rating: 4.9,
    reviewsCount: 3200,
    logoUrl: '/assets/academies/legaledge.png',
    city: 'Bhopal, Delhi & Bangalore',
    state: 'Pan-India',
    address: 'MP Nagar, Bhopal / Connaught Place, New Delhi',
    phone: '+91 76765 64400',
    email: 'support@toprankers.com',
    website: 'https://www.toprankers.com/clat-online-coaching',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'India’s most successful law entrance prep academy, producing top CLAT and AILET rankers through rigorous passage-based mocks.',
    facilities: [
      'High-speed digital testing center for simulated law entrance mocks',
      'Comprehensive legal library with constitution and landmark case archives'
    ],
    teachingMethods: [
      'Passage-based analytical breakdown matching the new CLAT pattern',
      'Daily legal current affairs bulletins and critical reasoning workshops'
    ],
    primaryExams: ['exam-clat', 'exam-ailet']
  },

  // 23. Eduncle Learning
  {
    id: 'aca-eduncle',
    name: 'Eduncle Learning',
    shortName: 'Eduncle',
    establishedYear: 2013,
    rating: 4.7,
    reviewsCount: 2100,
    logoUrl: '/assets/academies/eduncle.png',
    city: 'Jaipur & Online',
    state: 'Rajasthan',
    address: 'Jawahar Nagar, Jaipur',
    phone: '+91 98294 89592',
    email: 'contact@eduncle.com',
    website: 'https://www.eduncle.com',
    learningModes: ['Online Live', 'Hybrid'],
    description: 'Specialized digital portal for CSIR NET, IIT JAM, and UGC NET preparation with subject-wise study material and solved test series.',
    facilities: [
      'Subject expert faculty panels across 14 scientific and humanities domains',
      'Digital test series with instant step-by-step mathematical solutions'
    ],
    teachingMethods: [
      'Topic-level problem breakdown and previous years paper analysis',
      'Focused mentorship for university research fellowship exams'
    ],
    primaryExams: ['exam-csir-net', 'exam-iit-jam', 'exam-cuet-pg']
  },

  // 24. IFAS (Institute for Advanced Studies)
  {
    id: 'aca-ifas',
    name: 'IFAS (Institute for Advanced Studies)',
    shortName: 'IFAS',
    establishedYear: 2002,
    rating: 4.8,
    reviewsCount: 2700,
    logoUrl: '/assets/academies/ifas.png',
    city: 'Pune & Jodhpur',
    state: 'Maharashtra / Rajasthan',
    address: 'Senapati Bapat Road, Pune / Pal Road, Jodhpur',
    phone: '+91 91722 66888',
    email: 'info@ifasonline.com',
    website: 'https://ifasonline.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'India’s top institute for CSIR NET Life Sciences, Chemical Sciences, Physical Sciences, and IIT JAM coaching with proven Rank 1 alumni.',
    facilities: [
      'Science resource lab with visual molecular models and interactive simulations',
      'Online test engine with Part C scientific reasoning questions'
    ],
    teachingMethods: [
      'Higher order conceptual breakdown for experimental scientific problems',
      'Daily practice problem sheets with detailed video explanations'
    ],
    primaryExams: ['exam-csir-net', 'exam-iit-jam']
  },

  // 25. BRDS (Bhanwar Rathore Design Studio)
  {
    id: 'aca-brds',
    name: 'BRDS (Bhanwar Rathore Design Studio)',
    shortName: 'BRDS',
    establishedYear: 2005,
    rating: 4.9,
    reviewsCount: 3600,
    logoUrl: '/assets/academies/brds.png',
    city: 'Ahmedabad, Delhi & Chennai',
    state: 'Multi-City',
    address: 'Drive In Road, Ahmedabad / Anna Nagar, Chennai',
    phone: '+91 98250 57598',
    email: 'info@rathoredesign.com',
    website: 'https://rathoredesign.com',
    learningModes: ['Classroom', 'Hybrid'],
    description: 'Premier national design and architecture entrance academy with highest selections in NATA, NID, CEED, and NIFT.',
    facilities: [
      'Professional architecture drafting tables and drawing studios',
      'Material handling and 3D modeling design workshops',
      'Extensive library of national design portfolios'
    ],
    teachingMethods: [
      'Freehand sketching and 2D/3D perspective drawing coaching',
      'Portfolio building and studio test / interview simulation'
    ],
    primaryExams: ['exam-nata-nid']
  },

  // 26. Agri Coaching Chandigarh
  {
    id: 'aca-agri-coaching',
    name: 'Agri Coaching Chandigarh',
    shortName: 'Agri Coaching',
    establishedYear: 2014,
    rating: 4.7,
    reviewsCount: 890,
    logoUrl: '/assets/academies/agri_coaching.png',
    city: 'Chandigarh',
    state: 'Chandigarh (UT)',
    address: 'Sector 34-A, Chandigarh',
    phone: '+91 98288 22277',
    email: 'info@agricoaching.in',
    website: 'https://agricoaching.in',
    learningModes: ['Classroom', 'Online Live'],
    description: 'Dedicated coaching center for agricultural competitive exams: ICAR AIEEA, IBPS AFO (Agricultural Field Officer), and State Agriculture Officer.',
    facilities: [
      'Agronomy and agricultural sciences specimen reference repository',
      'Dedicated test platform covering plant genetics, horticulture and soil science'
    ],
    teachingMethods: [
      'Systematic syllabus mapping according to ICAR Dean’s Committee curriculum',
      'Weekly subject-wise objective testing and current agricultural scheme capsules'
    ],
    primaryExams: ['exam-icar-aieea']
  },

  // 27. British Council India / IDP Partner
  {
    id: 'aca-british-council',
    name: 'British Council & IDP Authorized Test Center',
    shortName: 'British Council Partner',
    establishedYear: 1948,
    rating: 4.9,
    reviewsCount: 4200,
    logoUrl: '/assets/academies/british_council.png',
    city: 'Chennai, Bangalore & New Delhi',
    state: 'Pan-India',
    address: '737 Anna Salai, Chennai - 600002 / Kasturba Gandhi Marg, New Delhi',
    phone: '+91 120 456 9000',
    email: 'india.enquiries@britishcouncil.org',
    website: 'https://www.britishcouncil.in/exam/ielts',
    learningModes: ['Classroom', 'Online Live'],
    description: 'Official international testing partner and accredited preparation institution offering certified IELTS training and British pedagogy.',
    facilities: [
      'State-of-the-art computer testing lab with noise-cancelling headphones',
      'Extensive British Council library and online Road to IELTS portal'
    ],
    teachingMethods: [
      'Cambridge English certified native-level language trainers',
      'Strict 9-band rubric alignment for Speaking and Academic Writing',
      'Individual accent neutrality and vocabulary enrichment workshops'
    ],
    primaryExams: ['exam-ielts', 'exam-toefl']
  },

  // 28. Jamboree Education
  {
    id: 'aca-jamboree',
    name: 'Jamboree Education',
    shortName: 'Jamboree',
    establishedYear: 1993,
    rating: 4.9,
    reviewsCount: 5100,
    logoUrl: '/assets/academies/jamboree.png',
    city: 'Chennai, Mumbai, Delhi & Bangalore',
    state: 'Pan-India (35+ Centers)',
    address: 'Chamiers Road, Nandanam, Chennai / CP, New Delhi',
    phone: '+91 96431 33368',
    email: 'support@jamboreeindia.com',
    website: 'https://www.jamboreeindia.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'India’s oldest and top-rated test prep institute for GRE, GMAT, SAT, and TOEFL, renowned for high score yields and Ivy League admissions.',
    facilities: [
      'Modern computerized testing center matching Pearson VUE test centers',
      'Extensive digital question bank of 3,000+ proprietary exam questions'
    ],
    teachingMethods: [
      'Simplified question-type classification framework for GRE/GMAT quant',
      'Vocabulary mnemonics and sentence equivalence contextual mastery',
      'Comprehensive university admissions counseling alongside test preparation'
    ],
    primaryExams: ['exam-gre', 'exam-gmat', 'exam-sat', 'exam-toefl', 'exam-ielts']
  },

  // 29. Manya - The Princeton Review
  {
    id: 'aca-manya-princeton',
    name: 'Manya – The Princeton Review',
    shortName: 'Manya Princeton',
    establishedYear: 2002,
    rating: 4.8,
    reviewsCount: 4700,
    logoUrl: '/assets/academies/manya.png',
    city: 'Chennai, Bangalore & Hyderabad',
    state: 'Pan-India (45+ Centers)',
    address: 'Montieth Road, Egmore, Chennai / Koramangala, Bangalore',
    phone: '+91 1800 102 4646',
    email: 'info@manyagroup.com',
    website: 'https://www.manyagroup.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Exclusive Indian partner of The Princeton Review (USA), delivering globally acclaimed test preparation for SAT, GRE, GMAT, and IELTS.',
    facilities: [
      'The Princeton Review Student Portal with adaptive drill sets',
      'Official full-length score reports predicting university admission percentiles'
    ],
    teachingMethods: [
      'Patented Princeton Review pacing techniques and elimination strategies',
      'Small batch sizes ensuring individualized instructor attention'
    ],
    primaryExams: ['exam-sat', 'exam-gre', 'exam-gmat', 'exam-ielts', 'exam-toefl']
  },

  // 30. Kaplan Certified Partner (Revival Global Test Prep)
  {
    id: 'aca-revival-global-prep',
    name: 'Revival Global Test Prep & Academy',
    shortName: 'Revival Global Prep',
    establishedYear: 2018,
    rating: 4.9,
    reviewsCount: 1250,
    logoUrl: '/assets/academies/revival_prep.png',
    city: 'Dubai (UAE) & Chennai',
    state: 'International & India',
    address: 'Bur Dubai, Dubai, UAE / Nungambakkam High Road, Chennai',
    phone: '+971 4 390 1234',
    email: 'academy@revivalinternational.com',
    website: 'https://www.revivalinternational.com',
    learningModes: ['Classroom', 'Online Live', 'Hybrid'],
    description: 'Revival International’s proprietary global academic prep division specializing in elite test preparation for GRE, GMAT Focus, SAT, and IELTS.',
    facilities: [
      'Ultra-luxury executive study suites and smart conference seminar rooms',
      'Dual-hub presence across UAE and India with international test center simulations',
      'Dedicated one-on-one admissions advisory desk for US, UK, and EU universities'
    ],
    teachingMethods: [
      'Bespoke 1-on-1 diagnostic test auditing and customized score acceleration blueprints',
      'Real-time speaking practice with certified international examiners',
      'Direct integration with Revival International global university admissions service'
    ],
    primaryExams: ['exam-ielts', 'exam-toefl', 'exam-gre', 'exam-gmat', 'exam-sat']
  }
];

export const ACADEMY_COURSES = [
  // ----------------------------------------------------
  // UPSC CSE Courses
  // ----------------------------------------------------
  {
    id: 'crs-shankar-upsc-pre-cum-mains',
    academyId: 'aca-shankar-ias',
    examId: 'exam-upsc-cse',
    title: 'Integrated UPSC Prelims-cum-Mains Foundation Course',
    duration: '12 Months (Comprehensive)',
    learningMode: 'Hybrid (Classroom + Online)',
    fee: '₹1,45,000 (Incl. Taxes & Materials)',
    verifiedFee: true,
    syllabus: [
      'Module 1: General Studies Paper 1-4 Complete Foundation (History, Geography, Polity, Economy, Ethics)',
      'Module 2: CSAT Quantitative Aptitude, Logical Reasoning & Reading Comprehension',
      'Module 3: Daily Current Affairs Analysis & Monthly Compilation Mastery',
      'Module 4: 40 Prelims Mock Tests + 16 Mains Answer-Writing Simulations with Personal Feedback'
    ],
    batches: [
      { name: 'Weekday Morning Batch', timing: '07:30 AM - 10:30 AM', startDate: '15th June 2026', seatsLeft: 8 },
      { name: 'Weekday Evening Batch', timing: '06:00 PM - 09:00 PM', startDate: '1st July 2026', seatsLeft: 12 },
      { name: 'Weekend Intensive Batch', timing: 'Saturday & Sunday 09:00 AM - 05:00 PM', startDate: '20th June 2026', seatsLeft: 5 }
    ]
  },
  {
    id: 'crs-shankar-upsc-test-series',
    academyId: 'aca-shankar-ias',
    examId: 'exam-upsc-cse',
    title: 'All-India UPSC Prelims Test Series & Mentorship',
    duration: '6 Months',
    learningMode: 'Online Live & Classroom',
    fee: '₹18,500',
    verifiedFee: true,
    syllabus: [
      'Module 1: 30 Subject-wise Sectional Tests with NCERT mapping',
      'Module 2: 12 Full-Length Mock Exams strictly simulating UPSC negative marking',
      'Module 3: 8 Dedicated CSAT qualifying test papers',
      'Module 4: Post-test video discussions and comparative All-India ranking'
    ],
    batches: [
      { name: 'Weekend Test Cycle', timing: 'Sundays 09:30 AM - 11:30 AM', startDate: 'August 2026', seatsLeft: 25 }
    ]
  },
  {
    id: 'crs-vajiram-upsc-gs',
    academyId: 'aca-vajiram-ravi',
    examId: 'exam-upsc-cse',
    title: 'Vajiram General Studies Comprehensive Program',
    duration: '10 Months',
    learningMode: 'Classroom',
    fee: '₹1,75,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Comprehensive General Studies (Mains Papers I, II, III & IV)',
      'Module 2: Essay Writing Masterclasses and Structural Critique',
      'Module 3: Yellow Book Essential Subject Material & Recitals',
      'Module 4: Intensive Mains Answer-Writing Mentorship'
    ],
    batches: [
      { name: 'Morning Regular Batch', timing: '08:00 AM - 11:00 AM', startDate: '10th July 2026', seatsLeft: 4 }
    ]
  },
  {
    id: 'crs-vision-upsc-foundation',
    academyId: 'aca-vision-ias',
    examId: 'exam-upsc-cse',
    title: 'Vision IAS Fast-Track Foundation & Abhyaas Module',
    duration: '11 Months',
    learningMode: 'Hybrid',
    fee: '₹1,40,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: 800+ Hours of Live & Recorded Lectures',
      'Module 2: Monthly Current Affairs Magazines & Value Added Material',
      'Module 3: Abhyaas All-India Prelims & Mains Mock Series'
    ],
    batches: [
      { name: 'Batch 1 (Karol Bagh)', timing: '09:00 AM - 12:00 PM', startDate: '25th June 2026', seatsLeft: 10 }
    ]
  },
  {
    id: 'crs-kingmakers-upsc-gs',
    academyId: 'aca-kingmakers-ias',
    examId: 'exam-upsc-cse',
    title: 'KingMakers Civil Services Integrated Mentorship',
    duration: '1 Year',
    learningMode: 'Classroom / Online',
    fee: '₹1,15,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Complete GS Syllabus with Bilingual Explanations',
      'Module 2: Daily 2-Question Answer Writing & Peer Review',
      'Module 3: Personality Test Guidance by Bureaucrats'
    ],
    batches: [
      { name: 'Regular Batch', timing: '10:00 AM - 01:00 PM', startDate: '1st July 2026', seatsLeft: 15 }
    ]
  },

  // ----------------------------------------------------
  // TNPSC Group 1 & 2 Courses
  // ----------------------------------------------------
  {
    id: 'crs-shankar-tnpsc-grp1',
    academyId: 'aca-shankar-ias',
    examId: 'exam-tnpsc-grp1',
    title: 'TNPSC Group 1 & 2 Comprehensive Master Program',
    duration: '8 Months',
    learningMode: 'Hybrid (Classroom + Online)',
    fee: '₹48,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Unit 8 & 9 (History, Culture, Heritage & Socio-Political Movements in TN)',
      'Module 2: General Studies, Current Affairs & Mental Ability Aptitude',
      'Module 3: Mains Descriptive Tamil Eligibility Test & General Studies Papers',
      'Module 4: 35 Unit Tests + 10 Full-Length Mocks'
    ],
    batches: [
      { name: 'Morning Regular Batch', timing: '07:30 AM - 09:30 AM', startDate: '1st June 2026', seatsLeft: 14 },
      { name: 'Weekend Working Professionals', timing: 'Saturday & Sunday 10:00 AM - 04:00 PM', startDate: '6th June 2026', seatsLeft: 18 }
    ]
  },
  {
    id: 'crs-kingmakers-tnpsc-grp1',
    academyId: 'aca-kingmakers-ias',
    examId: 'exam-tnpsc-grp1',
    title: 'KingMakers TNPSC Group 1 Officer Blueprint',
    duration: '7 Months',
    learningMode: 'Classroom / Online',
    fee: '₹42,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Tamil Nadu Administration & Social Justice Foundations',
      'Module 2: General Science, Geography & Indian Economy',
      'Module 3: Mains Answer Evaluation & Interview Simulation'
    ],
    batches: [
      { name: 'Regular Day Batch', timing: '10:00 AM - 01:00 PM', startDate: '15th June 2026', seatsLeft: 9 }
    ]
  },
  {
    id: 'crs-suresh-tnpsc-grp1',
    academyId: 'aca-suresh-ias',
    examId: 'exam-tnpsc-grp1',
    title: 'Suresh IAS Academy Samacheer Kalvi TNPSC Group 1/2',
    duration: '6 Months',
    learningMode: 'Classroom',
    fee: '₹35,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Line-by-Line 6th to 12th School Book Question Bank Practice',
      'Module 2: Daily OMR Tests with Immediate State Ranks',
      'Module 3: Intensive Mains Descriptive Writing Camps'
    ],
    batches: [
      { name: 'Batch A (Madurai)', timing: '09:00 AM - 01:00 PM', startDate: '1st June 2026', seatsLeft: 20 },
      { name: 'Batch B (Chennai)', timing: '09:00 AM - 01:00 PM', startDate: '1st June 2026', seatsLeft: 15 }
    ]
  },

  // ----------------------------------------------------
  // SSC CGL Courses
  // ----------------------------------------------------
  {
    id: 'crs-career-power-ssc-cgl',
    academyId: 'aca-career-power',
    examId: 'exam-ssc-cgl',
    title: 'SSC CGL Tier 1 & Tier 2 Supreme Live Batch',
    duration: '5 Months',
    learningMode: 'Hybrid (Classroom + Online)',
    fee: '₹22,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Quantitative Aptitude (Advanced Geometry, Trigonometry, Algebra & Arithmetic)',
      'Module 2: General Intelligence, Analytical Reasoning & Non-verbal logic',
      'Module 3: English Comprehension, Grammar rules & Vocabulary builders',
      'Module 4: 100+ CBT Mock Tests based on latest TCS pattern'
    ],
    batches: [
      { name: 'Morning Fast-Track', timing: '08:00 AM - 11:00 AM', startDate: '10th June 2026', seatsLeft: 11 },
      { name: 'Evening Working Batch', timing: '06:30 PM - 08:30 PM', startDate: '15th June 2026', seatsLeft: 19 }
    ]
  },
  {
    id: 'crs-veranda-race-ssc-cgl',
    academyId: 'aca-veranda-race',
    examId: 'exam-ssc-cgl',
    title: 'Veranda RACE SSC CGL 6-Level Practice Method',
    duration: '6 Months',
    learningMode: 'Classroom',
    fee: '₹24,500',
    verifiedFee: true,
    syllabus: [
      'Module 1: Basic Foundation & Speed Maths Drills',
      'Module 2: Circle Practice & Extreme Circle Sessions',
      'Module 3: Computer Knowledge Module & Typing Speed Lab'
    ],
    batches: [
      { name: 'Chennai Regular Batch', timing: '09:30 AM - 01:30 PM', startDate: '1st June 2026', seatsLeft: 16 }
    ]
  },

  // ----------------------------------------------------
  // Banking (SBI PO, IBPS PO, RBI Grade B) Courses
  // ----------------------------------------------------
  {
    id: 'crs-career-power-sbi-po',
    academyId: 'aca-career-power',
    examId: 'exam-sbi-po',
    title: 'SBI PO Target Batch (Prelims + Mains + Interview)',
    duration: '4.5 Months',
    learningMode: 'Classroom / Online',
    fee: '₹19,500',
    verifiedFee: true,
    syllabus: [
      'Module 1: Data Analysis & Interpretation (Advanced Caselets, Radar Charts)',
      'Module 2: High-Level Reasoning (Matrix Puzzles, Critical Reasoning)',
      'Module 3: Banking & Financial Economy Awareness Capsules',
      'Module 4: Group Discussion & Personal Interview Simulation with Ex-AGM'
    ],
    batches: [
      { name: 'Target Batch 1', timing: '07:30 AM - 10:00 AM', startDate: '20th June 2026', seatsLeft: 14 }
    ]
  },
  {
    id: 'crs-oliveboard-rbi-grade-b',
    academyId: 'aca-oliveboard',
    examId: 'exam-rbi-grade-b',
    title: 'RBI Grade B Phase 1 + Phase 2 Complete Masterclass',
    duration: '6 Months',
    learningMode: 'Online Live & Interactive',
    fee: '₹28,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Phase 1 GA, Quant, Reasoning & English Mastery',
      'Module 2: Economic & Social Issues (ESI) Conceptual & Descriptive Writing',
      'Module 3: Finance and Management (FM) Theory & Numerical Practice',
      'Module 4: Descriptive English Evaluation by Expert Panel'
    ],
    batches: [
      { name: 'Online Evening Live', timing: '08:00 PM - 10:00 PM', startDate: '1st June 2026', seatsLeft: 22 }
    ]
  },
  {
    id: 'crs-veranda-ibps-po',
    academyId: 'aca-veranda-race',
    examId: 'exam-ibps-po',
    title: 'IBPS PO & Clerk All-in-One Selection Program',
    duration: '5 Months',
    learningMode: 'Hybrid',
    fee: '₹21,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Comprehensive Banking Foundation',
      'Module 2: 120 Online Full Mock Tests on Real Exam Interface',
      'Module 3: Current Affairs & Static GK Quizzes'
    ],
    batches: [
      { name: 'Morning Batch', timing: '08:30 AM - 12:30 PM', startDate: '15th June 2026', seatsLeft: 12 }
    ]
  },

  // ----------------------------------------------------
  // Engineering (GATE, SSC JE, RRB JE) Courses
  // ----------------------------------------------------
  {
    id: 'crs-made-easy-gate-cs',
    academyId: 'aca-made-easy',
    examId: 'exam-gate',
    title: 'GATE Computer Science & IT Classroom Foundation Course',
    duration: '9 Months (850+ Hours)',
    learningMode: 'Classroom',
    fee: '₹88,000 (Incl. Complete Study Material & CBT Test Series)',
    verifiedFee: true,
    syllabus: [
      'Module 1: Data Structures, Algorithms, Theory of Computation & Compiler Design',
      'Module 2: Computer Networks, Operating Systems & Database Management',
      'Module 3: Digital Logic, Computer Architecture & Engineering Mathematics',
      'Module 4: National Online Test Series (54 Tests) with Video Solutions'
    ],
    batches: [
      { name: 'Delhi Regular Batch', timing: '08:00 AM - 02:00 PM', startDate: '15th June 2026', seatsLeft: 6 },
      { name: 'Hyderabad Weekend Batch', timing: 'Saturday & Sunday 08:30 AM - 06:00 PM', startDate: '20th June 2026', seatsLeft: 10 }
    ]
  },
  {
    id: 'crs-made-easy-gate-mech',
    academyId: 'aca-made-easy',
    examId: 'exam-gate',
    title: 'GATE Mechanical Engineering Comprehensive Foundation',
    duration: '9 Months',
    learningMode: 'Classroom & Online',
    fee: '₹88,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Thermodynamics, Heat Transfer, Fluid Mechanics & Fluid Machinery',
      'Module 2: Strength of Materials, Theory of Machines, Machine Design & Vibrations',
      'Module 3: Manufacturing Technology, Material Science & Industrial Engineering',
      'Module 4: GATE Previous 30 Years Question Bank with Step-by-Step Proofs'
    ],
    batches: [
      { name: 'Regular Batch', timing: '08:00 AM - 02:00 PM', startDate: '1st July 2026', seatsLeft: 7 }
    ]
  },
  {
    id: 'crs-ace-gate-ece',
    academyId: 'aca-ace-engineering',
    examId: 'exam-gate',
    title: 'ACE Academy GATE Electronics & Communication (ECE) Flagship',
    duration: '8.5 Months',
    learningMode: 'Hybrid',
    fee: '₹82,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Signals and Systems, Communications, Digital Circuits & Microprocessors',
      'Module 2: Electronic Devices, Analog Circuits & Electromagnetics',
      'Module 3: Engineering Mathematics & General Aptitude Mastery'
    ],
    batches: [
      { name: 'Hyderabad Central Batch', timing: '08:30 AM - 01:30 PM', startDate: '25th June 2026', seatsLeft: 9 }
    ]
  },
  {
    id: 'crs-engineers-academy-ssc-je',
    academyId: 'aca-engineers-academy',
    examId: 'exam-ssc-je',
    title: 'SSC JE Civil / Mechanical / Electrical Master Class',
    duration: '5 Months',
    learningMode: 'Classroom & Online',
    fee: '₹26,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Technical Core Engineering (Paper 1 & Paper 2 Comprehensive)',
      'Module 2: General Intelligence, Reasoning & General Awareness',
      'Module 3: 45 Full Length CBT Mocks matching SSC JE Standard'
    ],
    batches: [
      { name: 'Morning JE Batch', timing: '08:30 AM - 12:30 PM', startDate: '10th June 2026', seatsLeft: 18 }
    ]
  },

  // ----------------------------------------------------
  // Medical (NEET UG & NEET PG) Courses
  // ----------------------------------------------------
  {
    id: 'crs-allen-neet-leader',
    academyId: 'aca-allen',
    examId: 'exam-neet-ug',
    title: 'ALLEN Leader Course for NEET UG (Class 12th Pass / Dropper)',
    duration: '1 Year (Target 2027)',
    learningMode: 'Classroom',
    fee: '₹1,32,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Physics (Mechanics, Thermodynamics, Electrodynamics, Optics & Modern Physics)',
      'Module 2: Chemistry (Physical, Organic & Inorganic NCERT Line-by-Line Mastery)',
      'Module 3: Biology (Botany & Zoology with Detailed Diagrammatic Analysis)',
      'Module 4: All-India Leader Test Series (ALTS) with Negative Marking Feedback'
    ],
    batches: [
      { name: 'Chennai Center Leader Batch', timing: '08:00 AM - 01:30 PM', startDate: '1st June 2026', seatsLeft: 8 },
      { name: 'Kota Campus Intensive Batch', timing: '08:00 AM - 02:00 PM', startDate: '10th June 2026', seatsLeft: 5 }
    ]
  },
  {
    id: 'crs-aakash-neet-repeater',
    academyId: 'aca-aakash',
    examId: 'exam-neet-ug',
    title: 'Aakash Medical Regular Classroom Course for NEET',
    duration: '1 Year',
    learningMode: 'Classroom / Hybrid',
    fee: '₹1,28,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Complete 11th & 12th Class NEET Physics, Chemistry, Biology Modules',
      'Module 2: AIATS (All India Aakash Test Series) with National Percentile Benchmarking',
      'Module 3: Special High-Yield Error Resolution Clinics'
    ],
    batches: [
      { name: 'Morning Batch', timing: '08:30 AM - 01:30 PM', startDate: '15th June 2026', seatsLeft: 12 }
    ]
  },
  {
    id: 'crs-dams-neet-pg-tnd',
    academyId: 'aca-dams',
    examId: 'exam-neet-pg',
    title: 'DAMS Ultimate Test & Discussion (T&D) + Clinical Vignette Module',
    duration: '7 Months',
    learningMode: 'Hybrid (Classroom + Online App)',
    fee: '₹55,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: All 19 MBBS Subjects High-Yield Clinical Discussion',
      'Module 2: Visual Histopathology, Radiology Images & ECG Case Workstations',
      'Module 3: 20 Full Length CBT Grand Tests with Expert Faculty Review'
    ],
    batches: [
      { name: 'Weekend Clinical Batch', timing: 'Saturday & Sunday 09:00 AM - 05:00 PM', startDate: '1st July 2026', seatsLeft: 15 }
    ]
  },

  // ----------------------------------------------------
  // Teaching (CTET, TNTET, UGC NET) Courses
  // ----------------------------------------------------
  {
    id: 'crs-teachers-ctet',
    academyId: 'aca-teachers-academy',
    examId: 'exam-ctet',
    title: 'CTET Paper 1 & Paper 2 Mastery Course',
    duration: '3.5 Months',
    learningMode: 'Online Live & Classroom',
    fee: '₹12,500',
    verifiedFee: true,
    syllabus: [
      'Module 1: Child Development and Pedagogy (Piaget, Vygotsky, Kohlberg Theories)',
      'Module 2: Mathematics & Environmental Studies Pedagogy',
      'Module 3: Language 1 & Language 2 Grammar, Comprehension & Teaching Methods',
      'Module 4: 20 Previous Years Solved Papers with Evaluation'
    ],
    batches: [
      { name: 'Evening Teacher Batch', timing: '05:30 PM - 07:30 PM', startDate: '1st June 2026', seatsLeft: 20 }
    ]
  },
  {
    id: 'crs-byjus-ugc-net-p1',
    academyId: 'aca-byjus-prep',
    examId: 'exam-ugc-net',
    title: 'UGC NET Paper 1 Complete Teaching & Research Aptitude Live Course',
    duration: '4 Months',
    learningMode: 'Online Live',
    fee: '₹14,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Teaching Aptitude, Research Methodology & Communication',
      'Module 2: Mathematical Reasoning, Logical Reasoning & Data Interpretation',
      'Module 3: People, Development and Environment & Higher Education System',
      'Module 4: 30 NTA-Format CBT Full Mocks with Explanations'
    ],
    batches: [
      { name: 'Daily Evening Live', timing: '07:00 PM - 09:00 PM', startDate: '15th June 2026', seatsLeft: 25 }
    ]
  },

  // ----------------------------------------------------
  // Defence (NDA, CDS, AFCAT) Courses
  // ----------------------------------------------------
  {
    id: 'crs-cavalier-nda-written-ssb',
    academyId: 'aca-cavalier-india',
    examId: 'exam-nda',
    title: 'NDA Integrated Written Exam Prep + Comprehensive SSB Training',
    duration: '6 Months',
    learningMode: 'Classroom & Ground Obstacle Training',
    fee: '₹46,000 (Incl. Uniform, SSB Outdoor Camp & Books)',
    verifiedFee: true,
    syllabus: [
      'Module 1: NDA Mathematics (Algebra, Matrices, Trigonometry, Calculus, Vectors)',
      'Module 2: General Ability Test (GAT) — English, Physics, Chemistry, GK & Defence Affairs',
      'Module 3: 14-Day Realistic SSB Interview Simulation on Outdoor GTO Ground',
      'Module 4: Individual Psychological Test Dossier Evaluation (TAT, WAT, SRT)'
    ],
    batches: [
      { name: 'Bangalore Campus Batch', timing: '08:30 AM - 03:30 PM', startDate: '1st June 2026', seatsLeft: 12 },
      { name: 'Delhi Campus Batch', timing: '08:30 AM - 03:30 PM', startDate: '10th June 2026', seatsLeft: 10 }
    ]
  },
  {
    id: 'crs-centurion-cds-officer',
    academyId: 'aca-centurion-defence',
    examId: 'exam-cds',
    title: 'CDS (IMA, OTA, INA, AFA) Complete Officer Pathway',
    duration: '5 Months',
    learningMode: 'Hybrid',
    fee: '₹38,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Advanced English Comprehension & Vocabulary for CDS',
      'Module 2: General Knowledge, International Relations & Defence Affairs',
      'Module 3: Elementary Mathematics (for IMA/INA/AFA aspirants)',
      'Module 4: 21 Days SSB Officer-like Qualities (OLQ) Mentorship'
    ],
    batches: [
      { name: 'Dehradun Resident Batch', timing: '09:00 AM - 04:00 PM', startDate: '15th June 2026', seatsLeft: 8 }
    ]
  },

  // ----------------------------------------------------
  // Management (CAT, MAT, CMAT) Courses
  // ----------------------------------------------------
  {
    id: 'crs-time-cat-comprehensive',
    academyId: 'aca-time',
    examId: 'exam-cat',
    title: 'T.I.M.E. Comprehensive CAT Program + AIMCAT Test Series',
    duration: '8 Months',
    learningMode: 'Classroom & Hybrid',
    fee: '₹68,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Quantitative Ability from Basic Arithmetic to Advanced Modern Math',
      'Module 2: Data Interpretation and Logical Reasoning (DILR) Advanced Case Workshops',
      'Module 3: Verbal Ability and Reading Comprehension (VARC) Critical Analysis',
      'Module 4: 25 All-India AIMCAT Mock Exams with Detailed Video Solutions and GD-PI-WAT'
    ],
    batches: [
      { name: 'Chennai Central Weekend', timing: 'Saturday & Sunday 09:30 AM - 04:30 PM', startDate: '6th June 2026', seatsLeft: 11 },
      { name: 'Hyderabad Evening Batch', timing: 'Monday to Thursday 06:30 PM - 08:30 PM', startDate: '10th June 2026', seatsLeft: 14 }
    ]
  },
  {
    id: 'crs-ims-cat-elite',
    academyId: 'aca-ims',
    examId: 'exam-cat',
    title: 'IMS CAT Classroom & Mentorship with SimCATs',
    duration: '7 Months',
    learningMode: 'Hybrid',
    fee: '₹72,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Foundational to Advanced Quant & Verbal Modules',
      'Module 2: SimCAT All India Mock Tests with AI Performance Diagnostics',
      'Module 3: 1-on-1 myPlan Sessions with Chief Mentors for B-School Strategy'
    ],
    batches: [
      { name: 'Mumbai Goregaon Batch', timing: '10:00 AM - 01:00 PM', startDate: '15th June 2026', seatsLeft: 9 }
    ]
  },

  // ----------------------------------------------------
  // Law (CLAT & AILET) Courses
  // ----------------------------------------------------
  {
    id: 'crs-legaledge-clat-target',
    academyId: 'aca-legaledge',
    examId: 'exam-clat',
    title: 'LegalEdge CLAT & AILET Comprehensive Classroom Target Course',
    duration: '1 Year',
    learningMode: 'Classroom & Online Live',
    fee: '₹85,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Legal Reasoning & Constitutional Principles (Passage Based Analysis)',
      'Module 2: Current Affairs, GK & Contemporary Legal Updates',
      'Module 3: Critical Reasoning, Reading Comprehension & Quantitative Techniques',
      'Module 4: 60 All-India CLAT & AILET Mock Tests with National Percentile Rankings'
    ],
    batches: [
      { name: 'Bangalore Center Batch', timing: '09:00 AM - 01:00 PM', startDate: '15th June 2026', seatsLeft: 7 },
      { name: 'Delhi CP Center Batch', timing: '09:00 AM - 01:00 PM', startDate: '20th June 2026', seatsLeft: 5 }
    ]
  },
  {
    id: 'crs-career-launcher-clat-lst',
    academyId: 'aca-career-launcher',
    examId: 'exam-clat',
    title: 'LST (Law School Tutorial) Express Program for CLAT',
    duration: '6 Months',
    learningMode: 'Hybrid',
    fee: '₹62,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Legal Aptitude & Argument Evaluation',
      'Module 2: Logic and Reading Drills for Speed & Precision',
      'Module 3: 40 Online Law Entrance Mocks on TCS iON Interface'
    ],
    batches: [
      { name: 'Regular Weekend Batch', timing: 'Saturday & Sunday 10:00 AM - 03:00 PM', startDate: '1st July 2026', seatsLeft: 14 }
    ]
  },

  // ----------------------------------------------------
  // Science, Arts, Commerce & Humanities Courses
  // ----------------------------------------------------
  {
    id: 'crs-ifas-csir-net-life',
    academyId: 'aca-ifas',
    examId: 'exam-csir-net',
    title: 'CSIR NET Life Sciences All-India Classroom & Online Live Batch',
    duration: '6 Months',
    learningMode: 'Classroom / Online Live',
    fee: '₹38,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Molecules and their Interaction, Cellular Organization & Fundamental Processes',
      'Module 2: Developmental Biology, Plant Physiology, Animal Physiology & Genetics',
      'Module 3: Diversity of Life Forms, Ecological Principles, Evolution & Behavior',
      'Module 4: 50 Sectional & Full Length Computer-Based Mock Tests'
    ],
    batches: [
      { name: 'Pune Classroom Batch', timing: '09:00 AM - 02:00 PM', startDate: '1st June 2026', seatsLeft: 12 },
      { name: 'Online Live Evening', timing: '06:00 PM - 09:30 PM', startDate: '10th June 2026', seatsLeft: 18 }
    ]
  },
  {
    id: 'crs-eduncle-iit-jam',
    academyId: 'aca-eduncle',
    examId: 'exam-iit-jam',
    title: 'IIT JAM Chemistry / Physics / Maths Comprehensive Program',
    duration: '8 Months',
    learningMode: 'Online Interactive',
    fee: '₹24,500',
    verifiedFee: true,
    syllabus: [
      'Module 1: Exhaustive Subject Syllabus Coverage with University Master Faculty',
      'Module 2: NAT (Numerical Answer Type) Calculation Mastery Workshops',
      'Module 3: 25 Full Length Computer-Based Mocks with Step-by-Step Proofs'
    ],
    batches: [
      { name: 'Interactive Live Batch', timing: '06:00 PM - 08:30 PM', startDate: '15th June 2026', seatsLeft: 22 }
    ]
  },

  // ----------------------------------------------------
  // Railway, Agriculture, Architecture & Design Courses
  // ----------------------------------------------------
  {
    id: 'crs-brds-nata-nid',
    academyId: 'aca-brds',
    examId: 'exam-nata-nid',
    title: 'BRDS Architecture & Design Entrance Foundation (NATA + NID DAT)',
    duration: '6 Months',
    learningMode: 'Classroom Studio & Workshops',
    fee: '₹48,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Perspective Drawing (1-Point, 2-Point, 3-Point) & Architectural Principles',
      'Module 2: Visual Spatial Aptitude, Aesthetics, Color Harmonization & Light-Shadow Rendering',
      'Module 3: Material Handling Studio Sessions (Clay, Wire, Paper Craft for NID Studio Test)',
      'Module 4: 30 Drawing Aptitude Tests Evaluated by Senior Architects & NID Alumni'
    ],
    batches: [
      { name: 'Chennai Studio Batch', timing: '09:30 AM - 01:30 PM', startDate: '15th June 2026', seatsLeft: 8 },
      { name: 'Ahmedabad Head Studio', timing: '10:00 AM - 02:00 PM', startDate: '1st June 2026', seatsLeft: 10 }
    ]
  },
  {
    id: 'crs-agri-icar-aieea',
    academyId: 'aca-agri-coaching',
    examId: 'exam-icar-aieea',
    title: 'ICAR AIEEA Agricultural Sciences Target Masterclass',
    duration: '5 Months',
    learningMode: 'Online Live & Classroom',
    fee: '₹22,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Agronomy, Genetics and Plant Breeding, Plant Pathology & Entomology',
      'Module 2: Soil Science, Agricultural Chemistry & Agricultural Economics',
      'Module 3: 35 Full Length CBT Mocks mapped to ICAR Dean’s Committee'
    ],
    batches: [
      { name: 'Morning Academic Batch', timing: '08:30 AM - 11:30 AM', startDate: '1st June 2026', seatsLeft: 15 }
    ]
  },

  // ----------------------------------------------------
  // International Entrance & Language Tests Courses
  // ----------------------------------------------------
  {
    id: 'crs-british-council-ielts',
    academyId: 'aca-british-council',
    examId: 'exam-ielts',
    title: 'Official British Council IELTS Academic Masterclass (Target Band 8.0+)',
    duration: '8 Weeks (Intensive)',
    learningMode: 'Classroom & Online Live',
    fee: '₹18,500 (Incl. Official Cambridge Coursebooks & Practice Tests)',
    verifiedFee: true,
    syllabus: [
      'Module 1: Academic Writing Task 1 (Data & Trends) and Task 2 (Discursive Essays with 9-Band Lexicon)',
      'Module 2: Rapid Reading Comprehension (Skimming, Scanning, Headings & True/False/Not Given)',
      'Module 3: Listening Strategies for Multi-accent English (British, Australian, North American)',
      'Module 4: 1-on-1 Simulated Speaking Tests with Certified Cambridge English Examiners'
    ],
    batches: [
      { name: 'Weekday Fast Track', timing: 'Monday to Thursday 07:00 AM - 09:00 AM', startDate: 'Every Monday', seatsLeft: 6 },
      { name: 'Weekend Executive Batch', timing: 'Saturday & Sunday 10:00 AM - 01:00 PM', startDate: 'Upcoming Saturday', seatsLeft: 8 }
    ]
  },
  {
    id: 'crs-jamboree-gre-gmat',
    academyId: 'aca-jamboree',
    examId: 'exam-gre',
    title: 'Jamboree GRE Comprehensive Preparation Program (Target 325+)',
    duration: '10 Weeks + 1 Year Portal Access',
    learningMode: 'Classroom & Hybrid',
    fee: '₹34,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Quantitative Reasoning (Arithmetic, Algebra, Geometry, Data Analysis with Short-cut Tactics)',
      'Module 2: Verbal Reasoning (Text Completion, Sentence Equivalence & Reading Comprehension)',
      'Module 3: Analytical Writing (Issue Essay Frameworks & Scoring Rubrics)',
      'Module 4: 15 Computer-Adaptive Full-Length Mock Exams with Error Diagnostics'
    ],
    batches: [
      { name: 'Chennai Central Evening', timing: 'Tuesday & Thursday 06:30 PM - 09:00 PM', startDate: '16th June 2026', seatsLeft: 10 },
      { name: 'Weekend Intensive Batch', timing: 'Saturday & Sunday 02:00 PM - 05:30 PM', startDate: '20th June 2026', seatsLeft: 7 }
    ]
  },
  {
    id: 'crs-jamboree-gmat-focus',
    academyId: 'aca-jamboree',
    examId: 'exam-gmat',
    title: 'Jamboree GMAT Focus Edition Accelerator (Target 685+)',
    duration: '12 Weeks',
    learningMode: 'Classroom / Online Live',
    fee: '₹38,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Quantitative Reasoning (Problem Solving & Numerical Strategy)',
      'Module 2: Data Insights (Data Sufficiency, Multi-Source Reasoning, Two-Part Analysis)',
      'Module 3: Verbal Reasoning (Critical Reasoning & Reading Comprehension)',
      'Module 4: 12 Official GMAC Format Adaptive Full Tests'
    ],
    batches: [
      { name: 'Executive Evening', timing: 'Monday & Wednesday 07:00 PM - 09:30 PM', startDate: '22nd June 2026', seatsLeft: 9 }
    ]
  },
  {
    id: 'crs-manya-sat-digital',
    academyId: 'aca-manya-princeton',
    examId: 'exam-sat',
    title: 'The Princeton Review Digital SAT Premier Live (Target 1500+)',
    duration: '8 Weeks',
    learningMode: 'Hybrid (Classroom + Princeton Portal)',
    fee: '₹36,000',
    verifiedFee: true,
    syllabus: [
      'Module 1: Digital SAT Math Modules (Desmos Calculator Hacks, Advanced Algebra, Geometry & Trigonometry)',
      'Module 2: Reading & Writing Modules (Craft & Structure, Information & Ideas, Standard English Conventions)',
      'Module 3: 8 Multi-Stage Adaptive Digital SAT Practice Tests with Detailed Diagnostic Score Reports'
    ],
    batches: [
      { name: 'High School Weekend Batch', timing: 'Saturday & Sunday 10:00 AM - 01:30 PM', startDate: '13th June 2026', seatsLeft: 10 }
    ]
  },
  {
    id: 'crs-revival-global-prep-ielts',
    academyId: 'aca-revival-global-prep',
    examId: 'exam-ielts',
    title: 'Revival International Elite IELTS Band 8.5 Masterclass',
    duration: '6 Weeks',
    learningMode: 'Hybrid (Dubai & Chennai Centers + Online)',
    fee: '₹24,000 / AED 1,050',
    verifiedFee: true,
    syllabus: [
      'Module 1: Advanced Writing Architecture with Individual Line-by-Line Examiner Feedback',
      'Module 2: 1-on-1 Daily Speaking Tele-sessions with Native British/Commonwealth Mentors',
      'Module 3: Fast-Reading Scanning Methodologies for Technical and Scientific Articles',
      'Module 4: Integrated Direct University Admissions Advisory for UK, Canada & Europe'
    ],
    batches: [
      { name: 'Global Morning Batch (GST / IST)', timing: '08:00 AM - 10:00 AM IST', startDate: 'Every Monday', seatsLeft: 5 },
      { name: 'Executive Evening Batch', timing: '07:30 PM - 09:30 PM IST', startDate: 'Every Wednesday', seatsLeft: 7 }
    ]
  },
  {
    id: 'crs-revival-global-prep-gre',
    academyId: 'aca-revival-global-prep',
    examId: 'exam-gre',
    title: 'Revival Global Prep GRE Shorter Version 330+ Fast Track',
    duration: '8 Weeks',
    learningMode: 'Online Live & Hybrid',
    fee: '₹36,000 / AED 1,550',
    verifiedFee: true,
    syllabus: [
      'Module 1: Advanced Quant Traps and Speed Elimination Strategies for 170/170 Quant',
      'Module 2: High-Difficulty Verbal Logic, Root Word Etymology & Passage Dissection',
      'Module 3: 10 Computer-Adaptive Shorter GRE Simulations with Score Diagnostic Mapping'
    ],
    batches: [
      { name: 'Global Evening Cohort', timing: '08:00 PM - 10:00 PM IST', startDate: '15th June 2026', seatsLeft: 6 }
    ]
  }
];

// Helper Functions
export const getDepartments = () => ACADEMY_DEPARTMENTS;

export const getExaminations = (deptId = null, searchTerm = '') => {
  let list = ACADEMY_EXAMINATIONS;
  if (deptId && deptId !== 'all') {
    list = list.filter(e => e.departmentId === deptId);
  }
  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    list = list.filter(e => 
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.conductingBody.toLowerCase().includes(q) ||
      e.shortDesc.toLowerCase().includes(q)
    );
  }
  return list;
};

export const getExamById = (examId) => {
  return ACADEMY_EXAMINATIONS.find(e => e.id === examId) || null;
};

export const getAcademiesForExam = (examId, filters = {}) => {
  if (!examId) return [];
  // Find academies that have this exam in primaryExams or offer courses for this exam
  const courseAcademyIds = ACADEMY_COURSES
    .filter(c => c.examId === examId)
    .map(c => c.academyId);
  
  let matching = VERIFIED_ACADEMIES.filter(a => 
    (a.primaryExams && a.primaryExams.includes(examId)) || courseAcademyIds.includes(a.id)
  );

  if (filters.learningMode && filters.learningMode !== 'all') {
    matching = matching.filter(a => 
      a.learningModes && a.learningModes.some(m => m.toLowerCase().includes(filters.learningMode.toLowerCase()))
    );
  }

  if (filters.city && filters.city !== 'all') {
    matching = matching.filter(a => 
      a.city && a.city.toLowerCase().includes(filters.city.toLowerCase())
    );
  }

  // Maximum 10 verified academies strictly matching the selected exam
  return matching.slice(0, 10);
};

export const getAcademyById = (academyId) => {
  return VERIFIED_ACADEMIES.find(a => a.id === academyId) || null;
};

export const getCoursesForAcademyAndExam = (academyId, examId) => {
  if (!academyId) return [];
  if (examId) {
    return ACADEMY_COURSES.filter(c => c.academyId === academyId && c.examId === examId);
  }
  return ACADEMY_COURSES.filter(c => c.academyId === academyId);
};

export const getOtherCoursesForAcademy = (academyId, excludeExamId) => {
  if (!academyId) return [];
  return ACADEMY_COURSES.filter(c => c.academyId === academyId && c.examId !== excludeExamId);
};

export const getCourseById = (courseId) => {
  return ACADEMY_COURSES.find(c => c.id === courseId) || null;
};

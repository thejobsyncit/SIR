/**
 * Revival International - Student Academy Data Store
 * School Student Enrichment Programs, Configurable Learning Tracks,
 * and Separate Competitive Examination Preparation Directory
 */

export const SCHOOL_STUDENT_PROGRAMS = [
  {
    id: 'prog-academic-foundation',
    code: 'A',
    title: 'Academic Foundation Support',
    badge: 'Core Foundations',
    icon: 'BookOpen',
    summary: 'Structured subject support and foundational learning routines tailored to individual student needs.',
    points: [
      'Strengthen understanding of school subjects.',
      'Develop effective study and revision habits.',
      'Improve note-taking and time management.',
      'Provide structured practice based on student needs.'
    ]
  },
  {
    id: 'prog-study-skills',
    code: 'B',
    title: 'Study Skills & Exam Readiness',
    badge: 'Study & Revision',
    icon: 'Target',
    summary: 'Practical study planning, revision methods, and focused preparation habits for school assessments.',
    points: [
      'Build practical study schedules.',
      'Learn revision and exam-planning techniques.',
      'Improve concentration and organization.',
      'Review progress and identify learning gaps.'
    ]
  },
  {
    id: 'prog-communication',
    code: 'C',
    title: 'Communication & Public Speaking',
    badge: 'Essential Skills',
    icon: 'Presentation',
    summary: 'Guided speaking, presentation practice, and collaborative communication activities to build student poise.',
    points: [
      'Develop speaking confidence.',
      'Practice presentations and group discussions.',
      'Improve vocabulary and communication.',
      'Encourage participation and self-expression.'
    ]
  },
  {
    id: 'prog-critical-thinking',
    code: 'D',
    title: 'Critical Thinking & Problem-Solving',
    badge: 'Analytical Reasoning',
    icon: 'Cpu',
    summary: 'Age-appropriate logical reasoning, analytical thinking, and collaborative decision-making exercises.',
    points: [
      'Encourage logical reasoning.',
      'Develop analytical and creative thinking.',
      'Participate in age-appropriate activities.',
      'Build collaboration and decision-making skills.'
    ]
  },
  {
    id: 'prog-career-awareness',
    code: 'E',
    title: 'Career Awareness & Academic Planning',
    badge: 'Future Readiness',
    icon: 'Compass',
    summary: 'Early exploration of academic streams, subject choices, and future higher education pathways.',
    points: [
      'Explore different academic pathways.',
      'Understand subject-selection considerations.',
      'Identify interests and strengths.',
      'Introduce future education and career options.'
    ]
  }
];

export const STUDENT_LEARNING_TRACKS = [
  {
    id: 'track-primary',
    stage: 'Primary School',
    gradeRange: 'Grades 1 – 5',
    ageRange: 'Ages 6 – 10',
    available: true,
    availabilityLabel: 'Available on Enquiry',
    icon: 'Sparkles',
    focusSummary: 'Nurturing curiosity, positive study routines, and expressive confidence in early learners.',
    highlights: [
      'Foundational learning habits',
      'Creativity and communication',
      'Confidence-building activities'
    ],
    relevantPrograms: [
      'Academic Foundation Support',
      'Communication & Public Speaking'
    ]
  },
  {
    id: 'track-middle',
    stage: 'Middle School',
    gradeRange: 'Grades 6 – 8',
    ageRange: 'Ages 11 – 13',
    available: true,
    availabilityLabel: 'Active Enrolment',
    icon: 'BookOpen',
    focusSummary: 'Strengthening core subject comprehension, structured note-taking, and analytical teamwork.',
    highlights: [
      'Study skills and subject foundations',
      'Critical thinking and teamwork',
      'Early academic interest exploration'
    ],
    relevantPrograms: [
      'Academic Foundation Support',
      'Study Skills & Exam Readiness',
      'Critical Thinking & Problem-Solving'
    ]
  },
  {
    id: 'track-secondary',
    stage: 'Secondary School',
    gradeRange: 'Grades 9 – 10',
    ageRange: 'Ages 14 – 15',
    available: true,
    availabilityLabel: 'Active Enrolment',
    icon: 'Compass',
    focusSummary: 'Building board exam readiness, disciplined time management, and informed stream selection.',
    highlights: [
      'Exam preparation and time management',
      'Communication and presentation skills',
      'Career awareness and subject planning'
    ],
    relevantPrograms: [
      'Study Skills & Exam Readiness',
      'Communication & Public Speaking',
      'Career Awareness & Academic Planning'
    ]
  },
  {
    id: 'track-higher-secondary',
    stage: 'Higher Secondary School',
    gradeRange: 'Grades 11 – 12',
    ageRange: 'Ages 16 – 18',
    available: true,
    availabilityLabel: 'Active Enrolment',
    icon: 'GraduationCap',
    focusSummary: 'Intensive revision frameworks, entrance examination awareness, and university pathway planning.',
    highlights: [
      'Structured revision and examination readiness',
      'Higher education and course awareness',
      'Career exploration and future planning'
    ],
    relevantPrograms: [
      'Study Skills & Exam Readiness',
      'Career Awareness & Academic Planning',
      'Competitive Exam Preparation'
    ]
  }
];

export const ACADEMY_PROCESS_STEPS = [
  {
    step: '01',
    title: 'Understand Student Needs',
    description: 'Identify the student’s grade, interests, and learning goals.'
  },
  {
    step: '02',
    title: 'Recommend a Program',
    description: 'Suggest a suitable learning or exam-preparation pathway.'
  },
  {
    step: '03',
    title: 'Learning & Practice',
    description: 'Provide structured learning activities and practice based on the selected program.'
  },
  {
    step: '04',
    title: 'Progress Review',
    description: 'Review progress and discuss suitable next steps.'
  }
];

export const EXAM_CATEGORY_GROUPS = [
  {
    id: 'all',
    title: 'All Categories',
    departmentIds: ['gov', 'banking', 'engineering', 'medical', 'teaching', 'defence', 'management', 'law', 'science-arts', 'railway-design', 'intl-tests']
  },
  {
    id: 'gov',
    title: 'Government and Civil Services Exams',
    departmentIds: ['gov']
  },
  {
    id: 'banking',
    title: 'Banking and Finance Exams',
    departmentIds: ['banking']
  },
  {
    id: 'engineering',
    title: 'Engineering and Technical Entrance Exams',
    departmentIds: ['engineering']
  },
  {
    id: 'medical',
    title: 'Medical and Healthcare Entrance Exams',
    departmentIds: ['medical']
  },
  {
    id: 'teaching',
    title: 'Teaching and Education Exams',
    departmentIds: ['teaching']
  },
  {
    id: 'defence',
    title: 'Defence and Police Exams',
    departmentIds: ['defence']
  },
  {
    id: 'intl-tests',
    title: 'International Admissions and Language Tests',
    departmentIds: ['intl-tests']
  },
  {
    id: 'other-entrance',
    title: 'Other Academic and Professional Entrance Exams',
    departmentIds: ['management', 'law', 'science-arts', 'railway-design']
  }
];

export const QUALIFICATION_LEVELS = [
  { id: 'all', label: 'All Education Levels' },
  { id: 'Class 12 / High School', label: 'Class 12 / High School (10+2)' },
  { id: 'Undergraduate / Bachelor Degree', label: "Undergraduate / Bachelor's Degree" },
  { id: 'Postgraduate / Master Degree', label: "Postgraduate / Master's Degree" },
  { id: 'Open / All Qualifications', label: 'Open / Language & General Proficiency' }
];

export const ACADEMY_DEPARTMENTS = [
  {
    id: 'gov',
    title: 'Government and Civil Services Exams',
    subtitle: 'SSC, UPSC, TNPSC & State Civil Services',
    icon: 'Building2',
    color: 'emerald',
    badge: 'Civil Services',
    description: 'Union and State administrative services, revenue, police, and central commission examinations.'
  },
  {
    id: 'banking',
    title: 'Banking and Finance Exams',
    subtitle: 'SBI, IBPS, RBI & Regulatory Bodies',
    icon: 'Landmark',
    color: 'blue',
    badge: 'Banking Sector',
    description: 'Preparation pathways for Probationary Officers, Clerical Cadres, and Central Banking Regulatory posts.'
  },
  {
    id: 'engineering',
    title: 'Engineering and Technical Entrance Exams',
    subtitle: 'GATE, SSC JE, RRB JE & PSU Recruitments',
    icon: 'Cpu',
    color: 'purple',
    badge: 'Technical',
    description: 'Graduate engineering aptitude, junior engineering, and public sector technical examinations.'
  },
  {
    id: 'medical',
    title: 'Medical and Healthcare Entrance Exams',
    subtitle: 'NEET UG, NEET PG & Allied Healthcare',
    icon: 'HeartPulse',
    color: 'rose',
    badge: 'Healthcare',
    description: 'Medical entrance pathways for undergraduate MBBS/BDS and postgraduate residency examinations.'
  },
  {
    id: 'teaching',
    title: 'Teaching and Education Exams',
    subtitle: 'CTET, TNTET, UGC NET & State Eligibility',
    icon: 'GraduationCap',
    color: 'amber',
    badge: 'Eligibility',
    description: 'Pedagogy and subject-matter examinations for national teacher certification and university lectureship.'
  },
  {
    id: 'defence',
    title: 'Defence and Police Exams',
    subtitle: 'NDA, CDS, AFCAT & Police Sub-Inspectors',
    icon: 'Shield',
    color: 'cyan',
    badge: 'Armed Forces',
    description: 'Officer training academy entrance examinations and SSB interview preparation pathways.'
  },
  {
    id: 'management',
    title: 'Management and Business',
    subtitle: 'CAT, MAT, CMAT & Executive MBA',
    icon: 'Briefcase',
    color: 'indigo',
    badge: 'Management Entrance',
    description: 'Quantitative aptitude, data interpretation, and verbal ability entrance tests for business institutes.'
  },
  {
    id: 'law',
    title: 'Law and Judicial Services',
    subtitle: 'CLAT UG/PG, AILET & Judiciary',
    icon: 'Scale',
    color: 'slate',
    badge: 'Law Entrance',
    description: 'Legal reasoning, constitutional law, and analytical entrance examinations for National Law Universities.'
  },
  {
    id: 'science-arts',
    title: 'Science, Arts, Commerce and Humanities',
    subtitle: 'CSIR NET, IIT JAM & CUET (UG/PG)',
    icon: 'BookOpen',
    color: 'teal',
    badge: 'University Entrance',
    description: 'Pure sciences, economics, humanities, and commerce entrance examinations for central universities.'
  },
  {
    id: 'railway-design',
    title: 'Railway, Agriculture, Architecture and Design',
    subtitle: 'RRB NTPC, ICAR AIEEA, NATA, NID DAT',
    icon: 'Compass',
    color: 'orange',
    badge: 'Specialized Entrance',
    description: 'Non-technical railway posts, agricultural sciences, architecture drawing aptitude, and design entrance.'
  },
  {
    id: 'intl-tests',
    title: 'International Admissions and Language Tests',
    subtitle: 'IELTS, TOEFL, GRE, GMAT, SAT',
    icon: 'Globe2',
    color: 'gold',
    badge: 'Global Pathways',
    isInternational: true,
    description: 'Standardized tests for international university admissions, language proficiency, and global education.'
  }
];

export const ACADEMY_EXAMINATIONS = [
  // 1. Government Exams
  {
    id: 'exam-upsc-cse',
    departmentId: 'gov',
    categoryGroup: 'Government and Civil Services Exams',
    code: 'UPSC CSE',
    name: 'Civil Services Examination (IAS, IPS, IFS)',
    conductingBody: 'Union Public Service Commission (UPSC)',
    eligibility: "Bachelor's Degree in any discipline from a recognized university",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Preliminary Examination (GS + CSAT) → Main Examination (9 Papers) → Personality Test (Interview)',
    popularSubjects: ['General Studies', 'Public Administration', 'Geography', 'Sociology'],
    nextCycle: 'Annual cycle per official UPSC examination calendar',
    applicationDetails: 'Official notifications and online applications are published on upsc.gov.in and upsconline.nic.in.',
    officialUrl: 'https://upsc.gov.in',
    shortDesc: 'National competitive examination conducted by UPSC for recruitment to All India Services and Central Civil Services including IAS, IPS, and IFS.'
  },
  {
    id: 'exam-ssc-cgl',
    departmentId: 'gov',
    categoryGroup: 'Government and Civil Services Exams',
    code: 'SSC CGL',
    name: 'Combined Graduate Level Examination',
    conductingBody: 'Staff Selection Commission (SSC)',
    eligibility: "Bachelor's Degree from a recognized university",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Tier I (Computer Based Examination) → Tier II (Paper I & Paper II as applicable)',
    popularSubjects: ['Quantitative Aptitude', 'General Awareness', 'English Comprehension', 'Reasoning'],
    nextCycle: 'Annual notification per official SSC calendar',
    applicationDetails: 'Official registration and syllabus notifications are published on ssc.gov.in.',
    officialUrl: 'https://ssc.gov.in',
    shortDesc: 'Recruitment examination for Group B and Group C posts across central government ministries, departments, and organizations.'
  },
  {
    id: 'exam-tnpsc-grp1',
    departmentId: 'gov',
    categoryGroup: 'Government and Civil Services Exams',
    code: 'TNPSC Group 1 & 2',
    name: 'Tamil Nadu Public Service Commission Combined Civil Services',
    conductingBody: 'Tamil Nadu Public Service Commission (TNPSC)',
    eligibility: "Bachelor's Degree from a recognized university with required Tamil language proficiency",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Preliminary Examination → Main Written Examination → Oral Test / Counselling',
    popularSubjects: ['General Studies', 'Aptitude & Mental Ability', 'Tamil Nadu Administration'],
    nextCycle: 'Published via TNPSC Annual Planner',
    applicationDetails: 'One-Time Registration (OTR) and exam applications are submitted via tnpsc.gov.in.',
    officialUrl: 'https://www.tnpsc.gov.in',
    shortDesc: 'State civil services examination for administrative appointments in Tamil Nadu state government departments.'
  },

  // 2. Banking and Finance
  {
    id: 'exam-sbi-po',
    departmentId: 'banking',
    categoryGroup: 'Banking and Finance Exams',
    code: 'SBI PO',
    name: 'State Bank of India Probationary Officers Examination',
    conductingBody: 'State Bank of India (Central Recruitment & Promotion Department)',
    eligibility: 'Graduation in any discipline from a recognized university',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Phase I (Preliminary CBT) → Phase II (Main Examination) → Phase III (Psychometric Test, Group Exercise & Interview)',
    popularSubjects: ['Data Analysis & Interpretation', 'Reasoning & Computer Aptitude', 'General / Economy / Banking Awareness', 'English Language'],
    nextCycle: 'Announced via SBI Careers official notification',
    applicationDetails: 'Official recruitment notices and online registration links are published at sbi.co.in/web/careers.',
    officialUrl: 'https://sbi.co.in/web/careers',
    shortDesc: 'Probationary Officer recruitment examination conducted by the State Bank of India.'
  },
  {
    id: 'exam-ibps-po',
    departmentId: 'banking',
    categoryGroup: 'Banking and Finance Exams',
    code: 'IBPS PO / Clerk',
    name: 'IBPS Common Recruitment Process (CRP PO/MT & Clerks)',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    eligibility: 'Degree (Graduation) in any discipline from a recognized university',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Preliminary Online Examination → Main Online Examination → Common Interview (for PO/MT)',
    popularSubjects: ['Financial Awareness', 'Computer Aptitude', 'Reasoning Ability', 'Quantitative Aptitude'],
    nextCycle: 'Annual CRP cycle per official IBPS calendar',
    applicationDetails: 'Official notifications and registration portals are hosted at ibps.in.',
    officialUrl: 'https://www.ibps.in',
    shortDesc: 'Common recruitment examination for Probationary Officers, Management Trainees, and Clerical cadre posts in participating public sector banks.'
  },
  {
    id: 'exam-rbi-grade-b',
    departmentId: 'banking',
    categoryGroup: 'Banking and Finance Exams',
    code: 'RBI Grade B',
    name: 'Reserve Bank of India Officers in Grade B (DR)',
    conductingBody: 'Reserve Bank of India Services Board (RBISB)',
    eligibility: "Bachelor's Degree with minimum 60% marks (50% for SC/ST/PwBD) or equivalent qualification per RBI notification",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Phase I Online Objective Exam → Phase II Online Examination (Paper I, II, III) → Interview',
    popularSubjects: ['Economic & Social Issues', 'Finance & Management', 'General Awareness', 'English Writing Skills'],
    nextCycle: 'Announced by RBI Services Board on rbi.org.in',
    applicationDetails: 'Official recruitment notifications and eligibility rules are available on opportunities.rbi.org.in.',
    officialUrl: 'https://www.rbi.org.in',
    shortDesc: 'Competitive examination for direct recruitment of Officers in Grade B (General, DEPR, DSIM) at the Reserve Bank of India.'
  },

  // 3. Engineering and Technology
  {
    id: 'exam-gate',
    departmentId: 'engineering',
    categoryGroup: 'Engineering and Technical Entrance Exams',
    code: 'GATE',
    name: 'Graduate Aptitude Test in Engineering',
    conductingBody: 'IISc Bengaluru and IITs (on rotational basis under NCB-GATE)',
    eligibility: 'Candidates in 3rd/higher years of an undergraduate degree or completed a government-approved degree in Engineering, Technology, Architecture, Science, Commerce, or Arts',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: '3-Hour Computer Based Test (General Aptitude + Selected Engineering/Science Subject Paper)',
    popularSubjects: ['Computer Science & IT', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics & Communication'],
    nextCycle: 'Held annually (typically February) per organizing IIT schedule',
    applicationDetails: 'Official information brochure, paper combinations, and GOAPS registration are published on the official GATE portal.',
    officialUrl: 'https://gate2025.iitr.ac.in',
    shortDesc: 'National examination evaluating comprehensive understanding of undergraduate subjects in engineering, technology, architecture, and science for postgraduate admission and PSU recruitment.'
  },
  {
    id: 'exam-ssc-je',
    departmentId: 'engineering',
    categoryGroup: 'Engineering and Technical Entrance Exams',
    code: 'SSC JE',
    name: 'Staff Selection Commission Junior Engineer Examination',
    conductingBody: 'Staff Selection Commission (SSC)',
    eligibility: 'Diploma or Degree in Civil, Electrical, or Mechanical Engineering from a recognized institute/university (post-specific)',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Paper I (Computer Based Examination) → Paper II (Computer Based Core Engineering Paper)',
    popularSubjects: ['Civil & Structural Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'General Intelligence & Reasoning'],
    nextCycle: 'Annual cycle per official SSC examination calendar',
    applicationDetails: 'Detailed post-wise educational qualifications and age limits are published in the official SSC JE notice on ssc.gov.in.',
    officialUrl: 'https://ssc.gov.in',
    shortDesc: 'Examination for recruitment of Junior Engineers (Civil, Mechanical, Electrical) across central government departments such as CPWD, MES, BRO, and CWC.'
  },
  {
    id: 'exam-rrb-je',
    departmentId: 'engineering',
    categoryGroup: 'Engineering and Technical Entrance Exams',
    code: 'RRB JE',
    name: 'Railway Recruitment Board Junior Engineer (CEN)',
    conductingBody: 'Railway Recruitment Boards (Ministry of Railways)',
    eligibility: 'Three-year Diploma or B.E./B.Tech in relevant Engineering discipline per Centralized Employment Notice (CEN)',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: '1st Stage CBT → 2nd Stage CBT (Technical Abilities, General Awareness, Physics & Chemistry, Basics of Computers & Environment)',
    popularSubjects: ['Technical Engineering Discipline', 'General Science', 'Basics of Environment & Computers', 'Mathematics'],
    nextCycle: 'Published via Centralized Employment Notices (CEN) by RRBs',
    applicationDetails: 'Applications are accepted through regional RRB websites listed on indianrailways.gov.in.',
    officialUrl: 'https://indianrailways.gov.in',
    shortDesc: 'Centralized recruitment examination for Junior Engineer, Depot Material Superintendent, and Chemical & Metallurgical Assistant posts in Indian Railways.'
  },

  // 4. Medical and Healthcare
  {
    id: 'exam-neet-ug',
    departmentId: 'medical',
    categoryGroup: 'Medical and Healthcare Entrance Exams',
    code: 'NEET (UG)',
    name: 'National Eligibility cum Entrance Test (Undergraduate)',
    conductingBody: 'National Testing Agency (NTA)',
    eligibility: 'Passed or appearing in 10+2 (Higher Secondary) with Physics, Chemistry, Biology/Biotechnology, and English from a recognized board',
    educationLevel: 'Class 12 / High School',
    pattern: 'Pen & Paper (OMR) Examination covering Physics, Chemistry, and Biology (Botany & Zoology)',
    popularSubjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    nextCycle: 'Conducted annually (typically May) per NTA notification',
    applicationDetails: 'Official Information Bulletin, syllabus, and application forms are published on neet.nta.nic.in.',
    officialUrl: 'https://neet.nta.nic.in',
    shortDesc: 'National qualifying and entrance examination for admission to undergraduate medical (MBBS), dental (BDS), AYUSH, and nursing courses in India.'
  },
  {
    id: 'exam-neet-pg',
    departmentId: 'medical',
    categoryGroup: 'Medical and Healthcare Entrance Exams',
    code: 'NEET PG / INI-CET',
    name: 'National Eligibility cum Entrance Test (Postgraduate) & INI-CET',
    conductingBody: 'National Board of Examinations in Medical Sciences (NBEMS) / AIIMS',
    eligibility: 'MBBS Degree or Provisional MBBS Pass Certificate recognized under the NMC Act, registration certificate, and completed 1-year internship',
    educationLevel: 'Postgraduate / Master Degree',
    pattern: 'Computer Based Test covering Pre-clinical, Para-clinical, and Clinical MBBS curriculum subjects',
    popularSubjects: ['General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pathology', 'Pharmacology'],
    nextCycle: 'Per official NBEMS (natboard.edu.in) and AIIMS examination schedules',
    applicationDetails: 'Official information bulletins and eligibility cutoff dates for internship completion are published at natboard.edu.in.',
    officialUrl: 'https://natboard.edu.in',
    shortDesc: 'Qualifying and ranking examinations for admission to MD, MS, PG Diploma, and DNB postgraduate medical courses.'
  },

  // 5. Teaching and Education
  {
    id: 'exam-ctet',
    departmentId: 'teaching',
    categoryGroup: 'Teaching and Education Exams',
    code: 'CTET',
    name: 'Central Teacher Eligibility Test',
    conductingBody: 'Central Board of Secondary Education (CBSE)',
    eligibility: 'Senior Secondary / Graduation with D.El.Ed / B.Ed per NCTE teacher eligibility norms',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Paper I (Classes I to V — Primary Stage) & Paper II (Classes VI to VIII — Elementary Stage)',
    popularSubjects: ['Child Development & Pedagogy', 'Mathematics & Science', 'Social Studies', 'Languages I & II'],
    nextCycle: 'Conducted bi-annually per CBSE CTET notification',
    applicationDetails: 'Official information bulletin and online registration are hosted at ctet.nic.in.',
    officialUrl: 'https://ctet.nic.in',
    shortDesc: 'National teacher eligibility certification conducted by CBSE for teaching appointments in Central Government schools (KVS, NVS, etc.).'
  },
  {
    id: 'exam-tntet',
    departmentId: 'teaching',
    categoryGroup: 'Teaching and Education Exams',
    code: 'TNTET',
    name: 'Tamil Nadu Teacher Eligibility Test',
    conductingBody: 'Teachers Recruitment Board (TRB), Tamil Nadu',
    eligibility: 'Higher Secondary with D.El.Ed (Paper I) or Graduation with B.Ed (Paper II) per TRB Tamil Nadu norms',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Paper I (Classes I to V) & Paper II (Classes VI to VIII)',
    popularSubjects: ['Child Development & Pedagogy', 'Tamil / English', 'Mathematics & Science', 'Social Science'],
    nextCycle: 'Published via TRB Tamil Nadu official notifications',
    applicationDetails: 'Official syllabus and notifications are released by the Teachers Recruitment Board at trb.tn.gov.in.',
    officialUrl: 'https://trb.tn.gov.in',
    shortDesc: 'State teacher eligibility examination required for primary and upper primary teaching posts in Tamil Nadu schools.'
  },
  {
    id: 'exam-ugc-net',
    departmentId: 'teaching',
    categoryGroup: 'Teaching and Education Exams',
    code: 'UGC NET',
    name: 'UGC National Eligibility Test',
    conductingBody: 'National Testing Agency (NTA) on behalf of University Grants Commission',
    eligibility: "Master's Degree or equivalent from a UGC-recognized university with minimum 55% marks (50% for reserved categories)",
    educationLevel: 'Postgraduate / Master Degree',
    pattern: 'Single 3-Hour Session: Paper I (Teaching & Research Aptitude) + Paper II (Selected Subject)',
    popularSubjects: ['Teaching & Research Aptitude', 'Higher Education System', 'Subject-Specific Paper (83+ Subjects)'],
    nextCycle: 'Conducted twice a year (typically June and December cycles)',
    applicationDetails: 'Subject codes, syllabus PDFs, and online forms are available on ugcnet.nta.ac.in.',
    officialUrl: 'https://ugcnet.nta.ac.in',
    shortDesc: 'National test to determine eligibility for Junior Research Fellowship (JRF), appointment as Assistant Professor, and admission to Ph.D. programs in Indian universities.'
  },

  // 6. Defence and Police
  {
    id: 'exam-nda',
    departmentId: 'defence',
    categoryGroup: 'Defence and Police Exams',
    code: 'NDA & NA',
    name: 'National Defence Academy & Naval Academy Examination',
    conductingBody: 'Union Public Service Commission (UPSC)',
    eligibility: '12th Class pass of the 10+2 pattern (with Physics, Chemistry & Mathematics for Air Force and Naval Wings)',
    educationLevel: 'Class 12 / High School',
    pattern: 'Written Examination (Mathematics + General Ability Test) → SSB Intelligence & Personality Test',
    popularSubjects: ['Mathematics', 'English', 'General Knowledge', 'Physics & History'],
    nextCycle: 'Conducted twice a year (NDA I & NDA II) per UPSC calendar',
    applicationDetails: 'Age limits, marital status, and physical standards are specified in the official UPSC NDA notification on upsc.gov.in.',
    officialUrl: 'https://upsc.gov.in',
    shortDesc: 'National entrance examination for admission to the Army, Navy, and Air Force wings of the National Defence Academy and Indian Naval Academy.'
  },
  {
    id: 'exam-cds',
    departmentId: 'defence',
    categoryGroup: 'Defence and Police Exams',
    code: 'CDS',
    name: 'Combined Defence Services Examination',
    conductingBody: 'Union Public Service Commission (UPSC)',
    eligibility: 'Degree of a recognized university for IMA/OTA; Degree in Engineering for INA; Degree (with Physics & Maths at 10+2) or B.E. for AFA',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Written Examination (English, General Knowledge, Elementary Mathematics) → SSB Interview for Intelligence and Personality',
    popularSubjects: ['English', 'General Knowledge', 'Elementary Mathematics'],
    nextCycle: 'Conducted twice a year (CDS I & CDS II) per UPSC calendar',
    applicationDetails: 'Official notifications and academy-wise eligibility criteria are published on upsc.gov.in.',
    officialUrl: 'https://upsc.gov.in',
    shortDesc: 'Graduate-level defence entrance examination for recruitment into the Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers Training Academy.'
  },
  {
    id: 'exam-afcat',
    departmentId: 'defence',
    categoryGroup: 'Defence and Police Exams',
    code: 'AFCAT',
    name: 'Air Force Common Admission Test',
    conductingBody: 'Indian Air Force (IAF)',
    eligibility: 'Graduation (minimum 60% marks) and minimum 50% each in Maths & Physics at 10+2 level (branch-specific criteria apply)',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Online AFCAT Written Test → Air Force Selection Board (AFSB) Testing',
    popularSubjects: ['General Awareness', 'Verbal Ability in English', 'Numerical Ability', 'Reasoning & Military Aptitude'],
    nextCycle: 'Conducted twice a year (AFCAT 1 & AFCAT 2)',
    applicationDetails: 'Official notifications and registration details are available on afcat.cdac.in.',
    officialUrl: 'https://afcat.cdac.in',
    shortDesc: 'Officer recruitment test conducted by the Indian Air Force for Flying and Ground Duty (Technical and Non-Technical) branches.'
  },

  // 7. Management and Business
  {
    id: 'exam-cat',
    departmentId: 'management',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'CAT',
    name: 'Common Admission Test (IIMs)',
    conductingBody: 'Indian Institutes of Management (IIMs on rotational basis)',
    eligibility: "Bachelor's Degree with at least 50% marks or equivalent CGPA (45% for SC, ST, and PwD categories)",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Computer Based Test: Verbal Ability & Reading Comprehension (VARC), Data Interpretation & Logical Reasoning (DILR), Quantitative Ability (QA)',
    popularSubjects: ['Data Interpretation', 'Logical Reasoning', 'Quantitative Ability', 'Reading Comprehension'],
    nextCycle: 'Held annually (typically November) per official IIM CAT notification',
    applicationDetails: 'Official registration, test city selection, and information bulletins are published on iimcat.ac.in.',
    officialUrl: 'https://iimcat.ac.in',
    shortDesc: 'National management entrance examination for admission to postgraduate and fellow management programs at Indian Institutes of Management (IIMs) and participating B-Schools.'
  },
  {
    id: 'exam-mat-cmat',
    departmentId: 'management',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'MAT / CMAT',
    name: 'Management Aptitude Test & Common Management Admission Test',
    conductingBody: 'All India Management Association (AIMA) & National Testing Agency (NTA)',
    eligibility: 'Graduates in any discipline from a recognized university (final year undergraduate students may also apply)',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Language Comprehension, Mathematical Skills, Data Analysis & Sufficiency, Intelligence & Critical Reasoning, General Awareness',
    popularSubjects: ['Quantitative Techniques', 'Logical Reasoning', 'Language Comprehension', 'Innovation & Entrepreneurship'],
    nextCycle: 'MAT held multiple sessions annually; CMAT held annually per NTA notification',
    applicationDetails: 'Official registration is hosted at mat.aima.in (MAT) and exams.nta.ac.in/CMAT (CMAT).',
    officialUrl: 'https://mat.aima.in',
    shortDesc: 'Standardized national management entrance tests accepted by AICTE-approved institutions and university MBA/PGDM departments.'
  },

  // 8. Law
  {
    id: 'exam-clat',
    departmentId: 'law',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'CLAT (UG/PG)',
    name: 'Common Law Admission Test',
    conductingBody: 'Consortium of National Law Universities',
    eligibility: '10+2 or equivalent with minimum 45% marks for UG (40% for SC/ST/PwD); LL.B. degree with minimum 50% marks for PG',
    educationLevel: 'Class 12 / High School',
    pattern: '2-Hour Comprehension-Based Test: English Language, Current Affairs including GK, Legal Reasoning, Logical Reasoning, Quantitative Techniques',
    popularSubjects: ['Legal Reasoning', 'Current Affairs & GK', 'Logical Reasoning', 'English Language', 'Quantitative Techniques'],
    nextCycle: 'Conducted annually (typically December) per Consortium notification',
    applicationDetails: 'Official syllabus, participating NLUs, and online applications are published at consortiumofnlus.ac.in.',
    officialUrl: 'https://consortiumofnlus.ac.in',
    shortDesc: 'Centralized national entrance examination for admission to 5-year integrated LL.B. and LL.M. programs at participating National Law Universities.'
  },
  {
    id: 'exam-ailet',
    departmentId: 'law',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'AILET',
    name: 'All India Law Entrance Test',
    conductingBody: 'National Law University, Delhi (NLU Delhi)',
    eligibility: 'Senior Secondary School Examination (10+2 system) or equivalent with minimum 45% aggregate marks for B.A.LL.B. (Hons.)',
    educationLevel: 'Class 12 / High School',
    pattern: 'Offline Pen-and-Paper Test covering English Language, Current Affairs & General Knowledge, and Logical Reasoning',
    popularSubjects: ['Logical & Legal Principles', 'English Comprehension', 'Current Affairs & General Knowledge'],
    nextCycle: 'Conducted annually (typically December) per NLU Delhi notification',
    applicationDetails: 'Official admission notifications and registration forms are hosted on nationallawuniversitydelhi.in.',
    officialUrl: 'https://nationallawuniversitydelhi.in',
    shortDesc: 'National law entrance examination conducted by National Law University, Delhi for admission to B.A.LL.B. (Hons.), LL.M., and Ph.D. programs.'
  },

  // 9. Science, Arts, Commerce and Humanities
  {
    id: 'exam-csir-net',
    departmentId: 'science-arts',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'CSIR UGC NET',
    name: 'Joint CSIR-UGC National Eligibility Test',
    conductingBody: 'National Testing Agency (NTA) on behalf of CSIR',
    eligibility: 'M.Sc. or equivalent degree / Integrated BS-MS / BS-4 Years / B.E. / B.Tech / B.Pharma / MBBS with minimum 55% marks (50% for reserved categories)',
    educationLevel: 'Postgraduate / Master Degree',
    pattern: 'Computer Based Test: Part A (General Science & Research Aptitude) + Part B (Subject-Related MCQs) + Part C (Analytical Scientific Questions)',
    popularSubjects: ['Chemical Sciences', 'Earth, Atmospheric, Ocean & Planetary Sciences', 'Life Sciences', 'Mathematical Sciences', 'Physical Sciences'],
    nextCycle: 'Conducted twice a year (typically June and December) per NTA schedule',
    applicationDetails: 'Official information bulletin and subject syllabi are available on csirnet.nta.ac.in.',
    officialUrl: 'https://csirnet.nta.ac.in',
    shortDesc: 'National test determining eligibility for Junior Research Fellowship (JRF) and Lectureship/Assistant Professor in science and technology disciplines.'
  },
  {
    id: 'exam-iit-jam',
    departmentId: 'science-arts',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'IIT JAM',
    name: 'Joint Admission Test for Masters',
    conductingBody: 'Indian Institutes of Technology (IITs on rotational basis)',
    eligibility: 'Candidates who have completed or are appearing in the final year of an undergraduate degree in relevant science/mathematics disciplines',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Computer Based Test in 7 test papers featuring MCQs, MSQs (Multiple Select), and NAT (Numerical Answer Type) questions',
    popularSubjects: ['Biotechnology', 'Chemistry', 'Economics', 'Geology', 'Mathematics', 'Mathematical Statistics', 'Physics'],
    nextCycle: 'Held annually (typically February) per organizing IIT schedule',
    applicationDetails: 'Official JAM information brochure and JOAPS registration portal are hosted by the organizing IIT (e.g., jam2025.iitd.ac.in).',
    officialUrl: 'https://jam2025.iitd.ac.in',
    shortDesc: 'All-India entrance examination for admission to M.Sc., M.Sc. (Tech.), MS (Research), and Joint M.Sc.-Ph.D. postgraduate programs at IITs and IISc.'
  },
  {
    id: 'exam-cuet-pg',
    departmentId: 'science-arts',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'CUET (UG & PG)',
    name: 'Common University Entrance Test',
    conductingBody: 'National Testing Agency (NTA)',
    eligibility: "Class 12 / equivalent for CUET (UG); Bachelor's Degree from a recognized university for CUET (PG), subject to participating university criteria",
    educationLevel: 'Class 12 / High School',
    pattern: 'Language Papers + Domain-Specific Subject Papers + General Test (as required by target university program)',
    popularSubjects: ['Domain Sciences', 'Commerce & Economics', 'Humanities & Social Sciences', 'General Aptitude'],
    nextCycle: 'Conducted annually (typically March – May) per NTA notification',
    applicationDetails: 'Participating universities, course mappings, and online forms are available on exams.nta.ac.in/CUET-UG/ and exams.nta.ac.in/CUET-PG/.',
    officialUrl: 'https://exams.nta.ac.in/CUET-UG/',
    shortDesc: 'Common entrance test conducted by NTA for admissions into undergraduate and postgraduate programs across Central, State, Deemed, and Private universities.'
  },

  // 10. Railway, Agriculture, Architecture and Design
  {
    id: 'exam-rrb-ntpc',
    departmentId: 'railway-design',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'RRB NTPC',
    name: 'Non-Technical Popular Categories (Indian Railways)',
    conductingBody: 'Railway Recruitment Boards (Ministry of Railways)',
    eligibility: '12th (+2 Stage) for Undergraduate Level posts; University Degree for Graduate Level posts per official CEN notification',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: '1st Stage CBT → 2nd Stage CBT → Computer Based Aptitude Test (CBAT) / Typing Skill Test (as applicable)',
    popularSubjects: ['General Awareness', 'Mathematics', 'General Intelligence & Reasoning'],
    nextCycle: 'Published via Centralized Employment Notices (CEN) by RRBs',
    applicationDetails: 'Official CEN notifications and regional RRB application links are published on indianrailways.gov.in.',
    officialUrl: 'https://indianrailways.gov.in',
    shortDesc: 'Recruitment examination for non-technical graduate and undergraduate posts across zonal railways and production units of Indian Railways.'
  },
  {
    id: 'exam-icar-aieea',
    departmentId: 'railway-design',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'ICAR AIEEA (PG)',
    name: 'All India Entrance Examination for Admission (Agriculture)',
    conductingBody: 'National Testing Agency (NTA) for Indian Council of Agricultural Research (ICAR)',
    eligibility: "10+2 (via CUET-ICAR for UG) or Four-year Bachelor's degree in Agriculture and allied sciences (for AIEEA PG)",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Computer Based Test covering specialized agricultural, veterinary, horticultural, and allied science subject groups',
    popularSubjects: ['Plant Sciences', 'Agronomy', 'Soil Science', 'Agricultural Engineering', 'Horticulture'],
    nextCycle: 'Conducted annually per NTA-ICAR admission schedule',
    applicationDetails: 'Official information bulletins and counselling details are published on exams.nta.ac.in/ICAR/ and icar.org.in.',
    officialUrl: 'https://exams.nta.ac.in/ICAR/',
    shortDesc: 'National entrance examination for admission to undergraduate and postgraduate degree programs in accredited Agricultural Universities.'
  },
  {
    id: 'exam-nata-nid',
    departmentId: 'railway-design',
    categoryGroup: 'Other Academic and Professional Entrance Exams',
    code: 'NATA & NID DAT',
    name: 'National Aptitude Test in Architecture & NID Design Aptitude Test',
    conductingBody: 'Council of Architecture (CoA) & National Institute of Design (NID)',
    eligibility: '10+2 or 10+3 Diploma with Mathematics for NATA (per CoA norms); 10+2 in any stream for NID B.Des',
    educationLevel: 'Class 12 / High School',
    pattern: 'Drawing & Composition Test + Computer-Based Aptitude Test (Visual Perception, Logical Reasoning, Design Sensitivity)',
    popularSubjects: ['Drawing & Visual Composition', 'Spatial Ability', 'Architectural & Design Awareness', 'Quantitative Reasoning'],
    nextCycle: 'NATA conducted in multiple test windows (April – July); NID DAT Prelims typically in December/January',
    applicationDetails: 'Official brochures and registration are hosted at nata.in (Council of Architecture) and admissions.nid.edu (NID).',
    officialUrl: 'https://www.nata.in',
    shortDesc: 'National aptitude tests for admission to 5-year Bachelor of Architecture (B.Arch) and Bachelor/Master of Design (B.Des/M.Des) programs.'
  },

  // 11. International Entrance & Language Tests (Displayed Separately)
  {
    id: 'exam-ielts',
    departmentId: 'intl-tests',
    categoryGroup: 'International Admissions and Language Tests',
    code: 'IELTS Academic / General',
    name: 'International English Language Testing System',
    conductingBody: 'British Council, IDP: IELTS Australia & Cambridge English',
    eligibility: 'Open to candidates applying for international higher education, professional registration, or global migration (valid passport required)',
    educationLevel: 'Open / All Qualifications',
    pattern: 'Listening (30 mins), Reading (60 mins), Writing (60 mins), Speaking (11–14 mins) — Scored on a 9-Band scale',
    popularSubjects: ['Academic Writing Task 1 & 2', 'Reading Comprehension', 'Listening Accuracy', 'Speaking Fluency & Coherence'],
    nextCycle: 'Multiple official test dates available weekly at authorized centers worldwide',
    applicationDetails: 'Official test dates, format details, and test center registration are available at ielts.org.',
    officialUrl: 'https://www.ielts.org',
    shortDesc: 'Internationally recognized English language proficiency test accepted by universities, professional bodies, and immigration authorities globally.'
  },
  {
    id: 'exam-toefl',
    departmentId: 'intl-tests',
    categoryGroup: 'International Admissions and Language Tests',
    code: 'TOEFL iBT',
    name: 'Test of English as a Foreign Language (iBT)',
    conductingBody: 'Educational Testing Service (ETS)',
    eligibility: 'Open to students and applicants preparing for university admissions and academic fellowships worldwide',
    educationLevel: 'Open / All Qualifications',
    pattern: 'Reading (35 mins), Listening (36 mins), Speaking (16 mins), Writing (29 mins) — Scored on a 0–120 scale',
    popularSubjects: ['Academic Reading Passages', 'Campus & Lecture Listening', 'Integrated & Academic Discussion Writing', 'Structured Speaking'],
    nextCycle: 'Available year-round at authorized ETS test centers and Home Edition sessions',
    applicationDetails: 'Official registration, score reporting, and preparation resources are hosted at ets.org/toefl.',
    officialUrl: 'https://www.ets.org/toefl.html',
    shortDesc: 'Standardized academic English proficiency examination administered by ETS and accepted by over 12,500 institutions across 160+ countries.'
  },
  {
    id: 'exam-gre',
    departmentId: 'intl-tests',
    categoryGroup: 'International Admissions and Language Tests',
    code: 'GRE General Test',
    name: 'Graduate Record Examinations (General Test)',
    conductingBody: 'Educational Testing Service (ETS)',
    eligibility: "Open to prospective graduate, master's, doctoral, and business school applicants worldwide",
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Analytical Writing (1 task, 30 mins), Verbal Reasoning (2 sections, 27 Qs), Quantitative Reasoning (2 sections, 27 Qs) — Approx. 1 hr 58 mins',
    popularSubjects: ['Analytical Writing', 'Text Completion & Sentence Equivalence', 'Reading Comprehension', 'Quantitative Comparison & Data Analysis'],
    nextCycle: 'Available year-round on a continuous basis at authorized Prometric/ETS centers',
    applicationDetails: 'Official test registration and ETS account creation are completed at ets.org/gre.',
    officialUrl: 'https://www.ets.org/gre.html',
    shortDesc: 'Standardized admissions assessment for graduate schools, MS, Ph.D., and global MBA programs.'
  },
  {
    id: 'exam-gmat',
    departmentId: 'intl-tests',
    categoryGroup: 'International Admissions and Language Tests',
    code: 'GMAT Focus Edition',
    name: 'Graduate Management Admission Test (Focus Edition)',
    conductingBody: 'Graduate Management Admission Council (GMAC)',
    eligibility: 'Open to candidates applying for MBA, Master in Management, Master in Finance, and graduate business programs',
    educationLevel: 'Undergraduate / Bachelor Degree',
    pattern: 'Quantitative Reasoning (21 Qs, 45m), Verbal Reasoning (23 Qs, 45m), Data Insights (20 Qs, 45m) — Total 2 hrs 15 mins (Score 205–805)',
    popularSubjects: ['Data Insights & Sufficiency', 'Multi-Source Reasoning', 'Critical Reasoning', 'Quantitative Problem Solving'],
    nextCycle: 'Year-round rolling appointments at Pearson VUE test centers and online',
    applicationDetails: 'Official test booking and score sending are administered by GMAC on mba.com.',
    officialUrl: 'https://www.mba.com/exams/gmat-exam',
    shortDesc: 'Computer-adaptive business school entrance assessment designed specifically for graduate management programs worldwide.'
  },
  {
    id: 'exam-sat',
    departmentId: 'intl-tests',
    categoryGroup: 'International Admissions and Language Tests',
    code: 'Digital SAT',
    name: 'Scholastic Assessment Test (Digital SAT)',
    conductingBody: 'College Board',
    eligibility: 'High school students (typically Grades 10–12) preparing for international undergraduate university admissions',
    educationLevel: 'Class 12 / High School',
    pattern: 'Reading and Writing (2 adaptive modules, 64 mins) + Math (2 adaptive modules, 70 mins) — Total 2 hrs 14 mins (Score 400–1600)',
    popularSubjects: ['Craft & Structure', 'Information & Ideas', 'Algebra & Advanced Math', 'Problem-Solving & Data Analysis'],
    nextCycle: 'International test dates in March, May, June, August, October, November, and December',
    applicationDetails: 'Official test dates, Bluebook app details, and registration are hosted by College Board at satsuite.collegeboard.org.',
    officialUrl: 'https://satsuite.collegeboard.org/sat',
    shortDesc: 'Standardized digital assessment widely used for undergraduate admissions and merit scholarship evaluation at universities in the US, Canada, and globally.'
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
export const getSchoolStudentPrograms = () => SCHOOL_STUDENT_PROGRAMS;

export const getStudentLearningTracks = (onlyAvailable = true) => {
  if (!onlyAvailable) return STUDENT_LEARNING_TRACKS;
  return STUDENT_LEARNING_TRACKS.filter(t => t.available !== false);
};

export const getAcademyProcessSteps = () => ACADEMY_PROCESS_STEPS;

export const getExamCategoryGroups = () => EXAM_CATEGORY_GROUPS;

export const getQualificationLevels = () => QUALIFICATION_LEVELS;

export const getDepartments = () => ACADEMY_DEPARTMENTS;

export const getExaminations = (deptId = null, searchTerm = '', educationLevel = 'all', sourceExams = null) => {
  let list = Array.isArray(sourceExams) && sourceExams.length > 0 ? sourceExams : ACADEMY_EXAMINATIONS;

  if (deptId && deptId !== 'all') {
    if (deptId === 'other-entrance') {
      const otherDepts = ['management', 'law', 'science-arts', 'railway-design'];
      list = list.filter(e => otherDepts.includes(e.departmentId));
    } else {
      list = list.filter(e => e.departmentId === deptId);
    }
  }

  if (educationLevel && educationLevel !== 'all') {
    list = list.filter(e => e.educationLevel === educationLevel);
  }

  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.conductingBody.toLowerCase().includes(q) ||
      e.shortDesc.toLowerCase().includes(q) ||
      (Array.isArray(e.popularSubjects) && e.popularSubjects.some(s => s.toLowerCase().includes(q)))
    );
  }
  return list;
};

export const getExamById = (examId, sourceExams = null) => {
  const list = Array.isArray(sourceExams) && sourceExams.length > 0 ? sourceExams : ACADEMY_EXAMINATIONS;
  return list.find(e => e.id === examId) || null;
};

export const getAcademiesForExam = (examId, filters = {}) => {
  if (!examId) return [];
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

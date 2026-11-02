import { INDIAN_EXAM_CATEGORIES, INDIAN_COMPETITIVE_EXAMS } from './indianCompetitiveExamsData.js';

/**
 * Revival International - Competitive Examinations & Preparation Directory
 * Redesigned for Student Academy matching the Career Guidance UG/PG Architecture
 * 
 * Categories:
 * 1. IELTS - International English Language Testing System
 * 2. OET - Occupational English Test
 * 3. OGT - Exploratory / Verification Pending
 * 4. Medical Exams - Entrance & International Licensing (NEET, FMGE, NExT, USMLE, PLAB, MRCP, Country Licensing)
 * 5. Europe & Western Countries - Admissions, Standardized & Language Tests (IELTS, TOEFL, PTE, GRE, GMAT, SAT, National Language & Licensing)
 * 6. GCC Medical Licensing Exams - Gulf Health Authorities (DHA, DOH, MOHAP, SCFHS, Qatar DHP, Oman, Bahrain NHRA, Kuwait)
 * 7. GCC Engineering Exams & Professional Registration - Engineering Councils & Accreditations (SCE, UAE SOE/Municipality, Qatar UPDA, Oman, Bahrain CRPEP, Kuwait KSE, International)
 */

const INTERNATIONAL_EXAM_CATEGORIES = [
  {
    id: 'ielts',
    name: 'IELTS — English Language Proficiency',
    shortName: 'IELTS',
    fullName: 'International English Language Testing System',
    icon: 'Globe2',
    accentColor: 'from-blue-600 to-indigo-700',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    description: 'The world’s premier English language examination recognized by over 12,500 organizations worldwide for higher education admissions, work permits, and global migration.',
    popularOptions: ['IELTS Academic', 'IELTS General Training', 'IELTS for UKVI']
  },
  {
    id: 'oet',
    name: 'OET — Healthcare English Proficiency',
    shortName: 'OET',
    fullName: 'Occupational English Test',
    icon: 'HeartPulse',
    accentColor: 'from-teal-600 to-emerald-700',
    badgeColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    description: 'The dedicated clinical English language communication test tailored specifically for healthcare professionals seeking statutory registration in the UK, Ireland, Australia, New Zealand, Dubai, and USA.',
    popularOptions: ['OET Medicine', 'OET Nursing', 'OET Dentistry', 'OET Pharmacy', 'Allied Healthcare']
  },
  {
    id: 'ogt',
    name: 'OGT — Exploratory Advisory',
    shortName: 'OGT',
    fullName: 'OGT (Verification Pending)',
    icon: 'Compass',
    accentColor: 'from-amber-600 to-orange-700',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    description: 'Official statutory syllabus, authority, and eligibility parameters are undergoing verification. Exploratory counseling and advisory notifications are open for prospective candidates.',
    popularOptions: ['OGT Advisory Tracking']
  },
  {
    id: 'medical-exams',
    name: 'Medical Entrance & International Licensing',
    shortName: 'Medical Exams',
    fullName: 'Medical Entrance & International Licensing Examinations',
    icon: 'Stethoscope',
    accentColor: 'from-rose-600 to-red-700',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    description: 'Comprehensive preparation for Indian national medical entrance (NEET-UG), statutory screening (FMGE / NExT), and prestigious international medical licensing examinations (USMLE, PLAB / UKMLA, MRCP, AMC).',
    popularOptions: ['NEET-UG', 'FMGE', 'NExT', 'USMLE', 'PLAB / UKMLA', 'MRCP']
  },
  {
    id: 'europe-western',
    name: 'Europe & Western Countries Examinations',
    shortName: 'Europe & Western',
    fullName: 'Europe & Western Standardized Admissions & Licensing',
    icon: 'GraduationCap',
    accentColor: 'from-purple-600 to-violet-700',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    description: 'Standardized testing, language certifications, and professional qualification pathways for university admissions and licensures across the UK, Europe, USA, Canada, Australia, and New Zealand.',
    popularOptions: ['IELTS', 'TOEFL iBT', 'PTE Academic', 'GRE General', 'GMAT Focus', 'Digital SAT', 'Language Certifications']
  },
  {
    id: 'gcc-medical',
    name: 'GCC Medical Licensing Exams',
    shortName: 'GCC Medical',
    fullName: 'GCC Healthcare Regulatory Licensing Examinations',
    icon: 'Award',
    accentColor: 'from-emerald-600 to-teal-800',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    description: 'Mandatory Prometric examinations and Primary Source Verification (DataFlow) credentialing required to practice medicine, nursing, dentistry, and pharmacy across the United Arab Emirates and Gulf Cooperation Council states.',
    popularOptions: ['DHA Dubai', 'DOH Abu Dhabi', 'MOHAP UAE', 'SCFHS Saudi Arabia', 'Qatar DHP', 'Oman OMSB']
  },
  {
    id: 'gcc-engineering',
    name: 'GCC Engineering & Professional Registration',
    shortName: 'GCC Engineering',
    fullName: 'GCC Engineering Accreditations & Statutory Professional Registration',
    icon: 'Wrench',
    accentColor: 'from-amber-600 to-yellow-700',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    description: 'Mandatory statutory professional registrations, board assessments, and engineering council accreditation pathways required for practicing engineers in Saudi Arabia, UAE, Qatar, Oman, Bahrain, and Kuwait.',
    popularOptions: ['Saudi Council of Engineers (SCE)', 'UAE SOE / Municipality', 'Qatar UPDA / MMUP', 'Oman OSE', 'CRPEP Bahrain', 'Kuwait KSE']
  }
];

const INTERNATIONAL_COMPETITIVE_EXAMS = [
  // ==========================================
  // CATEGORY 1: IELTS
  // ==========================================
  {
    id: 'ielts-academic',
    categoryId: 'ielts',
    categoryName: 'IELTS — English Language Proficiency',
    code: 'IELTS Academic',
    name: 'International English Language Testing System — Academic',
    conductingBody: 'IDP Education / British Council / Cambridge English',
    country: 'Global (UK, USA, Canada, Australia, Europe)',
    examType: 'Standardized Language Proficiency',
    overview: 'The IELTS Academic test measures English language proficiency required for higher education admissions and professional healthcare/academic registration in English-speaking nations.',
    purpose: 'University undergraduate and postgraduate admissions, scholarship qualifications, and professional registrations (e.g. GMC, NMC UK, Nursing Councils).',
    pattern: '4 Sections: Listening (30 mins + 10 mins transfer), Reading (60 mins - 3 complex academic texts), Writing (60 mins - Task 1 graphical summary & Task 2 formal essay), Speaking (11-14 mins face-to-face interview).',
    eligibility: 'Recommended for candidates aged 16+ applying for degree studies or professional licensures.',
    syllabusOrSkills: ['Academic Vocabulary & Collocations', 'Data & Chart Interpretation (Task 1)', 'Critical Essay Structuring (Task 2)', 'Complex Listening Note-Taking', 'Spontaneous Verbal Fluency'],
    applicationProcess: 'Online booking via official IDP or British Council portals. Select preferred computer-delivered or paper-based test date and valid international passport.',
    feesAndDates: 'Testing fee: ~AED 1,150 – 1,250 / ₹17,000 depending on test center. Computer-delivered tests available 3–5 days per week.',
    officialUrl: 'https://www.ielts.org',
    verifiedCourses: [
      {
        id: 'crs-ielts-acad-masterclass',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'IELTS Academic Band 7.5+ Masterclass',
        duration: '6 Weeks (48 Hours Live Training)',
        deliveryMode: 'Online Live & Dubai Campus',
        description: 'Comprehensive diagnostic-driven preparation covering all 4 modules with daily essay correction, authentic mock assessments, and 1-on-1 speaking interviews.',
        keyBenefits: ['Daily personalized Writing Task 1 & 2 reviews', 'Weekly full-length computer-delivered mock tests', 'Exclusive Cambridge practice test vaults', 'Complimentary test booking assistance']
      },
      {
        id: 'crs-ielts-fast-track',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'IELTS Academic 2-Week Fast-Track Sprint',
        duration: '2 Weeks (24 Hours Intensive)',
        deliveryMode: 'Online Live Interactive',
        description: 'Focused score-booster boot camp targeting Band 7.0+ for students with upcoming university application or visa deadlines.',
        keyBenefits: ['High-yield question templates and band descriptors', 'Timed reading & listening drill sessions', 'Intensive weekend speaking clinics']
      }
    ]
  },
  {
    id: 'ielts-general',
    categoryId: 'ielts',
    categoryName: 'IELTS — English Language Proficiency',
    code: 'IELTS General Training',
    name: 'International English Language Testing System — General Training',
    conductingBody: 'IDP Education / British Council / Cambridge English',
    country: 'Canada, Australia, UK, New Zealand',
    examType: 'Immigration & Work Visa Benchmark',
    overview: 'The IELTS General Training test measures English language proficiency in a practical, everyday and workplace context for permanent residency, vocational programs, and employment.',
    purpose: 'Points-based immigration (e.g., Canada Express Entry / PNP, Australia General Skilled Migration 189/190, New Zealand SMC) and international work visas.',
    pattern: '4 Sections: Listening (30 mins), General Reading (60 mins - notices, advertisements, workplace guidelines), General Writing (60 mins - Task 1 formal/informal letter & Task 2 essay), Speaking (11-14 mins).',
    eligibility: 'Open to all applicants seeking work visas or immigration points qualification.',
    syllabusOrSkills: ['Workplace Document Scanning', 'Formal & Informal Letter Formats', 'General Discursive Argumentation', 'Daily Conversation Listening', 'Fluency & Pronunciation Accuracy'],
    applicationProcess: 'Register online with IDP or British Council selecting the General Training option with a valid passport.',
    feesAndDates: 'Testing fee: ~AED 1,150 – 1,250 / ₹17,000. Computer-delivered testing available multiple times weekly.',
    officialUrl: 'https://www.ielts.org',
    verifiedCourses: [
      {
        id: 'crs-ielts-gt-clb9',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'IELTS General Training CLB 9/10 Target Track',
        duration: '5 Weeks (40 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Engineered specifically for Canadian Express Entry and Australian PR applicants seeking maximum CRS immigration points (8777 benchmark).',
        keyBenefits: ['Targeted Task 1 letter formatting templates', 'High-speed reading skim & scan mastery', 'Listening section 4 perfection drills']
      }
    ]
  },
  {
    id: 'ielts-ukvi',
    categoryId: 'ielts',
    categoryName: 'IELTS — English Language Proficiency',
    code: 'IELTS for UKVI',
    name: 'IELTS for UK Visas and Immigration (Academic & General Training)',
    conductingBody: 'IDP / British Council (UKVI Approved Test Centres)',
    country: 'United Kingdom',
    examType: 'Secure English Language Test (SELT)',
    overview: 'A government-approved Secure English Language Test (SELT) required by UK Visas and Immigration (UKVI) for direct degree entry, pre-sessional courses, work permits, and settlement.',
    purpose: 'UK Student Route Visas, Health and Care Worker Visas, Skilled Worker Visas, and family routes where formal biometric SELT verification is mandated.',
    pattern: 'Format, questions, and scoring are identical to standard IELTS, but administered in specialized UKVI test centres equipped with high-definition video and biometric audit recording.',
    eligibility: 'Applicants requiring a designated SELT Unique Reference Number (URN) for UK Home Office visa submissions.',
    syllabusOrSkills: ['Standard Academic or General IELTS syllabus', 'UKVI Exam Protocol Familiarization', 'Time-controlled writing under exam condition'],
    applicationProcess: 'Must specifically select "IELTS for UKVI" during booking. A designated UKVI URN is generated on the Test Report Form (TRF).',
    feesAndDates: 'Testing fee: ~AED 1,250 – 1,350 / ₹17,500. Offered at authorized SELT test centers across major international cities.',
    officialUrl: 'https://www.gov.uk/guidance/prove-your-english-language-abilities-with-a-secure-english-language-test-selt',
    verifiedCourses: [
      {
        id: 'crs-ielts-ukvi-prep',
        academyName: 'Revival UK Advisory & Exam Desk',
        courseName: 'IELTS for UKVI Guaranteed Strategy Program',
        duration: '4 Weeks (32 Hours)',
        deliveryMode: 'Online Live & Dubai Advisory Center',
        description: 'Comprehensive preparation ensuring students achieve the exact B2 (Band 5.5 - 6.5) or C1 (Band 7.0+) required by UK universities and NHS sponsors.',
        keyBenefits: ['Direct alignment with UK Visas & Immigration criteria', 'Official mock test simulations', 'Guidance on CAS and Home Office English verification']
      }
    ]
  },

  // ==========================================
  // CATEGORY 2: OET
  // ==========================================
  {
    id: 'oet-medicine',
    categoryId: 'oet',
    categoryName: 'OET — Healthcare English Proficiency',
    code: 'OET Medicine',
    name: 'Occupational English Test — Medicine (Doctors & Physicians)',
    conductingBody: 'Cambridge Boxhill Language Assessment (CBLA)',
    country: 'UK, Ireland, Australia, New Zealand, USA, UAE',
    examType: 'Clinical Medical English Benchmark',
    overview: 'The clinical English proficiency assessment designed specifically for medical doctors and physicians registering with international regulatory bodies including GMC (UK), AMC (Australia), and ECFMG (USA).',
    purpose: 'Medical registration, PLAB/UKMLA exemption pathways, USMLE ECFMG certification, and UAE Health Authority licensures.',
    pattern: 'Listening (45 min healthcare consultations), Reading (60 min workplace texts & clinical policies), Writing (45 min - referral/discharge letter from patient medical case notes), Speaking (20 min - 2 doctor-patient clinical consultations).',
    eligibility: 'Qualified MBBS / MD doctors or final-year medical students.',
    syllabusOrSkills: ['Medical Case Note Extraction', 'Clinical Referral & Discharge Drafting', 'Empathetic Doctor-Patient Communication', 'Diagnostic Dialogue Listening', 'Clinical Article Synthesis'],
    applicationProcess: 'Register on the official OET portal (test on computer at venue, test on paper, or OET@Home where eligible).',
    feesAndDates: 'Testing fee: ~AUD 587 (~AED 1,450). Delivered multiple times per month internationally.',
    officialUrl: 'https://www.occupationalenglishtest.org',
    verifiedCourses: [
      {
        id: 'crs-oet-med-pro',
        academyName: 'Revival Healthcare Academy',
        courseName: 'OET Medicine Grade B / 350+ Clinical Masterclass',
        duration: '6 Weeks (48 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Taught by certified healthcare communication trainers and experienced physicians. Features 20+ authentic medical writing case note corrections and role play simulations.',
        keyBenefits: ['Specialized medical referral writing corrections with line-by-line feedback', 'Live doctor-patient speaking role-play mock sessions', 'Full coverage of Listening Sub-test Part A, B, and C', 'Official Cambridge Boxhill study materials']
      }
    ]
  },
  {
    id: 'oet-nursing',
    categoryId: 'oet',
    categoryName: 'OET — Healthcare English Proficiency',
    code: 'OET Nursing',
    name: 'Occupational English Test — Nursing (Registered Nurses)',
    conductingBody: 'Cambridge Boxhill Language Assessment (CBLA)',
    country: 'UK, Ireland, Australia, New Zealand, USA, UAE',
    examType: 'Clinical Nursing English Benchmark',
    overview: 'The world-standard healthcare English proficiency examination for qualified nurses seeking registration with NMC (UK), NMBI (Ireland), AHPRA (Australia), and Gulf health ministries.',
    purpose: 'NMC UK registration, NHS international nursing recruitment, US VisaScreen certification, and UAE nursing practice.',
    pattern: 'Listening (45 min), Reading (60 min), Writing (45 min - nursing transfer, discharge, or community health referral letter), Speaking (20 min - 2 nurse-patient therapeutic communication scenarios).',
    eligibility: 'Graduates with Diploma in General Nursing and Midwifery (GNM) or B.Sc. Nursing from a statutory nursing council.',
    syllabusOrSkills: ['Nursing Care Plan Interpretation', 'Patient Reassurance & Bedside Manner', 'Discharge Letter Writing', 'Multidisciplinary Handover Listening', 'Medical Policy Analysis'],
    applicationProcess: 'Book online on the OET portal using a valid passport and current nursing credentials.',
    feesAndDates: 'Fee: ~AUD 587. Conducted twice every month at authorized international test centers.',
    officialUrl: 'https://www.occupationalenglishtest.org',
    verifiedCourses: [
      {
        id: 'crs-oet-nurse-ace',
        academyName: 'Revival Healthcare Academy',
        courseName: 'OET Nursing All-Subtests Grade B Accelerator',
        duration: '5 Weeks (40 Hours)',
        deliveryMode: 'Online Live & Weekend Batches',
        description: 'Engineered specifically for busy practicing nurses. Dedicated coaching on nursing referral letters and empathetic nurse-patient interaction.',
        keyBenefits: ['Personalized evaluation on 15+ nursing referral letters', 'Role-play recordings with detailed clinical feedback', 'Flexible evening and weekend batches for working staff']
      }
    ]
  },
  {
    id: 'oet-dentistry',
    categoryId: 'oet',
    categoryName: 'OET — Healthcare English Proficiency',
    code: 'OET Dentistry',
    name: 'Occupational English Test — Dentistry (Dental Surgeons)',
    conductingBody: 'Cambridge Boxhill Language Assessment (CBLA)',
    country: 'UK, Australia, New Zealand, Ireland',
    examType: 'Dental Communication Assessment',
    overview: 'Clinical English proficiency examination specifically designed for dental practitioners registering with GDC (UK), ADC (Australia), and dental boards.',
    purpose: 'General Dental Council (UK) registration, overseas dental registration examinations, and dental clinical practice in Commonwealth states.',
    pattern: 'Listening (45 min), Reading (60 min), Writing (45 min - dental referral or patient management letter), Speaking (20 min - 2 dental consultation scenarios discussing treatment plans, dental anxiety, and post-op care).',
    eligibility: 'Bachelor of Dental Surgery (BDS) or equivalent qualifying dental degree.',
    syllabusOrSkills: ['Dental History Taking', 'Treatment Plan Explanation', 'Dental Referral Letters to Orthodontists/Oral Surgeons', 'Patient Consent Dialogue'],
    applicationProcess: 'Apply online through OET official portal.',
    feesAndDates: 'Testing fee: ~AUD 587. Fixed international testing dates.',
    officialUrl: 'https://www.occupationalenglishtest.org',
    verifiedCourses: [
      {
        id: 'crs-oet-dental',
        academyName: 'Revival Healthcare Academy',
        courseName: 'OET Dentistry Focused Clinical Coaching',
        duration: '4 Weeks (32 Hours)',
        deliveryMode: 'Online Live 1-on-1 & Small Groups',
        description: 'Specialized guidance for dental practitioners with focused case note extraction and dentist-patient interaction practice.',
        keyBenefits: ['Dental referral letter grading', 'Clinical role-play practice with experienced examiners', 'Customized scheduling']
      }
    ]
  },
  {
    id: 'oet-pharmacy',
    categoryId: 'oet',
    categoryName: 'OET — Healthcare English Proficiency',
    code: 'OET Pharmacy',
    name: 'Occupational English Test — Pharmacy (Registered Pharmacists)',
    conductingBody: 'Cambridge Boxhill Language Assessment (CBLA)',
    country: 'UK, Ireland, Australia, New Zealand',
    examType: 'Pharmaceutical Communication Assessment',
    overview: 'Assessment of clinical communication skills for international pharmacists registering with General Pharmaceutical Council (GPhC) in the UK and overseas pharmacy boards.',
    purpose: 'Pharmacist statutory licensure and hospital/community pharmacy placement in English-speaking nations.',
    pattern: 'Listening, Reading, Writing (advising prescribers, pharmacovigilance reports, patient counseling letters), Speaking (counseling patients on dosage, side effects, and drug interactions).',
    eligibility: 'B.Pharm, M.Pharm, or Pharm.D degree from an accredited statutory university.',
    syllabusOrSkills: ['Medication Counseling Dialogue', 'Prescriber Query Letters', 'Adverse Drug Reaction Reporting', 'Prescription Clarification Interaction'],
    applicationProcess: 'Register on the official OET portal selecting the Pharmacy sub-test.',
    feesAndDates: 'Testing fee: ~AUD 587 per sitting.',
    officialUrl: 'https://www.occupationalenglishtest.org',
    verifiedCourses: [
      {
        id: 'crs-oet-pharm',
        academyName: 'Revival Healthcare Academy',
        courseName: 'OET Pharmacy Clinical Communication Track',
        duration: '4 Weeks (30 Hours)',
        deliveryMode: 'Online Live Sessions',
        description: 'Intensive practice for pharmacists on patient consultation dialogues and clinical clarification correspondence.',
        keyBenefits: ['Prescription query writing evaluation', 'Live mock pharmacist-patient interactions', 'Listening and reading skill drills']
      }
    ]
  },
  {
    id: 'oet-allied',
    categoryId: 'oet',
    categoryName: 'OET — Healthcare English Proficiency',
    code: 'OET Allied Healthcare',
    name: 'OET for Other Eligible Healthcare Professions',
    conductingBody: 'Cambridge Boxhill Language Assessment (CBLA)',
    country: 'UK, Australia, New Zealand, Ireland',
    examType: 'Allied Healthcare Benchmark',
    overview: 'Tailored occupational English assessments for allied healthcare professions: Physiotherapy, Radiography, Occupational Therapy, Dietetics, Podiatry, Optometry, and Veterinary Science.',
    purpose: 'Registration with HCPC (UK), AHPRA (Australia), CORU (Ireland), and international allied health councils.',
    pattern: 'Listening and Reading (shared healthcare modules) + Writing and Speaking customized specifically to the candidate’s allied healthcare discipline.',
    eligibility: 'Recognized professional qualification in the corresponding allied healthcare field.',
    syllabusOrSkills: ['Discipline-Specific Clinical Terminology', 'Rehabilitation Plan Documentation', 'Allied Health Patient Consultation', 'Inter-Professional Referral Protocols'],
    applicationProcess: 'Book online via OET website choosing your specific registered profession.',
    feesAndDates: 'Testing fee: ~AUD 587. Bi-monthly testing cycles.',
    officialUrl: 'https://www.occupationalenglishtest.org',
    verifiedCourses: [] // Empty state on purpose: prompt states "Never display fake academy listings"
  },

  // ==========================================
  // CATEGORY 3: OGT
  // ==========================================
  {
    id: 'ogt-advisory',
    categoryId: 'ogt',
    categoryName: 'OGT — Exploratory Advisory',
    code: 'OGT',
    name: 'OGT (Verification Pending)',
    conductingBody: 'Official Verification in Progress',
    country: 'International / Advisory Track',
    examType: 'Exploratory Advisory Record',
    overview: 'This entry is maintained as an exploratory advisory classification while official statutory syllabus parameters, conducting body, and formal eligibility criteria are being verified.',
    purpose: 'Prospective student advisory notification and regulatory verification tracking.',
    pattern: 'Detailed examination pattern and testing format will be published immediately upon official regulatory gazette confirmation.',
    eligibility: 'Statutory eligibility criteria undergoing institutional verification.',
    syllabusOrSkills: ['Syllabus details will be updated upon official council publication.'],
    applicationProcess: 'Registration procedures will be listed once officially confirmed by the authorized examination board.',
    feesAndDates: 'Official schedule and examination fees pending publication.',
    officialUrl: '',
    verifiedCourses: [] // Prompt: "Never display fake academy listings or invented course availability"
  },

  // ==========================================
  // CATEGORY 4: MEDICAL EXAMS
  // ==========================================
  {
    id: 'neet-ug',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'NEET-UG',
    name: 'National Eligibility cum Entrance Test (Undergraduate)',
    conductingBody: 'National Testing Agency (NTA)',
    country: 'India (Also required for Indian students studying medicine abroad)',
    examType: 'Indian National Medical Entrance Examination',
    overview: 'India’s mandatory unified national entrance examination for admission to undergraduate medical (MBBS), dental (BDS), AYUSH (BAMS, BHMS, BUMS), and veterinary programmes, and mandatory qualifying benchmark for Indian students studying abroad.',
    purpose: 'Admission to government, central, deemed, and private medical colleges in India, and mandatory eligibility for NMC Foreign Medical Graduate verification.',
    pattern: 'Pen-and-paper OMR test: 200 multiple-choice questions (180 to be attempted) across Physics, Chemistry, and Biology (Botany & Zoology); 720 Total Marks; 3 hours 20 minutes duration.',
    eligibility: 'Completed 10+2 with Physics, Chemistry, Biology/Biotechnology, and English with minimum 50% aggregate marks (40% for SC/ST/OBC). Minimum age: 17 years.',
    syllabusOrSkills: ['NCERT Physics (Mechanics, Thermodynamics, Electrodynamics)', 'Physical, Organic & Inorganic Chemistry', 'Cell Biology, Genetics, Human Physiology, Ecology'],
    applicationProcess: 'Online application via NTA portal (exams.nta.ac.in/NEET) typically released between January and March annually.',
    feesAndDates: 'Exam held once annually on first Sunday of May. Application fee: ₹1,700 (General) / ₹1,600 (OBC-NCL) / ₹1,000 (SC/ST/PwD).',
    officialUrl: 'https://exams.nta.ac.in/NEET/',
    verifiedCourses: [
      {
        id: 'crs-neet-target-1yr',
        academyName: 'Revival Medical Academy',
        courseName: 'NEET-UG 1-Year Comprehensive Target Course',
        duration: '1 Year (600+ Hours)',
        deliveryMode: 'Classroom & Online Live',
        description: 'Rigorous medical entrance training by senior faculty with chapter-wise NCERT question banks, daily practice papers (DPPs), and 40+ full syllabus test series.',
        keyBenefits: ['Complete NCERT line-by-line concept mastery', 'All-India Ranking Test Series with video solutions', 'Dedicated doubt-resolution clinics and performance analytics']
      }
    ]
  },
  {
    id: 'fmge',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'FMGE',
    name: 'Foreign Medical Graduate Examination (Screening Test)',
    conductingBody: 'National Board of Examinations in Medical Sciences (NBEMS)',
    country: 'India',
    examType: 'Indian Statutory Medical Screening Examination',
    overview: 'The statutory licensure screening examination conducted by NBEMS for Indian citizens and Overseas Citizens of India (OCI) holding foreign medical degrees to obtain provisional or permanent registration with the National Medical Commission (NMC).',
    purpose: 'Mandatory licensing qualifying test to practice medicine or enter internship/postgraduate training in India for foreign medical graduates.',
    pattern: 'Computer-based test: 300 multiple choice questions divided into two sessions of 150 questions each (Pre/Para-clinical & Clinical subjects); No negative marking; 150/300 (50%) passing threshold.',
    eligibility: 'Primary medical qualification (MBBS equivalent) confirmed by the relevant Indian Embassy and listed in WDOMS.',
    syllabusOrSkills: ['Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology', 'Medicine, Surgery, Obstetrics & Gynecology, Pediatrics, Ophthalmology, ENT, PSM'],
    applicationProcess: 'Apply online on natboard.edu.in during June or December examination windows with certified primary medical degree and passport.',
    feesAndDates: 'Conducted twice annually in June and December. Exam fee: ₹7,080.',
    officialUrl: 'https://natboard.edu.in',
    verifiedCourses: [
      {
        id: 'crs-fmge-clinical-master',
        academyName: 'Revival Medical Academy',
        courseName: 'FMGE 6-Month High-Yield Clinical Review',
        duration: '6 Months (450 Hours)',
        deliveryMode: 'Online Live & Recorded Access',
        description: 'Comprehensive clinical subject review focusing on image-based questions, clinical vignettes, and previous years high-yield concepts.',
        keyBenefits: ['5,000+ topic-wise clinical question bank', 'Bi-weekly grand tests matching NBEMS CBT interface', 'Direct faculty mentoring for foreign medical graduates']
      }
    ]
  },
  {
    id: 'next-exam',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'NExT',
    name: 'National Exit Test (NExT — Statutory Medical Licensing & PG Entrance)',
    conductingBody: 'National Medical Commission (NMC)',
    country: 'India',
    examType: 'Unified Licentiate & PG Ranking Examination',
    overview: 'The proposed unified national medical examination enacted under the National Medical Commission Act, 2019, designed to replace final-year MBBS exams, FMGE, and NEET-PG.',
    purpose: 'Dual purpose: Step 1 certifies eligibility for 1-year clinical internship and ranks candidates for MD/MS/PG diploma seats; Step 2 grants permanent NMC medical licensure.',
    pattern: 'Step 1: Computer-based clinical multiple-choice assessment over 3 days (Medicine, Surgery, Ob-Gyn, Pediatrics, ENT, Ophthalmology); Step 2: In-person practical/clinical & viva assessment after internship.',
    eligibility: 'Final year MBBS students in Indian medical institutions and foreign medical graduates eligible per NMC FMGL regulations.',
    syllabusOrSkills: ['Clinical Problem Solving', 'Differential Diagnosis & Therapeutics', 'Evidence-Based Medicine', 'Practical Patient Management'],
    applicationProcess: 'Will be conducted via official NMC authorized portal per official gazette timelines.',
    feesAndDates: 'Official implementation dates and fee structures are governed by upcoming NMC gazette notifications.',
    officialUrl: 'https://www.nmc.org.in',
    verifiedCourses: [] // No fake courses
  },
  {
    id: 'usmle',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'USMLE',
    name: 'United States Medical Licensing Examination (Step 1, Step 2 CK, Step 3)',
    conductingBody: 'FSMB & NBME / ECFMG',
    country: 'United States',
    examType: 'United States Medical Licensure & ECFMG Certification',
    overview: 'The premier three-step examination for medical licensure in the United States. International Medical Graduates (IMGs) take Step 1 and Step 2 CK to achieve ECFMG Certification and participate in the National Resident Matching Program (NRMP).',
    purpose: 'Medical residency match, fellowship training, and full independent medical licensure across all 50 US states.',
    pattern: 'Step 1: One-day computerized examination (7 hours, ~280 questions) — Pass/Fail scoring; Step 2 CK: One-day computerized examination (9 hours, ~318 questions) — Numeric 3-digit score; Step 3: Two-day computerized examination.',
    eligibility: 'Students or graduates of medical schools officially recognized in the World Directory of Medical Schools with an active ECFMG sponsor note.',
    syllabusOrSkills: ['Basic Biomedical Principles (Pathology, Pharmacology, Physiology, Micro, Genetics)', 'Clinical Knowledge & Patient Management', 'Biostatistics, Epidemiology, Ethics & Medical Safety'],
    applicationProcess: 'Register via ECFMG MyIntealth / IWA portal to receive USMLE Candidate Identification Number and schedule Prometric test date.',
    feesAndDates: 'Step 1: ~$1,000 + international surcharge; Step 2 CK: ~$1,000 + surcharge. Available year-round at Prometric test centers.',
    officialUrl: 'https://www.usmle.org',
    verifiedCourses: [
      {
        id: 'crs-usmle-step1-2ck',
        academyName: 'Revival Global Medical Advisory',
        courseName: 'USMLE Step 1 & Step 2 CK High-Yield Clinical Program',
        duration: '9 Months (Integrated Guidance)',
        deliveryMode: 'Online Live & 1-on-1 Mentorship',
        description: 'Taught by US-matched physicians. Comprehensive coverage of first aid principles, UWorld question breakdown techniques, and NRMP residency portfolio building.',
        keyBenefits: ['Step-by-step UWorld & NBME assessment analytics', '1-on-1 mentoring by US matched residents', 'Clinical elective / USCE profile guidance']
      }
    ]
  },
  {
    id: 'plab',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'PLAB / UKMLA',
    name: 'Professional and Linguistic Assessments Board Test (Transitioning to UKMLA)',
    conductingBody: 'General Medical Council (GMC), United Kingdom',
    country: 'United Kingdom',
    examType: 'UK Medical Licensing Pathway',
    overview: 'The GMC statutory examination pathway demonstrating that international medical graduates have the clinical knowledge and interpersonal skills necessary to practice medicine safely in the UK at the FY2 level.',
    purpose: 'GMC Full Registration with a Licence to Practise medicine in NHS trusts across England, Scotland, Wales, and Northern Ireland.',
    pattern: 'PLAB 1: 3-hour computer-delivered written exam consisting of 180 single-best-answer questions; PLAB 2 (CPSA): 18-station Objective Structured Clinical Examination (OSCE) conducted at GMC assessment center in Manchester.',
    eligibility: 'Primary medical qualification listed in WDOMS + verified English proficiency (IELTS Academic 7.5+ overall with minimum 7.0 in all skills, or OET Grade B in all four subtests).',
    syllabusOrSkills: ['Clinical Science & Diagnosis', 'Prescribing Safety & Pharmacology', 'Patient Communication & Cultural Sensitivity', 'Medical Ethics & UK Legal Frameworks'],
    applicationProcess: 'Book via GMC Online account following English qualification verification.',
    feesAndDates: 'PLAB 1: £268; PLAB 2: £1,041. Conducted 4 times yearly in international centers (PLAB 1) and year-round in Manchester (PLAB 2).',
    officialUrl: 'https://www.gmc-uk.org/registration-and-licensing/join-the-register/plab',
    verifiedCourses: [
      {
        id: 'crs-plab1-strategy',
        academyName: 'Revival UK Medical Advisory',
        courseName: 'PLAB 1 / UKMLA Clinical Question Bank & Masterclass',
        duration: '8 Weeks (64 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Curated by NHS practicing doctors focusing on NICE guidelines, British National Formulary (BNF) prescribing, and high-yield clinical recall analysis.',
        keyBenefits: ['3,000+ updated clinical scenario questions', 'Monthly full-length timed mock tests', 'Guidance on PLAB 2 academy booking and NHS clinical attachments']
      }
    ]
  },
  {
    id: 'mrcp',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'MRCP(UK)',
    name: 'Membership of the Royal Colleges of Physicians of the United Kingdom',
    conductingBody: 'Federation of Royal Colleges of Physicians (London, Edinburgh, Glasgow)',
    country: 'United Kingdom & International',
    examType: 'Postgraduate Medical Diploma & GMC Registration Pathway',
    overview: 'An internationally benchmarked postgraduate clinical diploma confirming the medical knowledge, clinical acumen, and professional skills required for specialty physician training; recognized by the GMC for direct full medical registration.',
    purpose: 'Specialty physician training eligibility in the UK and full GMC registration without taking PLAB, plus recognized senior physician status globally.',
    pattern: 'MRCP Part 1: One-day exam (two 3-hour papers of 100 questions each); MRCP Part 2: Two 3-hour papers of 100 clinical questions; PACES: Practical Assessment of Clinical Examination Skills (5 clinical stations evaluating real patients).',
    eligibility: 'Primary medical qualification (MBBS) + 12 months minimum post-qualification clinical experience.',
    syllabusOrSkills: ['Internal Medicine & Subspecialties (Cardiology, Respiratory, Endocrinology, Nephrology, Neurology, Oncology)', 'Emergency Medicine & Acute Care', 'Clinical Examination & History Taking'],
    applicationProcess: 'Online application through the official MRCP(UK) website during application windows.',
    feesAndDates: 'Part 1: ~£646 (International); Part 2: ~£646; PACES: ~£1,273. Conducted three times per year internationally.',
    officialUrl: 'https://www.mrcpuk.org',
    verifiedCourses: [
      {
        id: 'crs-mrcp1-prep',
        academyName: 'Revival Medical Academy',
        courseName: 'MRCP Part 1 Intensive Preparatory Course',
        duration: '12 Weeks (96 Hours)',
        deliveryMode: 'Online Live & Discussion Forums',
        description: 'Comprehensive high-yield internal medicine review mapping directly to the Royal Colleges specialty blueprints with extensive past question breakdowns.',
        keyBenefits: ['Detailed coverage of all 14 internal medicine domains', 'Systematic guideline updates (NICE/SIGN)', 'Real-time doubt resolution with certified MRCP holders']
      }
    ]
  },
  {
    id: 'country-medical-licensing',
    categoryId: 'medical-exams',
    categoryName: 'Medical Entrance & International Licensing',
    code: 'Country Medical Licensing',
    name: 'Country-Specific Medical Licensing Examinations (AMC, MCCQE, Approbation)',
    conductingBody: 'Respective Statutory Medical Councils (AMC, MCC, German State Landesprüfungsamt)',
    country: 'Australia, Canada, Germany, Ireland, New Zealand',
    examType: 'International Medical Licensing Pathways',
    overview: 'Specialized national licensing pathways required for physicians moving to Australia (AMC MCQ & Clinical), Canada (MCCQE Part 1), Germany (Fachsprachprüfung C1 Medical & Kenntnisprüfung Approbation), and Ireland (PRES).',
    purpose: 'Direct independent medical licensure and hospital placement in specific destination countries.',
    pattern: 'Varies by destination: Australia requires AMC Part 1 CAT-MCQ + AMC Part 2 Clinical; Canada requires MCCQE Part 1; Germany requires medical German language C1 + medical equivalence assessment.',
    eligibility: 'MBBS or equivalent medical qualification listed in the World Directory of Medical Schools.',
    syllabusOrSkills: ['National Clinical Guidelines & Standards', 'Destination Health System Protocols', 'Medical Communication in Destination Language'],
    applicationProcess: 'Apply through respective councils (AMC portal, physiciansapply.ca, or German state health offices).',
    feesAndDates: 'Registration fees per council schedule.',
    officialUrl: 'https://www.amc.org.au',
    verifiedCourses: [
      {
        id: 'crs-amc-mcq-prep',
        academyName: 'Revival Global Medical Advisory',
        courseName: 'Australian Medical Council (AMC) MCQ Preparation Track',
        duration: '8 Weeks (60 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Specialized question bank and clinical recalls for physicians targeting AMC Part 1 and medical residency in Australia.',
        keyBenefits: ['Coverage of Australian clinical guidelines & PBS protocols', 'Mock computer-adaptive tests', 'AHPRA registration and EPIC verification advisory']
      }
    ]
  },

  // ==========================================
  // CATEGORY 5: EUROPE & WESTERN COUNTRIES
  // ==========================================
  {
    id: 'toefl-ibt',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'TOEFL iBT',
    name: 'Test of English as a Foreign Language Internet-Based Test',
    conductingBody: 'Educational Testing Service (ETS)',
    country: 'USA, Canada, Europe, Global',
    examType: 'Standardized English Proficiency',
    overview: 'The premier university-level English test accepted by more than 12,500 universities across 160 countries, especially in the United States, Canada, and leading European universities.',
    purpose: 'Undergraduate and postgraduate university admissions, academic scholarships, and international student visas.',
    pattern: 'Computer-delivered test: Reading (35 mins - 2 passages), Listening (36 mins - 3 lectures & 2 conversations), Speaking (16 mins - 4 tasks), Writing (29 mins - 2 tasks including Academic Discussion); Total score: 120.',
    eligibility: 'Students pursuing university admissions abroad.',
    syllabusOrSkills: ['Academic Lecture Comprehension', 'Academic Discussion Contribution', 'Reading Synthesis', 'Spoken Academic Argumentation'],
    applicationProcess: 'Register online via ETS account (ets.org/toefl) selecting test center or TOEFL iBT Home Edition.',
    feesAndDates: 'Testing fee: ~$205 – $260 depending on location. Offered over 60 times a year.',
    officialUrl: 'https://www.ets.org/toefl',
    verifiedCourses: [
      {
        id: 'crs-toefl-100plus',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'TOEFL iBT Score 100+ Accelerator',
        duration: '5 Weeks (40 Hours)',
        deliveryMode: 'Online Live Sessions',
        description: 'Comprehensive test preparation focused on the new shortened TOEFL format, academic discussion writing, and speech scoring rubrics.',
        keyBenefits: ['ETS authorized question practice', 'Detailed speech scoring feedback', 'Full length scored simulations']
      }
    ]
  },
  {
    id: 'pte-academic',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'PTE Academic',
    name: 'Pearson Test of English Academic',
    conductingBody: 'Pearson VUE',
    country: 'Australia, New Zealand, UK, Canada, USA',
    examType: 'AI-Scored Computer-Based English Test',
    overview: 'Fast, AI-scored computerized English test recognized for 100% of Australian and New Zealand visa applications, approved by UK Home Office for visas, and accepted by thousands of global universities.',
    purpose: 'University admissions and immigration visa applications with score delivery typically within 48 hours.',
    pattern: 'Single 2-hour computer session: Speaking & Writing (54-67 mins), Reading (29-30 mins), Listening (30-43 mins); Scored on a 10-90 scale.',
    eligibility: 'Candidates aged 16+ needing language proof for study or migration.',
    syllabusOrSkills: ['Read Aloud & Repeat Sentence', 'Describe Image & Retell Lecture', 'Summarize Written Text & Essay', 'Re-order Paragraphs & Fill in Blanks'],
    applicationProcess: 'Register online at pearsonpte.com using valid passport.',
    feesAndDates: 'Testing fee: ~AED 1,050 – 1,150 / ₹17,000. Testing appointments available daily.',
    officialUrl: 'https://www.pearsonpte.com',
    verifiedCourses: [
      {
        id: 'crs-pte-79plus',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'PTE Academic 79+ / 8 Bands Masterclass',
        duration: '4 Weeks (36 Hours)',
        deliveryMode: 'Online Live & Self-Paced Labs',
        description: 'Master AI scoring algorithms for Speaking Read Aloud, Describe Image, and Repeat Sentence with live scoring feedback.',
        keyBenefits: ['AI scoring software practice portal access', 'High-accuracy template mastery', 'Real-exam memory question bank']
      }
    ]
  },
  {
    id: 'gre-general',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'GRE General',
    name: 'Graduate Record Examination (GRE General Test)',
    conductingBody: 'Educational Testing Service (ETS)',
    country: 'USA, Canada, Germany, UK, Global',
    examType: 'Graduate Admissions Standardized Test',
    overview: 'The world’s most widely accepted standardized admissions test for Master’s, specialized business Master’s, MBA, and Ph.D. programmes worldwide.',
    purpose: 'Graduate school admissions, merit fellowships, and teaching assistantships.',
    pattern: 'Shorter GRE format (under 2 hours): Analytical Writing (1 task, 30 mins, 0-6 score), Verbal Reasoning (2 sections, 27 questions, 41 mins, 130-170 score), Quantitative Reasoning (2 sections, 27 questions, 47 mins, 130-170 score).',
    eligibility: 'Undergraduate degree holders or final year students applying for graduate studies.',
    syllabusOrSkills: ['Advanced Quantitative (Arithmetic, Algebra, Geometry, Data Analysis)', 'Advanced Vocabulary in Context & Text Completion', 'Reading Comprehension', 'Analytical Argumentative Essay'],
    applicationProcess: 'Book online at ets.org/gre for test center or at-home testing.',
    feesAndDates: 'Testing fee: ~$220. Offered continuous year-round testing.',
    officialUrl: 'https://www.ets.org/gre',
    verifiedCourses: [
      {
        id: 'crs-gre-320plus',
        academyName: 'Revival Executive Academy',
        courseName: 'GRE Quant 165+ & Verbal 325+ Target Program',
        duration: '8 Weeks (64 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Rigorous quantitative shortcuts, high-frequency vocabulary etymology, and strategic timed test-taking techniques.',
        keyBenefits: ['5 full-length adaptive computer tests', '1,500+ hard-level quant and verbal question banks', 'Individual graduate university shortlisting review']
      }
    ]
  },
  {
    id: 'gmat-focus',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'GMAT Focus',
    name: 'Graduate Management Admission Test (Focus Edition)',
    conductingBody: 'Graduate Management Admission Council (GMAC)',
    country: 'Global Business Schools (USA, Europe, UK, Singapore)',
    examType: 'Business School Standardized Test',
    overview: 'The leading assessment designed specifically for graduate business and management school admissions (MBA, Master of Finance, Master in Management).',
    purpose: 'Admissions to top global MBA programs (Harvard, Stanford, INSEAD, LBS, Wharton) and specialized management master’s.',
    pattern: '2 hours 15 minutes: Quantitative Reasoning (21 questions, 45 mins), Verbal Reasoning (23 questions, 45 mins), Data Insights (20 questions, 45 mins); Total score: 205 to 805.',
    eligibility: 'Graduates and professionals applying to MBA and business master’s programs.',
    syllabusOrSkills: ['Data Sufficiency & Multi-Source Reasoning', 'Table & Graphical Data Analysis', 'Critical Reasoning & Argument Analysis', 'Pure Problem Solving'],
    applicationProcess: 'Book via mba.com test center or online.',
    feesAndDates: 'Testing fee: ~$275. Year-round availability.',
    officialUrl: 'https://www.mba.com/exams/gmat-focus-edition',
    verifiedCourses: [
      {
        id: 'crs-gmat-focus-700',
        academyName: 'Revival Executive Academy',
        courseName: 'GMAT Focus 665+ (90th Percentile) Strategy',
        duration: '8 Weeks (60 Hours)',
        deliveryMode: 'Online Live & 1-on-1 Strategy',
        description: 'Elite coaching targeting the Data Insights and Critical Reasoning sections with official GMAC question analysis.',
        keyBenefits: ['In-depth Data Insights workshop', 'Personalized pacing and error-log analytics', 'B-School essay and profile consultation']
      }
    ]
  },
  {
    id: 'digital-sat',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'Digital SAT',
    name: 'Scholastic Assessment Test (Digital SAT)',
    conductingBody: 'College Board',
    country: 'USA, Canada, Global Undergraduate Admissions',
    examType: 'Undergraduate Standardized Admissions Test',
    overview: 'The adaptive digital entrance examination used for undergraduate admissions and merit scholarships by colleges and universities in the United States and internationally.',
    purpose: 'Bachelor’s degree admissions, honors college placement, and academic scholarships.',
    pattern: '2 hours 14 minutes on Bluebook application: Reading and Writing (2 modules, 54 questions, 64 mins) + Math (2 modules, 44 questions, 70 mins with built-in Desmos graphing calculator); Total score: 400-1600.',
    eligibility: 'High school students in Grades 11 and 12 applying for undergraduate studies.',
    syllabusOrSkills: ['Algebra, Advanced Math, Problem Solving & Data Analysis, Geometry/Trigonometry', 'Information & Ideas, Craft & Structure, Expression of Ideas, Standard English Conventions'],
    applicationProcess: 'Register at satsuite.collegeboard.org and select test date and center.',
    feesAndDates: 'Testing fee: ~$111 + regional fee. Administered 7 times yearly internationally (March, May, June, August, October, November, December).',
    officialUrl: 'https://satsuite.collegeboard.org/digital',
    verifiedCourses: [
      {
        id: 'crs-sat-1500plus',
        academyName: 'Revival Academic Track',
        courseName: 'Digital SAT 1500+ Target Preparation',
        duration: '10 Weeks (80 Hours)',
        deliveryMode: 'Online Live & Dubai Campus',
        description: 'Master adaptive module mechanics, Desmos calculator speed tricks, and complex reading passage logic.',
        keyBenefits: ['8 full-length adaptive Bluebook-style mock tests', 'Desmos calculator mastery sessions', 'Grammar conventions and algebra drill modules']
      }
    ]
  },
  {
    id: 'western-language-exams',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'Country Language Exams',
    name: 'European & Western National Language Certifications (TestDaF, DELF/DALF, DELE, CELPIP)',
    conductingBody: 'Official Cultural & Language Institutes (Goethe, France Éducation, Cervantes, Paragon)',
    country: 'Germany, France, Spain, Canada',
    examType: 'National Linguistic Proficiency Credentials',
    overview: 'Official CEFR linguistic certifications required for tuition-free university study in Germany (TestDaF / Goethe B2/C1), France (DELF B2 / DALF C1), Spain (DELE), and Canadian PR (CELPIP).',
    purpose: 'University admissions in national language tracks, professional recognition, and permanent residence.',
    pattern: 'Standard CEFR assessments evaluating Reading, Listening, Writing, and Speaking corresponding to B1, B2, C1 levels.',
    eligibility: 'Students and professionals seeking study or migration in respective countries.',
    syllabusOrSkills: ['Target Language Grammar & Vocabulary', 'Academic Text Analysis', 'Formal Correspondence', 'Spontaneous Oral Proficiency'],
    applicationProcess: 'Register through authorized institutes (Goethe-Institut, Alliance Française, Instituto Cervantes, or CELPIP centers).',
    feesAndDates: 'Exam fees vary by level (€150–€230). Held on fixed global calendar dates.',
    officialUrl: 'https://www.goethe.de',
    verifiedCourses: [
      {
        id: 'crs-german-b2',
        academyName: 'Revival Language & Exam Academy',
        courseName: 'German B1/B2 Fast-Track for University & Medical Work',
        duration: '16 Weeks (160 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Engineered for students and doctors planning tuition-free studies or medical Approbation in Germany.',
        keyBenefits: ['Native-certified instructors', 'Goethe and TestDaF exam prep modules', 'Free study visa & APS certificate consultation']
      }
    ]
  },
  {
    id: 'western-licensing-exams',
    categoryId: 'europe-western',
    categoryName: 'Europe & Western Countries Examinations',
    code: 'Western Professional Licensure',
    name: 'Country-Specific Professional Licensing (NCLEX-RN, Solicitors SQE, Bar, CPA)',
    conductingBody: 'NCSBN, SRA (UK), State Bar Examiners, AICPA',
    country: 'USA, UK, Canada',
    examType: 'Statutory Professional Practice Licensure',
    overview: 'Statutory licensing exams required to practice professions in Western countries: NCLEX-RN for nurses in USA/Canada, Solicitors Qualifying Examination (SQE) in England & Wales, and US CPA for accountants.',
    purpose: 'Direct independent professional practice and sponsorship in Western jurisdictions.',
    pattern: 'NCLEX: Computerized Adaptive Test (Next-Gen Clinical Judgment Model, 85-150 items); SQE: SQE1 (two 180-question exams) + SQE2 (practical legal skills assessment).',
    eligibility: 'Accredited degree in Nursing, Law, or Accounting.',
    syllabusOrSkills: ['Jurisdiction-Specific Regulatory Standards', 'Clinical Judgment & Case Management', 'Statutory Compliance'],
    applicationProcess: 'Apply via respective regulatory boards (State Board of Nursing, SRA, State Accountancy Board).',
    feesAndDates: 'Fees per statutory council.',
    officialUrl: 'https://www.ncsbn.org/nclex.page',
    verifiedCourses: [
      {
        id: 'crs-nclex-nextgen',
        academyName: 'Revival Healthcare Academy',
        courseName: 'NCLEX-RN Next-Generation Clinical Judgment Program',
        duration: '10 Weeks (80 Hours)',
        deliveryMode: 'Online Live & Case Study Labs',
        description: 'Comprehensive preparation for international nurses targeting US Green Card or Canadian RN registration.',
        keyBenefits: ['Next-Gen NGN case study simulations', '2,500+ adaptive question bank', 'Full CGFNS / CES credentialing guidance']
      }
    ]
  },

  // ==========================================
  // CATEGORY 6: GCC MEDICAL LICENSING EXAMS
  // ==========================================
  {
    id: 'dha-dubai',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'DHA Dubai',
    name: 'Dubai Health Authority (DHA) Prometric Licensure Examination',
    conductingBody: 'Dubai Health Authority (DHA) via Prometric',
    country: 'Dubai, United Arab Emirates',
    examType: 'Statutory Medical Licensure',
    overview: 'The mandatory licensing examination conducted by DHA for healthcare professionals (General Practitioners, Specialists, Registered Nurses, Dentists, Pharmacists, and Allied Health) seeking to practice in Dubai private and government healthcare sectors.',
    purpose: 'Issuance of DHA Professional Eligibility Letter / License to practice medicine and healthcare in the Emirate of Dubai.',
    pattern: 'Computer-based testing via Prometric: 100 to 150 Multiple Choice Questions (2.5 to 3 hours); No negative marking; Passing threshold 60% – 65% depending on specialty.',
    eligibility: 'Recognized medical/dental/nursing/allied degree + verified internship + minimum 2 years continuous clinical experience post-internship + Primary Source Verification (DataFlow).',
    syllabusOrSkills: ['Emergency Medicine & Acute Resuscitation', 'Clinical Diagnostics & Therapeutics', 'Patient Safety & Dubai Healthcare Regulations', 'Infection Control Protocols', 'Pharmacotherapy'],
    applicationProcess: 'Create DHA Sheryan account → Submit DataFlow PSV application → Obtain Credential Approval → Generate Prometric Eligibility ID → Schedule Prometric CBT exam.',
    feesAndDates: 'DHA evaluation: ~AED 210; DataFlow: ~AED 1,000 – 1,400; Prometric exam: ~AED 1,000 – 1,200 ($280). Testing available year-round at Prometric centers worldwide.',
    officialUrl: 'https://www.dha.gov.ae',
    verifiedCourses: [
      {
        id: 'crs-dha-prometric-pro',
        academyName: 'Revival GCC Healthcare Advisory Desk',
        courseName: 'DHA Prometric High-Yield Medical & Nursing Question Bank',
        duration: '4 Weeks (32 Hours)',
        deliveryMode: 'Online Live & Self-Paced Q-Bank',
        description: 'Complete preparation including latest DHA Prometric recalls, high-yield clinical MCQs, and full assistance with Sheryan portal & DataFlow verification.',
        keyBenefits: ['3,000+ updated specialty-specific Prometric MCQs', 'Complete DataFlow and Sheryan portal filing assistance', '100% money-back pass commitment advisory']
      }
    ]
  },
  {
    id: 'doh-abudhabi',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'DOH Abu Dhabi',
    name: 'Department of Health Abu Dhabi (DOH / formerly HAAD) Licensure Exam',
    conductingBody: 'Department of Health Abu Dhabi via Pearson VUE / Prometric',
    country: 'Abu Dhabi & Al Ain, United Arab Emirates',
    examType: 'Statutory Healthcare Licensure',
    overview: 'The mandatory healthcare licentiate assessment governed by DOH Abu Dhabi for practicing doctors, nurses, and medical specialists in the Emirate of Abu Dhabi.',
    purpose: 'Issuance of DOH Professional License for employment across hospitals, clinics, and medical centers in Abu Dhabi and Al Ain.',
    pattern: 'Computer-based examination (100-150 MCQs, 2.5-3 hours) administered via Pearson VUE / Prometric, followed by oral interview for select consultant categories.',
    eligibility: 'Accredited degree + verified uninterrupted clinical experience (2+ years post-qualification) + DataFlow Primary Source Verification.',
    syllabusOrSkills: ['Clinical Specialty Knowledge', 'DOH Clinical Governance Standards', 'Patient Safety & Medical Ethics', 'Pharmacology & Diagnosis'],
    applicationProcess: 'Submit credentials through Abu Dhabi TAMM portal → Complete DataFlow audit → Schedule and pass CBT examination.',
    feesAndDates: 'Exam and credentialing fees per DOH / TAMM official schedule. Testing year-round.',
    officialUrl: 'https://www.doh.gov.ae',
    verifiedCourses: [
      {
        id: 'crs-doh-exam-prep',
        academyName: 'Revival GCC Healthcare Advisory Desk',
        courseName: 'DOH / HAAD Abu Dhabi Licensure Strategy & Question Review',
        duration: '4 Weeks (30 Hours)',
        deliveryMode: 'Online Live Sessions',
        description: 'Comprehensive review targeting DOH Pearson VUE / Prometric examination patterns with TAMM licensing documentation support.',
        keyBenefits: ['DOH specific question banks and diagnostic mock tests', 'Step-by-step guidance on TAMM healthcare portal', 'End-to-end credential attestation coordination']
      }
    ]
  },
  {
    id: 'mohap-uae',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'MOHAP UAE',
    name: 'Ministry of Health and Prevention (MOHAP) UAE Licensure Exam',
    conductingBody: 'Ministry of Health and Prevention, UAE via Prometric',
    country: 'Sharjah, Ajman, RAK, Fujairah, UAQ (UAE Federal)',
    examType: 'Federal UAE Medical Licensure',
    overview: 'The federal UAE medical licensure exam governing medical, dental, pharmacy, and nursing practice across the Northern Emirates (Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain).',
    purpose: 'MOHAP evaluation letter and clinical license for healthcare employment in Northern Emirates facilities.',
    pattern: 'Computer-based Prometric MCQ examination (100 questions, 2.5 hours); Passing score: 60%.',
    eligibility: 'Recognized medical/allied degree + certified internship + 2 years clinical experience + DataFlow report + valid Certificate of Good Standing.',
    syllabusOrSkills: ['General Medicine & Surgery Principles', 'Primary Healthcare Diagnostics', 'UAE Federal Health Regulations'],
    applicationProcess: 'Online application through MOHAP portal (mohap.gov.ae) → DataFlow verification → Prometric exam booking.',
    feesAndDates: 'MOHAP application: ~AED 300; Exam fee: ~AED 1,000. Year-round availability.',
    officialUrl: 'https://mohap.gov.ae',
    verifiedCourses: [
      {
        id: 'crs-mohap-prep',
        academyName: 'Revival GCC Healthcare Advisory Desk',
        courseName: 'MOHAP UAE Prometric Preparation & DataFlow Fast-Track',
        duration: '3 Weeks (24 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Targeted preparation for nurses, doctors, and pharmacists sitting for the federal UAE health examination.',
        keyBenefits: ['MOHAP specific question recalls', 'Primary Source Verification guidance', 'Quick-track study summaries']
      }
    ]
  },
  {
    id: 'scfhs-saudi',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'SCFHS Saudi Arabia',
    name: 'Saudi Commission for Health Specialties Licensure Examinations (SMLE / SNLE)',
    conductingBody: 'Saudi Commission for Health Specialties (SCFHS)',
    country: 'Kingdom of Saudi Arabia (KSA)',
    examType: 'Saudi National Healthcare Licensure',
    overview: 'The statutory licensure examinations administered by SCFHS for healthcare personnel seeking professional classification and clinical registration in Saudi Arabia: SMLE (Doctors), SNLE (Nurses), SDLE (Dentists), and SPLE (Pharmacists).',
    purpose: 'Professional classification and licensing for employment across Saudi Ministry of Health, military hospitals, and private health networks.',
    pattern: 'Computerized examination via Prometric: 300 multiple choice questions divided into three blocks of 100 questions; Total testing time 4.5 hours.',
    eligibility: 'Relevant professional qualification + DataFlow primary source verification completed on the Mumaris+ platform.',
    syllabusOrSkills: ['Adult Health, Pediatrics, Obstetrics & Gynecology, Surgery, Emergency Medicine', 'SCFHS Patient Safety Standards'],
    applicationProcess: 'Create Mumaris+ profile → Submit DataFlow verification → Await professional eligibility number → Book Prometric test date.',
    feesAndDates: 'Testing fee: ~SAR 1,100 ($295). Conducted year-round at Prometric test centers worldwide.',
    officialUrl: 'https://scfhs.org.sa',
    verifiedCourses: [
      {
        id: 'crs-scfhs-smle',
        academyName: 'Revival GCC Healthcare Advisory Desk',
        courseName: 'SCFHS SMLE / SNLE High-Yield Question Bank & Mumaris+ Support',
        duration: '6 Weeks (48 Hours)',
        deliveryMode: 'Online Live & On-Demand Labs',
        description: 'Comprehensive coverage of SCFHS blueprints with Saudi clinical guidelines, past exam recalls, and Mumaris+ filing support.',
        keyBenefits: ['3,500+ verified SCFHS Prometric MCQs', 'Mumaris+ and DataFlow application support', 'Mock exams matching 300-question testing stamina']
      }
    ]
  },
  {
    id: 'qatar-dhp',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'Qatar DHP',
    name: 'Department of Healthcare Professions (DHP / QCHP) Qatar Prometric Exam',
    conductingBody: 'Qatar Ministry of Public Health (MoPH)',
    country: 'State of Qatar',
    examType: 'Statutory Medical Licensure',
    overview: 'The statutory licensure examination required for healthcare practitioners seeking to work in Hamad Medical Corporation (HMC), Primary Health Care Corporation (PHCC), and private hospitals in Qatar.',
    purpose: 'Issuance of DHP Qatar Healthcare License to practice medicine, dentistry, nursing, or allied health.',
    pattern: 'Computer-based Prometric assessment: 100 multiple choice questions (2.5 hours); Passing threshold: 60%.',
    eligibility: 'Accredited degree + minimum 2-3 years clinical experience post-internship + DataFlow PSV + Good Standing certificate.',
    syllabusOrSkills: ['Core Clinical Competencies', 'Acute & Ambulatory Care', 'Qatar MoPH Infection Control & Patient Safety Guidelines'],
    applicationProcess: 'Submit online application on MoPH DHP portal → Undergo DataFlow audit → Obtain Prometric eligibility code → Schedule exam.',
    feesAndDates: 'MoPH evaluation fee + ~$280 Prometric fee. Available year-round.',
    officialUrl: 'https://dhp.moph.gov.qa',
    verifiedCourses: [
      {
        id: 'crs-qatar-dhp',
        academyName: 'Revival GCC Healthcare Advisory Desk',
        courseName: 'Qatar DHP Prometric Preparation & Credential Review',
        duration: '4 Weeks (30 Hours)',
        deliveryMode: 'Online Live',
        description: 'Dedicated study track for doctors and nurses applying for Hamad Medical Corporation and Qatar private healthcare sectors.',
        keyBenefits: ['Qatar specific clinical question sets', 'MoPH registration dossier checks', 'Practice exams']
      }
    ]
  },
  {
    id: 'oman-medical',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'Oman Medical Licensing',
    name: 'Oman Medical Specialty Board (OMSB) & Ministry of Health Licensing Exam',
    conductingBody: 'Oman Medical Specialty Board (OMSB) / MoH Oman via Pearson VUE',
    country: 'Sultanate of Oman',
    examType: 'Statutory Healthcare Licensure',
    overview: 'The qualifying examination conducted by OMSB for doctors, dentists, nurses, and pharmacists seeking medical employment in the Sultanate of Oman.',
    purpose: 'OMSB professional license and Ministry of Health clinical clearance.',
    pattern: 'Computer-based test via Pearson VUE (100 MCQs, 2.5 hours) followed by viva/oral assessment by MoH Oman committee.',
    eligibility: 'Recognized medical degree + 2-3 years continuous clinical experience + DataFlow verification.',
    syllabusOrSkills: ['Core Clinical Principles', 'Oman MoH Guidelines', 'Diagnostic Accuracy'],
    applicationProcess: 'Apply via OMSB portal → Primary Source Verification via DataFlow → Pearson VUE test appointment.',
    feesAndDates: 'Exam fee ~$240. Year-round testing.',
    officialUrl: 'https://www.omsb.gov.om',
    verifiedCourses: [] // Empty state on purpose: prompt states "Never display fake academy listings"
  },
  {
    id: 'bahrain-nhra',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'Bahrain NHRA',
    name: 'National Health Regulatory Authority (NHRA) Licensing Examination',
    conductingBody: 'National Health Regulatory Authority (NHRA), Bahrain via Prometric',
    country: 'Kingdom of Bahrain',
    examType: 'Statutory Healthcare Licensure',
    overview: 'The statutory licensing examination required for doctors, dentists, nurses, and allied healthcare professionals to practice in the Kingdom of Bahrain.',
    purpose: 'NHRA professional license and registration in Bahrain.',
    pattern: 'Computerized Prometric examination: 100 multiple choice questions (2.5 hours); Passing mark: 60%.',
    eligibility: 'Accredited degree + verified experience (2 years minimum) + DataFlow Primary Source Verification.',
    syllabusOrSkills: ['Clinical Diagnostics', 'Therapeutics & Pharmacology', 'Bahrain NHRA Standards'],
    applicationProcess: 'Register on NHRA Bahrain portal → DataFlow audit → Prometric exam booking.',
    feesAndDates: 'Fees per NHRA guidelines. Tested year-round.',
    officialUrl: 'https://www.nhra.bh',
    verifiedCourses: [] // Empty state
  },
  {
    id: 'kuwait-medical',
    categoryId: 'gcc-medical',
    categoryName: 'GCC Medical Licensing Exams',
    code: 'Kuwait Medical Licensing',
    name: 'Kuwait Ministry of Health & KIMS Medical Licensing Assessment',
    conductingBody: 'Kuwait Ministry of Health / Kuwait Institute for Medical Specializations',
    country: 'State of Kuwait',
    examType: 'Statutory Healthcare Licensure',
    overview: 'The statutory credentialing and examination system governing medical, dental, and healthcare licensing in the State of Kuwait.',
    purpose: 'Kuwait MOH medical license and placement in government and private healthcare facilities.',
    pattern: 'Credential evaluation + written examination and clinical viva interview conducted by the Kuwait Medical Licensing Committee.',
    eligibility: 'Recognized medical degree + certified clinical experience + DataFlow verification.',
    syllabusOrSkills: ['Clinical Specialties', 'Emergency & Critical Care', 'Kuwait Health Regulations'],
    applicationProcess: 'Application through Kuwait MOH portal with complete attested credentials.',
    feesAndDates: 'Administered in coordination with Kuwait health ministry recruitment cycles.',
    officialUrl: 'https://www.moh.gov.kw',
    verifiedCourses: [] // Empty state
  },

  // ==========================================
  // CATEGORY 7: GCC ENGINEERING EXAMS & REGISTRATION
  // ==========================================
  {
    id: 'sce-saudi',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'Saudi Council of Engineers (SCE)',
    name: 'Saudi Council of Engineers (SCE) Professional Accreditation & FE/PE Assessment',
    conductingBody: 'Saudi Council of Engineers (SCE) / Qiwa / ETEC',
    country: 'Kingdom of Saudi Arabia (KSA)',
    examType: 'Statutory Professional Accreditation Pathway',
    overview: 'Mandatory statutory professional accreditation pathway for all engineers practicing in Saudi Arabia. Required to obtain or renew an engineering Iqama (work permit) and sign off on technical projects in the Kingdom.',
    purpose: 'Mandatory Iqama profession validation, membership grade classification (Associate, Professional, Consultant), and government project bidding.',
    pattern: 'Engineers with under 5 years experience must complete the Fundamentals of Engineering (FE) Assessment; experienced engineers undergo comprehensive academic and portfolio audit for Professional Engineer (PE) status.',
    eligibility: 'Bachelor’s degree in Engineering (B.E. / B.Tech / B.Sc. Eng) from a recognized university + DataFlow / SCE credential attestation.',
    syllabusOrSkills: ['Discipline Core Principles (Civil, Mechanical, Electrical, Chemical, Industrial)', 'Engineering Ethics & Safety Standards', 'Project Management & Saudi Building Codes'],
    applicationProcess: 'Submit credentials via official SCE portal (saudieng.sa) → Complete DataFlow verification → Register for FE/PE assessment via ETEC / Prometric where mandated.',
    feesAndDates: 'SCE membership fee: SAR 500 – 1,000; Accreditation fee: SAR 2,000 (3-year validity); Exam fee: ~SAR 800.',
    officialUrl: 'https://www.saudieng.sa',
    isProfessionalPathway: true,
    verifiedCourses: [
      {
        id: 'crs-sce-fe-prep',
        academyName: 'Revival GCC Engineering Advisory Desk',
        courseName: 'Saudi Council of Engineers (SCE) Accreditation & FE Review',
        duration: '4 Weeks (32 Hours)',
        deliveryMode: 'Online Live & Portfolio Support',
        description: 'Comprehensive support covering SCE portal documentation, DataFlow degree attestation, and Fundamentals of Engineering (FE) assessment drills.',
        keyBenefits: ['Step-by-step SCE portal & Qiwa verification support', 'Civil, Electrical & Mechanical FE question sets', 'Saudi Building Code (SBC) compliance overview']
      }
    ]
  },
  {
    id: 'uae-engineering',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'UAE Engineering Registration',
    name: 'UAE Engineering Registration & Municipality Licensing (Dubai, Abu Dhabi, SOE)',
    conductingBody: 'Society of Engineers UAE / Dubai Municipality / Abu Dhabi DMT',
    country: 'United Arab Emirates',
    examType: 'Municipality Accreditation & SOE Licensure Pathway',
    overview: 'Mandatory professional accreditation and municipality qualifying examinations required for engineers to obtain UAE signing authority, consultant licensing, and commercial contracting approval.',
    purpose: 'Obtaining Dubai Municipality G+1, G+4, or Unlimited Engineering License, Abu Dhabi Department of Municipalities and Transport (DMT) classification, and Society of Engineers UAE membership.',
    pattern: 'Written multiple choice and technical drawing interview conducted at municipality headquarters, evaluating local building codes, structural calculations, and FIDIC contracts.',
    eligibility: 'Attested Bachelor of Engineering degree (MOFA UAE & UAE Embassy) + minimum 2 to 5 years verified construction/design experience in UAE or home country.',
    syllabusOrSkills: ['Dubai Municipality Building Regulations (BNC)', 'UAE Fire & Life Safety Code', 'Structural Modeling (ETABS/SAFE)', 'Electrical & MEP DEWA/ADDC Regulations'],
    applicationProcess: 'Obtain Society of Engineers (SOE) membership → Register on Dubai BPS / Abu Dhabi TAMM portal → Schedule technical exam at Municipality test center.',
    feesAndDates: 'SOE membership: ~AED 1,000; Municipality exam fee: ~AED 520. Testing scheduled on demand.',
    officialUrl: 'https://www.soeuae.ae',
    isProfessionalPathway: true,
    verifiedCourses: [
      {
        id: 'crs-uae-muni-exam',
        academyName: 'Revival GCC Engineering Advisory Desk',
        courseName: 'Dubai & Abu Dhabi Municipality Engineering Exam Preparation',
        duration: '5 Weeks (35 Hours)',
        deliveryMode: 'Online Live & Case Study Workshops',
        description: 'Structured preparation for Civil, Structural, and MEP engineers preparing for the Dubai Municipality (G+1/G+4/Unlimited) and Abu Dhabi DMT licensure exams.',
        keyBenefits: ['Comprehensive coverage of Dubai Building Codes and Circulars', 'Sample municipality past questions and calculation exercises', 'Society of Engineers membership documentation advisory']
      }
    ]
  },
  {
    id: 'qatar-upda',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'Qatar UPDA / MMUP',
    name: 'Qatar Engineering Registration Requirements (UPDA / MME / MMUP Exam)',
    conductingBody: 'Ministry of Municipality and Environment (MME) Qatar',
    country: 'State of Qatar',
    examType: 'Statutory Engineering License Examination',
    overview: 'Mandatory statutory registration examination conducted by the Engineers & Consulting Offices Accrediting Committee at the Ministry of Municipality in Qatar. Mandatory for every practicing engineer in Qatar.',
    purpose: 'Issuance of UPDA / MMUP Engineer Registration Card (Grades A, B, or C) required by all engineering employers, government ministries, and consultants in Qatar.',
    pattern: 'Computer-based examination at MME headquarters: 25 to 27 multiple-choice questions in 1 hour; Questions cover general engineering discipline principles, project management, and Qatar national standards; Minimum passing mark 60% – 70%.',
    eligibility: 'Bachelor’s degree in Engineering from an approved university + minimum 3 years of verified post-graduation experience + Qatar ID (QID) + Police Clearance Certificate (PCC).',
    syllabusOrSkills: ['Core Engineering Discipline Principles (Civil, Mechanical, Electrical, Chemical)', 'Project Management (PMBOK / FIDIC)', 'Qatar Construction Specifications (QCS 2014)'],
    applicationProcess: 'Apply online on MME portal (mme.gov.qa) with attested degree, transcripts, PCC, and experience certificates → Await document approval → Schedule exam session.',
    feesAndDates: 'Exam fee: QAR 300 – 500. Conducted regularly at MME examination center in Doha.',
    officialUrl: 'https://www.mme.gov.qa',
    isProfessionalPathway: true,
    verifiedCourses: [
      {
        id: 'crs-qatar-upda-prep',
        academyName: 'Revival GCC Engineering Advisory Desk',
        courseName: 'Qatar UPDA / MMUP Engineering Exam Complete Masterclass',
        duration: '4 Weeks (30 Hours)',
        deliveryMode: 'Online Live Interactive',
        description: 'Led by licensed UPDA Grade A engineers. Features 1,000+ past exam question recalls across Civil, Mechanical, and Electrical disciplines with full MME documentation support.',
        keyBenefits: ['Extensive review of Qatar Construction Specifications (QCS)', 'Project management & discipline question workout', 'Complete guidance on PCC, degree attestation, and portal submission']
      }
    ]
  },
  {
    id: 'oman-engineering',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'Oman Engineering (OSE)',
    name: 'Oman Engineering Registration Requirements (Oman Society of Engineers)',
    conductingBody: 'Oman Society of Engineers (OSE) / Ministry of Labour',
    country: 'Sultanate of Oman',
    examType: 'Professional Engineering Accreditation Pathway',
    overview: 'Professional accreditation and credential equivalency framework required for practicing engineers in the Sultanate of Oman.',
    purpose: 'Ministry of Labour visa approval, OSE certified membership, and commercial engineering project approvals in Oman.',
    pattern: 'Rigorous degree and syllabus audit by the Ministry of Higher Education, Research and Innovation (MOHERI) + technical interview for senior engineering disciplines.',
    eligibility: 'Accredited Bachelor of Engineering degree + attested transcripts + certified work history.',
    syllabusOrSkills: ['Engineering Equivalency Verification', 'Oman Society of Engineers Practice Guidelines', 'National Building Regulations'],
    applicationProcess: 'Apply via OSE portal (ose.org.om) with attested documentation.',
    feesAndDates: 'Accreditation fees per OSE schedule.',
    officialUrl: 'https://www.ose.org.om',
    isProfessionalPathway: true,
    verifiedCourses: [] // Empty state on purpose: prompt states "Never display fake academy listings"
  },
  {
    id: 'bahrain-crpep',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'Bahrain CRPEP',
    name: 'Council for Regulating the Practice of Engineering Professions (CRPEP)',
    conductingBody: 'Council for Regulating the Practice of Engineering Professions (CRPEP), Bahrain',
    country: 'Kingdom of Bahrain',
    examType: 'Statutory Engineering Practice Licensure',
    overview: 'The statutory licensing body governing all engineering offices and professionals practicing engineering in the Kingdom of Bahrain under Law No. 51 of 2014.',
    purpose: 'Issuance of Bahrain Engineering Practice License (Categories A, B, or C) required for engineering employment and signing off drawings.',
    pattern: 'Comprehensive credentials audit followed by written assessment and technical committee interview conducted at CRPEP.',
    eligibility: 'Bachelor’s degree in engineering recognized by CRPEP + verified experience + good character certificate.',
    syllabusOrSkills: ['Bahrain Building Codes', 'Discipline Engineering Standards', 'Professional Ethics & Practice Laws'],
    applicationProcess: 'Submit licensing application via CRPEP portal with attested educational certificates and experience portfolio.',
    feesAndDates: 'Application fees per CRPEP gazette.',
    officialUrl: 'https://www.crpep.bh',
    isProfessionalPathway: true,
    verifiedCourses: [] // Empty state on purpose
  },
  {
    id: 'kuwait-kse',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'Kuwait KSE',
    name: 'Kuwait Society of Engineers (KSE) Accreditation & Equivalency Exam',
    conductingBody: 'Kuwait Society of Engineers (KSE) / Public Authority for Manpower',
    country: 'State of Kuwait',
    examType: 'Statutory Engineering Accreditation & Equivalency',
    overview: 'The mandatory accreditation assessment and university verification process required by KSE to validate an engineer’s degree and issue Kuwait engineering work permits.',
    purpose: 'Issuance of KSE NOC / Membership required to obtain and renew Kuwait engineering residency (Iqama).',
    pattern: 'Written examination and technical interview organized at Kuwait Society of Engineers testing discipline fundamentals and degree authenticity.',
    eligibility: 'Engineering degree from an institution listed in KSE approved database + attested certificates.',
    syllabusOrSkills: ['Engineering Core Competencies', 'Technical Drawings & Calculations', 'Kuwait Safety Guidelines'],
    applicationProcess: 'Register on KSE portal → Upload attested documents → Schedule and clear KSE accreditation exam.',
    feesAndDates: 'Exam and membership fees per KSE schedule.',
    officialUrl: 'https://kse.org.kw',
    isProfessionalPathway: true,
    verifiedCourses: [] // Empty state on purpose
  },
  {
    id: 'intl-engineering-accreditation',
    categoryId: 'gcc-engineering',
    categoryName: 'GCC Engineering & Professional Registration',
    code: 'International Engineering Chartership',
    name: 'Country-Specific Professional Accreditation & Qualification Assessments',
    conductingBody: 'NCEES (USA), Engineering Council (UK), Engineers Australia (EA)',
    country: 'USA, UK, Australia, Global',
    examType: 'Global Engineering Chartership & Licensure',
    overview: 'International professional engineering licensing credentials: NCEES FE & PE exams for US Professional Engineer licensure, CEng (Chartered Engineer) via UK institutions (ICE, IMechE, IET), and Engineers Australia CDR skills assessment.',
    purpose: 'Chartered Engineer (CEng) status, US Professional Engineer (PE) license, and Australian skilled migration points.',
    pattern: 'NCEES: Computer-based testing (FE 5.5 hours, PE 8 hours) at Pearson VUE; UK CEng: Professional Review Interview & portfolio; Australia: Competency Demonstration Report (CDR) stage 1 & 2.',
    eligibility: 'Washington Accord accredited engineering degree or certified experiential equivalent.',
    syllabusOrSkills: ['Advanced Engineering Sciences', 'Design & Safety Principles', 'Contractual & Environmental Governance'],
    applicationProcess: 'Apply via respective board (NCEES, Engineering Council, or Engineers Australia).',
    feesAndDates: 'Fees per international board guidelines.',
    officialUrl: 'https://ncees.org',
    isProfessionalPathway: true,
    verifiedCourses: [
      {
        id: 'crs-ea-cdr-advisory',
        academyName: 'Revival GCC Engineering Advisory Desk',
        courseName: 'Engineers Australia CDR & NCEES FE/PE Advisory Program',
        duration: '6 Weeks (Portfolio Advisory)',
        deliveryMode: 'Online 1-on-1 Mentorship',
        description: 'Comprehensive guidance on writing career episodes, summary statements, and CDR documentation for Australian skilled assessment and NCEES FE exam prep.',
        keyBenefits: ['1-on-1 review of 3 Career Episodes & Summary Statement', 'NCEES FE diagnostic testing practice', 'Accredited chartered engineer mentorship']
      }
    ]
  }
];

// Helper functions
export const COMPETITIVE_EXAM_CATEGORIES = [
  ...INTERNATIONAL_EXAM_CATEGORIES,
  ...INDIAN_EXAM_CATEGORIES
];

export const COMPETITIVE_EXAMS = [
  ...INTERNATIONAL_COMPETITIVE_EXAMS,
  ...INDIAN_COMPETITIVE_EXAMS
];

export const getCategoryById = (categoryId) => {
  return COMPETITIVE_EXAM_CATEGORIES.find(c => c.id === categoryId) || null;
};

export const getExamsByCategory = (categoryId, filterParam = null, searchQuery = '') => {
  let list = COMPETITIVE_EXAMS;
  if (categoryId && categoryId !== 'all') {
    list = list.filter(e => e.categoryId === categoryId);
  }

  // Filter param for sub-categories (like GCC countries or Western countries)
  if (filterParam && filterParam !== 'all') {
    const p = filterParam.toLowerCase();
    list = list.filter(e => {
      const c = (e.country || '').toLowerCase();
      const code = (e.code || '').toLowerCase();
      const body = (e.conductingBody || '').toLowerCase();
      return c.includes(p) || code.includes(p) || body.includes(p);
    });
  }

  // Search query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(e => {
      const name = (e.name || '').toLowerCase();
      const code = (e.code || '').toLowerCase();
      const cat = (e.categoryName || '').toLowerCase();
      const country = (e.country || '').toLowerCase();
      const body = (e.conductingBody || '').toLowerCase();
      const overview = (e.overview || '').toLowerCase();
      const skills = (e.syllabusOrSkills || []).join(' ').toLowerCase();

      return name.includes(q) || code.includes(q) || cat.includes(q) || country.includes(q) || body.includes(q) || overview.includes(q) || skills.includes(q);
    });
  }

  return list;
};

export const getCompetitiveExamById = (examId) => {
  return COMPETITIVE_EXAMS.find(e => e.id === examId) || null;
};

export const getCategoryExamCounts = () => {
  const counts = {};
  COMPETITIVE_EXAM_CATEGORIES.forEach(cat => {
    counts[cat.id] = COMPETITIVE_EXAMS.filter(e => e.categoryId === cat.id).length;
  });
  counts['all'] = COMPETITIVE_EXAMS.length;
  return counts;
};


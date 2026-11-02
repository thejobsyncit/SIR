/**
 * Revival International - Competitive Exam Enquiry & Requirements Data Store
 * Comprehensive verified information for all national and global competitive examinations:
 * UPSC, TNPSC, SSC, Banking (SBI/IBPS/RBI), Railways, Engineering (GATE/JEE), Medical (NEET),
 * Teaching, Defence, Management, Law, Sciences, and Global Admissions.
 */

export const EXAM_DETAILED_INFO = {
  // 1. UPSC CSE
  'exam-upsc-cse': {
    fullName: 'Civil Services Examination (IAS, IPS, IFS, IRS)',
    abbreviation: 'UPSC CSE',
    conductingBody: 'Union Public Service Commission (UPSC)',
    overview: 'The Civil Services Examination is India’s premier national competitive examination conducted annually by the Union Public Service Commission for recruitment to 24 higher central administrative services including the Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and Indian Revenue Service (IRS).',
    purpose: 'Select top-tier administrative leadership, diplomatic corps, law enforcement heads, and revenue officers for the Government of India and State administrative cadress.',
    educationalQualifications: 'Bachelor’s degree in any discipline from a recognized central, state, or deemed university. Candidates in their final year of graduation are eligible to apply for the Preliminary examination.',
    ageLimit: '21 to 32 years as of August 1st of the exam year. Age relaxations: SC/ST candidates: 5 years (up to 37 years, unlimited attempts); OBC candidates: 3 years (up to 35 years, 9 attempts); PwD candidates: 10 years; Ex-Servicemen: up to 5 years.',
    stages: [
      { name: 'Stage 1: Preliminary Examination', type: 'Objective (CBT/OMR)', marks: '400 Marks (GS 200 + CSAT 200)', description: 'Screening test comprising General Studies Paper I (merit ranking) and General Studies Paper II / CSAT (qualifying with 33% threshold).' },
      { name: 'Stage 2: Main Examination', type: 'Written Descriptive', marks: '1750 Marks (9 Papers)', description: 'Seven merit ranking descriptive papers (Essay, GS I, GS II, GS III, GS IV, Optional Paper I & II) plus two qualifying language papers (English & Indian Language).' },
      { name: 'Stage 3: Personality Test / Interview', type: 'Board Interview', marks: '275 Marks', description: 'Comprehensive personal interview assessing leadership, intellectual integrity, balance of judgment, and civil service aptitude before a UPSC board.' }
    ],
    pattern: 'Prelims: 2 Papers of 2 Hours each. Mains: 9 Descriptive Papers over 5 days. Total Merit Aggregate: 2025 Marks.',
    markingScheme: 'Prelims: +2 marks per correct answer in GS I with 0.66 marks negative penalty (1/3rd). CSAT: +2.5 marks per question with 0.83 penalty. Mains has no negative marking but demands strict adherence to word limits.',
    syllabusTopics: [
      'General Studies I: Indian Heritage and Culture, World History and Geography, and Indian Society.',
      'General Studies II: Governance, Constitution, Polity, Social Justice, and International Relations.',
      'General Studies III: Technology, Economic Development, Biodiversity, Environment, Security, and Disaster Management.',
      'General Studies IV: Ethics, Integrity, and Aptitude (Case Studies).',
      'CSAT: Comprehension, Interpersonal Skills, Logical Reasoning, Analytical Ability, Decision Making, Basic Numeracy.'
    ],
    applicationProcess: [
      'Complete One Time Registration (OTR) on the official UPSC portal (upsconline.nic.in).',
      'Log in with OTR credentials and select the active Civil Services Examination notification.',
      'Fill Part-I registration: Personal data, educational qualifications, address, and exam center preference.',
      'Upload scanned photograph and signature in JPG/JPEG format according to official pixel guidelines.',
      'Pay application fee (₹100 for General/OBC male; Exempt for Women, SC, ST, and PwD candidates).',
      'Download and securely store the Part-II confirmation slip and registration number.'
    ],
    requiredDocuments: [
      'Scanned recent color photograph (350x350 to 1000x1000 pixels, JPG format, 20-300 KB)',
      'Scanned signature on white paper with black ink (20-300 KB)',
      'Government Photo Identity Proof (Aadhaar Card, Passport, PAN Card, Voter ID, or Driving License)',
      'Class 10 Matriculation Certificate (for Date of Birth verification)',
      'Graduation Degree Certificate or provisional passing certificate',
      'Category / Caste Certificate (SC, ST, OBC-NCL, EWS) and Disability Certificate where applicable'
    ],
    officialWebsite: 'https://upsc.gov.in',
    notificationLink: 'https://upsconline.nic.in',
    importantDates: {
      notificationRelease: 'February 2027',
      applicationDeadline: 'March 2027',
      admitCard: 'May 2027',
      prelimsExam: 'May 2027',
      mainsExam: 'September 2027',
      finalResults: 'April 2028'
    },
    preparationGuidance: 'Begin with standard NCERT textbooks (Classes 6-12) for foundational conceptual clarity across History, Polity, Geography, and Economics. Read a national daily (The Hindu or Indian Express) for daily current affairs analysis. Solve at least 35-50 full-length Prelims mock tests and practice daily answer writing for Mains with peer and mentor feedback.',
    recommendedCoachingMode: 'Hybrid (Interactive Online Live + Classroom Doubts)',
    supportOptions: ['All-India Mock Test Series', 'Answer Writing Evaluation', 'Current Affairs Compendiums', '1-on-1 Interview Mentorship', 'Doubt Clearing Support']
  },

  // 2. TNPSC Group 1 & 2
  'exam-tnpsc-grp1': {
    fullName: 'Tamil Nadu Public Service Commission Combined Civil Services Examination',
    abbreviation: 'TNPSC Group 1 & 2',
    conductingBody: 'Tamil Nadu Public Service Commission (TNPSC)',
    overview: 'TNPSC Combined Civil Services Examination is the state-level administrative recruitment test conducted for premier executive appointments within Tamil Nadu state departments, including Deputy Collector, Deputy Superintendent of Police (DSP), Commercial Tax Officer, and Assistant Director of Rural Development.',
    purpose: 'Select senior executive, law enforcement, and revenue administration officers across districts in Tamil Nadu.',
    educationalQualifications: 'Bachelor’s degree in any discipline from a recognized university. Mandatory working proficiency in Tamil language (read, write, speak). Special qualifications required for select technical posts.',
    ageLimit: '21 to 39 years for general candidates (extended to 44 years for SC, SC(A), ST, MBC, and BC categories). Higher concessions for destitute widows and ex-servicemen.',
    stages: [
      { name: 'Stage 1: Preliminary Examination', type: 'Objective (OMR/CBT)', marks: '300 Marks (200 Questions)', description: 'General Studies (175 Questions) + Aptitude and Mental Ability (25 Questions SSLC Standard).' },
      { name: 'Stage 2: Main Written Examination', type: 'Descriptive (4 Papers)', marks: '850 Marks', description: 'Paper I: Tamil Eligibility Test (Qualifying, 100 Marks); Paper II, III, IV: General Studies (250 Marks each).' },
      { name: 'Stage 3: Oral Test / Interview', type: 'Interview', marks: '100 Marks', description: 'Personal viva voce assessing administrative capability, local governance understanding, and socio-economic vision.' }
    ],
    pattern: 'Prelims: 3 Hours (200 Questions, 300 Marks). Mains: 4 Descriptive Papers of 3 Hours each. Total Selection Base: 850 Marks.',
    markingScheme: 'Prelims: 1.5 marks per question. No negative marking in TNPSC Prelims. Mains requires structured analytical Tamil/English answers.',
    syllabusTopics: [
      'Unit 8: History, Culture, Heritage and Socio-Political Movements in Tamil Nadu (Thirukkural, Dravidian Movement).',
      'Unit 9: Development Administration in Tamil Nadu (Human Development Indicators, Social Justice).',
      'General Studies: Indian Polity, Indian National Movement, Current Affairs, Indian Economy.',
      'Aptitude: Simplification, Percentage, HCF & LCM, Ratio & Proportion, Simple & Compound Interest, Logical Reasoning.'
    ],
    applicationProcess: [
      'Register for One Time Registration (OTR) on tnpscexams.in with Aadhaar linking.',
      'Select active Group 1 or Group 2 notification under Apply Online.',
      'Verify demographic details and enter graduation marks.',
      'Upload photograph and signature according to TNPSC specifications.',
      'Pay examination fee (₹100 for Prelims, ₹200 for Mains; fee exemptions for reserved categories).',
      'Generate and save application printout.'
    ],
    requiredDocuments: [
      'Recent color passport photograph (white background)',
      'Digital signature',
      'Community Certificate (BC, BCM, MBC/DC, SC, ST)',
      'SSLC Marksheet for Date of Birth verification',
      'HSC / Diploma Marksheet',
      'Undergraduate Degree Certificate / Provisional Certificate',
      'PSTM Certificate (Persons Studied in Tamil Medium) if claiming reservation'
    ],
    officialWebsite: 'https://tnpsc.gov.in',
    notificationLink: 'https://www.tnpscexams.in',
    importantDates: {
      notificationRelease: 'March 2027',
      applicationDeadline: 'April 2027',
      prelimsExam: 'July 2027',
      mainsExam: 'November 2027',
      finalResults: 'March 2028'
    },
    preparationGuidance: 'Master the Samacheer Kalvi school textbooks (Classes 6-12), with deep focus on Unit 8 (Tamil Heritage & Thirukkural) and Unit 9 (TN Development Administration). Practice state-specific socio-economic data and government welfare schemes.',
    recommendedCoachingMode: 'Classroom / Online Live (Bilingual Tamil & English)',
    supportOptions: ['Samacheer Kalvi Unit-wise Tests', 'Thirukkural Special Modules', 'Mains Answer Evaluation', 'PSTM Reservation Guidance', 'Mock Interviews']
  },

  // 3. SSC CGL
  'exam-ssc-cgl': {
    fullName: 'Combined Graduate Level Examination',
    abbreviation: 'SSC CGL',
    conductingBody: 'Staff Selection Commission (SSC)',
    overview: 'SSC CGL is India’s flagship national examination for recruiting officers to Group ‘B’ Gazetted and Non-Gazetted posts and Group ‘C’ personnel across diverse Union ministries, central departments, and subordinate intelligence agencies (such as CBI, IB, Central Excise, and ED).',
    purpose: 'Recruit Assistant Section Officers (ASO), Income Tax Inspectors, Central Excise Inspectors, Preventive Officers, Enforcement Officers, and Auditors.',
    educationalQualifications: 'Bachelor’s degree in any discipline from a recognized university. Special qualification (Maths/Statistics/Economics) required for Junior Statistical Officer (JSO).',
    ageLimit: '18 to 32 years depending on specific post. Category relaxations: OBC: 3 years; SC/ST: 5 years; PwD: 10 years; ESM: 3 years after deduction of military service.',
    stages: [
      { name: 'Tier 1: Computer Based Examination', type: 'Objective CBT', marks: '200 Marks (100 Questions)', description: 'Qualifying screening exam covering General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, and English.' },
      { name: 'Tier 2: Computer Based Examination', type: 'Objective CBT + DEST', marks: '390 Marks + Qualifying Modules', description: 'Session 1: Mathematical Abilities & Reasoning (180 Marks), English & General Awareness (210 Marks). Session 2: Computer Knowledge & Data Entry Speed Test.' }
    ],
    pattern: 'Tier 1: 60 Minutes (100 MCQs, 200 Marks). Tier 2: 2 Hours 15 Minutes for core subjects + 15 Minutes Computer Module + 15 Minutes Typing Speed Test.',
    markingScheme: 'Tier 1: +2 for correct, -0.50 negative marking. Tier 2: +3 for correct, -1.00 negative penalty per incorrect answer.',
    syllabusTopics: [
      'Mathematical Abilities: Number Systems, Arithmetic (Percentage, Profit & Loss, Ratio, Time & Work), Algebra, Geometry, Mensuration, Trigonometry, Statistics & Probability.',
      'Reasoning & General Intelligence: Semantic Analogy, Symbolic Operations, Number Series, Critical Thinking, Blood Relations.',
      'English Language & Comprehension: Spot the Error, Synonyms, Antonyms, Idioms, One-word Substitution, Cloze Test, Reading Comprehension.',
      'General Awareness: History, Geography, Polity, Scientific Research, Current National & International Events.'
    ],
    applicationProcess: [
      'Register on the official SSC portal (ssc.gov.in) with Aadhaar and educational details.',
      'Capture real-time live webcam photograph with plain background.',
      'Upload digital signature adhering to 10-20 KB specifications.',
      'Select examination center preferences within preferred region.',
      'Pay application fee of ₹100 online (Exempt for Women, SC, ST, ESM, and PwD).',
      'Submit and print the application summary.'
    ],
    requiredDocuments: [
      'Live photograph captured via SSC portal web camera application',
      'Scanned signature (10-20 KB in JPG format)',
      'Class 10 Certificate for date of birth',
      'Graduation Degree Certificate / Provisional Marks Statement',
      'Category Certificate (EWS, OBC-NCL, SC, ST) in Central Government format',
      'Valid Photo Identity Card'
    ],
    officialWebsite: 'https://ssc.gov.in',
    notificationLink: 'https://ssc.gov.in/candidate-portal',
    importantDates: {
      notificationRelease: 'June 2026',
      applicationDeadline: 'July 2026',
      tier1Exam: 'September - October 2026',
      tier2Exam: 'December 2026 - January 2027',
      finalResults: 'March 2027'
    },
    preparationGuidance: 'High-speed quantitative calculation techniques and arithmetic mastery are decisive. Daily practice on English vocabulary, grammar rules, and reading comprehension. Practice at least 20 computer-adaptive typing tests to clear the mandatory DEST speed requirement (27 WPM).',
    recommendedCoachingMode: 'Online Live & Classroom Speed Drills',
    supportOptions: ['Speed Math & Calculation Workshops', 'Topic-wise Tier 1 & 2 CBT Simulations', 'Daily Current Affairs Quizzes', 'Typing Test Software Access', 'Doubt Clearing Sessions']
  },

  // 4. Banking (SBI PO & IBPS PO)
  'exam-sbi-po': {
    fullName: 'State Bank of India Probationary Officer Examination',
    abbreviation: 'SBI PO',
    conductingBody: 'State Bank of India Central Recruitment & Promotion Department',
    overview: 'The SBI PO examination is considered the most prestigious and challenging banking recruitment test in India, selecting high-potential probationary officers for managerial careers at State Bank of India across global and domestic operations.',
    purpose: 'Select management trainees who undergo rigorous 2-year probation before confirmed appointment as Assistant Managers in SBI.',
    educationalQualifications: 'Graduation in any discipline from a recognized university. Candidates in their final year/semester can also apply provisionally.',
    ageLimit: '21 to 30 years. Age relaxations: SC/ST: 5 years; OBC (Non-Creamy Layer): 3 years; PwD candidates: 10 to 15 years.',
    stages: [
      { name: 'Phase 1: Preliminary Examination', type: 'Objective CBT', marks: '100 Marks (100 Questions)', description: 'English (30 Qs), Quantitative Aptitude (35 Qs), Reasoning Ability (35 Qs) with sectional 20-minute timers.' },
      { name: 'Phase 2: Main Examination & Descriptive', type: 'Objective CBT + Descriptive', marks: '250 Marks', description: 'Objective Test (200 Marks, 3 Hours) covering Data Analysis, Reasoning, Economy/Banking, and English. Descriptive Test (50 Marks, 30 Mins): Essay & Letter Writing.' },
      { name: 'Phase 3: Psychometric Test & Interview', type: 'GE & Personal Interview', marks: '50 Marks', description: 'Psychometric test profiling, Group Discussion / Group Exercise (20 Marks), and Personal Interview (30 Marks).' }
    ],
    pattern: 'Prelims: 60 Minutes (Sectional timing 20 min/section). Mains: 3 Hours Objective + 30 Minutes Descriptive. Total Merit Score scaled to 100.',
    markingScheme: 'Negative marking of 0.25 (1/4th) mark for each incorrect response in both Prelims and Mains objective sections.',
    syllabusTopics: [
      'Data Analysis & Interpretation: Tabular Charts, Bar Graphs, Pie Charts, Radar Graphs, Caselets, Missing Data DI, Probability & Permutations.',
      'Reasoning & Computer Aptitude: Puzzles, Seating Arrangements (Circular, Linear, Floor, Matrix), Syllogism, Input-Output, Blood Relations, Coding-Decoding.',
      'General / Economy / Banking Awareness: Current Affairs, RBI Monetary Policy, Financial Regulatory Directives, Banking Terminology, Budget Highlights.',
      'English Language: Reading Comprehension, Error Spotting, Sentence Rearrangement, Vocabulary, Formal Essay & Letter Writing.'
    ],
    applicationProcess: [
      'Visit sbi.co.in/careers and access the current opening for Recruitment of Probationary Officers.',
      'Complete online registration with mobile number and email ID.',
      'Upload passport size photograph, signature, left thumb impression, and hand-written declaration.',
      'Fill educational history and category preferences.',
      'Pay application fee (₹750 for General/EWS/OBC; Exempt for SC/ST/PwD).',
      'Download and retain e-receipt and application printout.'
    ],
    requiredDocuments: [
      'Scanned photograph (4.5cm × 3.5cm, 20-50 KB)',
      'Scanned signature with black ink (10-20 KB)',
      'Left thumb impression on white paper with blue/black ink (20-50 KB)',
      'Hand-written declaration text as per official SBI notification format (50-100 KB)',
      'Graduation certificate and marksheets',
      'Category / Caste certificate if applicable'
    ],
    officialWebsite: 'https://sbi.co.in/careers',
    notificationLink: 'https://bank.sbi/careers',
    importantDates: {
      notificationRelease: 'September 2026',
      applicationDeadline: 'October 2026',
      prelimsExam: 'November 2026',
      mainsExam: 'December 2026 / January 2027',
      interviewCycle: 'February 2027',
      finalResults: 'March 2027'
    },
    preparationGuidance: 'High-level puzzle solving and multi-variable seating arrangements are critical for reasoning. Focus heavily on data interpretation and mathematical calculation speed. Build continuous daily reading habits for the descriptive paper.',
    recommendedCoachingMode: 'Online Live & Adaptive CBT Drills',
    supportOptions: ['Computer-Adaptive Banking Test Engine', 'Descriptive Essay Evaluator', 'Banking Awareness Capsules', 'Group Discussion Simulation', 'Mock Interview Panel']
  },

  // 5. Engineering: GATE
  'exam-gate': {
    fullName: 'Graduate Aptitude Test in Engineering',
    abbreviation: 'GATE',
    conductingBody: 'Indian Institutes of Technology (IITs) & Indian Institute of Science (IISc)',
    overview: 'GATE is India’s premier national comprehensive examination evaluating undergraduate engineering knowledge for postgraduate admissions (M.Tech, M.S., Ph.D.) at IITs, IISc, NITs, and direct high-cadre executive recruitment in leading Public Sector Undertakings (PSUs) like ONGC, IOCL, BHEL, NTPC, and HPCL.',
    purpose: 'Postgraduate engineering admissions with MHRD stipend and recruitment to Group ‘A’ engineer executive roles in central PSUs.',
    educationalQualifications: 'Currently studying in 3rd or final year of undergraduate degree program in Engineering / Technology / Architecture / Science / Humanities or completed degree.',
    ageLimit: 'No age limit exists for appearing in GATE. Candidates of any age can take the exam.',
    stages: [
      { name: 'Single-Stage Computer Based Test (CBT)', type: 'Online CBT', marks: '100 Marks (65 Questions)', description: '3-Hour examination consisting of Multiple Choice Questions (MCQ), Multiple Select Questions (MSQ), and Numerical Answer Type (NAT) questions.' }
    ],
    pattern: '3 Hours (180 Minutes). 65 Questions: 10 Questions in General Aptitude (15 Marks) + 55 Questions in Core Engineering Discipline & Engineering Mathematics (85 Marks).',
    markingScheme: '1-mark questions: 1/3 negative mark for incorrect MCQ. 2-mark questions: 2/3 negative mark for incorrect MCQ. Zero negative marks for NAT and MSQ questions.',
    syllabusTopics: [
      'Engineering Mathematics: Linear Algebra, Calculus, Differential Equations, Complex Variables, Probability and Statistics, Numerical Methods.',
      'General Aptitude: Verbal Ability (English Grammar, Vocabulary) and Numerical Ability (Data Interpretation, Numerical Computation).',
      'Discipline-Specific Core: Core subjects across 30 disciplines including Computer Science, Mechanical, Civil, Electrical, Electronics, Chemical, Biotechnology, Data Science & AI.'
    ],
    applicationProcess: [
      'Access the GATE Online Application Processing System (GOAPS) on the official IIT organizing institute portal.',
      'Register with email address and password to generate Enrollment ID.',
      'Select paper discipline and choose three exam cities in the same GATE zone.',
      'Upload photograph, signature, and eligibility certificate / college ID proof.',
      'Pay application fee (₹900 for Female/SC/ST/PwD; ₹1800 for All Other Candidates).',
      'Download and print the completed application form.'
    ],
    requiredDocuments: [
      'Passport size photograph conforming to official specifications (5-200 KB)',
      'Scanned signature in black or blue ink (5-200 KB)',
      'Degree Certificate / Provisional Certificate / Course Completion Certificate from Head of Dept',
      'Valid Photo ID Proof (Passport, Aadhaar Card, College ID, Driving License)',
      'Category Certificate (SC/ST/OBC-NCL/EWS) and PwD Certificate if applicable'
    ],
    officialWebsite: 'https://gate2026.iit.ac.in',
    notificationLink: 'https://gate.iitk.ac.in',
    importantDates: {
      notificationRelease: 'August 2026',
      applicationDeadline: 'October 2026',
      admitCard: 'January 2027',
      examinationDates: 'February 2027 (Weekends)',
      resultDeclaration: 'March 2027',
      scorecardValidity: '3 Years from Date of Results'
    },
    preparationGuidance: 'Master core fundamental derivations, theoretical concepts, and mathematical problem solving. Solve previous 20 years’ GATE question papers multiple times. Practice using the official virtual scientific calculator to maximize calculation speed.',
    recommendedCoachingMode: 'Classroom & Online Live Advanced Problem Solving',
    supportOptions: ['Subject-wise Practice Question Banks', 'Full-Length Virtual CBT Simulations', 'Virtual Calculator Practice Sessions', 'IIT M.Tech & PSU Cutoff Counseling', 'Faculty Doubt Resolution']
  },

  // 6. Engineering: JEE Main & Advanced
  'exam-jee-main-adv': {
    fullName: 'Joint Entrance Examination (Main & Advanced)',
    abbreviation: 'JEE Main & Advanced',
    conductingBody: 'National Testing Agency (NTA for Main) & IITs (for Advanced)',
    overview: 'The Joint Entrance Examination is the premier nationwide engineering entrance framework in India. JEE Main serves as the admission test for NITs, IIITs, and CFTIs and the qualifying gateway for JEE Advanced, which determines admission to the 23 Indian Institutes of Technology (IITs).',
    purpose: 'Admissions to prestigious undergraduate engineering (B.Tech / B.E.), Architecture (B.Arch), and Planning programs across IITs, NITs, and IIITs.',
    educationalQualifications: 'Passed Class 12 / equivalent examination with Physics, Mathematics, and one of Chemistry/Biology/Biotechnology/Technical Vocational subject. Top 20 percentile or minimum 75% aggregate marks in 12th Board for IIT/NIT admission.',
    ageLimit: 'No upper age limit for JEE Main. For JEE Advanced, candidates must be born on or after October 1, 2001 (5 years relaxation for SC/ST/PwD). Maximum 2 attempts in consecutive years for Advanced.',
    stages: [
      { name: 'Stage 1: JEE Main', type: 'Computer Based Test (CBT)', marks: '300 Marks (75 Questions to attempt)', description: 'Section A (60 MCQs) + Section B (Numerical Value Questions in Physics, Chemistry, Mathematics). Held in two sessions.' },
      { name: 'Stage 2: JEE Advanced', type: 'Computer Based Test (CBT)', marks: 'Variable (~360 Marks in 2 Papers)', description: 'Two mandatory 3-hour papers testing multi-concept analytical problem solving, matching lists, and comprehensive numerical calculations.' }
    ],
    pattern: 'JEE Main: 3 Hours, 75 Questions (300 Marks). JEE Advanced: Paper 1 (3 Hours) and Paper 2 (3 Hours) on the same day.',
    markingScheme: 'JEE Main: +4 marks for correct answer, -1 mark penalty for incorrect answer in both MCQs and Numerical Value questions. JEE Advanced features partial marking and complex negative marking.',
    syllabusTopics: [
      'Physics: Mechanics, Waves & Oscillations, Thermodynamics, Electrodynamics, Optics, Modern Physics, Semiconductor Devices.',
      'Chemistry: Physical Chemistry (Equilibrium, Kinetics, Thermodynamics), Inorganic Chemistry (Coordination Compounds, Chemical Bonding, p/d-block), Organic Chemistry (Mechanisms, Named Reactions).',
      'Mathematics: Coordinate Geometry, Differential & Integral Calculus, Vectors & 3D Geometry, Algebra (Complex Numbers, Matrices, Permutations), Trigonometry.'
    ],
    applicationProcess: [
      'Register online at jeemain.nta.nic.in with personal credentials and Aadhaar.',
      'Fill academic details and select exam paper (Paper 1 B.E./B.Tech, Paper 2A B.Arch, Paper 2B B.Planning).',
      'Select preferred exam cities.',
      'Upload scanned passport photograph and signature.',
      'Pay examination fee online.',
      'Top 2,50,000 qualifying candidates from JEE Main register for JEE Advanced at jeeadv.ac.in.'
    ],
    requiredDocuments: [
      'Scanned passport photograph (10-200 KB in JPG format)',
      'Scanned signature (4-30 KB in JPG format)',
      'Class 10 Marksheet / Passing Certificate',
      'Class 12 Marksheet or Admit Card if appearing',
      'Category Certificate (EWS, OBC-NCL, SC, ST) and PwD Certificate if applicable'
    ],
    officialWebsite: 'https://jeemain.nta.nic.in',
    notificationLink: 'https://jeeadv.ac.in',
    importantDates: {
      session1Registration: 'November 2026',
      session1Exam: 'January 2027',
      session2Exam: 'April 2027',
      jeeAdvancedExam: 'May 2027',
      josaaCounseling: 'June 2027'
    },
    preparationGuidance: 'Strong conceptual depth from standard textbooks (HC Verma, Irodov for Physics; OP Tandon/MS Chouhan for Chemistry; Cengage/Arihant for Math). Daily timed numerical problem practice and regular full-length 6-hour test simulations.',
    recommendedCoachingMode: 'Classroom & Intensive Problem-Solving Cohorts',
    supportOptions: ['Chapter-wise DPPs (Daily Practice Problems)', 'Full-Length Computer-Adaptive Mocks', 'Detailed Solution Video Library', 'JoSAA & CSAB College Counseling Support', '1-on-1 Faculty Doubt Clearing']
  },

  // 7. Medical: NEET UG
  'exam-neet-ug': {
    fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
    abbreviation: 'NEET UG',
    conductingBody: 'National Testing Agency (NTA)',
    overview: 'NEET UG is India’s sole nationwide unified medical entrance examination for admission to undergraduate medical programs (MBBS), dental surgery (BDS), AYUSH (BAMS, BHMS, BUMS), and veterinary sciences across all medical institutions, including AIIMS and JIPMER.',
    purpose: 'Select qualifying candidates for 1,08,000+ MBBS seats and medical healthcare professions across India.',
    educationalQualifications: 'Passed 10+2 with Physics, Chemistry, Biology/Biotechnology, and English as core subjects. Minimum 50% marks in PCB for General; 40% for SC/ST/OBC; 45% for PwD.',
    ageLimit: 'Minimum 17 years completed on or before 31st December of the admission year. There is NO upper age limit for taking NEET UG.',
    stages: [
      { name: 'Single Pen & Paper (OMR) Examination', type: 'Offline OMR Examination', marks: '720 Marks (180 Questions to attempt)', description: '3 Hours and 20 Minutes test covering Physics (45 Qs), Chemistry (45 Qs), and Biology/Botany & Zoology (90 Qs).' }
    ],
    pattern: 'Pen-and-paper OMR test. 200 Questions total (180 to attempt across Section A and Section B). Total 720 Marks.',
    markingScheme: '+4 marks for each correct response, -1 mark penalty for each incorrect response. Unattempted questions receive zero marks.',
    syllabusTopics: [
      'Biology: Human Physiology, Genetics and Evolution, Cell Structure and Function, Ecology and Environment, Diversity in Living World, Biotechnology.',
      'Physics: Mechanics, Thermodynamics, Work Energy & Power, Electrostatics, Magnetism, Optics, Modern Physics, Atoms and Nuclei.',
      'Chemistry: Chemical Bonding, Thermodynamics, Equilibrium, Solutions, Organic Reactions and Mechanisms, Coordination Chemistry, Biomolecules.'
    ],
    applicationProcess: [
      'Access neet.nta.nic.in and click New Candidate Registration.',
      'Enter Aadhaar / Passport details and fill academic history.',
      'Choose preferred question paper language (available in 13 languages including English, Hindi, Tamil, Telugu, etc.).',
      'Upload passport photo, postcard size photo, signature, and left/right-hand fingers and thumb impression.',
      'Pay registration fee online (₹1700 General; ₹1600 EWS/OBC; ₹1000 SC/ST/PwD).',
      'Download and print the Confirmation Page.'
    ],
    requiredDocuments: [
      'Recent passport size color photograph with white background (10-200 KB)',
      'Postcard size (4"x6") photograph (10-200 KB)',
      'Digital signature (4-30 KB)',
      'Left and right-hand fingers and thumb impressions (10-200 KB)',
      'Class 10 Certificate & Class 12 Marksheet',
      'Category Certificate and PwD Certificate where applicable'
    ],
    officialWebsite: 'https://neet.nta.nic.in',
    notificationLink: 'https://nta.ac.in',
    importantDates: {
      notificationRelease: 'February 2027',
      applicationDeadline: 'March 2027',
      admitCard: 'April 2027',
      examinationDate: 'First Sunday of May 2027',
      resultDeclaration: 'June 2027',
      mccCounseling: 'July - August 2027'
    },
    preparationGuidance: 'Thorough, line-by-line mastery of NCERT Biology textbooks (Class 11 & 12) is non-negotiable. Maintain high accuracy in Physics formula applications and Chemistry organic mechanisms through repetitive OMR test practice.',
    recommendedCoachingMode: 'Classroom & Intensive Test Series',
    supportOptions: ['OMR Test Series with Error Analysis', 'NCERT Word-by-Word Test Modules', 'Physics Numerical Speed Drills', 'All-India MCC & State Quota Counseling Support', 'Doubt Resolution Desks']
  },

  // 8. Railway: RRB NTPC
  'exam-rrb-ntpc': {
    fullName: 'Non-Technical Popular Categories Examination',
    abbreviation: 'RRB NTPC',
    conductingBody: 'Railway Recruitment Boards (Ministry of Railways)',
    overview: 'RRB NTPC is one of India’s largest recruitment drives conducted by the Ministry of Railways to select personnel for prestigious non-technical positions across Indian Railways zones, including Station Master, Goods Guard, Commercial Apprentice, and Traffic Assistant.',
    purpose: 'Select operational, traffic, commercial, and clerical staff across 21 Railway Recruitment Boards nationwide.',
    educationalQualifications: 'Undergraduate Level Posts: 12th Class pass from recognized Board. Graduate Level Posts: Bachelor’s degree from a recognized university.',
    ageLimit: '18 to 33 years for 12th level; 18 to 36 years for Graduate level. Category relaxations: OBC: 3 years; SC/ST: 5 years; PwD: 10 years; Ex-Servicemen: up to 8 years.',
    stages: [
      { name: '1st Stage CBT (Screening)', type: 'Online CBT', marks: '100 Marks (100 Questions)', description: 'General Awareness (40 Qs), Mathematics (30 Qs), General Intelligence & Reasoning (30 Qs) in 90 Minutes.' },
      { name: '2nd Stage CBT (Selection)', type: 'Online CBT', marks: '120 Marks (120 Questions)', description: 'Level-specific CBT with General Awareness (50 Qs), Mathematics (35 Qs), Reasoning (35 Qs) in 90 Minutes.' },
      { name: 'Computer Based Aptitude Test (CBAT) / Typing Test', type: 'Skill Test', marks: 'Qualifying', description: 'CBAT for Station Master & Traffic Assistant; Typing Skill Test (30 WPM English / 25 WPM Hindi) for Junior Clerk & Typist posts.' },
      { name: 'Document Verification & Medical Exam', type: 'Verification', marks: 'Qualifying', description: 'Stringent railway medical fitness examination (A-2, A-3, B-2 standards).' }
    ],
    pattern: 'CBT 1: 90 Minutes, 100 Questions. CBT 2: 90 Minutes, 120 Questions. Negative marking applicable.',
    markingScheme: '+1 mark per correct answer; 1/3rd (0.33) marks deducted for every incorrect response.',
    syllabusTopics: [
      'Mathematics: Number System, Decimals, Fractions, LCM & HCF, Ratio & Proportion, Percentages, Mensuration, Time and Work, Simple & Compound Interest, Profit and Loss, Elementary Algebra, Geometry and Trigonometry.',
      'General Intelligence and Reasoning: Analogies, Completion of Number and Alphabetical Series, Coding and Decoding, Mathematical Operations, Blood Relations, Syllogism, Jumbling, Venn Diagrams, Puzzle, Data Sufficiency.',
      'General Awareness: Current Events, Games and Sports, Art and Culture of India, Indian Literature, Monuments and Places of India, General Science (up to 10th CBSE), History of India and Freedom Struggle, Indian Polity and Governance.'
    ],
    applicationProcess: [
      'Visit your regional RRB portal (e.g. rrbchennai.gov.in, rrbcdg.gov.in) and select CEN Notification.',
      'Create account with Aadhaar, mobile number, and email ID.',
      'Fill educational details and rank your preferred railway zones and posts.',
      'Upload digital photograph and signature conforming to RRB norms.',
      'Pay application fee (₹500 for General/OBC with ₹400 refund on appearing in CBT 1; ₹250 for SC/ST/Women/ESM with full refund).',
      'Submit application and save registration number.'
    ],
    requiredDocuments: [
      'Color passport photograph (35mm x 45mm, 30-70 KB)',
      'Scanned signature in running hand (30-70 KB)',
      'SC/ST Certificate for free railway sleeper travel pass',
      'Class 10 Certificate for date of birth',
      'Class 12 / Degree Certificate',
      'Valid Government Photo ID'
    ],
    officialWebsite: 'https://rrbcdg.gov.in',
    notificationLink: 'https://indianrailways.gov.in',
    importantDates: {
      notificationRelease: 'September 2026',
      applicationDeadline: 'October 2026',
      cbt1Exam: 'December 2026 - January 2027',
      cbt2Exam: 'March 2027',
      skillTest: 'May 2027',
      finalResults: 'July 2027'
    },
    preparationGuidance: 'Focus extensively on General Awareness (history, geography, railway facts, science) and high-speed mental arithmetic. Master reasoning puzzles and take timed 90-minute full mock tests to build rapid response times.',
    recommendedCoachingMode: 'Classroom & Online Live Speed Practice',
    supportOptions: ['Topic-wise CBT Simulations', 'Railway Special GK Capsules', 'Typing Test Speed Drills', 'Psychometric CBAT Preparation', 'Medical Standards Guidance']
  }
};

/**
 * Helper to retrieve rich verified exam details with safe defaults
 */
export const getExamEnquiryDetails = (examId, basicExam = null) => {
  if (EXAM_DETAILED_INFO[examId]) {
    return {
      ...basicExam,
      ...EXAM_DETAILED_INFO[examId]
    };
  }

  // Fallback dynamic generator using basicExam data
  if (basicExam) {
    return {
      fullName: basicExam.name,
      abbreviation: basicExam.code,
      conductingBody: basicExam.conductingBody,
      overview: basicExam.shortDesc || `Comprehensive national competitive examination for admissions and prestigious career appointments.`,
      purpose: `Assess candidate merit and subject mastery for competitive admissions and administrative / technical placements.`,
      educationalQualifications: basicExam.eligibility || 'Graduation / Relevant qualification from a recognized institution.',
      ageLimit: 'As per official conducting commission guidelines with applicable category relaxations (SC/ST/OBC/PwD).',
      stages: [
        { name: 'Stage 1: Preliminary / Screening Examination', type: 'Objective / CBT', marks: 'Screening', description: 'Objective assessment covering core aptitudes, foundational subjects, and analytical reasoning.' },
        { name: 'Stage 2: Main / Advanced Examination', type: 'Core Examination', marks: 'Merit Assessment', description: 'In-depth subject-specific written evaluation assessing comprehensive domain knowledge.' }
      ],
      pattern: basicExam.pattern || 'Computer Based Test / Written Descriptive Assessment as mandated by commission guidelines.',
      markingScheme: 'Standard competitive marking scheme with negative penalty for incorrect objective responses.',
      syllabusTopics: basicExam.popularSubjects || ['General Studies', 'Domain Core Subjects', 'Quantitative Aptitude', 'Analytical Reasoning'],
      applicationProcess: [
        `Visit the official website (${basicExam.conductingBody}).`,
        'Register with a valid email address and mobile number.',
        'Fill academic qualifications, personal details, and examination center choices.',
        'Upload required photographs, signatures, and certificates according to specified guidelines.',
        'Pay the prescribed examination fee and download the confirmation slip.'
      ],
      requiredDocuments: [
        'Recent color passport photograph with white background',
        'Scanned digital signature',
        'Government-issued Photo ID card (Aadhaar, Passport, Voter ID)',
        'Class 10 and 12 certificates / Degree Marksheets',
        'Category / Reservation Certificate if applicable'
      ],
      officialWebsite: 'https://www.revivalinternational.com',
      notificationLink: 'https://www.revivalinternational.com',
      importantDates: {
        notificationRelease: 'Annual Cycle',
        applicationDeadline: 'Refer to Official Gazette',
        examinationDates: basicExam.nextCycle || 'Upcoming Cycle'
      },
      preparationGuidance: `Focus on fundamental concepts, solve past year papers, and take full-length mock tests for ${basicExam.code}.`,
      recommendedCoachingMode: 'Online Live & Hybrid Mentorship',
      supportOptions: ['Mock Test Series', 'Study Material & Revision Modules', '1-on-1 Academic Advisory', 'Doubt Clearing Sessions']
    };
  }

  return null;
};

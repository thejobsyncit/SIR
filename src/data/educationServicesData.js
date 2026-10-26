/**
 * Revival International — Academic & Education Advisory
 * Master Detailed Service Specifications
 * Single source of truth for the 6 verified Education Services.
 */

export const EDUCATION_SERVICES_DETAILED = [
  {
    id: 'intl-consult',
    slug: 'international-consulting',
    title: 'International Consulting',
    category: 'Consulting',
    badge: 'Global Pathways',
    tagline: 'Strategic Global Education Advisory & Destination Planning',
    shortDescription: 'Professional guidance and strategic counseling for students planning international education pathways across top global destinations.',
    heroDescription: 'Navigate the complexities of overseas education with tailored roadmap consulting. From evaluating academic credentials and choosing the ideal study destination to analyzing cost structures and long-term residency pathways, our senior advisors support your entire journey.',
    targetAudience: 'Students, graduates, and working professionals planning undergraduate, postgraduate, or specialized education in the UK, USA, Canada, Europe, Australia, and the GCC.',
    keyStats: [
      { label: 'Destinations', value: '18+ Countries' },
      { label: 'Advisory Level', value: 'UG & PG Tracks' },
      { label: 'Counselling Model', value: '1-on-1 Personalized' },
      { label: 'Intake Support', value: 'Fall, Spring & Summer' }
    ],
    keyBenefits: [
      {
        title: 'Country & Destination Comparison',
        desc: 'Unbiased evaluation of tuition costs, post-study work rights (PSW), cost of living, and permanent settlement prospects across the UK, USA, Canada, Australia, and Europe.'
      },
      {
        title: 'Profile & Credential Assessment',
        desc: 'Comprehensive review of your GPA, standardized test scores, extracurriculars, and career objectives to determine university eligibility brackets.'
      },
      {
        title: 'Budget & Financial Planning',
        desc: 'Detailed forecasting of tuition, living expenses, proof of funds requirements, and institutional scholarship opportunities.'
      },
      {
        title: 'Visa & Immigration Policy Advisory',
        desc: 'Up-to-date guidance on immigration rules, student visa requirements, financial documentation, and dependent policies.'
      }
    ],
    whoIsItFor: [
      'High school students exploring international undergraduate degree options.',
      'University graduates aiming for prestigious Master’s or PhD programs overseas.',
      'Working professionals seeking international MBA or specialized career advancement.',
      'Parents seeking clarity on tuition investments, campus safety, and visa compliance.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Initial Consultation & Diagnostic',
        desc: 'We assess your academic background, career ambitions, budget preferences, and target study destinations.'
      },
      {
        step: 2,
        title: 'Strategic Roadmap & Shortlisting',
        desc: 'Receive a curated shortlist of destinations, university tiers (Aspirational, Target, Safe), and intake schedules.'
      },
      {
        step: 3,
        title: 'Profile Enhancement & Test Strategy',
        desc: 'Strategic recommendations for required language proficiency tests (IELTS, DET) and document portfolio preparation.'
      },
      {
        step: 4,
        title: 'Application & Transition Advisory',
        desc: 'Coordinated handoff to admissions submission, offer letter evaluation, and student visa financial checklist.'
      }
    ],
    requiredDocuments: [
      'High School Marksheets / Bachelor Degree Transcripts',
      'Valid Passport Copy (with at least 12 months validity)',
      'Current Resume / Academic Curriculum Vitae',
      'English Language Test Scorecard (if already attempted)',
      'Statement of Purpose (SOP) draft or academic statement of intent',
      'Letters of Academic Recommendation (2 academic references)'
    ],
    faqs: [
      {
        q: 'Which countries does Revival International support for international consulting?',
        a: 'We provide specialized counseling for premier education destinations including the United Kingdom, United States, Canada, Australia, Germany, Ireland, Singapore, Malaysia, and the United Arab Emirates.'
      },
      {
        q: 'When should I begin consulting for an international intake?',
        a: 'We strongly recommend beginning 8 to 12 months prior to your target intake term (e.g., beginning in October for the subsequent September intake) to ensure optimal university choice and visa processing.'
      },
      {
        q: 'Can Revival International assist with merit scholarship applications?',
        a: 'Yes. Our advisors identify institutional merit scholarships, regional grants, and early-applicant bursaries offered directly by universities and assist in strengthening your scholarship essays.'
      },
      {
        q: 'How are consulting sessions conducted?',
        a: 'We offer both in-person consultations at our Dubai headquarters (Business Bay) and flexible virtual sessions via secure video conference for international candidates and families.'
      }
    ],
    relatedServiceIds: ['college-adm', 'intl-adm']
  },
  {
    id: 'college-adm',
    slug: 'college-admission-assistance',
    title: 'College Admission Assistance',
    category: 'Admissions',
    badge: 'Undergraduate & Diploma',
    tagline: 'End-to-End Higher Education & College Admissions Support',
    shortDescription: 'End-to-end guidance for undergraduate and postgraduate college admissions across leading institutions in the GCC and worldwide.',
    heroDescription: 'Securing admission to your target college requires meticulous planning, competitive application positioning, and strict adherence to institutional deadlines. Our dedicated admissions specialists manage the end-to-end process from application drafting to offer confirmation.',
    targetAudience: 'High school seniors, diploma holders, and transfer applicants seeking direct admission into accredited bachelor degree or diploma programs.',
    keyStats: [
      { label: 'Degrees', value: 'UG, B.Sc, B.A, B.E' },
      { label: 'Support Scope', value: 'End-to-End Submission' },
      { label: 'Application Form', value: 'Direct Portal Review' },
      { label: 'Offer Tracking', value: 'Conditional to Firm' }
    ],
    keyBenefits: [
      {
        title: 'Direct University Course Matching',
        desc: 'Match your specific subject prerequisites and academic percentages with verified admission criteria across top colleges.'
      },
      {
        title: 'Application Form Perfection',
        desc: 'Step-by-step guidance on institutional portal applications, ensuring zero errors, accurate credit evaluations, and compliant entries.'
      },
      {
        title: 'Compelling Statement of Purpose (SOP)',
        desc: 'Constructive review and structural feedback on personal essays, highlighting your academic curiosity, leadership, and uniqueness.'
      },
      {
        title: 'Timely Deadline & Offer Management',
        desc: 'Track rolling admissions, early decision dates, condition fulfillment, and tuition deposit deadlines with zero risk of missed cutoff dates.'
      }
    ],
    whoIsItFor: [
      'Grade 12 and CBSE / IB / A-Level school leavers applying for undergraduate degrees.',
      'Diploma holders looking to articulate credits into 2nd or 3rd year Bachelor degree programs.',
      'Students looking for admissions across UAE campus branches (e.g. Dubai Knowledge Park, DIAC) and global campuses.',
      'Candidates transitioning across academic disciplines seeking foundation or pathway programs.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Academic Eligibility Check',
        desc: 'Evaluate subject scores, high school board certificates, and credit recognition prerequisites.'
      },
      {
        step: 2,
        title: 'Course Selection & Portal Setup',
        desc: 'Select preferred degree majors and establish official admissions portal accounts.'
      },
      {
        step: 3,
        title: 'Document Verification & Submission',
        desc: 'Collate verified marksheets, references, and polished essays, submitting formal applications.'
      },
      {
        step: 4,
        title: 'Offer Letter Confirmation',
        desc: 'Follow up with admissions boards, resolve conditional requirements, and confirm final enrollment.'
      }
    ],
    requiredDocuments: [
      'Class 10th and 12th Official Marksheets / Predicted Grades',
      'Graduation or Diploma Certificates (for post-diploma entry)',
      'Government Photo ID / Passport Details',
      'Personal Statement / Statement of Purpose (SOP)',
      'Teacher / Counsellor Reference Letters',
      'Proof of English proficiency (CBSE score / IELTS / DET)'
    ],
    faqs: [
      {
        q: 'What is the difference between College Admission Assistance and International Admissions?',
        a: 'College Admission Assistance caters specifically to undergraduate and diploma admissions including regional UAE higher education institutions, while International Admissions handles multi-country cross-border applications, visa compliance, and global matriculation.'
      },
      {
        q: 'Can I apply with predicted grades if my final results are not yet released?',
        a: 'Yes. Most universities issue Conditional Offer Letters based on verified school predicted grades, allowing you to secure your seat prior to board exam release.'
      },
      {
        q: 'Do you help with transfer applications between universities?',
        a: 'Yes, we provide credit evaluation and syllabus matching guidance for university transfer candidates.'
      }
    ],
    relatedServiceIds: ['intl-adm', 'school-career']
  },
  {
    id: 'school-career',
    slug: 'school-student-career-guidance',
    title: 'School Student Career Guidance',
    category: 'Career',
    badge: 'Aptitude & Stream Planning',
    tagline: 'Scientific Aptitude Mapping & Career Stream Advisory for Grades 8–12',
    shortDescription: 'Specialized aptitude evaluation and personalized career counseling for middle and high school students and their parents.',
    heroDescription: 'Choosing high school streams and identifying long-term career inclinations early prevents costly academic misalignments. We provide scientific career mapping, stream selection guidance (Science, Commerce, Humanities, STEM), and personalized parent-student advisory sessions.',
    targetAudience: 'Middle and high school students (Grades 8 to 12) along with parents seeking clarity on stream choices, college subjects, and modern career landscapes.',
    keyStats: [
      { label: 'Target Grades', value: 'Grades 8 to 12' },
      { label: 'Assessments', value: 'Aptitude & Interest' },
      { label: 'Format', value: 'Student + Parent' },
      { label: 'Roadmap', value: '5-Year Academic Plan' }
    ],
    keyBenefits: [
      {
        title: 'Informed Stream Selection',
        desc: 'Clarity on choosing between Science (PCM/PCB), Commerce, Arts/Humanities, and technical vocational curriculums based on student strengths.'
      },
      {
        title: 'Modern Career Awareness',
        desc: 'Exposure to emerging high-growth career sectors including Artificial Intelligence, Renewable Energy, Data Economics, Bio-tech, and Design.'
      },
      {
        title: 'Joint Parent-Student Alignment',
        desc: 'Facilitated counseling sessions that bridge generational perspectives, aligning student passions with parental considerations and realistic industry demand.'
      },
      {
        title: 'Extracurricular & Skill Profiling',
        desc: 'Actionable recommendations for internships, Olympiads, summer programs, and leadership activities to build a standout university profile.'
      }
    ],
    whoIsItFor: [
      'Grade 8 and 9 students preparing for early subject electives.',
      'Grade 10 students facing critical stream selection decisions (CBSE, ICSE, IGCSE, IB).',
      'Grade 11 and 12 students finalizing university degree majors and career pathways.',
      'Parents seeking structured, objective counseling to understand their child’s natural aptitudes.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Career & Interest Profiling',
        desc: 'The student completes an interactive evaluation exploring cognitive strengths, work styles, and subject interests.'
      },
      {
        step: 2,
        title: 'Comprehensive Diagnostic Report',
        desc: 'Detailed analysis charting top matching career clusters and corresponding high school subject combinations.'
      },
      {
        step: 3,
        title: 'Joint Counselling Appointment',
        desc: 'In-depth consultation with the student and parents led by a certified education counsellor.'
      },
      {
        step: 4,
        title: 'Actionable Academic Roadmap',
        desc: 'Delivery of a personalized 3-to-5-year milestone roadmap outlining target entrance tests, subjects, and summer enrichment.'
      }
    ],
    requiredDocuments: [
      'Recent school report cards / academic transcripts (Past 2 years)',
      'List of current subjects and preferred electives',
      'Details of any prior aptitude assessments or Olympiad participation',
      'Brief summary of extracurricular interests and hobbies'
    ],
    faqs: [
      {
        q: 'Are parents required to attend the career counseling session?',
        a: 'Yes, we strongly encourage at least one parent or guardian to attend the consultation so that decisions regarding academic streams, tuition investments, and university roadmaps are fully collaborative.'
      },
      {
        q: 'How long does a career guidance consultation take?',
        a: 'The diagnostic assessment takes approximately 30 minutes, followed by a dedicated 60-minute joint consultation session with our senior counselor.'
      },
      {
        q: 'Does this guidance apply to international school boards like IB and Cambridge IGCSE?',
        a: 'Absolutely. Our counselors are experienced across CBSE, ICSE, Cambridge (IGCSE/A-Levels), IB Diploma Programme, and American curriculum standards.'
      }
    ],
    relatedServiceIds: ['school-academy', 'college-adm']
  },
  {
    id: 'intl-adm',
    slug: 'international-admissions',
    title: 'International Admissions',
    category: 'Admissions',
    badge: 'University Placement',
    tagline: 'End-to-End Global University Applications, Compliance & Matriculation',
    shortDescription: 'Direct support and structured execution for university applications, admissions, and compliance across global destinations.',
    heroDescription: 'From navigating UCAS in the UK and Common App in the United States to handling direct admissions in Canada, Europe, and Australia, our International Admissions team manages your multi-country applications with institutional precision and compliance monitoring.',
    targetAudience: 'Candidates ready to submit verified applications to accredited universities worldwide across the UK, USA, Canada, Europe, Australia, and the UAE.',
    keyStats: [
      { label: 'Destinations', value: 'Global Universities' },
      { label: 'Portals', value: 'UCAS, CommonApp, Direct' },
      { label: 'Application Stages', value: 'Draft to CAS / I-20' },
      { label: 'Compliance', value: 'Visa & Financial Audit' }
    ],
    keyBenefits: [
      {
        title: 'Multi-Country University Portals',
        desc: 'Unified coordination across international application systems including UCAS (UK), Common Application (US), OUAC (Canada), and European state portals.'
      },
      {
        title: 'Academic Document Verification & Attestation',
        desc: 'Comprehensive pre-screening of marks, transcript notarizations, translation validation, and credential equivalency evaluations.'
      },
      {
        title: 'CAS & I-20 Compliance Guidance',
        desc: 'Guidance on clearing university credibility interviews, securing Confirmation of Acceptance for Studies (CAS) and Form I-20 certificates.'
      },
      {
        title: 'Direct Liaison with Admissions Boards',
        desc: 'Active follow-up with international university admissions offices to expedite application processing and resolve conditional queries.'
      }
    ],
    whoIsItFor: [
      'Candidates preparing active university submissions for upcoming academic intakes.',
      'Students targeting top-tier global research universities requiring portfolio and interview preparation.',
      'Postgraduate applicants submitting complex portfolios, research proposals, or academic resumes.',
      'Applicants seeking end-to-end management with complete transparency for parents.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Application Package Formulation',
        desc: 'Compile finalized university list, application deadlines, and specific faculty prerequisites.'
      },
      {
        step: 2,
        title: 'Submission & Portal Management',
        desc: 'Careful execution of portal entries, document uploads, application fee submissions, and reference verifications.'
      },
      {
        step: 3,
        title: 'Offer Evaluation & Condition Clearing',
        desc: 'Review received offer letters, navigate unconditional conversions, and prepare financial tuition deposits.'
      },
      {
        step: 4,
        title: 'Visa & Pre-Departure Coordination',
        desc: 'Verification of CAS / I-20 issuance, student visa appointment preparation, accommodation advice, and pre-departure briefings.'
      }
    ],
    requiredDocuments: [
      'Official Academic Transcripts (School / University level)',
      'Valid International Passport (Color scan of all stamped pages)',
      'Official English Language Proficiency Scorecard (IELTS / DET / TOEFL)',
      'Two Academic or Professional Letters of Recommendation (LOR)',
      'Statement of Purpose tailored to each selected university',
      'Proof of Financial Capability / Bank Solvency Statement'
    ],
    faqs: [
      {
        q: 'How many international universities can I apply to simultaneously?',
        a: 'Depending on the target countries (e.g., maximum 5 choices on UK UCAS; up to 10 choices on US Common App), we help you strategize a balanced mix of Aspirational, Target, and Safe institutions.'
      },
      {
        q: 'Do you help with student visa processing once an offer is accepted?',
        a: 'Yes, our International Admissions service integrates directly with visa compliance advisory to ensure all financial evidence, tuberculosis tests, and biometrics appointments are completed flawlessly.'
      },
      {
        q: 'What happens if a university requires an admissions interview?',
        a: 'We conduct tailored mock interview sessions covering standard university credibility and faculty questions to build your confidence.'
      }
    ],
    relatedServiceIds: ['intl-consult', 'exec-seminars-lang']
  },
  {
    id: 'school-academy',
    slug: 'academy-for-school-students',
    title: 'Academy for School Students',
    category: 'Academy',
    badge: 'Student Enrichment',
    tagline: 'Holistic Academic Enrichment, Study Skills & Career-Readiness Cohorts',
    shortDescription: 'Holistic student development programs designed to build study skills, communication abilities, and foundational career readiness.',
    heroDescription: 'Beyond textbook curriculums, modern academic success demands disciplined study habits, public speaking confidence, and early career awareness. The Revival Academy offers cohort-based weekend and holiday enrichment programs for school pupils.',
    targetAudience: 'School students in Grades 6 through 12 seeking academic skill enhancement, time management discipline, public speaking coaching, and leadership foundations.',
    keyStats: [
      { label: 'Cohorts', value: 'Interactive Small Batches' },
      { label: 'Focus Areas', value: 'Skills, Mindset & Prep' },
      { label: 'Certification', value: 'Certificate of Completion' },
      { label: 'Schedule', value: 'Weekend & Holiday Batches' }
    ],
    keyBenefits: [
      {
        title: 'Scientific Study Skills & Memory Techniques',
        desc: 'Master active recall, spaced repetition, Cornell note-taking, and exam revision strategies to maximize academic retention.'
      },
      {
        title: 'Communication & Public Presentation',
        desc: 'Build poise, debate articulation, and presentation skills through guided public speaking exercises and collaborative projects.'
      },
      {
        title: 'Time Management & Focus Mastery',
        desc: 'Overcome digital distractions and procrastination through structured habit tracking, goal-setting, and prioritization frameworks.'
      },
      {
        title: 'Foundational Career & Tech Readiness',
        desc: 'Introductory workshops on digital literacy, AI tools for research, financial basics, and global citizenship.'
      }
    ],
    whoIsItFor: [
      'Middle school students transitioning to rigorous high school academic demands.',
      'High school students seeking to elevate public speaking confidence and interview readiness.',
      'Pupils who struggle with exam anxiety, revision structure, or procrastination.',
      'Students looking for structured peer learning and leadership development.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Diagnostic Needs Assessment',
        desc: 'Identify specific growth opportunities in study habits, focus, or public communication.'
      },
      {
        step: 2,
        title: 'Cohort Placement',
        desc: 'Enrollment in age-appropriate small peer cohorts led by seasoned educators and trainers.'
      },
      {
        step: 3,
        title: 'Interactive Workshop Modules',
        desc: 'Participate in dynamic, hands-on weekend sessions featuring real-world exercises and roleplays.'
      },
      {
        step: 4,
        title: 'Progress Review & Certification',
        desc: 'Comprehensive post-program feedback report for parents and formal certificate of completion.'
      }
    ],
    requiredDocuments: [
      'Basic student registration form with emergency contact details',
      'School name and current grade level',
      'Parental consent and medical / dietary disclosures for in-person workshops'
    ],
    faqs: [
      {
        q: 'Are the Academy sessions conducted online or in person?',
        a: 'We offer interactive hybrid formats: in-person weekend workshops at our Dubai executive center, alongside interactive live online cohorts for students across the GCC.'
      },
      {
        q: 'What is the typical class size in the Academy?',
        a: 'To guarantee individual attention and meaningful participation, cohorts are strictly capped at 12 to 15 students per batch.'
      },
      {
        q: 'Does the Academy offer private 1-on-1 coaching?',
        a: 'Yes, individualized executive mentoring sessions for school students can be arranged upon request with our senior education mentors.'
      }
    ],
    relatedServiceIds: ['school-career', 'college-adm']
  },
  {
    id: 'exec-seminars-lang',
    slug: 'executive-seminars-and-language-test-preparation',
    title: 'Seminars & Language',
    category: 'Executive & Language',
    badge: 'Mastery & Certification',
    tagline: 'Executive Development, Professional Seminars & Certified Language Test Preparation',
    shortDescription: 'Executive development seminars and certified language test preparation for IELTS, OET, DET, and TOEFL.',
    heroDescription: 'Enhance professional communication, leadership capabilities, and language proficiency through structured training programs tailored to individual and organizational needs. The Revival International offers executive development seminars and preparation support for IELTS, OET, DET, and TOEFL, helping students, healthcare professionals, working professionals, and corporate teams prepare for their academic and career goals.',
    targetAudience: 'Students, healthcare professionals, university applicants, working professionals, managers, executives, and corporate teams.',
    keyStats: [
      { label: 'Language Tests', value: 'IELTS, OET, DET, TOEFL' },
      { label: 'Executive Programs', value: 'Leadership & Seminars' },
      { label: 'Training Formats', value: 'Individual & Corporate' },
      { label: 'Learning Approach', value: 'Structured Preparation' }
    ],
    keyBenefits: [
      {
        title: 'Duolingo English Test (DET) Rapid Prep',
        desc: 'Master computer-adaptive test patterns, production subscores, integrated listening-speaking tasks, and timed video interview questions.'
      },
      {
        title: 'Healthcare-Specific OET Training',
        desc: 'Tailored for doctors and nurses targeting UK NMC, GMC, and UAE health authority requirements, focusing on clinical consultation roleplays and referral letters.'
      },
      {
        title: 'IELTS Academic & General Comprehensive Coaching',
        desc: 'Strategic mastery of Listening, Reading, Writing Task 1 & 2, and 1-on-1 Speaking band descriptors to achieve Band 7.0+ scores.'
      },
      {
        title: 'Executive Management Seminars',
        desc: 'High-impact masterclasses on cross-cultural negotiation, corporate governance, team communication, and executive presence in Dubai.'
      }
    ],
    subProgrammes: [
      {
        id: 'exec-seminars',
        title: 'Executive & Professional Development Seminars',
        badge: 'Corporate Leadership',
        description: 'Interactive leadership, cross-cultural communication, and professional governance seminars for managers and executives in Dubai and GCC enterprises.',
        audience: 'Corporate managers, team leads, department heads, and mid-to-senior professionals.',
        features: [
          'High-stakes presentation and persuasion',
          'Cross-cultural workplace leadership in GCC environments',
          'Conflict resolution and strategic stakeholder management',
          'Executive presence and career branding'
        ]
      },
      {
        id: 'det-prep',
        title: 'Duolingo English Test (DET) Preparation',
        badge: 'Adaptive Testing',
        description: 'Targeted preparation modules covering adaptive computerized testing patterns, literacy, comprehension, conversation, and production subscores.',
        audience: 'University candidates and professionals applying to institutions accepting DET globally.',
        features: [
          'Computer-adaptive algorithmic scoring strategies',
          'Production and conversation subscore boosters',
          'Interactive writing and timed reading comprehension',
          'Full-length simulated mock tests with instant analysis'
        ]
      },
      {
        id: 'oet-prep',
        title: 'Occupational English Test (OET) Preparation',
        badge: 'Healthcare Licensure',
        description: 'Healthcare-specific language preparation focusing on clinical consultations, discharge/referral letter writing, and professional medical roleplays.',
        audience: 'Doctors, registered nurses, dentists, and allied health professionals seeking GCC, UK, Ireland, or Australia licensing.',
        features: [
          'Medical referral letter writing with precise clinical case notes',
          'Consultation roleplay simulations evaluated on linguistic and clinical communication criteria',
          'Healthcare listening recordings with multi-speaker hospital environments',
          'Specialized coaching for Nursing and Medicine subsets'
        ]
      },
      {
        id: 'ielts-prep',
        title: 'IELTS Preparation (Academic & General)',
        badge: 'Global Benchmark',
        description: 'Comprehensive training covering Listening, Reading, Writing, and Speaking for both Academic and General Training test modules.',
        audience: 'Study abroad applicants, skilled migration candidates, and professionals seeking Band 7.0 to 8.5 scores.',
        features: [
          'Essay structuring templates for Writing Task 1 and Task 2',
          'Reading skim-and-scan techniques for complex academic texts',
          '1-on-1 live mock speaking interviews with recorded band feedback',
          'Over 500+ official practice test questions and vocabulary drills'
        ]
      }
    ],
    whoIsItFor: [
      'Healthcare professionals (Nurses, Doctors) preparing for OET to achieve global or GCC registration.',
      'Study abroad aspirants aiming for IELTS 7.0+ or DET 120+ to fulfill university admissions criteria.',
      'Immigration and skilled worker visa candidates requiring General IELTS benchmarks.',
      'Business executives and managers seeking professional communication seminars in Dubai.'
    ],
    howItWorks: [
      {
        step: 1,
        title: 'Diagnostic Assessment',
        desc: 'Undertake an initial test evaluation to establish current baseline score and pinpoint specific weak modules.'
      },
      {
        step: 2,
        title: 'Customized Study Plan',
        desc: 'Receive a personalized training timetable structured around your target score and exam booking date.'
      },
      {
        step: 3,
        title: 'Intensive Training & Drill Modules',
        desc: 'Attend interactive live instruction, analyze high-scoring sample responses, and complete targeted daily drills.'
      },
      {
        step: 4,
        title: 'Full Simulation & Test Readiness',
        desc: 'Complete full-length timed mock examinations under exam conditions with detailed diagnostic score reviews.'
      }
    ],
    requiredDocuments: [
      'Valid Passport Copy (identification for official test booking)',
      'Previous test scorecards (if re-attempting IELTS, OET, or DET)',
      'Target institution or professional registration board score requirements'
    ],
    faqs: [
      {
        q: 'Which language test is easiest between IELTS and Duolingo English Test (DET)?',
        a: 'The Duolingo English Test is taken on a computer from home and is shorter (1 hour) with results in 48 hours, making it highly convenient. However, acceptance varies by university. IELTS is the most universally accepted test globally. Our counselors help determine which test best fits your target institutions.'
      },
      {
        q: 'What is the required OET grade for UK nursing or GMC doctor registration?',
        a: 'Typically, the UK Nursing and Midwifery Council (NMC) requires at least a Grade B in Listening, Reading, and Speaking, and at least a Grade C+ in Writing. For doctors (GMC), at least a Grade B across all four sub-tests is generally required.'
      },
      {
        q: 'Are mock tests included in the preparation packages?',
        a: 'Yes! All language preparation modules include diagnostic mock tests with detailed performance rubrics and 1-on-1 instructor feedback.'
      }
    ],
    relatedServiceIds: ['intl-adm', 'intl-consult']
  }
];

export const getEducationServiceById = (id) => {
  return EDUCATION_SERVICES_DETAILED.find(s => s.id === id) || null;
};

export const getEducationServiceBySlug = (slug) => {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  return EDUCATION_SERVICES_DETAILED.find(s => 
    s.slug.toLowerCase() === clean || 
    s.id.toLowerCase() === clean ||
    (s.id === 'exec-seminars-lang' && (clean === 'executive-seminars-and-language-test-preparation' || clean === 'executive-seminars-language-training')) ||
    (s.id === 'school-career' && (clean === 'career-guidance' || clean === 'career-course-guidance' || clean === 'course-guidance' || clean === 'ug-pg-course-guidance'))
  ) || null;
};

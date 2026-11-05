/**
 * Revival AI Advisor — Enterprise Conversational AI Engine & Knowledge Base
 * Official AI Assistant for The Revival International
 *
 * Implements 29-Intent Neural-style Semantic Classifier, Multi-turn Entity Memory,
 * Service Knowledge Retrieval, and Multi-Provider AI (Gemini / OpenAI / Local Fallback).
 */

export const REVIVAL_BRAND = {
  name: 'The Revival International',
  shortName: 'Revival International',
  assistantName: 'Revival AI Advisor',
  tagline: 'Global Executive Recruitment, Overseas Career Placement & Academic Advisory',
  status: 'Online – 24/7 AI Assistance',
  headquarters: 'Dubai, United Arab Emirates & India',
  officialWhatsApp: 'https://wa.me/919003475405',
  phoneIndia: '+91 9003475405',
  phoneDubai: '+971 4 123 4567',
  officialEmail: 'contact@therevivalinternational.com',
  admissionsEmail: 'admissions@therevivalinternational.com',
  recruitmentEmail: 'careers@therevivalinternational.com',
  disclaimers: {
    general: 'The Revival International provides professional advisory, documentation assistance, university application processing, and executive search services.',
    visa: 'Visa approvals and issuance are at the sole discretion of respective government authorities (MOHRE, UKVI, IRCC, US Dept of State). No agency can guarantee visa approval.',
    admission: 'University admission decisions are made exclusively by institutional academic admission committees based on applicant qualifications and seat availability.',
    jobs: 'Job placements and salary offerings are finalized directly by hiring employers based on client interviews and verified credentials. We do not sell job placements.'
  }
};

export const REVIVAL_KNOWLEDGE_BASE = REVIVAL_BRAND;

// 29 Supported Conversational & Service Intents
export const INTENT_DEFINITIONS = {
  GREETING: 'greeting',
  INTL_ADMISSIONS: 'intl_admissions',
  UNIVERSITY_APPLICATIONS: 'university_applications',
  UK_ADMISSIONS_UCAS: 'uk_admissions_ucas',
  WHAT_IS_UCAS: 'what_is_ucas',
  USA_ADMISSIONS_COMMONAPP: 'usa_admissions_commonapp',
  CANADA_ADMISSIONS: 'canada_admissions',
  AUSTRALIA_ADMISSIONS: 'australia_admissions',
  EUROPE_ADMISSIONS: 'europe_admissions',
  UAE_ADMISSIONS: 'uae_admissions',
  ACADEMIC_DOC_VERIFICATION: 'academic_doc_verification',
  VISA_ASSISTANCE: 'visa_assistance',
  GCC_WORK_VISA: 'gcc_work_visa',
  DUBAI_JOB_SEARCH: 'dubai_job_search',
  INTL_RECRUITMENT: 'intl_recruitment',
  DOMESTIC_RECRUITMENT: 'domestic_recruitment',
  EXEC_SEARCH: 'exec_search',
  PERM_STAFFING: 'perm_staffing',
  CONTRACT_STAFFING: 'contract_staffing',
  IELTS_PREP: 'ielts_prep',
  OET_PREP: 'oet_prep',
  DET_PREP: 'det_prep',
  TOEFL_PREP: 'toefl_prep',
  EXEC_SEMINARS: 'exec_seminars',
  LEADERSHIP_DEV: 'leadership_dev',
  CORP_TRAINING: 'corp_training',
  ACADEMIC_ADVISORY: 'academic_advisory',
  APPOINTMENT_BOOKING: 'appointment_booking',
  COMPANY_INFO: 'company_info',
  UNRELATED: 'unrelated'
};

/**
 * Intelligent Multi-Signal Intent Classifier
 */
export function classifyIntent(userQuery, context = {}, history = []) {
  const query = (userQuery || '').toLowerCase().trim();
  const clean = query.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Pure Greetings (Hi, Hello, Hey, etc.)
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|marhaba)\b/i.test(clean) && clean.split(/\s+/).length <= 4) {
    return INTENT_DEFINITIONS.GREETING;
  }

  // 2. Company Information & Overview
  if (
    clean.includes('what is the revival international') ||
    clean.includes('what is revival international') ||
    clean.includes('about the revival international') ||
    clean.includes('who are you') ||
    clean.includes('tell me about your company') ||
    clean.includes('what services do you provide') ||
    clean.includes('what services do you offer') ||
    clean.includes('what do you do') ||
    clean.includes('list of services')
  ) {
    return INTENT_DEFINITIONS.COMPANY_INFO;
  }

  // 3. Appointment / Consultation Booking
  if (
    clean.includes('book an appointment') ||
    clean.includes('book appointment') ||
    clean.includes('book a consultation') ||
    clean.includes('book consultation') ||
    clean.includes('schedule a call') ||
    clean.includes('schedule consultation') ||
    clean.includes('speak to advisor') ||
    clean.includes('talk to someone') ||
    clean.includes('consultation booking')
  ) {
    return INTENT_DEFINITIONS.APPOINTMENT_BOOKING;
  }

  // 4. Specific Exam Intents
  if (/\b(oet)\b/.test(clean) || clean.includes('occupational english test')) {
    return INTENT_DEFINITIONS.OET_PREP;
  }
  if (/\b(ielts)\b/.test(clean) || clean.includes('international english language testing')) {
    return INTENT_DEFINITIONS.IELTS_PREP;
  }
  if (/\b(det|duolingo english test|duolingo test)\b/.test(clean)) {
    return INTENT_DEFINITIONS.DET_PREP;
  }
  if (/\b(toefl|toefl ibt)\b/.test(clean)) {
    return INTENT_DEFINITIONS.TOEFL_PREP;
  }

  // 5. Specific Admission Mechanisms: UCAS & Common App
  if (clean.includes('what is ucas') || clean === 'ucas' || clean.includes('explain ucas')) {
    return INTENT_DEFINITIONS.WHAT_IS_UCAS;
  }
  if (/\b(ucas)\b/.test(clean) || clean.includes('apply through ucas')) {
    return INTENT_DEFINITIONS.UK_ADMISSIONS_UCAS;
  }
  if (/\b(common app|commonapp)\b/.test(clean) || clean.includes('apply through common app')) {
    return INTENT_DEFINITIONS.USA_ADMISSIONS_COMMONAPP;
  }

  // 6. Country-Specific University Admissions
  const isStudy = /\b(study|studying|university|universities|admission|admissions|college|colleges|degree|masters|bachelor|bachelors|phd|course|courses|campus|tuition|apply)\b/.test(clean);
  const hasDocWord = /\b(document|documents|paperwork|requirements|checklist|transcripts|sop|lor)\b/.test(clean);

  if (/\b(uk|united kingdom|britain|london|england|scotland)\b/.test(clean) && (isStudy || hasDocWord || clean.includes('want to study in the uk') || clean.includes('study in uk'))) {
    return INTENT_DEFINITIONS.UK_ADMISSIONS_UCAS;
  }
  if (/\b(canada|canadian|toronto|ontario|vancouver)\b/.test(clean) && (isStudy || hasDocWord || clean.includes('apply to canadian universities'))) {
    return INTENT_DEFINITIONS.CANADA_ADMISSIONS;
  }
  if (/\b(usa|us|united states|america)\b/.test(clean) && (isStudy || hasDocWord)) {
    return INTENT_DEFINITIONS.USA_ADMISSIONS_COMMONAPP;
  }
  if (/\b(australia|australian|sydney|melbourne)\b/.test(clean) && (isStudy || hasDocWord)) {
    return INTENT_DEFINITIONS.AUSTRALIA_ADMISSIONS;
  }
  if (/\b(europe|germany|france|ireland|netherlands|poland)\b/.test(clean) && (isStudy || hasDocWord)) {
    return INTENT_DEFINITIONS.EUROPE_ADMISSIONS;
  }
  if (/\b(dubai|uae)\b/.test(clean) && (clean.includes('university') || clean.includes('college') || clean.includes('study in dubai'))) {
    return INTENT_DEFINITIONS.UAE_ADMISSIONS;
  }

  // 7. General Document Requirements for Admissions
  if (
    clean.includes('documents are required for admission') ||
    clean.includes('documents required for admission') ||
    clean.includes('admission documents') ||
    clean.includes('what documents do i need for university') ||
    (hasDocWord && (isStudy || context.destination || context.intent === INTENT_DEFINITIONS.INTL_ADMISSIONS))
  ) {
    return INTENT_DEFINITIONS.ACADEMIC_DOC_VERIFICATION;
  }

  // 8. Work Visas & GCC Visas
  if (
    clean.includes('uae work visa') ||
    clean.includes('dubai work visa') ||
    clean.includes('gcc work visa') ||
    clean.includes('mohre') ||
    clean.includes('iqama') ||
    clean.includes('emirates id') ||
    clean.includes('work permit') ||
    (clean.includes('work visa') && (clean.includes('dubai') || clean.includes('uae') || clean.includes('gcc') || clean.includes('saudi')))
  ) {
    return INTENT_DEFINITIONS.GCC_WORK_VISA;
  }

  // General Visa Assistance (Student visas, Schengen, etc.)
  if (
    clean.includes('visa assistance') ||
    clean.includes('student visa') ||
    clean.includes('apply for visa') ||
    clean.includes('how to get a visa') ||
    clean.includes('visa process') ||
    clean.includes('visa interview')
  ) {
    return INTENT_DEFINITIONS.VISA_ASSISTANCE;
  }

  // 9. Dubai & Overseas Jobs
  if (
    clean.includes('dubai job') ||
    clean.includes('jobs in dubai') ||
    clean.includes('job in dubai') ||
    clean.includes('work in dubai') ||
    clean.includes('find a job in dubai') ||
    clean.includes('dubai career') ||
    clean.includes('dubai vacancies') ||
    clean.includes('dubai salary') ||
    clean.includes('gcc jobs') ||
    clean.includes('uae jobs') ||
    clean.includes('need a job in dubai') ||
    clean.includes('how can i get a dubai job')
  ) {
    return INTENT_DEFINITIONS.DUBAI_JOB_SEARCH;
  }

  // 10. Executive Search
  if (
    clean.includes('executive search') ||
    clean.includes('headhunting') ||
    clean.includes('hire ceo') ||
    clean.includes('hire cfo') ||
    clean.includes('c suite recruitment') ||
    clean.includes('board level search') ||
    clean.includes('director search')
  ) {
    return INTENT_DEFINITIONS.EXEC_SEARCH;
  }

  // 11. Permanent Staffing
  if (
    clean.includes('permanent staffing') ||
    clean.includes('permanent recruitment') ||
    clean.includes('direct hire') ||
    clean.includes('need employees for my company') ||
    clean.includes('hire employees') ||
    clean.includes('looking for candidates') ||
    clean.includes('permanent hire')
  ) {
    return INTENT_DEFINITIONS.PERM_STAFFING;
  }

  // 12. Contract Staffing
  if (
    clean.includes('contract staffing') ||
    clean.includes('temporary staffing') ||
    clean.includes('staff augmentation') ||
    clean.includes('interim management') ||
    clean.includes('project based staffing')
  ) {
    return INTENT_DEFINITIONS.CONTRACT_STAFFING;
  }

  // 13. General / Domestic / International Recruitment
  if (
    clean.includes('recruitment services') ||
    clean.includes('recruitment service') ||
    clean.includes('do you provide recruitment') ||
    clean.includes('recruitment solutions') ||
    clean.includes('hiring services')
  ) {
    return INTENT_DEFINITIONS.DOMESTIC_RECRUITMENT;
  }
  if (clean.includes('international recruitment') || clean.includes('cross border recruitment') || clean.includes('overseas hiring')) {
    return INTENT_DEFINITIONS.INTL_RECRUITMENT;
  }

  // 14. Executive Seminars, Leadership Development, Corporate Training
  if (clean.includes('corporate training') || clean.includes('workforce training') || clean.includes('employee upskilling')) {
    return INTENT_DEFINITIONS.CORP_TRAINING;
  }
  if (clean.includes('leadership development') || clean.includes('corporate leadership training') || clean.includes('executive coaching')) {
    return INTENT_DEFINITIONS.LEADERSHIP_DEV;
  }
  if (clean.includes('executive seminars') || clean.includes('executive seminar') || clean.includes('business masterclass')) {
    return INTENT_DEFINITIONS.EXEC_SEMINARS;
  }

  // 15. Academic Advisory & General Admissions
  if (
    clean.includes('international admission') ||
    clean.includes('international admissions') ||
    clean.includes('what is international admission') ||
    clean.includes('study abroad') ||
    clean.includes('overseas education') ||
    clean.includes('university admission')
  ) {
    return INTENT_DEFINITIONS.INTL_ADMISSIONS;
  }

  if (
    clean.includes('academic advisory') ||
    clean.includes('career guidance') ||
    clean.includes('stream selection') ||
    clean.includes('course shortlisting')
  ) {
    return INTENT_DEFINITIONS.ACADEMIC_ADVISORY;
  }

  // 16. Multi-Turn Follow-Up Resolution using Context
  if (context.intent || context.serviceId) {
    if (
      clean.startsWith('what about') ||
      clean.startsWith('and for') ||
      clean.startsWith('what documents') ||
      clean.startsWith('what are the requirements') ||
      clean.startsWith('how long') ||
      clean.startsWith('how much') ||
      clean.startsWith('can you help with') ||
      clean.includes('undergraduate') ||
      clean.includes('postgraduate') ||
      clean.includes('masters') ||
      clean.includes('bachelor')
    ) {
      if (context.intent === INTENT_DEFINITIONS.UK_ADMISSIONS_UCAS || context.serviceId === 'intl-adm') {
        return INTENT_DEFINITIONS.UK_ADMISSIONS_UCAS;
      }
      if (context.intent === INTENT_DEFINITIONS.CANADA_ADMISSIONS) {
        return INTENT_DEFINITIONS.CANADA_ADMISSIONS;
      }
      if (context.intent === INTENT_DEFINITIONS.DUBAI_JOB_SEARCH || context.serviceId === 'overseas-place') {
        return INTENT_DEFINITIONS.DUBAI_JOB_SEARCH;
      }
      if (context.intent === INTENT_DEFINITIONS.GCC_WORK_VISA || context.serviceId === 'work-permit') {
        return INTENT_DEFINITIONS.GCC_WORK_VISA;
      }
      if (context.intent === INTENT_DEFINITIONS.IELTS_PREP) {
        return INTENT_DEFINITIONS.IELTS_PREP;
      }
      return context.intent;
    }
  }

  // 17. Unrelated Queries
  if (
    clean.includes('weather') ||
    clean.includes('crypto') ||
    clean.includes('recipe') ||
    clean.includes('movie') ||
    clean.includes('sports score') ||
    clean.includes('joke') ||
    clean.includes('capital of')
  ) {
    return INTENT_DEFINITIONS.UNRELATED;
  }

  // Fallback to General Company Info
  return INTENT_DEFINITIONS.COMPANY_INFO;
}

/**
 * Multi-Turn Entity Extractor
 */
export function extractEntities(userQuery, previousContext = {}) {
  const clean = (userQuery || '').toLowerCase().trim();
  const context = { ...previousContext };

  // Destinations
  if (/\b(uk|united kingdom|britain|london|england)\b/.test(clean)) context.destination = 'United Kingdom';
  if (/\b(canada|canadian|toronto|ontario|vancouver)\b/.test(clean)) context.destination = 'Canada';
  if (/\b(usa|us|united states|america)\b/.test(clean)) context.destination = 'United States';
  if (/\b(australia|australian|sydney|melbourne)\b/.test(clean)) context.destination = 'Australia';
  if (/\b(europe|germany|france|ireland)\b/.test(clean)) context.destination = 'Europe';
  if (/\b(dubai|uae|abu dhabi|gcc|saudi)\b/.test(clean)) context.destination = 'Dubai / UAE';

  // Degree Level
  if (/\b(master|masters|msc|ma|mba|postgraduate|pg)\b/.test(clean)) context.degreeLevel = 'Postgraduate (Master\'s)';
  if (/\b(bachelor|bachelors|bsc|ba|bba|undergraduate|ug)\b/.test(clean)) context.degreeLevel = 'Undergraduate (Bachelor\'s)';
  if (/\b(phd|doctorate|doctoral)\b/.test(clean)) context.degreeLevel = 'Doctoral (PhD)';

  // User Role
  if (/\b(employer|company|hiring manager|recruiter|looking for candidates|need employees)\b/.test(clean)) {
    context.userRole = 'Employer';
  } else if (/\b(student|applicant|study abroad|fresh graduate)\b/.test(clean)) {
    context.userRole = 'Student';
  } else if (/\b(job seeker|looking for job|find work|cv)\b/.test(clean)) {
    context.userRole = 'Candidate';
  }

  return context;
}

/**
 * Distinct, High-Quality Response Generator for Each of the 29 Intents
 */
export function generateIntentResponse(intent, userQuery, context = {}, history = []) {
  switch (intent) {
    // 1. GREETING
    case INTENT_DEFINITIONS.GREETING:
      return {
        intent,
        reply: `Hello! Welcome to **The Revival International**. I’m your **Revival AI Advisor**.\n\nI can help you with international university admissions, Dubai career opportunities, recruitment, visa assistance, and certified language training.\n\nWhat would you like help with today?`,
        suggestedQuestions: [
          '🎓 International Admissions',
          '💼 Dubai Jobs',
          '🇦🇪 UAE Visa Assistance',
          '🤝 Recruitment Services'
        ],
        offerConsultation: false,
        detectedService: null
      };

    // 2. INTERNATIONAL ADMISSIONS
    case INTENT_DEFINITIONS.INTL_ADMISSIONS:
      return {
        intent,
        reply: `**International Admissions** is our comprehensive university application and placement service for students seeking accredited undergraduate, postgraduate, and doctoral degrees abroad.\n\nAt The Revival International, we guide you through:\n- **Destination & Course Selection:** Evaluating universities in the UK, USA, Canada, Australia, and Europe based on your GPA, budget, and post-study work goals.\n- **Application Dossier Preparation:** Crafting competitive Statements of Purpose (SOP), securing strong Recommendation Letters (LOR), and verifying transcripts.\n- **Offer Acceptance & Visa Transitions:** Securing CAS (UK), I-20 (USA), or LOA + PAL (Canada) and structuring required financial proofs.\n\nAre you looking to pursue an undergraduate degree or a Master’s / MBA abroad?`,
        suggestedQuestions: [
          'I want to study in the UK',
          'How can I apply to Canadian universities?',
          'What documents are required for admission?',
          'Book a University Admissions Consultation'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 3. UNIVERSITY APPLICATIONS
    case INTENT_DEFINITIONS.UNIVERSITY_APPLICATIONS:
      return {
        intent,
        reply: `We assist students with university applications across top global destinations including the UK, USA, Canada, Australia, Germany, and Ireland.\n\nOur structured application approach includes:\n1. **Profile Diagnostic:** Evaluating your grades, extracurriculars, and test scores (IELTS/DET/TOEFL).\n2. **Tiered University Shortlisting:** Categorizing institutions into Aspirational, Target, and Safe brackets.\n3. **Application Portal Management:** Submitting error-free portfolios through centralized systems (UCAS, Common App) or direct institutional portals.\n\nWhich destination or study level are you currently planning for?`,
        suggestedQuestions: [
          'Apply to UK Universities',
          'Apply to Canadian Universities',
          'What documents do I need to prepare?',
          'Schedule Profile Evaluation'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 4. WHAT IS UCAS?
    case INTENT_DEFINITIONS.WHAT_IS_UCAS:
      return {
        intent,
        reply: `**UCAS** (Universities and Colleges Admissions Service) is the centralized British admissions service through which students apply to undergraduate courses across universities in the United Kingdom.\n\n**Key Aspects of UCAS:**\n- **Up to 5 Course Choices:** You can apply to up to 5 courses across British universities in one application cycle.\n- **One Personal Statement:** A single 4,000-character statement submitted to all your chosen institutions.\n- **Key Deadlines:** October 15 for Oxford, Cambridge, and Medicine/Dentistry; late January for most other undergraduate courses.\n- **Offers & Tracking:** Track conditional and unconditional offers directly in the UCAS Hub.\n\nRevival International advisors assist with university selection, personal statement optimization, and UCAS tracking. Are you planning an undergraduate degree in the UK?`,
        suggestedQuestions: [
          'Can I apply to multiple universities?',
          'What documents are required for UK admission?',
          'Book UK Admissions Advisory'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 4b. UK ADMISSIONS – UCAS
    case INTENT_DEFINITIONS.UK_ADMISSIONS_UCAS:
      return {
        intent,
        reply: `That’s great! We can help you understand UK university applications, course selection, academic documentation, **UCAS applications** where applicable, and admission planning.\n\n**UK Admissions Highlights:**\n- **Undergraduate:** Submitted centrally via **UCAS** (up to 5 course choices), requiring one unified Personal Statement and academic reference.\n- **Postgraduate (Master’s / PhD):** Processed directly through individual university applicant portals.\n- **Key Intakes:** Major intake in **September/October (Fall)**, with select courses starting in **January/February (Spring)**.\n- **Post-Study Work:** Eligible graduates can access the 2-Year UK Graduate Route Visa.\n\nAre you planning for an undergraduate or postgraduate course in the UK?`,
        suggestedQuestions: [
          'What is UCAS?',
          'What documents are required for UK admission?',
          'Can you help with UK university shortlisting?',
          'Book UK Admissions Consultation'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 5. USA ADMISSIONS – COMMON APP
    case INTENT_DEFINITIONS.USA_ADMISSIONS_COMMONAPP:
      return {
        intent,
        reply: `US university applications require a strategic combination of academic transcripts, personal essays, standardized tests, and extracurricular profiles.\n\n- **Common Application:** Centralized platform used by over 1,000 US colleges for undergraduate applications, featuring the Personal Essay and college-specific supplemental questions.\n- **Postgraduate Applications:** Submitted directly to university graduate schools, requiring department-specific Statements of Purpose (SOP) and 3 Letters of Recommendation (LOR).\n- **F-1 Student Visa:** Requires issuance of the official Form I-20, SEVIS fee payment, and an in-person visa interview.\n\nWhich academic field and intake term are you targeting in the United States?`,
        suggestedQuestions: [
          'What documents are needed for US universities?',
          'Do I need SAT or GRE scores?',
          'How does the F-1 visa interview work?',
          'Book US Advisory Session'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 6. CANADA ADMISSIONS
    case INTENT_DEFINITIONS.CANADA_ADMISSIONS:
      return {
        intent,
        reply: `To apply to Canadian universities and colleges, you must receive an official **Letter of Acceptance (LOA)** from a Designated Learning Institution (DLI) along with a **Provincial Attestation Letter (PAL)**.\n\n**Application Steps:**\n1. Select your DLI institution and academic program (Fall September or Winter January intake).\n2. Submit certified transcripts, English proficiency test (IELTS Academic, TOEFL, or recognized DET), and Statement of Purpose.\n3. Upon receiving your LOA and PAL, prepare proof of financial support (GIC - Guaranteed Investment Certificate + tuition receipt) for your IRCC Study Permit.\n\nWould you like guidance on specific Canadian universities or the required documentation checklist?`,
        suggestedQuestions: [
          'What documents are required for Canada?',
          'What is a Provincial Attestation Letter (PAL)?',
          'How much proof of funds is needed for Canada?',
          'Book Canadian Admissions Consultation'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 7. AUSTRALIA ADMISSIONS
    case INTENT_DEFINITIONS.AUSTRALIA_ADMISSIONS:
      return {
        intent,
        reply: `Australian universities are renowned for world-class research and generous Post-Study Work Rights (Subclass 485).\n\n- **Key Intakes:** Semester 1 (February) and Semester 2 (July).\n- **Key Requirements:** Genuine Student (GS) assessment, academic transcripts, recognized English proficiency (IELTS/PTE), and evidence of financial capacity.\n- **Confirmation of Enrolment (CoE):** Issued upon tuition deposit payment, which is required for your Student Visa (Subclass 500) application.\n\nWhich Australian state or university ranking tier are you considering?`,
        suggestedQuestions: [
          'What is the Genuine Student requirement?',
          'What English test scores are accepted in Australia?',
          'Book Australian Advisory Session'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 8. EUROPE ADMISSIONS
    case INTENT_DEFINITIONS.EUROPE_ADMISSIONS:
      return {
        intent,
        reply: `We assist students applying to English-taught degree programs across Europe, including Germany, Ireland, France, the Netherlands, and Poland.\n\n- **Germany:** High-quality public universities with low or zero tuition fees. Requires APS certificate verification for Indian applicants and a Blocked Account for visa issuance.\n- **Ireland:** Rapidly growing technology and pharmaceutical hub with a 2-year post-study work permit for Master’s graduates.\n\nWould you like to explore public university options or specific English-taught Master’s degrees?`,
        suggestedQuestions: [
          'How do I apply for tuition-free universities in Germany?',
          'What is the APS certificate requirement?',
          'Explore European Study Programs'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 9. UAE ADMISSIONS
    case INTENT_DEFINITIONS.UAE_ADMISSIONS:
      return {
        intent,
        reply: `Dubai is an international education hub hosting branch campuses of leading British, Australian, and American universities (e.g. Heriot-Watt, University of Wollongong, Middlesex Dubai).\n\n- **Benefits:** Global degree qualification, streamlined student residence visa sponsorship, safe lifestyle, and proximity to regional corporate internships.\n- **Intakes:** September and January intakes across undergraduate and postgraduate streams.\n\nWould you like details on Dubai university campuses and accredited degree programs?`,
        suggestedQuestions: [
          'Which UK universities have campuses in Dubai?',
          'What are the admission requirements for Dubai colleges?',
          'Schedule Dubai Education Advisory'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 10. ACADEMIC DOCUMENT VERIFICATION & CHECKLIST
    case INTENT_DEFINITIONS.ACADEMIC_DOC_VERIFICATION:
      return {
        intent,
        reply: `For international university admissions, you will typically need to prepare the following core documentation dossier:\n\n1. **Academic Transcripts & Certificates:** Marksheets from Class 10, 12, and Bachelor’s degree (with English translations if applicable).\n2. **Valid Passport:** With at least 12 months validity from the program start date.\n3. **Statement of Purpose (SOP):** A well-articulated essay explaining your academic background, career goals, and reasons for choosing the specific university.\n4. **Letters of Recommendation (LOR):** 2 academic references from professors, or 1 academic + 1 employer reference.\n5. **English Proficiency Scorecard:** IELTS Academic, DET, or TOEFL scorecard.\n6. **Updated Academic CV / Resume:** Detailing education, projects, internships, and extracurricular achievements.\n\nOur admissions advisors review and optimize your complete dossier prior to submission. Would you like our team to review your documents?`,
        suggestedQuestions: [
          'Can you review my Statement of Purpose (SOP)?',
          'What English test score do I need?',
          'Book Document Review Consultation'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'International Admissions' }
      };

    // 11. VISA ASSISTANCE
    case INTENT_DEFINITIONS.VISA_ASSISTANCE:
      return {
        intent,
        reply: `The Revival International provides comprehensive **Visa Assistance & Permit Advisory** for students, professionals, and corporate delegates.\n\n**Our Visa Support Covers:**\n- **Student Visas:** UK Student Visa (CAS based), Canada Study Permit (LOA + PAL), USA F-1 Visa (I-20), and Australian Subclass 500.\n- **Documentation Checklist:** Exact financial proof structures, Bank statement audits, Affidavit of support, and TB medical test guidance.\n- **Interview Preparation:** 1-on-1 mock interviews for US Embassy appointments and UK Credibility assessments.\n\n*Important Notice:* Visa issuance is subject to the sole jurisdiction of national immigration authorities. We provide professional filing and documentation assistance to maximize approval prospects.\n\nWhich country’s visa process do you need assistance with?`,
        suggestedQuestions: [
          'How do I apply for a UK student visa?',
          'What financial proof is needed for Canada?',
          'Schedule Visa Advisory Session'
        ],
        offerConsultation: true,
        detectedService: { id: 'visa-assist', title: 'Visa Assistance & Permits' }
      };

    // 12. GCC WORK VISA
    case INTENT_DEFINITIONS.GCC_WORK_VISA:
      return {
        intent,
        reply: `A **UAE employment visa** generally involves an employer-sponsored process governed by the Ministry of Human Resources and Emiratisation (MOHRE) and the General Directorate of Residency and Foreigners Affairs (GDRFA).\n\n**Key Steps in the UAE Work Visa Process:**\n1. **Ministry Offer Letter:** Signed by both employee and hiring employer.\n2. **Entry Permit:** Issued electronically by MOHRE/ICP for entry into the UAE.\n3. **Medical Fitness Examination:** Conducted upon arrival in the UAE (blood screening and chest X-ray).\n4. **Biometrics & Emirates ID:** Registering biometric data at an approved typing/customer happiness center.\n5. **Residency Visa & Labor Contract:** Official residence permit affixed or digitally issued, valid for 2 years.\n\nRequirements depend on applicable UAE regulations and your specific employment situation. I can explain the general process and connect you with our visa assistance team.\n\nAre you currently holding an offer from a UAE employer?`,
        suggestedQuestions: [
          'What documents are needed for Dubai work visa?',
          'How long does the UAE employment visa take?',
          'Do degrees need embassy attestation for UAE?',
          'Connect with Visa Assistance Team'
        ],
        offerConsultation: true,
        detectedService: { id: 'work-permit', title: 'GCC Work Visa Assistance' }
      };

    // 13. DUBAI JOB SEARCH
    case INTENT_DEFINITIONS.DUBAI_JOB_SEARCH:
      return {
        intent,
        reply: `I can guide you through our recruitment services and **Dubai employment opportunities**.\n\n**How Revival International Assists Job Seekers:**\n- **Client Vacancies:** We partner with verified employers across Construction, Healthcare, IT & Cloud, Hospitality, Oil & Gas, and Banking across Dubai and the GCC.\n- **Gulf-Standard CV Optimization:** Aligning your CV with Middle East applicant tracking systems (ATS) and regional recruiter formats.\n- **Tax-Free Compensation Guidance:** Helping you understand realistic salary structures, housing allowances, medical benefits, and end-of-service gratuity.\n\n*Ethical Policy Notice:* In accordance with UAE labor laws, all official recruitment costs and work visa fees are sponsored directly by the hiring employer. We do not sell or guarantee jobs.\n\nTo understand your requirements, could you tell me your educational qualification and the type of job you are looking for in Dubai?`,
        suggestedQuestions: [
          'What qualifications are required for Dubai jobs?',
          'What are the typical salary ranges in Dubai?',
          'Explore Active Vacancies on Revival',
          'Submit CV for Advisory Review'
        ],
        offerConsultation: true,
        detectedService: { id: 'overseas-place', title: 'Dubai Jobs & Career Opportunities' }
      };

    // 14. INTERNATIONAL RECRUITMENT
    case INTENT_DEFINITIONS.INTL_RECRUITMENT:
      return {
        intent,
        reply: `The Revival International provides cross-border **International Recruitment** solutions connecting global enterprises across the GCC (UAE, Saudi Arabia, Qatar, Oman) and Europe with thoroughly vetted professionals.\n\n**Our Capabilities:**\n- Full compliance with overseas labor mobility laws and bilateral recruitment accords.\n- Comprehensive credential authentication (DataFlow, embassy attestation, reference audits).\n- End-to-end mobilization including flight coordination and relocation briefings.\n\nAre you an employer seeking international talent, or a candidate exploring overseas relocation?`,
        suggestedQuestions: [
          'I am an employer looking to hire internationally',
          'I am a candidate seeking overseas jobs',
          'Submit International Hiring Mandate'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-rec', title: 'International Recruitment' }
      };

    // 15. DOMESTIC RECRUITMENT
    case INTENT_DEFINITIONS.DOMESTIC_RECRUITMENT:
      return {
        intent,
        reply: `We can help businesses explore **recruitment solutions**, including permanent staffing, contract staffing, and executive search across key commercial hubs in India.\n\n**Our Industry Practices:**\n- Information Technology, Software & Cloud Engineering\n- Healthcare, Life Sciences & Pharmaceuticals\n- Civil, Infrastructure & Mechanical Engineering\n- Banking, Financial Services & Insurance (BFSI)\n- FMCG, Supply Chain & Retail\n\nCould you tell me which positions you are looking to fill, or would you like to review our recruitment engagement terms?`,
        suggestedQuestions: [
          'I need permanent staffing',
          'Do you provide executive search?',
          'Submit Hiring Mandate',
          'Connect with Recruitment Director'
        ],
        offerConsultation: true,
        detectedService: { id: 'dom-rec', title: 'Domestic Recruitment' }
      };

    // 16. EXECUTIVE SEARCH
    case INTENT_DEFINITIONS.EXEC_SEARCH:
      return {
        intent,
        reply: `**Executive Search** is our retained headhunting practice dedicated to identifying and placing C-Suite executives, Managing Directors, Board Members, and strategic Practice Leaders across India and the GCC.\n\n**Our Executive Methodology:**\n- **Confidential Market Mapping:** Discreetly identifying passive industry leaders.\n- **360-Degree Leadership Assessment:** Evaluating track record, strategic vision, and cultural synergy.\n- **Compensation Structuring:** Facilitating senior equity, performance incentives, and executive packaging.\n\nWould you like to initiate a confidential discussion regarding an executive mandate?`,
        suggestedQuestions: [
          'Initiate Confidential Executive Search',
          'What executive levels do you recruit for?',
          'Speak with Executive Search Director'
        ],
        offerConsultation: true,
        detectedService: { id: 'exec-search', title: 'Executive Search' }
      };

    // 17. PERMANENT STAFFING
    case INTENT_DEFINITIONS.PERM_STAFFING:
      return {
        intent,
        reply: `Our **Permanent Staffing** practice delivers direct-hire recruitment solutions for mid-to-senior technical and commercial roles.\n\n**Key Value for Employers:**\n- Rapid candidate shortlisting (typically within 3–5 business days).\n- Rigorous competency screening and technical validation.\n- Standard 60-to-90 day candidate replacement guarantee.\n- Structured onboarding support to ensure long-term retention.\n\nCould you share the title of the position, target location, and required experience level?`,
        suggestedQuestions: [
          'Submit Permanent Staffing Requirement',
          'What are your recruitment terms and fees?',
          'Schedule Employer Consultation'
        ],
        offerConsultation: true,
        detectedService: { id: 'perm-staff', title: 'Permanent Staffing' }
      };

    // 18. CONTRACT STAFFING
    case INTENT_DEFINITIONS.CONTRACT_STAFFING:
      return {
        intent,
        reply: `**Contract Staffing** provides flexible, project-based workforce augmentation and interim management to support enterprise surges, specialized IT implementations, or technical shutdowns.\n\n**What We Manage:**\n- Pre-vetted specialist deployment (software developers, MEP supervisors, site engineers, finance analysts).\n- Complete payroll processing, statutory benefits, and compliance handling.\n- Scalable agreements ranging from 3 to 24 months.\n\nWhat kind of contract specialists does your project require?`,
        suggestedQuestions: [
          'Request Contract Staffing Proposal',
          'How fast can contract staff be deployed?',
          'Speak with Staffing Specialist'
        ],
        offerConsultation: true,
        detectedService: { id: 'contract-staff', title: 'Contract Staffing' }
      };

    // 19. IELTS PREPARATION
    case INTENT_DEFINITIONS.IELTS_PREP:
      return {
        intent,
        reply: `**IELTS** (International English Language Testing System) is a standardized test of English language proficiency that assesses **Listening, Reading, Writing, and Speaking** skills. It is widely required for international university admissions and migration programs.\n\n**Revival IELTS Coaching Highlights:**\n- **Target Score:** Calibrated specifically to help applicants achieve **Band 7.5+**.\n- **Modules:** Dedicated training for both **IELTS Academic** (study abroad) and **IELTS General Training** (PR & employment).\n- **Structure:** Live interactive sessions, weekly timed full-length mock exams, and personalized 1-on-1 speaking simulations with certified trainers.\n\nWould you like information about our upcoming batch schedules, or would you like to take a free diagnostic baseline test?`,
        suggestedQuestions: [
          'What is the difference between IELTS Academic and General?',
          'What band score is required for UK or Canada?',
          'Book Free IELTS Diagnostic Test',
          'Upcoming Batch Timings'
        ],
        offerConsultation: true,
        detectedService: { id: 'ielts-prep', title: 'IELTS Preparation' }
      };

    // 20. OET PREPARATION
    case INTENT_DEFINITIONS.OET_PREP:
      return {
        intent,
        reply: `Yes, The Revival International provides specialized **OET (Occupational English Test)** coaching designed specifically for healthcare professionals (Doctors, Nurses, Dentists, and Pharmacists) seeking registration in the UK, Ireland, Australia, and New Zealand.\n\n**OET Curriculum Focus:**\n- Real medical communication: Referral letters, discharge summaries, and patient consultation roleplays.\n- Scoring targets: Reaching **Grade B (350+)** required by the UK Nursing and Midwifery Council (NMC) and General Medical Council (GMC).\n- Clinically calibrated mock examinations with experienced medical English examiners.\n\nAre you a Registered Nurse or Doctor preparing for international licensing?`,
        suggestedQuestions: [
          'What score is required for UK NMC registration?',
          'How is OET different from IELTS?',
          'Enroll in OET Healthcare Coaching'
        ],
        offerConsultation: true,
        detectedService: { id: 'oet-prep', title: 'OET Preparation' }
      };

    // 21. DET PREPARATION
    case INTENT_DEFINITIONS.DET_PREP:
      return {
        intent,
        reply: `The **Duolingo English Test (DET)** is a modern, convenient, computer-adaptive English test accepted by over 4,500 universities worldwide, including top institutions in the US, UK, and Canada.\n\n**Key Advantages:**\n- Fast Results: Certified scores delivered within **48 hours**.\n- Convenience: Taken online from home in under 1 hour with webcam and microphone.\n- Revival Strategy Coaching: Targeting scores above **120/160** with subscore mastery across Literacy, Comprehension, Conversation, and Production.\n\nWould you like to book a DET diagnostic evaluation?`,
        suggestedQuestions: [
          'Which universities accept the Duolingo English Test?',
          'How does DET scoring compare to IELTS?',
          'Book DET Fast-Track Coaching'
        ],
        offerConsultation: true,
        detectedService: { id: 'det-prep', title: 'DET Preparation' }
      };

    // 22. TOEFL PREPARATION
    case INTENT_DEFINITIONS.TOEFL_PREP:
      return {
        intent,
        reply: `Yes, we provide specialized coaching for the **TOEFL iBT** (Test of English as a Foreign Language), focusing on academic university communication across Reading, Listening, Speaking, and Writing.\n\nOur curriculum focuses on integrated academic tasks, high-speed academic passage analysis, and structured essay templates targeting scores above **100/120** for US and Canadian graduate programs.\n\nWould you like details on our TOEFL masterclasses and mock exam schedule?`,
        suggestedQuestions: [
          'What is a good TOEFL score for US universities?',
          'How does TOEFL compare with IELTS?',
          'Schedule TOEFL Diagnostic Test'
        ],
        offerConsultation: true,
        detectedService: { id: 'toefl-prep', title: 'TOEFL Preparation' }
      };

    // 23. EXECUTIVE SEMINARS
    case INTENT_DEFINITIONS.EXEC_SEMINARS:
      return {
        intent,
        reply: `**Executive Seminars** at The Revival International are high-impact masterclasses delivered by international business practitioners and corporate authorities.\n\n**Recent Topics Include:**\n- GCC Corporate Tax & Cross-Border Regulatory Compliance\n- Enterprise AI Integration & Operational Scalability\n- Mergers, Acquisitions & Workforce Restructuring in the Gulf\n- Boardroom Governance and Stakeholder Strategy\n\nWould you like details on our upcoming seminar calendar or corporate registrations?`,
        suggestedQuestions: [
          'Upcoming Executive Seminar Dates',
          'Custom Masterclass for Company Leadership',
          'Contact Executive Education Desk'
        ],
        offerConsultation: true,
        detectedService: { id: 'exec-seminars', title: 'Executive Seminars' }
      };

    // 24. LEADERSHIP DEVELOPMENT
    case INTENT_DEFINITIONS.LEADERSHIP_DEV:
      return {
        intent,
        reply: `Yes, The Revival International offers executive development and **corporate leadership training programmes**. These cover transformational leadership, emotional intelligence, strategic decision-making, and cross-cultural management.\n\n**Delivery Formats:**\n- 1-on-1 confidential executive coaching for Directors and C-Suite leaders.\n- Interactive cohort workshops with real-world case simulations.\n\nWould you like to discuss a customized leadership programme for your organisation?`,
        suggestedQuestions: [
          'Request Leadership Programme Proposal',
          'Executive Coaching Engagement Details',
          'Connect with Leadership Advisor'
        ],
        offerConsultation: true,
        detectedService: { id: 'leadership-dev', title: 'Leadership Development' }
      };

    // 25. CORPORATE TRAINING
    case INTENT_DEFINITIONS.CORP_TRAINING:
      return {
        intent,
        reply: `**Corporate Training** at The Revival International delivers customized workforce upskilling programmes tailored to enterprise operational objectives.\n\n**Core Training Domains:**\n- Cross-Cultural Communication for Global Teams\n- Enterprise Sales & Strategic Account Management\n- Operational Compliance & GCC Regulatory Protocols\n- Managerial Productivity & Team Synergy\n\nWe provide on-site workshops in Dubai and India, as well as virtual cohorts. Would you like to request a tailored training needs assessment for your team?`,
        suggestedQuestions: [
          'Request Corporate Training Proposal',
          'What modules can be customized?',
          'Speak with Corporate Training Director'
        ],
        offerConsultation: true,
        detectedService: { id: 'corp-training', title: 'Corporate Training' }
      };

    // 26. ACADEMIC ADVISORY
    case INTENT_DEFINITIONS.ACADEMIC_ADVISORY:
      return {
        intent,
        reply: `**Academic Advisory** provides unbiased, strategic counseling for students and families navigating international educational roadmaps.\n\n**Our Advisory Services:**\n- **School Student Career Guidance:** Psychometric assessments and stream selection roadmaps (Science, Commerce, Humanities) for Grade 8–12 students.\n- **Degree Pathway & ROI Planning:** Evaluating long-term career demand, tuition investments, and university accreditations.\n- **Institutional Shortlisting:** Matching your GPA and budget with universities worldwide.\n\nWould you like to schedule an academic advisory roadmap session?`,
        suggestedQuestions: [
          'Career Guidance for Grade 10 / 12 Students',
          'How do you shortlist universities?',
          'Book an Academic Advisory Session'
        ],
        offerConsultation: true,
        detectedService: { id: 'intl-adm', title: 'Academic Advisory' }
      };

    // 27. APPOINTMENT BOOKING
    case INTENT_DEFINITIONS.APPOINTMENT_BOOKING:
      return {
        intent,
        reply: `I would be pleased to schedule a consultation with our Senior Advisory Team.\n\n**Available Channels:**\n1. **Online Consultation Form:** Click "Book Consultation" below to submit your preferred date, time, and service.\n2. **Direct WhatsApp Advisory:** Connect immediately on official WhatsApp at **+91 9003475405**.\n3. **Direct Telephone:** Speak with our desk at **+91 9003475405** (India) or **+971 4 123 4567** (Dubai).\n\nWould you like me to open the Consultation Booking Form for you?`,
        suggestedQuestions: [
          'Open Consultation Booking Form',
          'Connect on WhatsApp (+91 9003475405)',
          'What services does Revival offer?'
        ],
        offerConsultation: true,
        detectedService: null
      };

    // 28. COMPANY INFO & SERVICES
    case INTENT_DEFINITIONS.COMPANY_INFO:
      return {
        intent,
        reply: `**The Revival International** is a premier global advisory and workforce mobility enterprise headquartered in Dubai (UAE) and India.\n\nWe provide integrated solutions across two core pillars:\n\n1. **Global Education & Academic Advisory**\n   - International Admissions (UK, USA, Canada, Australia, Europe)\n   - Standardized Test Preparation (IELTS, OET, DET, TOEFL)\n   - School Student Career Guidance & Psychometric Assessment\n\n2. **Executive Talent, Recruitment & GCC Mobility**\n   - Dubai & Overseas Career Placements across Healthcare, IT, Construction & Engineering\n   - GCC Work Visa Documentation, Attestation, and MOHRE Compliance\n   - Corporate Staffing (Permanent, Contract, and Retained Executive Search)\n   - Executive Seminars & Corporate Leadership Development\n\nWhich of these areas would you like to explore?`,
        suggestedQuestions: [
          'International Admissions Services',
          'Dubai Job Opportunities',
          'GCC Work Visa Assistance',
          'Recruitment & Staffing Services',
          'IELTS & Language Coaching'
        ],
        offerConsultation: false,
        detectedService: null
      };

    // 29. UNRELATED QUESTIONS
    case INTENT_DEFINITIONS.UNRELATED:
    default:
      return {
        intent,
        reply: `I am the dedicated **Revival AI Advisor** for **The Revival International**. While I specialize in global career placement, university admissions, GCC work visas, and executive recruitment, I am unable to assist with casual or unrelated general topics.\n\nPlease let me know if you have questions regarding:\n- 🎓 Overseas University Admissions & UCAS Guidance\n- 💼 Dubai & GCC Employment Opportunities\n- 🇦🇪 Work Permits & Document Attestation\n- 🤝 Corporate Recruitment & Staffing Mandates\n- 📝 English Language Prep (IELTS, OET, DET, TOEFL)\n\nHow can I help advance your career or education today?`,
        suggestedQuestions: [
          'Explore Dubai Job Opportunities',
          'Learn about International Admissions',
          'Check GCC Work Visa Requirements',
          'IELTS Coaching Details'
        ],
        offerConsultation: false,
        detectedService: null
      };
  }
}

/**
 * Build System Prompt for External AI Models (Gemini / OpenAI)
 */
export function buildSystemPrompt(classifiedIntent, relevantSnippet = '') {
  return `You are "${REVIVAL_BRAND.assistantName}", the official AI advisor for "${REVIVAL_BRAND.name}".
Brand Tagline: "${REVIVAL_BRAND.tagline}"
Headquarters: ${REVIVAL_BRAND.headquarters}
Official Contact: Phone India: ${REVIVAL_BRAND.phoneIndia}, Phone Dubai: ${REVIVAL_BRAND.phoneDubai}, WhatsApp: ${REVIVAL_BRAND.officialWhatsApp}

YOUR ROLE & IDENTITY:
- You are a knowledgeable, courteous, professional, and authoritative AI consultant representing The Revival International.
- You provide accurate, detailed information across all company services: Academic Advisory, Global University Admissions, Dubai & Overseas Jobs, GCC Work Visas, Corporate Recruitment, Executive Search, and Language Preparation (IELTS, OET, DET, TOEFL).
- Speak in clear, well-structured, executive prose. Use markdown bullet points and bold headers where appropriate to keep answers readable.
- ALWAYS answer the user's specific question FIRST.
- NEVER return a generic welcome message as the answer to a question.
- Do NOT repeat greetings if the conversation is already in progress.
- Maintain multi-turn context (e.g. remember destination country, study level, or job role across messages).

CRITICAL ETHICAL & REGULATORY BOUNDARIES:
- NEVER guarantee visa approvals (MOHRE, UKVI, IRCC have exclusive authority).
- NEVER guarantee university admissions (university admissions committees have sole authority).
- NEVER guarantee job placements or specific salary sums (final offers depend on hiring employers and client interviews).
- State clearly that Revival International advisors provide documentation review, profile shortlisting, and application processing.

CURRENT CLASSIFIED INTENT: ${classifiedIntent}
${relevantSnippet ? `\nRELEVANT SERVICE KNOWLEDGE:\n${relevantSnippet}` : ''}
`;
}

/**
 * Call External LLM (Gemini or OpenAI) with system prompt & knowledge context
 */
export async function callExternalLLM(userQuery, conversationHistory = [], classifiedIntent = '', relevantSnippet = '') {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return null;
  }

  const systemInstruction = buildSystemPrompt(classifiedIntent, relevantSnippet);

  // Try Google Gemini First
  if (geminiKey) {
    try {
      const contents = [];

      // Add recent conversation history
      conversationHistory.slice(-6).forEach(msg => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });

      // Add current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: userQuery }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 750
          }
        }),
        signal: AbortSignal.timeout(7000)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          return {
            reply: candidate.trim(),
            provider: 'gemini'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call timed out or failed, using local engine:', err.message);
    }
  }

  // Try OpenAI
  if (openaiKey) {
    try {
      const messages = [
        { role: 'system', content: systemInstruction }
      ];

      conversationHistory.slice(-6).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      messages.push({ role: 'user', content: userQuery });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.25,
          max_tokens: 750
        }),
        signal: AbortSignal.timeout(7000)
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return {
            reply: reply.trim(),
            provider: 'openai'
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI API call timed out or failed, using local engine:', err.message);
    }
  }

  return null;
}

/**
 * Master AI Advisor Request Pipeline
 *
 * Workflow:
 * User Message
 *   ↓ Input Validation
 *   ↓ Conversation Context Retrieval & Entity Extraction
 *   ↓ Intent Detection (29 Intents)
 *   ↓ Relevant Revival Knowledge Retrieval
 *   ↓ AI Response Generation (External LLM or Rich Engine)
 *   ↓ Response Validation
 *   ↓ Return Contextual Payload
 */
export async function handleAIAdvisorQuery({ message, conversationHistory = [], context = {} }) {
  // 1. Input Validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      success: false,
      reply: 'Please provide a valid question or message.',
      suggestedQuestions: ['What services do you provide?', 'I want to study in the UK', 'Dubai Jobs', 'IELTS Coaching']
    };
  }

  const query = message.trim();

  // 2. Extract Entities & Context across Multi-Turn Conversation
  const updatedContext = extractEntities(query, context);

  // 3. Classify Intent across 29 Supported Intents
  const classifiedIntent = classifyIntent(query, updatedContext, conversationHistory);
  updatedContext.intent = classifiedIntent;

  // 4. Generate High-Quality Structured Knowledge Response
  const knowledgeResponse = generateIntentResponse(classifiedIntent, query, updatedContext, conversationHistory);

  // 5. If external LLM is available, query with prompt; otherwise use verified knowledge response
  const externalResult = await callExternalLLM(query, conversationHistory, classifiedIntent, knowledgeResponse.reply);

  if (externalResult && externalResult.reply) {
    return {
      success: true,
      provider: externalResult.provider,
      intent: classifiedIntent,
      reply: externalResult.reply,
      suggestedQuestions: knowledgeResponse.suggestedQuestions,
      offerConsultation: knowledgeResponse.offerConsultation,
      detectedService: knowledgeResponse.detectedService,
      context: updatedContext
    };
  }

  // 6. Return Structured Knowledge Response
  return {
    success: true,
    provider: 'revival-ai-advisor',
    intent: classifiedIntent,
    reply: knowledgeResponse.reply,
    suggestedQuestions: knowledgeResponse.suggestedQuestions,
    offerConsultation: knowledgeResponse.offerConsultation,
    detectedService: knowledgeResponse.detectedService,
    context: updatedContext
  };
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { InternationalAdmissionsForm } from '../components/InternationalAdmissionsForm';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight,
  Calendar, ShieldCheck, Award, FileText, Users, Clock, HelpCircle,
  GraduationCap, Building2, ExternalLink, Send, AlertCircle, Briefcase,
  FileCheck, Landmark, Plane, Layers, ChevronRight, MessageSquare, Check, Sparkles
} from 'lucide-react';

export const InternationalAdmissionsPage = () => {
  const { navigateTo } = useApp();
  const [selectedDestinationKey, setSelectedDestinationKey] = useState('uk');
  const [formPreselectedDestination, setFormPreselectedDestination] = useState('United Kingdom');
  const [selectedIntakeTimeline, setSelectedIntakeTimeline] = useState('fall');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    trackServiceView('intl-adm', 'International Admissions', 'Admissions');
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Section 1: Hero Info Blocks
  const heroInfoBlocks = [
    {
      icon: Globe,
      label: 'Destinations',
      value: 'UK, USA, Canada, Europe, Australia & UAE',
      subtext: 'Global University Application Support'
    },
    {
      icon: Layers,
      label: 'Application Portals',
      value: 'UCAS, Common App & Direct Portals',
      subtext: 'Centralized & Institutional Systems'
    },
    {
      icon: FileCheck,
      label: 'Application Stages',
      value: 'Profile Review to CAS / I-20',
      subtext: 'End-to-End Application Tracking'
    },
    {
      icon: ShieldCheck,
      label: 'Compliance Support',
      value: 'Document Verification & Requirements',
      subtext: 'Institutional & Academic Accuracy'
    }
  ];

  // Section 2: Key Benefits & Service Highlights (4 Cards)
  const keyBenefits = [
    {
      id: '01',
      title: 'Multi-Country University Portals',
      desc: 'Expert guidance across application systems including UCAS for the UK, Common App and Coalition for the US, OUAC for Canada, Uni-Assist for Europe, and direct university portals worldwide.',
      icon: Layers,
      highlights: [
        'UCAS profile configuration, course choice management & deadline tracking',
        'Common App activity lists, institutional supplement prompts & counselor coordination',
        'Canadian provincial portal submissions and direct institutional uploads',
        'European portals (e.g., Uni-Assist) and Australian university direct applications'
      ]
    },
    {
      id: '02',
      title: 'Academic Document Verification & Attestation',
      desc: 'Systematic organization and pre-screening of transcripts, marksheets, degree certificates, certified English translations, and credential evaluations tailored to each destination.',
      icon: FileCheck,
      highlights: [
        'Pre-screening transcripts, provisional certificates & predicted grades',
        'Guidance on certified English translations and evaluation services (WES, ECE)',
        'Notarization, apostille, and Ministry of Foreign Affairs (MOFA) attestation steps',
        'Course syllabus mapping for academic credit transfers and advanced standing'
      ]
    },
    {
      id: '03',
      title: 'CAS & I-20 Compliance Guidance',
      desc: 'Structured application-stage compliance for UK CAS (Confirmation of Acceptance for Studies) and US Form I-20 requirements, with diagnostic credibility interview preparation.',
      icon: ShieldCheck,
      highlights: [
        'UK CAS document readiness audits and academic condition tracking',
        'US Form I-20 financial documentation and affidavit structuring',
        'University credibility interview preparation and diagnostic mock sessions',
        'Transparent boundary between academic admissions and official visa issuance'
      ]
    },
    {
      id: '04',
      title: 'Direct Liaison with Admissions Offices',
      desc: 'Active application follow-ups, clarification of outstanding documents, communication regarding admissions status, and immediate responses to institutional queries.',
      icon: Landmark,
      highlights: [
        'Direct correspondence with university international admissions committees',
        'Expediting conditional offer reviews and document receipt confirmations',
        'Clarifying prerequisite subject requirements and syllabus overlap queries',
        'Managing offer acceptance deadlines and tuition deposit coordination'
      ]
    }
  ];

  // Section 3: International Admissions Process (4-Step Timeline)
  const admissionsProcessSteps = [
    {
      step: '01',
      title: 'Application Planning',
      points: [
        'Review the student’s academic profile, qualifications, and intended course of study.',
        'Identify target institutions, entry benchmarks, and country-specific criteria.',
        'Organize intake deadlines and build an admissions timeline.',
        'Prepare a balanced university shortlist (Aspirational, Target, and Safe).'
      ]
    },
    {
      step: '02',
      title: 'Submission & Portal Management',
      points: [
        'Compile and verify academic records, essays, and letters of recommendation.',
        'Manage submissions across UCAS, Common App, OUAC, or direct portals.',
        'Track submission progress, payment receipts, and portal credentials.',
        'Maintain an organized status checklist for every university application.'
      ]
    },
    {
      step: '03',
      title: 'Offer Evaluation & Condition Clearing',
      points: [
        'Analyze conditional versus unconditional offer letters and scholarship awards.',
        'Clarify outstanding academic, financial, or document conditions.',
        'Coordinate document resubmissions and formal acceptance with admissions offices.',
        'Assist with tuition deposit confirmation and enrollment commitment.'
      ]
    },
    {
      step: '04',
      title: 'Visa & Pre-Departure Coordination',
      points: [
        'Provide a destination-specific visa document checklist and financial guidelines.',
        'Explain CAS and Form I-20 issuance steps following confirmed admission.',
        'Direct students to official government immigration portals for visa filing.',
        'Organize pre-departure orientation, housing guidance, and travel planning.'
      ]
    }
  ];

  // Section 4: Who Can Benefit from Our Admissions Support? (4 Audience Cards)
  const targetAudienceCards = [
    {
      title: 'Undergraduate Applicants',
      badge: 'Bachelor’s Degrees',
      desc: 'High school graduates (CBSE, ISC, A-Levels, IB, American High School) preparing bachelor’s degree applications across world-ranked universities.',
      icon: GraduationCap
    },
    {
      title: 'Postgraduate Applicants',
      badge: 'Master’s & Professional Degrees',
      desc: 'University graduates applying for 1-year UK Master’s, 2-year US/Canadian degrees, or specialized European programs requiring advanced research proposals.',
      icon: Award
    },
    {
      title: 'Multi-Destination Applicants',
      badge: 'Multi-Portal Management',
      desc: 'Students applying simultaneously across multiple countries (e.g., UK + US + Canada) who need coordinated portal management and deadline oversight.',
      icon: Layers
    },
    {
      title: 'Comprehensive Advisory Candidates',
      badge: 'End-to-End Guidance',
      desc: 'Families seeking complete advisory support from early profile diagnostics through offer acceptance, document compliance, and pre-departure briefings.',
      icon: Users
    }
  ];

  // Section 5: Document Checklist (9 Items)
  const documentChecklist = [
    {
      title: 'Official Academic Transcripts & Marksheets',
      desc: 'High school transcripts (Grades 9–12) for undergraduate applicants; semester-wise university transcripts for postgraduate candidates.'
    },
    {
      title: 'Degree Certificates or Provisional Certificates',
      desc: 'Certified bachelor’s degree completion certificate or provisional degree certificate issued by the university registrar.'
    },
    {
      title: 'Valid International Passport',
      desc: 'Clear full-color scan of passport personal information and expiration page with a minimum of 6 to 18 months validity remaining.'
    },
    {
      title: 'English Language Proficiency Scores',
      desc: 'Official score report for IELTS Academic, TOEFL iBT, Pearson PTE Academic, or Duolingo English Test (DET) where mandated.'
    },
    {
      title: 'Statement of Purpose / Personal Statement',
      desc: 'Course-specific personal statement outlining academic motivations, chosen subject interests, and future career objectives.'
    },
    {
      title: 'Academic & Professional Reference Letters (LORs)',
      desc: 'One to three formal reference letters from teachers, professors, or professional managers on official institutional letterhead.'
    },
    {
      title: 'Curriculum Vitae (CV) / Academic Resume',
      desc: 'Comprehensive summary of educational history, co-curricular achievements, internships, research projects, and skills.'
    },
    {
      title: 'Portfolio or Research Proposal (if applicable)',
      desc: 'Creative portfolio for architecture/design, writing sample for humanities, or research proposal for thesis/PhD tracks.'
    },
    {
      title: 'Financial Solvency & Sponsorship Documents',
      desc: 'Bank solvency certificate, sponsorship declaration, or approved educational loan letter for CAS, I-20, or visa processing.'
    }
  ];

  // Section 6: Interactive Application Destination Explorer Data
  const destinationData = {
    'uk': {
      name: 'United Kingdom',
      flagUrl: 'https://flagcdn.com/w40/gb.png',
      badge: 'UCAS & Direct University Portals',
      applicationPortals: 'Centralized UCAS portal for undergraduate applications (maximum 5 course choices) | Direct university admissions portals for postgraduate master’s and PhD programs.',
      typicalDocuments: [
        'Class 10 & 12 official marksheets / Predicted grades',
        'University transcripts & Bachelor’s degree (for Master’s)',
        'UCAS Personal Statement (4,000 characters / 47 lines)',
        'Academic Reference Letter on official school letterhead',
        'Valid Passport and English language scorecard (IELTS/PTE)'
      ],
      planningConsiderations: 'UK applications emphasize strong subject alignment and academic mastery in the chosen discipline. 1-Year accelerated Master’s programs require early submission for rapid turnaround.',
      academicLanguageReqs: 'Undergraduate: CBSE/ISC 75%–90%, A-Levels (AAA to BBC), or IB (30–36 pts). IELTS Academic 6.0–7.0 (CBSE Class 12 English waiver available at select institutions). Postgraduate: 2:1 or 2:2 equivalence (60%–70%).',
      deadlineConsiderations: 'October 15: Oxford, Cambridge, and Medicine/Dentistry/Veterinary. Late January: Equal consideration deadline for most undergraduate courses. Rolling admissions for postgraduate tracks.',
      officialLinks: [
        { label: 'UCAS Official Portal', url: 'https://www.ucas.com' },
        { label: 'Study UK (British Council)', url: 'https://study-uk.britishcouncil.org' },
        { label: 'UK Visas and Immigration (Student Visa)', url: 'https://www.gov.uk/student-visa' }
      ]
    },
    'usa': {
      name: 'United States',
      flagUrl: 'https://flagcdn.com/w40/us.png',
      badge: 'Common App, Coalition & Graduate Portals',
      applicationPortals: 'The Common Application and Coalition Application for undergraduate colleges | Departmental graduate admissions portals for Master’s, STEM, and MBA applications.',
      typicalDocuments: [
        'Official high school transcripts (Grades 9 through 12)',
        'Common App Personal Essay (650 words) + College Supplements',
        'Two to three Letters of Recommendation (Counselor + Teachers)',
        'English proficiency scores (TOEFL / IELTS / DET)',
        'Credential evaluation (e.g. WES) for 3-year bachelor degrees'
      ],
      planningConsiderations: 'Holistic admissions evaluating GPA, essay depth, extracurricular leadership, and community impact. Financial documentation is required prior to Form I-20 issuance.',
      academicLanguageReqs: 'Undergraduate: GPA 3.0+ / 80%+ equivalent; SAT/ACT optional at many universities. TOEFL 80–100+, IELTS 6.5–7.5, or DET 115–130. Graduate: GRE/GMAT for select STEM/MBA tracks.',
      deadlineConsiderations: 'Early Decision / Early Action: November 1–15. Regular Decision: January 1–15. Graduate deadlines range from December through March.',
      officialLinks: [
        { label: 'The Common Application', url: 'https://www.commonapp.org' },
        { label: 'EducationUSA (U.S. Department of State)', url: 'https://educationusa.state.gov' },
        { label: 'U.S. Student Visas (F-1)', url: 'https://travel.state.gov' }
      ]
    },
    'canada': {
      name: 'Canada',
      flagUrl: 'https://flagcdn.com/w40/ca.png',
      badge: 'OUAC & Direct Provincial University Portals',
      applicationPortals: 'Ontario Universities’ Application Centre (OUAC) for Ontario | Direct university portals for British Columbia, Alberta, Quebec, and other provinces.',
      typicalDocuments: [
        'High school transcripts & completion certificates',
        'Bachelor’s transcripts & degree certificate (for PG)',
        'Statement of Intent or Statement of Purpose',
        'Academic Letters of Reference',
        'IELTS Academic (minimum 6.5 with no band below 6.0) or TOEFL'
      ],
      planningConsiderations: 'Strong emphasis on academic percentage and prerequisite courses (e.g., Grade 12 Math for Business/Engineering). Co-op programs require early registration.',
      academicLanguageReqs: 'Undergraduate: 70%–85%+ in Class 12 board examinations. IELTS Academic 6.5 overall. Postgraduate: Minimum 4-year bachelor’s degree with B/B+ average (70%–75%+).',
      deadlineConsiderations: 'Primary Fall intake deadlines range from January 15 to March 1. Select colleges offer January (Winter) intake options.',
      officialLinks: [
        { label: 'OUAC (Ontario Universities)', url: 'https://www.ouac.on.ca' },
        { label: 'EduCanada (Government of Canada)', url: 'https://www.educanada.ca' },
        { label: 'Immigration, Refugees and Citizenship Canada (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' }
      ]
    },
    'australia': {
      name: 'Australia',
      flagUrl: 'https://flagcdn.com/w40/au.png',
      badge: 'Direct University Admissions & State Tiers',
      applicationPortals: 'Direct admissions through university international portals | VTAC (Victoria), UAC (NSW/ACT), and QTAC (Queensland) where applicable.',
      typicalDocuments: [
        'Certified high school marksheets or bachelor’s degree records',
        'IELTS Academic / PTE Academic scorecard',
        'Genuine Student (GS) assessment statement and evidence',
        'Proof of financial capacity and medical cover (OSHC)',
        'Curriculum Vitae for postgraduate study'
      ],
      planningConsiderations: 'Dual major intakes per year: Semester 1 (February) and Semester 2 (July). Clear compliance with the Genuine Student (GS) assessment standard is mandatory.',
      academicLanguageReqs: 'Undergraduate: CBSE/ISC 65%–85% or ATAR equivalent. IELTS Academic 6.0–6.5 (PTE 50–58). Postgraduate: Bachelor’s degree in related discipline with 60%–70%+.',
      deadlineConsiderations: 'Semester 1 (Feb start): Applications close October–November. Semester 2 (July start): Applications close April–May.',
      officialLinks: [
        { label: 'Study Australia (Australian Government)', url: 'https://www.studyaustralia.gov.au' },
        { label: 'Department of Home Affairs (Subclass 500)', url: 'https://immi.homeaffairs.gov.au' }
      ]
    },
    'europe': {
      name: 'Europe',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      badge: 'Uni-Assist & National Higher Education Portals',
      applicationPortals: 'Uni-Assist and Hochschulstart for Germany | Studielink for the Netherlands | Campus France | Direct portals for Ireland, Sweden, and Switzerland.',
      typicalDocuments: [
        'Secondary school leaving certificate & university transcripts',
        'APS Certificate for Indian students applying to Germany',
        'Motivational letter tailored to European institutional formats',
        'Certified English proficiency score (IELTS/TOEFL)',
        'Course syllabus description for credit validation'
      ],
      planningConsiderations: 'Many public European universities offer tuition-free or low-tuition English-taught degrees. APS verification and blocked account setup must be factored into timelines.',
      academicLanguageReqs: 'Undergraduate: 75%–85% in Grade 12 (13 years of schooling or Studienkolleg required in select nations). IELTS 6.5+. Postgraduate: Relevant bachelor’s with ECTS match.',
      deadlineConsiderations: 'Winter Semester (September/October): Deadlines between March 1 and July 15. Summer Semester (March/April): Deadlines in October–January.',
      officialLinks: [
        { label: 'DAAD Germany Study Portal', url: 'https://www.daad.de' },
        { label: 'Studielink Netherlands', url: 'https://www.studielink.nl' },
        { label: 'Study in Europe (European Commission)', url: 'https://europa.eu' }
      ]
    },
    'uae': {
      name: 'United Arab Emirates',
      flagUrl: 'https://flagcdn.com/w40/ae.png',
      badge: 'Branch Campuses & Federal Universities',
      applicationPortals: 'Direct university admissions portals for global branch campuses (e.g., Heriot-Watt Dubai, University of Birmingham Dubai, Wollongong Dubai, Middlesex Dubai, NYU Abu Dhabi).',
      typicalDocuments: [
        'Attested Grade 12 or Bachelor’s transcripts',
        'UAE Ministry of Education (MOE) Equalization Certificate where required',
        'Valid Passport & UAE Resident Visa / Emirates ID (if resident)',
        'English Language Proficiency scorecard (IELTS / EmSAT / TOEFL)',
        'Statement of Purpose and Letters of Recommendation'
      ],
      planningConsiderations: 'Students earn identical UK, Australian, or US degrees while studying in Dubai or Abu Dhabi. Flexible September and January intakes with streamlined visa sponsorships.',
      academicLanguageReqs: 'Undergraduate: CBSE/ISC 65%–80%, A-Levels (BBB to CCD), or IB (28–34 pts). IELTS 6.0 or EmSAT English 1400+. Postgraduate: Recognized bachelor’s degree with GPA 2.5–3.0+.',
      deadlineConsiderations: 'September Intake: Applications open February through August. January Intake: Applications open October through December. Rolling evaluations.',
      officialLinks: [
        { label: 'KHDA Dubai Higher Education', url: 'https://www.khda.gov.ae' },
        { label: 'UAE Ministry of Education', url: 'https://www.moe.gov.ae' }
      ]
    }
  };

  const currentDestination = destinationData[selectedDestinationKey] || destinationData['uk'];

  const handleEnquireDestination = (destName) => {
    trackCtaClick(`Enquire Destination: ${destName}`, 'destination_explorer', 'intl-adm');
    setFormPreselectedDestination(destName);
    scrollToSection('admissions-consultation-booking');
  };

  // Section 7: Application Timeline (7 Stages)
  const timelineStages = [
    {
      num: 1,
      title: 'Initial Profile Review',
      fallDesc: 'Months 14–12 (Jul–Sep): Diagnostic audit of academic transcripts, target course requirements, and language testing schedule.',
      springDesc: 'Months 10–9 (Mar–Apr): Fast-track profile appraisal and selection of spring-eligible programs across target countries.',
      summerDesc: 'Months 8–7 (Oct–Nov): Accelerated eligibility review for summer diploma, foundation, and direct university pathways.'
    },
    {
      num: 2,
      title: 'University Shortlisting',
      fallDesc: 'Months 12–10 (Oct–Dec): Curating a 3-tier shortlist of Aspirational, Target, and Safe institutions based on entry standards.',
      springDesc: 'Months 8–7 (May–Jun): Selecting universities offering January/February semester intakes with compatible course modules.',
      summerDesc: 'Months 6–5 (Dec–Jan): Finalizing specialized summer term institutions and matching prerequisite course benchmarks.'
    },
    {
      num: 3,
      title: 'Document Preparation',
      fallDesc: 'Months 10–8 (Dec–Feb): Drafting personal statements, compiling transcripts, obtaining LORs, and scheduling language tests.',
      springDesc: 'Months 7–6 (Jun–Jul): Finalizing Statements of Purpose, securing academic references, and completing credential translations.',
      summerDesc: 'Months 5–4 (Jan–Feb): Compiling certified marksheets, CV, letters of recommendation, and verified test scorecards.'
    },
    {
      num: 4,
      title: 'Application Submission',
      fallDesc: 'Months 8–6 (Feb–Apr): Submitting portal applications (UCAS, Common App, OUAC, direct portals) ahead of priority deadlines.',
      springDesc: 'Months 5–4 (Aug–Sep): Submitting early spring admission dossiers and monitoring institutional application portal receipts.',
      summerDesc: 'Months 4–3 (Feb–Mar): Priority direct application submission and document portal uploads for summer semester cohorts.'
    },
    {
      num: 5,
      title: 'Offer Evaluation',
      fallDesc: 'Months 6–4 (Apr–Jun): Reviewing conditional and unconditional offer letters, comparing scholarship grants, and selecting choices.',
      springDesc: 'Months 4–3 (Sep–Oct): Evaluating admission responses, reviewing condition requirements, and finalizing primary offer acceptance.',
      summerDesc: 'Months 3–2 (Mar–Apr): Reviewing offers, confirming enrollment commitments, and submitting seat confirmation documentation.'
    },
    {
      num: 6,
      title: 'Admission Documentation (CAS & I-20)',
      fallDesc: 'Months 4–2 (Jun–Jul): Clearing academic conditions, paying tuition deposits, and obtaining UK CAS or US Form I-20 documentation.',
      springDesc: 'Months 2–1 (Nov–Dec): Clearing institutional conditions, completing financial solvency checks, and securing enrollment certificates.',
      summerDesc: 'Month 2–1 (Apr–May): Finalizing tuition deposit transfers, clearing admissions conditions, and obtaining official acceptance letters.'
    },
    {
      num: 7,
      title: 'Pre-Departure Preparation',
      fallDesc: 'Months 2–1 (Jul–Aug): Destination visa application filing, biometrics appointment, accommodation booking, and travel briefings.',
      springDesc: 'Month 1 (Dec–Jan): Student visa processing, health insurance coordination, student housing confirmation, and travel logistics.',
      summerDesc: 'Month 1 (May–Jun): Priority visa filing, international medical insurance, flight bookings, and pre-departure orientation.'
    }
  ];

  // Section 10: Frequently Asked Questions (10 Exact Questions from Prompt)
  const faqs = [
    {
      q: 'Which countries can I apply to?',
      a: 'Through The Revival International, you can apply to leading universities across the United Kingdom, United States, Canada, Australia, Europe (including Germany, Ireland, the Netherlands, and France), and the United Arab Emirates (including premier international branch campuses in Dubai and Abu Dhabi).'
    },
    {
      q: 'Can I apply to multiple universities?',
      a: 'Yes. Our advisors help you coordinate applications across multiple institutions and countries simultaneously. For example, in the UK you can select up to 5 courses via UCAS, in the US you can apply to multiple universities through Common App, and across Canada, Europe, Australia, and the UAE we coordinate direct university portal submissions.'
    },
    {
      q: 'What documents are required?',
      a: 'Standard documents include official academic transcripts and marksheets (Grades 9–12 for UG, semester transcripts for PG), degree/provisional certificates, valid passport scan, English language proficiency scores (IELTS, TOEFL, PTE, or Duolingo), a Statement of Purpose or personal statement, academic/professional reference letters (LORs), and an updated CV. Additional requirements like portfolios or research proposals apply to specific disciplines.'
    },
    {
      q: 'Do you provide UCAS and Common App assistance?',
      a: 'Yes. We provide complete end-to-end guidance for centralized application portals. For UCAS, we guide you through profile setup, course code selection, personal statement formatting (4,000 characters), and teacher reference tracking. For the US Common App, we assist with activity lists, personal essays (650 words), college supplements, and counselor recommendations.'
    },
    {
      q: 'Can you help with university shortlisting?',
      a: 'Absolutely. We utilize a structured 3-tier shortlisting methodology based on your academic GPA, test scores, intended career path, budget, and geographic preferences: Aspirational (Reach), Target (Realistic), and Safe (High-Probability) institutions.'
    },
    {
      q: 'What is a conditional offer?',
      a: 'A conditional offer means the university has reserved a seat for you provided you fulfill specific academic or administrative requirements before enrollment—such as achieving specified final board exam marks, submitting a verified English language score, or providing attested degree certificates. Once met, the university converts it into an unconditional offer.'
    },
    {
      q: 'Can you help with CAS and I-20 documentation?',
      a: 'Yes. We guide you through the institutional paperwork necessary to obtain your UK CAS (Confirmation of Acceptance for Studies) or US Form I-20. This includes pre-CAS document audits, financial affidavit verification, proof of funds checking, and mock credibility interview preparation.'
    },
    {
      q: 'Do you provide post-admission support?',
      a: 'Yes. Our admissions advisory extends beyond receiving your offer letter. We guide you through tuition deposit deadlines, on-campus and private accommodation selection, destination-specific visa document checklists, health insurance requirements, and comprehensive pre-departure orientations.'
    },
    {
      q: 'Can I book an online consultation?',
      a: 'Yes. You can schedule a 1-on-1 virtual consultation via Google Meet or Zoom, or request a consultation via WhatsApp or direct phone call. Select your preferred date, time slot, and mode using our consultation booking form on this page.'
    },
    {
      q: 'Do you guarantee admission or visa approval?',
      a: 'No ethical consultancy guarantees admission or visa approval. Final admissions decisions rest entirely with university admissions committees based on their independent criteria, and visa issuance is governed solely by the sovereign immigration authorities of the destination country. We ensure your application is professionally prepared, verified, and positioned for maximum competitive advantage.'
    }
  ];

  // Related Academic Advisory Services
  const relatedServices = [
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Strategy',
      desc: 'Strategic study destination comparison, academic profile diagnostics, and long-term education roadmap planning.',
      path: 'international-consulting'
    },
    {
      id: 'college-adm',
      title: 'College Admission Assistance',
      badge: 'Undergraduate',
      desc: 'End-to-end guidance for undergraduate college admissions, campus branches, and stream selection.',
      path: 'education-college-adm'
    },
    {
      id: 'school-career',
      title: 'School Student Career Guidance',
      badge: 'Foundation',
      desc: 'Aptitude mapping, stream selection, and scientific career profiling for secondary and high school students.',
      path: 'education-school-career'
    },
    {
      id: 'exec-seminars-lang',
      title: 'Seminars & Language Preparation',
      badge: 'Executive & Tests',
      desc: 'Executive development seminars and structured preparation modules for IELTS, OET, DET, and TOEFL.',
      path: 'education-exec-seminars-lang'
    },
    {
      id: 'school-academy',
      title: 'Academy for School Students',
      badge: 'Enrichment',
      desc: 'Holistic academic enrichment cohorts, study skills development, and extracurricular profile-building.',
      path: 'education-school-academy'
    }
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'International Admissions Support & University Applications',
      'serviceType': 'Global University Application Management & Admissions Advisory',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'The Revival International Academic Advisory',
        'url': 'https://www.revivalinternational.com/education/international-admissions',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressRegion': 'Dubai',
          'addressCountry': 'AE'
        }
      },
      'description': 'From navigating UCAS in the UK and Common App in the United States to managing direct university applications in Canada, Europe, and Australia, The Revival International supports students throughout the international admissions process.',
      'areaServed': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'India', 'Global']
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    }
  ];

  return (
    <div className="bg-white text-slate-800">
      <EducationSEO
        title="International Admissions | Global University Applications & Compliance – The Revival International"
        description="Comprehensive university admissions consultancy for the UK, USA, Canada, Australia, Europe, and UAE. UCAS, Common App, document verification, CAS/I-20 compliance, and consultation booking."
        canonicalPath="education/international-admissions"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Services', item: '/services' },
          { name: 'International Admissions', item: '/education/international-admissions' }
        ]}
        structuredData={structuredData}
      />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-white border-b border-gray-200/80">
        {/* Subtle Architectural Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#102A43_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
            <button 
              onClick={() => navigateTo('home')} 
              className="hover:text-[#102A43] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button 
              onClick={() => navigateTo('services')} 
              className="hover:text-[#102A43] transition-colors cursor-pointer"
            >
              Services
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#C6A45C] font-semibold">International Admissions</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading, Subheading, Description, CTAs (Exact 1:1 match with Image 1) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Small Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102A43]/5 border border-[#102A43]/15 text-[#102A43] text-xs font-bold tracking-widest uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A45C]" />
                <span>INTERNATIONAL ADMISSIONS ADVISORY</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#102A43] tracking-tight leading-[1.15]">
                International Admissions
              </h1>

              {/* Subheading in Gold */}
              <p className="text-xl sm:text-2xl font-medium text-[#C6A45C] leading-snug">
                Strategic Global Education Advisory & Destination Planning
              </p>

              {/* Description */}
              <p className="text-[#475569] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Navigate international education opportunities with personalized guidance on university selection, admission requirements, scholarships, financial planning, and global study destinations.
              </p>

              {/* Primary & Secondary CTAs (Navy button with gold arrow + white button with gold compass) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    trackCtaClick('hero_book_free_consultation', 'International Admissions');
                    scrollToSection('admissions-consultation-booking');
                  }}
                  className="px-8 py-4 rounded-xl bg-[#102A43] hover:bg-[#1a3d60] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A45C]" />
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('hero_explore_admissions_process', 'International Admissions');
                    scrollToSection('destination-explorer');
                  }}
                  className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-[#102A43] border border-gray-300 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#C6A45C]" />
                  <span>Explore Study Destinations</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#64748B] font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> 100% Confidential
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> Objective Advisory
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> Top Global Corridors
                </span>
              </div>
            </div>

            {/* Right Column: International Campus Image & Floating Card (Exact 1:1 match with Image 1) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100 group">
                <img
                  src="/images/international_campus.jpg"
                  alt="International University Campus Architecture"
                  className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Card: Trusted Mentorship */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-6 sm:-left-6 bg-white text-[#102A43] rounded-xl p-4 sm:p-5 shadow-2xl border border-gray-200 flex items-center gap-4 max-w-[320px]">
                <div className="w-12 h-12 rounded-lg bg-[#102A43] text-[#C6A45C] flex items-center justify-center shrink-0 shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Trusted Mentorship
                  </div>
                  <div className="text-sm font-bold text-[#102A43] leading-snug">
                    Personalized Global Education Advisory
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: KEY BENEFITS & SERVICE HIGHLIGHTS (4 Cards)                    */}
      {/* ========================================================================= */}
      <section id="key-benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Admissions Excellence
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Key Benefits & Service Highlights
            </h2>
            <p className="text-sm text-gray-600">
              Rigorous portal management, verified document compliance, and direct university liaison across major international study corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.id}
                  className="rounded-2xl p-8 bg-white border border-gray-200/80 hover:border-[#C6A45C] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-[#C6A45C]/10 text-[#C6A45C] flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#C6A45C]">
                        #{benefit.id}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#102A43]">
                      {benefit.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {benefit.desc}
                    </p>

                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Core Deliverables:
                      </span>
                      <ul className="space-y-1.5">
                        {benefit.highlights.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A45C] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => scrollToSection('admissions-consultation-booking')}
                      className="text-xs font-bold text-[#C6A45C] hover:text-[#b5934b] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Consult with Admissions Specialist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: INTERNATIONAL ADMISSIONS PROCESS (4-Step Timeline)             */}
      {/* ========================================================================= */}
      <section id="admissions-process-section" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Proven Methodology
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              International Admissions Process
            </h2>
            <p className="text-sm text-gray-600">
              A structured 4-stage advisory workflow engineered for transparent tracking, high document readiness, and timely application submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {admissionsProcessSteps.map((stepItem) => (
              <div 
                key={stepItem.step}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative space-y-4 hover:border-[#C6A45C] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#102A43] text-[#C6A45C] font-black text-sm flex items-center justify-center font-mono shadow-md">
                  {stepItem.step}
                </div>

                <h3 className="font-serif text-lg font-bold text-[#102A43]">
                  {stepItem.title}
                </h3>

                <ul className="space-y-2 text-xs text-gray-600">
                  {stepItem.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#C6A45C] font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => scrollToSection('admissions-consultation-booking')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#102A43] hover:bg-[#1c3d5a] text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <span>Start Your Application Process</span>
              <ArrowRight className="w-4 h-4 text-[#C6A45C]" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: WHO CAN BENEFIT FROM OUR ADMISSIONS SUPPORT? (4 Cards)         */}
      {/* ========================================================================= */}
      <section id="who-benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Target Candidates
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Who Can Benefit from Our Admissions Support?
            </h2>
            <p className="text-sm text-gray-600">
              Tailored application tracks for secondary school leavers, postgraduate aspirants, and complex multi-destination applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudienceCards.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-white border border-gray-200 hover:border-[#C6A45C] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C6A45C]/10 text-[#C6A45C] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-[#102A43] uppercase">
                      {aud.badge}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#102A43]">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {aud.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      onClick={() => scrollToSection('admissions-consultation-booking')}
                      className="text-xs font-bold text-[#C6A45C] hover:text-[#b5934b] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Schedule Admissions Call</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 max-w-4xl mx-auto">
            <span className="font-bold text-[#102A43]">Institutional Variance Notice: </span>
            <span>
              Eligibility, academic benchmarks, language thresholds, and credential verification procedures vary significantly between institutions, departments, and destination countries. Our senior counselors evaluate your academic background against the latest verified admissions criteria of your target universities.
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: INTERNATIONAL ADMISSIONS DOCUMENT CHECKLIST (9 Items)          */}
      {/* ========================================================================= */}
      <section id="document-checklist" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Preparation Roadmap
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              International Admissions Document Checklist
            </h2>
            <p className="text-sm text-gray-600">
              Essential academic, language, and identification credentials required across international university portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentChecklist.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-2 hover:border-[#C6A45C] transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C] shrink-0 mt-0.5" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#102A43] leading-snug">
                    {doc.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 pl-6 leading-relaxed">
                  {doc.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 max-w-4xl mx-auto text-center">
            <span className="font-bold text-[#102A43]">Customized Checklist Note: </span>
            <span>
              Requirements differ by course, degree level, and university. Not every applicant requires all items. Your assigned admissions advisor will provide a tailored checklist specific to your chosen institutions.
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: INTERACTIVE APPLICATION DESTINATION EXPLORER (6 Countries)     */}
      {/* ========================================================================= */}
      <section id="destination-explorer" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Destination Systems
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Interactive Application Destination Explorer
            </h2>
            <p className="text-sm text-gray-600">
              Select a target destination below to inspect specific application portals, required documentation, planning considerations, academic benchmarks, and official university portals.
            </p>
          </div>

          {/* 6 Country Selection Tabs with Real FlagCDN Icons */}
          <div className="flex flex-wrap justify-center gap-2.5 p-2 bg-gray-100 rounded-2xl max-w-4xl mx-auto mb-10 border border-gray-200">
            {[
              { key: 'uk', label: 'United Kingdom', flagUrl: 'https://flagcdn.com/w40/gb.png' },
              { key: 'usa', label: 'United States', flagUrl: 'https://flagcdn.com/w40/us.png' },
              { key: 'canada', label: 'Canada', flagUrl: 'https://flagcdn.com/w40/ca.png' },
              { key: 'australia', label: 'Australia', flagUrl: 'https://flagcdn.com/w40/au.png' },
              { key: 'europe', label: 'Europe', flagUrl: 'https://flagcdn.com/w40/eu.png' },
              { key: 'uae', label: 'United Arab Emirates', flagUrl: 'https://flagcdn.com/w40/ae.png' }
            ].map(dest => (
              <button
                key={dest.key}
                onClick={() => setSelectedDestinationKey(dest.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedDestinationKey === dest.key
                    ? 'bg-[#102A43] text-white shadow-md'
                    : 'text-gray-700 hover:text-[#102A43] hover:bg-white/80'
                }`}
              >
                <img 
                  src={dest.flagUrl} 
                  alt={dest.label}
                  className="w-5 h-3.5 object-cover rounded-sm shadow-xs" 
                />
                <span>{dest.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Destination Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl space-y-8">
            
            {/* Header of Active Tab */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentDestination.flagUrl} 
                    alt={currentDestination.name}
                    className="w-8 h-5.5 object-cover rounded shadow-xs" 
                  />
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#102A43]">
                    {currentDestination.name}
                  </h3>
                </div>
                <p className="text-xs font-bold text-[#C6A45C]">
                  {currentDestination.badge}
                </p>
              </div>

              <button
                onClick={() => handleEnquireDestination(currentDestination.name)}
                className="px-6 py-3 bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enquire About Admissions in {currentDestination.name}</span>
              </button>
            </div>

            {/* 2-Column Responsive Information Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Column 1: Application Portals & Required Documents */}
              <div className="space-y-6">
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-[#102A43] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C6A45C]" />
                    <span>Common Application Methods & Portals</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDestination.applicationPortals}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-bold text-[#102A43] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#C6A45C]" />
                    <span>Typical Document Requirements</span>
                  </h4>
                  <ul className="space-y-2">
                    {currentDestination.typicalDocuments.map((doc, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A45C] shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-[#102A43] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C6A45C]" />
                    <span>General Planning Considerations</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDestination.planningConsiderations}
                  </p>
                </div>

              </div>

              {/* Column 2: Academic Requirements, Deadlines & Official Links */}
              <div className="space-y-6">
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-[#102A43] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C6A45C]" />
                    <span>Academic & Language Benchmarks</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDestination.academicLanguageReqs}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-[#102A43] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C6A45C]" />
                    <span>Important Deadline Considerations</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDestination.deadlineConsiderations}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Official University & Portal Resources:
                  </h4>
                  <div className="space-y-2">
                    {currentDestination.officialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-gray-50 hover:bg-[#C6A45C]/10 border border-gray-200 text-xs font-bold text-[#102A43] hover:text-[#C6A45C] flex items-center justify-between transition group"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C6A45C] transition" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Enquire Action */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Admissions requirements differ between universities and specific course tracks. Our advisors provide individualized guidelines for your shortlist.
              </p>
              <button
                onClick={() => handleEnquireDestination(currentDestination.name)}
                className="w-full sm:w-auto px-7 py-3 bg-[#102A43] hover:bg-[#1c3d5a] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-[#C6A45C]" />
                <span>Enquire About Admissions in {currentDestination.name}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: APPLICATION TIMELINE & DEADLINE PLANNING (3 Intakes)           */}
      {/* ========================================================================= */}
      <section id="application-timeline" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Milestone Strategy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Application Timeline & Deadline Planning
            </h2>
            <p className="text-sm text-gray-600">
              A 7-stage roadmap from initial profile review to visa coordination. Select an intended intake below to view tailored milestone windows.
            </p>
          </div>

          {/* Intake Selector Toggle Buttons */}
          <div className="flex justify-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 max-w-md mx-auto mb-10 shadow-sm">
            {[
              { key: 'fall', label: 'Fall Intake (Primary)' },
              { key: 'spring', label: 'Spring Intake' },
              { key: 'summer', label: 'Summer Intake' }
            ].map(intake => (
              <button
                key={intake.key}
                onClick={() => setSelectedIntakeTimeline(intake.key)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedIntakeTimeline === intake.key
                    ? 'bg-[#102A43] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#102A43]'
                }`}
              >
                {intake.label}
              </button>
            ))}
          </div>

          {/* 7 Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timelineStages.map((stage) => {
              let stageText = stage.fallDesc;
              if (selectedIntakeTimeline === 'spring') stageText = stage.springDesc;
              if (selectedIntakeTimeline === 'summer') stageText = stage.summerDesc;

              return (
                <div
                  key={stage.num}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#C6A45C] transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-[#102A43] text-[#C6A45C] font-black text-xs flex items-center justify-center font-mono">
                        0{stage.num}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">
                        Stage {stage.num} of 7
                      </span>
                    </div>

                    <h4 className="font-serif text-sm font-bold text-[#102A43] leading-snug">
                      {stage.title}
                    </h4>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {stageText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 max-w-4xl mx-auto text-center">
            <span className="font-bold text-[#102A43]">Planning Period Notice: </span>
            <span>
              Universal cutoffs do not exist across all international universities. The planning windows shown above represent realistic benchmarks. Specific institutional deadlines are communicated upon university shortlisting.
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: ADMISSIONS & COMPLIANCE NOTICE                                 */}
      {/* ========================================================================= */}
      <section id="compliance-notice" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-amber-900 uppercase tracking-wide">
                Admissions & Compliance Notice
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                The Revival International provides professional admissions guidance, document verification assistance, and application portal coordination. We do not promise, guarantee, or influence university admission offers, Confirmation of Acceptance for Studies (CAS), Form I-20 issuance, or student visas. Final admission decisions rest exclusively with the respective university admissions committees, and visa decisions remain under the sovereign jurisdiction of the destination country’s immigration authorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: INTERNATIONAL ADMISSIONS CONSULTATION FORM                     */}
      {/* ========================================================================= */}
      <section id="admissions-consultation-booking" className="py-20 bg-[#F7F9FC] border-t border-gray-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Schedule An Advisory Session
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Book Your Admissions Consultation
            </h2>
            <p className="text-sm text-gray-600">
              Submit your academic profile below to connect with a senior admissions counselor for customized university shortlisting and application planning.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-gray-200 shadow-xl">
            <InternationalAdmissionsForm
              embedded={true}
              preselectedDestination={formPreselectedDestination}
              onDestinationChange={(newDest) => {
                const matchedKey = Object.keys(destinationData).find(
                  k => destinationData[k].name.toLowerCase() === newDest.toLowerCase()
                );
                if (matchedKey) setSelectedDestinationKey(matchedKey);
              }}
            />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: FREQUENTLY ASKED QUESTIONS (10 Accordion Items)               */}
      {/* ========================================================================= */}
      <section id="faq-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[#C6A45C] font-semibold text-xs tracking-wider uppercase">
              Got Questions?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102A43]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600">
              Authoritative answers to common questions regarding multi-country applications, entry benchmarks, and our admissions advisory services.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  aria-expanded={openFaqIndex === idx}
                  className="w-full text-left p-5 flex justify-between items-center text-sm font-bold text-[#102A43] hover:text-[#C6A45C] transition focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#C6A45C] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#C6A45C] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* RELATED ACADEMIC ADVISORY SERVICES                                        */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-8 pb-3 border-b border-gray-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C6A45C]">
                Explore Services
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#102A43]">
                Related Academic Advisory Services
              </h3>
            </div>
            <button
              onClick={() => navigateTo('services')}
              className="text-xs font-bold text-[#C6A45C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {relatedServices.map((rel) => (
              <div
                key={rel.id}
                className="bg-white border border-gray-200 p-5 rounded-2xl space-y-3 hover:border-[#C6A45C] transition flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#C6A45C]/10 text-[#C6A45C] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {rel.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">#{rel.id}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#102A43] leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {rel.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigateTo(rel.path)}
                    className="text-xs font-bold text-[#C6A45C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 11: FINAL CONVERSION CTA BANNER                                   */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#102A43] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C6A45C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#C6A45C]/20 text-[#C6A45C] border border-[#C6A45C]/30">
            Start Your Admissions Journey
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Your Global Education Journey Starts Here.
          </h2>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Connect with our senior international university admissions counselors today to plan your multi-portal university applications, verify academic documentation, and receive dedicated admission guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                trackCtaClick('final_cta_book_free_consultation', 'International Admissions');
                scrollToSection('admissions-consultation-booking');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20would%20like%20to%20enquire%20about%20International%20Admissions%20support."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCtaClick('final_cta_whatsapp', 'International Admissions')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Consultation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#C6A45C]" /> 100% Confidential
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#C6A45C]" /> Direct University Portals
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#C6A45C]" /> Verified Admissions Advisors
            </span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InternationalAdmissionsPage;

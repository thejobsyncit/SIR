import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { InternationalAdmissionsForm } from '../components/InternationalAdmissionsForm';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Calendar, ShieldCheck, Award, FileText, Users, DollarSign, Clock, HelpCircle,
  Sparkles, GraduationCap, Building2, ExternalLink, MapPin, Check, BookOpen, Send,
  AlertCircle, Briefcase, FileCheck, Landmark, Plane, BadgeCheck, Layers, FileSignature
} from 'lucide-react';

export const InternationalAdmissionsPage = () => {
  const { navigateTo } = useApp();
  const [selectedDestinationKey, setSelectedDestinationKey] = useState('uk');
  const [formPreselectedDestination, setFormPreselectedDestination] = useState('United Kingdom');
  const [selectedIntakeTimeline, setSelectedIntakeTimeline] = useState('fall');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    trackServiceView('intl-adm', 'International Admissions', 'Admissions');
  }, []);

  // Section 1: Hero Info Blocks
  const heroInfoBlocks = [
    {
      icon: Globe,
      label: 'Destinations',
      value: 'UK, USA, Canada, Europe, Australia and UAE',
      subtext: 'Global University Application Support'
    },
    {
      icon: Layers,
      label: 'Application Portals',
      value: 'UCAS, Common App and Direct Applications',
      subtext: 'Centralized & Institutional Systems'
    },
    {
      icon: FileSignature,
      label: 'Application Stages',
      value: 'Application Preparation to CAS / I-20',
      subtext: 'End-to-End Application Tracking'
    },
    {
      icon: ShieldCheck,
      label: 'Compliance Support',
      value: 'Document Verification and Application Requirements',
      subtext: 'Institutional & Document Accuracy'
    }
  ];

  // Section 2: Key Benefits & Service Highlights (4 Cards)
  const keyBenefits = [
    {
      id: '01',
      title: 'Multi-Country University Portals',
      desc: 'Provide guidance on application systems, including UCAS for the UK, Common App and other applicable US application platforms, OUAC for Ontario, Canada, and direct university applications where required.',
      icon: Layers,
      highlights: [
        'UCAS profile setup, personal statement review, and course choice management',
        'Common App activity lists, institutional supplement prompts, and counselor forms',
        'OUAC and Canadian provincial portal management and direct uploads',
        'European university portals (e.g. Uni-Assist) and Australian direct admissions'
      ]
    },
    {
      id: '02',
      title: 'Academic Document Verification & Attestation',
      desc: 'Help students organize transcripts, marksheets, certificates, translations, and other documents required by their chosen institutions. Explain verification and attestation requirements where applicable.',
      icon: FileCheck,
      highlights: [
        'Pre-screening transcripts, provisional certificates, and predicted grade cards',
        'Guidance on certified English translations and credential evaluation (e.g. WES, ECE)',
        'Notarization, apostille, and Ministry of Foreign Affairs (MOFA) attestation steps',
        'Course syllabus mapping for credit transfers and advanced standing'
      ]
    },
    {
      id: '03',
      title: 'CAS and I-20 Compliance Guidance',
      desc: 'Provide application-stage guidance for UK CAS-related processes and US I-20 requirements, subject to university decisions and the applicable rules. Clearly distinguish admissions support from the final decisions made by universities and immigration authorities.',
      icon: ShieldCheck,
      highlights: [
        'UK Confirmation of Acceptance for Studies (CAS) document readiness audits',
        'US Form I-20 financial documentation and affidavit structuring',
        'University credibility interview preparation and diagnostic mock sessions',
        'Clear distinction between academic admissions and official visa issuance'
      ]
    },
    {
      id: '04',
      title: 'Direct Liaison with Admissions Offices',
      desc: 'Support application follow-ups, clarification of outstanding documents, communication regarding application status, and responses to additional requirements from institutions.',
      icon: Landmark,
      highlights: [
        'Direct email correspondence with university international admissions teams',
        'Expediting conditional offer reviews and document receipt confirmations',
        'Clarifying prerequisite subject requirements or syllabus overlap queries',
        'Managing offer acceptance deadlines and tuition deposit coordination'
      ]
    }
  ];

  // Section 3: International Admissions Process (4 Steps)
  const admissionsProcessSteps = [
    {
      step: '01',
      title: 'Application Planning',
      points: [
        'Review the student’s academic profile and intended course.',
        'Identify suitable institutions and entry requirements.',
        'Organize application deadlines and intake preferences.',
        'Prepare a university application shortlist.'
      ]
    },
    {
      step: '02',
      title: 'Submission & Portal Management',
      points: [
        'Help prepare application information and supporting documents.',
        'Provide guidance on UCAS, Common App, OUAC, or direct application portals, as applicable.',
        'Track submission progress and outstanding requirements.',
        'Maintain an organized application checklist.'
      ]
    },
    {
      step: '03',
      title: 'Offer Evaluation & Condition Clearing',
      points: [
        'Help students understand conditional and unconditional offers.',
        'Explain outstanding academic or document conditions.',
        'Organize next steps based on the university’s instructions.',
        'Support communication with admissions offices when clarification is required.'
      ]
    },
    {
      step: '04',
      title: 'Visa & Pre-Departure Coordination',
      points: [
        'Provide a destination-specific document checklist.',
        'Explain the next steps following admission and relevant institutional documentation.',
        'Help organize pre-departure preparation.',
        'Direct students to official sources for current visa and immigration requirements.'
      ]
    }
  ];

  // Section 4: Who Can Benefit from Our Admissions Support? (4 Audience Cards)
  const targetAudienceCards = [
    {
      title: 'Undergraduate Applicants',
      badge: 'Bachelor’s Degrees',
      desc: 'Students completing Grade 12 or equivalent who are preparing for bachelor’s degree applications across international universities and regional branch campuses.',
      icon: GraduationCap
    },
    {
      title: 'Postgraduate Applicants',
      badge: 'Master’s & Professional',
      desc: 'Graduates applying for master’s degrees, professional programs, or research opportunities requiring rigorous academic portfolios and specialized essays.',
      icon: BookOpen
    },
    {
      title: 'Students Applying to Multiple Universities',
      badge: 'Multi-Portal Management',
      desc: 'Applicants who need help coordinating different application portals, diverse document formats, and varying intake deadlines across multiple countries.',
      icon: Layers
    },
    {
      title: 'Students Requiring End-to-End Guidance',
      badge: 'Comprehensive Support',
      desc: 'Applicants seeking structured support from initial planning through offer evaluation, condition clearing, and pre-departure preparation.',
      icon: Users
    }
  ];

  // Section 5: Document Checklist (9 Items)
  const documentChecklist = [
    {
      title: 'Official academic transcripts and marksheets',
      desc: 'High school transcripts (Grades 9–12) for undergraduate applicants; semester-wise university transcripts for postgraduate candidates.'
    },
    {
      title: 'Degree certificates or provisional certificates, where applicable',
      desc: 'Certified bachelor’s degree completion certificate or provisional degree certificate issued by the registrar.'
    },
    {
      title: 'Valid passport',
      desc: 'Clear full-color scan of international passport personal information and expiration page with minimum 6 to 18 months validity.'
    },
    {
      title: 'English language proficiency scores, if required',
      desc: 'Official scorecard for IELTS Academic, TOEFL iBT, Pearson PTE Academic, or Duolingo English Test (DET) where mandated by the course.'
    },
    {
      title: 'Statement of Purpose or personal statement, where applicable',
      desc: 'Program-specific personal statement outlining academic motivations, chosen subject interests, and future career objectives.'
    },
    {
      title: 'Academic or professional letters of recommendation, where required',
      desc: 'One to three formal reference letters from teachers, professors, or professional managers on official institutional letterhead.'
    },
    {
      title: 'Curriculum Vitae or resume for relevant programs',
      desc: 'Comprehensive summary of educational history, co-curricular achievements, internships, research projects, and skills.'
    },
    {
      title: 'Portfolio, research proposal, or additional course-specific documents, if required',
      desc: 'Creative portfolio for architecture/design, writing sample for humanities, or research proposal for PhD and thesis tracks.'
    },
    {
      title: 'Financial documents when required for subsequent processes',
      desc: 'Bank solvency certificate, sponsorship declaration, or approved educational loan letter for CAS, I-20, or visa processing.'
    }
  ];

  // Section 6: Interactive Application Destination Explorer Data
  const destinationData = {
    'uk': {
      name: 'United Kingdom',
      flag: '🇬🇧',
      badge: 'UCAS & Direct University Portals',
      applicationPortals: 'Centralized UCAS portal for undergraduate applications (maximum 5 course selections) | Direct university admissions portals for postgraduate and master’s programs.',
      typicalDocuments: [
        'Class 10 & 12 official marksheets / Predicted grades',
        'Academic transcripts & Bachelor’s degree (for PG)',
        'UCAS Personal Statement (4,000 characters / 47 lines)',
        'Academic Reference Letter on official school letterhead',
        'Valid Passport and English language scorecard'
      ],
      planningConsiderations: 'UK applications emphasize strong subject alignment and academic mastery in the chosen discipline. 1-Year Master’s degrees require focused preparation for rapid admissions turnaround.',
      academicLanguageReqs: 'Undergraduate: CBSE/ISC 75%–90%, A-Levels (AAA to BBC), or IB (30–36 pts). IELTS Academic 6.0 – 7.0 (or CBSE Class 12 English waiver at select universities). Postgraduate: 2:1 or 2:2 equivalence (60%–70%).',
      deadlineConsiderations: 'October 15: Oxford, Cambridge, and medicine/dentistry. Late January: Equal consideration deadline for most undergraduate UCAS courses. June 30: Final deadline for regular UCAS applications. Rolling admissions for postgraduate tracks.',
      officialLinks: [
        { label: 'UCAS Official Portal', url: 'https://www.ucas.com' },
        { label: 'Study UK (British Council)', url: 'https://study-uk.britishcouncil.org' },
        { label: 'UK Visas and Immigration (Student Visa)', url: 'https://www.gov.uk/student-visa' }
      ]
    },
    'usa': {
      name: 'United States',
      flag: '🇺🇸',
      badge: 'Common App, Coalition & Graduate Portals',
      applicationPortals: 'The Common Application and Coalition Application for undergraduate colleges | Departmental graduate admissions portals for Master’s, STEM, and MBA applications.',
      typicalDocuments: [
        'Official high school transcripts (Grades 9 through 12)',
        'Common App Personal Essay (650 words) + College Supplements',
        'Two to three Letters of Recommendation (Counselor + Teachers)',
        'English proficiency scores (TOEFL / IELTS / DET)',
        'Credential evaluation (e.g. WES) for 3-year bachelor degrees'
      ],
      planningConsiderations: 'Holistic admissions review evaluating extracurricular leadership, community impact, personal essays, and academic rigor. SAT/ACT optional at many colleges.',
      academicLanguageReqs: 'Undergraduate: Competitive unweighted GPA (3.0+ on a 4.0 scale); TOEFL 80–100+ or IELTS 6.5–7.5. Postgraduate: 4-year degree (or 3-year + evaluated credits); GRE/GMAT required for select competitive programs.',
      deadlineConsiderations: 'Early Decision (ED) & Early Action (EA): November 1 – 15. Regular Decision (RD): January 1 – 15. Priority scholarship cutoffs often align with early action windows.',
      officialLinks: [
        { label: 'Common Application Portal', url: 'https://www.commonapp.org' },
        { label: 'EducationUSA (U.S. Department of State)', url: 'https://educationusa.state.gov' },
        { label: 'Study in the States (DHS)', url: 'https://studyinthestates.dhs.gov' }
      ]
    },
    'canada': {
      name: 'Canada',
      flag: '🇨🇦',
      badge: 'OUAC & Direct Institutional Portals',
      applicationPortals: 'OUAC (Ontario Universities’ Application Centre) for Ontario universities | Direct institution portals for British Columbia, Alberta, Quebec, and Atlantic provinces.',
      typicalDocuments: [
        'Secondary school transcripts and final board certificates',
        'Official degree certificates and semester marksheets (for PG)',
        'Statement of Intent or Statement of Purpose',
        'Academic Letters of Reference',
        'Proof of English proficiency (IELTS Academic / PTE)'
      ],
      planningConsiderations: 'Provincial Attestation Letter (PAL) required under current IRCC study permit rules following university acceptance. Co-op degree options require early application.',
      academicLanguageReqs: 'Undergraduate: Minimum 70%–85% overall average in Grade 12 depending on faculty competitiveness. Postgraduate: 4-year Bachelor’s with minimum B / 3.0 GPA in the last two years. IELTS Academic 6.5 (minimum 6.0 each band).',
      deadlineConsiderations: 'January 15: Major universities (e.g., UBC, Toronto, McGill). February – March: General provincial cutoffs. Early submission recommended to secure PAL allocation.',
      officialLinks: [
        { label: 'EduCanada Official Gateway', url: 'https://www.educanada.ca' },
        { label: 'OUAC (Ontario Universities Application Centre)', url: 'https://www.ouac.on.ca' },
        { label: 'IRCC Study Permit Information', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' }
      ]
    },
    'australia': {
      name: 'Australia',
      flag: '🇦🇺',
      badge: 'Direct Admissions & State Portals',
      applicationPortals: 'Direct university online application portals for most international students | State tertiary admissions centres (e.g. UAC for NSW, VTAC for Victoria) for select cohorts.',
      typicalDocuments: [
        'Certified copies of Year 12 or Bachelor’s academic transcripts',
        'English proficiency scorecard (IELTS Academic or PTE Academic)',
        'Genuine Student (GS) statement addressing study intentions',
        'Passport scan and details of any prior visa history'
      ],
      planningConsiderations: 'Australia operates on a two-semester calendar (February and July intakes). Genuine Student (GS) assessment thoroughly evaluates course relevance and educational background.',
      academicLanguageReqs: 'Undergraduate: Australian Year 12 equivalent (ATAR equivalent benchmark or 65%–85% in national boards). Postgraduate: Recognized Bachelor’s degree with 60%–65%+. IELTS 6.5 (no band below 6.0) or PTE 58+.',
      deadlineConsiderations: 'November – December for Semester 1 (February Intake); April – May for Semester 2 (July Intake). Rolling admissions processed upon document completion.',
      officialLinks: [
        { label: 'Study Australia Official Portal', url: 'https://www.studyaustralia.gov.au' },
        { label: 'Department of Home Affairs Student Visa (Subclass 500)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' },
        { label: 'QILT University Course Comparisons', url: 'https://www.qilt.edu.au' }
      ]
    },
    'europe': {
      name: 'Europe',
      flag: '🇪🇺',
      badge: 'Uni-Assist, National Portals & Direct Submissions',
      applicationPortals: 'Uni-Assist centralized portal for many German universities | Studielink for the Netherlands | Direct university applications across Ireland, France, Switzerland, and Scandinavia.',
      typicalDocuments: [
        'Certified copies of secondary or bachelor’s academic credentials',
        'Curriculum Vitae formatted in EuroPass or academic layout',
        'Statement of Motivation detailing academic objectives',
        'APS Certificate for applicants from designated Asian regions (Germany)',
        'Language scorecard: English (IELTS) or German (TestDaF/Goethe) where relevant'
      ],
      planningConsiderations: 'European public universities emphasize strict consecutive subject credit match (ECTS requirements). English-taught bachelor’s programs are growing but have strict quotas.',
      academicLanguageReqs: 'High school diploma evaluated via Anabin/national databases (Studienkolleg required for select curricula). English programs: IELTS 6.5+. Master’s programs require close alignment of undergraduate credits.',
      deadlineConsiderations: 'July 15 for German Winter Intake (October start); January 15 for Summer Intake (April start). Dutch numerus fixus programs close January 15.',
      officialLinks: [
        { label: 'DAAD Germany International Programmes', url: 'https://www.daad.de/en/' },
        { label: 'Uni-Assist Application Gateway', url: 'https://www.uni-assist.de/en/' },
        { label: 'Studielink Netherlands Portal', url: 'https://www.studielink.nl' }
      ]
    },
    'uae': {
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      badge: 'CAA Accredited & International Branch Campuses',
      applicationPortals: 'Direct university portal applications for international branch campuses (e.g. Heriot-Watt, Birmingham, Wollongong, RIT, Curtin) and UAE national universities.',
      typicalDocuments: [
        'Official 10th and 12th grade marksheets / Bachelor’s degree certificates',
        'Valid Passport copy and UAE Emirates ID (if resident)',
        'High school certificate equivalency issued by UAE Ministry of Education (MOE)',
        'Proof of English proficiency (IELTS Academic or EmSAT English)'
      ],
      planningConsiderations: 'Global branch campuses in Dubai Knowledge Park, Dubai International Academic City, and Abu Dhabi offer identical home-country degree credentials with local accreditation.',
      academicLanguageReqs: 'Undergraduate: Minimum 70%–80% in 12th grade; EmSAT English 1400+ or IELTS 6.0. Postgraduate: Bachelor’s degree recognized by UAE Ministry with GPA 2.5 – 3.0/4.0.',
      deadlineConsiderations: 'July – August for Fall Intake (September start); November – December for Spring Intake (January start). Fast-track rolling processing available for early applicants.',
      officialLinks: [
        { label: 'UAE Ministry of Education (Higher Education)', url: 'https://www.moe.gov.ae' },
        { label: 'KHDA Dubai Higher Education Directory', url: 'https://www.khda.gov.ae' },
        { label: 'Commission for Academic Accreditation (CAA)', url: 'https://www.caa.ae' }
      ]
    }
  };

  const currentDestination = destinationData[selectedDestinationKey] || destinationData['uk'];

  const handleEnquireDestination = (destName) => {
    trackCtaClick(`Enquire Destination: ${destName}`, 'destination_explorer', 'intl-adm');
    setFormPreselectedDestination(destName);
    scrollToSection('admissions-consultation-booking');
  };

  // Section 7: Application Timeline & Deadline Planning (8 Major Stages)
  const timelineStages = [
    {
      num: 1,
      title: 'Initial Profile Review',
      fallDesc: 'Months 14–12 (Jul – Sep): Diagnostic appraisal of academic grades, prerequisite gaps, and testing strategy.',
      springDesc: 'Months 10–9 (Mar – Apr): Rapid profile audit and selection of spring-eligible programs.',
      summerDesc: 'Months 8–7 (Oct – Nov): Short-cycle eligibility assessment for immediate summer intake tracks.'
    },
    {
      num: 2,
      title: 'University and Course Shortlisting',
      fallDesc: 'Months 12–10 (Oct – Dec): Curating a 3-tier shortlist: Aspirational (Reach), Target, and Safe institutions.',
      springDesc: 'Months 8–7 (May – Jun): Selecting institutions with January/February semester enrollments.',
      summerDesc: 'Months 6–5 (Dec – Jan): Finalizing specialized summer diploma or foundation degree options.'
    },
    {
      num: 3,
      title: 'Document Preparation',
      fallDesc: 'Months 10–8 (Dec – Feb): Drafting personal statements, securing transcripts, and requesting reference letters.',
      springDesc: 'Months 7–6 (Jun – Jul): Accelerating SOP completion, transcript attestation, and reference letters.',
      summerDesc: 'Months 5–4 (Jan – Feb): Compiling verified marksheets, resumes, and test scorecards.'
    },
    {
      num: 4,
      title: 'Application Submission',
      fallDesc: 'Months 8–6 (Feb – Apr): Submitting portal applications (UCAS, Common App, direct portals) prior to deadlines.',
      springDesc: 'Months 5–4 (Aug – Sep): Submitting early spring admission applications across target portals.',
      summerDesc: 'Months 4–3 (Feb – Mar): Priority submission for summer term direct university portals.'
    },
    {
      num: 5,
      title: 'Application Follow-Up',
      fallDesc: 'Months 6–5 (Apr – May): Monitoring portal statuses, resolving document queries, and university liaison.',
      springDesc: 'Months 4–3 (Sep – Oct): Tracking expedited admissions evaluations and responding to queries.',
      summerDesc: 'Months 3–2 (Mar – Apr): Direct coordination with admissions boards for rapid review.'
    },
    {
      num: 6,
      title: 'Offer Evaluation',
      fallDesc: 'Months 5–4 (May – Jun): Analyzing conditional versus unconditional offers and scholarship allocations.',
      springDesc: 'Months 3–2 (Oct – Nov): Comparing admission offers, entry conditions, and scholarship grants.',
      summerDesc: 'Months 2–1 (Apr – May): Reviewing offer letters and confirming enrollment deposits.'
    },
    {
      num: 7,
      title: 'Condition Clearing and Required Institutional Documentation',
      fallDesc: 'Months 4–2 (Jun – Jul): Fulfilling academic conditions, paying tuition deposits, and obtaining CAS or I-20.',
      springDesc: 'Months 2–1 (Nov – Dec): Fulfilling document conditions and securing official CAS / Form I-20.',
      summerDesc: 'Month 1 (May): Finalizing tuition deposits and obtaining enrollment confirmations.'
    },
    {
      num: 8,
      title: 'Visa Preparation and Pre-Departure',
      fallDesc: 'Months 2–1 (Jul – Aug): Compiling visa checklists, booking biometrics, housing, and pre-departure briefings.',
      springDesc: 'Month 1 (Dec – Jan): Visa stamping, accommodation coordination, flight bookings, and travel briefings.',
      summerDesc: 'Immediate (May – Jun): Fast-track visa filing, health insurance clearance, and travel arrangement.'
    }
  ];

  // Section 9: Frequently Asked Questions (7 exact questions specified)
  const faqs = [
    {
      q: 'Which countries can I apply to through your admissions support?',
      a: 'We provide guidance for applications to universities in destinations such as the UK, USA, Canada, Australia, Europe, and the UAE, depending on the student’s goals and institutional requirements.'
    },
    {
      q: 'Can I apply to multiple universities at the same time?',
      a: 'This depends on the application system, destination, course, and institution. We can help organize application choices and their respective requirements.'
    },
    {
      q: 'Which documents are needed for international admissions?',
      a: 'Requirements vary by institution and program. Common documents include academic records, identification, language test results where required, and additional course-specific materials.'
    },
    {
      q: 'Can you guarantee admission to a university?',
      a: 'No. Admission decisions are made by the respective universities and depend on their eligibility criteria and selection processes.'
    },
    {
      q: 'Do you provide visa assistance after admission?',
      a: 'We can help organize document checklists and explain general next steps. Applicants must follow the latest official immigration requirements for their destination.'
    },
    {
      q: 'What happens if my offer has conditions?',
      a: 'We can help you understand the stated conditions, organize the required documents, and identify the next steps communicated by the institution.'
    },
    {
      q: 'How do I book a consultation?',
      a: 'Visitors can complete the consultation form and select their preferred contact method. The enquiry should be sent to the existing backend and CRM.'
    }
  ];

  // Section 10: Related Services
  const relatedServices = [
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Strategy',
      desc: 'Strategic destination comparison, academic profile diagnostics, and long-term education roadmap planning.',
      path: 'international-consulting'
    },
    {
      id: 'college-adm',
      title: 'College Admissions Assistance',
      badge: 'Undergraduate',
      desc: 'End-to-end guidance for undergraduate college admissions and local campus branches across the GCC.',
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
      title: 'Seminars & Language',
      badge: 'Executive & Language',
      desc: 'Executive development seminars and structured preparation for IELTS, OET, DET, and TOEFL.',
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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-24 text-slate-800 dark:text-slate-200">
      <EducationSEO
        title="International Admissions | Global University Applications & Compliance"
        description="From navigating UCAS in the UK and Common App in the United States to managing direct university applications in Canada, Europe, and Australia, The Revival International supports students throughout the international admissions process."
        canonicalPath="education/international-admissions"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: 'International Admissions', item: '/education/international-admissions' }
        ]}
        structuredData={structuredData}
      />

      {/* Sticky Breadcrumb Navigation Bar */}
      <div className="bg-white/80 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-800 backdrop-blur-sm sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => navigateTo('home')}
              className="hover:text-gold-500 transition focus:outline-none focus:text-gold-500 cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button 
              onClick={() => navigateTo('education')}
              className="hover:text-gold-500 transition focus:outline-none focus:text-gold-500 cursor-pointer"
            >
              Academic Advisory
            </button>
            <span>/</span>
            <span className="text-gold-600 dark:text-gold-400 font-bold truncate max-w-[200px] sm:max-w-none">
              International Admissions
            </span>
          </nav>

          <button
            onClick={() => navigateTo('education')}
            className="hidden sm:flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 hover:text-gold-500 font-bold text-xs transition shrink-0 ml-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Education Services</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">

        {/* ========================================================================= */}
        {/* SECTION 1: HERO SECTION — INTERNATIONAL ADMISSIONS                        */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle, Description, and CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                    University Placement
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                    Verified Service • Admissions
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                  International Admissions
                </h1>

                <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                  End-to-End Global University Applications, Compliance & Admission Guidance
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  From navigating UCAS in the UK and Common App in the United States to managing direct university applications in Canada, Europe, and Australia, The Revival International supports students throughout the international admissions process. Our team helps coordinate applications, prepare academic documents, monitor deadlines, and organize admission requirements with attention to accuracy and compliance.
                </p>

                {/* Two CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                  <button
                    onClick={() => {
                      trackCtaClick('Book Free Consultation', 'hero_section', 'intl-adm');
                      scrollToSection('admissions-consultation-booking');
                    }}
                    className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Free Consultation</span>
                  </button>

                  <button
                    onClick={() => {
                      trackCtaClick('Explore Admissions Process', 'hero_section', 'intl-adm');
                      scrollToSection('admissions-process-section');
                    }}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-gold-500" />
                    <span>Explore Admissions Process ↓</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Visual of International Admissions */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
                  <img
                    src="/images/international_admissions.jpg"
                    alt="International Students Reviewing University Application Portfolios"
                    className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                        <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-gold-500" />
                          Global Admissions Coordination
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                          Active Intakes
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 font-medium leading-snug">
                        Multi-country application portal management with verified document compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Four Information Blocks below Hero */}
            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {heroInfoBlocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400">
                      <Icon className="w-4 h-4" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{block.label}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white leading-snug">{block.value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{block.subtext}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 2: KEY BENEFITS & SERVICE HIGHLIGHTS (4 CARDS)                    */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Admissions Advantages
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Key Benefits & Service Highlights
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                How our admissions coordinators ensure application precision, document verification, and proactive admissions office communication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={benefit.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-navy-950 px-2.5 py-1 rounded-md">
                          {benefit.id}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                        {benefit.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {benefit.desc}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Key Deliverables:
                        </p>
                        <ul className="space-y-1.5">
                          {benefit.highlights.map((item, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 3: INTERNATIONAL ADMISSIONS PROCESS                               */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="admissions-process-section" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Execution Framework
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                International Admissions Process
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A structured four-step methodology guiding applicants through application planning, portal execution, condition clearing, and pre-departure coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {admissionsProcessSteps.map((step) => (
                <div 
                  key={step.step}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 relative hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <span className="w-8 h-8 rounded-full bg-gold-500 text-navy-950 font-extrabold text-xs flex items-center justify-center shadow-gold-glow">
                      {step.step}
                    </span>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      Step {step.step} — {step.title.replace(/^Step \d+ — /, '')}
                    </h3>
                    
                    <ul className="space-y-1.5 pt-1">
                      {step.points.map((pt, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-t border-slate-100 dark:border-navy-800">
                    Stage {step.step} of 04
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance & Regulatory Notice */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-wider text-[11px]">Admissions & Compliance Notice</p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  The Revival International provides professional application coordination, document verification guidance, and portal management. We do not promise or guarantee university admission, Confirmation of Acceptance for Studies (CAS), Form I-20 issuance, visa approvals, or any immigration outcome. Final admissions decisions rest solely with respective university admissions committees, and visa issuance remains under the sovereign legal jurisdiction of destination immigration authorities.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 4: INTENDED AUDIENCE & ELIGIBILITY                                */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Target Applicants
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Who Can Benefit from Our Admissions Support?
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Tailored application management tracks adapted to secondary graduates, postgraduate aspirants, and complex multi-destination applicants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {targetAudienceCards.map((aud, idx) => {
                const Icon = aud.icon;
                return (
                  <div
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-3 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full uppercase">
                          {aud.badge}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                        {aud.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {aud.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                      <button
                        onClick={() => scrollToSection('admissions-consultation-booking')}
                        className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Admissions Call</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">Institutional Variance Notice: </span>
              <span>
                Please note that eligibility, academic qualifications, language scores, and document requirements vary by institution, specific course, and destination country. Our advisors evaluate each student’s background against the latest verified requirements of their chosen universities.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 5: INTERNATIONAL ADMISSIONS DOCUMENT CHECKLIST                    */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-glass">
            <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 pb-2 border-b border-slate-100 dark:border-navy-800">
              <FileCheck className="w-6 h-6" />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  International Admissions Document Checklist
                </h2>
                <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">
                  Documents to Prepare for Application Portals
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Prepare the following verified credentials to ensure smooth application processing and prevent delays during portal verification:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentChecklist.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                    <span className="text-slate-900 dark:text-white font-bold leading-snug">{doc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">Note: </span>
              <span>
                The final document checklist depends on the selected institution, program, country, and application stage. We do not require every document for every applicant. Your assigned admissions counselor will furnish a customized document checklist tailored to your specific application shortlist.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 6: INTERACTIVE APPLICATION DESTINATION EXPLORER                   */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="admissions-destination-explorer" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Destination Systems
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Interactive Application Destination Explorer
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Explore common application portals, document standards, planning considerations, academic and language requirements, and official portals across major study destinations.
              </p>
            </div>

            {/* Destination Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-4xl mx-auto">
              {[
                { key: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
                { key: 'usa', label: 'United States', flag: '🇺🇸' },
                { key: 'canada', label: 'Canada', flag: '🇨🇦' },
                { key: 'australia', label: 'Australia', flag: '🇦🇺' },
                { key: 'europe', label: 'Europe', flag: '🇪🇺' },
                { key: 'uae', label: 'United Arab Emirates', flag: '🇦🇪' }
              ].map(dest => (
                <button
                  key={dest.key}
                  onClick={() => setSelectedDestinationKey(dest.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    selectedDestinationKey === dest.key
                      ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-navy-900/50'
                  }`}
                >
                  <span className="text-sm">{dest.flag}</span>
                  <span>{dest.label}</span>
                </button>
              ))}
            </div>

            {/* Destination Details Card */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-luxury transition-all duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentDestination.flag}</span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                      {currentDestination.name}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-gold-600 dark:text-gold-400">
                    {currentDestination.badge}
                  </p>
                </div>

                <button
                  onClick={() => handleEnquireDestination(currentDestination.name)}
                  className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire About Admissions in {currentDestination.name}</span>
                </button>
              </div>

              {/* 2-Column Responsive Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column 1: Application Methods & Typical Documents */}
                <div className="space-y-6">
                  {/* Common Application Methods or Portals */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gold-500" />
                      <span>Common Application Methods & Portals</span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {currentDestination.applicationPortals}
                    </p>
                  </div>

                  {/* Typical Admission Document Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-gold-500" />
                      <span>Typical Admission Document Requirements</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDestination.typicalDocuments.map((doc, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* General Application Planning Considerations */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-gold-500" />
                      <span>General Planning Considerations</span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {currentDestination.planningConsiderations}
                    </p>
                  </div>
                </div>

                {/* Column 2: Academic/Language Reqs, Deadlines & Official Links */}
                <div className="space-y-6">
                  {/* Relevant Academic and Language Requirements */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-gold-500" />
                      <span>Relevant Academic & Language Benchmarks</span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {currentDestination.academicLanguageReqs}
                    </p>
                  </div>

                  {/* Important Deadline Considerations */}
                  <div className="space-y-2">
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-500" />
                      <span>Important Deadline Considerations</span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {currentDestination.deadlineConsiderations}
                    </p>
                  </div>

                  {/* Official University or Application Portal Links */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                    <h4 className="font-serif text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Official University & Portal Resources
                    </h4>
                    <div className="space-y-2">
                      {currentDestination.officialLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-gold-500/10 dark:hover:bg-gold-500/10 border border-slate-200 dark:border-navy-700 text-xs font-bold text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 flex items-center justify-between transition group"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-500 transition" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Card Action */}
              <div className="pt-6 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  Requirements differ between universities. Where details differ between programs, our team provides tailored guidelines.
                </p>
                <button
                  onClick={() => handleEnquireDestination(currentDestination.name)}
                  className="w-full sm:w-auto px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire About Admissions in {currentDestination.name}</span>
                </button>
              </div>

            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 7: APPLICATION TIMELINE & DEADLINE PLANNING                       */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Planning Roadmap
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Application Timeline & Deadline Planning
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A visual timeline detailing the 8 major stages from initial profile review to visa coordination. Select an intended intake to view targeted milestone windows.
              </p>
            </div>

            {/* Intake Selector Toggle */}
            <div className="flex justify-center gap-2 p-1.5 bg-slate-100 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-md mx-auto">
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
                      ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  {intake.label}
                </button>
              ))}
            </div>

            {/* 8-Stage Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {timelineStages.map((stage) => {
                let stageText = stage.fallDesc;
                if (selectedIntakeTimeline === 'spring') stageText = stage.springDesc;
                if (selectedIntakeTimeline === 'summer') stageText = stage.summerDesc;

                return (
                  <div
                    key={stage.num}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-2.5 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="w-7 h-7 rounded-full bg-gold-500 text-navy-950 font-black text-xs flex items-center justify-center shadow-gold-glow">
                          0{stage.num}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                          Stage {stage.num} of 8
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white leading-snug">
                        {stage.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {stageText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-400 text-center">
              <span className="font-bold text-slate-800 dark:text-slate-200">Planning Period Notice: </span>
              <span>
                Universal cutoffs do not exist across all universities. General planning periods displayed above are realistic estimates. Specific institutional deadlines are communicated upon shortlisting.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 8: INTERNATIONAL ADMISSIONS CONSULTATION FORM                     */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="admissions-consultation-booking" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 space-y-6 shadow-luxury scroll-mt-24">
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
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 9: FREQUENTLY ASKED QUESTIONS                                     */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Common Questions
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    aria-expanded={openFaqIndex === idx}
                    className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:text-gold-500 transition focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-gold-500 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-100 dark:border-navy-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 10: RELATED ACADEMIC ADVISORY SERVICES                            */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 dark:text-gold-400">
                  Comprehensive Academic Portfolio
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Related Academic Advisory Services
                </h3>
              </div>
              <button
                onClick={() => navigateTo('education')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {relatedServices.map((rel) => (
                <div
                  key={rel.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-3 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {rel.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">#{rel.id}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-navy-900 dark:text-white leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {rel.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                    <button
                      onClick={() => navigateTo(rel.path)}
                      className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
};
